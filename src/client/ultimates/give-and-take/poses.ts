import type { Clip, Pose, Rig } from "../../battle/animation";
import { face } from "../../battle/face";

/**
 * Give and Take — the Bloodbound's poses.
 *
 * The one time the Reaver's fist opens. Parts: `cleaver` (the back arm and
 * blade, from the back shoulder), `fist` (the front arm, from the front
 * shoulder), `head`, `hair`, `body`, `legs`, and only in a close-up `brow`,
 * `eyes`, `mouth`, and this film's own: `palm` (the front arm drawn again over
 * the cleaver, an open hand at its end), `fingers` (curled into a fist, or
 * open), `unwrap` (the bandage coming off the hand), `runOut` and `runBack`
 * (blood running along the blade). See `components/heroes/Reaver.tsx`.
 *
 * The Reaver faces right. A negative `cleaver` rotation brings the blade up in
 * front from where it drags; −120 lays it across the body with the edge
 * underneath, running through the fist. A positive rotation swings it up
 * behind and over; +262 is down and forward, in whatever stands there.
 *
 * Hidden-at-rest parts are slid in by their own keys. The open arm sits 60
 * units below its window (`arm()` lifts it) and hangs from the front shoulder,
 * so its hand is always at the end of it; while it plays, the arm the drawing
 * already has is hidden (`fist` at scale 0), so there is only ever one front
 * hand. `arm(at, rotate, length)`: −66° lays it along the blade when the
 * cleaver is across the body; `length` stretches the forearm alone (the hand
 * drawn along the blade towards the point). The runs sit 60 units off the
 * blade (`RUN_REST`): `runOut` x 0.72 puts its head at the grip and 0.96 at
 * the point; `runBack` x −0.22 puts its head at the point and −0.48 at the
 * grip.
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

/** The drawing's own front arm, hidden while the open one plays. */
const GONE: Pose[] = [{ at: 0, scale: 0.01 }, { at: 1, scale: 0.01 }];
/**
 * The open front arm: turned from hanging straight down, stretched along its
 * length alone (scale × squash keeps its width), lifted into its window.
 */
const arm = (at: number, rotate: number, length = 1): Pose => ({
  at,
  y: -0.6,
  rotate,
  scale: Math.sqrt(length),
  squash: 1 / Math.sqrt(length),
});
/** The fingers curled into a fist (short and a little wide), or open. */
const CURLED = { scale: 0.64, squash: 1.55 };
const OPEN = { scale: 1, squash: 1 };
/** Along the blade when the cleaver lies across the body. */
const ALONG = -66;

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
    // One front hand only: the drawing's own arm is hidden, and the open one
    // starts as a bandaged fist on the blade and opens there.
    fist: GONE,
    palm: [arm(0, ALONG + 4, 0.92), arm(0.18, ALONG + 2, 0.94), arm(0.3, ALONG, 1), arm(0.62, ALONG - 2, 1.38), arm(1, ALONG - 2, 1.38)],
    fingers: [hold(0, CURLED), hold(0.15, CURLED), hold(0.28, OPEN), hold(1, OPEN)],
    unwrap: [
      hold(0, { y: 0, rotate: 0, scale: 1 }),
      hold(0.1, { y: 0.02, rotate: 2, scale: 1 }),
      hold(0.22, { y: 0.14, rotate: 24, scale: 0.9 }),
      hold(0.26, { y: 0.2, rotate: 34, scale: 0.01 }),
      hold(1, { y: 0.2, rotate: 34, scale: 0.01 }),
    ],
    runOut: [hold(0, { x: OUT_HIDDEN }), hold(0.27, { x: OUT_HIDDEN }), out(0.28, 12), out(0.6, 27), out(0.72, 36), out(1, 36)],
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
    fist: GONE,
    palm: [arm(0, ALONG + 1, 1.3), arm(1, ALONG, 1.32)],
    fingers: [hold(0, OPEN), hold(1, OPEN)],
    unwrap: [hold(0, { scale: 0.01 }), hold(1, { scale: 0.01 })],
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
    // The open hand down at the side, out of the picture: the blade is what this shot is for.
    fist: GONE,
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
  markers: { contact: 0.09 },
  poses: [
    { at: 0, x: -0.02, y: 0.004, rotate: -5, squash: 1.04, scale: 1 },
    { at: 0.09, x: 0.13, y: -0.05, rotate: 12, squash: 0.9, scale: 1.04 },
    { at: 0.22, x: 0.14, y: -0.04, rotate: 13, squash: 0.92, scale: 1.03 },
    { at: 0.6, x: 0.13, y: -0.02, rotate: 11, squash: 0.95, scale: 1.02 },
    { at: 1, x: 0.12, y: 0, rotate: 10, squash: 0.97, scale: 1.01 },
  ],
  parts: {
    cleaver: turn([0, 200], [0.09, 234], [0.22, 236], [0.6, 235], [1, 234]),
    fist: [
      { at: 0, rotate: 20, x: 0, y: 0 },
      { at: 0.09, rotate: 105, x: -0.08, y: 0 },
      { at: 0.4, rotate: 98, x: -0.07, y: 0 },
      { at: 1, rotate: 92, x: -0.06, y: 0 },
    ],
    runOut: [hold(0, { x: OUT_HIDDEN }), hold(0.099, { x: OUT_HIDDEN }), out(0.1, 9), out(0.3, 36), out(1, 36)],
    head: turn([0, 6], [0.09, 14], [0.3, 10], [1, 8]),
    hair: turn([0, -10], [0.1, 18], [0.22, -8], [0.5, 4], [1, 0]),
    body: [
      { at: 0, squash: 1.03 },
      { at: 0.09, squash: 0.92 },
      { at: 0.4, squash: 0.97 },
      { at: 1, squash: 0.99 },
    ],
    legs: [
      { at: 0, squash: 1.06 },
      { at: 0.09, squash: 0.88 },
      { at: 0.3, squash: 0.92 },
      { at: 1, squash: 0.96 },
    ],
    ...face(
      [0, { brow: 1.2, knit: 3, open: 0.8, mouth: 1.1, wide: 1.1 }],
      [0.09, { brow: -0.6, knit: 3, open: 1.2, mouth: 2.2, wide: 1.12 }],
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
    cleaver: turn([0, 234], [0.16, 232], [1, 232]),
    fist: GONE,
    // The open hand comes down onto the blade's flat and stays there.
    palm: [arm(0, -28, 0.8), arm(0.16, -60, 0.84), arm(1, -60, 0.84)],
    fingers: [hold(0, OPEN), hold(1, OPEN)],
    unwrap: [hold(0, { scale: 0.01 }), hold(1, { scale: 0.01 })],
    // The Reaver's own blood has gone into the enemy; the blade is steel again until the enemy's comes back up it.
    runOut: [hold(0, { x: OUT_HIDDEN }), hold(1, { x: OUT_HIDDEN })],
    runBack: [hold(0, { x: BACK_HIDDEN }), hold(0.179, { x: BACK_HIDDEN }), back(0.18, 38), back(0.62, 17), back(1, 17)],
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
