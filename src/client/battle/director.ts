import { useCallback, useEffect, useRef, useState } from "react";
import type { Beat, Snapshot } from "../../shared/model";
import type { ClipName, SfxName } from "../../shared/presentation";
import {
  equipmentBefore,
  equipmentStep,
  type EquipmentBoard,
} from "../equipment/replay";
import type { PlayOptions } from "./animation";
import { ORDER, type FrameLoop } from "./clock";
import { hitStop } from "./pacing";
import {
  hitPoint,
  splitRound,
  groupConsequences,
  type Cue,
  type RoundTimeline,
} from "./choreography";
import { hitAnchor, planRound, type PlanOptions } from "./round-plan";
import type { CinematicMode, Framing } from "../../shared/cinematic";
import { cinematicFor, reducedCinematic } from "../../content/cinematics";
import type { UltimateDef } from "../../content/ultimates";
import { CinematicRun } from "../cinematic/run";
import {
  revealed,
  splitUltimates,
  type UltimateSegment,
} from "../cinematic/segments";
import { framingFor, instantsBetween, type Instant } from "../cinematic/timeline";
import { unitPresentation } from "./layout";
import type { StageGeom } from "./stage-geometry";
import type { Stagehand } from "./stagehand";
import type { Vec } from "./trajectory";

/**
 * The presentation director.
 *
 * The engine resolves a whole round at once and reports it as an ordered list
 * of beats. The director has the choreographer turn that list into a timeline
 * (see `choreography.ts`) and plays it on the presentation clock: actors set
 * off, strike and come home, arrows fly, and each beat — the damage number,
 * the health bar dropping, the flinch, the hit-stop, the sound — is shown at
 * the moment the blow or the shot that caused it lands.
 *
 * It decides nothing. Every number it shows and every event it plays came from
 * the server; if the director never ran, the board would still be correct.
 *
 * One clock rather than a scattering of `setTimeout`s is what makes speed
 * control, pausing, stepping and hit-stop possible at all — each of those is
 * just a different way of advancing the clock — and the same clock drives the
 * rigs, so a hit can no longer land before its strike at any speed.
 */

export type CueKind = Beat["kind"];

/** A floating number or word thrown off a unit. */
export interface Pop {
  key: number;
  unit: string;
  text: string;
  tone: "damage" | "heal" | "block" | "gold" | "critical";
  /** Presentation time it was thrown, for expiry. */
  born?: number;
}

/** A world-space effect, positioned by the stage from unit ids. */
export interface Vfx {
  key: number;
  itemId?: string;
  kind:
    | "impact"
    | "slash"
    | "cast"
    | "projectile"
    | "heal"
    | "barrier"
    | "interrupt"
    | "seize"
    | "reclaim"
    | "gearTransfer";
  from?: string;
  to?: string;
  /** Where exactly it lands, stage fractions: the target's hit anchor. */
  at?: Vec;
  /** Milliseconds this effect lives for, in real time at the current rate. */
  life: number;
  /** Presentation time it was spawned and how long it lasts there. */
  born?: number;
  span?: number;
}

export interface DirectorCues {
  equipment?: EquipmentBoard;
  gearPulses?: Record<string, { itemId: string; key: number }>;
  /** Health to render while replaying; null once the round has settled. */
  hp: Record<string, number> | null;
  beat: Beat | null;
  title: { text: string; actor?: string } | null;
  pops: Pop[];
  vfx: Vfx[];
  playing: boolean;
  /** True during a hit-stop, so the stage can hold still for a beat. */
  frozen: boolean;
  /** The Ultimate being played as a cinematic, before the round, if any. */
  cinematic?: CinematicRun | null;
}

export interface DirectorControls {
  speed: number;
  setSpeed: (n: number) => void;
  paused: boolean;
  setPaused: (v: boolean) => void;
  /** Advance to the next beat while paused. */
  step: () => void;
  /** Advance one frame of presentation time while paused. */
  frameStep: () => void;
  skip: () => void;
  /**
   * End the Ultimate cinematic on screen now: its results are shown at once,
   * its sound is silenced, and the round carries on from there.
   */
  skipCinematic: () => void;
  /** The cinematic playing, for the Battle Lab. */
  cinematicRun: () => CinematicRun | null;
  /** The round being played, for the Battle Lab and the debug overlay. */
  timeline: () => RoundTimeline | null;
  /** How far into the round's timeline the clock is, or null. */
  elapsed: () => number | null;
}

const healthOf = (s: Snapshot) =>
  Object.fromEntries([...s.players, ...s.enemies].map((u) => [u.id, u.hp]));

export interface DirectorHooks {
  onShake?: (amount: number) => void;
  onSound?: (name: SfxName) => void;
  /** Ask a combatant for a clip. The director never knows how it is drawn. */
  onClip?: (
    unit: string,
    clip: ClipName,
    then?: ClipName,
    opts?: PlayOptions,
  ) => void;
  /**
   * Change the loop a combatant returns to between actions. The stage sets
   * it from the settled board — a held windup while a wind-up is announced —
   * and leaves it alone during a replay, which is the round *before* that
   * board. Only the replay knows the moment a held wind-up ends: when the
   * move lands, or when it is interrupted.
   */
  onRest?: (unit: string, clip: ClipName) => void;
  /** Back to rest now: the end of a replay, a skip. */
  onSettle?: (unit: string) => void;
  /** Where everyone stands, for the choreographer. */
  geometry?: (alive: (id: string) => boolean) => StageGeom | null;
  /** Lab only: override how moves are choreographed. */
  plan?: PlanOptions;
  /** FULL or FAST, for this Ultimate; the player's setting decides. */
  cinematicMode?: (u: UltimateDef) => CinematicMode;
  /** A cinematic finished or was skipped: the player has now seen it. */
  onCinematicSeen?: (u: UltimateDef) => void;
  /** A group of sounds a skip can silence. */
  openChannel?: () => { play: (name: string) => void; stop: () => void };
  /** Dip the music under a moment. */
  onDuck?: (level: number, ms: number) => void;
  /**
   * Where the battle camera should look while a cinematic is on the
   * battlefield: at its caster as it is called, and back to neutral after.
   */
  onCinematicFocus?: (unit: string | null) => void;
  /** Lab only: force the target framing. */
  framing?: Framing;
}

export interface DirectorOptions {
  loop: FrameLoop;
  stagehand?: Stagehand | null;
}

/** How long each effect lives, in presentation milliseconds. */
const LIFE: Record<Vfx["kind"], number> = {
  impact: 380,
  slash: 260,
  cast: 420,
  projectile: 320,
  heal: 460,
  barrier: 380,
  interrupt: 520,
  seize: 720,
  reclaim: 760,
  gearTransfer: 720,
};
/** Numbers stay up this long, presentation milliseconds. */
const POP_LIFE = 900;

export function useDirector(
  s: Snapshot | null,
  reduced: boolean,
  hooks: DirectorHooks,
  { loop, stagehand }: DirectorOptions,
): DirectorCues & DirectorControls {
  const [cues, setCues] = useState<DirectorCues>({
    hp: null,
    beat: null,
    title: null,
    pops: [],
    vfx: [],
    playing: false,
    frozen: false,
    cinematic: null,
  });
  const [speed, setSpeedState] = useState(1);
  const [paused, setPausedState] = useState(false);

  /** The last chronicle entry seen; null until the first board arrives. */
  const seen = useRef<number | null>(null);
  const settled = useRef<Record<string, number>>({});
  const board = useRef<Record<string, number>>({});
  const plan = useRef<RoundTimeline | null>(null);
  const geom = useRef<StageGeom | null>(null);
  const startAt = useRef(0);
  const cursor = useRef(0);
  const keys = useRef(0);
  const live = useRef<DirectorCues>(cues);
  const speedRef = useRef(speed);
  const pausedRef = useRef(paused);
  speedRef.current = speed;
  pausedRef.current = paused;
  const hooksRef = useRef(hooks);
  hooksRef.current = hooks;
  const handRef = useRef(stagehand);
  handRef.current = stagehand;
  const snap = useRef(s);
  snap.current = s;
  const clock = loop.clock;
  /** The Ultimate on screen, those still to play, and the round after them. */
  const cine = useRef<CinematicRun | null>(null);
  const queue = useRef<UltimateSegment[]>([]);
  const after = useRef<Beat[] | null>(null);
  const channel = useRef<{ play: (n: string) => void; stop: () => void } | null>(null);
  const reducedRun = useRef(false);

  /** Replay speed reaches the clock only while a round is replaying. */
  const applyRate = useCallback(() => {
    const playing = !!plan.current || !!cine.current;
    clock.speed = playing ? speedRef.current : 1;
    clock.paused = playing && pausedRef.current;
  }, [clock]);

  const publish = useCallback((next: DirectorCues) => {
    live.current = next;
    setCues(next);
  }, []);

  const finish = useCallback(
    (snapshot: Snapshot) => {
      const wasPlaying = !!plan.current || !!cine.current;
      if (cine.current) {
        cine.current.done = true;
        hooksRef.current.onCinematicFocus?.(null);
      }
      cine.current = null;
      queue.current = [];
      after.current = null;
      channel.current?.stop();
      channel.current = null;
      plan.current = null;
      cursor.current = 0;
      settled.current = healthOf(snapshot);
      applyRate();
      // Everyone home and at rest, nothing in the air, whatever was playing.
      handRef.current?.reset();
      if (wasPlaying)
        for (const u of [...snapshot.players, ...snapshot.enemies])
          hooksRef.current.onSettle?.(u.id);
      publish({
        hp: null,
        beat: null,
        title: null,
        pops: [],
        vfx: [],
        playing: false,
        frozen: false,
        cinematic: null,
      });
    },
    [applyRate, publish],
  );

  /** Turn one beat into everything the screen should do about it. */
  const perform = useCallback(
    (beat: Beat, at: number) => {
      const cur = live.current;
      const next: DirectorCues = { ...cur, beat };
      const key = () => ++keys.current;
      const rate = Math.max(0.05, clock.speed * clock.tempo);

      if (cur.equipment && beat.equipment)
        next.equipment = equipmentStep(cur.equipment, beat.equipment);
      for (const cue of beat.equipment ?? []) {
        next.gearPulses = {
          ...next.gearPulses,
          [cue.ownerId]: { itemId: cue.itemId, key: key() },
        };
      }

      if (beat.target && beat.hp !== undefined)
        board.current[beat.target] = beat.hp;
      next.hp = { ...board.current };

      const where = (id?: string): Vec | undefined => {
        const u = id ? geom.current?.units.get(id) : undefined;
        const g = geom.current;
        if (!u || !g || !snap.current) return undefined;
        const p = hitPoint(u, hitAnchor(snap.current, u.id));
        return { x: p.x / g.width, y: p.y / g.height };
      };
      const add = (v: Omit<Vfx, "key" | "life">) =>
        (next.vfx = [
          ...next.vfx,
          {
            ...v,
            key: key(),
            life: LIFE[v.kind] / rate,
            born: at,
            span: LIFE[v.kind],
          },
        ]);
      const pop = (text: string, tone: Pop["tone"], unit?: string) => {
        // A hit that did nothing should not throw a number; "+0" reads as a bug.
        if (!unit || !beat.amount) return;
        next.pops = [...next.pops, { key: key(), unit, text, tone, born: at }];
      };
      const clip = (unit: string, name: ClipName, then?: ClipName) =>
        hooksRef.current.onClip?.(unit, name, then, { at, force: true });

      for (const cue of beat.equipment ?? []) {
        if (cue.action !== "trigger")
          add({
            kind: "gearTransfer",
            itemId: cue.itemId,
            from: cue.action === "seize" ? cue.ownerId : cue.containerId,
            to: cue.action === "seize" ? cue.containerId : cue.ownerId,
          });
      }

      switch (beat.kind) {
        case "cast":
          next.title = { text: beat.label ?? "", actor: beat.actor };
          // Whatever it was holding, it has now spent: the strike hands back
          // to idle, not to the pose it has just released.
          if (beat.actor) hooksRef.current.onRest?.(beat.actor, "idle");
          add({ kind: "cast", from: beat.actor });
          break;
        case "damage": {
          // A blow the actor paid for itself flinches like any other.
          if (beat.target) clip(beat.target, "hurt");
          add({ kind: "impact", to: beat.target, at: where(beat.target) });
          add({ kind: "slash", to: beat.target, at: where(beat.target) });
          pop(
            `${beat.amount ?? 0}`,
            (beat.amount ?? 0) >= 30 ? "critical" : "damage",
            beat.target,
          );
          hooksRef.current.onShake?.((beat.amount ?? 0) >= 20 ? 0.012 : 0.005);
          hooksRef.current.onSound?.(
            (beat.amount ?? 0) >= 24 ? "impact-heavy" : "impact-light",
          );
          const stop = hitStop(beat.amount ?? 0);
          if (stop) {
            clock.hold(stop);
            next.frozen = true;
          }
          break;
        }
        case "heal":
          add({ kind: "heal", to: beat.target, at: where(beat.target) });
          pop(`+${beat.amount ?? 0}`, "heal", beat.target);
          hooksRef.current.onSound?.("heal");
          break;
        case "block":
          if (beat.target) clip(beat.target, "block");
          add({ kind: "barrier", to: beat.target, at: where(beat.target) });
          pop(`⬡${beat.amount ?? 0}`, "block", beat.target);
          hooksRef.current.onSound?.("shield-block");
          break;
        case "combo":
          next.title = { text: beat.label ?? "", actor: beat.actor };
          // Beat labels are the presentation vocabulary the engine already
          // speaks. Matching on them is not the same as knowing a boss by name:
          // any content that produces a seizure gets this choreography.
          if (beat.label === "SEIZED")
            add({ kind: "seize", from: beat.target, to: "strongbox" });
          else if (beat.label === "RECLAIMED")
            add({ kind: "reclaim", from: beat.target });
          else if (beat.label === "INTERRUPTED") {
            add({ kind: "interrupt", to: beat.target, at: where(beat.target) });
            // The held pose breaks: a flinch, and back to idle rather than to
            // the wind-up it no longer has.
            if (beat.target) {
              hooksRef.current.onRest?.(beat.target, "idle");
              clip(beat.target, "hurt");
            }
          }
          hooksRef.current.onShake?.(0.014);
          hooksRef.current.onSound?.(
            beat.label === "SEIZED"
              ? "chain"
              : beat.label === "RECLAIMED"
                ? "vault-break"
                : beat.label === "INTERRUPTED"
                  ? "interrupt"
                  : "impact-metal",
          );
          if (beat.label === "SEIZED") hooksRef.current.onSound?.("lock");
          break;
        case "defeat":
          if (beat.target) clip(beat.target, "defeat", "defeat");
          hooksRef.current.onShake?.(0.02);
          hooksRef.current.onSound?.("down");
          break;
      }
      publish(next);
    },
    [clock, publish],
  );

  /** Play one cue of the timeline, due at clock time `at`. */
  const play = useCallback(
    (cue: Cue, at: number) => {
      switch (cue.kind) {
        case "beat":
          perform(cue.beat, at);
          break;
        case "clip":
          hooksRef.current.onClip?.(cue.unit, cue.clip, cue.then, {
            at,
            force: true,
            rate: cue.rate,
            absorb: cue.absorb,
          });
          break;
        case "settle":
          hooksRef.current.onSettle?.(cue.unit);
          break;
        case "sound":
          hooksRef.current.onSound?.(cue.name);
          break;
        default:
          handRef.current?.cue(cue, at);
      }
    },
    [perform],
  );

  /** Start the choreographed round: the beats that follow any Ultimates. */
  const beginRound = useCallback(
    (beats: Beat[]) => {
      const current = snap.current;
      if (!current) return;
      const g = geom.current;
      const hasMove = beats.some((b) => b.kind === "cast");
      if (!g || !beats.length || !hasMove) {
        // Nothing left to choreograph: show what is left and settle.
        for (const b of beats)
          if (b.target && b.hp !== undefined) board.current[b.target] = b.hp;
        finish(current);
        return;
      }
      plan.current = planRound(current, beats, g, hooksRef.current.plan);
      cursor.current = 0;
      startAt.current = clock.time;
      applyRate();
      handRef.current?.begin(plan.current, g, startAt.current);
      publish({
        ...live.current,
        hp: { ...board.current },
        cinematic: null,
        playing: true,
      });
    },
    [applyRate, clock, finish, publish],
  );

  /** Show a segment's results: health, numbers over the board, falls. */
  const reveal = useCallback(
    (run: CinematicRun, which: "impact" | "ward" | "all") => {
      const seg = run.segment;
      const show = revealed(seg.beats, which);
      const next: DirectorCues = { ...live.current };
      let changed = false;
      const at = clock.time;
      for (const b of show) {
        const index = seg.beats.indexOf(b);
        if (run.revealed.has(index)) continue;
        run.revealed.add(index);
        changed = true;
        if (run.reduced) continue;
        if (b.target && b.hp !== undefined) board.current[b.target] = b.hp;
        if (next.equipment && b.equipment)
          next.equipment = equipmentStep(next.equipment, b.equipment);
        const amount = b.amount ?? 0;
        if ((b.kind === "ward" || b.kind === "heal") && b.target && amount)
          next.pops = [
            ...next.pops,
            {
              key: ++keys.current,
              unit: b.target,
              text: b.kind === "ward" ? `⬡${amount}` : `+${amount}`,
              tone: b.kind === "ward" ? "block" : "heal",
              born: at,
            },
          ];
        if (b.kind === "defeat" && b.target)
          hooksRef.current.onClip?.(b.target, "defeat", "defeat", { at, force: true });
        if (b.kind === "combo" && b.label === "INTERRUPTED" && b.target)
          hooksRef.current.onRest?.(b.target, "idle");
      }
      if (changed && !run.reduced) publish({ ...next, hp: { ...board.current } });
    },
    [clock, publish],
  );

  /** Play the next queued Ultimate, or the round once none are left. */
  const nextCinematic = useCallback(() => {
    const seg = queue.current.shift();
    if (!seg) {
      cine.current = null;
      applyRate();
      const rest = after.current;
      after.current = null;
      if (reducedRun.current || !rest) {
        if (snap.current) finish(snap.current);
        return;
      }
      beginRound(rest);
      return;
    }
    const current = snap.current;
    const primary = current?.enemies.find((e) => e.id === seg.targets[0]);
    const framing =
      hooksRef.current.framing ??
      framingFor(unitPresentation(primary?.definition).footprint);
    const reduced = reducedRun.current;
    const film = reduced ? reducedCinematic(seg.def) : cinematicFor(seg.def);
    const mode = reduced ? "full" : (hooksRef.current.cinematicMode?.(seg.def) ?? "full");
    const run = new CinematicRun(seg, film, mode, framing, clock.time, reduced);
    cine.current = run;
    channel.current?.stop();
    channel.current = hooksRef.current.openChannel?.() ?? null;
    applyRate();
    publish({ ...live.current, cinematic: run, playing: true });
  }, [applyRate, beginRound, clock, finish, publish]);

  /** End the cinematic on screen, showing everything it had left to show. */
  const endCinematic = useCallback(
    (skipped: boolean) => {
      const run = cine.current;
      if (!run) return;
      reveal(run, "all");
      run.done = true;
      if (skipped) {
        channel.current?.stop();
        channel.current = null;
        // Nothing the film asked for may linger on the board it hands back.
        for (const id of run.segment.targets) hooksRef.current.onSettle?.(id);
        if (run.segment.cast.actor) hooksRef.current.onSettle?.(run.segment.cast.actor);
      }
      hooksRef.current.onCinematicFocus?.(null);
      hooksRef.current.onCinematicSeen?.(run.segment.def);
      nextCinematic();
    },
    [nextCinematic, reveal],
  );

  /** One of a cinematic's instantaneous cues, now due. */
  const cue = useCallback(
    (run: CinematicRun, x: Instant, at: number) => {
      const h = hooksRef.current;
      const seg = run.segment;
      const shot = run.timeline.shots[x.shot];
      switch (x.kind) {
        case "shot":
          run.shot = x.shot;
          if (shot.space === "battlefield")
            h.onCinematicFocus?.(x.shot === 0 ? (seg.cast.actor ?? null) : null);
          break;
        case "sound":
          channel.current?.play(x.sfx);
          break;
        case "shake":
          run.shake = Math.min(0.06, run.shake + x.amount);
          if (shot.space === "battlefield") h.onShake?.(x.amount);
          break;
        case "stop":
          if (!run.reduced) clock.hold(x.ms);
          break;
        case "duck":
          h.onDuck?.(x.level, x.ms);
          break;
        case "reveal":
          reveal(run, x.reveal);
          break;
        case "marker":
          run.marker = x.label;
          break;
        case "clip": {
          const opts = { at, force: true } as const;
          const clip = x.clip as ClipName;
          const then = x.then as ClipName | undefined;
          if (run.reduced) break;
          if (shot.space === "battlefield") {
            const ids =
              x.role === "caster"
                ? [seg.cast.actor ?? ""]
                : x.role === "allies"
                  ? []
                  : x.role === "target"
                    ? seg.targets.slice(0, 1)
                    : seg.targets;
            for (const id of ids) if (id) h.onClip?.(id, clip, then, opts);
            break;
          }
          const ids =
            x.role === "caster"
              ? ["caster"]
              : x.role === "target"
                ? ["targets-0"]
                : x.role === "targets"
                  ? seg.targets.map((_, i) => `targets-${i}`)
                  : (snap.current?.players ?? [])
                      .filter((p) => p.id !== seg.cast.actor && !p.fallen)
                      .map((_, i) => `allies-${i}`);
          for (const id of ids) h.onClip?.(`cine:${run.key}:${id}`, clip, then, opts);
          break;
        }
      }
    },
    [clock, reveal],
  );

  // Plan the timeline whenever the server sends a round we have not played.
  useEffect(() => {
    if (!s) return;
    // The first board is shown as it stands. The chronicle it arrives with
    // is history — a previous fight's rounds, the rounds before a reconnect —
    // and replaying it would show the party a fight they have already seen.
    const first = seen.current === null;
    const fresh = s.logs.filter((l) => l.seq > (seen.current ?? 0) && l.beat);
    seen.current = s.logs.length ? s.logs[s.logs.length - 1].seq : 0;
    const before = { ...healthOf(s), ...settled.current };
    const standing = (id: string) => (before[id] ?? 1) > 0;
    const beats = fresh.map((l) => l.beat!);
    if (first || !fresh.length || s.phase !== "COMBAT") {
      finish(s);
      return;
    }
    const { segments, rest } = splitUltimates(beats);
    if (reduced && segments.length) {
      // Reduced motion: the board settles at once, and each Ultimate is still
      // announced — a still card, not a film — before play resumes.
      finish(s);
      reducedRun.current = true;
      queue.current = segments;
      after.current = null;
      nextCinematic();
      return;
    }
    reducedRun.current = false;
    if (reduced) {
      // Reduced motion: the board settles at once, and each move is pointed
      // out in place — who acted, on whom — without anything moving.
      finish(s);
      const g = hooksRef.current.geometry?.(standing);
      if (g && handRef.current) {
        const moves = splitRound(beats).moves.map((m) => {
          const c = groupConsequences(m);
          const targets = [
            ...new Set([
              ...c.contacts.flatMap((x) => x.targets),
              ...(m.cast.target ? [m.cast.target] : []),
            ]),
          ];
          return { actor: m.cast.actor ?? "", targets };
        });
        handRef.current.reduced(moves, g, clock.time);
      }
      return;
    }
    board.current = { ...settled.current, ...healthOf(s) };
    for (const [id, hp] of Object.entries(settled.current))
      board.current[id] = hp;
    const g = hooksRef.current.geometry?.(standing) ?? null;
    geom.current = g;
    if (!g) {
      finish(s);
      return;
    }
    if (segments.length) {
      // Ultimates first, each as its own film; the round follows them.
      queue.current = segments;
      after.current = rest;
      publish({
        ...live.current,
        hp: { ...board.current },
        equipment: equipmentBefore(s, beats),
      });
      nextCinematic();
      return;
    }
    plan.current = planRound(s, beats, g, hooksRef.current.plan);
    cursor.current = 0;
    startAt.current = clock.time;
    applyRate();
    handRef.current?.begin(plan.current, g, startAt.current);
    publish({
      ...live.current,
      hp: { ...board.current },
      equipment: equipmentBefore(s, beats),
      playing: true,
    });
  }, [s, reduced, finish, applyRate, publish, clock, nextCinematic]);

  // Each frame: play every cue that is due, expire what has lived its life.
  useEffect(
    () =>
      loop.add(ORDER.director, ({ time }) => {
        const run = cine.current;
        if (run) {
          const t = run.at(time);
          for (const x of instantsBetween(run.timeline, run.fired, t)) {
            cue(run, x, run.start + x.t);
            if (cine.current !== run) return;
          }
          run.fired = t;
          if (t >= run.duration) {
            endCinematic(false);
            return;
          }
        }
        const p = plan.current;
        if (p) {
          const t = time - startAt.current;
          while (cursor.current < p.cues.length && p.cues[cursor.current].t <= t) {
            const cue = p.cues[cursor.current++];
            play(cue, startAt.current + cue.t);
            if (plan.current !== p) return;
          }
          if (cursor.current >= p.cues.length && t >= p.duration && snap.current) {
            finish(snap.current);
            return;
          }
        }
        const cur = live.current;
        const frozen = clock.frozen;
        const vfx = cur.vfx.filter((v) => time - (v.born ?? time) < (v.span ?? 0));
        const pops = cur.pops.filter((q) => time - (q.born ?? time) < POP_LIFE);
        if (
          vfx.length !== cur.vfx.length ||
          pops.length !== cur.pops.length ||
          frozen !== cur.frozen
        )
          publish({ ...cur, vfx, pops, frozen });
      }),
    [loop, play, finish, publish, clock, cue, endCinematic],
  );

  // Leaving the stage puts everyone home.
  useEffect(() => () => handRef.current?.reset(), []);

  // A round that has arrived but whose replay has not started yet. The
  // snapshot renders once before the effect above rewinds it, and without
  // this that render reports the settled board of a round about to be
  // replayed — so anything reacting to "not playing" would act on it.
  const pending =
    !!s &&
    !reduced &&
    s.phase === "COMBAT" &&
    seen.current !== null &&
    s.logs.some((l) => l.seq > seen.current! && !!l.beat);

  return {
    ...cues,
    playing: cues.playing || pending,
    speed,
    setSpeed: (n: number) => {
      speedRef.current = n;
      setSpeedState(n);
      applyRate();
    },
    paused,
    setPaused: (v: boolean) => {
      pausedRef.current = v;
      setPausedState(v);
      applyRate();
    },
    step: () => {
      // Jump the clock to the next beat, however long it is until then.
      const run = cine.current;
      if (run) {
        const t = clock.time - run.start;
        const next = run.timeline.instants.find(
          (x) => (x.kind === "shot" || x.kind === "reveal") && x.t > t,
        );
        clock.step(Math.max(0, (next ? next.t : run.duration) - t) + 0.5);
        return;
      }
      const p = plan.current;
      if (!p) return;
      const t = clock.time - startAt.current;
      const next = p.cues
        .slice(cursor.current)
        .find((c) => c.kind === "beat" && c.t > t);
      clock.step(Math.max(0, (next ? next.t : p.duration) - t) + 0.5);
    },
    frameStep: () => clock.step(1000 / 60),
    skip: () => {
      if (s) finish(s);
    },
    skipCinematic: () => endCinematic(true),
    cinematicRun: () => cine.current,
    timeline: () => plan.current,
    elapsed: () =>
      cine.current
        ? cine.current.at(clock.time)
        : plan.current
          ? clock.time - startAt.current
          : null,
  };
}
