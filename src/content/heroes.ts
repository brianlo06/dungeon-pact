import type { Ability, HeroDef } from "../shared/model";
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
  name,
  description,
  target,
  effects,
  cost,
  speed,
  cooldown,
});
export const utility: Ability[] = [
  a(
    "brace",
    "Brace",
    "Gain 14 Barrier and recover 2 resource.",
    "self",
    [
      { kind: "status", status: "barrier", stacks: 14, duration: 2 },
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
      a(
        "mend",
        "Mending roots",
        "Restore 26 HP and apply Regeneration.",
        "ally",
        [
          { kind: "heal", amount: 26 },
          { kind: "status", status: "regen", stacks: 4, duration: 3 },
        ],
        2,
        3,
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
];
export function hero(id: string): HeroDef {
  const h = heroes.find((h) => h.id === id);
  if (!h) throw Error("Unknown hero");
  return h;
}
export function abilities(id: string): Ability[] {
  return [...hero(id).abilities, ...utility];
}
