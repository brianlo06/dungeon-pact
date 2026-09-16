import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * Give and Take, the Bloodbound's Ultimate: a pact sworn on the cleaver, so
 * the blade runs both ways. Blood out (12 HP), into the enemy under its armour
 * (30 through armour), blood back (26, and 12 more from an enemy the party had
 * already opened), and both parties left open. Where Red Ledger pays 14 HP for
 * 40 through armour and 12 to the row, and always leaves the Reaver down.
 */

function fight(classes = ["reaver", "vanguard", "ranger"]): RunState {
  let s = createRun("GIVE", "test-give-and-take");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [{ id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true }];
  s.currentNode = "room";
  enterCombat(s);
  const reaver = s.players[0];
  reaver.evolution = "rvr-bloodbound";
  reaver.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 3;
  }
  return s;
}

describe("Give and Take", () => {
  it("replaces Red Ledger for the Bloodbound, with its own film, and strikes no row", () => {
    const u = ultimateFor({ heroId: "reaver", evolution: "rvr-bloodbound" })!;
    expect(u.id).toBe("give-and-take");
    expect(cinematicFor(u).id).toBe("give-and-take");
    expect(ultimateFor({ heroId: "reaver" })!.id).toBe("red-ledger");
    // What it does, not only its numbers: blood comes back, and nothing reaches past the target.
    expect(u.effects.some((e) => e.kind === "heal" && e.self)).toBe(true);
    expect(u.effects.some((e) => e.kind === "enemies" || e.kind === "allies")).toBe(false);
  });

  it("pays, cuts through armour, takes back more than it paid, and leaves both of them open", () => {
    const s = fight();
    const reaver = s.players[0];
    const [target, other] = s.enemies.filter((e) => e.hp > 0);
    reaver.hp = 60;
    effects(s, reaver, target, ultimateFor(reaver)!.effects);
    // −12, then +26.
    expect(reaver.hp).toBe(74);
    // Through armour: the target's guard does not count.
    expect(500 - target.hp).toBe(30 + reaver.power);
    expect(status(target, "vulnerable")?.duration).toBe(2);
    expect(status(reaver, "vulnerable")?.duration).toBe(1);
    expect(other.hp).toBe(500);
    expect(status(other, "vulnerable")).toBeUndefined();
  });

  it("takes back more from an enemy the party had already opened", () => {
    const s = fight();
    const reaver = s.players[0];
    const [target] = s.enemies.filter((e) => e.hp > 0);
    applyStatus(target, "vulnerable", 1, 2);
    reaver.hp = 60;
    effects(s, reaver, target, ultimateFor(reaver)!.effects);
    expect(reaver.hp).toBe(60 - 12 + 12 + 26);
    // The cut itself lands a quarter harder on the open enemy.
    expect(500 - target.hp).toBeGreaterThan(30 + reaver.power);
  });

  it("resolves as an Ultimate, reveals the blood coming back as healing, and hands the film its one target", () => {
    let s = fight();
    const target = s.enemies[0];
    s.players[0].hp = 60;
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("give-and-take");
    expect(segments[0].targets).toEqual([target.id]);
    const own = segments[0].beats;
    expect(own.some((b) => b.kind === "damage" && b.target === "p0" && b.amount === 12)).toBe(true);
    expect(own.some((b) => b.kind === "damage" && b.target === target.id)).toBe(true);
    expect(own.some((b) => b.kind === "heal" && b.target === "p0" && b.amount === 26)).toBe(true);
    // The enemy stays open into the next round.
    expect(status(s.enemies[0], "vulnerable")).toBeDefined();
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
