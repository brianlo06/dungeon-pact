import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-forge.css";

/**
 * The Ash Acolyte.
 *
 * A zealot of the furnace that has given its head to it. There is no face
 * under the mantle, only an iron brazier on a thin neck with a fire burning
 * in it, and the robe below the waist has burnt away to a ragged hem that
 * sheds ash as it drifts. It does not walk; it hangs.
 *
 * Silhouette: a tall column, fire at the top, a ragged mantle across the
 * shoulders, and one long bell sleeve reaching out towards the party with an
 * ember held up over the hand. The Cinder Stoker it fights beside is wide, low
 * and lumpy; this is the opposite shape on purpose, so the two small fire
 * users are told apart by outline and not by colour. And it has no hood: the
 * Collector is the hooded one.
 */
const PARTS = [
  "hem",
  "offArm",
  "robe",
  "head",
  "castArm",
  "ember",
  "cinders",
] as const;

export function Acolyte({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  return (
    <svg
      className={`acolyte forge-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Ash Acolyte"
    >
      <defs>
        <linearGradient id="aco-robe" x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#cfc4c4" />
          <stop offset="0.5" stopColor="#9a8f9c" />
          <stop offset="1" stopColor="#5e5668" />
        </linearGradient>
        <linearGradient id="aco-mantle" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#7a7282" />
          <stop offset="1" stopColor="#3e3848" />
        </linearGradient>
        <linearGradient id="aco-hem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5e5668" />
          <stop offset="0.6" stopColor="#9a8f9c" />
          <stop offset="1" stopColor="#d8cfcc" />
        </linearGradient>
        <linearGradient id="aco-iron" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#6a6274" />
          <stop offset="1" stopColor="#26222e" />
        </linearGradient>
        <linearGradient id="aco-fire" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffe29a" />
          <stop offset="0.4" stopColor="#ff8a3a" />
          <stop offset="1" stopColor="#c46ae0" />
        </linearGradient>
        <radialGradient id="aco-orb">
          <stop offset="0" stopColor="#fff4d6" />
          <stop offset="0.4" stopColor="#ffb35e" />
          <stop offset="1" stopColor="#c2442a" />
        </radialGradient>
      </defs>

      {/* ---- hem: the robe below the waist, burnt ragged, shedding ash ---- */}
      <g ref={hold("hem")} style={{ transformOrigin: "50px 66px" }}>
        <path
          d="M36 64 L64 64 L70 82 L66 89 L62 84 L58 92 L53 85 L48 93 L44 85 L39 90 L35 84 L30 86 Z"
          fill="url(#aco-hem)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <g fill="#9d94a4">
          <rect className="aco-ash" x="45" y="93" width="2" height="2" />
          <rect
            className="aco-ash aco-ash-b"
            x="55"
            y="93"
            width="1.8"
            height="1.8"
          />
          <rect
            className="aco-ash aco-ash-c"
            x="50"
            y="95"
            width="1.5"
            height="1.5"
          />
          <rect
            className="aco-ash aco-ash-d"
            x="63"
            y="90"
            width="1.8"
            height="1.8"
          />
        </g>
      </g>

      {/* ---- the back arm: a sleeve hanging, a censer on a short chain ---- */}
      <g ref={hold("offArm")} style={{ transformOrigin: "62px 40px" }}>
        <path
          d="M60 38 L70 44 L73 62 L66 64 L63 50 Z"
          fill="url(#aco-mantle)"
          stroke="#171420"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M70 63 L72 73" stroke="#8d8299" strokeWidth="1.4" />
        <path
          d="M67 77 Q67 72 72 72 Q77 72 77 77 Q77 82 72 82 Q67 82 67 77 Z"
          fill="#9a7a3a"
          stroke="#171420"
          strokeWidth="1.8"
        />
        <path d="M67.5 76 H76.5" stroke="#5a4420" strokeWidth="1.2" />
        <circle className="aco-censer" cx="72" cy="78.5" r="1.4" />
      </g>

      {/* ---- robe: a column, a ragged mantle, a stole of ember cloth ---- */}
      <g ref={hold("robe")} style={{ transformOrigin: "50px 64px" }}>
        <path
          d="M38 40 L62 40 L65 67 L35 67 Z"
          fill="url(#aco-robe)"
          stroke="#171420"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* The stole hangs past the waist, over the hem */}
        <path
          d="M43 36 L41 80 L45.5 76 L48 36 Z"
          fill="#b04a22"
          stroke="#171420"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M52 36 L52 82 L56.5 78 L57 36 Z"
          fill="#8a3620"
          stroke="#171420"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Sigils burnt into the stole */}
        <g fill="#ffb35e" opacity="0.9">
          <rect
            x="43.4"
            y="52"
            width="2.2"
            height="2.2"
            transform="rotate(45 44.5 53.1)"
          />
          <rect
            x="53.4"
            y="60"
            width="2.2"
            height="2.2"
            transform="rotate(45 54.5 61.1)"
          />
          <rect
            x="42.8"
            y="68"
            width="2.2"
            height="2.2"
            transform="rotate(45 43.9 69.1)"
          />
        </g>
        <path d="M36 66 L64 66" stroke="#26222e" strokeWidth="2.6" />
        {/* The mantle: charred cloth over the shoulders, torn to points */}
        <path
          d="M34 40 Q50 32 66 40 L68 49 L63 46 L61 52 L56 47 L51 53 L46 47 L41 52 L38 46 L32 49 Z"
          fill="url(#aco-mantle)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </g>

      {/* ---- head: an iron brazier on a thin neck, burning ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "50px 36px" }}>
        <path d="M47 38 L48 30 L52 30 L53 38 Z" fill="#26222e" />
        {/* The fire, behind the bars so the cage reads over it */}
        <path
          className="aco-flame"
          d="M36 24 Q30 16 38 10.5 Q39 17 43.5 17 Q43 10 50 9 Q49 15 55 17 Q56 11 62 10.5 Q69 16 64 24 Z"
          fill="url(#aco-fire)"
        />
        <path
          d="M35 21 L65 21 L61 31 Q50 35 39 31 Z"
          fill="url(#aco-iron)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* The coal where a face would be */}
        <ellipse className="aco-core" cx="50" cy="22" rx="10" ry="2.6" />
        <g stroke="#171420" strokeWidth="1.8" strokeLinecap="round">
          <path d="M38 21 L36 14" />
          <path d="M45 21 L44 13" />
          <path d="M55 21 L56 13" />
          <path d="M62 21 L64 14" />
        </g>
        {/* Vents in the bowl, lit from inside: the only thing like eyes */}
        <path
          d="M42 26 L47 27.4 M53 27.4 L58 26"
          stroke="#ffb35e"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      {/* ---- casting arm: a bell sleeve reaching out, an ember held up ---- */}
      <g ref={hold("castArm")} style={{ transformOrigin: "40px 40px" }}>
        {/* The sleeve hangs in a point beneath the arm */}
        <path
          d="M40 38 L22 34 L16 38 L22 60 L28 50 L42 50 Z"
          fill="url(#aco-mantle)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Long charred fingers under the ember */}
        <g stroke="#171420" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M18 35 L12 32" />
          <path d="M18 35 L14 28" />
          <path d="M19 35 L19 29" />
        </g>
        {/* The ember: thrown on a cast, and a new one kindles in the palm */}
        <g ref={hold("ember")} style={{ transformOrigin: "13px 22px" }}>
          <circle className="aco-halo" cx="13" cy="22" r="8" />
          <circle
            cx="13"
            cy="22"
            r="5"
            fill="url(#aco-orb)"
            stroke="#171420"
            strokeWidth="1.4"
          />
        </g>
      </g>

      {/* ---- cinders: stones of ash, hanging around it in the heat ---- */}
      <g ref={hold("cinders")} style={{ transformOrigin: "50px 46px" }}>
        <g fill="#3a3442" stroke="#171420" strokeWidth="1.2">
          <path d="M74 24 L78 22 L80 26 L76 28 Z" />
          <path d="M24 72 L28 70 L29 74 L25 75 Z" />
          <path d="M79 48 L82 46 L84 49 L81 51 Z" />
        </g>
        <circle className="aco-censer" cx="77" cy="25" r="1" />
      </g>
    </svg>
  );
}
