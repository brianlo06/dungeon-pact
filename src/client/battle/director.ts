import { useCallback, useEffect, useRef, useState } from "react";
import type { Beat, Snapshot } from "../../shared/model";
import type { ClipName, SfxName } from "../../shared/presentation";
import { tempo } from "./tempo";
import { castClip } from "./hero-clips";

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
  kind:
    | "impact"
    | "slash"
    | "cast"
    | "projectile"
    | "heal"
    | "barrier"
    | "interrupt"
    | "seize"
    | "reclaim";
  from?: string;
  to?: string;
  /** Milliseconds this effect lives for, already scaled by playback speed. */
  life: number;
}

export interface DirectorCues {
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

/** How long each kind of beat holds the stage, before the speed multiplier. */
const HOLD: Record<CueKind, number> = {
  cast: 520,
  damage: 420,
  heal: 420,
  block: 340,
  combo: 760,
  defeat: 620,
};
/** Hit-stop, by how hard the hit landed. Subtle on purpose. */
const stopFor = (amount: number) =>
  amount >= 30 ? 120 : amount >= 18 ? 75 : amount > 0 ? 40 : 0;

const healthOf = (s: Snapshot) =>
  Object.fromEntries([...s.players, ...s.enemies].map((u) => [u.id, u.hp]));

export interface DirectorHooks {
  /** Called once per beat so the camera can frame it. */
  onCamera?: (beat: Beat | null) => void;
  onShake?: (amount: number) => void;
  onSound?: (name: SfxName) => void;
  /** Ask a combatant for a clip. The director never knows how it is drawn. */
  onClip?: (unit: string, clip: ClipName, then?: ClipName) => void;
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

  const seen = useRef(0);
  const settled = useRef<Record<string, number>>({});
  const queue = useRef<Beat[]>([]);
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
  const perform = useCallback((beat: Beat, now: number) => {
    const cur = live.current;
    const next: DirectorCues = { ...cur, beat, frozen: false };
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

    let hold = HOLD[beat.kind];
    switch (beat.kind) {
      case "cast":
        next.title = { text: beat.label ?? "", actor: beat.actor };
        if (beat.actor)
          hooksRef.current.onClip?.(beat.actor, castClip(snap.current, beat));
        add({ kind: "cast", from: beat.actor, life: 420 });
        if (beat.actor && beat.target && beat.actor !== beat.target)
          add({
            kind: "projectile",
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
        next.frozen = stopFor(beat.amount ?? 0) > 0;
        hold += stopFor(beat.amount ?? 0);
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
        else if (beat.label === "INTERRUPTED")
          add({ kind: "interrupt", to: beat.target, life: 520 });
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
    waitUntil.current = now + hold / Math.max(0.25, speedRef.current) / tempo();
  }, []);

  // Build the timeline whenever the server sends a round we have not played.
  useEffect(() => {
    if (!s) return;
    const fresh = s.logs.filter((l) => l.seq > seen.current && l.beat);
    seen.current = s.logs.length ? s.logs[s.logs.length - 1].seq : 0;
    if (!fresh.length || reduced || s.phase !== "COMBAT") {
      finish(s);
      return;
    }
    board.current = { ...settled.current, ...healthOf(s) };
    for (const [id, hp] of Object.entries(settled.current))
      board.current[id] = hp;
    queue.current = fresh.map((l) => l.beat!);
    waitUntil.current = 0;
    live.current = { ...live.current, hp: { ...board.current }, playing: true };
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
          perform(queue.current.shift()!, now);
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

  return {
    ...cues,
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
