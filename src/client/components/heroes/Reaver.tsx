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
/**
 * Parts moved only in an Ultimate close-up (see `CloseUpContext`): the face,
 * and for Red Ledger the bandage soaking through (`stain`) and the stroke the
 * fist wipes across the chest (`entry`). Both of those are drawn outside a
 * clip at rest, so a copy of the figure that no clip drives shows neither.
 * For Give and Take, the one time the fist opens: `palm` (the front arm drawn
 * again over the cleaver, with an open hand at its end), `fingers` (that
 * hand's fingers, curled into a fist or open) and `unwrap` (the bandage coming
 * off it), and on the cleaver `runOut` and `runBack`, blood running along the
 * blade from the hand to the point and back. All are hidden at rest; see
 * `ultimates/give-and-take/poses.ts`.
 */
const FACE_PARTS = [
  "brow",
  "eyes",
  "mouth",
  "stain",
  "entry",
  // Give and Take: the front arm over the blade with its hand opening, the
  // bandage coming off it, and the blood running along the blade both ways.
  "palm",
  "fingers",
  "unwrap",
  "runOut",
  "runBack",
  // Elbow Room: the cleaver hand choked up the grip to the blade's heel, for a swing.
  "choke",
] as const;
/**
 * The chest stroke's axis: where the fist lands under the front shoulder,
 * down across the scar and the strap to the sash. Solved from the fist's arc
 * in `ultimates/red-ledger/poses.ts`; the stroke's own units are 25 long.
 */
const ENTRY = { x: 58.36, y: 47.23, angle: 117.8, along: 0.724, across: 1.25 };
/**
 * One stroke of blood, in its own units (x 0 where the fist lands … 25, 6
 * across): a blunt, flat head where it was pressed on, a solid band dragged
 * most of the way, and two dry-brush tails where it ran out, with one drip
 * and one fleck. Red Ledger draws every stroke in its film from this same
 * shape.
 */
export const ENTRY_STROKE = [
  "M0.5 -2.7 C1 -3.1 2.6 -3.05 4 -3 L17.5 -2.4 L17.2 -0.35 L18.4 0.35 L16.6 1.9 L9 2.6 L3.4 3 C1.7 3.1 0.6 2.9 0.25 2.3 C-0.15 1.2 -0.1 -1.7 0.5 -2.7 Z",
  "M16.8 -2.4 L24.2 -1.7 L24.9 -1.35 L24.1 -1.0 L16.9 -0.8 Z",
  "M17.4 0.9 L21.6 1.15 L22.1 1.45 L21.5 1.7 L16.8 1.9 Z",
  "M4.2 2.9 C4.2 3.6 4 4.3 4 4.8 C4 5.45 4.4 5.8 4.8 5.8 C5.2 5.8 5.6 5.45 5.6 4.8 C5.6 4.3 5.4 3.6 5.4 2.9 Z",
  "M22.9 0.2 a0.45 0.45 0 1 0 0.9 0 a0.45 0.45 0 1 0 -0.9 0 Z",
].join(" ");

/**
 * Give and Take's paint on the cleaver, in the blade's own units (x along the
 * blade from the grip, 8 … 37 at the point; y across it, the spine at −4 and
 * the notched edge at +6 … +11). A run is a glossy ribbon with a swollen head
 * and a highlight, and slides along the blade inside the blade's outline.
 * `RUN_OUT` has its head at x 0 and its body behind it (towards the grip);
 * `RUN_BACK` has its head at x 0 and its body ahead of it (towards the point).
 * At rest both sit well outside the blade (`RUN_REST`), so nothing shows.
 */
export const RUN_REST = 60;
/** The cleaver's blade: a slab, notched along the edge. */
const BLADE =
  "M8 -3 L35 -4.5 L37 3 L36 7.5 L33.5 6 L31 9 L28 7 L25 10 L22 8 L19 11 L16 9 L13 11 L8 9.5 Z";
const RUN_OUT =
  "M-60 5 L-3 4.4 C-1 3.6 1.4 3.8 2.2 5.6 C2.9 7.4 1.4 9 -0.8 9 C-2.2 9 -3.2 8.6 -4.4 8.2 L-60 7.8 Z";
const RUN_BACK =
  "M60 5 L3 4.4 C1 3.6 -1.4 3.8 -2.2 5.6 C-2.9 7.4 -1.4 9 0.8 9 C2.2 9 3.2 8.6 4.4 8.2 L60 7.8 Z";
/**
 * The front arm, opened, in the drawing's units: drawn pointing straight down
 * from the front shoulder (60, 50) and turned by its clip, so the wrist always
 * joins the forearm. The forearm to 61, the palm to 68, the fingers to 75.
 */
const OPEN_PALM =
  "M55.6 60.4 C55.2 63 55.4 66 56 68.4 L64.6 68.4 C65.2 66.2 65.4 63.4 64.8 60.4 Z";
const OPEN_FINGERS = [
  "M56 68.2 L55.4 73.4 C55.3 74.5 56.7 74.7 57 73.6 L58.2 68.4 Z",
  "M58.2 68.4 L58.1 75.6 C58.1 76.8 59.7 76.8 59.8 75.6 L60.3 68.4 Z",
  "M60.3 68.4 L61.2 75.2 C61.4 76.3 62.9 76.1 62.8 75 L62.5 68.4 Z",
  "M62.5 68.4 L64 73.2 C64.4 74.2 65.7 73.8 65.4 72.8 L64.6 68.2 Z",
];
const OPEN_THUMB = "M64.6 62.6 L68.2 66.4 C69 67.2 68.2 68.4 67.2 67.8 L64.2 65.8 Z";

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
        {closeUp && (
          <>
            <clipPath id={g.id("wrap")}>
              <circle cx={71} cy={53} r={4.3} />
            </clipPath>
            {/* One stroke of blood: heavy where the fist lands, dry-brushed thin where it leaves. */}
            <clipPath id={g.id("entry")}>
              <path d={ENTRY_STROKE} />
            </clipPath>
            {/* Elbow Room: the window the hand choked up the grip is slid into. */}
            <clipPath id={g.id("choke")}>
              <rect x={-6} y={-6.5} width={18} height={13} />
            </clipPath>
            {/* Give and Take: the bandage's window and the open hand's. */}
            <clipPath id={g.id("palm-window")}>
              <rect x={-60} y={-60} width={220} height={140} />
            </clipPath>
          </>
        )}
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
        {/* Over whatever the chest wears: the stroke is paint, not a wound. */}
        {closeUp && (
          <g
            transform={`translate(${ENTRY.x} ${ENTRY.y}) rotate(${ENTRY.angle}) scale(${ENTRY.along} ${-ENTRY.across})`}
            clipPath={`url(#${g.id("entry")})`}
          >
            {/* Slid in along the stroke's own axis, so the clip paints it from where the fist lands. */}
            <g ref={facePart("entry")}>
              <rect x={-32} y={-4} width={32} height={11} fill="#b3172f" />
              <path d="M-32 -1.2 H-6 M-28 1.4 H-4" stroke="#e8394f" strokeWidth={0.8} />
              <path d="M-2.5 -4 C-1 -1 -1 3 -2.5 7 H0 V-4 Z" fill="#e8394f" />
            </g>
          </g>
        )}
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
        <g>
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
        {closeUp && (
          <g clipPath={`url(#${g.id("wrap")})`}>
            {/* The bandage soaking through from underneath: below the wrap at rest. */}
            <g ref={facePart("stain")}>
              <g transform="translate(0 12)">
                <path
                  d="M65 52.5 Q67.5 50.2 70 51.6 Q72.6 49.4 75 51.2 Q76.4 52 77 53 L77 69 L65 69 Z"
                  fill="#b3172f"
                />
                <path d="M68 51.5 H74 M67.5 54.5 H74.5" stroke="#6e0f20" strokeWidth={0.9} opacity={0.7} />
              </g>
            </g>
          </g>
        )}
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
            {/* In a close-up, the grip's end showing past the fist that holds it. */}
            {closeUp && (
              <path d="M-8.6 -2.2 H-2 V2.2 H-8.6 C-10 2.2 -10.4 -2.2 -8.6 -2.2 Z" fill={RAMP.leather[2]} stroke={INK} strokeWidth={DETAIL} strokeLinejoin="round" />
            )}
            {/* the blade: a slab, notched along the edge, rust at the spine */}
            <path
              d={BLADE}
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
            {/*
              Elbow Room: the bandaged hand choked up the grip to the blade's
              heel, so a blade swung at full reach sits in the fist. Drawn
              below its window at rest, so no other film and no round shows it.
            */}
            {closeUp && (
              <g clipPath={`url(#${g.id("choke")})`}>
                <g transform="translate(0 40)">
                  <g ref={facePart("choke")}>
                    <rect x={0.5} y={-4.6} width={10} height={9.2} rx={3.6} fill={wrap} stroke={INK} strokeWidth={LINE} />
                    <path d="M4 -4.2 V4.2 M7.2 -4.2 V4.2" stroke={RAMP.bone[2]} strokeWidth={0.9} />
                  </g>
                </g>
              </g>
            )}
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
        {closeUp && (
          <>
            {/*
              Give and Take: blood running along the blade, both ways. Over
              the base cleaver it is clipped to the blade; when a worn weapon
              replaces the cleaver (the base is hidden, and this clip is its
              later sibling) it runs in a band along the same axis instead.
            */}
            <clipPath id={g.id("blade-run")} className="give-run-clip">
              <path d={BLADE} className="give-run-base" />
              <rect x={9} y={3.4} width={26} height={6} rx={2} className="give-run-worn" />
            </clipPath>
            <g transform="translate(31 67) rotate(142)" clipPath={`url(#${g.id("blade-run")})`}>
              {/* Out: the Reaver's scarlet, from the grip to the point. */}
              <g transform={`translate(${-RUN_REST} 0)`}>
                <g ref={facePart("runOut")}>
                  <path d={RUN_OUT} fill="#e8243c" stroke="#5c0a18" strokeWidth={0.7} strokeLinejoin="round" />
                  <path d="M-60 5.7 L-3 5.1 C-1.4 4.6 0 4.8 0.8 5.6" stroke="#ffb3bd" strokeWidth={0.7} fill="none" strokeLinecap="round" />
                </g>
              </g>
              {/* Back: the enemy's garnet, from the point to the grip. */}
              <g transform={`translate(${RUN_REST} 0)`}>
                <g ref={facePart("runBack")}>
                  <path d={RUN_BACK} fill="#7a1030" stroke="#2a0510" strokeWidth={0.7} strokeLinejoin="round" />
                  {/* A lighter core, brightest at the head, so the run reads as moving back towards the hand. */}
                  <path d="M60 6.5 L4 6.3 C2.4 6.2 0.6 6.3 -0.9 6.7" stroke="#c7385f" strokeWidth={1.7} fill="none" strokeLinecap="round" />
                  <path d="M14 6.4 L3 6.3 C1.6 6.2 0.2 6.3 -0.9 6.7" stroke="#f06a92" strokeWidth={1.3} fill="none" strokeLinecap="round" />
                  <path d="M60 5.7 L3 5.1 C1.4 4.6 0 4.8 -0.8 5.6" stroke="#ff8fb0" strokeWidth={0.7} fill="none" strokeLinecap="round" />
                  <ellipse cx={-0.4} cy={5.9} rx={1.2} ry={0.8} fill="#ffe6ee" />
                </g>
              </g>
            </g>
          </>
        )}
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
      {/*
        Give and Take: the front arm, drawn again over the cleaver, because its
        hand is laid on the blade: from the front shoulder, turned by its clip,
        so the hand is always at the end of the arm. The arm the drawing already
        has is hidden while this one plays. Below its window at rest.
      */}
      {closeUp && (
        <g clipPath={`url(#${g.id("palm-window")})`}>
          <g transform="translate(0 60)">
            <g ref={facePart("palm")} style={at(60, 50)}>
              {/* The forearm, from the shoulder, bandaged at the wrist. */}
              <Limb d="M60 50 L60 60" fill={RAMP.skinPallid[1]} width={8.5} />
              <path d="M56.2 57.4 L63.8 57.8 M56 54.6 L64 55" stroke={wrap} strokeWidth={2} />
              {/* The hand: a palm with the cut across it, the thumb, and the fingers that curl and open. */}
              <path d={OPEN_THUMB} fill={g.url("skin")} stroke={INK} strokeWidth={DETAIL} strokeLinejoin="round" />
              <path d={OPEN_PALM} fill={g.url("skin")} stroke={INK} strokeWidth={DETAIL} strokeLinejoin="round" />
              <path d="M57 63.6 L63.6 65.2" stroke="#e8243c" strokeWidth={1.1} strokeLinecap="round" />
              <g ref={facePart("fingers")} style={at(60, 68.4)}>
                {OPEN_FINGERS.map((d, i) => (
                  <path key={i} d={d} fill={g.url("skin")} stroke={INK} strokeWidth={DETAIL} strokeLinejoin="round" />
                ))}
              </g>
              {/* The bandage that was round the fist, coming off over the fingers. */}
              <g ref={facePart("unwrap")} style={at(60, 66)}>
                <path
                  d="M54.6 62.2 C57 61.4 63 61.4 65.8 62.4 L66.2 70.6 C63.4 71.6 57.2 71.6 54.4 70.6 Z"
                  fill={wrap}
                  stroke={INK}
                  strokeWidth={0.9}
                  strokeLinejoin="round"
                />
                <path d="M55 65 H65.8 M54.8 68 H66" stroke={RAMP.bone[2]} strokeWidth={0.8} />
                <path d="M65.8 66 C68.4 68 67.6 72.4 69.6 75.6 L67.8 76.2 C66 73 66.6 69.4 65.4 67.8 Z" fill={wrap} stroke={INK} strokeWidth={0.8} />
                <circle cx={62.6} cy={69.4} r={0.9} fill="#b3172f" />
              </g>
            </g>
          </g>
        </g>
      )}
    </HeroFrame>
  );
}
