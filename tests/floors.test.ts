/**
 * Floors. A friend playtest finished the whole game at the first boss and asked
 * where the rest of it was. A run became two floors, each ending at its own
 * boss, with the second floor built harder than the first; with boss pools it
 * is three, each drawing its boss from a pool of its own.
 *
 * `party()` is a room from before boss pools, so the two-floor rules stay
 * pinned; `pooled()` is one with them.
 */
import { BOSS_PRICING } from "../src/content/ultimates";
import { expect, it } from "vitest";
import { createRun, addPlayer, reduce } from "../src/engine/game";
import {
  BOSS_BASE,
  BOSS_PER_HERO,
  enterCombat,
  floorScale,
  resolveRound,
} from "../src/engine/combat";
import { generateMap } from "../src/engine/map";
import {
  FLOORS,
  LEGACY_FLOORS,
  floors,
  floorsIn,
} from "../src/content/floors";
import { enemies } from "../src/content/enemies";
import { upgradeOffer } from "../src/content/upgrades";
import type { RunState } from "../src/shared/model";

function party(): RunState {
  let s = createRun("FLOORS", "floors-test");
  ["vanguard", "warden"].forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  ["vanguard", "warden"].forEach((hero, i) => {
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  delete s.bossVersion;
  return s;
}

/** The same party in a room with boss pools. */
function pooled(seed = "floors-test"): RunState {
  const s = party();
  s.seed = seed;
  s.bossVersion = 1;
  return s;
}

/** Stand the party in this floor's boss chamber and fight it. */
function atBoss(s: RunState) {
  s.map = generateMap(s);
  const boss = s.map.find((n) => n.type === "boss")!;
  s.currentNode = boss.id;
  boss.visited = true;
  enterCombat(s, true);
  return s;
}

/** Fell every enemy and let the round resolve, as the last blow would. */
function win(s: RunState) {
  for (const e of s.enemies) e.hp = 0;
  s.plans = {};
  resolveRound(s);
  return s;
}

it("starts a new run on the first floor", () => {
  expect(createRun("A", "a").floor).toBe(1);
  expect(FLOORS).toBe(3);
  expect(LEGACY_FLOORS).toBe(2);
  expect(floorsIn(party())).toBe(2);
  expect(floorsIn(pooled())).toBe(3);
});

it("puts the Collector under floor one and the Miser under floor two", () => {
  const one = atBoss(party());
  expect(one.enemies[0].definition).toBe("collector");
  const two = party();
  two.floor = 2;
  atBoss(two);
  expect(two.enemies[0].definition).toBe("miser");
});

it("does not end the run at floor one's boss; it descends instead", () => {
  let s = win(atBoss(party()));
  expect(s.phase).not.toBe("COMPLETE");
  expect(s.outcome).toBeNull();
  // Whatever the branch upgrade asks, the party comes out the other side at
  // the reward, and leaving it is the way down.
  for (const p of s.players) {
    if (s.phase !== "UPGRADE" || s.votes[p.id]) continue;
    const branch = upgradeOffer(p)[0];
    s = reduce(s, p.id, { type: "upgrade", choice: branch.id }, 0);
  }
  expect(s.phase).toBe("REWARD");
  s = reduce(s, "p0", { type: "continue" }, 0);
  expect(s.floor).toBe(2);
  expect(s.phase).toBe("MAP");
  expect(s.currentNode).toBeNull();
  // A fresh route, nothing on it walked yet, in the Cistern.
  expect(s.map.every((n) => !n.visited)).toBe(true);
  expect(s.map.find((n) => n.depth === 0)!.biome).toBe("cistern");
});

it("ends the run in victory at the last floor's boss", () => {
  const s = party();
  s.floor = LEGACY_FLOORS;
  win(atBoss(s));
  expect(s.phase).toBe("COMPLETE");
  expect(s.outcome).toBe("victory");
});

it("builds floor two's enemies a quarter harder", () => {
  expect(floorScale({ floor: 1 })).toBe(1);
  expect(floorScale({ floor: 2 })).toBe(1.25);
  const s = party();
  s.floor = 2;
  atBoss(s);
  const miser = enemies.find((d) => d.id === "miser")!;
  // The boss weighting, exactly as `enterCombat` applies it, then the floor.
  const duo = BOSS_BASE + s.players.length * BOSS_PER_HERO;
  // A room with Ultimates prices its bosses for them (see `BOSS_PRICING`).
  const priced = s.ultimateVersion === 1 ? BOSS_PRICING.hp : 1;
  expect(s.enemies[0].maxHp).toBe(Math.round(miser.hp * duo * 1.25 * priced));
  expect(s.enemies[0].power).toBe(Math.round(miser.power * 1.25));
});

it("leaves a run that began before floors on its single route", () => {
  const s = party();
  delete s.floor;
  win(atBoss(s));
  expect(s.phase).toBe("COMPLETE");
  expect(s.outcome).toBe("victory");
});

/**
 * A room from before boss pools draws exactly what it drew then: the same
 * chambers, names, regions and mentor, and the dice left in the same place,
 * so a party mid-run meets the floor it would have. Recorded from the code at
 * 0b86568, before pools existed.
 */
it("builds an older room's floors exactly as it did before boss pools", () => {
  const golden: [string, number, number][] = [
    ["golden-a", 1, 14330804],
    ["golden-a", 2, 3760991522],
    ["golden-b", 1, 4015497831],
    ["golden-b", 2, 2020782762],
  ];
  for (const [seed, floor, rng] of golden) {
    const s = createRun("G", seed);
    delete s.bossVersion;
    s.floor = floor;
    const map = generateMap(s);
    expect(s.rng, `${seed} floor ${floor}`).toBe(rng);
    expect(map.every((n) => n.boss === undefined)).toBe(true);
    if (seed === "golden-a" && floor === 2)
      expect(
        map
          .map((n) => `${n.id}:${n.type}:${n.name}:${n.biome}:${n.tier ?? ""}`)
          .join("|"),
      ).toBe(
        "0-0:combat:The Sunken Pump:cistern:|1-0:mystery:Salvager’s Counter:cistern:|1-1:toll:The Floodgate Levy:cistern:|2-0:combat:The Crucible:cistern:|2-1:event:The Diving Bell:cistern:|2-2:mentor:The Reliquary:cistern:2|3-0:elite:The Foreclosure Procession:archive:|3-1:event:The Unclaimed Will:archive:|4-0:camp:The Silent Reading Room:archive:|5-0:boss:The Counting House:archive:",
      );
  }
});

it("draws each floor's boss from its own pool, and the chamber and the fight agree", () => {
  floors.forEach((def, i) => {
    if (!def.bosses.length) return;
    const met = new Set<string>();
    for (let seed = 0; seed < 24; seed++) {
      const s = pooled(`pool-${seed}`);
      s.rng = seed * 2654435761;
      s.floor = i + 1;
      atBoss(s);
      const node = s.map.find((n) => n.type === "boss")!;
      expect(def.bosses).toContain(node.boss);
      const boss = enemies.find((d) => d.id === node.boss)!;
      expect(node.name).toBe(boss.lair);
      expect(s.enemies[0].definition).toBe(node.boss);
      met.add(node.boss!);
    }
    // Every boss a floor lists turns up in some run.
    expect([...met].sort()).toEqual([...def.bosses].sort());
  });
});

it("stands each pooled floor in one region, with its own mentor", () => {
  floors.forEach((def, i) => {
    const s = pooled();
    s.floor = i + 1;
    if (!def.bosses.length) return;
    const map = generateMap(s);
    expect(map.every((n) => n.biome === def.biome)).toBe(true);
    for (const n of map.filter((n) => n.type === "mentor"))
      expect(n.tier).toBe(def.tier);
  });
});

it("gives every floor a different region, mentor and boss", () => {
  expect(new Set(floors.map((f) => f.biome)).size).toBe(floors.length);
  expect(new Set(floors.map((f) => f.tier)).size).toBe(floors.length);
  const all = floors.flatMap((f) => f.bosses);
  expect(new Set(all).size).toBe(all.length);
});

it("descends past floor two when the room has boss pools", () => {
  const s = pooled();
  s.floor = 2;
  win(atBoss(s));
  expect(s.phase).not.toBe("COMPLETE");
  expect(s.outcome).toBeNull();
});
