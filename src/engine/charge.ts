import type { ChargeSource, RunState, Unit, Player } from "../shared/model";
import { heroes } from "../content/heroes";
import { CHARGE, ULTIMATE_MAX } from "../content/ultimates";

/**
 * Pact Charge accrual. Authoritative: the server fills the meter, the client
 * only draws it.
 *
 * Every call names what happened, never who did it; how much a class earns
 * from it is the class's content (`HeroDef.chargeAffinity`).
 */

/**
 * The hero whose Ultimate is resolving, if any. An Ultimate never pays for
 * itself: nothing it does fills its caster's meter. Resolution is synchronous
 * and single-threaded, so this is set and cleared around one call and is
 * never seen by anything outside it.
 */
let casting: string | null = null;

export function resolvingUltimate() {
  return casting;
}

export function withUltimate<T>(playerId: string, run: () => T): T {
  const previous = casting;
  casting = playerId;
  try {
    return run();
  } finally {
    casting = previous;
  }
}

const isPlayer = (u: Unit): u is Player => "heroId" in u;

/** Credit `who` with `amount` units of `source`. Anything not a hero is ignored. */
export function charge(
  s: RunState,
  who: Unit | undefined,
  source: ChargeSource,
  amount = 1,
) {
  if (s.ultimateVersion !== 1 || !who || !isPlayer(who)) return;
  if (who.fallen || casting === who.id || !(amount > 0)) return;
  const affinity =
    heroes.find((h) => h.id === who.heroId)?.chargeAffinity?.[source] ?? 1;
  const next = (who.ultimateCharge ?? 0) + CHARGE[source] * amount * affinity;
  // Two decimals: whole points on the meter, without a fraction of a point
  // lost to rounding every time a small hit lands.
  who.ultimateCharge = Math.min(ULTIMATE_MAX, Math.round(next * 100) / 100);
}
