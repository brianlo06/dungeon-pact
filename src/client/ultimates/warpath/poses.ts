import type { Clip, Pose, Rig } from "../../battle/animation";

/**
 * Warpath — the poses.
 *
 * The Vanguard's other films stand it still in front of the party, plant its
 * shield, or ride behind it. The Warlord walks first into snow nobody else
 * could cross: the shield goes low and forward as a plough, the sword is
 * carried up and ready, the helm is down into the wind, and the cape streams
 * behind. It has no face, so the close-up acts with the helm (thrown back,
 * then forward into the roar), the crest and cape whipping, and the breath
 * the film draws out of the visor.
 *
 *   the Vanguard `ult:warpath-call`    on the board: the sword thrown forward at the enemy
 *                `ult:warpath-roar`    the close-up: the helm drawn back, then the roar
 *                `ult:warpath-wade`    breaking trail, hip-deep, shield as a plough (loop)
 *                `ult:warpath-step`    the last step: the sword drawn back high, held
 *                `ult:warpath-cleave`  the blow, over the top and down; `contact` is the hit
 *                `ult:warpath-through` on down through the enemy, and held
 *                `ult:warpath-stand`   on the board after: sword forward, shield up
 *   every ally   `ult:warpath-follow`  wading in the Warlord's tracks, in step (loop)
 *                `ult:warpath-halt`    arriving: feet set, weapon up
 *
 * Direction rule, as in every Vanguard clip: it faces right, forward is +x.
 * `sword` turns from the back shoulder (positive raises it back over the helm
 * and on round to the front and down); `blade` turns in the hand; `head`
 * negative lifts the helm, positive drops it onto the enemy; `cape` negative
 * streams it back.
 *
 * Root tracks play in films, so every root key here is authored for the shot
 * it plays in: `wade` and `follow` for a wide (a heavy lean and a bob), the
 * blow for a medium, `call` and `stand` for the battlefield, and `roar` is
 * played with `root: false` in its close-up. Nothing drives `.cine-look`.
 */

type Part = Record<string, Pose[]>;
const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/* ── The Warlord ───────────────────────────────────────────────────────── */

/** The sword carried up and ready over the shoulder as it wades. */
const CARRY = { sword: 44, blade: -26 };
/** Drawn back high for the blow. */
const DRAWN = { sword: 96, blade: -74 };
/** Down on the enemy, level with its head. */
const STRUCK = { sword: 206, blade: -70 };
/** On through, into the snow in front of it. */
const THROUGH = { sword: 246, blade: -92 };
/** Pointing along the trail, at the enemy. */
const POINT = { sword: 158, blade: -78 };

/** On the board: the sword thrown forward at the enemy, the helm up. */
const call: Clip = {
  duration: 520,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.3, x: -0.03, y: 0.01, rotate: -3, squash: 1.06 },
    { at: 0.62, x: 0.05, y: -0.01, rotate: 4, squash: 0.96, scale: 1.03 },
    { at: 1, x: 0.04, y: -0.005, rotate: 3, squash: 0.98, scale: 1.02 },
  ],
  parts: {
    sword: turn([0, 0], [0.3, 60], [0.62, POINT.sword + 6], [1, POINT.sword]),
    blade: turn([0, 0], [0.3, -40], [0.62, POINT.blade], [1, POINT.blade]),
    shield: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.3, x: -0.01, rotate: -4 },
      { at: 0.62, x: -0.03, rotate: 8 },
      { at: 1, x: -0.025, rotate: 6 },
    ],
    head: turn([0, 0], [0.3, 4], [0.62, -9], [1, -7]),
    cape: turn([0, 0], [0.3, 6], [0.62, -22], [0.8, -12], [1, -16]),
    legs: [
      { at: 0, squash: 1 },
      { at: 0.3, squash: 1.07 },
      { at: 0.62, squash: 0.96 },
      { at: 1, squash: 1 },
    ],
  },
};

/**
 * The warcry, in a close-up: the helm drawn back as the breath comes in, the
 * whole body rising under it; then thrown forward and up into the roar, the
 * sword coming up with it, and held there, shaking, while the crest and cape
 * are torn back by the wind. The breath leaves the visor at 0.46.
 */
const roar: Clip = {
  duration: 620,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.36, x: -0.02, y: -0.01, rotate: -4, squash: 0.97, scale: 1.01 },
    { at: 0.46, x: 0.02, y: 0.008, rotate: 3, squash: 1.04, scale: 1.02 },
    { at: 1, x: 0.015, y: 0.004, rotate: 2, squash: 1.02, scale: 1.02 },
  ],
  parts: {
    head: [
      { at: 0, rotate: 2, y: 0 },
      // The breath in: drawn back, chin up.
      { at: 0.36, rotate: -22, y: -0.012, x: -0.008 },
      // The roar: thrown forward and up at the sky past the enemy.
      { at: 0.46, rotate: 10, y: 0.008, x: 0.012 },
      { at: 0.56, rotate: -6, y: -0.004 },
      // Held, and shaking with it.
      { at: 0.66, rotate: -3.5, y: -0.002 },
      { at: 0.76, rotate: -5.5, y: -0.004 },
      { at: 0.86, rotate: -3.8, y: -0.002 },
      { at: 1, rotate: -5, y: -0.003 },
    ],
    sword: turn([0, -6], [0.36, -18], [0.48, -34], [0.7, -30], [1, -32]),
    blade: turn([0, 0], [0.36, 8], [0.48, 14], [1, 12]),
    shield: [
      { at: 0, rotate: 0, x: 0, y: 0 },
      { at: 0.36, rotate: -6, x: -0.01, y: -0.01 },
      { at: 0.48, rotate: 7, x: 0.02, y: 0.01 },
      { at: 0.62, rotate: 4, x: 0.015 },
      { at: 1, rotate: 5, x: 0.015, y: 0.008 },
    ],
    // The cape lags the helm by a beat, then the wind has it.
    cape: turn([0, -14], [0.3, -4], [0.5, -34], [0.62, -22], [0.74, -36], [0.88, -26], [1, -33]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.36, squash: 0.95, y: -0.008 },
      { at: 0.48, squash: 1.05, y: 0.006 },
      { at: 1, squash: 1.03, y: 0.004 },
    ],
  },
};

/**
 * Breaking trail. Hip-deep, the whole figure leans into it; each stride is a
 * heave (down, the shield ploughing forward) and a lift (up out of the hole).
 * Two strides a loop; the allies' `follow` has the same period, so the file
 * walks in step with the one it follows.
 */
const STRIDE = 1000;
const wade: Clip = {
  duration: STRIDE,
  loop: true,
  poses: [
    { at: 0, x: 0.01, y: 0.012, rotate: 9, squash: 1.05 },
    { at: 0.25, x: 0.025, y: -0.018, rotate: 7, squash: 0.97 },
    { at: 0.5, x: 0.01, y: 0.012, rotate: 9, squash: 1.05 },
    { at: 0.75, x: 0.025, y: -0.018, rotate: 7, squash: 0.97 },
    { at: 1, x: 0.01, y: 0.012, rotate: 9, squash: 1.05 },
  ],
  parts: {
    shield: [
      { at: 0, x: 0.06, y: 0.045, rotate: 14, scale: 1.05 },
      { at: 0.25, x: 0.075, y: 0.035, rotate: 8, scale: 1.05 },
      { at: 0.5, x: 0.06, y: 0.045, rotate: 14, scale: 1.05 },
      { at: 0.75, x: 0.075, y: 0.035, rotate: 8, scale: 1.05 },
      { at: 1, x: 0.06, y: 0.045, rotate: 14, scale: 1.05 },
    ],
    sword: turn([0, CARRY.sword], [0.25, CARRY.sword + 6], [0.5, CARRY.sword], [0.75, CARRY.sword + 6], [1, CARRY.sword]),
    blade: turn([0, CARRY.blade], [1, CARRY.blade]),
    head: turn([0, 8], [0.25, 5], [0.5, 8], [0.75, 5], [1, 8]),
    cape: turn([0, -26], [0.25, -36], [0.5, -24], [0.75, -38], [1, -26]),
    legs: [
      { at: 0, squash: 1.1, y: 0.01 },
      { at: 0.25, squash: 0.9, y: -0.01 },
      { at: 0.5, squash: 1.1, y: 0.01 },
      { at: 0.75, squash: 0.9, y: -0.01 },
      { at: 1, squash: 1.1, y: 0.01 },
    ],
    body: [
      { at: 0, squash: 1.04 },
      { at: 0.25, squash: 0.97 },
      { at: 0.5, squash: 1.04 },
      { at: 0.75, squash: 0.97 },
      { at: 1, squash: 1.04 },
    ],
  },
};

/**
 * The last step. Out of the stride, upright, feet set; the sword goes back
 * high and the helm comes down onto the enemy, and nothing moves for the
 * second half but the cape settling. Handed to itself, so it holds.
 */
const step: Clip = {
  duration: 560,
  poses: [
    { at: 0, x: 0.01, y: 0.012, rotate: 9, squash: 1.05 },
    { at: 0.4, x: -0.01, y: 0.006, rotate: -2, squash: 1.04 },
    { at: 1, x: -0.012, y: 0.006, rotate: -2.5, squash: 1.045 },
  ],
  parts: {
    shield: [
      { at: 0, x: 0.06, y: 0.045, rotate: 14, scale: 1.05 },
      { at: 0.4, x: 0.035, y: 0.005, rotate: -4, scale: 1.04 },
      { at: 1, x: 0.035, y: 0.005, rotate: -4, scale: 1.04 },
    ],
    sword: turn([0, CARRY.sword], [0.45, DRAWN.sword], [1, DRAWN.sword + 2]),
    blade: turn([0, CARRY.blade], [0.45, DRAWN.blade], [1, DRAWN.blade]),
    head: turn([0, 8], [0.45, 6], [1, 6]),
    cape: turn([0, -26], [0.3, -14], [0.6, -6], [1, -4]),
    legs: [
      { at: 0, squash: 1.1, y: 0.01 },
      { at: 0.4, squash: 1.08, y: 0.008 },
      { at: 1, squash: 1.08, y: 0.008 },
    ],
  },
};

/**
 * The blow: a short clip, so the animator's blend into it (a fifth of its
 * length) is over before the contact the hit-stop holds. From drawn back, over
 * the top and down onto the enemy; the shield flung back for the swing.
 */
const cleave: Clip = {
  duration: 130,
  markers: { contact: 0.3 },
  poses: [
    { at: 0, x: -0.012, y: 0.006, rotate: -2.5, squash: 1.045 },
    { at: 0.3, x: 0.14, y: 0.01, rotate: 11, squash: 0.88, scale: 1.05 },
    { at: 1, x: 0.15, y: 0.012, rotate: 12, squash: 0.9, scale: 1.05 },
  ],
  parts: {
    sword: turn([0, DRAWN.sword + 2], [0.3, STRUCK.sword], [1, STRUCK.sword + 6]),
    blade: turn([0, DRAWN.blade], [0.3, STRUCK.blade], [1, STRUCK.blade - 2]),
    shield: [
      { at: 0, x: 0.035, y: 0.005, rotate: -4, scale: 1.04 },
      { at: 0.3, x: -0.04, y: 0.02, rotate: -16, scale: 1 },
      { at: 1, x: -0.045, y: 0.02, rotate: -17, scale: 1 },
    ],
    head: turn([0, 6], [0.3, 12], [1, 12]),
    cape: turn([0, -4], [0.3, 18], [1, 22]),
    legs: [
      { at: 0, squash: 1.08 },
      { at: 0.3, squash: 0.86 },
      { at: 1, squash: 0.88 },
    ],
    body: [
      { at: 0, squash: 1 },
      { at: 0.3, squash: 0.94 },
      { at: 1, squash: 0.95 },
    ],
  },
};

/** On down through the enemy into the snow, and held there, breathing. */
const through: Clip = {
  duration: 640,
  poses: [
    { at: 0, x: 0.15, y: 0.012, rotate: 12, squash: 0.9, scale: 1.05 },
    { at: 0.3, x: 0.16, y: 0.02, rotate: 14, squash: 0.92, scale: 1.04 },
    { at: 0.7, x: 0.12, y: 0.008, rotate: 6, squash: 1, scale: 1.02 },
    { at: 1, x: 0.11, y: 0.006, rotate: 5, squash: 1.01, scale: 1.02 },
  ],
  parts: {
    sword: turn([0, STRUCK.sword + 6], [0.3, THROUGH.sword], [1, THROUGH.sword - 4]),
    blade: turn([0, STRUCK.blade - 2], [0.3, THROUGH.blade], [1, THROUGH.blade]),
    shield: [
      { at: 0, x: -0.045, y: 0.02, rotate: -17 },
      { at: 0.4, x: -0.02, y: 0.012, rotate: -8 },
      { at: 1, x: 0.01, y: 0.004, rotate: -2 },
    ],
    head: turn([0, 12], [0.3, 14], [0.7, 4], [1, 2]),
    cape: turn([0, 22], [0.25, 30], [0.55, 4], [0.8, -10], [1, -6]),
    legs: [
      { at: 0, squash: 0.88 },
      { at: 0.4, squash: 1.04 },
      { at: 1, squash: 1.02 },
    ],
    body: [
      { at: 0, squash: 0.95 },
      { at: 0.4, squash: 1.02 },
      { at: 1, squash: 1 },
    ],
  },
};

/** On the board after: the sword pointed along the trail, the shield up. */
const stand: Clip = {
  duration: 760,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, scale: 1 },
    { at: 0.2, x: 0.03, y: -0.012, rotate: 3, squash: 0.96, scale: 1.04 },
    { at: 0.8, x: 0.025, y: -0.008, rotate: 2, squash: 0.98, scale: 1.03 },
    { at: 1, x: 0, y: 0, rotate: 0, squash: 1, scale: 1 },
  ],
  parts: {
    sword: turn([0, 0], [0.2, POINT.sword], [0.8, POINT.sword - 4], [1, 0]),
    blade: turn([0, 0], [0.2, POINT.blade], [0.8, POINT.blade], [1, 0]),
    shield: [
      { at: 0, y: 0, x: 0, rotate: 0, scale: 1 },
      { at: 0.2, y: -0.04, x: 0.02, rotate: -6, scale: 1.08 },
      { at: 0.8, y: -0.035, x: 0.02, rotate: -5, scale: 1.06 },
      { at: 1, y: 0, x: 0, rotate: 0, scale: 1 },
    ],
    head: turn([0, 0], [0.2, -8], [0.8, -6], [1, 0]),
    cape: turn([0, 0], [0.2, -20], [0.5, -8], [0.8, -14], [1, 0]),
  },
};

/* ── Every ally ────────────────────────────────────────────────────────── */

/**
 * What each hero holds up out of the snow as it wades, in its own rig's
 * parts: weapons lifted a little and kept close, cloth thrown back by the
 * wind. `k` = 0 is the rig at rest, 1 the carry.
 */
const CARRIED: Record<string, (k: number) => Part> = {
  vanguard: (k) => ({
    sword: [{ at: 0, rotate: 36 * k }],
    blade: [{ at: 0, rotate: -22 * k }],
    shield: [{ at: 0, rotate: 6 * k, x: 0.04 * k, y: 0.02 * k }],
    cape: [{ at: 0, rotate: -24 * k }],
  }),
  arcanist: (k) => ({
    hand: [{ at: 0, rotate: -24 * k }],
    book: [{ at: 0, rotate: 14 * k }],
    hat: [{ at: 0, rotate: 8 * k }],
  }),
  ranger: (k) => ({
    bow: [{ at: 0, rotate: -12 * k }],
    draw: [{ at: 0, rotate: -10 * k }],
    cloak: [{ at: 0, rotate: -16 * k }],
  }),
  warden: (k) => ({
    hand: [{ at: 0, rotate: -20 * k }],
    staff: [{ at: 0, rotate: 10 * k, x: 0.02 * k }],
    lantern: [{ at: 0, rotate: -12 * k }],
  }),
  broker: (k) => ({
    scales: [{ at: 0, rotate: -12 * k }],
    pans: [{ at: 0, rotate: 14 * k }],
    ledger: [{ at: 0, rotate: -8 * k }],
    purse: [{ at: 0, rotate: -14 * k }],
  }),
  reaver: (k) => ({
    fist: [{ at: 0, rotate: -26 * k }],
    cleaver: [{ at: 0, rotate: 24 * k }],
    hair: [{ at: 0, rotate: -16 * k }],
  }),
  beguiler: (k) => ({
    shard: [{ at: 0, rotate: 30 * k }],
    control: [{ at: 0, rotate: -8 * k }],
    strings: [{ at: 0, rotate: -18 * k }],
  }),
  herald: (k) => ({
    banner: [{ at: 0, rotate: 18 * k }],
    flag: [{ at: 0, rotate: -22 * k }],
    horn: [{ at: 0, rotate: 12 * k }],
  }),
};

/** A track of `CARRIED` keyed through time: `[at, k]`. */
function carried(hero: string, keys: [number, number][]): Part {
  const out: Part = {};
  for (const [at, k] of keys)
    for (const [name, [pose]] of Object.entries(CARRIED[hero](k))) (out[name] ??= []).push({ ...pose, at });
  return out;
}

/** Wading in the Warlord's tracks, in step with it: the same heave and lift. */
function follow(hero: string): Clip {
  return {
    duration: STRIDE,
    loop: true,
    poses: [
      { at: 0, x: 0.008, y: 0.01, rotate: 6, squash: 1.04 },
      { at: 0.25, x: 0.02, y: -0.014, rotate: 4.5, squash: 0.97 },
      { at: 0.5, x: 0.008, y: 0.01, rotate: 6, squash: 1.04 },
      { at: 0.75, x: 0.02, y: -0.014, rotate: 4.5, squash: 0.97 },
      { at: 1, x: 0.008, y: 0.01, rotate: 6, squash: 1.04 },
    ],
    parts: {
      head: turn([0, 6], [0.25, 3], [0.5, 6], [0.75, 3], [1, 6]),
      legs: [
        { at: 0, squash: 1.08, y: 0.008 },
        { at: 0.25, squash: 0.92, y: -0.008 },
        { at: 0.5, squash: 1.08, y: 0.008 },
        { at: 0.75, squash: 0.92, y: -0.008 },
        { at: 1, squash: 1.08, y: 0.008 },
      ],
      body: [
        { at: 0, squash: 1.03 },
        { at: 0.25, squash: 0.98 },
        { at: 0.5, squash: 1.03 },
        { at: 0.75, squash: 0.98 },
        { at: 1, squash: 1.03 },
      ],
      ...carried(hero, [
        [0, 1],
        [0.25, 0.85],
        [0.5, 1],
        [0.75, 0.85],
        [1, 1],
      ]),
    },
  };
}

/** Arrived: out of the stride, feet set beside the Warlord, weapon up and ready. */
function halt(hero: string): Clip {
  return {
    duration: 420,
    poses: [
      { at: 0, x: 0.008, y: 0.01, rotate: 6, squash: 1.04 },
      { at: 0.4, x: 0.02, y: -0.004, rotate: -2, squash: 0.97, scale: 1.02 },
      { at: 1, x: 0.015, y: 0, rotate: -1, squash: 1, scale: 1.01 },
    ],
    parts: {
      head: turn([0, 6], [0.4, -4], [1, -2]),
      legs: [
        { at: 0, squash: 1.08, y: 0.008 },
        { at: 0.4, squash: 1.04 },
        { at: 1, squash: 1.02 },
      ],
      ...carried(hero, [
        [0, 1],
        [0.4, 1.35],
        [1, 1.25],
      ]),
    },
  };
}

const heroes = ["vanguard", "arcanist", "ranger", "warden", "broker", "reaver", "beguiler", "herald"];

export const poses: Record<string, Rig> = Object.fromEntries(
  heroes.map((hero) => [
    hero,
    {
      ...(hero === "vanguard"
        ? {
            "ult:warpath-call": call,
            "ult:warpath-roar": roar,
            "ult:warpath-wade": wade,
            "ult:warpath-step": step,
            "ult:warpath-cleave": cleave,
            "ult:warpath-through": through,
            "ult:warpath-stand": stand,
          }
        : {}),
      "ult:warpath-follow": follow(hero),
      "ult:warpath-halt": halt(hero),
    } as Rig,
  ]),
);
