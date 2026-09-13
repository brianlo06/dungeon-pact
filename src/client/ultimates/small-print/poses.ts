import type { Clip, Pose, Rig } from "../../battle/animation";
import { face, type Expression } from "../../battle/face";

/**
 * The Small Print — the Assurer's poses, and the party's.
 *
 * The Broker's manner is a clerk's here, not an appraiser's: the balance is
 * let down out of the way and everything is done with the ledger hand, which
 * holds the policy. Parts (`components/heroes/Broker.tsx`): `ledger` is the
 * back arm and whatever it holds, pivoting on the back shoulder (37,50); a
 * negative turn brings the hand forward — about −60 to the chest, −100 in
 * front of it at chest height, −120 straight out, −150 out and up — and a
 * positive one swings it back and over the cap (the base film's blow, which
 * this film never uses). `scales` is the front arm with the balance; a
 * positive turn lets it down, and `pans` counter-turned keeps the beam level.
 *
 * The face. The brows sit under the cap's brim, so the Broker's brows act by
 * coming down onto the rims and knitting (a lift of more than a unit goes under
 * the brim); the eyes are two dots behind the lenses, lids half down, so
 * reading is the eyes moving along a line (`x`), and suspicion is the lids.
 *
 * Every pose name is prefixed `ult:print-`, so nothing here collides with
 * Foreclosure's or the Anthem's Broker clips.
 */

const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/* ── Faces, tuned to the Broker's drawing ─────────────────────────────── */

/** A salesman's welcome: brows knit kindly, eyes crinkled, a pleased purse. */
const WELCOME: Expression = { brow: 0.5, knit: -5, open: 0.62, mouth: 1.35, wide: 1.25 };
const PERSUADE: Expression = { brow: 0.2, knit: -7, open: 0.85, mouth: 1.7, wide: 1.1 };
/** Reading: lids down to the page. */
const READING: Expression = { brow: 0.9, knit: 3, open: 0.5, mouth: 0.8, wide: 0.95 };
/** The clause: brows right down on the rims and knitted, eyes to slits, lips pressed. */
const CLAUSE: Expression = { brow: 2.4, knit: 10, open: 0.3, mouth: 0.45, wide: 1.15 };
/** And it is fine: the brow stays down, one corner of the mouth settles up. */
const FINE: Expression = { brow: 1.9, knit: 6, open: 0.42, mouth: 1.25, wide: 1.4 };
const CRY: Expression = { brow: 1.6, knit: 9, open: 1.15, mouth: 2.5, wide: 1.2 };
const PLEASED: Expression = { brow: 0.6, knit: -3, open: 0.55, mouth: 1.5, wide: 1.3 };

/** The balance let down beside the leg, level: nothing to weigh here. */
const BALANCE_DOWN = { scales: turn([0, 60]), pans: turn([0, -60]) };

/**
 * On the board: the ledger hand goes into the coat and comes out with the
 * policy, held up in front. Starts from rest, as the real unit is at rest.
 */
const produce: Clip = {
  duration: 420,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.35, x: -0.01, y: 0.008, rotate: 3, squash: 1.04 },
    { at: 0.7, x: 0.008, y: -0.006, rotate: -1.5, squash: 0.98 },
    { at: 1, x: 0.006, y: 0, rotate: -1, squash: 1 },
  ],
  parts: {
    ledger: turn([0, 0], [0.35, -58], [0.55, -50], [0.8, -104], [1, -98]),
    scales: turn([0, 0], [0.4, 14], [1, 18]),
    pans: turn([0, 0], [0.4, -10], [0.7, -24], [1, -17]),
    head: turn([0, 0], [0.35, 8], [0.8, -2], [1, 0]),
    purse: turn([0, 0], [0.35, -7], [0.6, 6], [0.85, -3], [1, 0]),
  },
};

/**
 * The riffle. The policy held up at the lens in the ledger hand; the thumb
 * runs down its folds, which the hand feels as a tremble; the head tips down
 * over it to look into the lens, and the face sells it.
 */
const riffle: Clip = {
  duration: 640,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 1, squash: 1 },
    { at: 0.5, x: 0.006, y: 0.004, rotate: 3, squash: 1.015 },
    { at: 1, x: 0.01, y: 0.006, rotate: 3.6, squash: 1.02 },
  ],
  parts: {
    ledger: [
      { at: 0, rotate: -98, y: 0 },
      { at: 0.12, rotate: -101, y: -0.004 },
      { at: 0.24, rotate: -97, y: 0.002 },
      { at: 0.36, rotate: -102, y: -0.004 },
      { at: 0.48, rotate: -98, y: 0.002 },
      { at: 0.6, rotate: -103, y: -0.004 },
      { at: 0.72, rotate: -99, y: 0 },
      { at: 1, rotate: -100, y: 0 },
    ],
    ...BALANCE_DOWN,
    head: turn([0, 2], [0.3, 9], [0.7, 11], [1, 10]),
    ...face([0, WELCOME], [0.35, PERSUADE], [0.62, WELCOME], [1, { ...WELCOME, mouth: 1.5 }]),
    purse: turn([0, 0], [0.3, 3], [0.6, -2], [1, 0]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.5, squash: 1.02, y: 0.003 },
      { at: 1, squash: 1.01, y: 0.002 },
    ],
  },
};

/**
 * The policy let go. The hand throws the strip out low in front, and the body
 * leans after it; then the Broker stands back to watch it run along the party,
 * very pleased.
 */
const cast: Clip = {
  duration: 1000,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.1, x: -0.012, y: 0.006, rotate: -3, squash: 1.04 },
    { at: 0.22, x: 0.03, y: 0.004, rotate: 5, squash: 0.97 },
    { at: 0.4, x: 0.02, y: 0, rotate: 2, squash: 1 },
    { at: 1, x: 0.018, y: 0, rotate: 1, squash: 1 },
  ],
  parts: {
    ledger: turn([0, -98], [0.1, -70], [0.22, -128], [0.34, -116], [0.6, -110], [1, -108]),
    scales: turn([0, 22], [0.22, 12], [1, 16]),
    pans: turn([0, -22], [0.26, -2], [0.4, -20], [0.55, -12], [1, -16]),
    head: turn([0, 4], [0.22, -3], [0.5, 2], [1, 3]),
    ...face([0, WELCOME], [0.22, PERSUADE], [1, PLEASED]),
    purse: turn([0, 0], [0.22, -9], [0.4, 7], [0.6, -3], [1, 0]),
  },
};

/**
 * The small print. Nothing moves but the face. The eyes run along a line of
 * print, snap back, run along the next; the lids come down; the brows come
 * down onto the rims and knit at the clause; the lips press; and the mouth
 * decides it is fine. All of it inside FAST's 400ms, held in FULL.
 */
const EYE_LINE = 0.011;
/** A face whose eyes also move along a line: `x` in hundredths of the drawing. */
function reading(...keys: [number, Expression, number][]) {
  const f = face(...keys.map(([at, e]) => [at, e] as [number, Expression]));
  return { ...f, eyes: f.eyes.map((pose, i) => ({ ...pose, x: keys[i][2] })) };
}
const read: Clip = {
  duration: 420,
  poses: [{ at: 0, x: 0, y: 0, rotate: 0, squash: 1 }],
  parts: {
    head: turn([0, 3], [1, 4]),
    ...reading(
      [0, READING, -EYE_LINE],
      [0.2, READING, EYE_LINE],
      [0.25, READING, -EYE_LINE],
      [0.5, CLAUSE, EYE_LINE * 0.6],
      [0.72, CLAUSE, EYE_LINE * 0.3],
      [0.9, FINE, 0.002],
      [1, FINE, 0.002],
    ),
    ...BALANCE_DOWN,
    ledger: turn([0, -100]),
  },
};

/**
 * The snap. From a crouch over the strip, up onto the toes and the ledger arm
 * cracked out and up, the whole round body going after it; a shout. Seen from
 * the moment of the crack, so `contact` is a few frames in.
 */
const snap: Clip = {
  duration: 760,
  markers: { contact: 0.05 },
  poses: [
    { at: 0, x: -0.02, y: 0.02, rotate: -4, squash: 1.1, scale: 1 },
    { at: 0.05, x: 0.03, y: -0.05, rotate: 6, squash: 0.86, scale: 1.05 },
    { at: 0.2, x: 0.03, y: -0.035, rotate: 5, squash: 0.93, scale: 1.03 },
    { at: 0.5, x: 0.025, y: -0.012, rotate: 3.5, squash: 0.99, scale: 1.01 },
    { at: 1, x: 0.02, y: -0.006, rotate: 3, squash: 1, scale: 1 },
  ],
  parts: {
    ledger: [
      { at: 0, rotate: -30, x: -0.02 },
      { at: 0.05, rotate: -104, x: 0.09, y: 0.01 },
      { at: 0.2, rotate: -100, x: 0.08, y: 0.008 },
      { at: 0.5, rotate: -96, x: 0.07, y: 0.006 },
      { at: 1, rotate: -94, x: 0.065, y: 0.006 },
    ],
    scales: turn([0, 26], [0.05, -18], [0.25, -8], [0.5, -12], [1, -10]),
    pans: turn([0, -20], [0.06, 30], [0.2, -8], [0.36, 14], [0.55, 2], [0.75, 8], [1, 6]),
    head: turn([0, 8], [0.05, -10], [0.3, -7], [1, -6]),
    ...face([0, FINE], [0.04, CRY], [0.5, CRY], [1, { ...CRY, mouth: 2.1, open: 1 }]),
    purse: [
      { at: 0, rotate: 8, y: 0.01 },
      { at: 0.06, rotate: -22, y: -0.02 },
      { at: 0.25, rotate: 12, y: 0 },
      { at: 0.45, rotate: -6 },
      { at: 1, rotate: 0 },
    ],
    legs: [
      { at: 0, squash: 1.1 },
      { at: 0.05, squash: 0.9 },
      { at: 0.3, squash: 0.97 },
      { at: 1, squash: 1 },
    ],
    body: [
      { at: 0, squash: 1.04, y: 0.006 },
      { at: 0.05, squash: 0.95, y: -0.006 },
      { at: 0.4, squash: 1, y: 0 },
      { at: 1, squash: 1, y: 0 },
    ],
  },
};

/**
 * On the board after: the policy patted away inside the coat, a straightening
 * of the waistcoat, a small satisfied rise onto the toes. From rest.
 */
const settle: Clip = {
  duration: 820,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.25, y: 0.006, rotate: 2, squash: 1.03 },
    { at: 0.5, y: -0.014, rotate: -1, squash: 0.96 },
    { at: 0.7, y: 0.004, rotate: 0.5, squash: 1.02 },
    { at: 1, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    ledger: turn([0, 0], [0.25, -62], [0.45, -56], [0.6, -60], [1, 0]),
    scales: turn([0, 0], [0.5, -6], [1, 0]),
    pans: turn([0, 0], [0.5, 8], [0.7, -4], [1, 0]),
    head: turn([0, 0], [0.3, 6], [0.55, -5], [1, 0]),
    purse: turn([0, 0], [0.5, 8], [0.65, -6], [0.8, 3], [1, 0]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.5, squash: 0.97, y: -0.004 },
      { at: 1, squash: 1, y: 0 },
    ],
  },
};

/* ── The party ────────────────────────────────────────────────────────── */

/** Heroes whose faces a close-up copy can move. */
const FACED = new Set(["ranger", "warden", "broker", "herald", "reaver"]);

/**
 * Each ally looking down at the fold landing at its feet: the head comes down
 * and the chest leans over it, curious, then wary. Parts only — no root — so
 * the film can lean each figure a beat after the last as the strip reaches it
 * (see `print-policy`) without stacking on a root track.
 */
function look(hero: string): Clip {
  return {
    duration: 1000,
    poses: [{ at: 0, x: 0, y: 0, rotate: 0, squash: 1 }],
    parts: {
      head: turn([0, 0], [0.3, 10], [0.7, 14], [1, 13]),
      ...(FACED.has(hero)
        ? face([0, {}], [0.3, { brow: -0.4, open: 1.15, mouth: 0.9 }], [0.75, { brow: 0.6, knit: 4, open: 0.8, mouth: 0.8 }], [1, { brow: 0.6, knit: 4, open: 0.8, mouth: 0.85 }])
        : {}),
    },
  };
}

const allies = ["vanguard", "arcanist", "ranger", "warden", "broker", "herald", "reaver", "beguiler"];

export const poses: Record<string, Rig> = Object.fromEntries(
  allies.map((hero) => [
    hero,
    {
      "ult:print-look": look(hero),
      ...(hero === "broker"
        ? {
            "ult:print-produce": produce,
            "ult:print-riffle": riffle,
            "ult:print-cast": cast,
            "ult:print-read": read,
            "ult:print-snap": snap,
            "ult:print-settle": settle,
          }
        : {}),
    } as Rig,
  ]),
);
