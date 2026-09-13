import type { Clip, Pose, Rig } from "../../battle/animation";
import { face, type Expression } from "../../battle/face";

/**
 * Foreclosure — the Broker's poses.
 *
 * The combat rig already has the Broker's whole manner: the belly breathing,
 * the balance never quite settling, the ledger brought over the cap in a
 * leveraged strike. These take that manner to close-up size: the balance
 * raised to the spectacles for an appraisal, held level while the vault's
 * great balance tips, left alone while a coin spins down on it, and the
 * ledger brought over the top in the one blow the film has.
 *
 * Parts (see `components/heroes/Broker.tsx`): `scales` (the front arm and the
 * balance, from the front shoulder at 60,50), `pans` (the beam and both pans,
 * nested in `scales`, pivoting on the beam's centre), `ledger` (the back arm
 * and whatever it holds — the ledger, or a worn weapon — from the back
 * shoulder at 37,50), `head`, `brow`, `eyes`, `mouth`, `purse`, `body`,
 * `legs`. The Broker faces right. A negative `scales` turn lifts the balance;
 * `pans` counter-turned by the same amount keeps the beam level. A positive
 * `ledger` turn swings the book back, then up over the cap (about 150°), then
 * down in front (about 250°).
 *
 * The face. The brows sit just under the cap's brim, and the brim is drawn over
 * them, so a brow lifted more than about a unit disappears: the Broker's brows
 * act by coming *down* onto the spectacle rims and knitting, and surprise is in
 * the eyes, which are two small dots behind the lenses with the lids drawn
 * half down. The mouth is a small pursed curve under the nose: its height is
 * how pleased it is, its width how much.
 */

const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/** The Broker's faces, tuned to its drawing. */
const PEER: Expression = { brow: -0.9, knit: -4, open: 1.5, mouth: 0.75, wide: 0.85 };
const APPRAISE: Expression = { brow: 1.7, knit: 9, open: 0.42, mouth: 0.6, wide: 0.9 };
const PLEASED: Expression = { brow: -0.7, knit: -5, open: 0.75, mouth: 1.7, wide: 1.3 };
const WATCH: Expression = { brow: 1.1, knit: 5, open: 0.8, mouth: 0.8, wide: 1 };
const COLD: Expression = { brow: 2.5, knit: 11, open: 0.3, mouth: 0.4, wide: 1.15 };
const SMILE: Expression = { brow: 2.1, knit: 7, open: 0.4, mouth: 1.6, wide: 1.45 };
const SHOUT: Expression = { brow: 2.6, knit: 13, open: 1.2, mouth: 2.6, wide: 1.2 };
const SATISFIED: Expression = { brow: 0.4, knit: 2, open: 0.55, mouth: 1.5, wide: 1.3 };

/**
 * The appraisal. The balance comes up level with the spectacles; the chin
 * tips down to look over them, eyes wide; they narrow to a squint while the
 * pans settle; then a flick of the wrist bounces a coin off the pan, and the
 * brows go up with it.
 */
const appraise: Clip = {
  duration: 620,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.25, x: 0.01, y: 0.004, rotate: 2, squash: 1.02 },
    { at: 0.68, x: 0.012, y: 0.005, rotate: 2.4, squash: 1.02 },
    { at: 0.76, x: 0.004, y: -0.006, rotate: -1, squash: 0.98 },
    { at: 1, x: 0.006, y: 0, rotate: 0.5, squash: 1 },
  ],
  parts: {
    scales: [
      { at: 0, rotate: 0, x: 0, y: 0 },
      { at: 0.3, rotate: -44, x: 0.02, y: -0.03 },
      { at: 0.66, rotate: -42, x: 0.02, y: -0.03 },
      // The flick.
      { at: 0.72, rotate: -56, x: 0.024, y: -0.042 },
      { at: 0.84, rotate: -40, x: 0.02, y: -0.028 },
      { at: 1, rotate: -43, x: 0.02, y: -0.03 },
    ],
    // Counter-turned to hang level, swinging as the arm stops.
    pans: turn([0, 0], [0.3, 30], [0.42, 52], [0.54, 38], [0.66, 44], [0.72, 22], [0.8, 64], [0.9, 36], [1, 43]),
    head: turn([0, 0], [0.25, 6], [0.6, 7], [0.74, -3], [1, -1]),
    ...face([0, {}], [0.22, PEER], [0.5, APPRAISE], [0.66, APPRAISE], [0.76, PLEASED], [1, PLEASED]),
    ledger: turn([0, 0], [0.3, -12], [1, -14]),
    purse: turn([0, 0], [0.3, 5], [0.5, -3], [0.76, 6], [0.9, -3], [1, 0]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.3, squash: 1.02, y: 0.002 },
      { at: 1, squash: 1.01, y: 0.001 },
    ],
  },
};

/**
 * The weighing. Held out level while the vault's balance weighs the target;
 * when the coin lands the little pans tip the same way the great ones do —
 * the target's side up — and the Broker gives one satisfied nod.
 */
const weigh: Clip = {
  duration: 1000,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.34, x: 0, y: 0, rotate: -1, squash: 1 },
    { at: 0.42, x: -0.006, y: 0.006, rotate: 1.5, squash: 1.04 },
    { at: 0.56, x: 0, y: 0, rotate: 0.5, squash: 0.99 },
    { at: 1, x: 0, y: 0, rotate: 0.6, squash: 1 },
  ],
  parts: {
    scales: turn([0, -14], [0.34, -14], [0.42, -10], [0.6, -13], [1, -12]),
    pans: turn([0, 14], [0.34, 13], [0.4, -8], [0.5, 2], [0.62, -6], [0.78, -2], [1, -4]),
    head: turn([0, -7], [0.34, -8], [0.44, 4], [0.6, -2], [1, -1]),
    ...face([0, WATCH], [0.36, WATCH], [0.5, SATISFIED], [1, SATISFIED]),
    ledger: turn([0, -14], [0.4, -18], [1, -16]),
    purse: turn([0, 0], [0.42, 9], [0.56, -6], [0.7, 3], [1, 0]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.42, squash: 1.03, y: 0.004 },
      { at: 1, squash: 1, y: 0 },
    ],
  },
};

/**
 * The coin settles. Nothing moves but the eyes and the ledger: the eyes
 * follow the coin down, the brows come onto the rims and knit, the mouth goes
 * flat — and while the book rises slowly overhead, one corner of the mouth
 * comes up.
 */
const settle: Clip = {
  duration: 660,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0.5, squash: 1 },
    { at: 1, x: -0.012, y: 0.004, rotate: -2.5, squash: 1.02 },
  ],
  parts: {
    head: [
      { at: 0, rotate: 5, y: 0 },
      { at: 0.45, rotate: 7, y: 0.003 },
      { at: 0.75, rotate: 2, y: 0.002 },
      { at: 1, rotate: 1, y: 0.002 },
    ],
    ...face([0, WATCH], [0.4, { ...WATCH, open: 0.62 }], [0.72, COLD], [0.86, COLD], [1, SMILE]),
    ledger: turn([0, 20], [0.4, 70], [0.8, 132], [1, 148]),
    // The balance let down, out of the picture: nothing between the face and the coin.
    scales: turn([0, 20], [1, 24]),
    pans: turn([0, -20], [0.5, -23], [1, -24]),
    purse: turn([0, 0], [1, -3]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 1, squash: 1.02, y: 0.002 },
    ],
  },
};

/**
 * Foreclosure. The book comes over the cap and down; the whole round body
 * follows it; the balance flies back and its pans swing wild. Seen from the
 * top of the swing, so `contact` is a few frames in.
 */
const foreclose: Clip = {
  duration: 760,
  markers: { contact: 0.07 },
  poses: [
    { at: 0, x: -0.03, y: 0.006, rotate: -5, squash: 1.07 },
    { at: 0.07, x: 0.14, y: -0.004, rotate: 10, squash: 0.88, scale: 1.04 },
    { at: 0.2, x: 0.12, y: 0, rotate: 8, squash: 0.95, scale: 1.02 },
    { at: 0.45, x: 0.1, y: 0.004, rotate: 6, squash: 1.02, scale: 1 },
    { at: 1, x: 0.09, y: 0.002, rotate: 5, squash: 1, scale: 1 },
  ],
  parts: {
    // The arm is short and the Broker is round: the book is thrown forward
    // off the shoulder a little to reach past the belly.
    ledger: [
      { at: 0, rotate: 150, x: -0.02 },
      { at: 0.07, rotate: 226, x: 0.07, y: 0.02 },
      { at: 0.2, rotate: 246, x: 0.06, y: 0.02 },
      { at: 0.45, rotate: 240, x: 0.04, y: 0.01 },
      { at: 1, rotate: 236, x: 0.03, y: 0.01 },
    ],
    scales: turn([0, -12], [0.07, 24], [0.25, 16], [0.5, 20], [1, 18]),
    pans: turn([0, 10], [0.08, -34], [0.22, 28], [0.38, -16], [0.55, 9], [0.75, -4], [1, 0]),
    head: turn([0, -4], [0.07, 10], [0.25, 7], [1, 5]),
    ...face([0, COLD], [0.05, SHOUT], [0.5, SHOUT], [1, { ...SHOUT, mouth: 2, open: 1 }]),
    purse: [
      { at: 0, rotate: 6, y: 0 },
      { at: 0.08, rotate: -20, y: -0.018 },
      { at: 0.25, rotate: 12, y: 0 },
      { at: 0.45, rotate: -6 },
      { at: 1, rotate: 0 },
    ],
    legs: [
      { at: 0, squash: 1.06 },
      { at: 0.07, squash: 0.92 },
      { at: 0.3, squash: 1 },
      { at: 1, squash: 1 },
    ],
  },
};

/**
 * On the board: the book tucked back under the arm, the balance levelled with
 * a little lift, and the cap tipped to the party. Starts from rest, because
 * the real unit never swung.
 */
const collect: Clip = {
  duration: 860,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.25, y: 0.01, rotate: -2, squash: 1.04 },
    { at: 0.5, y: -0.006, rotate: 2, squash: 0.98 },
    { at: 1, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    ledger: turn([0, 0], [0.25, -34], [0.5, -26], [1, 0]),
    scales: turn([0, 0], [0.3, -22], [0.7, -20], [1, 0]),
    pans: turn([0, 0], [0.3, 30], [0.45, 14], [0.6, 24], [0.75, 19], [1, 0]),
    head: turn([0, 0], [0.35, 10], [0.55, -4], [1, 0]),
    purse: turn([0, 0], [0.25, 10], [0.4, -8], [0.55, 5], [0.7, -2], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  broker: {
    "ult:appraise": appraise,
    "ult:weigh": weigh,
    "ult:settle": settle,
    "ult:foreclose": foreclose,
    "ult:collect": collect,
  },
};
