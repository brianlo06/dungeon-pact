import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-forge.css";

/**
 * The Slag Hound.
 *
 * Something bred out of what runs off the furnace floor: a lean hound whose
 * hide is cooling slag, black crust split by cracks that are still molten,
 * with a mouth that glows because the heat inside it has nowhere else to go.
 *
 * Silhouette: the only four-legged thing in the game, and it has to read as
 * fast while it is standing still. So it never stands square — it is always
 * pitched forward onto its forelegs with the haunches cocked, the head low and
 * level with the party, a crest of slag spikes raked back off its shoulders
 * and a whip of a tail streaming out behind. Every line in the outline points
 * the way it is about to go.
 */
const PARTS = [
  "tail",
  "hindLegs",
  "foreLegs",
  "body",
  "mane",
  "head",
  "jaw",
] as const;

/** A limb drawn as an outlined stroke, so it stays thin and jointed. */
const limb = (d: string, fill: string, width = 4.4) => (
  <>
    <path
      d={d}
      stroke="#171420"
      strokeWidth={width + 2.6}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d={d}
      stroke={fill}
      strokeWidth={width}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
);

export function Hound({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  return (
    <svg
      className={`hound forge-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Slag Hound"
    >
      <defs>
        <linearGradient id="hnd-crust" x1="0.2" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#5a4e62" />
          <stop offset="0.45" stopColor="#3a3242" />
          <stop offset="1" stopColor="#221d28" />
        </linearGradient>
        <linearGradient id="hnd-melt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffd27a" />
          <stop offset="0.5" stopColor="#ff6a3a" />
          <stop offset="1" stopColor="#b8282a" />
        </linearGradient>
      </defs>

      {/* ---- tail: a whip of slag, streaming out behind ---- */}
      <g ref={hold("tail")} style={{ transformOrigin: "82px 50px" }}>
        {limb("M80 50 Q90 46 94 36 Q96 30 97 25", "#3a3242", 3.4)}
        <path
          className="hnd-hot"
          d="M95.5 31 Q97 27 97 24"
          stroke="#ff6a3a"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* ---- hind legs: cocked under it, ready to throw it forward ---- */}
      <g ref={hold("hindLegs")} style={{ transformOrigin: "74px 58px" }}>
        {limb("M78 58 L70 76 L82 84 L80 94", "#221d28", 4)}
        <path d="M76 95 L84 95 L83 91 L78 91 Z" fill="#171420" />
        {/* The near thigh: a big plate of crust over the haunch */}
        <path
          d="M64 50 C72 44 84 46 84 56 C84 64 78 70 72 76 L66 74 C66 66 62 58 64 50 Z"
          fill="url(#hnd-crust)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {limb("M71 74 L80 83 L78 94", "#3a3242", 4.2)}
        <path d="M72 96 L82 96 L81 91.5 L75 91.5 Z" fill="#171420" />
        <path
          className="hnd-crack"
          d="M76 50 L72 56 L76 60 L71 67"
          stroke="url(#hnd-melt)"
          strokeWidth="1.4"
          fill="none"
        />
      </g>

      {/* ---- forelegs: long, braced forward, taking all the weight ---- */}
      <g ref={hold("foreLegs")} style={{ transformOrigin: "32px 62px" }}>
        {limb("M40 62 L42 80 L37 94", "#221d28", 4)}
        <path d="M32 96 L41 96 L40 91.5 L34 91.5 Z" fill="#171420" />
        {/* The near leg: a heavy shoulder tapering to a thin fast shin */}
        <path
          d="M22 58 L37 61 L32 79 L26 79 Z"
          fill="url(#hnd-crust)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {limb("M29 78 L17 93", "#3a3242", 4.4)}
        {/* Splayed claws on the leading paw */}
        <path
          d="M9 96 L20 96 L21 91 L14 90 Z"
          fill="#2b2430"
          stroke="#171420"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 96 L7 97.5 M13 96 L11 97.8"
          stroke="#171420"
          strokeWidth="1.4"
        />
        <path
          className="hnd-crack"
          d="M29 63 L27 69 L30 74"
          stroke="url(#hnd-melt)"
          strokeWidth="1.4"
          fill="none"
        />
      </g>

      {/* ---- body: deep chest, tucked waist, pitched forward ---- */}
      <g ref={hold("body")} style={{ transformOrigin: "56px 62px" }}>
        <path
          d="M21 52 C25 42 35 38 46 41 C56 44 64 46 72 44 C78 42 83 45 81 52 C79 60 71 62 63 62 C57 62 51 64 45 70 C41 74 32 76 26 73 C19 68 17 59 21 52 Z"
          fill="url(#hnd-crust)"
          stroke="#171420"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Crust plates: lighter edges catching the furnace light */}
        <g stroke="#6d6178" strokeWidth="1.3" fill="none" opacity="0.8">
          <path d="M28 47 Q35 43 42 45" />
          <path d="M50 49 Q57 50 64 48" />
        </g>
        {/* Cracks that are still molten, branching over the ribs */}
        <g
          className="hnd-crack"
          stroke="url(#hnd-melt)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M38 44 L36.5 48 L38.5 52 L35.5 58 L36.5 63 L34 67 M38.5 52 L44 55.5 L46 60" />
          <path d="M56 48.5 L54 52 L55.5 55 L53 60" />
          <path d="M66 47.5 L64.5 51 L67 54" />
        </g>
      </g>

      {/* ---- mane: slag spikes raked back off the shoulders ---- */}
      <g ref={hold("mane")} style={{ transformOrigin: "40px 46px" }}>
        <path
          d="M25 46 L31 29 L37 40 L44 26 L48 40 L57 31 L58 43 L66 38 L66 47 Z"
          fill="#2b2430"
          stroke="#171420"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <g className="hnd-hot" fill="#ff6a3a">
          <path d="M31 29 L32.6 33 L30 32.6 Z" />
          <path d="M44 26 L45.6 30.4 L43 30.2 Z" />
          <path d="M57 31 L57.6 35 L55.2 34.4 Z" />
        </g>
      </g>

      {/* ---- head: long, low, level with its target ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "30px 50px" }}>
        {/* The mouth is lit from inside */}
        <path className="hnd-maw" d="M30 52 L6 51 L8 58 L29 58 Z" />
        <path
          d="M34 43 C31 37 21 37 12 41 L2 46 L3 51.5 L29 53 C35 51 36 47 34 43 Z"
          fill="url(#hnd-crust)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* A brow ridge over the eye, so it glares rather than looks */}
        <path
          d="M13 42 L26 38 L24 42.5 Z"
          fill="#221d28"
          stroke="#171420"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Ears, swept flat back */}
        <path
          d="M27 41 L43 33 L33 45 Z"
          fill="#2b2430"
          stroke="#171420"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Upper fangs */}
        <g fill="#eed8ad">
          <path d="M4.5 51.5 L7 51.6 L5.8 55.4 Z" />
          <path d="M11 52 L13.4 52 L12.2 55.4 Z" />
          <path d="M18 52.4 L20.4 52.4 L19.2 55.4 Z" />
        </g>
        <path
          className="hnd-eye"
          d="M16 45.5 L23 43.5"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          className="hnd-crack"
          d="M28 42 L26 47 L30 50"
          stroke="url(#hnd-melt)"
          strokeWidth="1.3"
          fill="none"
        />
        {/* ---- jaw: hinged at the back of the skull ---- */}
        <g ref={hold("jaw")} style={{ transformOrigin: "29px 54px" }}>
          <path
            d="M30 53 L7 55 L4.5 58.5 L16 62 L29 59.5 Z"
            fill="#2b2430"
            stroke="#171420"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <g fill="#eed8ad">
            <path d="M8 55.6 L10.4 55.4 L9.2 52.4 Z" />
            <path d="M15 55 L17.4 54.8 L16.2 51.8 Z" />
          </g>
          <path
            className="hnd-drip"
            d="M13 62 Q13.6 65 13 67.5"
            stroke="#ff6a3a"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </g>
    </svg>
  );
}
