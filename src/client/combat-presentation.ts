import type { Effect, Snapshot } from "../shared/model";

export function treasuryBarrier(
  gold: number,
  effect: Extract<Effect, { kind: "bank" }>,
) {
  return Math.floor(Math.max(0, gold - effect.free) / Math.max(1, effect.per));
}

/** Describe the authored intent; defenses and reactions still resolve in the engine. */
export function describeIntentEffect(
  effect: Effect,
  power: number,
  s: Snapshot,
): string {
  switch (effect.kind) {
    case "damage":
      return `${effect.amount + power} damage before defenses`;
    case "heal":
      return `${effect.amount} healing`;
    case "status":
      return effect.status === "barrier" ? `${effect.stacks} Barrier` : "";
    case "seize":
      return s.enemies.some((e) => e.definition === "strongbox" && e.hp <= 0)
        ? "Strongbox opened · no more seizures"
        : `seizes ${effect.count === 1 ? "the dearest equipped item" : `${effect.count} equipped items`} from each hero hit`;
    case "bank":
      return `+${treasuryBarrier(s.gold, effect)} Barrier from ${s.gold} team gold`;
    default:
      return "";
  }
}
