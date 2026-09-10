import { enemies, enemyAbilities } from "../../content/enemies";
import type { Snapshot } from "../../shared/model";
import { treasuryBarrier } from "../combat-presentation";

export function BossObjective({ s }: { s: Snapshot }) {
  if (s.combatVersion !== 2) return null;
  const boss = s.enemies.find(
    (e) => e.hp > 0 && enemies.find((d) => d.id === e.definition)?.objective,
  );
  const definition = enemies.find((d) => d.id === boss?.definition);
  if (!definition?.objective) return null;
  const box = s.enemies.find((e) => e.definition === "strongbox");
  const opened = definition.id === "collector" && box && box.hp <= 0;
  const bank = enemyAbilities(definition, s.combatVersion)
    .flatMap((a) => a.effects)
    .find((e) => e.kind === "bank");
  return (
    <p className="objective-banner">
      <strong>{opened ? "RECLAIMED" : "OBJECTIVE"}</strong>{" "}
      {opened
        ? "The Strongbox is open. Equipment returned; no more seizures this fight."
        : definition.objective}
      {bank?.kind === "bank" && (
        <span className="objective-detail">
          Weight of wealth: +{treasuryBarrier(s.gold, bank)} Barrier at {s.gold}{" "}
          team gold. Only gold above {bank.free} counts: 1 Barrier per{" "}
          {bank.per} gold.
        </span>
      )}
    </p>
  );
}
