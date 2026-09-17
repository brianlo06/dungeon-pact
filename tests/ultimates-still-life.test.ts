import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * Still Life, the Chronomancer's Ultimate: a moment taken from the target
 * (its windup broken, the lost moments landing at once), every affliction
 * the party laid on the enemy held, and every ally's Empowered and
 * Regeneration held as long. It waits for every other Ultimate in the window.
 * Where Debt of Thunder soaks everyone and calls down one bolt.
 */

function fight(classes = ["arcanist", "herald", "ranger"]): RunState {
  let s = createRun("STILL", "test-still-life");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const chrono = s.players[0];
  chrono.evolution = "arc-chronomancer";
  chrono.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 3;
    e.intent.ability = { ...e.intent.ability, interruptible: true };
  }
  return s;
}

describe("Still Life", () => {
  it("replaces Debt of Thunder for the Chronomancer, with its own film", () => {
    const u = ultimateFor({ heroId: "arcanist", evolution: "arc-chronomancer" })!;
    expect(u.id).toBe("still-life");
    expect(cinematicFor(u).id).toBe("still-life");
    expect(ultimateFor({ heroId: "arcanist" })!.id).toBe("debt-of-thunder");
    // What it does, not only its numbers: no storm, and nobody is turned.
    const said = JSON.stringify(u.effects);
    expect(said).not.toContain("confused");
    expect(said).not.toContain("lightning");
    // It waits for every other Ultimate.
    expect(u.speed).toBe(0);
  });

  it("takes the target's moment: windup broken and a hit through its armour", () => {
    const s = fight();
    const chrono = s.players[0];
    const [target, ...others] = s.enemies.filter((e) => e.hp > 0);
    effects(s, chrono, target, ultimateFor(chrono)!.effects);
    expect(500 - target.hp).toBe(22 + chrono.power);
    expect(status(target, "interrupted")).toBeDefined();
    // The rest are only touched by the stopped moment.
    for (const e of others) {
      expect(500 - e.hp, e.id).toBe(chrono.power);
      expect(status(e, "interrupted"), e.id).toBeUndefined();
    }
  });

  it("holds what the party laid on the enemy, and adds nothing to a clean one", () => {
    const s = fight();
    const chrono = s.players[0];
    const [target, soaked, clean] = s.enemies.filter((e) => e.hp > 0);
    expect(clean).toBeDefined();
    applyStatus(soaked, "wet", 1, 1);
    applyStatus(soaked, "marked", 1, 1);
    applyStatus(soaked, "burn", 4, 1);
    effects(s, chrono, target, ultimateFor(chrono)!.effects);
    expect(status(soaked, "wet")?.duration).toBe(3);
    expect(status(soaked, "marked")?.duration).toBe(3);
    expect(status(soaked, "burn")?.duration).toBe(3);
    expect(clean.statuses.map((x) => x.id)).toEqual([]);
    // A held Wet is still a Chain Shock the party can set off.
    expect(status(soaked, "wet")?.stacks).toBe(1);
  });

  it("gives the party time: an ally's Empowered and Regeneration are held", () => {
    const s = fight();
    const [chrono, herald, ranger] = s.players;
    applyStatus(herald, "empowered", 1, 1);
    applyStatus(chrono, "regen", 3, 1);
    effects(s, chrono, s.enemies[0], ultimateFor(chrono)!.effects);
    expect(status(herald, "empowered")?.duration).toBe(3);
    expect(status(chrono, "regen")?.duration).toBe(3);
    expect(status(ranger, "empowered")).toBeUndefined();
  });

  it("resolves after an ally's Ultimate in the same window, holds what it gave, and its film gets the whole line", () => {
    let s = fight();
    const target = s.enemies[0];
    s.players[1].ultimateCharge = ULTIMATE_MAX;
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s = reduce(s, "p1", { type: "ultimate", target: "p1" }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments.map((x) => x.def.id)).toEqual(["anthem-of-the-unpaid", "still-life"]);
    const still = segments[1];
    expect(still.targets[0]).toBe(target.id);
    expect(still.targets.length).toBe(s.enemies.filter((e) => e.hp > 0).length);
    expect(still.beats.some((b) => b.kind === "combo" && b.label === "INTERRUPTED" && b.target === target.id)).toBe(true);
    // The Anthem's two rounds of Empowered were held to three; one has ticked.
    for (const p of s.players) expect(status(p, "empowered")?.duration, p.id).toBe(2);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
