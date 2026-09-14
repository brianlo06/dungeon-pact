import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { Enemy, RunState } from "../src/shared/model";

/**
 * Dry Flood, the Pyromancer's Ultimate: fire sent down on a whole row, which
 * keeps burning; any Wet on it boiled off as steam; everything burning left
 * Vulnerable for the party this round; and the Pyromancer burned for it.
 * Where Debt of Thunder soaks every enemy and strikes one.
 */

function fight(classes = ["arcanist", "ranger", "warden", "herald"]): RunState {
  let s = createRun("PYRO", "test-dry-flood");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const pyro = s.players[0];
  pyro.evolution = "arc-pyromancer";
  pyro.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 3;
    e.statuses = [];
  }
  return s;
}

/** Two enemies in one row and one in the other, whatever the encounter drew. */
function rows(s: RunState): { row: Enemy[]; other: Enemy } {
  const living = s.enemies.filter((e) => e.hp > 0);
  expect(living.length).toBeGreaterThanOrEqual(3);
  living[0].row = "front";
  living[1].row = "front";
  for (const e of living.slice(2)) e.row = "back";
  return { row: [living[0], living[1]], other: living[2] };
}

describe("Dry Flood", () => {
  it("replaces Debt of Thunder for the Pyromancer, with its own film, and aims at a row", () => {
    const u = ultimateFor({ heroId: "arcanist", evolution: "arc-pyromancer" })!;
    expect(u.id).toBe("dry-flood");
    expect(cinematicFor(u).id).toBe("dry-flood");
    expect(ultimateFor({ heroId: "arcanist" })!.id).toBe("debt-of-thunder");
    expect(u.target).toBe("enemyRow");
    // What it does, not only its numbers: no storm, and no Wet laid down.
    const said = JSON.stringify(u.effects);
    expect(said).not.toContain("lightning");
    expect(said).not.toMatch(/"kind":"status","status":"wet"/);
  });

  it("sets the chosen row burning badly, and leaves the other row unburnt", () => {
    const s = fight();
    const pyro = s.players[0];
    const { row, other } = rows(s);
    effects(s, pyro, row[0], ultimateFor(pyro)!.effects);
    for (const e of row) {
      expect(500 - e.hp, e.id).toBe(28 + pyro.power - e.guard);
      expect(status(e, "burn"), e.id).toMatchObject({ stacks: 8, duration: 3 });
      expect(status(e, "vulnerable"), e.id).toMatchObject({ duration: 1 });
    }
    expect(other.hp).toBe(500);
    expect(status(other, "burn")).toBeUndefined();
    expect(status(other, "vulnerable")).toBeUndefined();
  });

  it("boils Wet off as steam instead of saving it, and burning enemies anywhere turn Vulnerable", () => {
    const s = fight();
    const pyro = s.players[0];
    const { row, other } = rows(s);
    applyStatus(row[1], "wet", 1, 3);
    applyStatus(row[0], "burn", 6, 2); // an Immolate from last round
    applyStatus(other, "burn", 3, 2); // burning, out of the row
    effects(s, pyro, row[0], ultimateFor(pyro)!.effects);
    // The soaked one: the steam through its armour, then the fire.
    expect(status(row[1], "wet")).toBeUndefined();
    expect(500 - row[1].hp).toBe(10 + pyro.power + (28 + pyro.power - row[1].guard));
    // Burn stacks on burn.
    expect(status(row[0], "burn")?.stacks).toBe(14);
    // Out of the row, not hit, but brittle because it was already burning.
    expect(other.hp).toBe(500);
    expect(status(other, "vulnerable")).toBeDefined();
  });

  it("burns the Pyromancer too, and a Warden's cleanse can take it off", () => {
    const s = fight();
    const [pyro] = s.players;
    const { row } = rows(s);
    effects(s, pyro, row[0], ultimateFor(pyro)!.effects);
    expect(status(pyro, "burn")).toMatchObject({ stacks: 3, duration: 2 });
    effects(s, s.players[2], pyro, [{ kind: "removeStatus", status: "burn" }]);
    expect(status(pyro, "burn")).toBeUndefined();
  });

  it("resolves through the round, and its film gets the whole row and nobody else", () => {
    let s = fight();
    const { row } = rows(s);
    s = reduce(s, "p0", { type: "ultimate", target: row[0].id }, 0);
    s.plans = {};
    const from = s.eventSeq;
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments.map((x) => x.def.id)).toEqual(["dry-flood"]);
    expect([...segments[0].targets].sort()).toEqual(row.map((e) => e.id).sort());
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
  });
});
