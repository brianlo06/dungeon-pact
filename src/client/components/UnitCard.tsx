import type { Unit, Player, Enemy } from "../../shared/model";
import { Sprite } from "./Sprite";
import { statuses } from "../../content/statuses";
import { items } from "../../content/items";
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
}) {
  const player = "heroId" in unit ? (unit as Player) : null;
  const enemy = "definition" in unit ? (unit as Enemy) : null;
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
          : (enemy?.elite ?? "Hostile")}{" "}
        <span>{locked ? "✓ Locked" : unit.row}</span>
      </span>
      <Sprite
        id={player?.heroId ?? enemy?.definition ?? "chest"}
        className="unit-sprite"
      />
      <strong>{unit.name}</strong>
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
        <span
          className="holding"
          title={enemy.holding
            .map((h) => items.find((i) => i.id === h.itemId)?.name ?? h.itemId)
            .join(", ")}
        >
          ⚿ holding{" "}
          {enemy.holding
            .map((h) => items.find((i) => i.id === h.itemId)?.name ?? h.itemId)
            .join(" · ")}
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
