import type { ReactNode } from "react";
import type { Enemy, Player, Unit } from "../../shared/model";
import type { Placement } from "../battle/layout";
import { Sprite } from "./Sprite";
import { statuses } from "../../content/statuses";
import { items } from "../../content/items";

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
}: {
  unit: Unit;
  /** Where presentation space says this unit stands. */
  place: Placement;
  selectable?: boolean;
  selected?: boolean;
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
}) {
  const player = "heroId" in unit ? (unit as Player) : null;
  const enemy = "definition" in unit ? (unit as Enemy) : null;
  const shown = hp ?? unit.hp;
  const down = shown <= 0;
  const share = Math.max(0, Math.min(1, shown / unit.maxHp));
  const barrier = unit.statuses.find((s) => s.id === "barrier")?.stacks ?? 0;
  const held = enemy?.holding ?? [];
  return (
    <div
      className="combatant"
      data-side={place.side}
      data-impact={impact ?? undefined}
      data-acting={acting ? "" : undefined}
      data-down={down ? "" : undefined}
      data-you={you ? "" : undefined}
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
        <Sprite
          id={player?.heroId ?? enemy?.definition ?? "chest"}
          className="combatant-sprite"
        />
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
          <i style={{ width: `${share * 100}%` }} />
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
