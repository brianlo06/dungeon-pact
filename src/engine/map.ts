import type { MapNode, RunState } from "../shared/model";
import { pick } from "./rng";
export function generateMap(s: Pick<RunState, "rng">): MapNode[] {
  const layers: MapNode["type"][][] = [
    ["combat"],
    ["auction", "mystery"],
    ["combat", "event"],
    ["elite", "event"],
    ["camp"],
    ["auction", "mystery"],
    ["boss"],
  ];
  const names: Record<MapNode["type"], string[]> = {
    combat: ["The Ash Gate", "Broken Conveyors", "The Crucible"],
    elite: ["Iron Procession", "The Black Kiln"],
    auction: ["The Gilded Exchange"],
    mystery: ["The Veiled Exchange"],
    event: ["A Debt Unpaid", "The Wounded Smith", "The Whispering Well"],
    camp: ["Last Warmth"],
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
          name: pick(s, names[type]),
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
