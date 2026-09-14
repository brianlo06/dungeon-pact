import type { Clip, Pose, Rig } from "../../battle/animation";

/**
 * Undertow: the Tidecaller's performance.
 *
 * Debt of Thunder acts under the brim and with the tome; Still Life with a
 * pinch and a stopped hat; Dry Flood with a hand turning over. This film
 * acts with the **open hand held out** — the drawing's own rest gesture,
 * taken to its limit: the arm straight, the fingers as wide as they go, and
 * shaking, because the whole sea is on the other end of it — with the
 * **hat's tip streaming seaward** (it flops every round; here the wind that
 * goes out with the water holds it out straight and trembling), with the
 * **spark** shrunk to a cold point that goes out when the hand drops, and
 * with the whole body **leaning back against the pull**. Parts, from
 * `Arcanist.tsx`: `hand` (the front arm from the shoulder, sleeve and glove;
 * positive lowers it), `spark` (in the glove), `hat` (the crown and its tip,
 * from the band; positive lifts the tip), `head`, `book` (the tome arm,
 * behind), `body`, `legs`.
 *
 * Root tracks play in films. The close-up at the water's edge sets
 * `root: false` on its cue; the other clips are authored for the size they
 * play at (a whole figure up from the sand, a small one on the beach, a unit
 * on the board).
 */

const turn = (...keys: [number, number][]): Pose[] =>
  keys.map(([at, rotate]) => ({ at, rotate }));

/** The arm straight out, a touch above level. */
const OUT = -9;
/** The hat's tip held out seaward by the wind going out with the water. */
const STREAM = 22;
/** The spark, shrunk to a point. */
const POINT = 0.45;

/**
 * The hold, on the board. The arm comes up and out to straight; the spark
 * draws in to a point; the body leans back a little as the weight comes on,
 * and the hat's tip goes out ahead of it.
 */
const hold: Clip = {
  duration: 520,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0 },
    { at: 0.45, x: -0.014, y: -0.004, rotate: -3, squash: 1.02 },
    { at: 1, x: -0.02, y: 0, rotate: -4, squash: 1.02 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: 0, scale: 1 },
      { at: 0.4, rotate: OUT - 6, scale: 1.1 },
      { at: 0.6, rotate: OUT + 2, scale: 1.12 },
      { at: 1, rotate: OUT, scale: 1.12 },
    ],
    spark: [
      { at: 0, scale: 1 },
      { at: 0.4, scale: 1.3 },
      { at: 0.6, scale: POINT },
      { at: 1, scale: POINT },
    ],
    hat: turn([0, 0], [0.3, -4], [0.6, STREAM - 4], [1, STREAM]),
    head: turn([0, 0], [0.5, 2], [1, 3]),
    book: turn([0, 0], [0.5, 6], [1, 8]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.5, squash: 1.03 },
      { at: 1, squash: 1.02 },
    ],
  },
};

/**
 * The strain: held, and shaking. A loop the edge and the low angle both use:
 * the arm out straight and trembling around OUT, the fingers' scale
 * flickering as they spread, the tip out seaward and trembling there, the
 * whole body leant back and juddering with the pull. Nothing in it settles.
 */
const strain: Clip = {
  duration: 900,
  loop: true,
  interruptible: true,
  poses: [
    { at: 0, x: -0.024, y: 0, rotate: -5, squash: 1.02 },
    { at: 0.18, x: -0.03, y: -0.003, rotate: -5.6, squash: 1.025 },
    { at: 0.36, x: -0.026, y: 0.002, rotate: -4.6, squash: 1.02 },
    { at: 0.55, x: -0.032, y: -0.002, rotate: -5.8, squash: 1.03 },
    { at: 0.74, x: -0.025, y: 0.001, rotate: -4.8, squash: 1.02 },
    { at: 1, x: -0.024, y: 0, rotate: -5, squash: 1.02 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: OUT, scale: 1.14 },
      { at: 0.14, rotate: OUT - 2.5, scale: 1.16 },
      { at: 0.27, rotate: OUT + 1.5, scale: 1.13 },
      { at: 0.4, rotate: OUT - 1.5, scale: 1.17 },
      { at: 0.56, rotate: OUT + 2, scale: 1.14 },
      { at: 0.7, rotate: OUT - 3, scale: 1.16 },
      { at: 0.86, rotate: OUT + 1, scale: 1.15 },
      { at: 1, rotate: OUT, scale: 1.14 },
    ],
    spark: [
      { at: 0, scale: POINT },
      { at: 0.3, scale: POINT + 0.1 },
      { at: 0.5, scale: POINT - 0.05 },
      { at: 0.8, scale: POINT + 0.08 },
      { at: 1, scale: POINT },
    ],
    hat: turn([0, STREAM], [0.16, STREAM + 4], [0.32, STREAM - 3], [0.5, STREAM + 5], [0.66, STREAM - 2], [0.84, STREAM + 3], [1, STREAM]),
    head: turn([0, 4], [0.4, 5], [0.7, 3], [1, 4]),
    book: turn([0, 8], [0.45, 10], [0.8, 7], [1, 8]),
    body: [
      { at: 0, squash: 1.02 },
      { at: 0.5, squash: 1.03 },
      { at: 1, squash: 1.02 },
    ],
    legs: [
      { at: 0, squash: 1.03 },
      { at: 0.5, squash: 1.04 },
      { at: 1, squash: 1.03 },
    ],
  },
};

/**
 * The release: the arm drops. From the strain the hand falls to the hip at
 * `contact` (the sea arriving), overshoots and settles; the spark goes out
 * as it goes; the body, let go of, pitches forward off its lean and the tip
 * whips back over the crown. Then it stands and looks down at the water.
 */
const release: Clip = {
  duration: 760,
  markers: { contact: 0.105 },
  poses: [
    { at: 0, x: -0.026, y: 0, rotate: -5, squash: 1.02 },
    { at: 0.105, x: 0.018, y: 0.006, rotate: 3.5, squash: 0.96 },
    { at: 0.24, x: 0.01, y: 0.002, rotate: 2, squash: 1.01 },
    { at: 0.5, x: 0.004, y: 0, rotate: 1, squash: 1 },
    { at: 1, x: 0, y: 0, rotate: 0.5, squash: 1 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: OUT, scale: 1.14 },
      { at: 0.105, rotate: 42, scale: 1.04 },
      { at: 0.2, rotate: 48, scale: 1 },
      { at: 0.4, rotate: 30, scale: 1 },
      { at: 0.62, rotate: 36, scale: 1 },
      { at: 1, rotate: 32, scale: 1 },
    ],
    spark: [
      { at: 0, scale: POINT },
      { at: 0.08, scale: POINT + 0.15 },
      { at: 0.11, scale: 0 },
      { at: 1, scale: 0 },
    ],
    hat: turn([0, STREAM], [0.105, -14], [0.24, 6], [0.4, -4], [0.6, 1], [1, 0]),
    head: turn([0, 4], [0.105, 9], [0.3, 7], [1, 8]),
    book: turn([0, 8], [0.105, -12], [0.3, -4], [1, -2]),
    legs: [
      { at: 0, squash: 1.03 },
      { at: 0.105, squash: 0.95 },
      { at: 0.3, squash: 1.01 },
      { at: 1, squash: 1 },
    ],
  },
};

/**
 * Lowered, on the board. The arm is half down; the hand shakes itself out,
 * three small flicks from the wrist, the tip settling back over the crown
 * after each; then the spark comes back into the glove and it stands as it
 * always stands.
 */
const lower: Clip = {
  duration: 700,
  poses: [
    { at: 0, x: 0.006, y: 0, rotate: 1 },
    { at: 0.2, x: 0.004, y: -0.004, rotate: 0.5 },
    { at: 0.36, x: 0.006, y: 0, rotate: 1 },
    { at: 0.52, x: 0.003, y: -0.003, rotate: 0.3 },
    { at: 1, x: 0, y: 0, rotate: 0 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: 32, scale: 1 },
      { at: 0.14, rotate: 40 },
      { at: 0.24, rotate: 26 },
      { at: 0.36, rotate: 38 },
      { at: 0.46, rotate: 24 },
      { at: 0.58, rotate: 30 },
      { at: 0.76, rotate: 8 },
      { at: 1, rotate: 0, scale: 1 },
    ],
    spark: [
      { at: 0, scale: 0 },
      { at: 0.7, scale: 0 },
      { at: 0.84, scale: 1.3 },
      { at: 1, scale: 1 },
    ],
    hat: turn([0, 6], [0.16, -6], [0.28, 4], [0.4, -5], [0.52, 3], [0.7, -1], [1, 0]),
    head: turn([0, 8], [0.3, 7], [0.6, 4], [1, 0]),
    book: turn([0, -2], [0.3, -4], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  arcanist: {
    "ult:tide-hold": hold,
    "ult:tide-strain": strain,
    "ult:tide-release": release,
    "ult:tide-lower": lower,
  },
};
