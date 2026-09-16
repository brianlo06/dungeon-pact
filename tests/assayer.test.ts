/**
 * The Assayer, floor one's second boss. It heats a crucible over two rounds
 * and pours it down a row; the pour is not an interrupt's to stop — enough
 * damage in the round it is announced cracks it, and the metal goes over the
 * Assayer instead. Wet halves what cracks it. See `docs/BOSSES.md`.
 */
import { expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound, validatePlan } from "../src/engine/combat";
import { effects, status } from "../src/engine/effects";
import { crackAt } from "../src/shared/forecast";
import type { RunState } from "../src/shared/model";

function atAssayer(heroes = ["vanguard", "arcanist"]): RunState {
  let s = createRun("ASSAYER", "assayer-test");
  heroes.forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  heroes.forEach((hero, i) => {
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.floor = 1;
  s.map = [
    { id: "vault", depth: 5, lane: 0, type: "boss", name: "The Assay Furnace", boss: "assayer", biome: "foundry", next: [], visited: true },
  ];
  s.currentNode = "vault";
  enterCombat(s, true);
  for (const p of s.players) p.hp = p.maxHp = 999;
  return s;
}
const assayer = (s: RunState) => s.enemies.find((e) => e.definition === "assayer")!;
function idle(s: RunState) {
  s.plans = {};
  resolveRound(s);
}
/** Walk to the round the pour is announced. */
function toPour(s: RunState) {
  for (let i = 0; i < 3; i++) idle(s);
  expect(assayer(s).intent.ability.id).toBe("pour");
}

it("heats over two rounds and then announces the pour down a row", () => {
  const s = atAssayer();
  expect(assayer(s).intent.ability.id).toBe("assay");
  idle(s);
  expect(status(assayer(s), "heat")?.stacks).toBe(1);
  idle(s);
  idle(s);
  expect(status(assayer(s), "heat")?.stacks).toBe(2);
  expect(assayer(s).intent.ability.target).toBe("enemyRow");
  expect(assayer(s).intent.ability.cracks).toBeDefined();
});

it("pours on the row when nobody cracks it", () => {
  const s = atAssayer();
  toPour(s);
  const row = assayer(s).intent.row;
  const before = s.players.map((p) => p.hp);
  idle(s);
  s.players.forEach((p, i) => {
    if (p.row === row) expect(p.hp).toBeLessThan(before[i]);
  });
  expect(s.logs.some((l) => l.beat?.label === "CRACKED")).toBe(false);
});

it("cracks under enough damage that round, and the metal goes over the Assayer", () => {
  const s = atAssayer();
  toPour(s);
  const boss = assayer(s);
  const threshold = crackAt(s, boss);
  expect(threshold).toBe(16 * s.players.length);
  const before = s.players.map((p) => p.hp);
  // The party's blows, landed before the Assayer acts.
  effects(s, s.players[0], boss, [{ kind: "damage", amount: threshold + 10, pierce: true }]);
  const hp = boss.hp;
  s.plans = {};
  resolveRound(s);
  expect(s.logs.some((l) => l.beat?.label === "CRACKED")).toBe(true);
  s.players.forEach((p, i) => expect(p.hp).toBe(before[i]));
  expect(boss.hp).toBeLessThan(hp);
  expect(status(boss, "vulnerable")).toBeDefined();
  expect(status(boss, "heat")).toBeUndefined();
});

it("halves what cracks it while the Assayer is Wet", () => {
  const s = atAssayer();
  toPour(s);
  const boss = assayer(s);
  const dry = crackAt(s, boss);
  boss.statuses.push({ id: "wet", stacks: 1, duration: 2 });
  expect(crackAt(s, boss)).toBe(Math.round(dry / 2));
});

it("counts only the damage taken in the round the pour is announced", () => {
  const s = atAssayer();
  for (let i = 0; i < 2; i++) idle(s);
  // Heavy, but not enough to push it into phase two.
  effects(s, s.players[0], assayer(s), [{ kind: "damage", amount: 40, pierce: true }]);
  idle(s);
  expect(assayer(s).intent.ability.id).toBe("pour");
  expect(assayer(s).taken).toBe(0);
});

it("is not something an interrupt can stop", () => {
  const s = atAssayer(["arcanist", "vanguard"]);
  toPour(s);
  expect(assayer(s).intent.ability.interruptible).toBeFalsy();
  const counter = ["counter", "counterspell"].find((id) => {
    try {
      validatePlan(s, s.players[0], id, assayer(s).id);
      return true;
    } catch {
      return false;
    }
  });
  expect(counter).toBeUndefined();
});
