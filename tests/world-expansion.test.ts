import { describe, it, expect } from "vitest";
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
  it("maps reproducibly traverse three biomes without changing route length", () => {
    const a = createRun("A", "world"),
      b = createRun("B", "world");
    expect(generateMap(a)).toEqual(generateMap(b));
    const map = generateMap(createRun("C", "world"));
    expect(new Set(map.map((n) => n.biome))).toEqual(
      new Set(["foundry", "cistern", "archive"]),
    );
    expect(Math.max(...map.map((n) => n.depth))).toBe(6);
    expect(new Set(map.map((n) => n.name)).size).toBe(map.length);
  });
  it("regional formations follow the authoritative chamber; legacy maps use original encounters", () => {
    const s = fixture();
    for (const [node, biome] of [
      ["2-0", "cistern"],
      ["3-0", "archive"],
    ]) {
      s.currentNode = node;
      for (let i = 0; i < 20; i++) expect(chooseEncounter(s).biome).toBe(biome);
    }
    s.map.forEach((n) => delete n.biome);
    expect(chooseEncounter(s).biome).toBeUndefined();
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
