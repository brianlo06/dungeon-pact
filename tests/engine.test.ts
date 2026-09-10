import { describe, it, expect } from "vitest";
import { createRun, addPlayer, reduce, snapshot } from "../src/engine/game";
import {
  applyStatus,
  effects,
  spend,
  tickStatuses,
} from "../src/engine/effects";
import { generateMap } from "../src/engine/map";
import { enterAuction } from "../src/engine/auction";
import { enterCombat } from "../src/engine/combat";
import { validateContent, effectSchema } from "../src/content/validate";
import { commandSchema } from "../src/shared/protocol";
import type { Intent, Command } from "../src/shared/protocol";
import type { RunState } from "../src/shared/model";
export function party(count = 2) {
  const s = createRun("TESTROOM", "test-seed");
  for (let i = 0; i < count; i++) addPlayer(s, `p${i}`, `Hero ${i}`);
  return s;
}
function dispatch(s: RunState, id: string, intent: Intent) {
  return reduce(s, id, intent, 1000);
}
describe("authoritative rules", () => {
  it("validates the entire content catalog and rejects unsupported effects", () => {
    expect(validateContent().heroes).toBe(4);
    expect(
      effectSchema.safeParse({
        kind: "status",
        status: "unknown",
        stacks: 1,
        duration: 1,
      }).success,
    ).toBe(false);
  });
  it("ends the run if round-start curses down the entire party", () => {
    const s = party();
    for (const p of s.players) {
      p.hp = 1;
      p.items = ["blood-price"];
    }
    enterCombat(s);
    expect(s.phase).toBe("COMPLETE");
    expect(s.outcome).toBe("defeat");
  });
  it("validates phases and leaves rejected state untouched", () => {
    const s = party();
    const before = structuredClone(s);
    expect(() => dispatch(s, "p0", { type: "continue" })).toThrow();
    expect(s).toEqual(before);
  });
  it("requires two ready players and never grants host privilege", () => {
    let s = party();
    expect(() => dispatch(s, "p0", { type: "start" })).toThrow();
    for (const p of s.players)
      s = dispatch(s, p.id, { type: "ready", ready: true });
    s = dispatch(s, "p1", { type: "start" });
    expect(s.phase).toBe("PACT");
  });
  it("rotates tied votes and prevents duplicate votes", () => {
    let s = party();
    s.phase = "PACT";
    s = dispatch(s, "p0", { type: "vote", choice: "wealth" });
    expect(() =>
      dispatch(s, "p0", { type: "vote", choice: "vitality" }),
    ).toThrow();
    s = dispatch(s, "p1", { type: "vote", choice: "vitality" });
    expect(s.pact).toBe("wealth");
    expect(s.tieCursor).toBe(1);
    expect(s.gold).toBe(580);
  });
  it("deterministically generates connected maps", () => {
    for (let n = 0; n < 100; n++) {
      const a = createRun("A", String(n)),
        b = createRun("B", String(n));
      expect(generateMap(a)).toEqual(generateMap(b));
      const map = generateMap(a);
      for (const node of map)
        if (node.type !== "boss") expect(node.next.length).toBeGreaterThan(0);
    }
  });
  it("rejects negative, fractional, and over-budget spending", () => {
    const s = party();
    for (const n of [-1, 1.2, 500]) expect(() => spend(s, n)).toThrow();
    expect(s.gold).toBe(420);
  });
  it("caps healing and consumes barrier before health", () => {
    const s = party();
    const p = s.players[0];
    p.hp = 90;
    applyStatus(p, "barrier", 20, 2);
    effects(s, s.players[1], p, [{ kind: "damage", amount: 30 }]);
    expect(p.hp).toBe(81);
    effects(s, p, p, [{ kind: "heal", amount: 999 }]);
    expect(p.hp).toBe(p.maxHp);
  });
  it("stacks and expires statuses centrally", () => {
    const s = party();
    const p = s.players[0];
    applyStatus(p, "burn", 20, 1);
    applyStatus(p, "burn", 20, 2);
    expect(p.statuses[0]).toEqual({ id: "burn", stacks: 30, duration: 2 });
    tickStatuses(s, p);
    expect(p.hp).toBe(85);
    tickStatuses(s, p);
    expect(p.statuses).toEqual([]);
  });
  it("consumes primers and chains lightning", () => {
    const s = party();
    enterCombat(s);
    s.enemies[0].hp = 100;
    s.enemies[0].maxHp = 100;
    applyStatus(s.enemies[0], "wet", 1, 3);
    const other = s.enemies[1].hp;
    effects(s, s.players[0], s.enemies[0], [
      { kind: "damage", amount: 10, damageType: "lightning" },
    ]);
    expect(s.enemies[1].hp).toBe(other - 12);
    expect(s.enemies[0].statuses.some((s) => s.id === "wet")).toBe(false);
    expect(s.logs.some((l) => l.kind === "combo")).toBe(true);
  });
  it("does not resolve until all standing heroes lock", () => {
    let s = party();
    enterCombat(s);
    s = dispatch(s, "p0", {
      type: "plan",
      ability: "bash",
      target: s.enemies[0].id,
    });
    expect(s.round).toBe(1);
    expect(s.plans.p0).toBeDefined();
    s = dispatch(s, "p1", {
      type: "plan",
      ability: "bash",
      target: s.enemies[0].id,
    });
    expect(s.round).toBe(2);
  });
  it("rejects enemy selection for ally skills and inaccessible abilities", () => {
    let s = party();
    enterCombat(s);
    expect(() =>
      dispatch(s, "p0", {
        type: "plan",
        ability: "storm",
        target: s.enemies[0].id,
      }),
    ).toThrow();
    expect(() =>
      dispatch(s, "p0", {
        type: "plan",
        ability: "intercept",
        target: s.enemies[0].id,
      }),
    ).toThrow();
  });
  it("conceals server RNG, other plans, item identity and curses", () => {
    const s = party();
    enterAuction(s, true);
    s.plans = {
      p0: { ability: "a", target: "b" },
      p1: { ability: "c", target: "d" },
    };
    const view = snapshot(s, "p0", []);
    expect(view).not.toHaveProperty("rng");
    expect(view).not.toHaveProperty("seed");
    expect(view).not.toHaveProperty("plans");
    expect(view.auction).not.toHaveProperty("itemId");
    expect(view.auction?.item).not.toHaveProperty("id");
    expect(view.auction?.item).not.toHaveProperty("cursed");
    expect(view.myPlan?.ability).toBe("a");
  });
  it("requires majority approval and charges exactly once", () => {
    let s = party();
    enterAuction(s, false);
    s.auction!.price = 200;
    s = dispatch(s, "p0", { type: "interest", interested: true });
    s = dispatch(s, "p1", { type: "interest", interested: false });
    expect(s.auction!.stage).toBe("approval");
    s = dispatch(s, "p0", { type: "approve", approve: true });
    expect(s.gold).toBe(420);
    s = dispatch(s, "p1", { type: "approve", approve: true });
    expect(s.gold).toBe(220);
    expect(s.players[0].items).toHaveLength(1);
    expect(() =>
      dispatch(s, "p1", { type: "approve", approve: true }),
    ).toThrow();
  });
  it("rejects tied approval without spending", () => {
    let s = party();
    enterAuction(s, false);
    s.auction!.price = 200;
    s = dispatch(s, "p0", { type: "interest", interested: true });
    s = dispatch(s, "p1", { type: "interest", interested: false });
    s = dispatch(s, "p0", { type: "approve", approve: false });
    expect(s.auction!.stage).toBe("sold");
    expect(s.gold).toBe(420);
  });
  it("raises price only after every remaining bidder holds", () => {
    let s = party();
    enterAuction(s, false);
    const price = s.auction!.price;
    for (const p of s.players)
      s = dispatch(s, p.id, { type: "interest", interested: true });
    s = dispatch(s, "p0", { type: "bid", stay: true });
    expect(s.auction!.price).toBe(price);
    s = dispatch(s, "p1", { type: "bid", stay: true });
    expect(s.auction!.price).toBe(price + 30);
  });
  it("reveals information once with one treasury debit", () => {
    let s = party();
    enterAuction(s, true);
    s = dispatch(s, "p0", { type: "reveal" });
    expect(s.gold).toBe(385);
    expect(snapshot(s, "p0", []).auction?.item.id).toBeTruthy();
    expect(() => dispatch(s, "p1", { type: "reveal" })).toThrow();
  });
  it("rest returns fallen heroes to play without spending gold", () => {
    let s = party();
    s.phase = "CAMP";
    s.players[1].hp = 0;
    s.players[1].fallen = true;
    for (const p of s.players)
      s = dispatch(s, p.id, { type: "vote", choice: "rest" });
    expect(s.players[1].hp).toBe(15);
    expect(s.players[1].fallen).toBe(false);
    expect(s.gold).toBe(420);
  });
  it("validates network schemas rather than trusting client values", () => {
    const command: Command = {
      version: 1,
      id: crypto.randomUUID(),
      revision: 0,
      intent: { type: "ready", ready: true },
    };
    expect(commandSchema.safeParse(command).success).toBe(true);
    expect(commandSchema.safeParse({ ...command, revision: -1 }).success).toBe(
      false,
    );
    expect(
      commandSchema.safeParse({
        ...command,
        intent: { type: "gold", amount: 99999 },
      }).success,
    ).toBe(false);
  });
});
