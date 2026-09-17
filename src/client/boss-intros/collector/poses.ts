import type { Rig } from "../../battle/animation";

/**
 * The Collector's entrance performance, merged into its rig as `intro:` clips.
 *
 * The rig faces the party (to its left): forward is negative x. The key arm
 * pivots at the near shoulder with the key standing up; a positive rotation
 * lifts it back over the hood, a negative one brings it down in front. The
 * chains, seals and ledger always lag the body — that lag is the weight.
 */
export const poses: Record<string, Rig> = {
  collector: {
    /**
     * Out of the dark: it starts hunched low, as if it has been sitting in the
     * shaft all along, and draws itself up to full height with the key lifted.
     * Held at the top, trembling a little: the loudest moment is still to come.
     */
    "intro:loom": {
      duration: 1100,
      poses: [
        { at: 0, x: 0.03, y: 0.06, rotate: 5, scale: 0.94, squash: 1.06 },
        { at: 0.55, x: 0.01, y: -0.01, rotate: 1, scale: 1.02, squash: 0.98 },
        { at: 0.8, x: 0.015, y: -0.018, rotate: 2, scale: 1.03 },
        { at: 1, x: 0.015, y: -0.016, rotate: 1.6, scale: 1.03 },
      ],
      parts: {
        key: [
          { at: 0, rotate: -6, y: 0.02 },
          { at: 0.6, rotate: 38, y: -0.08 },
          { at: 0.8, rotate: 42, y: -0.09 },
          { at: 1, rotate: 40.5, y: -0.086 },
        ],
        head: [
          { at: 0, rotate: 10 },
          { at: 0.6, rotate: -5 },
          { at: 1, rotate: -4 },
        ],
        chains: [
          { at: 0, rotate: 8 },
          { at: 0.5, rotate: -10 },
          { at: 0.8, rotate: 5 },
          { at: 1, rotate: 2 },
        ],
        seals: [
          { at: 0, rotate: -6 },
          { at: 0.55, rotate: 12 },
          { at: 0.85, rotate: -5 },
          { at: 1, rotate: 0 },
        ],
        ledger: [
          { at: 0, rotate: 10 },
          { at: 0.6, rotate: -12 },
          { at: 1, rotate: 3 },
        ],
      },
    },
    /**
     * The key comes down on the grate. Contact at 0.4: the whole figure drops
     * its weight onto it, everything hanging off it jumps, and it stays down
     * over the key, head lowered at the party.
     */
    "intro:strike": {
      duration: 1000,
      markers: { contact: 0.4 },
      poses: [
        { at: 0, x: 0.015, y: -0.016, rotate: 1.6, scale: 1.03 },
        { at: 0.28, x: 0.04, y: -0.03, rotate: 5, scale: 1.05, squash: 1.06, flash: 0.2 },
        { at: 0.4, x: -0.1, y: 0.02, rotate: -7, scale: 1.06, squash: 0.9, flash: 0.6 },
        { at: 0.6, x: -0.08, y: 0.015, rotate: -5, flash: 0.15 },
        { at: 1, x: -0.06, y: 0.01, rotate: -4, scale: 1.04, squash: 1 },
      ],
      parts: {
        key: [
          { at: 0, rotate: 40, y: -0.086 },
          { at: 0.28, rotate: 58, y: -0.1 },
          { at: 0.4, rotate: -30, y: 0.04 },
          { at: 1, rotate: -26, y: 0.035 },
        ],
        head: [
          { at: 0, rotate: -4 },
          { at: 0.4, rotate: 8 },
          { at: 1, rotate: 6 },
        ],
        chains: [
          { at: 0, rotate: 2 },
          { at: 0.42, rotate: -16 },
          { at: 0.65, rotate: 9 },
          { at: 1, rotate: -2 },
        ],
        seals: [
          { at: 0, rotate: 0 },
          { at: 0.45, rotate: -18 },
          { at: 0.7, rotate: 10 },
          { at: 1, rotate: -2 },
        ],
        ledger: [
          { at: 0, rotate: 3 },
          { at: 0.45, rotate: 20 },
          { at: 0.72, rotate: -10 },
          { at: 1, rotate: 2 },
        ],
      },
    },
    /**
     * Appraisal: the key levelled at the party like a pointer, the head tilting
     * as it reads them, the ledger lifted — everything you carry is collateral.
     */
    "intro:appraise": {
      duration: 900,
      poses: [
        { at: 0, x: -0.06, y: 0.01, rotate: -4, scale: 1.04 },
        { at: 0.4, x: -0.04, y: -0.004, rotate: -1, scale: 1.03 },
        { at: 1, x: -0.045, y: -0.002, rotate: -1.5, scale: 1.03 },
      ],
      parts: {
        key: [
          { at: 0, rotate: -26, y: 0.035 },
          { at: 0.45, rotate: -58, y: -0.01, x: -0.04 },
          { at: 1, rotate: -55, y: -0.008, x: -0.038 },
        ],
        head: [
          { at: 0, rotate: 6 },
          { at: 0.5, rotate: -7 },
          { at: 1, rotate: -6 },
        ],
        ledger: [
          { at: 0, rotate: 2 },
          { at: 0.5, rotate: -22, y: -0.03 },
          { at: 1, rotate: -20, y: -0.028 },
        ],
        chains: [
          { at: 0, rotate: -2 },
          { at: 0.5, rotate: 5 },
          { at: 1, rotate: 3 },
        ],
      },
    },
  },
};
