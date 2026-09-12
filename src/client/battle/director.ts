import { items } from "../../content/items";
import {
  equipmentBefore,
  equipmentStep,
  type EquipmentBoard,
} from "../equipment/replay";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Beat, Snapshot } from "../../shared/model";
import type { ClipName, SfxName } from "../../shared/presentation";
import { tempo } from "./tempo";
import { castClip } from "./hero-clips";
import { hitStop, paceRound } from "./pacing";

/**
 * The presentation director.
 *
 * The engine resolves a whole round at once and reports it as an ordered list
 * of beats. This turns that list into choreography: a single timeline, run by
 * a single animation frame loop, that moves the camera, spawns effects, throws
 * damage numbers and interpolates health.
 *
 * It decides nothing. Every number it shows and every event it plays came from
 * the server; if the director never ran, the board would still be correct.
 *
 * One loop rather than a scattering of `setTimeout`s is what makes speed
 * control, pausing, stepping and hit-stop possible at all — each of those is
 * just a different way of advancing the clock.
 */

export type CueKind = Beat["kind"];

/** A floating number or word thrown off a unit. */
export interface Pop {
  key: number;
  unit: string;
  text: string;
  tone: "damage" | "heal" | "block" | "gold" | "critical";
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
  /** Milliseconds this effect lives for, already scaled by playback speed. */
  life: number;
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
  skip: () => void;
}

/**
 * How late a beat may fire and still be timed from when it was due rather
 * than from when it fired. A frame's jitter is absorbed, so twenty beats do
 * not each add half a frame to the round; a pause, a step or a real stall is
 * not, so nothing is shown for less than its hold after one.
 */
const JITTER = 34;

const healthOf = (s: Snapshot) =>
  Object.fromEntries([...s.players, ...s.enemies].map((u) => [u.id, u.hp]));

export interface DirectorHooks {
  /** Called once per beat so the camera can frame it. */
  onCamera?: (beat: Beat | null) => void;
  onShake?: (amount: number) => void;
  onSound?: (name: SfxName) => void;
  /** Ask a combatant for a clip. The director never knows how it is drawn. */
  onClip?: (unit: string, clip: ClipName, then?: ClipName) => void;
  /**
   * Change the loop a combatant returns to between actions. The stage sets
   * it from the settled board — a held windup while a wind-up is announced —
   * and leaves it alone during a replay, which is the round *before* that
   * board. Only the replay knows the moment a held wind-up ends: when the
   * move lands, or when it is interrupted.
   */
  onRest?: (unit: string, clip: ClipName) => void;
}

export function useDirector(
  s: Snapshot | null,
  reduced: boolean,
  hooks: DirectorHooks = {},
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
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);

  /** The last chronicle entry seen; null until the first board arrives. */
  const seen = useRef<number | null>(null);
  const settled = useRef<Record<string, number>>({});
  /** The rest of the round, each beat with how long it holds. */
  const queue = useRef<{ beat: Beat; hold: number }[]>([]);
  const board = useRef<Record<string, number>>({});
  const waitUntil = useRef(0);
  const stepOnce = useRef(false);
  const keys = useRef(0);
  const raf = useRef(0);
  const live = useRef<DirectorCues>(cues);
  const speedRef = useRef(speed);
  const pausedRef = useRef(paused);
  speedRef.current = speed;
  pausedRef.current = paused;
  const hooksRef = useRef(hooks);
  hooksRef.current = hooks;
  const snap = useRef(s);
  snap.current = s;

  const finish = useCallback((snapshot: Snapshot) => {
    queue.current = [];
    settled.current = healthOf(snapshot);
    const done: DirectorCues = {
      hp: null,
      beat: null,
      title: null,
      pops: [],
      vfx: [],
      playing: false,
      frozen: false,
    };
    live.current = done;
    setCues(done);
    hooksRef.current.onCamera?.(null);
  }, []);

  /** Turn one beat into everything the screen should do about it. */
  const perform = useCallback((beat: Beat, hold: number, now: number) => {
    const cur = live.current;
    const next: DirectorCues = { ...cur, beat, frozen: false };
    if (cur.equipment && beat.equipment)
      next.equipment = equipmentStep(cur.equipment, beat.equipment);
    for (const cue of beat.equipment ?? []) {
      next.gearPulses = {
        ...next.gearPulses,
        [cue.ownerId]: { itemId: cue.itemId, key: ++keys.current },
      };
    }
    const key = () => ++keys.current;

    if (beat.target && beat.hp !== undefined)
      board.current[beat.target] = beat.hp;
    next.hp = { ...board.current };

    const add = (v: Omit<Vfx, "key">) =>
      (next.vfx = [...next.vfx, { ...v, key: key() }]);
    const pop = (text: string, tone: Pop["tone"], unit?: string) => {
      // A hit that did nothing should not throw a number; "+0" reads as a bug.
      if (!unit || !beat.amount) return;
      next.pops = [...next.pops, { key: key(), unit, text, tone }];
    };

    for (const cue of beat.equipment ?? []) {
      if (cue.action !== "trigger")
        add({
          kind: "gearTransfer",
          itemId: cue.itemId,
          from: cue.action === "seize" ? cue.ownerId : cue.containerId,
          to: cue.action === "seize" ? cue.containerId : cue.ownerId,
          life: 720,
        });
    }
    switch (beat.kind) {
      case "cast":
        next.title = { text: beat.label ?? "", actor: beat.actor };
        if (beat.actor) {
          // Whatever it was holding, it has now spent: the strike hands back
          // to idle, not to the pose it has just released.
          hooksRef.current.onRest?.(beat.actor, "idle");
          hooksRef.current.onClip?.(beat.actor, castClip(snap.current, beat));
        }
        add({ kind: "cast", from: beat.actor, life: 420 });
        if (beat.actor && beat.target && beat.actor !== beat.target)
          add({
            kind: "projectile",
            itemId: (
              cur.equipment?.worn[beat.actor] ??
              snap.current?.players.find((p) => p.id === beat.actor)?.items ??
              []
            ).find((id) => items.find((i) => i.id === id)?.slot === "weapon"),
            from: beat.actor,
            to: beat.target,
            life: 320,
          });
        hooksRef.current.onSound?.("swing-heavy");
        break;
      case "damage":
        if (beat.target) hooksRef.current.onClip?.(beat.target, "hurt");
        add({ kind: "impact", to: beat.target, life: 380 });
        add({ kind: "slash", to: beat.target, life: 260 });
        pop(
          `${beat.amount ?? 0}`,
          (beat.amount ?? 0) >= 30 ? "critical" : "damage",
          beat.target,
        );
        hooksRef.current.onShake?.((beat.amount ?? 0) >= 20 ? 0.012 : 0.005);
        hooksRef.current.onSound?.(
          (beat.amount ?? 0) >= 24 ? "impact-heavy" : "impact-light",
        );
        // The stop is already counted in this beat's hold.
        next.frozen = hitStop(beat.amount ?? 0) > 0;
        break;
      case "heal":
        add({ kind: "heal", to: beat.target, life: 460 });
        pop(`+${beat.amount ?? 0}`, "heal", beat.target);
        hooksRef.current.onSound?.("heal");
        break;
      case "block":
        if (beat.target) hooksRef.current.onClip?.(beat.target, "block");
        add({ kind: "barrier", to: beat.target, life: 380 });
        pop(`⬡${beat.amount ?? 0}`, "block", beat.target);
        hooksRef.current.onSound?.("shield-block");
        break;
      case "combo":
        next.title = { text: beat.label ?? "", actor: beat.actor };
        // Beat labels are the presentation vocabulary the engine already
        // speaks. Matching on them is not the same as knowing a boss by name:
        // any content that produces a seizure gets this choreography.
        if (beat.label === "SEIZED")
          add({ kind: "seize", from: beat.target, to: "strongbox", life: 720 });
        else if (beat.label === "RECLAIMED")
          add({ kind: "reclaim", from: beat.target, life: 760 });
        else if (beat.label === "INTERRUPTED") {
          add({ kind: "interrupt", to: beat.target, life: 520 });
          // The held pose breaks: a flinch, and back to idle rather than to
          // the wind-up it no longer has.
          if (beat.target) {
            hooksRef.current.onRest?.(beat.target, "idle");
            hooksRef.current.onClip?.(beat.target, "hurt");
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
        if (beat.target)
          hooksRef.current.onClip?.(beat.target, "defeat", "defeat");
        hooksRef.current.onShake?.(0.02);
        hooksRef.current.onSound?.("down");
        break;
    }
    hooksRef.current.onCamera?.(beat);
    live.current = next;
    setCues(next);
    const due = waitUntil.current;
    const from = due && now - due <= JITTER ? due : now;
    waitUntil.current =
      from + hold / Math.max(0.25, speedRef.current) / tempo();
  }, []);

  // Build the timeline whenever the server sends a round we have not played.
  useEffect(() => {
    if (!s) return;
    // The first board is shown as it stands. The chronicle it arrives with
    // is history — a previous fight's rounds, the rounds before a reconnect —
    // and replaying it would show the party a fight they have already seen.
    const first = seen.current === null;
    const fresh = s.logs.filter((l) => l.seq > (seen.current ?? 0) && l.beat);
    seen.current = s.logs.length ? s.logs[s.logs.length - 1].seq : 0;
    if (first || !fresh.length || reduced || s.phase !== "COMBAT") {
      finish(s);
      return;
    }
    board.current = { ...settled.current, ...healthOf(s) };
    for (const [id, hp] of Object.entries(settled.current))
      board.current[id] = hp;
    // Paced as a whole, so a long round is squeezed evenly rather than
    // running long.
    const beats = fresh.map((l) => l.beat!);
    const holds = paceRound(beats, {
      signature: (b) => b.kind === "cast" && castClip(s, b) === "signature",
    });
    queue.current = beats.map((beat, i) => ({ beat, hold: holds[i] }));
    waitUntil.current = 0;
    live.current = {
      ...live.current,
      hp: { ...board.current },
      equipment: equipmentBefore(s, beats),
      playing: true,
    };
    setCues(live.current);
  }, [s, reduced, finish]);

  // One loop. Pausing stops the clock; speed scales it; a step releases a beat.
  useEffect(() => {
    let stopped = false;
    const tick = () => {
      if (stopped) return;
      const now = performance.now();
      if (queue.current.length) {
        const gate = pausedRef.current && !stepOnce.current;
        if (!gate && now >= waitUntil.current) {
          stepOnce.current = false;
          const { beat, hold } = queue.current.shift()!;
          perform(beat, hold, now);
        }
      } else if (live.current.playing && now >= waitUntil.current && s) {
        finish(s);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf.current);
    };
  }, [perform, finish, s]);

  // Effects and numbers clear themselves so nothing accumulates forever.
  useEffect(() => {
    if (!cues.vfx.length && !cues.pops.length) return;
    const timer = setTimeout(
      () => {
        live.current = { ...live.current, vfx: [], pops: [] };
        setCues(live.current);
      },
      900 / Math.max(0.25, speed),
    );
    return () => clearTimeout(timer);
  }, [cues.vfx, cues.pops, speed]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

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
    // Rewind on the snapshot's first render too, avoiding a one-frame flash
    // of already-seized gear before the replay effect starts.
    equipment:
      pending && s
        ? equipmentBefore(
            s,
            s.logs
              .filter((l) => l.seq > seen.current! && l.beat)
              .map((l) => l.beat!),
          )
        : cues.equipment,
    playing: cues.playing || pending,
    speed,
    setSpeed,
    paused,
    setPaused,
    step: () => {
      stepOnce.current = true;
      waitUntil.current = 0;
    },
    skip: () => {
      queue.current = [];
      if (s) finish(s);
    },
  };
}
