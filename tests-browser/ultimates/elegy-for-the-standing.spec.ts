import { test, expect, type Page } from "@playwright/test";

/**
 * Elegy for the Standing, the Herald · Dirgesinger's Ultimate, in the lab.
 *
 * What it has to prove: that the Dirgesinger plays its own film and not the
 * Anthem or the Din; that the Ultimate does what it says (the target mourned
 * — Vulnerable and Weak — and the party's griefs buried); that the real party
 * and the real target are in it; that the shadow is the target's own figure,
 * laid down; that the face acts; that the quiet is quiet and the burial is
 * drawn; and that it frames a boss, wears its gear, keeps its shape in FAST
 * and hands back clean. Read from the film's attributes, its cast, its
 * drawings and the battle log, never from pixels.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "herald", evo: "hrl-dirgesinger", party: 3, ...params } as never)}`;

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(lab({ auto: 1, pause: 1, ...params }));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

const cinematic = (page: Page) => page.locator(".ult-cinematic");
const visible = (page: Page, role: string) => page.locator(`.cine-actor[data-role="${role}"]:visible`);
const angle = (t: string) => Number(/rotate\((-?[\d.]+)deg\)/.exec(t)?.[1] ?? NaN);

test("the Dirgesinger plays Elegy for the Standing, and hands back to the round with nothing left", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.4 }, "mourned");
  await expect(cinematic(page)).toHaveAttribute("data-cinematic", "elegy-for-the-standing");
  await page.getByRole("button", { name: "▶ Play" }).click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  expect(await page.locator("[class*='cine-'], [class*='elegy-']").count()).toBe(0);
});

test("the target is mourned ahead of time and the party's griefs are buried with it", async ({ page }) => {
  await page.goto(lab({ auto: 1, party: 4, mode: "fast" }));
  await expect(cinematic(page)).toHaveAttribute("data-cinematic", "elegy-for-the-standing", { timeout: 30_000 });
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  await page.getByRole("button", { name: "Battle history" }).click();
  await expect(page.locator(".history-drawer li").first()).toBeAttached();
  const lines = await page.locator(".history-drawer li").allTextContents();
  const vulnerable = lines.findIndex((l) => /: Vulnerable \+1$/.test(l));
  const blow = lines.findIndex((l) => /damage/.test(l));
  // Mourned first, so the first note lands on the open grave; then Weak.
  expect(vulnerable).toBeGreaterThanOrEqual(0);
  expect(vulnerable).toBeLessThan(blow);
  expect(lines.some((l) => /: Weak \+1$/.test(l))).toBe(true);
  // Nothing is given to the party to swing with.
  expect(lines.some((l) => /Empowered/.test(l))).toBe(false);
  await page.keyboard.press("Escape");
  // The readout sums a unit's statuses as the first and a count: Vulnerable, and one more (Weak).
  const readout = page.locator('.combatant[data-side="enemy"] .status-readout').filter({ hasText: "Vulnerable" });
  await expect(readout).toHaveCount(1);
  await expect(readout).toContainText("+1");
});

test("the close-up acts with the face, and a leaf of the laurel falls", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.7 }, "sung");
  const caster = page.locator('.cine-actor[data-role="caster"]');
  for (const part of ["eyes", "mouth", "brow"])
    expect(await caster.locator(`[data-part="${part}"]`).evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");
  // The eyes are shut for the song, and the mouth is open on it.
  const eyes = await caster.locator('[data-part="eyes"]').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).d);
  expect(eyes).toBeLessThan(0.3);
  await expect(caster).toHaveAttribute("data-root", "0");
  // An effect's wrapper has no size of its own: shown means not hidden.
  await expect(page.locator(".fx-elegy-leaf-wrap")).not.toHaveCSS("visibility", "hidden");
  const before = await page.locator(".elegy-leaf").evaluate((e) => (e as HTMLElement).style.transform);
  await hold(page, { shot: 1, at: 0.95 }, "sung");
  const after = await page.locator(".elegy-leaf").evaluate((e) => (e as HTMLElement).style.transform);
  expect(after).not.toBe(before);
});

test("at the graveside the real party mourns the real target, and its shadow is its own figure, laid down", async ({ page }) => {
  await hold(page, { party: 4, shot: 2, at: 0.1 }, "graveside");
  await expect(visible(page, "allies")).toHaveCount(3);
  await expect(visible(page, "targets")).toHaveCount(1);
  await expect(visible(page, "caster")).toHaveCount(1);
  // The shadow is a copy of the target's drawing, black, and not in the cast.
  const shade = page.locator(".elegy-shade");
  await expect(shade).toHaveCount(1);
  expect(await shade.locator("svg").count()).toBeGreaterThan(0);
  expect(await shade.locator("[data-part], [data-role], .cine-actor").count()).toBe(0);
  const fill = await shade.locator(".elegy-shade-art:not(.elegy-shade-halo) svg path").first().evaluate((el) => getComputedStyle(el).fill);
  expect(fill).toBe("rgb(13, 11, 18)");
  const early = angle(await shade.evaluate((e) => (e as HTMLElement).style.transform));
  await hold(page, { party: 4, shot: 2, at: 0.95 }, "graveside");
  const late = angle(await page.locator(".elegy-shade").evaluate((e) => (e as HTMLElement).style.transform));
  // Standing behind it at the start; laid full length by the end.
  expect(Math.abs(early)).toBeLessThan(35);
  expect(late).toBeLessThan(-85);
});

test("the quiet is the grave from its head, still, with the enemy tiny at its feet", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.5 }, "laid-out");
  await expect(visible(page, "targets")).toHaveCount(1);
  await expect(visible(page, "caster")).toHaveCount(0);
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveAttribute("data-look", "silhouette");
  await expect(page.locator(".elegy-shade")).toHaveCount(1);
  await expect(page.locator(".elegy-shadow-leaf")).toBeAttached();
  expect(await page.locator(".fx-elegy-clods-wrap, .cine-accent").count()).toBe(0);
  const target = page.locator('.cine-actor[data-role="targets"] .cine-sprite');
  const frame = (await cinematic(page).boundingBox())!;
  const box = (await target.boundingBox())!;
  expect(box.height).toBeLessThan(frame.height * 0.3);
});

test("the burial is drawn: the negative, the banner driven in, the earth thrown, the damage on the frame", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.02 }, "buried");
  await expect(cinematic(page)).toHaveAttribute("data-elegy-negative", "");
  await hold(page, { shot: 4, at: 0.105 }, "buried");
  expect(await cinematic(page).getAttribute("data-elegy-negative")).toBeNull();
  await expect(page.locator(".fx-elegy-clods-wrap")).not.toHaveCSS("visibility", "hidden");
  expect(await page.locator(".elegy-clod").count()).toBeGreaterThan(60);
  await expect(page.locator(".cine-text-impact")).toHaveText(/^\d+$/);
  await expect(page.locator('.cine-actor[data-role="targets"]')).toBeVisible();
  // The banner is driven point first into the ground.
  const banner = page.locator('.cine-actor[data-role="caster"] [data-part="banner"]');
  expect(angle(await banner.evaluate((e) => (e as HTMLElement).style.transform))).toBeGreaterThan(150);
  // And the grave is filled by the end, the shadow gone under it.
  await hold(page, { shot: 4, at: 0.9 }, "buried");
  const mound = await page.locator(".elegy-grave-mound").evaluate((e) => Number((e as SVGElement).style.opacity));
  expect(mound).toBe(1);
  const shade = await page.locator(".elegy-shade").evaluate((e) => Number((e as HTMLElement).style.opacity));
  expect(shade).toBeLessThan(0.05);
});

test("the board keeps the grave under the target and lays a leaf on every one of the party", async ({ page }) => {
  await hold(page, { party: 4, shot: 5, at: 0.8 }, "mourned");
  await expect(page.locator('.elegy-board[data-mode="grave"]')).toHaveCount(1);
  await expect(page.locator('.elegy-board[data-mode="grave"] .elegy-board-art')).toHaveCount(1);
  await expect(page.locator('.elegy-board[data-mode="laurel"]')).toHaveCount(4);
  await hold(page, { shot: 0, at: 0.8 }, "call");
  await expect(page.locator('.elegy-board[data-mode="rise"] .elegy-board-art')).toHaveCount(1);
});

test("a boss is framed whole, the worn weapon is driven in, FAST keeps the quiet and the burial, and a skip leaves nothing", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 4, at: 0.4 }, "buried");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "boss");
  const frame = (await cinematic(page).boundingBox())!;
  const boss = (await page.locator('.cine-actor[data-role="targets"] .cine-sprite').boundingBox())!;
  expect(boss.x + boss.width).toBeLessThan(frame.x + frame.width + 4);
  expect(boss.y).toBeGreaterThan(frame.y);
  await hold(page, { enemy: "collector", shot: 2, at: 0.95 }, "graveside");
  await expect(page.locator(".elegy-shade")).toHaveCount(1);

  await hold(page, { gear: "kit", shot: 4, at: 0.5 }, "buried");
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
  await expect(cinematic(page)).toHaveAttribute("data-mode", "fast", { timeout: 30_000 });
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  const shots = await page.evaluate(() => (window as unknown as { shots: string[] }).shots);
  for (const shot of ["sung", "graveside", "laid-out", "buried"]) expect(shots).toContain(shot);

  await hold(page, { shot: 3, at: 0.5 }, "laid-out");
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .elegy-shade, .elegy-board, [data-elegy-negative]").count()).toBe(0);
});
