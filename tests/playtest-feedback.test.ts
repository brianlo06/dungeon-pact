/**
 * The rules a friend playtest asked for, held where they can be checked.
 *
 * Each of these answers something that was reported as broken at the table —
 * a shop that charges twice, an attack that follows a hero out of the row it
 * announced — so they are worth more than their size suggests. The
 * presentation half of the same playtest is in `tests-browser/feedback.spec.ts`.
 */
import { it, expect } from "vitest";
import { createRun, addPlayer, reduce, snapshot } from "../src/engine/game";
import { enterShop } from "../src/engine/shop";
import {
  enterCombat,
  prepareIntents,
  resolveRound,
} from "../src/engine/combat";
import { generateMap } from "../src/engine/map";
import { items } from "../src/content/items";
import { hero } from "../src/content/heroes";
import { drillFor, evolutions, mentors } from "../src/content/evolutions";
import { epoch } from "../src/shared/protocol";
import type { RunState } from "../src/shared/model";
function party(count = 2) {
  const s = createRun("TESTROOM", "feedback");
  for (let i = 0; i < count; i++) addPlayer(s, `p${i}`, `Hero ${i}`);
  return s;
}
it("shop needs a majority and recipient consent, charges exactly once and never bids", () => {
  let s = party(3);
  s.gold = 1000;
  enterShop(s);
  const item = s.shop!.stock[0],
    price = items.find((i) => i.id === item)!.price;
  s.players[2].items = ["blood-price"];
  const oldEpoch = epoch(s);
  s = reduce(s, "p0", { type: "shopOffer", item, recipient: "p2" }, 0);
  expect(epoch(s)).not.toBe(oldEpoch);
  expect(() =>
    reduce(s, "p1", { type: "shopOffer", item, recipient: "p1" }, 0),
  ).toThrow();
  for (const id of ["p0", "p1"])
    s = reduce(s, id, { type: "shopApprove", approve: true }, 0);
  expect(s.gold).toBe(1000);
  expect(s.players[2].items).toContain("blood-price");
  s = reduce(s, "p2", { type: "shopApprove", approve: true }, 0);
  expect(s.gold).toBe(1000 - price);
  expect(s.players[2].items).toContain(item);
  expect(s.players[2].items).not.toContain("blood-price");
  expect(() =>
    reduce(s, "p2", { type: "shopApprove", approve: true }, 0),
  ).toThrow();
  expect(() =>
    reduce(s, "p2", { type: "shopOffer", item, recipient: "p1" }, 0),
  ).toThrow();
  expect(s.auction).toBeNull();
  expect(snapshot(s, "p2", []).shop?.sold).toContain(item);
});
it("declining leaves gold and inventory unchanged; everyone must agree to leave", () => {
  let s = party();
  enterShop(s);
  const gold = s.gold,
    item = s.shop!.stock[0];
  s = reduce(s, "p0", { type: "shopOffer", item, recipient: "p1" }, 0);
  expect(() => reduce(s, "p0", { type: "continue" }, 0)).toThrow();
  s = reduce(s, "p1", { type: "shopApprove", approve: false }, 0);
  expect(s.gold).toBe(gold);
  expect(s.shop!.proposal).toBeUndefined();
  s = reduce(s, "p0", { type: "continue" }, 0);
  expect(s.phase).toBe("SHOP");
  s = reduce(s, "p1", { type: "continue" }, 0);
  expect(s.phase).toBe("MAP");
  expect(s.shop).toBeUndefined();
});
it("map exchange nodes enter fixed-price shops", () => {
  let s = party();
  s.map = generateMap(s);
  s.currentNode = "0-0";
  s.phase = "MAP";
  s = reduce(s, "p0", { type: "vote", choice: "1-0" }, 0);
  s = reduce(s, "p1", { type: "vote", choice: "1-0" }, 0);
  expect(s.phase).toBe("SHOP");
  expect(s.shop!.stock).toHaveLength(5);
});
function fight() {
  const s = party();
  s.map = generateMap(s);
  s.currentNode = "0-0";
  enterCombat(s);
  s.players.forEach((p) => {
    p.row = "front";
    p.guard = 0;
    p.items = [];
  });
  s.enemies.slice(1).forEach((e) => (e.hp = 0));
  const e = s.enemies[0];
  e.hp = e.maxHp = 500;
  e.power = 0;
  e.intent = {
    ability: {
      id: "sweep",
      name: "Sweep",
      description: "Front row",
      target: "enemyRow",
      cost: 0,
      speed: 0,
      cooldown: 0,
      effects: [{ kind: "damage", amount: 20 }],
    },
    target: "p0",
    row: "front",
  };
  return s;
}
it("moving everyone out of an announced row dodges the attack without retargeting", () => {
  const s = fight(),
    hp = s.players.map((p) => p.hp);
  s.players.forEach(
    (p) => (s.plans[p.id] = { ability: "retreat", target: p.id }),
  );
  resolveRound(s);
  expect(s.players.map((p) => p.hp)).toEqual(hp);
  expect(
    s.logs.some((l) => l.text.includes("misses the empty front row")),
  ).toBe(true);
});
it("row attacks hit remaining occupants, not their original target after movement", () => {
  const s = fight();
  const before = s.players.map((p) => p.hp);
  s.plans.p0 = { ability: "retreat", target: "p0" };
  s.plans.p1 = { ability: "arrow", target: s.enemies[0].id };
  // No valid second action is required to test the announced enemy row.
  resolveRound(s);
  expect(s.players[0].hp).toBe(before[0]);
  expect(s.players[1].hp).toBeLessThan(before[1]);
});
it("legacy row intentions are anchored before movement and new intentions carry a row", () => {
  const s = fight();
  delete s.enemies[0].intent.row;
  s.players.forEach(
    (p) => (s.plans[p.id] = { ability: "retreat", target: p.id }),
  );
  const hp = s.players[0].hp;
  resolveRound(s);
  expect(s.players[0].hp).toBe(hp);
  s.enemies[0].definition = "bellows";
  s.round = 2;
  prepareIntents(s);
  for (const e of s.enemies)
    if (e.intent.ability.target === "enemyRow")
      expect(e.intent.row).toBeDefined();
});

it("stocks shelves with gear the party does not already own", () => {
  const s = party(2);
  const weapons = items.filter((i) => i.slot === "weapon");
  // Everything but one weapon is already carried, so only one shelf is honest.
  s.players[0].items = weapons.slice(1).map((i) => i.id);
  enterShop(s);
  const stocked = s.shop!.stock.map((id) => items.find((i) => i.id === id)!);
  expect(stocked.find((i) => i.slot === "weapon")!.id).toBe(weapons[0].id);
  // Supplies are consumed, so owning one does not take it off the shelf.
  expect(stocked.filter((i) => i.slot === "supply")).toHaveLength(2);
});

/**
 * A training ground teaches one class. Every mentor used to teach all eight,
 * so at every mentor the whole party evolved and a path stopped feeling like
 * it belonged to anyone: "you can just evolve into whatever you want to be,
 * from any character". A path was always class-locked by identity — a Ranger
 * could never take the Vanguard's — but nothing made that visible at the
 * table, because everyone walked out of every mentor changed.
 */
function atMentor(
  heroIds: string[],
  before?: (s: RunState) => void,
  open = false,
) {
  let s = createRun("MENTOR", "feedback-mentor");
  // The one-class rule now belongs to rooms from before open training.
  if (!open) delete s.trainingVersion;
  heroIds.forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  heroIds.forEach((heroId, i) => {
    s = reduce(s, `p${i}`, { type: "hero", hero: heroId }, 0);
  });
  s.gold = 2000;
  s.map = generateMap(s);
  // Entered the way the route enters it, from a chamber that links to it:
  // the taught class is drawn on entry, so no shortcut reaches that code.
  const node = s.map.find((n) => n.type === "mentor")!;
  const from = s.map.find((n) => n.next.includes(node.id))!;
  s.currentNode = from.id;
  s.phase = "MAP";
  before?.(s);
  // A route vote resolves the moment it is decided, so the last hero in a
  // quartet never gets to vote at all.
  for (const p of s.players) {
    if (s.phase !== "MAP") break;
    s = reduce(s, p.id, { type: "vote", choice: node.id }, 0);
  }
  return s;
}

it("a training ground evolves one class and drills the rest", () => {
  const s = atMentor(["vanguard", "arcanist", "ranger", "warden"]);
  expect(s.phase).toBe("MENTOR");
  const taught = s.mentorClass!;
  expect(s.players.some((p) => p.heroId === taught)).toBe(true);
  let run = s;
  for (const p of s.players)
    run = reduce(run, p.id, { type: "train", accept: true }, 0);
  const evolved = run.players.filter((p) => p.evolution);
  expect(evolved).toHaveLength(1);
  expect(evolved[0].heroId).toBe(taught);
  // Everyone else came away drilled, not empty-handed and not evolved.
  for (const p of run.players.filter((x) => !x.evolution))
    expect(p.power).toBeGreaterThan(hero(p.heroId).power);
});

it("draws the taught class from the party, passing over evolved heroes", () => {
  const open = atMentor(["vanguard", "arcanist"]);
  expect(["vanguard", "arcanist"]).toContain(open.mentorClass);
  // With the Vanguard's path already walked, the ground must offer to the one
  // hero who can still use it rather than to the one who cannot.
  const s = atMentor(["vanguard", "arcanist"], (run) => {
    run.players[0].evolution = evolutions.find(
      (e) => e.heroId === "vanguard",
    )!.id;
  });
  expect(s.mentorClass).toBe("arcanist");
});

it("charges the drill fee, not tuition, and never grants a path", () => {
  const s = atMentor(["vanguard", "arcanist", "ranger", "warden"]);
  const teacher = mentors.find((m) => m.id === s.mentorId)!;
  const student = s.players.find((p) => p.heroId !== s.mentorClass)!;
  const gold = s.gold,
    hp = student.maxHp;
  const after = reduce(s, student.id, { type: "train", accept: true }, 0);
  const drill = drillFor(teacher.tier);
  expect(after.gold).toBe(gold - drill.fee);
  const drilled = after.players.find((p) => p.id === student.id)!;
  expect(drilled.evolution).toBeUndefined();
  expect(drilled.maxHp).toBe(hp + drill.hp);
});

it("keeps the old open teaching for rooms that entered before the rule", () => {
  const s = atMentor(["vanguard", "arcanist", "ranger", "warden"]);
  const legacy = { ...s, mentorClass: undefined };
  const student = s.players.find((p) => p.heroId !== s.mentorClass)!;
  const after = reduce(legacy, student.id, { type: "train", accept: true }, 0);
  expect(
    after.players.find((p) => p.id === student.id)!.evolution,
  ).toBeTruthy();
});

/**
 * Open training. A later playtest found paths too rare: with one class taught
 * per ground, most of a trio or quartet never took theirs. A newer room lets
 * every hero who has not evolved take their path at any training ground.
 */
it("a newer room's training ground evolves every hero who has not evolved", () => {
  const s = atMentor(["vanguard", "arcanist", "ranger", "warden"], undefined, true);
  expect(s.phase).toBe("MENTOR");
  expect(s.mentorClass).toBeUndefined();
  const teacher = mentors.find((m) => m.id === s.mentorId)!;
  const gold = s.gold;
  let run = s;
  for (const p of s.players)
    run = reduce(run, p.id, { type: "train", accept: true }, 0);
  expect(run.players.every((p) => p.evolution)).toBe(true);
  // Each hero pays their own tuition from the shared purse.
  expect(run.gold).toBe(gold - 4 * teacher.tuition);
  expect(run.phase).toBe("MAP");
});

it("open training still drills a hero who already walks a path", () => {
  const s = atMentor(
    ["vanguard", "arcanist", "ranger"],
    (run) => {
      run.players[0].evolution = evolutions.find(
        (e) => e.heroId === "vanguard",
      )!.id;
    },
    true,
  );
  const teacher = mentors.find((m) => m.id === s.mentorId)!;
  const walked = s.players[0].evolution;
  const gold = s.gold;
  const after = reduce(s, "p0", { type: "train", accept: true }, 0);
  expect(after.players[0].evolution).toBe(walked);
  expect(after.gold).toBe(gold - drillFor(teacher.tier).fee);
});

it("open training draws nothing from the dice on entry", () => {
  const open = atMentor(["vanguard", "arcanist", "ranger"], undefined, true);
  const locked = atMentor(["vanguard", "arcanist", "ranger"]);
  // The one-class rule rolls for its class; open training must not, or every
  // draw after the chamber would shift for no reason.
  expect(open.rng).not.toBe(locked.rng);
});

it("a duo in a newer room keeps one class a ground", () => {
  const s = atMentor(["vanguard", "arcanist"], undefined, true);
  expect(["vanguard", "arcanist"]).toContain(s.mentorClass);
  let run = s;
  for (const p of s.players)
    run = reduce(run, p.id, { type: "train", accept: true }, 0);
  expect(run.players.filter((p) => p.evolution)).toHaveLength(1);
});
