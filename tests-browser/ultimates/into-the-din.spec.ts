import { test, expect, type Page } from "@playwright/test";

/**
 * Into the Din, the Herald · Warcaller's Ultimate, in the Ultimate lab.
 *
 * What it has to prove: that the Warcaller plays its own film and not the
 * Anthem; that the Ultimate does what it says (the blow Empowered, the target
 * left Vulnerable, every ally Empowered for the round); that the real party
 * and the real target are in it; that the quiet is quiet and the blow is
 * drawn; and that it frames a boss, wears its gear and hands back clean. Read
 * from the film's attributes, its cast, its drawings and the battle log —
 * never from pixels.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "herald", evo: "hrl-warcaller", party: 3, ...params } as never)}`;

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(lab({ auto: 1, pause: 1, ...params }));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

const cinematic = (page: Page) => page.locator(".ult-cinematic");
const visible = (page: Page, role: string) => page.locator(`.cine-actor[data-role="${role}"]:visible`);
/** How many strokes a din layer is drawing right now. */
const strokes = (page: Page, layer: string) =>
  page.locator(`.din-noise .din-${layer}`).evaluateAll((els) => els.reduce((n, e) => n + ((e.getAttribute("d") ?? "").match(/M/g)?.length ?? 0), 0));

test("the Warcaller plays Into the Din, not the Anthem, and hands back to the round", async ({ page }) => {
  await hold(page, { shot: 6, at: 0.4 }, "carried");
  await expect(cinematic(page)).toHaveAttribute("data-cinematic", "into-the-din");
  await page.getByRole("button", { name: "▶ Play" }).click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  expect(await page.locator("[class*='cine-'], [class*='din-']").count()).toBe(0);
});

test("the blow is Empowered, the target is left Vulnerable and every ally is Empowered for the round", async ({ page }) => {
  await page.goto(lab({ auto: 1, party: 4, mode: "fast" }));
  await expect(cinematic(page)).toHaveAttribute("data-cinematic", "into-the-din", { timeout: 30_000 });
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  await page.getByRole("button", { name: "Battle history" }).click();
  await expect(page.locator(".history-drawer li").first()).toBeAttached();
  const lines = await page.locator(".history-drawer li").allTextContents();
  const blow = lines.findIndex((l) => /damage/.test(l));
  const empowered = lines.map((l, i) => (/: Empowered \+1$/.test(l) ? i : -1)).filter((i) => i >= 0);
  // The Warcaller first, before the blow; then all three allies after it.
  expect(empowered.length).toBeGreaterThanOrEqual(4);
  expect(empowered[0]).toBeLessThan(blow);
  expect(empowered.filter((i) => i > blow).length).toBeGreaterThanOrEqual(3);
  expect(lines.some((l) => /: Vulnerable \+1$/.test(l))).toBe(true);
  // The Warcaller's own courage outlasts the round; the enemy stays rung open.
  await page.keyboard.press("Escape");
  await expect(page.locator(".combatant[data-you] .status-readout")).toContainText("Empowered");
  await expect(page.locator('.combatant[data-side="enemy"] .status-readout').filter({ hasText: "Vulnerable" })).toHaveCount(1);
});

test("the real party holds back in the din while the Warcaller walks out at the real target", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.6 }, "out-front");
  await expect(visible(page, "allies")).toHaveCount(2);
  await expect(visible(page, "targets")).toHaveCount(1);
  await expect(visible(page, "caster")).toHaveCount(1);
  expect(await strokes(page, "bone")).toBeGreaterThan(60);
  // It walks: the stride is written on the copy.
  const stride = await page.locator('.cine-actor[data-role="caster"] .cine-look').evaluate((e) => (e as HTMLElement).style.transform);
  expect(stride).toContain("translateY");
});

test("the quiet is over the enemy's shoulder, the face acts, and the din goes out", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.15 }, "eye");
  const early = await strokes(page, "bone");
  const caster = page.locator('.cine-actor[data-role="caster"]');
  for (const part of ["eyes", "mouth", "brow"])
    expect(await caster.locator(`[data-part="${part}"]`).evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveAttribute("data-look", "silhouette");
  await hold(page, { shot: 3, at: 0.95 }, "eye");
  const late = await strokes(page, "bone");
  expect(late).toBeLessThan(early * 0.25);
  expect(await page.locator(".fx-din-clang-wrap, .fx-din-ring-wrap, .cine-accent").count()).toBe(0);
  // The stride was put back when the walk ended; here the figure only sinks under the weapon.
  expect(await caster.locator(".cine-look").evaluate((e) => (e as HTMLElement).style.transform)).not.toContain("translateY");
});

test("the blow is drawn, tunes the din and reveals the damage on the frame", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.3 }, "blow");
  await expect(page.locator('.cine-accent[data-screen="two-tone"]')).toBeAttached();
  await expect(page.locator(".fx-din-clang-wrap")).toBeAttached();
  expect(await strokes(page, "hot")).toBeGreaterThan(10);
  await expect(page.locator(".cine-text-impact")).toHaveText(/^\d+$/);
  await expect(page.locator('.cine-actor[data-role="targets"]')).toBeVisible();
});

test("the ring reaches the whole real party at once, and the board keeps what it did", async ({ page }) => {
  await hold(page, { party: 4, shot: 5, at: 0.6 }, "courage");
  await expect(visible(page, "allies")).toHaveCount(3);
  const lunged = await page
    .locator('.cine-actor[data-role="allies"] .cine-look')
    .evaluateAll((els) => els.map((e) => (e as HTMLElement).style.transform !== ""));
  expect(lunged.every(Boolean)).toBe(true);
  await expect(page.locator('.din-carry:not([style*="none"])')).toHaveCount(3);

  await hold(page, { party: 4, shot: 6, at: 0.6 }, "carried");
  await expect(page.locator('.din-board[data-mode="carry"]')).toHaveCount(3);
  await expect(page.locator('.din-board[data-mode="ring"]')).toHaveCount(1);
});

test("a boss is framed, the worn weapon strikes, FAST keeps the quiet and the blow, and a skip leaves nothing", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 4, at: 0.5 }, "blow");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "boss");
  const frame = (await cinematic(page).boundingBox())!;
  const boss = (await page.locator('.cine-actor[data-role="targets"] .cine-sprite').boundingBox())!;
  expect(boss.x + boss.width * 0.5).toBeLessThan(frame.x + frame.width);
  expect(boss.y + boss.height * 0.3).toBeGreaterThan(frame.y);

  await hold(page, { gear: "kit", shot: 4, at: 0.5 }, "blow");
  await expect(page.locator('.cine-actor[data-role="caster"] [data-equipment="blood-price"]').first()).toBeAttached();

  await page.addInitScript(() => {
    const w = window as unknown as { shots: string[] };
    w.shots = [];
    new MutationObserver(() => {
      const shot = document.querySelector(".ult-cinematic")?.getAttribute("data-shot");
      if (shot && w.shots.at(-1) !== shot) w.shots.push(shot);
    }).observe(document, { subtree: true, attributes: true, childList: true });
  });
  await page.goto(lab({ auto: 1, mode: "fast" }));
  await expect(cinematic(page)).toHaveAttribute("data-mode", "fast", { timeout: 30_000 });
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  const shots = await page.evaluate(() => (window as unknown as { shots: string[] }).shots);
  for (const shot of ["out-front", "eye", "blow", "courage"]) expect(shots).toContain(shot);

  await hold(page, { shot: 3, at: 0.5 }, "eye");
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .din-noise, .din-board").count()).toBe(0);
});
