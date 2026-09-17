import type { Rig } from "../../battle/animation";

/**
 * The Bailiff's entrance performance, merged into its rig as `intro:` clips.
 *
 * Forward is negative x. The tipstaff pivots at the near shoulder with its
 * crown up and in front: a positive rotation swings it back over the hat, a
 * negative one brings it down. The Bailiff barely leans — it is upright and
 * deliberate, and its weight goes into the staff.
 */
export const poses: Record<string, Rig> = {
  bailiff: {
    /** Revealed in the doorway: a half step forward, the staff shouldered, the head coming up under the brim. */
    "intro:enter": {
      duration: 900,
      poses: [
        { at: 0, x: 0.05, y: 0, rotate: 0, scale: 0.98 },
        { at: 0.35, x: 0.02, y: -0.012, squash: 0.98 },
        { at: 0.55, x: 0, y: 0, squash: 1.02, scale: 1.01 },
        { at: 1, x: 0, y: 0, squash: 1, scale: 1.02 },
      ],
      parts: {
        staff: [
          { at: 0, rotate: -6 },
          { at: 0.6, rotate: 30 },
          { at: 1, rotate: 36 },
        ],
        head: [
          { at: 0, rotate: 12 },
          { at: 0.6, rotate: -3 },
          { at: 1, rotate: -4 },
        ],
        legs: [
          { at: 0, x: 0 },
          { at: 0.35, x: -0.02, y: -0.01 },
          { at: 0.55, x: 0 },
          { at: 1, x: 0 },
        ],
        chain: [
          { at: 0, rotate: 0 },
          { at: 0.55, rotate: 10 },
          { at: 0.8, rotate: -5 },
          { at: 1, rotate: 0 },
        ],
      },
    },
    /** One rap: the staff lifted and brought down to the floor in front at 0.38, held there. */
    "intro:rap": {
      duration: 1000,
      markers: { contact: 0.38 },
      poses: [
        { at: 0, scale: 1.02 },
        { at: 0.22, x: 0.02, y: -0.015, squash: 0.97, scale: 1.03 },
        { at: 0.38, x: -0.05, y: 0.01, rotate: -3, squash: 1.04, scale: 1.04 },
        { at: 1, x: -0.04, y: 0.008, rotate: -2.5, squash: 1.02, scale: 1.03 },
      ],
      parts: {
        staff: [
          { at: 0, rotate: 36 },
          { at: 0.22, rotate: 64 },
          { at: 0.38, rotate: -88 },
          { at: 0.5, rotate: -82 },
          { at: 1, rotate: -84 },
        ],
        head: [
          { at: 0, rotate: -4 },
          { at: 0.38, rotate: 6 },
          { at: 1, rotate: 3 },
        ],
        chain: [
          { at: 0, rotate: 0 },
          { at: 0.42, rotate: -14 },
          { at: 0.7, rotate: 7 },
          { at: 1, rotate: 0 },
        ],
        summons: [
          { at: 0, rotate: 0 },
          { at: 0.38, rotate: 18 },
          { at: 1, rotate: 8 },
        ],
        coat: [
          { at: 0, rotate: 0 },
          { at: 0.42, rotate: 3 },
          { at: 1, rotate: 0 },
        ],
      },
    },
    /** Serving: the summons flourished out at a hero, the staff levelled at them. */
    "intro:serve": {
      duration: 900,
      poses: [
        { at: 0, x: -0.04, rotate: -2.5, scale: 1.03 },
        { at: 0.3, x: -0.06, rotate: -4, squash: 0.97, scale: 1.04 },
        { at: 1, x: -0.05, rotate: -3, scale: 1.04 },
      ],
      parts: {
        summons: [
          { at: 0, rotate: 8 },
          { at: 0.25, rotate: -40, x: -0.04 },
          { at: 1, rotate: -30, x: -0.03 },
        ],
        staff: [
          { at: 0, rotate: -84 },
          { at: 0.4, rotate: -8 },
          { at: 1, rotate: -12 },
        ],
        head: [
          { at: 0, rotate: 3 },
          { at: 0.35, rotate: -6 },
          { at: 1, rotate: -5 },
        ],
      },
    },
  },
};
