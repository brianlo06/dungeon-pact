/**
 * Leaving mid-run. Every party decision waits on the whole party, so a hero
 * who walks out must not leave the rest waiting on them: each test holds one
 * gate that has to open once the leaver is gone.
 */
import { expect, it } from "vitest";
import { createRun, addPlayer, reduce, removePlayer } from "../src/engine/game";
import { enterCombat } from "../src/engine/combat";
import { enterShop } from "../src/engine/shop";
import { generateMap, availableNodes } from "../src/engine/map";
import type { RunState } from "../src/shared/model";

function party(count = 3): RunState {
  const s = createRun("LEAVING1", "leave-test");
  for (let i = 0; i < count; i++) addPlayer(s, `p${i}`, `Hero ${i}`);
  s.phase = "MAP";
  s.gold = 1000;
  s.map = generateMap(s);
  return s;
}

it("settles a camp vote the leaver was holding up", () => {
  let s = party();
  s.phase = "CAMP";
  s = reduce(s, "p0", { type: "vote", choice: "rest" }, 0);
  s = reduce(s, "p1", { type: "vote", choice: "train" }, 0);
  expect(s.phase).toBe("CAMP");
  removePlayer(s, "p2");
  expect(s.phase).toBe("MAP");
  expect(s.votes).toEqual({});
});

it("drops the leaver's own vote", () => {
  let s = party();
  const [a] = availableNodes(s);
  s = reduce(s, "p2", { type: "vote", choice: a.id }, 0);
  removePlayer(s, "p2");
  expect(s.votes).toEqual({});
  expect(s.phase).toBe("MAP");
});

it("resolves the combat round once everyone left standing has locked", () => {
  let s = party(2);
  enterCombat(s);
  s = reduce(
    s,
    "p0",
    { type: "plan", ability: "bash", target: s.enemies[0].id },
    0,
  );
  const round = s.round;
  removePlayer(s, "p1");
  expect(s.round).toBe(round + 1);
});

it("hands back a plan aimed at the leaver instead of letting it fizzle", () => {
  const s = party();
  enterCombat(s);
  s.plans.p0 = { ability: "bash", target: "p1" };
  const round = s.round;
  removePlayer(s, "p1");
  expect(s.plans.p0).toBeUndefined();
  expect(s.round).toBe(round);
});

it("drops the leaver's queued Ultimate", () => {
  const s = party();
  enterCombat(s);
  s.ultimates = { p1: { target: s.enemies[0].id } };
  removePlayer(s, "p1");
  expect(s.ultimates.p1).toBeUndefined();
});

it("ends the run if the last standing hero walks out", () => {
  const s = party(2);
  enterCombat(s);
  s.players[0].hp = 0;
  s.players[0].fallen = true;
  removePlayer(s, "p1", 5);
  expect(s.phase).toBe("COMPLETE");
  expect(s.outcome).toBe("defeat");
  expect(s.endedAt).toBe(5);
});

it("lets the shop close when everyone left is ready to go", () => {
  let s = party();
  enterShop(s);
  s = reduce(s, "p0", { type: "continue" }, 0);
  s = reduce(s, "p1", { type: "continue" }, 0);
  expect(s.phase).toBe("SHOP");
  removePlayer(s, "p2");
  expect(s.phase).toBe("MAP");
  expect(s.shop).toBeUndefined();
});

it("withdraws a purchase meant for the leaver", () => {
  let s = party();
  enterShop(s);
  const item = s.shop!.stock[0];
  s = reduce(s, "p0", { type: "shopOffer", item, recipient: "p2" }, 0);
  expect(s.shop!.proposal).toBeDefined();
  const gold = s.gold;
  removePlayer(s, "p2");
  expect(s.shop!.proposal).toBeUndefined();
  expect(s.gold).toBe(gold);
});

it("keeps a finished run whole for the results screen", () => {
  const s = party();
  s.phase = "COMPLETE";
  expect(removePlayer(s, "p1")).toBe(false);
  expect(s.players).toHaveLength(3);
});

it("leaves an empty party when the last hero goes", () => {
  const s = party(1);
  expect(removePlayer(s, "p0")).toBe(true);
  expect(s.players).toEqual([]);
});
