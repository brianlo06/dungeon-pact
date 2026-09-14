import type { Clip, Pose, Rig } from "../../battle/animation";

/**
 * Dry Flood: the Pyromancer's performance.
 *
 * Debt of Thunder acts under the brim and with the tome; Still Life with a
 * pinch, a flung sleeve and a hat's tip stopped mid-flop. This film acts with
 * the gloved **hand** turning its spark over a drop and letting it go, the
 * **spark** swelling into a flame and leaving the glove, the **hat's tip**
 * lifted by the heat under it (the one time it rises instead of flopping),
 * and the **head** tipping down to watch what it poured. Parts, from
 * `Arcanist.tsx`: `hand` (the front arm from the shoulder, sleeve and glove;
 * positive lowers it), `spark` (in the glove), `hat` (the crown and its tip,
 * from the band; positive lifts the tip), `head`, `book` (the tome arm,
 * behind), `body`, `legs`.
 *
 * Root tracks play in films. The close-up on the lip (`ult:dry-pour`) sets
 * `root: false` on its cue; the other clips are authored for the size they
 * play at (a small figure on the lip, a unit on the board).
 */

const turn = (...keys: [number, number][]): Pose[] =>
  keys.map(([at, rotate]) => ({ at, rotate }));

/** The arm held out over the drop. */
const OUT = -6;
/** The hand turned down: the spark tipped out. */
const TIPPED = 34;
/** The hat's tip, held up by the heat. */
const LIFTED = 15;

/**
 * The catch, on the board. The hand comes up a little, the spark in it draws
 * in small and then catches, bigger than it has ever been; the hat's tip
 * starts to rise.
 */
const catchIt: Clip = {
  duration: 520,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0 },
    { at: 0.4, x: -0.006, y: -0.01, rotate: -1.5, squash: 1.02 },
    { at: 1, x: 0, y: -0.008, rotate: -1, squash: 1.01 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: 0, scale: 1 },
      { at: 0.35, rotate: -20, scale: 1.04 },
      { at: 0.55, rotate: -13, scale: 1.08 },
      { at: 1, rotate: -15, scale: 1.06 },
    ],
    spark: [
      { at: 0, scale: 1 },
      { at: 0.35, scale: 0.55 },
      { at: 0.48, scale: 1.8 },
      { at: 0.6, scale: 1.4 },
      { at: 1, scale: 1.5 },
    ],
    hat: turn([0, 0], [0.3, -4], [0.55, 7], [0.75, 5], [1, 8]),
    head: turn([0, 0], [0.45, -3], [1, -2]),
    book: turn([0, 0], [0.5, -4], [1, -3]),
  },
};

/**
 * The pour, on the lip. The arm is out over the drop with the spark swelling
 * in the glove; the hand tips over and the spark is gone from it, poured.
 * The heat coming up off what it poured lifts the hat's tip and keeps it
 * trembling up there, and the head tips down to watch it go.
 */
const pour: Clip = {
  duration: 640,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0 },
    { at: 0.32, x: 0.008, y: 0, rotate: 1.5 },
    { at: 1, x: 0.012, y: 0.004, rotate: 2.5, squash: 1.01 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: OUT - 4, scale: 1.04 },
      { at: 0.22, rotate: OUT, scale: 1.1 },
      { at: 0.3, rotate: OUT - 5, scale: 1.12 },
      { at: 0.38, rotate: TIPPED + 6, scale: 1.1 },
      { at: 0.52, rotate: TIPPED - 3, scale: 1.08 },
      { at: 1, rotate: TIPPED, scale: 1.08 },
    ],
    spark: [
      { at: 0, scale: 1.3 },
      { at: 0.22, scale: 1.8 },
      { at: 0.33, scale: 2.2 },
      { at: 0.345, scale: 0 },
      { at: 1, scale: 0 },
    ],
    hat: turn([0, 4], [0.25, 8], [0.42, LIFTED + 3], [0.54, LIFTED - 2], [0.66, LIFTED + 2], [0.8, LIFTED - 1], [1, LIFTED]),
    head: turn([0, -2], [0.3, 1], [0.5, 7], [1, 6]),
    book: turn([0, 0], [0.38, -8], [1, -5]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.4, squash: 1.02 },
      { at: 1, squash: 1.02 },
    ],
  },
};

/** When, in the pour, the spark leaves the glove: the effects read it in ms. */
export const POUR_TIP_MS = 0.345 * 640;

/**
 * Send, small on the lip over the flood. The arm, drawn back, is flung down
 * after the fire at `contact` (the fire reaching the row), the whole figure
 * pitching over the drop, and the hat's tip whips and is caught again by the
 * heat.
 */
const send: Clip = {
  duration: 720,
  markers: { contact: 0.12 },
  poses: [
    { at: 0, x: -0.02, y: 0, rotate: -3, squash: 1.03 },
    { at: 0.12, x: 0.05, y: 0.006, rotate: 7, squash: 0.94, scale: 1.03 },
    { at: 0.35, x: 0.035, y: 0.004, rotate: 5, squash: 0.98 },
    { at: 1, x: 0.015, y: 0, rotate: 2.5, squash: 1 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: -34, scale: 1.06 },
      { at: 0.12, rotate: 52, scale: 1.2 },
      { at: 0.3, rotate: 44, scale: 1.12 },
      { at: 1, rotate: 38, scale: 1.06 },
    ],
    spark: [
      { at: 0, scale: 0 },
      { at: 1, scale: 0 },
    ],
    hat: turn([0, LIFTED], [0.12, -16], [0.3, LIFTED + 6], [0.5, LIFTED - 3], [0.75, LIFTED + 2], [1, LIFTED]),
    head: turn([0, -3], [0.12, 9], [0.4, 8], [1, 7]),
    book: turn([0, 8], [0.12, -16], [0.5, -9], [1, -6]),
    legs: [
      { at: 0, squash: 1.02 },
      { at: 0.12, squash: 0.93 },
      { at: 0.4, squash: 0.98 },
      { at: 1, squash: 1 },
    ],
  },
};

/**
 * Swat, on the board. The Pyromancer's own sleeve is alight: it looks down at
 * it, flaps the arm hard, three times, the tome arm coming round to beat at
 * it, and the hat's tip flopping about with every flap; then it stands still
 * as if nothing happened, and the spark comes back into the glove.
 */
const swat: Clip = {
  duration: 760,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0 },
    { at: 0.18, x: -0.01, y: -0.012, rotate: -2.5 },
    { at: 0.3, x: 0.006, y: 0, rotate: 2 },
    { at: 0.42, x: -0.008, y: -0.01, rotate: -2 },
    { at: 0.54, x: 0.004, y: 0, rotate: 1.5 },
    { at: 0.72, x: 0, y: -0.004, rotate: -0.5 },
    { at: 1, x: 0, y: 0, rotate: 0 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: 10, scale: 1 },
      { at: 0.12, rotate: 34, scale: 1.02 },
      { at: 0.22, rotate: -18 },
      { at: 0.32, rotate: 30 },
      { at: 0.42, rotate: -14 },
      { at: 0.52, rotate: 24 },
      { at: 0.64, rotate: -4 },
      { at: 0.8, rotate: 4 },
      { at: 1, rotate: 0, scale: 1 },
    ],
    spark: [
      { at: 0, scale: 0 },
      { at: 0.72, scale: 0 },
      { at: 0.86, scale: 1.25 },
      { at: 1, scale: 1 },
    ],
    hat: turn([0, 8], [0.2, -9], [0.3, 9], [0.42, -8], [0.52, 7], [0.64, -5], [0.8, 3], [1, 0]),
    head: turn([0, 0], [0.12, 9], [0.3, 7], [0.5, 8], [0.7, 2], [1, 0]),
    book: turn([0, 0], [0.2, -22], [0.3, -8], [0.42, -24], [0.54, -6], [0.8, -2], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  arcanist: {
    "ult:dry-catch": catchIt,
    "ult:dry-pour": pour,
    "ult:dry-send": send,
    "ult:dry-swat": swat,
  },
};
