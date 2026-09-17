import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-cistern.css";

/**
 * The Plate Tender.
 *
 * A back-row hand, not a fighter. It is hunched over its own work: waders, a
 * stooped back, a diver's helm with one glass port, and a rack of spare hull
 * plates strapped high behind it with the air hose looping up into them. All
 * the mass is in the one arm it works with, which ends in an oversized mitt
 * held out flat — a placing hand, nothing that could make a fist.
 *
 * Silhouette: a stooped wedge with a squared load on its back and one long arm
 * reaching out low and flat. It is a crouch where the Dredger is a brace, and
 * it carries plates where the Dredger drags a chain.
 *
 * Rigged as `legs`, `body`, `arm` and `head`. The arm pivots at the shoulder so
 * a full swing still ends with the mitt pointing at the party; the helm turns
 * on its collar.
 */
const PARTS = ["legs", "body", "arm", "head"] as const;

export function Tender({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  return (
    <svg
      className={`tender cistern-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Plate Tender"
    >
      <defs>
        <linearGradient id="tnd-suit" x1="0.15" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#4f8c84" />
          <stop offset="0.5" stopColor="#2a5b57" />
          <stop offset="1" stopColor="#12302f" />
        </linearGradient>
        <linearGradient id="tnd-iron" x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#7c8a8c" />
          <stop offset="0.5" stopColor="#434d50" />
          <stop offset="1" stopColor="#1c2325" />
        </linearGradient>
        <linearGradient id="tnd-plate" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#97704a" />
          <stop offset="0.55" stopColor="#5f452c" />
          <stop offset="1" stopColor="#2c2019" />
        </linearGradient>
        <radialGradient id="tnd-port" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#dff6f0" />
          <stop offset="0.5" stopColor="#7cc0b6" />
          <stop offset="1" stopColor="#1f4e4a" />
        </radialGradient>
      </defs>

      {/* ---- legs: short, in heavy waders, turned out under the stoop ---- */}
      <g ref={hold("legs")} style={{ transformOrigin: "52px 92px" }}>
        <g fill="url(#tnd-suit)" stroke="#171420" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M42 74 L36 90 L48 91 L51 76 Z" />
          <path d="M58 74 L60 91 L71 89 L66 74 Z" />
        </g>
        <g fill="url(#tnd-iron)" stroke="#171420" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M31 96 Q31 88 38 88 L50 89 L50 96 Z" />
          <path d="M59 96 L59 89 L71 88 Q77 88 76 96 Z" />
        </g>
        <path d="M33 93 H48 M61 93 H74" stroke="#8d9a9c" strokeWidth="1.2" />
      </g>

      {/* ---- body: the stoop, and the rack of plates it carries ---- */}
      <g ref={hold("body")} style={{ transformOrigin: "52px 80px" }}>
        {/* Rack frame, strapped high behind the shoulders */}
        <g stroke="#171420" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M64 42 L86 38 L90 72 L68 76 Z" fill="url(#tnd-iron)" />
        </g>
        {/* Spare plates, stacked on edge in the frame. Each one is drawn with a
         * gap and its own lit top edge, or the rack reads as a single board. */}
        <g stroke="#171420" strokeWidth="2" strokeLinejoin="round">
          <path d="M66 45 C71 41 76 41 79 44 L81 71 L68 73 Z" fill="url(#tnd-plate)" />
          <path d="M74 43 C78 39.6 82 39.6 85 42.6 L87 69 L76 70.6 Z" fill="#6b4e33" />
          <path d="M82 41 C85 38 88 38 90 40.6 L91 67 L84 68.6 Z" fill="#8a6748" />
        </g>
        <g className="cst-wet-line">
          <path d="M67 46.6 C71 42.8 76 42.8 79 45.6" strokeWidth="1.8" />
          <path d="M75 44.4 C78 41.4 82 41.4 85 44" strokeWidth="1.6" />
          <path d="M83 42.4 C85 39.8 88 39.8 90 42" strokeWidth="1.4" />
        </g>
        {/* Torso, bent forward over the work */}
        <path
          d="M36 80 C31 70 32 58 40 52 C48 46 60 47 66 54 C72 61 70 72 66 80 Z"
          fill="url(#tnd-suit)"
          stroke="#171420"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {/* Strap over the chest holding the rack on */}
        <path d="M62 52 Q50 57 44 70" stroke="#3a2a1c" strokeWidth="3.6" fill="none" />
        <rect x="47.5" y="59" width="4.4" height="3.6" rx="0.7" fill="#8d9a9c" stroke="#171420" strokeWidth="0.8" />
        {/* Air hose, up from the small of the back into the rack */}
        <path d="M64 74 C74 76 78 66 76 58" stroke="#171420" strokeWidth="4.6" fill="none" strokeLinecap="round" />
        <path d="M64 74 C74 76 78 66 76 58" stroke="#5f6a6c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {/* A wet apron of silt down the front */}
        <path d="M37 68 C36 76 38 82 40 86 L58 84 C58 78 56 70 52 66 Z" fill="#1a3d3b" stroke="#171420" strokeWidth="2" strokeLinejoin="round" />
        <path d="M40 76 H55" stroke="#0f2b2a" strokeWidth="1.6" />
      </g>

      {/* ---- head: a diver's helm, one port, sunk low and forward ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "44px 50px" }}>
        <path
          d="M32 38 C26 40 24 48 28 53 C33 58 44 58 48 52 C51 47 48 39 42 37 Z"
          fill="url(#tnd-iron)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* Collar bolts */}
        <path d="M34 56 L48 54" stroke="#171420" strokeWidth="3.4" />
        <g fill="#9aa6a8">
          <circle cx="36" cy="40" r="1.1" />
          <circle cx="44" cy="40.6" r="1.1" />
          <circle cx="30" cy="48" r="1.1" />
        </g>
        {/* The port, facing the party */}
        <circle cx="33" cy="47" r="6.4" fill="#2b3436" stroke="#171420" strokeWidth="2" />
        <circle className="tnd-port" cx="33" cy="47" r="4.4" />
        <path className="cst-wet-line" d="M30 44.5 Q32 42.6 34.6 43" strokeWidth="1.5" />
        {/* A short crest of pipework over the crown */}
        <path d="M40 36 C44 32 50 34 50 40" stroke="#171420" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M40 36 C44 32 50 34 50 40" stroke="#6b7478" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* ---- arm: the long working arm and its oversized flat mitt ---- */}
      <g ref={hold("arm")} style={{ transformOrigin: "50px 58px" }}>
        <path
          d="M52 52 C46 54 38 60 30 64 L26 70 C30 74 36 72 42 68 C48 64 54 60 56 56 Z"
          fill="url(#tnd-suit)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* Sleeve cuff at the wrist */}
        <path d="M31 62 L27 70" stroke="#171420" strokeWidth="3.4" />
        {/* The mitt: broad, flat, fingers spread to take a plate */}
        <path
          d="M28 62 C20 60 10 63 8 69 C6 75 12 79 20 78 C26 77 30 72 30 67 Z"
          fill="#3a6f69"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <g stroke="#14332f" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path d="M11 66 L20 68" />
          <path d="M10 71 L21 72" />
          <path d="M12 75 L22 75" />
        </g>
        {/* A plate held ready in the palm, wet at its edge */}
        <path d="M6 60 L18 57 L20 66 L8 68 Z" fill="url(#tnd-plate)" stroke="#171420" strokeWidth="2" strokeLinejoin="round" />
        <path className="cst-wet-line" d="M7 61 L18 58.4" strokeWidth="1.6" />
      </g>
    </svg>
  );
}
