import type { DailyPlanItem, GeneratedPlan, Level, PlanHealth, PlanSettings, RecentStats, RoadmapItem, StudyBudget, StudyRecord, StudyTask } from "./types";
import {
  BASE_LEVELS,
  LEVEL_CONFIG,
  LEVEL_CONTENT_TARGETS,
  MODULE_LABELS,
  RECORD_MODULE_KEYS,
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
import { t, tOption, moduleLabel, levelLabel as i18nLevelLabel } from "../i18n";

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
      title: buildDayTitle(tasks, phase),
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

function buildDayTitle(tasks: StudyTask[], phase: string): string {
  if (tasks.some((task) => task.module === "mock")) return phase.includes("冲刺") ? t("gen.dtMockSprint") : t("gen.dtMockReview");
  const main = tasks.find((task) => !["review", "vocab", "grammar"].includes(task.module));
  return main ? t("gen.dtMain", { module: moduleLabel(main.module) }) : t("gen.dtFallback");
}

export function buildStudyBudget(settings: PlanSettings): StudyBudget {
  const sessionDays = normalizeDays(settings.sessionDays);
  const weeklyMinutes = sessionDays.reduce((total, day) => {
    return total + (day >= 6 ? settings.weekendMinutes : settings.weekdayMinutes);
  }, 0);
  const dailyMinutes = Math.round(weeklyMinutes / Math.max(1, sessionDays.length));
  const moduleWeights = buildModuleWeights(settings);
  const moduleMinutes = allocateMinutes(dailyMinutes, moduleWeights, 10);
  const totalMinutes = Object.values(moduleMinutes).reduce((sum, m) => sum + m, 0);
  const contentBudget = buildContentBudget(settings, weeklyMinutes);
  return {
    weekdayMinutes: settings.weekdayMinutes,
    weekendMinutes: settings.weekendMinutes,
    dailyMinutes,
    weeklyMinutes,
    totalMinutes,
    sessionDays,
    moduleWeights,
    moduleMinutes,
    ...contentBudget,
  };
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
  const entries = Object.entries(weights).filter(([, weight]) => weight > 0);
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0) || 1;
  const minutes: Record<string, number> = {};

  // When the daily budget is too small to give every module the minimum block,
  // distribute strictly proportionally (no floor) so the sum can't exceed `total`.
  if (total < entries.length * minBlock) {
    entries.forEach(([key, weight]) => {
      minutes[key] = Math.max(0, Math.round((total * weight) / totalWeight));
    });
    return minutes;
  }

  entries.forEach(([key, weight]) => {
    minutes[key] = Math.max(minBlock, roundToFive((total * weight) / totalWeight));
  });

  // The min-floor + round-to-five can overshoot the budget. Trim the largest
  // allocation by 5 at a time (never below minBlock) until the sum fits `total`.
  let sum = entries.reduce((acc, [key]) => acc + minutes[key], 0);
  while (sum > total) {
    let target: string | null = null;
    for (const [key] of entries) {
      if (minutes[key] - 5 >= minBlock && (target === null || minutes[key] > minutes[target])) {
        target = key;
      }
    }
    if (target === null) break; // every module already at the floor
    minutes[target] -= 5;
    sum -= 5;
  }

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
    currentProgress: "",
    resources: "",
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
      label: t("gen.stLabel"),
      title: dayOne ? t("gen.stTitleDay1") : t("gen.stTitleOther"),
      text: dayOne ? t("gen.stTextDay1") : t("gen.stTextOther"),
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
      label: t("gen.wrLabel"),
      title: blockers.includes("review") ? t("gen.wrTitleReview") : t("gen.wrTitleOther"),
      text: blockers.includes("review") ? t("gen.wrTextReview") : t("gen.wrTextOther"),
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
      label: t("gen.crLabel"),
      title: t("gen.crTitle"),
      text: t("gen.crText"),
      minutes: warmupMinutes,
      priority: "启动",
    },
    {
      id: `d${dayIndex}-cram-${primaryModule}`,
      module: primaryModule as StudyTask["module"],
      label: moduleLabel(primaryModule),
      title: t("gen.crMainTitle", { module: moduleLabel(primaryModule) }),
      text: blockers.includes("time") ? t("gen.crTextMock") : t("gen.crTextOther"),
      minutes: mainMinutes,
      priority: "重点",
    },
  ];

  if (wrapMinutes > 0) {
    tasks.push({
      id: `d${dayIndex}-wrap`,
      module: "review",
      label: t("gen.wrLabel"),
      title: blockers.includes("review") ? t("gen.crWrapTitleReview") : t("gen.crWrapTitleOther"),
      text: t("gen.crWrapText"),
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
      title: phase.includes("冲刺") ? t("gen.tbKanjiSprint") : t("gen.tbKanjiBase"),
      text: t("gen.tbKanjiText", { book: bookNote }),
    },
    vocab: {
      title: phase.includes("基础") ? t("gen.tbVocabBase") : t("gen.tbVocabOther"),
      text: t("gen.tbVocabText", { book: bookNote, n: settings.dailyVocabGoal }),
    },
    grammar: {
      title: phase.includes("冲刺") ? t("gen.tbGrammarSprint") : t("gen.tbGrammarBase"),
      text: t("gen.tbGrammarText", { book: bookNote, n: settings.dailyGrammarGoal }),
    },
    reading: {
      title: phase.includes("冲刺") ? t("gen.tbReadingSprint") : t("gen.tbReadingBase"),
      text: t("gen.tbReadingText", { book: bookNote }),
    },
    listening: {
      title: phase.includes("冲刺") ? t("gen.tbListeningSprint") : t("gen.tbListeningBase"),
      text: t("gen.tbListeningText", { book: bookNote }),
    },
  };

  const bank = taskBank[module] || { title: t("gen.tbFallbackTitle"), text: t("gen.tbFallbackText") };
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
  const knownBooks: Record<string, string[]> = {
    kanji: ["animal", "shinkanzen", "kanzen", "green", "owned"],
    vocab: ["green", "animal", "red", "custom"],
    grammar: ["blue", "shinkanzen", "soumatome", "try", "owned"],
    reading: [],
    listening: [],
  };
  const bookKey = settings[`${module}Book` as keyof PlanSettings] as string;
  if (!bookKey || !knownBooks[module]?.includes(bookKey)) return "";
  const book = tOption("book", `${module}_${bookKey}`);
  return book ? t("gen.bookNote", { book }) : "";
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
  const weakModules = settings.weaknesses.map((key) => moduleLabel(key));
  const focus = weakModules.join(t("common.listSep")) || t("gen.stratFocusBalanced");
  const countdown = daysLeft === null ? t("gen.stratCountdownUnknown") : t("gen.stratCountdown", { n: daysLeft });
  return {
    summary: t("gen.stratSummary", { countdown, focus, weekly: budget.weeklyMinutes, status: tOption("budgetStatus", budget.status as string), review: budget.desiredReviewDays }),
    weakModules,
    focus,
  };
}

function buildPrinciples(settings: PlanSettings): string[] {
  const stateLabel = settings.state ? tOption("state", settings.state) : t("gen.prinUnset");
  return [
    t("gen.prinLevel", { level: tOption("currentLevel", settings.currentLevel as string), state: stateLabel }),
    t("gen.prinBase"),
    t("gen.prinWeak"),
    t("gen.prinError"),
    settings.customPlanInput || t("gen.prinRolling"),
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
      t("gen.minDay1a"),
      t("gen.minDay1b", { module: moduleLabel(secondary) }),
      t("gen.minDay1c", { module: moduleLabel(focus) }),
    ];
  }
  return [
    t("gen.minOtherA"),
    t("gen.minOtherB", { module: moduleLabel(secondary) }),
    t("gen.minOtherC", { module: moduleLabel(focus) }),
  ];
}

function buildRoadmap(horizon: number): RoadmapItem[] {
  const phases = [
    { ratio: 0.32, title: "基础补强期", focus: t("gen.rmFocus1") },
    { ratio: 0.66, title: "系统强化期", focus: t("gen.rmFocus2") },
    { ratio: 0.88, title: "套题整合期", focus: t("gen.rmFocus3") },
    { ratio: 1, title: "冲刺微调期", focus: t("gen.rmFocus4") },
  ];

  return phases.map((phase, index) => {
    const start = index === 0 ? 1 : Math.round(horizon * phases[index - 1].ratio) + 1;
    const end = Math.round(horizon * phase.ratio);
    return {
      title: phase.title,
      dayRange: `Day ${start}-${end}`,
      focus: phase.focus,
      method: t("gen.rmMethod", { n: Math.round(horizon * 0.15) }),
    };
  });
}

function buildMethodBasis(settings: PlanSettings, budget: StudyBudget): string {
  const days = daysUntil(settings.examDate);
  const daysText = days === null ? t("gen.mbDaysUnknown") : t("gen.mbDaysLeft", { n: days });
  const level = i18nLevelLabel(LEVEL_CONFIG[settings.level]?.label || settings.level);
  return t("gen.mbSummary", { level, days: daysText, min: budget.dailyMinutes, status: tOption("budgetStatus", budget.status as string) });
}

function buildCheckpoints(dayIndex: number, horizon: number, phase: string): string[] {
  if (dayIndex === 1) return [t("gen.cpConfirmMaterial"), t("gen.cpFirstRecord")];
  if (dayIndex % 14 === 0) return [t("gen.cpBiweekly"), t("gen.cpAdjustWeak")];
  if (dayIndex === horizon) return [t("gen.cpFinalReview"), t("gen.cpExamChecklist")];
  return [phase.includes("冲刺") ? t("gen.cpRecordCause") : t("gen.cpFeedback")];
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

export function getReferencePlan(): import("./constants").ReferencePlan {
  return {
    title: t("ref.title"),
    subtitle: t("ref.subtitle"),
    meta: ["N2", t("ref.meta2"), "120 min / day", t("ref.meta4"), t("ref.meta5")],
    strategy: t("ref.strategy"),
    tasks: [
      { module: "kanji", title: t("ref.t1Title"), method: t("ref.t1Method"), minutes: 25 },
      { module: "grammar", title: t("ref.t2Title"), method: t("ref.t2Method"), minutes: 35 },
      { module: "listening", title: t("ref.t3Title"), method: t("ref.t3Method"), minutes: 30 },
      { module: "review", title: t("ref.t4Title"), method: t("ref.t4Method"), minutes: 15 },
    ],
    minimum: [t("ref.min1"), t("ref.min2"), t("ref.min3")],
    days: [
      { label: "Day 1-3", title: t("ref.d1Title"), body: t("ref.d1Body") },
      { label: "Day 4-7", title: t("ref.d2Title"), body: t("ref.d2Body") },
      { label: "Day 8-10", title: t("ref.d3Title"), body: t("ref.d3Body") },
      { label: "Day 11-14", title: t("ref.d4Title"), body: t("ref.d4Body") },
    ],
  };
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
        label: t("gen.manualEditLabel"),
        title: t("gen.manualEditTitle"),
        text: editText,
        minutes: day.totalMinutes,
        // Stable key resolved via tOption("priority", …) at display time.
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

/** Stable signature of the last 7 days of records — changes only when the data
 *  that drives the smart adjustment changes. Used to gate re-applying it. */
export function recordsSignature(records: StudyRecord[]): string {
  const dates = Array.from({ length: 7 }, (_, i) => toISODate(addDays(todayStart(), i - 6)));
  const byDate = new Map(records.map((r) => [r.date, r]));
  return dates
    .map((d) => {
      const r = byDate.get(d);
      if (!r) return `${d}:_`;
      const mins = RECORD_MODULE_KEYS.reduce((t, k) => t + Number(r.minutes?.[k] || 0), 0);
      return `${d}:${r.completion}:${r.accuracy || ""}:${mins}:${(r.causes || []).join("|")}`;
    })
    .join(";");
}

/**
 * Apply the data-driven adjustment by changing the underlying time settings
 * (so budget, pie chart, daily target and tasks all stay consistent after a
 * regeneration) plus nudging weak-module focus. Returns null when there is
 * nothing to apply (maintain / not enough data).
 */
export function adjustSettingsFromRecords(settings: PlanSettings, records: StudyRecord[]): PlanSettings | null {
  const advice = suggestPlanAdjustment(records, settings);
  if (advice.type === "maintain") return null;

  const factor = advice.type === "decrease" ? 0.8 : 1.1;
  const dates = Array.from({ length: 7 }, (_, i) => toISODate(addDays(todayStart(), i - 6)));
  const byDate = new Map(records.map((r) => [r.date, r]));
  const recent = dates.map((d) => byDate.get(d)).filter(Boolean) as StudyRecord[];

  const next: Partial<PlanSettings> = {
    weekdayMinutes: Math.round(settings.weekdayMinutes * factor),
    weekendMinutes: Math.round(settings.weekendMinutes * factor),
    dailyMinutes: Math.round((settings.dailyMinutes || settings.weekdayMinutes) * factor),
  };

  // If one error cause recurs across recent days, give its module more weight.
  const cause = findConsecutiveCause(recent);
  if (cause) {
    const mod = mapCauseToModule(cause);
    if (mod && mod !== "review") {
      const weaknesses = settings.weaknesses || [];
      if (!weaknesses.includes(mod)) next.weaknesses = [...weaknesses, mod];
    }
  }

  return normalizeSettings({ ...settings, ...next });
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
      reason: t("adjust.noData"),
      details: [t("adjust.needThreeDays")],
    };
  }

  const stats = getRecentStats(records, 7);
  const details: string[] = [];
  let type: "increase" | "decrease" | "maintain" = "maintain";
  let reason: string;

  if (stats.recordedDays < 3) {
    reason = t("adjust.fewRecords", { n: stats.recordedDays });
    details.push(t("adjust.dailyGoalMin", { n: settings.dailyMinutes }));
    details.push(t("adjust.finishThreeFirst"));
    return { type, reason, details };
  }

  if (stats.avgCompletion < 50) {
    type = "decrease";
    reason = t("adjust.decreaseReason", { n: stats.avgCompletion });
    details.push(t("adjust.decreaseDetail", { a: settings.dailyMinutes, b: Math.round(settings.dailyMinutes * 0.8) }));
    details.push(t("adjust.decreaseTip"));
  } else if (stats.avgCompletion > 90 && stats.avgAccuracy > 80) {
    type = "increase";
    reason = t("adjust.increaseReason", { c: stats.avgCompletion, acc: stats.avgAccuracy });
    details.push(t("adjust.increaseDetail", { a: settings.dailyMinutes, b: Math.round(settings.dailyMinutes * 1.1) }));
    details.push(t("adjust.increaseTip"));
  } else {
    reason = t("adjust.maintainReason");
    details.push(t("adjust.maintainDetail", { c: stats.avgCompletion, acc: stats.avgAccuracy }));
    details.push(t("adjust.maintainTip"));
  }

  const moduleTotals = getModuleTotals(records);
  const weakest = Object.entries(moduleTotals).sort(([, a], [, b]) => a - b)[0];
  if (weakest && weakest[1] < Math.max(30, stats.totalMinutes * 0.08)) {
    details.push(t("adjust.weakModule", { label: moduleLabel(weakest[0]), n: Math.round(weakest[1]) }));
  }

  const causes = getCauseCounts(records);
  const topCause = Object.entries(causes).sort(([, a], [, b]) => b - a)[0];
  if (topCause && topCause[1] >= 3) {
    details.push(t("adjust.topCause", { cause: tOption("errorCause", topCause[0]), n: topCause[1] }));
  }

  return { type, reason, details };
}
