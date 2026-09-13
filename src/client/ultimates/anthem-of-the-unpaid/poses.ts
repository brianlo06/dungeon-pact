import type { Clip, Pose, Rig } from "../../battle/animation";
import { face, type Expression } from "../../battle/face";

/**
 * Anthem of the Unpaid — the poses.
 *
 * The Herald's combat rig already has the grammar: the horn comes up to the
 * lips and is blown, the chest goes out, the flag never stops moving. Here the
 * horn asks a question and the party answers it, so there are two families:
 *
 *   the Herald   `ult:anthem-lift` (on the board: the horn comes up),
 *                `ult:anthem-call` (the first note, blown with the eyes shut),
 *                `ult:anthem-breathe` (the quiet: the horn comes down, the eyes
 *                open, and the whole chest fills), `ult:anthem-cry` (every voice
 *                at once — the horn thrown up, head back, the mouth wide) and
 *                `ult:anthem-stand` (on the board again, proud and set).
 *   every ally   `ult:anthem-answer` (hearing the note and singing it back) and
 *                `ult:anthem-roar` (the last note, all together).
 *
 * The allies' clips are the one thing in the film every hero wears, so each is
 * written against that hero's own parts: the Vanguard's sword goes up over the
 * helm, the Warden's lantern and open hand, the Broker's balance lifted level,
 * the Reaver's fist. Faces act for the four allies that show one.
 *
 * Nothing here drives a face part in a clip played on the battlefield: the face
 * registers only in a close-up's copy of a figure.
 */

type Part = Record<string, Pose[]>;
const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/** Cloth in a wind that does not let up. */
const billow = (base: number, reach: number, squash = 0.08): Pose[] => [
  { at: 0, rotate: base, squash: 1 },
  { at: 0.18, rotate: base + reach, squash: 1 - squash },
  { at: 0.38, rotate: base - reach * 0.5, squash: 1 + squash },
  { at: 0.6, rotate: base + reach * 0.9, squash: 1 - squash * 0.6 },
  { at: 0.8, rotate: base - reach * 0.3, squash: 1 + squash * 0.5 },
  { at: 1, rotate: base + reach * 0.4, squash: 1 },
];

/* ── The Herald ────────────────────────────────────────────────────────── */

/** The horn at the lips: the rig's rallying note, held. */
const HORN_UP: Pose = { at: 0, rotate: -100, x: 0.03, y: -0.08, scale: 1.04 };

/** On the board: the horn comes up, the chest fills, the banner is set. */
const lift: Clip = {
  duration: 460,
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1, scale: 1 },
    { at: 0.35, y: 0.012, rotate: 1, squash: 1.05 },
    { at: 0.8, y: -0.022, rotate: -2.5, squash: 0.96, scale: 1.03, flash: 0.25 },
    { at: 1, y: -0.02, rotate: -2.5, squash: 0.97, scale: 1.03, flash: 0.1 },
  ],
  parts: {
    horn: [
      { at: 0, rotate: 0, x: 0, y: 0, scale: 1 },
      { at: 0.4, rotate: -55, y: -0.03 },
      { ...HORN_UP, at: 0.8 },
      { ...HORN_UP, at: 1 },
    ],
    banner: turn([0, 0], [0.35, -5], [1, -4]),
    flag: billow(0, -8),
    head: turn([0, 0], [0.4, 2], [0.8, -7], [1, -7]),
    legs: [
      { at: 0, squash: 1 },
      { at: 0.35, squash: 1.05 },
      { at: 1, squash: 1 },
    ],
  },
};

/**
 * The first note. The horn is blown with the eyes shut and the brows up — an
 * earnest, open face, not a war face — and at the end of the note the eyes
 * open on the people it was for.
 */
const call: Clip = {
  duration: 700,
  poses: [
    { at: 0, y: -0.02, rotate: -2.5, squash: 0.97, scale: 1.03 },
    { at: 0.3, y: -0.03, rotate: -4.5, squash: 0.95, scale: 1.045 },
    { at: 0.75, y: -0.028, rotate: -4, squash: 0.955, scale: 1.045 },
    { at: 1, y: -0.024, rotate: -3.4, squash: 0.965, scale: 1.04 },
  ],
  parts: {
    horn: [
      { ...HORN_UP, at: 0 },
      { ...HORN_UP, at: 0.3, rotate: -104, scale: 1.07 },
      { ...HORN_UP, at: 0.75, rotate: -103, scale: 1.06 },
      { ...HORN_UP, at: 1, rotate: -101 },
    ],
    head: turn([0, -7], [0.3, -11], [0.75, -10], [1, -8]),
    banner: turn([0, -4], [1, -5]),
    flag: billow(-4, -10),
    body: [
      { at: 0, squash: 1 },
      { at: 0.3, squash: 0.96 },
      { at: 1, squash: 0.97 },
    ],
    ...face(
      [0, { brow: -1.2, knit: -3, open: 0.3, mouth: 0.55, wide: 0.7 }],
      [0.3, { brow: -1.8, knit: -5, open: 0.2, mouth: 0.5, wide: 0.66 }],
      [0.72, { brow: -1.8, knit: -5, open: 0.22, mouth: 0.5, wide: 0.66 }],
      [0.9, { brow: -1.4, knit: -2, open: 1.25, mouth: 0.55, wide: 0.7 }],
      [1, { brow: -1.2, knit: -1, open: 1.2, mouth: 0.6, wide: 0.72 }],
    ),
  },
};

/**
 * The quiet. The horn comes off the lips and down; nothing moves but the chest
 * filling and the eyes shut — held — until they open at the very end, wide,
 * and the mouth with them: the breath before every voice at once.
 */
const breathe: Clip = {
  duration: 620,
  poses: [
    { at: 0, y: -0.022, rotate: -3, squash: 0.97, scale: 1.04 },
    { at: 0.3, y: -0.026, rotate: -3.4, squash: 0.955, scale: 1.05 },
    { at: 0.75, y: -0.03, rotate: -3.8, squash: 0.94, scale: 1.06 },
    { at: 1, y: -0.034, rotate: -4.4, squash: 0.93, scale: 1.065 },
  ],
  parts: {
    horn: [
      { at: 0, rotate: -70, x: 0.02, y: -0.05, scale: 1.02 },
      { at: 0.3, rotate: -38, x: 0.01, y: -0.03, scale: 1 },
      { at: 1, rotate: -34, x: 0.01, y: -0.03, scale: 1 },
    ],
    head: turn([0, -4], [0.3, -3], [0.72, -4], [0.86, -9], [1, -11]),
    banner: turn([0, -5], [1, -5]),
    // The flag hangs: the one moment in the film it does not fly.
    flag: [
      { at: 0, rotate: 8, squash: 0.9 },
      { at: 1, rotate: 9, squash: 0.88 },
    ],
    body: [
      { at: 0, squash: 0.98 },
      { at: 0.75, squash: 0.95 },
      { at: 1, squash: 0.94 },
    ],
    ...face(
      [0, { brow: 0.2, open: 0.14, mouth: 0.7, wide: 0.9 }],
      [0.7, { brow: 0.3, knit: 1, open: 0.12, mouth: 0.68, wide: 0.9 }],
      [0.82, { brow: -2.2, knit: -5, open: 1.45, mouth: 1.5, wide: 0.86 }],
      [1, { brow: -2.6, knit: -6, open: 1.5, mouth: 1.95, wide: 0.84 }],
    ),
  },
};

/**
 * Every voice at once. Cut into at its height: the horn thrown up over the
 * head in a fist, the banner raised, head back and the mouth wide. Its
 * `contact` is the chord landing, the frame the film goes two-tone on.
 */
const CRY: Expression = { brow: -1.8, knit: 3, open: 1.2, mouth: 2.7, wide: 1.12 };
const cry: Clip = {
  duration: 900,
  markers: { contact: 0.024 },
  poses: [
    { at: 0, y: -0.05, rotate: -6, squash: 0.9, scale: 1.08, flash: 0.3 },
    { at: 0.024, y: -0.06, rotate: -7, squash: 0.88, scale: 1.1, flash: 0.9 },
    { at: 0.16, y: -0.047, rotate: -5.6, squash: 0.915, scale: 1.08, flash: 0 },
    { at: 0.6, y: -0.04, rotate: -5, squash: 0.93, scale: 1.075 },
    { at: 1, y: -0.038, rotate: -4.6, squash: 0.94, scale: 1.07 },
  ],
  parts: {
    horn: [
      { at: 0, rotate: -150, x: 0.05, y: -0.12, scale: 1.1 },
      { at: 0.024, rotate: -158, x: 0.06, y: -0.14, scale: 1.14 },
      { at: 0.3, rotate: -150, x: 0.05, y: -0.125, scale: 1.1 },
      { at: 1, rotate: -146, x: 0.05, y: -0.12, scale: 1.08 },
    ],
    banner: [
      { at: 0, rotate: 8, y: -0.06 },
      { at: 0.024, rotate: 10, y: -0.08 },
      { at: 0.4, rotate: 6, y: -0.06 },
      { at: 1, rotate: 5, y: -0.055 },
    ],
    flag: billow(-10, -16, 0.14),
    head: turn([0, -14], [0.024, -17], [0.3, -13], [1, -12]),
    body: [
      { at: 0, squash: 0.94 },
      { at: 0.024, squash: 0.92 },
      { at: 1, squash: 0.95 },
    ],
    legs: [
      { at: 0, squash: 1.04 },
      { at: 0.024, squash: 1.08 },
      { at: 1, squash: 1.03 },
    ],
    ...face(
      [0, CRY],
      [0.024, { ...CRY, mouth: 2.9, open: 1.3 }],
      [0.5, { ...CRY, mouth: 2.6 }],
      [1, { ...CRY, mouth: 2.4, brow: -1.4 }],
    ),
  },
};

/** On the board after it: the horn comes down to the hip, the chin stays up. */
const stand: Clip = {
  duration: 760,
  poses: [
    { at: 0, y: -0.03, rotate: -4, squash: 0.95, scale: 1.05 },
    { at: 0.35, y: 0.01, rotate: 1, squash: 1.04, scale: 1.01 },
    { at: 1, y: 0, rotate: 0, squash: 1, scale: 1 },
  ],
  parts: {
    horn: [
      { at: 0, rotate: -120, x: 0.04, y: -0.1, scale: 1.06 },
      { at: 0.45, rotate: 10, x: 0, y: 0, scale: 1 },
      { at: 1, rotate: 0, x: 0, y: 0, scale: 1 },
    ],
    banner: [
      { at: 0, rotate: 5, y: -0.05 },
      { at: 0.4, rotate: -3, y: 0.01 },
      { at: 1, rotate: 0, y: 0 },
    ],
    flag: billow(-6, -9),
    head: turn([0, -10], [0.4, -2], [1, -3]),
  },
};

/* ── Every ally ────────────────────────────────────────────────────────── */

/**
 * How each hero lifts what it carries: the parts, at the height of the roar
 * (`k` = 1) and the answer (`k` ≈ 0.45). Rotations follow each combat rig's
 * own sense of up.
 */
const LIFT: Record<string, (k: number) => Part> = {
  vanguard: (k) => ({
    sword: [{ at: 0, rotate: 126 * k }],
    blade: [{ at: 0, rotate: -90 * k }],
    shield: [{ at: 0, rotate: -4 * k, y: 0.02 * k }],
    cape: [{ at: 0, rotate: -12 * k }],
  }),
  arcanist: (k) => ({
    hand: [{ at: 0, rotate: -78 * k, y: -0.02 * k, scale: 1 + 0.15 * k }],
    book: [{ at: 0, rotate: -40 * k }],
    hat: [{ at: 0, rotate: -7 * k }],
  }),
  ranger: (k) => ({
    bow: [{ at: 0, rotate: -34 * k, y: -0.04 * k }],
    draw: [{ at: 0, rotate: -70 * k }],
    arrow: [{ at: 0, rotate: 40 * k }],
    cloak: [{ at: 0, rotate: -10 * k }],
  }),
  warden: (k) => ({
    hand: [{ at: 0, rotate: -64 * k, x: 0.04 * k, scale: 1 + 0.12 * k }],
    staff: [{ at: 0, rotate: 6 * k, y: -0.07 * k }],
    lantern: [{ at: 0, rotate: -10 * k }],
  }),
  broker: (k) => ({
    scales: [{ at: 0, rotate: -26 * k, x: 0.04 * k, scale: 1 + 0.08 * k }],
    // Counter-turned, so the beam hangs level while the arm is up.
    pans: [{ at: 0, rotate: 26 * k }],
    ledger: [{ at: 0, rotate: -12 * k }],
    purse: [{ at: 0, rotate: -6 * k }],
  }),
  reaver: (k) => ({
    fist: [{ at: 0, rotate: -95 * k, scale: 1 + 0.2 * k }],
    hair: [{ at: 0, rotate: -9 * k, scale: 1 + 0.1 * k }],
    cleaver: [{ at: 0, rotate: 14 * k }],
  }),
  beguiler: (k) => ({
    shard: [{ at: 0, rotate: 150 * k, scale: 1 + 0.2 * k }],
    control: [{ at: 0, rotate: 8 * k }],
    strings: [{ at: 0, rotate: -12 * k }],
  }),
};

/** Heroes whose faces a close-up can move. */
const FACED = new Set(["ranger", "warden", "broker", "reaver"]);

/** A track of lifts, keyed through time: `[at, k]`. */
function lifted(hero: string, keys: [number, number][]): Part {
  const out: Part = {};
  for (const [at, k] of keys)
    for (const [name, [pose]] of Object.entries(LIFT[hero](k))) (out[name] ??= []).push({ ...pose, at });
  return out;
}

/**
 * Hearing the note, and singing it back. The head comes up towards it, what
 * the hero carries lifts, and a face opens into the note. The film staggers
 * the allies' answers one after another on top of this (see `anthem-voices`).
 */
function answer(hero: string): Clip {
  return {
    duration: 1000,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.22, y: 0.008, rotate: 1.2, squash: 1.03 },
      { at: 0.55, y: -0.02, rotate: -2.2, squash: 0.97, scale: 1.02 },
      { at: 1, y: -0.024, rotate: -2.6, squash: 0.965, scale: 1.025 },
    ],
    parts: {
      head: turn([0, 0], [0.22, 3], [0.55, -8], [1, -9]),
      ...lifted(hero, [
        [0, 0],
        [0.22, 0.05],
        [0.6, 0.42],
        [1, 0.46],
      ]),
      ...(FACED.has(hero)
        ? face(
            [0, {}],
            [0.22, { brow: -0.8, open: 1.25, mouth: 0.9 }],
            [0.55, { brow: -1.4, knit: -3, open: 1.1, mouth: 2, wide: 0.9 }],
            [1, { brow: -1.5, knit: -3, open: 1.05, mouth: 2.1, wide: 0.9 }],
          )
        : {}),
    },
  };
}

/** The last note, all together: cut into at its height and held. */
function roar(hero: string): Clip {
  return {
    duration: 900,
    poses: [
      { at: 0, y: -0.04, rotate: -5, squash: 0.92, scale: 1.06, flash: 0.4 },
      { at: 0.03, y: -0.05, rotate: -6, squash: 0.9, scale: 1.08, flash: 0.7 },
      { at: 0.16, y: -0.04, rotate: -5, squash: 0.93, scale: 1.06, flash: 0 },
      { at: 1, y: -0.03, rotate: -4, squash: 0.95, scale: 1.045 },
    ],
    parts: {
      head: turn([0, -12], [0.03, -14], [0.4, -11], [1, -10]),
      ...lifted(hero, [
        [0, 0.92],
        [0.03, 1],
        [0.4, 0.95],
        [1, 0.94],
      ]),
      ...(FACED.has(hero)
        ? face(
            [0, { brow: -1.6, knit: 2, open: 1.2, mouth: 2.5, wide: 1.1 }],
            [0.4, { brow: -1.5, knit: 2, open: 1.15, mouth: 2.4, wide: 1.08 }],
            [1, { brow: -1.3, knit: 1, open: 1.1, mouth: 2.2, wide: 1.05 }],
          )
        : {}),
    },
  };
}

const allies = ["vanguard", "arcanist", "ranger", "warden", "broker", "reaver", "beguiler"];

export const poses: Record<string, Rig> = {
  herald: {
    "ult:anthem-lift": lift,
    "ult:anthem-call": call,
    "ult:anthem-breathe": breathe,
    "ult:anthem-cry": cry,
    "ult:anthem-stand": stand,
  },
  ...Object.fromEntries(
    allies.map((hero) => [hero, { "ult:anthem-answer": answer(hero), "ult:anthem-roar": roar(hero) } as Rig]),
  ),
};
