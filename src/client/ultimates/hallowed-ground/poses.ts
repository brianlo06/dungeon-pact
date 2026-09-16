import type { Clip, Pose, Rig } from "../../battle/animation";
import { face, type Expression } from "../../battle/face";

/**
 * Hallowed Ground — the poses.
 *
 * The Herald's combat rig blows the horn and waves the banner over the party.
 * The Sanctifier does neither. It carries the standard couched forward, low,
 * with its foot dragging on the floor behind it, and at the end of the line
 * it closes the score with one hard low stroke of that foot — a sweep along
 * the stone, not a blow at anything and not a pole planted. The horn stays
 * at the hip: nothing here is blown.
 *
 *   the Herald   `ult:hallow-slope`   on the board: the standard tips forward onto the shoulder, its foot knocks the floor
 *                `ult:hallow-set`     the close-up: the open smile goes, the face sets, a nod
 *                `ult:hallow-walk`    the line: walking, the standard couched, the foot scoring behind
 *                `ult:hallow-coil`    the quiet: coiled over the end of the score, the foot drawn back in the groove
 *                `ult:hallow-stroke`  the stroke: the foot swept forward through the end of the line; `contact`
 *                `ult:hallow-held`    after it: the standard in guard, its foot on the lit line, the chin up
 *                `ult:hallow-hold`    on the board after: the guard let go to rest
 *   every ally   `ult:hallow-stand`   the line: feet set on the cold floor, watching the Sanctifier pass
 *                `ult:hallow-still`   the stroke: nothing moves but cloth and hair
 *
 * Pole geometry, for placing the foot: the banner pivots at the front
 * shoulder (60, 50) and its foot is at (69, 96), 46 units below and 9 in
 * front of the pivot; the floor is at 97. Rotated by a, the foot's height is
 * 50 + 9·sin a + 46·cos a, so the drop that sets it on the floor is 0.116 at
 * 52°, 0.06 at 40°, 0.01 at 0°, 0.09 at −26° and 0.16 at −40°.
 *
 * Root tracks are authored for the shot size each clip plays at: the walk's
 * bob, the coil's crouch and the stroke's lunge move the whole figure in the
 * wide shots; the close-up plays with `root: false`, so the face stays where
 * the camera is.
 */

type Part = Record<string, Pose[]>;
const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/* ── The Herald ────────────────────────────────────────────────────────── */

/**
 * Couched: the standard leaned forward over the shoulder at 52°, the group
 * dropped so its foot rides the floor behind the heels (the pole's foot
 * is 46 drawing units below the hand; at 52° and +0.1 it sits at the ground
 * line, 25 units behind the body's centre).
 */
const COUCHED = 52;
const COUCHED_DROP = 0.1;

/** The face the Herald is drawn with: open, earnest, eyes wide. */
const EARNEST: Expression = { brow: -1, knit: -3, open: 1.15, mouth: 1, wide: 1 };
/** The smile going: the mouth closing on it, the brows coming level, a breath. */
const GOING: Expression = { brow: 0.2, knit: 1, open: 1.0, mouth: 0.5, wide: 0.94 };
/** Set: the smile pressed to a line, the brows down and drawn in, the eyes steady under them. */
const SET: Expression = { brow: 1.3, knit: 6, open: 0.72, mouth: 0.2, wide: 0.9 };
/** The nod: the lids drop with the chin. */
const NOD: Expression = { brow: 1.5, knit: 6, open: 0.5, mouth: 0.18, wide: 0.9 };
/** The stroke: an open call, not a shout. */
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
 * The close-up. The face the Herald is drawn with — the open smile — looks
 * straight out and the smile goes: the mouth closes on it, the chin lifts on
 * a breath, then the brows come down and in and the mouth presses to a line.
 * One short, hard nod on it, the lids dropping with the chin, and the eyes
 * come back up steady. No look away, no eyes shut: it has decided. Played
 * with `root: false`.
 */
const set: Clip = {
  duration: 640,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 1, x: 0, y: 0.004, rotate: 0.5, squash: 1.005 },
  ],
  parts: {
    head: turn([0, 0], [0.14, 0], [0.34, -4], [0.52, -1], [0.7, 8], [0.84, -1.5], [1, 0.5]),
    banner: [
      { at: 0, rotate: COUCHED, y: COUCHED_DROP },
      { at: 1, rotate: COUCHED + 1, y: COUCHED_DROP },
    ],
    flag: turn([0, -14], [0.5, -10], [1, -13]),
    horn: turn([0, 6], [1, 5]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.34, squash: 0.985, y: -0.004 },
      { at: 0.7, squash: 1.015, y: 0.003 },
      { at: 1, squash: 1, y: 0 },
    ],
    ...face([0, EARNEST], [0.14, EARNEST], [0.34, GOING], [0.54, SET], [0.7, NOD], [0.84, SET], [1, SET]),
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
 * The quiet: the standard drawn back and held. The Sanctifier stands coiled
 * over the end of the score, the weight back and low, the standard leaned
 * forward over it so its foot rests behind the heels in the end of the
 * groove (at 40° the foot is 6 drawing units off the floor; the group drops
 * 0.055 to set it there). Still by a third of the way in, and still after.
 * The last key is the stroke's first. Played with `root: false` where the
 * camera is tight.
 */
const COIL = 40;
const COIL_DROP = 0.055;
const coil: Clip = {
  duration: 600,
  poses: [
    { at: 0, x: 0, y: 0.004, rotate: -3, squash: 1.02 },
    { at: 0.32, x: -0.012, y: 0.012, rotate: -5, squash: 1.06 },
    { at: 1, x: -0.014, y: 0.013, rotate: -5.2, squash: 1.065 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: COUCHED, y: COUCHED_DROP, x: 0 },
      { at: 0.32, rotate: COIL, y: COIL_DROP, x: 0 },
      { at: 1, rotate: COIL, y: COIL_DROP, x: 0 },
    ],
    flag: [
      { at: 0, rotate: -14, squash: 0.97 },
      { at: 0.32, rotate: -4, squash: 0.94 },
      { at: 1, rotate: -3, squash: 0.93 },
    ],
    horn: turn([0, 8], [0.32, 16], [1, 16]),
    head: turn([0, 3], [0.32, 7], [1, 7.5]),
    body: [
      { at: 0, squash: 1.01, y: 0 },
      { at: 0.32, squash: 1.04, y: 0.008 },
      { at: 1, squash: 1.042, y: 0.008 },
    ],
    legs: [
      { at: 0, squash: 1.02, rotate: 0 },
      { at: 0.32, squash: 1.1, rotate: -3 },
      { at: 1, squash: 1.1, rotate: -3 },
    ],
    ...face([0, SET], [0.32, SET], [1, SET]),
  },
};

/**
 * The stroke. From the coil, the standard's foot is swept forward through
 * the end of the score in one hard low stroke (+40° to −26° at `contact`, 45ms in,
 * the foot on the floor all the way), the body lunging after it, the flag
 * dragged out flat behind the swinging pole; then the follow-through lifts
 * the foot forward off the stone (−40°). Short, so the hit-stop holds the
 * stroke mid-sweep with the pole low and diagonal, not upright.
 */
const stroke: Clip = {
  duration: 180,
  markers: { contact: 0.25 },
  // Most of the sweep is done by 0.19, so a frame held a little before
  // contact (FAST plays the shot shorter; the stop lands at the same
  // fraction) still has the pole low and forward, never upright.
  poses: [
    { at: 0, x: -0.014, y: 0.013, rotate: -5.2, squash: 1.065, flash: 0 },
    { at: 0.19, x: 0.042, y: 0.026, rotate: 6, squash: 1.1, flash: 0 },
    { at: 0.25, x: 0.05, y: 0.028, rotate: 7, squash: 1.1, flash: 0 },
    { at: 1, x: 0.07, y: 0.03, rotate: 9, squash: 1.08, flash: 0 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: COIL, y: COIL_DROP, x: 0 },
      { at: 0.19, rotate: -20, y: 0.07, x: 0.008 },
      { at: 0.25, rotate: -26, y: 0.09, x: 0.01 },
      { at: 1, rotate: -40, y: 0.14, x: 0.02 },
    ],
    flag: [
      { at: 0, rotate: -3, squash: 0.93 },
      { at: 0.19, rotate: 26, squash: 1.16 },
      { at: 0.25, rotate: 30, squash: 1.18 },
      { at: 1, rotate: 36, squash: 1.2 },
    ],
    horn: turn([0, 16], [0.19, -24], [0.25, -28], [1, -34]),
    head: turn([0, 7.5], [0.25, 4], [1, -6]),
    body: [
      { at: 0, squash: 1.042, y: 0.008 },
      { at: 0.25, squash: 1.06, y: 0.012 },
      { at: 1, squash: 1.05, y: 0.012 },
    ],
    legs: [
      { at: 0, squash: 1.1, rotate: -3 },
      { at: 0.19, squash: 1.14, rotate: 4 },
      { at: 0.25, squash: 1.14, rotate: 5 },
      { at: 1, squash: 1.12, rotate: 6 },
    ],
    ...face([0, SET], [0.25, CALL], [1, CALL]),
  },
};

/**
 * Held after the stroke: the lunge comes back and the standard is brought
 * down out of the follow-through into a guard — slanted forward, its foot
 * resting on the lit line where the stroke ended it (−18°), never stood
 * upright — the flag flying, the chin up, the smile coming back.
 */
const held: Clip = {
  duration: 900,
  poses: [
    { at: 0, x: 0.07, y: 0.03, rotate: 9, squash: 1.08 },
    { at: 0.35, x: 0.045, y: 0.016, rotate: 3, squash: 1.04 },
    { at: 1, x: 0.035, y: 0.01, rotate: 1.5, squash: 1.025 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: -40, y: 0.14, x: 0.02 },
      { at: 0.35, rotate: -16, y: 0.055, x: 0.01 },
      { at: 1, rotate: -18, y: 0.06, x: 0.01 },
    ],
    flag: [
      { at: 0, rotate: 36, squash: 1.2 },
      { at: 0.35, rotate: 4, squash: 0.94 },
      { at: 0.6, rotate: 12, squash: 1.04 },
      { at: 1, rotate: 8, squash: 1.0 },
    ],
    horn: turn([0, -34], [0.4, -12], [1, -6]),
    head: turn([0, -6], [0.4, -9], [1, -6]),
    body: [
      { at: 0, squash: 1.05, y: 0.012 },
      { at: 1, squash: 1.02, y: 0.006 },
    ],
    legs: [
      { at: 0, squash: 1.12, rotate: 6 },
      { at: 0.4, squash: 1.06, rotate: 2 },
      { at: 1, squash: 1.04, rotate: 1.5 },
    ],
    ...face([0, CALL], [0.35, CALL], [0.7, EASE], [1, EASE]),
  },
};

/** On the board after: the guard let go, the standard coming back to rest, the lean coming off. */
const hold: Clip = {
  duration: 760,
  poses: [
    { at: 0, x: 0.006, y: 0.014, rotate: 1.5, squash: 1.04 },
    { at: 0.45, x: 0.002, y: 0.004, rotate: 0.5, squash: 1.01 },
    { at: 1, x: 0, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: -18, y: 0.06, x: 0 },
      { at: 0.5, rotate: -6, y: 0.02 },
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
 * The stroke: nobody moves. The root keys nothing; only cloth and hair
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
            "ult:hallow-coil": coil,
            "ult:hallow-stroke": stroke,
            "ult:hallow-held": held,
            "ult:hallow-hold": hold,
          }
        : {}),
      "ult:hallow-stand": stand(hero),
      "ult:hallow-still": still(hero),
    } as Rig,
  ]),
);
