import { test, expect, type Page } from "@playwright/test";

/**
 * Sunblind — the Ranger · Gloomstalker's Ultimate, in the Ultimate lab.
 *
 * Read from the film's own attributes, the nodes its effects draw and the
 * board, never from pixels: which shot is on, who is placed, what the face
 * does, where the sun, the shadows and the arrows are, and what the board
 * shows afterwards.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "ranger", evo: "rng-gloomstalker", ...params } as never)}`;

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
const centre = (b: { x: number; y: number; width: number; height: number }) => [b.x + b.width / 2, b.y + b.height / 2];
const scaleY = (page: Page, part: string) =>
  caster(page).locator(`[data-part="${part}"]`).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).d);

test("the eclipse: squinting beside the sun, then the head over it and the eyes open in its shade", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.1 }, "eclipse");
  await expect(film(page)).toHaveAttribute("data-cinematic", "sunblind");
  const squint = await scaleY(page, "eyes");
  const sun = centre((await page.locator(".sb-sun-core").boundingBox())!);
  const headEarly = (await caster(page).locator('[data-part="head"]').boundingBox())!;
  expect(squint).toBeLessThan(0.4);
  // Beside the sun, not over it yet: well up and to the left of the head's middle.
  const [hx, hy] = centre(headEarly);
  expect(Math.hypot(sun[0] - hx, sun[1] - hy)).toBeGreaterThan(headEarly.width * 0.35);
  expect(sun[0]).toBeLessThan(hx);
  expect(sun[1]).toBeLessThan(hy);
  await hold(page, { shot: 1, at: 0.95 }, "eclipse");
  const open = await scaleY(page, "eyes");
  const mouth = await caster(page).locator('[data-part="mouth"]').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  expect(open).toBeGreaterThan(squint * 2.5);
  expect(mouth).toBeGreaterThan(1.1);
  const head = (await caster(page).locator('[data-part="head"]').boundingBox())!;
  const sunLate = centre((await page.locator(".sb-sun-core").boundingBox())!);
  // The sun is behind the hood.
  expect(sunLate[0]).toBeGreaterThan(head.x);
  expect(sunLate[0]).toBeLessThan(head.x + head.width);
  expect(sunLate[1]).toBeGreaterThan(head.y);
  expect(sunLate[1]).toBeLessThan(head.y + head.height);
});

test("the wide: the real row squints into the sun with its own shadows, and the kid is inside the glare", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 2, at: 0.9 }, "glare");
  const row = await page.locator('.stage .combatant[data-side="enemy"]').evaluateAll(
    (els) => els.filter((el) => el.querySelector(".combatant-rig") && !el.hasAttribute("data-down")).length,
  );
  const targets = placed(page, "targets");
  const n = await targets.count();
  expect(n).toBeGreaterThan(1);
  expect(n).toBeLessThanOrEqual(row);
  // Each figure has its shadow, a shaded copy of it.
  await expect(page.locator(".sb-cast-one:visible")).toHaveCount(n);
  expect(await page.locator(".sb-cast-one .sb-cast-copy").count()).toBe(n);
  const kid = centre((await caster(page).boundingBox())!);
  const sun = page.locator(".cine-back .sb-sun-core");
  const core = (await sun.boundingBox())!;
  expect(Math.hypot(kid[0] - (core.x + core.width / 2), kid[1] - (core.y + core.height / 2))).toBeLessThan(core.width * 1.2);
  await expect(caster(page)).toHaveAttribute("data-look", "silhouette");
  await expect(page.locator(".cine-text-name")).toBeVisible();
});

test("the loose: four arrows leave the bow, and the flare covers the cut", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.985 }, "loose");
  await expect(caster(page).locator('[data-clip="ult:sb-volley"], [data-clip="ult:sb-after"]').first()).toBeAttached();
  const shown = await page.locator(".sb-loosed-one").evaluateAll((els) => els.filter((el) => (el as HTMLElement).dataset.x !== undefined).length);
  expect(shown).toBe(4);
  // The flare's white heart spans the frame at the cut.
  const frame = (await film(page).boundingBox())!;
  const band = (await page.locator(".sb-flare-band").boundingBox())!;
  expect(band.x + band.width * 0.25).toBeLessThan(frame.x);
  expect(band.x + band.width * 0.75).toBeGreaterThan(frame.x + frame.width);
});

test("the quiet: shadows slide in over the plaster to the real row's feet, and nothing loud happens", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.2 }, "shadows");
  const target = placed(page, "targets").first();
  const body = (await target.locator(".cine-sprite").boundingBox())!;
  const shade = page.locator(".sb-shadows [data-t='0'] .sb-shade").first();
  const early = (await shade.boundingBox())!;
  expect(await page.locator(".cine-accent, .sb-volley, .cine-text-impact").count()).toBe(0);
  await hold(page, { shot: 4, at: 0.95 }, "shadows");
  const late = (await page.locator(".sb-shadows [data-t='0'] .sb-shade").first().boundingBox())!;
  expect(late.x + late.width).toBeGreaterThan(early.x + early.width + 40);
  // At its feet, not past them.
  expect(late.x + late.width).toBeLessThan(body.x + body.width);
  expect(late.y).toBeGreaterThan(body.y + body.height * 0.6);
});

test("the volley lands on a drawn frame: arrows in every enemy of the row, and the damage shown", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 5, at: 0.2 }, "volley");
  await expect(page.locator('.cine-accent[data-screen="two-tone"]')).toBeAttached();
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  const targets = placed(page, "targets");
  const n = await targets.count();
  expect(n).toBeGreaterThan(1);
  for (let t = 0; t < n; t++) {
    const body = (await targets.nth(t).locator(".cine-sprite").boundingBox())!;
    const inBody = page.locator(`.sb-volley [data-t="${t}"] .sb-hit[data-body][data-stuck] .sb-hit-arrow`).first();
    const tip = (await inBody.boundingBox())!;
    const [x, y] = centre(tip);
    expect(x, `target ${t}`).toBeGreaterThan(body.x - tip.width / 2);
    expect(x, `target ${t}`).toBeLessThan(body.x + body.width + tip.width / 2);
    expect(y, `target ${t}`).toBeLessThan(body.y + body.height);
    expect(await page.locator(`.sb-volley [data-t="${t}"] .sb-hit[data-stuck]:not([data-body])`).count()).toBeGreaterThan(2);
  }
  const bar = page.locator('.stage .combatant[data-side="enemy"]').filter({ has: page.locator(".combatant-bar") });
  await expect
    .poll(async () => bar.locator(".combatant-bar i").evaluateAll((els) => els.filter((el) => (el as HTMLElement).style.transform !== "scaleX(1)").length))
    .toBeGreaterThan(1);
});

test("the return: every real enemy in a pool of sun with its shadow, the struck row stuck with arrows", async ({ page }) => {
  await hold(page, { shot: 6, at: 0.9 }, "sunstruck");
  const enemies = await page.locator('.stage .combatant[data-side="enemy"]:not([data-down])').count();
  await expect(page.locator(".sb-board[data-mode='field'] .sb-board-one")).toHaveCount(enemies);
  const struck = page.locator(".cine-anchored[data-vfx='sb-board'] .sb-board[data-mode='struck']");
  expect(await struck.count()).toBeGreaterThan(0);
  const first = page.locator(".cine-anchored[data-vfx='sb-board'][data-anchor^='enemy']").first();
  const unit = await first.getAttribute("data-anchor");
  const rig = (await page.locator(`.stage [data-unit="${unit}"] .combatant-rig`).boundingBox())!;
  const arrows = (await first.locator(".sb-board-struck").boundingBox())!;
  expect(Math.abs(centre(arrows)[0] - centre(rig)[0])).toBeLessThan(rig.width * 0.5);
  expect(Math.abs(arrows.y + arrows.height * 0.8 - (rig.y + rig.height))).toBeLessThan(rig.height * 0.4);
  // Each shadow lies behind its enemy, away from the party.
  const one = page.locator(`.sb-board-one[data-unit="${unit}"] .sb-board-stand`);
  const shadow = (await one.boundingBox())!;
  expect(centre(shadow)[0]).toBeGreaterThan(centre(rig)[0]);
});

test("a boss is framed whole in the volley, the worn kit is drawn, and skipping leaves nothing behind", async ({ page }) => {
  await hold(page, { enemy: "collector", gear: "kit", shot: 5, at: 0.3 }, "volley");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  const frame = (await film(page).boundingBox())!;
  const boss = (await placed(page, "targets").locator(".cine-sprite").boundingBox())!;
  expect(boss.height).toBeGreaterThan(frame.height * 0.3);
  expect(boss.y).toBeGreaterThan(frame.y);
  expect(boss.y + boss.height).toBeLessThan(frame.y + frame.height);
  await hold(page, { enemy: "collector", gear: "kit", shot: 3, at: 0.5 }, "loose");
  expect(await caster(page).locator("[data-equipment]").count()).toBeGreaterThan(0);
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[class*='sb-'], .cine-vfx, .cine-actor").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("FAST keeps the eclipse, the loose, the quiet and the impact, and drops the wide", async ({ page }) => {
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
    .poll(async () => (await page.evaluate(() => (window as unknown as { shots: string[] }).shots)).at(-1), { timeout: 30_000 })
    .toBe("sunstruck");
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const { shots, modes } = await page.evaluate(() => {
    const w = window as unknown as { shots: string[]; modes: string[] };
    return { shots: w.shots, modes: w.modes };
  });
  expect(modes).toEqual(["fast"]);
  expect(shots).toEqual(["call", "eclipse", "loose", "shadows", "volley", "sunstruck"]);
});

test("reduced motion plays still cards with no flash", async ({ page }) => {
  await open(page, { auto: 1, motion: 0 });
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .sb-volley, .sb-flare").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
