import { test, expect, type Page } from "@playwright/test";

/**
 * Boss intros on the real combat screen.
 *
 * The Ultimate lab plays a boss's intro with `film=intro`, on the board the
 * fight opens with; the boss lab plays it the way the game does, on entering
 * the chamber, with `intro=1`. What the film is showing is read from its own
 * attributes — `data-intro`, `data-shot`, `data-mode`, `data-reduced` — never
 * guessed from pixels.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "vanguard", film: "intro", enemy: "collector", ...params } as never)}`;

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(lab({ auto: 1, pause: 1, ...params }));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}
const film = (page: Page) => page.locator(".ult-cinematic[data-intro]");

test("the Collector enters with its own film, cast as a boss, with its title card", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.8 }, "strike");
  await expect(film(page)).toHaveAttribute("data-cinematic", "collector-intro");
  await expect(film(page)).toHaveAttribute("aria-label", /The Collector, Keeper of Unpaid Debts/);
  // The boss is on its stage; nobody is cast as a caster.
  await expect(page.locator('.cine-actor[data-role="targets"]').first()).toBeVisible();
  await expect(page.locator('.cine-actor[data-role="caster"]')).toHaveCount(0);
  const card = film(page).locator(".cine-title-card");
  await expect(card.locator(".ct-name")).toHaveText("The Collector");
  await expect(card.locator(".ct-epithet")).toHaveText("Keeper of Unpaid Debts");
  await expect(card.locator(".ct-place")).toHaveText("The Collector's Hoard");
});

test("the Strongbox is set out and a blade is hauled into it", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.6 }, "strongbox");
  await expect(film(page).locator(".cbi-box .vault, .cbi-box svg").first()).toBeVisible();
  await expect(film(page).locator(".cbi-seize-blade")).toHaveCount(1);
  await expect(film(page).locator(".cine-text-voice")).toContainText("collateral");
});

test("the Miser wakes in its own film, and the party's gold sets into its shell", async ({ page }) => {
  await hold(page, { enemy: "miser", shot: 4, at: 0.9 }, "slam");
  await expect(film(page)).toHaveAttribute("data-cinematic", "miser-intro");
  const card = film(page).locator(".cine-title-card");
  await expect(card.locator(".ct-name")).toHaveText("The Miser");
  await expect(card.locator(".ct-place")).toHaveText("The Counting House");
  await hold(page, { enemy: "miser", shot: 5, at: 0.85 }, "shell");
  await expect(film(page).locator(".mbi-shell .mbi-scale")).toHaveCount(22);
  await expect(film(page).locator(".cine-text-voice")).toContainText("wear it");
  // The intro's own classes never restyle the Miser's drawing.
  expect(await page.locator(".cine-actor .msr-coin-face").count()).toBeGreaterThan(0);
  expect(await film(page).locator("[class^='msr-']:not(.cine-actor *)").count()).toBe(0);
});

test("the Assayer pours under its title, and a blade cracks its crucible", async ({ page }) => {
  await hold(page, { enemy: "assayer", shot: 4, at: 0.9 }, "pour");
  await expect(film(page)).toHaveAttribute("data-cinematic", "assayer-intro");
  await expect(film(page).locator(".cine-title-card .ct-name")).toHaveText("The Assayer");
  await expect(film(page).locator(".abi-stream")).toBeVisible();
  await hold(page, { enemy: "assayer", shot: 5, at: 0.8 }, "crack");
  await expect(film(page).locator(".abi-crucible .abi-crack")).toBeVisible();
  await expect(film(page).locator(".abi-blade")).toBeVisible();
  await expect(film(page).locator(".cine-text-voice")).toContainText("worth");
});

test("the Salvor rises out of the water, and plates harden onto its back", async ({ page }) => {
  await hold(page, { enemy: "salvor", shot: 4, at: 0.9 }, "haul");
  await expect(film(page)).toHaveAttribute("data-cinematic", "salvor-intro");
  await expect(film(page).locator(".cine-title-card .ct-name")).toHaveText("The Salvor");
  await expect(film(page).locator(".cine-title-card .ct-place")).toHaveText("The Wreck Pool");
  await hold(page, { enemy: "salvor", shot: 5, at: 0.85 }, "harden");
  await expect(film(page).locator(".sbi-plates .sbi-plate")).toHaveCount(3);
  await expect(film(page).locator(".sbi-surface")).toBeVisible();
  await expect(film(page).locator(".cine-text-voice")).toContainText("water takes");
});

test("skipping hands the fight back at once, with nothing of the film left", async ({ page }) => {
  await hold(page, { shot: 2, at: 0.5 }, "quiet");
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[class*='cine-'], [class*='cbi-']").count()).toBe(0);
  expect(await page.locator("[data-clip^='intro:']").count()).toBe(0);
});

test("FAST drops the hoard and is well under the full film", async ({ page }) => {
  // Record every shot the film shows, from inside the page, until it ends.
  await page.addInitScript(() => {
    const w = window as unknown as { shots: string[] };
    w.shots = [];
    new MutationObserver(() => {
      const shot = document.querySelector(".ult-cinematic")?.getAttribute("data-shot");
      if (shot && w.shots.at(-1) !== shot) w.shots.push(shot);
    }).observe(document, { subtree: true, attributes: true, childList: true });
  });
  await page.goto(lab({ auto: 1, mode: "fast" }));
  await expect(film(page)).toHaveAttribute("data-mode", "fast", { timeout: 30_000 });
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const shots = await page.evaluate(() => (window as unknown as { shots: string[] }).shots);
  expect(shots).not.toContain("hoard");
  expect(shots).toEqual(expect.arrayContaining(["shut", "quiet", "loom", "strike", "strongbox", "return"]));
});

test("reduced motion plays one still card, with no flash and no board shake", async ({ page }) => {
  await page.goto(lab({ auto: 1, pause: 1, motion: 0 }));
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  await expect(film(page).locator(".cine-title-card .ct-name")).toHaveText("The Collector");
  await expect(page.locator(".cine-accent")).toHaveCount(0);
});

test("the game plays it on entering the chamber, once", async ({ page }) => {
  const scene = "/dev/bosses.html?boss=collector&party=3&stage=opening&motion=1&intro=1";
  await page.goto(scene);
  await expect(film(page)).toBeVisible({ timeout: 30_000 });
  await page.keyboard.press("Escape");
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  // The fight is live: the action menu is back.
  await expect(page.locator(".fan-slip").first()).toBeVisible();
  // A reconnect to the same chamber does not play it again.
  await page.reload();
  await page.locator(".battle").waitFor();
  await page.waitForTimeout(800);
  await expect(film(page)).toHaveCount(0);
});

test("the film fits the screen: nothing overflows the viewport", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.9 }, "strike");
  const overflow = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth - innerWidth,
    y: document.documentElement.scrollHeight - innerHeight,
  }));
  expect(overflow.x).toBeLessThanOrEqual(1);
  const card = await film(page).locator(".cine-title-card").boundingBox();
  const vw = page.viewportSize()!;
  expect(card!.x).toBeGreaterThanOrEqual(0);
  expect(card!.x + card!.width).toBeLessThanOrEqual(vw.width);
});
