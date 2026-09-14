import type { Cinematic } from "../../shared/cinematic";

/**
 * COMPOUND INTEREST — the Broker · Usurer's Ultimate.
 *
 * The idea, in one sentence: the Usurer bites a copper to mark it as its own,
 * presses it into the wound it has just opened like a nail, and lets it breed
 * — coin begetting coin on the target until the debt has covered it.
 *
 * Only the Usurer could have it. The path trades the Broker's Appraise for the
 * Tithe, a blow that earns; this is the same trade taken to its end, a loan
 * that goes on earning after the film stops. The space is the sink: a
 * swallow-hole under the dungeon crusted to the roof with the coppers older
 * loans have bred, with the shapes of earlier borrowers still held in it. The
 * one thing it uses from the drawing that no other film has touched is the
 * three coin pouches on the belt — and the Broker's own teeth.
 *
 * Rhythm: identity (the bite: the lender's mark is its own jaw) → stakes (the
 * sink answers the new coin; the target stands in the middle of everything
 * that was lent before it; title) → the loan made (the coin pressed home with
 * a thumb, far too small to be worth flinching at) → the quiet (one coin,
 * alone and still, becomes two) → impact (the fist shuts, the doubling runs
 * away, and the target goes down under its own debt) → release (on the real
 * board the crust is still budding, and the pact is paid).
 *
 * Gameplay it shows, each where it happens: 20 damage and Poison for three
 * rounds (the coin pressed in, and the crust that is still growing on the real
 * target when the film hands back), the treasury's cut (coin dripping off the
 * crust onto the floor), and 3 Regeneration for every round it will pay, on
 * every real hero (one copper ring rising per round of it).
 *
 * It shares nothing with Foreclosure or The Small Print: no balance, no coin
 * spun on brass, no vault of shelves, no paper, no brass, no cream, and no
 * blow from the ledger — the Usurer never strikes at all. Storyboard:
 * `docs/ultimates/compound-interest.md`.
 */

const COPPER = "#e08a3c";
const HOT = "#ffd9a0";
const SOOT = "#0e0a08";
const BARS = 0.1;

export const compoundInterest: Cinematic = {
  id: "compound-interest",
  heroId: "broker",
  motif: "usury-motif",
  shots: [
    /* 0 · CALL — a pouch is worked open, and a copper stands on the target. */
    {
      id: "call",
      kind: "call",
      purpose:
        "The round stops: the battlefield sinks to soot, the Broker works a pouch open on its belt, and one copper is already standing over the target.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [SOOT, 0], letterbox: 0 },
      toLighting: { tint: [SOOT, 0.52], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:usury-open" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: COPPER },
        { kind: "usury-coin", at: 0.1, until: 1, anchor: "caster", params: { mode: "purse", size: 0.1 } },
        { kind: "usury-coin", at: 0.3, until: 1, anchor: "targets", params: { mode: "served", size: 0.09 } },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.12, sfx: "usury-open" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4700 }],
      markers: [
        { at: 0, label: "called" },
        { at: 0.3, label: "served" },
      ],
    },

    /* 1 · THE BITE — face close-up: the lender's mark is its own teeth. */
    {
      id: "bite",
      kind: "face-close-up",
      purpose:
        "Identity. The head comes down over the hand — an arm this short does not reach the mouth — and the jaw closes on the copper: brows onto the rims, eyes to slits. Then the coin is held off with a notch bitten out of its rim, and the mouth spreads.",
      space: "cinematic",
      ms: 600,
      fastMs: 380,
      transition: { kind: "black", ms: 60 },
      camera: {
        from: { x: 770, y: 890, zoom: 2.1, rotate: 7 },
        to: { x: 782, y: 876, zoom: 2.32, rotate: 4 },
        ease: "out",
      },
      background: "usury-sink",
      lighting: { exposure: 0.36, under: [COPPER, 0.5], rim: [COPPER, 0.7, 1], vignette: 0.72, letterbox: BARS },
      toLighting: { exposure: 0.5, under: [COPPER, 0.65], rim: [HOT, 0.9, 1], vignette: 0.64, letterbox: BARS },
      actors: [
        {
          role: "caster",
          at: [640, 1500],
          size: 1100,
          clip: "ult:usury-bite",
          then: "ult:usury-bite",
          look: "rim",
          rim: COPPER,
          root: false,
        },
      ],
      vfx: [
        { kind: "usury-coin", at: 0, until: 1, follow: "caster", layer: "front", params: { mode: "hold", size: 0.055, ox: 0.1, oy: -0.44, bite: 0.42, spin: 0.6 } },
        { kind: "motes", at: 0, until: 1, x: 900, y: 700, scale: 1.2, color: COPPER, seed: 6, layer: "back", params: { still: true } },
      ],
      sound: [{ at: 0.42, sfx: "usury-bite" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.42, label: "bite" },
        { at: 0.72, label: "marked" },
      ],
    },

    /* 2 · THE SINK — wide: everything in here was one coin once. */
    {
      id: "sink",
      kind: "wide-hero",
      purpose:
        "Stakes and the space. The bitten coin is held out towards the target, and the sink answers it: a ripple runs away across the crusted walls, coin by coin, over the borrowers still held in it. Title.",
      space: "cinematic",
      ms: 940,
      fastMs: 480,
      transition: { kind: "cut" },
      camera: {
        from: { x: 790, y: 560, zoom: 1.04 },
        to: { x: 830, y: 545, zoom: 1.13, rotate: -0.8 },
        ease: "inOut",
      },
      background: "usury-sink",
      lighting: { exposure: 0.62, under: [COPPER, 0.35], rim: [COPPER, 0.7, 1], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.78, under: [COPPER, 0.5], rim: [HOT, 0.85, 1], vignette: 0.44, letterbox: BARS },
      actors: [
        {
          role: "target",
          at: [1150, 880],
          size: 250,
          face: -1,
          z: 1,
          react: [{ at: 0.52, clip: "anticipate", then: "idle" }],
        },
        { role: "caster", at: [330, 950], size: 600, clip: "ult:usury-offer", look: "rim", rim: COPPER, z: 3 },
      ],
      vfx: [
        { kind: "usury-coin", at: 0, until: 1, follow: "caster", layer: "front", params: { mode: "hold", size: 0.06, ox: 0.28, oy: -0.52, bite: -1, spin: 0.5 } },
        { kind: "glint", at: 0.24, until: 0.5, follow: "caster", x: 168, y: -312, scale: 0.42, color: HOT, layer: "front" },
        { kind: "usury-stir", at: 0.24, until: 0.94, layer: "back" },
        { kind: "usury-creep", at: 0.88, until: 1, layer: "screen", params: { mode: "out" } },
      ],
      sound: [
        { at: 0.2, sfx: "usury-motif" },
        { at: 0.26, sfx: "usury-stir" },
      ],
      text: [
        { kind: "name", at: 0.42, until: 1, text: "$name", x: 0.05, y: 0.2 },
        { kind: "epithet", at: 0.5, until: 1, text: "$epithet", x: 0.05, y: 0.29 },
      ],
      markers: [
        { at: 0.24, label: "offered" },
        { at: 0.42, label: "title" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 800, y: 520, zoom: 0.98 },
            to: { x: 840, y: 510, zoom: 1.06, rotate: -0.8 },
            ease: "inOut",
          },
        },
        boss: {
          camera: {
            from: { x: 810, y: 470, zoom: 0.86 },
            to: { x: 850, y: 460, zoom: 0.94, rotate: -0.8 },
            ease: "inOut",
          },
          actors: [
            {
              role: "target",
              at: [1200, 900],
              size: 230,
              face: -1,
              z: 1,
              react: [{ at: 0.52, clip: "anticipate", then: "idle" }],
            },
            { role: "caster", at: [300, 960], size: 600, clip: "ult:usury-offer", look: "rim", rim: COPPER, z: 3 },
          ],
        },
      },
    },

    /* 3 · THE LOAN — over the shoulder: the coin pressed home like a nail. */
    {
      id: "loan",
      kind: "over-the-shoulder",
      purpose:
        "The loan is made. Past the target's flank and down onto the Usurer's hand: the copper is pressed in with the thumb and held there, and the target flinches at something far too small to be worth flinching at.",
      space: "cinematic",
      ms: 520,
      fastMs: 320,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1010, y: 700, zoom: 1.84, rotate: -6 },
        to: { x: 1000, y: 712, zoom: 1.96, rotate: -3 },
        ease: "out",
      },
      background: "usury-sink",
      lighting: { exposure: 0.52, under: [COPPER, 0.4], rim: [COPPER, 0.8, 1], vignette: 0.6, letterbox: BARS },
      toLighting: { exposure: 0.38, under: [COPPER, 0.3], rim: [HOT, 0.9, 1], vignette: 0.7, letterbox: BARS },
      actors: [
        { role: "caster", at: [790, 990], size: 560, clip: "ult:usury-press", look: "rim", rim: COPPER, z: 3 },
        {
          role: "target",
          at: [1290, 960],
          size: 430,
          face: -1,
          z: 1,
          react: [{ at: 0.42, clip: "hurt", then: "idle" }],
          shove: { at: 0.42, by: [12, 0] },
        },
      ],
      vfx: [
        { kind: "usury-creep", at: 0, until: 0.18, layer: "screen", params: { mode: "in" } },
        {
          kind: "usury-coin",
          at: 0,
          until: 1,
          follow: "caster",
          layer: "front",
          params: { mode: "press", size: 0.07, ox: 0.3, oy: -0.52, tx: 0.62, ty: -0.46, hit: 0.42, bite: 0 },
        },
      ],
      sound: [{ at: 0.36, sfx: "usury-press" }],
      markers: [{ at: 0.42, label: "lent" }],
      framing: {
        boss: {
          camera: {
            from: { x: 1010, y: 810, zoom: 1.7, rotate: -6 },
            to: { x: 1000, y: 820, zoom: 1.8, rotate: -3 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [790, 1030], size: 560, clip: "ult:usury-press", look: "rim", rim: COPPER, z: 3 },
            {
              role: "target",
              at: [1420, 1010],
              size: 300,
              face: -1,
              z: 1,
              react: [{ at: 0.42, clip: "hurt", then: "idle" }],
              shove: { at: 0.42, by: [6, 0] },
            },
          ],
        },
      },
    },

    /* 4 · INTEREST — the quiet: one coin, and then two. */
    {
      id: "interest",
      kind: "extreme-close-up",
      purpose:
        "The quiet. Macro on the seated copper, at the size of a boulder, with nothing moving and the music gone: one tick, and there are two; a pause; two more, and there are four.",
      space: "cinematic",
      ms: 560,
      fastMs: 360,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1128, y: 782, zoom: 4.6 },
        to: { x: 1132, y: 786, zoom: 4.9 },
        ease: "linear",
      },
      background: "usury-sink",
      lighting: { exposure: 0.3, under: [COPPER, 0.45], rim: [COPPER, 0.9, 1], vignette: 0.86, letterbox: 0.13 },
      toLighting: { exposure: 0.16, under: [COPPER, 0.3], rim: [HOT, 1, 1], vignette: 0.92, letterbox: 0.14 },
      actors: [{ role: "target", at: [1290, 960], size: 430, face: -1, z: 1 }],
      vfx: [
        {
          kind: "usury-brood",
          at: 0,
          until: 1,
          follow: "target",
          layer: "front",
          params: { mode: "quiet", gens: 2, step: 0.34, pop: 0.09, size: 0.07, spread: 0.075, bx: 0, by: 0, brx: 0.3, bry: 0.24, notch: 3, seed: 19, ox: 0.18, oy: -0.46 },
          x: 55,
          y: -198,
        },
      ],
      duck: [{ at: 0, level: 0.04, ms: 640 }],
      sound: [
        { at: 0.06, sfx: "usury-tick" },
        { at: 0.4, sfx: "usury-tick-up" },
        { at: 0.46, sfx: "usury-tick" },
        { at: 0.82, sfx: "usury-tick-up", mode: "full" },
        { at: 0.86, sfx: "usury-tick", mode: "full" },
        { at: 0.9, sfx: "usury-tick-up" },
        { at: 0.94, sfx: "usury-tick" },
      ],
      markers: [
        { at: 0.34, label: "it splits" },
        { at: 0.9, label: "and again" },
      ],
    },

    /* 5 · CALLED IN — the impact: the doubling runs away. */
    {
      id: "called-in",
      kind: "impact",
      purpose:
        "Impact. The hand comes off the target and shuts, a wave of shingle runs from the fist to its feet, and the debt doubles away out of nothing until the target is crusted over and driven down under it. Copper-and-soot frame; the damage lands on it.",
      space: "cinematic",
      ms: 780,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1000, y: 640, zoom: 1.36, rotate: 5 },
        to: { x: 980, y: 660, zoom: 1.24, rotate: 1 },
        ease: "out",
      },
      background: "usury-sink",
      lighting: { exposure: 0.92, tint: [COPPER, 0.26], back: [COPPER, 0.85], rim: [HOT, 1, 1], vignette: 0.34, letterbox: BARS },
      toLighting: { exposure: 0.74, tint: [COPPER, 0], back: [COPPER, 0.22], rim: [COPPER, 0.7, 1], vignette: 0.46, letterbox: BARS },
      actors: [
        { role: "caster", at: [660, 980], size: 580, clip: "ult:usury-call", then: "ult:usury-call", look: "rim", rim: COPPER, z: 3 },
        {
          role: "target",
          at: [1160, 900],
          size: 460,
          face: -1,
          z: 1,
          react: [{ at: 0.13, clip: "hurt" }],
          shove: { at: 0.13, by: [26, 22] },
          toTilt: 7,
        },
      ],
      vfx: [
        { kind: "usury-rush", at: 0.04, until: 0.42, layer: "back", params: { over: 0.1, hx: 0.16, hy: 0.02 } },
        {
          kind: "usury-brood",
          at: 0.02,
          until: 1,
          follow: "target",
          layer: "front",
          params: { mode: "run", gens: 8, step: 0.0135, pop: 0.012, size: 0.065, spread: 0.085, bx: 0, by: -0.16, brx: 0.34, bry: 0.38, notch: 9, seed: 23 },
        },
        { kind: "usury-spill", at: 0.13, until: 0.75, follow: "target", layer: "front", params: { count: 26, seed: 8 } },
        { kind: "shockwave", at: 0.13, until: 0.5, follow: "target", y: -140, scale: 1.1, color: COPPER, layer: "front" },
      ],
      screen: [
        { kind: "two-tone", at: 0.13, ms: 70 },
        { kind: "flash", at: 0.2, ms: 60, amount: 0.42, color: HOT },
        { kind: "chromatic", at: 0.13, ms: 110, amount: 0.6 },
      ],
      stop: [{ at: 0.13, ms: 150 }],
      shake: [
        { at: 0.13, amount: 0.034 },
        { at: 0.36, amount: 0.011 },
      ],
      sound: [
        { at: 0, sfx: "usury-run" },
        { at: 0.125, sfx: "usury-impact" },
      ],
      reveal: [{ at: 0.13, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.14, until: 0.9, text: "$damage", x: 0.66, y: 0.2, rotate: 5 },
        { kind: "voice", at: 0.34, until: 1, text: "$voice.impact" },
      ],
      markers: [{ at: 0.13, label: "called in" }],
      framing: {
        large: {
          camera: {
            from: { x: 1010, y: 600, zoom: 1.2, rotate: 4 },
            to: { x: 990, y: 620, zoom: 1.1, rotate: 1 },
            ease: "out",
          },
        },
        boss: {
          camera: {
            from: { x: 1020, y: 540, zoom: 0.96, rotate: 3 },
            to: { x: 1000, y: 556, zoom: 0.9, rotate: 1 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [600, 1000], size: 540, clip: "ult:usury-call", then: "ult:usury-call", look: "rim", rim: COPPER, z: 3 },
            {
              role: "target",
              at: [1180, 940],
              size: 360,
              face: -1,
              z: 1,
              react: [{ at: 0.13, clip: "hurt" }],
              shove: { at: 0.13, by: [8, 6] },
              toTilt: 2,
            },
          ],
          vfx: [
            { kind: "usury-rush", at: 0.04, until: 0.42, layer: "back", params: { over: 0.1, hx: 0.16, hy: 0.02 } },
            {
              kind: "usury-brood",
              at: 0.02,
              until: 1,
              follow: "target",
              layer: "front",
              params: { mode: "run", gens: 9, step: 0.012, pop: 0.012, size: 0.06, spread: 0.08, bx: 0, by: -0.2, brx: 0.3, bry: 0.42, notch: 9, seed: 23 },
            },
            { kind: "usury-spill", at: 0.13, until: 0.75, follow: "target", layer: "front", params: { count: 30, seed: 8 } },
            { kind: "shockwave", at: 0.13, until: 0.5, follow: "target", y: -220, scale: 1.4, color: COPPER, layer: "front" },
          ],
        },
      },
    },

    /* 6 · PAID — the real board: the debt still running, the pact paid. */
    {
      id: "paid",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield the crust is still budding on the target and shedding coppers onto the floor, and over every real hero a ring rises for each round the interest will pay. The Broker pats the pouch shut and tips its cap.",
      space: "battlefield",
      ms: 820,
      fastMs: 520,
      transition: { kind: "flash", ms: 70 },
      background: "battlefield",
      lighting: { tint: [SOOT, 0.42], letterbox: BARS },
      toLighting: { tint: [SOOT, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:usury-settle" }],
      vfx: [
        { kind: "usury-brood", at: 0, until: 1, anchor: "targets", params: { mode: "board", gens: 4, step: 0.1, pop: 0.05, size: 0.05, spread: 0.075, bx: 0, by: -0.2, brx: 0.3, bry: 0.32, notch: 5, seed: 23 } },
        { kind: "usury-drip", at: 0.22, until: 1, anchor: "targets", params: { seed: 17 } },
        { kind: "usury-dividend", at: 0.3, until: 1, anchor: "party", stagger: 70 },
      ],
      sound: [
        { at: 0.22, sfx: "usury-drip" },
        { at: 0.34, sfx: "usury-dividend" },
        { at: 0.62, sfx: "ult-tail" },
      ],
      reveal: [
        { at: 0.3, reveal: "ward" },
        { at: 0.58, reveal: "all" },
      ],
      text: [{ kind: "voice", at: 0.14, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.3, label: "paid" }],
    },
  ],
};
