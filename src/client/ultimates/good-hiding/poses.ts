import type { Clip, Pose, Rig } from "../../battle/animation";
import { face } from "../../battle/face";

/**
 * A Good Hiding — the Ironhide's poses.
 *
 * The Reaver's combat rig already knows how to take a hit: "it takes the hit,
 * snarls, and leans straight back into it". These are that, asked for: the
 * fist beating the chest, the arms opened wide, the blow taken on the face and
 * chest with the eyes open, the cleaver lifted slowly while everything
 * settles, the blow given back, and the blade let down.
 *
 * Parts: `cleaver` (the back arm and blade, from the back shoulder), `fist`
 * (the front arm, from the front shoulder), `head`, `hair`, `body`, `legs`,
 * and, only in a close-up, `brow`, `eyes` and `mouth`. The Reaver faces
 * right: a positive `cleaver` rotation swings the blade up behind and over;
 * a negative `head` rotation throws the chin up. Red Ledger's close-up parts
 * (`stain`, `entry`) are never keyed here, so they stay hidden.
 *
 * The brow is a shelf of bone: it is lifted and lowered, and never tilted
 * more than 4°.
 */

const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/** The fist drawn in onto the chest, where it beats: pulled in across the body and turned down. */
const ON_CHEST = { x: -0.14, y: -0.05, rotate: -8, scale: 0.94 };
/** The fist drawn back off the chest for the next blow. */
const OFF_CHEST = { x: -0.02, y: -0.07, rotate: -62, scale: 1.04 };

/** Arms wide: the fist thrown out and up, the cleaver arm swung back and down. */
const WIDE_FIST = { x: -0.02, y: 0.01, rotate: 64, scale: 1.02 };
const WIDE_CLEAVER = 34;

/**
 * The call, on the board: the point of the cleaver set on the floor, the fist
 * beating the chest twice, the chin coming up. Battlefield size.
 */
const call: Clip = {
  duration: 560,
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.22, y: 0.006, rotate: -1.5, squash: 1.03 },
    { at: 0.34, y: 0.018, rotate: 1.5, squash: 1.08 },
    { at: 0.56, y: 0.004, rotate: -1, squash: 1.02 },
    { at: 0.68, y: 0.018, rotate: 1.5, squash: 1.08 },
    { at: 1, y: -0.008, rotate: -2.5, squash: 0.98 },
  ],
  parts: {
    cleaver: turn([0, 0], [0.3, -8], [1, -6]),
    fist: [
      { at: 0, rotate: 0, x: 0, y: 0, scale: 1 },
      { at: 0.22, ...OFF_CHEST },
      { at: 0.34, ...ON_CHEST },
      { at: 0.56, ...OFF_CHEST },
      { at: 0.68, ...ON_CHEST },
      { at: 1, rotate: 8, x: -0.08, y: 0.005, scale: 0.98 },
    ],
    head: turn([0, 0], [0.34, 6], [0.56, 0], [0.68, 6], [1, -9]),
    hair: turn([0, 0], [0.36, 10], [0.56, -4], [0.7, 10], [1, -6]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.34, squash: 0.95 },
      { at: 0.5, squash: 1.02 },
      { at: 0.68, squash: 0.95 },
      { at: 1, squash: 1.02 },
    ],
  },
};

/**
 * The dare, in a detail: one more blow on the chest, and the arms opened
 * wide; chin up, and the teeth. Its root barely moves: the close-up plays it
 * with `root: false` anyway.
 */
const dare: Clip = {
  duration: 600,
  markers: { contact: 0.26 },
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.26, y: 0.008, rotate: 1, squash: 1.03 },
    { at: 1, y: -0.004, rotate: -1.5, squash: 0.99 },
  ],
  parts: {
    fist: [
      { at: 0, rotate: 8, x: -0.08, y: 0.005, scale: 0.98 },
      { at: 0.14, ...OFF_CHEST },
      { at: 0.26, ...ON_CHEST },
      { at: 0.36, rotate: -2, x: -0.13, y: -0.04, scale: 0.95 },
      { at: 0.62, ...WIDE_FIST, rotate: WIDE_FIST.rotate - 6 },
      { at: 1, ...WIDE_FIST },
    ],
    cleaver: turn([0, -6], [0.3, -4], [0.62, WIDE_CLEAVER - 4], [1, WIDE_CLEAVER]),
    head: turn([0, -4], [0.26, 5], [0.4, 3], [0.7, -10], [1, -9]),
    hair: turn([0, -4], [0.28, 12], [0.44, -6], [0.72, 6], [1, 0]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.26, squash: 0.95 },
      { at: 0.4, squash: 1.01 },
      { at: 0.75, squash: 1.04, y: -0.004 },
      { at: 1, squash: 1.03, y: -0.004 },
    ],
    ...face(
      [0, { brow: 0.8, knit: 2, open: 0.8, mouth: 0.9 }],
      [0.26, { brow: 1.6, knit: 3, open: 0.55, mouth: 0.8, wide: 1.1 }],
      [0.42, { brow: 0.8, knit: 2, open: 0.9, mouth: 1 }],
      [0.72, { brow: -0.8, knit: 1, open: 0.95, mouth: 1.35, wide: 1.25 }],
      [1, { brow: -0.9, knit: 1, open: 0.95, mouth: 1.35, wide: 1.25 }],
    ),
  },
};

/**
 * Open, in front of the enemy: arms wide, chest out, the weight settling back
 * onto the heels to take it. Held.
 */
const open: Clip = {
  duration: 900,
  poses: [
    { at: 0, y: -0.004, rotate: -5, squash: 0.99 },
    { at: 0.5, y: 0.006, rotate: -7, squash: 1.02 },
    { at: 1, y: 0.012, rotate: -8, squash: 1.04 },
  ],
  parts: {
    fist: [
      { at: 0, ...WIDE_FIST },
      { at: 1, ...WIDE_FIST, rotate: WIDE_FIST.rotate + 6 },
    ],
    cleaver: turn([0, WIDE_CLEAVER], [1, WIDE_CLEAVER + 2]),
    head: turn([0, -12], [0.6, -14], [1, -12]),
    hair: turn([0, 0], [0.5, -3], [1, 2]),
    body: [
      { at: 0, squash: 1.03, y: -0.004 },
      { at: 1, squash: 1.05, y: -0.006 },
    ],
    legs: [
      { at: 0, squash: 1 },
      { at: 1, squash: 1.05 },
    ],
  },
};

/**
 * The blow, taken on the face and chest. It lands at 0.04: the head is
 * thrown back, the chest gives, the brow shelf comes down hard over eyes
 * that never close, the jaw sets. Then the head comes forward into it again,
 * and the brow lifts into a grin. Timed so FAST's cut (420ms) sees the grin.
 */
const take: Clip = {
  duration: 560,
  markers: { contact: 0.04 },
  poses: [
    { at: 0, x: 0, y: 0.004, rotate: -3, squash: 1.03 },
    { at: 0.04, x: -0.03, y: 0.01, rotate: -7, squash: 0.95 },
    { at: 0.3, x: 0.01, y: 0.004, rotate: 2, squash: 1.01 },
    { at: 1, x: 0, y: 0.004, rotate: 0, squash: 1 },
  ],
  parts: {
    fist: [
      { at: 0, ...WIDE_FIST, rotate: WIDE_FIST.rotate + 6 },
      { at: 0.06, rotate: -80, x: -0.02, y: -0.02, scale: 1.04 },
      { at: 0.4, rotate: -30, x: 0.01, y: 0, scale: 1.02 },
      { at: 1, rotate: -26, x: 0.01, y: 0, scale: 1.02 },
    ],
    cleaver: turn([0, WIDE_CLEAVER + 2], [0.06, WIDE_CLEAVER - 6], [0.5, -12], [1, -10]),
    head: turn([0, -5], [0.04, -17], [0.14, -14], [0.34, 5], [0.55, 1], [1, 0]),
    hair: turn([0, 2], [0.05, 18], [0.18, -12], [0.36, 6], [0.6, -2], [1, 0]),
    body: [
      { at: 0, squash: 1.05, y: -0.006 },
      { at: 0.04, squash: 0.92, y: 0.006 },
      { at: 0.3, squash: 1.02, y: 0 },
      { at: 1, squash: 1.01, y: 0 },
    ],
    ...face(
      [0, { brow: -0.4, knit: 1, open: 1.1, mouth: 0.85 }],
      [0.04, { brow: 1.8, knit: 4, open: 0.95, mouth: 0.7, wide: 1.12 }],
      [0.2, { brow: 1.6, knit: 4, open: 1.0, mouth: 0.7, wide: 1.12 }],
      [0.46, { brow: 1.0, knit: 3, open: 1.0, mouth: 0.9, wide: 1.1 }],
      [0.7, { brow: 0.2, knit: 2, open: 0.85, mouth: 1.3, wide: 1.25 }],
      [1, { brow: 0, knit: 2, open: 0.85, mouth: 1.35, wide: 1.27 }],
    ),
  },
};

/**
 * The quiet: the cleaver lifted slowly off the floor, up behind the mane, and
 * held there; the fist forward, the weight sinking. Nothing fast.
 */
const raise: Clip = {
  duration: 560,
  poses: [
    { at: 0, y: 0.004, rotate: 0, squash: 1.01 },
    { at: 1, y: 0.014, rotate: -3, squash: 1.05 },
  ],
  parts: {
    cleaver: [
      { at: 0, rotate: 30 },
      { at: 0.7, rotate: 150 },
      { at: 1, rotate: 168 },
    ],
    fist: turn([0, -20], [1, -34]),
    head: turn([0, 2], [1, 6]),
    hair: turn([0, 0], [1, 3]),
    legs: [
      { at: 0, squash: 1 },
      { at: 1, squash: 1.07 },
    ],
  },
};

/**
 * Given back. Seen from the moment the cleaver is over the mane: down, into
 * the enemy, with the whole weight of the body behind it; the fist thrown
 * back for balance. `contact` is the blade arriving.
 */
const strike: Clip = {
  duration: 760,
  markers: { contact: 0.04 },
  poses: [
    { at: 0, x: -0.02, y: 0.004, rotate: -4, squash: 1.04, scale: 1 },
    { at: 0.04, x: 0.09, y: 0.012, rotate: 12, squash: 0.87, scale: 1.04 },
    { at: 0.22, x: 0.1, y: 0.014, rotate: 13, squash: 0.89, scale: 1.03 },
    { at: 0.55, x: 0.08, y: 0.01, rotate: 9, squash: 0.95, scale: 1.02 },
    { at: 1, x: 0.07, y: 0.008, rotate: 7, squash: 0.97, scale: 1.01 },
  ],
  parts: {
    cleaver: turn([0, 170], [0.04, 222], [0.22, 232], [0.55, 230], [1, 228]),
    fist: [
      { at: 0, rotate: -34, x: 0, y: 0, scale: 1 },
      { at: 0.04, rotate: 40, x: -0.06, y: 0, scale: 0.96 },
      { at: 0.4, rotate: 30, x: -0.05, y: 0, scale: 0.97 },
      { at: 1, rotate: 24, x: -0.04, y: 0, scale: 0.98 },
    ],
    head: turn([0, 6], [0.04, 14], [0.3, 10], [1, 8]),
    hair: turn([0, -10], [0.05, 18], [0.22, -8], [0.5, 4], [1, 0]),
    body: [
      { at: 0, squash: 1.03 },
      { at: 0.04, squash: 0.92 },
      { at: 0.4, squash: 0.97 },
      { at: 1, squash: 0.99 },
    ],
    legs: [
      { at: 0, squash: 1.06 },
      { at: 0.04, squash: 0.88 },
      { at: 0.3, squash: 0.92 },
      { at: 1, squash: 0.96 },
    ],
    ...face(
      [0, { brow: 1.4, knit: 3, open: 0.8, mouth: 1.2, wide: 1.1 }],
      [0.04, { brow: -0.6, knit: 3, open: 1.2, mouth: 2.2, wide: 1.12 }],
      [0.4, { brow: 0.6, knit: 3, open: 0.9, mouth: 1.6, wide: 1.15 }],
      [1, { brow: 0.8, knit: 3, open: 0.85, mouth: 1.3, wide: 1.2 }],
    ),
  },
};

/**
 * Back on the board: the blade let down onto the boards, the neck rolled one
 * way and the other, the fist loosened. No close-up parts.
 */
const settle: Clip = {
  duration: 760,
  poses: [
    { at: 0, y: 0.01, rotate: 5, squash: 1.03 },
    { at: 0.3, y: 0.016, rotate: 2, squash: 1.06 },
    { at: 0.6, y: -0.004, rotate: -1, squash: 0.98 },
    { at: 1, y: 0, rotate: 0.8, squash: 1 },
  ],
  parts: {
    cleaver: turn([0, -36], [0.3, 6], [0.45, -2], [1, 0]),
    fist: turn([0, 20], [0.4, -6], [1, 0]),
    head: turn([0, 8], [0.35, -8], [0.62, 7], [1, 0]),
    hair: turn([0, 4], [0.35, -8], [0.62, 8], [1, 0]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.35, squash: 1.04, y: 0.004 },
      { at: 0.7, squash: 0.99 },
      { at: 1, squash: 1, y: 0 },
    ],
  },
};

export const poses: Record<string, Rig> = {
  reaver: {
    "ult:hiding-call": call,
    "ult:hiding-dare": dare,
    "ult:hiding-open": open,
    "ult:hiding-take": take,
    "ult:hiding-raise": raise,
    "ult:hiding-strike": strike,
    "ult:hiding-settle": settle,
  },
};
