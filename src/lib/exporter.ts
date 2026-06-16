import type { GeneratedPlan, PlanSettings, StudyRecord } from "./types";
import { RECORD_MODULE_KEYS } from "./constants";
import { escapeHtml, todayISO } from "./utils";
import { getRecordMinutes } from "./utils";
import { t, tOption, moduleLabel, phaseLabel, getLocale } from "../i18n";
import { CURRENT_SCHEMA_VERSION } from "./migrations";

function daysLeftText(daysLeft: number | null): string {
  return daysLeft === null ? t("export.docNotSet") : t("export.docDays", { n: daysLeft });
}

export function buildMarkdown(plan: GeneratedPlan, records: StudyRecord[], profileName: string): string {
  const todayRecord = records.find((r) => r.date === todayISO());
  const lines: string[] = [
    `# ${t("export.docPlanTitle", { level: plan.level })}`,
    "",
    `> ${t("export.docMeta", { name: profileName, date: plan.generatedAt.slice(0, 10) })}`,
    "",
    `## ${t("export.docOverview")}`,
    "",
    `- ${t("export.docTargetLevel")}: ${plan.level}`,
    `- ${t("export.docExamDate")}: ${plan.examDate || t("export.docNotSet")}`,
    `- ${t("export.docDaysLeft")}: ${daysLeftText(plan.daysLeft)}`,
    `- ${t("export.docPhase")}: ${phaseLabel(plan.phase)}`,
    `- ${t("export.docHealth")}: ${tOption("budgetStatus", plan.studyBudget.status)} / ${tOption("timeStatus", plan.studyBudget.timeStatus)}`,
    `- ${t("export.docStrategy")}: ${plan.strategy.summary}`,
    "",
    `## ${t("export.docTodayTasks")}`,
    "",
  ];

  plan.todayTasks.forEach((task, index) => {
    lines.push(`${index + 1}. **${moduleLabel(task.module)}** · ${t("export.docMinutes", { n: task.minutes })}`);
    lines.push(`   - ${task.text}`);
    lines.push("");
  });

  lines.push(`## ${t("export.docMinimumPlan")}`);
  lines.push("");
  plan.minimumPlan.forEach((item) => {
    lines.push(`- ${item}`);
  });

  lines.push("", `## ${t("export.docRoadmap")}`);
  lines.push("");
  plan.roadmap.forEach((item) => {
    lines.push(`### ${phaseLabel(item.title)}（${item.dayRange}）`);
    lines.push(`- ${t("export.docFocus")}: ${item.focus}`);
    lines.push(`- ${t("export.docMethod")}: ${item.method}`);
    lines.push("");
  });

  lines.push(`## ${t("export.docDetail14")}`);
  lines.push("");
  plan.dailyPlan.slice(0, 14).forEach((day) => {
    lines.push(`### ${day.label} · ${day.date} · ${day.weekday}`);
    lines.push(`> ${day.title} · ${phaseLabel(day.phase)} · ${t("export.docMinutes", { n: day.totalMinutes })}`);
    lines.push("");
    day.tasks.forEach((task) => {
      lines.push(`- **${moduleLabel(task.module)}** (${task.minutes}min)：${task.text}`);
    });
    lines.push("");
    if (todayRecord && day.date === todayISO()) {
      lines.push(`> ${t("export.docTodayRecord", { status: tOption("completion", todayRecord.completion) })}`);
      lines.push("");
    }
  });

  lines.push(`## ${t("export.docCauseTemplate")}`);
  lines.push("");
  lines.push(`| ${t("export.docColDate")} | ${t("export.docColModule")} | ${t("export.docColCause")} | ${t("export.docColSolution")} |`);
  lines.push("|------|------|------|----------|");
  records.slice(-7).forEach((record) => {
    (record.causes || []).forEach((cause) => {
      const mods = record.minutes
        ? Object.entries(record.minutes).filter(([, v]) => v > 0).map(([k]) => moduleLabel(k)).join(", ")
        : "-";
      lines.push(`| ${record.date} | ${mods} | ${tOption("errorCause", cause)} | |`);
    });
  });

  return lines.join("\n");
}

export function buildCsv(plan: GeneratedPlan): string {
  const headers = ["dayIndex", "date", "weekday", "phase", "module", "task", "minutes", "status"];
  const rows: string[] = [headers.join(",")];

  plan.dailyPlan.forEach((day) => {
    day.tasks.forEach((task) => {
      rows.push([
        day.dayIndex,
        day.date,
        day.weekday,
        day.phase,
        task.module,
        `"${(task.title || moduleLabel(task.module)).replace(/"/g, '""')}"`,
        task.minutes,
        "",
      ].join(","));
    });
  });

  return rows.join("\n");
}

export function buildReport(plan: GeneratedPlan, records: StudyRecord[], profileName: string): string {
  const recentRecords = records.slice(-7);
  const totalMinutes = recentRecords.reduce((sum, r) => sum + getRecordMinutes(r), 0);
  const avgMinutes = recentRecords.length ? Math.round(totalMinutes / recentRecords.length) : 0;
  const completions = recentRecords.map((r) => {
    const map: Record<string, number> = { done: 100, partial: 60, minimum: 30, missed: 0 };
    return map[r.completion] || 0;
  });
  const avgCompletion = completions.length ? Math.round(completions.reduce((a, b) => a + b, 0) / completions.length) : 0;

  const moduleTotals: Record<string, number> = {};
  RECORD_MODULE_KEYS.forEach((key) => { moduleTotals[key] = 0; });
  recentRecords.forEach((record) => {
    RECORD_MODULE_KEYS.forEach((key) => {
      moduleTotals[key] += Number(record.minutes?.[key] || 0);
    });
  });

  const causeCounts: Record<string, number> = {};
  recentRecords.forEach((record) => {
    (record.causes || []).forEach((cause) => {
      causeCounts[cause] = (causeCounts[cause] || 0) + 1;
    });
  });

  const topCauses = Object.entries(causeCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const isEn = getLocale() === "en";
  const reportDate = new Intl.DateTimeFormat(isEn ? "en-US" : "zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date());

  const metricsHtml = [
    { label: t("export.docMStudyDays"), value: t("export.docDays", { n: recentRecords.length }) },
    { label: t("export.docMTotalTime"), value: t("export.docMinutes", { n: totalMinutes }) },
    { label: t("export.docMAvgDay"), value: t("export.docMinutes", { n: avgMinutes }) },
    { label: t("export.docMAvgCompletion"), value: `${avgCompletion}%` },
  ]
    .map((m) => `<div class="metric"><span>${m.label}</span><strong>${m.value}</strong></div>`)
    .join("");

  const moduleHtml = Object.entries(moduleTotals)
    .filter(([, minutes]) => minutes > 0)
    .map(([key, minutes]) => `<p><strong>${moduleLabel(key)}</strong>${t("export.docMinutes", { n: minutes })}</p>`)
    .join("") || `<p>${t("export.docNoModule")}</p>`;

  const causeHtml = topCauses.length
    ? topCauses.map(([cause, count]) => `<span>${escapeHtml(tOption("errorCause", cause))}<b>${count}</b></span>`).join("")
    : `<span>${escapeHtml(t("export.docNoCauseTag"))}<b>0</b></span>`;

  const suggestions: string[] = [];
  if (avgCompletion < 70) suggestions.push(t("export.docSgLowCompletion"));
  if (avgMinutes < plan.studyBudget.dailyMinutes * 0.7) suggestions.push(t("export.docSgLowTime"));
  if (!topCauses.length) suggestions.push(t("export.docSgNoCause"));
  if (avgCompletion >= 70 && avgMinutes >= plan.studyBudget.dailyMinutes * 0.7) suggestions.push(t("export.docSgGood"));

  const suggestionsHtml = suggestions.map((s) => `<li>${escapeHtml(s)}</li>`).join("");

  const todayTasksHtml = plan.todayTasks
    .map((task, i) => `
      <article class="task-item">
        <div><small>${String(i + 1).padStart(2, "0")}</small><strong>${task.minutes} min</strong></div>
        <p>${escapeHtml(moduleLabel(task.module))}：${escapeHtml(task.text)}</p>
      </article>
    `)
    .join("");

  const recordsHtml = [...records]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 6)
    .map((record) => {
      const causesText = (record.causes || []).map((c) => tOption("errorCause", c)).join("、") || t("export.docNoCause");
      const accuracyText = record.accuracy || "";
      return `
        <article class="record-item">
          <time>${escapeHtml(record.date)}</time>
          <p>${getRecordMinutes(record)} min</p>
          <small>${escapeHtml(accuracyText || causesText)}</small>
          <span>${escapeHtml(record.tomorrowFocus || t("export.keepLogging"))}</span>
        </article>
      `;
    })
    .join("") || `<article class="record-item empty"><time>--</time><p>${escapeHtml(t("export.docNoRecords"))}</p><small>${escapeHtml(t("export.docNoRecordsHint"))}</small><span>${escapeHtml(t("export.keepLogging"))}</span></article>`;

  const roadmapHtml = (plan.roadmap || [])
    .map((item, i) => `
      <article>
        <span>${String(i + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(phaseLabel(item.title))}</strong>
        <b>${escapeHtml(item.dayRange)}</b>
        <p>${escapeHtml(item.focus)}</p>
      </article>
    `)
    .join("");

  return `<!doctype html>
<html lang="${isEn ? "en" : "zh-CN"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(t("export.docReportTitle", { name: profileName, level: plan.level }))}</title>
<style>
:root {
  --ink: #182522;
  --muted: #70817a;
  --paper: #f6f7f4;
  --panel: #ffffff;
  --line: rgba(49,95,79,0.16);
  --line-strong: rgba(49,95,79,0.26);
  --brand: #315f4f;
  --accent: #b77a20;
  --display: "Hiragino Mincho ProN", "Yu Mincho", "Songti SC", "Noto Serif CJK SC", serif;
  --body: "Avenir Next", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: linear-gradient(90deg, rgba(49,95,79,0.035) 1px, transparent 1px), linear-gradient(rgba(49,95,79,0.035) 1px, transparent 1px), var(--paper);
  background-size: 34px 34px;
  color: var(--ink);
  font-family: var(--body);
}
main { width: min(1120px, calc(100vw - 32px)); margin: 0 auto; padding: 28px 0 52px; }
.report-cover {
  min-height: 330px;
  padding: 34px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) 320px;
  gap: 28px;
  border-radius: 10px;
  background: linear-gradient(135deg, #182522, #315f4f 64%, #2f7c75);
  color: #f8faf8;
  box-shadow: 0 26px 70px rgba(34,53,48,0.18);
}
.eyebrow { display: inline-flex; width: max-content; border: 1px solid rgba(248,250,248,0.28); border-radius: 999px; padding: 8px 11px; color: rgba(248,250,248,0.82); font-size: 12px; font-weight: 740; }
h1 { max-width: 780px; margin: 34px 0 18px; font: 800 clamp(42px, 7vw, 82px)/0.96 var(--display); }
.cover-text { max-width: 74ch; margin: 0; color: rgba(248,250,248,0.82); font-size: 15px; line-height: 1.8; }
.cover-meta {
  align-self: end;
  display: grid;
  gap: 10px;
  padding: 18px;
  border: 1px solid rgba(248,250,248,0.18);
  border-radius: 8px;
  background: rgba(248,250,248,0.08);
}
.cover-meta div { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid rgba(248,250,248,0.14); padding-bottom: 9px; }
.cover-meta div:last-child { border-bottom: 0; padding-bottom: 0; }
.cover-meta span { color: rgba(248,250,248,0.64); font-size: 12px; font-weight: 800; }
.cover-meta strong { text-align: right; font-size: 13px; }
.metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
.metric { min-height: 132px; padding: 18px; border: 1px solid var(--line-strong); border-radius: 8px; background: var(--panel); }
.metric span, .section-kicker, small { color: var(--muted); font-size: 12px; font-weight: 740; text-transform: uppercase; }
.metric strong { display: block; margin-top: 18px; font: 800 38px/0.95 var(--display); color: var(--brand); }
.metric p { margin: 8px 0 0; color: var(--muted); font-size: 12px; line-height: 1.45; }
.report-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 14px; margin-top: 14px; }
section { padding: 22px; border: 1px solid var(--line-strong); border-radius: 8px; background: rgba(255,255,255,0.94); break-inside: avoid; }
h2 { margin: 0 0 16px; font: 800 24px/1.15 var(--display); }
h3 { margin: 0; font-size: 15px; line-height: 1.35; }
p { line-height: 1.68; }
.risk-copy { margin: 0 0 16px; color: #2d3b37; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tags span { display: inline-flex; align-items: center; gap: 10px; border: 1px solid rgba(49,95,79,0.18); border-radius: 999px; background: #d9ebe4; color: var(--brand); padding: 8px 11px; font-size: 13px; font-weight: 740; }
.tags b { min-width: 22px; border-radius: 999px; background: rgba(49,95,79,0.12); padding: 2px 7px; text-align: center; }
.task-list, .record-list { display: grid; gap: 10px; }
.task-item { display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 14px; padding: 13px; border: 1px solid var(--line); border-radius: 7px; background: #fbfbf8; }
.task-item div { display: grid; align-content: start; gap: 5px; }
.task-item strong { color: var(--accent); font-size: 14px; }
.task-item p { margin: 0; font-size: 13px; line-height: 1.58; }
.roadmap { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.roadmap article { min-height: 168px; padding: 15px; border: 1px solid var(--line); border-radius: 8px; background: #fbfbf8; }
.roadmap span { display: grid; place-items: center; width: 32px; height: 32px; margin-bottom: 14px; border-radius: 50%; background: var(--brand); color: #fff; font-size: 12px; font-weight: 800; }
.roadmap strong { display: block; margin-bottom: 7px; font-size: 15px; }
.roadmap b { color: var(--muted); font-size: 12px; }
.roadmap p { margin: 10px 0 0; color: var(--muted); font-size: 13px; line-height: 1.55; }
.record-list { margin-top: 14px; }
.record-item { display: grid; grid-template-columns: 110px 1fr auto auto; gap: 14px; align-items: center; padding: 12px 14px; border: 1px solid var(--line); border-radius: 7px; background: var(--panel); }
.record-item.empty { opacity: 0.7; }
.record-item time { color: var(--muted); font-size: 12px; font-weight: 740; }
.record-item p { margin: 0; font-size: 13px; }
.record-item small { color: var(--muted); font-size: 12px; }
.record-item span { justify-self: end; color: var(--brand); font-size: 12px; font-weight: 740; }
.suggestions { margin: 0; padding: 0 0 0 18px; }
.suggestions li { margin-bottom: 8px; line-height: 1.65; }
@media (max-width: 900px) {
  .report-cover { grid-template-columns: 1fr; }
  .metrics { grid-template-columns: repeat(2, 1fr); }
  .report-grid, .roadmap { grid-template-columns: 1fr; }
  .record-item { grid-template-columns: 1fr; gap: 6px; }
}
</style>
</head>
<body>
<main>
<header class="report-cover">
  <div>
    <span class="eyebrow">${escapeHtml(t("export.docReportEyebrow", { level: plan.level }))}</span>
    <h1>${escapeHtml(t("export.docReportName", { name: profileName }))}</h1>
    <p class="cover-text">${escapeHtml(plan.strategy?.summary || t("export.docCoverFallback"))}</p>
  </div>
  <div class="cover-meta">
    <div><span>${escapeHtml(t("export.docProfile"))}</span><strong>${escapeHtml(profileName)}</strong></div>
    <div><span>${escapeHtml(t("export.docExamDate"))}</span><strong>${escapeHtml(plan.examDate || t("export.docNotSet"))}</strong></div>
    <div><span>${escapeHtml(t("export.docDaysLeft"))}</span><strong>${escapeHtml(daysLeftText(plan.daysLeft))}</strong></div>
    <div><span>${escapeHtml(t("export.docPhase"))}</span><strong>${escapeHtml(phaseLabel(plan.phase))}</strong></div>
    <div><span>${escapeHtml(t("export.docGeneratedAt"))}</span><strong>${escapeHtml(reportDate)}</strong></div>
  </div>
</header>

<div class="metrics">
  ${metricsHtml}
</div>

<div class="report-grid">
  <section>
    <span class="section-kicker">MODULES</span>
    <h2>${escapeHtml(t("export.docModulesTitle"))}</h2>
    ${moduleHtml}
  </section>
  <section>
    <span class="section-kicker">CAUSES</span>
    <h2>${escapeHtml(t("export.docCausesTitle"))}</h2>
    <div class="tags">${causeHtml}</div>
  </section>
</div>

<section>
  <span class="section-kicker">SUGGESTIONS</span>
  <h2>${escapeHtml(t("export.docSuggestTitle"))}</h2>
  <ul class="suggestions">${suggestionsHtml}</ul>
</section>

<section>
  <span class="section-kicker">TODAY</span>
  <h2>${escapeHtml(t("export.docTodayTasks"))}</h2>
  <div class="task-list">${todayTasksHtml}</div>
</section>

<section>
  <span class="section-kicker">RECORDS</span>
  <h2>${escapeHtml(t("export.docRecentTitle"))}</h2>
  <div class="record-list">${recordsHtml}</div>
</section>

<section>
  <span class="section-kicker">ROADMAP</span>
  <h2>${escapeHtml(t("export.docRoadmap"))}</h2>
  <div class="roadmap">${roadmapHtml}</div>
</section>

</main>
</body>
</html>`;
}

// Escape text for an iCalendar property value (RFC 5545).
function icsEscape(text: string): string {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// Fold lines longer than 75 octets per RFC 5545 (continuation lines start with a space).
function icsFold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 74) {
    parts.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest.length) parts.push(" " + rest);
  return parts.join("\r\n");
}

function icsDate(isoDate: string): string {
  return isoDate.replace(/-/g, "");
}

function icsDatePlusOne(isoDate: string): string {
  // Use UTC math so the +1 day isn't cancelled by the local timezone offset
  // when formatting back (all-day DTEND is exclusive → must be start + 1 day).
  const [y, m, d] = isoDate.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return next.toISOString().slice(0, 10).replace(/-/g, "");
}

/**
 * Build an iCalendar (.ics) file: one all-day event per plan day, with the
 * day's tasks in the description. Importable into Google/Apple/Outlook calendars.
 */
export function buildICS(plan: GeneratedPlan, profileName: string): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JLPT Sprint Desk//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    icsFold(`X-WR-CALNAME:${icsEscape(`JLPT ${plan.level} · ${profileName}`)}`),
  ];

  (plan.dailyPlan || []).forEach((day) => {
    if (!day.date) return;
    const title = day.title || day.phase || `Day ${day.dayIndex}`;
    const total = Number(day.totalMinutes || 0);
    const summary = `JLPT Day ${day.dayIndex}: ${title}${total ? ` (${total}min)` : ""}`;
    const desc = (day.tasks || [])
      .map((task) => `• ${task.title || moduleLabel(task.module)} — ${Number(task.minutes || 0)}min`)
      .join("\\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:jlpt-${day.dayIndex}-${icsDate(day.date)}@jlpt-sprint-desk`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(day.date)}`,
      `DTEND;VALUE=DATE:${icsDatePlusOne(day.date)}`,
      icsFold(`SUMMARY:${icsEscape(summary)}`),
      icsFold(`DESCRIPTION:${desc}`),
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function buildBackupJSON(profileName: string, plan: GeneratedPlan | null, settings: PlanSettings, edits: Record<string, string>, records: StudyRecord[]): string {
  return JSON.stringify({
    exportedAt: todayISO(),
    storageVersion: CURRENT_SCHEMA_VERSION,
    profileName,
    planSettings: settings,
    generatedPlan: plan,
    planEdits: edits,
    records,
  }, null, 2);
}

export function buildPrintView(plan: GeneratedPlan): string {
  const lines: string[] = [
    "<!DOCTYPE html>",
    `<html lang="${getLocale() === "en" ? "en" : "zh-CN"}">`,
    "<head>",
    '<meta charset="UTF-8">',
    `<title>${escapeHtml(t("export.docPrintTitle"))}</title>`,
    "<style>",
    "body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #182522; }",
    "h1 { font-size: 24px; margin-bottom: 8px; }",
    "h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; }",
    "h3 { font-size: 15px; margin-top: 16px; margin-bottom: 8px; }",
    "p, li { font-size: 14px; margin: 4px 0; }",
    "ul { padding-left: 20px; }",
    ".meta { color: #70817a; font-size: 13px; margin-bottom: 16px; }",
    ".task { margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #dbe3df; }",
    ".task strong { color: #315f4f; }",
    "@media print { body { padding: 20px; } }",
    "</style>",
    "</head>",
    "<body>",
    `<h1>${t("export.docPlanTitle", { level: escapeHtml(plan.level) })}</h1>`,
    `<p class="meta">${escapeHtml(t("export.docPrintMeta", { exam: plan.examDate || t("export.docNotSet"), days: daysLeftText(plan.daysLeft), phase: phaseLabel(plan.phase) }))}</p>`,
    "",
    `<h2>${t("export.docTodayTasks")}</h2>`,
    "<ul>",
  ];

  plan.todayTasks.forEach((task) => {
    lines.push(`<li><strong>${escapeHtml(moduleLabel(task.module))}</strong> (${task.minutes}min)：${escapeHtml(task.text)}</li>`);
  });

  lines.push("</ul>");

  lines.push("", `<h2>${t("export.docMinimumPlan")}</h2>`, "<ul>");
  plan.minimumPlan.forEach((item) => {
    lines.push(`<li>${escapeHtml(item)}</li>`);
  });
  lines.push("</ul>");

  lines.push("", `<h2>${t("export.docDetail14")}</h2>`);
  plan.dailyPlan.slice(0, 14).forEach((day) => {
    lines.push(`<h3>${escapeHtml(day.label)} · ${escapeHtml(day.date)} · ${escapeHtml(day.weekday)} · ${escapeHtml(phaseLabel(day.phase))}</h3>`);
    lines.push("<ul>");
    day.tasks.forEach((task) => {
      lines.push(`<li><strong>${escapeHtml(moduleLabel(task.module))}</strong> (${task.minutes}min)：${escapeHtml(task.text)}</li>`);
    });
    lines.push("</ul>");
  });

  lines.push("", "</body>", "</html>");

  return lines.join("\n");
}
