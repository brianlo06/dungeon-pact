import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * The Open Mind, the Mindflayer's Ultimate: no lie, no turned line. One
 * thought straight through a mind, through armour, breaking its windup and
 * leaving it open, and on through every other enemy, holing the minds the
 * party has already opened. Where the Hall of Mirrors confuses everyone.
 */

function fight(classes = ["beguiler", "vanguard", "ranger"]): RunState {
  let s = createRun("MIND", "test-open-mind");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const flayer = s.players[0];
  flayer.evolution = "bgl-mindflayer";
  flayer.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 3;
    e.intent.ability = { ...e.intent.ability, interruptible: true };
  }
  return s;
}

describe("The Open Mind", () => {
  it("replaces the Hall of Mirrors for the Mindflayer, with its own film", () => {
    const u = ultimateFor({ heroId: "beguiler", evolution: "bgl-mindflayer" })!;
    expect(u.id).toBe("open-mind");
    expect(cinematicFor(u).id).toBe("open-mind");
    expect(ultimateFor({ heroId: "beguiler" })!.id).toBe("hall-of-mirrors");
    // What it does, not only its numbers: nobody is turned.
    const kinds = JSON.stringify(u.effects);
    expect(kinds).not.toContain("confused");
  });

  it("goes through the target's armour, breaks its windup and leaves it open", () => {
    const s = fight();
    const flayer = s.players[0];
    const [target, ...others] = s.enemies.filter((e) => e.hp > 0);
    effects(s, flayer, target, ultimateFor(flayer)!.effects);
    // Pierce: the target's guard is not taken off.
    expect(500 - target.hp).toBe(24 + flayer.power);
    expect(status(target, "interrupted")).toBeDefined();
    expect(status(target, "vulnerable")).toBeDefined();
    // Closed minds: the passing sliver only, no windup broken, nothing opened.
    for (const e of others) {
      expect(500 - e.hp, e.id).toBe(flayer.power);
      expect(status(e, "interrupted"), e.id).toBeUndefined();
      expect(status(e, "vulnerable"), e.id).toBeUndefined();
    }
  });

  it("holes every mind the party already opened, and breaks its windup too", () => {
    const s = fight();
    const flayer = s.players[0];
    const [target, opened, closed] = s.enemies.filter((e) => e.hp > 0);
    expect(closed).toBeDefined();
    applyStatus(opened, "vulnerable", 1, 2);
    effects(s, flayer, target, ultimateFor(flayer)!.effects);
    const open = 500 - opened.hp;
    const shut = 500 - closed.hp;
    expect(open).toBeGreaterThan(shut * 3);
    expect(status(opened, "interrupted")).toBeDefined();
    expect(status(closed, "interrupted")).toBeUndefined();
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
    expect(segments[0]?.def.id).toBe("open-mind");
    expect(segments[0].targets[0]).toBe(target.id);
    expect(segments[0].targets.length).toBe(s.enemies.filter((e) => e.hp > 0).length);
    expect(beats.some((b) => b.kind === "combo" && b.label === "INTERRUPTED" && b.target === target.id)).toBe(true);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
