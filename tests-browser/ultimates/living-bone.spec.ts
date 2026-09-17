import { test, expect, type Page } from "@playwright/test";

/** The Lifebinder's Living Bone, through the Ultimate lab. */

test.describe.configure({ timeout: 90_000 });

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(
    `/dev/ultimates.html?${new URLSearchParams({ hero: "warden", evo: "war-lifebinder", party: 3, auto: 1, pause: 1, ...params } as never)}`,
  );
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

const caster = (page: Page) => page.locator('.cine-actor[data-role="caster"]');
const variable = (page: Page, name: string) =>
  caster(page).evaluate((el, n) => Number(getComputedStyle(el).getPropertyValue(n) || 0), name);

test("it is the Lifebinder's own film, aimed at an ally: no enemy in the cast, the real party across the clearing", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 2, at: 0.6 }, "ground");
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-cinematic", "living-bone");
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveCount(0);
  await expect(page.locator('.cine-actor[data-role="allies"]')).toHaveCount(2);
  await expect(page.locator(".lb-shedding")).toBeAttached();
  await expect(page.locator(".lb-ground")).toBeAttached();
  // The fist is closed on the crown, and the crown is whole.
  expect(await variable(page, "--wdn-grasp")).toBeGreaterThan(0.95);
  expect(await variable(page, "--wdn-tine")).toBe(0);
});

test("the hand closes on the tine in the crown close-up, and the quiet close-up acts with the face", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 1, at: 0.2 }, "crown");
  expect(await variable(page, "--wdn-grasp")).toBeLessThan(0.05);
  await hold(page, { enemy: "hound", shot: 1, at: 0.8 }, "crown");
  expect(await variable(page, "--wdn-grasp")).toBeGreaterThan(0.95);
  await hold(page, { enemy: "hound", shot: 3, at: 0.6 }, "brace");
  const brow = await caster(page).locator('[data-part="brow"]').evaluate((el) => getComputedStyle(el).transform);
  const mouth = await caster(page).locator('[data-part="mouth"]').evaluate((el) => getComputedStyle(el).transform);
  expect(brow).not.toBe("none");
  expect(mouth).not.toBe("none");
  // Nothing loud in the quiet: the crown is still whole, no accent, no splinters.
  expect(await variable(page, "--wdn-tine")).toBe(0);
  expect(await page.locator('.cine-accent[data-screen="two-tone"]').count()).toBe(0);
});

test("the snap is drawn: the tine leaves the crown, the bead shows, and the tine is in the fist", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 4, at: 0.3 }, "snap");
  await expect(page.locator('.cine-accent[data-screen="two-tone"]')).toBeAttached();
  expect(await variable(page, "--wdn-tine")).toBe(1);
  expect(await variable(page, "--wdn-bead")).toBeGreaterThan(0.9);
  await expect(caster(page).locator(".ph-wdn-stump")).toBeAttached();
  const held = caster(page).locator('[data-part="hand"] .lb-hand');
  await expect(held).toHaveCSS("opacity", "1");
  // On the board, the Warden has paid: its bar is below full.
  const bar = await page.locator('.stage .combatant[data-rig="warden"] .combatant-bar').getAttribute("title");
  const [hp, max] = (bar ?? "0 / 1").split("/").map((x) => Number(x.trim().replace(/\D.*$/, "")));
  expect(hp).toBeLessThan(max);
});

test("the graft finds the bound ally, lights it, buds on it, and quotes the reveal's numbers", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 5, at: 0.9 }, "graft");
  await expect(page.locator('.cine-actor[data-role="allies"][data-bone-bound]')).toHaveCount(1);
  const film = page.locator(".ult-cinematic");
  const bound = await film.getAttribute("data-bone-bound");
  expect(bound).toBeTruthy();
  await expect(page.locator(".lb-chip .lb-chip-word")).toHaveText("Bound");
  await expect(page.locator(".lb-chip .lb-chip-nums")).toContainText("⬡12");
  await expect(page.locator(".lb-thread-svg")).toHaveCSS("opacity", "1");
  // The fist has opened and the tine is no longer in it.
  expect(await variable(page, "--wdn-grasp")).toBeLessThan(0.05);
  await expect(caster(page).locator('[data-part="hand"] .lb-hand')).toHaveCSS("opacity", "0");
});

test("a downed ally is the one it binds: it is found at the call, comes up as the tine takes, and stands on the board", async ({ page }) => {
  await hold(page, { enemy: "hound", party: 2, downed: 1, shot: 5, at: 0.3 }, "graft");
  const film = page.locator(".ult-cinematic");
  const downed = await film.getAttribute("data-bone-downed");
  expect(downed).toBeTruthy();
  await expect(film).toHaveAttribute("data-bone-bound", downed!);
  // Before the press: on its knees.
  const before = await page.locator('.cine-actor[data-bone-bound] .cine-look').evaluate((el) => el.style.transform);
  expect(before).toContain("rotate(-16");
  await hold(page, { enemy: "hound", party: 2, downed: 1, shot: 5, at: 0.95 }, "graft");
  const after = await page.locator('.cine-actor[data-bone-bound] .cine-look').evaluate((el) => el.style.transform);
  expect(after).not.toContain("rotate(-16");
  await expect(page.locator(".lb-chip .lb-chip-word")).toHaveText("Revived");
  await expect(page.locator(`.stage .combatant[data-unit="${downed}"]`)).not.toHaveAttribute("data-down", "");
});

test("the return marks the bound ally on the real board, a boss changes nothing, FAST keeps the quiet and the snap, and skipping leaves nothing", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 6, at: 0.6 }, "taken");
  const graft = page.locator(".lb-board-graft");
  await expect(graft).toHaveCSS("opacity", "1");
  const bound = await page.locator(".ult-cinematic").getAttribute("data-bone-bound");
  const ally = (await page.locator(`.stage .combatant[data-unit="${bound}"] .combatant-body`).boundingBox())!;
  const mark = (await graft.boundingBox())!;
  expect(mark.x + mark.width / 2).toBeGreaterThan(ally.x);
  expect(mark.x + mark.width / 2).toBeLessThan(ally.x + ally.width);
  expect(mark.y + mark.height / 2).toBeGreaterThan(ally.y);
  expect(mark.y + mark.height / 2).toBeLessThan(ally.y + ally.height);
  // An ally-aimed Ultimate frames normal whatever the enemy is.
  await hold(page, { enemy: "collector", shot: 4, at: 0.3 }, "snap");
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-framing", "normal");
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveCount(0);
  await hold(page, { enemy: "hound", mode: "fast", shot: 2, at: 0.5 }, "brace");
  await hold(page, { enemy: "hound", mode: "fast", shot: 3, at: 0.3 }, "snap");
  await page.locator(".cine-skip").click();
  await expect(page.locator(".ult-cinematic")).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .lb-board, .lb-thread").count()).toBe(0);
  expect(await page.locator(".stage .lb-hand, .stage .lb-chips").count()).toBe(0);
});
