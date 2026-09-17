import { useCallback, useEffect, useMemo, useRef } from "react";
import type { ClipName } from "../../shared/presentation";
import { Animator, type PlayOptions, type Rig } from "./animation";
import { rigFor } from "./rigs";
import { FrameLoop, ORDER } from "./clock";

/**
 * One clock for every combatant on the field.
 *
 * Each unit gets an `Animator`; the stage's frame loop ticks all of them on
 * the presentation clock and they write transforms straight to their nodes.
 * A loop per unit would multiply the cost by the party and the encounter for
 * no benefit, and a React render per frame would be worse still.
 *
 * The clock is the one the director schedules on (see `clock.ts`), so the
 * replay speed, the capture tempo, pausing, stepping and hit-stop reach the
 * rigs exactly as they reach the hits. Before it, the animators ran on the
 * capture tempo alone and at 2× a hit could land before its strike.
 *
 * Idle phases are randomised per unit at registration, which is what stops a
 * line of creatures breathing in lockstep — the single most obvious tell that
 * a battlefield is a spreadsheet.
 *
 * Each animator reports the clip it is playing as `data-clip` on its unit's
 * rig, written only when the clip changes. That is the supported way for
 * anything outside to know what a combatant is doing.
 */
export interface Animators {
  register: (id: string, spriteSet: string | undefined) => void;
  attach: (id: string, node: HTMLElement | null) => void;
  /** Register one named piece of a cutout rig. */
  attachPart: (
    id: string,
    part: string,
    node: SVGElement | HTMLElement | null,
  ) => void;
  play: (
    id: string,
    clip: ClipName,
    then?: ClipName,
    opts?: PlayOptions,
  ) => void;
  /**
   * The loop a unit returns to between actions — `windup` while it holds an
   * announced wind-up, otherwise `idle`. A rig without the clip keeps idling.
   */
  setRest: (id: string, clip: ClipName) => void;
  /**
   * Lie down or stand up to match the board. Idempotent: it compares against
   * the pose on screen, so it can follow the board on every change.
   */
  setDown: (id: string, down: boolean) => void;
  /** Back to rest now, whatever is playing: the end of a replay, a skip. */
  settle: (id: string) => void;
  /** Slow everything down together, beyond the clock. Kept for inspection. */
  setSpeed: (n: number) => void;
  current: (id: string) => ClipName | null;
  /** The rig a unit is animating with, for the choreographer. */
  rig: (id: string) => Rig | undefined;
  /** The ids of every unit with an animator. */
  ids: () => string[];
  /**
   * Dispose of a unit's animator. For figures that come and go without being
   * on the board — a cinematic's presentation copies — so nothing they leave
   * behind is still ticked after they have gone.
   */
  release: (id: string) => void;
  /**
   * Development only: report each unit's clip markers as its rig passes
   * them. `facing` finds a clip's derived contact; null stops tracing.
   */
  trace: (
    id: string,
    facing: 1 | -1,
    fn: ((marker: "contact" | "release", clip: ClipName, at: number) => void) | null,
  ) => void;
}

export interface AnimatorOptions {
  /**
   * Reduced motion. Every combatant shows one static pose — standing, lying
   * where it fell, or holding its wind-up — and nothing loops.
   */
  still?: boolean;
  /** The stage's frame loop; its clock is the animators' time. */
  loop: FrameLoop;
}

export function useAnimators({ still = false, loop }: AnimatorOptions): Animators {
  const units = useRef(new Map<string, Animator>());
  const rigs = useRef(new Map<string, Rig>());
  const speed = useRef(1);
  const stillRef = useRef(still);
  stillRef.current = still;

  /** A new animator, on the stage's clock, at its speed and stillness. */
  const traces = useRef(
    new Map<string, { facing: 1 | -1; fn: NonNullable<Animator["trace"]> }>(),
  );
  const create = useCallback(
    (spriteSet: string | undefined, id?: string) => {
      const animator = new Animator(
        rigFor(spriteSet),
        Math.random(),
        () => loop.clock.time,
      );
      animator.setSpeed(speed.current);
      animator.setStill(stillRef.current);
      const traced = id ? traces.current.get(id) : undefined;
      if (traced) {
        animator.facing = traced.facing;
        animator.trace = traced.fn;
      }
      return animator;
    },
    [loop],
  );

  useEffect(
    () =>
      loop.add(ORDER.animators, ({ time }) => {
        for (const animator of units.current.values()) animator.tick(time);
      }),
    [loop],
  );

  useEffect(() => {
    for (const animator of units.current.values()) animator.setStill(still);
  }, [still]);

  useEffect(() => {
    const live = units.current;
    return () => {
      for (const animator of live.values()) animator.dispose();
      live.clear();
    };
  }, []);

  const register = useCallback(
    (id: string, spriteSet: string | undefined) => {
      rigs.current.set(id, rigFor(spriteSet));
      const existing = units.current.get(id);
      if (existing) {
        existing.setRig(rigFor(spriteSet));
        return;
      }
      units.current.set(id, create(spriteSet, id));
    },
    [create],
  );

  const attach = useCallback((id: string, node: HTMLElement | null) => {
    const animator = units.current.get(id);
    if (animator) animator.attach(node);
  }, []);

  const attachPart = useCallback(
    (id: string, part: string, node: SVGElement | HTMLElement | null) => {
      // A cutout rig lives *inside* the combatant, so its effect runs before
      // the combatant's own registration — React commits child effects first.
      // Create the animator on demand rather than depending on that order;
      // `register` only ever swaps the rig on an existing instance.
      let animator = units.current.get(id);
      if (!animator && node) {
        animator = create(undefined, id);
        units.current.set(id, animator);
      }
      animator?.attachPart(part, node);
    },
    [create],
  );

  const play = useCallback(
    (id: string, clip: ClipName, then?: ClipName, opts?: PlayOptions) => {
      units.current.get(id)?.play(clip, then, opts);
    },
    [],
  );

  const setRest = useCallback((id: string, clip: ClipName) => {
    units.current.get(id)?.setRest(clip);
  }, []);

  const setDown = useCallback((id: string, down: boolean) => {
    units.current.get(id)?.setDown(down);
  }, []);

  const settle = useCallback((id: string) => {
    units.current.get(id)?.settle();
  }, []);

  const setSpeed = useCallback((n: number) => {
    speed.current = n;
    for (const animator of units.current.values()) animator.setSpeed(n);
  }, []);

  const current = useCallback(
    (id: string) => units.current.get(id)?.current ?? null,
    [],
  );
  const rig = useCallback((id: string) => rigs.current.get(id), []);
  const ids = useCallback(() => [...units.current.keys()], []);
  const release = useCallback((id: string) => {
    units.current.get(id)?.dispose();
    units.current.delete(id);
    rigs.current.delete(id);
  }, []);
  const trace = useCallback<Animators["trace"]>((id, facing, fn) => {
    if (fn) traces.current.set(id, { facing, fn });
    else traces.current.delete(id);
    const animator = units.current.get(id);
    if (animator) {
      animator.facing = facing;
      animator.trace = fn ?? undefined;
    }
  }, []);

  return useMemo(
    () => ({
      register,
      attach,
      attachPart,
      play,
      setRest,
      setDown,
      settle,
      setSpeed,
      current,
      rig,
      ids,
      release,
      trace,
    }),
    [
      register,
      attach,
      attachPart,
      play,
      setRest,
      setDown,
      settle,
      setSpeed,
      current,
      rig,
      ids,
      release,
      trace,
    ],
  );
}
