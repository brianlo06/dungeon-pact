import { IllustratedHead, Neck, Tailoring } from "./Illustration";
import { BaseWeapon, GearMount, GearArrow } from "../../equipment/Equipment";
import { useContext } from "react";
import { CloseUpContext, useRigParts } from "../../battle/useRigParts";
import {
  at,
  BODY,
  DETAIL,
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
 * The Ranger.
 *
 * One mark, a hundred possibilities: a young scout in a patched green hood,
 * a longbow taller than they are held out in front, a quiver slung behind the
 * shoulder, and an arrow already in the other hand. They stand lower than the
 * rest of the party, weight on the front foot.
 *
 * Silhouette: the bow is a tall arc down the whole right-hand side with its
 * string clear of the body; the hood ends in a point that trails back; the
 * fletching bristles over the left shoulder. The goblin sniper holds a
 * crossbow flat — the Ranger's weapon stands upright.
 */
const PARTS = [
  "cloak",
  "quiver",
  "legs",
  "body",
  "head",
  "bow",
  "draw",
  "arrow",
] as const;
/** The face, moved only in an Ultimate close-up (see `CloseUpContext`). */
const FACE_PARTS = ["brow", "eyes", "mouth"] as const;

/**
 * The youngest face in the party: a round cranium, full cheeks and a small
 * pointed chin, with the features set low and the eyes large, so it reads as
 * a kid before it reads as anything else.
 */
const FACE = "M45 14L56 16L63 23L64 33L58 43L50 46L39 40L34 29L37 19Z";

export function Ranger({ unitId, animators, className, viewBox }: HeroProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  // The face only acts in a close-up; in a round it is never registered, so
  // it costs the stage nothing.
  const face = useRigParts(
    unitId,
    useContext(CloseUpContext) ? animators : undefined,
    FACE_PARTS,
  );
  const g = useShades("rng");
  const [bx, by] = BODY.shoulderBack;
  const [fx, fy] = BODY.shoulderFront;

  return (
    <HeroFrame
      id="ranger"
      label="Ranger"
      className={className}
      viewBox={viewBox}
    >
      <defs>
        <Shade id={g.id("cloak")} ramp={RAMP.sage} />
        <Shade id={g.id("leather")} ramp={RAMP.leather} />
        <Shade id={g.id("wood")} ramp={RAMP.wood} />
        <Shade id={g.id("skin")} ramp={RAMP.skinFair} />
      </defs>

      {/* ---- cloak: hangs behind and trails back ---- */}
      <g ref={hold("cloak")} data-part="cloak" style={at(42, 46)}>
        <path
          d="M40 44 C31 52 24 66 17 86 L22 84 L25 89 L30 84 L34 90 L39 84 L44 70 L50 46 Z"
          fill={g.url("cloak")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <path
          d="M37 51 C32 60 27 70 22 82"
          stroke={RAMP.sage[0]}
          strokeWidth={DETAIL}
          fill="none"
          opacity={0.7}
        />
      </g>

      {/* ---- quiver on the back, fletching over the shoulder ---- */}
      <g ref={hold("quiver")} data-part="quiver" style={at(34, 56)}>
        <g transform="rotate(-22 32 52)">
          {[
            [28.5, "#e9dfcf"],
            [32, "#c4533f"],
            [35.5, "#e9dfcf"],
          ].map(([x, c]) => (
            <g key={x}>
              <path d={`M${x} 40 V30`} stroke={INK} strokeWidth={1.6} />
              <path
                d={`M${(x as number) - 2.2} 31 L${x} 25.5 L${(x as number) + 2.2} 31 L${(x as number) + 1.4} 35 H${(x as number) - 1.4} Z`}
                fill={c as string}
                stroke={INK}
                strokeWidth={DETAIL}
                strokeLinejoin="round"
              />
            </g>
          ))}
          <rect
            x={26}
            y={38}
            width={12}
            height={28}
            rx={2.5}
            fill={g.url("leather")}
            stroke={INK}
            strokeWidth={LINE}
          />
          <path
            d="M26 44 H38 M26 60 H38"
            stroke={RAMP.leather[2]}
            strokeWidth={1.6}
          />
        </g>
      </g>

      <g ref={hold("legs")} data-part="legs" style={at(48, 90)}>
        <Legs
          trousers={RAMP.leather[1]}
          boots={RAMP.leather[2]}
          spread={1}
          lead={2.5}
          cuff={RAMP.sage[2]}
        />
      </g>

      {/* ---- body: leather jerkin over a green tunic, a strap across ---- */}
      <g ref={hold("body")} data-part="body" style={at(48, 74)}>
        <path
          d="M35 46 Q48 42 61 46 L63 66 L65 76 L58 74 L53 77 L47 74 L41 77 L34 75 L33 66 Z"
          fill={RAMP.sage[1]}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <path
          d="M36 47 Q48 43.5 60 47 L61.5 64 Q48 68 34.5 64 Z"
          fill={g.url("leather")}
          stroke={INK}
          strokeWidth={DETAIL + 0.5}
          strokeLinejoin="round"
        />
        <Lit d="M38.5 50 Q43 47 48 46.5" />
        {/* laces */}
        <path
          d="M50 49 l3 2 l-3 2 l3 2 l-3 2"
          stroke={RAMP.leather[2]}
          strokeWidth={1}
          fill="none"
        />
        {/* the quiver strap */}
        <path
          d="M37 47 L60 64"
          stroke={RAMP.leather[2]}
          strokeWidth={3.4}
          strokeLinecap="round"
        />
        <path
          d="M37 47 L60 64"
          stroke={RAMP.leather[0]}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        {/* belt and pouch */}
        <rect
          x={33.5}
          y={63}
          width={29}
          height={4}
          fill={RAMP.leather[2]}
          stroke={INK}
          strokeWidth={DETAIL}
        />
        <rect
          x={37}
          y={65}
          width={7}
          height={7}
          rx={1.5}
          fill={RAMP.leather[1]}
          stroke={INK}
          strokeWidth={DETAIL}
        />
        <Neck hero="ranger" />
        <Tailoring hero="ranger" />
        <GearMount anchor="torso" layer="body" x={48} y={57} />
        <GearMount anchor="waist" layer="front" x={42} y={74} />
        <GearMount anchor="shoulderBack" layer="front" x={37} y={49} />
      </g>

      {/* ---- head: a freckled kid's face, auburn fringe, a hood with a trailing point ---- */}
      <g ref={hold("head")} data-part="head" style={at(...BODY.neck)}>
        <IllustratedHead>
          {/* hood tail, behind */}
          <path
            d="M42 14.5 C35 13 27 13.5 19.5 17.5 C24.5 19 29.5 21.5 33.5 26 Z"
            fill={RAMP.sage[1]}
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
          {/* a young face: full in the cheek, small in the chin */}
          <path
            d={FACE}
            fill={g.url("skin")}
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
          {/* a sunburnt blush, and a band of freckles over the nose */}
          <g fill="#ee8b76" opacity={0.4}>
            <ellipse cx={52} cy={36.4} rx={2.8} ry={1.6} />
            <ellipse cx={60.5} cy={36.2} rx={2} ry={1.4} />
          </g>
          <g fill="#b9573a">
            {[
              [49.6, 35.2],
              [51.4, 36.6],
              [53.2, 35.1],
              [55.2, 36.2],
              [57.2, 35],
              [59.2, 36.4],
              [61, 35.1],
            ].map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r={0.75} />
            ))}
          </g>
          {/* a swept auburn fringe, spilling out of the hood */}
          <path
            d="M39.5 21 C45 17.5 55 17.2 62 21.5 C59.5 21.8 57.5 23 56 24.6 L55.2 22.6 C52.5 24.4 49.5 25.3 46 25.4 L47.2 23.2 C44.5 24.3 42 26.4 40.4 29 Z"
            fill="#b5552e"
            stroke={INK}
            strokeWidth={DETAIL}
            strokeLinejoin="round"
          />
          <g ref={face("brow")} data-part="brow" style={at(56.5, 26)}>
            {/* brows up: something moved out there */}
            <path
              d="M50.4 26.9 Q53 25.1 55.6 26.5 M57.9 26.2 Q60.3 24.8 62.5 26.3"
              stroke="#7a2e18"
              strokeWidth={1.4}
              fill="none"
              strokeLinecap="round"
            />
          </g>
          <g ref={face("eyes")} data-part="eyes" style={at(56.5, 30.5)}>
            {/*
          Big dark eyes, wide open, with a lot of light in them. Not whites:
          at portrait size a white ring round each eye reads as spectacles,
          and spectacles are the Broker's.
        */}
            <path
              d="M50 30L55 29L55 32L51 32ZM58 29L63 28L62 31L59 31Z"
              fill={INK}
            />
            <g fill="#fff6e2">
              <path d="M52 30H54M60 29H62" stroke="#d9dec4" strokeWidth=".7" />
            </g>
          </g>
          {/* a button nose, turned up, just past the cheek */}
          <path
            d="M62.4 33.2 C64.6 32.6 66 34.6 64.6 35.9 C63.8 36.6 62.6 36.4 62 35.8"
            fill={RAMP.skinFair[0]}
            stroke={INK}
            strokeWidth={DETAIL}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g ref={face("mouth")} data-part="mouth" style={at(58.3, 40)}>
            {/* lips parted, about to say so */}
            <path
              d="M55.4 39.3 Q58.4 42.4 61.2 38.8 Q58.2 39.9 55.4 39.3 Z"
              fill="#7a2b2a"
              stroke={INK}
              strokeWidth={1}
              strokeLinejoin="round"
            />
          </g>
          {/* the hood itself, framing the face */}
          <path
            d="M47 11.5 C57 11.5 65 18 65.5 27 C63 22 58 19.5 51 19.5 C43 19.5 39 24 38 33 C38 38 40 42 43 45 L35 45 C32 40 31 34 32 27 C33 17 38.5 11.5 47 11.5 Z"
            fill={g.url("cloak")}
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
          <Lit d="M36 22 Q39 15 46 13.2" width={1.8} />
          <path
            d="M58 16 l2 -2 M61 19 l2.2 -1.5"
            stroke={RAMP.sage[2]}
            strokeWidth={1.1}
          />
          <GearMount anchor="head" layer="front" x={48} y={29} />
        </IllustratedHead>
      </g>

      {/* ---- the bow, held out front: taller than its owner ---- */}
      <g ref={hold("bow")} data-part="bow" style={at(fx, fy)}>
        <Limb d={`M${fx} ${fy} Q68 57 75 58`} fill={RAMP.sage[1]} width={8} />
        <BaseWeapon>
          {" "}
          {/* the string, clear of the body */}
          <path d="M67.5 23.5 L67.5 92" stroke="#e9dfcf" strokeWidth={1.1} />
          <path
            d="M67.5 23.5 C76 32 80 44 77 58 C80 72 76 84 67.5 92"
            fill="none"
            stroke={INK}
            strokeWidth={5.6}
            strokeLinecap="round"
          />
          <path
            d="M67.5 23.5 C76 32 80 44 77 58 C80 72 76 84 67.5 92"
            fill="none"
            stroke={g.url("wood")}
            strokeWidth={2.8}
            strokeLinecap="round"
          />
          <rect
            x={74.5}
            y={54.5}
            width={5}
            height={7.5}
            rx={1.5}
            fill={RAMP.leather[2]}
            stroke={INK}
            strokeWidth={DETAIL}
          />
        </BaseWeapon>
        <GearMount
          anchor="mainHand"
          layer="weapon"
          x={76.5}
          y={58.5}
          rotation={0}
        />
        <circle
          cx={76.5}
          cy={58.5}
          r={4}
          fill={RAMP.leather[1]}
          stroke={INK}
          strokeWidth={LINE}
        />
      </g>

      {/* ---- the drawing arm, on top so it can reach the string ---- */}
      <g ref={hold("draw")} data-part="draw" style={at(bx, by)}>
        <g ref={hold("arrow")} data-part="arrow" style={at(35, 64)}>
          <g transform="translate(35 64) rotate(12)">
            <GearArrow>
              <path
                d="M-4 0 H24"
                stroke={INK}
                strokeWidth={3}
                strokeLinecap="round"
              />
              <path
                d="M-4 0 H24"
                stroke={RAMP.wood[0]}
                strokeWidth={1.4}
                strokeLinecap="round"
              />
              <path
                d="M22 -2.6 L28 0 L22 2.6 Z"
                fill={RAMP.steel[1]}
                stroke={INK}
                strokeWidth={DETAIL}
                strokeLinejoin="round"
              />
              <path
                d="M-6 -2.4 L-1 0 L-6 2.4 L-4 0 Z"
                fill="#c4533f"
                stroke={INK}
                strokeWidth={0.9}
              />
            </GearArrow>{" "}
          </g>
        </g>
        <Limb
          d={`M${bx} ${by} Q${bx - 3} 58 35 63`}
          fill={RAMP.sage[1]}
          width={8}
        />
        <circle
          cx={35}
          cy={64}
          r={4.2}
          fill={RAMP.leather[1]}
          stroke={INK}
          strokeWidth={LINE}
        />
      </g>
    </HeroFrame>
  );
}
