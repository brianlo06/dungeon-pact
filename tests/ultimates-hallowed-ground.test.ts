import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, prepareIntents, resolveRound } from "../src/engine/combat";
import { effects, status, tickStatuses } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * Hallowed Ground, the Sanctifier's Ultimate: the ground under the whole
 * party made to hold, for four rounds, and the Sanctifier put on the line in
 * front of them. Nothing to swing with, nothing cleared, no enemy touched —
 * where the Anthem Empowers, wards for a round and cleanses.
 */

function fight(classes = ["herald", "arcanist", "ranger"]): RunState {
  let s = createRun("HOLD", "test-hallowed-ground");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [{ id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true }];
  s.currentNode = "room";
  enterCombat(s);
  const sanctifier = s.players[0];
  sanctifier.evolution = "hrl-sanctifier";
  sanctifier.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
  }
  return s;
}

describe("Hallowed Ground", () => {
  it("replaces Anthem of the Unpaid for the Sanctifier, with its own film", () => {
    const u = ultimateFor({ heroId: "herald", evolution: "hrl-sanctifier" })!;
    expect(u.id).toBe("hallowed-ground");
    expect(u.target).toBe("self");
    expect(cinematicFor(u).id).toBe("hallowed-ground");
    expect(ultimateFor({ heroId: "herald" })!.id).toBe("anthem-of-the-unpaid");
    // What it does, not only its numbers: nothing to swing with, nothing
    // cleared, no enemy touched.
    const text = JSON.stringify(u.effects);
    expect(text).not.toContain("empowered");
    expect(text).not.toContain("removeStatus");
    expect(text).not.toContain("enemies");
    expect(text).not.toContain("damage");
  });

  it("wards the whole party for four rounds and puts the Sanctifier in front", () => {
    const s = fight();
    const sanctifier = s.players[0];
    sanctifier.resource = 2;
    expect(sanctifier.row).toBe("back");
    effects(s, sanctifier, sanctifier, ultimateFor(sanctifier)!.effects);
    for (const p of s.players) {
      expect(status(p, "barrier")?.stacks, p.id).toBe(10);
      expect(status(p, "barrier")?.duration, p.id).toBe(4);
      expect(status(p, "empowered"), p.id).toBeUndefined();
    }
    expect(sanctifier.row).toBe("front");
    expect(sanctifier.resource).toBe(5);
    for (const e of s.enemies) expect(e.statuses, e.id).toEqual([]);
  });

  it("lasts: the ground still holds three rounds on, and is gone after four", () => {
    const s = fight();
    const sanctifier = s.players[0];
    effects(s, sanctifier, sanctifier, ultimateFor(sanctifier)!.effects);
    const ally = s.players[1];
    for (let round = 1; round <= 3; round++) {
      tickStatuses(s, ally);
      expect(status(ally, "barrier")?.stacks, `round ${round}`).toBe(10);
    }
    tickStatuses(s, ally);
    expect(status(ally, "barrier")).toBeUndefined();
  });

  it("leaves room for Sanctuary the next round: the +3 Verse pays for it", () => {
    const s = fight();
    const sanctifier = s.players[0];
    sanctifier.resource = 0;
    effects(s, sanctifier, sanctifier, ultimateFor(sanctifier)!.effects);
    expect(sanctifier.resource).toBeGreaterThanOrEqual(3);
  });

  it("draws the enemy's blows onto the line: every front-row-hunting enemy now aims at the Sanctifier", () => {
    const s = fight();
    const sanctifier = s.players[0];
    effects(s, sanctifier, sanctifier, ultimateFor(sanctifier)!.effects);
    // Everyone else is still in the back row; the Sanctifier is the only one in front.
    expect(s.players.filter((p) => p.row === "front").map((p) => p.id)).toEqual([sanctifier.id]);
    prepareIntents(s);
    const hunters = s.enemies.filter(
      (e) =>
        e.hp > 0 &&
        e.definition !== "sniper" &&
        e.definition !== "collector" &&
        (e.intent.ability.target === "enemy" || e.intent.ability.target === "enemyRow"),
    );
    expect(hunters.length).toBeGreaterThan(0);
    for (const e of hunters) expect(e.intent.target, e.id).toBe(sanctifier.id);
  });

  it("resolves as an Ultimate: no enemy in its cast, a ward beat for every ally, the charge spent", () => {
    let s = fight();
    s = reduce(s, "p0", { type: "ultimate", target: "p0" }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("hallowed-ground");
    expect(segments[0].targets).toEqual([]);
    const warded = segments[0].beats.filter((b) => b.kind === "ward").map((b) => b.target);
    for (const p of s.players) expect(warded, p.id).toContain(p.id);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
    // Still there after the round, on everyone it was not spent on: lasting, not lapsing.
    const kept = s.players.filter((p) => p.hp > 0 && status(p, "barrier"));
    for (const p of kept) expect(status(p, "barrier")?.duration, p.id).toBe(3);
  });
});
