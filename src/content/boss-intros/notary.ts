import type { BossIntroFilm } from "./index";

/**
 * THE NOTARY — the entrance to the Sealing Room.
 *
 * The idea, in one sentence: the Notary witnesses every signature, and the
 * party has just walked into its record — a witness candle lights over each of
 * them, the walls are every seal it has ever pressed, a drop of wax falls on
 * the one empty line in its ledger, and when it presses, the wax it squeezes
 * out stands up as three seals that count down and are enforced.
 *
 * Nothing unfolds and no signature writes itself (Small Print's): the names in
 * its ledger are already signed and sealed, and the party's line is blank.
 *
 * Rhythm: witnessed (the board, a candle lit over every hero) → stakes (the
 * Sealing Room: walls of sealed deeds up out of sight, the party small at the
 * desk) → the quiet (a ledger of sealed names, one empty line; a drop of wax
 * falls on it) → the reveal (the Notary draws itself up, stamp high) → the
 * loudest (the press, wax squeezed out, the title) → the mechanic (three
 * seals stand, their notches go out one by one, and each is enforced) → back.
 *
 * Its storyboard is `docs/boss-intros/notary.md`.
 */

const WAX = "#c0473a";
const FLAME = "#ffcf7a";
const BARS = 0.11;

export const notaryIntro: BossIntroFilm = {
  id: "notary-intro",
  bossId: "notary",
  accent: WAX,
  line: "So witnessed. So sealed.",
  shots: [
    /* 0 · WITNESSED — on the board: a bell, and a candle lit over every hero. */
    {
      id: "witnessed",
      kind: "call",
      purpose: "Break from the route: a desk bell, the lights go down, and a witness candle is lit over every hero.",
      space: "battlefield",
      ms: 560,
      fastMs: 320,
      background: "battlefield",
      lighting: { tint: ["#07060a", 0], letterbox: 0 },
      toLighting: { tint: ["#07060a", 0.66], letterbox: BARS },
      vfx: [{ kind: "nti-candle", at: 0.1, until: 1, anchor: "allies", stagger: 70, scale: 1, layer: "front" }],
      sound: [{ at: 0.02, sfx: "nti-bell" }],
      duck: [{ at: 0, level: 0.12, ms: 4200 }],
      markers: [{ at: 0.4, label: "candles lit" }],
    },

    /* 1 · ROOM — every seal it has pressed, up the walls out of sight. */
    {
      id: "room",
      kind: "wide-hero",
      purpose: "Stakes: walls of sealed deeds going up out of the light, each one a signature it witnessed, and the party small at the desk below.",
      space: "cinematic",
      ms: 950,
      transition: { kind: "black", ms: 120 },
      camera: {
        from: { x: 800, y: 180, zoom: 1.3 },
        to: { x: 780, y: 600, zoom: 1.1 },
        ease: "inOut",
      },
      background: "nti-room",
      lighting: { exposure: 0.5, under: [FLAME, 0.3], vignette: 0.7, letterbox: BARS },
      toLighting: { exposure: 0.46, under: [FLAME, 0.4], vignette: 0.72, letterbox: BARS },
      actors: [{ role: "allies", at: [640, 900], size: 150, look: "silhouette", spread: [170, 0] }],
      vfx: [{ kind: "motes", at: 0.3, until: 1, x: 800, y: 600, scale: 1.6, color: FLAME, layer: "front" }],
      sound: [
        { at: 0, sfx: "nti-room" },
        { at: 0.45, sfx: "nti-motif" },
      ],
      markers: [{ at: 0.45, label: "motif" }],
    },

    /* 2 · QUIET — the ledger: sealed names, one empty line, and a drop of wax on it. */
    {
      id: "ledger",
      kind: "extreme-close-up",
      purpose: "The quiet before the loudest: a page of names already sealed, one line left empty, and a drop of wax falls onto it.",
      space: "cinematic",
      ms: 750,
      fastMs: 420,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 470, zoom: 1.45 },
        to: { x: 820, y: 520, zoom: 1.62 },
        ease: "out",
      },
      background: "nti-room",
      lighting: { exposure: 0.34, under: [FLAME, 0.35], vignette: 0.86, letterbox: BARS },
      vfx: [
        { kind: "nti-ledger", at: 0, until: 1, x: 800, y: 470, scale: 1, seed: 5, layer: "front" },
        { kind: "nti-drop", at: 0.05, until: 1, x: 1100, y: 710, scale: 1, layer: "front" },
      ],
      sound: [{ at: 0.66, sfx: "nti-drop" }],
      duck: [{ at: 0, level: 0.03, ms: 800 }],
      markers: [
        { at: 0.4, label: "drop falls" },
        { at: 0.62, label: "drop lands" },
      ],
    },

    /* 3 · RISE — the Notary draws itself up, stamp lifted over the party. */
    {
      id: "rise",
      kind: "low-angle",
      purpose: "The reveal: the Notary straightens to its full height against the walls of seals, the lens lit and the stamp raised over the party.",
      space: "cinematic",
      ms: 760,
      fastMs: 480,
      transition: { kind: "cut" },
      camera: {
        from: { x: 940, y: 560, zoom: 1.12, rotate: 3 },
        to: { x: 940, y: 470, zoom: 1.2, rotate: 1 },
        ease: "out",
      },
      background: "nti-room",
      lighting: { exposure: 0.22, under: [FLAME, 0.5], rim: [WAX, 0.5, 1], vignette: 0.78, letterbox: BARS },
      toLighting: { exposure: 0.42, under: [FLAME, 0.45], rim: [WAX, 0.95, 1], vignette: 0.6, letterbox: BARS },
      actors: [{ role: "target", at: [1000, 860], size: 300, clip: "intro:rise", look: "rim", rim: WAX }],
      vfx: [{ kind: "motes", at: 0, until: 1, x: 1000, y: 500, scale: 1.8, color: FLAME, layer: "front" }],
      sound: [
        { at: 0.02, sfx: "nti-rise" },
        { at: 0.3, sfx: "boss-groan" },
      ],
      markers: [{ at: 0.6, label: "stamp high" }],
    },

    /* 4 · PRESS — the stamp down flat; wax squeezed out; the title. */
    {
      id: "press",
      kind: "impact",
      purpose: "The loudest: the stamp comes down flat, wax squeezed out from under it and flung, and the Notary's name is pressed like a seal.",
      space: "cinematic",
      ms: 1000,
      fastMs: 720,
      transition: { kind: "cut" },
      camera: {
        from: { x: 840, y: 540, zoom: 1.08, rotate: -3 },
        to: { x: 860, y: 525, zoom: 1.0, rotate: -1 },
        ease: "out",
      },
      background: "nti-room",
      lighting: { exposure: 0.42, under: [FLAME, 0.5], rim: [WAX, 0.9, 1], vignette: 0.6, letterbox: BARS },
      toLighting: { exposure: 0.56, under: [FLAME, 0.4], back: [WAX, 0.25], rim: [WAX, 1, 1], vignette: 0.5, letterbox: BARS },
      actors: [{ role: "target", at: [1120, 850], size: 290, clip: "intro:press", look: "rim", rim: WAX }],
      vfx: [
        { kind: "nti-splat", at: 0.38, until: 1, x: 900, y: 815, scale: 1, layer: "front" },
        { kind: "dust", at: 0.38, until: 0.9, x: 900, y: 815, scale: 1.1, layer: "front" },
        { kind: "floor-cracks", at: 0.38, until: 1, x: 900, y: 818, scale: 0.9, color: WAX, seed: 6, layer: "back" },
      ],
      screen: [{ kind: "flash", at: 0.38, ms: 70, amount: 0.45 }],
      stop: [{ at: 0.38, ms: 100 }],
      shake: [{ at: 0.38, amount: 0.03 }],
      sound: [{ at: 0.36, sfx: "nti-press" }],
      duck: [{ at: 0.38, level: 0.55, ms: 1700 }],
      text: [{ kind: "title", at: 0.4, until: 1, text: "", x: 0.05, y: 0.34 }],
      markers: [
        { at: 0.38, label: "pressed" },
        { at: 0.4, label: "title" },
      ],
    },

    /* 5 · SEALS — three seals stand up out of the wax; their notches go out; enforced. */
    {
      id: "seals",
      kind: "target",
      purpose: "The mechanic, shown not told: the wax stands up as three seals, each counts down three notches, and each is enforced on the party.",
      space: "cinematic",
      ms: 1000,
      fastMs: 700,
      transition: { kind: "whip", ms: 110, dir: -1 },
      camera: {
        from: { x: 820, y: 600, zoom: 1.18 },
        to: { x: 780, y: 600, zoom: 1.26 },
        ease: "out",
      },
      background: "nti-room",
      lighting: { exposure: 0.48, under: [FLAME, 0.45], rim: [WAX, 0.9, 1], vignette: 0.55, letterbox: BARS },
      actors: [{ role: "target", at: [1240, 870], size: 240, clip: "intro:attest", look: "rim", rim: WAX }],
      vfx: [{ kind: "nti-seals", at: 0, until: 1, x: 1030, y: 770, scale: 1.25, layer: "front" }],
      shake: [{ at: 0.74, amount: 0.012 }],
      sound: [{ at: 0.02, sfx: "nti-seals" }],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.38, label: "3 → 2" },
        { at: 0.66, label: "1 → enforced" },
      ],
    },

    /* 6 · RETURN — the candles gutter, and the fight is on. */
    {
      id: "return",
      kind: "return",
      purpose: "Back to the Sealing Room: the candles gutter and the fight begins.",
      space: "battlefield",
      ms: 560,
      fastMs: 380,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: ["#07060a", 0.45], letterbox: BARS },
      toLighting: { tint: ["#07060a", 0], letterbox: 0 },
      sound: [{ at: 0.04, sfx: "nti-gutter" }],
      duck: [{ at: 0.1, level: 1, ms: 10 }],
    },
  ],
};
