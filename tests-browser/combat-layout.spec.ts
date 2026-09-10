import { test, expect, type Page } from "@playwright/test";

/**
 * Combat has to fit one viewport at every size people play at, in every state
 * a fight actually reaches. The CSS contract tests guard the rules that make
 * that true; these guard the result, with real content, real engine state and
 * a real layout engine.
 */

/** A Battle Lab scene, rendered at the browser's own viewport. */
const scene = (params: Record<string, string | number> = {}) => {
  const q = new URLSearchParams({ viewport: "fit", ...(params as never) });
  return `/dev/bosses.html?${q}`;
};

async function open(page: Page, params: Record<string, string | number> = {}) {
  await page.goto(scene(params));
  await page.locator(".battle").waitFor();
  // The lab's own toolbar is not part of the game; hide it so the measurement
  // is of the battle in a viewport rather than the battle under a dev header.
  await page.addStyleTag({
    content: ".preview-toolbar{display:none!important}",
  });
  await page.locator(".stage").waitFor();
  return page;
}

/** Nothing may extend past the viewport, in either direction. */
async function overflow(page: Page) {
  return page.evaluate(() => ({
    vertical:
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight,
    horizontal:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
    scrolled: window.scrollY,
  }));
}

/** Is the element fully inside the viewport? */
async function inViewport(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { found: false, inside: false, box: null };
    const b = el.getBoundingClientRect();
    return {
      found: true,
      inside:
        b.top >= -1 &&
        b.left >= -1 &&
        b.bottom <= window.innerHeight + 1 &&
        b.right <= window.innerWidth + 1,
      box: { top: b.top, left: b.left, bottom: b.bottom, right: b.right },
    };
  }, selector);
}

const TOLERANCE = 2;

test.describe("the battle fits one viewport", () => {
  const states: [string, Record<string, string | number>][] = [
    ["four-player planning", { party: 4, stage: "objective" }],
    ["two-player planning", { party: 2, stage: "objective" }],
    ["boss opening", { party: 4, stage: "opening" }],
    ["strongbox holding equipment", { party: 4, stage: "resolved" }],
    ["strongbox broken", { party: 4, stage: "released" }],
    ["a hero downed", { party: 4, stage: "objective", downed: 1 }],
    ["the miser", { party: 4, boss: "miser", stage: "objective" }],
    ["very long names", { party: 4, stage: "objective", longNames: 1 }],
    ["a rich party", { party: 4, boss: "miser", gold: 900 }],
  ];

  for (const [label, params] of states) {
    test(`${label} does not scroll the page`, async ({ page }) => {
      await open(page, params);
      const o = await overflow(page);
      expect(o.vertical, "vertical overflow").toBeLessThanOrEqual(TOLERANCE);
      expect(o.horizontal, "horizontal overflow").toBeLessThanOrEqual(
        TOLERANCE,
      );
    });
  }

  test("the document cannot be scrolled even if something tries", async ({
    page,
  }) => {
    await open(page, { party: 4 });
    await page.mouse.wheel(0, 1200);
    await page.evaluate(() => window.scrollTo(0, 2000));
    expect((await overflow(page)).scrolled).toBeLessThanOrEqual(TOLERANCE);
  });
});

test.describe("everything the player needs is on screen", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, { party: 4, stage: "objective" });
  });

  test("the stage and the controls are both visible", async ({ page }) => {
    await expect(page.locator(".stage")).toBeVisible();
    await expect(page.locator(".battle-controls")).toBeVisible();
    const stage = await page.locator(".stage").boundingBox();
    // The fight, not the furniture, should own most of the screen.
    expect(stage!.height / page.viewportSize()!.height).toBeGreaterThan(0.55);
  });

  test("the treasury stays visible", async ({ page }) => {
    const treasury = await inViewport(page, ".strip-treasury");
    expect(treasury.found).toBe(true);
    expect(treasury.inside).toBe(true);
  });

  test("the party HUD stays inside the viewport", async ({ page }) => {
    const hud = await inViewport(page, ".party-hud");
    expect(hud.found).toBe(true);
    expect(hud.inside).toBe(true);
    // Every hero, not just the first.
    expect(await page.locator(".hud-hero").count()).toBe(4);
    for (let i = 0; i < 4; i++)
      expect(
        (await inViewport(page, `.hud-hero:nth-child(${i + 1})`)).inside,
      ).toBe(true);
  });

  test("every enemy intention is inside the viewport", async ({ page }) => {
    const chips = await page.locator(".intent-chip").count();
    expect(chips).toBeGreaterThan(0);
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll(".intent-chip")]
        .map((el) => {
          const b = el.getBoundingClientRect();
          if (!b.width && !b.height) return null; // collapsed at small heights
          return b.top < -1 ||
            b.left < -1 ||
            b.bottom > window.innerHeight + 1 ||
            b.right > window.innerWidth + 1
            ? { text: el.textContent, top: b.top, bottom: b.bottom }
            : null;
        })
        .filter(Boolean),
    );
    expect(bad).toEqual([]);
  });

  test("every combatant is inside the viewport", async ({ page }) => {
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll(".combatant-body")]
        .map((el) => {
          const b = el.getBoundingClientRect();
          return b.top < -1 ||
            b.bottom > window.innerHeight + 1 ||
            b.left < -1 ||
            b.right > window.innerWidth + 1
            ? { top: b.top, bottom: b.bottom, left: b.left, right: b.right }
            : null;
        })
        .filter(Boolean),
    );
    expect(bad).toEqual([]);
  });
});

test.describe("the chronicle overlays and never resizes the fight", () => {
  test("opening and closing it leaves the stage exactly where it was", async ({
    page,
  }) => {
    await open(page, { party: 4, stage: "objective" });
    const before = await page.locator(".stage").boundingBox();

    await page.locator(".strip-history").click();
    await expect(page.locator(".history-drawer")).toBeVisible();
    const during = await page.locator(".stage").boundingBox();
    expect(during).toEqual(before);

    const o = await overflow(page);
    expect(o.vertical).toBeLessThanOrEqual(TOLERANCE);
    expect(o.horizontal).toBeLessThanOrEqual(TOLERANCE);

    await page.keyboard.press("Escape");
    await expect(page.locator(".history-drawer")).toHaveCount(0);
    expect(await page.locator(".stage").boundingBox()).toEqual(before);
  });
});
