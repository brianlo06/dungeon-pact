import { test, expect, type Page } from "@playwright/test";

/**
 * Hall of Mirrors — the Beguiler's Ultimate, in the Ultimate lab.
 *
 * What the film shows is read from its own attributes and the effects it
 * mounts, never from pixels: which shot is on, which cast members are placed,
 * whose drawing is in the mirrors, and what the board says afterwards.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "beguiler", ...params } as never)}`;

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

const film = (page: Page) => page.locator(".ult-cinematic");
const placed = (page: Page, role: string) =>
  page.locator(`.cine-actor[data-role="${role}"]:visible`);

test("plays its own film, and the whole real line stands in the hall", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.7 }, "hall");
  await expect(film(page)).toHaveAttribute("data-cinematic", "hall-of-mirrors");
  // Every living enemy is in the cast, not just the target.
  const enemies = await page.locator('.stage [data-unit^="enemy-"] .combatant-rig').count();
  expect(enemies).toBeGreaterThanOrEqual(2);
  await expect(placed(page, "targets")).toHaveCount(enemies);
  // The Beguiler is not in the room — it is in the mirrors, as its real drawing.
  await expect(placed(page, "caster")).toHaveCount(0);
  const reflections = page.locator('.hom-panes[data-who="caster"] .hom-pane-fig [data-hero="beguiler"]');
  expect(await reflections.count()).toBeGreaterThanOrEqual(5);
});

test("the smile lands on every face, and the line turns on itself", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.8 }, "masks");
  const enemies = await placed(page, "targets").count();
  await expect(page.locator(".hom-mask")).toHaveCount(enemies);

  await hold(page, { shot: 5, at: 0.3 }, "turn");
  await expect(page.locator(".hom-shatter")).toHaveCount(1);
  await expect(placed(page, "caster")).toHaveCount(1);
  // Turned: every enemy is drawn facing away from the party (mirrored).
  const facing = await placed(page, "targets").evaluateAll((nodes) =>
    nodes.map((n) => new DOMMatrix(getComputedStyle(n).transform).a < 0),
  );
  expect(facing.length).toBeGreaterThanOrEqual(2);
  expect(facing.every(Boolean)).toBe(true);
});

test("reveals the glass on every enemy and hands back to the board", async ({ page }) => {
  await hold(page, { shot: 6, at: 0.5 }, "fall");
  const enemies = await page.locator('.stage [data-unit^="enemy-"] .combatant-rig').count();
  await expect(page.locator(".cine-anchored.fx-hom-mask-wrap")).toHaveCount(enemies);
  for (let i = 0; i < enemies; i++) {
    const bar = page.locator(`[data-unit="enemy-${i}"] .combatant-bar i`);
    await expect
      .poll(async () => bar.evaluate((el) => (el as HTMLElement).style.transform))
      .not.toBe("scaleX(1)");
  }
});

test("skipping settles at once and leaves nothing of the hall behind", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.4 }, "hall");
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[class*='hom-'], .cine-vfx, .cine-actor").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
  const bar = page.locator('[data-unit="enemy-0"] .combatant-bar i');
  await expect
    .poll(async () => bar.evaluate((el) => (el as HTMLElement).style.transform))
    .not.toBe("scaleX(1)");
});

test("a boss is framed alone, turns on its own reflection, and hits glass", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 3, at: 0.8 }, "masks");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  await expect(placed(page, "targets")).toHaveCount(1);
  // The smile is on its reflection, and the reflection is the boss's own drawing.
  await expect(page.locator('.hom-panes[data-who="target"] .hom-pane-mask')).toHaveCount(1);
  expect(
    await page.locator('.hom-panes[data-who="target"] .hom-pane-fig .cine-look *').count(),
  ).toBeGreaterThan(10);

  await hold(page, { enemy: "collector", shot: 5, at: 0.8 }, "turn");
  await expect(page.locator(".hom-panes[data-broken]")).toHaveCount(1);
  await expect(placed(page, "targets")).toHaveCount(1);
});

test("FAST keeps the smile, the silence and the break, and drops the hall", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { shots: string[] };
    w.shots = [];
    new MutationObserver(() => {
      const shot = document.querySelector(".ult-cinematic")?.getAttribute("data-shot");
      if (shot && w.shots.at(-1) !== shot) w.shots.push(shot);
    }).observe(document, { subtree: true, attributes: true, childList: true });
  });
  await open(page, { auto: 1, mode: "fast" });
  await expect(film(page)).toHaveAttribute("data-mode", "fast", { timeout: 30_000 });
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const shots = await page.evaluate(() => (window as unknown as { shots: string[] }).shots);
  expect(shots).toEqual(["call", "smile", "masks", "strings", "turn", "fall"]);
});

test("reduced motion plays still cards with no flash", async ({ page }) => {
  await open(page, { auto: 1, motion: 0 });
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .hom-shatter").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
