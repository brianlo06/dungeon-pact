import { useCallback, useEffect, useRef } from "react";
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
/** The world scales about this point, as stage fractions. Set on attach. */
const ORIGIN = { x: 0.5, y: 0.62 };

/**
 * The part of the world, in untransformed stage pixels, that stays on screen
 * however the camera frames a decision — the neutral, hero and target presets
 * at any pan the reach allows. Replay framing may crop further; that is
 * emphasis on the action, not the board the player plans from.
 *
 * Anything that must always be readable while planning (intent chips) keeps
 * inside this box, so it cannot be pushed off screen by the camera leaning.
 */
export function planningFrame(width: number, height: number) {
  const zoom =
    OVERSCAN * Math.max(BIAS.neutral.zoom, BIAS.hero.zoom, BIAS.target.zoom);
  // A screen edge maps back into the world through the inverse transform;
  // the worst pan in each direction gives the tightest bound.
  const inner = (size: number, origin: number, edge: 0 | 1) =>
    origin * size +
    ((edge ? size - REACH * size : REACH * size) - origin * size) / zoom;
  return {
    left: inner(width, ORIGIN.x, 0),
    right: inner(width, ORIGIN.x, 1),
    top: inner(height, ORIGIN.y, 0),
    bottom: inner(height, ORIGIN.y, 1),
  };
}

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
  /**
   * Attach the element the camera moves. The transform is written straight to
   * the node from the frame loop — a camera that re-rendered React every frame
   * would re-render the whole battlefield sixty times a second to move one
   * parent, which is exactly the cost this design exists to avoid.
   */
  attach: (el: HTMLElement | null) => void;
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
  const live = useRef<CameraState>({ ...NEUTRAL });
  const node = useRef<HTMLElement | null>(null);
  const frame = useRef(0);

  useEffect(() => {
    let stop = false;
    const tick = () => {
      if (stop) return;
      const g = goal.current;
      const cur = live.current;
      // Fast enough to feel responsive, slow enough to read as a camera.
      const k = reduced ? 1 : 0.16;
      cur.x += (g.x - cur.x) * k;
      cur.y += (g.y - cur.y) * k;
      cur.zoom += (g.zoom - cur.zoom) * k;
      cur.shake = reduced ? 0 : shakeRef.current;
      shakeRef.current *= 0.86;
      if (shakeRef.current < 0.0004) shakeRef.current = 0;

      if (node.current) {
        const jx = cur.shake ? (Math.random() - 0.5) * cur.shake : 0;
        const jy = cur.shake ? (Math.random() - 0.5) * cur.shake : 0;
        node.current.style.transform =
          `translate3d(${((cur.x + jx) * 100).toFixed(3)}%, ` +
          `${((cur.y + jy) * 100).toFixed(3)}%, 0) ` +
          `scale(${(cur.zoom * OVERSCAN).toFixed(4)})`;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      stop = true;
      cancelAnimationFrame(frame.current);
    };
  }, [reduced]);

  const attach = useCallback((el: HTMLElement | null) => {
    node.current = el;
    // Owned here rather than in CSS, beside the geometry that depends on it.
    if (el) el.style.transformOrigin = `${ORIGIN.x * 100}% ${ORIGIN.y * 100}%`;
  }, []);
  const look = useCallback((cmd: CameraCommand) => {
    goal.current = resolve(cmd);
  }, []);
  const shake = useCallback((amount: number) => {
    shakeRef.current = Math.min(0.022, shakeRef.current + amount);
  }, []);
  const reset = useCallback(() => {
    goal.current = { x: 0, y: 0, zoom: 1 };
  }, []);

  return { attach, look, shake, reset };
}
