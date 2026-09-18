import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-cistern.css";

/**
 * The Pressure Engine. Elite, and drawn to fill its `boss-large` footprint, so
 * it is the largest thing in the Cistern.
 *
 * A boiler that has been left too long on the line: a riveted drum strapped in
 * banding, standing on legs far too short for it, swollen along its seams and
 * weeping rust. The dial on its face is the whole fight — the needle climbs
 * into the red as the pressure builds — and it works with a single ram piston
 * levelled at the party. The exhaust stack on its crown is the release, and it
 * is already leaking.
 *
 * Silhouette: a fat barrel on stumps, one straight ram jutting from the left
 * and one chimney off the top. It is the only machine in the faction with no
 * limbs to speak of, and nothing about it looks steerable.
 *
 * Rigged as `base`, `boiler`, `gauge`, `piston` and `stack`. `gauge` holds only
 * the needle, pivoting on the dial pin; the dial face belongs to the boiler so
 * it does not turn with it. The stack grows from its collar, the boiler swells
 * about its own middle, and the piston travels straight out at the party.
 */
const PARTS = ["base", "boiler", "gauge", "piston", "stack"] as const;

/** Dial ticks, drawn from the safe side round into the red. */
const TICKS = [-150, -125, -100, -75, -50, -25, 0, 25];

export function PressureEngine({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  return (
    <svg
      className={`engine cistern-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Pressure Engine"
    >
      <defs>
        <linearGradient id="eng-drum" x1="0.1" y1="0" x2="0.78" y2="1">
          <stop offset="0" stopColor="#78878a" />
          <stop offset="0.42" stopColor="#3d474a" />
          <stop offset="1" stopColor="#151b1d" />
        </linearGradient>
        <linearGradient id="eng-rust" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#9a7048" />
          <stop offset="0.6" stopColor="#5c412a" />
          <stop offset="1" stopColor="#2a1e16" />
        </linearGradient>
        <linearGradient id="eng-ram" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e9b9d" />
          <stop offset="0.45" stopColor="#4a5457" />
          <stop offset="1" stopColor="#1a2123" />
        </linearGradient>
        <radialGradient id="eng-dial" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#e6f3ec" />
          <stop offset="0.6" stopColor="#a9bcb4" />
          <stop offset="1" stopColor="#5d726c" />
        </radialGradient>
      </defs>

      {/* ---- base: stumps and skids. Far too little leg for the drum. ---- */}
      <g ref={hold("base")} style={{ transformOrigin: "50px 92px" }}>
        <g fill="url(#eng-drum)" stroke="#171420" strokeWidth="2.6" strokeLinejoin="round">
          <path d="M26 78 L22 90 L38 90 L38 78 Z" />
          <path d="M62 78 L62 90 L78 90 L74 78 Z" />
          <path d="M12 97 Q12 88 22 88 L44 88 L44 97 Z" />
          <path d="M56 97 L56 88 L78 88 Q88 88 88 97 Z" />
        </g>
        <g stroke="#8d9a9c" strokeWidth="2">
          <path d="M30 80 V87 M70 80 V87" />
          <path d="M16 93 H42 M58 93 H84" />
        </g>
        {/* Brine pooled under it, because it is always weeping */}
        <path className="cst-wet-line" d="M16 97 Q30 94 44 97" strokeWidth="2" />
      </g>

      {/* ---- stack: the exhaust, already leaking. Drawn behind the drum. ---- */}
      <g ref={hold("stack")} style={{ transformOrigin: "62px 28px" }}>
        <path
          d="M55 30 L57 15 L68 15 L70 30 Z"
          fill="url(#eng-drum)"
          stroke="#171420"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path
          d="M53 16 L72 16 L69 9 L56 9 Z"
          fill="#3f4a4d"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path d="M56 23 L69 23" stroke="#171420" strokeWidth="3" />
        <path d="M56 23 L69 23" stroke="#7d8a8c" strokeWidth="1.4" />
        <g className="eng-steam">
          <ellipse cx="62" cy="5" rx="8" ry="3" />
          <ellipse cx="53" cy="4" rx="4" ry="2.2" />
        </g>
      </g>

      {/* ---- boiler: the drum, its banding, its rust and its dial face ---- */}
      <g ref={hold("boiler")} style={{ transformOrigin: "50px 56px" }}>
        <path
          d="M20 78 C14 60 16 38 26 30 L74 30 C86 38 90 60 84 78 C70 84 34 84 20 78 Z"
          fill="url(#eng-drum)"
          stroke="#171420"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* A lid on the crown, so the barrel has a flat top for the stack */}
        <path d="M24 30 L76 30 L74 24 L27 24 Z" fill="#4e595c" stroke="#171420" strokeWidth="2.6" strokeLinejoin="round" />
        {/* A lit leading edge on the party's side, so the drum reads round */}
        <path d="M24 70 C19 54 20 38 28 31" stroke="#a5b3b5" strokeWidth="2.6" fill="none" opacity="0.7" />
        {/* Banding, riveted, strapped round the swell */}
        <g fill="none">
          <path d="M18 44 C40 37 66 37 87 44" stroke="#171420" strokeWidth="5" />
          <path d="M18 68 C40 62 66 62 86 68" stroke="#171420" strokeWidth="5" />
          <path d="M18 44 C40 37 66 37 87 44" stroke="#5f6d70" strokeWidth="2.4" />
          <path d="M18 68 C40 62 66 62 86 68" stroke="#5f6d70" strokeWidth="2.4" />
        </g>
        <g fill="#9fadaf">
          {[24, 36, 50, 64, 78].map((x, i) => (
            <circle key={x} cx={x} cy={[42.6, 39.8, 38.6, 39.6, 42.4][i]} r="1.3" />
          ))}
          {[26, 42, 58, 76].map((x, i) => (
            <circle key={`b${x}`} cx={x} cy={[66.2, 63.6, 63.4, 66][i]} r="1.3" />
          ))}
        </g>
        {/* Rust weeping down the far flank, and a strained seam over it */}
        <path d="M70 48 C80 48 84 56 82 66 C74 72 66 68 66 58 Z" fill="url(#eng-rust)" opacity="0.92" />
        <g stroke="#2a1e16" strokeWidth="1.6" fill="none" opacity="0.8">
          <path d="M72 52 C76 58 76 64 73 68" />
          <path d="M78 52 C81 58 80 64 78 67" />
        </g>
        {/* Relief valve on the shoulder: small, and clearly not enough */}
        <circle cx="32" cy="22" r="3.8" fill="#7a5a3a" stroke="#171420" strokeWidth="2" />
        <path d="M32 19 V25 M29 22 H35" stroke="#1d2427" strokeWidth="1.4" />
        {/* The dial: the whole fight, high on the face where the party reads it
         * and clear of the ram below. */}
        <circle cx="44" cy="43" r="13" fill="#2b3436" stroke="#171420" strokeWidth="2.6" />
        <circle cx="44" cy="43" r="10" fill="url(#eng-dial)" stroke="#171420" strokeWidth="1.8" />
        {/* The red arc it climbs into */}
        <path d="M34.6 39 A10 10 0 0 1 40 33.8 L42.2 38.4 A5.6 5.6 0 0 0 39.1 41.3 Z" fill="#a8352a" opacity="0.95" />
        <g stroke="#2b3436" strokeWidth="1.3">
          {TICKS.map((a) => {
            const r = (a * Math.PI) / 180;
            return (
              <path
                key={a}
                d={`M${(44 + 9 * Math.cos(r)).toFixed(1)} ${(43 + 9 * Math.sin(r)).toFixed(1)} L${(44 + 6.4 * Math.cos(r)).toFixed(1)} ${(43 + 6.4 * Math.sin(r)).toFixed(1)}`}
              />
            );
          })}
        </g>
        <path className="cst-wet-line" d="M37 37 Q40 34 44 34" strokeWidth="1.6" />
      </g>

      {/* ---- gauge: the needle alone, pinned at the dial centre ---- */}
      <g ref={hold("gauge")} style={{ transformOrigin: "44px 43px" }}>
        <path d="M50.6 33.6 L43.8 44.4 L42.2 42.4 Z" fill="#c0342a" stroke="#171420" strokeWidth="1" strokeLinejoin="round" />
        <circle cx="44" cy="43" r="2.2" fill="#2b3436" stroke="#171420" strokeWidth="1.2" />
      </g>

      {/* ---- piston: one ram, levelled at the party ---- */}
      <g ref={hold("piston")} style={{ transformOrigin: "24px 66px" }}>
        <rect x="18" y="54" width="28" height="24" rx="4" fill="url(#eng-ram)" stroke="#171420" strokeWidth="2.6" />
        <g stroke="#171420" strokeWidth="2.4">
          <path d="M28 55 V77 M37 55 V77" />
        </g>
        <rect x="9" y="61" width="12" height="10" rx="1.5" fill="#8e9b9d" stroke="#171420" strokeWidth="2.2" />
        <path
          d="M3 53 L13 57 L13 75 L3 79 Z"
          fill="url(#eng-rust)"
          stroke="#171420"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path d="M4.6 55 L4.6 77" stroke="#c0a077" strokeWidth="1.8" />
        {/* Steam bleeding from the gland, on the side that does the work */}
        <path className="cst-wet-line" d="M20 80 Q26 83 32 80" strokeWidth="1.8" />
      </g>
    </svg>
  );
}
