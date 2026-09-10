import { chooseEncounter } from "../content/encounters";
import type { RunState, Player, Enemy, Ability, Unit } from "../shared/model";
import { enemies as definitions, enemyAbilities } from "../content/enemies";
import { abilities, hero } from "../content/heroes";
import { upgradeOffer } from "../content/upgrades";
import { pick } from "./rng";
import {
  effects,
  trigger,
  tickStatuses,
  log,
  isPlayer,
  gain,
  status,
} from "./effects";
export function standing(s: RunState) {
  return s.players.filter((p) => p.hp > 0 && !p.fallen);
}
/** Rounds an encounter tolerates before it starts escalating. */
export const PATIENCE = 6;
/**
 * Long fights escalate so no encounter can deadlock. A sustain party facing a
 * fortifying enemy could otherwise trade heals and shields forever, winning and
 * losing nothing. Legacy saves keep their unbounded rules.
 */
export function pressure(s: RunState) {
  return s.combatVersion === 2 ? Math.max(0, s.round - PATIENCE) * 3 : 0;
}
export const REVIVAL = 90;
/**
 * Recovery has to compete with buying power. Each battlefield revival this run
 * costs more than the last, so a party that leans on gold to undo its mistakes
 * cannot also outfit itself. Legacy saves keep the flat price.
 */
export function reviveCost(s: RunState) {
  return s.combatVersion === 2 ? REVIVAL + 60 * (s.revivals ?? 0) : REVIVAL;
}
export function prepareIntents(s: RunState) {
  const impatience = pressure(s);
  for (const e of s.enemies.filter((e) => e.hp > 0)) {
    const def = definitions.find((d) => d.id === e.definition)!;
    const phase = def.boss && e.hp < e.maxHp / 2 ? 2 : 1;
    if (phase !== e.phase) {
      e.phase = phase;
      log(s, `${e.name} enters phase II — attacks intensify.`);
    }
    const rotation = enemyAbilities(def, s.combatVersion);
    const ability = structuredClone(rotation[(s.round - 1) % rotation.length]);
    if (e.phase === 2)
      for (const effect of ability.effects)
        if (effect.kind === "damage") effect.amount += 7;
    if (impatience)
      for (const effect of ability.effects)
        if (effect.kind === "damage") effect.amount += impatience;
    // Hoarding is meant to be dangerous, not merely wasteful.
    if (e.definition === "miser")
      for (const effect of ability.effects)
        if (effect.kind === "damage")
          effect.amount += Math.floor(
            s.gold / (s.combatVersion === 2 ? 70 : 100),
          );
    let targets: Unit[] = standing(s);
    if (ability.target === "self") targets = [e];
    else if (ability.target === "ally")
      targets = s.enemies
        .filter((x) => x.hp > 0)
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    else if (e.definition === "collector")
      targets = [...targets].sort(
        (a, b) => (isPlayer(b) ? b.spent : 0) - (isPlayer(a) ? a.spent : 0),
      );
    else {
      const row = e.definition === "sniper" ? "back" : "front";
      const preferred = targets.filter((p) => p.row === row);
      if (preferred.length) targets = preferred;
    }
    const target =
      ability.target === "self" ||
      ability.target === "ally" ||
      e.definition === "collector"
        ? targets[0]
        : pick(s, targets);
    e.intent = { ability, target: target?.id ?? "" };
  }
}
export function enterCombat(s: RunState, boss = false, elite = false) {
  s.phase = "COMBAT";
  s.round = 1;
  s.plans = {};
  s.enemies = [];
  const count = boss ? 1 : Math.min(4, s.players.length);
  const pool = definitions.filter((d) => !!d.boss === boss);
  const encounter =
    !boss && s.encounterVersion === 2 ? chooseEncounter(s) : undefined;
  const formation = encounter?.formations[s.players.length as 2 | 3 | 4];
  if (encounter) log(s, `${encounter.name} bars the way.`);
  for (let i = 0; i < count; i++) {
    const d = formation
      ? definitions.find((d) => d.id === formation[i])!
      : pick(s, pool);
    // Larger parties cover more roles per round, so their encounters weigh more
    // per hero. Duos face slightly lighter bosses in exchange for having no
    // spare actions at all.
    const scale = boss
      ? 0.45 + s.players.length * 0.4
      : 0.75 + s.players.length * 0.14;
    const hp = Math.round(d.hp * scale * (elite ? 1.3 : 1));
    const e: Enemy = {
      id: `enemy-${i}`,
      definition: d.id,
      name: d.name,
      hp,
      maxHp: hp,
      power: d.power,
      guard: d.guard,
      speed: d.speed,
      row: d.row,
      statuses: [],
      intent: { ability: d.abilities[0], target: "" },
      phase: 1,
      ...(elite ? { elite: pick(s, ["greedy", "vampiric"] as const) } : {}),
    };
    s.enemies.push(e);
  }
  // Boss support scales with the party's spare actions: a repairer at three
  // heroes, and a shield wall at four, so a bigger party must split its damage
  // instead of simply burning the boss down before it acts.
  if (boss) {
    const support = ["mender", "bulwark"].slice(0, s.players.length - 2);
    support.forEach((id, i) => {
      const d = definitions.find((d) => d.id === id)!;
      s.enemies.push({
        ...d,
        id: `enemy-add-${i}`,
        definition: d.id,
        maxHp: d.hp,
        statuses: [],
        intent: { ability: d.abilities[0], target: "" },
        phase: 1,
      });
    });
  }
  for (const p of s.players) {
    p.cooldowns = {};
    p.resource = Math.min(hero(p.heroId).maxResource, p.resource + 2);
  }
  startRound(s);
  log(
    s,
    boss
      ? "The vault closes. Your final debt is due."
      : "Enemy intentions revealed. Plan together.",
  );
}
function startRound(s: RunState) {
  for (const p of standing(s)) trigger(s, p, p, "roundStart");
  if (s.combatVersion === 2 && s.round === PATIENCE + 1)
    log(
      s,
      "The Foundry loses patience. Every enemy blow grows heavier from now on.",
    );
  if (standing(s).length) prepareIntents(s);
  else {
    s.phase = "COMPLETE";
    s.outcome = "defeat";
    log(s, "The price of the pact claims its last hero.");
  }
}
export function validatePlan(
  s: RunState,
  p: Player,
  abilityId: string,
  targetId: string,
): Ability {
  if (p.hp <= 0 || p.fallen)
    throw Error("Downed heroes can use spirit support");
  const a = abilities(p.heroId, s.combatVersion, p.upgrades).find(
    (a) => a.id === abilityId,
  );
  if (!a) throw Error("Unknown ability");
  if ((p.cooldowns[a.id] ?? 0) > 0 || p.resource < a.cost)
    throw Error("Ability is unavailable");
  const target = [...s.players, ...s.enemies].find((u) => u.id === targetId);
  if (!target) throw Error("Unknown target");
  if (a.target === "self" && target.id !== p.id) throw Error("Choose yourself");
  if (a.target === "ally" && (!isPlayer(target) || target.fallen))
    throw Error("Choose an ally");
  if (
    (a.target === "enemy" || a.target === "enemyRow") &&
    (isPlayer(target) || target.hp <= 0)
  )
    throw Error("Choose a living enemy");
  if (a.id === "revive" && (target.hp > 0 || s.gold < reviveCost(s)))
    throw Error(`Revival requires a downed ally and ${reviveCost(s)} gold`);
  if (
    a.effects.some((e) => e.kind === "interrupt") &&
    (!("intent" in target) ||
      !target.intent.ability.interruptible ||
      status(target, "interrupted"))
  )
    throw Error("Choose an enemy with an active WINDUP");
  if (
    a.effects.some((e) => e.kind === "protect") &&
    (target.id === p.id || target.hp <= 0)
  )
    throw Error("Choose another standing ally to protect");
  return a;
}
/**
 * A cleared chamber deepens each hero's build. Heroes whose tree is spent are
 * recorded immediately so one finished build cannot stall the room, and legacy
 * saves skip the phase entirely.
 */
export function enterUpgrade(s: RunState) {
  s.votes = {};
  if (s.combatVersion !== 2) {
    s.phase = "REWARD";
    return;
  }
  for (const p of s.players)
    if (!upgradeOffer(p).length) s.votes[p.id] = "none";
  if (s.players.every((p) => s.votes[p.id])) {
    s.votes = {};
    s.phase = "REWARD";
    return;
  }
  s.phase = "UPGRADE";
  log(s, "The pact deepens. Each hero sharpens one ability.");
}
export function resolveRound(s: RunState) {
  const queue = standing(s)
    .map((p) => ({
      p,
      plan: s.plans[p.id],
      a: abilities(p.heroId, s.combatVersion, p.upgrades).find(
        (a) => a.id === s.plans[p.id]?.ability,
      )!,
    }))
    .filter((x) => x.a)
    .sort(
      (a, b) =>
        b.p.speed + b.a.speed - (a.p.speed + a.a.speed) ||
        a.p.id.localeCompare(b.p.id),
    );
  for (const { p, plan, a } of queue) {
    if (p.hp <= 0) continue;
    try {
      validatePlan(s, p, a.id, plan.target);
    } catch {
      log(s, `${p.name}'s ${a.name} fizzles: its target or cost changed.`);
      continue;
    }
    const target = [...s.players, ...s.enemies].find(
      (u) => u.id === plan.target,
    )!;
    p.resource -= a.cost;
    p.cooldowns[a.id] = a.cooldown + 1;
    // Content objects are shared, so price the rising revival on a copy.
    let cast = a;
    if (a.id === "revive") {
      cast = {
        ...a,
        effects: a.effects.map((e) =>
          e.kind === "gold" ? { ...e, amount: -reviveCost(s) } : e,
        ),
      };
      s.revivals = (s.revivals ?? 0) + 1;
    }
    const targets =
      a.target === "enemyRow"
        ? s.enemies.filter((e) => e.hp > 0 && e.row === target.row)
        : [target];
    log(s, `${p.name} casts ${a.name}.`);
    for (const t of targets) {
      effects(s, p, t, cast.effects);
      if (a.effects.some((e) => e.kind === "damage"))
        trigger(s, p, t, "afterAttack");
      if (a.effects.some((e) => e.kind === "heal"))
        trigger(s, p, t, "afterHeal");
    }
  }
  for (const e of s.enemies
    .filter((e) => e.hp > 0)
    .sort((a, b) => b.speed - a.speed)) {
    if (!standing(s).length) break;
    if (e.hp <= 0) continue;
    if (status(e, "interrupted")) {
      log(s, `${e.name} loses its ${e.intent.ability.name}: interrupted.`);
      continue;
    }
    const a = e.intent.ability;
    let t = [...s.players, ...s.enemies].find((u) => u.id === e.intent.target);
    if (!t || t.hp <= 0)
      t =
        a.target === "ally" ? s.enemies.find((x) => x.hp > 0) : standing(s)[0];
    if (!t) continue;
    const targets =
      a.target === "enemyRow"
        ? standing(s).filter((p) => p.row === t!.row)
        : [t];
    log(s, `${e.name}: ${a.name}.`);
    for (const target of targets) {
      const before = target.hp;
      effects(s, e, target, a.effects);
      if (e.elite === "greedy" && target.hp < before)
        effects(s, e, target, [{ kind: "gold", amount: -10 }]);
      if (e.elite === "vampiric")
        e.hp = Math.min(e.maxHp, e.hp + Math.floor((before - target.hp) / 2));
    }
  }
  for (const u of [...s.players, ...s.enemies]) tickStatuses(s, u);
  for (const p of s.players) {
    for (const key of Object.keys(p.cooldowns))
      p.cooldowns[key] = Math.max(0, p.cooldowns[key] - 1);
    if (p.hp <= 0 && !p.fallen && --p.downedRounds <= 0) {
      p.fallen = true;
      log(
        s,
        `${p.name} becomes a spirit. Vote and guide the living until camp.`,
      );
    }
  }
  if (!standing(s).length) {
    s.phase = "COMPLETE";
    s.outcome = "defeat";
    log(s, "The pact is broken. The dungeon keeps its price.");
    return;
  }
  if (s.enemies.every((e) => e.hp <= 0)) {
    const node = s.map.find((n) => n.id === s.currentNode)!;
    s.reward = node.type === "boss" ? 240 : node.type === "elite" ? 180 : 110;
    gain(s, s.reward);
    log(s, "The chamber falls silent.");
    if (node.type === "boss") {
      s.phase = "COMPLETE";
      s.outcome = "victory";
    } else enterUpgrade(s);
  } else {
    s.round++;
    s.plans = {};
    startRound(s);
  }
}
