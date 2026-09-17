import type { Player, RunState } from "../shared/model";
import {
  events,
  type EventChoice,
  type EventDef,
  type Outcome,
} from "../content/events";
import { services } from "../content/services";
import { items } from "../content/items";
import { random, pick } from "./rng";
import { eventDef, landOn, pressOdds } from "../content/odds";
export {
  describeOutcome,
  eventDef,
  landOn,
  outcomeFor,
  pressOdds,
  shares,
} from "../content/odds";
import { log, spend, gain } from "./effects";
import { enterCombat } from "./combat";

/**
 * Event chambers, including the chance events in `content/luck-events.ts`.
 *
 * A fixed event resolves the moment the vote does. A chance event rolls, then
 * holds the party on the result — `s.luck` — until someone continues, so
 * everyone sees what the dice did before the map takes over. A press-your-luck
 * event asks again after each try instead.
 *
 * Every roll is a d100 from the run's own RNG, so the same seed and the same
 * votes always roll the same way, and the result is revealed with the number
 * it came from: a party that loses a 70% bet should be able to see that it was
 * the 30%.
 */

/**
 * Draws an event nobody on this run has seen yet, while any remain. Fourteen
 * events over two floors rarely repeat anyway; this makes sure a party that
 * rolls well is not also shown the same wheel twice.
 */
export function enterEvent(s: RunState) {
  const seen = s.eventsSeen ?? [];
  // An event added with boss pools is only drawn in a room that has them.
  const offered = events.filter((e) => !e.bossVersion || s.bossVersion === 1);
  const fresh = offered.filter((e) => !seen.includes(e.id));
  const event = pick(s, fresh.length ? fresh : offered);
  s.eventId = event.id;
  s.eventsSeen = [...seen, event.id];
  delete s.luck;
  s.votes = {};
  s.phase = "EVENT";
  if (event.luck) log(s, `${event.name}. Luck decides this one.`);
}

/** The choices on the table right now, with what each costs up front. */
export function eventChoices(
  s: RunState,
): { id: string; name: string; cost: number }[] {
  const event = eventDef(s);
  if (s.luck?.done) return [];
  if (s.luck && event.press) {
    const odds = pressOdds(event, s.luck.step);
    return [
      {
        id: "press",
        name:
          event.press.kind === "search"
            ? `Search again (${odds.chance}% ambush)`
            : `Reach in again (${odds.chance}% to find it)`,
        cost: 0,
      },
      {
        id: "leave",
        name:
          event.press.kind === "search"
            ? "Leave with what you found"
            : "Give up",
        cost: 0,
      },
    ];
  }
  return event.choices.map((c) => ({ id: c.id, name: c.name, cost: c.cost }));
}

/** 1–100, inclusive. A roll "under" a chance succeeds when `roll <= chance`. */
function d100(s: RunState) {
  return Math.floor(random(s) * 100) + 1;
}

const standingHeroes = (s: RunState) => s.players.filter((p) => p.hp > 0);

/** Applies one outcome to the heroes it touches. Returns nothing; logs what it did. */
function apply(s: RunState, o: Outcome, heroes: Player[]) {
  if (o.relic) {
    const relic = services.find(
      (x) => "relic" in x && !s.teamRelics?.includes(x.relic),
    );
    if (relic && "relic" in relic) {
      s.teamRelics = [...(s.teamRelics ?? []), relic.relic];
      log(s, `The party gains ${relic.name.split(" · ")[0]}.`, "gold");
    } else if (o.gold) gain(s, o.gold);
  } else if (o.gold && o.gold > 0) gain(s, o.gold);
  else if (o.gold && o.gold < 0) {
    const lost = Math.min(s.gold, -o.gold);
    s.gold -= lost;
    log(s, `Treasury −${lost} gold`, "gold");
  }
  for (const p of heroes) {
    if (p.hp <= 0) continue;
    if (o.maxHp) {
      p.maxHp = Math.max(1, p.maxHp + o.maxHp);
      p.hp += o.maxHp;
    }
    const change = (o.heal ?? 0) + Math.round((o.healShare ?? 0) * p.maxHp);
    p.hp = Math.max(1, Math.min(p.maxHp, p.hp + change));
    if (o.cleanse) p.statuses = [];
    if (o.supply) p.items.push(o.supply);
  }
  if (o.power) {
    const lucky = pick(s, standingHeroes(s));
    lucky.power += o.power;
    log(s, `${lucky.name} gains ${o.power} Power.`);
  }
}

/** The party's vote on an event chamber has landed on `result`. */
export function resolveEvent(s: RunState, result: string) {
  const event = eventDef(s);
  if (s.luck && event.press) {
    if (result === "press") return pressOn(s, event);
    log(s, "The party leaves while it still can.");
    return leaveEvent(s);
  }
  const c = event.choices.find((c) => c.id === result)!;
  spend(s, c.cost);
  if (c.press) {
    s.luck = { choice: c.id, step: 0, found: [] };
    return pressOn(s, event);
  }
  if (c.roll) return rollFor(s, c, c.roll);
  if (c.each) return rollEach(s, c, c.each);
  if (c.gold) gain(s, c.gold);
  for (const p of s.players) {
    if (p.hp > 0) p.hp = Math.max(1, Math.min(p.maxHp, p.hp + (c.heal ?? 0)));
    if (c.cleanse) p.statuses = [];
    if (c.supply) p.items.push(c.supply);
  }
  if (c.gift) {
    const bearer = [...s.players]
      .filter((p) => p.hp > 0 && !p.fallen)
      .sort((a, b) => b.hp - a.hp || a.id.localeCompare(b.id))[0];
    if (bearer) {
      bearer.items.push(c.gift);
      log(s, `${bearer.name} carries the ${items.find((i) => i.id === c.gift)?.name ?? c.gift}.`);
    }
  }
  log(s, `The party chose ${c.name}.`);
  leaveEvent(s);
}

function rollFor(s: RunState, c: EventChoice, outcomes: Outcome[]) {
  const roll = d100(s);
  const o = landOn(outcomes, roll);
  s.luck = { choice: c.id, step: 1, roll, outcome: o.id, done: true };
  log(s, `${c.name}: rolled ${roll}. ${o.label}. ${o.text}`);
  if (o.fight) s.luck.fight = o.fight;
  else apply(s, o, s.players);
}

function rollEach(s: RunState, c: EventChoice, outcomes: Outcome[]) {
  const heroes: Record<string, { roll: number; outcome: string }> = {};
  for (const p of standingHeroes(s)) {
    const roll = d100(s);
    const o = landOn(outcomes, roll);
    heroes[p.id] = { roll, outcome: o.id };
    log(s, `${p.name} rolls ${roll}: ${o.label.toLowerCase()}.`);
    apply(s, o, [p]);
  }
  s.luck = { choice: c.id, step: 1, heroes, done: true };
}

function pressOn(s: RunState, event: EventDef) {
  const luck = s.luck!;
  const press = event.press!;
  const { chance, hurt } = pressOdds(event, luck.step);
  const roll = d100(s);
  luck.step++;
  luck.roll = roll;
  if (press.kind === "search") {
    // The roll is for the ambush: at or under the chance, it comes back.
    if (roll <= chance) {
      const bust = press.bust!;
      luck.outcome = bust.id;
      luck.done = true;
      if (bust.fight) luck.fight = bust.fight;
      log(s, `Searched and rolled ${roll}, under ${chance}. ${bust.text}`);
      return;
    }
    const left = press.loot!.filter((o) => !luck.found!.includes(o.id));
    const o = pick(s, left);
    luck.found = [...luck.found!, o.id];
    luck.outcome = o.id;
    apply(s, o, s.players);
    log(s, `Searched and rolled ${roll}, over ${chance}. ${o.text}`);
    if (luck.found.length === press.loot!.length) {
      luck.done = true;
      log(s, "There is nothing left on him to find.");
    }
    return;
  }
  // A dig burns first, then looks.
  for (const p of standingHeroes(s)) p.hp = Math.max(1, p.hp - hurt);
  if (roll <= chance) {
    const prize = press.prize!;
    luck.outcome = prize.id;
    luck.done = true;
    apply(s, prize, s.players);
    log(s, `Reached in (−${hurt} HP each) and rolled ${roll}. ${prize.text}`);
  } else {
    delete luck.outcome;
    log(
      s,
      `Reached in (−${hurt} HP each) and rolled ${roll}, over ${chance}. Nothing yet.`,
    );
  }
}

function leaveEvent(s: RunState) {
  delete s.luck;
  s.votes = {};
  s.phase = "MAP";
}

/** Someone has seen enough of the result. A roll that ended in a fight starts it. */
export function continueEvent(s: RunState) {
  if (!s.luck?.done) throw Error("The party has not finished deciding");
  const fight = s.luck.fight;
  if (fight) {
    delete s.luck;
    s.votes = {};
    enterCombat(s, false, fight === "elite");
    return;
  }
  leaveEvent(s);
}
