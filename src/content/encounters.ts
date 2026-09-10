import type { RunState } from "../shared/model";
import { pick } from "../engine/rng";
export interface EncounterDef {
  id: string;
  name: string;
  minDepth: number;
  /** Explicit formations keep each party size a designed encounter. */
  formations: Record<2 | 3 | 4, string[]>;
}
export const encounters: EncounterDef[] = [
  {
    id: "furnace-watch",
    name: "Furnace Watch",
    minDepth: 0,
    formations: {
      2: ["bulwark", "acolyte"],
      3: ["bulwark", "acolyte", "stoker"],
      4: ["bulwark", "acolyte", "stoker", "sniper"],
    },
  },
  {
    id: "hunting-pack",
    name: "Rivet Hunting Party",
    minDepth: 0,
    formations: {
      2: ["hound", "sniper"],
      3: ["hound", "sniper", "stoker"],
      4: ["hound", "sniper", "stoker", "acolyte"],
    },
  },
  {
    id: "smoke-line",
    name: "Smoke Line",
    minDepth: 0,
    formations: {
      2: ["stoker", "bellows"],
      3: ["stoker", "bellows", "acolyte"],
      4: ["bulwark", "bellows", "acolyte", "hound"],
    },
  },
  {
    id: "repair-detail",
    name: "The Repair Detail",
    minDepth: 2,
    formations: {
      2: ["bulwark", "mender"],
      3: ["bulwark", "mender", "sniper"],
      4: ["bulwark", "mender", "sniper", "acolyte"],
    },
  },
  {
    id: "toll-collectors",
    name: "Foundry Toll Collectors",
    minDepth: 2,
    formations: {
      2: ["thief", "hound"],
      3: ["thief", "bulwark", "sniper"],
      4: ["thief", "bulwark", "sniper", "mender"],
    },
  },
];
export function chooseEncounter(s: RunState): EncounterDef {
  const depth = s.map.find((n) => n.id === s.currentNode)?.depth ?? 0;
  return pick(
    s,
    encounters.filter((e) => e.minDepth <= depth),
  );
}
