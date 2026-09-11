import type {
  Ability,
  Beat,
  Effect,
  Enemy,
  Snapshot,
} from "../../shared/model";
import type { ClipName } from "../../shared/presentation";
import { abilities } from "../../content/heroes";
import { enemies, enemyAbilities } from "../../content/enemies";

/**
 * Effects that exist only to carry a boss's objective: the Collector's seizure
 * and the Miser's banked treasury. Matched by what the ability does, not by who
 * is using it, so any content that seizes or banks gets the same choreography.
 */
const OBJECTIVE = new Set<Effect["kind"]>(["seize", "bank"]);

/**
 * Whether an enemy is holding a wind-up: it has announced an interruptible
 * move, is standing, and has not had it broken. This is the state the
 * `WINDUP` intent chip reports, and the one an interrupt may be aimed at.
 */
export function holdsWindup(enemy: Enemy): boolean {
  return (
    enemy.hp > 0 &&
    !!enemy.intent?.ability.interruptible &&
    !enemy.statuses.some((s) => s.id === "interrupted")
  );
}

/**
 * Whether an enemy ability, landing, is that creature's signature move: the
 * move it wound up for (an interrupted wind-up never lands at all, so any
 * interruptible move that does was held to the end), or an objective strike.
 */
export function isSignatureMove(ability: Ability): boolean {
  return (
    !!ability.interruptible ||
    ability.effects.some((e) => OBJECTIVE.has(e.kind))
  );
}

/**
 * Which clip a hero plays when it acts.
 *
 * The engine reports every action as a `cast` beat carrying the ability's
 * name, and until the party was drawn every one of them played `attack` — so
 * the Warden swung at the ally it was healing. Heroes have the vocabulary to
 * do better, and the ability's own shape says which move it is: aimed at
 * yourself is bracing, aimed at an ally is a cast, a costly or cooling-down
 * strike is a signature, and anything else that hits is an attack.
 *
 * Enemies: aimed at itself is a brace and aimed at another enemy is a cast,
 * so the Mender welds the ally it is repairing instead of lunging at it. A
 * strike at the party is `signature` when it is the move the creature wound
 * up for or its objective, and `attack` otherwise, including anything this
 * cannot identify. The snapshot a round arrives in already carries next
 * round's intents, so the ability is found by the beat's label in the
 * creature's rotation rather than read off its intent. A creature with no
 * `signature` clip plays its `attack`; the animator resolves that, not this.
 * Presentation only.
 */
export function castClip(s: Snapshot | null, beat: Beat): ClipName {
  const enemy = s?.enemies.find((e) => e.id === beat.actor);
  if (s && enemy) {
    if (beat.target === beat.actor) return "block";
    if (s.enemies.some((e) => e.id === beat.target)) return "cast";
    const def = enemies.find((d) => d.id === enemy.definition);
    const ability =
      def &&
      enemyAbilities(def, s.combatVersion).find((a) => a.name === beat.label);
    return ability && isSignatureMove(ability) ? "signature" : "attack";
  }
  const hero = s?.players.find((p) => p.id === beat.actor);
  if (!s || !hero) return "attack";
  const ability = abilities(
    hero.heroId,
    s.combatVersion,
    hero.upgrades,
    hero.evolution,
    hero.items,
  ).find((a) => a.name === beat.label);
  // A supply is spent by the time the round arrives, so it can be missing
  // from the list; the target still says which side it was aimed at.
  const aim =
    ability?.target ??
    (beat.target === beat.actor
      ? "self"
      : s.players.some((p) => p.id === beat.target)
        ? "ally"
        : "enemy");
  if (aim === "self") return "block";
  if (aim === "ally" || aim === "allyRow") return "cast";
  if (!ability) return "attack";
  if (!ability.effects.some((e) => e.kind === "damage" && !e.self))
    return "cast";
  return ability.cost >= 2 || ability.cooldown >= 1 ? "signature" : "attack";
}
