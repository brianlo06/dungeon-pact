import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-forge.css";

/**
 * The Cinder Stoker.
 *
 * A furnace hand, not a soldier: stunted and hunched from a lifetime under a
 * coal hod, with one forearm grown huge from feeding the fire and a pair of
 * long branding tongs that it holds out in front of it like a pointer.
 *
 * Silhouette: wide and low. A lumpy heap of coal rides high on its back with
 * a shovel stuck upright in it, the peaked cap juts forward beneath, and the
 * tongs make a long thin line out towards the party with a lit coal at the
 * end. It is everything the Ash Acolyte is not — the Acolyte is a tall column
 * with fire on top.
 */
const PARTS = ["legs", "hod", "body", "head", "arm"] as const;

export function Stoker({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  return (
    <svg
      className={`stoker forge-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Cinder Stoker"
    >
      <defs>
        <linearGradient id="stk-iron" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#6a6274" />
          <stop offset="0.55" stopColor="#443e4e" />
          <stop offset="1" stopColor="#26222e" />
        </linearGradient>
        <linearGradient id="stk-apron" x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#9a5a38" />
          <stop offset="0.6" stopColor="#643622" />
          <stop offset="1" stopColor="#3a1e16" />
        </linearGradient>
        <linearGradient id="stk-tunic" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#7a5060" />
          <stop offset="1" stopColor="#3a2432" />
        </linearGradient>
        <linearGradient id="stk-skin" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#b08270" />
          <stop offset="1" stopColor="#7a5448" />
        </linearGradient>
        <linearGradient id="stk-hot" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#5a5464" />
          <stop offset="0.5" stopColor="#8a3a22" />
          <stop offset="1" stopColor="#ffb35e" />
        </linearGradient>
      </defs>

      {/* ---- legs: short, bowed, planted apart in iron-shod clogs ---- */}
      <g ref={hold("legs")} style={{ transformOrigin: "48px 88px" }}>
        <g stroke="#171420" strokeWidth="2" strokeLinejoin="round">
          <path d="M54 74 L63 75 L66 89 L57 89 Z" fill="#2c2532" />
          <path d="M54 96 Q54 88 60 87 L70 87 L71 96 Z" fill="#2a2632" />
          <path d="M36 74 L47 76 L43 89 L34 89 Z" fill="#3a3040" />
          <path d="M24 96 Q24 88 32 87 L45 87 L46 96 Z" fill="url(#stk-iron)" />
        </g>
        <path d="M27 92.5 H44" stroke="#8a8296" strokeWidth="1.2" />
      </g>

      {/* ---- the hod: a scuttle heaped with coal, a shovel stood in it ---- */}
      <g ref={hold("hod")} style={{ transformOrigin: "62px 50px" }}>
        {/* The shovel, jammed in the heap: it breaks the top of the outline */}
        <g strokeLinecap="round" fill="none">
          <path d="M76 26 L89 12" stroke="#171420" strokeWidth="5" />
          <path d="M76 26 L89 12" stroke="#7a5236" strokeWidth="2.6" />
        </g>
        <path
          d="M86 10 L93 11 L92 16 Z"
          fill="#443e4e"
          stroke="#171420"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M56 54 L57 31 L87 28 L82 56 Z"
          fill="url(#stk-iron)"
          stroke="#171420"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Banding and rivets, so it reads as riveted iron, not a crate */}
        <path d="M57 40 L85 38" stroke="#26222e" strokeWidth="2.4" />
        <path d="M57 48 L83 47" stroke="#26222e" strokeWidth="2.4" />
        {[61, 69, 77].map((x) => (
          <circle
            key={x}
            cx={x}
            cy={39.6 - (x - 57) * 0.07}
            r="1"
            fill="#8a8296"
          />
        ))}
        {/* The coal heap: a lumpy outline nobody could mistake for a hat */}
        <path
          d="M55 32 Q55 23 61 23 Q63 15 70 17 Q74 11 80 15 Q86 13 88 20 Q93 23 89 30 Z"
          fill="#27222e"
          stroke="#171420"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <g fill="#4a4458">
          <path d="M61 25 L65 22 L67 26 Z" />
          <path d="M71 19 L75 17 L75 21 Z" />
          <path d="M81 18 L85 18 L85 22 Z" />
          <path d="M68 27 L72 25 L73 29 Z" />
        </g>
        <circle className="stk-ember" cx="65" cy="28" r="1.6" />
        <circle className="stk-ember stk-ember-b" cx="79" cy="24" r="1.4" />
        <circle className="stk-ember stk-ember-c" cx="86" cy="27" r="1.1" />
      </g>

      {/* ---- body: hunched under the load, aproned, belly out in front ---- */}
      <g ref={hold("body")} style={{ transformOrigin: "52px 80px" }}>
        <path
          d="M37 79 C31 70 32 58 38 50 C44 42 54 38 62 40 C71 42 75 52 73 62 C72 70 69 76 66 80 Z"
          fill="url(#stk-tunic)"
          stroke="#171420"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* The hod's strap, over the shoulder and across the chest */}
        <path
          d="M60 41 Q49 45 43 60"
          stroke="#3a1e16"
          strokeWidth="3.6"
          fill="none"
        />
        <rect x="46.5" y="49" width="4" height="3.4" rx="0.6" fill="#8a8296" />
        {/* The hunch: a crease of shadow down the back under the load */}
        <path
          d="M66 46 Q71 56 68 70"
          stroke="#2a1a26"
          strokeWidth="1.8"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M60 43 Q64 46 66 46"
          stroke="#9a6a7a"
          strokeWidth="1.4"
          fill="none"
          opacity="0.6"
        />
        {/* Leather apron, scorched, hanging to the knees */}
        <path
          d="M34 60 C32 70 33 80 37 88 L56 88 C59 79 57 66 51 58 Z"
          fill="url(#stk-apron)"
          stroke="#171420"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M40 72 Q44 67 49 72 Q46 78 40 76 Z"
          fill="#2a1712"
          opacity="0.8"
        />
        <path d="M36 66 L53 63" stroke="#2a1712" strokeWidth="1.6" />
      </g>

      {/* ---- head: sunk forward between the shoulders, a peaked cap ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "42px 50px" }}>
        {/* Face, soot-dark and heavy-jawed */}
        <path
          d="M25 40 L44 38 L46 47 Q43 56 33 56 Q25 55 24 48 Z"
          fill="url(#stk-skin)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Soot rag over the mouth */}
        <path
          d="M23 47 Q32 45 41 49 L38 55.5 Q29 57 25 53 Z"
          fill="#6d6470"
          stroke="#171420"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M27 51 L36 52" stroke="#4a4452" strokeWidth="1.2" />
        {/* The cap: flat crown, a peak jutting forward */}
        <path
          d="M25 41 L27 32 Q36 28 45 31 L47 40 Z"
          fill="#3a2e3e"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M15 41.5 L27 38 L30 41 L17 43.5 Z"
          fill="#2a2230"
          stroke="#171420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Goggles: this is its whole face */}
        <path d="M24 44 L46 42" stroke="#26222e" strokeWidth="3" />
        <circle
          cx="38.5"
          cy="43"
          r="3.2"
          fill="#26222e"
          stroke="#171420"
          strokeWidth="1.2"
        />
        <circle className="stk-lens" cx="38.5" cy="43" r="1.7" />
        <circle
          cx="29.5"
          cy="44"
          r="4.2"
          fill="#26222e"
          stroke="#171420"
          strokeWidth="1.4"
        />
        <circle className="stk-lens" cx="29.5" cy="44" r="2.4" />
        <circle cx="28.6" cy="43" r="0.8" fill="#fff4d6" />
      </g>

      {/* ---- tong arm: one oversized forearm and a long pair of tongs ---- */}
      <g ref={hold("arm")} style={{ transformOrigin: "46px 52px" }}>
        {/*
         * Tongs first, so the fist closes over them. They are long and thin on
         * purpose — in silhouette they have to read as a line with a coal on
         * the end, not as a longer arm — and the jaws stand open around it.
         */}
        <g strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M30 60 L18 60 L3 51" stroke="#171420" strokeWidth="4.2" />
          <path d="M30 63 L18 61.5 L3 66" stroke="#171420" strokeWidth="4.2" />
          <path
            d="M30 60 L18 60 L3 51"
            stroke="url(#stk-hot)"
            strokeWidth="2"
          />
          <path
            d="M30 63 L18 61.5 L3 66"
            stroke="url(#stk-hot)"
            strokeWidth="2"
          />
        </g>
        <circle
          cx="18"
          cy="60.8"
          r="1.7"
          fill="#8a8296"
          stroke="#171420"
          strokeWidth="1"
        />
        {/* The coal it is holding, lit */}
        <path
          className="stk-coal"
          d="M1 58 L3.5 54.5 L8 55 L9 59.5 L5 62.5 L1.5 61.5 Z"
          stroke="#171420"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Upper arm and the huge gauntleted forearm */}
        <path
          d="M44 46 C52 50 51 62 45 68 L40 70 C35 67 35 61 38 56 Z"
          fill="url(#stk-tunic)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M44 71 L34 69.5 C28 68.5 28 57 34 57 L43 59 C46 61 46 68 44 71 Z"
          fill="url(#stk-apron)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M39 58.5 L38.5 70" stroke="#3a1e16" strokeWidth="1.8" />
        {/* The fist */}
        <path
          d="M34 57 C28 55 25 58 26 63 C27 67 31 68.5 34 67.5 Z"
          fill="url(#stk-skin)"
          stroke="#171420"
          strokeWidth="2"
        />
        <path d="M29 60 H33 M29 63.5 H33" stroke="#5a3a30" strokeWidth="1" />
      </g>
    </svg>
  );
}
