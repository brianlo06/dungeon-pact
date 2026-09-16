import { it, expect } from "vitest";
import { run, simulate, partyList } from "../scripts/simulate";
import { policies } from "../scripts/policy";
import { heroes } from "../src/content/heroes";

it("completes deterministic runs across party sizes and seeds", () => {
  for (const count of [2, 3, 4])
    for (let i = 0; i < 10; i++) {
      const a = simulate(`regression-${i}`, count);
      expect(a.phase).toBe("COMPLETE");
      expect(a).toEqual(simulate(`regression-${i}`, count));
      expect(a.gold).toBeGreaterThanOrEqual(0);
    }
  // Sixty whole runs, each played twice: seconds, not the default five.
}, 120000);

it("enumerates every class combination without repeats", () => {
  // Combinations with repetition: duplicated classes are legal parties.
  const choose = (n: number, k: number) =>
    Array.from({ length: k }, (_, i) => (n + i) / (i + 1)).reduce(
      (a, b) => a * b,
      1,
    );
  const n = heroes.length;
  for (const size of [2, 3, 4]) {
    expect(partyList(size).length).toBe(Math.round(choose(n, size)));
    for (const party of partyList(size)) expect(party.length).toBe(size);
  }
  expect(new Set(partyList(2).map((p) => p.join("+"))).size).toBe(
    partyList(2).length,
  );
});

/**
 * Every composition must terminate under every policy. A party that can
 * neither win nor lose used to be reachable: sustain heroes against a
 * fortifying enemy traded shields forever.
 */
// Three floors make every run half as long again as two did, so the sweeps
// below get more time; what they check is unchanged.
it("terminates for every composition and policy", () => {
  for (const name of Object.keys(policies))
    for (const size of [2, 3, 4])
      for (const party of partyList(size)) {
        const r = run(`regression-1`, party, name);
        expect(r.state.phase).toBe("COMPLETE");
        expect(r.state.outcome).not.toBeNull();
      }
}, 420000);

/**
 * A rejected plan means the policy proposed something the server refused, so
 * the bot silently braced instead. That invalidates any balance reading taken
 * from the run, so it is an error, not a warning.
 */
it("never proposes a plan the server rejects", () => {
  for (const size of [2, 3, 4])
    for (const party of partyList(size))
      for (let i = 0; i < 2; i++)
        expect(run(`policy-${i}`, party, "tactical").invalid).toBe(0);
}, 420000);

it("gives every hero their branch picks over a full run", () => {
  const r = run("regression-3", ["ranger", "arcanist"], "tactical");
  for (const p of r.state.players) {
    expect((p.upgrades ?? []).length).toBeGreaterThan(0);
    expect(new Set(p.upgrades).size).toBe((p.upgrades ?? []).length);
  }
});
