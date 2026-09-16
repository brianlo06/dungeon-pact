import { test, expect, type Page } from "@playwright/test";

/** The Blightcaller's Every Head Bowed, through the Ultimate lab. */

test.describe.configure({ timeout: 90_000 });

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(
    `/dev/ultimates.html?${new URLSearchParams({ hero: "warden", evo: "war-blightcaller", party: 3, auto: 1, pause: 1, ...params } as never)}`,
  );
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 45_000 });
}

const caster = (page: Page) => page.locator('.cine-actor[data-role="caster"]');
/** The first plant's head rotation, degrees. */
const headAngle = (page: Page) =>
  page
    .locator(".bowed-field .bowed-plant .bowed-head")
    .first()
    .evaluate((g) => Number(/rotate\((-?[\d.]+)\)/.exec(g.getAttribute("transform") ?? "")?.[1] ?? NaN));

test("it is the Blightcaller's own film: the late field, the real row standing in it, and the heads following the real lantern", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 2, at: 0.3 }, "field");
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-cinematic", "every-head-bowed");
  await expect(page.locator(".bowed-late")).toBeAttached();
  // The sniper's row is the sniper and the mender behind the line.
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveCount(2);
  expect(await page.locator(".bowed-field .bowed-plant").count()).toBeGreaterThan(40);
  const back = await headAngle(page);
  await hold(page, { enemy: "sniper", shot: 2, at: 0.66 }, "field");
  const out = await headAngle(page);
  // The lantern was swung, and the head turned with it.
  expect(Math.abs(out - back)).toBeGreaterThan(3);
  // Nothing has rotted yet.
  await expect(page.locator(".bowed-field .bowed-rot").first()).toHaveCSS("opacity", "0");
});

test("the quiet close-up acts with the face, and the light goes down off it with nothing loud", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 3, at: 0.35 }, "hush");
  const brow = await caster(page).locator('[data-part="brow"]').evaluate((el) => getComputedStyle(el).transform);
  const mouth = await caster(page).locator('[data-part="mouth"]').evaluate((el) => getComputedStyle(el).transform);
  expect(brow).not.toBe("none");
  expect(mouth).not.toBe("none");
  const early = await page.locator(".cine-vfx > .bowed-light").evaluate((el) => (el as HTMLElement).style.transform);
  await hold(page, { enemy: "sniper", shot: 3, at: 0.9 }, "hush");
  const late = await page.locator(".cine-vfx > .bowed-light").evaluate((el) => (el as HTMLElement).style.transform);
  const y = (t: string) => Number(/translate3d\([-\d.]+px, ([-\d.]+)px/.exec(t)?.[1] ?? NaN);
  expect(y(late)).toBeGreaterThan(y(early) + 150);
  expect(await page.locator('.cine-accent[data-screen="two-tone"]').count()).toBe(0);
  expect(await page.locator(".bowed-rot-fig").count()).toBe(0);
});

test("the bow is drawn: every head down and rotted on the contact, the row blighted on its own silhouette, the damage revealed", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 4, at: 0.3 }, "bow");
  await expect(page.locator('.cine-accent[data-screen="two-tone"]')).toBeAttached();
  const rotted = await page.locator(".bowed-field .bowed-rot").evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity === "1").length);
  const all = await page.locator(".bowed-field .bowed-rot").count();
  expect(rotted).toBe(all);
  // Every head hangs: pointing down, not up at a light.
  const angles = await page
    .locator(".bowed-field .bowed-head")
    .evaluateAll((els) => els.map((g) => Number(/rotate\((-?[\d.]+)\)/.exec(g.getAttribute("transform") ?? "")?.[1] ?? NaN)));
  for (const a of angles) expect(Math.sin((a * Math.PI) / 180)).toBeGreaterThan(0.4);
  // The blight is inside each target copy, clipped to a flattened copy of its drawing.
  await expect(page.locator('.cine-actor[data-role="targets"] .bowed-rot-fig')).toHaveCount(2);
  expect(await page.locator(".bowed-rot-fig clipPath > g").count()).toBe(0);
  expect(await page.locator(".bowed-rot-fig clipPath > *").count()).toBeGreaterThan(4);
  await expect(page.locator(".bowed-rot-fig .bowed-coat").first()).not.toHaveCSS("opacity", "0");
  // On the board, the row has been bitten.
  const bars = await page.locator('.stage .combatant[data-side="enemy"] .combatant-bar').evaluateAll((els) => els.map((e) => e.getAttribute("title") ?? ""));
  expect(bars.some((t) => {
    const [hp, max] = t.split("/").map((x) => Number(x.trim().replace(/\D.*$/, "")));
    return hp < max;
  })).toBe(true);
});

test("the return marks every real target, a boss is framed, FAST keeps the quiet and the bow, and skipping leaves nothing", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 5, at: 0.7 }, "bowed");
  const marks = page.locator(".bowed-board-rot");
  await expect(marks).toHaveCount(2);
  const anchored = await page.locator(".cine-anchored:has(.bowed-board)").evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.anchor));
  for (const unit of anchored) {
    const body = (await page.locator(`.stage [data-unit="${unit}"] .combatant-rig`).boundingBox())!;
    const mark = (await page.locator(`.cine-anchored[data-anchor="${unit}"] .bowed-board-rot`).boundingBox())!;
    const cx = mark.x + mark.width / 2;
    expect(cx).toBeGreaterThan(body.x);
    expect(cx).toBeLessThan(body.x + body.width);
  }
  await hold(page, { enemy: "collector", shot: 4, at: 0.5 }, "bow");
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-framing", "boss");
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveCount(1);
  await expect(page.locator(".bowed-glare")).toBeAttached();
  await hold(page, { enemy: "sniper", mode: "fast", shot: 3, at: 0.5 }, "hush");
  await hold(page, { enemy: "sniper", mode: "fast", shot: 4, at: 0.3 }, "bow");
  await page.locator(".cine-skip").click();
  await expect(page.locator(".ult-cinematic")).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .bowed-board, .bowed-rot-fig, .bowed-field").count()).toBe(0);
});
