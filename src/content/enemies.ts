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
/** A wax seal's clock while it sets: it hardens, and its intent counts down. */
const waxSetting: Ability = {
  id: "setting",
  name: "Sets in",
  description: "The wax hardens. When it sets, the signature is enforced.",
  cost: 0,
  speed: 0,
  target: "self",
  cooldown: 0,
  effects: [{ kind: "status", status: "barrier", stacks: 3, duration: 1 }],
};
/**
 * The Notary's pressing: wax seals across both rows, each setting on a fuse.
 * A WINDUP, so a party that sees it coming can stop it before any wax lands.
 */
const pressing = (rows: ("front" | "back")[], fuse: number): Ability => ({
  id: "press",
  name: "Press the seals",
  description: "Wax seals are pressed into the chamber. They set, then they are enforced.",
  cost: 0,
  speed: 0,
  target: "self",
  cooldown: 0,
  interruptible: true,
  effects: [{ kind: "spawn", object: "wax-seal", rows, fuse }],
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
    presentation: {
      spriteSet: "stoker",
      footprint: "small",
      theme: "foundry",
      idlePeriod: 3.1,
    },
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
    presentation: {
      spriteSet: "bulwark",
      footprint: "heavy",
      theme: "guard",
      idlePeriod: 4.6,
      shadow: 0.92,
    },
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
    presentation: {
      spriteSet: "acolyte",
      footprint: "person",
      theme: "arcane",
      idlePeriod: 2.9,
    },
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
    presentation: {
      spriteSet: "mender",
      footprint: "person",
      theme: "growth",
      idlePeriod: 3.6,
    },
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
    presentation: {
      spriteSet: "hound",
      footprint: "person",
      theme: "blood",
      idlePeriod: 2.2,
    },
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
    presentation: {
      spriteSet: "sniper",
      footprint: "small",
      theme: "precision",
      idlePeriod: 3.3,
    },
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
    presentation: {
      spriteSet: "thief",
      footprint: "person",
      theme: "contract",
      idlePeriod: 2.6,
    },
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
    presentation: {
      spriteSet: "bellows",
      footprint: "heavy",
      theme: "foundry",
      idlePeriod: 5.2,
    },
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
    presentation: {
      spriteSet: "strongbox",
      footprint: "container",
      theme: "contract",
      idlePeriod: 6.5,
      shadow: 0.95,
    },
    id: "strongbox",
    name: "The Strongbox",
    glyph: "▤",
    hp: 60,
    power: 0,
    guard: 2,
    speed: 1,
    row: "back",
    object: true,
    abilities: [
      {
        id: "seal",
        name: "Seal the lid",
        description: "The lock tightens.",
        cost: 0,
        speed: 0,
        target: "self",
        cooldown: 0,
        effects: [
          { kind: "status", status: "barrier", stacks: 4, duration: 2 },
        ],
      },
    ],
  },
  {
    presentation: {
      spriteSet: "collector",
      footprint: "boss-large",
      theme: "contract",
      idlePeriod: 5.8,
      shadow: 1,
    },
    id: "collector",
    name: "The Collector",
    glyph: "♛",
    hp: 190,
    power: 3,
    guard: 3,
    speed: 4,
    row: "front",
    boss: true,
    epithet: "Keeper of Unpaid Debts",
    lair: "The Collector's Hoard",
    targets: "wealthiest",
    objective:
      "It banks what it takes. Break the Strongbox to get your equipment back — or finish the fight without it.",
    abilities: [
      attack("appraise", "Appraise the wealthy", 22),
      attack("repossess", "Repossess — front row", 15, "enemyRow"),
    ],
  },
  {
    presentation: {
      spriteSet: "miser",
      footprint: "boss-large",
      theme: "contract",
      idlePeriod: 5.4,
      shadow: 1,
    },
    id: "miser",
    name: "The Miser",
    glyph: "♚",
    hp: 175,
    power: 2,
    guard: 4,
    speed: 3,
    row: "front",
    boss: true,
    epithet: "Who Counts What You Kept",
    lair: "The Counting House",
    hoard: { per: 70, legacyPer: 100 },
    objective:
      "It shields itself with whatever gold the pact still holds. A full treasury is armour you gave away.",
    abilities: [
      attack("hoard", "Weight of wealth", 20),
      attack("tax", "Collective taxation", 12, "enemyRow", [
        { kind: "gold", amount: -10 },
      ]),
    ],
  },
  {
    presentation: {
      spriteSet: "wax-seal",
      footprint: "small",
      theme: "contract",
      idlePeriod: 4.2,
      shadow: 0.8,
    },
    id: "wax-seal",
    name: "Wax Seal",
    glyph: "◉",
    hp: 26,
    power: 4,
    guard: 0,
    speed: 1,
    row: "back",
    object: true,
    abilities: [waxSetting],
    // The seal's intent is its clock: it hardens while it sets, then every
    // signature it witnessed is enforced on the party at once.
    clock: {
      waiting: waxSetting,
      due: {
        id: "enforce",
        name: "Enforce the signature",
        description: "Every hero pays what the seal witnessed.",
        cost: 0,
        speed: 0,
        target: "enemy",
        cooldown: 0,
        effects: [{ kind: "enemies", effects: [{ kind: "damage", amount: 8 }] }],
      },
    },
    // Wax cracked before it sets splits back up the hand that pressed it, and
    // a pressing broken whole staggers the Notary: whatever it announced this
    // round is lost (an interrupt would only reach a WINDUP, and nothing it does
    // while seals stand is one), and it is open for two rounds.
    broken: {
      each: [{ kind: "damage", amount: 8, pierce: true }],
      all: [
        { kind: "status", status: "interrupted", stacks: 1, duration: 1 },
        { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
      ],
    },
  },
  {
    presentation: {
      spriteSet: "notary",
      footprint: "boss-large",
      theme: "contract",
      idlePeriod: 6.2,
      shadow: 1,
    },
    id: "notary",
    name: "The Notary",
    glyph: "✒",
    hp: 170,
    power: 3,
    guard: 3,
    speed: 3,
    row: "front",
    boss: true,
    epithet: "Who Witnesses Every Signature",
    lair: "The Sealing Room",
    objective:
      "Its seals set in three rounds, and every one is enforced on the party. Break the wax before it sets — or stop the pressing.",
    abilities: [
      attack("attest", "Attest", 20),
      attack("strike-record", "Strike from the record", 14, "enemyRow"),
    ],
    busy: attack("countersign", "Countersign", 18),
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
/**
 * The Collector's objective. Equipment is taken, not broken: a row loses its
 * best piece to a container the party can choose to open again.
 */
const collateral = attack(
  "repossess",
  "Repossess — the collateral",
  18,
  "enemyRow",
  [{ kind: "seize", count: 1 }],
);
/**
 * The Miser's objective: the treasury the party is still sitting on becomes the
 * armour it has to chew through. A flat shield on top of this was tried and
 * cut — an unconditional wall lengthens the fight, and a longer fight meets the
 * escalation clock, which punished two-hero parties for something they had no
 * way to answer. Scaling purely off gold leaves a party that spent its money
 * exactly where it was, and makes hoarding the expensive way to arrive.
 */
const ledger = attack("hoard", "Weight of wealth", 20, "enemy", [
  { kind: "bank", per: 12, free: 160 },
]);
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
    // The objective rides the row attack the Collector always had. Nothing
    // about the damage changed: the same blow now also takes something.
    collateral,
  ],
  notary: [
    attack("attest", "Attest", 20),
    pressing(["front", "back", "back"], 3),
    attack("strike-record", "Strike from the record", 14, "enemyRow"),
  ],
  miser: [
    // Like the Collector's, the objective rides an attack the Miser already
    // had. Spending a whole slot on it only made the boss hit less often.
    ledger,
    windup(
      attack("levy", "Crushing levy", 25, "enemyRow", [
        { kind: "gold", amount: -10 },
      ]),
    ),
  ],
};
/** Containers are scenery with health: they never count as enemies to clear. */
export const phaseTwoIntents: Record<string, Ability[]> = {
  // Phase two presses a fourth seal and sets them faster.
  notary: [
    attack("attest", "Attest", 22),
    pressing(["front", "front", "back", "back"], 2),
    attack("strike-record", "Strike from the record", 16, "enemyRow"),
  ],
  collector: [
    attack("appraise", "Final notice", 22, "enemy", [
      { kind: "status", status: "marked", stacks: 1, duration: 2 },
    ]),
    windup(
      attack("account", "Enforce the notice", 33, "enemy", [
        {
          kind: "conditional",
          status: "marked",
          effects: [{ kind: "damage", amount: 10, pierce: true }],
        },
      ]),
    ),
    windup(collateral),
  ],
  miser: [
    ledger,
    windup({
      ...attack("levy", "Audit the shielded", 25, "enemyRow"),
      effects: [
        { kind: "removeStatus", status: "barrier" },
        { kind: "damage", amount: 25 },
        { kind: "gold", amount: -10 },
      ],
    }),
  ],
};

export function isObject(definition: string) {
  return !!enemies.find((d) => d.id === definition)?.object;
}
/** Whether a definition is a boss: what the music, the backdrop and the entrance key on. */
export function isBoss(definition: string) {
  return !!enemies.find((d) => d.id === definition)?.boss;
}
export function enemyAbilities(
  definition: EnemyDef,
  combatVersion?: 2,
): Ability[] {
  return combatVersion === 2
    ? (tacticalIntents[definition.id] ?? definition.abilities)
    : definition.abilities;
}
