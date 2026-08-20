import { supabase, isCloudEnabled } from "./supabase";

const LOCAL_CLOCK_KEY = "jlptSprintDeskLastSync";
const PREFIX = "jlptSprintDesk";

export type CloudData = Record<string, string>;

export function collectLocalData(): CloudData {
  const out: CloudData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX) && key !== LOCAL_CLOCK_KEY) {
      out[key] = localStorage.getItem(key) || "";
    }
  }
  return out;
}

export function applyCloudData(data: CloudData): void {
  const stale: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX) && key !== LOCAL_CLOCK_KEY) stale.push(key);
  }
  stale.forEach((k) => localStorage.removeItem(k));
  Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
}

function getLocalClock(): number {
  return Number(localStorage.getItem(LOCAL_CLOCK_KEY) || 0);
}

function setLocalClock(ts: number): void {
  localStorage.setItem(LOCAL_CLOCK_KEY, String(ts));
}

export function markLocalModified(): void {
  setLocalClock(Date.now());
}

export async function sendMagicLink(email: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: "云同步未启用" };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  });
  return { error: error?.message || null };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentEmail(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.email || null;
}

type PullResult = { data: CloudData | null; updatedAt: number };

async function pullCloud(): Promise<PullResult> {
  if (!supabase) return { data: null, updatedAt: 0 };
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) return { data: null, updatedAt: 0 };
  const { data, error } = await supabase
    .from("user_data")
    .select("data, updated_at")
    .eq("user_id", uid)
    .maybeSingle();
  if (error || !data) return { data: null, updatedAt: 0 };
  return { data: data.data as CloudData, updatedAt: new Date(data.updated_at).getTime() };
}

export async function pushCloud(): Promise<{ error: string | null }> {
  if (!supabase) return { error: "云同步未启用" };
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) return { error: "未登录" };
  const now = Date.now();
  const { error } = await supabase.from("user_data").upsert({
    user_id: uid,
    data: collectLocalData(),
    updated_at: new Date(now).toISOString(),
  });
  if (error) return { error: error.message };
  setLocalClock(now);
  return { error: null };
}

export type SyncOutcome = "pulled" | "pushed" | "in-sync" | "conflict" | "disabled" | "error";

export interface DataSummary {
  records: number;
  hasPlan: boolean;
  profiles: number;
}

function sameData(a: CloudData, b: CloudData): boolean {
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  if (ka.length !== kb.length) return false;
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i] || a[ka[i]] !== b[kb[i]]) return false;
  }
  return true;
}

function isMeaningful(data: CloudData): boolean {
  return Object.entries(data).some(([k, v]) => {
    if (k.endsWith(":records")) {
      try { return Array.isArray(JSON.parse(v)) && JSON.parse(v).length > 0; } catch { return false; }
    }
    if (k.endsWith(":generatedPlan")) return !!v && v !== "null";
    return false;
  });
}

export function summarizeData(data: CloudData): DataSummary {
  let records = 0;
  let hasPlan = false;
  let profiles = 0;
  for (const [k, v] of Object.entries(data)) {
    if (k.endsWith(":records")) {
      try { records += JSON.parse(v).length; } catch { /* ignore */ }
    } else if (k.endsWith(":generatedPlan")) {
      if (v && v !== "null") hasPlan = true;
    } else if (k === `${PREFIX}Profiles`) {
      try { profiles = JSON.parse(v).length; } catch { /* ignore */ }
    }
  }
  return { records, hasPlan, profiles };
}

let pendingConflict: { data: CloudData; updatedAt: number } | null = null;

export async function reconcileOnSignIn(): Promise<SyncOutcome> {
  if (!isCloudEnabled()) return "disabled";
  try {
    const { data: cloud, updatedAt } = await pullCloud();

    if (!cloud) {
      const { error } = await pushCloud();
      return error ? "error" : "pushed";
    }

    const local = collectLocalData();
    if (sameData(local, cloud)) {
      setLocalClock(Math.max(updatedAt, getLocalClock()));
      return "in-sync";
    }

    const localHasData = isMeaningful(local);
    const cloudHasData = isMeaningful(cloud);

    if (!localHasData) {
      applyCloudData(cloud);
      setLocalClock(updatedAt);
      return "pulled";
    }
    if (!cloudHasData) {
      const { error } = await pushCloud();
      return error ? "error" : "pushed";
    }

    pendingConflict = { data: cloud, updatedAt };
    return "conflict";
  } catch {
    return "error";
  }
}

export function getPendingConflict(): { local: DataSummary; cloud: DataSummary } | null {
  if (!pendingConflict) return null;
  return { local: summarizeData(collectLocalData()), cloud: summarizeData(pendingConflict.data) };
}

export async function resolveConflict(choice: "local" | "cloud"): Promise<SyncOutcome> {
  const pending = pendingConflict;
  pendingConflict = null;
  if (!pending) return "error";
  if (choice === "cloud") {
    applyCloudData(pending.data);
    setLocalClock(pending.updatedAt);
    return "pulled";
  }
  const { error } = await pushCloud();
  return error ? "error" : "pushed";
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

export function schedulePush(): void {
  markLocalModified();
  if (!isCloudEnabled()) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    pushCloud().catch(() => {});
  }, 1500);
}
