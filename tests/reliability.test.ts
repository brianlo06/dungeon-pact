import { expect, it } from "vitest";
import { createRun, addPlayer, reduce } from "../src/engine/game";
import { enterCombat } from "../src/engine/combat";
import { enterAuction } from "../src/engine/auction";
import { commandSchema, epoch } from "../src/shared/protocol";
import type { Intent } from "../src/shared/protocol";
import type { RunState } from "../src/shared/model";

function party(heroIds: string[]): RunState {
  let s = createRun("EPOCH", "test-reliability");
  heroIds.forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  heroIds.forEach((id, i) => {
    s = reduce(s, `p${i}`, { type: "hero", hero: id }, 0);
  });
  return s;
}
const send = (s: RunState, who: number, intent: Intent) =>
  reduce(s, `p${who}`, intent, 0);

it("does not treat two heroes deciding in the same round as a conflict", () => {
  let s = party(["ranger", "warden", "vanguard"]);
  s.map = [
    {
      id: "room",
      depth: 0,
      lane: 0,
      type: "combat",
      name: "Test",
      next: [],
      visited: true,
    },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const before = epoch(s);

  s = send(s, 0, { ability: "arrow", target: s.enemies[0].id, type: "plan" });
  // The revision moved, which is exactly what used to reject the second hero.
  expect(s.revision).toBeGreaterThan(0);
  expect(epoch(s)).toBe(before);

  // ...so the teammate's command, decided against the same moment, still lands.
  s = send(s, 1, { type: "plan", ability: "mend", target: "p0" });
  expect(Object.keys(s.plans)).toHaveLength(2);
  expect(epoch(s)).toBe(before);
});

it("moves the epoch on when the moment being decided actually ends", () => {
  let s = party(["ranger", "warden"]);
  s.map = [
    {
      id: "room",
      depth: 0,
      lane: 0,
      type: "combat",
      name: "Test",
      next: [],
      visited: true,
    },
  ];
  s.currentNode = "room";
  enterCombat(s);
  const round = epoch(s);
  s = send(s, 0, { type: "plan", ability: "arrow", target: s.enemies[0].id });
  s = send(s, 1, { type: "plan", ability: "mend", target: "p0" });
  // Both plans in means the round resolved: a decision made before it no
  // longer applies to what the party is now looking at.
  expect(epoch(s)).not.toBe(round);
});

it("moves the epoch on for each stage and lot of an exchange", () => {
  let s = party(["ranger", "warden"]);
  enterAuction(s, false);
  const interest = epoch(s);

  s = send(s, 0, { type: "interest", interested: true });
  expect(epoch(s)).toBe(interest);
  s = send(s, 1, { type: "interest", interested: false });
  // One bidder nominates, so the stage moved even though the lot did not.
  expect(epoch(s)).not.toBe(interest);

  const settled = epoch(s);
  s.auction!.stage = "sold";
  s = send(s, 0, { type: "continue" });
  expect(epoch(s)).not.toBe(settled);
  expect(s.auction?.lot).toBe(2);
});

it("moves the epoch on when the phase does", () => {
  let s = party(["ranger", "warden"]);
  const lobby = epoch(s);
  s = send(s, 0, { type: "ready", ready: true });
  expect(epoch(s)).toBe(lobby);
  s = send(s, 1, { type: "ready", ready: true });
  s = send(s, 0, { type: "start" });
  expect(s.phase).toBe("PACT");
  expect(epoch(s)).not.toBe(lobby);
});

it("separates two rooms sitting on the same phase and round", () => {
  const a = party(["ranger", "warden"]);
  const b = party(["ranger", "warden"]);
  a.currentNode = "1-0";
  b.currentNode = "1-1";
  expect(epoch(a)).not.toBe(epoch(b));
});

it("requires a command to say what it was decided against", () => {
  const command = {
    version: 1 as const,
    id: crypto.randomUUID(),
    revision: 0,
    epoch: "LOBBY||0|||",
    intent: { type: "ready" as const, ready: true },
  };
  expect(commandSchema.safeParse(command).success).toBe(true);
  const { epoch: _dropped, ...without } = command;
  expect(commandSchema.safeParse(without).success).toBe(false);
  expect(commandSchema.safeParse({ ...command, epoch: "" }).success).toBe(
    false,
  );
});
