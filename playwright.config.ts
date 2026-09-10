import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests for combat layout.
 *
 * These answer a question the CSS contract tests cannot: does the battle
 * actually fit, at the sizes people play at, with real content in it. The
 * contract tests guard the rules; these guard the result. Both are kept.
 *
 * Everything runs against the Battle Lab, which builds real engine states from
 * the query string, so no room server is needed and every scene is addressable.
 */
export const RESOLUTIONS = [
  { name: "1280x720", width: 1280, height: 720 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
] as const;

export default defineConfig({
  testDir: "./tests-browser",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: process.env.CI ? "list" : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:5399",
    trace: "retain-on-failure",
  },
  projects: RESOLUTIONS.map((r) => ({
    name: r.name,
    use: {
      ...devices["Desktop Chrome"],
      viewport: { width: r.width, height: r.height },
    },
  })),
  webServer: {
    command: "npx vite --host 127.0.0.1 --port 5399 --strictPort",
    url: "http://127.0.0.1:5399/dev/bosses.html",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
