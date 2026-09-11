import { test, expect, type Page } from "@playwright/test";

/**
 * The Miser, the Rivet Sniper and the Coin Leech are drawn, not placeheld.
 *
 * Same contract as the Collector's creatures: each is authored SVG rather than
 * an atlas cell, has named parts the animator is actually driving, and faces
 * the party. The Miser also has to show its objective — the pact's gold as its
 * armour — in the art itself, and dominate the Counting House without leaving
 * the stage.
 */

const scene = (params: Record<string, string | number> = {}) =>
  `/dev/bosses.html?${new URLSearchParams({ viewport: "fit", ...(params as never) })}`;

async function open(page: Page, params: Record<string, string | number>) {
  await page.goto(scene(params));
  await page.locator(".battle").waitFor();
  await page.addStyleTag({
    content: ".preview-toolbar{display:none!important}",
  });
  await page.locator(".stage").waitFor();
}

/** Every creature this run drew, where it can be found, and its CSS class. */
const CREATURES: [string, string, Record<string, string | number>][] = [
  ["The Miser", ".miser", { boss: "miser", party: 4, stage: "objective" }],
  [
    "Rivet Sniper",
    ".sniper",
    { encounter: "hunting-pack", party: 2, stage: "objective" },
  ],
  [
    "Coin Leech",
    ".leech",
    { encounter: "toll-collectors", party: 4, stage: "objective" },
  ],
];

const partTransforms = (page: Page, sel: string) =>
  page.evaluate(
    (s) =>
      [...document.querySelectorAll(`${s} [data-part]`)].map(
        (el) => (el as SVGElement).style.transform,
      ),
    sel,
  );

test.describe("the debt creatures are drawn, not placeheld", () => {
  for (const [name, sel, params] of CREATURES) {
    test(`${name} is authored art with moving parts`, async ({ page }) => {
      await open(page, params);
      const unit = page.locator(".combatant", {
        has: page.locator(`.combatant-name:text-is("${name}")`),
      });
      await expect(unit.locator(sel)).toBeVisible();
      // Not an atlas cell.
      await expect(unit.locator(".sprite")).toHaveCount(0);

      // Named parts, every one of them driven, and not all the same way. Wait
      // for the animator's first frame rather than assume it has happened: on
      // a loaded worker the page can be up before the clock has ticked.
      await expect
        .poll(async () => (await partTransforms(page, sel)).every(Boolean))
        .toBe(true);
      const before = await partTransforms(page, sel);
      expect(before.length, sel).toBeGreaterThanOrEqual(4);
      expect(before.every(Boolean), sel).toBe(true);
      await page.waitForTimeout(900);
      const after = await partTransforms(page, sel);
      expect(new Set(after).size, sel).toBeGreaterThan(1);
      expect(
        after.some((t, i) => t !== before[i]),
        sel,
      ).toBe(true);
    });

    test(`${name} faces the party rather than away from it`, async ({
      page,
    }) => {
      await open(page, params);
      // The whole chain of transforms, not just the element's own: the atlas
      // flip, a stray scaleX(-1) on a wrapper and the animator all end up here.
      const facing = await page.evaluate((s) => {
        const svg = document.querySelector(s) as SVGSVGElement;
        return {
          own: getComputedStyle(svg).transform,
          screen: svg.getScreenCTM()!.a,
        };
      }, sel);
      expect(facing.own.startsWith("matrix(-1")).toBe(false);
      expect(facing.screen).toBeGreaterThan(0);
    });
  }
});

test.describe("the Counting House is authored throughout", () => {
  test("no enemy at four heroes is an atlas sprite", async ({ page }) => {
    await open(page, { boss: "miser", party: 4, stage: "objective" });
    for (const sel of [".miser", ".mender", ".bulwark"])
      await expect(page.locator(sel)).toBeVisible();
    await expect(
      page.locator(".combatant[data-side='enemy'] .sprite"),
    ).toHaveCount(0);
  });

  test("the Miser dominates the frame and stays on the stage", async ({
    page,
  }) => {
    for (const party of [2, 3, 4]) {
      await open(page, { boss: "miser", party, stage: "objective" });
      const sizes = await page.evaluate(() => {
        const stage = document.querySelector(".stage")!.getBoundingClientRect();
        const bodies = [...document.querySelectorAll(".combatant")].map(
          (el) => ({
            miser: !!el.querySelector(".miser"),
            height: el.querySelector(".combatant-body")!.getBoundingClientRect()
              .height,
          }),
        );
        // What is actually painted, not just the box it is painted in: an
        // authored creature's content box, in screen pixels.
        const painted = (sel: string) => {
          const svg = document.querySelector(sel) as SVGSVGElement | null;
          if (!svg) return null;
          const box = svg.getBBox();
          const k = svg.getBoundingClientRect().width / 100;
          const r = svg.getBoundingClientRect();
          return {
            area: box.width * box.height * k * k,
            top: r.top + box.y * k,
            left: r.left + box.x * k,
            right: r.left + (box.x + box.width) * k,
          };
        };
        return {
          miser: bodies.find((b) => b.miser)!.height,
          others: bodies.filter((b) => !b.miser).map((b) => b.height),
          art: painted(".miser")!,
          rivals: [painted(".mender"), painted(".bulwark")]
            .filter(Boolean)
            .map((p) => p!.area),
          stage: { top: stage.top, left: stage.left, right: stage.right },
        };
      });
      // The biggest box on the field at every party size...
      for (const h of sizes.others)
        expect(sizes.miser, `party ${party}`).toBeGreaterThan(h);
      // ...and far more painted in it than its support creatures.
      for (const area of sizes.rivals)
        expect(sizes.art.area, `party ${party}`).toBeGreaterThan(area * 1.4);
      // ...and all of it on the stage, crest and reaching hand included.
      expect(sizes.art.top).toBeGreaterThanOrEqual(sizes.stage.top);
      expect(sizes.art.left).toBeGreaterThanOrEqual(sizes.stage.left);
      expect(sizes.art.right).toBeLessThanOrEqual(sizes.stage.right);
    }
  });

  test("its treasury armour is visible in the art", async ({ page }) => {
    // A pact that spent its gold faces a bare thing with empty settings.
    await open(page, {
      boss: "miser",
      party: 4,
      stage: "objective",
      gold: 100,
    });
    const poor = page.locator(".miser");
    await expect(poor).toHaveAttribute("data-hoard", "bare");
    await expect(poor).toHaveAttribute("data-shield", "0");
    await expect(page.locator(".msr-coin[data-lit]")).toHaveCount(0);
    await expect(page.locator(".msr-crest[data-lit]")).toHaveCount(0);
    const poorStacks = await page
      .locator(".miser [data-part='stacks'] rect")
      .count();

    // A pact sitting on its money faces something armoured and crested in it.
    await open(page, {
      boss: "miser",
      party: 4,
      stage: "objective",
      gold: 700,
    });
    const rich = page.locator(".miser");
    await expect(rich).toHaveAttribute("data-hoard", "hoarding");
    expect(await page.locator(".msr-coin[data-lit]").count()).toBeGreaterThan(
      15,
    );
    expect(await page.locator(".msr-crest[data-lit]").count()).toBeGreaterThan(
      3,
    );
    expect(
      await page.locator(".miser [data-part='stacks'] rect").count(),
    ).toBeGreaterThan(poorStacks);
    // The art and the objective strip are reading the same number.
    const shield = await rich.getAttribute("data-shield");
    await expect(page.locator(".strip-objective")).toContainText(
      `+${shield} Barrier from your gold`,
    );
  });

  test("its attack is its own clip, played through the director", async ({
    page,
  }) => {
    await page.goto(
      scene({
        boss: "miser",
        party: 2,
        stage: "objective",
        motion: 1,
        tempo: 0.25,
      }),
    );
    await page.locator(".stage").waitFor();
    await page.keyboard.press("Space"); // skip the entrance
    // Record every frame the animator writes to the hand, rather than
    // sampling it: the tempo control does not always reach an animator that
    // registered before the lab applied it, and at full speed the swing is
    // over in a quarter of a second — easy for a poll to straddle.
    await page.evaluate(() => {
      const hand = document.querySelector(
        ".miser [data-part='hand']",
      ) as SVGElement;
      const w = window as unknown as { maxSwing: number };
      w.maxSwing = 0;
      new MutationObserver(() => {
        const deg = Number(
          /rotate\(([-\d.]+)deg/.exec(hand.style.transform)?.[1] ?? 0,
        );
        w.maxSwing = Math.max(w.maxSwing, Math.abs(deg));
      }).observe(hand, { attributes: true, attributeFilter: ["style"] });
    });
    await page.getByRole("button", { name: "Finish round" }).click();
    // The idle only ever tips the hand a few degrees; the fling takes it far
    // past that. Seeing it proves the rig is registered under the right key
    // and that the director's cast beat reaches it.
    await expect
      .poll(
        () =>
          page.evaluate(
            () => (window as unknown as { maxSwing: number }).maxSwing,
          ),
        { timeout: 20_000 },
      )
      .toBeGreaterThan(25);
  });

  test("it arrives with its own mark rather than the Collector's seal", async ({
    page,
  }) => {
    await open(page, {
      boss: "miser",
      party: 4,
      stage: "opening",
      motion: 1,
      tempo: 0.2,
    });
    const intro = page.locator(".boss-intro");
    await expect(intro).toHaveAttribute("data-boss", "miser");
    await expect(intro.locator(".intro-coin")).toHaveCount(1);
    await expect(intro.locator(".intro-name")).toHaveText("The Miser");
  });
});
