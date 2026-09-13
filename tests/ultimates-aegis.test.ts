import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { effects, status, WEAK } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import type { RunState } from "../src/shared/model";

/**
 * Breakwater, the Aegis Knight's Ultimate: the fortress is the Knight's own
 * body. It draws every ally's next hit onto itself, blunts every enemy's
 * blows and answers one enemy — where the Lantern Wall wards each ally and
 * charges.
 */

function fight(classes = ["vanguard", "arcanist", "ranger"]): RunState {
  let s = createRun("AEGIS", "test-aegis");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const knight = s.players[0];
  knight.evolution = "van-aegis";
  knight.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
  }
  return s;
}

describe("Breakwater", () => {
  it("replaces the Lantern Wall for the Aegis Knight, with its own film", () => {
    const u = ultimateFor({ heroId: "vanguard", evolution: "van-aegis" })!;
    expect(u.id).toBe("breakwater");
    expect(cinematicFor(u).id).toBe("breakwater");
    expect(ultimateFor({ heroId: "vanguard" })!.id).toBe("lantern-wall");
  });

  it("draws every ally's next hit onto the Knight, and pays for it in the Knight's Barrier alone", () => {
    const s = fight();
    const [knight, ...allies] = s.players;
    const target = s.enemies[0];
    effects(s, knight, target, ultimateFor(knight)!.effects);
    for (const ally of allies) {
      expect(status(ally, "guarded")?.sourceId).toBe(knight.id);
      // Unlike the Lantern Wall, no ally is warded: the wall is the Knight.
      expect(status(ally, "barrier")).toBeUndefined();
    }
    expect(status(knight, "barrier")?.stacks).toBe(14 + 10 * allies.length);
    expect(knight.row).toBe("front");
  });

  it("blunts every enemy, hits each back, and answers the chosen one in full", () => {
    const s = fight();
    const knight = s.players[0];
    const [target, ...others] = s.enemies.filter((e) => e.hp > 0);
    expect(others.length).toBeGreaterThan(0);
    effects(s, knight, target, ultimateFor(knight)!.effects);
    for (const e of [target, ...others]) {
      expect(status(e, "weak"), e.id).toBeDefined();
      expect(e.hp, e.id).toBeLessThan(500);
    }
    expect(status(target, "vulnerable")).toBeDefined();
    for (const e of others) expect(status(e, "vulnerable"), e.id).toBeUndefined();
    const least = Math.min(...others.map((e) => 500 - e.hp));
    expect(500 - target.hp).toBeGreaterThan(least + 10);
  });

  it("lets a blow meant for an ally break on the Knight, weakened", () => {
    const s = fight();
    const [knight, mage] = s.players;
    const enemy = s.enemies[0];
    effects(s, knight, enemy, ultimateFor(knight)!.effects);
    knight.statuses = knight.statuses.filter((x) => x.id !== "barrier");
    const mageHp = mage.hp;
    const knightHp = knight.hp;
    effects(s, enemy, mage, [{ kind: "damage", amount: 30 }]);
    expect(mage.hp).toBe(mageHp);
    const expected = Math.max(1, Math.round((30 + enemy.power) * WEAK - knight.guard));
    expect(knightHp - knight.hp).toBe(expected);
    // One hit only: the next one reaches the ally.
    effects(s, enemy, mage, [{ kind: "damage", amount: 30 }]);
    expect(mage.hp).toBeLessThan(mageHp);
  });

  it("resolves through the round as an Ultimate, and the Weak lasts the round only", () => {
    let s = fight();
    const target = s.enemies[0];
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const cast = beats.find((b) => b.ultimate === "breakwater");
    expect(cast?.target).toBe(target.id);
    expect(beats.some((b) => b.kind === "ward" && b.target === "p0")).toBe(true);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
    for (const e of s.enemies) expect(status(e, "weak")).toBeUndefined();
    expect(status(s.enemies.find((e) => e.id === target.id)!, "vulnerable")).toBeDefined();
  });
});
