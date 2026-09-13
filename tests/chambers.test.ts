/**
 * The four chambers added after the playtest asked for "more spice": a toll
 * gate, a hazard chamber, a shrine and a workbench. Each is built on a system
 * the game already had, and each test holds the rule that makes it a decision
 * rather than a formality.
 */
import { expect, it } from "vitest";
import { createRun, addPlayer, reduce } from "../src/engine/game";
import { resolveRound } from "../src/engine/combat";
import {
  COLLAPSE_ROUND,
  OFFERINGS,
  VENT_SCALD,
  applyHazard,
  enterHazard,
  enterShrine,
  enterToll,
  tollPrice,
} from "../src/engine/chambers";
import { enterForge, forgeKey, reforgeCost } from "../src/engine/shop";
import { REFORGE, reforge, trigger } from "../src/engine/effects";
import { generateMap } from "../src/engine/map";
import { items } from "../src/content/items";
import type { RunState } from "../src/shared/model";

function party(heroes = ["vanguard", "warden"]): RunState {
  let s = createRun("CHAMBER", "chambers-test");
  heroes.forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  heroes.forEach((hero, i) => {
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.gold = 1000;
  s.map = generateMap(s);
  s.currentNode = s.map[0].id;
  return s;
}

// ------------------------------------------------------------------ toll gate

it("a toll gate lets a paying party through unharmed and unrewarded", () => {
  let s = party();
  enterToll(s);
  expect(s.phase).toBe("TOLL");
  const price = tollPrice(s);
  for (const p of s.players)
    if (s.phase === "TOLL")
      s = reduce(s, p.id, { type: "vote", choice: "pay" }, 0);
  expect(s.phase).toBe("MAP");
  expect(s.gold).toBe(1000 - price);
  expect(s.enemies.every((e) => e.hp <= 0) || !s.enemies.length).toBe(true);
});

it("a toll gate refused is a fight at the gate", () => {
  let s = party();
  enterToll(s);
  for (const p of s.players)
    if (s.phase === "TOLL")
      s = reduce(s, p.id, { type: "vote", choice: "fight" }, 0);
  expect(s.phase).toBe("COMBAT");
  expect(s.gold).toBe(1000);
  expect(s.enemies.some((e) => e.hp > 0)).toBe(true);
});

it("a toll gate will not take a vote to pay what the purse does not hold", () => {
  const s = party();
  s.gold = 10;
  enterToll(s);
  expect(() => reduce(s, "p0", { type: "vote", choice: "pay" }, 0)).toThrow(
    "cannot cover",
  );
});

it("asks more a floor down", () => {
  expect(tollPrice({ floor: 2 })).toBeGreaterThan(tollPrice({ floor: 1 }));
});

// ------------------------------------------------------------- hazard chamber

it("vents scald the front row at every round start, and spare the back", () => {
  const s = party();
  enterHazard(s);
  s.hazard = "vents";
  const [front, back] = s.players;
  front.row = "front";
  back.row = "back";
  front.statuses = [];
  const before = { front: front.hp, back: back.hp };
  applyHazard(s);
  expect(front.hp).toBe(before.front - VENT_SCALD);
  expect(back.hp).toBe(before.back);
});

it("vents never strike the first round, before the party has seen them", () => {
  let hurt = false;
  for (let seed = 0; seed < 20 && !hurt; seed++) {
    const s = party();
    s.rng = createRun("V", `vents-${seed}`).rng;
    s.players.forEach((p) => (p.row = "front"));
    const before = s.players.map((p) => p.hp);
    enterHazard(s);
    if (s.hazard !== "vents") continue;
    expect(s.players.map((p) => p.hp)).toEqual(before);
    hurt = true;
  }
  expect(hurt).toBe(true);
});

it("vents are absorbed by barrier like any other hit", () => {
  const s = party();
  enterHazard(s);
  s.hazard = "vents";
  const hero = s.players[0];
  hero.row = "front";
  hero.statuses = [{ id: "barrier", stacks: 20, duration: 2 }];
  const hp = hero.hp;
  applyHazard(s);
  expect(hero.hp).toBe(hp);
});

it("a collapse drops the back row forward on its round, and not before", () => {
  const s = party();
  enterHazard(s);
  s.hazard = "collapse";
  s.players.forEach((p) => (p.row = "back"));
  s.round = COLLAPSE_ROUND - 1;
  applyHazard(s);
  expect(s.players.every((p) => p.row === "back")).toBe(true);
  s.round = COLLAPSE_ROUND;
  applyHazard(s);
  expect(s.players.every((p) => p.row === "front")).toBe(true);
});

it("pays more than an ordinary fight and clears its hazard when won", () => {
  const s = party();
  s.currentNode = s.map[0].id;
  s.map[0].type = "hazard";
  enterHazard(s);
  for (const e of s.enemies) e.hp = 0;
  s.plans = {};
  resolveRound(s);
  expect(s.reward).toBeGreaterThan(110);
  expect(s.hazard).toBeUndefined();
});

// ------------------------------------------------------------------- shrine

it("a shrine answers exactly one hero, then goes dark", () => {
  let s = party(["vanguard", "warden", "ranger"]);
  enterShrine(s);
  const [first, second] = s.players;
  const power = first.power;
  s = reduce(s, first.id, { type: "shrine", offering: "blood" }, 0);
  const taker = s.players.find((p) => p.id === first.id)!;
  expect(taker.power).toBe(power + OFFERINGS.blood.power);
  // Having answered someone, the altar is gone: nobody else can strike it.
  expect(s.phase).toBe("MAP");
  expect(() =>
    reduce(s, second.id, { type: "shrine", offering: "blood" }, 0),
  ).toThrow();
});

it("a blood offering costs maximum health; a gold offering costs the purse", () => {
  let s = party();
  enterShrine(s);
  const hero = s.players[0];
  const maxHp = hero.maxHp;
  s = reduce(s, hero.id, { type: "shrine", offering: "blood" }, 0);
  expect(s.players[0].maxHp).toBe(maxHp + OFFERINGS.blood.maxHp);

  let g = party();
  enterShrine(g);
  const gold = g.gold;
  g = reduce(g, "p0", { type: "shrine", offering: "gold" }, 0);
  expect(g.gold).toBe(gold - OFFERINGS.gold.gold);
  expect(g.players[0].maxHp).toBe(party().players[0].maxHp);
});

it("a shrine everyone walks past closes without charging anyone", () => {
  let s = party();
  enterShrine(s);
  const gold = s.gold;
  s = reduce(s, "p0", { type: "shrine", offering: "leave" }, 0);
  expect(s.phase).toBe("SHRINE");
  s = reduce(s, "p1", { type: "shrine", offering: "leave" }, 0);
  expect(s.phase).toBe("MAP");
  expect(s.gold).toBe(gold);
});

// ---------------------------------------------------------------- workbench

it("a workbench stocks what the party wears, keyed to who wears it", () => {
  const s = party();
  s.players[0].items = ["thornmail"];
  s.players[1].items = ["thornmail", "stormglass"];
  enterForge(s);
  expect(s.phase).toBe("SHOP");
  expect(s.shop!.kind).toBe("forge");
  expect(s.shop!.stock).toEqual(
    expect.arrayContaining([
      forgeKey("p0", "thornmail"),
      forgeKey("p1", "thornmail"),
      forgeKey("p1", "stormglass"),
    ]),
  );
});

it("reforges a piece for its owner only, once, at a reforge price", () => {
  let s = party();
  s.players[0].items = ["stormglass"];
  enterForge(s);
  const key = forgeKey("p0", "stormglass");
  // A piece is reforged for the hero carrying it, not handed to someone else.
  expect(() =>
    reduce(s, "p0", { type: "shopOffer", item: key, recipient: "p1" }, 0),
  ).toThrow("carries it");
  s = reduce(s, "p0", { type: "shopOffer", item: key, recipient: "p0" }, 0);
  for (const id of ["p0", "p1"])
    s = reduce(s, id, { type: "shopApprove", approve: true }, 0);
  const price = reforgeCost(items.find((i) => i.id === "stormglass")!);
  expect(s.gold).toBe(1000 - price);
  expect(s.players[0].reforged).toEqual(["stormglass"]);
  // The piece is still worn, not duplicated.
  expect(s.players[0].items).toEqual(["stormglass"]);
});

it("a reforged piece strikes half again as hard", () => {
  const stormglass = items.find((i) => i.id === "stormglass")!;
  const damage = stormglass.effects.find((e) => e.kind === "damage")!;
  const stronger = reforge(stormglass.effects).find(
    (e) => e.kind === "damage",
  )!;
  expect(stronger.kind === "damage" && stronger.amount).toBe(
    damage.kind === "damage" && Math.round(damage.amount * REFORGE),
  );
});

it("fires the reforged effects in a fight, and the plain ones otherwise", () => {
  const fight = (reforged: boolean) => {
    const s = party();
    enterHazard(s);
    s.hazard = undefined;
    const hero = s.players[0];
    hero.items = ["stormglass"];
    if (reforged) hero.reforged = ["stormglass"];
    const target = s.enemies.find((e) => e.hp > 0)!;
    target.statuses = [];
    target.guard = 0;
    const hp = target.hp;
    trigger(s, hero, target, "afterAttack");
    return hp - target.hp;
  };
  expect(fight(true)).toBeGreaterThan(fight(false));
});

// ------------------------------------------------------------------- the map

it("every chamber type a floor can draw has somewhere to go", () => {
  const seen = new Set<string>();
  for (let seed = 0; seed < 60; seed++) {
    let s = party();
    s = { ...s, rng: createRun("X", `route-${seed}`).rng };
    s.map = generateMap(s);
    for (const n of s.map) seen.add(n.type);
  }
  for (const t of ["toll", "hazard", "shrine", "forge"])
    expect(seen.has(t)).toBe(true);
});
