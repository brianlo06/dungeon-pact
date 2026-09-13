import type { Beat } from "../../shared/model";
import type {
  Anchor,
  Archetype,
  ClipName,
  Delivery,
  ProjectileLook,
  SfxName,
} from "../../shared/presentation";
import { IMPACT } from "../../shared/presentation";
import { hitStop } from "./pacing";
import {
  contactTimes,
  releaseTime,
  resolveClip,
  sample,
  type Clip,
  type Rig,
} from "./animation";
import {
  attackPoint,
  lanePath,
  pathPoint,
  straight,
  type Path,
} from "./attack-point";
import {
  drawingPoint,
  feet,
  scaleAt,
  type StageGeom,
  type UnitGeom,
} from "./stage-geometry";
import { flightTime, span, type Vec } from "./trajectory";
import type { MoveMeta } from "./choreo-meta";

/**
 * The choreographer.
 *
 * Given one resolved move — a `cast` beat and the beats that follow from it
 * — where everyone stands and what they paint, and how the move should look,
 * it answers when everything happens: when the actor sets off and where it
 * runs, the moment its weapon connects or its arrow lands, and the time at
 * which each of the move's consequences is shown. `scheduleRound` then lays a
 * round's moves end to end, overlapping one actor's return with the next
 * actor's wind-up.
 *
 * It is a pure function of its inputs. It reads no clock and no DOM, and it
 * never decides anything: a move is choreographed only if the engine
 * reported it, every hit it shows is a beat the engine resolved, and an
 * interrupted wind-up — which never produced a `cast` — is never scheduled.
 * Nothing is ever queued from an intent.
 *
 * Times are presentation milliseconds (see `clock.ts`). Positions are stage
 * fractions: x of the stage's width, y of its height, of a unit's feet.
 */

export type PhaseName =
  | "anticipation"
  | "approach"
  | "arrival"
  | "strike"
  | "contact"
  | "release"
  | "followThrough"
  | "recovery"
  | "return"
  | "home";

export interface Phase {
  name: PhaseName;
  start: number;
  end: number;
}

/**
 * One stretch of an actor's movement. Before a unit's first segment and after
 * its last it stands at home with no offset at all; between segments it holds
 * where the last one left it.
 */
export interface Segment {
  unit: string;
  start: number;
  end: number;
  /** The feet's path, stage fractions. */
  path: Path;
  ease: "inOut" | "in" | "out" | "linear";
  /** +1 faces right, −1 left. */
  face: 1 | -1;
  /** Peak height of a leap, as a share of the stage's height. */
  lift?: number;
  /** Opacity from start to end, for a fallen actor leaving the field. */
  fade?: [number, number];
}

export interface ProjectilePlan {
  id: string;
  from: string;
  to: string;
  look: ProjectileLook;
  spawn: number;
  arrive: number;
  /** Estimated from the drawings at rest; the stage refines both at spawn. */
  start: Vec;
  end: Vec;
  startAnchor?: Anchor;
  endAnchor?: Anchor;
  /** For a cone: how wide it opens where it lands, stage widths. */
  spread?: number;
}

export type MarkStyle =
  | "telegraph"
  | "mark"
  | "charge"
  | "sigil"
  | "bloom"
  | "emphasis"
  | "line"
  /** A muzzle's report: one bright flash where the shot left. */
  | "flash";

export type Cue =
  | { t: number; kind: "beat"; beat: Beat }
  | {
      t: number;
      kind: "clip";
      unit: string;
      clip: ClipName;
      then?: ClipName;
      rate?: number;
      absorb?: boolean;
    }
  /** Back to rest: its rest loop, whatever was playing. */
  | { t: number; kind: "settle"; unit: string }
  | { t: number; kind: "sound"; name: SfxName }
  | { t: number; kind: "phase"; unit: string; phase: PhaseName }
  | {
      t: number;
      kind: "camera";
      mode: "focus" | "follow" | "frame" | "ease";
      units: string[];
      /** Also keep the move's projectiles in frame. */
      projectiles?: boolean;
      zoom?: number;
    }
  | { t: number; kind: "projectile"; plan: ProjectilePlan }
  | {
      t: number;
      kind: "mark";
      style: MarkStyle;
      unit: string;
      /** For a line: the unit it runs to. */
      to?: string;
      until: number;
      /** Ride this point of the unit's drawing rather than a generic one. */
      anchor?: Anchor;
      /** The visual family it is tinted by. */
      tone?: string;
    }
  /**
   * A blow heavier than its number: the scene holds a little longer and the
   * camera shakes harder, from the move's annotated weight.
   */
  | { t: number; kind: "impact"; stopMs: number; shake: number };

/** What the debug overlay draws for a move. */
export interface MoveDebug {
  actor: string;
  target?: string;
  home: Vec;
  attackPoint?: Vec;
  weapon?: Vec;
  approach?: Path;
  back?: Path;
  muzzle?: Vec;
  hit?: Vec;
}

export interface MoveTimeline {
  actor: string;
  archetype: Archetype;
  /** When the actor is home and settled. */
  duration: number;
  /** The earliest a different actor's move may begin. */
  release: number;
  /** When the first consequence is shown. */
  firstContact: number;
  phases: Phase[];
  segments: Segment[];
  cues: Cue[];
  projectiles: ProjectilePlan[];
  debug: MoveDebug;
}

/* ------------------------------------------------------------- grouping -- */

export interface Move {
  cast: Beat;
  /** Beats between this cast and the next. */
  beats: Beat[];
  /** Banners the engine logs before a cast, like BEGUILED. */
  pre: Beat[];
}

export interface RoundBeats {
  moves: Move[];
  /** Beats before any move. */
  preamble: Beat[];
  /** Beats after every move: burn and poison ticking at the round's end. */
  epilogue: Beat[];
}

/** Combos logged before the cast they belong to. */
const PRE_CAST = new Set(["BEGUILED"]);

/**
 * Split a round's beats into moves. A move is a `cast` and everything until
 * the next one. Burn and poison tick after every action, as the round ends:
 * a unit hurting itself when it did not act is the start of that.
 */
export function splitRound(beats: Beat[]): RoundBeats {
  const moves: Move[] = [];
  const preamble: Beat[] = [];
  let pre: Beat[] = [];
  for (const b of beats) {
    if (b.kind === "cast") {
      moves.push({ cast: b, beats: [], pre });
      pre = [];
    } else if (b.kind === "combo" && PRE_CAST.has(b.label ?? "")) pre.push(b);
    else if (!moves.length) preamble.push(b);
    else moves[moves.length - 1].beats.push(b);
  }
  const epilogue: Beat[] = [...pre];
  const last = moves[moves.length - 1];
  if (last) {
    const actor = last.cast.actor;
    const tick = (b: Beat, i: number, all: Beat[]) =>
      b.kind === "damage" &&
      b.actor === b.target &&
      (b.actor !== actor ||
        // The actor's own tick: a self-cost always comes before a hit.
        !all
          .slice(i + 1)
          .some((x) => x.kind === "damage" && x.actor === actor && x.target !== actor));
    const at = last.beats.findIndex(tick);
    if (at >= 0) epilogue.unshift(...last.beats.splice(at));
  }
  return { moves, preamble, epilogue };
}

export interface Contact {
  /** The beats shown at this contact, in the order the engine logged them. */
  beats: Beat[];
  targets: string[];
}

export interface Consequences {
  contacts: Contact[];
  /** Beats shown after a contact: thorns, a seizure, a fall. */
  follow: { beat: Beat; after: number }[];
}

/** Banners the engine logs just before the hit they describe. */
const PRE_HIT = new Set(["EXPLOIT", "CHAIN SHOCK", "INTERCEPT"]);

/**
 * Which of a move's beats land together. Each hit the actor deals is part of
 * the current contact until one lands on a target that contact already hit —
 * that is the next blow. So a row attack is one contact across the row, a
 * double bite is two contacts on one target, and a chain shock's splash lands
 * with the bolt that caused it. Blocks, self-costs and the banners the engine
 * logs ahead of a hit join the contact of the hit they precede. Everything
 * else follows the contact before it.
 */
export function groupConsequences(move: Move, perTarget = 1): Consequences {
  const actor = move.cast.actor;
  const selfMove = move.cast.target === actor;
  const contacts: Contact[] = [];
  const follow: Consequences["follow"] = [];
  let current: Contact | null = null;
  let waiting: Beat[] = [];
  const hitTargets = new Set<string>();
  /** Blows each target has taken from this move so far. */
  const taken = new Map<string, number>();
  const open = () => {
    current = { beats: [], targets: [] };
    contacts.push(current);
    hitTargets.clear();
  };
  for (const b of move.beats) {
    const own = b.actor === actor;
    const onSelf = b.target === actor;
    const hit =
      own &&
      (b.kind === "damage" || b.kind === "heal") &&
      (!onSelf || selfMove);
    const interrupt = own && b.kind === "combo" && b.label === "INTERRUPTED";
    const ahead =
      (own && b.kind === "block") ||
      (b.kind === "combo" && PRE_HIT.has(b.label ?? "")) ||
      (own && b.kind === "damage" && onSelf && !selfMove);
    if (ahead) {
      waiting.push(b);
      continue;
    }
    // A hit past the number of blows the ability itself deals is not another
    // blow: it is something the blow set off — an item's lightning after
    // an attack — and it follows the contact rather than faking a second
    // swing the engine never resolved.
    if (hit && b.target && (taken.get(b.target) ?? 0) >= perTarget) {
      follow.push(...waiting.map((w) => ({ beat: w, after: contacts.length - 1 })));
      waiting = [];
      follow.push({ beat: b, after: contacts.length - 1 });
      continue;
    }
    if (hit && b.target) taken.set(b.target, (taken.get(b.target) ?? 0) + 1);
    if (hit || interrupt) {
      if (
        !current ||
        (b.target && hitTargets.has(b.target) && b.kind !== "combo")
      )
        open();
      const c = current as unknown as Contact;
      c.beats.push(...waiting, b);
      waiting = [];
      if (b.target) {
        if (b.kind !== "combo") hitTargets.add(b.target);
        if (!c.targets.includes(b.target)) c.targets.push(b.target);
      }
      continue;
    }
    follow.push({ beat: b, after: contacts.length - 1 });
  }
  // A block or a cost with no hit after it still happened.
  for (const b of waiting) follow.push({ beat: b, after: contacts.length - 1 });
  return { contacts, follow };
}

/* --------------------------------------------------------------- timing -- */

/** A duration that pacing squeezes: [natural, floor], milliseconds at 1×. */
type Span = readonly [number, number];
const pick = (s: Span, pace: number) => s[1] + (s[0] - s[1]) * pace;

export const TIMING = {
  anticipation: [260, 150] as Span,
  arrival: [70, 30] as Span,
  /** Between a contact and what follows from it: thorns, a seizure. */
  follow: [180, 110] as Span,
  /** A fall waits for its impact to finish. */
  fall: [260, 170] as Span,
  /** How long a banner needs on screen before the next move may start. */
  banner: [640, 480] as Span,
  linger: [90, 30] as Span,
  settle: [140, 60] as Span,
  pivot: [110, 70] as Span,
  hold: {
    short: [90, 60] as Span,
    normal: [220, 140] as Span,
    long: [520, 360] as Span,
    marked: [340, 240] as Span,
  },
  /** How long a spell's build-up shows before it launches. */
  build: [260, 160] as Span,
  /** A sigil forming, a telegraph glowing, before the burst. */
  telegraph: [320, 200] as Span,
  /** Travel time bounds, before pacing. */
  travel: { min: 170, max: 900 },
};

/** Travel time for a distance, stage widths, at a speed, stage widths/s. */
export function travelTime(
  distance: number,
  speed: number,
  pace: number,
  scale = 1,
) {
  const natural = Math.max(
    TIMING.travel.min,
    Math.min(TIMING.travel.max, (distance / Math.max(0.1, speed)) * 1000 * scale),
  );
  // Squeezed, a run is quicker, never a teleport.
  return natural * (0.68 + 0.32 * pace);
}

/* ------------------------------------------------------ the choreographer -- */

export interface ChoreoInput {
  move: Move;
  meta: MoveMeta;
  stage: StageGeom;
  /** The actor's rig, to time its clips as the animator will play them. */
  rig: Rig;
  /** Which units are standing when the move starts. */
  alive: (id: string) => boolean;
  /** A target's own annotations: where it is struck. */
  targetInset?: (id: string) => number | undefined;
  targetAnchor?: (id: string) => Anchor | undefined;
  /** 1 plays every phase at its natural length, 0 at its floor. */
  pace?: number;
}

const frac = (stage: StageGeom, p: Vec): Vec => ({
  x: p.x / stage.width,
  y: p.y / stage.height,
});
const fracPath = (stage: StageGeom, p: Path): Path => ({
  from: frac(stage, p.from),
  via: frac(stage, p.via),
  to: frac(stage, p.to),
});

/** Where a unit is hit: its annotated anchor, or its upper torso. */
export function hitPoint(u: UnitGeom, anchor?: Anchor): Vec {
  if (anchor) return drawingPoint(u, anchor.at);
  return {
    x: u.gx + (u.figure.left + u.figure.right) / 2,
    y: u.gy + u.figure.top + (u.figure.bottom - u.figure.top) * 0.4,
  };
}

/** Where a unit's shot leaves from, standing at `at` facing `face`. */
export function muzzlePoint(
  u: UnitGeom,
  at: Vec,
  face: 1 | -1,
  anchor?: Anchor,
  k = 1,
): Vec {
  if (anchor) return drawingPoint(u, anchor.at, at, k, face);
  // The front of its outline as drawn; turned round, mirrored.
  const drawn = u.facing > 0 ? u.figure.right : u.figure.left;
  const front = face === u.facing ? drawn : -drawn;
  return {
    x: at.x + front * 0.8 * k,
    y: at.y + (u.figure.top - u.figure.bottom) * 0.55 * k,
  };
}

/** A beat's time and, for hits, how long the scene holds on it. */
function beatCues(t: number, beats: Beat[]): Cue[] {
  return beats.map((beat, i) => ({ t: t + i * 0.01, kind: "beat", beat }));
}

/**
 * What a contact adds over its beats, from the move's annotation: the sound
 * layered on the moment it lands, and — for a heavy or signature blow that
 * actually hurt someone — a longer hold and a harder shake than its number
 * alone would earn. The beats' own hit-stop still applies; overlapping stops
 * do not add up, so this only ever lengthens one.
 */
export function landingCues(t: number, meta: MoveMeta, beats: Beat[]): Cue[] {
  const cues: Cue[] = [];
  const lands = beats.some((b) => b.kind === "damage" || b.kind === "heal");
  if (lands && meta.sounds?.impact)
    cues.push({ t, kind: "sound", name: meta.sounds.impact });
  const hurt = beats.filter((b) => b.kind === "damage" && (b.amount ?? 0) > 0);
  if (hurt.length && (meta.weight === "heavy" || meta.weight === "signature")) {
    const w = IMPACT[meta.weight];
    const own = Math.max(...hurt.map((b) => hitStop(b.amount ?? 0)));
    cues.push({
      t: t + 0.02,
      kind: "impact",
      stopMs: Math.max(w.stopMs, own),
      shake: w.shake,
    });
  }
  return cues;
}

/** The longest hit-stop among a contact's hits. */
const stopOf = (c: Contact) =>
  Math.max(0, ...c.beats.map((b) => (b.kind === "damage" ? hitStop(b.amount ?? 0) : 0)));

/** Place follow-ups after their contacts, and report when the last lands. */
function followCues(
  contactsAt: number[],
  cons: Consequences,
  pace: number,
  start: number,
): { cues: Cue[]; last: number; banners: number } {
  const cues: Cue[] = [];
  const count = new Map<number, number>();
  let last = contactsAt.length ? contactsAt[contactsAt.length - 1] : start;
  let banners = last;
  for (const f of cons.follow) {
    const base = f.after >= 0 ? contactsAt[f.after] : start;
    const n = (count.get(f.after) ?? 0) + 1;
    count.set(f.after, n);
    const gap =
      f.beat.kind === "defeat" ? pick(TIMING.fall, pace) : pick(TIMING.follow, pace);
    const t = base + gap + (n - 1) * pick(TIMING.follow, pace);
    cues.push({ t, kind: "beat", beat: f.beat });
    last = Math.max(last, t);
    if (f.beat.kind === "combo" || f.beat.kind === "defeat") banners = Math.max(banners, t);
  }
  for (const [i, at] of contactsAt.entries()) {
    // Pre-hit banners at a contact need reading too.
    const hasBanner = cons.contacts[i]?.beats.some((b) => b.kind === "combo");
    if (hasBanner) banners = Math.max(banners, at);
  }
  return { cues, last, banners };
}

/** Clip timing: when each contact falls, replaying the clip past its markers. */
function strikeSchedule(clip: Clip, facing: 1 | -1, hits: number, start: number) {
  const marks = contactTimes(clip, facing);
  const dur = clip.duration;
  const starts: number[] = [start];
  const at: number[] = [];
  for (let k = 0; k < Math.max(1, hits); k++) {
    if (k < marks.length) at.push(start + marks[k] * dur);
    else {
      // Out of authored blows: strike again from the top, no retreat, the
      // next contact a readable beat after the last.
      const prev = at[at.length - 1];
      const again = prev + Math.max(200, dur * 0.42) - marks[0] * dur;
      starts.push(again);
      at.push(again + marks[0] * dur);
    }
  }
  const end = starts[starts.length - 1] + dur;
  return { at, starts, end, marks };
}

/**
 * Choreograph one move. Times are relative to the move's start.
 */
export function choreograph(input: ChoreoInput): MoveTimeline {
  const { move, meta, stage, rig } = input;
  const pace = input.pace ?? 1;
  const cons = groupConsequences(move, meta.strikes);
  const actorId = move.cast.actor!;
  const actor = stage.units.get(actorId);
  const cues: Cue[] = [];
  const phases: Phase[] = [];
  const segments: Segment[] = [];
  const projectiles: ProjectilePlan[] = [];
  const phase = (name: PhaseName, start: number, end: number) => {
    phases.push({ name, start, end });
    cues.push({ t: start, kind: "phase", unit: actorId, phase: name });
  };
  cues.push({ t: 0, kind: "beat", beat: move.cast });

  // Who it is really aimed at: the cast's target if it is still standing,
  // otherwise the first thing it actually hit. Nothing ever moves towards a
  // unit that has already fallen.
  const hitIds = cons.contacts.flatMap((c) => c.targets);
  const primary =
    [move.cast.target, ...hitIds].find(
      (id) => id && id !== actorId && input.alive(id) && stage.units.has(id),
    ) ??
    [move.cast.target, ...hitIds].find((id) => id && stage.units.has(id));
  const target = primary ? stage.units.get(primary) : undefined;

  if (!actor) {
    // Nobody to draw: show the consequences in order, as the beats they are.
    let t = pick(TIMING.anticipation, pace);
    const at = cons.contacts.map((c) => {
      cues.push(...beatCues(t, c.beats));
      const here = t;
      t += pick(TIMING.follow, pace);
      return here;
    });
    const f = followCues(at, cons, pace, t);
    cues.push(...f.cues);
    const end = Math.max(t, f.last) + pick(TIMING.settle, pace);
    return {
      actor: actorId,
      archetype: meta.archetype,
      duration: end,
      release: end,
      firstContact: at[0] ?? 0,
      phases,
      segments,
      cues,
      projectiles,
      debug: { actor: actorId, home: { x: 0, y: 0 } },
    };
  }

  const home = feet(actor);
  const neutral = actor.facing;
  const debug: MoveDebug = {
    actor: actorId,
    target: target?.id,
    home: frac(stage, home),
  };
  const face: 1 | -1 =
    target && target.id !== actorId && Math.abs(target.gx - actor.gx) > 1
      ? target.gx > actor.gx
        ? 1
        : -1
      : neutral;
  const hits = Math.max(1, cons.contacts.length);
  const strikeName: ClipName = meta.strike;
  const strike = resolveClip(rig, strikeName).clip;

  // Turning to face a target behind it — a beguiled enemy on its own side —
  // is instant and held for the whole move.
  const turn = (from: number, to: number, f: 1 | -1, at: Vec = home) =>
    segments.push({
      unit: actorId,
      start: from,
      end: to,
      path: straight(frac(stage, at), frac(stage, at)),
      ease: "linear",
      face: f,
    });

  let archetype = meta.archetype;
  const travels = archetype === "melee" || archetype === "lunge";
  if (travels && (!target || target.id === actorId)) archetype = "self";

  let contactsAt: number[] = [];
  let duration = 0;
  let release = 0;

  if (archetype === "melee" || archetype === "lunge") {
    const tgt = target!;
    const ant = meta.timing.anticipation ?? pick(TIMING.anticipation, pace);
    const lunge = sample(strike, contactTimes(strike, neutral)[0]).x * neutral;
    const point = attackPoint(stage, actor, tgt, {
      reach: meta.reach,
      lunge,
      inset: input.targetInset?.(tgt.id),
    });
    let dest = point.feet;
    if (archetype === "lunge") {
      // A short lunge: a third of the way, and never more than a stride.
      const max = 0.1 * stage.width;
      const dx = dest.x - home.x;
      const dy = dest.y - home.y;
      const len = Math.hypot(dx, dy);
      const k = Math.min(0.34, len ? max / len : 0);
      dest = { x: home.x + dx * k, y: home.y + dy * k };
    }
    const ignore = new Set([actorId, tgt.id]);
    const path = lanePath(stage, actor, home, dest, ignore);
    const distance = span(frac(stage, home), frac(stage, dest), stage.width / stage.height);
    const travel =
      distance < 0.01
        ? 0
        : travelTime(distance, meta.speed, pace, meta.timing.travel ?? 1);
    debug.attackPoint = frac(stage, dest);
    debug.weapon = frac(stage, point.weapon);
    debug.approach = fracPath(stage, path);
    debug.hit = frac(stage, hitPoint(tgt, input.targetAnchor?.(tgt.id)));

    // Anticipation: plant, raise, set the jaw.
    phase("anticipation", 0, ant);
    cues.push({ t: 0, kind: "clip", unit: actorId, clip: "anticipate" });
    cues.push({ t: 0, kind: "camera", mode: "focus", units: [actorId], zoom: 1.05 });
    if (face !== neutral || travel > 0)
      turn(0, ant, face);
    // Approach.
    const leap = meta.locomotion === "leap" || meta.locomotion === "hop";
    const arrive = ant + travel;
    if (travel > 0) {
      phase("approach", ant, arrive);
      cues.push({ t: ant, kind: "clip", unit: actorId, clip: "approach" });
      cues.push({ t: ant, kind: "camera", mode: "follow", units: [actorId, tgt.id] });
      segments.push({
        unit: actorId,
        start: ant,
        end: arrive,
        path: fracPath(stage, path),
        ease: leap ? "linear" : meta.locomotion === "dash" ? "out" : "inOut",
        face,
        lift: leap ? 0.16 : undefined,
      });
      if (
        meta.locomotion === "charge" ||
        meta.locomotion === "heavyWalk"
      ) {
        const step = meta.locomotion === "charge" ? 190 : 260;
        for (let t = ant + step * 0.6; t < arrive - 40; t += step)
          cues.push({ t, kind: "sound", name: meta.sounds?.step ?? "footstep-heavy" });
      }
    }
    // Arrival: a beat to land on its feet, then the strike.
    const settleIn = travel > 0 ? pick(TIMING.arrival, pace) : 0;
    const strikeAt = arrive + settleIn;
    if (settleIn) phase("arrival", arrive, strikeAt);
    const plan = strikeSchedule(strike, neutral, hits, strikeAt);
    plan.starts.forEach((t) =>
      cues.push({ t, kind: "clip", unit: actorId, clip: strikeName }),
    );
    contactsAt = plan.at;
    phase("strike", strikeAt, contactsAt[0]);
    for (const [i, t] of contactsAt.entries()) {
      const swing = meta.sounds?.swing === undefined ? "swing-heavy" : meta.sounds.swing;
      if (swing) cues.push({ t: Math.max(strikeAt, t - 120), kind: "sound", name: swing });
      cues.push(...landingCues(t, meta, cons.contacts[i]?.beats ?? []));
      if (i === 0) {
        phase("contact", t, t);
        cues.push({
          t: t - 60,
          kind: "camera",
          mode: "frame",
          units: [actorId, tgt.id],
          zoom: 1.1,
        });
      }
      cues.push(...beatCues(t, cons.contacts[i]?.beats ?? []));
    }
    const lastHit = contactsAt[contactsAt.length - 1];
    const clipEnd = plan.end;
    const followEnd = lastHit + (clipEnd - lastHit) * 0.45;
    phase("followThrough", lastHit, followEnd);
    const f = followCues(contactsAt, cons, pace, strikeAt);
    cues.push(...f.cues);

    // Going home. A creature that runs on past its target does so straight
    // out of the bite; one that backs away finishes its swing first.
    const overshoot = archetype === "melee" ? meta.overshoot : 0;
    let from = dest;
    let leave: number;
    if (overshoot > 0) {
      const off = lastHit + 90;
      const lastStart = plan.starts[plan.starts.length - 1];
      const bodyW = (actor.body.right - actor.body.left) * point.scale;
      const carried = sample(strike, Math.min(1, (off - lastStart) / strike.duration)).x;
      const at = { x: dest.x + carried * neutral * bodyW * (face === neutral ? 1 : -1), y: dest.y };
      const s = scaleAt(actor, dest.y, stage.height);
      const past = {
        x: at.x + face * overshoot * s * ((actor.body.right - actor.body.left) / actor.view.width),
        y: Math.min(stage.height * 0.985, dest.y + 0.03 * stage.height),
      };
      const run = travelTime(
        span(frac(stage, at), frac(stage, past), stage.width / stage.height),
        meta.speed,
        pace,
      ) * 0.8;
      cues.push({ t: off, kind: "clip", unit: actorId, clip: "approach", absorb: true });
      segments.push({
        unit: actorId,
        start: off,
        end: off + run,
        path: fracPath(stage, straight(at, past)),
        ease: "out",
        face,
      });
      phase("recovery", off, off + run);
      from = past;
      leave = off + run;
    } else {
      const linger = meta.timing.linger ?? pick(TIMING.linger, pace);
      phase("recovery", followEnd, clipEnd);
      leave = Math.max(clipEnd - (clipEnd - lastHit) * 0.2, f.last) + linger;
    }
    // The fallen do not walk home.
    const back = lanePath(stage, actor, from, home, new Set([actorId]));
    const backDistance = span(frac(stage, from), frac(stage, home), stage.width / stage.height);
    const turnsRound = meta.turnToReturn && backDistance > 0.01;
    let t = leave;
    if (turnsRound) {
      const pivot = pick(TIMING.pivot, pace);
      turn(t, t + pivot, (-face) as 1 | -1, from);
      cues.push({ t, kind: "clip", unit: actorId, clip: "retreat", absorb: overshoot === 0 });
      t += pivot;
    }
    const backTime =
      backDistance < 0.005
        ? 0
        : travelTime(backDistance, meta.speed * (turnsRound ? 1 : 0.8), pace);
    if (backTime > 0) {
      if (!turnsRound)
        cues.push({ t, kind: "clip", unit: actorId, clip: "retreat" });
      phase("return", t, t + backTime);
      cues.push({ t, kind: "camera", mode: "ease", units: [actorId, tgt.id] });
      segments.push({
        unit: actorId,
        start: t,
        end: t + backTime,
        path: fracPath(stage, back),
        ease: "inOut",
        face: turnsRound ? ((-face) as 1 | -1) : face,
      });
      debug.back = fracPath(stage, back);
    }
    const homeAt = t + backTime;
    let end = homeAt;
    if (turnsRound || face !== neutral) {
      const pivot = pick(TIMING.pivot, pace);
      turn(homeAt, homeAt + pivot, neutral);
      end += pivot;
    }
    cues.push({ t: homeAt, kind: "settle", unit: actorId });
    const settle = pick(TIMING.settle, pace);
    phase("home", homeAt, end + settle);
    duration = end + settle;
    release = Math.max(
      leave,
      f.last + pick(TIMING.follow, pace) * 0.5,
      f.banners > contactsAt[0] ? f.banners + pick(TIMING.banner, pace) : 0,
    );
  } else if (archetype === "self") {
    // In place: the strike clip is the whole move (a brace, a fortify).
    const plan = strikeSchedule(strike, neutral, hits, 0);
    cues.push({ t: 0, kind: "clip", unit: actorId, clip: strikeName });
    cues.push({ t: 0, kind: "camera", mode: "focus", units: [actorId], zoom: 1.04 });
    contactsAt = plan.at;
    phase("strike", 0, contactsAt[0]);
    phase("contact", contactsAt[0], contactsAt[0]);
    if (meta.sounds?.charge) cues.push({ t: 0, kind: "sound", name: meta.sounds.charge });
    if (meta.sounds?.impact)
      cues.push({ t: contactsAt[0], kind: "sound", name: meta.sounds.impact });
    for (const [i, t] of contactsAt.entries())
      cues.push(...beatCues(t, cons.contacts[i]?.beats ?? []));
    const f = followCues(contactsAt, cons, pace, 0);
    cues.push(...f.cues);
    phase("recovery", contactsAt[contactsAt.length - 1], plan.end);
    const settle = pick(TIMING.settle, pace);
    duration = Math.max(plan.end, f.last) + settle;
    phase("home", duration - settle, duration);
    if (face !== neutral) turn(0, duration, face);
    // Braces are quick and many: the next actor may begin at this one's
    // contact, so four heroes bracing do not take two seconds.
    release = Math.max(
      contactsAt[0] + pick(TIMING.follow, pace),
      f.last,
      f.banners > contactsAt[0] ? f.banners + pick(TIMING.banner, pace) : 0,
    );
  } else {
    // Ranged: a bow, a thrown or conjured projectile, a spell, a beam, an
    // area, or support. The actor stays where it is and something travels.
    const tgt = target;
    const bowed = archetype === "bow";
    const hitTargets = cons.contacts.length
      ? cons.contacts.map((c) => (c.targets.length ? c.targets : tgt ? [tgt.id] : []))
      : [tgt ? [tgt.id] : []];
    if (face !== neutral) turn(0, 1, face);
    cues.push({ t: 0, kind: "camera", mode: "focus", units: [actorId], zoom: 1.03 });
    // The build-up, and the moment the shot leaves.
    let releases: number[] = [];
    let clipEnd = 0;
    if (bowed) {
      const aim = resolveClip(rig, "aim").clip;
      const loose = resolveClip(rig, "release").clip;
      const holdFor =
        meta.timing.hold ?? pick(TIMING.hold[meta.charge] ?? TIMING.hold.normal, pace);
      let t = 0;
      for (let k = 0; k < hitTargets.length; k++) {
        // A second arrow is nocked and drawn again, faster.
        const rate = k ? 1.6 : 1;
        cues.push({ t, kind: "clip", unit: actorId, clip: "aim", then: "aim", rate });
        cues.push({ t: t + aim.duration * 0.25 / rate, kind: "sound", name: "bow-draw" });
        const drawn = t + aim.duration / rate;
        if (k === 0) {
          // Raising the bow is the anticipation; the draw and the hold are
          // the strike, and the release is its contact.
          phase("anticipation", 0, aim.duration * 0.3);
          phase("strike", aim.duration * 0.3, drawn + holdFor);
        }
        if (meta.charge === "long")
          cues.push({ t: drawn - 120, kind: "mark", style: "charge", unit: actorId, until: drawn + holdFor });
        const exploits = cons.contacts[k]?.beats.some(
          (b) => b.kind === "combo" && b.label === "EXPLOIT",
        );
        if (meta.charge === "marked" && exploits && tgt)
          cues.push({ t: drawn, kind: "mark", style: "mark", unit: hitTargets[k][0] ?? tgt.id, until: drawn + holdFor + 80 });
        const let_go = drawn + holdFor;
        cues.push({ t: let_go, kind: "clip", unit: actorId, clip: "release" });
        const r = let_go + releaseTime(loose, neutral) * loose.duration;
        releases.push(r);
        cues.push({ t: r, kind: "sound", name: "bow-release" });
        clipEnd = let_go + loose.duration;
        t = r + 80;
      }
    } else {
      // A move annotated with a sound for its build-up has one to show, too:
      // a Mender's weld gathers at the clamp before the repair leaves it.
      const building =
        archetype === "spell" ||
        archetype === "beam" ||
        archetype === "area" ||
        meta.charge === "long" ||
        !!meta.sounds?.charge;
      // An annotated build-up wins: a clip that raises the hand and gathers
      // the orb itself wants little or none in front of it.
      const lead = building
        ? (meta.timing.anticipation ?? pick(TIMING.build, pace) * (meta.charge === "long" ? 1.8 : 1))
        : 0;
      const plan = strikeSchedule(strike, neutral, hitTargets.length, lead);
      plan.starts.forEach((t) =>
        cues.push({ t, kind: "clip", unit: actorId, clip: strikeName }),
      );
      // A shot leaves at the clip's release marker, else at each of its
      // contacts — the peak of the throw.
      const marker = strike.markers?.release;
      releases =
        marker === undefined
          ? plan.at
          : plan.at.map((_, i) => {
              const s0 = plan.starts[Math.min(i, plan.starts.length - 1)];
              return s0 + marker * strike.duration;
            });
      if (building) {
        // Power gathers where the shot will leave — the hand, the barrel,
        // the horn — and holds until the moment it does.
        cues.push({
          t: 0,
          kind: "mark",
          style: "charge",
          unit: actorId,
          until: Math.max(lead + 200, releases[0]),
          anchor: meta.unit.anchors?.muzzle,
          tone: meta.theme,
        });
        const charge = meta.sounds?.charge === undefined ? "charge-rise" : meta.sounds.charge;
        if (charge) cues.push({ t: 0, kind: "sound", name: charge });
      }
      phase("anticipation", 0, Math.max(lead, 1));
      phase("strike", lead, releases[0]);
      clipEnd = plan.end;
    }
    phase("release", releases[0], releases[0]);
    // What travels, per contact; one per target the engine hit.
    const delivery: Delivery | undefined =
      meta.delivery ?? (archetype === "beam" ? "beam" : undefined);
    const look = meta.projectile;
    const aspect = stage.width / stage.height;
    const muzzle = muzzlePoint(actor, home, face, meta.unit.anchors?.muzzle);
    debug.muzzle = frac(stage, muzzle);
    contactsAt = [];
    hitTargets.forEach((ids, k) => {
      const r = releases[Math.min(k, releases.length - 1)];
      let arrive = r;
      let flew = false;
      if (delivery === "cone") {
        // One breath across all of them: aimed at the middle of what it hit,
        // reaching a little past it, landing on everyone at once.
        const standing = ids.filter((id) => stage.units.has(id));
        const ends = standing.map((id) => hitPoint(stage.units.get(id)!, input.targetAnchor?.(id)));
        if (ends.length) {
          const mid = {
            x: ends.reduce((n, p) => n + p.x, 0) / ends.length,
            y: ends.reduce((n, p) => n + p.y, 0) / ends.length,
          };
          const end = { x: muzzle.x + (mid.x - muzzle.x) * 1.12, y: muzzle.y + (mid.y - muzzle.y) * 1.12 };
          if (!debug.hit) debug.hit = frac(stage, mid);
          // How wide it must open where it reaches them: every target's
          // distance off its centre line, both sides, plus a body's width.
          const dx = mid.x - muzzle.x;
          const dy = mid.y - muzzle.y;
          const len = Math.hypot(dx, dy) || 1;
          const off = Math.max(0, ...ends.map((p) => Math.abs(dx * (p.y - muzzle.y) - dy * (p.x - muzzle.x)) / len));
          const body = Math.max(
            ...standing.map((id) => {
              const u = stage.units.get(id)!;
              return u.figure.right - u.figure.left;
            }),
          );
          const spread = (2 * off + body * 0.6) / stage.width;
          const trajectory = "beam" as const;
          const time =
            look.duration ??
            flightTime({ trajectory, start: frac(stage, muzzle), end: frac(stage, end), aspect }, look.speed ?? 1.6);
          const plan: ProjectilePlan = {
            id: `${actorId}:${k}:cone`,
            from: actorId,
            to: standing[0],
            look: { ...look, trajectory },
            spawn: r,
            arrive: r + time,
            start: frac(stage, muzzle),
            end: frac(stage, end),
            startAnchor: meta.unit.anchors?.muzzle,
            spread,
          };
          projectiles.push(plan);
          cues.push({ t: r, kind: "projectile", plan });
          arrive = plan.arrive;
          flew = true;
        }
      }
      for (const [j, id] of (delivery === "cone" ? [] : ids).entries()) {
        const u = stage.units.get(id);
        if (!u) continue;
        const end = hitPoint(u, input.targetAnchor?.(id));
        if (!debug.hit) debug.hit = frac(stage, end);
        const plan: ProjectilePlan = {
          id: `${actorId}:${k}:${j}`,
          from: actorId,
          to: id,
          look,
          spawn: r,
          arrive: r,
          start: frac(stage, muzzle),
          end: frac(stage, end),
          startAnchor: meta.unit.anchors?.muzzle,
          endAnchor: input.targetAnchor?.(id),
        };
        if (delivery === "eruption" || delivery === "sigil" || delivery === "bloom") {
          // Nothing crosses the stage: the target's ground or body lights,
          // then bursts.
          const style: MarkStyle = delivery === "eruption" ? "telegraph" : delivery;
          const burst = r + pick(TIMING.telegraph, pace) * (delivery === "bloom" ? 0.6 : 1);
          cues.push({ t: delivery === "eruption" ? 0 : r, kind: "mark", style, unit: id, until: burst + 160 });
          arrive = Math.max(arrive, burst);
          continue;
        }
        const trajectory =
          delivery === "fromAbove"
            ? "fromAbove"
            : delivery === "beam" || archetype === "beam"
              ? "beam"
              : delivery === "shockwave"
                ? "ground"
                : (look.trajectory ?? "linear");
        const flight = {
          trajectory,
          start: plan.start,
          end: trajectory === "ground" ? frac(stage, feet(u)) : plan.end,
          aspect,
        } as const;
        const time =
          look.duration ??
          flightTime(flight, look.speed ?? 1.6) * (0.8 + 0.2 * pace);
        plan.look = { ...look, trajectory };
        plan.end = flight.end;
        plan.arrive = r + time;
        arrive = Math.max(arrive, plan.arrive);
        projectiles.push(plan);
        cues.push({ t: r, kind: "projectile", plan });
        flew = true;
        if (delivery === "mote" && archetype === "support")
          // A repair arriving: light opens on the ally as it lands.
          cues.push({ t: plan.arrive - 30, kind: "mark", style: "bloom", unit: id, until: plan.arrive + 460 });
      }
      if (flew) {
        // Once per release, however many things leave together.
        const released = bowed
          ? meta.sounds?.release === undefined ? null : meta.sounds.release
          : meta.sounds?.release === undefined ? "projectile-release" : meta.sounds.release;
        if (released) cues.push({ t: r, kind: "sound", name: released });
        const travel = meta.sounds?.travel ?? (bowed ? "arrow-whoosh" : undefined);
        if (travel) cues.push({ t: r + 40, kind: "sound", name: travel });
        if (look.muzzleFlash)
          cues.push({ t: r, kind: "mark", style: "flash", unit: actorId, until: r + 140, anchor: meta.unit.anchors?.muzzle, tone: meta.theme });
      }
      contactsAt.push(arrive);
      cues.push(...landingCues(arrive, meta, cons.contacts[k]?.beats ?? []));
      cues.push(...beatCues(arrive, cons.contacts[k]?.beats ?? []));
    });
    if (tgt)
      cues.push({
        t: releases[0],
        kind: "camera",
        mode: "frame",
        units: [actorId, ...new Set(hitTargets.flat())],
        projectiles: true,
      });
    phase("contact", contactsAt[0], contactsAt[0]);
    const f = followCues(contactsAt, cons, pace, releases[0]);
    cues.push(...f.cues);
    const lastHit = contactsAt[contactsAt.length - 1];
    phase("recovery", releases[releases.length - 1], Math.max(clipEnd, lastHit));
    const settleAt = Math.max(clipEnd, releases[releases.length - 1] + 120);
    cues.push({ t: settleAt, kind: "settle", unit: actorId });
    const settle = pick(TIMING.settle, pace);
    duration = Math.max(settleAt, f.last, lastHit) + settle;
    phase("home", duration - settle, duration);
    if (face !== neutral) {
      segments.length = 0;
      turn(0, settleAt, face);
    }
    // The next actor may wind up while this one's shot is still landing:
    // anticipation overlaps the tail of the flight, never the hit.
    release = Math.max(
      lastHit - pick(TIMING.anticipation, pace) * 0.5,
      f.last,
      f.banners > contactsAt[0] ? f.banners + pick(TIMING.banner, pace) : 0,
      releases[releases.length - 1] + 60,
    );
  }

  // If the actor falls during its own move — thorns, its own blood price —
  // it falls where it stands and nothing more is scheduled for it: no
  // return, no settle. It leaves the field in a fade and lies at home.
  const fell = cues.find(
    (c) => c.kind === "beat" && c.beat.kind === "defeat" && c.beat.target === actorId,
  ) as Extract<Cue, { kind: "beat" }> | undefined;
  if (fell) {
    const t = fell.t;
    const where = positionAt(segments, actorId, t) ?? frac(stage, home);
    const faced = faceAt(segments, actorId, t) ?? neutral;
    const kept = segments.filter((s) => s.end <= t);
    const cut = segments.find((s) => s.start < t && s.end > t);
    if (cut) kept.push({ ...cut, end: t, path: straight(cut.path.from, where), ease: "linear" });
    const lie = t + 900;
    kept.push({ unit: actorId, start: t, end: lie, path: straight(where, where), ease: "linear", face: faced });
    const away = Math.hypot(where.x - frac(stage, home).x, where.y - frac(stage, home).y) > 0.002;
    if (away) {
      kept.push({ unit: actorId, start: lie, end: lie + 220, path: straight(where, where), ease: "linear", face: faced, fade: [1, 0] });
      kept.push({ unit: actorId, start: lie + 220, end: lie + 440, path: straight(frac(stage, home), frac(stage, home)), ease: "linear", face: neutral, fade: [0, 1] });
    }
    segments.length = 0;
    segments.push(...kept);
    for (let i = cues.length - 1; i >= 0; i--) {
      const c = cues[i];
      if (c.t > t && (c.kind === "clip" || c.kind === "settle") && c.unit === actorId)
        cues.splice(i, 1);
    }
    for (let i = phases.length - 1; i >= 0; i--)
      if (phases[i].start > t) phases.splice(i, 1);
    duration = Math.max(t + (away ? 440 : 0) + 900, ...cues.map((c) => c.t)) ;
    release = Math.max(release > t ? t + pick(TIMING.banner, pace) : release, t);
  }

  cues.sort((a, b) => a.t - b.t);
  return {
    actor: actorId,
    archetype,
    duration,
    release: Math.min(release, duration),
    firstContact: contactsAt[0] ?? 0,
    phases,
    segments,
    cues,
    projectiles,
    debug,
  };
}

/* ------------------------------------------------------------- sampling -- */

const easeFn = {
  linear: (t: number) => t,
  in: (t: number) => t * t,
  out: (t: number) => 1 - (1 - t) * (1 - t),
  inOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
};

export interface ActorPose {
  /** Feet, stage fractions. */
  x: number;
  y: number;
  face: 1 | -1;
  /** Height above the ground, share of the stage's height. */
  lift: number;
  opacity: number;
}

/**
 * A unit's feet at time `t` from its own segments, or null when it is at
 * home with no offset: before its first segment and from the end of its
 * last. Inside a segment it follows the path; in a gap between two it holds
 * where the earlier one left it. Overlapping segments: the later-starting
 * one wins, so a turn can be laid over a hold.
 */
export function sampleSegments(
  segments: Segment[],
  t: number,
): ActorPose | null {
  if (!segments.length) return null;
  let first = Infinity;
  let last = -Infinity;
  let inside: Segment | null = null;
  let before: Segment | null = null;
  for (const s of segments) {
    first = Math.min(first, s.start);
    last = Math.max(last, s.end);
    if (s.start <= t && t < s.end) {
      if (!inside || s.start >= inside.start) inside = s;
    } else if (s.end <= t && (!before || s.end >= before.end)) before = s;
  }
  if (t < first || t >= last) return null;
  const seg = inside ?? before;
  if (!seg) return null;
  const raw = inside
    ? seg.end > seg.start
      ? (t - seg.start) / (seg.end - seg.start)
      : 1
    : 1;
  const p = pathPoint(seg.path, easeFn[seg.ease](raw));
  const lift = seg.lift && inside ? seg.lift * 4 * raw * (1 - raw) : 0;
  const opacity = seg.fade
    ? seg.fade[0] + (seg.fade[1] - seg.fade[0]) * raw
    : 1;
  return { x: p.x, y: p.y, face: seg.face, lift, opacity };
}

function positionAt(segments: Segment[], unit: string, t: number): Vec | null {
  const p = sampleSegments(segments.filter((s) => s.unit === unit), t);
  return p ? { x: p.x, y: p.y } : null;
}
function faceAt(segments: Segment[], unit: string, t: number): 1 | -1 | null {
  const p = sampleSegments(segments.filter((s) => s.unit === unit), t);
  return p ? p.face : null;
}

/* ------------------------------------------------------------- the round -- */

export interface RoundTimeline {
  duration: number;
  cues: Cue[];
  segments: Segment[];
  projectiles: ProjectilePlan[];
  moves: { start: number; timeline: MoveTimeline }[];
  /** How squeezed the round is: 1 natural, 0 every phase at its floor. */
  pace: number;
}

export interface RoundInput {
  beats: Beat[];
  /** Choreograph one move at a pace, given who is standing. */
  choreograph: (move: Move, pace: number, alive: (id: string) => boolean) => MoveTimeline;
  /** Who is standing when the round begins. */
  alive: (id: string) => boolean;
  cap?: number;
}

/** Banners and ticks with no move of their own, one after another. */
function looseBeats(beats: Beat[], start: number, pace: number) {
  const cues: Cue[] = [];
  let t = start;
  for (const beat of beats) {
    cues.push({ t, kind: "beat", beat });
    t +=
      beat.kind === "combo" || beat.kind === "defeat"
        ? pick(TIMING.banner, pace)
        : 240 + (beat.kind === "damage" ? hitStop(beat.amount ?? 0) : 0);
  }
  return { cues, end: t };
}

/** Lay a round's moves out at one pace. */
export function layRound(input: RoundInput, pace: number): RoundTimeline {
  const round = splitRound(input.beats);
  const cues: Cue[] = [];
  const segments: Segment[] = [];
  const projectiles: ProjectilePlan[] = [];
  const moves: RoundTimeline["moves"] = [];
  const dead = new Set<string>();
  const alive = (id: string) => input.alive(id) && !dead.has(id);
  const loose = looseBeats(round.preamble, 0, pace);
  cues.push(...loose.cues);
  let next = loose.end;
  let end = loose.end;
  /** When each unit is back home and free. */
  const busy = new Map<string, number>();
  let previous: { actor: string; start: number; tl: MoveTimeline } | null = null;
  for (const move of round.moves) {
    let at = next;
    if (move.pre.length) {
      const pre = looseBeats(move.pre, at, pace);
      cues.push(...pre.cues);
      at = pre.end;
    }
    const tl = input.choreograph(move, pace, alive);
    const actor = move.cast.actor ?? "";
    // One actor never overlaps itself, and nobody starts a move while it is
    // still crossing the floor from the last one.
    if (previous && previous.actor === actor)
      at = Math.max(at, previous.start + previous.tl.duration);
    at = Math.max(at, busy.get(actor) ?? 0);
    // Anyone this move lands on is home before it lands.
    const targets = new Set(
      [move.cast.target, ...move.beats.map((b) => b.target)].filter(
        (id): id is string => !!id && id !== actor,
      ),
    );
    for (const id of targets) {
      const free = busy.get(id) ?? 0;
      if (at + tl.firstContact < free + 40) at = free + 40 - tl.firstContact;
      // A melee attacker also needs its target home before it sets off,
      // since it aims at where the target stands.
      if (tl.segments.length && at < free) at = free;
    }
    for (const c of tl.cues) cues.push({ ...c, t: c.t + at } as Cue);
    for (const s of tl.segments)
      segments.push({ ...s, start: s.start + at, end: s.end + at });
    for (const p of tl.projectiles)
      projectiles.push({ ...p, spawn: p.spawn + at, arrive: p.arrive + at });
    moves.push({ start: at, timeline: tl });
    if (tl.segments.length) busy.set(actor, at + tl.duration);
    for (const c of tl.cues)
      if (c.kind === "beat" && c.beat.kind === "defeat" && c.beat.target)
        dead.add(c.beat.target);
    end = Math.max(end, at + tl.duration);
    next = at + tl.release;
    previous = { actor, start: at, tl };
  }
  const tail = looseBeats(round.epilogue, Math.max(next, end - 200), pace);
  cues.push(...tail.cues);
  end = Math.max(end, tail.end);
  // Every beat is shown, in the engine's order where it matters: a unit's
  // own beats never swap.
  cues.sort((a, b) => a.t - b.t);
  return { duration: end, cues, segments, projectiles, moves, pace };
}

/**
 * Lay a round out, squeezing every phase towards its floor, all by the same
 * share, until it fits the cap. A round too busy to fit at its floors runs at
 * its floors, longer than the cap, rather than faster than anyone can follow.
 */
export function scheduleRound(input: RoundInput): RoundTimeline {
  const cap = input.cap ?? Infinity;
  const natural = layRound(input, 1);
  if (natural.duration <= cap) return natural;
  const floor = layRound(input, 0);
  if (floor.duration >= cap) return floor;
  let lo = 0;
  let hi = 1;
  let best = floor;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const r = layRound(input, mid);
    if (r.duration <= cap) {
      best = r;
      lo = mid;
    } else hi = mid;
  }
  return best;
}
