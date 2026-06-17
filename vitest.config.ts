import { defineConfig } from "vitest/config";

// Unit tests for the core logic (planner / storage / migrations / sync).
// jsdom gives localStorage + document so the browser-leaning utils run as-is.
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    restoreMocks: true,
  },
});
