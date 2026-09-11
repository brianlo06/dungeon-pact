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

async function open(
  page: Page,
  params: Record<string, string | number> = {},
  keepToolbar = false,
) {
  await page.goto(scene(params));
  await page.locator(".battle").waitFor();
  // The lab's own toolbar is not part of the game; hide it so the measurement
  // is of the battle in a viewport rather than the battle under a dev header.
  // Tests that need to drive the fixture keep it and measure the battle box.
  if (!keepToolbar)
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

test.describe("the action interface belongs to the hero", () => {
  test("the fan is on the stage, not in a strip at the bottom", async ({
    page,
  }) => {
    await open(page, { party: 4, stage: "objective" });
    // The fan wrapper is a zero-area anchor, so measure what it renders.
    await expect(page.locator(".fan-slip > button").first()).toBeVisible();
    const stage = (await page.locator(".stage").boundingBox())!;
    const controls = (await page.locator(".battle-controls").boundingBox())!;
    const slips = await page.evaluate(() =>
      [...document.querySelectorAll(".fan-slip > button")].map((el) => {
        const b = el.getBoundingClientRect();
        return { top: b.top, bottom: b.bottom };
      }),
    );
    expect(slips.length).toBeGreaterThan(3);
    for (const s of slips) {
      expect(s.top).toBeGreaterThanOrEqual(stage.y - 1);
      // Every option is on the battlefield, above the controls band.
      expect(s.bottom).toBeLessThanOrEqual(controls.y + 1);
    }
  });

  for (const you of [0, 1, 2, 3]) {
    test(`every action stays on screen and readable for hero ${you}`, async ({
      page,
    }) => {
      await open(page, { party: 4, stage: "objective", you });
      const slips = page.locator(".fan-slip");
      expect(await slips.count()).toBeGreaterThan(3);
      const bad = await page.evaluate(() => {
        const boxes = [...document.querySelectorAll(".fan-slip > button")].map(
          (el) => ({ el, b: el.getBoundingClientRect() }),
        );
        const offscreen = boxes
          .filter(
            ({ b }) =>
              b.top < -1 ||
              b.left < -1 ||
              b.bottom > window.innerHeight + 1 ||
              b.right > window.innerWidth + 1,
          )
          .map(({ el }) => `offscreen: ${el.textContent}`);
        // No slip may cover the label of another; that hides your own options.
        const covered: string[] = [];
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i].b,
              c = boxes[j].b;
            const overlap =
              Math.max(
                0,
                Math.min(a.right, c.right) - Math.max(a.left, c.left),
              ) *
              Math.max(
                0,
                Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top),
              );
            if (
              overlap >
              0.35 * Math.min(a.width * a.height, c.width * c.height)
            )
              covered.push(
                `overlap: ${boxes[i].el.textContent} / ${boxes[j].el.textContent}`,
              );
          }
        return [...offscreen, ...covered];
      });
      expect(bad).toEqual([]);
    });
  }

  test("choosing an ability moves to picking a target on the field", async ({
    page,
  }) => {
    await open(page, { party: 4, stage: "objective" });
    await page.locator(".fan-slip:not([data-common]) > button").first().click();
    await expect(page.locator(".commit-bar")).toHaveAttribute(
      "data-mode",
      "target",
    );
    // The fan collapses to the chosen slip so the field is clear to click.
    expect(await page.locator(".fan-slips .fan-slip").count()).toBe(1);

    await page
      .locator(".combatant[data-side='enemy'] .combatant-body")
      .first()
      .click();
    await expect(page.locator(".lock-action")).toBeEnabled();

    // Backing out returns to choosing, and never gets stuck.
    await page.locator(".commit-back").click();
    await expect(page.locator(".commit-bar")).toHaveAttribute(
      "data-mode",
      "ability",
    );
    expect(await page.locator(".fan-slips .fan-slip").count()).toBeGreaterThan(
      1,
    );
    expect((await overflow(page)).vertical).toBeLessThanOrEqual(TOLERANCE);
  });

  test("escape backs out of target selection", async ({ page }) => {
    await open(page, { party: 4, stage: "objective" });
    await page.locator(".fan-slip:not([data-common]) > button").first().click();
    await expect(page.locator(".commit-bar")).toHaveAttribute(
      "data-mode",
      "target",
    );
    await page.keyboard.press("Escape");
    await expect(page.locator(".commit-bar")).toHaveAttribute(
      "data-mode",
      "ability",
    );
  });

  test("the camera never pushes the page out of the viewport", async ({
    page,
  }) => {
    await open(page, { party: 4, stage: "objective" });
    await page.locator(".fan-slip:not([data-common]) > button").first().click();
    await page
      .locator(".combatant[data-side='enemy'] .combatant-body")
      .first()
      .click();
    await page.waitForTimeout(500); // let the camera settle on the target
    const o = await overflow(page);
    expect(o.vertical).toBeLessThanOrEqual(TOLERANCE);
    expect(o.horizontal).toBeLessThanOrEqual(TOLERANCE);
  });
});

test.describe("the Collector's objective is legible without the chronicle", () => {
  test("the strongbox appears, is named, and shows it is holding something", async ({
    page,
  }) => {
    await open(page, { party: 4, stage: "resolved" });
    const box = page.locator(".combatant", {
      has: page.locator("text=Strongbox"),
    });
    await expect(box).toBeVisible();
    await expect(box.locator(".holding")).toContainText("held");
    // What it took is named on demand rather than printed across the field.
    await expect(box.locator(".holding")).toHaveAttribute(
      "title",
      /Stormglass|Briar/,
    );
  });

  test("the strongbox is not presented as an enemy that must be killed", async ({
    page,
  }) => {
    await open(page, { party: 4, stage: "released" });
    const box = page.locator(".combatant", {
      has: page.locator("text=Strongbox"),
    });
    // Opened, not "Defeated": it never blocked the chamber from ending.
    await expect(box.locator(".intent-chip")).toContainText("Opened");
    await expect(box.locator(".holding")).toHaveCount(0);
  });

  test("playback can be paused, stepped and re-sped without breaking layout", async ({
    page,
  }) => {
    await open(page, { party: 4, stage: "objective", motion: 1 }, true);
    await page.locator(".fan-slip:not([data-common]) > button").first().click();
    await page
      .locator(".combatant[data-side='enemy'] .combatant-body")
      .nth(1)
      .click();
    await page.getByRole("button", { name: "Finish round" }).click();
    const playback = page.locator(".strip-playback");
    await expect(playback).toBeVisible();
    await playback.getByRole("button", { name: "Pause" }).click();
    await expect(
      playback.getByRole("button", { name: "Resume" }),
    ).toBeVisible();
    // Stepping while paused advances without letting the round run away.
    await playback.locator('button[title="Next beat"]').click();
    await page.locator(".strip-playback button", { hasText: "2×" }).click();
    const battle = await page.evaluate(() => {
      const el = document.querySelector(".battle")!;
      return {
        overflow:
          el.scrollHeight - Math.round(el.getBoundingClientRect().height),
        wide: el.scrollWidth - Math.round(el.getBoundingClientRect().width),
      };
    });
    expect(battle.overflow).toBeLessThanOrEqual(TOLERANCE);
    expect(battle.wide).toBeLessThanOrEqual(TOLERANCE);
  });
});

test.describe("the new visual layer stays inside the viewport", () => {
  test("the boss entrance never overflows or blocks the fight", async ({
    page,
  }) => {
    // Slowed, so a loaded parallel worker cannot miss the window. The tempo
    // control is development-only and exists for capture; this reuses it.
    await open(page, { party: 4, stage: "opening", motion: 1, tempo: 0.2 });
    await expect(page.locator(".boss-intro")).toBeVisible();
    const o = await overflow(page);
    expect(o.vertical).toBeLessThanOrEqual(TOLERANCE);
    expect(o.horizontal).toBeLessThanOrEqual(TOLERANCE);
    // The title must stay on screen at every supported size.
    const plate = await inViewport(page, ".intro-plate");
    expect(plate.inside).toBe(true);
    // Any input clears it, so nobody is trapped watching it.
    await page.keyboard.press("Space");
    await expect(page.locator(".boss-intro")).toHaveCount(0);
  });

  test("the environment never covers a combatant or an intention", async ({
    page,
  }) => {
    await open(page, { party: 4, stage: "resolved" });
    // Foreground art is decorative and must not eat clicks meant for the field.
    const blocking = await page.evaluate(() =>
      [
        ...document.querySelectorAll(
          ".layer-foreground, .layer-far, .layer-mid",
        ),
      ]
        .filter((el) => getComputedStyle(el).pointerEvents !== "none")
        .map((el) => el.className),
    );
    expect(blocking).toEqual([]);
    // And an enemy is still clickable through it.
    await page.locator(".fan-slip:not([data-common]) > button").first().click();
    await page
      .locator(".combatant[data-side='enemy'] .combatant-body")
      .nth(1)
      .click();
    await expect(page.locator(".lock-action")).toBeEnabled();
  });

  test("the strongbox shows its state, not just its count", async ({
    page,
  }) => {
    await open(page, { party: 4, stage: "resolved" });
    const vault = page.locator(".vault");
    await expect(vault).toHaveAttribute("data-state", /holding|damaged/);
    // A lock is lit for each item it has taken.
    const lit = await page.locator(".vault-lock[data-lit]").count();
    expect(lit).toBeGreaterThan(0);

    await open(page, { party: 4, stage: "released" });
    await expect(page.locator(".vault")).toHaveAttribute(
      "data-state",
      "broken",
    );
    expect(await page.locator(".vault-lock[data-lit]").count()).toBe(0);
  });

  test("every combatant animates through its own rig", async ({ page }) => {
    await open(page, { party: 4, stage: "objective" });
    const first = await page.evaluate(() =>
      [...document.querySelectorAll(".combatant-rig")].map(
        (el) => (el as HTMLElement).style.transform,
      ),
    );
    await page.waitForTimeout(700);
    const later = await page.evaluate(() =>
      [...document.querySelectorAll(".combatant-rig")].map(
        (el) => (el as HTMLElement).style.transform,
      ),
    );
    expect(first.length).toBeGreaterThan(3);
    expect(first.every(Boolean)).toBe(true);
    // Idles are out of phase, so the field is not breathing in lockstep.
    expect(new Set(later).size).toBeGreaterThan(1);
    expect(later.some((t, i) => t !== first[i])).toBe(true);
  });
});
