import type { Rig } from "../../battle/animation";

/**
 * The Notary's entrance performance, merged into its rig as `intro:` clips.
 *
 * Forward is negative x. The stamp arm pivots at the near shoulder with the
 * matrix below and in front: a positive rotation raises it forward and up;
 * around 70 degrees it is over the party's heads. It never swings — it
 * presses. It does not rise so much as draw itself up to its full height.
 */
export const poses: Record<string, Rig> = {
  notary: {
    /** Drawn up from a clerk's stoop to its full height, the stamp lifted high. */
    "intro:rise": {
      duration: 950,
      poses: [
        { at: 0, y: 0.04, rotate: 6, squash: 1.12, scale: 0.97 },
        { at: 0.55, y: -0.01, rotate: 1, squash: 0.95, scale: 1.02 },
        { at: 1, y: -0.012, rotate: 0, squash: 0.97, scale: 1.03 },
      ],
      parts: {
        head: [
          { at: 0, rotate: 14 },
          { at: 0.5, rotate: -2 },
          { at: 1, rotate: -5 },
        ],
        stamp: [
          { at: 0, rotate: -10 },
          { at: 0.6, rotate: 58 },
          { at: 1, rotate: 72 },
        ],
        ledgers: [
          { at: 0, rotate: 3 },
          { at: 0.5, rotate: -3 },
          { at: 1, rotate: -1 },
        ],
        candles: [
          { at: 0, rotate: 4 },
          { at: 0.6, rotate: -4 },
          { at: 1, rotate: 0 },
        ],
        ribbons: [
          { at: 0, rotate: 0 },
          { at: 0.6, rotate: 8 },
          { at: 1, rotate: -2 },
        ],
      },
    },
    /** The press: a beat higher, then flat down at 0.38, and leaning its weight on it. */
    "intro:press": {
      duration: 1000,
      markers: { contact: 0.38 },
      poses: [
        { at: 0, y: -0.012, squash: 0.97, scale: 1.03 },
        { at: 0.22, x: 0.02, y: -0.03, rotate: 3, squash: 0.94, scale: 1.04 },
        { at: 0.38, x: -0.1, y: 0.02, rotate: -8, squash: 1.08, scale: 1.05, flash: 0.35 },
        { at: 0.6, x: -0.09, y: 0.02, rotate: -7, flash: 0 },
        { at: 1, x: -0.08, y: 0.015, rotate: -6, squash: 1.04, scale: 1.04 },
      ],
      parts: {
        stamp: [
          { at: 0, rotate: 72 },
          { at: 0.22, rotate: 84 },
          { at: 0.38, rotate: -14 },
          { at: 1, rotate: -10 },
        ],
        head: [
          { at: 0, rotate: -5 },
          { at: 0.38, rotate: 10 },
          { at: 1, rotate: 7 },
        ],
        ledgers: [
          { at: 0, rotate: -1 },
          { at: 0.42, rotate: -7 },
          { at: 0.7, rotate: 3 },
          { at: 1, rotate: 0 },
        ],
        candles: [
          { at: 0, rotate: 0 },
          { at: 0.42, rotate: -9 },
          { at: 0.75, rotate: 5 },
          { at: 1, rotate: 0 },
        ],
        ribbons: [
          { at: 0, rotate: -2 },
          { at: 0.42, rotate: 12 },
          { at: 1, rotate: 2 },
        ],
      },
    },
    /** Witnessing: upright, the stamp lowered to its side, the lens turned on the party. */
    "intro:attest": {
      duration: 950,
      poses: [
        { at: 0, x: -0.08, y: 0.015, rotate: -6, scale: 1.04 },
        { at: 0.4, x: -0.03, y: 0, rotate: -1, squash: 0.97, scale: 1.04 },
        { at: 1, x: -0.03, y: 0, rotate: -1.5, scale: 1.04 },
      ],
      parts: {
        stamp: [
          { at: 0, rotate: -10 },
          { at: 0.4, rotate: 18 },
          { at: 1, rotate: 14 },
        ],
        head: [
          { at: 0, rotate: 7 },
          { at: 0.4, rotate: -9 },
          { at: 1, rotate: -8 },
        ],
      },
    },
  },
};
