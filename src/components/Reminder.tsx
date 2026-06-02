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
import { useLocale } from "../i18n/LocaleProvider";

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
  const { t } = useLocale();
  const [dismissed, setDismissed] = useState(false);

  // Only nudge active users (have a plan or past records); skip brand-new users.
  const isActive = !!state.generatedPlan || state.records.length > 0;
  if (todayRecord || dismissed || !isActive) return null;

  return (
    <div className="reminder-banner">
      <span className="reminder-banner-icon"><PenLine size={18} /></span>
      <div className="reminder-banner-text">
        <strong>{t("reminder.bannerTitle")}</strong>
        <span>{t("reminder.bannerDesc")}</span>
      </div>
      <div className="reminder-banner-actions">
        <button className="primary-button" type="button" onClick={() => navigate("/record")}>
          {t("reminder.bannerCta")}
        </button>
        <button className="reminder-banner-close" type="button" aria-label={t("common.close")} onClick={() => setDismissed(true)}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

/** Setup-page card: enable daily reminder + pick time + grant notification permission. */
export function ReminderSettings() {
  const { t } = useLocale();
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
        toast(t("reminder.partialEnable"));
      }
    }
    persist(next);
  }, [settings, persist, t]);

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
            <h2>{t("reminder.title")}</h2>
            <p>{t("reminder.desc")}</p>
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
            <label htmlFor="reminderTime">{t("reminder.time")}</label>
            <input
              id="reminderTime"
              type="time"
              value={settings.time}
              onChange={(e) => handleTime(e.target.value)}
            />
          </div>
          {notificationsSupported() ? (
            perm === "granted" ? (
              <p className="muted">{t("reminder.granted")}</p>
            ) : perm === "denied" ? (
              <p className="muted">{t("reminder.denied")}</p>
            ) : (
              <button className="secondary-button fit" type="button" onClick={async () => setPerm(await requestNotificationPermission())}>
                {t("reminder.grantNotif")}
              </button>
            )
          ) : (
            <p className="muted">{t("reminder.unsupported")}</p>
          )}
          <p className="muted reminder-note">{t("reminder.note")}</p>
        </div>
      )}
    </section>
  );
}
