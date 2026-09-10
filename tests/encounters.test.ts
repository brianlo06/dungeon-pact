import { expect, it } from "vitest";
import { encounters, chooseEncounter } from "../src/content/encounters";
import { createRun, addPlayer } from "../src/engine/game";
import { enterCombat } from "../src/engine/combat";
function party(count: number) {
  const s = createRun("PACKTEST", "formation-check");
  for (let i = 0; i < count; i++) addPlayer(s, `p${i}`, `Hero ${i}`);
  return s;
}
it("uses authored formations at every party size", () => {
  for (const count of [2, 3, 4] as const) {
    const s = party(count);
    enterCombat(s);
    expect(
      encounters.some(
        (e) =>
          e.formations[count].join(",") ===
          s.enemies.map((e) => e.definition).join(","),
      ),
    ).toBe(true);
    expect(s.enemies).toHaveLength(count);
  }
});
it("keeps advanced support encounters out of the opening room", () => {
  for (let i = 0; i < 100; i++) {
    const s = party(2);
    s.rng = i + 1;
    expect(chooseEncounter(s).minDepth).toBe(0);
  }
});
it("keeps missing-version saves on their legacy deterministic path", () => {
  const a = party(3);
  delete a.encounterVersion;
  const b = structuredClone(a);
  enterCombat(a);
  enterCombat(b);
  expect(a.enemies).toEqual(b.enemies);
  expect(a.logs.some((l) => l.text.includes("bars the way"))).toBe(false);
});
it("does not substitute normal formations for a boss", () => {
  const s = party(2);
  enterCombat(s, true);
  expect(["collector", "miser"]).toContain(s.enemies[0].definition);
  expect(s.enemies).toHaveLength(1);
});
