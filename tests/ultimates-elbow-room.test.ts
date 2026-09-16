import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import { reachError } from "../src/shared/reach";
import type { Ability, RunState } from "../src/shared/model";

/**
 * Elbow Room, the Butcher's Ultimate: one swing wider than the street. Every
 * enemy in the chosen row takes 30 and is knocked into the back line; any of
 * them already Vulnerable loses its windup. Nothing is paid, nothing goes
 * through armour, and nothing outside the row is touched. Where Red Ledger
 * pays 14 HP for 40 through armour on one enemy and 12 on the rest.
 */

function fight(classes = ["reaver", "vanguard", "warden"]): RunState {
  let s = createRun("ELBW", "test-elbow-room");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [{ id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true }];
  s.currentNode = "room";
  enterCombat(s);
  const butcher = s.players[0];
  butcher.evolution = "rvr-butcher";
  butcher.ultimateCharge = ULTIMATE_MAX;
  s.enemies.forEach((e, i) => {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 3;
    // Two in front, the rest behind.
    e.row = i < 2 ? "front" : "back";
    e.intent.ability = { ...e.intent.ability, interruptible: true };
  });
  return s;
}

describe("Elbow Room", () => {
  it("replaces Red Ledger for the Butcher, and pays nothing for it", () => {
    const u = ultimateFor({ heroId: "reaver", evolution: "rvr-butcher" })!;
    expect(u.id).toBe("elbow-room");
    expect(u.target).toBe("enemyRow");
    expect(cinematicFor(u).id).toBe("elbow-room");
    expect(ultimateFor({ heroId: "reaver" })!.id).toBe("red-ledger");
    const json = JSON.stringify(u.effects);
    expect(json).not.toContain('"self":true');
    expect(json).not.toContain("pierce");
  });

  it("sweeps the whole row alike, knocks it into the back line, and touches nothing else", () => {
    const s = fight();
    const butcher = s.players[0];
    const hpBefore = butcher.hp;
    butcher.resource = 0;
    const front = s.enemies.filter((e) => e.row === "front");
    const back = s.enemies.filter((e) => e.row === "back");
    expect(front.length).toBe(2);
    effects(s, butcher, front[0], ultimateFor(butcher)!.effects);
    for (const e of front) {
      // Not through armour: the Guard of 3 comes off.
      expect(500 - e.hp, e.id).toBe(30 + butcher.power - 3);
      expect(e.row, e.id).toBe("back");
      // Nobody was open, so no windup is broken.
      expect(status(e, "interrupted"), e.id).toBeUndefined();
    }
    for (const e of back) expect(e.hp, e.id).toBe(500);
    expect(butcher.hp).toBe(hpBefore);
    expect(butcher.resource).toBe(2);
  });

  it("makes room: with the front swept back, a melee hero can reach the back row", () => {
    const s = fight();
    s.reachVersion = 1;
    const butcher = s.players[0];
    const vanguard = s.players[1];
    const [front] = s.enemies.filter((e) => e.row === "front");
    const back = s.enemies.find((e) => e.row === "back")!;
    const melee = { id: "strike", name: "Strike", description: "", target: "enemy", effects: [], reach: "melee" } as unknown as Ability;
    expect(reachError(s, vanguard, melee, back)).toBeDefined();
    effects(s, butcher, front, ultimateFor(butcher)!.effects);
    expect(reachError(s, vanguard, melee, back)).toBeUndefined();
  });

  it("knocks an enemy the party already opened off its feet: WINDUP broken, and the blow a quarter harder", () => {
    const s = fight();
    const butcher = s.players[0];
    const [open, shut] = s.enemies.filter((e) => e.row === "front");
    applyStatus(open, "vulnerable", 1, 2);
    effects(s, butcher, shut, ultimateFor(butcher)!.effects);
    expect(status(open, "interrupted")).toBeDefined();
    expect(status(shut, "interrupted")).toBeUndefined();
    expect(500 - open.hp).toBe(Math.round((30 + butcher.power - 3) * 1.25));
  });

  it("resolves as an Ultimate: the film is handed the whole row and a damage beat on each", () => {
    let s = fight();
    const front = s.enemies.filter((e) => e.row === "front").map((e) => e.id);
    s = reduce(s, "p0", { type: "ultimate", target: front[0] }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("elbow-room");
    expect([...segments[0].targets].sort()).toEqual([...front].sort());
    for (const id of front)
      expect(segments[0].beats.some((b) => b.kind === "damage" && b.target === id), id).toBe(true);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
