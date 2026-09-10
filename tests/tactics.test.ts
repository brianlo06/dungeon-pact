import { expect, it } from "vitest";
import { createRun, addPlayer, reduce } from "../src/engine/game";
import {
  enterCombat,
  prepareIntents,
  validatePlan,
  resolveRound,
} from "../src/engine/combat";
import { effects, applyStatus, status } from "../src/engine/effects";
import { abilities } from "../src/content/heroes";
import type { RunState } from "../src/shared/model";
function room(): RunState {
  let s = createRun("TACTICAL", "test-tactics");
  addPlayer(s, "tank", "Tank");
  addPlayer(s, "mage", "Mage");
  s = reduce(s, "mage", { type: "hero", hero: "arcanist" }, 0);
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
it("intercepts exactly one hit, using the protector’s armor and barrier", () => {
  const s = room();
  const [tank, mage] = s.players;
  const e = s.enemies[0];
  e.power = 0;
  effects(s, tank, mage, [{ kind: "protect", barrier: 12 }]);
  effects(s, e, mage, [{ kind: "damage", amount: 30 }]);
  expect(mage.hp).toBe(mage.maxHp);
  expect(tank.hp).toBe(tank.maxHp - 14);
  expect(status(mage, "guarded")).toBeUndefined();
  effects(s, e, mage, [{ kind: "damage", amount: 30 }]);
  expect(mage.hp).toBe(mage.maxHp - 29);
});
it("moves an intercepted hit’s status rider to the protector", () => {
  const s = room();
  const [tank, mage] = s.players;
  effects(s, tank, mage, [{ kind: "protect", barrier: 12 }]);
  effects(s, s.enemies[0], mage, [
    { kind: "damage", amount: 10 },
    { kind: "status", status: "burn", stacks: 3, duration: 2 },
  ]);
  expect(status(tank, "burn")?.stacks).toBe(3);
  expect(status(mage, "burn")).toBeUndefined();
});
it("does not route damage to a fallen protector or to a guarded corpse", () => {
  const s = room();
  const [tank, mage] = s.players;
  effects(s, tank, mage, [{ kind: "protect", barrier: 12 }]);
  tank.hp = 0;
  effects(s, s.enemies[0], mage, [{ kind: "damage", amount: 20 }]);
  expect(mage.hp).toBeLessThan(mage.maxHp);
  expect(tank.hp).toBe(0);
});
it("weakens every hit before target guard is applied", () => {
  const s = room();
  const e = s.enemies[0],
    p = s.players[0];
  e.power = 0;
  p.guard = 4;
  applyStatus(e, "weak", 1, 1);
  effects(s, e, p, [
    { kind: "damage", amount: 20 },
    { kind: "damage", amount: 20 },
  ]);
  expect(p.hp).toBe(p.maxHp - 22);
});
it("interrupts a windup without granting unlimited counterspells", () => {
  const s = room();
  s.enemies = s.enemies.slice(0, 1);
  s.enemies[0].definition = "acolyte";
  s.enemies[0].hp = 500;
  s.enemies[0].maxHp = 500;
  s.round = 2;
  prepareIntents(s);
  expect(s.enemies[0].intent.ability.interruptible).toBe(true);
  s.plans = {
    tank: { ability: "brace", target: "tank" },
    mage: { ability: "counterspell", target: s.enemies[0].id },
  };
  const hp = s.players.map((p) => p.hp);
  resolveRound(s);
  expect(s.players.map((p) => p.hp)).toEqual(hp);
  expect(s.players[1].resource).toBe(5);
  expect(s.players[1].cooldowns.counterspell).toBe(2);
  expect(s.logs.some((l) => l.text.includes("loses its Cinder eruption"))).toBe(
    true,
  );
  expect(() =>
    validatePlan(s, s.players[1], "counterspell", s.enemies[0].id),
  ).toThrow();
});
it("rejects interruption on normal attacks without spending resource", () => {
  const s = room();
  s.enemies[0].intent.ability.interruptible = false;
  expect(() =>
    validatePlan(s, s.players[1], "counterspell", s.enemies[0].id),
  ).toThrow("WINDUP");
  expect(s.players[1].resource).toBe(8);
});
it("strips enemy barrier before subsequent damage", () => {
  const s = room();
  const e = s.enemies[0];
  e.hp = 100;
  e.guard = 0;
  s.players[0].power = 0;
  applyStatus(e, "barrier", 80, 2);
  effects(s, s.players[0], e, [
    { kind: "removeStatus", status: "barrier" },
    { kind: "damage", amount: 10 },
  ]);
  expect(e.hp).toBe(90);
  expect(status(e, "barrier")).toBeUndefined();
});
it("enemy fortification targets itself, never grants the party free shields", () => {
  const s = room();
  s.enemies[0].definition = "bulwark";
  s.round = 1;
  prepareIntents(s);
  expect(s.enemies[0].intent.target).toBe(s.enemies[0].id);
  expect(s.enemies[0].intent.ability.target).toBe("self");
});
it("preserves legacy skills in existing saves", () => {
  expect(abilities("arcanist").some((a) => a.id === "counterspell")).toBe(
    false,
  );
  expect(abilities("arcanist", 2).some((a) => a.id === "counterspell")).toBe(
    true,
  );
  expect(
    abilities("vanguard").find((a) => a.id === "intercept")!.effects[0].kind,
  ).toBe("status");
  expect(
    abilities("vanguard", 2).find((a) => a.id === "intercept")!.effects[0].kind,
  ).toBe("protect");
});

it("stops a multi-attack when retaliation defeats its source between hits", () => {
  const s = room();
  const defender = s.players[0];
  defender.items = ["thornmail"];
  const enemy = s.enemies[0];
  enemy.hp = 1;
  enemy.guard = 0;
  enemy.power = 0;
  effects(s, enemy, defender, [
    { kind: "damage", amount: 10 },
    { kind: "damage", amount: 10 },
  ]);
  expect(enemy.hp).toBe(0);
  expect(defender.hp).toBe(defender.maxHp - 6);
});
