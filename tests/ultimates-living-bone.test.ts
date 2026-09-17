import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound, validateUltimate } from "../src/engine/combat";
import { effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * Living Bone, the Lifebinder's Ultimate: one life bound, not everyone
 * touched. One ally — the downed included — is healed, regenerating, warded
 * and Empowered; the Warden pays for it in its own HP and stands in front of
 * them. Where Green Reckoning sweeps the whole field.
 */

function fight(classes = ["warden", "reaver", "ranger"]): RunState {
  let s = createRun("BONE", "test-living-bone");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const warden = s.players[0];
  warden.evolution = "war-lifebinder";
  warden.ultimateCharge = ULTIMATE_MAX;
  return s;
}

describe("Living Bone", () => {
  it("replaces Green Reckoning for the Lifebinder, with its own film, and binds one life instead of sweeping", () => {
    const u = ultimateFor({ heroId: "warden", evolution: "war-lifebinder" })!;
    expect(u.id).toBe("living-bone");
    expect(cinematicFor(u).id).toBe("living-bone");
    expect(ultimateFor({ heroId: "warden" })!.id).toBe("green-reckoning");
    // What it does, not only its numbers: no party scope, no cleanse, no poison.
    const kinds = JSON.stringify(u.effects);
    expect(kinds).not.toContain('"allies"');
    expect(kinds).not.toContain('"enemies"');
    expect(kinds).not.toContain("removeStatus");
    expect(kinds).not.toContain("poison");
    expect(u.target).toBe("ally");
  });

  it("heals, regenerates, wards and empowers the bound ally, and the Warden pays and steps in front", () => {
    const s = fight();
    const [warden, reaver, ranger] = s.players;
    reaver.hp = 20;
    const wardenHp = warden.hp;
    effects(s, warden, reaver, ultimateFor(warden)!.effects);
    expect(reaver.hp).toBe(Math.min(reaver.maxHp, 20 + 40));
    expect(status(reaver, "regen")?.stacks).toBe(6);
    expect(status(reaver, "barrier")?.stacks).toBe(12);
    expect(status(reaver, "empowered")).toBeDefined();
    // Bound: the Warden takes the next direct hit meant for them.
    expect(status(reaver, "guarded")?.sourceId).toBe(warden.id);
    expect(warden.row).toBe("front");
    // The price is paid flat, and the Warden's own new Barrier cannot pay it.
    expect(status(warden, "barrier")?.stacks).toBe(8);
    expect(warden.hp).toBe(wardenHp - 12);
    // Nobody else is touched.
    expect(ranger.hp).toBe(ranger.maxHp);
    expect(ranger.statuses).toEqual([]);
    for (const e of s.enemies) expect(e.statuses).toEqual([]);
  });

  it("brings a downed ally back, and cannot be aimed at the Warden itself", () => {
    const s = fight();
    const [warden, reaver] = s.players;
    reaver.hp = 0;
    reaver.downedRounds = 3;
    expect(() => validateUltimate(s, warden, reaver.id)).not.toThrow();
    expect(() => validateUltimate(s, warden, warden.id)).toThrow();
    effects(s, warden, reaver, ultimateFor(warden)!.effects);
    expect(reaver.hp).toBe(40);
    expect(reaver.downedRounds).toBe(0);
    expect(warden.revives).toBe(1);
    expect(status(reaver, "guarded")?.sourceId).toBe(warden.id);
  });

  it("resolves as an Ultimate, and its film is handed the bond, not an enemy", () => {
    let s = fight();
    const reaver = s.players[1];
    reaver.hp = 30;
    s = reduce(s, "p0", { type: "ultimate", target: reaver.id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("living-bone");
    expect(segments[0].targets).toEqual([]);
    expect(segments[0].beats.some((b) => b.kind === "heal" && b.target === reaver.id && b.amount === 40)).toBe(true);
    expect(segments[0].beats.some((b) => b.kind === "ward" && b.target === reaver.id && b.amount === 12)).toBe(true);
    expect(segments[0].beats.some((b) => b.kind === "damage" && b.target === "p0" && b.amount === 12)).toBe(true);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
