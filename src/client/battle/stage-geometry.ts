import type { Box } from "./intent-layout";
import type { Placement } from "./layout";
import { depthAtGround, depthScale } from "./layout";
import type { StageShapes } from "./unit-layout";
import type { Vec } from "./trajectory";

/**
 * What the choreographer knows about the stage: where each combatant stands
 * and what it paints, in the stage's own untransformed pixels. Built from the
 * placements and the measurements the layout pass already takes, so the
 * choreographer aims at exactly where each figure is drawn, and never from
 * anything the camera or a rig is doing this frame.
 *
 * Nothing here is written anywhere. Choreography offsets are temporary and
 * are recomputed from the stage layout every round.
 */
export interface UnitGeom {
  id: string;
  side: "hero" | "enemy";
  /** Ground point, stage pixels: the foot of the combatant's box. */
  gx: number;
  gy: number;
  depth: number;
  z: number;
  /** Painted figure, relative to the ground point. */
  figure: Box;
  /** The drawing's square, relative to the ground point. */
  body: Box;
  /** The drawing's viewBox. 100 × 100 for every authored creature. */
  view: { x: number; y: number; width: number; height: number };
  /** Standing at the start of the move. */
  alive: boolean;
  /** Its drawn facing: +1 right (the party), −1 left (the enemies). */
  facing: 1 | -1;
  /** Size multiplier from content bulk, for big-creature rules. */
  bulk: number;
}

export interface StageGeom {
  width: number;
  height: number;
  units: Map<string, UnitGeom>;
}

/** Where a unit's feet are: its ground point plus its painted figure's foot. */
export const feet = (u: UnitGeom): Vec => ({
  x: u.gx,
  y: u.gy + u.figure.bottom,
});

/** Stage pixels per drawing unit, for a unit drawn at `k` times its size. */
export function drawingScale(u: UnitGeom, k = 1) {
  const bw = (u.body.right - u.body.left) * k;
  const bh = (u.body.bottom - u.body.top) * k;
  return Math.min(bw / u.view.width, bh / u.view.height);
}

/**
 * A point in drawing units, on the stage, for a unit whose feet stand at
 * `at` (default: home) drawn at `k` times its home size and facing `face`.
 * The drawing is laid out centred in its square ("meet"), and the square
 * scales about the feet.
 */
export function drawingPoint(
  u: UnitGeom,
  p: [number, number],
  at: Vec = feet(u),
  k = 1,
  face: 1 | -1 = u.facing,
): Vec {
  const s = drawingScale(u, 1);
  const bw = u.body.right - u.body.left;
  const bh = u.body.bottom - u.body.top;
  const ox = u.body.left + (bw - u.view.width * s) / 2;
  const oy = u.body.top + (bh - u.view.height * s) / 2;
  // Relative to the ground point at home size, then about the feet.
  const hx = ox + (p[0] - u.view.x) * s;
  const hy = oy + (p[1] - u.view.y) * s;
  const fx = 0;
  const fy = u.figure.bottom;
  const mirrored = face === u.facing ? hx - fx : -(hx - fx);
  return { x: at.x + mirrored * k, y: at.y + (hy - fy) * k };
}

/** How much larger a unit is drawn with its feet on ground line `y`. */
export function scaleAt(u: UnitGeom, feetY: number, height: number) {
  const ground = (feetY - u.figure.bottom) / height;
  return depthScale(depthAtGround(ground)) / depthScale(u.depth);
}

/**
 * The stage as the choreographer sees it. A unit not measured yet — no
 * layout pass has run, or this is a test — is estimated from its placement:
 * a square the size the stylesheet draws it, standing on its plate.
 */
export function stageGeometry(
  places: Map<string, Placement>,
  shapes: StageShapes | null,
  size: { width: number; height: number },
  alive: (id: string) => boolean = () => true,
  bulkOf: (id: string) => number = () => 1,
): StageGeom {
  const width = shapes?.width || size.width;
  const height = shapes?.height || size.height;
  const units = new Map<string, UnitGeom>();
  for (const p of places.values()) {
    const m = shapes?.units[p.id];
    const side = Math.max(58, Math.min(150, 0.21 * height)) * p.scale;
    const plate = 0.05 * height;
    const body: Box = m?.body ?? {
      left: -side / 2,
      right: side / 2,
      top: -plate - side,
      bottom: -plate,
    };
    const figure: Box = m?.figure ?? {
      left: body.left + side * 0.18,
      right: body.right - side * 0.18,
      top: body.top + side * 0.1,
      bottom: body.bottom - side * 0.03,
    };
    units.set(p.id, {
      id: p.id,
      side: p.side,
      gx: p.x * width,
      gy: p.y * height,
      depth: p.depth,
      z: p.z,
      figure,
      body,
      view: m?.view ?? { x: 0, y: 0, width: 100, height: 100 },
      alive: alive(p.id),
      facing: p.side === "hero" ? 1 : -1,
      bulk: bulkOf(p.id),
    });
  }
  return { width, height, units };
}
