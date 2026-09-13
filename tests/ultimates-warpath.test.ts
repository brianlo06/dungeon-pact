import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import { reachError } from "../src/shared/reach";
import { abilities } from "../src/content/heroes";
import type { RunState } from "../src/shared/model";

/**
 * Warpath, the Warlord's Ultimate: it guards nobody. It strikes the enemy it
 * chose, leaves it Marked and Vulnerable, and brings the whole party forward
 * into the front line behind it, each with a little Barrier — close enough
 * that a melee blow can follow it to that enemy through a screen. Where the
 * Lantern Wall wards and guards everyone and moves nobody.
 */

function fight(classes = ["vanguard", "reaver", "ranger", "arcanist"]): RunState {
  let s = createRun("WARPATH", "test-warpath");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const warlord = s.players[0];
  warlord.evolution = "van-warlord";
  warlord.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 3;
  }
  return s;
}

describe("Warpath", () => {
  it("replaces the Lantern Wall for the Warlord, with its own film, and guards nobody", () => {
    const u = ultimateFor({ heroId: "vanguard", evolution: "van-warlord" })!;
    expect(u.id).toBe("warpath");
    expect(cinematicFor(u).id).toBe("warpath");
    expect(ultimateFor({ heroId: "vanguard" })!.id).toBe("lantern-wall");
    // What it does, not only its numbers: no guard link, no interrupt, and it moves the party.
    const kinds = JSON.stringify(u.effects);
    expect(kinds).not.toContain("protect");
    expect(kinds).not.toContain("interrupt");
    expect(kinds).toContain('"move"');
  });

  it("strikes the target and leaves it Marked and Vulnerable, and touches no other enemy", () => {
    const s = fight();
    const warlord = s.players[0];
    const [target, ...others] = s.enemies.filter((e) => e.hp > 0);
    effects(s, warlord, target, ultimateFor(warlord)!.effects);
    expect(500 - target.hp).toBe(22 + warlord.power - target.guard);
    expect(status(target, "marked")).toBeDefined();
    expect(status(target, "vulnerable")).toBeDefined();
    // The row does not move: only the party comes forward.
    for (const e of others) {
      expect(e.hp, e.id).toBe(500);
      expect(status(e, "marked"), e.id).toBeUndefined();
    }
  });

  it("brings the whole party into the front line, each with Barrier, and no guard links", () => {
    const s = fight();
    const warlord = s.players[0];
    warlord.row = "back";
    for (const p of s.players.slice(1)) p.row = "back";
    effects(s, warlord, s.enemies[0], ultimateFor(warlord)!.effects);
    for (const p of s.players) {
      expect(p.row, p.id).toBe("front");
      expect(status(p, "barrier")?.stacks, p.id).toBe(8);
      expect(status(p, "guarded"), p.id).toBeUndefined();
    }
    expect(warlord.resource).toBeGreaterThan(0);
  });

  it("lets a melee ally follow it through a screen to a Marked enemy in the back row", () => {
    const s = fight();
    const warlord = s.players[0];
    const reaver = s.players[1];
    const front = s.enemies.find((e) => e.hp > 0)!;
    front.row = "front";
    const back = s.enemies.find((e) => e.hp > 0 && e.id !== front.id)!;
    back.row = "back";
    reaver.row = "back";
    const cleave = abilities("reaver", s.combatVersion).find((a) => a.reach === "melee" && a.target === "enemy");
    expect(cleave).toBeDefined();
    // Screened before: a back-row melee hero cannot reach it.
    expect(reachError(s, reaver, cleave!, back)).toBeDefined();
    effects(s, warlord, back, ultimateFor(warlord)!.effects);
    // After: the Reaver is in the front row, and the target is Marked.
    expect(reachError(s, reaver, cleave!, back)).toBeUndefined();
  });

  it("resolves as an Ultimate before the round, and its film is handed its target", () => {
    let s = fight();
    const target = s.enemies[0];
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("warpath");
    expect(segments[0].targets[0]).toBe(target.id);
    // Every standing hero's Barrier is a ward beat the film can reveal.
    expect(segments[0].beats.filter((b) => b.kind === "ward").length).toBe(s.players.length);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
