import { test, expect, type Page } from "@playwright/test";

/** The Arcanist's Debt of Thunder, through the Ultimate lab. */

test.describe.configure({ timeout: 90_000 });

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(`/dev/ultimates.html?${new URLSearchParams({ hero: "arcanist", party: 3, auto: 1, pause: 1, ...params } as never)}`);
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

test("the storm reaches the whole enemy line, and the chain runs down it", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 5, at: 0.4 }, "strike");
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-cinematic", "debt-of-thunder");
  expect(await page.locator('.cine-actor[data-role="targets"]').count()).toBeGreaterThanOrEqual(2);
  await expect(page.locator(".fx-arcs-wrap")).toBeAttached();
  await expect(page.locator(".fx-lightning-wrap")).toBeAttached();
});

test("the brim close-up is quiet: no rain in it", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 3, at: 0.5 }, "brim");
  expect(await page.locator(".fx-rain-wrap").count()).toBe(0);
});

test("a boss is framed as a boss, and skipping leaves nothing behind", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 5, at: 0.3 }, "strike");
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-framing", "boss");
  await page.locator(".cine-skip").click();
  await expect(page.locator(".ult-cinematic")).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor").count()).toBe(0);
});
