import type { BossIntroFilm } from "./index";

/**
 * THE ASSAYER — the entrance to the Assay Furnace.
 *
 * The idea, in one sentence: the Assayer weighs what you are worth in heat —
 * its floor is lined with moulds cast in the shapes of weapons it has melted
 * down, its gauge climbs into the red as it lifts the crucible, it pours one
 * more, and the only answer is a hard blow on the crucible while it is hot.
 *
 * Rhythm: the heat (the board, furnace light spilling in) → stakes (the assay
 * floor: moulds shaped like swords and shields, the party small by the furnace
 * mouth) → the quiet (the gauge needle trembling up into the red; one drop of
 * melt) → the reveal (the Assayer comes up to temperature, crucible lifted) →
 * the loudest (the pour: melt on brick, the title) → the mechanic (a blade on
 * the hot crucible, and the crack running through it) → back.
 *
 * Its storyboard is `docs/boss-intros/assayer.md`.
 */

const MELT = "#ff8a3a";
const HOT = "#ffd27a";
const BARS = 0.11;

export const assayerIntro: BossIntroFilm = {
  id: "assayer-intro",
  bossId: "assayer",
  accent: MELT,
  line: "Let's see what you're worth.",
  shots: [
    /* 0 · HEAT — on the board: a furnace door opens somewhere, and its light comes in. */
    {
      id: "heat",
      kind: "call",
      purpose: "Break from the route: a furnace door grinds open off the board and its light pushes in over the party.",
      space: "battlefield",
      ms: 560,
      fastMs: 320,
      background: "battlefield",
      lighting: { tint: ["#0a0504", 0], letterbox: 0 },
      toLighting: { tint: ["#0a0504", 0.58], letterbox: BARS },
      vfx: [{ kind: "asi-kilnlight", at: 0.05, until: 1, layer: "screen" }],
      sound: [{ at: 0.02, sfx: "asi-door" }],
      shake: [{ at: 0.6, amount: 0.008 }],
      duck: [{ at: 0, level: 0.12, ms: 4200 }],
      markers: [{ at: 0.6, label: "door open" }],
    },

    /* 1 · MOULDS — the assay floor: what it has melted, cast in their own shapes. */
    {
      id: "moulds",
      kind: "wide-hero",
      purpose: "Stakes: the floor is lined with moulds shaped like the weapons it melted down, still glowing, and the party stands among them.",
      space: "cinematic",
      ms: 950,
      transition: { kind: "black", ms: 120 },
      camera: {
        from: { x: 520, y: 700, zoom: 1.3 },
        to: { x: 820, y: 660, zoom: 1.12 },
        ease: "inOut",
      },
      background: "asi-furnace",
      lighting: { exposure: 0.5, under: [MELT, 0.55], vignette: 0.65, letterbox: BARS },
      toLighting: { exposure: 0.46, under: [MELT, 0.45], vignette: 0.7, letterbox: BARS },
      actors: [{ role: "allies", at: [560, 850], size: 150, look: "silhouette", spread: [170, 0] }],
      vfx: [
        { kind: "asi-moulds", at: 0, until: 1, x: 760, y: 925, scale: 1, layer: "front", params: { count: 5 } },
        { kind: "embers", at: 0, until: 1, x: 900, y: 700, scale: 1.6, color: MELT, layer: "front" },
      ],
      sound: [
        { at: 0, sfx: "asi-floor" },
        { at: 0.42, sfx: "asi-motif" },
      ],
      markers: [{ at: 0.42, label: "motif" }],
    },

    /* 2 · QUIET — the gauge climbs into the red; one drop falls. */
    {
      id: "gauge",
      kind: "extreme-close-up",
      purpose: "The quiet before the loudest: a gauge needle trembles up into the red, and a single drop of melt falls past it.",
      space: "cinematic",
      ms: 700,
      fastMs: 400,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 450, zoom: 1.6 },
        to: { x: 800, y: 450, zoom: 1.72 },
        ease: "out",
      },
      background: "asi-furnace",
      lighting: { exposure: 0.2, under: [MELT, 0.3], vignette: 0.88, letterbox: BARS },
      vfx: [
        { kind: "asi-gauge", at: 0, until: 1, x: 760, y: 440, scale: 0.95, layer: "front" },
        { kind: "asi-drip", at: 0.62, until: 1, x: 960, y: 560, scale: 1, layer: "front" },
      ],
      sound: [
        { at: 0.1, sfx: "asi-tick" },
        { at: 0.3, sfx: "asi-tick" },
        { at: 0.48, sfx: "asi-tick" },
        { at: 0.62, sfx: "asi-tick" },
        { at: 0.98, sfx: "asi-drip" },
      ],
      duck: [{ at: 0, level: 0.03, ms: 750 }],
      markers: [
        { at: 0.64, label: "in the red" },
        { at: 0.98, label: "drop lands" },
      ],
    },

    /* 3 · LIFT — the Assayer comes up to temperature, the crucible raised. */
    {
      id: "lift",
      kind: "low-angle",
      purpose: "The reveal: the kiln straightens against the furnace glare, the crucible lifted high on its tongs, the gauge tipped up to read it.",
      space: "cinematic",
      ms: 760,
      fastMs: 480,
      transition: { kind: "cut" },
      camera: {
        from: { x: 940, y: 620, zoom: 1.14, rotate: 3 },
        to: { x: 940, y: 540, zoom: 1.24, rotate: 1 },
        ease: "out",
      },
      background: "asi-furnace",
      lighting: { exposure: 0.24, under: [MELT, 0.9], rim: [HOT, 0.5, 1], vignette: 0.75, letterbox: BARS },
      toLighting: { exposure: 0.42, under: [MELT, 0.75], rim: [HOT, 0.9, 1], vignette: 0.6, letterbox: BARS },
      actors: [{ role: "target", at: [1000, 850], size: 300, clip: "intro:lift", look: "rim", rim: HOT }],
      vfx: [{ kind: "embers", at: 0, until: 1, x: 1000, y: 600, scale: 1.8, color: MELT, layer: "front" }],
      sound: [
        { at: 0.02, sfx: "asi-bellows" },
        { at: 0.25, sfx: "boss-groan" },
      ],
      markers: [{ at: 0.6, label: "crucible up" }],
    },

    /* 4 · POUR — tipped over; melt on brick; the title. */
    {
      id: "pour",
      kind: "impact",
      purpose: "The loudest: the crucible thrown over, melt hitting the brick and spreading, and the Assayer's name struck in the glare.",
      space: "cinematic",
      ms: 1000,
      fastMs: 720,
      transition: { kind: "cut" },
      camera: {
        from: { x: 860, y: 560, zoom: 1.08, rotate: -3 },
        to: { x: 880, y: 545, zoom: 1.0, rotate: -1 },
        ease: "out",
      },
      background: "asi-furnace",
      lighting: { exposure: 0.4, under: [MELT, 0.8], rim: [HOT, 0.9, 1], vignette: 0.6, letterbox: BARS },
      toLighting: { exposure: 0.56, under: [MELT, 0.95], back: [MELT, 0.25], rim: [HOT, 1, 1], vignette: 0.5, letterbox: BARS },
      actors: [{ role: "target", at: [1120, 840], size: 290, clip: "intro:pour", look: "rim", rim: HOT }],
      vfx: [
        { kind: "asi-stream", at: 0.36, until: 1, x: 895, y: 668, scale: 1, layer: "front", params: { len: 170 } },
        { kind: "asi-splash", at: 0.38, until: 1, x: 880, y: 840, scale: 1, seed: 7, layer: "front" },
        { kind: "floor-cracks", at: 0.38, until: 1, x: 880, y: 845, scale: 1, color: MELT, seed: 3, layer: "back" },
        { kind: "sparks", at: 0.38, until: 0.85, x: 880, y: 830, scale: 1.1, color: HOT, seed: 9, layer: "front" },
      ],
      screen: [{ kind: "flash", at: 0.38, ms: 70, amount: 0.45 }],
      stop: [{ at: 0.38, ms: 90 }],
      shake: [{ at: 0.38, amount: 0.03 }],
      sound: [{ at: 0.36, sfx: "asi-pour" }],
      duck: [{ at: 0.38, level: 0.55, ms: 1700 }],
      text: [{ kind: "title", at: 0.4, until: 1, text: "", x: 0.05, y: 0.34 }],
      markers: [
        { at: 0.38, label: "melt lands" },
        { at: 0.4, label: "title" },
      ],
    },

    /* 5 · CRACK — a blade on the hot crucible, and the crack running through it. */
    {
      id: "crack",
      kind: "target",
      purpose: "The mechanic, shown not told: a hero's blade strikes the glowing crucible and it cracks — hit it hard while it pours.",
      space: "cinematic",
      ms: 950,
      fastMs: 660,
      transition: { kind: "whip", ms: 110, dir: -1 },
      camera: {
        from: { x: 820, y: 470, zoom: 1.2 },
        to: { x: 820, y: 470, zoom: 1.3 },
        ease: "out",
      },
      background: "asi-furnace",
      lighting: { exposure: 0.36, under: [MELT, 0.7], vignette: 0.7, letterbox: BARS },
      vfx: [
        { kind: "asi-crucible", at: 0, until: 1, x: 900, y: 460, scale: 0.85, layer: "front" },
        { kind: "asi-blade", at: 0.05, until: 1, x: 740, y: 470, scale: 1, layer: "front" },
      ],
      shake: [{ at: 0.36, amount: 0.014 }],
      stop: [{ at: 0.36, ms: 60 }],
      sound: [{ at: 0.34, sfx: "asi-crack" }],
      text: [{ kind: "voice", at: 0.5, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.36, label: "blade strikes" },
        { at: 0.58, label: "cracked" },
      ],
    },

    /* 6 · RETURN — the melt sets, and the fight is on. */
    {
      id: "return",
      kind: "return",
      purpose: "Back to the Assay Furnace: steam off the brick and the fight begins.",
      space: "battlefield",
      ms: 560,
      fastMs: 380,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: ["#0a0504", 0.45], letterbox: BARS },
      toLighting: { tint: ["#0a0504", 0], letterbox: 0 },
      sound: [{ at: 0.04, sfx: "asi-cool" }],
      duck: [{ at: 0.1, level: 1, ms: 10 }],
    },
  ],
};
