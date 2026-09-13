import type { Clip, Pose, Rig } from "../../battle/animation";

/**
 * The Aegis Knight's Breakwater performances.
 *
 * The Knight's acting is the opposite of the Lantern Wall's and the
 * Breaker's: those two go somewhere. This one sets itself once and then does
 * not move — the root barely travels in any clip here, and when the wave
 * lands the figure gives a few hundredths and no more. Everything that would
 * be motion in another hero goes into the cape, the helm's angle and the
 * sword arm, so stillness reads as a choice rather than as a frozen rig.
 *
 * The set pose: shield drawn in and down so it covers the body, weight
 * dropped through wide legs, helm lowered behind the rim, and the sword
 * turned point-down behind the Knight — a hero that has stopped attacking.
 */

const turn = (...keys: [number, number][]): Pose[] =>
  keys.map(([at, rotate]) => ({ at, rotate }));

/** Where every clip in this file settles: the Knight, set. */
const SET = {
  root: { x: -0.01, y: 0.016, rotate: 1.5, squash: 1.05 },
  shield: { x: -0.035, y: 0.03, rotate: 5, scale: 1.1 },
  sword: 18,
  blade: -148,
  head: 9,
  headY: 0.018,
  legs: 1.1,
  body: 1.04,
};

/** The Knight sets itself: shield in, weight down, sword turned point-down. */
const set: Clip = {
  duration: 620,
  markers: { contact: 0.42 },
  poses: [
    { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
    // A breath in: up a little, the shield lifted off the body.
    { at: 0.22, x: 0.005, y: -0.018, rotate: -1.5, squash: 0.97 },
    // Down, once, all the way.
    { at: 0.42, ...SET.root, y: SET.root.y + 0.012, squash: SET.root.squash + 0.04, flash: 0.3 },
    { at: 0.62, ...SET.root, flash: 0.08 },
    { at: 1, ...SET.root, flash: 0 },
  ],
  parts: {
    shield: [
      { at: 0, x: 0, y: 0, rotate: 0, scale: 1 },
      { at: 0.22, x: 0.01, y: -0.04, rotate: -8, scale: 1.04 },
      { at: 0.42, ...SET.shield, y: SET.shield.y + 0.012 },
      { at: 1, ...SET.shield },
    ],
    // The sword comes off the shoulder and the wrist turns it point-down.
    sword: turn([0, 0], [0.22, -12], [0.5, SET.sword + 6], [1, SET.sword]),
    blade: turn([0, 0], [0.22, -40], [0.5, SET.blade - 8], [1, SET.blade]),
    head: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.22, rotate: -5, y: -0.004 },
      { at: 0.45, rotate: SET.head + 2, y: SET.headY },
      { at: 1, rotate: SET.head, y: SET.headY },
    ],
    cape: turn([0, 0], [0.22, -6], [0.44, 14], [0.7, 4], [1, 7]),
    legs: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.22, squash: 0.96 },
      { at: 0.42, squash: SET.legs + 0.06, y: 0.01 },
      { at: 1, squash: SET.legs, y: 0.008 },
    ],
    body: [
      { at: 0, squash: 1, y: 0 },
      { at: 0.42, squash: SET.body + 0.03, y: 0.01 },
      { at: 1, squash: SET.body, y: 0.008 },
    ],
  },
};

/**
 * Held, and nothing moves but the cloth: the wind off the wave pulls the
 * cape back and lets it fall, and the helm settles a degree lower. Long
 * enough to carry the three shots that hold on it.
 */
const hold: Clip = {
  // Long and one-shot, not a loop: asked for again by the next shot it is not
  // restarted, and handed to itself (`then`) it holds its last key rather
  // than blending back to the rest pose.
  duration: 2600,
  poses: [
    { at: 0, ...SET.root },
    { at: 0.5, ...SET.root, y: SET.root.y + 0.003, squash: SET.root.squash + 0.008 },
    { at: 1, ...SET.root },
  ],
  parts: {
    shield: [
      { at: 0, ...SET.shield },
      { at: 0.5, ...SET.shield, rotate: SET.shield.rotate + 0.4 },
      { at: 1, ...SET.shield },
    ],
    sword: turn([0, SET.sword], [1, SET.sword]),
    blade: turn([0, SET.blade], [1, SET.blade]),
    head: [
      { at: 0, rotate: SET.head, y: SET.headY },
      { at: 0.5, rotate: SET.head + 1.2, y: SET.headY + 0.002 },
      { at: 1, rotate: SET.head, y: SET.headY },
    ],
    cape: turn([0, 7], [0.1, 16], [0.2, 9], [0.32, 20], [0.44, 11], [0.56, 18], [0.68, 8], [0.8, 14], [0.9, 9], [1, 10]),
    legs: [
      { at: 0, squash: SET.legs, y: 0.008 },
      { at: 1, squash: SET.legs, y: 0.008 },
    ],
    body: [
      { at: 0, squash: SET.body, y: 0.008 },
      { at: 0.5, squash: SET.body + 0.01, y: 0.009 },
      { at: 1, squash: SET.body, y: 0.008 },
    ],
  },
};

/**
 * The wave lands. The Knight gives two hundredths and comes straight back;
 * the shield is driven a hair into the body; the helm snaps down a few
 * degrees and up; and the cape is thrown straight back and whips.
 */
const brace: Clip = {
  duration: 900,
  markers: { contact: 0.03 },
  poses: [
    { at: 0, ...SET.root },
    { at: 0.03, ...SET.root, x: SET.root.x - 0.02, squash: SET.root.squash + 0.05, flash: 1 },
    { at: 0.14, ...SET.root, x: SET.root.x - 0.012, squash: SET.root.squash + 0.02, flash: 0.5 },
    { at: 0.4, ...SET.root, flash: 0.12 },
    { at: 1, ...SET.root, flash: 0 },
  ],
  parts: {
    shield: [
      { at: 0, ...SET.shield },
      { at: 0.03, ...SET.shield, x: SET.shield.x - 0.025, rotate: SET.shield.rotate + 3, scale: SET.shield.scale + 0.03 },
      { at: 0.2, ...SET.shield, x: SET.shield.x - 0.008 },
      { at: 1, ...SET.shield },
    ],
    sword: turn([0, SET.sword], [0.04, SET.sword + 4], [0.3, SET.sword], [1, SET.sword]),
    blade: turn([0, SET.blade], [1, SET.blade]),
    head: [
      { at: 0, rotate: SET.head, y: SET.headY },
      { at: 0.04, rotate: SET.head + 5, y: SET.headY + 0.008 },
      { at: 0.3, rotate: SET.head - 2, y: SET.headY },
      { at: 1, rotate: SET.head, y: SET.headY },
    ],
    cape: turn([0, 9], [0.04, 38], [0.18, 24], [0.34, 36], [0.55, 14], [0.8, 22], [1, 12]),
    legs: [
      { at: 0, squash: SET.legs, y: 0.008 },
      { at: 0.03, squash: SET.legs + 0.06, y: 0.012 },
      { at: 0.3, squash: SET.legs, y: 0.008 },
      { at: 1, squash: SET.legs, y: 0.008 },
    ],
  },
};

/**
 * Everything goes back: the shield punched forward off the arm, the feet
 * where they were. The helm comes up to watch it land.
 */
const answer: Clip = {
  // Short coil, snap out: the shot opens on the whip, so the punch has to
  // land within its first beat, and the shield's contact is the reveal.
  duration: 760,
  markers: { contact: 0.08 },
  poses: [
    { at: 0, ...SET.root },
    { at: 0.045, ...SET.root, x: SET.root.x - 0.015, rotate: SET.root.rotate - 1.5 },
    { at: 0.08, ...SET.root, x: SET.root.x + 0.035, rotate: SET.root.rotate + 4, squash: 0.97, flash: 0.7 },
    { at: 0.36, ...SET.root, x: SET.root.x + 0.03, rotate: SET.root.rotate + 3, flash: 0.2 },
    { at: 1, ...SET.root, x: SET.root.x + 0.02, rotate: SET.root.rotate + 2, flash: 0 },
  ],
  parts: {
    shield: [
      { at: 0, ...SET.shield },
      { at: 0.045, ...SET.shield, x: SET.shield.x - 0.02, rotate: SET.shield.rotate + 3 },
      { at: 0.08, x: 0.1, y: -0.02, rotate: -6, scale: 1.2 },
      { at: 0.36, x: 0.09, y: -0.015, rotate: -4, scale: 1.17 },
      { at: 1, x: 0.05, y: 0, rotate: -1, scale: 1.12 },
    ],
    sword: turn([0, SET.sword], [0.08, SET.sword - 10], [1, SET.sword - 6]),
    blade: turn([0, SET.blade], [1, SET.blade]),
    head: [
      { at: 0, rotate: SET.head, y: SET.headY },
      { at: 0.08, rotate: 2, y: 0.006 },
      { at: 1, rotate: -2, y: 0 },
    ],
    cape: turn([0, 10], [0.08, -14], [0.36, 10], [0.7, -2], [1, 4]),
    legs: [
      { at: 0, squash: SET.legs, y: 0.008 },
      { at: 0.08, squash: SET.legs + 0.04, y: 0.01 },
      { at: 1, squash: SET.legs, y: 0.008 },
    ],
  },
};

/**
 * Back on the board: still set, then slowly home — the sword returned to
 * the shoulder last, because the Knight is in no hurry.
 */
const stand: Clip = {
  duration: 760,
  poses: [
    { at: 0, ...SET.root },
    { at: 0.2, ...SET.root, y: SET.root.y + 0.01, squash: SET.root.squash + 0.03, flash: 0.45 },
    { at: 0.55, ...SET.root, flash: 0.1 },
    { at: 1, x: 0, y: 0, rotate: 0, squash: 1, flash: 0 },
  ],
  parts: {
    shield: [
      { at: 0, ...SET.shield },
      { at: 0.2, ...SET.shield, y: SET.shield.y + 0.012 },
      { at: 0.6, ...SET.shield },
      { at: 1, x: 0, y: 0, rotate: 0, scale: 1 },
    ],
    sword: turn([0, SET.sword], [0.6, SET.sword], [1, 0]),
    blade: turn([0, SET.blade], [0.6, SET.blade], [1, 0]),
    head: [
      { at: 0, rotate: SET.head, y: SET.headY },
      { at: 0.55, rotate: SET.head, y: SET.headY },
      { at: 1, rotate: 0, y: 0 },
    ],
    cape: turn([0, 7], [0.2, 16], [0.5, 4], [0.8, 8], [1, 0]),
    legs: [
      { at: 0, squash: SET.legs, y: 0.008 },
      { at: 0.6, squash: SET.legs, y: 0.008 },
      { at: 1, squash: 1, y: 0 },
    ],
    body: [
      { at: 0, squash: SET.body, y: 0.008 },
      { at: 0.6, squash: SET.body, y: 0.008 },
      { at: 1, squash: 1, y: 0 },
    ],
  },
};

export const poses: Record<string, Rig> = {
  vanguard: {
    "ult:aegis-set": set,
    "ult:aegis-hold": hold,
    "ult:aegis-brace": brace,
    "ult:aegis-return": answer,
    "ult:aegis-stand": stand,
  },
};
