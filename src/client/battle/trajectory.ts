import type { Trajectory } from "../../shared/presentation";

/**
 * Where a projectile is, as a pure function of how far through its flight it
 * is. The projectile layer samples this every frame from the presentation
 * clock; tests sample it directly.
 *
 * Points are in stage fractions — x of the stage's width, y of its height —
 * like every placement, so a flight survives the stage being resized in
 * mid-air. Angles need real proportions, so they take the stage's aspect.
 */

export interface Vec {
  x: number;
  y: number;
}

export interface Flight {
  trajectory: Trajectory;
  start: Vec;
  end: Vec;
  /** Arc height as a fraction of the flight's length. */
  arc?: number;
  /** Stage width ÷ height, for true angles. Defaults to 16:9. */
  aspect?: number;
}

export interface FlightPoint extends Vec {
  /** Direction of travel, radians, 0 pointing right, clockwise positive. */
  angle: number;
  /** How far the head has travelled, 0…1, for a beam's reach or a trail. */
  reach: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Distance between two points in stage widths. */
export function span(a: Vec, b: Vec, aspect = 16 / 9) {
  return Math.hypot(b.x - a.x, (b.y - a.y) / aspect);
}

/** Where a from-above strike begins: high over the target, off the top. */
export function skyAbove(end: Vec): Vec {
  return { x: end.x + 0.04, y: -0.12 };
}

/**
 * The position at `u` (0 launch … 1 arrival). Each trajectory reaches `end`
 * exactly at `u = 1`, which is what lets the director schedule the hit for
 * the moment of arrival without knowing how the flight is drawn.
 */
export function flightPoint(f: Flight, u: number): FlightPoint {
  const t = Math.max(0, Math.min(1, u));
  const aspect = f.aspect ?? 16 / 9;
  const at = (k: number): Vec => {
    switch (f.trajectory) {
      case "arc": {
        // A parabola lifted off the straight line, highest mid-flight.
        const h = (f.arc ?? 0.18) * span(f.start, f.end, aspect) * aspect;
        return {
          x: lerp(f.start.x, f.end.x, k),
          y: lerp(f.start.y, f.end.y, k) - 4 * h * k * (1 - k),
        };
      }
      case "homing": {
        // Leaves sideways and curls onto the target: a quadratic whose
        // control point is pushed off the line, so it bends in and arrives
        // head-on.
        const mx = (f.start.x + f.end.x) / 2;
        const my = (f.start.y + f.end.y) / 2;
        const dx = f.end.x - f.start.x;
        const dy = (f.end.y - f.start.y) / aspect;
        const bend = f.arc ?? 0.22;
        const cx = mx + dy * bend;
        const cy = my - dx * bend * aspect;
        const a = (1 - k) * (1 - k);
        const b = 2 * (1 - k) * k;
        const c = k * k;
        return {
          x: a * f.start.x + b * cx + c * f.end.x,
          y: a * f.start.y + b * cy + c * f.end.y,
        };
      }
      case "fromAbove": {
        // Falls from the sky onto the target, accelerating.
        const top = skyAbove(f.end);
        const e = k * k;
        return { x: lerp(top.x, f.end.x, e), y: lerp(top.y, f.end.y, e) };
      }
      case "beam":
      case "ground":
      case "linear":
      default:
        return {
          x: lerp(f.start.x, f.end.x, k),
          y: lerp(f.start.y, f.end.y, k),
        };
    }
  };
  const p = at(t);
  // The tangent, from a short step either side, in real proportions.
  const d = 0.002;
  const a = at(Math.max(0, t - d));
  const b = at(Math.min(1, t + d));
  const angle = Math.atan2((b.y - a.y) / aspect, b.x - a.x);
  return { ...p, angle, reach: t };
}

/**
 * How long a flight takes, in presentation milliseconds: its length over its
 * speed, kept inside what reads — an arrow across the whole stage still has
 * to be seen, and one at point-blank range still has to exist.
 */
export function flightTime(
  f: Pick<Flight, "trajectory" | "start" | "end" | "aspect">,
  speed: number,
  bounds = { min: 220, max: 900 },
) {
  if (f.trajectory === "beam") return bounds.min;
  const start = f.trajectory === "fromAbove" ? skyAbove(f.end) : f.start;
  const ms = (span(start, f.end, f.aspect) / Math.max(0.05, speed)) * 1000;
  return Math.max(bounds.min, Math.min(bounds.max, ms));
}
