import type { MapNode } from "../shared/model";
export type BiomeId = NonNullable<MapNode["biome"]>;
export const biomes = {
  foundry: {
    name: "Ember Foundry",
    description: "Furnace crews and hunting packs guard the entry works.",
  },
  cistern: {
    name: "Drowned Cistern",
    description:
      "Flooded pressure halls. Repair crews sustain rifle sentries: pull the support forward or shoot past its guards.",
  },
  archive: {
    name: "Ledger Archive",
    description:
      "An ossuary of unpaid contracts. Toll keepers shield thieves and healers on the way to the Counting House.",
  },
} satisfies Record<BiomeId, { name: string; description: string }>;
export function biomeAtDepth(depth: number): BiomeId {
  return depth < 2 ? "foundry" : depth < 3 ? "cistern" : "archive";
}
export function chamberName(
  biome: BiomeId,
  type: MapNode["type"],
  fallback: string,
): string {
  if (biome === "foundry" || type === "mentor") return fallback;
  const names =
    biome === "cistern"
      ? {
          combat: "The Sunken Pump",
          event: "The Diving Bell",
          elite: "Pressure Wardens",
          camp: "The Dry Lock",
          auction: "The Sluice Exchange",
          mystery: "Salvager’s Counter",
          boss: "The Pressure Vault",
        }
      : {
          combat: "The Index of Debts",
          event: "The Unclaimed Will",
          elite: "The Foreclosure Procession",
          camp: "The Silent Reading Room",
          auction: "The Probate Exchange",
          mystery: "The Clerk’s Counter",
          boss: "The Counting House",
        };
  return names[type];
}
