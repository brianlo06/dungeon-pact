import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor, ultimates } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * Elegy for the Standing, the Dirgesinger's Ultimate: an enemy mourned while
 * it still stands. Nothing is given to the party to swing with (no Empowered,
 * no Barrier); the enemy is made the thing the party is stronger against, for
 * three rounds, and the party's griefs are buried with it.
 */

function fight(classes = ["herald", "vanguard", "ranger"]): RunState {
  let s = createRun("SING", "test-elegy");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [{ id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true }];
  s.currentNode = "room";
  enterCombat(s);
  const singer = s.players[0];
  singer.evolution = "hrl-dirgesinger";
  singer.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 3;
  }
  return s;
}

describe("Elegy for the Standing", () => {
  it("replaces Anthem of the Unpaid for the Dirgesinger, with its own film, and sings early", () => {
    const u = ultimateFor({ heroId: "herald", evolution: "hrl-dirgesinger" })!;
    expect(u.id).toBe("elegy-for-the-standing");
    expect(cinematicFor(u).id).toBe("elegy-for-the-standing");
    expect(ultimateFor({ heroId: "herald" })!.id).toBe("anthem-of-the-unpaid");
    // What it does, not only its numbers: the party gets nothing to swing with.
    const text = JSON.stringify(u.effects);
    expect(text).not.toContain("empowered");
    expect(text).not.toContain("barrier");
    // Sung early: before every other Ultimate queued that round.
    for (const other of ultimates) if (other.id !== u.id) expect(u.speed, other.id).toBeGreaterThan(other.speed);
  });

  it("mourns the target ahead of time: Vulnerable for three rounds and Weak for two, and the first note lands on the open grave", () => {
    const s = fight();
    const singer = s.players[0];
    singer.resource = 0;
    const [target, ...others] = s.enemies.filter((e) => e.hp > 0);
    effects(s, singer, target, ultimateFor(singer)!.effects);
    expect(status(target, "vulnerable")?.duration).toBe(3);
    expect(status(target, "weak")?.duration).toBe(2);
    // Through armour, and a quarter more for the Vulnerable it laid first.
    expect(500 - target.hp).toBe(Math.round((12 + singer.power) * 1.25));
    // Nobody else is touched.
    for (const e of others) {
      expect(e.hp, e.id).toBe(500);
      expect(e.statuses, e.id).toEqual([]);
    }
    expect(singer.resource).toBe(2);
  });

  it("buries the whole party's griefs with it, the singer and the downed included", () => {
    const s = fight();
    const [singer, tank, scout] = s.players;
    applyStatus(singer, "burn", 3, 2);
    applyStatus(tank, "poison", 4, 3);
    applyStatus(tank, "weak", 1, 1);
    applyStatus(scout, "vulnerable", 1, 2);
    applyStatus(scout, "barrier", 6, 2);
    scout.hp = 0;
    scout.downedRounds = 2;
    effects(s, singer, s.enemies[0], ultimateFor(singer)!.effects);
    for (const p of s.players)
      for (const grief of ["burn", "poison", "weak", "vulnerable"] as const) expect(status(p, grief), `${p.id} ${grief}`).toBeUndefined();
    // Only griefs are buried: a Barrier is kept.
    expect(status(scout, "barrier")?.stacks).toBe(6);
    expect(scout.hp).toBe(0);
  });

  it("resolves as an Ultimate ahead of the round, and its film is handed the mourned enemy", () => {
    let s = fight();
    const target = s.enemies[0];
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("elegy-for-the-standing");
    expect(segments[0].targets).toEqual([target.id]);
    expect(beats.some((b) => b.kind === "damage" && b.target === target.id)).toBe(true);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
