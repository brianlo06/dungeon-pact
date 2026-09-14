import type { Clip, Pose, Rig } from "../../battle/animation";
import { face, type Expression } from "../../battle/face";

/**
 * Hallowed Ground — the poses.
 *
 * The Herald's combat rig blows the horn and waves the banner over the party.
 * The Sanctifier does neither. It carries the standard couched forward, low,
 * with its shod foot dragging on the floor behind it, and at the end of the
 * line it brings the standard up and grounds it — the butt struck on the
 * stone, the flag flying. The horn stays at the hip: nothing here is blown.
 *
 *   the Herald   `ult:hallow-slope`   on the board: the standard tips forward onto the shoulder, its foot knocks the floor
 *                `ult:hallow-set`     the close-up: the open face looks at the floor, then straight out, and sets
 *                `ult:hallow-walk`    the line: walking, the standard couched, the foot scoring behind
 *                `ult:hallow-lift`    the quiet: the standard brought up to the vertical, its foot held over the stone
 *                `ult:hallow-ground`  the grounding: the standard driven down onto the end of the line; `contact`
 *                `ult:hallow-held`    held after it, the flag flying, the chin up
 *                `ult:hallow-hold`    on the board after: the standard grounded upright
 *   every ally   `ult:hallow-stand`   the line: feet set on the cold floor, watching the Sanctifier pass
 *                `ult:hallow-still`   the grounding: nothing moves but cloth and hair
 *
 * Root tracks are authored for the shot size each clip plays at: the walk's
 * bob and the grounding's drop move the whole figure in wide shots; the
 * close-up and the quiet play with `root: false`, so the face and the
 * ferrule stay where the camera is.
 */

type Part = Record<string, Pose[]>;
const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/* ── The Herald ────────────────────────────────────────────────────────── */

/**
 * Couched: the standard leaned forward over the shoulder at 52°, the group
 * dropped so its shod foot rides the floor behind the heels (the pole's foot
 * is 46 drawing units below the hand; at 52° and +0.1 it sits at the ground
 * line, 25 units behind the body's centre).
 */
const COUCHED = 52;
const COUCHED_DROP = 0.1;

/** The face the Herald is drawn with: open, earnest, eyes wide. */
const EARNEST: Expression = { brow: -1, knit: -3, open: 1.15, mouth: 1, wide: 1 };
/** Looking down at the floor by its feet: lids half down, the smile easing. */
const FLOOR: Expression = { brow: -0.4, knit: -1, open: 0.6, mouth: 0.72, wide: 0.92 };
/** Set: the smile pressed to a line, the brows level and down a hair, the eyes steady. */
const SET: Expression = { brow: 0.7, knit: 4, open: 0.86, mouth: 0.42, wide: 0.86 };
/** The grounding: an open call, not a shout. */
const CALL: Expression = { brow: -0.8, knit: 2, open: 1.05, mouth: 1.7, wide: 0.95 };
/** After: the drawn smile coming back. */
const EASE: Expression = { brow: -0.6, knit: -2, open: 0.92, mouth: 1.15, wide: 1.08 };

/** On the board: the standard tips forward onto the shoulder and its foot knocks the floor once. */
const slope: Clip = {
  duration: 400,
  markers: { contact: 0.6 },
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1, scale: 1 },
    { at: 0.45, x: -0.01, y: 0.008, rotate: -2, squash: 1.02 },
    { at: 0.6, x: -0.01, y: 0.014, rotate: -2.5, squash: 1.04 },
    { at: 1, x: -0.01, y: 0.01, rotate: -2, squash: 1.025 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: 0, y: 0, x: 0 },
      { at: 0.25, rotate: 18, y: 0.03, x: 0 },
      { at: 0.5, rotate: COUCHED + 3, y: COUCHED_DROP + 0.01 },
      { at: 0.6, rotate: COUCHED, y: COUCHED_DROP },
      { at: 1, rotate: COUCHED, y: COUCHED_DROP },
    ],
    flag: [
      { at: 0, rotate: 0, squash: 1 },
      { at: 0.3, rotate: -10, squash: 1.06 },
      { at: 0.6, rotate: -18, squash: 0.94 },
      { at: 1, rotate: -14, squash: 0.97 },
    ],
    horn: turn([0, 0], [0.45, 8], [1, 6]),
    head: turn([0, 0], [0.35, 6], [0.6, 8], [1, 7]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.6, squash: 1.03 },
      { at: 1, squash: 1.02 },
    ],
  },
};

/**
 * The close-up. The open face looks down at the floor by its feet (the head
 * bows, the lids come half down), then comes up and looks straight out, and
 * sets: the smile pressed to a line, the brows level, the eyes steady. A
 * short nod at the end. Played with `root: false`.
 */
const set: Clip = {
  duration: 640,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 1, x: 0, y: 0.004, rotate: 0.5, squash: 1.005 },
  ],
  parts: {
    head: turn([0, -1], [0.16, 9], [0.36, 9], [0.52, -2], [0.62, 0], [0.8, -3], [0.9, 3], [1, 0.5]),
    banner: [
      { at: 0, rotate: COUCHED, y: COUCHED_DROP },
      { at: 1, rotate: COUCHED + 1, y: COUCHED_DROP },
    ],
    flag: turn([0, -14], [0.5, -10], [1, -13]),
    horn: turn([0, 6], [1, 5]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.3, squash: 1.015, y: 0.003 },
      { at: 0.6, squash: 0.995, y: -0.002 },
      { at: 1, squash: 1, y: 0 },
    ],
    ...face([0, EARNEST], [0.1, EARNEST], [0.24, FLOOR], [0.4, FLOOR], [0.56, SET], [0.78, SET], [1, SET]),
  },
};

/**
 * The line: walking, the standard couched forward and its foot scoring the
 * floor behind. Two steps a loop; the legs swing as one piece, the body
 * rises on each and the head bobs against it. The actor cue carries the
 * figure across the shot; the root only bobs.
 */
const walk: Clip = {
  duration: 640,
  loop: true,
  poses: [
    { at: 0, x: 0, y: 0.004, rotate: -3, squash: 1.02 },
    { at: 0.25, x: 0, y: -0.014, rotate: -3.5, squash: 0.985 },
    { at: 0.5, x: 0, y: 0.004, rotate: -3, squash: 1.02 },
    { at: 0.75, x: 0, y: -0.014, rotate: -3.5, squash: 0.985 },
    { at: 1, x: 0, y: 0.004, rotate: -3, squash: 1.02 },
  ],
  parts: {
    legs: [
      { at: 0, rotate: 7, squash: 1.04 },
      { at: 0.25, rotate: 0, squash: 0.98 },
      { at: 0.5, rotate: -7, squash: 1.04 },
      { at: 0.75, rotate: 0, squash: 0.98 },
      { at: 1, rotate: 7, squash: 1.04 },
    ],
    body: [
      { at: 0, squash: 1.02, y: 0 },
      { at: 0.25, squash: 0.99, y: -0.004 },
      { at: 0.5, squash: 1.02, y: 0 },
      { at: 0.75, squash: 0.99, y: -0.004 },
      { at: 1, squash: 1.02, y: 0 },
    ],
    head: turn([0, 3], [0.25, 1.5], [0.5, 3], [0.75, 1.5], [1, 3]),
    banner: [
      { at: 0, rotate: COUCHED + 2, y: COUCHED_DROP + 0.004, x: 0 },
      { at: 0.25, rotate: COUCHED - 1, y: COUCHED_DROP - 0.004 },
      { at: 0.5, rotate: COUCHED + 2, y: COUCHED_DROP + 0.004 },
      { at: 0.75, rotate: COUCHED - 1, y: COUCHED_DROP - 0.004 },
      { at: 1, rotate: COUCHED + 2, y: COUCHED_DROP + 0.004 },
    ],
    flag: [
      { at: 0, rotate: -16, squash: 0.95 },
      { at: 0.25, rotate: -8, squash: 1.04 },
      { at: 0.5, rotate: -18, squash: 0.94 },
      { at: 0.75, rotate: -9, squash: 1.03 },
      { at: 1, rotate: -16, squash: 0.95 },
    ],
    horn: turn([0, 10], [0.25, 4], [0.5, 10], [0.75, 4], [1, 10]),
    ...face([0, SET], [1, SET]),
  },
};

/**
 * The quiet: the standard brought up from the couch to the vertical and held
 * with its foot a hand's breadth over the end of the score. The figure is
 * still by a third of the way in and stays still. Played with `root: false`.
 */
const lift: Clip = {
  duration: 560,
  poses: [
    { at: 0, x: 0, y: 0, rotate: -2, squash: 1.01 },
    { at: 1, x: 0, y: 0, rotate: -1, squash: 1.005 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: COUCHED - 12, y: COUCHED_DROP - 0.03, x: 0 },
      { at: 0.3, rotate: 2, y: -0.06, x: 0 },
      { at: 0.4, rotate: 0, y: -0.065, x: 0 },
      { at: 1, rotate: 0, y: -0.062, x: 0 },
    ],
    flag: [
      { at: 0, rotate: -12, squash: 0.96 },
      { at: 0.3, rotate: 6, squash: 1.03 },
      { at: 0.5, rotate: 1, squash: 1 },
      { at: 1, rotate: 0, squash: 1 },
    ],
    horn: turn([0, 6], [0.35, -2], [1, -1]),
    head: turn([0, 4], [0.3, 6], [1, 7]),
    body: [
      { at: 0, squash: 1.01, y: 0 },
      { at: 0.35, squash: 1.0, y: -0.002 },
      { at: 1, squash: 1.005, y: 0 },
    ],
    ...face([0, SET], [0.3, FLOOR], [1, FLOOR]),
  },
};

/**
 * The grounding. Short, so it blends in from the quiet in a few frames and
 * the hit-stop holds the struck pose: the standard driven straight down onto
 * the end of the line (`contact`), the knees taking it, the flag snapping
 * up, the head thrown up on the call and the horn arm flung out for balance.
 */
const ground: Clip = {
  duration: 180,
  markers: { contact: 0.3 },
  poses: [
    { at: 0, x: 0, y: -0.01, rotate: -1, squash: 1, flash: 0 },
    { at: 0.3, x: 0.01, y: 0.02, rotate: 2, squash: 1.08, flash: 0 },
    { at: 1, x: 0.01, y: 0.022, rotate: 2, squash: 1.085, flash: 0 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: 0, y: -0.05, x: 0 },
      { at: 0.3, rotate: 0, y: 0.024, x: 0 },
      { at: 1, rotate: 0, y: 0.026, x: 0 },
    ],
    flag: [
      { at: 0, rotate: 0, squash: 1 },
      { at: 0.3, rotate: -26, squash: 1.14 },
      { at: 1, rotate: -28, squash: 1.12 },
    ],
    horn: turn([0, -2], [0.3, -34], [1, -36]),
    head: turn([0, 5], [0.3, -12], [1, -13]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.3, squash: 1.07, y: 0.018 },
      { at: 1, squash: 1.075, y: 0.02 },
    ],
    legs: [
      { at: 0, rotate: 0, squash: 1 },
      { at: 0.3, rotate: 0, squash: 1.1 },
      { at: 1, rotate: 0, squash: 1.11 },
    ],
    ...face([0, FLOOR], [0.3, CALL], [1, CALL]),
  },
};

/** Held after the grounding: the standard stands, the flag flies, the knees come back, the smile returns. */
const held: Clip = {
  duration: 900,
  poses: [
    { at: 0, x: 0.01, y: 0.022, rotate: 2, squash: 1.085 },
    { at: 0.4, x: 0.008, y: 0.012, rotate: 1, squash: 1.04 },
    { at: 1, x: 0.006, y: 0.006, rotate: 0.5, squash: 1.02 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: 0, y: 0.026, x: 0 },
      { at: 1, rotate: 0, y: 0.024, x: 0 },
    ],
    flag: [
      { at: 0, rotate: -28, squash: 1.12 },
      { at: 0.3, rotate: -14, squash: 0.96 },
      { at: 0.6, rotate: -20, squash: 1.04 },
      { at: 1, rotate: -16, squash: 1.0 },
    ],
    horn: turn([0, -36], [0.5, -16], [1, -8]),
    head: turn([0, -13], [0.5, -9], [1, -6]),
    body: [
      { at: 0, squash: 1.075, y: 0.02 },
      { at: 1, squash: 1.02, y: 0.006 },
    ],
    legs: [
      { at: 0, squash: 1.11 },
      { at: 1, squash: 1.04 },
    ],
    ...face([0, CALL], [0.35, CALL], [0.7, EASE], [1, EASE]),
  },
};

/** On the board after: the standard grounded upright, the horn arm at rest, the lean coming off. */
const hold: Clip = {
  duration: 760,
  poses: [
    { at: 0, x: 0.006, y: 0.014, rotate: 1.5, squash: 1.04 },
    { at: 0.45, x: 0.002, y: 0.004, rotate: 0.5, squash: 1.01 },
    { at: 1, x: 0, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: 0, y: 0.024, x: 0 },
      { at: 0.5, rotate: -1, y: 0.01 },
      { at: 1, rotate: 0, y: 0 },
    ],
    flag: [
      { at: 0, rotate: -16, squash: 1 },
      { at: 0.45, rotate: 8, squash: 0.95 },
      { at: 0.7, rotate: -4, squash: 1.02 },
      { at: 1, rotate: 0, squash: 1 },
    ],
    horn: turn([0, -8], [0.5, -2], [1, 0]),
    head: turn([0, -6], [0.45, -2], [1, 0]),
  },
};

/* ── Every ally ────────────────────────────────────────────────────────── */

/**
 * What blows on each hero when the soot goes off the floor: cloth and hair,
 * in each combat rig's own parts. Nothing else on them moves.
 */
const BLOWN: Record<string, Part> = {
  vanguard: { cape: [{ at: 0, rotate: 22 }] },
  arcanist: { hat: [{ at: 0, rotate: -9, y: -0.012 }] },
  ranger: { cloak: [{ at: 0, rotate: 20 }], quiver: [{ at: 0, rotate: 5 }] },
  warden: { lantern: [{ at: 0, rotate: 16 }] },
  broker: { pans: [{ at: 0, rotate: 12 }], scales: [{ at: 0, rotate: 6 }] },
  reaver: { hair: [{ at: 0, rotate: 18 }] },
  beguiler: { strings: [{ at: 0, rotate: 14 }] },
  herald: { flag: [{ at: 0, rotate: -22, squash: 1.1 }] },
};

/** Heroes whose faces a close-up can move. */
const FACED = new Set(["ranger", "warden", "broker", "reaver", "herald"]);

/** `BLOWN` keyed through time, `[at, k]`, k = 0 as drawn, 1 fully blown. */
function blown(hero: string, keys: [number, number][]): Part {
  const out: Part = {};
  for (const [at, k] of keys)
    for (const [name, [pose]] of Object.entries(BLOWN[hero] ?? {})) {
      const p: Pose = { at };
      for (const key of ["rotate", "x", "y"] as const) if (pose[key] !== undefined) p[key] = (pose[key] as number) * k;
      if (pose.squash !== undefined) p.squash = 1 + (pose.squash - 1) * k;
      (out[name] ??= []).push(p);
    }
  return out;
}

/**
 * The line: feet set on the cold floor — the stance widens and the weight
 * drops a little — and the head follows the Sanctifier passing in front.
 */
function stand(hero: string): Clip {
  return {
    duration: 900,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.3, y: 0.012, rotate: 0.5, squash: 1.03 },
      { at: 1, y: 0.012, rotate: 0.5, squash: 1.03 },
    ],
    parts: {
      head: turn([0, 4], [0.3, 3], [1, -4]),
      legs: [
        { at: 0, squash: 1 },
        { at: 0.3, squash: 1.06 },
        { at: 1, squash: 1.06 },
      ],
      body: [
        { at: 0, squash: 1 },
        { at: 0.3, squash: 1.02 },
        { at: 1, squash: 1.02 },
      ],
      ...(FACED.has(hero) ? face([0, { open: 1 }], [0.3, { brow: -0.5, knit: -1, open: 0.9, mouth: 0.8, wide: 0.95 }], [1, { brow: -0.5, knit: -1, open: 0.9, mouth: 0.8, wide: 0.95 }]) : {}),
    },
  };
}

/**
 * The grounding: nobody moves. The root keys nothing; only cloth and hair
 * blow in the rush off the floor and settle, and the chin comes up a hair.
 * Faces blink once and hold.
 */
function still(hero: string): Clip {
  return {
    duration: 800,
    poses: [
      { at: 0, y: 0.012, rotate: 0.5, squash: 1.03 },
      { at: 1, y: 0.01, rotate: 0.5, squash: 1.025 },
    ],
    parts: {
      head: turn([0, -1], [0.12, -3], [1, -4]),
      legs: [{ at: 0, squash: 1.06 }, { at: 1, squash: 1.05 }],
      ...blown(hero, [
        [0, 0],
        [0.08, 1],
        [0.3, 0.85],
        [0.55, 0.4],
        [1, 0.15],
      ]),
      ...(FACED.has(hero)
        ? face([0, { open: 0.9, mouth: 0.8, wide: 0.95 }], [0.06, { open: 0.15, mouth: 0.8, wide: 0.95 }], [0.16, { brow: -0.6, open: 1.05, mouth: 0.85, wide: 0.95 }], [1, { brow: -0.6, open: 1, mouth: 0.9, wide: 0.98 }])
        : {}),
    },
  };
}

const heroesAll = ["vanguard", "arcanist", "ranger", "warden", "broker", "reaver", "beguiler", "herald"];

export const poses: Record<string, Rig> = Object.fromEntries(
  heroesAll.map((hero) => [
    hero,
    {
      ...(hero === "herald"
        ? {
            "ult:hallow-slope": slope,
            "ult:hallow-set": set,
            "ult:hallow-walk": walk,
            "ult:hallow-lift": lift,
            "ult:hallow-ground": ground,
            "ult:hallow-held": held,
            "ult:hallow-hold": hold,
          }
        : {}),
      "ult:hallow-stand": stand(hero),
      "ult:hallow-still": still(hero),
    } as Rig,
  ]),
);
