import { test, expect, type Page } from "@playwright/test";

/** The Warden's Green Reckoning, through the Ultimate lab. */

test.describe.configure({ timeout: 90_000 });

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(`/dev/ultimates.html?${new URLSearchParams({ hero: "warden", party: 3, auto: 1, pause: 1, ...params } as never)}`);
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

test("under the floor, the web reaches the real party and the whole real enemy line", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 2, at: 0.8 }, "web");
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-cinematic", "green-reckoning");
  // No enemy is in the cast (poison leaves no beat); every living one is copied off the board.
  const living = await page.locator('.stage .combatant[data-side="enemy"]:not([data-down])').count();
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveCount(0);
  await expect(page.locator(".gr-foe")).toHaveCount(living);
  // The party is the real cast, and a root reaches every ally and every enemy.
  const allies = await page.locator('.cine-actor[data-role="allies"]').count();
  expect(allies).toBe(2);
  await expect(page.locator('.gr-root:not([style*="none"])')).toHaveCount(Math.min(7, allies + living));
  await expect(page.locator(".gr-soil")).toBeAttached();
});

test("the quiet close-up acts with the face, and the eyes open at its end", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 3, at: 0.4 }, "listen");
  const caster = page.locator('.cine-actor[data-role="caster"]');
  const lids = await caster.locator('[data-part="eyes"]').evaluate((el) => getComputedStyle(el).transform);
  expect(lids).not.toBe("none");
  const shut = await caster.evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--wdn-eyes") || 0));
  expect(shut).toBeLessThan(0.05);
  // Nothing loud in the quiet.
  expect(await page.locator(".fx-green-burst-wrap, .fx-impact-star-wrap").count()).toBe(0);
  await hold(page, { enemy: "hound", shot: 3, at: 0.98 }, "listen");
  const open = await page
    .locator('.cine-actor[data-role="caster"]')
    .evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--wdn-eyes") || 0));
  expect(open).toBeGreaterThan(0.9);
});

test("a downed ally lies on the web and is lifted at the reckoning", async ({ page }) => {
  await hold(page, { enemy: "hound", downed: 1, shot: 2, at: 0.6 }, "web");
  const film = page.locator(".ult-cinematic");
  const downed = await film.getAttribute("data-green-downed");
  expect(downed).toBeTruthy();
  const lying = page.locator('.cine-actor[data-role="allies"] .cine-look[style*="rotate(-80"]');
  await expect(lying).toHaveCount(1);
  await hold(page, { enemy: "hound", downed: 1, shot: 4, at: 0.95 }, "reckoning");
  await expect(page.locator('.cine-actor[data-role="allies"] .cine-look[style*="rotate(-8"]')).toHaveCount(0);
  await expect(page.locator(".gr-bloom[data-chip] .gr-chip")).toHaveText(/Revived/);
  // On the real board it stands, healed.
  await expect(page.locator(`.stage .combatant[data-unit="${downed}"]`)).not.toHaveAttribute("data-down", "");
});

test("the reckoning is drawn, reveals the result and leaves marks on the real board", async ({ page }) => {
  await hold(page, { enemy: "hound", shot: 4, at: 0.3 }, "reckoning");
  await expect(page.locator('.cine-accent[data-screen="two-tone"]')).toBeAttached();
  const enemies = await page.locator(".gr-foe").count();
  await expect(page.locator('.gr-briar:not([style*="none"])')).toHaveCount(Math.min(6, enemies));
  await expect(page.locator(".gr-chip.rot").first()).toHaveText("Poison 4");
  await hold(page, { enemy: "hound", shot: 5, at: 0.5 }, "grown");
  const units = await page.locator(".stage .combatant:not([data-down])").count();
  await expect(page.locator(".gr-mark")).toHaveCount(units);
  await expect(page.locator('.gr-mark[data-side="hero"] .gr-sprout')).toHaveCount(3);
});

test("a boss stands whole over the web, FAST keeps the quiet and the blow, and skipping leaves nothing", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 4, at: 0.5 }, "reckoning");
  const frame = (await page.locator(".ult-cinematic").boundingBox())!;
  const boss = page.locator(".gr-foe").first();
  const box = (await boss.boundingBox())!;
  expect(box.y).toBeGreaterThan(frame.y - box.height * 0.1);
  expect(box.x + box.width * 0.5).toBeLessThan(frame.x + frame.width);
  await hold(page, { enemy: "hound", mode: "fast", shot: 3, at: 0.5 }, "listen");
  await hold(page, { enemy: "hound", mode: "fast", shot: 4, at: 0.3 }, "reckoning");
  await page.locator(".cine-skip").click();
  await expect(page.locator(".ult-cinematic")).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .gr-foe, .gr-mark").count()).toBe(0);
});
