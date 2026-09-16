import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * Every Head Bowed, the Blightcaller's Ultimate: nothing for the party, and
 * the Warden's whole poison on one row — bitten through armour, Poisoned 10,
 * bent over (Weak) — with anything already Poisoned rotting through
 * (Vulnerable). Where Green Reckoning heals everyone and poisons lightly.
 */

function fight(classes = ["warden", "vanguard", "ranger"]): RunState {
  let s = createRun("BLIGHT", "test-every-head-bowed");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const warden = s.players[0];
  warden.evolution = "war-blightcaller";
  warden.ultimateCharge = ULTIMATE_MAX;
  // Two rows, known: the first two enemies in front, the rest behind.
  s.enemies.forEach((e, i) => {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 4;
    e.row = i < 2 ? "front" : "back";
  });
  return s;
}

describe("Every Head Bowed", () => {
  it("replaces Green Reckoning for the Blightcaller, with its own film", () => {
    const u = ultimateFor({ heroId: "warden", evolution: "war-blightcaller" })!;
    expect(u.id).toBe("every-head-bowed");
    expect(u.target).toBe("enemyRow");
    expect(cinematicFor(u).id).toBe("every-head-bowed");
    expect(ultimateFor({ heroId: "warden" })!.id).toBe("green-reckoning");
    // What it does, not only its numbers: it heals and cleanses nobody.
    const kinds = JSON.stringify(u.effects);
    expect(kinds).not.toContain("heal");
    expect(kinds).not.toContain("removeStatus");
    expect(kinds).not.toContain("allies");
  });

  it("bites the whole row through armour, poisons it for 10 and bends it Weak — and nothing else", () => {
    const s = fight();
    const warden = s.players[0];
    const [target, beside, ...behind] = s.enemies;
    expect(behind.length).toBeGreaterThan(0);
    const party = s.players.map((p) => p.hp);
    effects(s, warden, target, ultimateFor(warden)!.effects);
    for (const e of [target, beside]) {
      // Pierce: the row's guard does not soften the bite.
      expect(500 - e.hp, e.id).toBe(10 + warden.power);
      expect(status(e, "poison")?.stacks, e.id).toBe(10);
      expect(status(e, "poison")?.duration, e.id).toBe(3);
      expect(status(e, "weak"), e.id).toBeDefined();
      // Nothing was rotting before: nothing rots through.
      expect(status(e, "vulnerable"), e.id).toBeUndefined();
    }
    for (const e of behind) {
      expect(e.hp, e.id).toBe(500);
      expect(e.statuses, e.id).toEqual([]);
    }
    // The party is given nothing.
    expect(s.players.map((p) => p.hp)).toEqual(party);
    expect(warden.resource).toBeGreaterThanOrEqual(2);
  });

  it("rots through what was already poisoned: Vulnerable for two rounds, and the poison stacks", () => {
    const s = fight();
    const warden = s.players[0];
    const [target, beside] = s.enemies;
    applyStatus(beside, "poison", 10, 2);
    effects(s, warden, target, ultimateFor(warden)!.effects);
    expect(status(beside, "vulnerable")?.duration).toBe(2);
    expect(status(beside, "poison")?.stacks).toBe(20);
    expect(status(target, "vulnerable")).toBeUndefined();
  });

  it("resolves as an Ultimate, and its film is handed the row it bowed", () => {
    let s = fight();
    const [target, beside] = s.enemies;
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("every-head-bowed");
    expect(segments[0].targets[0]).toBe(target.id);
    expect([...segments[0].targets].sort()).toEqual([target.id, beside.id].sort());
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
