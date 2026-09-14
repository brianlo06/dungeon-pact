import { test, expect, type Page } from "@playwright/test";

/**
 * Dry Flood — the Arcanist · Pyromancer's Ultimate, in the Ultimate lab.
 *
 * Read from the film's own attributes, the fire it draws and the board, never
 * from pixels: which shot is on, who is placed, where the flame and the pour
 * are, how far the fire has run, and what the board says afterwards. The
 * Rivet Sniper's fight puts two enemies in the back row, so a row is tested
 * as a row.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "arcanist", evo: "arc-pyromancer", ...params } as never)}`;

async function open(page: Page, params: Record<string, string | number>) {
  await page.goto(lab(params));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
}

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await open(page, { auto: 1, pause: 1, ...params });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
  // The fire is placed on the frame loop: give it a few frames.
  await page.waitForTimeout(300);
}

const film = (page: Page) => page.locator(".ult-cinematic");
const placed = (page: Page, role: string) => page.locator(`.cine-actors > .cine-actor[data-role="${role}"]:visible`);
/** Tongues of fire along the pour that are showing. */
const burning = (page: Page, wrap: string) =>
  page.locator(`${wrap} .dry-pour-t`).evaluateAll(
    (all) => all.filter((t) => Number(t.getAttribute("opacity") ?? 1) > 0.5 && (t as SVGGraphicsElement).getBoundingClientRect().height > 2).length,
  );

/** The flood's outer outline on screen, or null while nothing has come over the lip. */
const flood = async (page: Page) => {
  const d = await page.locator(".fx-dry-fire-wrap .dry-sheet-0").first().getAttribute("d");
  return d ? box(page, ".fx-dry-fire-wrap .dry-sheet-0") : null;
};

const box = async (page: Page, selector: string, n = 0) => {
  const b = await page.locator(selector).nth(n).boundingBox();
  return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height, top: b.y, bottom: b.y + b.height, left: b.x, right: b.x + b.width } : null;
};

test("its own film: the spark a flame in the glove, then poured, and the hat's tip lifted by the heat", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.2 }, "lip");
  await expect(film(page)).toHaveAttribute("data-cinematic", "dry-flood");
  await expect(placed(page, "caster")).toHaveCount(1);
  // Before the pour: a flame held on the glove, the spark's own drawing stood down.
  const flame = await box(page, ".fx-dry-flame-wrap .dry-flame");
  const glove = await box(page, '.cine-actor[data-role="caster"] [data-part="hand"] path[fill="#d8c8ae"]');
  expect(flame!.w).toBeGreaterThan(20);
  expect(Math.hypot(flame!.x - glove!.x, flame!.bottom - glove!.y)).toBeLessThan(glove!.w * 2.5);
  expect(await page.locator('.cine-actor[data-role="caster"] circle.ph-arc-spark').evaluate((c) => getComputedStyle(c).visibility)).toBe("hidden");
  expect(Number(await page.locator(".fx-dry-pour-wrap .dry-pour").getAttribute("opacity"))).toBe(0);

  // After it: the flame gone from the glove, a ribbon of fire falling from it, and the tip up.
  await hold(page, { shot: 1, at: 0.8 }, "lip");
  expect(Number(await page.locator(".fx-dry-flame-wrap .dry-flame").getAttribute("opacity"))).toBe(0);
  expect(await burning(page, ".fx-dry-pour-wrap")).toBeGreaterThan(6);
  const ribbon = await box(page, ".fx-dry-pour-wrap .dry-pour-band");
  const hand = await box(page, '.cine-actor[data-role="caster"] [data-part="hand"] path[fill="#d8c8ae"]');
  expect(ribbon!.h).toBeGreaterThan(ribbon!.w * 2);
  expect(ribbon!.top).toBeGreaterThan(hand!.top - hand!.h);
  const tip = await page.locator('.cine-actor[data-role="caster"] [data-part="hat"]').evaluate((g) => (g as SVGGElement).style.transform);
  expect(Number(/rotate\(([-\d.]+)deg\)/.exec(tip)?.[1] ?? 0)).toBeGreaterThan(8);
});

test("the basin shows the empty channel first, then one body of fire coming down the steps towards the row", async ({ page }) => {
  // Before the front comes over the lip: nothing burning, only the dry channel.
  await hold(page, { enemy: "sniper", shot: 2, at: 0.2 }, "basin");
  await expect(placed(page, "targets")).toHaveCount(2);
  expect(await page.locator(".fx-dry-fire-wrap .dry-sheet-0").getAttribute("d")).toBeFalsy();
  const early = (await flood(page))!;
  await hold(page, { enemy: "sniper", shot: 2, at: 0.6 }, "basin");
  const mid = (await flood(page))!;
  await hold(page, { enemy: "sniper", shot: 2, at: 0.95 }, "basin");
  const late = (await flood(page))!;
  expect(early).toBeNull();
  expect(late.w).toBeGreaterThan(mid.w);
  // One body: a single outline, never a crowd of separate flames.
  expect(await page.locator(".fx-dry-fire-wrap .dry-t, .fx-dry-fire-wrap use").count()).toBe(0);
  // Still on the steps, up and to the left of the row: it has not reached them.
  const row = await box(page, '.cine-actors > .cine-actor[data-role="targets"] .cine-sprite');
  expect(late.right).toBeLessThan(row!.left);
});

test("the run races the front down the steps, and the quiet holds the row still under the wave", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.2 }, "run");
  const a = (await flood(page))!;
  await hold(page, { shot: 3, at: 0.7 }, "run");
  const b = (await flood(page))!;
  expect(b.w * b.h).toBeGreaterThan(a.w * a.h * 1.3);

  await hold(page, { enemy: "sniper", shot: 4, at: 0.6 }, "draw");
  await expect(placed(page, "targets")).toHaveCount(2);
  for (const look of await placed(page, "targets").evaluateAll((all) => all.map((a) => (a as HTMLElement).dataset.look))) expect(look).toBe("silhouette");
  await expect(placed(page, "caster")).toHaveCount(0);
  expect(await page.locator(".cine-accent, .fx-dry-fire-wrap").count()).toBe(0);
  // The flood's front cresting the top step, high over the row's heads, and rising.
  const wave = await box(page, ".fx-dry-crest-wrap .dry-wave-0");
  const heads = await box(page, '.cine-actors > .cine-actor[data-role="targets"] .cine-sprite');
  expect(wave!.bottom).toBeLessThan(heads!.top + heads!.h * 0.25);
  await hold(page, { enemy: "sniper", shot: 4, at: 0.95 }, "draw");
  const risen = await box(page, ".fx-dry-crest-wrap .dry-wave-0");
  expect(risen!.h).toBeGreaterThan(wave!.h);
});

test("the flood lands on a two-tone frame, and after it the row reads struck in the fire, with the Pyromancer pouring on the lip", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 5, at: 0.101 }, "flood");
  await expect(film(page)).toHaveAttribute("data-two-tone", "");
  await expect(page.locator(".cine-text-impact")).toBeVisible();

  await hold(page, { enemy: "sniper", shot: 5, at: 0.26 }, "flood");
  await expect(film(page)).not.toHaveAttribute("data-two-tone", "");
  await expect(placed(page, "targets")).toHaveCount(2);
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  const frame = await box(page, ".ult-cinematic");
  // The flood is round every enemy of the row: its body at their feet and shins.
  for (let i = 0; i < 2; i++) {
    const target = await box(page, '.cine-actors > .cine-actor[data-role="targets"] .cine-sprite', i);
    expect(target!.right).toBeLessThan(frame!.right + target!.w * 0.2);
    const inFire = await page.locator(".fx-dry-fire-wrap .dry-sheet-0").evaluateAll(
      (paths, t) =>
        paths.some((path) => {
          const el = path as SVGPathElement;
          const m = el.getScreenCTM()!.inverse();
          const at = new DOMPoint(t.x, t.bottom - t.h * 0.12).matrixTransform(m);
          return el.isPointInFill(at);
        }),
      target!,
    );
    expect(inFire, `fire round enemy ${i}`).toBe(true);
  }
  // Flame thrown up over them like spray: blades beyond the sheet's own outline.
  const outlines = await page.locator(".fx-dry-fire-wrap .dry-sheet-0").evaluateAll((paths) => paths.map((p) => (p.getAttribute("d")?.match(/Z/g) ?? []).length));
  expect(Math.max(...outlines)).toBeGreaterThan(8);
  // The Pyromancer, whole and inside the frame on the lip, the pour still falling from its glove.
  const caster = await box(page, '.cine-actors > .cine-actor[data-role="caster"] .cine-sprite');
  const bars = frame!.h * 0.11;
  expect(caster!.left).toBeGreaterThan(frame!.left);
  expect(caster!.top).toBeGreaterThan(frame!.top + bars * 0.8);
  expect(caster!.h).toBeGreaterThan(frame!.h * 0.14);
  expect(caster!.x).toBeLessThan(frame!.left + frame!.w * 0.35);
  const pour = await box(page, ".fx-dry-pour-wrap .dry-pour-band");
  expect(pour!.h).toBeGreaterThan(20);
  expect(Math.abs(pour!.x - caster!.right)).toBeLessThan(caster!.w);
});

test("the return leaves every enemy of the row burning on the board, and the Pyromancer beating out its sleeve", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 6, at: 0.3 }, "burning");
  const fires = page.locator(".cine-anchored.fx-dry-burning-wrap");
  await expect(fires).toHaveCount(2);
  for (let i = 0; i < 2; i++) {
    const unit = await fires.nth(i).getAttribute("data-anchor");
    const rig = await box(page, `.stage [data-unit="${unit}"] .combatant-rig`);
    const fire = await box(page, `.cine-anchored.fx-dry-burning-wrap[data-anchor="${unit}"] svg`);
    expect(Math.abs(fire!.x - rig!.x)).toBeLessThan(rig!.w * 0.4);
    expect(Math.abs(fire!.bottom - rig!.bottom)).toBeLessThan(rig!.h * 0.35);
    const bar = page.locator(`[data-unit="${unit}"] .combatant-bar i`);
    await expect.poll(async () => bar.evaluate((el) => (el as HTMLElement).style.transform)).not.toBe("scaleX(1)");
  }
  await expect(page.locator(".cine-anchored.fx-dry-singe-wrap")).toHaveCount(1);
  const sleeve = await box(page, ".cine-anchored.fx-dry-singe-wrap svg");
  const hand = await box(page, '.stage [data-unit="preview-0"] .combatant-rig [data-part="hand"]');
  expect(Math.hypot(sleeve!.x - hand!.x, sleeve!.bottom - hand!.y)).toBeLessThan(hand!.w * 1.5 + 20);
});

test("a boss is framed whole, the worn kit is drawn, and skipping leaves nothing behind", async ({ page }) => {
  await hold(page, { enemy: "collector", gear: "kit", shot: 5, at: 0.3 }, "flood");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  const boss = await box(page, '.cine-actors > .cine-actor[data-role="targets"] .cine-sprite');
  const frame = await box(page, ".ult-cinematic");
  expect(boss!.h).toBeGreaterThan(frame!.h * 0.45);
  expect(boss!.top).toBeGreaterThan(frame!.top - boss!.h * 0.1);
  const caster = page.locator('.cine-actors > .cine-actor[data-role="caster"]');
  await expect(caster.locator('[data-equipment="bastion"]').first()).toBeAttached();
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".dry-t, .dry-sheet, .dry-burning, .dry-singe, .cine-vfx, .cine-actor").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("the quiet keeps a boss clear of the light it is waiting for", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 4, at: 0.6 }, "draw");
  const boss = await box(page, '.cine-actors > .cine-actor[data-role="targets"] .cine-sprite');
  const wave = await box(page, ".fx-dry-crest-wrap .dry-wave-0");
  expect(boss!.left).toBeGreaterThan(wave!.x);
});

test("FAST keeps the pour, the run, the quiet and the flood, and drops the basin", async ({ page }) => {
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
  await expect.poll(async () => (await record()).shots.at(-1), { timeout: 30_000 }).toBe("burning");
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const { shots, modes } = await record();
  expect(modes).toEqual(["fast"]);
  expect(shots).toEqual(["call", "lip", "run", "draw", "flood", "burning"]);
});

test("reduced motion plays still cards with no flash and no fire", async ({ page }) => {
  await open(page, { auto: 1, motion: 0 });
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .dry-t, .dry-sheet, .dry-burning").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
