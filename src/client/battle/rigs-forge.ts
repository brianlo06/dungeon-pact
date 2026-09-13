import type { Pose, Rig } from "./animation";

/**
 * Rigs for the foundry's rank and file: the Cinder Stoker, the Ash Acolyte,
 * the Living Bellows and the Slag Hound.
 *
 * These are ordinary enemies, so they recoil further than any boss does, and
 * each has its own tempo so a line of them never moves together: the Hound is
 * quick and twitchy, the Bellows slow and heavy, the Stoker a labourer's
 * shrug, the Acolyte a drift.
 *
 * All four are drawn facing the party, which is to their left. Their motion is
 * authored the same way round: a strike travels towards negative x, a recoil
 * towards positive x, and leaning into a blow is a negative rotation.
 */

/**
 * Where the Bellows' snout has to be for a given pleat width. The pleats
 * scale from the end-plate (x = 76) and the collar sits at x = 28, so the
 * snout rides the front fold rather than floating off it.
 */
const snoutFor = (pleatWidth: number) => (pleatWidth - 1) * -0.48;

/** The Stoker: a labourer. It shrugs the hod, jabs with the tongs, and falls back under the load. */
const stoker: Rig = {
  idle: {
    duration: 3100,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.3, y: -0.012, rotate: -0.8, squash: 1.01 },
      { at: 0.55, y: 0, rotate: 0.4, squash: 1 },
      { at: 0.8, y: -0.008, rotate: -0.3 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      // The hod settles a beat after the shoulders do.
      hod: [
        { at: 0, rotate: -0.6, y: -0.002 },
        { at: 0.42, rotate: 1.6, y: 0.006 },
        { at: 0.72, rotate: -1, y: -0.004 },
        { at: 1, rotate: -0.6, y: -0.002 },
      ],
      body: [
        { at: 0, squash: 1 },
        { at: 0.35, squash: 1.025 },
        { at: 1, squash: 1 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.2, rotate: -3 },
        { at: 0.46, rotate: 2 },
        { at: 0.7, rotate: -1.2 },
        { at: 1, rotate: 0 },
      ],
      // It fidgets with the coal on the end of the tongs.
      arm: [
        { at: 0, rotate: 1.4 },
        { at: 0.34, rotate: 3.4 },
        { at: 0.6, rotate: -1.4 },
        { at: 0.84, rotate: 2 },
        { at: 1, rotate: 1.4 },
      ],
      legs: [
        { at: 0, squash: 1.01 },
        { at: 0.3, squash: 1.02 },
        { at: 0.7, squash: 1 },
        { at: 1, squash: 1.01 },
      ],
    },
  },
  /** Branding tongs: rear back with the coal held high, then jab it home. */
  attack: {
    duration: 660,
    poses: [
      { at: 0, x: 0, rotate: 0, squash: 1 },
      { at: 0.3, x: 0.08, rotate: 7, squash: 1.09, y: 0.015 },
      { at: 0.36, x: 0.085, rotate: 7.5 },
      { at: 0.48, x: -0.27, rotate: -10, squash: 0.88, scale: 1.05 },
      { at: 0.62, x: -0.2, rotate: -6, squash: 0.96 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1, y: 0 },
    ],
    parts: {
      arm: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.3, rotate: 44, x: 0.04, y: -0.02 },
        { at: 0.36, rotate: 46, x: 0.04, y: -0.02 },
        { at: 0.48, rotate: -20, x: -0.07, y: 0.01 },
        { at: 0.62, rotate: -14, x: -0.05 },
        { at: 1, rotate: 0, x: 0, y: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 9 },
        { at: 0.48, rotate: -9 },
        { at: 1, rotate: 0 },
      ],
      // The load keeps going after the body has stopped.
      hod: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.34, rotate: -5 },
        { at: 0.54, rotate: 10, x: 0.02 },
        { at: 0.76, rotate: -4, x: 0 },
        { at: 1, rotate: 0 },
      ],
      body: [
        { at: 0, rotate: 0, squash: 1 },
        { at: 0.3, rotate: 4, squash: 1.04 },
        { at: 0.48, rotate: -5, squash: 0.97 },
        { at: 1, rotate: 0, squash: 1 },
      ],
      legs: [
        { at: 0, x: 0, squash: 1 },
        { at: 0.3, x: 0.01, squash: 1.08 },
        { at: 0.5, x: -0.05, squash: 1 },
        { at: 1, x: 0 },
      ],
    },
  },
  hurt: {
    duration: 380,
    poses: [
      { at: 0, x: 0, flash: 0.9 },
      { at: 0.16, x: 0.14, rotate: 9, squash: 0.88, flash: 0.6 },
      { at: 0.44, x: -0.03, rotate: -3, squash: 1.04 },
      { at: 0.72, x: 0.01, rotate: 1 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      head: [
        { at: 0, rotate: 0 },
        { at: 0.18, rotate: 14 },
        { at: 0.5, rotate: -5 },
        { at: 1, rotate: 0 },
      ],
      hod: [
        { at: 0, rotate: 0 },
        { at: 0.22, rotate: -9, y: -0.02 },
        { at: 0.55, rotate: 5, y: 0 },
        { at: 1, rotate: 0 },
      ],
      arm: [
        { at: 0, rotate: 0 },
        { at: 0.2, rotate: 20 },
        { at: 0.56, rotate: -6 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** It goes over backwards under the hod, and the tongs drop. */
  defeat: {
    duration: 900,
    poses: [
      { at: 0, rotate: 0, flash: 1 },
      { at: 0.25, rotate: -6, x: -0.02, y: -0.02, flash: 0.5 },
      { at: 0.6, rotate: 40, x: 0.05, y: 0.06 },
      { at: 1, rotate: 74, x: 0.08, y: 0.16, scale: 0.94, flash: 0 },
    ],
    parts: {
      arm: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: -18 },
        { at: 1, rotate: -46, y: 0.06 },
      ],
      hod: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: 14 },
        { at: 1, rotate: 26, x: 0.03 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: -20 },
      ],
      legs: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: -16 },
      ],
    },
  },
};

/** The Acolyte: it hangs in the air and drifts. Casting is a draw and a throw. */
const acolyte: Rig = {
  idle: {
    duration: 3700,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0 },
      { at: 0.5, y: -0.03, rotate: -1 },
      { at: 1, y: 0, rotate: 0 },
    ],
    parts: {
      // The hem trails the drift, a quarter-beat late.
      hem: [
        { at: 0, rotate: 0, squash: 1 },
        { at: 0.25, rotate: 2.5, squash: 0.98 },
        { at: 0.75, rotate: -2.5, squash: 1.02 },
        { at: 1, rotate: 0, squash: 1 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -4 },
        { at: 0.8, rotate: 2 },
        { at: 1, rotate: 0 },
      ],
      castArm: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.3, rotate: 4, y: -0.01 },
        { at: 0.65, rotate: -2, y: 0.005 },
        { at: 1, rotate: 0, y: 0 },
      ],
      // The censer swings on its own pendulum.
      offArm: [
        { at: 0, rotate: -5 },
        { at: 0.5, rotate: 5 },
        { at: 1, rotate: -5 },
      ],
      cinders: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.5, rotate: 6, y: -0.02 },
        { at: 1, rotate: 0, y: 0 },
      ],
    },
  },
  /** Ember bolt: draw the ember back over the head, then throw it. */
  attack: {
    duration: 720,
    poses: [
      { at: 0, x: 0, y: 0, rotate: 0 },
      { at: 0.34, x: 0.05, y: -0.04, rotate: 5 },
      { at: 0.5, x: -0.12, y: -0.01, rotate: -7, flash: 0.35 },
      { at: 0.66, x: -0.08, rotate: -4, flash: 0.1 },
      { at: 1, x: 0, y: 0, rotate: 0, flash: 0 },
    ],
    parts: {
      castArm: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.34, rotate: 48, x: 0.04 },
        { at: 0.5, rotate: -18, x: -0.05 },
        { at: 0.66, rotate: -12 },
        { at: 1, rotate: 0, x: 0 },
      ],
      // The ember swells as it is drawn, leaves the hand on the throw, and a
      // new one kindles in the palm on the way back.
      ember: [
        { at: 0, x: 0, y: 0, scale: 1 },
        { at: 0.34, scale: 1.3 },
        { at: 0.44, x: 0, y: 0, scale: 1.35 },
        { at: 0.52, x: -0.3, y: 0.03, scale: 0.7 },
        { at: 0.53, x: 0, y: 0, scale: 0 },
        { at: 0.66, scale: 0 },
        { at: 1, scale: 1 },
      ],
      head: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.34, rotate: 6, scale: 1.12 },
        { at: 0.52, rotate: -6, scale: 1 },
        { at: 1, rotate: 0 },
      ],
      hem: [
        { at: 0, rotate: 0 },
        { at: 0.36, rotate: -4 },
        { at: 0.56, rotate: 9 },
        { at: 0.8, rotate: -2 },
        { at: 1, rotate: 0 },
      ],
      offArm: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -12 },
        { at: 0.62, rotate: 14 },
        { at: 1, rotate: 0 },
      ],
      cinders: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.36, rotate: -10, scale: 0.9 },
        { at: 0.56, rotate: 12, scale: 1.1 },
        { at: 1, rotate: 0, scale: 1 },
      ],
    },
  },
  hurt: {
    duration: 360,
    poses: [
      { at: 0, x: 0, flash: 0.9 },
      { at: 0.18, x: 0.15, rotate: 10, squash: 0.9, flash: 0.5 },
      { at: 0.5, x: -0.03, rotate: -3 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      head: [
        { at: 0, rotate: 0 },
        { at: 0.2, rotate: 16 },
        { at: 0.55, rotate: -6 },
        { at: 1, rotate: 0 },
      ],
      hem: [
        { at: 0, rotate: 0 },
        { at: 0.24, rotate: -10 },
        { at: 0.6, rotate: 5 },
        { at: 1, rotate: 0 },
      ],
      castArm: [
        { at: 0, rotate: 0 },
        { at: 0.2, rotate: 22 },
        { at: 1, rotate: 0 },
      ],
      offArm: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: -16 },
        { at: 0.7, rotate: 8 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** The fire goes out and it folds down into its own robe. */
  defeat: {
    duration: 1000,
    poses: [
      { at: 0, y: 0, squash: 1, flash: 1 },
      { at: 0.2, y: -0.04, squash: 0.96, flash: 0.6 },
      { at: 1, y: 0.18, squash: 1.3, scale: 0.84, rotate: 6, flash: 0 },
    ],
    parts: {
      head: [
        { at: 0, rotate: 0, y: 0, scale: 1 },
        { at: 0.3, rotate: -6 },
        { at: 1, rotate: 34, y: 0.1, scale: 0.8 },
      ],
      castArm: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: -48, y: 0.08 },
      ],
      ember: [
        { at: 0, scale: 1 },
        { at: 0.5, scale: 0 },
        { at: 1, scale: 0 },
      ],
      offArm: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 20 },
      ],
      hem: [
        { at: 0, squash: 1 },
        { at: 1, squash: 1.35, y: 0.04 },
      ],
      cinders: [
        { at: 0, y: 0 },
        { at: 1, y: 0.3, rotate: 20 },
      ],
    },
  },
};

/** The Bellows: slow, and everything it does is a breath. */
const bellows: Rig = {
  idle: {
    duration: 5400,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0 },
      { at: 0.45, y: -0.006, rotate: -0.5 },
      { at: 1, y: 0, rotate: 0 },
    ],
    parts: {
      // The pleats fill and empty. The snout rides the front fold.
      pleats: [
        { at: 0, scale: 1, squash: 1 },
        { at: 0.45, scale: 1.05, squash: 0.99 },
        { at: 1, scale: 1, squash: 1 },
      ],
      snout: [
        { at: 0, x: 0, rotate: 0 },
        { at: 0.45, x: snoutFor(1.04), rotate: 2 },
        { at: 1, x: 0, rotate: 0 },
      ],
      // The handles and the end-plate follow the breath late, so the body
      // is never all at rest at once.
      handles: [
        { at: 0, rotate: 1 },
        { at: 0.62, rotate: -3.5 },
        { at: 1, rotate: 1 },
      ],
      plate: [
        { at: 0, rotate: 0.4 },
        { at: 0.6, rotate: -1 },
        { at: 1, rotate: 0.4 },
      ],
      // A slow shift of weight between the near and far legs.
      nearLegs: [
        { at: 0, squash: 1.015 },
        { at: 0.5, squash: 0.99 },
        { at: 1, squash: 1.015 },
      ],
      farLegs: [
        { at: 0, squash: 0.99 },
        { at: 0.5, squash: 1.015 },
        { at: 1, squash: 0.99 },
      ],
    },
  },
  /**
   * Scorching exhale: a long, visible intake — the pleats swell, the handles
   * spread, the snout lifts — then everything empties at once. The breath
   * leaves the horn at `release`, as the plume is thrown out of it.
   */
  attack: {
    duration: 1300,
    markers: { release: 0.6 },
    poses: [
      { at: 0, x: 0, rotate: 0, squash: 1 },
      { at: 0.4, x: 0.04, rotate: 2.5, squash: 1.02 },
      { at: 0.5, x: 0.045, rotate: 3 },
      { at: 0.6, x: -0.08, rotate: -2, squash: 0.97, flash: 0.35 },
      { at: 0.78, x: -0.05, rotate: -1, flash: 0.1 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      pleats: [
        { at: 0, scale: 1, squash: 1 },
        { at: 0.42, scale: 1.1, squash: 1.01 },
        { at: 0.5, scale: 1.11, squash: 1.01 },
        { at: 0.62, scale: 0.86, squash: 0.94 },
        { at: 0.8, scale: 0.9, squash: 0.97 },
        { at: 1, scale: 1, squash: 1 },
      ],
      snout: [
        { at: 0, x: 0, rotate: 0, scale: 1 },
        { at: 0.42, x: snoutFor(1.11), rotate: 8 },
        { at: 0.5, x: snoutFor(1.12), rotate: 9 },
        { at: 0.62, x: snoutFor(0.81), rotate: -3, scale: 1.08 },
        { at: 0.8, x: snoutFor(0.87), rotate: -1, scale: 1.02 },
        { at: 1, x: 0, rotate: 0, scale: 1 },
      ],
      // The fire comes out of the horn in one burst and is gone.
      plume: [
        { at: 0, x: 0, scale: 1 },
        { at: 0.56, x: 0, scale: 1 },
        { at: 0.61, x: -0.19, scale: 2.3 },
        { at: 0.7, x: -0.2, scale: 2.9 },
        { at: 0.8, x: -0.17, scale: 2.2 },
        { at: 0.88, x: -0.05, scale: 1 },
        { at: 0.92, x: 0, scale: 1 },
      ],
      handles: [
        { at: 0, rotate: 0 },
        { at: 0.45, rotate: -12 },
        { at: 0.62, rotate: 10 },
        { at: 0.84, rotate: -3 },
        { at: 1, rotate: 0 },
      ],
      plate: [
        { at: 0, x: 0 },
        { at: 0.45, x: 0.01 },
        { at: 0.62, x: -0.01 },
        { at: 1, x: 0 },
      ],
      nearLegs: [
        { at: 0, x: 0, squash: 1 },
        { at: 0.5, x: 0.01, squash: 1.04 },
        { at: 0.64, x: -0.02, squash: 0.98 },
        { at: 1, x: 0, squash: 1 },
      ],
      farLegs: [
        { at: 0, x: 0, squash: 1 },
        { at: 0.5, x: 0.01, squash: 1.04 },
        { at: 0.66, x: -0.02, squash: 0.98 },
        { at: 1, x: 0, squash: 1 },
      ],
    },
  },
  /** Draw breath: it swells and holds it. */
  block: {
    duration: 760,
    poses: [
      { at: 0, y: 0 },
      { at: 0.3, y: -0.01, flash: 0.3 },
      { at: 1, y: 0, flash: 0 },
    ],
    parts: {
      pleats: [
        { at: 0, scale: 1, squash: 1 },
        { at: 0.3, scale: 1.1, squash: 0.98 },
        { at: 0.7, scale: 1.08, squash: 0.99 },
        { at: 1, scale: 1, squash: 1 },
      ],
      snout: [
        { at: 0, x: 0 },
        { at: 0.3, x: snoutFor(1.08) },
        { at: 0.7, x: snoutFor(1.07) },
        { at: 1, x: 0 },
      ],
      handles: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: -8 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt: {
    duration: 440,
    poses: [
      { at: 0, x: 0, flash: 0.85 },
      { at: 0.2, x: 0.07, rotate: 3, squash: 0.94, flash: 0.5 },
      { at: 0.55, x: -0.02, rotate: -1 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      // A hit knocks the wind out of it: the pleats buckle and puff back.
      pleats: [
        { at: 0, scale: 1, squash: 1 },
        { at: 0.2, scale: 0.94, squash: 0.94 },
        { at: 0.55, scale: 1.03, squash: 1.01 },
        { at: 1, scale: 1, squash: 1 },
      ],
      snout: [
        { at: 0, x: 0, rotate: 0 },
        { at: 0.2, x: snoutFor(0.91), rotate: 10 },
        { at: 0.55, x: snoutFor(1.03), rotate: -4 },
        { at: 1, x: 0, rotate: 0 },
      ],
      handles: [
        { at: 0, rotate: 0 },
        { at: 0.24, rotate: 9 },
        { at: 0.6, rotate: -5 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** The breath goes out of it for good. It empties and settles nose-first. */
  defeat: {
    duration: 1500,
    poses: [
      { at: 0, y: 0, rotate: 0, flash: 1 },
      { at: 0.2, y: -0.01, rotate: 1, flash: 0.5 },
      { at: 1, y: 0.1, rotate: -5, flash: 0 },
    ],
    parts: {
      pleats: [
        { at: 0, scale: 1, squash: 1 },
        { at: 0.2, scale: 1.04, squash: 1 },
        { at: 1, scale: 0.8, squash: 0.86 },
      ],
      snout: [
        { at: 0, x: 0, rotate: 0 },
        { at: 0.2, x: snoutFor(1.04), rotate: 4 },
        { at: 1, x: snoutFor(0.69), rotate: -22, y: 0.04 },
      ],
      handles: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 34 },
      ],
      nearLegs: [
        { at: 0, squash: 1, y: 0 },
        { at: 1, squash: 1.3, y: 0.04 },
      ],
      farLegs: [
        { at: 0, squash: 1, y: 0 },
        { at: 1, squash: 1.3, y: 0.04 },
      ],
    },
  },
};

/** A part track that only rotates, for the Hound's travel clips. */
const turn = (...keys: [number, number][]): Pose[] =>
  keys.map(([at, rotate]) => ({ at, rotate }));

/** The Hound: never still. Quick, twitchy, and it commits its whole body to a bite. */
const hound: Rig = {
  idle: {
    duration: 2200,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.25, y: -0.008, squash: 1.01 },
      { at: 0.5, y: 0, rotate: -0.8 },
      { at: 0.75, y: -0.01, squash: 1.01 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      // Short sharp moves, not drifts: a twitch, a hold, a snap back.
      head: [
        { at: 0, rotate: 0 },
        { at: 0.1, rotate: -5 },
        { at: 0.16, rotate: -5 },
        { at: 0.2, rotate: 1 },
        { at: 0.52, rotate: 1 },
        { at: 0.56, rotate: 4 },
        { at: 0.64, rotate: 3.5 },
        { at: 0.68, rotate: 0 },
        { at: 1, rotate: 0 },
      ],
      // Panting.
      jaw: [
        { at: 0, rotate: 0 },
        { at: 0.12, rotate: -9 },
        { at: 0.25, rotate: 0 },
        { at: 0.37, rotate: -9 },
        { at: 0.5, rotate: 0 },
        { at: 0.62, rotate: -9 },
        { at: 0.75, rotate: 0 },
        { at: 0.87, rotate: -9 },
        { at: 1, rotate: 0 },
      ],
      body: [
        { at: 0, squash: 1 },
        { at: 0.12, squash: 1.02 },
        { at: 0.25, squash: 1 },
        { at: 0.37, squash: 1.02 },
        { at: 0.5, squash: 1 },
        { at: 0.62, squash: 1.02 },
        { at: 0.75, squash: 1 },
        { at: 0.87, squash: 1.02 },
        { at: 1, squash: 1 },
      ],
      tail: [
        { at: 0, rotate: 2 },
        { at: 0.3, rotate: 0 },
        { at: 0.36, rotate: -14 },
        { at: 0.42, rotate: 6 },
        { at: 0.5, rotate: -4 },
        { at: 0.6, rotate: 0 },
        { at: 0.84, rotate: 4 },
        { at: 1, rotate: 2 },
      ],
      mane: [
        { at: 0, scale: 1 },
        { at: 0.54, scale: 1 },
        { at: 0.58, scale: 1.06 },
        { at: 0.7, scale: 1 },
        { at: 1, scale: 1 },
      ],
      // Weight rocks onto the haunches and back, never quite settling.
      hindLegs: [
        { at: 0, squash: 1.01 },
        { at: 0.4, squash: 1.03 },
        { at: 0.8, squash: 0.99 },
        { at: 1, squash: 1.01 },
      ],
      foreLegs: [
        { at: 0, rotate: -1 },
        { at: 0.45, rotate: 1.5 },
        { at: 1, rotate: -1 },
      ],
    },
  },
  /**
   * The crouch before the sprint: it drops onto its haunches, head low, the
   * mane up, and holds there coiled. Heroes are to its left, so back is +x.
   */
  anticipate: {
    duration: 240,
    poses: [
      { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
      { at: 1, x: 0.06, y: 0.045, rotate: -3, squash: 1.14 },
    ],
    parts: {
      head: turn([0, 0], [1, -8]),
      jaw: turn([0, 0], [1, -6]),
      hindLegs: [
        { at: 0, squash: 1, rotate: 0 },
        { at: 1, squash: 1.14, rotate: 6 },
      ],
      foreLegs: turn([0, 0], [1, 10]),
      tail: turn([0, 0], [1, -14]),
      mane: [
        { at: 0, scale: 1 },
        { at: 1, scale: 1.12 },
      ],
    },
  },
  /**
   * The sprint: long, low and flat, legs reaching and gathering, jaw open,
   * tail streaming. Far quicker than anything else's stride.
   */
  approach: {
    duration: 230,
    loop: true,
    poses: [
      { at: 0, y: 0.035, rotate: -2, squash: 1.14 },
      { at: 0.25, y: 0.012, rotate: 1, squash: 1.2 },
      { at: 0.5, y: 0.035, rotate: -2, squash: 1.1 },
      { at: 0.75, y: 0.012, rotate: 1, squash: 1.2 },
      { at: 1, y: 0.035, rotate: -2, squash: 1.14 },
    ],
    parts: {
      head: turn([0, -5], [0.5, -3], [1, -5]),
      jaw: turn([0, -10], [0.5, -14], [1, -10]),
      foreLegs: turn([0, 26], [0.5, -22], [1, 26]),
      hindLegs: [
        { at: 0, rotate: -22, squash: 1 },
        { at: 0.5, rotate: 20, squash: 1.06 },
        { at: 1, rotate: -22, squash: 1 },
      ],
      tail: turn([0, 16], [0.5, 10], [1, 16]),
      mane: [
        { at: 0, rotate: 6, scale: 1.06 },
        { at: 0.5, rotate: 3, scale: 1.04 },
        { at: 1, rotate: 6, scale: 1.06 },
      ],
    },
  },
  /** Searing bite: coil, spring, snap, shake, hop back. */
  attack: {
    duration: 600,
    poses: [
      { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
      // Squash here is width: it coils low, flies long and flat, and
      // compresses into the bite.
      { at: 0.26, x: 0.07, y: 0.02, rotate: -2, squash: 1.07 },
      { at: 0.42, x: -0.36, y: -0.05, rotate: 3, squash: 1.14, scale: 1.04 },
      { at: 0.5, x: -0.34, y: 0, rotate: -3, squash: 0.93 },
      { at: 0.58, x: -0.33, rotate: 3 },
      { at: 0.66, x: -0.3, rotate: -1 },
      { at: 0.82, x: -0.06, y: -0.02, rotate: 0 },
      { at: 1, x: 0, y: 0, rotate: 0, squash: 1, scale: 1 },
    ],
    parts: {
      head: [
        { at: 0, rotate: 0 },
        { at: 0.26, rotate: -7 },
        { at: 0.42, rotate: 6 },
        { at: 0.5, rotate: -8 },
        { at: 0.58, rotate: 7 },
        { at: 0.66, rotate: -4 },
        { at: 1, rotate: 0 },
      ],
      jaw: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: -8 },
        { at: 0.36, rotate: -36 },
        { at: 0.44, rotate: -38 },
        { at: 0.49, rotate: 0 },
        { at: 0.7, rotate: 0 },
        { at: 0.82, rotate: -10 },
        { at: 1, rotate: 0 },
      ],
      foreLegs: [
        { at: 0, rotate: 0 },
        { at: 0.26, rotate: -8 },
        { at: 0.42, rotate: 26 },
        { at: 0.52, rotate: 6 },
        { at: 1, rotate: 0 },
      ],
      hindLegs: [
        { at: 0, rotate: 0, squash: 1 },
        { at: 0.26, rotate: 6, squash: 1.1 },
        { at: 0.42, rotate: -24, squash: 0.94 },
        { at: 0.6, rotate: -6, squash: 1 },
        { at: 1, rotate: 0 },
      ],
      tail: [
        { at: 0, rotate: 0 },
        { at: 0.26, rotate: -10 },
        { at: 0.44, rotate: 24 },
        { at: 0.62, rotate: -8 },
        { at: 1, rotate: 0 },
      ],
      mane: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.26, rotate: -4, scale: 1.08 },
        { at: 0.44, rotate: 8, scale: 1 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt: {
    duration: 340,
    poses: [
      { at: 0, x: 0, flash: 0.9 },
      { at: 0.16, x: 0.17, rotate: 8, squash: 0.86, flash: 0.6 },
      { at: 0.46, x: -0.03, rotate: -3, squash: 1.04 },
      { at: 0.72, x: 0.01, rotate: 1 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      // A yelp: head thrown up, jaw open, tail clamped down.
      head: [
        { at: 0, rotate: 0 },
        { at: 0.16, rotate: 18 },
        { at: 0.5, rotate: -5 },
        { at: 1, rotate: 0 },
      ],
      jaw: [
        { at: 0, rotate: 0 },
        { at: 0.16, rotate: -18 },
        { at: 0.6, rotate: -4 },
        { at: 1, rotate: 0 },
      ],
      tail: [
        { at: 0, rotate: 0 },
        { at: 0.2, rotate: 46 },
        { at: 0.7, rotate: 12 },
        { at: 1, rotate: 0 },
      ],
      foreLegs: [
        { at: 0, rotate: 0 },
        { at: 0.2, rotate: -14 },
        { at: 1, rotate: 0 },
      ],
      mane: [
        { at: 0, scale: 1 },
        { at: 0.16, scale: 1.1 },
        { at: 1, scale: 1 },
      ],
    },
  },
  /** The legs go from under it, front first, and the heat goes out of it. */
  defeat: {
    duration: 850,
    poses: [
      { at: 0, y: 0, rotate: 0, flash: 1 },
      { at: 0.2, y: -0.03, rotate: 6, x: 0.04, flash: 0.5 },
      { at: 0.55, y: 0.06, rotate: -6 },
      { at: 1, y: 0.12, rotate: 4, squash: 1.1, flash: 0 },
    ],
    parts: {
      foreLegs: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: -34, y: 0.04 },
        { at: 1, rotate: -60, y: 0.08 },
      ],
      hindLegs: [
        { at: 0, rotate: 0 },
        { at: 0.6, rotate: 18 },
        { at: 1, rotate: 40, y: 0.06 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.2, rotate: 14 },
        { at: 1, rotate: -22, y: 0.06 },
      ],
      jaw: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: -12 },
      ],
      tail: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 70 },
      ],
      mane: [
        { at: 0, scale: 1 },
        { at: 1, scale: 0.9, y: 0.02 },
      ],
    },
  },
};

export const FORGE_RIGS: Record<string, Rig> = {
  stoker,
  acolyte,
  bellows,
  hound,
};
