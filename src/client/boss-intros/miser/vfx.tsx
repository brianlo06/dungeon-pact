import type { ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * The Miser's entrance, drawn.
 *
 * The idea it serves: the Miser hears the party's purse before it sees them.
 * It counts — a finger scratching tallies into stone — and one coin rolling in
 * the dark is enough to wake the heap; an eye opens in it, the Miser heaves up
 * out of its hoard, slams its hand down on it, and the gold the party kept
 * pours off them onto its back, where it becomes its shell.
 *
 *   msr-purse   on the real board: every hero's purse glinting, coins lifting off them
 *   msr-tally   four tally marks scratched and a fifth struck through them
 *   msr-coin    one coin rolling on the stone, circling, falling flat
 *   msr-eye     an eye opening in the heap
 *   msr-pour    coins pouring off something rising out of a heap
 *   msr-burst   coins thrown up where the hand comes down
 *   msr-stream  the party's gold flying in a stream onto the Miser's back
 *   msr-shell   the gold setting into a shell of coin-scales around it
 */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const GOLD = "#e7b650";
const GOLD_DEEP = "#8a6420";

function Coin({ r = 12 }: { r?: number }) {
  return (
    <g>
      <ellipse rx={r} ry={r} fill={GOLD_DEEP} />
      <ellipse rx={r * 0.84} ry={r * 0.84} fill={GOLD} />
      <ellipse rx={r * 0.5} ry={r * 0.5} fill="none" stroke={GOLD_DEEP} strokeWidth={r * 0.14} />
      <path d={`M${-r * 0.5} ${-r * 0.35} A${r * 0.6} ${r * 0.6} 0 0 1 ${r * 0.1} ${-r * 0.62}`} stroke="#fff0c0" strokeWidth={r * 0.14} fill="none" opacity={0.8} />
    </g>
  );
}

/** Coins lifting off a hero on the board, glinting. */
const Purse = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 3);
  return (
    <div className="mbi-purse">
      <svg viewBox="-60 -140 120 160" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i} className="mbi-purse-coin" style={{ "--i": i, "--dx": `${(rand() - 0.5) * 60}px` } as React.CSSProperties}>
            <Coin r={6 + rand() * 3} />
          </g>
        ))}
      </svg>
    </div>
  );
};

/** Four tallies and the fifth struck across them, scratched one after another. */
const Tally = () => (
  <div className="mbi-tally">
    <svg viewBox="-20 -20 240 200" aria-hidden="true">
      {[0, 40, 80, 120].map((x, i) => (
        <path key={i} className="mbi-stroke" pathLength={1} style={{ "--k": i } as React.CSSProperties} d={`M${x + 20} 10 L${x + 26} 150`} />
      ))}
      <path className="mbi-stroke mbi-strike" pathLength={1} style={{ "--k": 4 } as React.CSSProperties} d="M0 120 L200 40" />
    </svg>
  </div>
);

/** One coin rolling in the dark: a curve along the floor, a wobble, flat. */
const RollingCoin = () => (
  <div className="mbi-coin">
    <svg viewBox="-700 -120 900 160" aria-hidden="true">
      <defs>
        <radialGradient id="mbi-coin-glow">
          <stop offset="0" stopColor="#ffcf73" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ffcf73" stopOpacity={0} />
        </radialGradient>
      </defs>
      <g className="mbi-coin-body">
        <ellipse rx={70} ry={46} fill="url(#mbi-coin-glow)" />
        <ellipse className="mbi-coin-face" rx={22} ry={22} fill="#ffd36a" stroke="#b8862e" strokeWidth={4} />
      </g>
    </svg>
  </div>
);

/** Two eyes opening in the heap: a toad's, gold, with a flat bar of a pupil. */
const Eye = () => (
  <div className="mbi-eye">
    <svg viewBox="-160 -50 320 100" aria-hidden="true">
      {[-70, 70].map((x) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <path d="M-52 4 Q0 -46 52 4 Q0 30 -52 4 Z" fill="#241a0e" />
          <g className="mbi-eye-open">
            <path d="M-40 4 Q0 -30 40 4 Q0 20 -40 4 Z" fill="#d9a73a" />
            <path d="M-22 2 Q0 -5 22 2 Q0 8 -22 2 Z" fill="#120c08" />
            <ellipse cx={-12} cy={-8} rx={6} ry={3} fill="#fff4c6" opacity={0.75} />
          </g>
          <path className="mbi-eye-lid" d="M-54 4 Q0 -48 54 4 Z" fill="#6b5328" stroke="#171420" strokeWidth={4} />
        </g>
      ))}
    </svg>
  </div>
);

/** Coins pouring off something rising: many, falling on their own arcs. */
const Pour = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 17);
  return (
    <div className="mbi-pour">
      <svg viewBox="-400 -500 800 700" aria-hidden="true">
        {Array.from({ length: Number(cue.params?.count ?? 46) }, (_, i) => (
          <g
            key={i}
            className="mbi-drop"
            data-x={((rand() - 0.5) * 520).toFixed(1)}
            data-y={(-420 + rand() * 260).toFixed(1)}
            data-vx={((rand() - 0.5) * 160).toFixed(1)}
            data-delay={(rand() * 0.6).toFixed(3)}
            data-spin={(rand() * 720).toFixed(0)}
          >
            <Coin r={7 + rand() * 7} />
          </g>
        ))}
      </svg>
    </div>
  );
};

/** Coins thrown up and out where the hand comes down, and the dust ring. */
const Burst = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 29);
  return (
    <div className="mbi-burst">
      <svg viewBox="-600 -600 1200 700" aria-hidden="true">
        <ellipse className="mbi-ring" rx={260} ry={46} fill="none" stroke={GOLD} strokeWidth={10} />
        {Array.from({ length: 40 }, (_, i) => {
          const a = Math.PI * (0.1 + rand() * 0.8);
          const v = 380 + rand() * 520;
          return (
            <g
              key={i}
              className="mbi-fly"
              data-vx={(-Math.cos(a) * v).toFixed(1)}
              data-vy={(-Math.sin(a) * v).toFixed(1)}
              data-spin={(rand() * 900).toFixed(0)}
            >
              <Coin r={8 + rand() * 9} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/** The party's gold, streaming in from the left onto the Miser's back. */
const Stream = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 31);
  return (
    <div className="mbi-stream">
      <svg viewBox="-1200 -300 1300 500" aria-hidden="true">
        {Array.from({ length: 56 }, (_, i) => (
          <g
            key={i}
            className="mbi-flow"
            data-y0={((rand() - 0.5) * 360).toFixed(1)}
            data-arc={(80 + rand() * 180).toFixed(1)}
            data-delay={(rand() * 0.55).toFixed(3)}
          >
            <Coin r={6 + rand() * 6} />
          </g>
        ))}
      </svg>
    </div>
  );
};

/** The gold set into a shell: overlapping coin-scales in an arc over the back. */
const Shell = () => (
  <div className="mbi-shell">
    <svg viewBox="-260 -260 520 300" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => {
        const a = Math.PI * (1.05 + (i / 21) * 0.9);
        const row = i % 2;
        const rr = 200 - row * 46;
        return (
          <g key={i} className="mbi-scale" style={{ "--k": i / 22 } as React.CSSProperties} transform={`translate(${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr * 0.9).toFixed(1)})`}>
            <Coin r={26 - row * 5} />
          </g>
        );
      })}
    </svg>
  </div>
);

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "msr-purse": Purse,
  "msr-tally": Tally,
  "msr-coin": RollingCoin,
  "msr-eye": Eye,
  "msr-pour": Pour,
  "msr-burst": Burst,
  "msr-stream": Stream,
  "msr-shell": Shell,
};

/** The coin rolls in from the left along a curve, wobbles, and lies flat. */
const coin: Frame = (el, p) => {
  const body = el.querySelector<SVGGElement>(".mbi-coin-body");
  const face = el.querySelector<SVGEllipseElement>(".mbi-coin-face");
  if (!body || !face) return;
  const roll = clamp(p / 0.6);
  const e = 1 - (1 - roll) ** 2;
  const x = -640 + e * 600;
  const y = -Math.sin(e * Math.PI) * 30;
  body.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  const settle = clamp((p - 0.6) / 0.3);
  const wob = settle < 1 ? Math.abs(Math.sin(settle * 18)) * (1 - settle) : 0;
  face.setAttribute("rx", (22 * (settle < 1 ? 0.62 + wob * 0.3 + settle * 0.38 : 1)).toFixed(1));
  face.setAttribute("ry", (22 * (settle < 1 ? 1 - settle * 0.72 : 0.28)).toFixed(1));
};

/** Coins pour off: each falls from where it was on its own delay, spinning. */
const pour: Frame = (el, p) => {
  for (const g of el.querySelectorAll<SVGGElement>(".mbi-drop")) {
    const d = g.dataset;
    const k = clamp((p - Number(d.delay)) / 0.5);
    const x = Number(d.x) + Number(d.vx) * k;
    const y = Number(d.y) + 620 * k * k;
    g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(Number(d.spin) * k).toFixed(0)})`);
    g.style.opacity = k <= 0 ? "0" : k >= 1 ? "0" : "1";
  }
};

/** The burst: coins thrown up on arcs and falling back; the ring spreads. */
const burst: Frame = (el, p) => {
  const t = clamp(p) * 1.1;
  for (const g of el.querySelectorAll<SVGGElement>(".mbi-fly")) {
    const d = g.dataset;
    const x = Number(d.vx) * t;
    const y = Number(d.vy) * t + 900 * t * t;
    g.setAttribute("transform", `translate(${x.toFixed(1)} ${Math.min(40, y).toFixed(1)}) rotate(${(Number(d.spin) * t).toFixed(0)})`);
    g.style.opacity = y > 30 ? "0" : "1";
  }
  const ring = el.querySelector<SVGEllipseElement>(".mbi-ring");
  if (ring) {
    ring.setAttribute("rx", (80 + 360 * clamp(p * 2)).toFixed(1));
    ring.setAttribute("ry", (16 + 60 * clamp(p * 2)).toFixed(1));
    ring.style.opacity = String(1 - clamp(p * 2));
  }
};

/** The stream: each coin flies from the left edge to the back on an arc. */
const stream: Frame = (el, p) => {
  for (const g of el.querySelectorAll<SVGGElement>(".mbi-flow")) {
    const d = g.dataset;
    const k = clamp((p - Number(d.delay)) / 0.45);
    const x = -1150 + 1150 * k;
    const y = Number(d.y0) * (1 - k) - Math.sin(k * Math.PI) * Number(d.arc);
    g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(1 - k * 0.5).toFixed(2)})`);
    g.style.opacity = k <= 0 || k >= 1 ? "0" : "1";
  }
};

export const frames: Record<string, Frame> = {
  "msr-coin": coin,
  "msr-pour": pour,
  "msr-burst": burst,
  "msr-stream": stream,
};
