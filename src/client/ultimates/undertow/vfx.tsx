import type { ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import { HORIZON, NEAR, edgeX, seaPath } from "./flats";
import "./style.css";

/**
 * Undertow's effects.
 *
 * The idea they serve: the Tidecaller pulls the sea off the flats with one
 * open hand, holds it on the horizon while the enemy stands on the bare
 * seabed, and lets go. So the water here is drawn as a *level*: one dark
 * body whose near edge slides away across the sand and leaves it shining,
 * and which comes back through the whole frame from below, the picture
 * seen through it from then on. Never a wave, never a curl, never rain:
 * where it moves it is foam and bubbles (bodies of flat circles) and the
 * undertow (horizontal streaks, always seaward, to the right).
 *
 *   tide-edge-water  the sea's edge at a hand's scale, backing away from the
 *                    fingertips, leaving the sand shining and threads running out
 *   tide-sea         the sea on the flats going out (`flats.ts`), its foam
 *                    line, the shine it leaves, and the band it banks into on
 *                    the horizon
 *   tide-drag        the quiet: threads of water still draining seaward past
 *                    the row's feet
 *   tide-fish        the quiet: one fish left on the sand, flapping twice
 *   tide-foam-wipe   foam across the lens, for the cut into the impact
 *   tide-return      the impact: the sea back as a level through the whole
 *                    frame; `band: "back"` the body behind the figures to the
 *                    horizon, `band: "front"` the near surface over them, foam
 *                    riding it, the surface from below, bubbles, the drag
 *   tide-drain       on the board: a sheet of water sliding away from every
 *                    real enemy's feet
 *   tide-standing    on the board: every real enemy standing in water that
 *                    is still running out past it
 *
 * Everything moves from a frame function; no filters, no keyframes, a glow is
 * a small flat gradient. Clip timing is read in milliseconds (`age`) where a
 * pose sets it, and in shot fractions (`p`) where the cut does.
 */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

const INK = "#06101f";
const COBALT = "#4a7dff";
const FOAM = "#d6e6ff";
const SHINE = "#b8a882";

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const num = (value: unknown, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const f1 = (n: number) => n.toFixed(1);
const fid = (raw: string) => `tide${raw.replace(/[^a-zA-Z0-9]/g, "")}`;

/** A fixed random number for an integer and a channel. */
function hash(i: number, k: number) {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const setPath = (el: Element | null | undefined, d: string) => {
  if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
};
function place(el: Element | null | undefined, value: string) {
  if (el && el.getAttribute("transform") !== value) el.setAttribute("transform", value);
}
function fade(el: Element | null | undefined, value: number) {
  if (!el) return;
  const o = clamp(value).toFixed(3);
  if (el.getAttribute("opacity") !== o) el.setAttribute("opacity", o);
}

/* ── Where things are ─────────────────────────────────────────────────── */

/** A client point in the world units of an effect's wrapper. */
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

/** The caster's fingertips, in world units: the far edge of the glove. */
function fingertips(el: HTMLElement) {
  const film = el.closest<HTMLElement>(".ult-cinematic");
  const caster = film?.querySelector<HTMLElement>('.cine-actors > .cine-actor[data-role="caster"]');
  const glove = caster?.querySelector<SVGGraphicsElement>('[data-part="hand"] path[fill="#d8c8ae"]');
  const g = glove?.getBoundingClientRect();
  if (!g || !g.width) return null;
  const at = toWorld(el, g.right, g.top + g.height * 0.45);
  return at && { ...at, size: g.width * at.zoom };
}

/* ── The edge, at a hand's scale ──────────────────────────────────────── */

const Edge = ({ cue }: VfxProps): ReactNode => {
  const id = fid(useIdSafe());
  const rand = seeded(cue.seed ?? 7);
  return (
    <svg className="tide-world tide-edge-svg" viewBox="0 0 1600 900" data-reach={String(cue.params?.reach ?? 500)}>
      <linearGradient id={`${id}-shallow`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={COBALT} stopOpacity="0.5" />
        <stop offset="1" stopColor={COBALT} stopOpacity="0" />
      </linearGradient>
      {/* the sand it leaves: shining, then dulling */}
      <path className="tide-edge-shine" fill={SHINE} opacity="0" />
      {/* threads of water running out over the sand after it */}
      <g className="tide-edge-threads" stroke={COBALT} strokeWidth="3.5" strokeLinecap="round" fill="none">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} className="tide-thread" data-y={(120 + rand() * 720).toFixed(0)} data-len={(90 + rand() * 160).toFixed(0)} data-off={rand().toFixed(3)} opacity="0" />
        ))}
      </g>
      {/* the body of the water, the shallows along its edge, the foam on it */}
      <path className="tide-edge-body" fill={INK} fillOpacity="0.94" />
      <path className="tide-edge-shallow" fill={`url(#${id}-shallow)`} />
      <path className="tide-edge-foam" fill="none" stroke={FOAM} strokeWidth="9" strokeLinecap="round" strokeDasharray="26 14 8 20" />
      {/* clots of foam left behind on the sand */}
      <g className="tide-edge-clots" fill={FOAM}>
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={i} className="tide-clot" data-y={(80 + rand() * 780).toFixed(0)} data-at={(rand() * 0.8).toFixed(3)} data-r={(4 + rand() * 9).toFixed(1)} r="0" opacity="0" />
        ))}
      </g>
    </svg>
  );
};

/** `useId` without React's hook rules tripping in a renderer called as a function. */
let ids = 0;
function useIdSafe() {
  return `u${(ids = (ids + 1) % 100000)}`;
}

/** The edge's x at height `y`, for a retreat of `reach` past the tips at (tx, ty). */
function edgeAt(y: number, tx: number, ty: number, reach: number, t: number) {
  // The edge runs away diagonally, dented furthest from the hand at the hand's own height.
  const slope = (y - ty) * -0.22;
  const dent = 70 * Math.exp(-(((y - ty) / 150) ** 2));
  const wob = 9 * Math.sin(y * 0.021 + t * 3.1) + 5 * Math.sin(y * 0.057 - t * 4.7);
  return tx + reach + slope + dent + wob;
}

const edge: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".tide-edge-svg");
  if (!svg) return;
  const tips = fingertips(el);
  if (!tips) return;
  const t = age / 1000;
  const far = num(svg.dataset.reach, 500);
  // Under the fingers to begin with; then it backs off, and keeps going.
  const k = ease("inOut", p);
  const reach = -160 + k * far;
  const ys: number[] = [];
  for (let y = -450; y <= 1350; y += 30) ys.push(y);
  const line = (r: number) => ys.map((y) => `${f1(edgeAt(y, tips.x, tips.y, r, t))} ${y}`);
  setPath(svg.querySelector(".tide-edge-body"), `M${line(reach).join(" L")} L2400 1350 L2400 -450 Z`);
  setPath(svg.querySelector(".tide-edge-shallow"), `M${line(reach).join(" L")} L${line(reach + 90).reverse().join(" L")} Z`);
  setPath(svg.querySelector(".tide-edge-foam"), `M${line(reach - 3).join(" L")}`);
  // The shine: the sand between where the water was and where it is, dulling behind.
  const shine = svg.querySelector(".tide-edge-shine");
  setPath(shine, `M${line(-160).join(" L")} L${line(reach).reverse().join(" L")} Z`);
  fade(shine, 0.32 * clamp(k * 3) * (1 - k * 0.5));
  // Threads: their heads at the edge, their tails on the sand behind it.
  for (const th of svg.querySelectorAll<SVGPathElement>(".tide-thread")) {
    const y = num(th.dataset.y, 400);
    const len = num(th.dataset.len, 120);
    const off = num(th.dataset.off, 0);
    const head = edgeAt(y, tips.x, tips.y, reach, t) - 4;
    const tail = Math.max(tips.x + 30, head - len * (0.5 + 0.5 * Math.sin(t * 2 + off * 6)));
    const on = k > off * 0.5;
    setPath(th, `M${f1(tail)} ${f1(y + 4 * Math.sin(tail * 0.05))} Q${f1((tail + head) / 2)} ${f1(y + 8 * Math.sin(t * 5 + off * 9))} ${f1(head)} ${y}`);
    fade(th, on ? 0.55 : 0);
  }
  // Clots of foam left where the edge passed, sinking into the sand.
  for (const c of svg.querySelectorAll<SVGCircleElement>(".tide-clot")) {
    const at = num(c.dataset.at, 0.5);
    const y = num(c.dataset.y, 400);
    const x = edgeAt(y, tips.x, tips.y, -160 + at * far * 0.85, 0) + 6;
    const since = k - at;
    if (since < 0) {
      fade(c, 0);
      continue;
    }
    c.setAttribute("cx", f1(x));
    c.setAttribute("cy", String(y));
    c.setAttribute("r", f1(num(c.dataset.r, 6) * (1 - since * 0.5)));
    fade(c, 0.85 * (1 - clamp(since / 0.7)));
  }
};

/* ── The sea on the flats, going out ──────────────────────────────────── */

const Sea = ({ cue }: VfxProps): ReactNode => {
  const id = fid(useIdSafe());
  const rand = seeded(cue.seed ?? 9);
  return (
    <svg
      className="tide-world tide-sea-svg"
      viewBox="0 0 1600 900"
      data-from={String(cue.params?.from ?? 0)}
      data-to={String(cue.params?.to ?? 1)}
      data-bank={String(cue.params?.bank ?? 0)}
      data-bank-to={String(cue.params?.bankTo ?? cue.params?.bank ?? 0)}
      data-ease={String(cue.params?.ease ?? "linear")}
    >
      <linearGradient id={`${id}-glow`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={COBALT} stopOpacity="0" />
        <stop offset="1" stopColor={COBALT} stopOpacity="0.5" />
      </linearGradient>
      {/* the shine the water leaves on the sand */}
      <path className="tide-sea-shine" fill={SHINE} opacity="0" />
      <g className="tide-sea-threads" stroke={COBALT} strokeWidth="2.5" strokeLinecap="round" fill="none">
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} className="tide-thread" data-depth={rand().toFixed(3)} data-len={(50 + rand() * 120).toFixed(0)} data-off={rand().toFixed(3)} opacity="0" />
        ))}
      </g>
      {/* the sea, the shallows on its edge, the foam line */}
      <path className="tide-sea-body" fill={INK} fillOpacity="0.95" />
      <path className="tide-sea-shallow" fill={COBALT} fillOpacity="0.28" />
      <path className="tide-sea-foam" fill="none" stroke={FOAM} strokeWidth="5" strokeLinecap="round" strokeDasharray="30 18 10 26" />
      {/* the horizon: the sea banking up, lit along its top where it moves */}
      <rect className="tide-sea-horizon-glow" x="-800" width="3200" height="70" fill={`url(#${id}-glow)`} opacity="0" />
      <path className="tide-sea-bank" fill={INK} />
      <path className="tide-sea-bank-lip" fill="none" stroke={COBALT} strokeWidth="4" strokeOpacity="0.8" />
    </svg>
  );
};

const sea: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".tide-sea-svg");
  if (!svg) return;
  const d = svg.dataset;
  const t = age / 1000;
  const k = lerp(num(d.from, 0), num(d.to, 1), ease((d.ease ?? "linear") as never, p));
  const wob = (y: number) => 10 * Math.sin(y * 0.02 + t * 2.6) + 5 * Math.sin(y * 0.061 - t * 3.9);
  setPath(svg.querySelector(".tide-sea-body"), seaPath(k, wob));
  // The shallows and the foam: a band along the edge.
  const edgePts = (kk: number, dx = 0) => {
    const pts: string[] = [];
    for (let y = NEAR; y >= HORIZON; y -= 24) pts.push(`${f1(edgeX(y, kk) + wob(y) + dx)} ${y}`);
    return pts;
  };
  const near = edgePts(k);
  setPath(svg.querySelector(".tide-sea-shallow"), `M${near.join(" L")} L${edgePts(k, 70).reverse().join(" L")} Z`);
  setPath(svg.querySelector(".tide-sea-foam"), `M${edgePts(k, -3).join(" L")}`);
  // The shine, from where the water was when the shot began to where it is.
  const shine = svg.querySelector(".tide-sea-shine");
  setPath(shine, `M${edgePts(num(d.from, 0)).join(" L")} L${near.slice().reverse().join(" L")} Z`);
  fade(shine, 0.22 * clamp((k - num(d.from, 0)) * 4));
  for (const th of svg.querySelectorAll<SVGPathElement>(".tide-thread")) {
    const depth = num(th.dataset.depth, 0.5);
    const y = lerp(NEAR - 40, HORIZON + 60, depth);
    const len = num(th.dataset.len, 80) * (1 - depth * 0.7);
    const off = num(th.dataset.off, 0);
    const head = edgeX(y, k) + wob(y) - 6;
    const tail = head - len * (0.5 + 0.5 * Math.sin(t * 1.7 + off * 7));
    setPath(th, `M${f1(tail)} ${f1(y + 3)} L${f1(head)} ${y}`);
    fade(th, 0.5 * clamp((k - num(d.from, 0)) * 3) * (0.5 + 0.5 * Math.sin(t * 3 + off * 5)));
  }
  // The bank on the horizon: the sea standing up where it has gone to.
  const bank = lerp(num(d.bank, 0), num(d.bankTo, 0), p);
  const H = 6 + bank * 96;
  const x0 = Math.min(2300, Math.max(-800, edgeX(HORIZON, k) - 60));
  const top: string[] = [];
  for (let x = x0; x <= 2400; x += 50) top.push(`${x} ${f1(HORIZON - H * (0.85 + 0.15 * Math.sin(x * 0.006 + t * 0.9)) - 3 * Math.sin(x * 0.03 + t * 2))}`);
  setPath(svg.querySelector(".tide-sea-bank"), `M${f1(x0)} ${HORIZON + 2} L${top.join(" L")} L2400 ${HORIZON + 2} Z`);
  setPath(svg.querySelector(".tide-sea-bank-lip"), `M${top.join(" L")}`);
  const glow = svg.querySelector<SVGRectElement>(".tide-sea-horizon-glow");
  if (glow) {
    glow.setAttribute("y", f1(HORIZON - H - 70));
    fade(glow, bank * 0.7);
  }
};

/* ── The quiet: the drag, and one fish ────────────────────────────────── */

const Drag = ({ cue }: VfxProps): ReactNode => {
  const rand = seeded(cue.seed ?? 13);
  return (
    <svg className="tide-world" viewBox="0 0 1600 900">
      <g stroke={COBALT} strokeLinecap="round" fill="none">
        {Array.from({ length: 24 }, (_, i) => (
          <path key={i} className="tide-drag-line" data-depth={rand().toFixed(3)} data-off={rand().toFixed(3)} data-speed={(0.6 + rand() * 0.6).toFixed(2)} strokeWidth={(2 + rand() * 2.5).toFixed(1)} opacity="0" />
        ))}
      </g>
    </svg>
  );
};

const drag: Frame = (el, _p, age) => {
  const t = age / 1000;
  for (const line of el.querySelectorAll<SVGPathElement>(".tide-drag-line")) {
    const depth = num(line.dataset.depth, 0.5);
    const y = lerp(1250, 520, depth);
    const k = (num(line.dataset.off, 0) + t * num(line.dataset.speed, 0.8) * 0.5) % 1;
    const x0 = lerp(-200, 2000, k) + depth * 600;
    const len = (60 + 80 * (1 - depth)) * (0.6 + 0.4 * Math.sin(k * 6.28));
    setPath(line, `M${f1(x0)} ${f1(y)} L${f1(x0 + len)} ${f1(y + 2)}`);
    fade(line, Math.sin(k * Math.PI) * 0.45);
  }
};

const Fish = ({ cue }: VfxProps): ReactNode => (
  <svg className="tide-world" viewBox="0 0 1600 900" data-x={String(cue.params?.x ?? 820)} data-y={String(cue.params?.y ?? 880)}>
    <g className="tide-fish" stroke="#3b3a44" strokeWidth="3" strokeLinejoin="round">
      <path d="M-34 0 C-20 -16 16 -18 36 0 C16 18 -20 16 -34 0 Z" fill="#7d8798" />
      <path d="M36 0 L54 -14 L52 14 Z" fill="#5a6273" />
      <path d="M-6 -12 L2 -24 L12 -12 M-2 10 L6 20" fill="none" />
      <circle cx="-22" cy="-3" r="3" fill="#0b0f18" stroke="none" />
    </g>
  </svg>
);

const fish: Frame = (el, _p, age) => {
  const svg = el.querySelector<SVGSVGElement>("svg");
  const g = svg?.querySelector(".tide-fish");
  if (!svg || !g) return;
  const x = num(svg.dataset.x, 760);
  const y = num(svg.dataset.y, 1010);
  // Two flaps, early, then it lies still.
  const flap = (at: number, len: number) => {
    const k = (age - at) / len;
    return k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0;
  };
  const f = flap(90, 130) + 0.7 * flap(300, 110);
  place(g, `translate(${x} ${f1(y - f * 22)}) rotate(${f1(-14 + f * 26)}) scale(1.4 ${f1(1.4 - f * 0.3)})`);
};

/* ── Foam across the lens ─────────────────────────────────────────────── */

const Wipe = ({ cue }: VfxProps): ReactNode => {
  const rand = seeded(cue.seed ?? 41);
  return (
    <div className="tide-wipe" data-half={String(cue.params?.half ?? "out")}>
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
        <rect x="120" y="-40" width="500" height="280" fill={FOAM} />
        <rect x="150" y="-40" width="500" height="280" fill={COBALT} fillOpacity="0.55" />
        {Array.from({ length: 22 }, (_, i) => {
          const y = -30 + (i / 21) * 260;
          const x = 120 - 10 - rand() * 60;
          const r = 22 + rand() * 30;
          return <circle key={i} cx={x} cy={y} r={r} fill={FOAM} />;
        })}
        {Array.from({ length: 30 }, (_, i) => {
          const y = -30 + rand() * 260;
          const x = 60 - rand() * 90;
          const r = 4 + rand() * 12;
          return <circle key={`b${i}`} cx={x} cy={y} r={r} fill={FOAM} fillOpacity="0.9" />;
        })}
      </svg>
    </div>
  );
};

const wipe: Frame = (el, p) => {
  const node = el.querySelector<HTMLElement>(".tide-wipe");
  if (!node) return;
  // One pour across the lens, right to left, split over the cut.
  const k = node.dataset.half === "in" ? 0.5 + p * 0.7 : p * 0.5;
  const value = `translate3d(${((0.5 - k) * 240).toFixed(2)}%, ${(Math.sin(k * Math.PI) * 3).toFixed(2)}%, 0)`;
  if (node.style.transform !== value) node.style.transform = value;
};

/* ── The sea back: a level through the whole frame ────────────────────── */

const RETURN_BUBBLES = 34;
const RETURN_STREAKS = 26;
const FOAM_BURST = 14;

const Return = ({ cue }: VfxProps): ReactNode => {
  const id = fid(useIdSafe());
  const band = String(cue.params?.band ?? "front");
  const rand = seeded(cue.seed ?? 21);
  return (
    <svg
      className="tide-world tide-return-svg"
      viewBox="0 0 1600 900"
      data-band={band}
      data-level={String(cue.params?.level ?? 0.55)}
      data-heap={String(cue.params?.heap ?? 0)}
      data-hit={String(cue.params?.hit ?? 0.12)}
    >
      <linearGradient id={`${id}-deep`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={COBALT} stopOpacity="0.34" />
        <stop offset="0.35" stopColor="#2a4fa8" stopOpacity="0.46" />
        <stop offset="1" stopColor={INK} stopOpacity="0.9" />
      </linearGradient>
      {band === "back" ? (
        <>
          {/* the sea back over the whole flat, to the horizon */}
          <path className="tide-back-body" fill={INK} fillOpacity="0.96" />
          {/* the whole flat white with foam for the first frames it is back */}
          <path className="tide-back-flash" fill="#dbe7f7" opacity="0" />
          <g className="tide-back-glints" stroke={COBALT} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.7" fill="none">
            {Array.from({ length: 18 }, (_, i) => (
              <path key={i} className="tide-glint" data-x={(-600 + rand() * 3000).toFixed(0)} data-y={(HORIZON + 20 + rand() * 300).toFixed(0)} data-len={(30 + rand() * 120).toFixed(0)} data-off={rand().toFixed(3)} />
            ))}
          </g>
        </>
      ) : (
        <>
          {/* the near surface over the figures, and the deep under it */}
          <path className="tide-front-body" fill={`url(#${id}-deep)`} />
          <path className="tide-front-flash" fill="#e4eefb" opacity="0" />
          {/* from under: the surface seen from below, a bright ceiling, and light coming down through it */}
          <path className="tide-front-sky" fill="#3f63a8" opacity="0" />
          <g className="tide-front-rays" stroke={FOAM} strokeLinecap="round" fill="none" opacity="0">
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} className="tide-ray" data-x={(-600 + i * 380 + rand() * 200).toFixed(0)} data-w={(6 + rand() * 14).toFixed(1)} data-off={rand().toFixed(3)} strokeOpacity={(0.1 + rand() * 0.14).toFixed(2)} />
            ))}
          </g>
          <path className="tide-front-under" fill="none" stroke={COBALT} strokeWidth="34" strokeOpacity="0.28" strokeLinecap="round" />
          <path className="tide-front-surface" fill="none" stroke={FOAM} strokeWidth="9" strokeLinecap="round" strokeOpacity="0.9" />
          {/* the undertow: everything under the surface dragged seaward */}
          <g className="tide-front-streaks" stroke={COBALT} strokeLinecap="round" fill="none">
            {Array.from({ length: RETURN_STREAKS }, (_, i) => (
              <path key={i} className="tide-streak" data-depth={rand().toFixed(3)} data-off={rand().toFixed(3)} data-speed={(0.8 + rand() * 0.8).toFixed(2)} strokeWidth={(2 + rand() * 3).toFixed(1)} opacity="0" />
            ))}
          </g>
          {/* foam riding the line, bursting where it hits each figure */}
          <g className="tide-front-foam" fill={FOAM}>
            {Array.from({ length: 6 }, (_, f) =>
              Array.from({ length: FOAM_BURST }, (_, i) => (
                <circle key={`${f}-${i}`} className="tide-burst" data-f={f} data-a={((i / FOAM_BURST) * 6.28 + rand() * 0.5).toFixed(3)} data-v={(0.5 + rand()).toFixed(3)} data-r={(6 + rand() * 16).toFixed(1)} r="0" opacity="0" />
              )),
            )}
            {Array.from({ length: 60 }, (_, i) => (
              <circle key={`l${i}`} className="tide-line-foam" data-x={(-800 + rand() * 3200).toFixed(0)} data-off={rand().toFixed(3)} data-r={(3 + rand() * 9).toFixed(1)} r="0" opacity="0" />
            ))}
          </g>
          {/* bubbles going up from whoever is under */}
          <g className="tide-front-bubbles" fill="none" stroke={FOAM} strokeWidth="2.5">
            {Array.from({ length: RETURN_BUBBLES }, (_, i) => (
              <circle key={i} className="tide-bubble" data-f={i % 6} data-off={rand().toFixed(3)} data-dx={((rand() - 0.5) * 60).toFixed(0)} data-r={(3 + rand() * 7).toFixed(1)} r="0" opacity="0" />
            ))}
          </g>
        </>
      )}
    </svg>
  );
};

interface Figure {
  x: number;
  y: number;
  h: number;
}

/** The surface's height at `x`: the level, a swell, and a heap over the target. */
function surfaceY(x: number, top: number, t: number, target: Figure | undefined, heap: number) {
  const swell = 9 * Math.sin(x * 0.011 + t * 2.2) + 5 * Math.sin(x * 0.029 - t * 3.6) + 3 * Math.sin(x * 0.07 + t * 5);
  let y = top + swell;
  if (target && heap > 0) {
    // The water heaped up over the one it takes under: highest right over it, its head gone.
    const u = (x - target.x) / Math.max(90, target.h * 0.42);
    y -= Math.max(0, target.h * 0.62 * heap * (1 - u * u));
  }
  return y;
}

const returnFrame: Frame = (el, p, age, ctx) => {
  const svg = el.querySelector<SVGSVGElement>(".tide-return-svg");
  if (!svg) return;
  const d = svg.dataset;
  const t = age / 1000;
  const hit = num(d.hit, 0.12);
  const figures: Figure[] = [];
  for (let i = 0; i < 6; i++) {
    const a = ctx.actor(`targets-${i}`);
    if (a) figures.push(a);
  }
  const target = figures[0];
  // The level: rises from below the frame to the target's chest by the hit, whipping up at the end.
  const rise = ease("in", clamp((p - 0.005) / (hit - 0.01)));
  const top = target ? target.y - target.h * num(d.level, 0.55) : 640;
  const heap = num(d.heap, 0) * ease("out", clamp((p - hit) / 0.22));
  if (d.band === "back") {
    // The sea sweeps back across the whole flat from the right, ahead of the level.
    const k = lerp(1.05, -0.7, ease("in", clamp(p / (hit - 0.005))));
    const wob = (y: number) => 8 * Math.sin(y * 0.02 + t * 2.6);
    setPath(svg.querySelector(".tide-back-body"), seaPath(k, wob));
    // Foam: the first frames it is back the whole sea is white, so the row reads black against it.
    const flash = svg.querySelector(".tide-back-flash");
    setPath(flash, seaPath(k, wob));
    fade(flash, p < hit - 0.01 ? 0 : 0.9 * (1 - clamp((p - hit) / 0.1)));
    for (const g of svg.querySelectorAll<SVGPathElement>(".tide-glint")) {
      const x = num(g.dataset.x, 0);
      const y = num(g.dataset.y, HORIZON + 100);
      if (x < edgeX(y, k)) {
        fade(g, 0);
        continue;
      }
      const len = num(g.dataset.len, 60);
      const off = num(g.dataset.off, 0);
      const sx = x + Math.sin(t * 1.5 + off * 6) * 20;
      setPath(g, `M${f1(sx)} ${y} L${f1(sx + len)} ${y}`);
      fade(g, 0.4 + 0.4 * Math.sin(t * 4 + off * 9));
    }
    return;
  }
  // The near surface: from below the frame up to the level, arriving from the right first.
  const xs: number[] = [];
  for (let x = -800; x <= 2400; x += 20) xs.push(x);
  const yAt = (x: number) => {
    const lag = clamp((2400 - x) / 3200) * 0.35;
    const k = ease("in", clamp((rise - lag) / (1 - lag)));
    return lerp(NEAR + 60, surfaceY(x, top, t, target, heap), k);
  };
  const line = xs.map((x) => `${x} ${f1(yAt(x))}`);
  setPath(svg.querySelector(".tide-front-body"), `M-800 ${NEAR + 80} L${line.join(" L")} L2400 ${NEAR + 80} Z`);
  const frontFlash = svg.querySelector(".tide-front-flash");
  setPath(frontFlash, `M-800 ${NEAR + 80} L${line.join(" L")} L2400 ${NEAR + 80} Z`);
  fade(frontFlash, p < hit - 0.01 ? 0 : 0.92 * (1 - clamp((p - hit) / 0.1)));
  // Under: the surface from below is a bright ceiling; whatever is above it is gone.
  const sky = svg.querySelector(".tide-front-sky");
  const deep = clamp((p - 0.4) / 0.2);
  setPath(sky, `M-800 -450 L${line.join(" L")} L2400 -450 Z`);
  fade(sky, deep * 0.97);
  const rays = svg.querySelector(".tide-front-rays");
  fade(rays, deep);
  for (const r of svg.querySelectorAll<SVGPathElement>(".tide-ray")) {
    const x = num(r.dataset.x, 0) + Math.sin(t * 0.8 + num(r.dataset.off, 0) * 6) * 30;
    const y0 = yAt(x);
    r.setAttribute("stroke-width", r.dataset.w ?? "8");
    setPath(r, `M${f1(x)} ${f1(y0 + 4)} L${f1(x + 60)} ${f1(y0 + 520)}`);
  }
  setPath(svg.querySelector(".tide-front-surface"), `M${line.join(" L")}`);
  setPath(svg.querySelector(".tide-front-under"), `M${xs.map((x) => `${x} ${f1(yAt(x) + 22)}`).join(" L")}`);
  const under = p > hit;
  // The undertow: streaks under the surface, all going seaward.
  for (const s of svg.querySelectorAll<SVGPathElement>(".tide-streak")) {
    if (!under) {
      fade(s, 0);
      continue;
    }
    const depth = num(s.dataset.depth, 0.5);
    const k = (num(s.dataset.off, 0) + (t - hit) * num(s.dataset.speed, 1) * 0.6) % 1;
    const x0 = lerp(-400, 2000, k);
    const y = top + 40 + depth * 620;
    const len = 60 + 140 * (1 - depth) * (0.5 + 0.5 * Math.sin(k * 6.28));
    setPath(s, `M${f1(x0)} ${f1(y)} L${f1(x0 + len)} ${f1(y + 3)}`);
    fade(s, Math.sin(k * Math.PI) * 0.5);
  }
  // Foam: a burst at each figure as the line reaches it, and flecks riding the line.
  for (const c of svg.querySelectorAll<SVGCircleElement>(".tide-burst")) {
    const f = figures[num(c.dataset.f, 0)];
    const since = p - hit;
    if (!f || since < 0) {
      fade(c, 0);
      continue;
    }
    const a = num(c.dataset.a, 0);
    const v = num(c.dataset.v, 1);
    const k = clamp(since / 0.45);
    const spread = f.h * 0.55 * v * ease("out", k);
    const cx = f.x + Math.cos(a) * spread * 1.2 + since * 200;
    const cy = surfaceY(f.x, top, t, target, heap) - Math.abs(Math.sin(a)) * spread * 0.7 + k * k * f.h * 0.3;
    c.setAttribute("cx", f1(cx));
    c.setAttribute("cy", f1(cy));
    c.setAttribute("r", f1(num(c.dataset.r, 8) * (1 - k * 0.5)));
    fade(c, 0.9 * (1 - k));
  }
  for (const c of svg.querySelectorAll<SVGCircleElement>(".tide-line-foam")) {
    const x = num(c.dataset.x, 0);
    const off = num(c.dataset.off, 0);
    const y = yAt(x);
    if (y > NEAR) {
      fade(c, 0);
      continue;
    }
    c.setAttribute("cx", f1(x + Math.sin(t * 2 + off * 9) * 12 + (under ? (t - hit) * 60 : 0)));
    c.setAttribute("cy", f1(y - 2 + Math.sin(t * 3 + off * 5) * 3));
    c.setAttribute("r", c.dataset.r ?? "5");
    fade(c, 0.6 + 0.3 * Math.sin(t * 5 + off * 7));
  }
  // Bubbles going up from the figures under the water, the target's the most.
  for (const b of svg.querySelectorAll<SVGCircleElement>(".tide-bubble")) {
    const fi = num(b.dataset.f, 0);
    const f = figures[fi === 0 || fi > 2 ? 0 : fi];
    if (!f || !under) {
      fade(b, 0);
      continue;
    }
    const off = num(b.dataset.off, 0);
    const k = (off + (t - hit) * 0.9) % 1;
    const y0 = f.y - f.h * 0.15;
    const ys = surfaceY(f.x, top, t, target, heap) + 6;
    const y = lerp(y0, ys, k);
    if (y <= ys) {
      fade(b, 0);
      continue;
    }
    b.setAttribute("cx", f1(f.x + num(b.dataset.dx, 0) + Math.sin(k * 9 + off * 6) * 8 + k * 40));
    b.setAttribute("cy", f1(y));
    b.setAttribute("r", f1(num(b.dataset.r, 5) * (0.6 + k * 0.6)));
    fade(b, 0.75 * clamp(k * 6));
  }
};

/* ── On the board ─────────────────────────────────────────────────────── */

/** A sheet of water sliding away from a real enemy's feet, seaward. */
const Drain = ({ cue }: VfxProps): ReactNode => {
  const rand = seeded(cue.seed ?? 5);
  return (
    <div className="tide-drain">
      <svg viewBox="-120 -100 240 120">
        <ellipse className="tide-drain-wet" cx="0" cy="2" rx="46" ry="9" fill="#0b1524" opacity="0" />
        <g className="tide-drain-sheet" opacity="0">
          <path d="M-70 2 C-64 -14 64 -14 70 2 C64 18 -64 18 -70 2 Z" fill={COBALT} fillOpacity="0.5" />
          <path d="M-72 0 C-66 -15 60 -15 66 -2" fill="none" stroke={FOAM} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="8 5" />
        </g>
        <g className="tide-drain-threads" stroke={COBALT} strokeWidth="1.8" strokeLinecap="round" fill="none">
          {Array.from({ length: 5 }, (_, i) => (
            <path key={i} className="tide-drain-thread" data-y={(-4 + rand() * 10).toFixed(1)} data-off={rand().toFixed(3)} opacity="0" />
          ))}
        </g>
      </svg>
    </div>
  );
};

const drain: Frame = (el, p) => {
  const svg = el.querySelector<SVGSVGElement>(".tide-drain svg");
  if (!svg) return;
  const k = ease("out", p);
  const sheet = svg.querySelector(".tide-drain-sheet");
  place(sheet, `translate(${f1(k * 210)} 0) scale(${f1(1 + k * 0.4)} ${f1(1 - k * 0.6)})`);
  fade(sheet, clamp(p * 6) * (1 - clamp((p - 0.5) / 0.5)));
  fade(svg.querySelector(".tide-drain-wet"), clamp(p * 4) * 0.7);
  for (const th of svg.querySelectorAll<SVGPathElement>(".tide-drain-thread")) {
    const y = num(th.dataset.y, 0);
    const off = num(th.dataset.off, 0);
    const head = 10 + k * 220 - off * 40;
    setPath(th, `M${f1(head - 40 - off * 30)} ${f1(y)} L${f1(head)} ${f1(y)}`);
    fade(th, p > 0.15 ? 0.6 * (1 - clamp((p - 0.6) / 0.4)) : 0);
  }
};

/** A real enemy standing in water that is still running out past it. */
const Standing = ({ cue }: VfxProps): ReactNode => {
  const rand = seeded(cue.seed ?? 3);
  return (
    <div className="tide-standing">
      <svg viewBox="-80 -67 160 80">
        <path className="tide-stand-body" fill={COBALT} fillOpacity="0.36" />
        <path className="tide-stand-deep" fill={INK} fillOpacity="0.42" />
        <path className="tide-stand-line" fill="none" stroke={FOAM} strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.85" />
        <g className="tide-stand-streaks" stroke={COBALT} strokeWidth="1.6" strokeLinecap="round" fill="none">
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} className="tide-stand-streak" data-y={(rand() * 18).toFixed(1)} data-off={rand().toFixed(3)} opacity="0" />
          ))}
        </g>
        <g className="tide-stand-foam" fill={FOAM}>
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} className="tide-stand-fleck" data-x={((rand() - 0.5) * 90).toFixed(1)} data-off={rand().toFixed(3)} r={(1.6 + rand() * 2.6).toFixed(1)} opacity="0" />
          ))}
        </g>
      </svg>
    </div>
  );
};

const standing: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".tide-standing svg");
  if (!svg) return;
  const t = age / 1000;
  const up = ease("out", clamp(p / 0.25));
  const top = -26 * up;
  // The water round its legs: a mound whose top sways, tapering to a pool at either side, so it sits on the ground.
  const sway = (x: number) => 2.2 * Math.sin(x * 0.12 + t * 3) + 1.2 * Math.sin(x * 0.3 - t * 4.5);
  const topAt = (x: number) => 4 + (top - 4) * Math.max(0, 1 - (x / 66) ** 2) + sway(x) * up;
  const xs = [-70, -56, -42, -28, -14, 0, 14, 28, 42, 56, 70];
  const line = xs.map((x) => `${x} ${f1(topAt(x))}`);
  setPath(svg.querySelector(".tide-stand-body"), `M${line.join(" L")} C62 16 36 20 0 20 C-36 20 -62 16 -70 4 Z`);
  setPath(svg.querySelector(".tide-stand-deep"), `M-70 4 C-62 14 -36 18 0 18 C36 18 62 14 70 4 C56 10 30 12 0 12 C-30 12 -56 10 -70 4 Z`);
  setPath(svg.querySelector(".tide-stand-line"), `M${line.slice(1, -1).join(" L")}`);
  for (const s of svg.querySelectorAll<SVGPathElement>(".tide-stand-streak")) {
    const k = (num(s.dataset.off, 0) + t * 0.7) % 1;
    const x0 = lerp(-50, 28, k);
    const y = topAt(x0 + 11) + 4 + num(s.dataset.y, 0) * 0.6 * up;
    setPath(s, `M${f1(x0)} ${f1(y)} L${f1(x0 + 22)} ${f1(y)}`);
    fade(s, up * Math.sin(k * Math.PI) * 0.7);
  }
  for (const c of svg.querySelectorAll<SVGCircleElement>(".tide-stand-fleck")) {
    const off = num(c.dataset.off, 0);
    const cx = Math.max(-54, Math.min(54, num(c.dataset.x, 0) * 0.8 + Math.sin(t * 2 + off * 8) * 6 + ((t * 20 + off * 50) % 30)));
    c.setAttribute("cx", f1(cx));
    c.setAttribute("cy", f1(topAt(cx) - 1));
    fade(c, up * (0.5 + 0.4 * Math.sin(t * 5 + off * 9)));
  }
};

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "tide-edge-water": Edge,
  "tide-sea": Sea,
  "tide-drag": Drag,
  "tide-fish": Fish,
  "tide-foam-wipe": Wipe,
  "tide-return": Return,
  "tide-drain": Drain,
  "tide-standing": Standing,
};

export const frames: Record<string, Frame> = {
  "tide-edge-water": edge,
  "tide-sea": sea,
  "tide-drag": drag,
  "tide-fish": fish,
  "tide-foam-wipe": wipe,
  "tide-return": returnFrame,
  "tide-drain": drain,
  "tide-standing": standing,
};
