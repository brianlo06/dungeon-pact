import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * Mourning Water, the Hollow Druid's Ultimate: no healing at all. One enemy
 * drowned — hurt, Wet and Weak — and the water run out under the rest of the
 * line, taking further whatever the party had already soaked. Where Green
 * Reckoning heals the whole party and poisons every enemy.
 */

function fight(classes = ["warden", "arcanist", "vanguard"]): RunState {
  let s = createRun("MOURN", "test-mourning-water");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const druid = s.players[0];
  druid.evolution = "war-hollow";
  druid.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 2;
  }
  return s;
}

describe("Mourning Water", () => {
  it("replaces Green Reckoning for the Hollow Druid, with its own film, and heals nobody", () => {
    const u = ultimateFor({ heroId: "warden", evolution: "war-hollow" })!;
    expect(u.id).toBe("mourning-water");
    expect(u.target).toBe("enemy");
    expect(cinematicFor(u).id).toBe("mourning-water");
    expect(ultimateFor({ heroId: "warden" })!.id).toBe("green-reckoning");
    // What it does, not only its numbers: no heal, no regen, no poison.
    const kinds = JSON.stringify(u.effects);
    expect(kinds).not.toContain('"heal"');
    expect(kinds).not.toContain("regen");
    expect(kinds).not.toContain("poison");
  });

  it("drowns the target: hurt, Wet, and Weak for two rounds; every other enemy Wet", () => {
    const s = fight();
    const druid = s.players[0];
    const [target, ...others] = s.enemies.filter((e) => e.hp > 0);
    expect(others.length).toBeGreaterThan(0);
    const hp = druid.hp;
    effects(s, druid, target, ultimateFor(druid)!.effects);
    expect(500 - target.hp).toBe(24 + druid.power - target.guard);
    expect(status(target, "wet")).toBeDefined();
    expect(status(target, "weak")?.duration).toBe(2);
    for (const e of others) {
      expect(500 - e.hp, e.id).toBe(0);
      expect(status(e, "wet"), e.id).toBeDefined();
      // Not wet before, so not dragged down.
      expect(status(e, "weak"), e.id).toBeUndefined();
    }
    expect(druid.hp).toBe(hp);
  });

  it("remembers what the party already soaked: a Wet target is held under longer, a Wet enemy is dragged down", () => {
    const dry = fight();
    const wet = fight();
    const hit = (s: RunState, soak: boolean) => {
      const druid = s.players[0];
      const [target, soaked, dryOne] = s.enemies.filter((e) => e.hp > 0);
      if (soak) {
        applyStatus(target, "wet", 1, 3);
        applyStatus(soaked, "wet", 1, 3);
      }
      effects(s, druid, target, ultimateFor(druid)!.effects);
      return { target, soaked, dryOne };
    };
    const a = hit(dry, false);
    const b = hit(wet, true);
    expect(500 - b.target.hp - (500 - a.target.hp)).toBe(10);
    expect(status(b.soaked, "weak")).toBeDefined();
    if (b.dryOne) expect(status(b.dryOne, "weak")).toBeUndefined();
    // And the line it leaves soaked is set up for lightning: a bolt on any of them chains.
    const arcanist = wet.players[1];
    effects(wet, arcanist, b.soaked, [{ kind: "damage", amount: 10, damageType: "lightning" }]);
    const beats = wet.logs.filter((l) => l.beat?.kind === "combo").map((l) => l.beat!.label);
    expect(beats).toContain("CHAIN SHOCK");
  });

  it("resolves as an Ultimate, and its film is handed the one it drowned", () => {
    let s = fight();
    const target = s.enemies[0];
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("mourning-water");
    expect(segments[0].targets).toEqual([target.id]);
    expect(beats.some((b) => b.kind === "heal" && b.actor === "p0")).toBe(false);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
