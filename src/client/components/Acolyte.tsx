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
 * It stands in the back row at about a hundred pixels, so it is drawn in a few
 * large shapes rather than many small ones: a bone-white robe and bell
 * sleeve, a charred mantle, one rust stole, and on top a single big fire. The
 * fire is drawn as fire, not as a head-dress — one tall tongue leaning back
 * from the party and curling over at the tip, two short licks off its flanks,
 * a fleck torn loose above, a white core inside an orange body inside a red
 * rim. Nothing about it is symmetrical or evenly spaced, and the iron bars
 * that used to stand up through it are gone: together those made the first
 * drawing read as a crown.
 *
 * Silhouette: the fire in its bowl on a thin neck, with daylight either side
 * of the neck; a torn mantle wider than the robe, so its points stand out
 * past a pinched waist; the robe below trailing away behind it as it drifts,
 * which gives the figure a diagonal; the casting arm raised out at the party
 * with the ember over the hand and the bell sleeve hanging from it in a long
 * point, one clean wedge of daylight between that point and the robe; and
 * the back arm swinging the censer wide on its chain, well clear of the
 * mantle and the hem. The first drawing was a narrow column, and filled
 * black its robe and mantle were one blob that only the fire, the ember and
 * the censer rescued; this one spans the whole box, ember to censer. The
 * Cinder Stoker it fights beside is wide, low and lumpy; this is tall and
 * spread, on purpose. And it has no hood: the Collector is the hooded one.
 *
 * It uses the `person` footprint rather than `small`: a caster in the back
 * row needs the extra tenth to keep its fire and ember readable. The drawing,
 * not a bigger footprint, is what makes it read now.
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
          <stop offset="0" stopColor="#eee5d6" />
          <stop offset="0.45" stopColor="#cbbfb3" />
          <stop offset="0.8" stopColor="#7c7080" />
          <stop offset="1" stopColor="#3a3240" />
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

      {/* ---- hem: the robe below the waist, trailing away behind it as it
          drifts, burning up from the edge ---- */}
      <g ref={hold("hem")} style={{ transformOrigin: "50px 62px" }}>
        <path
          d="M40 60 L60 60 C63 68 70 79 88 90 L79 88.6 L75 94 L69 88 L63 95 L58 88 L52 93.6 L47.6 86.6 L42.6 91.4 L40 84.6 L36.4 87 C37 77 38 68 40 60 Z"
          fill="url(#aco-hem)"
          stroke="#171420"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {/* The edge is alight, the way paper burns */}
        <path
          className="aco-burn"
          d="M37.6 84 L40.6 81.6 L43 88 L47.6 83.4 L52 90.4 L58 85 L63 91.6 L69 85 L75 90.6 L79 85.8 L85 88"
          fill="none"
          stroke="#ff8a3a"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <g fill="#b0a4ac">
          <rect className="aco-ash" x="46" y="95" width="2.4" height="2.4" />
          <rect
            className="aco-ash aco-ash-b"
            x="66"
            y="95.4"
            width="2.2"
            height="2.2"
          />
          <rect
            className="aco-ash aco-ash-c"
            x="84"
            y="93"
            width="2"
            height="2"
          />
        </g>
      </g>

      {/* ---- the back arm: a sleeve reaching out behind, and a censer swung
          wide on a chain, well clear of the mantle and the hem ---- */}
      <g ref={hold("offArm")} style={{ transformOrigin: "64px 46px" }}>
        <path
          d="M63 48 L74 47.6 L87.4 53 L83.4 59.6 L74.6 56.6 L66 57 Z"
          fill="url(#aco-mantle)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M85.4 58.6 L89.6 63.4"
          stroke="#171420"
          strokeWidth="1.8"
          strokeDasharray="2 1.2"
        />
        {/* The censer: a pierced iron ball under a pointed lid */}
        <path
          d="M85.4 68 Q91 60.4 96.6 68 Z"
          fill="url(#aco-iron)"
          stroke="#171420"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle
          cx="91"
          cy="71"
          r="5.4"
          fill="url(#aco-iron)"
          stroke="#171420"
          strokeWidth="2.2"
        />
        <path
          className="aco-censer"
          d="M87 71.6 H95"
          stroke="#ffb35e"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* ---- robe: a bone column pinched at the waist, a torn black mantle
          wider than it, one stole of ember cloth ---- */}
      <g ref={hold("robe")} style={{ transformOrigin: "50px 62px" }}>
        <path
          d="M40 47 L60 47 L60.6 62 L39.4 62 Z"
          fill="url(#aco-robe)"
          stroke="#171420"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {/* The stole, one broad band hanging past the waist */}
        <path
          d="M43 46 L41.4 79 L46.4 74.6 L51.6 79 L50.6 46 Z"
          fill="#b8461c"
          stroke="#171420"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M47 46 L46.8 75.6" stroke="#7a2a18" strokeWidth="1.6" />
        {/* One sigil burnt through it, lit from inside */}
        <rect
          className="aco-sigil"
          x="44"
          y="69"
          width="4.2"
          height="4.2"
          transform="rotate(45 46.1 71.1)"
        />
        {/* The mantle: charred cloth over the shoulders, wider than the
            robe and torn to points, so it reads as its own shape; lit along
            the top by the fire above it */}
        <path
          d="M44 43.4 Q50 41.8 56 43.4 C62 45 68 48 72 52.6 L77 63.4 L67.6 58.6 L62.8 64.6 L56.4 59 L50 63.6 L43.6 59 L37.2 64.6 L33 57.4 L30.6 51.4 C34 47.6 38.6 45 44 43.4 Z"
          fill="url(#aco-mantle)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M31 51 C36 46.6 42 44.4 50 44 C58 44.4 64 46.6 69 51"
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
        {/* A thin neck, long enough that there is daylight either side of it
            between the bowl and the mantle */}
        <path d="M46.6 44 L47.6 33 L52.4 33 L53.4 44 Z" fill="#171420" />
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

      {/* ---- casting arm: raised out at the party, a bell sleeve hanging from
          it in a long point with daylight between it and the robe, and an
          ember held up over the hand ---- */}
      <g ref={hold("castArm")} style={{ transformOrigin: "38px 47px" }}>
        <path
          d="M41 45 L18 28.6 L13.6 32.8 L19.4 37.6 L10.4 62 L25.4 55.8 L37.6 53.2 Z"
          fill="url(#aco-sleeve)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* The sleeve's point is smouldering */}
        <path
          d="M12.6 60 L24.8 55"
          stroke="#ff8a3a"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* A charred hand out of the cuff, long fingers under the ember */}
        <g stroke="#171420" strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d="M15.4 31.4 L9.6 28.6" />
          <path d="M15.8 30.4 L12 24.6" />
          <path d="M17.4 29.8 L17 23.8" />
        </g>
        {/* The ember: thrown on a cast, and a new one kindles in the palm */}
        <g ref={hold("ember")} style={{ transformOrigin: "10.6px 18px" }}>
          <circle
            className="aco-halo ph-glow"
            cx="10.6"
            cy="18"
            r="12"
            fill="url(#aco-spark)"
          />
          <circle
            cx="10.6"
            cy="18"
            r="6.4"
            fill="url(#aco-orb)"
            stroke="#8c2416"
            strokeWidth="1.4"
          />
        </g>
      </g>

      {/* ---- cinders: live embers hanging around it in the heat ---- */}
      <g ref={hold("cinders")} style={{ transformOrigin: "50px 46px" }}>
        <g stroke="#171420" strokeWidth="1.4" strokeLinejoin="round">
          <path className="aco-cinder" d="M74 20 L78 17 L81 21 L77 25 Z" />
          <path
            className="aco-cinder aco-cinder-b"
            d="M82 36 L85.5 33.5 L88 37 L84.5 40 Z"
          />
          <path
            className="aco-cinder aco-cinder-c"
            d="M16 80 L19.5 77.5 L22 81 L18.5 83.5 Z"
          />
        </g>
      </g>
    </svg>
  );
}
