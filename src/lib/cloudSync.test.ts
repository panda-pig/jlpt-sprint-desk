import { describe, it, expect } from "vitest";
import { summarizeData } from "./cloudSync";

const P = "jlptSprintDesk";

describe("summarizeData (conflict-prompt summary)", () => {
  it("counts records across profiles, detects a plan, counts profiles", () => {
    const s = summarizeData({
      [`${P}:a:records`]: JSON.stringify([{}, {}, {}]),
      [`${P}:b:records`]: JSON.stringify([{}]),
      [`${P}:a:generatedPlan`]: '{"id":"x"}',
      [`${P}Profiles`]: JSON.stringify([{}, {}]),
    });
    expect(s.records).toBe(4);
    expect(s.hasPlan).toBe(true);
    expect(s.profiles).toBe(2);
  });

  it("reports no plan when generatedPlan is null", () => {
    const s = summarizeData({
      [`${P}:a:records`]: JSON.stringify([]),
      [`${P}:a:generatedPlan`]: "null",
    });
    expect(s.records).toBe(0);
    expect(s.hasPlan).toBe(false);
  });

  it("ignores a corrupt records blob without throwing", () => {
    const s = summarizeData({ [`${P}:a:records`]: "{broken" });
    expect(s.records).toBe(0);
  });
});
