import type { Clip, Pose, Rig } from "../../battle/animation";

/**
 * Command Performance: the Puppeteer's performance.
 *
 * The Hall of Mirrors acts with a head that tilts too far, the Open Mind with
 * an eye that narrows to a pin, Eyespot with a glance and a wink. The
 * Puppeteer acts with its hands. The shard is a blade to cut its own doll
 * loose; the control is thrown like a line and drawn back like a rein; the
 * fingers work the bar in small, exact movements while the body stays still,
 * the way a puppeteer's does. The eye only watches.
 *
 * Parts, from `Beguiler.tsx`: `head` (from the neck; positive tips it forward
 * and over), `eye` and `doll` (film copies only), `control` (the front arm;
 * negative lifts it, positive drops it and cocks it back), `strings` (the
 * drawn strings and the doll, hanging from the bar), `shard` (the back arm;
 * positive swings it up behind and over, negative sweeps it down and
 * forward), `body`, `legs`. The Beguiler faces right; forward is +x.
 *
 * After the snip the doll is gone for good: every later clip holds `doll` at
 * scale 0, and the long strings are drawn by the film (`perf-strings`) from
 * the bar, so the short drawn strings are held at scale 0 as well.
 *
 * Root keys are authored for the shot each clip plays in: the call and the
 * bow at battlefield size, the cast at the size of a foreground figure, the
 * yank small on the bridge. The snip's close-up sets `root: false`.
 */

const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));
/** A part held out of sight for the whole clip. */
const gone = (duration = 1): Pose[] => [
  { at: 0, scale: 0 },
  { at: duration, scale: 0 },
];

/**
 * The call: the control goes up over the head as if lifting someone by the
 * scruff, the doll jerks on its strings, and the head tips back to look up
 * at what it is holding.
 */
const call: Clip = {
  duration: 440,
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.3, y: -0.02, rotate: -2, squash: 0.97 },
    { at: 1, y: -0.012, rotate: -1, squash: 0.99 },
  ],
  parts: {
    control: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.3, rotate: -38, y: -0.06 },
      { at: 0.5, rotate: -30, y: -0.05 },
      { at: 1, rotate: -34, y: -0.055 },
    ],
    strings: turn([0, 0], [0.3, 24], [0.45, -18], [0.62, 12], [0.8, -6], [1, 2]),
    head: turn([0, 0], [0.3, -9], [1, -6]),
    shard: turn([0, 0], [0.4, 8], [1, 5]),
  },
};

/**
 * The snip. The control is let down to the chest so the strings hang in
 * front of the body; the shard comes up and across them (0.34), the doll
 * drops (0.36 onward, out of the bottom of the frame), the strings spring up
 * shortened, and the shard goes back down. The eye follows the doll down,
 * and comes back up to the lens.
 */
const snip: Clip = {
  duration: 700,
  poses: [
    { at: 0, y: 0 },
    { at: 1, y: -0.004 },
  ],
  parts: {
    control: [
      { at: 0, rotate: 8, y: 0.01, x: -0.02 },
      { at: 0.3, rotate: 14, y: 0.02, x: -0.04 },
      { at: 0.4, rotate: 4, y: 0.005, x: -0.035 },
      { at: 1, rotate: -6, y: -0.01, x: -0.02 },
    ],
    strings: [
      { at: 0, rotate: -6, scale: 1 },
      { at: 0.34, rotate: -10, scale: 1 },
      { at: 0.4, rotate: 22, scale: 0.55 },
      { at: 0.52, rotate: -14, scale: 0.5 },
      { at: 0.66, rotate: 8, scale: 0.5 },
      { at: 1, rotate: 0, scale: 0.5 },
    ],
    doll: [
      { at: 0, y: 0, rotate: 0, scale: 1 },
      { at: 0.35, y: 0, rotate: 0, scale: 1 },
      { at: 0.5, y: 0.2, rotate: 30, scale: 1.4 },
      { at: 0.7, y: 1.2, rotate: 90, scale: 1.4 },
      { at: 0.71, y: 1.2, rotate: 90, scale: 0 },
      { at: 1, y: 1.2, rotate: 90, scale: 0 },
    ],
    shard: [
      { at: 0, rotate: -10, x: 0 },
      { at: 0.24, rotate: -70, x: 0.14, y: -0.06 },
      { at: 0.34, rotate: -96, x: 0.2, y: -0.08 },
      { at: 0.46, rotate: -84, x: 0.16, y: -0.06 },
      { at: 1, rotate: -30, x: 0.04, y: -0.01 },
    ],
    head: [
      { at: 0, rotate: 4 },
      { at: 0.3, rotate: 10 },
      { at: 0.6, rotate: 12 },
      { at: 0.8, rotate: 3 },
      { at: 1, rotate: 2 },
    ],
    eye: [
      { at: 0, x: 0, y: 0, scale: 1 },
      { at: 0.2, x: 0.008, y: 0.008, scale: 1 },
      { at: 0.6, x: 0.006, y: 0.01, scale: 1 },
      { at: 0.78, x: 0, y: 0, scale: 1.25 },
      { at: 1, x: 0, y: 0, scale: 1.15 },
    ],
  },
};

/**
 * The cast: the control thrown forward and down like a line (0.22), held out
 * while the strings fly, then drawn back once, hard, as they bite (0.34),
 * and held. A foreground figure: the root only leans.
 */
const cast: Clip = {
  duration: 940,
  poses: [
    { at: 0, x: 0, rotate: 0 },
    { at: 0.22, x: 0.02, rotate: 3 },
    { at: 0.34, x: -0.01, rotate: -2 },
    { at: 1, x: -0.004, rotate: -1 },
  ],
  parts: {
    control: [
      { at: 0, rotate: -20, y: -0.03 },
      { at: 0.22, rotate: 30, y: 0.02, x: 0.03 },
      { at: 0.34, rotate: -26, y: -0.04, x: -0.02 },
      { at: 0.5, rotate: -18, y: -0.03, x: -0.012 },
      { at: 1, rotate: -22, y: -0.035, x: -0.016 },
    ],
    strings: gone(),
    doll: gone(),
    head: turn([0, 6], [0.22, 14], [0.4, 10], [1, 12]),
    shard: turn([0, 4], [0.22, -6], [1, 2]),
    body: turn([0, 0], [0.22, 3], [0.4, -1], [1, 0]),
  },
};

/**
 * The work: the fingers walking the puppet, the bar rocked left and right in
 * small quick tilts, one to a step. Small in frame, and mostly off it.
 */
const work: Clip = {
  duration: 520,
  poses: [
    { at: 0, y: 0 },
    { at: 1, y: 0 },
  ],
  parts: {
    control: [
      { at: 0, rotate: -20, y: -0.03 },
      { at: 0.17, rotate: -34, y: -0.05 },
      { at: 0.34, rotate: -10, y: -0.02 },
      { at: 0.5, rotate: -34, y: -0.05 },
      { at: 0.67, rotate: -10, y: -0.02 },
      { at: 0.84, rotate: -34, y: -0.05 },
      { at: 1, rotate: -22, y: -0.035 },
    ],
    strings: gone(),
    doll: gone(),
    head: turn([0, 10], [1, 10]),
  },
};

/**
 * The yank. The shot opens with the bar already up and back; contact (0.04)
 * is the bar ripped down and across, the whole body behind it, the head
 * going over. Then the follow-through and the hold: the bar low, the arm
 * locked. Small on the bridge, so the root carries the weight.
 */
const yank: Clip = {
  duration: 800,
  markers: { contact: 0.04 },
  poses: [
    { at: 0, x: -0.02, y: -0.01, rotate: -5, squash: 1.03 },
    { at: 0.04, x: 0.05, y: 0.02, rotate: 9, squash: 0.9 },
    { at: 0.26, x: 0.04, y: 0.014, rotate: 6, squash: 0.95 },
    { at: 1, x: 0.02, y: 0.006, rotate: 3, squash: 0.99 },
  ],
  parts: {
    control: [
      { at: 0, rotate: -48, y: -0.07, x: -0.03 },
      { at: 0.04, rotate: 40, y: 0.04, x: 0.04 },
      { at: 0.3, rotate: 30, y: 0.03, x: 0.03 },
      { at: 1, rotate: 22, y: 0.02, x: 0.02 },
    ],
    strings: gone(),
    doll: gone(),
    head: [
      { at: 0, rotate: -8 },
      { at: 0.04, rotate: 18, x: 0.02 },
      { at: 0.4, rotate: 14, x: 0.015 },
      { at: 1, rotate: 10, x: 0.01 },
    ],
    shard: turn([0, 20], [0.04, -30], [0.4, -20], [1, -10]),
    body: [
      { at: 0, rotate: -4, squash: 1.02 },
      { at: 0.04, rotate: 8, squash: 0.94 },
      { at: 1, rotate: 4, squash: 0.98 },
    ],
  },
};

/**
 * The curtain call: the bar held out to one side like a hat, and a slow
 * showman's bow over it, the head going down last and coming up first. The
 * doll is not back on its strings until the round starts.
 */
const bow: Clip = {
  duration: 760,
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.45, y: 0.01, rotate: 5, squash: 0.98 },
    { at: 0.7, y: 0.008, rotate: 4, squash: 0.985 },
    { at: 1, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    control: [
      { at: 0, rotate: 20, y: 0.02 },
      { at: 0.4, rotate: -30, y: -0.04, x: 0.02 },
      { at: 0.8, rotate: -26, y: -0.035, x: 0.02 },
      { at: 1, rotate: -8, y: -0.01 },
    ],
    strings: gone(),
    head: turn([0, 8], [0.3, 10], [0.55, 22], [0.75, 16], [1, 4]),
    shard: turn([0, -10], [0.45, 16], [1, 0]),
    body: turn([0, 0], [0.45, 6], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  beguiler: {
    "ult:perf-call": call,
    "ult:perf-snip": snip,
    "ult:perf-cast": cast,
    "ult:perf-work": work,
    "ult:perf-yank": yank,
    "ult:perf-bow": bow,
  },
};
