import type { Rig } from "./animation";

/**
 * The Assayer's rig.
 *
 * Enemies face the party, which is to their left, and the root transform is
 * not mirrored for them, so *forward is negative x* and leaning into a blow is
 * a *negative* rotation.
 *
 * The tongs pivot at the near shoulder with the crucible below and in front of
 * them: a *positive* rotation lifts the crucible forward and up, a negative
 * one lowers and tips it. Everything heavy moves late; the flue shakes on
 * every step of weight.
 */
const assayer: Rig = {
  idle: {
    duration: 5200,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.5, y: 0.006, squash: 1.012 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      // The kiln breathes; the crucible sways on the tongs a beat behind it.
      body: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: 0.8 },
        { at: 1, rotate: 0 },
      ],
      tongs: [
        { at: 0, rotate: 0 },
        { at: 0.55, rotate: -2 },
        { at: 1, rotate: 0 },
      ],
      flue: [
        { at: 0, rotate: 0 },
        { at: 0.6, rotate: 1.4 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: -2.5 },
        { at: 0.7, rotate: 1.2 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /**
   * Bringing it to the pour, held. The crucible comes up to chest height and
   * hangs there shaking; the Assayer rocks back on its heels to take the
   * weight and the gauge head tips up along it.
   */
  windup: {
    duration: 1400,
    loop: true,
    poses: [
      { at: 0, x: 0.03, y: -0.006, rotate: 3, scale: 1.02, flash: 0.1 },
      { at: 0.5, x: 0.036, y: -0.01, rotate: 3.8, scale: 1.026, flash: 0.22 },
      { at: 1, x: 0.03, y: -0.006, rotate: 3, scale: 1.02, flash: 0.1 },
    ],
    parts: {
      tongs: [
        { at: 0, rotate: 34, y: -0.03 },
        { at: 0.25, rotate: 37, y: -0.034 },
        { at: 0.5, rotate: 34.5, y: -0.031 },
        { at: 0.75, rotate: 38, y: -0.036 },
        { at: 1, rotate: 34, y: -0.03 },
      ],
      head: [
        { at: 0, rotate: 6 },
        { at: 0.5, rotate: 7.5 },
        { at: 1, rotate: 6 },
      ],
      flue: [
        { at: 0, rotate: 3 },
        { at: 0.5, rotate: 5 },
        { at: 1, rotate: 3 },
      ],
      body: [
        { at: 0, rotate: 2 },
        { at: 1, rotate: 2 },
      ],
    },
  },
  /**
   * The pour: the crucible thrust out over the row and tipped right over, the
   * whole kiln lunging after it, then hauled back.
   */
  signature: {
    duration: 1250,
    markers: { contact: 0.5 },
    poses: [
      { at: 0, x: 0.03, rotate: 3, scale: 1.02 },
      { at: 0.28, x: 0.05, rotate: 5, squash: 1.06, flash: 0.35 },
      { at: 0.5, x: -0.15, rotate: -7, scale: 1.05, squash: 0.92, flash: 0.7 },
      { at: 0.7, x: -0.1, rotate: -4, flash: 0.3 },
      { at: 1, x: 0, rotate: 0, scale: 1, squash: 1, flash: 0 },
    ],
    parts: {
      tongs: [
        { at: 0, rotate: 34, y: -0.03 },
        { at: 0.28, rotate: 46, y: -0.05 },
        { at: 0.5, rotate: -48, y: 0.02 },
        { at: 0.72, rotate: -40, y: 0.02 },
        { at: 1, rotate: 0, y: 0 },
      ],
      flue: [
        { at: 0, rotate: 3 },
        { at: 0.52, rotate: -8 },
        { at: 0.8, rotate: 4 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 6 },
        { at: 0.5, rotate: -5 },
        { at: 1, rotate: 0 },
      ],
      legs: [
        { at: 0, squash: 1 },
        { at: 0.5, squash: 0.92 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Tongs: a short jab with the crucible's edge. */
  attack: {
    duration: 820,
    markers: { contact: 0.46 },
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.28, x: 0.05, rotate: 3, squash: 1.05 },
      { at: 0.46, x: -0.14, rotate: -5, squash: 0.94, scale: 1.02 },
      { at: 0.7, x: -0.07, rotate: -2 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1 },
    ],
    parts: {
      tongs: [
        { at: 0, rotate: 0 },
        { at: 0.28, rotate: 16 },
        { at: 0.46, rotate: -14 },
        { at: 1, rotate: 0 },
      ],
      flue: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: -4 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Heating: the kiln settles and draws; the crucible lifts to the grate. */
  block: {
    duration: 760,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.45, y: 0.012, squash: 1.05, flash: 0.25 },
      { at: 1, y: 0, squash: 1, flash: 0 },
    ],
    parts: {
      tongs: [
        { at: 0, rotate: 0 },
        { at: 0.45, rotate: 18 },
        { at: 1, rotate: 0 },
      ],
      flue: [
        { at: 0, rotate: 0 },
        { at: 0.45, rotate: 4 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt: {
    duration: 320,
    poses: [
      { at: 0, x: 0, flash: 0.85 },
      { at: 0.2, x: 0.03, rotate: 1.5, squash: 0.97, flash: 0.5 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      tongs: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: -6 },
        { at: 1, rotate: 0 },
      ],
      flue: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 5 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** The crucible drops first, then the kiln cracks and sits down. */
  defeat: {
    duration: 1400,
    poses: [
      { at: 0, rotate: 0, flash: 1 },
      { at: 0.3, rotate: -3, y: 0.02, flash: 0.6 },
      { at: 1, rotate: 26, y: 0.14, scale: 0.94, squash: 1.1, flash: 0 },
    ],
    parts: {
      tongs: [
        { at: 0, rotate: 0 },
        { at: 0.35, rotate: -40, y: 0.06 },
        { at: 1, rotate: -70, y: 0.16 },
      ],
      flue: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 30 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 22 },
      ],
    },
  },
};

export const ASSAYER_RIGS: Record<string, Rig> = { assayer };
