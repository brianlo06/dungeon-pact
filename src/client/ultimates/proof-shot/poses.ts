import type { Clip, Pose, Rig } from "../../battle/animation";
import { face } from "../../battle/face";

/**
 * Proof Shot — the Sharpshooter's poses.
 *
 * The Hundredth Mark draws slowly and chooses; the Gloomstalker never holds
 * anything. The Sharpshooter is the still one. It steps back, not forward.
 * It opens its drawing hand and lets a pinch of grit go to read the wind. It
 * holds its thumb up at arm's length and the target is the size of the
 * thumbnail. At full draw it closes its eyes, breathes out, opens them, and
 * looses twice in one breath, flat, along the range. Every shot here is
 * level: the bow is never tipped at the sky.
 *
 * Parts: `bow` (the front arm and bow, from the front shoulder), `draw` (the
 * drawing arm, from the back shoulder), `arrow` (in the drawing hand),
 * `stringTop` and `stringBottom` (the bowstring's halves, nested in `bow`),
 * `head` (with the hood), `brow`, `eyes`, `mouth`, `cloak`, `quiver`, `body`,
 * `legs`, and the close-up hands `open` and `thumb` (drawn in `Ranger.tsx`
 * over the mitten, shown only where the film sets `--ps-open` / `--ps-thumb`,
 * and scaled up here when the hand opens or closes). The Ranger faces right:
 * forward is +x, and a negative rotation swings an arm forward and up.
 */

type Part = Record<string, Pose[]>;
const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));
const grow = (...keys: [number, number][]): Pose[] => keys.map(([at, scale]) => ({ at, scale }));

/* ── The draw, solved ─────────────────────────────────────────────────── */

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
/** Rotate a vector clockwise (SVG's positive) by `d` degrees. */
const rot = ([x, y]: [number, number], d: number): [number, number] => {
  const c = Math.cos(rad(d));
  const s = Math.sin(rad(d));
  return [x * c - y * s, x * s + y * c];
};

/** Joints in the drawing's units (see `components/heroes/Ranger.tsx`). */
const FRONT: [number, number] = [60, 50];
const BACK: [number, number] = [37, 50];
const HAND: [number, number] = [35, 64];
const GRIP: [number, number] = [76.5, 58.5];
const TOP: [number, number] = [67.5, 23.5];
const LOW: [number, number] = [67.5, 92];
/** The string's middle, where its two halves meet at rest. */
const MID = 57.75;
/** The drawn arrow's base turn, inside the `arrow` part. */
const BASE = 12;

/** One held moment of a draw. */
interface Draw {
  bow: number;
  bowX?: number;
  bowY?: number;
  draw: number;
  drawX?: number;
  drawY?: number;
  /** 1: nocked and drawn, the shaft laid through the grip; 0: not on the string. */
  nocked?: number;
  /** An arrow in the hand but not on the string: its own turn. */
  held?: number;
  /** String flutter after a loose, degrees. */
  flutter?: number;
}

/**
 * The parts for one moment of a draw, at `at`. Nocked, the shaft is laid
 * from the hand through the bow's grip and the string's halves are turned
 * and stretched to meet at its nock, wherever the arms have put them.
 * Otherwise the string is straight, or shivering after a loose.
 */
function drawn(at: number, d: Draw): Part {
  const bx = (d.bowX ?? 0) * 100;
  const by = (d.bowY ?? 0) * 100;
  const dx = (d.drawX ?? 0) * 100;
  const dy = (d.drawY ?? 0) * 100;
  const nocked = d.nocked ?? 0;
  const [hx, hy] = rot([HAND[0] - BACK[0], HAND[1] - BACK[1]], d.draw);
  const hand: [number, number] = [BACK[0] + dx + hx, BACK[1] + dy + hy];
  const [gx, gy] = rot([GRIP[0] - FRONT[0], GRIP[1] - FRONT[1]], d.bow);
  const grip: [number, number] = [FRONT[0] + bx + gx, FRONT[1] + by + gy];
  const aim = deg(Math.atan2(grip[1] - hand[1], grip[0] - hand[0]));
  const reach = Math.hypot(grip[0] - hand[0], grip[1] - hand[1]);
  const scale = Math.max(1, (reach + 5) / 28);
  const arrow: Pose =
    nocked > 0
      ? { at, rotate: aim - d.draw - BASE, scale }
      : d.held !== undefined
        ? { at, rotate: d.held, scale: 1 }
        : { at, rotate: 0, scale: 0 };
  const [nx, ny] = rot([-4 * scale, 0], aim);
  const nockW: [number, number] = [hand[0] + nx, hand[1] + ny];
  const [lx, ly] = rot([nockW[0] - FRONT[0] - bx, nockW[1] - FRONT[1] - by], -d.bow);
  const nock: [number, number] = [FRONT[0] + lx, FRONT[1] + ly];
  const half = (tip: [number, number], rest: number, sign: 1 | -1): Pose => {
    if (nocked <= 0) return { at, rotate: d.flutter ? d.flutter * sign : 0, scale: 1, squash: 1 };
    const vx = nock[0] - tip[0];
    const vy = nock[1] - tip[1];
    const len = Math.hypot(vx, vy);
    const angle = deg(Math.atan2(vy, vx)) - (sign > 0 ? 90 : -90);
    const k = len / rest;
    return { at, rotate: angle, scale: Math.sqrt(k), squash: 1 / Math.sqrt(k) };
  };
  return {
    bow: [{ at, rotate: d.bow, x: d.bowX ?? 0, y: d.bowY ?? 0 }],
    draw: [{ at, rotate: d.draw, x: d.drawX ?? 0, y: d.drawY ?? 0 }],
    arrow: [arrow],
    stringTop: [half(TOP, MID - TOP[1], 1)],
    stringBottom: [half(LOW, LOW[1] - MID, -1)],
  };
}

/** Several moments, merged into part tracks. */
function draws(...keys: [number, Draw][]): Part {
  const out: Part = {};
  for (const [at, d] of keys)
    for (const [name, poses] of Object.entries(drawn(at, d))) (out[name] ??= []).push(...poses);
  return out;
}

/**
 * A full draw aimed `elev` degrees above level with `pull` units between the
 * drawing hand and the grip: the bow square to the line, the drawing arm
 * solved to put the hand on the line behind the grip.
 */
function aimed(elev: number, pull = 28, bowX = 0.06, bowY = -0.05): Draw {
  const bow = -10 - elev;
  const [gx, gy] = rot([GRIP[0] - FRONT[0], GRIP[1] - FRONT[1]], bow);
  const grip: [number, number] = [FRONT[0] + bowX * 100 + gx, FRONT[1] + bowY * 100 + gy];
  const hand: [number, number] = [grip[0] - pull * Math.cos(rad(elev)), grip[1] + pull * Math.sin(rad(elev))];
  const vx = hand[0] - BACK[0];
  const vy = hand[1] - BACK[1];
  const arm = Math.hypot(HAND[0] - BACK[0], HAND[1] - BACK[1]);
  const angle = Math.atan2(vy, vx);
  const rest = Math.atan2(HAND[1] - BACK[1], HAND[0] - BACK[0]);
  const reach = Math.min(arm, Math.hypot(vx, vy));
  return {
    bow,
    bowX,
    bowY,
    draw: deg(angle - rest),
    drawX: (vx - reach * Math.cos(angle)) / 100,
    drawY: (vy - reach * Math.sin(angle)) / 100,
    nocked: 1,
  };
}

/** The Sharpshooter's draw: flat along the range, a hair under level. */
const LEVEL = (pull = 28): Draw => aimed(-2, pull);
/** The hand gone back over the shoulder to the quiver, empty, the string straight. */
const REACH: Draw = { ...LEVEL(), draw: -242, drawX: -0.01, drawY: 0, nocked: 0, flutter: 0 };
/** The hand coming forward with a fresh arrow, not yet on the string. */
const FETCH: Draw = { ...LEVEL(), draw: -80, drawX: 0.03, drawY: 0.01, nocked: 0, held: 44 };
/** Just loosed: the arrow gone, the string shivering, the hand flying back past the ear. */
const LOOSED = (flutter: number): Draw => ({ ...REACH, draw: -150, drawX: 0, drawY: -0.07, flutter });
/** The follow-through held: the hand open by the ear. */
const AFTER: Draw = { ...REACH, draw: -140, drawX: -0.02, drawY: -0.06, flutter: 0 };

/* ── Clips ─────────────────────────────────────────────────────────────── */

/**
 * On the board: half a pace back, the weight onto the back foot, and the bow
 * brought up level. A marksman steps away from what it is about to hit.
 */
const step: Clip = {
  duration: 420,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.4, x: -0.03, y: -0.006, rotate: -1, squash: 0.985 },
    { at: 0.7, x: -0.05, y: 0.004, rotate: -2, squash: 1.02 },
    { at: 1, x: -0.05, y: 0.003, rotate: -1.6, squash: 1.015 },
  ],
  parts: {
    bow: [
      { at: 0, rotate: 0, x: 0, y: 0 },
      { at: 0.5, rotate: -6, x: 0.015, y: -0.012 },
      { at: 1, rotate: -9, x: 0.02, y: -0.014 },
    ],
    draw: [
      { at: 0, rotate: 0, x: 0 },
      { at: 0.55, rotate: -14, x: 0.01 },
      { at: 1, rotate: -22, x: 0.015 },
    ],
    arrow: turn([0, 0], [0.55, 10], [1, 16]),
    head: turn([0, 0], [0.4, -3], [1, 2]),
    legs: [
      { at: 0, squash: 1 },
      { at: 0.4, squash: 0.98 },
      { at: 0.8, squash: 1.04, y: 0.004 },
      { at: 1, squash: 1.03, y: 0.003 },
    ],
    cloak: turn([0, 0], [0.4, 6], [0.8, -3], [1, -2]),
    quiver: turn([0, 0], [0.5, 2], [1, 0]),
  },
};

/**
 * The wind read: the drawing hand comes out low in front of the hip and
 * opens, and the fingers let a pinch of grit go. The head tips down to
 * watch which way it blows. Parts only: the cue sets `root: false`.
 */
const wind: Clip = {
  duration: 560,
  poses: [{ at: 0, x: 0, y: 0, rotate: 0 }],
  parts: {
    draw: [
      { at: 0, rotate: -12, x: 0.005, y: 0 },
      { at: 0.22, rotate: -36, x: 0.014, y: 0.004 },
      { at: 0.6, rotate: -34, x: 0.014, y: 0.004 },
      { at: 1, rotate: -31, x: 0.012, y: 0.003 },
    ],
    arrow: grow([0, 0], [1, 0]),
    open: grow([0, 0.4], [0.16, 0.4], [0.28, 1.06], [0.36, 1], [1, 1]),
    bow: [
      { at: 0, rotate: 5, x: -0.012, y: 0.004 },
      { at: 1, rotate: 4, x: -0.012, y: 0.004 },
    ],
    head: [
      { at: 0, rotate: 4, y: 0.003 },
      { at: 0.4, rotate: 9, y: 0.006 },
      { at: 1, rotate: 8, y: 0.006 },
    ],
    ...face(
      [0, { brow: 0.3, knit: 2, open: 0.8, mouth: 0.8 }],
      [0.5, { brow: 0.5, knit: 3, open: 0.6, mouth: 0.75 }],
      [1, { brow: 0.4, knit: 3, open: 0.65, mouth: 0.75 }],
    ),
    cloak: turn([0, 2], [0.5, 5], [1, 4]),
  },
};

/**
 * The range: side-on, the arm straight out with the thumb up and one eye
 * on it — the target at the far end is the size of the thumbnail — then the
 * arm drops, the hand goes back to the quiver, comes forward with an arrow,
 * nocks it and draws flat to the cheek. Played at a wide shot's size.
 */
const range: Clip = {
  duration: 1000,
  poses: [
    { at: 0, x: 0, y: 0, rotate: -0.5, squash: 1.005 },
    { at: 0.14, x: -0.008, y: 0.002, rotate: -2.5, squash: 1.015 },
    { at: 0.5, x: -0.01, y: 0.002, rotate: -2.5, squash: 1.015 },
    { at: 0.62, x: -0.004, y: 0, rotate: -1, squash: 1 },
    { at: 0.82, x: 0.01, y: 0.003, rotate: 1, squash: 1.01 },
    { at: 1, x: 0.012, y: 0.004, rotate: 1.2, squash: 1.012 },
  ],
  parts: {
    ...draws(
      [0, { bow: 6, bowX: -0.02, bowY: 0.006, draw: -30, drawX: 0.01 }],
      [0.14, { bow: 4, bowX: -0.02, bowY: 0.004, draw: -92, drawX: 0.024, drawY: -0.012 }],
      [0.48, { bow: 4, bowX: -0.02, bowY: 0.004, draw: -93, drawX: 0.024, drawY: -0.012 }],
      [0.6, REACH],
      [0.7, FETCH],
      [0.82, LEVEL(20)],
      [0.92, LEVEL(28)],
      [1, LEVEL(28)],
    ),
    thumb: grow([0, 0], [0.08, 0], [0.16, 1.04], [0.22, 1], [0.5, 1], [0.56, 0], [1, 0]),
    head: turn([0, -2], [0.16, -5], [0.5, -5], [0.62, 0], [0.8, 4], [1, 5.5]),
    ...face(
      [0, { brow: 0.2, knit: 2, open: 0.8, mouth: 0.8 }],
      [0.18, { brow: 0.6, knit: 5, open: 0.4, mouth: 0.75 }],
      [0.5, { brow: 0.6, knit: 5, open: 0.4, mouth: 0.75 }],
      [0.66, { brow: 0, knit: 1, open: 0.9, mouth: 0.8 }],
      [1, { brow: 0.6, knit: 5, open: 0.55, mouth: 0.75 }],
    ),
    cloak: turn([0, 2], [0.2, -4], [0.5, -3], [0.66, -8], [0.85, -6], [1, -7]),
    quiver: turn([0, 0], [0.6, -4], [0.7, 3], [0.8, -1], [1, 0]),
    legs: [
      { at: 0, squash: 1 },
      { at: 0.16, squash: 1.03, y: 0.003 },
      { at: 0.62, squash: 1 },
      { at: 1, squash: 1.02, y: 0.002 },
    ],
  },
};

/**
 * The breath: the face close-up. At full draw, held; the eyes narrow, then
 * close; the breath goes out through a small mouth and the mouth shuts; the
 * eyes open calm. Then the loose (the string past the cheek, the head
 * knocked back a hair), the hand to the quiver, a second arrow nocked and
 * drawn and loosed, all in the same breath. Parts only: `root: false`.
 */
export const LOOSES = [0.66, 0.9];
const breath: Clip = {
  duration: 600,
  markers: { release: LOOSES[0] },
  poses: [{ at: 0, x: 0, y: 0, rotate: 0 }],
  parts: {
    ...draws(
      [0, LEVEL(28)],
      [0.3, LEVEL(28.4)],
      [0.58, LEVEL(28.8)],
      [LOOSES[0], LEVEL(29.5)],
      [LOOSES[0] + 0.012, LOOSED(8)],
      [LOOSES[0] + 0.05, { ...REACH, flutter: -4 }],
      [LOOSES[0] + 0.09, { ...REACH, draw: -176, drawY: -0.03, flutter: 2 }],
      [LOOSES[0] + 0.12, { ...FETCH, flutter: 1 }],
      [0.84, LEVEL(22)],
      [LOOSES[1], LEVEL(29.5)],
      [LOOSES[1] + 0.012, LOOSED(7)],
      [LOOSES[1] + 0.05, { ...REACH, flutter: -3 }],
      [1, AFTER],
    ),
    head: [
      { at: 0, rotate: 5, y: 0.004 },
      { at: 0.3, rotate: 5.4, y: 0.003 },
      { at: 0.58, rotate: 5.4, y: 0.004 },
      { at: LOOSES[0], rotate: 5.6, y: 0.004 },
      { at: LOOSES[0] + 0.03, rotate: 2.5, y: 0.001 },
      { at: 0.78, rotate: 5, y: 0.004 },
      { at: LOOSES[1], rotate: 5.6, y: 0.004 },
      { at: LOOSES[1] + 0.03, rotate: 2.5, y: 0.001 },
      { at: 1, rotate: 3.5, y: 0.002 },
    ],
    // The chest rises on the breath in and falls on the breath out.
    body: [
      { at: 0, y: 0 },
      { at: 0.26, y: -0.005 },
      { at: 0.5, y: 0.001 },
      { at: 1, y: 0 },
    ],
    ...face(
      // Reading the far thing through the wind: narrowed.
      [0, { brow: 0.6, knit: 5, open: 0.55, mouth: 0.8 }],
      [0.2, { brow: 0.8, knit: 5, open: 0.5, mouth: 0.8 }],
      // The eyes close.
      [0.3, { brow: 0.2, knit: 2, open: 0.08, mouth: 0.7 }],
      // The breath goes out through a small mouth...
      [0.4, { brow: 0.1, knit: 1, open: 0.06, mouth: 1.15, wide: 0.82 }],
      // ...and the mouth shuts.
      [0.5, { brow: -0.2, knit: 0, open: 0.05, mouth: 0.6 }],
      // The eyes open, calm and clear.
      [0.58, { brow: -0.3, knit: 0, open: 0.95, mouth: 0.6 }],
      [LOOSES[0], { brow: -0.3, knit: 0, open: 0.95, mouth: 0.6 }],
      [LOOSES[0] + 0.03, { brow: -0.1, knit: 0, open: 0.8, mouth: 0.6 }],
      [0.8, { brow: -0.3, knit: 0, open: 0.92, mouth: 0.6 }],
      [LOOSES[1] + 0.03, { brow: -0.1, knit: 0, open: 0.8, mouth: 0.6 }],
      [1, { brow: -0.4, knit: -1, open: 0.95, mouth: 0.75 }],
    ),
    cloak: turn([0, -7], [0.5, -8], [LOOSES[0] + 0.05, -15], [0.8, -9], [LOOSES[1] + 0.05, -14], [1, -10]),
    quiver: turn([0, 0], [LOOSES[0] + 0.04, -3], [LOOSES[0] + 0.1, 3], [0.84, 0], [LOOSES[1] + 0.04, -2], [1, 0]),
  },
};

/**
 * A speck at the far end of the lane as the arrows arrive: the bow still up,
 * the drawing hand open by the ear, the rock back from two looses settling.
 * Its `contact` is the first arrival, not the loose.
 */
const after: Clip = {
  duration: 760,
  markers: { contact: 0.06 },
  poses: [
    { at: 0, x: -0.02, y: 0, rotate: -3 },
    { at: 0.5, x: -0.012, y: 0, rotate: -1.5 },
    { at: 1, x: -0.008, y: 0, rotate: -1 },
  ],
  parts: {
    ...draws([0, AFTER], [0.6, { ...AFTER, draw: -130, drawX: -0.02, drawY: -0.055 }], [1, { bow: -8, bowX: 0.03, bowY: -0.03, draw: -70, drawX: 0, flutter: 0 }]),
    head: turn([0, 3], [1, 1]),
  },
};

/** On the board again: the bow comes down, the drawing hand shakes out, and the kid steps back up. */
const lower: Clip = {
  duration: 740,
  poses: [
    { at: 0, x: -0.05, y: 0.003, rotate: -1.6, squash: 1.015 },
    { at: 0.45, x: -0.02, y: -0.004, rotate: 0.5, squash: 0.99 },
    { at: 1, x: 0, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    bow: [
      { at: 0, rotate: -9, x: 0.02, y: -0.014 },
      { at: 0.4, rotate: 3, x: 0.005, y: 0.004 },
      { at: 1, rotate: 0, x: 0, y: 0 },
    ],
    draw: [
      { at: 0, rotate: -70, x: 0, y: -0.02 },
      { at: 0.2, rotate: -40, x: 0.005 },
      { at: 0.32, rotate: -58, x: 0.005 },
      { at: 0.44, rotate: -36 },
      { at: 0.56, rotate: -50 },
      { at: 0.7, rotate: -20 },
      { at: 1, rotate: 0, x: 0, y: 0 },
    ],
    arrow: [
      { at: 0, rotate: 0, scale: 0 },
      { at: 0.7, rotate: 0, scale: 0 },
      { at: 0.85, rotate: 0, scale: 1 },
      { at: 1, rotate: 0, scale: 1 },
    ],
    head: turn([0, 2], [0.4, -3], [1, 0]),
    legs: [
      { at: 0, squash: 1.03, y: 0.003 },
      { at: 0.45, squash: 0.985 },
      { at: 1, squash: 1 },
    ],
    cloak: turn([0, -2], [0.45, 5], [1, 0]),
    quiver: turn([0, 0], [0.5, 2], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  ranger: {
    "ult:ps-step": step,
    "ult:ps-wind": wind,
    "ult:ps-range": range,
    "ult:ps-breath": breath,
    "ult:ps-after": after,
    "ult:ps-lower": lower,
  },
};
