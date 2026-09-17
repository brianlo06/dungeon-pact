import type { Clip, Pose, Rig } from "../../battle/animation";

/**
 * Still Life: the Chronomancer's performance.
 *
 * Debt of Thunder acts under the brim, with the tome and its pages. This film
 * never looks under the brim and never opens the book: it acts with the
 * gloved **hand** (a sweep, a pinch, a sleeve flung open), the **spark** in it
 * (pinched to a hard point, gone at the release, back after), and the **hat**,
 * whose tip lags behind every move the Arcanist makes in a round and here, for
 * once, stops. Parts, from `Arcanist.tsx`: `hand` (the front arm from the
 * shoulder, sleeve and glove; negative raises it), `spark` (in the glove),
 * `hat` (the crown and its drooping tip, from the band; negative tips it back
 * over), `head`, `book` (the tome arm, behind), `body`, `legs`.
 *
 * Root tracks play in films now. The root keys here are small, and the two
 * close-ups that are framed on a hand or a hat (`ult:still-pinch` in the
 * pinch, `ult:still-hold` in the quiet) set `root: false` on their cue.
 */

const turn = (...keys: [number, number][]): Pose[] =>
  keys.map(([at, rotate]) => ({ at, rotate }));

/** The pinched spark: a hard small point, brighter for being small. */
const PINCHED = 0.55;
/** The hand held back and up by the brim, the sleeve turned open at the line. */
const BACK = -64;
/** The hat's tip caught mid-flop, and held there. */
const CAUGHT = -13;

/**
 * The pinch. The hand comes up from the hip in one sweep across the body to
 * brim height, turning as it goes, and at the top the fingers close on the
 * spark and pinch it down to a point. The hat's tip lags the sweep, and the
 * spark flickers as it shrinks (a still is taken at each flicker).
 */
const pinch: Clip = {
  duration: 640,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0 },
    { at: 0.5, x: -0.01, y: -0.012, rotate: -1.5 },
    { at: 1, x: -0.012, y: -0.014, rotate: -2 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: 12, x: 0, y: 0.01, scale: 1 },
      { at: 0.25, rotate: -8, x: 0.005, y: 0 },
      { at: 0.5, rotate: -26, x: 0.01, y: -0.01, scale: 1.04 },
      { at: 0.75, rotate: -38, x: 0.012, y: -0.016, scale: 1.06 },
      { at: 1, rotate: -42, x: 0.012, y: -0.018, scale: 1.06 },
    ],
    spark: [
      { at: 0, scale: 1 },
      { at: 0.2, scale: 1.25 },
      { at: 0.24, scale: 0.9 },
      { at: 0.45, scale: 1.1 },
      { at: 0.49, scale: 0.75 },
      { at: 0.7, scale: 0.8 },
      { at: 0.74, scale: PINCHED },
      { at: 1, scale: PINCHED },
    ],
    hat: turn([0, 0], [0.3, 6], [0.6, -4], [0.85, 3], [1, 2]),
    head: turn([0, 0], [0.5, -3], [1, -4]),
    book: turn([0, 0], [0.5, 8], [1, 10]),
  },
};

/**
 * Gather. The hand draws back and up beside the brim with the sleeve's mouth
 * turned open towards the line, and the body leans back to take what comes
 * into it. The sleeve jolts as each still arrives.
 */
const gather: Clip = {
  duration: 560,
  poses: [
    { at: 0, x: -0.012, y: -0.014, rotate: -2 },
    { at: 0.4, x: -0.03, y: -0.01, rotate: -4.5, squash: 1.02 },
    { at: 1, x: -0.035, y: -0.012, rotate: -5, squash: 1.02 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: -42, x: 0.012, y: -0.018, scale: 1.06 },
      { at: 0.35, rotate: BACK - 4, x: -0.01, y: -0.02, scale: 1.1 },
      { at: 0.55, rotate: BACK + 3, x: -0.008, y: -0.018, scale: 1.12 },
      { at: 0.75, rotate: BACK - 3, x: -0.01, y: -0.02, scale: 1.12 },
      { at: 1, rotate: BACK, x: -0.01, y: -0.02, scale: 1.12 },
    ],
    spark: [
      { at: 0, scale: PINCHED },
      { at: 1, scale: PINCHED },
    ],
    hat: turn([0, 2], [0.3, 9], [0.6, CAUGHT - 2], [1, CAUGHT]),
    head: turn([0, -4], [0.4, 4], [1, 3]),
    book: turn([0, 10], [0.5, 22], [1, 24]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.4, squash: 1.02 },
      { at: 1, squash: 1.02 },
    ],
  },
};

/**
 * Stopped. The pose `gather` ends in, held without a breath: the hat's tip
 * caught mid-flop, the spark a point. Only its brightness creeps up.
 */
const hold: Clip = {
  duration: 600,
  poses: [
    { at: 0, x: -0.035, y: -0.012, rotate: -5, squash: 1.02 },
    { at: 1, x: -0.035, y: -0.012, rotate: -5, squash: 1.02 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: BACK, x: -0.01, y: -0.02, scale: 1.12 },
      { at: 1, rotate: BACK, x: -0.01, y: -0.02, scale: 1.12 },
    ],
    spark: [
      { at: 0, scale: PINCHED },
      { at: 0.7, scale: PINCHED },
      { at: 1, scale: PINCHED * 1.15 },
    ],
    hat: turn([0, CAUGHT], [1, CAUGHT]),
    head: turn([0, 3], [1, 3]),
    book: turn([0, 24], [1, 24]),
    body: [
      { at: 0, squash: 1.02 },
      { at: 1, squash: 1.02 },
    ],
  },
};

/**
 * Release. From the held pose the whole arm is flung forward and down at the
 * target, the sleeve's mouth open at it and the glove wide: contact is the
 * end of the throw, and the spark is gone from the hand on that frame. The
 * body pitches after it and the hat's tip, let go, whips back over.
 */
const release: Clip = {
  duration: 640,
  markers: { contact: 0.1 },
  poses: [
    { at: 0, x: -0.035, y: -0.012, rotate: -5, squash: 1.02 },
    { at: 0.1, x: 0.07, y: 0.004, rotate: 6, squash: 0.92, scale: 1.04 },
    { at: 0.35, x: 0.055, y: 0.002, rotate: 4.5, squash: 0.96, scale: 1.03 },
    { at: 1, x: 0.02, y: 0, rotate: 1.5, squash: 1, scale: 1.01 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: BACK, x: -0.01, y: -0.02, scale: 1.12 },
      { at: 0.1, rotate: 16, x: 0.07, y: 0.01, scale: 1.32 },
      { at: 0.3, rotate: 10, x: 0.06, y: 0.008, scale: 1.24 },
      { at: 1, rotate: 5, x: 0.02, y: 0, scale: 1.06 },
    ],
    spark: [
      { at: 0, scale: PINCHED * 1.15 },
      { at: 0.09, scale: PINCHED * 1.3 },
      { at: 0.1, scale: 0 },
      { at: 1, scale: 0 },
    ],
    hat: turn([0, CAUGHT], [0.1, CAUGHT], [0.2, -24], [0.42, 12], [0.64, -6], [0.84, 3], [1, 0]),
    head: turn([0, 3], [0.1, 8], [0.4, 4], [1, 1]),
    book: turn([0, 24], [0.1, -14], [0.5, -6], [1, 0]),
    legs: [
      { at: 0, squash: 1 },
      { at: 0.1, squash: 0.94 },
      { at: 0.4, squash: 0.98 },
      { at: 1, squash: 1 },
    ],
  },
};

/**
 * Settle, on the battlefield. The glove comes back and touches the brim, the
 * spark is back in it, and the hat's tip flops about again as if nothing had
 * happened.
 */
const settle: Clip = {
  duration: 700,
  poses: [
    { at: 0, x: 0.02, y: 0, rotate: 1.5 },
    { at: 0.4, x: 0, y: -0.01, rotate: -1 },
    { at: 1, x: 0, y: 0, rotate: 0 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: 5, x: 0.02, scale: 1.06 },
      { at: 0.4, rotate: -52, x: -0.005, y: -0.012, scale: 1 },
      { at: 0.6, rotate: -48, x: -0.005, y: -0.012 },
      { at: 1, rotate: 0, x: 0, y: 0, scale: 1 },
    ],
    spark: [
      { at: 0, scale: 0 },
      { at: 0.55, scale: 0 },
      { at: 0.7, scale: 1.2 },
      { at: 1, scale: 1 },
    ],
    hat: turn([0, 0], [0.4, 7], [0.55, -5], [0.75, 4], [1, 0]),
    head: turn([0, 1], [0.4, 5], [1, 0]),
    book: turn([0, 0], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  arcanist: {
    "ult:still-pinch": pinch,
    "ult:still-gather": gather,
    "ult:still-hold": hold,
    "ult:still-release": release,
    "ult:still-settle": settle,
  },
};
