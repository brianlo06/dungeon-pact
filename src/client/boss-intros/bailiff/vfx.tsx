import type { ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * The Bailiff's entrance, drawn.
 *
 * The idea it serves: the Bailiff comes to collect, by the book. Three knocks;
 * a hall of doors already served; boots that stop outside and a summons slid
 * under the door; the door opened on it; one rap of the tipstaff to open the
 * court — and then a writ served on a hero, tethered to the staff, which the
 * hero tears off and serves straight back.
 *
 *   bli-dust     dust shaken down from the top of the screen at each knock
 *   bli-under    the gap under the door: lamplight, two boots' shadows, a summons slid through
 *   bli-door     the court door swung in off its hinge, the lit court behind it
 *   bli-papers   summons thrown up at the rap, turning as they fall
 *   bli-writ     a writ flown onto a hero, tethered to the staff, torn off and served back
 */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const PAPER = "#d8cfb6";
const LIEN = "#c9443a";
const LAMP = "#ffd98a";

/** A served writ: a folded sheet with its red band. */
function Writ({ w = 90, h = 120 }: { w?: number; h?: number }) {
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={PAPER} stroke="#171420" strokeWidth={5} />
      {[-0.28, -0.1, 0.08].map((k) => (
        <path key={k} d={`M${-w / 2 + 12} ${h * k} H${w / 2 - 14}`} stroke="#7a705a" strokeWidth={4} />
      ))}
      <path d={`M${-w / 2 - 6} ${h * 0.26} L${w / 2 + 6} ${h * 0.16}`} stroke={LIEN} strokeWidth={12} />
      <circle cx={w / 2 - 18} cy={h / 2 - 18} r={10} fill={LIEN} stroke="#171420" strokeWidth={3} />
    </g>
  );
}

/** Dust sifting down from the top edge of the screen, in three falls. */
const Dust = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 9);
  return (
    <div className="bbi-dust">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} className="bbi-mote" r={3 + rand() * 5} cx={rand() * 1600} data-k={i % 3} data-v={(0.6 + rand() * 0.8).toFixed(2)} fill="#d8d0c0" />
        ))}
      </svg>
    </div>
  );
};

/** Under the door: a line of light, two boots' shadows arriving, a summons sliding out. */
const Under = () => (
  <div className="bbi-under">
    <svg viewBox="-500 -200 1000 400" aria-hidden="true">
      <defs>
        <linearGradient id="bbi-spill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LAMP} stopOpacity={0.6} />
          <stop offset="1" stopColor={LAMP} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={-500} y={-200} width={1000} height={190} fill="#3a2a1e" stroke="#0a0a0e" strokeWidth={8} />
      <path d="M-500 -60 H500" stroke="#4a4652" strokeWidth={30} />
      <rect x={-560} y={6} width={1120} height={200} fill="#15171c" />
      <rect x={-500} y={-10} width={1000} height={16} fill={LAMP} />
      <path d="M-500 6 H500 L560 200 H-560 Z" fill="url(#bbi-spill)" />
      <g className="bbi-boots">
        <rect x={-150} y={-10} width={110} height={16} fill="#0a0a0e" />
        <rect x={40} y={-10} width={110} height={16} fill="#0a0a0e" />
        <path d="M-150 6 L-190 200 H-10 L-40 6 Z M40 6 L10 200 H190 L150 6 Z" fill="#0a0a0e" opacity={0.55} />
      </g>
      <g className="bbi-summons">
        <path d="M-70 0 L70 0 L90 60 L-90 60 Z" fill={PAPER} stroke="#171420" strokeWidth={5} />
        <path d="M-80 30 L80 22" stroke={LIEN} strokeWidth={10} />
      </g>
    </svg>
  </div>
);

/** The court door, swung inward on its left hinge, the lit court showing behind it. */
const Door = () => (
  <div className="bbi-door">
    <svg viewBox="0 0 380 620" aria-hidden="true">
      <defs>
        <radialGradient id="bbi-court" cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#fff0c8" />
          <stop offset="0.5" stopColor={LAMP} />
          <stop offset="1" stopColor="#8a5a2a" />
        </radialGradient>
      </defs>
      <rect className="bbi-opening" x={0} y={0} width={380} height={620} fill="url(#bbi-court)" />
      <g className="bbi-leaf">
        <rect x={0} y={0} width={380} height={620} fill="#3a2a1e" stroke="#0a0a0e" strokeWidth={10} />
        {[90, 310, 510].map((y) => (
          <path key={y} d={`M0 ${y} H380`} stroke="#4a4652" strokeWidth={18} />
        ))}
        <circle cx={340} cy={320} r={14} fill="#8a7a4a" stroke="#0a0a0e" strokeWidth={4} />
      </g>
    </svg>
  </div>
);

/** Summons thrown up at the rap, turning as they come down. */
const Papers = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 4);
  return (
    <div className="bbi-papers">
      <svg viewBox="-600 -600 1200 700" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} className="bbi-sheet" data-vx={((rand() - 0.5) * 900).toFixed(1)} data-vy={(-500 - rand() * 400).toFixed(1)} data-spin={((rand() - 0.5) * 1200).toFixed(0)}>
            <Writ w={50} h={66} />
          </g>
        ))}
      </svg>
    </div>
  );
};

/** The writ: out of the Bailiff's fist onto a hero, tethered to the staff; torn off and thrown back. */
const WritServed = ({ cue }: VfxProps) => (
  <div className="bbi-writ">
    <svg viewBox="-700 -300 900 500" aria-hidden="true">
      <path className="bbi-tether" data-tx={Number(cue.params?.tx ?? -500)} data-ty={Number(cue.params?.ty ?? 40)} d="M0 0 L-500 0" stroke={LIEN} strokeWidth={6} strokeDasharray="18 12" />
      <g className="bbi-served">
        <Writ />
        <g className="bbi-ticks">
          {[0, 1, 2].map((n) => (
            <rect key={n} x={-45 + n * 34} y={-96} width={22} height={22} fill={LIEN} stroke="#171420" strokeWidth={4} />
          ))}
        </g>
      </g>
    </svg>
  </div>
);

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "bli-dust": Dust,
  "bli-under": Under,
  "bli-door": Door,
  "bli-papers": Papers,
  "bli-writ": WritServed,
};

/** Three falls of dust, one per knock at 0.08, 0.33, 0.58 of the shot. */
const dust: Frame = (el, p) => {
  for (const m of el.querySelectorAll<SVGCircleElement>(".bbi-mote")) {
    const k = clamp((p - (0.08 + Number(m.dataset.k) * 0.25)) / 0.5);
    const y = k * k * 520 * Number(m.dataset.v);
    m.setAttribute("cy", y.toFixed(1));
    m.style.opacity = k <= 0 ? "0" : String(0.8 * (1 - k));
  }
};

/** The boots arrive and stop by 0.35; the summons slides out from 0.45. */
const under: Frame = (el, p) => {
  const boots = el.querySelector<SVGGElement>(".bbi-boots");
  const summons = el.querySelector<SVGGElement>(".bbi-summons");
  if (!boots || !summons) return;
  const walk = 1 - (1 - clamp(p / 0.35)) ** 2;
  boots.setAttribute("transform", `translate(${(-600 * (1 - walk)).toFixed(1)} 0)`);
  const slide = 1 - (1 - clamp((p - 0.45) / 0.35)) ** 3;
  summons.setAttribute("transform", `translate(0 ${(-40 + slide * 140).toFixed(1)}) scale(${(0.7 + slide * 0.5).toFixed(2)})`);
  summons.style.opacity = slide <= 0 ? "0" : "1";
};

/** The leaf swings in: it foreshortens about its left edge. */
const door: Frame = (el, p) => {
  const leaf = el.querySelector<SVGGElement>(".bbi-leaf");
  if (!leaf) return;
  const open = 1 - (1 - clamp(p / 0.5)) ** 3;
  leaf.setAttribute("transform", `scale(${(1 - open * 0.86).toFixed(3)} 1)`);
};

/** The papers: thrown up, turning, falling off the bottom. */
const papers: Frame = (el, p) => {
  const t = clamp(p) * 1.2;
  for (const s of el.querySelectorAll<SVGGElement>(".bbi-sheet")) {
    const d = s.dataset;
    const x = Number(d.vx) * t;
    const y = Number(d.vy) * t + 900 * t * t;
    s.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(Number(d.spin) * t).toFixed(0)})`);
  }
};

/**
 * The writ: flies from the fist (0, 0) to the hero (`tx`, `ty`) by 0.3 and pins;
 * the tether draws; its three ticks show; at 0.66 it is torn off and thrown
 * back, arriving on the Bailiff at 0.86.
 */
const writ: Frame = (el, p) => {
  const served = el.querySelector<SVGGElement>(".bbi-served");
  const tether = el.querySelector<SVGPathElement>(".bbi-tether");
  const ticks = el.querySelector<SVGGElement>(".bbi-ticks");
  if (!served || !tether || !ticks) return;
  const tx = Number(tether.dataset.tx);
  const ty = Number(tether.dataset.ty);
  const out = 1 - (1 - clamp(p / 0.3)) ** 2;
  const back = clamp((p - 0.66) / 0.2);
  const eb = back * back;
  const x = tx * out - tx * eb;
  const y = ty * out - Math.sin(out * Math.PI) * 80 - Math.sin(back * Math.PI) * 120 - ty * eb;
  const spin = out < 1 ? (1 - out) * 360 : back * -540;
  served.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${spin.toFixed(0)}) scale(${(0.6 + out * 0.4).toFixed(2)})`);
  served.style.opacity = back >= 1 ? "0" : "1";
  const tie = clamp((p - 0.3) / 0.12) * (1 - clamp((p - 0.62) / 0.06));
  tether.setAttribute("d", `M0 0 L${(tx * tie).toFixed(1)} ${(ty * tie).toFixed(1)}`);
  tether.style.opacity = tie <= 0 ? "0" : "1";
  ticks.style.opacity = p > 0.34 && back <= 0 ? "1" : "0";
};

export const frames: Record<string, Frame> = {
  "bli-dust": dust,
  "bli-under": under,
  "bli-door": door,
  "bli-papers": papers,
  "bli-writ": writ,
};
