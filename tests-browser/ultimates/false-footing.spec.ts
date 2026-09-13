import { test, expect, type Page } from "@playwright/test";

/**
 * False Footing — the Ranger · Pathfinder's Ultimate, in the Ultimate lab.
 *
 * Read from the film's own attributes, the nodes its effects draw and the
 * board, never from pixels: which shot is on, who is placed, what the hand
 * and the face are doing, which trails are laid and read, where the snare
 * bites, and what the board shows afterwards.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "ranger", evo: "rng-pathfinder", ...params } as never)}`;

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
const living = (page: Page) => page.locator('.stage .combatant[data-side="enemy"]:not([data-down])').count();

test("the read: a gloved hand on a print, whose rim lights as it is read", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.2 }, "read");
  await expect(film(page)).toHaveAttribute("data-cinematic", "false-footing");
  const reach = caster(page).locator(".rng-reach");
  await expect(reach).toHaveCount(1);
  expect(await reach.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
  const read = page.locator(".ff-print .ff-dent-read").first();
  const before = await read.evaluate((el) => Number(getComputedStyle(el).opacity));
  await hold(page, { shot: 1, at: 0.7 }, "read");
  const after = await page.locator(".ff-print .ff-dent-read").first().evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(before).toBeLessThan(0.05);
  expect(after).toBeGreaterThan(0.9);
  // The fingers are down on the print.
  const hand = (await caster(page).locator(".rng-reach").boundingBox())!;
  const print = (await page.locator(".ff-print").boundingBox())!;
  expect(hand.y + hand.height).toBeGreaterThan(print.y);
  expect(hand.x + hand.width / 2).toBeGreaterThan(print.x);
  expect(hand.x + hand.width / 2).toBeLessThan(print.x + print.width);
});

test("from above, every real enemy stands in the field with its own trail, next step and cord", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.9 }, "trail");
  const enemies = await living(page);
  await expect(placed(page, "targets")).toHaveCount(enemies);
  const trails = page.locator(".ff-trail-one:not([style*='none'])");
  await expect(trails).toHaveCount(enemies);
  await expect(page.locator(".ff-trail-one[data-primary]:not([style*='none'])")).toHaveCount(1);
  // Read up to its feet, and the next step shown.
  const lit = await page.locator(".ff-trail-one[data-primary] .ff-step .ff-dent-read").last().evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(lit).toBeGreaterThan(0.9);
  const ghost = await page.locator(".ff-trail-one[data-primary] .ff-ghost-line").first().evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(ghost).toBeGreaterThan(0.5);
  await expect(page.locator(".cine-text-name")).toBeVisible();
});

test("the face acts: reading, breath held, then a grin", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.2 }, "know");
  const eyes = caster(page).locator('[data-part="eyes"]');
  const mouth = caster(page).locator('[data-part="mouth"]');
  const narrowed = await eyes.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).d);
  const set = await mouth.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  expect(narrowed).toBeLessThan(0.7);
  await expect(page.locator(".ff-breath")).toBeAttached();
  await hold(page, { shot: 3, at: 0.95 }, "know");
  const grin = await caster(page).locator('[data-part="mouth"]').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  expect(grin).toBeGreaterThan(set * 1.3);
  expect(await caster(page).locator('[data-part="brow"]').evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");
});

test("the quiet: the real target walks towards the foreseen step, and nothing loud happens", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.1 }, "step");
  const target = placed(page, "targets");
  await expect(target).toHaveCount(1);
  const early = (await target.boundingBox())!;
  await expect(page.locator(".ff-print .ff-ghost")).toBeAttached();
  await expect(page.locator(".ff-loop[data-mode='hidden']")).toBeAttached();
  expect(await page.locator(".cine-accent, .ff-burst, .ff-hobble, .cine-text-impact").count()).toBe(0);
  await hold(page, { shot: 4, at: 0.9 }, "step");
  const late = (await placed(page, "targets").boundingBox())!;
  expect(late.x).toBeLessThan(early.x - 20);
  await expect(page.locator('.cine-actor[data-role="targets"] [data-clip="approach"]')).toBeAttached();
});

test("the snare bites on a drawn frame: the legs are bound, the cord is taut, the damage is shown", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.2 }, "spring");
  await expect(page.locator('.cine-accent[data-screen="two-tone"]')).toBeAttached();
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  const body = (await placed(page, "targets").locator(".cine-sprite").boundingBox())!;
  const hobble = (await page.locator(".ff-hobble").boundingBox())!;
  // Round its legs: across the middle of the figure, in its lower half.
  const mid = hobble.x + hobble.width / 2;
  expect(mid).toBeGreaterThan(body.x);
  expect(mid).toBeLessThan(body.x + body.width);
  expect(hobble.y + hobble.height / 2).toBeGreaterThan(body.y + body.height * 0.5);
  const taut = await page.locator(".ff-cord").evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--taut")));
  expect(taut).toBe(1);
  await expect(caster(page).locator('[data-clip="ult:ff-haul"]')).toBeAttached();
  const bar = page.locator('[data-unit="enemy-0"] .combatant-bar i');
  await expect.poll(async () => bar.evaluate((el) => (el as HTMLElement).style.transform)).not.toBe("scaleX(1)");
});

test("the return: a snare cinched at every real enemy's feet, the target's knotted and tagged", async ({ page }) => {
  await hold(page, { shot: 6, at: 0.9 }, "snared");
  const enemies = await living(page);
  const snares = page.locator(".ff-board[data-mode='snared']");
  await expect(snares).toHaveCount(enemies);
  await expect(page.locator(".ff-board[data-mode='snared'][data-primary]")).toHaveCount(1);
  const first = await page.locator(".cine-anchored[data-vfx='ff-board']").first().getAttribute("data-anchor");
  expect(first).toBe("enemy-0");
  // Each at its own unit's feet.
  for (let i = 0; i < enemies; i++) {
    const wrap = page.locator(".cine-anchored[data-vfx='ff-board']").nth(i);
    const unit = await wrap.getAttribute("data-anchor");
    const rig = (await page.locator(`.stage [data-unit="${unit}"] .combatant-rig`).boundingBox())!;
    const noose = (await wrap.locator(".ff-board-noose").boundingBox())!;
    expect(Math.abs(noose.x + noose.width / 2 - (rig.x + rig.width / 2)), unit!).toBeLessThan(rig.width * 0.4);
    expect(Math.abs(noose.y + noose.height / 2 - (rig.y + rig.height)), unit!).toBeLessThan(rig.height * 0.3);
  }
});

test("a boss is framed whole in the snare, the worn kit is drawn, and skipping leaves nothing behind", async ({ page }) => {
  await hold(page, { enemy: "collector", gear: "kit", shot: 5, at: 0.3 }, "spring");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  const frame = (await film(page).boundingBox())!;
  const boss = (await placed(page, "targets").locator(".cine-sprite").boundingBox())!;
  expect(boss.height).toBeGreaterThan(frame.height * 0.35);
  expect(boss.y).toBeGreaterThan(frame.y - boss.height * 0.05);
  await hold(page, { enemy: "collector", gear: "kit", shot: 3, at: 0.5 }, "know");
  expect(await caster(page).locator("[data-equipment]").count()).toBeGreaterThan(0);
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[class*='ff-'], .cine-vfx, .cine-actor").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("FAST keeps the read, the face, the quiet and the impact, and drops the high wide", async ({ page }) => {
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
    .toBe("snared");
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const { shots, modes } = await page.evaluate(() => {
    const w = window as unknown as { shots: string[]; modes: string[] };
    return { shots: w.shots, modes: w.modes };
  });
  expect(modes).toEqual(["fast"]);
  expect(shots).toEqual(["call", "read", "know", "step", "spring", "snared"]);
});

test("reduced motion plays still cards with no flash", async ({ page }) => {
  await open(page, { auto: 1, motion: 0 });
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .ff-burst, .ff-trail").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
