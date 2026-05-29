import type { GeneratedPlan, PlanSettings, StudyRecord } from "./types";
import { MODULE_LABELS, RECORD_MODULE_KEYS } from "./constants";
import { escapeHtml, todayISO } from "./utils";
import { getRecordMinutes } from "./utils";

export function buildMarkdown(plan: GeneratedPlan, records: StudyRecord[], profileName: string): string {
  const todayRecord = records.find((r) => r.date === todayISO());
  const lines: string[] = [
    `# JLPT ${plan.level} 学习计划`,
    "",
    `> 档案：${profileName} · 生成时间：${plan.generatedAt.slice(0, 10)}`,
    "",
    "## 一页总览",
    "",
    `- 目标等级：${plan.level}`,
    `- 考试日期：${plan.examDate || "未设置"}`,
    `- 剩余天数：${plan.daysLeft === null ? "未设置" : `${plan.daysLeft} 天`}`,
    `- 当前阶段：${plan.phase}`,
    `- 计划健康度：${plan.studyBudget.status} / ${plan.studyBudget.timeStatus}`,
    `- 学习策略：${plan.strategy.summary}`,
    "",
    "## 今日任务",
    "",
  ];

  plan.todayTasks.forEach((task, index) => {
    lines.push(`${index + 1}. **${task.label}** · ${task.minutes} 分钟`);
    lines.push(`   - ${task.text}`);
    lines.push("");
  });

  lines.push("## 最低保底计划");
  lines.push("");
  plan.minimumPlan.forEach((item) => {
    lines.push(`- ${item}`);
  });

  lines.push("", "## 阶段路线");
  lines.push("");
  plan.roadmap.forEach((item) => {
    lines.push(`### ${item.title}（${item.dayRange}）`);
    lines.push(`- 重点：${item.focus}`);
    lines.push(`- 方法：${item.method}`);
    lines.push("");
  });

  lines.push("## 14 天详细日程");
  lines.push("");
  plan.dailyPlan.slice(0, 14).forEach((day) => {
    lines.push(`### ${day.label} · ${day.date} · ${day.weekday}`);
    lines.push(`> ${day.title} · ${day.phase} · ${day.totalMinutes} 分钟`);
    lines.push("");
    day.tasks.forEach((task) => {
      lines.push(`- **${task.label}** (${task.minutes}min)：${task.text}`);
    });
    lines.push("");
    if (todayRecord && day.date === todayISO()) {
      lines.push(`> 今日记录：${todayRecord.completion === "done" ? "已完成" : todayRecord.completion === "partial" ? "部分完成" : todayRecord.completion === "minimum" ? "保底完成" : "今日断档"}`);
      lines.push("");
    }
  });

  lines.push("## 错因复盘模板");
  lines.push("");
  lines.push("| 日期 | 模块 | 错因 | 解决方式 |");
  lines.push("|------|------|------|----------|");
  records.slice(-7).forEach((record) => {
    (record.causes || []).forEach((cause) => {
      lines.push(`| ${record.date} | ${record.minutes ? Object.entries(record.minutes).filter(([, v]) => v > 0).map(([k]) => MODULE_LABELS[k]).join(", ") : "-"} | ${cause} | |`);
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
        `"${(task.title || task.label).replace(/"/g, '""')}"`,
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

  const reportDate = new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date());

  const metricsHtml = [
    { label: "学习天数", value: `${recentRecords.length} 天` },
    { label: "总学习时长", value: `${totalMinutes} 分钟` },
    { label: "平均每天", value: `${avgMinutes} 分钟` },
    { label: "平均完成度", value: `${avgCompletion}%` },
  ]
    .map((m) => `<div class="metric"><span>${m.label}</span><strong>${m.value}</strong></div>`)
    .join("");

  const moduleHtml = Object.entries(moduleTotals)
    .filter(([, minutes]) => minutes > 0)
    .map(([key, minutes]) => `<p><strong>${MODULE_LABELS[key]}</strong>${minutes} 分钟</p>`)
    .join("") || "<p>暂无模块记录</p>";

  const causeHtml = topCauses.length
    ? topCauses.map(([cause, count]) => `<span>${escapeHtml(cause)}<b>${count}</b></span>`).join("")
    : "<span>暂无错因记录<b>0</b></span>";

  const suggestions: string[] = [];
  if (avgCompletion < 70) suggestions.push("完成度偏低，建议把任务拆成更小的块。");
  if (avgMinutes < plan.studyBudget.dailyMinutes * 0.7) suggestions.push("日均学习时间不足，建议优先保证核心模块。");
  if (!topCauses.length) suggestions.push("还没有错因记录，开始记录错因可以获得更精准的建议。");
  if (avgCompletion >= 70 && avgMinutes >= plan.studyBudget.dailyMinutes * 0.7) suggestions.push("整体节奏良好，继续保持！");

  const suggestionsHtml = suggestions.map((s) => `<li>${escapeHtml(s)}</li>`).join("");

  const todayTasksHtml = plan.todayTasks
    .map((task, i) => `
      <article class="task-item">
        <div><small>${String(i + 1).padStart(2, "0")}</small><strong>${task.minutes} min</strong></div>
        <p>${escapeHtml(task.label)}：${escapeHtml(task.text)}</p>
      </article>
    `)
    .join("");

  const recordsHtml = [...records]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 6)
    .map((record) => {
      const causesText = (record.causes || []).join("、") || "未填错因";
      const accuracyText = record.accuracy || "";
      return `
        <article class="record-item">
          <time>${escapeHtml(record.date)}</time>
          <p>${getRecordMinutes(record)} 分钟</p>
          <small>${escapeHtml(accuracyText || causesText)}</small>
          <span>${escapeHtml(record.tomorrowPlan || "继续记录")}</span>
        </article>
      `;
    })
    .join("") || `<article class="record-item empty"><time>--</time><p>暂无记录</p><small>保存今日记录后自动补充</small><span>继续记录</span></article>`;

  const roadmapHtml = (plan.roadmap || [])
    .map((item, i) => `
      <article>
        <span>${String(i + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <b>${escapeHtml(item.dayRange)}</b>
        <p>${escapeHtml(item.focus)}</p>
      </article>
    `)
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(profileName)} JLPT ${escapeHtml(plan.level)} 学习报告</title>
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
.eyebrow { display: inline-flex; width: max-content; border: 1px solid rgba(248,250,248,0.28); border-radius: 999px; padding: 8px 11px; color: rgba(248,250,248,0.82); font-size: 12px; font-weight: 850; }
h1 { max-width: 780px; margin: 34px 0 18px; font: 900 clamp(42px, 7vw, 82px)/0.96 var(--display); }
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
.metric span, .section-kicker, small { color: var(--muted); font-size: 12px; font-weight: 850; text-transform: uppercase; }
.metric strong { display: block; margin-top: 18px; font: 900 38px/0.95 var(--display); color: var(--brand); }
.metric p { margin: 8px 0 0; color: var(--muted); font-size: 12px; line-height: 1.45; }
.report-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 14px; margin-top: 14px; }
section { padding: 22px; border: 1px solid var(--line-strong); border-radius: 8px; background: rgba(255,255,255,0.94); break-inside: avoid; }
h2 { margin: 0 0 16px; font: 900 24px/1.15 var(--display); }
h3 { margin: 0; font-size: 15px; line-height: 1.35; }
p { line-height: 1.68; }
.risk-copy { margin: 0 0 16px; color: #2d3b37; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tags span { display: inline-flex; align-items: center; gap: 10px; border: 1px solid rgba(49,95,79,0.18); border-radius: 999px; background: #d9ebe4; color: var(--brand); padding: 8px 11px; font-size: 13px; font-weight: 850; }
.tags b { min-width: 22px; border-radius: 999px; background: rgba(49,95,79,0.12); padding: 2px 7px; text-align: center; }
.task-list, .record-list { display: grid; gap: 10px; }
.task-item { display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 14px; padding: 13px; border: 1px solid var(--line); border-radius: 7px; background: #fbfbf8; }
.task-item div { display: grid; align-content: start; gap: 5px; }
.task-item strong { color: var(--accent); font-size: 14px; }
.task-item p { margin: 0; font-size: 13px; line-height: 1.58; }
.roadmap { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.roadmap article { min-height: 168px; padding: 15px; border: 1px solid var(--line); border-radius: 8px; background: #fbfbf8; }
.roadmap span { display: grid; place-items: center; width: 32px; height: 32px; margin-bottom: 14px; border-radius: 50%; background: var(--brand); color: #fff; font-size: 12px; font-weight: 900; }
.roadmap strong { display: block; margin-bottom: 7px; font-size: 15px; }
.roadmap b { color: var(--muted); font-size: 12px; }
.roadmap p { margin: 10px 0 0; color: var(--muted); font-size: 13px; line-height: 1.55; }
.record-list { margin-top: 14px; }
.record-item { display: grid; grid-template-columns: 110px 1fr auto auto; gap: 14px; align-items: center; padding: 12px 14px; border: 1px solid var(--line); border-radius: 7px; background: var(--panel); }
.record-item.empty { opacity: 0.7; }
.record-item time { color: var(--muted); font-size: 12px; font-weight: 850; }
.record-item p { margin: 0; font-size: 13px; }
.record-item small { color: var(--muted); font-size: 12px; }
.record-item span { justify-self: end; color: var(--brand); font-size: 12px; font-weight: 850; }
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
    <span class="eyebrow">JLPT ${escapeHtml(plan.level)} 学习报告</span>
    <h1>${escapeHtml(profileName)} 的学习报告</h1>
    <p class="cover-text">${escapeHtml(plan.strategy?.summary || "按当前计划和每日记录生成学习报告。")}</p>
  </div>
  <div class="cover-meta">
    <div><span>档案</span><strong>${escapeHtml(profileName)}</strong></div>
    <div><span>考试日期</span><strong>${escapeHtml(plan.examDate || "未设置")}</strong></div>
    <div><span>剩余天数</span><strong>${plan.daysLeft === null ? "未设置" : `${plan.daysLeft} 天`}</strong></div>
    <div><span>当前阶段</span><strong>${escapeHtml(plan.phase)}</strong></div>
    <div><span>生成时间</span><strong>${escapeHtml(reportDate)}</strong></div>
  </div>
</header>

<div class="metrics">
  ${metricsHtml}
</div>

<div class="report-grid">
  <section>
    <span class="section-kicker">MODULES</span>
    <h2>各模块学习时间</h2>
    ${moduleHtml}
  </section>
  <section>
    <span class="section-kicker">CAUSES</span>
    <h2>主要错因</h2>
    <div class="tags">${causeHtml}</div>
  </section>
</div>

<section>
  <span class="section-kicker">SUGGESTIONS</span>
  <h2>下周建议</h2>
  <ul class="suggestions">${suggestionsHtml}</ul>
</section>

<section>
  <span class="section-kicker">TODAY</span>
  <h2>今日任务</h2>
  <div class="task-list">${todayTasksHtml}</div>
</section>

<section>
  <span class="section-kicker">RECORDS</span>
  <h2>最近记录</h2>
  <div class="record-list">${recordsHtml}</div>
</section>

<section>
  <span class="section-kicker">ROADMAP</span>
  <h2>阶段路线</h2>
  <div class="roadmap">${roadmapHtml}</div>
</section>

</main>
</body>
</html>`;
}

export function buildBackupJSON(profileName: string, plan: GeneratedPlan | null, settings: PlanSettings, edits: Record<string, string>, records: StudyRecord[]): string {
  return JSON.stringify({
    exportedAt: todayISO(),
    storageVersion: 2,
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
    "<html>",
    "<head>",
    '<meta charset="UTF-8">',
    "<title>JLPT 学习计划</title>",
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
    `<h1>JLPT ${escapeHtml(plan.level)} 学习计划</h1>`,
    `<p class="meta">考试日期：${escapeHtml(plan.examDate)} · 剩余天数：${plan.daysLeft === null ? "未设置" : `${plan.daysLeft} 天`} · 阶段：${escapeHtml(plan.phase)}</p>`,
    "",
    "<h2>今日任务</h2>",
    "<ul>",
  ];

  plan.todayTasks.forEach((task) => {
    lines.push(`<li><strong>${escapeHtml(task.label)}</strong> (${task.minutes}min)：${escapeHtml(task.text)}</li>`);
  });

  lines.push("</ul>");

  lines.push("", "<h2>最低保底计划</h2>", "<ul>");
  plan.minimumPlan.forEach((item) => {
    lines.push(`<li>${escapeHtml(item)}</li>`);
  });
  lines.push("</ul>");

  lines.push("", "<h2>14 天详细计划</h2>");
  plan.dailyPlan.slice(0, 14).forEach((day) => {
    lines.push(`<h3>${escapeHtml(day.label)} · ${escapeHtml(day.date)} · ${escapeHtml(day.weekday)} · ${escapeHtml(day.phase)}</h3>`);
    lines.push("<ul>");
    day.tasks.forEach((task) => {
      lines.push(`<li><strong>${escapeHtml(task.label)}</strong> (${task.minutes}min)：${escapeHtml(task.text)}</li>`);
    });
    lines.push("</ul>");
  });

  lines.push("", "</body>", "</html>");

  return lines.join("\n");
}
