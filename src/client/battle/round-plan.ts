import type { Beat, Snapshot } from "../../shared/model";
import type { Anchor } from "../../shared/presentation";
import { unitPresentation } from "./layout";
import { rigFor } from "./rigs";
import type { Rig } from "./animation";
import {
  choreograph,
  groupConsequences,
  scheduleRound,
  splitRound,
  type RoundTimeline,
} from "./choreography";
import { moveMeta, unitChoreography } from "./choreo-meta";
import { hitStop, REPLAY_CAP } from "./pacing";
import type { StageGeom } from "./stage-geometry";
import { ARROW } from "../../content/choreography/kit";

/**
 * A round's replay, planned: the one place the content's annotations, the
 * rigs, the stage's geometry and the pacing cap meet the choreographer. The
 * director plays what this returns; the tests and the Battle Lab call it the
 * same way.
 */

/** Which creature a unit is, for its annotations and its rig. */
export function creatureOf(s: Snapshot, id: string) {
  const enemy = s.enemies.find((e) => e.id === id);
  if (enemy) return enemy.definition;
  return s.players.find((p) => p.id === id)?.heroId;
}

export function rigOf(s: Snapshot, id: string): Rig {
  const enemy = s.enemies.find((e) => e.id === id);
  const hero = s.players.find((p) => p.id === id);
  return rigFor(unitPresentation(enemy?.definition, hero?.heroId).spriteSet);
}

export function hitAnchor(s: Snapshot, id: string): Anchor | undefined {
  return unitChoreography(creatureOf(s, id)).anchors?.hit;
}

/**
 * The hit-stops a round holds for: the heaviest hit of each contact, since
 * hits that land together stop the scene together.
 */
export function stopsIn(beats: Beat[]) {
  let total = 0;
  for (const move of splitRound(beats).moves)
    for (const c of groupConsequences(move).contacts)
      total += Math.max(
        0,
        ...c.beats.map((b) => (b.kind === "damage" ? hitStop(b.amount ?? 0) : 0)),
      );
  return total;
}

export interface PlanOptions {
  /** Defaults to `REPLAY_CAP`. */
  cap?: number;
  /** Override one move's archetype: the Battle Lab's choreography panel. */
  archetype?: (cast: Beat) => ReturnType<typeof moveMeta>["archetype"] | undefined;
  /** Override how many blows it deals each target. The Battle Lab only. */
  strikes?: (cast: Beat) => number | undefined;
}

export function planRound(
  s: Snapshot,
  beats: Beat[],
  stage: StageGeom,
  opts: PlanOptions = {},
): RoundTimeline {
  const cap = (opts.cap ?? REPLAY_CAP) - stopsIn(beats);
  return scheduleRound({
    beats,
    cap,
    alive: (id) => stage.units.get(id)?.alive ?? true,
    choreograph: (move, pace, alive) => {
      const meta = moveMeta(s, move.cast);
      const forced = opts.archetype?.(move.cast);
      if (forced && forced !== meta.archetype) {
        // A forced archetype brings its own way of landing, not the move's:
        // an AoE forced on a bolt runs a shockwave along the ground.
        meta.archetype = forced;
        meta.delivery =
          forced === "area" ? "shockwave" : forced === "beam" ? "beam" : undefined;
        if (forced === "bow") meta.projectile = { ...ARROW };
      }
      const blows = opts.strikes?.(move.cast);
      if (blows) meta.strikes = blows;
      // Who is standing now, for paths that must not walk through bodies.
      const units = new Map(
        [...stage.units].map(([id, u]) => [id, { ...u, alive: alive(id) }]),
      );
      return choreograph({
        move,
        meta,
        stage: { ...stage, units },
        rig: rigOf(s, move.cast.actor ?? ""),
        alive,
        pace,
        targetInset: (id) => unitChoreography(creatureOf(s, id)).strikeInset,
        targetAnchor: (id) => hitAnchor(s, id),
      });
    },
  });
}
