import { describe, it, expect, beforeEach } from "vitest";
import { runMigrations, CURRENT_SCHEMA_VERSION } from "./migrations";

const KEY = "jlptSprintDeskSchemaVersion";

describe("runMigrations", () => {
  beforeEach(() => localStorage.clear());

  it("no version key → treats data as current, runs nothing, stamps current", () => {
    const ran: number[] = [];
    runMigrations({ 1: () => ran.push(1), 2: () => ran.push(2) }, 2);
    expect(ran).toEqual([]);
    expect(localStorage.getItem(KEY)).toBe("2");
  });

  it("v0 → current runs every migration in order and stamps current", () => {
    localStorage.setItem(KEY, "0");
    const ran: number[] = [];
    runMigrations({ 1: () => ran.push(1), 2: () => ran.push(2) }, 2);
    expect(ran).toEqual([1, 2]);
    expect(localStorage.getItem(KEY)).toBe("2");
  });

  it("already current → runs nothing", () => {
    localStorage.setItem(KEY, "2");
    const ran: number[] = [];
    runMigrations({ 2: () => ran.push(2) }, 2);
    expect(ran).toEqual([]);
  });

  it("a failing migration stops and keeps the last good version (retry next boot)", () => {
    localStorage.setItem(KEY, "0");
    const ran: number[] = [];
    runMigrations(
      { 1: () => ran.push(1), 2: () => { throw new Error("boom"); }, 3: () => ran.push(3) },
      3,
    );
    expect(ran).toEqual([1]);
    expect(localStorage.getItem(KEY)).toBe("1");
  });

  it("exports a numeric CURRENT_SCHEMA_VERSION", () => {
    expect(typeof CURRENT_SCHEMA_VERSION).toBe("number");
  });
});
