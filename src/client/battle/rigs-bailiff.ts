import type { Rig } from "./animation";

/**
 * The Bailiff's rig.
 *
 * Enemies face the party, which is to their left, and the root transform is
 * not mirrored for them, so *forward is negative x* and leaning into a blow is
 * a *negative* rotation.
 *
 * The tipstaff pivots at the near shoulder with its crown up and in front: a
 * *positive* rotation swings it back over the hat, a negative one brings it
 * down. The Bailiff is the one boss that barely leans: it is upright and
 * deliberate, and its weight goes into the staff, not the body.
 */
const bailiff: Rig = {
  idle: {
    duration: 5800,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.5, y: -0.004, squash: 1.006 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      // Tapping the staff against its palm, slowly.
      staff: [
        { at: 0, rotate: 0 },
        { at: 0.25, rotate: 6 },
        { at: 0.35, rotate: 0 },
        { at: 0.75, rotate: 6 },
        { at: 0.85, rotate: 0 },
        { at: 1, rotate: 0 },
      ],
      chain: [
        { at: 0, rotate: -1 },
        { at: 0.5, rotate: 1.4 },
        { at: 1, rotate: -1 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -2 },
        { at: 0.7, rotate: 1 },
        { at: 1, rotate: 0 },
      ],
      summons: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: -2 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Collect: the staff raised over the hat and brought down on the debtor. */
  attack: {
    duration: 860,
    markers: { contact: 0.48 },
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.3, x: 0.04, rotate: 2, squash: 1.04 },
      { at: 0.48, x: -0.15, rotate: -5, squash: 0.94, scale: 1.03 },
      { at: 0.7, x: -0.08, rotate: -2 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1 },
    ],
    parts: {
      staff: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 44 },
        { at: 0.48, rotate: -30 },
        { at: 0.72, rotate: -14 },
        { at: 1, rotate: 0 },
      ],
      chain: [
        { at: 0, rotate: 0 },
        { at: 0.55, rotate: -8 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.48, rotate: -4 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /**
   * Serving a lien: the summons flourished at the target and the staff
   * pointed after them — the writ is the blow.
   */
  signature: {
    duration: 1100,
    markers: { contact: 0.52 },
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.3, x: 0.03, rotate: 2, flash: 0.25 },
      { at: 0.52, x: -0.13, rotate: -4, scale: 1.04, flash: 0.55 },
      { at: 0.75, x: -0.07, rotate: -2, flash: 0.15 },
      { at: 1, x: 0, rotate: 0, scale: 1, flash: 0 },
    ],
    parts: {
      summons: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 30 },
        { at: 0.52, rotate: -26 },
        { at: 1, rotate: 0 },
      ],
      staff: [
        { at: 0, rotate: 0 },
        { at: 0.52, rotate: -18 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.52, rotate: -5 },
        { at: 1, rotate: 0 },
      ],
      chain: [
        { at: 0, rotate: 0 },
        { at: 0.6, rotate: -9 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt: {
    duration: 320,
    poses: [
      { at: 0, x: 0, flash: 0.85 },
      { at: 0.2, x: 0.025, rotate: 1, squash: 0.98, flash: 0.5 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      chain: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 8 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 3 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** The summons scatter, the staff drops, and it goes down like a door. */
  defeat: {
    duration: 1400,
    poses: [
      { at: 0, rotate: 0, flash: 1 },
      { at: 0.35, rotate: -2, y: 0.01, flash: 0.5 },
      { at: 1, rotate: 70, y: 0.18, scale: 0.94, flash: 0 },
    ],
    parts: {
      summons: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 40, y: 0.04 },
        { at: 1, rotate: 70, y: 0.14 },
      ],
      staff: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -40, y: 0.05 },
        { at: 1, rotate: -78, y: 0.18 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 16 },
      ],
    },
  },
};

export const BAILIFF_RIGS: Record<string, Rig> = { bailiff };
