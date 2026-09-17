import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-bailiff.css";

/**
 * The Bailiff.
 *
 * The archive's enforcer: it does not decide what you owe, it comes to take
 * it. Broad and upright in a long greatcoat with a double row of brass
 * buttons, a bicorn with a served writ tucked in its band, a chain of office,
 * a sheaf of summons in one fist and a heavy tipstaff — a short iron-bound
 * baton crowned in brass — held out towards the party. Under the brim, only
 * two small lamps and a jaw.
 *
 * Rigged as `coat`, `legs`, `staff`, `summons`, `chain` and `head`. The staff
 * carries every blow and every serving; the summons are flourished when a lien
 * is served; the chain swings a beat behind the body.
 *
 * Silhouette test: a wide flat hat over broad square shoulders, a coat to the
 * floor, and a thick short club with a knob held out on the party's side.
 * Filled black it is a constable, not the Collector's hooded wedge.
 *
 * Enemies face the party, to their left, so the staff is on the left.
 */
const PARTS = ["coat", "legs", "staff", "summons", "chain", "head"] as const;

export function Bailiff({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  return (
    <svg
      className={`bailiff ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="The Bailiff"
    >
      <defs>
        <linearGradient id="blf-coat" x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#3b4a5e" />
          <stop offset="0.55" stopColor="#26303f" />
          <stop offset="1" stopColor="#151a24" />
        </linearGradient>
        <linearGradient id="blf-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecd08a" />
          <stop offset="0.5" stopColor="#b8913f" />
          <stop offset="1" stopColor="#6a4f22" />
        </linearGradient>
        <linearGradient id="blf-page" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ece0bf" />
          <stop offset="1" stopColor="#b8a67c" />
        </linearGradient>
      </defs>

      {/* ---- legs: boots planted wide under the coat ---- */}
      <g ref={hold("legs")} style={{ transformOrigin: "52px 86px" }}>
        <path d="M38 84 L36 94 H48 L47 84 Z" fill="#1d1a22" stroke="#171420" strokeWidth="2" />
        <path d="M56 84 L57 94 H69 L66 84 Z" fill="#1d1a22" stroke="#171420" strokeWidth="2" />
      </g>

      {/* ---- the greatcoat: square shoulders, skirts to the boots ---- */}
      <g ref={hold("coat")} style={{ transformOrigin: "52px 60px" }}>
        <path
          d="M34 34 H70 L74 56 L78 88 H28 L31 56 Z"
          fill="url(#blf-coat)"
          stroke="#171420"
          strokeWidth="2.2"
        />
        {/* The lapels and the split at the skirts. */}
        <path d="M46 34 L52 52 L58 34" fill="#1a2130" stroke="#171420" strokeWidth="1.4" />
        <path d="M52 62 V88" stroke="#171420" strokeWidth="1.6" />
        {/* A double row of brass buttons. */}
        {[40, 47, 54, 61].map((y) => (
          <g key={y}>
            <circle cx="47" cy={y + 12} r="1.5" fill="url(#blf-brass)" stroke="#171420" strokeWidth="0.6" />
            <circle cx="57" cy={y + 12} r="1.5" fill="url(#blf-brass)" stroke="#171420" strokeWidth="0.6" />
          </g>
        ))}
        {/* Cuffed shoulders, squared like a ledger's corners. */}
        <path d="M30 34 H40 V40 H30 Z M64 34 H74 V40 H64 Z" fill="url(#blf-brass)" stroke="#171420" strokeWidth="1.4" />
      </g>

      {/* ---- the chain of office, swinging across the chest ---- */}
      <g ref={hold("chain")} style={{ transformOrigin: "52px 36px" }}>
        <path d="M40 36 Q52 52 64 36" stroke="url(#blf-brass)" strokeWidth="2" strokeDasharray="2.6 1.6" fill="none" />
        <circle cx="52" cy="47" r="4" fill="url(#blf-brass)" stroke="#171420" strokeWidth="1.2" />
        <path d="M49.5 47 H54.5 M52 44.5 V49.5" stroke="#6a4f22" strokeWidth="1" />
      </g>

      {/* ---- the summons: a sheaf of served writs in the far fist ---- */}
      <g ref={hold("summons")} style={{ transformOrigin: "72px 44px" }}>
        <path d="M72 40 L80 58 L75 60 L68 44 Z" fill="url(#blf-coat)" stroke="#171420" strokeWidth="1.8" />
        <g transform="translate(78 62) rotate(12)">
          {[0, 2.5, 5].map((d, i) => (
            <rect key={i} x={-6 + d} y={-9 + d * 0.4} width="13" height="17" rx="0.8" fill="url(#blf-page)" stroke="#171420" strokeWidth="1.2" />
          ))}
          <circle cx="7" cy="8" r="2.4" fill="#8f2a22" stroke="#3a0f0c" strokeWidth="0.8" />
          <path d="M-1 -3 H9 M-1 0 H8 M-1 3 H7" stroke="#6b5a41" strokeWidth="0.8" />
        </g>
        <circle cx="79" cy="58" r="3.4" fill="#2e3a4a" stroke="#171420" strokeWidth="1.4" />
      </g>

      {/* ---- the tipstaff: an iron-bound baton, crowned in brass ---- */}
      <g ref={hold("staff")} style={{ transformOrigin: "34px 40px" }}>
        <path d="M34 38 L24 50 L28 54 L38 44 Z" fill="url(#blf-coat)" stroke="#171420" strokeWidth="1.8" />
        <circle cx="25" cy="52" r="3.4" fill="#2e3a4a" stroke="#171420" strokeWidth="1.4" />
        <path d="M28 55 L10 24" stroke="#171420" strokeWidth="6.4" strokeLinecap="round" />
        <path d="M28 55 L10 24" stroke="#4a3526" strokeWidth="4.4" strokeLinecap="round" />
        {[0.3, 0.55, 0.8].map((k) => (
          <path
            key={k}
            d={`M${28 - 18 * k - 3} ${55 - 31 * k + 1.6} L${28 - 18 * k + 3} ${55 - 31 * k - 1.6}`}
            stroke="url(#blf-brass)"
            strokeWidth="1.8"
          />
        ))}
        {/* The crown on the end: what makes a club an office. */}
        <circle cx="9" cy="22" r="5" fill="url(#blf-brass)" stroke="#171420" strokeWidth="1.8" />
        <path d="M5 18 L6 13 L9 16 L12 13 L13 18 Z" fill="url(#blf-brass)" stroke="#171420" strokeWidth="1.2" />
      </g>

      {/* ---- head: a bicorn over a shadowed face, a writ in the band ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "52px 32px" }}>
        <path d="M44 22 H60 L58 34 H46 Z" fill="#1d1a22" stroke="#171420" strokeWidth="1.8" />
        <circle className="blf-eye" cx="49" cy="27" r="1.4" />
        <circle className="blf-eye" cx="55" cy="27" r="1.4" />
        <path d="M47 31.5 H57" stroke="#3a3440" strokeWidth="1.4" />
        {/* The bicorn: wide and flat, peaks fore and aft. */}
        <path d="M28 20 C38 8 66 8 76 20 C66 16 38 16 28 20 Z" fill="#1a1d27" stroke="#171420" strokeWidth="2" />
        <path d="M34 18 C44 12 60 12 70 18" stroke="url(#blf-brass)" strokeWidth="1.4" fill="none" />
        <g transform="translate(62 9) rotate(18)">
          <rect x="-3" y="-8" width="7" height="11" fill="url(#blf-page)" stroke="#171420" strokeWidth="1" />
          <circle cx="0.5" cy="1" r="1.6" fill="#8f2a22" />
        </g>
      </g>
    </svg>
  );
}
