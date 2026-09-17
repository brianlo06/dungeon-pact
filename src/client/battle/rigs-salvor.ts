import type { Rig } from "./animation";

/**
 * The Salvor and its soft plates.
 *
 * Enemies face the party, which is to their left, and the root transform is
 * not mirrored for them, so *forward is negative x* and leaning into a blow is
 * a *negative* rotation.
 *
 * The gaff pivots at the near shoulder with the hook up and in front of it: a
 * *positive* rotation swings the hook back over the helmet, a negative one
 * brings it down onto the party. The hump lags every movement of the body by a
 * beat, the way a load on a back does; the lantern swings on its chain.
 */
const salvor: Rig = {
  idle: {
    duration: 5600,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.45, y: 0.006, rotate: -0.8, squash: 1.01 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      shell: [
        { at: 0, rotate: 0 },
        { at: 0.55, rotate: 1.4 },
        { at: 1, rotate: 0 },
      ],
      lantern: [
        { at: 0, rotate: -6 },
        { at: 0.5, rotate: 6 },
        { at: 1, rotate: -6 },
      ],
      hook: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: -2.5 },
        { at: 1, rotate: 0 },
      ],
      helmet: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -3 },
        { at: 0.75, rotate: 1.5 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Growing a plate: it hunches, the hump heaves, and something sets. */
  block: {
    duration: 900,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.45, y: 0.018, squash: 1.08, flash: 0.2 },
      { at: 1, y: 0, squash: 1, flash: 0 },
    ],
    parts: {
      shell: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.45, rotate: 6, y: -0.02 },
        { at: 1, rotate: 0, y: 0 },
      ],
      helmet: [
        { at: 0, rotate: 0 },
        { at: 0.45, rotate: 8 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Gaff hook: the pole swung back over the helmet and brought down. */
  attack: {
    duration: 900,
    markers: { contact: 0.5 },
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.3, x: 0.05, rotate: 4, squash: 1.05 },
      { at: 0.5, x: -0.15, rotate: -6, squash: 0.93, scale: 1.03 },
      { at: 0.72, x: -0.08, rotate: -3 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1 },
    ],
    parts: {
      hook: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 30 },
        { at: 0.5, rotate: -34 },
        { at: 0.75, rotate: -18 },
        { at: 1, rotate: 0 },
      ],
      shell: [
        { at: 0, rotate: 0 },
        { at: 0.55, rotate: -5 },
        { at: 0.8, rotate: 3 },
        { at: 1, rotate: 0 },
      ],
      lantern: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: 16 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Rust volley: the hump shrugs forward and throws its loose plates. */
  signature: {
    duration: 1150,
    markers: { contact: 0.5 },
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.3, x: 0.06, rotate: 6, squash: 1.08, flash: 0.3 },
      { at: 0.5, x: -0.14, rotate: -8, scale: 1.05, squash: 0.9, flash: 0.6 },
      { at: 0.72, x: -0.08, rotate: -4, flash: 0.2 },
      { at: 1, x: 0, rotate: 0, scale: 1, squash: 1, flash: 0 },
    ],
    parts: {
      shell: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 10 },
        { at: 0.52, rotate: -14 },
        { at: 1, rotate: 0 },
      ],
      hook: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: -20 },
        { at: 1, rotate: 0 },
      ],
      lantern: [
        { at: 0, rotate: 0 },
        { at: 0.55, rotate: 22 },
        { at: 0.8, rotate: -10 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt: {
    duration: 320,
    poses: [
      { at: 0, x: 0, flash: 0.85 },
      { at: 0.2, x: 0.03, rotate: 1.4, squash: 0.97, flash: 0.5 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      lantern: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 14 },
        { at: 1, rotate: 0 },
      ],
      shell: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 3 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** The hook goes, then the hump drags it over backwards. */
  defeat: {
    duration: 1400,
    poses: [
      { at: 0, rotate: 0, flash: 1 },
      { at: 0.3, rotate: -4, y: 0.02, flash: 0.6 },
      { at: 1, rotate: 40, y: 0.16, scale: 0.94, flash: 0 },
    ],
    parts: {
      hook: [
        { at: 0, rotate: 0 },
        { at: 0.35, rotate: -40, y: 0.05 },
        { at: 1, rotate: -80, y: 0.16 },
      ],
      shell: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 18 },
      ],
      lantern: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 50 },
      ],
    },
  },
};

/** A soft plate: it settles and drips; torn off, it folds and falls. */
const salvagePlate: Rig = {
  idle: {
    duration: 3800,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.5, y: 0.006, squash: 1.015 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      weed: [
        { at: 0, rotate: -2 },
        { at: 0.5, rotate: 2 },
        { at: 1, rotate: -2 },
      ],
    },
  },
  /** Hardening onto the Salvor: it lifts and goes. */
  attack: {
    duration: 700,
    markers: { contact: 0.5 },
    poses: [
      { at: 0, x: 0, y: 0, scale: 1 },
      { at: 0.5, x: -0.04, y: -0.04, scale: 1.08, flash: 0.5 },
      { at: 1, x: 0, y: 0, scale: 1, flash: 0 },
    ],
  },
  cast: {
    duration: 700,
    poses: [
      { at: 0, y: 0, scale: 1 },
      { at: 0.5, y: -0.04, scale: 1.08, flash: 0.5 },
      { at: 1, y: 0, scale: 1, flash: 0 },
    ],
  },
  hurt: {
    duration: 300,
    poses: [
      { at: 0, x: 0, flash: 0.8 },
      { at: 0.25, x: 0.03, squash: 0.94, flash: 0.4 },
      { at: 1, x: 0, squash: 1, flash: 0 },
    ],
  },
  defeat: {
    duration: 800,
    poses: [
      { at: 0, rotate: 0, flash: 1 },
      { at: 1, rotate: 30, y: 0.12, scale: 0.7, flash: 0 },
    ],
    parts: {
      plate: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: -20 },
      ],
    },
  },
};

export const SALVOR_RIGS: Record<string, Rig> = {
  salvor,
  "salvage-plate": salvagePlate,
};
