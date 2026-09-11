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
/** Mark + Precision bonus. Setting up an Exploit costs a whole action, so the
 * payoff has to beat simply attacking twice. */
export const EXPLOIT = 20;
/** Weak is the answer to a spike for parties with no Vanguard to intercept it,
 * so it has to be worth the action it costs. */
export const WEAK = 0.65;
/** Empowered is Weak's mirror: the Herald's whole job is making allies hit harder. */
export const EMPOWERED = 1.3;
export function log(
  s: RunState,
  text: string,
  kind: RunState["logs"][number]["kind"] = "info",
  beat?: Beat,
) {
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
    { kind: "combo", label: "RECLAIMED", target: holder.id },
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
      if (isPlayer(source)) trigger(s, source, target, "onKill", depth + 1);
    }
  }
  if (actual > 0 && isPlayer(target))
    trigger(s, target, source, "onHurt", depth + 1);
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
    if (item.trigger === event)
      effects(
        s,
        actor,
        item.target === "self" ? actor : target,
        item.effects,
        depth + 1,
      );
    if (item.cursed && event === "roundStart")
      hurt(s, actor, actor, 6, depth + 1);
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
    if (e.kind === "removeStatus") {
      const removed = status(target, e.status);
      target.statuses = target.statuses.filter((st) => st.id !== e.status);
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
      log(s, `${actor.name} will intercept ${target.name}’s next direct hit.`);
    }
    if (
      e.kind === "interrupt" &&
      isEnemy(target) &&
      target.hp > 0 &&
      target.intent.ability.interruptible
    ) {
      applyStatus(target, "interrupted", 1, 1);
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
      if (e.amount < 0) spend(s, Math.min(s.gold, -e.amount));
      else gain(s, e.amount);
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
              actor: actor.id,
              target: target.id,
            },
          );
        }
      } else log(s, `${target.name} carries nothing worth taking.`);
    }
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
      if (down && isPlayer(patient)) {
        patient.downedRounds = 0;
        if (isPlayer(actor) && actor.id !== patient.id) actor.revives++;
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
      hurt(s, actor, actor, e.amount, depth + 1);
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
      let amount =
        (e.amount + actor.power) *
          (status(actor, "weak") ? WEAK : 1) *
          (status(actor, "empowered") ? EMPOWERED : 1) -
        (e.pierce ? 0 : victim.guard);
      if (status(victim, "vulnerable")) amount *= 1.25;
      if (e.precision && status(victim, "marked")) {
        amount += EXPLOIT;
        victim.statuses = victim.statuses.filter((x) => x.id !== "marked");
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
