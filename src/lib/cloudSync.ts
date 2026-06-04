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

export type SyncOutcome = "pulled" | "pushed" | "in-sync" | "disabled" | "error";

/**
 * Reconcile local and cloud on sign-in, comparing the cloud's updated_at to the
 * LOCAL CLOCK (bumped on every local write, persisted across sign-out):
 * - Cloud empty                 → push local up (first device).
 * - Cloud newer than local edits → pull down, caller should reload to apply.
 * - Local newer/equal            → push local up (local edits win).
 *
 * Because the local clock survives sign-out, edits made while signed out are
 * "newer than cloud" and won't be silently overwritten on re-login.
 */
export async function reconcileOnSignIn(): Promise<SyncOutcome> {
  if (!isCloudEnabled()) return "disabled";
  try {
    const { data: cloud, updatedAt } = await pullCloud();
    const localClock = getLocalClock();

    if (!cloud) {
      const { error } = await pushCloud();
      return error ? "error" : "pushed";
    }
    // Cloud is newer than our local data → adopt it.
    if (updatedAt > localClock) {
      applyCloudData(cloud);
      setLocalClock(updatedAt);
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
