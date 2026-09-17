import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-clerks.css";

/**
 * A Wax Sentence, pressed into the room by the Seal Scribe.
 *
 * The Notary's seal is an anvil of wax; this is its smaller, hastier cousin —
 * the same oxblood disc stood on its edge, but thinner, brighter and squeezed
 * out at the base where it was pressed down in a hurry. What is stamped into
 * the face is the difference that matters: not the Archive's device but the
 * sentence itself, four ruled lines of pressed text, with the last line short
 * the way a sentence ends.
 *
 * An object, not a creature. It has no limbs and takes no step: the rig only
 * lets it breathe as it sets, sway its ribbon tails, and split when it breaks.
 *
 * Silhouette: a coin on edge over a puddle, with two thin tails pinned under
 * it. Read next to the Notary's seal it is obviously the lighter thing.
 */
const PARTS = ["disc", "ribbons"] as const;

export function SentenceSeal({
  unitId,
  animators,
  className = "",
}: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  return (
    <svg
      className={`sentence-seal clerks-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Wax Sentence"
    >
      <defs>
        <radialGradient id="snt-face" cx="0.36" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#e08a68" />
          <stop offset="0.45" stopColor="#b8412f" />
          <stop offset="1" stopColor="#6a1d16" />
        </radialGradient>
        <linearGradient id="snt-ribbon" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#a8352a" />
          <stop offset="1" stopColor="#5a1812" />
        </linearGradient>
      </defs>

      {/* ---- ribbon tails, pinned under the wax and hanging thin ---- */}
      <g ref={hold("ribbons")} style={{ transformOrigin: "50px 76px" }}>
        <path
          d="M46 72 L34 90 L39 89 L40 95 L51 77 Z"
          fill="url(#snt-ribbon)"
          stroke="#171420"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M55 72 L69 89 L64 88.6 L63 94.6 L51 77 Z"
          fill="#7d2620"
          stroke="#171420"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </g>

      {/* ---- the disc, stood on its edge in the wax it squeezed out ---- */}
      <g ref={hold("disc")} style={{ transformOrigin: "50px 82px" }}>
        {/* The puddle at the foot: this is what stops it reading as a coin. */}
        <path
          d="M29 77 Q50 90 71 77 Q64 86 50 86 Q36 86 29 77 Z"
          fill="#4d1510"
          stroke="#171420"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Its thickness: a thin offset behind, not the Notary's slab. */}
        <ellipse
          cx="52.4"
          cy="58"
          rx="21"
          ry="22"
          fill="#4d1510"
          stroke="#171420"
          strokeWidth="1.8"
        />
        <path
          d="M50 36 C38 36 31 45 31 58 C31 71 39 80 50 80 C61 80 69 71 69 58 C69 45 62 36 50 36 Z"
          fill="url(#snt-face)"
          stroke="#171420"
          strokeWidth="2.2"
        />
        {/* The squeezed rim where the matrix bit. */}
        <path
          d="M50 40 C40 40 35 47 35 58 C35 68 42 76 50 76 C58 76 65 68 65 58 C65 47 60 40 50 40 Z"
          fill="none"
          stroke="#6a1d16"
          strokeWidth="2"
          opacity="0.75"
        />
        {/* The sentence, pressed into the face: four lines, the last one short. */}
        <g fill="#5a1812">
          <rect x="39" y="47.5" width="23" height="2.4" rx="1.2" />
          <rect x="39" y="53.5" width="19" height="2.4" rx="1.2" />
          <rect x="39" y="59.5" width="22" height="2.4" rx="1.2" />
          <rect x="39" y="65.5" width="11" height="2.4" rx="1.2" />
        </g>
        <circle cx="53" cy="66.7" r="1.3" fill="#5a1812" />
        {/* A thumb-notch out of the rim, where it was pressed crooked. */}
        <path
          d="M46 36.6 Q40 34 36.5 38 Q41 36.4 45.6 37.4 Z"
          fill="#b8412f"
          stroke="#171420"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          className="snt-shine"
          d="M36 49 Q40 41 48 39"
          stroke="#f3b394"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
