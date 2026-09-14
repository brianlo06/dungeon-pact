import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { applyStatus, effects, status } from "../src/engine/effects";
import { ULTIMATE_MAX, ultimateFor } from "../src/content/ultimates";
import { cinematicFor } from "../src/content/cinematics";
import { splitUltimates } from "../src/client/cinematic/segments";
import type { RunState } from "../src/shared/model";

/**
 * Compound Interest, the Usurer's Ultimate: a loan, not a seizure. One copper
 * pressed into the target (20 and Poison that keeps running), and then every
 * debt already on the field — Poisoned, Burning or Vulnerable — pays the pact
 * in gold and in Regeneration. Where Foreclosure strips a guard and hands out
 * Barrier once.
 */

function fight(classes = ["broker", "vanguard", "warden"]): RunState {
  let s = createRun("VIGG", "test-compound-interest");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    { id: "room", depth: 1, lane: 0, type: "combat", name: "Test", next: ["room2"], visited: true },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const usurer = s.players[0];
  usurer.evolution = "brk-usurer";
  usurer.ultimateCharge = ULTIMATE_MAX;
  for (const e of s.enemies) {
    e.hp = 500;
    e.maxHp = 500;
    e.guard = 3;
  }
  return s;
}

const regen = (u: { statuses: { id: string; stacks: number }[] }) =>
  u.statuses.find((st) => st.id === "regen")?.stacks ?? 0;

describe("Compound Interest", () => {
  it("replaces Foreclosure for the Usurer, and takes nothing away from anyone", () => {
    const u = ultimateFor({ heroId: "broker", evolution: "brk-usurer" })!;
    expect(u.id).toBe("compound-interest");
    expect(cinematicFor(u).id).toBe("compound-interest");
    expect(ultimateFor({ heroId: "broker" })!.id).toBe("foreclosure");
    // What it does, not only its numbers: nothing is stripped and nobody is
    // shielded — Foreclosure's two halves are both absent.
    const kinds = JSON.stringify(u.effects);
    expect(kinds).not.toContain("removeStatus");
    expect(kinds).not.toContain("barrier");
    expect(kinds).toContain("poison");
  });

  it("lends the principal and leaves the interest running, and pays on the first debt at once", () => {
    const s = fight();
    const usurer = s.players[0];
    usurer.hp = usurer.maxHp - 30;
    const before = s.gold;
    const [target, ...others] = s.enemies.filter((e) => e.hp > 0);
    effects(s, usurer, target, ultimateFor(usurer)!.effects);
    // The principal, through Guard, and the interest on top of it.
    expect(500 - target.hp).toBe(20 + usurer.power - target.guard);
    expect(status(target, "poison")?.stacks).toBe(6);
    expect(status(target, "poison")?.duration).toBe(3);
    // The cut, plus one collection: the fresh Poison is itself an account.
    expect(s.gold - before).toBe(20 + 8);
    // Which pays every hero, the Usurer included, and nothing to the enemy.
    for (const p of s.players) expect(regen(p), p.id).toBe(3);
    for (const e of others) expect(regen(e), e.id).toBe(0);
    expect(usurer.hp).toBe(usurer.maxHp - 22);
    expect(usurer.resource).toBeGreaterThanOrEqual(2);
    // Nobody else is touched by the loan itself.
    for (const e of others) expect(e.hp).toBe(500);
  });

  it("collects on every debt the party has already opened, wherever it stands", () => {
    const s = fight();
    const usurer = s.players[0];
    const [target, burning, exposed] = s.enemies.filter((e) => e.hp > 0);
    expect(exposed).toBeDefined();
    applyStatus(burning, "burn", 4, 2);
    applyStatus(exposed, "vulnerable", 1, 2);
    const before = s.gold;
    effects(s, usurer, target, ultimateFor(usurer)!.effects);
    // Three accounts: the fresh Poison, the Burn and the Vulnerable.
    expect(s.gold - before).toBe(20 + 8 * 3);
    for (const p of s.players) expect(regen(p), p.id).toBe(9);
    // Collecting is not striking: the other two are not hit for it.
    expect(burning.hp).toBe(500);
    expect(exposed.hp).toBe(500);
  });

  it("an enemy carrying two debts pays twice", () => {
    const s = fight();
    const usurer = s.players[0];
    const [target] = s.enemies.filter((e) => e.hp > 0);
    applyStatus(target, "vulnerable", 1, 2);
    const before = s.gold;
    effects(s, usurer, target, ultimateFor(usurer)!.effects);
    expect(s.gold - before).toBe(20 + 8 * 2);
    for (const p of s.players) expect(regen(p), p.id).toBe(6);
  });

  it("resolves as an Ultimate, and the wound and the mending tick on the same beat", () => {
    let s = fight();
    // Not the Bulwark: it shields itself on the round it is struck, and
    // Barrier absorbs a Poison tick the way it absorbs anything else.
    const mark = s.enemies.find((e) => e.definition === "acolyte") ?? s.enemies[1];
    const targetId = mark.id;
    const hpAfterLoan = 500 - (20 + s.players[0].power - mark.guard);
    s.players[1].hp = s.players[1].maxHp - 20;
    s = reduce(s, "p0", { type: "ultimate", target: targetId }, 0);
    s.plans = {};
    const from = s.eventSeq;
    // `reduce` hands back a new state: everything below reads that one.
    const target = s.enemies.find((e) => e.id === targetId)!;
    const ally = s.players[1];
    resolveRound(s);
    const beats = s.logs.filter((l) => l.seq > from && l.beat).map((l) => l.beat!);
    const { segments } = splitUltimates(beats);
    expect(segments[0]?.def.id).toBe("compound-interest");
    expect(segments[0].targets[0]).toBe(target.id);
    expect(s.players[0].ultimateCharge).toBeLessThan(ULTIMATE_MAX);
    // The round ends: the debt runs (Poison, through Guard) and the pact is
    // paid (Regeneration), out of the same beat.
    expect(target.hp).toBeLessThanOrEqual(hpAfterLoan - 6);
    expect(status(target, "poison")?.duration).toBe(2);
    // The pact was paid on the same beat, whatever the enemy did in between.
    expect(s.logs.some((l) => l.text === `${ally.name} regenerates 3.`)).toBe(true);
    expect(regen(ally)).toBe(3);
  });
});
