import { supabase, isCloudEnabled } from "./supabase";

// Local data "clock": a monotonically-meaningful timestamp of the local app
// data. It is bumped on every local write (markLocalModified), and aligned to
// the synced version after a successful push/pull. It is intentionally NOT
// cleared on sign-out, so that edits made while signed out still count as
// "newer than cloud" on the next sign-in (prevents the cloud from silently
// overwriting local changes). Compared against cloud.updated_at in reconcile.
const LOCAL_CLOCK_KEY = "jlptSprintDeskLastSync";
const PREFIX = "jlptSprintDesk";

export type CloudData = Record<string, string>;

/** Gather every app-owned localStorage key into a plain object. */
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

/** Overwrite localStorage with a cloud snapshot (does not touch unrelated keys). */
export function applyCloudData(data: CloudData): void {
  // Remove existing app keys first so deletions on another device propagate.
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

/** Bump the local clock on every local write (called from the store's commit). */
export function markLocalModified(): void {
  setLocalClock(Date.now());
}

// ── Auth ────────────────────────────────────────────────────────────────

export async function sendMagicLink(email: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: "云同步未启用" };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    // origin + pathname preserves a non-root deploy base (e.g. GitHub Pages
    // subpath); the hash route is irrelevant to the magic-link redirect target.
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  });
  return { error: error?.message || null };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
  // Intentionally keep LOCAL_CLOCK_KEY: edits made while signed out must still
  // count as newer than cloud on the next sign-in, so we don't overwrite them.
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
  // Local is now in sync with cloud at `now`.
  setLocalClock(now);
  return { error: null };
}

export type SyncOutcome = "pulled" | "pushed" | "in-sync" | "conflict" | "disabled" | "error";

export interface DataSummary {
  records: number;
  hasPlan: boolean;
  profiles: number;
}

/** Order-independent equality of two app-data snapshots. */
function sameData(a: CloudData, b: CloudData): boolean {
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  if (ka.length !== kb.length) return false;
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i] || a[ka[i]] !== b[kb[i]]) return false;
  }
  return true;
}

/** A snapshot is "meaningful" if it holds any records or a generated plan. */
function isMeaningful(data: CloudData): boolean {
  return Object.entries(data).some(([k, v]) => {
    if (k.endsWith(":records")) {
      try { return Array.isArray(JSON.parse(v)) && JSON.parse(v).length > 0; } catch { return false; }
    }
    if (k.endsWith(":generatedPlan")) return !!v && v !== "null";
    return false;
  });
}

/** Human-facing summary used by the conflict prompt. */
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

// Holds the cloud snapshot while the user decides which side to keep.
let pendingConflict: { data: CloudData; updatedAt: number } | null = null;

/**
 * Reconcile local and cloud on sign-in:
 * - Cloud empty / local empty / identical → auto-resolve (push, pull, or align).
 * - Both sides hold meaningful data AND differ → "conflict": do NOT overwrite
 *   silently; stash the cloud snapshot and let the user choose (resolveConflict).
 *
 * The local clock (bumped on every write, persisted across sign-out) still tells
 * us which side is newer for the non-conflicting cases.
 */
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
      // Already identical — just align the clock, no write needed.
      setLocalClock(Math.max(updatedAt, getLocalClock()));
      return "in-sync";
    }

    const localHasData = isMeaningful(local);
    const cloudHasData = isMeaningful(cloud);

    // One side is effectively empty → safe to auto-resolve without asking.
    if (!localHasData) {
      applyCloudData(cloud);
      setLocalClock(updatedAt);
      return "pulled";
    }
    if (!cloudHasData) {
      const { error } = await pushCloud();
      return error ? "error" : "pushed";
    }

    // Both sides have real, divergent data → ask the user (no silent overwrite).
    pendingConflict = { data: cloud, updatedAt };
    return "conflict";
  } catch {
    return "error";
  }
}

/** Summaries of the two sides of a pending conflict (null when none). */
export function getPendingConflict(): { local: DataSummary; cloud: DataSummary } | null {
  if (!pendingConflict) return null;
  return { local: summarizeData(collectLocalData()), cloud: summarizeData(pendingConflict.data) };
}

/** Resolve a pending conflict: keep this device (push) or use cloud (pull). */
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

// Debounced background push triggered after local writes.
let pushTimer: ReturnType<typeof setTimeout> | null = null;

export function schedulePush(): void {
  // Always record that local data changed — even when cloud sync is disabled —
  // so the local clock is meaningful if the user enables sync later.
  markLocalModified();
  if (!isCloudEnabled()) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    // Re-stamp the clock to the push time inside pushCloud so it aligns with the
    // cloud's updated_at (avoids an unnecessary pull on the next sign-in).
    pushCloud().catch(() => {});
  }, 1500);
}
