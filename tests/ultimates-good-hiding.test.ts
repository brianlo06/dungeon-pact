import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { effects, status, WEAK } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * A Good Hiding, the Ironhide's Ultimate: no blood paid, nothing through
 * armour, no row. The enemy's strength goes into the hide (Weak for two
 * rounds), the hide keeps it (Barrier), and it comes back out Empowered.
 * Where Red Ledger pays 14 HP for 40 through armour and 12 to the row.
 */

function fight(classes = ["reaver", "vanguard", "ranger"]): RunState {
  let s = createRun("HIDE", "test-good-hiding");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [{ id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true }];
  s.currentNode = "room";
  enterCombat(s);
  const hide = s.players[0];
  hide.evolution = "rvr-ironhide";
  hide.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 3;
  }
  return s;
}

describe("A Good Hiding", () => {
  it("replaces Red Ledger for the Ironhide, with its own film, and pays no blood", () => {
    const u = ultimateFor({ heroId: "reaver", evolution: "rvr-ironhide" })!;
    expect(u.id).toBe("good-hiding");
    expect(cinematicFor(u).id).toBe("good-hiding");
    expect(ultimateFor({ heroId: "reaver" })!.id).toBe("red-ledger");
    // What it does, not only its numbers: no price in HP, nothing through armour, no row.
    expect(u.effects.some((e) => e.kind === "damage" && (e.self || e.pierce))).toBe(false);
    expect(u.effects.some((e) => e.kind === "enemies" || e.kind === "allies")).toBe(false);
  });

  it("takes the target's strength and keeps it: Weak for two rounds, Barrier, Empowered, and the blow back", () => {
    const s = fight();
    const hide = s.players[0];
    const [target, other] = s.enemies.filter((e) => e.hp > 0);
    const hp = hide.hp;
    effects(s, hide, target, ultimateFor(hide)!.effects);
    expect(hide.hp).toBe(hp);
    expect(status(target, "weak")?.duration).toBe(2);
    expect(status(hide, "barrier")?.stacks).toBe(16);
    expect(status(hide, "empowered")?.duration).toBe(1);
    // The blow is Empowered, and it does not go through armour.
    expect(500 - target.hp).toBe(Math.round((12 + hide.power) * 1.3 - target.guard));
    expect(other.hp).toBe(500);
    expect(status(other, "weak")).toBeUndefined();
  });

  it("blunts the target's blows at the party this round and next", () => {
    const s = fight();
    const hide = s.players[0];
    const [target] = s.enemies.filter((e) => e.hp > 0);
    effects(s, hide, target, ultimateFor(hide)!.effects);
    const ally = s.players[1];
    const before = ally.hp;
    effects(s, target, ally, [{ kind: "damage", amount: 20 }]);
    const taken = before - ally.hp;
    expect(taken).toBe(Math.max(1, Math.round((20 + target.power) * WEAK - ally.guard)));
  });

  it("resolves as an Ultimate, shows its Barrier as a ward, and hands the film its one target", () => {
    let s = fight();
    const target = s.enemies[0];
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("good-hiding");
    expect(segments[0].targets).toEqual([target.id]);
    expect(segments[0].beats.some((b) => b.kind === "ward" && b.target === "p0")).toBe(true);
    expect(segments[0].beats.some((b) => b.kind === "damage" && b.target === target.id)).toBe(true);
    // Weak lasts into the next round.
    expect(status(s.enemies[0], "weak")).toBeDefined();
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
