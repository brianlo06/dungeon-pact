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
 * The Broker.
 *
 * Everything has a price. A stout, spectacled money-dealer in a long violet
 * coat buttoned over a waistcoat, coin pouches strung across the belly, a
 * brass balance held out in front and a fat ledger tucked under the other
 * arm. The only hero who looks like they have eaten recently.
 *
 * Silhouette: the widest, roundest body in the line and nothing tall at all —
 * a flat cap is the top of it — with the balance's beam and hanging pans
 * breaking out on the right and the ledger's block on the left.
 */
const PARTS = [
  "legs",
  "body",
  "purse",
  "head",
  "scales",
  "pans",
  "ledger",
] as const;

export function Broker({ unitId, animators, className, viewBox }: HeroProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  const g = useShades("brk");
  const [bx, by] = BODY.shoulderBack;
  const [fx, fy] = BODY.shoulderFront;

  const pan = (x: number) => (
    <g>
      <path
        d={`M${x} 56 L${x - 4.5} 66 M${x} 56 L${x + 4.5} 66`}
        stroke={RAMP.gold[2]}
        strokeWidth={0.9}
      />
      <path
        d={`M${x - 6} 66 H${x + 6} Q${x + 5} 70.5 ${x} 70.5 Q${x - 5} 70.5 ${x - 6} 66 Z`}
        fill={g.url("gold")}
        stroke={INK}
        strokeWidth={DETAIL + 0.4}
        strokeLinejoin="round"
      />
    </g>
  );

  return (
    <HeroFrame
      id="broker"
      label="Broker"
      className={className}
      viewBox={viewBox}
    >
      <defs>
        <Shade id={g.id("coat")} ramp={RAMP.violet} />
        <Shade id={g.id("gold")} ramp={RAMP.gold} />
        <Shade id={g.id("skin")} ramp={RAMP.skin} />
        <Shade id={g.id("leather")} ramp={RAMP.leather} />
      </defs>

      <g ref={hold("legs")} data-part="legs" style={at(48, 90)}>
        <Legs trousers={RAMP.iron[1]} boots={RAMP.leather[1]} spread={2.5} />
      </g>

      {/* ---- body: a long round coat over a waistcoat ---- */}
      <g ref={hold("body")} data-part="body" style={at(48, 76)}>
        <path
          d="M35 44 Q48 39.5 61 44 C70 49 74.5 60 73 72 L72 85 L63 83.5 L54 85.5 L44 83.5 L34 85.5 L24.5 84 L24 72 C22.5 60 26 49 35 44 Z"
          fill={g.url("coat")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <Lit d="M30 52 C27 59 26 66 26 74" width={1.8} />
        {/* the waistcoat in the V of the lapels, straining */}
        <path
          d="M41 45 L48 64 L56 45 Q60 55 58 66 Q48 70 39 66 Q36 55 41 45 Z"
          fill={g.url("gold")}
          stroke={INK}
          strokeWidth={DETAIL + 0.4}
          strokeLinejoin="round"
        />
        <path
          d="M41 45 L37 54 L42 55 L48 64 Z M56 45 L60 54 L55 55 L48 64 Z"
          fill={RAMP.violet[2]}
          stroke={INK}
          strokeWidth={DETAIL}
          strokeLinejoin="round"
        />
        {[55, 60, 65].map((y) => (
          <circle key={y} cx={48.5} cy={y + 1} r={1.1} fill={RAMP.leather[2]} />
        ))}
        {/* a watch chain */}
        <path
          d="M49 61 Q53 64 57 61"
          stroke={RAMP.gold[0]}
          strokeWidth={1.1}
          fill="none"
        />
        {/* a patch on the coat, because the money is not spent on clothes */}
        <rect
          x={62}
          y={74}
          width={6}
          height={6}
          fill={RAMP.violet[0]}
          stroke={INK}
          strokeWidth={DETAIL}
          transform="rotate(-8 65 77)"
        />
        {/* the belt the pouches hang from */}
        <path
          d="M25 69 Q48 75 72 69"
          stroke={RAMP.leather[2]}
          strokeWidth={4.6}
          fill="none"
        />
        <path
          d="M25 69 Q48 75 72 69"
          stroke={RAMP.leather[1]}
          strokeWidth={2.6}
          fill="none"
        />
        {/* collar */}
        <path
          d="M37 44.5 Q48 49 59 44.5 L58 41 Q48 44 38 41 Z"
          fill={RAMP.bone[1]}
          stroke={INK}
          strokeWidth={DETAIL + 0.4}
          strokeLinejoin="round"
        />
      </g>

      {/* ---- coin pouches, strung on the belt; they jingle ---- */}
      <g ref={hold("purse")} data-part="purse" style={at(46, 72)}>
        {[
          [34, 73, 4.6],
          [42, 75, 5.2],
          [51, 75.5, 4.4],
        ].map(([x, y, r]) => (
          <g key={x}>
            <path
              d={`M${x - 1.5} ${y - 1} L${x - r * 0.4} ${y - r * 0.2} C${x - r * 1.2} ${y + r * 0.3} ${x - r} ${y + r * 1.5} ${x} ${y + r * 1.5} C${x + r} ${y + r * 1.5} ${x + r * 1.2} ${y + r * 0.3} ${x + r * 0.4} ${y - r * 0.2} L${x + 1.5} ${y - 1} Z`}
              fill={g.url("gold")}
              stroke={INK}
              strokeWidth={DETAIL + 0.4}
              strokeLinejoin="round"
            />
            <path
              d={`M${x - 2} ${y} H${x + 2}`}
              stroke={RAMP.gold[2]}
              strokeWidth={1.2}
            />
          </g>
        ))}
        <circle cx={43} cy={79} r={1.2} fill="#fff1c2" opacity={0.8} />
      </g>

      {/* ---- head: flat cap with a quill, spectacles, mutton chops ---- */}
      <g ref={hold("head")} data-part="head" style={at(...BODY.neck)}>
        <path
          d={HEAD_PATH}
          fill={g.url("skin")}
          stroke={INK}
          strokeWidth={LINE}
        />
        {/* grey side-whiskers */}
        <path
          d="M34 28 C33 34 35 40 40 43 C41 38 40 33 38 29 Z"
          fill="#c9c3cf"
          stroke={INK}
          strokeWidth={DETAIL}
          strokeLinejoin="round"
        />
        {/* ear */}
        <path
          d="M40 30 C37 30 37 35 40 35.5"
          fill={RAMP.skin[1]}
          stroke={INK}
          strokeWidth={DETAIL}
        />
        {/* a nose with some opinions */}
        <path
          d="M61.5 32 C66 32 67 36.5 62.5 37.5"
          fill={RAMP.skin[0]}
          stroke={INK}
          strokeWidth={DETAIL + 0.3}
        />
        {/* spectacles */}
        <g stroke={INK} strokeWidth={1.3}>
          <circle cx={51.5} cy={31} r={3.6} fill="#e8f2ff" fillOpacity={0.35} />
          <circle cx={59.5} cy={31} r={3.2} fill="#e8f2ff" fillOpacity={0.35} />
          <path d="M55 31 H56.5 M48 30.5 L41 29.5" fill="none" />
        </g>
        <circle cx={51.5} cy={31.3} r={1.2} fill={INK} />
        <circle cx={59.5} cy={31.3} r={1.1} fill={INK} />
        <path
          className="ph-brk-glint"
          d="M49.5 29.5 l2 -1.8 M57.8 29.6 l1.7 -1.5"
          stroke="#ffffff"
          strokeWidth={1}
        />
        {/* a satisfied mouth and a second chin */}
        <path
          d="M54 39.5 Q57 40.5 59.5 38.8"
          stroke={INK}
          strokeWidth={1.1}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M47 43.5 Q53 45.5 59 42.5"
          stroke={RAMP.skin[2]}
          strokeWidth={1}
          fill="none"
        />
        {/* flat cap, brim to the front, quill tucked in the band */}
        <path
          d="M40 19 L28 10.5 L31 10.2 L42 17 Z"
          fill="#f1e6cf"
          stroke={INK}
          strokeWidth={DETAIL}
          strokeLinejoin="round"
        />
        <path
          d="M33 24 C33 16.5 40 13 49 13 C57 13 63 16 64 21 C67 21.5 70 23 70.5 25 Q60 26.5 49 25.5 Q40 25 33 24 Z"
          fill={g.url("leather")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <path
          d="M34 22 Q48 24.5 63.5 22"
          stroke={RAMP.leather[2]}
          strokeWidth={1.6}
          fill="none"
        />
        <Lit d="M37 18 Q41 14.5 47 14" width={1.6} />
      </g>

      {/* ---- the balance, held out front; the beam tips on its own ---- */}
      <g ref={hold("scales")} data-part="scales" style={at(fx, fy)}>
        <Limb d={`M${fx} ${fy} Q66 57 71 53`} fill={RAMP.violet[1]} width={9} />
        <rect
          x={72.5}
          y={43}
          width={2}
          height={12}
          fill={g.url("gold")}
          stroke={INK}
          strokeWidth={0.9}
        />
        <circle
          cx={73.5}
          cy={43}
          r={2}
          fill="none"
          stroke={INK}
          strokeWidth={2.6}
        />
        <circle
          cx={73.5}
          cy={43}
          r={2}
          fill="none"
          stroke={RAMP.gold[1]}
          strokeWidth={1.2}
        />
        <g ref={hold("pans")} data-part="pans" style={at(73.5, 55)}>
          <rect
            x={62}
            y={54}
            width={23}
            height={2.4}
            rx={1}
            fill={g.url("gold")}
            stroke={INK}
            strokeWidth={DETAIL}
          />
          {pan(63.5)}
          {pan(83.5)}
          {/* the coin being weighed */}
          <ellipse
            cx={83.5}
            cy={65.2}
            rx={3}
            ry={1.2}
            fill={RAMP.gold[0]}
            stroke={INK}
            strokeWidth={0.8}
          />
        </g>
        <circle
          cx={71.5}
          cy={52.5}
          r={4.2}
          fill={g.url("skin")}
          stroke={INK}
          strokeWidth={LINE}
        />
      </g>

      {/* ---- the ledger arm, on top: it gets swung ---- */}
      <g ref={hold("ledger")} data-part="ledger" style={at(bx, by)}>
        <g transform="rotate(-8 24 62)">
          <rect
            x={15}
            y={50}
            width={15}
            height={23}
            rx={1.5}
            fill={g.url("leather")}
            stroke={INK}
            strokeWidth={LINE}
          />
          <rect x={27.5} y={51.5} width={2.2} height={20} fill="#efe2c2" />
          <rect
            x={15}
            y={58}
            width={15}
            height={3.5}
            fill={RAMP.gold[1]}
            stroke={INK}
            strokeWidth={0.9}
          />
          <rect
            x={20.5}
            y={57}
            width={4}
            height={5.5}
            rx={0.8}
            fill={g.url("gold")}
            stroke={INK}
            strokeWidth={0.9}
          />
        </g>
        <Limb
          d={`M${bx} ${by} Q${bx - 4} 57 30 61`}
          fill={RAMP.violet[1]}
          width={9}
        />
        <circle
          cx={29.5}
          cy={61.5}
          r={4.3}
          fill={g.url("skin")}
          stroke={INK}
          strokeWidth={LINE}
        />
      </g>
    </HeroFrame>
  );
}
