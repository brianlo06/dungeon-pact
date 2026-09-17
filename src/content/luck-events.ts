import type { EventDef } from "./events";

/**
 * Chance events, after the ones in Slay the Spire that people remember: the
 * Wheel of Change, the Dead Adventurer, the Scrap Ooze and the Joust.
 *
 * What makes those work, and what these copy:
 *
 * - **The odds are on the table.** A party votes, so the argument is the fun
 *   part, and nobody can argue about a number they cannot see. Every chance
 *   choice prints its percentages before anyone commits.
 * - **Bad outcomes are real but survivable.** Health losses never down a hero,
 *   and a fight is the worst any roll can do.
 * - **Pressing your luck is a series of small votes**, not one big one. The
 *   surveyor and the chute ask again after every try, with the next odds.
 * - **Safe is always an option.** Every event can be walked away from.
 *
 * Prices are set against the rest of the economy: a fight pays 110 gold, a
 * team relic costs 180 and a round of supplies about 100.
 */
export const luckEvents: EventDef[] = [
  {
    id: "pay-wheel",
    name: "The Paymaster’s Wheel",
    luck: true,
    text: "A painted wheel is bolted to the pay office wall. Every shift, one worker spins it for the whole crew, and the crew lives with it.",
    choices: [
      {
        id: "spin",
        name: "Spin the wheel",
        description: "Free. Six equal slices: four good, two bad.",
        cost: 0,
        roll: [
          {
            id: "payday",
            label: "Payday",
            text: "The bell rings twice. Back wages pour out of the chute.",
            weight: 1,
            tone: "good",
            gold: 120,
          },
          {
            id: "day-off",
            label: "Day off",
            text: "A full shift of rest, stamped and approved. Everyone is patched up and clean.",
            weight: 1,
            tone: "good",
            healShare: 1,
            cleanse: true,
          },
          {
            id: "hazard-pay",
            label: "Hazard pay",
            text: "The office pays in kind: a Ward-iron Flask for every hero.",
            weight: 1,
            tone: "good",
            supply: "ward-iron",
          },
          {
            id: "promotion",
            label: "Promotion",
            text: "One of you is made foreman on the spot, and stands a little taller for it.",
            weight: 1,
            tone: "good",
            power: 2,
          },
          {
            id: "accident",
            label: "Accident",
            text: "The wheel sticks, then kicks. Everyone takes a knock on the way out.",
            weight: 1,
            tone: "bad",
            healShare: -0.15,
          },
          {
            id: "docked",
            label: "Docked pay",
            text: "A fine for loitering, collected from the party purse.",
            weight: 1,
            tone: "bad",
            gold: -90,
          },
        ],
      },
      {
        id: "leave",
        name: "Walk past the wheel",
        description: "Nothing won. Nothing docked.",
        cost: 0,
      },
    ],
  },
  {
    id: "buried-surveyor",
    name: "The Buried Surveyor",
    luck: true,
    text: "A surveyor lies half-buried under slag, his satchel still strapped on. The rubble around him is scored with claw marks, and it is still warm.",
    press: {
      kind: "search",
      chances: [25, 50, 75],
      loot: [
        {
          id: "wages",
          label: "His wages",
          text: "A purse of back pay, sewn into the lining.",
          weight: 1,
          tone: "good",
          gold: 90,
        },
        {
          id: "kit",
          label: "Medical kit",
          text: "Field Dressings, enough for everyone.",
          weight: 1,
          tone: "good",
          supply: "field-dressing",
        },
        {
          id: "instrument",
          label: "A strange instrument",
          text: "A surveyor’s relic, still humming. The whole party can use it.",
          weight: 1,
          tone: "good",
          relic: true,
          gold: 150,
        },
      ],
      bust: {
        id: "ambush",
        label: "It comes back",
        text: "The rubble shifts. Whatever buried him wants the rest of you too.",
        weight: 1,
        tone: "bad",
        fight: "elite",
      },
    },
    choices: [
      {
        id: "search",
        name: "Search the body",
        description:
          "Each search finds something. Each one risks the thing that buried him coming back: an elite fight.",
        cost: 0,
        press: true,
      },
      {
        id: "leave",
        name: "Leave him be",
        description: "Whatever did this is not your business.",
        cost: 0,
      },
    ],
  },
  {
    id: "slag-chute",
    name: "The Slag Chute",
    luck: true,
    text: "A sorting chute is clogged with cooling slag. Something metal glints deep inside it, past a great deal of things that burn.",
    press: {
      kind: "dig",
      chances: [25, 35, 45, 55, 65, 75, 85, 95, 100],
      hurt: [5, 6, 7, 8, 9, 10, 11, 12, 13],
      prize: {
        id: "strongbox",
        label: "Paymaster’s strongbox",
        text: "Your fingers close on a handle. It is a strongbox full of wages nobody collected.",
        weight: 1,
        tone: "good",
        gold: 170,
      },
    },
    choices: [
      {
        id: "reach",
        name: "Reach into the slag",
        description:
          "Every standing hero is burned for each try, a little more each time. The odds of finding it climb with every try.",
        cost: 0,
        press: true,
      },
      {
        id: "leave",
        name: "Leave it glinting",
        description: "Keep your hands.",
        cost: 0,
      },
    ],
  },
  {
    id: "automaton-duel",
    name: "The Automaton Duel",
    luck: true,
    text: "Two retired foundry automatons still fight for the night shift’s bets. The bookie takes gold from anyone with a pulse.",
    choices: [
      {
        id: "favourite",
        name: "Back the Old Riveter",
        description: "Pay 60 gold. The favourite.",
        cost: 60,
        roll: [
          {
            id: "win",
            label: "Riveter wins",
            text: "The Old Riveter grinds its rival into the floor. The bookie pays out 130 gold.",
            weight: 70,
            tone: "good",
            gold: 130,
          },
          {
            id: "lose",
            label: "Upset",
            text: "A lucky swing, a shower of sparks, and your 60 gold belongs to someone else.",
            weight: 30,
            tone: "bad",
          },
        ],
      },
      {
        id: "longshot",
        name: "Back the Scrap Heap",
        description: "Pay 60 gold. Nobody expects it to win.",
        cost: 60,
        roll: [
          {
            id: "win",
            label: "Scrap Heap wins",
            text: "The crowd goes silent, then wild. The bookie counts out 300 gold with shaking hands.",
            weight: 30,
            tone: "good",
            gold: 300,
          },
          {
            id: "lose",
            label: "As expected",
            text: "The Scrap Heap comes apart in the first exchange. So does your 60 gold.",
            weight: 70,
            tone: "bad",
          },
        ],
      },
      {
        id: "leave",
        name: "Keep your gold",
        description: "Watch the fight for free.",
        cost: 0,
      },
    ],
  },
  {
    id: "warm-strongbox",
    name: "The Warm Strongbox",
    luck: true,
    text: "A strongbox sits alone on a loading dock, stamped PROPERTY OF THE COLLECTOR. Its lock is warm to the touch. Probably from the furnaces.",
    choices: [
      {
        id: "pry",
        name: "Pry it open",
        description: "It is probably just a box.",
        cost: 0,
        roll: [
          {
            id: "treasure",
            label: "Just a box",
            text: "Gold, and a Solvent Flask for everyone, packed in straw.",
            weight: 60,
            tone: "good",
            gold: 110,
            supply: "solvent",
          },
          {
            id: "mimic",
            label: "Not a box",
            text: "The lid opens by itself. It has teeth, and it has friends.",
            weight: 40,
            tone: "bad",
            fight: "combat",
          },
        ],
      },
      {
        id: "leave",
        name: "Leave it on the dock",
        description: "The Collector can keep it.",
        cost: 0,
      },
    ],
  },
  {
    id: "loaded-dice",
    name: "The Loaded Dice",
    luck: true,
    text: "Off-shift workers dice for each other’s ration of vitality. They will deal you in, one hero at a time.",
    choices: [
      {
        id: "roll",
        name: "Everyone rolls",
        description: "Free. Each hero rolls for themselves.",
        cost: 0,
        each: [
          {
            id: "win",
            label: "Wins",
            text: "+8 maximum HP, for the rest of the run.",
            weight: 50,
            tone: "good",
            maxHp: 8,
          },
          {
            id: "lose",
            label: "Loses",
            text: "Pays in blood: −10 HP now.",
            weight: 50,
            tone: "bad",
            heal: -10,
          },
        ],
      },
      {
        id: "rigged",
        name: "Pay the dealer to load them",
        description: "Pay 80 gold. Each hero still rolls, with better odds.",
        cost: 80,
        each: [
          {
            id: "win",
            label: "Wins",
            text: "+8 maximum HP, for the rest of the run.",
            weight: 75,
            tone: "good",
            maxHp: 8,
          },
          {
            id: "lose",
            label: "Loses",
            text: "Pays in blood: −10 HP now.",
            weight: 25,
            tone: "bad",
            heal: -10,
          },
        ],
      },
      {
        id: "leave",
        name: "Keep your blood",
        description: "Not tonight.",
        cost: 0,
      },
    ],
  },
];
