import type { Row, Snapshot } from "../../shared/model";
import { enemies as enemyDefs } from "../../content/enemies";
import { heroes } from "../../content/heroes";
import {
  DEFAULT_UNIT,
  FOOTPRINT_SCALE,
  type UnitPresentation,
} from "../../shared/presentation";

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

/** Where each band's feet sit, and how far it leans off centre. */
const BANDS = {
  "enemy-back": { y: 0.39, depth: 0, lean: 0.12 },
  "enemy-front": { y: 0.6, depth: 0.32, lean: 0.06 },
  "hero-front": { y: 0.8, depth: 0.72, lean: -0.06 },
  "hero-back": { y: 0.97, depth: 1, lean: -0.13 },
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
 * Spread n units around a centre. Wider bands for bigger groups, but never so
 * wide that a four-hero party runs off the sides at 1280.
 */
function spread(count: number, centre: number, room: number) {
  if (count <= 1) return [centre];
  const step = Math.min(room / count, 0.19);
  const start = centre - (step * (count - 1)) / 2;
  return Array.from({ length: count }, (_, i) => start + step * i);
}

export function placements(s: Snapshot): Map<string, Placement> {
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
  for (const [band, side, units] of groups) {
    const { y, depth, lean } = BANDS[band];
    const xs = spread(units.length, 0.5 + lean, 0.62);
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
