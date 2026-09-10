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
} from "../src/content/evolutions";
import type { RunState } from "../src/shared/model";

function atMentor(heroIds: string[], tier: 1 | 2 | 3 = 1): RunState {
  let s = createRun("PATHS", "test-paths");
  heroIds.forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  heroIds.forEach((id, i) => {
    s = reduce(s, `p${i}`, { type: "hero", hero: id }, 0);
  });
  s.map = generateMap(s);
  s.phase = "MENTOR";
  s.mentorId = mentors[tier - 1].id;
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

it("puts a mentor on the route at three rising tiers", () => {
  const map = generateMap(createRun("MAP", "seed-paths"));
  const nodes = map.filter((n) => n.type === "mentor");
  expect(nodes.length).toBe(3);
  expect(new Set(nodes.map((n) => mentorTier(n.depth))).size).toBe(3);
  // No route reaches every mentor: each sits at a different depth, and a run
  // visits one node per depth.
  for (const n of nodes)
    expect(map.some((x) => x.depth === n.depth && x.id !== n.id)).toBe(true);
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

it("lets a hero train once per run and only answer once per mentor", () => {
  let s = atMentor(["vanguard", "warden"], 1);
  s = reduce(s, "p0", { type: "train", accept: true }, 0);
  expect(() => reduce(s, "p0", { type: "train", accept: false }, 0)).toThrow(
    "already answered",
  );
  // A later mentor cannot re-train the same hero.
  s.mentorId = mentors[1].id;
  s.trained = [];
  expect(() => reduce(s, "p0", { type: "train", accept: true }, 0)).toThrow(
    "already taken a path",
  );
});

it("returns to the map once every hero has answered", () => {
  let s = atMentor(["vanguard", "warden"], 2);
  s = reduce(s, "p0", { type: "train", accept: false }, 0);
  expect(s.phase).toBe("MENTOR");
  s = reduce(s, "p1", { type: "train", accept: true }, 0);
  expect(s.phase).toBe("MAP");
  expect(s.mentorId).toBeNull();
  expect(s.players[0].evolution).toBeUndefined();
  expect(s.players[1].evolution).toBeTruthy();
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
    for (let d = 0; d < 6; d++) {
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
