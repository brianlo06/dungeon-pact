import { test, expect, type Page } from "@playwright/test";

/**
 * Eyespot — the Beguiler · Illusionist's Ultimate, in the Ultimate lab.
 *
 * Read from the film's own attributes, the effects it mounts and the board,
 * never from pixels: which shot is on, who is placed and where, where the
 * eye looks, whether the robe is where the lunge goes and the cut is on the
 * target, and what the board says afterwards.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "beguiler", evo: "bgl-illusionist", ...params } as never)}`;

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
const enemiesOnBoard = (page: Page) =>
  page.locator('.stage [data-unit^="enemy-"] .combatant-rig').count();

const box = async (page: Page, selector: string) => {
  const b = await page.locator(selector).first().boundingBox();
  return b ? { ...b, cx: b.x + b.width / 2, cy: b.y + b.height / 2 } : null;
};

test("plays its own film: the real line watches, and the robe opens a hundred eyes", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.85 }, "eyes");
  await expect(film(page)).toHaveAttribute("data-cinematic", "eyespot");
  const enemies = await enemiesOnBoard(page);
  expect(enemies).toBeGreaterThanOrEqual(2);
  // The whole line is in the cast (the moths' brush reached every one).
  await expect(placed(page, "targets")).toHaveCount(enemies);
  await expect(placed(page, "caster")).toHaveCount(1);
  // The moths have landed on the Beguiler's own figure, and their wings are open.
  const moths = page.locator(".fx-spot-coat-wrap .spot-moth");
  expect(await moths.count()).toBeGreaterThanOrEqual(20);
  const open = await moths.evaluateAll(
    (ms) => ms.filter((m) => new DOMMatrix(getComputedStyle(m.querySelector(".spot-right")!).transform).a > 0.8).length,
  );
  expect(open).toBeGreaterThanOrEqual(16);
  const coat = await box(page, ".fx-spot-coat-wrap .spot-coat-box");
  const body = await box(page, '.cine-actor[data-role="caster"] .cine-sprite');
  expect(Math.abs(coat!.cx - body!.cx)).toBeLessThan(body!.width * 0.2);
  expect(Math.abs(coat!.y + coat!.height - (body!.y + body!.height))).toBeLessThan(body!.height * 0.1);
  // The Beguiler stands to the left of the line it is facing.
  const line = await box(page, '.cine-actor[data-role="targets"] .cine-sprite');
  expect(body!.cx).toBeLessThan(line!.cx);
});

test("in the close-up the eye glances aside and winks, and the swarm covers the cut", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.2 }, "wink");
  const eye = page.locator('.cine-actor[data-role="caster"] [data-part="eye"]');
  await expect(eye).toBeAttached();
  const glance = await eye.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform));
  expect(glance.e).toBeGreaterThan(0.6);
  await hold(page, { shot: 1, at: 0.4 }, "wink");
  const lid = await eye.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform));
  expect(lid.d).toBeLessThan(0.3);
  expect(lid.a).toBeGreaterThan(0.8);
  // At the very end of the shot the wall of wings is across the whole frame.
  await hold(page, { shot: 1, at: 0.995 }, "wink");
  const dust = await box(page, ".fx-spot-moths-wrap .spot-dust");
  const frame = await film(page).boundingBox();
  // The band is near-opaque from 30% to 70% of its width.
  expect(dust!.x + dust!.width * 0.3).toBeLessThanOrEqual(frame!.x + frame!.width * 0.03);
  expect(dust!.x + dust!.width * 0.7).toBeGreaterThanOrEqual(frame!.x + frame!.width * 0.97);
});

test("the quiet holds: the target drawn back, the robe covered in eyes, nothing loud", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.5 }, "which");
  await expect(placed(page, "caster")).toHaveCount(1);
  await expect(placed(page, "targets")).toHaveCount(1);
  await expect(page.locator(".fx-spot-coat-wrap .spot-coat[data-held]")).toHaveCount(1);
  expect(await page.locator(".cine-accent, .fx-spot-robe-wrap, .fx-spot-cut-wrap").count()).toBe(0);
  await expect(page.locator(".cine-text-impact")).toHaveCount(0);
});

test("the impact: the lunge goes into the robe, and the cut lands from behind", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.1 }, "wrong");
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  const robe = await box(page, ".fx-spot-robe-wrap .spot-robe-cloth");
  const target = await box(page, '.cine-actor[data-role="targets"] .cine-sprite');
  const caster = await box(page, '.cine-actor[data-role="caster"] .cine-sprite');
  // Robe, then the target lunging at it, then the Beguiler behind the target.
  expect(robe!.cx).toBeLessThan(target!.cx);
  expect(caster!.cx).toBeGreaterThan(target!.cx);
  // The robe is empty cloth, already coming apart, and its moths are flying.
  const cloth = await page.locator(".fx-spot-robe-wrap .spot-robe-cloth").evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(cloth).toBeLessThan(1);
  expect(cloth).toBeGreaterThan(0);
  // The crescent is drawn on, across the target's body.
  const cut = await box(page, ".fx-spot-cut-wrap .spot-cut svg");
  expect(cut!.cx).toBeGreaterThan(target!.x);
  expect(cut!.cx).toBeLessThan(target!.x + target!.width);
  expect(cut!.cy).toBeGreaterThan(target!.y - target!.height * 0.2);
  expect(cut!.cy).toBeLessThan(target!.y + target!.height);
});

test("the return: moths over every real enemy's eyes, the cut on the target, a veil round the Beguiler", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.6 }, "wings");
  const enemies = await enemiesOnBoard(page);
  await expect(page.locator('.cine-anchored.fx-spot-moths-wrap .spot-moths[data-mode="blind"]')).toHaveCount(enemies);
  await expect(page.locator('.cine-anchored.fx-spot-moths-wrap .spot-moths[data-mode="veil"]')).toHaveCount(1);
  await expect(page.locator(".cine-anchored.fx-spot-cut-wrap .spot-cut svg:visible")).toHaveCount(1);
  for (let i = 0; i < enemies; i++) {
    const bar = page.locator(`[data-unit="enemy-${i}"] .combatant-bar i`);
    await expect
      .poll(async () => bar.evaluate((el) => (el as HTMLElement).style.transform))
      .not.toBe("scaleX(1)");
  }
});

test("a boss is framed whole, the worn kit is drawn, and skipping leaves nothing behind", async ({ page }) => {
  await hold(page, { enemy: "collector", gear: "kit", shot: 4, at: 0.3 }, "wrong");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  const boss = await page.locator('.cine-actor[data-role="targets"] .cine-sprite').first().boundingBox();
  const frame = await film(page).boundingBox();
  // Struck, not shrunk: big in the frame, and its head not cut off.
  expect(boss!.height).toBeGreaterThan(frame!.height * 0.5);
  expect(boss!.y).toBeGreaterThan(frame!.y - boss!.height * 0.05);
  const caster = page.locator('.cine-actor[data-role="caster"]');
  await expect(caster.locator('[data-equipment="bastion"]').first()).toBeAttached();
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[class*='spot-'], .cine-vfx, .cine-actor").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("FAST keeps the wink, the silence and the impact, and drops the wide", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { shots: string[]; modes: string[] };
    w.shots = [];
    w.modes = [];
    new MutationObserver(() => {
      const el = document.querySelector(".ult-cinematic");
      const shot = el?.getAttribute("data-shot");
      if (shot && w.shots.at(-1) !== shot) w.shots.push(shot);
      const mode = el?.getAttribute("data-mode");
      if (mode && !w.modes.includes(mode)) w.modes.push(mode);
    }).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-shot", "data-mode"],
    });
  });
  await open(page, { auto: 1, mode: "fast" });
  await expect
    .poll(async () => (await page.evaluate(() => (window as unknown as { shots: string[] }).shots)).at(-1), {
      timeout: 30_000,
    })
    .toBe("wings");
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const { shots, modes } = await page.evaluate(() => {
    const w = window as unknown as { shots: string[]; modes: string[] };
    return { shots: w.shots, modes: w.modes };
  });
  expect(modes).toEqual(["fast"]);
  expect(shots).toEqual(["call", "wink", "which", "wrong", "wings"]);
});

test("reduced motion plays still cards with no flash", async ({ page }) => {
  await open(page, { auto: 1, motion: 0 });
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .spot-robe, .spot-coat").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
