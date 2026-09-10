import type { Unit, Player, Enemy } from "../../shared/model";
import { Sprite } from "./Sprite";
import { statuses } from "../../content/statuses";
export function UnitCard({
  unit,
  selected,
  onClick,
  locked,
  connected = true,
}: {
  unit: Unit;
  selected?: boolean;
  onClick?: () => void;
  locked?: boolean;
  connected?: boolean;
}) {
  const player = "heroId" in unit ? (unit as Player) : null;
  const enemy = "definition" in unit ? (unit as Enemy) : null;
  return (
    <button
      className={`unit ${selected ? "selected" : ""} ${unit.hp <= 0 ? "downed" : ""} ${player ? "hero-" + player.heroId : "enemy"}`}
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
        <span style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} />
      </span>
      <span className="hp-label">
        {unit.hp} / {unit.maxHp} HP{" "}
        {player && unit.hp <= 0
          ? player.fallen
            ? "· Spirit"
            : `· Downed ${player.downedRounds}`
          : ""}
      </span>
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
