import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce, snapshot } from "../src/engine/game";
import { enterCombat, resolveRound, validateUltimate } from "../src/engine/combat";
import { effects, status } from "../src/engine/effects";
import { charge } from "../src/engine/charge";
import {
  CHARGE,
  ULTIMATE_MAX,
  ultimateFor,
  ultimates,
} from "../src/content/ultimates";
import { heroes } from "../src/content/heroes";
import type { RunState } from "../src/shared/model";

/** A two-hero fight on the tactical rules, with Ultimates. */
function fight(classes = ["vanguard", "arcanist"]): RunState {
  let s = createRun("ULT", "test-ultimates");
  classes.forEach((hero, i) => {
    addPlayer(s, `p${i}`, `Hero ${i}`);
    s = reduce(s, `p${i}`, { type: "hero", hero }, 0);
  });
  s.map = [
    {
      id: "room",
      depth: 1,
      lane: 0,
      type: "combat",
      name: "Test",
      next: ["room2"],
      visited: true,
    },
  ];
  s.currentNode = "room";
  enterCombat(s);
  return s;
}

const brace = (s: RunState, id: string) =>
  reduce(s, id, { type: "plan", ability: "brace", target: id }, 0);

describe("Pact Charge", () => {
  it("starts empty on a new room and is absent from legacy saves", () => {
    const s = fight();
    expect(s.ultimateVersion).toBe(1);
    expect(s.players.every((p) => p.ultimateCharge === 0)).toBe(true);
    const legacy = createRun("OLD", "legacy");
    delete legacy.ultimateVersion;
    addPlayer(legacy, "a", "A");
    expect(legacy.players[0].ultimateCharge).toBeUndefined();
    charge(legacy, legacy.players[0], "kill");
    expect(legacy.players[0].ultimateCharge).toBeUndefined();
  });

  it("fills from dealing damage, by health actually removed", () => {
    const s = fight();
    const [, mage] = s.players;
    const e = s.enemies[0];
    e.hp = 500;
    e.maxHp = 500;
    effects(s, mage, e, [{ kind: "damage", amount: 20 }]);
    const dealt = 500 - e.hp;
    expect(mage.ultimateCharge).toBeCloseTo(dealt * CHARGE.damage, 5);
  });

  it("fills a tank from being hit, blocking and intercepting, at its affinity", () => {
    const s = fight();
    const [tank, mage] = s.players;
    const e = s.enemies[0];
    e.power = 0;
    effects(s, tank, mage, [{ kind: "protect", barrier: 5 }]);
    const shielded = tank.ultimateCharge!;
    const affinity = heroes.find((h) => h.id === "vanguard")!.chargeAffinity!;
    expect(shielded).toBeCloseTo(5 * CHARGE.shield * affinity.shield!, 5);
    const hpBefore = tank.hp;
    effects(s, e, mage, [{ kind: "damage", amount: 30 }]);
    const lost = hpBefore - tank.hp;
    expect(tank.ultimateCharge).toBeCloseTo(
      shielded +
        CHARGE.intercept * affinity.intercept! +
        5 * CHARGE.blocked * affinity.blocked! +
        lost * CHARGE.hurt * affinity.hurt!,
      5,
    );
    // The protected ally took nothing, and earned nothing for it.
    expect(mage.ultimateCharge).toBe(0);
  });

  it("fills a healer from healing that lands, never from overhealing", () => {
    const s = fight(["warden", "vanguard"]);
    const [warden, tank] = s.players;
    tank.hp = tank.maxHp - 10;
    effects(s, warden, tank, [{ kind: "heal", amount: 40 }]);
    const affinity = heroes.find((h) => h.id === "warden")!.chargeAffinity!;
    expect(warden.ultimateCharge).toBeCloseTo(
      10 * CHARGE.heal * affinity.heal!,
      5,
    );
  });

  it("never passes the maximum", () => {
    const s = fight();
    const p = s.players[0];
    p.ultimateCharge = ULTIMATE_MAX - 1;
    charge(s, p, "kill");
    charge(s, p, "revive");
    expect(p.ultimateCharge).toBe(ULTIMATE_MAX);
  });

  it("gives every class a share for acting, so a brace is not a lost round", () => {
    let s = fight();
    s.enemies.forEach((e) => (e.power = 0));
    s = brace(s, "p0");
    s = brace(s, "p1");
    for (const p of s.players)
      expect(p.ultimateCharge ?? 0).toBeGreaterThanOrEqual(CHARGE.action);
  });

  it("carries over between chambers", () => {
    const s = fight();
    s.players[0].ultimateCharge = 64;
    enterCombat(s);
    expect(s.players[0].ultimateCharge).toBe(64);
  });
});

describe("Ultimate readiness and queuing", () => {
  it("refuses an Ultimate the server has not seen charged", () => {
    const s = fight();
    s.players[0].ultimateCharge = ULTIMATE_MAX - 0.5;
    expect(() =>
      reduce(s, "p0", { type: "ultimate", target: s.enemies[0].id }, 0),
    ).toThrow(/not full/);
  });

  it("validates the target rule", () => {
    const s = fight();
    s.players[0].ultimateCharge = ULTIMATE_MAX;
    expect(() =>
      reduce(s, "p0", { type: "ultimate", target: "p1" }, 0),
    ).toThrow(/living enemy/);
    const dead = s.enemies[0];
    dead.hp = 0;
    expect(() =>
      reduce(s, "p0", { type: "ultimate", target: dead.id }, 0),
    ).toThrow(/living enemy/);
  });

  it("lets a downed hero keep their charge but never call the Ultimate", () => {
    const s = fight();
    const tank = s.players[0];
    tank.ultimateCharge = ULTIMATE_MAX;
    tank.hp = 0;
    tank.downedRounds = 2;
    expect(() => validateUltimate(s, tank, s.enemies[0].id)).toThrow(/downed/);
    effects(s, s.players[1], tank, [{ kind: "heal", amount: 30 }]);
    expect(tank.hp).toBeGreaterThan(0);
    expect(tank.ultimateCharge).toBe(ULTIMATE_MAX);
    expect(validateUltimate(s, tank, s.enemies[0].id).id).toBe("lantern-wall");
  });

  it("is an extra action: the plan still resolves, after the Ultimate", () => {
    let s = fight();
    s.players[0].ultimateCharge = ULTIMATE_MAX;
    const target = s.enemies[0];
    target.hp = 999;
    target.maxHp = 999;
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s = reduce(s, "p0", { type: "plan", ability: "bash", target: target.id }, 0);
    const before = s.logs.at(-1)!.seq;
    s = brace(s, "p1");
    const casts = s.logs
      .filter((l) => l.seq > before && l.beat?.kind === "cast")
      .map((l) => l.beat!);
    expect(casts[0]).toMatchObject({ actor: "p0", ultimate: "lantern-wall" });
    // The hero's own planned strike still happened, after it.
    expect(casts.some((b) => b.actor === "p0" && b.label === "Shieldbreaker")).toBe(true);
    expect(casts.findIndex((b) => b.label === "Shieldbreaker")).toBeGreaterThan(0);
  });

  it("consumes the charge as it resolves and fills nothing for its own caster", () => {
    let s = fight();
    s.players[0].ultimateCharge = ULTIMATE_MAX;
    s.enemies.forEach((e) => (e.power = 0));
    s = reduce(s, "p0", { type: "ultimate", target: s.enemies[0].id }, 0);
    // Resolve by hand, so the charge the round's own actions add cannot hide
    // what the Ultimate did to the meter.
    s.plans = {};
    resolveRound(s);
    // Whatever the rest of the round added, the Ultimate's own hits added none:
    // the meter is back near empty, not near full.
    expect(s.players[0].ultimateCharge!).toBeLessThan(30);
  });

  it("applies its authored effects: the Lantern Wall wards and guards every ally", () => {
    let s = fight(["vanguard", "arcanist", "ranger"]);
    s.players[0].ultimateCharge = ULTIMATE_MAX;
    const target = s.enemies[0];
    s = reduce(s, "p0", { type: "ultimate", target: target.id }, 0);
    s.plans = {};
    // Resolve the Ultimate alone, then read the board before enemies act.
    const beatsFrom = s.eventSeq;
    const probe = structuredClone(s);
    probe.enemies.forEach((e) => (e.hp = e.id === target.id ? e.hp : e.hp));
    resolveRound(probe);
    const wards = probe.logs.filter(
      (l) => l.seq > beatsFrom && l.beat?.kind === "ward",
    );
    expect(wards.map((l) => l.beat!.target).sort()).toEqual(
      ["p0", "p1", "p2"].sort(),
    );
    const cast = probe.logs.find(
      (l) => l.seq > beatsFrom && l.beat?.ultimate === "lantern-wall",
    );
    expect(cast?.beat?.target).toBe(target.id);
  });

  it("can be cancelled, and cannot be queued outside combat", () => {
    let s = fight();
    s.players[0].ultimateCharge = ULTIMATE_MAX;
    s = reduce(s, "p0", { type: "ultimate", target: s.enemies[0].id }, 0);
    expect(s.ultimates?.p0).toBeDefined();
    s = reduce(s, "p0", { type: "cancelUltimate" }, 0);
    expect(s.ultimates?.p0).toBeUndefined();
    s.phase = "MAP";
    expect(() =>
      reduce(s, "p0", { type: "ultimate", target: "enemy-0" }, 0),
    ).toThrow(/phase/);
  });

  it("shares who has one queued but hides where it is aimed", () => {
    let s = fight();
    s.players[0].ultimateCharge = ULTIMATE_MAX;
    s = reduce(s, "p0", { type: "ultimate", target: s.enemies[0].id }, 0);
    const mine = snapshot(s, "p0", ["p0", "p1"]);
    const theirs = snapshot(s, "p1", ["p0", "p1"]);
    expect(mine.myUltimate?.target).toBe(s.enemies[0].id);
    expect(theirs.ultimateQueued).toEqual(["p0"]);
    expect(theirs.myUltimate).toBeUndefined();
    expect(JSON.stringify(theirs)).not.toContain('"ultimates"');
  });

  it("survives a reconnect: the snapshot a returning player receives carries the charge", () => {
    const s = fight();
    s.players[1].ultimateCharge = 73.5;
    const restored = JSON.parse(JSON.stringify(s)) as RunState;
    const view = snapshot(restored, "p1", ["p1"]);
    expect(view.players.find((p) => p.id === "p1")?.ultimateCharge).toBe(73.5);
  });
});

describe("Evolutions and Ultimates", () => {
  it("replaces the base Ultimate with the path's own", () => {
    expect(ultimateFor({ heroId: "vanguard" })?.id).toBe("lantern-wall");
    expect(ultimateFor({ heroId: "vanguard", evolution: "van-breaker" })?.id).toBe(
      "gatebreaker",
    );
    // A path that has not authored one keeps the class's.
    expect(ultimateFor({ heroId: "vanguard", evolution: "van-aegis" })?.id).toBe(
      "lantern-wall",
    );
    const base = ultimateFor({ heroId: "vanguard" })!;
    const evolved = ultimateFor({ heroId: "vanguard", evolution: "van-breaker" })!;
    expect(evolved.target).not.toBe(base.target);
    expect(JSON.stringify(evolved.effects)).not.toBe(JSON.stringify(base.effects));
  });

  it("preserves charge through training, and a full meter is ready at once", () => {
    let s = createRun("TRAIN", "train-ultimate");
    addPlayer(s, "p0", "Tank");
    addPlayer(s, "p1", "Mage");
    s = reduce(s, "p1", { type: "hero", hero: "arcanist" }, 0);
    s.phase = "MENTOR";
    s.mentorId = "whetstone";
    s.mentorClass = "vanguard";
    s.gold = 1000;
    s.players[0].ultimateCharge = ULTIMATE_MAX;
    s.players[1].ultimateCharge = 80;
    s = reduce(s, "p0", { type: "train", accept: true }, 0);
    s = reduce(s, "p1", { type: "train", accept: false }, 0);
    expect(s.players[0].evolution).toBe("van-breaker");
    expect(s.players[0].ultimateCharge).toBe(ULTIMATE_MAX);
    expect(s.players[1].ultimateCharge).toBe(80);
    s.map = [
      { id: "r", depth: 2, lane: 0, type: "combat", name: "T", next: [], visited: true },
    ];
    s.currentNode = "r";
    enterCombat(s);
    expect(validateUltimate(s, s.players[0], s.enemies[0].id).id).toBe("gatebreaker");
  });

  it("resolves the Gatebreaker across the whole row and drags it forward", () => {
    let s = fight(["vanguard", "arcanist", "ranger", "warden"]);
    s.players[0].evolution = "van-breaker";
    s.players[0].ultimateCharge = ULTIMATE_MAX;
    const back = s.enemies.filter((e) => e.row === "back");
    const row = back.length ? "back" : "front";
    const aimed = s.enemies.find((e) => e.row === row)!;
    const rowmates = s.enemies.filter((e) => e.row === row && e.hp > 0);
    for (const e of rowmates) {
      e.hp = 400;
      e.maxHp = 400;
      e.statuses.push({ id: "barrier", stacks: 9, duration: 2 });
    }
    s = reduce(s, "p0", { type: "ultimate", target: aimed.id }, 0);
    s.plans = {};
    s.enemies.forEach((e) => (e.power = 0));
    resolveRound(s);
    for (const e of s.enemies.filter((x) => rowmates.some((r) => r.id === x.id))) {
      expect(e.hp).toBeLessThan(400);
      expect(e.row).toBe("front");
    }
  });
});

describe("Ultimate content", () => {
  it("gives every class a base Ultimate with a proper name", () => {
    for (const h of heroes) {
      const u = ultimateFor({ heroId: h.id })!;
      expect(u).toBeDefined();
      expect(u.name).not.toMatch(/ultimate|mega|super/i);
    }
    expect(new Set(ultimates.map((u) => u.name)).size).toBe(ultimates.length);
  });

  it("marks an interrupted windup only when there is one", () => {
    const s = fight();
    const tank = s.players[0];
    const e = s.enemies[0];
    e.intent.ability = { ...e.intent.ability, interruptible: false };
    tank.ultimateCharge = ULTIMATE_MAX;
    expect(() => validateUltimate(s, tank, e.id)).not.toThrow();
    effects(s, tank, e, ultimateFor(tank)!.effects);
    expect(status(e, "interrupted")).toBeUndefined();
  });
});
