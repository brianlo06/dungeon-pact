import type { ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { Strongbox } from "../../components/Strongbox";
import "./style.css";

/**
 * The Collector's entrance, drawn.
 *
 * The idea it serves: every chain in the Collector's Hoard ends in a lock, and
 * it holds the key. The dark overhead is full of what it has taken, hanging on
 * chains; an empty lock swings open for whatever the party carries; and when
 * the key comes down, every chain in the shaft snaps taut and the Strongbox is
 * set down to take the first of it.
 *
 *   col-curtain   on the real board: a curtain of chain drops shut behind the party
 *   col-hanging   the hoard overhead: chains, cages, a shield, a crown, swaying
 *   col-lock      one empty padlock on its chain, its shackle dropping open
 *   col-eyes      two lamps opening in the dark above the lock
 *   col-taut      every chain in the shaft snapping straight to the key's strike
 *   col-strongbox the Strongbox set down, its lid thrown back, light inside
 *   col-seize     a chain whipped out of the box, hauling a hero's blade back in
 *
 * Positions are world units; nothing is filtered, and nothing animates in CSS
 * on its own — motion is the window's `--p` or a frame function on the clock.
 */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const IRON = "#3d3230";
const IRON_HI = "#a08068";
const GOLD = "#e0b25a";

/** A vertical chain of links from (x, y0) down `len`, as SVG. */
function Chain({ x, y0, len, w = 8, color = IRON }: { x: number; y0: number; len: number; w?: number; color?: string }) {
  const n = Math.max(2, Math.floor(len / (w * 2.2)));
  const step = len / n;
  return (
    <g>
      {/* The furnace below catches the near edge of every link. */}
      <path d={`M${x + w * 0.35} ${y0} V${y0 + len}`} stroke="#ff9a4a" strokeWidth={w * 0.18} strokeDasharray={`${step * 0.5} ${step * 0.5}`} opacity={0.45} />
      {Array.from({ length: n }, (_, i) =>
        i % 2 === 0 ? (
          <ellipse key={i} cx={x} cy={y0 + i * step + step / 2} rx={w * 0.55} ry={step * 0.62} fill="none" stroke={color} strokeWidth={w * 0.42} />
        ) : (
          <rect key={i} x={x - w * 0.18} y={y0 + i * step} width={w * 0.36} height={step} fill={color} />
        ),
      )}
    </g>
  );
}

/** A padlock drawn about (0, 0), body 120 wide; `shackle` is its own group. */
function Padlock({ open }: { open?: boolean }) {
  return (
    <g>
      <g className="cbi-shackle" data-open={open ? "" : undefined}>
        <path d="M-38 -10 V-62 A38 38 0 0 1 38 -62 V-10" fill="none" stroke="#171420" strokeWidth={26} />
        <path d="M-38 -10 V-62 A38 38 0 0 1 38 -62 V-10" fill="none" stroke={IRON_HI} strokeWidth={16} />
      </g>
      <rect x={-60} y={-14} width={120} height={104} rx={14} fill="#3a2e2c" stroke="#171420" strokeWidth={7} />
      <rect x={-50} y={-4} width={100} height={12} rx={4} fill={IRON_HI} opacity={0.5} />
      <circle cy={34} r={13} fill="#0c090a" />
      <path d="M-5 38 H5 L9 66 H-9 Z" fill="#0c090a" />
      <path d="M-44 76 A60 30 0 0 0 44 76" stroke={GOLD} strokeWidth={3} fill="none" opacity={0.45} />
    </g>
  );
}

/* ── renderers ─────────────────────────────────────────────────────────── */

/** A curtain of chain dropping shut across the board behind the party. */
const Curtain = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 5);
  const from = Number(cue.params?.from ?? 0);
  const to = Number(cue.params?.to ?? 0.34);
  const strands = Array.from({ length: 18 }, (_, i) => ({
    x: from * 1600 + ((to - from) * 1600 * (i + 0.5)) / 18 + (rand() - 0.5) * 20,
    w: 9 + rand() * 6,
    lag: rand() * 0.12,
  }));
  return (
    <div className="cbi-curtain">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
        {strands.map((s, i) => (
          <g key={i} className="cbi-strand" style={{ "--lag": s.lag } as React.CSSProperties}>
            <Chain x={s.x} y0={-40} len={960} w={s.w} color="#4a3c38" />
          </g>
        ))}
        <rect className="cbi-bar" x={from * 1600 - 20} y={-8} width={(to - from) * 1600 + 40} height={34} fill="#4a3c38" stroke="#171420" strokeWidth={4} />
      </svg>
    </div>
  );
};

/** The hoard overhead: what the Collector has taken, hanging on chains. */
const Hanging = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 11);
  const dim = cue.params?.far ? 0.7 : 1;
  const kinds = ["cage", "shield", "crown", "sword", "cage", "box", "shield", "lantern"];
  const items = Array.from({ length: Number(cue.params?.count ?? 9) }, (_, i) => ({
    x: 80 + (1440 * (i + 0.5)) / Number(cue.params?.count ?? 9) + (rand() - 0.5) * 90,
    len: 180 + rand() * 360,
    kind: kinds[i % kinds.length],
    phase: rand() * Math.PI * 2,
    amp: 1.5 + rand() * 2.5,
    speed: 0.55 + rand() * 0.5,
  }));
  return (
    <div className="cbi-hanging" style={{ opacity: dim }}>
      <svg viewBox="0 -500 1600 1100" aria-hidden="true">
        {items.map((it, i) => (
          <g
            key={i}
            className="cbi-item"
            data-phase={it.phase.toFixed(3)}
            data-amp={it.amp.toFixed(2)}
            data-speed={it.speed.toFixed(2)}
            data-x={it.x.toFixed(1)}
          >
            <Chain x={it.x} y0={-520} len={it.len + 20} w={9} />
            <g transform={`translate(${it.x} ${it.len - 500})`}>
              <HungThing kind={it.kind} />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
};

/** One thing the Collector took, hung from its chain at (0, 0). */
function HungThing({ kind }: { kind: string }) {
  switch (kind) {
    case "cage":
      return (
        <g>
          <path d="M-44 0 H44 L50 18 V120 H-50 V18 Z" fill="#241a1a" stroke="#171420" strokeWidth={5} />
          {[-36, -18, 0, 18, 36].map((x) => (
            <path key={x} d={`M${x} 18 V120`} stroke={IRON_HI} strokeWidth={4} />
          ))}
          <path d="M-50 18 H50 M-50 120 H50" stroke={IRON_HI} strokeWidth={6} />
          <rect x={-12} y={56} width={24} height={20} rx={4} fill={GOLD} opacity={0.35} />
        </g>
      );
    case "shield":
      return (
        <g>
          <path d="M0 0 L42 16 V56 C42 90 18 108 0 118 C-18 108 -42 90 -42 56 V16 Z" fill="#4a3a36" stroke="#171420" strokeWidth={5} />
          <path d="M0 16 L28 26 V56 C28 80 12 94 0 100 Z" fill={IRON_HI} opacity={0.35} />
          <Padlock />
        </g>
      );
    case "crown":
      return (
        <g transform="translate(0 30)">
          <path d="M-46 30 L-46 -10 L-24 12 L0 -22 L24 12 L46 -10 V30 Z" fill="#8a6a34" stroke="#171420" strokeWidth={5} />
          <path d="M-46 30 H46" stroke={GOLD} strokeWidth={5} opacity={0.6} />
        </g>
      );
    case "sword":
      return (
        <g>
          <path d="M-5 0 H5 V150 L0 170 L-5 150 Z" fill="#8c8a94" stroke="#171420" strokeWidth={4} />
          <path d="M-26 22 H26" stroke={IRON_HI} strokeWidth={8} />
          <rect x={-5} y={0} width={10} height={20} fill="#241c1c" />
        </g>
      );
    case "box":
      return (
        <g>
          <rect x={-46} y={0} width={92} height={70} rx={6} fill="#4a3630" stroke="#171420" strokeWidth={5} />
          <path d="M-46 22 H46" stroke={GOLD} strokeWidth={4} opacity={0.5} />
          <circle cy={44} r={9} fill="#0c090a" />
        </g>
      );
    default:
      return (
        <g>
          <rect x={-20} y={0} width={40} height={56} rx={5} fill="#4a3630" stroke="#171420" strokeWidth={4} />
          <rect x={-12} y={10} width={24} height={34} fill={GOLD} opacity={0.25} />
        </g>
      );
  }
}

/** One empty padlock on its chain, swinging, its shackle dropping open. */
const Lock = ({ cue }: VfxProps) => (
  <div className="cbi-lock" data-open-at={String(cue.params?.openAt ?? 0.55)}>
    <svg viewBox="-160 -560 320 720" aria-hidden="true">
      <g className="cbi-lock-swing">
        <Chain x={0} y0={-600} len={500} w={16} />
        <g transform="translate(0 -40)">
          <Padlock />
        </g>
      </g>
    </svg>
  </div>
);

/** Two lamps opening in the dark. */
const Eyes = () => (
  <div className="cbi-eyes">
    <svg viewBox="-120 -40 240 80" aria-hidden="true">
      <ellipse className="cbi-eye-glow" cx={-46} cy={0} rx={34} ry={22} />
      <ellipse className="cbi-eye-glow" cx={46} cy={0} rx={34} ry={22} />
      <ellipse className="cbi-eye" cx={-46} cy={0} rx={12} ry={9} />
      <ellipse className="cbi-eye" cx={46} cy={0} rx={12} ry={9} />
    </svg>
  </div>
);

/** Every chain in the shaft snapping straight down to where the key struck. */
const Taut = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 23);
  const lines = Array.from({ length: 26 }, () => ({
    x: (rand() - 0.5) * 2400,
    w: 5 + rand() * 7,
    lag: rand() * 0.25,
  }));
  return (
    <div className="cbi-taut">
      <svg viewBox="-1200 -1400 2400 1400" aria-hidden="true">
        {lines.map((l, i) => (
          <g key={i} className="cbi-taut-line" style={{ "--lag": l.lag } as React.CSSProperties}>
            <path d={`M${l.x} -1400 L${l.x * 0.12} -40`} stroke="#1a1416" strokeWidth={l.w + 6} />
            <path d={`M${l.x} -1400 L${l.x * 0.12} -40`} stroke={IRON_HI} strokeWidth={l.w * 0.45} strokeDasharray="16 8" />
          </g>
        ))}
      </svg>
    </div>
  );
};

/** The Strongbox set down in front of the Collector, its lid thrown back. */
const Box = () => (
  <div className="cbi-box">
    <div className="cbi-box-glow" />
    <div className="cbi-box-art">
      <Strongbox held={1} itemIds={[]} state="holding" className="cbi-strongbox" />
    </div>
  </div>
);

/** A chain whipped out of the box and hauled back with a hero's blade on it. */
const Seize = () => (
  <div className="cbi-seize">
    <svg viewBox="-1100 -200 1200 400" aria-hidden="true">
      <path className="cbi-seize-chain" d="M0 0 L-10 0" stroke="#1a1416" strokeWidth={16} strokeLinecap="round" />
      <path className="cbi-seize-links" d="M0 0 L-10 0" stroke={IRON_HI} strokeWidth={7} strokeDasharray="18 10" />
      <g className="cbi-seize-hook">
        <path d="M0 0 C-30 -4 -44 -30 -30 -48" fill="none" stroke="#171420" strokeWidth={12} strokeLinecap="round" />
        <path d="M0 0 C-30 -4 -44 -30 -30 -48" fill="none" stroke={IRON_HI} strokeWidth={6} strokeLinecap="round" />
      </g>
      <g className="cbi-seize-blade">
        <path d="M-150 -9 H40 L66 0 L40 9 H-150 Z" fill="#c9ccd6" stroke="#171420" strokeWidth={5} />
        <path d="M-150 -26 V26" stroke="#8b6a3a" strokeWidth={12} />
        <rect x={-210} y={-8} width={60} height={16} fill="#5a3e2a" stroke="#171420" strokeWidth={4} />
      </g>
    </svg>
  </div>
);

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "col-curtain": Curtain,
  "col-hanging": Hanging,
  "col-lock": Lock,
  "col-eyes": Eyes,
  "col-taut": Taut,
  "col-strongbox": Box,
  "col-seize": Seize,
};

/* ── frames ────────────────────────────────────────────────────────────── */

/** The hoard sways: every item on its own slow pendulum about its chain's top. */
const hanging: Frame = (el, _p, age) => {
  const t = age / 1000;
  for (const g of el.querySelectorAll<SVGGElement>(".cbi-item")) {
    const d = g.dataset;
    const a = Number(d.amp) * Math.sin(t * Number(d.speed) * 2.2 + Number(d.phase));
    g.setAttribute("transform", `rotate(${a.toFixed(2)} ${d.x} -500)`);
  }
};

/** The lock swings, slowing; its shackle drops open at `openAt`. */
const lock: Frame = (el, p, age) => {
  const box = el.querySelector<HTMLElement>(".cbi-lock");
  const swing = el.querySelector<SVGGElement>(".cbi-lock-swing");
  const shackle = el.querySelector<SVGGElement>(".cbi-shackle");
  if (!box || !swing || !shackle) return;
  const t = age / 1000;
  const damp = 1 - clamp(p) * 0.6;
  swing.setAttribute("transform", `rotate(${(9 * damp * Math.sin(t * 3.1)).toFixed(2)} 0 -600)`);
  const open = clamp((p - Number(box.dataset.openAt)) / 0.08);
  shackle.setAttribute("transform", `translate(${(open * 10).toFixed(1)} ${(-open * 26).toFixed(1)}) rotate(${(open * -32).toFixed(1)} 38 -10)`);
};

/** The seizure: out to the blade by 0.42, a beat on it, and back with it by 1. */
const seize: Frame = (el, p) => {
  const reach = -420;
  const out = clamp(p / 0.42);
  const back = clamp((p - 0.55) / 0.45);
  const easeOut = 1 - (1 - out) ** 3;
  const easeBack = back * back;
  const tip = reach * easeOut * (1 - easeBack);
  const sag = Math.sin(Math.PI * clamp(p)) * 40;
  const d = `M0 0 Q${(tip / 2).toFixed(1)} ${sag.toFixed(1)} ${tip.toFixed(1)} 0`;
  el.querySelector(".cbi-seize-chain")?.setAttribute("d", d);
  el.querySelector(".cbi-seize-links")?.setAttribute("d", d);
  el.querySelector(".cbi-seize-hook")?.setAttribute("transform", `translate(${tip.toFixed(1)} 0)`);
  const blade = el.querySelector<SVGGElement>(".cbi-seize-blade");
  if (blade) {
    const caught = p >= 0.46;
    const bx = caught ? tip - 20 : reach - 20;
    const spin = caught ? back * -160 : 0;
    blade.setAttribute("transform", `translate(${bx.toFixed(1)} 30) rotate(${spin.toFixed(1)})`);
    blade.style.opacity = String(p < 0.3 ? p / 0.3 : back > 0.92 ? 1 - (back - 0.92) / 0.08 : 1);
  }
};

export const frames: Record<string, Frame> = {
  "col-hanging": hanging,
  "col-lock": lock,
  "col-seize": seize,
};
