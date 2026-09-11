import { test, expect, type Page } from "@playwright/test";

/**
 * Picking a target, and reading what the enemy intends, on a stage where every
 * combatant is drawn.
 *
 * Legal targets are marked; nothing else changes. No combatant fades — a
 * ghosted back row reads as a rendering fault once the figures are art. And no
 * intent chip may sit on another combatant's name plate or another chip, or
 * leave the screen, in any fight at any party size.
 */

async function lab(page: Page, params: Record<string, string | number>) {
  const q = new URLSearchParams({
    viewport: "fit",
    stage: "objective",
    ...(params as never),
  });
  await page.goto(`/dev/bosses.html?${q}`);
  await page.locator(".battle").waitFor();
  // The lab's toolbar is not part of the game; measure the battle alone.
  await page.addStyleTag({
    content: ".preview-toolbar{display:none!important}",
  });
  await page.locator(".stage").waitFor();
}

/** Choose a slip from the hero's fan by name; the field enters targeting. */
async function choose(page: Page, ability: string) {
  await page.locator(".fan-slip > button", { hasText: ability }).click();
  await expect(page.locator(".commit-bar")).toHaveAttribute(
    "data-mode",
    "target",
  );
}

/**
 * The opacity each combatant is actually drawn at: its own and every
 * ancestor's down to the figure's container. Parts inside a rig animate their
 * own opacity (a glowing eye, a vent) and are not the combatant fading.
 */
function drawnOpacity(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".combatant")].map((c) => {
      let o = 1;
      for (
        let el: HTMLElement | null = c.querySelector(".combatant-rig");
        el && el !== c.parentElement;
        el = el.parentElement
      )
        o *= Number(getComputedStyle(el).opacity);
      return {
        name: c.querySelector(".combatant-name")?.textContent,
        opacity: o,
      };
    }),
  );
}

/** Which combatants carry the target mark, by side. */
function marks(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".combatant")].map((c) => {
      const mark = c.querySelector(".combatant-mark");
      const plate = c.querySelector(".combatant-plate")!;
      const b = mark?.getBoundingClientRect();
      return {
        side: c.dataset.side,
        alive: !("down" in c.dataset),
        marked: "marked" in c.dataset,
        ground: !!b && b.width > 4 && b.height > 4,
        plate: getComputedStyle(plate, "::before").content !== "none",
      };
    }),
  );
}

test.describe("picking a target never ghosts the field", () => {
  test("no combatant fades while an enemy target is picked", async ({
    page,
  }) => {
    await lab(page, { party: 4 });
    await choose(page, "Shieldbreaker");
    const drawn = await drawnOpacity(page);
    expect(drawn.length).toBeGreaterThan(4);
    expect(drawn.filter((d) => d.opacity < 1)).toEqual([]);
  });

  test("no combatant fades while an ally target is picked", async ({
    page,
  }) => {
    await lab(page, { party: 4 });
    await choose(page, "Intercept");
    expect((await drawnOpacity(page)).filter((d) => d.opacity < 1)).toEqual([]);
  });

  test("no combatant fades while a healer picks who to mend", async ({
    page,
  }) => {
    await lab(page, {
      party: 4,
      heroes: "warden,vanguard,arcanist,ranger",
    });
    await choose(page, "Mending roots");
    expect((await drawnOpacity(page)).filter((d) => d.opacity < 1)).toEqual([]);
  });
});

test.describe("legal targets are marked, and only they are", () => {
  test("an enemy-targeted ability marks every living enemy and no hero", async ({
    page,
  }) => {
    await lab(page, { encounter: "hunting-pack", party: 4 });
    // Choosing, not yet targeting: nothing is marked.
    expect((await marks(page)).filter((m) => m.marked)).toEqual([]);

    await choose(page, "Shieldbreaker");
    const all = await marks(page);
    const enemies = all.filter((m) => m.side === "enemy" && m.alive);
    const heroes = all.filter((m) => m.side === "hero");
    expect(enemies.length).toBeGreaterThan(2);
    for (const m of enemies)
      expect(m).toMatchObject({ marked: true, ground: true, plate: true });
    for (const m of heroes)
      expect(m).toMatchObject({ marked: false, ground: false, plate: false });
  });

  test("an ally-targeted ability marks the party and no enemy", async ({
    page,
  }) => {
    await lab(page, { party: 4 });
    await choose(page, "Intercept");
    const all = await marks(page);
    for (const m of all.filter((m) => m.side === "hero"))
      expect(m).toMatchObject({ marked: true, ground: true, plate: true });
    for (const m of all.filter((m) => m.side === "enemy"))
      expect(m).toMatchObject({ marked: false, ground: false, plate: false });
  });

  test("the chosen target is ringed, and backing out clears every mark", async ({
    page,
  }) => {
    await lab(page, { encounter: "hunting-pack", party: 4 });
    await choose(page, "Shieldbreaker");
    const target = page.locator(".combatant[data-side='enemy']").nth(1);
    await target.locator(".combatant-body").click();
    await expect(target.locator(".combatant-ring")).toHaveCount(1);
    // The ring replaces the floor brackets rather than stacking on them.
    await expect(target.locator(".combatant-mark")).toBeHidden();

    await page.locator(".commit-back").click();
    await expect(page.locator(".combatant[data-marked]")).toHaveCount(0);
    await expect(page.locator(".combatant-mark")).toHaveCount(0);
  });

  test("a combatant that cannot be picked stays inert under the pointer", async ({
    page,
  }) => {
    await lab(page, { encounter: "hunting-pack", party: 4 });
    await choose(page, "Shieldbreaker");
    // A back-row hero: never covered by the fan, always a non-target here.
    const hero = page.locator(".combatant[data-side='hero']").last();
    const body = hero.locator(".combatant-body");
    const before = await body.evaluate((el) => ({
      filter: getComputedStyle(el.querySelector(".combatant-sprite")!).filter,
    }));
    await body.hover({ force: true });
    const during = await body.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        cursor: s.cursor,
        background: s.backgroundColor,
        transform: s.transform,
        filter: getComputedStyle(el.querySelector(".combatant-sprite")!).filter,
      };
    });
    expect(during.cursor).toBe("default");
    expect(during.filter).toBe(before.filter);
    expect(during.background).toBe("rgba(0, 0, 0, 0)");
    expect(during.transform).toBe("none");
  });

  test("hovering a legal target lights it without painting a button", async ({
    page,
  }) => {
    await lab(page, { encounter: "hunting-pack", party: 4 });
    await choose(page, "Shieldbreaker");
    const body = page
      .locator(".combatant[data-side='enemy'] .combatant-body")
      .first();
    await body.hover();
    const s = await body.evaluate((el) => {
      const c = getComputedStyle(el);
      return {
        cursor: c.cursor,
        background: c.backgroundColor,
        transform: c.transform,
      };
    });
    expect(s.cursor).toBe("pointer");
    // The shell's button hover used to fill the whole square behind the art.
    expect(s.background).toBe("rgba(0, 0, 0, 0)");
    expect(s.transform).toBe("none");
  });
});

/** Every chip that collides with a plate or a chip, or leaves the viewport. */
function chipFaults(page: Page) {
  return page.evaluate(() => {
    const units = [...document.querySelectorAll<HTMLElement>(".combatant")];
    const chips = units
      .map((u) => ({ u, el: u.querySelector(".intent-chip") }))
      .filter((c): c is { u: HTMLElement; el: Element } => !!c.el)
      .map((c) => ({ ...c, b: c.el.getBoundingClientRect() }))
      .filter((c) => c.b.width > 0);
    const plates = units.map((u) => ({
      u,
      name: u.querySelector(".combatant-name")?.textContent,
      b: u.querySelector(".combatant-plate")!.getBoundingClientRect(),
    }));
    const hit = (a: DOMRect, c: DOMRect) =>
      Math.min(a.right, c.right) - Math.max(a.left, c.left) > 0.5 &&
      Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 0.5;
    const faults: string[] = [];
    chips.forEach((c, i) => {
      const say = c.el.textContent;
      if (
        c.b.top < 0 ||
        c.b.left < 0 ||
        c.b.bottom > innerHeight ||
        c.b.right > innerWidth
      )
        faults.push(`off screen: ${say}`);
      for (const p of plates)
        if (p.u !== c.u && hit(c.b, p.b))
          faults.push(`"${say}" covers ${p.name}`);
      for (const o of chips.slice(i + 1))
        if (hit(c.b, o.b)) faults.push(`"${say}" covers "${o.el.textContent}"`);
    });
    return { count: chips.length, faults };
  });
}

/** Where the layout pass put each chip. */
const offsets = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".combatant-intent")].map(
      (el) => el.style.transform,
    ),
  );

test.describe("intent chips stay readable and on screen", () => {
  const fights = [
    { encounter: "furnace-watch" },
    { encounter: "hunting-pack" },
    { encounter: "smoke-line" },
    { encounter: "repair-detail" },
    { encounter: "toll-collectors" },
    { boss: "collector" },
    { boss: "miser" },
  ];
  for (const fight of fights) {
    const name = fight.encounter ?? fight.boss;
    test(`${name}: no chip covers a name plate or a chip, at any party size`, async ({
      page,
    }) => {
      test.setTimeout(60_000);
      for (const party of [4, 3, 2]) {
        await lab(page, { ...fight, party });
        const { count, faults } = await chipFaults(page);
        // A boss against two heroes comes alone, so one chip is a fight.
        expect(count, `${name} party ${party}`).toBeGreaterThan(0);
        expect(faults, `${name} party ${party}`).toEqual([]);
      }
    });
  }

  test("the 4-hero hunting party's Stoker no longer covers the Acolyte", async ({
    page,
  }) => {
    await lab(page, { encounter: "hunting-pack", party: 4 });
    const stoker = await page
      .locator(".combatant", { hasText: "Cinder Stoker" })
      .locator(".intent-chip")
      .boundingBox();
    const acolyte = await page
      .locator(".combatant", { hasText: "Ash Acolyte" })
      .locator(".combatant-plate")
      .boundingBox();
    const apart =
      stoker!.x + stoker!.width <= acolyte!.x ||
      acolyte!.x + acolyte!.width <= stoker!.x ||
      stoker!.y + stoker!.height <= acolyte!.y ||
      acolyte!.y + acolyte!.height <= stoker!.y;
    expect(apart).toBe(true);
  });

  test("chips hold still: targeting and time do not move them", async ({
    page,
  }) => {
    await lab(page, { encounter: "hunting-pack", party: 4, motion: 1 });
    const settled = await offsets(page);
    // At 720 this formation needs the layout pass; larger screens have room.
    if (page.viewportSize()!.height <= 720)
      expect(settled.some(Boolean)).toBe(true);
    await page.waitForTimeout(600);
    expect(await offsets(page)).toEqual(settled);
    // Marking the targets changes nothing any chip is laid out against.
    await choose(page, "Shieldbreaker");
    expect(await offsets(page)).toEqual(settled);
    await page
      .locator(".combatant[data-side='enemy'] .combatant-body")
      .first()
      .click();
    await page.waitForTimeout(600); // the camera leans toward the target
    expect(await offsets(page)).toEqual(settled);
    expect((await chipFaults(page)).faults).toEqual([]);
  });
});
