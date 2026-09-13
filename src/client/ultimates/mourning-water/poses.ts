import type { Clip, Pose, Rig } from "../../battle/animation";
import { face } from "../../battle/face";

/**
 * Mourning Water — the Hollow Druid's poses.
 *
 * The Warden's combat rig is an old thing in no hurry, and its heal is its
 * slowest, most open gesture: the hand offered up and out. These keep the
 * slowness and take the openness away a little at a time. The head bows; the
 * face under the hood breaks, eyes still shut; the open hand lifts to catch
 * one tear and sinks under the weight of it; then it is raised across the
 * water and closes (the fingers are `--wdn-grasp`, set by the film), and on
 * the board after, it opens again as if it cost something.
 *
 * Parts: `staff` (the back arm and the crooked staff, from the back
 * shoulder), `lantern` (inside `staff`), `hand` (the open hand, from the
 * front shoulder), `head`, `brow`, `eyes`, `mouth`, `body`, `legs`. Facing
 * right, a positive rotation tips a part forward and down; a negative one
 * lifts the hand.
 *
 * Root keys are authored for the shot each clip plays in: the battlefield
 * clips (`bow`, `open`) and the wide `pour` move the whole figure; the
 * close-ups (`weep`, `cup`, `grasp`) keep the root still and their cues set
 * `root: false` as well, so nothing carries the face or the hand out of a
 * tight frame.
 *
 * Face magnitudes are for the Warden's drawing: bushy brows that droop at the
 * ends read a knit at 5–8° and a lift at 1–2 units; the eyes are drawn shut,
 * so `open` under 1 is the lids pressing tighter. Grief here is the inner
 * brow lifting (a negative knit) with the lids pressed, the reverse of the
 * base film's listening frown, and the eyes never open.
 */

const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));
const STILL: Pose[] = [{ at: 0 }, { at: 1 }];

/**
 * On the battlefield, as the round stops: the whole figure sinks and leans
 * in over itself, the head bows low, the open hand is drawn in to the chest,
 * and the lantern swings once and stills.
 */
const bow: Clip = {
  duration: 760,
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.35, y: 0.03, rotate: 3.5, squash: 1.05 },
    { at: 0.7, y: 0.035, rotate: 4.5, squash: 1.06 },
    { at: 1, y: 0.035, rotate: 4, squash: 1.055 },
  ],
  parts: {
    head: turn([0, 0], [0.35, 12], [1, 16]),
    hand: [
      { at: 0, rotate: 0, x: 0, y: 0 },
      { at: 0.4, rotate: 26, x: -0.035, y: 0.01 },
      { at: 1, rotate: 30, x: -0.045, y: 0.012 },
    ],
    staff: turn([0, 0], [0.4, -4], [1, -5]),
    lantern: turn([0, 0], [0.22, 14], [0.46, -9], [0.7, 4], [1, 0]),
    body: [
      { at: 0, rotate: 0 },
      { at: 1, rotate: 3 },
    ],
  },
};

/**
 * The tear. Under the hood, eyes shut: the inner ends of the brows lift and
 * knot, the lids press, the mouth sets thin and then gives, twice — and the
 * head shudders once with the breath that goes with it.
 */
const weep: Clip = {
  duration: 720,
  poses: STILL,
  parts: {
    head: [
      { at: 0, rotate: 10 },
      { at: 0.4, rotate: 12 },
      // The shudder.
      { at: 0.52, rotate: 8.5, y: -0.004 },
      { at: 0.6, rotate: 12.5, y: 0.002 },
      { at: 0.7, rotate: 10.5 },
      { at: 1, rotate: 13, y: 0.003 },
    ],
    hand: turn([0, 26], [1, 24]),
    staff: turn([0, -5], [1, -5]),
    ...face(
      [0, { brow: 0.2, open: 0.9, mouth: 0.9 }],
      [0.22, { brow: -0.8, knit: -8, open: 0.72, mouth: 0.75, wide: 1.04 }],
      [0.44, { brow: -1.5, knit: -13, open: 0.42, mouth: 0.5, wide: 1.1 }],
      // The mouth gives.
      [0.56, { brow: -1.2, knit: -11, open: 0.5, mouth: 1.45, wide: 0.92 }],
      [0.66, { brow: -1.7, knit: -14, open: 0.38, mouth: 0.55, wide: 1.1 }],
      [0.78, { brow: -1.3, knit: -12, open: 0.46, mouth: 1.2, wide: 0.95 }],
      [1, { brow: -1.1, knit: -10, open: 0.5, mouth: 0.7, wide: 1.05 }],
    ),
  },
};

/**
 * The palm. The hand comes up a little to take the tear, and when it lands it
 * sinks — a weight far heavier than one drop — and steadies, still open.
 * `contact` is the drop landing.
 */
const cup: Clip = {
  duration: 580,
  markers: { contact: 0.36 },
  poses: STILL,
  parts: {
    hand: [
      { at: 0, rotate: 18, x: -0.02, y: 0, scale: 1 },
      { at: 0.3, rotate: 10, x: -0.01, y: -0.01, scale: 1.02 },
      { at: 0.36, rotate: 10, y: -0.01, scale: 1.02 },
      // The weight.
      { at: 0.46, rotate: 24, x: -0.005, y: 0.03, scale: 1.03 },
      { at: 0.66, rotate: 15, y: 0.012, scale: 1.02 },
      { at: 1, rotate: 17, y: 0.016, scale: 1.02 },
    ],
    head: turn([0, 13], [0.46, 15], [1, 14]),
    staff: turn([0, -5], [1, -5]),
    lantern: turn([0, 0], [0.46, 5], [0.7, -3], [1, 0]),
  },
};

/**
 * Over the mere, small in a wide: the figure leans out over the water and the
 * hand goes out with it, palm up and spilling; the lantern swings with the
 * lean. The whole body moves here, so the lean reads at this size.
 */
const pour: Clip = {
  duration: 920,
  poses: [
    { at: 0, x: 0, y: 0.02, rotate: 2, squash: 1.03 },
    { at: 0.45, x: 0.03, y: 0.025, rotate: 5.5, squash: 1.04 },
    { at: 1, x: 0.035, y: 0.028, rotate: 6, squash: 1.04 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: 12, x: 0 },
      { at: 0.45, rotate: -14, x: 0.03 },
      { at: 1, rotate: -18, x: 0.035 },
    ],
    head: turn([0, 12], [0.5, 8], [1, 6]),
    staff: turn([0, -4], [1, -6]),
    lantern: turn([0, 0], [0.3, 10], [0.6, -6], [0.85, 3], [1, 0]),
  },
};

/**
 * The quiet. The arm comes up across the frame, the hand open and turned to
 * the enemy across the water, and holds; the head lifts a touch towards it.
 * The fingers closing are the film's (`--wdn-grasp`); the rest holds still.
 */
const grasp: Clip = {
  duration: 620,
  poses: STILL,
  parts: {
    hand: [
      { at: 0, rotate: -48, x: 0.02, y: -0.02, scale: 1.05 },
      { at: 0.3, rotate: -54, x: 0.025, y: -0.024, scale: 1.06 },
      { at: 1, rotate: -56, x: 0.025, y: -0.025, scale: 1.06 },
    ],
    head: turn([0, 4], [1, 1]),
    staff: turn([0, -6], [1, -6]),
    lantern: turn([0, 2], [0.5, -1], [1, 0]),
  },
};

/**
 * Far off in the impact, a shape against the flash: the fist shut and pulled
 * down towards the chest, the body folding round it.
 */
const fist: Clip = {
  duration: 760,
  markers: { contact: 0.04 },
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.04, y: 0.025, rotate: 5, squash: 1.07 },
    { at: 0.4, y: 0.03, rotate: 6, squash: 1.06 },
    { at: 1, y: 0.03, rotate: 5, squash: 1.05 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: -56, x: 0.025, y: -0.025 },
      { at: 0.04, rotate: -8, x: -0.02, y: 0.01 },
      { at: 0.5, rotate: 4, x: -0.03, y: 0.015 },
      { at: 1, rotate: 6, x: -0.03, y: 0.015 },
    ],
    head: turn([0, 0], [0.04, 14], [1, 17]),
    staff: turn([0, -6], [0.04, 4], [1, 2]),
    lantern: turn([0, 0], [0.08, -22], [0.3, 14], [0.55, -6], [1, 0]),
  },
};

/** On the board after: the hand opens as it lowers, and the head comes up. */
const open: Clip = {
  duration: 760,
  poses: [
    { at: 0, y: 0.03, rotate: 4, squash: 1.05 },
    { at: 0.5, y: 0.012, rotate: 1.5, squash: 1.02 },
    { at: 1, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    hand: [
      { at: 0, rotate: 6, x: -0.03, y: 0.015 },
      { at: 0.5, rotate: -10, x: 0.005 },
      { at: 1, rotate: 0, x: 0, y: 0 },
    ],
    head: turn([0, 16], [0.6, 5], [1, 0]),
    staff: turn([0, 2], [0.5, -2], [1, 0]),
    lantern: turn([0, 0], [0.3, 8], [0.6, -4], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  warden: {
    "ult:mourn-bow": bow,
    "ult:mourn-weep": weep,
    "ult:mourn-cup": cup,
    "ult:mourn-pour": pour,
    "ult:mourn-grasp": grasp,
    "ult:mourn-fist": fist,
    "ult:mourn-open": open,
  },
};
