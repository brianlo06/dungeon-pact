import type { Clip, Pose, Rig } from "../../battle/animation";
import { face } from "../../battle/face";

/**
 * False Footing — the Pathfinder's poses.
 *
 * The combat rig's Ranger stands low and never lunges; the Pathfinder goes
 * lower still. These are the poses of someone reading ground, not sighting
 * down an arrow: down on one knee with the bow laid across, the drawing hand
 * on the snow; head up to follow a trail; a face that works out where a foot
 * will fall and then waits for it; and one explosive movement, the whole
 * body thrown back on a cord.
 *
 * Parts: `bow` (the front arm and bow, from the front shoulder), `draw` (the
 * drawing arm, from the back shoulder; its hand is at drawing (35, 64)),
 * `arrow` (in the drawing hand), `stringTop` and `stringBottom` (nested in
 * `bow`; left at rest, so the string simply rides the bow), `head`, `brow`,
 * `eyes`, `mouth`, `cloak`, `quiver`, `body`, `legs`. The Ranger faces right:
 * forward is +x, and a negative rotation of `draw` swings the hand forward.
 *
 * The kneel is built from parts, not the root: the legs fold (a squash about
 * the boots) and everything above them comes down onto them, so the boots
 * stay on the ground in every shot. Root keys are authored for the shots
 * that move the whole figure (`kneel` and `coil` on the battlefield, `haul`
 * in the impact's wide); the close-ups (`touch`, `know`) keep the root still
 * and their cues set `root: false`.
 */

type Part = Record<string, Pose[]>;
const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/** How far everything above the legs comes down in the kneel, drawing hundredths. */
const DROP = 0.13;
/** Kneeling legs: folded to 55% of their height about the boots, and a touch wider. */
const KNEEL_LEGS: Pose = { at: 0, x: 0.01, y: 0.03, scale: Math.sqrt(1.12 * 0.55), squash: Math.sqrt(1.12 / 0.55) };

/** Everything above the legs, lowered by `k` of the kneel and leant forward `lean` units. */
function upper(at: number, k: number, lean = 0): Part {
  const y = DROP * k;
  const x = lean;
  return {
    body: [{ at, y, x, rotate: 7 * k }],
    cloak: [{ at, y, x: x - 0.01 * k }],
    quiver: [{ at, y, x }],
  };
}

/** Merge several part maps, key by key, in order. */
function merge(...maps: Part[]): Part {
  const out: Part = {};
  for (const m of maps) for (const [name, poses] of Object.entries(m)) (out[name] ??= []).push(...poses);
  for (const poses of Object.values(out)) poses.sort((a, b) => a.at - b.at);
  return out;
}

const legs = (...keys: [number, number][]): Pose[] =>
  keys.map(([at, k]) => ({
    at,
    x: KNEEL_LEGS.x! * k,
    y: KNEEL_LEGS.y! * k,
    scale: 1 + (KNEEL_LEGS.scale! - 1) * k,
    squash: 1 + (KNEEL_LEGS.squash! - 1) * k,
  }));

/** The eyes' track from `face()`, with a sideways glance written into x. */
const glance = (...keys: [number, number, number][]): Pose[] =>
  keys.map(([at, open, x]) => ({ ...face([at, { open }]).eyes[0], x }));

/* ── Clips ─────────────────────────────────────────────────────────────── */

/**
 * On the battlefield, as the round stops: the kid drops onto one knee, lays
 * the bow down across the body and puts the drawing hand flat on the floor.
 * The head goes down to look at what is there.
 */
const kneel: Clip = {
  duration: 460,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.35, x: 0.01, y: 0.01, rotate: 5, squash: 1.04 },
    { at: 0.7, x: 0.02, y: 0.012, rotate: 7, squash: 1.03 },
    { at: 1, x: 0.02, y: 0.01, rotate: 6.5, squash: 1.02 },
  ],
  parts: merge(upper(0, 0), upper(0.4, 0.9, 0.02), upper(1, 1, 0.03), {
    legs: legs([0, 0], [0.4, 0.9], [1, 1]),
    head: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.4, rotate: 12, y: DROP * 0.9, x: 0.02 },
      { at: 1, rotate: 16, y: DROP, x: 0.035 },
    ],
    bow: [
      { at: 0, rotate: 0, x: 0, y: 0 },
      { at: 0.4, rotate: 38, x: 0.01, y: DROP * 0.9 },
      { at: 1, rotate: 48, x: 0.02, y: DROP + 0.02 },
    ],
    draw: [
      { at: 0, rotate: 0, x: 0, y: 0 },
      { at: 0.4, rotate: -30, x: 0.04, y: DROP * 0.9 },
      { at: 1, rotate: -24, x: 0.07, y: DROP + 0.06 },
    ],
    arrow: [
      { at: 0, rotate: 0, scale: 1 },
      { at: 0.3, rotate: 0, scale: 0 },
      { at: 1, rotate: 0, scale: 0 },
    ],
  }),
};

/**
 * The read, at the size of a hand. Held on one knee: the drawing hand comes
 * down onto the rim of the print and slides along it, stops, presses. The
 * head is down over it. Parts only.
 */
const touch: Clip = {
  duration: 680,
  poses: [{ at: 0 }, { at: 1 }],
  parts: merge(upper(0, 1, 0.03), upper(1, 1, 0.035), {
    legs: legs([0, 1], [1, 1]),
    head: [
      { at: 0, rotate: 14, y: DROP, x: 0.035 },
      { at: 1, rotate: 18, y: DROP + 0.005, x: 0.04 },
    ],
    bow: [
      { at: 0, rotate: 48, x: 0.02, y: DROP + 0.02 },
      { at: 1, rotate: 49, x: 0.02, y: DROP + 0.02 },
    ],
    // Reached out past the knee (the arm drawn a little long: the shoulder is
    // out of the frame) and down onto the print's far rim, sliding along it.
    draw: [
      { at: 0, rotate: -75, x: 0.22, y: DROP + 0.02, scale: 1.25 },
      { at: 0.32, rotate: -46, x: 0.25, y: DROP + 0.09, scale: 1.25 },
      { at: 0.62, rotate: -38, x: 0.27, y: DROP + 0.1, scale: 1.25 },
      { at: 0.8, rotate: -37, x: 0.275, y: DROP + 0.105, scale: 1.25 },
      { at: 1, rotate: -37.5, x: 0.275, y: DROP + 0.107, scale: 1.25 },
    ],
    arrow: [
      { at: 0, rotate: 0, scale: 0 },
      { at: 1, rotate: 0, scale: 0 },
    ],
    cloak: turn([0, -3], [1, -5]),
  }),
};

/**
 * Seen from above: still on one knee, head up and following the trail across
 * the field, the cord gathered in the drawing hand at the hip. A breath lifts
 * the shoulders; the cloak stirs. Loops.
 */
const watch: Clip = {
  duration: 1000,
  loop: true,
  poses: [
    { at: 0, x: 0.01, y: 0.005, rotate: 2 },
    { at: 0.5, x: 0.01, y: 0.002, rotate: 1.4 },
    { at: 1, x: 0.01, y: 0.005, rotate: 2 },
  ],
  parts: merge(upper(0, 1, 0.01), upper(0.5, 0.96, 0.01), upper(1, 1, 0.01), {
    legs: legs([0, 1], [1, 1]),
    head: [
      { at: 0, rotate: -4, y: DROP, x: 0.01 },
      { at: 0.5, rotate: -6, y: DROP - 0.004, x: 0.012 },
      { at: 1, rotate: -4, y: DROP, x: 0.01 },
    ],
    bow: [
      { at: 0, rotate: 40, x: 0.01, y: DROP + 0.02 },
      { at: 1, rotate: 40, x: 0.01, y: DROP + 0.02 },
    ],
    draw: [
      { at: 0, rotate: -48, x: 0.03, y: DROP + 0.01 },
      { at: 0.5, rotate: -50, x: 0.03, y: DROP + 0.006 },
      { at: 1, rotate: -48, x: 0.03, y: DROP + 0.01 },
    ],
    arrow: [
      { at: 0, rotate: 0, scale: 0 },
      { at: 1, rotate: 0, scale: 0 },
    ],
    cloak: turn([0, -2], [0.4, -6], [1, -2]),
  }),
};

/**
 * It knows. Low behind the drift with the cord wound in its fist: the brow
 * knits and the eyes narrow and glance along the trail and back; the breath
 * clouds come — out, out — and then stop, held; the brow lifts and a slow,
 * sure grin spreads. The head settles down into the hood. Parts only.
 */
const know: Clip = {
  duration: 580,
  poses: [{ at: 0 }, { at: 1 }],
  parts: merge(upper(0, 1, 0.01), upper(1, 1, 0.012), {
    legs: legs([0, 1], [1, 1]),
    head: [
      { at: 0, rotate: -3, y: DROP, x: 0.01 },
      { at: 0.3, rotate: -1.5, y: DROP + 0.002, x: 0.012 },
      { at: 0.62, rotate: 2, y: DROP + 0.006, x: 0.012 },
      { at: 1, rotate: 3, y: DROP + 0.008, x: 0.012 },
    ],
    ...face(
      // Reading: brow knit, eyes narrowed.
      [0, { brow: 0.9, knit: 7, open: 0.55, mouth: 0.8 }],
      [0.3, { brow: 1, knit: 8, open: 0.45, mouth: 0.7 }],
      // Found it: the breath is held, the eyes open a hair.
      [0.58, { brow: 0.2, knit: 3, open: 0.8, mouth: 0.35, wide: 0.85 }],
      // Got you.
      [0.85, { brow: -1.4, knit: -3, open: 0.66, mouth: 1.7, wide: 1.55 }],
      [1, { brow: -1.5, knit: -3.5, open: 0.62, mouth: 1.8, wide: 1.62 }],
    ),
    // The glance: the eyes slide along the trail and come back.
    eyes: glance(
      [0, 0.55, 0],
      [0.3, 0.45, 0.016],
      [0.58, 0.8, -0.004],
      [0.85, 0.62, 0],
      [1, 0.6, 0],
    ),
    // The bow laid down flat across the knee, out of the face's way.
    bow: [
      { at: 0, rotate: 72, x: 0.02, y: DROP + 0.06 },
      { at: 1, rotate: 73, x: 0.02, y: DROP + 0.06 },
    ],
    // The fist with the cord wound in it, low behind the drift.
    draw: [
      { at: 0, rotate: -54, x: 0.05, y: DROP },
      { at: 0.58, rotate: -58, x: 0.045, y: DROP - 0.004 },
      { at: 1, rotate: -60, x: 0.04, y: DROP - 0.006 },
    ],
    arrow: [
      { at: 0, rotate: 0, scale: 0 },
      { at: 1, rotate: 0, scale: 0 },
    ],
    cloak: turn([0, -3], [1, -4]),
  }),
};

/**
 * The haul, in the impact's wide. From the crouch the whole body is thrown
 * back on the cord: the root rocks back and down, the drawing arm is ripped
 * back past the hip, the bow arm flies out for balance and the head snaps
 * back. Its `contact` is the instant the cord comes taut.
 */
const haul: Clip = {
  duration: 700,
  markers: { contact: 0.057 },
  poses: [
    { at: 0, x: 0.03, y: 0.01, rotate: 7, squash: 1.03 },
    { at: 0.057, x: -0.02, y: 0.012, rotate: -6, squash: 0.97 },
    { at: 0.2, x: -0.075, y: 0.016, rotate: -15, squash: 0.95 },
    { at: 0.5, x: -0.085, y: 0.014, rotate: -16, squash: 0.96 },
    { at: 1, x: -0.08, y: 0.012, rotate: -13, squash: 0.97 },
  ],
  parts: merge(upper(0, 1, 0.03), upper(0.2, 0.8, -0.02), upper(1, 0.8, -0.02), {
    legs: [
      ...legs([0, 1]),
      { at: 0.2, x: -0.01, y: 0.02, scale: 0.86, squash: 1.2, rotate: -8 },
      { at: 1, x: -0.01, y: 0.02, scale: 0.87, squash: 1.18, rotate: -7 },
    ],
    head: [
      { at: 0, rotate: 8, y: DROP, x: 0.03 },
      { at: 0.057, rotate: -2, y: DROP * 0.9, x: 0 },
      { at: 0.25, rotate: -14, y: DROP * 0.8, x: -0.03 },
      { at: 1, rotate: -10, y: DROP * 0.8, x: -0.025 },
    ],
    // The bow hand flung out low for balance, the bow swung down, not raised.
    bow: [
      { at: 0, rotate: 40, x: 0.01, y: DROP + 0.02 },
      { at: 0.2, rotate: 74, x: 0.04, y: 0.08 },
      { at: 0.5, rotate: 70, x: 0.04, y: 0.085 },
      { at: 1, rotate: 66, x: 0.035, y: 0.09 },
    ],
    draw: [
      { at: 0, rotate: -64, x: 0.06, y: DROP },
      { at: 0.057, rotate: -10, x: 0.01, y: DROP * 0.9 },
      { at: 0.2, rotate: 62, x: -0.05, y: DROP * 0.75 },
      { at: 0.5, rotate: 70, x: -0.06, y: DROP * 0.75 },
      { at: 1, rotate: 64, x: -0.055, y: DROP * 0.78 },
    ],
    arrow: [
      { at: 0, rotate: 0, scale: 0 },
      { at: 1, rotate: 0, scale: 0 },
    ],
    cloak: turn([0, -4], [0.1, 18], [0.35, 26], [0.7, 14], [1, 16]),
    quiver: turn([0, 0], [0.15, 10], [0.5, 4], [1, 6]),
  }),
};

/**
 * On the board, after: the kid stands, winding the cord in over the hand and
 * elbow in three quick loops, and the bow comes back up where it belongs. A
 * fresh arrow is in the hand by the end.
 */
const coil: Clip = {
  duration: 780,
  poses: [
    { at: 0, x: -0.03, y: 0.01, rotate: -6, squash: 0.98 },
    { at: 0.3, x: -0.01, y: 0.004, rotate: -1, squash: 1.02 },
    { at: 1, x: 0, y: 0, rotate: 0, squash: 1 },
  ],
  parts: merge(upper(0, 0.8, -0.01), upper(0.35, 0.2), upper(1, 0), {
    legs: legs([0, 0.8], [0.35, 0.15], [1, 0]),
    head: [
      { at: 0, rotate: -8, y: DROP * 0.8 },
      { at: 0.35, rotate: 2, y: DROP * 0.2 },
      { at: 1, rotate: 0, y: 0 },
    ],
    bow: [
      { at: 0, rotate: -30, x: 0.02, y: 0.05 },
      { at: 0.4, rotate: -6, x: 0.01, y: 0.01 },
      { at: 1, rotate: 0, x: 0, y: 0 },
    ],
    draw: [
      { at: 0, rotate: 50, x: -0.04, y: 0.1 },
      { at: 0.18, rotate: -40, x: 0.02, y: 0.04 },
      { at: 0.33, rotate: 20, x: -0.01, y: 0.02 },
      { at: 0.48, rotate: -45, x: 0.02, y: 0.01 },
      { at: 0.62, rotate: 15, x: -0.01, y: 0 },
      { at: 1, rotate: 0, x: 0, y: 0 },
    ],
    arrow: [
      { at: 0, rotate: 0, scale: 0 },
      { at: 0.7, rotate: 0, scale: 0 },
      { at: 0.88, rotate: 0, scale: 1 },
      { at: 1, rotate: 0, scale: 1 },
    ],
    cloak: turn([0, 14], [0.4, -6], [1, 0]),
    quiver: turn([0, 6], [0.5, -3], [1, 0]),
  }),
};

export const poses: Record<string, Rig> = {
  ranger: {
    "ult:ff-kneel": kneel,
    "ult:ff-touch": touch,
    "ult:ff-watch": watch,
    "ult:ff-know": know,
    "ult:ff-haul": haul,
    "ult:ff-coil": coil,
  },
};
