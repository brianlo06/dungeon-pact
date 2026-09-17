import type { ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * The Assayer's entrance, drawn.
 *
 * The idea it serves: the Assayer weighs what you are worth in heat — its
 * floor is lined with moulds cast in the shapes of what it has melted down,
 * its gauge climbs into the red, it pours, and the one thing that stops it is
 * a hard blow on the crucible while it is hot.
 *
 *   asi-kilnlight  on the board: furnace light spilling in from the right edge
 *   asi-moulds     a row of floor moulds shaped like weapons, the metal in them cooling
 *   asi-gauge      the gauge dial, its needle climbing into the red
 *   asi-drip       one drop of melt falling
 *   asi-stream     the pour: a molten ribbon from the lip to the floor
 *   asi-splash     the melt landing and spreading in a pool
 *   asi-crucible   the crucible close, held on the tongs, glowing
 *   asi-blade      a blade swung into it; the crack runs, the melt leaks
 */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const MELT = "#ffb03a";
const HOT = "#fff2b0";

function MeltGradient({ id }: { id: string }) {
  return (
    <radialGradient id={id} cx="0.5" cy="0.4" r="0.7">
      <stop offset="0" stopColor={HOT} />
      <stop offset="0.45" stopColor={MELT} />
      <stop offset="1" stopColor="#c2410f" />
    </radialGradient>
  );
}

/** Orange light pushing in over the board from the right edge. */
const KilnLight = () => (
  <div className="abi-kilnlight">
    <svg viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="abi-spill" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#ffb040" stopOpacity={0.75} />
          <stop offset="0.35" stopColor="#ff7a2a" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ff5a1a" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect className="abi-spill" x={0} y={0} width={1600} height={900} fill="url(#abi-spill)" />
    </svg>
  </div>
);

const SHAPES: Record<string, string> = {
  sword: "M-150 -10 H110 L150 0 L110 10 H-150 Z M-180 -34 H-150 V34 H-180 Z M-230 -8 H-180 V8 H-230 Z",
  shield: "M-80 -60 H80 V10 Q80 60 0 80 Q-80 60 -80 10 Z",
  axe: "M-150 -8 H120 V8 H-150 Z M60 -70 Q140 -40 130 0 Q140 40 60 70 Q90 0 60 -70 Z",
  helm: "M-80 40 V-10 Q-80 -70 0 -70 Q80 -70 80 -10 V40 H30 V0 H-30 V40 Z",
  bow: "M-160 0 Q0 -150 160 0 Q0 -110 -160 0 Z M-160 0 H160",
};

/** Floor moulds, each shaped like a thing it melted, the metal in them glowing. */
const Moulds = ({ cue }: VfxProps) => {
  const kinds = ["sword", "shield", "axe", "helm", "sword", "bow"];
  const n = Number(cue.params?.count ?? 5);
  return (
    <div className="abi-moulds">
      <svg viewBox="-900 -120 1800 240" aria-hidden="true">
        <defs>
          <MeltGradient id="abi-mould-melt" />
        </defs>
        {Array.from({ length: n }, (_, i) => {
          const x = -900 + (1800 * (i + 0.5)) / n;
          const k = kinds[i % kinds.length];
          return (
            <g key={i} transform={`translate(${x} 0) scale(0.8 0.62)`}>
              <path d={SHAPES[k]} fill="#1a0e0b" stroke="#3a2620" strokeWidth={28} strokeLinejoin="round" />
              <path className="abi-mould-metal" style={{ "--k": i / n } as React.CSSProperties} d={SHAPES[k]} fill="url(#abi-mould-melt)" stroke={MELT} strokeWidth={4} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/** The gauge: a dial, a red band, and a needle that trembles as it climbs. */
const Gauge = () => {
  const ticks = Array.from({ length: 13 }, (_, i) => -120 + i * 20);
  return (
    <div className="abi-gauge">
      <svg viewBox="-160 -160 320 320" aria-hidden="true">
        <circle r={150} fill="#2a2630" stroke="#171420" strokeWidth={10} />
        <circle r={128} fill="#e9dcc0" stroke="#6b5a41" strokeWidth={4} />
        <path className="abi-red" d={arc(112, 40, 120)} stroke="#b3302a" strokeWidth={22} fill="none" />
        {ticks.map((a) => (
          <path key={a} d={`M${pt(118, a)} L${pt(a % 40 === 0 ? 92 : 102, a)}`} stroke="#2a2018" strokeWidth={a % 40 === 0 ? 6 : 3} />
        ))}
        <g className="abi-needle">
          <path d="M-6 16 L0 -110 L6 16 Z" fill="#b3302a" stroke="#171420" strokeWidth={3} />
        </g>
        <circle r={16} fill="#171420" />
        <path d="M-96 -60 A112 112 0 0 1 -30 -110" stroke="#fff" strokeWidth={8} fill="none" opacity={0.35} />
      </svg>
    </div>
  );
};
/** A point on a circle, angle in degrees clockwise from straight up. */
function pt(r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return `${(Math.sin(a) * r).toFixed(1)} ${(-Math.cos(a) * r).toFixed(1)}`;
}
function arc(r: number, from: number, to: number) {
  return `M${pt(r, from)} A${r} ${r} 0 0 1 ${pt(r, to)}`;
}

/** One drop of melt: a falling bead, and a small flare where it lands. */
const Drip = () => (
  <div className="abi-drip">
    <svg viewBox="-60 -400 120 440" aria-hidden="true">
      <ellipse className="abi-bead" rx={10} ry={16} fill={MELT} stroke={HOT} strokeWidth={3} />
      <ellipse className="abi-flare" cy={20} rx={40} ry={10} fill={MELT} />
    </svg>
  </div>
);

/** The pour: a molten ribbon, wide and white at its heart, from lip to floor. */
const Stream = ({ cue }: VfxProps) => {
  const len = Number(cue.params?.len ?? 360);
  return (
    <div className="abi-stream" style={{ height: `${len + 40}px` }}>
      <svg viewBox={`-80 -20 160 ${len + 40}`} preserveAspectRatio="none" aria-hidden="true">
        <path className="abi-ribbon" d={`M-26 0 Q-40 ${len * 0.5} -18 ${len} H22 Q30 ${len * 0.5} 26 0 Z`} fill="#ff7a22" />
        <path className="abi-ribbon" d={`M-10 0 Q-18 ${len * 0.5} -6 ${len} H8 Q12 ${len * 0.5} 10 0 Z`} fill={HOT} />
      </svg>
    </div>
  );
};

/** Where it lands: a spreading pool and gobbets thrown out of it. */
const Splash = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 7);
  return (
    <div className="abi-splash">
      <svg viewBox="-500 -300 1000 360" aria-hidden="true">
        <defs>
          <MeltGradient id="abi-pool" />
        </defs>
        <ellipse className="abi-pool" rx={320} ry={42} fill="url(#abi-pool)" />
        {Array.from({ length: 22 }, (_, i) => {
          const a = Math.PI * (0.08 + rand() * 0.84);
          const v = 300 + rand() * 420;
          return <circle key={i} className="abi-gob" r={6 + rand() * 10} fill={i % 3 ? MELT : HOT} data-vx={(-Math.cos(a) * v).toFixed(1)} data-vy={(-Math.sin(a) * v).toFixed(1)} />;
        })}
      </svg>
    </div>
  );
};

/** The crucible close: a heavy cup on long tongs reaching in from the right. */
const Crucible = () => (
  <div className="abi-crucible">
    <svg viewBox="-300 -260 900 520" aria-hidden="true">
      <defs>
        <MeltGradient id="abi-cr-melt" />
        <linearGradient id="abi-cr-iron" x1="0.2" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#7a4a3a" />
          <stop offset="0.5" stopColor="#4a302c" />
          <stop offset="1" stopColor="#2a1a19" />
        </linearGradient>
      </defs>
      {/* The tongs, from off the right edge. */}
      <path d="M600 -40 L150 -70 M600 40 L150 70" stroke="#3a3842" strokeWidth={30} strokeLinecap="round" />
      <path d="M600 -40 L150 -70 M600 40 L150 70" stroke="#171420" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
      {/* The cup, glowing from inside its walls. */}
      <path className="abi-cup" d="M-200 -130 H200 L150 170 C140 210 -140 210 -150 170 Z" fill="url(#abi-cr-iron)" stroke="#171420" strokeWidth={12} />
      <path className="abi-cup-glow" d="M-200 -130 H200 L150 170 C140 210 -140 210 -150 170 Z" fill="#ff6a1a" />
      <ellipse cx={0} cy={-130} rx={200} ry={48} fill="url(#abi-cr-melt)" stroke="#171420" strokeWidth={10} />
      <path d="M-200 -130 L-250 -160 L-200 -100 Z" fill="url(#abi-cr-iron)" stroke="#171420" strokeWidth={6} />
      {/* The crack: drawn in by its frame, and melt showing through it. */}
      <g className="abi-crack">
        <path pathLength={1} d="M-40 -80 L-10 -20 L-50 30 L0 80 L-30 150" stroke={HOT} strokeWidth={14} fill="none" strokeLinejoin="round" />
        <path pathLength={1} d="M-10 -20 L50 10 L70 60" stroke={MELT} strokeWidth={9} fill="none" />
        <path pathLength={1} d="M-50 30 L-110 40" stroke={MELT} strokeWidth={8} fill="none" />
      </g>
      <g className="abi-leak">
        <path d="M-30 150 Q-36 220 -24 260" stroke={MELT} strokeWidth={16} strokeLinecap="round" fill="none" />
      </g>
    </svg>
  </div>
);

/** A blade swung in from the left, stopping dead against the cup. */
const Blade = () => (
  <div className="abi-blade">
    <svg viewBox="-700 -120 760 240" aria-hidden="true">
      <g className="abi-blade-body">
        <path d="M-700 -12 H-420 V12 H-700 Z" fill="#3a2a22" stroke="#171420" strokeWidth={6} />
        <path d="M-420 -46 H-390 V46 H-420 Z" fill="#6a5a4a" stroke="#171420" strokeWidth={6} />
        <path d="M-390 -22 H-20 L20 0 L-20 22 H-390 Z" fill="#b8bcc8" stroke="#171420" strokeWidth={6} />
        <path d="M-380 -8 H-30" stroke="#eef" strokeWidth={5} opacity={0.7} />
      </g>
      <g className="abi-spark">
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <path key={i} d={`M${Math.cos(a) * 20} ${Math.sin(a) * 20} L${Math.cos(a) * 90} ${Math.sin(a) * 90}`} stroke={HOT} strokeWidth={6} strokeLinecap="round" />;
        })}
      </g>
    </svg>
  </div>
);

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "asi-kilnlight": KilnLight,
  "asi-moulds": Moulds,
  "asi-gauge": Gauge,
  "asi-drip": Drip,
  "asi-stream": Stream,
  "asi-splash": Splash,
  "asi-crucible": Crucible,
  "asi-blade": Blade,
};

/** The needle: climbs from cold into the red, trembling harder as it goes. */
const gauge: Frame = (el, p) => {
  const needle = el.querySelector<SVGGElement>(".abi-needle");
  if (!needle) return;
  const climb = 1 - (1 - clamp(p / 0.8)) ** 2;
  const tremble = Math.sin(p * 97) * 3 * climb + Math.sin(p * 211) * 2 * climb * climb;
  needle.setAttribute("transform", `rotate(${(-110 + climb * 205 + tremble).toFixed(1)})`);
  el.style.setProperty("--red", String(clamp((climb - 0.72) / 0.2)));
};

/** The drop falls and flares. */
const drip: Frame = (el, p) => {
  const bead = el.querySelector<SVGEllipseElement>(".abi-bead");
  const flare = el.querySelector<SVGEllipseElement>(".abi-flare");
  if (!bead || !flare) return;
  const fall = clamp(p / 0.6);
  bead.setAttribute("cy", (-380 + 400 * fall * fall).toFixed(1));
  bead.style.opacity = fall >= 1 ? "0" : "1";
  const f = clamp((p - 0.6) / 0.4);
  flare.setAttribute("rx", (10 + 60 * f).toFixed(1));
  flare.style.opacity = f <= 0 ? "0" : String(1 - f);
};

/** The splash: gobbets thrown on arcs; the pool spreads. */
const splash: Frame = (el, p) => {
  const t = clamp(p) * 0.9;
  for (const g of el.querySelectorAll<SVGCircleElement>(".abi-gob")) {
    const x = Number(g.dataset.vx) * t;
    const y = Number(g.dataset.vy) * t + 1100 * t * t;
    g.setAttribute("cx", x.toFixed(1));
    g.setAttribute("cy", Math.min(20, y).toFixed(1));
    g.style.opacity = y > 10 && t > 0.2 ? "0" : "1";
  }
  const pool = el.querySelector<SVGEllipseElement>(".abi-pool");
  if (pool) {
    const s = 1 - (1 - clamp(p * 1.6)) ** 3;
    pool.setAttribute("rx", (60 + 280 * s).toFixed(1));
    pool.setAttribute("ry", (14 + 30 * s).toFixed(1));
  }
};

/** The blade swings in to the cup and stops dead; sparks at the contact. */
const blade: Frame = (el, p) => {
  const body = el.querySelector<SVGGElement>(".abi-blade-body");
  const spark = el.querySelector<SVGGElement>(".abi-spark");
  if (!body || !spark) return;
  const swing = clamp(p / 0.35);
  const recoil = clamp((p - 0.35) / 0.3);
  const x = -520 * (1 - swing ** 2) - 40 * Math.sin(recoil * Math.PI);
  const r = -28 * (1 - swing) + 6 * Math.sin(recoil * Math.PI);
  body.setAttribute("transform", `translate(${x.toFixed(1)} 0) rotate(${r.toFixed(1)})`);
  const s = clamp((p - 0.35) / 0.25);
  spark.setAttribute("transform", `scale(${(0.3 + s * 1.2).toFixed(2)})`);
  spark.style.opacity = s <= 0 ? "0" : String(1 - s);
};

export const frames: Record<string, Frame> = {
  "asi-gauge": gauge,
  "asi-drip": drip,
  "asi-splash": splash,
  "asi-blade": blade,
};
