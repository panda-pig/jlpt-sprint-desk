import { useNavigate } from "react-router-dom";
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
import { Button, Card, Title, Divider } from "animal-island-ui";
import { useStudyDesk } from "../lib/studyDeskContext";
import {
  MODULE_COLORS,
  RECORD_MODULE_KEYS,
} from "../lib/constants";
import { getTodayTargetMinutes } from "../lib/planner";
import { clampPercent } from "../lib/utils";
import { PieChart } from "../components/Charts";
import { useLocale } from "../i18n/LocaleProvider";
import { t as gt, moduleLabel } from "../i18n";

function getCauseAction(cause: string): string {
  const key = `causeAction.${cause}`;
  const mapped = gt(key);
  return mapped === key ? gt("causeAction._default") : mapped;
}

export function AnalysisPage() {
  const navigate = useNavigate();
  const {
    state,
    health,
    stats,
    suggestions,
    moduleTotals,
    causeCounts,
  } = useStudyDesk();
  const { t, tOption } = useLocale();

  const records = state.records;

  if (!records.length) {
    return (
      <div className="page-grid">
        <section className="stack">
          <div className="empty-state">
            <h3>{t("analysis.emptyTitle")}</h3>
            <p>{t("analysis.emptyDesc")}</p>
            <Button type="primary" onClick={() => navigate("/record")}>
              {t("analysis.recordToday")}
            </Button>
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
    pacePercent >= 90 ? t("analysis.paceClose") : pacePercent >= 60 ? t("analysis.paceCatchUp") : t("analysis.paceLow");

  const moduleEntries = RECORD_MODULE_KEYS.map((key) => ({
    key,
    label: moduleLabel(key),
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
    label: moduleLabel(key),
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
      !r.overtimeReason.includes("没有明显超时") &&
      !r.overtimeReason.includes("No notable overtime")
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
      ? t("analysis.avgAccuracyHasRecord", { n: Math.round((recordsWithAccuracy.length / recentRecords.length) * 100) })
      : t("analysis.notRecorded");

  return (
    <div className="page-grid">
      <section className="stack">
        {/* ─── KPI 驾驶舱 ─── */}
        <div className="dashboard-kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <Calendar size={16} />
              <span>{t("analysis.kpiStudyDays")}</span>
            </div>
            <div className="kpi-value">{stats.recordedDays}<small>{t("analysis.kpiUnit7days")}</small></div>
            <div className="kpi-bar">
              <div className="kpi-fill" style={{ width: `${clampPercent((stats.recordedDays / 7) * 100)}%` }} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <Clock size={16} />
              <span>{t("analysis.kpiInvest")}</span>
            </div>
            <div className="kpi-value">{Math.round(stats.totalMinutes)}<small>min</small></div>
            <div className="kpi-bar">
              <div className="kpi-fill" style={{ width: `${clampPercent((stats.totalMinutes / Math.max(1, target)) * 100)}%` }} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <CheckCircle2 size={16} />
              <span>{t("analysis.kpiAvgComplete")}</span>
            </div>
            <div className="kpi-value">{Math.round(stats.avgCompletion)}<small>%</small></div>
            <div className="kpi-bar">
              <div className="kpi-fill" style={{ width: `${clampPercent(stats.avgCompletion)}%` }} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <Zap size={16} />
              <span>{t("analysis.kpiStreak")}</span>
            </div>
            <div className="kpi-value">{stats.streak}<small>{t("analysis.kpiStreakUnit")}</small></div>
            <div className="kpi-bar">
              <div className="kpi-fill" style={{ width: `${clampPercent((stats.streak / 7) * 100)}%` }} />
            </div>
          </div>
          <div className="kpi-card is-highlight">
            <div className="kpi-header">
              <Gauge size={16} />
              <span>{t("analysis.kpiHealth")}</span>
            </div>
            <div className="kpi-value">{clampPercent(health.score)}<small>{t("analysis.kpiHealthUnit")}</small></div>
            <div className="kpi-bar">
              <div className="kpi-fill" style={{ width: `${clampPercent(health.score)}%` }} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <Target size={16} />
              <span>{t("analysis.kpiEfficiency")}</span>
            </div>
            <div className="kpi-value">{timeUtilization}<small>%</small></div>
            <div className="kpi-bar">
              <div className="kpi-fill" style={{ width: `${timeUtilization}%` }} />
            </div>
          </div>
        </div>

        {/* ─── 复盘结论 ─── */}
        <Card className="panel analysis-brief-panel">
          <div className="section-head">
            <div>
              <Title size="small" color="app-teal">{t("analysis.briefTitle")}</Title>
              <p>{t("analysis.briefDesc")}</p>
            </div>
          </div>
          <div className="analysis-insight-grid">
            <article className="insight-card is-primary">
              <span>{t("analysis.overallJudge")}</span>
              <strong>{health.label}</strong>
              <p>{health.message}</p>
            </article>
            <article className="insight-card">
              <span>{t("analysis.pace")}</span>
              <strong>{paceLabel}</strong>
              <p>{t("analysis.paceDetail", { target: Math.round(target), current: Math.round(stats.totalMinutes), percent: pacePercent })}</p>
            </article>
            <article className="insight-card">
              <span>{t("analysis.timeCenter")}</span>
              <strong>{topModule ? topModule.label : t("analysis.noRecordYet")}</strong>
              <p>
                {topModule
                  ? t("analysis.timeCenterDetail", { min: Math.round(topModule.value), share: Math.round((topModule.value / totalModule) * 100) })
                  : t("analysis.timeCenterEmpty")}
              </p>
            </article>
            <article className="insight-card">
              <span>{t("analysis.priority")}</span>
              <strong>
                {topCause
                  ? tOption("errorCause", topCause[0])
                  : quietModule
                  ? t("analysis.quietLow", { label: quietModule.label })
                  : t("analysis.continueRecord")}
              </strong>
              <p>
                {topCause
                  ? t("analysis.priorityDetailCause", { n: topCause[1] })
                  : quietModule
                  ? t("analysis.priorityDetailQuiet", { label: quietModule.label })
                  : t("analysis.priorityDetailEmpty")}
              </p>
            </article>
          </div>
        </Card>

        <Divider type="line-teal" />

        {/* ─── 学习节奏驾驶舱 ─── */}
        <Card className="panel">
          <div className="section-head">
            <div>
              <Title size="small" color="app-teal">
                <Activity size={18} /> {t("analysis.rhythmTitle")}
              </Title>
              <p>{t("analysis.rhythmDesc")}</p>
            </div>
          </div>
          <div className="rhythm-grid">
            <article className="rhythm-card">
              <span>{t("analysis.weekdayAvg")}</span>
              <strong>{Math.round(weekdayAvg)} min</strong>
              <p>{t("analysis.goalMin", { n: state.settings.weekdayMinutes })}</p>
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
              <span>{t("analysis.weekendAvg")}</span>
              <strong>{Math.round(weekendAvg)} min</strong>
              <p>{t("analysis.goalMin", { n: state.settings.weekendMinutes })}</p>
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
              <span>{t("analysis.dailyAvg")}</span>
              <strong>{Math.round(stats.avgMinutes)} min</strong>
              <p>{t("analysis.goalMin", { n: targetMinutes })}</p>
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
          <div className="trend-chart" aria-label={t("analysis.trend7Aria")}>
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
                  <small>{record ? `${Math.round(minutes)}m` : t("analysis.gap")}</small>
                </article>
              );
            })}
          </div>
          <div className="chart-note">
            <span>
              <i className="note-line" />
              {t("analysis.dailyGoalMin", { n: Math.round(targetMinutes) })}
            </span>
            <span>{t("analysis.trendNote")}</span>
          </div>
        </Card>

        {/* ─── 7 天完成度趋势 ─── */}
        <Card className="panel">
          <div className="section-head">
            <div>
              <Title size="small" color="app-teal">
                <Award size={18} /> {t("analysis.completionTrend")}
              </Title>
              <p>{t("analysis.completionTrendDesc")}</p>
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
                        ? t("analysis.completionTitle", { n: val })
                        : t("analysis.notRecorded")
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
              {t("analysis.complete80")}
            </span>
            <span>
              <i className="note-line" style={{ background: "#b77a20" }} />
              {t("analysis.complete50")}
            </span>
            <span>
              <i className="note-line" style={{ background: "#c44" }} />
              {t("analysis.completeLow")}
            </span>
          </div>
        </Card>

        {/* ─── 模块投入深度分析 ─── */}
        <Card className="panel">
          <div className="section-head">
            <div>
              <Title size="small" color="app-teal">
                <BarChart3 size={18} /> {t("analysis.moduleDeep")}
              </Title>
              <p>{t("analysis.moduleDeepDesc")}</p>
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
                        ? t("analysis.statusNoInvest")
                        : share >= 35
                        ? t("analysis.statusHigh")
                        : t("analysis.statusAux");
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
              <h3>{t("analysis.noModuleTime")}</h3>
              <p>{t("analysis.noModuleTimeDesc")}</p>
              <Button type="primary" onClick={() => navigate("/record")}>
                {t("analysis.goRecord")}
              </Button>
            </div>
          )}
        </Card>

        <Divider type="line-teal" />

        {/* ─── 错因热力分布 ─── */}
        <Card className="panel">
          <div className="section-head">
            <div>
              <Title size="small" color="app-orange">
                <AlertTriangle size={18} /> {t("analysis.causeHeat")}
              </Title>
              <p>{t("analysis.causeHeatDesc")}</p>
            </div>
          </div>
          {causeEntries.length > 0 ? (
            <>
              <div className="cause-heat-chart">
                {causeEntries.map(([cause, value]) => (
                  <div key={cause} className="heat-row">
                    <span className="heat-label">{tOption("errorCause", cause)}</span>
                    <div className="heat-track">
                      <div
                        className="heat-fill"
                        style={{
                          width: `${clampPercent((value / maxCause) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="heat-value">{t("analysis.timesUnit", { n: value })}</span>
                  </div>
                ))}
              </div>
              <ol className="cause-priority-list">
                {causeEntries.map(([cause, value], index) => (
                  <li key={cause} className="cause-priority-card">
                    <span className="cause-rank">{index + 1}</span>
                    <div>
                      <strong>{tOption("errorCause", cause)}</strong>
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
                    <em>{t("analysis.timesUnit", { n: value })}</em>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className="empty-state">
              <h3>{t("analysis.noCause")}</h3>
              <p>{t("analysis.noCauseDesc")}</p>
              <Button type="primary" onClick={() => navigate("/record")}>
                {t("analysis.goRecord")}
              </Button>
            </div>
          )}
        </Card>

        {/* ─── 学习质量指标 ─── */}
        <Card className="panel">
          <div className="section-head">
            <div>
              <Title size="small" color="app-yellow">
                <Zap size={18} /> {t("analysis.quality")}
              </Title>
              <p>{t("analysis.qualityDesc")}</p>
            </div>
          </div>
          <div className="quality-grid">
            <article className="quality-card">
              <span>{t("analysis.accuracyRate")}</span>
              <strong>{avgAccuracyText}</strong>
              <p>{t("analysis.accuracyTip")}</p>
            </article>
            <article className="quality-card">
              <span>{t("analysis.overtimeFreq")}</span>
              <strong>{overtimeRate}%</strong>
              <p>
                {overtimeRate > 30
                  ? t("analysis.overtimeHigh")
                  : overtimeRate > 10
                  ? t("analysis.overtimeMid")
                  : t("analysis.overtimeLow")}
              </p>
            </article>
            <article className="quality-card">
              <span>{t("analysis.taskGap")}</span>
              <strong>{t("analysis.gapUnit", { n: stats.gapDays })}</strong>
              <p>
                {stats.gapDays > 2
                  ? t("analysis.gapHigh")
                  : stats.gapDays > 0
                  ? t("analysis.gapMid")
                  : t("analysis.gapNone2")}
              </p>
            </article>
          </div>
        </Card>

        {/* ─── 调整建议 ─── */}
        <Card className="panel">
          <div className="section-head">
            <div>
              <Title size="small" color="app-green">
                <Lightbulb size={18} /> {t("analysis.adjustSuggest")}
              </Title>
              <p>{t("analysis.adjustDesc")}</p>
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
            <p className="muted">{t("analysis.noSuggest")}</p>
          )}
        </Card>
      </section>

      {/* ─── 侧边栏 ─── */}
      <aside className="stack">
        <Card className="card">
          <div className="section-head">
            <div>
              <h3>{t("analysis.planHealth")}</h3>
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
              aria-label={t("analysis.healthAria", { n: clampPercent(health.score) })}
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
              <small>{t("analysis.recordedComplete", { days: stats.recordedDays, avg: Math.round(stats.avgCompletion) })}</small>
            </div>
          </div>
          {health.factors.length > 0 && (
            <details className="score-why">
              <summary>{t("common.whyScore")}</summary>
              <ul>
                {health.factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </details>
          )}
        </Card>

        <Card className="card">
          <div className="section-head">
            <div>
              <h3>{t("analysis.recordGap")}</h3>
              <p>
                {stats.gapDays > 0
                  ? t("analysis.gapSome", { n: stats.gapDays })
                  : t("analysis.gapNone")}
              </p>
            </div>
          </div>
          <div className="gap-week">
            {dates.map((date) => {
              const record = byDate.get(date);
              const isGap = !record;
              const parsed = new Date(date + "T00:00:00");
              const weekDay = t("analysis.weekdayShort").split(",")[parsed.getDay()];
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
        </Card>

        <Card className="card">
          <div className="section-head">
            <div>
              <h3>{t("analysis.recent")}</h3>
              <p>{t("analysis.recentDesc")}</p>
            </div>
          </div>
          {recentRecords.length > 0 ? (
            <ul className="list record-history-list">
              {recentRecords.map((record) => {
                const accuracy = record.accuracy || t("analysis.noAccuracy");
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
                        {t("analysis.minUnit", { n: mins })} ·{" "}
                        {record.completion === "done"
                          ? t("analysis.compDone")
                          : record.completion === "partial"
                          ? t("analysis.compPartial")
                          : record.completion === "minimum"
                          ? t("analysis.compMin")
                          : t("analysis.compMissed")}
                        · {accuracy}
                      </p>
                      {causes.length > 0 && (
                        <div className="tag-row">
                          {causes.slice(0, 3).map((cause) => (
                            <span key={cause} className="tag">
                              {tOption("errorCause", cause)}
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
            <p className="muted">{t("analysis.noRecords")}</p>
          )}
        </Card>
      </aside>
    </div>
  );
}
