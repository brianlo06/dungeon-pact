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

/*
 * The port is overridable so that two checkouts can run their suites at once.
 * `reuseExistingServer` would otherwise quietly point one checkout's tests at
 * the other checkout's dev server, and both would report on the wrong code.
 */
const PORT = Number(process.env.PW_PORT ?? 5399);

export default defineConfig({
  testDir: "./tests-browser",
  timeout: 30_000,
  /*
   * Ten seconds, not five. Every page here runs two animation frame loops and
   * a stage full of animated SVG, and four of them at once on one machine is
   * real CPU contention — assertions were timing out on load rather than on
   * anything being wrong. Same reason workers are capped below the core count.
   */
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  reporter: process.env.CI ? "list" : [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
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
    command: `npx vite --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}/dev/bosses.html`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
