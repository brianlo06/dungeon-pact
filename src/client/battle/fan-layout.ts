import { frameFor, planningFrame, type CameraCommand } from "./camera";
import type { Box } from "./intent-layout";
import { paintedFigure } from "./unit-layout";
import { rigFor } from "./rigs";

/**
 * Where your hero's action fan opens.
 *
 * The fan used to open at fixed offsets from the hero's ground point: slips
 * 56px out from the centre, the shared actions centred across the feet. A
 * drawn hero is well over 100px wide, so every seat covered its own hero, and
 * usually whoever stood beside it. No fixed offset survives every seat, party
 * size and screen, so the fan is placed like the intent chips are: measured
 * against what is actually on the stage.
 *
 * It measures in untransformed stage pixels, so neither the camera nor the
 * rigs' idle sway enters into the answer, and it reruns only when something
 * changes size.
 */

/** Clear space kept between the fan and the figures it steps around. */
const GAP = 8;
/**
 * How far the fan may stand off from its hero and still read as theirs. A
 * clear spot further away than this loses to a closer one that grazes
 * something: an action menu across the stage belongs to nobody.
 */
const REACH = 130;
/** Anything below this, in square pixels, is rounding, not overlap. */
const TOUCH = 2;

/** One way of arranging the fan: its slips in columns, its shared actions in
 * a block or a row. Each shape has its own size. */
export interface FanShape {
  cols: number;
  /** Shared actions per row. */
  commonCols: number;
  w: number;
  h: number;
}

export interface FanPlacement {
  left: number;
  top: number;
  /** Which side of the hero it opened on; the slips step away from the hero. */
  side: "left" | "right";
  shape: FanShape;
}

const area = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

/** Shortest distance between two boxes; zero when they touch or overlap. */
const gap = (a: Box, b: Box) => {
  const dx = Math.max(0, b.left - a.right, a.left - b.right);
  const dy = Math.max(0, b.top - a.bottom, a.top - b.bottom);
  return Math.hypot(dx, dy);
};

const before = (a: number[], b: number[]) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
};

/**
 * Place the fan beside its hero, choosing its shape as well as its spot.
 *
 * Hard: inside the frame. Then, in order: within reach of the hero; nearer
 * the hero than any ally, so it can only be read as theirs; covering as
 * little as possible of any figure, name plate or chip — the hero's own
 * figure included; beside the hero rather than above it; as close as that
 * allows; the simplest shape that fits; and the fan's foot level with the
 * hero's, which keeps the shared actions by the feet.
 */
export function placeFan(
  shapes: FanShape[],
  hero: Box,
  allies: Box[],
  obstacles: Box[],
  frame: Box,
): FanPlacement {
  const mid = (hero.left + hero.right) / 2;
  let best: { p: FanPlacement; key: number[] } | null = null;
  for (const [rank, shape] of shapes.entries()) {
    const { w, h } = shape;
    const xs = new Set([
      hero.right + GAP,
      hero.left - GAP - w,
      mid - w / 2,
      frame.left,
      frame.right - w,
    ]);
    const ys = new Set([
      hero.bottom - h,
      (hero.top + hero.bottom) / 2 - h / 2,
      hero.top - GAP - h,
      frame.top,
      frame.bottom - h,
    ]);
    // Step just clear of anything in the way, on any side.
    for (const o of obstacles) {
      xs.add(o.right + GAP);
      xs.add(o.left - GAP - w);
      ys.add(o.bottom + GAP);
      ys.add(o.top - GAP - h);
    }
    for (const x of xs)
      for (const y of ys) {
        const c = { left: x, top: y, right: x + w, bottom: y + h };
        if (
          c.left < frame.left - 0.5 ||
          c.right > frame.right + 0.5 ||
          c.top < frame.top - 0.5 ||
          c.bottom > frame.bottom + 0.5
        )
          continue;
        let cover = 0;
        for (const o of obstacles) {
          const a = area(c, o);
          if (a > TOUCH) cover += a;
        }
        const away = gap(c, hero);
        const stranger = allies.some((a) => gap(c, a) < away) ? 1 : 0;
        const beside =
          c.right <= hero.left + 0.5 || c.left >= hero.right - 0.5 ? 0 : 1;
        const key = [
          away > REACH ? 1 : 0,
          stranger,
          Math.round(cover),
          beside,
          Math.round(away / 4),
          rank,
          Math.abs(c.bottom - hero.bottom),
        ];
        const side = (c.left + c.right) / 2 < mid ? "left" : "right";
        if (!best || before(key, best.key))
          best = {
            p: { left: Math.round(x), top: Math.round(y), side, shape },
            key,
          };
      }
  }
  return (
    best?.p ?? {
      left: Math.round(hero.right + GAP),
      top: Math.round(hero.bottom - shapes[0].h),
      side: "right",
      shape: shapes[0],
    }
  );
}

/**
 * The sizes of every arrangement worth trying, from the measured size of each
 * slip. Slip widths do not depend on the arrangement, so one measurement
 * prices every shape without rendering it.
 */
export function fanShapes(
  primary: { w: number; h: number }[],
  common: { w: number; h: number }[],
  step: number,
  gaps = { row: 2, col: 6, block: 6, common: 4 },
): FanShape[] {
  const out: FanShape[] = [];
  const n = primary.length;
  for (const cols of [1, 2, 3, 4, 5]) {
    if (cols > 1 && cols > n) break;
    const rows = Math.max(1, Math.ceil(n / cols));
    let pw = 0;
    let ph = 0;
    for (let c = 0; c < cols; c++) {
      const slips = primary.slice(c * rows, (c + 1) * rows);
      if (!slips.length) continue;
      pw += Math.max(...slips.map((s, r) => s.w + r * step));
      ph = Math.max(
        ph,
        slips.reduce((t, s) => t + s.h, 0) + (slips.length - 1) * gaps.row,
      );
    }
    pw += (cols - 1) * gaps.col;
    for (const commonCols of common.length ? [2, common.length] : [1]) {
      let cw = 0;
      let ch = 0;
      const crows = Math.ceil(common.length / commonCols);
      for (let c = 0; c < commonCols; c++) {
        const column = common.filter((_, i) => i % commonCols === c);
        if (column.length) cw += Math.max(...column.map((s) => s.w));
      }
      cw += Math.max(0, commonCols - 1) * gaps.common;
      for (let r = 0; r < crows; r++) {
        const row = common.slice(r * commonCols, (r + 1) * commonCols);
        if (row.length) ch += Math.max(...row.map((s) => s.h));
      }
      ch += Math.max(0, crows - 1) * gaps.common;
      out.push({
        cols,
        commonCols,
        w: Math.ceil(Math.max(pw, cw)),
        h: Math.ceil(ph + (n && common.length ? gaps.block : 0) + ch),
      });
      if (commonCols === common.length) break;
    }
  }
  return out;
}

/** Extra room held around each figure, so an idle sway never brushes the fan. */
const SWAY = 5;
/** How far a target's plate brackets reach past it (see stage-ui.css). */
const PLATE_REACH = 8;
const MARGIN = 6;

/**
 * Measure the world and place the fan block for the hero with this id.
 * Returns the block's position relative to the fan's own anchor, which sits
 * at the hero's ground point.
 */
export function layoutFan(
  world: HTMLElement,
  anchor: HTMLElement,
  block: HTMLElement,
  heroId: string,
  /** The camera command in force while the fan shows, if it is known. */
  view?: CameraCommand,
): (Omit<FanPlacement, "left" | "top"> & { x: number; y: number }) | null {
  const origin = world.getBoundingClientRect();
  if (!world.offsetWidth || !origin.width) return null;
  const scale = origin.width / world.offsetWidth;
  const local = (r: DOMRect | Box): Box => ({
    left: (r.left - origin.left) / scale,
    right: (r.right - origin.left) / scale,
    top: (r.top - origin.top) / scale,
    bottom: (r.bottom - origin.top) / scale,
  });

  let hero: Box | null = null;
  const allies: Box[] = [];
  const obstacles: Box[] = [];
  for (const u of world.querySelectorAll<HTMLElement>(".combatant")) {
    const figure = figureOf(u, local);
    if (figure) {
      if (u.dataset.unit === heroId) hero = figure;
      else if (u.dataset.side === "hero") allies.push(figure);
      obstacles.push(figure);
    }
    const plate = u.querySelector(":scope > .combatant-plate");
    if (plate) {
      const p = local(plate.getBoundingClientRect());
      obstacles.push({
        ...p,
        left: p.left - PLATE_REACH,
        right: p.right + PLATE_REACH,
      });
    }
    const chip = u.querySelector(".intent-chip");
    if (chip) {
      const c = local(chip.getBoundingClientRect());
      if (c.right - c.left > 1) obstacles.push(c);
    }
  }
  if (!hero) return null;

  // Exact when the framing is known; otherwise the worst case over every
  // framing a decision can be made under.
  const f = view
    ? frameFor(world.offsetWidth, world.offsetHeight, view)
    : planningFrame(world.offsetWidth, world.offsetHeight);
  const frame = {
    left: f.left + MARGIN,
    right: f.right - MARGIN,
    top: f.top + MARGIN,
    bottom: f.bottom - MARGIN,
  };
  // Layout sizes, untouched by the slips' skew or the camera.
  const size = (el: HTMLElement) => ({ w: el.offsetWidth, h: el.offsetHeight });
  const primary = [
    ...block.querySelectorAll<HTMLElement>(".fan-slips > .fan-slip > button"),
  ].map(size);
  const common = [
    ...block.querySelectorAll<HTMLElement>(".fan-common > .fan-slip > button"),
  ].map(size);
  const step = parseFloat(getComputedStyle(block).getPropertyValue("--step-x"));
  const shapes = fanShapes(primary, common, Number.isFinite(step) ? step : 0);
  if (!shapes.length) return null;
  const p = placeFan(shapes, hero, allies, obstacles, frame);
  // The anchor is a zero-size point at the hero's feet.
  const a = local(anchor.getBoundingClientRect());
  return {
    x: Math.round(p.left - a.left),
    y: Math.round(p.top - a.top),
    side: p.side,
    shape: p.shape,
  };
}

/**
 * The box a combatant paints, in world pixels, in the pose it holds while a
 * decision is made — standing, holding a wind-up, or lying where it fell. The
 * unit layout measures the same way, so the fan and the placement agree on
 * where everyone is. A little room is added for idle sway.
 */
function figureOf(u: HTMLElement, local: (r: DOMRect) => Box): Box | null {
  const f = paintedFigure(
    u,
    local,
    rigFor(u.dataset.rig),
    u.hasAttribute("data-down"),
  );
  if (!f) return null;
  return {
    left: f.held.left - SWAY,
    right: f.held.right + SWAY,
    top: f.held.top - SWAY,
    bottom: f.held.bottom + SWAY,
  };
}
