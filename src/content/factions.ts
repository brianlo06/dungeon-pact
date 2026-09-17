import type { Ability, Effect, EnemyDef, IntentRule } from "../shared/model";

/**
 * Wave 1 of the faction creatures: the Cistern's and the Archive's own
 * enemies, and the first elite creature.
 *
 * Every creature here exists for the decision it forces, written above it.
 * None of them is chosen by name anywhere in the engine: what each does, and
 * when, is its `behavior` (see `IntentStep` in `shared/model.ts`), read by
 * `engine/intents.ts`. They only act this way in rooms with `factionVersion`;
 * nothing older ever meets one.
 *
 * Numbers are base values, before the party-size hit multiplier, floor scaling
 * and the patience clock, exactly like the foundry's.
 */

const move = (
  id: string,
  name: string,
  description: string,
  target: Ability["target"],
  effects: Effect[],
  extra: Partial<Ability> = {},
): Ability => ({
  id,
  name,
  description,
  cost: 0,
  speed: 0,
  target,
  cooldown: 0,
  effects,
  ...extra,
});
const hit = (amount: number, more: Partial<Extract<Effect, { kind: "damage" }>> = {}): Effect => ({
  kind: "damage",
  amount,
  ...more,
});
const status = (
  id: Extract<Effect, { kind: "status" }>["status"],
  stacks: number,
  duration: number,
  more: Partial<Extract<Effect, { kind: "status" }>> = {},
): Effect => ({ kind: "status", status: id, stacks, duration, ...more });
const rule = (ability: Ability, more: Omit<IntentRule, "ability"> = {}): IntentRule => ({
  ability,
  ...more,
});

// ---------------------------------------------------------------- CISTERN --

/**
 * PRESSURE MAW — controller. *Where do you stand?* It sucks a back-row hero
 * forward (and soaks them), then blasts the front row. A pulled hero is now in
 * reach of everything that hits the front. Interrupt the Siphon, step back
 * after it, or guard whoever it drags.
 */
const siphon = move(
  "siphon",
  "Siphon",
  "Drags a back-row hero to the front and soaks them.",
  "enemy",
  [hit(6), { kind: "move", row: "front" }, status("wet", 1, 2)],
  { interruptible: true },
);
const jet = move(
  "jet",
  "Crushing jet",
  "A blast of pressure down the front row.",
  "enemyRow",
  [hit(16)],
);
const maw: EnemyDef = {
  id: "maw",
  name: "Pressure Maw",
  glyph: "◐",
  hp: 60,
  power: 1,
  guard: 2,
  speed: 3,
  row: "front",
  faction: "cistern",
  roles: ["CONTROLLER", "BRUISER", "SETUP"],
  abilities: [jet],
  behavior: {
    steps: [
      { rules: [rule(siphon, { target: { row: "back" }, why: "back row" })] },
      { rules: [rule(jet, { target: { row: "front" } })] },
    ],
  },
  presentation: { spriteSet: "maw", footprint: "heavy", theme: "guard", idlePeriod: 4.4, shadow: 0.95 },
};

/**
 * SLUICE EEL — status combo. *Do you clean the Wet off, or kill the Eel?* It
 * soaks whoever is dry and Conducts into whoever is already Wet: lightning
 * that chains to every other hero. Cleanse, interrupt the Conduct, or kill it.
 */
const conduct = move(
  "conduct",
  "Conduct",
  "Lightning into a Wet hero, chaining to everyone else.",
  "enemy",
  [hit(16, { damageType: "lightning" })],
  { interruptible: true },
);
const soak = move(
  "soak",
  "Soak",
  "A lash of brine that leaves its target Wet.",
  "enemy",
  [hit(9), status("wet", 1, 3)],
);
const eel: EnemyDef = {
  id: "eel",
  name: "Sluice Eel",
  glyph: "∿",
  hp: 36,
  power: 1,
  guard: 0,
  speed: 7,
  row: "back",
  faction: "cistern",
  roles: ["SETUP", "PAYOFF", "STATUS"],
  abilities: [soak],
  behavior: {
    steps: [
      {
        rules: [
          rule(conduct, { target: { has: "wet", order: "lowestHp" }, why: "Wet" }),
          rule(soak, { target: { lacks: "wet" } }),
        ],
      },
    ],
  },
  presentation: { spriteSet: "eel", footprint: "person", theme: "arcane", idlePeriod: 2.4 },
};

/**
 * PLATE TENDER — defensive support; the Salvor's plates, in miniature. *Break
 * the plate while it is soft, or chew through the armour later?* It sets a
 * soft plate on its sturdiest friend, which hardens in two rounds into Barrier
 * and a heavier hit. Broken soft, the friend is left Vulnerable.
 */
const plate = move(
  "plate",
  "Set a plate",
  "A soft plate on an ally. In two rounds it hardens into armour.",
  "ally",
  [{ kind: "spawn", object: "tender-plate", rows: ["front"], fuse: 2, on: "target" }],
);
const reinforce = move(
  "reinforce",
  "Reinforce",
  "Shores up a plate still setting.",
  "ally",
  [status("barrier", 10, 2)],
  { interruptible: true },
);
const scour = move("scour", "Scour", "A rasp of corroded iron.", "enemy", [hit(11)]);
const tender: EnemyDef = {
  id: "tender",
  name: "Plate Tender",
  glyph: "⛭",
  hp: 40,
  power: 0,
  guard: 1,
  speed: 4,
  row: "back",
  faction: "cistern",
  roles: ["SUPPORT"],
  abilities: [scour],
  behavior: {
    steps: [
      {
        rules: [
          rule(plate, { target: { unhosted: "tender-plate", order: "highestHp" } }),
          rule(reinforce, { target: { objects: true, order: "lowestHp" }, why: "plate setting" }),
          rule(scour),
        ],
      },
      { rules: [rule(scour)] },
    ],
  },
  presentation: { spriteSet: "tender", footprint: "person", theme: "guard", idlePeriod: 3.4 },
};
const plateSoft = move("setting", "Hardens in", "Soft now. When it sets, its host is armoured.", "self", [
  status("barrier", 1, 1),
]);
const tenderPlate: EnemyDef = {
  id: "tender-plate",
  name: "Soft Plate",
  glyph: "▢",
  hp: 26,
  power: 0,
  guard: 0,
  speed: 1,
  row: "front",
  object: true,
  faction: "cistern",
  roles: ["OBJECTIVE"],
  abilities: [plateSoft],
  clock: {
    waiting: plateSoft,
    due: move(
      "harden",
      "Harden",
      "The plate sets: its host gains Barrier, and its hits grow heavier.",
      "ally",
      [status("barrier", 12, 3), status("encrusted", 1, 4)],
    ),
  },
  broken: { each: [status("vulnerable", 1, 2)] },
  presentation: { spriteSet: "tender-plate", footprint: "small", theme: "guard", idlePeriod: 3.8, shadow: 0.8 },
};

/**
 * DREDGER — formation. *The line you planned against will not hold still.* It
 * drags a wounded front-liner out of reach and shoves a fresh one forward when
 * the front is thin. Burst the wounded before it is pulled, or strike past.
 */
const drag = move("drag", "Drag back", "Hauls a wounded ally out of the front line.", "ally", [
  { kind: "move", row: "back" },
  status("barrier", 8, 1),
]);
const shove = move("shove", "Shove forward", "Pushes a sturdy ally into the front line.", "ally", [
  { kind: "move", row: "front" },
  status("barrier", 6, 1),
]);
const dredge = move("dredge", "Dredge hook", "A dragging hook.", "enemy", [hit(15)]);
const dredger: EnemyDef = {
  id: "dredger",
  name: "Dredger",
  glyph: "⚓",
  hp: 54,
  power: 1,
  guard: 3,
  speed: 2,
  row: "front",
  faction: "cistern",
  roles: ["FORMATION", "TANK"],
  abilities: [dredge],
  behavior: {
    steps: [
      {
        rules: [
          rule(drag, { target: { row: "front", below: 0.5 }, why: "{target} wounded" }),
          rule(shove, {
            when: [{ kind: "alliesInRow", row: "front", atMost: 1 }],
            target: { row: "back", atLeast: 0.6, order: "highestGuard" },
            why: "thin front",
          }),
          rule(dredge),
        ],
      },
      { rules: [rule(dredge)] },
    ],
  },
  presentation: { spriteSet: "dredger", footprint: "heavy", theme: "guard", idlePeriod: 4.8, shadow: 0.9 },
};

/**
 * PRESSURE ENGINE — elite. *Crack it, or brace for the vent?* It builds
 * pressure every round while it hits, and at four it vents on every hero,
 * harder for what it stored. Enough damage in the vent round cracks it over
 * itself instead; Wet halves the damage it takes to crack.
 */
const build = move("build", "Build pressure", "A piston blow, and the gauge climbs.", "enemy", [
  hit(12),
  status("pressure", 1, 99, { self: true }),
]);
const vent = move(
  "vent",
  "Vent",
  "Releases everything it stored on every hero. Enough damage this round cracks it instead.",
  "self",
  [
    { kind: "enemies", effects: [hit(6, { scale: { status: "pressure", per: 4 } })] },
    { kind: "removeStatus", status: "pressure" },
  ],
  {
    cracks: {
      per: 12,
      effects: [
        hit(18, { pierce: true }),
        status("vulnerable", 1, 2),
        { kind: "removeStatus", status: "pressure" },
      ],
    },
  },
);
const engine: EnemyDef = {
  id: "engine",
  name: "Pressure Engine",
  glyph: "⛽",
  hp: 88,
  power: 2,
  guard: 3,
  speed: 2,
  row: "front",
  faction: "cistern",
  eliteOnly: true,
  roles: ["OBJECTIVE", "COUNTDOWN", "BRUISER"],
  starts: [{ status: "pressure", stacks: 1, duration: 99 }],
  abilities: [build],
  behavior: {
    steps: [
      {
        rules: [
          rule(vent, { when: [{ kind: "selfHas", status: "pressure", atLeast: 4 }], why: "pressure full" }),
          rule(build),
        ],
      },
    ],
  },
  presentation: { spriteSet: "engine", footprint: "boss-large", theme: "foundry", idlePeriod: 3.2, shadow: 1 },
};

// ---------------------------------------------------------------- ARCHIVE --

/**
 * SEAL SCRIBE — countdown; the Notary's seals, one at a time. *Break the seal,
 * or kill the one holding the pen?* It presses a wax sentence with a hero's
 * name on it that passes in three rounds. Break the seal, interrupt the
 * pressing, or kill the Scribe and every seal it holds crumbles.
 */
const sentence = move(
  "sentence",
  "Wax sentence",
  "Seals a hero's sentence: in three rounds it passes on them.",
  "enemy",
  [{ kind: "spawn", object: "sentence-seal", rows: ["back"], fuse: 3, on: "target" }],
  { interruptible: true },
);
const stamp = move("stamp", "Stamp", "A heavy stamp.", "enemy", [hit(13)]);
const scribe: EnemyDef = {
  id: "scribe",
  name: "Seal Scribe",
  glyph: "✎",
  hp: 34,
  power: 0,
  guard: 0,
  speed: 5,
  row: "back",
  prefers: "back",
  faction: "archive",
  roles: ["COUNTDOWN", "SETUP"],
  abilities: [stamp],
  behavior: {
    steps: [
      { rules: [rule(sentence, { target: { order: "highestHp" } }), rule(stamp)] },
      { rules: [rule(stamp)] },
    ],
  },
  presentation: { spriteSet: "scribe", footprint: "person", theme: "contract", idlePeriod: 3.0 },
};
const sealWaiting = move("setting", "Passes in", "The sentence is sealed. When it passes, its hero pays.", "self", [
  status("barrier", 2, 1),
]);
const sentenceSeal: EnemyDef = {
  id: "sentence-seal",
  name: "Wax Sentence",
  glyph: "◉",
  hp: 22,
  power: 0,
  guard: 0,
  speed: 1,
  row: "back",
  object: true,
  tethered: true,
  faction: "archive",
  roles: ["OBJECTIVE", "COUNTDOWN"],
  abilities: [sealWaiting],
  clock: {
    waiting: sealWaiting,
    due: move("pass", "Sentence passes", "The sealed hero pays, and is left Weak.", "enemy", [
      hit(20, { pierce: true }),
      status("weak", 1, 2),
    ]),
  },
  broken: { each: [hit(6, { pierce: true })] },
  presentation: { spriteSet: "sentence-seal", footprint: "small", theme: "contract", idlePeriod: 4.2, shadow: 0.8 },
};

/**
 * LEDGER WRAITH — delayed economy; the Bailiff's liens, simplified. *Pay in
 * gold, or kill it first?* It writes a debt on a hero that comes due in three
 * rounds as gold from the treasury, and blood when the treasury runs short.
 * Everything it wrote is forgiven if it falls before then.
 */
const entry = move("entry", "Ledger entry", "Writes a debt on a hero, due in three rounds.", "enemy", [
  hit(6),
  status("debt", 30, 3, { tether: true }),
]);
const interest = move("interest", "Interest", "The debt grows.", "enemy", [
  hit(8),
  status("debt", 12, 1, { tether: true }),
]);
const grasp = move("grasp", "Cold grasp", "A chilling touch.", "enemy", [hit(12)]);
const wraith: EnemyDef = {
  id: "wraith",
  name: "Ledger Wraith",
  glyph: "¤",
  hp: 42,
  power: 0,
  guard: 1,
  speed: 3,
  row: "back",
  prefers: "back",
  faction: "archive",
  roles: ["ECONOMIC", "COUNTDOWN"],
  abilities: [grasp],
  behavior: {
    steps: [
      { rules: [rule(entry, { target: { lacks: "debt", order: "highestHp" } }), rule(grasp)] },
      { rules: [rule(interest, { target: { has: "debt" }, why: "{target} in debt" }), rule(grasp)] },
    ],
  },
  presentation: { spriteSet: "wraith", footprint: "person", theme: "contract", idlePeriod: 4.0 },
};

/**
 * INDEXER — target designator. *Kill the fragile setup piece, or live with the
 * Mark?* It Marks the most exposed hero, then leaves them Vulnerable. Weak on
 * its own, and the reason everything else on the Archive floor hits harder.
 */
const index = move("index", "Index", "Marks a hero for the Archive.", "enemy", [
  hit(5),
  status("marked", 1, 3),
]);
const crossref = move("crossref", "Cross-reference", "Leaves a Marked hero Vulnerable.", "enemy", [
  hit(8),
  status("vulnerable", 1, 2),
]);
const papercut = move("papercut", "Paper cut", "A thin, precise cut.", "enemy", [hit(10)]);
const indexer: EnemyDef = {
  id: "indexer",
  name: "Indexer",
  glyph: "☰",
  hp: 30,
  power: 0,
  guard: 0,
  speed: 6,
  row: "back",
  faction: "archive",
  roles: ["SETUP", "DEBUFFER"],
  abilities: [papercut],
  behavior: {
    steps: [
      { rules: [rule(index, { target: { lacks: "marked", order: "lowestFraction" } }), rule(papercut)] },
      { rules: [rule(crossref, { target: { has: "marked" }, why: "Marked" }), rule(papercut)] },
    ],
  },
  presentation: { spriteSet: "indexer", footprint: "small", theme: "precision", idlePeriod: 2.8 },
};

/**
 * MARGIN STALKER — mobile assassin. *Can you reach it, and who does it want?*
 * It shifts rows every other round behind a scrap of Barrier — out of melee
 * reach when it hides at the back — then strikes the Marked hero, or else the
 * weakest, with a precise blow that cashes a Mark in.
 */
const sidenote = move("sidenote", "Sidenote", "Slips to the other row.", "self", [
  { kind: "move", row: "swap", self: true },
  status("barrier", 8, 1, { self: true }),
]);
const footnote = move("footnote", "Footnote", "A precise blow. Cashes in a Mark.", "enemy", [
  hit(14, { precision: true }),
]);
const stalker: EnemyDef = {
  id: "stalker",
  name: "Margin Stalker",
  glyph: "†",
  hp: 38,
  power: 1,
  guard: 0,
  speed: 8,
  row: "front",
  faction: "archive",
  roles: ["ASSASSIN", "MOBILE"],
  abilities: [footnote],
  behavior: {
    steps: [
      { rules: [rule(sidenote)] },
      {
        rules: [
          rule(footnote, { target: { has: "marked" }, why: "Marked" }),
          rule(footnote, { target: { order: "lowestFraction" }, why: "{target} weakest" }),
        ],
      },
    ],
  },
  presentation: { spriteSet: "stalker", footprint: "person", theme: "blood", idlePeriod: 1.9 },
};

export const factionEnemies: EnemyDef[] = [
  maw,
  eel,
  tender,
  tenderPlate,
  dredger,
  engine,
  scribe,
  sentenceSeal,
  wraith,
  indexer,
  stalker,
];
