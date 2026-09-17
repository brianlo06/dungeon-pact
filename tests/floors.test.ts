/**
 * Floors. A friend playtest finished the whole game at the first boss and asked
 * where the rest of it was. A run is now two floors, each ending at its own
 * boss, with the second floor built harder than the first.
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
import { FLOORS } from "../src/content/floors";
import { enemies } from "../src/content/enemies";
import { upgradeOffer } from "../src/content/upgrades";
import type { RunState } from "../src/shared/model";

function party(): RunState {
  let s = createRun("FLOORS", "floors-test");
  ["vanguard", "warden"].forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  ["vanguard", "warden"].forEach((hero, i) => {
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
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

it("starts a new run on the first of two floors", () => {
  expect(createRun("A", "a").floor).toBe(1);
  expect(FLOORS).toBe(2);
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
  s.floor = FLOORS;
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
