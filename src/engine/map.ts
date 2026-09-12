import type { MapNode, RunState } from "../shared/model";
import { pick } from "./rng";
import { biomeAtDepth, chamberName } from "../content/biomes";
/** Depth decides which mentor archetype a node holds. */
export function mentorTier(depth: number): 1 | 2 | 3 {
  return depth <= 2 ? 1 : depth <= 4 ? 2 : 3;
}
export function generateMap(s: Pick<RunState, "rng">): MapNode[] {
  // Mentors sit alongside a fight or a rest, so training is always taken
  // instead of something else. Their tiers rise with depth, and a single route
  // cannot reach all three.
  const layers: MapNode["type"][][] = [
    ["combat"],
    ["auction", "mystery"],
    ["combat", "event", "mentor"],
    ["elite", "event"],
    ["camp", "mentor"],
    ["auction", "mystery", "mentor"],
    ["boss"],
  ];
  const names: Record<MapNode["type"], string[]> = {
    combat: ["The Ash Gate", "Broken Conveyors", "The Crucible"],
    elite: ["Iron Procession", "The Black Kiln", "The Slag Court"],
    auction: ["The Gilded Exchange", "The Long Table"],
    mystery: ["The Salvage Counter", "The Shuttered Stall"],
    event: ["A Debt Unpaid", "The Wounded Smith", "The Whispering Well"],
    camp: ["Last Warmth", "The Banked Fire"],
    mentor: ["The Whetstone", "The Reliquary", "The Cipher"],
    boss: ["The Counting House"],
  };
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
  const nodes = layers.flatMap((layer, depth) =>
    layer.map(
      (type, lane) =>
        ({
          id: `${depth}-${lane}`,
          depth,
          lane,
          type,
          biome: biomeAtDepth(depth),
          // A mentor node is named for the tier it teaches, not rolled.
          name:
            type === "mentor"
              ? names.mentor[mentorTier(depth) - 1]
              : chamberName(biomeAtDepth(depth), type, nameFor(type)),
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
