import type { Clip, Pose, Rig } from "../../battle/animation";

/**
 * The Open Mind: the Mindflayer's performance.
 *
 * The Hall of Mirrors acts with a head that tilts further than a head should.
 * The Mindflayer acts with the opposite. The head that never stops tilting
 * comes level and *holds*, the control and its doll are let drop (it has no
 * more use for strings), and the eye does the acting: it widens, narrows to
 * a pin and flares. Parts, from `Beguiler.tsx`: `head` (from the neck;
 * positive tips it forward and over), `eye` (the green eye, close-ups only),
 * `control` (the front arm; positive drops it and cocks it back), `strings`
 * (hanging from the bar), `shard` (the back arm), `body`, `legs`.
 *
 * Films do not write a clip's root track yet, so everything the film needs
 * is in the parts, and the root keys are kept small: when roots do play, no
 * close-up loses its subject.
 */

const turn = (...keys: [number, number][]): Pose[] =>
  keys.map(([at, rotate]) => ({ at, rotate }));

/** The control let fall to the side, the strings hanging straight from it. */
const DROPPED = 34;
const SLACK = -30;

/**
 * The call: the control drops, the doll swings on slack strings, and the head
 * gives one last curious tilt and then comes level and stops.
 */
const drop: Clip = {
  duration: 420,
  poses: [
    { at: 0, y: 0, scale: 1 },
    { at: 0.5, y: -0.01, scale: 1.02 },
    { at: 1, y: -0.01, scale: 1.02 },
  ],
  parts: {
    control: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.3, rotate: DROPPED + 8, y: 0.02 },
      { at: 0.55, rotate: DROPPED - 3, y: 0.015 },
      { at: 1, rotate: DROPPED, y: 0.015 },
    ],
    strings: turn([0, 0], [0.3, SLACK - 22], [0.55, SLACK + 14], [0.8, SLACK - 5], [1, SLACK]),
    head: turn([0, 0], [0.3, 11], [0.55, -3], [0.7, 0], [1, 0]),
    shard: turn([0, 0], [0.4, -6], [1, -5]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.55, squash: 0.985 },
      { at: 1, squash: 0.99 },
    ],
  },
};

/**
 * The stare: level, and held. The eye opens wide, then narrows to a pin and
 * stays there; the only other thing that moves is the doll, still settling.
 */
const stare: Clip = {
  duration: 700,
  poses: [
    { at: 0, y: -0.01, scale: 1.02 },
    { at: 1, y: -0.01, scale: 1.02 },
  ],
  parts: {
    head: turn([0, -1.5], [0.25, 0.4], [0.4, 0], [1, 0]),
    eye: [
      { at: 0, scale: 1 },
      { at: 0.3, scale: 1.55 },
      { at: 0.46, scale: 1.5 },
      { at: 0.66, scale: 0.36 },
      { at: 1, scale: 0.32 },
    ],
    control: turn([0, DROPPED], [1, DROPPED]),
    strings: turn([0, SLACK], [0.5, SLACK - 3], [1, SLACK + 1]),
    shard: turn([0, -5], [1, -5]),
    body: [
      { at: 0, squash: 0.99 },
      { at: 1, squash: 0.99 },
    ],
  },
};

/**
 * Through: the head drives forward into the look, the eye flares, the body
 * leans after it, and the dead control swings with the jolt. Contact is the
 * top of the drive.
 */
const pierce: Clip = {
  duration: 720,
  markers: { contact: 0.04 },
  poses: [
    { at: 0, x: 0, rotate: 0 },
    { at: 0.04, x: 0.02, rotate: 2 },
    { at: 1, x: 0.01, rotate: 1 },
  ],
  parts: {
    head: [
      { at: 0, rotate: -5, x: 0 },
      { at: 0.04, rotate: 15, x: 0.035, y: 0.01 },
      { at: 0.3, rotate: 11, x: 0.03, y: 0.008 },
      { at: 1, rotate: 5, x: 0.012, y: 0 },
    ],
    eye: [
      { at: 0, scale: 0.4 },
      { at: 0.04, scale: 2.3 },
      { at: 0.35, scale: 1.6 },
      { at: 1, scale: 1.1 },
    ],
    body: [
      { at: 0, x: 0, rotate: 0, squash: 1 },
      { at: 0.04, x: 0.03, rotate: 5, squash: 0.95 },
      { at: 0.35, x: 0.025, rotate: 4, squash: 0.97 },
      { at: 1, x: 0.01, rotate: 1.5, squash: 1 },
    ],
    control: [
      { at: 0, rotate: DROPPED, y: 0.015 },
      { at: 0.04, rotate: DROPPED + 12, y: 0.03, x: 0.02 },
      { at: 0.4, rotate: DROPPED + 4, y: 0.02, x: 0.015 },
      { at: 1, rotate: DROPPED, y: 0.015, x: 0.005 },
    ],
    strings: turn([0, SLACK], [0.06, SLACK - 34], [0.24, SLACK + 22], [0.44, SLACK - 12], [0.66, SLACK + 6], [1, SLACK]),
    shard: [
      { at: 0, rotate: -5, x: 0 },
      { at: 0.04, rotate: -38, x: 0.015 },
      { at: 0.4, rotate: -26, x: 0.012 },
      { at: 1, rotate: -12, x: 0.004 },
    ],
    legs: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.04, x: 0.012, rotate: 2 },
      { at: 1, x: 0.004, rotate: 0.5 },
    ],
  },
};

/**
 * Release: the head tips back over into its old crooked angle, and the
 * control is taken up again as if nothing had happened. Then home.
 */
const lift: Clip = {
  duration: 720,
  poses: [
    { at: 0, y: 0, scale: 1 },
    { at: 0.4, y: -0.015, scale: 1.02 },
    { at: 1, y: 0, scale: 1 },
  ],
  parts: {
    head: turn([0, 2], [0.4, 15], [0.7, 11], [1, 0]),
    control: [
      { at: 0, rotate: DROPPED, y: 0.015 },
      { at: 0.4, rotate: -14, y: -0.02 },
      { at: 0.7, rotate: -8, y: -0.012 },
      { at: 1, rotate: 0, y: 0 },
    ],
    strings: turn([0, SLACK], [0.4, 24], [0.6, -12], [0.8, 5], [1, 0]),
    shard: turn([0, -8], [0.5, -2], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  beguiler: {
    "ult:mind-drop": drop,
    "ult:mind-stare": stare,
    "ult:mind-pierce": pierce,
    "ult:mind-lift": lift,
  },
};
