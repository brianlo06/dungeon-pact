/**
 * Revival is found, not bought. In a room with boss pools Pact revival is
 * gone, heals cannot stand a downed ally up, and the only battlefield revival
 * is a Writ of Reprieve from the Reprieve Office — one to a find, never on a
 * shop's shelf. Older rooms keep the 90-gold revival.
 */
import { expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, validatePlan } from "../src/engine/combat";
import { enterShop } from "../src/engine/shop";
import { generateMap } from "../src/engine/map";
import { events } from "../src/content/events";
import { items } from "../src/content/items";
import type { RunState } from "../src/shared/model";

function fight(pooled = true): RunState {
  let s = createRun("REVIVE", "revive-test");
  ["vanguard", "warden", "ranger"].forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  if (!pooled) delete s.bossVersion;
  s.map = generateMap(s);
  const node = s.map.find((n) => n.type === "combat")!;
  s.currentNode = node.id;
  enterCombat(s);
  s.gold = 1000;
  s.players[2].hp = 0;
  return s;
}

it("offers no Pact revival in a room with boss pools", () => {
  const s = fight();
  expect(() => validatePlan(s, s.players[0], "revive", "p2")).toThrow(
    "Writ of Reprieve",
  );
});

it("keeps the gold revival for a room from before boss pools", () => {
  const s = fight(false);
  expect(validatePlan(s, s.players[0], "revive", "p2").id).toBe("revive");
});

it("will not let a heal stand a downed ally up", () => {
  const s = fight();
  s.players[0].items.push("field-dressing");
  expect(() =>
    validatePlan(s, s.players[0], "use-field-dressing", "p2"),
  ).toThrow("Only a revival");
});

it("returns a downed ally with a Writ of Reprieve, and spends it", () => {
  let s = fight();
  s.players[0].items.push("writ-of-reprieve");
  expect(() =>
    validatePlan(s, s.players[0], "use-writ-of-reprieve", "p1"),
  ).toThrow("downed ally");
  s = reduce(s, "p0", { type: "plan", ability: "use-writ-of-reprieve", target: "p2" }, 0);
  for (const id of ["p1"])
    s = reduce(s, id, { type: "plan", ability: "brace", target: id }, 0);
  const downed = s.players.find((p) => p.id === "p2")!;
  expect(downed.hp).toBeGreaterThan(0);
  expect(s.players[0].items).not.toContain("writ-of-reprieve");
});

it("never stocks a writ in a shop", () => {
  const writ = items.find((i) => i.id === "writ-of-reprieve")!;
  expect(writ.unsold).toBe(true);
  for (let seed = 0; seed < 60; seed++) {
    const s = createRun("SHOP", `shop-${seed}`);
    addPlayer(s, "a", "A");
    enterShop(s);
    expect(s.shop!.stock).not.toContain("writ-of-reprieve");
  }
});

it("hands one writ to the party at the Reprieve Office, for gold or for blood", () => {
  const office = events.find((e) => e.id === "reprieve-office")!;
  expect(office.bossVersion).toBe(1);
  for (const choice of ["buy", "sign"]) {
    let s = createRun("OFFICE", "office-test");
    ["vanguard", "warden"].forEach((hero, i) => {
      addPlayer(s, `p${i}`, `Hero ${i}`);
      s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
    });
    s.phase = "EVENT";
    s.eventId = office.id;
    s.gold = 500;
    for (const p of s.players) s = reduce(s, p.id, { type: "vote", choice }, 0);
    const carried = s.players.flatMap((p) => p.items).filter((i) => i === "writ-of-reprieve");
    expect(carried).toHaveLength(1);
  }
});

it("draws the Reprieve Office only in a room with boss pools", () => {
  const legacy = events.filter((e) => !e.bossVersion);
  expect(legacy.map((e) => e.id)).not.toContain("reprieve-office");
  expect(legacy).toHaveLength(8);
});
