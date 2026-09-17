import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-clerks.css";

/**
 * The Margin Stalker.
 *
 * The one restless thing in the Archive. Where the Scribe is a stack of
 * stillness, this is a diagonal: caught mid-step with the near leg landing
 * forward on the party's side and the far leg still trailing, hunched down
 * behind a ragged reader's cloak that is already swinging past it. Every line
 * in it leans left.
 *
 * It kills with a stylus. The weapon is a needle — a tapered nib on a thin
 * shaft with an oxblood bead of ink at the point — held out almost level, so
 * the rig's raise and drop reads as one precise stab rather than a swing. The
 * cloak carries the whole `block`: it flares up and over and the creature is
 * briefly not there.
 *
 * Silhouette: a thin forward-leaning wedge with torn strips streaming back on
 * the far side and one long needle out front. Next to the Scribe it is all
 * angle and no mass.
 */
const PARTS = ["cloak", "body", "arm", "head"] as const;

export function Stalker({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  return (
    <svg
      className={`stalker clerks-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Margin Stalker"
    >
      <defs>
        <linearGradient id="stl-cloak" x1="0.8" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#4a4353" />
          <stop offset="0.5" stopColor="#2d2836" />
          <stop offset="1" stopColor="#15131c" />
        </linearGradient>
        <linearGradient id="stl-under" x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#3b3444" />
          <stop offset="1" stopColor="#1b1824" />
        </linearGradient>
        <linearGradient id="stl-skin" x1="0.2" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#c9c2d4" />
          <stop offset="1" stopColor="#736a80" />
        </linearGradient>
        <linearGradient id="stl-steel" x1="1" y1="0" x2="0" y2="0.4">
          <stop offset="0" stopColor="#8d8598" />
          <stop offset="0.7" stopColor="#d7d2e0" />
          <stop offset="1" stopColor="#f2eef6" />
        </linearGradient>
        <linearGradient id="stl-slip" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#e6ddc4" />
          <stop offset="1" stopColor="#a89c78" />
        </linearGradient>
      </defs>

      {/* ---- cloak: torn strips streaming back off the far shoulder ---- */}
      <g ref={hold("cloak")} style={{ transformOrigin: "56px 32px" }}>
        <path
          d="M54 26 C64 25 73 33 76 46 L84 66 L77 64 L79 81 L71 68 L68 80 L61 66 L57 76 L51 54 L50 32 Z"
          fill="url(#stl-cloak)"
          stroke="#171420"
          strokeWidth="2.3"
          strokeLinejoin="round"
        />
        {/* Slips of paper pinned to it, the way a reader keeps their places. */}
        {[
          ["M62 40 L70 38 L71 47 L63 49 Z", -8],
          ["M69 52 L76 51 L77 59 L70 60 Z", 6],
        ].map(([d, r], i) => (
          <g key={i} transform={`rotate(${r} 70 48)`}>
            <path
              d={String(d)}
              fill="url(#stl-slip)"
              stroke="#171420"
              strokeWidth="1.3"
            />
          </g>
        ))}
        {/* Bookmark ribbons trailing off the hem. */}
        <g stroke="#a8352a" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M73 58 Q80 68 78 78" />
          <path d="M65 62 Q69 70 66 77" />
        </g>
        <path
          d="M57 34 L64 62"
          stroke="#15131c"
          strokeWidth="1.6"
          opacity="0.8"
        />
      </g>

      {/* ---- body: hunched, mid-step, the near leg already landing ---- */}
      <g ref={hold("body")} style={{ transformOrigin: "52px 82px" }}>
        {/* Far leg, still trailing with the heel up. */}
        <path
          d="M54 57 L61 61 L66 73 L71 85 L64 87 L58 75 L51 66 Z"
          fill="url(#stl-under)"
          stroke="#171420"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M63 84 Q69 84 71 88 L78 91 L65 92 Q62 89 62 84 Z"
          fill="#211d29"
          stroke="#171420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Near leg, planted forward on the party's side. */}
        <path
          d="M48 57 L42 62 L33 71 L29 85 L36 86 L40 72 L49 64 Z"
          fill="url(#stl-under)"
          stroke="#171420"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M27 83 Q33 83 35.5 87 L36 91 H22 Q22 86 27 83 Z"
          fill="#211d29"
          stroke="#171420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <g stroke="#15131c" strokeWidth="1.4">
          <path d="M31 75 L40 77" />
          <path d="M33 79 L38 81" />
          <path d="M62 77 L67 76" />
        </g>
        {/* Torso: narrow, tipped forward over the leading foot. */}
        <path
          d="M56 33 C48 32 43 39 42 47 L41 60 L58 62 L60 48 C61 40 61 33 56 33 Z"
          fill="url(#stl-under)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* A bandolier of blank slips across the chest. */}
        <path d="M45 39 L59 55" stroke="#2c2733" strokeWidth="4.4" />
        {[
          [47.6, 42.4],
          [51.4, 46.8],
          [55.2, 51.2],
        ].map(([x, y]) => (
          <rect
            key={x}
            x={x}
            y={y}
            width="3.4"
            height="4.6"
            rx="0.6"
            fill="url(#stl-slip)"
            stroke="#171420"
            strokeWidth="0.9"
            transform={`rotate(-42 ${x} ${y})`}
          />
        ))}
        <path
          d="M41 59 Q50 64 58 60 L58 64 Q50 68 41 63 Z"
          fill="#2c2733"
          stroke="#171420"
          strokeWidth="1.4"
        />
      </g>

      {/* ---- arm: the stylus hand, held out almost level ---- */}
      <g ref={hold("arm")} style={{ transformOrigin: "48px 45px" }}>
        <path
          d="M55 41 C47 39 38 39 31 38 L30 45.5 Q39 47.5 54 48.5 Z"
          fill="url(#stl-cloak)"
          stroke="#171420"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* A ragged cuff: the sleeve has been cut back to free the hand. */}
        <path
          d="M31 38 L33 42 L31 45.5 L34 49 L36 43 Z"
          fill="#15131c"
          opacity="0.8"
        />
        <path
          d="M30.5 38.4 Q25.6 39 25 42.4 Q25.4 46 30 46.4 Z"
          fill="url(#stl-skin)"
          stroke="#171420"
          strokeWidth="1.5"
        />
        <g stroke="#5c5468" strokeWidth="1" strokeLinecap="round">
          <path d="M26.4 41.4 H29.6" />
          <path d="M26.4 44 H29.4" />
        </g>
        {/* The stylus: a needle, not a sword. */}
        <path
          d="M27 38.4 L8.5 35.6 L27 43.2 Z"
          fill="url(#stl-steel)"
          stroke="#171420"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <rect
          x="25.6"
          y="37.6"
          width="4"
          height="6.4"
          rx="1.2"
          fill="#b89a6a"
          stroke="#171420"
          strokeWidth="1.3"
        />
        <circle cx="10.6" cy="36.4" r="1.4" fill="#a8352a" />
      </g>

      {/* ---- head: a hood down low, a read strip over the eyes ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "48px 34px" }}>
        <path
          d="M55 21 L65 13 L60 25 Z"
          fill="url(#stl-cloak)"
          stroke="#171420"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M39 26 C41 17 52 15 57 21 C61 26 59 34 55 39 L43 41 C38 37 37 31 39 26 Z"
          fill="url(#stl-cloak)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Jaw, all that the hood leaves out. */}
        <path
          d="M39.5 33 L54 30.5 L52 38 Q45 41 40.5 38 Z"
          fill="url(#stl-skin)"
          stroke="#171420"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M43 36 L49 34.6" stroke="#4a4354" strokeWidth="1.1" />
        {/* The strip it reads through, torn and flapping forward. */}
        <path
          d="M36 27.6 L56 24.2 L57 29.4 L37.5 33 Z"
          fill="url(#stl-slip)"
          stroke="#171420"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M36.4 27.8 L29.6 25.8 L32 29.4 L28.6 31.4 L37.6 32.8 Z"
          fill="#c6bc9a"
          stroke="#171420"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        {/* The slit cut in it, which is the whole face. */}
        <rect
          className="stl-eye"
          x="39.4"
          y="28.2"
          width="8"
          height="1.9"
          rx="0.9"
          transform="rotate(-9.6 43.4 29.1)"
        />
      </g>
    </svg>
  );
}
