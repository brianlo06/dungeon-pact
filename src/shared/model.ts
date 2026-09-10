export type Phase =
  | "LOBBY"
  | "PACT"
  | "MAP"
  | "COMBAT"
  | "UPGRADE"
  | "REWARD"
  | "AUCTION"
  | "EVENT"
  | "CAMP"
  | "COMPLETE";
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
  | "guarded"
  | "interrupted";
export type Trigger =
  "roundStart" | "afterAttack" | "afterHeal" | "onHurt" | "onKill";
export type Effect =
  | {
      kind: "damage";
      amount: number;
      damageType?: "physical" | "fire" | "lightning" | "arcane";
      precision?: boolean;
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
  | { kind: "conditional"; status: StatusId; effects: Effect[] };
export interface Ability {
  interruptible?: boolean;
  id: string;
  name: string;
  description: string;
  cost: number;
  speed: number;
  target: "enemy" | "ally" | "self" | "enemyRow";
  effects: Effect[];
  cooldown: number;
}
export interface HeroDef {
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
  id: string;
  name: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  slot: "weapon" | "armor" | "relic";
  tags: string[];
  description: string;
  clue: string;
  cursed: boolean;
  trigger: Trigger;
  effects: Effect[];
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
  heroId: string;
  ready: boolean;
  /** Chosen ability branches. Absent in saves written before upgrades existed. */
  upgrades?: string[];
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
  elite?: "greedy" | "vampiric";
  phase: number;
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
}
export interface MapNode {
  id: string;
  depth: number;
  lane: number;
  type: "combat" | "elite" | "auction" | "mystery" | "event" | "camp" | "boss";
  name: string;
  next: string[];
  visited: boolean;
}
export interface Plan {
  ability: string;
  target: string;
}
export interface Auction {
  itemId: string;
  revealed: boolean;
  price: number;
  active: string[];
  acted: string[];
  stage: "interest" | "bidding" | "approval" | "sold";
  owner?: string;
  approvals: Record<string, boolean>;
  round: number;
}
export interface GameLog {
  seq: number;
  text: string;
  kind: "info" | "damage" | "heal" | "combo" | "gold";
}
export interface RunState {
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
  logs: GameLog[];
  eventSeq: number;
  startedAt: number | null;
  endedAt: number | null;
  outcome: "victory" | "defeat" | null;
  approvalThreshold: number;
  reward: number;
  pact: string | null;
}
export type PublicAuction = Omit<Auction, "itemId"> & {
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
