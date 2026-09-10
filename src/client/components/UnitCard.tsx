import type { Unit, Player, Enemy } from "../../shared/model";
import { heroes } from "../../content/heroes";
import { enemies } from "../../content/enemies";
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
  const glyph = player
    ? heroes.find((h) => h.id === player.heroId)?.glyph
    : enemies.find((e) => e.id === enemy?.definition)?.glyph;
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
      <span className="unit-glyph" aria-hidden="true">
        {glyph}
      </span>
      <strong>{unit.name}</strong>
      <small>
        {player
          ? player.heroId
          : enemy?.phase === 2
            ? "ENRAGED · PHASE II"
            : "THE EMBER FOUNDRY"}
      </small>
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
