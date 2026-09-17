import { test, expect, type Page } from "@playwright/test";

/**
 * Command Performance — the Beguiler · Puppeteer's Ultimate, in the Ultimate
 * lab.
 *
 * Read from the film's own attributes, the effects it mounts and the board,
 * never from pixels: which shot is on, who is placed and where, where the
 * strings run from and to, how the puppet's figure has been moved, and what
 * the board says afterwards.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "beguiler", evo: "bgl-puppeteer", ...params } as never)}`;

async function open(page: Page, params: Record<string, string | number>) {
  await page.goto(lab(params));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
}

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await open(page, { auto: 1, pause: 1, ...params });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, {
    timeout: 30_000,
  });
  // A paused frame still runs the frame loop once the shot is mounted.
  await page.waitForTimeout(300);
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

/** The puppet's figure as the film has moved it: translate and rotation of its `.cine-look`. */
const lookOf = (page: Page, slot: number) =>
  page
    .locator('.cine-actor[data-role="targets"]')
    .nth(slot)
    .locator(".cine-look")
    .evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return { a: m.a, e: m.e, f: m.f, set: el.style.transform !== "" };
    });

/** Where each drawn string starts and ends, on screen. */
const strings = (page: Page) =>
  page.locator(".perf-strings .perf-string-core").evaluateAll((paths) =>
    (paths as SVGPathElement[]).map((p) => {
      if (!p.getAttribute("d")) return null;
      const m = p.getScreenCTM()!;
      const a = new DOMPoint().matrixTransform(m);
      const start = p.getPointAtLength(0).matrixTransform(m);
      const end = p.getPointAtLength(p.getTotalLength()).matrixTransform(m);
      return { from: [start.x, start.y], to: [end.x, end.y], origin: [a.x, a.y] };
    }),
  );

test("casting: the strings run from the Beguiler's control to one real enemy, and stand it up", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.8 }, "casting");
  await expect(film(page)).toHaveAttribute("data-cinematic", "command-performance");
  const enemies = await enemiesOnBoard(page);
  expect(enemies).toBeGreaterThanOrEqual(2);
  // The swing reached every other enemy, so the whole side is in the cast.
  await expect(placed(page, "targets")).toHaveCount(enemies);
  await expect(placed(page, "caster")).toHaveCount(1);
  const drawn = (await strings(page)).filter(Boolean);
  expect(drawn).toHaveLength(3);
  const bar = await box(page, '.cine-actor[data-role="caster"] [data-part="control"]');
  const puppet = await box(page, '.cine-actor[data-role="targets"] .cine-sprite');
  for (const s of drawn) {
    // From the crossbar…
    expect(s!.from[0]).toBeGreaterThan(bar!.x - bar!.width * 0.3);
    expect(s!.from[0]).toBeLessThan(bar!.x + bar!.width * 1.3);
    expect(s!.from[1]).toBeGreaterThan(bar!.y - bar!.height * 0.5);
    expect(s!.from[1]).toBeLessThan(bar!.y + bar!.height * 1.5);
    // …to the puppet, and only the puppet.
    expect(s!.to[0]).toBeGreaterThan(puppet!.x - puppet!.width * 0.2);
    expect(s!.to[0]).toBeLessThan(puppet!.x + puppet!.width * 1.2);
  }
  // The hooks have bitten, and the puppet has been jerked up off its feet.
  const hooks = await page.locator(".perf-strings .perf-hook").evaluateAll((cs) => cs.map((c) => Number(c.getAttribute("r"))));
  expect(hooks.every((r) => r > 0)).toBe(true);
  const look = await lookOf(page, 0);
  expect(look.set).toBe(true);
  expect(look.f).toBeLessThan(0);
  // The rest of the line is left where the stage put it.
  expect((await lookOf(page, 1)).f).toBe(0);
});

test("the snip: the doll is on its strings, then cut loose and gone", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.15 }, "snip");
  const doll = page.locator('.cine-actor[data-role="caster"] [data-part="doll"]');
  await expect(doll).toBeAttached();
  const before = await doll.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  expect(before).toBeGreaterThan(0.9);
  await hold(page, { shot: 1, at: 0.95 }, "snip");
  const after = await doll.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  expect(after).toBeLessThan(0.05);
  // And it stays gone: the later shots hold the doll and the short strings out of sight.
  await hold(page, { shot: 2, at: 0.5 }, "casting");
  const later = await doll.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  expect(later).toBeLessThan(0.05);
});

test("blocking: the puppet is walked into its own line, and the rest turn to face it", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.1 }, "blocking");
  const early = await lookOf(page, 0);
  await hold(page, { shot: 3, at: 0.9 }, "blocking");
  const late = await lookOf(page, 0);
  // Carried forward on its strings (the look is in the figure's own drawing units).
  expect(Math.abs(late.e - early.e)).toBeGreaterThan(20);
  // The rest are turned round (a mirror on their look).
  expect((await lookOf(page, 1)).a).toBeLessThan(0);
});

test("the held pose is quiet: the puppet hoisted in silhouette, nothing loud", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.5 }, "held");
  await expect(placed(page, "targets")).toHaveCount(1);
  await expect(placed(page, "caster")).toHaveCount(0);
  await expect(page.locator('.cine-actor[data-role="targets"]:visible')).toHaveAttribute("data-look", "silhouette");
  expect((await lookOf(page, 0)).f).toBeLessThan(0);
  expect(await page.locator(".cine-accent, .fx-perf-splinters-wrap, .fx-perf-curtain-wrap").count()).toBe(0);
  await expect(page.locator(".cine-text-impact")).toHaveCount(0);
  // Strings go up out of the top of the frame.
  const frame = await film(page).boundingBox();
  for (const s of (await strings(page)).filter(Boolean)) expect(s!.from[1]).toBeLessThan(frame!.y);
});

test("the swing: on the drawn frame the puppet is into the next enemy, then goes on through the line", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.1 }, "swing");
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  const puppet = await box(page, '.cine-actor[data-role="targets"] .cine-sprite');
  const first = await page.locator('.cine-actor[data-role="targets"]').nth(1).locator(".cine-sprite").boundingBox();
  // The two bodies overlap: the blow, not a gap.
  expect(puppet!.x + puppet!.width).toBeGreaterThan(first!.x);
  expect(puppet!.x).toBeLessThan(first!.x + first!.width);
  // The first burst of splinters is lit.
  await expect(page.locator(".perf-burst").first()).toHaveCSS("visibility", "visible");
  // A sheaf of string lines is fanned along the arc it came by.
  const sheaf = await page.locator(".perf-sheaf-line").evaluateAll((ls) => ls.filter((l) => l.getAttribute("d")).length);
  expect(sheaf).toBeGreaterThanOrEqual(8);
  // By the end of its swing every one of the rest has been struck.
  await hold(page, { shot: 5, at: 0.6 }, "swing");
  const hits = await page
    .locator('.cine-actor[data-role="targets"]:visible')
    .evaluateAll((figs) => figs.slice(1).map((f) => (f as HTMLElement).dataset.perfHit !== undefined));
  expect(hits.length).toBeGreaterThan(0);
  expect(hits.every(Boolean)).toBe(true);
  // And at the very end the drop curtain is down over the whole frame.
  await hold(page, { shot: 5, at: 0.995 }, "swing");
  const cloth = await box(page, ".perf-curtain-drop");
  const frame = await film(page).boundingBox();
  expect(cloth!.y).toBeLessThanOrEqual(frame!.y + 2);
  expect(cloth!.y + cloth!.height).toBeGreaterThanOrEqual(frame!.y + frame!.height * 0.99);
});

test("curtain call: the puppet hangs on strings in the real board, and the rest are struck", async ({ page }) => {
  await hold(page, { shot: 6, at: 0.6 }, "curtain-call");
  const enemies = await enemiesOnBoard(page);
  // Three strings hang onto one unit, the puppet, and nothing else.
  await expect(page.locator(".cine-anchored.fx-perf-drop-wrap .perf-drop-string:visible")).toHaveCount(3);
  const shown = (kind: string) =>
    page
      .locator(`.cine-anchored.fx-${kind}-wrap`)
      .evaluateAll((els) => els.filter((e) => (e as HTMLElement).style.display !== "none").map((e) => (e as HTMLElement).dataset.anchor));
  const drops = await shown("perf-drop");
  const bursts = await shown("perf-splinters");
  expect(drops).toHaveLength(1);
  // Splinters off every other enemy the swing went through, never off the puppet.
  expect(bursts).toHaveLength(enemies - 1);
  expect(bursts).not.toContain(drops[0]);
  // The rest carry the swing's damage on the board. (The puppet's own bar is
  // not checked: in this fixture the Kiln Mender mends it back up in the round.)
  for (const unit of bursts) {
    const bar = page.locator(`[data-unit="${unit}"] .combatant-bar i`);
    await expect
      .poll(async () => bar.evaluate((el) => (el as HTMLElement).style.transform))
      .not.toBe("scaleX(1)");
  }
  // And the puppet is left open.
  await expect(page.locator(`[data-unit="${drops[0]}"]`)).toContainText("Vulnerable");
});

test("a boss is yanked, not swung; it is framed whole, the worn kit is drawn, and skipping leaves nothing behind", async ({ page }) => {
  await hold(page, { enemy: "collector", gear: "kit", shot: 5, at: 0.3 }, "swing");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  await expect(page.locator('.perf-strings[data-mode="yank"]')).toHaveCount(1);
  const boss = await page.locator('.cine-actor[data-role="targets"] .cine-sprite').first().boundingBox();
  const frame = await film(page).boundingBox();
  expect(boss!.height).toBeGreaterThan(frame!.height * 0.4);
  expect(boss!.y).toBeGreaterThan(frame!.y - boss!.height * 0.05);
  expect(boss!.y + boss!.height).toBeLessThan(frame!.y + frame!.height * 1.02);
  const caster = page.locator('.cine-actor[data-role="caster"]');
  await expect(caster.locator('[data-equipment="bastion"]').first()).toBeAttached();
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[class*='perf-'], .cine-vfx, .cine-actor").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("FAST keeps the snip, the walk, the silence, the swing and the curtain, and drops the casting", async ({ page }) => {
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
    .toBe("curtain-call");
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const { shots, modes } = await page.evaluate(() => {
    const w = window as unknown as { shots: string[]; modes: string[] };
    return { shots: w.shots, modes: w.modes };
  });
  expect(modes).toEqual(["fast"]);
  expect(shots).toEqual(["call", "snip", "blocking", "held", "swing", "curtain-call"]);
});

test("reduced motion plays still cards with no flash", async ({ page }) => {
  await open(page, { auto: 1, motion: 0 });
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .perf-strings, .perf-curtain").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
