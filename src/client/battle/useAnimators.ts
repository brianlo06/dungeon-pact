import { useCallback, useEffect, useMemo, useRef } from "react";
import type { ClipName } from "../../shared/presentation";
import { Animator } from "./animation";
import { rigFor } from "./rigs";
import { tempo } from "./tempo";

/**
 * One clock for every combatant on the field.
 *
 * Each unit gets an `Animator`; a single animation frame loop ticks all of
 * them and writes transforms straight to their nodes. A loop per unit would
 * multiply the cost by the party and the encounter for no benefit, and a React
 * render per frame would be worse still.
 *
 * Idle phases are randomised per unit at registration, which is what stops a
 * line of creatures breathing in lockstep — the single most obvious tell that
 * a battlefield is a spreadsheet.
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
  play: (id: string, clip: ClipName, then?: ClipName) => void;
  /**
   * The loop a unit returns to between actions — `windup` while it holds an
   * announced wind-up, otherwise `idle`. A rig without the clip keeps idling.
   */
  setRest: (id: string, clip: ClipName) => void;
  /** Slow everything down together, for capture and inspection. */
  setSpeed: (n: number) => void;
  current: (id: string) => ClipName | null;
}

export function useAnimators(paused = false): Animators {
  const units = useRef(new Map<string, Animator>());
  const speed = useRef(1);
  const frozen = useRef(paused);
  frozen.current = paused;

  useEffect(() => {
    let stop = false;
    let frame = 0;
    let held = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (stop) return;
      // A hit-stop holds every animator on its current frame rather than
      // letting them drift on while the stage is frozen.
      if (frozen.current) held += now - last;
      last = now;
      for (const animator of units.current.values()) animator.tick(now - held);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      stop = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const live = units.current;
    return () => {
      for (const animator of live.values()) animator.dispose();
      live.clear();
    };
  }, []);

  const register = useCallback((id: string, spriteSet: string | undefined) => {
    const existing = units.current.get(id);
    if (existing) {
      existing.setRig(rigFor(spriteSet));
      return;
    }
    const animator = new Animator(rigFor(spriteSet));
    animator.setSpeed(speed.current * tempo());
    units.current.set(id, animator);
  }, []);

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
        animator = new Animator(rigFor(undefined));
        animator.setSpeed(speed.current * tempo());
        units.current.set(id, animator);
      }
      animator?.attachPart(part, node);
    },
    [],
  );

  const play = useCallback((id: string, clip: ClipName, then?: ClipName) => {
    units.current.get(id)?.play(clip, then);
  }, []);

  const setRest = useCallback((id: string, clip: ClipName) => {
    units.current.get(id)?.setRest(clip);
  }, []);

  const setSpeed = useCallback((n: number) => {
    speed.current = n;
    for (const animator of units.current.values()) animator.setSpeed(n);
  }, []);

  const current = useCallback(
    (id: string) => units.current.get(id)?.current ?? null,
    [],
  );

  return useMemo(
    () => ({ register, attach, attachPart, play, setRest, setSpeed, current }),
    [register, attach, attachPart, play, setRest, setSpeed, current],
  );
}
