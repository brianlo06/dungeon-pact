import type { ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import "./style.css";

/**
 * Compound Interest's effects.
 *
 * The idea they serve: a coin the Usurer has bitten is pressed into a wound,
 * and it breeds — it splits, and its children split, so the debt doubles where
 * it sits until it has covered whatever it was lent to.
 *
 * Everything in the film is the same drawing at different sizes: a copper
 * ellipse with an ink edge, a lit crescent up its left side and a crescent
 * notch bitten out of its rim. One coin at the size of a boulder is the quiet;
 * five hundred of them is the impact; the walls of the sink are what they look
 * like after years. Coins are drawn in bulk as sub-paths of one path each —
 * bodies, lights, notches, shadows — so five hundred of them are four DOM
 * nodes and no filters.
 *
 *   usury-coin      the single bitten copper: out of the pouch, standing on
 *                   the target, held in the hand, pressed home
 *   usury-brood     the budding: one coin becoming two (the quiet), the
 *                   runaway over the target (the impact), and the crust left
 *                   on the real board
 *   usury-stir      the walls of the sink turning to look at a new coin
 *   usury-creep     the crust growing over the lens: the film's own occlusion
 *   usury-rush      a wave of coin shingle from the closing fist to the target
 *   usury-spill     coins thrown off the impact
 *   usury-drip      on the board: coins dripping off the crust
 *   usury-dividend  on the board: the pact's cut, a ring for each round of it
 *   usury-glow      a pool of copper light behind the target on the impact
 *
 * No filters, no blur, no CSS keyframes: everything runs on `--p` or on a
 * frame function writing paths on the combat clock.
 */

export const COPPER = "#e08a3c";
export const HOT = "#ffd9a0";
export const CRUST = "#7a4a2c";
export const TARNISH = "#5a3524";
export const SOOT = "#0e0a08";
export const VERD = "#3f6b5e";

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const f1 = (x: number) => x.toFixed(1);

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

const setD = (el: Element | null | undefined, d: string) => {
  if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
};
const setStyle = (el: HTMLElement | SVGElement | null | undefined, name: string, value: string) => {
  if (el && el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
};

/* ── The coin ──────────────────────────────────────────────────────────── */

export interface Coin {
  x: number;
  y: number;
  r: number;
  /** Where the bite was taken out of the rim, radians. */
  bite: number;
  /** How much of the face is turned away: 1 face on, 0 edge on. */
  turn?: number;
}

/** One ellipse, as a sub-path. */
const ell = (x: number, y: number, rx: number, ry: number) =>
  `M${f1(x - rx)} ${f1(y)} a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(rx * 2)} 0 a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-rx * 2)} 0 Z`;

/**
 * The paths that draw a handful of coins: the shadow under them, the copper
 * body, the light up the left of each, and the bite out of the rim — which is
 * only drawn once a coin is big enough on screen to show it.
 */
export function coinPaths(coins: Coin[], notchFrom = 7) {
  let shadow = "";
  let body = "";
  let lit = "";
  let notch = "";
  for (const c of coins) {
    if (c.r <= 0.15) continue;
    const rx = c.r * (c.turn ?? 1);
    const ry = c.r * 0.84;
    if (rx < 0.15) continue;
    shadow += ell(c.x + c.r * 0.16, c.y + c.r * 0.3, rx, ry);
    body += ell(c.x, c.y, rx, ry);
    lit += ell(c.x - rx * 0.2, c.y - ry * 0.22, rx * 0.62, ry * 0.6);
    if (c.r >= notchFrom)
      notch += ell(c.x + Math.cos(c.bite) * rx, c.y + Math.sin(c.bite) * ry, c.r * 0.34 * (c.turn ?? 1), c.r * 0.34);
  }
  return { shadow, body, lit, notch };
}

export function writeCoins(svg: Element, coins: Coin[], notchFrom = 7) {
  const d = coinPaths(coins, notchFrom);
  setD(svg.querySelector(".usury-coin-shadow"), d.shadow);
  setD(svg.querySelector(".usury-coin-edge"), d.body);
  setD(svg.querySelector(".usury-coin-body"), d.body);
  setD(svg.querySelector(".usury-coin-lit"), d.lit);
  setD(svg.querySelector(".usury-coin-notch"), d.notch);
}

function CoinPaths({ extra }: { extra?: ReactNode }) {
  return (
    <>
      <path className="usury-coin-shadow" />
      <path className="usury-coin-edge" />
      <path className="usury-coin-body" />
      <path className="usury-coin-lit" />
      <path className="usury-coin-notch" />
      {extra}
    </>
  );
}

/** A box drawn in its own pixels, hung on the point the stage placed it at. */
const Box = ({ cue, className, children }: { cue: VfxProps["cue"]; className: string; children?: ReactNode }) => (
  <svg
    className={`usury-box ${className}`}
    viewBox="-500 -500 1000 1000"
    data-usury=""
    data-params={JSON.stringify(cue.params ?? {})}
    aria-hidden="true"
  >
    {children}
  </svg>
);

/** World-sized: an SVG over the whole stage, drawn in world units. */
const World = ({ cue, className, children }: { cue: VfxProps["cue"]; className: string; children?: ReactNode }) => (
  <svg
    className={`usury-world ${className}`}
    viewBox="0 0 1600 900"
    data-usury=""
    data-params={JSON.stringify(cue.params ?? {})}
    aria-hidden="true"
  >
    {children}
  </svg>
);

/* ── Renderers ─────────────────────────────────────────────────────────── */

const SingleCoin = ({ cue }: VfxProps) => (
  <Box cue={cue} className="usury-coin">
    <path className="usury-coin-ring" />
    <CoinPaths extra={<path className="usury-coin-spark" />} />
  </Box>
);

const Brood = ({ cue }: VfxProps) => (
  <Box cue={cue} className="usury-brood">
    <CoinPaths />
  </Box>
);

const Stir = ({ cue }: VfxProps) => (
  <World cue={cue} className="usury-stir">
    {Array.from({ length: 12 }, (_, i) => (
      <path key={i} className="usury-stir-band" data-band={i} />
    ))}
  </World>
);

const Creep = ({ cue }: VfxProps) => (
  <svg
    className="usury-creep"
    viewBox="0 0 1000 1000"
    preserveAspectRatio="none"
    data-usury=""
    data-params={JSON.stringify(cue.params ?? {})}
    aria-hidden="true"
  >
    <path className="usury-creep-mass" />
    <path className="usury-coin-shadow" />
    <path className="usury-coin-edge" />
    <path className="usury-coin-body" />
    <path className="usury-coin-lit" />
    <path className="usury-coin-notch" />
  </svg>
);

const Rush = ({ cue }: VfxProps) => (
  <World cue={cue} className="usury-rush">
    <path className="usury-rush-wave" />
    <CoinPaths />
  </World>
);

const Spill = ({ cue }: VfxProps) => (
  <Box cue={cue} className="usury-spill">
    <CoinPaths />
  </Box>
);

const Drip = ({ cue }: VfxProps) => (
  <Box cue={cue} className="usury-drip">
    <CoinPaths />
  </Box>
);

/** A pool of copper light behind the target, so the drawn frame cuts it out. */
const Glow = () => <div className="usury-glow" />;

const Dividend = ({ cue }: VfxProps) => (
  <Box cue={cue} className="usury-dividend">
    <ellipse className="usury-ring a" rx="100" ry="34" />
    <ellipse className="usury-ring b" rx="100" ry="34" />
    <CoinPaths />
  </Box>
);

/* ── Frames ────────────────────────────────────────────────────────────── */

type Params = Record<string, number | string | boolean>;
const params = (el: HTMLElement): Params => {
  const cached = (el as HTMLElement & { _usury?: Params })._usury;
  if (cached) return cached;
  const src = el.querySelector<SVGElement | HTMLElement>("[data-params]");
  const out: Params = src ? JSON.parse(src.dataset.params ?? "{}") : {};
  (el as HTMLElement & { _usury?: Params })._usury = out;
  return out;
};
const pn = (o: Params, k: string, d: number) => {
  const x = Number(o[k]);
  return Number.isFinite(x) ? x : d;
};
/** The drawn height of whatever this effect is hung on, in screen pixels. */
const height = (el: HTMLElement, fallback = 160) =>
  parseFloat(el.style.getPropertyValue("--ah")) || fallback;

/**
 * The single coin.
 *
 *  purse   on the board: it comes up out of the belt pouch and hangs there
 *  served  on the board: it stands over the target, sinking onto it
 *  hold    in the hand, turning slowly; the bite appears at `bite`
 *  press   driven into the target and seated, with a bead of light
 */
const coin: Frame = (el, p) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const o = params(el);
  const mode = String(o.mode ?? "hold");
  const h = height(el);
  const size = pn(o, "size", 0.16) * h;
  let x = pn(o, "ox", 0) * h;
  let y = pn(o, "oy", -0.5) * h;
  let r = size;
  let turn = 1;
  let ring = "";
  let spark = "";
  let bitten = p >= pn(o, "bite", -1);
  if (mode === "purse") {
    const k = ease("out", clamp((p - 0.2) / 0.55));
    y = -h * (0.36 + 0.24 * k);
    x = h * (0.06 + 0.03 * k);
    r = size * (0.4 + 0.6 * k);
    turn = 0.5 + 0.5 * Math.abs(Math.cos(p * 7));
    bitten = false;
  } else if (mode === "served") {
    const k = ease("out", clamp((p - 0.1) / 0.6));
    y = -h * (1.12 - 0.28 * k);
    r = size * (0.6 + 0.4 * k);
    const rr = size * (3.4 - 2.2 * k);
    ring = ell(x, y, rr, rr * 0.86);
  } else if (mode === "hold") {
    // Turned over between two fingers: the face swings away and back.
    turn = 0.55 + 0.45 * Math.abs(Math.cos(p * Math.PI * pn(o, "spin", 1.1)));
    y += Math.sin(p * Math.PI * 2) * size * 0.06;
    // At the bite it goes up between the lips, edge first, and comes away.
    const at = pn(o, "bite", -1);
    if (at >= 0) {
      const k = clamp(1 - Math.abs(p - at) / pn(o, "biteFor", 0.14));
      const e = ease("inOut", k);
      x = lerp(x, pn(o, "lipX", pn(o, "ox", 0)) * h, e);
      y = lerp(y, pn(o, "lipY", pn(o, "oy", -0.5)) * h, e);
      turn = lerp(turn, 0.42, e);
    }
  } else if (mode === "press") {
    // Carried in on the hand, then seated: it stops dead and flares once.
    const k = ease("in", clamp(p / Math.max(0.01, pn(o, "hit", 0.4))));
    x = lerp(pn(o, "ox", 0), pn(o, "tx", 0), k) * h;
    y = lerp(pn(o, "oy", -0.5), pn(o, "ty", -0.5), k) * h;
    r = size * (1 - 0.22 * k);
    turn = 1 - 0.25 * k;
    const since = p - pn(o, "hit", 0.4);
    if (since >= 0) {
      const s = clamp(since / 0.24);
      const rr = size * (0.6 + 2.4 * ease("out", s));
      ring = ell(x, y, rr, rr * 0.5);
      setStyle(svg, "--seat", (1 - s).toFixed(3));
      spark = ell(x, y, size * 0.3 * (1 - s), size * 0.3 * (1 - s));
    } else setStyle(svg, "--seat", "0");
  }
  writeCoins(svg, [{ x, y, r, bite: pn(o, "angle", -0.9), turn }], bitten ? 3 : 1e9);
  setD(svg.querySelector(".usury-coin-ring"), ring);
  setD(svg.querySelector(".usury-coin-spark"), spark);
};

/* ── The budding ───────────────────────────────────────────────────────── */

interface Bud extends Coin {
  gen: number;
  born: number;
}

/**
 * The tree. One coin, and every coin splits: each generation is twice the one
 * before it, each child shouldered off its parent by a little less than the
 * one before, and all of them kept inside the body they are breeding on.
 */
function grow(
  seed: number,
  gens: number,
  step: number,
  r0: number,
  bounds: { cx: number; cy: number; rx: number; ry: number },
  spread: number,
  floor: number,
): Bud[] {
  const rand = seeded(seed);
  const out: Bud[] = [{ x: 0, y: 0, r: r0, bite: -0.9 + rand() * 0.6, gen: 0, born: 0 }];
  for (let g = 1; g <= gens; g++) {
    // Every coin there is splits: the generation is as big as everything before it.
    const next: Bud[] = [];
    for (const parent of out.slice()) {
      const a = rand() * Math.PI * 2;
      const d = spread * (0.55 + rand() * 0.9) * (1 + g * 0.16);
      let x = parent.x + Math.cos(a) * d;
      let y = parent.y + Math.sin(a) * d * 0.8;
      // Kept on the body: a child that would fall off it is folded back in.
      const u = (x - bounds.cx) / bounds.rx;
      const v = (y - bounds.cy) / bounds.ry;
      const m = Math.hypot(u, v);
      if (m > 1) {
        const k = (2 - Math.min(1.9, m)) / Math.max(0.001, m);
        x = bounds.cx + (x - bounds.cx) * k;
        y = bounds.cy + (y - bounds.cy) * k;
      }
      next.push({
        x,
        y,
        r: Math.max(r0 * floor, parent.r * (0.9 + rand() * 0.08)),
        bite: rand() * Math.PI * 2,
        gen: g,
        born: g * step + rand() * step * 0.45,
      });
    }
    out.push(...next);
  }
  return out;
}

const trees = new WeakMap<HTMLElement, { buds: Bud[]; h: number }>();

/**
 * The budding, at three sizes.
 *
 *  quiet  two generations, slowly, on a coin the size of a boulder
 *  run    the runaway: nine generations in a quarter of a second, and the
 *         crust standing full on the frame the hit-stop holds
 *  board  the crust left on the real target, still going, very slowly
 */
const brood: Frame = (el, p, age) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const o = params(el);
  const h = height(el);
  const mode = String(o.mode ?? "run");
  let cached = trees.get(el);
  if (!cached || Math.abs(cached.h - h) > 1) {
    const gens = pn(o, "gens", mode === "quiet" ? 2 : mode === "board" ? 4 : 8);
    const step = pn(o, "step", mode === "quiet" ? 0.3 : 0.055);
    const seedR = pn(o, "size", mode === "quiet" ? 0.16 : 0.075) * h;
    const bounds = {
      cx: pn(o, "bx", 0) * h,
      cy: pn(o, "by", -0.18) * h,
      rx: pn(o, "brx", 0.34) * h,
      ry: pn(o, "bry", 0.36) * h,
    };
    cached = {
      h,
      buds: grow(pn(o, "seed", 31), gens, step, seedR, bounds, pn(o, "spread", 0.1) * h, pn(o, "floor", 0.5)),
    };
    trees.set(el, cached);
  }
  const hit = pn(o, "hit", 0);
  const pop = pn(o, "pop", mode === "quiet" ? 0.1 : 0.05);
  const coins: Coin[] = [];
  for (const bud of cached.buds) {
    const since = p - hit - bud.born;
    if (since < 0) continue;
    const k = clamp(since / pop);
    // A new coin comes in past its size and settles: money arriving.
    const s = k < 1 ? ease("out", k) * (1 + (1 - k) * 0.5) : 1;
    const shiver = mode === "board" ? 1 + Math.sin(age / 420 + bud.gen) * 0.03 : 1;
    coins.push({ x: bud.x, y: bud.y, r: bud.r * s * shiver, bite: bud.bite });
  }
  writeCoins(svg, coins, pn(o, "notch", 7));
};

/* ── The sink answering, and the ways in and out ───────────────────────── */

/** Where the crust hangs on the walls: bands from the middle outwards. */
const STIR_BANDS = (() => {
  const rand = seeded(808);
  const bands: string[] = [];
  for (let b = 0; b < 12; b++) {
    let d = "";
    for (let i = 0; i < 26; i++) {
      // Left wall and right wall, mirrored, thickening towards the floor.
      const side = i % 2 ? 1 : -1;
      const t = rand();
      const x = 800 + side * (250 + b * 62 + rand() * 40);
      const y = 90 + t * 720 + Math.abs(x - 800) * 0.12;
      const r = 5 + rand() * 9;
      d += ell(x, y, r, r * 0.84);
    }
    bands.push(d);
  }
  return bands;
})();

/** The crust turning edge-on to a new coin: a ripple running out from it. */
const stir: Frame = (el, p) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const front = p * 1.35 - 0.15;
  for (const band of svg.querySelectorAll<SVGPathElement>(".usury-stir-band")) {
    const i = Number(band.dataset.band);
    if (!band.getAttribute("d")) setD(band, STIR_BANDS[i]);
    const k = Math.max(0, 1 - Math.abs(front - i / 12) * 7);
    setStyle(band, "opacity", (k * 0.85).toFixed(3));
  }
};

/** The film's own occlusion: crust growing across the lens, and off it again. */
const creep: Frame = (el, p) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const o = params(el);
  const out = o.mode === "out";
  const k = out ? ease("in", p) : 1 - ease("out", p);
  const edge = lerp(-160, 1160, k);
  const rand = seeded(pn(o, "seed", 4) + 1);
  // The mass behind the edge, with a ragged crust front.
  let mass = `M-40 -40 L${f1(edge)} -40 `;
  const coins: Coin[] = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const y = (i / steps) * 1080 - 40;
    const wob = Math.sin(i * 1.7 + 0.6) * 46 + (rand() - 0.5) * 26;
    mass += `L${f1(edge + wob)} ${f1(y)} `;
    for (let j = 0; j < 3; j++) {
      const r = 14 + rand() * 26;
      coins.push({ x: edge + wob - rand() * 90, y: y + (rand() - 0.5) * 60, r, bite: rand() * 6.28 });
    }
  }
  mass += "L-40 1040 Z";
  setD(svg.querySelector(".usury-creep-mass"), mass);
  writeCoins(svg, coins, 12);
};

/** A wave of shingle, thrown from the closing fist along the floor. */
const rush: Frame = (el, p, _age, ctx) => {
  const svg = el.querySelector("svg");
  const caster = ctx.actor("caster");
  const target = ctx.actor("targets-0");
  if (!svg || !caster || !target) return;
  const o = params(el);
  const k = ease("out", clamp(p / Math.max(0.01, pn(o, "over", 0.3))));
  const from = [caster.x + caster.h * pn(o, "hx", 0.18), caster.y - caster.h * pn(o, "hy", 0.05)];
  const to = [target.x, target.y];
  const front = lerp(from[0], to[0], k);
  const rand = seeded(pn(o, "seed", 12));
  const coins: Coin[] = [];
  let wave = `M${f1(from[0])} ${f1(from[1])} `;
  const steps = 26;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = lerp(from[0], front, t);
    const lift = Math.sin(t * Math.PI) * caster.h * 0.1 * (1 - k * 0.4);
    const y = lerp(from[1], to[1], t) - lift;
    wave += `L${f1(x)} ${f1(y)} `;
    if (i % 2 === 0)
      coins.push({ x: x + (rand() - 0.5) * 30, y: y - rand() * lift, r: caster.h * (0.012 + rand() * 0.02), bite: rand() * 6.28 });
  }
  setD(svg.querySelector(".usury-rush-wave"), wave);
  writeCoins(svg, coins, 1e9);
  setStyle(svg, "opacity", clamp(1.3 - p * 1.6).toFixed(2));
};

/** Coins thrown off the impact, turning as they fly. */
const spill: Frame = (el, p) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const o = params(el);
  const h = height(el);
  const rand = seeded(pn(o, "seed", 5));
  const coins: Coin[] = [];
  const n = pn(o, "count", 22);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.1 + rand() * 0.8);
    const speed = h * (0.7 + rand() * 1.5);
    const born = rand() * 0.12;
    const t = p - born;
    if (t < 0) continue;
    const x = Math.cos(a) * speed * t * (rand() * 0.4 + 0.8);
    const y = -h * 0.45 + Math.sin(a) * speed * t + h * 2.4 * t * t;
    coins.push({
      x,
      y,
      r: h * (0.022 + rand() * 0.03),
      bite: rand() * 6.28,
      turn: Math.abs(Math.cos(t * 14 + i)),
    });
  }
  writeCoins(svg, coins, 1e9);
  setStyle(svg, "opacity", clamp(1.4 - p * 1.4).toFixed(2));
};

/** On the board: the crust sheds a coin now and then, and it lands. */
const drip: Frame = (el, p) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const o = params(el);
  const h = height(el);
  const rand = seeded(pn(o, "seed", 17));
  const coins: Coin[] = [];
  for (let i = 0; i < 7; i++) {
    const born = rand() * 0.7;
    const from = [(rand() - 0.5) * h * 0.5, -h * (0.2 + rand() * 0.5)];
    const t = (p - born) / 0.3;
    if (t < 0 || t > 1.35) continue;
    const fall = Math.min(1, t) ** 2;
    coins.push({
      x: from[0] + (rand() - 0.5) * 6 * fall,
      y: from[1] + (-from[1]) * fall,
      r: h * 0.035 * (t > 1 ? Math.max(0, 1 - (t - 1) * 4) : 1),
      bite: rand() * 6.28,
      turn: t > 1 ? 1 : Math.abs(Math.cos(t * 9 + i)),
    });
  }
  writeCoins(svg, coins, 1e9);
};

/**
 * On the board: the pact's cut. A copper ring rises off each hero for every
 * round the Regeneration will pay, with one bitten coin turning over it.
 */
const dividend: Frame = (el, p, age) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const h = height(el);
  const ring = (node: Element | null, from: number) => {
    if (!node) return;
    const k = clamp((p - from) / 0.42);
    const el2 = node as SVGEllipseElement;
    if (k <= 0 || k >= 1) {
      setStyle(el2, "opacity", "0");
      return;
    }
    const e = ease("out", k);
    setStyle(el2, "opacity", (Math.sin(k * Math.PI) * 0.9).toFixed(2));
    el2.setAttribute("rx", f1(h * (0.16 + 0.24 * e)));
    el2.setAttribute("ry", f1(h * (0.055 + 0.08 * e)));
    el2.setAttribute("cy", f1(-h * (0.06 + 0.8 * e)));
  };
  ring(svg.querySelector(".usury-ring.a"), 0.05);
  ring(svg.querySelector(".usury-ring.b"), 0.34);
  const k = ease("out", clamp((p - 0.1) / 0.5));
  writeCoins(
    svg,
    [
      {
        x: 0,
        y: -h * (0.72 + 0.34 * k),
        r: h * 0.085 * Math.min(1, clamp(p / 0.12) * (p > 0.85 ? (1 - p) * 6.6 : 1)),
        bite: -0.9,
        turn: Math.abs(Math.cos(age / 260)),
      },
    ],
    3,
  );
};

/* ── Registered ────────────────────────────────────────────────────────── */

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "usury-coin": SingleCoin,
  "usury-brood": Brood,
  "usury-stir": Stir,
  "usury-creep": Creep,
  "usury-rush": Rush,
  "usury-spill": Spill,
  "usury-drip": Drip,
  "usury-dividend": Dividend,
  "usury-glow": Glow,
};

export const frames: Record<string, Frame> = {
  "usury-coin": coin,
  "usury-brood": brood,
  "usury-stir": stir,
  "usury-creep": creep,
  "usury-rush": rush,
  "usury-spill": spill,
  "usury-drip": drip,
  "usury-dividend": dividend,
};
