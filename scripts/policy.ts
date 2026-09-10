import type {
  Ability,
  Enemy,
  Player,
  Row,
  RunState,
  Unit,
} from "../src/shared/model";
import { abilities } from "../src/content/heroes";
import { upgradeOffer } from "../src/content/upgrades";
import { mentors, pathFor } from "../src/content/evolutions";
import { items } from "../src/content/items";
import { events } from "../src/content/events";
import { EXPLOIT, WEAK, status } from "../src/engine/effects";
import { reviveCost, standing } from "../src/engine/combat";
import { availableNodes } from "../src/engine/map";

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
  interest(s: RunState, p: Player): boolean;
  bid(s: RunState, p: Player): boolean;
  approve(s: RunState, p: Player): boolean;
  reveal(s: RunState): boolean;
}

/** Gold an ability bills to the shared treasury. */
const price = (a: Ability) =>
  a.effects.reduce(
    (n, e) => n + (e.kind === "gold" && e.amount < 0 ? -e.amount : 0),
    0,
  );
const usable = (s: RunState, p: Player) =>
  abilities(p.heroId, s.combatVersion, p.upgrades, p.evolution).filter(
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
        ? standing(s).filter((p) => p.row === aim!.row)
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

/** What a hero could see of an unrevealed lot: rarity, slot, tags, clue. */
function lotFit(s: RunState, p: Player) {
  const a = s.auction!;
  const item = items.find((i) => i.id === a.itemId)!;
  const tags = a.revealed ? item.tags : item.tags.filter((t) => t !== "Cursed");
  const owns = p.items.some(
    (id) => items.find((i) => i.id === id)!.slot === item.slot,
  );
  let n = 1;
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

/**
 * Gold the party keeps back for recovery. It shrinks as the run progresses:
 * treasury left over at the results screen bought nothing.
 */
const reserve = (s: RunState) => {
  const depth = s.map.find((n) => n.id === s.currentNode)?.depth ?? 0;
  return Math.max(0, 240 - depth * 45);
};
/** What a hero will pay for a lot before letting a rival have it. */
const valuation = (fit: number) => fit * 70;

/** The original attack-focused bot, preserved so old baselines stay comparable. */
export const attackPolicy: Policy = {
  name: "attack",
  vote(s, _p) {
    if (s.phase === "PACT") return "vitality";
    if (s.phase === "MAP")
      return (
        availableNodes(s).find(
          (n) => n.type === "auction" || n.type === "combat",
        ) ?? availableNodes(s)[0]
      ).id;
    if (s.phase === "CAMP") return s.gold >= 120 ? "restore" : "rest";
    return events.find((e) => e.id === s.eventId)!.choices.at(-1)!.id;
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
    if (s.phase === "PACT") return "vitality";
    if (s.phase === "MAP") {
      const open = availableNodes(s);
      const hurt = wounded(s) > 0.35;
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
        return hurt ? 1 : 3;
      };
      return [...open].sort(
        (a, b) => rank(b.type) - rank(a.type) || a.id.localeCompare(b.id),
      )[0].id;
    }
    if (s.phase === "CAMP") {
      const broken = s.players.some((p) => p.fallen || p.hp <= 0);
      if ((broken || wounded(s) > 0.4) && s.gold >= 220) return "restore";
      if (wounded(s) > 0.25 || broken) return "rest";
      return s.gold >= 100 + reserve(s) ? "train" : "rest";
    }
    const choices = events.find((e) => e.id === s.eventId)!.choices;
    const heal = choices.find((c) => c.heal > 0);
    const purse = choices.find((c) => c.gold > 0);
    if (heal && s.gold - heal.cost >= reserve(s) && wounded(s) > 0.3)
      return heal.id;
    if (purse && s.players.every((p) => p.hp + purse.heal > p.maxHp * 0.25))
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
    const priority = (e: Enemy) =>
      (t.perEnemy.get(e.id) ?? 0) +
      (e.definition === "mender" ? 26 : 0) +
      (e.row === "back" ? 6 : 0) -
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
    const heals = opts.filter(
      (a) =>
        a.id !== "revive" &&
        (a.target === "ally" || a.target === "self") &&
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

    // 3. Break a telegraphed windup that is about to hurt.
    const counter = has("counterspell");
    if (counter) {
      const windup = ordered.find(
        (e) =>
          e.intent.ability.interruptible &&
          !status(e, "interrupted") &&
          ((t.perEnemy.get(e.id) ?? 0) >= 16 ||
            e.intent.ability.effects.some((x) => x.kind === "heal")) &&
          !claimed("counterspell", e.id),
      );
      if (windup) return { ability: "counterspell", target: windup.id };
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

    // 7. Fortified enemies waste the party's damage until they are opened.
    const unravel = has("unravel");
    if (unravel) {
      const walled = ordered.find(
        (e) => shield(e) >= 8 && !claimed("unravel", e.id),
      );
      if (walled) return { ability: "unravel", target: walled.id };
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
          abilities(x.heroId, s.combatVersion, x.upgrades, x.evolution).some(
            (a) => a.id === "storm",
          ),
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
    if (p.evolution) return false;
    const teacher = mentors.find((m) => m.id === s.mentorId);
    if (!teacher || !pathFor(teacher.id, p.heroId)) return false;
    // Training competes with equipment and recovery for one purse, so only
    // commit while the treasury still covers the reserve afterwards.
    return s.gold - teacher.tuition >= reserve(s);
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
    return s.auction!.price <= s.gold - reserve(s);
  },
  reveal(s) {
    const a = s.auction!;
    return (
      !a.revealed && a.stage === "interest" && s.gold - 35 > reserve(s) + 200
    );
  },
};

export const policies: Record<string, Policy> = {
  attack: attackPolicy,
  tactical: tacticalPolicy,
};
