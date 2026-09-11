import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { rigFor } from "../src/client/battle/rigs";
import { enemies } from "../src/content/enemies";
import { heroes } from "../src/content/heroes";

/**
 * The battle stage's frame rate, held by its structure rather than by a timer.
 *
 * Every figure on the stage is a cutout rig whose parts move every frame, and
 * the expensive mistakes are all of one kind: something that makes the
 * compositor redraw a moving figure offscreen, or makes the page re-lay itself
 * out, on every frame. Each was found by profiling a boss stage; each is
 * cheap to reintroduce by accident and invisible until a slow machine drops
 * frames. A frame-time threshold would be flaky; these rules are not.
 */

const FILES = [
  "src/client/battle.css",
  "src/client/stage-ui.css",
  "src/client/creatures-forge.css",
  "src/client/creatures-debt.css",
  "src/client/creatures-party.css",
] as const;

interface Rule {
  file: string;
  /** Enclosing at-rules, outermost first: "@media …", "@keyframes name". */
  within: string[];
  selector: string;
  body: string;
}

/** Every block that holds declarations, with the at-rules around it. */
function rules(file: string): Rule[] {
  const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  return rulesOf(css, file, []);
}
function rulesOf(css: string, file: string, within: string[]): Rule[] {
  const out: Rule[] = [];
  let head = "";
  let i = 0;
  while (i < css.length) {
    const c = css[i];
    if (c === "{") {
      const prelude = head.trim();
      head = "";
      const close = matching(css, i);
      const inner = css.slice(i + 1, close);
      if (prelude.startsWith("@") || inner.includes("{"))
        out.push(...rulesOf(inner, file, [...within, prelude]));
      else out.push({ file, within, selector: prelude, body: inner });
      i = close + 1;
      continue;
    }
    if (c === "}" || c === ";") head = "";
    else head += c;
    i++;
  }
  return out;
}
function matching(css: string, open: number) {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return i;
  }
  throw new Error("unbalanced braces");
}
/** A declaration's value, or null. Custom properties are not declarations. */
function value(body: string, prop: string) {
  const m = body.match(new RegExp(`(?:^|[;\\s])${prop}\\s*:\\s*([^;]+)`));
  return m ? m[1].trim() : null;
}
const ALL = FILES.flatMap(rules);
const where = (r: Rule) =>
  `${r.file}: ${[...r.within, r.selector].join(" › ")}`;

describe("the stage's frame-rate rules", () => {
  it("finds the rules it checks", () => {
    // A parser that silently read nothing would pass everything below.
    expect(ALL.length).toBeGreaterThan(300);
    expect(ALL.some((r) => r.selector === ".combatant")).toBe(true);
  });

  it("never filters a combatant, its body or its rig", () => {
    // A filter on anything holding the rig's parts is an offscreen pass per
    // figure per frame. The depth tone is applied to the shapes instead.
    const figure =
      /(^|[\s>+~,])\.(combatant|combatant-body|combatant-rig|world|layer-units)(\[[^\]]*\]|:[\w-]+(\([^)]*\))?)*\s*$/;
    const offenders = ALL.filter((r) =>
      r.selector.split(",").some((s) => figure.test(s.trim())),
    ).filter((r) => {
      const v = value(r.body, "filter");
      return v !== null && v !== "none";
    });
    expect(offenders.map(where)).toEqual([]);
  });

  it("applies the depth tone to every drawn shape", () => {
    const tone = ALL.find(
      (r) =>
        r.selector.includes(":where(.combatant-rig)") &&
        value(r.body, "filter") === "var(--tone)",
    );
    expect(tone, "the zero-specificity tone rule").toBeTruthy();
    // Groups and the SVG itself are excluded — toning a group that holds a
    // moving part is the offscreen pass again — and so is anything painted
    // only by reference.
    for (const skip of ["g", "svg", "defs", "linearGradient", "stop"])
      expect(tone!.selector).toMatch(new RegExp(`:not\\([^)]*\\b${skip}\\b`));
    const combatant = ALL.find((r) => r.selector === ".combatant")!;
    expect(value(combatant.body, "--tone")).toMatch(/saturate\(.*--depth/);
  });

  it("keeps the tone on any shape with a filter of its own", () => {
    // A glow's own `filter` beats the zero-specificity tone rule, so it must
    // carry the tone itself or that shape alone goes bright on the back row.
    // Filters on the figure as a whole (hover, heal and block glows over the
    // `.combatant-sprite`) and on screens that are not the stage are listed.
    const WHOLE_FIGURE_OR_OFF_STAGE = [
      /\.combatant-sprite$/,
      /^\.intro-seal$/,
      /^\.hud-hero/,
    ];
    const missing = ALL.filter(
      (r) => !r.within.some((w) => w.startsWith("@keyframes")),
    )
      .filter((r) => {
        const v = value(r.body, "filter");
        return v !== null && v !== "none" && !v.includes("var(--tone");
      })
      .filter(
        (r) =>
          !r.selector
            .split(",")
            .every((s) =>
              WHOLE_FIGURE_OR_OFF_STAGE.some((p) => p.test(s.trim())),
            ),
      );
    expect(missing.map(where)).toEqual([]);

    // Keyframes that animate a filter on a shape start from the tone, so the
    // lists interpolate instead of snapping. The Strongbox's lock engages on
    // its group, which is never toned.
    const keyed = ALL.filter(
      (r) =>
        r.within.some((w) => w.startsWith("@keyframes")) &&
        value(r.body, "filter") !== null,
    ).filter((r) => !r.within.some((w) => w === "@keyframes lock-engage"));
    for (const r of keyed)
      expect(value(r.body, "filter"), where(r)).toMatch(/^var\(--tone,\)/);
  });

  it("blends only what is lit", () => {
    // A blend mode isolates everything beneath it into an offscreen group,
    // every frame, even while the blending layer is invisible.
    const blends = ALL.filter((r) => {
      const v = value(r.body, "mix-blend-mode");
      return v !== null && v !== "normal";
    });
    expect(blends.length).toBeGreaterThan(0);
    for (const r of blends)
      expect(r.selector, where(r)).toMatch(/\[data-lit\]/);
  });

  it("never animates layout on the battle screen", () => {
    // A bar easing its width re-lays the whole battle grid out on every frame
    // it moves, and the stage's backdrop re-rasterises with it.
    const layout =
      /\b(width|height|top|left|right|bottom|margin[\w-]*|padding[\w-]*|inset|flex[\w-]*|grid[\w-]*|font-size)\b/;
    const offenders = ALL.filter((r) => {
      const v = value(r.body, "transition");
      return (
        v !== null &&
        layout.test(
          v.replace(/[\d.]+m?s|ease[\w-]*|linear|cubic-bezier\([^)]*\)/g, ""),
        )
      );
    });
    expect(offenders.map(where)).toEqual([]);
  });
});

describe("rigs", () => {
  /**
   * Flash is written as a filter on the whole rig, so a flash in a loop that
   * plays for as long as nothing is happening is an offscreen pass per frame
   * for the whole of planning. The Strongbox's tick is authored and listed;
   * a held windup flashes on purpose, since it is the threat.
   */
  const IDLE_FLASHES = new Set(["strongbox"]);
  const sets = [
    ...new Set([
      ...enemies.map((d) => d.presentation?.spriteSet),
      ...heroes.map((h) => h.id),
    ]),
  ].filter((s): s is string => !!s);

  it("covers every figure that has a rig", () => {
    expect(sets).toEqual(
      expect.arrayContaining(["collector", "miser", "vanguard"]),
    );
  });

  it("keeps flash out of idle loops", () => {
    const flashing = sets.filter((set) => {
      if (IDLE_FLASHES.has(set)) return false;
      const idle = rigFor(set).idle;
      const tracks = [idle?.poses ?? [], ...Object.values(idle?.parts ?? {})];
      return tracks.some((t) => t.some((p) => (p.flash ?? 0) > 0));
    });
    expect(flashing).toEqual([]);
  });
});
