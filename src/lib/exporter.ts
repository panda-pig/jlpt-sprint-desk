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

  const lines: string[] = [
    `# JLPT ${plan.level} 学习报告`,
    "",
    `**档案：** ${profileName}  
**生成时间：** ${todayISO()}  
**考试日期：** ${plan.examDate || "未设置"}  
**剩余天数：** ${plan.daysLeft === null ? "未设置" : `${plan.daysLeft} 天`}  
**当前阶段：** ${plan.phase}`,
    "",
    "## 过去 7 天学习总览",
    "",
    `- 学习天数：${recentRecords.length} 天`,
    `- 总学习时长：${totalMinutes} 分钟`,
    `- 平均每天：${avgMinutes} 分钟`,
    `- 平均完成度：${avgCompletion}%`,
    "",
    "## 各模块学习时间",
    "",
  ];

  Object.entries(moduleTotals).forEach(([key, minutes]) => {
    if (minutes > 0) {
      lines.push(`- ${MODULE_LABELS[key]}：${minutes} 分钟`);
    }
  });

  lines.push("", "## 主要错因");
  lines.push("");
  if (topCauses.length) {
    topCauses.forEach(([cause, count]) => {
      lines.push(`- ${cause}：${count} 次`);
    });
  } else {
    lines.push("- 暂无错因记录");
  }

  lines.push("", "## 下周建议");
  lines.push("");
  if (avgCompletion < 70) {
    lines.push("- 完成度偏低，建议把任务拆成更小的块。");
  }
  if (avgMinutes < plan.studyBudget.dailyMinutes * 0.7) {
    lines.push("- 日均学习时间不足，建议优先保证核心模块。");
  }
  if (!topCauses.length) {
    lines.push("- 还没有错因记录，开始记录错因可以获得更精准的建议。");
  }
  if (avgCompletion >= 70 && avgMinutes >= plan.studyBudget.dailyMinutes * 0.7) {
    lines.push("- 整体节奏良好，继续保持！");
  }

  return lines.join("\n");
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
