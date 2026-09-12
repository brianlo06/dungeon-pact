import type { Ability, HeroDef } from "../shared/model";
import { chosenUpgrades } from "./upgrades";
import { evolution } from "./evolutions";
import { items } from "./items";
const actionReach: Record<string, Ability["reach"]> = {
  bash: "melee",
  slam: "melee",
  rend: "melee",
  bloodprice: "melee",
  frenzy: "melee",
  grapple: "reach",
  thorn: "reach",
};
const a = (
  id: string,
  name: string,
  description: string,
  target: Ability["target"],
  effects: Ability["effects"],
  cost = 0,
  speed = 0,
  cooldown = 0,
): Ability => ({
  id,
  reach:
    target === "enemy" || target === "enemyRow"
      ? (actionReach[id] ?? "ranged")
      : undefined,
  name,
  description,
  target,
  effects,
  cost,
  speed,
  cooldown,
});
export const utility: Ability[] = [
  // Every class can steady itself. Without this, scarce healing made the one
  // healer more valuable rather than less, because nobody else had a substitute
  // at all. It still costs the whole action, so defending stays a real choice.
  a(
    "brace",
    "Brace",
    "Gain 14 Barrier, heal 8 and recover 2 resource.",
    "self",
    [
      { kind: "status", status: "barrier", stacks: 14, duration: 2 },
      { kind: "heal", amount: 8, self: true },
      { kind: "resource", amount: 2 },
    ],
    0,
    10,
  ),
  a(
    "advance",
    "Take the front",
    "Move to the front and gain 10 Barrier.",
    "self",
    [
      { kind: "move", row: "front" },
      { kind: "status", status: "barrier", stacks: 10, duration: 2 },
    ],
    0,
    12,
  ),
  a(
    "retreat",
    "Fall back",
    "Move to the back row.",
    "self",
    [{ kind: "move", row: "back" }],
    0,
    12,
  ),
  a(
    "revive",
    "Pact revival",
    "Spend 90 team gold to return an ally at 30 HP.",
    "ally",
    [
      { kind: "gold", amount: -90 },
      { kind: "heal", amount: 30 },
    ],
    0,
    6,
  ),
];
export const heroes: HeroDef[] = [
  {
    presentation: { spriteSet: "vanguard", theme: "guard", idlePeriod: 4.2 },
    id: "vanguard",
    name: "Vanguard",
    title: "Stand between fate and your friends.",
    description:
      "Resolve fuels protection. Fast shields buy time for slower spells.",
    glyph: "⛨",
    hp: 115,
    power: 3,
    guard: 4,
    speed: 4,
    resource: "Resolve",
    maxResource: 6,
    abilities: [
      a("bash", "Shieldbreaker", "Strike for 15. Gain 1 Resolve.", "enemy", [
        { kind: "damage", amount: 15 },
        { kind: "resource", amount: 1 },
      ]),
      a(
        "intercept",
        "Iron oath",
        "Give an ally 28 Barrier.",
        "ally",
        [{ kind: "status", status: "barrier", stacks: 28, duration: 2 }],
        2,
        15,
        1,
      ),
      a(
        "slam",
        "Foundry slam",
        "Hit an enemy row for 19 and expose them.",
        "enemyRow",
        [
          { kind: "damage", amount: 19 },
          { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
        ],
        3,
        -2,
        1,
      ),
    ],
  },
  {
    presentation: {
      spriteSet: "arcanist",
      theme: "arcane",
      idlePeriod: 3.2,
    },
    id: "arcanist",
    name: "Arcanist",
    title: "Power is a debt worth taking.",
    description:
      "Prime with water, then unleash lightning. Recover Mana by bracing.",
    glyph: "✧",
    hp: 75,
    power: 5,
    guard: 1,
    speed: 5,
    resource: "Mana",
    maxResource: 8,
    abilities: [
      a("spark", "Arcane spark", "Strike for 15. Recover 1 Mana.", "enemy", [
        { kind: "damage", amount: 15, damageType: "arcane" },
        { kind: "resource", amount: 1 },
      ]),
      a(
        "rain",
        "Cloudburst",
        "Soak a row with Wet; enables Chain Shock.",
        "enemyRow",
        [{ kind: "status", status: "wet", stacks: 1, duration: 3 }],
        2,
        8,
      ),
      a(
        "storm",
        "Storm needle",
        "Lightning deals 25. Wet triggers Chain Shock.",
        "enemy",
        [{ kind: "damage", amount: 25, damageType: "lightning" }],
        3,
        0,
      ),
      a(
        "fire",
        "Cinder bloom",
        "Deal 12 Fire to a row and apply Burn.",
        "enemyRow",
        [
          { kind: "damage", amount: 12, damageType: "fire" },
          { kind: "status", status: "burn", stacks: 4, duration: 3 },
        ],
        3,
        -1,
        1,
      ),
    ],
  },
  {
    presentation: {
      spriteSet: "ranger",
      theme: "precision",
      idlePeriod: 2.9,
    },
    id: "ranger",
    name: "Ranger",
    title: "One mark. A hundred possibilities.",
    description:
      "Fast marks amplify precision strikes. Choose priority targets together.",
    glyph: "⌁",
    hp: 88,
    power: 4,
    guard: 2,
    speed: 8,
    resource: "Focus",
    maxResource: 6,
    abilities: [
      a(
        "arrow",
        "True shot",
        "Precision strike for 17. Gain 1 Focus.",
        "enemy",
        [
          { kind: "damage", amount: 17, precision: true },
          { kind: "resource", amount: 1 },
        ],
      ),
      a(
        "mark",
        "Quarry sign",
        "Mark a target, enabling Exploit.",
        "enemy",
        [
          { kind: "status", status: "marked", stacks: 1, duration: 3 },
          { kind: "resource", amount: 1 },
        ],
        0,
        15,
      ),
      a(
        "volley",
        "Split the sky",
        "Precision attacks strike an entire row.",
        "enemyRow",
        [{ kind: "damage", amount: 18, precision: true }],
        3,
        -1,
        1,
      ),
    ],
  },
  {
    presentation: {
      spriteSet: "warden",
      theme: "growth",
      idlePeriod: 3.8,
    },
    id: "warden",
    name: "Warden",
    title: "Nothing living is beyond hope.",
    description:
      "Growth heals and sustains. Water binds your magic to the Arcanist.",
    glyph: "❋",
    hp: 94,
    power: 2,
    guard: 2,
    speed: 6,
    resource: "Growth",
    maxResource: 7,
    abilities: [
      a("thorn", "Thorn lash", "Deal 14. Gain 1 Growth.", "enemy", [
        { kind: "damage", amount: 14 },
        { kind: "resource", amount: 1 },
      ]),
      // Mend had no cooldown, so a Warden healed every single round and
      // sustain compositions were simply not killable. It now heals harder but
      // leaves a gap the party has to survive.
      a(
        "mend",
        "Mending roots",
        "Restore 32 HP and apply Regeneration. Once every other round.",
        "ally",
        [
          { kind: "heal", amount: 32 },
          { kind: "status", status: "regen", stacks: 4, duration: 3 },
        ],
        2,
        3,
        1,
      ),
      a(
        "dew",
        "Drowning vine",
        "Deal 9 and apply Wet. Gain 1 Growth.",
        "enemy",
        [
          { kind: "damage", amount: 9 },
          { kind: "status", status: "wet", stacks: 1, duration: 3 },
          { kind: "resource", amount: 1 },
        ],
        0,
        9,
      ),
      a(
        "briar",
        "Briar prison",
        "Poison a row for 5 per round.",
        "enemyRow",
        [{ kind: "status", status: "poison", stacks: 5, duration: 3 }],
        3,
        2,
        1,
      ),
    ],
  },
  {
    presentation: {
      spriteSet: "broker",
      theme: "contract",
      idlePeriod: 3.3,
    },
    id: "broker",
    name: "Broker",
    title: "Everything has a price. Including this.",
    description:
      "Turns the treasury into force. Earns gold by fighting, spends it to hit harder.",
    glyph: "◈",
    hp: 90,
    power: 3,
    guard: 2,
    speed: 5,
    resource: "Credit",
    maxResource: 6,
    abilities: [
      a("appraise", "Appraise", "Deal 14 and earn 10 team gold.", "enemy", [
        { kind: "damage", amount: 14 },
        { kind: "gold", amount: 10 },
        { kind: "resource", amount: 1 },
      ]),
      a(
        "invest",
        "Leveraged strike",
        "Spend 50 team gold to deal 34.",
        "enemy",
        [
          { kind: "gold", amount: -50 },
          { kind: "damage", amount: 34 },
        ],
        2,
        0,
        1,
      ),
      a(
        "insure",
        "Underwrite",
        "Spend 40 team gold to give an ally 26 Barrier.",
        "ally",
        [
          { kind: "gold", amount: -40 },
          { kind: "status", status: "barrier", stacks: 26, duration: 2 },
        ],
        2,
        14,
        1,
      ),
    ],
  },
  {
    presentation: {
      spriteSet: "herald",
      theme: "resonance",
      idlePeriod: 3.0,
    },
    id: "herald",
    name: "Herald",
    title: "You are worth more than you think.",
    description:
      "Makes the rest of the party hit harder and shrugs off what the dungeon inflicts.",
    glyph: "❧",
    hp: 85,
    power: 3,
    guard: 2,
    speed: 7,
    resource: "Verse",
    maxResource: 7,
    abilities: [
      a("rally", "Rallying note", "Deal 15. Gain 1 Verse.", "enemy", [
        { kind: "damage", amount: 15 },
        { kind: "resource", amount: 1 },
      ]),
      a(
        "anthem",
        "Battle anthem",
        "You and an ally deal 30% more direct damage for two rounds.",
        "ally",
        [
          { kind: "status", status: "empowered", stacks: 1, duration: 3 },
          {
            kind: "status",
            status: "empowered",
            stacks: 1,
            duration: 3,
            self: true,
          },
        ],
        2,
        16,
        1,
      ),
      a(
        "cadence",
        "Closing cadence",
        "Give an entire allied row 16 Barrier.",
        "allyRow",
        [{ kind: "status", status: "barrier", stacks: 16, duration: 2 }],
        3,
        12,
        1,
      ),
    ],
  },
  {
    presentation: {
      spriteSet: "reaver",
      theme: "blood",
      idlePeriod: 2.7,
    },
    id: "reaver",
    name: "Reaver",
    title: "Pain is just unspent currency.",
    description:
      "Pays in blood for damage nobody else can reach. Drags enemies out of hiding.",
    glyph: "⚔",
    hp: 105,
    power: 5,
    guard: 1,
    speed: 6,
    resource: "Fury",
    maxResource: 6,
    abilities: [
      a("rend", "Rend", "Deal 18. Gain 2 Fury.", "enemy", [
        { kind: "damage", amount: 18 },
        { kind: "resource", amount: 2 },
      ]),
      a(
        "bloodprice",
        "Blood price",
        "Lose 12 HP to deal 38 that ignores armour.",
        "enemy",
        [
          { kind: "damage", amount: 12, self: true },
          { kind: "damage", amount: 38, pierce: true },
        ],
        0,
        -2,
        1,
      ),
      a(
        "frenzy",
        "Frenzy",
        "Lose 8 HP and hit an enemy row for 17.",
        "enemyRow",
        [
          { kind: "damage", amount: 8, self: true },
          { kind: "damage", amount: 17 },
        ],
        3,
        -3,
        1,
      ),
    ],
  },
  {
    presentation: {
      spriteSet: "beguiler",
      theme: "sway",
      idlePeriod: 3.5,
    },
    id: "beguiler",
    name: "Beguiler",
    title: "Why fight them? Let them fight each other.",
    description:
      "Turns enemy intentions against their own side and softens what survives.",
    glyph: "✽",
    hp: 80,
    power: 4,
    guard: 1,
    speed: 7,
    resource: "Sway",
    maxResource: 7,
    abilities: [
      a("whisper", "Ill whisper", "Deal 13. Gain 1 Sway.", "enemy", [
        { kind: "damage", amount: 13, damageType: "arcane" },
        { kind: "resource", amount: 1 },
      ]),
      a(
        "doubt",
        "Seed of doubt",
        "Deal 9 and leave an enemy Vulnerable.",
        "enemy",
        [
          { kind: "damage", amount: 9, damageType: "arcane" },
          { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
        ],
        1,
        11,
      ),
      a(
        "unpick",
        "Unpick the seam",
        "Deal 15 to a row and leave it Vulnerable.",
        "enemyRow",
        [
          { kind: "damage", amount: 15, damageType: "arcane" },
          { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
        ],
        3,
        -1,
        1,
      ),
    ],
  },
];
export function hero(id: string): HeroDef {
  const h = heroes.find((h) => h.id === id);
  if (!h) throw Error("Unknown hero");
  return h;
}
export const tacticalSkills: Record<string, Ability[]> = {
  vanguard: [
    a(
      "intercept",
      "Intercept",
      "Step to the front and gain 12 Barrier. Take another ally’s next direct enemy hit this round.",
      "ally",
      [{ kind: "protect", barrier: 12 }],
      2,
      15,
      1,
    ),
  ],
  arcanist: [
    a(
      "counterspell",
      "Break focus",
      "Interrupt one enemy WINDUP. Costs an attack opportunity; cannot stop ordinary attacks.",
      "enemy",
      [{ kind: "interrupt" }],
      3,
      18,
      2,
    ),
  ],
  ranger: [
    a(
      "suppress",
      "Pinning shot",
      "Deal 8 Precision damage and weaken the enemy’s direct attacks by 35% this round.",
      "enemy",
      [
        { kind: "damage", amount: 8, precision: true },
        { kind: "status", status: "weak", stacks: 1, duration: 1 },
      ],
      2,
      10,
      1,
    ),
  ],
  broker: [
    a(
      "liquidate",
      "Liquidate",
      "Strip all Barrier from an enemy and sell the scrap for 25 team gold.",
      "enemy",
      [
        { kind: "removeStatus", status: "barrier" },
        { kind: "damage", amount: 8 },
        { kind: "gold", amount: 25 },
      ],
      2,
      9,
      1,
    ),
  ],
  herald: [
    a(
      "counterpoint",
      "Counterpoint",
      "Clear Burn, Poison, Wet, Vulnerable and Weak from an allied row and grant 10 Barrier.",
      "allyRow",
      [
        { kind: "removeStatus", status: "burn" },
        { kind: "removeStatus", status: "poison" },
        { kind: "removeStatus", status: "wet" },
        { kind: "removeStatus", status: "vulnerable" },
        { kind: "removeStatus", status: "weak" },
        { kind: "status", status: "barrier", stacks: 10, duration: 2 },
      ],
      2,
      17,
      1,
    ),
  ],
  reaver: [
    a(
      "grapple",
      "Drag them down",
      "Haul a back-row enemy to the front, deal 14 and leave it Vulnerable.",
      "enemy",
      [
        { kind: "move", row: "front" },
        { kind: "damage", amount: 14 },
        { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
      ],
      2,
      7,
      1,
    ),
  ],
  beguiler: [
    a(
      "beguile",
      "Beguile",
      "The enemy's next action strikes its own side instead of yours.",
      "enemy",
      [{ kind: "status", status: "confused", stacks: 1, duration: 1 }],
      3,
      19,
      2,
    ),
  ],
  warden: [
    a(
      "unravel",
      "Unravel",
      "Strip all Barrier from an enemy, then deal 10 damage.",
      "enemy",
      [
        { kind: "removeStatus", status: "barrier" },
        { kind: "damage", amount: 10 },
      ],
      2,
      8,
      1,
    ),
  ],
};
/**
 * The hero's current action list: legacy or tactical base, then any chosen
 * upgrade branches patched over it. Upgrades keep ability ids, so locked plans
 * and cooldowns survive the change.
 */
/** The one-shot actions a hero's carried supplies grant, one entry per supply. */
export function supplyActions(carried: string[] = []): Ability[] {
  return carried
    .map((id) => items.find((i) => i.id === id)?.use)
    .filter((a): a is Ability => !!a);
}
/** The supply an ability came from, or undefined if it is part of the kit. */
export function supplyFor(abilityId: string) {
  return items.find((i) => i.use?.id === abilityId);
}
export function abilities(
  id: string,
  combatVersion?: 2,
  chosen: string[] = [],
  path?: string,
  carried: string[] = [],
): Ability[] {
  const base = hero(id).abilities;
  const changes = combatVersion === 2 ? (tacticalSkills[id] ?? []) : [];
  let list = [
    ...base.filter((a) => !changes.some((b) => b.id === a.id)),
    ...changes,
    ...utility,
  ];
  // Supplies join the kit only under tactical rules; legacy rooms never sold
  // any, so a legacy save cannot be carrying one.
  if (combatVersion !== 2) return list;
  // One entry however many copies are carried: the plan names the action, and
  // resolving it spends one copy.
  for (const use of supplyActions(carried))
    if (!list.some((a) => a.id === use.id)) list.push(use);
  // A class path swaps one signature ability, keeping its id so branches,
  // cooldowns and locked plans still line up.
  const taken = evolution(path);
  if (taken && taken.heroId === id)
    list = list.map((a) =>
      a.id === taken.replaces
        ? { ...taken.ability, reach: taken.ability.reach ?? a.reach }
        : a,
    );
  if (!chosen.length) return list;
  const picked = chosenUpgrades(chosen);
  return list.map((a) =>
    picked
      .filter((u) => u.ability === a.id && u.heroId === id)
      .reduce((current, u) => u.apply(current), a),
  );
}
