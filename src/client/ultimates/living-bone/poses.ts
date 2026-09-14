import type { Clip, Pose, Rig } from "../../battle/animation";
import { face } from "../../battle/face";

/**
 * Living Bone — the Warden's poses.
 *
 * The combat rig moves like an old thing in no hurry, and the film keeps that
 * until the one moment it cannot: the Warden reaches up to its own crown,
 * closes its healing hand on the forward tine of the front antler, braces —
 * and wrenches. Then it crosses to the one it is binding and presses the tine
 * to them, gently, the way it would lay a hand on anyone.
 *
 * Parts: `staff` (the back arm and the crooked staff, from the back
 * shoulder), `lantern` (hung from the crook, inside `staff`), `hand` (the
 * open, healing hand, from the front shoulder), `head` (hood and antlers),
 * `brow`, `eyes`, `mouth`, `body`, `legs`. The Warden faces right: forward is
 * +x, and a positive rotation tips a part forward and down. The hand's
 * closing on the tine, the tine leaving the crown and appearing in the fist
 * are the film's own (`--wdn-grasp`, `--wdn-tine`, set by `bone-crown`);
 * these clips put the hand where the tine is and move the body round it.
 *
 * Root tracks play. The battlefield clips (`turn`, `rest`) move the real unit
 * a little; the close-ups (`grip`, `brace`) are cued with `root: false` so a
 * whole-body settle cannot carry the crown out of a frame built on it; the
 * snap's root jolt is small on purpose, because its shot is tight.
 *
 * Face magnitudes are the Warden's: bushy brows that read a knit at 5–10°
 * and a lift at 1–2 units; eyes drawn shut, so `open` below 1 is the lids
 * pressed tighter and nothing here opens them.
 */

const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/** The hand where it holds the tine: up at the crown, forward of the face. */
const AT_CROWN: Omit<Pose, "at"> = { rotate: -92, x: 0.05, y: -0.17, scale: 1.05 };

/**
 * On the battlefield, as the round stops: the head lifts, the open hand
 * rises towards the crown, and the lantern swings once. No face — the figure
 * on the board has none that moves.
 */
const turnUp: Clip = {
  duration: 700,
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.45, y: -0.012, rotate: -1.5, squash: 0.995 },
    { at: 1, y: -0.008, rotate: -1, squash: 1 },
  ],
  parts: {
    head: turn([0, 0], [0.5, -6], [1, -5]),
    hand: [
      { at: 0, rotate: 0, x: 0, y: 0, scale: 1 },
      { at: 0.5, rotate: -58, x: 0.03, y: -0.08 },
      { at: 1, rotate: -78, x: 0.05, y: -0.12 },
    ],
    staff: turn([0, 0], [0.4, -3], [1, -2]),
    lantern: turn([0, 0], [0.25, -10], [0.5, 8], [0.75, -4], [1, 0]),
  },
};

/**
 * The grip. The hand finishes its rise under the forward tine and closes on
 * it; the head tips into the grip; the lantern steadies. Handed to itself so
 * the wide that follows holds the same grip instead of restarting it.
 */
const grip: Clip = {
  duration: 620,
  poses: [{ at: 0 }, { at: 1 }],
  parts: {
    hand: [
      { at: 0, rotate: -78, x: 0.05, y: -0.12, scale: 1 },
      { at: 0.4, ...AT_CROWN, scale: 1.03 },
      { at: 0.55, ...AT_CROWN, scale: 1.06 },
      { at: 1, ...AT_CROWN },
    ],
    head: turn([0, -5], [0.45, 3], [1, 5]),
    staff: turn([0, -2], [0.5, -1], [1, -1]),
    lantern: turn([0, 4], [0.3, -3], [0.6, 1], [1, 0]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.45, squash: 0.985 },
      { at: 1, squash: 0.985 },
    ],
    ...face(
      [0, { brow: -0.3, open: 0.9 }],
      [0.5, { brow: 0.4, knit: 3, open: 0.8, mouth: 0.9 }],
      [1, { brow: 0.6, knit: 4, open: 0.75, mouth: 0.85 }],
    ),
  },
};

/**
 * The quiet. Nothing moves but the face and the fingers: the brow knits and
 * drops, the shut lids press, the mouth sets thin — bracing for a pain it has
 * chosen — and at the end, one small nod.
 */
const brace: Clip = {
  duration: 600,
  poses: [{ at: 0 }, { at: 1 }],
  parts: {
    hand: [
      { at: 0, ...AT_CROWN },
      { at: 0.7, ...AT_CROWN, scale: 1.08 },
      { at: 1, ...AT_CROWN, scale: 1.1 },
    ],
    head: turn([0, 5], [0.7, 5], [0.84, 8], [1, 6.5]),
    staff: turn([0, -1], [1, -1]),
    lantern: turn([0, 0], [1, 0]),
    ...face(
      [0, { brow: 0.6, knit: 4, open: 0.75, mouth: 0.85 }],
      [0.35, { brow: 1.6, knit: 9, open: 0.5, mouth: 0.6, wide: 0.92 }],
      [0.7, { brow: 1.9, knit: 10, open: 0.45, mouth: 0.55, wide: 0.9 }],
      // The nod.
      [0.84, { brow: 1.7, knit: 9, open: 0.5, mouth: 0.6, wide: 0.9 }],
      [1, { brow: 1.7, knit: 9, open: 0.5, mouth: 0.6, wide: 0.9 }],
    ),
  },
};

/**
 * The snap. The fist wrenches down and away with the tine in it; the head
 * jerks the other way and recoils; the lantern, for once, cannot keep up.
 * `contact` is the break: the two-tone frame, the stop, and the cost shown.
 */
const snap: Clip = {
  duration: 600,
  markers: { contact: 0.06 },
  poses: [
    { at: 0, x: 0, rotate: 0, squash: 1 },
    { at: 0.06, x: 0.015, rotate: 2.5, squash: 1.03 },
    { at: 0.2, x: -0.02, rotate: -3, squash: 0.985 },
    { at: 0.45, x: 0.005, rotate: 0.8, squash: 1 },
    { at: 1, x: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    hand: [
      { at: 0, ...AT_CROWN, scale: 1.1 },
      { at: 0.06, rotate: -38, x: 0.1, y: -0.02, scale: 1.1 },
      { at: 0.18, rotate: -28, x: 0.11, y: 0, scale: 1.08 },
      { at: 0.5, rotate: -34, x: 0.1, y: -0.01, scale: 1.06 },
      { at: 1, rotate: -32, x: 0.1, y: -0.01, scale: 1.06 },
    ],
    head: [
      { at: 0, rotate: 6.5, x: 0 },
      { at: 0.06, rotate: -10, x: -0.02 },
      { at: 0.16, rotate: -14, x: -0.025 },
      { at: 0.32, rotate: -6, x: -0.01 },
      { at: 0.6, rotate: -4, x: 0 },
      { at: 1, rotate: -3, x: 0 },
    ],
    staff: turn([0, -1], [0.06, -7], [0.3, 3], [0.6, -1], [1, 0]),
    lantern: turn([0, 0], [0.08, -30], [0.3, 26], [0.5, -14], [0.7, 8], [1, -2]),
    legs: [
      { at: 0, squash: 1 },
      { at: 0.06, squash: 1.06 },
      { at: 0.3, squash: 1 },
      { at: 1, squash: 1 },
    ],
    ...face(
      [0, { brow: 1.7, knit: 9, open: 0.5, mouth: 0.6, wide: 0.9 }],
      // The pain: brows thrown up, the mouth open on it.
      [0.06, { brow: -2.2, knit: -4, open: 1.05, mouth: 2.0, wide: 0.9 }],
      [0.3, { brow: -1.4, knit: -2, open: 0.9, mouth: 1.4, wide: 0.95 }],
      [1, { brow: 0.2, knit: 2, open: 0.8, mouth: 1 }],
    ),
  },
};

/**
 * The graft. The Warden crosses to the bound one (the cue moves the figure;
 * this is the walk in the body) and presses the tine to them: the fist goes
 * forward and opens, the head bows to what it is doing, and the face, for
 * the first time in the film, softens.
 */
const give: Clip = {
  duration: 700,
  markers: { contact: 0.5 },
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.14, y: -0.012, rotate: 1.5, squash: 0.99 },
    { at: 0.28, y: 0, rotate: 0.5, squash: 1.01 },
    { at: 0.42, y: -0.01, rotate: 1.5, squash: 0.99 },
    { at: 0.5, y: 0.004, rotate: 2.5, squash: 1.02 },
    { at: 0.7, y: 0, rotate: 2, squash: 1 },
    { at: 1, y: 0, rotate: 1.5, squash: 1 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: -32, x: 0.1, y: -0.01, scale: 1.06 },
      { at: 0.4, rotate: -26, x: 0.12, y: -0.02, scale: 1.08 },
      { at: 0.5, rotate: -20, x: 0.15, y: -0.03, scale: 1.12 },
      { at: 0.62, rotate: -18, x: 0.155, y: -0.03, scale: 1.12 },
      { at: 1, rotate: -24, x: 0.12, y: -0.02, scale: 1.08 },
    ],
    head: turn([0, -3], [0.3, -1], [0.5, 6], [0.7, 7], [1, 4]),
    staff: turn([0, 0], [0.2, 2], [0.4, -1], [0.5, 3], [1, 2]),
    lantern: turn([0, -2], [0.14, 9], [0.3, -7], [0.46, 5], [0.6, -3], [1, 0]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.5, squash: 0.985 },
      { at: 1, squash: 1 },
    ],
    ...face(
      [0, { brow: 0.2, knit: 2, open: 0.8, mouth: 1 }],
      [0.5, { brow: -0.8, knit: -2, open: 0.85, mouth: 1.1, wide: 1.1 }],
      // A small smile under the moustache.
      [1, { brow: -0.6, knit: -1, open: 0.8, mouth: 1.15, wide: 1.18 }],
    ),
  },
};

/** On the board after: the hand comes down from the crown, the head lifts, the lantern swings home. */
const rest: Clip = {
  duration: 760,
  poses: [
    { at: 0, y: -0.008, rotate: -1, squash: 1 },
    { at: 0.45, y: 0.008, rotate: 1, squash: 1.02 },
    { at: 1, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: -24, x: 0.12, y: -0.02, scale: 1.08 },
      { at: 0.55, rotate: -6, x: 0.02, y: 0, scale: 1.02 },
      { at: 1, rotate: 0, x: 0, y: 0, scale: 1 },
    ],
    head: turn([0, 4], [0.4, -3], [1, 0]),
    staff: turn([0, 2], [0.5, -1], [1, 0]),
    lantern: turn([0, -6], [0.25, 10], [0.5, -5], [0.75, 2], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  warden: {
    "ult:bone-turn": turnUp,
    "ult:bone-grip": grip,
    "ult:bone-brace": brace,
    "ult:bone-snap": snap,
    "ult:bone-give": give,
    "ult:bone-rest": rest,
  },
};
