import { floorsIn } from "./map";
import { LEGACY_BOSSES } from "../content/floors";
import { applyHazard } from "./chambers";
import { chooseEncounter } from "../content/encounters";
import { reachError } from "../shared/reach";
import type {
  RunState,
  Player,
  Enemy,
  Ability,
  Unit,
  Effect,
} from "../shared/model";
import {
  enemies as definitions,
  enemyAbilities,
  isObject,
  phaseTwoIntents,
} from "../content/enemies";
import { abilities, supplyFor } from "../content/heroes";
import { resourceCap } from "../content/evolutions";
import { upgradeOffer } from "../content/upgrades";
import {
  BOSS_PRICING,
  ultimateFor,
  flattenEffects,
  type UltimateDef,
} from "../content/ultimates";
import { charge, withUltimate } from "./charge";
import { pick } from "./rng";
import {
  effects,
  trigger,
  tickStatuses,
  log,
  isPlayer,
  gain,
  release,
  status,
  applyStatus,
  fuseLeft,
} from "./effects";
export function standing(s: RunState) {
  return s.players.filter((p) => p.hp > 0 && !p.fallen);
}
/**
 * Enemies that must be cleared for a chamber to fall silent. A strongbox is
 * not one of them: leaving it standing has to be a losable choice, not a chore
 * the party is forced through before the fight can end.
 */
export function combatants(s: RunState) {
  return s.enemies.filter((e) => !isObject(e.definition));
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
/**
 * How much harder every enemy hits in a three-floor room, by party size, as a
 * multiplier on each damage effect it announces, scoped ones included. A room
 * from before boss pools keeps the old numbers. `TUNING.enemyHit`, when not
 * 1, overrides it for every size so the simulator can sweep (`--hit=`); the
 * game never writes it.
 *
 * Raised after a playtest note that wins came too easily and asked too little
 * strategy. A duo is lighter: it has no spare action to answer an objective
 * with, and at ×1.4 duos fell to 48% while larger parties sat near 73%. See
 * docs/BOSSES.md for the measurements.
 */
export const ENEMY_HIT: Record<number, number> = { 2: 1.3, 3: 1.4, 4: 1.4 };
export const TUNING = { enemyHit: 1 };
/** The multiplier a room's enemies hit with. */
export function enemyHit(s: RunState) {
  if (s.bossVersion !== 1) return 1;
  if (TUNING.enemyHit !== 1) return TUNING.enemyHit;
  return ENEMY_HIT[s.players.length] ?? 1.4;
}
/** Every damage effect in a list, however deeply scoped. */
function damageIn(list: Effect[]): Extract<Effect, { kind: "damage" }>[] {
  return list.flatMap((e) =>
    e.kind === "damage"
      ? [e]
      : e.kind === "enemies" || e.kind === "allies" || e.kind === "conditional"
        ? damageIn(e.effects)
        : [],
  );
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
    const authoredPhase =
      s.expeditionVersion === 1 && e.phase === 2
        ? phaseTwoIntents[e.definition]
        : undefined;
    const rotation = authoredPhase ?? enemyAbilities(def, s.combatVersion);
    let ability = structuredClone(rotation[(s.round - 1) % rotation.length]);
    // A spawner whose objects still stand does something else with the slot.
    if (
      def.busy &&
      ability.effects.some(
        (fx) =>
          fx.kind === "spawn" &&
          s.enemies.some(
            (x) => x.owner === e.id && x.definition === fx.object && x.hp > 0,
          ),
      )
    )
      ability = structuredClone(def.busy);
    // A spawned object's intent is its clock: the rounds it has left, then
    // what it was spawned to do.
    if (def.clock && e.fuse) {
      const left = fuseLeft(s, e);
      ability = structuredClone(left > 0 ? def.clock.waiting : def.clock.due);
      if (left > 0) ability.name = `${ability.name} ${left}`;
    }
    const hit = enemyHit(s);
    if (hit !== 1)
      for (const effect of damageIn(ability.effects))
        effect.amount = Math.round(effect.amount * hit);
    if (e.phase === 2 && !authoredPhase)
      for (const effect of ability.effects)
        if (effect.kind === "damage") effect.amount += 7;
    if (impatience)
      for (const effect of ability.effects)
        if (effect.kind === "damage") effect.amount += impatience;
    // A boss is priced for the Ultimates a party brings to it. See
    // `BOSS_PRICING`: without this, Ultimates took the boss's win rate from
    // 89% to 98%.
    if (def.boss && s.ultimateVersion === 1)
      for (const effect of ability.effects)
        if (effect.kind === "damage")
          effect.amount += BOSS_PRICING.damagePerHero * s.players.length;
    // Hoarding is meant to be dangerous, not merely wasteful.
    if (def.hoard)
      for (const effect of ability.effects)
        if (effect.kind === "damage")
          effect.amount += Math.floor(
            s.gold /
              (s.combatVersion === 2 ? def.hoard.per : def.hoard.legacyPer),
          );
    let targets: Unit[] = standing(s);
    if (ability.target === "self") targets = [e];
    else if (ability.target === "ally")
      targets = s.enemies
        .filter((x) => x.hp > 0)
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    else if (def.targets === "wealthiest")
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
      def.targets === "wealthiest"
        ? targets[0]
        : pick(s, targets);
    e.intent = {
      ability,
      target: target?.id ?? "",
      row: ability.target === "enemyRow" ? target?.row : undefined,
    };
  }
}
/**
 * How much harder a floor's enemies are than the first floor's. A party
 * reaches floor two carrying floor one's gear, upgrades and a mentor's path;
 * without this the second floor is the first floor played with a better kit.
 * Health and power both climb, so a fight lasts longer and each hit in it
 * matters more — the two ways a floor can feel deeper.
 */
/** A boss's health weight: a little for being a boss, the rest per hero. */
export const BOSS_BASE = 0.1;
export const BOSS_PER_HERO = 0.48;
export const FLOOR_SCALE = 0.25;
export function floorScale(s: Pick<RunState, "floor">) {
  return s.floor === undefined ? 1 : 1 + FLOOR_SCALE * (s.floor - 1);
}
export function enterCombat(s: RunState, boss = false, elite = false) {
  s.phase = "COMBAT";
  s.round = 1;
  for (const p of s.players) delete p.spiritRound;
  s.plans = {};
  if (s.ultimateVersion === 1) s.ultimates = {};
  s.enemies = [];
  const count = boss ? 1 : Math.min(4, s.players.length);
  const pool = definitions.filter(
    (d) =>
      !!d.boss === boss &&
      !d.object &&
      (!boss || LEGACY_BOSSES.includes(d.id)),
  );
  // Each floor has its own boss, so the vault a party reaches is the one the
  // floor was built around rather than whichever the dice preferred. With
  // boss pools the map drew it and wrote it on the chamber; before them the
  // Collector kept floor one and the Miser every floor below.
  const drawn = s.map.find((n) => n.id === s.currentNode)?.boss;
  const floorBoss = !boss
    ? undefined
    : (drawn ??
      (s.floor === undefined
        ? undefined
        : s.floor <= 1
          ? "collector"
          : "miser"));
  const deeper = floorScale(s);
  const encounter =
    !boss && s.encounterVersion === 2 ? chooseEncounter(s) : undefined;
  const formation = encounter?.formations[s.players.length as 2 | 3 | 4];
  if (encounter) log(s, `${encounter.name} bars the way.`);
  for (let i = 0; i < count; i++) {
    const d = formation
      ? definitions.find((d) => d.id === formation[i])!
      : floorBoss
        ? definitions.find((d) => d.id === floorBoss)!
        : pick(s, pool);
    // Larger parties cover more roles per round, so their encounters weigh more
    // per hero. Duos face slightly lighter bosses in exchange for having no
    // spare actions at all.
    //
    // Bosses were `0.45 + 0.4 × heroes`, which is lighter for a duo in total
    // but heavier per head — 0.63 of a boss for each of two heroes against 0.51
    // for each of four — for the party with no spare actions to answer an
    // objective with. Losses split by chamber (`scripts/simulate.ts` records
    // where every lost run ended) put essentially every loss at a boss, and
    // duos dying to the first one at eight times a quartet's rate. The
    // per-head weight is now even across party sizes.
    const scale = boss
      ? BOSS_BASE + s.players.length * BOSS_PER_HERO
      : 0.75 + s.players.length * 0.14;
    const priced = boss && s.ultimateVersion === 1 ? BOSS_PRICING.hp : 1;
    const hp = Math.round(d.hp * scale * (elite ? 1.3 : 1) * deeper * priced);
    const e: Enemy = {
      id: `enemy-${i}`,
      definition: d.id,
      name: d.name,
      hp,
      maxHp: hp,
      power: Math.round(d.power * deeper),
      guard: d.guard,
      speed: d.speed,
      row: d.row,
      statuses: [],
      intent: { ability: d.abilities[0], target: "" },
      phase: 1,
      ...(elite
        ? {
            elite: pick(
              s,
              s.expeditionVersion === 1
                ? (["greedy", "vampiric", "sapping", "armored"] as const)
                : (["greedy", "vampiric"] as const),
            ),
          }
        : {}),
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
    p.resource = Math.min(resourceCap(p), p.resource + 2);
    if (p.hp > 0 && s.teamRelics?.includes("pact-lantern"))
      applyStatus(p, "barrier", 6, 2);
    if (p.hp > 0 && s.teamRelics?.includes("ration-engine"))
      p.hp = Math.min(p.maxHp, p.hp + 6);
  }
  if (s.teamRelics?.length)
    log(s, "The pact's shared relics prepare the party for battle.");
  startRound(s);
  log(
    s,
    boss
      ? "The vault closes. Your final debt is due."
      : "Enemy intentions revealed. Plan together.",
  );
  // A boss that only hits harder needs no briefing. One with an objective does.
  if (boss && s.combatVersion === 2)
    for (const e of s.enemies) {
      const objective = definitions.find(
        (d) => d.id === e.definition,
      )?.objective;
      if (objective) log(s, `${e.name}: ${objective}`, "combo");
    }
}
function startRound(s: RunState) {
  // The room moves first. Anything it knocks down or pushes forward is where
  // the party stands when everyone decides the round.
  applyHazard(s);
  for (const e of s.enemies)
    if (e.hp > 0 && e.elite === "armored") applyStatus(e, "barrier", 8, 1);
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
  const a = abilities(
    p.heroId,
    s.combatVersion,
    p.upgrades,
    p.evolution,
    p.items,
  ).find((a) => a.id === abilityId);
  if (!a) throw Error("Unknown ability");
  if ((p.cooldowns[a.id] ?? 0) > 0 || p.resource < a.cost)
    throw Error("Ability is unavailable");
  const target = [...s.players, ...s.enemies].find((u) => u.id === targetId);
  if (!target) throw Error("Unknown target");
  if ("definition" in target) {
    const blocked = reachError(s, p, a, target);
    if (blocked) throw Error(blocked);
  }
  aim(s, p, a.target, targetId);
  // A room with boss pools sells no lives: its only revival is a found writ.
  if (a.id === "revive" && s.bossVersion === 1)
    throw Error("Revival takes a Writ of Reprieve");
  if (a.id === "revive" && (target.hp > 0 || s.gold < reviveCost(s)))
    throw Error(`Revival requires a downed ally and ${reviveCost(s)} gold`);
  if (a.revive && target.hp > 0) throw Error("Choose a downed ally");
  // A heal aimed at a downed ally would stand them up for the price of a
  // dressing. With boss pools, only a revival reaches the downed.
  if (
    s.bossVersion === 1 &&
    !a.revive &&
    isPlayer(target) &&
    target.hp <= 0
  )
    throw Error("Only a revival reaches a downed ally");
  // An ability billed to the treasury must actually be affordable, or it would
  // quietly resolve at a discount when the purse is short.
  const price = a.effects.reduce(
    (n, e) => n + (e.kind === "gold" && e.amount < 0 ? -e.amount : 0),
    0,
  );
  if (a.id !== "revive" && price > s.gold)
    throw Error(`That costs ${price} team gold`);
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

/** The unit a target rule allows, or an error naming what it wants instead. */
function aim(
  s: RunState,
  p: Player,
  rule: Ability["target"],
  targetId: string,
): Unit {
  const target = [...s.players, ...s.enemies].find((u) => u.id === targetId);
  if (!target) throw Error("Unknown target");
  if (rule === "self" && target.id !== p.id) throw Error("Choose yourself");
  if (
    (rule === "ally" || rule === "allyRow") &&
    (!isPlayer(target) || target.fallen)
  )
    throw Error("Choose an ally");
  if (
    (rule === "enemy" || rule === "enemyRow") &&
    (isPlayer(target) || target.hp <= 0)
  )
    throw Error("Choose a living enemy");
  return target;
}

/**
 * Whether this hero may queue their Ultimate at this target, and which
 * Ultimate it is. The server never takes a client's word that a meter is
 * full: the charge is checked here, when the Ultimate is queued, and again
 * when it resolves.
 *
 * An Ultimate ignores the front line's screen — it is the one action that
 * reaches wherever it is aimed — and its interrupt is opportunistic: it
 * breaks a WINDUP if there is one and does not ask for one.
 */
export function validateUltimate(
  s: RunState,
  p: Player,
  targetId: string,
): UltimateDef {
  if (s.ultimateVersion !== 1 || s.combatVersion !== 2)
    throw Error("Ultimates are not part of this run");
  if (p.hp <= 0 || p.fallen)
    throw Error("A downed hero cannot call an Ultimate");
  const u = ultimateFor(p);
  if (!u) throw Error("This hero has no Ultimate");
  if ((p.ultimateCharge ?? 0) < u.cost)
    throw Error("Pact Charge is not full");
  const target = aim(s, p, u.target, targetId);
  if (
    flattenEffects(u.effects).some((e) => e.kind === "protect") &&
    u.target === "ally" &&
    target.id === p.id
  )
    throw Error("Choose another standing ally to protect");
  return u;
}

/**
 * Queued Ultimates, resolved before any other action this round, fastest
 * first. Each is spent as it resolves; one whose target has gone, or whose
 * hero has dropped, fizzles and keeps its charge.
 */
function resolveUltimates(s: RunState) {
  const queued = Object.entries(s.ultimates ?? {});
  s.ultimates = {};
  const order = queued
    .map(([id, plan]) => ({
      p: s.players.find((x) => x.id === id)!,
      plan,
    }))
    .filter((x) => x.p)
    .map((x) => ({ ...x, u: ultimateFor(x.p) }))
    .filter((x): x is typeof x & { u: UltimateDef } => !!x.u)
    .sort(
      (a, b) =>
        b.p.speed + b.u.speed - (a.p.speed + a.u.speed) ||
        a.p.id.localeCompare(b.p.id),
    );
  for (const { p, plan } of order) {
    let u: UltimateDef;
    try {
      u = validateUltimate(s, p, plan.target);
    } catch {
      log(s, `${p.name}'s Ultimate fizzles: its target or charge changed.`);
      continue;
    }
    const target = [...s.players, ...s.enemies].find(
      (x) => x.id === plan.target,
    )!;
    p.ultimateCharge = Math.max(0, (p.ultimateCharge ?? 0) - u.cost);
    log(s, `${p.name} calls ${u.name}!`, "combo", {
      kind: "cast",
      actor: p.id,
      target: plan.target,
      label: u.name,
      ultimate: u.id,
    });
    withUltimate(p.id, () => {
      effects(s, p, target, u.effects);
      if (
        target.id !== p.id &&
        !isPlayer(target) &&
        flattenEffects(u.effects).some((e) => e.kind === "damage" && !e.self)
      )
        trigger(s, p, target, "afterAttack");
    });
  }
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
  // Older saved intentions predate row anchors; capture them before any hero moves.
  for (const e of s.enemies)
    if (e.intent.ability.target === "enemyRow" && !e.intent.row)
      e.intent.row = s.players.find((p) => p.id === e.intent.target)?.row;
  s.roundSummary = {
    round: s.round,
    damage: 0,
    healing: 0,
    blocked: 0,
    triggers: 0,
    downs: [],
  };
  if (s.ultimateVersion === 1) resolveUltimates(s);
  const queue = standing(s)
    .map((p) => ({
      p,
      plan: s.plans[p.id],
      a: abilities(
        p.heroId,
        s.combatVersion,
        p.upgrades,
        p.evolution,
        p.items,
      ).find((a) => a.id === s.plans[p.id]?.ability)!,
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
    // A supply is spent by being used. One copy leaves the pack before the
    // action resolves, so nothing it does can hand it back.
    const spent = supplyFor(a.id);
    if (spent) {
      const at = p.items.indexOf(spent.id);
      if (at >= 0) p.items.splice(at, 1);
      log(s, `${p.name} uses up the ${spent.name}.`);
    }
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
        : a.target === "allyRow"
          ? standing(s).filter((x) => x.row === target.row)
          : [target];
    log(s, `${p.name} casts ${a.name}.`, "info", {
      kind: "cast",
      actor: p.id,
      target: plan.target,
      label: a.name,
    });
    for (const t of targets) {
      effects(s, p, t, cast.effects);
      if (a.effects.some((e) => e.kind === "damage"))
        trigger(s, p, t, "afterAttack");
      if (a.effects.some((e) => e.kind === "heal"))
        trigger(s, p, t, "afterHeal");
    }
    charge(s, p, "action");
  }
  for (const e of s.enemies
    .filter((e) => e.hp > 0)
    .sort((a, b) => b.speed - a.speed)) {
    if (!standing(s).length) break;
    // Once the last real enemy falls the chamber is decided; a container should
    // not go on sealing itself over the body of the boss that filled it.
    if (!combatants(s).some((x) => x.hp > 0)) break;
    if (e.hp <= 0) continue;
    if (status(e, "interrupted")) {
      log(s, `${e.name} loses its ${e.intent.ability.name}: interrupted.`);
      continue;
    }
    const a = e.intent.ability;
    const announcedRow = e.intent.row;
    let t = [...s.players, ...s.enemies].find((u) => u.id === e.intent.target);
    if (!t || t.hp <= 0)
      t =
        a.target === "ally" ? s.enemies.find((x) => x.hp > 0) : standing(s)[0];
    // A confounded enemy turns on its own side; a healer mends the wrong thing.
    const turned = status(e, "confused");
    if (turned) {
      const side =
        a.target === "ally"
          ? standing(s)
          : s.enemies.filter((x) => x.id !== e.id && x.hp > 0);
      if (!side.length) {
        log(s, `${e.name} lashes at nothing. Its ${a.name} is wasted.`);
        continue;
      }
      t = side[0];
      charge(
        s,
        s.players.find((x) => x.id === turned.sourceId),
        "control",
      );
      log(s, `${e.name} turns its ${a.name} on its own side!`, "combo", {
        kind: "combo",
        label: "BEGUILED",
        actor: e.id,
        target: t.id,
      });
    }
    if (!t && !(a.target === "enemyRow" && announcedRow && !turned)) continue;
    const pool = turned
      ? a.target === "ally"
        ? standing(s)
        : s.enemies.filter((x) => x.id !== e.id && x.hp > 0)
      : a.target === "ally"
        ? s.enemies.filter((x) => x.hp > 0)
        : standing(s);
    const targets =
      a.target === "enemyRow"
        ? pool.filter(
            (p) => p.row === (!turned && announcedRow ? announcedRow : t!.row),
          )
        : [t!];
    if (!targets.length) {
      log(
        s,
        `${e.name}: ${a.name} misses the empty ${announcedRow ?? t?.row} row.`,
        "info",
        { kind: "cast", actor: e.id, label: `${a.name} · MISS` },
      );
      continue;
    }
    log(s, `${e.name}: ${a.name}.`, "info", {
      kind: "cast",
      actor: e.id,
      target: targets[0].id,
      label: a.name,
    });
    for (const target of targets) {
      const before = target.hp;
      effects(s, e, target, a.effects);
      if (e.elite === "greedy" && target.hp < before)
        effects(s, e, target, [{ kind: "gold", amount: -10 }]);
      if (e.elite === "sapping" && target.hp < before && isPlayer(target)) {
        target.resource = Math.max(0, target.resource - 1);
        log(s, `${e.name} drains 1 resource from ${target.name}.`);
      }
      if (e.elite === "vampiric")
        e.hp = Math.min(e.maxHp, e.hp + Math.floor((before - target.hp) / 2));
    }
  }
  // A clock that came due has done what it was for, struck or not: it leaves,
  // unbroken, whatever stopped it acting.
  for (const e of s.enemies)
    if (e.fuse && e.hp > 0 && fuseLeft(s, e) === 0) {
      e.spent = true;
      e.hp = 0;
      log(s, `${e.name} sets.`, "info", { kind: "defeat", target: e.id, hp: 0 });
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
  if (combatants(s).every((e) => e.hp <= 0)) {
    for (const e of s.enemies) if (e.holding?.length) release(s, e);
    const node = s.map.find((n) => n.id === s.currentNode)!;
    // A room that fought back pays more than an ordinary chamber, less than
    // an elite: it was harder, but nobody in it was special.
    s.reward =
      node.type === "boss"
        ? 240
        : node.type === "elite"
          ? 180
          : node.type === "hazard"
            ? 150
            : 110;
    delete s.hazard;
    gain(s, s.reward);
    log(s, "The chamber falls silent.");
    if (
      node.type === "boss" &&
      s.floor !== undefined &&
      s.floor < floorsIn(s)
    ) {
      // Not the end: the vault opens onto the next floor down. The party gets
      // the same branch upgrade any victory earns, then descends when it
      // leaves the reward.
      log(s, "The vault floor gives way. There is further down.");
      enterUpgrade(s);
    } else if (node.type === "boss") {
      s.phase = "COMPLETE";
      s.outcome = "victory";
    } else enterUpgrade(s);
  } else {
    s.round++;
    s.plans = {};
    startRound(s);
  }
}
