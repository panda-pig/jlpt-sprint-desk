import type { DailyPlanItem, GeneratedPlan, Level, PlanHealth, PlanSettings, RecentStats, RoadmapItem, StudyBudget, StudyRecord, StudyTask } from "./types";
import {
  BASE_LEVELS,
  LEVEL_CONFIG,
  LEVEL_CONTENT_TARGETS,
  MODULE_LABELS,
  RECORD_MODULE_KEYS,
  STATIC_SELECT_OPTIONS,
} from "./constants";
import {
  addDays,
  clamp,
  daysUntil,
  isoWeekday,
  nowISO,
  parseNumber,
  roundToFive,
  todayISO,
  todayStart,
  toISODate,
  weekDayLabel,
} from "./utils";
import { t, tOption, moduleLabel } from "../i18n";

export function generatePlan(settings: PlanSettings, profileId: string): GeneratedPlan {
  const normalized = normalizeSettings(settings);
  const parsedDaysLeft = daysUntil(normalized.examDate);
  const safeDaysLeft = parsedDaysLeft === null ? LEVEL_CONFIG[normalized.level].baseWeeks * 7 : Math.max(1, parsedDaysLeft);
  const horizon = clamp(safeDaysLeft, 14, 240);
  const budget = buildStudyBudget(normalized);
  const dailyPlan: DailyPlanItem[] = [];

  for (let index = 1; index <= horizon; index += 1) {
    const date = addDays(todayStart(), index - 1);
    const phase = phaseForDay(index, horizon);
    const dayBudget = getBudgetForDate(normalized, date);
    const tasks = buildTasksForDay(normalized, phase, index, horizon, dayBudget.totalMinutes, dayBudget.isLightDay);
    dailyPlan.push({
      dayIndex: index,
      label: `Day ${index}`,
      date: toISODate(date),
      weekday: weekDayLabel(isoWeekday(date)),
      phase,
      title: buildDayTitle(tasks, phase, index),
      totalMinutes: tasks.reduce((total, task) => total + task.minutes, 0),
      targetMinutes: dayBudget.totalMinutes,
      isLightDay: dayBudget.isLightDay,
      tasks,
      checkpoints: buildCheckpoints(index, horizon, phase),
    });
  }

  return {
    version: 2,
    id: `generated-${Date.now()}`,
    profileId,
    generatedAt: nowISO(),
    startDate: todayISO(),
    level: normalized.level,
    examDate: normalized.examDate,
    daysLeft: parsedDaysLeft,
    horizon,
    phase: phaseForDay(1, horizon),
    strategy: buildStrategy(normalized, parsedDaysLeft, budget),
    studyBudget: budget,
    principles: buildPrinciples(normalized),
    materials: buildMaterials(normalized),
    todayTasks: dailyPlan[0]?.tasks || [],
    minimumPlan: buildMinimumPlan(normalized),
    roadmap: buildRoadmap(horizon),
    dailyPlan,
    methodBasis: buildMethodBasis(normalized, budget),
    settingsSnapshot: normalized,
  };
}

function buildDayTitle(tasks: StudyTask[], phase: string, dayIndex: number): string {
  if (dayIndex === 1 && tasks.some((task) => task.title?.includes("摸底"))) return "摸底建档 + 每日底盘";
  if (tasks.some((task) => task.module === "mock")) return phase.includes("冲刺") ? "模考/真题计时" : "每日底盘 + 周测复盘";
  const main = tasks.find((task) => !["review", "vocab", "grammar"].includes(task.module));
  return main ? `每日底盘 + ${MODULE_LABELS[main.module]}主攻` : "每日底盘 + 错题回收";
}

export function buildStudyBudget(settings: PlanSettings): StudyBudget {
  const sessionDays = normalizeDays(settings.sessionDays);
  const weeklyMinutes = sessionDays.reduce((total, day) => {
    return total + (day >= 6 ? settings.weekendMinutes : settings.weekdayMinutes);
  }, 0);
  const dailyMinutes = Math.round(weeklyMinutes / Math.max(1, sessionDays.length));
  const moduleWeights = buildModuleWeights(settings);
  const moduleMinutes = allocateMinutes(dailyMinutes, moduleWeights, 10);
  const contentBudget = buildContentBudget(settings, weeklyMinutes);
  return {
    weekdayMinutes: settings.weekdayMinutes,
    weekendMinutes: settings.weekendMinutes,
    dailyMinutes,
    weeklyMinutes,
    sessionDays,
    moduleWeights,
    moduleMinutes,
    ...contentBudget,
  } as unknown as StudyBudget;
}

function buildContentBudget(settings: PlanSettings, weeklyMinutes: number) {
  const targets = LEVEL_CONTENT_TARGETS[settings.level] || LEVEL_CONTENT_TARGETS.N2;
  const daysLeft = daysUntil(settings.examDate);
  const planningDays = daysLeft === null ? LEVEL_CONFIG[settings.level].baseWeeks * 7 : daysLeft;
  const vocabRemaining = Math.max(0, targets.vocab - settings.learnedVocab);
  const grammarRemaining = Math.max(0, targets.grammar - settings.learnedGrammar);
  const vocabDays = settings.dailyVocabGoal > 0 ? Math.ceil(vocabRemaining / settings.dailyVocabGoal) : Infinity;
  const grammarDays = settings.dailyGrammarGoal > 0 ? Math.ceil(grammarRemaining / settings.dailyGrammarGoal) : Infinity;
  const learningDays = Math.max(vocabDays, grammarDays);
  const desiredReviewDays = Math.max(7, Math.ceil(Math.max(planningDays, 14) * settings.reviewReserve));
  const availableLearningDays = Math.max(0, planningDays - desiredReviewDays);
  const reviewDaysLeft = Math.max(0, planningDays - (Number.isFinite(learningDays) ? learningDays : 0));

  // Stable keys (translated at display via tOption). Avoids fragile string matching.
  let status = "ample";
  if (!Number.isFinite(learningDays)) {
    status = "lackDaily";
  } else if (daysLeft !== null && daysLeft <= 3 && (vocabRemaining > 0 || grammarRemaining > 0)) {
    status = "examReview";
  } else if (learningDays > Math.max(1, planningDays)) {
    status = "notEnough";
  } else if (learningDays > Math.max(1, availableLearningDays)) {
    status = "canFinishLowReview";
  }

  const timeStatus = settings.weekdayMinutes >= 120 || settings.weekendMinutes >= 180 ? "strong" : settings.weekdayMinutes >= 60 ? "medium" : "low";

  return {
    status,
    timeStatus,
    targetVocab: targets.vocab,
    targetGrammar: targets.grammar,
    vocabRemaining,
    grammarRemaining,
    vocabDays: Number.isFinite(vocabDays) ? vocabDays : null,
    grammarDays: Number.isFinite(grammarDays) ? grammarDays : null,
    learningDays: Number.isFinite(learningDays) ? learningDays : null,
    desiredReviewDays,
    availableLearningDays,
    reviewDaysLeft,
    dailySuggested: Math.round(weeklyMinutes / 7),
    startupDailySuggested: Math.round(weeklyMinutes / 7),
    vocabDailySuggested: Math.round(vocabRemaining / Math.max(1, availableLearningDays)),
    grammarDailySuggested: Math.round(grammarRemaining / Math.max(1, availableLearningDays)),
    skillDailySuggested: Math.round(weeklyMinutes / 7),
    reviewDailySuggested: Math.round(weeklyMinutes / 7),
    feasibleVocabGoal: settings.dailyVocabGoal,
    feasibleGrammarGoal: settings.dailyGrammarGoal,
    advice: buildAdvice(status, timeStatus),
  };
}

function buildAdvice(status: string, timeStatus: string): string[] {
  const advice: string[] = [];
  if (status === "notEnough") {
    advice.push(t("planner.advNotEnough1"));
    advice.push(t("planner.advNotEnough2"));
  } else if (status === "canFinishLowReview") {
    advice.push(t("planner.advLowReview"));
  } else if (status === "lackDaily") {
    advice.push(t("planner.advLackDaily"));
  }
  if (timeStatus === "low") {
    advice.push(t("planner.advLowIntensity"));
  }
  if (!advice.length) advice.push(t("planner.advGood"));
  return advice;
}

function buildModuleWeights(settings: PlanSettings): Record<string, number> {
  const weights: Record<string, number> = {};
  const levelWeights = LEVEL_CONFIG[settings.level]?.weights || {};
  const focusSet = new Set(settings.focusModules || settings.weaknesses || []);

  ["kanji", "vocab", "grammar", "reading", "listening"].forEach((key) => {
    const base = levelWeights[key] || 1;
    const isWeak = focusSet.has(key);
    const isStrong = settings[`${key}Base` as keyof PlanSettings] === "strong";
    let weight = base;
    if (isWeak) weight *= 1.35;
    if (isStrong) weight *= 0.75;
    weights[key] = weight;
  });

  weights.mock = 0.8;
  weights.review = 0.6;
  return weights;
}

function allocateMinutes(total: number, weights: Record<string, number>, minBlock: number): Record<string, number> {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const minutes: Record<string, number> = {};
  Object.entries(weights).forEach(([key, weight]) => {
    minutes[key] = Math.max(minBlock, roundToFive((total * weight) / totalWeight));
  });
  return minutes;
}

function normalizeDays(days: number[]): number[] {
  if (!Array.isArray(days) || !days.length) return [1, 2, 3, 4, 5];
  return days.filter((d) => d >= 1 && d <= 7).sort((a, b) => a - b);
}

function normalizeWeaknesses(weaknesses: string[]): string[] {
  if (!Array.isArray(weaknesses)) return [];
  return weaknesses.filter((w) => ["kanji", "vocab", "grammar", "reading", "listening"].includes(w));
}

function normalizeBlockers(blockers: string[]): string[] {
  if (!Array.isArray(blockers)) return [];
  return blockers.filter((b) => ["procrastination", "confused", "review", "time"].includes(b));
}

export function normalizeSettings(raw: Partial<PlanSettings>): PlanSettings {
  const merged = { ...getDefaultSettings(), ...(raw || {}) };
  const level = (LEVEL_CONFIG as Record<string, unknown>)[merged.level as string] ? merged.level as Level : "N1";
  const targetScore = clamp(parseNumber(merged.targetScore, (LEVEL_CONFIG as Record<string, { targetScore: number }>)[level]?.targetScore || 115), 60, 180);
  const weekdayMinutes = clamp(parseNumber(merged.weekdayMinutes, merged.dailyMinutes || 120), 20, 600);
  const weekendMinutes = clamp(parseNumber(merged.weekendMinutes, Math.max(weekdayMinutes, 180)), 20, 720);
  const dailyMinutes = clamp(parseNumber(merged.dailyMinutes, weekdayMinutes), 20, 720);
  const weaknesses = normalizeWeaknesses(merged.weaknesses || merged.focusModules || []);
  const blockers = normalizeBlockers(merged.blockers || []);
  const reviewReserve = clamp(parseNumber(merged.reviewReserve, 0.3), 0.1, 0.6);
  const targets = (LEVEL_CONTENT_TARGETS as Record<string, { vocab: number; grammar: number }>)[level] || LEVEL_CONTENT_TARGETS.N2;
  const learnedVocab = clamp(parseNumber(merged.learnedVocab, 0), 0, targets.vocab);
  const dailyVocabGoalRaw = parseNumber(merged.dailyVocabGoal, 100);
  const dailyVocabGoal = dailyVocabGoalRaw === 0 ? 0 : clamp(dailyVocabGoalRaw, 5, 500);
  const learnedGrammar = clamp(parseNumber(merged.learnedGrammar, 0), 0, targets.grammar);
  const dailyGrammarGoalRaw = parseNumber(merged.dailyGrammarGoal, 10);
  const dailyGrammarGoal = dailyGrammarGoalRaw === 0 ? 0 : clamp(dailyGrammarGoalRaw, 1, 50);

  return {
    ...merged,
    level,
    targetScore,
    weekdayMinutes,
    weekendMinutes,
    dailyMinutes,
    weaknesses,
    blockers,
    reviewReserve,
    learnedVocab,
    dailyVocabGoal,
    learnedGrammar,
    dailyGrammarGoal,
    sessionDays: normalizeDays(merged.sessionDays || [1, 2, 3, 4, 5]),
    kanjiBase: normalizeBase(merged.kanjiBase),
    vocabBase: normalizeBase(merged.vocabBase),
    grammarBase: normalizeBase(merged.grammarBase),
    readingBase: normalizeBase(merged.readingBase),
    listeningBase: normalizeBase(merged.listeningBase),
    focusModules: weaknesses,
  } as PlanSettings;
}

function normalizeBase(value: string): string {
  return BASE_LEVELS[value] ? value : "mid";
}

function getDefaultSettings(): PlanSettings {
  return {
    level: "N1",
    currentLevel: "N2 边缘",
    examDate: "2026-07-05",
    targetScore: 115,
    weekdayMinutes: 120,
    weekendMinutes: 240,
    dailyMinutes: 120,
    sessionDays: [1, 2, 3, 4, 5, 6, 7],
    state: "scattered",
    studyDay: "1",
    vocabBook: "green",
    grammarBook: "blue",
    kanjiBook: "animal",
    readingBook: "owned",
    listeningBook: "owned",
    learnedVocab: 0,
    dailyVocabGoal: 100,
    learnedGrammar: 0,
    dailyGrammarGoal: 10,
    reviewReserve: 0.3,
    weaknesses: ["vocab", "grammar"],
    blockers: ["procrastination", "confused"],
    kanjiBase: "mid",
    vocabBase: "weak",
    grammarBase: "weak",
    readingBase: "mid",
    listeningBase: "mid",
    focusModules: ["vocab", "grammar"],
    currentProgress: "学过一些，但三天打鱼两天晒网；需要先建立每日底盘。",
    resources: "无敌绿宝书、蓝宝书/国内文法书、小动物/日本語総まとめ 汉字、真题、NHK News Web Easy",
    reviewStyle: "balanced",
    customRules: "",
    customPlanInput: "",
  };
}

function buildTasksForDay(settings: PlanSettings, phase: string, dayIndex: number, horizon: number, minutes: number, isLightDay: boolean): StudyTask[] {
  if (phase.includes("冲刺") || dayIndex > horizon * 0.88) {
    return buildCramTasksForDay(settings, phase, dayIndex, minutes);
  }
  return buildNormalTasksForDay(settings, phase, dayIndex, minutes, isLightDay);
}

function buildNormalTasksForDay(settings: PlanSettings, _phase: string, dayIndex: number, minutes: number, isLightDay: boolean): StudyTask[] {
  const blockers = settings.blockers || [];
  const dayOne = settings.studyDay === "1" && dayIndex === 1;
  const primaryModule = getPrimaryPracticeModule(settings, dayIndex);
  const baseMinutes = Math.min(minutes, isLightDay ? Math.round(minutes * 0.6) : minutes);
  const warmupMinutes = baseMinutes >= 90 ? 15 : 10;
  const wrapMinutes = baseMinutes >= 75 ? 15 : 10;
  const mainMinutes = Math.max(15, baseMinutes - warmupMinutes - wrapMinutes);
  const moduleSplit = splitMainMinutes(mainMinutes, primaryModule, settings);

  const tasks: StudyTask[] = [];

  if (warmupMinutes > 0) {
    tasks.push({
      id: `d${dayIndex}-startup`,
      module: "review",
      label: "启动复习",
      title: dayOne ? "建立错题本和词卡本" : "回看昨日标红项",
      text: dayOne
        ? "准备一本空白本子或电子文档，命名为“JLPT 错题本”。"
        : "只看昨天标记为“不会”或“犹豫”的内容，不打开新单元。",
      minutes: warmupMinutes,
      priority: "启动",
    });
  }

  Object.entries(moduleSplit).forEach(([module, mins]) => {
    if (mins > 0) {
      tasks.push(makeTask(module, mins, _phase, dayIndex, settings));
    }
  });

  if (wrapMinutes > 0) {
    tasks.push({
      id: `d${dayIndex}-wrap`,
      module: "review",
      label: "收尾复盘",
      title: blockers.includes("review") ? "错题归因：每题只选一个主因" : "收尾复盘：记录正确率、实际用时和明天第一步",
      text: blockers.includes("review")
        ? "每道错题只写一句话说明错因，不抄题。"
        : "用 3 句话总结今天：1) 完成度如何；2) 最卡的一个点；3) 明天第一步做什么。",
      minutes: wrapMinutes,
      priority: "复盘",
    });
  }

  return fitTasksIntoBudget(tasks, baseMinutes);
}

function buildCramTasksForDay(settings: PlanSettings, _phase: string, dayIndex: number, minutes: number): StudyTask[] {
  const blockers = settings.blockers || [];
  const warmupMinutes = minutes >= 90 ? 10 : 5;
  const wrapMinutes = minutes >= 75 ? 15 : 10;
  const primaryModule = getPrimaryPracticeModule(settings, dayIndex);
  const mainMinutes = Math.max(10, minutes - warmupMinutes - wrapMinutes);

  const tasks: StudyTask[] = [
    {
      id: `d${dayIndex}-startup`,
      module: "review",
      label: "临考启动",
      title: "临考启动：只看高频错因",
      text: "不再开新坑，只看最近反复错、最容易抢分的内容。",
      minutes: warmupMinutes,
      priority: "启动",
    },
    {
      id: `d${dayIndex}-cram-${primaryModule}`,
      module: primaryModule as StudyTask["module"],
      label: MODULE_LABELS[primaryModule],
      title: `临考回收：${MODULE_LABELS[primaryModule]}高频点`,
      text: blockers.includes("time")
        ? "按考试节奏限时完成一小组，只记录来不及和不会的区别。"
        : "只复盘错题、标红词句和高频接续，不再扩充新内容。",
      minutes: mainMinutes,
      priority: "重点",
    },
  ];

  if (wrapMinutes > 0) {
    tasks.push({
      id: `d${dayIndex}-wrap`,
      module: "review",
      label: "收尾复盘",
      title: blockers.includes("review") ? "错题归因：只留一个主因" : "收尾复盘：确认考试前最后动作",
      text: "写下最后一个需要看的点，然后停止加量。",
      minutes: wrapMinutes,
      priority: "复盘",
    });
  }

  return fitTasksIntoBudget(tasks, minutes);
}

function splitMainMinutes(minutes: number, primary: string, settings: PlanSettings): Record<string, number> {
  const secondary = (settings.focusModules || settings.weaknesses || []).find((m) => m !== primary) || "vocab";
  const weights: Record<string, number> = {};
  const levelWeights = LEVEL_CONFIG[settings.level]?.weights || {};

  ["kanji", "vocab", "grammar", "reading", "listening"].forEach((key) => {
    weights[key] = levelWeights[key] || 1;
  });

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const result: Record<string, number> = {};

  Object.entries(weights).forEach(([key, weight]) => {
    let ratio = weight / totalWeight;
    if (key === primary) ratio *= 1.5;
    if (key === secondary) ratio *= 1.2;
    result[key] = roundToFive(Math.max(10, minutes * ratio));
  });

  return result;
}

function getPrimaryPracticeModule(settings: PlanSettings, dayIndex: number): string {
  const focus = settings.focusModules || settings.weaknesses || [];
  if (!focus.length) return ["vocab", "grammar", "reading", "listening"][dayIndex % 4];
  return focus[dayIndex % focus.length] || focus[0] || "vocab";
}

function makeTask(module: string, minutes: number, phase: string, dayIndex: number, settings: PlanSettings): StudyTask {
  const bookNote = buildBookNote(module, settings);
  const taskBank: Record<string, { title: string; text: string }> = {
    kanji: {
      title: phase.includes("冲刺") ? "高频汉字快速回收" : "汉字词形与音读训练",
      text: `${bookNote}先回忆，再核对，再把易混词放入复习队列。`,
    },
    vocab: {
      title: phase.includes("基础") ? "核心词汇扩展" : "语境词汇与近义词辨析",
      text: `${bookNote}今日新词目标 ${settings.dailyVocabGoal} 个，先回忆再核对。`,
    },
    grammar: {
      title: phase.includes("冲刺") ? "高频语法与接续确认" : "语法体系与接续练习",
      text: `${bookNote}今日新语法目标 ${settings.dailyGrammarGoal} 条，重点确认接续和例句。`,
    },
    reading: {
      title: phase.includes("冲刺") ? "限时读解与定位训练" : "读解结构与定位训练",
      text: `${bookNote}先读题干再定位，记录犹豫选项和误选原因。`,
    },
    listening: {
      title: phase.includes("冲刺") ? "听力关键词抓取" : "听力场景与关键词训练",
      text: `${bookNote}先抓关键词，再重听关键句，记录误听原因。`,
    },
  };

  const bank = taskBank[module] || { title: "综合训练", text: "按教材推进，记录卡点。" };
  return {
    id: `d${dayIndex}-${module}`,
    module: module as StudyTask["module"],
    label: MODULE_LABELS[module] || module,
    title: bank.title,
    text: bank.text,
    minutes,
    priority: "主线",
  };
}

function buildBookNote(module: string, settings: PlanSettings): string {
  const books: Record<string, Record<string, string>> = {
    kanji: { animal: "小动物/日本語総まとめ 汉字", shinkanzen: "新完全マスター 汉字", kanzen: "小动物/日本語総まとめ 汉字", green: "绿宝书/红宝书配套汉字题", owned: "自有汉字书" },
    vocab: { green: "无敌绿宝书", animal: "小动物系列", red: "红宝书", custom: "自定义词汇书" },
    grammar: { blue: "蓝宝书/国内文法书", shinkanzen: "新完全マスター 文法", soumatome: "小动物/日本語総まとめ 文法", try: "TRY 文法", owned: "自有文法书" },
    reading: {},
    listening: {},
  };
  const book = books[module]?.[settings[`${module}Book` as keyof PlanSettings] as string];
  return book ? `使用 ${book}，` : "";
}

function fitTasksIntoBudget(tasks: StudyTask[], budget: number): StudyTask[] {
  const fitted = tasks.map((t) => ({ ...t }));
  while (fitted.reduce((total, task) => total + task.minutes, 0) > budget) {
    const target = fitted
      .filter((task) => task.minutes > getTaskMinimum(task))
      .sort((a, b) => b.minutes - a.minutes)[0];
    if (target) {
      target.minutes -= 5;
      continue;
    }
    const removableIndex = fitted.findIndex((task) => !task.id?.includes("startup") && !task.id?.includes("wrap") && task.priority !== "重点");
    if (removableIndex >= 0 && fitted.length > 1) {
      fitted.splice(removableIndex, 1);
      continue;
    }
    break;
  }
  return fitted.filter((task) => task.minutes > 0);
}

function getTaskMinimum(task: StudyTask): number {
  if (task.id?.includes("startup") || task.id?.includes("wrap")) return 5;
  return 10;
}

function buildStrategy(settings: PlanSettings, daysLeft: number | null, budget: StudyBudget) {
  const weakModules = settings.weaknesses.map((key) => MODULE_LABELS[key]);
  const focus = weakModules.join("、") || "均衡推进";
  const countdown = daysLeft === null ? "考试日期未确认" : `距离考试 ${daysLeft} 天`;
  return {
    summary: `${countdown}，当前策略是以 ${focus} 为主轴，每周投入约 ${budget.weeklyMinutes} 分钟。新内容判断：${budget.status}，复习预留约 ${budget.desiredReviewDays} 天。`,
    weakModules,
    focus,
  };
}

function buildPrinciples(settings: PlanSettings): string[] {
  return [
    `当前水平：${settings.currentLevel}；备考状态：${STATIC_SELECT_OPTIONS.state.find(([value]) => value === settings.state)?.[1] || "未设置"}。`,
    "每天保留词汇和文法底盘，再把最弱模块排成当天主攻。",
    "薄弱项优先获得时间，但稳定项每周至少复盘两次，避免遗忘。",
    "错题只记录可复用原因，不堆积无法行动的题号列表。",
    settings.customPlanInput || "按真实记录滚动调整，不把生成计划当成静态清单。",
  ];
}

function buildMaterials(settings: PlanSettings): string[] {
  return String(settings.resources || "")
    .split(/[，,、\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function buildMinimumPlan(settings: PlanSettings): string[] {
  const focus = settings.weaknesses[0] || "grammar";
  const secondary = settings.weaknesses[1] || "grammar";
  if (settings.studyDay === "1") {
    return [
      "15 分钟：完成第一次摸底，词汇/文法各 10 题，读解或听解 1 小题组。",
      `10 分钟：${MODULE_LABELS[secondary]} 小练，只做一组基础题并标出不会的题。`,
      `5 分钟：建立错题本，写下今天 ${MODULE_LABELS[focus]} 的 3 个卡点。`,
    ];
  }
  return [
    `15 分钟：复习错词和错句，优先看错过 2 次以上的内容。`,
    `10 分钟：${MODULE_LABELS[secondary]} 小练，文法 5 题、阅读 1 小题组或听力即时应答 5 题。`,
    `5 分钟：写一句复盘，说明今天 ${MODULE_LABELS[focus]} 卡在哪里。`,
  ];
}

function buildRoadmap(horizon: number): RoadmapItem[] {
  const phases = [
    { ratio: 0.32, title: "基础补强期", focus: "汉字 + 核心词汇 + 基础语法" },
    { ratio: 0.66, title: "系统强化期", focus: "语法体系 + 读解定位 + 听力场景" },
    { ratio: 0.88, title: "套题整合期", focus: "限时练习 + 错题归因 + 弱项专攻" },
    { ratio: 1, title: "冲刺微调期", focus: "高频回收 + 模考节奏 + 心理调整" },
  ];

  return phases.map((phase, index) => {
    const start = index === 0 ? 1 : Math.round(horizon * phases[index - 1].ratio) + 1;
    const end = Math.round(horizon * phase.ratio);
    return {
      title: phase.title,
      dayRange: `Day ${start}-${end}`,
      focus: phase.focus,
      method: `每天 ${Math.round(horizon * 0.15)} 分钟主攻 + 复盘`,
    };
  });
}

function buildMethodBasis(settings: PlanSettings, budget: StudyBudget): string {
  const days = daysUntil(settings.examDate);
  const daysText = days === null ? "考试日期待确认" : `剩余 ${days} 天`;
  const levelLabel = LEVEL_CONFIG[settings.level]?.label || settings.level;
  return `${levelLabel} · ${daysText} · 每日 ${budget.dailyMinutes} 分钟 · ${budget.status}`;
}

function buildCheckpoints(dayIndex: number, horizon: number, phase: string): string[] {
  if (dayIndex === 1) return ["确认材料", "完成首日记录"];
  if (dayIndex % 14 === 0) return ["两周复盘", "调整薄弱项权重"];
  if (dayIndex === horizon) return ["最终回顾", "整理考试清单"];
  return [phase.includes("冲刺") ? "记录错因" : "完成反馈"];
}

function phaseForDay(dayIndex: number, horizon: number): string {
  const ratio = dayIndex / Math.max(1, horizon);
  if (ratio <= 0.32) return "基础补强期";
  if (ratio <= 0.66) return "系统强化期";
  if (ratio <= 0.88) return "套题整合期";
  return "冲刺微调期";
}

export function getBudgetForDate(settings: PlanSettings, date: Date) {
  const day = isoWeekday(date);
  const sessionDays = normalizeDays(settings.sessionDays);
  const isStudyDay = sessionDays.includes(day);
  if (!isStudyDay) {
    return {
      totalMinutes: Math.min(30, Math.max(15, Math.round(settings.dailyMinutes * 0.25))),
      isLightDay: true,
    };
  }
  return {
    totalMinutes: day >= 6 ? settings.weekendMinutes : settings.weekdayMinutes,
    isLightDay: false,
  };
}

export function getTodayTargetMinutes(settings: PlanSettings): number {
  return getBudgetForDate(settings, todayStart()).totalMinutes;
}

export function getTodayPlanDay(plan: GeneratedPlan | null): DailyPlanItem | null {
  if (!plan || !Array.isArray(plan.dailyPlan)) return null;
  return plan.dailyPlan.find((day) => day.date === todayISO()) || null;
}

export function getUpcomingDays(plan: GeneratedPlan | null, count: number): DailyPlanItem[] {
  if (!plan || !Array.isArray(plan.dailyPlan)) return [];
  const today = todayISO();
  const startIndex = plan.dailyPlan.findIndex((day) => day.date >= today);
  if (startIndex === -1) return [];
  return plan.dailyPlan.slice(startIndex, startIndex + count);
}

export type MergedDay = DailyPlanItem & { hasEdit: false } | DailyPlanItem & { hasEdit: true; editText: string; tasks: StudyTask[] };

export function mergeDayWithEdit(day: DailyPlanItem, edits: Record<string, string>): MergedDay {
  const editText = edits[String(day.dayIndex)];
  if (!editText) return { ...day, hasEdit: false };
  return {
    ...day,
    hasEdit: true,
    editText,
    tasks: [
      {
        id: `edit-${day.dayIndex}`,
        module: "review",
        label: "手动调整",
        title: "手动调整计划",
        text: editText,
        minutes: day.totalMinutes,
        priority: "已调整",
      },
    ],
  };
}

export function getPlanHealth(plan: GeneratedPlan | null, records: StudyRecord[]): PlanHealth {
  if (!plan) {
    return {
      score: 42,
      level: "danger",
      label: t("planner.healthPendingLabel"),
      message: t("planner.healthPendingMsg"),
    };
  }

  let score = 86;
  const stats = getRecentStats(records, 7);
  if (stats.recordedDays < 3 && records.length >= 3) score -= 14;
  if (records.length > 0 && stats.avgCompletion < 60) score -= 16;
  if (records.length > 0 && stats.avgAccuracy < 65) score -= 10;

  if (score >= 75) {
    return {
      score,
      level: "ok",
      label: t("planner.healthOkLabel"),
      message: t("planner.healthOkMsg"),
    };
  }
  if (score >= 52) {
    return {
      score,
      level: "warn",
      label: t("planner.healthWarnLabel"),
      message: t("planner.healthWarnMsg"),
    };
  }
  return {
    score,
    level: "danger",
    label: t("planner.healthDangerLabel"),
    message: t("planner.healthDangerMsg"),
  };
}

export function getNextAction(plan: GeneratedPlan | null, todayRecord: StudyRecord | null, health: PlanHealth) {
  if (!plan) {
    return {
      title: t("planner.nextNoPlanTitle"),
      body: t("planner.nextNoPlanBody"),
      cta: t("planner.nextNoPlanCta"),
      href: "#/setup",
    };
  }
  if (!todayRecord) {
    return {
      title: t("planner.nextNoRecordTitle"),
      body: t("planner.nextNoRecordBody"),
      cta: t("planner.nextNoRecordCta"),
      href: "#/record",
    };
  }
  if (health.score < 60) {
    return {
      title: t("planner.nextLowHealthTitle"),
      body: t("planner.nextLowHealthBody"),
      cta: t("planner.nextLowHealthCta"),
      href: "#/analysis",
    };
  }
  return {
    title: t("planner.nextDoneTitle"),
    body: t("planner.nextDoneBody"),
    cta: t("planner.nextDoneCta"),
    href: "#/analysis",
  };
}

export function getRecentStats(records: StudyRecord[], days: number): RecentStats {
  const dates = Array.from({ length: days }, (_, index) => toISODate(addDays(todayStart(), index - days + 1)));
  const byDate = new Map(records.map((record) => [record.date, record]));
  const selected = dates.map((date) => byDate.get(date)).filter(Boolean) as StudyRecord[];
  const totalMinutes = selected.reduce((total, record) => total + getRecordMinutes(record), 0);
  const avgCompletion = selected.length
    ? selected.reduce((total, record) => total + getCompletionPercent(record.completion), 0) / selected.length
    : 0;
  const avgAccuracy = selected.length
    ? selected.reduce((total, record) => total + getRecordAccuracyPercent(record), 0) / selected.length
    : 0;

  let gapDays = 0;
  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    if (byDate.has(dates[i])) {
      streak++;
    } else {
      if (streak > 0) break;
      gapDays++;
    }
  }

  return {
    recordedDays: selected.length,
    totalMinutes,
    avgMinutes: selected.length ? Math.round(totalMinutes / selected.length) : 0,
    avgCompletion: Math.round(avgCompletion),
    avgAccuracy: Math.round(avgAccuracy),
    gapDays,
    streak,
    byDate,
  };
}

function getRecordMinutes(record: StudyRecord): number {
  if (!record?.minutes) return 0;
  return RECORD_MODULE_KEYS.reduce((total, key) => total + Number(record.minutes?.[key] || 0), 0);
}

function getCompletionPercent(completion: string): number {
  const map: Record<string, number> = { done: 100, partial: 60, minimum: 30, missed: 0 };
  return map[completion] || 0;
}

function getRecordAccuracyPercent(record: StudyRecord): number {
  if (!record?.accuracy) return 0;
  const match = /(\d+)\s*\/\s*(\d+)/.exec(record.accuracy);
  if (!match) return 0;
  const correct = Number(match[1]);
  const total = Number(match[2]);
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

export function getModuleTotals(records: StudyRecord[]): Record<string, number> {
  const totals: Record<string, number> = {};
  RECORD_MODULE_KEYS.forEach((key) => { totals[key] = 0; });
  records.forEach((record) => {
    RECORD_MODULE_KEYS.forEach((key) => {
      totals[key] += Number(record.minutes?.[key] || 0);
    });
  });
  return totals;
}

export function getModuleCountTotals(records: StudyRecord[]): Record<string, number> {
  const totals: Record<string, number> = {};
  RECORD_MODULE_KEYS.forEach((key) => { totals[key] = 0; });
  records.forEach((record) => {
    RECORD_MODULE_KEYS.forEach((key) => {
      totals[key] += Number(record.moduleCounts?.[key] || 0);
    });
  });
  return totals;
}

export function getCauseCounts(records: StudyRecord[]): Record<string, number> {
  const counts: Record<string, number> = {};
  records.forEach((record) => {
    (record.causes || []).forEach((cause) => {
      counts[cause] = (counts[cause] || 0) + 1;
    });
  });
  return counts;
}

export function buildAnalysisSuggestions(stats: RecentStats, health: PlanHealth, moduleTotals: Record<string, number>, causes: Record<string, number>, settings: PlanSettings): string[] {
  const suggestions: string[] = [];
  if (stats.recordedDays < 4) suggestions.push(t("planner.sgFewRecords"));
  if (stats.avgCompletion < 70) suggestions.push(t("planner.sgLowCompletion"));
  if (stats.avgAccuracy && stats.avgAccuracy < 70) suggestions.push(t("planner.sgLowAccuracy"));

  const weakestModule = Object.entries(moduleTotals).sort((a, b) => a[1] - b[1])[0];
  if (weakestModule && weakestModule[1] < Math.max(30, stats.totalMinutes * 0.08)) {
    suggestions.push(t("planner.sgWeakModule", { module: moduleLabel(weakestModule[0]) }));
  }

  const topCause = Object.entries(causes).sort((a, b) => b[1] - a[1])[0];
  if (topCause) suggestions.push(t("planner.sgTopCause", { cause: tOption("errorCause", topCause[0]) }));
  if (health.score < 60) suggestions.push(t("planner.sgLowHealth"));
  if (!suggestions.length) suggestions.push(t("planner.sgStable", { modules: settings.focusModules.map((key) => moduleLabel(key)).join(t("common.listSep")) || t("planner.sgStableFallback") }));
  return suggestions;
}

export function buildTomorrowSuggestion(record: StudyRecord) {
  const minutes = getRecordMinutes(record);
  const lowCompletion = getCompletionPercent(record.completion) < 70;
  const lowAccuracy = getRecordAccuracyPercent(record) > 0 && getRecordAccuracyPercent(record) < 70;
  return {
    title: lowCompletion ? t("planner.tmShrinkTitle") : lowAccuracy ? t("planner.tmReviewTitle") : t("planner.tmKeepTitle"),
    minutes,
    detail: lowCompletion
      ? t("planner.tmShrinkDetail")
      : lowAccuracy
      ? t("planner.tmReviewDetail")
      : t("planner.tmKeepDetail"),
  };
}

export function summarizeModuleTimes(minutes: Record<string, number>): string {
  const items = RECORD_MODULE_KEYS
    .map((key) => [moduleLabel(key), Number(minutes[key] || 0)] as [string, number])
    .filter(([, value]) => value > 0)
    .map(([label, value]) => `${label} ${Math.round(value)}min`);
  return items.length ? items.join(t("common.listSep")) : t("planner.noModuleTime");
}

export function summarizeModuleCounts(minutes: Record<string, number>): string {
  const items = RECORD_MODULE_KEYS
    .map((key) => [key, Number(minutes[key] || 0)] as [string, number])
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${moduleLabel(key)} ${Math.round(value)}${tOption("countUnit", key)}`);
  return items.length ? items.join(t("common.listSep")) : t("planner.noModuleCount");
}

function findConsecutiveCause(records: StudyRecord[]): string | null {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, 3);
  if (recent.length < 3) return null;

  const firstCauses = new Set(recent[0].causes || []);
  for (const cause of firstCauses) {
    if (
      (recent[1].causes || []).includes(cause) &&
      (recent[2].causes || []).includes(cause)
    ) {
      return cause;
    }
  }
  return null;
}

function mapCauseToModule(cause: string): string {
  const causeModuleMap: Record<string, string> = {
    "词义差别": "vocab",
    "固定搭配": "grammar",
    "接续形式": "grammar",
    "定位慢": "reading",
    "听漏关键词": "listening",
    "时间不够": "review",
    "复盘不足": "review",
    "任务过量": "review",
  };
  return causeModuleMap[cause] || "review";
}

export function autoAdjustPlan(plan: GeneratedPlan, records: StudyRecord[]): GeneratedPlan {
  if (!plan) return plan;

  const dates = Array.from({ length: 7 }, (_, i) => toISODate(addDays(todayStart(), i - 6)));
  const recordsMap = new Map(records.map((r) => [r.date, r]));
  const recentRecords = dates.map((d) => recordsMap.get(d)).filter(Boolean) as StudyRecord[];

  if (recentRecords.length === 0) return JSON.parse(JSON.stringify(plan));

  const stats = getRecentStats(recentRecords, 7);
  const adjustedPlan: GeneratedPlan = JSON.parse(JSON.stringify(plan));

  if (stats.avgCompletion < 50) {
    const factor = 0.8;
    adjustedPlan.dailyPlan = adjustedPlan.dailyPlan.map((day) => {
      const adjustedTasks = day.tasks.map((task) => ({
        ...task,
        minutes: Math.max(5, Math.round(task.minutes * factor)),
      }));
      return {
        ...day,
        targetMinutes: Math.round(day.targetMinutes * factor),
        tasks: adjustedTasks,
        totalMinutes: adjustedTasks.reduce((sum, t) => sum + t.minutes, 0),
      };
    });
  } else if (stats.avgCompletion > 90 && stats.avgAccuracy > 80) {
    const factor = 1.1;
    adjustedPlan.dailyPlan = adjustedPlan.dailyPlan.map((day) => {
      const adjustedTasks = day.tasks.map((task) => ({
        ...task,
        minutes: Math.round(task.minutes * factor),
      }));
      return {
        ...day,
        targetMinutes: Math.round(day.targetMinutes * factor),
        tasks: adjustedTasks,
        totalMinutes: adjustedTasks.reduce((sum, t) => sum + t.minutes, 0),
      };
    });
  }

  const consecutiveCause = findConsecutiveCause(recentRecords);
  if (consecutiveCause) {
    const targetModule = mapCauseToModule(consecutiveCause);
    adjustedPlan.dailyPlan = adjustedPlan.dailyPlan.map((day) => {
      const adjustedTasks = day.tasks.map((task) => {
        if (task.module === targetModule) {
          return { ...task, minutes: task.minutes + 10 };
        }
        return task;
      });
      return {
        ...day,
        tasks: adjustedTasks,
        totalMinutes: adjustedTasks.reduce((sum, t) => sum + t.minutes, 0),
      };
    });
  }

  return adjustedPlan;
}

export function getModuleWeakness(records: StudyRecord[], module: string): number {
  if (!records || records.length === 0 || !module) return 50;

  const moduleCauseMap: Record<string, string[]> = {
    kanji: ["词义差别", "书写错误"],
    vocab: ["词义差别", "不认识生词", "固定搭配"],
    grammar: ["接续形式", "固定搭配", "文法接错"],
    reading: ["定位慢", "考法不熟", "文章看不懂"],
    listening: ["听漏关键词", "考法不熟", "语速问题"],
  };

  const relevantCauses = moduleCauseMap[module] || [];

  let totalWeightedAccuracy = 0;
  let totalWeight = 0;
  let totalModuleMinutes = 0;
  let totalAllMinutes = 0;
  let causeCount = 0;

  for (const record of records) {
    const moduleMins = Number(record.minutes?.[module] || 0);
    totalModuleMinutes += moduleMins;
    totalAllMinutes += getRecordMinutes(record);

    if (moduleMins > 0) {
      const accuracy = getRecordAccuracyPercent(record);
      if (accuracy > 0) {
        const weight = moduleMins / Math.max(1, getRecordMinutes(record));
        totalWeightedAccuracy += accuracy * weight;
        totalWeight += weight;
      }
    }

    const recordCauses = record.causes || record.errorCauses || [];
    causeCount += recordCauses.filter((c) => relevantCauses.includes(c)).length;
  }

  const avgAccuracy = totalWeight > 0 ? totalWeightedAccuracy / totalWeight : 70;
  const expectedRatio = (RECORD_MODULE_KEYS as string[]).includes(module) ? 1 / RECORD_MODULE_KEYS.length : 0;
  const actualRatio = totalAllMinutes > 0 ? totalModuleMinutes / totalAllMinutes : 0;
  const timeGap = Math.max(0, expectedRatio - actualRatio);

  const accuracyScore = Math.max(0, (100 - avgAccuracy)) * 0.5;
  const timeScore = timeGap * 200 * 0.25;
  const causeScore = Math.min(100, causeCount * 15) * 0.25;

  return clamp(Math.round(accuracyScore + timeScore + causeScore), 0, 100);
}

export function suggestPlanAdjustment(records: StudyRecord[], settings: PlanSettings): {
  type: "increase" | "decrease" | "maintain";
  reason: string;
  details: string[];
} {
  if (!records || records.length === 0) {
    return {
      type: "maintain",
      reason: "暂无足够记录数据",
      details: ["需要至少3天学习记录才能给出调整建议"],
    };
  }

  const stats = getRecentStats(records, 7);
  const details: string[] = [];
  let type: "increase" | "decrease" | "maintain" = "maintain";
  let reason: string;

  if (stats.recordedDays < 3) {
    reason = `近7天仅有${stats.recordedDays}天记录，继续当前计划积累数据`;
    details.push(`每日目标 ${settings.dailyMinutes} 分钟`);
    details.push("建议先完成连续3天记录，再根据反馈调整计划");
    return { type, reason, details };
  }

  if (stats.avgCompletion < 50) {
    type = "decrease";
    reason = `近7天平均完成度仅${stats.avgCompletion}%，建议降低任务量`;
    details.push(`当前每日目标 ${settings.dailyMinutes} 分钟，建议降至 ${Math.round(settings.dailyMinutes * 0.8)} 分钟`);
    details.push("把大任务拆成 2-3 个 15-20 分钟的小块");
  } else if (stats.avgCompletion > 90 && stats.avgAccuracy > 80) {
    type = "increase";
    reason = `近7天完成度${stats.avgCompletion}%、正确率${stats.avgAccuracy}%，可适当加量`;
    details.push(`当前每日目标 ${settings.dailyMinutes} 分钟，可提升至 ${Math.round(settings.dailyMinutes * 1.1)} 分钟`);
    details.push("建议增加薄弱模块的精练或模拟套题");
  } else {
    reason = "当前节奏稳定，建议保持";
    details.push(`近7天完成度 ${stats.avgCompletion}%，正确率 ${stats.avgAccuracy}%`);
    details.push("继续当前计划，关注错题归因");
  }

  const moduleTotals = getModuleTotals(records);
  const weakest = Object.entries(moduleTotals).sort(([, a], [, b]) => a - b)[0];
  if (weakest && weakest[1] < Math.max(30, stats.totalMinutes * 0.08)) {
    const label = MODULE_LABELS[weakest[0]] || weakest[0];
    details.push(`${label}投入过少（${Math.round(weakest[1])}min），建议增加专项练习`);
  }

  const causes = getCauseCounts(records);
  const topCause = Object.entries(causes).sort(([, a], [, b]) => b - a)[0];
  if (topCause && topCause[1] >= 3) {
    details.push(`高频错因「${topCause[0]}」出现 ${topCause[1]} 次，建议专项复盘`);
  }

  return { type, reason, details };
}
