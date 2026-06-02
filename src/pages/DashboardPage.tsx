import { useNavigate } from "react-router-dom";
import { useStudyDesk } from "../lib/studyDeskContext";
import { daysUntil, clampPercent } from "../lib/utils";
import { getTodayTargetMinutes } from "../lib/planner";
import { LEVEL_CONFIG } from "../lib/constants";
import { ReminderBanner } from "../components/Reminder";
import { useLocale } from "../i18n/LocaleProvider";
import { moduleLabel, moduleShort, levelLabel as i18nLevelLabel, phaseLabel } from "../i18n";
import type { StudyTask } from "../lib/types";

function splitTaskPoints(text: string): string[] {
  return String(text || "")
    .split(/[；;。]/)
    .map((item) => item.trim().replace(/[，,]\s*/g, "，"))
    .filter(Boolean)
    .slice(0, 4);
}

function TaskPoints({ text }: { text: string }) {
  const points = splitTaskPoints(text);
  if (!points.length) return null;
  return (
    <ul className="task-points">
      {points.map((point, index) => (
        <li key={index}>{point}</li>
      ))}
    </ul>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    state,
    todayRecord,
    todayPlan,
    health,
    stats,
    nextAction,
  } = useStudyDesk();
  const { t } = useLocale();

  const daysLeft = daysUntil(state.settings.examDate);
  const totalMinutes = state.records.reduce((sum, r) => {
    const mins = Object.values(r.minutes || {}).reduce((a, b) => a + Number(b || 0), 0);
    return sum + mins;
  }, 0);
  const completion = todayRecord
    ? { done: 100, partial: 60, minimum: 30, missed: 0 }[todayRecord.completion] || 0
    : 0;

  const profile = state.profiles.find((p) => p.id === state.activeProfileId);
  const levelLabel = i18nLevelLabel(LEVEL_CONFIG[state.settings.level]?.label || state.settings.level);
  const targetScore = Number(state.settings.targetScore || LEVEL_CONFIG[state.settings.level]?.targetScore || 100);

  return (
    <div className="page-grid">
      <section className="stack">
        <ReminderBanner />
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Next Action</p>
            <h2>{nextAction.title}</h2>
            <p>{nextAction.body}</p>
            <div className="hero-actions">
              <a className="primary-button" href={nextAction.href} onClick={(e) => { e.preventDefault(); navigate(nextAction.href.replace("#/", "/")); }}>
                {nextAction.cta}
              </a>
              <a className="secondary-button" href="#/plan" onClick={(e) => { e.preventDefault(); navigate("/plan"); }}>
                {t("nav.plan")}
              </a>
            </div>
          </div>
        </section>

        <div className="three-col">
          <section className="card metric-card">
            <div>
              <p className="metric-label">{t("dashboard.countdown")}</p>
              <p className="metric-value">
                {daysLeft === null ? t("dashboard.pendingSetup") : daysLeft} <small>{daysLeft === null ? t("dashboard.daysToSet") : t("dashboard.daysLeftSmall")}</small>
              </p>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ ["--value" as string]: `${clampPercent(daysLeft === null ? 0 : 100 - (daysLeft / 120) * 100)}%` }} />
            </div>
          </section>

          <section className="card metric-card">
            <div>
              <p className="metric-label">{t("dashboard.todayGoal")}</p>
              <p className="metric-value">
                {getTodayTargetMinutes(state.settings)} <small>min</small>
              </p>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ ["--value" as string]: `${todayRecord ? completion : 0}%` }} />
            </div>
          </section>

          <section className="card metric-card">
            <div>
              <p className="metric-label">{t("dashboard.totalInvested")}</p>
              <p className="metric-value">
                {(totalMinutes / 60).toFixed(1)} <small>{t("dashboard.hours")}</small>
              </p>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ ["--value" as string]: `${clampPercent((totalMinutes / Math.max(1, getTodayTargetMinutes(state.settings) * 7)) * 100)}%` }} />
            </div>
          </section>
        </div>

        <section className="panel">
          <div className="section-head">
            <div>
              <h2>{t("dashboard.todayLoop")}</h2>
              <p>{t("dashboard.todayLoopDesc")}</p>
            </div>
            <span className="metric-chip"><strong>{health.label}</strong>{health.score}/100</span>
          </div>
          {todayPlan ? (
            <div className="stack">
              <ul className="task-list">
                {todayPlan.tasks.map((task: StudyTask) => (
                  <li key={task.id} className="task-item">
                    <span className={`module-dot ${task.module}`}>{moduleShort(task.module)}</span>
                    <div className="task-main">
                      <strong>{task.title || task.label}</strong>
                      <TaskPoints text={task.text} />
                    </div>
                    <span className="time-pill">{task.minutes} min</span>
                  </li>
                ))}
              </ul>
              <p className="muted">{todayRecord ? t("dashboard.todayRecordedHint") : t("dashboard.finishTasksHint")}</p>
            </div>
          ) : (
            <div className="empty-state">
              <h3>{t("dashboard.noPlanTitle")}</h3>
              <p>{t("dashboard.noPlanDesc")}</p>
              <a className="primary-button" href="#/setup" onClick={(e) => { e.preventDefault(); navigate("/setup"); }}>
                {t("dashboard.goSetup")}
              </a>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <h2>{t("dashboard.planHealth")}</h2>
              <p>{health.message}</p>
            </div>
            <a className="ghost-button" href="#/analysis" onClick={(e) => { e.preventDefault(); navigate("/analysis"); }}>
              {t("dashboard.viewAnalysis")}
            </a>
          </div>
          <div className="progress-track" aria-label={t("dashboard.planHealthScore")}>
            <div className="progress-fill" style={{ ["--value" as string]: `${health.score}%` }} />
          </div>
        </section>
      </section>

      <aside className="stack">
        <section className="card">
          <div className="section-head">
            <div>
              <h3>{profile?.name}</h3>
              <p>{levelLabel} · {t("dashboard.targetScore", { n: targetScore })}</p>
            </div>
            <a className="secondary-button" href="#/setup" onClick={(e) => { e.preventDefault(); navigate("/setup"); }}>
              {t("dashboard.manage")}
            </a>
          </div>
          <div className="bar-list">
            <div className="list-item">
              <span>{t("dashboard.examDate")}</span>
              <strong>{state.settings.examDate || t("dashboard.notSet")}</strong>
            </div>
            <div className="list-item">
              <span>{t("dashboard.currentPhase")}</span>
              <strong>{todayPlan ? phaseLabel(todayPlan.phase) : t("dashboard.pendingGen")}</strong>
            </div>
            <div className="list-item">
              <span>{t("dashboard.todayRecord")}</span>
              <strong>{todayRecord ? t("dashboard.doneShort") : t("dashboard.notRecorded")}</strong>
            </div>
            <div className="list-item">
              <span>{t("dashboard.streak")}</span>
              <strong>{t("dashboard.streakDays", { n: stats.streak })}</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h3>{t("dashboard.trend7")}</h3>
              <p>{t("dashboard.trend7Desc")}</p>
            </div>
          </div>
          <div className="bar-list">
            <div className="bar-row">
              <strong>{t("dashboard.studyDays")}</strong>
              <span className="bar-track">
                <span className="bar-fill" style={{ ["--value" as string]: `${clampPercent((stats.recordedDays / 7) * 100)}%` }} />
              </span>
              <span className="muted">{t("dashboard.daysUnit", { n: stats.recordedDays })}</span>
            </div>
            <div className="bar-row">
              <strong>{t("dashboard.investTime")}</strong>
              <span className="bar-track">
                <span className="bar-fill" style={{ ["--value" as string]: `${clampPercent((stats.totalMinutes / Math.max(1, getTodayTargetMinutes(state.settings) * 7)) * 100)}%` }} />
              </span>
              <span className="muted">{Math.round(stats.totalMinutes)}min</span>
            </div>
            <div className="bar-row">
              <strong>{t("dashboard.avgCompletion")}</strong>
              <span className="bar-track">
                <span className="bar-fill" style={{ ["--value" as string]: `${clampPercent(stats.avgCompletion)}%` }} />
              </span>
              <span className="muted">{Math.round(stats.avgCompletion)}%</span>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h3>{t("dashboard.weeklyTip")}</h3>
              <p>{stats.streak >= 5 ? t("dashboard.tipStreak") : stats.avgCompletion < 65 && stats.recordedDays > 0 ? t("dashboard.tipLowCompletion") : t("dashboard.tipFocus", { modules: state.settings.focusModules?.map((key) => moduleLabel(key)).join(t("common.listSep")) || t("dashboard.focusFallback") })}</p>
            </div>
          </div>
          <div className="button-row">
            <a className="primary-button full" href="#/record" onClick={(e) => { e.preventDefault(); navigate("/record"); }}>
              {t("dashboard.fillRecord")}
            </a>
          </div>
        </section>
      </aside>
    </div>
  );
}
