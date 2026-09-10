import { expect, it } from "vitest";
import { createRun, addPlayer, reduce } from "../src/engine/game";
import {
  enterCombat,
  resolveRound,
  reviveCost,
  pressure,
  PATIENCE,
} from "../src/engine/combat";
import { abilities } from "../src/content/heroes";
import { upgradeOffer, upgrades, lines } from "../src/content/upgrades";
import { effects } from "../src/engine/effects";
import type { RunState } from "../src/shared/model";

function room(heroIds: string[], legacy = false): RunState {
  let s = createRun("UPGRADES", "test-upgrades");
  heroIds.forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  heroIds.forEach((id, i) => {
    s = reduce(s, `p${i}`, { type: "hero", hero: id }, 0);
  });
  if (legacy) {
    delete s.combatVersion;
    delete s.encounterVersion;
  }
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
  return s;
}

it("offers two branches per line, always including a defensive option", () => {
  for (const heroId of ["vanguard", "arcanist", "ranger", "warden"]) {
    expect(lines(heroId)).toBe(3);
    for (let line = 0; line < lines(heroId); line++) {
      const taken = upgrades
        .filter((u) => u.heroId === heroId && u.line < line)
        .filter((u) => u.kind === "force")
        .map((u) => u.id);
      const offer = upgradeOffer({ heroId, upgrades: taken });
      expect(offer.every((u) => u.line === line)).toBe(true);
      expect(offer.length).toBe(2);
      expect(offer.some((u) => u.kind === "guard")).toBe(true);
    }
  }
});

it("patches abilities in place without changing their ids", () => {
  const plain = abilities("ranger", 2).find((a) => a.id === "arrow")!;
  const upgraded = abilities("ranger", 2, ["rng-arrow-broadhead"]).find(
    (a) => a.id === "arrow",
  )!;
  expect(upgraded.id).toBe("arrow");
  expect(upgraded.name).not.toBe(plain.name);
  const base = (a: typeof plain) =>
    a.effects.find((e) => e.kind === "damage")!.amount;
  expect(base(upgraded)).toBe(base(plain) + 7);
});

it("keeps upgrades out of legacy saves", () => {
  const chosen = ["rng-arrow-broadhead"];
  expect(
    abilities("ranger", undefined, chosen).find((a) => a.id === "arrow")!.name,
  ).toBe("True shot");
});

it("sends self-flagged healing to the attacker, not the enemy", () => {
  const s = room(["arcanist", "vanguard"]);
  enterCombat(s);
  const [mage] = s.players;
  const enemy = s.enemies[0];
  mage.hp = 40;
  const enemyHp = enemy.hp;
  effects(s, mage, enemy, [{ kind: "heal", amount: 8, self: true }]);
  expect(mage.hp).toBe(48);
  expect(enemy.hp).toBe(enemyHp);
});

it("routes a cleared chamber through one branch pick per hero", () => {
  let s = room(["vanguard", "arcanist"]);
  enterCombat(s);
  for (const e of s.enemies) e.hp = 0;
  s.plans = {};
  s.phase = "COMBAT";
  resolveRound(s);
  expect(s.phase).toBe("UPGRADE");
  const first = upgradeOffer(s.players[0])[0];
  s = reduce(s, "p0", { type: "upgrade", choice: first.id }, 0);
  expect(s.phase).toBe("UPGRADE");
  expect(() =>
    reduce(s, "p0", { type: "upgrade", choice: first.id }, 0),
  ).toThrow();
  expect(() =>
    reduce(s, "p1", { type: "upgrade", choice: first.id }, 0),
  ).toThrow("not on offer");
  const second = upgradeOffer(s.players[1])[1];
  s = reduce(s, "p1", { type: "upgrade", choice: second.id }, 0);
  expect(s.phase).toBe("REWARD");
  expect(s.players[0].upgrades).toEqual([first.id]);
  expect(s.players[1].upgrades).toEqual([second.id]);
  expect(s.votes).toEqual({});
});

it("prices each battlefield revival above the last", () => {
  const s = room(["warden", "vanguard"]);
  expect(reviveCost(s)).toBe(90);
  s.revivals = 2;
  expect(reviveCost(s)).toBe(210);
  const legacy = room(["warden", "vanguard"], true);
  legacy.revivals = 2;
  expect(reviveCost(legacy)).toBe(90);
});

it("escalates only after the patience window, and never in legacy saves", () => {
  const s = room(["vanguard", "warden"]);
  s.round = PATIENCE;
  expect(pressure(s)).toBe(0);
  s.round = PATIENCE + 2;
  expect(pressure(s)).toBe(6);
  const legacy = room(["vanguard", "warden"], true);
  legacy.round = 20;
  expect(pressure(legacy)).toBe(0);
});

/**
 * Saves written before this pass have no combatVersion, no upgrades array and
 * no revivals counter. They must keep their old rules and never enter the new
 * phase.
 */
it("carries an existing save through a victory without upgrades", () => {
  const s = room(["vanguard", "arcanist"], true);
  for (const p of s.players) delete p.upgrades;
  enterCombat(s);
  expect(
    abilities(s.players[0].heroId, s.combatVersion, s.players[0].upgrades),
  ).toBeDefined();
  for (const e of s.enemies) e.hp = 0;
  s.plans = {};
  resolveRound(s);
  expect(s.phase).toBe("REWARD");
  expect(s.players.every((p) => p.upgrades === undefined)).toBe(true);
});
