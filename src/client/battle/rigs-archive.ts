import type { Rig } from "./animation";

/**
 * Rigs for the Ledger Archive: the Notary and its wax seals.
 *
 * Enemies face the party, which is to their left, and the root transform is
 * not mirrored for them. So in these rigs *forward is negative x* and leaning
 * into a blow is a *negative* rotation.
 */

/**
 * The Notary: deliberate. Its idle is reading — the head tilts down along a
 * line, the stamp resting at its side, the ledgers settling a beat behind any
 * shift of weight, the candle flames the only thing that never stops.
 *
 * The stamp arm pivots at the near shoulder with the matrix below and in front
 * of it, so a *positive* rotation of `stamp` raises it forward and up; around
 * 70 degrees it is held over the party's heads. Every blow is the stamp coming
 * down flat, never a swing: it presses.
 */
const notary: Rig = {
  idle: {
    duration: 6200,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.4, y: -0.006, rotate: -0.5, squash: 1.003 },
      { at: 0.75, y: 0.003, rotate: 0.4 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      head: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: -3 },
        { at: 0.55, rotate: -1.5 },
        { at: 0.82, rotate: 1.2 },
        { at: 1, rotate: 0 },
      ],
      stamp: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: 1.4 },
        { at: 1, rotate: 0 },
      ],
      ledgers: [
        { at: 0, rotate: 0.6 },
        { at: 0.5, rotate: -1.2 },
        { at: 1, rotate: 0.6 },
      ],
      candles: [
        { at: 0, rotate: -0.8 },
        { at: 0.35, rotate: 0.9 },
        { at: 0.7, rotate: -0.4 },
        { at: 1, rotate: -0.8 },
      ],
      ribbons: [
        { at: 0, rotate: 1.2 },
        { at: 0.55, rotate: -1.6 },
        { at: 1, rotate: 1.2 },
      ],
    },
  },
  /**
   * Press the seals, held. The stamp goes up over the party and hangs there,
   * trembling under its own weight; the body leans back to hold it and the head
   * tips up to look along it. Nothing returns to rest, so the loop reads as a
   * threat and not a pulse.
   */
  windup: {
    duration: 1500,
    loop: true,
    poses: [
      { at: 0, x: 0.02, y: -0.012, rotate: 2.4, scale: 1.02, flash: 0.08 },
      { at: 0.5, x: 0.026, y: -0.016, rotate: 3, scale: 1.026, flash: 0.18 },
      { at: 1, x: 0.02, y: -0.012, rotate: 2.4, scale: 1.02, flash: 0.08 },
    ],
    parts: {
      stamp: [
        { at: 0, rotate: 64, y: -0.05 },
        { at: 0.25, rotate: 67, y: -0.056 },
        { at: 0.5, rotate: 64.5, y: -0.051 },
        { at: 0.75, rotate: 68, y: -0.058 },
        { at: 1, rotate: 64, y: -0.05 },
      ],
      head: [
        { at: 0, rotate: 5 },
        { at: 0.5, rotate: 6.5 },
        { at: 1, rotate: 5 },
      ],
      ledgers: [
        { at: 0, rotate: 3 },
        { at: 0.55, rotate: 4.5 },
        { at: 1, rotate: 3 },
      ],
      candles: [
        { at: 0, rotate: 3 },
        { at: 0.5, rotate: 1 },
        { at: 1, rotate: 3 },
      ],
      ribbons: [
        { at: 0, rotate: 4 },
        { at: 0.5, rotate: 6 },
        { at: 1, rotate: 4 },
      ],
    },
  },
  /**
   * The pressing lands: the stamp comes down flat from overhead and the whole
   * figure drops its weight onto it; the ledgers jump and settle late.
   */
  signature: {
    duration: 1200,
    markers: { contact: 0.46 },
    poses: [
      { at: 0, x: 0.02, y: -0.012, rotate: 2.4, scale: 1.02 },
      { at: 0.3, x: 0.04, y: -0.03, rotate: 4, scale: 1.04, squash: 1.06, flash: 0.3 },
      { at: 0.46, x: -0.14, y: 0.02, rotate: -6, scale: 1.05, squash: 0.9, flash: 0.65 },
      { at: 0.62, x: -0.1, y: 0.012, rotate: -4, flash: 0.25 },
      { at: 1, x: 0, y: 0, rotate: 0, scale: 1, squash: 1, flash: 0 },
    ],
    parts: {
      stamp: [
        { at: 0, rotate: 64, y: -0.05 },
        { at: 0.3, rotate: 82, y: -0.08 },
        { at: 0.46, rotate: -12, y: 0.03 },
        { at: 0.62, rotate: -8, y: 0.02 },
        { at: 1, rotate: 0, y: 0 },
      ],
      head: [
        { at: 0, rotate: 5 },
        { at: 0.46, rotate: -6 },
        { at: 1, rotate: 0 },
      ],
      ledgers: [
        { at: 0, rotate: 3 },
        { at: 0.5, rotate: -2 },
        { at: 0.62, rotate: 7 },
        { at: 0.84, rotate: -2 },
        { at: 1, rotate: 0 },
      ],
      candles: [
        { at: 0, rotate: 3 },
        { at: 0.52, rotate: -9 },
        { at: 0.8, rotate: 4 },
        { at: 1, rotate: 0 },
      ],
      ribbons: [
        { at: 0, rotate: 4 },
        { at: 0.5, rotate: -10 },
        { at: 0.78, rotate: 5 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Attest: a smaller press, the stamp lifted to the shoulder and brought down. */
  attack: {
    duration: 860,
    markers: { contact: 0.5 },
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.3, x: 0.05, rotate: 3, squash: 1.05 },
      { at: 0.5, x: -0.15, rotate: -6, squash: 0.93, scale: 1.03 },
      { at: 0.7, x: -0.08, rotate: -3 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1 },
    ],
    parts: {
      stamp: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 38, y: -0.03 },
        { at: 0.5, rotate: -10, y: 0.02 },
        { at: 0.72, rotate: -4 },
        { at: 1, rotate: 0, y: 0 },
      ],
      ledgers: [
        { at: 0, rotate: 0 },
        { at: 0.55, rotate: 4 },
        { at: 1, rotate: 0 },
      ],
      ribbons: [
        { at: 0, rotate: 0 },
        { at: 0.52, rotate: -7 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Countersign, or anything aimed at itself: the stamp drawn in across the body. */
  block: {
    duration: 700,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.4, x: 0.03, rotate: 2, squash: 1.03 },
      { at: 1, x: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      stamp: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -18 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -4 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt: {
    duration: 320,
    poses: [
      // It barely moves. What it carries takes the hit.
      { at: 0, x: 0, flash: 0.85 },
      { at: 0.2, x: 0.035, rotate: 1.6, squash: 0.97, flash: 0.5 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      ledgers: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 6 },
        { at: 0.7, rotate: -3 },
        { at: 1, rotate: 0 },
      ],
      candles: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 7 },
        { at: 1, rotate: 0 },
      ],
      ribbons: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 8 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** The stack goes first, then the stamp, then the Notary folds after them. */
  defeat: {
    duration: 1500,
    poses: [
      { at: 0, rotate: 0, flash: 1 },
      { at: 0.25, rotate: 3, y: -0.02, flash: 0.6 },
      { at: 0.55, rotate: 16, y: 0.05, flash: 0.25 },
      { at: 1, rotate: 64, y: 0.2, scale: 0.92, flash: 0 },
    ],
    parts: {
      ledgers: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 22, x: 0.04 },
        { at: 1, rotate: 58, x: 0.1, y: 0.1 },
      ],
      stamp: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -30, y: 0.06 },
        { at: 1, rotate: -60, y: 0.18 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 18 },
      ],
      candles: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 40 },
      ],
    },
  },
};

/**
 * A wax seal: an object. Its idle is the wax settling — the slightest sag as
 * it sets, never a flash, since it idles through every planning phase. When it
 * is enforced it heaves towards the party once; when it breaks it splits and
 * slumps.
 */
const waxSeal: Rig = {
  idle: {
    duration: 4200,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.5, y: 0.004, squash: 1.012 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      drip: [
        { at: 0, y: 0 },
        { at: 0.6, y: 0.02 },
        { at: 1, y: 0 },
      ],
      ribbons: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: -1 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Enforced: it swells, then heaves at the party and settles flat. */
  attack: {
    duration: 760,
    markers: { contact: 0.5 },
    poses: [
      { at: 0, x: 0, scale: 1, flash: 0 },
      { at: 0.3, x: 0.02, scale: 1.12, squash: 0.94, flash: 0.5 },
      { at: 0.5, x: -0.08, scale: 1.08, squash: 1.1, flash: 0.9 },
      { at: 1, x: 0, scale: 1, squash: 1, flash: 0 },
    ],
    parts: {
      disc: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 4 },
        { at: 0.5, rotate: -8 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt: {
    duration: 300,
    poses: [
      { at: 0, x: 0, flash: 0.8 },
      { at: 0.25, x: 0.03, squash: 0.94, flash: 0.4 },
      { at: 1, x: 0, squash: 1, flash: 0 },
    ],
    parts: {
      disc: [
        { at: 0, rotate: 0 },
        { at: 0.25, rotate: 5 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Cracked: it splits and slumps into the floor. */
  defeat: {
    duration: 900,
    poses: [
      { at: 0, scale: 1, flash: 1 },
      { at: 0.3, scale: 1.06, squash: 1.12, flash: 0.6 },
      { at: 1, y: 0.1, scale: 0.7, squash: 1.5, flash: 0 },
    ],
    parts: {
      disc: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -14 },
        { at: 1, rotate: -22, y: 0.06 },
      ],
      ribbons: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 10 },
      ],
    },
  },
};

export const ARCHIVE_RIGS: Record<string, Rig> = {
  notary,
  "wax-seal": waxSeal,
};
