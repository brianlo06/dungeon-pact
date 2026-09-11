import { test, expect, type Page } from "@playwright/test";

/**
 * The party is drawn, not cut from the atlas.
 *
 * Every hero is an authored cutout rig in combat and the same art at rest
 * everywhere else a hero appears — the lobby, the party HUD, the results and
 * the guild hall. These check that no hero atlas cell survives anywhere, that
 * each rig is actually being driven, and that nothing mirrors a hero away from
 * the enemies it faces.
 */

const PARTY = [
  ["vanguard", "arcanist", "ranger", "warden"],
  ["broker", "herald", "reaver", "beguiler"],
] as const;
const HEROES: string[] = PARTY.flat();

async function lab(page: Page, params: Record<string, string | number>) {
  const q = new URLSearchParams({ viewport: "fit", ...(params as never) });
  await page.goto(`/dev/bosses.html?${q}`);
  await page.locator(".stage").waitFor();
}

/** Any hero still rendered as an atlas cell, anywhere on the page. */
function atlasHeroes(page: Page) {
  return page.evaluate((heroes) => {
    return [...document.querySelectorAll<HTMLElement>(".sprite")]
      .filter((el) => heroes.some((h) => el.classList.contains(`sprite-${h}`)))
      .filter((el) =>
        getComputedStyle(el).backgroundImage.includes("characters"),
      )
      .map((el) => el.className);
  }, HEROES);
}

/**
 * Mount one of the out-of-combat screens with a real snapshot. The lab page
 * already carries the game's stylesheet and React; this renders the actual
 * screen component into it, so no room server is needed.
 */
async function screen(page: Page, kind: "lobby" | "results", heroes: string[]) {
  await lab(page, { party: 4, stage: "objective" });
  await page.evaluate(
    async ({ kind, heroes }) => {
      const urls = performance.getEntriesByType("resource").map((e) => e.name);
      const dep = (frag: string) => urls.find((u) => u.includes(frag))!;
      const R = await import(/* @vite-ignore */ dep("/deps/react.js"));
      const D = await import(
        /* @vite-ignore */ dep("/deps/react-dom_client.js")
      );
      const React = R.default ?? R;
      const createRoot = D.createRoot ?? D.default.createRoot;
      const screens = await import(
        /* @vite-ignore */ "/src/client/components/RunScreens.tsx"
      );
      const game = await import(/* @vite-ignore */ "/src/engine/game.ts");
      let s = game.createRun("PARTY", "party-spec");
      heroes.forEach((hero: string, i: number) => {
        game.addPlayer(s, `p${i}`, `Hero ${i}`);
        s = game.reduce(s, `p${i}`, { type: "hero", hero }, 0);
      });
      const snap = game.snapshot(
        s,
        "p0",
        heroes.map((_: string, i: number) => `p${i}`),
      );
      document.getElementById("root")!.remove();
      const host = document.createElement("div");
      host.className = "app-shell";
      document.body.appendChild(host);
      const h = React.createElement;
      createRoot(host).render(
        kind === "lobby"
          ? h(
              "main",
              { className: "game-main phase-lobby" },
              h(screens.Lobby, { s: snap, send: () => {}, disabled: false }),
            )
          : h(
              "main",
              { className: "game-main phase-complete" },
              h(screens.Results, {
                s: { ...snap, phase: "COMPLETE", outcome: "victory" },
                onLeave: () => {},
              }),
            ),
      );
    },
    { kind, heroes },
  );
}

for (const group of PARTY) {
  test.describe(`in combat: ${group.join(", ")}`, () => {
    test("each hero is authored art with driven parts, facing the enemy", async ({
      page,
    }) => {
      await lab(page, {
        encounter: "furnace-watch",
        party: 4,
        heroes: group.join(","),
        stage: "objective",
        // Motion on: under reduced motion the idles are still.
        motion: 1,
      });
      const read = () =>
        page.evaluate(
          (ids) => {
            return ids.map((id) => {
              const svg = document.querySelector<SVGSVGElement>(
                `.combatant [data-hero="${id}"]`,
              );
              const unit = svg?.closest(".combatant");
              const parts = svg
                ? [...svg.querySelectorAll<SVGGElement>("[data-part]")].map(
                    (p) => p.style.transform,
                  )
                : [];
              // Everything between the art and the combatant, the art included.
              const chain: Element[] = [];
              for (
                let el: Element | null = svg;
                el && el !== unit;
                el = el.parentElement
              )
                chain.push(el);
              const mirrored = chain.some((el) => {
                const m = getComputedStyle(el).transform;
                if (!m || m === "none") return false;
                const a = Number(m.slice(m.indexOf("(") + 1).split(",")[0]);
                return a < 0;
              });
              return {
                id,
                found: !!svg,
                atlas: unit ? unit.querySelectorAll(".sprite").length : -1,
                parts,
                mirrored,
                rig: (
                  unit?.querySelector(".combatant-rig") as HTMLElement | null
                )?.style.transform,
              };
            });
          },
          group as unknown as string[],
        );

      const before = await read();
      await page.waitForTimeout(900);
      const after = await read();
      for (const [i, hero] of after.entries()) {
        expect(hero.found, hero.id).toBe(true);
        expect(hero.atlas, `${hero.id} atlas cells`).toBe(0);
        expect(hero.parts.length, `${hero.id} parts`).toBeGreaterThanOrEqual(4);
        // Every part is being written by the animator...
        expect(hero.parts.every(Boolean), `${hero.id} parts driven`).toBe(true);
        // ...and the idle actually moves them.
        expect(
          hero.parts.some((t, j) => t !== before[i].parts[j]),
          `${hero.id} parts moving`,
        ).toBe(true);
        expect(hero.mirrored, `${hero.id} mirrored`).toBe(false);
      }
      // Idles run out of phase, so the party does not breathe in lockstep.
      expect(new Set(after.map((h) => h.rig)).size).toBe(after.length);
    });
  });
}

test("a downed hero lies down, away from the enemy", async ({ page }) => {
  await lab(page, {
    encounter: "furnace-watch",
    party: 4,
    heroes: "broker,herald,reaver,beguiler",
    stage: "objective",
    downed: 1,
  });
  const rig = page.locator(".combatant[data-down] .combatant-rig");
  await expect(rig).toHaveCount(1);
  await expect(
    page.locator(".combatant[data-down] [data-hero]"),
  ).toHaveAttribute("data-hero", "beguiler");
  // The fall ends rotated back past sixty degrees and stays there.
  await expect
    .poll(async () => {
      const t = await rig.evaluate((el) => (el as HTMLElement).style.transform);
      return Number(/rotate\((-?[\d.]+)deg\)/.exec(t)?.[1] ?? 0);
    })
    .toBeLessThan(-60);
});

test("the party HUD shows drawn portraits, not atlas cells", async ({
  page,
}) => {
  await lab(page, { party: 4, stage: "objective" });
  const portraits = page.locator(".hud-portrait");
  await expect(portraits).toHaveCount(4);
  await expect(
    page.locator(".hud-portrait .sprite-drawn svg[data-hero]"),
  ).toHaveCount(4);
  // Cropped to head and shoulders: the portrait is not the whole 100×100 frame.
  const box = await page
    .locator(".hud-portrait svg[data-hero]")
    .first()
    .getAttribute("viewBox");
  expect(box).not.toBe("0 0 100 100");
  expect(await atlasHeroes(page)).toEqual([]);
});

test("the lobby draws all eight heroes and no atlas cell", async ({ page }) => {
  await screen(page, "lobby", ["vanguard", "reaver"]);
  await expect(page.locator(".hero-choice")).toHaveCount(8);
  for (const id of HEROES)
    await expect(
      page.locator(`.hero-${id} .hero-stage svg[data-hero="${id}"]`),
    ).toBeVisible();
  expect(await atlasHeroes(page)).toEqual([]);
});

test("the results screen draws the party", async ({ page }) => {
  await screen(page, "results", ["herald", "warden", "beguiler"]);
  await expect(page.locator(".results-party svg[data-hero]")).toHaveCount(3);
  expect(await atlasHeroes(page)).toEqual([]);
});

test("the guild hall draws its party", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".scene-party svg[data-hero]")).toHaveCount(4);
  expect(await atlasHeroes(page)).toEqual([]);
});
