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
 * The kneel sinks the whole figure into the ground: the film draws the soil in
 * front of every figure's feet, so a Warden lowered a fifth of its height is
 * a Warden on one knee with the knee in the moss, not a Warden in a hole.
 *
 * Face magnitudes are for the Warden's drawing. Its brows are bushy and droop
 * at the ends, so a knit reads at 5–8° and a lift at 1–2 units; its eyes are
 * drawn shut, so `open` below 1 is the lids pressed tighter, and above 1 is
 * only meaningful once the film has opened them (`--wdn-eyes`).
 */

type Part = Record<string, Pose[]>;
const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/** On one knee, the hand laid on the ground, head bowed to it. */
const KNEEL = { y: 0.2, x: 0.02, rotate: 6, squash: 1.03 };
const HAND_DOWN = { rotate: 64, x: 0.03, y: 0.1, scale: 1.05 };
const STAFF_DOWN = { rotate: -7, y: 0.05 };

/** The kneel's held parts at one key, so shots that hold it agree. */
const kneeling = (at: number, head = 11, lantern = 1): Part => ({
  hand: [{ at, ...HAND_DOWN }],
  staff: [{ at, ...STAFF_DOWN }],
  head: [{ at, rotate: head, y: 0.004 }],
  lantern: [{ at, rotate: lantern }],
  legs: [{ at, squash: 1.2, y: 0.02 }],
  body: [{ at, squash: 1.03, y: 0.006 }],
});

const merge = (...parts: Part[]): Part => {
  const out: Part = {};
  for (const p of parts) for (const [k, v] of Object.entries(p)) (out[k] ??= []).push(...v);
  for (const v of Object.values(out)) v.sort((a, b) => a.at - b.at);
  return out;
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
  poses: [
    { at: 0, y: 0.04, x: 0, rotate: 2, squash: 1.02 },
    { at: 0.35, y: 0.17, x: 0.015, rotate: 7, squash: 1.05 },
    { at: 0.5, y: 0.21, x: 0.02, rotate: 6.5, squash: 1.06 },
    { at: 0.62, ...KNEEL, squash: 1.02 },
    { at: 1, ...KNEEL },
  ],
  parts: merge(
    {
      hand: [
        { at: 0, rotate: 38, x: 0.02, y: 0.05, scale: 1 },
        { at: 0.4, rotate: 58, x: 0.035, y: 0.08, scale: 1.02 },
        // The press.
        { at: 0.5, rotate: 67, x: 0.03, y: 0.115, scale: 1.07 },
        { at: 0.62, ...HAND_DOWN },
      ],
      staff: turn([0, -4], [0.4, -8], [0.62, -7]),
      head: turn([0, 9], [0.45, 13], [0.62, 11]),
      lantern: turn([0, 0], [0.3, 14], [0.5, -9], [0.7, 4], [0.85, -1]),
      legs: [
        { at: 0, squash: 1, y: 0 },
        { at: 0.5, squash: 1.2, y: 0.02 },
      ],
      body: [
        { at: 0, squash: 1, y: 0 },
        { at: 0.5, squash: 1.04, y: 0.006 },
      ],
      ...face([0, { brow: 0.2, open: 0.9 }], [0.5, { brow: 0.6, knit: 3, open: 0.8, mouth: 0.9 }], [1, { brow: 0.5, knit: 3, open: 0.8, mouth: 0.9 }]),
    },
    kneeling(1),
  ),
};

/**
 * Listening. Eyes shut and pressed, the brow working at it; one heart comes
 * faint and late, and the brow lifts in the middle — worry; then the mouth
 * sets, the head comes up, and the eyes open.
 */
const hear: Clip = {
  duration: 660,
  poses: [
    { at: 0, ...KNEEL },
    { at: 0.55, ...KNEEL, rotate: 6.6 },
    { at: 0.86, ...KNEEL, y: 0.19, rotate: 4.5 },
    { at: 1, ...KNEEL, y: 0.185, rotate: 4 },
  ],
  parts: {
    head: [
      { at: 0, rotate: 8, y: 0.004 },
      { at: 0.35, rotate: 6, y: 0.002 },
      // Towards the faint one.
      { at: 0.6, rotate: 11, y: 0.006 },
      { at: 0.86, rotate: 1, y: -0.004 },
      { at: 1, rotate: -1, y: -0.006 },
    ],
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
    hand: [{ at: 0, ...HAND_DOWN }, { at: 0.86, ...HAND_DOWN, rotate: 60, scale: 1.08 }, { at: 1, ...HAND_DOWN, rotate: 58, scale: 1.1 }],
    staff: turn([0, -7], [0.86, -7], [1, -9]),
    lantern: turn([0, 1], [1, 1]),
    legs: [{ at: 0, squash: 1.2, y: 0.02 }, { at: 1, squash: 1.2, y: 0.02 }],
    body: [{ at: 0, squash: 1.03, y: 0.006 }, { at: 1, squash: 1.03, y: 0.006 }],
  },
};

/**
 * The reckoning. Up out of the kneel in two frames: the staff comes up and
 * forward, the open hand is flung up and out, the head goes back and the
 * mouth opens on the command. The lantern, for once, cannot keep up.
 * `contact` is the moment it has stood: the burst, and the reveal.
 */
const reckon: Clip = {
  duration: 760,
  markers: { contact: 0.04 },
  poses: [
    { at: 0, ...KNEEL, y: 0.16, rotate: 3 },
    { at: 0.04, y: -0.05, x: -0.01, rotate: -6, squash: 0.94, scale: 1.05, flash: 0.45 },
    { at: 0.14, y: -0.06, x: -0.012, rotate: -7, squash: 0.96, scale: 1.05, flash: 0 },
    { at: 0.4, y: -0.035, x: -0.01, rotate: -5, squash: 0.99, scale: 1.03 },
    { at: 1, y: -0.02, x: -0.008, rotate: -4, squash: 1, scale: 1.02 },
  ],
  parts: {
    staff: [
      { at: 0, rotate: -9, y: 0.05 },
      { at: 0.04, rotate: 8, y: -0.1, x: 0.02 },
      { at: 0.2, rotate: 12, y: -0.11, x: 0.025 },
      { at: 1, rotate: 9, y: -0.09, x: 0.02 },
    ],
    hand: [
      { at: 0, rotate: 58, x: 0.03, y: 0.1, scale: 1.1 },
      { at: 0.04, rotate: -74, x: 0.06, y: -0.04, scale: 1.2 },
      { at: 0.22, rotate: -80, x: 0.065, y: -0.05, scale: 1.22 },
      { at: 1, rotate: -70, x: 0.055, y: -0.035, scale: 1.16 },
    ],
    head: [
      { at: 0, rotate: -1, y: -0.006 },
      { at: 0.04, rotate: -12, y: -0.01 },
      { at: 0.3, rotate: -10, y: -0.008 },
      { at: 1, rotate: -7, y: -0.006 },
    ],
    lantern: turn([0, 1], [0.04, 38], [0.18, -26], [0.36, 18], [0.56, -10], [0.78, 5], [1, -2]),
    legs: [
      { at: 0, squash: 1.18, y: 0.02 },
      { at: 0.04, squash: 0.92, y: -0.01 },
      { at: 0.3, squash: 0.97, y: 0 },
      { at: 1, squash: 1, y: 0 },
    ],
    body: [
      { at: 0, squash: 1.03 },
      { at: 0.04, squash: 0.94 },
      { at: 0.3, squash: 0.98 },
      { at: 1, squash: 1 },
    ],
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

/**
 * The party, lifted by the roots. Root only — every hero rig has the same
 * root, whatever its arms hold — so one pose serves whoever stands beside the
 * Warden: a sag, then a breath drawn up through the feet, then standing
 * taller than before. `flash` is kept to the few frames of the hit-stop.
 */
const lifted: Clip = {
  duration: 740,
  poses: [
    { at: 0, y: 0.012, squash: 1.05, rotate: 1.5, scale: 1, flash: 0 },
    { at: 0.05, y: -0.05, squash: 0.93, rotate: -2, scale: 1.05, flash: 0.35 },
    { at: 0.16, y: -0.06, squash: 0.95, rotate: -2.5, scale: 1.05, flash: 0 },
    { at: 0.5, y: -0.02, squash: 0.99, rotate: -1, scale: 1.02 },
    { at: 1, y: -0.01, squash: 1, rotate: -0.5, scale: 1.01 },
  ],
};

/** Waiting on the web: a slow breath, a little bowed. */
const waiting: Clip = {
  duration: 1100,
  poses: [
    { at: 0, y: 0.006, squash: 1.02, rotate: 1 },
    { at: 0.5, y: 0.012, squash: 1.035, rotate: 1.6 },
    { at: 1, y: 0.008, squash: 1.025, rotate: 1.2 },
  ],
};

const party = (extra: Rig = {}): Rig => ({ "ult:green-lifted": lifted, "ult:green-waiting": waiting, ...extra });

export const poses: Record<string, Rig> = {
  warden: party({
    "ult:green-listen": listen,
    "ult:green-kneel": kneel,
    "ult:green-hear": hear,
    "ult:green-reckon": reckon,
    "ult:green-rest": rest,
  }),
  vanguard: party(),
  arcanist: party(),
  ranger: party(),
  broker: party(),
  herald: party(),
  reaver: party(),
  beguiler: party(),
};
