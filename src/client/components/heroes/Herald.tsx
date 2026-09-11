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
        <Shade id={g.id("skin")} ramp={RAMP.skin} />
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
      </g>

      {/* ---- head: laurel on short dark hair, a steady look ---- */}
      <g ref={hold("head")} data-part="head" style={at(...BODY.neck)}>
        <path
          d={HEAD_PATH}
          fill={g.url("skin")}
          stroke={INK}
          strokeWidth={LINE}
        />
        {/* short hair with a cowlick */}
        <path
          d="M33 30 C31 20 38 12.5 48 12.5 C55 12.5 61 15.5 63.5 21 C60 20 57 21.5 55 23.5 C53 21 49 20.5 46 22 C43 23.5 41 27 40.5 32 L37 34 C35.5 33 34 32 33 30 Z"
          fill="#3a2a2a"
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
          stroke="#3a2a2a"
          strokeWidth={1.1}
          fill="none"
          strokeLinecap="round"
        />
        {/* ear */}
        <path
          d="M40 29 C37 29 37 34.5 40 35"
          fill={RAMP.skin[1]}
          stroke={INK}
          strokeWidth={DETAIL}
        />
        <path
          d="M49 28 L54.5 27.5 M57.5 27.5 L62 28.3"
          stroke={INK}
          strokeWidth={1.3}
          strokeLinecap="round"
        />
        <Eyes x={52.5} y={32} />
        <path
          d="M54 39 H58.5"
          stroke={INK}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
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
      </g>

      {/* ---- the banner, in the front hand; the flag flies forward ---- */}
      <g ref={hold("banner")} data-part="banner" style={at(fx, fy)}>
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
