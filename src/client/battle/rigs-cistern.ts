import type { Rig } from "./animation";

/**
 * The Cistern's creatures.
 *
 * Enemies face the party, to their left, and the animator writes a pose's x
 * straight onto the figure, so a strike travels towards *negative* x and a
 * recoil towards positive. `tests/rig-facing.test.ts` holds every rig here to
 * that.
 *
 * Wave 1 art is blocked in; these rigs carry the performance, and are what the
 * finished drawings will be hung on: the Maw inhales and then blows, the Eel
 * coils and snaps, the Tender works with its hands, the Dredger hauls on a
 * chain, and the Engine hammers in place while its gauge climbs.
 */

/** Something heavy breathing: the shared shape of a cistern idle. */
const breathe = (duration: number, part: string): Rig["idle"] => ({
  duration,
  loop: true,
  interruptible: true,
  poses: [
    { at: 0, y: 0, squash: 1 },
    { at: 0.45, y: -0.01, squash: 1.02 },
    { at: 1, y: 0, squash: 1 },
  ],
  parts: {
    [part]: [
      { at: 0, scale: 1 },
      { at: 0.45, scale: 1.06 },
      { at: 1, scale: 1 },
    ],
  },
});
const hurt: Rig["hurt"] = {
  duration: 360,
  poses: [
    { at: 0, x: 0, rotate: 0 },
    { at: 0.25, x: 0.05, rotate: 5, flash: 0.5 },
    { at: 1, x: 0, rotate: 0, flash: 0 },
  ],
};
const defeat: Rig["defeat"] = {
  duration: 700,
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.4, y: 0.04, rotate: 12, squash: 1.1 },
    { at: 1, y: 0.1, rotate: 34, squash: 1.2, scale: 0.94 },
  ],
};

/** The Maw: it plants, draws a long breath in, and blows. */
const maw: Rig = {
  idle: breathe(4400, "sacs"),
  /** Crushing jet: the sacs load, then the whole body throws forward. */
  attack: {
    duration: 780,
    markers: { contact: 0.46 },
    poses: [
      { at: 0, x: 0, squash: 1 },
      { at: 0.3, x: 0.06, squash: 1.12, y: 0.01 },
      { at: 0.46, x: -0.18, squash: 0.9, scale: 1.06 },
      { at: 0.7, x: -0.1, squash: 0.98 },
      { at: 1, x: 0, squash: 1, scale: 1 },
    ],
    parts: {
      sacs: [
        { at: 0, scale: 1 },
        { at: 0.3, scale: 1.3 },
        { at: 0.5, scale: 0.8 },
        { at: 1, scale: 1 },
      ],
      maw: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.3, rotate: 6, scale: 0.9 },
        { at: 0.46, rotate: -10, scale: 1.25 },
        { at: 1, rotate: 0, scale: 1 },
      ],
    },
  },
  /** Siphon: a long draw that hauls someone in, the mouth held wide. */
  signature: {
    duration: 980,
    markers: { contact: 0.6 },
    poses: [
      { at: 0, x: 0, squash: 1 },
      { at: 0.45, x: 0.04, squash: 1.14, y: 0.014 },
      { at: 0.6, x: -0.12, squash: 0.94, scale: 1.05 },
      { at: 1, x: 0, squash: 1, scale: 1 },
    ],
    parts: {
      maw: [
        { at: 0, scale: 1, rotate: 0 },
        { at: 0.45, scale: 1.35, rotate: -4 },
        { at: 0.62, scale: 1.1, rotate: 4 },
        { at: 1, scale: 1, rotate: 0 },
      ],
      sacs: [
        { at: 0, scale: 1 },
        { at: 0.5, scale: 0.78 },
        { at: 1, scale: 1 },
      ],
    },
  },
  hurt,
  defeat,
};

/** The Eel: coiled around its pipe, it snaps out and back. */
const eel: Rig = {
  idle: {
    duration: 2400,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: -1 },
      { at: 0.5, y: -0.014, rotate: 1.5 },
      { at: 1, y: 0, rotate: -1 },
    ],
    parts: {
      tail: [
        { at: 0, rotate: -3 },
        { at: 0.5, rotate: 4 },
        { at: 1, rotate: -3 },
      ],
      head: [
        { at: 0, rotate: 2 },
        { at: 0.4, rotate: -3 },
        { at: 1, rotate: 2 },
      ],
    },
  },
  /** Soak: a short snap forward, brine thrown from the jaw. */
  attack: {
    duration: 560,
    markers: { contact: 0.4 },
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.22, x: 0.07, rotate: 8, squash: 1.1 },
      { at: 0.4, x: -0.16, rotate: -12, squash: 0.88 },
      { at: 1, x: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      head: [
        { at: 0, rotate: 0 },
        { at: 0.22, rotate: 14 },
        { at: 0.42, rotate: -18 },
        { at: 1, rotate: 0 },
      ],
      fins: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -14 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Conduct: it rears, the charge gathers, and the strike is straight. */
  signature: {
    duration: 820,
    markers: { contact: 0.52 },
    poses: [
      { at: 0, x: 0, rotate: 0, flash: 0 },
      { at: 0.36, x: 0.08, rotate: 10, flash: 0.4 },
      { at: 0.52, x: -0.22, rotate: -14, squash: 0.86, flash: 0.8 },
      { at: 0.7, x: -0.12, flash: 0.2 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      head: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.36, rotate: 16, scale: 1.08 },
        { at: 0.54, rotate: -20, scale: 1.12 },
        { at: 1, rotate: 0, scale: 1 },
      ],
      tail: [
        { at: 0, rotate: 0 },
        { at: 0.36, rotate: -10 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt,
  defeat,
};

/** The Tender: hands first. Plating is a placing gesture, not a blow. */
const tender: Rig = {
  idle: breathe(3400, "arm"),
  attack: {
    duration: 620,
    markers: { contact: 0.44 },
    poses: [
      { at: 0, x: 0 },
      { at: 0.26, x: 0.05, rotate: 5 },
      { at: 0.44, x: -0.14, rotate: -7, squash: 0.94 },
      { at: 1, x: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      arm: [
        { at: 0, rotate: 0 },
        { at: 0.26, rotate: 26 },
        { at: 0.46, rotate: -34 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Plating: it reaches aside and presses the plate on. */
  signature: {
    duration: 900,
    markers: { contact: 0.5 },
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.4, x: -0.04, rotate: -3 },
      { at: 0.55, x: -0.06, rotate: -4, squash: 1.04 },
      { at: 1, x: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      arm: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.4, rotate: 40, y: -0.03 },
        { at: 0.56, rotate: 18, y: 0.01 },
        { at: 1, rotate: 0, y: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.45, rotate: -8 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  block: {
    duration: 700,
    poses: [
      { at: 0, squash: 1 },
      { at: 0.4, squash: 1.06, y: 0.008 },
      { at: 1, squash: 1 },
    ],
  },
  hurt,
  defeat,
};

/** A plate: it does not act. It settles as it sets, and splits when broken. */
const tenderPlate: Rig = {
  idle: {
    duration: 3800,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.5, y: 0.004, squash: 1.01 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      weed: [
        { at: 0, rotate: -2 },
        { at: 0.5, rotate: 3 },
        { at: 1, rotate: -2 },
      ],
    },
  },
  hurt: {
    duration: 320,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.3, x: 0.03, rotate: 4, flash: 0.6 },
      { at: 1, x: 0, rotate: 0, flash: 0 },
    ],
  },
  defeat: {
    duration: 620,
    poses: [
      { at: 0, rotate: 0, squash: 1 },
      { at: 0.35, rotate: -6, squash: 0.9 },
      { at: 1, rotate: -16, squash: 1.2, y: 0.06, scale: 0.9 },
    ],
  },
};

/** The Dredger: everything it does is a haul on its chain. */
const dredger: Rig = {
  idle: breathe(4800, "chain"),
  attack: {
    duration: 860,
    markers: { contact: 0.5 },
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.32, x: 0.07, rotate: 6, squash: 1.08 },
      { at: 0.5, x: -0.2, rotate: -9, squash: 0.9, scale: 1.04 },
      { at: 0.74, x: -0.1, rotate: -4 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1 },
    ],
    parts: {
      chain: [
        { at: 0, rotate: 0 },
        { at: 0.32, rotate: 30 },
        { at: 0.52, rotate: -40 },
        { at: 0.8, rotate: 8 },
        { at: 1, rotate: 0 },
      ],
      arm: [
        { at: 0, rotate: 0 },
        { at: 0.32, rotate: 18 },
        { at: 0.52, rotate: -22 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Hauling its own crew: the pull is across itself, not at the party. */
  signature: {
    duration: 940,
    markers: { contact: 0.5 },
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.35, x: -0.05, rotate: -4, squash: 1.06 },
      { at: 0.55, x: 0.03, rotate: 3, squash: 0.96 },
      { at: 1, x: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      chain: [
        { at: 0, rotate: 0 },
        { at: 0.35, rotate: -26 },
        { at: 0.6, rotate: 34 },
        { at: 1, rotate: 0 },
      ],
      arm: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -20 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt,
  defeat,
};

/** The Engine: it never travels. The piston hammers and the gauge climbs. */
const engine: Rig = {
  idle: {
    duration: 3200,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.25, y: -0.006, squash: 1.02 },
      { at: 0.5, y: 0, squash: 1 },
      { at: 0.75, y: -0.004, squash: 1.01 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      piston: [
        { at: 0, y: 0 },
        { at: 0.25, y: 0.03 },
        { at: 0.5, y: 0 },
        { at: 0.75, y: 0.02 },
        { at: 1, y: 0 },
      ],
      stack: [
        { at: 0, scale: 1 },
        { at: 0.3, scale: 1.05 },
        { at: 1, scale: 1 },
      ],
    },
  },
  /** Build: the piston drives out, and the gauge steps up after it. */
  attack: {
    duration: 820,
    markers: { contact: 0.44 },
    poses: [
      { at: 0, x: 0, squash: 1 },
      { at: 0.26, x: 0.04, squash: 1.06 },
      { at: 0.44, x: -0.1, squash: 0.92, scale: 1.03 },
      { at: 1, x: 0, squash: 1, scale: 1 },
    ],
    parts: {
      piston: [
        { at: 0, x: 0 },
        { at: 0.26, x: 0.06 },
        { at: 0.44, x: -0.3 },
        { at: 1, x: 0 },
      ],
      gauge: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: -14 },
        { at: 0.7, rotate: -20 },
        { at: 1, rotate: -20 },
      ],
    },
  },
  /** Vent: it swells and lets go where it stands. */
  signature: {
    duration: 1000,
    markers: { contact: 0.46 },
    poses: [
      { at: 0, x: 0, squash: 1, scale: 1, flash: 0 },
      { at: 0.34, x: 0.03, squash: 1.16, scale: 1.05, y: -0.01, flash: 0.5 },
      { at: 0.46, x: -0.08, squash: 0.86, scale: 1.1, y: 0.01, flash: 1 },
      { at: 0.7, x: -0.04, squash: 1.04, scale: 1.02, flash: 0.3 },
      { at: 1, x: 0, squash: 1, scale: 1, flash: 0 },
    ],
    parts: {
      stack: [
        { at: 0, scale: 1, y: 0 },
        { at: 0.34, scale: 1.1, y: -0.02 },
        { at: 0.48, scale: 1.4, y: -0.06 },
        { at: 1, scale: 1, y: 0 },
      ],
      gauge: [
        { at: 0, rotate: -20 },
        { at: 0.5, rotate: 0 },
        { at: 1, rotate: 0 },
      ],
      boiler: [
        { at: 0, scale: 1 },
        { at: 0.34, scale: 1.12 },
        { at: 0.5, scale: 0.94 },
        { at: 1, scale: 1 },
      ],
    },
  },
  hurt,
  defeat,
};

export const CISTERN_RIGS: Record<string, Rig> = {
  maw,
  eel,
  tender,
  "tender-plate": tenderPlate,
  dredger,
  engine,
};
