import { expect, it } from "vitest";
import { createRun, addPlayer, removePlayer, reduce } from "../src/engine/game";
import { leaveSchema } from "../src/shared/protocol";

it("gives a lobby seat back, so the rest can ready up and start", () => {
  let s = createRun("LEAVEROOM", "test-leave");
  addPlayer(s, "host", "Host");
  addPlayer(s, "friend", "Friend");
  addPlayer(s, "stray", "Stray");
  s = reduce(s, "host", { type: "ready", ready: true }, 0);
  s = reduce(s, "friend", { type: "ready", ready: true }, 0);
  // The stray never readies, so nobody can start while it holds a seat.
  expect(() => reduce(s, "host", { type: "start" }, 0)).toThrow();
  const revision = s.revision;
  expect(removePlayer(s, "stray")).toBe(true);
  expect(s.players.map((p) => p.id)).toEqual(["host", "friend"]);
  expect(s.revision).toBe(revision + 1);
  expect(s.logs.at(-1)?.text).toBe("Stray leaves the pact.");
  expect(reduce(s, "host", { type: "start" }, 0).phase).toBe("PACT");
});

it("frees the seat for someone else in a full room", () => {
  const s = createRun("LEAVEROOM", "test-leave-full");
  ["a", "b", "c", "d"].forEach((id) => addPlayer(s, id, id));
  expect(() => addPlayer(s, "e", "e")).toThrow();
  removePlayer(s, "b");
  addPlayer(s, "e", "e");
  expect(s.players.map((p) => p.id)).toEqual(["a", "c", "d", "e"]);
});

it("takes the hero out of the run once it has started", () => {
  let s = createRun("LEAVEROOM", "test-leave-run");
  addPlayer(s, "host", "Host");
  addPlayer(s, "friend", "Friend");
  s = reduce(s, "host", { type: "ready", ready: true }, 0);
  s = reduce(s, "friend", { type: "ready", ready: true }, 0);
  s = reduce(s, "host", { type: "start" }, 0);
  const revision = s.revision;
  expect(removePlayer(s, "friend")).toBe(true);
  expect(s.players.map((p) => p.id)).toEqual(["host"]);
  expect(s.revision).toBeGreaterThan(revision);
});

it("ignores a player who is not in the room", () => {
  const s = createRun("LEAVEROOM", "test-leave-unknown");
  addPlayer(s, "host", "Host");
  expect(removePlayer(s, "nobody")).toBe(false);
  expect(s.players).toHaveLength(1);
});

it("accepts only a well-formed token to leave", () => {
  expect(leaveSchema.safeParse({ token: "a".repeat(64) }).success).toBe(true);
  expect(leaveSchema.safeParse({ token: "short" }).success).toBe(false);
  expect(
    leaveSchema.safeParse({ token: "a".repeat(64), extra: 1 }).success,
  ).toBe(false);
});
