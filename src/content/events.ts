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
    /** One consumable for each hero; never replaces worn equipment. */
    supply?: string;
    /**
     * One consumable for the whole party, carried by the standing hero with the
     * most health, who is likeliest to be on their feet when it is needed.
     */
    gift?: string;
    cleanse?: boolean;
  }[];
  /** Only offered in a room with boss pools, so older rooms draw as they did. */
  bossVersion?: 1;
}
export const events: EventDef[] = [
  {
    id: "reprieve-office",
    name: "The Reprieve Office",
    bossVersion: 1,
    text: "Behind a grille, a clerk with ink to the elbow keeps one blank writ of reprieve: a life handed back, once, to whoever carries it. The fee is posted. So is the other fee.",
    choices: [
      {
        id: "buy",
        name: "Pay the posted fee",
        description:
          "Pay 150 gold. The party receives one Writ of Reprieve: return a downed ally to the fight with 45 HP.",
        cost: 150,
        heal: 0,
        gold: 0,
        gift: "writ-of-reprieve",
      },
      {
        id: "sign",
        name: "Sign for it in blood",
        description:
          "Each standing hero loses 30 HP, never downing them. The party receives one Writ of Reprieve.",
        cost: 0,
        heal: -30,
        gold: 0,
        gift: "writ-of-reprieve",
      },
      {
        id: "leave",
        name: "Leave the writ blank",
        description: "Nobody signs anything today.",
        cost: 0,
        heal: 0,
        gold: 0,
      },
    ],
  },
  {
    id: "field-hospital",
    name: "The Shift Hospital",
    text: "A brass bell marks the end of a shift nobody survived. The nurse still has clean dressings.",
    choices: [
      {
        id: "pack",
        name: "Pack emergency dressings",
        description:
          "Pay 100 gold. Every hero receives a Field Dressing for later.",
        cost: 100,
        heal: 0,
        gold: 0,
        supply: "field-dressing",
      },
      {
        id: "treat",
        name: "Treat wounds now",
        description:
          "Pay 70 gold. Restore 30 HP to each standing hero and clear the party’s statuses.",
        cost: 70,
        heal: 30,
        gold: 0,
        cleanse: true,
      },
      {
        id: "leave",
        name: "Leave the beds empty",
        description: "Keep your gold.",
        cost: 0,
        heal: 0,
        gold: 0,
      },
    ],
  },
  {
    id: "solvent-vat",
    name: "The Solvent Vat",
    text: "The pipes beneath the foundry carry a solvent strong enough to dissolve a magical shield. The valve wheel is red hot.",
    choices: [
      {
        id: "bottle",
        name: "Bottle the solvent",
        description:
          "Each standing hero loses 10 HP, never downing them. Everyone receives a Solvent Flask.",
        cost: 0,
        heal: -10,
        gold: 0,
        supply: "solvent",
      },
      {
        id: "service",
        name: "Pay the pipe tender",
        description:
          "Pay 100 gold. Everyone receives a Solvent Flask without injury.",
        cost: 100,
        heal: 0,
        gold: 0,
        supply: "solvent",
      },
      {
        id: "leave",
        name: "Close the valve",
        description: "Keep moving.",
        cost: 0,
        heal: 0,
        gold: 0,
      },
    ],
  },
  {
    id: "strike-cache",
    name: "The Strikers’ Cache",
    text: "A union seal guards a box of flashpowder. A note reads: stop the machines before they finish winding up.",
    choices: [
      {
        id: "buy",
        name: "Fund the next strike",
        description:
          "Pay 110 gold. Everyone receives Flashpowder to interrupt a windup.",
        cost: 110,
        heal: 0,
        gold: 0,
        supply: "flashpowder",
      },
      {
        id: "sell",
        name: "Sell the scrap",
        description: "Gain 45 gold. Leave the powder for its owners.",
        cost: 0,
        heal: 0,
        gold: 45,
      },
      {
        id: "leave",
        name: "Respect the seal",
        description: "Keep what you have.",
        cost: 0,
        heal: 0,
        gold: 0,
      },
    ],
  },
  {
    id: "cooling-house",
    name: "The Cooling House",
    text: "For a few minutes, the furnace roar is only a distant heartbeat. Clear water runs over old copper.",
    choices: [
      {
        id: "wash",
        name: "Wash off the ash",
        description:
          "Clear all party statuses. Restore 12 HP to each standing hero.",
        cost: 0,
        heal: 12,
        gold: 0,
        cleanse: true,
      },
      {
        id: "distill",
        name: "Hire the distiller",
        description:
          "Pay 90 gold. Everyone receives a Clear Draught for later.",
        cost: 90,
        heal: 0,
        gold: 0,
        supply: "clear-draught",
      },
    ],
  },
  {
    id: "ward-shrine",
    name: "The Riveted Shrine",
    text: "Workers left their protective charms here before the final shift. The shrine accepts coins, never promises.",
    choices: [
      {
        id: "ward",
        name: "Commission ward-iron",
        description: "Pay 100 gold. Everyone receives a Ward-iron Flask.",
        cost: 100,
        heal: 0,
        gold: 0,
        supply: "ward-iron",
      },
      {
        id: "salvage",
        name: "Lift the offering plate",
        description:
          "Gain 70 gold. Each standing hero loses 10 HP, but cannot be downed.",
        cost: 0,
        heal: -10,
        gold: 70,
      },
      {
        id: "leave",
        name: "Leave a moment of silence",
        description: "Nothing spent. Nothing taken.",
        cost: 0,
        heal: 0,
        gold: 0,
      },
    ],
  },
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
