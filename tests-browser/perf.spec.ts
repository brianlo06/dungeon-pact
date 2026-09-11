import { test, expect, type Page } from "@playwright/test";

/**
 * The battle stage's frame rate, held by structure.
 *
 * `tests/perf-css.test.ts` holds the stylesheet to the rules a profile of the
 * boss stages produced. These check the same rules on the running page, where
 * the cascade, the animator and the creatures' own markup have all had their
 * say: nothing that holds a moving figure is filtered, every drawn shape still
 * carries its depth tone, nothing blends, and exactly the parts the animator
 * moves are promoted to their own layers.
 *
 * A frame-time check is here too, but it is informational: headless Chromium
 * renders in software on a shared machine, so it only fails on a stall.
 */

const SCENES = {
  collector: { boss: "collector", party: 4, stage: "objective", motion: 1 },
  miser: { boss: "miser", party: 4, stage: "resolved", motion: 1 },
  forge: { encounter: "smoke-line", party: 4, motion: 1 },
  debt: { encounter: "toll-collectors", party: 4, motion: 1 },
} as const;

async function open(page: Page, params: Record<string, string | number>) {
  const q = new URLSearchParams({ viewport: "fit", ...(params as never) });
  await page.goto(`/dev/bosses.html?${q}`);
  await page.locator(".stage").waitFor();
  // Skip a boss's entrance; the stage underneath is what is being checked.
  if (await page.locator(".boss-intro").count()) {
    await page.keyboard.press("Escape");
    await page.locator(".boss-intro").waitFor({ state: "detached" });
  }
  // Let every animator register its parts and write a few frames.
  await page.waitForFunction(() =>
    [...document.querySelectorAll<SVGElement>(".combatant-rig svg g")].some(
      (g) => !!g.style.transform,
    ),
  );
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
}

for (const [name, params] of Object.entries(SCENES)) {
  test.describe(`the ${name} stage`, () => {
    test("filters no figure as a whole, and blends nothing", async ({
      page,
    }) => {
      await open(page, params);
      const found = await page.evaluate(() => {
        const out: string[] = [];
        const whole = document.querySelectorAll<HTMLElement>(
          ".world, .layer-units, .combatant, .combatant-body, .combatant-rig",
        );
        for (const el of whole) {
          // The Strongbox's idle tick is an authored flash on its rig.
          if (el.matches(".combatant-rig") && el.querySelector(".vault"))
            continue;
          // So is a held wind-up's pulse: the threat, flashing on purpose
          // (see `tests/perf-css.test.ts`). This stage used to be checked
          // while it replayed the fixture's round on load, before the Miser
          // took up its wind-up; a first board is no longer replayed.
          if (el.matches(".combatant-rig[data-clip='windup']")) continue;
          const f = getComputedStyle(el).filter;
          if (f !== "none") out.push(`${el.className}: filter ${f}`);
        }
        for (const el of document.querySelectorAll<Element>(".stage *")) {
          const b = getComputedStyle(el).mixBlendMode;
          if (b !== "normal")
            out.push(`${el.getAttribute("class")}: blend ${b}`);
        }
        return { out, checked: whole.length };
      });
      expect(found.checked).toBeGreaterThan(10);
      expect(found.out).toEqual([]);
    });

    test("tones every drawn shape for its depth", async ({ page }) => {
      await open(page, params);
      const { shapes, untoned } = await page.evaluate(() => {
        const skip =
          "g, svg, defs, defs *, linearGradient, radialGradient, stop, tspan";
        const shapes = [
          ...document.querySelectorAll<Element>(".combatant-rig *"),
        ].filter((el) => !el.matches(skip));
        const untoned = shapes
          .filter(
            (el) => !/saturate\(|grayscale\(/.test(getComputedStyle(el).filter),
          )
          .map(
            (el) =>
              `${el.closest("svg")?.getAttribute("class")?.split(" ")[0]} ${el.tagName}.${el.getAttribute("class") ?? ""}`,
          );
        return { shapes: shapes.length, untoned: [...new Set(untoned)] };
      });
      expect(shapes).toBeGreaterThan(200);
      expect(untoned).toEqual([]);
    });

    test("promotes exactly the parts the animator moves", async ({ page }) => {
      await open(page, params);
      const { moved, wrong } = await page.evaluate(() => {
        const wrong: string[] = [];
        let moved = 0;
        for (const el of document.querySelectorAll<SVGElement>(
          ".combatant-rig svg *",
        )) {
          const isMoved = !!el.style.transform;
          const promoted =
            getComputedStyle(el).willChange.includes("transform");
          if (isMoved) moved++;
          if (isMoved !== promoted)
            wrong.push(
              `${el.closest("svg")?.getAttribute("class")?.split(" ")[0]} ${el.tagName}.${el.getAttribute("class") ?? ""} moved=${isMoved} promoted=${promoted}`,
            );
        }
        return { moved, wrong };
      });
      expect(moved).toBeGreaterThan(20);
      expect(wrong).toEqual([]);
    });
  });
}

test("a boss stage keeps its frame rate (informational)", async ({
  page,
}, info) => {
  // One resolution is enough, and the largest is the most expensive.
  test.skip(info.project.name !== "1920x1080", "measured at 1920×1080 only");
  await open(page, SCENES.collector);
  const deltas = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const d: number[] = [];
        let last = 0;
        const step = (t: number) => {
          if (last) d.push(t - last);
          last = t;
          if (d.length < 180) requestAnimationFrame(step);
          else resolve(d);
        };
        requestAnimationFrame(step);
      }),
  );
  const sorted = [...deltas].sort((a, b) => a - b);
  const at = (p: number) => sorted[Math.floor(p * (sorted.length - 1))];
  const dropped = deltas.reduce(
    (n, d) => n + Math.max(0, Math.round(d / 16.67) - 1),
    0,
  );
  info.annotations.push({
    type: "frames",
    description: `median ${at(0.5).toFixed(1)}ms, p95 ${at(0.95).toFixed(1)}ms, worst ${sorted.at(-1)!.toFixed(1)}ms, ${dropped} vsyncs missed over ${deltas.length} frames`,
  });
  // Only a stall fails this: software rendering on a busy machine is slow,
  // but it is not five times slower than a frame.
  expect(at(0.5)).toBeLessThan(80);
});
