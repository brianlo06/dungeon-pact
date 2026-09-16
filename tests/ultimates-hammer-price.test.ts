import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * Hammer Price, the Magnate's Ultimate: a purchase, not a seizure. The party
 * pays 40 gold (nothing for an enemy that is already Vulnerable), the target's
 * windup is broken and it takes 36 through armour and is left Vulnerable, and
 * every other enemy is outbid and Weak this round. Where Foreclosure strips a
 * guard, banks gold and hands out Barrier.
 */

function fight(classes = ["broker", "vanguard", "warden"]): RunState {
  let s = createRun("HAMR", "test-hammer-price");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const magnate = s.players[0];
  magnate.evolution = "brk-magnate";
  magnate.ultimateCharge = ULTIMATE_MAX;
  s.gold = 200;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 3;
    e.intent.ability = { ...e.intent.ability, interruptible: true };
  }
  return s;
}

describe("Hammer Price", () => {
  it("replaces Foreclosure for the Magnate, and pays instead of earning", () => {
    const u = ultimateFor({ heroId: "broker", evolution: "brk-magnate" })!;
    expect(u.id).toBe("hammer-price");
    expect(cinematicFor(u).id).toBe("hammer-price");
    expect(ultimateFor({ heroId: "broker" })!.id).toBe("foreclosure");
    // What it does, not only its numbers: nothing stripped, nobody shielded.
    const kinds = JSON.stringify(u.effects);
    expect(kinds).not.toContain("removeStatus");
    expect(kinds).not.toContain("barrier");
    expect(kinds).toContain("interrupt");
  });

  it("buys the target's move and breaks it: 40 gold, the windup, 36 through armour, Vulnerable; the room Weak", () => {
    const s = fight();
    const magnate = s.players[0];
    const [target, ...others] = s.enemies.filter((e) => e.hp > 0);
    expect(others.length).toBeGreaterThan(0);
    magnate.resource = 0;
    const credit = magnate.resource;
    effects(s, magnate, target, ultimateFor(magnate)!.effects);
    expect(s.gold).toBe(160);
    expect(status(target, "interrupted")).toBeDefined();
    // Through armour: the target's Guard of 3 takes nothing off.
    expect(500 - target.hp).toBe(36 + magnate.power);
    expect(status(target, "vulnerable")?.duration).toBe(2);
    // Outbid, not struck: every other enemy is Weak this round and unhurt.
    for (const e of others) {
      expect(status(e, "weak")?.duration, e.id).toBe(1);
      expect(e.hp, e.id).toBe(500);
      expect(status(e, "interrupted"), e.id).toBeUndefined();
    }
    expect(status(target, "weak")).toBeUndefined();
    expect(magnate.resource - credit).toBe(2);
    // Nobody on the party side is touched.
    for (const p of s.players) expect(status(p, "barrier"), p.id).toBeUndefined();
  });

  it("buys a distressed asset for nothing: an enemy already Vulnerable costs no gold, and takes more", () => {
    const s = fight();
    const magnate = s.players[0];
    const [target] = s.enemies.filter((e) => e.hp > 0);
    applyStatus(target, "vulnerable", 1, 2);
    effects(s, magnate, target, ultimateFor(magnate)!.effects);
    expect(s.gold).toBe(200);
    expect(500 - target.hp).toBe(Math.round((36 + magnate.power) * 1.25));
  });

  it("is never refused for a short treasury: it takes what there is and still lands", () => {
    const s = fight();
    const magnate = s.players[0];
    s.gold = 15;
    const [target] = s.enemies.filter((e) => e.hp > 0);
    effects(s, magnate, target, ultimateFor(magnate)!.effects);
    expect(s.gold).toBe(0);
    expect(500 - target.hp).toBe(36 + magnate.power);
  });

  it("resolves as an Ultimate: the film is handed the target, and the room stays Weak through the round", () => {
    let s = fight();
    const targetId = s.enemies.find((e) => e.hp > 0)!.id;
    s = reduce(s, "p0", { type: "ultimate", target: targetId }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("hammer-price");
    expect(segments[0].targets).toEqual([targetId]);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
    expect(segments[0].beats.some((b) => b.kind === "damage" && b.target === targetId)).toBe(true);
  });
});
