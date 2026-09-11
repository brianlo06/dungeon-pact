import { useRef, type ReactNode } from "react";
import type { Snapshot } from "../../shared/model";
import { isObject } from "../../content/enemies";
import { BattleUnit, type Impact } from "./BattleUnit";
import { describeIntentEffect } from "../combat-presentation";
import type { Placement } from "../battle/layout";
import type { Camera } from "../battle/camera";
import type { Animators } from "../battle/useAnimators";
import { Foundry } from "./Foundry";
import { useIntentLayout } from "../battle/intent-layout";
import "../stage-ui.css";

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
  targeting,
  beat,
  camera,
  frozen,
  animators,
  children,
}: {
  s: Snapshot;
  places: Map<string, Placement>;
  target: string;
  onTarget: (id: string) => void;
  targetable: Set<string>;
  /** The player is picking a target now, so the legal ones are marked. */
  targeting?: boolean;
  beat: StageBeat;
  camera: Camera;
  /** Hold the scene still for a beat on a heavy hit. */
  frozen?: boolean;
  animators: Animators;
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

  // Chips step around name plates and each other; see intent-layout.
  const unitLayer = useRef<HTMLDivElement>(null);
  useIntentLayout(unitLayer, places);

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
      <Foundry />

      <div className="world" ref={camera.attach}>
        <div className="layer layer-units" ref={unitLayer}>
          {units.map(({ u, place }) => {
            const enemy = "definition" in u;
            return (
              <BattleUnit
                key={u.id}
                unit={u}
                place={place}
                selectable={targetable.has(u.id)}
                selected={target === u.id}
                marked={targeting && targetable.has(u.id)}
                onSelect={() => onTarget(u.id)}
                intent={enemy ? intentFor(u as never) : undefined}
                owners={s.players}
                animators={animators}
                treasury={s.gold}
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

      <div className="layer layer-light" aria-hidden="true" />
      <div className="layer layer-screen">{beat.overlay}</div>
    </div>
  );
}
