import { test, expect, type Page } from "@playwright/test";

/**
 * Give and Take, the Bloodbound's Ultimate, in the Ultimate lab.
 *
 * What the film has to prove: the fist opens and the scarlet runs out along
 * the blade; the real enemy stands across the crossroads; the quiet has
 * nothing loud in it and a bead on the edge; the impact is a drawn frame
 * (two-tone, then held inverted) with the real target and the number on it;
 * the take is a face that acts while the enemy's garnet comes back up the
 * blade and the healing is revealed; and the real board keeps a run on the
 * enemy and one on the Reaver. Read from the film's attributes and the cast it
 * placed, never from pixels.
 */

test.describe.configure({ timeout: 120_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "reaver", evo: "rvr-bloodbound", party: 3, enemy: "hound", ...params } as never)}`;

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(lab({ auto: 1, pause: 1, ...params }));
  await page.locator(".stage").waitFor({ timeout: 60_000 });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 60_000 });
}

const cinematic = (page: Page) => page.locator(".ult-cinematic");
const caster = (page: Page) => page.locator('.cine-actor[data-role="caster"]');
const transformOf = (page: Page, part: string) =>
  caster(page).locator(`[data-part="${part}"]`).first().evaluate((el) => getComputedStyle(el).transform);
/** A part's x translation in its own units, from its transform. */
const shiftOf = (page: Page, part: string) =>
  caster(page)
    .locator(`[data-part="${part}"]`)
    .first()
    .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e);

test("the Bloodbound plays Give and Take on the real target and hands back to the round", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.7 }, "crossroads");
  await expect(cinematic(page)).toHaveAttribute("data-cinematic", "give-and-take");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "normal");
  await expect(page.locator('.cine-actor[data-role="targets"]:visible')).toHaveCount(1);
  await expect(page.locator(".cine-text-name")).toContainText("Give and Take");
  await page.getByRole("button", { name: "▶ Play" }).click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 40_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 60_000 });
  expect(await page.locator("[class*='cine-'], [class*='give-']").count()).toBe(0);
});

test("the oath: one front hand, a fist that opens on the blade, and the blood running out along it", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.1 }, "oath");
  const curled = await transformOf(page, "fingers");
  const runAt = await shiftOf(page, "runOut");
  // The drawing's own front arm is gone while the opened one plays: one hand, at the end of its arm.
  const hidden = (el: Element) => new DOMMatrix(getComputedStyle(el).transform).a < 0.05;
  expect(await caster(page).locator('[data-part="fist"]').first().evaluate(hidden)).toBe(true);
  await hold(page, { shot: 1, at: 0.9 }, "oath");
  expect(await transformOf(page, "fingers")).not.toBe(curled);
  expect(await caster(page).locator('[data-part="fist"]').first().evaluate(hidden)).toBe(true);
  expect(await transformOf(page, "palm")).not.toBe("none");
  // The run has moved out along the blade.
  expect(await shiftOf(page, "runOut")).toBeGreaterThan(runAt + 20);
  await expect(page.locator(".cine-text-voice")).toContainText("I bleed");
  // The other Reaver films' close-up parts are never painted in this one.
  expect(await transformOf(page, "entry")).toBe("matrix(1, 0, 0, 1, 0, 0)");
});

test("the quiet has nothing loud in it, and a bead on the edge over the real enemy", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.5 }, "under");
  expect(await page.locator(".cine-accent, .fx-give-notch-wrap, .cine-text-impact").count()).toBe(0);
  await expect(page.locator(".fx-give-bead-wrap")).toHaveCSS("visibility", "visible");
  await expect(page.locator('.cine-actor[data-role="targets"]:visible')).toHaveCount(1);
});

test("the impact is a drawn frame, both ways, with the real target, the number and the worn gear", async ({ page }) => {
  await hold(page, { gear: "kit", shot: 4, at: 0.095 }, "give");
  await expect(page.locator('.cine-accent[data-screen="two-tone"]')).toHaveCount(1);
  await expect(page.locator('.cine-accent[data-screen="invert"]')).toHaveCount(1);
  await expect(cinematic(page)).toHaveAttribute("data-two-tone", "");
  await expect(page.locator('.cine-actor[data-role="targets"]:visible')).toHaveCount(1);
  expect(await caster(page).locator("[data-equipment]").count()).toBeGreaterThan(0);

  // Just after the frame, in colour: the blow, the number, nothing in front of the target.
  await hold(page, { shot: 4, at: 0.25 }, "give");
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  const target = await page.locator('.cine-actor[data-role="targets"] .cine-sprite').boundingBox();
  const frame = await cinematic(page).boundingBox();
  expect(target!.x).toBeGreaterThan(frame!.x);
  expect(target!.x + target!.width).toBeLessThan(frame!.x + frame!.width);
  // The blade reaches into the enemy's body, and the Reaver's legs stay clear of it.
  const blade = await caster(page).locator('[data-base-weapon] path[fill^="url"]').first().boundingBox();
  const body = await page.locator('.cine-actor[data-role="targets"] [data-part="body"]').first().boundingBox();
  expect(blade!.x + blade!.width).toBeGreaterThan(body!.x);
  const legs = await caster(page).locator('[data-part="legs"]').boundingBox();
  expect(legs!.x + legs!.width).toBeLessThan(body!.x);
});

test("the take: a face that acts while the enemy's blood comes back up the blade", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.12 }, "take");
  await expect(page.locator('.cine-actor[data-role="targets"]:visible')).toHaveCount(0);
  const start = {
    brow: await transformOf(page, "brow"),
    eyes: await transformOf(page, "eyes"),
    mouth: await transformOf(page, "mouth"),
    back: await shiftOf(page, "runBack"),
  };
  await hold(page, { shot: 5, at: 0.95 }, "take");
  expect(await transformOf(page, "brow")).not.toBe(start.brow);
  expect(await transformOf(page, "eyes")).not.toBe(start.eyes);
  expect(await transformOf(page, "mouth")).not.toBe(start.mouth);
  // Back up the blade: its head has travelled from the point towards the grip.
  expect(await shiftOf(page, "runBack")).toBeLessThan(start.back - 15);
  // The brow shelf is lifted and lowered, never tilted past 5°.
  const tilt = await caster(page)
    .locator('[data-part="brow"]')
    .evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return Math.abs((Math.atan2(m.b, m.a) * 180) / Math.PI);
    });
  expect(tilt).toBeLessThanOrEqual(5);
});

test("on the board a run stays on the enemy and one on the Reaver, and skipping leaves nothing", async ({ page }) => {
  await hold(page, { shot: 6, at: 0.6 }, "square");
  await expect(page.locator('.give-board[data-mode="open"]')).toHaveCount(1);
  await expect(page.locator('.give-board[data-mode="home"]')).toHaveCount(1);
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 3000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .give-board").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("a boss is framed as a boss", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 4, at: 0.3 }, "give");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "boss");
  const box = await page.locator('.cine-actor[data-role="targets"] .cine-sprite').first().boundingBox();
  const frame = await cinematic(page).boundingBox();
  expect(box!.y).toBeGreaterThan(frame!.y - box!.height * 0.1);
  const reaver = await caster(page).locator(".cine-sprite").boundingBox();
  expect(reaver!.x).toBeGreaterThan(frame!.x);
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 3000 });
});

test("FAST keeps the oath, the quiet, the impact and the take", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { shots: string[] };
    w.shots = [];
    new MutationObserver(() => {
      const shot = document.querySelector(".ult-cinematic")?.getAttribute("data-shot");
      if (shot && w.shots.at(-1) !== shot) w.shots.push(shot);
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-shot", "data-mode"] });
  });
  await page.goto(lab({ auto: 1, mode: "fast" }));
  await expect(cinematic(page)).toHaveAttribute("data-mode", "fast", { timeout: 60_000 });
  await expect(cinematic(page)).toHaveCount(0, { timeout: 40_000 });
  const shots = await page.evaluate(() => (window as unknown as { shots: string[] }).shots);
  for (const shot of ["oath", "crossroads", "under", "give", "take", "square"]) expect(shots).toContain(shot);
});
