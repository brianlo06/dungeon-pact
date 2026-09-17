import { events, type EventDef, type Outcome } from "./events";
import type { RunState } from "../shared/model";
import { items } from "./items";

/**
 * Reading a chance event's odds, shared by the rules that roll them and the
 * screen that prints them, so the percentages a party votes on are exactly
 * the bands the dice are read against.
 */

export function eventDef(s: Pick<RunState, "eventId">): EventDef {
  return events.find((e) => e.id === s.eventId)!;
}

/** The odds and price of try number `step + 1` of a press-your-luck event. */
export function pressOdds(event: EventDef, step: number) {
  const press = event.press!;
  const at = <T>(list: T[] | undefined, fallback: T) =>
    list?.length ? list[Math.min(step, list.length - 1)] : fallback;
  return { chance: at(press.chances, 100), hurt: at(press.hurt, 0) };
}

/**
 * Each outcome's share of a roll in whole percent, as the screen prints it.
 * Rounded by largest remainder so the shares always add up to exactly 100:
 * six equal slices are 17, 17, 17, 17, 16 and 16, not six 17s.
 */
export function shares(outcomes: Outcome[]) {
  const total = outcomes.reduce((n, o) => n + o.weight, 0);
  const exact = outcomes.map((o) => (o.weight / total) * 100);
  const percent = exact.map(Math.floor);
  const short = 100 - percent.reduce((n, x) => n + x, 0);
  exact
    .map((x, i) => ({ i, rest: x - Math.floor(x) }))
    .sort((a, b) => b.rest - a.rest || a.i - b.i)
    .slice(0, short)
    .forEach(({ i }) => percent[i]++);
  return outcomes.map((outcome, i) => ({ outcome, percent: percent[i] }));
}

/**
 * Which outcome a d100 lands on: the printed shares, laid end to end as bands
 * in order. A 70% favourite wins on 1–70 and loses on 71–100.
 */
export function landOn(outcomes: Outcome[], roll: number) {
  let edge = 0;
  for (const { outcome, percent } of shares(outcomes)) {
    edge += percent;
    if (roll <= edge) return outcome;
  }
  return outcomes.at(-1)!;
}

/**
 * What an outcome does, in a few words: "+120 gold", "Elite fight". Shown on
 * the odds before a vote and on the result after it, so the two always agree.
 */
export function describeOutcome(o: Outcome): string {
  const parts: string[] = [];
  if (o.fight) parts.push(o.fight === "elite" ? "Elite fight" : "Fight");
  if (o.relic) parts.push(`Team relic${o.gold ? ` (or +${o.gold} gold)` : ""}`);
  else if (o.gold)
    parts.push(`${o.gold > 0 ? "+" : "−"}${Math.abs(o.gold)} gold`);
  if (o.healShare === 1) parts.push("Full heal each");
  else if (o.healShare)
    parts.push(
      `${o.healShare > 0 ? "+" : "−"}${Math.round(Math.abs(o.healShare) * 100)}% HP each`,
    );
  if (o.heal)
    parts.push(`${o.heal > 0 ? "+" : "−"}${Math.abs(o.heal)} HP each`);
  if (o.maxHp)
    parts.push(`${o.maxHp > 0 ? "+" : "−"}${Math.abs(o.maxHp)} max HP`);
  if (o.power) parts.push(`+${o.power} Power for one hero`);
  if (o.supply)
    parts.push(
      `${items.find((i) => i.id === o.supply)?.name ?? o.supply} each`,
    );
  if (o.cleanse) parts.push("statuses cleared");
  return parts.join(", ");
}

/**
 * The outcome an id names, read in the context of the choice that rolled it:
 * a bet's two sides both call their outcomes "win" and "lose".
 */
export function outcomeFor(
  event: EventDef,
  choice: string,
  id: string | undefined,
): Outcome | undefined {
  if (!id) return undefined;
  const c = event.choices.find((c) => c.id === choice);
  const press = event.press;
  const pool = [
    ...(c?.roll ?? []),
    ...(c?.each ?? []),
    ...(press?.loot ?? []),
    ...(press?.bust ? [press.bust] : []),
    ...(press?.prize ? [press.prize] : []),
  ];
  return pool.find((o) => o.id === id);
}
