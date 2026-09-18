import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-cistern.css";

/**
 * The Sluice Eel.
 *
 * It lives in the pipes and it fights out of one: the drawing is a standpipe
 * with the animal wound round it, tail locked over the lower flange and the
 * body climbing in an S to a narrow head held out at the party. The head is all
 * jaw — a thin hooked skull with the charge gathering as a pale arc between the
 * teeth — and a run of soft fins tracks the back of the curve.
 *
 * Silhouette: vertical and snaking, a wide base narrowing to a point, with the
 * pipe as a straight edge behind it. It could not be mistaken for the Slag
 * Hound: nothing here stands on legs.
 *
 * Rigged as `tail`, `body`, `head` and `fins`. The tail swings about the coil
 * where it grips the pipe, the head about its neck, the fins about their root.
 */
const PARTS = ["tail", "body", "head", "fins"] as const;

export function Eel({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  return (
    <svg
      className={`eel cistern-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Sluice Eel"
    >
      <defs>
        <linearGradient id="eel-skin" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#7fc0b2" />
          <stop offset="0.45" stopColor="#35706a" />
          <stop offset="1" stopColor="#11302f" />
        </linearGradient>
        <linearGradient id="eel-pipe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1d2427" />
          <stop offset="0.4" stopColor="#5a6468" />
          <stop offset="0.75" stopColor="#394245" />
          <stop offset="1" stopColor="#151b1d" />
        </linearGradient>
        <linearGradient id="eel-fin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bfe6dd" />
          <stop offset="1" stopColor="#2f6b66" />
        </linearGradient>
      </defs>

      {/* ---- the standpipe it lives in. Carried scenery, not an animated part. ---- */}
      <g stroke="#171420" strokeWidth="2.4" strokeLinejoin="round">
        <rect x="64" y="2" width="16" height="95" fill="url(#eel-pipe)" />
        <rect x="59" y="24" width="26" height="7" rx="1.5" fill="#4a5254" />
        <rect x="59" y="60" width="26" height="7" rx="1.5" fill="#4a5254" />
      </g>
      <g fill="#8d9a9c">
        {[27.5, 63.5].map((y) => (
          <g key={y}>
            <circle cx="63" cy={y} r="1.1" />
            <circle cx="81" cy={y} r="1.1" />
          </g>
        ))}
      </g>
      <path d="M69 6 V92" stroke="#7d8a8c" strokeWidth="1.6" opacity="0.5" />
      {/* Brine weeping out of the pipe mouth */}
      <path className="cst-wet-line" d="M72 4 Q68 10 70 16" strokeWidth="1.8" />

      {/* ---- tail: the coil locked over the lower flange, in front of the pipe ---- */}
      <g ref={hold("tail")} style={{ transformOrigin: "58px 72px" }}>
        <path
          d="M48 62 C70 60 92 70 88 84 C85 95 66 99 50 94 C64 92 78 87 80 79 C82 70 66 67 46 70 Z"
          fill="url(#eel-skin)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* A stub of it reappearing on the far side: it goes behind the pipe. */}
        <path
          d="M84 68 C90 69 95 73 95 78 L88 78 C88 74 86 71 82 70 Z"
          fill="#1d4a47"
          stroke="#171420"
          strokeWidth="2"
        />
        <g stroke="#0f2b2a" strokeWidth="1.3" fill="none" opacity="0.7">
          <path d="M56 64 Q58 69 54 71" />
          <path d="M68 66 Q70 72 66 75" />
          <path d="M78 73 Q80 80 76 84" />
        </g>
      </g>

      {/* ---- fins: soft, translucent, tracking the back of the curve ---- */}
      <g ref={hold("fins")} style={{ transformOrigin: "50px 56px" }}>
        <g fill="url(#eel-fin)" stroke="#171420" strokeWidth="1.6" opacity="0.92">
          <path d="M56 70 C64 72 68 80 64 86 C58 82 54 76 53 71 Z" />
          <path d="M50 56 C58 54 64 58 64 66 C56 64 51 61 48 58 Z" />
          <path d="M44 42 C51 38 58 40 60 47 C52 46 47 45 43 44 Z" />
          {/* A pectoral fin under the neck, fanned down and forward */}
          <path d="M40 44 C33 46 26 52 24 60 C31 58 37 53 41 49 Z" />
        </g>
      </g>

      {/* ---- body: the climb. An S from the coil up to the neck. ---- */}
      <g ref={hold("body")} style={{ transformOrigin: "56px 70px" }}>
        <g fill="none" strokeLinecap="round">
          <path d="M58 74 C46 70 40 62 42 52 C44 42 40 38 34 34" stroke="#171420" strokeWidth="15" />
          <path d="M58 74 C46 70 40 62 42 52 C44 42 40 38 34 34" stroke="url(#eel-skin)" strokeWidth="11" />
          {/* A pale belly stripe down the party's side of the curve */}
          <path d="M53 76 C42 71 35 62 37 51 C39 42 35 38 30 35" stroke="#8fcfc2" strokeWidth="2.2" opacity="0.65" />
        </g>
        {/* Banded segments, so the column reads as an animal not a hose */}
        <g stroke="#10302e" strokeWidth="1.6" fill="none" opacity="0.75">
          <path d="M50 70 Q54 66 56 62" />
          <path d="M43 62 Q48 60 50 56" />
          <path d="M37 50 Q43 49 46 46" />
          <path d="M35 40 Q40 40 43 38" />
        </g>
      </g>

      {/* ---- head: a thin hooked skull, jaws apart, charge gathering inside ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "36px 38px" }}>
        {/* Upper skull, running out to a point at the party */}
        <path
          d="M38 30 C30 26 16 28 8 34 C12 39 22 42 31 41 C38 40 41 34 38 30 Z"
          fill="url(#eel-skin)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* Lower jaw, dropped open */}
        <path
          d="M12 38 C14 47 24 52 33 48 C34 44 32 41 29 41 C22 42 16 41 12 38 Z"
          fill="#2a5b57"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Teeth on both jaws, small and many */}
        <g fill="#e4efe7" stroke="#171420" strokeWidth="0.7">
          {[
            [13, 36],
            [18, 38],
            [23, 39.6],
            [28, 40.4],
          ].map(([x, y]) => (
            <path key={x} d={`M${x - 1.5} ${y} L${x} ${y + 3.6} L${x + 1.5} ${y + 0.6} Z`} />
          ))}
          {[
            [16, 42.6],
            [21, 44.4],
            [26, 45.4],
          ].map(([x, y]) => (
            <path key={x} d={`M${x - 1.5} ${y} L${x} ${y - 3.4} L${x + 1.5} ${y - 0.4} Z`} />
          ))}
        </g>
        {/* The charge it gathers between the teeth */}
        <path className="eel-charge" d="M14 39 L20 41 L17 43 L24 45" />
        <circle className="eel-spark" cx="17" cy="41.5" r="2.4" />
        {/* One eye, high and back on the skull */}
        <circle cx="32" cy="33" r="3" fill="#0e2322" stroke="#171420" strokeWidth="1.4" />
        <circle className="eel-eye" cx="31.4" cy="32.4" r="1.2" />
        {/* Gill slits behind it */}
        <g stroke="#10302e" strokeWidth="1.5" fill="none">
          <path d="M38 32 Q40 36 38 40" />
          <path d="M42 32 Q44 36 42 40" />
        </g>
      </g>
    </svg>
  );
}
