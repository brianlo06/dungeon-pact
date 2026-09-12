import type { RunState } from "../shared/model";
import { pick } from "../engine/rng";
export interface EncounterDef {
  biome?: "cistern" | "archive";
  id: string;
  name: string;
  minDepth: number;
  /** Explicit formations keep each party size a designed encounter. */
  formations: Record<2 | 3 | 4, string[]>;
}
export const encounters: EncounterDef[] = [
  {
    id: "sluice-sentries",
    name: "Sluice Sentries",
    biome: "cistern",
    minDepth: 2,
    formations: {
      2: ["bulwark", "sniper"],
      3: ["bulwark", "sniper", "mender"],
      4: ["bulwark", "sniper", "mender", "bellows"],
    },
  },
  {
    id: "diving-detail",
    name: "Diving Bell Recovery Crew",
    biome: "cistern",
    minDepth: 2,
    formations: {
      2: ["hound", "mender"],
      3: ["hound", "mender", "sniper"],
      4: ["hound", "bulwark", "mender", "sniper"],
    },
  },
  {
    id: "probate-guard",
    name: "Probate Guard",
    biome: "archive",
    minDepth: 3,
    formations: {
      2: ["bulwark", "thief"],
      3: ["bulwark", "thief", "mender"],
      4: ["bulwark", "thief", "mender", "acolyte"],
    },
  },
  {
    id: "index-hunters",
    name: "Hunters of the Unpaid",
    biome: "archive",
    minDepth: 3,
    formations: {
      2: ["hound", "acolyte"],
      3: ["hound", "thief", "acolyte"],
      4: ["hound", "thief", "acolyte", "sniper"],
    },
  },
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
  const biome = s.map.find((n) => n.id === s.currentNode)?.biome;
  return pick(
    s,
    encounters.filter(
      (e) =>
        e.minDepth <= depth &&
        (biome && biome !== "foundry" ? e.biome === biome : !e.biome),
    ),
  );
}
