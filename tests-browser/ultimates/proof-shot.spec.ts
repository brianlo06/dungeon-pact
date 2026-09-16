import { test, expect, type Page } from "@playwright/test";

/**
 * Proof Shot — the Ranger · Sharpshooter's Ultimate, in the Ultimate lab.
 *
 * Read from the film's own attributes, the nodes its effects draw and the
 * board, never from pixels: which shot is on, who is placed, what the hand
 * and the face do, where the flag, the plate and the arrows are, and what
 * the board shows afterwards.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "ranger", evo: "rng-sharpshooter", ...params } as never)}`;

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
const target = (page: Page) => page.locator('.cine-actor[data-role="targets"]:visible').first();
const centre = (b: { x: number; y: number; width: number; height: number }) => [b.x + b.width / 2, b.y + b.height / 2];
const scaleY = (page: Page, part: string) =>
  caster(page).locator(`[data-part="${part}"]`).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).d);
const partOpacity = (page: Page, part: string) =>
  caster(page).locator(`[data-part="${part}"]`).evaluate((el) => Number(getComputedStyle(el).opacity));

test("the wind: the open hand is shown, and grit falls from it", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.6 }, "wind");
  await expect(film(page)).toHaveAttribute("data-cinematic", "proof-shot");
  expect(await partOpacity(page, "open")).toBe(1);
  expect(await partOpacity(page, "thumb")).toBe(0);
  const hand = (await caster(page).locator('[data-part="open"]').boundingBox())!;
  const frame = (await film(page).boundingBox())!;
  // The hand is in the frame, large.
  expect(hand.width).toBeGreaterThan(frame.width * 0.08);
  expect(hand.x).toBeGreaterThan(frame.x);
  expect(hand.x + hand.width).toBeLessThan(frame.x + frame.width);
  const grains = page.locator(".ps-grit i");
  expect(await grains.count()).toBeGreaterThan(10);
  const grain = (await grains.first().boundingBox())!;
  // Below the hand and to its right: fallen, and taken by the wind.
  expect(grain.y).toBeGreaterThan(hand.y + hand.height * 0.5);
  expect(grain.x).toBeGreaterThan(hand.x);
});

test("the range: the thumb up at arm's length, the real target a speck at the far end, the flag flying", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.3 }, "range");
  expect(await partOpacity(page, "thumb")).toBe(1);
  const thumb = (await caster(page).locator('[data-part="thumb"]').boundingBox())!;
  const head = (await caster(page).locator('[data-part="head"]').boundingBox())!;
  // Out in front of the face (the head's box trails back with the hood), level with it.
  expect(centre(thumb)[0]).toBeGreaterThan(centre(head)[0] + head.width * 0.2);
  expect(Math.abs(centre(thumb)[1] - centre(head)[1])).toBeLessThan(head.height);
  const kid = (await caster(page).locator(".cine-sprite").boundingBox())!;
  const far = (await target(page).locator(".cine-sprite").boundingBox())!;
  // Far off: much smaller than the kid, and to its right, higher up the lane.
  expect(far.height).toBeLessThan(kid.height * 0.4);
  expect(far.x).toBeGreaterThan(kid.x + kid.width * 2);
  expect(far.y + far.height).toBeLessThan(kid.y + kid.height * 0.5);
  await expect(page.locator(".cine-text-name")).toBeVisible();
  const cloth = (await page.locator(".ps-streamer-cloth").first().boundingBox())!;
  expect(cloth.width).toBeGreaterThan(20);
  // By the end the thumb is down and the bow drawn: the string halves are turned.
  await hold(page, { shot: 2, at: 0.97 }, "range");
  expect(await partOpacity(page, "thumb")).toBe(1);
  const thumbScale = await caster(page).locator('[data-part="thumb"]').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  expect(Math.abs(thumbScale)).toBeLessThan(0.05);
  const top = await caster(page).locator('[data-part="stringTop"]').evaluate((el) => {
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return (Math.atan2(m.b, m.a) * 180) / Math.PI;
  });
  expect(Math.abs(top)).toBeGreaterThan(15);
});

test("the breath: the eyes close, then open calm, and the string is let go twice", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.42 }, "breath");
  const shut = await scaleY(page, "eyes");
  expect(shut).toBeLessThan(0.15);
  await hold(page, { shot: 3, at: 0.62 }, "breath");
  const open = await scaleY(page, "eyes");
  expect(open).toBeGreaterThan(0.8);
  const angle = async () =>
    caster(page).locator('[data-part="stringTop"]').evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return Math.abs((Math.atan2(m.b, m.a) * 180) / Math.PI);
    });
  // Drawn: the string's top half is turned to the nock.
  expect(await angle()).toBeGreaterThan(15);
  // Loosed: straight again (a shiver at most).
  await hold(page, { shot: 3, at: 0.71 }, "breath");
  expect(await angle()).toBeLessThan(10);
  // Drawn a second time, then loosed again.
  await hold(page, { shot: 3, at: 0.9 }, "breath");
  expect(await angle()).toBeGreaterThan(15);
  await hold(page, { shot: 3, at: 0.97 }, "breath");
  expect(await angle()).toBeLessThan(10);
  expect(await page.locator(".cine-accent, .ps-arrows").count()).toBe(0);
});

test("the quiet: the flag drops and hangs still, the target stands behind its plate, and nothing loud happens", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.08 }, "streamer");
  const flying = (await page.locator(".ps-streamer-cloth").first().boundingBox())!;
  const body = (await target(page).locator(".cine-sprite").boundingBox())!;
  const plate = (await page.locator(".ps-plate-body").first().boundingBox())!;
  // The plate hangs in front of the target (towards the kid: the left), at its chest.
  expect(plate.x + plate.width * 0.5).toBeLessThan(body.x + body.width * 0.3);
  expect(centre(plate)[1]).toBeGreaterThan(body.y);
  expect(centre(plate)[1]).toBeLessThan(body.y + body.height);
  expect(await page.locator(".cine-accent, .ps-arrows, .cine-text-impact").count()).toBe(0);
  await hold(page, { shot: 4, at: 0.95 }, "streamer");
  const hung = (await page.locator(".ps-streamer-cloth").first().boundingBox())!;
  // Flying it reaches out level; dropped it hangs: taller than it is wide, and lower.
  expect(flying.width).toBeGreaterThan(flying.height * 1.5);
  expect(hung.height).toBeGreaterThan(hung.width);
  expect(hung.y + hung.height).toBeGreaterThan(flying.y + flying.height + 40);
});

test("the proof: the first arrow through the plate on a drawn frame, the plate down, the second through the first, and the damage shown", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.01 }, "proof");
  await expect(page.locator('.cine-accent[data-screen="two-tone"]')).toBeAttached();
  await hold(page, { shot: 5, at: 0.2 }, "proof");
  const body = (await target(page).locator(".cine-sprite").boundingBox())!;
  const first = (await page.locator('.ps-arrow[data-i="0"][data-stuck] .ps-arrow-shaft').boundingBox())!;
  // The first arrow stands in the target's side.
  expect(first.x + first.width).toBeGreaterThan(body.x);
  expect(first.x + first.width).toBeLessThan(body.x + body.width);
  expect(centre(first)[1]).toBeGreaterThan(body.y);
  expect(centre(first)[1]).toBeLessThan(body.y + body.height);
  await expect(page.locator(".ps-plate[data-struck]")).toBeAttached();
  const plateEarly = (await page.locator(".ps-plate-body").first().boundingBox())!;
  await hold(page, { shot: 5, at: 0.7 }, "proof");
  const plateLate = (await page.locator(".ps-plate-body").first().boundingBox())!;
  // Knocked off its hook and down onto the cinder.
  expect(plateLate.y).toBeGreaterThan(plateEarly.y + 60);
  // The second arrow stands in the same place; the first's shaft is split and gone.
  const second = (await page.locator('.ps-arrow[data-i="1"][data-stuck] .ps-arrow-shaft').boundingBox())!;
  expect(Math.abs(second.x + second.width - (first.x + first.width))).toBeLessThan(30);
  expect(await page.locator('.ps-arrow[data-i="0"] .ps-arrow-shaft').evaluate((el) => getComputedStyle(el).display)).toBe("none");
  await expect(page.locator(".ps-halves")).toBeVisible();
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  const bar = page.locator('.stage .combatant[data-side="enemy"]').filter({ has: page.locator(".combatant-bar") });
  await expect
    .poll(async () => bar.locator(".combatant-bar i").evaluateAll((els) => els.filter((el) => (el as HTMLElement).style.transform !== "scaleX(1)").length))
    .toBeGreaterThan(0);
});

test("the return: the holed plate lies at the real target's feet with the arrow in it", async ({ page }) => {
  await hold(page, { shot: 6, at: 0.7 }, "proved");
  const proved = page.locator(".cine-anchored[data-vfx='ps-board']").first();
  const unit = await proved.getAttribute("data-anchor");
  const rig = (await page.locator(`.stage [data-unit="${unit}"] .combatant-rig`).boundingBox())!;
  const plate = (await proved.locator(".ps-board-plate").boundingBox())!;
  const arrow = (await proved.locator(".ps-board-arrow").boundingBox())!;
  // The plate on the ground beside its feet; the arrow in its body.
  expect(plate.y + plate.height).toBeGreaterThan(rig.y + rig.height * 0.7);
  expect(Math.abs(centre(plate)[0] - centre(rig)[0])).toBeLessThan(rig.width);
  expect(centre(arrow)[1]).toBeGreaterThan(rig.y);
  expect(centre(arrow)[1]).toBeLessThan(rig.y + rig.height);
  await expect(page.locator(".cine-text-voice")).toBeVisible();
});

test("a boss is framed whole in the proof, the worn kit is drawn, and skipping leaves nothing behind", async ({ page }) => {
  await hold(page, { enemy: "collector", gear: "kit", shot: 5, at: 0.5 }, "proof");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  const frame = (await film(page).boundingBox())!;
  const boss = (await target(page).locator(".cine-sprite").boundingBox())!;
  expect(boss.height).toBeGreaterThan(frame.height * 0.35);
  expect(boss.y).toBeGreaterThan(frame.y);
  expect(boss.y + boss.height).toBeLessThan(frame.y + frame.height);
  const plate = (await page.locator(".ps-plate-body").first().boundingBox())!;
  expect(plate.x).toBeGreaterThan(frame.x);
  await hold(page, { enemy: "collector", gear: "kit", shot: 3, at: 0.3 }, "breath");
  expect(await caster(page).locator("[data-equipment]").count()).toBeGreaterThan(0);
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[class*='ps-'], .cine-vfx, .cine-actor").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("FAST keeps the wind, the breath, the quiet and the proof, and drops the wide", async ({ page }) => {
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
    .toBe("proved");
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const { shots, modes } = await page.evaluate(() => {
    const w = window as unknown as { shots: string[]; modes: string[] };
    return { shots: w.shots, modes: w.modes };
  });
  expect(modes).toEqual(["fast"]);
  expect(shots).toEqual(["call", "wind", "breath", "streamer", "proof", "proved"]);
});

test("reduced motion plays still cards with no flash", async ({ page }) => {
  await open(page, { auto: 1, motion: 0 });
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .ps-arrows, .ps-wipe").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
