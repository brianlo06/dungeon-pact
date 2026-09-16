import type { Rig } from "./animation";
import { GENERIC } from "./animation";
import { FORGE_RIGS } from "./rigs-forge";
import { DEBT_RIGS } from "./rigs-debt";
import { ARCHIVE_RIGS } from "./rigs-archive";
import { PARTY_RIGS } from "./rigs-party";
import { ULTIMATE_RIGS } from "./rigs-ultimate";

/**
 * Character rigs.
 *
 * Every combatant in the game now has one: the heroes in `rigs-party.ts`, the
 * foundry creatures in `rigs-forge.ts`, the Counting House's in `rigs-debt.ts`,
 * and the first creatures drawn — the Collector, the Bulwark, the Mender and
 * the Strongbox — here. The generic rig remains only as a fallback.
 *
 * These are transform rigs rather than frame sheets, and each drives the named
 * parts of an authored SVG creature, so a figure moves in pieces rather than
 * as one sticker. That buys anticipation and weight that would otherwise cost
 * dozens of hand-drawn frames per action.
 *
 * Poses are in screen space, in the creature's own facing. The animator knows
 * nothing about sides, so a hero's strike travels towards positive x and an
 * enemy's towards negative x. `tests/rig-facing.test.ts` and
 * `tests/party-rigs.test.ts` hold every rig to that.
 */

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
      { at: 0.3, y: -0.008, rotate: 0.8, squash: 1.004 },
      { at: 0.55, y: 0.004, rotate: -0.3 },
      { at: 0.8, y: -0.01, rotate: -0.9 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      // Everything hanging swings a beat behind the body.
      chains: [
        { at: 0, rotate: -0.8 },
        { at: 0.42, rotate: 1.4 },
        { at: 0.74, rotate: -1.2 },
        { at: 1, rotate: -0.8 },
      ],
      seals: [
        { at: 0, rotate: 1.2 },
        { at: 0.5, rotate: -1.6 },
        { at: 1, rotate: 1.2 },
      ],
      ledger: [
        { at: 0, rotate: -1.4 },
        { at: 0.46, rotate: 1.8 },
        { at: 1, rotate: -1.4 },
      ],
      key: [
        { at: 0, rotate: 0.6 },
        { at: 0.55, rotate: -0.9 },
        { at: 1, rotate: 0.6 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.36, rotate: 1.6 },
        { at: 0.68, rotate: -1.1 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /**
   * Close the account, held. The key comes up and hangs there — cocked back
   * over the shoulder, trembling rather than swinging — while the body leans
   * away from the party and the head stays down on it. The threat is the held
   * pose: nothing here returns to rest, so the loop never reads as a pulse.
   * The animator eases into it from wherever the figure was.
   */
  windup: {
    duration: 1600,
    loop: true,
    poses: [
      { at: 0, x: 0.02, y: -0.01, rotate: 2.6, scale: 1.02, flash: 0.08 },
      { at: 0.5, x: 0.024, y: -0.014, rotate: 3.2, scale: 1.024, flash: 0.18 },
      { at: 1, x: 0.02, y: -0.01, rotate: 2.6, scale: 1.02, flash: 0.08 },
    ],
    parts: {
      // Lifted clear of the head rather than swung across it: tilted back
      // any further, the bow disappears behind the hood and the silhouette
      // loses the one shape that says what this is.
      key: [
        { at: 0, rotate: 12, y: -0.085 },
        { at: 0.25, rotate: 14, y: -0.092 },
        { at: 0.5, rotate: 12.5, y: -0.087 },
        { at: 0.75, rotate: 14.5, y: -0.094 },
        { at: 1, rotate: 12, y: -0.085 },
      ],
      head: [
        { at: 0, rotate: -3 },
        { at: 0.5, rotate: -4.2 },
        { at: 1, rotate: -3 },
      ],
      // Everything hanging still lags, just on a tighter chain.
      chains: [
        { at: 0, rotate: -4 },
        { at: 0.55, rotate: -6.5 },
        { at: 1, rotate: -4 },
      ],
      seals: [
        { at: 0, rotate: 3 },
        { at: 0.6, rotate: -1.5 },
        { at: 1, rotate: 3 },
      ],
      ledger: [
        { at: 0, rotate: -3 },
        { at: 0.6, rotate: 1.5 },
        { at: 1, rotate: -3 },
      ],
    },
  },
  /** Repossess: rear back, then throw its weight forward into the chains. */
  signature: {
    duration: 1150,
    poses: [
      { at: 0, x: 0, rotate: 0, scale: 1 },
      { at: 0.2, x: 0.1, rotate: 6, scale: 1.04, squash: 1.1, flash: 0.2 },
      { at: 0.38, x: 0.12, rotate: 7, flash: 0.45 },
      { at: 0.5, x: -0.16, rotate: -8, squash: 0.9, scale: 1.06, flash: 0.6 },
      { at: 0.66, x: -0.1, rotate: -4, flash: 0.2 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1, flash: 0 },
    ],
    parts: {
      key: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 46, y: -0.06 },
        { at: 0.38, rotate: 52, y: -0.07 },
        { at: 0.52, rotate: -34, y: 0.02 },
        { at: 0.68, rotate: -18 },
        { at: 1, rotate: 0, y: 0 },
      ],
      chains: [
        { at: 0, rotate: 0 },
        { at: 0.34, rotate: 9 },
        { at: 0.56, rotate: -14 },
        { at: 0.8, rotate: 4 },
        { at: 1, rotate: 0 },
      ],
      seals: [
        { at: 0, rotate: 0 },
        { at: 0.36, rotate: 12 },
        { at: 0.6, rotate: -16 },
        { at: 1, rotate: 0 },
      ],
      ledger: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -14 },
        { at: 0.62, rotate: 10 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.36, rotate: -4 },
        { at: 0.52, rotate: 6 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  attack: {
    duration: 820,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.28, x: 0.08, rotate: 5, squash: 1.08 },
      { at: 0.46, x: -0.16, rotate: -7, squash: 0.92, scale: 1.03 },
      { at: 0.68, x: -0.08, rotate: -3 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1 },
    ],
    parts: {
      key: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 32 },
        { at: 0.48, rotate: -26 },
        { at: 0.72, rotate: -10 },
        { at: 1, rotate: 0 },
      ],
      chains: [
        { at: 0, rotate: 0 },
        { at: 0.42, rotate: 7 },
        { at: 0.62, rotate: -9 },
        { at: 1, rotate: 0 },
      ],
      ledger: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: -10 },
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
      { at: 0.2, rotate: -4, y: -0.03, flash: 0.7 },
      { at: 0.5, rotate: 18, y: 0.04, flash: 0.3 },
      { at: 1, rotate: 72, y: 0.18, scale: 0.92, flash: 0 },
    ],
    parts: {
      // The key falls out of its grip first.
      key: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: -24, y: 0.04 },
        { at: 1, rotate: -74, y: 0.2 },
      ],
      seals: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: -28 },
      ],
      ledger: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 24 },
      ],
    },
  },
};

/**
 * The Bulwark: immovable. Its idle is almost nothing and its attack is a ram.
 *
 * The plate leads everything. On a ram it drives forward ahead of the body and
 * the legs brace a beat late; on a block it comes up and locks; when it is hit,
 * the plate absorbs and the machine behind it barely registers.
 */
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
    parts: {
      // Only the exhaust moves. Everything else is planted.
      stacks: [
        { at: 0, rotate: 0 },
        { at: 0.45, rotate: 1.2 },
        { at: 1, rotate: 0 },
      ],
      shield: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: -0.4 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /**
   * Setting off: it rears back onto its heels, the plate lifting, and then
   * tips its weight forward so the plate is leading before a foot moves.
   */
  anticipate: {
    duration: 440,
    poses: [
      { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.55, x: 0.05, y: 0.012, rotate: 2.5, squash: 1.07 },
      { at: 1, x: 0.02, y: 0.004, rotate: -1.5, squash: 1.03 },
    ],
    parts: {
      shield: [
        { at: 0, x: 0, rotate: 0 },
        { at: 0.55, x: 0.03, rotate: 5 },
        { at: 1, x: -0.03, rotate: -3 },
      ],
      ram: [
        { at: 0, x: 0 },
        { at: 0.55, x: 0.03 },
        { at: 1, x: -0.03 },
      ],
      legs: [
        { at: 0, squash: 1 },
        { at: 0.55, squash: 1.08 },
        { at: 1, squash: 1.03 },
      ],
      stacks: [
        { at: 0, rotate: 0 },
        { at: 0.55, rotate: 7 },
        { at: 1, rotate: -2 },
      ],
      visor: [
        { at: 0, rotate: 0 },
        { at: 0.55, rotate: 3 },
        { at: 1, rotate: -2 },
      ],
    },
  },
  /**
   * The approach: a trudge, not a run. The plate is pitched forward and
   * leads; each step lands with the whole machine settling onto it, and the
   * legs are always a little behind the plate, catching up.
   */
  approach: {
    duration: 520,
    loop: true,
    poses: [
      { at: 0, y: 0, rotate: -1.5, squash: 1.035 },
      { at: 0.2, y: -0.014, rotate: -2, squash: 0.99 },
      { at: 0.5, y: 0, rotate: -1.5, squash: 1.035 },
      { at: 0.7, y: -0.014, rotate: -1, squash: 0.99 },
      { at: 1, y: 0, rotate: -1.5, squash: 1.035 },
    ],
    parts: {
      shield: [
        { at: 0, x: -0.035, rotate: -3, y: 0.004 },
        { at: 0.25, x: -0.04, rotate: -3.5, y: -0.004 },
        { at: 0.5, x: -0.035, rotate: -3, y: 0.004 },
        { at: 0.75, x: -0.04, rotate: -2.5, y: -0.004 },
        { at: 1, x: -0.035, rotate: -3, y: 0.004 },
      ],
      ram: [
        { at: 0, x: -0.035 },
        { at: 0.5, x: -0.04 },
        { at: 1, x: -0.035 },
      ],
      legs: [
        { at: 0, x: 0.03, squash: 1.05 },
        { at: 0.3, x: 0.005, squash: 0.98 },
        { at: 0.5, x: 0.03, squash: 1.05 },
        { at: 0.8, x: 0.005, squash: 0.98 },
        { at: 1, x: 0.03, squash: 1.05 },
      ],
      stacks: [
        { at: 0, rotate: 3 },
        { at: 0.25, rotate: -2 },
        { at: 0.5, rotate: 3 },
        { at: 0.75, rotate: -2 },
        { at: 1, rotate: 3 },
      ],
    },
  },
  /**
   * Going home it backs away, never turning: the plate stays towards the
   * party and the feet shuffle back under it.
   */
  retreat: {
    duration: 640,
    loop: true,
    poses: [
      { at: 0, y: 0, rotate: 0.5, squash: 1.02 },
      { at: 0.25, y: -0.01, rotate: 1, squash: 0.995 },
      { at: 0.5, y: 0, rotate: 0.5, squash: 1.02 },
      { at: 0.75, y: -0.01, rotate: 0, squash: 0.995 },
      { at: 1, y: 0, rotate: 0.5, squash: 1.02 },
    ],
    parts: {
      shield: [
        { at: 0, x: -0.02, rotate: -2 },
        { at: 0.5, x: -0.025, rotate: -1.5 },
        { at: 1, x: -0.02, rotate: -2 },
      ],
      legs: [
        { at: 0, x: -0.02, squash: 1.04 },
        { at: 0.3, x: 0.01 },
        { at: 0.5, x: -0.02, squash: 1.04 },
        { at: 0.8, x: 0.01 },
        { at: 1, x: -0.02, squash: 1.04 },
      ],
      stacks: [
        { at: 0, rotate: 1 },
        { at: 0.5, rotate: -1.5 },
        { at: 1, rotate: 1 },
      ],
    },
  },
  /**
   * Shield ram. It gathers back onto its legs, then drives the plate and the
   * ram boss through the target; the machine behind arrives a beat later and
   * the legs last, then it rocks back off the blow and settles, heavily.
   */
  attack: {
    duration: 980,
    markers: { contact: 0.4 },
    poses: [
      { at: 0, x: 0, rotate: -1, squash: 1 },
      { at: 0.24, x: 0.09, squash: 1.12, y: 0.016, rotate: 3 },
      { at: 0.4, x: -0.3, squash: 0.84, scale: 1.05, rotate: -4, flash: 0.25 },
      { at: 0.5, x: -0.23, squash: 0.95, scale: 1.02, rotate: 1 },
      { at: 0.62, x: -0.26, squash: 1.02, rotate: -1 },
      { at: 1, x: 0, squash: 1, scale: 1, y: 0, rotate: 0 },
    ],
    parts: {
      // The plate and the ram arrive first; the legs catch up.
      shield: [
        { at: 0, x: 0, rotate: 0 },
        { at: 0.24, x: 0.05, rotate: 5 },
        { at: 0.38, x: -0.1, rotate: -7 },
        { at: 0.47, x: -0.05, rotate: 1 },
        { at: 0.7, x: -0.03, rotate: -2 },
        { at: 1, x: 0, rotate: 0 },
      ],
      ram: [
        { at: 0, x: 0, scale: 1 },
        { at: 0.24, x: 0.06 },
        { at: 0.38, x: -0.16, scale: 1.16 },
        { at: 0.5, x: -0.07, scale: 1.04 },
        { at: 1, x: 0, scale: 1 },
      ],
      legs: [
        { at: 0, x: 0 },
        { at: 0.24, x: 0.04, squash: 1.08 },
        { at: 0.4, x: 0.045, squash: 1.02 },
        { at: 0.54, x: -0.07, squash: 0.96 },
        { at: 0.72, x: -0.02, squash: 1.02 },
        { at: 1, x: 0, squash: 1 },
      ],
      stacks: [
        { at: 0, rotate: 0 },
        { at: 0.24, rotate: 8 },
        { at: 0.44, rotate: -11 },
        { at: 0.6, rotate: 4 },
        { at: 1, rotate: 0 },
      ],
      visor: [
        { at: 0, rotate: 0 },
        { at: 0.24, rotate: 3 },
        { at: 0.42, rotate: -4 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Lock shields: the plate comes up and stays there. */
  block: {
    duration: 640,
    poses: [
      { at: 0, y: 0 },
      { at: 0.25, y: 0.012, squash: 1.06 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      shield: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.28, rotate: 7, scale: 1.06, y: -0.02 },
        { at: 0.5, rotate: 5, scale: 1.08, flash: 0.35 },
        { at: 1, rotate: 0, scale: 1, y: 0, flash: 0 },
      ],
      legs: [
        { at: 0, squash: 1 },
        { at: 0.3, squash: 1.08 },
        { at: 1, squash: 1 },
      ],
    },
  },
  hurt: {
    duration: 280,
    poses: [
      { at: 0, x: 0, flash: 0.8 },
      { at: 0.25, x: 0.05, squash: 0.96, flash: 0.4 },
      { at: 1, x: 0, squash: 1, flash: 0 },
    ],
    parts: {
      // The plate takes it. The body behind barely notices.
      shield: [
        { at: 0, x: 0, rotate: 0 },
        { at: 0.22, x: 0.05, rotate: 3, flash: 0.9 },
        { at: 0.6, x: -0.02, rotate: -1 },
        { at: 1, x: 0, rotate: 0, flash: 0 },
      ],
      stacks: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 5 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  defeat: {
    duration: 1000,
    poses: [
      { at: 0, rotate: 0, flash: 1 },
      { at: 0.25, rotate: -4, flash: 0.5 },
      { at: 1, rotate: 14, y: 0.16, scale: 0.95, flash: 0 },
    ],
    parts: {
      shield: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: -26, y: 0.12 },
      ],
      stacks: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: -18 },
      ],
    },
  },
};

/**
 * The Mender: fussy, quick, unpleasant. It does not bless things; it welds
 * them. The clamps reach out ahead of the body and work at the target, and the
 * bellows sac drives the whole rhythm.
 */
const mender: Rig = {
  idle: {
    duration: 2600,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0 },
      { at: 0.25, y: -0.02, rotate: -2 },
      { at: 0.5, y: -0.008, rotate: 1 },
      { at: 0.75, y: -0.024, rotate: -2.5 },
      { at: 1, y: 0, rotate: 0 },
    ],
    parts: {
      // The sac fills and empties; everything else twitches off that beat.
      bellows: [
        { at: 0, scale: 1, squash: 1 },
        { at: 0.38, scale: 1.06, squash: 1.05 },
        { at: 0.62, scale: 1.02, squash: 0.98 },
        { at: 1, scale: 1, squash: 1 },
      ],
      armA: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 4 },
        { at: 0.7, rotate: -3 },
        { at: 1, rotate: 0 },
      ],
      armB: [
        { at: 0, rotate: -2 },
        { at: 0.45, rotate: 5 },
        { at: 1, rotate: -2 },
      ],
      armC: [
        { at: 0, rotate: 3 },
        { at: 0.55, rotate: -4 },
        { at: 1, rotate: 3 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.32, rotate: -5 },
        { at: 0.64, rotate: 4 },
        { at: 1, rotate: 0 },
      ],
      flue: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: 2 },
        { at: 1, rotate: 0 },
      ],
      legs: [
        { at: 0, squash: 1, y: 0 },
        { at: 0.38, squash: 1.02, y: 0.006 },
        { at: 1, squash: 1, y: 0 },
      ],
    },
  },
  /**
   * Repair lattice: a weld. The clamps reach in towards the ally and work in
   * three short bursts, each one a jab and a twitch while the sac pumps the
   * heat through; on the last the lower clamp throws the weld across to the
   * ally at `release`, and the sac empties behind it.
   */
  cast: {
    duration: 1040,
    markers: { release: 0.66 },
    poses: [
      { at: 0, x: 0, y: 0, scale: 1, rotate: 0 },
      { at: 0.18, x: -0.03, y: -0.03, scale: 1.04, rotate: -4 },
      { at: 0.3, x: -0.035, y: -0.025, rotate: -3 },
      { at: 0.42, x: -0.03, y: -0.03, rotate: -5 },
      { at: 0.54, x: -0.035, y: -0.025, rotate: -3 },
      { at: 0.66, x: -0.06, y: -0.01, scale: 1.02, rotate: -7, flash: 0.35 },
      { at: 0.8, x: -0.02, y: 0, rotate: -1, flash: 0 },
      { at: 1, x: 0, y: 0, scale: 1, rotate: 0 },
    ],
    parts: {
      // The sac pumps once per burst and empties on the throw.
      bellows: [
        { at: 0, scale: 1, squash: 1 },
        { at: 0.18, scale: 1.1, squash: 1.06 },
        { at: 0.26, scale: 0.97, squash: 0.96 },
        { at: 0.38, scale: 1.1, squash: 1.06 },
        { at: 0.46, scale: 0.97, squash: 0.96 },
        { at: 0.58, scale: 1.14, squash: 1.08 },
        { at: 0.68, scale: 0.9, squash: 0.9 },
        { at: 1, scale: 1, squash: 1 },
      ],
      // The clamps reach in ahead of the body, towards the ally, and work.
      armA: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.16, rotate: -10, x: -0.05 },
        { at: 0.24, rotate: -4, x: -0.06 },
        { at: 0.36, rotate: -11, x: -0.05 },
        { at: 0.44, rotate: -4, x: -0.06 },
        { at: 0.56, rotate: -12, x: -0.05 },
        { at: 0.7, rotate: -6, x: -0.03 },
        { at: 1, rotate: 0, x: 0 },
      ],
      armB: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.18, rotate: 6, x: -0.06 },
        { at: 0.26, rotate: -3, x: -0.07 },
        { at: 0.38, rotate: 6, x: -0.06 },
        { at: 0.46, rotate: -3, x: -0.07 },
        { at: 0.58, rotate: 8, x: -0.04 },
        { at: 0.66, rotate: -8, x: -0.1 },
        { at: 0.8, rotate: -3, x: -0.04 },
        { at: 1, rotate: 0, x: 0 },
      ],
      armC: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.2, rotate: 8, x: -0.04 },
        { at: 0.28, rotate: 2, x: -0.05 },
        { at: 0.4, rotate: 9, x: -0.04 },
        { at: 0.48, rotate: 2, x: -0.05 },
        { at: 0.6, rotate: 10, x: -0.04 },
        { at: 0.72, rotate: 4, x: -0.02 },
        { at: 1, rotate: 0, x: 0 },
      ],
      flue: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.26, rotate: 4, scale: 1.06 },
        { at: 0.46, rotate: 2, scale: 1.04 },
        { at: 0.68, rotate: 7, scale: 1.12 },
        { at: 1, rotate: 0, scale: 1 },
      ],
      // The lens bends in to watch the work.
      head: [
        { at: 0, rotate: 0 },
        { at: 0.18, rotate: -9 },
        { at: 0.6, rotate: -11 },
        { at: 0.7, rotate: -4 },
        { at: 1, rotate: 0 },
      ],
      legs: [
        { at: 0, squash: 1, y: 0 },
        { at: 0.18, squash: 1.05, y: 0.008 },
        { at: 0.66, squash: 1.07, y: 0.01 },
        { at: 1, squash: 1, y: 0 },
      ],
    },
  },
  /** Wrench: a short, spiteful jab with the lower clamp, and straight back. */
  attack: {
    duration: 600,
    markers: { contact: 0.46 },
    poses: [
      { at: 0, x: 0 },
      { at: 0.28, x: 0.07, rotate: 5, squash: 1.05 },
      { at: 0.46, x: -0.17, rotate: -6, squash: 0.94 },
      { at: 0.62, x: -0.12, rotate: -3 },
      { at: 1, x: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      armB: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.28, rotate: -22, x: 0.03 },
        { at: 0.46, rotate: 18, x: -0.08 },
        { at: 0.64, rotate: 8, x: -0.03 },
        { at: 1, rotate: 0, x: 0 },
      ],
      armA: [
        { at: 0, rotate: 0 },
        { at: 0.28, rotate: 10 },
        { at: 0.48, rotate: -8 },
        { at: 1, rotate: 0 },
      ],
      bellows: [
        { at: 0, squash: 1 },
        { at: 0.28, squash: 1.06 },
        { at: 0.48, squash: 0.92 },
        { at: 1, squash: 1 },
      ],
    },
  },
  hurt: {
    duration: 340,
    poses: [
      { at: 0, x: 0, flash: 0.9 },
      { at: 0.2, x: 0.12, rotate: 8, squash: 0.9, flash: 0.5 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      // Spindly things flail. This is the opposite of the Bulwark.
      armA: [
        { at: 0, rotate: 0 },
        { at: 0.24, rotate: 24 },
        { at: 0.6, rotate: -12 },
        { at: 1, rotate: 0 },
      ],
      armB: [
        { at: 0, rotate: 0 },
        { at: 0.26, rotate: -26 },
        { at: 0.62, rotate: 10 },
        { at: 1, rotate: 0 },
      ],
      armC: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 20 },
        { at: 1, rotate: 0 },
      ],
      bellows: [
        { at: 0, squash: 1 },
        { at: 0.22, squash: 0.88 },
        { at: 1, squash: 1 },
      ],
    },
  },
  defeat: {
    duration: 900,
    poses: [
      { at: 0, rotate: 0, flash: 1 },
      { at: 0.3, rotate: 12, y: -0.03, flash: 0.5 },
      { at: 1, rotate: 78, y: 0.16, scale: 0.9, flash: 0 },
    ],
    parts: {
      // The sac empties and the limbs go slack.
      bellows: [
        { at: 0, scale: 1, squash: 1 },
        { at: 1, scale: 0.8, squash: 0.78 },
      ],
      armA: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 46 },
      ],
      armB: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: -38 },
      ],
      armC: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 30 },
      ],
      legs: [
        { at: 0, squash: 1 },
        { at: 1, squash: 0.7, y: 0.05 },
      ],
    },
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

// A hero's Ultimate performances join its rig under `ult:` names. Merged into
// the one rig object rather than copied, so the rig a combatant animates with
// is still the party rig itself.
// Poses written beside the Ultimate they belong to, in
// `src/client/ultimates/<id>/poses.ts`, each exporting `poses` by hero.
const folderPoses = import.meta.glob<{ poses: Record<string, Rig> }>(
  "../ultimates/*/poses.ts",
  { eager: true },
);
for (const source of [
  ["rigs-ultimate.ts", ULTIMATE_RIGS] as const,
  ...Object.entries(folderPoses).map(([path, m]) => [path, m.poses] as const),
])
  for (const [id, clips] of Object.entries(source[1] ?? {})) {
    const rig = PARTY_RIGS[id];
    if (!rig) continue;
    for (const name of Object.keys(clips))
      if (name.startsWith("ult:") && rig[name as keyof Rig])
        throw Error(`Pose ${name} for ${id} is defined twice (${source[0]})`);
    Object.assign(rig, clips);
  }

const RIGS: Record<string, Rig> = {
  ...PARTY_RIGS,
  collector,
  bulwark,
  mender,
  strongbox,
  ...FORGE_RIGS,
  ...DEBT_RIGS,
  ...ARCHIVE_RIGS,
};

/** The rig for a unit, falling back to the generic one. */
export function rigFor(spriteSet: string | undefined): Rig {
  return (spriteSet && RIGS[spriteSet]) || GENERIC;
}
export { GENERIC };
