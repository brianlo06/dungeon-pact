import { expect, it } from "vitest";
import {
  bossFixture,
  finishPreviewRound,
  type FixtureOptions,
} from "../src/dev/boss-fixture";

const options: FixtureOptions = {
  boss: "collector",
  size: 4,
  stage: "objective",
  gold: 700,
  legacy: false,
};

it("previews the requested boss with real support formations at every party size", () => {
  for (const boss of ["collector", "miser"] as const)
    for (const size of [2, 3, 4] as const) {
      const s = bossFixture({ ...options, boss, size });
      expect(s.phase).toBe("COMBAT");
      expect(s.players).toHaveLength(size);
      expect(s.enemies[0].definition).toBe(boss);
      expect(s.enemies).toHaveLength(size - 1);
      expect(
        s.enemies[0].intent.ability.effects.some(
          (e) => e.kind === (boss === "collector" ? "seize" : "bank"),
        ),
      ).toBe(true);
    }
});

it("takes equipment through the reducer and returns it through the real break effect", () => {
  const before = bossFixture(options);
  const after = finishPreviewRound(before);
  const box = after.enemies.find((e) => e.definition === "strongbox")!;
  expect(box.holding).toHaveLength(2);
  for (const h of box.holding!) {
    expect(before.players.find((p) => p.id === h.playerId)!.items).toContain(
      h.itemId,
    );
    expect(after.players.find((p) => p.id === h.playerId)!.items).not.toContain(
      h.itemId,
    );
  }
  const released = bossFixture({ ...options, stage: "released" });
  expect(
    released.enemies.find((e) => e.definition === "strongbox")!.holding,
  ).toEqual([]);
  for (const p of released.players)
    expect([...p.items].sort()).toEqual(
      [...before.players.find((b) => b.id === p.id)!.items].sort(),
    );
});

it("shows the real treasury allowance boundary and legacy behavior", () => {
  for (const [gold, expected] of [
    [100, 0],
    [160, 0],
    [172, 1],
    [400, 20],
    [700, 45],
  ]) {
    const s = bossFixture({
      ...options,
      boss: "miser",
      size: 2,
      stage: "resolved",
      gold,
    });
    expect(
      s.enemies[0].statuses.find((x) => x.id === "barrier")?.stacks ?? 0,
    ).toBe(expected);
  }
  const s = bossFixture({ ...options, legacy: true, stage: "resolved" });
  expect(s.combatVersion).toBeUndefined();
  expect(s.enemies.some((e) => e.definition === "strongbox")).toBe(false);
});
