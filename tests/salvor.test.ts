/**
 * The Salvor, floor two's second boss. It grows soft plates out of the goods
 * it salvaged; a plate left one round hardens onto it (Encrusted: every hit
 * heavier, and Barrier), and a plate broken while soft strips its Barrier and
 * leaves it Vulnerable. See `docs/BOSSES.md`.
 */
import { expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { effects, status } from "../src/engine/effects";
import { hitDamage } from "../src/shared/damage";
import type { Enemy, RunState } from "../src/shared/model";

function atSalvor(): RunState {
  let s = createRun("SALVOR", "salvor-test");
  ["vanguard", "ranger"].forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.floor = 2;
  s.map = [
    { id: "vault", depth: 5, lane: 0, type: "boss", name: "The Wreck Pool", boss: "salvor", biome: "cistern", next: [], visited: true },
  ];
  s.currentNode = "vault";
  enterCombat(s, true);
  for (const p of s.players) p.hp = p.maxHp = 999;
  return s;
}
const salvor = (s: RunState) => s.enemies.find((e) => e.definition === "salvor")!;
const plates = (s: RunState) => s.enemies.filter((e) => e.definition === "salvage-plate");
function idle(s: RunState) {
  s.plans = {};
  resolveRound(s);
}
function tear(s: RunState, plate: Enemy) {
  plate.statuses = [];
  plate.hp = 1;
  effects(s, s.players[0], plate, [{ kind: "damage", amount: 50, pierce: true }]);
}

it("grows a soft plate that reads as hardening next round", () => {
  const s = atSalvor();
  expect(salvor(s).intent.ability.id).toBe("encrust");
  idle(s);
  expect(plates(s)).toHaveLength(1);
  expect(plates(s)[0].owner).toBe(salvor(s).id);
  expect(plates(s)[0].intent.ability.id).toBe("harden");
  expect(plates(s)[0].intent.target).toBe(salvor(s).id);
});

it("hardens onto the Salvor when it is left: Encrusted and Barrier, and every hit heavier", () => {
  const s = atSalvor();
  idle(s);
  const hero = s.players[0];
  const before = hitDamage(20, salvor(s), hero);
  idle(s);
  expect(status(salvor(s), "encrusted")?.stacks).toBe(1);
  expect(status(salvor(s), "barrier")).toBeDefined();
  expect(plates(s)[0].spent).toBe(true);
  expect(hitDamage(20, salvor(s), hero)).toBeGreaterThan(before);
});

it("opens the Salvor when a plate is torn off while soft", () => {
  const s = atSalvor();
  idle(s);
  salvor(s).statuses.push({ id: "barrier", stacks: 10, duration: 2 });
  tear(s, plates(s)[0]);
  expect(status(salvor(s), "vulnerable")).toBeDefined();
  expect(status(salvor(s), "barrier")).toBeUndefined();
  // A torn plate never hardens.
  idle(s);
  expect(status(salvor(s), "encrusted")).toBeUndefined();
});

it("grows plates in both rows at once in phase two", () => {
  const s = atSalvor();
  const boss = salvor(s);
  boss.hp = Math.floor(boss.maxHp / 2) - 1;
  // Round one's plate is already announced; the next pass of the rotation is
  // phase two's, which opens with a plate for each row.
  idle(s);
  expect(boss.phase).toBe(2);
  while (boss.intent.ability.id !== "encrust") idle(s);
  const before = plates(s).length;
  idle(s);
  const grown = plates(s).slice(before);
  expect(grown.map((p) => p.row).sort()).toEqual(["back", "front"]);
});
