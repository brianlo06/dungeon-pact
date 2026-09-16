/**
 * The Notary, floor three's boss. It presses wax seals across both rows; each
 * counts down on its intent and then is enforced on the whole party. Breaking
 * a seal cracks back up the Notary's arm, and breaking a whole pressing leaves
 * it interrupted and Vulnerable. See `docs/BOSSES.md`.
 */
import { expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound, combatants } from "../src/engine/combat";
import { generateMap } from "../src/engine/map";
import { effects, status } from "../src/engine/effects";
import type { Enemy, RunState } from "../src/shared/model";

function atNotary(heroes = ["vanguard", "ranger"]): RunState {
  let s = createRun("NOTARY", "notary-test");
  heroes.forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  heroes.forEach((hero, i) => {
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.bossVersion = 1;
  s.floor = 3;
  s.map = generateMap(s);
  const boss = s.map.find((n) => n.type === "boss")!;
  s.currentNode = boss.id;
  boss.visited = true;
  enterCombat(s, true);
  // Nobody here dies to the numbers under test.
  for (const p of s.players) p.hp = p.maxHp = 999;
  return s;
}

const notary = (s: RunState) => s.enemies.find((e) => e.definition === "notary")!;
const seals = (s: RunState) => s.enemies.filter((e) => e.definition === "wax-seal");
/** A round in which the party does nothing. */
function idle(s: RunState) {
  s.plans = {};
  resolveRound(s);
}

it("waits in the Sealing Room on floor three", () => {
  const s = atNotary();
  expect(s.map.find((n) => n.type === "boss")!.name).toBe("The Sealing Room");
  expect(notary(s).intent.ability.id).toBe("attest");
});

it("presses three seals across both rows as a WINDUP, and they count down", () => {
  const s = atNotary();
  idle(s); // round 1: attest
  expect(notary(s).intent.ability.id).toBe("press");
  expect(notary(s).intent.ability.interruptible).toBe(true);
  idle(s); // round 2: the pressing lands
  const pressed = seals(s);
  expect(pressed.map((x) => x.row).sort()).toEqual(["back", "back", "front"]);
  expect(pressed.every((x) => x.owner === notary(s).id)).toBe(true);
  expect(pressed[0].intent.ability.name).toBe("Sets in 2");
  idle(s);
  expect(seals(s)[0].intent.ability.name).toBe("Sets in 1");
  idle(s);
  expect(seals(s)[0].intent.ability.id).toBe("enforce");
});

it("enforces every standing seal on every hero, then the seals are spent, not broken", () => {
  const s = atNotary();
  for (let i = 0; i < 4; i++) idle(s);
  const before = s.players.map((p) => p.hp);
  const boss = notary(s).hp;
  // Only the seals act this round, so what the party loses is theirs alone.
  notary(s).statuses.push({ id: "interrupted", stacks: 1, duration: 1 });
  const power = seals(s)[0].power;
  idle(s); // round 5: three seals come due
  s.players.forEach((p, i) =>
    expect(before[i] - p.hp).toBe(3 * Math.max(1, 8 + power - p.guard)),
  );
  expect(seals(s).every((x) => x.hp === 0 && x.spent)).toBe(true);
  // Spent wax answers to nobody.
  expect(notary(s).hp).toBe(boss);
});

it("does not press again while its seals stand; it countersigns instead", () => {
  const s = atNotary();
  for (let i = 0; i < 4; i++) idle(s);
  // Round 5 is the pressing's slot again, and the seals are still standing.
  expect(notary(s).intent.ability.id).toBe("countersign");
});

it("cracks back up the Notary's arm for each seal broken, and staggers it when all are", () => {
  const s = atNotary();
  idle(s);
  idle(s);
  const boss = notary(s);
  const hp = boss.hp;
  const [first, ...rest] = seals(s);
  first.hp = 1;
  breakSeal(s, first);
  expect(boss.hp).toBeLessThan(hp);
  expect(status(boss, "vulnerable")).toBeUndefined();
  for (const x of rest) breakSeal(s, x);
  expect(status(boss, "vulnerable")).toBeDefined();
  // Staggered: whatever it announced this round is lost.
  expect(status(boss, "interrupted")).toBeDefined();
  expect(boss.intent.ability.interruptible).toBeFalsy();
});

it("leaves no seals to fight if the pressing is interrupted", () => {
  const s = atNotary(["vanguard", "ranger"]);
  idle(s);
  expect(notary(s).intent.ability.id).toBe("press");
  notary(s).statuses.push({ id: "interrupted", stacks: 1, duration: 1 });
  idle(s);
  expect(seals(s)).toHaveLength(0);
});

it("does not keep a chamber from falling silent", () => {
  const s = atNotary();
  idle(s);
  idle(s);
  expect(seals(s).length).toBe(3);
  expect(combatants(s).some((e) => e.definition === "wax-seal")).toBe(false);
  for (const e of combatants(s)) e.hp = 0;
  idle(s);
  expect(s.phase).not.toBe("COMBAT");
});

it("presses four seals on a two-round fuse in phase two", () => {
  const s = atNotary();
  const boss = notary(s);
  boss.hp = Math.floor(boss.maxHp / 2) - 1;
  idle(s); // phase two begins on the next intents; round 2 presses
  expect(boss.phase).toBe(2);
  idle(s);
  expect(seals(s)).toHaveLength(4);
  expect(seals(s)[0].intent.ability.name).toBe("Sets in 1");
});

/** A hero's blow that breaks a seal, through the ordinary damage path. */
function breakSeal(s: RunState, seal: Enemy) {
  seal.statuses = [];
  seal.hp = 1;
  effects(s, s.players[0], seal, [{ kind: "damage", amount: 50, pierce: true }]);
}
