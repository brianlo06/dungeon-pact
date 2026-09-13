import { test, expect, type Page } from "@playwright/test";

/**
 * The Open Mind — the Beguiler · Mindflayer's Ultimate, in the Ultimate lab.
 *
 * Read from the film's own attributes, the effects it mounts and the board,
 * never from pixels: which shot is on, who is placed, whose mind is holed,
 * where the thought runs from and to, and what the board says afterwards.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "beguiler", evo: "bgl-mindflayer", ...params } as never)}`;

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

const centre = async (page: Page, selector: string) => {
  const box = await page.locator(selector).first().boundingBox();
  return box ? { x: box.x + box.width / 2, y: box.y + box.height / 2, w: box.width, h: box.height } : null;
};

test("plays its own film: every real enemy with its mind over its head, doubt winding in the target's", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.6 }, "minds");
  await expect(film(page)).toHaveAttribute("data-cinematic", "open-mind");
  const enemies = await enemiesOnBoard(page);
  expect(enemies).toBeGreaterThanOrEqual(2);
  // The whole line is in the cast (the passing sliver reached every one).
  await expect(placed(page, "targets")).toHaveCount(enemies);
  await expect(page.locator(".fx-mind-disc-wrap > .mind-disc")).toHaveCount(enemies);
  // Only the target's mind shows doubt's path, and some of it is walked.
  await expect(page.locator('.fx-mind-disc-wrap[data-follow-index="0"] .mind-doubt')).toBeVisible();
  const walked = await page
    .locator('.fx-mind-disc-wrap[data-follow-index="0"] .mind-doubt circle')
    .evaluateAll((dots) => dots.filter((d) => Number(getComputedStyle(d).opacity) > 0.5).length);
  expect(walked).toBeGreaterThan(3);
  // Each mind hangs over its own figure's head.
  const disc = await centre(page, '.fx-mind-disc-wrap[data-follow-index="0"] .mind-disc svg');
  const body = await centre(page, '.cine-actor[data-role="targets"] .cine-sprite');
  expect(disc!.y).toBeLessThan(body!.y - body!.h * 0.3);
  expect(Math.abs(disc!.x - body!.x)).toBeLessThan(body!.w * 0.6);
});

test("the eye narrows to a pin in the close-up, and the quiet has nothing loud in it", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.9 }, "stare");
  const eye = page.locator('.cine-actor[data-role="caster"] [data-part="eye"]');
  await expect(eye).toBeAttached();
  const scale = await eye.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  expect(scale).toBeLessThan(0.6);
  await expect(page.locator(".fx-mind-crack-wrap")).toBeAttached();

  await hold(page, { shot: 4, at: 0.6 }, "coil");
  await expect(page.locator('.mind-maze[data-mode="heart"]')).toHaveCount(1);
  expect(await page.locator(".cine-accent, .fx-mind-hole-wrap, .fx-mind-spike-wrap").count()).toBe(0);
  await expect(placed(page, "caster")).toHaveCount(0);
});

test("inside the target's mind, the needle goes straight through every wall", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.3 }, "bore");
  const open = async () =>
    page
      .locator(".mind-punch-hole")
      .evaluateAll((holes) => holes.filter((h) => Number(getComputedStyle(h).opacity) > 0.5).length);
  expect(await open()).toBe(0);
  await hold(page, { shot: 3, at: 0.995 }, "bore");
  expect(await open()).toBe(7);
});

test("the impact runs the thought from the eye through the target's mind, then holes the rest", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.3 }, "through");
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  await expect(placed(page, "caster")).toHaveCount(1);
  // The thought starts at the Beguiler's head and passes through the target's mind.
  const line = await page.locator(".fx-mind-spike-wrap .mind-beam-core").evaluate((l) => {
    const m = (l as SVGGraphicsElement).getScreenCTM()!;
    const at = (x: string, y: string) => new DOMPoint(Number(l.getAttribute(x)), Number(l.getAttribute(y))).matrixTransform(m);
    const a = at("x1", "y1");
    const b = at("x2", "y2");
    return { ax: a.x, ay: a.y, bx: b.x, by: b.y };
  });
  const head = await page.locator('.cine-actor[data-role="caster"] [data-part="head"]').boundingBox();
  expect(line.ax).toBeGreaterThan(head!.x - 10);
  expect(line.ax).toBeLessThan(head!.x + head!.width + 10);
  expect(line.ay).toBeGreaterThan(head!.y - 10);
  expect(line.ay).toBeLessThan(head!.y + head!.height + 10);
  const mind = await centre(page, ".fx-mind-hole-wrap:not([data-follow-index]) .mind-hole svg");
  const dx = line.bx - line.ax;
  const dy = line.by - line.ay;
  const off = Math.abs(dy * (mind!.x - line.ax) - dx * (mind!.y - line.ay)) / Math.hypot(dx, dy);
  expect(off).toBeLessThan(mind!.w * 0.15);

  // A beat later the same thought has holed every other mind in the line.
  await hold(page, { shot: 5, at: 0.6 }, "through");
  const enemies = await enemiesOnBoard(page);
  const holed = await page
    .locator('.fx-mind-hole-wrap[data-follow-index] .mind-hole[data-echo]:visible .mind-disc-hole')
    .evaluateAll((holes) => holes.filter((h) => new DOMMatrix(getComputedStyle(h).transform).a > 0.9).length);
  expect(holed).toBe(enemies - 1);
});

test("the return hangs a holed mind over every real enemy, and the board has the result", async ({ page }) => {
  await hold(page, { shot: 6, at: 0.5 }, "holes");
  const enemies = await enemiesOnBoard(page);
  await expect(page.locator(".cine-anchored.fx-mind-disc-wrap .mind-disc[data-holed]")).toHaveCount(enemies);
  await expect(page.locator(".cine-anchored.fx-mind-disc-wrap .mind-disc[data-primary]")).toHaveCount(1);
  for (let i = 0; i < enemies; i++) {
    const bar = page.locator(`[data-unit="enemy-${i}"] .combatant-bar i`);
    await expect
      .poll(async () => bar.evaluate((el) => (el as HTMLElement).style.transform))
      .not.toBe("scaleX(1)");
  }
});

test("a boss is framed whole, the worn kit is drawn, and skipping leaves nothing behind", async ({ page }) => {
  await hold(page, { enemy: "collector", gear: "kit", shot: 5, at: 0.3 }, "through");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  const boss = await page.locator('.cine-actor[data-role="targets"] .cine-sprite').first().boundingBox();
  const frame = await film(page).boundingBox();
  // Struck, not shrunk: big in the frame, and its head (and its mind) not cut off.
  expect(boss!.height).toBeGreaterThan(frame!.height * 0.5);
  const mind = await centre(page, ".fx-mind-hole-wrap:not([data-follow-index]) .mind-hole svg");
  expect(mind!.y).toBeGreaterThan(frame!.y);
  const caster = page.locator('.cine-actor[data-role="caster"]');
  await expect(caster.locator('[data-equipment="bastion"]').first()).toBeAttached();
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[class*='mind-'], .cine-vfx, .cine-actor").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("FAST keeps the eye, the walls, the silence and the impact, and drops the wide", async ({ page }) => {
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
  // A FAST film can be over before a locator gets a look at it: watch the record.
  const record = () =>
    page.evaluate(() => {
      const w = window as unknown as { shots: string[]; modes: string[] };
      return { shots: w.shots, modes: w.modes };
    });
  await expect
    .poll(async () => (await page.evaluate(() => (window as unknown as { shots: string[] }).shots)).at(-1), {
      timeout: 30_000,
    })
    .toBe("holes");
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const { shots, modes } = await record();
  expect(modes).toEqual(["fast"]);
  expect(shots).toEqual(["call", "stare", "bore", "coil", "through", "holes"]);
});

test("reduced motion plays still cards with no flash", async ({ page }) => {
  await open(page, { auto: 1, motion: 0 });
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .mind-hole, .mind-maze").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
