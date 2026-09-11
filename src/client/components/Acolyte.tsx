import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-forge.css";

/**
 * The Ash Acolyte.
 *
 * A zealot of the furnace that has given its head to it. There is no face
 * under the mantle, only an iron bowl on a thin neck with a fire burning in
 * it, and the robe below the waist is burning away from the hem up. It does
 * not walk; it hangs.
 *
 * It stands in the back row at about seventy pixels, so it is drawn in a few
 * large shapes rather than many small ones: a bone-white column and bell
 * sleeve, a charred mantle, one rust stole, and on top a single big fire. The
 * fire is drawn as fire, not as a head-dress — one tall tongue leaning back
 * from the party and curling over at the tip, two short licks off its flanks,
 * a fleck torn loose above, a white core inside an orange body inside a red
 * rim. Nothing about it is symmetrical or evenly spaced, and the iron bars
 * that used to stand up through it are gone: together those made the first
 * drawing read as a crown.
 *
 * Silhouette: a tall column, fire at the top, a mantle across the shoulders,
 * one long bell sleeve reaching out towards the party with an ember held up
 * over the hand, and a censer swung clear on the other side. The Cinder
 * Stoker it fights beside is wide, low and lumpy; this is the opposite shape
 * on purpose. And it has no hood: the Collector is the hooded one.
 *
 * It uses the `person` footprint rather than `small`: a narrow column in the
 * back row needed the extra tenth to keep its fire and ember readable.
 *
 * Glows are soft shapes marked `ph-glow`, not filters, so the silhouette
 * check can ignore them and a full stage does not pay for a drop shadow.
 * Killed, the fire goes out (see creatures-forge.css).
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
          <stop offset="0" stopColor="#f4ecdc" />
          <stop offset="0.55" stopColor="#d2c6b8" />
          <stop offset="1" stopColor="#9c8f98" />
        </linearGradient>
        <linearGradient id="aco-mantle" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#62586a" />
          <stop offset="1" stopColor="#2a2432" />
        </linearGradient>
        <linearGradient id="aco-sleeve" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#efe5d4" />
          <stop offset="1" stopColor="#a89aa0" />
        </linearGradient>
        <linearGradient id="aco-hem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7bbb0" />
          <stop offset="0.55" stopColor="#7c7080" />
          <stop offset="1" stopColor="#2e2834" />
        </linearGradient>
        <linearGradient id="aco-iron" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#5a5264" />
          <stop offset="1" stopColor="#1c1924" />
        </linearGradient>
        <linearGradient id="aco-fire" x1="0" y1="1" x2="0.2" y2="0">
          <stop offset="0" stopColor="#ff9a3a" />
          <stop offset="0.6" stopColor="#f0622a" />
          <stop offset="1" stopColor="#c8321e" />
        </linearGradient>
        <linearGradient id="aco-fire-mid" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd36a" />
          <stop offset="1" stopColor="#ff8a2e" />
        </linearGradient>
        <radialGradient id="aco-haze">
          <stop offset="0" stopColor="#ffb24a" stopOpacity="0.42" />
          <stop offset="0.5" stopColor="#ff7a2e" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ff7a2e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="aco-spark">
          <stop offset="0" stopColor="#ffd07a" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="#ff8a3a" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ff7a2e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="aco-orb">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset="0.45" stopColor="#ffc05e" />
          <stop offset="1" stopColor="#e2582a" />
        </radialGradient>
      </defs>

      {/* ---- hem: the robe below the waist, burning up from the edge ---- */}
      <g ref={hold("hem")} style={{ transformOrigin: "50px 66px" }}>
        <path
          d="M35 63 L65 63 L71 80 L66 90 L60 83 L55 93 L49 84 L43 92 L39 83 L31 87 L34 76 Z"
          fill="url(#aco-hem)"
          stroke="#171420"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {/* The edge is alight, the way paper burns */}
        <path
          className="aco-burn"
          d="M34 85 L39 81 L43 89.5 L49 81.5 L55 90.5 L60 80.5 L66 87.5 L69.5 80"
          fill="none"
          stroke="#ff8a3a"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <g fill="#b0a4ac">
          <rect className="aco-ash" x="44" y="94" width="2.4" height="2.4" />
          <rect
            className="aco-ash aco-ash-b"
            x="57"
            y="94"
            width="2.2"
            height="2.2"
          />
          <rect
            className="aco-ash aco-ash-c"
            x="36"
            y="90"
            width="2"
            height="2"
          />
        </g>
      </g>

      {/* ---- the back arm: a sleeve hanging, a censer swung out on a chain,
          clear of the hem so it reads on its own ---- */}
      <g ref={hold("offArm")} style={{ transformOrigin: "62px 40px" }}>
        <path
          d="M59 38 L71 42 L77 60 L68 64 L62 50 Z"
          fill="url(#aco-mantle)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M74 61 L80.4 73"
          stroke="#171420"
          strokeWidth="1.8"
          strokeDasharray="2 1.2"
        />
        <circle
          cx="81.6"
          cy="78.4"
          r="5.6"
          fill="url(#aco-iron)"
          stroke="#171420"
          strokeWidth="2.2"
        />
        <path
          className="aco-censer"
          d="M77.4 79 H85.8"
          stroke="#ffb35e"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* ---- robe: a bone column, a black mantle, one stole of ember cloth ---- */}
      <g ref={hold("robe")} style={{ transformOrigin: "50px 64px" }}>
        <path
          d="M37 40 L63 40 L66 67 L34 67 Z"
          fill="url(#aco-robe)"
          stroke="#171420"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {/* The stole, one broad band hanging past the waist */}
        <path
          d="M42 38 L40 80 L46 75 L52 80 L51 38 Z"
          fill="#b8461c"
          stroke="#171420"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M47.5 38 L47.5 76" stroke="#7a2a18" strokeWidth="1.6" />
        {/* One sigil burnt through it, lit from inside */}
        <rect
          className="aco-sigil"
          x="43.4"
          y="55.4"
          width="4.2"
          height="4.2"
          transform="rotate(45 45.5 57.5)"
        />
        {/* The mantle: charred cloth over the shoulders, torn to three points,
            lit along the top by the fire above it */}
        <path
          d="M32 41 Q50 32 68 41 L69 51 L61 47 L56 54 L49 47 L42 53 L38 47 L31 51 Z"
          fill="url(#aco-mantle)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M35 40.6 Q50 34 65 40.6"
          fill="none"
          stroke="#ff9a4a"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>

      {/* ---- head: an iron bowl on a thin neck, and a fire in it ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "50px 36px" }}>
        {/* Heat haze round the fire: a gradient that fades to nothing, so it
            has no edge and costs no filter */}
        <ellipse
          className="aco-haze ph-glow"
          cx="51"
          cy="19"
          rx="24"
          ry="20"
          fill="url(#aco-haze)"
        />
        <path d="M46.5 39 L47.5 33 L52.5 33 L53.5 39 Z" fill="#171420" />
        {/* The fire: one big tongue leaning back from the party and curling
            over at the tip, two short licks off its flanks, a fleck torn loose
            above. Drawn behind the bowl so the rim cuts its base. */}
        <g className="aco-flame">
          <path
            d="M40 31 C34 29 31 24 32.5 18.5 C33.2 16.2 34.4 14.6 36 13.4 C35.6 16.4 37 18.4 39.6 19 C39.4 12.6 44 7.4 51 5 C54.4 3.8 57.6 3.4 60.5 4 C57.4 6.4 56.2 9.6 57.4 12.8 C58.6 11.6 60.8 11 63.4 11.4 C62.2 13.2 62.8 15.4 64.6 17.6 C66.8 20.4 66.6 25 64.4 28 C63.4 29.4 62 30.4 60.5 31 Z"
            fill="url(#aco-fire)"
            stroke="#8c2416"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path
            d="M43 31 C38.6 29.6 36.6 26 37.4 22.4 C38.8 24 40.6 24.6 42.6 24.2 C42.4 18.4 46 13 52.6 10.2 C51 13.6 51.6 17 53.8 19.4 C55.6 18 57.8 17.6 59.8 18 C59 20.4 60.2 22.6 61.2 24.6 C62 27.2 60.8 29.8 58.4 31 Z"
            fill="url(#aco-fire-mid)"
          />
          <path
            className="aco-core"
            d="M47 31 C44.6 29.8 44 27.6 44.8 25.8 C46 26.8 47.4 27 48.8 26.6 C48.8 23 50.6 20 53.6 18.2 C53.2 21 54.4 23.4 56.4 24.6 C57.6 26.6 57 29.6 54.6 31 Z"
          />
        </g>
        <path
          className="aco-fleck"
          d="M64.5 3.5 C62.6 5.6 62.8 8 64.8 8.8 C66.8 8 67 5.6 64.5 3.5 Z"
          fill="#ff9a3a"
          stroke="#8c2416"
          strokeWidth="0.8"
        />
        <path
          d="M35 27.5 L65 27.5 L61 36 Q50 39.5 39 36 Z"
          fill="url(#aco-iron)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* A grate slot in the bowl, lit from inside: the only thing like a
            face, and it is not one */}
        <path
          className="aco-grate"
          d="M42 31.5 L58 31.5"
          stroke="#ffc05e"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>

      {/* ---- casting arm: a bell sleeve reaching out, an ember held up ---- */}
      <g ref={hold("castArm")} style={{ transformOrigin: "40px 40px" }}>
        {/* The sleeve hangs in a point beneath the arm */}
        <path
          d="M41 38 L22 33 L15 38 L22 61 L29 51 L43 51 Z"
          fill="url(#aco-sleeve)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M22.5 60 L28.5 51"
          stroke="#ff8a3a"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Long charred fingers under the ember */}
        <g stroke="#171420" strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d="M18 35 L11.5 31" />
          <path d="M18.5 34.5 L14.5 27.5" />
          <path d="M20 34.5 L20 28" />
        </g>
        {/* The ember: thrown on a cast, and a new one kindles in the palm */}
        <g ref={hold("ember")} style={{ transformOrigin: "13px 21px" }}>
          <circle
            className="aco-halo ph-glow"
            cx="13"
            cy="21"
            r="12"
            fill="url(#aco-spark)"
          />
          <circle
            cx="13"
            cy="21"
            r="6.2"
            fill="url(#aco-orb)"
            stroke="#8c2416"
            strokeWidth="1.4"
          />
        </g>
      </g>

      {/* ---- cinders: live embers hanging around it in the heat ---- */}
      <g ref={hold("cinders")} style={{ transformOrigin: "50px 46px" }}>
        <g stroke="#171420" strokeWidth="1.4" strokeLinejoin="round">
          <path className="aco-cinder" d="M76 22 L80 19 L83 23 L79 27 Z" />
          <path
            className="aco-cinder aco-cinder-b"
            d="M82 40 L85.5 37.5 L88 41 L84.5 44 Z"
          />
          <path
            className="aco-cinder aco-cinder-c"
            d="M22 70 L25.5 67.5 L28 71 L24.5 73.5 Z"
          />
        </g>
      </g>
    </svg>
  );
}
