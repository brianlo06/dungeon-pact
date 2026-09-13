import type {
  Ability,
  ChargeSource,
  Effect,
  Player,
} from "../shared/model";
import type { UltimatePresentation } from "../shared/presentation";

/**
 * Ultimates, and the Pact Charge that pays for them.
 *
 * An Ultimate is the purest version of a kit: not a bigger number, but the
 * thing the class is *for*, pushed past what an ordinary round allows. It is
 * an extra action — queued beside the round's plan, never instead of it — and
 * it resolves before anyone else acts, in the window the player chose it in,
 * so it is aimed at the intentions everyone can see.
 *
 * Every hero has a base Ultimate. A class path that authors one of its own
 * replaces it outright, the way a path replaces a signature ability; a path
 * that has not authored one yet keeps the base (`ultimateFor`). Combat asks
 * this file which Ultimate a hero has and never asks which hero it is.
 *
 * Charge is on one scale for everyone, `ULTIMATE_MAX`, so an evolution changes
 * the move and never the meter: a hero at 80 is still at 80 after training,
 * and a hero who walks into a mentor with a full meter walks out with the new
 * Ultimate ready.
 */

export const ULTIMATE_MAX = 100;

/**
 * Charge per unit of each source, before a class's affinity.
 *
 * Measured, not chosen: see `docs/ULTIMATES.md`, "Charge". The shape matters
 * more than any one number. Every role fills the meter by doing its job —
 * damage by damage, a tank by being hit and by taking hits for others, a
 * healer by healing — and a flat share for acting at all keeps a hero whose
 * job this round was a brace from falling a full Ultimate behind.
 */
export const CHARGE: Record<ChargeSource, number> = {
  action: 4,
  damage: 0.2,
  hurt: 0.3,
  sacrifice: 0.25,
  blocked: 0.2,
  heal: 0.22,
  shield: 0.16,
  intercept: 6,
  interrupt: 8,
  reaction: 5,
  control: 6,
  empower: 5,
  cleanse: 2,
  trade: 0.4,
  setup: 2,
  kill: 6,
  revive: 8,
};

/**
 * What a boss costs in a run that has Ultimates.
 *
 * Ultimates are extra actions, and a party that holds its charge for the boss
 * — which carry-over exists to let it do — arrives with every meter full.
 * Each class's Ultimate alone moved the matrix one to four points; all eight
 * together took it from 89% to 98%, because each removes a share of the
 * losses the others leave. So the boss is priced for them, rather than every
 * Ultimate being cut until none of them matters. Damage is per hero because a
 * bigger party brings more Ultimates to the same fight.
 *
 * Measured in `docs/ULTIMATES.md`, "Balance". Rooms made before Ultimates
 * keep the old boss.
 */
export const BOSS_PRICING = { hp: 1.2, damagePerHero: 2 };

export interface UltimateDef {
  id: string;
  heroId: string;
  /** Set on a class path's Ultimate, which replaces the base one. */
  evolution?: string;
  /** A proper name. Never "Ultimate Slash". */
  name: string;
  /** The promise, in one line. */
  epithet: string;
  description: string;
  /** Who is chosen. Scoped effects decide who is actually touched. */
  target: Ability["target"];
  /** Applied once, to the chosen target; scopes reach everyone else. */
  effects: Effect[];
  /** Pact Charge spent when it resolves. */
  cost: number;
  /** Order among Ultimates in one round, added to the hero's own speed. */
  speed: number;
  presentation: UltimatePresentation;
}

export const ultimates: UltimateDef[] = [
  /* ── Vanguard ─────────────────────────────────────────────────────────── */
  {
    id: "lantern-wall",
    heroId: "vanguard",
    name: "Lantern Wall",
    epithet: "Nothing reaches them. Not this round.",
    description:
      "Plant the guild's lantern: every ally gains 12 Barrier and the Vanguard takes their next direct hit this round. Then charge the target for 20, break its WINDUP and leave it Vulnerable.",
    target: "enemy",
    effects: [
      {
        kind: "allies",
        effects: [
          { kind: "protect", barrier: 6 },
          { kind: "status", status: "barrier", stacks: 12, duration: 2 },
        ],
      },
      { kind: "status", status: "barrier", stacks: 8, duration: 2, self: true },
      { kind: "damage", amount: 20 },
      { kind: "interrupt" },
      { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
      { kind: "resource", amount: 2 },
    ],
    cost: ULTIMATE_MAX,
    speed: 20,
    presentation: {
      cinematic: "lantern-wall",
      theme: "guard",
      accent: "#ffcf6b",
      voice: {
        activation: "Behind me.",
        impact: "Not one step further!",
        after: "Still standing. All of us.",
      },
    },
  },
  {
    id: "gatebreaker",
    heroId: "vanguard",
    evolution: "van-breaker",
    name: "Gatebreaker",
    epithet: "The wall learns to move forward.",
    description:
      "Ride the shield through an enemy row: strip its Barrier, deal 24 through armour, break WINDUPs, drag it into the front line and leave it Vulnerable. The Breaker drops its own guard to do it.",
    target: "enemyRow",
    effects: [
      {
        kind: "enemies",
        row: true,
        effects: [
          { kind: "removeStatus", status: "barrier" },
          { kind: "damage", amount: 24, pierce: true },
          { kind: "interrupt" },
          { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
          { kind: "move", row: "front" },
        ],
      },
      { kind: "status", status: "vulnerable", stacks: 1, duration: 1, self: true },
      { kind: "resource", amount: 3 },
    ],
    cost: ULTIMATE_MAX,
    speed: 14,
    presentation: {
      cinematic: "gatebreaker",
      theme: "foundry",
      accent: "#ff6a3a",
      voice: {
        activation: "Open it.",
        impact: "BREACH!",
        after: "Walls were only ever doors.",
      },
    },
  },

  /* ── The rest of the roster: gameplay designed, cinematic still generic ── */
  {
    id: "debt-of-thunder",
    heroId: "arcanist",
    name: "Debt of Thunder",
    epithet: "Borrow the storm. Pay it back all at once.",
    description:
      "Drown every enemy in Wet, then call a 26 lightning strike on the target that sets off Chain Shock — and leaves the rest soaked for whoever follows.",
    target: "enemy",
    effects: [
      {
        kind: "enemies",
        effects: [{ kind: "status", status: "wet", stacks: 1, duration: 3 }],
      },
      { kind: "damage", amount: 26, damageType: "lightning" },
      { kind: "resource", amount: 3 },
    ],
    cost: ULTIMATE_MAX,
    speed: 10,
    presentation: { theme: "arcane", accent: "#8fd3ff" },
  },
  {
    id: "hundredth-mark",
    heroId: "ranger",
    name: "The Hundredth Mark",
    epithet: "Every one of them, marked. This one, finished.",
    description:
      "Mark every enemy, then loose a precision shot for 24 that ignores armour and cashes in the target's Mark. The others stay Marked for the party.",
    target: "enemy",
    effects: [
      {
        kind: "enemies",
        effects: [{ kind: "status", status: "marked", stacks: 1, duration: 3 }],
      },
      { kind: "damage", amount: 24, precision: true, pierce: true },
      { kind: "resource", amount: 2 },
    ],
    cost: ULTIMATE_MAX,
    speed: 16,
    presentation: { theme: "precision", accent: "#c7f08a" },
  },
  {
    id: "green-reckoning",
    heroId: "warden",
    name: "Green Reckoning",
    epithet: "Nothing living is beyond hope. Nothing dead stays comfortable.",
    description:
      "Every ally — the downed included — is healed 18, regenerates and is cleared of Burn, Poison and Weak. Every enemy is poisoned for 4 a round.",
    target: "self",
    effects: [
      {
        kind: "allies",
        self: true,
        downed: true,
        effects: [
          { kind: "heal", amount: 18 },
          { kind: "status", status: "regen", stacks: 3, duration: 3 },
          { kind: "removeStatus", status: "burn" },
          { kind: "removeStatus", status: "poison" },
          { kind: "removeStatus", status: "weak" },
        ],
      },
      {
        kind: "enemies",
        effects: [{ kind: "status", status: "poison", stacks: 4, duration: 3 }],
      },
    ],
    cost: ULTIMATE_MAX,
    speed: 12,
    presentation: { theme: "growth", accent: "#9be38a" },
  },
  {
    id: "foreclosure",
    heroId: "broker",
    name: "Foreclosure",
    epithet: "Collateral is whatever you were standing behind.",
    description:
      "Seize the target's Barrier, hit it for 26 and leave it Vulnerable. The proceeds — 30 team gold — underwrite 8 Barrier for every ally.",
    target: "enemy",
    effects: [
      { kind: "removeStatus", status: "barrier" },
      { kind: "damage", amount: 26 },
      { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
      { kind: "gold", amount: 30 },
      {
        kind: "allies",
        self: true,
        effects: [{ kind: "status", status: "barrier", stacks: 8, duration: 2 }],
      },
    ],
    cost: ULTIMATE_MAX,
    speed: 10,
    presentation: { theme: "contract", accent: "#f3d487" },
  },
  {
    id: "anthem-of-the-unpaid",
    heroId: "herald",
    name: "Anthem of the Unpaid",
    epithet: "Every voice in the pact, at once.",
    description:
      "The whole party hits 30% harder this round and the next, gains 8 Barrier and shakes off Weak and Vulnerable.",
    target: "self",
    effects: [
      {
        kind: "allies",
        self: true,
        effects: [
          { kind: "status", status: "empowered", stacks: 1, duration: 2 },
          { kind: "status", status: "barrier", stacks: 8, duration: 2 },
          { kind: "removeStatus", status: "weak" },
          { kind: "removeStatus", status: "vulnerable" },
        ],
      },
    ],
    cost: ULTIMATE_MAX,
    speed: 18,
    presentation: { theme: "resonance", accent: "#ffb3d1" },
  },
  {
    id: "red-ledger",
    heroId: "reaver",
    name: "Red Ledger",
    epithet: "Pay in full. Collect in full.",
    description:
      "Lose 14 HP to deal 40 through armour, and tear everything else in the target's row for 12.",
    target: "enemy",
    effects: [
      { kind: "damage", amount: 14, self: true },
      { kind: "damage", amount: 40, pierce: true },
      {
        kind: "enemies",
        row: true,
        others: true,
        effects: [{ kind: "damage", amount: 12 }],
      },
      { kind: "resource", amount: 3 },
    ],
    cost: ULTIMATE_MAX,
    speed: 8,
    presentation: { theme: "blood", accent: "#ff4d5e" },
  },
  {
    id: "hall-of-mirrors",
    heroId: "beguiler",
    name: "Hall of Mirrors",
    epithet: "Which of you is real? None of you, now.",
    description:
      "Every enemy strikes its own side this round. The target takes 14 arcane as the glass breaks.",
    target: "enemy",
    effects: [
      {
        kind: "enemies",
        effects: [
          { kind: "status", status: "confused", stacks: 1, duration: 1 },
        ],
      },
      { kind: "damage", amount: 14, damageType: "arcane" },
    ],
    cost: ULTIMATE_MAX,
    speed: 20,
    presentation: { theme: "sway", accent: "#c9a3ff" },
  },
];

/**
 * A hero's Ultimate: its path's, if the path has authored one, else its
 * class's. Never keyed on anything but content.
 */
export function ultimateFor(
  p: Pick<Player, "heroId" | "evolution">,
): UltimateDef | undefined {
  return (
    ultimates.find(
      (u) => u.heroId === p.heroId && !!p.evolution && u.evolution === p.evolution,
    ) ?? ultimates.find((u) => u.heroId === p.heroId && !u.evolution)
  );
}

export const ultimate = (id?: string) =>
  id ? ultimates.find((u) => u.id === id) : undefined;

/** A hero's Pact Charge as a fraction of full, for anything drawing a meter. */
export const chargeShare = (p: Pick<Player, "ultimateCharge">) =>
  Math.max(0, Math.min(1, (p.ultimateCharge ?? 0) / ULTIMATE_MAX));

/** Every effect in a list, scopes and conditionals opened up. */
export function flattenEffects(list: Effect[]): Effect[] {
  return list.flatMap((e) =>
    e.kind === "allies" || e.kind === "enemies" || e.kind === "conditional"
      ? [e, ...flattenEffects(e.effects)]
      : [e],
  );
}
