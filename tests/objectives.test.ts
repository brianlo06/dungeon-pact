import { expect, it } from "vitest";
import { createRun, addPlayer, reduce } from "../src/engine/game";
import {
  combatants,
  enterCombat,
  prepareIntents,
  resolveRound,
} from "../src/engine/combat";
import { effects, gain } from "../src/engine/effects";
import { enemies, enemyAbilities, isObject } from "../src/content/enemies";
import type { Enemy, RunState } from "../src/shared/model";

/** A boss chamber with the given boss already in place and a known party. */
function vault(bossId: "collector" | "miser", heroIds: string[]): RunState {
  let s = createRun("OBJECTIVE", "test-objectives");
  heroIds.forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  heroIds.forEach((id, i) => {
    s = reduce(s, `p${i}`, { type: "hero", hero: id }, 0);
  });
  s.map = [
    {
      id: "vault",
      depth: 6,
      lane: 0,
      type: "boss",
      name: "The Counting House",
      next: [],
      visited: true,
    },
  ];
  s.currentNode = "vault";
  enterCombat(s, true);
  const def = enemies.find((d) => d.id === bossId)!;
  const boss = s.enemies[0];
  boss.definition = def.id;
  boss.name = def.name;
  boss.power = def.power;
  boss.guard = def.guard;
  return s;
}

const box = (s: RunState) =>
  s.enemies.find((e) => e.definition === "strongbox");
/** The boss's own rotation entry that carries the objective. */
const objective = (id: string, name: string) =>
  enemyAbilities(
    enemies.find((d) => d.id === id)!,
    2,
  ).find((a) => a.name === name)!;

it("states each boss objective before the first round", () => {
  const s = vault("collector", ["vanguard", "arcanist"]);
  // enterCombat logs the objective of whichever boss it rolled; either way the
  // party is told what the fight is about rather than only how hard it hits.
  const briefed = enemies
    .filter((d) => d.boss)
    .some((d) => s.logs.some((l) => l.text.includes(d.objective!)));
  expect(briefed).toBe(true);
});

it("banks a hero's best equipment and hands it back when the box breaks", () => {
  const s = vault("collector", ["vanguard", "arcanist"]);
  const hero = s.players[0];
  hero.items = ["thornmail", "blood-price"];
  hero.row = "front";

  effects(
    s,
    s.enemies[0],
    hero,
    objective("collector", "Repossess — the collateral").effects,
  );

  // Blood Price is the dearer of the two, so that is what an appraiser takes.
  expect(hero.items).toEqual(["thornmail"]);
  expect(box(s)!.holding).toEqual([
    { playerId: hero.id, itemId: "blood-price" },
  ]);

  box(s)!.hp = 1;
  effects(s, s.players[0], box(s)!, [{ kind: "damage", amount: 99 }]);
  expect(box(s)!.hp).toBe(0);
  expect(hero.items.sort()).toEqual(["blood-price", "thornmail"]);
  expect(box(s)!.holding).toEqual([]);
});

it("seizes nothing more once the box has been broken open", () => {
  const s = vault("collector", ["vanguard", "arcanist"]);
  const hero = s.players[0];
  hero.items = ["thornmail", "blood-price"];
  const seize = objective("collector", "Repossess — the collateral").effects;

  effects(s, s.enemies[0], hero, seize);
  expect(box(s)!.holding).toHaveLength(1);

  // Broken open. The second seizure finds nothing left to take from.
  box(s)!.hp = 0;
  effects(s, s.enemies[0], hero, seize);

  expect(hero.items).toEqual(["thornmail"]);
  expect(box(s)!.holding).toHaveLength(1);
  expect(s.enemies.filter((e) => e.definition === "strongbox")).toHaveLength(1);
});

it("never lets a container decide whether a chamber has been cleared", () => {
  const s = vault("collector", ["vanguard", "arcanist"]);
  const hero = s.players[0];
  hero.items = ["thornmail"];
  effects(
    s,
    s.enemies[0],
    hero,
    objective("collector", "Repossess — the collateral").effects,
  );
  expect(box(s)).toBeTruthy();

  // The boss falls; the strongbox is still standing and still holding.
  for (const e of s.enemies) if (!isObject(e.definition)) e.hp = 0;
  s.plans = {};
  resolveRound(s);

  expect(combatants(s).every((e) => e.hp <= 0)).toBe(true);
  expect(s.outcome).toBe("victory");
  // Nothing seized outlives the chamber it was taken in.
  expect(hero.items).toEqual(["thornmail"]);
});

it("shields the Miser for a hoard but not for a working balance", () => {
  const s = vault("miser", ["vanguard", "arcanist"]);
  const miser = s.enemies[0];
  const ledger = objective("miser", "Weight of wealth").effects.filter(
    (e) => e.kind === "bank",
  );
  expect(ledger.length).toBe(1);

  s.gold = 100;
  effects(s, miser, s.players[0], ledger);
  expect(miser.statuses.find((x) => x.id === "barrier")).toBeUndefined();

  s.gold = 700;
  effects(s, miser, s.players[0], ledger);
  const shielded = miser.statuses.find((x) => x.id === "barrier")!.stacks;
  expect(shielded).toBeGreaterThan(20);

  // Spending the treasury is the counterplay, so a poorer party is shielded less.
  miser.statuses = [];
  s.gold = 400;
  effects(s, miser, s.players[0], ledger);
  expect(miser.statuses.find((x) => x.id === "barrier")!.stacks).toBeLessThan(
    shielded,
  );
});

it("keeps containers out of ordinary encounters", () => {
  for (let i = 0; i < 40; i++) {
    let s = createRun("OBJECTIVE", `encounter-${i}`);
    for (let n = 0; n < 4; n++) addPlayer(s, `p${n}`, `Hero ${n}`);
    s = reduce(s, "p0", { type: "hero", hero: "vanguard" }, 0);
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
    expect(s.enemies.some((e) => isObject(e.definition))).toBe(false);
  }
});

it("leaves legacy rooms with their old boss rotations", () => {
  const legacy = enemies.find((d) => d.id === "collector")!;
  expect(
    enemyAbilities(legacy, undefined).some((a) =>
      a.effects.some((e) => e.kind === "seize"),
    ),
  ).toBe(false);
  expect(
    enemyAbilities(
      enemies.find((d) => d.id === "miser")!,
      undefined,
    ).some((a) => a.effects.some((e) => e.kind === "bank")),
  ).toBe(false);
});

it("does not let a standing container keep acting after the fight is decided", () => {
  const s = vault("collector", ["vanguard", "arcanist"]);
  s.players[0].items = ["thornmail"];
  effects(
    s,
    s.enemies[0],
    s.players[0],
    objective("collector", "Repossess — the collateral").effects,
  );
  const container = box(s)!;
  container.hp = container.maxHp;
  for (const e of s.enemies) if (!isObject(e.definition)) e.hp = 0;
  prepareIntents(s);
  const before = container.statuses.length;
  s.plans = {};
  resolveRound(s);
  expect(container.statuses.length).toBe(before);
});

it("prices a treasury shield off gold the party actually holds", () => {
  const s = vault("miser", ["vanguard", "arcanist"]);
  s.gold = 0;
  gain(s, 1000);
  const miser = s.enemies[0] as Enemy;
  effects(s, miser, s.players[0], [{ kind: "bank", per: 10, free: 0 }]);
  expect(miser.statuses.find((x) => x.id === "barrier")!.stacks).toBe(100);
});
