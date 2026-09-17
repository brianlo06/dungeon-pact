import type { Ability, Effect, Player } from "../shared/model";

/**
 * Branching ability upgrades. Each hero has three lines; a cleared chamber
 * grants one pick, and every line offers force against protection or sustain
 * so no single class owns the party's defensive answers. An upgrade never
 * changes an ability's id, so plans, cooldowns and saves stay valid.
 */
export interface UpgradeDef {
  id: string;
  heroId: string;
  /** Pick order: a hero is offered the line matching how many picks they hold. */
  line: number;
  ability: string;
  name: string;
  description: string;
  kind: "force" | "guard";
  apply: (a: Ability) => Ability;
}

const damage = (a: Ability, delta: number): Ability => ({
  ...a,
  effects: a.effects.map((e) =>
    e.kind === "damage" ? { ...e, amount: e.amount + delta } : e,
  ),
});
const after = (a: Ability, ...extra: Effect[]): Ability => ({
  ...a,
  effects: [...a.effects, ...extra],
});
const before = (a: Ability, ...extra: Effect[]): Ability => ({
  ...a,
  effects: [...extra, ...a.effects],
});
const restack = (a: Ability, id: string, stacks: number): Ability => ({
  ...a,
  effects: a.effects.map((e) =>
    e.kind === "status" && e.status === id ? { ...e, stacks } : e,
  ),
});
const heal = (a: Ability, amount: number): Ability => ({
  ...a,
  effects: a.effects.map((e) => (e.kind === "heal" ? { ...e, amount } : e)),
});
const selfHeal = (amount: number): Effect => ({
  kind: "heal",
  amount,
  self: true,
});
const selfBarrier = (stacks: number): Effect => ({
  kind: "status",
  status: "barrier",
  stacks,
  duration: 2,
  self: true,
});
const weaken: Effect = {
  kind: "status",
  status: "weak",
  stacks: 1,
  duration: 1,
};

type Draft = Omit<UpgradeDef, "apply"> & { apply: (a: Ability) => Ability };
const make = (d: Draft): UpgradeDef => ({
  ...d,
  apply: (a) => ({ ...d.apply(a), name: d.name, description: d.description }),
});

export const upgrades: UpgradeDef[] = [
  // Vanguard — already the protector, so its branches trade reach for reliability.
  make({
    id: "van-bash-crush",
    heroId: "vanguard",
    line: 0,
    ability: "bash",
    kind: "force",
    name: "Shieldbreaker · Crushing",
    description: "Strike for 22. Gain 1 Resolve.",
    apply: (a) => damage(a, 7),
  }),
  make({
    id: "van-bash-sworn",
    heroId: "vanguard",
    line: 0,
    ability: "bash",
    kind: "guard",
    name: "Shieldbreaker · Sworn",
    description: "Strike for 15 and gain 3 Resolve, funding more protection.",
    apply: (a) => ({
      ...a,
      effects: a.effects.map((e) =>
        e.kind === "resource" ? { ...e, amount: 3 } : e,
      ),
    }),
  }),
  make({
    id: "van-oath-bulwark",
    heroId: "vanguard",
    line: 1,
    ability: "intercept",
    kind: "guard",
    name: "Iron oath · Bulwark",
    description:
      "Step forward with 22 Barrier and take an ally’s next direct hit.",
    apply: (a) => ({
      ...a,
      effects: a.effects.map((e) =>
        e.kind === "protect" ? { ...e, barrier: 22 } : e,
      ),
    }),
  }),
  make({
    id: "van-oath-shared",
    heroId: "vanguard",
    line: 1,
    ability: "intercept",
    kind: "force",
    name: "Iron oath · Shared",
    description:
      "Take an ally’s next direct hit with 12 Barrier, and give them 12 Barrier too.",
    apply: (a) =>
      after(a, {
        kind: "status",
        status: "barrier",
        stacks: 12,
        duration: 2,
      }),
  }),
  make({
    id: "van-slam-quake",
    heroId: "vanguard",
    line: 2,
    ability: "slam",
    kind: "force",
    name: "Foundry slam · Quake",
    description: "Hit an enemy row for 26 and expose them.",
    apply: (a) => damage(a, 7),
  }),
  make({
    id: "van-slam-sunder",
    heroId: "vanguard",
    line: 2,
    ability: "slam",
    kind: "guard",
    name: "Foundry slam · Sundering",
    description: "Strip the row’s Barrier, then hit for 19 and expose them.",
    apply: (a) => before(a, { kind: "removeStatus", status: "barrier" }),
  }),

  // Arcanist — sustain and party-wide mitigation without a healer.
  make({
    id: "arc-spark-focused",
    heroId: "arcanist",
    line: 0,
    ability: "spark",
    kind: "force",
    name: "Arcane spark · Focused",
    description: "Strike for 22. Recover 1 Mana.",
    apply: (a) => damage(a, 7),
  }),
  make({
    id: "arc-spark-siphon",
    heroId: "arcanist",
    line: 0,
    ability: "spark",
    kind: "guard",
    name: "Arcane spark · Siphoning",
    description: "Strike for 15, recover 1 Mana and heal yourself 8.",
    apply: (a) => after(a, selfHeal(8)),
  }),
  make({
    id: "arc-rain-deluge",
    heroId: "arcanist",
    line: 1,
    ability: "rain",
    kind: "force",
    name: "Cloudburst · Deluge",
    description: "Soak a row with lasting Wet for 1 Mana.",
    apply: (a) => ({
      ...a,
      cost: 1,
      effects: a.effects.map((e) =>
        e.kind === "status" && e.status === "wet" ? { ...e, duration: 4 } : e,
      ),
    }),
  }),
  make({
    id: "arc-rain-chill",
    heroId: "arcanist",
    line: 1,
    ability: "rain",
    kind: "guard",
    name: "Cloudburst · Chilling",
    description:
      "Soak a row with Wet and weaken its attacks by 35% this round.",
    apply: (a) => after(a, weaken),
  }),
  make({
    id: "arc-storm-thunderhead",
    heroId: "arcanist",
    line: 2,
    ability: "storm",
    kind: "force",
    name: "Storm needle · Thunderhead",
    description: "Lightning deals 33. Wet triggers Chain Shock.",
    apply: (a) => damage(a, 8),
  }),
  make({
    id: "arc-storm-grounded",
    heroId: "arcanist",
    line: 2,
    ability: "storm",
    kind: "guard",
    name: "Storm needle · Grounded",
    description: "Lightning deals 25 and earths 18 Barrier onto you.",
    apply: (a) => after(a, selfBarrier(18)),
  }),

  // Ranger — control that protects the whole party instead of one ally.
  make({
    id: "rng-arrow-broadhead",
    heroId: "ranger",
    line: 0,
    ability: "arrow",
    kind: "force",
    name: "True shot · Broadhead",
    description: "Precision strike for 24. Gain 1 Focus.",
    apply: (a) => damage(a, 7),
  }),
  make({
    id: "rng-arrow-harvest",
    heroId: "ranger",
    line: 0,
    ability: "arrow",
    kind: "guard",
    name: "True shot · Harvesting",
    description: "Precision strike for 17, gain 1 Focus and heal yourself 7.",
    apply: (a) => after(a, selfHeal(7)),
  }),
  make({
    id: "rng-mark-hunter",
    heroId: "ranger",
    line: 1,
    ability: "mark",
    kind: "force",
    name: "Quarry sign · Hunter’s",
    description: "Mark a target and strike it for 12 precision damage.",
    apply: (a) => before(a, { kind: "damage", amount: 12, precision: true }),
  }),
  make({
    id: "rng-mark-pinning",
    heroId: "ranger",
    line: 1,
    ability: "mark",
    kind: "guard",
    name: "Quarry sign · Pinning",
    description:
      "Mark a target and weaken its direct attacks by 35% this round. Free and fast.",
    apply: (a) => after(a, weaken),
  }),
  make({
    id: "rng-volley-storm",
    heroId: "ranger",
    line: 2,
    ability: "volley",
    kind: "force",
    name: "Split the sky · Storm",
    description: "Precision attacks strike an entire row for 25.",
    apply: (a) => damage(a, 7),
  }),
  make({
    id: "rng-volley-covering",
    heroId: "ranger",
    line: 2,
    ability: "volley",
    kind: "guard",
    name: "Split the sky · Covering",
    description: "Strike a row for 18 and take cover behind 16 Barrier.",
    apply: (a) => after(a, selfBarrier(16)),
  }),

  // Warden — chooses between raw recovery and shared mitigation.
  make({
    id: "war-thorn-rending",
    heroId: "warden",
    line: 0,
    ability: "thorn",
    kind: "force",
    name: "Thorn lash · Rending",
    description: "Deal 21. Gain 1 Growth.",
    apply: (a) => damage(a, 7),
  }),
  make({
    id: "war-thorn-sapping",
    heroId: "warden",
    line: 0,
    ability: "thorn",
    kind: "guard",
    name: "Thorn lash · Sapping",
    description: "Deal 14, gain 1 Growth and heal yourself 7.",
    apply: (a) => after(a, selfHeal(7)),
  }),
  make({
    id: "war-mend-deep",
    heroId: "warden",
    line: 1,
    ability: "mend",
    kind: "force",
    name: "Mending roots · Deep",
    description:
      "Restore 44 HP and apply Regeneration. Once every other round.",
    apply: (a) => heal(a, 44),
  }),
  make({
    id: "war-mend-warding",
    heroId: "warden",
    line: 1,
    ability: "mend",
    kind: "guard",
    name: "Mending roots · Warding",
    description:
      "Restore 32 HP, apply Regeneration and grant 16 Barrier. Once every other round.",
    apply: (a) =>
      after(a, { kind: "status", status: "barrier", stacks: 16, duration: 2 }),
  }),
  make({
    id: "war-briar-choking",
    heroId: "warden",
    line: 2,
    ability: "briar",
    kind: "force",
    name: "Briar prison · Choking",
    description: "Poison a row for 9 per round.",
    apply: (a) => restack(a, "poison", 9),
  }),
  make({
    id: "war-briar-warding",
    heroId: "warden",
    line: 2,
    ability: "briar",
    kind: "guard",
    name: "Briar prison · Warding",
    description:
      "Poison a row for 5 per round and weaken its attacks by 35% this round.",
    apply: (a) => after(a, weaken),
  }),

  // Broker — the treasury is the ammunition, so its branches price themselves.
  make({
    id: "brk-appraise-sharp",
    heroId: "broker",
    line: 0,
    ability: "appraise",
    kind: "force",
    name: "Appraise · Sharp",
    description: "Deal 21 and earn 10 team gold.",
    apply: (a) => damage(a, 7),
  }),
  make({
    id: "brk-appraise-hedged",
    heroId: "broker",
    line: 0,
    ability: "appraise",
    kind: "guard",
    name: "Appraise · Hedged",
    description: "Deal 14, earn 10 team gold and heal yourself 8.",
    apply: (a) => after(a, selfHeal(8)),
  }),
  make({
    id: "brk-invest-leveraged",
    heroId: "broker",
    line: 1,
    ability: "invest",
    kind: "force",
    name: "Leveraged strike · Aggressive",
    description: "Spend 50 team gold to deal 46.",
    apply: (a) => damage(a, 12),
  }),
  make({
    id: "brk-invest-hedged",
    heroId: "broker",
    line: 1,
    ability: "invest",
    kind: "guard",
    name: "Leveraged strike · Diversified",
    description: "Spend only 25 team gold to deal 34 and earn 14 Barrier.",
    apply: (a) => ({
      ...after(a, selfBarrier(14)),
      effects: [
        ...after(a, selfBarrier(14)).effects.map((e) =>
          e.kind === "gold" ? { ...e, amount: -25 } : e,
        ),
      ],
    }),
  }),
  make({
    id: "brk-insure-hostile",
    heroId: "broker",
    line: 2,
    ability: "insure",
    kind: "force",
    name: "Underwrite · Hostile",
    description:
      "Spend 40 team gold for 26 Barrier and 30% more damage for that ally.",
    apply: (a) =>
      after(a, {
        kind: "status",
        status: "empowered",
        stacks: 1,
        duration: 3,
      }),
  }),
  make({
    id: "brk-insure-full",
    heroId: "broker",
    line: 2,
    ability: "insure",
    kind: "guard",
    name: "Underwrite · Full cover",
    description: "Spend 40 team gold to give an ally 40 Barrier.",
    apply: (a) => restack(a, "barrier", 40),
  }),

  // Herald — every line chooses between lifting the party and shielding it.
  make({
    id: "hrl-rally-sharp",
    heroId: "herald",
    line: 0,
    ability: "rally",
    kind: "force",
    name: "Rallying note · Sharp",
    description: "Deal 22. Gain 1 Verse.",
    apply: (a) => damage(a, 7),
  }),
  make({
    id: "hrl-rally-restorative",
    heroId: "herald",
    line: 0,
    ability: "rally",
    kind: "guard",
    name: "Rallying note · Restorative",
    description: "Deal 15, gain 1 Verse and heal yourself 8.",
    apply: (a) => after(a, selfHeal(8)),
  }),
  make({
    id: "hrl-anthem-hymn",
    heroId: "herald",
    line: 1,
    ability: "anthem",
    kind: "force",
    name: "Battle anthem · Marching",
    description:
      "For 1 Verse, you and an ally deal 30% more damage for three rounds.",
    apply: (a) => ({
      ...a,
      cost: 1,
      effects: a.effects.map((e) =>
        e.kind === "status" && e.status === "empowered"
          ? { ...e, duration: 4 }
          : e,
      ),
    }),
  }),
  make({
    id: "hrl-anthem-sheltering",
    heroId: "herald",
    line: 1,
    ability: "anthem",
    kind: "guard",
    name: "Battle anthem · Sheltering",
    description: "You and an ally deal 30% more damage; they gain 16 Barrier.",
    apply: (a) =>
      after(a, { kind: "status", status: "barrier", stacks: 16, duration: 2 }),
  }),
  make({
    id: "hrl-cadence-marching",
    heroId: "herald",
    line: 2,
    ability: "cadence",
    kind: "force",
    name: "Closing cadence · Triumphal",
    description: "An entire allied row gains 16 Barrier and 30% more damage.",
    apply: (a) =>
      after(a, {
        kind: "status",
        status: "empowered",
        stacks: 1,
        duration: 3,
      }),
  }),
  make({
    id: "hrl-cadence-bulwark",
    heroId: "herald",
    line: 2,
    ability: "cadence",
    kind: "guard",
    name: "Closing cadence · Bulwark",
    description: "Give an entire allied row 28 Barrier.",
    apply: (a) => restack(a, "barrier", 28),
  }),

  // Reaver — every branch decides how much of the cost is paid in blood.
  make({
    id: "rvr-rend-cleaving",
    heroId: "reaver",
    line: 0,
    ability: "rend",
    kind: "force",
    name: "Rend · Cleaving",
    description: "Deal 25, gain 2 Fury and heal yourself 6.",
    apply: (a) => damage(a, 7),
  }),
  make({
    id: "rvr-rend-draining",
    heroId: "reaver",
    line: 0,
    ability: "rend",
    kind: "guard",
    name: "Rend · Draining",
    description: "Deal 18, gain 2 Fury and heal yourself 15.",
    apply: (a) => after(a, selfHeal(9)),
  }),
  make({
    id: "rvr-price-deeper",
    heroId: "reaver",
    line: 1,
    ability: "bloodprice",
    kind: "force",
    name: "Blood price · Deeper",
    description: "Lose 16 HP to deal 50 that ignores armour.",
    apply: (a) => ({
      ...a,
      effects: a.effects.map((e) =>
        e.kind !== "damage"
          ? e
          : e.self
            ? { ...e, amount: 16 }
            : { ...e, amount: 50 },
      ),
    }),
  }),
  make({
    id: "rvr-price-measured",
    heroId: "reaver",
    line: 1,
    ability: "bloodprice",
    kind: "guard",
    name: "Blood price · Measured",
    description: "Lose only 5 HP to deal 30 that ignores armour.",
    apply: (a) => ({
      ...a,
      effects: a.effects.map((e) =>
        e.kind !== "damage"
          ? e
          : e.self
            ? { ...e, amount: 5 }
            : { ...e, amount: 30 },
      ),
    }),
  }),
  make({
    id: "rvr-frenzy-whirlwind",
    heroId: "reaver",
    line: 2,
    ability: "frenzy",
    kind: "force",
    name: "Frenzy · Whirlwind",
    description: "Lose 8 HP and hit an enemy row for 24.",
    apply: (a) => ({
      ...a,
      effects: a.effects.map((e) =>
        e.kind === "damage" && !e.self ? { ...e, amount: 24 } : e,
      ),
    }),
  }),
  make({
    id: "rvr-frenzy-guarded",
    heroId: "reaver",
    line: 2,
    ability: "frenzy",
    kind: "guard",
    name: "Frenzy · Guarded",
    description: "Lose only 4 HP, hit a row for 17 and gain 16 Barrier.",
    apply: (a) => ({
      ...after(a, selfBarrier(16)),
      effects: after(a, selfBarrier(16)).effects.map((e) =>
        e.kind === "damage" && e.self ? { ...e, amount: 4 } : e,
      ),
    }),
  }),

  // Beguiler — sharpen the knife, or make the enemy the problem.
  make({
    id: "bgl-whisper-cruel",
    heroId: "beguiler",
    line: 0,
    ability: "whisper",
    kind: "force",
    name: "Ill whisper · Cruel",
    description: "Deal 20. Gain 1 Sway.",
    apply: (a) => damage(a, 7),
  }),
  make({
    id: "bgl-whisper-leeching",
    heroId: "beguiler",
    line: 0,
    ability: "whisper",
    kind: "guard",
    name: "Ill whisper · Leeching",
    description: "Deal 13, gain 1 Sway and heal yourself 8.",
    apply: (a) => after(a, selfHeal(8)),
  }),
  make({
    id: "bgl-doubt-gnawing",
    heroId: "beguiler",
    line: 1,
    ability: "doubt",
    kind: "force",
    name: "Seed of doubt · Gnawing",
    description: "Deal 18 and leave an enemy Vulnerable.",
    apply: (a) => damage(a, 9),
  }),
  make({
    id: "bgl-doubt-paralysing",
    heroId: "beguiler",
    line: 1,
    ability: "doubt",
    kind: "guard",
    name: "Seed of doubt · Paralysing",
    description:
      "Deal 9, leave an enemy Vulnerable and weaken its attacks by 35%.",
    apply: (a) => after(a, weaken),
  }),
  make({
    id: "bgl-unpick-rend",
    heroId: "beguiler",
    line: 2,
    ability: "unpick",
    kind: "force",
    name: "Unpick the seam · Rending",
    description: "Deal 22 to a row and leave it Vulnerable.",
    apply: (a) => damage(a, 7),
  }),
  make({
    id: "bgl-unpick-unravel",
    heroId: "beguiler",
    line: 2,
    ability: "unpick",
    kind: "guard",
    name: "Unpick the seam · Unravelling",
    description: "Strip the row's Barrier, deal 15 and leave it Vulnerable.",
    apply: (a) => before(a, { kind: "removeStatus", status: "barrier" }),
  }),
];

export const lines = (heroId: string) =>
  Math.max(
    -1,
    ...upgrades.filter((u) => u.heroId === heroId).map((u) => u.line),
  ) + 1;

/** The two branches a hero may choose from next; empty once the tree is spent. */
export function upgradeOffer(p: Pick<Player, "heroId" | "upgrades">) {
  const taken = p.upgrades ?? [];
  return upgrades.filter(
    (u) => u.heroId === p.heroId && u.line === taken.length,
  );
}
export function chosenUpgrades(taken: string[]) {
  return upgrades.filter((u) => taken.includes(u.id));
}
