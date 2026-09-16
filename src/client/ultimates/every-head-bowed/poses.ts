import type { Clip, Pose, Rig } from "../../battle/animation";
import { face } from "../../battle/face";

/**
 * Every Head Bowed — the Warden's poses.
 *
 * The healing hand does nothing in this film. Everything is done by the
 * other arm: the staff goes up until the lantern hangs over the Warden's
 * head, swings the light once across a field that follows it, and then is
 * turned right over, crook down, so the lantern is set on the dirt at the
 * Warden's feet — growth, pointed the other way.
 *
 * Parts: `staff` (the back arm and the crooked staff, pivoting at the back
 * shoulder), `lantern` (hung from the crook, inside `staff`), `hand`, `head`,
 * `brow`, `eyes`, `mouth`, `body`, `legs`. The Warden faces right; a positive
 * rotation tips a part forward and down. The lantern hangs from the crook, so
 * wherever the staff turns, the lantern is turned back the other way by as
 * much (plus its own swing) to keep hanging.
 *
 * Root tracks play. The battlefield clips (`raise`, `rest`) move the real
 * unit a little; `swing` shifts the weight under the wide; `down` stoops the
 * whole figure over the lantern, sized for the impact's medium framing. The
 * close-ups (`lift`, `hush`) keep a still root and are cued `root: false`.
 *
 * Face magnitudes are the Warden's: bushy brows read a knit at 5–10° and a
 * lift at 1–2 units; the eyes are drawn shut and stay shut.
 */

const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/** The staff up, the lantern hanging over the hood. */
const HIGH = { rotate: 34, y: -0.15 };
/** The staff turned over, crook down, the lantern on the dirt in front of the feet. */
const DOWN = { rotate: 146, y: 0.13, x: 0.04 };

/** A lantern hanging plumb from a staff turned `staff` degrees, swung `swing` more. */
const hang = (at: number, staff: number, swing = 0): Pose => ({ at, rotate: -staff + swing });

/** On the battlefield, as the round stops: the staff goes up and the lantern with it. */
const raise: Clip = {
  duration: 700,
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.5, y: -0.014, rotate: -1.2, squash: 0.99 },
    { at: 1, y: -0.01, rotate: -0.8, squash: 1 },
  ],
  parts: {
    staff: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.55, rotate: HIGH.rotate + 4, y: HIGH.y - 0.01 },
      { at: 1, ...HIGH },
    ],
    lantern: [hang(0, 0), hang(0.3, 14, 12), hang(0.55, HIGH.rotate + 4, -16), hang(0.8, HIGH.rotate, 7), hang(1, HIGH.rotate, 0)],
    head: turn([0, 0], [0.5, -6], [1, -5]),
    hand: [
      { at: 0, rotate: 0, x: 0, y: 0 },
      { at: 1, rotate: 12, x: -0.01, y: 0.01 },
    ],
  },
};

/**
 * The lantern rises into a low frame on the crook and steadies. Handed to
 * itself, so the frame holds the light where it stopped.
 */
const lift: Clip = {
  duration: 620,
  poses: [{ at: 0 }, { at: 1 }],
  parts: {
    staff: [
      { at: 0, rotate: 20, y: -0.06 },
      { at: 0.5, rotate: HIGH.rotate + 3, y: HIGH.y - 0.015 },
      { at: 1, ...HIGH },
    ],
    lantern: [hang(0, 20, 10), hang(0.35, 28, -14), hang(0.6, HIGH.rotate + 3, 9), hang(0.82, HIGH.rotate, -4), hang(1, HIGH.rotate, 0)],
    head: turn([0, -3], [1, -6]),
    hand: [{ at: 0, rotate: 12, x: -0.01, y: 0.01 }, { at: 1, rotate: 12, x: -0.01, y: 0.01 }],
    ...face([0, { brow: -0.4, open: 0.9 }], [1, { brow: -0.8, knit: -2, open: 0.85, mouth: 1.05 }]),
  },
};

/**
 * The wide. The light held high and swung once, back and forward across the
 * field, so everything in it can be seen to follow; the weight shifts under
 * it. The lantern trails its own swing.
 */
const swing: Clip = {
  duration: 1000,
  poses: [
    { at: 0, x: 0, rotate: 0 },
    { at: 0.3, x: -0.012, rotate: -1.5 },
    { at: 0.62, x: 0.014, rotate: 2 },
    { at: 1, x: 0.004, rotate: 0.5 },
  ],
  parts: {
    staff: [
      { at: 0, ...HIGH },
      { at: 0.3, rotate: 12, y: HIGH.y + 0.01 },
      { at: 0.64, rotate: 52, y: HIGH.y - 0.005 },
      { at: 1, rotate: 38, y: HIGH.y },
    ],
    lantern: [hang(0, HIGH.rotate), hang(0.3, 12, 16), hang(0.5, 34, 10), hang(0.66, 52, -18), hang(0.84, 44, 9), hang(1, 38, -3)],
    head: turn([0, -5], [0.3, -8], [0.64, -3], [1, -4]),
    hand: [{ at: 0, rotate: 12, x: -0.01, y: 0.01 }, { at: 1, rotate: 16, x: -0.01, y: 0.012 }],
  },
};

/**
 * The quiet. The face under the lantern's light: the brow lifts, tender, as
 * if at something small; then it knits and sets; the shut lids press; a
 * breath goes out under the moustache; and the head bows as the light goes
 * down off it. The staff starts down, out of the frame.
 */
const hush: Clip = {
  duration: 620,
  poses: [{ at: 0 }, { at: 1 }],
  parts: {
    staff: [
      { at: 0, rotate: 38, y: HIGH.y },
      { at: 0.4, rotate: 44, y: HIGH.y + 0.02 },
      { at: 1, rotate: 80, y: 0.02 },
    ],
    lantern: [hang(0, 38), hang(0.4, 44, 3), hang(1, 80, -6)],
    head: [
      { at: 0, rotate: -5, y: 0 },
      { at: 0.4, rotate: -4, y: 0 },
      { at: 0.7, rotate: 3, y: 0.004 },
      { at: 1, rotate: 9, y: 0.008 },
    ],
    hand: [{ at: 0, rotate: 16, x: -0.01, y: 0.012 }, { at: 1, rotate: 16, x: -0.01, y: 0.012 }],
    ...face(
      [0, { brow: -0.6, knit: -2, open: 0.85, mouth: 1.05 }],
      // Tender: the inner brows lift, as over something small.
      [0.3, { brow: -1.5, knit: -6, open: 0.8, mouth: 1.1, wide: 1.06 }],
      // Then it sets.
      [0.55, { brow: 1.2, knit: 7, open: 0.5, mouth: 0.72, wide: 0.9 }],
      // A breath out.
      [0.72, { brow: 1.3, knit: 8, open: 0.48, mouth: 1.35, wide: 0.94 }],
      [1, { brow: 1.6, knit: 9, open: 0.42, mouth: 0.68, wide: 0.9 }],
    ),
  },
};

/**
 * The bow. The staff comes over, crook down, and the lantern's foot meets the
 * dirt at `contact`; the whole figure stoops over it, the knees give, and the
 * lantern jolts on its hook and settles. The face stays set.
 */
const down: Clip = {
  duration: 800,
  markers: { contact: 0.1 },
  poses: [
    { at: 0, y: 0, rotate: 1, squash: 1 },
    { at: 0.1, y: 0.028, rotate: 7, squash: 0.965 },
    { at: 0.2, y: 0.022, rotate: 6, squash: 0.98 },
    { at: 0.45, y: 0.025, rotate: 6.5, squash: 0.975 },
    { at: 1, y: 0.024, rotate: 6, squash: 0.976 },
  ],
  parts: {
    staff: [
      { at: 0, rotate: 104, y: 0.06, x: 0.02 },
      { at: 0.1, ...DOWN },
      { at: 0.16, rotate: DOWN.rotate - 3, y: DOWN.y - 0.008, x: DOWN.x },
      { at: 0.3, ...DOWN },
      { at: 1, ...DOWN },
    ],
    lantern: [hang(0, 104, -10), hang(0.1, DOWN.rotate, 0), hang(0.14, DOWN.rotate, 10), hang(0.28, DOWN.rotate, -6), hang(0.5, DOWN.rotate, 2), hang(1, DOWN.rotate, 0)],
    head: turn([0, 9], [0.1, 15], [0.3, 13], [1, 14]),
    body: [
      { at: 0, rotate: 0, squash: 1 },
      { at: 0.1, rotate: 4, squash: 0.97 },
      { at: 1, rotate: 3, squash: 0.975 },
    ],
    legs: [
      { at: 0, squash: 1 },
      { at: 0.1, squash: 1.1 },
      { at: 0.3, squash: 1.06 },
      { at: 1, squash: 1.07 },
    ],
    hand: [
      { at: 0, rotate: 16, x: -0.01, y: 0.012 },
      { at: 0.1, rotate: 38, x: 0.01, y: 0.03 },
      { at: 1, rotate: 34, x: 0.01, y: 0.03 },
    ],
    ...face(
      [0, { brow: 1.6, knit: 9, open: 0.42, mouth: 0.68, wide: 0.9 }],
      [0.1, { brow: 2, knit: 10, open: 0.38, mouth: 0.6, wide: 0.88 }],
      [1, { brow: 1.4, knit: 7, open: 0.45, mouth: 0.75, wide: 0.92 }],
    ),
  },
};

/** On the board after: the staff comes back up, the lantern swings home, the head lifts. */
const rest: Clip = {
  duration: 760,
  poses: [
    { at: 0, y: 0.012, rotate: 3, squash: 0.99 },
    { at: 0.5, y: -0.004, rotate: -0.5, squash: 1.005 },
    { at: 1, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    staff: [
      { at: 0, rotate: 70, y: 0.05 },
      { at: 0.55, rotate: -4, y: -0.01 },
      { at: 1, rotate: 0, y: 0 },
    ],
    lantern: [hang(0, 70, 0), hang(0.35, 30, 14), hang(0.55, -4, -12), hang(0.75, 0, 6), hang(1, 0, 0)],
    head: turn([0, 10], [0.5, -2], [1, 0]),
    hand: [
      { at: 0, rotate: 30, x: 0.01, y: 0.02 },
      { at: 1, rotate: 0, x: 0, y: 0 },
    ],
  },
};

export const poses: Record<string, Rig> = {
  warden: {
    "ult:bowed-raise": raise,
    "ult:bowed-lift": lift,
    "ult:bowed-swing": swing,
    "ult:bowed-hush": hush,
    "ult:bowed-down": down,
    "ult:bowed-rest": rest,
  },
};
