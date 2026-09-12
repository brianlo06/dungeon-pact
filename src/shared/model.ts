export type Phase =
  | "LOBBY"
  | "PACT"
  | "MAP"
  | "COMBAT"
  | "MENTOR"
  | "UPGRADE"
  | "REWARD"
  | "AUCTION"
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
  | { kind: "conditional"; status: StatusId; effects: Effect[] };
export interface Ability {
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
}
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
  intent: { ability: Ability; target: string };
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
  kind: "cast" | "damage" | "heal" | "block" | "combo" | "defeat" | "equipment";
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
  roundSummary?: {
    round: number;
    damage: number;
    healing: number;
    blocked: number;
    triggers: number;
    downs: string[];
  };
  expeditionVersion?: 1;
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
  "seed" | "rng" | "auction" | "plans"
> {
  seed?: string;
  auction: PublicAuction | null;
  locked: string[];
  myPlan?: Plan;
  connected: string[];
  you: string;
}
