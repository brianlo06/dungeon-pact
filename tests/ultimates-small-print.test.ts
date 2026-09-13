import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, flattenEffects, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * The Small Print, the Assurer's Ultimate: no blow and no seizure. The party's
 * money buys the party cover — 30 Barrier on everyone, the Assurer too, and any
 * Mark served on them struck out — and the small print is that the cover lapses
 * when the round ends. Where Foreclosure strikes, seizes and earns.
 */

function fight(classes = ["broker", "vanguard", "ranger", "warden"]): RunState {
  let s = createRun("COVER", "test-small-print");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const assurer = s.players[0];
  assurer.evolution = "brk-assurer";
  assurer.ultimateCharge = ULTIMATE_MAX;
  assurer.resource = 0;
  s.gold = 100;
  for (const p of s.players) p.statuses = [];
  return s;
}

describe("The Small Print", () => {
  it("replaces Foreclosure for the Assurer, with its own film, and touches no enemy", () => {
    const u = ultimateFor({ heroId: "broker", evolution: "brk-assurer" })!;
    expect(u.id).toBe("small-print");
    expect(u.target).toBe("self");
    expect(cinematicFor(u).id).toBe("small-print");
    expect(ultimateFor({ heroId: "broker" })!.id).toBe("foreclosure");
    // What it does, not only its numbers: it spends instead of earning, and
    // strikes, seizes and scopes over nobody on the other side.
    const all = flattenEffects(u.effects);
    expect(all.some((e) => e.kind === "damage" || e.kind === "enemies")).toBe(false);
    expect(all.filter((e) => e.kind === "gold").every((e) => e.kind === "gold" && e.amount < 0)).toBe(true);
  });

  it("takes the premium and covers every ally, the Assurer included, striking out Marks", () => {
    const s = fight();
    const assurer = s.players[0];
    applyStatus(s.players[2], "marked", 1, 2);
    const enemyHp = s.enemies.map((e) => e.hp);
    effects(s, assurer, assurer, ultimateFor(assurer)!.effects);
    expect(s.gold).toBe(60);
    for (const p of s.players) {
      expect(status(p, "barrier")?.stacks, p.id).toBe(30);
      expect(status(p, "barrier")?.duration, p.id).toBe(1);
    }
    expect(status(s.players[2], "marked")).toBeUndefined();
    expect(assurer.resource).toBe(2);
    expect(s.enemies.map((e) => e.hp)).toEqual(enemyHp);
  });

  it("is never refused for a short treasury: it takes what there is and still covers everyone", () => {
    let s = fight();
    s.gold = 15;
    s = reduce(s, "p0", { type: "ultimate", target: "p0" }, 0);
    s.plans = {};
    resolveRound(s);
    expect(s.gold).toBe(0);
    expect(s.spent).toBeGreaterThanOrEqual(15);
    // Nothing held it back: the charge is spent.
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });

  it("holds through the round it was bought for, and lapses when that round ends", () => {
    let s = fight();
    s = reduce(s, "p0", { type: "ultimate", target: "p0" }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments, rest } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("small-print");
    // A film with no enemy in it, and a ward for each of the party.
    expect(segments[0].targets).toEqual([]);
    const warded = segments[0].beats.filter((b) => b.kind === "ward").map((b) => b.target);
    expect(new Set(warded)).toEqual(new Set(s.players.map((p) => p.id)));
    // The cover took the round's hits…
    const hits = rest.filter((b) => b.kind === "damage" && b.target?.startsWith("p"));
    const blocks = rest.filter((b) => b.kind === "block" && b.target?.startsWith("p"));
    if (hits.length) expect(blocks.length).toBeGreaterThan(0);
    // …and none of it outlives the round: the small print.
    for (const p of s.players) expect(status(p, "barrier"), p.id).toBeUndefined();
  });
});
