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

/** Wait for the camera to stop moving: two identical readings in a row. */
async function cameraSettled(page: Page) {
  let last = "";
  for (let i = 0; i < 40; i++) {
    const now = await page
      .locator(".world")
      .evaluate((el) => (el as HTMLElement).style.transform);
    if (now && now === last) return;
    last = now;
    await page.waitForTimeout(120);
  }
}

/**
 * Every name plate in the nearest rank that is not wholly on the stage. The
 * stage clips, so a plate past its bottom edge is a health bar nobody sees.
 */
function lostPlates(page: Page) {
  return page.evaluate(() => {
    const stage = document.querySelector(".stage")!.getBoundingClientRect();
    const plates = [
      ...document.querySelectorAll<HTMLElement>(".combatant[data-side='hero']"),
    ].map((u) => ({
      name: u.querySelector(".combatant-name")?.textContent,
      b: u.querySelector(".combatant-plate")!.getBoundingClientRect(),
    }));
    const floor = Math.max(...plates.map((p) => p.b.bottom));
    return plates
      .filter((p) => p.b.bottom > floor - 30)
      .filter(
        (p) => p.b.bottom > stage.bottom + 0.5 || p.b.top < stage.top - 0.5,
      )
      .map(
        (p) =>
          `${p.name}'s plate ends ${Math.round(p.b.bottom - stage.bottom)}px below the stage`,
      );
  });
}

test.describe("the back row's health stays on screen when the camera leans in", () => {
  for (const fight of [
    { boss: "collector", party: 4 },
    { encounter: "repair-detail", party: 4 },
    { encounter: "hunting-pack", party: 3 },
  ])
    test(`while a target is picked: ${fight.encounter ?? fight.boss}`, async ({
      page,
    }) => {
      test.setTimeout(60_000);
      await open(page, { ...fight, stage: "objective" });
      await cameraSettled(page);
      expect(await lostPlates(page), "choosing").toEqual([]);
      await page
        .locator(".fan-slip:not([data-common]) > button")
        .first()
        .click();
      const enemies = page.locator(
        ".combatant[data-side='enemy'] .combatant-body",
      );
      // The back rank is the one that tips the camera furthest up.
      for (let i = 0; i < (await enemies.count()); i++) {
        await enemies.nth(i).click();
        await cameraSettled(page);
        expect(await lostPlates(page), `target ${i}`).toEqual([]);
      }
    });

  test("while a round plays back, beat by beat", async ({ page }) => {
    test.setTimeout(90_000);
    await open(
      page,
      {
        boss: "collector",
        party: 4,
        stage: "objective",
        motion: 1,
        tempo: 0.2,
      },
      true,
    );
    await page.locator(".fan-slip:not([data-common]) > button").first().click();
    await page
      .locator(".combatant[data-side='enemy'] .combatant-body")
      .first()
      .click();
    await page.getByRole("button", { name: "Finish round" }).click();
    const playback = page.locator(".strip-playback");
    await expect(playback).toBeVisible();
    await playback.getByRole("button", { name: "Pause" }).click();
    let beats = 0;
    for (; beats < 14 && (await playback.isVisible()); beats++) {
      await cameraSettled(page);
      expect(await lostPlates(page), `beat ${beats}`).toEqual([]);
      const next = playback.locator('button[title="Next beat"]');
      if (!(await next.isVisible())) break;
      await next.click();
    }
    // The round had beats to look at: heroes and the boss acting, both ways.
    expect(beats).toBeGreaterThan(2);
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

  /**
   * What the fan covers, measured against what is actually drawn: each
   * figure's painted bounds (glows aside), every name plate and every intent
   * chip. The fan used to open at fixed offsets and covered its own hero at
   * every seat.
   */
  const fanCovers = (page: Page) =>
    page.evaluate(() => {
      const things = [...document.querySelectorAll(".combatant")].flatMap(
        (u) => {
          const name = u.querySelector(".combatant-name")?.textContent?.trim();
          const out: { k: string; r: DOMRect | Record<string, number> }[] = [
            {
              k: `${name}'s plate`,
              r: u.querySelector(".combatant-plate")!.getBoundingClientRect(),
            },
          ];
          const chip = u.querySelector(".intent-chip");
          if (chip && chip.getBoundingClientRect().width > 1)
            out.push({ k: `${name}'s chip`, r: chip.getBoundingClientRect() });
          const svg = u.querySelector<SVGSVGElement>("svg.combatant-sprite");
          if (svg) {
            const glows = [...svg.querySelectorAll<SVGElement>(".ph-glow")];
            glows.forEach((g) => (g.style.display = "none"));
            const bb = svg.getBBox();
            glows.forEach((g) => (g.style.display = ""));
            const m = svg.getScreenCTM()!;
            const a = new DOMPoint(bb.x, bb.y).matrixTransform(m);
            const c = new DOMPoint(
              bb.x + bb.width,
              bb.y + bb.height,
            ).matrixTransform(m);
            out.push({
              k: name ?? "?",
              r: {
                left: Math.min(a.x, c.x),
                right: Math.max(a.x, c.x),
                top: Math.min(a.y, c.y),
                bottom: Math.max(a.y, c.y),
              },
            });
          }
          return out;
        },
      );
      const faults: string[] = [];
      for (const el of document.querySelectorAll(".action-fan button")) {
        const s = el.getBoundingClientRect();
        for (const t of things) {
          const ix = Math.min(s.right, t.r.right) - Math.max(s.left, t.r.left);
          const iy = Math.min(s.bottom, t.r.bottom) - Math.max(s.top, t.r.top);
          if (ix > 2 && iy > 2)
            faults.push(`${el.textContent?.trim()} covers ${t.k}`);
        }
      }
      return faults;
    });

  for (const fight of [
    { encounter: "hunting-pack", party: 4 },
    { encounter: "toll-collectors", party: 3, heroes: "broker,herald,reaver" },
    { boss: "collector", party: 4, heroes: "reaver,beguiler,warden,broker" },
  ])
    test(`the fan covers nobody, at any seat: ${fight.encounter ?? fight.boss}`, async ({
      page,
    }) => {
      for (let you = 0; you < fight.party; you++) {
        await open(page, { ...fight, stage: "objective", you });
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator(".fan-block")).toBeVisible();
        expect(await fanCovers(page), `seat ${you}`).toEqual([]);
        // Collapsed to the chosen slip while targeting, it still covers no one.
        await page
          .locator(".fan-slip:not([data-common]) > button")
          .first()
          .click();
        await expect(page.locator(".commit-bar")).toHaveAttribute(
          "data-mode",
          "target",
        );
        await page.waitForTimeout(150);
        expect(await fanCovers(page), `seat ${you}, targeting`).toEqual([]);
      }
    });

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
    // Slowed, so the replay window cannot close before a loaded parallel
    // worker gets to it. Same reason as the boss entrance above.
    await open(
      page,
      { party: 4, stage: "objective", motion: 1, tempo: 0.2 },
      true,
    );
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

test.describe("the Collector is a cutout rig, not a sprite", () => {
  test("its parts move independently of the figure", async ({ page }) => {
    await open(page, { party: 4, stage: "objective" });
    const parts = page.locator(".collector > g");
    expect(await parts.count()).toBeGreaterThanOrEqual(5);

    const read = () =>
      page.evaluate(() =>
        [...document.querySelectorAll(".collector > g")].map(
          (el) => (el as SVGElement).style.transform,
        ),
      );
    const before = await read();
    await page.waitForTimeout(900);
    const after = await read();

    // Every part is being driven, and they are not all driven identically —
    // the chains and seals lag the body, which is what sells the weight.
    expect(before.every(Boolean)).toBe(true);
    expect(new Set(after).size).toBeGreaterThan(1);
    expect(after.some((t, i) => t !== before[i])).toBe(true);
  });

  test("it dominates the frame next to an ordinary enemy", async ({ page }) => {
    await open(page, { party: 4, stage: "objective" });
    const boss = await page
      .locator(".combatant", { has: page.locator(".collector") })
      .locator(".combatant-body")
      .boundingBox();
    const bulwark = await page
      .locator(".combatant", { has: page.locator("text=Iron Bulwark") })
      .locator(".combatant-body")
      .boundingBox();
    expect(boss!.height).toBeGreaterThan(bulwark!.height * 1.3);
    // ...and still fits on the stage.
    const stage = (await page.locator(".stage").boundingBox())!;
    expect(boss!.y).toBeGreaterThanOrEqual(stage.y - 1);
  });
});

test.describe("the boss encounter is drawn, not placeheld", () => {
  test("every creature in it is authored art with moving parts", async ({
    page,
  }) => {
    await open(page, { party: 4, stage: "resolved" });
    for (const sel of [".collector", ".bulwark", ".mender", ".vault"])
      await expect(page.locator(sel)).toBeVisible();

    // Each rigged creature has parts, and they are being driven.
    for (const sel of [".collector", ".bulwark", ".mender"]) {
      const parts = await page.evaluate(
        (s) =>
          [...document.querySelectorAll(`${s} > g`)].map(
            (el) => (el as SVGElement).style.transform,
          ),
        sel,
      );
      expect(parts.length, sel).toBeGreaterThanOrEqual(4);
      expect(parts.every(Boolean), sel).toBe(true);
    }
  });

  test("authored creatures face the party rather than away from it", async ({
    page,
  }) => {
    await open(page, { party: 4, stage: "objective" });
    // The mirror exists for the raster atlas only. Flipping hand-drawn SVG
    // pointed the Bulwark's ram away from the people it charges.
    const flipped = await page.evaluate(() =>
      [".collector", ".bulwark", ".mender"].filter((s) => {
        const el = document.querySelector(s);
        return el
          ? getComputedStyle(el).transform.startsWith("matrix(-1")
          : false;
      }),
    );
    expect(flipped).toEqual([]);
  });
});
