import { describe, it, expect } from "vitest";
import { createRun, addPlayer, reduce } from "../src/engine/game";
import { validateContent } from "../src/content/validate";
import { expeditionItems } from "../src/content/expedition-items";
import { trigger, applyStatus } from "../src/engine/effects";
import { events } from "../src/content/events";
import { enterAuction, nextLot } from "../src/engine/auction";
import { enterCombat, prepareIntents } from "../src/engine/combat";

function party() {
  const s = createRun("TESTROOM", "expansion");
  addPlayer(s, "a", "Ada");
  addPlayer(s, "b", "Bea");
  s.phase = "MAP";
  return s;
}
describe("expedition expansion", () => {
  it("provisions require a majority, cannot race route votes, and charge once", () => {
    let s = party();
    const gold = s.gold;
    s = reduce(s, "a", { type: "proposeService", service: "pact-lantern" }, 0);
    expect(() => reduce(s, "a", { type: "vote", choice: "route" }, 0)).toThrow(
      "provision",
    );
    s = reduce(s, "a", { type: "serviceVote", approve: true }, 0);
    expect(s.gold).toBe(gold);
    s = reduce(s, "b", { type: "serviceVote", approve: true }, 0);
    expect(s.gold).toBe(gold - 180);
    expect(s.teamRelics).toEqual(["pact-lantern"]);
    expect(() =>
      reduce(s, "b", { type: "serviceVote", approve: true }, 0),
    ).toThrow();
    expect(() =>
      reduce(s, "a", { type: "proposeService", service: "pact-lantern" }, 0),
    ).toThrow();
    enterCombat(s);
    expect(
      s.players.every((p) =>
        p.statuses.some((st) => st.id === "barrier" && st.stacks === 6),
      ),
    ).toBe(true);
  });
  it("descending lots lower only after every pass and close at their floor", () => {
    let s = party();
    enterAuction(s, false);
    nextLot(s);
    expect(s.auction?.mode).toBe("descending");
    const opening = s.auction!.price;
    s = reduce(s, "a", { type: "interest", interested: false }, 0);
    expect(s.auction!.price).toBe(opening);
    s = reduce(s, "b", { type: "interest", interested: false }, 0);
    expect(s.auction!.price).toBe(Math.max(s.auction!.floor!, opening - 30));
    for (let n = 0; n < 20 && s.auction!.stage !== "sold"; n++) {
      s = reduce(s, "a", { type: "interest", interested: false }, 0);
      s = reduce(s, "b", { type: "interest", interested: false }, 0);
    }
    expect(s.auction!.stage).toBe("sold");
    expect(s.auction!.price).toBe(s.auction!.floor);
  });
  it("new boss phase II changes mechanics while older rooms retain their rotation", () => {
    const s = party();
    enterCombat(s, true);
    const boss = s.enemies[0];
    boss.definition = "miser";
    boss.hp = 1;
    s.round = 2;
    prepareIntents(s);
    expect(boss.intent.ability.effects[0].kind).toBe("removeStatus");
    expect(boss.intent.ability.interruptible).toBe(true);
    delete s.expeditionVersion;
    prepareIntents(s);
    expect(boss.intent.ability.effects[0].kind).toBe("damage");
  });
  it("validates 32 equipment items, five supplies and eight events", () => {
    const count = validateContent();
    expect(count.items).toBe(37);
    expect(count.events).toBe(8);
    expect(count.presentationWarnings).toEqual([]);
  });
  for (const item of expeditionItems)
    it(`${item.name} executes its shipped passive and identifies its source`, () => {
      const s = party();
      s.phase = "COMBAT";
      const [actor, target] = s.players;
      actor.items = [item.id];
      actor.hp -= 30;
      actor.resource = 0;
      for (const st of ["burn", "poison", "weak", "vulnerable"] as const)
        applyStatus(actor, st, 1, 3);
      const before = structuredClone(s);
      trigger(s, actor, target, item.trigger);
      expect(
        s.logs.some((l) =>
          l.beat?.equipment?.some((c) => c.itemId === item.id),
        ),
      ).toBe(true);
      expect({ players: s.players, gold: s.gold }).not.toEqual({
        players: before.players,
        gold: before.gold,
      });
    });
  it("requires recipient acceptance and exchanges occupied slots without deleting either piece", () => {
    let s = party();
    s.players[0].items = ["stormglass"];
    s.players[1].items = ["blood-price"];
    s = reduce(
      s,
      "a",
      { type: "offerTrade", item: "stormglass", target: "b" },
      0,
    );
    expect(s.players[0].items).toEqual(["stormglass"]);
    expect(() =>
      reduce(
        s,
        "a",
        { type: "answerTrade", from: "a", item: "stormglass", accept: true },
        0,
      ),
    ).toThrow();
    const result = reduce(
      s,
      "b",
      { type: "answerTrade", from: "a", item: "stormglass", accept: true },
      0,
    );
    expect(result.players[0].items).toEqual(["blood-price"]);
    expect(result.players[1].items).toEqual(["stormglass"]);
    expect(() =>
      reduce(
        result,
        "b",
        { type: "answerTrade", from: "a", item: "stormglass", accept: true },
        0,
      ),
    ).toThrow();
    s.currentNode = "next";
    expect(() =>
      reduce(
        s,
        "b",
        { type: "answerTrade", from: "a", item: "stormglass", accept: true },
        0,
      ),
    ).toThrow();
  });
  it("refuses combat trades and transfers only one supply", () => {
    let s = party();
    s.players[0].items = ["field-dressing", "field-dressing"];
    s = reduce(
      s,
      "a",
      { type: "offerTrade", item: "field-dressing", target: "b" },
      0,
    );
    s = reduce(
      s,
      "b",
      { type: "answerTrade", from: "a", item: "field-dressing", accept: true },
      0,
    );
    expect(s.players.map((p) => p.items)).toEqual([
      ["field-dressing"],
      ["field-dressing"],
    ]);
    s.phase = "COMBAT";
    expect(() =>
      reduce(
        s,
        "a",
        { type: "offerTrade", item: "field-dressing", target: "b" },
        0,
      ),
    ).toThrow();
  });
  it("spirit support is once per round, requires a downed source and standing recipient", () => {
    let s = party();
    s.phase = "COMBAT";
    s.round = 1;
    expect(() =>
      reduce(s, "a", { type: "spirit", aid: "ward", target: "b" }, 0),
    ).toThrow();
    s.players[0].hp = 0;
    s = reduce(s, "a", { type: "spirit", aid: "ward", target: "b" }, 0);
    expect(s.players[1].statuses.find((x) => x.id === "barrier")?.stacks).toBe(
      4,
    );
    expect(() =>
      reduce(s, "a", { type: "spirit", aid: "inspire", target: "b" }, 0),
    ).toThrow();
    s.round++;
    s.players[1].resource = 0;
    s = reduce(s, "a", { type: "spirit", aid: "inspire", target: "b" }, 0);
    expect(s.players[1].resource).toBe(1);
    s.round++;
    s.players[1].hp = 0;
    expect(() =>
      reduce(s, "a", { type: "spirit", aid: "ward", target: "b" }, 0),
    ).toThrow();
  });
  for (const event of events.filter((e) => e.choices.some((c) => c.supply))) {
    it(`${event.name} delivers the chosen supply without replacing equipment`, () => {
      let s = party();
      s.phase = "EVENT";
      s.eventId = event.id;
      const choice = event.choices.find((c) => c.supply)!;
      for (const p of s.players) p.items = ["bastion"];
      const gold = s.gold;
      s = reduce(s, "a", { type: "vote", choice: choice.id }, 0);
      s = reduce(s, "b", { type: "vote", choice: choice.id }, 0);
      expect(s.gold).toBe(gold - choice.cost);
      expect(
        s.players.every(
          (p) =>
            p.items.includes(choice.supply!) && p.items.includes("bastion"),
        ),
      ).toBe(true);
      expect(s.phase).toBe("MAP");
    });
  }
});
