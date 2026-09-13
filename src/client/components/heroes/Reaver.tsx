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
/** The face, moved only in an Ultimate close-up (see `CloseUpContext`). */
const FACE_PARTS = ["brow", "eyes", "mouth"] as const;

/**
 * The broadest face in the party: a low forehead, a brow that sticks out past
 * the nose like a shelf, and a heavy jaw pushed forward under it. Everything
 * the Ranger's face has in the eyes, this one has in the bone. Pallid,
 * weather-beaten skin that burns rather than tans, with the scars standing
 * out pink on it.
 */
const FACE =
  "M47 15 C57 15 63.5 19 64.8 25.5 C65.6 30 66 34.5 66.4 38 C66.8 42.5 63 46.6 56.2 47 C50 47.3 44 46.6 39.6 44.2 C35 41.8 32.8 37 32.8 31 C32.8 21.5 38.5 15 47 15 Z";

export function Reaver({ unitId, animators, className, viewBox }: HeroProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  // The face only acts in a close-up; in a round it is never registered, so
  // it costs the stage nothing.
  const closeUp = useContext(CloseUpContext);
  const face = useRigParts(unitId, closeUp ? animators : undefined, FACE_PARTS);
  // Held (and so named as parts) only where they are driven, so a round's
  // figure has no part the animator is not writing.
  const facePart = (name: (typeof FACE_PARTS)[number]) => (closeUp ? face(name) : undefined);
  const g = useShades("rvr");
  const [bx, by] = BODY.shoulderBack;
  const [fx, fy] = BODY.shoulderFront;
  const wrap = "#e7dcc6";
  /** Old scar tissue, raised and pink against skin that never tans. */
  const scar = "#e59e92";

  return (
    <HeroFrame
      id="reaver"
      label="Reaver"
      className={className}
      viewBox={viewBox}
    >
      <defs>
        <Shade id={g.id("skin")} ramp={RAMP.skinPallid} />
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
          stroke={RAMP.skinPallid[2]}
          strokeWidth={1.2}
          fill="none"
        />
        {/* scars */}
        <path
          d="M52 49 L58 56 M55 59 L60 62 M38 57 L43 61"
          stroke={scar}
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
        <Neck hero="reaver" />
        <Tailoring hero="reaver" />
        <GearMount anchor="torso" layer="body" x={48} y={57} />
        <GearMount anchor="waist" layer="front" x={42} y={74} />
        <GearMount anchor="shoulderBack" layer="front" x={37} y={49} />
      </g>

      {/* ---- head: a heavy brow, a stitched scar, teeth gritted, the mane ---- */}
      <g ref={hold("head")} data-part="head" style={at(...BODY.neck)}>
        <IllustratedHead>
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
          {/* a broad, heavy block of a head, the jaw jutting */}
          <path
            d={FACE}
            fill={g.url("skin")}
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
          {/* stubble over the jaw */}
          <path
            d="M38.5 41 C44 44 50.5 44.6 56.5 44.2 C60.5 43.9 64 42.6 66.3 40.2 C66 44.2 62.4 46.8 56.2 47 C50 47.2 43.8 46.4 39.6 44 Z"
            fill={RAMP.iron[2]}
            opacity={0.28}
          />
          {/* the ear, with a notch taken out of it */}
          <path
            d="M40.4 28.4 L39.2 29.9 L37.8 28.6 C35.4 29.6 35.2 34.4 37.6 36 C38.6 36.7 39.9 36.4 40.6 35.6 Z"
            fill={g.url("skin")}
            stroke={INK}
            strokeWidth={DETAIL}
            strokeLinejoin="round"
          />
          <g ref={facePart("eyes")} style={at(56.5, 32.5)}>
            {/* small eyes, deep in the shadow of the brow, glaring */}
            <path
              d="M47.8 30.2 C52 32.4 58.5 32.4 65 30.6 L64.6 34.2 C58.5 35.2 52.2 34.9 48.4 32.8 Z"
              fill={RAMP.skinPallid[2]}
              opacity={0.65}
            />
            <g stroke={INK} strokeWidth={0.9}>
              <path
                d="M50.6 32.6 Q53.2 31.2 55.8 32.4 Q53.2 33.9 50.6 32.6 Z"
                fill="#f4ecd8"
              />
              <path
                d="M58.2 32.3 Q60.4 31.1 62.6 32.1 Q60.4 33.5 58.2 32.3 Z"
                fill="#f4ecd8"
              />
            </g>
            <circle cx={54} cy={32.6} r={0.95} fill={INK} />
            <circle cx={61.2} cy={32.3} r={0.85} fill={INK} />
          </g>
          <g ref={facePart("brow")} style={at(57, 28.5)}>
            {/* the brow: a shelf of bone that juts past the face */}
            <path
              d="M46 29.2 C49.5 26 57 25.3 62 26 C64.8 26.4 67 27.4 68 29 C67 31 64.4 31.4 61.8 31 C59.4 30.7 57.8 31.4 56.2 31.6 C53 32 49.2 31.4 46 29.2 Z"
              fill={g.url("skin")}
            />
            <path
              d="M49.6 31.1 C52.4 31.9 54.4 31.8 56.2 31.6 C57.8 31.4 59.4 30.7 61.8 31"
              stroke={RAMP.skinPallid[2]}
              strokeWidth={1.1}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M57 25.6 C59 25.6 60.6 25.7 62 26 C64.8 26.4 67 27.4 68 29 C67 31 64.4 31.4 61.8 31"
              stroke={INK}
              strokeWidth={DETAIL + 0.6}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M56.4 31.4 C56.8 30.2 57.6 29.4 58.6 29"
              stroke={RAMP.skinPallid[2]}
              strokeWidth={1}
              fill="none"
              strokeLinecap="round"
            />
            <Lit d="M49 28 Q54 26.2 59 26.4" width={1.3} />
          </g>
          {/* a broad nose, broken and set crooked */}
          <path
            d="M61.8 31.2 C63.6 32 63.4 33.4 64.6 34.4 C66.4 35.4 66.8 37.4 65 38.4 C63.8 39 62.2 38.8 61.2 38.4 C60 38.8 58.8 38.4 58.6 37.4"
            fill={g.url("skin")}
            stroke={INK}
            strokeWidth={DETAIL + 0.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g ref={facePart("mouth")} style={at(58, 40)}>
            {/* teeth gritted, lips pulled back, one of them gone */}
            <path
              d="M50.6 40.6 L53 39.2 H62.6 L64.6 40.4 L62.8 43.6 H53 Z"
              fill="#4a1c20"
              stroke={INK}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
            <path d="M53.2 39.8 H62.2 V41.3 H53.2 Z" fill="#efe6cf" />
            <path d="M53.6 41.7 H61.8 V43 H53.6 Z" fill="#e2d6ba" />
            <rect x={57.2} y={39.8} width={1.2} height={1.5} fill="#4a1c20" />
            <path
              d="M55.4 39.8 V43 M59.8 39.8 V43"
              stroke={INK}
              strokeWidth={0.6}
            />
          </g>
          {/* scars: one down through the eye, stitched; one on the chin */}
          <path
            d="M51 23.5 L58.5 37.2 M57.2 44.2 L60 46.6"
            stroke={scar}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <path
            d="M51 23.5 L58.5 37.2"
            stroke={RAMP.crimson[1]}
            strokeWidth={0.7}
            strokeLinecap="round"
          />
          <path
            d="M51.8 26.3 l1.8 -0.9 M53.4 29.2 l1.8 -0.9 M55.4 32.9 l1.8 -0.9 M56.9 35.6 l1.8 -0.9"
            stroke={INK}
            strokeWidth={0.7}
            strokeLinecap="round"
          />
          {/* the fringe, chopped short above the brow */}
          <path
            d="M38 19 C45 15 56 15 63 21 L61 23.6 L59 21.8 L57 25 L54.5 22 L52 25.4 L49.5 22.3 L46.5 25.4 L44.5 22 L41.6 25 Z"
            fill="#241d26"
            stroke={INK}
            strokeWidth={DETAIL + 0.4}
            strokeLinejoin="round"
          />
          <GearMount anchor="head" layer="front" x={48} y={29} />
        </IllustratedHead>
      </g>

      {/* ---- the fist, up and bandaged ---- */}
      <g ref={hold("fist")} data-part="fist" style={at(fx, fy)}>
        <Limb
          d={`M${fx} ${fy} Q70 60 71 55`}
          fill={RAMP.skinPallid[1]}
          width={8.5}
        />
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
        <BaseWeapon>
          {" "}
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
        </BaseWeapon>
        <GearMount
          anchor="mainHand"
          layer="weapon"
          x={31}
          y={67}
          rotation={-128}
          scale={0.82}
        />
        <Limb
          d={`M${bx} ${by} Q${bx - 5} 60 31.5 66`}
          fill={RAMP.skinPallid[1]}
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
