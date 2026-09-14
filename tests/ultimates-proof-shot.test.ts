import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status, EXPLOIT } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * Proof Shot, the Sharpshooter's Ultimate: the target's Barrier stripped,
 * then two shots through armour at it, the second cashing the Mark the
 * first leaves (EXPLOIT); Vulnerable for two rounds after; +2 Focus; and
 * it resolves after most other Ultimates.
 */

function fight(classes = ["ranger", "vanguard", "arcanist"]): RunState {
  let s = createRun("PROOF", "test-proof-shot");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const shooter = s.players[0];
  shooter.evolution = "rng-sharpshooter";
  shooter.ultimateCharge = ULTIMATE_MAX;
  shooter.resource = 0;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    // Heavy armour: the whole point.
    e.guard = 5;
  }
  return s;
}

/** The two shots' base amounts, read from the content so a tuning pass cannot break this. */
function shots() {
  const u = ultimateFor({ heroId: "ranger", evolution: "rng-sharpshooter" })!;
  return u.effects.filter((e) => e.kind === "damage").map((e) => (e.kind === "damage" ? e.amount : 0));
}

describe("Proof Shot", () => {
  it("replaces the Hundredth Mark for the Sharpshooter, with its own film", () => {
    const u = ultimateFor({ heroId: "ranger", evolution: "rng-sharpshooter" })!;
    expect(u.id).toBe("proof-shot");
    expect(u.target).toBe("enemy");
    expect(cinematicFor(u).id).toBe("proof-shot");
    expect(ultimateFor({ heroId: "ranger" })!.id).toBe("hundredth-mark");
    // What it does, not only its numbers: two shots through armour at one
    // enemy, nothing for the rest of the side, and slower than the base.
    expect(shots().length).toBe(2);
    const text = JSON.stringify(u.effects);
    expect(text).not.toContain('"enemies"');
    expect(text).not.toContain("weak");
    expect(text).not.toContain("interrupt");
    expect(u.speed).toBeLessThan(ultimateFor({ heroId: "ranger" })!.speed);
  });

  it("strips the Barrier, goes through the armour twice, and the second shot cashes the first's Mark", () => {
    const s = fight();
    const shooter = s.players[0];
    const target = s.enemies[0];
    applyStatus(target, "barrier", 30, 2);
    effects(s, shooter, target, ultimateFor(shooter)!.effects);
    const [a, b] = shots();
    // Guard 5 and 30 Barrier count for nothing; the second shot is an Exploit.
    expect(500 - target.hp).toBe(a + shooter.power + (b + shooter.power + EXPLOIT));
    expect(status(target, "barrier")).toBeUndefined();
    expect(status(target, "marked")).toBeUndefined();
    expect(status(target, "vulnerable")?.duration).toBe(2);
    expect(shooter.resource).toBe(2);
    // Nobody else is touched.
    for (const e of s.enemies.slice(1)) {
      expect(e.hp, e.id).toBe(500);
      expect(e.statuses, e.id).toEqual([]);
    }
  });

  it("cashes a Mark the party had already left: two Exploits", () => {
    const s = fight();
    const shooter = s.players[0];
    const target = s.enemies[0];
    applyStatus(target, "marked", 1, 3);
    effects(s, shooter, target, ultimateFor(shooter)!.effects);
    const [a, b] = shots();
    expect(500 - target.hp).toBe(a + shooter.power + EXPLOIT + (b + shooter.power + EXPLOIT));
  });

  it("resolves after the Arcanist's Ultimate, and its film is handed the one target", () => {
    let s = fight(["arcanist", "ranger", "vanguard"]);
    s.players[0].evolution = undefined;
    s.players[0].ultimateCharge = ULTIMATE_MAX;
    const shooter = s.players[1];
    shooter.evolution = "rng-sharpshooter";
    shooter.ultimateCharge = ULTIMATE_MAX;
    s.players[2].ultimateCharge = 0;
    const target = s.enemies[0];
    s = reduce(s, "p1", { type: "ultimate", target: target.id }, 0);
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments.map((x) => x.def.id)).toEqual(["debt-of-thunder", "proof-shot"]);
    expect(segments[1].targets).toEqual([target.id]);
    expect(s.players[1].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
