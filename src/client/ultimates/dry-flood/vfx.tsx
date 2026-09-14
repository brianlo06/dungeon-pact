import { useId, type ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import { FIRE, FireDefs, Puff, Tongue, boil, fade, place } from "./fire";
import { FLOOR, LENGTH, PIECES, RISES, TREAD, VP, edgeAt, edgeX, floorD } from "./weir";
import { POUR_TIP_MS } from "./poses";
import "./style.css";

/**
 * Dry Flood's effects.
 *
 * The idea they serve: the Pyromancer tips its spark over the lip of a dry
 * spillway and the fire goes down it the way the water used to, faster. So
 * the fire here is always *going somewhere*: poured off a glove, running down
 * steps, flooding a floor, and it is drawn one way everywhere (`fire.tsx`):
 * flat layers of deep red, orange and gold. The flood is one body; only the
 * small fires (a flame in a glove, a burning figure) are tongues.
 *
 *   dry-flame      the spark in the glove, turned to a flame, until it is poured
 *   dry-pour       a ribbon of fire falling from the glove, tongues licking up it
 *   dry-fire       the flood on the spillway (`weir.ts`): one body of fire with
 *                  a rolling front, sheeting down the steps, curling over each
 *                  nose, pooling across the basin, piling up the figures' legs
 *                  and thrown up over them like spray; `band: "front"` draws
 *                  only the near edge of the pool, before their feet
 *   dry-smoke      smoke rising off what burns
 *   dry-smoke-wipe smoke rolling across the lens, for the cut into the quiet
 *   dry-crest      the quiet: the flood's front cresting the top step like a wave
 *   dry-draft      the quiet: the air drawn up the steps towards the fire
 *   dry-kindle     on the board: the flame catching in the real glove
 *   dry-burning    on the board: every real enemy in the row still burning
 *   dry-singe      on the board: the Pyromancer's own sleeve alight, beaten out
 *
 * Everything moves from a frame function or the stage's variables; no
 * filters, no keyframes, and a glow is a small flat gradient at most. Clip
 * timing is read in milliseconds (`age`), because a clip plays at one rate in
 * FULL and FAST while a shot's fractions do not.
 */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const num = (value: unknown, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const fid = (raw: string) => `dry${raw.replace(/[^a-zA-Z0-9]/g, "")}`;

/* ── Where things are ─────────────────────────────────────────────────── */

/** A client rect's centre, in the world units of an effect's wrapper. */
function toWorld(el: HTMLElement, x: number, y: number) {
  const film = el.closest<HTMLElement>(".ult-cinematic");
  const world = film?.querySelector<HTMLElement>(".cine-world");
  if (!film || !world) return null;
  const root = film.getBoundingClientRect();
  const m = new DOMMatrix(world.style.transform || "none").inverse();
  const wrap = el.getBoundingClientRect();
  const origin = m.transformPoint(new DOMPoint(wrap.left - root.left, wrap.top - root.top));
  const at = m.transformPoint(new DOMPoint(x - root.left, y - root.top));
  return { x: at.x - origin.x, y: at.y - origin.y, zoom: 1 / Math.hypot(m.a, m.b) };
}

/**
 * The caster's flame, in world units: the spark while it is drawn, else the
 * glove (a worn weapon hides the spark, and a poured spark is gone).
 */
function flameAt(el: HTMLElement) {
  const film = el.closest<HTMLElement>(".ult-cinematic");
  const caster = film?.querySelector<HTMLElement>('.cine-actors > .cine-actor[data-role="caster"]');
  if (!caster) return null;
  const spark = caster.querySelector<SVGGraphicsElement>('[data-part="spark"] circle');
  const s = spark?.getBoundingClientRect();
  const glove = caster.querySelector<SVGGraphicsElement>('[data-part="hand"] path[fill="#d8c8ae"]');
  const g = glove?.getBoundingClientRect();
  if (s && s.width > 2) {
    // Held in the palm: between the spark's own place and the glove.
    const gx = g && g.width ? g.left + g.width * 0.7 : s.left + s.width / 2;
    const gy = g && g.width ? g.top + g.height * 0.35 : s.top + s.height / 2;
    const at = toWorld(el, lerp(s.left + s.width / 2, gx, 0.45), lerp(s.top + s.height / 2, gy, 0.45));
    return at && { ...at, size: s.width, spark: true };
  }
  if (!g || !g.width) return null;
  const at = toWorld(el, g.left + g.width * 0.75, g.top + g.height * 0.5);
  return at && { ...at, size: g.width, spark: false };
}

/* ── The spark, a flame ───────────────────────────────────────────────── */

const Flame = ({ cue }: VfxProps): ReactNode => {
  const id = fid(useId());
  return (
    <svg className="dry-world dry-fire-svg" viewBox="0 0 1600 900" data-k="0" data-tip={String(cue.params?.tip ?? POUR_TIP_MS)}>
      <FireDefs id={id} />
      <radialGradient id={`${id}-glow`}>
        <stop offset="0" stopColor={FIRE.gold} stopOpacity="0.55" />
        <stop offset="1" stopColor={FIRE.orange} stopOpacity="0" />
      </radialGradient>
      <g className="dry-flame">
        <circle className="dry-flame-glow" cy="-30" r="70" fill={`url(#${id}-glow)`} />
        <g transform="rotate(-8) scale(0.72)">
          <Tongue id={id} ph={0} />
        </g>
        <g transform="translate(-14 4) rotate(-22) scale(0.42)">
          <Tongue id={id} ph={1} />
        </g>
        <g transform="translate(15 3) rotate(18) scale(0.46)">
          <Tongue id={id} ph={2} />
        </g>
      </g>
    </svg>
  );
};

const flame: Frame = (el, _p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-fire-svg");
  const g = svg?.querySelector(".dry-flame");
  if (!svg || !g) return;
  boil(svg, age, 60);
  const tip = num(svg.dataset.tip, POUR_TIP_MS);
  const at = age < tip ? flameAt(el) : null;
  if (!at) {
    fade(g, 0);
    return;
  }
  // The flame is the spark's size and a half again, and grows as it swells.
  const size = at.size * at.zoom;
  const k = clamp(size / 90, 0.25, 2);
  place(g, `translate(${at.x.toFixed(1)} ${(at.y + size * 0.3).toFixed(1)}) scale(${k.toFixed(3)})`);
  fade(g, 1);
};

/* ── Poured ───────────────────────────────────────────────────────────── */

const POUR_TONGUES = 16;

const Pour = ({ cue }: VfxProps): ReactNode => {
  const id = fid(useId());
  const rand = seeded(cue.seed ?? 5);
  return (
    <svg
      className="dry-world dry-fire-svg"
      viewBox="0 0 1600 900"
      data-k="0"
      data-tip={String(cue.params?.tip ?? POUR_TIP_MS)}
      data-land={String(cue.params?.land ?? 1150)}
      data-size={String(cue.params?.size ?? 1)}
    >
      <FireDefs id={id} />
      <g className="dry-pour" opacity="0">
        <path className="dry-pour-band" fill={FIRE.orange} />
        <path className="dry-pour-core" fill={FIRE.gold} />
        {Array.from({ length: POUR_TONGUES }, (_, i) => (
          <g key={i} className="dry-pour-t" data-off={(i / POUR_TONGUES + rand() * 0.03).toFixed(3)} data-sway={((rand() - 0.5) * 16).toFixed(1)}>
            <Tongue id={id} ph={i} />
          </g>
        ))}
        {/* where it lands: the step below catches all at once */}
        {Array.from({ length: 9 }, (_, i) => (
          <g key={`s${i}`} className="dry-pour-splash" data-x={((i - 4) * 38 + (rand() - 0.5) * 16).toFixed(0)} data-s={(1.3 - Math.abs(i - 4) * 0.2 + rand() * 0.2).toFixed(2)} data-r={((i - 4) * 7).toFixed(0)} opacity="0">
            <Tongue id={id} ph={i + 1} />
          </g>
        ))}
      </g>
    </svg>
  );
};

/** Where the pour left the glove, kept so it hangs from there as the hand moves on. */
const pourFrom = new WeakMap<HTMLElement, { x: number; y: number }>();

const pour: Frame = (el, _p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-fire-svg");
  const g = svg?.querySelector(".dry-pour");
  if (!svg || !g) return;
  boil(svg, age, 55);
  const tip = num(svg.dataset.tip, POUR_TIP_MS);
  const land = num(svg.dataset.land, 1150);
  const size = num(svg.dataset.size, 1);
  if (age < tip - 10) {
    fade(g, 0);
    return;
  }
  const at = flameAt(el);
  if (at) pourFrom.set(el, { x: at.x, y: at.y });
  const from = pourFrom.get(el);
  if (!from) return;
  fade(g, 1);
  // The ribbon runs out of the glove and down the drop to the step below in 130ms.
  const run = clamp((age - tip + 10) / 130);
  const L = Math.max(0, land - from.y) * run;
  // It bows away from the lip as it falls, and spreads as it goes.
  const bow = 46 * size;
  const mid = (k: number) => bow * k * k;
  const half = (k: number) => (14 + 40 * k) * size;
  const edge = (side: number, scale: number) =>
    [0, 0.2, 0.4, 0.6, 0.8, 1].map((k) => `${(mid(k) + side * half(k) * scale).toFixed(1)} ${(k * L).toFixed(1)}`);
  const shape = (scale: number) => `M${edge(-1, scale).join(" L")} L${edge(1, scale).reverse().join(" L")} Z`;
  const band = shape(1);
  const core = shape(0.42);
  const bandEl = g.querySelector(".dry-pour-band");
  const coreEl = g.querySelector(".dry-pour-core");
  if (bandEl?.getAttribute("d") !== band) bandEl?.setAttribute("d", band);
  if (coreEl?.getAttribute("d") !== core) coreEl?.setAttribute("d", core);
  place(g, `translate(${from.x.toFixed(1)} ${from.y.toFixed(1)})`);
  // Tongues ride down both edges of the ribbon as it falls, and every one of
  // them licks up and outwards: it is fire, not water, however it is poured.
  let i = 0;
  for (const t of g.querySelectorAll<SVGGElement>(".dry-pour-t")) {
    const side = i++ % 2 ? 1 : -1;
    const k = (num(t.dataset.off, 0) + age / 480) % 1;
    const y = k * L;
    const x = mid(k) + side * half(k) * 0.8;
    const s = (0.4 + k * 0.6) * size * (y < L ? 1 : 0);
    place(t, `translate(${x.toFixed(1)} ${(y + 8).toFixed(1)}) rotate(${(side * 34 + num(t.dataset.sway, 0)).toFixed(1)}) scale(${s.toFixed(3)})`);
  }
  // Landed: a burst of tongues on the step, settling to a burn.
  const since = age - tip - 120;
  for (const t of g.querySelectorAll<SVGGElement>(".dry-pour-splash")) {
    if (since < 0) {
      fade(t, 0);
      continue;
    }
    const up = since < 60 ? since / 60 : lerp(1, 0.7, clamp((since - 60) / 300));
    const s = num(t.dataset.s, 1) * up * size;
    place(t, `translate(${(bow + num(t.dataset.x, 0) * size).toFixed(1)} ${L.toFixed(1)}) rotate(${t.dataset.r}) scale(${(s * 0.95).toFixed(3)} ${s.toFixed(3)})`);
    fade(t, 1);
  }
};

/* ── The fire on the spillway: one body, with a front ─────────────────── */

/**
 * The flood is drawn the way water in flood is: one body with a front. Each
 * frame its outline is traced along the steps' edge (`weir.ts`) from where
 * it was fed to where its front has got to: a sheet lying on each tread, a
 * curtain that shoots out off each nose and falls to the next, a pool that
 * spreads over the floor and piles up against whatever stands in it, and at
 * the front a rolling head that curls over and tumbles down each riser.
 *
 * It is fire all the same. Its surface is not a waterline but a crowd of
 * licks riding the current, every one its own width and height and flicker
 * (hashed from its place in the flow, never a repeated drawing), trailing
 * back against the way it runs; bright streaks run along inside it like the
 * lines on fast water; where the front hits a figure it throws blades of
 * flame up and over it like spray. Three flat layers (deep red, orange, gold)
 * are the same outline at three thicknesses. No sprites, no blur.
 */

/** A fixed random number for an integer and a channel. */
function hash(i: number, k: number) {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** How far apart the licks ride, and how fast the current carries them. */
const LICK_GAP = 26;
const FLOW = 70;

/** The height of the licks at `d` along the flow, `t` seconds in. */
function lick(d: number, t: number) {
  const q = d - t * FLOW;
  const i0 = Math.round(q / LICK_GAP);
  let v = 0;
  for (let i = i0 - 1; i <= i0 + 1; i++) {
    const c = i * LICK_GAP + (hash(i, 1) - 0.5) * 14;
    const w = 10 + hash(i, 2) * 18;
    const u = Math.abs(q - c) / w;
    if (u >= 1) continue;
    const tall = hash(i, 3);
    const L = 12 + tall * tall * 92;
    const flick = 0.62 + 0.38 * Math.sin(t * (8 + hash(i, 4) * 9) + hash(i, 5) * 6.28);
    v = Math.max(v, L * flick * (1 - u) ** 1.7);
  }
  return v;
}

/** The sheet's thickness `a` units behind its front: a head, then the body. */
function thickness(a: number, floor: boolean) {
  const head = floor ? 130 : 112;
  const body = floor ? 64 : 56;
  if (a < 0) return 0;
  if (a < 34) return head * (0.45 + (0.55 * a) / 34);
  if (a < 240) return lerp(head, body, (a - 34) / 206);
  return body;
}

interface Figure {
  x: number;
  y: number;
  h: number;
}

const Fire = ({ cue }: VfxProps): ReactNode => {
  const band = String(cue.params?.band ?? "all");
  const smoke = !!cue.params?.smoke;
  return (
    <svg
      className="dry-world dry-fire-svg"
      viewBox="0 0 1600 900"
      data-band={band}
      data-from={String(cue.params?.from ?? 0)}
      data-to={String(cue.params?.to ?? LENGTH)}
      data-go={String(cue.params?.go ?? 0)}
      data-end={String(cue.params?.end ?? 1)}
      data-ease={String(cue.params?.ease ?? "linear")}
      data-s={String(cue.scale ?? 1)}
    >
      {smoke &&
        PIECES.filter((p) => p.kind === "tread").map((p, i) => (
          <g key={`puff-${i}`} className="dry-rise" data-d={p.d + 45} data-x={p.x0 + 45} data-y={p.y0 - 30} opacity="0">
            <Puff />
          </g>
        ))}
      <path className="dry-sheet dry-sheet-0" fill={FIRE.deep} />
      <path className="dry-sheet dry-sheet-1" fill={FIRE.orange} />
      <path className="dry-sheet dry-sheet-2" fill={FIRE.gold} />
      <path className="dry-sheet-core" fill="none" stroke={FIRE.core} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
};

const f1 = (n: number) => n.toFixed(1);

/**
 * The flood's outline at one thickness `s` (1 for the outer layer), for a
 * front at `F`. `front` draws only the near edge of the pool, in front of
 * the figures' feet.
 */
function outline(F: number, s: number, S: number, t: number, band: string, figures: Figure[], feet: number) {
  const near = band === "front";
  const start = near ? LENGTH - 40 : -50;
  if (F <= start) return "";
  const tops: string[] = [];
  const bottoms: string[] = [];
  let reach = 0;
  const pool = (x: number) => {
    let v = 0;
    for (const f of figures) {
      const w = Math.max(40, f.h * 0.3);
      const u = (x - f.x) / w;
      if (Math.abs(u) >= 1) continue;
      const since = F - floorD(f.x);
      if (since < 0) continue;
      const rise = since < 90 ? since / 90 : lerp(1, 0.55, clamp((since - 90) / 420));
      v = Math.max(v, Math.min(f.h * 0.55, 150) * rise * (1 - u * u) * (0.85 + 0.15 * Math.sin(t * 11 + f.x)));
    }
    return v;
  };
  for (let d = start; d <= F; d += d >= LENGTH ? 8 : 5) {
    const e = edgeAt(d);
    const floor = e.kind === "floor";
    const ey = near ? feet + 22 : e.y;
    const a = F - d;
    let h = thickness(a, floor) * S * s * (near ? 0.75 : 1);
    if (floor) h += pool(e.x) * s * (near ? 0.6 : 1);
    const lk = a > 30 ? lick(d, t) * S * s * (near ? 0.7 : 1) : 0;
    bottoms.push(`${f1(e.x)} ${f1(ey + (near ? 12 + 7 * Math.sin(e.x * 0.037 + 1) + 5 * Math.sin(e.x * 0.091) : 2))}`);
    if (e.kind === "riser") {
      // Off the nose it shoots out and falls in a curtain to the next tread.
      const out = (12 + h * 0.55) * (1 - (1 - e.k) ** 2);
      tops.push(`${f1(e.x + out + lk * 0.2)} ${f1(e.y - h * (1 - e.k) * 0.6 - lk * 0.4 * (1 - e.k))}`);
      reach = 12 + h * 0.55;
    } else {
      // Where the curtain lands, the tread under it is already covered.
      if (e.kind === "tread" && e.k * TREAD < reach) continue;
      tops.push(`${f1(e.x - lk * 0.35)} ${f1(ey - h - lk)}`);
    }
  }
  // The head: a rolling lobe that curls over ahead of the body. On a tread
  // or the floor it rolls forwards; on a riser it tumbles down the face.
  const e = edgeAt(F);
  const floor = e.kind === "floor";
  const H = thickness(34, floor) * S * s * (near ? 0.75 : 1);
  const falling = e.kind === "riser";
  const [fx, fy, nx, ny] = falling ? [0, 1, 1, 0] : [1, 0, 0, -1];
  const bx = e.x;
  const by = near && floor ? feet + 22 : e.y;
  const spin = Math.sin(t * 9) * 0.1;
  // A roll that goes up over the top, out ahead and curls back under itself,
  // its outer edge torn into licks that flicker as it tumbles.
  const curl: [number, number][] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const q = i / steps;
    const phi = lerp(-0.7, 3.4, q);
    let r = H * 0.52 * (1 - 0.5 * q);
    const tip = phi > -0.6 && phi < 1.1 && i % 2 === 1 ? H * (0.1 + 0.16 * hash(i, 41)) * (0.7 + 0.3 * Math.sin(t * 15 + i)) : 0;
    // Licks over the top of the roll trail back against the way it runs.
    curl.push([0.3 + (Math.sin(phi) * (r + tip * 0.4)) / H - (tip * 0.6) / H, 0.5 + (Math.cos(phi) * (r + tip)) / H]);
  }
  curl.push([0.55, 0]);
  for (const [u0, v0] of curl) {
    const u = u0 * H;
    const v = v0 * H;
    const ru = u * Math.cos(spin) - v * Math.sin(spin);
    const rv = u * Math.sin(spin) + v * Math.cos(spin);
    tops.push(`${f1(bx + fx * ru + nx * rv)} ${f1(by + fy * ru + ny * rv)}`);
  }
  return `M${bottoms[0]} L${tops.join(" L")} L${bottoms.reverse().join(" L")} Z`;
}

/** Blades of flame thrown up over a figure as the front hits it, like spray. */
function spray(F: number, s: number, S: number, figures: Figure[]) {
  let d = "";
  for (const [n, f] of figures.entries()) {
    const since = F - floorD(f.x);
    if (since < 0 || since > 1000) continue;
    const k = since / 1000;
    const grow = (k < 0.12 ? k / 0.12 : lerp(1, 0.35, (k - 0.12) / 0.88)) * s;
    for (let j = 0; j < 7; j++) {
      const angle = ((-148 + j * 17 + (hash(n * 7 + j, 6) - 0.5) * 14 + Math.sin(since * 0.02 + j) * 6) * Math.PI) / 180;
      const L = Math.min(f.h, 300) * (0.8 + hash(n * 7 + j, 7) * 0.8) * grow;
      if (L < 4) continue;
      const w = (9 + hash(n * 7 + j, 8) * 12) * S * s;
      const bx = f.x + (hash(n * 7 + j, 9) - 0.5) * f.h * 0.3;
      const by = f.y - f.h * 0.22;
      const tx = bx + Math.cos(angle) * L;
      const ty = by + Math.sin(angle) * L;
      // Heat takes every blade upward as it goes.
      const cx = (bx + tx) / 2;
      const cy = (by + ty) / 2 - L * 0.22;
      const px = -Math.sin(angle) * w;
      const py = Math.cos(angle) * w;
      d += `M${f1(bx - px)} ${f1(by - py)} Q${f1(cx - px * 0.5)} ${f1(cy - py * 0.5)} ${f1(tx)} ${f1(ty)} Q${f1(cx + px * 0.5)} ${f1(cy + py * 0.5)} ${f1(bx + px)} ${f1(by + py)} Z `;
    }
  }
  return d;
}

/** Bright streaks carried along inside the sheet, like the lines on fast water. */
function streaks(F: number, S: number, t: number) {
  let d = "";
  for (let i = 0; i < 46; i++) {
    const speed = 240 + hash(i, 11) * 160;
    const len = 16 + hash(i, 12) * 26;
    const head = ((hash(i, 13) * 2600 + t * speed) % 2600) - 60;
    if (head > F - 34 || head - len < -40) continue;
    const frac = 0.22 + hash(i, 14) * 0.32;
    const at = (x: number) => {
      const e = edgeAt(x);
      const h = thickness(F - x, e.kind === "floor") * S * frac;
      if (e.kind === "riser") return `${f1(e.x + (12 + (h / frac) * 0.55) * (1 - (1 - e.k) ** 2) * 0.6)} ${f1(e.y - h * (1 - e.k) * 0.6)}`;
      return `${f1(e.x)} ${f1(e.y - h)}`;
    };
    d += `M${at(head - len)} L${at(head - len / 2)} L${at(head)} `;
  }
  return d;
}

const setPath = (el: Element | null, d: string) => {
  if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
};

const fire: Frame = (el, p, age, ctx) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-fire-svg");
  if (!svg) return;
  const d = svg.dataset;
  const go = num(d.go, 0);
  const end = num(d.end, 1);
  const k = ease((d.ease ?? "linear") as never, (p - go) / Math.max(0.001, end - go));
  const F = p < go ? -999 : lerp(num(d.from, 0), num(d.to, LENGTH), k);
  const S = num(d.s, 1);
  const band = d.band ?? "all";
  const t = age / 1000;
  const figures: Figure[] = [];
  for (let i = 0; i < 6; i++) {
    const a = ctx.actor(`targets-${i}`);
    if (a) figures.push(a);
  }
  const feet = figures[0]?.y ?? FLOOR + 26;
  const sheets = svg.querySelectorAll(".dry-sheet");
  [1, 0.68, 0.4].forEach((s, i) => {
    let path = outline(F, s, S, t, band, figures, feet);
    if (band !== "front" && path) path += " " + spray(F, [1, 0.62, 0.3][i], S, figures);
    setPath(sheets[i], path);
  });
  setPath(svg.querySelector(".dry-sheet-core"), band === "front" || F < 0 ? "" : streaks(F, S, t));
  for (const puff of svg.querySelectorAll<SVGGElement>(".dry-rise")) {
    const a = F - num(puff.dataset.d, 0) - 90;
    if (a < 0) {
      fade(puff, 0);
      continue;
    }
    const rise = a * 0.55;
    const s = (0.35 + Math.min(1.1, a / 300)) * S;
    place(puff, `translate(${(num(puff.dataset.x, 0) + rise * 0.3).toFixed(1)} ${(num(puff.dataset.y, 0) - rise).toFixed(1)}) scale(${s.toFixed(3)})`);
    fade(puff, clamp(a / 60) * (1 - clamp((a - 260) / 260)) * 0.85);
  }
};

/* ── Smoke ────────────────────────────────────────────────────────────── */

const Smoke = ({ cue }: VfxProps): ReactNode => {
  const rand = seeded(cue.seed ?? 3);
  const at = String(cue.params?.at ?? "800,700");
  const points = at.split(";").map((xy) => xy.split(",").map(Number));
  return (
    <svg className="dry-world" viewBox="0 0 1600 900">
      {points.map(([x, y], i) => (
        <g key={i} className="dry-smoke-puff" data-x={x} data-y={y} data-drift={((rand() - 0.3) * 60).toFixed(0)} data-delay={(i * 0.08 + rand() * 0.05).toFixed(3)} opacity="0">
          <Puff />
        </g>
      ))}
    </svg>
  );
};

const smoke: Frame = (el, p) => {
  const s = num(el.style.getPropertyValue("--s"), 1);
  for (const puff of el.querySelectorAll<SVGGElement>(".dry-smoke-puff")) {
    const k = clamp((p - num(puff.dataset.delay, 0)) / 0.9);
    const y = num(puff.dataset.y, 0) - k * 260 * s;
    const x = num(puff.dataset.x, 0) + k * num(puff.dataset.drift, 0);
    place(puff, `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${((0.8 + k * 0.6) * s).toFixed(3)} ${((0.6 + k * 1.1) * s).toFixed(3)})`);
    fade(puff, clamp(k / 0.15) * (1 - clamp((k - 0.55) / 0.45)) * 0.7);
  }
};

/* ── Smoke across the lens ────────────────────────────────────────────── */

const Wipe = ({ cue }: VfxProps): ReactNode => {
  const rand = seeded(41);
  return (
    <div className="dry-wipe" data-half={String(cue.params?.half ?? "out")}>
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
        <rect x="150" y="-40" width="400" height="280" fill={FIRE.smoke} />
        {Array.from({ length: 16 }, (_, i) => {
          const y = -30 + (i / 15) * 260;
          const x = 150 - 20 - rand() * 60;
          const r = 34 + rand() * 30;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill={FIRE.smoke} />
              <path d={`M${x - r * 0.8} ${y + r * 0.5} A${r} ${r} 0 0 0 ${x + r * 0.6} ${y + r * 0.8}`} fill="none" stroke={FIRE.orange} strokeOpacity="0.35" strokeWidth="4" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const wipe: Frame = (el, p) => {
  const node = el.querySelector<HTMLElement>(".dry-wipe");
  if (!node) return;
  // One roll across the lens split over the cut: out covers, in uncovers.
  const k = node.dataset.half === "in" ? 0.5 + p * 0.7 : p * 0.5;
  const value = `translate3d(${((k - 0.5) * 240).toFixed(2)}%, ${(Math.sin(k * Math.PI) * -4).toFixed(2)}%, 0)`;
  if (node.style.transform !== value) node.style.transform = value;
};

/* ── The quiet: the top step catching light, and the air drawn up ────── */

/**
 * The quiet, from the basin: the flood's front cresting the top step like a
 * wave about to come down. A wall of fire risen behind the top nose, its
 * crest ragged with licks, and its lip already rolling over the edge towards
 * the row, a dark underside with the first fingers of flame hanging off it.
 * It grows slowly and flickers slowly: the held breath before it falls.
 */
const Crest = ({ cue }: VfxProps): ReactNode => {
  const id = fid(useId());
  const top = RISES[RISES.length - 1];
  const left = edgeX(-1, top);
  const right = edgeX(1, top);
  return (
    <svg className="dry-world dry-fire-svg" viewBox="0 0 1600 900" data-seed={String(cue.seed ?? 29)}>
      <radialGradient id={`${id}-crest`} cx="0.5" cy="1" r="0.75">
        <stop offset="0" stopColor={FIRE.gold} stopOpacity="0.45" />
        <stop offset="0.45" stopColor={FIRE.orange} stopOpacity="0.25" />
        <stop offset="1" stopColor={FIRE.deep} stopOpacity="0" />
      </radialGradient>
      <ellipse className="dry-crest-glow" cx={VP.x} cy={top - 60} rx={(right - left) * 1.1} ry="360" fill={`url(#${id}-crest)`} />
      <path className="dry-wave dry-wave-0" fill={FIRE.deep} />
      <path className="dry-wave dry-wave-1" fill={FIRE.orange} />
      <path className="dry-wave-under" fill="#7c2213" />
      <path className="dry-wave dry-wave-2" fill={FIRE.gold} />
      <path className="dry-wave-spill" fill={FIRE.orange} />
      {RISES.slice(-4).map((y, i) => (
        <path key={y} className="dry-crest-nose" data-i={3 - i} d={`M${edgeX(-1, y) + 6} ${y} L${edgeX(1, y) - 6} ${y}`} stroke={FIRE.gold} strokeWidth={4 + i * 1.5} strokeLinecap="round" opacity="0" />
      ))}
    </svg>
  );
};

const crest: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-fire-svg");
  if (!svg) return;
  // Slow time: the fire is held, not still.
  const t = age / 1000 / 3;
  const top = RISES[RISES.length - 1];
  const next = RISES[RISES.length - 2];
  const left = edgeX(-1, top) + 4;
  const right = edgeX(1, top) - 4;
  const up = ease("in", p);
  const H = lerp(145, 186, up);
  const lean = lerp(22, 44, up);
  fade(svg.querySelector(".dry-crest-glow"), 0.5 + up * 0.5);
  // A wall of fire risen behind the top nose, highest in the middle, its crest torn.
  const crestY = (x: number) => {
    const u = clamp((x - left) / (right - left));
    // A mound, not a wall: it runs down to almost nothing at the step's ends.
    const dome = 0.04 + 0.96 * Math.sin(Math.PI * u) ** 1.15;
    const swell = 0.09 * Math.sin(u * 7.3 + 1.1 + t * 0.7) + 0.06 * Math.sin(u * 13.7 + 2.3) + 0.04 * Math.sin(u * 23.1 + t);
    return top - H * (dome + swell);
  };
  const xs: number[] = [];
  for (let x = left; x <= right; x += 5) xs.push(x);
  // The face, hottest at the foot; its layers' tops torn by licks leaning towards the row.
  const waves = svg.querySelectorAll(".dry-wave");
  [1, 0.7, 0.3].forEach((s, i) => {
    const pts = [...xs].reverse().map((x) => {
      const lk = lick(x * 1.7 + i * 40, t) * (i === 0 ? 1.3 : 0.7);
      return `${f1(x)} ${f1(top - (top - crestY(x)) * s - lk)}`;
    });
    setPath(waves[i], `M${f1(left)} ${top + 3} L${f1(right)} ${top + 3} L${pts.join(" L")} Z`);
  });
  // The crest rolling over towards the row: a shadowed band under the top, the curl's underside.
  const under = xs.map((x) => `${f1(x)} ${f1(crestY(x) + H * 0.1)}`);
  const underLow = [...xs].reverse().map((x) => {
    const u = clamp((x - left) / (right - left));
    return `${f1(x)} ${f1(crestY(x) + H * 0.1 + lean * Math.sin(Math.PI * u) ** 0.7 * (0.7 + 0.3 * Math.sin(x * 0.04 + 0.9)))}`;
  });
  setPath(svg.querySelector(".dry-wave-under"), `M${under.join(" L")} L${underLow.join(" L")} Z`);
  // And over the nose, a sheet of it already coming down the top riser,
  // deepest where the mound is highest, its leading edge uneven.
  const spillEdge = [...xs].reverse().map((x) => {
    const u = clamp((x - left) / (right - left));
    const reach = (next - top) * lerp(0.35, 1.5, up) * Math.sin(Math.PI * u) ** 1.4 * (0.7 + 0.2 * Math.sin(x * 0.06 + 2) + 0.1 * Math.sin(x * 0.17 + t * 4));
    return `${f1(x)} ${f1(top + reach)}`;
  });
  setPath(svg.querySelector(".dry-wave-spill"), `M${f1(left)} ${top - 2} L${f1(right)} ${top - 2} L${spillEdge.join(" L")} Z`);
  // The top nose is lit from the start; the ones below catch the light in turn.
  for (const nose of svg.querySelectorAll<SVGPathElement>(".dry-crest-nose")) {
    const i = num(nose.dataset.i, 0);
    fade(nose, i === 0 ? 0 : clamp((0.25 + p * 0.9 - i * 0.28) * 1.6) * (0.6 - i * 0.12));
  }
};

const Draft = ({ cue }: VfxProps): ReactNode => {
  const rand = seeded(cue.seed ?? 9);
  return (
    <svg className="dry-world" viewBox="0 0 1600 900">
      <g stroke="#cdbf9f" strokeLinecap="round">
        {Array.from({ length: 18 }, (_, i) => (
          <path
            key={i}
            className="dry-draft-line"
            data-side={(rand() - 0.5).toFixed(3)}
            data-off={rand().toFixed(3)}
            data-speed={(0.5 + rand() * 0.5).toFixed(2)}
            strokeWidth={(2 + rand() * 3).toFixed(1)}
            opacity="0"
          />
        ))}
      </g>
      <path className="dry-leaf" d="M-14 0 C-8 -9 8 -9 14 0 C8 6 -8 6 -14 0 Z M-14 0 L-20 3" fill="#2b1f15" stroke="#6b5640" strokeWidth="2" />
    </svg>
  );
};

const draft: Frame = (el, p, age) => {
  const vp = VP;
  for (const line of el.querySelectorAll<SVGPathElement>(".dry-draft-line")) {
    // Each streak runs from the basin up the steps towards the lip, shrinking
    // into the distance, and comes round again.
    const k = (num(line.dataset.off, 0) + (age / 1000) * num(line.dataset.speed, 0.6) * 0.55) % 1;
    const y0 = lerp(980, 380, k);
    const depth = (y0 - vp.y) / (900 - vp.y);
    const x0 = vp.x + num(line.dataset.side, 0) * 1300 * depth;
    const len = 60 * depth;
    const x1 = vp.x + (x0 - vp.x) * ((y0 - len - vp.y) / (y0 - vp.y));
    const d = `M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${(y0 - len).toFixed(1)}`;
    if (line.getAttribute("d") !== d) line.setAttribute("d", d);
    fade(line, Math.sin(k * Math.PI) * 0.22);
  }
  // One dry leaf lifts off a step and is drawn up after them.
  const leaf = el.querySelector(".dry-leaf");
  const k = ease("in", clamp((p - 0.15) / 0.85));
  place(leaf, `translate(${lerp(980, 900, k).toFixed(1)} ${lerp(700, 470, k).toFixed(1)}) rotate(${(k * 200 - 20).toFixed(1)}) scale(${lerp(1.6, 0.9, k).toFixed(3)})`);
};

/* ── On the board ─────────────────────────────────────────────────────── */

/** The flame catching in the real Arcanist's glove. */
const Kindle = (): ReactNode => {
  const id = fid(useId());
  return (
    <div className="dry-kindle">
      <svg viewBox="-60 -120 120 130" data-k="0">
        <FireDefs id={id} />
        <g className="dry-kindle-g">
          <g transform="rotate(-6)">
            <Tongue id={id} ph={0} />
          </g>
          <g transform="translate(-16 4) rotate(-24) scale(0.55)">
            <Tongue id={id} ph={1} />
          </g>
          <g transform="translate(16 4) rotate(20) scale(0.6)">
            <Tongue id={id} ph={2} />
          </g>
        </g>
      </svg>
    </div>
  );
};

const kindle: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-kindle svg");
  if (!svg) return;
  boil(svg, age, 60);
  // It catches at the clip's catch: small, then all at once.
  const k = age < 220 ? 0.25 : Math.min(1, 0.25 + ((age - 220) / 70) * 0.75);
  place(svg.querySelector(".dry-kindle-g"), `scale(${(k * (1 + 0.06 * Math.sin(age / 50))).toFixed(3)})`);
  svg.style.opacity = String(p > 0.98 ? 0 : 1);
  followBoardPart(el, svg.parentElement!, '[data-part="spark"] circle', 0.5, 0.75);
};

/**
 * Put `node` on a part of this effect's real unit on the board: a point of
 * the part's box (fractions across and down). Anchored effects sit at the
 * unit's feet; this moves the drawing onto the part wherever the clip has it.
 */
function followBoardPart(el: HTMLElement, node: HTMLElement, selector: string, fx: number, fy: number) {
  const unit = el.dataset.anchor;
  if (!unit) return;
  const part = document.querySelector<SVGGraphicsElement>(`.stage [data-unit="${CSS.escape(unit)}"] .combatant-rig ${selector}`);
  const r = part?.getBoundingClientRect();
  const home = el.getBoundingClientRect();
  if (!r || (!r.width && !r.height)) return;
  const x = r.left + r.width * fx - home.left;
  const y = r.top + r.height * fy - home.top;
  const value = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  if (node.style.transform !== value) node.style.transform = value;
}

/** A real enemy of the row, still burning: flames at its feet and up it, smoke over it. */
const Burning = ({ cue }: VfxProps): ReactNode => {
  const id = fid(useId());
  const rand = seeded(cue.seed ?? 13);
  return (
    <div className="dry-burning">
      <svg viewBox="-100 -200 200 220" data-k="0" preserveAspectRatio="xMidYMax meet">
        <FireDefs id={id} />
        <ellipse className="dry-scorch" cx="0" cy="2" rx="86" ry="15" fill="#120a06" />
        <path
          className="dry-scorch-edge"
          d={Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const r = 86 + rand() * 18;
            return `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(1)} ${(2 + Math.sin(a) * r * 0.18).toFixed(1)}`;
          }).join(" ") + "Z"}
          fill="#1d110a"
          opacity="0.6"
        />
        {Array.from({ length: 7 }, (_, i) => {
          const x = -66 + i * 22 + (rand() - 0.5) * 8;
          const s = 0.34 + (1 - Math.abs(i - 3) / 3) * 0.3 + rand() * 0.08;
          return (
            <g key={i} className="dry-burn-t" data-x={x.toFixed(1)} data-y="4" data-s={s.toFixed(2)} data-delay={(rand() * 0.2).toFixed(3)} opacity="0">
              <Tongue id={id} ph={i} />
            </g>
          );
        })}
        {[
          [-20, -62, 0.24],
          [24, -40, 0.2],
          [4, -96, 0.18],
        ].map(([x, y, s], i) => (
          <g key={`up-${i}`} className="dry-burn-t" data-x={x} data-y={y} data-s={s} data-delay={(0.12 + i * 0.08).toFixed(2)} opacity="0">
            <Tongue id={id} ph={i + 1} />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <g key={`smoke-${i}`} className="dry-burn-puff" data-i={i} opacity="0">
            <Puff />
          </g>
        ))}
      </svg>
    </div>
  );
};

const burning: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-burning svg");
  if (!svg) return;
  boil(svg, age, 60);
  const t = age / 1000;
  fade(svg.querySelector(".dry-scorch"), clamp(p / 0.2) * 0.7);
  for (const tongue of svg.querySelectorAll<SVGGElement>(".dry-burn-t")) {
    const k = clamp((p - num(tongue.dataset.delay, 0)) / 0.2);
    const s = num(tongue.dataset.s, 0.4) * ease("out", k) * (1 + 0.1 * Math.sin(t * 8 + num(tongue.dataset.x, 0)));
    place(tongue, `translate(${tongue.dataset.x} ${tongue.dataset.y}) scale(${s.toFixed(3)})`);
    fade(tongue, k > 0 ? 1 : 0);
  }
  for (const puff of svg.querySelectorAll<SVGGElement>(".dry-burn-puff")) {
    const i = num(puff.dataset.i, 0);
    const k = ((t * 0.9 + i / 3) % 1) * clamp(p / 0.15);
    place(puff, `translate(${(Math.sin(i * 2 + t) * 14).toFixed(1)} ${(-110 - k * 120).toFixed(1)}) scale(${(0.22 + k * 0.3).toFixed(3)})`);
    fade(puff, Math.sin(k * Math.PI) * 0.7);
  }
};

/** The Pyromancer's own sleeve alight, beaten out, and the wisp left. */
const Singe = (): ReactNode => {
  const id = fid(useId());
  return (
    <div className="dry-singe">
      <svg viewBox="-60 -140 120 150" data-k="0">
        <FireDefs id={id} />
        <g className="dry-singe-g">
          <g transform="rotate(-10) scale(0.8)">
            <Tongue id={id} ph={2} />
          </g>
          <g transform="translate(14 2) rotate(16) scale(0.5)">
            <Tongue id={id} ph={0} />
          </g>
        </g>
        <path className="dry-wisp" d="M0 0 C-10 -24 12 -40 -2 -66 C-12 -84 6 -100 -4 -120" fill="none" stroke="#5a4a44" strokeWidth="5" strokeLinecap="round" opacity="0" />
      </svg>
    </div>
  );
};

const singe: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-singe svg");
  if (!svg) return;
  boil(svg, age, 50);
  // Alight until the flapping beats it out, halfway through the swat.
  const out = clamp((age - 180) / 260);
  place(svg.querySelector(".dry-singe-g"), `scale(${(1 - out).toFixed(3)})`);
  const wisp = svg.querySelector(".dry-wisp");
  const w = clamp((age - 400) / 400);
  fade(wisp, Math.sin(w * Math.PI) * 0.8);
  place(wisp, `translate(0 ${(-w * 30).toFixed(1)}) scale(${(0.5 + w * 0.6).toFixed(3)})`);
  followBoardPart(el, svg.parentElement!, '[data-part="hand"] path[fill="#d8c8ae"]', 0.2, 0.7);
  svg.style.opacity = p > 0.98 ? "0" : "1";
};

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "dry-flame": Flame,
  "dry-pour": Pour,
  "dry-fire": Fire,
  "dry-smoke": Smoke,
  "dry-smoke-wipe": Wipe,
  "dry-crest": Crest,
  "dry-draft": Draft,
  "dry-kindle": Kindle,
  "dry-burning": Burning,
  "dry-singe": Singe,
};

export const frames: Record<string, Frame> = {
  "dry-flame": flame,
  "dry-pour": pour,
  "dry-fire": fire,
  "dry-smoke": smoke,
  "dry-smoke-wipe": wipe,
  "dry-crest": crest,
  "dry-draft": draft,
  "dry-kindle": kindle,
  "dry-burning": burning,
  "dry-singe": singe,
};
