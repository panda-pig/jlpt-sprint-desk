import { describe, it, expect } from "vitest";
import {
  getPlanningHorizon,
  isExamPast,
  buildStudyBudget,
  recordsSignature,
  getPlanHealth,
  generatePlan,
} from "./planner";
import { DEFAULT_SETTINGS, LEVEL_CONFIG, RECORD_MODULE_KEYS } from "./constants";
import type { PlanSettings, StudyRecord } from "./types";

const settings = (over: Partial<PlanSettings> = {}): PlanSettings =>
  ({ ...DEFAULT_SETTINGS, ...over }) as PlanSettings;

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function record(date: string, completion: StudyRecord["completion"], accuracy = "22/30"): StudyRecord {
  return {
    id: `r-${date}`,
    date,
    profileId: "test",
    createdAt: date,
    updatedAt: date,
    minutes: { kanji: 10, vocab: 10, grammar: 10, reading: 5, listening: 5 },
    moduleCounts: {},
    completion,
    completionNote: "",
    accuracy,
    accuracyNote: "",
    wrongQuestionText: "",
    overtimeReason: "",
    timeNote: "",
    tomorrowFocus: "",
    causes: [],
    notes: "",
  } as StudyRecord;
}

describe("isExamPast", () => {
  it("a strictly past date is past", () => expect(isExamPast("2000-01-01")).toBe(true));
  it("an empty date is not past", () => expect(isExamPast("")).toBe(false));
  it("a far-future date is not past", () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    expect(isExamPast(d.toISOString().slice(0, 10))).toBe(false);
  });
});

describe("getPlanningHorizon — exam date is a soft target", () => {
  const base = LEVEL_CONFIG[DEFAULT_SETTINGS.level].baseWeeks * 7;

  it("unset date falls back to the level's default span", () => {
    expect(getPlanningHorizon(settings({ examDate: "" }))).toBe(base);
  });

  it("a passed date falls back to the same default span (not 0/1)", () => {
    expect(getPlanningHorizon(settings({ examDate: "2000-01-01" }))).toBe(base);
  });

  it("a real future date uses its own remaining days", () => {
    const d = new Date();
    d.setDate(d.getDate() + 100);
    const h = getPlanningHorizon(settings({ examDate: d.toISOString().slice(0, 10) }));
    expect(h).toBeGreaterThan(14);
    expect(h).not.toBe(base);
  });
});

describe("buildStudyBudget", () => {
  it("includes totalMinutes equal to the sum of module minutes", () => {
    const b = buildStudyBudget(settings());
    const sum = Object.values(b.moduleMinutes).reduce((a, c) => a + c, 0);
    expect(b.totalMinutes).toBe(sum);
  });

  it("never allocates more than the daily budget on a low budget (no min-block overflow)", () => {
    const b = buildStudyBudget(settings({ weekdayMinutes: 35, weekendMinutes: 35, dailyMinutes: 35 }));
    const sum = Object.values(b.moduleMinutes).reduce((a, c) => a + c, 0);
    expect(sum).toBeLessThanOrEqual(b.dailyMinutes);
  });

  it("only allocates to the known record modules + mock/review", () => {
    const b = buildStudyBudget(settings());
    for (const k of Object.keys(b.moduleMinutes)) {
      expect([...RECORD_MODULE_KEYS, "mock", "review"]).toContain(k);
    }
  });
});

describe("recordsSignature", () => {
  it("is stable for identical record sets", () => {
    const recs = [record(isoDaysAgo(1), "done"), record(isoDaysAgo(2), "partial")];
    expect(recordsSignature(recs)).toBe(recordsSignature([...recs]));
  });

  it("changes when a recent record's content changes", () => {
    const a = [record(isoDaysAgo(1), "done")];
    const b = [record(isoDaysAgo(1), "minimum")];
    expect(recordsSignature(a)).not.toBe(recordsSignature(b));
  });
});

describe("getPlanHealth factors", () => {
  it("explains deductions when completion/accuracy are low", () => {
    const plan = generatePlan(settings(), "test");
    const lowRecs = [1, 2, 3, 4, 5].map((n) => record(isoDaysAgo(n), "minimum", "10/30"));
    const health = getPlanHealth(plan, lowRecs);
    expect(health.score).toBeLessThan(86);
    expect(health.factors.length).toBeGreaterThan(1);
    expect(health.factors.join(" ")).toMatch(/86/);
  });

  it("gives a positive factor when there are no deductions", () => {
    const plan = generatePlan(settings(), "test");
    const goodRecs = [1, 2, 3].map((n) => record(isoDaysAgo(n), "done", "28/30"));
    const health = getPlanHealth(plan, goodRecs);
    expect(health.score).toBe(86);
    expect(health.factors.length).toBeGreaterThanOrEqual(2);
  });
});
