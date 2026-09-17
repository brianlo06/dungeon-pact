/**
 * The Bailiff, floor three's second boss. It serves a lien on a hero that
 * comes due in three rounds, or at once when its side lands a direct hit on
 * the carrier; it collects from the carrier. A guard, a step out of the row,
 * or serving the lien back onto an enemy answers it. See `docs/BOSSES.md`.
 */
import { expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound, validatePlan } from "../src/engine/combat";
import { callLien, effects, status } from "../src/engine/effects";
import { forecastIntent } from "../src/shared/forecast";
import type { RunState } from "../src/shared/model";

function atBailiff(heroes = ["vanguard", "ranger"]): RunState {
  let s = createRun("BAILIFF", "bailiff-test");
  heroes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.floor = 3;
  s.map = [
    { id: "vault", depth: 5, lane: 0, type: "boss", name: "The Bailiff's Court", boss: "bailiff", biome: "archive", next: [], visited: true },
  ];
  s.currentNode = "vault";
  enterCombat(s, true);
  for (const p of s.players) p.hp = p.maxHp = 999;
  return s;
}
const bailiff = (s: RunState) => s.enemies.find((e) => e.definition === "bailiff")!;
const carrier = (s: RunState) => s.players.find((p) => status(p, "lien"));
function idle(s: RunState) {
  s.plans = {};
  resolveRound(s);
}

it("serves a lien on a hero that does not carry one", () => {
  const s = atBailiff();
  expect(bailiff(s).intent.ability.id).toBe("serve-lien");
  idle(s);
  expect(carrier(s)).toBeDefined();
  expect(status(carrier(s)!, "lien")!.stacks).toBe(32);
});

it("garnishes the carrier's row, which the carrier can step out of, then collects from them", () => {
  const s = atBailiff();
  idle(s); // served
  const debtor = carrier(s)!;
  expect(bailiff(s).intent.ability.id).toBe("garnish");
  // The row is locked when it is announced: stepping out dodges the call.
  expect(bailiff(s).intent.row).toBe(debtor.row);
  const lien = status(debtor, "lien")!.stacks;
  expect(forecastIntent(s, bailiff(s)).hits.find((h) => h.id === debtor.id)!.damage).toBeGreaterThan(lien);
  debtor.row = debtor.row === "front" ? "back" : "front";
  idle(s); // garnish misses the carrier
  expect(status(debtor, "lien")?.stacks).toBe(lien);
  expect(bailiff(s).intent.ability.id).toBe("collect");
  expect(bailiff(s).intent.target).toBe(debtor.id);
  const forecast = forecastIntent(s, bailiff(s)).hits.find((h) => h.id === debtor.id)!;
  const before = debtor.hp;
  idle(s);
  expect(status(debtor, "lien")).toBeUndefined();
  expect(before - debtor.hp).toBe(forecast.damage - forecast.blocked);
  expect(s.logs.some((l) => l.beat?.label === "LIEN CALLED")).toBe(true);
});

it("comes due on its own when it runs out", () => {
  const s = atBailiff();
  const hero = s.players[1];
  hero.statuses.push({ id: "lien", stacks: 30, duration: 1 });
  bailiff(s).statuses.push({ id: "interrupted", stacks: 1, duration: 1 });
  const before = hero.hp;
  idle(s);
  expect(status(hero, "lien")).toBeUndefined();
  expect(before - hero.hp).toBeGreaterThanOrEqual(30);
});

it("is not called in by a guard taking the hit for the carrier", () => {
  const s = atBailiff();
  const [guard, debtor] = s.players;
  debtor.statuses.push({ id: "lien", stacks: 30, duration: 3 });
  debtor.statuses.push({ id: "guarded", stacks: 1, duration: 1, sourceId: guard.id });
  effects(s, bailiff(s), debtor, [{ kind: "damage", amount: 20 }]);
  expect(status(debtor, "lien")?.stacks).toBe(30);
});

it("serves back onto an enemy, where the party's next hit calls it in", () => {
  let s = atBailiff();
  const debtor = s.players[0];
  expect(() => validatePlan(s, debtor, "serve", bailiff(s).id)).toThrow("nothing to serve");
  debtor.statuses.push({ id: "lien", stacks: 30, duration: 3 });
  expect(validatePlan(s, debtor, "serve", bailiff(s).id).id).toBe("serve");
  effects(s, debtor, bailiff(s), [{ kind: "transfer", status: "lien" }]);
  expect(status(debtor, "lien")).toBeUndefined();
  expect(status(bailiff(s), "lien")?.stacks).toBe(30);
  const hp = bailiff(s).hp;
  effects(s, s.players[1], bailiff(s), [{ kind: "damage", amount: 5 }]);
  expect(status(bailiff(s), "lien")).toBeUndefined();
  expect(hp - bailiff(s).hp).toBeGreaterThanOrEqual(30);
});

it("does nothing when there is no lien to call", () => {
  const s = atBailiff();
  const hp = s.players[0].hp;
  callLien(s, s.players[0], bailiff(s));
  expect(s.players[0].hp).toBe(hp);
});
