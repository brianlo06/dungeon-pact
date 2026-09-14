import type { Clip, Pose, Rig } from "../../battle/animation";
import { face, type Expression } from "../../battle/face";

/**
 * Elegy for the Standing — the poses.
 *
 * The Herald's combat rig blows the horn and waves the banner forward at the
 * enemy. The Dirgesinger does neither. It dips the colours, the salute a
 * standard-bearer gives the dead, and sings with its eyes shut; at the last
 * note it drives the banner point first into the earth at the head of a
 * grave, the flag in the dirt, like a marker. The horn stays at the hip: this
 * song is sung, not blown.
 *
 *   the Herald   `ult:elegy-dip`    on the board: the head bows, the colours dip
 *                `ult:elegy-sing`   the close-up: the open face closes over the song
 *                `ult:elegy-mourn`  at the graveside, colours dipped, singing
 *                `ult:elegy-close`  the last note: the banner driven into the earth; `contact`
 *                `ult:elegy-planted` held after it, head up, the note ringing
 *                `ult:elegy-rest`   on the board after: the banner lifted out, head up
 *   every ally   `ult:elegy-bow`    at the graveside, heads bowed, weapons lowered
 *
 * Root tracks are authored for the shot size each clip plays at: the board
 * clips and the wide move the whole figure a little (a bow, a breath); the
 * close-up is played with `root: false`, so only the face and the head act.
 */

type Part = Record<string, Pose[]>;
const turn = (...keys: [number, number][]): Pose[] => keys.map(([at, rotate]) => ({ at, rotate }));

/* ── The Herald ────────────────────────────────────────────────────────── */

/** The colours dipped: the pole leaned forward and down, the flag hanging off it. */
const DIPPED = 38;
/** Driven into the earth ahead of the feet, point first. */
const DRIVEN = 168;

/** The face the Herald is drawn with: open, earnest, eyes wide. */
const EARNEST: Expression = { brow: -1, knit: -3, open: 1.15, mouth: 1, wide: 1 };
/** Looking down at what it is about to sing: the brows lift at the middle. */
const SORROW: Expression = { brow: -1.4, knit: 3, open: 0.5, mouth: 0.38, wide: 0.86 };
/** Singing, eyes shut, the mouth rounded on "oo". */
const SUNG: Expression = { brow: -1.9, knit: -2, open: 0.12, mouth: 1.9, wide: 0.48 };
const SUNG_FULL: Expression = { brow: -2.2, knit: -3, open: 0.1, mouth: 2.35, wide: 0.44 };
/** The last note, flung up at the sky: the mouth wide open, the eyes still shut. */
const LAST: Expression = { brow: -2.5, knit: -4, open: 0.13, mouth: 2.9, wide: 0.58 };

/** On the board: the head bows, the colours dip, the horn arm comes in. */
const dip: Clip = {
  duration: 520,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1, scale: 1 },
    { at: 0.45, x: 0.01, y: 0.01, rotate: 2.5, squash: 1.03 },
    { at: 1, x: 0.01, y: 0.012, rotate: 3, squash: 1.035 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.2, rotate: -6, y: -0.01 },
      { at: 0.7, rotate: DIPPED + 4, y: 0.02 },
      { at: 1, rotate: DIPPED, y: 0.02 },
    ],
    flag: [
      { at: 0, rotate: 0, squash: 1 },
      { at: 0.5, rotate: 16, squash: 0.94 },
      { at: 0.8, rotate: 30, squash: 0.86 },
      { at: 1, rotate: 26, squash: 0.88 },
    ],
    horn: turn([0, 0], [0.5, -14], [1, -12]),
    head: turn([0, 0], [0.5, 8], [1, 9]),
    body: [
      { at: 0, squash: 1 },
      { at: 0.6, squash: 1.03 },
      { at: 1, squash: 1.03 },
    ],
  },
};

/**
 * The close-up. The face the Herald is drawn with — open, earnest — looks
 * down at what it is about to sing, the brows lift at the middle, the eyes
 * shut, and the mouth rounds on the first note; the head bows with the breath
 * and lifts on the note. Played with `root: false`.
 */
const sing: Clip = {
  duration: 700,
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    { at: 1, x: 0, y: 0.005, rotate: 1, squash: 1.01 },
  ],
  parts: {
    head: turn([0, -2], [0.3, 7], [0.5, 5], [0.8, -4], [1, -5]),
    banner: [
      { at: 0, rotate: DIPPED - 10, y: 0.01 },
      { at: 1, rotate: DIPPED, y: 0.02 },
    ],
    flag: turn([0, 20], [0.5, 28], [1, 26]),
    horn: turn([0, -10], [1, -12]),
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.3, squash: 1.025, y: 0.004 },
      { at: 0.7, squash: 0.985, y: -0.004 },
      { at: 1, squash: 0.99, y: -0.003 },
    ],
    ...face([0, EARNEST], [0.14, EARNEST], [0.32, SORROW], [0.5, SUNG], [0.78, SUNG_FULL], [1, SUNG_FULL]),
  },
};

/**
 * At the graveside: the colours dipped and held, the head bowed and lifting a
 * little on each note, the eyes shut, singing. A slow breath runs through the
 * whole figure, and the flag sags against the pole.
 */
const mourn: Clip = {
  duration: 920,
  poses: [
    { at: 0, x: 0.01, y: 0.012, rotate: 3, squash: 1.035 },
    { at: 0.35, x: 0.01, y: 0.008, rotate: 1.5, squash: 1.015 },
    { at: 0.7, x: 0.01, y: 0.012, rotate: 2.5, squash: 1.03 },
    { at: 1, x: 0.01, y: 0.01, rotate: 2, squash: 1.02 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: DIPPED, y: 0.02 },
      { at: 0.5, rotate: DIPPED + 3, y: 0.025 },
      { at: 1, rotate: DIPPED + 1, y: 0.022 },
    ],
    flag: [
      { at: 0, rotate: 26, squash: 0.88 },
      { at: 0.5, rotate: 30, squash: 0.86 },
      { at: 1, rotate: 28, squash: 0.87 },
    ],
    horn: turn([0, -12], [1, -12]),
    head: turn([0, 9], [0.3, 4], [0.45, 7], [0.7, 2], [1, 4]),
    body: [
      { at: 0, squash: 1.03 },
      { at: 0.35, squash: 1.0 },
      { at: 0.7, squash: 1.025 },
      { at: 1, squash: 1.01 },
    ],
    ...face([0, SUNG], [0.35, SUNG_FULL], [0.6, SUNG], [0.85, SUNG_FULL], [1, SUNG_FULL]),
  },
};

/**
 * The last note. The clip is short, so it blends in from the graveside in a
 * few frames and the hit-stop holds the struck pose: the banner comes up and
 * over and is driven point first into the ground ahead of the feet
 * (`contact`), the knees give under it, and the head is flung back to sing
 * the note at the sky.
 */
const close: Clip = {
  duration: 160,
  markers: { contact: 0.3 },
  poses: [
    { at: 0, x: 0.03, y: 0.01, rotate: 4, squash: 1.02, flash: 0 },
    { at: 0.3, x: 0.07, y: 0.03, rotate: 9, squash: 1.09, flash: 0 },
    { at: 1, x: 0.07, y: 0.032, rotate: 9, squash: 1.1, flash: 0 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: DRIVEN - 34, y: 0.04, x: 0.03 },
      { at: 0.3, rotate: DRIVEN, y: 0.1, x: 0.05 },
      { at: 1, rotate: DRIVEN + 2, y: 0.105, x: 0.05 },
    ],
    flag: [
      { at: 0, rotate: 10, squash: 0.95 },
      { at: 0.3, rotate: -30, squash: 1.08 },
      { at: 1, rotate: -26, squash: 1.04 },
    ],
    horn: turn([0, -20], [0.3, -44], [1, -46]),
    head: turn([0, 0], [0.3, -16], [1, -18]),
    body: [
      { at: 0, squash: 1.03, y: 0.01 },
      { at: 0.3, squash: 1.09, y: 0.025 },
      { at: 1, squash: 1.1, y: 0.027 },
    ],
    legs: [
      { at: 0, squash: 1 },
      { at: 0.3, squash: 1.1 },
      { at: 1, squash: 1.12 },
    ],
    ...face([0, SUNG], [0.3, LAST], [1, LAST]),
  },
};

/** Held after the last note: the banner stands in the earth, the note rings out, the head comes down. */
const planted: Clip = {
  duration: 900,
  poses: [
    { at: 0, x: 0.07, y: 0.032, rotate: 9, squash: 1.1 },
    { at: 0.4, x: 0.065, y: 0.026, rotate: 7, squash: 1.06 },
    { at: 1, x: 0.06, y: 0.02, rotate: 6, squash: 1.04 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: DRIVEN + 2, y: 0.105, x: 0.05 },
      { at: 1, rotate: DRIVEN, y: 0.1, x: 0.05 },
    ],
    flag: [
      { at: 0, rotate: -26, squash: 1.04 },
      { at: 0.3, rotate: -16, squash: 0.96 },
      { at: 0.6, rotate: -22, squash: 1.0 },
      { at: 1, rotate: -20, squash: 0.98 },
    ],
    horn: turn([0, -46], [1, -30]),
    head: turn([0, -18], [0.5, -12], [1, 2]),
    body: [
      { at: 0, squash: 1.1, y: 0.027 },
      { at: 1, squash: 1.04, y: 0.015 },
    ],
    legs: [
      { at: 0, squash: 1.12 },
      { at: 1, squash: 1.05 },
    ],
    ...face([0, LAST], [0.45, LAST], [0.8, SUNG], [1, { ...SUNG, mouth: 1.1 }]),
  },
};

/** On the board after: the banner lifted out of the earth and stood upright, the head up. */
const rest: Clip = {
  duration: 760,
  poses: [
    { at: 0, x: 0.03, y: 0.015, rotate: 5, squash: 1.05 },
    { at: 0.45, x: 0.01, y: 0.005, rotate: 0.5, squash: 1 },
    { at: 1, x: 0, y: 0, rotate: 0, squash: 1 },
  ],
  parts: {
    banner: [
      { at: 0, rotate: DRIVEN - 10, y: 0.07, x: 0.03 },
      { at: 0.45, rotate: 4, y: 0.01, x: 0 },
      { at: 0.7, rotate: -2, y: 0 },
      { at: 1, rotate: 0, y: 0 },
    ],
    flag: [
      { at: 0, rotate: -18, squash: 1 },
      { at: 0.45, rotate: 14, squash: 0.94 },
      { at: 0.7, rotate: -6, squash: 1.02 },
      { at: 1, rotate: 0, squash: 1 },
    ],
    horn: turn([0, -24], [0.5, -4], [1, 0]),
    head: turn([0, 8], [0.45, -3], [1, 0]),
  },
};

/* ── Every ally ────────────────────────────────────────────────────────── */

/**
 * What each hero lowers at a graveside, in each combat rig's own sense of its
 * parts: weapons down and in, nothing held up.
 */
const LOWER: Record<string, Part> = {
  vanguard: {
    sword: [{ at: 0, rotate: -34 }],
    shield: [{ at: 0, rotate: 4, y: 0.02 }],
    cape: [{ at: 0, rotate: 5 }],
  },
  arcanist: {
    hand: [{ at: 0, rotate: 30, y: 0.03 }],
    book: [{ at: 0, rotate: 10 }],
    hat: [{ at: 0, rotate: 8 }],
  },
  ranger: {
    bow: [{ at: 0, rotate: 16, y: 0.02 }],
    draw: [{ at: 0, rotate: 18 }],
    cloak: [{ at: 0, rotate: 4 }],
  },
  warden: {
    hand: [{ at: 0, rotate: 26, y: 0.02 }],
    staff: [{ at: 0, rotate: -6 }],
    lantern: [{ at: 0, rotate: 6 }],
  },
  broker: {
    scales: [{ at: 0, rotate: 18, y: 0.02 }],
    ledger: [{ at: 0, rotate: 8 }],
  },
  reaver: {
    fist: [{ at: 0, rotate: 24 }],
    cleaver: [{ at: 0, rotate: -14 }],
    hair: [{ at: 0, rotate: 6 }],
  },
  beguiler: {
    shard: [{ at: 0, rotate: -30 }],
    control: [{ at: 0, rotate: 10, y: 0.02 }],
    strings: [{ at: 0, rotate: 6 }],
  },
  herald: {
    banner: [{ at: 0, rotate: DIPPED * 0.6 }],
    flag: [{ at: 0, rotate: 18, squash: 0.9 }],
    horn: [{ at: 0, rotate: -8 }],
  },
};

/** Heroes whose faces a close-up can move. */
const FACED = new Set(["ranger", "warden", "broker", "reaver", "herald"]);

/** `LOWER` keyed through time, `[at, k]`, k = 0 as they stood, 1 lowered. */
function lowered(hero: string, keys: [number, number][]): Part {
  const out: Part = {};
  for (const [at, k] of keys)
    for (const [name, [pose]] of Object.entries(LOWER[hero] ?? {})) {
      const p: Pose = { at };
      for (const key of ["rotate", "x", "y"] as const) if (pose[key] !== undefined) p[key] = (pose[key] as number) * k;
      if (pose.squash !== undefined) p.squash = 1 + (pose.squash - 1) * k;
      (out[name] ??= []).push(p);
    }
  return out;
}

/** At the graveside: heads bowed, weapons lowered, a slow breath. */
function bow(hero: string): Clip {
  return {
    duration: 920,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.4, y: 0.008, rotate: 1.5, squash: 1.025 },
      { at: 1, y: 0.006, rotate: 1.2, squash: 1.02 },
    ],
    parts: {
      head: turn([0, 2], [0.4, 10], [1, 9]),
      body: [
        { at: 0, squash: 1 },
        { at: 0.4, squash: 1.03 },
        { at: 1, squash: 1.02 },
      ],
      ...lowered(hero, [
        [0, 0.4],
        [0.4, 1],
        [1, 1],
      ]),
      ...(FACED.has(hero)
        ? face([0, { open: 0.8 }], [0.4, { brow: -0.8, knit: -5, open: 0.3, mouth: 0.8, wide: 0.9 }], [1, { brow: -0.8, knit: -5, open: 0.28, mouth: 0.8, wide: 0.9 }])
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
            "ult:elegy-dip": dip,
            "ult:elegy-sing": sing,
            "ult:elegy-mourn": mourn,
            "ult:elegy-close": close,
            "ult:elegy-planted": planted,
            "ult:elegy-rest": rest,
          }
        : {}),
      "ult:elegy-bow": bow(hero),
    } as Rig,
  ]),
);
