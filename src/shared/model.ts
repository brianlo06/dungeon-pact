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
  | "TOLL"
  | "SHRINE"
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
  | "interrupted"
  /** A crucible's charge: what a pour is building to. Shown, never read by damage. */
  | "heat"
  /** Hardened plates: every hit this unit makes is heavier by 3 a stack. */
  | "encrusted"
  /**
   * A debt served on this unit: it detonates for its stacks when it runs out,
   * or at once when the other side lands a direct hit on its carrier.
   */
  | "lien"
  /**
   * A crucible, a boiler, a tank: pressure a unit is building towards a
   * release. Shown on the unit and read by conditions and scaled damage;
   * nothing about it acts on its own.
   */
  | "pressure"
  /**
   * An entry in a ledger: when it runs out the pact pays its stacks in gold,
   * and whatever the treasury cannot cover the carrier takes as damage. Written
   * off if the enemy that entered it falls first.
   */
  | "debt";
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
      /**
       * Heavier for what the actor has stored: `per` more for every stack of
       * `status` it carries when the hit lands. A vent that releases pressure.
       */
      scale?: { status: StatusId; per: number };
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
      /**
       * The status is the actor's to keep up: it is lifted from everyone
       * carrying it the moment the actor falls. A ledger entry written off.
       */
      tether?: boolean;
    }
  | { kind: "resource"; amount: number }
  /**
   * Changes a row: the target's, or with `self` the actor's own. `swap` sends
   * it to whichever row it is not in.
   */
  | { kind: "move"; row: Row | "swap"; self?: boolean }
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
  /** Moves a status the actor carries onto the target, whole. */
  | { kind: "transfer"; status: StatusId }
  /**
   * Brings objects into the fight on the actor's side, one per listed row, each
   * belonging to the actor. With a `fuse` each object's intent counts down that
   * many rounds and then does what its definition's `clock` says. Nothing is
   * spawned while the actor still has objects of this kind standing.
   */
  | {
      kind: "spawn";
      object: string;
      rows: Row[];
      fuse?: number;
      /**
       * Where the object goes and whom it answers to. `actor` (the default):
       * one per listed row, belonging to the actor. `target`: one, in the
       * target's row — belonging to the target when it is an ally (a plate on
       * a friend), or bound to it when it is a hero (a seal with their name on
       * it), in which case it still belongs to the actor.
       */
      on?: "actor" | "target";
    }
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
  /** Aimed only at a downed ally: a revival. The engine refuses anyone standing. */
  revive?: boolean;
  /**
   * A move that breaks under enough damage rather than to an interrupt: if the
   * enemy announcing it takes `per` × heroes damage before it acts this round
   * (half that while it is Wet), the move is lost and `effects` land on the
   * enemy itself. The Assayer's pour.
   */
  cracks?: { per: number; effects: Effect[] };
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
  /** Never stocked by a shop: found only where the content hands it out. */
  unsold?: boolean;
}
export interface Status {
  sourceId?: string;
  /** Lifted from its carrier when the unit named by `sourceId` falls. */
  tethered?: boolean;
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
  /**
   * Whether the player has picked a hero themselves. Everyone joins holding
   * the Vanguard, so the table only shows a pick once one has been made.
   * Absent in rooms created before the lobby showed picks.
   */
  chosen?: boolean;
  ready: boolean;
  /** Chosen ability branches. Absent in saves written before upgrades existed. */
  upgrades?: string[];
  /** Chosen class path. A hero evolves at most once per run. */
  evolution?: string;
  /** Worn items this hero has had reforged at a workbench, by item id. */
  reforged?: string[];
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
  /** The enemy that spawned this object, whose `broken` effects answer for it. */
  owner?: string;
  /** A spawned object's countdown: the round it arrived and how long it runs. */
  fuse?: { at: number; rounds: number };
  /** An object whose countdown ran out and did what it was for; not broken. */
  spent?: boolean;
  /** Damage taken since this round's intents were announced: what cracks a move. */
  taken?: number;
  /** A spawned object with a hero's name on it: its due move is aimed at them. */
  bound?: string;
  /**
   * Why this intent was chosen, when a rule chose it for a reason the party
   * can see: "Ada is Wet", "Iron Bulwark is below half". Shown on the chip.
   */
  why?: string;
}
/**
 * Something about the fight an enemy's intent rule can ask before it commits.
 * Every condition is a question about state the whole party can see, so an
 * intent that depends on one is still fully visible once it is announced.
 */
export type IntentCondition =
  /** Some standing hero carries the status. */
  | { kind: "heroHas"; status: StatusId }
  /** The actor carries at least `atLeast` (default 1) stacks of the status. */
  | { kind: "selfHas"; status: StatusId; atLeast?: number }
  /** The actor is below this fraction of its health. */
  | { kind: "selfBelow"; fraction: number }
  /** Another living, non-object enemy carries the status. */
  | { kind: "allyHas"; status: StatusId }
  /** Another living, non-object enemy is below this fraction of its health. */
  | { kind: "allyBelow"; fraction: number }
  /** How many living non-object enemies (the actor included) stand in a row. */
  | { kind: "alliesInRow"; row: Row; atMost?: number; atLeast?: number }
  /** How many standing heroes stand in a row. */
  | { kind: "heroesInRow"; row: Row; atMost?: number; atLeast?: number }
  /** The treasury holds at least this much gold. */
  | { kind: "treasury"; atLeast: number }
  /** None of the listed conditions holds. */
  | { kind: "not"; condition: IntentCondition };
/**
 * Which units an intent may be aimed at, and in what order. Every field is a
 * filter the candidates must pass; `order` picks among the survivors. With no
 * `order` the dice choose, as they always have.
 */
export interface TargetFilter {
  has?: StatusId;
  lacks?: StatusId;
  row?: Row;
  /** Below this fraction of health. */
  below?: number;
  /** At or above this fraction of health. */
  atLeast?: number;
  /** For an ally-aimed move: include the actor itself (default no). */
  self?: boolean;
  /** For an ally-aimed move: objects only (true) or never objects (false). */
  objects?: boolean;
  /** For an ally-aimed move: only an ally that is not yet hosting this object. */
  unhosted?: string;
  /** For a bound object's move: the hero whose name is on it. */
  bound?: boolean;
  order?: "lowestHp" | "highestHp" | "lowestFraction" | "highestGuard";
}
/**
 * One way an enemy can spend a round: a move, the conditions under which it
 * is on the table, and whom it may be aimed at. A rule whose conditions fail,
 * or that has nobody it may be aimed at, is passed over.
 */
export interface IntentRule {
  ability: Ability;
  when?: IntentCondition[];
  target?: TargetFilter;
  /** For a weighted step: how often, relative to the others that apply. */
  weight?: number;
  /**
   * Said on the chip when this rule is chosen, with `{target}` standing for
   * the unit it is aimed at: "{target} is Wet".
   */
  why?: string;
}
/**
 * One slot of an enemy's pattern. The first rule that applies is chosen, or
 * with `weighted` the seeded dice choose among every rule that applies.
 */
export interface IntentStep {
  rules: IntentRule[];
  weighted?: boolean;
}
/**
 * How an enemy chooses what to do. `steps` repeat in order, one a round — a
 * single step is a pure priority list, two plain steps are the old rotation.
 * `below` swaps in a second pattern once the enemy drops under a fraction of
 * its health.
 */
export interface Behavior {
  steps: IntentStep[];
  below?: { fraction: number; steps: IntentStep[] };
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
  /** A boss's chamber, as the map names it. */
  lair?: string;
  /**
   * Whom a boss aims at, when it is not the row it prefers: `wealthiest` is
   * the hero who has spent the most gold, first. The Collector's.
   */
  targets?: "wealthiest" | "indebted";
  /**
   * Extra damage on every hit for each so much gold the treasury holds: the
   * current rules, and the rate a room before combat v2 kept. The Miser's.
   */
  hoard?: { per: number; legacyPer: number };
  /**
   * A spawned object's clock: the intent it shows while its fuse runs, with
   * the rounds left appended to the name, and the one it takes when the fuse
   * is out. The object is spent once that has resolved.
   */
  clock?: { waiting: Ability; due: Ability };
  /**
   * What breaking a spawned object does to its owner: every time one breaks,
   * and once more when the last of a batch breaks before any was spent.
   */
  broken?: { each: Effect[]; all?: Effect[] };
  /**
   * What a spawner does instead of spawning while its objects still stand, so
   * its rotation never offers a move that would do nothing.
   */
  busy?: Ability;
  /**
   * How it chooses its intent in a room with factions. When present it
   * replaces `tacticalIntents`; see `IntentStep`.
   */
  behavior?: Behavior;
  /**
   * The row it aims at when a move names no row of its own: `front` (the
   * default) or `back`. A move's `TargetFilter.row` overrides it.
   */
  prefers?: Row;
  /** The region a creature belongs to, for encounter pools and the codex. */
  faction?: "foundry" | "cistern" | "archive";
  /** Design roles, for analysis and tooling only; nothing in combat reads them. */
  roles?: string[];
  /** Appears only in elite chambers, never in an ordinary encounter. */
  eliteOnly?: boolean;
  /** Statuses it enters the fight carrying: a boiler that starts warm. */
  starts?: { status: StatusId; stacks: number; duration: number }[];
  /** An object that falls with the enemy that owns it: a seal its scribe holds. */
  tethered?: boolean;
  /**
   * How this creature looks and moves. The presentation layer must learn size,
   * rig and effect family from here rather than from the id — "large because
   * its id is collector" is exactly the coupling this removes.
   */
  presentation?: UnitPresentation;
}
export interface MapNode {
  biome?: "foundry" | "cistern" | "archive";
  /**
   * The boss waiting in a boss chamber, drawn when the floor is built so the
   * room's name, the fight and every client agree. Missing on older maps,
   * whose floors had fixed bosses.
   */
  boss?: string;
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
    | "boss"
    /** Pay the keepers or fight through them. */
    | "toll"
    /** A fight in a room that acts on its own schedule. */
    | "hazard"
    /** A permanent bargain one hero may strike. */
    | "shrine"
    /** Reforge gear the party already carries. */
    | "forge";
  name: string;
  /**
   * The tier of mentor a training chamber holds, fixed when the floor is
   * built. A legacy map leaves it out and reads the tier from depth.
   */
  tier?: 1 | 2 | 3;
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
    /** A gear shop sells stock; a workbench reforges what the party carries. */
    kind?: "shop" | "forge";
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
  /**
   * Missing means a room created before boss pools: two floors, the Collector
   * then the Miser, and no extra draw from the dice. `1` is three floors, each
   * drawing its boss from `floors` in `content/floors.ts`.
   */
  bossVersion?: 1;
  /**
   * Missing means a room created before open training: each training ground
   * draws one class from the party to evolve, and everyone else may only
   * drill. `1` lets every hero in a party of three or four who has not yet
   * taken a path take theirs at any training ground, each paying tuition; a
   * duo keeps one class a ground.
   */
  trainingVersion?: 1;
  /**
   * Missing means a room created before factions: every floor draws from the
   * foundry creatures' encounters. `1` gives the Cistern and the Archive their
   * own creatures and encounters, chosen along each floor's complexity curve.
   */
  factionVersion?: 1;
  /** Encounters this run has already fought, so a floor does not repeat itself. */
  fought?: string[];
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
  /** Events this run has already drawn, so a floor does not repeat one. */
  eventsSeen?: string[];
  /**
   * A chance event in progress: the last roll the party is looking at, and for
   * press-your-luck events how far they have pushed it. Absent between events
   * and throughout a fixed event.
   */
  luck?: {
    /** The choice that started the roll. */
    choice: string;
    /** Tries made so far. Part of the decision epoch. */
    step: number;
    /** The last d100, 1–100. */
    roll?: number;
    /** The outcome the last roll landed on; absent for a dig that found nothing. */
    outcome?: string;
    /** When every hero rolled for themselves: each hero's roll and result. */
    heroes?: Record<string, { roll: number; outcome: string }>;
    /** Loot a search has turned up, by outcome id. */
    found?: string[];
    /** Nothing is left to vote on; continuing leaves the chamber. */
    done?: boolean;
    /** The roll ended in a fight, which starts when the party continues. */
    fight?: "combat" | "elite";
  };
  /** The price the keepers of a toll gate are asking. */
  toll?: number;
  /** What the room is doing to everyone in it, for a hazard chamber's fight. */
  hazard?: "vents" | "collapse";
  /** An altar's state: who struck its bargain, and who has answered it. */
  shrine?: { taken: string | null; answered: string[] };
  /**
   * Which floor of the run the party is on, from 1. `undefined` is a run that
   * began before floors existed: one seven-chamber route and a single boss.
   */
  floor?: number;
  /** Mentor currently teaching, and who has already answered them. */
  mentorId?: string | null;
  /**
   * The one class this training ground will evolve, drawn from the party when
   * the chamber is entered. Everyone else may drill for stats instead.
   * `undefined` means open teaching, where every class may take a path: a
   * room with `trainingVersion`, or one that entered its mentor before the
   * one-class rule existed. `null` means this ground has nobody to teach.
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
