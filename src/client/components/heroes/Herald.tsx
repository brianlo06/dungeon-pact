import { IllustratedHead, Neck, Tailoring } from "./Illustration";
import { BaseWeapon, GearMount } from "../../equipment/Equipment";
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
 * The Herald.
 *
 * You are worth more than you think. A standard-bearer: a laurel circlet on
 * short dark hair, a bone tabard with the sun sewn on it over a mail shirt, a
 * brass horn in one hand and the party's banner in the other, flying forward
 * at the enemy as if the wind were always behind them.
 *
 * Silhouette: the tallest vertical in the party is the banner pole, on the
 * right, and the flag at its head flies forward — so the Herald's mass is up
 * and out to the right, where everyone else's is on the ground. The horn's
 * bell hangs at the hip.
 */
const PARTS = ["legs", "body", "head", "banner", "flag", "horn"] as const;
/** The face, moved only in an Ultimate close-up (see `CloseUpContext`). */
const FACE_PARTS = ["brow", "eyes", "mouth"] as const;

/**
 * The squarest face in the party: flat at the sides, a jaw with corners and a
 * flat chin, where every other face is round. It is the one face that looks
 * straight out and means it — open eyes, level brows, a smile with teeth.
 */
const FACE =
  "M47.5 13 C56.5 13 63 16.5 64 23.5 C64.6 27.5 64.8 32 64.8 36.5 C64.8 41.5 62.8 45 58 45.8 L47 46 C40 46 34.8 43 33.8 37.5 C33 33 32.6 27 33.2 23.5 C34.3 16.8 40 13 47.5 13 Z";

/** A sun: a disc and eight rays, for the tabard and the flag. */
function Sun({
  x,
  y,
  r,
  fill,
}: {
  x: number;
  y: number;
  r: number;
  fill: string;
}) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return `M${x + Math.cos(a) * r * 1.25} ${y + Math.sin(a) * r * 1.25} L${x + Math.cos(a) * r * 1.9} ${y + Math.sin(a) * r * 1.9}`;
  }).join(" ");
  return (
    <g>
      <path
        d={rays}
        stroke={fill}
        strokeWidth={r * 0.45}
        strokeLinecap="round"
      />
      <circle cx={x} cy={y} r={r} fill={fill} />
    </g>
  );
}

export function Herald({ unitId, animators, className, viewBox }: HeroProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  // The face only acts in a close-up; in a round it is never registered, so
  // it costs the stage nothing.
  const face = useRigParts(
    unitId,
    useContext(CloseUpContext) ? animators : undefined,
    FACE_PARTS,
  );
  const g = useShades("hrl");
  const [bx, by] = BODY.shoulderBack;
  const [fx, fy] = BODY.shoulderFront;

  return (
    <HeroFrame
      id="herald"
      label="Herald"
      className={className}
      viewBox={viewBox}
    >
      <defs>
        <Shade id={g.id("tabard")} ramp={RAMP.bone} />
        <Shade id={g.id("mail")} ramp={RAMP.steel} />
        <Shade id={g.id("gold")} ramp={RAMP.gold} />
        <Shade id={g.id("skin")} ramp={RAMP.skinBrown} />
        <Shade id={g.id("flag")} ramp={["#d9cdf0", "#a996cf", "#6f5e96"]} />
        <Shade id={g.id("wood")} ramp={RAMP.wood} />
      </defs>

      <g ref={hold("legs")} data-part="legs" style={at(48, 90)}>
        <Legs
          trousers={RAMP.violet[2]}
          boots={RAMP.leather[1]}
          spread={0.5}
          cuff={RAMP.leather[0]}
        />
      </g>

      {/* ---- body: mail shirt under a sun tabard, a short sword at the hip ---- */}
      <g ref={hold("body")} data-part="body" style={at(48, 74)}>
        {/* the scabbard, behind */}
        <path
          d="M34 66 L22 82"
          stroke={INK}
          strokeWidth={5.4}
          strokeLinecap="round"
        />
        <path
          d="M34 66 L22 82"
          stroke={RAMP.leather[1]}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path
          d="M35 46 Q48 42 61 46 L63 70 L64 76 L32 76 L33 70 Z"
          fill={g.url("mail")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <path
          d="M35 52 H62 M34.5 57 H62.5 M34 62 H63 M33.5 67 H63"
          stroke={RAMP.steel[2]}
          strokeWidth={0.9}
          strokeDasharray="1.2 1.2"
        />
        {/* the tabard, longer than the mail, notched hem */}
        <path
          d="M40 45 H56 L57.5 82 L52.5 79 L48 83 L43.5 79 L38.5 82 Z"
          fill={g.url("tabard")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <path d="M41.5 47 V79" stroke={RAMP.gold[1]} strokeWidth={1.2} />
        <path d="M54.5 47 V79" stroke={RAMP.gold[1]} strokeWidth={1.2} />
        <Sun x={48} y={58} r={3.2} fill={RAMP.gold[1]} />
        <Lit d="M42.5 48.5 V58" />
        {/* belt */}
        <rect
          x={33}
          y={65.5}
          width={30}
          height={3.8}
          fill={RAMP.leather[2]}
          stroke={INK}
          strokeWidth={DETAIL}
        />
        <rect
          x={46}
          y={65}
          width={4.5}
          height={4.8}
          rx={0.8}
          fill={g.url("gold")}
          stroke={INK}
          strokeWidth={DETAIL}
        />
        <Neck hero="herald" />
        <Tailoring hero="herald" />
        <GearMount anchor="torso" layer="body" x={48} y={57} />
        <GearMount anchor="waist" layer="front" x={42} y={74} />
        <GearMount anchor="shoulderBack" layer="front" x={37} y={49} />
      </g>

      {/* ---- head: laurel on short dark hair, a square jaw, an open face ---- */}
      <g ref={hold("head")} data-part="head" style={at(...BODY.neck)}>
        <IllustratedHead>
          {/* a square head on a square jaw */}
          <path
            d={FACE}
            fill={g.url("skin")}
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
          {/* the underside of the jaw in shade, and a cleft in the chin */}
          <path
            d="M45 44.2 C50 45 56 45 61 44 C62.8 43.5 63.9 42.2 64.4 40.6 C64.5 43.3 62.4 45.5 58.2 45.8 L47 46 Z"
            fill={RAMP.skinBrown[2]}
            opacity={0.45}
          />
          <path
            d="M58.6 43.2 V45.4"
            stroke={RAMP.skinBrown[2]}
            strokeWidth={1}
            strokeLinecap="round"
          />
          {/* short hair cut square at the temple, and a cowlick */}
          <path
            d="M33.5 32 C32 21 37.5 12.5 48 12.5 C55.5 12.5 61.5 15.5 63.8 21.5 C60.5 20.6 57.5 21.4 55.5 23 C53 21.4 49 21.2 45.5 22.4 C43.4 23.2 42 24.6 41.8 26.5 L42 33.5 L38 34.5 C36 34 34.5 33.3 33.5 32 Z"
            fill="#2a1f22"
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
          <path
            d="M47 12.8 C46 10.5 47.5 9.5 50 10.2"
            stroke={INK}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M47 12.8 C46 10.5 47.5 9.5 50 10.2"
            stroke="#2a1f22"
            strokeWidth={1.1}
            fill="none"
            strokeLinecap="round"
          />
          {/* a proper ear, set well back on the square head */}
          <path
            d="M41.4 27.6 C37.6 26.8 36 30 36.6 32.8 C37.2 35.4 39.4 36.2 41.4 35.2 Z"
            fill={g.url("skin")}
            stroke={INK}
            strokeWidth={DETAIL}
            strokeLinejoin="round"
          />
          <path
            d="M40 29.8 C38.6 30.4 38.6 32.4 40 33.2"
            stroke={RAMP.skinBrown[2]}
            strokeWidth={0.9}
            fill="none"
            strokeLinecap="round"
          />
          <g ref={face("brow")} data-part="brow" style={at(56, 27.2)}>
            {/* level brows, thick, lifted a little at the middle: earnest */}
            <path
              d="M48.8 27.9 L55.2 26.7 M57.6 26.6 L63 27.6"
              stroke={INK}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </g>
          <g ref={face("eyes")} data-part="eyes" style={at(56, 31.1)}>
            {/* wide-open eyes, whites and warm brown irises */}
            <g stroke={INK} strokeWidth={1}>
              <path
                d="M49.4 31.4 Q52.2 28.6 55.2 31.2 Q52.2 33.8 49.4 31.4 Z"
                fill="#fffaf0"
              />
              <path
                d="M57.4 31.1 Q59.9 28.7 62.4 31 Q59.9 33.4 57.4 31.1 Z"
                fill="#fffaf0"
              />
            </g>
            <circle cx={52.8} cy={31.2} r={1.45} fill="#4a2a1a" />
            <circle cx={60.3} cy={31} r={1.3} fill="#4a2a1a" />
            <circle cx={52.9} cy={31.2} r={0.7} fill={INK} />
            <circle cx={60.4} cy={31} r={0.6} fill={INK} />
            <circle cx={53.3} cy={30.6} r={0.45} fill="#fff6e2" />
          </g>
          {/* a straight nose, the bridge drawn in one line */}
          <path
            d="M58.6 30.4 C59.4 32.8 61 34.6 62.6 35.4 C61.8 36.6 60.2 36.9 58.8 36.2"
            stroke={INK}
            strokeWidth={1.2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g ref={face("mouth")} data-part="mouth" style={at(57.6, 40.5)}>
            {/* an open smile, the top teeth showing, and a crease beside it */}
            <path
              d="M53.2 39.2 Q57.6 40.2 62 38.9 Q61 43.6 57.4 43.6 Q54.2 43.4 53.2 39.2 Z"
              fill="#5a2226"
              stroke={INK}
              strokeWidth={1.1}
              strokeLinejoin="round"
            />
            <path
              d="M54 39.6 Q57.6 40.5 61.2 39.4 L60.8 40.8 Q57.6 41.6 54.4 40.8 Z"
              fill="#f7f1e4"
            />
            <path
              d="M52.2 37.4 Q51.2 39.4 52.3 41.2"
              stroke={RAMP.skinBrown[2]}
              strokeWidth={0.9}
              fill="none"
              strokeLinecap="round"
            />
          </g>
          {/* the laurel circlet */}
          <path
            d="M34 25 Q48 17.5 63 22.5"
            stroke={RAMP.gold[1]}
            strokeWidth={1.4}
            fill="none"
          />
          {[
            [36, 23.5, -30],
            [40, 21.2, -20],
            [44, 19.8, -12],
            [48, 19.2, -4],
            [52, 19.2, 4],
            [56, 19.9, 12],
            [60, 21.2, 22],
          ].map(([x, y, a]) => (
            <path
              key={x}
              d="M0 0 Q2.2 -2 4.6 0 Q2.2 2 0 0 Z"
              transform={`translate(${x - 2} ${y}) rotate(${a - 60})`}
              fill="#9fb05a"
              stroke={INK}
              strokeWidth={0.7}
            />
          ))}
          <GearMount anchor="head" layer="front" x={48} y={29} />
        </IllustratedHead>
      </g>

      {/* ---- the banner, in the front hand; the flag flies forward ---- */}
      <g ref={hold("banner")} data-part="banner" style={at(fx, fy)}>
        <BaseWeapon>
          {" "}
          <path
            d="M69 13 V96"
            stroke={INK}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <path
            d="M69 13 V96"
            stroke={g.url("wood")}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          {/* finial: a little gilt sun on a spike */}
          <path
            d="M69 10 L71 14.5 H67 Z"
            fill={g.url("gold")}
            stroke={INK}
            strokeWidth={DETAIL}
            strokeLinejoin="round"
          />
          <g ref={hold("flag")} data-part="flag" style={at(69, 20)}>
            <path
              d="M70 14 C77 12 83 16 90 13.5 C93 12.8 95 13 97 14 L91.5 23.5 L97 33 C90 31.5 84 34.5 77 34 C74.5 33.8 72 34.5 70 35 Z"
              fill={g.url("flag")}
              stroke={INK}
              strokeWidth={LINE}
              strokeLinejoin="round"
            />
            <path
              d="M71.5 16.8 C77 15 82 18.5 88 16.4"
              stroke="#efe8fb"
              strokeWidth={1.1}
              fill="none"
              opacity={0.7}
            />
            <Sun x={81} y={24} r={3} fill={RAMP.gold[0]} />
          </g>
        </BaseWeapon>
        <GearMount
          anchor="mainHand"
          layer="weapon"
          x={69}
          y={58}
          rotation={0}
        />
        <Limb
          d={`M${fx} ${fy} Q64 57 68.5 58`}
          fill={RAMP.steel[1]}
          width={8}
        />
        <circle
          cx={69}
          cy={58}
          r={4.2}
          fill={RAMP.leather[1]}
          stroke={INK}
          strokeWidth={LINE}
        />
      </g>

      {/* ---- the horn arm, on top: it comes up to the lips ---- */}
      <g ref={hold("horn")} data-part="horn" style={at(bx, by)}>
        <Limb
          d={`M${bx} ${by} Q${bx - 4} 57 33 62`}
          fill={RAMP.steel[1]}
          width={8}
        />
        {/* a curled brass horn, mouthpiece up by the hand, bell hanging */}
        <path
          d="M40 70 C42 74 43.5 79 44 84"
          stroke={INK}
          strokeWidth={5.4}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M40 70 C42 74 43.5 79 44 84"
          stroke={g.url("gold")}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M40.5 83 L48.5 83.5 L47 89.5 C45 90 42 89.5 40 88.5 Z"
          fill={g.url("gold")}
          stroke={INK}
          strokeWidth={DETAIL + 0.5}
          strokeLinejoin="round"
        />
        <path
          d="M34.5 64 L39.5 70.5"
          stroke={INK}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path
          d="M34.5 64 L39.5 70.5"
          stroke={RAMP.gold[1]}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <circle
          cx={33}
          cy={62.5}
          r={4.2}
          fill={RAMP.leather[1]}
          stroke={INK}
          strokeWidth={LINE}
        />
      </g>
    </HeroFrame>
  );
}
