import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-forge.css";

/**
 * The Living Bellows.
 *
 * A forge bellows that got up and walked. Its body is a long pleated leather
 * concertina strung between iron hoops, closed at the back by a heavy riveted
 * end-plate with a grate glowing through it and the old pump handles still
 * standing up off the top. At the front the pleats run into an iron collar
 * and a brass nozzle that flares into a horn: that is its mouth, and what
 * comes out of it is the furnace.
 *
 * Silhouette: long, low and level, with a saw-toothed outline top and bottom
 * where the folds are, a flared horn at one end and a V of handles at the
 * other, on a row of stubby legs. The Kiln Mender is a round sac held up high;
 * this is a horizontal tube held low, so the two foundry breathers share
 * nothing but a material.
 */
const PARTS = [
  "handles",
  "farLegs",
  "pleats",
  "plate",
  "snout",
  "plume",
  "nearLegs",
] as const;

/** Fold points along the body, rear to front. Even indices are ridges. */
const FOLDS = Array.from({ length: 9 }, (_, i) => {
  const t = i / 8;
  const h = (24 - 12 * t) * (i % 2 ? 0.74 : 1);
  const cy = 60 + 2 * t;
  return { x: 74 - i * 5.75, top: cy - h, bot: cy + h };
});

const outline =
  `M${FOLDS.map((f) => `${f.x} ${f.top.toFixed(2)}`).join(" L")} ` +
  `L${[...FOLDS]
    .reverse()
    .map((f) => `${f.x} ${f.bot.toFixed(2)}`)
    .join(" L")} Z`;

/** A short, thick, jointed leg ending in a clawed iron foot. */
const leg = (x: number, top: number, fill: string) => (
  <g key={x}>
    <path
      d={`M${x} ${top - 4} L${x + 5} ${top + 8} L${x - 1} 90`}
      stroke="#171420"
      strokeWidth="9"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d={`M${x} ${top - 4} L${x + 5} ${top + 8} L${x - 1} 90`}
      stroke={fill}
      strokeWidth="5.6"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d={`M${x - 9} 96 L${x - 7} 93 L${x - 5} 95 L${x - 4} 89 L${x + 4} 89 L${x + 5} 96 Z`}
      fill="#2a2632"
      stroke="#171420"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </g>
);

export function Bellows({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  return (
    <svg
      className={`bellows forge-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Living Bellows"
    >
      <defs>
        <linearGradient id="bel-iron" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#6a6274" />
          <stop offset="0.55" stopColor="#443e4e" />
          <stop offset="1" stopColor="#26222e" />
        </linearGradient>
        <linearGradient id="bel-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6c377" />
          <stop offset="0.5" stopColor="#b28840" />
          <stop offset="1" stopColor="#6f5122" />
        </linearGradient>
        <linearGradient id="bel-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a6040" />
          <stop offset="1" stopColor="#4e3222" />
        </linearGradient>
        <linearGradient id="bel-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="bel-fire" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c2442a" stopOpacity="0.85" />
          <stop offset="0.35" stopColor="#ff8a3a" />
          <stop offset="1" stopColor="#ffe29a" />
        </linearGradient>
      </defs>

      {/* ---- the old pump handles, standing up off the back ---- */}
      <g ref={hold("handles")} style={{ transformOrigin: "78px 40px" }}>
        <g strokeLinecap="round" fill="none">
          <path d="M74 40 L84 14" stroke="#171420" strokeWidth="6.5" />
          <path d="M74 40 L84 14" stroke="#5a3a26" strokeWidth="3.6" />
          <path d="M80 42 L94 20" stroke="#171420" strokeWidth="7" />
          <path d="M80 42 L94 20" stroke="url(#bel-wood)" strokeWidth="4" />
        </g>
        <circle
          cx="84.5"
          cy="13"
          r="3"
          fill="#2a2632"
          stroke="#171420"
          strokeWidth="1.6"
        />
        <circle
          cx="94.5"
          cy="19"
          r="3.4"
          fill="#443e4e"
          stroke="#171420"
          strokeWidth="1.6"
        />
      </g>

      {/* ---- far legs, in shadow behind the body ---- */}
      <g ref={hold("farLegs")} style={{ transformOrigin: "58px 80px" }}>
        {leg(38, 72, "#2a2530")}
        {leg(59, 78, "#2a2530")}
        {leg(79, 80, "#2a2530")}
      </g>

      {/* ---- pleats: the body, and the whole of its breathing ---- */}
      <g ref={hold("pleats")} style={{ transformOrigin: "76px 60px" }}>
        {FOLDS.slice(0, -1).map((f, i) => {
          const n = FOLDS[i + 1];
          return (
            <path
              key={i}
              d={`M${f.x} ${f.top} L${n.x} ${n.top} L${n.x} ${n.bot} L${f.x} ${f.bot} Z`}
              fill={i % 2 ? "#5a3222" : "#8a5838"}
            />
          );
        })}
        {/* Folds glow faintly in their valleys when the fire is drawn */}
        <g className="bel-folds" stroke="#ff8a3a" strokeWidth="1.2">
          {FOLDS.filter((_, i) => i % 2).map((f) => (
            <path key={f.x} d={`M${f.x} ${f.top + 2} L${f.x} ${f.bot - 2}`} />
          ))}
        </g>
        <path d={outline} fill="url(#bel-shade)" />
        {/* Iron hoops at every other ridge */}
        {FOLDS.filter((_, i) => i % 4 === 0 && i > 0).map((f) => (
          <g key={f.x}>
            <rect
              x={f.x - 1.6}
              y={f.top - 0.5}
              width="3.2"
              height={f.bot - f.top + 1}
              rx="1"
              fill="url(#bel-iron)"
              stroke="#171420"
              strokeWidth="1.2"
            />
            <circle cx={f.x} cy={f.top + 4} r="0.9" fill="#8a8296" />
            <circle cx={f.x} cy={f.bot - 4} r="0.9" fill="#8a8296" />
          </g>
        ))}
        <path
          d={outline}
          fill="none"
          stroke="#171420"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>

      {/* ---- the end-plate: riveted iron, a grate glowing through it ---- */}
      <g ref={hold("plate")} style={{ transformOrigin: "79px 60px" }}>
        <ellipse
          cx="79"
          cy="60"
          rx="7.5"
          ry="26.5"
          fill="url(#bel-iron)"
          stroke="#171420"
          strokeWidth="2.5"
        />
        <g className="bel-grate">
          <rect x="78" y="49" width="4" height="3" rx="1" />
          <rect x="78" y="55" width="4.6" height="3" rx="1" />
          <rect x="78" y="61" width="4.6" height="3" rx="1" />
          <rect x="78" y="67" width="4" height="3" rx="1" />
        </g>
        {[38, 44, 76, 82].map((y) => (
          <circle key={y} cx={y < 60 ? 79 : 78.5} cy={y} r="1" fill="#8a8296" />
        ))}
      </g>

      {/* ---- snout: iron collar, brass nozzle, a flared horn for a mouth ---- */}
      <g ref={hold("snout")} style={{ transformOrigin: "28px 62px" }}>
        {/*
         * The exhale. At rest it is folded up inside the nozzle, hidden behind
         * the brass; on an attack it is thrown out of the horn and opens.
         */}
        <g ref={hold("plume")} style={{ transformOrigin: "24px 62px" }}>
          <path
            d="M13 59 L15 60.5 L14 62 L15.5 63.5 L13 65 L24 63 L24 61 Z"
            fill="url(#bel-fire)"
          />
          <path d="M16 61.2 L24 61.8 L24 62.2 L16 62.8 Z" fill="#fff4d6" />
        </g>
        <path
          d="M25 56 L12 59 L12 65 L25 68 Z"
          fill="url(#bel-brass)"
          stroke="#171420"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M14 58.5 L4 50 Q1 62 4 73 L14 65.5 Z"
          fill="url(#bel-brass)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <ellipse className="bel-mouth" cx="4.3" cy="61.5" rx="2" ry="9" />
        {/* The collar, with a brow over two small eyes: it is alive */}
        <path
          d="M23 48 Q28 46 32 49 L32 76 Q28 78 23 76 Z"
          fill="url(#bel-iron)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* A heavy brow, and under it two small lit eyes */}
        <path
          d="M20 52 L34 46.5"
          stroke="#171420"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <circle className="bel-eye" cx="25" cy="55" r="1.9" />
        <circle className="bel-eye" cx="30.2" cy="53" r="1.4" />
        {[61, 66, 71].map((y) => (
          <circle key={y} cx="27.5" cy={y} r="0.9" fill="#8a8296" />
        ))}
      </g>

      {/* ---- near legs: stubby, iron-shod, planted ---- */}
      <g ref={hold("nearLegs")} style={{ transformOrigin: "50px 80px" }}>
        {leg(33, 70, "#4a4452")}
        {leg(54, 76, "#4a4452")}
        {leg(74, 80, "#4a4452")}
      </g>
    </svg>
  );
}
