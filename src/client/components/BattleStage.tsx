import { useCallback, useRef, type ReactNode } from "react";
import type { Snapshot } from "../../shared/model";
import { enemies as enemyDefs, isBoss, isObject } from "../../content/enemies";
import { BattleUnit, type Impact } from "./BattleUnit";
import { describeIntentEffect } from "../combat-presentation";
import { damageLabel, forecastIntent } from "../../shared/forecast";
import { unitPresentation, type Placement } from "../battle/layout";
import type { Camera } from "../battle/camera";
import type { Animators } from "../battle/useAnimators";
import { BiomeScene } from "./BiomeScene";
import { useStageLayout, type StageShapes } from "../battle/unit-layout";
import { rigFor } from "../battle/rigs";
import { holdsWindup } from "../battle/hero-clips";
import type { Stagehand } from "../battle/stagehand";
import "../stage-ui.css";

export interface StageBeat {
  beatFor: (id: string) => {
    equipment?: string[];
    heldEquipment?: { playerId: string; itemId: string }[];
    gearPulse?: { itemId: string; key: number };
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
  stagehand,
  onShapes,
  children,
}: {
  s: Snapshot;
  places: Map<string, Placement>;
  /** What the stage measured of each combatant, for placing them by it. */
  onShapes?: (shapes: StageShapes) => void;
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
  /** Moves figures across the floor and flies projectiles during a replay. */
  stagehand?: Stagehand;
  /** Anything anchored in stage space — the action menu lives here. */
  children?: ReactNode;
}) {
  const intentFor = (e: Snapshot["enemies"][number]) => {
    if (e.hp <= 0)
      return (
        <span className="intent-chip intent-gone">
          {e.fuse
          ? e.spent
            ? "Set"
            : "Broken"
          : isObject(e.definition)
            ? "Opened"
            : "Defeated"}
        </span>
      );
    const a = e.intent.ability;
    const interrupted = e.statuses.some((x) => x.id === "interrupted");
    // What the round will do with it, by the engine's own damage rule.
    const forecast = forecastIntent(s, e);
    const damage = interrupted ? "" : damageLabel(forecast);
    // A clock threatens nobody yet; say what it will do, and to whom.
    const def = enemyDefs.find((d) => d.id === e.definition);
    const aim = def?.clock
      ? a.id === def.clock.due.id
        ? "every hero"
        : "then every hero"
      : a.target === "enemyRow"
        ? `${forecast.aim} · locked`
        : forecast.aim;
    const riders = interrupted ? [] : forecast.riders;
    const soaked = forecast.hits.reduce((n, h) => n + h.blocked, 0);
    const reads = [
      ...forecast.hits.map(
        (h) =>
          `${h.name}: ${h.damage} damage${h.blocked ? ` (Barrier soaks ${h.blocked})` : ""}`,
      ),
      ...a.effects.map((x) => describeIntentEffect(x, e.power, s)),
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      <span
        className={`intent-chip ${a.interruptible && !interrupted ? "intent-windup" : ""} ${interrupted ? "intent-broken" : ""}`}
        data-damage={damage || undefined}
        title={reads}
      >
        {/* Two lines at most: a third put a back-row chip above the top of
            what every camera framing shows. The move, then what it does. */}
        <span className="intent-head">
          {a.interruptible && !interrupted && <b>WINDUP</b>}
          {interrupted && <b className="intent-stopped">BROKEN</b>}
          <strong>{a.name}</strong>
        </span>
        {(damage || aim || riders.length > 0) && !interrupted && (
          <span className="intent-line">
            {damage && (
              <span className="intent-damage" aria-label={`${damage} damage`}>
                {damage}
                {soaked > 0 && <small> −{soaked}</small>}
              </span>
            )}
            {aim && <em>→ {aim}</em>}
            {riders.length > 0 && (
              <span className="intent-riders">{riders.join(" · ")}</span>
            )}
          </span>
        )}
      </span>
    );
  };

  // Units step clear of each other's name plates, then chips step around
  // plates, figures and each other; see unit-layout and intent-layout.
  const unitLayer = useRef<HTMLDivElement>(null);
  useStageLayout(
    unitLayer,
    places,
    {
      rig: (id) => {
        const enemy = s.enemies.find((e) => e.id === id);
        const player = s.players.find((p) => p.id === id);
        return rigFor(
          unitPresentation(enemy?.definition, player?.heroId).spriteSet,
        );
      },
      pose: (id) => {
        const enemy = s.enemies.find((e) => e.id === id);
        if (enemy) return holdsWindup(enemy) ? "windup" : "rest";
        // A downed hero lies where it fell (see BattleUnit).
        const player = s.players.find((p) => p.id === id);
        return player && player.hp <= 0 ? "down" : "rest";
      },
    },
    onShapes,
    beat.playing,
  );

  // The stagehand draws into three layers inside the camera's world: the
  // units (it offsets travelling figures), the projectiles and marks — which
  // take part in the units' paint order, so an arrow passes in front of one
  // creature and behind another — and the debug overlay.
  const projectileLayer = useRef<HTMLDivElement>(null);
  const overlayLayer = useRef<HTMLDivElement>(null);
  const attach = useCallback(() => {
    stagehand?.attach(
      unitLayer.current,
      projectileLayer.current,
      overlayLayer.current,
    );
  }, [stagehand]);
  const unitsRef = useCallback(
    (el: HTMLDivElement | null) => {
      unitLayer.current = el;
      attach();
    },
    [attach],
  );
  const projectilesRef = useCallback(
    (el: HTMLDivElement | null) => {
      projectileLayer.current = el;
      attach();
    },
    [attach],
  );
  const overlayRef = useCallback(
    (el: HTMLDivElement | null) => {
      overlayLayer.current = el;
      attach();
    },
    [attach],
  );

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
      <BiomeScene
        biome={s.map.find((n) => n.id === s.currentNode)?.biome ?? "foundry"}
        ledger={s.enemies.some((e) => isBoss(e.definition))}
      />

      <div className="world" ref={camera.attach}>
        <div className="layer layer-units" ref={unitsRef}>
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
                replaying={beat.playing}
                treasury={s.gold}
                locked={!enemy && s.locked.includes(u.id)}
                connected={enemy || s.connected.includes(u.id)}
                you={u.id === s.you}
                {...beat.beatFor(u.id)}
              />
            );
          })}
        </div>
        <div
          className="layer layer-projectiles"
          aria-hidden="true"
          ref={projectilesRef}
        />
        <div className="layer layer-vfx" aria-hidden="true">
          {beat.world}
        </div>
        <div
          className="layer layer-choreo-debug"
          aria-hidden="true"
          ref={overlayRef}
        />
        {children}
      </div>

      <div className="layer layer-light" aria-hidden="true" />
      <div className="layer layer-screen">{beat.overlay}</div>
    </div>
  );
}
