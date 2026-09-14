import { test, expect, type Page } from "@playwright/test";

/**
 * A Good Hiding, the Ironhide's Ultimate, in the Ultimate lab.
 *
 * What the film has to prove: the Ironhide beats its chest and opens up; the
 * real enemy throws its blow at it; the close-up takes that blow with a face
 * that acts (brow, eyes, mouth) while the dent closes into the chest and the
 * Barrier is revealed; the quiet has nothing loud in it; the impact is a drawn
 * frame with the real target and the number on it; and the real board keeps
 * the iron on the Ironhide and the slack dent on the enemy. Read from the
 * film's attributes and the cast it placed, never from pixels.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "reaver", evo: "rvr-ironhide", party: 3, enemy: "hound", ...params } as never)}`;

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(lab({ auto: 1, pause: 1, ...params }));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

const cinematic = (page: Page) => page.locator(".ult-cinematic");
const caster = (page: Page) => page.locator('.cine-actor[data-role="caster"]');
const transformOf = (page: Page, part: string) =>
  caster(page).locator(`[data-part="${part}"]`).first().evaluate((el) => getComputedStyle(el).transform);

test("the Ironhide plays A Good Hiding on the real target and hands back to the round", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.7 }, "swing");
  await expect(cinematic(page)).toHaveAttribute("data-cinematic", "good-hiding");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "normal");
  // The real enemy, in the foreground, throwing its blow; the title on it.
  await expect(page.locator('.cine-actor[data-role="targets"]:visible')).toHaveCount(1);
  await expect(page.locator(".cine-text-name")).toContainText("A Good Hiding");
  await page.getByRole("button", { name: "▶ Play" }).click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  expect(await page.locator("[class*='cine-'], [class*='hiding-']").count()).toBe(0);
});

test("the dare: a blow of the fist on the chest, dust off the hide, and the arms opened", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.27 }, "dare");
  const onChest = await transformOf(page, "fist");
  await expect(page.locator(".fx-hiding-dust-wrap")).toHaveCSS("visibility", "visible");
  await hold(page, { shot: 1, at: 0.8 }, "dare");
  expect(await transformOf(page, "fist")).not.toBe(onChest);
  await expect(page.locator(".cine-text-voice")).toContainText("Hit me");
  // Red Ledger's close-up parts are never painted in this film.
  expect(await transformOf(page, "entry")).toBe("matrix(1, 0, 0, 1, 0, 0)");
});

test("the blow is taken on a face that acts, the dent closes into the chest, and the Barrier is shown", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.1 }, "take");
  await expect(page.locator('.cine-actor[data-role="targets"]:visible')).toHaveCount(0);
  const hit = { brow: await transformOf(page, "brow"), eyes: await transformOf(page, "eyes"), mouth: await transformOf(page, "mouth") };
  for (const part of Object.values(hit)) expect(part).not.toBe("none");
  await expect(page.locator(".fx-hiding-dent-wrap")).toHaveCSS("visibility", "visible");
  // The brow shelf is lowered on the blow, not tilted past 5°.
  const tilt = await caster(page)
    .locator('[data-part="brow"]')
    .evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return Math.abs((Math.atan2(m.b, m.a) * 180) / Math.PI);
    });
  expect(tilt).toBeLessThanOrEqual(5);
  await hold(page, { shot: 3, at: 0.95 }, "take");
  expect(await transformOf(page, "brow")).not.toBe(hit.brow);
  expect(await transformOf(page, "mouth")).not.toBe(hit.mouth);
  await expect(page.locator(".hiding-set")).toBeAttached();
});

test("the quiet has nothing loud in it, and the impact is a drawn frame with the real target and the number", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.5 }, "hang");
  expect(await page.locator(".cine-accent, .fx-hiding-dent-wrap, .fx-hiding-dust-wrap").count()).toBe(0);
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveAttribute("data-look", "silhouette");

  await hold(page, { gear: "kit", shot: 5, at: 0.045 }, "hiding");
  await expect(page.locator('.cine-accent[data-screen="two-tone"]')).toHaveCount(1);
  await expect(cinematic(page)).toHaveAttribute("data-two-tone", "");
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  await expect(page.locator('.cine-actor[data-role="targets"]:visible')).toHaveCount(1);
  // Worn gear is in the film.
  expect(await caster(page).locator("[data-equipment]").count()).toBeGreaterThan(0);

  // Just after the frame, in colour: the blade at the enemy, and nothing in front of it.
  await hold(page, { shot: 5, at: 0.2 }, "hiding");
  const target = await page.locator('.cine-actor[data-role="targets"] .cine-sprite').boundingBox();
  const frame = await cinematic(page).boundingBox();
  expect(target!.x).toBeGreaterThan(frame!.x);
  expect(target!.x + target!.width).toBeLessThan(frame!.x + frame!.width);
  await expect(page.locator(".cine-text-impact")).toBeVisible();
});

test("on the board the iron stays on the Ironhide and the dent on the enemy, and skipping leaves nothing", async ({ page }) => {
  await hold(page, { shot: 6, at: 0.6 }, "kept");
  await expect(page.locator('.hiding-board[data-mode="kept"]')).toHaveCount(1);
  await expect(page.locator('.hiding-board[data-mode="spent"]')).toHaveCount(1);
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .hiding-board").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("a boss is framed as a boss", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 5, at: 0.3 }, "hiding");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "boss");
  const box = await page.locator('.cine-actor[data-role="targets"] .cine-sprite').first().boundingBox();
  const frame = await cinematic(page).boundingBox();
  expect(box!.y).toBeGreaterThan(frame!.y - box!.height * 0.1);
  const reaver = await caster(page).locator(".cine-sprite").boundingBox();
  expect(reaver!.x).toBeGreaterThan(frame!.x);
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 2000 });
});

test("FAST keeps the dare, the blow taken, the quiet and the impact", async ({ page }) => {
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
  for (const shot of ["dare", "take", "hang", "hiding", "kept"]) expect(shots).toContain(shot);
});
