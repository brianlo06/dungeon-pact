import { test, expect, type Page } from "@playwright/test";

/**
 * Breakwater, the Aegis Knight's Ultimate, in the Ultimate lab.
 *
 * What the film is showing is read from its own attributes (`data-shot`,
 * `data-framing`, `data-cinematic`) and from the cast it placed, never from
 * pixels.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "vanguard", evo: "van-aegis", ...params } as never)}`;

async function open(page: Page, params: Record<string, string | number>) {
  await page.goto(lab(params));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
}

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await open(page, { auto: 1, pause: 1, ...params });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, {
    timeout: 30_000,
  });
}

const cinematic = (page: Page) => page.locator(".ult-cinematic");

test("the Aegis Knight plays Breakwater, not the Lantern Wall, and hands back to the round", async ({
  page,
}) => {
  await hold(page, { shot: 5, at: 0.4 }, "return");
  await expect(cinematic(page)).toHaveAttribute("data-cinematic", "breakwater");
  await page.getByRole("button", { name: "▶ Play" }).click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  expect(await page.locator("[class*='cine-']").count()).toBe(0);
});

test("the tide is every enemy, and the break shows the party untouched behind the Knight", async ({
  page,
}) => {
  await hold(page, { shot: 2, at: 0.6 }, "tide");
  const targets = page.locator('.cine-actor[data-role="targets"]:visible');
  expect(await targets.count()).toBeGreaterThanOrEqual(2);
  await expect(page.locator(".bw-tide").first()).toBeVisible();

  await hold(page, { shot: 4, at: 0.3 }, "break");
  expect(await page.locator('.cine-actor[data-role="allies"]:visible').count()).toBeGreaterThanOrEqual(1);
  await expect(page.locator('.cine-actor[data-role="caster"]')).toHaveAttribute("data-look", "rim");
  expect(await page.locator('.cine-actor[data-role="targets"]:visible').count()).toBe(0);
});

test("the result is on the board: the Knight warded, every enemy hit, marks over the party", async ({
  page,
}) => {
  await hold(page, { shot: 6, at: 0.5 }, "hold");
  // A mark over each ally, a snapped blade over each enemy it reached.
  expect(await page.locator(".bw-link").count()).toBeGreaterThanOrEqual(1);
  expect(await page.locator(".bw-snapped").count()).toBeGreaterThanOrEqual(2);
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
  const bar = page.locator('[data-unit="enemy-0"] .combatant-bar i');
  await expect
    .poll(async () => bar.evaluate((el) => (el as HTMLElement).style.transform))
    .not.toBe("scaleX(1)");
});

test("skipping from the quiet settles at once and leaves nothing behind", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.5 }, "still");
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .bw-tide").count()).toBe(0);
});

test("a boss stands inside the tide and is answered as a boss", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 2, at: 0.9 }, "tide");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "boss");
  // The boss is in the frame, head to feet, between the letterbox bars.
  const film = await cinematic(page).boundingBox();
  const boss = await page.locator('.cine-actor[data-role="targets"] .cine-sprite').first().boundingBox();
  expect(film && boss).toBeTruthy();
  expect(boss!.y).toBeGreaterThan(film!.y + film!.height * 0.1);
  expect(boss!.y + boss!.height).toBeLessThan(film!.y + film!.height * 0.92);

  await hold(page, { enemy: "collector", shot: 5, at: 0.4 }, "return");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "boss");
});

test("FAST keeps the quiet and the break, and drops the tide", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { shots: string[] };
    w.shots = [];
    new MutationObserver(() => {
      const shot = document.querySelector(".ult-cinematic")?.getAttribute("data-shot");
      if (shot && w.shots.at(-1) !== shot) w.shots.push(shot);
    }).observe(document, { subtree: true, attributes: true, childList: true });
  });
  await open(page, { auto: 1, mode: "fast" });
  await expect(cinematic(page)).toHaveAttribute("data-mode", "fast", { timeout: 30_000 });
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  const shots = await page.evaluate(() => (window as unknown as { shots: string[] }).shots);
  expect(shots).toContain("still");
  expect(shots).toContain("break");
  expect(shots).toContain("return");
  expect(shots).not.toContain("tide");
});
