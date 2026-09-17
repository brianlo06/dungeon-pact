import type {
  Ability,
  ChargeSource,
  Effect,
  Player,
} from "../shared/model";
import type { UltimatePresentation } from "../shared/presentation";
import { ultimate as vanguard } from "./ultimate-defs/vanguard";
import { ultimate as arcanist } from "./ultimate-defs/arcanist";
import { ultimate as ranger } from "./ultimate-defs/ranger";
import { ultimate as warden } from "./ultimate-defs/warden";
import { ultimate as broker } from "./ultimate-defs/broker";
import { ultimate as herald } from "./ultimate-defs/herald";
import { ultimate as reaver } from "./ultimate-defs/reaver";
import { ultimate as beguiler } from "./ultimate-defs/beguiler";
import { ultimate as vanBreaker } from "./ultimate-defs/van-breaker";
import { ultimate as vanAegis } from "./ultimate-defs/van-aegis";
import { ultimate as vanWarlord } from "./ultimate-defs/van-warlord";
import { ultimate as arcPyromancer } from "./ultimate-defs/arc-pyromancer";
import { ultimate as arcTidecaller } from "./ultimate-defs/arc-tidecaller";
import { ultimate as arcChronomancer } from "./ultimate-defs/arc-chronomancer";
import { ultimate as rngSharpshooter } from "./ultimate-defs/rng-sharpshooter";
import { ultimate as rngPathfinder } from "./ultimate-defs/rng-pathfinder";
import { ultimate as rngGloomstalker } from "./ultimate-defs/rng-gloomstalker";
import { ultimate as warBlightcaller } from "./ultimate-defs/war-blightcaller";
import { ultimate as warLifebinder } from "./ultimate-defs/war-lifebinder";
import { ultimate as warHollow } from "./ultimate-defs/war-hollow";
import { ultimate as brkMagnate } from "./ultimate-defs/brk-magnate";
import { ultimate as brkAssurer } from "./ultimate-defs/brk-assurer";
import { ultimate as brkUsurer } from "./ultimate-defs/brk-usurer";
import { ultimate as hrlWarcaller } from "./ultimate-defs/hrl-warcaller";
import { ultimate as hrlSanctifier } from "./ultimate-defs/hrl-sanctifier";
import { ultimate as hrlDirgesinger } from "./ultimate-defs/hrl-dirgesinger";
import { ultimate as rvrButcher } from "./ultimate-defs/rvr-butcher";
import { ultimate as rvrIronhide } from "./ultimate-defs/rvr-ironhide";
import { ultimate as rvrBloodbound } from "./ultimate-defs/rvr-bloodbound";
import { ultimate as bglMindflayer } from "./ultimate-defs/bgl-mindflayer";
import { ultimate as bglIllusionist } from "./ultimate-defs/bgl-illusionist";
import { ultimate as bglPuppeteer } from "./ultimate-defs/bgl-puppeteer";

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
 * Each Ultimate is defined in its own file in `ultimate-defs/` — the class's
 * under the hero's id, a path's under the path's id, `null` until authored —
 * so authoring one never edits a file another Ultimate shares. The imports
 * are explicit, not globbed, because the room server bundles this.
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
 * Measured, not chosen: see `docs/ULTIMATES.md`, "Balance". The shape matters
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
  /** Pact Charge spent when it resolves (100, the whole meter). */
  cost: number;
  /** Order among Ultimates in one round, added to the hero's own speed. */
  speed: number;
  presentation: UltimatePresentation;
}

export const ultimates: UltimateDef[] = [
  vanguard,
  arcanist,
  ranger,
  warden,
  broker,
  herald,
  reaver,
  beguiler,
  vanBreaker,
  vanAegis,
  vanWarlord,
  arcPyromancer,
  arcTidecaller,
  arcChronomancer,
  rngSharpshooter,
  rngPathfinder,
  rngGloomstalker,
  warBlightcaller,
  warLifebinder,
  warHollow,
  brkMagnate,
  brkAssurer,
  brkUsurer,
  hrlWarcaller,
  hrlSanctifier,
  hrlDirgesinger,
  rvrButcher,
  rvrIronhide,
  rvrBloodbound,
  bglMindflayer,
  bglIllusionist,
  bglPuppeteer,
].filter((u): u is UltimateDef => !!u);

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
