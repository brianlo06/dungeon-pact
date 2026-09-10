import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const battle = readFileSync("src/client/battle.css", "utf8");
const shell = readFileSync("src/client/style.css", "utf8");
const screen = readFileSync("src/client/components/Combat.tsx", "utf8");

/** The declared value of a custom property inside a rule. */
function tokenIn(css: string, selector: string, prop: string) {
  const rule = css.slice(css.indexOf(selector));
  const body = rule.slice(rule.indexOf("{"), rule.indexOf("}"));
  return body.match(new RegExp(`${prop}:\\s*([^;]+);`))?.[1]?.trim() ?? "";
}
/** Largest pixel value a clamp()/plain length can resolve to. */
function ceiling(value: string) {
  const clamp = value.match(/clamp\(([^)]*)\)/);
  const parts = (clamp ? clamp[1] : value).split(",").map((p) => p.trim());
  const px = parts
    .map((p) => Number(p.match(/^(\d+(?:\.\d+)?)px$/)?.[1]))
    .filter((n) => Number.isFinite(n)) as number[];
  return Math.max(...px);
}

/**
 * Combat must fit one viewport. This is a contract test on the rules that make
 * that true rather than a pixel measurement — the project has no headless
 * browser, and the layout was verified by hand at 1280×720, 1366×768, 1440×900
 * and 1920×1080 with zero overflow. What this catches is the way it regressed
 * before: a section quietly claiming a fixed height until the page needed more
 * room than it had.
 */
it("gives the stage every pixel the fixed bands do not claim", () => {
  // Exactly three rows, and only the middle one grows. minmax(0, …) is what
  // lets it shrink instead of pushing the controls off the bottom.
  expect(battle).toMatch(
    /grid-template-rows:\s*var\(--strip\)\s*minmax\(0,\s*1fr\)\s*auto/,
  );
  expect(battle).toMatch(/\.battle\s*\{[^}]*overflow:\s*hidden/);

  // The two fixed bands have to leave a usable stage at the smallest supported
  // height. 720 is the floor the design promises.
  const strip = ceiling(tokenIn(battle, ".battle {", "--strip"));
  const controls = ceiling(tokenIn(battle, ".battle {", "--controls"));
  expect(strip + controls).toBeLessThanOrEqual(720 - 380);
});

it("stops the document scrolling while a fight is on", () => {
  expect(shell).toMatch(
    /html:has\(\.app-shell\[data-combat\]\)[\s\S]{0,120}overflow:\s*hidden/,
  );
  // The chrome that frames every other phase gives up its height to the fight.
  expect(shell).toMatch(
    /\.app-shell\[data-combat\][\s\S]{0,200}\.run-footer\s*\{\s*display:\s*none/,
  );
  expect(shell).toMatch(/\.app-shell\[data-combat\]\s*\{[^}]*height:\s*100dvh/);
});

it("keeps the layout answerable to viewport height, not just width", () => {
  // Height is the binding constraint, so there must be height breakpoints.
  const heightQueries = battle.match(/@media\s*\(max-height:\s*\d+px\)/g) ?? [];
  expect(heightQueries.length).toBeGreaterThanOrEqual(2);
});

it("does not put the chronicle or a permanent ability dock on the screen", () => {
  // The old layout kept both open at all times; between them they were most of
  // the overflow. The history is opt-in and overlays rather than resizing.
  expect(screen).not.toMatch(/action-dock/);
  expect(screen).toMatch(/HistoryDrawer/);
  expect(battle).toMatch(/\.history-drawer\s*\{[^}]*position:\s*absolute/);
});

it("attaches enemy intentions to the creature rather than a detached card", () => {
  const stage = readFileSync("src/client/components/BattleStage.tsx", "utf8");
  expect(stage).toMatch(/combatant-intent|intent=\{/);
  expect(battle).toMatch(/\.combatant-intent/);
});
