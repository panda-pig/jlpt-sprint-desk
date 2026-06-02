import { supabase, isCloudEnabled } from "./supabase";

// Local marker for the last successful cloud sync timestamp (cloud updated_at).
const LAST_SYNC_KEY = "jlptSprintDeskLastSync";
const PREFIX = "jlptSprintDesk";

export type CloudData = Record<string, string>;

/** Gather every app-owned localStorage key into a plain object. */
export function collectLocalData(): CloudData {
  const out: CloudData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX) && key !== LAST_SYNC_KEY) {
      out[key] = localStorage.getItem(key) || "";
    }
  }
  return out;
}

/** Overwrite localStorage with a cloud snapshot (does not touch unrelated keys). */
export function applyCloudData(data: CloudData): void {
  // Remove existing app keys first so deletions on another device propagate.
  const stale: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX) && key !== LAST_SYNC_KEY) stale.push(key);
  }
  stale.forEach((k) => localStorage.removeItem(k));
  Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
}

export function getLastSync(): number {
  return Number(localStorage.getItem(LAST_SYNC_KEY) || 0);
}

function setLastSync(ts: number): void {
  localStorage.setItem(LAST_SYNC_KEY, String(ts));
}

// ── Auth ────────────────────────────────────────────────────────────────

export async function sendMagicLink(email: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: "云同步未启用" };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  return { error: error?.message || null };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
  localStorage.removeItem(LAST_SYNC_KEY);
}

export async function getCurrentEmail(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.email || null;
}

// ── Sync ────────────────────────────────────────────────────────────────

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

/** Push current local data to the cloud, stamping a fresh updated_at. */
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
  setLastSync(now);
  return { error: null };
}

export type SyncOutcome = "pulled" | "pushed" | "in-sync" | "disabled" | "error";

/**
 * Reconcile local and cloud on sign-in.
 * - Cloud empty       → push local up (first device).
 * - Cloud newer       → pull down, caller should reload to apply.
 * - Local newer/equal → push local up.
 */
export async function reconcileOnSignIn(): Promise<SyncOutcome> {
  if (!isCloudEnabled()) return "disabled";
  try {
    const { data: cloud, updatedAt } = await pullCloud();
    const lastSync = getLastSync();

    if (!cloud) {
      const { error } = await pushCloud();
      return error ? "error" : "pushed";
    }
    // Cloud has data newer than what we last synced → adopt it.
    if (updatedAt > lastSync) {
      applyCloudData(cloud);
      setLastSync(updatedAt);
      return "pulled";
    }
    // Local is up to date or ahead → push.
    const { error } = await pushCloud();
    return error ? "error" : "pushed";
  } catch {
    return "error";
  }
}

// Debounced background push triggered after local writes.
let pushTimer: ReturnType<typeof setTimeout> | null = null;

export function schedulePush(): void {
  if (!isCloudEnabled()) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    pushCloud().catch(() => {});
  }, 1500);
}
