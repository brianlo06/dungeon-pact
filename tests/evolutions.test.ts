import { expect, it } from "vitest";
import { createRun, addPlayer, reduce } from "../src/engine/game";
import { generateMap, mentorTier } from "../src/engine/map";
import { abilities, heroes } from "../src/content/heroes";
import {
  evolutions,
  mentors,
  pathFor,
  resourceCap,
  className,
  drillFor,
} from "../src/content/evolutions";
import type { RunState } from "../src/shared/model";

/**
 * A training ground teaching the first hero's class. The class is drawn on
 * entry in real play; it is set here so these tests exercise the rule rather
 * than the legacy branch kept for rooms that entered a mentor before it.
 */
function atMentor(heroIds: string[], tier: 1 | 2 | 3 = 1): RunState {
  let s = createRun("PATHS", "test-paths");
  heroIds.forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  heroIds.forEach((id, i) => {
    s = reduce(s, `p${i}`, { type: "hero", hero: id }, 0);
  });
  s.map = generateMap(s);
  s.phase = "MENTOR";
  s.mentorId = mentors[tier - 1].id;
  s.mentorClass = heroIds[0];
  s.trained = [];
  s.gold = 2000;
  return s;
}

it("gives every class one path per mentor", () => {
  expect(evolutions.length).toBe(heroes.length * mentors.length);
  for (const m of mentors)
    for (const h of heroes) {
      const path = pathFor(m.id, h.id)!;
      expect(path).toBeTruthy();
      // The swap keeps the ability id so branches and cooldowns still resolve.
      expect(path.ability.id).toBe(path.replaces);
      expect(abilities(h.id, 2).some((a) => a.id === path.replaces)).toBe(true);
    }
});

it("keeps the three rising tiers on a legacy single-floor route", () => {
  const run = createRun("MAP", "seed-paths");
  delete run.floor;
  const map = generateMap(run);
  const nodes = map.filter((n) => n.type === "mentor");
  expect(nodes.length).toBe(3);
  expect(new Set(nodes.map((n) => mentorTier(n.depth))).size).toBe(3);
  // No route reaches every mentor: each sits at a different depth, and a run
  // visits one node per depth.
  for (const n of nodes)
    expect(map.some((x) => x.depth === n.depth && x.id !== n.id)).toBe(true);
});

/**
 * A floor holds one mentor and there are three, so a run meets two. The first
 * floor always teaches the Whetstone; the second draws the Reliquary or the
 * Cipher. Over enough runs every mentor appears, and tiers never go backwards.
 */
it("teaches each mentor on its own floor when the run has three", () => {
  for (let seed = 0; seed < 10; seed++) {
    const run = createRun("MAP", `floors-${seed}`);
    const tiers = [1, 2, 3].map((floor) => {
      run.floor = floor;
      const mentorsHere = generateMap(run).filter((n) => n.type === "mentor");
      expect(mentorsHere).toHaveLength(1);
      return mentorsHere[0].tier!;
    });
    expect(tiers).toEqual([1, 2, 3]);
  }
});

it("teaches a rising mentor on each of a two-floor room's floors, and every mentor across runs", () => {
  const seen = new Set<number>();
  for (let seed = 0; seed < 40; seed++) {
    const run = createRun("MAP", `floors-${seed}`);
    delete run.bossVersion;
    const tiers = [1, 2].map((floor) => {
      run.floor = floor;
      const mentorsHere = generateMap(run).filter((n) => n.type === "mentor");
      expect(mentorsHere).toHaveLength(1);
      return mentorsHere[0].tier!;
    });
    expect(tiers[0]).toBe(1);
    expect(tiers[1]).toBeGreaterThan(tiers[0]);
    tiers.forEach((t) => seen.add(t));
  }
  expect([...seen].sort()).toEqual([1, 2, 3]);
});

it("swaps the signature ability and applies the path's stat cost", () => {
  let s = atMentor(["vanguard", "warden"], 1);
  const before = { ...s.players[0] };
  s = reduce(s, "p0", { type: "train", accept: true }, 0);
  const p = s.players[0];
  const path = pathFor("whetstone", "vanguard")!;
  expect(p.evolution).toBe(path.id);
  expect(className(p)).toBe(path.name);
  expect(p.power).toBe(before.power + (path.stats.power ?? 0));
  expect(p.guard).toBe(before.guard + (path.stats.guard ?? 0));
  const kit = abilities(p.heroId, 2, p.upgrades, p.evolution);
  expect(kit.find((a) => a.id === path.replaces)!.name).toBe(path.ability.name);
  expect(s.gold).toBe(2000 - mentors[0].tuition);
});

it("charges tuition to the shared purse and refuses what it cannot cover", () => {
  let s = atMentor(["vanguard", "warden"], 1);
  s.gold = mentors[0].tuition - 1;
  expect(() => reduce(s, "p0", { type: "train", accept: true }, 0)).toThrow();
  expect(s.gold).toBe(mentors[0].tuition - 1);
});

it("evolves a hero once per run, and drills them after that", () => {
  let s = atMentor(["vanguard", "warden"], 1);
  s = reduce(s, "p0", { type: "train", accept: true }, 0);
  const path = s.players[0].evolution;
  expect(path).toBeTruthy();
  expect(() => reduce(s, "p0", { type: "train", accept: false }, 0)).toThrow(
    "already answered",
  );
  // A later ground cannot give the same hero a second path. It can work them.
  s.mentorId = mentors[1].id;
  s.mentorClass = "vanguard";
  s.trained = [];
  const power = s.players[0].power;
  s = reduce(s, "p0", { type: "train", accept: true }, 0);
  expect(s.players[0].evolution).toBe(path);
  expect(s.players[0].power).toBe(power + drillFor(mentors[1].tier).power);
});

it("offers a path only to the class the ground teaches", () => {
  let s = atMentor(["vanguard", "warden"], 1);
  const gold = s.gold;
  // The Warden is not what this ground raises, so the Warden drills.
  s = reduce(s, "p1", { type: "train", accept: true }, 0);
  expect(s.players[1].evolution).toBeUndefined();
  expect(s.gold).toBe(gold - drillFor(mentors[0].tier).fee);
});

it("returns to the map once every hero has answered", () => {
  let s = atMentor(["warden", "vanguard"], 2);
  s = reduce(s, "p1", { type: "train", accept: false }, 0);
  expect(s.phase).toBe("MENTOR");
  s = reduce(s, "p0", { type: "train", accept: true }, 0);
  expect(s.phase).toBe("MAP");
  expect(s.mentorId).toBeNull();
  expect(s.mentorClass).toBeNull();
  expect(s.players[1].evolution).toBeUndefined();
  expect(s.players[0].evolution).toBeTruthy();
});

it("raises the resource cap only for paths that pay for it", () => {
  const plain = { heroId: "beguiler", evolution: undefined };
  const puppeteer = { heroId: "beguiler", evolution: "bgl-puppeteer" };
  expect(resourceCap(puppeteer)).toBe(resourceCap(plain) + 2);
});

it("keeps paths out of legacy saves", () => {
  const kit = abilities("vanguard", undefined, [], "van-breaker");
  expect(kit.find((a) => a.id === "slam")!.name).toBe("Foundry slam");
});

/**
 * The route used to link every node to every node on the next layer, so a
 * choice never closed anything off and the map drew as a solid mesh.
 */
it("branches the route instead of linking every node to every node", () => {
  for (const seed of ["route-a", "route-b", "route-c"]) {
    const map = generateMap(createRun("MAP", seed));
    const byDepth = (d: number) => map.filter((n) => n.depth === d);
    const last = Math.max(...map.map((n) => n.depth));
    for (let d = 0; d < last; d++) {
      const row = byDepth(d);
      const below = byDepth(d + 1);
      // Nobody dead-ends, and every chamber below is reachable from some
      // chamber above.
      for (const n of row) expect(n.next.length).toBeGreaterThan(0);
      const reached = new Set(row.flatMap((n) => n.next));
      expect(reached.size).toBe(below.length);
      // Links never cross: a node's targets are a contiguous run of lanes.
      for (const n of row) {
        const lanes = n.next.map((id) => below.findIndex((x) => x.id === id));
        expect(Math.max(...lanes) - Math.min(...lanes)).toBe(lanes.length - 1);
      }
    }
    // Somewhere a choice must actually close something off.
    expect(map.some((n) => n.next.length < byDepth(n.depth + 1).length)).toBe(
      true,
    );
  }
});

it("never names two chambers on one route the same thing", () => {
  for (const seed of ["names-a", "names-b", "names-c"]) {
    const map = generateMap(createRun("MAP", seed));
    for (const type of ["combat", "elite", "event"]) {
      const names = map.filter((n) => n.type === type).map((n) => n.name);
      expect(new Set(names).size).toBe(names.length);
    }
  }
});
