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
 * The Reaver.
 *
 * Pain is just unspent currency. A scarred, bare-chested berserker with a
 * wild black mane, bandaged forearms, crossed straps and a crimson sash, a
 * bandaged fist up, and a notched cleaver far too big to carry properly — so
 * it is dragged, point down, along the floor behind.
 *
 * Silhouette: a spiked mane where everyone else has a hat or a hood, broad
 * bare shoulders, and a long blade lying low on the ground to the left, which
 * nobody else has anything near.
 */
const PARTS = ["legs", "body", "head", "hair", "fist", "cleaver"] as const;

export function Reaver({ unitId, animators, className, viewBox }: HeroProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  const g = useShades("rvr");
  const [bx, by] = BODY.shoulderBack;
  const [fx, fy] = BODY.shoulderFront;
  const wrap = "#e7dcc6";

  return (
    <HeroFrame
      id="reaver"
      label="Reaver"
      className={className}
      viewBox={viewBox}
    >
      <defs>
        <Shade id={g.id("skin")} ramp={RAMP.skin} />
        <Shade id={g.id("sash")} ramp={RAMP.crimson} />
        <Shade id={g.id("blade")} ramp={["#b9b4c2", "#7d7789", "#46404f"]} />
      </defs>

      <g ref={hold("legs")} data-part="legs" style={at(48, 90)}>
        <Legs
          trousers={RAMP.iron[2]}
          boots={RAMP.leather[1]}
          spread={2.5}
          lead={1}
          cuff={wrap}
        />
      </g>

      {/* ---- body: bare, scarred, strapped; a crimson sash with tails ---- */}
      <g ref={hold("body")} data-part="body" style={at(48, 74)}>
        {/* sash tails, thrown back */}
        <path
          d="M34 64 C29 70 25 74 20 78 L25 78.5 L23 83 C28 79 32 74 36 69 Z"
          fill={RAMP.crimson[1]}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        {/* trousers to the knee */}
        <path
          d="M33 66 H63 L65 79 L50 76 L32 79 Z"
          fill={RAMP.iron[1]}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        {/* the torso: broad at the shoulder, bare */}
        <path
          d="M30 47.5 Q48 40 66 47.5 L64 65 Q48 69 32 65 Z"
          fill={g.url("skin")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <Lit d="M34 50 Q40 46 46 45.5" />
        <path
          d="M40 54 Q44 56.5 48 54 Q52 56.5 57 54"
          stroke={RAMP.skin[2]}
          strokeWidth={1.2}
          fill="none"
        />
        {/* scars */}
        <path
          d="M52 49 L58 56 M55 59 L60 62 M38 57 L43 61"
          stroke="#f6d8c0"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <path
          d="M52 49 L58 56"
          stroke={RAMP.crimson[1]}
          strokeWidth={0.6}
          strokeLinecap="round"
        />
        {/* crossed straps */}
        <path
          d="M34 48 L60 64 M62 48 L36 64"
          stroke={INK}
          strokeWidth={4.2}
          strokeLinecap="round"
        />
        <path
          d="M34 48 L60 64 M62 48 L36 64"
          stroke={RAMP.leather[1]}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <circle
          cx={48}
          cy={56}
          r={2}
          fill={RAMP.iron[0]}
          stroke={INK}
          strokeWidth={DETAIL}
        />
        {/* sash */}
        <path
          d="M32 62.5 Q48 67 64 62.5 L64.5 68 Q48 72 31.5 68 Z"
          fill={g.url("sash")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
      </g>

      {/* ---- head: a scar across the nose, teeth showing, the mane ---- */}
      <g ref={hold("head")} data-part="head" style={at(...BODY.neck)}>
        {/* the mane, behind the face; it whips on its own */}
        <g ref={hold("hair")} data-part="hair" style={at(46, 24)}>
          <path
            d="M36 38 L25 39 L31 33 L20 30 L29 26 L21 18 L32 20 L30 11 L38 16 L42 10 L46 15 L52 10.5 L54 16 L61 12 L60 18 L67 17 L63 22 C58 19 53 19 48 20.5 C43 22 40 27 40 34 Z"
            fill="#241d26"
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
        </g>
        <path
          d={HEAD_PATH}
          fill={g.url("skin")}
          stroke={INK}
          strokeWidth={LINE}
        />
        {/* fringe hanging over the brow */}
        <path
          d="M38 18 C45 14 56 14 63 21 L60 24 L58 21.5 L56 26 L53 22 L50 27 L47.5 22.5 L44 27.5 L42.5 22 L39 26 Z"
          fill="#241d26"
          stroke={INK}
          strokeWidth={DETAIL + 0.4}
          strokeLinejoin="round"
        />
        {/* ear */}
        <path
          d="M39.5 30 C36.5 30 36.5 35.5 39.5 36"
          fill={RAMP.skin[1]}
          stroke={INK}
          strokeWidth={DETAIL}
        />
        {/* glaring: brows down hard */}
        <path
          d="M48.5 28 L55 30.5 M57.5 30.5 L63 28.5"
          stroke={INK}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <ellipse cx={53} cy={32.5} rx={1.6} ry={1.8} fill={INK} />
        <ellipse cx={60} cy={32.5} rx={1.4} ry={1.7} fill={INK} />
        {/* teeth, gritted */}
        <path
          d="M52 38 H61 V41 H52 Z"
          fill="#f4efe2"
          stroke={INK}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <path d="M55 38 V41 M58 38 V41" stroke={INK} strokeWidth={0.7} />
        {/* the scar */}
        <path
          d="M50 27 L62 38"
          stroke={RAMP.crimson[1]}
          strokeWidth={1.3}
          strokeLinecap="round"
        />
      </g>

      {/* ---- the fist, up and bandaged ---- */}
      <g ref={hold("fist")} data-part="fist" style={at(fx, fy)}>
        <Limb d={`M${fx} ${fy} Q70 60 71 55`} fill={RAMP.skin[1]} width={8.5} />
        {/* bandaged forearm */}
        <path
          d="M68 60 L73.5 60 M67.5 57 L73.5 57.5"
          stroke={wrap}
          strokeWidth={2}
        />
        <circle
          cx={71}
          cy={53}
          r={5}
          fill={wrap}
          stroke={INK}
          strokeWidth={LINE}
        />
        <path
          d="M68 51.5 H74 M67.5 54.5 H74.5"
          stroke={RAMP.bone[2]}
          strokeWidth={0.9}
        />
        <circle cx={73} cy={55} r={1} fill={RAMP.crimson[1]} />
      </g>

      {/* ---- the cleaver arm, on top: the blade drags on the floor ---- */}
      <g ref={hold("cleaver")} data-part="cleaver" style={at(bx, by)}>
        <g transform="translate(31 67) rotate(142)">
          {/* grip */}
          <rect
            x={-2}
            y={-1.8}
            width={10}
            height={3.6}
            rx={1.2}
            fill={RAMP.leather[2]}
            stroke={INK}
            strokeWidth={DETAIL}
          />
          {/* the blade: a slab, notched along the edge, rust at the spine */}
          <path
            d="M8 -3 L35 -4.5 L37 3 L36 7.5 L33.5 6 L31 9 L28 7 L25 10 L22 8 L19 11 L16 9 L13 11 L8 9.5 Z"
            fill={g.url("blade")}
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
          <path
            d="M10 -1 L34 -2.2"
            stroke="#e7e3ee"
            strokeWidth={1.1}
            opacity={0.7}
          />
          <circle
            cx={31}
            cy={1}
            r={1.8}
            fill={RAMP.iron[2]}
            stroke={INK}
            strokeWidth={0.9}
          />
          <path
            d="M16 5 L20 7.5 M24 4 L27 6.5"
            stroke={RAMP.crimson[1]}
            strokeWidth={1.6}
            strokeLinecap="round"
            opacity={0.85}
          />
        </g>
        <Limb
          d={`M${bx} ${by} Q${bx - 5} 60 31.5 66`}
          fill={RAMP.skin[1]}
          width={9}
        />
        <path
          d="M31 61 L36.5 62 M30.5 58 L36.5 59"
          stroke={wrap}
          strokeWidth={2}
        />
        <circle
          cx={31}
          cy={67}
          r={4.6}
          fill={wrap}
          stroke={INK}
          strokeWidth={LINE}
        />
      </g>
    </HeroFrame>
  );
}
