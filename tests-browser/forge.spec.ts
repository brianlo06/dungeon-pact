import { test, expect, type Page } from "@playwright/test";

/**
 * The foundry's rank and file — Cinder Stoker, Ash Acolyte, Living Bellows,
 * Slag Hound — are authored cutout rigs rather than atlas cells. These check
 * that each one is actually drawn, actually moving in pieces, and facing the
 * party it is fighting.
 */

async function open(page: Page, encounter: string, party: number) {
  const q = new URLSearchParams({
    viewport: "fit",
    encounter,
    party: String(party),
    stage: "objective",
    // Motion on: these check that parts move, and under reduced motion
    // nothing does.
    motion: "1",
  });
  await page.goto(`/dev/bosses.html?${q}`);
  await page.locator(".battle").waitFor();
  await page.addStyleTag({
    content: ".preview-toolbar{display:none!important}",
  });
  await page.locator(".stage").waitFor();
}

const CREATURES = [
  {
    name: "Cinder Stoker",
    sel: ".stoker",
    encounter: "furnace-watch",
    party: 3,
  },
  {
    name: "Ash Acolyte",
    sel: ".acolyte",
    encounter: "furnace-watch",
    party: 3,
  },
  {
    name: "Living Bellows",
    sel: ".bellows",
    encounter: "smoke-line",
    party: 2,
  },
  { name: "Slag Hound", sel: ".hound", encounter: "hunting-pack", party: 2 },
] as const;

const partTransforms = (page: Page, sel: string) =>
  page.evaluate(
    (s) =>
      [...document.querySelectorAll(`${s} > g`)].map(
        (el) => (el as SVGElement).style.transform,
      ),
    sel,
  );

test.describe("the foundry's rank and file are drawn, not placeheld", () => {
  for (const c of CREATURES) {
    test(`${c.name} is authored art with moving parts, facing the party`, async ({
      page,
    }) => {
      await open(page, c.encounter, c.party);
      const unit = page.locator(".combatant", {
        has: page.locator(`.combatant-name:text-is("${c.name}")`),
      });
      await expect(unit).toHaveCount(1);

      // Authored SVG, not a cell of the placeholder atlas.
      await expect(unit.locator(c.sel)).toBeVisible();
      await expect(unit.locator(".sprite")).toHaveCount(0);

      // At least four parts, every one of them being driven...
      const before = await partTransforms(page, c.sel);
      expect(before.length).toBeGreaterThanOrEqual(4);
      expect(before.every(Boolean)).toBe(true);
      // ...and not driven identically: the pieces move independently.
      await page.waitForTimeout(700);
      const after = await partTransforms(page, c.sel);
      expect(new Set(after).size).toBeGreaterThan(1);
      expect(after.some((t, i) => t !== before[i])).toBe(true);

      // Drawn facing left already. The atlas flip must not reach it.
      const transform = await unit
        .locator(c.sel)
        .evaluate((el) => getComputedStyle(el).transform);
      expect(transform.startsWith("matrix(-1")).toBe(false);
    });
  }

  test("a full Smoke Line has no placeholder sprites left on the enemy side", async ({
    page,
  }) => {
    // Bulwark, Bellows, Acolyte, Hound: every one of them is drawn now.
    await open(page, "smoke-line", 4);
    const enemies = page.locator('.combatant[data-side="enemy"]');
    await expect(enemies).toHaveCount(4);
    await expect(enemies.locator(".sprite")).toHaveCount(0);
  });
});
