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
/** The face, moved only in an Ultimate close-up (see `CloseUpContext`). */
const FACE_PARTS = ["brow", "eyes", "mouth"] as const;

/**
 * The oldest face in the party: longer than anyone's, the chin running down
 * out of the hood, so there is room for a beard to hang off it.
 */
const FACE =
  "M48 12.5 C58 12.5 64 19 64.2 28.5 C64.5 36 63 43 58.5 47 C55.5 49.5 50 49.5 46 48 C38 45.5 33 39 33 29 C33 19.5 38.5 12.5 48 12.5 Z";

/** A pointed leaf, `r` half its length, in local space. */
const leafD = (r: number) =>
  `M0 0 Q${r} ${-r * 0.75} ${2 * r} 0 Q${r} ${r * 0.75} 0 0 Z`;
/** Transform placing a leaf at (x, y), turned `deg` degrees. */
const place = (x: number, y: number, deg: number) =>
  `translate(${x} ${y}) rotate(${deg})`;

/**
 * One leaf. Declared here rather than inside `Warden`: a component made during
 * render is a new type on every render, so React threw away and rebuilt every
 * leaf each time the fight re-rendered — many times a second in a replay.
 */
function Leaf({
  x,
  y,
  r = 3,
  a = 0,
}: {
  x: number;
  y: number;
  r?: number;
  a?: number;
}) {
  return (
    <path
      d={leafD(r)}
      transform={place(x, y, a)}
      fill={RAMP.moss[0]}
      stroke={INK}
      strokeWidth={0.9}
      strokeLinejoin="round"
    />
  );
}

export function Warden({ unitId, animators, className, viewBox }: HeroProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  // The face only acts in a close-up; in a round it is never registered, so
  // it costs the stage nothing.
  const closeUp = useContext(CloseUpContext);
  const face = useRigParts(unitId, closeUp ? animators : undefined, FACE_PARTS);
  // Held (and so named as parts) only where they are driven, so a round's
  // figure has no part the animator is not writing.
  const facePart = (name: (typeof FACE_PARTS)[number]) => (closeUp ? face(name) : undefined);
  const g = useShades("wdn");
  const [bx, by] = BODY.shoulderBack;
  const [fx, fy] = BODY.shoulderFront;

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
        <Shade id={g.id("skin")} ramp={RAMP.skinUmber} />
        <Shade id={g.id("beard")} ramp={RAMP.silver} />
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
        <BaseWeapon>
          {" "}
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
        </BaseWeapon>
        <GearMount
          anchor="mainHand"
          layer="weapon"
          x={28.5}
          y={61.5}
          rotation={-25}
        />
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
        <Neck hero="warden" />
        <Tailoring hero="warden" />
        <GearMount anchor="torso" layer="body" x={48} y={57} />
        <GearMount anchor="waist" layer="front" x={42} y={74} />
        <GearMount anchor="shoulderBack" layer="front" x={37} y={49} />
      </g>

      {/* ---- head: antlers up through the hood, an old face at peace ---- */}
      <g ref={hold("head")} data-part="head" style={at(...BODY.neck)}>
        <IllustratedHead>
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
          {/* a long, weathered face, the jaw running down into the beard */}
          <path
            d={FACE}
            fill={g.url("skin")}
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
          {/* lines: across the brow, off the eyes, down the cheek */}
          <g
            stroke={RAMP.skinUmber[2]}
            strokeWidth={0.9}
            fill="none"
            strokeLinecap="round"
          >
            <path d="M47 23.6 Q52 22.6 57.5 23.5 M48.5 25.4 Q52.5 24.7 56 25.3" />
            <path d="M49.3 31.2 l-2 -0.9 M49.3 32 l-2.2 0.3 M49.6 32.8 l-1.8 1.3" />
            <path d="M51 34.4 Q53.2 35.4 55.4 34.3 M58.6 34.2 Q60.2 35 61.8 34.1" />
          </g>
          <g ref={facePart("eyes")} style={at(56, 32)}>
            {/* eyes closed, the lids heavy and at rest */}
            <path
              d="M50.3 31.3 Q53 33.8 55.8 31.2 M58.2 31 Q60.1 33.2 62 31"
              stroke={INK}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
              style={closeUp ? { opacity: "calc(1 - var(--wdn-eyes, 0))" } : undefined}
            />
            {/*
             * Open. Drawn only in an Ultimate's close-up, and even there
             * invisible unless the film sets `--wdn-eyes` (Green Reckoning
             * opens them once), so the Warden a round draws is unchanged.
             */}
            {closeUp && (
              <g style={{ opacity: "var(--wdn-eyes, 0)" }}>
                <circle cx={53} cy={31.5} r={4.2} fill={g.url("mote")} opacity={0.75} />
                <circle cx={60.2} cy={31.2} r={3.6} fill={g.url("mote")} opacity={0.65} />
                <path
                  d="M50.1 31.6 Q53 28.7 56 31.4 Q53 34 50.1 31.6 Z M58 31.2 Q60.1 28.9 62.2 31.1 Q60.1 33.3 58 31.2 Z"
                  fill="#effbe0"
                  stroke={INK}
                  strokeWidth={1}
                  strokeLinejoin="round"
                />
                <circle cx={53.3} cy={31.45} r={1.35} fill="#6fcf5a" />
                <circle cx={60.45} cy={31.15} r={1.15} fill="#6fcf5a" />
                <circle cx={53.4} cy={31.45} r={0.55} fill={INK} />
                <circle cx={60.55} cy={31.15} r={0.48} fill={INK} />
              </g>
            )}
          </g>
          {/* a leaf marked on the cheek */}
          <path
            d={leafD(1.6)}
            transform={place(52, 36.4, 20)}
            fill={RAMP.moss[0]}
            opacity={0.9}
          />
          {/* the beard, silver and long, tapering forward onto the mantle */}
          <path
            d="M43.5 36 C46 40.5 50 41.8 53.5 40.8 C56.5 40 59.5 40.6 61.8 39.6 C62.9 39.1 63.6 38.1 64.1 37 C65 42 64 47 61.5 51.5 C59.5 55 57 58 54 60.5 C53 57 50.5 54.5 47.5 52.5 C44 50 42 46 42 41 Z"
            fill={g.url("beard")}
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
          <path
            d="M49.5 44.5 C51 48.5 52.5 52.5 53.5 56.5 M55.5 43.5 C56.8 47.5 56.6 51.5 55.6 55 M60.5 43 C61 46 60.5 49 59.3 51.5"
            stroke={RAMP.silver[2]}
            strokeWidth={DETAIL}
            fill="none"
            strokeLinecap="round"
          />
          <g ref={facePart("mouth")} style={at(59, 41)}>
            {/* a drooping moustache, and a small smile under it */}
            <path
              d="M54.5 39.5 C56.5 37.3 60.5 37 63.6 37.8 C64.6 39 64.4 41 63 42.4 C62 40.6 59.5 39.8 57.3 40.6 C56.3 41 55.2 40.8 54.5 39.5 Z"
              fill={RAMP.silver[0]}
              stroke={INK}
              strokeWidth={DETAIL}
              strokeLinejoin="round"
            />
            <path
              d="M57.5 42.6 Q59.6 43.6 61.6 42.4"
              stroke={INK}
              strokeWidth={1}
              fill="none"
              strokeLinecap="round"
            />
          </g>
          {/* a long straight nose, past the line of the cheek */}
          <path
            d="M62.4 29.8 C63.4 32 65.6 33.6 66.4 35.6 C66.8 37.2 65.2 38 63.6 37.4 C62.8 37.8 61.9 37.5 61.6 36.8"
            fill={g.url("skin")}
            stroke={INK}
            strokeWidth={DETAIL + 0.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g ref={facePart("brow")} style={at(56, 27.5)}>
            {/* white brows, bushy, drooping at the ends */}
            <path
              d="M49 29 C50.2 26.6 54 26 56.3 27.4 C54.8 27.9 53 28 51.6 28.7 C50.6 29.2 49.6 29.6 49 29 Z M58 27.3 C59.6 26 62.3 26.2 63.6 28 C62.2 28 60.4 28.2 59 28.8 C58.3 28.7 57.9 28 58 27.3 Z"
              fill={RAMP.silver[0]}
              stroke={INK}
              strokeWidth={DETAIL}
              strokeLinejoin="round"
            />
          </g>
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
          <GearMount anchor="head" layer="front" x={48} y={29} />
        </IllustratedHead>
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
