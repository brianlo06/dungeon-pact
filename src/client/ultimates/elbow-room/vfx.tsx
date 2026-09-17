import type { CSSProperties, ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * Elbow Room's effects.
 *
 * The idea they serve: a swing wider than the street it is swung in. So the
 * film's one shape is **the swing seen from the side**: a flat circle is an
 * ellipse, and a flat swing's wake is a band laid round that ellipse — its far
 * half behind the row at shoulder height, its near half in front of them down
 * at their shins — so the row stands *inside* it, and it runs out past both
 * ends of the lane. Everything else is what that swing does to a lane:
 * plaster knocked out of the walls, a gouge torn level along the far houses,
 * a post splintered past the lens, the sawdust lifted off the cobbles in one
 * flat sheet, and on the board a bank of sawdust swept in front of each unit.
 *
 *   elbow-lane      the Shambles' house-fronts leaning in over the real board
 *                   from both edges of the screen (`in`), or pushed back out
 *   elbow-eaves     a jetty beam and an empty hook just over the head
 *   elbow-plaster   plaster knocked off a wall: chunks, flakes and a puff
 *   elbow-post      a timber post the wound-up blade bites into
 *   elbow-cat       the lane cat on a bench in the dark, getting down
 *   elbow-sweep     the swing: one half of the band (`half`: far or near)
 *   elbow-gouge     the level gouge torn along the far wall, left to right
 *   elbow-sawdust   the sawdust lifted off the cobbles in a flat sheet
 *   elbow-splinter  a near post splintering, thrown past the lens
 *   elbow-board     on the board after: a curved bank of swept sawdust
 *
 * Nothing is filtered, nothing is blurred, and nothing re-renders React while
 * it plays: flecks fly on `--p`, and the swing and the gouge are paths
 * rewritten in frame functions from where the stage placed the cast.
 */

export const TEAL = "#5fd9c4";
export const WAKE = "#d4fbf1";
export const INK = "#0b0809";
const PLASTER = ["#c79a8c", "#d8b28a", "#b58b4a", "#9b6d63"];
const SAWDUST = ["#e4c58c", "#cfa86a", "#f0d9a8"];

const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const f1 = (x: number) => x.toFixed(1);

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
type Params = Record<string, number | string | boolean>;

const setD = (el: Element | null | undefined, d: string) => {
  if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
};
const setStyle = (el: HTMLElement | SVGElement | null | undefined, name: string, value: string) => {
  if (el && el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
};
const params = (el: HTMLElement): Params => {
  const holder = el as HTMLElement & { _elbow?: Params };
  if (holder._elbow) return holder._elbow;
  const src = el.querySelector<SVGElement | HTMLElement>("[data-params]");
  holder._elbow = src ? JSON.parse(src.dataset.params ?? "{}") : {};
  return holder._elbow!;
};
const pn = (o: Params, k: string, d: number) => {
  const x = Number(o[k]);
  return Number.isFinite(x) ? x : d;
};
const easeIn = (k: number) => k * k;
const easeOut = (k: number) => 1 - (1 - k) * (1 - k);

/** World-sized: an SVG over the whole stage, drawn in world units. */
const World = ({ cue, className, children }: { cue: VfxProps["cue"]; className: string; children?: ReactNode }) => (
  <svg className={`elbow-world ${className}`} viewBox="0 0 1600 900" data-params={JSON.stringify(cue.params ?? {})} aria-hidden="true">
    {children}
  </svg>
);

/* ── The lane closing in over the board ────────────────────────────────── */

/** One side of the lane, as a silhouette: storeys jettied further out the higher they go. */
const HOUSE = "M0 0 H190 V120 H232 V300 H268 V520 H300 V700 H286 V1000 H0 Z";

const Lane = ({ cue }: VfxProps) => {
  const phase = String(cue.params?.phase ?? "in");
  const side = (s: "left" | "right") => (
    <svg className={`elbow-lane-side ${s}`} viewBox="0 0 320 1000" preserveAspectRatio="none" aria-hidden="true">
      <path d={HOUSE} fill="#0f0b0c" />
      {/* Plaster panels in the dusk, between the timbers. */}
      <g fill="#3a2a28" opacity={0.85}>
        <rect x={12} y={20} width={150} height={80} />
        <rect x={12} y={140} width={196} height={140} />
        <rect x={12} y={320} width={230} height={180} />
        <rect x={12} y={540} width={262} height={140} />
      </g>
      <g stroke="#0f0b0c" strokeWidth={12}>
        <path d="M90 140 V280 M130 320 L20 500 M150 540 V680 M40 720 V1000" />
      </g>
      <path d={HOUSE} fill="none" stroke="#060405" strokeWidth={6} />
      {/* Hooks under the lowest jetty. */}
      <g stroke="#060405" strokeWidth={5} fill="none" strokeLinecap="round">
        {[60, 130, 200, 262].map((x, i) => (
          <path key={i} d={`M${x} 700 V${744 + (i % 2) * 8} q0 18 -12 18 q-10 0 -10 -10`} />
        ))}
      </g>
    </svg>
  );
  return (
    <div className="elbow-lane" data-phase={phase}>
      {side("left")}
      {side("right")}
    </div>
  );
};

/* ── The beam over the head ────────────────────────────────────────────── */

const Eaves = ({ cue }: VfxProps) => {
  const w = Number(cue.params?.w ?? 1400);
  const hx = Number(cue.params?.hook ?? 0.12) * w;
  return (
    <svg className="elbow-eaves" viewBox={`${-w / 2} -120 ${w} 360`} style={{ width: w, height: 360 }} aria-hidden="true">
      {/* The plaster above the beam, and the beam itself: a squared oak joist, end-on to the lane, pegged. */}
      <rect x={-w / 2} y={-120} width={w} height={40} fill="#3a2826" />
      <rect x={-w / 2} y={-86} width={w} height={96} fill="#3d2b24" stroke={INK} strokeWidth={8} />
      <rect x={-w / 2} y={-8} width={w} height={18} fill="#1a1110" /><path d={`M${-w / 2} -78 H${w / 2}`} stroke="#7a5c48" strokeWidth={6} />
      <path d={`M${-w / 2} -62 H${w / 2} M${-w / 2} -30 H${w / 2}`} stroke="#241915" strokeWidth={4} opacity={0.8} />
      {[-0.34, -0.02, 0.3].map((k, i) => (
        <circle key={i} cx={f1(k * w)} cy={-38} r={10} fill="#3a2e2c" stroke={INK} strokeWidth={4} />
      ))}
      {/* One empty hook, hanging just off the beam. */}
      <path className="elbow-eaves-hook" d={`M${f1(hx)} 8 V120 q0 50 -34 50 q-26 0 -26 -26`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d={`M${f1(hx - 3)} 12 V118`} stroke="#5c5250" strokeWidth={3} opacity={0.6} />
    </svg>
  );
};

/* ── Plaster knocked off ───────────────────────────────────────────────── */

const Plaster = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 3);
  const p = cue.params ?? {};
  const n = Number(p.n ?? 14);
  const dir = Number(p.dir ?? 90);
  const spread = Number(p.spread ?? 90);
  const reach = Number(p.reach ?? 90);
  const size = Number(p.size ?? 14);
  const fall = Number(p.fall ?? 160);
  return (
    <div className="elbow-plaster">
      <i className="elbow-puff" style={v({ "--pr": `${reach * 0.9}px` })} />
      {Array.from({ length: n }, (_, i) => {
        const a = ((dir + (rand() - 0.5) * spread) * Math.PI) / 180;
        const r = reach * (0.3 + rand() * 0.7);
        const s = size * (0.4 + rand() * 0.9);
        return (
          <b
            key={i}
            style={v({
              "--dx": `${f1(Math.cos(a) * r)}px`,
              "--dy": `${f1(Math.sin(a) * r)}px`,
              "--fall": `${f1(fall * (0.5 + rand() * 0.6))}px`,
              "--sz": `${f1(s)}px`,
              "--sp": `${f1((rand() - 0.5) * 540)}deg`,
              "--d": (rand() * 0.12).toFixed(3),
              "--pc": PLASTER[Math.floor(rand() * PLASTER.length)],
              "--shape": `${Math.floor(rand() * 40)}% ${Math.floor(20 + rand() * 60)}% ${Math.floor(rand() * 50)}% ${Math.floor(10 + rand() * 50)}%`,
            })}
          />
        );
      })}
    </div>
  );
};

/* ── The post the wind-up bites ────────────────────────────────────────── */

const Post = ({ cue }: VfxProps) => {
  const p = cue.params ?? {};
  const h = Number(p.h ?? 700);
  const by = Number(p.by ?? 0.42);
  return (
    <svg className="elbow-post" viewBox={`-120 ${-h} 240 ${h}`} style={v({ "--ph": `${h}px`, "--hit": Number(p.hit ?? 0.5) })} aria-hidden="true">
      <rect x={-120} y={-h} width={240} height={h} fill="#6e4a45" opacity={0} />
      <rect x={-34} y={-h} width={68} height={h} fill="#171011" stroke={INK} strokeWidth={6} />
      <path d={`M-20 ${-h} V0 M12 ${-h} V0`} stroke="#2a1f1e" strokeWidth={4} opacity={0.8} />
      {/* The bite: a notch hacked out of the post where the point went in. */}
      <path className="elbow-post-bite" d={`M-36 ${-h * by - 22} L-2 ${-h * by - 6} L-30 ${-h * by + 18} Z`} fill="#c9a079" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path className="elbow-post-bite" d={`M-2 ${-h * by - 6} L-36 ${-h * by + 2}`} stroke="#6b4a33" strokeWidth={3} />
    </svg>
  );
};

/* ── The lane cat ──────────────────────────────────────────────────────── */

const Cat = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 9);
  const grain = Array.from({ length: 16 }, () => `M${f1(-900 + rand() * 1800)} ${f1(560 + rand() * 30)} h${f1(40 + rand() * 120)}`).join(" ");
  return (
    <div className="elbow-cat">
      <svg viewBox="-800 -450 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="elbow-cat-gleam" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={TEAL} stopOpacity="0.5" />
            <stop offset="1" stopColor={TEAL} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x={-800} y={-450} width={1600} height={900} fill="#060506" />
        <g transform="translate(-60 -330)">
        {/* The bench's edge and a sliver of the shutter chain: the only other things. */}
        <path d="M-800 540 L800 520 L800 610 L-800 640 Z" fill="#1a1312" />
        <path d="M-800 540 L800 520" stroke="#3b2c26" strokeWidth={6} />
        <path d={grain} stroke="#241a18" strokeWidth={3} />
        <path d="M560 -450 V300" stroke="#141011" strokeWidth={8} strokeDasharray="22 10" />
        <ellipse cx={40} cy={-40} rx={420} ry={260} fill="url(#elbow-cat-gleam)" className="elbow-cat-glow" />
        {/* The cat: black on black, seen by its edge and its eyes. */}
        <g className="elbow-cat-body">
          <path
            d="M-420 540 C-430 380 -330 250 -170 230 C-60 216 60 230 150 250 C190 170 230 110 250 60 L290 150 L350 160 L400 40 L440 150 C520 200 540 300 510 380 C490 440 420 480 330 500 C240 530 120 540 -420 540 Z"
            fill="#0d0a0c"
            stroke="#557d77"
            strokeWidth={5}
          />
          <path className="elbow-cat-tail" d="M-400 520 C-560 520 -640 470 -660 380 C-676 300 -620 250 -580 270" stroke="#0d0a0c" strokeWidth={44} fill="none" strokeLinecap="round" />
          <path className="elbow-cat-tail" d="M-400 520 C-560 520 -640 470 -660 380 C-676 300 -620 250 -580 270" stroke="#557d77" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} />
          <g className="elbow-cat-ear left">
            <path d="M250 70 L270 -40 L330 60 Z" fill="#0d0a0c" stroke="#557d77" strokeWidth={5} strokeLinejoin="round" />
          </g>
          <g className="elbow-cat-ear right">
            <path d="M370 60 L430 -46 L450 90 Z" fill="#0d0a0c" stroke="#557d77" strokeWidth={5} strokeLinejoin="round" />
          </g>
          <g className="elbow-cat-eyes">
            {[
              [300, 220],
              [420, 214],
            ].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <ellipse rx={34} ry={24} fill={TEAL} stroke={INK} strokeWidth={5} />
                <ellipse className="elbow-cat-pupil" rx={7} ry={20} fill={INK} />
                <circle cx={-10} cy={-8} r={5} fill="#f2fffb" />
              </g>
            ))}
          </g>
        </g>
        </g>
      </svg>
    </div>
  );
};

/* ── The swing ─────────────────────────────────────────────────────────── */

const Sweep = ({ cue }: VfxProps) => (
  <World cue={cue} className={`elbow-sweep half-${String(cue.params?.half ?? "near")}`}>
    <path className="elbow-sweep-body" />
    <path className="elbow-sweep-hatch" />
    <path className="elbow-sweep-edge" />
  </World>
);

/**
 * Where the swing's ellipse lies this frame, from where the stage placed the
 * cast: from behind the Butcher's back shoulder to past the far edge of the
 * last figure in the row, centred at `lift` of the Butcher's height, `ry` of
 * its height deep. `from`…`hit` (ms into the cue) is the swing arriving; it
 * is whole on `hit` and thins away over `fade` ms after it.
 */
function ellipse(o: Params, ctx: VfxContext) {
  const caster = ctx.actor("caster");
  if (!caster) return null;
  let right = caster.x + caster.h * 0.6;
  for (let i = 0; i < 6; i++) {
    const t = ctx.actor(`targets-${i}`);
    if (t) right = Math.max(right, t.x + t.h * pn(o, "past", 0.5));
  }
  const left = caster.x - caster.h * pn(o, "behind", 0.35) - pn(o, "overL", 0);
  right += pn(o, "overR", 0);
  const cx = (left + right) / 2;
  const rx = (right - left) / 2;
  const cy = caster.y - caster.h * pn(o, "lift", 0.42);
  const ry = caster.h * pn(o, "ry", 0.24);
  return { cx, cy, rx, ry, h: caster.h };
}

/** How much of the swing has arrived (`head`) and how much has already gone (`tail`), and its strength. */
function swingAt(o: Params, age: number) {
  const from = pn(o, "from", 60);
  const hit = pn(o, "hit", 130);
  const fade = pn(o, "fade", 260);
  const head = easeIn(clamp((age - from) / Math.max(1, hit - from)));
  const gone = clamp((age - hit - pn(o, "hold", 150)) / fade);
  return { head, tail: head * (0.05 + easeOut(gone) * 0.95), alpha: 1 - gone };
}

const sweep: Frame = (el, _p, age, ctx) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const o = params(el);
  const e = ellipse(o, ctx);
  const { head, tail, alpha } = swingAt(o, age);
  const body = svg.querySelector(".elbow-sweep-body");
  const hatch = svg.querySelector(".elbow-sweep-hatch");
  const edge = svg.querySelector(".elbow-sweep-edge");
  if (!e || head <= 0.001 || alpha <= 0) {
    setD(body, "");
    setD(hatch, "");
    setD(edge, "");
    return;
  }
  const near = o.half !== "far";
  // Along the half, left (0) to right (1): the near half dips below the centre, the far half rises above it.
  const at = (s: number, dr = 0): [number, number] => {
    const t = Math.PI * (near ? 1 - s : 1 + s);
    return [e.cx + Math.cos(t) * (e.rx + dr), e.cy + Math.sin(t) * (e.ry + dr * (e.ry / e.rx))];
  };
  const W = e.h * pn(o, "w", 0.2) * (near ? 1 : 0.75);
  const steps = 40;
  const top: string[] = [];
  const bottom: string[] = [];
  const lead: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const s = lerp(tail, head, i / steps);
    const k = (i / steps) ** 1.3;
    const w = W * (0.08 + 0.92 * k) * (0.35 + 0.65 * alpha);
    const [x, y] = at(s);
    // Thick on its outer side: under the near half, over the far half.
    const out = near ? 0.62 : -0.62;
    top.push(`${f1(x)} ${f1(y - w * (near ? 0.38 : 0.62))}`);
    bottom.push(`${f1(x)} ${f1(y + w * (near ? 0.62 : 0.38))}`);
    lead.push(`${f1(x)} ${f1(y + w * out)}`);
  }
  setD(body, `M${top.join(" L")} L${bottom.reverse().join(" L")} Z`);
  setD(edge, `M${lead.join(" L")}`);
  // Speed hatching: short strokes along the band, thickest towards its head.
  let d = "";
  const rand = seeded(near ? 7 : 11);
  for (let i = 0; i < 26; i++) {
    const s0 = lerp(tail, head, rand() * 0.92);
    const len = 0.03 + rand() * 0.07;
    const s1 = Math.min(head, s0 + len);
    const k = (s0 - tail) / Math.max(0.001, head - tail);
    const off = (rand() - 0.5) * W * 0.6 * k;
    const [ax, ay] = at(s0);
    const [bx, by] = at(s1);
    d += `M${f1(ax)} ${f1(ay + off)} L${f1(bx)} ${f1(by + off)} `;
  }
  setD(hatch, d.trim());
  setStyle(svg, "opacity", alpha.toFixed(3));
};

/* ── The gouge along the far wall ──────────────────────────────────────── */

const Gouge = ({ cue }: VfxProps) => (
  <World cue={cue} className="elbow-gouge">
    <path className="elbow-gouge-rim" />
    <path className="elbow-gouge-cut" />
    <path className="elbow-gouge-lath" />
  </World>
);

/** A ragged level gash from `x0` to `x1` at world `y`, torn from left to right as the swing arrives. */
const gouge: Frame = (el, _p, age) => {
  const svg = el.querySelector("svg");
  if (!svg) return;
  const o = params(el);
  const x0 = pn(o, "x0", -200);
  const x1 = pn(o, "x1", 1800);
  const y = pn(o, "y", 520);
  const h = pn(o, "h", 30);
  const slope = pn(o, "slope", 0);
  const from = pn(o, "from", 60);
  const hit = pn(o, "hit", 130);
  const k = easeIn(clamp((age - from) / Math.max(1, hit - from)));
  if (k <= 0) {
    setD(svg.querySelector(".elbow-gouge-rim"), "");
    setD(svg.querySelector(".elbow-gouge-cut"), "");
    setD(svg.querySelector(".elbow-gouge-lath"), "");
    return;
  }
  const end = lerp(x0, x1, k);
  const rand = seeded(pn(o, "seed", 21));
  const top: string[] = [];
  const bot: string[] = [];
  const rimT: string[] = [];
  const rimB: string[] = [];
  let lath = "";
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const x = lerp(x0, end, i / steps);
    const yy = y + (x - x0) * slope;
    // The tip of the tear is thinner: it is still being torn.
    const taper = clamp((end - x) / 90);
    const hh = h * (0.4 + 0.6 * taper) * (0.75 + rand() * 0.5);
    const up = hh * (0.4 + rand() * 0.25);
    const down = hh - up;
    top.push(`${f1(x)} ${f1(yy - up)}`);
    bot.push(`${f1(x)} ${f1(yy + down)}`);
    rimT.push(`${f1(x)} ${f1(yy - up - 6 - rand() * 12)}`);
    rimB.push(`${f1(x)} ${f1(yy + down + 5 + rand() * 10)}`);
    if (i % 5 === 2) lath += `M${f1(x - 10)} ${f1(yy - up * 0.3)} L${f1(x + 12)} ${f1(yy + down * 0.2)} `;
  }
  setD(svg.querySelector(".elbow-gouge-rim"), `M${rimT.join(" L")} L${rimB.reverse().join(" L")} Z`);
  setD(svg.querySelector(".elbow-gouge-cut"), `M${top.join(" L")} L${bot.reverse().join(" L")} Z`);
  setD(svg.querySelector(".elbow-gouge-lath"), lath.trim());
};

/* ── Sawdust ───────────────────────────────────────────────────────────── */

const Sawdust = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 31);
  const p = cue.params ?? {};
  const n = Number(p.n ?? 70);
  const w = Number(p.w ?? 1400);
  const lift = Number(p.lift ?? 120);
  const drift = Number(p.drift ?? 180);
  const lag = Number(p.lag ?? 0.12);
  const size = Number(p.size ?? 9);
  return (
    <div className="elbow-sawdust">
      {Array.from({ length: n }, (_, i) => {
        const x = (rand() - 0.5) * w;
        return (
          <i
            key={i}
            style={v({
              "--x": `${f1(x)}px`,
              "--y": `${f1((rand() - 0.5) * 40)}px`,
              "--dx": `${f1(drift * (0.4 + rand() * 0.8))}px`,
              "--dy": `${f1(-lift * (0.3 + rand() * 0.9))}px`,
              "--sz": `${f1(size * (0.5 + rand()))}px`,
              "--sp": `${f1((rand() - 0.5) * 720)}deg`,
              // The wake passes left to right, so the sheet lifts in that order.
              "--d": (((x / w + 0.5) * lag) + rand() * 0.02).toFixed(3),
              "--pc": SAWDUST[Math.floor(rand() * SAWDUST.length)],
            })}
          />
        );
      })}
    </div>
  );
};

/* ── A post splintered past the lens ───────────────────────────────────── */

const Splinter = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 41);
  const n = Number(cue.params?.n ?? 7);
  return (
    <div className="elbow-splinter">
      {Array.from({ length: n }, (_, i) => {
        const len = 90 + rand() * 220;
        return (
          <svg
            key={i}
            viewBox="-10 -120 20 240"
            preserveAspectRatio="none"
            style={v({
              "--sx": `${f1(-6 + rand() * 24)}%`,
              "--sy": `${f1(62 + rand() * 30)}%`,
              "--tx": `${f1(-12 - rand() * 30)}vw`,
              "--ty": `${f1(8 + rand() * 24)}vh`,
              "--len": `${f1(len)}px`,
              "--sp": `${f1(120 + rand() * 400)}deg`,
              "--r0": `${f1(rand() * 180)}deg`,
              "--d": (rand() * 0.08).toFixed(3),
            })}
            aria-hidden="true"
          >
            <path d="M0 -120 L9 -40 L5 30 L8 120 L-6 110 L-9 20 L-4 -60 Z" fill="#1a1112" stroke={INK} strokeWidth={2} />
            <path d="M1 -100 L4 -20 L2 80" stroke="#8a6a52" strokeWidth={2} fill="none" />
          </svg>
        );
      })}
    </div>
  );
};

/* ── The glare behind the row ──────────────────────────────────────────── */

/**
 * A pale field laid behind the cast, above the lane's exposure: on the
 * two-tone frame it is what turns teal while every figure goes to ink, so
 * the row reads as silhouettes inside the swing; then it sinks away and the
 * lane's own colour comes back.
 */
const Glare = ({ cue }: VfxProps) => (
  <div className="elbow-glare" style={v({ "--gw": `${Number(cue.params?.w ?? 1500)}px`, "--gh": `${Number(cue.params?.h ?? 520)}px`, "--hold": Number(cue.params?.hold ?? 0.2) })} />
);

/* ── On the board ──────────────────────────────────────────────────────── */

const Board = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 61);
  // The swing's wake on the floor: the sawdust where the unit stood swept into one long
  // curved bank, like snow off a plough, with a scatter left on the swept floor behind it.
  const flecks = Array.from({ length: 34 }, () => {
    const x = (rand() - 0.5) * 1.0;
    const y = 0.12 + rand() * 0.2 - x * x * 0.25;
    return { x, y, r: 0.02 + rand() * 0.03, a: rand() * 180, c: SAWDUST[Math.floor(rand() * SAWDUST.length)] };
  });
  return (
    <div className="elbow-board">
      <svg viewBox="-0.6 -0.2 1.2 1.2" aria-hidden="true">
        <g className="elbow-board-skid">
          {flecks.map((fl, i) => (
            <rect key={i} x={fl.x.toFixed(3)} y={fl.y.toFixed(3)} width={fl.r.toFixed(3)} height={(fl.r * 0.5).toFixed(3)} fill={fl.c} opacity={0.8} transform={`rotate(${fl.a.toFixed(0)} ${fl.x.toFixed(3)} ${fl.y.toFixed(3)})`} />
          ))}
        </g>
        <g className="elbow-board-bank">
          <path d="M-0.58 0.3 Q0 0.6 0.58 0.3 Q0.3 0.5 0 0.52 Q-0.3 0.5 -0.58 0.3 Z" fill="#1a120e" opacity={0.45} transform="translate(0 0.05)" />
          <path d="M-0.58 0.3 Q0 0.6 0.58 0.3 Q0.3 0.5 0 0.52 Q-0.3 0.5 -0.58 0.3 Z" fill="#e4c58c" stroke="#5b4329" strokeWidth={0.015} />
          <path d="M-0.4 0.36 Q0 0.52 0.4 0.36" stroke="#fff0cc" strokeWidth={0.02} fill="none" opacity={0.7} />
        </g>
      </svg>
    </div>
  );
};

/* ── The row swept back ────────────────────────────────────────────────── */

/**
 * The row thrown back down the lane. The engine gives a target no clip of
 * this film's and an actor cue no lift, so this moves each target copy's
 * drawing (`.cine-look`, which nothing else in the film touches) from its
 * feet: snapped away from the Butcher on the frame the band reaches it, lifted
 * off its feet and tipped hard back, landing and sliding on; the nearest
 * first, the rest as the band gets to them. Its `hurt` still plays inside it.
 * Ahead of each figure, in the way it travels, a bow wave of sawdust is kicked
 * up off the cobbles. A boss is not lifted: it rocks back hard and slides a
 * shorter way.
 *
 * Params (world units and ms of the cue's age): `hit` when the band reaches
 * the last of the row, `lead` how much sooner it reaches each nearer one,
 * `push`, `slide`, `lift`, `tilt` (degrees), `settle` (the tilt kept).
 */
const Knock = ({ cue }: VfxProps) => (
  <World cue={cue} className="elbow-knock">
    <path className="elbow-knock-wave" />
    <path className="elbow-knock-wave-dark" />
  </World>
);

interface Flight {
  dx: number;
  dy: number;
  rot: number;
  squash: number;
  /** How hard the bow wave is kicking, 0…1, and how far it has travelled. */
  wave: number;
  since: number;
}

function flight(since: number, o: Params, further = 1): Flight {
  if (since < 0) return { dx: 0, dy: 0, rot: 0, squash: 1, wave: 0, since };
  const push = pn(o, "push", 300) * further;
  const slide = pn(o, "slide", 90) * further;
  const lift = pn(o, "lift", 70);
  const tilt = pn(o, "tilt", 30);
  const settle = pn(o, "settle", 0.45);
  const air = pn(o, "air", 300);
  // Snapped a third of the way on the frame it is struck: the held frame shows it going.
  const throwK = 0.32 + 0.68 * easeOut(clamp(since / air));
  const slideK = easeOut(clamp((since - air) / 360));
  const dx = push * throwK + slide * slideK;
  const inAir = since < air ? Math.sin(Math.PI * (0.18 + 0.82 * (since / air))) : 0;
  const dy = -lift * Math.max(0, inAir);
  const land = clamp((since - air) / 90);
  const rot = tilt * (since < air ? 0.7 + 0.3 * easeOut(clamp(since / 120)) : 1 - (1 - settle) * easeOut(clamp((since - air) / 320)));
  const squash = since < air ? 1 : 1 - 0.12 * Math.sin(Math.PI * land);
  const wave = since < air + 360 ? 1 - clamp((since - air * 0.6) / 480) : 0;
  return { dx, dy, rot, squash, wave, since };
}

const knock: Frame = (el, _p, age, ctx) => {
  const svg = el.querySelector("svg");
  const root = el.closest<HTMLElement>(".ult-cinematic");
  if (!svg || !root) return;
  const o = params(el);
  const actors = [...root.querySelectorAll<HTMLElement>('.cine-actor[data-role="targets"]')];
  const placed = actors.map((node, i) => ({ node, i, at: ctx.actor(`targets-${i}`) })).filter((a) => a.at && a.node.style.display !== "none");
  // The band comes round from the Butcher's side: nearest first.
  const order = [...placed].sort((a, b) => a.at!.x - b.at!.x);
  const caster = ctx.actor("caster");
  const dir = caster && order.length && order[0].at!.x < caster.x ? -1 : 1;
  const hit = pn(o, "hit", 130);
  const lead = pn(o, "lead", 28);
  let wave = "";
  let dark = "";
  order.forEach((a, rank) => {
    const at = a.at!;
    const since = age - (hit - (order.length - 1 - rank) * lead);
    // Each further along the row is caught later in the swing and thrown further, so they fan out rather than pile up.
    const f = flight(since, o, 1 + rank * pn(o, "fan", 0.5));
    // World units to the figure's own drawing units (its box is 100 across and the figure 84 tall).
    const unit = 84 / at.h;
    const look = a.node.querySelector<HTMLElement>(".cine-look");
    if (look) {
      if (look.style.transformOrigin !== "50% 96%") look.style.transformOrigin = "50% 96%";
      const t =
        since < 0
          ? ""
          : `translate(${f1(f.dx * unit * dir)}px, ${f1(f.dy * unit)}px) rotate(${f1(f.rot * dir)}deg) scale(${(1 / f.squash).toFixed(3)}, ${f.squash.toFixed(3)})`;
      if (look.style.transform !== t) look.style.transform = t;
    }
    if (f.wave <= 0) return;
    // The bow wave: sawdust flung up and forward off the cobbles, ahead of the feet as they go.
    const rand = seeded(71 + a.i * 13);
    const fx = at.x + f.dx * dir + at.h * 0.22 * dir;
    const fy = at.y;
    const k = clamp(since / 420);
    for (let j = 0; j < 48; j++) {
      const ang = ((-12 - rand() * 70) * Math.PI) / 180;
      const speed = at.h * (0.3 + rand() * 0.75);
      const delay = rand() * 0.3;
      const len = at.h * (0.06 + rand() * 0.09);
      const chunk = rand() > 0.55;
      const shade = rand() > 0.8;
      const kj = clamp((k - delay) / (1 - delay));
      if (kj <= 0) continue;
      const x = fx - rand() * at.h * 0.25 * dir + Math.cos(ang) * speed * kj * dir;
      const y = fy + Math.sin(ang) * speed * kj + at.h * 0.7 * kj * kj;
      const fade = 0.35 + 0.65 * f.wave;
      if (chunk) {
        const r = len * 0.55 * fade;
        const q = `M${f1(x - r)} ${f1(y - r * 0.4)} L${f1(x + r)} ${f1(y - r * 0.7)} L${f1(x + r * 0.7)} ${f1(y + r * 0.5)} L${f1(x - r * 0.6)} ${f1(y + r * 0.4)} Z `;
        if (shade) dark += q;
        else wave += q;
      } else {
        // A streak along the way it flies.
        const vx = Math.cos(ang) * dir;
        const vy = Math.sin(ang) + 1.4 * kj;
        const n = Math.hypot(vx, vy) || 1;
        const l = len * fade;
        const w = l * 0.22;
        const [ux, uy] = [vx / n, vy / n];
        wave += `M${f1(x - ux * l)} ${f1(y - uy * l)} L${f1(x - uy * w)} ${f1(y + ux * w)} L${f1(x + ux * l * 0.3)} ${f1(y + uy * l * 0.3)} L${f1(x + uy * w)} ${f1(y - ux * w)} Z `;
      }
    }
  });
  setD(svg.querySelector(".elbow-knock-wave"), wave.trim());
  setD(svg.querySelector(".elbow-knock-wave-dark"), dark.trim());
};

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "elbow-knock": Knock,
  "elbow-lane": Lane,
  "elbow-eaves": Eaves,
  "elbow-plaster": Plaster,
  "elbow-post": Post,
  "elbow-cat": Cat,
  "elbow-sweep": Sweep,
  "elbow-gouge": Gouge,
  "elbow-sawdust": Sawdust,
  "elbow-splinter": Splinter,
  "elbow-board": Board,
  "elbow-glare": Glare,
};

export const frames: Record<string, Frame> = {
  "elbow-sweep": sweep,
  "elbow-gouge": gouge,
  "elbow-knock": knock,
};
