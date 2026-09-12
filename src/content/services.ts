export const services = [
  {
    id: "dressings",
    name: "Dressings for the party",
    price: 100,
    description:
      "Each hero receives one Field Dressing. Supplies are consumed when used.",
    supply: "field-dressing",
  },
  {
    id: "solvents",
    name: "Shield-breaking kit",
    price: 120,
    description: "Each hero receives one Solvent Flask.",
    supply: "solvent",
  },
  {
    id: "treatment",
    name: "Roadside treatment",
    price: 90,
    description:
      "Restore 25 HP to every standing hero. Does not revive fallen heroes.",
    heal: 25,
  },
  {
    id: "pact-lantern",
    name: "Pact Lantern · team relic",
    price: 180,
    description:
      "Once per battle, the whole party starts with 6 Barrier. One per pact.",
    relic: "pact-lantern",
  },
  {
    id: "ration-engine",
    name: "Ration Engine · team relic",
    price: 180,
    description:
      "At the start of each battle, restore 6 HP to every standing hero. One per pact.",
    relic: "ration-engine",
  },
] as const;
