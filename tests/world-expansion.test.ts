import { describe, it, expect } from "vitest";
import { FLOOR_DEPTH, floors as floorDefs } from "../src/content/floors";
import { createRun, addPlayer } from "../src/engine/game";
import { enterCombat, validatePlan } from "../src/engine/combat";
import { generateMap } from "../src/engine/map";
import { abilities } from "../src/content/heroes";
import { reachError } from "../src/shared/reach";
import { chooseEncounter } from "../src/content/encounters";
import { expeditionItems } from "../src/content/expedition-items";
import {
  EXPEDITION_ART,
  EXPEDITION_BOWS,
} from "../src/client/equipment/expedition-art";
import { scores, scoreNotes, selectScore } from "../src/client/audio/score";
function fixture() {
  const s = createRun("WORLD", "world-test");
  addPlayer(s, "a", "Ada");
  addPlayer(s, "b", "Bea");
  // Before boss pools floor two opened in the Cistern and closed in the
  // Archive, which is where the regional encounters these tests read live.
  delete s.bossVersion;
  s.floor = 2;
  s.map = generateMap(s);
  s.currentNode = "2-0";
  enterCombat(s);
  s.enemies[0].row = "front";
  s.enemies[1].row = "back";
  return s;
}
describe("new world content", () => {
  it("all 20 new items have exclusive art; all six weapons have unique bow limbs", () => {
    const keys = expeditionItems.map((i) => i.visual!.attachments[0].asset);
    expect(new Set(keys).size).toBe(20);
    for (const key of keys) expect(EXPEDITION_ART[key]).toBeTypeOf("function");
    const bows = expeditionItems
      .filter((i) => i.slot === "weapon")
      .map((i) => EXPEDITION_BOWS[i.id]);
    expect(bows.every(Boolean)).toBe(true);
    expect(new Set(bows).size).toBe(6);
  });
  it("maps reproducibly traverse three biomes, one to a floor, with each floor's boss drawn from its pool", () => {
    const a = createRun("A", "world"),
      b = createRun("B", "world");
    expect(generateMap(a)).toEqual(generateMap(b));
    const run = createRun("C", "world");
    const maps = floorDefs.map((def, i) => {
      run.floor = i + 1;
      return { def, map: generateMap(run) };
    });
    for (const { def, map } of maps) {
      expect(new Set(map.map((n) => n.biome))).toEqual(new Set([def.biome]));
      expect(Math.max(...map.map((n) => n.depth))).toBe(FLOOR_DEPTH - 1);
      expect(new Set(map.map((n) => n.name)).size).toBe(map.length);
      const boss = map.find((n) => n.type === "boss")!;
      expect(def.bosses).toContain(boss.boss);
      expect(
        map.filter((n) => n.depth === FLOOR_DEPTH - 2).map((n) => n.type),
      ).toEqual(["camp"]);
    }
  });
  it("maps in a room from before boss pools traverse three biomes across two floors", () => {
    const run = createRun("C", "world");
    delete run.bossVersion;
    const floors = [1, 2].map((floor) => {
      run.floor = floor;
      return generateMap(run);
    });
    // The Foundry is floor one; the Cistern and the Archive are floor two.
    expect(new Set(floors[0].map((n) => n.biome))).toEqual(
      new Set(["foundry"]),
    );
    expect(new Set(floors[1].map((n) => n.biome))).toEqual(
      new Set(["cistern", "archive"]),
    );
    for (const map of floors) {
      expect(Math.max(...map.map((n) => n.depth))).toBe(FLOOR_DEPTH - 1);
      expect(new Set(map.map((n) => n.name)).size).toBe(map.length);
    }
    // Each floor ends at its own boss, and the chamber before it is a rest.
    expect(floors[0].find((n) => n.type === "boss")!.name).toBe(
      "The Collector's Hoard",
    );
    expect(floors[1].find((n) => n.type === "boss")!.name).toBe(
      "The Counting House",
    );
    for (const map of floors)
      expect(
        map.filter((n) => n.depth === FLOOR_DEPTH - 2).map((n) => n.type),
      ).toEqual(["camp"]);
  });
  it("regional formations follow the authoritative chamber; legacy maps use original encounters", () => {
    const s = fixture();
    // A room with factions meets each region's own creatures there.
    for (const [node, faction] of [
      ["2-0", "cistern"],
      ["3-0", "archive"],
    ]) {
      s.currentNode = node;
      for (let i = 0; i < 20; i++) expect(chooseEncounter(s).faction).toBe(faction);
    }
    // A room from before factions keeps the region's renamed foundry fights.
    delete s.factionVersion;
    for (const [node, biome] of [
      ["2-0", "cistern"],
      ["3-0", "archive"],
    ]) {
      s.currentNode = node;
      for (let i = 0; i < 20; i++) expect(chooseEncounter(s).biome).toBe(biome);
    }
    s.map.forEach((n) => delete n.biome);
    expect(chooseEncounter(s).biome).toBeUndefined();
    expect(chooseEncounter(s).faction).toBeUndefined();
  });
  it("melee cannot target screened enemies; marked openings require the hero at front", () => {
    const s = fixture(),
      p = s.players[0],
      target = s.enemies[1];
    expect(() => validatePlan(s, p, "bash", target.id)).toThrow("screen");
    target.statuses.push({ id: "marked", stacks: 1, duration: 2 });
    p.row = "back";
    expect(() => validatePlan(s, p, "bash", target.id)).toThrow("screen");
    p.row = "front";
    expect(() => validatePlan(s, p, "bash", target.id)).not.toThrow();
    const slam = abilities("vanguard", 2).find((a) => a.id === "slam")!;
    expect(reachError(s, p, slam, target)).toContain("screen");
  });
  it("screen collapses when defenders die; ranged and grapples bypass it; legacy rooms keep old rules", () => {
    const s = fixture(),
      p = s.players[0],
      target = s.enemies[1];
    for (const [hero, id] of [
      ["ranger", "arrow"],
      ["reaver", "grapple"],
    ]) {
      const a = abilities(hero, 2).find((a) => a.id === id)!;
      expect(reachError(s, p, a, target)).toBeUndefined();
    }
    s.enemies[0].hp = 0;
    expect(() => validatePlan(s, p, "bash", target.id)).not.toThrow();
    s.enemies[0].hp = 20;
    delete s.reachVersion;
    expect(() => validatePlan(s, p, "bash", target.id)).not.toThrow();
  });
  it("original scores are bounded, varied, and selected independently of replay speed", () => {
    expect(selectScore("COMBAT", "cistern", true)).toBe("boss");
    expect(selectScore("MAP", "cistern")).toBe("cistern");
    expect(selectScore("AUCTION", "archive")).toBe("auction");
    for (const id of Object.keys(scores) as (keyof typeof scores)[]) {
      const notes = Array.from({ length: 64 }, (_, step) =>
        scoreNotes(id, step),
      ).flat();
      expect(notes.length).toBeGreaterThan(24);
      expect(
        notes.every(
          (n) =>
            n.pitch >= 26 && n.pitch <= 76 && n.duration > 0 && n.gain <= 0.12,
        ),
      ).toBe(true);
    }
  });
});
