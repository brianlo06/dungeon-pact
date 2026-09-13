import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { Effect, RunState } from "../src/shared/model";

/**
 * Command Performance, the Puppeteer's Ultimate: one enemy taken on strings
 * and spent. It is walked into the front, swung through every other enemy,
 * and left hanging open, still striking its own side. Where the Hall of
 * Mirrors turns every enemy and hurts none of them much.
 */

function fight(classes = ["beguiler", "vanguard", "ranger"]): RunState {
  let s = createRun("PUPPET", "test-command-performance");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const puppeteer = s.players[0];
  puppeteer.evolution = "bgl-puppeteer";
  puppeteer.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 3;
  }
  return s;
}

/** Where in the effect tree a status is applied: at the top, or inside a scope. */
function confusions(list: Effect[], scoped = false): boolean[] {
  return list.flatMap((e) =>
    e.kind === "enemies" || e.kind === "allies" || e.kind === "conditional"
      ? confusions(e.effects, scoped || e.kind !== "conditional")
      : e.kind === "status" && e.status === "confused"
        ? [scoped]
        : [],
  );
}

describe("Command Performance", () => {
  it("replaces the Hall of Mirrors for the Puppeteer, with its own film", () => {
    const u = ultimateFor({ heroId: "beguiler", evolution: "bgl-puppeteer" })!;
    expect(u.id).toBe("command-performance");
    expect(cinematicFor(u).id).toBe("command-performance");
    expect(ultimateFor({ heroId: "beguiler" })!.id).toBe("hall-of-mirrors");
    // What it does, not only its numbers: one body is turned, never a scope of them.
    expect(confusions(u.effects)).toEqual([false]);
  });

  it("walks the puppet into the front, swings it through its side and leaves it hanging open", () => {
    const s = fight();
    const puppeteer = s.players[0];
    const [puppet, ...others] = s.enemies.filter((e) => e.hp > 0);
    expect(others.length).toBeGreaterThan(0);
    puppet.row = "back";
    effects(s, puppeteer, puppet, ultimateFor(puppeteer)!.effects);
    expect(puppet.row).toBe("front");
    // Through armour: the puppet's guard is not taken off.
    expect(500 - puppet.hp).toBe(10 + puppeteer.power);
    expect(status(puppet, "vulnerable")).toBeDefined();
    expect(status(puppet, "confused")?.sourceId).toBe(puppeteer.id);
    // Every other enemy is struck by the swing, and nobody else is turned.
    for (const e of others) {
      expect(500 - e.hp, e.id).toBe(12 + puppeteer.power - e.guard);
      expect(status(e, "confused"), e.id).toBeUndefined();
      expect(status(e, "vulnerable"), e.id).toBeUndefined();
    }
  });

  it("drags an opening the party already made into everything the puppet hits", () => {
    const s = fight();
    const puppeteer = s.players[0];
    const [puppet, ...others] = s.enemies.filter((e) => e.hp > 0);
    applyStatus(puppet, "vulnerable", 1, 2);
    effects(s, puppeteer, puppet, ultimateFor(puppeteer)!.effects);
    // Opened after the swing lands, so the swing itself is unchanged.
    for (const e of others) {
      expect(status(e, "vulnerable"), e.id).toBeDefined();
      expect(500 - e.hp, e.id).toBe(12 + puppeteer.power - e.guard);
    }
    // An open puppet takes the strings' bite harder.
    expect(500 - puppet.hp).toBe(Math.round((10 + puppeteer.power) * 1.25));
  });

  it("resolves as an Ultimate: the film is handed the whole side, and the puppet's own blow turns", () => {
    let s = fight();
    const puppet = s.enemies.find((e) => e.hp > 0 && e.intent.ability.target !== "ally")!;
    s = reduce(s, "p0", { type: "ultimate", target: puppet.id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("command-performance");
    expect(segments[0].targets[0]).toBe(puppet.id);
    expect(segments[0].targets.length).toBe(s.enemies.filter((e) => e.hp > 0).length);
    // Later in the round the puppet strikes its own side, and nobody else does.
    const turned = beats.filter((b) => b.kind === "combo" && b.label === "BEGUILED");
    expect(turned.map((b) => b.actor)).toEqual([puppet.id]);
    // The Ultimate did not pay for itself; the turned blow pays the Beguiler afterwards.
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
    expect(s.players[0].ultimateCharge).toBeGreaterThan(0);
  });
});
