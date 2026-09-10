import { useCallback, useEffect, useRef, useState } from "react";
import type { Placement } from "./layout";

/**
 * The combat camera.
 *
 * Presentation only. Nothing here is ever read by the engine, nothing here can
 * change a result, and a camera that fails to move must never make a fight
 * unplayable — every preset is a small bias on a scene that is already fully
 * framed. The point is emphasis, not cinematography that hides the board.
 *
 * Components ask for a preset; they do not scatter transforms of their own.
 */

export type CameraPreset = "neutral" | "hero" | "target" | "action" | "boss";

export interface CameraState {
  /** Stage-fraction offsets. Positive x moves the *view* right. */
  x: number;
  y: number;
  zoom: number;
  /** Current shake amplitude in stage fractions; decays on its own. */
  shake: number;
}

const NEUTRAL: CameraState = { x: 0, y: 0, zoom: 1, shake: 0 };

/** How hard the camera leans for each preset. Deliberately gentle. */
const BIAS: Record<CameraPreset, { pull: number; zoom: number }> = {
  neutral: { pull: 0, zoom: 1 },
  hero: { pull: 0.16, zoom: 1.04 },
  target: { pull: 0.22, zoom: 1.07 },
  action: { pull: 0.3, zoom: 1.1 },
  boss: { pull: 0.16, zoom: 1 },
};
/**
 * The world is drawn slightly larger than the stage so panning and shake can
 * never expose an edge. Without this the scene slides off its own background
 * the moment the camera moves at all.
 */
const OVERSCAN = 1.12;
/** How far the view may travel, in stage fractions. The overscan must cover it. */
const REACH = 0.05;

export interface CameraCommand {
  preset: CameraPreset;
  /** Look toward this placement, if the preset uses a focus. */
  at?: Placement | null;
  /** Also frame this one; the camera splits the difference. */
  and?: Placement | null;
}

/** Where a command wants the camera, before smoothing. */
function resolve(cmd: CameraCommand): Omit<CameraState, "shake"> {
  const { pull, zoom } = BIAS[cmd.preset];
  const points = [cmd.at, cmd.and].filter(Boolean) as Placement[];
  if (!points.length || pull === 0) return { x: 0, y: 0, zoom };
  const cx = points.reduce((n, p) => n + p.x, 0) / points.length;
  const cy = points.reduce((n, p) => n + p.y, 0) / points.length;
  // Move the view toward the subject by a fraction of its offset from centre,
  // never further than the overscan can cover.
  const clamp = (n: number) => Math.max(-REACH, Math.min(REACH, n));
  return {
    x: clamp((0.5 - cx) * pull),
    y: clamp((0.55 - cy) * pull * 0.6),
    zoom,
  };
}

export interface Camera {
  state: CameraState;
  /** CSS transform for the world layers. */
  transform: string;
  look: (cmd: CameraCommand) => void;
  shake: (amount: number) => void;
  reset: () => void;
}

/**
 * A single animation frame loop smooths the camera toward its goal and decays
 * shake. One loop for the whole battle rather than a transition per component,
 * so the camera can be driven imperatively from the beat director without
 * fighting React's render cycle.
 */
export function useCamera(reduced: boolean): Camera {
  const goal = useRef<Omit<CameraState, "shake">>({ x: 0, y: 0, zoom: 1 });
  const shakeRef = useRef(0);
  const [state, setState] = useState<CameraState>(NEUTRAL);
  const live = useRef<CameraState>(NEUTRAL);
  const frame = useRef(0);

  useEffect(() => {
    let stop = false;
    const tick = () => {
      if (stop) return;
      const g = goal.current;
      const cur = live.current;
      // Critically-damped-ish easing: fast enough to feel responsive, slow
      // enough that it reads as a camera rather than a jump.
      const k = reduced ? 1 : 0.16;
      const next: CameraState = {
        x: cur.x + (g.x - cur.x) * k,
        y: cur.y + (g.y - cur.y) * k,
        zoom: cur.zoom + (g.zoom - cur.zoom) * k,
        shake: reduced ? 0 : shakeRef.current,
      };
      shakeRef.current *= 0.86;
      if (shakeRef.current < 0.0004) shakeRef.current = 0;
      const moved =
        Math.abs(next.x - cur.x) > 0.00005 ||
        Math.abs(next.y - cur.y) > 0.00005 ||
        Math.abs(next.zoom - cur.zoom) > 0.00005 ||
        next.shake !== cur.shake;
      live.current = next;
      if (moved) setState(next);
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      stop = true;
      cancelAnimationFrame(frame.current);
    };
  }, [reduced]);

  const look = useCallback((cmd: CameraCommand) => {
    goal.current = resolve(cmd);
  }, []);
  const shake = useCallback((amount: number) => {
    shakeRef.current = Math.min(0.022, shakeRef.current + amount);
  }, []);
  const reset = useCallback(() => {
    goal.current = { x: 0, y: 0, zoom: 1 };
  }, []);

  // Shake is applied as a pseudo-random offset that changes every frame.
  const jitter = state.shake
    ? {
        x: (Math.random() - 0.5) * state.shake,
        y: (Math.random() - 0.5) * state.shake,
      }
    : { x: 0, y: 0 };
  const transform = `translate3d(${((state.x + jitter.x) * 100).toFixed(3)}%, ${(
    (state.y + jitter.y) *
    100
  ).toFixed(3)}%, 0) scale(${state.zoom.toFixed(4)})`;

  return { state, transform, look, shake, reset };
}
