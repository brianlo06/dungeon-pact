import type { Ability, HeroDef, Player } from "../shared/model";
import { hero } from "./heroes";

/**
 * Class evolutions, taught by mentors met on the route.
 *
 * The reference here is An Average Campaign, where a subclass is unlocked by a
 * one-off encounter tied to an area and is a role pivot rather than a power-up
 * — a Warrior who becomes a Rampager trades tanking for burst and runs dry on
 * focus. Two things carry over: each path costs something, and a run cannot
 * reach every mentor, so which paths were even on offer differs run to run.
 *
 * What is this game's own: a mentor charges tuition from the shared treasury,
 * and the treasury will not cover everyone. Who evolves is a party decision
 * fought over the same purse as the auctions.
 *
 * A hero evolves at most once per run, so taking the first mentor means
 * declining whatever the later ones would have taught.
 */
export interface MentorDef {
  id: string;
  tier: 1 | 2 | 3;
  name: string;
  /** The archetype's promise, shown above the offered paths. */
  text: string;
  tuition: number;
}

export const mentors: MentorDef[] = [
  {
    id: "whetstone",
    tier: 1,
    name: "The Whetstone",
    text: "“Sharpness is a decision. Most of you decide too late.”",
    tuition: 140,
  },
  {
    id: "reliquary",
    tier: 2,
    name: "The Reliquary",
    text: "“Anything can be endured, for a price. Yours is listed.”",
    tuition: 180,
  },
  {
    id: "cipher",
    tier: 3,
    name: "The Cipher",
    text: "“I do not make you stronger. I make you harder to answer.”",
    tuition: 220,
  },
];

export interface EvolutionDef {
  id: string;
  heroId: string;
  mentor: string;
  name: string;
  title: string;
  /** Stat deltas, applied once. Negative values are the path's cost. */
  stats: Partial<{
    hp: number;
    power: number;
    guard: number;
    speed: number;
    resource: number;
  }>;
  /** The signature ability this path trades away, and what replaces it. */
  replaces: string;
  ability: Ability;
}

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

export const evolutions: EvolutionDef[] = [
  // ── Vanguard ───────────────────────────────────────────────────────────
  {
    id: "van-breaker",
    heroId: "vanguard",
    mentor: "whetstone",
    name: "Breaker",
    title: "The wall learns to move forward.",
    stats: { power: 4, guard: -2 },
    replaces: "slam",
    ability: a(
      "slam",
      "Sunder",
      "Hit an enemy row for 26 and leave it Vulnerable.",
      "enemyRow",
      [
        { kind: "damage", amount: 26 },
        { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
      ],
      3,
      -2,
      1,
    ),
  },
  {
    id: "van-aegis",
    heroId: "vanguard",
    mentor: "reliquary",
    name: "Aegis Knight",
    title: "Stand still. Let it break on you.",
    stats: { hp: 25, speed: -2 },
    replaces: "intercept",
    ability: a(
      "intercept",
      "Aegis",
      "Take an ally's next direct hit with 20 Barrier, and shield their whole row for 12.",
      "ally",
      [
        { kind: "protect", barrier: 20 },
        { kind: "status", status: "barrier", stacks: 12, duration: 2 },
      ],
      2,
      15,
      1,
    ),
  },
  {
    id: "van-warlord",
    heroId: "vanguard",
    mentor: "cipher",
    name: "Warlord",
    title: "Fight louder. They follow the noise.",
    stats: { power: 2, resource: 2 },
    replaces: "bash",
    ability: a(
      "bash",
      "Warcry",
      "Strike for 14, gain 2 Resolve and 30% more damage.",
      "enemy",
      [
        { kind: "damage", amount: 14 },
        { kind: "resource", amount: 2 },
        {
          kind: "status",
          status: "empowered",
          stacks: 1,
          duration: 3,
          self: true,
        },
      ],
    ),
  },

  // ── Arcanist ───────────────────────────────────────────────────────────
  {
    id: "arc-pyromancer",
    heroId: "arcanist",
    mentor: "whetstone",
    name: "Pyromancer",
    title: "Water was always the slower answer.",
    stats: { power: 3, hp: -8 },
    replaces: "fire",
    ability: a(
      "fire",
      "Immolate",
      "Deal 20 Fire to a row and set it burning badly.",
      "enemyRow",
      [
        { kind: "damage", amount: 20, damageType: "fire" },
        { kind: "status", status: "burn", stacks: 6, duration: 3 },
      ],
      3,
      -1,
      1,
    ),
  },
  {
    id: "arc-tidecaller",
    heroId: "arcanist",
    mentor: "reliquary",
    name: "Tidecaller",
    title: "The tide arrives whether you are ready or not.",
    stats: { hp: 14, resource: 2 },
    replaces: "rain",
    ability: a(
      "rain",
      "Riptide",
      "Soak a row with Wet and drag its attacks down 35%, for 1 Mana.",
      "enemyRow",
      [
        { kind: "status", status: "wet", stacks: 1, duration: 3 },
        { kind: "status", status: "weak", stacks: 1, duration: 1 },
      ],
      1,
      8,
    ),
  },
  {
    id: "arc-chronomancer",
    heroId: "arcanist",
    mentor: "cipher",
    name: "Chronomancer",
    title: "A moment taken from them is a moment given to you.",
    stats: { speed: 4 },
    replaces: "counterspell",
    ability: a(
      "counterspell",
      "Stillness",
      "Break an enemy WINDUP and leave it striking its own side.",
      "enemy",
      [
        { kind: "interrupt" },
        { kind: "status", status: "confused", stacks: 1, duration: 1 },
      ],
      3,
      18,
      2,
    ),
  },

  // ── Ranger ─────────────────────────────────────────────────────────────
  {
    id: "rng-sharpshooter",
    heroId: "ranger",
    mentor: "whetstone",
    name: "Sharpshooter",
    title: "Armour is just a slower target.",
    stats: { power: 3 },
    replaces: "arrow",
    ability: a(
      "arrow",
      "Piercing shot",
      "Precision strike for 22 that ignores armour. Gain 1 Focus.",
      "enemy",
      [
        { kind: "damage", amount: 22, precision: true, pierce: true },
        { kind: "resource", amount: 1 },
      ],
    ),
  },
  {
    id: "rng-pathfinder",
    heroId: "ranger",
    mentor: "reliquary",
    name: "Pathfinder",
    title: "Know the ground and it stops being their ground.",
    stats: { hp: 16, guard: 2 },
    replaces: "mark",
    ability: a(
      "mark",
      "Snare",
      "Deal 8, mark the target and weaken its attacks by 35%.",
      "enemy",
      [
        { kind: "damage", amount: 8, precision: true },
        { kind: "status", status: "marked", stacks: 1, duration: 3 },
        { kind: "status", status: "weak", stacks: 1, duration: 1 },
        { kind: "resource", amount: 1 },
      ],
      0,
      15,
    ),
  },
  {
    id: "rng-gloomstalker",
    heroId: "ranger",
    mentor: "cipher",
    name: "Gloomstalker",
    title: "They should not get to see it coming.",
    stats: { speed: 3, hp: -6 },
    replaces: "volley",
    ability: a(
      "volley",
      "Shadow volley",
      "Precision fire strikes a row for 20 and leaves it Vulnerable.",
      "enemyRow",
      [
        { kind: "damage", amount: 20, precision: true },
        { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
      ],
      3,
      -1,
      1,
    ),
  },

  // ── Warden ─────────────────────────────────────────────────────────────
  {
    id: "war-blightcaller",
    heroId: "warden",
    mentor: "whetstone",
    name: "Blightcaller",
    title: "Growth, pointed the other way.",
    stats: { power: 3 },
    replaces: "briar",
    ability: a(
      "briar",
      "Blight",
      "Poison an entire row for 10 per round.",
      "enemyRow",
      [{ kind: "status", status: "poison", stacks: 10, duration: 3 }],
      3,
      2,
      1,
    ),
  },
  {
    id: "war-lifebinder",
    heroId: "warden",
    mentor: "reliquary",
    name: "Lifebinder",
    title: "Nothing living is beyond hope. Nothing.",
    stats: { resource: 2 },
    replaces: "mend",
    ability: a(
      "mend",
      "Lifebind",
      "Restore 36 HP, apply strong Regeneration and 10 Barrier. Once every other round.",
      "ally",
      [
        { kind: "heal", amount: 36 },
        { kind: "status", status: "regen", stacks: 5, duration: 3 },
        { kind: "status", status: "barrier", stacks: 10, duration: 2 },
      ],
      2,
      3,
      1,
    ),
  },
  {
    id: "war-hollow",
    heroId: "warden",
    mentor: "cipher",
    name: "Hollow Druid",
    title: "The green remembers what was taken.",
    stats: { power: 2, hp: 10 },
    replaces: "dew",
    ability: a(
      "dew",
      "Drown",
      "Deal 12, apply Wet and weaken the target by 35%. Gain 1 Growth.",
      "enemy",
      [
        { kind: "damage", amount: 12 },
        { kind: "status", status: "wet", stacks: 1, duration: 3 },
        { kind: "status", status: "weak", stacks: 1, duration: 1 },
        { kind: "resource", amount: 1 },
      ],
      0,
      9,
    ),
  },

  // ── Broker ─────────────────────────────────────────────────────────────
  {
    id: "brk-magnate",
    heroId: "broker",
    mentor: "whetstone",
    name: "Magnate",
    title: "Buy the problem. Then break it.",
    stats: { power: 2 },
    replaces: "invest",
    ability: a(
      "invest",
      "Hostile bid",
      "Spend 50 team gold to deal 44 and leave the target Vulnerable.",
      "enemy",
      [
        { kind: "gold", amount: -50 },
        { kind: "damage", amount: 44 },
        { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
      ],
      2,
      0,
      1,
    ),
  },
  {
    id: "brk-assurer",
    heroId: "broker",
    mentor: "reliquary",
    name: "Assurer",
    title: "Everyone is covered. Read the small print later.",
    stats: { hp: 18 },
    replaces: "insure",
    ability: a(
      "insure",
      "Indemnity",
      "Spend 40 team gold to give an entire allied row 22 Barrier.",
      "allyRow",
      [
        { kind: "gold", amount: -40 },
        { kind: "status", status: "barrier", stacks: 22, duration: 2 },
      ],
      2,
      14,
      1,
    ),
  },
  {
    id: "brk-usurer",
    heroId: "broker",
    mentor: "cipher",
    name: "Usurer",
    title: "Every wound is somebody's asset.",
    stats: { resource: 2 },
    replaces: "appraise",
    ability: a(
      "appraise",
      "Tithe",
      "Deal 14, earn 20 team gold and heal yourself 7.",
      "enemy",
      [
        { kind: "damage", amount: 14 },
        { kind: "gold", amount: 20 },
        { kind: "heal", amount: 7, self: true },
        { kind: "resource", amount: 1 },
      ],
    ),
  },

  // ── Herald ─────────────────────────────────────────────────────────────
  {
    id: "hrl-warcaller",
    heroId: "herald",
    mentor: "whetstone",
    name: "Warcaller",
    title: "Lead from where it is loudest.",
    stats: { power: 3 },
    replaces: "rally",
    ability: a(
      "rally",
      "Warcall",
      "Strike for 20, gain 1 Verse and 30% more damage.",
      "enemy",
      [
        { kind: "damage", amount: 20 },
        { kind: "resource", amount: 1 },
        {
          kind: "status",
          status: "empowered",
          stacks: 1,
          duration: 3,
          self: true,
        },
      ],
    ),
  },
  {
    id: "hrl-sanctifier",
    heroId: "herald",
    mentor: "reliquary",
    name: "Sanctifier",
    title: "Hold the line by holding the people on it.",
    stats: { hp: 16 },
    replaces: "cadence",
    ability: a(
      "cadence",
      "Sanctuary",
      "Give an allied row 24 Barrier and lasting Regeneration.",
      "allyRow",
      [
        { kind: "status", status: "barrier", stacks: 24, duration: 2 },
        { kind: "status", status: "regen", stacks: 4, duration: 3 },
      ],
      3,
      12,
      1,
    ),
  },
  {
    id: "hrl-dirgesinger",
    heroId: "herald",
    mentor: "cipher",
    name: "Dirgesinger",
    title: "A funeral song, sung early.",
    stats: { speed: 2 },
    replaces: "counterpoint",
    ability: a(
      "counterpoint",
      "Dirge",
      "Clear afflictions from an allied row and give it 30% more damage.",
      "allyRow",
      [
        { kind: "removeStatus", status: "burn" },
        { kind: "removeStatus", status: "poison" },
        { kind: "removeStatus", status: "vulnerable" },
        { kind: "removeStatus", status: "weak" },
        { kind: "status", status: "empowered", stacks: 1, duration: 3 },
      ],
      2,
      17,
      1,
    ),
  },

  // ── Reaver ─────────────────────────────────────────────────────────────
  {
    id: "rvr-butcher",
    heroId: "reaver",
    mentor: "whetstone",
    name: "Butcher",
    title: "Wider swings. Fewer problems.",
    stats: { power: 4 },
    replaces: "frenzy",
    ability: a(
      "frenzy",
      "Butchery",
      "Lose 8 HP and tear an enemy row for 26.",
      "enemyRow",
      [
        { kind: "damage", amount: 8, self: true },
        { kind: "damage", amount: 26 },
      ],
      3,
      -3,
      1,
    ),
  },
  {
    id: "rvr-ironhide",
    heroId: "reaver",
    mentor: "reliquary",
    name: "Ironhide",
    title: "Stop bleeding. Start absorbing.",
    stats: { hp: 26, guard: 2, speed: -2 },
    replaces: "rend",
    ability: a(
      "rend",
      "Ironrend",
      "Deal 22, gain 2 Fury and 12 Barrier.",
      "enemy",
      [
        { kind: "damage", amount: 22 },
        { kind: "resource", amount: 2 },
        {
          kind: "status",
          status: "barrier",
          stacks: 12,
          duration: 2,
          self: true,
        },
      ],
    ),
  },
  {
    id: "rvr-bloodbound",
    heroId: "reaver",
    mentor: "cipher",
    name: "Bloodbound",
    title: "The debt runs both ways now.",
    stats: { resource: 2 },
    replaces: "bloodprice",
    ability: a(
      "bloodprice",
      "Blood pact",
      "Lose 10 HP to deal 40 through armour, and take 14 back.",
      "enemy",
      [
        { kind: "damage", amount: 10, self: true },
        { kind: "damage", amount: 40, pierce: true },
        { kind: "heal", amount: 14, self: true },
      ],
      0,
      -2,
      1,
    ),
  },

  // ── Beguiler ───────────────────────────────────────────────────────────
  {
    id: "bgl-mindflayer",
    heroId: "beguiler",
    mentor: "whetstone",
    name: "Mindflayer",
    title: "Doubt is slower than a hole in the thinking.",
    stats: { power: 3 },
    replaces: "whisper",
    ability: a(
      "whisper",
      "Mind spike",
      "Deal 21 arcane and leave the target Vulnerable.",
      "enemy",
      [
        { kind: "damage", amount: 21, damageType: "arcane" },
        { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
        { kind: "resource", amount: 1 },
      ],
    ),
  },
  {
    id: "bgl-illusionist",
    heroId: "beguiler",
    mentor: "reliquary",
    name: "Illusionist",
    title: "Be somewhere else when it lands.",
    stats: { hp: 14 },
    replaces: "doubt",
    ability: a(
      "doubt",
      "Mirrorstep",
      "Deal 9, leave an enemy Vulnerable and step behind 16 Barrier.",
      "enemy",
      [
        { kind: "damage", amount: 9, damageType: "arcane" },
        { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
        {
          kind: "status",
          status: "barrier",
          stacks: 16,
          duration: 2,
          self: true,
        },
      ],
      1,
      11,
    ),
  },
  {
    id: "bgl-puppeteer",
    heroId: "beguiler",
    mentor: "cipher",
    name: "Puppeteer",
    title: "You were always going to do this for me.",
    stats: { resource: 2 },
    replaces: "beguile",
    ability: a(
      "beguile",
      "Puppetry",
      "The enemy strikes its own side, and is left Vulnerable.",
      "enemy",
      [
        { kind: "status", status: "confused", stacks: 1, duration: 1 },
        { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
      ],
      2,
      19,
      2,
    ),
  },
];

export const mentor = (id: string) => mentors.find((m) => m.id === id);
export const evolution = (id?: string) =>
  id ? evolutions.find((e) => e.id === id) : undefined;
/** The single path a mentor teaches this hero, if any. */
export const pathFor = (mentorId: string, heroId: string) =>
  evolutions.find((e) => e.mentor === mentorId && e.heroId === heroId);

/** Display name: the evolved class if taken, else the base class. */
export function className(p: Pick<Player, "heroId" | "evolution">) {
  return evolution(p.evolution)?.name ?? hero(p.heroId).name;
}
/** Resource cap, which a path may raise. */
export function resourceCap(p: Pick<Player, "heroId" | "evolution">) {
  const base: HeroDef = hero(p.heroId);
  return base.maxResource + (evolution(p.evolution)?.stats.resource ?? 0);
}
