import { test, expect, type Page } from "@playwright/test";

/**
 * Compound Interest, the Broker · Usurer's Ultimate, in the Ultimate lab.
 *
 * What the film has to prove: that it is the Usurer's and not Foreclosure's,
 * that the real target is in it at its real footprint and buried under the
 * crust on the drawn frame itself, that the quiet is a face acting and then a
 * coin alone, that a boss is framed and not shrunk, that the return shows the
 * debt still running on the real board and the pact paid, and that it hands
 * back clean. Read from the film's attributes, the cast it placed and the
 * paths its effects drew, never from pixels.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "broker", evo: "brk-usurer", ...params } as never)}`;

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(lab({ auto: 1, pause: 1, ...params }));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

const film = (page: Page) => page.locator(".ult-cinematic");
const target = (page: Page) => page.locator('.cine-actor[data-role="targets"]:visible');
/** How many coins a coin path draws: one closed ellipse each. */
const coins = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => ((el.getAttribute("d") ?? "").match(/Z/g) ?? []).length);

test("the Usurer plays Compound Interest against the real target, and hands back to the round", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.6 }, "sink");
  await expect(film(page)).toHaveAttribute("data-cinematic", "compound-interest");
  await expect(target(page)).toHaveCount(1);
  await expect(target(page).locator("[data-hero], [data-enemy], svg").first()).toBeAttached();
  // The sink answers the coin: the crust of the walls lit band by band.
  await expect(page.locator(".usury-stir")).toBeAttached();
  await page.getByRole("button", { name: "▶ Play" }).click();
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  expect(await page.locator("[class*='cine-'], [class*='usury-']").count()).toBe(0);
});

test("the bite is a face acting with the coin at the mouth, and the figure itself holds still", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.44 }, "bite");
  const caster = page.locator('.cine-actor[data-role="caster"]');
  await expect(caster).toBeVisible();
  for (const part of ["eyes", "mouth", "brow"]) {
    const transform = await caster.locator(`[data-part="${part}"]`).evaluate((el) => getComputedStyle(el).transform);
    expect(transform, part).not.toBe("none");
    expect(transform, part).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
  }
  // Root off: only the parts move.
  expect(await caster.locator(".cine-rig").evaluate((el) => (el as HTMLElement).style.transform)).toBe("");
  expect(await coins(page, ".fx-usury-coin-wrap .usury-coin-body")).toBe(1);
  // No enemy in the identity shot.
  await expect(target(page)).toHaveCount(0);
});

test("the quiet is one coin alone, still, and then more than one", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.2 }, "interest");
  expect(await coins(page, ".fx-usury-brood-wrap .usury-coin-body")).toBe(1);
  expect(await page.locator(".cine-accent, .fx-usury-spill-wrap, .fx-usury-rush-wrap").count()).toBe(0);
  await expect(target(page)).toHaveCount(1);
  await hold(page, { shot: 4, at: 0.95 }, "interest");
  expect(await coins(page, ".fx-usury-brood-wrap .usury-coin-body")).toBeGreaterThan(1);
});

test("called in: the crust stands full over the target on the drawn frame, the kit is worn, and the result is on the board", async ({
  page,
}) => {
  // Inside the hit-stop, just after the two-tone frame.
  await hold(page, { gear: "kit", shot: 5, at: 0.15 }, "called-in");
  await expect(target(page)).toHaveCount(1);
  // Nine doublings: hundreds of coins on the frame the stop holds.
  expect(await coins(page, ".fx-usury-brood-wrap .usury-coin-body")).toBeGreaterThan(300);
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  // The Broker wears what it wears.
  await expect(page.locator('.cine-actor[data-role="caster"] [data-equipment="blood-price"]').first()).toBeAttached();

  await hold(page, { shot: 6, at: 0.7 }, "paid");
  await expect(page.locator(".cine-text-voice")).toContainText("paid");
  // The debt still running on the real target, and the pact's cut on every real hero.
  await expect(page.locator(".fx-usury-brood-wrap[data-anchor]")).toHaveCount(1);
  expect(await coins(page, ".fx-usury-brood-wrap[data-anchor] .usury-coin-body")).toBeGreaterThan(4);
  const party = await page.locator('.stage .combatant[data-side="hero"]:not([data-down])').count();
  await expect(page.locator(".fx-usury-dividend-wrap")).toHaveCount(party);
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("a boss is framed, not shrunk, and buried all the same", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 5, at: 0.4 }, "called-in");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  await expect(target(page)).toHaveCount(1);
  const box = await target(page).boundingBox();
  const frame = await film(page).boundingBox();
  expect(box!.height).toBeGreaterThan(frame!.height * 0.45);
  expect(box!.y + box!.height).toBeLessThanOrEqual(frame!.y + frame!.height + 2);
  expect(await coins(page, ".fx-usury-brood-wrap .usury-coin-body")).toBeGreaterThan(300);
});

test("skipping from the quiet settles at once and leaves nothing behind", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.5 }, "interest");
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .usury-sink").count()).toBe(0);
});

test("FAST keeps every shot, the bite, the quiet and the impact", async ({ page }) => {
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
  expect(shots).toEqual(["call", "bite", "sink", "loan", "interest", "called-in", "paid"]);
});

test("reduced motion plays still cards with no flash", async ({ page }) => {
  await page.goto(lab({ auto: 1, motion: 0 }));
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .usury-brood").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
