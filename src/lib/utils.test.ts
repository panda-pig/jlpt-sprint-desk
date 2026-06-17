import { describe, it, expect, beforeEach } from "vitest";
import { readJSON, writeJSON, getCorruptionCount, daysUntil } from "./utils";

describe("readJSON / writeJSON", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a value", () => {
    expect(writeJSON("k", { a: 1, b: [2, 3] })).toBe(true);
    expect(readJSON("k", null)).toEqual({ a: 1, b: [2, 3] });
  });

  it("returns the fallback for a missing key", () => {
    expect(readJSON("missing", [])).toEqual([]);
  });

  it("on corrupt data: backs up the raw value, counts it, and returns the fallback", () => {
    const before = getCorruptionCount();
    localStorage.setItem("bad", "[{not valid json");
    const result = readJSON<unknown[]>("bad", []);
    expect(result).toEqual([]); // graceful fallback, no throw
    expect(localStorage.getItem("bad__corrupt")).toBe("[{not valid json"); // raw preserved
    expect(getCorruptionCount()).toBe(before + 1);
  });

  it("does not overwrite an existing corrupt backup", () => {
    localStorage.setItem("bad2__corrupt", "ORIGINAL");
    localStorage.setItem("bad2", "still broken {");
    readJSON("bad2", []);
    expect(localStorage.getItem("bad2__corrupt")).toBe("ORIGINAL");
  });
});

describe("daysUntil", () => {
  it("future date → positive", () => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    expect(daysUntil(d.toISOString().slice(0, 10))).toBeGreaterThan(0);
  });

  it("past date → clamped to 0", () => {
    expect(daysUntil("2000-01-01")).toBe(0);
  });

  it("empty / invalid → null", () => {
    expect(daysUntil("")).toBeNull();
  });
});
