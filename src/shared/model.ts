export type Phase =
  | "LOBBY"
  | "PACT"
  | "MAP"
  | "COMBAT"
  | "MENTOR"
  | "UPGRADE"
  | "REWARD"
  | "AUCTION"
  | "SHOP"
  | "EVENT"
  | "CAMP"
  | "COMPLETE";
import type { AbilityPresentation, UnitPresentation } from "./presentation";
export type Row = "front" | "back";
export type StatusId =
  | "burn"
  | "wet"
  | "marked"
  | "barrier"
  | "regen"
  | "vulnerable"
  | "poison"
  | "weak"
  | "empowered"
  | "confused"
  | "guarded"
  | "interrupted";
export type Trigger =
  | "roundStart"
  | "afterAttack"
  | "afterHeal"
  | "onHurt"
  | "onKill"
  /** Never fired by the trigger loop: a supply is spent by being used. */
  | "use";
export type Effect =
  | {
      kind: "damage";
      amount: number;
      damageType?: "physical" | "fire" | "lightning" | "arcane";
      precision?: boolean;
      /** Pays the cost yourself: the actor takes the hit instead of the target. */
      self?: boolean;
      /** Ignores Guard entirely. */
      pierce?: boolean;
    }
  | { kind: "protect"; barrier: number }
  | { kind: "interrupt" }
  | { kind: "removeStatus"; status: StatusId }
  /** `self` sends the effect back to the actor, so an attack can also sustain. */
  | { kind: "heal"; amount: number; self?: boolean }
  | {
      kind: "status";
      status: StatusId;
      stacks: number;
      duration: number;
      self?: boolean;
    }
  | { kind: "resource"; amount: number }
  | { kind: "move"; row: Row }
  | { kind: "gold"; amount: number }
  /**
   * Takes carried equipment off the target and banks it in a strongbox. The
   * owner loses the item's triggers until the strongbox is broken open.
   */
  | { kind: "seize"; count: number }
  /**
   * Barrier for the actor worth one point per `per` gold the treasury holds
   * above `free`. The allowance matters: a party that spent its money is
   * carrying a working balance, not a hoard, and should not be taxed for it.
   */
  | { kind: "bank"; per: number; free: number }
  | { kind: "conditional"; status: StatusId; effects: Effect[] }
  /**
   * Scopes, so one action can reach past its own target: every standing ally
   * (optionally the actor, optionally the downed but not yet fallen), or every
   * living enemy (optionally only the target's row, optionally not the target).
   * Written for Ultimates, which are the purest version of a kit and rarely
   * touch only one unit, but nothing about them is Ultimate-specific.
   */
  | { kind: "allies"; effects: Effect[]; self?: boolean; downed?: boolean }
  | { kind: "enemies"; effects: Effect[]; row?: boolean; others?: boolean };
export interface Ability {
  reach?: "melee" | "reach" | "ranged";
  /** How this action looks. Never how it resolves. */
  presentation?: AbilityPresentation;
  interruptible?: boolean;
  id: string;
  name: string;
  description: string;
  cost: number;
  speed: number;
  target: "enemy" | "ally" | "self" | "enemyRow" | "allyRow";
  effects: Effect[];
  cooldown: number;
}
export interface HeroDef {
  presentation?: UnitPresentation;
  id: string;
  name: string;
  title: string;
  description: string;
  glyph: string;
  hp: number;
  power: number;
  guard: number;
  speed: number;
  resource: string;
  maxResource: number;
  abilities: Ability[];
  /**
   * How this class earns Pact Charge beyond the shared baseline: multipliers
   * on named charge sources. Content, so the engine never asks which hero
   * this is. See `content/ultimates.ts`.
   */
  chargeAffinity?: Partial<Record<ChargeSource, number>>;
}
/** Everything that fills Pact Charge. The rates live in `content/ultimates.ts`. */
export type ChargeSource =
  /** Resolving any action at all. */
  | "action"
  /** Health taken off an enemy. */
  | "damage"
  /** Health lost to an enemy. */
  | "hurt"
  /** Health paid on purpose: a blood cost. */
  | "sacrifice"
  /** An enemy hit absorbed by Barrier. */
  | "blocked"
  /** Health restored to anyone. */
  | "heal"
  /** Barrier given to another hero. */
  | "shield"
  /** Taking an ally's hit through a guard link. */
  | "intercept"
  | "interrupt"
  /** EXPLOIT or CHAIN SHOCK, set off by this hero. */
  | "reaction"
  /** An enemy this hero confused striking its own side. */
  | "control"
  /** Empowering another hero. */
  | "empower"
  /** An affliction stripped from an ally, or Barrier stripped from an enemy. */
  | "cleanse"
  /** Treasury moved by this hero's own action, per 10 gold. */
  | "trade"
  /** Marking, soaking or exposing an enemy for someone else. */
  | "setup"
  | "kill"
  | "revive";
export interface ItemDef {
  visual?: import("./equipment").EquipmentVisual;
  id: string;
  name: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  /**
   * A supply is carried rather than worn: several fit at once, none replaces
   * anything, and using one spends it. Everything else occupies its slot.
   */
  slot: "weapon" | "armor" | "relic" | "supply";
  tags: string[];
  description: string;
  clue: string;
  cursed: boolean;
  trigger: Trigger;
  /** Passive effects fired by `trigger`. Empty for a supply. */
  effects: Effect[];
  /** The action carrying a supply grants. Absent on worn equipment. */
  use?: Ability;
  target: "self" | "target";
  price: number;
}
export interface Status {
  sourceId?: string;
  id: StatusId;
  stacks: number;
  duration: number;
}
export interface Unit {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  power: number;
  guard: number;
  speed: number;
  row: Row;
  statuses: Status[];
}
export interface Player extends Unit {
  spiritRound?: number;
  heroId: string;
  ready: boolean;
  /** Chosen ability branches. Absent in saves written before upgrades existed. */
  upgrades?: string[];
  /** Chosen class path. A hero evolves at most once per run. */
  evolution?: string;
  resource: number;
  /**
   * Pact Charge, 0 to `ULTIMATE_MAX`. Always on that scale whatever the
   * Ultimate costs, so an evolution changes the move and never the meter.
   * Absent in saves written before Ultimates existed, which read as empty.
   */
  ultimateCharge?: number;
  items: string[];
  cooldowns: Record<string, number>;
  downedRounds: number;
  fallen: boolean;
  spent: number;
  damage: number;
  healing: number;
  revives: number;
}
export interface Enemy extends Unit {
  definition: string;
  intent: { ability: Ability; target: string; row?: Row };
  elite?: "greedy" | "vampiric" | "sapping" | "armored";
  phase: number;
  /** Equipment this unit is holding hostage, returned when it is destroyed. */
  holding?: { playerId: string; itemId: string }[];
}
export interface EnemyDef {
  id: string;
  name: string;
  glyph: string;
  hp: number;
  power: number;
  guard: number;
  speed: number;
  row: Row;
  abilities: Ability[];
  boss?: boolean;
  /**
   * A container, not a combatant: never drawn into an encounter, and standing
   * one does not keep a chamber from falling silent. Breaking it is a choice.
   */
  object?: boolean;
  /** The boss's stated objective, shown before the first round. */
  objective?: string;
  /** Title-card subtitle. Flavour; nothing reads it but the entrance. */
  epithet?: string;
  /**
   * How this creature looks and moves. The presentation layer must learn size,
   * rig and effect family from here rather than from the id — "large because
   * its id is collector" is exactly the coupling this removes.
   */
  presentation?: UnitPresentation;
}
export interface MapNode {
  biome?: "foundry" | "cistern" | "archive";
  id: string;
  depth: number;
  lane: number;
  type:
    | "combat"
    | "elite"
    | "auction"
    | "mystery"
    | "event"
    | "camp"
    | "mentor"
    | "boss";
  name: string;
  next: string[];
  visited: boolean;
}
export interface Plan {
  ability: string;
  target: string;
}
/** A queued Ultimate. It is an extra action: it never replaces the plan. */
export interface UltimatePlan {
  target: string;
}
export interface Auction {
  mode?: "ascending" | "descending";
  floor?: number;
  itemId: string;
  revealed: boolean;
  price: number;
  active: string[];
  acted: string[];
  stage: "interest" | "bidding" | "approval" | "sold";
  owner?: string;
  approvals: Record<string, boolean>;
  round: number;
  /** Position in this exchange's sequence of lots. Absent in single-lot saves. */
  lot?: number;
  lots?: number;
  mystery?: boolean;
  /** Item ids already offered here, so one exchange never repeats a lot.
   * Never sent to clients: it would name a concealed lot. */
  offered?: string[];
}
/**
 * A structured moment inside a resolved round. The chronicle already narrated
 * combat in prose; beats let the client replay it as timed animation with
 * accurate health, instead of snapping straight to the settled state.
 */
export interface Beat {
  equipment?: import("./equipment").EquipmentCue[];
  kind:
    | "cast"
    | "damage"
    | "heal"
    | "block"
    | "combo"
    | "defeat"
    | "equipment"
    /** Barrier granted. Only an Ultimate reports it; ordinary replays never see one. */
    | "ward";
  /**
   * On a `cast`: the Ultimate being performed, by content id. The client
   * looks its cinematic up from content; nothing branches on the id itself.
   */
  ultimate?: string;
  actor?: string;
  target?: string;
  label?: string;
  amount?: number;
  /** The target's health after this beat, so playback can animate bars. */
  hp?: number;
}
export interface GameLog {
  seq: number;
  text: string;
  kind: "info" | "damage" | "heal" | "combo" | "gold";
  beat?: Beat;
}
export interface RunState {
  shop?: {
    stock: string[];
    sold: string[];
    sequence: number;
    leaving: string[];
    proposal?: {
      item: string;
      recipient: string;
      price: number;
      votes: Record<string, boolean>;
    };
  };
  roundSummary?: {
    round: number;
    damage: number;
    healing: number;
    blocked: number;
    triggers: number;
    downs: string[];
  };
  expeditionVersion?: 1;
  reachVersion?: 1;
  teamRelics?: string[];
  serviceVote?: { id: string; votes: Record<string, boolean> };
  trades?: {
    from: string;
    to: string;
    item: string;
    returnItem?: string;
    node: string | null;
  }[];
  /** Missing means legacy random formations; new rooms use authored v2 packs. */
  encounterVersion?: 2;
  combatVersion?: 2;
  /**
   * Missing means a room created before Ultimates: nobody earns Pact Charge
   * and nobody may queue one, so an old save plays exactly as it did.
   */
  ultimateVersion?: 1;
  /** Ultimates queued this round, by player. Hidden like plans. */
  ultimates?: Record<string, UltimatePlan>;
  /** Battlefield revivals already bought this run; each one raises the price. */
  revivals?: number;
  schemaVersion: 1;
  contentVersion: 1;
  room: string;
  phase: Phase;
  revision: number;
  seed: string;
  rng: number;
  players: Player[];
  gold: number;
  earned: number;
  spent: number;
  map: MapNode[];
  currentNode: string | null;
  votes: Record<string, string>;
  tieCursor: number;
  enemies: Enemy[];
  plans: Record<string, Plan>;
  round: number;
  auction: Auction | null;
  eventId: string | null;
  /** Mentor currently teaching, and who has already answered them. */
  mentorId?: string | null;
  /**
   * The one class this training ground will evolve, drawn from the party when
   * the chamber is entered. Everyone else may drill for stats instead.
   * `undefined` means a room that entered its mentor before the rule existed,
   * where every class could still take a path; `null` means this ground has
   * nobody to teach.
   */
  mentorClass?: string | null;
  trained?: string[];
  logs: GameLog[];
  eventSeq: number;
  startedAt: number | null;
  endedAt: number | null;
  outcome: "victory" | "defeat" | null;
  approvalThreshold: number;
  reward: number;
  pact: string | null;
}
export type PublicAuction = Omit<Auction, "itemId" | "offered"> & {
  item: Partial<ItemDef>;
};
export interface Snapshot extends Omit<
  RunState,
  "seed" | "rng" | "auction" | "plans" | "ultimates"
> {
  /** Who has an Ultimate queued this round. Their targets stay private. */
  ultimateQueued?: string[];
  myUltimate?: UltimatePlan;
  seed?: string;
  auction: PublicAuction | null;
  locked: string[];
  myPlan?: Plan;
  connected: string[];
  you: string;
}
