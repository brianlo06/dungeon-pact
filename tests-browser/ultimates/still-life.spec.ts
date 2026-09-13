import { test, expect, type Page } from "@playwright/test";

/**
 * Still Life — the Arcanist · Chronomancer's Ultimate, in the Ultimate lab.
 *
 * Read from the film's own attributes, the stills it takes and the board,
 * never from pixels: which shot is on, who is placed, how many stills of whom
 * have been taken and where they hang, and what the board says afterwards.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "arcanist", evo: "arc-chronomancer", ...params } as never)}`;

async function open(page: Page, params: Record<string, string | number>) {
  await page.goto(lab(params));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
}

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await open(page, { auto: 1, pause: 1, ...params });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, {
    timeout: 30_000,
  });
  // Stills are taken on the frame loop: give it a few frames.
  await page.waitForTimeout(300);
}

const film = (page: Page) => page.locator(".ult-cinematic");
const placed = (page: Page, role: string) =>
  page.locator(`.cine-actors > .cine-actor[data-role="${role}"]:visible`);
const enemiesOnBoard = (page: Page) =>
  page.locator('.stage [data-unit^="enemy-"] .combatant-rig').count();

const centre = async (page: Page, selector: string, n = 0) => {
  const box = await page.locator(selector).nth(n).boundingBox();
  return box ? { x: box.x + box.width / 2, y: box.y + box.height / 2, w: box.width, h: box.height } : null;
};

test("its own film: the hand's gesture laid out in stills, copies that nothing mistakes for the figure", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.85 }, "pinch");
  await expect(film(page)).toHaveAttribute("data-cinematic", "still-life");
  await expect(placed(page, "caster")).toHaveCount(1);
  // Three flickers, three stills of the hand, and nothing else of the drawing.
  const stills = page.locator(".fx-still-plates-wrap .still-plate");
  await expect(stills).toHaveCount(3);
  expect(await page.locator(".fx-still-plates-wrap [data-part], .fx-still-plates-wrap .cine-actor").count()).toBe(0);
  expect(await page.locator('.cine-actor[data-role="caster"] [data-part="hand"]').count()).toBe(1);
  // The stills keep the hand as it was: each posed differently from the last.
  const turns = await stills.evaluateAll((all) =>
    all.map((s) => s.querySelector<SVGElement>("svg g[style*='rotate']")?.style.transform ?? ""),
  );
  expect(new Set(turns).size).toBe(3);
});

test("every real enemy winds up, and each flicker lays its next moment out ahead of it", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.85 }, "windup");
  const enemies = await enemiesOnBoard(page);
  expect(enemies).toBeGreaterThanOrEqual(2);
  await expect(placed(page, "targets")).toHaveCount(enemies);
  await expect(page.locator(".fx-still-plates-wrap .still-shift")).toHaveCount(enemies * 3);
  // The target's stills step out towards the party (left), each further on.
  const body = await centre(page, '.cine-actors > .cine-actor[data-role="targets"] .cine-sprite');
  const xs = [];
  for (let k = 0; k < 3; k++) xs.push((await centre(page, ".fx-still-plates-wrap .still-shift .still-plate", k))!.x);
  expect(xs[0]).toBeLessThan(body!.x);
  expect(xs[1]).toBeLessThan(xs[0]);
  expect(xs[2]).toBeLessThan(xs[1]);
});

test("the quiet holds: a silhouette, its eye-lights up, and nothing loud in it", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.85 }, "stopped");
  await expect(placed(page, "caster")).toHaveAttribute("data-look", "silhouette");
  const lit = await page
    .locator(".still-eyes > i")
    .evaluateAll((halos) => halos.filter((h) => Number(getComputedStyle(h).opacity) > 0.6).length);
  expect(lit).toBe(2);
  expect(await page.locator(".cine-accent, .still-plate, .fx-still-burst-wrap").count()).toBe(0);
  await expect(placed(page, "targets")).toHaveCount(0);
});

test("the impact lands every still in the target at once, then in the rest of the line", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.12 }, "release");
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  await expect(placed(page, "caster")).toHaveCount(1);
  const enemies = await enemiesOnBoard(page);
  await expect(page.locator(".fx-still-plates-wrap .still-shift")).toHaveCount(enemies * 4);
  // The target's stills are on it, printed hot, within its own figure.
  const body = await centre(page, '.cine-actors > .cine-actor[data-role="targets"] .cine-sprite');
  const hot = page.locator('.fx-still-plates-wrap .still-shift[data-hot="1"] .still-plate .still-look');
  await expect(hot).toHaveCount(4);
  for (let k = 0; k < 4; k++) {
    const at = await centre(page, '.fx-still-plates-wrap .still-shift[data-hot="1"] .still-plate .still-look', k);
    expect(Math.abs(at!.x - body!.x)).toBeLessThan(body!.w * 0.5);
  }
  // A beat later the others' own stills land on them.
  await hold(page, { shot: 5, at: 0.43 }, "release");
  expect(
    await page.locator('.fx-still-plates-wrap .still-shift[data-hot="1"]').count(),
  ).toBe((enemies - 1) * 4);
});

test("the return leaves a still on every real enemy and light off every ally, and the board has the result", async ({ page }) => {
  await hold(page, { shot: 6, at: 0.5 }, "given");
  const enemies = await enemiesOnBoard(page);
  const party = await page.locator('.stage [data-unit^="p"] .combatant-rig, .stage .combatant[data-side="party"] .combatant-rig').count();
  await expect(page.locator(".cine-anchored .still-held .still-board-rig")).toHaveCount(enemies);
  expect(await page.locator(".cine-anchored .still-given-a .still-board-rig").count()).toBeGreaterThanOrEqual(Math.min(party, 2));
  for (let i = 0; i < enemies; i++) {
    const bar = page.locator(`[data-unit="enemy-${i}"] .combatant-bar i`);
    await expect
      .poll(async () => bar.evaluate((el) => (el as HTMLElement).style.transform))
      .not.toBe("scaleX(1)");
  }
});

test("a boss is framed whole, the worn kit is drawn, and skipping leaves nothing behind", async ({ page }) => {
  await hold(page, { enemy: "collector", gear: "kit", shot: 5, at: 0.3 }, "release");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  const boss = await page.locator('.cine-actors > .cine-actor[data-role="targets"] .cine-sprite').first().boundingBox();
  const frame = await film(page).boundingBox();
  expect(boss!.height).toBeGreaterThan(frame!.height * 0.5);
  expect(boss!.y).toBeGreaterThan(frame!.y - boss!.height * 0.1);
  const caster = page.locator('.cine-actors > .cine-actor[data-role="caster"]');
  await expect(caster.locator('[data-equipment="bastion"]').first()).toBeAttached();
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".still-plate, .still-board-rig, .cine-vfx, .cine-actor").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("FAST keeps the hand, the taking, the quiet and the impact, and drops the wide", async ({ page }) => {
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
  await expect
    .poll(async () => (await record()).shots.at(-1), { timeout: 30_000 })
    .toBe("given");
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const { shots, modes } = await record();
  expect(modes).toEqual(["fast"]);
  expect(shots).toEqual(["call", "pinch", "sleeve", "stopped", "release", "given"]);
});

test("reduced motion plays still cards with no flash and no stills", async ({ page }) => {
  await open(page, { auto: 1, motion: 0 });
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .still-plate, .still-fall").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
