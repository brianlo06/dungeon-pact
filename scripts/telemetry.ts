import type { Enemy, RunState, Unit } from "../src/shared/model";
import { encounters } from "../src/content/encounters";
import { enemies, isObject } from "../src/content/enemies";
import { probe, type Probe } from "../src/engine/telemetry";

/**
 * What each creature and encounter does across a simulation, read from the
 * engine's telemetry probe. A mechanic that never shows up here is either
 * inert or never triggered — and before tuning numbers, check which: does the
 * bot understand it, does the encounter create the situation, and is the
 * probe counting the right thing?
 */

export interface CreatureStats {
  appearances: number;
  roundsAlive: number;
  damage: number;
  downs: number;
  statuses: Record<string, number>;
  interrupted: number;
  cracked: number;
  /** Sum of kill positions (1 = first enemy the party killed), and how many. */
  killOrder: number;
  kills: number;
  gold: number;
  drained: number;
  moved: number;
  spawned: number;
  /** Its objects broken before they came due, and those that came due. */
  broken: number;
  due: number;
}
export interface EncounterStats {
  fights: Record<number, number>;
  rounds: Record<number, number>;
  losses: Record<number, number>;
}

export const creatures = new Map<string, CreatureStats>();
export const fightsByEncounter = new Map<string, EncounterStats>();

const blank = (): CreatureStats => ({
  appearances: 0,
  roundsAlive: 0,
  damage: 0,
  downs: 0,
  statuses: {},
  interrupted: 0,
  cracked: 0,
  killOrder: 0,
  kills: 0,
  gold: 0,
  drained: 0,
  moved: 0,
  spawned: 0,
  broken: 0,
  due: 0,
});
const stats = (id: string) => {
  if (!creatures.has(id)) creatures.set(id, blank());
  return creatures.get(id)!;
};
const isEnemy = (u: Unit): u is Enemy => "definition" in u;
/** Whom an object answers to, so its work is credited to its maker. */
const credit = (s: RunState, u: Unit) => {
  if (!isEnemy(u)) return null;
  const owner = u.owner && s.enemies.find((x) => x.id === u.owner);
  return isObject(u.definition) && owner ? owner.definition : u.definition;
};

/**
 * Watches one run: call `begin` before it, `step` after every command, and
 * `end` when it is over.
 */
export function watcher(size: number) {
  let fight: { key: string; encounter: string; round: number; kills: number } | null = null;
  const sink = (s: RunState, p: Probe) => {
    if (s.phase !== "COMBAT") return;
    switch (p.kind) {
      case "hit": {
        const by = credit(s, p.actor);
        if (by && !isEnemy(p.target)) stats(by).damage += p.amount;
        break;
      }
      case "defeated": {
        if (!isEnemy(p.target) && isEnemy(p.actor)) {
          const by = credit(s, p.actor);
          if (by) stats(by).downs++;
        }
        if (isEnemy(p.target) && !isObject(p.target.definition) && !isEnemy(p.actor) && fight) {
          fight.kills++;
          const st = stats(p.target.definition);
          st.kills++;
          st.killOrder += fight.kills;
        }
        break;
      }
      case "status": {
        const by = credit(s, p.actor);
        if (by && !isEnemy(p.target)) stats(by).statuses[p.status] = (stats(by).statuses[p.status] ?? 0) + 1;
        break;
      }
      case "moved": {
        const by = credit(s, p.actor);
        if (by) stats(by).moved++;
        break;
      }
      case "spawned": {
        const by = credit(s, p.actor);
        if (by) stats(by).spawned++;
        break;
      }
      case "interrupted": {
        if (isEnemy(p.target)) stats(p.target.definition).interrupted++;
        break;
      }
      case "cracked":
        if (isEnemy(p.target)) stats(p.target.definition).cracked++;
        break;
      case "broken": {
        const by = credit(s, p.target);
        if (by) stats(by).broken++;
        break;
      }
      case "due": {
        if (isEnemy(p.unit)) {
          const by = credit(s, p.unit);
          if (by) stats(by).due++;
        } else {
          // A debt or lien comes due on a hero: credited to whoever set it,
          // named by the probe because the status itself is already gone.
          const writer = s.enemies.find((x) => x.id === p.source);
          if (writer) stats(writer.definition).due++;
        }
        break;
      }
      case "gold": {
        const by = credit(s, p.actor);
        if (by) stats(by).gold += p.amount;
        break;
      }
      case "drained": {
        const by = credit(s, p.actor);
        if (by) stats(by).drained += p.amount;
        break;
      }
    }
  };
  const nameToId = new Map(encounters.map((e) => [e.name, e.id]));
  const close = (lost: boolean) => {
    if (!fight) return;
    const e = fightsByEncounter.get(fight.encounter) ?? { fights: {}, rounds: {}, losses: {} };
    e.fights[size] = (e.fights[size] ?? 0) + 1;
    e.rounds[size] = (e.rounds[size] ?? 0) + fight.round;
    if (lost) e.losses[size] = (e.losses[size] ?? 0) + 1;
    fightsByEncounter.set(fight.encounter, e);
    fight = null;
  };
  return {
    begin() {
      probe.sink = sink;
    },
    step(s: RunState) {
      if (s.phase === "COMBAT") {
        const node = s.map.find((n) => n.id === s.currentNode);
        const key = `${s.floor ?? 1}:${s.currentNode}`;
        if (!fight || fight.key !== key) {
          close(false);
          const boss = s.enemies.find((e) => enemies.find((d) => d.id === e.definition)?.boss);
          const named = [...s.logs].reverse().find((l) => l.text.endsWith(" bars the way."));
          const encounter = boss
            ? `boss:${boss.definition}`
            : (nameToId.get(named?.text.replace(" bars the way.", "") ?? "") ??
              `${node?.type ?? "fight"}:unknown`);
          fight = { key, encounter, round: s.round, kills: 0 };
          for (const e of s.enemies)
            if (!isObject(e.definition)) stats(e.definition).appearances++;
        }
        if (s.round > fight.round) {
          for (const e of s.enemies)
            if (e.hp > 0 && !isObject(e.definition)) stats(e.definition).roundsAlive += s.round - fight.round;
          fight.round = s.round;
        }
      } else if (fight) close(s.phase === "COMPLETE" && s.outcome !== "victory");
    },
    end(s: RunState) {
      if (fight) close(s.outcome !== "victory");
      probe.sink = undefined;
    },
  };
}

const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "-");
const avg = (n: number, d: number, digits = 1) => (d ? (n / d).toFixed(digits) : "-");

export function report() {
  console.log("\nencounters (fights · avg rounds · party loss) by party size");
  const rows = [...fightsByEncounter.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [id, e] of rows) {
    const def = encounters.find((x) => x.id === id);
    const tag = def?.faction ? `${def.faction}${def.elite ? " elite" : ` t${def.tier}`}` : id.startsWith("boss:") ? "boss" : "foundry";
    const cells = [2, 3, 4]
      .map((n) => `${n}p ${String(e.fights[n] ?? 0).padStart(4)} · ${avg(e.rounds[n] ?? 0, e.fights[n] ?? 0).padStart(4)}r · ${pct(e.losses[n] ?? 0, e.fights[n] ?? 0).padStart(4)}`)
      .join("   ");
    console.log(`  ${id.padEnd(24)} ${tag.padEnd(14)} ${cells}`);
  }
  console.log("\ncreatures (per appearance unless noted)");
  console.log(
    "  " +
      ["creature", "seen", "rounds", "dmg", "downs", "killed%", "order", "int%", "moved", "spawn", "broke", "due", "gold", "statuses"]
        .map((h, i) => (i === 0 ? h.padEnd(16) : h.padStart(i === 13 ? 0 : 7)))
        .join(" "),
  );
  for (const [id, c] of [...creatures.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (!c.appearances) continue;
    const statusText = Object.entries(c.statuses)
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${k} ${avg(n, c.appearances)}`)
      .join(", ");
    console.log(
      "  " +
        [
          id.padEnd(16),
          String(c.appearances).padStart(7),
          avg(c.roundsAlive, c.appearances).padStart(7),
          avg(c.damage, c.appearances, 0).padStart(7),
          avg(c.downs, c.appearances, 2).padStart(7),
          pct(c.kills, c.appearances).padStart(7),
          avg(c.killOrder, c.kills).padStart(7),
          pct(c.interrupted, c.appearances).padStart(7),
          avg(c.moved, c.appearances).padStart(7),
          avg(c.spawned, c.appearances).padStart(7),
          avg(c.broken, c.appearances).padStart(7),
          avg(c.due, c.appearances).padStart(7),
          avg(c.gold, c.appearances, 0).padStart(7),
          ` ${statusText}`,
        ].join(" "),
    );
  }
}
