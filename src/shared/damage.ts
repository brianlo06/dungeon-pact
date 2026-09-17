import type { Status, StatusId } from "./model";

/**
 * How much one hit does, in one place. The engine resolves every damage effect
 * through `hitDamage`, and the battlefield forecasts every enemy intent through
 * the same function, so the number a chip shows is the number the round deals.
 */

/** Mark + Precision bonus. Setting up an Exploit costs a whole action, so the
 * payoff has to beat simply attacking twice. */
export const EXPLOIT = 20;
/** Weak is the answer to a spike for parties with no Vanguard to intercept it,
 * so it has to be worth the action it costs. */
export const WEAK = 0.65;
/** Empowered is Weak's mirror: the Herald's whole job is making allies hit harder. */
export const EMPOWERED = 1.3;
/** Vulnerable: every hit a quarter heavier. */
export const VULNERABLE = 1.25;
/** Each hardened plate a striker wears adds this much to every hit. */
export const ENCRUSTED = 3;

interface Striker {
  power: number;
  statuses: Status[];
}
interface Struck {
  guard: number;
  statuses: Status[];
}
const has = (u: { statuses: Status[] }, id: StatusId) =>
  u.statuses.some((x) => x.id === id);
const stacks = (u: { statuses: Status[] }, id: StatusId) =>
  u.statuses.find((x) => x.id === id)?.stacks ?? 0;

/**
 * A hit's damage before Barrier, as the engine applies it: power and plates added, Weak
 * and Empowered on the striker, Guard taken off unless it pierces, Vulnerable
 * on the victim, and the Exploit bonus when a precise hit meets a Mark. Never
 * less than 1.
 */
export function hitDamage(
  amount: number,
  striker: Striker,
  victim: Struck,
  options: { pierce?: boolean; precision?: boolean } = {},
) {
  let n =
    (amount + striker.power + ENCRUSTED * stacks(striker, "encrusted")) *
      (has(striker, "weak") ? WEAK : 1) *
      (has(striker, "empowered") ? EMPOWERED : 1) -
    (options.pierce ? 0 : victim.guard);
  if (has(victim, "vulnerable")) n *= VULNERABLE;
  if (options.precision && has(victim, "marked")) n += EXPLOIT;
  return Math.max(1, Math.round(n));
}
