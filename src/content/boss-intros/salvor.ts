import type { BossIntroFilm } from "./index";

/**
 * THE SALVOR — the entrance to the Wreck Pool.
 *
 * The idea, in one sentence: the Salvor claims what the water took — a lamp
 * moves under the still water, a hero's shield floats on it until a hook takes
 * it under, and then the Salvor stands up out of the pool with the water
 * sheeting off it, brings its gaff down, and soft plates climb out of the
 * water after it and harden on its back.
 *
 * Everything is seen from the air, at the surface: no camera under the water
 * (Undertow), no water closing over anyone (Mourning Water), no wave
 * (Breakwater).
 *
 * Rhythm: the wet floor (the board, rings spreading at the boss's feet) →
 * stakes (the Wreck Pool: drowned vaults and wreckage, a lamp moving under the
 * water, the party on the ledge) → the quiet (a floating shield, a bubble, and
 * a hook takes it) → the reveal (the Salvor rises through the surface) → the
 * loudest (the gaff down, a column of water, the title) → the mechanic (plates
 * out of the water, onto its back, shut) → back.
 *
 * Its storyboard is `docs/boss-intros/salvor.md`.
 */

const SEA = "#7fc7c0";
const LAMP = "#e8e0a0";
const BARS = 0.11;

export const salvorIntro: BossIntroFilm = {
  id: "salvor-intro",
  bossId: "salvor",
  accent: SEA,
  line: "What the water takes, I keep.",
  shots: [
    /* 0 · WET — on the board: rings spread out from under the boss, and the light goes down. */
    {
      id: "wet",
      kind: "call",
      purpose: "Break from the route: the floor is water, something moves in it, and the lights go down.",
      space: "battlefield",
      ms: 560,
      fastMs: 320,
      background: "battlefield",
      lighting: { tint: ["#030a0a", 0], letterbox: 0 },
      toLighting: { tint: ["#030a0a", 0.62], letterbox: BARS },
      vfx: [{ kind: "svi-rings", at: 0, until: 1, anchor: "targets", scale: 0.6, layer: "front" }],
      sound: [{ at: 0.02, sfx: "svi-drip" }],
      duck: [{ at: 0, level: 0.12, ms: 4200 }],
      markers: [{ at: 0.3, label: "rings" }],
    },

    /* 1 · POOL — the Wreck Pool: drowned vaults, wreckage, a lamp moving under the water. */
    {
      id: "pool",
      kind: "wide-hero",
      purpose: "Stakes: a flooded cistern full of what the water took, a lamp moving slowly under its surface, and the party on the ledge above it.",
      space: "cinematic",
      ms: 950,
      transition: { kind: "black", ms: 120 },
      camera: {
        from: { x: 560, y: 560, zoom: 1.24 },
        to: { x: 820, y: 620, zoom: 1.1 },
        ease: "inOut",
      },
      background: "svi-pool",
      lighting: { exposure: 0.48, under: [SEA, 0.35], vignette: 0.7, letterbox: BARS },
      toLighting: { exposure: 0.44, under: [SEA, 0.45], vignette: 0.72, letterbox: BARS },
      actors: [{ role: "allies", at: [300, 755], size: 140, look: "silhouette", spread: [150, 0] }],
      vfx: [
        { kind: "svi-lamp", at: 0, until: 1, x: 1100, y: 900, scale: 1.2, layer: "back" },
        { kind: "svi-rings", at: 0.3, until: 1, x: 1180, y: 800, scale: 0.8, layer: "back" },
      ],
      sound: [
        { at: 0, sfx: "svi-pool" },
        { at: 0.45, sfx: "svi-motif" },
      ],
      markers: [{ at: 0.45, label: "motif" }],
    },

    /* 2 · QUIET — a floating shield; a bubble; a hook takes it under. */
    {
      id: "quiet",
      kind: "extreme-close-up",
      purpose: "The quiet before the loudest: a hero's shield floats on still water, a bubble comes up beside it, and a hook takes it under.",
      space: "cinematic",
      ms: 750,
      fastMs: 420,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1400, y: 740, zoom: 1.7 },
        to: { x: 1400, y: 745, zoom: 1.8 },
        ease: "out",
      },
      background: "svi-pool",
      lighting: { exposure: 0.3, under: [SEA, 0.3], vignette: 0.86, letterbox: BARS },
      vfx: [
        { kind: "svi-lamp", at: 0, until: 1, x: 1380, y: 860, scale: 0.8, layer: "back" },
        { kind: "svi-shield", at: 0, until: 1, x: 1400, y: 790, scale: 1, layer: "front" },
        { kind: "svi-rings", at: 0.82, until: 1, x: 1390, y: 795, scale: 0.6, layer: "front" },
      ],
      sound: [
        { at: 0.38, sfx: "svi-bubble" },
        { at: 0.8, sfx: "svi-gulp" },
      ],
      duck: [{ at: 0, level: 0.03, ms: 800 }],
      markers: [
        { at: 0.4, label: "bubble" },
        { at: 0.82, label: "taken" },
      ],
    },

    /* 3 · RISE — the Salvor stands up out of the pool, the water sheeting off it. */
    {
      id: "rise",
      kind: "low-angle",
      purpose: "The reveal: the helmet breaks the surface and the Salvor stands up out of the water, hump and lantern streaming.",
      space: "cinematic",
      ms: 800,
      fastMs: 500,
      transition: { kind: "cut" },
      camera: {
        from: { x: 960, y: 640, zoom: 1.14, rotate: -3 },
        to: { x: 960, y: 560, zoom: 1.22, rotate: -1 },
        ease: "out",
      },
      background: "svi-pool",
      lighting: { exposure: 0.26, under: [SEA, 0.6], rim: [LAMP, 0.5, 1], vignette: 0.75, letterbox: BARS },
      toLighting: { exposure: 0.44, under: [SEA, 0.5], rim: [SEA, 0.9, 1], vignette: 0.6, letterbox: BARS },
      actors: [{ role: "target", at: [1000, 900], size: 300, clip: "intro:rise", look: "rim", rim: SEA }],
      vfx: [
        { kind: "svi-surface", at: 0, until: 1, x: 960, y: 745, layer: "front" },
        { kind: "svi-shed", at: 0.25, until: 1, x: 1000, y: 745, scale: 1.1, seed: 13, layer: "front" },
        { kind: "svi-rings", at: 0.2, until: 1, x: 1000, y: 749, scale: 1.2, layer: "front" },
      ],
      sound: [
        { at: 0.05, sfx: "svi-rise" },
        { at: 0.3, sfx: "boss-groan" },
      ],
      markers: [{ at: 0.75, label: "standing" }],
    },

    /* 4 · HAUL — the gaff down into the water; a column thrown up; the title. */
    {
      id: "haul",
      kind: "impact",
      purpose: "The loudest: the gaff brought down into the pool, a column of water thrown up, and the Salvor's name struck.",
      space: "cinematic",
      ms: 1000,
      fastMs: 720,
      transition: { kind: "cut" },
      camera: {
        from: { x: 860, y: 580, zoom: 1.08, rotate: 3 },
        to: { x: 880, y: 560, zoom: 1.0, rotate: 1 },
        ease: "out",
      },
      background: "svi-pool",
      lighting: { exposure: 0.42, under: [SEA, 0.5], rim: [SEA, 0.9, 1], vignette: 0.6, letterbox: BARS },
      toLighting: { exposure: 0.56, under: [SEA, 0.45], back: [SEA, 0.25], rim: [SEA, 1, 1], vignette: 0.5, letterbox: BARS },
      actors: [{ role: "target", at: [1120, 900], size: 290, clip: "intro:haul", look: "rim", rim: SEA }],
      vfx: [
        { kind: "svi-surface", at: 0, until: 1, x: 900, y: 765, layer: "front" },
        { kind: "svi-column", at: 0.38, until: 1, x: 880, y: 767, scale: 1, seed: 21, layer: "front" },
        { kind: "svi-rings", at: 0.38, until: 1, x: 880, y: 771, scale: 1.4, layer: "front" },
      ],
      screen: [{ kind: "flash", at: 0.38, ms: 70, amount: 0.4 }],
      stop: [{ at: 0.38, ms: 90 }],
      shake: [{ at: 0.38, amount: 0.03 }],
      sound: [{ at: 0.36, sfx: "svi-haul" }],
      duck: [{ at: 0.38, level: 0.55, ms: 1700 }],
      text: [{ kind: "title", at: 0.4, until: 1, text: "", x: 0.05, y: 0.34 }],
      markers: [
        { at: 0.38, label: "gaff lands" },
        { at: 0.4, label: "title" },
      ],
    },

    /* 5 · HARDEN — soft plates climb out of the water and shut on its back. */
    {
      id: "harden",
      kind: "target",
      purpose: "The mechanic, shown not told: soft plates climb out of the pool and harden onto the Salvor's back, one after another.",
      space: "cinematic",
      ms: 950,
      fastMs: 660,
      transition: { kind: "whip", ms: 110, dir: 1 },
      camera: {
        from: { x: 960, y: 620, zoom: 1.22 },
        to: { x: 1000, y: 620, zoom: 1.32 },
        ease: "out",
      },
      background: "svi-pool",
      lighting: { exposure: 0.5, under: [SEA, 0.45], rim: [SEA, 0.9, 1], vignette: 0.55, letterbox: BARS },
      actors: [{ role: "target", at: [1150, 900], size: 250, clip: "intro:harden", look: "rim", rim: SEA }],
      vfx: [
        { kind: "svi-surface", at: 0, until: 1, x: 1000, y: 765, layer: "front" },
        { kind: "svi-plates", at: 0.05, until: 1, x: 1150, y: 765, scale: 1, layer: "front" },
      ],
      sound: [{ at: 0.05, sfx: "svi-plates" }],
      text: [{ kind: "voice", at: 0.35, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.47, label: "first plate shut" },
        { at: 0.73, label: "third plate shut" },
      ],
    },

    /* 6 · RETURN — the water settles, and the fight is on. */
    {
      id: "return",
      kind: "return",
      purpose: "Back to the Wreck Pool: the water settles and the fight begins.",
      space: "battlefield",
      ms: 560,
      fastMs: 380,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: ["#030a0a", 0.45], letterbox: BARS },
      toLighting: { tint: ["#030a0a", 0], letterbox: 0 },
      sound: [{ at: 0.04, sfx: "svi-settle" }],
      duck: [{ at: 0.1, level: 1, ms: 10 }],
    },
  ],
};
