/**
 * The damage an intent chip shows is the damage the round deals. For fights
 * across floors, party sizes and bosses, each enemy's forecast is compared
 * with what its action actually took off each hero (health lost plus Barrier
 * spent), with nobody planning anything and everyone too healthy to fall, so
 * nothing but the forecast's own reading can differ.
 */
import { expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat, resolveRound } from "../src/engine/combat";
import { generateMap } from "../src/engine/map";
import { forecastIntent, damageLabel } from "../src/shared/forecast";
import type { RunState } from "../src/shared/model";

const heroes = ["vanguard", "arcanist", "ranger", "warden"];

function fight(seed: string, size: number, floor: number, boss: boolean) {
  let s: RunState = createRun("FORECAST", seed);
  for (let i = 0; i < size; i++) {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero: heroes[i] }, 0);
  }
  s.floor = floor;
  s.map = generateMap(s);
  const node = s.map.find((n) => (boss ? n.type === "boss" : n.type === "combat"))!;
  s.currentNode = node.id;
  node.visited = true;
  enterCombat(s, boss);
  for (const p of s.players) p.hp = p.maxHp = 5000;
  return s;
}

it("forecasts every enemy's damage exactly as the round resolves it", () => {
  let compared = 0;
  for (const floor of [1, 2, 3])
    for (const boss of [true, false])
      for (const size of [2, 3, 4])
        for (let seed = 0; seed < 3; seed++) {
          const s = fight(`f-${floor}-${boss}-${size}-${seed}`, size, floor, boss);
          for (let round = 0; round < 6 && s.phase === "COMBAT"; round++) {
            // A Barrier on one hero, so blocking is read too.
            if (round === 1)
              s.players[0].statuses.push({ id: "barrier", stacks: 7, duration: 2 });
            const expected = new Map<string, Map<string, number>>();
            for (const e of s.enemies.filter((e) => e.hp > 0)) {
              const f = forecastIntent(s, e);
              if (e.statuses.some((x) => x.id === "interrupted")) continue;
              expected.set(
                e.id,
                new Map(f.hits.map((h) => [h.id, h.damage])),
              );
            }
            const from = s.logs.length;
            s.plans = {};
            resolveRound(s);
            const dealt = new Map<string, Map<string, number>>();
            for (const l of s.logs.slice(from)) {
              const b = l.beat;
              if (!b || (b.kind !== "damage" && b.kind !== "block")) continue;
              if (!b.actor || !b.target || !expected.has(b.actor)) continue;
              if (!s.players.some((p) => p.id === b.target)) continue;
              const row = dealt.get(b.actor) ?? new Map<string, number>();
              row.set(b.target, (row.get(b.target) ?? 0) + (b.amount ?? 0));
              dealt.set(b.actor, row);
            }
            for (const [enemy, row] of expected)
              for (const [hero, damage] of row) {
                expect(
                  dealt.get(enemy)?.get(hero) ?? 0,
                  `${enemy} on ${hero}, floor ${floor}, round ${s.round - 1}`,
                ).toBe(damage);
                compared++;
              }
          }
        }
  expect(compared).toBeGreaterThan(200);
});

it("labels one number, a range across a row, and repeated strikes", () => {
  const f = (damages: number[], strikes = 1) => ({
    harmless: false,
    hits: damages.map((damage, i) => ({ id: `${i}`, name: `${i}`, damage, blocked: 0 })),
    strikes,
    riders: [],
    aim: "",
  });
  expect(damageLabel(f([34]))).toBe("34");
  expect(damageLabel(f([22, 22]))).toBe("22 each");
  expect(damageLabel(f([18, 22]))).toBe("18–22 each");
  expect(damageLabel(f([18], 2))).toBe("2 × 9");
});
