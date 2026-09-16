import { test, expect, type Page } from "@playwright/test";

/**
 * Hammer Price, the Broker · Magnate's Ultimate, in the Ultimate lab.
 *
 * What the film has to prove: that it is the Magnate's and not Foreclosure's
 * (a sale hammer in the fist, no balance), that the nod is a face acting, that
 * the room is outbid — paddles going out — while the real target stands on the
 * block, that the quiet is one paddle and nothing else, that the hammer is on
 * the real target on the drawn frame with the knock and the split block, that
 * a boss is framed and not shrunk, that the return shows the room outbid on
 * the real board, and that it hands back clean. Read from the film's
 * attributes, the cast it placed and the paths its effects drew, never from
 * pixels.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "broker", evo: "brk-magnate", ...params } as never)}`;

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(lab({ auto: 1, pause: 1, ...params }));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

const film = (page: Page) => page.locator(".ult-cinematic");
const caster = (page: Page) => page.locator('.cine-actor[data-role="caster"]');
const target = (page: Page) => page.locator('.cine-actor[data-role="targets"]:visible');
/** How many ellipses a paddle path draws: one closed sub-path each. */
const paddlesUp = (page: Page) =>
  page
    .locator(".hammer-paddles .hammer-paddle")
    .evaluateAll((els) => els.reduce((n, el) => n + ((el.getAttribute("d") ?? "").match(/Z/g) ?? []).length, 0));
/** Where a part of the caster sits on screen. */
const box = (page: Page, part: string) => caster(page).locator(`[data-part="${part}"]`).boundingBox();

test("the Magnate plays Hammer Price against the real target, and hands back to the round", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.5 }, "room");
  await expect(film(page)).toHaveAttribute("data-cinematic", "hammer-price");
  await expect(target(page)).toHaveCount(1);
  await expect(page.locator(".fx-hammer-block-wrap")).toHaveCount(1);
  await page.getByRole("button", { name: "▶ Play" }).click();
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  expect(await page.locator("[class*='cine-'], [class*='hammer-']").count()).toBe(0);
});

test("the nod is a face acting beside a sale hammer, with the balance gone and the figure held still", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.5 }, "nod");
  await expect(caster(page)).toBeVisible();
  for (const part of ["eyes", "mouth", "brow"]) {
    const transform = await caster(page).locator(`[data-part="${part}"]`).evaluate((el) => getComputedStyle(el).transform);
    expect(transform, part).not.toBe("none");
    expect(transform, part).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
  }
  // Root off: only the parts move.
  expect(await caster(page).locator(".cine-rig").evaluate((el) => (el as HTMLElement).style.transform)).toBe("");
  // The hammer is home in the fist, on screen; the balance is scaled away.
  const head = await box(page, "mallet");
  const frame = await film(page).boundingBox();
  expect(head).not.toBeNull();
  expect(head!.x + head!.width / 2).toBeLessThan(frame!.x + frame!.width);
  expect(head!.x + head!.width / 2).toBeGreaterThan(frame!.x);
  const balance = await box(page, "balance");
  expect(balance === null || balance.width < 4).toBe(true);
  await expect(target(page)).toHaveCount(0);
});

test("the room is outbid: paddles go out while the hammer's head swells", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.05 }, "room");
  const before = await paddlesUp(page);
  const small = (await box(page, "mallet"))!;
  await hold(page, { shot: 2, at: 0.95 }, "room");
  const after = await paddlesUp(page);
  const big = (await box(page, "mallet"))!;
  expect(before).toBeGreaterThan(150);
  expect(after).toBeLessThan(before * 0.2);
  expect(big.width * big.height).toBeGreaterThan(small.width * small.height * 1.8);
});

test("the quiet is one paddle in the dark, and nobody in the cast", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.3 }, "last");
  await expect(page.locator(".fx-hammer-last-wrap")).toHaveCount(1);
  await expect(page.locator(".cine-actor:visible")).toHaveCount(0);
  expect(await page.locator(".cine-accent, .fx-hammer-knock-wrap, .fx-hammer-paddles-wrap").count()).toBe(0);
});

test("gone: the hammer is on the real target on the held frame, the knock drawn, the block split and the kit worn", async ({
  page,
}) => {
  // Inside the hit-stop, just after the two-tone frame.
  await hold(page, { gear: "kit", shot: 5, at: 0.27 }, "gone");
  await expect(target(page)).toHaveCount(1);
  const head = (await box(page, "mallet"))!;
  const lot = (await target(page).boundingBox())!;
  // The head overlaps the target's drawing: the blow lands, it does not stop short.
  expect(head.x + head.width).toBeGreaterThan(lot.x);
  expect(head.x).toBeLessThan(lot.x + lot.width);
  expect(head.y + head.height).toBeGreaterThan(lot.y);
  await expect(page.locator(".fx-hammer-knock-wrap")).toHaveCount(2);
  expect(await page.locator(".hammer-knock.front .hammer-knock-grain.thick").getAttribute("d")).toMatch(/L/);
  expect(await page.locator(".hammer-block .hammer-block-split").getAttribute("d")).toMatch(/L/);
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  // The Broker wears what it wears.
  await expect(caster(page).locator('[data-equipment="blood-price"]').first()).toBeAttached();

  await hold(page, { shot: 6, at: 0.4 }, "knocked-down");
  await expect(page.locator(".cine-text-voice")).toContainText("paddles down");
  await expect(page.locator(".fx-hammer-block-wrap[data-anchor]")).toHaveCount(1);
  // Every other real enemy standing is outbid on the board.
  const others = await page.locator('.stage .combatant[data-side="enemy"]:not([data-down])').count();
  await expect(page.locator(".hammer-outbid-one")).toHaveCount(others - 1);
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("a boss is framed, not shrunk, and still takes the hammer", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 5, at: 0.4 }, "gone");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  await expect(target(page)).toHaveCount(1);
  const lot = (await target(page).boundingBox())!;
  const frame = (await film(page).boundingBox())!;
  expect(lot.height).toBeGreaterThan(frame.height * 0.45);
  const head = (await box(page, "mallet"))!;
  expect(head.x + head.width).toBeGreaterThan(lot.x);
});

test("skipping from the quiet settles at once and leaves nothing behind", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.5 }, "last");
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .hammer-saleroom").count()).toBe(0);
});

test("FAST keeps every shot: the nod, the quiet and the impact", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { shots: string[] };
    w.shots = [];
    new MutationObserver(() => {
      const shot = document.querySelector(".ult-cinematic")?.getAttribute("data-shot");
      if (shot && w.shots.at(-1) !== shot) w.shots.push(shot);
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-shot", "data-mode"] });
  });
  await page.goto(lab({ auto: 1, mode: "fast" }));
  // The lab builds the fight and resolves the round before the film mounts; on a loaded machine that alone can pass 30s.
  await expect(film(page)).toHaveAttribute("data-mode", "fast", { timeout: 60_000 });
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const shots = await page.evaluate(() => (window as unknown as { shots: string[] }).shots);
  expect(shots).toEqual(["call", "nod", "room", "hoist", "last", "gone", "knocked-down"]);
});

test("reduced motion plays still cards with no flash", async ({ page }) => {
  await page.goto(lab({ auto: 1, motion: 0 }));
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .hammer-knock, .hammer-paddles").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
