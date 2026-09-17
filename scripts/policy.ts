import type {
  Ability,
  Effect,
  Enemy,
  Player,
  Row,
  RunState,
  Unit,
} from "../src/shared/model";
import { abilities } from "../src/content/heroes";
import { upgradeOffer } from "../src/content/upgrades";
import { drillFor, mentors, pathFor } from "../src/content/evolutions";
import { items } from "../src/content/items";
import { isObject } from "../src/content/enemies";
import { events, type Outcome } from "../src/content/events";
import { eventChoices, eventDef, pressOdds, shares } from "../src/engine/luck";
import { EXPLOIT, WEAK, status } from "../src/engine/effects";
import { reviveCost, standing } from "../src/engine/combat";
import { availableNodes } from "../src/engine/map";
import { reachError } from "../src/shared/reach";
import { parseForgeKey, reforgeCost } from "../src/engine/shop";

/**
 * Simulation policies. These are evaluation instruments, not game rules: the
 * engine never imports them. A policy only reads information a player could
 * see, so unrevealed auction lots are judged from rarity, slot, tags and clue.
 */
export interface Policy {
  name: string;
  vote(s: RunState, p: Player): string;
  plan(s: RunState, p: Player): { ability: string; target: string };
  upgrade(s: RunState, p: Player): string;
  train(s: RunState, p: Player): boolean;
  /** What this hero offers a shrine, if anything. */
  shrine(s: RunState, p: Player): "blood" | "gold" | "leave";
  /**
   * The shop that replaced the auction: which item to put to the party, and
   * for whom, or null to leave. Returning a purchase the same policy would
   * then decline in `approve` would loop the runner, so both read one budget.
   */
  shop(s: RunState): { item: string; recipient: string } | null;
  interest(s: RunState, p: Player): boolean;
  bid(s: RunState, p: Player): boolean;
  approve(s: RunState, p: Player): boolean;
  reveal(s: RunState): boolean;
}

/**
 * Which starting pact the bots swear.
 *
 * Both policies used to hard-code `vitality`, so every number this harness has
 * ever printed described a run that refused the Gilded pact — and the pact
 * that was never measured was the one playtesters found worthless. The runner
 * sets this from `--pact=`, so the two can be compared against each other
 * rather than argued about.
 */
export let pactChoice: "vitality" | "wealth" = "vitality";
export const setPact = (choice: "vitality" | "wealth") => {
  pactChoice = choice;
};

/** Gold an ability bills to the shared treasury. */
const price = (a: Ability) =>
  a.effects.reduce(
    (n, e) => n + (e.kind === "gold" && e.amount < 0 ? -e.amount : 0),
    0,
  );
const usable = (s: RunState, p: Player) =>
  abilities(p.heroId, s.combatVersion, p.upgrades, p.evolution, p.items).filter(
    (a) =>
      a.cost <= p.resource &&
      !(p.cooldowns[a.id] > 0) &&
      (a.id === "revive" || price(a) <= s.gold),
  );
const living = (s: RunState) => s.enemies.filter((e) => e.hp > 0);
const shield = (u: Unit) => status(u, "barrier")?.stacks ?? 0;
const effectiveHp = (u: Unit) => u.hp + shield(u);
const isEnemy = (u: Unit): u is Enemy => "intent" in u;
const unit = (s: RunState, id: string) =>
  [...s.players, ...s.enemies].find((u) => u.id === id);

/** Mirrors the damage pipeline in effects.ts closely enough to plan a round. */
function hitAmount(source: Unit, victim: Unit, base: number, precise = false) {
  let amount =
    (base + source.power) * (status(source, "weak") ? WEAK : 1) - victim.guard;
  if (status(victim, "vulnerable")) amount *= 1.25;
  if (precise && status(victim, "marked")) amount += EXPLOIT;
  return Math.max(0, Math.round(Math.max(1, amount)));
}

function abilityDamage(p: Player, a: Ability, target: Unit) {
  let total = 0;
  for (const e of a.effects)
    if (e.kind === "damage")
      total += hitAmount(p, target, e.amount, e.precision);
  if (total > 0)
    for (const id of p.items) {
      const item = items.find((i) => i.id === id)!;
      if (item.trigger !== "afterAttack" || item.target !== "target") continue;
      for (const e of item.effects)
        if (e.kind === "damage")
          total += hitAmount(p, target, e.amount, e.precision);
    }
  return total;
}

/** Damage teammates have already committed, so heroes do not stack overkill. */
function plannedDamage(s: RunState, target: Unit) {
  let total = 0;
  for (const [id, plan] of Object.entries(s.plans)) {
    const mate = s.players.find((x) => x.id === id);
    if (!mate) continue;
    const a = abilities(
      mate.heroId,
      s.combatVersion,
      mate.upgrades,
      mate.evolution,
      mate.items,
    ).find((x) => x.id === plan.ability);
    if (!a) continue;
    const aim = unit(s, plan.target);
    if (!aim) continue;
    if (a.target === "enemyRow") {
      if (isEnemy(aim) && isEnemy(target) && aim.row === target.row)
        total += abilityDamage(mate, a, target);
    } else if (plan.target === target.id)
      total += abilityDamage(mate, a, target);
  }
  return total;
}

interface Threats {
  perHero: Map<string, number>;
  perEnemy: Map<string, number>;
  biggest: Map<string, { enemy: Enemy; amount: number }>;
}

/** Predicts this round's enemy damage from the intentions every player can see. */
function threats(s: RunState): Threats {
  const perHero = new Map<string, number>();
  const perEnemy = new Map<string, number>();
  const biggest = new Map<string, { enemy: Enemy; amount: number }>();
  for (const e of living(s)) {
    if (status(e, "interrupted") || status(e, "confused")) continue;
    const a = e.intent.ability;
    if (!a.effects.some((x) => x.kind === "damage")) continue;
    let aim = unit(s, e.intent.target);
    if (!aim || aim.hp <= 0) aim = standing(s)[0];
    if (!aim || isEnemy(aim)) continue;
    const victims =
      a.target === "enemyRow"
        ? standing(s).filter((p) => p.row === (e.intent.row ?? aim!.row))
        : [aim as Player];
    for (const v of victims) {
      let amount = 0;
      for (const x of a.effects)
        if (x.kind === "damage") amount += hitAmount(e, v, x.amount);
      perHero.set(v.id, (perHero.get(v.id) ?? 0) + amount);
      perEnemy.set(e.id, (perEnemy.get(e.id) ?? 0) + amount);
      if (a.target !== "enemyRow") {
        const prev = biggest.get(v.id);
        if (!prev || prev.amount < amount)
          biggest.set(v.id, { enemy: e, amount });
      }
    }
  }
  return { perHero, perEnemy, biggest };
}

const wounded = (s: RunState) =>
  s.players.reduce((n, p) => n + (p.maxHp - p.hp), 0) /
  Math.max(
    1,
    s.players.reduce((n, p) => n + p.maxHp, 0),
  );

/** Every effect kind the party can already produce from its own kits. */
function partyCan(s: RunState, want: (e: Effect) => boolean) {
  return s.players.some((x) =>
    abilities(x.heroId, s.combatVersion, x.upgrades, x.evolution).some((a) =>
      a.effects.some(want),
    ),
  );
}
/**
 * What one item is worth to one hero. The shop shows everything, so `revealed`
 * is only false for an old auction's veiled lot, where a bidder could still
 * read rarity, slot and tags but not the curse.
 */
function itemFit(
  s: RunState,
  p: Player,
  item: (typeof items)[number],
  revealed = true,
) {
  const tags = revealed ? item.tags : item.tags.filter((t) => t !== "Cursed");
  // A supply is stock, not a slot: holding one is no reason to decline another.
  const owns =
    item.slot !== "supply" &&
    p.items.some((id) => items.find((i) => i.id === id)!.slot === item.slot);
  let n = 1;
  // A supply is worth what the party cannot already do for itself. Judged by
  // effect rather than by class, so an upgrade branch that covers the same gap
  // counts and the roster is never consulted by name.
  if (item.slot === "supply") {
    n += 2;
    const sells = (want: (e: Effect) => boolean) =>
      item.use!.effects.some(want) && !partyCan(s, want);
    if (sells((e) => e.kind === "heal" && !e.self)) n += 3;
    if (sells((e) => e.kind === "status" && e.status === "barrier")) n += 3;
    if (sells((e) => e.kind === "removeStatus" && e.status === "barrier"))
      n += 3;
    if (sells((e) => e.kind === "interrupt")) n += 3;
    return n;
  }
  const wants = (tag: string, hero: string, bonus: number) => {
    if (tags.includes(tag) && p.heroId === hero) n += bonus;
  };
  wants("Storm", "arcanist", 3);
  wants("Fire", "arcanist", 2);
  wants("Arcane", "arcanist", 2);
  wants("Critical", "ranger", 3);
  wants("Healing", "warden", 3);
  wants("Poison", "warden", 2);
  wants("Guardian", "vanguard", 3);
  wants("Blood", "vanguard", 2);
  if (item.slot === "armor" && p.heroId === "vanguard") n += 2;
  if (item.slot === "weapon" && p.power >= 4) n += 1;
  if (item.rarity === "Legendary") n += 2;
  if (item.rarity === "Epic") n += 1;
  if (owns) n -= 2;
  return n;
}
/** The auction's view of the lot on the block. */
function lotFit(s: RunState, p: Player) {
  const a = s.auction!;
  return itemFit(
    s,
    p,
    items.find((i) => i.id === a.itemId)!,
    a.revealed,
  );
}

/**
 * Gold the party keeps back for recovery. It shrinks as the run progresses:
 * treasury left over at the results screen bought nothing.
 */
const reserve = (s: RunState) => {
  const depth = s.map.find((n) => n.id === s.currentNode)?.depth ?? 0;
  return Math.max(0, 240 - depth * 45);
};
/**
 * How a sensible table reads a chance event: every outcome priced in gold and
 * weighted by the odds printed on the choice. Health is worth more the more
 * hurt the party is, and a fight is priced as the health it would cost.
 */
const hpGold = (s: RunState) => 1 + 3 * wounded(s);
function outcomeValue(s: RunState, o: Outcome, heroes: Player[]) {
  const rate = hpGold(s);
  let v = o.relic ? 160 : (o.gold ?? 0);
  for (const p of heroes) {
    const missing = p.maxHp - p.hp;
    const change = (o.heal ?? 0) + (o.healShare ?? 0) * p.maxHp;
    v += Math.min(change, missing) * rate;
    v += (o.maxHp ?? 0) * 3;
    if (o.supply) v += 30;
  }
  v += (o.power ?? 0) * 35;
  if (o.cleanse) v += 10;
  if (o.fight) v -= (o.fight === "elite" ? 140 : 60) * (0.5 + 2 * wounded(s));
  return v;
}
const expected = (s: RunState, outcomes: Outcome[], heroes: Player[]) =>
  shares(outcomes).reduce(
    (n, { outcome, percent }) =>
      n + (percent / 100) * outcomeValue(s, outcome, heroes),
    0,
  );
/** The worth of the next try of a press-your-luck event, against stopping. */
function pressValue(s: RunState) {
  const event = eventDef(s);
  const press = event.press!;
  const { chance, hurt } = pressOdds(event, s.luck?.step ?? 0);
  const c = chance / 100;
  const standingNow = s.players.filter((p) => p.hp > 0);
  if (press.kind === "search") {
    const found = s.luck?.found ?? [];
    const left = press.loot!.filter((o) => !found.includes(o.id));
    const loot = left.length ? expected(s, left, s.players) : 0;
    return (1 - c) * loot + c * outcomeValue(s, press.bust!, s.players);
  }
  return (
    c * outcomeValue(s, press.prize!, s.players) -
    hurt * standingNow.length * hpGold(s) * 1.5
  );
}
/** A chance event's vote, or undefined for an event the dice have no part in. */
function luckVote(s: RunState, spendable: (cost: number) => boolean) {
  const event = eventDef(s);
  if (!event.luck) return undefined;
  if (s.luck && event.press) return pressValue(s) > 0 ? "press" : "leave";
  const standingNow = s.players.filter((p) => p.hp > 0);
  const worth = (c: (typeof event.choices)[number]) =>
    !spendable(c.cost)
      ? -Infinity
      : -c.cost +
        (c.roll
          ? expected(s, c.roll, s.players)
          : c.each
            ? standingNow.reduce((n, p) => n + expected(s, c.each!, [p]), 0)
            : c.press
              ? pressValue(s)
              : 0);
  return [...event.choices].sort((a, b) => worth(b) - worth(a))[0].id;
}
/** What a hero will pay for a lot before letting a rival have it. */
const valuation = (fit: number) => fit * 70;

/** The original attack-focused bot, preserved so old baselines stay comparable. */
export const attackPolicy: Policy = {
  name: "attack",
  vote(s, _p) {
    if (s.phase === "PACT") return pactChoice;
    if (s.phase === "MAP")
      return (
        availableNodes(s).find(
          (n) => n.type === "auction" || n.type === "combat",
        ) ?? availableNodes(s)[0]
      ).id;
    if (s.phase === "CAMP") return s.gold >= 120 ? "restore" : "rest";
    if (s.phase === "TOLL") return "fight";
    return eventChoices(s).at(-1)!.id;
  },
  plan(s, p) {
    const target = living(s)[0];
    const ally = [...s.players]
      .filter((x) => !x.fallen)
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    const options = usable(s, p);
    const a =
      options.find((a) => a.id === "mend" && ally.hp < ally.maxHp * 0.6) ??
      options.find(
        (a) =>
          a.id === "storm" && target.statuses.some((st) => st.id === "wet"),
      ) ??
      options.find(
        (a) => a.id === "dew" && s.players.some((x) => x.heroId === "arcanist"),
      ) ??
      options.find((a) => a.effects.some((e) => e.kind === "damage"))!;
    return {
      ability: a.id,
      target:
        a.target === "ally" ? ally.id : a.target === "self" ? p.id : target.id,
    };
  },
  upgrade(_s, p) {
    return upgradeOffer(p)[0]?.id ?? "none";
  },
  train: () => false,
  shrine: () => "leave",
  shop(s) {
    if (s.shop!.kind === "forge") return null;
    // As blunt as its bidding was: the first thing it can comfortably afford.
    const item = s
      .shop!.stock.filter((id) => !s.shop!.sold.includes(id))
      .map((id) => items.find((i) => i.id === id)!)
      .find((i) => i.price < s.gold * 0.5);
    // A fallen hero cannot receive gear until a camp raises them.
    const recipient = s.players.find((p) => !p.fallen);
    return item && recipient
      ? { item: item.id, recipient: recipient.id }
      : null;
  },
  interest(s, p) {
    return p.id === s.players[0].id && s.auction!.price < s.gold * 0.5;
  },
  bid: () => false,
  approve: () => true,
  reveal: () => false,
};

/**
 * Control-aware policy: reads enemy intentions, protects and interrupts, buys
 * for the hero who benefits and keeps a recovery reserve.
 */
export const tacticalPolicy: Policy = {
  name: "tactical",
  vote(s, _p) {
    if (s.phase === "PACT") return pactChoice;
    if (s.phase === "MAP") {
      const open = availableNodes(s);
      const hurt = wounded(s) > 0.35;
      // Routes now close options off, so a mentor several chambers away has to
      // be steered toward. Without this lookahead the bot takes the nearest
      // good node and never trains, which hides evolutions from the matrix.
      const mentorsAhead = (id: string) => {
        const seen = new Set([id]);
        const queue = [id];
        let found = 0;
        while (queue.length) {
          // Shift once: calling it inside a find predicate drains the queue.
          const id = queue.shift()!;
          const node = s.map.find((x) => x.id === id);
          if (!node) continue;
          if (node.type === "mentor" && !node.visited) found++;
          for (const next of node.next)
            if (!seen.has(next)) {
              seen.add(next);
              queue.push(next);
            }
        }
        return found;
      };
      const wantsTraining =
        s.players.some((x) => !x.evolution) && s.gold >= 300;
      const rank = (t: string) => {
        // Training is a permanent kit change, so it outranks a single fight
        // whenever the purse can pay for it and still cover recovery.
        if (t === "mentor")
          return s.players.some((x) => !x.evolution) && s.gold >= 300 ? 6 : 1;
        if (t === "camp") return 5;
        if (t === "event") return hurt ? 4 : 1;
        if (t === "elite") return hurt ? 0 : 4;
        if (t === "auction") return 3;
        if (t === "mystery") return s.gold > 420 ? 3 : 2;
        // The newer chambers, weighted so the bot actually walks into each.
        // An instrument that never enters a room reports that it does nothing.
        if (t === "forge") return s.gold > 300 ? 3 : 1;
        if (t === "shrine") return hurt ? 1 : 3;
        if (t === "toll") return hurt && s.gold > 260 ? 3 : 2;
        if (t === "hazard") return hurt ? 0 : 3;
        return hurt ? 1 : 3;
      };
      const score = (n: (typeof open)[number]) =>
        rank(n.type) + (wantsTraining ? mentorsAhead(n.id) * 2 : 0);
      return [...open].sort(
        (a, b) => score(b) - score(a) || a.id.localeCompare(b.id),
      )[0].id;
    }
    if (s.phase === "TOLL") {
      // Pay when the party is hurt and the purse can bear it; otherwise the
      // fight is worth its reward and its upgrade.
      const price = s.toll ?? 0;
      return wounded(s) > 0.3 && s.gold - price >= reserve(s) ? "pay" : "fight";
    }
    if (s.phase === "CAMP") {
      const broken = s.players.some((p) => p.fallen || p.hp <= 0);
      if ((broken || wounded(s) > 0.4) && s.gold >= 220) return "restore";
      if (wounded(s) > 0.25 || broken) return "rest";
      return s.gold >= 100 + reserve(s) ? "train" : "rest";
    }
    const gamble = luckVote(s, (cost) => s.gold - cost >= reserve(s));
    if (gamble) return gamble;
    const choices = events.find((e) => e.id === s.eventId)!.choices;
    const heal = choices.find((c) => (c.heal ?? 0) > 0);
    const purse = choices.find((c) => (c.gold ?? 0) > 0);
    if (heal && s.gold - heal.cost >= reserve(s) && wounded(s) > 0.3)
      return heal.id;
    if (
      purse &&
      s.players.every((p) => p.hp + (purse.heal ?? 0) > p.maxHp * 0.25)
    )
      return purse.id;
    return choices.at(-1)!.id;
  },
  plan(s, p) {
    const opts = usable(s, p);
    const foes = living(s);
    const t = threats(s);
    const has = (id: string) => opts.find((a) => a.id === id);
    const claimed = (ability: string, target: string) =>
      Object.values(s.plans).some(
        (pl) => pl.ability === ability && pl.target === target,
      );
    const remaining = (e: Enemy) => effectiveHp(e) - plannedDamage(s, e);
    // A container is worth opening only for what is inside it. Each seized
    // piece of equipment is an item the party fights the rest of the boss
    // without, so it is priced against the damage the detour costs.
    const held = (e: Enemy) => e.holding?.length ?? 0;
    const priority = (e: Enemy) =>
      (t.perEnemy.get(e.id) ?? 0) +
      (e.definition === "mender" ? 26 : 0) +
      (e.row === "back" ? 6 : 0) +
      held(e) * 22 -
      (isObject(e.definition) && !held(e) ? 999 : 0) -
      remaining(e) * 0.15;
    const ordered = [...foes].sort(
      (a, b) => priority(b) - priority(a) || a.id.localeCompare(b.id),
    );
    const focus = ordered[0];

    // 1. A downed ally is worth 90 gold while the treasury can still spare it.
    const down = s.players.find((x) => x.hp <= 0 && !x.fallen);
    if (
      down &&
      has("revive") &&
      s.gold >= reviveCost(s) + reserve(s) &&
      !claimed("revive", down.id)
    )
      return { ability: "revive", target: down.id };

    // 2. Recovery before it is wasted on a corpse.
    // Only abilities that can be aimed at a wounded ally count as recovery: a
    // self-siphoning attack carries a heal effect but still targets an enemy.
    // Only abilities aimed at a wounded ally count as recovery here. Bracing
    // heals its own user and is handled by the self-preservation rule below.
    const heals = opts.filter(
      (a) =>
        a.id !== "revive" &&
        a.target === "ally" &&
        a.effects.some((e) => e.kind === "heal" && !e.self),
    );
    if (heals.length) {
      const patient = [...s.players]
        .filter((x) => !x.fallen && x.hp > 0)
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      const doomed =
        patient &&
        (patient.hp / patient.maxHp < 0.45 ||
          (t.perHero.get(patient.id) ?? 0) >= effectiveHp(patient));
      if (patient && doomed && !claimed(heals[0].id, patient.id))
        return { ability: heals[0].id, target: patient.id };
    }

    // 3. Break a telegraphed windup that is about to hurt. Chosen by effect,
    // not by name, so a bought Flashpowder counts as an answer as much as the
    // Arcanist's Counterspell does.
    const counter = opts.find((a) =>
      a.effects.some((e) => e.kind === "interrupt"),
    );
    if (counter) {
      const windup = ordered.find(
        (e) =>
          e.intent.ability.interruptible &&
          !status(e, "interrupted") &&
          ((t.perEnemy.get(e.id) ?? 0) >= 16 ||
            e.intent.ability.effects.some((x) => x.kind === "heal")) &&
          !claimed(counter.id, e.id),
      );
      if (windup) return { ability: counter.id, target: windup.id };
    }

    // 4. Step in front of a hit that would drop an ally.
    const protect = opts.find((a) =>
      a.effects.some((e) => e.kind === "protect"),
    );
    if (protect) {
      const ward = s.players
        .filter(
          (x) =>
            x.id !== p.id && x.hp > 0 && !x.fallen && !status(x, "guarded"),
        )
        .map((x) => ({ x, hit: t.biggest.get(x.id)?.amount ?? 0 }))
        .filter(({ x, hit }) => hit >= effectiveHp(x) || hit >= x.maxHp * 0.45)
        .sort((a, b) => b.hit - a.hit || a.x.id.localeCompare(b.x.id))[0];
      if (
        ward &&
        effectiveHp(p) + 12 > ward.hit &&
        !claimed(protect.id, ward.x.id)
      )
        return { ability: protect.id, target: ward.x.id };
    }

    const attacks = opts.filter(
      (a) =>
        (a.target === "enemy" || a.target === "enemyRow") &&
        a.effects.some((e) => e.kind === "damage"),
    );

    // 5. Secure a kill; removing an actor removes its whole intention.
    const finisher = ordered
      .map((e) => ({
        e,
        a: attacks
          .filter((a) => abilityDamage(p, a, e) >= remaining(e))
          .sort((x, y) => x.cost - y.cost || x.id.localeCompare(y.id))[0],
      }))
      .filter((x) => x.a && remaining(x.e) > 0)[0];
    if (finisher) return { ability: finisher.a.id, target: finisher.e.id };

    // 6. Survive a lethal round when nothing else answers it.
    if (
      has("brace") &&
      (t.perHero.get(p.id) ?? 0) >= effectiveHp(p) &&
      !status(p, "guarded")
    )
      return { ability: "brace", target: p.id };

    // 6b. Turn the biggest attacker on its own side.
    const beguile = has("beguile");
    if (beguile) {
      const mark = ordered.find(
        (e) =>
          !status(e, "confused") &&
          (t.perEnemy.get(e.id) ?? 0) >= 18 &&
          s.enemies.filter((x) => x.id !== e.id && x.hp > 0).length > 0 &&
          !claimed("beguile", e.id),
      );
      if (mark) return { ability: "beguile", target: mark.id };
    }

    // 6c. Clear what the dungeon has stuck to the party.
    const cleanse = has("counterpoint");
    if (cleanse) {
      const afflictions = ["burn", "poison", "vulnerable", "weak"] as const;
      const row = (["front", "back"] as Row[])
        .map((r) => ({
          r,
          crew: standing(s).filter((x) => x.row === r),
        }))
        .map(({ r, crew }) => ({
          r,
          crew,
          n: crew.reduce(
            (n, x) => n + afflictions.filter((f) => status(x, f)).length,
            0,
          ),
        }))
        .sort((a, b) => b.n - a.n || a.r.localeCompare(b.r))[0];
      if (row && row.n >= 2 && !claimed("counterpoint", row.crew[0].id))
        return { ability: "counterpoint", target: row.crew[0].id };
    }

    // 6d. Buy an ally an emergency shield with team gold.
    const insure = has("insure");
    if (insure) {
      const exposed = s.players
        .filter((x) => x.hp > 0 && !x.fallen && !status(x, "barrier"))
        .map((x) => ({ x, hit: t.perHero.get(x.id) ?? 0 }))
        .filter(({ x, hit }) => hit >= x.hp * 0.6)
        .sort((a, b) => b.hit - a.hit || a.x.id.localeCompare(b.x.id))[0];
      if (
        exposed &&
        price(insure) <= s.gold - reserve(s) &&
        !claimed("insure", exposed.x.id)
      )
        return { ability: "insure", target: exposed.x.id };
    }

    // 6e. A shield the party bought rather than rostered. Priced at zero gold,
    // so the Broker's treasury-funded Insure keeps its own rule above.
    const ward = opts.find(
      (a) =>
        a.target === "ally" &&
        price(a) === 0 &&
        // An upgraded Intercept also grants Barrier, but it is a protect and
        // may never be aimed at its own caster. Rule 4 owns those.
        !a.effects.some((e) => e.kind === "protect") &&
        a.effects.some((e) => e.kind === "status" && e.status === "barrier"),
    );
    if (ward) {
      const exposed = s.players
        .filter((x) => x.hp > 0 && !x.fallen && !status(x, "barrier"))
        .map((x) => ({ x, hit: t.perHero.get(x.id) ?? 0 }))
        .filter(({ x, hit }) => hit >= x.hp * 0.5)
        .sort((a, b) => b.hit - a.hit || a.x.id.localeCompare(b.x.id))[0];
      if (exposed && !claimed(ward.id, exposed.x.id))
        return { ability: ward.id, target: exposed.x.id };
    }

    // 7. Fortified enemies waste the party's damage until they are opened.
    // Selected by effect, not by name: the Warden, the Broker and two upgraded
    // branches all strip Barrier, and a policy that only knows one of them
    // reports that the others' counterplay does not exist.
    const strip = opts.find(
      (a) =>
        (a.target === "enemy" || a.target === "enemyRow") &&
        a.effects.some(
          (e) => e.kind === "removeStatus" && e.status === "barrier",
        ),
    );
    if (strip) {
      const walled = ordered.find(
        (e) => shield(e) >= 8 && !claimed(strip.id, e.id),
      );
      if (walled) return { ability: strip.id, target: walled.id };
    }

    // 8. Blunt the biggest direct attacker instead of trading damage.
    const suppress = has("suppress");
    if (suppress) {
      const bully = [...foes]
        .filter((e) => !status(e, "weak") && !claimed("suppress", e.id))
        .map((e) => ({ e, n: t.perEnemy.get(e.id) ?? 0 }))
        .sort((a, b) => b.n - a.n || a.e.id.localeCompare(b.e.id))[0];
      if (bully && bully.n >= 18)
        return { ability: "suppress", target: bully.e.id };
    }

    // 9. Set up and cash in the authored reactions.
    const storm = has("storm");
    if (storm && status(focus, "wet"))
      return { ability: "storm", target: focus.id };
    const primer = has("rain") ?? has("dew");
    if (
      primer &&
      !status(focus, "wet") &&
      !claimed(primer.id, focus.id) &&
      s.players.some(
        (x) =>
          x.hp > 0 &&
          abilities(
            x.heroId,
            s.combatVersion,
            x.upgrades,
            x.evolution,
            x.items,
          ).some((a) => a.id === "storm"),
      ) &&
      p.resource >= primer.cost + 3
    )
      return { ability: primer.id, target: focus.id };
    const mark = has("mark");
    if (
      mark &&
      !status(focus, "marked") &&
      !claimed("mark", focus.id) &&
      remaining(focus) > 24
    )
      return { ability: "mark", target: focus.id };

    // 9b. Lift the hardest hitter before swinging yourself.
    const anthem = has("anthem");
    if (anthem) {
      const star = s.players
        .filter((x) => x.hp > 0 && !x.fallen && !status(x, "empowered"))
        .sort((a, b) => b.power - a.power || a.id.localeCompare(b.id))[0];
      if (star && !claimed("anthem", star.id))
        return { ability: "anthem", target: star.id };
    }
    const cadence = has("cadence");
    if (cadence) {
      const crowded = (["front", "back"] as Row[])
        .map((r) => standing(s).filter((x) => x.row === r))
        .filter((crew) => crew.length >= 2)
        .sort(
          (a, b) =>
            b.reduce((n, x) => n + (t.perHero.get(x.id) ?? 0), 0) -
            a.reduce((n, x) => n + (t.perHero.get(x.id) ?? 0), 0),
        )[0];
      if (
        crowded &&
        crowded.reduce((n, x) => n + (t.perHero.get(x.id) ?? 0), 0) >= 24 &&
        !claimed("cadence", crowded[0].id)
      )
        return { ability: "cadence", target: crowded[0].id };
    }

    // 10. Otherwise spend the action where it removes the most enemy health.
    const scored = attacks
      .map((a) => {
        if (a.target === "enemyRow") {
          const best = (["front", "back"] as Row[])
            .map((row) => {
              const group = foes.filter((e) => e.row === row);
              return {
                row,
                group,
                value: group.reduce(
                  (n, e) => n + Math.min(abilityDamage(p, a, e), remaining(e)),
                  0,
                ),
              };
            })
            .filter((x) => x.group.length)
            .sort((x, y) => y.value - x.value || x.row.localeCompare(y.row))[0];
          return best
            ? {
                a,
                target: best.group[0].id,
                value: best.value - a.cost * 3 - price(a) / 12,
              }
            : null;
        }
        return {
          a,
          target: focus.id,
          value:
            Math.min(abilityDamage(p, a, focus), remaining(focus)) -
            a.cost * 3 -
            price(a) / 12,
        };
      })
      .filter((x): x is { a: Ability; target: string; value: number } => !!x)
      .sort((x, y) => y.value - x.value || x.a.id.localeCompare(y.a.id))[0];
    if (scored) return { ability: scored.a.id, target: scored.target };
    return { ability: "brace", target: p.id };
  },
  upgrade(s, p) {
    const offer = upgradeOffer(p);
    if (!offer.length) return "none";
    const roster = s.players.map((x) => x.heroId);
    // Line 0 is self-sustain, line 1 is mitigation, line 2 is raw output. Buy
    // the defence the party cannot already field; take force otherwise.
    const want =
      offer[0].line === 0 && !roster.includes("warden")
        ? "guard"
        : offer[0].line === 1 && !roster.includes("vanguard")
          ? "guard"
          : "force";
    return (offer.find((u) => u.kind === want) ?? offer[0]).id;
  },
  train(s, p) {
    const teacher = mentors.find((m) => m.id === s.mentorId);
    if (!teacher) return false;
    // A ground teaches one class; everyone else is offered the drill. The bot
    // has to be able to take either, or whichever it cannot reach measures as
    // doing nothing — the oldest trap in this project.
    const mine = s.mentorClass === undefined || s.mentorClass === p.heroId;
    const path =
      mine && !p.evolution ? pathFor(teacher.id, p.heroId) : undefined;
    const fee = path ? teacher.tuition : drillFor(teacher.tier).fee;
    // Training competes with equipment and recovery for one purse, so only
    // commit while the treasury still covers the reserve afterwards.
    return s.gold - fee >= reserve(s);
  },
  shrine(s, p) {
    // The sturdiest standing hero bleeds for the power; nobody frail does, and
    // nobody pays gold the reserve needs.
    if (s.shrine?.taken || p.fallen) return "leave";
    const sturdiest = [...s.players]
      .filter((x) => !x.fallen)
      .sort((a, b) => b.maxHp - a.maxHp)[0];
    if (sturdiest?.id === p.id && p.maxHp >= 60) return "blood";
    return "leave";
  },
  shop(s) {
    const shop = s.shop!;
    const budget = s.gold - reserve(s);
    if (shop.kind === "forge") {
      // Reforge whatever the best-suited hero carries, if the purse allows.
      let pick: { item: string; recipient: string; fit: number } | null = null;
      for (const key of shop.stock) {
        if (shop.sold.includes(key)) continue;
        const { owner, item: id } = parseForgeKey(key);
        const item = items.find((i) => i.id === id)!;
        if (reforgeCost(item) > budget) continue;
        const hero = s.players.find((x) => x.id === owner && !x.fallen);
        if (!hero) continue;
        const fit = itemFit(s, hero, item);
        if (fit >= 3 && (!pick || fit > pick.fit))
          pick = { item: key, recipient: owner, fit };
      }
      return pick && { item: pick.item, recipient: pick.recipient };
    }
    let best: { item: string; recipient: string; fit: number } | null = null;
    for (const id of shop.stock) {
      if (shop.sold.includes(id)) continue;
      const item = items.find((i) => i.id === id)!;
      if (item.price > budget) continue;
      for (const p of s.players.filter((x) => !x.fallen)) {
        const fit = itemFit(s, p, item);
        // The same bar the paddle used, so shop and auction runs compare.
        if (fit < 3 || item.price > valuation(fit)) continue;
        if (!best || fit > best.fit) best = { item: id, recipient: p.id, fit };
      }
    }
    return best && { item: best.item, recipient: best.recipient };
  },
  interest(s, p) {
    const a = s.auction!;
    if (a.price > s.gold - reserve(s)) return false;
    // Every hero the lot suits raises a paddle, so contested lots really bid up.
    return lotFit(s, p) >= 3 && a.price <= valuation(lotFit(s, p));
  },
  bid(s, p) {
    const a = s.auction!;
    const next = a.price + 30;
    return next <= s.gold - reserve(s) && next <= valuation(lotFit(s, p));
  },
  approve(s, _p) {
    const price = s.shop?.proposal?.price ?? s.auction!.price;
    return price <= s.gold - reserve(s);
  },
  reveal(s) {
    const a = s.auction!;
    return (
      !a.revealed && a.stage === "interest" && s.gold - 35 > reserve(s) + 200
    );
  },
};

/**
 * The tactical bot with its purse shut: it never raises a paddle. It exists to
 * reach a system the tactical policy cannot. That bot spends down to a working
 * balance by the last chamber, so a boss that shields itself with the treasury
 * would report as doing nothing at all — the same trap that once made
 * evolutions look inert. Comparing this policy across two builds isolates what
 * the shield costs a party that arrives rich, with equipment held constant.
 */
export const hoardPolicy: Policy = {
  ...tacticalPolicy,
  name: "hoard",
  shop: () => null,
  shrine: () => "leave",
  approve: (s, p) => !s.shop && tacticalPolicy.approve(s, p),
  interest: () => false,
  bid: () => false,
  reveal: () => false,
  train: () => false,
  vote(s, p) {
    // Everything that costs gold is declined; a battlefield revival is not,
    // because spending at the boss is the pressure valve being measured.
    if (s.phase === "CAMP") return "rest";
    if (s.phase === "TOLL") return "fight";
    if (s.phase === "EVENT") {
      const gamble = luckVote(s, (cost) => cost === 0);
      if (gamble) return gamble;
      const choices = events.find((e) => e.id === s.eventId)!.choices;
      return (
        choices.find((c) => c.cost === 0 && (c.gold ?? 0) > 0) ??
        choices.find((c) => c.cost === 0) ??
        choices.at(-1)!
      ).id;
    }
    return tacticalPolicy.vote(s, p);
  },
};

export const policies: Record<string, Policy> = {
  attack: attackPolicy,
  tactical: tacticalPolicy,
  hoard: hoardPolicy,
};
// Keep evaluation agents subject to exactly the targeting rules shown in UI.
for (const policy of Object.values(policies)) {
  const plan = policy.plan;
  policy.plan = (s, p) => {
    const proposed = plan(s, p);
    const a = usable(s, p).find((a) => a.id === proposed.ability);
    const target = s.enemies.find((e) => e.id === proposed.target);
    if (!a || !target || !reachError(s, p, a, target)) return proposed;
    const reachable = living(s).find((e) => !reachError(s, p, a, e));
    return reachable
      ? { ability: a.id, target: reachable.id }
      : { ability: "brace", target: p.id };
  };
}
