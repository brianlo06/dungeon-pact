import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-archive.css";

/**
 * A wax seal, pressed into the chamber by the Notary.
 *
 * A thick oxblood disc of wax standing on its edge where it was pressed, its
 * ribbon tails pinned under it and the Notary's device — a quill over a closed
 * book — stamped into the face. It is an object, not a creature: it does not
 * move of its own accord, it only settles as it sets and cracks when it is hit.
 *
 * Rigged as `disc`, `ribbons` and `drip`.
 */
const PARTS = ["disc", "ribbons", "drip"] as const;

export function WaxSeal({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  return (
    <svg
      className={`wax-seal ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Wax Seal"
    >
      <defs>
        <radialGradient id="wax-face" cx="0.38" cy="0.34" r="0.75">
          <stop offset="0" stopColor="#d5654a" />
          <stop offset="0.45" stopColor="#9b3024" />
          <stop offset="1" stopColor="#4d1510" />
        </radialGradient>
      </defs>

      {/* ---- ribbon tails, pinned under the wax ---- */}
      <g ref={hold("ribbons")} style={{ transformOrigin: "50px 78px" }}>
        <path d="M44 72 L28 96 L34 94 L36 99 L50 76 Z" fill="#6b1f19" stroke="#171420" strokeWidth="1.5" />
        <path d="M56 72 L74 95 L68 94 L66 99 L50 76 Z" fill="#8f2a22" stroke="#171420" strokeWidth="1.5" />
      </g>

      {/* ---- the disc, on its edge ---- */}
      <g ref={hold("disc")} style={{ transformOrigin: "50px 88px" }}>
        {/* Its thickness, so it reads as a lump of wax and not a coin. */}
        <ellipse cx="53" cy="56" rx="29" ry="30" fill="#3e110d" stroke="#171420" strokeWidth="2" />
        <path
          d="M50 25 C31 25 20 40 21 57 C22 74 34 86 50 86 C66 86 79 74 79 56 C79 39 67 25 50 25 Z M49 21 C45 18 38 20 36 24 C41 22 45 22 49 21 Z"
          fill="url(#wax-face)"
          stroke="#171420"
          strokeWidth="2.2"
        />
        {/* The squeezed rim where the matrix bit. */}
        <path
          d="M50 31 C35 31 27 42 27 56 C27 70 37 80 50 80 C63 80 73 70 73 56 C73 42 65 31 50 31 Z"
          fill="none"
          stroke="#5a1812"
          strokeWidth="2.4"
          opacity="0.8"
        />
        {/* The device: a quill over a closed book. */}
        <g stroke="#3e110d" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M38 50 H60 V64 H38 Z" />
          <path d="M49 50 V64" />
          <path d="M36 70 L64 40" />
          <path d="M60 41 Q66 36 64 44 Q61 42 58 45" />
        </g>
        <path className="wax-shine" d="M34 40 Q40 32 49 31" stroke="#f0a584" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* ---- a run of wax down the front ---- */}
      <g ref={hold("drip")} style={{ transformOrigin: "30px 70px" }}>
        <path d="M27 66 Q25 76 27 82 Q30 84 30 79 Q30 72 31 67 Z" fill="#9b3024" stroke="#171420" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
