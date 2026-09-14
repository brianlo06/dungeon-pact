import type { Clip, Pose, Rig } from "../../battle/animation";
import { face } from "../../battle/face";

/**
 * Sunblind — the Gloomstalker's poses.
 *
 * The Hundredth Mark draws slowly, to the cheek, and holds. The Gloomstalker
 * never holds anything: it gets low, it puts its head in front of the sun,
 * it stands up on a roof edge and puts four arrows into the sky in one
 * breath, aimed high, so they come down out of the glare. Its bow is tipped
 * up at the sky in every draw.
 *
 * Parts: `bow` (the front arm and bow, from the front shoulder), `draw` (the
 * drawing arm, from the back shoulder), `arrow` (in the drawing hand),
 * `stringTop` and `stringBottom` (the bowstring's halves, nested in `bow`),
 * `head` (with the hood), `brow`, `eyes`, `mouth`, `cloak`, `quiver`, `body`,
 * `legs`. The Ranger faces right: forward is +x, and a negative rotation
 * swings an arm forward and up.
 */

type Part = Record<string, Pose[]>;
const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

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
  /** The bow arm: rotation (deg), offset (drawing hundredths). */
  bow: number;
  bowX?: number;
  bowY?: number;
  /** The drawing arm. */
  draw: number;
  drawX?: number;
  drawY?: number;
  /**
   * How far the arrow is on the string: 1 nocked and drawn (its shaft laid
   * through the grip, wherever the arms are), 0 not there.
   */
  nocked?: number;
  /** An arrow in the hand but not on the string: its own turn. */
  held?: number;
  /** String flutter after a loose, degrees. */
  flutter?: number;
}

/**
 * The parts for one moment of a draw, at `at`. When the arrow is nocked its
 * shaft is laid from the hand through the bow's grip and the string's halves
 * are turned and stretched to meet at its nock, wherever the two arms have
 * put them. Otherwise the string is straight (or shivering).
 */
function drawn(at: number, d: Draw): Part {
  const bx = (d.bowX ?? 0) * 100;
  const by = (d.bowY ?? 0) * 100;
  const dx = (d.drawX ?? 0) * 100;
  const dy = (d.drawY ?? 0) * 100;
  const nocked = d.nocked ?? 0;
  // The hand and the grip, in the figure's space.
  const [hx, hy] = rot([HAND[0] - BACK[0], HAND[1] - BACK[1]], d.draw);
  const hand: [number, number] = [BACK[0] + dx + hx, BACK[1] + dy + hy];
  const [gx, gy] = rot([GRIP[0] - FRONT[0], GRIP[1] - FRONT[1]], d.bow);
  const grip: [number, number] = [FRONT[0] + bx + gx, FRONT[1] + by + gy];
  const aim = deg(Math.atan2(grip[1] - hand[1], grip[0] - hand[0]));
  const reach = Math.hypot(grip[0] - hand[0], grip[1] - hand[1]);
  // Long enough that the head sits just past the grip.
  const scale = Math.max(1, (reach + 5) / 28);
  const arrow: Pose =
    nocked > 0
      ? { at, rotate: aim - d.draw - BASE, scale }
      : d.held !== undefined
        ? { at, rotate: d.held, scale: 1 }
        : { at, rotate: 0, scale: 0 };
  // The nock: four units behind the hand along the shaft.
  const [nx, ny] = rot([-4 * scale, 0], aim);
  const nockW: [number, number] = [hand[0] + nx, hand[1] + ny];
  // ...in the bow's own space, where the string lives.
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
 * A full draw aimed `elev` degrees above the body's level, with `pull` units
 * between the drawing hand and the grip. The bow is turned square to the
 * arrow, and the drawing arm is solved to put the hand on the arrow's line
 * behind the grip (the arm reaches as far as it can and the rest is carried
 * by the part's offset), so the arrow the solver lays through the grip is
 * the line the kid is aiming along.
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

/** Full draw, tipped up at the sky. `lift` tips it further. */
const HIGH = (lift = 0): Draw => aimed(30 + lift);
/** The hand gone back over the shoulder to the quiver, empty, the string straight. */
const REACH = (lift = 0): Draw => ({ ...aimed(30 + lift), draw: -242, drawX: -0.01, drawY: 0, nocked: 0, flutter: 0 });
/** The hand coming forward with a fresh arrow, not yet on the string. */
const FETCH = (lift = 0): Draw => ({ ...aimed(30 + lift), draw: -80, drawX: 0.03, drawY: 0.01, nocked: 0, held: 44 });

/* ── Clips ─────────────────────────────────────────────────────────────── */

/**
 * On the board: the kid drops low, pulls its hood down over its eyes with
 * the drawing hand, and brings the bow in against its body.
 */
const crouch: Clip = {
  duration: 420,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.35, x: -0.01, y: 0.028, rotate: 3, squash: 1.07 },
    { at: 1, x: -0.012, y: 0.024, rotate: 4, squash: 1.06 },
  ],
  parts: {
    head: [
      { at: 0, rotate: 0 },
      { at: 0.4, rotate: 9, y: 0.01 },
      { at: 1, rotate: 7, y: 0.01 },
    ],
    draw: [
      { at: 0, rotate: 0 },
      { at: 0.35, rotate: -150, x: 0.04, y: -0.05 },
      { at: 0.7, rotate: -140, x: 0.04, y: -0.045 },
      { at: 1, rotate: -30, x: 0.01 },
    ],
    arrow: [
      { at: 0, rotate: 0, scale: 1 },
      { at: 1, rotate: 0, scale: 1 },
    ],
    bow: [
      { at: 0, rotate: 0 },
      { at: 0.4, rotate: 10, x: -0.03 },
      { at: 1, rotate: 8, x: -0.025 },
    ],
    legs: [
      { at: 0, squash: 1 },
      { at: 0.35, squash: 1.12, y: 0.01 },
      { at: 1, squash: 1.1, y: 0.008 },
    ],
    cloak: turn([0, 0], [0.4, 8], [1, 5]),
  },
};

/**
 * The eclipse: the face close-up. Squinting hard against the glare, the
 * brow knit, the mouth tight; the head comes in front of the sun (the shot
 * slides the figure), and in its own shade the eyes open wide, the brow
 * lifts and the mouth goes up at one corner. Parts only: the shot's cue sets
 * `root: false`.
 */
const eclipse: Clip = {
  duration: 620,
  poses: [{ at: 0, x: 0, y: 0, rotate: 0 }],
  parts: {
    head: [
      { at: 0, rotate: 8, y: 0.004 },
      { at: 0.45, rotate: 4, y: 0.002 },
      { at: 0.7, rotate: -2, y: -0.002 },
      { at: 1, rotate: -3, y: -0.003 },
    ],
    ...face(
      // The glare.
      [0, { brow: 1.6, knit: 10, open: 0.22, mouth: 0.7, wide: 1.15 }],
      [0.4, { brow: 1.8, knit: 11, open: 0.18, mouth: 0.6, wide: 1.2 }],
      // In its own shade.
      [0.62, { brow: -0.8, knit: -2, open: 1.25, mouth: 0.9, wide: 1 }],
      [0.82, { brow: -1.1, knit: -3, open: 1.3, mouth: 1.15, wide: 1.25 }],
      [1, { brow: -0.9, knit: -2, open: 1.2, mouth: 1.2, wide: 1.3 }],
    ),
    bow: [
      { at: 0, rotate: 6, x: -0.02 },
      { at: 1, rotate: 4, x: -0.02 },
    ],
    cloak: turn([0, 4], [0.5, 9], [1, 6]),
  },
};

/**
 * On the roof edge, inside the sun: up out of the crouch, the bow raised
 * high, an arrow nocked and drawn, held there tipped at the sky.
 */
const rise: Clip = {
  duration: 1000,
  poses: [
    { at: 0, x: 0, y: 0.02, rotate: 3, squash: 1.05 },
    { at: 0.3, x: 0.005, y: -0.006, rotate: -2, squash: 0.98 },
    { at: 0.6, x: -0.01, y: 0, rotate: -9, squash: 1.01 },
    { at: 1, x: -0.012, y: 0, rotate: -10, squash: 1.01 },
  ],
  parts: {
    ...draws(
      [0, { bow: 8, bowX: -0.02, draw: -20, held: 0 }],
      [0.3, FETCH()],
      [0.62, HIGH()],
      [0.8, HIGH(1)],
      [1, HIGH(1.5)],
    ),
    head: turn([0, 6], [0.35, -6], [0.7, -14], [1, -15]),
    cloak: turn([0, 4], [0.35, -8], [0.7, -4], [1, -6]),
    quiver: turn([0, 0], [0.5, -3], [1, -2]),
    legs: [
      { at: 0, squash: 1.1, y: 0.008 },
      { at: 0.35, squash: 0.98 },
      { at: 1, squash: 1.03, y: 0.002 },
    ],
  },
};

/**
 * Four arrows in one breath, straight up at the sky: draw, loose, the hand
 * back to the quiver, draw again. Each loose rocks the kid back and snaps the
 * string straight. `release` is the first loose; the other three follow at a
 * quarter of the clip each.
 */
export const LOOSES = [0.16, 0.4, 0.64, 0.88];
const volleyKeys: [number, Draw][] = [[0, HIGH(0)]];
LOOSES.forEach((t, i) => {
  const lift = i * 2;
  volleyKeys.push(
    [t - 0.08, aimed(30 + lift, 24)],
    [t, aimed(30 + lift, 30)],
    // Loosed: the arrow gone, the string straight and shivering, the hand
    // flying back past the ear on its way to the quiver.
    [t + 0.012, { ...REACH(lift), draw: -150, drawX: 0.0, drawY: -0.07, flutter: 8 }],
    [t + 0.05, { ...REACH(lift), flutter: -4 }],
    // The fresh arrow comes out over the shoulder, hidden until the hand is past the face.
    [t + 0.08, { ...REACH(lift), draw: -176, drawY: -0.03, flutter: 2 }],
    [t + 0.1, { ...FETCH(lift), flutter: 1 }],
  );
});
volleyKeys.push([1, { ...FETCH(8), held: 30, flutter: 0 }]);

const volley: Clip = {
  duration: 560,
  markers: { release: LOOSES[0] },
  poses: [
    { at: 0, x: -0.01, y: 0, rotate: -10, squash: 1.01 },
    ...LOOSES.flatMap((t) => [
      { at: t, x: -0.012, y: 0, rotate: -10, squash: 1.01 },
      { at: t + 0.03, x: -0.026, y: 0.004, rotate: -13, squash: 0.98 },
      { at: Math.min(0.99, t + 0.11), x: -0.016, y: 0.002, rotate: -11, squash: 1 },
    ]),
    { at: 1, x: -0.018, y: 0.002, rotate: -12, squash: 1 },
  ],
  parts: {
    ...draws(...volleyKeys),
    head: turn([0, -14], [0.5, -16], [1, -18]),
    cloak: turn(...LOOSES.flatMap((t): [number, number][] => [[t, -4], [t + 0.05, -14]]), [1, -8]),
    quiver: turn(...LOOSES.flatMap((t): [number, number][] => [[t + 0.04, -3], [t + 0.1, 4]]), [1, 0]),
    ...face(
      [0, { brow: 0.6, knit: 5, open: 0.75, mouth: 0.8 }],
      [0.5, { brow: 0.8, knit: 6, open: 0.7, mouth: 0.75 }],
      [1, { brow: -0.4, knit: 0, open: 1.1, mouth: 1.3, wide: 1.2 }],
    ),
    legs: [
      { at: 0, squash: 1.03 },
      { at: 1, squash: 1.04 },
    ],
  },
};

/**
 * Far off in the sun at the moment the volley lands: the bow still up, the
 * drawing hand open by the ear. Its `contact` is the arrival, not the loose.
 */
const after: Clip = {
  duration: 760,
  markers: { contact: 0.08 },
  poses: [
    { at: 0, x: -0.012, y: 0, rotate: -6 },
    { at: 1, x: -0.004, y: 0, rotate: -2 },
  ],
  parts: {
    ...draws(
      [0, { ...REACH(4), draw: -130, drawX: -0.02, drawY: -0.06 }],
      [1, { bow: -20, draw: -60, flutter: 0 }],
    ),
    head: turn([0, -12], [1, -6]),
  },
};

/** On the board again: stands, lets the bow down, and pushes the hood back off its face. */
const lower: Clip = {
  duration: 740,
  poses: [
    { at: 0, x: -0.012, y: 0.024, rotate: 4, squash: 1.06 },
    { at: 0.35, x: 0, y: -0.006, rotate: -1.5, squash: 0.98 },
    { at: 1, x: 0, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    head: [
      { at: 0, rotate: 7, y: 0.01 },
      { at: 0.45, rotate: -6, y: -0.004 },
      { at: 1, rotate: 0, y: 0 },
    ],
    draw: [
      { at: 0, rotate: -30, x: 0.01 },
      { at: 0.35, rotate: -155, x: 0.03, y: -0.06 },
      { at: 0.6, rotate: -150, x: 0.02, y: -0.06 },
      { at: 1, rotate: 0, x: 0, y: 0 },
    ],
    bow: [
      { at: 0, rotate: 8, x: -0.025 },
      { at: 0.5, rotate: -3, x: 0 },
      { at: 1, rotate: 0, x: 0 },
    ],
    legs: [
      { at: 0, squash: 1.1, y: 0.008 },
      { at: 0.4, squash: 0.98 },
      { at: 1, squash: 1 },
    ],
    cloak: turn([0, 5], [0.45, -7], [1, 0]),
    quiver: turn([0, 0], [0.5, 3], [1, 0]),
  },
};

export const poses: Record<string, Rig> = {
  ranger: {
    "ult:sb-crouch": crouch,
    "ult:sb-eclipse": eclipse,
    "ult:sb-rise": rise,
    "ult:sb-volley": volley,
    "ult:sb-after": after,
    "ult:sb-lower": lower,
  },
};
