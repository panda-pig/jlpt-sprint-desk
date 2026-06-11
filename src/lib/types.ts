export type Level = "N1" | "N2" | "N3" | "N4" | "N5";

export type ModuleKey = "kanji" | "vocab" | "grammar" | "reading" | "listening" | "mock" | "review";

export type Completion = "done" | "partial" | "minimum" | "missed";

export interface Profile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanSettings {
  level: Level;
  currentLevel: string;
  examDate: string;
  targetScore: number;
  weekdayMinutes: number;
  weekendMinutes: number;
  dailyMinutes: number;
  sessionDays: number[];
  state: "starter" | "scattered" | "mocked" | "urgent";
  studyDay: string;
  vocabBook: string;
  grammarBook: string;
  kanjiBook: string;
  readingBook: string;
  listeningBook: string;
  learnedVocab: number;
  dailyVocabGoal: number;
  learnedGrammar: number;
  dailyGrammarGoal: number;
  reviewReserve: number;
  weaknesses: string[];
  blockers: string[];
  kanjiBase: string;
  vocabBase: string;
  grammarBase: string;
  readingBase: string;
  listeningBase: string;
  focusModules: string[];
  currentProgress: string;
  resources: string;
  reviewStyle: string;
  customRules: string;
  customPlanInput: string;
}

export interface StudyTask {
  id: string;
  module: ModuleKey | "startup" | "review" | "mock";
  label: string;
  title?: string;
  text: string;
  minutes: number;
  priority?: string;
}

export interface DailyPlanItem {
  dayIndex: number;
  label: string;
  date: string;
  weekday: string;
  phase: string;
  title: string;
  totalMinutes: number;
  targetMinutes: number;
  isLightDay: boolean;
  tasks: StudyTask[];
  checkpoints: string[];
}

export interface RoadmapItem {
  title: string;
  dayRange: string;
  focus: string;
  method: string;
}

export interface StudyBudget {
  status: string;
  timeStatus: string;
  weeklyMinutes: number;
  totalMinutes: number;
  dailyMinutes: number;
  moduleMinutes: Record<string, number>;
  desiredReviewDays: number;
  availableLearningDays: number;
  reviewDaysLeft: number;
  dailySuggested: number;
  startupDailySuggested: number;
  vocabDailySuggested: number;
  grammarDailySuggested: number;
  skillDailySuggested: number;
  reviewDailySuggested: number;
  feasibleVocabGoal: number;
  feasibleGrammarGoal: number;
  weekdayMinutes: number;
  weekendMinutes: number;
  sessionDays: number[];
  moduleWeights: Record<string, number>;
  targetVocab: number;
  targetGrammar: number;
  vocabRemaining: number;
  grammarRemaining: number;
  vocabDays: number | null;
  grammarDays: number | null;
  learningDays: number | null;
  advice: string[];
}

export interface GeneratedPlan {
  version: number;
  id: string;
  profileId: string;
  generatedAt: string;
  startDate: string;
  level: Level;
  examDate: string;
  daysLeft: number | null;
  horizon: number;
  phase: string;
  strategy: {
    summary: string;
    weakModules: string[];
    focus: string;
  };
  studyBudget: StudyBudget;
  principles: string[];
  materials: string[];
  todayTasks: StudyTask[];
  minimumPlan: string[];
  roadmap: RoadmapItem[];
  dailyPlan: DailyPlanItem[];
  methodBasis: string;
  settingsSnapshot: PlanSettings;
  /** Signature of the records that the smart adjustment was last applied for —
   *  prevents re-applying (compounding) the same adjustment for unchanged data. */
  adjustmentSignature?: string;
}

export interface StudyRecord {
  id: string;
  date: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
  minutes: Record<string, number>;
  completion: Completion;
  completionNote: string;
  accuracy: string;
  accuracyNote: string;
  wrongQuestionText: string;
  overtimeReason: string;
  timeNote: string;
  tomorrowFocus: string;
  causes: string[];
  notes: string;
  // Backward-compatible fields from original app
  wrongQuestions?: string[];
  wrongQuestionDetails?: string;
  actualTime?: string;
  moduleTimes?: Record<string, number>;
  moduleCounts?: Record<string, number>;
  errorCauses?: string[];
  [key: string]: unknown;
}

export interface PlanEdits {
  [date: string]: string;
}

export interface PlanHealth {
  score: number;
  level: "ok" | "warn" | "danger";
  label: string;
  message: string;
  /** Human-readable factors explaining how the score was reached ("why"). */
  factors: string[];
}

export interface RecentStats {
  recordedDays: number;
  totalMinutes: number;
  avgMinutes: number;
  avgCompletion: number;
  avgAccuracy: number;
  gapDays: number;
  streak: number;
  byDate: Map<string, StudyRecord>;
}

export interface ModuleTotal {
  minutes: number;
  count: number;
}

export interface ModuleAnalysis {
  minutes: number;
  count: number;
  avgMinutes: number;
  label: string;
  percent: number;
}

export interface CauseCount {
  cause: string;
  count: number;
  percent: number;
}

export interface Suggestion {
  type: string;
  title: string;
  body: string;
}
