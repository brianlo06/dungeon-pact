import type { CSSProperties, ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import "./style.css";

/**
 * The Small Print's effects.
 *
 * The idea they serve: the Assurer writes one policy long enough for the whole
 * party, reads the small print once, and snaps it taut so every fold stands up
 * at once as a paper screen in front of the one it covers.
 *
 * Everything is paper and everything is done by folding. A leaf of the policy
 * is drawn one way everywhere: a cream panel, a carbon-blue engraved border
 * inset from its edge, ruled script across it, a bright crease down the edge
 * it folds on, and the side turned from the light a shade darker. Leaves are
 * quads rebuilt each frame from where the cast stands (`ctx.actor`), so a duo
 * and a quartet get the right number of folds in the right places.
 *
 *   print-slip     on the board: the folded policy flicks open a fold in the
 *                  Broker's hand
 *   print-wad      the detail: a fat fan-fold held up to the lens, its folds
 *                  riffling past the thumb one by one
 *   print-turn     the occlusion: a sheet turning over the lens, out of one
 *                  shot and off the next (two cues straddling the cut)
 *   print-policy   the wide: the policy opening out of the Broker's hand fold
 *                  after fold behind the whole party, a signature writing
 *                  itself on the leaf behind each ally
 *   print-lens     the quiet: the small print scrolling across both lenses
 *   print-margin   the quiet: the edge of the page, and its small print, held
 *                  up under the lens
 *   print-crack    the drawn impact: the crease snapping taut across the frame
 *   print-screens  the impact: a screen standing up in front of every figure,
 *                  the Broker's first
 *   print-cover    on the board: a screen standing at every real ally
 *   print-bill     on the board: the premium's bill tucked into the treasury
 *
 * No filters, no keyframes, no blur: a glow is a wide translucent stroke.
 */

export const PAPER = "#efe3c6";
export const SHADE = "#c9b58f";
export const INK = "#1d160f";
export const CARBON = "#8b95ff";

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const f1 = (x: number) => x.toFixed(1);

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
type P = [number, number];

const setD = (el: Element | null | undefined, d: string) => {
  if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
};
const setStyle = (el: HTMLElement | SVGElement | null | undefined, name: string, value: string) => {
  if (el && el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
};
const setTransform = (el: HTMLElement | SVGElement | null | undefined, value: string) => {
  if (el && el.style.transform !== value) el.style.transform = value;
};

/* ── A leaf of the policy ─────────────────────────────────────────────── */

/** Quad corners, in order: bottom-left, bottom-right, top-right, top-left. */
type Quad = [P, P, P, P];

const mix = (a: P, b: P, k: number): P => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const poly = (q: P[]) => `M${q.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(" L")} Z`;

/** A quad pulled in towards its middle by `u` across and `v` up and down. */
function inset(q: Quad, u: number, v: number): Quad {
  const at = (x: number, y: number): P => mix(mix(q[0], q[1], x), mix(q[3], q[2], x), y);
  return [at(u, v), at(1 - u, v), at(1 - u, 1 - v), at(u, 1 - v)];
}

/**
 * The paths that draw a set of leaves: panel fills (lit and shaded separately),
 * the engraved border, the ruled script and the creases.
 */
function leaves(quads: { q: Quad; lit: boolean; script?: number }[]) {
  let lit = "";
  let shade = "";
  let border = "";
  let script = "";
  let crease = "";
  for (const { q, lit: on, script: rows = 6 } of quads) {
    const w = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]);
    if (w < 0.8) {
      crease += `M${f1(q[0][0])} ${f1(q[0][1])} L${f1(q[3][0])} ${f1(q[3][1])} `;
      continue;
    }
    if (on) lit += poly(q) + " ";
    else shade += poly(q) + " ";
    crease += `M${f1(q[1][0])} ${f1(q[1][1])} L${f1(q[2][0])} ${f1(q[2][1])} `;
    // A leaf seen only by its edge, in a stack, carries no border or script.
    if (!rows) continue;
    const b = inset(q, 0.09, 0.07);
    border += poly(b) + " ";
    const c = inset(q, 0.16, 0.18);
    for (let r = 0; r < rows; r++) {
      const k = r / Math.max(1, rows - 1);
      const a = mix(c[0], c[3], k);
      const z = mix(c[1], c[2], k);
      // A short last line to a clause.
      const end = r % 4 === 3 ? 0.55 : 1;
      script += `M${f1(a[0])} ${f1(a[1])} L${f1(lerp(a[0], z[0], end))} ${f1(lerp(a[1], z[1], end))} `;
    }
  }
  return { lit, shade, border, script, crease };
}

function LeafPaths({ extra }: { extra?: ReactNode }) {
  return (
    <>
      <path className="print-leaf-shadow" />
      <path className="print-leaf-shade" />
      <path className="print-leaf-lit" />
      <path className="print-leaf-border" />
      <path className="print-leaf-script" />
      <path className="print-leaf-crease" />
      {extra}
    </>
  );
}

function writeLeaves(svg: Element, quads: { q: Quad; lit: boolean; script?: number }[], shadow = "") {
  const d = leaves(quads);
  setD(svg.querySelector(".print-leaf-lit"), d.lit);
  setD(svg.querySelector(".print-leaf-shade"), d.shade);
  setD(svg.querySelector(".print-leaf-border"), d.border);
  setD(svg.querySelector(".print-leaf-script"), d.script);
  setD(svg.querySelector(".print-leaf-crease"), d.crease);
  setD(svg.querySelector(".print-leaf-shadow"), shadow);
}

/**
 * A folding screen of `n` leaves standing on the ground at (x, y), rising to
 * `k` of its height: leaves zig-zag in depth, so alternate ones catch the
 * light. `lean` tips the whole screen back.
 */
function screen(x: number, y: number, h: number, w: number, n: number, k: number, depth: number, lean = 0) {
  const out: { q: Quad; lit: boolean; script: number }[] = [];
  const rise = h * k;
  let shadow = "";
  for (let i = 0; i < n; i++) {
    const back = i % 2 ? depth : 0;
    const next = i % 2 ? 0 : depth;
    const x0 = x + i * w;
    const x1 = x + (i + 1) * w;
    const bl: P = [x0 + back * 0.5, y - back];
    const br: P = [x1 + next * 0.5, y - next];
    const tl: P = [bl[0] + lean * rise, bl[1] - rise];
    const tr: P = [br[0] + lean * rise, br[1] - rise];
    out.push({ q: [bl, br, tr, tl], lit: i % 2 === 0, script: 5 });
    // Its shadow on the page, thrown away from the light.
    const s = rise * 0.18;
    shadow += poly([bl, br, [br[0] + s, br[1] + s * 0.28], [bl[0] + s, bl[1] + s * 0.28]]) + " ";
  }
  return { quads: out, shadow };
}

/* ── Renderers ─────────────────────────────────────────────────────────── */

/** World-sized: an SVG over the whole stage, drawn in world units. */
const World = ({ cue, className, children }: { cue: VfxProps["cue"]; className: string; children?: ReactNode }) => (
  <svg
    className={`print-world ${className}`}
    viewBox="0 0 1600 900"
    data-print=""
    data-params={JSON.stringify(cue.params ?? {})}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const Policy = ({ cue }: VfxProps) => (
  <World cue={cue} className="print-policy">
    <LeafPaths extra={<path className="print-signature" />} />
  </World>
);

const Screens = ({ cue }: VfxProps) => (
  <World cue={cue} className="print-screens">
    <path className="print-taut-glow" />
    <LeafPaths extra={<path className="print-taut" />} />
  </World>
);

const Wad = ({ cue }: VfxProps) => (
  <World cue={cue} className="print-wad">
    <LeafPaths extra={<path className="print-thumb" />} />
  </World>
);

/** The page turning over the lens. */
const Turn = ({ cue }: VfxProps) => (
  <svg className="print-turn" viewBox="0 0 1000 1000" preserveAspectRatio="none" data-print="" data-params={JSON.stringify(cue.params ?? {})} aria-hidden="true">
    <path className="print-turn-shadow" />
    <path className="print-turn-back" />
    <path className="print-turn-face" />
    <path className="print-turn-rules" />
    <path className="print-turn-crease" />
  </svg>
);

/** The small print, in both lenses. Two circles clip lines that scroll up. */
const LINES = (() => {
  const rand = seeded(2024);
  let d = "";
  for (let row = 0; row < 26; row++) {
    const y = -100 + row * 8.6;
    let x = -60 + rand() * 8;
    while (x < 60) {
      const len = 4 + rand() * 18;
      d += `M${x.toFixed(1)} ${y.toFixed(1)} h${len.toFixed(1)} `;
      x += len + 3 + rand() * 3;
    }
  }
  return d;
})();

const Lens = ({ cue }: VfxProps) => {
  const id = `print-lens-${cue.seed ?? 1}`;
  const r = Number(cue.params?.r ?? 40);
  const gap = Number(cue.params?.gap ?? 100);
  return (
    <svg
      className="print-lens"
      viewBox={`${-gap / 2 - r - 10} ${-r - 10} ${gap + r * 2 + 20} ${r * 2 + 20}`}
      style={{ width: gap + r * 2 + 20, height: r * 2 + 20 }}
      data-print=""
      data-params={JSON.stringify(cue.params ?? {})}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={id}>
          <circle cx={-gap / 2} cy="0" r={r} />
          <circle cx={gap / 2} cy="0" r={r * 0.9} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <g className="print-lens-scroll" transform={`scale(${(r / 60).toFixed(3)})`}>
          <path className="print-lens-lines" d={LINES} transform={`translate(${(-gap / 2 / (r / 60)).toFixed(1)} 0)`} />
          <path className="print-lens-lines" d={LINES} transform={`translate(${(gap / 2 / (r / 60)).toFixed(1)} 0)`} />
        </g>
        <rect className="print-lens-sheen" x={-gap / 2 - r} y={-r} width={gap + r * 2} height={r * 2} />
      </g>
    </svg>
  );
};

/** The page's edge under the lens, with its small print. Screen space. */
const MARGIN = (() => {
  const rand = seeded(99);
  let d = "";
  for (let row = 0; row < 5; row++) {
    const y = 36 + row * 13;
    let x = 30 + rand() * 20;
    while (x < 980) {
      const len = 8 + rand() * 40;
      d += `M${x.toFixed(0)} ${y} h${len.toFixed(0)} `;
      x += len + 6 + rand() * 7;
    }
  }
  return d;
})();

const Margin = () => (
  <svg className="print-margin" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
    <path className="print-margin-sheet" d="M-20 18 L1020 4 L1020 140 L-20 140 Z" />
    <path className="print-margin-rule" d="M-20 26 L1020 12" />
    <path className="print-margin-print" d={MARGIN} />
  </svg>
);

/** The crease, snapping taut across the frame, and what it throws off. */
const CRACK = (() => {
  const rand = seeded(5150);
  const pts: P[] = [];
  let x = -40;
  let up = true;
  while (x < 1040) {
    pts.push([x, up ? 430 + rand() * 30 : 560 + rand() * 40]);
    x += 60 + rand() * 70;
    up = !up;
  }
  return pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(0)} ${p[1].toFixed(0)}`).join(" ");
})();

const Crack = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 12);
  return (
    <div className="print-crack">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        <path className="print-crack-glow" d={CRACK} />
        <path className="print-crack-core" d={CRACK} />
      </svg>
      {Array.from({ length: 16 }, (_, i) => (
        <i
          key={i}
          className="print-sliver"
          style={
            {
              left: `${4 + rand() * 92}%`,
              top: `${44 + rand() * 14}%`,
              "--dx": `${(rand() - 0.5) * 60}vw`,
              "--dy": `${-10 - rand() * 40}vh`,
              "--r": `${(rand() - 0.5) * 720}deg`,
              "--w": `${10 + rand() * 26}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
};

const Slip = () => (
  <div className="print-slip">
    <svg viewBox="-60 -80 120 120" aria-hidden="true">
      <path className="print-slip-stack" d="M-26 -8 L22 -14 L26 18 L-22 24 Z" />
      <path className="print-slip-stack b" d="M-24 -12 L24 -18 L28 14 L-20 20 Z" />
      <path className="print-slip-fold" d="M-24 -12 L24 -18 L28 14 L-20 20 Z" />
      <path className="print-slip-border" d="M-17 -8 L18 -12 L21 10 L-14 14 Z" />
    </svg>
  </div>
);

const Cover = () => (
  <div className="print-cover">
    <svg viewBox="-10 -110 120 120" aria-hidden="true">
      <LeafPaths />
    </svg>
  </div>
);

const Bill = () => <div className="print-bill-box" data-print="" />;

/* ── Frames ────────────────────────────────────────────────────────────── */

const params = (el: HTMLElement): Record<string, number | string | boolean> => {
  const cached = (el as HTMLElement & { _printParams?: Record<string, number | string | boolean> })._printParams;
  if (cached) return cached;
  const src = el.querySelector<SVGElement | HTMLElement>("[data-params]");
  const out = src ? JSON.parse(src.dataset.params ?? "{}") : {};
  (el as HTMLElement & { _printParams?: Record<string, number | string | boolean> })._printParams = out;
  return out;
};
const pn = (o: Record<string, number | string | boolean>, k: string, d: number) => {
  const x = Number(o[k]);
  return Number.isFinite(x) ? x : d;
};

/** Everyone the stage placed in this shot, left to right: the caster and the allies. */
function figures(ctx: VfxContext) {
  const out: { id: string; x: number; y: number; h: number }[] = [];
  const c = ctx.actor("caster");
  if (c) out.push({ id: "caster", ...c });
  for (let i = 0; i < 6; i++) {
    const a = ctx.actor(`allies-${i}`);
    if (a) out.push({ id: `allies-${i}`, ...a });
  }
  return out.sort((a, b) => a.x - b.x);
}

/**
 * The wide: the policy opens out of the Broker's hand behind the party, fold
 * after fold, a leaf behind each ally, and a signature writes itself on each
 * leaf as it opens. Each leaf turns on its hinge from edge-on to nearly
 * face-on, so the folds read as a concertina; every leaf after it rides out
 * with it.
 */
const policy: Frame = (el, p, _age, ctx) => {
  const svg = el.querySelector("svg");
  const figs = figures(ctx);
  const caster = ctx.actor("caster");
  if (!svg || !caster || !figs.length) return;
  const o = params(el);
  const allies = figs.filter((f) => f.id !== "caster");
  const last = allies.length ? allies[allies.length - 1] : caster;
  const hRef = allies.length ? allies.reduce((n, a) => n + a.h, 0) / allies.length : caster.h;
  const back = pn(o, "back", 26);
  const baseY = (allies.length ? allies.reduce((n, a) => n + a.y, 0) / allies.length : caster.y) - back;
  const height = hRef * pn(o, "height", 0.78);
  const x0 = caster.x + caster.h * pn(o, "hand", 0.3);
  // A small party gets the same long policy: it runs on past the last of them.
  const x1 = Math.max(last.x + hRef * pn(o, "tail", 0.55), pn(o, "minEnd", 0));
  const count = Math.max(4, Math.round((x1 - x0) / (hRef * pn(o, "leaf", 0.36))));
  const w = (x1 - x0) / count;
  const open0 = pn(o, "start", 0.08);
  const open1 = pn(o, "end", 0.62);
  const depth = w * 0.3;
  const quads: { q: Quad; lit: boolean; script: number }[] = [];
  let x = x0;
  let sig = "";
  let shadow = "";
  for (let i = 0; i < count; i++) {
    const t0 = lerp(open0, open1, i / count);
    const k = ease("out", clamp((p - t0) / ((open1 - open0) / count + 0.06)));
    if (k <= 0) break;
    // Hinged on its left edge: from edge-on (90°) to a shallow zig-zag (16°).
    const phi = lerp(90, 16, k);
    const ww = w * Math.cos((phi * Math.PI) / 180);
    const dz = depth * Math.sin((phi * Math.PI) / 180) * (i % 2 ? -1 : 1) * 0.6;
    const bl: P = [x, baseY];
    const br: P = [x + ww, baseY - dz];
    // Paper that has just swung out still flutters a little at its top.
    const flutter = (1 - k) * height * 0.05;
    const tl: P = [x, baseY - height];
    const tr: P = [x + ww, baseY - dz - height + flutter];
    quads.push({ q: [bl, br, tr, tl], lit: i % 2 === 0, script: 7 });
    shadow += poly([bl, br, [br[0] + ww * 0.08, br[1] + height * 0.05], [bl[0] + ww * 0.08, bl[1] + height * 0.05]]) + " ";
    // A signature on every fold, written as the fold opens: the ones between
    // the allies are the ones that show.
    if (k > 0.4) {
      const s = clamp((k - 0.4) / 0.6);
      const sx = x + ww * 0.18;
      const sy = baseY - height * 0.3;
      const sw = ww * 0.64 * s;
      sig += `M${f1(sx)} ${f1(sy)} c${f1(sw * 0.15)} ${f1(-height * 0.1)} ${f1(sw * 0.25)} ${f1(height * 0.06)} ${f1(sw * 0.4)} ${f1(-height * 0.02)} s${f1(sw * 0.3)} ${f1(-height * 0.08)} ${f1(sw * 0.6)} ${f1(height * 0.02)} `;
    }
    x += ww;
  }
  writeLeaves(svg, quads, shadow);
  setD(svg.querySelector(".print-signature"), sig);
};

/** The impact: a screen standing up in front of every figure, left to right. */
const screens: Frame = (el, p, age, ctx) => {
  const svg = el.querySelector("svg");
  const figs = figures(ctx);
  if (!svg || !figs.length) return;
  const o = params(el);
  const hit = pn(o, "hit", 0.05);
  const stagger = pn(o, "stagger", 0.035);
  const all: { q: Quad; lit: boolean; script: number }[] = [];
  let shadow = "";
  const tops: P[] = [];
  figs.forEach((f, i) => {
    // Every screen is standing on the drawn frame itself, so the hit-stop
    // holds the result; after it, each springs past its height and settles,
    // one after another from the Broker outward.
    if (p < hit) return;
    const t = hit + i * stagger;
    const since = Math.max(0, p - t);
    const k = 1 + Math.sin(clamp(since / 0.22) * Math.PI * 2.5) * 0.09 * (1 - clamp(since / 0.22));
    const shiver = Math.sin(age / 26) * 0.02 * Math.exp(-since * 9);
    const scale = f.id === "caster" ? pn(o, "casterScale", 1) : 1;
    const h = f.h * pn(o, "height", 0.6) * scale;
    const w = f.h * pn(o, "leaf", 0.17) * scale;
    const ox = pn(o, "ox", 0.22);
    const x = f.x + f.h * (f.id === "caster" ? pn(o, "casterOx", ox) : ox) * scale;
    const s = screen(x, f.y + pn(o, "oy", 6), h, w, 3, k + shiver, w * 0.32, pn(o, "lean", -0.05));
    all.push(...s.quads);
    shadow += s.shadow;
    tops.push(s.quads[0].q[3], s.quads[s.quads.length - 1].q[2]);
  });
  writeLeaves(svg, all, shadow);
  // The crease they stand on, pulled taut from the Broker's hand along the top
  // of every screen: bright and wide on the snap, a thin line after.
  const caster = ctx.actor("caster");
  let taut = "";
  if (caster && tops.length && p >= hit) {
    const hand: P = [caster.x + caster.h * pn(o, "hx", 0.1), caster.y - caster.h * pn(o, "hy", 0.72)];
    taut = `M${f1(hand[0])} ${f1(hand[1])} ` + tops.map((q) => `L${f1(q[0])} ${f1(q[1])}`).join(" ");
    // And on out of the frame: the policy is longer than the party.
    const end = tops[tops.length - 1];
    const run = pn(o, "tautEnd", 0) - end[0];
    if (run > 0) taut += ` L${f1(end[0] + run)} ${f1(end[1] + run * pn(o, "tautSlope", 0))}`;
  }
  setD(svg.querySelector(".print-taut"), taut);
  setD(svg.querySelector(".print-taut-glow"), taut);
  setStyle(svg, "--taut", clamp(1 - (p - hit) / 0.3).toFixed(3));
};

/** The detail: the fat folded policy in the hand, its folds riffling past the thumb. */
const wad: Frame = (el, p, _age, ctx) => {
  const svg = el.querySelector("svg");
  const caster = ctx.actor("caster");
  if (!svg || !caster) return;
  const o = params(el);
  const h = caster.h;
  const cx = caster.x + h * pn(o, "ox", 0.3);
  const cy = caster.y - h * pn(o, "oy", 0.55);
  const W = h * pn(o, "w", 0.22);
  const H = h * pn(o, "h", 0.3);
  const leavesN = 14;
  const quads: { q: Quad; lit: boolean; script: number }[] = [];
  // The thumb runs across the top of the stack from the back fold to the front:
  // each fold's top edge is flicked forward as the thumb passes and slaps back,
  // so a wave of flicks runs through the block, faster as it goes — twice.
  const thick = W * 0.045;
  for (let i = 0; i < leavesN; i++) {
    let tip = 0;
    for (const [from, to] of [
      [0.06, 0.5],
      [0.46, 0.86],
    ]) {
      const wave = ease("in", clamp((p - from) / (to - from))) * (leavesN + 3) - 1.5;
      const d = wave - i;
      // Up fast as the thumb reaches it, back down a beat after.
      tip = Math.max(tip, d < 0 ? Math.max(0, 1 + d * 2.2) : Math.max(0, 1 - d * 0.9));
    }
    const a = ((-3 + i * 0.4) + tip * 52) * (Math.PI / 180);
    // Hinged along the bottom, where the hand grips it; each fold a hair
    // further forward than the one behind, so the block has thickness.
    const x0 = cx - W / 2 + i * thick;
    const y0 = cy - i * thick * 0.25;
    const bl: P = [x0, y0];
    const br: P = [x0 + W, y0 - W * 0.05];
    const top: P = [Math.sin(a) * H, -Math.cos(a) * H];
    // Only the front fold, and a fold while it is flicked open, shows its face.
    const shows = i === leavesN - 1 || tip > 0.35;
    quads.push({ q: [bl, br, [br[0] + top[0], br[1] + top[1]], [bl[0] + top[0], bl[1] + top[1]]], lit: i % 2 === 0, script: shows ? 4 : 0 });
  }
  writeLeaves(svg, quads);
};

/** Out of one shot and off the next: a sheet turning over the lens. */
const turn: Frame = (el, p) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const o = params(el);
  const out = o.mode === "out";
  // The turning edge crosses the frame right to left: arriving, it covers; leaving, it uncovers.
  const k = out ? ease("in", p) : ease("out", p);
  const edge = out ? lerp(1100, 0, k) : lerp(0, -1100, k);
  const bulge = Math.sin(k * Math.PI) * 180;
  // What is covered: everything right of the edge (arriving) or left of it (leaving).
  const face = out
    ? `M${f1(edge)} -20 Q${f1(edge - bulge)} 500 ${f1(edge)} 1020 L1100 1020 L1100 -20 Z`
    : `M-100 -20 L${f1(edge + 1100)} -20 Q${f1(edge + 1100 + bulge)} 500 ${f1(edge + 1100)} 1020 L-100 1020 Z`;
  setD(svg.querySelector(".print-turn-face"), face);
  const lip = out ? edge : edge + 1100;
  setD(svg.querySelector(".print-turn-back"), `M${f1(lip)} -20 Q${f1(lip - bulge * (out ? 1.6 : -1.6))} 500 ${f1(lip)} 1020 Z`);
  setD(svg.querySelector(".print-turn-crease"), `M${f1(lip)} -20 Q${f1(lip - bulge * (out ? 1 : -1))} 500 ${f1(lip)} 1020`);
  setD(svg.querySelector(".print-turn-shadow"), `M${f1(lip)} -20 Q${f1(lip - bulge)} 500 ${f1(lip)} 1020 L${f1(lip + (out ? -140 : 140))} 1020 L${f1(lip + (out ? -140 : 140))} -20 Z`);
  let rules = "";
  for (let i = 1; i < 14; i++) {
    const y = i * 72;
    rules += out ? `M${f1(Math.max(edge, 0) + 60)} ${y} L1060 ${y} ` : `M-60 ${y} L${f1(edge + 1040)} ${y} `;
  }
  setD(svg.querySelector(".print-turn-rules"), rules);
};

/** The small print scrolls up across the lenses as the eyes read it. */
const lens: Frame = (el, p) => {
  const g = el.querySelector<SVGGElement>(".print-lens-scroll");
  if (!g) return;
  const o = params(el);
  const r = pn(o, "r", 40);
  const s = r / 60;
  setTransform(g, `scale(${s.toFixed(3)}) translate(0px, ${(-p * 64).toFixed(1)}px)`);
};

const crack: Frame = (el, p) => {
  setStyle(el, "--k", ease("out", clamp(p / 0.35)).toFixed(3));
};

/** On the board: each screen stands up with an overshoot and a shiver. */
const cover: Frame = (el, p, age) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const k = ease("back", clamp(p / 0.28));
  const shiver = Math.sin(age / 30) * 0.04 * Math.exp(-p * 6);
  const s = screen(0, 0, 96, 30, 3, Math.max(0, k + shiver), 10, -0.05);
  writeLeaves(svg, s.quads, s.shadow);
};

const slip: Frame = (el, p) => {
  setStyle(el, "--k", ease("back", clamp((p - 0.3) / 0.4)).toFixed(3));
};

/** The bill: a folded slip from the Broker's hand into the treasury. */
const bill: Frame = (el, p, age) => {
  const box = el.querySelector<HTMLElement>(".print-bill-box");
  const root = el.closest<HTMLElement>(".ult-cinematic");
  if (!box || !root) return;
  let node = box.firstElementChild as HTMLElement | null;
  if (!node) {
    node = document.createElement("div");
    node.className = "print-bill";
    node.innerHTML =
      '<svg viewBox="-30 -20 60 40"><path d="M-26 -14 L22 -17 L26 13 L-22 16 Z" fill="#efe3c6" stroke="#1d160f" stroke-width="2.4" stroke-linejoin="round"/><path d="M-16 -6 H14 M-16 1 H10 M-16 8 H4" stroke="#1d160f" stroke-width="2" opacity="0.55"/><path d="M-26 -14 L22 -17" stroke="#8b95ff" stroke-width="3"/></svg>';
    box.appendChild(node);
  }
  const ox = parseFloat(el.style.left) || 0;
  const oy = parseFloat(el.style.top) || 0;
  const rootBox = root.getBoundingClientRect();
  const t = document.querySelector<HTMLElement>(".strip-treasury")?.getBoundingClientRect();
  const ah = parseFloat(el.style.getPropertyValue("--ah")) || 120;
  const from: P = [ah * 0.25, -ah * 0.55];
  const to: P = t && t.width ? [t.left + t.width * 0.3 - rootBox.left - ox, t.top + t.height / 2 - rootBox.top - oy] : [from[0], from[1] - 400];
  const o = params(el);
  const start = pn(o, "start", 0.3);
  const k = clamp((p - start) / 0.4);
  if (k <= 0 || k >= 1) {
    setStyle(node, "opacity", "0");
    return;
  }
  const kk = ease("inOut", k);
  const apex = Math.min(from[1], to[1]) - ah * 0.6;
  const x = lerp(from[0], to[0], kk);
  const y = (1 - kk) ** 2 * from[1] + 2 * (1 - kk) * kk * apex + kk ** 2 * to[1];
  const size = ah * 0.62 * (1 - kk * 0.5);
  setStyle(node, "opacity", k > 0.9 ? ((1 - k) * 10).toFixed(2) : "1");
  setStyle(node, "width", `${size.toFixed(1)}px`);
  setStyle(node, "height", `${(size * 0.66).toFixed(1)}px`);
  setTransform(node, `translate3d(${(x - size / 2).toFixed(1)}px, ${(y - size / 3).toFixed(1)}px, 0) rotate(${(Math.sin(age / 90) * 14 - 8).toFixed(1)}deg)`);
};

/* ── Registered ────────────────────────────────────────────────────────── */

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "print-slip": Slip,
  "print-wad": Wad,
  "print-turn": Turn,
  "print-policy": Policy,
  "print-lens": Lens,
  "print-margin": Margin,
  "print-crack": Crack,
  "print-screens": Screens,
  "print-cover": Cover,
  "print-bill": Bill,
};

export const frames: Record<string, Frame> = {
  "print-slip": slip,
  "print-wad": wad,
  "print-turn": turn,
  "print-policy": policy,
  "print-lens": lens,
  "print-crack": crack,
  "print-screens": screens,
  "print-cover": cover,
  "print-bill": bill,
};

