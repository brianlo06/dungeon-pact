import { expect, it } from "vitest";
import { snapshot } from "../src/engine/game";
import { bossFixture } from "../src/dev/boss-fixture";
import {
  describeIntentEffect,
  treasuryBarrier,
} from "../src/client/combat-presentation";
import type { Effect } from "../src/shared/model";

it("matches the Miser's real shield at and around the allowance", () => {
  for (const gold of [100, 160, 171, 172, 400, 700]) {
    const options = {
      boss: "miser",
      size: 2,
      stage: "objective",
      gold,
      legacy: false,
    } as const;
    const before = bossFixture(options);
    const bank = before.enemies[0].intent.ability.effects.find(
      (e) => e.kind === "bank",
    )! as Extract<Effect, { kind: "bank" }>;
    const resolved = bossFixture({ ...options, stage: "resolved" });
    expect(treasuryBarrier(gold, bank)).toBe(
      resolved.enemies[0].statuses.find((e) => e.id === "barrier")?.stacks ?? 0,
    );
    expect(
      describeIntentEffect(bank, 2, snapshot(before, before.players[0].id, [])),
    ).toContain(`+${treasuryBarrier(gold, bank)} Barrier`);
  }
});

it("stops promising seizures after the Strongbox is broken", () => {
  const options = {
    boss: "collector",
    size: 2,
    stage: "objective",
    gold: 100,
    legacy: false,
  } as const;
  const before = bossFixture(options);
  const after = bossFixture({ ...options, stage: "released" });
  const effect = before.enemies[0].intent.ability.effects.find(
    (e) => e.kind === "seize",
  )!;
  expect(
    describeIntentEffect(effect, 3, snapshot(before, "preview-0", [])),
  ).toContain("dearest equipped item");
  expect(
    describeIntentEffect(effect, 3, snapshot(after, "preview-0", [])),
  ).toContain("no more seizures");
});
