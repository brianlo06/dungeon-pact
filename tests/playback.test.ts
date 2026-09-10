import { expect, it } from "vitest";
import { createRun, addPlayer, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import type { RunState } from "../src/shared/model";

function room(heroIds: string[]): RunState {
  let s = createRun("BEATS", "test-beats");
  heroIds.forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  heroIds.forEach((id, i) => {
    s = reduce(s, `p${i}`, { type: "hero", hero: id }, 0);
  });
  s.map = [
    {
      id: "room",
      depth: 0,
      lane: 0,
      type: "combat",
      name: "Test",
      next: [],
      visited: true,
    },
  ];
  s.currentNode = "room";
  enterCombat(s);
  return s;
}

/**
 * The client replays a round from these beats. If a beat's health disagrees
 * with the settled state, the board animates to the wrong place, so the
 * contract is asserted here rather than left to the presentation layer.
 */
it("narrates a resolved round as ordered beats", () => {
  const s = room(["vanguard", "arcanist"]);
  const enemy = s.enemies[0];
  s.plans = {
    p0: { ability: "bash", target: enemy.id },
    p1: { ability: "spark", target: enemy.id },
  };
  const before = s.eventSeq;
  resolveRound(s);
  const beats = s.logs
    .filter((l) => l.seq > before && l.beat)
    .map((l) => l.beat!);
  expect(beats.length).toBeGreaterThan(2);
  expect(beats[0].kind).toBe("cast");
  expect(beats[0].label).toBeTruthy();
  const hit = beats.find((b) => b.kind === "damage")!;
  expect(hit.actor).toBeTruthy();
  expect(hit.target).toBeTruthy();
  expect(hit.amount).toBeGreaterThan(0);
  // Every beat names units that exist, and reports health within their range.
  const units = new Map(
    [...s.players, ...s.enemies].map((u) => [u.id, u] as const),
  );
  for (const b of beats) {
    if (b.actor) expect(units.has(b.actor)).toBe(true);
    if (b.target) expect(units.has(b.target)).toBe(true);
    if (b.hp !== undefined) {
      expect(b.hp).toBeGreaterThanOrEqual(0);
      expect(b.hp).toBeLessThanOrEqual(units.get(b.target!)!.maxHp);
    }
  }
});

it("ends each unit's beats on the health the round settled at", () => {
  const s = room(["ranger", "warden"]);
  s.plans = {
    p0: { ability: "arrow", target: s.enemies[0].id },
    p1: { ability: "thorn", target: s.enemies[0].id },
  };
  const before = s.eventSeq;
  resolveRound(s);
  const last = new Map<string, number>();
  for (const l of s.logs)
    if (l.seq > before && l.beat?.target && l.beat.hp !== undefined)
      last.set(l.beat.target, l.beat.hp);
  for (const [id, hp] of last) {
    const unit = [...s.players, ...s.enemies].find((u) => u.id === id);
    // Statuses tick after the beats, so only untouched units must match exactly.
    if (
      unit &&
      !unit.statuses.some((x) => x.id === "burn" || x.id === "poison")
    )
      expect(unit.hp).toBe(hp);
  }
});

it("carries no beats outside combat", () => {
  const s = room(["vanguard", "warden"]);
  const opening = s.logs.filter((l) => l.beat);
  expect(opening.length).toBe(0);
});
