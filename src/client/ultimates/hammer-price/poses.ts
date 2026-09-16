import type { Clip, Pose, Rig } from "../../battle/animation";
import { face, type Expression } from "../../battle/face";

/**
 * Where the Broker's drawing parks the hammer, outside its clip, in drawing
 * units (`GAVEL_PARK` in `components/heroes/Broker.tsx`). Not imported: a rig
 * module importing a drawing would close a loop through the equipment layer.
 */
const GAVEL_PARK = 1000;

/**
 * Hammer Price — the Magnate's poses.
 *
 * The Magnate has stopped weighing things. In every cinematic shot the
 * balance is gone from its fist (`balance` at scale 0) and the sale hammer
 * stands in it instead (`gavel`, a close-up-only part of the Broker's
 * drawing, with its head `mallet`). So everything the Magnate does with the
 * hammer is done with the *front* arm, `scales`, which pivots on the front
 * shoulder (60, 50) with the fist 11.8 units out along it: a negative turn
 * lifts the fist (−90 is straight up), a positive one lets it down. The
 * hammer's handle stands straight up out of the fist, its head 33 units above
 * it; the `gavel` turn is the wrist, on top of the arm's. So the handle's
 * direction is the *sum* of the two turns, measured clockwise from straight
 * up: 0 is the hammer held upright, 90 is the handle lying forward with the
 * head's striking face pointing at the floor — a blow landing.
 *
 * The ledger arm keeps whatever the Broker really holds and does little: the
 * base film's blow is the ledger's, and this film never uses it.
 *
 * The price is weight: the hammer's head swells (`mallet` scale, and `squash`
 * below 1 to fatten it rather than lengthen it) as the room is outbid, in
 * steps timed to the waves of paddles going down in the film.
 *
 * The face. The brows sit under the cap's brim and act by coming *down* onto
 * the spectacle rims (a lift of more than a unit goes under the brim); the
 * eyes are dots behind the lenses; the mouth's height is how pleased it is.
 * The Magnate's bid is a nod, so its acting is small: a lift of the brows, the
 * lids, the chin down and up, and a closed, wide, satisfied mouth. It opens
 * only at the price.
 *
 * Every pose name is prefixed `ult:hammer-`.
 */

const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/** The hammer brought home from where it is parked outside its clip. */
const HOME = -GAVEL_PARK / 100;
/** The hammer's own track: the wrist turn, always home. */
const hammer = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate, x: HOME }));
/** The head's size, `[at, scale, squash]`: the price so far. */
const price = (...keys: [number, number, number?][]): Pose[] =>
  keys.map(([at, scale, squash]) => ({ at, scale, squash: squash ?? 1 }));
/** No balance in the fist: the Magnate does not weigh. */
const NO_BALANCE = [{ at: 0, scale: 0.001 }];

/* ── Faces, tuned to the Broker's drawing ─────────────────────────────── */

/** Heavy-lidded, looking the room over. */
const APPRAISE: Expression = { brow: 0.6, knit: 3, open: 0.55, mouth: 0.9, wide: 1.1 };
/** The bid: brows up a hair, eyes open to the lot, the mouth closed and wide. */
const BID: Expression = { brow: -0.7, knit: -3, open: 0.78, mouth: 0.7, wide: 1.3 };
/** Nodding: the lids come down with the chin. */
const NOD: Expression = { brow: 0.3, knit: -1, open: 0.36, mouth: 0.75, wide: 1.35 };
/** Outbidding the room: smug. */
const SMUG: Expression = { brow: -0.3, knit: -4, open: 0.58, mouth: 1.35, wide: 1.38 };
/** Going twice: the brows come down hard on the rims, lips pressed. */
const HOIST: Expression = { brow: 2, knit: 10, open: 0.42, mouth: 0.5, wide: 1.25 };
/** The blow: brows crushed down on the rims, eyes screwed shut, the mouth turned over into a grimace. */
const STRAIN: Expression = { brow: 2.6, knit: 14, open: 0.2, mouth: 3, wide: 1.75 };
/** Sold: the grin of a man who got it cheap. */
const SOLD: Expression = { brow: -0.6, knit: -5, open: 0.62, mouth: 2.3, wide: 1.45 };

/**
 * On the board: the chin comes up and the ledger hand touches the cap's brim,
 * the bidder's signal, while the balance is held level. Starts from rest.
 */
const call: Clip = {
  duration: 480,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.35, x: -0.006, y: -0.006, rotate: -2.5, squash: 0.98 },
    { at: 0.7, x: 0.004, y: 0.002, rotate: 1, squash: 1.02 },
    { at: 1, x: 0.002, y: 0, rotate: 0.5, squash: 1 },
  ],
  parts: {
    ledger: turn([0, 0], [0.35, -128], [0.55, -134], [0.8, -120], [1, -96]),
    head: turn([0, 0], [0.35, -7], [0.6, -5], [1, -3]),
    scales: turn([0, 0], [0.4, -8], [1, -4]),
    pans: turn([0, 0], [0.4, 8], [0.7, -4], [1, 2]),
    purse: turn([0, 0], [0.4, -6], [0.7, 4], [1, 0]),
  },
};

/**
 * The nod. Framed on the face (`root: false` in the film), the hammer held up
 * by the chin with its head standing beside the cap: the eyes open to the lot,
 * the brows come up a hair, the chin goes down once, slowly, and comes back up
 * with the mouth set in a closed, wide smile.
 */
const nod: Clip = {
  duration: 640,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.5, x: 0.002, y: 0.004, rotate: 1, squash: 1.01 },
    { at: 1, x: 0, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    scales: turn([0, -20], [0.46, -16], [0.7, -21], [1, -20]),
    gavel: hammer([0, 55], [0.46, 58], [0.7, 53], [1, 55]),
    mallet: price([0, 1]),
    balance: NO_BALANCE,
    ledger: turn([0, -30], [1, -32]),
    head: [
      { at: 0, rotate: -3, y: 0 },
      { at: 0.24, rotate: -4, y: -0.002 },
      { at: 0.46, rotate: 9, y: 0.012 },
      { at: 0.62, rotate: 8, y: 0.01 },
      { at: 0.84, rotate: -2, y: 0 },
      { at: 1, rotate: -1.5, y: 0 },
    ],
    ...face([0, APPRAISE], [0.22, BID], [0.46, NOD], [0.62, NOD], [0.84, BID], [1, { ...BID, mouth: 0.9, wide: 1.4 }]),
    purse: turn([0, 0], [0.5, 3], [1, 0]),
  },
};

/**
 * Outbidding the room. The hammer held up before the face like a bid, and at
 * each wave of paddles going down the Magnate gives it a little lift and its
 * head swells: the price, getting heavier. Pleased with itself throughout.
 */
const outbid: Clip = {
  duration: 1000,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.3, x: 0.006, y: 0.004, rotate: 1.6, squash: 1.03 },
    { at: 0.55, x: 0.01, y: 0.002, rotate: 2.4, squash: 1.01 },
    { at: 0.8, x: 0.012, y: 0.006, rotate: 3, squash: 1.04 },
    { at: 1, x: 0.012, y: 0.004, rotate: 2.8, squash: 1.03 },
  ],
  parts: {
    scales: turn([0, -56], [0.24, -60], [0.3, -68], [0.49, -64], [0.55, -72], [0.74, -68], [0.8, -76], [1, -74]),
    gavel: hammer([0, 64], [0.3, 76], [0.55, 80], [0.8, 84], [1, 82]),
    mallet: price([0, 1], [0.24, 1], [0.3, 1.24, 0.94], [0.49, 1.22, 0.94], [0.55, 1.44, 0.88], [0.74, 1.42, 0.88], [0.8, 1.62, 0.84], [1, 1.62, 0.84]),
    balance: NO_BALANCE,
    ledger: turn([0, -30], [0.5, -24], [1, -26]),
    head: turn([0, -2], [0.3, 3], [0.55, -4], [0.8, 2], [1, 0]),
    ...face([0, BID], [0.3, SMUG], [0.6, { ...SMUG, open: 0.5 }], [1, SMUG]),
    purse: turn([0, 0], [0.3, 7], [0.5, -5], [0.8, 6], [1, 0]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.3, squash: 1.03, y: 0.003 },
      { at: 1, squash: 1.02, y: 0.002 },
    ],
  },
};

/**
 * Going twice. The hammer hoisted straight up over the cap at its full price,
 * and the round body leans back under the weight of it; the brows come down,
 * the lips press. Held, with a slow settle, as if it could stay up forever.
 */
const hoist: Clip = {
  duration: 560,
  poses: [
    { at: 0, x: 0.01, y: 0.004, rotate: 2, squash: 1.02 },
    { at: 0.35, x: -0.02, y: 0.012, rotate: -5, squash: 1.06 },
    { at: 1, x: -0.024, y: 0.014, rotate: -6, squash: 1.07 },
  ],
  parts: {
    scales: turn([0, -74], [0.35, -104], [1, -108]),
    gavel: hammer([0, 82], [0.35, 92], [1, 90]),
    mallet: price([0, 1.62, 0.84], [0.35, 1.72, 0.8], [1, 1.74, 0.8]),
    balance: NO_BALANCE,
    ledger: turn([0, -26], [0.4, 18], [1, 22]),
    head: turn([0, 0], [0.35, -10], [1, -12]),
    ...face([0, SMUG], [0.3, HOIST], [1, { ...HOIST, open: 0.36 }]),
    purse: turn([0, 0], [0.35, -9], [0.6, 5], [1, 0]),
    legs: [
      { at: 0, squash: 1 },
      { at: 0.35, squash: 1.05 },
      { at: 1, squash: 1.06 },
    ],
  },
};

/**
 * Gone. From hoisted, the Magnate cocks back once more, then throws the whole
 * round body forward and down over the blow: the arm is driven down past the
 * belly, the handle lengthens through the swing and lies forward and down,
 * and the head's face comes down on the lot's back from above. It stays
 * pressed there while the Magnate strains on it, and only after the stop does
 * the face let go into the smile of a sale.
 */
/**
 * When the hammer lands: 125ms into the knock, just after the 120ms the film
 * spends easing into a clip, so the contact frame is exactly the pose keyed.
 */
const CONTACT = 125 / 760;

/** How much longer the handle is at the blow than at rest. */
const REACH = 1.2;
/** The shaft stretched along its length only: x = s·q stays 1, y = s/q is the reach. */
const stretch = (at: number, reach: number): Pose => ({ at, scale: Math.sqrt(reach), squash: 1 / Math.sqrt(reach) });
/** The head carried out to the end of the stretched shaft (36 units of handle above the butt). */
const outTo = (reach: number) => -((reach - 1) * 36) / 100;

/** A mouth turned over: a curve that was pleased becomes a grimace. */
const turned = (poses: Pose[], keys: [number, number][]) =>
  poses.map((p) => ({ ...p, rotate: keys.find(([at]) => Math.abs(at - p.at) < 1e-6)?.[1] ?? 0 }));

const knockFace = face(
  [0, HOIST],
  [0.07, { ...HOIST, open: 0.3, mouth: 0.25 }],
  [CONTACT, STRAIN],
  [0.3, STRAIN],
  // Flattened to a line before it turns back over, so the turn never shows.
  [0.36, { ...STRAIN, mouth: 0.25, wide: 1.2 }],
  [0.42, SOLD],
  [1, { ...SOLD, mouth: 1.8 }],
);

const knock: Clip = {
  duration: 760,
  markers: { contact: CONTACT },
  poses: [
    { at: 0, x: -0.024, y: 0.014, rotate: -6, squash: 1.07 },
    { at: 0.09, x: -0.034, y: 0.018, rotate: -9, squash: 1.09 },
    { at: CONTACT, x: 0.075, y: 0.03, rotate: 15, squash: 0.88, scale: 1.04 },
    { at: 0.3, x: 0.072, y: 0.028, rotate: 14, squash: 0.9, scale: 1.03 },
    { at: 0.5, x: 0.064, y: 0.02, rotate: 10, squash: 0.95, scale: 1.01 },
    { at: 1, x: 0.06, y: 0.018, rotate: 9, squash: 0.97 },
  ],
  parts: {
    // Cocked back and up, then over and down in 55ms: the arm ends driven
    // down past the belly, and handle and arm together point forward and down.
    scales: turn([0, -108], [0.09, -122], [0.13, -70], [CONTACT, -38], [0.3, -36], [0.5, -40], [1, -42]),
    gavel: hammer([0, 90], [0.09, 84], [0.13, 112], [CONTACT, 151], [0.3, 150], [0.5, 150], [1, 150]),
    shaft: [{ at: 0, scale: 1, squash: 1 }, stretch(0.09, 1.05), stretch(0.13, 1.12), stretch(CONTACT, REACH), stretch(1, REACH)],
    mallet: [
      { at: 0, scale: 1.74, squash: 0.8, y: 0 },
      { at: 0.09, scale: 1.7, squash: 0.82, y: outTo(1.05) },
      { at: 0.13, scale: 1.45, squash: 0.92, y: outTo(1.12) },
      { at: CONTACT, scale: 1.25, squash: 1, y: outTo(REACH) },
      // Flattened against the lot, and back.
      { at: 0.2, scale: 1.2, squash: 1.14, y: outTo(REACH) },
      { at: 0.32, scale: 1.27, squash: 0.97, y: outTo(REACH) },
      { at: 1, scale: 1.25, squash: 1, y: outTo(REACH) },
    ],
    balance: NO_BALANCE,
    ledger: turn([0, 20], [0.09, 26], [CONTACT, -46], [0.4, -40], [1, -36]),
    head: turn([0, -12], [0.09, -15], [CONTACT, 16], [0.3, 14], [0.5, 6], [1, 4]),
    ...knockFace,
    mouth: turned(knockFace.mouth, [[0.07, 0], [CONTACT, 180], [0.3, 180], [0.36, 180]]),
    purse: [
      { at: 0, rotate: 0, y: 0 },
      { at: CONTACT, rotate: 26, y: -0.02 },
      { at: 0.32, rotate: -14, y: 0 },
      { at: 0.55, rotate: 8 },
      { at: 0.8, rotate: -3 },
      { at: 1, rotate: 0 },
    ],
    legs: [
      { at: 0, squash: 1.06 },
      { at: 0.09, squash: 1.09 },
      { at: CONTACT, squash: 0.88 },
      { at: 0.32, squash: 0.92 },
      { at: 1, squash: 0.97 },
    ],
    body: [
      { at: 0, squash: 1.04, y: 0 },
      { at: CONTACT, squash: 0.9, y: 0.008 },
      { at: 0.32, squash: 0.95, y: 0.005 },
      { at: 1, squash: 0.99, y: 0.002 },
    ],
  },
};

/**
 * On the board: the palms dusted off against each other — the ledger hand
 * brushed across the balance's fist, twice — and the cap tipped. Starts from
 * rest, because the real unit never moved.
 */
const settle: Clip = {
  duration: 820,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.3, y: 0.006, rotate: 2, squash: 1.03 },
    { at: 0.62, y: -0.004, rotate: -2, squash: 0.99 },
    { at: 1, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    ledger: turn([0, 0], [0.16, -96], [0.28, -84], [0.4, -98], [0.52, -86], [0.74, -132], [0.88, -128], [1, 0]),
    scales: turn([0, 0], [0.16, -14], [0.52, -12], [0.74, 0], [1, 0]),
    pans: turn([0, 0], [0.2, 12], [0.4, -8], [0.6, 6], [0.8, -2], [1, 0]),
    head: turn([0, 0], [0.4, 4], [0.74, -8], [0.88, -6], [1, 0]),
    purse: turn([0, 0], [0.3, 6], [0.5, -4], [0.7, 3], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  broker: {
    "ult:hammer-call": call,
    "ult:hammer-nod": nod,
    "ult:hammer-outbid": outbid,
    "ult:hammer-hoist": hoist,
    "ult:hammer-knock": knock,
    "ult:hammer-settle": settle,
  },
};
