import type { Clip, Pose, Rig } from "./animation";

/**
 * Ultimate performances.
 *
 * These are poses no ordinary action plays, kept apart from the combat rigs
 * so a cinematic never overloads `attack` and a round never plays a pose made
 * for a close-up. They merge into a rig under `ult:` names (see `rigs.ts`);
 * a hero without any simply idles through a cinematic that asks for one.
 *
 * Close-ups are why these are bigger than anything in `rigs-party.ts`. A pose
 * that reads at 120px on the battlefield is a twitch at a full screen's height,
 * so these commit: the shield comes down a tenth of the figure, the helm lifts
 * a whole degree band, the cape travels. The same named parts as the combat
 * rig — `legs`, `body`, `head`, `shield`, `sword`, `blade`, `cape` — and the
 * same direction rule: the Vanguard faces right, forward is +x.
 */

const turn = (...keys: [number, number][]): Pose[] =>
  keys.map(([at, rotate]) => ({ at, rotate }));

/** Cloth that never settles, for shots that hold. */
const billow = (base: number, reach: number): Pose[] =>
  turn(
    [0, base],
    [0.2, base + reach],
    [0.42, base - reach * 0.4],
    [0.64, base + reach * 1.1],
    [0.84, base - reach * 0.2],
    [1, base + reach * 0.6],
  );

const plant: Clip = {
  duration: 620,
  markers: { contact: 0.2 },
  poses: [
    { at: 0, y: 0, x: 0, rotate: 0, squash: 1 },
    // Up onto the toes with the shield: the anticipation.
    { at: 0.12, y: -0.05, x: 0.01, rotate: -3, squash: 0.94, scale: 1.02 },
    // Down, all of it, onto the rim.
    { at: 0.2, y: 0.035, x: 0.03, rotate: 4, squash: 1.14, scale: 1.02, flash: 0.35 },
    { at: 0.32, y: 0.028, x: 0.025, rotate: 3, squash: 1.08, flash: 0.1 },
    { at: 1, y: 0.03, x: 0.025, rotate: 3.4, squash: 1.1, flash: 0 },
  ],
  parts: {
    shield: [
      { at: 0, y: 0, x: 0, rotate: 0 },
      { at: 0.12, y: -0.08, x: 0.01, rotate: -12 },
      { at: 0.2, y: 0.09, x: 0.02, rotate: 3, scale: 1.04 },
      { at: 0.3, y: 0.08, x: 0.02, rotate: 1.5, scale: 1.02 },
      // It shivers where it bit into the floor.
      { at: 0.5, y: 0.082, x: 0.021, rotate: 2.2 },
      { at: 0.7, y: 0.08, x: 0.02, rotate: 1.6 },
      { at: 1, y: 0.081, x: 0.02, rotate: 2 },
    ],
    sword: turn([0, 0], [0.12, 34], [0.2, 20], [0.4, 26], [1, 24]),
    blade: turn([0, 0], [0.12, -20], [1, -14]),
    head: turn([0, 0], [0.12, -4], [0.2, 9], [0.4, 7], [1, 8]),
    cape: turn([0, 0], [0.12, 8], [0.22, -26], [0.45, -8], [0.7, -14], [1, -10]),
    legs: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.12, squash: 0.94 },
      { at: 0.2, squash: 1.16, y: 0.01 },
      { at: 1, squash: 1.12, y: 0.01 },
    ],
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.2, squash: 1.06, y: 0.012 },
      { at: 1, squash: 1.04, y: 0.01 },
    ],
  },
};

/** Rising out of the plant into the wall: sword up, chin up, cape flying. */
const stand: Clip = {
  duration: 900,
  poses: [
    { at: 0, y: 0.03, x: 0.02, rotate: 3, squash: 1.1 },
    { at: 0.35, y: -0.01, x: 0.01, rotate: -1.5, squash: 0.97, scale: 1.02 },
    { at: 0.55, y: 0, x: 0, rotate: -0.5, squash: 1, scale: 1.03 },
    { at: 1, y: -0.004, x: 0, rotate: -1, squash: 1, scale: 1.035 },
  ],
  parts: {
    shield: [
      { at: 0, y: 0.08, x: 0.02, rotate: 2 },
      { at: 0.4, y: 0.02, x: 0.03, rotate: -3, scale: 1.04 },
      { at: 1, y: 0.015, x: 0.03, rotate: -2, scale: 1.05 },
    ],
    // The sword goes straight up over the helm, point to the ceiling.
    sword: turn([0, 24], [0.35, 118], [0.55, 128], [0.8, 124], [1, 126]),
    blade: turn([0, -14], [0.35, -86], [0.55, -92], [1, -90]),
    head: turn([0, 8], [0.4, -7], [0.7, -9], [1, -8]),
    cape: billow(-14, 10),
    legs: [
      { at: 0, squash: 1.12, y: 0.01 },
      { at: 0.4, squash: 0.98, y: 0 },
      { at: 1, squash: 1, y: 0 },
    ],
    body: [
      { at: 0, squash: 1.04 },
      { at: 0.4, squash: 0.97 },
      { at: 1, squash: 0.98 },
    ],
  },
};

/** The breath before: the helm drops onto the target, the sword draws back. */
const ready: Clip = {
  duration: 520,
  poses: [
    { at: 0, x: 0, y: 0, rotate: -1, scale: 1.03 },
    { at: 0.6, x: -0.04, y: 0.01, rotate: -5, squash: 1.05, scale: 1.03 },
    { at: 1, x: -0.05, y: 0.012, rotate: -6, squash: 1.07, scale: 1.03 },
  ],
  parts: {
    head: [
      { at: 0, rotate: -8, y: 0 },
      // A slow lift, then it settles onto them: the look.
      { at: 0.45, rotate: -11, y: -0.004 },
      { at: 0.8, rotate: 5, y: 0.006 },
      { at: 1, rotate: 6, y: 0.006 },
    ],
    sword: turn([0, 126], [0.5, 96], [1, 74]),
    blade: turn([0, -90], [0.5, -70], [1, -58]),
    shield: [
      { at: 0, y: 0.015, x: 0.03, rotate: -2, scale: 1.05 },
      { at: 1, y: -0.03, x: 0.045, rotate: -7, scale: 1.08 },
    ],
    cape: turn([0, -8], [0.5, -2], [1, 4]),
    legs: [
      { at: 0, squash: 1 },
      { at: 1, squash: 1.08, y: 0.008 },
    ],
  },
};

/** The charge: shield first, head down behind it, cape streaming. A loop. */
const charge: Clip = {
  duration: 300,
  loop: true,
  poses: [
    { at: 0, x: 0.02, y: 0, rotate: 13, squash: 1.04 },
    { at: 0.25, x: 0.03, y: -0.03, rotate: 14.5, squash: 0.95 },
    { at: 0.5, x: 0.02, y: 0.004, rotate: 13, squash: 1.06 },
    { at: 0.75, x: 0.03, y: -0.03, rotate: 14.5, squash: 0.95 },
    { at: 1, x: 0.02, y: 0, rotate: 13, squash: 1.04 },
  ],
  parts: {
    shield: [
      { at: 0, x: 0.07, y: -0.03, rotate: -8, scale: 1.1 },
      { at: 0.5, x: 0.075, y: -0.035, rotate: -9, scale: 1.1 },
      { at: 1, x: 0.07, y: -0.03, rotate: -8, scale: 1.1 },
    ],
    sword: turn([0, 60], [0.5, 66], [1, 60]),
    blade: turn([0, -40], [1, -40]),
    head: turn([0, 8], [0.5, 10], [1, 8]),
    cape: turn([0, -30], [0.25, -38], [0.5, -26], [0.75, -40], [1, -30]),
    legs: [
      { at: 0, squash: 1.1 },
      { at: 0.25, squash: 0.9 },
      { at: 0.5, squash: 1.1 },
      { at: 0.75, squash: 0.9 },
      { at: 1, squash: 1.1 },
    ],
  },
};

/** Contact: the shield slams through, the sword comes over after it. */
const strike: Clip = {
  duration: 560,
  markers: { contact: 0.04 },
  poses: [
    { at: 0, x: 0.06, rotate: 14, squash: 0.92, scale: 1.02 },
    { at: 0.04, x: 0.16, rotate: 9, squash: 0.84, scale: 1.08, flash: 0.8 },
    { at: 0.22, x: 0.13, rotate: 6, squash: 0.92, scale: 1.06, flash: 0.3 },
    { at: 0.46, x: 0.18, rotate: 11, squash: 0.9, scale: 1.07, flash: 0.1 },
    { at: 1, x: 0.1, rotate: 4, squash: 1, scale: 1.04, flash: 0 },
  ],
  parts: {
    shield: [
      { at: 0, x: 0.07, y: -0.03, rotate: -8, scale: 1.1 },
      { at: 0.04, x: 0.12, y: -0.02, rotate: -2, scale: 1.16 },
      { at: 0.3, x: 0.09, y: -0.01, rotate: 4, scale: 1.1 },
      { at: 1, x: 0.05, y: 0, rotate: 2, scale: 1.05 },
    ],
    // The follow-through: over the top and down on them, a full turn.
    sword: turn([0, 60], [0.2, 110], [0.46, 250], [0.7, 300], [1, 340]),
    blade: turn([0, -40], [0.2, -70], [0.46, -110], [0.7, -250], [1, -330]),
    head: turn([0, 10], [0.04, 2], [0.46, 12], [1, 4]),
    cape: turn([0, -30], [0.05, 18], [0.3, 30], [0.6, 6], [1, -4]),
    legs: [
      { at: 0, squash: 1.1 },
      { at: 0.04, squash: 0.86 },
      { at: 0.4, squash: 1.06 },
      { at: 1, squash: 1 },
    ],
  },
};

/** Home, and the wall held up over the party: shield high, sword grounded. */
const guard: Clip = {
  duration: 720,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, scale: 1 },
    { at: 0.2, x: -0.03, y: 0.015, rotate: -2, squash: 1.08, scale: 1.02, flash: 0.4 },
    { at: 0.5, x: 0.01, y: -0.01, rotate: 1, squash: 0.98, scale: 1.05, flash: 0.2 },
    { at: 1, x: 0, y: 0, rotate: 0, squash: 1, scale: 1, flash: 0 },
  ],
  parts: {
    shield: [
      { at: 0, y: 0, rotate: 0, scale: 1 },
      { at: 0.2, y: -0.06, x: 0.03, rotate: -10, scale: 1.12 },
      { at: 0.7, y: -0.05, x: 0.03, rotate: -8, scale: 1.1 },
      { at: 1, y: 0, x: 0, rotate: 0, scale: 1 },
    ],
    sword: turn([0, 0], [0.2, -24], [0.8, -20], [1, 0]),
    head: turn([0, 0], [0.2, -6], [0.8, -4], [1, 0]),
    cape: turn([0, 0], [0.2, -18], [0.5, 8], [0.8, -6], [1, 0]),
  },
};

/* ── The Breaker ─────────────────────────────────────────────────────────── */

/** The grip: the shield turned edge-on, the arm locking round it. */
const heat: Clip = {
  duration: 560,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.5, x: -0.02, y: 0.01, rotate: 5, squash: 1.05 },
    { at: 1, x: -0.02, y: 0.012, rotate: 6, squash: 1.06 },
  ],
  parts: {
    // Scale and squash together turn the heater side-on: narrow, not tall.
    shield: [
      { at: 0, rotate: 0, x: 0, scale: 1, squash: 1 },
      { at: 0.35, rotate: -18, x: 0.06, scale: 0.8, squash: 0.62 },
      { at: 1, rotate: -22, x: 0.07, scale: 0.78, squash: 0.56 },
    ],
    sword: turn([0, 0], [0.4, -30], [1, -36]),
    blade: turn([0, 0], [1, 30]),
    head: turn([0, 0], [0.5, 10], [1, 12]),
    cape: turn([0, 0], [0.5, -10], [1, -6]),
    body: [
      { at: 0, squash: 1 },
      { at: 1, squash: 1.06, y: 0.01 },
    ],
  },
};

/** The load: down low over the feet, everything pointed at the gate. */
const crouch: Clip = {
  duration: 420,
  poses: [
    { at: 0, x: -0.02, y: 0.012, rotate: 6, squash: 1.06 },
    { at: 0.6, x: -0.06, y: 0.06, rotate: 20, squash: 1.2, scale: 0.98 },
    { at: 1, x: -0.065, y: 0.065, rotate: 22, squash: 1.22, scale: 0.98 },
  ],
  parts: {
    shield: [
      { at: 0, rotate: -22, x: 0.07, scale: 0.78, squash: 0.56 },
      { at: 0.5, rotate: -6, x: 0.08, scale: 1.08, squash: 1 },
      { at: 1, rotate: -4, x: 0.09, scale: 1.12, squash: 1 },
    ],
    sword: turn([0, -36], [1, 40]),
    blade: turn([0, 30], [1, -30]),
    head: turn([0, 12], [1, 18]),
    cape: turn([0, -6], [0.6, -30], [1, -34]),
    legs: [
      { at: 0, squash: 1 },
      { at: 1, squash: 1.26, y: 0.02 },
    ],
  },
};

/** The ram: rigid, flat out, the whole figure a battering head. A loop. */
const ram: Clip = {
  duration: 220,
  loop: true,
  poses: [
    { at: 0, x: 0.05, y: 0.01, rotate: 24, squash: 1.08 },
    { at: 0.5, x: 0.055, y: -0.012, rotate: 25.5, squash: 1 },
    { at: 1, x: 0.05, y: 0.01, rotate: 24, squash: 1.08 },
  ],
  parts: {
    shield: [
      { at: 0, rotate: -4, x: 0.1, scale: 1.14 },
      { at: 0.5, rotate: -5, x: 0.105, y: -0.004, scale: 1.14 },
      { at: 1, rotate: -4, x: 0.1, scale: 1.14 },
    ],
    sword: turn([0, 46], [1, 46]),
    blade: turn([0, -30], [1, -30]),
    head: turn([0, 16], [0.5, 18], [1, 16]),
    cape: turn([0, -44], [0.5, -52], [1, -44]),
    legs: [
      { at: 0, squash: 1.14 },
      { at: 0.5, squash: 0.88 },
      { at: 1, squash: 1.14 },
    ],
  },
};

/** Through: the punch, and upright on the far side of it, roaring. */
const breach: Clip = {
  duration: 640,
  markers: { contact: 0.05 },
  poses: [
    { at: 0, x: 0.05, rotate: 24, squash: 1.08 },
    { at: 0.05, x: 0.2, rotate: 18, squash: 0.8, scale: 1.1, flash: 0.9 },
    { at: 0.3, x: 0.16, rotate: 8, squash: 0.94, scale: 1.06, flash: 0.3 },
    { at: 0.62, x: 0.08, y: -0.02, rotate: -6, squash: 0.96, scale: 1.08 },
    { at: 1, x: 0.06, y: -0.01, rotate: -4, squash: 1, scale: 1.06 },
  ],
  parts: {
    shield: [
      { at: 0, rotate: -4, x: 0.1, scale: 1.14 },
      { at: 0.05, rotate: 6, x: 0.16, scale: 1.2 },
      { at: 0.4, rotate: 14, x: 0.06, y: 0.03, scale: 1.08 },
      { at: 1, rotate: 18, x: 0.04, y: 0.05, scale: 1.04 },
    ],
    // The sword comes up and stays up: the roar.
    sword: turn([0, 46], [0.3, 80], [0.62, 136], [1, 132]),
    blade: turn([0, -30], [0.62, -96], [1, -94]),
    head: turn([0, 16], [0.3, 0], [0.62, -16], [1, -14]),
    cape: turn([0, -44], [0.06, 20], [0.4, 34], [0.7, -10], [1, -18]),
    legs: [
      { at: 0, squash: 1.14 },
      { at: 0.05, squash: 0.84 },
      { at: 0.62, squash: 1.04 },
      { at: 1, squash: 1 },
    ],
  },
};

/** Guard dropped, and not caring: the Breaker's afterward. */
const open: Clip = {
  duration: 700,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0 },
    { at: 0.25, x: 0.04, y: -0.02, rotate: -4, scale: 1.04, flash: 0.35 },
    { at: 1, x: 0, y: 0, rotate: 0, scale: 1, flash: 0 },
  ],
  parts: {
    shield: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.25, rotate: 26, y: 0.05, x: -0.02 },
      { at: 0.8, rotate: 22, y: 0.045 },
      { at: 1, rotate: 0, y: 0, x: 0 },
    ],
    sword: turn([0, 0], [0.25, 110], [0.8, 104], [1, 0]),
    blade: turn([0, 0], [0.25, -80], [0.8, -76], [1, 0]),
    head: turn([0, 0], [0.25, -14], [0.8, -10], [1, 0]),
    cape: turn([0, 0], [0.25, 16], [0.6, -8], [1, 0]),
  },
};

export const ULTIMATE_RIGS: Record<string, Rig> = {
  vanguard: {
    "ult:plant": plant,
    "ult:stand": stand,
    "ult:ready": ready,
    "ult:charge": charge,
    "ult:strike": strike,
    "ult:guard": guard,
    "ult:heat": heat,
    "ult:crouch": crouch,
    "ult:ram": ram,
    "ult:breach": breach,
    "ult:open": open,
  },
};
