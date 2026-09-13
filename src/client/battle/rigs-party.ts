import type { Clip, Pose, Rig } from "./animation";

/**
 * The party's rigs.
 *
 * Every hero is a cutout rig drawn on the same body (see
 * `components/heroes/kit.tsx`), so they share joints: `legs`, `body` and
 * `head`, plus two arm-borne parts that differ per class — a sword and a
 * shield, a staff and a casting hand, a bow and a drawing arm. The root track
 * moves the whole figure; the part tracks are what make a class move in
 * character.
 *
 * Heroes have more vocabulary than enemies. The director plays `attack` for a
 * basic strike, `signature` for a costly one, `cast` for anything aimed at an
 * ally, `block` for bracing and for a barrier taking a hit, `hurt`, and
 * `defeat` when a hero drops; the combatant plays `down` for a hero already
 * lying down and `revive` when one gets back up.
 *
 * Direction matters. Heroes stand on the left and face right: a lunge is +x,
 * a lean into a blow is a positive (clockwise) rotation, and a recoil goes the
 * other way — away from whatever hit them, not towards it.
 */

/** A hero is downed, not destroyed: the director's `defeat` is the same fall. */
const withFall = (rig: Rig): Rig => ({ ...rig, defeat: rig.down });

/** Shorthand for a part track that only rotates. */
const turn = (...keys: [number, number][]): Pose[] =>
  keys.map(([at, rotate]) => ({ at, rotate }));

/**
 * The shared recoil: heroes are not bosses, so a hit visibly moves them. Each
 * class adds its own part tracks on top.
 */
const recoil = (
  duration: number,
  amount: number,
  parts: Clip["parts"],
): Clip => ({
  duration,
  poses: [
    { at: 0, x: 0, flash: 0.9 },
    {
      at: 0.16,
      x: -0.12 * amount,
      rotate: -7 * amount,
      squash: 1 - 0.12 * amount,
      flash: 0.6,
    },
    { at: 0.42, x: 0.035 * amount, rotate: 2.5 * amount, squash: 1.04 },
    { at: 0.7, x: -0.01, rotate: -0.8 },
    { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
  ],
  parts,
});

/**
 * Lying down. The root pivots at the feet, so a figure rotated back about its
 * heels puts its shoulders *under* the floor; it is lifted and slid forward so
 * it lies on the ground above its own name plate instead of sinking into it.
 */
const LYING = { rotate: -80, x: 0.1, y: -0.1, squash: 1.08 };

/** Falling backwards, away from the enemy line, and staying down. */
const fall = (duration: number, parts: Clip["parts"]): Clip => ({
  duration,
  poses: [
    { at: 0, rotate: 0, x: 0, y: 0, flash: 0.5 },
    { at: 0.22, rotate: 6, y: -0.03, flash: 0.2 },
    { at: 0.55, rotate: -46, x: 0.05, y: -0.04 },
    { at: 0.8, rotate: -84, x: 0.1, y: -0.08, squash: 1.12 },
    { at: 1, ...LYING, flash: 0 },
  ],
  parts,
});

/** Getting back up: the fall reversed, with a flare of light at the top. */
const rise = (duration: number, parts: Clip["parts"]): Clip => ({
  duration,
  poses: [
    { at: 0, ...LYING },
    { at: 0.35, rotate: -40, x: 0.05, y: -0.04, flash: 0.5 },
    { at: 0.68, rotate: 6, x: 0, y: -0.05, scale: 1.05, flash: 0.8 },
    { at: 1, rotate: 0, x: 0, y: 0, scale: 1, squash: 1, flash: 0 },
  ],
  parts,
});

/**
 * The Vanguard: slow, planted, heavy through the hips.
 *
 * The sword is shouldered and comes over the top on a strike; the shield is
 * the thing that moves on everything defensive. On a hit the helm snaps back
 * and the shield is knocked askew, and the cape always arrives late.
 */
const vanguard: Rig = withFall({
  idle: {
    duration: 4200,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      // Weight shifts onto the shield side, then back. Breathing is the small
      // part of this; the shift is what makes it read as standing guard.
      { at: 0.28, y: -0.012, rotate: -1.1, squash: 1.006 },
      { at: 0.52, y: -0.004, rotate: 0.2 },
      { at: 0.78, y: -0.016, rotate: 1, squash: 0.996 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      head: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.3, rotate: -1.6, y: -0.004 },
        { at: 0.55, rotate: 0.4 },
        { at: 0.8, rotate: 1.4, y: -0.006 },
        { at: 1, rotate: 0, y: 0 },
      ],
      cape: turn([0, 0.5], [0.4, 2.6], [0.85, -1.4], [1, 0.5]),
      shield: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.3, rotate: -1.2, y: -0.004 },
        { at: 0.78, rotate: 0.9, y: 0.002 },
        { at: 1, rotate: 0, y: 0 },
      ],
      sword: turn([0, 0], [0.5, 2], [1, 0]),
      body: [
        { at: 0, squash: 1, y: 0 },
        { at: 0.28, squash: 1.012, y: 0.002 },
        { at: 0.78, squash: 0.994 },
        { at: 1, squash: 1, y: 0 },
      ],
    },
  },
  anticipate: {
    duration: 260,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 1, x: -0.13, rotate: -6, squash: 1.08, y: 0.01 },
    ],
    parts: {
      sword: turn([0, 0], [1, 40]),
      blade: turn([0, 0], [1, -24]),
      shield: [
        { at: 0, x: 0 },
        { at: 1, x: -0.02, rotate: -3 },
      ],
    },
  },
  /**
   * The charge: shield first. It leans into the run behind the shield, which
   * is pushed out ahead of it, the sword held up and back where the
   * anticipation raised it, the cape streaming. A heavy two-beat stride.
   */
  approach: {
    duration: 380,
    loop: true,
    poses: [
      { at: 0, x: 0.03, y: 0, rotate: 7, squash: 1 },
      { at: 0.25, x: 0.035, y: -0.028, rotate: 8, squash: 0.97 },
      { at: 0.5, x: 0.03, y: 0, rotate: 7, squash: 1.03 },
      { at: 0.75, x: 0.035, y: -0.028, rotate: 8, squash: 0.97 },
      { at: 1, x: 0.03, y: 0, rotate: 7, squash: 1 },
    ],
    parts: {
      shield: [
        { at: 0, x: 0.05, y: -0.01, rotate: -6, scale: 1.04 },
        { at: 0.5, x: 0.055, y: -0.014, rotate: -7, scale: 1.04 },
        { at: 1, x: 0.05, y: -0.01, rotate: -6, scale: 1.04 },
      ],
      sword: turn([0, 40], [0.5, 44], [1, 40]),
      blade: turn([0, -24], [1, -24]),
      head: [
        { at: 0, rotate: 4, y: 0.01 },
        { at: 0.5, rotate: 5, y: 0.012 },
        { at: 1, rotate: 4, y: 0.01 },
      ],
      cape: turn([0, -12], [0.25, -18], [0.5, -10], [0.75, -18], [1, -12]),
      legs: [
        { at: 0, squash: 1.05, y: 0 },
        { at: 0.25, squash: 0.95, y: -0.01 },
        { at: 0.5, squash: 1.05, y: 0 },
        { at: 0.75, squash: 0.95, y: -0.01 },
        { at: 1, squash: 1.05, y: 0 },
      ],
    },
  },
  /**
   * Backing off on guard: it never turns its back on what it hit. The
   * shield stays up in front, the sword ready, and it steps back in short
   * braced steps.
   */
  retreat: {
    duration: 460,
    loop: true,
    poses: [
      { at: 0, x: 0, y: 0, rotate: -3, squash: 1.02 },
      { at: 0.25, x: -0.01, y: -0.015, rotate: -2, squash: 1 },
      { at: 0.5, x: 0, y: 0, rotate: -3, squash: 1.02 },
      { at: 0.75, x: -0.01, y: -0.015, rotate: -2, squash: 1 },
      { at: 1, x: 0, y: 0, rotate: -3, squash: 1.02 },
    ],
    parts: {
      shield: [
        { at: 0, x: 0.03, y: -0.035, rotate: -6, scale: 1.05 },
        { at: 0.5, x: 0.03, y: -0.03, rotate: -5, scale: 1.05 },
        { at: 1, x: 0.03, y: -0.035, rotate: -6, scale: 1.05 },
      ],
      sword: turn([0, 18], [0.5, 22], [1, 18]),
      blade: turn([0, -10], [1, -10]),
      head: turn([0, 4], [0.5, 3], [1, 4]),
      cape: turn([0, 4], [0.5, 1], [1, 4]),
      legs: [
        { at: 0, squash: 1.04 },
        { at: 0.25, squash: 0.98 },
        { at: 0.5, squash: 1.04 },
        { at: 0.75, squash: 0.98 },
        { at: 1, squash: 1.04 },
      ],
    },
  },
  /** Basic strike: coil, bring the sword over, follow through, recover. */
  attack: {
    duration: 620,
    poses: [
      { at: 0, x: 0, rotate: 0, squash: 1 },
      { at: 0.26, x: -0.14, rotate: -7, squash: 1.09, y: 0.012 },
      { at: 0.34, x: -0.15, rotate: -8 },
      { at: 0.47, x: 0.26, rotate: 9, squash: 0.88, scale: 1.06, y: -0.01 },
      { at: 0.6, x: 0.19, rotate: 5, squash: 0.96 },
      { at: 0.78, x: 0.05, rotate: 1 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1, y: 0 },
    ],
    parts: {
      // The arm goes up behind the helm, over the top and down; the wrist
      // turns the blade so it finishes pointing at the enemy. Both carry on
      // round to a full turn rather than unwinding, which re-shoulders the
      // sword instead of rewinding it.
      sword: turn(
        [0, 0],
        [0.26, 70],
        [0.34, 80],
        [0.47, 239],
        [0.6, 262],
        [0.8, 330],
        [1, 360],
      ),
      blade: [
        { at: 0, rotate: 0 },
        { at: 0.26, rotate: -54 },
        { at: 0.34, rotate: -60 },
        { at: 0.47, rotate: -108 },
        { at: 0.6, rotate: -104 },
        { at: 0.8, rotate: -250 },
        { at: 1, rotate: -360 },
      ],
      shield: [
        { at: 0, x: 0, rotate: 0 },
        { at: 0.26, x: -0.02, rotate: -3 },
        { at: 0.47, x: 0.03, rotate: 6 },
        { at: 0.7, x: 0.01, rotate: 2 },
        { at: 1, x: 0, rotate: 0 },
      ],
      head: turn([0, 0], [0.26, -5], [0.47, 7], [0.7, 2], [1, 0]),
      cape: turn([0, 0], [0.3, -5], [0.5, 12], [0.75, 4], [1, 0]),
      legs: [
        { at: 0, squash: 1 },
        { at: 0.3, squash: 1.06 },
        { at: 0.48, squash: 0.95 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Foundry slam: the same shape, bigger, slower, and it lands harder. */
  signature: {
    duration: 880,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.22, x: -0.2, rotate: -11, squash: 1.14, y: 0.02, scale: 1.02 },
      { at: 0.4, x: -0.22, rotate: -12, flash: 0.25 },
      { at: 0.52, x: 0.34, rotate: 14, squash: 0.82, scale: 1.12, flash: 0.5 },
      { at: 0.64, x: 0.26, rotate: 8, squash: 0.95, flash: 0.15 },
      { at: 0.84, x: 0.07, rotate: 2 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1, y: 0, flash: 0 },
    ],
    parts: {
      sword: turn(
        [0, 0],
        [0.22, 92],
        [0.4, 100],
        [0.52, 250],
        [0.64, 262],
        [0.86, 330],
        [1, 360],
      ),
      blade: [
        { at: 0, rotate: 0 },
        { at: 0.22, rotate: -70 },
        { at: 0.4, rotate: -76 },
        { at: 0.52, rotate: -95 },
        { at: 0.64, rotate: -100 },
        { at: 0.86, rotate: -250 },
        { at: 1, rotate: -360 },
      ],
      shield: [
        { at: 0, x: 0, rotate: 0 },
        { at: 0.22, x: -0.03, rotate: -6 },
        { at: 0.52, x: 0.05, rotate: 12 },
        { at: 0.64, x: 0.03, rotate: 7 },
        { at: 1, x: 0, rotate: 0 },
      ],
      head: turn([0, 0], [0.22, -8], [0.52, 10], [0.8, 2], [1, 0]),
      cape: turn([0, 0], [0.25, -8], [0.55, 18], [0.8, 5], [1, 0]),
      legs: [
        { at: 0, squash: 1, y: 0 },
        { at: 0.22, squash: 1.1, y: 0.01 },
        { at: 0.52, squash: 0.9 },
        { at: 0.7, squash: 1.03 },
        { at: 1, squash: 1, y: 0 },
      ],
    },
  },
  /** Brace: the shield comes up, the head tucks in behind it, and it holds. */
  block: {
    duration: 700,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.18, x: -0.05, rotate: -3, y: 0.012, squash: 1.08 },
      { at: 0.36, x: 0.03, rotate: 2, scale: 1.05, flash: 0.3 },
      { at: 0.62, x: 0.01, rotate: 1, scale: 1.03, flash: 0.1 },
      { at: 1, x: 0, rotate: 0, scale: 1, squash: 1, flash: 0 },
    ],
    parts: {
      shield: [
        { at: 0, x: 0, y: 0, rotate: 0, scale: 1 },
        { at: 0.18, x: 0.01, y: 0.01, rotate: 2 },
        {
          at: 0.36,
          x: 0.03,
          y: -0.05,
          rotate: -8,
          scale: 1.08,
        },
        { at: 0.62, x: 0.02, y: -0.04, rotate: -6, scale: 1.06 },
        { at: 1, x: 0, y: 0, rotate: 0, scale: 1 },
      ],
      head: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.36, rotate: 5, y: 0.02 },
        { at: 0.62, rotate: 4, y: 0.015 },
        { at: 1, rotate: 0, y: 0 },
      ],
      sword: turn([0, 0], [0.36, -8], [1, 0]),
      legs: [
        { at: 0, squash: 1, y: 0 },
        { at: 0.36, squash: 1.1, y: 0.01 },
        { at: 0.62, squash: 1.06 },
        { at: 1, squash: 1, y: 0 },
      ],
      body: [
        { at: 0, squash: 1, y: 0 },
        { at: 0.36, squash: 1.05, y: 0.01 },
        { at: 1, squash: 1, y: 0 },
      ],
    },
  },
  /** Intercept: drive across, plant, and put the shield in the way. */
  cast: {
    duration: 760,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.14, x: -0.08, rotate: -5, squash: 1.1 },
      { at: 0.34, x: 0.3, rotate: 4, squash: 0.92, scale: 1.04 },
      { at: 0.46, x: 0.26, rotate: 0, squash: 1.06, scale: 1.06, flash: 0.35 },
      { at: 0.62, x: 0.3, rotate: 3, squash: 0.94, flash: 0.15 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1, flash: 0 },
    ],
    parts: {
      shield: [
        { at: 0, x: 0, rotate: 0, scale: 1 },
        { at: 0.14, x: -0.02, rotate: -4 },
        { at: 0.34, x: 0.06, rotate: -2, scale: 1.06 },
        { at: 0.46, x: 0.07, rotate: -6, scale: 1.1 },
        { at: 0.62, x: 0.06, rotate: -4, scale: 1.06 },
        { at: 1, x: 0, rotate: 0, scale: 1 },
      ],
      sword: turn([0, 0], [0.3, -10], [0.6, -8], [1, 0]),
      cape: turn([0, 0], [0.34, 12], [0.5, 6], [0.7, -3], [1, 0]),
      head: turn([0, 0], [0.34, 4], [0.5, -2], [1, 0]),
      legs: [
        { at: 0, squash: 1 },
        { at: 0.14, squash: 1.08 },
        { at: 0.46, squash: 1.06 },
        { at: 1, squash: 1 },
      ],
    },
  },
  hurt: recoil(380, 1, {
    head: turn([0, 0], [0.16, -14], [0.42, 6], [1, 0]),
    shield: [
      { at: 0, rotate: 0, x: 0 },
      { at: 0.14, rotate: 10, x: -0.03 },
      { at: 0.45, rotate: -4, x: 0 },
      { at: 1, rotate: 0 },
    ],
    sword: turn([0, 0], [0.18, -18], [0.5, 6], [1, 0]),
    blade: turn([0, 0], [0.2, 14], [0.5, -4], [1, 0]),
    cape: turn([0, 0], [0.2, -12], [0.5, 6], [1, 0]),
  }),
  down: fall(640, {
    shield: [
      { at: 0, rotate: 0, x: 0, y: 0 },
      { at: 0.4, rotate: 10 },
      { at: 1, rotate: 38, x: 0.02, y: 0.04 },
    ],
    sword: turn([0, 0], [0.4, -20], [1, -50]),
    blade: turn([0, 0], [1, 20]),
    head: turn([0, 0], [0.55, -10], [1, -18]),
    cape: turn([0, 0], [0.5, -15], [1, -8]),
  }),
  revive: rise(820, {
    shield: [
      { at: 0, rotate: 38, x: 0.02, y: 0.04 },
      { at: 0.35, rotate: 20 },
      { at: 0.68, rotate: -6, y: -0.02 },
      { at: 1, rotate: 0, x: 0, y: 0 },
    ],
    sword: turn([0, -50], [0.35, -30], [0.68, 12], [1, 0]),
    blade: turn([0, 20], [0.68, -6], [1, 0]),
    head: turn([0, -18], [0.4, -8], [0.7, 4], [1, 0]),
    cape: turn([0, -8], [0.68, 8], [1, 0]),
  }),
});

/**
 * The Arcanist: light on its feet, and all the power is in the hand. It pulls
 * the spark back to the hip and throws it; for a signature the hand goes up
 * over the hat first. The hat's tip is the lag — it always arrives late.
 */
const arcanist: Rig = withFall({
  idle: {
    duration: 3200,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.35, y: -0.012, rotate: 0.8, squash: 0.996 },
      { at: 0.7, y: -0.006, rotate: -0.6 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      hand: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.3, rotate: -3, y: -0.006 },
        { at: 0.65, rotate: 2, y: 0.002 },
        { at: 1, rotate: 0, y: 0 },
      ],
      hat: turn([0, 0], [0.4, -3], [0.75, 2.5], [1, 0]),
      head: turn([0, 0], [0.35, 1.5], [0.8, -1], [1, 0]),
      book: turn([0, 0], [0.5, 2], [1, 0]),
      body: [
        { at: 0, squash: 1 },
        { at: 0.4, squash: 1.01 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Arcane spark: pull it back to the hip, throw it. */
  attack: {
    duration: 560,
    poses: [
      { at: 0, x: 0, rotate: 0, squash: 1 },
      { at: 0.28, x: -0.06, rotate: -3, squash: 1.04 },
      { at: 0.42, x: 0.1, rotate: 4, squash: 0.96 },
      { at: 0.6, x: 0.06, rotate: 2 },
      { at: 1, x: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      hand: [
        { at: 0, rotate: 0, x: 0, scale: 1 },
        { at: 0.28, rotate: 22, x: -0.05 },
        { at: 0.4, rotate: -8, x: 0.1, scale: 1.35 },
        { at: 0.56, rotate: -6, x: 0.07, scale: 1.12 },
        { at: 1, rotate: 0, x: 0, scale: 1 },
      ],
      hat: turn([0, 0], [0.3, 6], [0.46, -9], [0.7, 3], [1, 0]),
      head: turn([0, 0], [0.28, -3], [0.42, 4], [1, 0]),
      book: turn([0, 0], [0.3, -6], [0.45, 5], [1, 0]),
    },
  },
  /** Storm needle: the hand goes up over the hat, then comes down on them. */
  signature: {
    duration: 820,
    poses: [
      { at: 0, x: 0, y: 0, rotate: 0 },
      { at: 0.25, y: 0.015, squash: 1.08, rotate: -4 },
      { at: 0.42, y: -0.05, scale: 1.05, rotate: -2, squash: 0.97, flash: 0.3 },
      {
        at: 0.54,
        x: 0.12,
        y: -0.01,
        rotate: 6,
        squash: 0.9,
        scale: 1.08,
        flash: 0.7,
      },
      { at: 0.7, x: 0.06, rotate: 2, squash: 1, flash: 0.2 },
      { at: 1, x: 0, y: 0, rotate: 0, scale: 1, squash: 1, flash: 0 },
    ],
    parts: {
      hand: [
        { at: 0, rotate: 0, x: 0, y: 0, scale: 1 },
        { at: 0.25, rotate: -40, y: -0.02 },
        { at: 0.42, rotate: -95, y: -0.04, scale: 1.22 },
        { at: 0.54, rotate: 8, x: 0.06, y: 0, scale: 1.3 },
        { at: 0.7, rotate: 2, x: 0.03, scale: 1.1 },
        { at: 1, rotate: 0, x: 0, scale: 1 },
      ],
      book: turn([0, 0], [0.42, -30], [0.56, -10], [1, 0]),
      hat: turn([0, 0], [0.25, 8], [0.42, -10], [0.56, -14], [0.76, 6], [1, 0]),
      head: turn([0, 0], [0.42, -6], [0.54, 5], [1, 0]),
      legs: [
        { at: 0, squash: 1 },
        { at: 0.25, squash: 1.06 },
        { at: 0.54, squash: 0.96 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Cloudburst, break focus: both hands up, and it rises into the spell. */
  cast: {
    duration: 700,
    poses: [
      { at: 0, y: 0, scale: 1 },
      { at: 0.3, y: -0.05, scale: 1.04, flash: 0.2 },
      { at: 0.6, y: -0.04, scale: 1.03, flash: 0.45 },
      { at: 1, y: 0, scale: 1, flash: 0 },
    ],
    parts: {
      hand: [
        { at: 0, rotate: 0, y: 0, scale: 1 },
        { at: 0.3, rotate: -70, y: -0.02 },
        { at: 0.45, rotate: -78 },
        { at: 0.62, rotate: -72, scale: 1.18 },
        { at: 1, rotate: 0, y: 0, scale: 1 },
      ],
      book: turn([0, 0], [0.3, -45], [0.6, -50], [1, 0]),
      hat: turn([0, 0], [0.3, -6], [0.5, 4], [0.75, -3], [1, 0]),
      head: turn([0, 0], [0.3, -5], [0.6, -4], [1, 0]),
    },
  },
  /** Brace: the tome comes up in front and it hunches behind it. */
  block: {
    duration: 620,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.25, y: 0.02, squash: 1.08 },
      { at: 0.6, y: 0.015, squash: 1.05 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      book: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.25, rotate: -70, x: 0.03 },
        { at: 0.6, rotate: -64, x: 0.03 },
        { at: 1, rotate: 0, x: 0 },
      ],
      hand: turn([0, 0], [0.25, 35], [0.6, 30], [1, 0]),
      head: turn([0, 0], [0.25, 6], [0.6, 5], [1, 0]),
      hat: turn([0, 0], [0.3, 8], [0.6, 4], [1, 0]),
    },
  },
  hurt: recoil(360, 1.1, {
    hat: turn([0, 0], [0.18, -18], [0.45, 10], [0.75, -4], [1, 0]),
    hand: turn([0, 0], [0.16, -25], [0.5, 8], [1, 0]),
    head: turn([0, 0], [0.16, -10], [0.45, 4], [1, 0]),
    book: turn([0, 0], [0.18, -15], [0.5, 6], [1, 0]),
  }),
  down: fall(620, {
    hat: [
      { at: 0, rotate: 0, x: 0, y: 0 },
      { at: 0.5, rotate: -20 },
      { at: 1, rotate: -40, x: -0.03, y: 0.02 },
    ],
    hand: turn([0, 0], [0.5, -20], [1, -40]),
    book: turn([0, 0], [1, -30]),
    head: turn([0, 0], [1, -12]),
  }),
  revive: rise(800, {
    hat: [
      { at: 0, rotate: -40, x: -0.03, y: 0.02 },
      { at: 0.6, rotate: 10, x: 0, y: 0 },
      { at: 1, rotate: 0 },
    ],
    hand: turn([0, -40], [0.68, -60], [1, 0]),
    book: turn([0, -30], [0.68, -10], [1, 0]),
    head: turn([0, -12], [0.68, -4], [1, 0]),
  }),
});

/**
 * The Ranger: quick, low and never lunges. The drawing hand goes to the
 * string, pulls back to the cheek, holds for a beat and lets go — the arrow
 * leaves the hand, and the body rocks back from the shot rather than into it.
 */
const ranger: Rig = withFall({
  idle: {
    duration: 2900,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.25, y: -0.01, rotate: 1, squash: 0.995 },
      { at: 0.5, y: -0.003, rotate: 0.3 },
      { at: 0.75, y: -0.012, rotate: -0.6, squash: 1.004 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      // Watching the field: the head turns, the fingers worry the arrow.
      head: turn(
        [0, 0],
        [0.2, 2.5],
        [0.45, 2],
        [0.65, -2],
        [0.85, -1.5],
        [1, 0],
      ),
      bow: turn([0, 0], [0.4, -1.5], [0.8, 1], [1, 0]),
      draw: turn([0, 0], [0.3, -3], [0.6, 2], [1, 0]),
      arrow: turn([0, 0], [0.35, -5], [0.55, 3], [1, 0]),
      cloak: turn([0, 0.5], [0.45, 2.5], [0.85, -1], [1, 0.5]),
      quiver: turn([0, 0], [0.5, 1.5], [1, 0]),
    },
  },
  /** True shot: to the string, back to the cheek, hold, loose. */
  attack: {
    duration: 560,
    poses: [
      { at: 0, x: 0, rotate: 0, squash: 1 },
      { at: 0.2, x: 0.04, rotate: 2, squash: 1.03 },
      { at: 0.5, x: 0.07, rotate: 3 },
      { at: 0.6, x: 0.02, rotate: -3, squash: 0.97 },
      { at: 0.78, x: 0.01, rotate: -1 },
      { at: 1, x: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      draw: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.2, rotate: -95, x: 0.08 },
        { at: 0.45, rotate: -112, x: 0.03 },
        { at: 0.56, rotate: -112, x: 0.03 },
        { at: 0.62, rotate: -140, x: 0 },
        { at: 0.82, rotate: -60 },
        { at: 1, rotate: 0, x: 0 },
      ],
      // Counter-turned so it points at the enemy while drawn; gone on release.
      arrow: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.2, rotate: 79 },
        { at: 0.45, rotate: 96 },
        { at: 0.56, rotate: 96, scale: 1 },
        { at: 0.58, scale: 0 },
        { at: 0.9, rotate: 0, scale: 0 },
        { at: 1, rotate: 0, scale: 1 },
      ],
      bow: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.2, rotate: -6, x: 0.02 },
        { at: 0.56, rotate: -7, x: 0.02 },
        { at: 0.62, rotate: -1, x: 0.03 },
        { at: 0.72, rotate: -8 },
        { at: 1, rotate: 0, x: 0 },
      ],
      head: turn([0, 0], [0.2, 3], [0.56, 3], [0.62, -4], [1, 0]),
      cloak: turn([0, 0], [0.62, -6], [0.82, 3], [1, 0]),
      quiver: turn([0, 0], [0.62, -4], [1, 0]),
    },
  },
  /**
   * The choreographed draw, which ends holding at full draw: the bow comes
   * up, the drawing hand takes an arrow to the string, and pulls. The string
   * is two halves hinged at the nocks; their angles and stretch put the
   * middle exactly on the arrow's nock at each keyed pose (worked out from
   * the arm's shoulder, the arrow's pivot and the bow's), so the V follows
   * the hand back. The arrow is turned to point along the bow's grip.
   */
  aim: {
    duration: 520,
    poses: [
      { at: 0, x: 0, rotate: 0, squash: 1 },
      { at: 0.3, x: 0.02, rotate: 1, squash: 1.02, y: 0.004 },
      { at: 1, x: 0.035, rotate: -2, squash: 1.04, y: 0.008 },
    ],
    parts: {
      bow: [
        { at: 0, rotate: 0, x: 0, y: 0 },
        { at: 0.3, rotate: -8, x: 0.02, y: -0.012 },
        { at: 1, rotate: -4, x: 0.025, y: -0.01 },
      ],
      draw: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.22, rotate: -70, x: 0.03 },
        { at: 0.36, rotate: -92, x: 0.02 },
        { at: 1, rotate: -68, x: 0 },
      ],
      arrow: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.22, rotate: 60 },
        { at: 0.36, rotate: 81.4 },
        { at: 1, rotate: 50.1 },
      ],
      stringTop: [
        { at: 0, rotate: 0, scale: 1, squash: 1 },
        { at: 0.28, rotate: 0, scale: 1, squash: 1 },
        { at: 0.36, rotate: 38.2, scale: 0.984, squash: 1.016 },
        { at: 1, rotate: 34.6, scale: 1.081, squash: 0.925 },
      ],
      stringBottom: [
        { at: 0, rotate: 0, scale: 1, squash: 1 },
        { at: 0.28, rotate: 0, scale: 1, squash: 1 },
        { at: 0.36, rotate: -25.8, scale: 1.173, squash: 0.853 },
        { at: 1, rotate: -32.6, scale: 1.11, squash: 0.901 },
      ],
      head: turn([0, 0], [0.3, 3], [1, 5]),
      cloak: turn([0, 0], [1, -3]),
      legs: [
        { at: 0, squash: 1 },
        { at: 1, squash: 1.04 },
      ],
    },
  },
  /**
   * The loose, from full draw. The shot leaves at the marker, while the
   * drawn arrow is still on the string — the projectile layer measures the
   * arrow part there — and in the next instant the drawn arrow is gone, the
   * string snaps straight past its rest and back, the hand flies open behind
   * the head, the body rocks back from the shot, and then the bow comes down.
   * A fresh arrow is in the hand by the end.
   */
  release: {
    duration: 460,
    markers: { release: 0.08 },
    poses: [
      { at: 0, x: 0.035, rotate: -2, squash: 1.04, y: 0.008 },
      { at: 0.08, x: 0.035, rotate: -2, squash: 1.04, y: 0.008 },
      { at: 0.2, x: -0.03, rotate: -4, squash: 0.97, y: 0 },
      { at: 0.45, x: 0.005, rotate: 0.5, squash: 1 },
      { at: 1, x: 0, rotate: 0, squash: 1, y: 0 },
    ],
    parts: {
      bow: [
        { at: 0, rotate: -4, x: 0.025, y: -0.01 },
        { at: 0.08, rotate: -4, x: 0.025, y: -0.01 },
        { at: 0.18, rotate: 1, x: 0.035, y: -0.01 },
        { at: 0.4, rotate: -2, x: 0.02, y: -0.006 },
        { at: 1, rotate: 0, x: 0, y: 0 },
      ],
      draw: [
        { at: 0, rotate: -68, x: 0 },
        { at: 0.08, rotate: -68, x: 0 },
        { at: 0.22, rotate: -128, x: -0.02 },
        { at: 0.5, rotate: -100, x: -0.01 },
        { at: 1, rotate: 0, x: 0 },
      ],
      arrow: [
        { at: 0, rotate: 50.1, scale: 1 },
        { at: 0.08, rotate: 50.1, scale: 1 },
        { at: 0.1, rotate: 50.1, scale: 0 },
        { at: 0.82, rotate: 0, scale: 0 },
        { at: 1, rotate: 0, scale: 1 },
      ],
      stringTop: [
        { at: 0, rotate: 34.6, scale: 1.081, squash: 0.925 },
        { at: 0.08, rotate: 34.6, scale: 1.081, squash: 0.925 },
        { at: 0.14, rotate: -6, scale: 1, squash: 1 },
        { at: 0.2, rotate: 3, scale: 1, squash: 1 },
        { at: 0.28, rotate: 0, scale: 1, squash: 1 },
        { at: 1, rotate: 0, scale: 1, squash: 1 },
      ],
      stringBottom: [
        { at: 0, rotate: -32.6, scale: 1.11, squash: 0.901 },
        { at: 0.08, rotate: -32.6, scale: 1.11, squash: 0.901 },
        { at: 0.14, rotate: 6, scale: 1, squash: 1 },
        { at: 0.2, rotate: -3, scale: 1, squash: 1 },
        { at: 0.28, rotate: 0, scale: 1, squash: 1 },
        { at: 1, rotate: 0, scale: 1, squash: 1 },
      ],
      head: turn([0, 5], [0.08, 5], [0.2, -3], [0.5, 1], [1, 0]),
      cloak: turn([0, -3], [0.2, -8], [0.5, 3], [1, 0]),
      quiver: turn([0, 0], [0.2, -4], [0.6, 1], [1, 0]),
      legs: [
        { at: 0, squash: 1.04 },
        { at: 0.2, squash: 0.98 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Split the sky: the bow tips up and the shot goes high over the line. */
  signature: {
    duration: 820,
    poses: [
      { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.22, x: 0.05, rotate: -4, squash: 1.05, y: 0.01 },
      { at: 0.5, x: 0.08, rotate: -6, y: 0.012 },
      { at: 0.58, x: 0.03, rotate: -9, squash: 0.95, flash: 0.6 },
      { at: 0.76, x: 0.01, rotate: -2, flash: 0.1 },
      { at: 1, x: 0, y: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      bow: [
        { at: 0, rotate: 0, x: 0, y: 0 },
        { at: 0.22, rotate: -35, y: -0.03 },
        { at: 0.56, rotate: -38, y: -0.03 },
        { at: 0.62, rotate: -30, y: -0.02 },
        { at: 1, rotate: 0, y: 0 },
      ],
      draw: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.22, rotate: -122, x: 0.05 },
        { at: 0.45, rotate: -140, x: 0.02 },
        { at: 0.56, rotate: -140 },
        { at: 0.62, rotate: -168 },
        { at: 0.82, rotate: -70 },
        { at: 1, rotate: 0, x: 0 },
      ],
      arrow: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.22, rotate: 71 },
        { at: 0.45, rotate: 89 },
        { at: 0.56, rotate: 89, scale: 1 },
        { at: 0.58, scale: 0 },
        { at: 0.9, rotate: 0, scale: 0 },
        { at: 1, rotate: 0, scale: 1 },
      ],
      head: turn([0, 0], [0.22, -8], [0.56, -9], [0.64, -4], [1, 0]),
      cloak: turn([0, 0], [0.6, -8], [0.8, 4], [1, 0]),
      legs: [
        { at: 0, squash: 1 },
        { at: 0.22, squash: 1.06 },
        { at: 0.6, squash: 0.96 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Quarry sign: the arrow is a pointer, laid on the target. */
  cast: {
    duration: 640,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      { at: 0.3, x: 0.04, rotate: 2 },
      { at: 0.7, x: 0.03, rotate: 1.5, flash: 0.2 },
      { at: 1, x: 0, rotate: 0, flash: 0 },
    ],
    parts: {
      draw: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.3, rotate: -95, x: 0.06 },
        { at: 0.7, rotate: -92, x: 0.06 },
        { at: 1, rotate: 0, x: 0 },
      ],
      arrow: turn([0, 0], [0.3, 80], [0.7, 78], [1, 0]),
      bow: turn([0, 0], [0.3, 10], [0.7, 8], [1, 0]),
      head: turn([0, 0], [0.3, 4], [0.7, 3], [1, 0]),
    },
  },
  /** Brace: wraps the cloak round and gets small behind the bow. */
  block: {
    duration: 600,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.25, y: 0.025, squash: 1.1 },
      { at: 0.6, y: 0.02, squash: 1.07 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      cloak: turn([0, 0], [0.25, -24], [0.6, -20], [1, 0]),
      bow: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.25, rotate: -4, x: -0.04 },
        { at: 0.6, rotate: -3, x: -0.035 },
        { at: 1, rotate: 0, x: 0 },
      ],
      head: turn([0, 0], [0.25, 8], [0.6, 7], [1, 0]),
      draw: turn([0, 0], [0.25, -40], [0.6, -36], [1, 0]),
    },
  },
  hurt: recoil(360, 1.1, {
    head: turn([0, 0], [0.16, -12], [0.45, 5], [1, 0]),
    bow: turn([0, 0], [0.16, 12], [0.45, -4], [1, 0]),
    draw: turn([0, 0], [0.18, -30], [0.5, 8], [1, 0]),
    cloak: turn([0, 0], [0.2, -12], [0.5, 6], [1, 0]),
    quiver: turn([0, 0], [0.2, 8], [0.5, -3], [1, 0]),
  }),
  down: fall(600, {
    bow: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.5, rotate: 12 },
      { at: 1, rotate: 30, y: 0.05 },
    ],
    draw: turn([0, 0], [1, -45]),
    head: turn([0, 0], [1, -14]),
    cloak: turn([0, 0], [0.5, -12], [1, -6]),
    quiver: turn([0, 0], [1, 12]),
  }),
  revive: rise(780, {
    bow: [
      { at: 0, rotate: 30, y: 0.05 },
      { at: 0.68, rotate: -6, y: 0 },
      { at: 1, rotate: 0 },
    ],
    draw: turn([0, -45], [0.68, -20], [1, 0]),
    head: turn([0, -14], [0.68, -4], [1, 0]),
    cloak: turn([0, -6], [0.68, 6], [1, 0]),
    quiver: turn([0, 12], [1, 0]),
  }),
});

/**
 * The Warden: unhurried. The lantern on the staff is a pendulum and swings
 * off every movement. Healing is the slowest thing it does and the most
 * deliberate — staff lifted, the open hand offered up and out, head raised,
 * and a held glow — so it can never be mistaken for the lash it attacks with.
 */
const warden: Rig = withFall({
  idle: {
    duration: 3800,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.3, y: -0.01, rotate: -0.8, squash: 1.004 },
      { at: 0.62, y: -0.004, rotate: 0.5 },
      { at: 0.85, y: -0.012, rotate: 0.9, squash: 0.997 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      lantern: turn([0, 4], [0.25, -3], [0.5, 4], [0.75, -3], [1, 4]),
      staff: turn([0, 0], [0.5, 1.2], [1, 0]),
      hand: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.5, rotate: -4, y: -0.006 },
        { at: 1, rotate: 0, y: 0 },
      ],
      head: turn([0, 0], [0.4, -1.5], [0.8, 1], [1, 0]),
      body: [
        { at: 0, squash: 1 },
        { at: 0.5, squash: 1.01 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Thorn lash: the open hand whips out, the lantern swings after it. */
  attack: {
    duration: 600,
    poses: [
      { at: 0, x: 0, rotate: 0, squash: 1 },
      { at: 0.28, x: -0.05, rotate: -3, squash: 1.04 },
      { at: 0.44, x: 0.1, rotate: 4, squash: 0.96 },
      { at: 0.6, x: 0.05, rotate: 2 },
      { at: 1, x: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      hand: [
        { at: 0, rotate: 0, x: 0, scale: 1 },
        { at: 0.28, rotate: 25 },
        { at: 0.42, rotate: -35, x: 0.05, scale: 1.12 },
        { at: 0.56, rotate: -20, x: 0.03 },
        { at: 1, rotate: 0, x: 0, scale: 1 },
      ],
      staff: turn([0, 0], [0.28, -4], [0.45, 6], [1, 0]),
      lantern: turn([0, 0], [0.3, -8], [0.5, 14], [0.7, -6], [0.85, 3], [1, 0]),
      head: turn([0, 0], [0.28, -3], [0.45, 4], [1, 0]),
    },
  },
  /** Unravel: the staff comes up and is driven into the floor. */
  signature: {
    duration: 820,
    poses: [
      { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.25, y: -0.03, rotate: -3, squash: 0.96 },
      { at: 0.42, y: -0.04, rotate: -4 },
      { at: 0.52, x: 0.08, y: 0.01, rotate: 5, squash: 1.1, flash: 0.6 },
      { at: 0.7, x: 0.04, rotate: 2, squash: 1, flash: 0.15 },
      { at: 1, x: 0, y: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      staff: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.25, rotate: -6, y: -0.06 },
        { at: 0.42, rotate: -8, y: -0.07 },
        { at: 0.52, rotate: 14, y: 0 },
        { at: 0.7, rotate: 8 },
        { at: 1, rotate: 0, y: 0 },
      ],
      lantern: turn(
        [0, 0],
        [0.25, 10],
        [0.45, 16],
        [0.55, -24],
        [0.7, 14],
        [0.85, -6],
        [1, 0],
      ),
      hand: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.4, rotate: 20 },
        { at: 0.52, rotate: -30, x: 0.05 },
        { at: 0.8, rotate: -10, x: 0.01 },
        { at: 1, rotate: 0, x: 0 },
      ],
      head: turn([0, 0], [0.42, -4], [0.52, 5], [1, 0]),
      legs: [
        { at: 0, squash: 1 },
        { at: 0.52, squash: 1.08 },
        { at: 0.7, squash: 1 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Mending roots: staff lifted, the open hand offered up and out, held. */
  cast: {
    duration: 900,
    poses: [
      { at: 0, y: 0, scale: 1, flash: 0 },
      { at: 0.3, y: -0.035, scale: 1.03, flash: 0.15 },
      { at: 0.55, y: -0.045, scale: 1.04, flash: 0.5 },
      { at: 0.75, y: -0.03, scale: 1.02, flash: 0.3 },
      { at: 1, y: 0, scale: 1, flash: 0 },
    ],
    parts: {
      hand: [
        { at: 0, rotate: 0, x: 0, scale: 1 },
        { at: 0.3, rotate: -40, x: 0.02 },
        { at: 0.55, rotate: -62, x: 0.04, scale: 1.15 },
        { at: 0.75, rotate: -55, x: 0.03, scale: 1.1 },
        { at: 1, rotate: 0, x: 0, scale: 1 },
      ],
      staff: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.3, rotate: 4, y: -0.05 },
        { at: 0.55, rotate: 6, y: -0.07 },
        { at: 0.75, rotate: 5, y: -0.05 },
        { at: 1, rotate: 0, y: 0 },
      ],
      lantern: turn([0, 0], [0.3, -8], [0.5, 6], [0.7, -4], [0.85, 2], [1, 0]),
      head: turn([0, 0], [0.3, -5], [0.6, -7], [0.8, -4], [1, 0]),
      body: [
        { at: 0, squash: 1 },
        { at: 0.55, squash: 0.98 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Brace: leans into the staff and draws the open hand in. */
  block: {
    duration: 620,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.25, y: 0.02, squash: 1.08 },
      { at: 0.6, y: 0.015, squash: 1.05 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      staff: turn([0, 0], [0.25, 14], [0.6, 12], [1, 0]),
      hand: turn([0, 0], [0.25, 32], [0.6, 28], [1, 0]),
      head: turn([0, 0], [0.25, 7], [0.6, 6], [1, 0]),
      lantern: turn([0, 0], [0.3, -14], [0.55, 8], [0.8, -3], [1, 0]),
    },
  },
  hurt: recoil(360, 1, {
    head: turn([0, 0], [0.16, -12], [0.45, 5], [1, 0]),
    staff: turn([0, 0], [0.16, -8], [0.45, 4], [1, 0]),
    lantern: turn([0, 0], [0.2, -18], [0.45, 14], [0.7, -6], [1, 0]),
    hand: turn([0, 0], [0.16, -28], [0.5, 8], [1, 0]),
  }),
  down: fall(640, {
    staff: turn([0, 0], [0.5, -12], [1, -26]),
    // The lantern keeps hanging towards the floor as the Warden goes over.
    lantern: turn([0, 0], [0.55, 40], [0.8, 84], [1, 76]),
    hand: turn([0, 0], [1, -40]),
    head: turn([0, 0], [1, -14]),
  }),
  revive: rise(820, {
    staff: turn([0, -26], [0.68, 4], [1, 0]),
    lantern: turn([0, 76], [0.35, 40], [0.7, -10], [0.85, 5], [1, 0]),
    hand: turn([0, -40], [0.68, -50], [1, 0]),
    head: turn([0, -14], [0.68, -5], [1, 0]),
  }),
});

/**
 * The Broker: portly and pleased with itself. The belly breathes, the pouches
 * jingle, and the balance never quite settles. A basic appraisal is a sharp
 * rap with the balance; a leveraged strike brings the ledger over the top of
 * the cap and down on someone.
 */
const broker: Rig = withFall({
  idle: {
    duration: 3300,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.4, y: -0.008, rotate: -0.5, squash: 1.012 },
      { at: 0.75, y: -0.003, rotate: 0.4, squash: 0.996 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      // Always weighing something.
      pans: turn([0, 3], [0.3, -2.5], [0.55, 2], [0.8, -3], [1, 3]),
      scales: turn([0, 0], [0.5, -1.5], [1, 0]),
      purse: turn([0, 0], [0.42, 3], [0.7, -2], [1, 0]),
      head: turn([0, 0], [0.35, 2], [0.7, -1], [1, 0]),
      ledger: turn([0, 0], [0.6, -2], [1, 0]),
      body: [
        { at: 0, squash: 1, y: 0 },
        { at: 0.4, squash: 1.018, y: 0.003 },
        { at: 1, squash: 1, y: 0 },
      ],
    },
  },
  /** Appraise: a sharp rap with the balance, pans flying. */
  attack: {
    duration: 580,
    poses: [
      { at: 0, x: 0, y: 0, squash: 1 },
      { at: 0.28, x: -0.04, y: 0.01, squash: 1.06 },
      { at: 0.44, x: 0.1, y: -0.03, squash: 0.95, rotate: 4 },
      { at: 0.6, x: 0.06, y: 0, rotate: 2 },
      { at: 1, x: 0, y: 0, squash: 1, rotate: 0 },
    ],
    parts: {
      scales: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.28, rotate: -32 },
        { at: 0.44, rotate: 18, x: 0.04 },
        { at: 0.6, rotate: 10, x: 0.02 },
        { at: 1, rotate: 0, x: 0 },
      ],
      pans: turn([0, 0], [0.3, 14], [0.46, -26], [0.6, 18], [0.78, -8], [1, 0]),
      purse: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.44, rotate: -10, y: -0.012 },
        { at: 0.6, rotate: 8, y: 0 },
        { at: 1, rotate: 0 },
      ],
      head: turn([0, 0], [0.28, -4], [0.44, 5], [1, 0]),
    },
  },
  /** Leveraged strike: the ledger comes over the cap and down. */
  signature: {
    duration: 860,
    poses: [
      { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.25, x: -0.08, rotate: -6, squash: 1.08, y: 0.01 },
      { at: 0.4, x: -0.09, rotate: -7, flash: 0.3 },
      { at: 0.52, x: 0.2, rotate: 9, squash: 0.86, scale: 1.06, flash: 0.7 },
      { at: 0.66, x: 0.14, rotate: 5, squash: 0.97, flash: 0.2 },
      { at: 1, x: 0, y: 0, rotate: 0, squash: 1, scale: 1, flash: 0 },
    ],
    parts: {
      ledger: turn(
        [0, 0],
        [0.25, 40],
        [0.4, 50],
        [0.52, 215],
        [0.64, 225],
        [0.85, 320],
        [1, 360],
      ),
      scales: turn([0, 0], [0.25, 20], [0.52, -10], [0.7, 6], [1, 0]),
      pans: turn(
        [0, 0],
        [0.3, 16],
        [0.52, -30],
        [0.66, 20],
        [0.82, -8],
        [1, 0],
      ),
      purse: turn([0, 0], [0.3, 8], [0.52, -18], [0.7, 10], [1, 0]),
      head: turn([0, 0], [0.3, -6], [0.52, 8], [1, 0]),
      legs: [
        { at: 0, squash: 1 },
        { at: 0.28, squash: 1.08 },
        { at: 0.52, squash: 0.94 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Underwrite: a little bow over a balance held perfectly level. */
  cast: {
    duration: 700,
    poses: [
      { at: 0, rotate: 0, y: 0, flash: 0 },
      { at: 0.3, rotate: 5, y: 0.01, flash: 0.2 },
      { at: 0.6, rotate: 3, y: 0.005, flash: 0.45 },
      { at: 1, rotate: 0, y: 0, flash: 0 },
    ],
    parts: {
      scales: [
        { at: 0, rotate: 0, x: 0, scale: 1 },
        { at: 0.3, rotate: -24, x: 0.04, scale: 1.08 },
        { at: 0.65, rotate: -22, x: 0.04, scale: 1.08 },
        { at: 1, rotate: 0, x: 0, scale: 1 },
      ],
      // counter-turned so the beam hangs dead level while the arm is up
      pans: turn([0, 0], [0.3, 24], [0.65, 22], [1, 0]),
      head: turn([0, 0], [0.3, 9], [0.65, 7], [1, 0]),
      ledger: turn([0, 0], [0.3, -12], [0.65, -10], [1, 0]),
      purse: turn([0, 0], [0.3, -6], [0.5, 5], [0.7, -3], [1, 0]),
    },
  },
  /** Brace: clutches the ledger to its chest like it is the money. */
  block: {
    duration: 600,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.25, y: 0.02, squash: 1.08 },
      { at: 0.6, y: 0.015, squash: 1.05 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      ledger: turn([0, 0], [0.25, -70], [0.6, -64], [1, 0]),
      scales: turn([0, 0], [0.25, 26], [0.6, 22], [1, 0]),
      pans: turn([0, 0], [0.3, -12], [0.55, 8], [0.8, -3], [1, 0]),
      head: turn([0, 0], [0.25, 7], [0.6, 6], [1, 0]),
    },
  },
  hurt: recoil(360, 1, {
    head: turn([0, 0], [0.16, -12], [0.45, 5], [1, 0]),
    scales: turn([0, 0], [0.16, -22], [0.5, 8], [1, 0]),
    pans: turn([0, 0], [0.18, 30], [0.4, -22], [0.62, 12], [0.82, -5], [1, 0]),
    purse: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.18, rotate: -14, y: -0.015 },
      { at: 0.5, rotate: 8, y: 0 },
      { at: 1, rotate: 0 },
    ],
    ledger: turn([0, 0], [0.18, 16], [0.5, -5], [1, 0]),
  }),
  down: fall(660, {
    scales: turn([0, 0], [0.5, -20], [1, -40]),
    pans: turn([0, 0], [0.6, 50], [1, 70]),
    ledger: turn([0, 0], [1, -30]),
    purse: turn([0, 0], [1, 40]),
    head: turn([0, 0], [1, -12]),
  }),
  revive: rise(840, {
    scales: turn([0, -40], [0.68, -10], [1, 0]),
    pans: turn([0, 70], [0.4, 30], [0.7, -12], [0.85, 5], [1, 0]),
    ledger: turn([0, -30], [0.68, 6], [1, 0]),
    purse: turn([0, 40], [0.68, -8], [1, 0]),
    head: turn([0, -12], [0.68, -4], [1, 0]),
  }),
});

/**
 * The Herald: upright and proud, and the flag never stops moving. A rallying
 * note is the horn brought up to the lips and blown, chest out; anything it
 * does for the party is the banner lifted and waved.
 */
const herald: Rig = withFall({
  idle: {
    duration: 3000,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.35, y: -0.012, rotate: -0.6, squash: 0.995 },
      { at: 0.7, y: -0.004, rotate: 0.4 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      // The flag ripples: it narrows and swells against the pole.
      flag: [
        { at: 0, rotate: 0, squash: 1 },
        { at: 0.25, rotate: -3, squash: 0.93 },
        { at: 0.5, rotate: 1.5, squash: 1.04 },
        { at: 0.75, rotate: -2, squash: 0.96 },
        { at: 1, rotate: 0, squash: 1 },
      ],
      banner: turn([0, 0], [0.5, -1.5], [1, 0]),
      horn: turn([0, 0], [0.45, 2], [1, 0]),
      head: turn([0, 0], [0.4, -1.5], [0.8, 1], [1, 0]),
    },
  },
  /** Rallying note: the horn comes up to the lips and is blown, hard. */
  attack: {
    duration: 660,
    poses: [
      { at: 0, x: 0, y: 0, scale: 1, squash: 1 },
      { at: 0.3, x: -0.03, y: 0.01, squash: 1.05, rotate: -2 },
      {
        at: 0.42,
        x: 0.07,
        y: -0.02,
        scale: 1.06,
        squash: 0.97,
        rotate: -4,
        flash: 0.4,
      },
      { at: 0.64, x: 0.05, y: -0.02, scale: 1.05, rotate: -3, flash: 0.2 },
      { at: 1, x: 0, y: 0, scale: 1, squash: 1, rotate: 0, flash: 0 },
    ],
    parts: {
      horn: [
        { at: 0, rotate: 0, x: 0, y: 0, scale: 1 },
        { at: 0.25, rotate: -60, y: -0.03 },
        { at: 0.38, rotate: -100, x: 0.03, y: -0.08 },
        { at: 0.64, rotate: -102, x: 0.03, y: -0.08, scale: 1.06 },
        { at: 0.82, rotate: -50, y: -0.03, scale: 1 },
        { at: 1, rotate: 0, x: 0, y: 0 },
      ],
      head: turn([0, 0], [0.3, -4], [0.4, -9], [0.64, -9], [0.82, -3], [1, 0]),
      flag: [
        { at: 0, rotate: 0, squash: 1 },
        { at: 0.42, rotate: -8, squash: 1.1 },
        { at: 0.52, rotate: 6, squash: 0.9 },
        { at: 0.7, rotate: -4, squash: 1.03 },
        { at: 1, rotate: 0, squash: 1 },
      ],
      banner: turn([0, 0], [0.42, -3], [0.6, 2], [1, 0]),
    },
  },
  /** A thrust with the banner's spiked head, the flag streaming. */
  signature: {
    duration: 760,
    poses: [
      { at: 0, x: 0, rotate: 0, squash: 1 },
      { at: 0.25, x: -0.08, rotate: -6, squash: 1.08 },
      { at: 0.48, x: 0.24, rotate: 9, squash: 0.88, scale: 1.05, flash: 0.5 },
      { at: 0.64, x: 0.17, rotate: 5, flash: 0.15 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1, flash: 0 },
    ],
    parts: {
      banner: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.25, rotate: -10, x: -0.03 },
        { at: 0.48, rotate: 26, x: 0.06 },
        { at: 0.64, rotate: 20, x: 0.05 },
        { at: 1, rotate: 0, x: 0 },
      ],
      flag: [
        { at: 0, rotate: 0, squash: 1 },
        { at: 0.3, rotate: 10, squash: 0.9 },
        { at: 0.52, rotate: -14, squash: 1.12 },
        { at: 0.7, rotate: 6, squash: 0.96 },
        { at: 1, rotate: 0, squash: 1 },
      ],
      horn: turn([0, 0], [0.25, 20], [0.48, -12], [1, 0]),
      head: turn([0, 0], [0.25, -5], [0.48, 6], [1, 0]),
    },
  },
  /** Battle anthem, cadence: the banner goes up and is waved over the party. */
  cast: {
    duration: 780,
    poses: [
      { at: 0, y: 0, scale: 1, flash: 0 },
      { at: 0.25, y: -0.03, scale: 1.03, flash: 0.2 },
      { at: 0.55, y: -0.035, scale: 1.04, flash: 0.45 },
      { at: 0.8, y: -0.02, scale: 1.02, flash: 0.15 },
      { at: 1, y: 0, scale: 1, flash: 0 },
    ],
    parts: {
      banner: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.25, rotate: -6, y: -0.06 },
        { at: 0.45, rotate: 8, y: -0.07 },
        { at: 0.65, rotate: -6, y: -0.06 },
        { at: 0.85, rotate: 3, y: -0.02 },
        { at: 1, rotate: 0, y: 0 },
      ],
      flag: [
        { at: 0, rotate: 0, squash: 1 },
        { at: 0.25, rotate: 8, squash: 0.9 },
        { at: 0.45, rotate: -12, squash: 1.1 },
        { at: 0.65, rotate: 10, squash: 0.92 },
        { at: 0.85, rotate: -4, squash: 1.03 },
        { at: 1, rotate: 0, squash: 1 },
      ],
      horn: turn([0, 0], [0.3, -30], [0.7, -26], [1, 0]),
      head: turn([0, 0], [0.3, -6], [0.7, -5], [1, 0]),
    },
  },
  /** Brace: plants the banner and sets its feet behind it. */
  block: {
    duration: 620,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.25, y: 0.02, squash: 1.08 },
      { at: 0.6, y: 0.015, squash: 1.05 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      banner: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.25, rotate: -8, y: 0.02 },
        { at: 0.6, rotate: -7, y: 0.02 },
        { at: 1, rotate: 0, y: 0 },
      ],
      flag: turn([0, 0], [0.3, 10], [0.55, -6], [0.8, 3], [1, 0]),
      horn: turn([0, 0], [0.25, -30], [0.6, -26], [1, 0]),
      head: turn([0, 0], [0.25, 7], [0.6, 6], [1, 0]),
    },
  },
  hurt: recoil(360, 1, {
    head: turn([0, 0], [0.16, -12], [0.45, 5], [1, 0]),
    banner: turn([0, 0], [0.16, -10], [0.45, 5], [1, 0]),
    flag: turn([0, 0], [0.2, 12], [0.45, -10], [0.7, 4], [1, 0]),
    horn: turn([0, 0], [0.18, -24], [0.5, 8], [1, 0]),
  }),
  down: fall(640, {
    banner: turn([0, 0], [0.5, 20], [1, 44]),
    flag: [
      { at: 0, rotate: 0, squash: 1 },
      { at: 1, rotate: 30, squash: 0.8 },
    ],
    horn: turn([0, 0], [1, -30]),
    head: turn([0, 0], [1, -12]),
  }),
  revive: rise(820, {
    banner: turn([0, 44], [0.5, 10], [0.7, -8], [1, 0]),
    flag: [
      { at: 0, rotate: 30, squash: 0.8 },
      { at: 0.7, rotate: -10, squash: 1.1 },
      { at: 1, rotate: 0, squash: 1 },
    ],
    horn: turn([0, -30], [0.68, -40], [1, 0]),
    head: turn([0, -12], [0.68, -6], [1, 0]),
  }),
});

/**
 * The Reaver: reckless, and it overshoots everything. The cleaver comes up off
 * the floor and over the mane, and the lunge carries past where a sensible
 * fighter would stop; the recovery is a stumble. Its idle heaves, and it is
 * the only hero that leans towards the enemy while standing still.
 */
const reaver: Rig = withFall({
  idle: {
    duration: 2700,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0.8, squash: 1 },
      { at: 0.3, y: -0.014, rotate: 2, squash: 1.02 },
      { at: 0.5, y: -0.004, rotate: 1.2 },
      { at: 0.8, y: -0.016, rotate: 2.3, squash: 0.99 },
      { at: 1, y: 0, rotate: 0.8, squash: 1 },
    ],
    parts: {
      body: [
        { at: 0, squash: 1, y: 0 },
        { at: 0.3, squash: 1.03, y: -0.004 },
        { at: 0.6, squash: 0.99, y: 0 },
        { at: 1, squash: 1, y: 0 },
      ],
      hair: turn([0, 0], [0.25, -3], [0.5, 2], [0.75, -2], [1, 0]),
      fist: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.3, rotate: -4, scale: 1.05 },
        { at: 0.5, rotate: 2, scale: 1 },
        { at: 0.75, rotate: -3, scale: 1.04 },
        { at: 1, rotate: 0, scale: 1 },
      ],
      cleaver: turn([0, 0], [0.5, 1.5], [1, 0]),
      head: turn([0, 0], [0.3, 3], [0.6, -1], [1, 0]),
    },
  },
  /** Rend: off the floor, over the mane, down — and too far. */
  attack: {
    duration: 640,
    poses: [
      { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.22, x: -0.1, y: 0.015, rotate: -8, squash: 1.1 },
      { at: 0.36, x: -0.06, y: -0.02, rotate: -10, squash: 0.95 },
      { at: 0.48, x: 0.3, y: 0.01, rotate: 14, squash: 0.84, scale: 1.08 },
      { at: 0.62, x: 0.24, rotate: 10, squash: 1.02, scale: 1.02 },
      { at: 0.8, x: 0.08, rotate: 3, scale: 1 },
      { at: 1, x: 0, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      cleaver: turn(
        [0, 0],
        [0.22, 40],
        [0.36, 110],
        [0.48, 250],
        [0.6, 262],
        [0.8, 320],
        [1, 360],
      ),
      fist: turn([0, 0], [0.22, 20], [0.48, -30], [0.7, -10], [1, 0]),
      hair: turn([0, 0], [0.22, 6], [0.4, -10], [0.5, 14], [0.7, -6], [1, 0]),
      head: turn([0, 0], [0.22, -6], [0.48, 10], [0.7, 3], [1, 0]),
      legs: [
        { at: 0, squash: 1 },
        { at: 0.22, squash: 1.08 },
        { at: 0.5, squash: 0.92 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Blood price, frenzy: two chops, the second one bigger. */
  signature: {
    duration: 920,
    poses: [
      { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.15, x: -0.08, rotate: -7, squash: 1.08, y: 0.01 },
      { at: 0.36, x: 0.22, rotate: 12, squash: 0.86, flash: 0.5 },
      { at: 0.46, x: 0.18, rotate: 2, y: -0.02, squash: 1 },
      { at: 0.56, x: 0.34, rotate: 15, squash: 0.84, scale: 1.08, flash: 0.8 },
      { at: 0.7, x: 0.26, rotate: 10, flash: 0.2 },
      { at: 1, x: 0, y: 0, rotate: 0, squash: 1, scale: 1, flash: 0 },
    ],
    parts: {
      cleaver: turn(
        [0, 0],
        [0.15, 40],
        [0.26, 110],
        [0.36, 250],
        [0.46, 160],
        [0.56, 290],
        [0.7, 300],
        [0.88, 340],
        [1, 360],
      ),
      fist: turn(
        [0, 0],
        [0.15, 18],
        [0.36, -24],
        [0.46, 10],
        [0.56, -34],
        [0.8, -8],
        [1, 0],
      ),
      hair: turn(
        [0, 0],
        [0.15, 6],
        [0.3, -10],
        [0.38, 12],
        [0.48, -8],
        [0.58, 16],
        [0.75, -6],
        [1, 0],
      ),
      head: turn(
        [0, 0],
        [0.15, -6],
        [0.36, 9],
        [0.46, -2],
        [0.56, 12],
        [0.8, 3],
        [1, 0],
      ),
      legs: [
        { at: 0, squash: 1 },
        { at: 0.15, squash: 1.06 },
        { at: 0.36, squash: 0.92 },
        { at: 0.46, squash: 1.04 },
        { at: 0.56, squash: 0.9 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** A war-cry: head back, fist up, bigger for a moment than it is. */
  cast: {
    duration: 700,
    poses: [
      { at: 0, y: 0, scale: 1, flash: 0 },
      { at: 0.25, y: 0.015, squash: 1.06 },
      { at: 0.45, y: -0.025, scale: 1.07, squash: 0.96, flash: 0.35 },
      { at: 0.7, y: -0.015, scale: 1.04, flash: 0.1 },
      { at: 1, y: 0, scale: 1, squash: 1, flash: 0 },
    ],
    parts: {
      fist: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.3, rotate: -60 },
        { at: 0.45, rotate: -95, scale: 1.2 },
        { at: 0.7, rotate: -88, scale: 1.1 },
        { at: 1, rotate: 0, scale: 1 },
      ],
      head: turn([0, 0], [0.3, -6], [0.45, -13], [0.7, -10], [1, 0]),
      hair: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.45, rotate: -8, scale: 1.1 },
        { at: 0.7, rotate: -4, scale: 1.05 },
        { at: 1, rotate: 0, scale: 1 },
      ],
      cleaver: turn([0, 0], [0.45, 14], [1, 0]),
    },
  },
  /** Brace: fist up in front of the face, head down, and it waits for it. */
  block: {
    duration: 600,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.25, y: 0.02, squash: 1.08 },
      { at: 0.6, y: 0.015, squash: 1.05 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      fist: turn([0, 0], [0.25, -42], [0.6, -38], [1, 0]),
      head: turn([0, 0], [0.25, 9], [0.6, 8], [1, 0]),
      cleaver: turn([0, 0], [0.25, -14], [0.6, -12], [1, 0]),
      hair: turn([0, 0], [0.3, 6], [0.6, 3], [1, 0]),
    },
  },
  /** It takes the hit, snarls, and leans straight back into it. */
  hurt: {
    duration: 420,
    poses: [
      { at: 0, x: 0, flash: 0.9 },
      { at: 0.14, x: -0.11, rotate: -7, squash: 0.9, flash: 0.6 },
      { at: 0.4, x: 0.05, rotate: 5, squash: 1.05 },
      { at: 0.65, x: 0.02, rotate: 2 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      head: turn([0, 0], [0.14, -14], [0.4, 9], [0.7, 2], [1, 0]),
      hair: turn([0, 0], [0.16, 14], [0.4, -10], [0.65, 5], [1, 0]),
      fist: turn([0, 0], [0.14, -20], [0.4, -30], [0.7, -8], [1, 0]),
      cleaver: turn([0, 0], [0.16, 10], [0.45, -4], [1, 0]),
    },
  },
  down: fall(600, {
    cleaver: turn([0, 0], [0.5, -10], [1, -26]),
    fist: turn([0, 0], [0.5, -30], [1, -50]),
    head: turn([0, 0], [1, -16]),
    hair: turn([0, 0], [0.5, 10], [1, 20]),
  }),
  revive: rise(760, {
    cleaver: turn([0, -26], [0.68, 10], [1, 0]),
    fist: turn([0, -50], [0.68, -80], [1, 0]),
    head: turn([0, -16], [0.68, -10], [1, 0]),
    hair: turn([0, 20], [0.68, -8], [1, 0]),
  }),
});

/**
 * The Beguiler: slow, and wrong. The head tilts further than a head should
 * and the puppet on the strings is always swinging a little out of time with
 * everything else. It attacks by yanking the control; it beguiles by holding
 * the mirror up to the enemy.
 */
const beguiler: Rig = withFall({
  idle: {
    duration: 3500,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.3, y: -0.01, rotate: -1.2, squash: 0.996 },
      { at: 0.65, y: -0.004, rotate: 1 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      head: turn([0, 0], [0.3, 5], [0.45, 6], [0.7, -2], [1, 0]),
      strings: turn(
        [0, 5],
        [0.3, -4],
        [0.42, -2],
        [0.62, 6],
        [0.8, -3],
        [1, 5],
      ),
      control: turn([0, 0], [0.4, -3], [0.46, 1], [0.8, -2], [1, 0]),
      shard: turn([0, 0], [0.5, -2.5], [1, 0]),
      body: [
        { at: 0, squash: 1 },
        { at: 0.5, squash: 1.01 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Ill whisper: the control is yanked and the puppet jerks. */
  attack: {
    duration: 620,
    poses: [
      { at: 0, x: 0, rotate: 0, squash: 1 },
      { at: 0.28, x: -0.03, rotate: -3, squash: 1.03 },
      { at: 0.44, x: 0.06, rotate: 4, squash: 0.97 },
      { at: 0.62, x: 0.04, rotate: 2 },
      { at: 1, x: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      control: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.28, rotate: 10, y: 0.02 },
        { at: 0.42, rotate: -24, y: -0.04 },
        { at: 0.56, rotate: -14, y: -0.03 },
        { at: 1, rotate: 0, y: 0 },
      ],
      strings: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.3, rotate: -10 },
        { at: 0.45, rotate: 26, y: -0.04 },
        { at: 0.6, rotate: -18, y: 0 },
        { at: 0.75, rotate: 8 },
        { at: 0.9, rotate: -3 },
        { at: 1, rotate: 0 },
      ],
      head: turn([0, 0], [0.28, -4], [0.44, 9], [0.7, 4], [1, 0]),
      shard: turn([0, 0], [0.44, -8], [1, 0]),
    },
  },
  /** Unpick the seam: up high, then down hard — the puppet goes over. */
  signature: {
    duration: 840,
    poses: [
      { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.3, y: -0.03, rotate: -4, scale: 1.03 },
      { at: 0.46, x: 0.08, y: 0.01, rotate: 6, squash: 0.92, flash: 0.6 },
      { at: 0.62, x: 0.05, rotate: 3, flash: 0.15 },
      { at: 1, x: 0, y: 0, rotate: 0, squash: 1, scale: 1, flash: 0 },
    ],
    parts: {
      control: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.3, rotate: -40, y: -0.05 },
        { at: 0.46, rotate: 30, y: 0.03 },
        { at: 0.62, rotate: 18, y: 0.02 },
        { at: 1, rotate: 0, y: 0 },
      ],
      strings: turn(
        [0, 0],
        [0.3, -22],
        [0.48, 60],
        [0.62, -40],
        [0.78, 16],
        [0.9, -6],
        [1, 0],
      ),
      shard: turn([0, 0], [0.3, -60], [0.5, -40], [1, 0]),
      head: turn([0, 0], [0.3, -6], [0.46, 10], [1, 0]),
    },
  },
  /** Beguile: the mirror is held up to the enemy and catches the light. */
  cast: {
    duration: 780,
    poses: [
      { at: 0, y: 0, scale: 1, flash: 0 },
      { at: 0.3, y: -0.025, scale: 1.03 },
      { at: 0.5, y: -0.03, scale: 1.04, flash: 0.55 },
      { at: 0.75, y: -0.02, scale: 1.02, flash: 0.2 },
      { at: 1, y: 0, scale: 1, flash: 0 },
    ],
    parts: {
      // Up over the shoulder and held aloft, facing them.
      shard: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.3, rotate: 140 },
        { at: 0.5, rotate: 152, scale: 1.2 },
        { at: 0.75, rotate: 146, scale: 1.1 },
        { at: 1, rotate: 0, scale: 1 },
      ],
      control: turn([0, 0], [0.3, 8], [0.75, 6], [1, 0]),
      strings: turn(
        [0, 0],
        [0.25, 12],
        [0.45, -14],
        [0.65, 10],
        [0.85, -4],
        [1, 0],
      ),
      head: turn([0, 0], [0.3, 8], [0.5, 12], [0.75, 8], [1, 0]),
    },
  },
  /** Brace: the mirror comes up in front, the puppet is drawn in. */
  block: {
    duration: 600,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.25, y: 0.02, squash: 1.08 },
      { at: 0.6, y: 0.015, squash: 1.05 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      shard: turn([0, 0], [0.25, -80], [0.6, -74], [1, 0]),
      control: turn([0, 0], [0.25, 30], [0.6, 26], [1, 0]),
      strings: turn([0, 0], [0.3, -16], [0.55, 10], [0.8, -4], [1, 0]),
      head: turn([0, 0], [0.25, 8], [0.6, 7], [1, 0]),
    },
  },
  hurt: recoil(360, 1.1, {
    head: turn([0, 0], [0.16, -14], [0.45, 6], [1, 0]),
    control: turn([0, 0], [0.16, -25], [0.5, 8], [1, 0]),
    strings: turn([0, 0], [0.18, 30], [0.4, -22], [0.6, 12], [0.8, -5], [1, 0]),
    shard: turn([0, 0], [0.16, -20], [0.5, 6], [1, 0]),
  }),
  down: fall(640, {
    // The puppet keeps hanging towards the floor as the Beguiler goes over.
    strings: turn([0, 0], [0.55, 40], [0.8, 80], [1, 70]),
    control: turn([0, 0], [1, -30]),
    shard: turn([0, 0], [1, -40]),
    head: turn([0, 0], [1, -14]),
  }),
  revive: rise(820, {
    strings: turn([0, 70], [0.4, 30], [0.7, -12], [0.85, 5], [1, 0]),
    control: turn([0, -30], [0.68, -12], [1, 0]),
    shard: turn([0, -40], [0.68, -20], [1, 0]),
    head: turn([0, -14], [0.68, 6], [1, 0]),
  }),
});

export const PARTY_RIGS: Record<string, Rig> = {
  vanguard,
  arcanist,
  ranger,
  warden,
  broker,
  herald,
  reaver,
  beguiler,
};
