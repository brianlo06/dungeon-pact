import type { BossIntroFilm } from "./index";

/**
 * THE MISER — the entrance to the Counting House.
 *
 * The idea, in one sentence: the Miser hears the party's purse before it sees
 * them — it has been down here counting for years, and one coin rolling in the
 * dark wakes the heap; it heaves itself up out of its hoard, slaps its hand
 * down on it, and the gold the party kept pours off them onto its back, where
 * it sets into a shell.
 *
 * Rhythm: the purse (the board, every hero's coins glinting) → stakes (the
 * pit, its walls scratched with years of tallies, a fifth struck through) →
 * the quiet (one coin rolls in the dark and falls flat; an eye opens in the
 * heap) → the reveal (the heap stands up, coins pouring off it) → the loudest
 * (the hand down on the hoard, coins thrown up, the title) → the mechanic (the
 * party's gold streams onto its back and sets into a shell) → back.
 *
 * Its storyboard is `docs/boss-intros/miser.md`.
 */

const GOLD = "#e7b650";
const LAMP = "#ffcf73";
const BARS = 0.11;

export const miserIntro: BossIntroFilm = {
  id: "miser-intro",
  bossId: "miser",
  accent: GOLD,
  line: "Keep your gold. I'll wear it.",
  shots: [
    /* 0 · PURSE — on the board: every hero's purse glints, and the lights go down. */
    {
      id: "purse",
      kind: "call",
      purpose: "Break from the route: something below has heard the party's coin, and the lights go down.",
      space: "battlefield",
      ms: 560,
      fastMs: 320,
      background: "battlefield",
      lighting: { tint: ["#0a0805", 0], letterbox: 0 },
      toLighting: { tint: ["#0a0805", 0.62], letterbox: BARS },
      vfx: [{ kind: "msr-purse", at: 0, until: 1, anchor: "allies", stagger: 60, scale: 1.2, seed: 3, layer: "front" }],
      sound: [{ at: 0.04, sfx: "msr-purse" }],
      duck: [{ at: 0, level: 0.12, ms: 4200 }],
      markers: [{ at: 0.3, label: "coins lift" }],
    },

    /* 1 · TALLY — the pit: years of counting on the walls, and one more mark. */
    {
      id: "tally",
      kind: "wide-hero",
      purpose: "Stakes: the walls are scratched with years of tallies over heaps of kept gold, and the party stands small in the lamplight.",
      space: "cinematic",
      ms: 900,
      transition: { kind: "black", ms: 120 },
      camera: {
        from: { x: 700, y: 330, zoom: 1.34 },
        to: { x: 780, y: 600, zoom: 1.12 },
        ease: "inOut",
      },
      background: "msr-pit",
      lighting: { exposure: 0.5, under: [LAMP, 0.3], vignette: 0.7, letterbox: BARS },
      toLighting: { exposure: 0.46, under: [LAMP, 0.4], vignette: 0.72, letterbox: BARS },
      actors: [{ role: "allies", at: [470, 930], size: 150, look: "silhouette", spread: [170, 0] }],
      vfx: [{ kind: "msr-tally", at: 0, until: 1, x: 640, y: 250, scale: 1.3, layer: "back" }],
      sound: [
        { at: 0.12, sfx: "msr-scratch" },
        { at: 0.3, sfx: "msr-scratch" },
        { at: 0.49, sfx: "msr-scratch" },
        { at: 0.67, sfx: "msr-scratch" },
        { at: 0.86, sfx: "msr-scratch" },
        { at: 0.4, sfx: "msr-motif" },
      ],
      markers: [
        { at: 0.4, label: "motif" },
        { at: 0.96, label: "struck through" },
      ],
    },

    /* 2 · QUIET — one coin rolls in the dark and falls flat; an eye opens in the heap. */
    {
      id: "quiet",
      kind: "extreme-close-up",
      purpose: "The quiet before the loudest: one coin rolls to rest against the heap, and the heap opens an eye.",
      space: "cinematic",
      ms: 700,
      fastMs: 400,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 720, zoom: 1.7 },
        to: { x: 810, y: 715, zoom: 1.8 },
        ease: "out",
      },
      background: "msr-pit",
      lighting: { exposure: 0.3, under: [LAMP, 0.3], vignette: 0.86, letterbox: BARS },
      vfx: [
        { kind: "msr-coin", at: 0, until: 1, x: 800, y: 800, scale: 1.7, layer: "front" },
        { kind: "msr-eye", at: 0.68, until: 1, x: 880, y: 700, scale: 1, layer: "back" },
      ],
      sound: [{ at: 0.02, sfx: "msr-roll" }],
      duck: [{ at: 0, level: 0.03, ms: 750 }],
      markers: [
        { at: 0.6, label: "coin flat" },
        { at: 0.68, label: "eye" },
      ],
    },

    /* 3 · RISE — the heap stands up: the Miser, coins pouring off it. */
    {
      id: "rise",
      kind: "low-angle",
      purpose: "The reveal: what the party took for a heap heaves itself up, gold pouring off its back, its hand going overhead.",
      space: "cinematic",
      ms: 800,
      fastMs: 500,
      transition: { kind: "cut" },
      camera: {
        from: { x: 920, y: 640, zoom: 1.14, rotate: -3 },
        to: { x: 920, y: 540, zoom: 1.22, rotate: -1 },
        ease: "out",
      },
      background: "msr-pit",
      lighting: { exposure: 0.26, under: [LAMP, 0.5], rim: [GOLD, 0.5, 1], vignette: 0.75, letterbox: BARS },
      toLighting: { exposure: 0.44, under: [LAMP, 0.45], rim: [GOLD, 0.9, 1], vignette: 0.6, letterbox: BARS },
      actors: [{ role: "target", at: [960, 850], size: 300, clip: "intro:rise", look: "rim", rim: GOLD }],
      vfx: [{ kind: "msr-pour", at: 0.08, until: 1, x: 960, y: 660, scale: 1, seed: 17, layer: "front" }],
      sound: [
        { at: 0.02, sfx: "msr-heave" },
        { at: 0.2, sfx: "boss-groan" },
      ],
      markers: [{ at: 0.6, label: "hand overhead" }],
    },

    /* 4 · SLAM — the hand down on the hoard; coins thrown up; the title. */
    {
      id: "slam",
      kind: "impact",
      purpose: "The loudest: the hand comes down flat on the hoard, gold thrown into the air, and the Miser's name is struck.",
      space: "cinematic",
      ms: 1000,
      fastMs: 720,
      transition: { kind: "cut" },
      camera: {
        from: { x: 840, y: 560, zoom: 1.08, rotate: 3 },
        to: { x: 860, y: 540, zoom: 1.0, rotate: 1 },
        ease: "out",
      },
      background: "msr-pit",
      lighting: { exposure: 0.42, under: [LAMP, 0.5], rim: [GOLD, 0.9, 1], vignette: 0.6, letterbox: BARS },
      toLighting: { exposure: 0.56, under: [LAMP, 0.4], back: [GOLD, 0.25], rim: [GOLD, 1, 1], vignette: 0.5, letterbox: BARS },
      actors: [{ role: "target", at: [1100, 840], size: 290, clip: "intro:slam", look: "rim", rim: GOLD }],
      vfx: [
        { kind: "msr-burst", at: 0.35, until: 1, x: 900, y: 830, scale: 1, seed: 29, layer: "front" },
        { kind: "dust", at: 0.35, until: 0.9, x: 900, y: 830, scale: 1.2, layer: "front" },
      ],
      screen: [{ kind: "flash", at: 0.35, ms: 70, amount: 0.45 }],
      stop: [{ at: 0.35, ms: 90 }],
      shake: [{ at: 0.35, amount: 0.03 }],
      sound: [{ at: 0.33, sfx: "msr-slam" }],
      duck: [{ at: 0.35, level: 0.55, ms: 1700 }],
      text: [{ kind: "title", at: 0.37, until: 1, text: "", x: 0.05, y: 0.34 }],
      markers: [
        { at: 0.35, label: "hand lands" },
        { at: 0.37, label: "title" },
      ],
    },

    /* 5 · SHELL — the party's gold streams onto its back and sets into a shell. */
    {
      id: "shell",
      kind: "target",
      purpose: "The mechanic, shown not told: the gold the party holds flies off them onto the Miser's back and sets hard into armour.",
      space: "cinematic",
      ms: 950,
      fastMs: 660,
      transition: { kind: "whip", ms: 110, dir: 1 },
      camera: {
        from: { x: 900, y: 600, zoom: 1.22 },
        to: { x: 960, y: 600, zoom: 1.32 },
        ease: "out",
      },
      background: "msr-pit",
      lighting: { exposure: 0.5, under: [LAMP, 0.45], rim: [GOLD, 0.9, 1], vignette: 0.55, letterbox: BARS },
      actors: [{ role: "target", at: [1120, 870], size: 250, clip: "intro:claim", look: "rim", rim: GOLD }],
      vfx: [
        { kind: "msr-stream", at: 0, until: 0.8, x: 1110, y: 640, scale: 1, seed: 31, layer: "front" },
        { kind: "msr-shell", at: 0.38, until: 1, x: 1235, y: 620, scale: 0.8, layer: "front" },
      ],
      sound: [{ at: 0.02, sfx: "msr-stream" }],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.4, label: "shell sets" },
        { at: 0.62, label: "shell whole" },
      ],
    },

    /* 6 · RETURN — the heap settles, and the fight is on. */
    {
      id: "return",
      kind: "return",
      purpose: "Back to the Counting House: the gold settles and the fight begins.",
      space: "battlefield",
      ms: 560,
      fastMs: 380,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: ["#0a0805", 0.45], letterbox: BARS },
      toLighting: { tint: ["#0a0805", 0], letterbox: 0 },
      sound: [{ at: 0.04, sfx: "msr-purse" }],
      duck: [{ at: 0.1, level: 1, ms: 10 }],
    },
  ],
};
