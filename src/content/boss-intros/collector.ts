import type { BossIntroFilm } from "./index";

/**
 * THE COLLECTOR — the entrance to the Collector's Hoard.
 *
 * The idea, in one sentence: every chain in the Hoard ends in a lock, and the
 * Collector holds the key — the dark overhead is full of what it has taken,
 * an empty lock swings open for what the party carries, and when the key comes
 * down every chain snaps taut and the Strongbox is set out for the first of it.
 *
 * Rhythm: the door shut (the board, a curtain of chain) → stakes (up the shaft
 * at the hoard, the party small beneath it) → the quiet (one empty padlock,
 * ticking, its shackle dropping open; two lamps open above it) → the reveal
 * (the Collector drawn up out of the dark, key lifted) → the loudest (the key
 * on the grate, every chain taut, the title struck) → the mechanic (the
 * Strongbox set down, a chain whipped out that hauls a blade back into it) →
 * back to the board.
 *
 * Its storyboard is `docs/boss-intros/collector.md`.
 */

const GOLD = "#e0b25a";
const EMBER = "#ff7a2e";
const BARS = 0.11;

export const collectorIntro: BossIntroFilm = {
  id: "collector-intro",
  bossId: "collector",
  accent: GOLD,
  line: "Everything you carry is collateral.",
  shots: [
    /* 0 · SHUT — on the board: the way in is chained shut behind the party. */
    {
      id: "shut",
      kind: "call",
      purpose: "Break from the route: the chamber is sealed behind the party and the lights go down.",
      space: "battlefield",
      ms: 560,
      fastMs: 320,
      background: "battlefield",
      lighting: { tint: ["#07060a", 0], letterbox: 0 },
      toLighting: { tint: ["#07060a", 0.62], letterbox: BARS },
      vfx: [{ kind: "col-curtain", at: 0.02, until: 1, layer: "screen", seed: 5, params: { from: 0, to: 0.34 } }],
      sound: [{ at: 0.02, sfx: "col-shut" }],
      shake: [{ at: 0.62, amount: 0.01 }],
      duck: [{ at: 0, level: 0.12, ms: 4200 }],
      markers: [{ at: 0.6, label: "shut" }],
    },

    /* 1 · HOARD — up the shaft: what it has taken hangs over the party. */
    {
      id: "hoard",
      kind: "wide-hero",
      purpose: "Stakes: the dark above is full of taken things, each on a chain, and the party stands small under it.",
      space: "cinematic",
      ms: 1000,
      transition: { kind: "black", ms: 120 },
      camera: {
        from: { x: 800, y: 700, zoom: 1.08 },
        to: { x: 800, y: 380, zoom: 1.16 },
        ease: "inOut",
      },
      background: "col-hoard",
      lighting: { exposure: 0.5, under: [EMBER, 0.6], vignette: 0.6, letterbox: BARS },
      toLighting: { exposure: 0.44, under: [EMBER, 0.45], vignette: 0.7, letterbox: BARS },
      actors: [
        { role: "allies", at: [520, 1010], size: 150, look: "silhouette", spread: [170, 0] },
      ],
      vfx: [
        { kind: "col-hanging", at: 0, until: 1, x: 800, y: 420, scale: 1.05, seed: 11, layer: "back", params: { far: true, count: 11 } },
        { kind: "col-hanging", at: 0, until: 1, x: 820, y: 330, scale: 1.4, seed: 29, layer: "front", params: { count: 6 } },
      ],
      sound: [
        { at: 0, sfx: "col-hoard" },
        { at: 0.42, sfx: "col-motif" },
      ],
      markers: [{ at: 0.42, label: "motif" }],
    },

    /* 2 · QUIET — one empty lock, ticking, and it opens. Two lamps in the dark. */
    {
      id: "quiet",
      kind: "extreme-close-up",
      purpose: "The quiet before the loudest: an empty padlock swings open, waiting for whatever the party carries.",
      space: "cinematic",
      ms: 650,
      fastMs: 380,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 430, zoom: 1.7 },
        to: { x: 800, y: 420, zoom: 1.82 },
        ease: "out",
      },
      background: "col-hoard",
      lighting: { exposure: 0.22, under: [EMBER, 0.35], vignette: 0.85, letterbox: BARS },
      vfx: [
        { kind: "col-eyes", at: 0.68, until: 1, x: 990, y: 300, scale: 1.1, layer: "back" },
        { kind: "col-lock", at: 0, until: 1, x: 790, y: 300, scale: 0.9, layer: "front", params: { openAt: 0.52 } },
      ],
      sound: [
        { at: 0.08, sfx: "col-tick" },
        { at: 0.34, sfx: "col-tick" },
        { at: 0.52, sfx: "col-shackle" },
      ],
      duck: [{ at: 0, level: 0.03, ms: 700 }],
      markers: [
        { at: 0.52, label: "shackle open" },
        { at: 0.68, label: "eyes" },
      ],
    },

    /* 3 · LOOM — out of the dark: the Collector draws itself up, key lifted. */
    {
      id: "loom",
      kind: "low-angle",
      purpose: "The reveal: the Collector rises out of the dark it was sitting in, lamps lit, the key lifted over the party.",
      space: "cinematic",
      ms: 720,
      fastMs: 460,
      transition: { kind: "cut" },
      camera: {
        from: { x: 900, y: 560, zoom: 1.12, rotate: -4 },
        to: { x: 900, y: 470, zoom: 1.24, rotate: -2 },
        ease: "out",
      },
      background: "col-hoard",
      lighting: { exposure: 0.2, under: [EMBER, 0.9], rim: [GOLD, 0.5, 1], vignette: 0.75, letterbox: BARS },
      toLighting: { exposure: 0.42, under: [EMBER, 0.75], rim: [GOLD, 0.9, 1], vignette: 0.6, letterbox: BARS },
      actors: [
        { role: "target", at: [960, 830], size: 300, clip: "intro:loom", look: "rim", rim: GOLD },
      ],
      vfx: [
        { kind: "col-hanging", at: 0, until: 1, x: 900, y: -260, scale: 1.3, seed: 41, layer: "back", params: { far: true, count: 8 } },
        { kind: "motes", at: 0.2, until: 1, x: 900, y: 600, scale: 1.8, color: EMBER, layer: "front" },
      ],
      sound: [{ at: 0.05, sfx: "boss-groan" }],
      markers: [{ at: 0.55, label: "upright" }],
    },

    /* 4 · STRIKE — the key on the grate; every chain taut; the title struck. */
    {
      id: "strike",
      kind: "impact",
      purpose: "The loudest: the key comes down, every chain in the shaft snaps straight to it, and the Collector's name is struck like a seal.",
      space: "cinematic",
      ms: 1000,
      fastMs: 720,
      transition: { kind: "cut" },
      camera: {
        from: { x: 820, y: 520, zoom: 1.06, rotate: 3 },
        to: { x: 840, y: 510, zoom: 1.0, rotate: 1 },
        ease: "out",
      },
      background: "col-hoard",
      lighting: { exposure: 0.4, under: [EMBER, 0.8], rim: [GOLD, 0.9, 1], vignette: 0.6, letterbox: BARS },
      toLighting: { exposure: 0.55, under: [EMBER, 0.6], back: [GOLD, 0.25], rim: [GOLD, 1, 1], vignette: 0.5, letterbox: BARS },
      actors: [
        { role: "target", at: [1080, 820], size: 290, clip: "intro:strike", look: "rim", rim: GOLD },
      ],
      vfx: [
        { kind: "col-taut", at: 0.4, until: 1, x: 900, y: 820, scale: 1, seed: 23, layer: "back" },
        { kind: "sparks", at: 0.4, until: 0.8, x: 930, y: 815, scale: 1.1, color: EMBER, seed: 4, layer: "front" },
        { kind: "dust", at: 0.4, until: 0.95, x: 930, y: 820, scale: 1.2, layer: "front" },
        { kind: "floor-cracks", at: 0.4, until: 1, x: 930, y: 822, scale: 1, color: EMBER, seed: 8, layer: "back" },
      ],
      screen: [{ kind: "flash", at: 0.4, ms: 70, amount: 0.5 }],
      stop: [{ at: 0.4, ms: 90 }],
      shake: [{ at: 0.4, amount: 0.032 }],
      sound: [{ at: 0.38, sfx: "col-slam" }],
      duck: [{ at: 0.4, level: 0.55, ms: 1700 }],
      text: [{ kind: "title", at: 0.42, until: 1, text: "", x: 0.05, y: 0.34 }],
      markers: [
        { at: 0.4, label: "key strikes" },
        { at: 0.42, label: "title" },
      ],
    },

    /* 5 · STRONGBOX — set out for the first of it; a chain whips out and takes a blade. */
    {
      id: "strongbox",
      kind: "target",
      purpose: "The mechanic, shown not told: the Strongbox set down, and a chain out of it hauls a hero's blade back inside.",
      space: "cinematic",
      ms: 950,
      fastMs: 660,
      transition: { kind: "whip", ms: 110, dir: -1 },
      camera: {
        from: { x: 780, y: 560, zoom: 1.24 },
        to: { x: 740, y: 560, zoom: 1.34 },
        ease: "out",
      },
      background: "col-hoard",
      lighting: { exposure: 0.5, under: [EMBER, 0.6], rim: [GOLD, 0.9, 1], vignette: 0.55, letterbox: BARS },
      actors: [
        { role: "target", at: [1150, 860], size: 250, clip: "intro:appraise", look: "rim", rim: GOLD, z: 1 },
      ],
      vfx: [
        { kind: "col-strongbox", at: 0, until: 1, x: 760, y: 700, scale: 0.72, layer: "front" },
        { kind: "col-seize", at: 0.28, until: 1, x: 700, y: 660, scale: 1, layer: "front" },
      ],
      sound: [
        { at: 0.04, sfx: "col-lid" },
        { at: 0.28, sfx: "col-seize" },
      ],
      text: [{ kind: "voice", at: 0.2, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.12, label: "box lands" },
        { at: 0.47, label: "blade taken" },
      ],
    },

    /* 6 · RETURN — the chains draw up, and the fight is on. */
    {
      id: "return",
      kind: "return",
      purpose: "Back to the chamber: the chains draw up into the dark and the fight begins.",
      space: "battlefield",
      ms: 560,
      fastMs: 380,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: ["#07060a", 0.45], letterbox: BARS },
      toLighting: { tint: ["#07060a", 0], letterbox: 0 },
      sound: [{ at: 0.04, sfx: "col-draw" }],
      duck: [{ at: 0.1, level: 1, ms: 10 }],
    },
  ],
};
