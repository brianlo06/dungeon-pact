import type { BossIntroFilm } from "./index";

/**
 * THE BAILIFF — the entrance to the Bailiff's Court.
 *
 * The idea, in one sentence: the Bailiff comes to collect, by the book —
 * three knocks, a hall of doors already served, boots that stop outside and a
 * summons slid under the door, the door opened on it, one rap of the tipstaff
 * to open the court, and a writ served on a hero that the hero can tear off
 * and serve straight back.
 *
 * It does not break anything down (Gatebreaker is the ram). It knocks, it is
 * let in, it follows procedure — and that is the menace.
 *
 * Rhythm: knocks (the board shaken three times, dust falling) → stakes (a hall
 * of doors papered with served notices, the party before the court door) →
 * the quiet (under the door: boots arrive and stop; a summons slides out) →
 * the reveal (the door swings in on the Bailiff in the lit court) → the
 * loudest (one rap of the tipstaff, summons flung up, the title) → the
 * mechanic (a writ served on a hero, tethered to the staff, counting three —
 * torn off and served back) → back.
 *
 * Its storyboard is `docs/boss-intros/bailiff.md`.
 */

const LIEN = "#d9564a";
const LAMP = "#ffd98a";
const BARS = 0.11;

export const bailiffIntro: BossIntroFilm = {
  id: "bailiff-intro",
  bossId: "bailiff",
  accent: LIEN,
  line: "You have been served.",
  shots: [
    /* 0 · KNOCKS — on the board: three knocks shake the room. */
    {
      id: "knocks",
      kind: "call",
      purpose: "Break from the route: three knocks shake the room, dust falls, and the lights go down.",
      space: "battlefield",
      ms: 600,
      fastMs: 360,
      background: "battlefield",
      lighting: { tint: ["#06070a", 0], letterbox: 0 },
      toLighting: { tint: ["#06070a", 0.62], letterbox: BARS },
      vfx: [{ kind: "bli-dust", at: 0, until: 1, layer: "screen", seed: 9 }],
      shake: [
        { at: 0.08, amount: 0.008 },
        { at: 0.33, amount: 0.008 },
        { at: 0.58, amount: 0.012 },
      ],
      sound: [{ at: 0.02, sfx: "bli-knocks" }],
      duck: [{ at: 0, level: 0.12, ms: 4300 }],
      markers: [{ at: 0.58, label: "third knock" }],
    },

    /* 1 · HALL — every door already served; the party at the court door. */
    {
      id: "hall",
      kind: "wide-hero",
      purpose: "Stakes: a hall of doors papered with served notices, and the party standing before the one door still shut.",
      space: "cinematic",
      ms: 950,
      transition: { kind: "black", ms: 120 },
      camera: {
        from: { x: 300, y: 520, zoom: 1.3 },
        to: { x: 900, y: 600, zoom: 1.08 },
        ease: "inOut",
      },
      background: "bli-hall",
      lighting: { exposure: 0.52, under: [LAMP, 0.25], vignette: 0.68, letterbox: BARS },
      toLighting: { exposure: 0.48, under: [LAMP, 0.35], vignette: 0.72, letterbox: BARS },
      actors: [{ role: "allies", at: [980, 900], size: 150, look: "silhouette", spread: [170, 0] }],
      sound: [
        { at: 0, sfx: "bli-hall" },
        { at: 0.42, sfx: "bli-motif" },
      ],
      markers: [{ at: 0.42, label: "motif" }],
    },

    /* 2 · QUIET — under the door: the boots stop; a summons slides out. */
    {
      id: "under",
      kind: "extreme-close-up",
      purpose: "The quiet before the loudest: the line of light under the door, two boots arriving and stopping in it, and a summons slid through.",
      space: "cinematic",
      ms: 750,
      fastMs: 420,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 470, zoom: 1.6 },
        to: { x: 800, y: 480, zoom: 1.7 },
        ease: "out",
      },
      background: "bli-hall",
      lighting: { exposure: 0.2, vignette: 0.88, letterbox: BARS },
      vfx: [{ kind: "bli-under", at: 0, until: 1, x: 800, y: 460, scale: 1, layer: "front" }],
      sound: [
        { at: 0.1, sfx: "bli-stop" },
        { at: 0.33, sfx: "bli-stop" },
        { at: 0.45, sfx: "bli-slide" },
      ],
      duck: [{ at: 0, level: 0.03, ms: 800 }],
      markers: [
        { at: 0.35, label: "boots stop" },
        { at: 0.8, label: "summons through" },
      ],
    },

    /* 3 · ENTER — the door swings in on the Bailiff, in the lit court. */
    {
      id: "enter",
      kind: "low-angle",
      purpose: "The reveal: the door swings in and the Bailiff is standing in the lit doorway, staff shouldered, lamps coming up under the brim.",
      space: "cinematic",
      ms: 800,
      fastMs: 500,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1180, y: 560, zoom: 1.12, rotate: 2 },
        to: { x: 1180, y: 500, zoom: 1.2, rotate: 1 },
        ease: "out",
      },
      background: "bli-hall",
      lighting: { exposure: 0.3, under: [LAMP, 0.3], rim: [LAMP, 0.6, -1], vignette: 0.75, letterbox: BARS },
      toLighting: { exposure: 0.42, under: [LAMP, 0.35], rim: [LAMP, 1, -1], vignette: 0.6, letterbox: BARS },
      actors: [{ role: "target", at: [1180, 880], size: 280, clip: "intro:enter", look: "rim", rim: LAMP }],
      vfx: [{ kind: "bli-door", at: 0, until: 1, x: 990, y: 180, scale: 1, layer: "back" }],
      sound: [
        { at: 0.02, sfx: "bli-door" },
        { at: 0.35, sfx: "bli-stop" },
      ],
      markers: [{ at: 0.5, label: "door open" }],
    },

    /* 4 · RAP — one rap of the tipstaff; summons flung up; the title. */
    {
      id: "rap",
      kind: "impact",
      purpose: "The loudest: the tipstaff comes down on the floor once, the summons in its fist fly, and the Bailiff's name is entered.",
      space: "cinematic",
      ms: 1000,
      fastMs: 720,
      transition: { kind: "cut" },
      camera: {
        from: { x: 900, y: 540, zoom: 1.08, rotate: -3 },
        to: { x: 920, y: 525, zoom: 1.0, rotate: -1 },
        ease: "out",
      },
      background: "bli-hall",
      lighting: { exposure: 0.42, under: [LAMP, 0.35], rim: [LIEN, 0.9, 1], vignette: 0.6, letterbox: BARS },
      toLighting: { exposure: 0.56, under: [LAMP, 0.3], back: [LIEN, 0.22], rim: [LIEN, 1, 1], vignette: 0.5, letterbox: BARS },
      actors: [{ role: "target", at: [1160, 870], size: 290, clip: "intro:rap", look: "rim", rim: LIEN }],
      vfx: [
        { kind: "shockwave", at: 0.38, until: 0.9, x: 960, y: 830, scale: 1, color: LAMP, layer: "back" },
        { kind: "dust", at: 0.38, until: 0.9, x: 960, y: 830, scale: 1.2, layer: "front" },
        { kind: "bli-papers", at: 0.38, until: 1, x: 1300, y: 700, scale: 1, seed: 4, layer: "front" },
      ],
      screen: [{ kind: "flash", at: 0.38, ms: 60, amount: 0.4 }],
      stop: [{ at: 0.38, ms: 110 }],
      shake: [{ at: 0.38, amount: 0.028 }],
      sound: [{ at: 0.37, sfx: "bli-rap" }],
      duck: [{ at: 0.38, level: 0.55, ms: 1700 }],
      text: [{ kind: "title", at: 0.4, until: 1, text: "", x: 0.05, y: 0.34 }],
      markers: [
        { at: 0.38, label: "rap" },
        { at: 0.4, label: "title" },
      ],
    },

    /* 5 · SERVED — a writ on a hero, tethered and counting; torn off and served back. */
    {
      id: "served",
      kind: "target",
      purpose: "The mechanic, shown not told: a writ served onto a hero, tied to the staff and counting three — and the hero tears it off and serves it back.",
      space: "cinematic",
      ms: 1050,
      fastMs: 720,
      transition: { kind: "whip", ms: 110, dir: 1 },
      camera: {
        from: { x: 820, y: 600, zoom: 1.16 },
        to: { x: 840, y: 600, zoom: 1.22 },
        ease: "out",
      },
      background: "bli-hall",
      lighting: { exposure: 0.48, under: [LAMP, 0.35], rim: [LIEN, 0.9, 1], vignette: 0.55, letterbox: BARS },
      actors: [
        { role: "allies", at: [420, 910], size: 220, look: "rim", rim: LAMP, spread: [130, 0] },
        { role: "target", at: [1200, 880], size: 250, clip: "intro:serve", look: "rim", rim: LIEN, react: [{ at: 0.86, clip: "hurt" }] },
      ],
      vfx: [{ kind: "bli-writ", at: 0, until: 1, x: 1020, y: 660, scale: 1, layer: "front", params: { tx: -580, ty: 150 } }],
      sound: [
        { at: 0.02, sfx: "bli-serve" },
        { at: 0.64, sfx: "bli-return" },
      ],
      text: [{ kind: "voice", at: 0.2, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.3, label: "served" },
        { at: 0.66, label: "torn off" },
        { at: 0.86, label: "served back" },
      ],
    },

    /* 6 · RETURN — the door pulled to, and the fight is on. */
    {
      id: "return",
      kind: "return",
      purpose: "Back to the Bailiff's Court: the door pulled to, and the fight begins.",
      space: "battlefield",
      ms: 560,
      fastMs: 380,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: ["#06070a", 0.45], letterbox: BARS },
      toLighting: { tint: ["#06070a", 0], letterbox: 0 },
      sound: [{ at: 0.04, sfx: "bli-shut" }],
      duck: [{ at: 0.1, level: 1, ms: 10 }],
    },
  ],
};
