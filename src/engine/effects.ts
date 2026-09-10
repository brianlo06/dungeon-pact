import type {
  RunState,
  Unit,
  Player,
  Effect,
  Trigger,
  StatusId,
} from "../shared/model";
import { statuses } from "../content/statuses";
import { items } from "../content/items";
import { hero } from "../content/heroes";
export function log(
  s: RunState,
  text: string,
  kind: RunState["logs"][number]["kind"] = "info",
) {
  s.logs.push({ seq: ++s.eventSeq, text, kind });
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
    if (blocked) log(s, `${target.name} blocks ${blocked}.`);
  }
  const actual = Math.min(target.hp, n);
  target.hp -= actual;
  if (isPlayer(source)) source.damage += actual;
  log(s, `${source.name} → ${target.name}: ${actual} damage`, "damage");
  if (target.hp === 0) {
    log(s, `${target.name} is ${isPlayer(target) ? "downed" : "defeated"}.`);
    if (isPlayer(target)) target.downedRounds = 3;
    else if (isPlayer(source)) trigger(s, source, target, "onKill", depth + 1);
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
  for (const e of list) {
    if (e.kind === "gold") {
      if (e.amount < 0) spend(s, Math.min(s.gold, -e.amount));
      else gain(s, e.amount);
    }
    if (e.kind === "resource" && isPlayer(actor))
      actor.resource = Math.max(
        0,
        Math.min(hero(actor.heroId).maxResource, actor.resource + e.amount),
      );
    if (e.kind === "move") target.row = e.row;
    if (e.kind === "status" && target.hp > 0) {
      applyStatus(target, e.status, e.stacks, e.duration);
      log(s, `${target.name}: ${statuses[e.status].name} +${e.stacks}`);
    }
    if (e.kind === "conditional" && status(target, e.status))
      effects(s, actor, target, e.effects, depth + 1);
    if (e.kind === "heal") {
      if (isPlayer(target) && target.fallen) continue;
      const down = target.hp === 0;
      const healed = Math.min(target.maxHp - target.hp, e.amount);
      target.hp += healed;
      if (isPlayer(actor)) actor.healing += healed;
      if (down && isPlayer(target)) {
        target.downedRounds = 0;
        if (isPlayer(actor)) actor.revives++;
        log(s, `${target.name} returns to the pact!`);
      }
      log(s, `${actor.name} heals ${target.name} for ${healed}.`, "heal");
    }
    if (e.kind === "damage") {
      let amount = e.amount + actor.power - target.guard;
      if (status(target, "vulnerable")) amount *= 1.25;
      if (e.precision && status(target, "marked")) {
        amount += 14;
        target.statuses = target.statuses.filter((x) => x.id !== "marked");
        log(s, "EXPLOIT · Mark + Precision", "combo");
      }
      const chain = e.damageType === "lightning" && status(target, "wet");
      if (chain) {
        target.statuses = target.statuses.filter((x) => x.id !== "wet");
        log(s, "CHAIN SHOCK · Wet + Lightning", "combo");
      }
      hurt(s, actor, target, Math.max(1, amount), depth);
      if (chain) {
        const side = isPlayer(target) ? s.players : s.enemies;
        for (const other of side)
          if (other.id !== target.id && other.hp > 0)
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
