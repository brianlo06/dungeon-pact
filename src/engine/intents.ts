import type {
  Behavior,
  Enemy,
  EnemyDef,
  IntentCondition,
  IntentRule,
  IntentStep,
  RunState,
  TargetFilter,
  Unit,
} from "../shared/model";
import { enemies as definitions } from "../content/enemies";
import { pick } from "./rng";

/**
 * How an enemy with a `behavior` chooses its intent.
 *
 * Everything here reads state the whole party can see — statuses, rows,
 * health, the treasury — and the only dice are the room's seeded ones, so the
 * choice is deterministic and, once announced, fully visible. Nothing names a
 * creature: a rule is content, and this file only asks the questions a rule
 * can pose.
 *
 * A behavior is a list of steps taken in turn, one a round. Within a step the
 * first rule that applies is chosen, or with `weighted` the dice choose among
 * all that apply. A rule applies when its conditions hold and it has someone
 * it may be aimed at. A step where nothing applies falls through to the next
 * step, and a behavior where nothing applies anywhere does nothing.
 */

export interface Chosen {
  rule: IntentRule;
  target?: Unit;
  why?: string;
}

const standing = (s: RunState) =>
  s.players.filter((p) => p.hp > 0 && !p.fallen);
const isObject = (u: Unit) =>
  "definition" in u &&
  !!definitions.find((d) => d.id === (u as Enemy).definition)?.object;
const has = (u: Unit, id: string, atLeast = 1) =>
  (u.statuses.find((x) => x.id === id)?.stacks ?? 0) >= atLeast;
const fraction = (u: Unit) => u.hp / Math.max(1, u.maxHp);
const allies = (s: RunState, e: Enemy) =>
  s.enemies.filter((x) => x.id !== e.id && x.hp > 0 && !isObject(x));
const count = (n: number, c: { atMost?: number; atLeast?: number }) =>
  (c.atMost === undefined || n <= c.atMost) &&
  (c.atLeast === undefined || n >= c.atLeast);

export function holds(s: RunState, e: Enemy, c: IntentCondition): boolean {
  switch (c.kind) {
    case "heroHas":
      return standing(s).some((p) => has(p, c.status));
    case "selfHas":
      return has(e, c.status, c.atLeast ?? 1);
    case "selfBelow":
      return fraction(e) < c.fraction;
    case "allyHas":
      return allies(s, e).some((x) => has(x, c.status));
    case "allyBelow":
      return allies(s, e).some((x) => fraction(x) < c.fraction);
    case "alliesInRow":
      return count(
        s.enemies.filter((x) => x.hp > 0 && !isObject(x) && x.row === c.row)
          .length,
        c,
      );
    case "heroesInRow":
      return count(standing(s).filter((p) => p.row === c.row).length, c);
    case "treasury":
      return s.gold >= c.atLeast;
    case "not":
      return !holds(s, e, c.condition);
  }
}

/** Everyone a rule's move may be aimed at, filtered and ordered. */
export function candidates(
  s: RunState,
  e: Enemy,
  def: EnemyDef,
  rule: IntentRule,
): Unit[] {
  const a = rule.ability;
  const f: TargetFilter = rule.target ?? {};
  if (a.target === "self") return [e];
  const allySide = a.target === "ally" || a.target === "allyRow";
  let pool: Unit[] = allySide
    ? s.enemies.filter(
        (x) =>
          x.hp > 0 &&
          (f.self || x.id !== e.id) &&
          (f.objects === true ? isObject(x) : !isObject(x)),
      )
    : standing(s);
  if (f.bound) pool = pool.filter((u) => u.id === e.bound);
  if (f.has) pool = pool.filter((u) => has(u, f.has!));
  if (f.lacks) pool = pool.filter((u) => !has(u, f.lacks!));
  if (f.row) pool = pool.filter((u) => u.row === f.row);
  if (f.below !== undefined) pool = pool.filter((u) => fraction(u) < f.below!);
  if (f.atLeast !== undefined)
    pool = pool.filter((u) => fraction(u) >= f.atLeast!);
  if (f.unhosted)
    pool = pool.filter(
      (u) =>
        !s.enemies.some(
          (x) => x.owner === u.id && x.definition === f.unhosted && x.hp > 0,
        ),
    );
  // A move that would spawn onto its actor does nothing while the actor's
  // objects of that kind still stand, so it is not on the table.
  for (const fx of a.effects)
    if (
      fx.kind === "spawn" &&
      // Onto an ally, the ally owns it and `unhosted` is the check; onto the
      // actor or a hero, the actor owns it.
      (fx.on !== "target" || !allySide) &&
      s.enemies.some(
        (x) => x.owner === e.id && x.definition === fx.object && x.hp > 0,
      )
    )
      return [];
  // Heroes on the row the creature prefers come first, when any stand there.
  if (!allySide && !f.row && !f.bound) {
    const preferred = pool.filter((u) => u.row === (def.prefers ?? "front"));
    if (preferred.length) pool = preferred;
  }
  const order = f.order;
  const byId = (a: Unit, b: Unit) => a.id.localeCompare(b.id);
  if (order === "lowestHp") pool.sort((a, b) => a.hp - b.hp || byId(a, b));
  if (order === "highestHp") pool.sort((a, b) => b.hp - a.hp || byId(a, b));
  if (order === "lowestFraction")
    pool.sort((a, b) => fraction(a) - fraction(b) || byId(a, b));
  if (order === "highestGuard")
    pool.sort((a, b) => b.guard - a.guard || b.maxHp - a.maxHp || byId(a, b));
  return pool;
}

function applies(s: RunState, e: Enemy, def: EnemyDef, rule: IntentRule) {
  if (!(rule.when ?? []).every((c) => holds(s, e, c))) return null;
  const pool = candidates(s, e, def, rule);
  if (!pool.length) return null;
  return pool;
}

function resolveStep(
  s: RunState,
  e: Enemy,
  def: EnemyDef,
  step: IntentStep,
): Chosen | null {
  const open = step.rules
    .map((rule) => ({ rule, pool: applies(s, e, def, rule) }))
    .filter((x): x is { rule: IntentRule; pool: Unit[] } => !!x.pool);
  if (!open.length) return null;
  let chosen = open[0];
  if (step.weighted && open.length > 1) {
    const total = open.reduce((n, x) => n + (x.rule.weight ?? 1), 0);
    let roll = pick(s, Array.from({ length: total }, (_, i) => i));
    chosen = open.find((x) => (roll -= x.rule.weight ?? 1) < 0) ?? open[0];
  }
  const { rule, pool } = chosen;
  const ordered = !!rule.target?.order || rule.ability.target === "self";
  // An ally-aimed move with no order serves the one who needs it most.
  const allySide =
    rule.ability.target === "ally" || rule.ability.target === "allyRow";
  const target = ordered
    ? pool[0]
    : allySide
      ? [...pool].sort(
          (a, b) => fraction(a) - fraction(b) || a.id.localeCompare(b.id),
        )[0]
      : pick(s, pool);
  const why = rule.why?.replaceAll("{target}", target?.name ?? "");
  return { rule, target, why };
}

/** The steps in force: the low-health pattern once it has been reached. */
function stepsFor(e: Enemy, behavior: Behavior) {
  return behavior.below && fraction(e) < behavior.below.fraction
    ? behavior.below.steps
    : behavior.steps;
}

export function chooseIntent(
  s: RunState,
  e: Enemy,
  def: EnemyDef,
  behavior: Behavior,
): Chosen | null {
  const steps = stepsFor(e, behavior);
  const start = (s.round - 1) % steps.length;
  for (let i = 0; i < steps.length; i++) {
    const chosen = resolveStep(s, e, def, steps[(start + i) % steps.length]);
    if (chosen) return chosen;
  }
  return null;
}

