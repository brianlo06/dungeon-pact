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
import type { StageGeom } from "./stage-geometry";
import type { Stagehand } from "./stagehand";
import type { Tracer } from "./trace";
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
  /** Lab and tests only: report what the replay presented, and when. */
  onTrace?: Tracer;
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
  /**
   * Whether the planned round has had its first frame. Its time zero is that
   * frame, not the moment it was planned: the frame that commits a new round
   * is a slow one, and a clock started before it would jump the first fifth
   * of a second of the replay — an anticipation — in a single frame.
   */
  const started = useRef(false);
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

  /** Replay speed reaches the clock only while a round is replaying. */
  const applyRate = useCallback(() => {
    const playing = !!plan.current;
    clock.speed = playing ? speedRef.current : 1;
    clock.paused = playing && pausedRef.current;
  }, [clock]);

  const publish = useCallback((next: DirectorCues) => {
    live.current = next;
    setCues(next);
  }, []);

  const finish = useCallback(
    (snapshot: Snapshot) => {
      const wasPlaying = !!plan.current;
      plan.current = null;
      cursor.current = 0;
      settled.current = healthOf(snapshot);
      applyRate();
      // Everyone home and at rest, nothing in the air, whatever was playing.
      handRef.current?.reset();
      if (wasPlaying) {
        for (const u of [...snapshot.players, ...snapshot.enemies])
          hooksRef.current.onSettle?.(u.id);
        hooksRef.current.onTrace?.({ kind: "end", t: clock.time });
      }
      publish({
        hp: null,
        beat: null,
        title: null,
        pops: [],
        vfx: [],
        playing: false,
        frozen: false,
      });
    },
    [applyRate, publish, clock],
  );

  /** Turn one beat into everything the screen should do about it. */
  const perform = useCallback(
    (beat: Beat, at: number, by?: string) => {
      const cur = live.current;
      const next: DirectorCues = { ...cur, beat };
      const key = () => ++keys.current;
      hooksRef.current.onTrace?.({
        kind: "beat",
        t: clock.time,
        due: at,
        name: beat.kind,
        unit: beat.actor,
        to: beat.target,
        amount: beat.amount,
        hp: beat.hp,
        detail: by,
      });
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
          // Whatever it was holding is spent when the move is delivered, not
          // when it is named: the choreography's `spend` cue, on the strike.
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
          perform(cue.beat, at, cue.by);
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
        case "phase":
          hooksRef.current.onTrace?.({
            kind: "phase",
            t: clock.time,
            due: at,
            unit: cue.unit,
            name: cue.phase,
          });
          handRef.current?.cue(cue, at);
          break;
        case "spend":
          // Whatever it was holding, it has now spent: the strike hands back
          // to idle, not to the pose it has just released.
          hooksRef.current.onRest?.(cue.unit, "idle");
          break;
        case "sound":
          hooksRef.current.onSound?.(cue.name);
          hooksRef.current.onTrace?.({ kind: "sound", t: clock.time, due: at, name: cue.name });
          break;
        default:
          handRef.current?.cue(cue, at);
      }
    },
    [perform, clock],
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
    plan.current = planRound(s, beats, g, hooksRef.current.plan);
    cursor.current = 0;
    started.current = false;
    applyRate();
    publish({
      ...live.current,
      hp: { ...board.current },
      equipment: equipmentBefore(s, beats),
      playing: true,
    });
  }, [s, reduced, finish, applyRate, publish, clock]);

  // Each frame: play every cue that is due, expire what has lived its life.
  useEffect(
    () =>
      loop.add(ORDER.director, ({ time }) => {
        const p = plan.current;
        if (p && !started.current && geom.current) {
          started.current = true;
          startAt.current = time;
          handRef.current?.begin(p, geom.current, time);
          hooksRef.current.onTrace?.({
            kind: "round",
            t: time,
            detail: String(p.duration),
          });
        }
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
    [loop, play, finish, publish, clock],
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
      const p = plan.current;
      if (!p || !started.current) return;
      const t = clock.time - startAt.current;
      const next = p.cues
        .slice(cursor.current)
        .find((c) => c.kind === "beat" && c.t > t);
      clock.step(Math.max(0, (next ? next.t : p.duration) - t) + 0.5);
    },
    frameStep: () => clock.step(1000 / 60),
    skip: () => {
      if (plan.current) hooksRef.current.onTrace?.({ kind: "skip", t: clock.time });
      if (s) finish(s);
    },
    timeline: () => plan.current,
    elapsed: () =>
      plan.current && started.current ? clock.time - startAt.current : null,
  };
}
