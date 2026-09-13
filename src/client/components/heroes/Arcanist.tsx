import { IllustratedHead, Neck, Tailoring } from "./Illustration";
import { BaseWeapon, GearMount } from "../../equipment/Equipment";
import { useRigParts } from "../../battle/useRigParts";
import {
  at,
  BODY,
  DETAIL,
  Eyes,
  HEAD_PATH,
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
 * The Arcanist.
 *
 * Power is a debt worth taking, and it is carried in the hands. No staff: a
 * gloved hand held out towards the enemy with a spark already crackling in it,
 * a tome clutched at the hip, and a face lost under the brim of an enormous
 * patched hat so that only the eyes catch the light.
 *
 * Silhouette: the widest brim and the tallest crown in the party, its tip
 * bent back and drooping; a bell of robe; a long sleeve hanging from the
 * outstretched arm. Nobody else in the line has a hat.
 */
const PARTS = ["book", "legs", "body", "head", "hat", "hand", "spark"] as const;

/** A four-point star, for embroidery. */
const star = (x: number, y: number, r: number) =>
  `M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z`;

export function Arcanist({ unitId, animators, className, viewBox }: HeroProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  const g = useShades("arc");
  const [bx, by] = BODY.shoulderBack;
  const [fx, fy] = BODY.shoulderFront;
  const glove = "#d8c8ae";

  return (
    <HeroFrame
      id="arcanist"
      label="Arcanist"
      className={className}
      viewBox={viewBox}
    >
      <defs>
        <Shade id={g.id("robe")} ramp={RAMP.blue} />
        <Shade id={g.id("gold")} ramp={RAMP.gold} />
        <Shade id={g.id("tome")} ramp={RAMP.leather} />
        <radialGradient id={g.id("spark")}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#bfe8ff" />
          <stop offset="1" stopColor="#5fb2ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---- the tome arm, behind: clutched at the hip ---- */}
      <g ref={hold("book")} data-part="book" style={at(bx, by)}>
        <Limb
          d={`M${bx} ${by} Q${bx - 5} 56 30 61`}
          fill={RAMP.blue[1]}
          width={8}
        />
        <g transform="translate(24 63) rotate(-12)">
          <rect
            x={-8}
            y={-8.5}
            width={16}
            height={18}
            rx={1.5}
            fill={g.url("tome")}
            stroke={INK}
            strokeWidth={LINE}
          />
          <rect x={5} y={-7.5} width={2.2} height={16} fill="#efe2c2" />
          <path
            d={star(-1, 0.5, 4)}
            fill={g.url("gold")}
            stroke={INK}
            strokeWidth={0.8}
          />
          <path
            d="M-8 -5 h3 M-8 5 h3"
            stroke={RAMP.gold[1]}
            strokeWidth={1.6}
          />
        </g>
        <circle
          cx={29.5}
          cy={61.5}
          r={4}
          fill={glove}
          stroke={INK}
          strokeWidth={LINE}
        />
      </g>

      {/* ---- feet, just showing under the hem ---- */}
      <g ref={hold("legs")} data-part="legs" style={at(48, 90)}>
        <Legs trousers={RAMP.blue[2]} boots={RAMP.leather[1]} spread={0.5} />
      </g>

      {/* ---- robe: a bell, patched, stars sewn on by hand ---- */}
      <g ref={hold("body")} data-part="body" style={at(48, 74)}>
        <path
          d="M36 45 Q48 41 60 45 L66 60 L74 90 L68.5 87.5 L63.5 91.5 L58 87.5 L52.5 91.5 L47 87.5 L41.5 91.5 L36 87.5 L30 91 L23 89 L30 60 Z"
          fill={g.url("robe")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <Lit d="M35 52 C33 60 30 72 27 84" />
        <path
          d="M49 62 C50 72 51 80 52 90"
          stroke={RAMP.blue[2]}
          strokeWidth={DETAIL}
          fill="none"
        />
        {/* a patch, with its stitches */}
        <rect
          x={56}
          y={71}
          width={8}
          height={8}
          fill="#5d78b3"
          stroke={INK}
          strokeWidth={DETAIL}
          transform="rotate(8 60 75)"
        />
        <path
          d="M57 72.5 l1.5 1.5 M61.5 73 l1.5 1.5 M56.5 77 l1.5 1.5"
          stroke="#c8d6f2"
          strokeWidth={0.8}
        />
        {[
          [40, 72, 2.2],
          [44, 82, 1.8],
          [34, 80, 1.6],
          [60, 84, 1.8],
        ].map(([x, y, r]) => (
          <path
            key={`${x}-${y}`}
            d={star(x, y, r)}
            fill={RAMP.gold[0]}
            opacity={0.85}
          />
        ))}
        {/* rope belt with a knot and a hanging end */}
        <path
          d="M33 59.5 Q48 64 63 59.5"
          stroke={RAMP.gold[2]}
          strokeWidth={4.4}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M33 59.5 Q48 64 63 59.5"
          stroke={RAMP.gold[1]}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M44 62 L42 71 M46 62.5 L46.5 70"
          stroke={RAMP.gold[1]}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        {/* high collar */}
        <path
          d="M37 46.5 Q48 51 59 46.5 L57 42 Q48 45 39 42 Z"
          fill={RAMP.blue[2]}
          stroke={INK}
          strokeWidth={DETAIL + 0.4}
          strokeLinejoin="round"
        />
        <Neck hero="arcanist" />
        <Tailoring hero="arcanist" />
        <GearMount anchor="torso" layer="body" x={48} y={57} />
        <GearMount anchor="waist" layer="front" x={42} y={74} />
        <GearMount anchor="shoulderBack" layer="front" x={37} y={49} />
      </g>

      {/* ---- head: a face lost in shadow under the brim; only the eyes ---- */}
      <g ref={hold("head")} data-part="head" style={at(...BODY.neck)}>
        <IllustratedHead>
          <path d={HEAD_PATH} fill="#1c1827" stroke={INK} strokeWidth={LINE} />
          <Eyes x={53} y={35.5} glow="#ffd27a" />
          {/* the brim: the widest thing on him */}
          <path
            d="M18 32.5 C20 26.5 32 23 48 23 C64 23 76 26 78 31.5 C74.5 33.5 68.5 33 64 32 Q56 30.5 48 31.5 Q38 33 30 33 C24 33.5 19.5 34.5 18 32.5 Z"
            fill={g.url("robe")}
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
          <Lit d="M24 28.5 Q35 24.5 47 24.3" />

          {/* ---- the crown of the hat, with a tip that flops on its own ---- */}
          <g ref={hold("hat")} data-part="hat" style={at(48, 26)}>
            {/* the crown folds over backwards into a long drooping tip */}
            <path
              d="M46 12 C40 9.5 31 10 24.5 14.5 C21.5 16.5 19 20 17.5 24.5 L22.5 22.5 C27 18 35 16.5 46 18 Z"
              fill={RAMP.blue[1]}
              stroke={INK}
              strokeWidth={LINE}
              strokeLinejoin="round"
            />
            <path
              d="M40 13 C34 13 28 15 23 19.5"
              stroke={RAMP.blue[0]}
              strokeWidth={DETAIL}
              fill="none"
              opacity={0.7}
            />
            <circle
              cx={18}
              cy={25}
              r={2.8}
              fill={g.url("gold")}
              stroke={INK}
              strokeWidth={DETAIL}
            />
            <path
              d="M34 27 C38 21.5 41.5 16 44.5 12 C46.5 9.8 50.5 9.6 53.5 11.5 C56.5 14 58.5 18 60.5 22 L63 27 Q48 23 34 27 Z"
              fill={g.url("robe")}
              stroke={INK}
              strokeWidth={LINE}
              strokeLinejoin="round"
            />
            {/* hat band */}
            <path
              d="M35 24.5 Q48 21 62 24.5 L62.8 27.5 Q48 24 34.2 27.5 Z"
              fill={g.url("gold")}
              stroke={INK}
              strokeWidth={DETAIL}
              strokeLinejoin="round"
            />
            <path d={star(52, 17.5, 2.2)} fill={RAMP.gold[0]} />
            <path d={star(42, 19.5, 1.5)} fill={RAMP.gold[0]} opacity={0.8} />
            <Lit d="M38.5 21.5 C41 17 43 14 45 12" width={1.3} />
          </g>
          <GearMount anchor="head" layer="front" x={48} y={29} />
        </IllustratedHead>
      </g>

      {/* ---- the casting hand, out front, with the long sleeve hanging ---- */}
      <g ref={hold("hand")} data-part="hand" style={at(fx, fy)}>
        <Limb d={`M${fx} ${fy} Q66 57 72 54`} fill={RAMP.blue[1]} width={8.5} />
        {/* the sleeve hangs off the forearm */}
        <path
          d="M63 52 C67 55 71 55 74 55 L76 61 C73 66 69 70 64 71 C65 66 64 60 61 56 Z"
          fill={g.url("robe")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <path
          d="M66 58 C67 62 67 65 66 68"
          stroke={RAMP.blue[2]}
          strokeWidth={DETAIL}
          fill="none"
        />
        {/* an open glove, fingers spread towards the enemy */}
        <path
          d="M72.5 50.5 C75 49 78 49.5 79.5 51.5 L82.5 50 L82.8 52 L80.5 53.5 L83 55 L81.5 56.3 L79 55.5 C77 58 73.5 58 72 56 Z"
          fill={glove}
          stroke={INK}
          strokeWidth={DETAIL + 0.5}
          strokeLinejoin="round"
        />
        <BaseWeapon>
          {" "}
          {/*
           * The spark it is holding, its own part: it swells into an orb as
           * power gathers, and is gone from the hand the moment it is thrown.
           */}
          <g ref={hold("spark")} data-part="spark" style={at(86, 50)}>
            <circle
              className="ph-arc-spark ph-glow"
              cx={86}
              cy={50}
              r={7.5}
              fill={g.url("spark")}
            />
            <path
              className="ph-arc-spark"
              d="M86 44.5 L84.8 48.5 L87.5 49 L85.5 55"
              stroke="#ffffff"
              strokeWidth={1.2}
              fill="none"
              strokeLinejoin="round"
            />
          </g>
        </BaseWeapon>
        <GearMount
          anchor="mainHand"
          layer="weapon"
          x={77}
          y={53}
          rotation={12}
        />
      </g>
    </HeroFrame>
  );
}
