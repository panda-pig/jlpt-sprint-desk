import { createContext, useContext } from "react";
import type { GeneratedPlan, PlanEdits, PlanSettings, Profile, StudyRecord } from "./types";
import type { getNextAction, getPlanHealth, getRecentStats, getTodayPlanDay, getUpcomingDays, suggestPlanAdjustment } from "./planner";

export interface StudyDeskState {
  profiles: Profile[];
  activeProfileId: string | null;
  settings: PlanSettings;
  generatedPlan: GeneratedPlan | null;
  planEdits: PlanEdits;
  records: StudyRecord[];
}

export interface StudyDeskContextValue {
  state: StudyDeskState;
  todayRecord: StudyRecord | null;
  todayPlan: ReturnType<typeof getTodayPlanDay>;
  upcomingDays: ReturnType<typeof getUpcomingDays>;
  health: ReturnType<typeof getPlanHealth>;
  stats: ReturnType<typeof getRecentStats>;
  nextAction: ReturnType<typeof getNextAction>;
  suggestions: string[];
  tomorrowSuggestion: { title: string; minutes: number; detail: string } | null;
  planAdjustment: ReturnType<typeof suggestPlanAdjustment>;
  moduleTotals: Record<string, number>;
  causeCounts: Record<string, number>;
  createProfile: (name: string) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
  updateProfileName: (id: string, name: string) => void;
  updateSettings: (patch: Partial<PlanSettings>) => void;
  generateNewPlan: () => void;
  advanceToNextExam: () => void;
  applyAutoAdjust: () => void;
  savePlanEdit: (dayIndex: number, text: string) => void;
  deletePlanEdit: (dayIndex: number) => void;
  saveRecord: (record: Partial<StudyRecord>) => void;
  deleteRecord: (id: string) => void;
}

export const StudyDeskContext = createContext<StudyDeskContextValue | null>(null);

export function useStudyDesk(): StudyDeskContextValue {
  const context = useContext(StudyDeskContext);
  if (!context) {
    throw new Error("useStudyDesk must be used within a StudyDeskProvider");
  }
  return context;
}
