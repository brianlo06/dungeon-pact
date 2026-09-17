import type { ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * The Notary's entrance, drawn.
 *
 * The idea it serves: the Notary witnesses every signature, and the party has
 * just walked into its record. A witness candle lights over each hero; the
 * walls are every seal it has ever pressed; in a ledger of sealed names there
 * is one empty line, and a drop of wax falls on it. Then the Notary draws
 * itself up and presses — and the wax it squeezes out stands up as three
 * seals, counting down, and then enforced.
 *
 *   nti-candle   a witness candle lit over a hero on the board
 *   nti-ledger   a ledger page: lines of names, each sealed, and one empty line
 *   nti-drop     a drop of red wax falling and spreading into a blot
 *   nti-splat    wax squeezed out under the stamp, three gobs flung out
 *   nti-seals    three seals standing, their three notches going out, then enforced
 */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const WAX = "#a8352a";
const WAX_HI = "#d5654a";
const WAX_DEEP = "#4d1510";
const FLAME = "#ffcf7a";

/** A small witness candle, lit, floating over a hero. */
const Candle = () => (
  <div className="nbi-candle">
    <svg viewBox="-40 -110 80 150" aria-hidden="true">
      <defs>
        <radialGradient id="nbi-halo">
          <stop offset="0" stopColor={FLAME} stopOpacity={0.5} />
          <stop offset="1" stopColor={FLAME} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle className="nbi-halo" cy={-60} r={40} fill="url(#nbi-halo)" />
      <rect x={-8} y={-40} width={16} height={60} rx={2} fill="#d8ccb0" stroke="#171420" strokeWidth={3} />
      <path d="M-8 -30 q-5 14 0 22" stroke={WAX} strokeWidth={4} fill="none" />
      <path className="nbi-flame" d="M0 -80 Q12 -58 0 -44 Q-12 -58 0 -80 Z" fill={FLAME} stroke="#ff9a3a" strokeWidth={2} />
    </svg>
  </div>
);

/** A scribble standing in for a name, deterministic. */
function name(rand: () => number, x: number, y: number, w: number) {
  let d = `M${x} ${y}`;
  let at = x;
  while (at < x + w) {
    const step = 10 + rand() * 14;
    at += step;
    d += ` q${(step / 2).toFixed(1)} ${((rand() - 0.5) * 26).toFixed(1)} ${step.toFixed(1)} ${((rand() - 0.5) * 6).toFixed(1)}`;
  }
  return d;
}

/** A ledger page: ruled lines of sealed names, and one empty line at the foot. */
const Ledger = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 5);
  const lines = 6;
  return (
    <div className="nbi-ledger">
      <svg viewBox="-420 -300 840 600" aria-hidden="true">
        <path d="M-400 -290 H400 V290 H-400 Z" fill="#dccfae" stroke="#171420" strokeWidth={8} />
        <path d="M-330 -290 V290" stroke="#b24a3a" strokeWidth={3} opacity={0.6} />
        {Array.from({ length: lines + 1 }, (_, i) => {
          const y = -220 + i * 76;
          const empty = i === lines;
          return (
            <g key={i}>
              <path d={`M-380 ${y + 20} H380`} stroke="#8a7a5a" strokeWidth={3} opacity={0.6} />
              {!empty && <path d={name(rand, -300, y, 360 + rand() * 120)} stroke="#2a2230" strokeWidth={5} fill="none" strokeLinecap="round" />}
              {!empty && <circle cx={300} cy={y + 2} r={22} fill={WAX} stroke={WAX_DEEP} strokeWidth={4} />}
              {empty && <circle className="nbi-empty-seal" cx={300} cy={y + 2} r={22} fill="none" stroke="#8a7a5a" strokeWidth={3} strokeDasharray="6 6" />}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/** A drop of wax: forming, falling, landing, spreading into a blot. */
const Drop = () => (
  <div className="nbi-drop">
    <svg viewBox="-100 -500 200 560" aria-hidden="true">
      <ellipse className="nbi-bead" rx={14} ry={20} fill={WAX} stroke={WAX_DEEP} strokeWidth={4} />
      <path className="nbi-blot" d="M-40 0 C-44 -26 -12 -34 4 -30 C30 -36 46 -12 40 6 C44 28 12 34 -6 30 C-34 34 -44 18 -40 0 Z" fill={WAX} stroke={WAX_DEEP} strokeWidth={4} />
    </svg>
  </div>
);

/** Wax squeezed out under the stamp: a spreading pool and three gobs flung wide. */
const Splat = () => (
  <div className="nbi-splat">
    <svg viewBox="-600 -300 1200 360" aria-hidden="true">
      <ellipse className="nbi-pool" rx={200} ry={30} fill={WAX} stroke={WAX_DEEP} strokeWidth={6} />
      {[
        [-460, -220],
        [-240, -290],
        [-20, -230],
      ].map(([vx, vy], i) => (
        <ellipse key={i} className="nbi-gob" rx={26} ry={22} fill={WAX} stroke={WAX_DEEP} strokeWidth={5} data-vx={vx} data-vy={vy} />
      ))}
      {Array.from({ length: 14 }, (_, i) => {
        const a = Math.PI * (0.1 + (i / 13) * 0.8);
        return <circle key={`s${i}`} className="nbi-fleck" r={6 + (i % 3) * 3} fill={WAX_HI} data-vx={(-Math.cos(a) * (300 + (i % 4) * 90)).toFixed(1)} data-vy={(-Math.sin(a) * (400 + (i % 3) * 120)).toFixed(1)} />;
      })}
    </svg>
  </div>
);

/** One of the Notary's seals, drawn as the game draws them: a disc on edge, the device. */
function Seal() {
  return (
    <g>
      <path d="M-6 22 L-26 58 L-18 56 L-16 64 L2 30 Z M6 22 L28 58 L20 56 L18 64 L0 30 Z" fill="#6b1f19" stroke="#171420" strokeWidth={4} />
      <ellipse cx={4} cy={0} rx={48} ry={50} fill="#3e110d" stroke="#171420" strokeWidth={4} />
      <circle r={48} fill={WAX} stroke="#171420" strokeWidth={5} />
      <circle r={38} fill="none" stroke="#5a1812" strokeWidth={4} opacity={0.8} />
      <g stroke="#3e110d" strokeWidth={4} fill="none" strokeLinecap="round">
        <path d="M-6 -8 H26 V16 H-6 Z M10 -8 V16" />
        <path d="M-28 28 L-14 -26 Q-4 -30 -12 -12" />
      </g>
      <path d="M-26 -20 Q-18 -32 -4 -34" stroke="#f0a584" strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Three seals: up out of the wax, three notches each going out, then each enforced at the party. */
const Seals = () => (
  <div className="nbi-seals">
    <svg viewBox="-700 -260 900 360" aria-hidden="true">
      {[-520, -280, -40].map((x, i) => (
        <g key={i} transform={`translate(${x} 0)`}>
          <path className="nbi-lash" data-i={i} d="M-40 -10 Q-300 -120 -700 -40" stroke={WAX} strokeWidth={10} fill="none" strokeLinecap="round" pathLength={1} />
          <g className="nbi-seal" data-i={i}>
            <Seal />
          </g>
          {[0, 1, 2].map((n) => (
            <circle key={n} className="nbi-notch" data-n={n} cx={-34 + n * 34} cy={-90} r={11} fill={FLAME} stroke="#171420" strokeWidth={3} />
          ))}
        </g>
      ))}
    </svg>
  </div>
);

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "nti-candle": Candle,
  "nti-ledger": Ledger,
  "nti-drop": Drop,
  "nti-splat": Splat,
  "nti-seals": Seals,
};

/** The drop gathers, falls at 0.35, lands at 0.6 and spreads. */
const drop: Frame = (el, p) => {
  const bead = el.querySelector<SVGEllipseElement>(".nbi-bead");
  const blot = el.querySelector<SVGPathElement>(".nbi-blot");
  if (!bead || !blot) return;
  const grow = clamp(p / 0.35);
  const fall = clamp((p - 0.35) / 0.25);
  bead.setAttribute("cy", (-470 + fall * fall * 470).toFixed(1));
  bead.setAttribute("ry", (10 + grow * 10 + fall * 8).toFixed(1));
  bead.style.opacity = fall >= 1 ? "0" : "1";
  const spread = clamp((p - 0.6) / 0.25);
  const e = 1 - (1 - spread) ** 3;
  blot.setAttribute("transform", `scale(${(0.2 + e * 0.9).toFixed(2)} ${(0.2 + e * 0.5).toFixed(2)})`);
  blot.style.opacity = spread <= 0 ? "0" : "1";
};

/** The splat: pool spreads, gobs arc out and land, flecks fly and fall. */
const splat: Frame = (el, p) => {
  const t = clamp(p / 0.6);
  const pool = el.querySelector<SVGEllipseElement>(".nbi-pool");
  if (pool) {
    const e = 1 - (1 - clamp(p * 3)) ** 3;
    pool.setAttribute("rx", (60 + 160 * e).toFixed(1));
    pool.setAttribute("ry", (10 + 22 * e).toFixed(1));
  }
  for (const g of el.querySelectorAll<SVGEllipseElement>(".nbi-gob")) {
    const x = Number(g.dataset.vx) * t;
    const y = Number(g.dataset.vy) * Math.sin(t * Math.PI);
    g.setAttribute("cx", x.toFixed(1));
    g.setAttribute("cy", y.toFixed(1));
    g.setAttribute("ry", (t >= 1 ? 12 : 22).toFixed(0));
    g.setAttribute("rx", (t >= 1 ? 36 : 26).toFixed(0));
  }
  const tt = clamp(p) * 0.9;
  for (const f of el.querySelectorAll<SVGCircleElement>(".nbi-fleck")) {
    const y = Number(f.dataset.vy) * tt + 1400 * tt * tt;
    f.setAttribute("cx", (Number(f.dataset.vx) * tt).toFixed(1));
    f.setAttribute("cy", Math.min(10, y).toFixed(1));
    f.style.opacity = y > 0 && tt > 0.15 ? "0" : "1";
  }
};

/** Seals stand up by 0.25; notches go out at 0.38, 0.52, 0.66; lashes at 0.72. */
const seals: Frame = (el, p) => {
  for (const s of el.querySelectorAll<SVGGElement>(".nbi-seal")) {
    const i = Number(s.dataset.i);
    const up = clamp((p - i * 0.05) / 0.2);
    const e = 1 - (1 - up) ** 3;
    const kick = clamp((p - 0.72 - i * 0.04) / 0.12);
    const k = Math.sin(kick * Math.PI);
    s.setAttribute("transform", `translate(${(-k * 30).toFixed(1)} ${((1 - e) * 40).toFixed(1)}) scale(${(0.2 + e * 0.8 + k * 0.1).toFixed(2)} ${(e * 1 + k * 0.1).toFixed(2)})`);
  }
  for (const n of el.querySelectorAll<SVGCircleElement>(".nbi-notch")) {
    const out = p > 0.38 + (2 - Number(n.dataset.n)) * 0.14;
    n.style.opacity = p < 0.22 ? "0" : out ? "0.15" : "1";
    n.setAttribute("fill", out ? "#3a3440" : FLAME);
  }
  for (const l of el.querySelectorAll<SVGPathElement>(".nbi-lash")) {
    const i = Number(l.dataset.i);
    const k = clamp((p - 0.72 - i * 0.04) / 0.14);
    l.style.strokeDasharray = "1";
    l.style.strokeDashoffset = String(1 - k);
    l.style.opacity = k <= 0 ? "0" : String(1 - clamp((p - 0.92) / 0.08) * 0.5);
  }
};

export const frames: Record<string, Frame> = {
  "nti-drop": drop,
  "nti-splat": splat,
  "nti-seals": seals,
};
