import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { VfxContext, VfxProps } from "../../cinematic/vfx";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Into the Din's effects.
 *
 * The idea they serve: the Warcaller walks out alone into the loudest place in
 * the fight and strikes the enemy so hard that the whole field's noise is
 * struck into one ringing note, and the party takes its courage from it.
 *
 * The din is drawn: short jagged strokes, bone over ink, buzzing round every
 * fighter and thickest round the enemy. Each is a zigzag whose teeth flip and
 * whose place jitters every 55 presentation ms, so it crawls the way noise
 * does, deterministically. In the quiet the strokes freeze and go out one at a
 * time. On the blow a ring leaves the point of contact, and every stroke it
 * passes is *tuned*: its zigzag is pulled straight into a clean arc of a
 * circle round the blow and carried outwards with the ring — noise into one
 * note, visibly.
 *
 *   din-noise    the din, round the cast and across the field
 *                (`mode`: loud | freeze | tune)
 *   din-ring     the ring itself: clean circles leaving a point, or sweeping
 *                in from off the frame (`sweep`)
 *   din-clang    the blow drawn: a struck disc, wedges of ink and bone, and
 *                broken rings, boiling between three drawings
 *   din-walk     the Warcaller's stride, written on its copy's `.cine-look`
 *   din-courage  the ring reaching the party: every ally lurches forward at
 *                once and carries a ring of or before it
 *   din-board    on the real board: the din over a unit, the target still
 *                ringing, or the ring of or an ally carries
 *
 * Nothing here uses a filter or a keyframe. Paths are rebuilt on the combat
 * clock (one `d` per layer, not one per stroke), and everything else moves on
 * `--p`. A figure's `.cine-look` is only ever written by an effect in its own
 * shot and is put back when that shot ends.
 */

export const BONE = "#f1e6cc";
export const OR = "#e7b54a";

const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const easeOut = (k: number) => 1 - (1 - clamp(k)) ** 3;
const easeInOut = (k: number) => {
  const x = clamp(k);
  return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
};

/** A cheap deterministic hash of two integers, 0…1. */
function hash(a: number, b: number) {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x27d4eb2f, 0xc2b2ae35);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  return ((h >>> 0) % 10000) / 10000;
}

const rootOf = (el: HTMLElement) => el.closest<HTMLElement>(".ult-cinematic");
const setD = (el: Element | null | undefined, d: string) => {
  if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
};
const num = (el: HTMLElement | SVGElement | null | undefined, name: string, fallback: number) => {
  const raw = el?.dataset[name];
  const n = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(n) ? n : fallback;
};
const dataOf = (params: Record<string, unknown> | undefined, defaults: Record<string, string | number>) =>
  Object.fromEntries(Object.entries(defaults).map(([k, d]) => [`data-${k}`, String(params?.[k] ?? d)]));

/* ── The din ───────────────────────────────────────────────────────────── */

type Pt = [number, number];
type Placed = { x: number; y: number; h: number };

interface Stroke {
  /** Whose noise it is: a cast id, or "" for the open field. */
  owner: string;
  /** Around a figure: angle round it and distance, as fractions of its height. Else world. */
  a: number;
  r: number;
  x: number;
  y: number;
  /** Orientation, radians, and length (fractions of a figure's height, or world). */
  turn: number;
  len: number;
  teeth: number;
  amp: number;
  /** When it goes out in the quiet, 0…1. */
  out: number;
  seed: number;
}

/** The strokes for a cue: a cluster round each named figure, and a scatter over the field. */
function strokesFor(seed: number, owners: string[], field: number, dense: number): Stroke[] {
  const rand = seeded(seed);
  const out: Stroke[] = [];
  let k = 0;
  for (const owner of owners) {
    const n = owner.startsWith("targets") ? Math.round(34 * dense) : Math.round(18 * dense);
    for (let i = 0; i < n; i++)
      out.push({
        owner,
        a: rand() * Math.PI * 2,
        r: 0.5 + rand() * 0.75,
        x: 0,
        y: 0,
        turn: (rand() - 0.5) * 2.2,
        len: 0.09 + rand() * 0.12,
        teeth: 2 + Math.floor(rand() * 3),
        amp: 0.018 + rand() * 0.02,
        out: 0.04 + rand() * 0.8,
        seed: ++k,
      });
  }
  for (let i = 0; i < field; i++)
    out.push({
      owner: "",
      a: 0,
      r: 0,
      x: -80 + rand() * 1760,
      y: 60 + rand() * 780,
      turn: (rand() - 0.5) * 2.4,
      len: 34 + rand() * 60,
      teeth: 2 + Math.floor(rand() * 3),
      amp: 7 + rand() * 8,
      out: 0.04 + rand() * 0.8,
      seed: ++k,
    });
  return out;
}

/** Where a stroke is this frame, and how big: world units. */
function place(s: Stroke, ctx: VfxContext): { c: Pt; len: number; amp: number } | null {
  if (!s.owner) return { c: [s.x, s.y], len: s.len, amp: s.amp };
  const at = ctx.actor(s.owner);
  if (!at) return null;
  const cx = at.x + Math.cos(s.a) * at.h * s.r * 0.62;
  const cy = at.y - at.h * 0.52 + Math.sin(s.a) * at.h * s.r * 0.7;
  return { c: [cx, cy], len: at.h * s.len, amp: at.h * s.amp };
}

/** A zigzag: `2·teeth + 1` points along a direction, alternately either side. */
function zigzag(c: Pt, turn: number, len: number, amp: number, teeth: number, flip: number, jitter: number, seed: number): Pt[] {
  const n = teeth * 2 + 1;
  const dx = Math.cos(turn);
  const dy = Math.sin(turn);
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const s = i / (n - 1) - 0.5;
    const side = i === 0 || i === n - 1 ? 0 : (i % 2 ? 1 : -1) * flip;
    const a = amp * (0.7 + 0.6 * hash(seed * 7 + i, jitter));
    pts.push([c[0] + dx * s * len - dy * side * a, c[1] + dy * s * len + dx * side * a]);
  }
  return pts;
}

/** The same number of points on an arc of a circle round `o`, centred on `c`'s bearing. */
function arcPts(o: Pt, c: Pt, len: number, n: number, radius: number): Pt[] {
  const bearing = Math.atan2(c[1] - o[1], c[0] - o[0]);
  const span = len / Math.max(1, radius);
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = bearing + (i / (n - 1) - 0.5) * span;
    pts.push([o[0] + Math.cos(t) * radius, o[1] + Math.sin(t) * radius]);
  }
  return pts;
}

const poly = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")}`;

function Din({ cue }: VfxProps) {
  const p = cue.params ?? {};
  return (
    <svg
      className="din-sky din-noise"
      viewBox="0 0 1600 900"
      aria-hidden="true"
      {...dataOf(p, { mode: "loud", around: "caster,targets,allies", field: 60, dense: 1, ox: 800, oy: 450, speed: 1900, from: 0, width: 1 })}
      data-seed={String(cue.seed ?? 7)}
      style={v({ "--w": Number(p.width ?? 1) })}
    >
      <path className="din-ink" />
      <path className="din-bone" />
      <path className="din-hot" />
    </svg>
  );
}

/** The strokes a mounted cue owns, built on its first frame. */
const cache = new WeakMap<Element, Stroke[]>();

const noise = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => {
  const svg = el.querySelector<SVGSVGElement>(".din-noise");
  if (!svg) return;
  let strokes = cache.get(svg);
  if (!strokes) {
    const around = (svg.dataset.around ?? "")
      .split(",")
      .filter(Boolean)
      .flatMap((id) => (id === "targets" || id === "allies" ? Array.from({ length: 6 }, (_, i) => `${id}-${i}`) : [id]));
    strokes = strokesFor(num(svg, "seed", 7), around, num(svg, "field", 60), num(svg, "dense", 1));
    cache.set(svg, strokes);
  }
  const mode = svg.dataset.mode ?? "loud";
  // The din crawls: a new drawing every 55ms. Frozen, it never changes again.
  const step = mode === "freeze" ? 0 : Math.floor(age / 55);
  const o: Pt = [num(svg, "ox", 800), num(svg, "oy", 450)];
  const ring = mode === "tune" ? num(svg, "speed", 1900) * easeOut((p - num(svg, "from", 0)) / 0.8) : -1;
  let loud = "";
  let hot = "";
  for (const s of strokes) {
    if (mode === "freeze" && p > s.out) continue;
    const at = place(s, ctx);
    if (!at) continue;
    const jit = hash(s.seed, step);
    const flip = (step + s.seed) % 2 ? 1 : -1;
    const shake = mode === "freeze" ? 0 : at.amp * 0.35;
    const c: Pt = [at.c[0] + (jit - 0.5) * shake, at.c[1] + (hash(step, s.seed) - 0.5) * shake];
    const zig = zigzag(c, s.turn, at.len, at.amp, s.teeth, flip, step, s.seed);
    if (ring < 0) {
      loud += poly(zig) + " ";
      continue;
    }
    const d = Math.hypot(c[0] - o[0], c[1] - o[1]);
    const k = clamp((ring - d) / 110);
    if (k <= 0) {
      loud += poly(zig) + " ";
      continue;
    }
    // Tuned: pulled onto a circle round the blow, and carried out with the ring.
    const radius = d + (ring - d) * 0.22;
    // Once the ring is well past, the note it left there dies away.
    const left = 1 - clamp((ring - d - 260) / 520);
    if (left <= 0.04) continue;
    const arc = arcPts(o, c, at.len * (1 + 0.6 * k) * left, zig.length, radius);
    const e = easeInOut(k);
    const pts = zig.map(([x, y], i): Pt => [lerp(x, arc[i][0], e), lerp(y, arc[i][1], e)]);
    hot += poly(pts) + " ";
  }
  const ink = loud + hot;
  setD(svg.querySelector(".din-ink"), ink.trim());
  setD(svg.querySelector(".din-bone"), loud.trim());
  setD(svg.querySelector(".din-hot"), hot.trim());
  if (mode === "freeze") svg.style.setProperty("--quiet", p.toFixed(3));
};

/* ── The ring ──────────────────────────────────────────────────────────── */

function Ring({ cue }: VfxProps) {
  const p = cue.params ?? {};
  const n = Number(p.rings ?? 5);
  return (
    <svg
      className="din-sky din-ring"
      viewBox="0 0 1600 900"
      aria-hidden="true"
      {...dataOf(p, { ox: 800, oy: 450, speed: 2000, gap: 70, from: 0, rings: 5 })}
    >
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} className="din-ring-line" data-i={i} cx={String(p.ox ?? 800)} cy={String(p.oy ?? 450)} r="0" style={v({ "--i": i })} />
      ))}
    </svg>
  );
}

const ring = (el: HTMLElement, p: number) => {
  const svg = el.querySelector<SVGSVGElement>(".din-ring");
  if (!svg) return;
  const R = num(svg, "speed", 2000) * easeOut((p - num(svg, "from", 0)) / 0.85);
  const gap = num(svg, "gap", 70);
  svg.querySelectorAll<SVGCircleElement>(".din-ring-line").forEach((c, i) => {
    const r = Math.max(0, R - i * gap * (1 + p * 0.6));
    c.setAttribute("r", r.toFixed(1));
    const life = clamp(1 - p * 1.05) * (r > 0 ? 1 : 0) * (1 - i * 0.13);
    c.style.opacity = life.toFixed(3);
  });
};

/* ── The blow, drawn ───────────────────────────────────────────────────── */

function wedges(seed: number) {
  const rand = seeded(seed);
  let d = "";
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + rand() * 0.3;
    const w = 0.07 + rand() * 0.06;
    const r0 = 52 + rand() * 20;
    const r1 = 170 + rand() * 120;
    d += `M${(Math.cos(a - w) * r0).toFixed(1)} ${(Math.sin(a - w) * r0).toFixed(1)} L${(Math.cos(a) * r1).toFixed(1)} ${(Math.sin(a) * r1).toFixed(1)} L${(Math.cos(a + w) * r0).toFixed(1)} ${(Math.sin(a + w) * r0).toFixed(1)} Z `;
  }
  return d;
}

function brokenRing(seed: number, r: number) {
  const rand = seeded(seed);
  let d = "";
  let a = rand();
  while (a < Math.PI * 2) {
    const len = 0.25 + rand() * 0.5;
    const b = Math.min(Math.PI * 2, a + len);
    d += `M${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)} A${r} ${r} 0 0 1 ${(Math.cos(b) * r).toFixed(1)} ${(Math.sin(b) * r).toFixed(1)} `;
    a = b + 0.12 + rand() * 0.25;
  }
  return d;
}

function Clang({ cue }: VfxProps) {
  const seed = cue.seed ?? 4;
  return (
    <svg className="din-clang" viewBox="-320 -320 640 640" aria-hidden="true">
      {[0, 1, 2].map((k) => (
        <g key={k} className="din-clang-frame" data-k={k}>
          <path className="din-clang-wedge" d={wedges(seed + k * 13)} />
          <path className="din-clang-ring a" d={brokenRing(seed + k * 5, 120)} />
          <path className="din-clang-ring b" d={brokenRing(seed + k * 9 + 2, 205)} />
          <circle className="din-clang-core" r={46 + k * 4} />
          <path className="din-clang-notch" d={wedges(seed + k * 3 + 50).split("Z")[0] + "Z"} transform="scale(0.34)" />
        </g>
      ))}
    </svg>
  );
}

const clang = (el: HTMLElement, _p: number, age: number) => {
  const k = String(Math.floor(age / 45) % 3);
  if (el.dataset.k !== k) el.dataset.k = k;
};

/* ── Figures moved by the film ─────────────────────────────────────────── */

/** Put back every figure an effect moved, when its shot ends. */
function useRestore(role: "caster" | "allies") {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>(".ult-cinematic") ?? null;
    return () => {
      for (const fig of root?.querySelectorAll<HTMLElement>(`.cine-actor[data-role="${role}"] .cine-look`) ?? [])
        fig.style.transform = "";
    };
  }, [role]);
  return ref;
}

function Walk() {
  const ref = useRestore("caster");
  return <span ref={ref} className="din-marker" />;
}

const walk = (el: HTMLElement, _p: number, age: number) => {
  const look = rootOf(el)?.querySelector<HTMLElement>('.cine-actor[data-role="caster"] .cine-look');
  if (!look) return;
  // Two steps a clip: down on each footfall, up between, a little roll.
  const phase = (age / 450) * Math.PI;
  const bob = Math.abs(Math.sin(phase));
  const t = `translateY(${(-bob * 2.4 + 0.8).toFixed(2)}px) rotate(${(Math.sin(phase) * 1.1).toFixed(2)}deg)`;
  if (look.style.transform !== t) look.style.transform = t;
};

function Courage({ cue }: VfxProps) {
  const ref = useRestore("allies");
  return (
    <span ref={ref} className="din-courage-box">
      <svg className="din-sky din-courage" viewBox="0 0 1600 900" aria-hidden="true" data-arrive={String(cue.params?.arrive ?? 0.16)}>
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i} className="din-carry" data-i={i} style={{ display: "none" }}>
            <path className="din-carry-glow" />
            <path className="din-carry-line" />
          </g>
        ))}
      </svg>
    </span>
  );
}

/** Three arcs of a ring, opening forward (to the right) from a point. */
function carried(x: number, y: number, h: number, grow: number) {
  let d = "";
  for (let i = 0; i < 3; i++) {
    const r = h * (0.1 + i * 0.075) * (0.7 + 0.3 * grow);
    const a = 0.62 - i * 0.08;
    d += `M${(x + Math.cos(-a) * r).toFixed(1)} ${(y + Math.sin(-a) * r).toFixed(1)} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)} `;
  }
  return d;
}

const courage = (el: HTMLElement, p: number, _age: number, ctx: VfxContext) => {
  const svg = el.querySelector<SVGSVGElement>(".din-courage");
  const root = rootOf(el);
  if (!svg || !root) return;
  const arrive = num(svg, "arrive", 0.16);
  const since = p - arrive;
  const figures = [...root.querySelectorAll<HTMLElement>('.cine-actor[data-role="allies"]')];
  const groups = svg.querySelectorAll<SVGGElement>(".din-carry");
  groups.forEach((g, i) => {
    const at = ctx.actor(`allies-${i}`);
    const look = figures[i]?.querySelector<HTMLElement>(".cine-look");
    if (!at || since < 0) {
      if (g.style.display !== "none") g.style.display = "none";
      if (look && look.style.transform) look.style.transform = "";
      return;
    }
    if (g.style.display) g.style.display = "";
    // All at once: the ring reaches the whole party on one frame.
    const k = clamp(since / 0.14);
    const settle = clamp((since - 0.14) / 0.4);
    const lunge = easeOut(k) * (1 - settle * 0.45);
    if (look) {
      const t = `translate(${(lunge * 7).toFixed(2)}px, ${(-lunge * 2.5).toFixed(2)}px) rotate(${(lunge * 5).toFixed(2)}deg)`;
      if (look.style.transform !== t) look.style.transform = t;
    }
    const d = carried(at.x + at.h * 0.44, at.y - at.h * 0.55, at.h, easeOut(since / 0.3));
    setD(g.querySelector(".din-carry-line"), d);
    setD(g.querySelector(".din-carry-glow"), d);
    g.style.setProperty("--k", clamp(since / 0.08).toFixed(3));
    g.style.setProperty("--w", (at.h / 60).toFixed(2));
  });
};

/* ── On the real board ─────────────────────────────────────────────────── */

function Board({ cue }: VfxProps) {
  const mode = String(cue.params?.mode ?? "din");
  if (mode === "din") {
    const rand = seeded(cue.seed ?? 3);
    const strokes = Array.from({ length: 11 }, () => {
      const a = rand() * Math.PI * 2;
      const r = 62 + rand() * 30;
      const s: Stroke = { owner: "", a: 0, r: 0, x: Math.cos(a) * r * 0.8, y: -95 + Math.sin(a) * r, turn: (rand() - 0.5) * 2, len: 26 + rand() * 20, teeth: 2 + Math.floor(rand() * 2), amp: 6 + rand() * 4, out: 0, seed: Math.floor(rand() * 1000) };
      return s;
    });
    return (
      <div className="din-board" data-mode="din">
        <svg viewBox="-120 -200 240 220" aria-hidden="true">
          {[0, 1, 2].map((f) => (
            <path
              key={f}
              className="din-board-zig"
              data-f={f}
              d={strokes.map((s) => poly(zigzag([s.x, s.y], s.turn, s.len, s.amp, s.teeth, f % 2 ? 1 : -1, f, s.seed))).join(" ")}
            />
          ))}
        </svg>
      </div>
    );
  }
  if (mode === "ring")
    return (
      <div className="din-board" data-mode="ring">
        <svg viewBox="-120 -200 240 220" aria-hidden="true">
          <ellipse className="din-board-floor" cx="0" cy="0" rx="78" ry="16" />
          {[0, 1, 2].map((i) => (
            <g key={i} className="din-board-arcs" style={v({ "--i": i })}>
              <path d={`M${-70 - i * 18} ${-120 - i * 6} Q${-96 - i * 26} -80 ${-70 - i * 18} ${-40 + i * 6}`} />
              <path d={`M${70 + i * 18} ${-120 - i * 6} Q${96 + i * 26} -80 ${70 + i * 18} ${-40 + i * 6}`} />
            </g>
          ))}
        </svg>
      </div>
    );
  return (
    <div className="din-board" data-mode="carry">
      <svg viewBox="-120 -200 240 220" aria-hidden="true">
        <ellipse className="din-board-floor or" cx="0" cy="0" rx="60" ry="12" />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            className="din-board-carry"
            style={v({ "--i": i })}
            d={`M${46 + i * 20} ${-122 - i * 10} Q${74 + i * 30} -84 ${46 + i * 20} ${-46 + i * 10}`}
          />
        ))}
      </svg>
    </div>
  );
}

const board = (el: HTMLElement, _p: number, age: number) => {
  const f = String(Math.floor(age / 55) % 3);
  if (el.dataset.f !== f) el.dataset.f = f;
};

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "din-noise": Din,
  "din-ring": Ring,
  "din-clang": Clang,
  "din-walk": Walk,
  "din-courage": Courage,
  "din-board": Board,
};

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

export const frames: Record<string, Frame> = {
  "din-noise": noise,
  "din-ring": ring,
  "din-clang": clang,
  "din-walk": walk,
  "din-courage": courage,
  "din-board": board,
};
