import { expect, it } from "vitest";
import { createRun, addPlayer, reduce } from "../src/engine/game";
import { enterCombat, resolveRound, validatePlan } from "../src/engine/combat";
import { enterAuction, nextLot, purchase, CASE } from "../src/engine/auction";
import { effects } from "../src/engine/effects";
import { abilities, supplyFor } from "../src/content/heroes";
import { items, supplies } from "../src/content/items";
import { enemies, enemyAbilities } from "../src/content/enemies";
import { validateContent } from "../src/content/validate";
import type { RunState } from "../src/shared/model";

function room(heroIds: string[]): RunState {
  let s = createRun("SUPPLY", "test-supplies");
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

it("sells one thing each class would otherwise be the only source of", () => {
  expect(supplies.length).toBeGreaterThanOrEqual(5);
  const sold = supplies.flatMap((i) => i.use!.effects.map((e) => e.kind));
  for (const kind of ["heal", "status", "removeStatus", "interrupt"])
    expect(sold).toContain(kind);
  // A supply is its action and nothing else, and never costs resource on top
  // of the action it already costs. validateContent enforces both.
  for (const i of supplies) {
    expect(i.effects).toEqual([]);
    expect(i.trigger).toBe("use");
    expect(i.use!.cost).toBe(0);
  }
  expect(() => validateContent()).not.toThrow();
});

it("grants an action only while carried, and spends a copy on use", () => {
  const s = room(["ranger", "ranger"]);
  const p = s.players[0];
  const kit = () =>
    abilities(p.heroId, s.combatVersion, p.upgrades, p.evolution, p.items);

  expect(kit().some((a) => a.id === "use-field-dressing")).toBe(false);
  p.items = ["field-dressing", "field-dressing"];
  expect(kit().filter((a) => a.id === "use-field-dressing")).toHaveLength(1);

  const hurt = s.players[1];
  hurt.hp = 20;
  s.plans = {
    [p.id]: { ability: "use-field-dressing", target: hurt.id },
    [hurt.id]: { ability: "brace", target: hurt.id },
  };
  resolveRound(s);

  expect(hurt.hp).toBeGreaterThan(20);
  // One copy gone, one left, and the action is still offered.
  expect(p.items).toEqual(["field-dressing"]);
  expect(kit().some((a) => a.id === "use-field-dressing")).toBe(true);
});

it("refuses a supply action once the last copy is gone", () => {
  const s = room(["ranger", "ranger"]);
  const p = s.players[0];
  p.items = ["field-dressing"];
  expect(() =>
    validatePlan(s, p, "use-field-dressing", s.players[1].id),
  ).not.toThrow();
  p.items = [];
  expect(() =>
    validatePlan(s, p, "use-field-dressing", s.players[1].id),
  ).toThrow();
});

it("packs supplies alongside equipment instead of displacing it", () => {
  const s = room(["ranger", "ranger"]);
  const p = s.players[0];
  p.items = ["thornmail"];
  s.gold = 1000;
  s.auction = {
    itemId: "field-dressing",
    revealed: true,
    price: 80,
    active: [p.id],
    acted: [],
    stage: "approval",
    owner: p.id,
    approvals: {},
    round: 1,
  };
  purchase(s);

  // A case, and the armour is still worn.
  expect(p.items.filter((id) => id === "field-dressing")).toHaveLength(CASE);
  expect(p.items).toContain("thornmail");
});

it("closes every exchange with the consumables tray", () => {
  const s = room(["ranger", "ranger"]);
  const seen: string[] = [];
  enterAuction(s, false);
  do seen.push(s.auction!.itemId);
  while (nextLot(s));

  const slot = (id: string) => items.find((i) => i.id === id)!.slot;
  expect(seen.length).toBeGreaterThan(1);
  expect(slot(seen.at(-1)!)).toBe("supply");
  // ...and only the last one, so equipment lots are not crowded out.
  for (const id of seen.slice(0, -1)) expect(slot(id)).not.toBe("supply");
});

it("leaves supplies out of a seizure: an appraiser takes what is worn", () => {
  const s = room(["ranger", "ranger"]);
  const p = s.players[0];
  p.items = ["field-dressing", "thornmail"];
  const seize = enemyAbilities(
    enemies.find((d) => d.id === "collector")!,
    2,
  ).find((a) => a.effects.some((e) => e.kind === "seize"))!;

  effects(s, s.enemies[0], p, seize.effects);
  expect(p.items).toEqual(["field-dressing"]);
});

it("never grants a supply action in a legacy room", () => {
  const p = { heroId: "ranger", items: ["field-dressing"] };
  expect(
    abilities(p.heroId, undefined, [], undefined, p.items).some((a) =>
      a.id.startsWith("use-"),
    ),
  ).toBe(false);
});

it("names the supply an action came from, and nothing else", () => {
  expect(supplyFor("use-field-dressing")?.id).toBe("field-dressing");
  expect(supplyFor("brace")).toBeUndefined();
  expect(supplyFor("arrow")).toBeUndefined();
});

it("prices a container against the party's actions, not its headcount", () => {
  const cost = (players: number) => {
    const s = room(Array.from({ length: players }, () => "ranger"));
    const p = s.players[0];
    p.items = ["thornmail"];
    const seize = enemyAbilities(
      enemies.find((d) => d.id === "collector")!,
      2,
    ).find((a) => a.effects.some((e) => e.kind === "seize"))!;
    effects(s, s.enemies[0], p, seize.effects);
    const box = s.enemies.find((e) => e.definition === "strongbox")!;
    // Health per hero: a duo and a quartet should spend the same share of a
    // round opening it, which is what scaling straight off the party gives.
    return box.maxHp / players;
  };
  expect(cost(2)).toBeCloseTo(cost(4), 0);
});
