import {
  BarChart3,
  Lightbulb,
  Activity,
  Gauge,
  Clock,
  Target,
  Zap,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
} from "lucide-react";
import { useStudyDesk } from "../lib/studyDeskContext";
import {
  MODULE_COLORS,
  MODULE_LABELS,
  RECORD_MODULE_KEYS,
} from "../lib/constants";
import { getTodayTargetMinutes } from "../lib/planner";
import { clampPercent } from "../lib/utils";
import { PieChart } from "../components/Charts";

function getCauseAction(cause: string): string {
  const actions: Record<string, string> = {
    词义差别: "把相近词放进同一张对照表，只用例句区分语感。",
    固定搭配: "明天先复盘固定搭配错词，再进入新词。",
    接续形式: "每个错句型保留接续、例句和一个自造句。",
    定位慢: "阅读改成限时定位训练，只找题干关键词和转折句。",
    听漏关键词: "听力重听错题，记录人物、任务、转折和结论。",
    时间不够: "下一轮减少新内容，把题组全部加计时。",
    复盘不足: "每天开始前先回看昨日错题，限制在 10-15 分钟。",
    任务过量: "计划页下调新学量，保留主攻模块和最低复盘。",
  };
  return (
    actions[cause] || "先把这个原因对应的错题集中二刷，再决定是否加量。"
  );
}

export function AnalysisPage() {
  const {
    state,
    health,
    stats,
    suggestions,
    moduleTotals,
    causeCounts,
  } = useStudyDesk();

  const records = state.records;

  if (!records.length) {
    return (
      <div className="page-grid">
        <section className="stack">
          <div className="empty-state">
            <h3>还没有复盘数据</h3>
            <p>
              保存至少一条每日记录后，这里会显示 7
              天趋势、模块投入、错误原因和计划健康建议。
            </p>
            <a className="primary-button" href="#/record">
              去记录今天
            </a>
          </div>
        </section>
      </div>
    );
  }

  const target = getTodayTargetMinutes(state.settings) * 7;
  const pacePercent = clampPercent(
    (stats.totalMinutes / Math.max(1, target)) * 100
  );
  const paceLabel =
    pacePercent >= 90 ? "接近目标" : pacePercent >= 60 ? "需要补齐" : "节奏偏低";

  const moduleEntries = RECORD_MODULE_KEYS.map((key) => ({
    key,
    label: MODULE_LABELS[key],
    value: Number(moduleTotals[key] || 0),
  })).sort((a, b) => b.value - a.value);
  const totalModule = Math.max(
    1,
    moduleEntries.reduce((sum, item) => sum + item.value, 0)
  );
  const topModule = moduleEntries.find((item) => item.value > 0);
  const quietModule = [...moduleEntries]
    .reverse()
    .find((item) => item.value <= Math.max(15, totalModule * 0.08));

  const causeEntries = Object.entries(causeCounts).sort((a, b) => b[1] - a[1]);
  const topCause = causeEntries[0];
  const maxCause = Math.max(
    1,
    ...causeEntries.map(([, value]) => value)
  );

  const pieEntries = RECORD_MODULE_KEYS.map((key) => ({
    key,
    label: MODULE_LABELS[key],
    value: Number(moduleTotals[key] || 0),
    color: MODULE_COLORS[key] || MODULE_COLORS.review,
  })).filter((item) => item.value > 0);
  const pieTotal = pieEntries.reduce((sum, item) => sum + item.value, 0);

  const byDate = new Map(records.map((record) => [record.date, record]));
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  const targetMinutes = getTodayTargetMinutes(state.settings);
  const maxMinutes = Math.max(
    targetMinutes,
    ...dates.map((date) => {
      const record = byDate.get(date);
      if (!record) return 0;
      return Object.values(record.minutes || {}).reduce(
        (a, b) => a + Number(b || 0),
        0
      );
    }),
    1
  );
  const targetLine = clampPercent((targetMinutes / maxMinutes) * 100);

  const recentRecords = [...records]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  /* ─── 驾驶舱新增数据 ─── */

  
  const dayRecords = dates
    .map((date) => {
      const r = byDate.get(date);
      if (!r) return null;
      const d = new Date(date + "T00:00:00");
      const day = d.getDay();
      const mins = Object.values(r.minutes || {}).reduce(
        (a, b) => a + Number(b || 0),
        0
      );
      return { isWeekend: day === 0 || day === 6, minutes: mins, date };
    })
    .filter(Boolean) as { isWeekend: boolean; minutes: number; date: string }[];

  const weekdayAvg =
    dayRecords.filter((d) => !d.isWeekend).reduce((s, d) => s + d.minutes, 0) /
    Math.max(1, dayRecords.filter((d) => !d.isWeekend).length);
  const weekendAvg =
    dayRecords.filter((d) => d.isWeekend).reduce((s, d) => s + d.minutes, 0) /
    Math.max(1, dayRecords.filter((d) => d.isWeekend).length);

  
  const timeUtilization = clampPercent(
    (stats.avgMinutes / Math.max(1, targetMinutes)) * 100
  );

  
  const completionMap: Record<string, number> = {
    done: 100,
    partial: 60,
    minimum: 30,
    missed: 0,
  };
  const completionTrend = dates.map((date) => {
    const r = byDate.get(date);
    return r ? completionMap[r.completion] ?? 0 : null;
  });

  
  const maxModuleValue = Math.max(1, ...moduleEntries.map((m) => m.value));

  
  const overtimeCount = recentRecords.filter(
    (r) =>
      r.overtimeReason &&
      r.overtimeReason.length > 0 &&
      !r.overtimeReason.includes("没有明显超时")
  ).length;
  const overtimeRate =
    recentRecords.length > 0
      ? Math.round((overtimeCount / recentRecords.length) * 100)
      : 0;

  
  const recordsWithAccuracy = recentRecords.filter(
    (r) => r.accuracy && r.accuracy.length > 0
  );
  const avgAccuracyText =
    recordsWithAccuracy.length > 0
      ? `${Math.round((recordsWithAccuracy.length / recentRecords.length) * 100)}% 有记录`
      : "未记录";

  return (
    <div className="page-grid">
      <section className="stack">
        {/* ─── KPI 驾驶舱 ─── */}
        <div className="dashboard-kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <Calendar size={16} />
              <span>7天学习日</span>
            </div>
            <div className="kpi-value">{stats.recordedDays}<small>/7 天</small></div>
            <div className="kpi-bar">
              <div className="kpi-fill" style={{ width: `${clampPercent((stats.recordedDays / 7) * 100)}%` }} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <Clock size={16} />
              <span>7天投入</span>
            </div>
            <div className="kpi-value">{Math.round(stats.totalMinutes)}<small>min</small></div>
            <div className="kpi-bar">
              <div className="kpi-fill" style={{ width: `${clampPercent((stats.totalMinutes / Math.max(1, target)) * 100)}%` }} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <CheckCircle2 size={16} />
              <span>平均完成</span>
            </div>
            <div className="kpi-value">{Math.round(stats.avgCompletion)}<small>%</small></div>
            <div className="kpi-bar">
              <div className="kpi-fill" style={{ width: `${clampPercent(stats.avgCompletion)}%` }} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <Zap size={16} />
              <span>连续记录</span>
            </div>
            <div className="kpi-value">{stats.streak}<small>天</small></div>
            <div className="kpi-bar">
              <div className="kpi-fill" style={{ width: `${clampPercent((stats.streak / 7) * 100)}%` }} />
            </div>
          </div>
          <div className="kpi-card is-highlight">
            <div className="kpi-header">
              <Gauge size={16} />
              <span>计划健康</span>
            </div>
            <div className="kpi-value">{clampPercent(health.score)}<small>分</small></div>
            <div className="kpi-bar">
              <div className="kpi-fill" style={{ width: `${clampPercent(health.score)}%` }} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <Target size={16} />
              <span>时间效率</span>
            </div>
            <div className="kpi-value">{timeUtilization}<small>%</small></div>
            <div className="kpi-bar">
              <div className="kpi-fill" style={{ width: `${timeUtilization}%` }} />
            </div>
          </div>
        </div>

        {/* ─── 复盘结论 ─── */}
        <section className="panel analysis-brief-panel">
          <div className="section-head">
            <div>
              <h2>复盘结论</h2>
              <p>先给出最该看的判断，再往下看具体图表。</p>
            </div>
          </div>
          <div className="analysis-insight-grid">
            <article className="insight-card is-primary">
              <span>总体判断</span>
              <strong>{health.label}</strong>
              <p>{health.message}</p>
            </article>
            <article className="insight-card">
              <span>投入节奏</span>
              <strong>{paceLabel}</strong>
              <p>
                7 天目标 {Math.round(target)} min，当前{" "}
                {Math.round(stats.totalMinutes)} min，达成 {pacePercent}%。
              </p>
            </article>
            <article className="insight-card">
              <span>时间重心</span>
              <strong>{topModule ? topModule.label : "暂无记录"}</strong>
              <p>
                {topModule
                  ? `${Math.round(topModule.value)} min，占 ${Math.round(
                      (topModule.value / totalModule) * 100
                    )}%。`
                  : "先保存每日记录，才能判断重心。"}
              </p>
            </article>
            <article className="insight-card">
              <span>优先处理</span>
              <strong>
                {topCause
                  ? topCause[0]
                  : quietModule
                  ? `${quietModule.label}偏少`
                  : "继续记录"}
              </strong>
              <p>
                {topCause
                  ? `出现 ${topCause[1]} 次，明天先做同因复盘。`
                  : quietModule
                  ? `${quietModule.label}近 7 天投入较少，确认它是否真的是强项。`
                  : "错因数据还不够，先保持记录。"}
              </p>
            </article>
          </div>
        </section>

        {/* ─── 学习节奏驾驶舱 ─── */}
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>
                <Activity size={18} /> 学习节奏驾驶舱
              </h2>
              <p>看清时间分配规律，找出效率杠杆点。</p>
            </div>
          </div>
          <div className="rhythm-grid">
            <article className="rhythm-card">
              <span>工作日平均</span>
              <strong>{Math.round(weekdayAvg)} min</strong>
              <p>目标 {state.settings.weekdayMinutes} min</p>
              <div className="rhythm-bar">
                <div
                  className="rhythm-fill"
                  style={{
                    width: `${clampPercent((weekdayAvg / Math.max(1, state.settings.weekdayMinutes)) * 100)}%`,
                  }}
                />
              </div>
            </article>
            <article className="rhythm-card">
              <span>周末平均</span>
              <strong>{Math.round(weekendAvg)} min</strong>
              <p>目标 {state.settings.weekendMinutes} min</p>
              <div className="rhythm-bar">
                <div
                  className="rhythm-fill"
                  style={{
                    width: `${clampPercent((weekendAvg / Math.max(1, state.settings.weekendMinutes)) * 100)}%`,
                  }}
                />
              </div>
            </article>
            <article className="rhythm-card">
              <span>日均投入</span>
              <strong>{Math.round(stats.avgMinutes)} min</strong>
              <p>目标 {targetMinutes} min</p>
              <div className="rhythm-bar">
                <div
                  className="rhythm-fill"
                  style={{
                    width: `${clampPercent((stats.avgMinutes / Math.max(1, targetMinutes)) * 100)}%`,
                  }}
                />
              </div>
            </article>
          </div>

          {/* 7 天投入趋势 */}
          <div className="trend-chart" aria-label="最近 7 天学习投入趋势">
            {dates.map((date) => {
              const record = byDate.get(date);
              const minutes = record
                ? Object.values(record.minutes || {}).reduce(
                    (a, b) => a + Number(b || 0),
                    0
                  )
                : 0;
              const height = record
                ? clampPercent((minutes / maxMinutes) * 100)
                : 0;
              return (
                <article
                  key={date}
                  className={`trend-day ${record ? "" : "is-empty"}`}
                >
                  <div className="trend-bar-wrap">
                    <i
                      className="trend-target"
                      style={{ ["--target" as string]: `${targetLine}%` }}
                    />
                    <span
                      className="trend-bar"
                      style={{ ["--height" as string]: `${height}%` }}
                    />
                  </div>
                  <strong>{date.slice(5).replace("-", "/")}</strong>
                  <small>{record ? `${Math.round(minutes)}m` : "缺口"}</small>
                </article>
              );
            })}
          </div>
          <div className="chart-note">
            <span>
              <i className="note-line" />
              每日目标 {Math.round(targetMinutes)} min
            </span>
            <span>低于目标的日期，优先在计划页下调任务切片。</span>
          </div>
        </section>

        {/* ─── 7 天完成度趋势 ─── */}
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>
                <Award size={18} /> 7 天完成度趋势
              </h2>
              <p>每天的任务完成质量，是计划健康的前置指标。</p>
            </div>
          </div>
          <div className="completion-trend">
            {dates.map((date, i) => {
              const val = completionTrend[i];
              const record = byDate.get(date);
              const color =
                val === null
                  ? "#dfe8e3"
                  : val >= 80
                  ? "#3d7757"
                  : val >= 50
                  ? "#b77a20"
                  : "#c44";
              return (
                <div key={date} className="completion-day">
                  <div
                    className="completion-dot"
                    style={{
                      background: color,
                      opacity: record ? 1 : 0.3,
                      transform: `scale(${record ? 1 : 0.7})`,
                    }}
                    title={
                      val !== null
                        ? `完成度 ${val}%`
                        : "未记录"
                    }
                  />
                  <strong>{date.slice(5).replace("-", "/")}</strong>
                  <small>
                    {val !== null
                      ? `${val}%`
                      : "—"}
                  </small>
                </div>
              );
            })}
          </div>
          <div className="chart-note">
            <span>
              <i className="note-line" style={{ background: "#3d7757" }} />
              完成 ≥80%
            </span>
            <span>
              <i className="note-line" style={{ background: "#b77a20" }} />
              完成 50-79%
            </span>
            <span>
              <i className="note-line" style={{ background: "#c44" }} />
              完成 &lt;50%
            </span>
          </div>
        </section>

        {/* ─── 模块投入深度分析 ─── */}
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>
                <BarChart3 size={18} /> 模块投入深度分析
              </h2>
              <p>看清时间重心是否真的压在当前薄弱项上。</p>
            </div>
          </div>
          {pieTotal > 0 ? (
            <div className="analysis-split">
              <div className="module-pie-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <PieChart
                    data={pieEntries.map((item) => ({
                      label: item.label,
                      value: item.value,
                      color: item.color,
                    }))}
                    size={140}
                  />
                </div>
                <ul className="module-pie-legend">
                  {pieEntries.map((item) => (
                    <li key={item.key}>
                      <span>
                        <i
                          style={{ ["--dot" as string]: item.color }}
                        />
                        {item.label}
                      </span>
                      <strong>{Math.round(item.value)} min</strong>
                      <small>
                        {Math.round((item.value / pieTotal) * 100)}%
                      </small>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="module-deep-analysis">
                {/* 模块柱状图 */}
                <div className="module-bar-chart">
                  {moduleEntries.map((item) => (
                    <div key={item.key} className="module-bar-row">
                      <span className="module-bar-label">
                        <i
                          style={{
                            ["--dot" as string]:
                              MODULE_COLORS[item.key] || MODULE_COLORS.review,
                          }}
                        />
                        {item.label}
                      </span>
                      <div className="module-bar-track">
                        <div
                          className="module-bar-fill"
                          style={{
                            width: `${(item.value / maxModuleValue) * 100}%`,
                            background:
                              MODULE_COLORS[item.key] || MODULE_COLORS.review,
                          }}
                        />
                      </div>
                      <span className="module-bar-value">
                        {Math.round(item.value)} min
                      </span>
                    </div>
                  ))}
                </div>
                {/* 模块洞察 */}
                <div className="module-insight-grid">
                  {moduleEntries.map((item) => {
                    const share = Math.round(
                      (item.value / totalModule) * 100
                    );
                    const status =
                      item.value === 0
                        ? "未投入"
                        : share >= 35
                        ? "占比偏高"
                        : "辅助模块";
                    return (
                      <article
                        key={item.key}
                        className="module-insight-card"
                      >
                        <span>
                          <i
                            style={{
                              ["--dot" as string]:
                                MODULE_COLORS[item.key] ||
                                MODULE_COLORS.review,
                            }}
                          />
                          {item.label}
                        </span>
                        <strong>{Math.round(item.value)} min</strong>
                        <small>
                          {share}% · {status}
                        </small>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>还没有模块用时</h3>
              <p>每日记录中填写模块实际用时后，这里会自动生成结构分析。</p>
              <a className="primary-button" href="#/record">
                去记录
              </a>
            </div>
          )}
        </section>

        {/* ─── 错因热力分布 ─── */}
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>
                <AlertTriangle size={18} /> 错因热力分布
              </h2>
              <p>把错因按出现频次排出处理顺序，不只看数量。</p>
            </div>
          </div>
          {causeEntries.length > 0 ? (
            <>
              <div className="cause-heat-chart">
                {causeEntries.map(([cause, value]) => (
                  <div key={cause} className="heat-row">
                    <span className="heat-label">{cause}</span>
                    <div className="heat-track">
                      <div
                        className="heat-fill"
                        style={{
                          width: `${clampPercent((value / maxCause) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="heat-value">{value} 次</span>
                  </div>
                ))}
              </div>
              <ol className="cause-priority-list">
                {causeEntries.map(([cause, value], index) => (
                  <li key={cause} className="cause-priority-card">
                    <span className="cause-rank">{index + 1}</span>
                    <div>
                      <strong>{cause}</strong>
                      <p>{getCauseAction(cause)}</p>
                      <span className="cause-meter">
                        <i
                          style={{
                            ["--value" as string]: `${clampPercent(
                              (value / maxCause) * 100
                            )}%`,
                          }}
                        />
                      </span>
                    </div>
                    <em>{value} 次</em>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className="empty-state">
              <h3>还没有错因数据</h3>
              <p>每日记录中选择错误原因后，这里会按原因输出处理优先级。</p>
              <a className="primary-button" href="#/record">
                去记录
              </a>
            </div>
          )}
        </section>

        {/* ─── 学习质量指标 ─── */}
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>
                <Zap size={18} /> 学习质量指标
              </h2>
              <p>从正确率和超时频率判断学习质量。</p>
            </div>
          </div>
          <div className="quality-grid">
            <article className="quality-card">
              <span>正确率记录率</span>
              <strong>{avgAccuracyText}</strong>
              <p>建议每次记录时填写正确率，方便追踪。</p>
            </article>
            <article className="quality-card">
              <span>超时频率</span>
              <strong>{overtimeRate}%</strong>
              <p>
                {overtimeRate > 30
                  ? "超时频率较高，建议检查任务量是否合理。"
                  : overtimeRate > 10
                  ? "偶尔超时，属于正常范围。"
                  : "时间控制良好，保持节奏。"}
              </p>
            </article>
            <article className="quality-card">
              <span>任务断档</span>
              <strong>{stats.gapDays} 天</strong>
              <p>
                {stats.gapDays > 2
                  ? "断档较多，建议降低每日任务量以保证连续性。"
                  : stats.gapDays > 0
                  ? "少量断档，注意保持节奏。"
                  : "连续 7 天无断档，节奏优秀。"}
              </p>
            </article>
          </div>
        </section>

        {/* ─── 调整建议 ─── */}
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>
                <Lightbulb size={18} /> 调整建议
              </h2>
              <p>下一次修改计划时优先处理这些问题。</p>
            </div>
          </div>
          {suggestions.length > 0 ? (
            <div className="action-card-list">
              {suggestions.map((item, index) => (
                <article key={index} className="action-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                  <ChevronRight size={16} className="action-arrow" />
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">暂无建议，继续保持记录。</p>
          )}
        </section>
      </section>

      {/* ─── 侧边栏 ─── */}
      <aside className="stack">
        <section className="card">
          <div className="section-head">
            <div>
              <h3>计划健康</h3>
              <p>{health.message}</p>
            </div>
          </div>
          <div className="health-gauge-card">
            <div
              className="health-ring"
              style={{
                ["--score" as string]: `${clampPercent(health.score)}%`,
              }}
              role="img"
              aria-label={`计划健康 ${clampPercent(health.score)} 分`}
            >
              <span>
                <strong>{clampPercent(health.score)}</strong>
                <small>health</small>
              </span>
            </div>
            <div className="health-facts">
              <p>
                <strong>{health.label}</strong>
              </p>
              <small>
                {stats.recordedDays}/7 天已记录 · 平均完成{" "}
                {Math.round(stats.avgCompletion)}%
              </small>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h3>记录缺口</h3>
              <p>
                {stats.gapDays > 0
                  ? `最近 7 天缺少 ${stats.gapDays} 天记录。`
                  : "最近 7 天记录完整。"}
              </p>
            </div>
          </div>
          <div className="gap-week">
            {dates.map((date) => {
              const record = byDate.get(date);
              const isGap = !record;
              const parsed = new Date(date + "T00:00:00");
              const weekDay =
                ["日", "一", "二", "三", "四", "五", "六"][
                  parsed.getDay()
                ];
              return (
                <span
                  key={date}
                  className={isGap ? "is-gap" : "is-recorded"}
                >
                  <strong>{weekDay}</strong>
                  <small>{date.slice(5).replace("-", "/")}</small>
                </span>
              );
            })}
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h3>最近记录</h3>
              <p>用于快速回看。</p>
            </div>
          </div>
          {recentRecords.length > 0 ? (
            <ul className="list record-history-list">
              {recentRecords.map((record) => {
                const accuracy = record.accuracy || "未填正确率";
                const causes = record.causes || [];
                const mins = Object.values(record.minutes || {}).reduce(
                  (a, b) => a + Number(b || 0),
                  0
                );
                return (
                  <li
                    key={record.id}
                    className="list-item history-card"
                  >
                    <div className="history-main">
                      <strong>{record.date}</strong>
                      <p className="muted">
                        {mins} 分钟 ·{" "}
                        {record.completion === "done"
                          ? "完成"
                          : record.completion === "partial"
                          ? "部分"
                          : record.completion === "minimum"
                          ? "保底"
                          : "断档"}
                        · {accuracy}
                      </p>
                      {causes.length > 0 && (
                        <div className="tag-row">
                          {causes.slice(0, 3).map((cause) => (
                            <span key={cause} className="tag">
                              {cause}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">暂无记录。</p>
          )}
        </section>
      </aside>
    </div>
  );
}
