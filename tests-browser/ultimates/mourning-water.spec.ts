import { test, expect, type Page } from "@playwright/test";

/**
 * Mourning Water — the Warden · Hollow Druid's Ultimate, in the Ultimate lab.
 *
 * Read from the film's own attributes, the nodes its effects draw and the
 * board, never from pixels: which shot is on, who is placed, where the tear
 * and the palm-water are drawn, how far the hand has closed, what the fist of
 * water covers, and what the board says afterwards.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "warden", evo: "war-hollow", ...params } as never)}`;

async function open(page: Page, params: Record<string, string | number>) {
  await page.goto(lab(params));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
}

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await open(page, { auto: 1, pause: 1, ...params });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

const film = (page: Page) => page.locator(".ult-cinematic");
const caster = (page: Page) => page.locator('.cine-actor[data-role="caster"]');
const placed = (page: Page, role: string) => page.locator(`.cine-actor[data-role="${role}"]:visible`);
const cssVar = (page: Page, name: string) =>
  caster(page).evaluate((el, n) => Number(getComputedStyle(el).getPropertyValue(n) || 0), name);

test("the face acts with its eyes shut, and the tear is drawn in the head and runs down it", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.3 }, "tear");
  await expect(film(page)).toHaveAttribute("data-cinematic", "mourning-water");
  // The face parts move (the brow lifts and knots, the lids press)…
  const brow = await caster(page).locator('[data-part="brow"]').evaluate((el) => getComputedStyle(el).transform);
  const eyes = await caster(page).locator('[data-part="eyes"]').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).d);
  expect(brow).not.toBe("none");
  expect(eyes).toBeLessThan(0.9);
  // …and the eyes stay shut: this film never opens them.
  expect(await cssVar(page, "--wdn-eyes")).toBe(0);
  const tear = caster(page).locator('[data-art="illustrated-head"] > g.mourn-tear');
  await expect(tear).toHaveCount(1);
  const early = await tear.locator(".mourn-tear-bead").boundingBox();
  await hold(page, { shot: 1, at: 0.64 }, "tear");
  const later = await caster(page).locator("g.mourn-tear .mourn-tear-bead").boundingBox();
  expect(later!.y).toBeGreaterThan(early!.y);
});

test("the tear lands in the open palm, which fills, spills and puts out its light", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.9 }, "palm");
  const water = caster(page).locator('[data-part="hand"] > g.mourn-palm');
  await expect(water).toHaveCount(1);
  const pool = await water.locator(".mourn-palm-pool").boundingBox();
  const hand = await caster(page).locator('[data-part="hand"]').boundingBox();
  expect(pool!.width).toBeGreaterThan(10);
  expect(pool!.x + pool!.width / 2).toBeGreaterThan(hand!.x);
  expect(pool!.x + pool!.width / 2).toBeLessThan(hand!.x + hand!.width);
  expect(await cssVar(page, "--mourn-mote")).toBeLessThan(0.05);
  // The drop on the glass is the way into the mere.
  await expect(page.locator(".mourn-lens[data-mode='hit']")).toBeAttached();
});

test("the wide shows the real target standing in the mere, bracing as the water climbs", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.8 }, "mere");
  await expect(placed(page, "caster")).toHaveCount(1);
  await expect(placed(page, "targets")).toHaveCount(1);
  await expect(page.locator(".mourn-sh[data-who='targets-0'][visibility='visible']")).toHaveCount(1);
  await expect(page.locator(".cine-text-name")).toBeVisible();
});

test("the quiet closes the hand on the far-off target, and has nothing loud in it", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.1 }, "hold");
  const openHand = await cssVar(page, "--wdn-grasp");
  await hold(page, { shot: 4, at: 0.98 }, "hold");
  const closing = await cssVar(page, "--wdn-grasp");
  expect(openHand).toBeLessThan(0.1);
  expect(closing).toBeGreaterThan(0.4);
  expect(await cssVar(page, "--mourn-lamp")).toBe(0);
  await expect(placed(page, "targets")).toHaveCount(1);
  expect(await page.locator(".cine-accent, .fx-mourn-fist-wrap, .cine-text-impact").count()).toBe(0);
});

test("the impact closes the water over the target in the shape of a hand, and reveals the damage", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.1 }, "drown");
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  await expect(page.locator('.cine-accent[data-screen="two-tone"]')).toBeAttached();
  expect(await cssVar(page, "--wdn-grasp")).toBe(1);
  const fingers = page.locator(".mourn-fist[data-part='front'] .mourn-finger");
  await expect(fingers).toHaveCount(4);
  const fist = await page.locator(".mourn-fist[data-part='front'] .mourn-fist-hand").boundingBox();
  const body = await placed(page, "targets").locator(".cine-sprite").boundingBox();
  // The fist is round the target: over its middle, wider than it, and its knuckles above it.
  const mid = body!.x + body!.width / 2;
  expect(mid).toBeGreaterThan(fist!.x);
  expect(mid).toBeLessThan(fist!.x + fist!.width);
  expect(fist!.y).toBeLessThan(body!.y + body!.height * 0.3);
  const bar = page.locator('[data-unit="enemy-0"] .combatant-bar i');
  await expect.poll(async () => bar.evaluate((el) => (el as HTMLElement).style.transform)).not.toBe("scaleX(1)");
});

test("the return leaves the drowned hanging with water and every other real enemy soaked", async ({ page }) => {
  await hold(page, { shot: 6, at: 0.8 }, "still");
  const enemies = await page.locator('.stage .combatant[data-side="enemy"]:not([data-down])').count();
  await expect(page.locator('.cine-anchored .mourn-board[data-mode="drowned"] .mourn-cling')).toHaveCount(1);
  await expect(page.locator(".mourn-wet")).toHaveCount(enemies - 1);
});

test("a boss is framed whole under the fist, the worn kit is drawn, and skipping leaves nothing behind", async ({ page }) => {
  await hold(page, { enemy: "collector", gear: "kit", shot: 5, at: 0.3 }, "drown");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  const frame = (await film(page).boundingBox())!;
  const boss = (await placed(page, "targets").locator(".cine-sprite").boundingBox())!;
  expect(boss.height).toBeGreaterThan(frame.height * 0.35);
  expect(boss.y).toBeGreaterThan(frame.y - boss.height * 0.05);
  await hold(page, { enemy: "collector", gear: "kit", shot: 2, at: 0.5 }, "palm");
  expect(await caster(page).locator("[data-equipment]").count()).toBeGreaterThan(0);
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[class*='mourn-'], .cine-vfx, .cine-actor").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("FAST keeps the tear, the palm, the quiet and the impact, and drops the wide", async ({ page }) => {
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
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-shot", "data-mode"] });
  });
  await open(page, { auto: 1, mode: "fast" });
  await expect
    .poll(async () => (await page.evaluate(() => (window as unknown as { shots: string[] }).shots)).at(-1), {
      timeout: 30_000,
    })
    .toBe("still");
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const { shots, modes } = await page.evaluate(() => {
    const w = window as unknown as { shots: string[]; modes: string[] };
    return { shots: w.shots, modes: w.modes };
  });
  expect(modes).toEqual(["fast"]);
  expect(shots).toEqual(["call", "tear", "palm", "hold", "drown", "still"]);
});

test("reduced motion plays still cards with no flash", async ({ page }) => {
  await open(page, { auto: 1, motion: 0 });
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .mourn-fist, .mourn-tear").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
