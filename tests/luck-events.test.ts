import { describe, it, expect } from "vitest";
import { createRun, addPlayer, reduce, snapshot } from "../src/engine/game";
import { events } from "../src/content/events";
import { luckEvents } from "../src/content/luck-events";
import {
  enterEvent,
  eventChoices,
  landOn,
  pressOdds,
  shares,
} from "../src/engine/luck";
import { epoch } from "../src/shared/protocol";
import { resolveRound } from "../src/engine/combat";
import type { RunState } from "../src/shared/model";

function party(size = 2) {
  const s = createRun("TESTROOM", "luck");
  ["a", "b", "c", "d"]
    .slice(0, size)
    .forEach((id, i) => addPlayer(s, id, `Hero ${i}`));
  s.phase = "MAP";
  s.map = [
    {
      id: "n0",
      depth: 0,
      lane: 0,
      type: "event",
      name: "Event",
      next: [],
      visited: true,
    },
  ];
  s.currentNode = "n0";
  return s;
}
function at(eventId: string, size = 2) {
  const s = party(size);
  s.phase = "EVENT";
  s.eventId = eventId;
  return s;
}
/** Everyone votes the same way. */
function vote(s: RunState, choice: string) {
  for (const p of s.players) {
    if (s.phase !== "EVENT" || s.luck?.done) break;
    s = reduce(s, p.id, { type: "vote", choice }, 0);
  }
  return s;
}
/**
 * Finds an RNG state whose next d100 lands inside `[low, high]`, so a test
 * can ask for "the roll that loses" without depending on a seed's history.
 */
function rigged(s: RunState, low: number, high: number) {
  for (let rng = 1; rng < 1e6; rng++) {
    let x = rng;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    const roll = Math.floor(((x >>> 0) / 4294967296) * 100) + 1;
    if (roll >= low && roll <= high) {
      s.rng = rng;
      return s;
    }
  }
  throw Error("no such roll");
}

/** The d100 range an event's first rolled choice lands on `outcome` for. */
function band(eventId: string, outcome: string): [number, number] {
  const odds = luckEvents
    .find((e) => e.id === eventId)!
    .choices.find((c) => c.roll)!.roll!;
  const hits = Array.from({ length: 100 }, (_, i) => i + 1).filter(
    (r) => landOn(odds, r).id === outcome,
  );
  return [hits[0], hits.at(-1)!];
}

describe("chance events", () => {
  it("adds six chance events alongside the fixed ones", () => {
    expect(luckEvents).toHaveLength(6);
    expect(events.filter((e) => e.luck)).toHaveLength(6);
  });

  it("reads outcome weights as d100 bands, in order", () => {
    const duel = luckEvents.find((e) => e.id === "automaton-duel")!;
    const odds = duel.choices[0].roll!;
    expect(shares(odds).map((x) => x.percent)).toEqual([70, 30]);
    expect(landOn(odds, 1).id).toBe("win");
    expect(landOn(odds, 70).id).toBe("win");
    expect(landOn(odds, 71).id).toBe("lose");
    expect(landOn(odds, 100).id).toBe("lose");
    const wheel = luckEvents.find((e) => e.id === "pay-wheel")!.choices[0]
      .roll!;
    const landed = new Set(
      Array.from({ length: 100 }, (_, i) => landOn(wheel, i + 1).id),
    );
    expect(landed.size).toBe(6);
  });

  it("does not repeat an event until the run has seen them all", () => {
    const s = party();
    const seen = new Set<string>();
    for (let i = 0; i < events.length; i++) {
      enterEvent(s);
      seen.add(s.eventId!);
    }
    expect(seen.size).toBe(events.length);
    enterEvent(s);
    expect(events.some((e) => e.id === s.eventId)).toBe(true);
  });

  it("a bet charges up front, holds the party on the result, then continues", () => {
    let s = rigged(at("automaton-duel"), 1, 70);
    const gold = s.gold;
    s = vote(s, "favourite");
    expect(s.phase).toBe("EVENT");
    expect(s.luck).toMatchObject({ outcome: "win", done: true });
    expect(s.luck!.roll).toBeLessThanOrEqual(70);
    expect(s.gold).toBe(gold - 60 + 130);
    expect(() =>
      reduce(s, "a", { type: "vote", choice: "leave" }, 0),
    ).toThrow();
    s = reduce(s, "b", { type: "continue" }, 0);
    expect(s.phase).toBe("MAP");
    expect(s.luck).toBeUndefined();
  });

  it("a lost bet costs only the stake", () => {
    let s = rigged(at("automaton-duel"), 31, 100);
    const gold = s.gold;
    s = vote(s, "longshot");
    expect(s.luck!.outcome).toBe("lose");
    expect(s.gold).toBe(gold - 60);
  });

  it("refuses a bet the treasury cannot cover", () => {
    const s = at("automaton-duel");
    s.gold = 59;
    expect(() =>
      reduce(s, "a", { type: "vote", choice: "favourite" }, 0),
    ).toThrow("treasury");
  });

  it("a strongbox that bites starts its fight only when the party continues", () => {
    let s = rigged(at("warm-strongbox"), 61, 100);
    s = vote(s, "pry");
    expect(s.luck).toMatchObject({ outcome: "mimic", fight: "combat" });
    expect(s.phase).toBe("EVENT");
    s = reduce(s, "a", { type: "continue" }, 0);
    expect(s.phase).toBe("COMBAT");
    expect(s.enemies.length).toBeGreaterThan(0);
  });

  it("a fight an event dealt pays a smaller purse than a chamber", () => {
    let s = rigged(at("warm-strongbox"), 61, 100);
    s = vote(s, "pry");
    s = reduce(s, "a", { type: "continue" }, 0);
    const gold = s.gold;
    for (const e of s.enemies) e.hp = 0;
    resolveRound(s);
    expect(s.reward).toBe(80);
    expect(s.gold).toBe(gold + 80);
  });

  it("the wheel's promotion raises one standing hero's Power", () => {
    const [low, high] = band("pay-wheel", "promotion");
    let s = rigged(at("pay-wheel"), low, high);
    const power = s.players.map((p) => p.power);
    s = vote(s, "spin");
    expect(s.luck!.outcome).toBe("promotion");
    const gained = s.players.map((p, i) => p.power - power[i]);
    expect(gained.sort()).toEqual([0, 2]);
  });

  it("the wheel's accident never downs a hero", () => {
    let s = rigged(at("pay-wheel"), ...band("pay-wheel", "accident"));
    for (const p of s.players) p.hp = 3;
    s = vote(s, "spin");
    expect(s.luck!.outcome).toBe("accident");
    expect(s.players.every((p) => p.hp === 1)).toBe(true);
  });

  it("docked pay never takes the treasury below zero", () => {
    let s = rigged(at("pay-wheel"), ...band("pay-wheel", "docked"));
    s.gold = 40;
    s = vote(s, "spin");
    expect(s.luck!.outcome).toBe("docked");
    expect(s.gold).toBe(0);
  });

  it("loaded dice roll once for each standing hero", () => {
    let s = at("loaded-dice", 3);
    s.players[2].hp = 0;
    s.players[2].fallen = true;
    const before = s.players.map((p) => ({ hp: p.hp, maxHp: p.maxHp }));
    s = vote(s, "roll");
    const rolls = s.luck!.heroes!;
    expect(Object.keys(rolls).sort()).toEqual(["a", "b"]);
    for (const [id, r] of Object.entries(rolls)) {
      const i = s.players.findIndex((p) => p.id === id);
      if (r.outcome === "win")
        expect(s.players[i].maxHp).toBe(before[i].maxHp + 8);
      else expect(s.players[i].hp).toBe(Math.max(1, before[i].hp - 10));
    }
    expect(s.players[2].maxHp).toBe(before[2].maxHp);
  });

  describe("the buried surveyor", () => {
    it("finds a different piece each safe search, and ends when searched clean", () => {
      let s = rigged(at("buried-surveyor"), 26, 100);
      s = vote(s, "search");
      expect(s.luck!.step).toBe(1);
      expect(s.luck!.done).toBeFalsy();
      expect(s.luck!.found).toHaveLength(1);
      expect(eventChoices(s).map((c) => c.id)).toEqual(["press", "leave"]);
      expect(eventChoices(s)[0].name).toContain("50% ambush");
      s = rigged(s, 51, 100);
      s = vote(s, "press");
      s = rigged(s, 76, 100);
      s = vote(s, "press");
      expect(new Set(s.luck!.found).size).toBe(3);
      expect(s.luck!.done).toBe(true);
      expect(s.teamRelics).toHaveLength(1);
      s = reduce(s, "a", { type: "continue" }, 0);
      expect(s.phase).toBe("MAP");
    });

    it("an ambush keeps the loot and becomes an elite fight", () => {
      let s = rigged(at("buried-surveyor"), 26, 100);
      s = vote(s, "search");
      const found = s.luck!.found!;
      s = rigged(s, 1, 50);
      s = vote(s, "press");
      expect(s.luck).toMatchObject({ outcome: "ambush", fight: "elite" });
      expect(s.luck!.found).toEqual(found);
      s = reduce(s, "b", { type: "continue" }, 0);
      expect(s.phase).toBe("COMBAT");
      expect(s.enemies.every((e) => e.elite)).toBe(true);
    });

    it("leaving mid-search goes straight back to the map", () => {
      let s = rigged(at("buried-surveyor"), 26, 100);
      s = vote(s, "search");
      s = vote(s, "leave");
      expect(s.phase).toBe("MAP");
      expect(s.luck).toBeUndefined();
    });

    it("gives gold instead of a relic the party already owns both of", () => {
      let s = at("buried-surveyor");
      s.teamRelics = ["pact-lantern", "ration-engine"];
      const gold = s.gold;
      for (let i = 0; i < 3 && !s.luck?.done; i++) {
        s = rigged(s, 76, 100);
        s = vote(s, i === 0 ? "search" : "press");
      }
      expect(s.teamRelics).toHaveLength(2);
      expect(s.gold).toBe(gold + 90 + 150);
    });
  });

  describe("the slag chute", () => {
    it("burns everyone on every try, more each time, until it is found", () => {
      let s = at("slag-chute");
      for (const p of s.players) p.hp = p.maxHp;
      const hp = s.players.map((p) => p.hp);
      s = rigged(s, 26, 100);
      s = vote(s, "reach");
      expect(s.players.map((p) => p.hp)).toEqual(hp.map((h) => h - 5));
      expect(s.luck!.outcome).toBeUndefined();
      expect(eventChoices(s)[0].name).toContain("35%");
      s = rigged(s, 36, 100);
      s = vote(s, "press");
      expect(s.players.map((p) => p.hp)).toEqual(hp.map((h) => h - 11));
      const gold = s.gold;
      s = rigged(s, 1, 45);
      s = vote(s, "press");
      expect(s.luck).toMatchObject({ outcome: "strongbox", done: true });
      expect(s.gold).toBe(gold + 170);
    });

    it("reaches a sure thing, and never downs anyone getting there", () => {
      const chute = luckEvents.find((e) => e.id === "slag-chute")!;
      expect(pressOdds(chute, 99).chance).toBe(100);
      let s = at("slag-chute");
      s = rigged(s, 100, 100);
      s = vote(s, "reach");
      while (!s.luck?.done) {
        s = rigged(s, 100, 100);
        s = vote(s, "press");
      }
      expect(s.players.every((p) => p.hp >= 1)).toBe(true);
      expect(s.luck!.step).toBeLessThanOrEqual(9);
    });
  });

  it("changes the decision epoch with every try, so a stale vote cannot land", () => {
    let s = rigged(at("buried-surveyor"), 26, 100);
    const before = epoch(s);
    s = vote(s, "search");
    const after = epoch(s);
    expect(after).not.toBe(before);
    s = rigged(s, 51, 100);
    s = vote(s, "press");
    expect(epoch(s)).not.toBe(after);
  });

  it("shows the roll to every player but never the RNG behind it", () => {
    let s = rigged(at("automaton-duel"), 1, 70);
    s = vote(s, "favourite");
    const view = snapshot(s, "a", ["a", "b"]);
    expect(view.luck).toMatchObject({ outcome: "win", done: true });
    expect("rng" in view).toBe(false);
  });
});
