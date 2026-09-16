import { test, expect, type Page } from "@playwright/test";

/**
 * Hallowed Ground, the Herald · Sanctifier's Ultimate, in the lab.
 *
 * What it has to prove: that the Sanctifier plays its own film and not the
 * Anthem, the Din or the Elegy; that the Ultimate does what it says (every
 * ally warded for four rounds, the Sanctifier moved to the
 * front, nobody Empowered); that the real party is in it and no enemy; that
 * the face acts; that the line is scored, held, and closed with a stroke
 * that lights it; that the soot goes off the floor and the party does not
 * move; and that it keeps its shape in
 * FAST, wears its gear, frames a boss as normal and hands back clean. Read
 * from the film's attributes, its cast, its drawings and the battle log,
 * never from pixels.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "herald", evo: "hrl-sanctifier", party: 3, ...params } as never)}`;

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(lab({ auto: 1, pause: 1, ...params }));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

const cinematic = (page: Page) => page.locator(".ult-cinematic");
const visible = (page: Page, role: string) => page.locator(`.cine-actor[data-role="${role}"]:visible`);
const pathX = (d: string) => Number(/L(-?[\d.]+) /.exec(d)?.[1] ?? NaN);

test("the Sanctifier plays Hallowed Ground, with no enemy in it, and hands back to the round with nothing left", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.4 }, "held");
  await expect(cinematic(page)).toHaveAttribute("data-cinematic", "hallowed-ground");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "normal");
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveCount(0);
  await page.getByRole("button", { name: "▶ Play" }).click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  expect(await page.locator("[class*='cine-'], [class*='hallow-']").count()).toBe(0);
});

test("the whole party is warded for four rounds, nobody is Empowered, and the Sanctifier holds the front", async ({ page }) => {
  await page.goto(lab({ auto: 1, party: 4, mode: "fast" }), { waitUntil: "commit" });
  await expect(cinematic(page)).toHaveAttribute("data-cinematic", "hallowed-ground", { timeout: 30_000 });
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  await page.getByRole("button", { name: "Battle history" }).click();
  await expect(page.locator(".history-drawer li").first()).toBeAttached();
  const lines = await page.locator(".history-drawer li").allTextContents();
  // An Ultimate's Barrier logs a ward beat; an enemy's own Barrier (the Bulwark's
  // Lock shields) does not, so only the lines a ward follows are the Sanctifier's.
  const warded = (n: number) => lines.filter((l, i) => new RegExp(`: Barrier \\+${n}$`).test(l) && / is warded\.$/.test(lines[i + 1] ?? "")).length;
  expect(warded(10)).toBe(4);
  expect(lines.filter((l) => / is warded\.$/.test(l)).length).toBe(4);
  expect(lines.some((l) => /Empowered/.test(l))).toBe(false);
  expect(lines.some((l) => /strips/.test(l))).toBe(false);
  await page.keyboard.press("Escape");
  // Lasting: three rounds of it still to come after this one, on everyone it was not spent on.
  const readout = page.locator('.combatant[data-side="hero"] .status-readout').filter({ hasText: "Barrier" });
  expect(await readout.count()).toBeGreaterThan(0);
  for (const r of await readout.all()) await expect(r).toContainText("3r");
});
  await expect(readout).toHaveCount(4);
  for (const r of await readout.all()) await expect(r).toContainText("3r");
});

test("the close-up acts with the face: the open smile goes, the brows come down, and it sets", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.08 }, "set");
  const caster = page.locator('.cine-actor[data-role="caster"]');
  await expect(caster).toHaveAttribute("data-root", "0");
  const d = (part: string) => caster.locator(`[data-part="${part}"]`).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).d);
  const f = (part: string) => caster.locator(`[data-part="${part}"]`).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).f);
  const smile = await d("mouth");
  const browEarly = await f("brow");
  const headEarly = await caster.locator('[data-part="head"]').evaluate((el) => (el as HTMLElement).style.transform);
  await hold(page, { shot: 1, at: 0.94 }, "set");
  for (const part of ["eyes", "mouth", "brow"])
    expect(await caster.locator(`[data-part="${part}"]`).evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");
  // The drawn smile pressed to a line; the eyes open and steady, not shut; the brows down.
  expect(smile).toBeGreaterThan(0.9);
  expect(await d("mouth")).toBeLessThan(0.4);
  expect(await d("eyes")).toBeGreaterThan(0.6);
  expect(await f("brow")).toBeGreaterThan(browEarly);
  const headLate = await caster.locator('[data-part="head"]').evaluate((el) => (el as HTMLElement).style.transform);
  expect(headLate).not.toBe(headEarly);
  await expect(page.locator(".fx-hallow-soot-wrap")).not.toHaveCSS("visibility", "hidden");
});

test("the line is scored across the floor behind the walking Sanctifier, in front of the real party", async ({ page }) => {
  await hold(page, { party: 4, shot: 2, at: 0.25 }, "line");
  await expect(visible(page, "allies")).toHaveCount(3);
  await expect(visible(page, "caster")).toHaveCount(1);
  await expect(visible(page, "targets")).toHaveCount(0);
  const groove = page.locator(".hallow-groove");
  const early = pathX((await groove.getAttribute("d")) ?? "");
  expect(await page.locator(".hallow-spark").evaluateAll((els) => els.filter((e) => Number(e.getAttribute("opacity")) > 0).length)).toBeGreaterThan(3);
  await hold(page, { party: 4, shot: 2, at: 0.85 }, "line");
  const late = pathX((await page.locator(".hallow-groove").getAttribute("d")) ?? "");
  // The groove grows with the walk, and trails the figure.
  expect(late - early).toBeGreaterThan(300);
  const casterX = await page.locator('.cine-actor[data-role="caster"]').evaluate((el) => new DOMMatrix((el as HTMLElement).style.transform).e);
  expect(late).toBeLessThan(casterX);
});

test("the quiet looks down the groove to the Sanctifier coiled over its end, the embers going out, nothing lit", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.5 }, "coil");
  await expect(visible(page, "caster")).toHaveCount(1);
  await expect(visible(page, "allies")).toHaveCount(0);
  expect(await page.locator(".hallow-halo").evaluate((e) => Number((e as SVGElement).style.opacity))).toBe(0);
  expect(await page.locator(".hallow-spark").evaluateAll((els) => els.filter((e) => Number(e.getAttribute("opacity")) > 0).length)).toBe(0);
  // The groove is a wedge running away from the lens.
  expect(((await page.locator(".hallow-groove").getAttribute("d")) ?? "").endsWith("Z")).toBe(true);
  // The standard drawn back: its foot behind the heels.
  const banner = page.locator('.cine-actor[data-role="caster"] [data-part="banner"]');
  expect(Number(/rotate\((-?[\d.]+)deg\)/.exec(await banner.evaluate((e) => (e as HTMLElement).style.transform))?.[1] ?? 0)).toBeGreaterThan(30);
  const embersEarly = await page.locator(".hallow-hot").evaluate((e) => Number((e as SVGElement).style.opacity));
  await hold(page, { shot: 3, at: 0.95 }, "coil");
  const embersLate = await page.locator(".hallow-hot").evaluate((e) => Number((e as SVGElement).style.opacity));
  expect(embersLate).toBeLessThan(embersEarly);
  expect(await page.locator(".cine-accent").count()).toBe(0);
});

test("the stroke is drawn: the pole swept forward, the line lit end to end on the held frame, the soot off the floor, the party unmoved", async ({ page }) => {
  await hold(page, { party: 4, shot: 4, at: 0.02 }, "stroke");
  const dim = await page.locator(".hallow-core").evaluate((e) => Number((e as SVGElement).style.opacity));
  expect(dim).toBeLessThan(0.3);
  const before = await visible(page, "allies").evaluateAll((els) => els.map((e) => (e as HTMLElement).style.transform));
  // Just after contact, on the frame the stop holds: all of it is already there.
  await hold(page, { party: 4, shot: 4, at: 0.06 }, "stroke");
  expect(await page.locator(".hallow-core").evaluate((e) => Number((e as SVGElement).style.opacity))).toBeGreaterThan(0.8);
  expect(await page.locator(".hallow-stone-clip-rect").evaluate((e) => Number(e.getAttribute("height")))).toBeGreaterThan(150);
  expect(await page.locator(".hallow-flake").evaluateAll((els) => els.filter((e) => Number(e.getAttribute("opacity")) > 0).length)).toBeGreaterThan(100);
  expect(await page.locator(".hallow-streak").evaluateAll((els) => els.filter((e) => Number(e.getAttribute("opacity")) > 0).length)).toBeGreaterThan(15);
  // Swept, not planted: the pole's foot is forward of the hand.
  const banner = page.locator('.cine-actor[data-role="caster"] [data-part="banner"]');
  const angle = Number(/rotate\((-?[\d.]+)deg\)/.exec(await banner.evaluate((e) => (e as HTMLElement).style.transform))?.[1] ?? 0);
  expect(angle).toBeLessThan(-6);
  await hold(page, { party: 4, shot: 4, at: 0.5 }, "stroke");
  expect(await page.locator(".hallow-halo").evaluate((e) => Number((e as SVGElement).style.opacity))).toBeGreaterThan(0.4);
  expect(await page.locator(".hallow-stone").evaluate((e) => Number((e as SVGElement).style.opacity))).toBe(1);
  expect(await page.locator(".hallow-flake").evaluateAll((els) => els.filter((e) => Number(e.getAttribute("opacity")) > 0).length)).toBeGreaterThan(40);
  await expect(page.locator(".cine-text-voice")).toBeVisible();
  // Nobody moved: the allies' placements are where they were.
  const after = await visible(page, "allies").evaluateAll((els) => els.map((e) => (e as HTMLElement).style.transform));
  expect(after).toEqual(before);
});

test("the board keeps a lit seam along the party's front and a clean flagstone under every one of them", async ({ page }) => {
  await hold(page, { party: 4, shot: 5, at: 0.8 }, "held");
  await expect(page.locator('.hallow-board[data-mode="line"]')).toHaveCount(1);
  const seam = page.locator(".hallow-board-line");
  const width = await seam.evaluate((e) => parseFloat((e as HTMLElement).style.width));
  expect(width).toBeGreaterThan(200);
  await expect(page.locator('.hallow-board[data-mode="stone"]')).toHaveCount(4);
  await hold(page, { shot: 0, at: 0.9 }, "call");
  await expect(page.locator('.hallow-board[data-mode="knock"]')).toHaveCount(1);
});

test("a boss changes nothing but the board, the worn weapon makes the stroke, FAST keeps the line, the quiet and the stroke, and a skip leaves nothing", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 4, at: 0.4 }, "stroke");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "normal");
  await expect(visible(page, "targets")).toHaveCount(0);

  await hold(page, { gear: "kit", shot: 4, at: 0.5 }, "stroke");
  await expect(page.locator('.cine-actor[data-role="caster"] [data-equipment="blood-price"]').first()).toBeAttached();

  await page.addInitScript(() => {
    const w = window as unknown as { shots: string[] };
    w.shots = [];
    new MutationObserver(() => {
      const shot = document.querySelector(".ult-cinematic")?.getAttribute("data-shot");
      if (shot && w.shots.at(-1) !== shot) w.shots.push(shot);
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-shot", "data-mode"] });
  });
  // From commit, not load: a FAST film can be over before a slow load event.
  await page.goto(lab({ auto: 1, mode: "fast" }), { waitUntil: "commit" });
  await expect(cinematic(page)).toHaveAttribute("data-mode", "fast", { timeout: 30_000 });
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  const shots = await page.evaluate(() => (window as unknown as { shots: string[] }).shots);
  for (const shot of ["call", "set", "line", "coil", "stroke", "held"]) expect(shots).toContain(shot);

  await hold(page, { shot: 3, at: 0.5 }, "coil");
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .hallow-score, .hallow-soot, .hallow-board").count()).toBe(0);
});
