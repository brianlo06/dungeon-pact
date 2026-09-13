import type { Cinematic } from "../../shared/cinematic";

/**
 * THE SMALL PRINT — the Broker · Assurer's Ultimate.
 *
 * The idea, in one sentence: the Assurer writes one policy long enough for the
 * whole party — it opens out of the Broker's hand fold after fold, a leaf behind
 * every ally — reads the small print once through its spectacles, and snaps the
 * whole thing taut so every fold stands up at once as a paper screen in front
 * of the one it covers.
 *
 * Only the Assurer could have it: the path's title (*Everyone is covered. Read
 * the small print later.*) is the plot, Indemnity — cover for a whole row,
 * bought with the treasury — is the kit, and the spectacles under the cap's
 * brim are the reader. Insurance is paper, so the film is paper: the space is
 * the policy itself, and everything in it happens by folding.
 *
 * Rhythm: identity (a thumb riffles a very long folded policy at the lens;
 * "Sign here, and here, and here") → stakes and escalation (the policy turns
 * over the lens and opens out behind the whole real party, a signature on the
 * leaf behind each; title) → quiet (the small print scrolls across the lenses;
 * the brows come down onto the rims and knit, and the mouth decides it is
 * fine; music to 4%, a watch ticking) → impact (a carbon-and-ink frame, the
 * crease across it, and every fold standing up as a screen in front of its
 * ally) → release (on the real board, a screen at every ally; the bill into
 * the treasury).
 *
 * Gameplay it shows: no enemy is in it, because nothing happens to one. The
 * whole real party, with its drawings and gear, is covered at the impact,
 * where the Barrier is revealed; the premium is the bill that flies into the
 * treasury on the way out; the catch is read on screen and said after.
 *
 * It shares nothing with Foreclosure: no vault, no balance, no coin, no brass
 * or green, no blow with the ledger; its quiet is reading, not a sound
 * stopping, and its impact is a crease, not a coin's milled rim. Nor with the
 * other films: no hall, forge, storm, wood, cutaway, ridge, pit, mirror room,
 * causeway, labyrinth or no-man's-land; no light, force, weather, glass,
 * ribbon, root, stroke or din. Storyboard: `docs/ultimates/small-print.md`.
 */

const CARBON = "#8b95ff";
const PAPER = "#efe3c6";
const UMBER = "#1a120b";
const BARS = 0.1;

export const smallPrint: Cinematic = {
  id: "small-print",
  heroId: "broker",
  motif: "print-motif",
  shots: [
    /* 0 · CALL — the Broker has paperwork. */
    {
      id: "call",
      kind: "call",
      purpose:
        "The round stops: the real battlefield sinks to umber, and the Broker's ledger hand goes into its coat and comes out with a fat folded policy, a fold flicking open.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [UMBER, 0], letterbox: 0 },
      toLighting: { tint: [UMBER, 0.52], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:print-produce" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: CARBON },
        { kind: "print-slip", at: 0.2, until: 1, anchor: "caster" },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.3, sfx: "print-rustle" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4300 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · RIFFLE — detail: a very long policy, riffled at the lens. */
    {
      id: "riffle",
      kind: "detail",
      purpose:
        "Identity. The policy held up at the lens in the ledger hand, a fat fan-fold whose leaves riffle past the thumb one after another — it is very long — while the Broker leans over it with a salesman's face: sign here, and here, and here.",
      space: "cinematic",
      ms: 600,
      fastMs: 380,
      transition: { kind: "black", ms: 70 },
      camera: {
        from: { x: 750, y: 640, zoom: 1.68, rotate: 8 },
        to: { x: 758, y: 630, zoom: 1.82, rotate: 5 },
        ease: "out",
      },
      background: "print-page",
      lighting: { exposure: 0.35, under: [PAPER, 0.35], rim: [CARBON, 0.5, 1], vignette: 0.7, letterbox: BARS },
      toLighting: { exposure: 0.45, under: [PAPER, 0.45], rim: [CARBON, 0.7, 1], vignette: 0.62, letterbox: BARS },
      actors: [{ role: "caster", at: [700, 1180], size: 1000, clip: "ult:print-riffle", then: "ult:print-riffle", look: "lit" }],
      vfx: [
        { kind: "print-wad", at: 0, until: 1, layer: "front", params: { ox: 0.02, oy: 0.41, w: 0.16, h: 0.14 } },
        { kind: "print-turn", at: 0.8, until: 1, layer: "screen", params: { mode: "out" } },
      ],
      sound: [
        { at: 0.06, sfx: "print-riffle" },
        { at: 0.78, sfx: "print-turn" },
      ],
      text: [{ kind: "voice", at: 0.15, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.1, label: "riffle" },
        { at: 0.8, label: "turn" },
      ],
    },

    /* 2 · POLICY — wide on the real party: it opens behind every one of them. */
    {
      id: "policy",
      kind: "wide-hero",
      purpose:
        "Stakes and escalation. The sheet turns off the lens onto the whole real party standing on the page, and the policy opens out of the Broker's hand behind them, fold after fold, a leaf behind each ally with a signature writing itself on it, while each looks down at it. Title.",
      space: "cinematic",
      ms: 1000,
      fastMs: 520,
      transition: { kind: "cut" },
      camera: {
        from: { x: 780, y: 560, zoom: 1.12 },
        to: { x: 820, y: 555, zoom: 1.18 },
        ease: "inOut",
      },
      background: "print-page",
      lighting: { exposure: 0.85, under: [PAPER, 0.25], rim: [CARBON, 0.6, 1], vignette: 0.42, letterbox: BARS },
      toLighting: { exposure: 0.92, under: [PAPER, 0.3], rim: [CARBON, 0.7, 1], vignette: 0.38, letterbox: BARS },
      actors: [
        { role: "caster", at: [290, 860], size: 420, clip: "ult:print-cast", then: "ult:print-cast", look: "lit", z: 3 },
        {
          role: "allies",
          at: [610, 820],
          spread: [285, -4],
          size: 360,
          look: "lit",
          z: 2,
          clip: "ult:print-look",
          then: "ult:print-look",
        },
      ],
      vfx: [
        { kind: "print-policy", at: 0, until: 1, layer: "back", params: { start: 0.1, end: 0.66, back: 30, height: 0.74, leaf: 0.34, minEnd: 1560 } },
        { kind: "print-turn", at: 0, until: 0.16, layer: "screen", params: { mode: "in" } },
      ],
      sound: [
        { at: 0.1, sfx: "print-unfold" },
        { at: 0.42, sfx: "print-motif" },
      ],
      text: [
        { kind: "name", at: 0.4, until: 1, text: "$name", x: 0.05, y: 0.16 },
        { kind: "epithet", at: 0.5, until: 1, text: "$epithet", x: 0.05, y: 0.25 },
      ],
      markers: [
        { at: 0.1, label: "opens" },
        { at: 0.4, label: "title" },
      ],
    },

    /* 3 · SMALL PRINT — the spectacles: the quiet. */
    {
      id: "small-print",
      kind: "extreme-close-up",
      purpose:
        "The quiet. Two lenses and the brows over them, dead still, with the page's edge held up under them: the small print scrolls across both lenses as the eyes run along it; the brows come down onto the rims and knit, the eyes narrow to slits, the lips press — and the mouth decides it is fine.",
      space: "cinematic",
      ms: 620,
      fastMs: 400,
      transition: { kind: "cut" },
      camera: {
        from: { x: 752, y: 512, zoom: 3.05 },
        to: { x: 752, y: 514, zoom: 3.14 },
        ease: "linear",
      },
      background: "print-page",
      lighting: { exposure: 0.14, under: [PAPER, 0.5], rim: [CARBON, 0.35, 1], vignette: 0.88, letterbox: 0.14 },
      toLighting: { exposure: 0.1, under: [PAPER, 0.6], rim: [CARBON, 0.45, 1], vignette: 0.92, letterbox: 0.14 },
      actors: [{ role: "caster", at: [700, 1500], size: 1600, clip: "ult:print-read", then: "ult:print-read", look: "lit", root: false }],
      vfx: [
        { kind: "print-lens", at: 0, until: 1, follow: "caster", x: 44, y: -1035, layer: "front", params: { r: 33, gap: 78 } },
        { kind: "print-margin", at: 0, until: 1, layer: "screen" },
      ],
      duck: [{ at: 0, level: 0.04, ms: 700 }],
      sound: [
        { at: 0.04, sfx: "print-tick", mode: "full" },
        { at: 0.04, sfx: "print-tick-fast", mode: "fast" },
      ],
      markers: [
        { at: 0.5, label: "the clause" },
        { at: 0.9, label: "fine" },
      ],
    },

    /* 4 · COVERED — the snap: every fold stands up. */
    {
      id: "covered",
      kind: "impact",
      purpose:
        "Impact. On a carbon-and-ink frame the Broker cracks the policy taut with a shout, the crease snaps across the frame throwing slivers of paper, and every fold stands up at once as a screen in front of the one it covers — the Broker's first, then down the whole real party.",
      space: "cinematic",
      ms: 780,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 780, y: 610, zoom: 1.5, rotate: -8 },
        to: { x: 790, y: 598, zoom: 1.32, rotate: -3 },
        ease: "out",
      },
      background: "print-page",
      lighting: { exposure: 1, tint: [CARBON, 0.1], under: [PAPER, 0.16], back: [CARBON, 0.35], rim: [CARBON, 1, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.88, tint: [CARBON, 0], under: [PAPER, 0.14], back: [CARBON, 0.12], rim: [CARBON, 0.8, 1], vignette: 0.4, letterbox: BARS },
      actors: [
        { role: "caster", at: [420, 900], size: 560, clip: "ult:print-snap", then: "ult:print-snap", look: "lit", z: 3 },
        {
          role: "allies",
          at: [760, 830],
          spread: [215, -46],
          size: 380,
          look: "lit",
          z: 1,
          react: [{ at: 0.06, clip: "block", then: "idle" }],
        },
      ],
      vfx: [
        { kind: "print-screens", at: 0, until: 1, layer: "front", params: { hit: 0.05, stagger: 0.03, height: 0.58, leaf: 0.16, ox: 0.24, casterOx: 0.42, casterScale: 0.85, hx: 0.3, hy: 0.5, tautEnd: 1800, tautSlope: -0.2 } },
        { kind: "print-crack", at: 0.05, until: 0.6, layer: "screen" },
      ],
      screen: [
        { kind: "two-tone", at: 0.05, ms: 70 },
        { kind: "chromatic", at: 0.05, ms: 120, amount: 0.6 },
      ],
      stop: [{ at: 0.05, ms: 140 }],
      shake: [
        { at: 0.05, amount: 0.03 },
        { at: 0.3, amount: 0.01 },
      ],
      sound: [
        { at: 0.045, sfx: "print-impact" },
        { at: 0.06, sfx: "ult-boom" },
      ],
      reveal: [
        { at: 0.05, reveal: "impact" },
        { at: 0.05, reveal: "ward" },
      ],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.impact" }],
      markers: [{ at: 0.05, label: "covered" }],
    },

    /* 5 · COVER — the real board: a screen at every ally, and the bill. */
    {
      id: "cover",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield a paper screen stands up at the enemy-facing side of every real party member, one after another, and the premium's bill flies from the Broker into the treasury. The catch is said, not hidden.",
      space: "battlefield",
      ms: 820,
      fastMs: 520,
      transition: { kind: "flash", ms: 70 },
      background: "battlefield",
      lighting: { tint: [UMBER, 0.4], letterbox: BARS },
      toLighting: { tint: [UMBER, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:print-settle" }],
      vfx: [
        { kind: "print-cover", at: 0.04, until: 1, anchor: "party", stagger: 70 },
        { kind: "print-bill", at: 0, until: 1, anchor: "caster", params: { start: 0.34 } },
      ],
      sound: [
        { at: 0.04, sfx: "print-stand" },
        { at: 0.55, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.06, label: "covered, on the board" }],
    },
  ],
};
