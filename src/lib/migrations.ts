const SCHEMA_VERSION_KEY = "jlptSprintDeskSchemaVersion";

export const CURRENT_SCHEMA_VERSION = 2;

export type Migration = () => void;

export const MIGRATIONS: Record<number, Migration> = {};

function readStoredVersion(currentVersion: number): number {
  try {
    const raw = localStorage.getItem(SCHEMA_VERSION_KEY);
    if (raw == null) return currentVersion;
    const n = Number(raw);
    return Number.isFinite(n) ? n : currentVersion;
  } catch {
    return currentVersion;
  }
}

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
        break;
      }
      from = v;
    }
  }
  try {
    localStorage.setItem(SCHEMA_VERSION_KEY, String(from));
  } catch { /* ignore */ }
}
