import { BarChart3, Lightbulb, TrendingUp, Activity } from "lucide-react";
import { useStudyDesk } from "../lib/studyDeskContext";
import { MODULE_COLORS, MODULE_LABELS, RECORD_MODULE_KEYS } from "../lib/constants";
import { getTodayTargetMinutes } from "../lib/planner";
import { clampPercent } from "../lib/utils";
import { PieChart } from "../components/Charts";

function getCauseAction(cause: string): string {
  const actions: Record<string, string> = {
    "词义差别": "把相近词放进同一张对照表，只用例句区分语感。",
    "固定搭配": "明天先复盘固定搭配错词，再进入新词。",
    "接续形式": "每个错句型保留接续、例句和一个自造句。",
    "定位慢": "阅读改成限时定位训练，只找题干关键词和转折句。",
    "听漏关键词": "听力重听错题，记录人物、任务、转折和结论。",
    "时间不够": "下一轮减少新内容，把题组全部加计时。",
    "复盘不足": "每天开始前先回看昨日错题，限制在 10-15 分钟。",
    "任务过量": "计划页下调新学量，保留主攻模块和最低复盘。",
  };
  return actions[cause] || "先把这个原因对应的错题集中二刷，再决定是否加量。";
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
            <p>保存至少一条每日记录后，这里会显示 7 天趋势、模块投入、错误原因和计划健康建议。</p>
            <a className="primary-button" href="#/record">去记录今天</a>
          </div>
        </section>
      </div>
    );
  }

  const target = getTodayTargetMinutes(state.settings) * 7;
  const pacePercent = clampPercent((stats.totalMinutes / Math.max(1, target)) * 100);
  const paceLabel = pacePercent >= 90 ? "接近目标" : pacePercent >= 60 ? "需要补齐" : "节奏偏低";

  const moduleEntries = RECORD_MODULE_KEYS.map((key) => ({
    key,
    label: MODULE_LABELS[key],
    value: Number(moduleTotals[key] || 0),
  })).sort((a, b) => b.value - a.value);
  const totalModule = Math.max(1, moduleEntries.reduce((sum, item) => sum + item.value, 0));
  const topModule = moduleEntries.find((item) => item.value > 0);
  const quietModule = [...moduleEntries].reverse().find((item) => item.value <= Math.max(15, totalModule * 0.08));

  const causeEntries = Object.entries(causeCounts).sort((a, b) => b[1] - a[1]);
  const topCause = causeEntries[0];
  const maxCause = Math.max(1, ...causeEntries.map(([, value]) => value));

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
  const maxMinutes = Math.max(targetMinutes, ...dates.map((date) => {
    const record = byDate.get(date);
    if (!record) return 0;
    return Object.values(record.minutes || {}).reduce((a, b) => a + Number(b || 0), 0);
  }), 1);
  const targetLine = clampPercent((targetMinutes / maxMinutes) * 100);

  const recentRecords = [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);

  return (
    <div className="page-grid">
      <section className="stack">
        <div className="four-col">
          <div className="card metric-card">
            <div>
              <p className="metric-label">7天学习日</p>
              <p className="metric-value">{stats.recordedDays} <small>days</small></p>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ ["--value" as string]: `${clampPercent((stats.recordedDays / 7) * 100)}%` }} />
            </div>
          </div>
          <div className="card metric-card">
            <div>
              <p className="metric-label">7天投入</p>
              <p className="metric-value">{Math.round(stats.totalMinutes)} <small>min</small></p>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ ["--value" as string]: `${clampPercent((stats.totalMinutes / Math.max(1, target)) * 100)}%` }} />
            </div>
          </div>
          <div className="card metric-card">
            <div>
              <p className="metric-label">平均完成</p>
              <p className="metric-value">{Math.round(stats.avgCompletion)} <small>%</small></p>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ ["--value" as string]: `${clampPercent(stats.avgCompletion)}%` }} />
            </div>
          </div>
          <div className="card metric-card">
            <div>
              <p className="metric-label">连续记录</p>
              <p className="metric-value">{stats.streak} <small>days</small></p>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ ["--value" as string]: `${clampPercent((stats.streak / 7) * 100)}%` }} />
            </div>
          </div>
        </div>

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
              <p>7 天目标 {Math.round(target)} min，当前 {Math.round(stats.totalMinutes)} min，达成 {pacePercent}%。</p>
            </article>
            <article className="insight-card">
              <span>时间重心</span>
              <strong>{topModule ? topModule.label : "暂无记录"}</strong>
              <p>{topModule ? `${Math.round(topModule.value)} min，占 ${Math.round((topModule.value / totalModule) * 100)}%。` : "先保存每日记录，才能判断重心。"}</p>
            </article>
            <article className="insight-card">
              <span>优先处理</span>
              <strong>{topCause ? topCause[0] : quietModule ? `${quietModule.label}偏少` : "继续记录"}</strong>
              <p>{topCause ? `出现 ${topCause[1]} 次，明天先做同因复盘。` : quietModule ? `${quietModule.label}近 7 天投入较少，确认它是否真的是强项。` : "错因数据还不够，先保持记录。"}</p>
            </article>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <h2><TrendingUp size={18} /> 7 天投入趋势</h2>
              <p>按真实记录显示每天投入，缺口和目标差距会直接暴露出来。</p>
            </div>
          </div>
          <div className="trend-chart" aria-label="最近 7 天学习投入趋势">
            {dates.map((date) => {
              const record = byDate.get(date);
              const minutes = record ? Object.values(record.minutes || {}).reduce((a, b) => a + Number(b || 0), 0) : 0;
              const height = record ? clampPercent((minutes / maxMinutes) * 100) : 0;
              return (
                <article key={date} className={`trend-day ${record ? "" : "is-empty"}`}>
                  <div className="trend-bar-wrap">
                    <i className="trend-target" style={{ ["--target" as string]: `${targetLine}%` }} />
                    <span className="trend-bar" style={{ ["--height" as string]: `${height}%` }} />
                  </div>
                  <strong>{date.slice(5).replace("-", "/")}</strong>
                  <small>{record ? `${Math.round(minutes)}m` : "缺口"}</small>
                </article>
              );
            })}
          </div>
          <div className="chart-note">
            <span><i className="note-line" />每日目标 {Math.round(targetMinutes)} min</span>
            <span>低于目标的日期，优先在计划页下调任务切片。</span>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <h2><BarChart3 size={18} /> 模块时间结构</h2>
              <p>看清时间重心是否真的压在当前薄弱项上。</p>
            </div>
          </div>
          {pieTotal > 0 ? (
            <div className="analysis-split">
              <div className="module-pie-card">
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  <PieChart data={pieEntries.map(item => ({ label: item.label, value: item.value, color: item.color }))} size={140} />
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
              <div className="module-insight-grid">
                {moduleEntries.map((item) => {
                  const share = Math.round((item.value / totalModule) * 100);
                  const status = item.value === 0 ? "未投入" : share >= 35 ? "占比偏高" : "辅助模块";
                  return (
                    <article key={item.key} className="module-insight-card">
                      <span><i style={{ ["--dot" as string]: MODULE_COLORS[item.key] || MODULE_COLORS.review }} />{item.label}</span>
                      <strong>{Math.round(item.value)} min</strong>
                      <small>{share}% · {status}</small>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>还没有模块用时</h3>
              <p>每日记录中填写模块实际用时后，这里会自动生成结构分析。</p>
              <a className="primary-button" href="#/record">去记录</a>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <h2><Activity size={18} /> 错误原因优先级</h2>
              <p>把错因按出现频次排出处理顺序，不只看数量。</p>
            </div>
          </div>
          {causeEntries.length > 0 ? (
            <ol className="cause-priority-list">
              {causeEntries.map(([cause, value], index) => (
                <li key={cause} className="cause-priority-card">
                  <span className="cause-rank">{index + 1}</span>
                  <div>
                    <strong>{cause}</strong>
                    <p>{getCauseAction(cause)}</p>
                    <span className="cause-meter"><i style={{ ["--value" as string]: `${clampPercent((value / maxCause) * 100)}%` }} /></span>
                  </div>
                  <em>{value} 次</em>
                </li>
              ))}
            </ol>
          ) : (
            <div className="empty-state">
              <h3>还没有错因数据</h3>
              <p>每日记录中选择错误原因后，这里会按原因输出处理优先级。</p>
              <a className="primary-button" href="#/record">去记录</a>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <h2><Lightbulb size={18} /> 调整建议</h2>
              <p>下一次修改计划时优先处理这些问题。</p>
            </div>
          </div>
          {suggestions.length > 0 ? (
            <div className="action-card-list">
              {suggestions.map((item, index) => (
                <article key={index} className="action-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">暂无建议，继续保持记录。</p>
          )}
        </section>
      </section>

      <aside className="stack">
        <section className="card">
          <div className="section-head">
            <div>
              <h3>计划健康</h3>
              <p>{health.message}</p>
            </div>
          </div>
          <div className="health-gauge-card">
            <div className="health-ring" style={{ ["--score" as string]: `${clampPercent(health.score)}%` }} role="img" aria-label={`计划健康 ${clampPercent(health.score)} 分`}>
              <span>
                <strong>{clampPercent(health.score)}</strong>
                <small>health</small>
              </span>
            </div>
            <div className="health-facts">
              <p><strong>{health.label}</strong></p>
              <small>{stats.recordedDays}/7 天已记录 · 平均完成 {Math.round(stats.avgCompletion)}%</small>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h3>记录缺口</h3>
              <p>{stats.gapDays > 0 ? `最近 7 天缺少 ${stats.gapDays} 天记录。` : "最近 7 天记录完整。"}</p>
            </div>
          </div>
          <div className="gap-week">
            {dates.map((date) => {
              const record = byDate.get(date);
              const isGap = !record;
              const parsed = new Date(date);
              const weekDay = ["日", "一", "二", "三", "四", "五", "六"][parsed.getDay()];
              return (
                <span key={date} className={isGap ? "is-gap" : "is-recorded"}>
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
                const mins = Object.values(record.minutes || {}).reduce((a, b) => a + Number(b || 0), 0);
                return (
                  <li key={record.id} className="list-item history-card">
                    <div className="history-main">
                      <strong>{record.date}</strong>
                      <p className="muted">{mins} 分钟 · {record.completion === "done" ? "完成" : record.completion === "partial" ? "部分" : record.completion === "minimum" ? "保底" : "断档"} · {accuracy}</p>
                      {causes.length > 0 && (
                        <div className="tag-row">
                          {causes.slice(0, 3).map((cause) => (
                            <span key={cause} className="tag">{cause}</span>
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
