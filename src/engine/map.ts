import type { MapNode, RunState } from "../shared/model";
import { pick } from "./rng";
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
    elite: ["Iron Procession", "The Black Kiln"],
    auction: ["The Gilded Exchange"],
    mystery: ["The Veiled Exchange"],
    event: ["A Debt Unpaid", "The Wounded Smith", "The Whispering Well"],
    camp: ["Last Warmth"],
    mentor: ["The Whetstone", "The Reliquary", "The Cipher"],
    boss: ["The Counting House"],
  };
  const nodes = layers.flatMap((layer, depth) =>
    layer.map(
      (type, lane) =>
        ({
          id: `${depth}-${lane}`,
          depth,
          lane,
          type,
          // A mentor node is named for the tier it teaches, not rolled.
          name:
            type === "mentor"
              ? names.mentor[mentorTier(depth) - 1]
              : pick(s, names[type]),
          next: [],
          visited: false,
        }) as MapNode,
    ),
  );
  for (const n of nodes)
    n.next = nodes.filter((x) => x.depth === n.depth + 1).map((x) => x.id);
  return nodes;
}
export function availableNodes(s: RunState) {
  return s.map.filter((n) =>
    s.currentNode
      ? s.map.find((x) => x.id === s.currentNode)!.next.includes(n.id)
      : n.depth === 0,
  );
}
