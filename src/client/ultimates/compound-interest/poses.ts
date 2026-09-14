import type { Clip, Pose, Rig } from "../../battle/animation";
import { face, type Expression } from "../../battle/face";

/**
 * Compound Interest — the Usurer's poses.
 *
 * The Broker's combat rig already has the manner: the belly, the balance never
 * quite settling, the pouches swinging on the belt. This film uses the part of
 * it no other film has touched — the three coin pouches — and never weighs
 * anything: the balance is let *down* out of the picture in every cinematic
 * shot, because the weighing belongs to Foreclosure and the ledger's blow does
 * too. Nothing here is a swing. The Usurer works one coin with its hands and
 * its teeth, and the violence is done by the interest.
 *
 * Parts (see `components/heroes/Broker.tsx`): `scales` (the front arm and the
 * balance, from the front shoulder), `pans` (the beam and pans, nested in
 * `scales`), `ledger` (the back arm and whatever it holds, from the back
 * shoulder), `purse` (the three pouches on the belt), `head`, `brow`, `eyes`,
 * `mouth`, `body`, `legs`. The Broker faces right. A positive `scales` turn
 * lets the balance down; a positive `ledger` turn swings the book back and up
 * over the cap, so the small negative turns here bring the hand forward and up
 * in front of the belly, which is as far as an arm this short reaches.
 *
 * The face. The brows sit just under the cap's brim and the brim is drawn over
 * them, so they act by coming *down* onto the spectacle rims and knitting; the
 * eyes are two dots behind the lenses, and surprise lives in them; the mouth is
 * a small pursed curve whose height is how pleased it is. The bite is the one
 * shape no other Broker film makes: the mouth pulled wide and flat as the jaw
 * closes, then let go into a grin.
 */

const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/** The Usurer's faces. */
const KIND: Expression = { brow: -0.5, knit: -3, open: 0.8, mouth: 1.2, wide: 1.15 };
const WEIGH_IT: Expression = { brow: 1.4, knit: 8, open: 0.5, mouth: 0.6, wide: 0.95 };
/** The jaw closing on the coin: the mouth flat and wide, the eyes screwed up. */
const BITE: Expression = { brow: 2.4, knit: 12, open: 0.22, mouth: 0.3, wide: 1.5 };
const PLEASED: Expression = { brow: 0.2, knit: 1, open: 0.7, mouth: 1.8, wide: 1.4 };
const OFFER: Expression = { brow: -0.6, knit: -4, open: 0.9, mouth: 1.3, wide: 1.2 };
const COLD: Expression = { brow: 2.2, knit: 10, open: 0.32, mouth: 0.45, wide: 1.1 };
const CALL: Expression = { brow: 2.8, knit: 14, open: 1.15, mouth: 2.5, wide: 1.25 };

/** The balance, let down out of the picture, where it stays all film. */
const DOWN = {
  scales: turn([0, 18], [1, 22]),
  pans: turn([0, -18], [0.5, -22], [1, -20]),
};

/**
 * On the board: the ledger hand goes down to the belt, works a pouch open
 * against the hip, and comes up with something small between two fingers. The
 * pouches swing the whole time; the cap comes down to watch, then lifts.
 */
const open: Clip = {
  duration: 700,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.3, x: -0.004, y: 0.006, rotate: -2, squash: 1.03 },
    { at: 0.7, x: 0.006, y: -0.004, rotate: 1.5, squash: 0.99 },
    { at: 1, x: 0.004, y: 0, rotate: 0.5, squash: 1 },
  ],
  parts: {
    // Down to the belt, a tug, and up in front of the belly with the coin.
    ledger: [
      { at: 0, rotate: 0, x: 0, y: 0 },
      { at: 0.28, rotate: 16, x: 0.012, y: 0.03 },
      { at: 0.44, rotate: 22, x: 0.016, y: 0.034 },
      { at: 0.72, rotate: -16, x: 0.03, y: -0.022 },
      { at: 1, rotate: -12, x: 0.028, y: -0.018 },
    ],
    // The pouches are worked open, and go on swinging after.
    purse: [
      { at: 0, rotate: 0, x: 0, y: 0 },
      { at: 0.3, rotate: 13, x: 0.004, y: 0.004 },
      { at: 0.48, rotate: -11, x: -0.004 },
      { at: 0.64, rotate: 8 },
      { at: 0.8, rotate: -4 },
      { at: 1, rotate: 2 },
    ],
    head: turn([0, 0], [0.34, 11], [0.7, 3], [1, -2]),
    scales: turn([0, 0], [0.4, 12], [1, 8]),
    pans: turn([0, 0], [0.4, -14], [0.7, -6], [1, -9]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.34, squash: 1.03, y: 0.004 },
      { at: 1, squash: 1, y: 0 },
    ],
  },
};

/**
 * The bite. The arm this short does not reach the mouth, so the mouth comes to
 * the coin: the head tips down over the hand, the jaw closes on the copper —
 * brows down onto the rims, eyes to slits, the mouth pulled flat and wide —
 * and then the head lifts with the coin held off and the mouth spreading.
 * Framed on the jaw, so its root barely moves (`root: false` in the film).
 */
const bite: Clip = {
  duration: 640,
  markers: { contact: 0.42 },
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.42, x: 0.004, y: 0.004, rotate: 1.2, squash: 1.02 },
    { at: 0.56, x: 0, y: -0.002, rotate: -0.6, squash: 0.99 },
    { at: 1, x: 0.002, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    ledger: [
      { at: 0, rotate: -12, x: 0.028, y: -0.018 },
      { at: 0.34, rotate: -20, x: 0.036, y: -0.05 },
      { at: 0.42, rotate: -21, x: 0.037, y: -0.052 },
      { at: 0.62, rotate: -18, x: 0.042, y: -0.044 },
      { at: 1, rotate: -17, x: 0.046, y: -0.04 },
    ],
    head: [
      { at: 0, rotate: 0, y: 0, x: 0 },
      { at: 0.3, rotate: 13, y: 0.012, x: 0.004 },
      { at: 0.42, rotate: 15, y: 0.016, x: 0.005 },
      { at: 0.5, rotate: 12, y: 0.012, x: 0.004 },
      { at: 0.72, rotate: -2, y: -0.002 },
      { at: 1, rotate: -4, y: -0.004 },
    ],
    ...face(
      [0, WEIGH_IT],
      [0.3, { ...WEIGH_IT, open: 0.4 }],
      [0.42, BITE],
      [0.52, BITE],
      [0.7, PLEASED],
      [1, PLEASED],
    ),
    ...DOWN,
    purse: turn([0, 0], [0.3, 6], [0.5, -4], [0.7, 3], [1, 0]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.42, squash: 1.02, y: 0.003 },
      { at: 1, squash: 1, y: 0 },
    ],
  },
};

/**
 * The offer. The bitten coin held out at arm's length towards the target, as
 * if it weighed nothing, while the Usurer looks over its spectacles at what it
 * is about to be worth. The belly comes forward with it; the pouches settle.
 */
const offer: Clip = {
  duration: 960,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.3, x: 0.01, y: 0.004, rotate: 2, squash: 1.03 },
    { at: 0.62, x: 0.014, y: 0, rotate: 2.4, squash: 1 },
    { at: 1, x: 0.012, y: 0.002, rotate: 1.8, squash: 1.01 },
  ],
  parts: {
    ledger: [
      { at: 0, rotate: -17, x: 0.046, y: -0.04 },
      { at: 0.34, rotate: -34, x: 0.075, y: -0.05 },
      { at: 0.6, rotate: -36, x: 0.08, y: -0.052 },
      { at: 1, rotate: -35, x: 0.078, y: -0.05 },
    ],
    head: turn([0, -4], [0.34, -8], [0.6, -6], [1, -5]),
    ...face([0, OFFER], [0.4, OFFER], [0.66, { ...OFFER, open: 0.6 }], [1, { ...OFFER, open: 0.55 }]),
    ...DOWN,
    purse: turn([0, 0], [0.3, 8], [0.5, -5], [0.72, 3], [1, 0]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.34, squash: 1.04, y: 0.004 },
      { at: 1, squash: 1.02, y: 0.002 },
    ],
  },
};

/**
 * The loan made. One step in, and the thumb presses the coin home like a nail:
 * the arm goes out and down, the shoulder follows it, and the press is *held*
 * — no follow-through, because nothing has happened yet.
 */
const press: Clip = {
  duration: 560,
  markers: { contact: 0.4 },
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.4, x: 0.05, y: 0.006, rotate: 4, squash: 1.05 },
    { at: 0.62, x: 0.055, y: 0.004, rotate: 3.4, squash: 1.02 },
    { at: 1, x: 0.054, y: 0.004, rotate: 3.2, squash: 1.01 },
  ],
  parts: {
    ledger: [
      { at: 0, rotate: -35, x: 0.078, y: -0.05 },
      { at: 0.4, rotate: -46, x: 0.12, y: -0.03 },
      { at: 0.62, rotate: -47, x: 0.125, y: -0.028 },
      { at: 1, rotate: -46, x: 0.124, y: -0.028 },
    ],
    head: turn([0, -5], [0.4, 6], [0.7, 4], [1, 3]),
    ...face([0, COLD], [0.4, COLD], [0.7, { ...COLD, mouth: 0.9, wide: 1.3 }], [1, { ...COLD, mouth: 1, wide: 1.3 }]),
    ...DOWN,
    purse: turn([0, 0], [0.4, 12], [0.6, -6], [0.8, 4], [1, 0]),
    legs: [
      { at: 0, squash: 1 },
      { at: 0.4, squash: 1.05 },
      { at: 1, squash: 1.01 },
    ],
  },
};

/**
 * Called in. The hand comes back off the target and shuts — one fist, at the
 * chest — and the whole round body rocks back onto its heels with the shout as
 * the debt runs away in front of it. The Usurer never touches the target
 * again: the interest does the work, and it only has to be asked for.
 */
const call: Clip = {
  duration: 760,
  markers: { contact: 0.13 },
  poses: [
    { at: 0, x: 0.03, y: 0.004, rotate: 3, squash: 1.04 },
    { at: 0.08, x: 0.012, y: 0.008, rotate: 1, squash: 1.06 },
    { at: 0.13, x: -0.02, y: -0.006, rotate: -7, squash: 0.94, scale: 1.03 },
    { at: 0.28, x: -0.03, y: 0.002, rotate: -5, squash: 1.02, scale: 1.01 },
    { at: 0.55, x: -0.026, y: 0.004, rotate: -3.4, squash: 1.01 },
    { at: 1, x: -0.024, y: 0.002, rotate: -3, squash: 1 },
  ],
  parts: {
    // Off the target and shut: the hand comes back, the fist snaps closed at
    // the chest on the contact frame, and stays there.
    ledger: [
      { at: 0, rotate: -46, x: 0.124, y: -0.028 },
      { at: 0.08, rotate: -38, x: 0.09, y: -0.042 },
      { at: 0.13, rotate: -24, x: 0.05, y: -0.06 },
      { at: 0.26, rotate: -22, x: 0.046, y: -0.058 },
      { at: 1, rotate: -20, x: 0.044, y: -0.054 },
    ],
    head: turn([0, 3], [0.08, 5], [0.13, -10], [0.3, -7], [1, -6]),
    ...face([0, COLD], [0.08, COLD], [0.12, CALL], [0.55, CALL], [1, { ...CALL, mouth: 1.9, open: 0.9 }]),
    ...DOWN,
    purse: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.14, rotate: 22, y: -0.016 },
      { at: 0.3, rotate: -14, y: 0 },
      { at: 0.5, rotate: 8 },
      { at: 0.74, rotate: -4 },
      { at: 1, rotate: 0 },
    ],
    legs: [
      { at: 0, squash: 1.02 },
      { at: 0.13, squash: 0.93 },
      { at: 0.35, squash: 1.01 },
      { at: 1, squash: 1 },
    ],
    body: [
      { at: 0, squash: 1.03, y: 0 },
      { at: 0.13, squash: 0.95, y: -0.004 },
      { at: 0.35, squash: 1.02, y: 0 },
      { at: 1, squash: 1, y: 0 },
    ],
  },
};

/**
 * On the board: the pouch patted shut against the hip — twice, the second time
 * for luck — the balance levelled again, and the cap tipped to the party whose
 * money it has just made. Starts from rest, because the real unit never moved.
 */
const settle: Clip = {
  duration: 820,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.28, y: 0.008, rotate: -2, squash: 1.03 },
    { at: 0.6, y: -0.005, rotate: 2, squash: 0.99 },
    { at: 1, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    ledger: [
      { at: 0, rotate: 0, x: 0, y: 0 },
      { at: 0.2, rotate: 18, x: 0.014, y: 0.028 },
      { at: 0.34, rotate: 10, x: 0.01, y: 0.018 },
      { at: 0.46, rotate: 18, x: 0.014, y: 0.028 },
      { at: 0.7, rotate: -6, x: 0.006, y: -0.006 },
      { at: 1, rotate: 0, x: 0, y: 0 },
    ],
    purse: [
      { at: 0, rotate: 0 },
      { at: 0.22, rotate: 10 },
      { at: 0.36, rotate: -7 },
      { at: 0.5, rotate: 8 },
      { at: 0.7, rotate: -3 },
      { at: 1, rotate: 0 },
    ],
    head: turn([0, 0], [0.4, 8], [0.66, -6], [1, 0]),
    scales: turn([0, 0], [0.35, -18], [0.7, -14], [1, 0]),
    pans: turn([0, 0], [0.35, 24], [0.5, 10], [0.66, 18], [0.8, 14], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  broker: {
    "ult:usury-open": open,
    "ult:usury-bite": bite,
    "ult:usury-offer": offer,
    "ult:usury-press": press,
    "ult:usury-call": call,
    "ult:usury-settle": settle,
  },
};
