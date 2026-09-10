import { it, expect } from "vitest";
import { run, simulate, partyList } from "../scripts/simulate";
import { policies } from "../scripts/policy";

it("completes deterministic runs across party sizes and seeds", () => {
  for (const count of [2, 3, 4])
    for (let i = 0; i < 10; i++) {
      const a = simulate(`regression-${i}`, count);
      expect(a.phase).toBe("COMPLETE");
      expect(a).toEqual(simulate(`regression-${i}`, count));
      expect(a.gold).toBeGreaterThanOrEqual(0);
    }
});

it("enumerates every class combination without repeats", () => {
  expect(partyList(2).length).toBe(10);
  expect(partyList(3).length).toBe(20);
  expect(partyList(4).length).toBe(35);
  for (const size of [2, 3, 4])
    for (const party of partyList(size)) expect(party.length).toBe(size);
});

/**
 * Every composition must terminate under every policy. A party that can
 * neither win nor lose used to be reachable: sustain heroes against a
 * fortifying enemy traded shields forever.
 */
it("terminates for every composition and policy", () => {
  for (const name of Object.keys(policies))
    for (const size of [2, 3, 4])
      for (const party of partyList(size)) {
        const r = run(`regression-1`, party, name);
        expect(r.state.phase).toBe("COMPLETE");
        expect(r.state.outcome).not.toBeNull();
      }
});

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
});

it("gives every hero their branch picks over a full run", () => {
  const r = run("regression-3", ["ranger", "arcanist"], "tactical");
  for (const p of r.state.players) {
    expect((p.upgrades ?? []).length).toBeGreaterThan(0);
    expect(new Set(p.upgrades).size).toBe((p.upgrades ?? []).length);
  }
});
