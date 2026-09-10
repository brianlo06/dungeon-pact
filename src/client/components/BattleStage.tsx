import type { ReactNode } from "react";
import type { Snapshot } from "../../shared/model";
import { enemies as enemyDefs, isObject } from "../../content/enemies";
import { BattleUnit, type Impact } from "./BattleUnit";
import { describeIntentEffect } from "../combat-presentation";

/**
 * How big a creature reads on the stage. Scale is threat: a boss should not
 * share a footprint with the thing standing next to it, and a container should
 * not read as a combatant. Sizes live here rather than in content until
 * presentation metadata exists, so nothing in the engine learns about them.
 */
function footprint(definition: string) {
  const def = enemyDefs.find((d) => d.id === definition);
  if (def?.boss) return 1.5;
  if (def?.object) return 1.05;
  if (definition === "bulwark") return 1.15;
  if (definition === "bellows") return 1.12;
  if (definition === "hound") return 1.05;
  if (definition === "acolyte" || definition === "sniper") return 0.9;
  return 1;
}

/** Depth of each band, deepest first. Heroes stand nearest the camera. */
const DEPTH = {
  enemyBack: 0,
  enemyFront: 0.3,
  heroFront: 0.72,
  heroBack: 1,
} as const;

export interface StageBeat {
  beatFor: (id: string) => {
    hp?: number;
    acting?: boolean;
    impact?: Impact;
    pop?: string;
  };
  playing: boolean;
  overlay: ReactNode;
}

/**
 * The battlefield. Four depth bands rather than four rows of cells: enemies
 * stand further into the scene, heroes nearer the camera, and row position is
 * expressed as size and elevation instead of a label saying FRONT.
 */
export function BattleStage({
  s,
  target,
  onTarget,
  targetable,
  beat,
}: {
  s: Snapshot;
  target: string;
  onTarget: (id: string) => void;
  /** Which unit ids the chosen ability may legally be aimed at. */
  targetable: Set<string>;
  beat: StageBeat;
}) {
  const enemyAt = (row: "front" | "back") =>
    s.enemies.filter((e) => e.row === row);
  const heroAt = (row: "front" | "back") =>
    s.players.filter((p) => p.row === row);

  const intentFor = (e: Snapshot["enemies"][number]) => {
    if (e.hp <= 0)
      return (
        <span className="intent-chip intent-gone">
          {isObject(e.definition) ? "Opened" : "Defeated"}
        </span>
      );
    const a = e.intent.ability;
    const aim =
      a.target === "enemyRow"
        ? `${s.players.find((p) => p.id === e.intent.target)?.row ?? ""} row`
        : ([...s.players, ...s.enemies].find((u) => u.id === e.intent.target)
            ?.name ?? "");
    const reads = a.effects
      .map((x) => describeIntentEffect(x, e.power, s))
      .filter(Boolean)
      .join(" · ");
    return (
      <span
        className={`intent-chip ${a.interruptible ? "intent-windup" : ""}`}
        title={reads}
      >
        {a.interruptible && <b>WINDUP</b>}
        <strong>{a.name}</strong>
        {aim && <em>→ {aim}</em>}
      </span>
    );
  };

  const band = (
    key: string,
    depth: number,
    units: ReactNode,
    label?: string,
  ) => (
    <div
      className={`stage-band band-${key}`}
      style={{ "--depth": depth } as React.CSSProperties}
      data-label={label}
    >
      {units}
    </div>
  );

  return (
    <div className={`stage ${beat.playing ? "is-replaying" : ""}`}>
      <div className="stage-scenery" aria-hidden="true">
        <span className="scenery-far" />
        <span className="scenery-mid" />
        <span className="scenery-glow" />
      </div>
      <div className="stage-ground" aria-hidden="true" />
      <div className="stage-bands">
        {band(
          "enemy-back",
          DEPTH.enemyBack,
          enemyAt("back").map((e) => (
            <BattleUnit
              key={e.id}
              unit={e}
              side="enemy"
              depth={DEPTH.enemyBack}
              scale={footprint(e.definition)}
              selectable={targetable.has(e.id)}
              selected={target === e.id}
              onSelect={() => onTarget(e.id)}
              intent={intentFor(e)}
              owners={s.players}
              {...beat.beatFor(e.id)}
            />
          )),
        )}
        {band(
          "enemy-front",
          DEPTH.enemyFront,
          enemyAt("front").map((e) => (
            <BattleUnit
              key={e.id}
              unit={e}
              side="enemy"
              depth={DEPTH.enemyFront}
              scale={footprint(e.definition)}
              selectable={targetable.has(e.id)}
              selected={target === e.id}
              onSelect={() => onTarget(e.id)}
              intent={intentFor(e)}
              owners={s.players}
              {...beat.beatFor(e.id)}
            />
          )),
        )}
        <div className="stage-divide" aria-hidden="true" />
        {band(
          "hero-front",
          DEPTH.heroFront,
          heroAt("front").map((p) => (
            <BattleUnit
              key={p.id}
              unit={p}
              side="hero"
              depth={DEPTH.heroFront}
              selectable={targetable.has(p.id)}
              selected={target === p.id}
              onSelect={() => onTarget(p.id)}
              locked={s.locked.includes(p.id)}
              connected={s.connected.includes(p.id)}
              you={p.id === s.you}
              {...beat.beatFor(p.id)}
            />
          )),
        )}
        {band(
          "hero-back",
          DEPTH.heroBack,
          heroAt("back").map((p) => (
            <BattleUnit
              key={p.id}
              unit={p}
              side="hero"
              depth={DEPTH.heroBack}
              selectable={targetable.has(p.id)}
              selected={target === p.id}
              onSelect={() => onTarget(p.id)}
              locked={s.locked.includes(p.id)}
              connected={s.connected.includes(p.id)}
              you={p.id === s.you}
              {...beat.beatFor(p.id)}
            />
          )),
        )}
      </div>
      {beat.overlay}
    </div>
  );
}
