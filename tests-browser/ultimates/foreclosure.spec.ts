import { test, expect, type Page } from "@playwright/test";

/** The Broker's Foreclosure, through the Ultimate lab. */

test.describe.configure({ timeout: 90_000 });

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(`/dev/ultimates.html?${new URLSearchParams({ hero: "broker", party: 3, auto: 1, pause: 1, ...params } as never)}`);
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

const centre = async (page: Page, selector: string) => {
  const box = await page.locator(selector).first().boundingBox();
  return box ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : null;
};

test("the real target stands in the vault's balance behind its collateral, and one coin outweighs it", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 2, at: 0.85 }, "weighing");
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-cinematic", "foreclosure");
  await expect(page.locator('.cine-actor[data-role="targets"]')).toBeVisible();
  await expect(page.locator(".fc-collateral-disc")).toBeVisible();
  // After the coin lands, the target's pan is the high one.
  const [left, right] = await Promise.all([
    page.locator(".fc-pan-in.l").getAttribute("cy"),
    page.locator(".fc-pan-in.r").getAttribute("cy"),
  ]);
  expect(Number(right)).toBeLessThan(Number(left) - 40);
});

test("the quiet close-up acts with a face, and nothing in it is loud", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 3, at: 0.8 }, "settle");
  for (const part of ["brow", "eyes", "mouth"]) {
    const transform = await page
      .locator(`.cine-actor[data-role="caster"] [data-part="${part}"]`)
      .evaluate((el) => getComputedStyle(el).transform);
    expect(transform, part).not.toBe("none");
    expect(transform, part).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
  }
  await expect(page.locator(".fx-foreclosure-coin-wrap .fc-spin-plate")).toBeAttached();
  expect(await page.locator(".fx-foreclosure-mill-wrap, .fx-impact-star-wrap, .cine-accent").count()).toBe(0);
});

test("the blow reveals the damage and seizes the collateral back towards the Broker", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 4, at: 0.3 }, "foreclosure");
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  const disc = await centre(page, ".fc-collateral-disc");
  const target = await centre(page, '.cine-actor[data-role="targets"] .cine-sprite');
  expect(disc!.x).toBeLessThan(target!.x);
});

test("the proceeds land as a ward on every real party member, and the torn tag stays", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 5, at: 0.7 }, "proceeds");
  const party = await page.locator('.stage .combatant[data-side="hero"]:not([data-down])').count();
  await expect(page.locator(".fx-foreclosure-ward-wrap")).toHaveCount(party);
  await expect(page.locator(".fx-foreclosure-tag-wrap")).toHaveCount(1);
});

test("a boss is framed as a boss, the worn kit is drawn, and skipping leaves nothing behind", async ({ page }) => {
  await hold(page, { enemy: "collector", gear: "kit", shot: 4, at: 0.3 }, "foreclosure");
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-framing", "boss");
  const box = await page.locator('.cine-actor[data-role="targets"] .cine-sprite').first().boundingBox();
  const frame = await page.locator(".ult-cinematic").boundingBox();
  expect(box!.y).toBeGreaterThan(frame!.y - box!.height * 0.1);
  // The weapon the Broker wears replaces the ledger it strikes with.
  const caster = page.locator('.cine-actor[data-role="caster"]');
  await expect(caster.locator('[data-equipment="blood-price"]').first()).toBeAttached();
  await page.locator(".cine-skip").click();
  await expect(page.locator(".ult-cinematic")).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .fc-flying").count()).toBe(0);
});

test("a seized weapon stays seized: the Broker strikes with the ledger", async ({ page }) => {
  await hold(page, { enemy: "collector", gear: "seized", shot: 4, at: 0.3 }, "foreclosure");
  const caster = page.locator('.cine-actor[data-role="caster"]');
  await expect(caster.locator('[data-equipment="blood-price"]')).toHaveCount(0);
  await expect(caster.locator("[data-base-weapon]").first()).toBeVisible();
});
