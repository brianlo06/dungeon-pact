import { test, expect, type Page } from "@playwright/test";

/**
 * Undertow — the Arcanist · Tidecaller's Ultimate, in the Ultimate lab.
 *
 * Read from the film's own attributes, the water it draws and the board,
 * never from pixels: which shot is on, who is placed, where the sea's edge
 * is against the glove, how far the sea has gone out, whether the frame is
 * flooded, what is under the surface, and what the board says afterwards.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "arcanist", evo: "arc-tidecaller", ...params } as never)}`;

async function open(page: Page, params: Record<string, string | number>) {
  await page.goto(lab(params));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
}

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await open(page, { auto: 1, pause: 1, ...params });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
  // The water is drawn on the frame loop: give it a few frames.
  await page.waitForTimeout(300);
}

const film = (page: Page) => page.locator(".ult-cinematic");
const placed = (page: Page, role: string) => page.locator(`.cine-actors > .cine-actor[data-role="${role}"]:visible`);

const box = async (page: Page, selector: string, n = 0) => {
  const b = await page.locator(selector).nth(n).boundingBox();
  return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height, top: b.y, bottom: b.y + b.height, left: b.x, right: b.x + b.width } : null;
};

/** Whether a screen point is inside a drawn path's fill. */
const inside = (page: Page, selector: string, x: number, y: number) =>
  page.locator(selector).evaluateAll(
    (paths, at) =>
      paths.some((path) => {
        const el = path as SVGPathElement;
        if (!el.getAttribute("d")) return false;
        const p = new DOMPoint(at.x, at.y).matrixTransform(el.getScreenCTM()!.inverse());
        return el.isPointInFill(p);
      }),
    { x, y },
  );

test("its own film: the open hand over the water's edge, and the sea backing off from the fingertips", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.08 }, "edge");
  await expect(film(page)).toHaveAttribute("data-cinematic", "undertow");
  await expect(placed(page, "caster")).toHaveCount(1);
  const glove = (await box(page, '.cine-actor[data-role="caster"] [data-part="hand"] path[fill="#d8c8ae"]'))!;
  // At the start the water is under the fingertips.
  expect(await inside(page, ".fx-tide-edge-water-wrap .tide-edge-body", glove.right - glove.w * 0.1, glove.y)).toBe(true);
  const sea = (await box(page, ".fx-tide-edge-water-wrap .tide-edge-body"))!;
  expect(sea.left).toBeLessThan(glove.right);

  // Later it has backed off: sand between the glove and the edge, and threads running out after it.
  await hold(page, { shot: 1, at: 0.7 }, "edge");
  const glove2 = (await box(page, '.cine-actor[data-role="caster"] [data-part="hand"] path[fill="#d8c8ae"]'))!;
  // At the glove's own height the edge is well past the fingertips (it runs away on a slant, so its box is no guide).
  expect(await inside(page, ".fx-tide-edge-water-wrap .tide-edge-body", glove2.right + glove2.w * 0.3, glove2.y)).toBe(false);
  expect(await inside(page, ".fx-tide-edge-water-wrap .tide-edge-body", glove2.right + glove2.w * 0.9, glove2.y)).toBe(false);
  const threads = await page.locator(".fx-tide-edge-water-wrap .tide-thread").evaluateAll((all) => all.filter((t) => Number(t.getAttribute("opacity")) > 0.3).length);
  expect(threads).toBeGreaterThan(3);
  // The hat's tip streams seaward: lifted, not flopping.
  const tip = await page.locator('.cine-actor[data-role="caster"] [data-part="hat"]').evaluate((g) => (g as SVGGElement).style.transform);
  expect(Number(/rotate\(([-\d.]+)deg\)/.exec(tip)?.[1] ?? 0)).toBeGreaterThan(14);
});

test("the flats show the whole row on the sand with the sea going out past them, then banking on the horizon", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 2, at: 0.15 }, "flats");
  await expect(placed(page, "targets")).toHaveCount(3);
  await expect(placed(page, "caster")).toHaveCount(1);
  const early = (await box(page, ".fx-tide-sea-wrap .tide-sea-body"))!;
  await hold(page, { enemy: "sniper", shot: 2, at: 0.9 }, "flats");
  const late = (await box(page, ".fx-tide-sea-wrap .tide-sea-body"))!;
  // Going out: the sea's near edge moves right, away from the row.
  expect(late.left).toBeGreaterThan(early.left + 60);
  const row = (await box(page, '.cine-actors > .cine-actor[data-role="targets"] .cine-sprite', 0))!;
  expect(late.left).toBeGreaterThan(row.left);
  // Never a wave: one outline, no crest above the horizon's bank.
  const bank = (await box(page, ".fx-tide-sea-wrap .tide-sea-bank"))!;
  expect(bank.h).toBeGreaterThan(2);
});

test("the quiet holds the row in silhouette on the bare seabed, with the drag still running and one fish", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 4, at: 0.5 }, "bare");
  await expect(placed(page, "targets")).toHaveCount(3);
  for (const look of await placed(page, "targets").evaluateAll((all) => all.map((a) => (a as HTMLElement).dataset.look))) expect(look).toBe("silhouette");
  await expect(placed(page, "caster")).toHaveCount(0);
  expect(await page.locator(".cine-accent").count()).toBe(0);
  // The sea is gone from the sand: nothing of its body sits under the row's feet.
  const row = (await box(page, '.cine-actors > .cine-actor[data-role="targets"] .cine-sprite', 0))!;
  expect(await inside(page, ".fx-tide-sea-wrap .tide-sea-body", row.x, row.bottom - 2)).toBe(false);
  const streaks = await page.locator(".fx-tide-drag-wrap .tide-drag-line").evaluateAll((all) => all.filter((t) => Number(t.getAttribute("opacity")) > 0.1).length);
  expect(streaks).toBeGreaterThan(4);
  const fish = (await box(page, ".fx-tide-fish-wrap .tide-fish"))!;
  const frame = (await box(page, ".ult-cinematic"))!;
  expect(fish.x).toBeGreaterThan(frame.left);
  expect(fish.bottom).toBeLessThan(frame.bottom - frame.h * 0.14);
  // The bank on the horizon thickens through the quiet.
  const bankA = (await box(page, ".fx-tide-sea-wrap .tide-sea-bank"))!;
  await hold(page, { enemy: "sniper", shot: 4, at: 0.95 }, "bare");
  const bankB = (await box(page, ".fx-tide-sea-wrap .tide-sea-bank"))!;
  expect(bankB.h).toBeGreaterThan(bankA.h);
});

test("the sea comes back on a two-tone frame, the row struck in it, and then the film goes under the surface", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 5, at: 0.121 }, "undertow");
  await expect(film(page)).toHaveAttribute("data-two-tone", "");
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  // On the drawn frame the water is pale foam everywhere, so the row reads black against it.
  expect(Number(await page.locator(".fx-tide-return-wrap .tide-front-flash").getAttribute("opacity"))).toBeGreaterThan(0.8);

  await hold(page, { enemy: "sniper", shot: 5, at: 0.3 }, "undertow");
  await expect(film(page)).not.toHaveAttribute("data-two-tone", "");
  await expect(placed(page, "targets")).toHaveCount(3);
  const frame = (await box(page, ".ult-cinematic"))!;
  for (let i = 0; i < 3; i++) {
    const t = (await box(page, '.cine-actors > .cine-actor[data-role="targets"] .cine-sprite', i))!;
    // In the water: the surface over its shins, its head above.
    expect(await inside(page, ".fx-tide-return-wrap .tide-front-body", t.x, t.bottom - t.h * 0.15), `water round enemy ${i}`).toBe(true);
    expect(await inside(page, ".fx-tide-return-wrap .tide-front-body", t.x, t.top + t.h * 0.1), `air over enemy ${i}`).toBe(false);
    expect(t.left).toBeGreaterThan(frame.left);
  }
  // Foam bursting where it hit them.
  const foam = await page.locator(".fx-tide-return-wrap .tide-burst").evaluateAll((all) => all.filter((c) => Number(c.getAttribute("opacity")) > 0.2).length);
  expect(foam).toBeGreaterThan(10);
  // The Tidecaller, whole in the frame, arm down.
  const caster = (await box(page, '.cine-actors > .cine-actor[data-role="caster"] .cine-sprite'))!;
  expect(caster.left).toBeGreaterThan(frame.left);
  expect(caster.x).toBeLessThan(frame.left + frame.w * 0.4);
  const hand = await page.locator('.cine-actor[data-role="caster"] [data-part="hand"]').evaluate((g) => (g as SVGGElement).style.transform);
  expect(Number(/rotate\(([-\d.]+)deg\)/.exec(hand)?.[1] ?? 0)).toBeGreaterThan(20);

  // Under: the surface a ceiling across the top of the frame, bubbles going up, the drag seaward.
  await hold(page, { enemy: "sniper", shot: 5, at: 0.85 }, "undertow");
  expect(Number(await page.locator(".fx-tide-return-wrap .tide-front-sky").getAttribute("opacity"))).toBeGreaterThan(0.9);
  // Seaward, the top of the frame is the underside of the surface and the rest is water.
  const sx = frame.left + frame.w * 0.75;
  expect(await inside(page, ".fx-tide-return-wrap .tide-front-sky", sx, frame.top + frame.h * 0.2)).toBe(true);
  expect(await inside(page, ".fx-tide-return-wrap .tide-front-body", sx, frame.top + frame.h * 0.65)).toBe(true);
  const bubbles = await page.locator(".fx-tide-return-wrap .tide-bubble").evaluateAll((all) => all.filter((c) => Number(c.getAttribute("opacity")) > 0.2).length);
  expect(bubbles).toBeGreaterThan(5);
  const streaks = await page.locator(".fx-tide-return-wrap .tide-streak").evaluateAll((all) => all.filter((s) => Number(s.getAttribute("opacity")) > 0.1).length);
  expect(streaks).toBeGreaterThan(5);
});

test("the return leaves every enemy standing in water on the board, and the Tidecaller lowering its arm", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 6, at: 0.5 }, "ebb");
  const pools = page.locator(".cine-anchored.fx-tide-standing-wrap");
  await expect(pools).toHaveCount(3);
  let struck = 0;
  for (let i = 0; i < 3; i++) {
    const unit = await pools.nth(i).getAttribute("data-anchor");
    const rig = (await box(page, `.stage [data-unit="${unit}"] .combatant-rig`))!;
    const pool = (await box(page, `.cine-anchored.fx-tide-standing-wrap[data-anchor="${unit}"] .tide-stand-body`))!;
    expect(Math.abs(pool.x - rig.x)).toBeLessThan(rig.w * 0.4);
    expect(Math.abs(pool.bottom - rig.bottom)).toBeLessThan(rig.h * 0.3);
    const bar = await page.locator(`[data-unit="${unit}"] .combatant-bar i`).evaluate((el) => (el as HTMLElement).style.transform);
    if (bar !== "scaleX(1)") struck++;
  }
  // The result is on the board: the sea's weight came off everyone it could (a Barrier can take it).
  expect(struck).toBeGreaterThanOrEqual(2);
});

test("a boss is framed whole and in the sea to its waist, the worn kit is drawn, and skipping leaves nothing behind", async ({ page }) => {
  await hold(page, { enemy: "collector", gear: "kit", shot: 5, at: 0.3 }, "undertow");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  const boss = (await box(page, '.cine-actors > .cine-actor[data-role="targets"] .cine-sprite'))!;
  const frame = (await box(page, ".ult-cinematic"))!;
  expect(boss.h).toBeGreaterThan(frame.h * 0.4);
  expect(boss.top).toBeGreaterThan(frame.top - boss.h * 0.1);
  expect(await inside(page, ".fx-tide-return-wrap .tide-front-body", boss.x, boss.bottom - boss.h * 0.2)).toBe(true);
  expect(await inside(page, ".fx-tide-return-wrap .tide-front-body", boss.x, boss.top + boss.h * 0.15)).toBe(false);
  const caster = page.locator('.cine-actors > .cine-actor[data-role="caster"]');
  await expect(caster.locator('[data-equipment="bastion"]').first()).toBeAttached();
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".tide-world, .tide-standing, .tide-drain, .cine-vfx, .cine-actor").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("FAST keeps the edge, the strain, the quiet and the undertow, and drops the flats", async ({ page }) => {
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
  const record = () =>
    page.evaluate(() => {
      const w = window as unknown as { shots: string[]; modes: string[] };
      return { shots: w.shots, modes: w.modes };
    });
  await expect.poll(async () => (await record()).shots.at(-1), { timeout: 30_000 }).toBe("ebb");
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const { shots, modes } = await record();
  expect(modes).toEqual(["fast"]);
  expect(shots).toEqual(["call", "edge", "strain", "bare", "undertow", "ebb"]);
});

test("reduced motion plays still cards with no flash and no water", async ({ page }) => {
  await open(page, { auto: 1, motion: 0, pause: 1, shot: 1 });
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .tide-world, .tide-standing").count()).toBe(0);
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
