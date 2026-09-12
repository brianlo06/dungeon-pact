import { useLayoutEffect, useRef, type RefObject } from "react";
import { layoutIntents, type Box } from "./intent-layout";
import {
  GENERIC,
  poseToTransform,
  sampleTrack,
  type Clip,
  type Rig,
} from "./animation";

/**
 * Where each combatant stands across its rank.
 *
 * Four ranks share a stage that is not tall enough to stack them, so every
 * rank overlaps the ones beside it and a nearer figure paints over the rank
 * behind. That is depth, and it is fine — except where the nearer figure lands
 * on somebody's name plate. Which figures reach which plates depends on how
 * wide each drawing actually is, how many stand in each rank and how tall the
 * stage is, so no fixed spread survives every fight: each rank is slid
 * sideways, and opened out or closed up, against the painted outlines on the
 * stage.
 *
 * Plates sit at the foot of each combatant and figures rise above it, so a
 * figure can only reach the plates of the rank immediately behind its own —
 * or, lying where it fell, those along its own rank, which each rank checks
 * for itself. That makes the ranks a chain, and the best spread for the whole
 * field is found rank by rank: for each way of spreading one rank, the
 * cheapest way of spreading every rank behind it. Exhaustive over the grid,
 * and so the same stage always gets the same answer.
 *
 * Everything here is in untransformed stage pixels, so the camera never
 * enters into it.
 */

export interface UnitShape {
  id: string;
  /** 0 is the rank deepest into the scene. A nearer rank paints over it. */
  rank: number;
  /** The ground point, where the placement put it. */
  x: number;
  y: number;
  /** What is drawn and where the name plate is, relative to the ground point. */
  figure: Box;
  plate: Box;
  /** How much moving this unit costs against moving others. Default 1. */
  weight?: number;
}

/** Clear space kept between a figure and a plate it steps around. */
const GAP = 4;
/**
 * How far an idle loop carries a figure past the outline it rests in: parts
 * swing, and the whole figure breathes and tilts about its feet.
 */
const SWAY = 4;
/** What a figure keeps between itself and a plate, sway included. */
const CLEAR = GAP + SWAY;
/** Coarse pass: how far a rank may travel, and in what steps. */
const TRAVEL = 150;
const STEP = 6;
/** How much a rank may open up or close in, and in what steps. */
const SPREAD = 96;
const SPREAD_STEP = 12;
/** A pixel of plate covered outweighs any amount of travel. */
const COVERED = 10_000;

const shift = (b: Box, x: number, y: number): Box => ({
  left: b.left + x,
  right: b.right + x,
  top: b.top + y,
  bottom: b.bottom + y,
});
const rise = (a: Box, b: Box) =>
  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
/** How far two spans would have to part to leave `gap` between them. */
const across = (l1: number, r1: number, l2: number, r2: number, gap: number) =>
  Math.max(0, Math.min(r1, r2) - Math.max(l1, l2) + gap);

interface Rank {
  units: UnitShape[];
  /** Absolute figure and plate boxes at the ground points given. */
  figures: Box[];
  plates: Box[];
}

/** One way of spreading a rank: where each of its units stands. */
type Spread = number[];

function spreads(
  rank: Rank,
  bounds: { left: number; right: number },
  travel: number,
  step: number,
  spread: number,
  spreadStep: number,
  around?: Spread,
): { xs: Spread; cost: number }[] {
  const n = rank.units.length;
  const base = rank.units.map((u) => u.x);
  const from = around ?? base;
  const mid = from.reduce((t, x) => t + x, 0) / n;
  const gap = n > 1 ? (from[n - 1] - from[0]) / (n - 1) : 0;
  const out: { xs: Spread; cost: number }[] = [];
  for (let c = -travel; c <= travel + 1e-6; c += step)
    for (
      let s = n > 1 ? -spread : 0;
      s <= (n > 1 ? spread : 0) + 1e-6;
      s += spreadStep
    ) {
      const pitch = gap + s;
      if (n > 1 && pitch <= 0) continue;
      const xs = rank.units.map((_, i) =>
        Math.round(mid + c + pitch * (i - (n - 1) / 2)),
      );
      let covered = 0;
      // Inside the frame, figure and plate both.
      for (let i = 0; i < n; i++) {
        const dx = xs[i] - base[i];
        for (const b of [rank.figures[i], rank.plates[i]]) {
          covered += Math.max(0, bounds.left - (b.left + dx));
          covered += Math.max(0, b.right + dx - bounds.right);
        }
      }
      // Within a rank, neighbours keep their figures and plates apart.
      for (let i = 0; i + 1 < n; i++) {
        const a = xs[i] - base[i];
        const b = xs[i + 1] - base[i + 1];
        const fa = rank.figures[i];
        const fb = rank.figures[i + 1];
        const pa = rank.plates[i];
        const pb = rank.plates[i + 1];
        covered += across(
          fa.left + a,
          fa.right + a,
          fb.left + b,
          fb.right + b,
          0,
        );
        covered += across(
          pa.left + a,
          pa.right + a,
          pb.left + b,
          pb.right + b,
          GAP,
        );
      }
      // A figure standing in a rank ends above the plates along it; one lying
      // on the floor reaches down among them.
      for (let i = 0; i < n; i++)
        for (let k = 0; k < n; k++) {
          const f = rank.figures[i];
          const p = rank.plates[k];
          if (i === k || rise(f, p) <= 0) continue;
          const a = xs[i] - base[i];
          const b = xs[k] - base[k];
          covered += across(
            f.left + a,
            f.right + a,
            p.left + b,
            p.right + b,
            CLEAR,
          );
        }
      const travelled = xs.reduce(
        (t, x, i) => t + Math.abs(x - base[i]) * (rank.units[i].weight ?? 1),
        0,
      );
      out.push({ xs, cost: covered * COVERED + travelled });
    }
  return out;
}

/**
 * How much of the rank behind's plates the nearer rank's figures cover, for
 * one spread of each. Only pairs that share height can meet at all; those are
 * found once per pair of ranks, not once per spread.
 */
function meeting(near: Rank, far: Rank) {
  const pairs: [number, number][] = [];
  near.figures.forEach((f, i) =>
    far.plates.forEach((p, j) => {
      // A figure that stops just short of a plate still meets it: the idle
      // loop lifts a hat or a key a few pixels past its resting outline.
      if (rise(f, p) > -SWAY) pairs.push([i, j]);
    }),
  );
  return (nearXs: Spread, farXs: Spread) => {
    let covered = 0;
    for (const [i, j] of pairs) {
      const dn = nearXs[i] - near.units[i].x;
      const df = farXs[j] - far.units[j].x;
      const f = near.figures[i];
      const p = far.plates[j];
      covered += across(
        f.left + dn,
        f.right + dn,
        p.left + df,
        p.right + df,
        CLEAR,
      );
    }
    return covered * COVERED;
  };
}

function chain(
  ranks: Rank[],
  options: { xs: Spread; cost: number }[][],
): Spread[] {
  // best[r][k]: cheapest cost of ranks 0..r with rank r spread as option k.
  const best: number[][] = [options[0].map((o) => o.cost)];
  const back: number[][] = [options[0].map(() => -1)];
  for (let r = 1; r < ranks.length; r++) {
    const cover = meeting(ranks[r], ranks[r - 1]);
    const prev = options[r - 1];
    const prevBest = best[r - 1];
    // Cheapest first, so the search can stop as soon as the rest cost more
    // on their own than the best found; ties keep their grid order.
    const order = prev
      .map((_, k) => k)
      .sort((a, b) => prevBest[a] - prevBest[b] || a - b);
    const row: number[] = [];
    const from: number[] = [];
    for (const o of options[r]) {
      let min = Infinity;
      let arg = -1;
      for (const k of order) {
        if (prevBest[k] >= min) break;
        const c = prevBest[k] + cover(o.xs, prev[k].xs);
        if (c < min) {
          min = c;
          arg = k;
        }
      }
      row.push(min + o.cost);
      from.push(arg);
    }
    best.push(row);
    back.push(from);
  }
  const last = best.length - 1;
  let k = best[last].indexOf(Math.min(...best[last]));
  const out: Spread[] = [];
  for (let r = last; r >= 0; r--) {
    out.unshift(options[r][k].xs);
    k = back[r][k];
  }
  return out;
}

/**
 * Slide each rank so no figure covers a name plate in the rank behind it,
 * travelling as little as possible. Hard, in order: inside the bounds; no
 * figure on a plate behind it; neighbours in a rank clear of each other. Then
 * as little travel as that allows. Returns each unit's horizontal offset.
 */
export function arrangeUnits(
  units: UnitShape[],
  bounds: { left: number; right: number },
): Map<string, number> {
  const byRank = new Map<number, UnitShape[]>();
  for (const u of units) byRank.set(u.rank, [...(byRank.get(u.rank) ?? []), u]);
  const ranks: Rank[] = [...byRank.keys()]
    .sort((a, b) => a - b)
    .map((r) => {
      const members = byRank
        .get(r)!
        .slice()
        .sort((a, b) => a.x - b.x);
      return {
        units: members,
        figures: members.map((u) => shift(u.figure, u.x, u.y)),
        plates: members.map((u) => shift(u.plate, u.x, u.y)),
      };
    });
  const out = new Map<string, number>();
  if (!ranks.length) return out;

  // Coarse over the whole range, then fine around what the coarse pass chose.
  const coarse = chain(
    ranks,
    ranks.map((r) => spreads(r, bounds, TRAVEL, STEP, SPREAD, SPREAD_STEP)),
  );
  const fine = chain(
    ranks,
    ranks.map((r, i) => spreads(r, bounds, STEP, 1, SPREAD_STEP, 2, coarse[i])),
  );
  ranks.forEach((r, i) =>
    r.units.forEach((u, j) => out.set(u.id, fine[i][j] - u.x)),
  );
  return out;
}

/* ------------------------------------------------------------ measuring -- */

/**
 * What the stage measured of each combatant, in untransformed stage pixels:
 * its painted figure and its name plate, relative to its ground point. Relative,
 * so a measurement does not depend on where the unit stood when it was taken,
 * and placing the units by it cannot change it.
 */
export interface StageShapes {
  width: number;
  height: number;
  units: Record<string, MeasuredUnit>;
}

export interface MeasuredUnit {
  figure: Box;
  plate: Box;
  /**
   * The square the drawing is laid out in, and the drawing's own viewBox,
   * so a point given in drawing units — a reach, an anchor — can be put on
   * the stage. Absent for an atlas cell, which has no drawing units.
   */
  body?: Box;
  view?: { x: number; y: number; width: number; height: number };
}

type Sampled = ReturnType<typeof sampleTrack>;

const union = (a: Box | null, b: Box): Box =>
  a
    ? {
        left: Math.min(a.left, b.left),
        right: Math.max(a.right, b.right),
        top: Math.min(a.top, b.top),
        bottom: Math.max(a.bottom, b.bottom),
      }
    : b;

/** Where the root pose carries a box, in the drawing's own units. The rig
 * turns and scales the whole figure about a point near its feet. */
function carried(b: Box, pose: Sampled, vb: DOMRect | SVGRect): Box {
  const ox = vb.x + vb.width * 0.5;
  const oy = vb.y + vb.height * 0.92;
  const r = (pose.rotate * Math.PI) / 180;
  const sx = pose.scale * pose.squash;
  const sy = pose.scale / pose.squash;
  let out: Box | null = null;
  for (const [x, y] of [
    [b.left, b.top],
    [b.right, b.top],
    [b.left, b.bottom],
    [b.right, b.bottom],
  ]) {
    const dx = (x - ox) * sx;
    const dy = (y - oy) * sy;
    const px = ox + pose.x * vb.width + dx * Math.cos(r) - dy * Math.sin(r);
    const py = oy + pose.y * vb.height + dx * Math.sin(r) + dy * Math.cos(r);
    out = union(out, { left: px, right: px, top: py, bottom: py });
  }
  return out!;
}

/**
 * The box a drawing paints, in its own viewBox units, glows aside, in the
 * poses it takes while a decision is being made: at rest, and — for a rig
 * that authors one — through its held wind-up. Not whatever the idle loop
 * happens to be doing at this instant, so the answer is the same every time
 * it is asked. The animator's own transforms are put back exactly as found.
 */
function drawnBoxes(
  svg: SVGSVGElement,
  rig: Rig | undefined,
  down: boolean,
): { rest: Box; held: Box } {
  const glows = [...svg.querySelectorAll<SVGElement>(".ph-glow")];
  const parts = [...svg.querySelectorAll<SVGElement>("[data-part]")];
  const kept = parts.map((p) => p.style.transform);
  const vb = svg.viewBox.baseVal;
  const bbox = (): Box => {
    const b = svg.getBBox();
    return {
      left: b.x,
      top: b.y,
      right: b.x + b.width,
      bottom: b.y + b.height,
    };
  };
  /** The drawing with the clip's pose at `t` put on its parts and its root. */
  const posed = (clip: Clip, t: number) => {
    for (const p of parts) {
      const track = clip.parts?.[p.dataset.part!];
      p.style.transform = track
        ? poseToTransform(sampleTrack(track, t))
        : "none";
    }
    return carried(bbox(), sampleTrack(clip.poses, t), vb);
  };
  for (const g of glows) g.style.display = "none";
  try {
    // The fallen lie where their fall left them, rotated onto the floor.
    if (down) {
      const lying = posed(rig?.defeat ?? GENERIC.defeat!, 1);
      return { rest: lying, held: lying };
    }
    for (const p of parts) p.style.transform = "none";
    const rest = bbox();
    let held = rest;
    const windup = rig?.windup;
    if (windup?.loop)
      for (const t of [0, 0.25, 0.5, 0.75])
        held = union(held, posed(windup, t));
    return { rest, held };
  } finally {
    for (const g of glows) g.style.display = "";
    parts.forEach((p, i) => (p.style.transform = kept[i]));
  }
}

/**
 * The box a combatant actually paints, in stage pixels: its drawing's bounds
 * mapped through the viewBox onto the body's untransformed box. The body's
 * square is far larger than most figures and a fixed inset is wrong both ways
 * — a shouldered sword reaches the edge, a round mender does not — and a raised
 * key reaches past the top of it. An atlas cell has no drawing to ask, and is
 * taken as its whole square.
 *
 * `rest` is the figure at rest; `held` also covers the wind-up its rig holds,
 * if it authors one, and is the rest pose otherwise. A combatant that is
 * `down` is both: lying where its fall left it.
 */
export function paintedFigure(
  unit: HTMLElement,
  local: (r: DOMRect) => Box,
  rig?: Rig,
  down = false,
): { rest: Box; held: Box } | null {
  const body = unit.querySelector(":scope > .combatant-body");
  if (!body) return null;
  const b = local(body.getBoundingClientRect());
  const svg = unit.querySelector<SVGSVGElement>("svg.combatant-sprite");
  const vb = svg?.viewBox?.baseVal;
  if (!svg || !vb || !vb.width || !vb.height) return { rest: b, held: b };
  const drawn = drawnBoxes(svg, rig, down);
  // viewBox fills the body with "meet"; letterbox the long side.
  const bw = b.right - b.left;
  const bh = b.bottom - b.top;
  const s = Math.min(bw / vb.width, bh / vb.height);
  const ox = b.left + (bw - vb.width * s) / 2;
  const oy = b.top + (bh - vb.height * s) / 2;
  const onStage = (d: Box): Box => ({
    left: ox + (d.left - vb.x) * s,
    right: ox + (d.right - vb.x) * s,
    top: oy + (d.top - vb.y) * s,
    bottom: oy + (d.bottom - vb.y) * s,
  });
  return { rest: onStage(drawn.rest), held: onStage(drawn.held) };
}

/** Map the page's boxes into the layer's untransformed pixels. */
export function stageSpace(layer: HTMLElement) {
  const origin = layer.getBoundingClientRect();
  if (!layer.offsetWidth || !origin.width) return null;
  // The camera scales and pans the world; undo it, so every number is in the
  // stage's own pixels and nothing depends on where the camera is this frame.
  const scale = origin.width / layer.offsetWidth;
  return (r: DOMRect | Box): Box => ({
    left: (r.left - origin.left) / scale,
    right: (r.right - origin.left) / scale,
    top: (r.top - origin.top) / scale,
    bottom: (r.bottom - origin.top) / scale,
  });
}

const rounded = (b: Box): Box => ({
  left: Math.round(b.left),
  right: Math.round(b.right),
  top: Math.round(b.top),
  bottom: Math.round(b.bottom),
});

/** How the stage tells the measuring pass about each combatant's rig. */
export interface RigLookup {
  rig: (id: string) => Rig | undefined;
  /**
   * The pose it holds while this decision is made: an announced wind-up,
   * lying where it fell, or neither.
   */
  pose: (id: string) => "rest" | "windup" | "down";
}

/**
 * Measure every combatant on the layer: the shapes placement needs, relative
 * to each ground point, and the painted figures where they stand now, for the
 * passes that lay things out around them.
 *
 * Placement takes every pose a figure can hold while a decision is made, so
 * that nobody moves when a boss starts winding up. The figures handed on are
 * what is painted this round: a raised key only while it is raised.
 */
export function measureUnits(
  layer: HTMLElement,
  rigs: RigLookup = { rig: () => undefined, pose: () => "rest" },
): { shapes: StageShapes; figures: Map<HTMLElement, Box> } | null {
  const local = stageSpace(layer);
  if (!local) return null;
  const shapes: StageShapes = {
    width: layer.offsetWidth,
    height: layer.offsetHeight,
    units: {},
  };
  const figures = new Map<HTMLElement, Box>();
  for (const u of layer.querySelectorAll<HTMLElement>(".combatant")) {
    const id = u.dataset.unit;
    const plateEl = u.querySelector(":scope > .combatant-plate");
    const pose = id ? rigs.pose(id) : "rest";
    const painted = id
      ? paintedFigure(u, local, rigs.rig(id), pose === "down")
      : null;
    if (!id || !plateEl || !painted) continue;
    const figure = painted.held;
    figures.set(u, pose === "rest" ? painted.rest : painted.held);
    // The ground point is the foot of the combatant's own box: it is centred
    // on its placement and stands on it.
    const own = local(u.getBoundingClientRect());
    const gx = (own.left + own.right) / 2;
    const gy = own.bottom;
    const rel = (b: Box) =>
      rounded({
        left: b.left - gx,
        right: b.right - gx,
        top: b.top - gy,
        bottom: b.bottom - gy,
      });
    const bodyEl = u.querySelector(":scope > .combatant-body");
    const vb = u.querySelector<SVGSVGElement>("svg.combatant-sprite")?.viewBox
      ?.baseVal;
    shapes.units[id] = {
      figure: rel(figure),
      plate: rel(local(plateEl.getBoundingClientRect())),
      body: bodyEl ? rel(local(bodyEl.getBoundingClientRect())) : undefined,
      view:
        vb && vb.width && vb.height
          ? { x: vb.x, y: vb.y, width: vb.width, height: vb.height }
          : undefined,
    };
  }
  return { shapes, figures };
}

/**
 * Whether two measurements would place the stage the same way. A pixel either
 * way is the browser snapping text and borders to where a unit happens to
 * stand, not a different drawing; counting it would let a unit that moved
 * measure differently, move again, and never settle.
 */
export function sameShapes(a: StageShapes | null, b: StageShapes | null) {
  if (!a || !b || a.width !== b.width || a.height !== b.height) return false;
  const ids = Object.keys(a.units);
  if (ids.length !== Object.keys(b.units).length) return false;
  const near = (p: Box, q: Box) =>
    Math.abs(p.left - q.left) <= 1 &&
    Math.abs(p.right - q.right) <= 1 &&
    Math.abs(p.top - q.top) <= 1 &&
    Math.abs(p.bottom - q.bottom) <= 1;
  return ids.every((id) => {
    const p = a.units[id];
    const q = b.units[id];
    return !!q && near(p.figure, q.figure) && near(p.plate, q.plate);
  });
}

/**
 * Lay the stage out whenever its contents or size change: measure every
 * combatant, hand the measurements up so the units can be placed by them, and
 * once they stand still, lay the intent chips out around them. A resize
 * observer rather than a frame loop: the answer only changes when a box does.
 *
 * `onShapes` is called only with a measurement that differs from the last;
 * the placements it produces come back as a new `key`, and the pass runs again
 * on the units where they now stand.
 *
 * While `hold` is set — a round being played back — nobody is moved: a status
 * landing mid-replay grows a name plate and changes a shape, and a unit that
 * slid aside in the middle of being hit would read as dodging. The stage
 * settles once the round has finished.
 */
export function useStageLayout(
  layer: RefObject<HTMLElement | null>,
  key: unknown,
  lookup: RigLookup,
  onShapes?: (shapes: StageShapes) => void,
  hold = false,
) {
  const last = useRef<StageShapes | null>(null);
  const rigs = useRef(lookup);
  rigs.current = lookup;
  const report = useRef(onShapes);
  report.current = onShapes;
  useLayoutEffect(() => {
    const el = layer.current;
    if (!el) return;
    const run = () => {
      const measured = measureUnits(el, rigs.current);
      if (!measured) return;
      if (
        !hold &&
        report.current &&
        !sameShapes(last.current, measured.shapes)
      ) {
        last.current = measured.shapes;
        report.current(measured.shapes);
        return;
      }
      layoutIntents(el, measured.figures);
    };
    run();
    if (typeof ResizeObserver === "undefined") return;
    const watch = new ResizeObserver(run);
    watch.observe(el);
    for (const n of el.querySelectorAll(".combatant, .combatant-intent"))
      watch.observe(n);
    return () => watch.disconnect();
  }, [layer, key, hold]);
}
