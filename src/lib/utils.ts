import { COMPLETION_OPTIONS, MODULE_LABELS, RECORD_MODULE_KEYS } from "./constants";
import type { StudyRecord, GeneratedPlan } from "./types";
import { getTodayPlanDay } from "./planner";

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredCloneSafe(fallback);
    return JSON.parse(raw) as T;
  } catch {
    return structuredCloneSafe(fallback);
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function parseNumber(value: unknown, fallback: number): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampPercent(value: number): number {
  return clamp(Math.round(value), 0, 100);
}

export function roundToFive(value: number): number {
  return Math.max(0, Math.round(value / 5) * 5);
}

export function todayStart(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function todayISO(): string {
  return toISODate(todayStart());
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (toISODate(date) !== value) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isValidISODate(value: string): boolean {
  return Boolean(parseISODate(value));
}

export function daysUntil(value: string): number | null {
  const date = parseISODate(value);
  if (!date) return null;
  return Math.max(0, Math.ceil((date.getTime() - todayStart().getTime()) / 86400000));
}

export function isoWeekday(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

export function weekDayLabel(day: number): string {
  return ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][day - 1] || "周一";
}

export function formatDate(value: string): string {
  if (!value) return "未知";
  const date = value.includes("T") ? new Date(value) : parseISODate(value);
  if (!date || Number.isNaN(date.getTime())) return String(value);
  return toISODate(date);
}

export function formatMonthDay(value: string): string {
  const date = parseISODate(String(value || "")) || new Date(value);
  if (!date || Number.isNaN(date.getTime())) return "--";
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function escapeAttr(value: unknown): string {
  return escapeHtml(value);
}

export function downloadText(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    return true;
  }
}

export function csvCell(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function safeFilename(value: string): string {
  return String(value || "jlpt")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function sumObject(obj: Record<string, unknown>): number {
  return Object.values(obj).reduce((total: number, value) => total + Number(value || 0), 0);
}

export function getRecordMinutes(record: { minutes?: Record<string, number> }): number {
  if (!record?.minutes) return 0;
  return RECORD_MODULE_KEYS.reduce((total, key) => total + Number(record.minutes?.[key] || 0), 0);
}

export function getCompletionPercent(completion: string): number {
  const map: Record<string, number> = { done: 100, partial: 60, minimum: 30, missed: 0 };
  return map[completion] || 0;
}

export function getRecordAccuracyPercent(record: { accuracy?: string }): number {
  if (!record?.accuracy) return 0;
  const match = /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g;
  const pairs = [...(record.accuracy.matchAll(match) || [])];
  if (pairs.length) {
    const total = pairs.reduce((sum, pair) => {
      const correct = Number(pair[1]);
      const totalQuestions = Number(pair[2]);
      return sum + (totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0);
    }, 0);
    return Math.round(total / pairs.length);
  }
  const singleMatch = /(\d+(?:\.\d+)?)/.exec(record.accuracy);
  if (singleMatch) {
    const num = Number(singleMatch[1]);
    if (num > 0 && num <= 100) return Math.round(num);
  }
  return 0;
}

export function completionLabel(value: string): string {
  const pair = COMPLETION_OPTIONS.find(([key]) => key === value);
  if (pair) return pair[1];
  if (Number.isFinite(Number(value))) return `完成 ${Math.round(Number(value))}%`;
  return "未记录完成度";
}

export function normalizeWrongQuestionText(record: StudyRecord): string {
  if (!record) return "";
  if (Array.isArray(record.wrongQuestions) && record.wrongQuestions.length) return record.wrongQuestions.join("\n");
  return String(record.wrongQuestionDetails || "");
}

export function getRecordModuleValue(record: StudyRecord, key: string): number {
  if (!record) return 0;
  if (record.minutes && Number.isFinite(Number(record.minutes[key]))) {
    return Number(record.minutes[key]);
  }
  return Number((record as Record<string, unknown>)[`${key}Minutes`] || 0);
}

export function getRecordModuleCount(record: StudyRecord, key: string): number {
  if (!record) return 0;
  if (record.moduleCounts && Number.isFinite(Number(record.moduleCounts[key]))) {
    return Number(record.moduleCounts[key]);
  }
  return Number((record as Record<string, unknown>)[`${key}Count`] || 0);
}

export function getRecordTotalCount(record: StudyRecord): number {
  return RECORD_MODULE_KEYS.reduce((total, key) => total + getRecordModuleCount(record, key), 0);
}

export function buildRecordRecommendation(record: StudyRecord): string[] {
  const causes = record.causes || record.errorCauses || [];
  const actions: string[] = [];
  const timeText = `${record.actualTime || ""} ${record.overtimeReason || ""} ${record.timeNote || ""}`;
  if (record.tomorrowFocus) actions.push(`明天第一步：${record.tomorrowFocus}`);
  const wrongQuestions = Array.isArray(record.wrongQuestions) ? record.wrongQuestions : [];
  if (wrongQuestions.length) {
    actions.push(`错题二刷 ${Math.min(12, wrongQuestions.length)} 题：只做同题型，不开新资料。`);
  }
  if (causes.includes("定位慢")) actions.push("阅读加 1 组限时定位训练：只找题干关键词、主题句、转折句。");
  if (causes.includes("听漏关键词")) actions.push("听力重听今天错题：记录人物关系、任务目标、转折和结论。");
  if (causes.includes("接续形式")) actions.push("文法整理接续表：把今天错的句型各造 1 句。");
  if (causes.includes("时间不够")) actions.push("明天所有题组加计时，记录每题耗时，不追求题量。");
  if (causes.includes("复盘不足")) actions.push("明天开头先复盘 15 分钟，再进入新内容；不要把复盘挤到最后。");
  if (causes.includes("任务过量")) actions.push("明天新词或新文法下调 20%，保留订正和二刷时间。");
  if (causes.includes("词义差别") || causes.includes("固定搭配")) actions.push("词汇按近义词和固定搭配重分组，不继续顺背。");
  if (record.completion === "minimum") actions.push("今天只完成保底，明天从保底内容接上，不补偿式加量。");
  if (record.completion === "missed") actions.push("今天断档，明天只恢复节奏：启动复习 + 一个最弱模块小任务。");
  if (/超时|超过|来不及|不够|太多|太慢|慢/.test(timeText)) {
    actions.push("明天先校准时间：新词或新文法下调 20%-30%，把省出的时间留给例句、订正和二刷。");
  }
  if (record.actualTime) actions.push(`把今日实际用时作为校准样本：${record.actualTime}。连续 3 天记录后，再确定你的个人速率。`);
  if (!actions.length) actions.push("明天保持原计划，但把今天的正确率和耗时补完整。");
  return actions.slice(0, 4);
}

export function buildTomorrowTimePlan(record: StudyRecord, plan: GeneratedPlan | null): { total: number; target: number; status: string; rows: { module: string; label: string; minutes: number; note: string }[] } {
  const todayDay = plan ? getTodayPlanDay(plan) : null;
  const target = todayDay?.targetMinutes || todayDay?.totalMinutes || 120;
  const planned = (todayDay?.tasks || []).reduce<Record<string, number>>((map, task) => {
    if (task.module && !["review", "mock"].includes(task.module)) {
      map[task.module] = Math.max(map[task.module] || 0, Number(task.minutes || 0));
    }
    return map;
  }, {});
  const hasOvertime = /超时|超过|来不及|不够|太多|太慢|慢/.test(`${record.overtimeReason || ""} ${record.timeNote || ""}`);
  const rows = (["vocab", "grammar", "reading", "listening"] as string[])
    .map((module) => {
      const actual = Number((record.moduleTimes as Record<string, number> || {})[module] || 0);
      const base = Number(planned[module] || 0);
      if (!actual && !base) return null;
      let minutes = actual ? Math.round(actual * (hasOvertime ? 1.05 : 0.95)) : base;
      if (module === "vocab" || module === "grammar") minutes = Math.max(minutes, base || minutes);
      return {
        module,
        label: MODULE_LABELS[module] || module,
        minutes: clamp(roundToFive(minutes), 10, Math.max(target, 10)),
        note: actual ? `参考今日实际 ${actual}min` : `参考计划建议 ${base}min`,
      };
    })
    .filter(Boolean) as { module: string; label: string; minutes: number; note: string }[];
  const review = Math.max(15, roundToFive(target * 0.18));
  rows.push({
    module: "review",
    label: "复盘订正",
    minutes: review,
    note: hasOvertime ? "优先处理超时原因和错因" : "整理错词、错题和明日第一步",
  });
  const total = rows.reduce((sum, row) => sum + row.minutes, 0);
  return {
    total,
    target,
    status: total > target ? "超过明日可用时间，建议下调新学量" : "明日时间可执行",
    rows,
  };
}
