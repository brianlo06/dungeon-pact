import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-clerks.css";

/**
 * The Ledger Wraith.
 *
 * Tall, thin and weightless: a torn shroud hanging from a pair of shoulders
 * that are not really there, tapering into long strips that stop short of the
 * floor. It has no legs, no feet and no fists — the drawing refuses to offer
 * anywhere a blow could come from.
 *
 * The one solid, lit object in it is the open ledger held out in front on the
 * party's side, its pages the brightest value anywhere on the creature, with a
 * quill stood over them mid-word. The rig rotates and swells that book on the
 * entry, so the light in the middle of the silhouette is what moves when it
 * acts: it writes, and the writing is the attack.
 *
 * Silhouette: a narrow vertical rag, hood at the top, ragged strips at the
 * bottom, and one bright rectangle floating off its left hand.
 */
const PARTS = ["shroud", "body", "head", "ledger"] as const;

export function Wraith({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  return (
    <svg
      className={`wraith clerks-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Ledger Wraith"
    >
      <defs>
        <linearGradient id="wra-shroud" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#4e4a5b" />
          <stop offset="0.5" stopColor="#332f3d" />
          <stop offset="1" stopColor="#15131c" />
        </linearGradient>
        <linearGradient id="wra-inner" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#3a3648" />
          <stop offset="1" stopColor="#191722" />
        </linearGradient>
        <linearGradient id="wra-page" x1="0.1" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#f2f0e4" />
          <stop offset="0.6" stopColor="#d8cfb6" />
          <stop offset="1" stopColor="#9aa9bf" />
        </linearGradient>
        <radialGradient id="wra-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#9fb6d8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#9fb6d8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---- shroud: torn strips, ending in the air rather than on feet ---- */}
      <g ref={hold("shroud")} style={{ transformOrigin: "48px 30px" }}>
        <path
          d="M28 46 C28 31 36 22 48 22 C60 22 68 32 68 46 L66 66 L64 89 L58 73 L54 87 L48 71 L42 86 L38 71 L33 85 L31 63 Z"
          fill="url(#wra-shroud)"
          stroke="#171420"
          strokeWidth="2.3"
          strokeLinejoin="round"
        />
        {/* Two strips torn clean off, still drifting with it. */}
        <path
          d="M70 58 L76 74 L72 72 L73 82 L68 70 Z"
          fill="#2b2835"
          stroke="#171420"
          strokeWidth="1.3"
          opacity="0.8"
        />
        <path
          d="M26 56 L21 71 L25 69 L24 79 L29 67 Z"
          fill="#2b2835"
          stroke="#171420"
          strokeWidth="1.3"
          opacity="0.8"
        />
        {/* Folds, kept vertical: everything about it should fall. */}
        <g stroke="#15131c" strokeWidth="1.5" opacity="0.7" fill="none">
          <path d="M40 34 L38 68" />
          <path d="M56 34 L58 66" />
        </g>
      </g>

      {/* ---- body: a thin column under the shroud, and the sleeves ---- */}
      <g ref={hold("body")} style={{ transformOrigin: "48px 54px" }}>
        <path
          d="M41 32 H55 L57 50 L54 68 L50 78 Q47 82 45 76 L42 58 Z"
          fill="url(#wra-inner)"
          stroke="#171420"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        {/* The far sleeve, holding the spine of the book from behind. */}
        <path
          d="M54 36 C50 40 44 46 40 52 L45 56 Q49 48 56 43 Z"
          fill="url(#wra-shroud)"
          stroke="#171420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* The near sleeve, reaching down the page. */}
        <path
          d="M43 35 C37 39 30 46 27 54 L33 57 Q37 47 46 42 Z"
          fill="url(#wra-shroud)"
          stroke="#171420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* A hand of nothing much: three thin fingers off the cuff. */}
        <g stroke="#b9b2c6" strokeWidth="1.5" strokeLinecap="round">
          <path d="M29 55 L24 58" />
          <path d="M30 57 L25.5 61" />
          <path d="M31.5 58.5 L28 62.5" />
        </g>
        {/* A collar of filed paper where a throat would be. */}
        <path
          d="M39 31 L57 31 L59 37 Q48 42 37 37 Z"
          fill="#c6bc9a"
          stroke="#171420"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <g stroke="#7d7250" strokeWidth="0.8">
          <path d="M41 34 H56" />
          <path d="M42 37 H55" />
        </g>
      </g>

      {/* ---- head: an empty hood with two pale points in it ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "48px 30px" }}>
        <path
          d="M39 33 C37 20 41 7 48 7 C55 7 59 20 57 33 Z"
          fill="url(#wra-shroud)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M41.5 31 C40.5 21 43.5 12 48 12 C52.5 12 55.5 21 54.5 31 Z"
          fill="#0d0b13"
        />
        <circle className="wra-eye" cx="44.6" cy="24" r="1.7" />
        <circle className="wra-eye" cx="50.4" cy="23" r="1.3" />
        {/* A bookmark ribbon pinned through the hood, hanging to the side. */}
        <path
          d="M55 14 L61 16 L60 30 L57 26 Z"
          fill="#a8352a"
          stroke="#171420"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </g>

      {/* ---- ledger: the open book, the brightest thing in the drawing ---- */}
      <g ref={hold("ledger")} style={{ transformOrigin: "30px 52px" }}>
        <ellipse cx="30" cy="52" rx="28" ry="20" fill="url(#wra-halo)" />
        {/* The quill, stood in the middle of a word. */}
        <path
          d="M24.6 45 L15 27"
          stroke="#171420"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M24.6 45 L15 27"
          stroke="#e8e4d4"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M15 27 Q9 20 11 31 Q14 28 17 31 Z"
          fill="#e8e4d4"
          stroke="#171420"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        {/* Binding, under and around the pages. */}
        <path
          d="M9 41 Q21 35 30 43 Q39 35 51 41 L50 65 Q39 59 30 66 Q20 59 10 64 Z"
          fill="#241f2e"
          stroke="#171420"
          strokeWidth="2.1"
          strokeLinejoin="round"
        />
        <path
          d="M12 43.5 Q21 38.6 29.4 45.6 L29.4 62 Q21 55.6 12.6 60.4 Z"
          fill="url(#wra-page)"
          stroke="#171420"
          strokeWidth="1.3"
        />
        <path
          d="M30.6 45.6 Q39 38.6 48 43.5 L47.4 60.4 Q39 55.6 30.6 62 Z"
          fill="url(#wra-page)"
          stroke="#171420"
          strokeWidth="1.3"
        />
        <path d="M30 44.4 L30 64" stroke="#171420" strokeWidth="1.6" />
        {/* Entries, ruled: shorter towards the wet end of the line. */}
        <g stroke="#3d4a63" strokeWidth="1" opacity="0.85">
          <path d="M15 47 H27" />
          <path d="M15 51 H26" />
          <path d="M15 55 H27" />
          <path d="M33 46.6 H45" />
          <path d="M33 50.6 H44" />
          <path d="M33 54.6 H38" />
        </g>
        <circle cx="40" cy="54.6" r="1.1" fill="#241f2e" />
      </g>
    </svg>
  );
}
