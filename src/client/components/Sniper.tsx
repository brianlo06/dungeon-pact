import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-debt.css";

/**
 * The Rivet Sniper.
 *
 * It hits harder than anything else that is not a boss, from the back row, so
 * the whole design is the gun: a riveting rifle longer than the creature
 * holding it, set on a bipod, fed red-hot rivets from a brazier strapped to
 * its back. The creature is small, wiry and goggled, crouched into the stock.
 *
 * Silhouette: one long horizontal line pointing at the party, an A-frame of
 * bipod legs under it with daylight through the middle, and a small hunched
 * figure behind with ears raked back and a chimney smoking over its shoulder.
 * It stands in the back row, so it is drawn small on screen — it has to read
 * from that line alone.
 */
const PARTS = ["legs", "brazier", "belt", "body", "gun", "head"] as const;

export function Sniper({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  return (
    <svg
      className={`sniper ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Rivet Sniper"
    >
      <defs>
        <linearGradient id="snp-iron" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a8396" />
          <stop offset="0.5" stopColor="#57505f" />
          <stop offset="1" stopColor="#2c2733" />
        </linearGradient>
        <linearGradient id="snp-tarp" x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#9a5a32" />
          <stop offset="0.55" stopColor="#6a3a22" />
          <stop offset="1" stopColor="#3a1f14" />
        </linearGradient>
        <linearGradient id="snp-skin" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#a89cb6" />
          <stop offset="1" stopColor="#5f5570" />
        </linearGradient>
        <linearGradient id="snp-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2bf72" />
          <stop offset="1" stopColor="#8a6428" />
        </linearGradient>
      </defs>

      {/* ---- legs: crouched, bony, one knee down ---- */}
      <g
        ref={hold("legs")}
        data-part="legs"
        style={{ transformOrigin: "70px 90px" }}
      >
        <g fill="url(#snp-skin)" stroke="#171420" strokeWidth="2">
          <path d="M62 72 L56 86 L60 88 L64 94 L54 95 L52 92 L50 86 L56 72 Z" />
          <path d="M74 72 L82 84 L80 94 L88 95 L90 92 L86 84 L80 72 Z" />
        </g>
      </g>

      {/* ---- brazier: strapped to its back, heating the rivets ---- */}
      <g
        ref={hold("brazier")}
        data-part="brazier"
        style={{ transformOrigin: "82px 52px" }}
      >
        {/* A short chimney, raked back, breaking the top of the outline */}
        <path
          d="M84 36 L90 14 L96 16 L90 38 Z"
          fill="url(#snp-iron)"
          stroke="#171420"
          strokeWidth="2"
        />
        <ellipse className="snp-smoke" cx="93" cy="12" rx="4" ry="2.6" />
        <path
          d="M74 38 H94 L92 60 C88 64 80 64 76 60 Z"
          fill="url(#snp-iron)"
          stroke="#171420"
          strokeWidth="2.2"
        />
        {/* The coals, glowing through a grate */}
        <ellipse className="snp-coals" cx="84" cy="39" rx="9" ry="2.6" />
        <g stroke="#171420" strokeWidth="1.2">
          <path d="M76 48 H92" />
          <path d="M77 54 H91" />
        </g>
        <rect x="80" y="44" width="8" height="3" fill="#ff8a3a" opacity="0.5" />
      </g>

      {/* ---- belt: hot rivets feeding round to the breech ---- */}
      <g
        ref={hold("belt")}
        data-part="belt"
        style={{ transformOrigin: "76px 58px" }}
      >
        <path
          d="M78 60 C76 72 64 72 58 62"
          stroke="#3a3440"
          strokeWidth="3.6"
          fill="none"
        />
        {[
          [76.6, 65.4],
          [72.6, 69],
          [67.4, 69.6],
          [62.4, 67.2],
        ].map(([x, y]) => (
          <circle key={x} className="snp-rivet" cx={x} cy={y} r="1.6" />
        ))}
      </g>

      {/* ---- body: a hunched figure in a scorched tarp ---- */}
      <g
        ref={hold("body")}
        data-part="body"
        style={{ transformOrigin: "68px 72px" }}
      >
        <path
          d="M58 40 C62 34 72 34 78 40 C82 48 84 60 84 74 L54 76 C52 64 54 48 58 40 Z"
          fill="url(#snp-tarp)"
          stroke="#171420"
          strokeWidth="2.2"
        />
        {/* A torn hem and a strap across the chest */}
        <path
          d="M54 76 L58 72 L62 77 L67 72 L72 77 L77 72 L84 74"
          fill="none"
          stroke="#171420"
          strokeWidth="1.4"
        />
        <path d="M60 42 L80 64" stroke="#2e2019" strokeWidth="2.4" />
        {/* The trigger arm, a sleeve of the same tarp */}
        <path
          d="M62 44 L69 50 L59 61 L53 57 Z"
          fill="url(#snp-tarp)"
          stroke="#171420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </g>

      {/* ---- the gun: longer than it is, on an A-frame bipod ---- */}
      <g
        ref={hold("gun")}
        data-part="gun"
        style={{ transformOrigin: "62px 54px" }}
      >
        {/* Bipod: an A-frame with daylight through it */}
        <g stroke="#171420" strokeWidth="4" strokeLinecap="round">
          <path d="M24 54 L14 94" />
          <path d="M26 54 L34 94" />
        </g>
        <g stroke="#6d6578" strokeWidth="2" strokeLinecap="round">
          <path d="M24 54 L14 94" />
          <path d="M26 54 L34 94" />
        </g>
        {/* Barrel, with cooling rings, and a flared muzzle */}
        <rect
          x="6"
          y="47.4"
          width="44"
          height="5.2"
          fill="url(#snp-iron)"
          stroke="#171420"
          strokeWidth="1.8"
        />
        {[14, 21, 28].map((x) => (
          <rect
            key={x}
            x={x}
            y="45.8"
            width="3"
            height="8.4"
            rx="0.8"
            fill="url(#snp-brass)"
            stroke="#171420"
            strokeWidth="1.2"
          />
        ))}
        <path
          d="M1 44 L8 46.6 V53.4 L1 56 Z"
          fill="url(#snp-iron)"
          stroke="#171420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <ellipse className="snp-muzzle" cx="1.6" cy="50" rx="1.2" ry="3.6" />
        {/* The breech: boxy, riveted, with a feed mouth */}
        <path
          d="M46 44 H62 L64 58 H48 Z"
          fill="url(#snp-iron)"
          stroke="#171420"
          strokeWidth="2"
        />
        <circle cx="50" cy="48" r="1" fill="#2a2632" />
        <circle cx="58" cy="48" r="1" fill="#2a2632" />
        <rect x="53" y="53" width="6" height="3" fill="#ff8a3a" opacity="0.8" />
        {/* A long sight along the top, on two posts */}
        <g stroke="#171420" strokeWidth="1.2" fill="#4a4452">
          <rect x="35" y="38.6" width="2.4" height="9" />
          <rect x="46" y="38.6" width="2.4" height="9" />
        </g>
        <rect
          x="30"
          y="35.6"
          width="25"
          height="3.8"
          rx="1.4"
          fill="url(#snp-brass)"
          stroke="#171420"
          strokeWidth="1.2"
        />
        <circle className="snp-sight" cx="30.6" cy="37.5" r="1.5" />
        {/* The grip, and the hand on it */}
        <path
          d="M52 57 L56 57 L55 64 L51 63 Z"
          fill="#5a3a24"
          stroke="#171420"
          strokeWidth="1.3"
        />
        <circle
          cx="54.4"
          cy="58.4"
          r="2.8"
          fill="url(#snp-skin)"
          stroke="#171420"
          strokeWidth="1.3"
        />
        {/* The stock, set into its shoulder */}
        <path
          d="M62 48 L74 50 L74 58 L63 57 Z"
          fill="#5a3a24"
          stroke="#171420"
          strokeWidth="1.8"
        />
      </g>

      {/* ---- head: goggled, ears raked back, pressed to the sight ---- */}
      <g
        ref={hold("head")}
        data-part="head"
        style={{ transformOrigin: "64px 42px" }}
      >
        {/* Bat ears, ragged, swept flat back: they break the top outline */}
        <path
          d="M63 30 L82 13 L79 19.4 L83 19 L69 33 Z"
          fill="url(#snp-skin)"
          stroke="#171420"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M66 32 L92 23 L86 27.4 L90 29 L72 37 Z"
          fill="url(#snp-skin)"
          stroke="#171420"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M56 38 C56 32 60 28.6 65 28.8 C70 29 73 33 72 38 C71 42 67 45 62 45 L56.4 43.4 C55.2 42 55.2 40 56 38 Z"
          fill="url(#snp-skin)"
          stroke="#171420"
          strokeWidth="2"
        />
        {/* A scarf pulled over the snout */}
        <path
          d="M55 41 L67 42.6 L70 47 L58 48 C56 46 55 43.6 55 41 Z"
          fill="#7a2f28"
          stroke="#171420"
          strokeWidth="1.4"
        />
        {/* Goggles: two brass rings, the near one hard against the sight */}
        <circle
          cx="64.6"
          cy="36"
          r="3"
          fill="url(#snp-brass)"
          stroke="#171420"
          strokeWidth="1.3"
        />
        <circle
          cx="58.4"
          cy="37.2"
          r="3.6"
          fill="url(#snp-brass)"
          stroke="#171420"
          strokeWidth="1.3"
        />
        <circle className="snp-lens" cx="58.4" cy="37.2" r="2.1" />
        <circle className="snp-lens" cx="64.6" cy="36" r="1.6" />
      </g>
    </svg>
  );
}
