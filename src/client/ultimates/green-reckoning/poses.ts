import type { Clip, Pose, Rig } from "../../battle/animation";
import { face } from "../../battle/face";

/**
 * Green Reckoning — the Warden's poses.
 *
 * The combat rig already moves like an old thing that is in no hurry: the
 * lantern a pendulum, the heal the slowest gesture it has. These keep that and
 * then break it exactly once. The Warden goes down on one knee and lays the
 * open hand flat on the ground; it listens with its whole face, eyes shut,
 * brow working; and when it has heard every heart it comes up out of the kneel
 * faster than it has ever moved, staff up, hand flung open, eyes open.
 *
 * Parts: `staff` (the back arm and the crooked staff, from the back
 * shoulder), `lantern` (hung from the crook, inside `staff`), `hand` (the
 * open, healing hand, from the front shoulder), `head` (hood and antlers),
 * `brow`, `eyes`, `mouth`, `body`, `legs`. The Warden faces right: forward is
 * +x, and a positive rotation tips a part forward and down.
 *
 * The kneel is built from the parts, not the root. A presentation copy's root
 * track is never written (its `.cine-rig` is attached before the animator
 * exists — see the storyboard's engine notes), so the clips for the film's own
 * copies move every part down together instead: staff, body, head and hand
 * sink by the same amount and the legs fold under. The film draws the soil in
 * front of every foot, so the fold is a knee in the moss. The battlefield
 * clips (`listen`, `rest`) play on the real unit, whose root does move.
 *
 * Face magnitudes are for the Warden's drawing. Its brows are bushy and droop
 * at the ends, so a knit reads at 5–8° and a lift at 1–2 units; its eyes are
 * drawn shut, so `open` below 1 is the lids pressed tighter, and above 1 only
 * shows once the film has opened them (`--wdn-eyes`).
 */

type Part = Record<string, Pose[]>;
const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/** How far the kneel sinks every part, in drawing hundredths. */
const SINK = 0.22;

/** One held body at one key: sunk by `s`, parts as given (their own y added to the sink). */
interface Body {
  s: number;
  hand: Omit<Pose, "at">;
  staff: Omit<Pose, "at">;
  head: Omit<Pose, "at">;
  body?: Omit<Pose, "at">;
  lantern: number;
}

function held(at: number, b: Body): Part {
  const k = b.s / SINK;
  return {
    hand: [{ at, ...b.hand, y: (b.hand.y ?? 0) + b.s }],
    staff: [{ at, ...b.staff, y: (b.staff.y ?? 0) + b.s }],
    head: [{ at, ...b.head, y: (b.head.y ?? 0) + b.s }],
    body: [{ at, rotate: 0, squash: 1 + 0.03 * k, ...b.body, y: (b.body?.y ?? 0) + b.s }],
    legs: [{ at, squash: 1 + 0.35 * k, y: 0.1 * k }],
    lantern: [{ at, rotate: b.lantern }],
  };
}

function bodies(...keys: [number, Body][]): Part {
  const out: Part = {};
  for (const [at, b] of keys) for (const [name, poses] of Object.entries(held(at, b))) (out[name] ??= []).push(...poses);
  return out;
}

const STILL: Pose[] = [{ at: 0 }, { at: 1 }];

/** Knelt, the palm flat on the moss, the head bowed to it. */
const KNELT: Body = {
  s: SINK,
  hand: { rotate: 94, x: 0.02, y: 0.15, scale: 1.08 },
  staff: { rotate: -8, x: 0.02 },
  head: { rotate: 12, x: 0.02 },
  body: { rotate: 3 },
  lantern: 2,
};

/**
 * On the battlefield, as the round stops: the head bows, the open hand drops
 * towards the floor, and the lantern swings once and stills. No face — the
 * figure on the board has none that moves.
 */
const listen: Clip = {
  duration: 700,
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.4, y: 0.02, rotate: 2.5, squash: 1.03 },
    { at: 1, y: 0.03, rotate: 3, squash: 1.04 },
  ],
  parts: {
    head: turn([0, 0], [0.4, 7], [1, 9]),
    hand: [
      { at: 0, rotate: 0, x: 0, y: 0 },
      { at: 0.45, rotate: 34, x: 0.02, y: 0.04 },
      { at: 1, rotate: 40, x: 0.02, y: 0.05 },
    ],
    staff: turn([0, 0], [0.4, -3], [1, -4]),
    lantern: turn([0, 0], [0.25, 12], [0.5, -7], [0.75, 3], [1, 0]),
  },
};

/**
 * Down on one knee, and the hand laid flat on the moss. Slow on the way down,
 * then settled: the palm presses once, the head bows to it. Handed to itself
 * so the wide shot that follows holds the same kneel instead of restarting it.
 */
const kneel: Clip = {
  duration: 680,
  poses: STILL,
  parts: {
    ...bodies(
      [0, { s: 0.04, hand: { rotate: 40, x: 0.02, y: 0.05 }, staff: { rotate: -4 }, head: { rotate: 9 }, lantern: 0 }],
      [0.35, { s: 0.17, hand: { rotate: 80, x: 0.025, y: 0.11, scale: 1.04 }, staff: { rotate: -9, x: 0.01 }, head: { rotate: 14, x: 0.01 }, body: { rotate: 4 }, lantern: 14 }],
      // The press.
      [0.5, { ...KNELT, s: SINK + 0.012, hand: { ...KNELT.hand, rotate: 97, y: 0.165, scale: 1.12 }, lantern: -9 }],
      [0.62, { ...KNELT, lantern: 4 }],
      [0.8, { ...KNELT, lantern: -1 }],
      [1, KNELT],
    ),
    ...face(
      [0, { brow: 0.2, open: 0.9 }],
      [0.5, { brow: 0.6, knit: 3, open: 0.8, mouth: 0.9 }],
      [1, { brow: 0.5, knit: 3, open: 0.8, mouth: 0.9 }],
    ),
  },
};

/**
 * Listening. Eyes shut and pressed, the brow working at it; one heart comes
 * faint and late, and the brow lifts in the middle — worry; then the mouth
 * sets, the head comes up, and the eyes open.
 */
const hear: Clip = {
  duration: 660,
  poses: STILL,
  parts: {
    ...bodies(
      [0, { ...KNELT, head: { rotate: 8, x: 0.02 } }],
      [0.35, { ...KNELT, head: { rotate: 6, x: 0.02, y: -0.002 } }],
      // Towards the faint one.
      [0.6, { ...KNELT, head: { rotate: 11, x: 0.02, y: 0.004 } }],
      [0.86, { ...KNELT, s: SINK - 0.01, head: { rotate: 1, x: 0.015, y: -0.006 }, hand: { ...KNELT.hand, rotate: 90, scale: 1.1 } }],
      [1, { ...KNELT, s: SINK - 0.014, head: { rotate: -1, x: 0.015, y: -0.008 }, hand: { ...KNELT.hand, rotate: 88, scale: 1.12 }, staff: { rotate: -10, x: 0.02 } }],
    ),
    ...face(
      [0, { brow: 0.7, knit: 5, open: 0.8, mouth: 0.9 }],
      [0.35, { brow: 1.2, knit: 8, open: 0.62, mouth: 0.85 }],
      // The heart that barely comes.
      [0.6, { brow: -1, knit: -8, open: 0.7, mouth: 1.25, wide: 0.92 }],
      [0.78, { brow: 1, knit: 7, open: 0.72, mouth: 0.6, wide: 1.02 }],
      // Open.
      [0.9, { brow: -1.9, knit: 2, open: 1.25, mouth: 0.75 }],
      [1, { brow: -2.1, knit: 3, open: 1.3, mouth: 0.75 }],
    ),
  },
};

/**
 * The reckoning. Up out of the kneel in two frames: the staff comes up and
 * forward, the open hand is flung up and out, the head goes back and the
 * mouth opens on the command. The lantern, for once, cannot keep up.
 * `contact` is the moment it has stood: the burst, and the reveal.
 */
const UP: Body = {
  s: -0.06,
  hand: { rotate: -78, x: 0.06, y: -0.04, scale: 1.2 },
  staff: { rotate: 10, x: 0.02, y: -0.1 },
  head: { rotate: -12 },
  body: { rotate: -3, squash: 0.95 },
  lantern: 38,
};

const reckon: Clip = {
  duration: 760,
  markers: { contact: 0.04 },
  poses: STILL,
  parts: {
    ...bodies(
      [0, { ...KNELT, s: SINK - 0.03, head: { rotate: -1, x: 0.015 }, hand: { ...KNELT.hand, rotate: 86, scale: 1.12 } }],
      [0.04, UP],
      [0.16, { ...UP, s: -0.07, hand: { ...UP.hand, rotate: -82, scale: 1.22 }, staff: { ...UP.staff, rotate: 12, y: -0.11 }, lantern: -26 }],
      [0.36, { ...UP, s: -0.045, head: { rotate: -10 }, body: { rotate: -2, squash: 0.98 }, lantern: 18 }],
      [0.58, { ...UP, s: -0.035, head: { rotate: -9 }, body: { rotate: -2 }, lantern: -10 }],
      [1, { ...UP, s: -0.025, hand: { ...UP.hand, rotate: -70, scale: 1.16 }, staff: { ...UP.staff, rotate: 9, y: -0.09 }, head: { rotate: -7 }, body: { rotate: -1.5 }, lantern: -2 }],
    ),
    ...face(
      [0, { brow: -2.1, knit: 3, open: 1.3, mouth: 0.8 }],
      [0.04, { brow: -2.4, knit: 5, open: 1.4, mouth: 2.3, wide: 1.06 }],
      [0.45, { brow: -1.6, knit: 7, open: 1.3, mouth: 1.9, wide: 1.04 }],
      [1, { brow: -0.9, knit: 6, open: 1.2, mouth: 1.25 }],
    ),
  },
};

/** On the board after: the hand comes down, the staff grounds, the lantern swings home. */
const rest: Clip = {
  duration: 760,
  poses: [
    { at: 0, y: -0.03, rotate: -4, scale: 1.02 },
    { at: 0.4, y: 0.012, rotate: 1.5, squash: 1.03, scale: 1 },
    { at: 1, y: 0, rotate: 0, squash: 1, scale: 1 },
  ],
  parts: {
    staff: [
      { at: 0, rotate: 9, y: -0.08 },
      { at: 0.45, rotate: -3, y: 0.01 },
      { at: 1, rotate: 0, y: 0 },
    ],
    hand: [
      { at: 0, rotate: -62, x: 0.04, y: -0.03, scale: 1.1 },
      { at: 0.5, rotate: -12, x: 0.01, scale: 1.02 },
      { at: 1, rotate: 0, x: 0, y: 0, scale: 1 },
    ],
    head: turn([0, -6], [0.45, 3], [1, 0]),
    lantern: turn([0, -10], [0.25, 12], [0.5, -6], [0.75, 3], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  warden: {
    "ult:green-listen": listen,
    "ult:green-kneel": kneel,
    "ult:green-hear": hear,
    "ult:green-reckon": reckon,
    "ult:green-rest": rest,
  },
};
