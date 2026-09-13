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
 *   din-ring     the ring itself: broken circles of hand-cut bands leaving a point
 *   din-swing    the swing smeared: hand-cut bands round the shoulder
 *   din-clang    the blow drawn: a struck disc, wedges of ink and bone, and
 *                broken rings, boiling between three drawings
 *   din-body     the Warcaller's stride, coil and lean, written on its
 *                copy's `.cine-look` (`mode`: walk | draw | blow)
 *   din-courage  the ring reaching the party: every ally lurches forward at
 *                once (the din round them is tuned into gold by `din-noise`)
 *   din-board    on the real board: the din over a unit, or its note still
 *                ringing round it in broken hand-cut rings — bone round the
 *                struck enemy, gold round an ally
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
      {...dataOf(p, { mode: "loud", around: "caster,targets,allies", field: 60, dense: 1, ox: 800, oy: 450, speed: 1900, from: 0, width: 1, gold: 0 })}
      data-seed={String(cue.seed ?? 7)}
      style={v({ "--w": Number(p.width ?? 1) })}
    >
      <path className="din-ink" />
      <path className="din-bone" />
      <path className="din-hot" />
      <path className="din-gold" />
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
  const goldAllies = svg.dataset.gold === "1";
  let loud = "";
  let hot = "";
  let gold = "";
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
    const e = easeInOut(k);
    const owner = goldAllies && s.owner.startsWith("allies") ? ctx.actor(s.owner) : undefined;
    if (owner) {
      // An ally the ring reaches: its noise is tuned onto a circle round its
      // own chest, and stays — the note ringing in it, not passing it by.
      const chest: Pt = [owner.x, owner.y - owner.h * 0.52];
      const radius = Math.hypot(c[0] - chest[0], c[1] - chest[1]);
      const arc = arcPts(chest, c, at.len * (1 + 1.1 * k), zig.length, radius);
      gold += poly(zig.map(([x, y], i): Pt => [lerp(x, arc[i][0], e), lerp(y, arc[i][1], e)])) + " ";
      continue;
    }
    // Tuned: pulled onto a circle round the blow, and carried out with the ring.
    const radius = d + (ring - d) * 0.22;
    // Once the ring is well past, the note it left there dies away.
    const left = 1 - clamp((ring - d - 260) / 520);
    if (left <= 0.04) continue;
    const arc = arcPts(o, c, at.len * (1 + 0.6 * k) * left, zig.length, radius);
    hot += poly(zig.map(([x, y], i): Pt => [lerp(x, arc[i][0], e), lerp(y, arc[i][1], e)])) + " ";
  }
  const ink = loud + hot + gold;
  setD(svg.querySelector(".din-ink"), ink.trim());
  setD(svg.querySelector(".din-bone"), loud.trim());
  setD(svg.querySelector(".din-hot"), hot.trim());
  setD(svg.querySelector(".din-gold"), gold.trim());
  if (mode === "freeze") svg.style.setProperty("--quiet", p.toFixed(3));
};

/* ── Hand-cut arcs ─────────────────────────────────────────────────────── */

/**
 * A band of a circle round (cx, cy) from angle `a0` to `a1` (radians), widest
 * in its middle and tapering to points, its edges nicked like a gouge in a
 * woodblock: the film's one shape for a sound that has become a note. Drawn
 * in straight facets, never as a clean `A` arc, so it never reads as a glyph.
 */
function crescent(cx: number, cy: number, r: number, a0: number, a1: number, width: number, seed: number, steps = 12) {
  if (width < 0.5 || Math.abs(a1 - a0) < 0.002) return "";
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = lerp(a0, a1, t);
    const w = width * Math.sin(Math.PI * t) ** 0.7;
    const nick = (hash(seed, i) - 0.5) * width * 0.4;
    const nick2 = (hash(i, seed) - 0.5) * width * 0.3;
    outer.push([cx + Math.cos(a) * (r + w / 2 + nick), cy + Math.sin(a) * (r + w / 2 + nick)]);
    inner.push([cx + Math.cos(a) * (r - w / 2 + nick2), cy + Math.sin(a) * (r - w / 2 + nick2)]);
  }
  return `${poly(outer)} L${inner.reverse().map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")} Z `;
}

/* ── The ring ──────────────────────────────────────────────────────────── */

function Ring({ cue }: VfxProps) {
  const p = cue.params ?? {};
  return (
    <svg
      className="din-sky din-ring"
      viewBox="0 0 1600 900"
      aria-hidden="true"
      {...dataOf(p, { ox: 800, oy: 450, speed: 2000, gap: 70, from: 0, rings: 5 })}
      data-seed={String(cue.seed ?? 9)}
    >
      <path className="din-ring-ink" />
      <path className="din-ring-cut" />
    </svg>
  );
}

/**
 * The ring of the blow: each ring is a broken circle of hand-cut bands, the
 * breaks in the same places every frame, thinning as it grows.
 */
const ring = (el: HTMLElement, p: number) => {
  const svg = el.querySelector<SVGSVGElement>(".din-ring");
  if (!svg) return;
  const R = num(svg, "speed", 2000) * easeOut((p - num(svg, "from", 0)) / 0.85);
  const gap = num(svg, "gap", 70);
  const n = num(svg, "rings", 5);
  const seed = num(svg, "seed", 9);
  const ox = num(svg, "ox", 800);
  const oy = num(svg, "oy", 450);
  let d = "";
  for (let i = 0; i < n; i++) {
    const r = R - i * gap * (1 + p * 0.6);
    if (r <= 8) continue;
    const life = clamp(1 - p * 1.05) * (1 - i * 0.16);
    const width = (22 - i * 3.5) * life;
    if (width < 1) continue;
    const rand = seeded(seed + i * 31);
    let a = rand() * 0.6;
    while (a < Math.PI * 2 + 0.3) {
      const span = 0.28 + rand() * 0.55;
      d += crescent(ox, oy, r, a, a + span, width, seed + i * 7 + Math.round(a * 10), 10);
      a += span + 0.08 + rand() * 0.22;
    }
  }
  setD(svg.querySelector(".din-ring-ink"), d);
  setD(svg.querySelector(".din-ring-cut"), d);
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
    d += crescent(0, 0, r, a, Math.min(Math.PI * 2, a + len), r * 0.12, seed + Math.round(a * 10), 8);
    a += len + 0.12 + rand() * 0.25;
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

/** The swing, smeared: a hand-cut fan round the shoulder from the top of the swing to the blow. */
function Swing({ cue }: VfxProps) {
  const p = cue.params ?? {};
  const cx = Number(p.cx ?? 800);
  const cy = Number(p.cy ?? 450);
  const r = Number(p.r ?? 180);
  const from = (Number(p.from ?? -100) * Math.PI) / 180;
  const to = (Number(p.to ?? 30) * Math.PI) / 180;
  const width = Number(p.width ?? 70);
  // Three bands, the outer one (where the weapon head travelled) widest and
  // longest, so the smear leads with the head and trails off at the top.
  const bands = [
    { r: r * 0.98, a0: from, w: width, seed: 3 },
    { r: r * 0.78, a0: lerp(from, to, 0.3), w: width * 0.55, seed: 8 },
    { r: r * 0.58, a0: lerp(from, to, 0.55), w: width * 0.35, seed: 13 },
  ];
  const d = bands.map((b) => crescent(cx, cy, b.r, b.a0, to, b.w, b.seed, 16)).join("");
  return (
    <svg className="din-sky din-swing" viewBox="0 0 1600 900" aria-hidden="true">
      <path className="din-swing-ink" d={d} />
      <path className="din-swing-cut" d={d} />
    </svg>
  );
}

/* ── Figures moved by the film ─────────────────────────────────────────── */

/** Put back every figure an effect moved, when its shot ends. */
function useRestore(...roles: ("caster" | "allies" | "targets")[]) {
  const ref = useRef<HTMLSpanElement>(null);
  const key = roles.join(",");
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>(".ult-cinematic") ?? null;
    return () => {
      for (const role of key.split(","))
        for (const fig of root?.querySelectorAll<HTMLElement>(`.cine-actor[data-role="${role}"] .cine-look`) ?? [])
          fig.style.transform = "";
    };
  }, [key]);
  return ref;
}

function Body({ cue }: VfxProps) {
  const ref = useRestore("caster", "targets");
  return <span ref={ref} className="din-marker" data-mode={String(cue.params?.mode ?? "walk")} />;
}

const write = (el: HTMLElement | null | undefined, t: string) => {
  if (el && el.style.transform !== t) el.style.transform = t;
};

/**
 * The whole figure's weight, which a copy's root track cannot give it today:
 * the stride's bob (`walk`), the coil under the raised weapon (`draw`), and
 * in the blow (`blow`) the Warcaller's lean down into it and the enemy's
 * recoil — driven down and back on the frame it lands, head thrown up, then
 * staggering. Pixels are in each figure's own 100-unit box, so they scale
 * with the shot.
 */
const body = (el: HTMLElement, p: number, age: number) => {
  const root = rootOf(el);
  const look = root?.querySelector<HTMLElement>('.cine-actor[data-role="caster"] .cine-look');
  if (!look) return;
  const mode = el.querySelector<HTMLElement>(".din-marker")?.dataset.mode ?? "walk";
  if (mode === "walk") {
    // Two steps a clip: down on each footfall, up between, a little roll.
    const phase = (age / 450) * Math.PI;
    const bob = Math.abs(Math.sin(phase));
    write(look, `translateY(${(-bob * 2.4 + 0.8).toFixed(2)}px) rotate(${(Math.sin(phase) * 1.1).toFixed(2)}deg)`);
  } else if (mode === "draw") {
    // Sink back onto the rear foot under the weapon, then hold dead still.
    const k = easeInOut(p / 0.4);
    write(look, `translate(${(-2.5 * k).toFixed(2)}px, ${(1.5 * k).toFixed(2)}px) rotate(${(-4 * k).toFixed(2)}deg) scale(${(1 + 0.03 * k).toFixed(3)}, ${(1 - 0.03 * k).toFixed(3)})`);
  } else {
    // Everything into the blow on the frame it lands, then a slow give back.
    const hit = clamp(p / 0.05);
    const back = easeOut((p - 0.05) / 0.6);
    const lean = hit * (1 - back * 0.45);
    write(look, `translate(${(9 * lean).toFixed(2)}px, ${(3 * lean).toFixed(2)}px) rotate(${(12 * lean).toFixed(2)}deg) scale(${(1 + 0.05 * lean).toFixed(3)}, ${(1 - 0.07 * lean).toFixed(3)})`);
    // The enemy: crushed down and knocked back on the frame, head flung up,
    // then a stagger that does not quite recover.
    const since = p - 0.05;
    const jolt = since < 0 ? 0 : 1 - easeOut(since / 0.5) * 0.55;
    const wobble = since < 0 ? 0 : Math.sin(since * 26) * (1 - clamp(since / 0.6)) * 3;
    for (const target of root?.querySelectorAll<HTMLElement>('.cine-actor[data-role="targets"] .cine-look') ?? [])
      write(
        target,
        jolt
          ? `translate(${(10 * jolt).toFixed(2)}px, ${(4 * jolt).toFixed(2)}px) rotate(${(14 * jolt + wobble).toFixed(2)}deg) scale(${(1 + 0.08 * jolt).toFixed(3)}, ${(1 - 0.14 * jolt).toFixed(3)})`
          : "",
      );
  }
};

/* ── Courage ───────────────────────────────────────────────────────────── */

function Courage({ cue }: VfxProps) {
  const ref = useRestore("allies");
  return <span ref={ref} className="din-marker" data-arrive={String(cue.params?.arrive ?? 0.16)} />;
}

/**
 * The ring reaching the party: every ally lurches forward on the same frame
 * (the drawing of it is the din round them tuned into gold, in `din-noise`).
 */
const courage = (el: HTMLElement, p: number, _age: number) => {
  const root = rootOf(el);
  if (!root) return;
  const since = p - num(el.querySelector<HTMLElement>(".din-marker"), "arrive", 0.16);
  for (const look of root.querySelectorAll<HTMLElement>('.cine-actor[data-role="allies"] .cine-look')) {
    if (since < 0) {
      write(look, "");
      continue;
    }
    const k = clamp(since / 0.14);
    const settle = clamp((since - 0.14) / 0.4);
    const lunge = easeOut(k) * (1 - settle * 0.45);
    write(look, `translate(${(lunge * 7).toFixed(2)}px, ${(-lunge * 2.5).toFixed(2)}px) rotate(${(lunge * 5).toFixed(2)}deg)`);
  }
};

/* ── On the real board ─────────────────────────────────────────────────── */

/**
 * The same hand-cut bands on the real units, in each unit's own box (240 wide,
 * the unit 120 of it, the feet at y 0), boiling between three cuts: broken
 * rings round the chest, left open across the legs — bone round the struck
 * enemy, gold round each ally the blow reached.
 */
function boardCuts(mode: "ring" | "carry", f: number) {
  const s = 100 + f * 17;
  const rings = mode === "ring" ? [66, 94] : [58, 80];
  let d = "";
  rings.forEach((r, i) => {
    const rand = seeded(s + i * 5 + (mode === "ring" ? 0 : 50));
    let a = -Math.PI * 0.5 + rand() * 0.5;
    const end = a + Math.PI * 2;
    while (a < end) {
      const span = 0.55 + rand() * 0.55;
      // Not across the legs: the lower quarter of the ring is left open.
      const mid = ((a + span / 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      if (mid < Math.PI * 0.3 || mid > Math.PI * 0.7)
        d += crescent(0, -86, r, a, a + span, 5.5 - i * 1.5, s + i + Math.round(a * 10), 12);
      a += span + 0.22 + rand() * 0.3;
    }
  });
  const floor = crescent(0, 0, mode === "ring" ? 66 : 54, Math.PI * 0.08, Math.PI * 0.92, 6, s + 40, 12);
  return mode === "ring" ? { gold: "", bone: d, floor } : { gold: d, bone: "", floor };
}

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
  const cut = mode === "ring" ? "ring" : "carry";
  return (
    <div className="din-board" data-mode={cut}>
      <svg viewBox="-120 -200 240 220" aria-hidden="true">
        {[0, 1, 2].map((f) => {
          const c = boardCuts(cut, f);
          return (
            <g key={f} className="din-board-cut" data-f={f}>
              <path className="din-board-floor" d={c.floor} />
              <path className="din-board-ink" d={c.gold + c.bone} />
              <path className="din-board-bone" d={c.bone} />
              {c.gold && <path className="din-board-gold" d={c.gold} />}
            </g>
          );
        })}
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
  "din-swing": Swing,
  "din-body": Body,
  "din-courage": Courage,
  "din-board": Board,
};

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

export const frames: Record<string, Frame> = {
  "din-noise": noise,
  "din-ring": ring,
  "din-clang": clang,
  "din-body": body,
  "din-courage": courage,
  "din-board": board,
};
