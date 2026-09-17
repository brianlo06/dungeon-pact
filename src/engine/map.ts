import type { MapNode, RunState } from "../shared/model";
import { pick } from "./rng";
import { biomeAtDepth, chamberName } from "../content/biomes";
import { floorDef } from "../content/floors";
import { enemies } from "../content/enemies";

export {
  FLOORS,
  FLOOR_DEPTH,
  LEGACY_FLOORS,
  floorsIn,
  runDepth,
} from "../content/floors";

/** Depth decides which mentor archetype a node holds. */
export function mentorTier(depth: number): 1 | 2 | 3 {
  return depth <= 2 ? 1 : depth <= 4 ? 2 : 3;
}

/**
 * Which mentor tier a training chamber teaches.
 *
 * A floor holds one mentor, so a run meets two — and there are three. Rising
 * tiers by depth alone would put the same two in every run and leave the third
 * unreachable forever. So the first floor teaches the Whetstone, and the second
 * draws the Reliquary or the Cipher when it is built: tiers still rise down the
 * run, every mentor can be met, and which master a run was offered is part of
 * what made that run different.
 */
export function nodeMentorTier(
  s: Pick<RunState, "floor">,
  node: Pick<MapNode, "depth" | "tier">,
): 1 | 2 | 3 {
  return node.tier ?? mentorTier(node.depth);
}

/**
 * The biome a chamber sits in. With boss pools every floor is one region end
 * to end: the Foundry, the Cistern, the Archive. Before them floor one was the
 * Foundry and floor two opened in the Cistern and closed in the Archive, where
 * the Miser keeps his vault. A legacy single-floor run keeps the old depth
 * bands.
 */
export function floorBiome(
  s: Pick<RunState, "floor" | "bossVersion">,
  depth: number,
) {
  if (s.floor === undefined) return biomeAtDepth(depth);
  if (s.bossVersion === 1) return floorDef(s).biome;
  if (s.floor <= 1) return "foundry" as const;
  return depth < 3 ? ("cistern" as const) : ("archive" as const);
}

export function generateMap(
  s: Pick<RunState, "rng" | "floor" | "bossVersion">,
): MapNode[] {
  // Mentors sit alongside a fight or a rest, so training is always taken
  // instead of something else. Their tiers rise with depth, and a single route
  // cannot reach all three.
  const legacy: MapNode["type"][][] = [
    ["combat"],
    ["auction", "mystery"],
    ["combat", "event", "mentor"],
    ["elite", "event"],
    ["camp", "mentor"],
    ["auction", "mystery", "mentor"],
    ["boss"],
  ];
  // A floor is shorter, and the chamber before its boss is always a rest: a
  // party should reach each boss having been offered the chance to recover,
  // not by the luck of which lane it took.
  // The floor's middle is drawn, not fixed, so the four newer chambers turn
  // up without making a floor any longer. Each lane offers a different kind of
  // room from its neighbours, and a floor still always holds a shop, a
  // mentor, a rest and its boss.
  const other = <T extends MapNode["type"]>(
    pool: T[],
    taken: MapNode["type"],
  ) =>
    pick(
      s,
      pool.filter((x) => x !== taken),
    );
  const floor = (): MapNode["type"][][] => {
    const shop = pick(s, ["auction", "mystery"] as const);
    const fight = pick(s, ["elite", "hazard"] as const);
    return [
      ["combat"],
      [shop, other(["mystery", "forge", "toll"] as const, shop)],
      ["combat", pick(s, ["hazard", "event"] as const), "mentor"],
      [fight, other(["event", "shrine", "toll"] as const, fight)],
      ["camp"],
      ["boss"],
    ];
  };
  const layers = s.floor === undefined ? legacy : floor();
  const names: Record<MapNode["type"], string[]> = {
    combat: ["The Ash Gate", "Broken Conveyors", "The Crucible"],
    elite: ["Iron Procession", "The Black Kiln", "The Slag Court"],
    auction: ["The Gilded Exchange", "The Long Table"],
    mystery: ["The Salvage Counter", "The Shuttered Stall"],
    event: ["A Debt Unpaid", "The Wounded Smith", "The Whispering Well"],
    camp: ["Last Warmth", "The Banked Fire"],
    mentor: ["The Whetstone", "The Reliquary", "The Cipher"],
    boss: ["The Counting House"],
    toll: ["The Ash Toll", "The Keepers' Gate"],
    hazard: ["The Vent Works", "The Slag Chute"],
    shrine: ["The Banked Altar", "The Cinder Shrine"],
    forge: ["The Reforge", "The Anvil Room"],
  };
  // Drawn once per floor, before any node is named, so a floor's mentor is
  // settled the moment its route exists. With boss pools a run has a floor
  // for each mentor, so each teaches on its own floor and none is left out.
  const floorTier: 1 | 2 | 3 | undefined =
    s.floor === undefined
      ? undefined
      : s.bossVersion === 1
        ? floorDef(s).tier
        : s.floor <= 1
          ? 1
          : pick(s, [2, 3] as const);
  // The floor's boss, drawn after its mentor so an older room's draws are
  // untouched, and before any chamber is named.
  const floorBoss =
    s.bossVersion === 1 && s.floor !== undefined
      ? pick(s, floorDef(s).bosses)
      : undefined;
  const bossRoom =
    floorBoss !== undefined
      ? (enemies.find((d) => d.id === floorBoss)?.lair ?? names.boss[0])
      : s.floor === 1
        ? "The Collector's Hoard"
        : "The Counting House";
  // Two chambers on one route sharing a name reads as a bug. Draw from the
  // pool without replacement while it lasts.
  const used: Record<string, string[]> = {};
  const nameFor = (type: MapNode["type"]) => {
    const pool = names[type];
    const taken = (used[type] ??= []);
    const free = pool.filter((n) => !taken.includes(n));
    const choice = pick(s, free.length ? free : pool);
    taken.push(choice);
    return choice;
  };
  // A region names each kind of chamber once. A floor can hold two of a kind in
  // the same region — two fights in the Cistern — and the second would repeat
  // the first's name, so it takes one from the general pool instead.
  const named = new Set<string>();
  const regional = (
    biome: ReturnType<typeof floorBiome>,
    type: MapNode["type"],
  ) => {
    const rolled = nameFor(type);
    const local = chamberName(biome, type, rolled);
    const name = named.has(local) ? rolled : local;
    named.add(name);
    return name;
  };
  const nodes = layers.flatMap((layer, depth) =>
    layer.map(
      (type, lane) =>
        ({
          id: `${depth}-${lane}`,
          depth,
          lane,
          type,
          biome: floorBiome(s, depth),
          ...(type === "mentor" && floorTier ? { tier: floorTier } : {}),
          ...(type === "boss" && floorBoss ? { boss: floorBoss } : {}),
          // A mentor node is named for the tier it teaches, not rolled.
          name:
            type === "boss" && s.floor !== undefined
              ? bossRoom
              : type === "mentor"
                ? names.mentor[(floorTier ?? mentorTier(depth)) - 1]
                : regional(floorBiome(s, depth), type),
          next: [],
          visited: false,
        }) as MapNode,
    ),
  );
  // Every node used to lead to every node on the next layer, which meant route
  // choice never constrained anything and the map drew as a solid mesh. Each
  // node now feeds an interval of the next layer instead: adjacent lanes only,
  // every node reachable, no crossed links, and taking the left path really
  // does close off the right.
  for (const n of nodes) {
    const row = nodes.filter((x) => x.depth === n.depth);
    const below = nodes.filter((x) => x.depth === n.depth + 1);
    if (!below.length) continue;
    const from = Math.floor((n.lane * below.length) / row.length);
    const to = Math.ceil(((n.lane + 1) * below.length) / row.length) - 1;
    n.next = below.slice(from, to + 1).map((x) => x.id);
  }
  return nodes;
}
export function availableNodes(s: RunState) {
  return s.map.filter((n) =>
    s.currentNode
      ? s.map.find((x) => x.id === s.currentNode)!.next.includes(n.id)
      : n.depth === 0,
  );
}
