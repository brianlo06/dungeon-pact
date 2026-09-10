import type { Ability, EnemyDef } from "../shared/model";
const attack = (
  id: string,
  name: string,
  amount: number,
  target: Ability["target"] = "enemy",
  effects: Ability["effects"] = [],
): Ability => ({
  id,
  name,
  description: name,
  cost: 0,
  speed: 0,
  target,
  cooldown: 0,
  effects: [{ kind: "damage", amount }, ...effects],
});
const mend: Ability = {
  id: "repair",
  name: "Repair lattice",
  description: "Restore an ally.",
  cost: 0,
  speed: 0,
  target: "ally",
  cooldown: 0,
  effects: [{ kind: "heal", amount: 18 }],
};
export const enemies: EnemyDef[] = [
  {
    id: "stoker",
    name: "Cinder Stoker",
    glyph: "♟",
    hp: 42,
    power: 0,
    guard: 1,
    speed: 3,
    row: "front",
    abilities: [attack("tongs", "Branding tongs", 12)],
  },
  {
    id: "bulwark",
    name: "Iron Bulwark",
    glyph: "▣",
    hp: 65,
    power: 0,
    guard: 5,
    speed: 2,
    row: "front",
    abilities: [attack("ram", "Shield ram", 15)],
  },
  {
    id: "acolyte",
    name: "Ash Acolyte",
    glyph: "♝",
    hp: 35,
    power: 0,
    guard: 0,
    speed: 5,
    row: "back",
    abilities: [
      attack("ember", "Ember bolt", 16, "enemy", [
        { kind: "status", status: "burn", stacks: 3, duration: 2 },
      ]),
    ],
  },
  {
    id: "mender",
    name: "Kiln Mender",
    glyph: "✣",
    hp: 38,
    power: 0,
    guard: 1,
    speed: 4,
    row: "back",
    abilities: [mend, attack("wrench", "Wrench", 9)],
  },
  {
    id: "hound",
    name: "Slag Hound",
    glyph: "♞",
    hp: 39,
    power: 1,
    guard: 0,
    speed: 9,
    row: "front",
    abilities: [attack("bite", "Searing bite", 13)],
  },
  {
    id: "sniper",
    name: "Rivet Sniper",
    glyph: "⌖",
    hp: 34,
    power: 1,
    guard: 1,
    speed: 6,
    row: "back",
    abilities: [attack("rivet", "Back-row rivet", 18)],
  },
  {
    id: "thief",
    name: "Coin Leech",
    glyph: "◈",
    hp: 40,
    power: 0,
    guard: 1,
    speed: 7,
    row: "front",
    abilities: [
      attack("tithe", "Treasury tithe", 10, "enemy", [
        { kind: "gold", amount: -15 },
      ]),
    ],
  },
  {
    id: "bellows",
    name: "Living Bellows",
    glyph: "♜",
    hp: 53,
    power: 0,
    guard: 2,
    speed: 2,
    row: "back",
    abilities: [attack("exhale", "Scorching exhale", 9, "enemyRow")],
  },
  {
    id: "collector",
    name: "The Collector",
    glyph: "♛",
    hp: 190,
    power: 3,
    guard: 3,
    speed: 4,
    row: "front",
    boss: true,
    abilities: [
      attack("appraise", "Appraise the wealthy", 22),
      attack("repossess", "Repossess — front row", 15, "enemyRow"),
    ],
  },
  {
    id: "miser",
    name: "The Miser",
    glyph: "♚",
    hp: 175,
    power: 2,
    guard: 4,
    speed: 3,
    row: "front",
    boss: true,
    abilities: [
      attack("hoard", "Weight of wealth", 20),
      attack("tax", "Collective taxation", 12, "enemyRow", [
        { kind: "gold", amount: -10 },
      ]),
    ],
  },
];

/** Versioned tactical intent rotations. Existing rooms retain their legacy definitions. */
const windup = (ability: Ability): Ability => ({
  ...ability,
  interruptible: true,
});
const fortify = (id: string, name: string, amount: number): Ability => ({
  id,
  name,
  description: name,
  target: "self",
  effects: [{ kind: "status", status: "barrier", stacks: amount, duration: 2 }],
  cost: 0,
  speed: 0,
  cooldown: 0,
});
export const tacticalIntents: Record<string, Ability[]> = {
  stoker: [
    attack("tongs", "Branding tongs", 12),
    attack("hammer", "Heavy hammer", 22),
  ],
  bulwark: [
    fortify("brace", "Lock shields", 16),
    attack("ram", "Shield ram", 22),
  ],
  acolyte: [
    attack("ember", "Ember bolt", 10),
    windup(
      attack("eruption", "Cinder eruption", 20, "enemyRow", [
        { kind: "status", status: "burn", stacks: 3, duration: 2 },
      ]),
    ),
  ],
  mender: [windup(mend), attack("wrench", "Wrench", 12)],
  hound: [
    {
      ...attack("bite", "Double bite", 7),
      effects: [
        { kind: "damage", amount: 7 },
        { kind: "damage", amount: 7 },
      ],
    },
    attack("pounce", "Pounce", 22),
  ],
  sniper: [
    fortify("aim", "Take aim", 6),
    windup(attack("killshot", "Kill shot", 34)),
  ],
  bellows: [
    fortify("inhale", "Draw breath", 8),
    windup(attack("blast", "Furnace blast", 24, "enemyRow")),
  ],
  collector: [
    attack("appraise", "Appraise the wealthy", 22),
    windup(attack("account", "Close the account", 40)),
    attack("repossess", "Repossess — front row", 18, "enemyRow"),
  ],
  miser: [
    attack("hoard", "Weight of wealth", 20),
    windup(
      attack("levy", "Crushing levy", 25, "enemyRow", [
        { kind: "gold", amount: -10 },
      ]),
    ),
  ],
};
export function enemyAbilities(
  definition: EnemyDef,
  combatVersion?: 2,
): Ability[] {
  return combatVersion === 2
    ? (tacticalIntents[definition.id] ?? definition.abilities)
    : definition.abilities;
}
