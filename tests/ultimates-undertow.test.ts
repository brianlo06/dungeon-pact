import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * Undertow, the Tidecaller's Ultimate: the sea let go. Every enemy Wet and
 * Weak, the target's WINDUP gone, and anyone already standing in the water
 * when the tide turned dragged under with it. Where Debt of Thunder spends
 * one target's Wet on a bolt and Chain Shock.
 */

function fight(classes = ["arcanist", "vanguard", "ranger"]): RunState {
  let s = createRun("TIDE", "test-undertow");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const caller = s.players[0];
  caller.evolution = "arc-tidecaller";
  caller.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 2;
    e.intent.ability = { ...e.intent.ability, interruptible: true };
  }
  return s;
}

describe("Undertow", () => {
  it("replaces Debt of Thunder for the Tidecaller, with its own film", () => {
    const u = ultimateFor({ heroId: "arcanist", evolution: "arc-tidecaller" })!;
    expect(u.id).toBe("undertow");
    expect(cinematicFor(u).id).toBe("undertow");
    expect(ultimateFor({ heroId: "arcanist" })!.id).toBe("debt-of-thunder");
    // What it does, not only its numbers: no lightning, so no Chain Shock spent.
    expect(JSON.stringify(u.effects)).not.toContain("lightning");
  });

  it("drags the whole side down: everyone Wet and Weak, the target's windup broken", () => {
    const s = fight();
    const caller = s.players[0];
    const [target, ...others] = s.enemies.filter((e) => e.hp > 0);
    effects(s, caller, target, ultimateFor(caller)!.effects);
    // The target: the sea's weight twice, through guard, and its plan gone.
    expect(500 - target.hp).toBe(10 + caller.power - 2 + (12 + caller.power - 2));
    expect(status(target, "interrupted")).toBeDefined();
    for (const e of [target, ...others]) {
      expect(status(e, "wet"), e.id).toBeDefined();
      expect(status(e, "weak"), e.id).toBeDefined();
      expect(status(e, "weak")!.duration, e.id).toBe(2);
    }
    // The rest: once, and dry ground until now, so their windups stand.
    for (const e of others) {
      expect(500 - e.hp, e.id).toBe(10 + caller.power - 2);
      expect(status(e, "interrupted"), e.id).toBeUndefined();
    }
    // Nothing is spent: the Wet is left for the party's lightning.
    expect(status(target, "wet")!.duration).toBe(3);
  });

  it("takes anyone already standing in the water under too", () => {
    const s = fight();
    const caller = s.players[0];
    const [target, soaked, dry] = s.enemies.filter((e) => e.hp > 0);
    expect(dry).toBeDefined();
    applyStatus(soaked, "wet", 1, 2);
    effects(s, caller, target, ultimateFor(caller)!.effects);
    // Already Wet: interrupted, and 6 more through armour.
    expect(500 - soaked.hp).toBe(10 + caller.power - 2 + (6 + caller.power));
    expect(status(soaked, "interrupted")).toBeDefined();
    expect(500 - dry.hp).toBe(10 + caller.power - 2);
    expect(status(dry, "interrupted")).toBeUndefined();
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
    expect(segments[0]?.def.id).toBe("undertow");
    expect(segments[0].targets[0]).toBe(target.id);
    expect(segments[0].targets.length).toBe(s.enemies.filter((e) => e.hp > 0).length);
    expect(beats.some((b) => b.kind === "combo" && b.label === "INTERRUPTED" && b.target === target.id)).toBe(true);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
