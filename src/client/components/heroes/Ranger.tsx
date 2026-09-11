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

export function Ranger({ unitId, animators, className, viewBox }: HeroProps) {
  const hold = useRigParts(unitId, animators, PARTS);
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
        <Shade id={g.id("skin")} ramp={RAMP.skin} />
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
      </g>

      {/* ---- head: freckled face, auburn fringe, a hood with a trailing point ---- */}
      <g ref={hold("head")} data-part="head" style={at(...BODY.neck)}>
        {/* hood tail, behind */}
        <path
          d="M42 14.5 C35 13 27 13.5 19.5 17.5 C24.5 19 29.5 21.5 33.5 26 Z"
          fill={RAMP.sage[1]}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <path
          d={HEAD_PATH}
          fill={g.url("skin")}
          stroke={INK}
          strokeWidth={LINE}
        />
        {/* auburn fringe spilling out of the hood */}
        <path
          d="M40 20 C46 18 54 18 61 22 L60 27 L56.5 24.5 L55 28.5 L51.5 25 L49 29 L46 25 L42 28 Z"
          fill="#b5552e"
          stroke={INK}
          strokeWidth={DETAIL}
          strokeLinejoin="round"
        />
        <Eyes x={52.5} y={32.5} />
        <path
          d="M52 38.5 Q55 40 58 38.5"
          stroke={INK}
          strokeWidth={1.1}
          fill="none"
          strokeLinecap="round"
        />
        <g fill="#b56a4c" opacity={0.8}>
          <circle cx={50} cy={36} r={0.6} />
          <circle cx={52} cy={36.8} r={0.6} />
          <circle cx={58} cy={36} r={0.6} />
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
      </g>

      {/* ---- the bow, held out front: taller than its owner ---- */}
      <g ref={hold("bow")} data-part="bow" style={at(fx, fy)}>
        <Limb d={`M${fx} ${fy} Q68 57 75 58`} fill={RAMP.sage[1]} width={8} />
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
