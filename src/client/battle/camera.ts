import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Placement } from "./layout";
import { ORDER, type FrameLoop } from "./clock";

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
 * The board's vertical extent, as stage fractions. `FLOOR` is the lowest
 * ground line: the foot of the nearest rank, where its name plates end, and
 * every combatant stands on or above it (see `layout.ts`). `CEILING` is as
 * high as anything that must be read while planning may reach: the top of the
 * furthest rank's intent chips.
 *
 * At these zooms the board fills the screen, and a lean toward the subject
 * alone dropped the back row's health bars off the bottom edge when it looked
 * up at an enemy, and pushed the top rank's intents off the top when it looked
 * down at a hero. So the view leans only as far as keeps both lines on screen,
 * and when a zoom cannot hold both — the replay's, which is emphasis — it
 * keeps the floor and crops the top. The ceiling is as high as the target
 * zoom can hold with the floor; any higher and planning would lose it too.
 */
export const FLOOR = 0.96;
const FLOOR_CLEAR = 0.008;
export const CEILING = 0.133;

/*
 * A screen point is `o + (p - o) * scale + pan`; these solve it for the pan
 * that puts each line at its edge. `floorPan` is the furthest the view may
 * push the world down, `ceilingPan` the furthest it may lift it.
 */
const floorPan = (zoom: number) =>
  1 - FLOOR_CLEAR - ORIGIN.y - (FLOOR - ORIGIN.y) * OVERSCAN * zoom;
const ceilingPan = (zoom: number) =>
  -ORIGIN.y - (CEILING - ORIGIN.y) * OVERSCAN * zoom;

/** The lowest and highest vertical pan a zoom allows, floor first. */
function verticalRange(zoom: number) {
  const clamp = (n: number) => Math.max(-REACH, Math.min(REACH, n));
  const high = clamp(floorPan(zoom));
  return { low: Math.min(high, clamp(ceilingPan(zoom))), high };
}

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
  // A screen edge maps back into the world through the inverse transform, so
  // each bound is the worst over every decision preset at its worst pan.
  const inner = (
    size: number,
    origin: number,
    zoom: number,
    edge: 0 | 1,
    pan: number,
  ) => origin * size + (edge * size - pan * size - origin * size) / zoom;
  let left = 0;
  let right = width;
  let top = 0;
  let bottom = height;
  for (const preset of ["neutral", "hero", "target"] as const) {
    const z = BIAS[preset].zoom;
    const zoom = OVERSCAN * z;
    left = Math.max(left, inner(width, ORIGIN.x, zoom, 0, -REACH));
    right = Math.min(right, inner(width, ORIGIN.x, zoom, 1, REACH));
    const { low, high } = verticalRange(z);
    top = Math.max(top, inner(height, ORIGIN.y, zoom, 0, low));
    bottom = Math.min(bottom, inner(height, ORIGIN.y, zoom, 1, high));
  }
  return { left, right, top, bottom };
}

/**
 * The part of the world, in untransformed stage pixels, that is on screen once
 * the camera has settled on one command. Where `planningFrame` is the worst
 * case over every decision framing, this is exact for one — for something that
 * only shows under a known framing, like the action fan, which is only open
 * while the camera is looking at its hero.
 */
export function frameFor(width: number, height: number, cmd: CameraCommand) {
  const { x, y, zoom } = resolve(cmd);
  const z = OVERSCAN * zoom;
  const ox = ORIGIN.x * width;
  const oy = ORIGIN.y * height;
  return {
    left: ox + (0 - ox - x * width) / z,
    right: ox + (width - ox - x * width) / z,
    top: oy + (0 - oy - y * height) / z,
    bottom: oy + (height - oy - y * height) / z,
  };
}

export interface CameraCommand {
  preset: CameraPreset;
  /** Look toward this placement, if the preset uses a focus. */
  at?: Placement | null;
  /** Also frame this one; the camera splits the difference. */
  and?: Placement | null;
  /**
   * Replay framing: points in stage fractions that must all stay on screen —
   * an actor mid-run, its target, a projectile in the air. The camera leans
   * towards their middle and zooms in no further than keeps every one of
   * them inside the frame.
   */
  points?: { x: number; y: number }[];
  /** For `points`: the closest zoom wanted. */
  zoom?: number;
}

/** Margin kept between framed points and the screen's edge. */
const FRAME_MARGIN = { x: 0.06, y: 0.05 };

/**
 * The closest framing of a set of points that keeps all of them on screen,
 * and the floor line too. Zoom steps down from what was asked until a pan
 * exists that fits; if none does, it frames at the widest.
 */
function fit(
  points: { x: number; y: number }[],
  want: number,
  pull: number,
): Omit<CameraState, "shake"> {
  const cx = points.reduce((n, p) => n + p.x, 0) / points.length;
  const cy = points.reduce((n, p) => n + p.y, 0) / points.length;
  const clamp = (n: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, n));
  for (let z = want; z >= 1 - 1e-9; z -= 0.01) {
    const s = OVERSCAN * z;
    let xlo = -REACH;
    let xhi = REACH;
    const { low, high } = verticalRange(z);
    let ylo = low;
    let yhi = high;
    for (const p of points) {
      const sx = ORIGIN.x + (p.x - ORIGIN.x) * s;
      const sy = ORIGIN.y + (p.y - ORIGIN.y) * s;
      xlo = Math.max(xlo, FRAME_MARGIN.x - sx);
      xhi = Math.min(xhi, 1 - FRAME_MARGIN.x - sx);
      ylo = Math.max(ylo, FRAME_MARGIN.y - sy);
      yhi = Math.min(yhi, 1 - FRAME_MARGIN.y - sy);
    }
    if (xlo <= xhi && ylo <= yhi)
      return {
        x: clamp((0.5 - cx) * pull, xlo, xhi),
        y: clamp((0.55 - cy) * pull * 0.6, ylo, yhi),
        zoom: z,
      };
  }
  const { low, high } = verticalRange(1);
  return {
    x: clamp((0.5 - cx) * pull, -REACH, REACH),
    y: clamp((0.55 - cy) * pull * 0.6, low, high),
    zoom: 1,
  };
}

/** Where a command wants the camera, before smoothing. */
function resolve(cmd: CameraCommand): Omit<CameraState, "shake"> {
  const { pull, zoom } = BIAS[cmd.preset];
  if (cmd.points?.length) return fit(cmd.points, cmd.zoom ?? zoom, pull);
  const points = [cmd.at, cmd.and].filter(Boolean) as Placement[];
  // Vertically, only as far as keeps the board on screen; see `FLOOR`.
  const { low, high } = verticalRange(zoom);
  const within = (lean: number) => Math.max(low, Math.min(high, lean));
  if (!points.length || pull === 0) return { x: 0, y: within(0), zoom };
  const cx = points.reduce((n, p) => n + p.x, 0) / points.length;
  const cy = points.reduce((n, p) => n + p.y, 0) / points.length;
  // Move the view toward the subject by a fraction of its offset from centre,
  // never further than the overscan can cover.
  const clamp = (n: number) => Math.max(-REACH, Math.min(REACH, n));
  return {
    x: clamp((0.5 - cx) * pull),
    y: within((0.55 - cy) * pull * 0.6),
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
export function useCamera(reduced: boolean, loop?: FrameLoop): Camera {
  const goal = useRef<Omit<CameraState, "shake">>(
    resolve({ preset: "neutral" }),
  );
  const shakeRef = useRef(0);
  const live = useRef<CameraState>({ ...NEUTRAL, ...goal.current });
  const node = useRef<HTMLElement | null>(null);
  const frame = useRef(0);
  const written = useRef("");

  useEffect(() => {
    /**
     * One frame of camera. `free` is presentation time — so the camera
     * eases at the replay's speed and holds still while it is paused — and
     * it keeps running through a hit-stop, which is what lets the shake
     * sell the stop.
     */
    const step = (free: number) => {
      const g = goal.current;
      const cur = live.current;
      // Fast enough to feel responsive, slow enough to read as a camera:
      // 16% of the way per sixtieth of a second.
      const frames = free / (1000 / 60);
      const k = reduced ? 1 : 1 - Math.pow(1 - 0.16, frames);
      cur.x += (g.x - cur.x) * k;
      cur.y += (g.y - cur.y) * k;
      cur.zoom += (g.zoom - cur.zoom) * k;
      cur.shake = reduced ? 0 : shakeRef.current;
      shakeRef.current *= Math.pow(0.86, frames);
      if (shakeRef.current < 0.0004) shakeRef.current = 0;

      if (node.current && (frames > 0 || !written.current)) {
        const jx = cur.shake ? (Math.random() - 0.5) * cur.shake : 0;
        const jy = cur.shake ? (Math.random() - 0.5) * cur.shake : 0;
        const t =
          `translate3d(${((cur.x + jx) * 100).toFixed(3)}%, ` +
          `${((cur.y + jy) * 100).toFixed(3)}%, 0) ` +
          `scale(${(cur.zoom * OVERSCAN).toFixed(4)})`;
        if (t !== written.current) {
          written.current = t;
          node.current.style.transform = t;
        }
      }
    };
    if (loop) return loop.add(ORDER.camera, ({ free }) => step(free));
    let stop = false;
    let last = performance.now();
    const tick = (now: number) => {
      if (stop) return;
      step(now - last);
      last = now;
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      stop = true;
      cancelAnimationFrame(frame.current);
    };
  }, [reduced, loop]);

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
    goal.current = resolve({ preset: "neutral" });
  }, []);

  // One object for the life of the stage: things built around the camera —
  // the stagehand — must not be rebuilt because the combat screen rendered.
  return useMemo(
    () => ({ attach, look, shake, reset }),
    [attach, look, shake, reset],
  );
}
