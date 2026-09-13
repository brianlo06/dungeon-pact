import type { Clip, Pose, Rig } from "../../battle/animation";
import { face } from "../../battle/face";

/**
 * The Hundredth Mark — the Ranger's poses.
 *
 * The combat rig already speaks the Ranger's language: turn, raise, draw to
 * the jaw, hold, loose. These are that language at close-up size and past
 * what a round allows: a draw pulled all the way to the cheek, with the
 * string really coming back to the hand; a hold long enough to count every
 * enemy; a face that goes from seeing a hundred shots to choosing one; and a
 * follow-through left hanging in the air while the arrow is still flying.
 *
 * Parts: `bow` (the front arm and bow, from the front shoulder), `draw` (the
 * drawing arm, from the back shoulder), `arrow` (in the drawing hand),
 * `stringTop` and `stringLow` (the bowstring's halves, nested in `bow`, each
 * from its own tip), `head` (with the hood), `brow`, `eyes`, `mouth`, `cloak`,
 * `quiver`, `body`, `legs`. The Ranger faces right: forward is +x, and a
 * negative rotation of `draw` swings the hand forward and up.
 */

type Part = Record<string, Pose[]>;
const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/* ── The draw, solved ─────────────────────────────────────────────────── */

const rad = (deg: number) => (deg * Math.PI) / 180;
/** Rotate a vector clockwise (SVG's positive) by `deg`. */
const rot = ([x, y]: [number, number], deg: number): [number, number] => {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return [x * c - y * s, x * s + y * c];
};

/** Joints in the drawing's units (see `components/heroes/Ranger.tsx`). */
const FRONT: [number, number] = [60, 50];
const BACK: [number, number] = [37, 50];
const HAND: [number, number] = [35, 64];
const TOP: [number, number] = [67.5, 23.5];
const LOW: [number, number] = [67.5, 92];
/** The string's middle, where its two halves meet at rest. */
const MID = 58;

/** One held moment of a draw: where the two arms and the arrow are. */
export interface Draw {
  /** The bow arm: rotation (deg), offset (drawing hundredths). */
  bow: number;
  bowX?: number;
  bowY?: number;
  /** The drawing arm. */
  draw: number;
  drawX?: number;
  drawY?: number;
  /** The arrow in the hand: rotation and scale. */
  arrow: number;
  arrowScale?: number;
  /** How far behind the hand, along the shaft, the nock sits. */
  nock?: number;
  /** Arrow hidden: loosed. The string then goes home. */
  loosed?: boolean;
  /** String flutter after the loose, degrees. */
  flutter?: number;
}

/**
 * The parts for one held draw, at `at`, with the bowstring's halves turned
 * and stretched so they meet at the nock — wherever the two arms have put it.
 * Solved rather than eyeballed: the string is the one line a close-up would
 * catch being wrong.
 */
function drawn(at: number, d: Draw): Part {
  const bx = d.bowX ?? 0;
  const by = d.bowY ?? 0;
  const dx = d.drawX ?? 0;
  const dy = d.drawY ?? 0;
  const as = d.arrowScale ?? 1;
  // The nock in the drawing arm's space: the arrow's origin is the hand, and
  // its shaft starts a few units behind it.
  const [nx, ny] = rot([-(d.nock ?? 4) * as, 0], d.arrow + 12);
  const nockDraw: [number, number] = [HAND[0] + nx, HAND[1] + ny];
  // ...in the figure's space...
  const [wx, wy] = rot([nockDraw[0] - BACK[0], nockDraw[1] - BACK[1]], d.draw);
  const world: [number, number] = [BACK[0] + dx * 100 + wx, BACK[1] + dy * 100 + wy];
  // ...and in the bow's, where the string lives.
  const [lx, ly] = rot([world[0] - FRONT[0] - bx * 100, world[1] - FRONT[1] - by * 100], -d.bow);
  const nock: [number, number] = [FRONT[0] + lx, FRONT[1] + ly];

  const half = (tip: [number, number], rest: number, sign: 1 | -1): Pose => {
    if (d.loosed)
      return { at, rotate: d.flutter ? d.flutter * sign : 0, scale: 1, squash: 1 };
    const vx = nock[0] - tip[0];
    const vy = nock[1] - tip[1];
    const len = Math.hypot(vx, vy);
    const angle = (Math.atan2(vy, vx) * 180) / Math.PI - (sign > 0 ? 90 : -90);
    // Stretched along its own length only: scale·squash across stays 1.
    const k = len / rest;
    return { at, rotate: angle, scale: Math.sqrt(k), squash: 1 / Math.sqrt(k) };
  };
  return {
    bow: [{ at, rotate: d.bow, x: bx, y: by }],
    draw: [{ at, rotate: d.draw, x: dx, y: dy }],
    arrow: [{ at, rotate: d.arrow, scale: d.loosed ? 0 : as }],
    stringTop: [half(TOP, MID - TOP[1], 1)],
    stringLow: [half(LOW, LOW[1] - MID, -1)],
  };
}

/** Several held draws, one after another, merged into part tracks. */
function draws(...keys: [number, Draw][]): Part {
  const out: Part = {};
  for (const [at, d] of keys)
    for (const [name, poses] of Object.entries(drawn(at, d))) (out[name] ??= []).push(...poses);
  return out;
}

/**
 * The anchor: the string in the hand under the chin, the arrow level with the
 * jaw, the bow pushed out so its grip sits under the arrow's head. The string
 * crosses the cheek on its way to the hand, as a drawn string does.
 */
const ANCHOR: Draw = { bow: -10, bowX: 0.06, bowY: -0.05, draw: -102.5, drawX: 0.04, drawY: -0.01, arrow: 90.5, arrowScale: 1.12 };
/** Past the anchor: the impossible draw, the hand back to the cheek. */
const FULL: Draw = { bow: -10, bowX: 0.075, bowY: -0.052, draw: -109, drawX: 0, drawY: -0.005, arrow: 97, arrowScale: 1.2 };

/* ── Clips ─────────────────────────────────────────────────────────────── */

/**
 * Nock and draw: the hand brings the red-fletched arrow to the string and
 * pulls it back along the jaw; the head tips down onto it and the eyes
 * settle. The identity shot.
 */
const nock: Clip = {
  duration: 620,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.3, x: 0.01, y: 0.006, rotate: 1, squash: 1.02 },
    { at: 0.7, x: -0.012, y: 0.004, rotate: -1.6, squash: 1.01 },
    { at: 1, x: -0.014, y: 0.004, rotate: -1.8, squash: 1.01 },
  ],
  parts: {
    ...draws(
      [0, { bow: -4, draw: -70, drawX: 0.04, arrow: 60, arrowScale: 1 }],
      [0.3, { bow: -10, bowY: -0.03, draw: -96, drawX: 0.05, drawY: -0.01, arrow: 84, arrowScale: 1.08 }],
      [0.72, ANCHOR],
      [1, { ...ANCHOR, draw: -104, drawX: 0.032 }],
    ),
    head: [
      { at: 0, rotate: 0 },
      { at: 0.35, rotate: -3 },
      { at: 0.75, rotate: 6, y: 0.006 },
      { at: 1, rotate: 7, y: 0.008 },
    ],
    ...face(
      [0, { brow: -0.8, open: 1.35, mouth: 1 }],
      [0.4, { brow: -1, open: 1.4, mouth: 0.9 }],
      [0.8, { brow: 0.7, knit: 5, open: 1.35, mouth: 0.7 }],
      [1, { brow: 0.8, knit: 6, open: 1.3, mouth: 0.65 }],
    ),
    cloak: turn([0, 0], [0.4, -6], [1, -9]),
    quiver: turn([0, 0], [0.5, -3], [1, -2]),
    legs: [
      { at: 0, squash: 1 },
      { at: 0.4, squash: 1.05, y: 0.006 },
      { at: 1, squash: 1.04, y: 0.005 },
    ],
  },
};

/**
 * Sighting down the whole line at full draw. Held, with the tremor of a
 * small arm holding a big bow, and the cloak moving where nothing else does.
 */
const sight: Clip = {
  duration: 960,
  loop: true,
  poses: [
    { at: 0, x: -0.016, y: 0.004, rotate: -2, squash: 1.01 },
    { at: 0.5, x: -0.018, y: 0.005, rotate: -2.3, squash: 1.012 },
    { at: 1, x: -0.016, y: 0.004, rotate: -2, squash: 1.01 },
  ],
  parts: {
    ...draws(
      [0, FULL],
      [0.25, { ...FULL, bow: -10.6, drawX: -0.003 }],
      [0.5, { ...FULL, bow: -9.6, drawX: 0.002 }],
      [0.75, { ...FULL, bow: -10.4, drawX: -0.004 }],
      [1, FULL],
    ),
    head: turn([0, 8], [0.5, 8.6], [1, 8]),
    cloak: turn([0, -9], [0.3, -14], [0.6, -7], [1, -9]),
    quiver: turn([0, -2], [0.5, -3], [1, -2]),
    legs: [
      { at: 0, squash: 1.05, y: 0.006 },
      { at: 1, squash: 1.05, y: 0.006 },
    ],
  },
};

/**
 * The choice. At full draw, eyes wide on every shot there is — and then
 * ninety-nine of them let go: the eyes narrow to one, the brow comes down,
 * the mouth sets, and the string creeps back the last hair.
 */
const choose: Clip = {
  duration: 580,
  poses: [
    { at: 0, x: -0.016, y: 0.004, rotate: -2, squash: 1.01 },
    { at: 1, x: -0.02, y: 0.006, rotate: -2.6, squash: 1.014 },
  ],
  parts: {
    ...draws([0, FULL], [0.55, FULL], [1, { ...FULL, draw: -112, drawX: -0.012 }]),
    head: [
      { at: 0, rotate: 8, y: 0 },
      { at: 0.5, rotate: 7, y: -0.002 },
      { at: 0.8, rotate: 10, y: 0.006 },
      { at: 1, rotate: 10.5, y: 0.007 },
    ],
    ...face(
      // Seeing all of it.
      [0, { brow: -3, knit: -4, open: 1.9, mouth: 2.1, wide: 0.75 }],
      [0.4, { brow: -3.2, knit: -5, open: 2, mouth: 2.2, wide: 0.72 }],
      // Choosing one.
      [0.68, { brow: 1.8, knit: 8, open: 0.55, mouth: 0.5, wide: 1.05 }],
      [1, { brow: 2.1, knit: 9, open: 0.5, mouth: 0.45, wide: 1.05 }],
    ),
    cloak: turn([0, -9], [0.5, -11], [1, -12]),
  },
};

/**
 * After the loose. The bow hand punches on towards the target, the drawing
 * hand flies back past the ear, and the string shivers home. Seen at the
 * moment the arrow arrives, so its `contact` is the arrival, not the release.
 */
const after: Clip = {
  duration: 700,
  markers: { contact: 0.036 },
  poses: [
    { at: 0, x: -0.04, y: 0.004, rotate: -5, squash: 0.97 },
    { at: 0.25, x: -0.034, y: 0.002, rotate: -4, squash: 1 },
    { at: 1, x: -0.03, y: 0.002, rotate: -3.4, squash: 1 },
  ],
  parts: {
    ...draws(
      [0, { ...FULL, bowX: 0.12, bow: -6, draw: -116, drawX: -0.13, drawY: -0.02, loosed: true, flutter: 6 }],
      [0.1, { ...FULL, bowX: 0.12, bow: -6.5, draw: -121, drawX: -0.145, drawY: -0.025, loosed: true, flutter: -4 }],
      [0.22, { ...FULL, bowX: 0.118, bow: -6.8, draw: -119, drawX: -0.14, drawY: -0.022, loosed: true, flutter: 2.5 }],
      [0.38, { ...FULL, bowX: 0.115, bow: -6.4, draw: -117, drawX: -0.137, drawY: -0.02, loosed: true, flutter: -1 }],
      [1, { ...FULL, bowX: 0.11, bow: -5, draw: -112, drawX: -0.13, drawY: -0.018, loosed: true }],
    ),
    head: turn([0, 3], [0.3, 1], [1, 0]),
    ...face(
      [0, { brow: 1.4, knit: 7, open: 0.7, mouth: 0.6 }],
      [0.35, { brow: 0.4, knit: 3, open: 1.3, mouth: 1.2 }],
      [1, { brow: -0.4, knit: 0, open: 1.35, mouth: 1.5, wide: 1.1 }],
    ),
    cloak: turn([0, 10], [0.25, -16], [0.6, -5], [1, -9]),
    quiver: turn([0, 5], [0.3, -4], [1, -1]),
    legs: [
      { at: 0, squash: 1.06, y: 0.006 },
      { at: 1, squash: 1.04, y: 0.004 },
    ],
  },
};

/** On the board: the bow comes down, the hand goes back to the quiver. */
const lower: Clip = {
  duration: 760,
  poses: [
    { at: 0, x: -0.02, y: 0, rotate: -3 },
    { at: 0.35, x: -0.01, y: 0.012, rotate: 1.5, squash: 1.04 },
    { at: 1, x: 0, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    bow: [
      { at: 0, rotate: -12, x: 0.03, y: -0.04 },
      { at: 0.4, rotate: 6, x: 0.01, y: 0.01 },
      { at: 1, rotate: 0, x: 0, y: 0 },
    ],
    draw: [
      { at: 0, rotate: -140, x: -0.08, y: -0.04 },
      { at: 0.45, rotate: -30, x: -0.01 },
      { at: 1, rotate: 0, x: 0, y: 0 },
    ],
    arrow: [
      { at: 0, rotate: 0, scale: 0 },
      { at: 0.55, rotate: 0, scale: 0 },
      { at: 0.75, rotate: 0, scale: 1 },
      { at: 1, rotate: 0, scale: 1 },
    ],
    head: turn([0, 6], [0.4, -4], [1, 0]),
    cloak: turn([0, -8], [0.4, 6], [1, 0]),
    quiver: turn([0, 0], [0.5, 4], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  ranger: {
    "ult:nock": nock,
    "ult:sight": sight,
    "ult:choose": choose,
    "ult:after": after,
    "ult:lower": lower,
  },
};
