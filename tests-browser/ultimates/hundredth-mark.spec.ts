import { test, expect, type Page } from "@playwright/test";

/** The Ranger's Hundredth Mark, through the Ultimate lab. */

test.describe.configure({ timeout: 90_000 });

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(`/dev/ultimates.html?${new URLSearchParams({ hero: "ranger", party: 3, auto: 1, pause: 1, ...params } as never)}`);
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

test("the whole real enemy line is drawn and signed, the target last", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 2, at: 0.85 }, "sight");
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-cinematic", "hundredth-mark");
  // The target is the cast's own figure; the rest of the line is copied off the board.
  const living = await page.locator('.stage .combatant[data-side="enemy"]').count();
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveCount(1);
  await expect(page.locator(".hm-clone")).toHaveCount(living - 1);
  // A sign on every one of them, and a hundred lines.
  await expect(page.locator(".hm-slot:not([style*='none'])")).toHaveCount(living);
  expect(await page.locator(".hm-ray").count()).toBeGreaterThanOrEqual(100);
});

test("the close-up acts with a face, and the flight is quiet", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 3, at: 0.9 }, "choose");
  const eyes = page.locator('.cine-actor[data-role="caster"] [data-part="eyes"]');
  const narrowed = await eyes.evaluate((el) => getComputedStyle(el).transform);
  expect(narrowed).not.toBe("none");
  await hold(page, { enemy: "hound", shot: 4, at: 0.5 }, "flight");
  await expect(page.locator(".fx-hundredth-arrow-wrap")).toBeAttached();
  expect(await page.locator(".fx-impact-star-wrap, .fx-shockwave-wrap").count()).toBe(0);
});

test("the hit reveals the result and leaves marks on the rest of the real line", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 5, at: 0.3 }, "impact");
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  await hold(page, { enemy: "hound", shot: 6, at: 0.5 }, "left");
  const enemies = await page.locator('.stage .combatant[data-side="enemy"]').count();
  // One sign per enemy on the board: the broken one on the target, the rest held for the party.
  await expect(page.locator(".hm-board-sign")).toHaveCount(enemies);
  await expect(page.locator(".hm-board-sign[data-primary]")).toHaveCount(1);
});

test("a boss is framed as a boss, and skipping leaves nothing behind", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 5, at: 0.3 }, "impact");
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-framing", "boss");
  const box = await page.locator('.cine-actor[data-role="targets"] .cine-sprite').first().boundingBox();
  const frame = await page.locator(".ult-cinematic").boundingBox();
  // Framed whole: the boss's head is inside the picture.
  expect(box!.y).toBeGreaterThan(frame!.y - box!.height * 0.1);
  await page.locator(".cine-skip").click();
  await expect(page.locator(".ult-cinematic")).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .hm-clone").count()).toBe(0);
});
