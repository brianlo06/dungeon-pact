import { useEffect, useRef, type ReactNode } from "react";
import type { Enemy, Player, Unit } from "../../shared/model";
import type { Placement } from "../battle/layout";
import { unitPresentation } from "../battle/layout";
import type { Animators } from "../battle/useAnimators";
import { Sprite } from "./Sprite";
import { Strongbox, type VaultState } from "./Strongbox";
import { Miser } from "./Miser";
import { CREATURES } from "./creatures";
import { statuses } from "../../content/statuses";
import { items } from "../../content/items";
import { holdsWindup } from "../battle/hero-clips";

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
}: {
  unit: Unit;
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
  // round was replayed to get there. The fall is `defeat`, the same clip the
  // director asks for on the killing blow, so the two never play it twice.
  // It waits a moment before acting: a new round renders once with settled
  // health before the director rewinds it for replay, and reacting to that
  // one frame would stand a downed hero up only to knock it straight over.
  const wasDown = useRef(down);
  useEffect(() => {
    if (!player || !animators) return;
    const settle = setTimeout(() => {
      if (down) animators.play(unit.id, "defeat", "defeat");
      else if (wasDown.current) animators.play(unit.id, "revive");
      wasDown.current = down;
    }, 60);
    return () => clearTimeout(settle);
  }, [down, player, animators, unit.id]);
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
  const held = enemy?.holding ?? [];
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
      data-side={place.side}
      data-impact={impact ?? undefined}
      data-acting={acting ? "" : undefined}
      data-down={down ? "" : undefined}
      data-phase={enemy?.phase === 2 ? "2" : undefined}
      data-you={you ? "" : undefined}
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
        <span className="combatant-shadow" aria-hidden="true" />
        {marked && <span className="combatant-mark" aria-hidden="true" />}
        <span className="combatant-rig" ref={sprite}>
          {look.spriteSet === "strongbox" ? (
            <Strongbox
              className="combatant-sprite"
              held={held.length}
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
            <Art
              className="combatant-sprite"
              unitId={unit.id}
              animators={animators}
            />
          ) : (
            <Sprite
              id={player?.heroId ?? enemy?.definition ?? "chest"}
              className="combatant-sprite"
            />
          )}
        </span>
        {selected && <span className="combatant-ring" aria-hidden="true" />}
        {pop && (
          <span className={`combatant-pop pop-${impact ?? "damage"}`}>
            {pop}
          </span>
        )}
      </button>
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
        {!!unit.statuses.length && (
          <span className="combatant-statuses">
            {unit.statuses.map((s) => (
              <i
                key={s.id}
                title={`${statuses[s.id].name}: ${statuses[s.id].description} ${s.duration} rounds.`}
              >
                {statuses[s.id].icon}
                {s.stacks > 1 ? s.stacks : ""}
              </i>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
