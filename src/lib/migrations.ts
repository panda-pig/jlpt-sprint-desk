// Schema migration runner.
//
// localStorage data has no implicit version, so a future change to the stored
// shape (records / settings / plan) would silently break existing users. This
// stamps a version and runs ordered, in-place upgrades when the app boots —
// BEFORE any data is read. There are no migrations yet; this is the safety net
// so the next structural change can be applied instead of breaking old data.

const SCHEMA_VERSION_KEY = "jlptSprintDeskSchemaVersion";

/** Bump this when the stored data shape changes, and add a MIGRATIONS entry. */
export const CURRENT_SCHEMA_VERSION = 2;

export type Migration = () => void;

/**
 * Ordered upgrades keyed by the version they PRODUCE (e.g. `3` upgrades v2 → v3).
 * Each must tolerate partial/legacy data and be safe to abort. Example shape:
 *   3: () => { for every records key, add a missing field, writeJSON back; }
 */
export const MIGRATIONS: Record<number, Migration> = {};

function readStoredVersion(currentVersion: number): number {
  try {
    const raw = localStorage.getItem(SCHEMA_VERSION_KEY);
    // No stamp yet → existing data is the currently-shipped shape (and a fresh
    // install is too), so treat it as current and don't run any migration.
    if (raw == null) return currentVersion;
    const n = Number(raw);
    return Number.isFinite(n) ? n : currentVersion;
  } catch {
    return currentVersion;
  }
}

/**
 * Run any pending migrations and stamp the schema version. Params are injectable
 * for testing; production calls it with the defaults.
 */
export function runMigrations(
  migrations: Record<number, Migration> = MIGRATIONS,
  currentVersion: number = CURRENT_SCHEMA_VERSION,
): void {
  let from = readStoredVersion(currentVersion);
  if (from < currentVersion) {
    for (let v = from + 1; v <= currentVersion; v += 1) {
      try {
        migrations[v]?.();
      } catch {
        // A failed migration must not brick the app — stop, keep progress, retry
        // next boot from the last good version.
        break;
      }
      from = v;
    }
  }
  try {
    localStorage.setItem(SCHEMA_VERSION_KEY, String(from));
  } catch {
    /* ignore */
  }
}
