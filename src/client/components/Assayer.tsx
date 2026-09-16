import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-assayer.css";

/**
 * The Assayer.
 *
 * The foundry's appraiser: it does not count what you carry, it melts it down
 * to see what it was worth. A squat smelting construct — a kiln for a belly
 * with a grate that glows, a tall flue raked back off one shoulder, a small
 * riveted helm whose one eye is a gauge dial — carrying a crucible out in
 * front of it on a pair of long tongs, towards the party.
 *
 * Rigged as `legs`, `body`, `flue`, `head` and `tongs` (the crucible rides the
 * tongs). The crucible carries every move: lifted and glowing through the heat,
 * tipped to pour, jabbed with the tongs for a lesser blow.
 *
 * Silhouette test: a round low mass, a chimney spike behind, and a long arm
 * with a cup at its end held out on the party's side. Filled black it is a
 * furnace holding something out.
 *
 * Enemies face the party, to their left, so the tongs are on the left.
 */
const PARTS = ["legs", "body", "flue", "head", "tongs"] as const;

export function Assayer({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  return (
    <svg
      className={`assayer ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="The Assayer"
    >
      <defs>
        <linearGradient id="asy-iron" x1="0.2" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#6a4a42" />
          <stop offset="0.5" stopColor="#4a302c" />
          <stop offset="1" stopColor="#2a1a19" />
        </linearGradient>
        <linearGradient id="asy-steel" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#5c5a64" />
          <stop offset="1" stopColor="#2c2a33" />
        </linearGradient>
        <radialGradient id="asy-melt" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#fff2b0" />
          <stop offset="0.45" stopColor="#ffb03a" />
          <stop offset="1" stopColor="#c2410f" />
        </radialGradient>
        <linearGradient id="asy-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2c27c" />
          <stop offset="1" stopColor="#7a5a26" />
        </linearGradient>
      </defs>

      {/* ---- the flue, raked back off the far shoulder ---- */}
      <g ref={hold("flue")} style={{ transformOrigin: "66px 40px" }}>
        <path d="M62 42 L70 6 H80 L74 44 Z" fill="url(#asy-steel)" stroke="#171420" strokeWidth="2" />
        <rect x="67.5" y="2" width="15" height="6" rx="1" fill="url(#asy-steel)" stroke="#171420" strokeWidth="1.8" />
        {[16, 26].map((y) => (
          <path key={y} d={`M${69.5 - (y - 6) * 0.05} ${y} H${79.5 - (y - 6) * 0.17}`} stroke="#171420" strokeWidth="1.2" />
        ))}
      </g>

      {/* ---- legs: short, bowed, clawed ---- */}
      <g ref={hold("legs")} style={{ transformOrigin: "56px 80px" }}>
        <path d="M44 76 L40 92 H50 L52 78 Z" fill="url(#asy-steel)" stroke="#171420" strokeWidth="2" />
        <path d="M62 76 L66 92 H76 L70 76 Z" fill="url(#asy-steel)" stroke="#171420" strokeWidth="2" />
        <path d="M37 93 L41 89 L45 93 L49 89 L52 93 Z" fill="#171420" />
        <path d="M63 93 L67 89 L71 93 L75 89 L78 93 Z" fill="#171420" />
      </g>

      {/* ---- body: the kiln, its grate glowing ---- */}
      <g ref={hold("body")} style={{ transformOrigin: "57px 62px" }}>
        <path
          d="M57 34 C73 34 82 46 82 60 C82 74 72 82 57 82 C42 82 32 74 32 60 C32 46 41 34 57 34 Z"
          fill="url(#asy-iron)"
          stroke="#171420"
          strokeWidth="2.2"
        />
        {/* Brick courses, so it reads as a kiln and not a pot. */}
        {[44, 52, 68, 75].map((y) => (
          <path key={y} d={`M${37 + Math.abs(y - 60) * 0.25} ${y} H${77 - Math.abs(y - 60) * 0.25}`} stroke="#2a1a19" strokeWidth="1" opacity="0.8" />
        ))}
        {/* The grate: the thing that glows. */}
        <rect x="44" y="55" width="22" height="12" rx="2" fill="#171420" />
        <rect className="asy-grate" x="46" y="57" width="18" height="8" rx="1" fill="url(#asy-melt)" />
        {[50, 55, 60].map((x) => (
          <rect key={x} x={x} y="55" width="2" height="12" fill="#171420" />
        ))}
        {/* The balance it is named for, on its breast. */}
        <path d="M49 42 H65 M57 40 V48 M49 42 L46 47 H52 Z M65 42 L62 47 H68 Z" stroke="url(#asy-brass)" strokeWidth="1.6" fill="none" />
        {[38, 76].map((x) => (
          <circle key={x} cx={x} cy="60" r="1.6" fill="#a88a5a" />
        ))}
      </g>

      {/* ---- head: a riveted helm, one gauge for an eye ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "48px 34px" }}>
        <path d="M36 34 C36 22 44 16 50 16 C57 16 62 22 62 30 L60 36 H38 Z" fill="url(#asy-steel)" stroke="#171420" strokeWidth="2" />
        <rect x="36" y="33" width="26" height="4" fill="#2c2a33" stroke="#171420" strokeWidth="1.4" />
        {[40, 49, 58].map((x) => (
          <circle key={x} cx={x} cy="35" r="0.9" fill="#a88a5a" />
        ))}
        {/* The gauge: a dial with its needle, facing the party. */}
        <circle cx="45" cy="26" r="5.6" fill="#e9dcc0" stroke="#171420" strokeWidth="1.8" />
        <path className="asy-needle" d="M45 26 L41.5 22.5" stroke="#b3302a" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="45" cy="26" r="1" fill="#171420" />
        <path d="M40.5 29.5 A5 5 0 0 1 40 24" stroke="#6b5a41" strokeWidth="0.8" fill="none" />
      </g>

      {/* ---- the tongs, and the crucible they carry ---- */}
      <g ref={hold("tongs")} style={{ transformOrigin: "40px 50px" }}>
        {/* Upper arm and forearm, jointed, reaching forward and down. */}
        <path d="M42 46 L28 52 L30 57 L44 53 Z" fill="url(#asy-steel)" stroke="#171420" strokeWidth="1.8" />
        <circle cx="29" cy="54.5" r="3" fill="#2c2a33" stroke="#171420" strokeWidth="1.4" />
        {/* The tong jaws, open around the crucible's waist. */}
        <path d="M28 52 L14 54 M28 57 L14 62" stroke="#3a3842" strokeWidth="3" strokeLinecap="round" />
        <path d="M28 52 L14 54 M28 57 L14 62" stroke="#171420" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
        {/* The crucible: a heavy cup, its rim full of melt. */}
        <path d="M2 50 H22 L19 68 C18 71 6 71 5 68 Z" fill="url(#asy-iron)" stroke="#171420" strokeWidth="2" />
        <ellipse className="asy-melt" cx="12" cy="50" rx="10" ry="2.8" fill="url(#asy-melt)" stroke="#171420" strokeWidth="1.2" />
        <path d="M5 56 H19" stroke="#2a1a19" strokeWidth="1" />
        {/* A lip to pour from, on the party's side. */}
        <path d="M2 50 L-1 48 L2 52 Z" fill="url(#asy-iron)" stroke="#171420" strokeWidth="1" />
      </g>
    </svg>
  );
}
