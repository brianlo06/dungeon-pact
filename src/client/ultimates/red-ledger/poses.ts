import type { Clip, Pose, Rig } from "../../battle/animation";
import { face } from "../../battle/face";

/**
 * Red Ledger — the Reaver's poses.
 *
 * The combat rig already says who the Reaver is: it drags the cleaver, it
 * throws it over the mane too far, it takes a hit and leans back into it.
 * These are that body paying on purpose: a fist clenched until the bandage
 * runs, a stroke wiped across the chest, a walk across the pit with the blade
 * dragging, a face that waits in the dark, the chop, and the blade let back
 * down onto the floor.
 *
 * Parts: `cleaver` (the back arm and blade, from the back shoulder), `fist`
 * (the front arm, from the front shoulder), `head`, `hair`, `body`, `legs`,
 * and, only in a close-up, `brow`, `eyes`, `mouth`, `stain` (the bandage
 * soaking through: `y` −0.12 is soaked) and `entry` (the chest stroke: `x`
 * 0.25 is painted). The Reaver faces right: a positive `cleaver` rotation
 * swings the blade up behind and over.
 *
 * The brow is a shelf of bone, so it is lifted and lowered and never tilted
 * more than about 4°.
 */

const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/** The price, once paid, stays paid: held on every clip after it. */
const PAID = { stain: [{ at: 0, y: -0.12 }], entry: [{ at: 0, x: 0.25 }] };

/* ── The wipe, solved ──────────────────────────────────────────────────── */

/**
 * The fist is pressed to the chest and dragged down across it on its own
 * arc — the front arm pulled in 12 units towards the sternum and 2 down,
 * turned from −40° to +65° — and the chest stroke is painted along the chord
 * of that arc, its leading edge kept under the fist. `Reaver.tsx` places the
 * stroke on the same chord (`ENTRY`): from (58.36, 47.23), 18.09 long, at
 * 117.8°. Then the fist comes back up off the chest to where it rests, so
 * the arm no longer covers what it wrote.
 */
const SHOULDER: [number, number] = [60, 50];
const FIST: [number, number] = [71, 53];
const PULL = -0.12;
const DROP = 0.02;
const FROM = -40;
const TO = 65;
/** The clench, and where the fist ends up: raised at the chest's edge, clear of the stroke. */
const HELD = -22;

function fistAt(rotate: number): [number, number] {
  const r = (rotate * Math.PI) / 180;
  const [vx, vy] = [FIST[0] - SHOULDER[0], FIST[1] - SHOULDER[1]];
  return [
    SHOULDER[0] + PULL * 100 + vx * Math.cos(r) - vy * Math.sin(r),
    SHOULDER[1] + DROP * 100 + vx * Math.sin(r) + vy * Math.cos(r),
  ];
}

/** Fist and stroke keys for a wipe from `a` to `b` (clip fractions). */
function wipe(a: number, b: number) {
  const start = fistAt(FROM);
  const end = fistAt(TO);
  const len = Math.hypot(end[0] - start[0], end[1] - start[1]);
  const fist: Pose[] = [];
  const entry: Pose[] = [];
  for (let i = 0; i <= 4; i++) {
    const k = i / 4;
    const at = a + (b - a) * k;
    // A drag: slow to bite, fast through the middle, slowing off the end.
    const rotate = FROM + (TO - FROM) * (k * k * (3 - 2 * k));
    const [fx, fy] = fistAt(rotate);
    const along = ((fx - start[0]) * (end[0] - start[0]) + (fy - start[1]) * (end[1] - start[1])) / (len * len);
    fist.push({ at, rotate, x: PULL, y: DROP, scale: 0.92 });
    // The paint runs a little ahead of the fist's middle, under its leading edge.
    entry.push({ at, x: Math.min(0.25, Math.max(0, along * 0.25 + (i ? 0.025 : 0))) });
  }
  return { fist, entry };
}

/**
 * The call, on the board: the blade comes up off the floor and the fist comes
 * up and closes. No close-up parts: on the battlefield they are not there.
 */
const clench: Clip = {
  duration: 520,
  poses: [
    { at: 0, y: 0, rotate: 0, squash: 1 },
    { at: 0.35, y: 0.02, rotate: 2.5, squash: 1.07 },
    { at: 0.6, y: 0.012, rotate: 1.5, squash: 1.03 },
    { at: 1, y: 0.014, rotate: 2, squash: 1.04 },
  ],
  parts: {
    cleaver: turn([0, 0], [0.4, -18], [1, -13]),
    fist: [
      { at: 0, rotate: 0, scale: 1 },
      { at: 0.35, rotate: -52, scale: 1.1 },
      { at: 0.6, rotate: -44, scale: 0.9 },
      { at: 1, rotate: -46, scale: 0.94 },
    ],
    head: turn([0, 0], [0.4, 9], [1, 7]),
    hair: turn([0, 0], [0.3, 9], [0.6, -4], [1, 2]),
    legs: [
      { at: 0, squash: 1 },
      { at: 0.35, squash: 1.07 },
      { at: 1, squash: 1.05 },
    ],
  },
};

/**
 * The price. The fist held in front of the chest and clenched until it
 * shakes, the bandage soaking red from inside; then the fist dragged down
 * across the chest, and the stroke left behind it.
 */
const WIPE = wipe(0.5, 0.74);

// Short enough that FAST's cut of the shot still sees the stroke painted.
const price: Clip = {
  duration: 560,
  poses: [
    { at: 0, y: 0.01, rotate: 1, squash: 1.03 },
    { at: 0.45, y: 0.016, rotate: 2, squash: 1.05 },
    { at: 0.8, y: 0.006, rotate: -1.5, squash: 0.99 },
    { at: 1, y: 0.008, rotate: -1, squash: 1 },
  ],
  parts: {
    fist: [
      // Clenched until it shakes, where it always is: up in front.
      { at: 0, rotate: HELD + 4, scale: 0.98 },
      { at: 0.08, rotate: HELD - 2, scale: 0.88 },
      { at: 0.15, rotate: HELD + 2, scale: 0.93 },
      { at: 0.22, rotate: HELD - 3, scale: 0.87 },
      { at: 0.29, rotate: HELD + 2, scale: 0.92 },
      { at: 0.36, rotate: HELD - 3, scale: 0.86 },
      { at: 0.42, rotate: HELD + 1, scale: 0.9 },
      // Pressed to the chest, and dragged down across it.
      ...WIPE.fist,
      // Then back up off it, dripping, so the stroke is seen whole.
      { at: 0.88, rotate: HELD + 6, x: 0.01, y: 0, scale: 0.95 },
      { at: 1, rotate: HELD + 2, x: 0.01, y: 0, scale: 0.94 },
    ],
    stain: [
      { at: 0, y: 0 },
      { at: 0.1, y: -0.025 },
      { at: 0.46, y: -0.12 },
      { at: 1, y: -0.12 },
    ],
    entry: [{ at: 0, x: 0 }, ...WIPE.entry, { at: 0.88, x: 0.25 }, { at: 1, x: 0.25 }],
    cleaver: turn([0, -12], [0.5, -14], [1, -10]),
    head: turn([0, 8], [0.45, 11], [0.8, 6], [1, 5]),
    hair: turn([0, 2], [0.5, 4], [0.7, -6], [1, -2]),
    body: [
      { at: 0, squash: 1.02 },
      { at: 0.46, squash: 1.05, y: 0.004 },
      { at: 0.8, squash: 0.98 },
      { at: 1, squash: 1 },
    ],
    ...face(
      [0, { brow: 1.2, knit: 3, open: 0.6, mouth: 0.8, wide: 1.05 }],
      [0.46, { brow: 2, knit: 4, open: 0.35, mouth: 0.7, wide: 1.12 }],
      [0.82, { brow: 1.4, knit: 3, open: 0.7, mouth: 1.1, wide: 1.05 }],
      [1, { brow: 1.2, knit: 3, open: 0.75, mouth: 1, wide: 1 }],
    ),
  },
};

/**
 * Across the pit, at the row: head low, the cleaver dragging point down
 * through the sand behind, heavy on every step. Shown mirrored.
 */
const walk: Clip = {
  duration: 720,
  loop: true,
  poses: [
    { at: 0, y: 0, rotate: 3, squash: 1 },
    { at: 0.25, y: -0.018, rotate: 4.5, squash: 0.98 },
    { at: 0.5, y: 0.004, rotate: 3, squash: 1.03 },
    { at: 0.75, y: -0.016, rotate: 4.2, squash: 0.98 },
    { at: 1, y: 0, rotate: 3, squash: 1 },
  ],
  parts: {
    ...PAID,
    cleaver: turn([0, 4], [0.25, 7], [0.5, 3], [0.75, 7], [1, 4]),
    fist: turn([0, 18], [0.25, 12], [0.5, 20], [0.75, 13], [1, 18]),
    head: turn([0, 12], [0.25, 10], [0.5, 13], [0.75, 10], [1, 12]),
    hair: turn([0, 0], [0.25, -5], [0.5, 3], [0.75, -4], [1, 0]),
    legs: [
      { at: 0, squash: 1.04 },
      { at: 0.25, squash: 0.97 },
      { at: 0.5, squash: 1.04 },
      { at: 0.75, squash: 0.97 },
      { at: 1, squash: 1.04 },
    ],
    brow: [{ at: 0, y: 0.015 }],
    eyes: [{ at: 0, scale: 0.75, squash: 1.3 }],
  },
};

/**
 * The quiet. The head is down and the brow shelf is lowered over shut eyes,
 * the fist held at the jaw; then the brow lifts, the eyes open and the teeth
 * show.
 */
// The eyes open by 68%: inside FAST's cut of the shot, and held in FULL's.
const hush: Clip = {
  duration: 520,
  poses: [
    { at: 0, y: 0.01, rotate: 2, squash: 1.02 },
    { at: 1, y: 0.008, rotate: 1, squash: 1.01 },
  ],
  parts: {
    ...PAID,
    // Held up at the jaw, still, where the drop can be seen swelling on it.
    fist: [
      { at: 0, rotate: -80, x: 0.04, scale: 0.94 },
      { at: 0.7, rotate: -81, x: 0.04, scale: 0.93 },
      { at: 1, rotate: -83, x: 0.04, scale: 0.9 },
    ],
    cleaver: turn([0, -10], [1, -10]),
    head: turn([0, 9], [0.5, 8], [0.68, 1], [1, 0]),
    hair: turn([0, 0], [0.68, -3], [1, -2]),
    ...face(
      [0, { brow: 2.2, knit: 3, open: 0.22, mouth: 0.8 }],
      [0.52, { brow: 2.3, knit: 3, open: 0.2, mouth: 0.78 }],
      [0.68, { brow: -1.2, knit: 1, open: 1.2, mouth: 1.35, wide: 1.2 }],
      [1, { brow: -1.4, knit: 1, open: 1.25, mouth: 1.4, wide: 1.22 }],
    ),
  },
};

/**
 * The collection. Seen from the moment the cleaver is already over the mane:
 * down, through, and too far, the whole body going after it. `contact` is the
 * blade arriving, not the swing starting.
 */
const collect: Clip = {
  duration: 760,
  markers: { contact: 0.04 },
  // Kept small: the lunge itself is the film's actor move, so the framing
  // holds whether or not a copy's root track is written.
  poses: [
    { at: 0, x: 0, y: -0.006, rotate: 3, squash: 0.97, scale: 1.01 },
    { at: 0.04, x: 0.04, y: 0.008, rotate: 9, squash: 0.88, scale: 1.04 },
    { at: 0.2, x: 0.05, y: 0.01, rotate: 10, squash: 0.9, scale: 1.03 },
    { at: 0.5, x: 0.04, y: 0.008, rotate: 8, squash: 0.96, scale: 1.02 },
    { at: 1, x: 0.04, y: 0.006, rotate: 7, squash: 0.98, scale: 1.01 },
  ],
  parts: {
    ...PAID,
    // Through the target and on, the blade left pointing where it went.
    cleaver: turn([0, 196], [0.04, 252], [0.2, 268], [0.5, 272], [1, 270]),
    fist: turn([0, 10], [0.04, -34], [0.3, -24], [1, -18]),
    head: turn([0, -4], [0.04, 12], [0.3, 8], [1, 6]),
    hair: turn([0, -8], [0.04, 16], [0.2, -8], [0.5, 4], [1, 0]),
    legs: [
      { at: 0, squash: 1.02 },
      { at: 0.04, squash: 0.9 },
      { at: 0.3, squash: 0.94 },
      { at: 1, squash: 0.97 },
    ],
    ...face(
      [0, { brow: -1, knit: 2, open: 1.2, mouth: 2, wide: 1.1 }],
      [0.04, { brow: -1.4, knit: 3, open: 1.25, mouth: 2.3, wide: 1.1 }],
      [0.4, { brow: 0.4, knit: 3, open: 0.9, mouth: 1.5, wide: 1.15 }],
      [1, { brow: 0.6, knit: 3, open: 0.8, mouth: 1.3, wide: 1.2 }],
    ),
  },
};

/**
 * Back on the board: the blade let down onto the floor again, the fist
 * dropped, the shoulders heaving once. No close-up parts.
 */
const settle: Clip = {
  duration: 760,
  poses: [
    { at: 0, y: 0.01, rotate: 5, squash: 1.04 },
    { at: 0.3, y: 0.022, rotate: 3, squash: 1.08 },
    { at: 0.6, y: -0.006, rotate: 0, squash: 0.97 },
    { at: 1, y: 0, rotate: 0.8, squash: 1 },
  ],
  parts: {
    cleaver: turn([0, -40], [0.3, 8], [0.45, -3], [1, 0]),
    fist: turn([0, -30], [0.4, 10], [1, 0]),
    head: turn([0, 8], [0.3, 12], [0.7, -2], [1, 0]),
    hair: turn([0, 4], [0.3, 10], [0.6, -5], [1, 0]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.3, squash: 1.05, y: 0.006 },
      { at: 0.6, squash: 0.98 },
      { at: 1, squash: 1, y: 0 },
    ],
  },
};

export const poses: Record<string, Rig> = {
  reaver: {
    "ult:ledger-clench": clench,
    "ult:ledger-price": price,
    "ult:ledger-walk": walk,
    "ult:ledger-hush": hush,
    "ult:ledger-collect": collect,
    "ult:ledger-settle": settle,
  },
};
