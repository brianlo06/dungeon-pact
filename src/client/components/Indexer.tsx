import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-clerks.css";

/**
 * The Indexer.
 *
 * The weakest thing in the game, and it has to look like it: a card drawer the
 * size of a lectern drawer stood on three brass legs no thicker than a pen,
 * with a single lens screwed on top where a head would be. There is daylight
 * everywhere in it. A hard look would knock it over.
 *
 * What it does is point. A fan of five thin rods reaches out on the party's
 * side, each tipped with a filing nib or a slip of card, and the rig swings the
 * whole fan on the hub at its shoulder — the point is the entire action, so the
 * fan is the only heavy detail in the drawing.
 *
 * Silhouette: a spidery little easel with a rake of needles off one side and
 * one round eye above. It shares nothing but its palette with the Scribe.
 */
const PARTS = ["legs", "body", "arms", "head"] as const;

/** The fan: hub-relative tips, drawn longest in the middle. */
const RODS: [number, number, number][] = [
  [15, 39, 3.2],
  [12, 47, 3.6],
  [11.5, 55, 3.6],
  [16, 63, 3.2],
  [23, 69, 2.8],
];

export function Indexer({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  return (
    <svg
      className={`indexer clerks-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Indexer"
    >
      <defs>
        <linearGradient id="idx-brass" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#dcc089" />
          <stop offset="0.5" stopColor="#b89a6a" />
          <stop offset="1" stopColor="#6a5430" />
        </linearGradient>
        <linearGradient id="idx-drawer" x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#6e6879" />
          <stop offset="0.6" stopColor="#474254" />
          <stop offset="1" stopColor="#262232" />
        </linearGradient>
        <linearGradient id="idx-card" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#ece3ca" />
          <stop offset="1" stopColor="#b5a982" />
        </linearGradient>
      </defs>

      {/* ---- legs: three brass pins, splayed, with pad feet ---- */}
      <g ref={hold("legs")} style={{ transformOrigin: "50px 92px" }}>
        {[
          [33, 93],
          [50, 95],
          [66, 92],
        ].map(([x, y]) => (
          <g key={x}>
            <path
              d={`M50 73 L${x} ${y}`}
              stroke="#171420"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            <path
              d={`M50 73 L${x} ${y}`}
              stroke="url(#idx-brass)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <ellipse
              cx={x}
              cy={y + 1.4}
              rx="3.2"
              ry="1.6"
              fill="#2e2a38"
              stroke="#171420"
              strokeWidth="1.2"
            />
          </g>
        ))}
        {/* The collar the three legs screw into. */}
        <ellipse
          cx="50"
          cy="72.5"
          rx="6"
          ry="2.6"
          fill="url(#idx-brass)"
          stroke="#171420"
          strokeWidth="1.5"
        />
      </g>

      {/* ---- body: a narrow card drawer, one card left sticking out ---- */}
      <g ref={hold("body")} style={{ transformOrigin: "50px 74px" }}>
        <rect
          x="42"
          y="38"
          width="17"
          height="35"
          rx="2"
          fill="url(#idx-drawer)"
          stroke="#171420"
          strokeWidth="2.1"
        />
        {/* Three drawers, each with the pale edge of a card pack showing: the
         * creature has to hold some light or it vanishes into the room. */}
        {[41.5, 50.5, 59.5].map((y) => (
          <g key={y}>
            <rect
              x="44"
              y={y}
              width="13"
              height="7.6"
              rx="1"
              fill="#211e2b"
              stroke="#171420"
              strokeWidth="1.1"
            />
            <rect
              x="45.2"
              y={y + 1.2}
              width="10.6"
              height="3.4"
              fill="url(#idx-card)"
            />
            <circle cx="50.5" cy={y + 6} r="1.1" fill="url(#idx-brass)" />
          </g>
        ))}
        {/* The one card it has not filed, left sticking out of the far side
         * where neither the lens nor the fan can hide it. */}
        <path
          d="M57 43.6 L71 40.4 L72.4 48 L58.4 51.2 Z"
          fill="url(#idx-card)"
          stroke="#171420"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <g stroke="#7d7250" strokeWidth="0.9">
          <path d="M60 45.6 L69 43.6" />
          <path d="M60.6 48.4 L66 47.2" />
        </g>
        <circle
          cx="47"
          cy="70"
          r="2.6"
          fill="#a8352a"
          stroke="#3a0f0c"
          strokeWidth="0.9"
        />
      </g>

      {/* ---- arms: the fan of pointing rods, on the party's side ---- */}
      <g ref={hold("arms")} style={{ transformOrigin: "44px 52px" }}>
        {RODS.map(([x, y, tip]) => (
          <g key={`${x}-${y}`}>
            <path
              d={`M44 52 L${x} ${y}`}
              stroke="#171420"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d={`M44 52 L${x} ${y}`}
              stroke="url(#idx-brass)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle
              cx={x}
              cy={y}
              r={tip}
              fill="url(#idx-card)"
              stroke="#171420"
              strokeWidth="1.3"
            />
          </g>
        ))}
        {/* The middle rod carries the nib it actually indexes with. */}
        <path
          d="M11.5 55 L4 54 L11.5 58 Z"
          fill="#241f2e"
          stroke="#171420"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* The hub the whole fan turns on. */}
        <circle
          cx="44"
          cy="52"
          r="5"
          fill="url(#idx-brass)"
          stroke="#171420"
          strokeWidth="1.8"
        />
        <circle cx="44" cy="52" r="1.8" fill="#191722" />
      </g>

      {/* ---- head: one lens on a thin neck, turned towards the party ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "50px 40px" }}>
        <path
          d="M50 40 L47 32"
          stroke="#171420"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M50 40 L47 32"
          stroke="url(#idx-brass)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle
          cx="43"
          cy="28"
          r="7.4"
          fill="url(#idx-brass)"
          stroke="#171420"
          strokeWidth="2"
        />
        <circle cx="43" cy="28" r="4.6" fill="#141220" />
        <circle className="idx-lens" cx="43" cy="28" r="3.1" />
        <circle cx="41.4" cy="26.4" r="1" fill="#f2f6ff" opacity="0.85" />
        {/* A wire bracket, so the lens reads as screwed on, not grown. */}
        <path
          d="M48.6 24 Q53 26 52.4 31"
          stroke="#171420"
          strokeWidth="1.6"
          fill="none"
        />
      </g>
    </svg>
  );
}
