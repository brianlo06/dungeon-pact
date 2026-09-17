import type { Rig } from "../../battle/animation";

/**
 * The Salvor's entrance performance, merged into its rig as `intro:` clips.
 *
 * Forward is negative x. The gaff pivots at the near shoulder with the hook up
 * and in front: a positive rotation swings it back over the helmet, a negative
 * one brings it down onto the party. The hump lags the body; the lantern
 * swings. It comes up out of the water the way a wreck is raised — slow, then
 * all at once.
 */
export const poses: Record<string, Rig> = {
  salvor: {
    /** Up out of the water: sunk to the hump, it stands, the gaff drawn back over the helmet. */
    "intro:rise": {
      duration: 900,
      poses: [
        { at: 0, y: 0.8, rotate: 6, scale: 0.98 },
        { at: 0.35, y: 0.6, rotate: 4 },
        { at: 0.75, y: -0.01, rotate: -1, squash: 0.97, scale: 1.02 },
        { at: 1, y: 0, rotate: 0, squash: 1, scale: 1.02 },
      ],
      parts: {
        hook: [
          { at: 0, rotate: -20 },
          { at: 0.6, rotate: 30 },
          { at: 1, rotate: 42 },
        ],
        shell: [
          { at: 0, rotate: 4, y: 0.02 },
          { at: 0.8, rotate: -4, y: -0.01 },
          { at: 1, rotate: -1, y: 0 },
        ],
        lantern: [
          { at: 0, rotate: 0 },
          { at: 0.7, rotate: 22 },
          { at: 1, rotate: -10 },
        ],
        helmet: [
          { at: 0, rotate: 10 },
          { at: 0.7, rotate: -6 },
          { at: 1, rotate: -4 },
        ],
      },
    },
    /** The gaff brought down on the ledge at 0.38, and held there, leaning on it. */
    "intro:haul": {
      duration: 1000,
      markers: { contact: 0.38 },
      poses: [
        { at: 0, x: 0, rotate: 0, scale: 1.02 },
        { at: 0.2, x: 0.05, rotate: 4, squash: 1.05, scale: 1.03 },
        { at: 0.38, x: -0.14, rotate: -7, squash: 0.92, scale: 1.05, flash: 0.3 },
        { at: 0.62, x: -0.11, rotate: -5, flash: 0 },
        { at: 1, x: -0.1, rotate: -4.5, scale: 1.04, squash: 0.97 },
      ],
      parts: {
        hook: [
          { at: 0, rotate: 42 },
          { at: 0.2, rotate: 58 },
          { at: 0.38, rotate: -46 },
          { at: 1, rotate: -40 },
        ],
        shell: [
          { at: 0, rotate: -1 },
          { at: 0.42, rotate: -8 },
          { at: 0.7, rotate: 4 },
          { at: 1, rotate: 0 },
        ],
        lantern: [
          { at: 0, rotate: -10 },
          { at: 0.42, rotate: -30 },
          { at: 0.75, rotate: 16 },
          { at: 1, rotate: -4 },
        ],
        helmet: [
          { at: 0, rotate: -4 },
          { at: 0.4, rotate: 8 },
          { at: 1, rotate: 4 },
        ],
      },
    },
    /** Taking the plates: hunched forward, the hump rocked back to receive them, the helmet turned up at the party. */
    "intro:harden": {
      duration: 950,
      poses: [
        { at: 0, x: -0.04, rotate: -3, scale: 1.02 },
        { at: 0.5, x: -0.02, rotate: -5, squash: 1.03, scale: 1.03 },
        { at: 1, x: -0.02, rotate: -4, scale: 1.03 },
      ],
      parts: {
        shell: [
          { at: 0, rotate: 0 },
          { at: 0.45, rotate: 5, y: -0.01 },
          { at: 0.6, rotate: -3, y: 0.005 },
          { at: 0.75, rotate: 4 },
          { at: 1, rotate: 1 },
        ],
        hook: [
          { at: 0, rotate: -20 },
          { at: 1, rotate: -12 },
        ],
        helmet: [
          { at: 0, rotate: 2 },
          { at: 0.5, rotate: -8 },
          { at: 1, rotate: -7 },
        ],
        lantern: [
          { at: 0, rotate: 4 },
          { at: 0.5, rotate: -8 },
          { at: 1, rotate: 3 },
        ],
      },
    },
  },
};
