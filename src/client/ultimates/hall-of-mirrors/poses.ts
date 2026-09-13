import type { Clip, Pose, Rig } from "../../battle/animation";

/**
 * Hall of Mirrors — the Beguiler's performance.
 *
 * The Beguiler never goes near anyone, so none of these travel. Everything
 * is in the head, which tilts further than a head should, and the hands: the
 * shard of mirror held up beside the mask, and the control, which does all
 * the violence there is by being pulled. Parts, from `Beguiler.tsx`: `head`
 * (from the neck), `shard` (the back arm, from its shoulder; positive lifts
 * it up behind the head), `control` (the front arm; negative is up, positive
 * cocks it down and back), `strings` (the strings and the doll, hanging from
 * the bar), `body`, `legs`. Facing right, forward is +x.
 */

const turn = (...keys: [number, number][]): Pose[] =>
  keys.map(([at, rotate]) => ({ at, rotate }));

/** The call: the shard comes up to the mask and the head goes over. */
const lift: Clip = {
  duration: 420,
  poses: [
    { at: 0, y: 0, rotate: 0, scale: 1, flash: 0 },
    { at: 0.45, y: -0.025, rotate: -2, scale: 1.04, flash: 0.45 },
    { at: 1, y: -0.02, rotate: -2.5, scale: 1.03, flash: 0.15 },
  ],
  parts: {
    shard: turn([0, 0], [0.45, 150], [0.7, 140], [1, 144]),
    head: turn([0, 0], [0.5, 12], [1, 17]),
    control: turn([0, 0], [0.5, 10], [1, 8]),
    strings: turn([0, 0], [0.35, 16], [0.65, -9], [1, 4]),
  },
};

/**
 * The smile: a slow tilt past where a neck stops, a catch, and on. The shard
 * rises beside the face so the mask is in the frame twice.
 */
const smile: Clip = {
  duration: 620,
  poses: [
    { at: 0, y: -0.02, rotate: -2.5, scale: 1.03 },
    { at: 1, y: -0.024, rotate: -4.5, scale: 1.035 },
  ],
  parts: {
    head: [
      { at: 0, rotate: 12 },
      { at: 0.38, rotate: 21 },
      // The catch: it stops, and goes a little further anyway.
      { at: 0.5, rotate: 19 },
      { at: 1, rotate: 23 },
    ],
    shard: [
      { at: 0, rotate: 118, scale: 1 },
      { at: 0.55, rotate: 146, scale: 1.12 },
      { at: 1, rotate: 150, scale: 1.14 },
    ],
    control: turn([0, 8], [1, 14]),
    strings: turn([0, 4], [0.4, -6], [0.8, 5], [1, 2]),
  },
};

/**
 * The pull, held: long fingers tilt the bar back, the strings draw taut, and
 * the doll turns once on them — narrowing to its edge and back.
 */
const pull: Clip = {
  duration: 520,
  poses: [
    { at: 0, y: -0.01, rotate: -2 },
    { at: 1, y: 0.005, x: -0.01, rotate: -4, squash: 1.02 },
  ],
  parts: {
    // Held out in front, clear of the robe, and drawn back a little: taut.
    control: [
      { at: 0, rotate: -34, y: -0.03 },
      { at: 0.7, rotate: -24, y: -0.02 },
      { at: 1, rotate: -21, y: -0.018 },
    ],
    // The strings hang plumb from wherever the bar is.
    strings: [
      { at: 0, rotate: 30, scale: 1, squash: 1 },
      { at: 0.25, rotate: 32, scale: 1, squash: 1 },
      // Edge-on: scale and squash together narrow it without stretching it.
      { at: 0.48, rotate: 26, scale: 0.42, squash: 0.42 },
      { at: 0.7, rotate: 24, scale: 1, squash: 1 },
      { at: 1, rotate: 14, scale: 1, squash: 1, y: -0.01 },
    ],
    head: turn([0, 20], [1, 12]),
    shard: turn([0, 110], [1, 40]),
  },
};

/**
 * The yank: the bar is torn up and back, the body goes with it, and the doll
 * is flung. Contact is the top of the pull.
 */
const yank: Clip = {
  duration: 620,
  markers: { contact: 0.04 },
  poses: [
    { at: 0, x: 0, y: 0.005, rotate: -4, squash: 1.02 },
    { at: 0.04, x: -0.05, y: -0.02, rotate: -9, squash: 0.92, scale: 1.05, flash: 0.85 },
    { at: 0.25, x: -0.06, y: -0.015, rotate: -8, squash: 0.95, scale: 1.04, flash: 0.3 },
    { at: 1, x: -0.03, y: 0, rotate: -3, squash: 1, scale: 1.02, flash: 0 },
  ],
  parts: {
    control: [
      { at: 0, rotate: 19, y: 0.02 },
      { at: 0.04, rotate: -46, y: -0.07 },
      { at: 0.3, rotate: -40, y: -0.06 },
      { at: 1, rotate: -30, y: -0.045 },
    ],
    strings: turn([0, -16], [0.05, 58], [0.22, -42], [0.42, 24], [0.62, -12], [0.82, 6], [1, -2]),
    head: turn([0, 9], [0.04, -14], [0.3, -10], [1, -4]),
    shard: turn([0, 40], [0.04, -30], [0.4, -22], [1, -12]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.04, squash: 0.94 },
      { at: 1, squash: 1 },
    ],
  },
};

/** The bow: a courtier's, the control lifted like a hat. Then home. */
const bow: Clip = {
  duration: 700,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, flash: 0.2 },
    { at: 0.35, x: 0.02, y: 0.03, rotate: 16, squash: 1.04 },
    { at: 0.72, x: 0.02, y: 0.028, rotate: 15, squash: 1.03 },
    { at: 1, x: 0, y: 0, rotate: 0, squash: 1, flash: 0 },
  ],
  parts: {
    control: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.35, rotate: -52, y: -0.05 },
      { at: 0.72, rotate: -48, y: -0.045 },
      { at: 1, rotate: 0, y: 0 },
    ],
    shard: turn([0, 0], [0.35, -64], [0.72, -58], [1, 0]),
    head: turn([0, 0], [0.35, 14], [0.72, 12], [1, 0]),
    strings: turn([0, 0], [0.35, 30], [0.55, -14], [0.72, 8], [0.9, -4], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  beguiler: {
    "ult:lift": lift,
    "ult:smile": smile,
    "ult:pull": pull,
    "ult:yank": yank,
    "ult:bow": bow,
  },
};
