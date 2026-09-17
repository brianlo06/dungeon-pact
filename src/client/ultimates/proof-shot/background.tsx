import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Proof Shot's space: the proof range.
 *
 * Where the armourers' guild proves its plates: a long, straight lane of
 * packed black cinder between two low earth banks, running away from the
 * lens to a great earth butt at the far end under an even pewter sky. Along
 * the lane, iron frames with breastplates hung from them by chains, every
 * one holed by old shots — proof marks — each frame further off and smaller
 * than the last; white pace lines across the cinder, weathered; a tall pole
 * for the range flag. It is overcast and windy, and nothing else.
 *
 * Seen from both ends, which is what the film is about:
 *
 *   ps-lane  from the shooting line: the lane runs away to the upper right,
 *            the butt a small dark mound at the vanishing point in blue haze;
 *   ps-butt  from the butt: the same lane mirrored, running away to the
 *            upper left, the butt a wall of earth close on the right and the
 *            shooting line a notch far off in the haze.
 *
 * Distance goes blue: the far half of the lane, whichever end that is, is
 * hazed into the accent. Both are the 3200×1800 box of the other backgrounds
 * (world units: the stage is 0…1600 × 0…900), nothing here moves, and the
 * flag itself is an effect, so it can fly and drop on the film's clock.
 */

export const BLUE = "#6a9bff";
export const PEWTER = {
  skyTop: "#8f989f",
  skyLow: "#c5cbd0",
  bank: "#4c524b",
  bankLit: "#5d645b",
  cinder: "#26282b",
  cinderLit: "#33363a",
  earth: "#3a3632",
  earthDark: "#2a2724",
  iron: "#1b1d20",
  steel: "#8b96a2",
  steelLit: "#b8c1ca",
  rust: "#6e4a35",
  line: "#d9dde0",
  ink: "#111418",
} as const;

/** The vanishing point (drawing coordinates: the far end is at the right). */
const VP: [number, number] = [1500, 415];
/** A point along a line from (−800, y0) at the near edge to the vanishing point, `s` of the way. */
const edge = (y0: number, s: number): [number, number] => [-800 + s * (VP[0] + 800), y0 + s * (VP[1] - y0)];
const f1 = (n: number) => n.toFixed(1);
const pt = ([x, y]: [number, number]) => `${f1(x)} ${f1(y)}`;

/** The lane's far edge (where the far bank begins) and its near edge, in drawing units at the near end. */
const FAR_EDGE = 520;
const NEAR_EDGE = 1700;

/**
 * A breastplate: a rounded trapezoid with a neck cut-out, hung by a chain
 * from a bar. Drawn on a 100-unit box with the hook at the top; `holes` are
 * old proof marks with the sky showing through.
 */
export function PlateArt({ holes, tone = 1 }: { holes: [number, number, number][]; tone?: number }) {
  return (
    <g className="ps-plate-art" style={{ opacity: tone }}>
      <path d="M-34 -30 C-38 -14 -40 12 -34 36 C-20 46 20 46 34 36 C40 12 38 -14 34 -30 C24 -36 12 -36 8 -28 C4 -20 -4 -20 -8 -28 C-12 -36 -24 -36 -34 -30 Z" fill={PEWTER.steel} stroke={PEWTER.ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M-30 -26 C-34 -10 -35 10 -30 30" stroke={PEWTER.steelLit} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M20 -22 C30 -2 30 18 22 34" stroke={PEWTER.rust} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.55" />
      <path d="M-6 8 C4 4 12 10 8 22" stroke={PEWTER.rust} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.4" />
      {holes.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r * 1.5} fill={PEWTER.ink} opacity="0.55" />
          <path
            d={`M${x - r} ${y} L${x - r * 0.3} ${y - r * 1.1} L${x + r * 0.5} ${y - r * 0.9} L${x + r * 1.1} ${y + r * 0.2} L${x + r * 0.4} ${y + r} L${x - r * 0.6} ${y + r * 0.8} Z`}
            fill={PEWTER.skyLow}
            stroke={PEWTER.ink}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </g>
  );
}

/** An iron frame — two legs and a bar — with a plate hung from it. */
function Frame({ s, seed, y0 }: { s: number; seed: number; y0: number }) {
  const [x, y] = edge(y0, s);
  const k = Math.max(0.05, (1 - s) * 1.15);
  const rand = seeded(seed);
  const holes: [number, number, number][] = Array.from({ length: 1 + Math.floor(rand() * 2) }, () => [
    -16 + rand() * 32,
    -14 + rand() * 30,
    3.5 + rand() * 3,
  ]);
  const h = 300;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${k.toFixed(3)})`}>
      <ellipse cx="0" cy="6" rx="70" ry="10" fill={PEWTER.ink} opacity="0.45" />
      <path d={`M-52 0 L-14 ${-h} L14 ${-h} L52 0`} fill="none" stroke={PEWTER.iron} strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
      <path d={`M-14 ${-h} H14`} stroke={PEWTER.iron} strokeWidth="11" strokeLinecap="round" />
      <path d={`M0 ${-h + 4} V${-h + 60}`} stroke={PEWTER.iron} strokeWidth="5" strokeDasharray="7 5" />
      <g transform={`translate(0 ${-h + 100}) scale(1.35)`}>
        <PlateArt holes={holes} />
      </g>
    </g>
  );
}

/** A pace line: a white stripe across the lane at `s`, weathered. */
function Pace({ s, seed }: { s: number; seed: number }) {
  const a = edge(FAR_EDGE, s);
  const b = edge(NEAR_EDGE, s);
  const w = Math.max(3, (1 - s) * 22);
  const rand = seeded(seed);
  return (
    <g>
      <path d={`M${pt(a)} L${pt(b)}`} stroke={PEWTER.line} strokeWidth={w} strokeLinecap="round" opacity={0.28 + (1 - s) * 0.3} />
      {Array.from({ length: 5 }, (_, i) => {
        const t = rand();
        const x = a[0] + (b[0] - a[0]) * t;
        const y = a[1] + (b[1] - a[1]) * t;
        return <ellipse key={i} cx={x} cy={y} rx={w * (1.2 + rand())} ry={w * 0.5} fill={PEWTER.cinder} opacity="0.7" />;
      })}
    </g>
  );
}

function Sky() {
  return (
    <>
      <rect x="-800" y="-450" width="3200" height={VP[1] + 452} fill="url(#ps-sky)" />
      {[
        [-500, 60, 900, 34, 0.18],
        [700, 170, 1300, 40, 0.14],
        [-300, 300, 1500, 28, 0.12],
        [1400, 330, 900, 22, 0.1],
      ].map(([x, y, w, h, o], i) => (
        <ellipse key={i} cx={x} cy={y} rx={w} ry={h} fill="#e3e7ea" opacity={o} />
      ))}
      {[
        [200, 120, 1100, 30],
        [1300, 240, 800, 24],
      ].map(([x, y, w, h], i) => (
        <ellipse key={i} cx={x} cy={y} rx={w} ry={h} fill="#727b83" opacity="0.16" />
      ))}
    </>
  );
}

function Defs() {
  return (
    <defs>
      <linearGradient id="ps-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={PEWTER.skyTop} />
        <stop offset="0.7" stopColor="#aab2b8" />
        <stop offset="1" stopColor={PEWTER.skyLow} />
      </linearGradient>
      <linearGradient id="ps-lane-g" gradientUnits="userSpaceOnUse" x1="-800" y1="0" x2={VP[0]} y2="0">
        <stop offset="0" stopColor={PEWTER.cinder} />
        <stop offset="0.75" stopColor={PEWTER.cinderLit} />
        <stop offset="1" stopColor="#5a6470" />
      </linearGradient>
      <linearGradient id="ps-bank-g" gradientUnits="userSpaceOnUse" x1="-800" y1="0" x2={VP[0]} y2="0">
        <stop offset="0" stopColor={PEWTER.bank} />
        <stop offset="0.8" stopColor={PEWTER.bankLit} />
        <stop offset="1" stopColor="#6e7a86" />
      </linearGradient>
      <linearGradient id="ps-haze" gradientUnits="userSpaceOnUse" x1="200" y1="0" x2={VP[0]} y2="0">
        <stop offset="0" stopColor={BLUE} stopOpacity="0" />
        <stop offset="0.7" stopColor={BLUE} stopOpacity="0.22" />
        <stop offset="1" stopColor={BLUE} stopOpacity="0.4" />
      </linearGradient>
      <radialGradient id="ps-haze-far" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#b9cdf5" stopOpacity="0.55" />
        <stop offset="1" stopColor="#b9cdf5" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ps-earth" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={PEWTER.earthDark} />
        <stop offset="1" stopColor={PEWTER.earth} />
      </linearGradient>
    </defs>
  );
}

const PACES = [0.2, 0.42, 0.58, 0.7, 0.79, 0.86, 0.91];
const FRAMES = [0.28, 0.6, 0.72, 0.82, 0.9];

const Scene = ({ near }: { near: "line" | "butt" }) => {
  const farBank: [number, number] = edge(FAR_EDGE, 0);
  const nearBank: [number, number] = edge(NEAR_EDGE, 0);
  const rand = seeded(near === "butt" ? 91 : 71);
  return (
    <>
      <Sky />
      {/* The far bank: a low earth wall along the far side of the lane, up to the horizon. */}
      <path d={`M-800 ${VP[1] - 70} L${VP[0]} ${VP[1] - 4} L${VP[0]} ${VP[1]} L${pt(farBank)} Z`} fill="url(#ps-bank-g)" />
      <path d={`M-800 ${VP[1] - 70} L${VP[0]} ${VP[1] - 4}`} stroke="#6b726a" strokeWidth="6" opacity="0.6" />
      {/* The lane. */}
      <path d={`M${pt(nearBank)} L${pt(farBank)} L${VP[0]} ${VP[1]} Z`} fill="url(#ps-lane-g)" />
      <path d={`M${pt(nearBank)} L${pt(farBank)} L${VP[0]} ${VP[1]} Z`} fill="url(#ps-haze)" />
      {/* Clinker and stones on the cinder, fewer and smaller further off. */}
      {Array.from({ length: 90 }, (_, i) => {
        const s = Math.pow(rand(), 1.4) * 0.92;
        const t = rand();
        const a = edge(FAR_EDGE, s);
        const b = edge(NEAR_EDGE, s);
        const x = a[0] + (b[0] - a[0]) * t;
        const y = a[1] + (b[1] - a[1]) * t;
        const k = (1 - s) * 14;
        return <ellipse key={i} cx={x} cy={y} rx={k * (0.6 + rand())} ry={k * 0.4} fill={rand() < 0.5 ? "#3c4045" : "#1a1c1f"} opacity="0.8" />;
      })}
      {/* The near bank: a strip of turf along the bottom. */}
      <path d={`M-800 1800 L-800 ${NEAR_EDGE - 40} L${VP[0]} ${VP[1]} L2400 1800 Z`} fill={PEWTER.bank} />
      <path d={`M-800 ${NEAR_EDGE - 40} L${VP[0]} ${VP[1]}`} stroke="#5d645b" strokeWidth="8" opacity="0.7" />
      {PACES.map((s, i) => (
        <Pace key={i} s={s} seed={11 + i} />
      ))}
      {FRAMES.map((s, i) => (
        <Frame key={i} s={s} seed={31 + i} y0={720} />
      ))}
      {near === "line" ? (
        <>
          {/* The butt, far off: a dark mound of earth at the end of the lane, and the flag's pole beside it. */}
          <ellipse cx={VP[0] - 30} cy={VP[1] + 6} rx="150" ry="46" fill={PEWTER.earth} />
          <ellipse cx={VP[0] - 30} cy={VP[1] - 2} rx="120" ry="30" fill="#4a453f" />
          <path d={`M${VP[0] - 80} ${VP[1] + 12} V${VP[1] - 118}`} stroke={PEWTER.iron} strokeWidth="5" strokeLinecap="round" />
          <ellipse cx={VP[0] - 20} cy={VP[1]} rx="520" ry="170" fill="url(#ps-haze-far)" />
          {/* The shooting line: a whitewashed post at the near end. */}
          <path d="M-230 1010 L-222 760 L-196 760 L-192 1010 Z" fill="#c9ccc6" stroke={PEWTER.ink} strokeWidth="4" strokeLinejoin="round" />
          <path d="M-224 800 H-198 M-222 860 H-196" stroke={PEWTER.ink} strokeWidth="3" />
        </>
      ) : (
        <>
          {/* The shooting line, far off: a notch of white post in the haze. */}
          <ellipse cx={VP[0] - 20} cy={VP[1]} rx="520" ry="170" fill="url(#ps-haze-far)" />
          <path d={`M${VP[0] - 60} ${VP[1] + 10} V${VP[1] - 36}`} stroke="#d5d8d4" strokeWidth="4" strokeLinecap="round" />
          {/* The butt, close: a wall of raw earth with a turf cap, filling the near end. */}
          <path d="M-800 1800 L-800 260 C-500 220 -100 250 380 300 C520 320 560 700 560 1000 L560 1800 Z" fill="url(#ps-earth)" />
          <path d="M-800 260 C-500 220 -100 250 380 300 C440 306 480 330 500 380 L-800 380 Z" fill={PEWTER.bank} />
          <path d="M-800 262 C-500 222 -100 252 380 302" stroke="#6b726a" strokeWidth="8" fill="none" opacity="0.7" />
          {Array.from({ length: 34 }, (_, i) => {
            const x = -780 + rand() * 1300;
            const y = 400 + rand() * 1200;
            return <ellipse key={i} cx={x} cy={y} rx={14 + rand() * 40} ry={6 + rand() * 14} fill={rand() < 0.5 ? "#2b2825" : "#46413b"} opacity="0.8" />;
          })}
          {/* Old arrows left standing in the earth, and a scatter of fallen plates at its foot. */}
          {[
            [-120, 620, -30],
            [-300, 780, -22],
            [60, 900, -34],
            [-460, 1050, -26],
            [220, 1180, -30],
          ].map(([x, y, a], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
              <path d="M0 0 H150" stroke={PEWTER.ink} strokeWidth="7" strokeLinecap="round" />
              <path d="M0 0 H150" stroke="#8a7a62" strokeWidth="3" strokeLinecap="round" />
              <path d="M150 -7 L166 0 L150 7 L156 0 Z" fill="#8a3b30" stroke={PEWTER.ink} strokeWidth="2" />
            </g>
          ))}
          <g transform="translate(300 1500) rotate(-70) scale(2.1)">
            <PlateArt holes={[[-6, -4, 6], [14, 18, 4]]} tone={0.8} />
          </g>
          {/* The flag's pole, tall, at the near end of the lane. */}
          <path d="M300 1180 V404" stroke={PEWTER.iron} strokeWidth="14" strokeLinecap="round" />
          <path d="M294 1180 V404" stroke="#3a3f45" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="300" cy="1184" rx="60" ry="12" fill={PEWTER.ink} opacity="0.5" />
        </>
      )}
    </>
  );
};

function Lane() {
  return (
    <svg className="cine-bg-svg ps-bg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Defs />
      <Scene near="line" />
    </svg>
  );
}

/** The same range from the butt's end: mirrored about the stage's middle. */
function Butt() {
  return (
    <svg className="cine-bg-svg ps-bg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Defs />
      <g transform="translate(1600 0) scale(-1 1)">
        <Scene near="butt" />
      </g>
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "ps-lane": Lane,
  "ps-butt": Butt,
};
