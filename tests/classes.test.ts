import { expect, it } from "vitest";
import { createRun, addPlayer, reduce } from "../src/engine/game";
import { enterCombat, validatePlan, resolveRound } from "../src/engine/combat";
import { effects, applyStatus, status, EMPOWERED } from "../src/engine/effects";
import { heroes, abilities } from "../src/content/heroes";
import { upgradeOffer } from "../src/content/upgrades";
import type { RunState } from "../src/shared/model";

function room(heroIds: string[]): RunState {
  let s = createRun("CLASSES", "test-classes");
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

it("gives every class a usable kit and a complete upgrade tree", () => {
  expect(heroes.length).toBe(8);
  for (const h of heroes) {
    const kit = abilities(h.id, 2);
    expect(kit.length).toBeGreaterThanOrEqual(6);
    // Every class can act for free, so nobody is ever locked out of a round.
    expect(kit.some((a) => a.cost === 0)).toBe(true);
    for (let line = 0; line < 3; line++) {
      const offer = upgradeOffer({
        heroId: h.id,
        upgrades: Array.from({ length: line }, (_, i) => `x${i}`),
      });
      expect(offer.length).toBe(2);
      expect(new Set(offer.map((u) => u.kind)).size).toBe(2);
    }
  }
});

it("raises outgoing damage while Empowered, before Guard", () => {
  const s = room(["herald", "vanguard"]);
  const [bard] = s.players;
  const enemy = s.enemies[0];
  enemy.hp = 500;
  enemy.guard = 4;
  bard.power = 0;
  const plain = enemy.hp;
  effects(s, bard, enemy, [{ kind: "damage", amount: 20 }]);
  const normal = plain - enemy.hp;
  applyStatus(bard, "empowered", 1, 2);
  const before = enemy.hp;
  effects(s, bard, enemy, [{ kind: "damage", amount: 20 }]);
  expect(normal).toBe(16);
  expect(before - enemy.hp).toBe(Math.round(20 * EMPOWERED) - 4);
});

it("charges a blood cost flat, ignoring power, armour and Vulnerable", () => {
  const s = room(["reaver", "vanguard"]);
  const [reaver] = s.players;
  reaver.power = 9;
  reaver.guard = 5;
  applyStatus(reaver, "vulnerable", 1, 2);
  const before = reaver.hp;
  effects(s, reaver, s.enemies[0], [
    { kind: "damage", amount: 12, self: true },
  ]);
  expect(before - reaver.hp).toBe(12);
});

it("lets a piercing hit ignore Guard entirely", () => {
  const s = room(["reaver", "vanguard"]);
  const [reaver] = s.players;
  const enemy = s.enemies[0];
  enemy.hp = 500;
  enemy.guard = 12;
  reaver.power = 0;
  const before = enemy.hp;
  effects(s, reaver, enemy, [{ kind: "damage", amount: 20, pierce: true }]);
  expect(before - enemy.hp).toBe(20);
});

it("applies an ally-row ability to everyone standing in that row", () => {
  const s = room(["herald", "vanguard", "warden"]);
  const [bard, tank, healer] = s.players;
  healer.row = "back";
  bard.row = "back";
  tank.row = "front";
  s.plans = { p0: { ability: "cadence", target: healer.id } };
  s.plans.p1 = { ability: "brace", target: tank.id };
  s.plans.p2 = { ability: "brace", target: healer.id };
  bard.resource = 7;
  resolveRound(s);
  expect(status(bard, "barrier")).toBeTruthy();
  expect(status(healer, "barrier")).toBeTruthy();
});

it("turns a confounded enemy on its own side", () => {
  const s = room(["beguiler", "vanguard"]);
  s.enemies.forEach((e) => {
    e.hp = 400;
    e.maxHp = 400;
    e.guard = 0;
  });
  expect(s.enemies.length).toBeGreaterThan(1);
  const attacker = s.enemies.find((e) =>
    e.intent.ability.effects.some((x) => x.kind === "damage"),
  )!;
  applyStatus(attacker, "confused", 1, 1);
  const heroHp = s.players.map((p) => p.hp);
  s.plans = {
    p0: { ability: "brace", target: "p0" },
    p1: { ability: "brace", target: "p1" },
  };
  resolveRound(s);
  expect(s.players.map((p) => p.hp)).toEqual(heroHp);
  expect(s.logs.some((l) => l.text.includes("on its own side"))).toBe(true);
});

it("refuses an ability billed to the treasury the party cannot cover", () => {
  const s = room(["broker", "vanguard"]);
  const [broker] = s.players;
  broker.resource = 6;
  s.gold = 10;
  expect(() => validatePlan(s, broker, "invest", s.enemies[0].id)).toThrow(
    "team gold",
  );
  s.gold = 500;
  expect(() =>
    validatePlan(s, broker, "invest", s.enemies[0].id),
  ).not.toThrow();
});
