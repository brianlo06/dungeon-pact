import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * Eyespot, the Illusionist's Ultimate: nobody is turned. The target lunges at
 * a robe of moths and is carried into the front line, cut from behind through
 * its armour and left Vulnerable; every enemy is Weak this round; and the
 * Illusionist is somewhere else, behind Barrier. Where the Hall of Mirrors
 * confuses everyone.
 */

function fight(classes = ["beguiler", "vanguard", "ranger"]): RunState {
  let s = createRun("EYESPOT", "test-eyespot");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const illusionist = s.players[0];
  illusionist.evolution = "bgl-illusionist";
  illusionist.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 3;
  }
  return s;
}

describe("Eyespot", () => {
  it("replaces the Hall of Mirrors for the Illusionist, with its own film", () => {
    const u = ultimateFor({ heroId: "beguiler", evolution: "bgl-illusionist" })!;
    expect(u.id).toBe("eyespot");
    expect(cinematicFor(u).id).toBe("eyespot");
    expect(ultimateFor({ heroId: "beguiler" })!.id).toBe("hall-of-mirrors");
    // What it does, not only its numbers: nobody is turned, nobody's plan is broken.
    const kinds = JSON.stringify(u.effects);
    expect(kinds).not.toContain("confused");
    expect(kinds).not.toContain("interrupt");
  });

  it("carries the target into the front, cuts it through armour and leaves it open", () => {
    const s = fight();
    const illusionist = s.players[0];
    const [target, ...others] = s.enemies.filter((e) => e.hp > 0);
    target.row = "back";
    effects(s, illusionist, target, ultimateFor(illusionist)!.effects);
    expect(target.row).toBe("front");
    // Pierce: the target's guard is not taken off.
    expect(500 - target.hp).toBe(18 + illusionist.power);
    expect(status(target, "vulnerable")).toBeDefined();
    expect(status(target, "weak")).toBeDefined();
    // The rest: moths over their eyes, and the brush of their wings only.
    for (const e of others) {
      expect(status(e, "weak"), e.id).toBeDefined();
      expect(status(e, "vulnerable"), e.id).toBeUndefined();
      expect(500 - e.hp, e.id).toBe(Math.max(1, illusionist.power - e.guard));
    }
  });

  it("puts the Illusionist behind Barrier, and the enemy's blows land Weak", () => {
    const s = fight();
    const illusionist = s.players[0];
    const [target, other] = s.enemies.filter((e) => e.hp > 0);
    effects(s, illusionist, target, ultimateFor(illusionist)!.effects);
    expect(status(illusionist, "barrier")?.stacks).toBe(20);
    // A Weak enemy's direct hit is a third lighter before guard.
    const hero = s.players[1];
    const before = hero.hp;
    hero.statuses = [];
    effects(s, other, hero, [{ kind: "damage", amount: 20 }]);
    const weak = before - hero.hp;
    hero.hp = before;
    other.statuses = other.statuses.filter((x) => x.id !== "weak");
    effects(s, other, hero, [{ kind: "damage", amount: 20 }]);
    expect(weak).toBeLessThan(before - hero.hp);
  });

  it("resolves as an Ultimate, and its film is handed the whole line and the ward", () => {
    let s = fight();
    const target = s.enemies[0];
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("eyespot");
    expect(segments[0].targets[0]).toBe(target.id);
    expect(segments[0].targets.length).toBe(s.enemies.filter((e) => e.hp > 0).length);
    expect(segments[0].beats.some((b) => b.kind === "ward" && b.target === "p0")).toBe(true);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
