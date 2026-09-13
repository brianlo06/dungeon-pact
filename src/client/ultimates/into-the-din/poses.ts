import type { Clip, Pose, Rig } from "../../battle/animation";
import { face, type Expression } from "../../battle/face";

/**
 * Into the Din — the poses.
 *
 * The Herald's combat rig raises the horn and waves the banner. The Warcaller
 * does neither: it walks, and it strikes. The horn arm is only a counterweight
 * now, swinging back; everything it says, it says with the weapon in the front
 * hand (the banner pole, or whatever blade replaces it — both ride `banner`).
 *
 *   the Herald   `ult:din-step`  on the board: the weapon comes to the fore
 *                `ult:din-grin`  the earnest face going to war, then a bark
 *                `ult:din-walk`  walking out into the din, weapon on the shoulder
 *                `ult:din-draw`  the quiet: drawn back high, and held dead still
 *                `ult:din-blow`  the overhead blow; `contact` is the ring
 *                `ult:din-front` far out in front of the party, weapon up
 *                `ult:din-hold`  on the board after: weapon planted, chin up
 *   every ally   `ult:din-wait`  holding back in the noise
 *                `ult:din-surge` hearing the blow: forward, all at once
 *
 * Root tracks are kept sensible, but a film copy's root is not animated today
 * (the rig is attached before its animator exists), so every clip here moves
 * through its parts; the walk's bob, the coil under the weapon, the lean into
 * the blow (`din-body`) and the surge's lurch (`din-courage`) are written on
 * the copy's `.cine-look` by the film's own effects.
 *
 * Nothing here that plays on the battlefield (`din-step`, `din-hold`) drives a
 * face part: the face registers only inside a close-up's copy of the figure.
 */

type Part = Record<string, Pose[]>;
const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/* ── The Herald ────────────────────────────────────────────────────────── */

/** The weapon carried back over the shoulder, as it walks. */
const SHOULDER = -38;
/** Drawn back as far as it goes, the head of it behind the Herald's own head. */
const DRAWN = -30;
/** Brought down onto the enemy: past level, into it. */
const STRUCK = 78;

/** The earnest face the Herald is drawn with. */
const EARNEST: Expression = { brow: -1.1, knit: -3, open: 1.2, mouth: 1, wide: 1 };
/** The same face gone to war: brows down on the eyes, a grin with teeth in it. */
const GRIN: Expression = { brow: 1.8, knit: 10, open: 0.62, mouth: 1.25, wide: 1.3 };
const BARK: Expression = { brow: 2, knit: 12, open: 0.78, mouth: 2.5, wide: 1.12 };
/** Nothing moves in it: eyes locked on, jaw shut. */
const SET: Expression = { brow: 2.1, knit: 12, open: 0.5, mouth: 0.42, wide: 0.86 };
const SHOUT: Expression = { brow: 1.2, knit: 8, open: 0.95, mouth: 2.7, wide: 1.12 };

/** On the board: the weapon comes down to the fore, and the horn goes back. */
const step: Clip = {
  duration: 460,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1, scale: 1 },
    { at: 0.35, x: -0.01, y: 0.01, rotate: 1.5, squash: 1.05 },
    { at: 0.8, x: 0.04, y: -0.01, rotate: 3, squash: 0.97, flash: 0.25 },
    { at: 1, x: 0.04, y: -0.01, rotate: 3, squash: 0.98, flash: 0.1 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.35, rotate: -10, y: -0.02 },
      { at: 0.8, rotate: 24, y: 0.01 },
      { at: 1, rotate: 22, y: 0.01 },
    ],
    flag: turn([0, 0], [0.35, 8], [0.8, -12], [1, -8]),
    horn: turn([0, 0], [0.4, 12], [0.8, 34], [1, 32]),
    head: turn([0, 0], [0.4, -3], [0.8, 5], [1, 5]),
    legs: [
      { at: 0, squash: 1 },
      { at: 0.35, squash: 1.06 },
      { at: 1, squash: 1.02 },
    ],
  },
};

/**
 * The face going to war. It opens as the Herald is drawn — earnest, eyes wide
 * — and the brows come down on the eyes, the smile widens into a grin with
 * teeth in it, and it barks the line; then the grin again, set.
 */
const grin: Clip = {
  duration: 640,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.3, x: 0.01, y: 0.004, rotate: 1.2, squash: 1.01 },
    { at: 1, x: 0.02, y: 0.006, rotate: 2, squash: 1.02 },
  ],
  parts: {
    head: turn([0, -3], [0.28, 3], [0.55, 6], [0.78, 3], [1, 4]),
    banner: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.3, rotate: -6, y: -0.03 },
      { at: 1, rotate: -9, y: -0.04 },
    ],
    flag: turn([0, 0], [0.3, 6], [0.6, -6], [1, 3]),
    horn: turn([0, 0], [0.4, 16], [1, 22]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.55, squash: 1.04 },
      { at: 1, squash: 1.02 },
    ],
    ...face([0, EARNEST], [0.12, EARNEST], [0.34, GRIN], [0.5, BARK], [0.72, BARK], [0.9, GRIN], [1, GRIN]),
  },
};

/**
 * Walking out, not charging: two unhurried steps, the weapon on the shoulder
 * and the horn arm swinging with the stride. The figure's bob is the film's
 * (`din-body`); here the legs take the weight and the body answers it.
 */
const walk: Clip = {
  duration: 900,
  loop: true,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 2, squash: 1 },
    { at: 0.25, x: 0, y: -0.015, rotate: 2.5, squash: 0.98 },
    { at: 0.5, x: 0, y: 0, rotate: 2, squash: 1.01 },
    { at: 0.75, x: 0, y: -0.015, rotate: 2.5, squash: 0.98 },
    { at: 1, x: 0, y: 0, rotate: 2, squash: 1 },
  ],
  parts: {
    legs: [
      { at: 0, squash: 1.05, x: 0 },
      { at: 0.25, squash: 0.97, x: 0.01 },
      { at: 0.5, squash: 1.05, x: 0 },
      { at: 0.75, squash: 0.97, x: 0.01 },
      { at: 1, squash: 1.05, x: 0 },
    ],
    body: [
      { at: 0, y: 0.01, squash: 1.02 },
      { at: 0.25, y: -0.006, squash: 0.99 },
      { at: 0.5, y: 0.01, squash: 1.02 },
      { at: 0.75, y: -0.006, squash: 0.99 },
      { at: 1, y: 0.01, squash: 1.02 },
    ],
    banner: [
      { at: 0, rotate: SHOULDER, y: -0.02 },
      { at: 0.25, rotate: SHOULDER - 3, y: -0.035 },
      { at: 0.5, rotate: SHOULDER, y: -0.02 },
      { at: 0.75, rotate: SHOULDER - 3, y: -0.035 },
      { at: 1, rotate: SHOULDER, y: -0.02 },
    ],
    flag: turn([0, 14], [0.25, 22], [0.5, 12], [0.75, 22], [1, 14]),
    horn: turn([0, 26], [0.25, 8], [0.5, -10], [0.75, 8], [1, 26]),
    head: turn([0, 4], [0.25, 3], [0.5, 4], [0.75, 3], [1, 4]),
  },
};

/**
 * The quiet. Out of the walk the weapon goes up and back as far as it will go
 * and the body coils under it, the horn arm thrown forward for balance — and
 * then nothing moves at all, not the cloth, not the face, for the last half.
 */
const draw: Clip = {
  duration: 620,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 2, squash: 1 },
    { at: 0.4, x: -0.03, y: 0.012, rotate: -3, squash: 1.05 },
    { at: 1, x: -0.03, y: 0.012, rotate: -3, squash: 1.05 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: SHOULDER, y: -0.02, x: 0 },
      { at: 0.4, rotate: DRAWN, y: -0.1, x: 0.02 },
      { at: 1, rotate: DRAWN, y: -0.1, x: 0.02 },
    ],
    flag: turn([0, 14], [0.4, -6], [1, -6]),
    horn: turn([0, 20], [0.4, -48], [1, -48]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.4, squash: 0.95, y: 0.01 },
      { at: 1, squash: 0.95, y: 0.01 },
    ],
    legs: [
      { at: 0, squash: 1 },
      { at: 0.4, squash: 1.08 },
      { at: 1, squash: 1.08 },
    ],
    head: turn([0, 4], [0.4, 9], [1, 9]),
    ...face([0, GRIN], [0.34, SET], [1, SET]),
  },
};

/**
 * The blow, cut into mid-swing. `contact` is the frame the weapon lands and
 * the film goes two-tone: everything is down, the knees give, the horn arm
 * flies back, and the mouth opens on the line a beat after.
 */
const blow: Clip = {
  duration: 900,
  markers: { contact: 0.03 },
  poses: [
    { at: 0, x: 0.04, y: 0.01, rotate: 5, squash: 1.04, scale: 1.02, flash: 0.3 },
    { at: 0.03, x: 0.1, y: 0.03, rotate: 9, squash: 1.12, scale: 1.04, flash: 0.9 },
    { at: 0.2, x: 0.09, y: 0.025, rotate: 7, squash: 1.08, scale: 1.03, flash: 0 },
    { at: 1, x: 0.08, y: 0.02, rotate: 6, squash: 1.06, scale: 1.02 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: 40, y: 0.02, x: 0.03 },
      { at: 0.03, rotate: STRUCK, y: 0.05, x: 0.05 },
      { at: 0.14, rotate: STRUCK - 7, y: 0.04, x: 0.045 },
      { at: 0.3, rotate: STRUCK - 3, y: 0.045, x: 0.05 },
      { at: 1, rotate: STRUCK - 5, y: 0.045, x: 0.05 },
    ],
    flag: turn([0, -30], [0.03, -46], [0.2, 10], [0.45, -14], [0.7, 4], [1, -6]),
    horn: turn([0, 30], [0.03, 52], [0.25, 44], [1, 40]),
    head: turn([0, 8], [0.03, 13], [0.25, 4], [0.45, -4], [1, -3]),
    body: [
      { at: 0, squash: 1.04, y: 0.01 },
      { at: 0.03, squash: 1.1, y: 0.025 },
      { at: 0.3, squash: 1.05, y: 0.015 },
      { at: 1, squash: 1.04, y: 0.012 },
    ],
    legs: [
      { at: 0, squash: 1.06 },
      { at: 0.03, squash: 1.16 },
      { at: 0.3, squash: 1.1 },
      { at: 1, squash: 1.08 },
    ],
    ...face([0, SET], [0.03, { ...SET, open: 0.45 }], [0.22, SHOUT], [0.7, SHOUT], [1, { ...SHOUT, mouth: 2.2 }]),
  },
};

/** Far out in front of the party, in the din: the weapon up, where they can see it. */
const front: Clip = {
  duration: 700,
  poses: [
    { at: 0, x: 0.06, y: 0.02, rotate: 5, squash: 1.05 },
    { at: 0.4, x: 0.03, y: -0.01, rotate: -2, squash: 0.97 },
    { at: 1, x: 0.03, y: -0.01, rotate: -2, squash: 0.98 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: 96, y: 0.04, x: 0.04 },
      { at: 0.35, rotate: -8, y: -0.1, x: 0 },
      { at: 1, rotate: -4, y: -0.09, x: 0 },
    ],
    flag: turn([0, -10], [0.35, 18], [0.6, -12], [0.85, 8], [1, -4]),
    horn: turn([0, 40], [0.4, 18], [1, 20]),
    head: turn([0, -2], [0.4, -8], [1, -7]),
  },
};

/** On the board after it: the weapon planted upright, chin up, the horn at the hip. */
const hold: Clip = {
  duration: 780,
  poses: [
    { at: 0, x: 0.04, y: 0, rotate: 3, squash: 1.03 },
    { at: 0.4, x: 0.01, y: 0.005, rotate: -1, squash: 0.99 },
    { at: 1, x: 0, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: 60, y: 0.02 },
      { at: 0.4, rotate: -4, y: 0.01 },
      { at: 0.6, rotate: 2, y: 0 },
      { at: 1, rotate: 0, y: 0 },
    ],
    flag: turn([0, -20], [0.4, 14], [0.65, -8], [1, 0]),
    horn: turn([0, 34], [0.45, 4], [1, 0]),
    head: turn([0, 6], [0.4, -6], [1, -4]),
  },
};

/* ── Every ally ────────────────────────────────────────────────────────── */

/**
 * What each hero brings forward when it follows the blow (`k` = 1), or holds
 * low while it waits in the noise (`k` < 0), in each combat rig's own sense of
 * its parts. Forward is towards the enemy, to the right.
 */
const FORWARD: Record<string, (k: number) => Part> = {
  vanguard: (k) => ({
    sword: [{ at: 0, rotate: 58 * k }],
    blade: [{ at: 0, rotate: -30 * k }],
    shield: [{ at: 0, rotate: -5 * k, x: 0.035 * k }],
    cape: [{ at: 0, rotate: -12 * k }],
  }),
  arcanist: (k) => ({
    hand: [{ at: 0, rotate: -52 * k, x: 0.02 * k, scale: 1 + 0.1 * Math.max(0, k) }],
    book: [{ at: 0, rotate: -18 * k }],
    hat: [{ at: 0, rotate: -6 * k }],
  }),
  ranger: (k) => ({
    bow: [{ at: 0, rotate: -18 * k, x: 0.02 * k }],
    draw: [{ at: 0, rotate: -34 * k }],
    arrow: [{ at: 0, rotate: 14 * k }],
    cloak: [{ at: 0, rotate: -9 * k }],
  }),
  warden: (k) => ({
    hand: [{ at: 0, rotate: -46 * k, x: 0.03 * k }],
    staff: [{ at: 0, rotate: 12 * k, x: 0.02 * k }],
    lantern: [{ at: 0, rotate: -9 * k }],
  }),
  broker: (k) => ({
    scales: [{ at: 0, rotate: -20 * k, x: 0.03 * k }],
    pans: [{ at: 0, rotate: 20 * k }],
    ledger: [{ at: 0, rotate: -10 * k }],
    purse: [{ at: 0, rotate: -8 * k }],
  }),
  reaver: (k) => ({
    fist: [{ at: 0, rotate: -48 * k, scale: 1 + 0.12 * Math.max(0, k) }],
    cleaver: [{ at: 0, rotate: 36 * k }],
    hair: [{ at: 0, rotate: -9 * k }],
  }),
  beguiler: (k) => ({
    shard: [{ at: 0, rotate: 70 * k, x: 0.02 * k }],
    control: [{ at: 0, rotate: 7 * k }],
    strings: [{ at: 0, rotate: -12 * k }],
  }),
  herald: (k) => ({
    banner: [{ at: 0, rotate: 46 * k }],
    flag: [{ at: 0, rotate: -12 * k }],
    horn: [{ at: 0, rotate: 18 * k }],
  }),
};

/** Heroes whose faces a close-up can move. */
const FACED = new Set(["ranger", "warden", "broker", "reaver", "herald"]);

/** A track of `FORWARD` keyed through time: `[at, k]`. */
function forward(hero: string, keys: [number, number][]): Part {
  const out: Part = {};
  for (const [at, k] of keys)
    for (const [name, [pose]] of Object.entries(FORWARD[hero](k))) (out[name] ??= []).push({ ...pose, at });
  return out;
}

const WAIT = -0.3;

/** Holding back in the noise: weapons low, heads down a little, feet set. */
function wait(hero: string): Clip {
  return {
    duration: 900,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.5, y: 0.006, rotate: -1.2, squash: 1.02 },
      { at: 1, y: 0.004, rotate: -0.8, squash: 1.015 },
    ],
    parts: {
      head: turn([0, 0], [0.4, 5], [0.7, 3], [1, 5]),
      body: [
        { at: 0, squash: 1 },
        { at: 0.5, squash: 1.03 },
        { at: 1, squash: 1.025 },
      ],
      ...forward(hero, [
        [0, 0],
        [0.45, WAIT],
        [1, WAIT * 0.9],
      ]),
      ...(FACED.has(hero)
        ? face(
            [0, {}],
            [0.45, { brow: -0.9, knit: -4, open: 1.1, mouth: 0.8, wide: 0.9 }],
            [1, { brow: -0.9, knit: -4, open: 1.1, mouth: 0.8, wide: 0.9 }],
          )
        : {}),
    },
  };
}

/**
 * The blow heard: from holding back to forward in a fifth of the clip, all
 * weapons towards the enemy, heads up, a shout. The lurch of the whole figure
 * is the film's (`din-courage`), timed to the ring.
 */
function surge(hero: string): Clip {
  return {
    duration: 700,
    poses: [
      { at: 0, y: 0.004, rotate: -0.8, squash: 1.015 },
      { at: 0.2, x: 0.05, y: -0.01, rotate: 5, squash: 0.95, flash: 0.5 },
      { at: 0.45, x: 0.04, y: -0.006, rotate: 4, squash: 0.97, flash: 0 },
      { at: 1, x: 0.04, y: -0.006, rotate: 4, squash: 0.97 },
    ],
    parts: {
      head: turn([0, 5], [0.2, -6], [0.5, -3], [1, -4]),
      body: [
        { at: 0, squash: 1.025 },
        { at: 0.2, squash: 0.95 },
        { at: 1, squash: 0.97 },
      ],
      legs: [
        { at: 0, squash: 1 },
        { at: 0.2, squash: 1.08 },
        { at: 1, squash: 1.05 },
      ],
      ...forward(hero, [
        [0, WAIT * 0.9],
        [0.2, 1.08],
        [0.45, 0.96],
        [1, 1],
      ]),
      ...(FACED.has(hero)
        ? face(
            [0, { brow: -0.9, knit: -4, open: 1.1, mouth: 0.8, wide: 0.9 }],
            [0.2, { brow: 1, knit: 7, open: 1.05, mouth: 2.3, wide: 1.1 }],
            [1, { brow: 1.1, knit: 7, open: 1, mouth: 2, wide: 1.1 }],
          )
        : {}),
    },
  };
}

const allies = ["vanguard", "arcanist", "ranger", "warden", "broker", "reaver", "beguiler", "herald"];

export const poses: Record<string, Rig> = Object.fromEntries(
  allies.map((hero) => [
    hero,
    {
      ...(hero === "herald"
        ? {
            "ult:din-step": step,
            "ult:din-grin": grin,
            "ult:din-walk": walk,
            "ult:din-draw": draw,
            "ult:din-blow": blow,
            "ult:din-front": front,
            "ult:din-hold": hold,
          }
        : {}),
      "ult:din-wait": wait(hero),
      "ult:din-surge": surge(hero),
    } as Rig,
  ]),
);
