import { EquipmentProvider } from "../equipment/Equipment";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Enemy, Player, Unit } from "../../shared/model";
import type { Placement } from "../battle/layout";
import { unitPresentation } from "../battle/layout";
import type { Animators } from "../battle/useAnimators";
import { Sprite } from "./Sprite";
import { Strongbox, type VaultState } from "./Strongbox";
import { Miser } from "./Miser";
import { CREATURES } from "./creatures";
import { StatusReadout } from "./StatusReadout";
import { items } from "../../content/items";
import { holdsWindup } from "../battle/hero-clips";
import { ULTIMATE_MAX } from "../../content/ultimates";

export type Impact = "damage" | "heal" | "block" | "combo" | "defeat" | null;

/**
 * One combatant standing on the battlefield.
 *
 * This deliberately replaces the old unit card. A card is a row in a table: it
 * has a border, a fixed footprint, and it puts a stat block where the fighter
 * should be. A combatant is a silhouette on the ground with a shadow, a name
 * plate small enough to ignore, and room to be a different size from its
 * neighbours. Depth is a number the stage supplies rather than a row label.
 */
export function BattleUnit({
  unit,
  place,
  selectable,
  selected,
  marked,
  onSelect,
  hp,
  impact,
  pop,
  acting,
  locked,
  connected = true,
  you,
  intent,
  owners,
  animators,
  replaying,
  treasury,
  equipment,
  heldEquipment,
  gearPulse,
}: {
  unit: Unit;
  equipment?: string[];
  heldEquipment?: { playerId: string; itemId: string }[];
  gearPulse?: { itemId: string; key: number };
  /** Where presentation space says this unit stands. */
  place: Placement;
  selectable?: boolean;
  selected?: boolean;
  /** A legal target while the player is picking one. */
  marked?: boolean;
  onSelect?: () => void;
  hp?: number;
  impact?: Impact;
  pop?: string;
  acting?: boolean;
  locked?: boolean;
  connected?: boolean;
  you?: boolean;
  intent?: ReactNode;
  owners?: Player[];
  animators?: Animators;
  /** A round is being replayed, so the board is not yet the one shown. */
  replaying?: boolean;
  /** The pact's gold, for the Miser, which is armoured in it. */
  treasury?: number;
}) {
  const [highlight, setHighlight] = useState<string>();
  const player = "heroId" in unit ? (unit as Player) : null;
  const enemy = "definition" in unit ? (unit as Enemy) : null;
  const look = unitPresentation(enemy?.definition, player?.heroId);
  const Art = look.spriteSet ? CREATURES[look.spriteSet] : undefined;
  const sprite = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    animators?.register(unit.id, look.spriteSet);
    animators?.attach(unit.id, sprite.current);
    return () => animators?.attach(unit.id, null);
  }, [animators, unit.id, look.spriteSet]);
  const shown = hp ?? unit.hp;
  const down = shown <= 0;
  // A hero lies down while downed and gets up when revived, whether or not a
  // round was replayed to get there. The pose follows the board being shown:
  // the replay's health while a round is replayed, the settled board
  // otherwise. A round that has arrived but not yet played its first beat has
  // no replay health, and its settled board is the round *after* the one
  // about to be shown, so the pose waits for the replay — the `replaying`
  // flag says so on the very render the round arrives in, however late the
  // replay's first frame comes. During a replay the director's defeat beat
  // does the knocking down; a revival there, or anything on the settled
  // board, is this. `setDown` compares against the pose on screen, so a fall
  // the replay already played is not played twice and only the fallen rise.
  const posed = replaying ? hp : unit.hp;
  const lying = posed === undefined ? null : posed <= 0;
  useEffect(() => {
    if (!player || !animators || lying === null) return;
    if (lying && replaying) return;
    animators.setDown(unit.id, lying);
  }, [lying, replaying, player, animators, unit.id]);
  // An enemy with a wind-up announced holds its `windup` pose through the
  // planning phase: the threat is the held pose. This follows the settled
  // board only. During a replay the board already shows next round's intents
  // while the round being replayed is still the old one, so the director owns
  // the rest loop until it finishes — it knows when a held move lands or is
  // broken. `replaying` is already true on the render a new round arrives
  // in, so this needs no timer to wait the replay out; a timer is not a
  // guard on a loaded machine, where the render that starts the replay can
  // come a quarter of a second late. A rig with no `windup` keeps idling.
  const winding = !!enemy && holdsWindup(enemy);
  useEffect(() => {
    if (!animators || replaying) return;
    animators.setRest(unit.id, winding ? "windup" : "idle");
  }, [winding, replaying, animators, unit.id]);
  const share = Math.max(0, Math.min(1, shown / unit.maxHp));
  const barrier = unit.statuses.find((s) => s.id === "barrier")?.stacks ?? 0;
  const held = heldEquipment ?? enemy?.holding ?? [];
  // The vault's state is readable before anyone reads the count.
  const vault: VaultState = down
    ? "broken"
    : share < 0.45
      ? "damaged"
      : held.length
        ? "holding"
        : "empty";
  return (
    <div
      className="combatant"
      data-unit={unit.id}
      data-rig={look.spriteSet}
      data-side={place.side}
      data-impact={impact ?? undefined}
      data-acting={acting ? "" : undefined}
      data-down={down ? "" : undefined}
      data-phase={enemy?.phase === 2 ? "2" : undefined}
      data-you={you ? "" : undefined}
      data-ult-ready={
        player && !down && (player.ultimateCharge ?? 0) >= ULTIMATE_MAX
          ? ""
          : undefined
      }
      data-marked={marked ? "" : undefined}
      style={
        {
          left: `${place.x * 100}%`,
          top: `${place.y * 100}%`,
          zIndex: place.z,
          "--depth": place.depth,
          "--scale": place.scale,
          "--shadow": place.shadow,
        } as React.CSSProperties
      }
    >
      {intent && <div className="combatant-intent">{intent}</div>}
      <button
        type="button"
        className="combatant-body"
        onClick={onSelect}
        disabled={!selectable}
        aria-pressed={selected}
        aria-label={`${unit.name}, ${shown} of ${unit.maxHp} health`}
      >
        {/*
          The choreography offset lives on `.combatant-travel`, written by the
          stagehand while a replay carries this figure across the floor; the
          figure, its shadow and its marks travel, and the plate and chip stay
          home. `.combatant-lift` raises it off the floor for a leap — the
          shadow stays down — and mirrors it to face the other way, so the
          drawing and its rig's motion turn round together. The rig itself is
          the animator's. Nothing here is ever positioned by React.
        */}
        <span className="combatant-travel">
          <span className="combatant-shadow" aria-hidden="true" />
          {marked && <span className="combatant-mark" aria-hidden="true" />}
          <span className="combatant-lift">
            <span className="combatant-rig" ref={sprite}>
              {look.spriteSet === "strongbox" ? (
                <Strongbox
                  className="combatant-sprite"
                  held={held.length}
                  itemIds={held.map((h) => h.itemId)}
                  state={vault}
                />
              ) : look.spriteSet === "miser" ? (
                <Miser
                  className="combatant-sprite"
                  unitId={unit.id}
                  animators={animators}
                  treasury={treasury}
                  barrier={barrier}
                />
              ) : Art ? (
                <EquipmentProvider
                  items={equipment ?? player?.items ?? []}
                  pulse={gearPulse?.itemId}
                  pulseKey={gearPulse?.key}
                  highlight={highlight}
                >
                  <Art
                    className="combatant-sprite"
                    unitId={unit.id}
                    animators={animators}
                  />
                </EquipmentProvider>
              ) : (
                <Sprite
                  id={player?.heroId ?? enemy?.definition ?? "chest"}
                  className="combatant-sprite"
                />
              )}
            </span>
          </span>
          {selected && <span className="combatant-ring" aria-hidden="true" />}
        </span>
        {pop && (
          <span className={`combatant-pop pop-${impact ?? "damage"}`}>
            {pop}
          </span>
        )}
      </button>
      {player && (
        <details
          className="equipment-inspector"
          onToggle={() => setHighlight(undefined)}
        >
          <summary aria-label={`Inspect ${unit.name}'s equipment`}>
            Build
          </summary>
          <div className="equipment-inspector-panel">
            <strong>{unit.name}</strong>
            {(["weapon", "armor", "relic"] as const).map((slot) => {
              const item = (equipment ?? player.items)
                .map((id) => items.find((i) => i.id === id))
                .find((i) => i?.slot === slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onMouseEnter={() => setHighlight(item?.id)}
                  onMouseLeave={() => setHighlight(undefined)}
                  onFocus={() => setHighlight(item?.id)}
                  onBlur={() => setHighlight(undefined)}
                >
                  <small>{slot.toUpperCase()}</small>
                  <b>{item?.name ?? "Base equipment"}</b>
                  <span>
                    {item?.description ?? "Class signature appearance"}
                  </span>
                </button>
              );
            })}
          </div>
        </details>
      )}
      <div className="combatant-plate">
        <span className="combatant-name">
          {unit.name}
          {player && !connected && <i title="Away"> ○</i>}
          {locked && <i className="combatant-lock" title="Plan locked" />}
        </span>
        <span className="combatant-bar" title={`${shown} / ${unit.maxHp} HP`}>
          <i style={{ transform: `scaleX(${share})` }} />
          {barrier > 0 && <b>{barrier}</b>}
        </span>
        {enemy?.phase === 2 && <span className="combatant-tag">ENRAGED</span>}
        {player && down && (
          <span className="combatant-tag">
            {player.fallen ? "SPIRIT" : `DOWN ${player.downedRounds}`}
          </span>
        )}
        {!!held.length && (
          <span
            className="combatant-tag holding"
            title={held
              .map(
                (h) =>
                  `${items.find((i) => i.id === h.itemId)?.name ?? h.itemId}${
                    owners?.find((o) => o.id === h.playerId)
                      ? ` — ${owners.find((o) => o.id === h.playerId)!.name}`
                      : ""
                  }`,
              )
              .join(", ")}
          >
            ⚿ {held.length} held
          </span>
        )}
        <StatusReadout unit={unit} replaying={replaying} />
      </div>
    </div>
  );
}
