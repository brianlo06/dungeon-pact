import { test, expect, type Page } from "@playwright/test";

/*
 * Melee screening (see `shared/reach.ts`) means the first enemy body on the
 * field is frequently not a legal target for the ability just chosen, so every
 * one of these reaches for one the game will actually accept. The tests that
 * clicked blindly were written before screening existed and have been failing
 * since it landed.
 */
const ENEMY_TARGET =
  ".combatant[data-side='enemy'] .combatant-body:not([disabled])";

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

/**
 * What the field will actually accept, straight from the buttons. Marks exist
 * to show a player where an ability may be aimed, so the invariant worth
 * holding is that the two agree — not that any particular unit is marked,
 * which is a rule that has already changed twice.
 */
function legal(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".combatant")].map((c) => ({
      name: c.querySelector(".combatant-name")?.textContent ?? "",
      side: c.dataset.side,
      allowed: !c.querySelector<HTMLButtonElement>(".combatant-body")?.disabled,
    })),
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
    const allowed = await legal(page);
    // Shieldbreaker is melee, so the back rank is screened off and must not be
    // marked. Something has to be reachable or the assertion proves nothing.
    const reachable = allowed.filter((u) => u.side === "enemy" && u.allowed);
    expect(reachable.length).toBeGreaterThan(0);
    expect(reachable.length).toBeLessThan(
      allowed.filter((u) => u.side === "enemy").length,
    );
    all.forEach((m, i) => {
      const want = allowed[i].allowed && m.alive;
      expect({ name: allowed[i].name, ...m }).toMatchObject({
        name: allowed[i].name,
        marked: want,
        ground: want,
        plate: want,
      });
    });
    for (const m of all.filter((m) => m.side === "hero"))
      expect(m).toMatchObject({ marked: false, ground: false, plate: false });
  });

  test("an ally-targeted ability marks the party and no enemy", async ({
    page,
  }) => {
    await lab(page, { party: 4 });
    await choose(page, "Intercept");
    const all = await marks(page);
    const allowed = await legal(page);
    // Intercept takes someone else's hit, so the hero casting it is not a
    // legal target for it. Every other standing ally is.
    const allies = allowed.filter((u) => u.side === "hero" && u.allowed);
    expect(allies.length).toBeGreaterThan(1);
    all.forEach((m, i) => {
      const want = allowed[i].allowed && m.alive;
      expect({ name: allowed[i].name, ...m }).toMatchObject({
        name: allowed[i].name,
        marked: want,
        ground: want,
        plate: want,
      });
    });
    for (const m of all.filter((m) => m.side === "enemy"))
      expect(m).toMatchObject({ marked: false, ground: false, plate: false });
  });

  test("the chosen target is ringed, and backing out clears every mark", async ({
    page,
  }) => {
    await lab(page, { encounter: "hunting-pack", party: 4 });
    await choose(page, "Shieldbreaker");
    const target = page
      .locator(".combatant[data-side='enemy']")
      .filter({ has: page.locator(".combatant-body:not([disabled])") })
      .first();
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
    const body = page.locator(ENEMY_TARGET).first();
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

/**
 * What each combatant paints, where its name plate is, its chip and its paint
 * order. The figure is the drawing's own outline, glows aside, in whatever
 * pose it holds right now — not the square it is drawn in.
 */
function field(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".combatant")].map((u) => {
      const name = u.querySelector(".combatant-name")?.textContent?.trim();
      const svg = u.querySelector<SVGSVGElement>("svg.combatant-sprite");
      let figure: Record<string, number> | null = null;
      if (svg) {
        const glows = [...svg.querySelectorAll<SVGElement>(".ph-glow")];
        glows.forEach((g) => (g.style.display = "none"));
        const bb = svg.getBBox();
        glows.forEach((g) => (g.style.display = ""));
        // Through the whole transform, rig included, so a figure the rig has
        // turned — a fallen hero lying on the floor — is measured as drawn.
        const m = svg.getScreenCTM()!;
        const corners = [
          [bb.x, bb.y],
          [bb.x + bb.width, bb.y],
          [bb.x, bb.y + bb.height],
          [bb.x + bb.width, bb.y + bb.height],
        ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(m));
        figure = {
          left: Math.min(...corners.map((p) => p.x)),
          right: Math.max(...corners.map((p) => p.x)),
          top: Math.min(...corners.map((p) => p.y)),
          bottom: Math.max(...corners.map((p) => p.y)),
        };
      }
      const box = (el: Element | null) => {
        const r = el?.getBoundingClientRect();
        return r && r.width > 1
          ? { left: r.left, right: r.right, top: r.top, bottom: r.bottom }
          : null;
      };
      return {
        name,
        z: Number(u.style.zIndex),
        figure,
        plate: box(u.querySelector(".combatant-plate")),
        chip: box(u.querySelector(".intent-chip")),
        chipText: u.querySelector(".intent-chip")?.textContent,
      };
    }),
  );
}

type Rect = { left: number; right: number; top: number; bottom: number };
/** Overlap past the couple of pixels an idle sway accounts for. */
const covers = (a: Rect | null, b: Rect | null) =>
  !!a &&
  !!b &&
  Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;

const FIGHTS = [
  { encounter: "furnace-watch" },
  { encounter: "hunting-pack" },
  { encounter: "smoke-line" },
  { encounter: "repair-detail" },
  { encounter: "toll-collectors" },
  { boss: "collector" },
  { boss: "miser" },
];

test.describe("no figure is drawn over somebody's name plate", () => {
  for (const fight of FIGHTS) {
    const name = fight.encounter ?? fight.boss;
    test(`${name}: at any party size, with either line-up`, async ({
      page,
    }) => {
      test.setTimeout(90_000);
      const scenes = [
        "vanguard,arcanist,ranger,warden",
        "broker,herald,reaver,beguiler",
      ].flatMap((heroes) =>
        [4, 3, 2].map((party) => ({ heroes, party, downed: 0 })),
      );
      // A fallen hero lies across the floor, wider than it stood.
      scenes.push(
        { heroes: "vanguard,arcanist,ranger,warden", party: 4, downed: 1 },
        { heroes: "vanguard,arcanist,ranger,warden", party: 2, downed: 1 },
      );
      for (const { heroes, party, downed } of scenes) {
        await lab(page, { ...fight, party, heroes, downed });
        await page.evaluate(() => document.fonts.ready);
        await settledOffsets(page);
        // Long enough for a fall to have finished.
        if (downed) await page.waitForTimeout(900);
        const units = await field(page);
        const faults: string[] = [];
        // A nearer combatant paints later; its figure is the one on top.
        for (const a of units)
          for (const b of units)
            if (a !== b && a.z > b.z && covers(a.figure, b.plate))
              faults.push(`${a.name} covers ${b.name}'s plate`);
        expect(faults, `${name} party ${party} ${heroes} ${downed}`).toEqual(
          [],
        );
      }
    });
  }
});

test.describe("no intent chip sits on its own creature", () => {
  for (const fight of FIGHTS) {
    const name = fight.encounter ?? fight.boss;
    test(`${name}: planning and wind-up, at any party size`, async ({
      page,
    }) => {
      test.setTimeout(90_000);
      for (const stage of ["objective", "windup"])
        for (const party of [4, 3, 2]) {
          await lab(page, { ...fight, party, stage });
          await page.evaluate(() => document.fonts.ready);
          await settledOffsets(page);
          // Long enough for a held wind-up to have eased all the way in.
          await page.waitForTimeout(400);
          const faults = (await field(page))
            .filter((u) => covers(u.chip, u.figure))
            .map((u) => `"${u.chipText}" sits on ${u.name}`);
          expect(faults, `${name} ${stage} party ${party}`).toEqual([]);
          // A wind-up chip once dropped onto its creature to stay on screen;
          // it must now do neither, and still keep off plates and chips.
          if (stage === "windup")
            expect(
              (await chipFaults(page)).faults,
              `${name} windup party ${party}`,
            ).toEqual([]);
        }
    });
  }

  test("the Collector's raised key clears its own chip", async ({ page }) => {
    await lab(page, { boss: "collector", party: 4, stage: "windup" });
    await settledOffsets(page);
    await page.waitForTimeout(400);
    const collector = (await field(page)).find(
      (u) => u.name === "The Collector",
    )!;
    expect(collector.chipText).toContain("WINDUP");
    // Above its creature, and still over it.
    expect(collector.chip!.bottom).toBeLessThanOrEqual(collector.figure!.top);
    expect(collector.chip!.right).toBeGreaterThan(collector.figure!.left);
    expect(collector.chip!.left).toBeLessThan(collector.figure!.right);
  });
});

/** Where the layout pass put each chip. */
const offsets = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".combatant-intent")].map(
      (el) => el.style.transform,
    ),
  );

/**
 * The chip offsets once the layout has had its say. The pass rightly reruns
 * when a chip's box changes size, and the pixel font arriving changes every
 * chip's size — so on a loaded machine a reading taken at load can predate
 * the font. Wait for fonts, then for two identical readings.
 */
async function settledOffsets(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  let last = await offsets(page);
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(150);
    const now = await offsets(page);
    if (JSON.stringify(now) === JSON.stringify(last)) return now;
    last = now;
  }
  return last;
}

test.describe("the battlefield cannot be scrolled out from under the player", () => {
  test("focus and scrollIntoView leave the stage where it is", async ({
    page,
  }) => {
    await lab(page, { encounter: "hunting-pack", party: 4 });
    const moved = await page.evaluate(() => {
      const stage = document.querySelector<HTMLElement>(".stage")!;
      const battle = document.querySelector<HTMLElement>(".battle")!;
      // Everything a browser or a keyboard user can do to scroll a container.
      for (const el of document.querySelectorAll<HTMLElement>(
        ".combatant-body, .fan-slip > button",
      )) {
        el.focus();
        el.scrollIntoView({ block: "end", inline: "end" });
      }
      stage.scrollTop = 200;
      battle.scrollTop = 200;
      return [stage.scrollTop, stage.scrollLeft, battle.scrollTop];
    });
    expect(moved).toEqual([0, 0, 0]);
  });
});

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

  test("every attack shows how much damage it will do, as a figure with its unit", async ({
    page,
  }) => {
    await lab(page, { encounter: "hunting-pack", party: 3, stage: "opening" });
    const chips = await page.locator(".intent-chip").evaluateAll((els) =>
      els.map((e) => {
        const badge = e.querySelector<HTMLElement>(".intent-damage");
        const box = badge?.getBoundingClientRect();
        return {
          forecast: e.getAttribute("data-damage"),
          value: badge?.querySelector(".intent-dmg-value")?.textContent ?? null,
          unit: badge?.querySelector(".intent-dmg-unit")?.textContent ?? null,
          label: badge?.getAttribute("aria-label") ?? null,
          height: box ? Math.round(box.height) : 0,
        };
      }),
    );
    const attacks = chips.filter((c) => c.forecast);
    // The hunting pack opens with at least two attacks on the party.
    expect(attacks.length).toBeGreaterThanOrEqual(2);
    for (const c of attacks) {
      // The figure on the chip is the engine's forecast, labelled as damage.
      expect(c.value).toBe(c.forecast);
      expect(c.unit).toBe("dmg");
      expect(c.label).toBe(`${c.forecast} damage`);
      // Big enough to read at a glance: taller than the chip's small print.
      expect(c.height).toBeGreaterThanOrEqual(12);
    }
    // A move that hurts nobody carries no damage badge.
    for (const c of chips.filter((x) => !x.forecast)) expect(c.value).toBeNull();
  });

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
    const settled = await settledOffsets(page);
    // At 720 this formation needs the layout pass; larger screens have room.
    if (page.viewportSize()!.height <= 720)
      expect(settled.some(Boolean)).toBe(true);
    await page.waitForTimeout(600);
    expect(await offsets(page)).toEqual(settled);
    // Marking the targets changes nothing any chip is laid out against.
    await choose(page, "Shieldbreaker");
    expect(await offsets(page)).toEqual(settled);
    await page.locator(ENEMY_TARGET).first().click();
    await page.waitForTimeout(600); // the camera leans toward the target
    expect(await offsets(page)).toEqual(settled);
    expect((await chipFaults(page)).faults).toEqual([]);
  });
});
