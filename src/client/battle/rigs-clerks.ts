import type { Rig } from "./animation";

/**
 * The Archive's clerks.
 *
 * Enemies face the party, to their left, so a strike travels towards negative
 * x (`tests/rig-facing.test.ts`). These are deliberate, unhurried figures:
 * clerks who work at a desk rather than fighters. The Scribe stamps between
 * turns, the Wraith writes, the Indexer points, and the Stalker is the one
 * restless thing in the room.
 */

const hurt: Rig["hurt"] = {
  duration: 340,
  poses: [
    { at: 0, x: 0, rotate: 0 },
    { at: 0.25, x: 0.05, rotate: 6, flash: 0.5 },
    { at: 1, x: 0, rotate: 0, flash: 0 },
  ],
};
const defeat: Rig["defeat"] = {
  duration: 720,
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.35, y: 0.02, rotate: -10, squash: 1.06 },
    { at: 1, y: 0.1, rotate: -32, squash: 1.18, scale: 0.94 },
  ],
};

/** The Scribe: it stamps on the spot, and never leaves its page. */
const scribe: Rig = {
  idle: {
    duration: 3000,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0 },
      { at: 0.5, y: -0.006, rotate: 0.6 },
      { at: 1, y: 0, rotate: 0 },
    ],
    parts: {
      // Between turns it stamps: the arm falls, the stack settles after it.
      arm: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 22 },
        { at: 0.42, rotate: -10 },
        { at: 0.6, rotate: 0 },
        { at: 1, rotate: 0 },
      ],
      stack: [
        { at: 0, y: 0 },
        { at: 0.46, y: 0.006 },
        { at: 1, y: 0 },
      ],
      head: [
        { at: 0, rotate: 2 },
        { at: 0.5, rotate: -2 },
        { at: 1, rotate: 2 },
      ],
    },
  },
  /** Stamp: a short press forward. */
  attack: {
    duration: 600,
    markers: { contact: 0.44 },
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.24, x: 0.04, rotate: 4 },
      { at: 0.44, x: -0.12, rotate: -6, squash: 0.96 },
      { at: 1, x: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      arm: [
        { at: 0, rotate: 0 },
        { at: 0.24, rotate: 34 },
        { at: 0.46, rotate: -40 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** The sentence: wax pressed with both hands, held while it sets. */
  signature: {
    duration: 980,
    markers: { contact: 0.52 },
    poses: [
      { at: 0, x: 0, rotate: 0, flash: 0 },
      { at: 0.34, x: 0.03, rotate: 3, squash: 1.05, flash: 0.3 },
      { at: 0.52, x: -0.1, rotate: -5, squash: 0.94, flash: 0.7 },
      { at: 0.76, x: -0.05, flash: 0.2 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      arm: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.34, rotate: 44, y: -0.03 },
        { at: 0.54, rotate: -30, y: 0.02 },
        { at: 1, rotate: 0, y: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: 8 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt,
  defeat,
};

/** A sentence: wax on its edge. It sets, and splits when it is broken. */
const sentenceSeal: Rig = {
  idle: {
    duration: 4200,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.5, y: 0.003, squash: 1.008 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      ribbons: [
        { at: 0, rotate: -1.5 },
        { at: 0.5, rotate: 2 },
        { at: 1, rotate: -1.5 },
      ],
    },
  },
  hurt: {
    duration: 300,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.3, x: 0.03, rotate: 5, flash: 0.6 },
      { at: 1, x: 0, rotate: 0, flash: 0 },
    ],
  },
  defeat: {
    duration: 600,
    poses: [
      { at: 0, rotate: 0, squash: 1 },
      { at: 0.3, rotate: 8, squash: 0.88 },
      { at: 1, rotate: 22, squash: 1.2, y: 0.05, scale: 0.9 },
    ],
  },
};

/** The Wraith: it writes. Nothing it does is a blow. */
const wraith: Rig = {
  idle: {
    duration: 4000,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: -0.5 },
      { at: 0.5, y: -0.012, rotate: 0.8 },
      { at: 1, y: 0, rotate: -0.5 },
    ],
    parts: {
      shroud: [
        { at: 0, rotate: -1.4 },
        { at: 0.45, rotate: 2 },
        { at: 1, rotate: -1.4 },
      ],
      ledger: [
        { at: 0, y: 0, rotate: 0 },
        { at: 0.4, y: -0.008, rotate: 2 },
        { at: 1, y: 0, rotate: 0 },
      ],
    },
  },
  /** Cold grasp: a reach across the page. */
  attack: {
    duration: 660,
    markers: { contact: 0.46 },
    poses: [
      { at: 0, x: 0 },
      { at: 0.26, x: 0.04, rotate: 4 },
      { at: 0.46, x: -0.14, rotate: -6 },
      { at: 1, x: 0, rotate: 0 },
    ],
    parts: {
      ledger: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 14 },
        { at: 0.5, rotate: -16 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** The entry: it writes the debt, and the ink settles on the page. */
  signature: {
    duration: 940,
    markers: { contact: 0.5 },
    poses: [
      { at: 0, x: 0, flash: 0 },
      { at: 0.4, x: -0.03, rotate: -2, flash: 0.35 },
      { at: 0.56, x: -0.08, rotate: -4, flash: 0.7 },
      { at: 1, x: 0, rotate: 0, flash: 0 },
    ],
    parts: {
      ledger: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.4, rotate: -8, scale: 1.08 },
        { at: 0.6, rotate: 6, scale: 1.04 },
        { at: 1, rotate: 0, scale: 1 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: -6 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt,
  defeat,
};

/** The Indexer: it points, and the point is the whole action. */
const indexer: Rig = {
  idle: {
    duration: 2800,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0 },
      { at: 0.4, y: -0.01, rotate: -1 },
      { at: 1, y: 0, rotate: 0 },
    ],
    parts: {
      arms: [
        { at: 0, rotate: -2 },
        { at: 0.35, rotate: 4 },
        { at: 0.7, rotate: -3 },
        { at: 1, rotate: -2 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.25, rotate: -5 },
        { at: 0.6, rotate: 4 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Index: the arm snaps out straight at whoever it has chosen. */
  attack: {
    duration: 580,
    markers: { contact: 0.4 },
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.22, x: 0.03, rotate: 3 },
      { at: 0.4, x: -0.1, rotate: -5 },
      { at: 1, x: 0, rotate: 0 },
    ],
    parts: {
      arms: [
        { at: 0, rotate: 0 },
        { at: 0.22, rotate: 24 },
        { at: 0.42, rotate: -36 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt,
  defeat,
};

/** The Stalker: restless. It is never still, and never where it was. */
const stalker: Rig = {
  idle: {
    duration: 1900,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: -1, squash: 1 },
      { at: 0.3, y: -0.014, rotate: 1.5, squash: 1.02 },
      { at: 0.6, y: -0.004, rotate: -1.5 },
      { at: 1, y: 0, rotate: -1, squash: 1 },
    ],
    parts: {
      cloak: [
        { at: 0, rotate: -3 },
        { at: 0.4, rotate: 4 },
        { at: 0.75, rotate: -2 },
        { at: 1, rotate: -3 },
      ],
      arm: [
        { at: 0, rotate: 2 },
        { at: 0.5, rotate: -4 },
        { at: 1, rotate: 2 },
      ],
    },
  },
  /** Footnote: one precise thrust, low and fast. */
  attack: {
    duration: 520,
    markers: { contact: 0.36 },
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.18, x: 0.06, rotate: 7, squash: 1.08 },
      { at: 0.36, x: -0.24, rotate: -12, squash: 0.86, scale: 1.04 },
      { at: 0.6, x: -0.12, rotate: -5 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1 },
    ],
    parts: {
      arm: [
        { at: 0, rotate: 0 },
        { at: 0.18, rotate: 30 },
        { at: 0.38, rotate: -46 },
        { at: 1, rotate: 0 },
      ],
      cloak: [
        { at: 0, rotate: 0 },
        { at: 0.36, rotate: 16 },
        { at: 0.7, rotate: -6 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Sidenote: it turns behind its own cloak and is gone. */
  block: {
    duration: 620,
    poses: [
      { at: 0, x: 0, scale: 1 },
      { at: 0.35, x: 0.04, scale: 0.94, rotate: -6 },
      { at: 0.6, x: 0.02, scale: 0.9, rotate: 4 },
      { at: 1, x: 0, scale: 1, rotate: 0 },
    ],
    parts: {
      cloak: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.35, rotate: 26, scale: 1.16 },
        { at: 0.7, rotate: -10, scale: 1.06 },
        { at: 1, rotate: 0, scale: 1 },
      ],
    },
  },
  hurt,
  defeat,
};

export const CLERK_RIGS: Record<string, Rig> = {
  scribe,
  "sentence-seal": sentenceSeal,
  wraith,
  indexer,
  stalker,
};
