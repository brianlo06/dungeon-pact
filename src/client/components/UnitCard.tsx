import type { Unit, Player, Enemy } from "../../shared/model";
import { Sprite } from "./Sprite";
import { statuses } from "../../content/statuses";
import { items } from "../../content/items";
import { isObject } from "../../content/enemies";
export function UnitCard({
  unit,
  selected,
  onClick,
  locked,
  connected = true,
  hp,
  impact,
  pop,
  acting,
  owners = [],
}: {
  unit: Unit;
  selected?: boolean;
  onClick?: () => void;
  locked?: boolean;
  connected?: boolean;
  /** Replay health. Falls back to the settled value once a round has landed. */
  hp?: number;
  impact?: "damage" | "heal" | "block" | "combo" | "defeat" | null;
  pop?: string;
  acting?: boolean;
  owners?: Pick<Player, "id" | "name">[];
}) {
  const player = "heroId" in unit ? (unit as Player) : null;
  const enemy = "definition" in unit ? (unit as Enemy) : null;
  const container = enemy && isObject(enemy.definition);
  const holding = (enemy?.holding ?? []).map((h) => {
    const owner = owners.find((p) => p.id === h.playerId)?.name;
    const item = items.find((i) => i.id === h.itemId)?.name ?? h.itemId;
    return owner ? `${owner}: ${item}` : item;
  });
  const shown = hp ?? unit.hp;
  return (
    <button
      className={`unit ${selected ? "selected" : ""} ${shown <= 0 ? "downed" : ""} ${player ? "hero-" + player.heroId : "enemy"} ${impact ? "impact impact-" + impact : ""} ${acting ? "acting" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="unit-top">
        {player
          ? connected
            ? "● Connected"
            : "○ Away"
          : container
            ? shown <= 0
              ? "Opened"
              : "Container"
            : (enemy?.elite ?? "Hostile")}{" "}
        <span>{locked ? "✓ Locked" : unit.row}</span>
      </span>
      <Sprite
        id={player?.heroId ?? enemy?.definition ?? "chest"}
        className="unit-sprite"
      />
      <strong>{unit.name}</strong>
      {container && (
        <small className="container-note">
          {shown <= 0 ? "Equipment returned" : "Optional target"}
        </small>
      )}
      {(player || enemy?.phase === 2) && (
        <small>
          {player
            ? player.heroId
            : enemy?.phase === 2
              ? "ENRAGED · PHASE II"
              : "THE EMBER FOUNDRY"}
        </small>
      )}
      <span className="health">
        <span
          style={{ width: `${Math.max(0, (shown / unit.maxHp) * 100)}%` }}
        />
      </span>
      {!!enemy?.holding?.length && (
        <span className="holding" title={holding.join("; ")}>
          Seized equipment:{" "}
          {holding.map((label, i) => (
            <span className="held-item" key={i}>
              {label}
            </span>
          ))}
        </span>
      )}
      <span className="hp-label">
        {shown} / {unit.maxHp} HP{" "}
        {player && unit.hp <= 0
          ? player.fallen
            ? "· Spirit"
            : `· Downed ${player.downedRounds}`
          : ""}
      </span>
      {pop && (
        <span className={`pop pop-${impact ?? "damage"}`} aria-hidden="true">
          {pop}
        </span>
      )}
      <span className="status-list">
        {unit.statuses.map((s) => (
          <span
            key={s.id}
            title={`${statuses[s.id].name}: ${statuses[s.id].description} ${s.duration} rounds.`}
          >
            {statuses[s.id].icon} {s.stacks} <small>{s.duration}r</small>
          </span>
        ))}
      </span>
    </button>
  );
}
