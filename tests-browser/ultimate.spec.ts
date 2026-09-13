import { test, expect, type Page } from "@playwright/test";

/**
 * Ultimates on the real combat screen, through the Ultimate lab.
 *
 * The lab queues the Ultimate through the reducer and resolves the round, so
 * everything here is the game's own path: the meter, the slip, targeting, the
 * cinematic, and the hand back to the round. What a cinematic is showing is
 * read from its own attributes — `data-shot`, `data-framing`, `data-mode` —
 * never guessed from pixels.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams(params as never)}`;

async function open(page: Page, params: Record<string, string | number>) {
  await page.goto(lab(params));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
}

/** Seek into the film and hold there: deterministic, however slow the machine. */
async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await open(page, { auto: 1, pause: 1, ...params });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, {
    timeout: 30_000,
  });
}

/** Let a held film play on. */
const resume = (page: Page) => page.getByRole("button", { name: "▶ Play" }).click();

const cinematic = (page: Page) => page.locator(".ult-cinematic");

test("the meter fills, the slip appears, and the Ultimate is queued beside the plan", async ({
  page,
}) => {
  await open(page, { charge: 40 });
  await expect(page.locator(".ult-meter")).toBeVisible();
  await expect(page.locator(".ult-slip")).toHaveCount(0);

  await open(page, { charge: 100 });
  const slip = page.locator("button.ult-slip");
  await expect(slip).toBeVisible();
  await expect(page.locator(".ult-meter[data-ready]")).toBeVisible();
  await slip.click();
  await expect(page.locator('.commit-bar[data-mode="ultimate"]')).toBeVisible();
  // Targeting marks every living enemy, the screened back row included.
  const marked = page.locator(".combatant[data-marked]");
  expect(await marked.count()).toBeGreaterThanOrEqual(2);
  await page.locator('[data-unit="enemy-0"] .combatant-body').click();
  await page.locator(".ult-lock").click();
  await expect(page.locator('.ult-slip[data-queued]')).toBeVisible();
  // The normal plan is still open: the Ultimate did not spend the action.
  await expect(page.locator(".fan-slips .fan-slip").first()).toBeVisible();
  await page.locator('.ult-slip[data-queued] button').click();
  await expect(page.locator("button.ult-slip")).toBeVisible();
});

test("an Ultimate plays its film before the round, then hands back to it", async ({
  page,
}) => {
  await hold(page, { shot: 5, at: 0.2 }, "impact");
  await expect(cinematic(page)).toHaveAttribute("data-cinematic", "lantern-wall");
  await resume(page);
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  // The round it preceded still plays, and then the board settles.
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  expect(await page.locator("[class*='cine-']").count()).toBe(0);
});

test("skipping settles at once and leaves nothing behind", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.3 }, "wall");
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 2000 });
  expect(
    await page.locator(".cine-vfx, .cine-actor, .cine-occluder, [data-part][class*='cine']").count(),
  ).toBe(0);
  // No presentation copy is still being animated.
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
  // The Ultimate's result is on the board now: the target took its damage.
  const bar = page.locator('[data-unit="enemy-0"] .combatant-bar i');
  await expect
    .poll(async () => bar.evaluate((el) => (el as HTMLElement).style.transform))
    .not.toBe("scaleX(1)");
});

test("the Breaker's Ultimate is a different film", async ({ page }) => {
  await hold(page, { evo: "van-breaker", enemy: "sniper", shot: 5, at: 0.3 }, "breach");
  await expect(cinematic(page)).toHaveAttribute("data-cinematic", "gatebreaker");
  // It hits the whole row: every target it reached is on its stage.
  expect(await page.locator('.cine-actor[data-role="targets"]').count()).toBeGreaterThanOrEqual(2);
});

test("a boss is framed as a boss", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 5 }, "impact");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "boss");
  await hold(page, { enemy: "hound", shot: 5 }, "impact");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "normal");
});

test("the hero wears what it is wearing, and not what was seized", async ({ page }) => {
  await hold(page, { gear: "weapon", shot: 2 }, "wall");
  const caster = page.locator('.cine-actor[data-role="caster"]');
  await expect(caster.locator('[data-equipment="blood-price"]').first()).toBeAttached();

  await hold(page, { gear: "seized", enemy: "collector", shot: 2 }, "wall");
  await expect(
    page.locator('.cine-actor[data-role="caster"] [data-equipment="blood-price"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('.cine-actor[data-role="caster"] [data-equipment="bastion"]').first(),
  ).toBeAttached();
});

test("reduced motion shows still cards: no flashes, no shake, and short", async ({
  page,
}) => {
  await open(page, { auto: 1, motion: 0 });
  await expect(cinematic(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent").count()).toBe(0);
  await expect(cinematic(page)).toHaveCount(0, { timeout: 20_000 });
});

test("FAST is the condensed cut, and 2× plays the same film in half the time", async ({
  page,
}) => {
  // Record every shot the film shows, however briefly: FAST shots are short.
  await page.addInitScript(() => {
    const w = window as unknown as { shots: string[]; filmMs?: number };
    w.shots = [];
    let began = 0;
    new MutationObserver(() => {
      const film = document.querySelector(".ult-cinematic");
      const shot = film?.getAttribute("data-shot");
      if (shot && w.shots.at(-1) !== shot) w.shots.push(shot);
      if (film && !began) began = performance.now();
      if (!film && began && w.filmMs === undefined) w.filmMs = performance.now() - began;
    }).observe(document, { subtree: true, attributes: true, childList: true });
  });
  await open(page, { auto: 1, mode: "fast" });
  await expect(cinematic(page)).toHaveAttribute("data-mode", "fast", { timeout: 30_000 });
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  const shots = await page.evaluate(() => (window as unknown as { shots: string[] }).shots);
  // FAST keeps the anticipation and the impact, and drops the wide hero shot.
  expect(shots).toContain("breath");
  expect(shots).toContain("impact");
  expect(shots).not.toContain("wall");

  // Timed in the page, from the film's first frame to its last, so a slow
  // test runner does not count its own waiting.
  const time = async (speed: number) => {
    await open(page, { auto: 1, speed });
    await page.waitForFunction(
      () => (window as unknown as { filmMs?: number }).filmMs !== undefined,
      null,
      { timeout: 40_000 },
    );
    return page.evaluate(() => (window as unknown as { filmMs: number }).filmMs);
  };
  const normal = await time(1);
  const double = await time(2);
  expect(double).toBeLessThan(normal * 0.75);
});

test("the film never scrolls or overflows the combat view", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.1 }, "impact");
  const fits = await page.evaluate(`(() => {
    const view = document.querySelector(".preview-viewport").getBoundingClientRect();
    const film = document.querySelector(".ult-cinematic").getBoundingClientRect();
    const battle = document.querySelector(".battle");
    return {
      inside: film.left >= view.left - 1 && film.right <= view.right + 1 && film.top >= view.top - 1 && film.bottom <= view.bottom + 1,
      scroll: battle.scrollHeight <= battle.clientHeight + 1 && battle.scrollWidth <= battle.clientWidth + 1,
    };
  })()`);
  expect(fits).toEqual({ inside: true, scroll: true });
});
