import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status, EXPLOIT } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor, ultimates } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * Sunblind, the Gloomstalker's Ultimate: a volley out of the sun. Every enemy
 * is Vulnerable this round; the chosen row is Vulnerable for two rounds
 * before 18 precision strikes each enemy in it (cashing any Mark); +2 Focus;
 * and it resolves before every other Ultimate.
 */

function fight(classes = ["ranger", "vanguard", "arcanist"]): RunState {
  let s = createRun("GLARE", "test-sunblind");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const stalker = s.players[0];
  stalker.evolution = "rng-gloomstalker";
  stalker.ultimateCharge = ULTIMATE_MAX;
  stalker.resource = 0;
  // Three enemies: two in the front row, one behind.
  s.enemies.forEach((e, i) => {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 2;
    e.row = i === s.enemies.length - 1 ? "back" : "front";
  });
  return s;
}

describe("Sunblind", () => {
  it("replaces the Hundredth Mark for the Gloomstalker, with its own film", () => {
    const u = ultimateFor({ heroId: "ranger", evolution: "rng-gloomstalker" })!;
    expect(u.id).toBe("sunblind");
    expect(u.target).toBe("enemyRow");
    expect(cinematicFor(u).id).toBe("sunblind");
    expect(ultimateFor({ heroId: "ranger" })!.id).toBe("hundredth-mark");
    // What it does, not only its numbers: no Marks laid, nothing through armour.
    const text = JSON.stringify(u.effects);
    expect(text).not.toContain("marked");
    expect(text).not.toContain("pierce");
    expect(text).not.toContain("weak");
    expect(text).not.toContain("interrupt");
    // The fastest Ultimate there is.
    expect(Math.max(...ultimates.filter((x) => x.id !== u.id).map((x) => x.speed))).toBeLessThan(u.speed);
  });

  it("opens the row before the volley lands, strikes every enemy in it, and leaves the rest of the side open this round", () => {
    const s = fight();
    const stalker = s.players[0];
    const front = s.enemies.filter((e) => e.row === "front");
    const back = s.enemies.filter((e) => e.row === "back");
    expect(front.length).toBeGreaterThan(1);
    expect(back.length).toBeGreaterThan(0);
    effects(s, stalker, front[0], ultimateFor(stalker)!.effects);
    // Vulnerable before the hit: the volley itself lands a quarter harder.
    const hit = Math.round((18 + stalker.power - 2) * 1.25);
    for (const e of front) {
      expect(500 - e.hp, e.id).toBe(hit);
      expect(status(e, "vulnerable")?.duration, e.id).toBe(2);
    }
    for (const e of back) {
      expect(e.hp, e.id).toBe(500);
      expect(status(e, "vulnerable")?.duration, e.id).toBe(1);
    }
    expect(stalker.resource).toBe(2);
  });

  it("cashes every Mark the party left in the row, and lays none", () => {
    const s = fight();
    const stalker = s.players[0];
    const [a, b] = s.enemies.filter((e) => e.row === "front");
    const back = s.enemies.find((e) => e.row === "back")!;
    applyStatus(a, "marked", 1, 3);
    applyStatus(b, "marked", 1, 3);
    applyStatus(back, "marked", 1, 3);
    effects(s, stalker, a, ultimateFor(stalker)!.effects);
    // Vulnerable multiplies the volley; the Exploit is added on top.
    const exploited = Math.round((18 + stalker.power - 2) * 1.25 + EXPLOIT);
    for (const e of [a, b]) {
      expect(500 - e.hp, e.id).toBe(exploited);
      expect(status(e, "marked"), e.id).toBeUndefined();
    }
    // Out of the row: its Mark is still there for the party.
    expect(status(back, "marked")).toBeDefined();
  });

  it("resolves before every other Ultimate, and its film is handed the whole row", () => {
    let s = fight(["arcanist", "ranger", "vanguard"]);
    // The Gloomstalker is the second hero here, so order is not seat order.
    s.players[0].evolution = undefined;
    s.players[0].ultimateCharge = ULTIMATE_MAX;
    const stalker = s.players[1];
    stalker.evolution = "rng-gloomstalker";
    stalker.ultimateCharge = ULTIMATE_MAX;
    s.players[2].ultimateCharge = 0;
    s.enemies.forEach((e, i) => {
      e.hp = 500;
      e.maxHp = 500;
      e.row = i === s.enemies.length - 1 ? "back" : "front";
    });
    const target = s.enemies[0];
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s = reduce(s, "p1", { type: "ultimate", target: target.id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments.map((x) => x.def.id)).toEqual(["sunblind", "debt-of-thunder"]);
    const row = s.enemies.filter((e) => e.row === target.row).map((e) => e.id);
    expect(segments[0].targets[0]).toBe(target.id);
    expect([...segments[0].targets].sort()).toEqual([...row].sort());
    expect(s.players[1].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
