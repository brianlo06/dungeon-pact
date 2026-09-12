import { BaseWeapon, GearMount } from "../../equipment/Equipment";
import { useRigParts } from "../../battle/useRigParts";
import {
  at,
  BODY,
  DETAIL,
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
 * The Beguiler.
 *
 * Why fight them? Let them fight each other. A puppeteer in a two-horned
 * violet hood, the face behind a cracked porcelain half-mask with one sickly
 * green eye showing through, a robe that comes apart at the hem into curling
 * tatters. One hand holds a marionette's control up in front, with a little
 * wooden puppet dangling from the strings; the other holds a shard of mirror.
 *
 * Silhouette: the only hood with two horns, and the strings and dangling
 * puppet hanging clear of the body on the right — something small and limp on
 * the end of lines. The Acolyte is a plain pointed hood holding a flame; the
 * Beguiler is holding someone.
 */
const PARTS = ["legs", "body", "head", "shard", "control", "strings"] as const;

export function Beguiler({ unitId, animators, className, viewBox }: HeroProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  const g = useShades("bgl");
  const [bx, by] = BODY.shoulderBack;
  const [fx, fy] = BODY.shoulderFront;
  const string = "#e3dcef";

  return (
    <HeroFrame
      id="beguiler"
      label="Beguiler"
      className={className}
      viewBox={viewBox}
    >
      <defs>
        <Shade id={g.id("robe")} ramp={RAMP.violet} />
        <Shade id={g.id("trim")} ramp={RAMP.sickly} />
        <Shade id={g.id("mask")} ramp={["#fbf7ef", "#e2dccf", "#a79e90"]} />
        <Shade id={g.id("glass")} ramp={["#f2fbff", "#a9c9d8", "#5d7f8f"]} />
        <Shade id={g.id("wood")} ramp={RAMP.wood} />
      </defs>

      <g ref={hold("legs")} data-part="legs" style={at(48, 90)}>
        <Legs trousers={RAMP.violet[2]} boots={RAMP.iron[1]} spread={0.5} />
      </g>

      {/* ---- robe: violet, coming apart at the hem into curling tatters ---- */}
      <g ref={hold("body")} data-part="body" style={at(48, 74)}>
        <path
          d="M36 45 Q48 41 60 45 L65 62 C68 72 72 80 77 86 C73 87 70 85 68 82 C68 87 66 90 62 91 C63 87 62 84 60 82 L56 90 L52 83 L47 91 L43 83 L38 90 C38 86 37 84 35 83 C33 87 30 89 26 89 C29 86 30 83 30 80 C27 83 23 84 19 83 C24 78 28 72 31 62 Z"
          fill={g.url("robe")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <Lit d="M34 52 C32 60 30 68 27 76" />
        {/* sickly green trim down the front and a sash */}
        <path
          d="M49 46 C50 58 50 70 50 84"
          stroke={INK}
          strokeWidth={4.2}
          fill="none"
        />
        <path
          d="M49 46 C50 58 50 70 50 84"
          stroke={g.url("trim")}
          strokeWidth={2.2}
          fill="none"
        />
        <path
          d="M32 61 Q48 66 64 61 L64.5 65.5 Q48 70 31.5 65.5 Z"
          fill={g.url("trim")}
          stroke={INK}
          strokeWidth={DETAIL + 0.4}
          strokeLinejoin="round"
        />
        {/* a charm hanging off the sash: a tiny key-shaped bell */}
        <path d="M40 67 V73" stroke={INK} strokeWidth={0.9} />
        <circle
          cx={40}
          cy={74.5}
          r={1.8}
          fill={RAMP.gold[1]}
          stroke={INK}
          strokeWidth={0.9}
        />
        {/* collar */}
        <path
          d="M37 46 Q48 51 59 46 L57 42 Q48 45 39 42 Z"
          fill={RAMP.violet[2]}
          stroke={INK}
          strokeWidth={DETAIL + 0.4}
          strokeLinejoin="round"
        />
        <GearMount anchor="torso" layer="body" x={48} y={57} />
        <GearMount anchor="waist" layer="front" x={42} y={74} />
        <GearMount anchor="shoulderBack" layer="front" x={37} y={49} />
      </g>

      {/* ---- head: a two-horned hood, a cracked half-mask, one green eye ---- */}
      <g ref={hold("head")} data-part="head" style={at(...BODY.neck)}>
        {/* the hood's two horns, drooping behind */}
        <path
          d="M40 17 C35 12 28 10.5 22 12 C20 12.5 19 14 19.5 16 C24 15 29 16 33 20 Z"
          fill={RAMP.violet[1]}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <path
          d="M35 26 C28 25 22 27 18 32 C17 33.5 17.5 35 19 35.5 C22 32.5 27 31.5 33 33 Z"
          fill={RAMP.violet[1]}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <circle
          cx={19.5}
          cy={15.5}
          r={1.8}
          fill={RAMP.sickly[1]}
          stroke={INK}
          strokeWidth={DETAIL}
        />
        <circle
          cx={18.5}
          cy={34.5}
          r={1.8}
          fill={RAMP.sickly[1]}
          stroke={INK}
          strokeWidth={DETAIL}
        />
        {/* the face behind is only shadow */}
        <path d={HEAD_PATH} fill="#241b30" stroke={INK} strokeWidth={LINE} />
        {/* the mask: porcelain, over the side of the face we can see */}
        <path
          d="M47 21 C54 20 62 22 63.5 29 C64.5 35 62 41 56 43.5 C52 43 49 40.5 48 36 C47 31 46 26 47 21 Z"
          fill={g.url("mask")}
          stroke={INK}
          strokeWidth={DETAIL + 0.6}
          strokeLinejoin="round"
        />
        {/* the eye hole, and what looks out of it */}
        <path
          d="M51.5 29.5 Q54.5 27.5 57.5 29.5 Q54.5 32 51.5 29.5 Z"
          fill={INK}
        />
        <circle
          className="ph-bgl-eye"
          cx={54.5}
          cy={29.8}
          r={1.3}
          fill="#c7f06a"
        />
        {/* a painted smile, too wide */}
        <path
          d="M51 37.5 Q56 40.5 61.5 36"
          stroke={RAMP.crimson[1]}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />
        {/* the crack */}
        <path
          d="M58 21.5 L56.5 25 L59 27 L57 31"
          stroke={INK}
          strokeWidth={0.9}
          fill="none"
          strokeLinejoin="round"
        />
        {/* the hood */}
        <path
          d="M48 12 C58 12 66 18 66 28 C63.5 23 59 20.5 52 20.5 C46 20.5 42.5 24 41.5 31 C41 37 42.5 42 45 45.5 L35 45.5 C31.5 40 30.5 34 31.5 27 C33 17.5 39 12 48 12 Z"
          fill={g.url("robe")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <Lit d="M35 23 Q38 15.5 46 13.6" width={1.8} />
        <path
          d="M60 15 L61.5 17.5 M64 20 L66 21"
          stroke={g.url("trim")}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        <GearMount anchor="head" layer="front" x={48} y={29} />
      </g>

      {/* ---- the mirror shard, low in the back hand ---- */}
      <g ref={hold("shard")} data-part="shard" style={at(bx, by)}>
        <Limb
          d={`M${bx} ${by} Q${bx - 5} 57 30 62`}
          fill={RAMP.violet[1]}
          width={8}
        />
        <BaseWeapon>
          {" "}
          <path
            d="M23 51 L30 49.5 L32.5 58 L29 74 L25.5 70 L21 72 L22 62 Z"
            fill={g.url("glass")}
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
          <path
            className="ph-bgl-glint"
            d="M25 55 L28.5 53.5 M24.5 60 L29 57"
            stroke="#ffffff"
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <path
            d="M26 64 L28 66"
            stroke={RAMP.sickly[1]}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
        </BaseWeapon>
        <GearMount
          anchor="mainHand"
          layer="weapon"
          x={29}
          y={62}
          rotation={-12}
        />
        {/* long fingers */}
        <path
          d="M27 60 C28 58 31 58 32.5 60 L32 64.5 C30 65.5 27.5 64.5 27 62.5 Z"
          fill="#cfc5d9"
          stroke={INK}
          strokeWidth={DETAIL + 0.4}
          strokeLinejoin="round"
        />
      </g>

      {/* ---- the control, held up; the puppet hangs from it ---- */}
      <g ref={hold("control")} data-part="control" style={at(fx, fy)}>
        <Limb d={`M${fx} ${fy} Q68 51 71 44`} fill={RAMP.violet[1]} width={8} />
        {/* the strings and the puppet swing from the bar */}
        <g ref={hold("strings")} data-part="strings" style={at(74, 38)}>
          <g stroke={string} strokeWidth={0.8}>
            <path d="M64.5 38 L71 69" />
            <path d="M83.5 38 L77 69" />
            <path d="M74 42 L74 64" />
          </g>
          {/* the puppet: a wooden doll, limp */}
          <circle
            cx={74}
            cy={65.5}
            r={3.4}
            fill={g.url("wood")}
            stroke={INK}
            strokeWidth={DETAIL + 0.3}
          />
          <path d="M72.5 65 h1 M75 65 h1" stroke={INK} strokeWidth={0.9} />
          <path
            d="M71 69 H77 L76.5 78 H71.5 Z"
            fill={RAMP.crimson[1]}
            stroke={INK}
            strokeWidth={DETAIL + 0.3}
            strokeLinejoin="round"
          />
          <path
            d="M71 70 L67.5 76 M77 70 L80 76 M72.5 78 L71.5 85 M75.5 78 L77 85"
            stroke={INK}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <path
            d="M71 70 L67.5 76 M77 70 L80 76 M72.5 78 L71.5 85 M75.5 78 L77 85"
            stroke={RAMP.wood[0]}
            strokeWidth={1.1}
            strokeLinecap="round"
          />
        </g>
        {/* the cross-bar */}
        <path
          d="M63.5 38 L84.5 37 M74 32 V43"
          stroke={INK}
          strokeWidth={4.4}
          strokeLinecap="round"
        />
        <path
          d="M63.5 38 L84.5 37 M74 32 V43"
          stroke={g.url("wood")}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <path
          d="M70 42.5 C70 40 73 39 75 40.5 L75.5 45 C73.5 46.5 70.5 46 70 44 Z"
          fill="#cfc5d9"
          stroke={INK}
          strokeWidth={DETAIL + 0.4}
          strokeLinejoin="round"
        />
      </g>
    </HeroFrame>
  );
}
