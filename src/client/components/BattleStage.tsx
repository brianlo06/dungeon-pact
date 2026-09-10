import type { ReactNode } from "react";
import type { Snapshot } from "../../shared/model";
import { isObject } from "../../content/enemies";
import { BattleUnit, type Impact } from "./BattleUnit";
import { describeIntentEffect } from "../combat-presentation";
import type { Placement } from "../battle/layout";
import type { Camera } from "../battle/camera";

export interface StageBeat {
  beatFor: (id: string) => {
    hp?: number;
    acting?: boolean;
    impact?: Impact;
    pop?: string;
  };
  playing: boolean;
  /** Screen-space furniture: banners, the skip control. */
  overlay: ReactNode;
  /** World-space effects that travel between units. */
  world?: ReactNode;
}

/**
 * The battlefield, as a stack of layers.
 *
 * Scenery sits behind, combatants and world effects ride the camera, and
 * screen-space effects sit in front of everything. The split matters: a
 * projectile has to be able to pass in front of one creature and behind
 * another, and a screen flash must not be dragged around by a camera shake.
 *
 * Combatants are placed absolutely from presentation-space coordinates rather
 * than flowed, so the camera can move the whole scene by transforming one
 * parent and nothing has to reflow.
 */
export function BattleStage({
  s,
  places,
  target,
  onTarget,
  targetable,
  beat,
  camera,
  frozen,
  children,
}: {
  s: Snapshot;
  places: Map<string, Placement>;
  target: string;
  onTarget: (id: string) => void;
  targetable: Set<string>;
  beat: StageBeat;
  camera: Camera;
  /** Hold the scene still for a beat on a heavy hit. */
  frozen?: boolean;
  /** Anything anchored in stage space — the action menu lives here. */
  children?: ReactNode;
}) {
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

  const units = [...s.enemies, ...s.players]
    .map((u) => ({ u, place: places.get(u.id) }))
    .filter(
      (
        x,
      ): x is {
        u: (typeof s.enemies)[number] | (typeof s.players)[number];
        place: Placement;
      } => !!x.place,
    )
    .sort((a, b) => a.place.z - b.place.z);

  return (
    <div
      className={`stage ${beat.playing ? "is-replaying" : ""}`}
      data-frozen={frozen ? "" : undefined}
    >
      <div className="layer layer-far" aria-hidden="true" />
      <div className="layer layer-mid" aria-hidden="true" />
      <div className="layer layer-ground" aria-hidden="true" />

      <div className="world" ref={camera.attach}>
        <div className="layer layer-units">
          {units.map(({ u, place }) => {
            const enemy = "definition" in u;
            return (
              <BattleUnit
                key={u.id}
                unit={u}
                place={place}
                selectable={targetable.has(u.id)}
                selected={target === u.id}
                onSelect={() => onTarget(u.id)}
                intent={enemy ? intentFor(u as never) : undefined}
                owners={s.players}
                locked={!enemy && s.locked.includes(u.id)}
                connected={enemy || s.connected.includes(u.id)}
                you={u.id === s.you}
                {...beat.beatFor(u.id)}
              />
            );
          })}
        </div>
        <div className="layer layer-vfx" aria-hidden="true">
          {beat.world}
        </div>
        {children}
      </div>

      <div className="layer layer-foreground" aria-hidden="true" />
      <div className="layer layer-screen">{beat.overlay}</div>
    </div>
  );
}
