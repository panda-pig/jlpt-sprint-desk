import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, PenLine, X } from "lucide-react";
import { useStudyDesk } from "../lib/studyDeskContext";
import {
  getReminderSettings,
  setReminderSettings,
  requestNotificationPermission,
  notificationPermission,
  notificationsSupported,
  maybeNotify,
  type ReminderSettings,
} from "../lib/reminder";
import { toast } from "../lib/toast";

/** Invisible app-level effect: fire the daily browser notification when due. */
export function ReminderNotifier() {
  const { todayRecord } = useStudyDesk();

  useEffect(() => {
    const recorded = !!todayRecord;
    maybeNotify(recorded);
    const onVisible = () => {
      if (document.visibilityState === "visible") maybeNotify(recorded);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [todayRecord]);

  return null;
}

/** Dashboard nudge banner — no permission required, shown when today isn't recorded. */
export function ReminderBanner() {
  const navigate = useNavigate();
  const { todayRecord, state } = useStudyDesk();
  const [dismissed, setDismissed] = useState(false);

  // Only nudge active users (have a plan or past records); skip brand-new users.
  const isActive = !!state.generatedPlan || state.records.length > 0;
  if (todayRecord || dismissed || !isActive) return null;

  return (
    <div className="reminder-banner">
      <span className="reminder-banner-icon"><PenLine size={18} /></span>
      <div className="reminder-banner-text">
        <strong>今天还没有学习记录</strong>
        <span>花 2 分钟记录今天的进度，保持复盘闭环。</span>
      </div>
      <div className="reminder-banner-actions">
        <button className="primary-button" type="button" onClick={() => navigate("/record")}>
          去记录
        </button>
        <button className="reminder-banner-close" type="button" aria-label="关闭" onClick={() => setDismissed(true)}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

/** Setup-page card: enable daily reminder + pick time + grant notification permission. */
export function ReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettings>(() => getReminderSettings());
  const [perm, setPerm] = useState(() => notificationPermission());

  const persist = useCallback((next: ReminderSettings) => {
    setSettings(next);
    setReminderSettings(next);
  }, []);

  const handleToggle = useCallback(async () => {
    const next = { ...settings, enabled: !settings.enabled };
    if (next.enabled && notificationsSupported() && Notification.permission !== "granted") {
      const result = await requestNotificationPermission();
      setPerm(result);
      if (result !== "granted") {
        toast("已开启应用内提醒；浏览器通知需要授权后才会弹出。");
      }
    }
    persist(next);
  }, [settings, persist]);

  const handleTime = useCallback((time: string) => {
    persist({ ...settings, time });
  }, [settings, persist]);

  return (
    <section className="panel reminder-settings-panel">
      <div className="section-head compact">
        <div className="reminder-settings-head">
          <span className="reminder-settings-icon">
            {settings.enabled ? <Bell size={20} /> : <BellOff size={20} />}
          </span>
          <div>
            <h2>每日提醒</h2>
            <p>设定提醒时间，当天还没记录时会在打开应用时提示你。</p>
          </div>
        </div>
        <label className="reminder-switch">
          <input type="checkbox" checked={settings.enabled} onChange={handleToggle} />
          <span className="reminder-switch-track"><span className="reminder-switch-thumb" /></span>
        </label>
      </div>

      {settings.enabled && (
        <div className="reminder-settings-body">
          <div className="reminder-time-field">
            <label htmlFor="reminderTime">提醒时间</label>
            <input
              id="reminderTime"
              type="time"
              value={settings.time}
              onChange={(e) => handleTime(e.target.value)}
            />
          </div>
          {notificationsSupported() ? (
            perm === "granted" ? (
              <p className="muted">✓ 浏览器通知已授权。应用打开且过了提醒时间时会弹出系统通知。</p>
            ) : perm === "denied" ? (
              <p className="muted">浏览器通知被拒绝，仅保留应用内提醒。可在浏览器站点设置里重新允许。</p>
            ) : (
              <button className="secondary-button fit" type="button" onClick={async () => setPerm(await requestNotificationPermission())}>
                授权浏览器通知
              </button>
            )
          ) : (
            <p className="muted">当前环境不支持浏览器通知，仅保留应用内提醒。</p>
          )}
          <p className="muted reminder-note">提示：纯前端应用的通知只在打开页面时触发，无法在完全关闭后后台推送。</p>
        </div>
      )}
    </section>
  );
}
