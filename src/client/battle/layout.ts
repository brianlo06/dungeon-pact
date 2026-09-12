import type { Row, Snapshot } from "../../shared/model";
import { enemies as enemyDefs } from "../../content/enemies";
import { heroes } from "../../content/heroes";
import {
  DEFAULT_UNIT,
  FOOTPRINT_SCALE,
  type UnitPresentation,
} from "../../shared/presentation";
import { FLOOR, planningFrame } from "./camera";
import { arrangeUnits, type StageShapes, type UnitShape } from "./unit-layout";

/**
 * Presentation space.
 *
 * Gameplay knows two things about where a unit stands: which side it is on and
 * whether it is in the front or the back row. Everything visual — position,
 * size, render order, how big its shadow is — is derived from that here, on the
 * client, every render. None of it is ever written back into run state: the
 * server has no opinion about pixels and must not acquire one.
 *
 * Coordinates are fractions of the stage box, so the same numbers work at any
 * resolution and the camera can transform the whole scene by moving one parent.
 */

export interface Placement {
  id: string;
  side: "hero" | "enemy";
  row: Row;
  /** Horizontal position across the stage, 0 left … 1 right. */
  x: number;
  /** The unit's *ground point*, 0 top … 1 bottom. Sprites stand on this. */
  y: number;
  /** 0 is deepest into the scene, 1 is nearest the camera. */
  depth: number;
  /** Size multiplier from depth and from the creature's own bulk. */
  scale: number;
  /** Paint order. Nearer the camera paints later, so it overlaps. */
  z: number;
  /** Shadow width relative to the unit, tightening with distance. */
  shadow: number;
}

/**
 * Where each band's feet sit, and how far it leans off centre. The nearest
 * band stands on the camera's floor, the one line every framing keeps on
 * screen, so the back row's health bars never drop off the bottom edge.
 */
const BANDS = {
  "enemy-back": { y: 0.42, depth: 0, lean: 0.12, rank: 0 },
  "enemy-front": { y: 0.615, depth: 0.32, lean: 0.06, rank: 1 },
  "hero-front": { y: 0.8, depth: 0.72, lean: -0.06, rank: 2 },
  "hero-back": { y: FLOOR, depth: 1, lean: -0.13, rank: 3 },
} as const;
export type BandName = keyof typeof BANDS;

export const bandOf = (side: "hero" | "enemy", row: Row): BandName =>
  side === "enemy"
    ? row === "back"
      ? "enemy-back"
      : "enemy-front"
    : row === "front"
      ? "hero-front"
      : "hero-back";

/**
 * How much room a creature takes, read from content rather than inferred. The
 * presentation layer used to know that the Collector was large because of its
 * id; it now knows only that some entity uses the `boss-large` footprint.
 */
export function bulk(definition: string | undefined) {
  if (!definition) return FOOTPRINT_SCALE[DEFAULT_UNIT.footprint];
  const def = enemyDefs.find((d) => d.id === definition);
  const footprint = def?.presentation?.footprint ?? DEFAULT_UNIT.footprint;
  return FOOTPRINT_SCALE[footprint];
}

/** Everything presentation knows about a unit, with defaults filled in. */
export function unitPresentation(
  definition: string | undefined,
  heroId?: string,
): Required<
  Pick<UnitPresentation, "footprint" | "theme" | "idlePeriod" | "shadow">
> &
  UnitPresentation {
  const def = definition
    ? enemyDefs.find((d) => d.id === definition)?.presentation
    : heroId
      ? heroes.find((h) => h.id === heroId)?.presentation
      : undefined;
  return { ...DEFAULT_UNIT, ...def };
}

/** Depth alone makes a unit smaller; bulk then makes the creature itself big. */
export const depthScale = (depth: number) => 0.72 + depth * 0.38;

/**
 * The depth of any ground line, between and beyond the bands: what a figure
 * crossing the floor should be scaled by where it stands now. Piecewise
 * through the bands' own ground lines and depths, and carried on past the
 * ends at the slope of the nearest pair, within reason.
 */
export function depthAtGround(y: number): number {
  const bands = Object.values(BANDS)
    .map((b) => ({ y: b.y as number, depth: b.depth as number }))
    .sort((a, b) => a.y - b.y);
  let i = 0;
  while (i < bands.length - 2 && y > bands[i + 1].y) i++;
  const a = bands[i];
  const b = bands[i + 1];
  const d = a.depth + ((y - a.y) / (b.y - a.y)) * (b.depth - a.depth);
  return Math.max(-0.2, Math.min(1.2, d));
}

/** Ground line for each side and row, for anything placing by band. */
export const bandGround = (side: "hero" | "enemy", row: Row) =>
  BANDS[bandOf(side, row)].y;

/**
 * Spread n units around a centre. Wider bands for bigger groups, but never so
 * wide that a four-hero party runs off the sides at 1280.
 */
function spread(count: number, centre: number, room: number) {
  if (count <= 1) return [centre];
  const step = Math.min(room / count, 0.19);
  const start = centre - (step * (count - 1)) / 2;
  return Array.from({ length: count }, (_, i) => start + step * i);
}

/**
 * Stand n units in the gaps of the rank in front of them: between its units
 * first, from the middle out, then off its left end and its right. The back
 * row of the party is nearest the camera and drawn largest, and a hero
 * standing straight behind another covers their name plate however the two
 * are drawn. Null when there is no rank in front to stand behind.
 */
function between(count: number, ahead: number[]) {
  if (!ahead.length || !count) return null;
  const pitch =
    ahead.length > 1
      ? (ahead[ahead.length - 1] - ahead[0]) / (ahead.length - 1)
      : 0.19;
  const mid = (ahead[0] + ahead[ahead.length - 1]) / 2;
  const gaps = ahead
    .slice(1)
    .map((x, i) => (x + ahead[i]) / 2)
    .sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b);
  for (let k = 0; gaps.length < count; k++)
    gaps.push(
      ahead[0] - pitch * (k + 0.5),
      ahead[ahead.length - 1] + pitch * (k + 0.5),
    );
  return gaps.slice(0, count).sort((a, b) => a - b);
}

/** Keep units this far inside what every decision framing shows. */
const MARGIN = 6;

/**
 * Where everyone stands. Without measurements this is the formation alone:
 * bands, leans and spreads. With them, each rank is slid sideways so that no
 * painted figure covers a name plate in the rank behind it (see
 * `unit-layout.ts`) — the fractions returned already include that, so the
 * camera, the effects and the action fan all aim at where a unit really is.
 */
export function placements(
  s: Snapshot,
  measured?: StageShapes | null,
): Map<string, Placement> {
  const out = formation(s);
  if (!measured) return out;
  const { width: w, height: h } = measured;
  const shapes: UnitShape[] = [];
  for (const p of out.values()) {
    const shape = measured.units[p.id];
    // A unit not measured yet: hold the formation until it has been.
    if (!shape || !w || !h) return out;
    const unit = s.enemies.find((e) => e.id === p.id);
    shapes.push({
      id: p.id,
      rank: BANDS[bandOf(p.side, p.row)].rank,
      x: p.x * w,
      y: p.y * h,
      figure: shape.figure,
      plate: shape.plate,
      // Big things hold their ground; a boss belongs at the centre of the
      // threat, and the small figures around it make way.
      weight: bulk(unit?.definition) ** 2,
    });
  }
  const frame = planningFrame(w, h);
  const dx = arrangeUnits(shapes, {
    left: frame.left + MARGIN,
    right: frame.right - MARGIN,
  });
  for (const p of out.values()) p.x += (dx.get(p.id) ?? 0) / w;
  return out;
}

function formation(s: Snapshot): Map<string, Placement> {
  const out = new Map<string, Placement>();
  const groups: [
    BandName,
    "hero" | "enemy",
    { id: string; definition?: string; heroId?: string }[],
  ][] = [
    ["enemy-back", "enemy", s.enemies.filter((e) => e.row === "back")],
    ["enemy-front", "enemy", s.enemies.filter((e) => e.row === "front")],
    ["hero-front", "hero", s.players.filter((p) => p.row === "front")],
    ["hero-back", "hero", s.players.filter((p) => p.row === "back")],
  ];
  let ahead: number[] = [];
  for (const [band, side, units] of groups) {
    const { y, depth, lean } = BANDS[band];
    const xs =
      (band === "hero-back" && between(units.length, ahead)) ||
      spread(units.length, 0.5 + lean, 0.62);
    ahead = units.length ? xs : [];
    units.forEach((u, i) => {
      const scale =
        depthScale(depth) * bulk((u as { definition?: string }).definition);
      out.set(u.id, {
        id: u.id,
        side,
        row: band.endsWith("back") ? "back" : "front",
        x: xs[i],
        y,
        depth,
        scale,
        // Paint order follows the ground line, so a nearer unit overlaps a
        // further one exactly the way standing in front of someone works.
        z: Math.round(y * 1000) + i,
        shadow:
          unitPresentation(
            (u as { definition?: string }).definition,
            (u as { heroId?: string }).heroId,
          ).shadow *
          (0.94 - depth * 0.12),
      });
    });
  }
  return out;
}
