import type { CSSProperties, ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import { ROWS } from "./background";
import "./style.css";

/**
 * Hammer Price's effects.
 *
 * The idea they serve: in the Magnate's saleroom every rival bidder is a
 * paddle held up in the dark, and the paddles are the only light in the room.
 * Outbid, a paddle goes down behind its chair like a lamp put out, and the
 * room is darker by that much; what the room loses, the Magnate's hammer
 * gains. When the last one is down the hammer falls on the lot.
 *
 *   hammer-paddles    the rows of empty chairs and the paddles over them,
 *                     going down in waves from the Magnate outward
 *   hammer-last       the quiet: one paddle left up in the black, shaking
 *   hammer-block      the sale block under the lot: drawn in on the board,
 *                     stood on, split by the hammer, left split on the board
 *   hammer-knock      the drawn impact: the knock stamped flat where the
 *                     hammer lands, and the split it drives into the lot
 *   hammer-splinters  black lacquer thrown off the block
 *   hammer-glow       Tyrian light behind the lot, so the drawn frame cuts
 *                     both silhouettes against it
 *   hammer-outbid     on the board: a paddle lowered in front of every other
 *                     enemy, which is Weak this round
 *
 * Drawn in the film's own hand: ink edges, flat lacquer and ivory, one
 * Tyrian. No filters, no blur, no CSS keyframes: paths rebuilt on the combat
 * clock and gradients for light.
 */

export const TYRIAN = "#e05bd8";
export const HOT = "#ffd6f6";
export const IVORY = "#efe5cf";
export const LACQUER = "#0b0709";

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const f1 = (x: number) => x.toFixed(1);
const DEG = Math.PI / 180;

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
type Params = Record<string, number | string | boolean>;

const setD = (el: Element | null | undefined, d: string) => {
  if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
};
const setStyle = (el: HTMLElement | SVGElement | null | undefined, name: string, value: string) => {
  if (el && el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
};

const params = (el: HTMLElement): Params => {
  const cached = (el as HTMLElement & { _hammer?: Params })._hammer;
  if (cached) return cached;
  const src = el.querySelector<SVGElement | HTMLElement>("[data-params]");
  const out: Params = src ? JSON.parse(src.dataset.params ?? "{}") : {};
  (el as HTMLElement & { _hammer?: Params })._hammer = out;
  return out;
};
const pn = (o: Params, k: string, d: number) => {
  const x = Number(o[k]);
  return Number.isFinite(x) ? x : d;
};
/** The drawn height of whatever this effect is hung on (world units, or pixels on the board). */
const height = (el: HTMLElement, fallback = 160) => parseFloat(el.style.getPropertyValue("--ah")) || fallback;

/** An ellipse as a sub-path, turned by `rot` degrees. */
const ell = (x: number, y: number, rx: number, ry: number, rot = 0) => {
  const c = Math.cos(rot * DEG);
  const s = Math.sin(rot * DEG);
  return `M${f1(x - rx * c)} ${f1(y - rx * s)} a${f1(rx)} ${f1(ry)} ${f1(rot)} 1 0 ${f1(rx * 2 * c)} ${f1(rx * 2 * s)} a${f1(rx)} ${f1(ry)} ${f1(rot)} 1 0 ${f1(-rx * 2 * c)} ${f1(-rx * 2 * s)} Z`;
};

/** A box drawn in its own units, hung on the point the stage placed it at. */
const Box = ({ cue, className, children }: { cue: VfxProps["cue"]; className: string; children?: ReactNode }) => (
  <svg className={`hammer-box ${className}`} viewBox="-500 -500 1000 1000" data-params={JSON.stringify(cue.params ?? {})} aria-hidden="true">
    {children}
  </svg>
);

/** World-sized: an SVG over the whole stage, drawn in world units. */
const World = ({ cue, className, children }: { cue: VfxProps["cue"]; className: string; children?: ReactNode }) => (
  <svg className={`hammer-world ${className}`} viewBox="0 0 1600 900" data-params={JSON.stringify(cue.params ?? {})} aria-hidden="true">
    {children}
  </svg>
);

/* ── The paddles ───────────────────────────────────────────────────────── */

/**
 * One paddle in the room: which chair holds it, and its rank — the moment,
 * as a fraction of the whole bidding, it is outbid. Rank is distance from the
 * Magnate's place at the front of the room, a little shuffled, so the room
 * goes out in rings from where the Magnate stands.
 */
interface Paddle {
  row: number;
  x: number;
  tilt: number;
  lift: number;
  rank: number;
  /** Which way it falls. */
  fall: 1 | -1;
}

const ORIGIN = { x: 480, y: 800 };

const PADDLES: Paddle[] = (() => {
  const rand = seeded(1618);
  const list: Paddle[] = [];
  ROWS.forEach((row, r) =>
    row.chairs.forEach((c) => {
      if (!c.paddle) return;
      const d = Math.hypot((c.x - ORIGIN.x) * 0.8, (row.y - ORIGIN.y) * 2.4);
      list.push({ row: r, x: c.x, tilt: c.tilt, lift: c.lift, rank: d, fall: rand() < 0.5 ? 1 : -1 });
    }),
  );
  const max = Math.max(...list.map((p) => p.rank));
  for (const p of list) p.rank = clamp(p.rank / max + (rand() - 0.5) * 0.05, 0, 0.999);
  return list;
})();

/** The chairs never move: their paths are built once. */
const CHAIRS = ROWS.map((row) => {
  const { s, y } = row;
  let frame = "";
  let legs = "";
  let cane = "";
  for (const c of row.chairs) {
    const x = c.x;
    frame += `M${f1(x - 17 * s)} ${f1(y)} L${f1(x - 17 * s)} ${f1(y - 50 * s)} Q${f1(x - 17 * s)} ${f1(y - 68 * s)} ${f1(x)} ${f1(y - 68 * s)} Q${f1(x + 17 * s)} ${f1(y - 68 * s)} ${f1(x + 17 * s)} ${f1(y - 50 * s)} L${f1(x + 17 * s)} ${f1(y)} M${f1(x - 21 * s)} ${f1(y)} H${f1(x + 21 * s)} `;
    legs += `M${f1(x - 17 * s)} ${f1(y)} L${f1(x - 20 * s)} ${f1(y + 32 * s)} M${f1(x + 17 * s)} ${f1(y)} L${f1(x + 20 * s)} ${f1(y + 32 * s)} M${f1(x - 8 * s)} ${f1(y + 2 * s)} L${f1(x - 9 * s)} ${f1(y + 30 * s)} `;
    cane += `M${f1(x - 12 * s)} ${f1(y - 6 * s)} L${f1(x - 12 * s)} ${f1(y - 48 * s)} Q${f1(x - 12 * s)} ${f1(y - 62 * s)} ${f1(x)} ${f1(y - 62 * s)} Q${f1(x + 12 * s)} ${f1(y - 62 * s)} ${f1(x + 12 * s)} ${f1(y - 48 * s)} L${f1(x + 12 * s)} ${f1(y - 6 * s)} Z `;
  }
  return { frame, legs, cane, s };
});

/**
 * How much of the room has been outbid at `p`, from the cue's keys: pairs of
 * `time:fraction` through the shot, joined in straight lines, so a wave is a
 * rising segment and a hold is a flat one.
 */
function outbidAt(keys: [number, number][], p: number) {
  if (!keys.length) return 0;
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, da] = keys[i];
    const [tb, db] = keys[i + 1];
    if (p <= tb) return lerp(da, db, tb > ta ? (p - ta) / (tb - ta) : 1);
  }
  return keys[keys.length - 1][1];
}
const parseKeys = (s: string) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .map((k) => k.split(":").map(Number) as [number, number]);

const Paddles = ({ cue }: VfxProps) => (
  <World cue={cue} className={cue.params?.soft ? "hammer-paddles hammer-soft" : "hammer-paddles"}>
    {CHAIRS.map((c, r) => (
      <g key={r} data-row={r} style={{ "--s": c.s } as CSSProperties}>
        <path className="hammer-halo" />
        <path className="hammer-handle" style={{ strokeWidth: 4 * c.s }} />
        <path className="hammer-paddle" style={{ strokeWidth: 2.6 * c.s }} />
        <path className="hammer-paddle-mark" style={{ strokeWidth: 2.2 * c.s }} />
        <path className="hammer-chair-cane" d={c.cane} />
        <path className="hammer-chair-legs" d={c.legs} style={{ strokeWidth: 3.4 * c.s }} />
        <path className="hammer-chair" d={c.frame} style={{ strokeWidth: 5 * c.s }} />
      </g>
    ))}
  </World>
);

/**
 * The room outbid. Each paddle over its chair: a handle rising from a grip
 * just over the chair back, and an ivory disc with a ring painted on it and a
 * pool of its own light round it. Its rank passed, it falls away sideways and
 * sinks behind its chair, and its light goes with it.
 */
const paddles: Frame = (el, p) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const o = params(el);
  const keysSrc = String(o.keys ?? "0:0");
  const cache = el as HTMLElement & { _keys?: [number, number][] };
  const keys = (cache._keys ??= parseKeys(keysSrc));
  const now = outbidAt(keys, p);
  // A paddle takes this much of the bidding to go down.
  const fallFor = pn(o, "fall", 0.035);
  const out = ROWS.map(() => ({ halo: "", handle: "", paddle: "", mark: "", lit: 0, n: 0 }));
  for (const pad of PADDLES) {
    const row = ROWS[pad.row];
    const s = row.s;
    const k = clamp((now - pad.rank) / fallFor);
    const w = out[pad.row];
    w.n++;
    if (k >= 1) continue;
    const e = ease("in", k);
    const angle = (pad.tilt + pad.fall * 105 * e) * DEG;
    const gx = pad.x + 6 * s;
    const gy = row.y - (56 + pad.lift) * s + (58 + pad.lift) * s * e;
    const len = 40 * s;
    const hx = gx + Math.sin(angle) * len;
    const hy = gy - Math.cos(angle) * len;
    const cx = gx + Math.sin(angle) * (len + 20 * s);
    const cy = gy - Math.cos(angle) * (len + 20 * s);
    const rot = pad.tilt + pad.fall * 105 * e;
    w.handle += `M${f1(gx)} ${f1(gy)} L${f1(hx)} ${f1(hy)} `;
    w.paddle += ell(cx, cy, 17 * s, 21 * s, rot);
    w.mark += ell(cx, cy, 13.5 * s, 17 * s, rot);
    if (k < 0.5) w.halo += ell(cx, cy - 6 * s, 64 * s * (1 - k), 70 * s * (1 - k));
    w.lit += 1 - k;
  }
  svg.querySelectorAll<SVGGElement>("g[data-row]").forEach((g, r) => {
    const w = out[r];
    setD(g.querySelector(".hammer-halo"), w.halo);
    setD(g.querySelector(".hammer-handle"), w.handle);
    setD(g.querySelector(".hammer-paddle"), w.paddle);
    setD(g.querySelector(".hammer-paddle-mark"), w.mark);
    // The cane backs catch what light is left in their row.
    setStyle(g, "--lit", (w.n ? w.lit / w.n : 0).toFixed(3));
  });
};

/* ── The last paddle ───────────────────────────────────────────────────── */

const Last = ({ cue }: VfxProps) => (
  <Box cue={cue} className="hammer-last">
    <defs>
      <radialGradient id="hammer-last-light">
        <stop offset="0" stopColor={IVORY} stopOpacity="0.3" />
        <stop offset="0.45" stopColor={IVORY} stopOpacity="0.1" />
        <stop offset="1" stopColor={IVORY} stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse className="hammer-last-halo" cx="0" cy="-120" rx="420" ry="440" />
    {/* The chair it is held up from, its back just in the bottom of the frame. */}
    <path className="hammer-last-chair" d="M-330 520 L-330 290 Q-330 170 -180 170 L180 170 Q330 170 330 290 L330 520" />
    <path className="hammer-last-cane" d="M-280 520 L-280 300 Q-280 220 -180 220 L180 220 Q280 220 280 300 L280 520 Z" />
    <g transform="translate(0 -40) scale(0.78)">
    <g className="hammer-last-paddle">
      <path className="hammer-last-handle" d="M0 40 L0 520" />
      <path className="hammer-last-grain" d="M-4 60 L-3 500" />
      <ellipse className="hammer-last-face" cx="0" cy="-120" rx="150" ry="180" />
      {/* Card on a wooden handle: the grain of the card, and the light along one edge. */}
      <path className="hammer-last-card" d="M-96 -250 Q-40 -262 70 -240 M-120 -170 Q-20 -186 110 -160 M-130 -90 Q0 -104 126 -80 M-116 -10 Q-10 -22 104 0" />
      <path className="hammer-last-lit" d="M-104 -196 Q-112 -120 -90 -56" />
      {/* A gloved hand round the handle, a sleeve and a shirt cuff under it. */}
      <g transform="translate(0 -60)">
        <path className="hammer-last-sleeve" d="M-190 560 L-120 330 Q-60 300 40 330 L120 560 Z" />
        <path className="hammer-last-cuff" d="M-122 334 Q-40 296 44 330 L34 362 Q-40 334 -130 366 Z" />
        <path
          className="hammer-last-glove"
          d="M-70 150 Q-72 118 -40 118 L40 122 Q64 124 64 150 Q80 152 80 176 Q92 180 90 204 Q100 212 96 236 Q94 262 70 266 L-40 330 Q-90 320 -96 270 Q-104 210 -70 150 Z"
        />
        <path className="hammer-last-knuckles" d="M-30 150 Q10 146 60 152 M-20 180 Q20 176 78 180 M-14 208 Q24 204 88 208 M-10 236 Q28 232 92 236" />
        <path className="hammer-last-thumb" d="M-70 160 Q-120 190 -104 240 Q-90 262 -60 250" />
        {/* The paddle's light, caught on the top of the knuckles. */}
        <path className="hammer-last-catch" d="M-60 124 Q0 112 56 126" />
      </g>
    </g>
    </g>
  </Box>
);

/**
 * The quiet. One paddle, up, shaking in a hand that cannot hold it still —
 * a tremor too small to be motion, on the frame clock — and then it gives:
 * it tips and goes down out of the bottom of the frame, and its light with it.
 */
const last: Frame = (el, p, age) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const o = params(el);
  const give = pn(o, "give", 0.58);
  const k = ease("in", clamp((p - give) / Math.max(0.01, 1 - give - 0.08)));
  // The tremor: two slow sines and a frame-stepped jitter.
  const f = Math.floor(age / 40);
  const tremble = (Math.sin(age / 55) * 0.9 + Math.sin(age / 23 + 1) * 0.5 + (((f * 7919) % 11) / 11 - 0.5) * 0.8) * (1 - k);
  const rot = tremble * 1.2 + k * 34;
  const y = k * k * 900;
  const g = svg.querySelector<SVGGElement>(".hammer-last-paddle");
  if (g) g.setAttribute("transform", `translate(${f1(tremble * 1.6)} ${f1(y)}) rotate(${rot.toFixed(2)} 0 400)`);
  setStyle(svg.querySelector<SVGElement>(".hammer-last-halo"), "opacity", ((1 - k) * 0.9).toFixed(3));
};

/* ── The sale block ────────────────────────────────────────────────────── */

const Block = ({ cue }: VfxProps) => (
  <Box cue={cue} className="hammer-block">
    <path className="hammer-block-shadow" />
    <g className="hammer-block-half" data-half="0">
      <path className="hammer-block-side" />
      <path className="hammer-block-top" />
      <path className="hammer-block-rim" />
      <path className="hammer-block-inner" />
    </g>
    <g className="hammer-block-half" data-half="1">
      <path className="hammer-block-side" />
      <path className="hammer-block-top" />
      <path className="hammer-block-rim" />
      <path className="hammer-block-inner" />
    </g>
    <path className="hammer-block-split" />
  </Box>
);

/** The crack across the block, top face back to front edge, as points (x, y). */
function crack(rx: number, ry: number, band: number, seed: number) {
  const rand = seeded(seed);
  const pts: [number, number][] = [];
  const steps = 9;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Across the top face from the back rim to the front rim, then down the band.
    const y = t < 0.7 ? lerp(-ry, ry, t / 0.7) : lerp(ry, ry + band, (t - 0.7) / 0.3);
    const x = i === 0 || i === steps ? (rand() - 0.5) * rx * 0.08 : (rand() - 0.5) * rx * 0.34;
    pts.push([x, y]);
  }
  return pts;
}

/**
 * One half of the block: the top face and the band under it, left (`side` −1)
 * or right (+1) of the crack.
 */
function half(side: -1 | 1, rx: number, ry: number, band: number, cut: [number, number][]) {
  const n = 28;
  // The rim of the top face on this side, back to front.
  const rim: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI;
    rim.push([side * Math.cos(a) * rx, Math.sin(a) * ry]);
  }
  const clampX = (x: number) => (side < 0 ? Math.min(x, 0) : Math.max(x, 0));
  const topCut = cut.filter(([, y]) => y <= ry);
  let top = `M${f1(topCut[0][0])} ${f1(-ry)} `;
  for (const [x, y] of rim) top += `L${f1(side < 0 ? Math.min(x, topCut[0][0]) : Math.max(x, topCut[0][0]))} ${f1(y)} `;
  for (const [x, y] of [...topCut].reverse()) top += `L${f1(x)} ${f1(y)} `;
  top += "Z";
  // The band: the front rim of this side dropped by `band`.
  const front = rim.filter(([, y]) => y >= 0);
  let sideD = `M${f1(clampX(front[0][0]))} ${f1(front[0][1])} `;
  for (const [x, y] of front) sideD += `L${f1(x)} ${f1(y)} `;
  const last = cut[cut.length - 1];
  sideD += `L${f1(last[0])} ${f1(ry + band)} `;
  for (const [x, y] of [...front].reverse()) sideD += `L${f1(x)} ${f1(y + band)} `;
  sideD += "Z";
  let rimD = "";
  for (const [i, [x, y]] of rim.entries()) rimD += `${i ? "L" : "M"}${f1(x)} ${f1(y)} `;
  // The inside of the split, lit.
  let inner = `M${f1(cut[0][0])} ${f1(cut[0][1])} `;
  for (const [x, y] of cut) inner += `L${f1(x)} ${f1(y)} `;
  inner += `L${f1(last[0] - side * rx * 0.1)} ${f1(last[1])} `;
  for (const [x, y] of [...cut].reverse()) inner += `L${f1(x - side * rx * 0.1)} ${f1(y + 4)} `;
  inner += "Z";
  return { top, side: sideD, rim: rimD, inner };
}

const blocks = new WeakMap<HTMLElement, { key: string; halves: ReturnType<typeof half>[]; cut: [number, number][] }>();

/**
 * The sale block, sized to the lot on it.
 *
 *  call   on the board: drawn in from the feet outward under the real target
 *  stand  whole, stood on
 *  split  split at `hit` (a fraction of the cue): the crack runs, the halves
 *         tip apart and the inside of the split shows Tyrian
 *  board  on the board, already split, the split glowing out
 */
const block: Frame = (el, p) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const o = params(el);
  const mode = String(o.mode ?? "stand");
  const h = height(el);
  const unitW = parseFloat(el.style.getPropertyValue("--unit-w")) || 0;
  const rx = Math.max(h * pn(o, "w", 0.62), unitW * pn(o, "uw", 0));
  const ry = rx * pn(o, "flat", 0.2);
  const band = rx * pn(o, "band", 0.2);
  const key = `${rx.toFixed(0)}`;
  let cached = blocks.get(el);
  if (!cached || cached.key !== key) {
    const cut = crack(rx, ry, band, pn(o, "seed", 7));
    cached = { key, cut, halves: [half(-1, rx, ry, band, cut), half(1, rx, ry, band, cut)] };
    blocks.set(el, cached);
  }
  let open = 0;
  let grow = 1;
  let glow = 0;
  if (mode === "call") grow = ease("out", clamp(p / 0.6));
  if (mode === "split") {
    const since = p - pn(o, "hit", 0);
    open = since < 0 ? 0 : ease("out", clamp(since / 0.18));
    glow = since < 0 ? 0 : Math.max(0.35, 1 - since * 1.2);
  }
  if (mode === "board") {
    open = 0.85;
    glow = Math.max(0, 1 - p * 1.1);
  }
  const g = svg.querySelectorAll<SVGGElement>(".hammer-block-half");
  g.forEach((node, i) => {
    const side = i ? 1 : -1;
    const hv = cached!.halves[i];
    setD(node.querySelector(".hammer-block-top"), hv.top);
    setD(node.querySelector(".hammer-block-side"), hv.side);
    setD(node.querySelector(".hammer-block-rim"), hv.rim);
    setD(node.querySelector(".hammer-block-inner"), open > 0 ? hv.inner : "");
    const dx = side * rx * 0.1 * open;
    const dy = band * 0.5 * open;
    node.setAttribute("transform", `translate(${f1(dx)} ${f1(dy)}) rotate(${(side * 9 * open).toFixed(2)} ${f1(side * rx)} ${f1(ry + band)}) scale(${grow.toFixed(3)})`);
  });
  let split = "";
  if (open > 0 || mode === "board") for (const [i, [x, y]] of cached.cut.entries()) split += `${i ? "L" : "M"}${f1(x)} ${f1(y + band * 0.5 * open)} `;
  setD(svg.querySelector(".hammer-block-split"), split);
  setStyle(svg, "--glow", glow.toFixed(3));
  setD(svg.querySelector(".hammer-block-shadow"), ell(0, ry + band * 0.8, rx * 1.18 * grow, ry * 1.5 * grow));
  setStyle(svg, "opacity", mode === "board" ? clamp((1 - p) * 4).toFixed(3) : "1");
};

/* ── The knock ─────────────────────────────────────────────────────────── */

const Knock = ({ cue }: VfxProps) => (
  <Box cue={cue} className={`hammer-knock ${cue.params?.half === "back" ? "back" : "front"}`}>
    <path className="hammer-knock-grain thick" />
    <path className="hammer-knock-grain thin" />
    <path className="hammer-knock-wedge" />
    <path className="hammer-knock-stamp" />
    <path className="hammer-knock-split" />
  </Box>
);

/**
 * The knock, drawn: what a sale hammer does to a sound block, done to the
 * lot. Round the place the head lands, the block's end grain — ragged rings,
 * one inside the next, laid flat on the lot like ripples on a floor — stamped
 * at full size on the first frame; hard black wedges of split lacquer driven
 * out sideways from under the head; and the split it drives straight down
 * through the lot to the block. After the hit-stop the rings run out and
 * thin, the wedges lengthen, and all of it goes.
 *
 * The rings pass behind the hammer's head and in front of the lot's body, so
 * the effect is drawn in two halves: `half: "back"` (the far arcs, behind the
 * cast) and `half: "front"` (the near arcs, the split and the stamp).
 */
const knock: Frame = (el, p, age) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const o = params(el);
  const back = o.half === "back";
  const h = height(el);
  const size = pn(o, "size", 1) * h;
  const ox = pn(o, "ox", 0) * h;
  const oy = pn(o, "oy", -0.6) * h;
  const floor = pn(o, "floor", 0) * h;
  const flat = pn(o, "flat", 0.3);
  const k = ease("out", clamp(p / 0.6));
  // The frame clock boils the rings between two drawings while the stop holds.
  const boil = Math.floor(age / 45) % 2;
  const rand = seeded(pn(o, "seed", 13));
  let thick = "";
  let thin = "";
  const rings = 5;
  for (let r = 0; r < rings; r++) {
    const base = size * (0.26 + r * 0.19) * (1 + k * (0.25 + r * 0.08));
    const n = 3 + Math.floor(rand() * 3);
    const phase = rand() * Math.PI * 2;
    const amp = 0.05 + rand() * 0.05;
    const steps = 36;
    let d = "";
    for (let i = 0; i <= steps; i++) {
      // The far half runs over the top (π…2π), the near half under (0…π).
      const a = (back ? Math.PI : 0) + (i / steps) * Math.PI;
      const wob = 1 + Math.sin(a * n + phase + boil * 0.5) * amp;
      d += `${i ? "L" : "M"}${f1(ox + Math.cos(a) * base * wob)} ${f1(oy + Math.sin(a) * base * wob * flat)} `;
    }
    if (r % 2 === 0) thick += d;
    else thin += d;
  }
  setD(svg.querySelector(".hammer-knock-grain.thick"), thick);
  setD(svg.querySelector(".hammer-knock-grain.thin"), thin);
  setStyle(svg, "--k", k.toFixed(3));
  // The wedges: split lacquer driven out sideways from under the head.
  let wedges = "";
  const wr = seeded(pn(o, "seed", 13) + 3);
  for (let i = 0; i < 10; i++) {
    const side = i % 2 ? 1 : -1;
    const up = wr() < 0.5;
    if (up !== back) {
      wr();
      wr();
      wr();
      continue;
    }
    const a = (side < 0 ? Math.PI : 0) + side * (up ? -1 : 1) * (0.06 + wr() * 0.3);
    const len = size * (0.5 + wr() * 0.5) * (0.9 + 0.5 * k);
    const w = size * (0.04 + wr() * 0.03);
    const r0 = size * 0.2;
    const x0 = ox + Math.cos(a) * r0;
    const y0 = oy + Math.sin(a) * r0 * flat;
    const x1 = ox + Math.cos(a) * len;
    const y1 = oy + Math.sin(a) * len * flat;
    wedges += `M${f1(x0)} ${f1(y0 - w)} L${f1(x1)} ${f1(y1)} L${f1(x0)} ${f1(y0 + w)} Z `;
  }
  setD(svg.querySelector(".hammer-knock-wedge"), wedges);
  if (!back) {
    // The struck spot, and the split driven down through the lot.
    setD(svg.querySelector(".hammer-knock-stamp"), ell(ox, oy + size * 0.02, size * 0.2 * (1 + k * 0.4), size * 0.2 * flat * (1 + k * 0.4)));
    const sr = seeded(pn(o, "seed", 13) + 5);
    let split = `M${f1(ox)} ${f1(oy)} `;
    const steps = 7;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      split += `L${f1(ox + (sr() - 0.5) * size * 0.18)} ${f1(lerp(oy, floor, t))} `;
    }
    setD(svg.querySelector(".hammer-knock-split"), split);
  }
  setStyle(svg, "opacity", clamp((1 - p) * 2.4).toFixed(3));
};

/* ── Splinters ─────────────────────────────────────────────────────────── */

const Splinters = ({ cue }: VfxProps) => (
  <Box cue={cue} className="hammer-splinters">
    <path className="hammer-splinter-edge" />
    <path className="hammer-splinter-body" />
  </Box>
);

/** Black lacquer thrown off the split, turning, falling back to the floor. */
const splinters: Frame = (el, p) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const o = params(el);
  const h = height(el);
  const rand = seeded(pn(o, "seed", 5));
  const n = pn(o, "count", 22);
  const y0 = pn(o, "oy", 0.05) * h;
  let body = "";
  let edge = "";
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1;
    const a = -Math.PI / 2 + side * (0.25 + rand() * 1.1);
    const speed = h * (0.9 + rand() * 1.6);
    const born = rand() * 0.06;
    const t = Math.max(0, p - born);
    if (p < born) continue;
    const x = Math.cos(a) * speed * t;
    const y = y0 + Math.sin(a) * speed * t + h * 3.2 * t * t;
    const len = h * (0.05 + rand() * 0.07);
    const w = len * (0.22 + rand() * 0.2);
    const spin = (rand() - 0.5) * 30 * t + a;
    const cx = Math.cos(spin);
    const sx = Math.sin(spin);
    const d = `M${f1(x + cx * len)} ${f1(y + sx * len)} L${f1(x - sx * w)} ${f1(y + cx * w)} L${f1(x - cx * len * 0.8)} ${f1(y - sx * len * 0.8)} L${f1(x + sx * w * 0.6)} ${f1(y - cx * w * 0.6)} Z `;
    body += d;
    edge += d;
  }
  setD(svg.querySelector(".hammer-splinter-body"), body);
  setD(svg.querySelector(".hammer-splinter-edge"), edge);
  setStyle(svg, "opacity", clamp((1 - p) * 2.2).toFixed(3));
};

/* ── Light, and the board ──────────────────────────────────────────────── */

/** Tyrian behind the lot, so the drawn frame cuts both figures out against it. */
const Glow = () => <div className="hammer-glow" />;

const Outbid = ({ cue }: VfxProps) => (
  <div className="hammer-outbid" data-params={JSON.stringify(cue.params ?? {})} />
);

/**
 * On the board: every other enemy has been outbid. Over each one a paddle is
 * held up, and lowered, and laid at its feet. The target is left out: it was
 * bought. The engine anchors effects only on the caster, its targets and the
 * party, so this one finds the rest of the enemy line on the stage itself.
 */
const outbid: Frame = (el, p) => {
  const root = el.closest<HTMLElement>(".ult-cinematic");
  const holder = el.querySelector<HTMLElement>(".hammer-outbid");
  if (!root || !holder) return;
  const box = root.getBoundingClientRect();
  const bought = root.querySelector<HTMLElement>(".fx-hammer-block-wrap[data-anchor]")?.dataset.anchor;
  const units = [...document.querySelectorAll<HTMLElement>('.stage .combatant[data-side="enemy"]')].filter(
    (u) => !u.hasAttribute("data-down") && u.dataset.unit !== bought,
  );
  if (holder.childElementCount !== units.length) {
    holder.innerHTML = units
      .map(
        () =>
          `<svg class="hammer-outbid-one" viewBox="-60 -160 120 180"><ellipse class="hammer-outbid-halo" cx="0" cy="-110" rx="46" ry="50"/><g class="hammer-outbid-paddle"><path class="hammer-outbid-handle" d="M0 -60 L0 0"/><ellipse class="hammer-outbid-face" cx="0" cy="-86" rx="20" ry="25"/><ellipse class="hammer-outbid-mark" cx="0" cy="-86" rx="10" ry="13"/></g></svg>`,
      )
      .join("");
  }
  const kids = holder.querySelectorAll<SVGSVGElement>(".hammer-outbid-one");
  units.forEach((u, i) => {
    const body = (u.querySelector<HTMLElement>(".combatant-body") ?? u).getBoundingClientRect();
    const svg = kids[i];
    if (!svg) return;
    const delay = i * 0.07;
    // Held up a moment over each, then lowered.
    const k = clamp((p - 0.22 - delay) / 0.3);
    const down = ease("inOut", k);
    const size = Math.max(70, body.height * 1.1);
    svg.style.left = `${f1(body.left + body.width * 0.5 - box.left - size / 2)}px`;
    svg.style.top = `${f1(body.bottom - box.top - size * 1.5)}px`;
    svg.style.width = `${f1(size)}px`;
    svg.style.height = `${f1(size * 1.5)}px`;
    const paddle = svg.querySelector<SVGGElement>(".hammer-outbid-paddle");
    paddle?.setAttribute("transform", `translate(0 ${f1(-40 * (1 - down) + 8 * down)}) rotate(${(down * (i % 2 ? 96 : -96)).toFixed(1)} 0 0)`);
    setStyle(svg, "opacity", (clamp(p / 0.1) * clamp((1 - p) * 5)).toFixed(3));
    setStyle(svg.querySelector<SVGElement>(".hammer-outbid-halo"), "opacity", ((1 - down) * 0.8).toFixed(3));
  });
};

/* ── Registered ────────────────────────────────────────────────────────── */

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "hammer-paddles": Paddles,
  "hammer-last": Last,
  "hammer-block": Block,
  "hammer-knock": Knock,
  "hammer-splinters": Splinters,
  "hammer-glow": Glow,
  "hammer-outbid": Outbid,
};

export const frames: Record<string, Frame> = {
  "hammer-paddles": paddles,
  "hammer-last": last,
  "hammer-block": block,
  "hammer-knock": knock,
  "hammer-splinters": splinters,
  "hammer-outbid": outbid,
};
