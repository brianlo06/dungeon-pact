import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { bossFixture, finishPreviewRound } from "../src/dev/boss-fixture";
import { prepareIntents, enterCombat } from "../src/engine/combat";
import { effects } from "../src/engine/effects";
import { createRun, addPlayer } from "../src/engine/game";
import { encounters, CURVE } from "../src/content/encounters";
import { enemies } from "../src/content/enemies";
import { factionEnemies } from "../src/content/factions";
import { forecastIntent } from "../src/shared/forecast";
import type { Enemy, RunState, StatusId, Unit } from "../src/shared/model";

/**
 * Wave 1 of the faction creatures, rule by rule. Each test stages the
 * creature's own encounter through the Battle Lab fixture — the same room the
 * game builds — then sets up the state its rule asks about and checks both the
 * announced intent and what resolving the round does.
 */

const stage = (encounter: string, size: 2 | 3 | 4 = 2): RunState =>
  bossFixture({
    boss: "collector",
    size,
    stage: "opening",
    gold: 300,
    legacy: false,
    encounter,
    heroes: ["vanguard", "arcanist", "ranger", "warden"],
  });
const find = (s: RunState, definition: string) =>
  s.enemies.find((e) => e.definition === definition && e.hp > 0)!;
const give = (u: Unit, id: StatusId, stacks = 1, duration = 3) =>
  u.statuses.push({ id, stacks, duration });
const has = (u: Unit, id: StatusId) => u.statuses.some((x) => x.id === id);
/** Only this creature acts: everyone else loses the round. */
const alone = (s: RunState, keep: Enemy) => {
  for (const e of s.enemies)
    if (e.id !== keep.id) e.statuses.push({ id: "interrupted", stacks: 1, duration: 1 });
  for (const e of s.enemies)
    if (e.id !== keep.id) e.intent.ability = { ...e.intent.ability, interruptible: true };
};

describe("the Cistern", () => {
  it("the Pressure Maw drags a back-row hero forward and soaks them, then blasts the front row", () => {
    const s = stage("intake-tunnel");
    const maw = find(s, "maw");
    const back = s.players.find((p) => p.row === "back") ?? s.players[1];
    back.row = "back";
    s.round = 1;
    prepareIntents(s);
    expect(maw.intent.ability.id).toBe("siphon");
    expect(maw.intent.target).toBe(back.id);
    expect(maw.why).toBe("back row");
    alone(s, maw);
    const next = finishPreviewRound(s);
    const pulled = next.players.find((p) => p.id === back.id)!;
    expect(pulled.row).toBe("front");
    expect(has(pulled, "wet")).toBe(true);
    const after = find(next, "maw");
    expect(after.intent.ability.id).toBe("jet");
    expect(after.intent.row).toBe("front");
  });

  it("the Sluice Eel soaks the dry and Conducts into the Wet, chaining to everyone else", () => {
    const s = stage("spillway-watch", 3);
    const eel = find(s, "eel");
    prepareIntents(s);
    expect(eel.intent.ability.id).toBe("soak");
    const wet = s.players[2];
    give(wet, "wet");
    prepareIntents(s);
    expect(eel.intent.ability.id).toBe("conduct");
    expect(eel.intent.target).toBe(wet.id);
    expect(eel.why).toBe("Wet");
    alone(s, eel);
    const seq = s.eventSeq;
    const next = finishPreviewRound(s);
    expect(has(next.players[2], "wet")).toBe(false);
    const beats = next.logs.filter((l) => l.seq > seq && l.beat).map((l) => l.beat!);
    expect(beats.some((b) => b.label === "CHAIN SHOCK")).toBe(true);
    // Every other hero is struck by the chain (through Barrier or not).
    for (const p of next.players.filter((p) => p.id !== wet.id))
      expect(
        beats.some((b) => (b.kind === "damage" || b.kind === "block") && b.target === p.id && b.actor === eel.id),
        p.name,
      ).toBe(true);
  });

  it("the Plate Tender plates its sturdiest ally; the plate hardens onto it, or leaves it Vulnerable broken soft", () => {
    const s = stage("plate-yard");
    const tender = find(s, "tender");
    const bulwark = find(s, "bulwark");
    prepareIntents(s);
    expect(tender.intent.ability.id).toBe("plate");
    expect(tender.intent.target).toBe(bulwark.id);
    alone(s, tender);
    let next = finishPreviewRound(s);
    const plate = find(next, "tender-plate");
    expect(plate.owner).toBe(find(next, "bulwark").id);
    // Left alone for its fuse, it hardens onto its host.
    for (let i = 0; i < 3 && next.phase === "COMBAT"; i++) {
      for (const e of next.enemies)
        if (e.definition !== "tender-plate")
          e.statuses.push({ id: "interrupted", stacks: 1, duration: 1 }),
            (e.intent.ability = { ...e.intent.ability, interruptible: true });
      next = finishPreviewRound(next);
    }
    const host = find(next, "bulwark");
    expect(has(host, "encrusted")).toBe(true);

    // Broken while soft, it leaves the host Vulnerable instead.
    const t = stage("plate-yard");
    prepareIntents(t);
    alone(t, find(t, "tender"));
    const u = finishPreviewRound(t);
    const soft = find(u, "tender-plate");
    effects(u, u.players[0], soft, [{ kind: "damage", amount: 500, pierce: true }]);
    expect(has(find(u, "bulwark"), "vulnerable")).toBe(true);
  });

  it("the Dredger drags a wounded front-liner back and shoves a sturdy one forward when the front is thin", () => {
    const s = stage("dredge-crew", 3);
    const dredger = find(s, "dredger");
    const hound = find(s, "hound");
    hound.hp = Math.floor(hound.maxHp * 0.3);
    s.round = 1;
    prepareIntents(s);
    expect(dredger.intent.ability.id).toBe("drag");
    expect(dredger.intent.target).toBe(hound.id);
    alone(s, dredger);
    const next = finishPreviewRound(s);
    expect(find(next, "hound").row).toBe("back");
  });

  it("the Pressure Engine builds to a vent on every hero, and cracks over itself under enough damage", () => {
    const s = stage("pressure-engine", 2);
    const engine = find(s, "engine");
    expect(s.enemies.every((e) => !e.elite)).toBe(true);
    engine.statuses = engine.statuses.filter((x) => x.id !== "pressure");
    give(engine, "pressure", 4, 3);
    prepareIntents(s);
    expect(engine.intent.ability.id).toBe("vent");
    const forecast = forecastIntent(s, engine);
    expect(forecast.aim).toBe("every hero");
    // 6 + 4 per stack of pressure, before Guard and the party-size multiplier.
    expect(forecast.hits[0].damage).toBeGreaterThan(20);
    const before = s.players.map((p) => p.hp);
    alone(s, engine);
    const vented = finishPreviewRound(s);
    vented.players.forEach((p, i) => expect(p.hp).toBeLessThan(before[i]));
    expect(has(find(vented, "engine"), "pressure")).toBe(false);

    const t = stage("pressure-engine", 2);
    const e2 = find(t, "engine");
    e2.statuses = e2.statuses.filter((x) => x.id !== "pressure");
    give(e2, "pressure", 4, 3);
    prepareIntents(t);
    e2.taken = 999;
    const hp = t.players.map((p) => p.hp);
    alone(t, e2);
    const cracked = finishPreviewRound(t);
    // The vent never reached the party.
    cracked.players.forEach((p, i) => expect(p.hp).toBeGreaterThanOrEqual(hp[i] - 40));
    expect(find(cracked, "engine").statuses.some((x) => x.id === "vulnerable")).toBe(true);
  });
});

describe("the Archive", () => {
  it("the Seal Scribe seals a hero's sentence; it passes on them, and outlives the Scribe", () => {
    const s = stage("copy-desk");
    const scribe = find(s, "scribe");
    prepareIntents(s);
    expect(scribe.intent.ability.id).toBe("sentence");
    const sealed = scribe.intent.target;
    alone(s, scribe);
    let next = finishPreviewRound(s);
    const seal = find(next, "sentence-seal");
    expect(seal.bound).toBe(sealed);
    expect(seal.owner).toBe(scribe.id);
    // Due: its move is aimed at the hero whose name is on it.
    next.round = seal.fuse!.at + seal.fuse!.rounds;
    prepareIntents(next);
    expect(find(next, "sentence-seal").intent.target).toBe(sealed);

    // The wax outlives the Scribe: killing it does not lift the sentence.
    const t = stage("copy-desk");
    prepareIntents(t);
    alone(t, find(t, "scribe"));
    const u = finishPreviewRound(t);
    effects(u, u.players[0], find(u, "scribe"), [{ kind: "damage", amount: 999, pierce: true }]);
    expect(find(u, "sentence-seal").hp).toBeGreaterThan(0);
    // Breaking it answers to the Scribe while it stands, and ends the sentence.
    effects(u, u.players[0], find(u, "sentence-seal"), [{ kind: "damage", amount: 999, pierce: true }]);
    expect(u.enemies.find((e) => e.definition === "sentence-seal")!.hp).toBe(0);
  });

  it("the Ledger Wraith's debt comes due in gold, in blood when the treasury is short, and is forgiven if it falls", () => {
    const s = stage("ledger-room");
    const wraith = find(s, "wraith");
    prepareIntents(s);
    expect(wraith.intent.ability.id).toBe("entry");
    const debtor = s.players.find((p) => p.id === wraith.intent.target)!;
    alone(s, wraith);
    let next = finishPreviewRound(s);
    const owed = next.players.find((p) => p.id === debtor.id)!;
    const debt = owed.statuses.find((x) => x.id === "debt")!;
    expect(debt.tethered).toBe(true);
    // Short a treasury, the rest is paid in health.
    next.gold = 10;
    debt.duration = 1;
    const owedAmount = debt.stacks;
    for (const e of next.enemies) e.statuses.push({ id: "interrupted", stacks: 1, duration: 1 }), (e.intent.ability = { ...e.intent.ability, interruptible: true });
    const seq = next.eventSeq;
    next = finishPreviewRound(next);
    const paid = next.players.find((p) => p.id === debtor.id)!;
    // The treasury pays what it holds; the carrier is struck for the rest.
    expect(next.gold).toBe(0);
    const beats = next.logs.filter((l) => l.seq > seq && l.beat).map((l) => l.beat!);
    expect(beats.some((b) => b.label === "DEBT DUE" && b.target === debtor.id)).toBe(true);
    const struck = beats
      .filter((b) => (b.kind === "damage" || b.kind === "block") && b.target === debtor.id && b.actor === debtor.id)
      .reduce((n, b) => n + (b.amount ?? 0), 0);
    expect(struck).toBe(owedAmount - 10);
    expect(has(paid, "debt")).toBe(false);

    const t = stage("ledger-room");
    prepareIntents(t);
    alone(t, find(t, "wraith"));
    const u = finishPreviewRound(t);
    effects(u, u.players[0], find(u, "wraith"), [{ kind: "damage", amount: 999, pierce: true }]);
    expect(u.players.some((p) => has(p, "debt"))).toBe(false);
  });

  it("the Indexer Marks the most exposed hero, and the Stalker strikes, slips rows, then cashes the Mark in", () => {
    const s = stage("marked-for-collection");
    const indexer = find(s, "indexer");
    const stalker = find(s, "stalker");
    s.players[1].hp = 20;
    prepareIntents(s);
    expect(indexer.intent.ability.id).toBe("index");
    expect(indexer.intent.target).toBe(s.players[1].id);
    // Round one: the Stalker goes for the weakest.
    expect(stalker.intent.ability.id).toBe("footnote");
    expect(stalker.intent.target).toBe(s.players[1].id);
    expect(stalker.why).toBe(`${s.players[1].name} weakest`);
    const row = stalker.row;
    s.players[1].hp = s.players[1].maxHp;
    let next = finishPreviewRound(s);
    // Round two: it slips to the other row.
    expect(find(next, "stalker").intent.ability.id).toBe("sidenote");
    next = finishPreviewRound(next);
    expect(find(next, "stalker").row).not.toBe(row);
    // Round three: the Mark is what it wants.
    const marked = next.players.find((p) => has(p, "marked"))!;
    expect(marked).toBeTruthy();
    const st = find(next, "stalker");
    expect(st.intent.ability.id).toBe("footnote");
    expect(st.intent.target).toBe(marked.id);
    expect(st.why).toBe("Marked");
    expect(forecastIntent(next, st).riders).toContain("+20 Marked");
  });
});

describe("encounters and the complexity curve", () => {
  const room = (depth: number) => {
    const s = createRun("CURVE", "curve-seed");
    addPlayer(s, "a", "Ada");
    addPlayer(s, "b", "Bram");
    s.map = [{ id: "n", depth, lane: 0, type: "combat", name: "x", biome: "cistern", next: [], visited: false }];
    s.currentNode = "n";
    return s;
  };

  it("a floor's first fight is a lesson, and later fights climb the curve without repeating", () => {
    expect(CURVE[0]).toBe(1);
    for (let seed = 0; seed < 30; seed++) {
      const s = room(0);
      s.rng = 1 + seed * 7919;
      enterCombat(s);
      const first = encounters.find((e) => e.id === s.fought!.at(-1))!;
      expect(first.faction).toBe("cistern");
      expect(first.tier).toBe(1);
      s.map[0].depth = 3;
      enterCombat(s);
      const later = encounters.find((e) => e.id === s.fought!.at(-1))!;
      expect(later.id).not.toBe(first.id);
      expect(later.tier).toBe(CURVE[3]);
    }
  });

  it("only elite chambers draw an elite creature, and it brings no rolled trait", () => {
    for (let seed = 0; seed < 40; seed++) {
      const s = room(2);
      s.rng = 1 + seed * 104729;
      enterCombat(s);
      expect(s.enemies.some((e) => enemies.find((d) => d.id === e.definition)?.eliteOnly)).toBe(false);
    }
    let met = 0;
    for (let seed = 0; seed < 40; seed++) {
      const s = room(3);
      s.map[0].type = "elite";
      s.rng = 1 + seed * 104729;
      enterCombat(s, false, true);
      if (s.enemies.some((e) => e.definition === "engine")) {
        met++;
        expect(s.enemies.every((e) => !e.elite)).toBe(true);
      }
    }
    expect(met).toBeGreaterThan(0);
  });

  it("a room from before factions never meets a faction creature", () => {
    for (let seed = 0; seed < 40; seed++) {
      const s = room(3);
      delete s.factionVersion;
      s.rng = 1 + seed * 31;
      enterCombat(s);
      expect(s.enemies.every((e) => !enemies.find((d) => d.id === e.definition)?.faction)).toBe(true);
    }
  });

  it("every faction encounter is authored for every party size, with a sentence, from real creatures", () => {
    const factions = encounters.filter((e) => e.faction);
    expect(factions.filter((e) => e.faction === "cistern" && !e.elite).length).toBeGreaterThanOrEqual(8);
    expect(factions.filter((e) => e.faction === "archive" && !e.elite).length).toBeGreaterThanOrEqual(8);
    for (const e of factions) {
      expect(e.sentence, e.id).toBeTruthy();
      expect(e.elite || e.tier, e.id).toBeTruthy();
      for (const size of [2, 3, 4] as const) {
        expect(e.formations[size], `${e.id} ${size}`).toHaveLength(size);
        for (const id of e.formations[size]) {
          const def = enemies.find((d) => d.id === id);
          expect(def, `${e.id} ${id}`).toBeTruthy();
          expect(def!.object, `${e.id} ${id}`).toBeFalsy();
          expect(def!.faction === undefined || def!.faction === e.faction, `${e.id} ${id}`).toBe(true);
        }
      }
    }
  });
});

it("no engine or client file names a faction creature: content is data", () => {
  const ids = factionEnemies.map((d) => d.id);
  const roots = ["src/engine", "src/shared", "src/server"];
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, f.name);
      if (f.isDirectory()) walk(path);
      else if (/\.tsx?$/.test(f.name)) {
        const text = readFileSync(path, "utf8");
        for (const id of ids)
          if (new RegExp(`["'\`]${id}["'\`]`).test(text)) offenders.push(`${path}: ${id}`);
      }
    }
  };
  roots.forEach(walk);
  expect(offenders).toEqual([]);
});
