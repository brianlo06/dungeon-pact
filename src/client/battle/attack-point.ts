import type { Box } from "./intent-layout";
import {
  drawingScale,
  feet,
  scaleAt,
  type StageGeom,
  type UnitGeom,
} from "./stage-geometry";
import type { Vec } from "./trajectory";

/**
 * Where an attacker stands to strike, and the path it takes to get there.
 *
 * There is no pixel offset anywhere in this file. The attack point is found
 * from what is actually painted: the target's outline, the attacker's own
 * outline and the reach of its weapon in its own drawing units, the distance
 * its strike clip carries it at the moment of contact, and the size both are
 * drawn at where they will meet. A boss's outline is wide, so its attackers
 * stand further off; a strongbox's is square and low, and they stand closer.
 *
 * Everything is in the stage's untransformed pixels, measured, and handed
 * back as stage fractions by the choreographer.
 */

export interface StrikeReach {
  /** Weapon reach past the attacker's centre, drawing units; null = outline. */
  reach?: number;
  /** How far forward the strike clip carries the figure at contact, in its widths. */
  lunge: number;
  /** Where the struck surface sits inside the target's outline, drawing units. */
  inset?: number;
}

export interface AttackPoint {
  /** The attacker's feet at the moment of contact. */
  feet: Vec;
  /** Which way it faces to strike: +1 right, −1 left. */
  face: 1 | -1;
  /** Where the weapon lands, for the debug overlay. */
  weapon: Vec;
  /** The attacker's size there, relative to its size at home. */
  scale: number;
  /** True when the stage edge, not the reach, decided where it stands. */
  clamped: boolean;
}

/** How far into the target's outline a blow visibly lands, of its width. */
const BITE = 0.06;
/**
 * How much nearer the camera than its target an attacker stands, as a share
 * of the stage's height. Enough that it paints over the target it is hitting
 * — the weapon is seen landing — and not so much that it reads as a
 * different rank.
 */
const IN_FRONT = 0.012;
/** Stage margin the attacker's figure keeps at the point of contact. */
const EDGE = 0.02;

const width = (b: Box) => b.right - b.left;

/** The attacker's feet where it strikes `target`, facing it. */
export function attackPoint(
  stage: StageGeom,
  actor: UnitGeom,
  target: UnitGeom,
  strike: StrikeReach,
): AttackPoint {
  const home = feet(actor);
  const tf = feet(target);
  const face: 1 | -1 =
    Math.abs(target.gx - actor.gx) > 1
      ? target.gx > actor.gx
        ? 1
        : -1
      : actor.facing;
  const y = tf.y + IN_FRONT * stage.height;
  const k = scaleAt(actor, y, stage.height);
  const s = drawingScale(actor, k);
  const bodyWidth = width(actor.body) * k;
  // With no reach given it stands with the front of its own outline on the
  // target's: the front edge, measured from its centre, at home size. Turned
  // round to face the other way, its front is what was its back.
  const front = Math.max(
    0,
    face === actor.facing
      ? actor.facing > 0
        ? actor.figure.right
        : -actor.figure.left
      : actor.facing > 0
        ? -actor.figure.left
        : actor.figure.right,
  );
  const reachPx =
    (strike.reach !== undefined ? strike.reach * s : front * k) +
    Math.max(0, strike.lunge) * bodyWidth;
  const ts = drawingScale(target);
  const inset = (strike.inset ?? 0) * ts + BITE * width(target.figure);
  const surface =
    face > 0
      ? target.gx + target.figure.left + inset
      : target.gx + target.figure.right - inset;
  let x = surface - face * reachPx;
  // Its own body never ends up inside what it hits. A heavy figure whose
  // outline reaches further than its authored reach — a ram out in front of
  // a shield wall — would otherwise stop with its weapon on the surface and
  // its front half through the target. At contact its painted front (the
  // outline, carried forward by the strike's lunge) may touch the target's
  // near edge and bite into it as far as a blow does, and no further.
  const bodyReach = front * k + Math.max(0, strike.lunge) * bodyWidth;
  const edge =
    face > 0
      ? target.gx + target.figure.left + BITE * width(target.figure)
      : target.gx + target.figure.right - BITE * width(target.figure);
  const clear = edge - face * bodyReach;
  if (face * (x - clear) > 0) x = clear;
  // Never inside the thing it is hitting: its centre stays short of the
  // target's near half, however short its reach.
  const limit = target.gx - face * width(target.figure) * 0.35;
  if (face * (x - limit) > 0) x = limit;
  // Keep the attacker's whole figure on the stage.
  const left = EDGE * stage.width - actor.figure.left * k;
  const right = (1 - EDGE) * stage.width - actor.figure.right * k;
  let clamped = false;
  if (x < left) {
    x = left;
    clamped = true;
  } else if (x > right) {
    x = right;
    clamped = true;
  }
  // Never behind where it started, by more than a step: an attacker that is
  // already in reach strikes from about where it stands.
  if (face * (x - home.x) < 0 && Math.abs(x - home.x) < bodyWidth * 0.25)
    x = home.x;
  const tall = (actor.figure.bottom - actor.figure.top) * k;
  return {
    feet: { x, y },
    face,
    weapon: { x: x + face * reachPx, y: y - tall * 0.5 },
    scale: k,
    clamped,
  };
}

/* ----------------------------------------------------------------- paths -- */

/** A quadratic path across the floor, in stage pixels of the feet. */
export interface Path {
  from: Vec;
  via: Vec;
  to: Vec;
}

export const pathPoint = (p: Path, t: number): Vec => {
  const a = (1 - t) * (1 - t);
  const b = 2 * (1 - t) * t;
  const c = t * t;
  return {
    x: a * p.from.x + b * p.via.x + c * p.to.x,
    y: a * p.from.y + b * p.via.y + c * p.to.y,
  };
};

export const straight = (from: Vec, to: Vec): Path => ({
  from,
  to,
  via: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
});

/**
 * How close in depth, as a share of the stage's height, two figures must be
 * for one to read as walking *through* the other rather than past it in front
 * or behind. Paint order separates anything further apart.
 */
const SAME_RANK = 0.05;

/**
 * How much of other figures a path walks through: at each step, the moving
 * figure's outline against every other standing figure's, counted only where
 * the two are near enough in depth to share a rank.
 */
export function pathCost(
  stage: StageGeom,
  actor: UnitGeom,
  path: Path,
  ignore: Set<string>,
): number {
  let cost = 0;
  const STEPS = 24;
  for (let i = 1; i < STEPS; i++) {
    const p = pathPoint(path, i / STEPS);
    const k = scaleAt(actor, p.y, stage.height);
    const l = p.x + actor.figure.left * k;
    const r = p.x + actor.figure.right * k;
    for (const u of stage.units.values()) {
      if (u.id === actor.id || ignore.has(u.id) || !u.alive) continue;
      const f = feet(u);
      const dy = Math.abs(p.y - f.y) / stage.height;
      if (dy >= SAME_RANK) continue;
      const overlap =
        Math.min(r, f.x + u.figure.right) - Math.max(l, f.x + u.figure.left);
      if (overlap > 0) cost += overlap * (1 - dy / SAME_RANK);
    }
  }
  return cost / STEPS;
}

/**
 * The path from `from` to `to` that walks through the fewest bodies: a
 * straight line if it is clear, otherwise bowed towards the camera or away
 * from it by as little as clears the way. Bowing towards the camera is
 * preferred — a runner passing in front of someone is seen, one passing
 * behind is lost for a moment — unless it would leave the floor.
 */
export function lanePath(
  stage: StageGeom,
  actor: UnitGeom,
  from: Vec,
  to: Vec,
  ignore: Set<string>,
  floor = { top: 0.36, bottom: 1.0 },
): Path {
  const base = straight(from, to);
  const offsets = [0, 0.05, -0.05, 0.1, -0.1, 0.15, -0.15, 0.2, -0.2];
  let best = base;
  let bestCost = Infinity;
  for (const o of offsets) {
    const via = { x: base.via.x, y: base.via.y + o * stage.height * 2 };
    const path = { from, to, via };
    // The bow's lowest and highest points must stay on the floor.
    const mid = pathPoint(path, 0.5).y / stage.height;
    if (o !== 0 && (mid < floor.top || mid > floor.bottom)) continue;
    const cost =
      pathCost(stage, actor, path, ignore) +
      // Prefer straight, and prefer passing in front.
      Math.abs(o) * 40 +
      (o < 0 ? 6 : 0);
    if (cost < bestCost - 1e-6) {
      best = path;
      bestCost = cost;
    }
  }
  return best;
}
