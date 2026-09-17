import type { Rig } from "../../battle/animation";

/**
 * The Miser's entrance performance, merged into its rig as `intro:` clips.
 *
 * The rig faces the party (to its left). The hand pivots at the shoulder with
 * the hand below and in front: a positive rotation swings it forward and up,
 * past about 100 degrees overhead. It does not want to get up; when it does,
 * it is a heap standing up, and the shawl and hoard lag every move.
 */
export const poses: Record<string, Rig> = {
  miser: {
    /** Out of the heap: sunk low and squat, it heaves itself up, the hand going overhead. */
    "intro:rise": {
      duration: 900,
      poses: [
        { at: 0, y: 0.12, squash: 1.18, scale: 0.92 },
        { at: 0.5, y: 0.02, squash: 1.04, scale: 0.99 },
        { at: 0.8, y: -0.015, squash: 0.97, scale: 1.02 },
        { at: 1, y: -0.01, squash: 0.99, scale: 1.02 },
      ],
      parts: {
        hand: [
          { at: 0, rotate: -10, y: 0.03 },
          { at: 0.6, rotate: 96, y: -0.05 },
          { at: 1, rotate: 108, y: -0.06 },
        ],
        head: [
          { at: 0, rotate: 10 },
          { at: 0.6, rotate: -8 },
          { at: 1, rotate: -6 },
        ],
        jaw: [
          { at: 0, rotate: 0 },
          { at: 0.6, rotate: -8 },
          { at: 1, rotate: -5 },
        ],
        shawl: [
          { at: 0, rotate: 4, y: 0.02 },
          { at: 0.55, rotate: -5, y: -0.01 },
          { at: 1, rotate: -1, y: 0 },
        ],
        hoard: [
          { at: 0, y: -0.02 },
          { at: 0.5, y: 0.02 },
          { at: 1, y: 0.01 },
        ],
      },
    },
    /** The hand down flat on the hoard. Contact at 0.35; it stays down, leaning on it. */
    "intro:slam": {
      duration: 900,
      markers: { contact: 0.35 },
      poses: [
        { at: 0, y: -0.01, squash: 0.99, scale: 1.02 },
        { at: 0.22, x: 0.03, y: -0.03, rotate: 4, squash: 1.04, scale: 1.04 },
        { at: 0.35, x: -0.08, y: 0.02, rotate: -6, squash: 0.88, scale: 1.05, flash: 0.5 },
        { at: 0.6, x: -0.06, y: 0.015, rotate: -4, flash: 0.1 },
        { at: 1, x: -0.05, y: 0.01, rotate: -3, scale: 1.03, squash: 0.98 },
      ],
      parts: {
        hand: [
          { at: 0, rotate: 108, y: -0.06 },
          { at: 0.22, rotate: 124, y: -0.08 },
          { at: 0.35, rotate: -18, y: 0.04 },
          { at: 1, rotate: -14, y: 0.035 },
        ],
        head: [
          { at: 0, rotate: -6 },
          { at: 0.36, rotate: 9 },
          { at: 1, rotate: 5 },
        ],
        jaw: [
          { at: 0, rotate: -5 },
          { at: 0.4, rotate: -14 },
          { at: 0.75, rotate: -3 },
          { at: 1, rotate: -2 },
        ],
        shawl: [
          { at: 0, rotate: -1 },
          { at: 0.4, rotate: 7 },
          { at: 0.7, rotate: -3 },
          { at: 1, rotate: 0 },
        ],
        stacks: [
          { at: 0, y: 0 },
          { at: 0.36, y: -0.03 },
          { at: 0.55, y: 0.01 },
          { at: 1, y: 0 },
        ],
      },
    },
    /** Claiming it: the hand spread back over its own shawl, the head up at the party, croaking. */
    "intro:claim": {
      duration: 1000,
      poses: [
        { at: 0, x: -0.05, y: 0.01, rotate: -3, scale: 1.03 },
        { at: 0.5, x: -0.02, y: -0.005, rotate: 1, scale: 1.04, squash: 1.02 },
        { at: 1, x: -0.02, y: -0.004, rotate: 0.5, scale: 1.04 },
      ],
      parts: {
        hand: [
          { at: 0, rotate: -14, y: 0.035 },
          { at: 0.45, rotate: 40, y: -0.02, x: 0.04 },
          { at: 1, rotate: 36, y: -0.018, x: 0.04 },
        ],
        head: [
          { at: 0, rotate: 5 },
          { at: 0.5, rotate: -9 },
          { at: 1, rotate: -8 },
        ],
        jaw: [
          { at: 0, rotate: -2 },
          { at: 0.3, rotate: -10 },
          { at: 0.45, rotate: -3 },
          { at: 0.6, rotate: -10 },
          { at: 1, rotate: -4 },
        ],
      },
    },
  },
};
