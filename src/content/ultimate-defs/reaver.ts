import type { UltimateDef } from "../ultimates";

export const ultimate: UltimateDef = {
  id: "red-ledger",
  heroId: "reaver",
  name: "Red Ledger",
  epithet: "Pay in full. Collect in full.",
  description:
    "Lose 14 HP to deal 40 through armour, and tear everything else in the target's row for 12.",
  target: "enemy",
  effects: [
    {
      kind: "damage",
      amount: 14,
      self: true,
    },
    {
      kind: "damage",
      amount: 40,
      pierce: true,
    },
    {
      kind: "enemies",
      row: true,
      others: true,
      effects: [
        {
          kind: "damage",
          amount: 12,
        },
      ],
    },
    {
      kind: "resource",
      amount: 3,
    },
  ],
  cost: 100,
  speed: 8,
  presentation: {
    theme: "blood",
    accent: "#ff4d5e",
  },
};
