import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, RotateCcw, BookOpen, ClipboardList, ArrowRight, Settings } from "lucide-react";
import { useStudyDesk } from "../lib/studyDeskContext";
import { MODULE_COLORS, RECORD_MODULE_KEYS } from "../lib/constants";
import { mergeDayWithEdit, buildStudyBudget, getReferencePlan, recordsSignature } from "../lib/planner";
import { todayISO } from "../lib/utils";
import { useLocale } from "../i18n/LocaleProvider";
import { levelLabel as i18nLevelLabel, phaseLabel, moduleLabel, moduleShort } from "../i18n";

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

export function PlanPage() {
  const navigate = useNavigate();
  const {
    state,
    upcomingDays,
    health,
    planAdjustment,
    applyAutoAdjust,
    savePlanEdit,
    deletePlanEdit,
    generateNewPlan,
  } = useStudyDesk();
  const { t, tOption } = useLocale();
  const generatedPlan = state.generatedPlan;
  const records = state.records;

  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleEdit = (dayIndex: number, currentText: string) => {
    setEditingDay(dayIndex);
    setEditText(currentText);
  };

  const handleSaveEdit = (dayIndex: number) => {
    savePlanEdit(dayIndex, editText);
    setEditingDay(null);
  };

  if (!generatedPlan) {
    return (
      <div className="page-grid">
        <section className="stack">
          <div className="empty-state">
            <div className="empty-state-icon">
              <ClipboardList size={48} strokeWidth={1.5} />
            </div>
            <h3>{t("plan.emptyTitle")}</h3>
            <p>{t("plan.emptyDesc")}</p>
            <div className="empty-state-steps">
              <div className="empty-state-step">
                <Settings size={16} />
                <span>{t("plan.stepSetup")}</span>
              </div>
              <ArrowRight size={14} className="empty-state-arrow" />
              <div className="empty-state-step">
                <BookOpen size={16} />
                <span>{t("plan.stepGenerate")}</span>
              </div>
              <ArrowRight size={14} className="empty-state-arrow" />
              <div className="empty-state-step">
                <ClipboardList size={16} />
                <span>{t("plan.stepView")}</span>
              </div>
            </div>
            <a className="primary-button" href="#/setup" onClick={(e) => { e.preventDefault(); navigate("/setup"); }}>
              {t("plan.goGenerate")}
            </a>
          </div>
        </section>
      </div>
    );
  }

  const todayDay = upcomingDays[0];
  const budget = buildStudyBudget(state.settings);
  const REFERENCE_PLAN = getReferencePlan();
  const recordDates = new Set(records.map((record) => record.date));

  // 模块饼图数据
  const pieEntries = RECORD_MODULE_KEYS.map((key) => ({
    key,
    label: moduleLabel(key),
    value: Number((budget.moduleMinutes || {})[key] || 0),
    color: MODULE_COLORS[key] || MODULE_COLORS.review,
  })).filter((item) => item.value > 0);
  const pieTotal = pieEntries.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const pieGradient = pieEntries.length && pieTotal > 0
    ? pieEntries.map((item) => {
        const start = cursor;
        const end = cursor + (item.value / pieTotal) * 360;
        cursor = end;
        return `${item.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
      }).join(", ")
    : "";

  return (
    <div className="page-grid">
      <section className="stack">
        {/* 计划结果 Hero */}
        <section className="panel plan-result-hero">
          <div className="section-head">
            <div>
              <p className="eyebrow">Generated Plan</p>
              <h2>{t("plan.heroTitle", { level: i18nLevelLabel(generatedPlan.level) })}</h2>
              <p>{generatedPlan.strategy.summary}</p>
            </div>
            <span className="metric-chip"><strong>{health.label}</strong>{health.score}/100</span>
          </div>
          <div className="plan-summary-grid">
            <div className="summary-item">
              <span className="summary-label">{t("plan.examDate")}</span>
              <span className="summary-value">{generatedPlan.examDate || t("plan.notSet")}</span>
              <span className="summary-note">{t("plan.daysUnit", { n: generatedPlan.daysLeft ?? "?" })}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">{t("plan.dailyTarget")}</span>
              <span className="summary-value">{budget.dailyMinutes} min</span>
              <span className="summary-note">{t("plan.weekdayWeekend", { a: state.settings.weekdayMinutes, b: state.settings.weekendMinutes })}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">{t("plan.newContent")}</span>
              <span className="summary-value">{tOption("budgetStatus", budget.status)}</span>
              <span className="summary-note">{t("plan.vocabGrammar", { v: budget.vocabRemaining, g: budget.grammarRemaining })}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">{t("plan.reviewWindow")}</span>
              <span className="summary-value">{t("plan.reviewDays", { a: budget.reviewDaysLeft, b: budget.desiredReviewDays })}</span>
              <span className="summary-note">{t("plan.reserve", { p: Math.round(state.settings.reviewReserve * 100) })}</span>
            </div>
          </div>
        </section>

        {/* Plan sanity check */}
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>{t("plan.healthCheck")}</h2>
              <p>{t("plan.healthCheckDesc")}</p>
            </div>
          </div>
          <div className="diagnostic-grid">
            <div className="diagnostic-item">
              <span className="diagnostic-label">{t("plan.timeAdequacy")}</span>
              <span className={`diagnostic-value ${budget.timeStatus === "low" ? "warning" : "good"}`}>{tOption("timeStatus", budget.timeStatus) || "-"}</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">{t("plan.vocabDone")}</span>
              <span className="diagnostic-value">{t("plan.daysUnit", { n: budget.vocabDays ?? "-" })}</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">{t("plan.grammarDone")}</span>
              <span className="diagnostic-value">{t("plan.daysUnit", { n: budget.grammarDays ?? "-" })}</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">{t("plan.phaseFocus")}</span>
              <span className="diagnostic-value">{generatedPlan.strategy.focus}</span>
            </div>
          </div>
        </section>

        {/* Smart adjustment (data-driven, from the last 7 days) */}
        <section className="panel adjust-panel">
          <div className="section-head">
            <div>
              <h2>{t("adjust.cardTitle")}</h2>
              <p>{t("adjust.cardDesc")}</p>
            </div>
            <span className={`adjust-badge adjust-${planAdjustment.type}`}>
              {planAdjustment.type === "increase"
                ? t("adjust.badgeIncrease")
                : planAdjustment.type === "decrease"
                ? t("adjust.badgeDecrease")
                : t("adjust.badgeMaintain")}
            </span>
          </div>
          <p className="adjust-reason">{planAdjustment.reason}</p>
          <ul className="list">
            {planAdjustment.details.map((d, i) => (
              <li key={i} className="list-item"><span>{d}</span></li>
            ))}
          </ul>
          {planAdjustment.type !== "maintain" && (
            generatedPlan.adjustmentSignature === recordsSignature(records) ? (
              <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>{t("adjust.appliedNote")}</p>
            ) : (
              <div className="button-row" style={{ marginTop: 14 }}>
                <button className="primary-button" type="button" onClick={applyAutoAdjust}>
                  {t("adjust.apply")}
                </button>
              </div>
            )
          )}
        </section>

        {/* 14-day calendar */}
        <section className="panel plan-calendar-panel">
          <div className="section-head">
            <div>
              <h2>{t("plan.calendar14")}</h2>
              <p>{t("plan.calendarDesc")}</p>
            </div>
          </div>
          <div className="plan-calendar" aria-label={t("plan.calendar14")}>
            {upcomingDays.slice(0, 14).map((day) => {
              const merged = mergeDayWithEdit(day, state.planEdits);
              const modules = [...new Set(merged.tasks.map((task) => task.module).filter((module) => module !== "review"))].slice(0, 3);
              const isToday = day.date === todayISO();
              const isRecorded = recordDates.has(day.date);
              return (
                <article key={day.dayIndex} className={`calendar-day ${isToday ? "is-today" : ""} ${day.isLightDay ? "is-light" : ""}`}>
                  <div className="calendar-day-top">
                    <span>{day.weekday}</span>
                    <strong>{Number(day.date.slice(-2))}</strong>
                  </div>
                  <p>{day.title || phaseLabel(day.phase)}</p>
                  <div className="calendar-meta">
                    <span>{Number(day.totalMinutes || 0)} min</span>
                    {merged.hasEdit && <span>{t("plan.edited")}</span>}
                    {isRecorded && <span>{t("plan.recorded")}</span>}
                  </div>
                  <div className="calendar-modules" aria-label={t("plan.dayModules")}>
                    {modules.map((module) => (
                      <i key={module} style={{ ["--dot" as string]: MODULE_COLORS[module as keyof typeof MODULE_COLORS] || MODULE_COLORS.review }} title={moduleLabel(module)} />
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 今日任务 */}
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>{t("plan.todayTasks")}</h2>
              <p>{todayDay ? `${todayDay.date} · ${todayDay.weekday} · ${todayDay.title}` : t("plan.todayOutOfRange")}</p>
            </div>
            <a className="primary-button" href="#/record" onClick={(e) => { e.preventDefault(); navigate("/record"); }}>{t("plan.recordToday")}</a>
          </div>
          {todayDay ? (
            <div className="stack">
              <div className="task-block-grid">
                {mergeDayWithEdit(todayDay, state.planEdits).tasks.map((task, index) => (
                  <article key={task.id} className="task-block">
                    <div className="task-block-index">{String(index + 1).padStart(2, "0")}</div>
                    <div>
                      <div className="task-block-head">
                        <span className={`module-dot ${task.module}`}>{moduleShort(task.module)}</span>
                        <span className="time-pill">{Number(task.minutes || 0)} min</span>
                      </div>
                      <strong>{task.title}</strong>
                      <TaskPoints text={task.text} />
                      <small>{task.priority ? tOption("priority", task.priority) : t("plan.taskFallback")}</small>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>{t("plan.noTodayPlan")}</h3>
              <p>{t("plan.noTodayPlanDesc")}</p>
              <a className="primary-button" href="#/setup" onClick={(e) => { e.preventDefault(); navigate("/setup"); }}>{t("plan.reconfigure")}</a>
            </div>
          )}
        </section>

        {/* 14-day detailed plan */}
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>{t("plan.detail14")}</h2>
              <p>{t("plan.detail14Desc")}</p>
            </div>
          </div>
          <div className="daily-plan-list">
            {upcomingDays.slice(0, 14).map((day) => {
              const merged = mergeDayWithEdit(day, state.planEdits);
              const isEditing = editingDay === day.dayIndex;
              const sourceText = merged.hasEdit ? merged.editText : day.tasks.map((t) => `${t.title}：${t.minutes} 分钟。${t.text}`).join("\n");

              return (
                <article key={day.dayIndex} className="card plan-day">
                  <div className="plan-day-header">
                    <div>
                      <h3>{day.label} · {day.title || phaseLabel(day.phase)}</h3>
                      <p className="muted">{day.date} · {day.weekday} · {phaseLabel(day.phase)} · {t("plan.minuteTarget", { n: day.targetMinutes })}{merged.hasEdit ? t("plan.manuallyAdjusted") : ""}</p>
                    </div>
                    <span className="time-pill">{day.totalMinutes} min</span>
                  </div>
                  <div className="task-block-grid">
                    {merged.tasks.map((task, index) => (
                      <article key={task.id} className="task-block">
                        <div className="task-block-index">{String(index + 1).padStart(2, "0")}</div>
                        <div>
                          <div className="task-block-head">
                            <span className={`module-dot ${task.module}`}>{moduleShort(task.module)}</span>
                            <span className="time-pill">{Number(task.minutes || 0)} min</span>
                          </div>
                          <strong>{task.title}</strong>
                          <TaskPoints text={task.text} />
                          <small>{task.priority ? tOption("priority", task.priority) : t("plan.taskFallback")}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                  {isEditing ? (
                    <div className="stack">
                      <textarea
                        className="day-edit-box"
                        rows={3}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="button-row">
                        <button className="secondary-button" type="button" onClick={() => handleSaveEdit(day.dayIndex)}>
                          <Save size={14} /> {t("plan.saveAdjust")}
                        </button>
                        <button className="ghost-button" type="button" onClick={() => { setEditingDay(null); if (merged.hasEdit) deletePlanEdit(day.dayIndex); }}>
                          {t("plan.restorePlan")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="ghost-button small"
                      onClick={() => handleEdit(day.dayIndex, sourceText)}
                    >
                      <BookOpen size={14} /> {merged.hasEdit ? t("plan.editAdjust") : t("plan.fineTune")}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </section>

      <aside className="stack">
        {/* 学习预算 */}
        <section className="card">
          <div className="section-head">
            <div>
              <h3>{t("plan.studyBudget")}</h3>
              <p>{t("plan.studyBudgetDesc")}</p>
            </div>
          </div>
          {pieEntries.length && pieTotal > 0 ? (
            <div className="module-pie-card">
              <div className="module-donut" style={{ background: `conic-gradient(${pieGradient})` }} role="img" aria-label={t("plan.budgetChart")}>
                <span>
                  <strong>{Math.round(pieTotal)}</strong>
                  <small>min/day</small>
                </span>
              </div>
              <ul className="module-pie-legend">
                {pieEntries.map((item) => (
                  <li key={item.key}>
                    <span><i style={{ ["--dot" as string]: item.color }} />{item.label}</span>
                    <strong>{Math.round(item.value)} min</strong>
                    <small>{Math.round((item.value / pieTotal) * 100)}%</small>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="muted">{t("plan.noBudget")}</p>
          )}
        </section>

        {/* Minimum version */}
        <section className="card">
          <div className="section-head">
            <div>
              <h3>{t("plan.minimalVersion")}</h3>
              <p>{t("plan.minimalDesc")}</p>
            </div>
          </div>
          <ul className="list">
            {(generatedPlan.minimumPlan || []).map((item, index) => (
              <li key={index} className="list-item"><span>{item}</span></li>
            ))}
          </ul>
        </section>

        {/* 路线图 */}
        <section className="card">
          <div className="section-head">
            <div>
              <h3>{t("plan.roadmap")}</h3>
              <p>{t("plan.roadmapDesc")}</p>
            </div>
          </div>
          <ul className="timeline">
            {(generatedPlan.roadmap || []).map((item, index) => (
              <li key={index} className="timeline-item">
                <div>
                  <strong>{phaseLabel(item.title)}</strong>
                  <p className="muted">{item.dayRange} · {item.focus}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 执行原则 */}
        <section className="card">
          <div className="section-head">
            <div>
              <h3>{t("plan.principles")}</h3>
              <p>{t("plan.principlesDesc")}</p>
            </div>
          </div>
          <ul className="list">
            {(generatedPlan.principles || []).map((principle, index) => (
              <li key={index} className="list-item"><span>{principle}</span></li>
            ))}
          </ul>
        </section>

        {/* 教材锚点 */}
        <section className="card">
          <div className="section-head">
            <div>
              <h3>{t("plan.materialAnchor")}</h3>
              <p>{t("plan.materialAnchorDesc")}</p>
            </div>
          </div>
          <div className="chip-list">
            {(generatedPlan.materials || []).map((material, index) => (
              <span key={index} className="chip">{material}</span>
            ))}
          </div>
        </section>

        <section className="card reference-plan-card">
          <div className="section-head">
            <div>
              <h3>{REFERENCE_PLAN.title}</h3>
              <p>{REFERENCE_PLAN.subtitle}</p>
            </div>
          </div>
          <div className="reference-meta">
            {REFERENCE_PLAN.meta.map((item, i) => (
              <span key={i} className="tag">{item}</span>
            ))}
          </div>
          <p className="notice">{REFERENCE_PLAN.strategy}</p>
          <ul className="task-list">
            {REFERENCE_PLAN.tasks.map((task, i) => (
              <li key={i} className="task-item">
                <span className={`module-dot ${task.module}`}>{moduleShort(task.module)}</span>
                <div className="task-main">
                  <strong>{task.title}</strong>
                  <TaskPoints text={task.method} />
                </div>
                <span className="time-pill">{task.minutes} min</span>
              </li>
            ))}
          </ul>
          <div className="reference-days">
            {REFERENCE_PLAN.days.map((day, i) => (
              <article key={i} className="reference-day">
                <span>{day.label}</span>
                <strong>{day.title}</strong>
                <p>{day.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card reference-plan-card compact">
          <div className="section-head">
            <div>
              <h3>{t("plan.referenceMinimal")}</h3>
              <p>{t("plan.referenceMinimalDesc")}</p>
            </div>
          </div>
          <ul className="list">
            {REFERENCE_PLAN.minimum.map((item, i) => (
              <li key={i} className="list-item"><span>{item}</span></li>
            ))}
          </ul>
        </section>

        <div className="button-row">
          <button className="secondary-button" onClick={generateNewPlan}>
            <RotateCcw size={16} /> {t("plan.regenerate")}
          </button>
        </div>
      </aside>
    </div>
  );
}
