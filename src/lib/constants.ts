import type { Level, ModuleKey } from "./types";

export const STORAGE_KEYS = {
  profiles: "jlptSprintDeskProfiles",
  activeProfile: "jlptSprintDeskActiveProfile",
};

export const ROUTES = {
  dashboard: { title: "学习总览", eyebrow: "Study Dashboard" },
  setup: { title: "计划设置", eyebrow: "Profile & Planning" },
  plan: { title: "学习计划", eyebrow: "Generated Plan" },
  record: { title: "每日记录", eyebrow: "Daily Feedback" },
  analysis: { title: "复盘分析", eyebrow: "Learning Analytics" },
  export: { title: "导出备份", eyebrow: "Export & Backup" },
};

export const MODULES = [
  { key: "kanji" as ModuleKey, label: "汉字", short: "汉" },
  { key: "vocab" as ModuleKey, label: "词汇", short: "词" },
  { key: "grammar" as ModuleKey, label: "语法", short: "文" },
  { key: "reading" as ModuleKey, label: "阅读", short: "読" },
  { key: "listening" as ModuleKey, label: "听力", short: "聴" },
  { key: "mock" as ModuleKey, label: "套题", short: "模" },
  { key: "review" as ModuleKey, label: "复盘", short: "复" },
];

export const RECORD_MODULE_KEYS: ModuleKey[] = ["kanji", "vocab", "grammar", "reading", "listening"];

export const MODULE_LABELS: Record<string, string> = Object.fromEntries(
  MODULES.map((item) => [item.key, item.label])
);

export const MODULE_SHORTS: Record<string, string> = Object.fromEntries(
  MODULES.map((item) => [item.key, item.short])
);

export const MODULE_COLORS: Record<string, string> = {
  kanji: "#315f4f",
  vocab: "#35647c",
  grammar: "#b77a20",
  reading: "#2f7c75",
  listening: "#b95645",
  mock: "#6d5486",
  review: "#7a8a84",
};

export const MODULE_COUNT_UNITS: Record<string, string> = {
  kanji: "字",
  vocab: "词",
  grammar: "条/题",
  reading: "篇",
  listening: "段",
};

// Example counts per module — the "e.g." prefix is localized at render time.
export const MODULE_COUNT_PLACEHOLDERS: Record<string, string> = {
  kanji: "20",
  vocab: "80",
  grammar: "10",
  reading: "2",
  listening: "3",
};

export const LEVEL_CONFIG: Record<Level, { label: string; targetScore: number; baseWeeks: number; weights: Record<string, number> }> = {
  N5: { label: "N5 入门", targetScore: 100, baseWeeks: 10, weights: { kanji: 0.9, vocab: 1.2, grammar: 1.1, reading: 0.8, listening: 1 } },
  N4: { label: "N4 基础", targetScore: 105, baseWeeks: 12, weights: { kanji: 1, vocab: 1.2, grammar: 1.2, reading: 0.95, listening: 1.05 } },
  N3: { label: "N3 进阶", targetScore: 110, baseWeeks: 14, weights: { kanji: 1.05, vocab: 1.15, grammar: 1.2, reading: 1.1, listening: 1.1 } },
  N2: { label: "N2 强化", targetScore: 115, baseWeeks: 18, weights: { kanji: 1.1, vocab: 1.2, grammar: 1.25, reading: 1.2, listening: 1.18 } },
  N1: { label: "N1 冲刺", targetScore: 120, baseWeeks: 22, weights: { kanji: 1.1, vocab: 1.15, grammar: 1.2, reading: 1.35, listening: 1.25 } },
};

export const BASE_LEVELS: Record<string, { label: string; weight: number }> = {
  weak: { label: "薄弱", weight: 0.38 },
  mid: { label: "一般", weight: 0 },
  good: { label: "稳定", weight: -0.18 },
  strong: { label: "较强", weight: -0.28 },
};

export const ERROR_CAUSES = [
  "词义差别",
  "固定搭配",
  "接续形式",
  "定位慢",
  "听漏关键词",
  "时间不够",
  "复盘不足",
  "任务过量",
];

export const COMPLETION_OPTIONS: [string, string][] = [
  ["done", "完成主计划"],
  ["partial", "完成一部分"],
  ["minimum", "只完成保底"],
  ["missed", "今天断档"],
];

export const STATIC_SELECT_OPTIONS: Record<string, [string, string][]> = {
  currentLevel: [
    ["N2 稳定", "N2 稳定"],
    ["N2 边缘", "N2 边缘"],
    ["N3 稳定", "N3 稳定"],
    ["长期没学", "长期没学"],
  ],
  state: [
    ["starter", "刚开始，资料很多但没节奏"],
    ["scattered", "学过一些，但三天打鱼两天晒网"],
    ["mocked", "刷过题，但分数不稳定"],
    ["urgent", "时间很近，想冲刺保分"],
  ],
  studyDay: [
    ["1", "第 1 天：今天刚开始"],
    ["2", "第 2-6 天：刚启动，还在建节奏"],
    ["7", "第 7 天以上：已有错题/词卡"],
  ],
  vocabBook: [
    ["green", "无敌绿宝书：按单元推进"],
    ["animal", "小动物系列：按等级主题推进"],
    ["red", "红宝书：核心词 + 补充词"],
    ["shinkanzen", "新完全掌握词汇"],
    ["soumatome", "総まとめN2词汇"],
    ["try", "TRY! N2"],
    ["speed", "速读N2词汇"],
    ["core6000", "核心6000词"],
    ["custom", "自定义：按我的词汇书页码/单元"],
  ],
  grammarBook: [
    ["blue", "蓝宝书/国内文法书"],
    ["shinkanzen", "新完全マスター 文法"],
    ["soumatome", "小动物/日本語総まとめ 文法"],
    ["try", "TRY 文法"],
    ["green", "新完全掌握N1文法"],
    ["kanzen", "完全掌握N2文法"],
    ["dictionary", "日本语文法辞典"],
    ["shadowing", "Shadowing日本語"],
    ["owned", "我手上已有文法书"],
  ],
  kanjiBook: [
    ["animal", "小动物/日本語総まとめ 汉字"],
    ["shinkanzen", "新完全マスター 汉字"],
    ["kanzen", "完全掌握汉字"],
    ["green", "绿宝书/红宝书配套汉字题"],
    ["basic", "汉字基础"],
    ["advanced", "高级汉字"],
    ["kanjiincontext", "漢字の語境"],
    ["owned", "我手上已有汉字书"],
  ],
  readingBook: [
    ["shinkanzen", "新完全掌握読解"],
    ["soumatome", "総まとめN2読解"],
    ["try", "TRY! N2読解"],
    ["speed", "速読N2"],
    ["mock", "真题阅读"],
    ["owned", "手头教材"],
  ],
  listeningBook: [
    ["shinkanzen", "新完全掌握聴解"],
    ["soumatome", "総まとめN2聴解"],
    ["try", "TRY! N2聴解"],
    ["nhk", "NHK新闻"],
    ["shadowing", "Shadowing日本語"],
    ["owned", "手头教材"],
  ],
  reviewReserve: [
    ["0.2", "保守：预留 20% 时间复习"],
    ["0.3", "推荐：预留 30% 时间复习"],
    ["0.4", "冲刺：预留 40% 时间复习"],
  ],
};

export const STATIC_WEAKNESS_OPTIONS: [string, string][] = [
  ["vocab", "文字词汇"],
  ["grammar", "文法"],
  ["reading", "读解"],
  ["listening", "听解"],
];

export const STATIC_BLOCKER_OPTIONS: [string, string][] = [
  ["procrastination", "容易拖延"],
  ["confused", "不知道先学什么"],
  ["review", "错题不复盘"],
  ["time", "做题时间不够"],
];

export const LEVEL_CONTENT_TARGETS: Record<Level, { vocab: number; grammar: number }> = {
  N5: { vocab: 800, grammar: 80 },
  N4: { vocab: 1500, grammar: 110 },
  N3: { vocab: 3500, grammar: 160 },
  N2: { vocab: 6000, grammar: 220 },
  N1: { vocab: 10000, grammar: 280 },
};

export const BOOK_LABELS: Record<string, Record<string, string>> = {
  vocabBook: Object.fromEntries(STATIC_SELECT_OPTIONS.vocabBook),
  grammarBook: Object.fromEntries(STATIC_SELECT_OPTIONS.grammarBook),
  kanjiBook: Object.fromEntries(STATIC_SELECT_OPTIONS.kanjiBook),
  readingBook: Object.fromEntries(STATIC_SELECT_OPTIONS.readingBook),
  listeningBook: Object.fromEntries(STATIC_SELECT_OPTIONS.listeningBook),
};

export const DEFAULT_SETTINGS = {
  level: "N1" as Level,
  currentLevel: "N2 边缘",
  examDate: "2026-07-05",
  targetScore: 115,
  weekdayMinutes: 120,
  weekendMinutes: 240,
  dailyMinutes: 120,
  sessionDays: [1, 2, 3, 4, 5, 6, 7],
  state: "scattered" as "starter" | "scattered" | "mocked" | "urgent",
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

export const RECORD_CHOICE_OPTIONS: Record<string, string[]> = {
  overtimeReason: ["没有明显超时", "新词太多", "例句读不懂", "文法接续反复查", "读解定位慢", "听力反复回放"],
  accuracyText: ["词汇 18/30，文法 12/20，听力 15/30", "语言知识 30/45，阅读 18/30，听力 20/35", "只记录错题数，正确率稍后补", "今天主要做订正，没有新增题组"],
  timeNote: ["阅读定位慢", "听力反应慢", "选项犹豫", "文法接续确认太久"],
  tomorrowFocus: ["先二刷文法错题", "先补听力关键词", "先复盘错词固定搭配", "先做一组限时读解", "只恢复节奏，不加量"],
  wrongQuestionDetails: ["文法第 8 题：接续误判", "读解第 2 篇：主旨题误选", "听力第 3 题：漏听转折", "词汇第 15 题：固定搭配误选", "今天没有明显错题"],
};

export const PHASE_LABELS: Record<string, string> = {
  startup: "启动期",
  foundation: "基础期",
  intensive: "强化期",
  review: "复习期",
  sprint: "冲刺期",
  exam: "考试期",
};

export interface ReferencePlanTask {
  module: string;
  title: string;
  method: string;
  minutes: number;
}

export interface ReferencePlanDay {
  label: string;
  title: string;
  body: string;
}

export interface ReferencePlan {
  title: string;
  subtitle: string;
  meta: string[];
  strategy: string;
  tasks: ReferencePlanTask[];
  minimum: string[];
  days: ReferencePlanDay[];
}

export const REFERENCE_PLAN: ReferencePlan = {
  title: "默认参考计划",
  subtitle: "给第一次使用的人快速理解学习节奏；它只作参考，不会写入 generatedPlan，也不会覆盖用户自己的计划。",
  meta: ["N2", "48 天", "120 min / day", "语法 + 听力", "汉字复盘"],
  strategy:
    "系统强化期以 N2 高频汉字、敬语/商务词汇、被动使役等语法和新闻听力为主线。每天保留一个主攻模块，再用短复盘回收错题。",
  tasks: [
    {
      module: "kanji",
      title: "汉字复盘：Set 45-50",
      method: "15 个项目，优先处理读音混淆和形近词。",
      minutes: 25,
    },
    {
      module: "grammar",
      title: "语法：被动 vs 使役",
      method: "用 8-10 题确认接续差异，并写 2 个自造句。",
      minutes: 35,
    },
    {
      module: "listening",
      title: "听力：NHK News Web Easy",
      method: "先抓关键词，再重听关键句，记录误听原因。",
      minutes: 30,
    },
    {
      module: "review",
      title: "错题回收：敬语与商务词汇",
      method: "只整理今天最影响得分的 3 个错误原因。",
      minutes: 15,
    },
  ],
  minimum: [
    "15 分钟：回看今天最卡的语法接续或听力关键词。",
    "10 分钟：复习 20 个 N2 高频词或汉字读音。",
    "5 分钟：写下明天第一步，避免重新启动成本。",
  ],
  days: [
    {
      label: "Day 1-3",
      title: "汉字与语法底盘",
      body: "汉字 Set 45-50，语法围绕被动、使役、敬语接续做短题组。",
    },
    {
      label: "Day 4-7",
      title: "听力与阅读交替",
      body: "听力精听新闻短段，阅读训练长句断句和转折定位。",
    },
    {
      label: "Day 8-10",
      title: "分项计时",
      body: "语言知识、阅读、听力各做一次限时小套题，记录耗时。",
    },
    {
      label: "Day 11-14",
      title: "错因回收",
      body: "只处理重复错因，减少新内容，把复盘写入下一轮计划。",
    },
  ],
};
