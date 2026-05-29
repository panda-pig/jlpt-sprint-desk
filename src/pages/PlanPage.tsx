import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, RotateCcw, BookOpen, ClipboardList, ArrowRight, Settings } from "lucide-react";
import { useStudyDesk } from "../lib/studyDeskContext";
import { MODULE_COLORS, MODULE_SHORTS, RECORD_MODULE_KEYS, MODULE_LABELS, REFERENCE_PLAN } from "../lib/constants";
import { mergeDayWithEdit, buildStudyBudget } from "../lib/planner";
import { todayISO } from "../lib/utils";

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
    savePlanEdit,
    deletePlanEdit,
    generateNewPlan,
  } = useStudyDesk();
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
            <h3>还没有生成学习计划</h3>
            <p>学习之前需要先制定计划。去设置页配置考试日期、每日时间和薄弱项，即可自动生成个性化学习路线。</p>
            <div className="empty-state-steps">
              <div className="empty-state-step">
                <Settings size={16} />
                <span>设置考试信息</span>
              </div>
              <ArrowRight size={14} className="empty-state-arrow" />
              <div className="empty-state-step">
                <BookOpen size={16} />
                <span>生成学习计划</span>
              </div>
              <ArrowRight size={14} className="empty-state-arrow" />
              <div className="empty-state-step">
                <ClipboardList size={16} />
                <span>查看每日任务</span>
              </div>
            </div>
            <a className="primary-button" href="#/setup" onClick={(e) => { e.preventDefault(); navigate("/setup"); }}>
              去生成计划
            </a>
          </div>
        </section>
      </div>
    );
  }

  const todayDay = upcomingDays[0];
  const budget = buildStudyBudget(state.settings);
  const recordDates = new Set(records.map((record) => record.date));

  // 模块饼图数据
  const pieEntries = RECORD_MODULE_KEYS.map((key) => ({
    key,
    label: MODULE_LABELS[key],
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
              <h2>JLPT {generatedPlan.level} 详细学习计划</h2>
              <p>{generatedPlan.strategy.summary}</p>
            </div>
            <span className="metric-chip"><strong>{health.label}</strong>{health.score}/100</span>
          </div>
          <div className="plan-summary-grid">
            <div className="summary-item">
              <span className="summary-label">考试日期</span>
              <span className="summary-value">{generatedPlan.examDate || "未设置"}</span>
              <span className="summary-note">{generatedPlan.daysLeft ?? "?"} 天</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">日均目标</span>
              <span className="summary-value">{budget.dailyMinutes} min</span>
              <span className="summary-note">工作日 {state.settings.weekdayMinutes} / 周末 {state.settings.weekendMinutes}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">新内容</span>
              <span className="summary-value">{budget.status}</span>
              <span className="summary-note">词汇 {budget.vocabRemaining} · 文法 {budget.grammarRemaining}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">复习窗口</span>
              <span className="summary-value">{budget.reviewDaysLeft} / {budget.desiredReviewDays} 天</span>
              <span className="summary-note">预留 {Math.round(state.settings.reviewReserve * 100)}%</span>
            </div>
          </div>
        </section>

        {/* 计划合理性体检 */}
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>计划合理性体检</h2>
              <p>沿用静态页的学习量预算：看新词、新文法和复习窗口是否能压进倒计时。</p>
            </div>
          </div>
          <div className="diagnostic-grid">
            <div className="diagnostic-item">
              <span className="diagnostic-label">时间充足度</span>
              <span className={`diagnostic-value ${(budget.timeStatus || "").includes("不足") ? "warning" : "good"}`}>{budget.timeStatus || "-"}</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">词汇完成</span>
              <span className="diagnostic-value">{budget.vocabDays ?? "-"} 天</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">文法完成</span>
              <span className="diagnostic-value">{budget.grammarDays ?? "-"} 天</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">阶段重点</span>
              <span className="diagnostic-value">{generatedPlan.strategy.focus}</span>
            </div>
          </div>
        </section>

        {/* 14 天计划日历 */}
        <section className="panel plan-calendar-panel">
          <div className="section-head">
            <div>
              <h2>14 天计划日历</h2>
              <p>先看接下来两周的节奏，再进入每天的详细任务。</p>
            </div>
          </div>
          <div className="plan-calendar" aria-label="14 天计划日历">
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
                  <p>{day.title || day.phase}</p>
                  <div className="calendar-meta">
                    <span>{Number(day.totalMinutes || 0)} min</span>
                    {merged.hasEdit && <span>已调</span>}
                    {isRecorded && <span>已记</span>}
                  </div>
                  <div className="calendar-modules" aria-label="当天模块">
                    {modules.map((module) => (
                      <i key={module} style={{ ["--dot" as string]: MODULE_COLORS[module as keyof typeof MODULE_COLORS] || MODULE_COLORS.review }} title={MODULE_LABELS[module as keyof typeof MODULE_LABELS] || module} />
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
              <h2>今日任务</h2>
              <p>{todayDay ? `${todayDay.date} · ${todayDay.weekday} · ${todayDay.title}` : "今日不在计划周期内"}</p>
            </div>
            <a className="primary-button" href="#/record" onClick={(e) => { e.preventDefault(); navigate("/record"); }}>记录今日</a>
          </div>
          {todayDay ? (
            <div className="stack">
              <div className="task-block-grid">
                {mergeDayWithEdit(todayDay, state.planEdits).tasks.map((task, index) => (
                  <article key={task.id} className="task-block">
                    <div className="task-block-index">{String(index + 1).padStart(2, "0")}</div>
                    <div>
                      <div className="task-block-head">
                        <span className={`module-dot ${task.module}`}>{MODULE_SHORTS[task.module as keyof typeof MODULE_SHORTS] || "项"}</span>
                        <span className="time-pill">{Number(task.minutes || 0)} min</span>
                      </div>
                      <strong>{task.title}</strong>
                      <TaskPoints text={task.text} />
                      <small>{task.priority || "任务"}</small>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>没有匹配的今日计划</h3>
              <p>你可以重新生成计划，让起始日期回到今天。</p>
              <a className="primary-button" href="#/setup" onClick={(e) => { e.preventDefault(); navigate("/setup"); }}>重新设置</a>
            </div>
          )}
        </section>

        {/* 14 天详细计划 */}
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>14 天详细计划</h2>
              <p>保留旧版 daily card 的任务块阅读方式，同时支持在每一天直接微调。</p>
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
                      <h3>{day.label} · {day.title || day.phase}</h3>
                      <p className="muted">{day.date} · {day.weekday} · {day.phase} · {day.targetMinutes} 分钟目标{merged.hasEdit ? " · 已手动调整" : ""}</p>
                    </div>
                    <span className="time-pill">{day.totalMinutes} min</span>
                  </div>
                  <div className="task-block-grid">
                    {merged.tasks.map((task, index) => (
                      <article key={task.id} className="task-block">
                        <div className="task-block-index">{String(index + 1).padStart(2, "0")}</div>
                        <div>
                          <div className="task-block-head">
                            <span className={`module-dot ${task.module}`}>{MODULE_SHORTS[task.module as keyof typeof MODULE_SHORTS] || "项"}</span>
                            <span className="time-pill">{Number(task.minutes || 0)} min</span>
                          </div>
                          <strong>{task.title}</strong>
                          <TaskPoints text={task.text} />
                          <small>{task.priority || "任务"}</small>
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
                          <Save size={14} /> 保存调整
                        </button>
                        <button className="ghost-button" type="button" onClick={() => { setEditingDay(null); if (merged.hasEdit) deletePlanEdit(day.dayIndex); }}>
                          恢复生成计划
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="ghost-button small"
                      onClick={() => handleEdit(day.dayIndex, sourceText)}
                    >
                      <BookOpen size={14} /> {merged.hasEdit ? "编辑调整" : "微调计划"}
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
              <h3>学习预算</h3>
              <p>按薄弱项和重点模块自动分配。</p>
            </div>
          </div>
          {pieEntries.length && pieTotal > 0 ? (
            <div className="module-pie-card">
              <div className="module-donut" style={{ background: `conic-gradient(${pieGradient})` }} role="img" aria-label="学习预算占比图">
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
            <p className="muted">暂无预算数据。</p>
          )}
        </section>

        {/* 最低可执行版 */}
        <section className="card">
          <div className="section-head">
            <div>
              <h3>最低可执行版</h3>
              <p>忙碌日照这个版本保底。</p>
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
              <h3>路线图</h3>
              <p>阶段目标来自考试日期和当前基础。</p>
            </div>
          </div>
          <ul className="timeline">
            {(generatedPlan.roadmap || []).map((item, index) => (
              <li key={index} className="timeline-item">
                <div>
                  <strong>{item.title}</strong>
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
              <h3>执行原则</h3>
              <p>生成计划时保留下来的策略解释。</p>
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
              <h3>教材锚点</h3>
              <p>根据设置自动关联。</p>
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
                <span className={`module-dot ${task.module}`}>{MODULE_SHORTS[task.module] || "项"}</span>
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
              <h3>参考保底版</h3>
              <p>没有精力完整学习时，也可以参考这个 30 分钟版本。</p>
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
            <RotateCcw size={16} /> 重新生成
          </button>
        </div>
      </aside>
    </div>
  );
}
