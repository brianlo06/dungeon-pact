import type { Clip, Pose, Rig } from "../../battle/animation";
import { face } from "../../battle/face";

/**
 * Give and Take — the Bloodbound's poses.
 *
 * The one time the Reaver's fist opens. Parts: `cleaver` (the back arm and
 * blade, from the back shoulder), `fist` (the front arm, from the front
 * shoulder), `head`, `hair`, `body`, `legs`, and only in a close-up `brow`,
 * `eyes`, `mouth`, and this film's own: `knuckles` (the fist as drawn, closed),
 * `palm` (the open hand), `unwrap` (the bandage coming off), `runOut` and
 * `runBack` (blood running along the blade). See `components/heroes/Reaver.tsx`.
 *
 * The Reaver faces right. A negative `cleaver` rotation brings the blade up in
 * front from where it drags; −120 lays it across the body with the edge
 * underneath, running through the fist. A positive rotation swings it up
 * behind and over; +262 is down and forward, in whatever stands there.
 *
 * Hidden-at-rest parts are slid in by their own keys: the palm sits 60 units
 * below its window (`hand()` lifts it) and the bandage 40 (`y: -0.4`), the runs
 * sit 60 units off the blade (`RUN_REST`): `runOut` x 0.68 puts its head at
 * the grip and 0.96 at the point; `runBack` x −0.24 puts its head at the
 * point and −0.52 at the grip. Every clip that shows the open hand keys
 * `knuckles` and `palm` itself, since a clip's unkeyed parts rest.
 *
 * The brow is a shelf of bone: it is lifted and lowered, never tilted more
 * than 4°.
 */

const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));
const hold = (at: number, pose: Omit<Pose, "at">): Pose => ({ at, ...pose });

/** The run's head along the blade, in blade units (8 at the grip … 36 at the point). */
const out = (at: number, head: number): Pose => ({ at, x: (head + 60) / 100 });
const back = (at: number, head: number): Pose => ({ at, x: (head - 60) / 100 });
/** Hidden: well off the blade. */
const OUT_HIDDEN = 0;
const BACK_HIDDEN = 0;

/** The fist closed, as drawn; and gone, when the hand is open. */
const CLOSED = { scale: 1 };
const OPENED = { scale: 0.01 };
/**
 * The open hand, placed in the drawing's units: its wrist moved by (dx, dy)
 * from where the fist rests, and turned (0 is fingers up). It is drawn over
 * the cleaver and placed on its own, not by the arm, because it lies on the
 * blade; it rests 60 units below its window, so every key lifts it back.
 */
const hand = (at: number, dx: number, dy: number, rotate: number): Pose => ({ at, x: dx / 100, y: dy / 100 - 0.6, rotate });

/** Across the body: the edge under, running through the fist. */
const ACROSS = -118;

/**
 * The call, on the board: the cleaver swung up off the floor to lie across
 * the body, and the fist brought down onto it. Battlefield size.
 */
const call: Clip = {
  duration: 560,
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.3, y: 0.012, rotate: -3, squash: 1.05 },
    { at: 0.55, y: -0.01, rotate: 2, squash: 0.97 },
    { at: 1, y: 0, rotate: 1, squash: 1 },
  ],
  parts: {
    cleaver: turn([0, 0], [0.3, -40], [0.6, ACROSS - 6], [1, ACROSS]),
    fist: turn([0, 0], [0.4, -14], [0.66, 4], [1, 2]),
    head: turn([0, 0], [0.4, -6], [1, 5]),
    hair: turn([0, 0], [0.3, 8], [0.62, -6], [1, 0]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.3, squash: 1.03 },
      { at: 1, squash: 1 },
    ],
  },
};

/**
 * The oath, in an extreme close-up: the bandage comes off, the fist opens,
 * the palm is laid along the edge and drawn down it towards the point, and the
 * blood runs out ahead of it. Timed for FAST's 440ms: the run reaches the
 * point by 0.72 of 600ms and holds. Played with `root: false`.
 */
const oath: Clip = {
  duration: 600,
  poses: [
    { at: 0, y: 0, rotate: 1, squash: 1 },
    { at: 1, y: 0.004, rotate: 2, squash: 1.01 },
  ],
  parts: {
    cleaver: turn([0, ACROSS], [0.3, ACROSS + 1], [0.5, ACROSS - 1.5], [1, ACROSS]),
    fist: [
      { at: 0, rotate: 2, x: 0, y: 0 },
      { at: 0.2, rotate: 0, x: -0.01, y: -0.004 },
      { at: 0.3, rotate: -1, x: -0.1, y: -0.035 },
      { at: 0.62, rotate: -3, x: -0.01, y: 0.03 },
      { at: 1, rotate: -3, x: -0.01, y: 0.03 },
    ],
    knuckles: [hold(0, CLOSED), hold(0.16, { scale: 1.08 }), hold(0.2, OPENED), hold(1, OPENED)],
    palm: [
      hold(0, { y: 0 }),
      hold(0.199, { y: 0 }),
      { ...hand(0.2, 0, -1, 30), scale: 0.9 },
      { ...hand(0.3, -9.2, -3.3, 114), scale: 1 },
      { ...hand(0.62, -1.9, -0.1, 114), scale: 1 },
      { ...hand(1, -1.9, -0.1, 114), scale: 1 },
    ],
    unwrap: [
      hold(0, { y: 0 }),
      hold(0.019, { y: 0 }),
      hold(0.02, { y: -0.4, rotate: 0 }),
      hold(0.2, { y: -0.36, rotate: 12 }),
      hold(0.45, { y: -0.1, rotate: 40 }),
      hold(1, { y: 0.1, rotate: 60 }),
    ],
    runOut: [hold(0, { x: OUT_HIDDEN }), hold(0.27, { x: OUT_HIDDEN }), out(0.28, 12), out(0.62, 27), out(0.74, 36), out(1, 36)],
    head: turn([0, 4], [0.3, 8], [0.62, 6], [1, 5]),
    hair: turn([0, 0], [0.3, 4], [0.6, -3], [1, 0]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.3, squash: 0.98 },
      { at: 1, squash: 1 },
    ],
    ...face(
      [0, { brow: 0.4, knit: 2, open: 0.9, mouth: 1 }],
      [0.2, { brow: 0.8, knit: 3, open: 0.8, mouth: 0.95 }],
      [0.32, { brow: 1.6, knit: 4, open: 0.55, mouth: 1.1, wide: 1.2 }],
      [0.62, { brow: 1.4, knit: 4, open: 0.7, mouth: 1.05, wide: 1.2 }],
      [1, { brow: 1.2, knit: 3, open: 0.8, mouth: 1, wide: 1.15 }],
    ),
  },
};

/**
 * Across the crossroads, over the shoulder: the cleaver held out at the enemy,
 * point down, the open hand at its spine, the blood standing at the point.
 */
const holdOut: Clip = {
  duration: 920,
  poses: [
    { at: 0, y: 0, rotate: 3, squash: 1 },
    { at: 0.5, y: 0.006, rotate: 4.5, squash: 1.02 },
    { at: 1, y: 0.002, rotate: 4, squash: 1.01 },
  ],
  parts: {
    cleaver: turn([0, -120], [0.5, -123], [1, -121]),
    fist: [
      { at: 0, rotate: -2, x: -0.04, y: 0.01 },
      { at: 1, rotate: -3, x: -0.04, y: 0.01 },
    ],
    knuckles: [hold(0, OPENED), hold(1, OPENED)],
    palm: [hand(0, -5, -2, 111), hand(1, -5, -2.4, 112)],
    runOut: [out(0, 36), out(1, 36)],
    head: turn([0, 6], [1, 8]),
    hair: turn([0, 0], [0.4, -8], [0.7, -4], [1, -9]),
    body: [
      { at: 0, squash: 1.01 },
      { at: 1, squash: 1.02 },
    ],
  },
};

/**
 * The quiet: the blade held up and out over the enemy, still. Only a hair of
 * tremble. The Reaver itself is out of the frame; this is for its blade.
 */
const raise: Clip = {
  duration: 560,
  poses: [
    { at: 0, y: 0, rotate: -2, squash: 1 },
    { at: 1, y: 0, rotate: -2, squash: 1 },
  ],
  parts: {
    cleaver: turn([0, -142], [0.5, -141.6], [1, -141.8]),
    fist: turn([0, -30], [1, -32]),
    knuckles: [hold(0, OPENED), hold(1, OPENED)],
    palm: [hand(0, 2, -6.4, -30), hand(1, 2, -6.6, -32)],
    runOut: [out(0, 36), out(1, 36)],
    head: turn([0, -6], [1, -6]),
  },
};

/**
 * The blow. Seen from the moment the cleaver is up over the mane: down through
 * the enemy's guard with the body after it, the open hand thrown back. The
 * blood runs out down the buried blade after the contact.
 */
const strike: Clip = {
  duration: 780,
  markers: { contact: 0.04 },
  poses: [
    { at: 0, x: -0.02, y: 0.004, rotate: -5, squash: 1.04, scale: 1 },
    { at: 0.04, x: 0.09, y: 0.012, rotate: 12, squash: 0.87, scale: 1.04 },
    { at: 0.22, x: 0.1, y: 0.014, rotate: 13, squash: 0.89, scale: 1.03 },
    { at: 0.6, x: 0.08, y: 0.01, rotate: 9, squash: 0.95, scale: 1.02 },
    { at: 1, x: 0.07, y: 0.008, rotate: 8, squash: 0.97, scale: 1.01 },
  ],
  parts: {
    cleaver: turn([0, 186], [0.04, 256], [0.22, 262], [0.6, 260], [1, 259]),
    fist: [
      { at: 0, rotate: -40, x: 0, y: 0 },
      { at: 0.04, rotate: 44, x: -0.06, y: 0 },
      { at: 0.4, rotate: 34, x: -0.05, y: 0 },
      { at: 1, rotate: 28, x: -0.04, y: 0 },
    ],
    knuckles: [hold(0, OPENED), hold(1, OPENED)],
    palm: [hand(0, 1.9, -8.7, -60), hand(0.04, -14, 5.7, 4), hand(0.4, -10.8, 5, 4), hand(1, -10, 5, 0)],
    runOut: [hold(0, { x: OUT_HIDDEN }), hold(0.049, { x: OUT_HIDDEN }), out(0.05, 9), out(0.3, 36), out(1, 36)],
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
      [0, { brow: 1.2, knit: 3, open: 0.8, mouth: 1.1, wide: 1.1 }],
      [0.04, { brow: -0.6, knit: 3, open: 1.2, mouth: 2.2, wide: 1.12 }],
      [0.4, { brow: 0.4, knit: 3, open: 0.95, mouth: 1.6, wide: 1.15 }],
      [1, { brow: 0.6, knit: 3, open: 0.9, mouth: 1.3, wide: 1.2 }],
    ),
  },
};

/**
 * The take, in a face close-up: the blade still down in the enemy, the open
 * hand laid on its spine, and the enemy's blood coming up it into the palm.
 * The head goes back, the brow lifts, the eyes half shut and a long breath is
 * drawn in; then the eyes open on a grin. Timed for FAST's 460ms: the garnet
 * reaches the grip by 0.62 of 640ms. Played with `root: false`.
 */
const take: Clip = {
  duration: 640,
  poses: [
    { at: 0, x: 0.07, y: 0.008, rotate: 8, squash: 0.97 },
    { at: 1, x: 0.05, y: 0.004, rotate: 4, squash: 1 },
  ],
  parts: {
    cleaver: turn([0, 259], [0.16, 240], [1, 239]),
    fist: [
      { at: 0, rotate: 24, x: 0, y: 0 },
      { at: 0.16, rotate: 2, x: -0.08, y: 0.01 },
      { at: 1, rotate: 2, x: -0.08, y: 0.01 },
    ],
    knuckles: [hold(0, OPENED), hold(1, OPENED)],
    palm: [hand(0, -10, 5, 0), hand(0.16, 5.5, -10.7, 202), hand(1, 5.5, -10.7, 202)],
    // The Reaver's own blood has gone into the enemy; the blade is steel again until the enemy's comes back up it.
    runOut: [hold(0, { x: OUT_HIDDEN }), hold(1, { x: OUT_HIDDEN })],
    runBack: [hold(0, { x: BACK_HIDDEN }), hold(0.179, { x: BACK_HIDDEN }), back(0.18, 38), back(0.62, 12), back(1, 12)],
    head: turn([0, 0], [0.2, 2], [0.5, -10], [0.72, -8], [1, -4]),
    hair: turn([0, 0], [0.5, -6], [0.8, 3], [1, 0]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.55, squash: 1.04, y: -0.004 },
      { at: 1, squash: 1.02, y: -0.002 },
    ],
    ...face(
      [0, { brow: 0.6, knit: 3, open: 0.9, mouth: 1.1, wide: 1.1 }],
      [0.2, { brow: 0.4, knit: 2, open: 0.8, mouth: 1 }],
      [0.5, { brow: -1.2, knit: 0, open: 0.35, mouth: 1.3, wide: 0.95 }],
      [0.72, { brow: -1.0, knit: 0, open: 0.45, mouth: 1.2, wide: 1 }],
      [0.86, { brow: -0.4, knit: 1, open: 1.0, mouth: 1.3, wide: 1.28 }],
      [1, { brow: -0.5, knit: 1, open: 1.0, mouth: 1.35, wide: 1.3 }],
    ),
  },
};

/** Back on the board: the blade let down to the floor, the hand closed back into a fist. */
const settle: Clip = {
  duration: 760,
  poses: [
    { at: 0, y: 0.01, rotate: 5, squash: 1.03 },
    { at: 0.35, y: 0.014, rotate: 2, squash: 1.05 },
    { at: 0.65, y: -0.004, rotate: -1, squash: 0.98 },
    { at: 1, y: 0, rotate: 0.8, squash: 1 },
  ],
  parts: {
    cleaver: turn([0, -60], [0.35, 8], [0.5, -3], [1, 0]),
    fist: [
      { at: 0, rotate: 24, scale: 1 },
      { at: 0.4, rotate: -20, scale: 1.1 },
      { at: 0.6, rotate: -14, scale: 1.02 },
      { at: 1, rotate: 0, scale: 1 },
    ],
    head: turn([0, -6], [0.4, 4], [1, 0]),
    hair: turn([0, 0], [0.4, -6], [0.7, 5], [1, 0]),
    body: [
      { at: 0, squash: 1.02 },
      { at: 0.4, squash: 1.04, y: -0.004 },
      { at: 1, squash: 1, y: 0 },
    ],
  },
};

export const poses: Record<string, Rig> = {
  reaver: {
    "ult:give-call": call,
    "ult:give-oath": oath,
    "ult:give-hold": holdOut,
    "ult:give-raise": raise,
    "ult:give-strike": strike,
    "ult:give-take": take,
    "ult:give-settle": settle,
  },
};
