import type { Clip, Pose, Rig } from "../../battle/animation";

/**
 * Eyespot: the Illusionist's performance.
 *
 * The Hall of Mirrors acts with a head that tilts too far, the Open Mind with
 * a head held level and an eye that narrows to a pin. The Illusionist acts
 * with a glance: the eye slides aside, to where it is going to be, comes back
 * to you and winks. The rest of the body is a conjuror's: a slow pass of the
 * hand to make you watch the hand, a beckon, a stillness you could mistake
 * for a coat on a hook, and then the cut from behind.
 *
 * Parts, from `Beguiler.tsx`: `head` (from the neck; positive tips it forward
 * and over), `eye` (close-ups only; x 0.01 is one drawing unit, and the eye
 * hole allows about 0.013 either way), `control` (the front arm; negative
 * lifts it, positive drops it and cocks it back), `strings` (hanging from the
 * bar), `shard` (the back arm; positive swings it up behind and over,
 * negative sweeps it down and forward), `body`, `legs`. The Beguiler faces
 * right; forward is +x.
 *
 * Root keys are authored for the shot each clip plays in: the call and the
 * return at battlefield size, the beckon and the stillness at a third of the
 * frame, the cut at half of it. The wink's close-up sets `root: false`.
 */

const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/**
 * The call: the hand with the control makes a slow pass across the body, the
 * head turning to watch it, as a conjuror's hand is watched; the doll swings
 * after it on its strings.
 */
const call: Clip = {
  duration: 460,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0 },
    { at: 0.35, x: -0.01, y: -0.012, rotate: -1.5 },
    { at: 1, x: 0.006, y: -0.006, rotate: 1 },
  ],
  parts: {
    control: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.25, rotate: -26, y: -0.03 },
      { at: 0.7, rotate: 22, y: 0.01, x: -0.03 },
      { at: 1, rotate: 16, y: 0.008, x: -0.024 },
    ],
    strings: turn([0, 0], [0.25, 18], [0.55, -26], [0.8, 12], [1, -4]),
    head: turn([0, 0], [0.25, -5], [0.7, 10], [1, 8]),
    shard: turn([0, 0], [0.5, 6], [1, 4]),
    body: [
      { at: 0, rotate: 0, squash: 1 },
      { at: 0.5, rotate: -2, squash: 0.99 },
      { at: 1, rotate: 1, squash: 1 },
    ],
  },
};

/**
 * The wink. Timed to finish inside the FAST shot (400ms): the glance aside
 * by 90ms, held, back by 190, the lids down by 280 and up again by 360. The
 * head tips a little into the glance and a little more into the wink.
 */
const wink: Clip = {
  duration: 700,
  poses: [
    { at: 0, y: 0 },
    { at: 1, y: -0.004 },
  ],
  parts: {
    head: [
      { at: 0, rotate: 2, x: 0 },
      { at: 0.13, rotate: -3, x: 0.004 },
      { at: 0.27, rotate: -1, x: 0.002 },
      { at: 0.4, rotate: 6, x: -0.002 },
      { at: 0.52, rotate: 4, x: 0 },
      { at: 1, rotate: 3.5, x: 0 },
    ],
    eye: [
      { at: 0, x: 0, scale: 1, squash: 1 },
      { at: 0.13, x: 0.013, scale: 1, squash: 1 },
      { at: 0.22, x: 0.012, scale: 1, squash: 1 },
      { at: 0.27, x: 0, scale: 1.08, squash: 1 },
      // Lids down: as wide as ever, and a sixth as tall.
      { at: 0.36, x: 0, scale: 0.42, squash: 2.4 },
      { at: 0.43, x: 0, scale: 0.42, squash: 2.4 },
      { at: 0.52, x: 0, scale: 1.05, squash: 1 },
      { at: 1, x: 0, scale: 1, squash: 1 },
    ],
    control: turn([0, 12], [1, 14]),
    strings: turn([0, -3], [0.5, 4], [1, -1]),
    shard: turn([0, 3], [1, 3]),
  },
};

/**
 * The beckon: the free hand lifts the control and curls it towards itself
 * once, twice; the head tilts to invite. The body leans back a hair.
 */
const beckon: Clip = {
  duration: 920,
  poses: [
    { at: 0, x: 0, rotate: 0 },
    { at: 0.4, x: -0.008, rotate: -1.6 },
    { at: 1, x: -0.004, rotate: -0.8 },
  ],
  parts: {
    control: [
      { at: 0, rotate: 12, y: 0 },
      { at: 0.22, rotate: -30, y: -0.035 },
      { at: 0.36, rotate: -12, y: -0.02 },
      { at: 0.5, rotate: -32, y: -0.036 },
      { at: 0.66, rotate: -14, y: -0.02 },
      { at: 1, rotate: -8, y: -0.012 },
    ],
    strings: turn([0, -4], [0.24, 16], [0.38, -14], [0.52, 18], [0.68, -12], [0.85, 5], [1, -2]),
    head: turn([0, 3], [0.3, 9], [0.6, 7], [1, 8]),
    shard: turn([0, 3], [1, 2]),
    body: [
      { at: 0, rotate: 0 },
      { at: 0.4, rotate: -2 },
      { at: 1, rotate: -1 },
    ],
  },
};

/** Stillness: nothing moves, not the doll, not the head. A coat on a hook. */
const still: Clip = {
  duration: 700,
  poses: [
    { at: 0, x: -0.004, rotate: -0.8 },
    { at: 1, x: -0.004, rotate: -0.8 },
  ],
  parts: {
    control: [
      { at: 0, rotate: -8, y: -0.012 },
      { at: 1, rotate: -8, y: -0.012 },
    ],
    strings: turn([0, 0], [1, 0]),
    head: turn([0, 8], [1, 8]),
    shard: turn([0, 2], [1, 2]),
    body: turn([0, -1], [1, -1]),
  },
};

/**
 * The cut, from behind. The shot opens with the shard already coming over,
 * so contact (0.04) is the blade swept down through the target's back; the
 * body is lunged in after it and the control arm flung back for balance.
 * Then the follow-through, and a settle that stays low.
 */
const cut: Clip = {
  duration: 820,
  markers: { contact: 0.04 },
  poses: [
    { at: 0, x: 0.05, y: 0.004, rotate: 4, squash: 0.97 },
    { at: 0.04, x: 0.075, y: 0.012, rotate: 7, squash: 0.92 },
    { at: 0.3, x: 0.065, y: 0.01, rotate: 5.5, squash: 0.95 },
    { at: 1, x: 0.04, y: 0.004, rotate: 2.5, squash: 0.99 },
  ],
  parts: {
    shard: [
      { at: 0, rotate: 60, x: 0 },
      { at: 0.04, rotate: -70, x: 0.02 },
      { at: 0.24, rotate: -84, x: 0.024 },
      { at: 1, rotate: -52, x: 0.012 },
    ],
    control: [
      { at: 0, rotate: 30, y: 0.01, x: -0.02 },
      { at: 0.04, rotate: 46, y: 0.02, x: -0.04 },
      { at: 0.4, rotate: 38, y: 0.016, x: -0.034 },
      { at: 1, rotate: 24, y: 0.01, x: -0.02 },
    ],
    strings: turn([0, 20], [0.06, -40], [0.24, 26], [0.46, -14], [0.7, 6], [1, -2]),
    head: [
      { at: 0, rotate: 8, x: 0.01 },
      { at: 0.04, rotate: 16, x: 0.03, y: 0.012 },
      { at: 0.4, rotate: 13, x: 0.024, y: 0.008 },
      { at: 1, rotate: 8, x: 0.01, y: 0.004 },
    ],
    body: [
      { at: 0, rotate: 5, x: 0.01, squash: 0.98 },
      { at: 0.04, rotate: 10, x: 0.03, squash: 0.94 },
      { at: 0.4, rotate: 8, x: 0.024, squash: 0.96 },
      { at: 1, rotate: 4, x: 0.012, squash: 0.99 },
    ],
    legs: [
      { at: 0, rotate: 2, x: 0.01 },
      { at: 0.04, rotate: 5, x: 0.02 },
      { at: 1, rotate: 2, x: 0.01 },
    ],
  },
};

/**
 * Release: the shard is lowered, the head goes back over to its crooked
 * angle, and the control comes up again as if the Beguiler had never moved.
 */
const settle: Clip = {
  duration: 720,
  poses: [
    { at: 0, y: 0, scale: 1 },
    { at: 0.4, y: -0.014, scale: 1.015 },
    { at: 1, y: 0, scale: 1 },
  ],
  parts: {
    shard: turn([0, -40], [0.45, 8], [0.7, -3], [1, 0]),
    control: [
      { at: 0, rotate: 20, y: 0.01 },
      { at: 0.45, rotate: -12, y: -0.018 },
      { at: 1, rotate: 0, y: 0 },
    ],
    strings: turn([0, -10], [0.45, 20], [0.65, -10], [0.85, 4], [1, 0]),
    head: turn([0, 12], [0.45, 5], [0.75, 9], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  beguiler: {
    "ult:spot-call": call,
    "ult:spot-wink": wink,
    "ult:spot-beckon": beckon,
    "ult:spot-still": still,
    "ult:spot-cut": cut,
    "ult:spot-settle": settle,
  },
};
