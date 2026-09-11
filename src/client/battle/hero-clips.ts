import type { Beat, Snapshot } from "../../shared/model";
import type { ClipName } from "../../shared/presentation";
import { abilities } from "../../content/heroes";

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
 * Enemies get the part of this that needs no ability lookup: aimed at itself
 * is a brace and aimed at another enemy is a cast, so the Mender welds the
 * ally it is repairing instead of lunging at it. Every other enemy action,
 * and anything this cannot identify, stays `attack`. Presentation only.
 */
export function castClip(s: Snapshot | null, beat: Beat): ClipName {
  if (s?.enemies.some((e) => e.id === beat.actor)) {
    if (beat.target === beat.actor) return "block";
    if (s.enemies.some((e) => e.id === beat.target)) return "cast";
    return "attack";
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
