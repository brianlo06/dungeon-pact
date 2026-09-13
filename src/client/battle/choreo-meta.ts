import type { Ability, Beat, Snapshot } from "../../shared/model";
import type {
  AbilityPresentation,
  Archetype,
  Charge,
  ClipName,
  CreatureChoreography,
  Delivery,
  ImpactWeight,
  Locomotion,
  MoveSounds,
  ProjectileLook,
  TimingHints,
  UnitChoreography,
  VfxTheme,
} from "../../shared/presentation";
import { FOOTPRINT_SCALE } from "../../shared/presentation";
import { abilities } from "../../content/heroes";
import { enemies, enemyAbilities } from "../../content/enemies";
import { evolutions } from "../../content/evolutions";
import { supplies } from "../../content/items";
import { CHOREOGRAPHY, COMMON } from "../../content/choreography";
import { castClip } from "./hero-clips";
import { unitPresentation } from "./layout";
import { rigFor } from "./rigs";
import { forwardAt, contactTimes, type Rig } from "./animation";
import { ARROW, BOLT, MOTE } from "../../content/choreography/kit";

/**
 * What a move should look like: content's annotation if it has one, the
 * creature's own defaults next, and the generic rules last.
 *
 * Found by the beat's label in the actor's own ability list, the way
 * `castClip` finds it, so upgrades (which rename an ability but keep its id)
 * and class paths (which replace it under the same id) are covered; a class
 * path whose move looks different can be annotated by its name.
 *
 * Presentation only. Nothing here reads anything the engine does not already
 * report, and a wrong answer only makes a move look wrong.
 */

export interface MoveMeta {
  archetype: Archetype;
  delivery?: Delivery;
  locomotion: Locomotion;
  /** Travel speed, stage widths per second. */
  speed: number;
  reach?: number;
  charge: Charge;
  timing: TimingHints;
  projectile: ProjectileLook;
  /** The clip the strike plays, as the director has always chosen it. */
  strike: ClipName;
  turnToReturn: boolean;
  overshoot: number;
  unit: UnitChoreography;
  /** Where the archetype came from: an annotation, the unit, or the rules. */
  source: "ability" | "unit" | "generic";
  abilityId?: string;
  /**
   * How many blows the ability deals each target, from its own effects:
   * Double bite's two, everything else's one. Hits past this in the beats
   * are things the blow set off, not more blows.
   */
  strikes: number;
  /** How hard it lands, when annotated: heavy and signature hold longer. */
  weight?: ImpactWeight;
  /** Its visual family, when annotated: tints its charge. */
  theme?: VfxTheme;
  /** Sounds for its moments, over the generic ones. */
  sounds?: MoveSounds;
}

/** Blows an ability deals each target: its damage and heal effects. */
export function strikesOf(ability: Ability | undefined): number {
  if (!ability) return 1;
  const count = (effects: Ability["effects"]): number =>
    effects.reduce(
      (n, e) =>
        n +
        ((e.kind === "damage" || e.kind === "heal") && !e.self
          ? 1
          : e.kind === "conditional"
            ? count(e.effects)
            : 0),
      0,
    );
  return Math.max(1, count(ability.effects));
}

/** How far a strike clip must lunge, in figure widths, to count as melee. */
export const MELEE_LUNGE = 0.15;

/** Travel speed by locomotion, stage widths per second, before the unit's own. */
export const LOCOMOTION_SPEED: Record<Locomotion, number> = {
  run: 1.35,
  dash: 2.4,
  heavyWalk: 0.85,
  charge: 1.1,
  hop: 1.2,
  leap: 1.5,
  crawl: 0.7,
  slither: 0.95,
  fly: 1.3,
  lunge: 1.6,
  teleport: 4,
};

function creatureOf(s: Snapshot | null, id: string | undefined) {
  const enemy = s?.enemies.find((e) => e.id === id);
  if (enemy)
    return {
      kind: "enemy" as const,
      creature: enemy.definition,
      spriteSet: unitPresentation(enemy.definition).spriteSet,
      footprint: unitPresentation(enemy.definition).footprint,
    };
  const hero = s?.players.find((p) => p.id === id);
  if (hero)
    return {
      kind: "hero" as const,
      creature: hero.heroId,
      spriteSet: unitPresentation(undefined, hero.heroId).spriteSet,
      footprint: unitPresentation(undefined, hero.heroId).footprint,
    };
  return null;
}

/** The ability a cast beat names, from its actor's own list. */
export function abilityOf(s: Snapshot | null, beat: Beat): Ability | undefined {
  const enemy = s?.enemies.find((e) => e.id === beat.actor);
  if (s && enemy) {
    const def = enemies.find((d) => d.id === enemy.definition);
    return def
      ? enemyAbilities(def, s.combatVersion).find((a) => a.name === beat.label)
      : undefined;
  }
  const hero = s?.players.find((p) => p.id === beat.actor);
  if (!s || !hero) return undefined;
  return (
    abilities(
      hero.heroId,
      s.combatVersion,
      hero.upgrades,
      hero.evolution,
      hero.items,
    ).find((a) => a.name === beat.label) ??
    // A supply is spent by the time its round arrives.
    supplies.find((i) => i.use?.name === beat.label)?.use
  );
}

/** A creature's own annotation, and the shared one for heroes. */
function annotationFor(
  creature: string | undefined,
  hero: boolean,
  ability: Ability | undefined,
  label: string | undefined,
): AbilityPresentation | undefined {
  const own: CreatureChoreography | undefined = creature
    ? CHOREOGRAPHY[creature]
    : undefined;
  const byName = label ? own?.named?.[label] : undefined;
  const byId = ability ? own?.abilities?.[ability.id] : undefined;
  const shared =
    hero && ability ? COMMON.abilities?.[ability.id] : undefined;
  const inline = ability?.presentation;
  const found = byName ?? byId ?? shared;
  if (!found && !inline) return undefined;
  return { ...inline, ...found };
}

export function unitChoreography(creature: string | undefined): UnitChoreography {
  return (creature && CHOREOGRAPHY[creature]?.unit) || {};
}

/** The strike clip's forward lunge at its contact, in figure widths. */
export function lungeOf(rig: Rig, clip: ClipName, facing: 1 | -1) {
  const c = rig[clip] ?? (clip === "signature" ? rig.attack : undefined);
  if (!c) return 0;
  return forwardAt(c, contactTimes(c, facing)[0], facing);
}

/** The defaults an archetype fills in when the annotation leaves them out. */
const PROJECTILE: Partial<Record<Archetype, ProjectileLook>> = {
  bow: ARROW,
  projectile: BOLT,
  spell: BOLT,
  support: MOTE,
};

/**
 * Everything the choreographer needs to know about one move. `s` is the
 * snapshot the round arrived in; the beat names the move by its label.
 */
export function moveMeta(s: Snapshot | null, cast: Beat): MoveMeta {
  const who = creatureOf(s, cast.actor);
  const ability = abilityOf(s, cast);
  const strike = castClip(s, cast);
  const unit = unitChoreography(who?.creature);
  const note = annotationFor(
    who?.creature,
    who?.kind === "hero",
    ability,
    cast.label,
  );
  const facing: 1 | -1 = who?.kind === "enemy" ? -1 : 1;
  const selfAim = cast.target === cast.actor || ability?.target === "self";
  // What the ability is for, when it is known, rather than which side the
  // target stands on: a beguiled enemy turning its strike on its own side
  // is still striking, not supporting.
  const sameSide =
    !!cast.target &&
    !!s &&
    (who?.kind === "hero"
      ? s.players.some((p) => p.id === cast.target)
      : s.enemies.some((e) => e.id === cast.target));
  const allyAim =
    !selfAim &&
    (ability
      ? ability.target === "ally" || ability.target === "allyRow"
      : sameSide);
  const row = ability?.target === "enemyRow" || ability?.target === "allyRow";

  let archetype: Archetype;
  let source: MoveMeta["source"] = "ability";
  if (note?.archetype) archetype = note.archetype;
  else if (selfAim) {
    archetype = "self";
    source = "generic";
  } else if (allyAim) {
    archetype = "support";
    source = "generic";
  } else if (unit.basic) {
    archetype = unit.basic;
    source = "unit";
  } else {
    source = "generic";
    const rig = rigFor(who?.spriteSet);
    const melee =
      strike !== "cast" && lungeOf(rig, strike, facing) >= MELEE_LUNGE;
    const big =
      FOOTPRINT_SCALE[who?.footprint ?? "person"] >= FOOTPRINT_SCALE.boss;
    archetype = melee ? (big ? "lunge" : "melee") : row ? "area" : "projectile";
  }
  const locomotion = note?.locomotion ?? unit.locomotion ?? "run";
  // A unit's own speed is relative to its own gait; a move that changes the
  // gait (a pounce is a leap) keeps the unit's quickness, not its number.
  const own = LOCOMOTION_SPEED[unit.locomotion ?? "run"];
  const speed =
    LOCOMOTION_SPEED[locomotion] * (unit.speed ? unit.speed / own : 1);
  const delivery =
    note?.delivery ??
    (archetype === "beam"
      ? "beam"
      : archetype === "area"
        ? "eruption"
        : archetype === "support"
          ? "mote"
          : archetype === "spell"
            ? "bolt"
            : undefined);
  return {
    archetype,
    delivery,
    locomotion,
    speed,
    reach: unit.reach,
    charge: note?.charge ?? "normal",
    timing: note?.timing ?? {},
    projectile: { ...PROJECTILE[archetype], ...note?.projectile },
    strike: note?.clip ?? strike,
    turnToReturn: unit.turnToReturn ?? false,
    overshoot: unit.overshoot ?? 0,
    unit,
    source,
    abilityId: ability?.id,
    strikes: strikesOf(ability),
    weight: note?.weight,
    theme: note?.theme,
    sounds: note?.sounds ?? {},
  };
}

/* ------------------------------------------------------ fallback report -- */

export interface FallbackEntry {
  creature: string;
  ability: string;
  name: string;
  archetype: Archetype;
  source: MoveMeta["source"];
}

/**
 * Every ability in the game and how its look is decided: annotated, from its
 * creature's defaults, or by the generic rules. What is left on the generic
 * rules is the annotation work still to do.
 */
export function fallbackReport(): FallbackEntry[] {
  const out: FallbackEntry[] = [];
  const heroIds = Object.keys(CHOREOGRAPHY).filter(
    (id) => !enemies.some((e) => e.id === id),
  );
  const fake = (heroId: string, a: Ability): Snapshot =>
    ({
      combatVersion: 2,
      players: [
        {
          id: "h",
          heroId,
          upgrades: [],
          items: [],
          evolution: evolutions.find((e) => e.ability === a)?.id,
        },
        { id: "ally", heroId: "warden", items: [] },
      ],
      enemies: [{ id: "e", definition: "bulwark" }],
    }) as unknown as Snapshot;
  for (const heroId of heroIds) {
    const list = new Map<string, Ability>();
    for (const a of abilities(heroId, 2)) list.set(a.name, a);
    for (const a of abilities(heroId)) list.set(a.name, a);
    for (const e of evolutions.filter((e) => e.heroId === heroId))
      list.set(e.ability.name, e.ability);
    for (const a of list.values()) {
      const s = fake(heroId, a);
      const target =
        a.target === "self" ? "h" : a.target.startsWith("ally") ? "ally" : "e";
      const m = moveMeta(s, { kind: "cast", actor: "h", target, label: a.name });
      out.push({
        creature: heroId,
        ability: a.id,
        name: a.name,
        archetype: m.archetype,
        source: m.source,
      });
    }
  }
  for (const def of enemies) {
    const list = new Map<string, Ability>();
    for (const a of enemyAbilities(def, 2)) list.set(a.name, a);
    for (const a of def.abilities) list.set(a.name, a);
    for (const a of list.values()) {
      for (const version of [2, undefined] as const) {
        if (!enemyAbilities(def, version).includes(a)) continue;
        const s = {
          combatVersion: version,
          players: [{ id: "h", heroId: "vanguard", items: [] }],
          enemies: [
            { id: "e", definition: def.id },
            { id: "e2", definition: "bulwark" },
          ],
        } as unknown as Snapshot;
        const target =
          a.target === "self" ? "e" : a.target === "ally" ? "e2" : "h";
        const m = moveMeta(s, {
          kind: "cast",
          actor: "e",
          target,
          label: a.name,
        });
        out.push({
          creature: def.id,
          ability: a.id,
          name: a.name,
          archetype: m.archetype,
          source: m.source,
        });
        break;
      }
    }
  }
  // Upgrades rename abilities and keep their ids, so they resolve with them.
  return out;
}
