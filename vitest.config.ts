import { defineConfig } from "vitest/config";

/**
 * Unit and contract tests only. The browser specs under `tests-browser/` are
 * Playwright's — they need a real layout engine, and vitest would otherwise
 * try to run them as node tests.
 */
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["tests-browser/**", "node_modules/**", "dist/**"],
  },
});
