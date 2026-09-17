import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-salvor.css";

/**
 * The Salvor.
 *
 * The cistern's claimant: whatever the water took is its to keep. A hunched
 * diver grown into its salvage — a brass helmet with one lit porthole, a hump
 * of riveted hull plates on its back, a drowned lantern still hanging off it,
 * and a long gaff hook held out in front for hauling things (and people) in.
 * Every plate it hardens adds a cluster of barnacles to the hump.
 *
 * Rigged as `legs`, `body`, `shell`, `lantern`, `hook` and `helmet`. The hook
 * carries every blow; the shell lags behind the body like a load on a back;
 * the lantern swings on its chain.
 *
 * Silhouette test: a round helmet on a hunched mass, a big hump behind, and a
 * long pole ending in a hook out on the party's side. Filled black it is a
 * diver dragging its whole wreck.
 *
 * Enemies face the party, to their left, so the hook is on the left.
 */
const PARTS = ["legs", "body", "shell", "lantern", "hook", "helmet"] as const;

export function Salvor({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  return (
    <svg
      className={`salvor ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="The Salvor"
    >
      <defs>
        <linearGradient id="slv-brass" x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#d7b46a" />
          <stop offset="0.5" stopColor="#9a7432" />
          <stop offset="1" stopColor="#4f3a18" />
        </linearGradient>
        <linearGradient id="slv-rust" x1="0.2" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#7a5a48" />
          <stop offset="0.5" stopColor="#4f3b33" />
          <stop offset="1" stopColor="#2a211f" />
        </linearGradient>
        <linearGradient id="slv-canvas" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#4c5c5a" />
          <stop offset="1" stopColor="#222c2c" />
        </linearGradient>
        <radialGradient id="slv-lamp" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#dffcf2" />
          <stop offset="0.5" stopColor="#7fe0c8" />
          <stop offset="1" stopColor="#2f7a6a" />
        </radialGradient>
      </defs>

      {/* ---- the hump: hull plates riveted over its back ---- */}
      <g ref={hold("shell")} style={{ transformOrigin: "64px 52px" }}>
        <path
          d="M50 30 C66 20 88 28 90 50 C92 66 84 78 70 80 L52 72 Z"
          fill="url(#slv-rust)"
          stroke="#171420"
          strokeWidth="2.2"
        />
        <path d="M58 30 C66 40 70 58 66 78 M72 26 C80 38 84 56 80 76" stroke="#171420" strokeWidth="1.4" fill="none" opacity="0.75" />
        {[
          [62, 36], [76, 34], [84, 50], [70, 54], [60, 60], [80, 66],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.3" fill="#a88a5a" />
        ))}
        {/* Barnacles: one cluster per hardened plate, shown by the combatant. */}
        {[
          [66, 44], [82, 42], [74, 62], [86, 58], [62, 50], [78, 72],
        ].map(([x, y], i) => (
          <g key={i} className={`slv-crust slv-crust-${i + 1}`}>
            <circle cx={x} cy={y} r="3.4" fill="#cfc6b0" stroke="#171420" strokeWidth="1" />
            <circle cx={x} cy={y} r="1.3" fill="#3a3530" />
            <circle cx={x + 3.5} cy={y + 2.5} r="2.2" fill="#b9af98" stroke="#171420" strokeWidth="0.8" />
          </g>
        ))}
      </g>

      {/* ---- legs: thick, in weighted boots ---- */}
      <g ref={hold("legs")} style={{ transformOrigin: "52px 82px" }}>
        <path d="M42 74 L38 90 H50 L50 76 Z" fill="url(#slv-canvas)" stroke="#171420" strokeWidth="2" />
        <path d="M56 74 L58 90 H70 L64 74 Z" fill="url(#slv-canvas)" stroke="#171420" strokeWidth="2" />
        <rect x="35" y="88" width="17" height="6" rx="1.5" fill="url(#slv-brass)" stroke="#171420" strokeWidth="1.6" />
        <rect x="56" y="88" width="17" height="6" rx="1.5" fill="url(#slv-brass)" stroke="#171420" strokeWidth="1.6" />
      </g>

      {/* ---- body: a canvas diving suit, hunched forward ---- */}
      <g ref={hold("body")} style={{ transformOrigin: "50px 62px" }}>
        <path
          d="M34 44 C38 36 56 34 62 42 L66 70 C62 78 42 80 36 72 Z"
          fill="url(#slv-canvas)"
          stroke="#171420"
          strokeWidth="2"
        />
        <path d="M38 58 H64" stroke="#171420" strokeWidth="3" />
        <rect x="46" y="55" width="8" height="6" rx="1" fill="url(#slv-brass)" stroke="#171420" strokeWidth="1.2" />
        {/* The anchor chain it hauls with, slung across the suit. */}
        <path d="M36 48 Q50 66 64 50" stroke="#6f6a72" strokeWidth="2.2" strokeDasharray="3 2" fill="none" />
      </g>

      {/* ---- a drowned lantern, still hanging off it ---- */}
      <g ref={hold("lantern")} style={{ transformOrigin: "66px 64px" }}>
        <path d="M66 64 L66 72" stroke="#6f6a72" strokeWidth="1.4" />
        <rect x="61" y="72" width="10" height="12" rx="1.5" fill="#2a2a30" stroke="#171420" strokeWidth="1.6" />
        <rect className="slv-lamp" x="63" y="74.5" width="6" height="7" fill="url(#slv-lamp)" />
        <path d="M60 72 H72 M61 84 H71" stroke="url(#slv-brass)" strokeWidth="1.6" />
      </g>

      {/* ---- the gaff: a long pole with a hook, held out at the party ---- */}
      <g ref={hold("hook")} style={{ transformOrigin: "38px 50px" }}>
        <path d="M40 46 L28 52 L30 57 L42 52 Z" fill="url(#slv-canvas)" stroke="#171420" strokeWidth="1.8" />
        <circle cx="29" cy="54.5" r="3.4" fill="url(#slv-brass)" stroke="#171420" strokeWidth="1.4" />
        <path d="M31 56 L4 30" stroke="#5a4636" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M31 56 L4 30" stroke="#171420" strokeWidth="0.8" opacity="0.5" />
        {/* The hook itself: an iron curl with a barb, facing the party. */}
        <path
          d="M5 31 C-2 24 0 14 8 13 C14 12 17 18 13 22"
          fill="none"
          stroke="#171420"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M5 31 C-2 24 0 14 8 13 C14 12 17 18 13 22"
          fill="none"
          stroke="#8a8490"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path d="M13 22 L10 18 L15 19 Z" fill="#8a8490" stroke="#171420" strokeWidth="1" />
      </g>

      {/* ---- helmet: brass, with one lit porthole facing the party ---- */}
      <g ref={hold("helmet")} style={{ transformOrigin: "44px 40px" }}>
        <circle cx="44" cy="28" r="14" fill="url(#slv-brass)" stroke="#171420" strokeWidth="2.2" />
        <path d="M31 38 H57 L55 44 H33 Z" fill="url(#slv-brass)" stroke="#171420" strokeWidth="1.8" />
        {[34, 44, 54].map((x) => (
          <circle key={x} cx={x} cy="41" r="1" fill="#4f3a18" />
        ))}
        <circle cx="39" cy="28" r="7.4" fill="#171420" />
        <circle className="slv-port" cx="39" cy="28" r="5.6" fill="url(#slv-lamp)" />
        <path d="M33.6 28 H44.4 M39 22.6 V33.4" stroke="#6b5222" strokeWidth="1.3" />
        <circle cx="55" cy="26" r="3" fill="#171420" stroke="#6b5222" strokeWidth="1" />
        <path d="M46 14 C50 12 54 14 55 17" stroke="#f0d79a" strokeWidth="1.3" fill="none" opacity="0.8" />
      </g>
    </svg>
  );
}
