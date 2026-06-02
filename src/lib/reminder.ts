// Daily study reminder.
//
// Constraint: this is a static PWA with no push backend, so true scheduled
// background push isn't available. We do the two things that work reliably:
//   1. An in-app nudge banner (no permission needed).
//   2. An optional browser notification fired while the app is open, once per
//      day, after the user's chosen time, if today isn't recorded yet.

const SETTINGS_KEY = "jlptSprintDeskReminder";
const LAST_NOTIFIED_KEY = "jlptSprintDeskReminderLast";

export interface ReminderSettings {
  enabled: boolean;
  time: string; // "HH:MM"
}

const DEFAULTS: ReminderSettings = { enabled: false, time: "20:00" };

export function getReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      enabled: Boolean(parsed.enabled),
      time: typeof parsed.time === "string" && /^\d{2}:\d{2}$/.test(parsed.time) ? parsed.time : DEFAULTS.time,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function setReminderSettings(next: ReminderSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function isPastReminderTime(time: string): boolean {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
}

/**
 * Fire a browser notification at most once/day if conditions are met.
 * Safe to call repeatedly (on load, on visibility change).
 */
export function maybeNotify(todayRecorded: boolean): void {
  if (todayRecorded) return;
  const settings = getReminderSettings();
  if (!settings.enabled) return;
  if (notificationPermission() !== "granted") return;
  if (!isPastReminderTime(settings.time)) return;
  if (localStorage.getItem(LAST_NOTIFIED_KEY) === todayKey()) return;

  try {
    const n = new Notification("JLPT Sprint Desk", {
      body: "今天还没有学习记录，花 2 分钟记录一下今天的进度吧。",
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: "jlpt-daily-reminder",
    });
    n.onclick = () => {
      window.focus();
      window.location.hash = "#/record";
      n.close();
    };
    localStorage.setItem(LAST_NOTIFIED_KEY, todayKey());
  } catch {
    // Notification construction can throw on some platforms; ignore.
  }
}
