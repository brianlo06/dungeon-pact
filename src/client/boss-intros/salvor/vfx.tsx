import type { ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * The Salvor's entrance, drawn.
 *
 * The idea it serves: the Salvor claims what the water took. A lamp moves
 * under the still water of the Wreck Pool; a hero's shield floats on it; a
 * bubble, and a hook takes the shield under; then the Salvor stands up out of
 * the pool with the water sheeting off it, and soft plates climb out after it
 * and click shut on its back.
 *
 *   svi-lamp      a lamp's glow moving slowly under the water surface
 *   svi-surface   the water's face, in front of whatever stands in it
 *   svi-shield    a round shield floating, a bubble, a hook, and it is gone
 *   svi-shed      water sheeting and dripping off something rising
 *   svi-column    a column of water thrown up where the gaff lands
 *   svi-plates    soft plates rising out of the water and snapping onto its back
 *   svi-rings     rings spreading on the surface
 */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const SEA = "#7fc7c0";
const FOAM = "#cfeee8";

/** A lamp glow drifting under the water. */
const Lamp = () => (
  <div className="sbi-lamp">
    <svg viewBox="-300 -80 600 160" aria-hidden="true">
      <defs>
        <radialGradient id="sbi-lamp-glow">
          <stop offset="0" stopColor="#e8e0a0" stopOpacity={0.55} />
          <stop offset="0.4" stopColor={SEA} stopOpacity={0.25} />
          <stop offset="1" stopColor={SEA} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse rx={300} ry={80} fill="url(#sbi-lamp-glow)" />
    </svg>
  </div>
);

/** The water's face: a band of dark water with a lit edge, to stand things in. */
const Surface = ({ cue }: VfxProps) => {
  const w = Number(cue.params?.width ?? 2400);
  return (
    <div className="sbi-surface" style={{ width: `${w}px` }}>
      <svg viewBox={`${-w / 2} 0 ${w} 500`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="sbi-face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#12302f" stopOpacity={0.94} />
            <stop offset="0.25" stopColor="#081617" />
            <stop offset="1" stopColor="#030707" />
          </linearGradient>
        </defs>
        <rect x={-w / 2} y={0} width={w} height={500} fill="url(#sbi-face)" />
        <path className="sbi-edge" d={`M${-w / 2} 2 H${w / 2}`} stroke={FOAM} strokeWidth={4} opacity={0.5} />
      </svg>
    </div>
  );
};

/** Rings spreading from a point on the water. */
const Rings = () => (
  <div className="sbi-rings">
    <svg viewBox="-300 -60 600 120" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <ellipse key={i} className="sbi-ring" style={{ "--i": i } as React.CSSProperties} rx={300} ry={50} fill="none" stroke={FOAM} strokeWidth={4} />
      ))}
    </svg>
  </div>
);

/** A hero's round shield floating; a bubble; a hook comes up under it and it goes down. */
const Shield = () => (
  <div className="sbi-shield">
    <svg viewBox="-200 -260 400 360" aria-hidden="true">
      <defs>
        <clipPath id="sbi-above">
          <rect x={-200} y={-260} width={400} height={268} />
        </clipPath>
      </defs>
      <g clipPath="url(#sbi-above)">
      <g className="sbi-shield-body">
        <ellipse rx={120} ry={34} fill="#6a3a2a" stroke="#171420" strokeWidth={8} />
        <ellipse rx={84} ry={22} fill="none" stroke="#c9a54a" strokeWidth={8} />
        <ellipse cy={-4} rx={22} ry={8} fill="#c9a54a" stroke="#171420" strokeWidth={4} />
      </g>
      <circle className="sbi-bubble" cx={150} r={12} fill="none" stroke={FOAM} strokeWidth={4} />
      <g className="sbi-hook">
        <path d="M-40 60 L-40 -40 C-40 -110 50 -110 50 -50 L30 -60" fill="none" stroke="#171420" strokeWidth={22} strokeLinecap="round" />
        <path d="M-40 60 L-40 -40 C-40 -110 50 -110 50 -50 L30 -60" fill="none" stroke="#8a8490" strokeWidth={12} strokeLinecap="round" />
      </g>
      </g>
      <path d="M-200 8 H200" stroke={FOAM} strokeWidth={3} opacity={0.3} />
    </svg>
  </div>
);

/** Water sheeting off something rising: streaks and falling drops. */
const Shed = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 13);
  return (
    <div className="sbi-shed">
      <svg viewBox="-260 -520 520 560" aria-hidden="true">
        {Array.from({ length: 34 }, (_, i) => (
          <path
            key={i}
            className="sbi-streak"
            data-x={((rand() - 0.5) * 460).toFixed(1)}
            data-y={(-480 + rand() * 360).toFixed(1)}
            data-len={(20 + rand() * 60).toFixed(1)}
            data-delay={(rand() * 0.5).toFixed(3)}
            d="M0 0 V1"
            stroke={i % 3 ? SEA : FOAM}
            strokeWidth={4 + (i % 3) * 2}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
};

/** A column of water thrown up, and its drops coming down. */
const Column = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 21);
  return (
    <div className="sbi-column">
      <svg viewBox="-400 -620 800 660" aria-hidden="true">
        <path className="sbi-col-body" d="M-110 0 C-90 -200 -60 -420 0 -520 C60 -420 90 -200 110 0 Z" fill={SEA} opacity={0.55} />
        <path className="sbi-col-body" d="M-50 0 C-40 -200 -20 -380 0 -460 C20 -380 40 -200 50 0 Z" fill={FOAM} opacity={0.7} />
        {Array.from({ length: 26 }, (_, i) => {
          const a = Math.PI * (0.2 + rand() * 0.6);
          const v = 500 + rand() * 500;
          return <circle key={i} className="sbi-spray" r={6 + rand() * 9} fill={i % 2 ? FOAM : SEA} data-vx={(Math.cos(a) * v * (rand() < 0.5 ? -1 : 1)).toFixed(1)} data-vy={(-Math.sin(a) * v).toFixed(1)} />;
        })}
      </svg>
    </div>
  );
};

/** Soft plates: rise out of the water at the left, travel to the back, and shut. */
const Plates = () => (
  <div className="sbi-plates">
    <svg viewBox="-500 -400 700 520" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <g key={i} className="sbi-plate" data-i={i}>
          <path d="M-28 -34 L0 -44 L30 -32 L26 20 L-24 22 Z" fill="#6a4a3a" stroke="#171420" strokeWidth={5} />
          <path className="sbi-plate-wet" d="M-26 -30 L0 -40 L28 -28" stroke={FOAM} strokeWidth={5} fill="none" strokeLinecap="round" />
          {[[-8, -10], [8, 2], [-10, 12]].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={5} fill="#d8d0bc" stroke="#171420" strokeWidth={2} />
          ))}
          <circle className="sbi-plate-snap" r={50} fill="none" stroke={FOAM} strokeWidth={6} />
        </g>
      ))}
    </svg>
  </div>
);

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "svi-lamp": Lamp,
  "svi-surface": Surface,
  "svi-rings": Rings,
  "svi-shield": Shield,
  "svi-shed": Shed,
  "svi-column": Column,
  "svi-plates": Plates,
};

/** The lamp drifts along under the water from right to left, slowly. */
const lamp: Frame = (el, p) => {
  el.style.setProperty("--lx", `${(260 - p * 520).toFixed(1)}px`);
};

/** The shield bobs; a bubble rises at 0.3 and pops; the hook comes up at 0.7 and takes it down. */
const shield: Frame = (el, p) => {
  const body = el.querySelector<SVGGElement>(".sbi-shield-body");
  const bubble = el.querySelector<SVGCircleElement>(".sbi-bubble");
  const hook = el.querySelector<SVGGElement>(".sbi-hook");
  if (!body || !bubble || !hook) return;
  const take = clamp((p - 0.78) / 0.14);
  const bob = Math.sin(p * 9) * 3 * (1 - take);
  body.setAttribute("transform", `translate(${(-take * 30).toFixed(1)} ${(bob + take * take * 150).toFixed(1)}) rotate(${(take * -18).toFixed(1)})`);
  const b = clamp((p - 0.25) / 0.2);
  bubble.setAttribute("cy", (40 - b * 44).toFixed(1));
  bubble.setAttribute("r", (b >= 1 ? 0 : 6 + b * 8).toFixed(1));
  bubble.style.opacity = b <= 0 ? "0" : "1";
  const up = clamp((p - 0.66) / 0.12);
  const hy = 150 - up * 140 + take * take * 170;
  hook.setAttribute("transform", `translate(0 ${hy.toFixed(1)})`);
};

/** The streaks run down and fall away as the thing they are on rises. */
const shed: Frame = (el, p) => {
  for (const s of el.querySelectorAll<SVGPathElement>(".sbi-streak")) {
    const d = s.dataset;
    const k = clamp((p - Number(d.delay)) / 0.5);
    const x = Number(d.x);
    const y = Number(d.y) + k * k * 520;
    const len = Number(d.len) * (0.4 + k);
    s.setAttribute("d", `M${x} ${y.toFixed(1)} V${(y + len).toFixed(1)}`);
    s.style.opacity = k <= 0 || y > 30 ? "0" : String(1 - k * 0.5);
  }
};

/** The column rises and collapses; the spray arcs out and falls. */
const column: Frame = (el, p) => {
  const up = Math.sin(clamp(p / 0.7) * Math.PI);
  for (const b of el.querySelectorAll<SVGPathElement>(".sbi-col-body")) {
    b.setAttribute("transform", `scale(${(1 - up * 0.2 + (1 - up) * 0.3).toFixed(2)} ${Math.max(0.01, up).toFixed(2)})`);
  }
  const t = clamp(p) * 1.1;
  for (const s of el.querySelectorAll<SVGCircleElement>(".sbi-spray")) {
    const x = Number(s.dataset.vx) * t;
    const y = Number(s.dataset.vy) * t + 1300 * t * t;
    s.setAttribute("cx", x.toFixed(1));
    s.setAttribute("cy", Math.min(20, y).toFixed(1));
    s.style.opacity = y > 10 && t > 0.1 ? "0" : "1";
  }
};

/** Three plates, one after another: up out of the water, across to the back, shut. */
const plates: Frame = (el, p) => {
  const starts = [-420, -300, -180];
  const ends: [number, number][] = [
    [100, -150],
    [150, -90],
    [70, -100],
  ];
  for (const g of el.querySelectorAll<SVGGElement>(".sbi-plate")) {
    const i = Number(g.dataset.i);
    const k = clamp((p - i * 0.13) / 0.42);
    const e = 1 - (1 - k) ** 3;
    const [ex, ey] = ends[i];
    const x = starts[i] + (ex - starts[i]) * e;
    const y = 20 + (ey - 20) * e - Math.sin(e * Math.PI) * 120;
    const shut = clamp((k - 0.9) / 0.1);
    g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((1 - e) * -40 + shut * 8).toFixed(1)}) scale(${(0.8 + e * 0.4).toFixed(2)})`);
    g.style.opacity = k <= 0 ? "0" : "1";
    const snap = g.querySelector<SVGCircleElement>(".sbi-plate-snap");
    const after = clamp((p - i * 0.13 - 0.42) / 0.2);
    if (snap) {
      snap.setAttribute("r", (30 + after * 60).toFixed(1));
      snap.style.opacity = after <= 0 ? "0" : String(1 - after);
    }
    const wet = g.querySelector<SVGPathElement>(".sbi-plate-wet");
    if (wet) wet.style.opacity = String(1 - shut);
  }
};

export const frames: Record<string, Frame> = {
  "svi-lamp": lamp,
  "svi-shield": shield,
  "svi-shed": shed,
  "svi-column": column,
  "svi-plates": plates,
};
