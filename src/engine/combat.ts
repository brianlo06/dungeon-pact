import { chooseEncounter } from "../content/encounters";
import type { RunState, Player, Enemy, Ability, Unit } from "../shared/model";
import { enemies as definitions, enemyAbilities } from "../content/enemies";
import { abilities, hero } from "../content/heroes";
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
export function prepareIntents(s: RunState) {
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
    if (e.definition === "miser")
      for (const effect of ability.effects)
        if (effect.kind === "damage") effect.amount += Math.floor(s.gold / 100);
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
    const scale = boss
      ? 0.65 + s.players.length * 0.32
      : 0.85 + s.players.length * 0.08;
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
  if (boss && s.players.length >= 3) {
    const d = definitions.find((d) => d.id === "mender")!;
    s.enemies.push({
      ...d,
      id: "enemy-add",
      definition: d.id,
      maxHp: d.hp,
      statuses: [],
      intent: { ability: d.abilities[0], target: "" },
      phase: 1,
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
  const a = abilities(p.heroId, s.combatVersion).find(
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
  if (a.id === "revive" && (target.hp > 0 || s.gold < 90))
    throw Error("Revival requires a downed ally and 90 gold");
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
export function resolveRound(s: RunState) {
  const queue = standing(s)
    .map((p) => ({
      p,
      plan: s.plans[p.id],
      a: abilities(p.heroId, s.combatVersion).find(
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
    const targets =
      a.target === "enemyRow"
        ? s.enemies.filter((e) => e.hp > 0 && e.row === target.row)
        : [target];
    log(s, `${p.name} casts ${a.name}.`);
    for (const t of targets) {
      effects(s, p, t, a.effects);
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
    s.phase = node.type === "boss" ? "COMPLETE" : "REWARD";
    if (s.phase === "COMPLETE") s.outcome = "victory";
    log(s, "The chamber falls silent.");
  } else {
    s.round++;
    s.plans = {};
    startRound(s);
  }
}
