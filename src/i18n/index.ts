import { zh } from "./zh";
import { en } from "./en";

export type Locale = "zh" | "en";
export type Dict = { [key: string]: string | Dict };

const DICTS: Record<Locale, Dict> = { zh: zh as Dict, en: en as Dict };
const LOCALE_KEY = "jlptSprintDeskLocale";

let listeners: Array<() => void> = [];
let currentLocale: Locale = detectInitialLocale();

function detectInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "zh";
  return nav.startsWith("zh") ? "zh" : "en";
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  if (locale === currentLocale) return;
  currentLocale = locale;
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}

export function subscribeLocale(fn: () => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

/** Resolve a dotted key path against the active dictionary, with {param} interpolation. */
export function t(key: string, params?: Record<string, string | number>): string {
  const dict = DICTS[currentLocale];
  const fallback = DICTS.zh;
  const resolve = (d: unknown): string | undefined => {
    const parts = key.split(".");
    let node: unknown = d;
    for (const p of parts) {
      if (node && typeof node === "object" && p in (node as Record<string, unknown>)) {
        node = (node as Record<string, unknown>)[p];
      } else {
        return undefined;
      }
    }
    return typeof node === "string" ? node : undefined;
  };
  let str = resolve(dict) ?? resolve(fallback) ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}

/**
 * Translate an option label by (group, value) without splitting the value on
 * dots — needed for values like "0.3" that would otherwise break dotted-key
 * resolution.
 */
export function tOption(group: string, value: string): string {
  const lookup = (d: Dict): string | undefined => {
    const opts = d.options;
    if (opts && typeof opts === "object") {
      const g = (opts as Dict)[group];
      if (g && typeof g === "object") {
        const v = (g as Dict)[value];
        if (typeof v === "string") return v;
      }
    }
    return undefined;
  };
  return lookup(DICTS[currentLocale]) ?? lookup(DICTS.zh) ?? value;
}
