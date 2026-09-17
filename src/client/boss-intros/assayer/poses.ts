import type { Rig } from "../../battle/animation";

/**
 * The Assayer's entrance performance, merged into its rig as `intro:` clips.
 *
 * Forward is negative x. The tongs pivot at the near shoulder: a positive
 * rotation lifts the crucible forward and up, a negative one tips it. It is a
 * kiln on legs — it does not rise so much as come up to temperature, and every
 * move of the crucible arrives late and heavy.
 */
export const poses: Record<string, Rig> = {
  assayer: {
    /** Coming up to the pour: squat and cold, it straightens and lifts the crucible high, gauge tipped up at it. */
    "intro:lift": {
      duration: 900,
      poses: [
        { at: 0, y: 0.05, squash: 1.1, scale: 0.96, flash: 0 },
        { at: 0.55, x: 0.02, y: -0.01, rotate: 2, squash: 0.98, scale: 1.01, flash: 0.2 },
        { at: 1, x: 0.03, y: -0.012, rotate: 3.5, squash: 1, scale: 1.03, flash: 0.3 },
      ],
      parts: {
        tongs: [
          { at: 0, rotate: -12, y: 0.02 },
          { at: 0.6, rotate: 36, y: -0.03 },
          { at: 1, rotate: 44, y: -0.045 },
        ],
        head: [
          { at: 0, rotate: -4 },
          { at: 0.6, rotate: 7 },
          { at: 1, rotate: 8 },
        ],
        flue: [
          { at: 0, rotate: 0 },
          { at: 0.3, rotate: 4 },
          { at: 0.6, rotate: -3 },
          { at: 1, rotate: 1 },
        ],
        legs: [
          { at: 0, squash: 1.1 },
          { at: 0.55, squash: 0.97 },
          { at: 1, squash: 1 },
        ],
      },
    },
    /** The pour, and held: thrust out and tipped over at 0.38, leaning after it. */
    "intro:pour": {
      duration: 1000,
      markers: { contact: 0.38 },
      poses: [
        { at: 0, x: 0.03, y: -0.012, rotate: 3.5, scale: 1.03, flash: 0.3 },
        { at: 0.2, x: 0.05, rotate: 5, squash: 1.05, flash: 0.4 },
        { at: 0.38, x: -0.12, rotate: -6, scale: 1.05, squash: 0.93, flash: 0.75 },
        { at: 0.6, x: -0.1, rotate: -5, flash: 0.45 },
        { at: 1, x: -0.09, rotate: -4.5, scale: 1.04, squash: 0.97, flash: 0.35 },
      ],
      parts: {
        tongs: [
          { at: 0, rotate: 44, y: -0.045 },
          { at: 0.2, rotate: 52, y: -0.055 },
          { at: 0.38, rotate: -46, y: 0.02 },
          { at: 1, rotate: -40, y: 0.02 },
        ],
        head: [
          { at: 0, rotate: 8 },
          { at: 0.4, rotate: -6 },
          { at: 1, rotate: -4 },
        ],
        flue: [
          { at: 0, rotate: 1 },
          { at: 0.4, rotate: -9 },
          { at: 0.7, rotate: 4 },
          { at: 1, rotate: 0 },
        ],
        legs: [
          { at: 0, squash: 1 },
          { at: 0.4, squash: 0.9 },
          { at: 1, squash: 0.96 },
        ],
      },
    },
  },
};
