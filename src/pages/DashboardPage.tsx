import { useNavigate } from "react-router-dom";
import { useStudyDesk } from "../lib/studyDeskContext";
import { daysUntil, clampPercent } from "../lib/utils";
import { getTodayTargetMinutes } from "../lib/planner";
import { LEVEL_CONFIG, MODULE_LABELS, MODULE_SHORTS } from "../lib/constants";
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

  const daysLeft = daysUntil(state.settings.examDate);
  const totalMinutes = state.records.reduce((sum, r) => {
    const mins = Object.values(r.minutes || {}).reduce((a, b) => a + Number(b || 0), 0);
    return sum + mins;
  }, 0);
  const completion = todayRecord
    ? { done: 100, partial: 60, minimum: 30, missed: 0 }[todayRecord.completion] || 0
    : 0;

  const profile = state.profiles.find((p) => p.id === state.activeProfileId);
  const levelLabel = LEVEL_CONFIG[state.settings.level]?.label || state.settings.level;
  const targetScore = Number(state.settings.targetScore || LEVEL_CONFIG[state.settings.level]?.targetScore || 100);

  return (
    <div className="page-grid">
      <section className="stack">
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
                查看计划
              </a>
            </div>
          </div>
        </section>

        <div className="three-col">
          <section className="card metric-card">
            <div>
              <p className="metric-label">考试倒计时</p>
              <p className="metric-value">
                {daysLeft === null ? "待设置" : daysLeft} <small>{daysLeft === null ? "去设置考试日期" : "Days left"}</small>
              </p>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ ["--value" as string]: `${clampPercent(daysLeft === null ? 0 : 100 - (daysLeft / 120) * 100)}%` }} />
            </div>
          </section>

          <section className="card metric-card">
            <div>
              <p className="metric-label">今日目标</p>
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
              <p className="metric-label">累计投入</p>
              <p className="metric-value">
                {(totalMinutes / 60).toFixed(1)} <small>hours</small>
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
              <h2>今日学习循环</h2>
              <p>从计划到记录再到复盘，保持一个轻量闭环。</p>
            </div>
            <span className="metric-chip"><strong>{health.label}</strong>{health.score}/100</span>
          </div>
          {todayPlan ? (
            <div className="stack">
              <ul className="task-list">
                {todayPlan.tasks.map((task: StudyTask) => (
                  <li key={task.id} className="task-item">
                    <span className={`module-dot ${task.module}`}>{MODULE_SHORTS[task.module] || "项"}</span>
                    <div className="task-main">
                      <strong>{task.title || task.label}</strong>
                      <TaskPoints text={task.text} />
                    </div>
                    <span className="time-pill">{task.minutes} min</span>
                  </li>
                ))}
              </ul>
              <p className="muted">{todayRecord ? "今日已记录，可按真实表现更新。" : "建议先完成这些任务，再进入每日记录。"}</p>
            </div>
          ) : (
            <div className="empty-state">
              <h3>还没有生成计划</h3>
              <p>先完成计划设置，系统会按考试日期、可用时间和薄弱项生成每日任务。</p>
              <a className="primary-button" href="#/setup" onClick={(e) => { e.preventDefault(); navigate("/setup"); }}>
                去设置
              </a>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <h2>计划健康</h2>
              <p>{health.message}</p>
            </div>
            <a className="ghost-button" href="#/analysis" onClick={(e) => { e.preventDefault(); navigate("/analysis"); }}>
              查看分析
            </a>
          </div>
          <div className="progress-track" aria-label="计划健康分">
            <div className="progress-fill" style={{ ["--value" as string]: `${health.score}%` }} />
          </div>
        </section>
      </section>

      <aside className="stack">
        <section className="card">
          <div className="section-head">
            <div>
              <h3>{profile?.name}</h3>
              <p>{levelLabel} · 目标 {targetScore} 分</p>
            </div>
            <a className="secondary-button" href="#/setup" onClick={(e) => { e.preventDefault(); navigate("/setup"); }}>
              管理
            </a>
          </div>
          <div className="bar-list">
            <div className="list-item">
              <span>考试日期</span>
              <strong>{state.settings.examDate || "未设置"}</strong>
            </div>
            <div className="list-item">
              <span>当前阶段</span>
              <strong>{todayPlan ? todayPlan.phase : "待生成"}</strong>
            </div>
            <div className="list-item">
              <span>今日记录</span>
              <strong>{todayRecord ? "已完成" : "未记录"}</strong>
            </div>
            <div className="list-item">
              <span>连续记录</span>
              <strong>{stats.streak} 天</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h3>7 天趋势</h3>
              <p>真实记录驱动后续建议。</p>
            </div>
          </div>
          <div className="bar-list">
            <div className="bar-row">
              <strong>学习天数</strong>
              <span className="bar-track">
                <span className="bar-fill" style={{ ["--value" as string]: `${clampPercent((stats.recordedDays / 7) * 100)}%` }} />
              </span>
              <span className="muted">{stats.recordedDays}天</span>
            </div>
            <div className="bar-row">
              <strong>投入时间</strong>
              <span className="bar-track">
                <span className="bar-fill" style={{ ["--value" as string]: `${clampPercent((stats.totalMinutes / Math.max(1, getTodayTargetMinutes(state.settings) * 7)) * 100)}%` }} />
              </span>
              <span className="muted">{Math.round(stats.totalMinutes)}min</span>
            </div>
            <div className="bar-row">
              <strong>平均完成</strong>
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
              <h3>本周提醒</h3>
              <p>{stats.streak >= 5 ? "连续记录已经形成节奏，本周重点是压低重复错因。" : stats.avgCompletion < 65 && stats.recordedDays > 0 ? "不要硬扛完整任务，把每日计划拆小一点，先稳住反馈闭环。" : `${state.settings.focusModules?.map((key) => MODULE_LABELS[key]).join("、") || "重点模块"}保持主线，错因复盘放在每天前 15 分钟。`}</p>
            </div>
          </div>
          <div className="button-row">
            <a className="primary-button full" href="#/record" onClick={(e) => { e.preventDefault(); navigate("/record"); }}>
              填写今日记录
            </a>
          </div>
        </section>
      </aside>
    </div>
  );
}
