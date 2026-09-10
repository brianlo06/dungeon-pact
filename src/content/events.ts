export interface EventDef {
  id: string;
  name: string;
  text: string;
  choices: {
    id: string;
    name: string;
    description: string;
    cost: number;
    heal: number;
    gold: number;
  }[];
}
export const events: EventDef[] = [
  {
    id: "smith",
    name: "The Wounded Smith",
    text: "A smith shelters beneath a ruined furnace. “I can pay you. Just keep the fire alive.”",
    choices: [
      {
        id: "aid",
        name: "Buy him medicine",
        description: "Pay 70 gold. He restores 30 HP to every hero.",
        cost: 70,
        heal: 30,
        gold: 0,
      },
      {
        id: "salvage",
        name: "Salvage the furnace",
        description:
          "Gain 90 gold. Everyone loses 12 HP, but cannot be downed.",
        cost: 0,
        heal: -12,
        gold: 90,
      },
      {
        id: "leave",
        name: "Leave quietly",
        description: "Keep what you have.",
        cost: 0,
        heal: 0,
        gold: 0,
      },
    ],
  },
  {
    id: "well",
    name: "The Whispering Well",
    text: "Gold glitters below. Something beneath the surface counts your heartbeats.",
    choices: [
      {
        id: "offering",
        name: "Offer 90 gold",
        description: "The well heals everyone for 40 HP.",
        cost: 90,
        heal: 40,
        gold: 0,
      },
      {
        id: "reach",
        name: "Reach into the dark",
        description:
          "Gain 130 gold. Everyone loses 20 HP, but cannot be downed.",
        cost: 0,
        heal: -20,
        gold: 130,
      },
      {
        id: "leave",
        name: "Ignore the whisper",
        description: "Nothing ventured. Nothing owed.",
        cost: 0,
        heal: 0,
        gold: 0,
      },
    ],
  },
  {
    id: "debt",
    name: "A Debt Unpaid",
    text: "A masked debtor offers you a purse. “Take my payment. Take my pain.”",
    choices: [
      {
        id: "accept",
        name: "Accept the bargain",
        description:
          "Gain 150 gold; everyone loses 25 HP, but cannot be downed.",
        cost: 0,
        heal: -25,
        gold: 150,
      },
      {
        id: "absolve",
        name: "Pay the debt",
        description: "Pay 60 gold; everyone heals 25 HP.",
        cost: 60,
        heal: 25,
        gold: 0,
      },
      {
        id: "leave",
        name: "Walk away",
        description: "His debt is not yours.",
        cost: 0,
        heal: 0,
        gold: 0,
      },
    ],
  },
];
