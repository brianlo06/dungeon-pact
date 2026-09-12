import { IllustratedHead, Neck, Tailoring } from "./Illustration";
import { BaseWeapon, GearMount } from "../../equipment/Equipment";
import { useRigParts } from "../../battle/useRigParts";
import {
  at,
  BODY,
  DETAIL,
  Hand,
  HeroFrame,
  INK,
  LINE,
  Legs,
  Limb,
  Lit,
  RAMP,
  Shade,
  useShades,
  type HeroProps,
} from "./kit";

/**
 * The Vanguard.
 *
 * A shield-bearer, and the house style is set on it first. A great helm with
 * a rust crest, a heater shield carried out in front towards the enemy, a
 * sword shouldered up and back, and a cape that flares behind. It is the
 * widest thing in the party and the only one whose front is a wall.
 *
 * Silhouette: a flat-topped bucket helm with a crest raking back, the shield
 * a tall slab breaking the right-hand outline, the sword a diagonal breaking
 * the upper left, and the cape filling the lower left.
 */
const PARTS = [
  "cape",
  "legs",
  "body",
  "head",
  "shield",
  "sword",
  "blade",
] as const;

export function Vanguard({ unitId, animators, className, viewBox }: HeroProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  const g = useShades("van");
  const [sx, sy] = BODY.shoulderBack;

  return (
    <HeroFrame
      id="vanguard"
      label="Vanguard"
      className={className}
      viewBox={viewBox}
    >
      <defs>
        <Shade id={g.id("steel")} ramp={RAMP.steel} />
        <Shade id={g.id("iron")} ramp={RAMP.iron} />
        <Shade id={g.id("rust")} ramp={RAMP.rust} />
        <Shade id={g.id("gold")} ramp={RAMP.gold} />
      </defs>

      {/* ---- cape: hangs off the shoulders and flares behind ---- */}
      <g ref={hold("cape")} data-part="cape" style={at(42, 46)}>
        <path
          d="M39 44 C28 53 20 71 11 92 L18 89 L21 95 L28 90 L32 96 L38 90 L45 66 L50 45 Z"
          fill={g.url("rust")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <path
          d="M36 51 C30 61 25 73 19 86"
          stroke="#e07a61"
          strokeWidth={DETAIL}
          fill="none"
          opacity={0.6}
        />
        <path
          d="M42 55 C39 66 36 78 33 90"
          stroke={RAMP.rust[2]}
          strokeWidth={DETAIL}
          fill="none"
          opacity={0.8}
        />
      </g>

      {/* ---- legs: greaves and heavy boots, set wide ---- */}
      <g ref={hold("legs")} data-part="legs" style={at(48, 90)}>
        <Legs trousers={g.url("iron")} boots={RAMP.leather[2]} spread={1.5} />
      </g>

      {/* ---- body: breastplate over a mail skirt, a scarf at the throat ---- */}
      <g ref={hold("body")} data-part="body" style={at(48, 74)}>
        {/* mail skirt, ragged at the hem */}
        <path
          d="M31 65 H66 L68 79 L62.5 77 L57 80 L51.5 77 L46 80 L40.5 77 L35 80 L29.5 78.5 Z"
          fill={RAMP.iron[1]}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <path
          d="M33 71.5 H65 M32.5 75 H66"
          stroke={RAMP.iron[0]}
          strokeWidth={DETAIL}
          strokeDasharray="1.6 1.4"
        />
        {/* breastplate: a barrel, wider than it is tall */}
        <path
          d="M32 47 Q48 40 64 47 L66 67 Q48 72.5 30 67 Z"
          fill={g.url("steel")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <path
          d="M49 45 V69"
          stroke={RAMP.steel[2]}
          strokeWidth={DETAIL}
          opacity={0.7}
        />
        <Lit d="M36 50 Q42 46 47 45.5" />
        {/* belt */}
        <rect
          x={30.5}
          y={63}
          width={36}
          height={4.6}
          fill={RAMP.leather[1]}
          stroke={INK}
          strokeWidth={DETAIL + 0.3}
        />
        <rect
          x={46.5}
          y={62.4}
          width={5.4}
          height={5.8}
          rx={0.8}
          fill={g.url("gold")}
          stroke={INK}
          strokeWidth={DETAIL}
        />
        {/* scarf, knotted at the throat, tail thrown back */}
        <path
          d="M36 44 Q48 49.5 61 44 L60 49.5 Q48 54 37 49.5 Z"
          fill={g.url("rust")}
          stroke={INK}
          strokeWidth={DETAIL + 0.5}
          strokeLinejoin="round"
        />
        <GearMount anchor="shoulderBack" layer="front" x={37} y={49} />
        <Neck hero="vanguard" />
        <Tailoring hero="vanguard" />
        <GearMount anchor="torso" layer="body" x={48} y={57} />
        <GearMount anchor="waist" layer="front" x={39} y={73} />
      </g>

      {/* ---- head: a flat-topped great helm, crest raking back ---- */}
      <g ref={hold("head")} data-part="head" style={at(...BODY.neck)}>
        <IllustratedHead>
          {/* a horsehair crest, ragged, thrown back */}
          <path
            d="M52 13 C47 8.5 36 9 28 15 L32 15.5 C27 17.5 24 21 23 25 L27.5 23 C26 26 26 28.5 26.5 31 C31 25 37 21 44 19 Z"
            fill={g.url("rust")}
            stroke={INK}
            strokeWidth={DETAIL + 0.7}
            strokeLinejoin="round"
          />
          <path
            d="M33 20.5 C35.5 18 39 16 43 14.6"
            stroke="#e07a61"
            strokeWidth={DETAIL}
            fill="none"
            opacity={0.7}
          />
          <path
            d="M33 21L39 13L51 9L63 16L65 33L59 44L49 48L36 41Z"
            fill={g.url("steel")}
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
          {/* the visor band faces the enemy */}
          <path
            d="M43 24L66 22L65 34L49 39L43 34Z"
            fill={RAMP.steel[2]}
            stroke={INK}
            strokeWidth={DETAIL}
          />
          <rect x={48.5} y={28.2} width={17} height={3.2} rx={0.6} fill={INK} />
          <path
            d="M49 39 H63"
            stroke={INK}
            strokeWidth={1.1}
            strokeDasharray="1.3 1.7"
          />
          <path d="M46 12 V25" stroke={RAMP.steel[2]} strokeWidth={DETAIL} />
          <Lit d="M36 21 Q37.5 15 44 13.4" width={1.8} />
          {/* a dent, because nothing this party owns is new */}
          <path
            d="M38 33.5 l2.4 1.6"
            stroke={RAMP.steel[2]}
            strokeWidth={1.2}
          />
          <GearMount anchor="head" layer="front" x={48} y={29} />
        </IllustratedHead>
      </g>

      {/* ---- shield: a heater carried forward, the whole front a wall ---- */}
      <g ref={hold("shield")} data-part="shield" style={at(60, 53)}>
        <Limb d="M60 50 Q64 55 66 59" fill={RAMP.iron[0]} width={8} />
        <path
          d="M53.5 43.5 H86.5 V60.5 C86.5 74 78 83 70 89 C62 83 53.5 74 53.5 60.5 Z"
          fill={g.url("rust")}
          stroke={INK}
          strokeWidth={LINE + 0.4}
          strokeLinejoin="round"
        />
        {/* iron rim, inset */}
        <path
          d="M56.5 46.5 H83.5 V60.5 C83.5 72 76.5 80 70 85.2 C63.5 80 56.5 72 56.5 60.5 Z"
          fill="none"
          stroke={RAMP.steel[1]}
          strokeWidth={1.8}
        />
        {/* a lantern sigil: the guild's */}
        <path
          d="M70 48.5 V85"
          stroke={RAMP.gold[1]}
          strokeWidth={2}
          opacity={0.85}
        />
        <path
          d="M70 54 L75.5 59.5 V68 L70 73.5 L64.5 68 V59.5 Z"
          fill={g.url("gold")}
          stroke={INK}
          strokeWidth={DETAIL + 0.2}
          strokeLinejoin="round"
        />
        <circle
          cx={70}
          cy={63.8}
          r={2.6}
          fill="#fff1c2"
          className="ph-van-sigil"
        />
        <Lit d="M56.5 48.5 V61 C56.5 69 60 75.5 64.5 80.5" width={2} />
        {/* scratches */}
        <path
          d="M79 50 l-3.4 4 M60.5 74 l3 -2"
          stroke={RAMP.rust[2]}
          strokeWidth={1.2}
        />
      </g>

      {/* ---- sword arm: drawn on top, so the blade stays visible when it
          comes over the helm and across the shield ---- */}
      <g ref={hold("sword")} data-part="sword" style={at(sx, sy)}>
        {/* The wrist: the blade turns in the hand, so a chop can bring the
            arm over the top and still finish with the point forward. */}
        <g ref={hold("blade")} data-part="blade" style={at(31, 64)}>
          <BaseWeapon>
            <g transform="translate(31 64) rotate(-26)">
              <path
                d="M-3.4 -6 L-3.4 -36 L0 -43 L3.4 -36 L3.4 -6 Z"
                fill={g.url("steel")}
                stroke={INK}
                strokeWidth={LINE}
                strokeLinejoin="round"
              />
              <path
                d="M0 -9 V-36"
                stroke="#fffaf0"
                strokeWidth={1.1}
                opacity={0.75}
              />
              <rect
                x={-8.5}
                y={-8}
                width={17}
                height={4}
                rx={1.2}
                fill={g.url("gold")}
                stroke={INK}
                strokeWidth={DETAIL + 0.4}
              />
              <rect
                x={-1.9}
                y={-4.2}
                width={3.8}
                height={10}
                fill={RAMP.leather[1]}
                stroke={INK}
                strokeWidth={DETAIL}
              />
              <circle
                cx={0}
                cy={7.4}
                r={2.7}
                fill={g.url("gold")}
                stroke={INK}
                strokeWidth={DETAIL}
              />
            </g>
          </BaseWeapon>
          <GearMount
            anchor="mainHand"
            layer="weapon"
            x={31}
            y={64}
            rotation={-26}
          />
        </g>
        <Limb
          d={`M${sx} ${sy} Q${sx - 5} 58 31.5 63`}
          fill={RAMP.iron[0]}
          width={8}
        />
        <Hand x={31} y={64} fill={RAMP.leather[1]} r={4.6} />
      </g>
      {/* the pauldron caps the shoulder joint and stays put while the arm
          turns under it */}
      <g>
        <path
          d="M29 53 C29 46 34 43.5 40 44 C44.5 44.5 46 48 45 52 C41 51 34 52 29 53 Z"
          fill={g.url("steel")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <Lit d="M31.5 50 Q33.5 46 38.5 45.6" width={1.3} />
      </g>
    </HeroFrame>
  );
}
