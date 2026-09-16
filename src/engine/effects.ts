import type {
  Beat,
  RunState,
  Unit,
  Player,
  Enemy,
  Effect,
  Trigger,
  StatusId,
} from "../shared/model";
import { statuses } from "../content/statuses";
import { items } from "../content/items";
import { enemies as definitions } from "../content/enemies";
import { resourceCap } from "../content/evolutions";
import { charge, resolvingUltimate } from "./charge";
import { floorScale } from "./combat";
import { hitDamage } from "../shared/damage";
export { EXPLOIT, WEAK, EMPOWERED } from "../shared/damage";
export function log(
  s: RunState,
  text: string,
  kind: RunState["logs"][number]["kind"] = "info",
  beat?: Beat,
) {
  const summary = s.roundSummary;
  if (summary && summary.round === s.round && beat) {
    if (beat.kind === "damage") summary.damage += beat.amount ?? 0;
    if (beat.kind === "heal") summary.healing += beat.amount ?? 0;
    if (beat.kind === "block") summary.blocked += beat.amount ?? 0;
    if (
      beat.kind === "defeat" &&
      beat.target &&
      !summary.downs.includes(beat.target)
    )
      summary.downs.push(beat.target);
    summary.triggers +=
      beat.equipment?.filter((e) => e.action === "trigger").length ?? 0;
  }
  s.logs.push({ seq: ++s.eventSeq, text, kind, ...(beat ? { beat } : {}) });
  s.logs = s.logs.slice(-100);
}
export function spend(s: RunState, amount: number) {
  if (!Number.isSafeInteger(amount) || amount < 0 || s.gold < amount)
    throw Error("Not enough team gold");
  s.gold -= amount;
  s.spent += amount;
  log(s, `Treasury −${amount} gold`, "gold");
}
export function gain(s: RunState, amount: number) {
  s.gold += amount;
  s.earned += amount;
  log(s, `Treasury +${amount} gold`, "gold");
}
export function status(u: Unit, id: StatusId) {
  return u.statuses.find((x) => x.id === id);
}
export function applyStatus(
  u: Unit,
  id: StatusId,
  stacks: number,
  duration: number,
) {
  const old = status(u, id);
  if (old) {
    old.stacks = Math.min(statuses[id].max, old.stacks + stacks);
    old.duration = Math.max(old.duration, duration);
  } else
    u.statuses.push({
      id,
      stacks: Math.min(stacks, statuses[id].max),
      duration,
    });
}
/**
 * The Collector's vault. It is spawned by a seizure rather than by the
 * encounter, holds what was taken, and returns all of it the moment it breaks.
 * Nothing else in combat knows it exists: it is an ordinary enemy that happens
 * to be an object.
 */
function strongbox(s: RunState): Enemy {
  const existing = s.enemies.find((e) => e.definition === "strongbox");
  if (existing && existing.hp > 0) return existing;
  const def = definitions.find((d) => d.id === "strongbox")!;
  // Priced against the party's actions, not its headcount. A container that
  // scales as `base + players` costs a duo a whole round and a quartet three
  // quarters of one, which is why two-hero parties wore the largest share of
  // the objectives pass. Scaling straight off the party's output makes opening
  // it the same fraction of a round at every size.
  const hp = Math.round(def.hp * s.players.length * 0.35);
  const box: Enemy = {
    id: `enemy-box-${s.enemies.length}`,
    definition: def.id,
    name: def.name,
    hp,
    maxHp: hp,
    power: def.power,
    guard: def.guard,
    speed: def.speed,
    row: def.row,
    statuses: [],
    intent: { ability: def.abilities[0], target: "" },
    phase: 1,
    holding: [],
  };
  s.enemies.push(box);
  log(s, `${def.name} is hauled into the chamber.`);
  return box;
}
/**
 * Objects a boss brings in, one to a row it names. They belong to it: breaking
 * one answers to it (`broken`), and a fuse counts down on each one's intent
 * (`clock`, read by `prepareIntents`). Priced like the Strongbox, against the
 * party's actions rather than its headcount, and scaled with the floor.
 */
export function spawn(
  s: RunState,
  owner: Enemy,
  e: Extract<Effect, { kind: "spawn" }>,
) {
  if (
    s.enemies.some(
      (x) => x.owner === owner.id && x.definition === e.object && x.hp > 0,
    )
  )
    return;
  const def = definitions.find((d) => d.id === e.object)!;
  const deeper = floorScale(s);
  const hp = Math.round(def.hp * s.players.length * 0.35 * deeper);
  for (const row of e.rows) {
    const made: Enemy = {
      id: `enemy-${def.id}-${s.round}-${s.enemies.length}`,
      definition: def.id,
      name: def.name,
      hp,
      maxHp: hp,
      power: Math.round(def.power * deeper),
      guard: def.guard,
      speed: def.speed,
      row,
      statuses: [],
      intent: { ability: def.clock?.waiting ?? def.abilities[0], target: "" },
      phase: 1,
      owner: owner.id,
      ...(e.fuse ? { fuse: { at: s.round, rounds: e.fuse } } : {}),
    };
    s.enemies.push(made);
  }
  log(
    s,
    `${owner.name} brings ${e.rows.length === 1 ? `${def.name}` : `${e.rows.length} × ${def.name}`} into the chamber.`,
    "combo",
    { kind: "combo", label: def.name.toUpperCase(), actor: owner.id },
  );
}
/**
 * A spawned object broke: it answers to its owner for it, and when it was the
 * last of its batch standing and none of the batch had been spent, it answers
 * for the batch as well.
 */
function answer(s: RunState, broke: Enemy, depth: number) {
  const def = definitions.find((d) => d.id === broke.definition);
  const owner = s.enemies.find((x) => x.id === broke.owner && x.hp > 0);
  if (!def?.broken || !owner) return;
  // The broken object answers as it was, not as a corpse: the interpreter
  // stops for a fallen actor, and its own power is not what cracks back.
  const wax: Enemy = { ...broke, hp: 1, power: 0, statuses: [] };
  effects(s, wax, owner, def.broken.each, depth);
  const batch = s.enemies.filter(
    (x) =>
      x.owner === broke.owner &&
      x.definition === broke.definition &&
      x.fuse?.at === broke.fuse?.at,
  );
  if (def.broken.all && batch.every((x) => x.hp <= 0 && !x.spent)) {
    log(s, `Every ${def.name} is broken. ${owner.name} staggers.`, "combo", {
      kind: "combo",
      label: "BROKEN",
      actor: broke.id,
      target: owner.id,
    });
    effects(s, wax, owner, def.broken.all, depth);
  }
}
/** Rounds left on a spawned object's fuse this round; 0 means it is due. */
export function fuseLeft(s: RunState, e: Enemy) {
  return e.fuse ? Math.max(0, e.fuse.rounds - (s.round - e.fuse.at)) : 0;
}
/**
 * Everything a broken container was holding goes back to the heroes it was
 * taken from. Called when the box falls and again when the chamber does, so a
 * seizure can never outlive the fight it happened in.
 */
export function release(s: RunState, holder: Enemy) {
  const held = holder.holding ?? [];
  holder.holding = [];
  if (!held.length) return;
  for (const { playerId, itemId } of held) {
    const owner = s.players.find((p) => p.id === playerId);
    if (owner && !owner.items.includes(itemId)) owner.items.push(itemId);
  }
  log(
    s,
    `${holder.name} splits open. ${held.length} piece${held.length === 1 ? "" : "s"} of equipment returns to the pact.`,
    "combo",
    {
      kind: "combo",
      label: "RECLAIMED",
      target: holder.id,
      equipment: held.map((h) => ({
        action: "return",
        ownerId: h.playerId,
        itemId: h.itemId,
        containerId: holder.id,
      })),
    },
  );
}
export function isEnemy(u: Unit): u is Enemy {
  return "intent" in u;
}
export function isPlayer(u: Unit): u is Player {
  return "heroId" in u;
}
function hurt(
  s: RunState,
  source: Unit,
  target: Unit,
  amount: number,
  depth: number,
) {
  if (target.hp <= 0) return;
  const barrier = status(target, "barrier");
  let n = Math.max(0, Math.round(amount));
  if (barrier) {
    const blocked = Math.min(barrier.stacks, n);
    barrier.stacks -= blocked;
    n -= blocked;
    target.statuses = target.statuses.filter((x) => x.stacks > 0);
    if (blocked && source.id !== target.id) charge(s, target, "blocked", blocked);
    if (blocked)
      log(s, `${target.name} blocks ${blocked}.`, "info", {
        kind: "block",
        actor: source.id,
        target: target.id,
        amount: blocked,
        hp: target.hp,
      });
  }
  const actual = Math.min(target.hp, n);
  target.hp -= actual;
  if (isPlayer(source)) source.damage += actual;
  if (isPlayer(source) && !isPlayer(target)) charge(s, source, "damage", actual);
  if (isPlayer(target) && !isPlayer(source)) charge(s, target, "hurt", actual);
  log(s, `${source.name} → ${target.name}: ${actual} damage`, "damage", {
    kind: "damage",
    actor: source.id,
    target: target.id,
    amount: actual,
    hp: target.hp,
  });
  if (target.hp === 0) {
    log(
      s,
      `${target.name} is ${isPlayer(target) ? "downed" : "defeated"}.`,
      "info",
      { kind: "defeat", target: target.id, hp: 0 },
    );
    if (isPlayer(target)) target.downedRounds = 3;
    else {
      if (isEnemy(target) && target.holding?.length) release(s, target);
      if (isEnemy(target) && target.owner) answer(s, target, depth + 1);
      // A container opened is a choice, not a kill.
      if (isPlayer(source) && !definitions.find((d) => d.id === (target as Enemy).definition)?.object)
        charge(s, source, "kill");
      if (isPlayer(source)) trigger(s, source, target, "onKill", depth + 1);
    }
  }
  if (actual > 0 && isPlayer(target))
    trigger(s, target, source, "onHurt", depth + 1);
}
/**
 * A reforged piece's effects, half again as strong. Every quantity a player
 * would feel scales — damage, healing, barrier, stacks — and the rules a piece
 * follows do not: it still fires on the same trigger, at the same target, and
 * never learns to do something it could not do before.
 */
export const REFORGE = 1.5;
export function reforge(list: Effect[]): Effect[] {
  const up = (n: number) => Math.round(n * REFORGE);
  return list.map((effect): Effect => {
    switch (effect.kind) {
      case "damage":
        return { ...effect, amount: up(effect.amount) };
      case "heal":
        return { ...effect, amount: up(effect.amount) };
      case "protect":
        return { ...effect, barrier: up(effect.barrier) };
      case "status":
        return {
          ...effect,
          stacks: Math.max(effect.stacks + 1, up(effect.stacks)),
        };
      case "resource":
        return { ...effect, amount: effect.amount + 1 };
      // A piece that pays out pays more; a price a piece charges is not raised
      // by improving it.
      case "gold":
        return effect.amount > 0
          ? { ...effect, amount: up(effect.amount) }
          : effect;
      case "conditional":
        return { ...effect, effects: reforge(effect.effects) };
      default:
        return effect;
    }
  });
}

export function trigger(
  s: RunState,
  actor: Player,
  target: Unit,
  event: Trigger,
  depth = 0,
) {
  if (depth > 4 || actor.hp <= 0) return; // Prevent recursive proc cycles; triggered damage does not re-trigger attacks.
  for (const id of actor.items) {
    const item = items.find((i) => i.id === id)!;
    if (item.trigger === event) {
      log(s, `${actor.name}: ${item.name} activates.`, "info", {
        kind: "equipment",
        actor: actor.id,
        equipment: [{ action: "trigger", ownerId: actor.id, itemId: item.id }],
      });
      effects(
        s,
        actor,
        item.target === "self" ? actor : target,
        actor.reforged?.includes(id) ? reforge(item.effects) : item.effects,
        depth + 1,
      );
    }
    if (item.cursed && event === "roundStart") {
      log(s, `${actor.name}: ${item.name} collects its price.`, "info", {
        kind: "equipment",
        actor: actor.id,
        equipment: [{ action: "trigger", ownerId: actor.id, itemId: item.id }],
      });
      hurt(s, actor, actor, 6, depth + 1);
    }
  }
}
export function effects(
  s: RunState,
  actor: Unit,
  target: Unit,
  list: Effect[],
  depth = 0,
) {
  if (depth > 6) return;
  let statusRecipient = target;
  for (const e of list) {
    // A reflected hit can defeat a multi-attacker between strikes.
    if (s.combatVersion === 2 && actor.hp <= 0) break;
    if (e.kind === "allies" || e.kind === "enemies") {
      const side = isPlayer(actor) === (e.kind === "allies") ? s.players : s.enemies;
      const reached = side.filter((u) => {
        if (u.id === actor.id) return e.kind === "allies" && !!e.self;
        if (isPlayer(u))
          return !u.fallen && (u.hp > 0 || (e.kind === "allies" && !!e.downed));
        if (u.hp <= 0) return false;
        if (e.kind === "enemies" && e.others && u.id === target.id) return false;
        if (e.kind === "enemies" && e.row && u.row !== target.row) return false;
        return true;
      });
      for (const u of reached) effects(s, actor, u, e.effects, depth + 1);
      continue;
    }
    if (e.kind === "removeStatus") {
      const removed = status(target, e.status);
      target.statuses = target.statuses.filter((st) => st.id !== e.status);
      if (removed && isPlayer(actor) && isPlayer(target) !== (e.status === "barrier"))
        charge(s, actor, "cleanse");
      if (removed)
        log(
          s,
          `${actor.name} strips ${statuses[e.status].name} from ${target.name}.`,
        );
    }
    if (
      e.kind === "protect" &&
      isPlayer(actor) &&
      isPlayer(target) &&
      target.hp > 0 &&
      actor.id !== target.id
    ) {
      actor.row = "front";
      applyStatus(actor, "barrier", e.barrier, 1);
      applyStatus(target, "guarded", 1, 1);
      status(target, "guarded")!.sourceId = actor.id;
      charge(s, actor, "shield", e.barrier);
      log(s, `${actor.name} will intercept ${target.name}’s next direct hit.`);
    }
    if (
      e.kind === "interrupt" &&
      isEnemy(target) &&
      target.hp > 0 &&
      target.intent.ability.interruptible
    ) {
      applyStatus(target, "interrupted", 1, 1);
      charge(s, actor, "interrupt");
      log(
        s,
        `${actor.name} breaks ${target.name}’s ${target.intent.ability.name}!`,
        "combo",
        {
          kind: "combo",
          label: "INTERRUPTED",
          actor: actor.id,
          target: target.id,
        },
      );
    }
    if (e.kind === "gold") {
      const moved = e.amount < 0 ? Math.min(s.gold, -e.amount) : e.amount;
      if (e.amount < 0) spend(s, moved);
      else gain(s, e.amount);
      charge(s, actor, "trade", moved / 10);
    }
    // Equipment is taken, not destroyed. The party can have it back, but only
    // by spending actions on a container instead of on the boss.
    // One strongbox to a chamber. Breaking it open is not a chore that repeats:
    // it ends the seizures for good, which is what makes it worth the actions.
    if (
      e.kind === "seize" &&
      isPlayer(target) &&
      target.hp > 0 &&
      !s.enemies.some((x) => x.definition === "strongbox" && x.hp <= 0)
    ) {
      const carried = target.items
        .map((id) => items.find((i) => i.id === id)!)
        // Supplies are stock, not collateral: an appraiser takes what is worn.
        .filter((i) => i.slot !== "supply")
        .sort((a, b) => b.price - a.price || a.id.localeCompare(b.id))
        .slice(0, e.count);
      if (carried.length) {
        const box = strongbox(s);
        for (const item of carried) {
          target.items = target.items.filter((id) => id !== item.id);
          box.holding = [
            ...(box.holding ?? []),
            { playerId: target.id, itemId: item.id },
          ];
          log(
            s,
            `${actor.name} seizes ${item.name} from ${target.name}.`,
            "combo",
            {
              kind: "combo",
              label: "SEIZED",
              equipment: [
                {
                  action: "seize",
                  ownerId: target.id,
                  itemId: item.id,
                  containerId: box.id,
                },
              ],
              actor: actor.id,
              target: target.id,
            },
          );
        }
      } else log(s, `${target.name} carries nothing worth taking.`);
    }
    // A boss can bring things into the fight that answer for it: the Notary's
    // seals. One batch at a time, so a pressing never lands on top of another.
    if (e.kind === "spawn" && isEnemy(actor)) spawn(s, actor, e);
    // Wealth left in the treasury is collateral the Miser can shield itself
    // with, so arriving rich is a decision and not simply a cushion.
    if (e.kind === "bank") {
      const banked = Math.floor(
        Math.max(0, s.gold - e.free) / Math.max(1, e.per),
      );
      if (banked > 0) {
        applyStatus(actor, "barrier", banked, 2);
        log(
          s,
          `${actor.name} banks the pact's hoard of ${s.gold} gold: Barrier +${banked}.`,
          "gold",
        );
      }
    }
    if (e.kind === "resource" && isPlayer(actor))
      actor.resource = Math.max(
        0,
        Math.min(resourceCap(actor), actor.resource + e.amount),
      );
    if (e.kind === "move") target.row = e.row;
    if (e.kind === "status") {
      const recipient = e.self ? actor : statusRecipient;
      if (recipient.hp > 0) {
        applyStatus(recipient, e.status, e.stacks, e.duration);
        log(s, `${recipient.name}: ${statuses[e.status].name} +${e.stacks}`);
        if (isPlayer(actor)) {
          const ally = isPlayer(recipient);
          // Who set a confusion, so its turned blow can be credited to them.
          if (e.status === "confused" && !ally)
            status(recipient, "confused")!.sourceId = actor.id;
          if (ally && recipient.id !== actor.id && e.status === "barrier")
            charge(s, actor, "shield", e.stacks);
          if (ally && recipient.id !== actor.id && e.status === "empowered")
            charge(s, actor, "empower");
          if (
            !ally &&
            ["marked", "wet", "vulnerable", "weak", "burn", "poison"].includes(
              e.status,
            )
          )
            charge(s, actor, "setup");
        }
        // An Ultimate reports the Barrier it raises, so its cinematic can
        // show it landing. Ordinary actions never do: a beat is time in a
        // replay, and the round's pacing was measured without these.
        if (
          e.status === "barrier" &&
          isPlayer(recipient) &&
          resolvingUltimate() === actor.id
        )
          log(s, `${recipient.name} is warded.`, "info", {
            kind: "ward",
            actor: actor.id,
            target: recipient.id,
            amount: e.stacks,
            hp: recipient.hp,
          });
      }
    }
    if (e.kind === "conditional" && status(target, e.status))
      effects(s, actor, target, e.effects, depth + 1);
    if (e.kind === "heal") {
      const patient = e.self ? actor : target;
      if (isPlayer(patient) && patient.fallen) continue;
      const down = patient.hp === 0;
      const healed = Math.min(patient.maxHp - patient.hp, e.amount);
      patient.hp += healed;
      if (isPlayer(actor)) actor.healing += healed;
      if (isPlayer(patient)) charge(s, actor, "heal", healed);
      if (down && isPlayer(patient)) {
        patient.downedRounds = 0;
        if (isPlayer(actor) && actor.id !== patient.id) {
          actor.revives++;
          charge(s, actor, "revive");
        }
        log(s, `${patient.name} returns to the pact!`);
      }
      log(s, `${actor.name} heals ${patient.name} for ${healed}.`, "heal", {
        kind: "heal",
        actor: actor.id,
        target: patient.id,
        amount: healed,
        hp: patient.hp,
      });
    }
    // A blood cost is paid flat: no power scaling, no armour, no combos.
    if (e.kind === "damage" && e.self) {
      const before = actor.hp;
      hurt(s, actor, actor, e.amount, depth + 1);
      charge(s, actor, "sacrifice", before - actor.hp);
      continue;
    }
    if (e.kind === "damage") {
      let victim = target;
      // A guard link intercepts one direct enemy hit, never poison, reflected procs or corpses.
      const link = status(target, "guarded");
      if (
        !isPlayer(actor) &&
        isPlayer(target) &&
        target.hp > 0 &&
        link &&
        depth === 0
      ) {
        const protector = s.players.find(
          (p) => p.id === link.sourceId && p.hp > 0 && !p.fallen,
        );
        if (protector) {
          target.statuses = target.statuses.filter((st) => st.id !== "guarded");
          victim = protector;
          charge(s, protector, "intercept");
          log(
            s,
            `${protector.name} intercepts the hit meant for ${target.name}!`,
            "combo",
            {
              kind: "combo",
              label: "INTERCEPT",
              actor: protector.id,
              target: target.id,
            },
          );
        }
      }
      statusRecipient = victim;
      // The same function the battlefield forecasts intents with.
      const exploit = !!e.precision && !!status(victim, "marked");
      const amount = hitDamage(e.amount, actor, victim, {
        pierce: e.pierce,
        precision: e.precision,
      });
      if (exploit) {
        victim.statuses = victim.statuses.filter((x) => x.id !== "marked");
        charge(s, actor, "reaction");
        log(s, "EXPLOIT · Mark + Precision", "combo", {
          kind: "combo",
          label: "EXPLOIT",
          actor: actor.id,
          target: victim.id,
        });
      }
      const chain = e.damageType === "lightning" && status(victim, "wet");
      if (chain) {
        victim.statuses = victim.statuses.filter((x) => x.id !== "wet");
        charge(s, actor, "reaction");
        log(s, "CHAIN SHOCK · Wet + Lightning", "combo", {
          kind: "combo",
          label: "CHAIN SHOCK",
          actor: actor.id,
          target: victim.id,
        });
      }
      hurt(s, actor, victim, Math.max(1, amount), depth);
      if (chain) {
        const side = isPlayer(victim) ? s.players : s.enemies;
        for (const other of side)
          if (other.id !== victim.id && other.hp > 0)
            hurt(s, actor, other, 12, depth + 1);
      }
    }
  }
}
/**
 * Damage the room deals rather than anyone in it: a hazard chamber's vents.
 * Sourced to the victim, as a burn is, so barrier still absorbs it and nothing
 * triggers off it as though an enemy had struck.
 */
export function scald(s: RunState, u: Unit, amount: number) {
  hurt(s, u, u, amount, 5);
}

export function tickStatuses(s: RunState, u: Unit) {
  if (u.hp > 0) {
    for (const st of [...u.statuses]) {
      if (st.id === "burn" || st.id === "poison") hurt(s, u, u, st.stacks, 5);
      if (st.id === "regen" && u.hp > 0) {
        u.hp = Math.min(u.maxHp, u.hp + st.stacks);
        log(s, `${u.name} regenerates ${st.stacks}.`, "heal");
      }
    }
  }
  for (const st of u.statuses) st.duration--;
  u.statuses = u.statuses.filter((x) => x.duration > 0 && x.stacks > 0);
}
