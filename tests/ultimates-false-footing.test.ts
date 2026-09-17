import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status, EXPLOIT } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * False Footing, the Pathfinder's Ultimate: no arrow and no Marks handed out.
 * The target's own step springs a snare (16 precision, Marked, Weak for two
 * rounds), the whole field stumbles (Weak this round), and any quarry the
 * party had already tracked goes down mid-stride (its windup broken).
 */

function fight(classes = ["ranger", "vanguard", "arcanist"]): RunState {
  let s = createRun("SNARE", "test-false-footing");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const pathfinder = s.players[0];
  pathfinder.evolution = "rng-pathfinder";
  pathfinder.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 3;
    e.intent.ability = { ...e.intent.ability, interruptible: true };
  }
  return s;
}

describe("False Footing", () => {
  it("replaces the Hundredth Mark for the Pathfinder, with its own film", () => {
    const u = ultimateFor({ heroId: "ranger", evolution: "rng-pathfinder" })!;
    expect(u.id).toBe("false-footing");
    expect(cinematicFor(u).id).toBe("false-footing");
    expect(ultimateFor({ heroId: "ranger" })!.id).toBe("hundredth-mark");
    // What it does, not only its numbers: nothing through armour, no Marks for everyone.
    const base = ultimateFor({ heroId: "ranger" })!;
    expect(JSON.stringify(u.effects)).not.toContain("pierce");
    expect(JSON.stringify(u.effects)).toContain("weak");
    expect(JSON.stringify(base.effects)).not.toContain("weak");
  });

  it("snares the target, leaves it Marked and hobbled, and makes the whole field stumble", () => {
    const s = fight();
    const pathfinder = s.players[0];
    const [target, ...others] = s.enemies.filter((e) => e.hp > 0);
    expect(others.length).toBeGreaterThan(0);
    effects(s, pathfinder, target, ultimateFor(pathfinder)!.effects);
    // Not pierce: the target's guard counts.
    expect(500 - target.hp).toBe(16 + pathfinder.power - 3);
    expect(status(target, "marked")).toBeDefined();
    expect(status(target, "weak")?.duration).toBe(2);
    // An untracked target keeps its plan.
    expect(status(target, "interrupted")).toBeUndefined();
    for (const e of others) {
      expect(500 - e.hp, e.id).toBe(Math.max(1, pathfinder.power - 3));
      expect(status(e, "weak")?.duration, e.id).toBe(1);
      // The sliver is not precision, and hands out no Marks.
      expect(status(e, "marked"), e.id).toBeUndefined();
      expect(status(e, "interrupted"), e.id).toBeUndefined();
    }
  });

  it("trips quarry the party already tracked: the target's Mark is cashed and re-laid, and Marked enemies lose their windups", () => {
    const s = fight();
    const pathfinder = s.players[0];
    const [target, tracked, untracked] = s.enemies.filter((e) => e.hp > 0);
    expect(untracked).toBeDefined();
    applyStatus(target, "marked", 1, 3);
    applyStatus(tracked, "marked", 1, 3);
    effects(s, pathfinder, target, ultimateFor(pathfinder)!.effects);
    expect(500 - target.hp).toBe(16 + pathfinder.power - 3 + EXPLOIT);
    expect(status(target, "interrupted")).toBeDefined();
    expect(status(target, "marked")).toBeDefined();
    expect(status(tracked, "interrupted")).toBeDefined();
    // The snare line never spends a Mark the party left.
    expect(status(tracked, "marked")).toBeDefined();
    expect(status(untracked, "interrupted")).toBeUndefined();
  });

  it("resolves as an Ultimate, and its film is handed the whole line", () => {
    let s = fight();
    const target = s.enemies[0];
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("false-footing");
    expect(segments[0].targets[0]).toBe(target.id);
    expect(segments[0].targets.length).toBe(s.enemies.filter((e) => e.hp > 0).length);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
