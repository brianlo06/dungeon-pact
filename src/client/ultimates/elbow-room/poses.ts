import type { Clip, Pose, Rig } from "../../battle/animation";
import { face } from "../../battle/face";

/**
 * Elbow Room — the Butcher's poses.
 *
 * The combat rig drags the cleaver because it is too big to carry. The Butcher
 * carries it anyway, on its shoulder, in a lane too narrow to carry it in:
 * the neck rolled and the blade hauled up, the head tipped up at a beam an
 * inch over it, a walk up the lane with the blade on the shoulder, the blade
 * swung back level at full reach until it hits the wall, and then one flat
 * swing, the whole body turning after it. Then it puts the blade down and
 * stretches: room at last.
 *
 * Parts: `cleaver` (the back arm and blade, from the back shoulder), `fist`
 * (the front arm), `head`, `hair`, `body`, `legs`, and in a close-up only
 * `brow`, `eyes`, `mouth`. The Reaver faces right. The blade lies along
 * 142° of the cleaver arm at rest (down and back), so a `cleaver` rotation
 * of +38 holds it level behind, about +100 lays it back over the shoulder,
 * −52 points it straight down and −142 level in front.
 *
 * A flat swing cannot be drawn by a profile arm turning in the picture's
 * plane, so it is drawn the way a flat circle looks from the side: the blade
 * goes from level behind, through a short, foreshortened moment pointing at
 * the lens (shrunk to 0.6 and pointing down), to level in front at full
 * length. The swing itself is the effect's to draw (`elbow-sweep`).
 *
 * The brow is a shelf of bone: it lifts and lowers, and never tilts more
 * than 4°.
 */

const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/** The blade laid back over the shoulder. */
const SHOULDERED = 100;
/** Laid back lower on the shoulder, under a beam. */
const LOW = 78;
/** Level behind, at full reach. */
const BACK = 62;

/**
 * The call, on the board: the neck rolled one way and the other, and the
 * cleaver hauled up off the floor onto the shoulder. Battlefield size.
 */
const call: Clip = {
  duration: 560,
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.3, y: 0.01, rotate: -2, squash: 1.04 },
    { at: 0.62, y: -0.012, rotate: 2, squash: 0.97 },
    { at: 1, y: 0, rotate: -1, squash: 1.01 },
  ],
  parts: {
    head: turn([0, 0], [0.22, 10], [0.46, -10], [0.7, 4], [1, -2]),
    hair: turn([0, 0], [0.26, 10], [0.5, -12], [0.74, 6], [1, 0]),
    cleaver: turn([0, 0], [0.3, -6], [0.66, SHOULDERED + 8], [0.82, SHOULDERED - 4], [1, SHOULDERED]),
    fist: turn([0, 0], [0.3, 10], [0.66, -14], [1, -6]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.3, squash: 1.05, y: 0.004 },
      { at: 0.66, squash: 0.97, y: -0.004 },
      { at: 1, squash: 1, y: 0 },
    ],
  },
};

/**
 * Cramped, in a close-up: the blade on the shoulder, the Butcher straightens
 * up and cracks its head on the beam just over it (0.36): the mane squashes,
 * the head is knocked down, the brow shoots up and the eyes go wide; it tips
 * its head back to look up at the beam; then the head comes down, the brow
 * lowers onto the eyes and the mouth pulls into a grin. Its root barely
 * moves, and the shot plays it with `root: false`: the straightening up is
 * the body part. Timed to be grinning inside FAST's 440ms, and held.
 */
const shrug: Clip = {
  duration: 420,
  markers: { contact: 0.36 },
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.36, y: -0.006, rotate: -1, squash: 0.98 },
    { at: 1, y: 0.004, rotate: 1, squash: 1.02 },
  ],
  parts: {
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.32, squash: 0.97, y: -0.03 },
      { at: 0.4, squash: 1.04, y: -0.012 },
      { at: 0.7, squash: 1.02, y: -0.01 },
      { at: 1, squash: 1.01, y: -0.008 },
    ],
    head: [
      { at: 0, rotate: -2, y: 0 },
      { at: 0.32, rotate: -5, y: -0.032 },
      { at: 0.38, rotate: 6, y: -0.004 },
      { at: 0.6, rotate: -16, y: -0.012 },
      { at: 0.85, rotate: 3, y: -0.01 },
      { at: 1, rotate: 4, y: -0.01 },
    ],
    hair: [
      { at: 0, rotate: 0, squash: 1 },
      { at: 0.36, rotate: 8, squash: 1.25 },
      { at: 0.46, rotate: -8, squash: 0.94 },
      { at: 0.72, rotate: 5, squash: 1 },
      { at: 1, rotate: 2, squash: 1 },
    ],
    cleaver: turn([0, LOW], [0.32, LOW + 6], [0.4, LOW - 4], [0.7, LOW + 3], [1, LOW + 2]),
    fist: [
      { at: 0, rotate: -6, x: 0, y: 0 },
      { at: 0.32, rotate: -14, x: 0, y: -0.03 },
      { at: 0.45, rotate: 8, x: 0, y: -0.005 },
      { at: 1, rotate: 0, x: 0, y: -0.008 },
    ],
    ...face(
      [0, { brow: 0.4, knit: 2, open: 0.9, mouth: 0.9 }],
      [0.36, { brow: 0.6, knit: 2, open: 0.5, mouth: 0.7, wide: 1.05 }],
      [0.46, { brow: -1.9, knit: -2, open: 1.3, mouth: 0.8, wide: 0.9 }],
      [0.62, { brow: -1.6, knit: -2, open: 1.25, mouth: 0.8, wide: 0.92 }],
      [0.86, { brow: 0.1, knit: 3, open: 1.1, mouth: 1.3, wide: 1.22 }],
      [1, { brow: 0.2, knit: 3, open: 1.1, mouth: 1.35, wide: 1.27 }],
    ),
  },
};

/**
 * Up the lane, the blade on the shoulder: a heavy walk (two steps a loop),
 * the blade jolting on each step. For the wide.
 */
const stride: Clip = {
  duration: 520,
  loop: true,
  poses: [
    { at: 0, y: 0, rotate: 3, squash: 1 },
    { at: 0.25, y: -0.02, rotate: 4.5, squash: 0.98 },
    { at: 0.5, y: 0.004, rotate: 3, squash: 1.03 },
    { at: 0.75, y: -0.02, rotate: 4.5, squash: 0.98 },
    { at: 1, y: 0, rotate: 3, squash: 1 },
  ],
  parts: {
    legs: [
      { at: 0, squash: 1.05, rotate: 0 },
      { at: 0.25, squash: 0.97, rotate: 4 },
      { at: 0.5, squash: 1.05, rotate: 0 },
      { at: 0.75, squash: 0.97, rotate: -4 },
      { at: 1, squash: 1.05, rotate: 0 },
    ],
    cleaver: turn([0, SHOULDERED], [0.08, SHOULDERED - 4], [0.3, SHOULDERED + 2], [0.58, SHOULDERED - 4], [0.8, SHOULDERED + 2], [1, SHOULDERED]),
    fist: turn([0, -10], [0.25, 6], [0.5, -10], [0.75, 6], [1, -10]),
    head: turn([0, 4], [0.25, 2], [0.5, 4], [0.75, 2], [1, 4]),
    hair: turn([0, 0], [0.3, 5], [0.55, -3], [0.8, 5], [1, 0]),
  },
};

/**
 * The wind-up: feet planted, the blade swung off the shoulder and back, level
 * at full reach, until its point meets the wall behind (0.55) and jars; the
 * body leans back and turns away, the fist out in front for balance. Held.
 */
const wind: Clip = {
  duration: 480,
  markers: { contact: 0.55 },
  poses: [
    { at: 0, x: 0, y: 0, rotate: 2, squash: 1 },
    { at: 0.4, x: -0.03, y: 0.01, rotate: -6, squash: 1.05 },
    { at: 0.55, x: -0.045, y: 0.014, rotate: -9, squash: 1.08 },
    { at: 0.62, x: -0.04, y: 0.012, rotate: -8, squash: 1.06 },
    { at: 1, x: -0.045, y: 0.016, rotate: -9, squash: 1.08 },
  ],
  parts: {
    cleaver: turn([0, SHOULDERED], [0.3, 70], [0.55, BACK - 4], [0.62, BACK + 3], [0.72, BACK - 1], [1, BACK]),
    fist: [
      { at: 0, rotate: -6, x: 0, y: 0, scale: 1 },
      { at: 0.55, rotate: -46, x: 0.03, y: 0.01, scale: 1.04 },
      { at: 1, rotate: -50, x: 0.035, y: 0.01, scale: 1.05 },
    ],
    head: turn([0, 2], [0.4, 8], [0.55, 11], [0.62, 7], [1, 9]),
    hair: turn([0, 0], [0.4, 10], [0.56, -8], [0.7, 6], [1, 2]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.55, squash: 1.04, y: 0.004 },
      { at: 1, squash: 1.05, y: 0.004 },
    ],
    legs: [
      { at: 0, squash: 1 },
      { at: 0.55, squash: 1.1 },
      { at: 1, squash: 1.12 },
    ],
    ...face(
      [0, { brow: 0.6, knit: 2, open: 0.9, mouth: 1 }],
      [0.55, { brow: 1.6, knit: 4, open: 0.6, mouth: 0.8, wide: 1.1 }],
      [1, { brow: 1.6, knit: 4, open: 0.6, mouth: 0.8, wide: 1.1 }],
    ),
  },
};

/** The swing's contact: 130ms in, after the film's 120ms blend into the clip. */
export const SWEEP_MS = 760;
export const SWEEP_CONTACT = 130 / SWEEP_MS;

/**
 * The swing. From the wind-up's pose, the blade comes round flat — level
 * behind, a foreshortened instant at the lens, level in front at full length
 * (contact) — with the whole body turning after it: lunging forward, leaning
 * into it, the fist flung back. It carries on a little past the front and is
 * held there, arm out, while the row goes back down the lane.
 */
const C = SWEEP_CONTACT;
const sweep: Clip = {
  duration: SWEEP_MS,
  markers: { contact: C },
  poses: [
    { at: 0, x: -0.045, y: 0.016, rotate: -9, squash: 1.08, scale: 1 },
    { at: C * 0.7, x: 0.02, y: 0.012, rotate: 0, squash: 0.98, scale: 1.01 },
    { at: C, x: 0.12, y: 0.018, rotate: 3, squash: 0.88, scale: 1.04 },
    { at: C + 0.2, x: 0.14, y: 0.016, rotate: 8, squash: 0.9, scale: 1.04 },
    { at: 0.7, x: 0.13, y: 0.012, rotate: 6, squash: 0.94, scale: 1.02 },
    { at: 1, x: 0.12, y: 0.01, rotate: 5, squash: 0.96, scale: 1.02 },
  ],
  parts: {
    cleaver: [
      { at: 0, rotate: BACK, scale: 1 },
      { at: C * 0.45, rotate: BACK - 14, scale: 0.94 },
      { at: C * 0.72, rotate: -52, scale: 0.6 },
      { at: C, rotate: -113, scale: 1.24 },
      { at: C + 0.2, rotate: -119, scale: 1.2 },
      { at: 0.7, rotate: -117, scale: 1.12 },
      { at: 1, rotate: -115, scale: 1.08 },
    ],
    fist: [
      { at: 0, rotate: -50, x: 0.035, y: 0.01, scale: 1.05 },
      { at: C, rotate: 58, x: -0.06, y: 0, scale: 0.96 },
      { at: C + 0.3, rotate: 50, x: -0.05, y: 0, scale: 0.97 },
      { at: 1, rotate: 44, x: -0.045, y: 0, scale: 0.98 },
    ],
    head: turn([0, 9], [C, -14], [C + 0.3, -12], [1, -8]),
    hair: turn([0, 2], [C * 0.8, 14], [C + 0.06, -16], [C + 0.3, 8], [0.7, -3], [1, 0]),
    body: [
      { at: 0, squash: 1.05 },
      { at: C, squash: 0.9 },
      { at: C + 0.3, squash: 0.96 },
      { at: 1, squash: 0.98 },
    ],
    legs: [
      { at: 0, squash: 1.12 },
      { at: C, squash: 0.86 },
      { at: C + 0.3, squash: 0.92 },
      { at: 1, squash: 0.96 },
    ],
    ...face(
      [0, { brow: 1.6, knit: 4, open: 0.6, mouth: 0.8, wide: 1.1 }],
      [C, { brow: -0.6, knit: 3, open: 1.2, mouth: 2.3, wide: 1.1 }],
      [0.6, { brow: 0.4, knit: 3, open: 0.9, mouth: 1.7, wide: 1.15 }],
      [1, { brow: 0.6, knit: 3, open: 0.85, mouth: 1.4, wide: 1.2 }],
    ),
  },
};

/**
 * Back on the board: the blade let down onto the floor, and the arms and
 * shoulders stretched out wide, chest up. Room at last.
 */
const stretch: Clip = {
  duration: 720,
  poses: [
    { at: 0, y: 0.008, rotate: 6, squash: 0.98 },
    { at: 0.35, y: 0.006, rotate: 0, squash: 1.02 },
    { at: 0.6, y: -0.012, rotate: -4, squash: 1.05 },
    { at: 1, y: 0, rotate: 0.8, squash: 1 },
  ],
  parts: {
    cleaver: turn([0, -150], [0.3, -30], [0.42, 6], [0.6, 30], [1, 0]),
    fist: turn([0, 50], [0.35, 10], [0.6, 60], [1, 0]),
    head: turn([0, 8], [0.35, -4], [0.6, -12], [0.82, 6], [1, 0]),
    hair: turn([0, 4], [0.35, -6], [0.62, 8], [1, 0]),
    body: [
      { at: 0, squash: 0.98 },
      { at: 0.6, squash: 1.06, y: -0.006 },
      { at: 1, squash: 1, y: 0 },
    ],
  },
};

export const poses: Record<string, Rig> = {
  reaver: {
    "ult:elbow-call": call,
    "ult:elbow-shrug": shrug,
    "ult:elbow-stride": stride,
    "ult:elbow-wind": wind,
    "ult:elbow-sweep": sweep,
    "ult:elbow-stretch": stretch,
  },
};
