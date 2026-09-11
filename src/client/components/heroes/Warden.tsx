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
 * The Warden.
 *
 * Nothing living is beyond hope. A hedge-priest in a bone-white hooded mantle
 * gone ragged at the hem, antlers growing up through the hood, moss and vine
 * over everything, eyes closed. A crooked staff taller than they are, with a
 * lantern swinging from the crook; the other hand is open, because that is
 * the hand that heals.
 *
 * Silhouette: the antlers are the widest thing at the top of the party line,
 * the staff and its hanging lantern stand up on the left, and the mantle
 * spreads wide and torn. Nothing else carries a light.
 */
const PARTS = ["staff", "lantern", "legs", "body", "head", "hand"] as const;

/** A pointed leaf, `r` half its length, in local space. */
const leafD = (r: number) =>
  `M0 0 Q${r} ${-r * 0.75} ${2 * r} 0 Q${r} ${r * 0.75} 0 0 Z`;
/** Transform placing a leaf at (x, y), turned `deg` degrees. */
const place = (x: number, y: number, deg: number) =>
  `translate(${x} ${y}) rotate(${deg})`;

export function Warden({ unitId, animators, className, viewBox }: HeroProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  const g = useShades("wdn");
  const [bx, by] = BODY.shoulderBack;
  const [fx, fy] = BODY.shoulderFront;

  const Leaf = ({
    x,
    y,
    r = 3,
    a = 0,
  }: {
    x: number;
    y: number;
    r?: number;
    a?: number;
  }) => (
    <path
      d={leafD(r)}
      transform={place(x, y, a)}
      fill={RAMP.moss[0]}
      stroke={INK}
      strokeWidth={0.9}
      strokeLinejoin="round"
    />
  );

  return (
    <HeroFrame
      id="warden"
      label="Warden"
      className={className}
      viewBox={viewBox}
    >
      <defs>
        <Shade id={g.id("mantle")} ramp={RAMP.bone} />
        <Shade id={g.id("robe")} ramp={RAMP.moss} />
        <Shade id={g.id("wood")} ramp={RAMP.wood} />
        <Shade id={g.id("skin")} ramp={RAMP.skin} />
        <radialGradient id={g.id("lamp")}>
          <stop offset="0" stopColor="#fff4c4" />
          <stop offset="0.5" stopColor="#ffc15a" />
          <stop offset="1" stopColor="#ff9a42" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g.id("mote")}>
          <stop offset="0" stopColor="#f2ffd8" />
          <stop offset="0.5" stopColor="#a8e07a" />
          <stop offset="1" stopColor="#6fbf4f" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---- the staff, behind: crooked, sprouting, with a lantern hung off it ---- */}
      <g ref={hold("staff")} data-part="staff" style={at(bx, by)}>
        <path
          d="M28 95 C29 84 26 74 28 62 C29 50 26 40 27.5 28 C28 22 26 17 22 14.5 C19 13 16.5 15 16.5 19"
          fill="none"
          stroke={INK}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M28 95 C29 84 26 74 28 62 C29 50 26 40 27.5 28 C28 22 26 17 22 14.5 C19 13 16.5 15 16.5 19"
          fill="none"
          stroke={g.url("wood")}
          strokeWidth={3.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Leaf x={28} y={34} r={2.6} a={-23} />
        <Leaf x={27} y={46} r={2.2} a={195} />
        <Leaf x={24} y={16} r={2.2} a={-126} />
        {/* the lantern swings from the crook on its own */}
        <g ref={hold("lantern")} data-part="lantern" style={at(16.5, 19)}>
          <path d="M16.5 19 V24" stroke={INK} strokeWidth={1.3} />
          <circle
            className="ph-wdn-lamp ph-glow"
            cx={16.5}
            cy={29.5}
            r={8}
            fill={g.url("lamp")}
          />
          <path
            d="M13 24.5 H20 L21 27 V33 L19.5 35 H13.5 L12 33 V27 Z"
            fill="#ffd27a"
            fillOpacity={0.55}
            stroke={INK}
            strokeWidth={DETAIL + 0.5}
            strokeLinejoin="round"
          />
          <path
            d="M16.5 25 V35 M12.5 29.5 H20.5"
            stroke={INK}
            strokeWidth={1}
          />
          <circle
            className="ph-wdn-lamp"
            cx={16.5}
            cy={30}
            r={1.8}
            fill="#fff4c4"
          />
        </g>
        <Limb
          d={`M${bx} ${by} Q${bx - 5} 56 29 61`}
          fill={RAMP.bone[1]}
          width={8}
        />
        <circle
          cx={28.5}
          cy={61.5}
          r={4}
          fill={g.url("skin")}
          stroke={INK}
          strokeWidth={LINE}
        />
      </g>

      <g ref={hold("legs")} data-part="legs" style={at(48, 90)}>
        <Legs trousers={RAMP.moss[2]} boots={RAMP.leather[1]} spread={0.5} />
      </g>

      {/* ---- body: a moss robe under a torn bone mantle, vine over both ---- */}
      <g ref={hold("body")} data-part="body" style={at(48, 74)}>
        <path
          d="M36 46 Q48 42 60 46 L65 88 L60 86 L55 90 L50 86 L45 90 L40 86 L34 89 L33 70 Z"
          fill={g.url("robe")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <path
          d="M34 44 Q48 38.5 62 44 C68 52 71 62 72 76 L67 73 L64 79 L59 74 L55 80 L50 75 L45 80 L41 74 L36.5 79 L32 73 L26 77 C26.5 64 28.5 52 34 44 Z"
          fill={g.url("mantle")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <Lit d="M33 50 C30 57 29 64 28.5 71" />
        <path
          d="M49 47 C49 58 49 66 50 74"
          stroke={RAMP.bone[2]}
          strokeWidth={DETAIL}
          fill="none"
        />
        {/* moss stains on the hem */}
        <path
          d="M28 73 C33 71 38 74 42 72 L41 74 L36.5 79 L32 73 L26 77 Z"
          fill={RAMP.moss[1]}
          opacity={0.6}
        />
        {/* the vine */}
        <path
          d="M36 47 C42 52 40 58 46 60 C52 62 56 57 61 62 C65 66 63 70 67 72"
          fill="none"
          stroke={RAMP.moss[2]}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <Leaf x={41} y={54} r={2.6} a={218} />
        <Leaf x={52} y={60} r={2.4} a={-52} />
        <Leaf x={63} y={66} r={2.2} a={17} />
        {/* wooden toggle at the throat */}
        <rect
          x={46}
          y={45}
          width={6}
          height={3}
          rx={1.4}
          fill={g.url("wood")}
          stroke={INK}
          strokeWidth={DETAIL}
        />
      </g>

      {/* ---- head: antlers up through the hood, eyes closed ---- */}
      <g ref={hold("head")} data-part="head" style={at(...BODY.neck)}>
        {/* antlers, behind the hood */}
        {[
          // back antler: a long beam raking out behind, three tines up
          "M42 18.5 C36 15 27 14 15 16.5 M36.5 15.8 L33.5 10.5 M29 14.6 L24.5 10.4 M21 15 L14.5 11 M15 16.5 C12 17.5 10 19.5 9 22.5",
          // front antler: shorter, forward, curling at the tip
          "M55 17.5 C61 14.5 70 13.5 81 15.5 M62 15.2 L64 10.4 M69.5 14.2 L73.5 10.4 M81 15.5 C84 16.5 86 18.5 87 21.5",
        ].map((d) => (
          <g key={d}>
            <path
              d={d}
              fill="none"
              stroke={INK}
              strokeWidth={5.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={d}
              fill="none"
              stroke={RAMP.wood[0]}
              strokeWidth={2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
        <path
          d={HEAD_PATH}
          fill={g.url("skin")}
          stroke={INK}
          strokeWidth={LINE}
        />
        <Eyes x={52.5} y={33} lids />
        <path
          d="M53 38.5 Q55.5 39.5 58 38.5"
          stroke={INK}
          strokeWidth={1}
          fill="none"
          strokeLinecap="round"
        />
        {/* a leaf marked on the cheek */}
        <path
          d={leafD(1.6)}
          transform={place(58, 35.5, 57)}
          fill={RAMP.moss[1]}
          opacity={0.85}
        />
        {/* the hood */}
        <path
          d="M48 12 C58 12 66 18 66 28 C63 23 58 21 51 21 C44 21 40 25 39 33 C39 38 40.5 42 43 45.5 L35 45.5 C31.5 40 30.5 34 31.5 27 C33 17.5 39 12 48 12 Z"
          fill={g.url("mantle")}
          stroke={INK}
          strokeWidth={LINE}
          strokeLinejoin="round"
        />
        <Lit d="M35 23 Q38 15.5 46 13.6" width={1.8} />
        <Leaf x={40} y={17} r={2.4} a={-138} />
        <Leaf x={60} y={17} r={2.2} a={-34} />
      </g>

      {/* ---- the open hand: the one that heals ---- */}
      <g ref={hold("hand")} data-part="hand" style={at(fx, fy)}>
        <Limb d={`M${fx} ${fy} Q66 58 71 58`} fill={RAMP.bone[1]} width={8} />
        {/* ragged sleeve cuff */}
        <path
          d="M64 53 L69 52 L70 60 L67 62 L65 60 L63 61 Z"
          fill={g.url("mantle")}
          stroke={INK}
          strokeWidth={DETAIL + 0.3}
          strokeLinejoin="round"
        />
        {/* palm up, fingers open */}
        <path
          d="M70 58.5 C70 55 73 54 75.5 55 L78 53 L78.8 54.8 L77 56.3 L79.5 56.5 L79 58.3 L76.5 58.4 C76 61 72 62 70 58.5 Z"
          fill={g.url("skin")}
          stroke={INK}
          strokeWidth={DETAIL + 0.5}
          strokeLinejoin="round"
        />
        <circle
          className="ph-wdn-mote ph-glow"
          cx={75.5}
          cy={49.5}
          r={5}
          fill={g.url("mote")}
        />
        <g className="ph-wdn-mote">
          <path
            d={leafD(1.6)}
            transform={place(73.5, 51, -46)}
            fill="#c9f59b"
          />
        </g>
      </g>
    </HeroFrame>
  );
}
