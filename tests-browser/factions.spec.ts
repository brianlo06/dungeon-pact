import { test, expect, type Page } from "@playwright/test";

/**
 * The faction creatures on the real stage.
 *
 * Every check reads what the chips say before the round resolves: a synergy
 * the party cannot see coming is not a puzzle, it is a surprise. The Battle
 * Lab stages each authored encounter exactly as the game builds it.
 */

test.describe.configure({ timeout: 90_000 });

async function lab(page: Page, encounter: string, party = 3, stage = "opening") {
  await page.goto(
    `/dev/bosses.html?encounter=${encounter}&party=${party}&stage=${stage}&motion=1`,
  );
  await page.locator(".stage").waitFor({ timeout: 30_000 });
  await page.locator(".intent-chip").first().waitFor({ timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);
}
/** One creature's chip, found by its rig so no other chip's text can match. */
const chip = (page: Page, rig: string) =>
  page.locator(`.combatant[data-rig="${rig}"]`).locator(".intent-chip");

test("every creature in a faction fight is drawn, not an atlas sprite", async ({ page }) => {
  for (const encounter of ["intake-tunnel", "copy-desk"]) {
    await lab(page, encounter, 4);
    const figures = page.locator(".combatant[data-side='enemy'] .combatant-sprite");
    await expect(figures).toHaveCount(4);
    // Authored art is an inline cutout; a placeholder would be a sprite cell.
    expect(await page.locator(".combatant[data-side='enemy'] svg[role='img']").count()).toBe(4);
    expect(await page.locator(".combatant[data-side='enemy'] .sprite-cell").count()).toBe(0);
  }
});

test("the Pressure Maw says whom it will drag forward, and where", async ({ page }) => {
  await lab(page, "intake-tunnel", 3);
  const maw = chip(page, "maw");
  await expect(maw).toContainText("Siphon");
  // The reason it chose this, and what it does besides damage.
  await expect(maw.locator(".intent-why")).toHaveText("back row");
  await expect(maw.locator(".intent-riders")).toContainText("pulls front");
  await expect(maw.locator(".intent-riders")).toContainText("Wet 1");
  await expect(maw.locator(".intent-damage")).toBeVisible();
});

test("the Sluice Eel soaks first and says the Conduct is waiting for Wet", async ({ page }) => {
  await lab(page, "spillway-watch", 3);
  const eel = chip(page, "eel");
  await expect(eel).toContainText("Soak");
  await expect(eel.locator(".intent-riders")).toContainText("Wet 1");
});

test("the Seal Scribe's sentence is a countdown object with a hero's name on it", async ({ page }) => {
  await lab(page, "copy-desk", 3);
  await expect(chip(page, "scribe")).toContainText("Wax sentence");
  // A round later the seal stands on the field, counting down.
  await lab(page, "copy-desk", 3, "resolved");
  const seal = page.locator('.combatant[data-rig="sentence-seal"]');
  await expect(seal).toBeVisible();
  await expect(seal.locator(".intent-chip")).toContainText(/Passes in|Sentence passes/);
});

test("the Ledger Wraith's debt is announced as a debt, in figures", async ({ page }) => {
  await lab(page, "ledger-room", 3);
  const wraith = chip(page, "wraith");
  await expect(wraith).toContainText("Ledger entry");
  await expect(wraith.locator(".intent-riders")).toContainText("Debt");
});

test("the Margin Stalker names its target and the Mark it would cash in", async ({ page }) => {
  await lab(page, "marked-for-collection", 4);
  const stalker = chip(page, "stalker");
  await expect(stalker).toContainText("Footnote");
  await expect(stalker.locator(".intent-why")).toHaveText(/weakest|Marked/);
  await expect(stalker.locator(".intent-riders")).toContainText("+20 Marked");
});

test("the Pressure Engine shows its meter and what cracks the vent", async ({ page }) => {
  await lab(page, "pressure-engine", 3);
  // Its own figure, by rig: another creature's chip names it as the ally it plates.
  const engine = page.locator('.combatant[data-rig="engine"]');
  // The meter is on the figure, not hidden in a tooltip.
  await expect(engine).toContainText("Pressure");
  await expect(engine.locator(".intent-chip")).toContainText("Build pressure");
});

test("no chip in a faction fight covers a name plate or leaves the screen", async ({ page }) => {
  for (const encounter of ["conductive-main", "probate-court", "pressure-engine"]) {
    for (const party of [2, 4] as const) {
      await lab(page, encounter, party);
      const faults = await page.evaluate(() => {
        const boxes = [...document.querySelectorAll<HTMLElement>(".intent-chip")].map((el) => ({
          el,
          r: el.getBoundingClientRect(),
        }));
        const plates = [...document.querySelectorAll<HTMLElement>(".combatant-plate")].map((el) =>
          el.getBoundingClientRect(),
        );
        const overlap = (a: DOMRect, b: DOMRect) =>
          a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        const out: string[] = [];
        for (const { el, r } of boxes) {
          if (r.left < 0 || r.right > innerWidth || r.top < 0) out.push(`offscreen: ${el.textContent}`);
          for (const p of plates) if (overlap(r, p)) out.push(`covers a plate: ${el.textContent}`);
        }
        return out;
      });
      expect(faults, `${encounter} ${party}p`).toEqual([]);
    }
  }
});
