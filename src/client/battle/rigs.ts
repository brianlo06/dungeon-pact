import type { Rig } from "./animation";
import { GENERIC } from "./animation";

/**
 * Character rigs.
 *
 * The Vanguard is the first fully animated combatant, chosen because its
 * vocabulary exercises everything: a weighty strike, a shield raise, a physical
 * move into an ally's attack line, a recoil, a fall and a recovery. Everything
 * else in the game still uses the generic rig and looks fine doing it.
 *
 * These are transform rigs rather than frame sheets. With no character art yet
 * that is the only way to get anticipation and weight at all — and for bosses
 * it stays the right answer even once art exists, because a cutout rig buys
 * heft that would otherwise cost dozens of hand-drawn frames.
 */

/** A shield-bearer: slow, planted, and heavy through the hips. */
const vanguard: Rig = {
  idle: {
    duration: 4200,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      // Weight shifts onto the shield side, then back. Breathing is the small
      // part of this; the shift is what makes it read as standing guard.
      { at: 0.28, y: -0.012, rotate: -1.1, squash: 1.006 },
      { at: 0.52, y: -0.004, rotate: 0.2 },
      { at: 0.78, y: -0.016, rotate: 1, squash: 0.996 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
  },
  anticipate: {
    duration: 260,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 1, x: -0.13, rotate: -6, squash: 1.08, y: 0.01 },
    ],
  },
  /** Basic strike: coil, drive through, follow through, recover. */
  attack: {
    duration: 620,
    poses: [
      { at: 0, x: 0, rotate: 0, squash: 1 },
      { at: 0.26, x: -0.14, rotate: -7, squash: 1.09, y: 0.012 },
      { at: 0.34, x: -0.15, rotate: -8 },
      { at: 0.47, x: 0.26, rotate: 9, squash: 0.88, scale: 1.06, y: -0.01 },
      { at: 0.6, x: 0.19, rotate: 5, squash: 0.96 },
      { at: 0.78, x: 0.05, rotate: 1 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1, y: 0 },
    ],
  },
  /** Shieldbreaker: the same shape, bigger, slower, and it lands harder. */
  signature: {
    duration: 880,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.22, x: -0.2, rotate: -11, squash: 1.14, y: 0.02, scale: 1.02 },
      { at: 0.4, x: -0.22, rotate: -12, flash: 0.25 },
      { at: 0.52, x: 0.34, rotate: 14, squash: 0.82, scale: 1.12, flash: 0.5 },
      { at: 0.64, x: 0.26, rotate: 8, squash: 0.95, flash: 0.15 },
      { at: 0.84, x: 0.07, rotate: 2 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1, y: 0, flash: 0 },
    ],
  },
  /** Brace: the shield comes up and stays up. */
  block: {
    duration: 700,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.18, x: -0.05, rotate: -3, y: 0.012, squash: 1.08 },
      { at: 0.36, x: 0.03, rotate: 2, scale: 1.05, flash: 0.3 },
      { at: 0.62, x: 0.01, rotate: 1, scale: 1.03, flash: 0.1 },
      { at: 1, x: 0, rotate: 0, scale: 1, squash: 1, flash: 0 },
    ],
  },
  /** Intercept: drive across, plant, take it on the shield. */
  cast: {
    duration: 760,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.14, x: -0.08, rotate: -5, squash: 1.1 },
      { at: 0.34, x: 0.3, rotate: 4, squash: 0.92, scale: 1.04 },
      { at: 0.46, x: 0.26, rotate: 0, squash: 1.06, scale: 1.06, flash: 0.35 },
      { at: 0.62, x: 0.3, rotate: 3, squash: 0.94, flash: 0.15 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1, flash: 0 },
    ],
  },
  hurt: {
    duration: 380,
    poses: [
      { at: 0, x: 0, flash: 0.9 },
      { at: 0.16, x: 0.13, rotate: 7, squash: 0.88, flash: 0.6 },
      { at: 0.42, x: -0.05, rotate: -3, squash: 1.04 },
      { at: 0.7, x: 0.02, rotate: 1 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
  },
  down: {
    duration: 640,
    poses: [
      { at: 0, rotate: 0, y: 0, flash: 0.5 },
      { at: 0.22, rotate: -8, y: -0.03, flash: 0.2 },
      { at: 0.55, rotate: -42, y: 0.06 },
      { at: 1, rotate: -74, y: 0.14, squash: 1.2, flash: 0 },
    ],
  },
  revive: {
    duration: 820,
    poses: [
      { at: 0, rotate: -74, y: 0.14, squash: 1.2 },
      { at: 0.35, rotate: -40, y: 0.08, flash: 0.5 },
      { at: 0.68, rotate: 6, y: -0.05, scale: 1.05, flash: 0.8 },
      { at: 1, rotate: 0, y: 0, scale: 1, squash: 1, flash: 0 },
    ],
  },
};

/**
 * The Collector: never bounces. It leans, plants, and swings from the hips.
 *
 * This is the cutout rig in earnest — the key-arm, the chains, the seals and
 * the ledger each get their own track, so the figure moves in pieces the way
 * something heavy does. Chains and hanging seals lag deliberately behind the
 * body: that lag is most of what sells the weight.
 */
const collector: Rig = {
  idle: {
    duration: 5800,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.3, y: -0.008, rotate: -0.8, squash: 1.004 },
      { at: 0.55, y: 0.004, rotate: 0.3 },
      { at: 0.8, y: -0.01, rotate: 0.9 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      // Everything hanging swings a beat behind the body.
      chains: [
        { at: 0, rotate: 0.8 },
        { at: 0.42, rotate: -1.4 },
        { at: 0.74, rotate: 1.2 },
        { at: 1, rotate: 0.8 },
      ],
      seals: [
        { at: 0, rotate: -1.2 },
        { at: 0.5, rotate: 1.6 },
        { at: 1, rotate: -1.2 },
      ],
      ledger: [
        { at: 0, rotate: 1.4 },
        { at: 0.46, rotate: -1.8 },
        { at: 1, rotate: 1.4 },
      ],
      key: [
        { at: 0, rotate: -0.6 },
        { at: 0.55, rotate: 0.9 },
        { at: 1, rotate: -0.6 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.36, rotate: -1.6 },
        { at: 0.68, rotate: 1.1 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  windup: {
    duration: 1100,
    loop: true,
    poses: [
      { at: 0, scale: 1, flash: 0, rotate: 0 },
      { at: 0.45, scale: 1.05, flash: 0.3, rotate: -2, y: -0.02 },
      { at: 1, scale: 1, flash: 0, rotate: 0 },
    ],
    parts: {
      // The key comes up and hangs there. The threat is the held pose.
      key: [
        { at: 0, rotate: 0 },
        { at: 0.45, rotate: -22, y: -0.04 },
        { at: 1, rotate: 0 },
      ],
      chains: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: 4 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Repossess: rear back, then throw its weight forward into the chains. */
  signature: {
    duration: 1150,
    poses: [
      { at: 0, x: 0, rotate: 0, scale: 1 },
      { at: 0.2, x: -0.1, rotate: -6, scale: 1.04, squash: 1.1, flash: 0.2 },
      { at: 0.38, x: -0.12, rotate: -7, flash: 0.45 },
      { at: 0.5, x: 0.16, rotate: 8, squash: 0.9, scale: 1.06, flash: 0.6 },
      { at: 0.66, x: 0.1, rotate: 4, flash: 0.2 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1, flash: 0 },
    ],
    parts: {
      key: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: -46, y: -0.06 },
        { at: 0.38, rotate: -52, y: -0.07 },
        { at: 0.52, rotate: 34, y: 0.02 },
        { at: 0.68, rotate: 18 },
        { at: 1, rotate: 0, y: 0 },
      ],
      chains: [
        { at: 0, rotate: 0 },
        { at: 0.34, rotate: -9 },
        { at: 0.56, rotate: 14 },
        { at: 0.8, rotate: -4 },
        { at: 1, rotate: 0 },
      ],
      seals: [
        { at: 0, rotate: 0 },
        { at: 0.36, rotate: -12 },
        { at: 0.6, rotate: 16 },
        { at: 1, rotate: 0 },
      ],
      ledger: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: 14 },
        { at: 0.62, rotate: -10 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.36, rotate: 4 },
        { at: 0.52, rotate: -6 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  attack: {
    duration: 820,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.28, x: -0.08, rotate: -5, squash: 1.08 },
      { at: 0.46, x: 0.16, rotate: 7, squash: 0.92, scale: 1.03 },
      { at: 0.68, x: 0.08, rotate: 3 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1 },
    ],
    parts: {
      key: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: -32 },
        { at: 0.48, rotate: 26 },
        { at: 0.72, rotate: 10 },
        { at: 1, rotate: 0 },
      ],
      chains: [
        { at: 0, rotate: 0 },
        { at: 0.42, rotate: -7 },
        { at: 0.62, rotate: 9 },
        { at: 1, rotate: 0 },
      ],
      ledger: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: 10 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt: {
    duration: 320,
    poses: [
      // A boss barely moves when hit. That is most of what makes it read heavy.
      { at: 0, x: 0, flash: 0.85 },
      { at: 0.2, x: 0.04, rotate: 2, squash: 0.97, flash: 0.5 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      // The figure holds; only what hangs off it reacts.
      seals: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 9 },
        { at: 0.7, rotate: -5 },
        { at: 1, rotate: 0 },
      ],
      ledger: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: -8 },
        { at: 1, rotate: 0 },
      ],
      chains: [
        { at: 0, rotate: 0 },
        { at: 0.32, rotate: 6 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  defeat: {
    duration: 1400,
    poses: [
      { at: 0, rotate: 0, flash: 1 },
      { at: 0.2, rotate: 4, y: -0.03, flash: 0.7 },
      { at: 0.5, rotate: -18, y: 0.04, flash: 0.3 },
      { at: 1, rotate: -72, y: 0.18, scale: 0.92, flash: 0 },
    ],
    parts: {
      // The key falls out of its grip first.
      key: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 24, y: 0.04 },
        { at: 1, rotate: 74, y: 0.2 },
      ],
      seals: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 28 },
      ],
      ledger: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: -24 },
      ],
    },
  },
};

/** The Bulwark: immovable. Its idle is almost nothing; its attack is a ram. */
const bulwark: Rig = {
  idle: {
    duration: 5200,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.5, y: -0.005, squash: 1.004 },
      { at: 1, y: 0, squash: 1 },
    ],
  },
  attack: {
    duration: 760,
    poses: [
      { at: 0, x: 0 },
      { at: 0.32, x: -0.12, squash: 1.12, y: 0.015 },
      { at: 0.46, x: 0.3, squash: 0.86, scale: 1.05 },
      { at: 0.62, x: 0.24 },
      { at: 1, x: 0, squash: 1, scale: 1, y: 0 },
    ],
  },
  hurt: {
    duration: 280,
    poses: [
      { at: 0, x: 0, flash: 0.8 },
      { at: 0.25, x: 0.05, squash: 0.96, flash: 0.4 },
      { at: 1, x: 0, squash: 1, flash: 0 },
    ],
  },
};

/** The Mender: fussy, quick, unpleasant. Its heal is a forging motion. */
const mender: Rig = {
  idle: {
    duration: 2600,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0 },
      { at: 0.25, y: -0.02, rotate: 2 },
      { at: 0.5, y: -0.008, rotate: -1 },
      { at: 0.75, y: -0.024, rotate: 2.5 },
      { at: 1, y: 0, rotate: 0 },
    ],
  },
  cast: {
    duration: 620,
    poses: [
      { at: 0, y: 0, scale: 1 },
      { at: 0.3, y: -0.05, scale: 1.06, rotate: -4, flash: 0.3 },
      { at: 0.55, y: 0.01, scale: 0.98, rotate: 3, flash: 0.55 },
      { at: 1, y: 0, scale: 1, rotate: 0, flash: 0 },
    ],
  },
};

/** The vault does not breathe. It ticks, and its locks work. */
const strongbox: Rig = {
  idle: {
    duration: 6500,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, squash: 1, flash: 0 },
      { at: 0.46, y: -0.004, squash: 1.002, flash: 0.05 },
      { at: 0.54, flash: 0.12 },
      { at: 1, y: 0, squash: 1, flash: 0 },
    ],
  },
  hurt: {
    duration: 300,
    poses: [
      { at: 0, x: 0, flash: 1 },
      { at: 0.2, x: 0.07, rotate: -4, squash: 0.93, flash: 0.6 },
      { at: 0.55, x: -0.03, rotate: 2 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
  },
  defeat: {
    duration: 900,
    poses: [
      { at: 0, scale: 1, flash: 1 },
      { at: 0.16, scale: 1.16, squash: 1.2, flash: 1 },
      { at: 0.34, scale: 1.05, rotate: -6, flash: 0.5 },
      { at: 1, scale: 0.97, rotate: -3, y: 0.02, flash: 0 },
    ],
  },
};

const RIGS: Record<string, Rig> = {
  vanguard,
  collector,
  bulwark,
  mender,
  strongbox,
};

/** The rig for a unit, falling back to the generic one. */
export function rigFor(spriteSet: string | undefined): Rig {
  return (spriteSet && RIGS[spriteSet]) || GENERIC;
}
export { GENERIC };
