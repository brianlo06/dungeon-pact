import { test, expect, type Page } from "@playwright/test";

/**
 * Warpath, the Vanguard · Warlord's Ultimate, in the Ultimate lab.
 *
 * What it has to prove: that the Warlord plays its own film and not the
 * Lantern Wall; that the Ultimate does what it says (the enemy Marked and
 * Vulnerable, the whole party warded and standing in one front line); that
 * the real party and the real target are in it; that the helm acts, the quiet
 * is quiet and the blow is drawn on the enemy; and that it frames a boss,
 * wears its gear, keeps the quiet and the blow in FAST and hands back clean.
 * Read from the film's attributes, its cast, its effects and the board, never
 * from pixels.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "vanguard", evo: "van-warlord", party: 3, ...params } as never)}`;

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(lab({ auto: 1, pause: 1, ...params }));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

const film = (page: Page) => page.locator(".ult-cinematic");
const visible = (page: Page, role: string) => page.locator(`.cine-actor[data-role="${role}"]:visible`);
const angle = (t: string) => Number(/rotate\((-?[\d.]+)deg\)/.exec(t)?.[1] ?? NaN);
const partAngle = (page: Page, part: string) =>
  page
    .locator(`.cine-actor[data-role="caster"] [data-part="${part}"]`)
    .first()
    .evaluate((e) => (e as HTMLElement).style.transform)
    .then(angle);
const exposure = (page: Page) =>
  page.locator(".cine-film").evaluate((e) => Number((e as HTMLElement).style.getPropertyValue("--exposure")));
const pathLength = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((els) => els.reduce((n, e) => n + (e.getAttribute("d") ?? "").length, 0));

test("the Warlord plays Warpath, not the Lantern Wall, and hands back to the round", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.5 }, "front");
  await expect(film(page)).toHaveAttribute("data-cinematic", "warpath");
  await page.getByRole("button", { name: "▶ Play" }).click();
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  expect(await page.locator("[class*='cine-'], [class*='wp-']").count()).toBe(0);
});

test("the enemy is left Marked and Vulnerable, and the whole party stands warded in one front line", async ({ page }) => {
  await page.goto(lab({ auto: 1, party: 4, mode: "fast" }));
  await expect(film(page)).toHaveAttribute("data-cinematic", "warpath", { timeout: 30_000 });
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  await page.getByRole("button", { name: "Battle history" }).click();
  await expect(page.locator(".history-drawer li").first()).toBeAttached();
  const lines = await page.locator(".history-drawer li").allTextContents();
  expect(lines.some((l) => /: Marked \+1$/.test(l))).toBe(true);
  expect(lines.some((l) => /: Vulnerable \+1$/.test(l))).toBe(true);
  expect(lines.filter((l) => /is warded\.$/.test(l)).length).toBeGreaterThanOrEqual(4);
  expect(lines.some((l) => /intercept/i.test(l) && /will/.test(l))).toBe(false);
  await page.keyboard.press("Escape");
  await expect(page.locator('.combatant[data-side="enemy"] .status-readout').filter({ hasText: "Marked" })).toHaveCount(1);
  // Everyone followed into the front: one line of heroes, not a Vanguard ahead of the rest.
  const feet = await page
    .locator('.stage .combatant[data-side="hero"] .combatant-rig')
    .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().bottom));
  expect(feet.length).toBe(4);
  expect(Math.max(...feet) - Math.min(...feet)).toBeLessThan(12);
});

test("the helm acts the warcry: thrown back, then forward, breath out of the visor, the figure held still", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.3 }, "roar");
  const back = await partAngle(page, "head");
  expect(back).toBeLessThan(-12);
  const breathShown = () => page.locator(".fx-warpath-breath-wrap").evaluate((e) => (e as HTMLElement).style.visibility !== "hidden");
  expect(await breathShown()).toBe(false);
  await hold(page, { shot: 1, at: 0.6 }, "roar");
  expect(await partAngle(page, "head")).toBeGreaterThan(back + 12);
  expect(await breathShown()).toBe(true);
  // `root: false`: in the close-up only the parts move.
  expect(await page.locator('.cine-actor[data-role="caster"] .cine-rig').evaluate((e) => (e as HTMLElement).style.transform)).toBe("");
  // The breath leaves from the visor slit, not somewhere over the helm.
  const slit = (await page.locator('.cine-actor[data-role="caster"] [data-part="head"] rect').first().boundingBox())!;
  const breath = await page.locator(".fx-warpath-breath-wrap").evaluate((e) => {
    const r = e.getBoundingClientRect();
    return { x: r.x, y: r.y };
  });
  expect(Math.abs(breath.x - (slit.x + slit.width))).toBeLessThan(slit.width);
  expect(Math.abs(breath.y - (slit.y + slit.height / 2))).toBeLessThan(slit.width);
});

test("the Warlord breaks trail at the real enemy, and the real party wades in its tracks", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.6 }, "trail");
  await expect(visible(page, "allies")).toHaveCount(2);
  await expect(visible(page, "targets")).toHaveCount(1);
  await expect(visible(page, "caster")).toHaveCount(1);
  // The snow is round their legs: one channel along the file.
  expect(await pathLength(page, ".wp-drift .wp-crust")).toBeGreaterThan(400);
  const box = async (role: string) => (await visible(page, role).first().locator(".cine-sprite").boundingBox())!;
  const caster = await box("caster");
  const target = await box("targets");
  const allies = await visible(page, "allies").locator(".cine-sprite").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().x));
  // In a file: every ally behind the Warlord, and the enemy ahead of it.
  for (const x of allies) expect(x).toBeLessThan(caster.x);
  expect(target.x).toBeGreaterThan(caster.x + caster.width);
});

test("the quiet is from above: darker, the wind dropped, the trail one line, no accent", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.9 }, "trail");
  const loud = await exposure(page);
  await hold(page, { shot: 3, at: 0.9 }, "above");
  expect(await exposure(page)).toBeLessThan(loud * 0.7);
  await expect(page.locator('.wp-snow[data-mode="settle"]')).toHaveCount(1);
  await expect(page.locator('.wp-snow[data-mode="drive"]')).toHaveCount(0);
  expect(await pathLength(page, ".wp-trail .wp-trail-floor")).toBeGreaterThan(200);
  expect(await page.locator(".cine-accent, .fx-warpath-cleave-wrap").count()).toBe(0);
  await expect(visible(page, "allies")).toHaveCount(2);
  await expect(visible(page, "targets")).toHaveCount(1);
});

test("the blow is drawn on the enemy and reveals the damage on the held frame", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.06 }, "blow");
  await expect(page.locator('.cine-accent[data-screen="two-tone"]')).toBeAttached();
  await expect(page.locator(".cine-text-impact")).toHaveText(/^\d+$/);
  const z = (role: string) => page.locator(`.cine-actor[data-role="${role}"]`).first().evaluate((e) => Number((e as HTMLElement).style.zIndex));
  expect(await z("caster")).toBeGreaterThan(await z("targets"));
  // The sword has come over the top and down (from drawn back, under 100°, to past 200°).
  expect(await partAngle(page, "sword")).toBeGreaterThan(190);
  // The cleave is drawn where the blade is, and on the enemy.
  const cleave = (await page.locator(".fx-warpath-cleave-wrap").boundingBox())!;
  const blade = (await page.locator('.cine-actor[data-role="caster"] [data-part="blade"] path').first().boundingBox())!;
  const enemy = (await visible(page, "targets").locator(".cine-sprite").boundingBox())!;
  expect(cleave.x).toBeGreaterThan(blade.x);
  expect(cleave.x).toBeLessThan(blade.x + blade.width * 1.1);
  expect(cleave.x).toBeGreaterThan(enemy.x);
  // After the hold the enemy is knocked, the snow thrown, and the party arrives behind.
  await hold(page, { shot: 4, at: 0.9 }, "blow");
  expect(await visible(page, "targets").first().evaluate((e) => (e as HTMLElement).style.transform)).toMatch(/rotate\([1-9]/);
  await expect(visible(page, "allies")).toHaveCount(2);
});

test("the board keeps what it did: prints into the front for everyone, and the trail trampled at the enemy", async ({ page }) => {
  await hold(page, { party: 4, shot: 5, at: 0.6 }, "front");
  await expect(page.locator('.wp-board[data-mode="prints"]')).toHaveCount(4);
  await expect(page.locator('.wp-board[data-mode="end"]')).toHaveCount(1);
  await expect(page.locator('.wp-board[data-mode="lead"]')).toHaveCount(1);
});

test("a boss is framed, the worn weapon strikes, FAST keeps the quiet and the blow, and a skip leaves nothing", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 4, at: 0.3 }, "blow");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  const frame = (await film(page).boundingBox())!;
  const boss = (await visible(page, "targets").locator(".cine-sprite").boundingBox())!;
  const caster = (await visible(page, "caster").locator(".cine-sprite").boundingBox())!;
  expect(boss.x + boss.width * 0.5).toBeLessThan(frame.x + frame.width);
  expect(boss.height).toBeGreaterThan(caster.height);
  expect(caster.y).toBeGreaterThan(frame.y);

  await hold(page, { gear: "kit", shot: 4, at: 0.3 }, "blow");
  await expect(page.locator('.cine-actor[data-role="caster"] [data-equipment="blood-price"]').first()).toBeAttached();

  await page.addInitScript(() => {
    const w = window as unknown as { shots: string[] };
    w.shots = [];
    new MutationObserver(() => {
      const shot = document.querySelector(".ult-cinematic")?.getAttribute("data-shot");
      if (shot && w.shots.at(-1) !== shot) w.shots.push(shot);
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-shot", "data-mode"] });
  });
  await page.goto(lab({ auto: 1, mode: "fast" }));
  await expect(film(page)).toHaveAttribute("data-mode", "fast", { timeout: 30_000 });
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const shots = await page.evaluate(() => (window as unknown as { shots: string[] }).shots);
  for (const shot of ["roar", "trail", "above", "blow"]) expect(shots).toContain(shot);

  await hold(page, { shot: 3, at: 0.5 }, "above");
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .wp-snow, .wp-board").count()).toBe(0);
});
