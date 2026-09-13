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
/** The face, moved only in an Ultimate close-up (see `CloseUpContext`). */
const FACE_PARTS = ["brow", "eyes", "mouth"] as const;

/**
 * The heaviest face in the party, and the only one wider at the chin than at
 * the temple: the jowls bulge past the cheek line on both sides and the second
 * chin sits straight on the collar, with no neck in between. Kept Dickensian —
 * whiskers, spectacles and a round red nose — and well away from any hooked,
 * money-counting caricature, for the same reason the Miser became a toad.
 */
const FACE =
  "M48 14 C56.5 14 62 17.5 63.3 23.5 C64.5 27 65.5 31 66 35 C67.3 39.5 66 44 61.5 46.5 C57 48.8 50 48.8 44.5 47.5 C38 46.2 33.5 43.5 32.5 38.5 C31.8 34 32.3 28 33.5 24 C35 17.5 40.5 14 48 14 Z";

export function Broker({ unitId, animators, className, viewBox }: HeroProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  // The face only acts in a close-up; in a round it is never registered, so
  // it costs the stage nothing.
  const closeUp = useContext(CloseUpContext);
  const face = useRigParts(unitId, closeUp ? animators : undefined, FACE_PARTS);
  // Held (and so named as parts) only where they are driven, so a round's
  // figure has no part the animator is not writing.
  const facePart = (name: (typeof FACE_PARTS)[number]) => (closeUp ? face(name) : undefined);
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
        <Shade id={g.id("skin")} ramp={RAMP.skinRuddy} />
        <Shade id={g.id("whisker")} ramp={RAMP.silver} />
        <Shade id={g.id("nose")} ramp={["#f6b9a4", "#e2877a", "#a8514b"]} />
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
        <Neck hero="broker" />
        <Tailoring hero="broker" />
        <GearMount anchor="torso" layer="body" x={48} y={57} />
        <GearMount anchor="waist" layer="front" x={42} y={74} />
        <GearMount anchor="shoulderBack" layer="front" x={37} y={49} />
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

      {/* ---- head: flat cap with a quill, spectacles, jowls, mutton chops ---- */}
      <g ref={hold("head")} data-part="head" style={at(...BODY.neck)}>
        <IllustratedHead>
          {/* a pear of a head: narrow at the temple, all jowl at the bottom */}
          <path
            d={FACE}
            fill={g.url("skin")}
            stroke={INK}
            strokeWidth={LINE}
            strokeLinejoin="round"
          />
          {/* jowl creases and the second chin, sitting on the collar */}
          <path
            d="M48.5 45.6 Q56 48 62.5 44.4 M62.8 39.6 Q64.6 42 63.6 44.2"
            stroke={RAMP.skinRuddy[2]}
            strokeWidth={1.1}
            fill="none"
            strokeLinecap="round"
          />
          {/* the port-wine flush on the cheek */}
          <ellipse
            cx={54}
            cy={38}
            rx={3.2}
            ry={2.1}
            fill="#df6f5e"
            opacity={0.38}
          />
          {/* what is left of the hair, grey, under the back of the cap */}
          <path
            d="M34 24.2 C31.8 28 31.6 33.4 33.4 37.2 C35.2 36.4 36.3 34 36.6 31 C36.5 28.4 35.7 26 34 24.2 Z"
            fill={g.url("whisker")}
            stroke={INK}
            strokeWidth={DETAIL}
            strokeLinejoin="round"
          />
          {/* ear */}
          <path
            d="M40.8 27.2 C36.8 26.6 35.8 33 39.6 34.4 C40.8 32.8 41.2 30 40.8 27.2 Z"
            fill={g.url("skin")}
            stroke={INK}
            strokeWidth={DETAIL}
            strokeLinejoin="round"
          />
          {/* mutton chops: tufted, down from the ear and out over the jowl */}
          <path
            d="M41.2 26.6 C43 28.6 44 30.6 44.6 32.6 C45.6 32.8 46 34 45.4 35 C46.8 35.6 47.2 37 46.4 38 C48 38.6 48.6 40.2 47.8 41.4 C49.4 42.2 49.6 44 48.4 45 C47.4 46.6 45.4 46.8 44.2 45.8 C43 47.2 40.6 47.2 39.6 45.8 C38.2 46.6 36 46 35.6 44.4 C34 44.2 33 42.6 33.6 41.2 C32.6 40.4 32.8 39 33.8 38.4 C36.6 37.4 38.6 36 39.8 34.2 C41 32 41.4 29.4 41.2 26.6 Z"
            fill={g.url("whisker")}
            stroke={INK}
            strokeWidth={DETAIL + 0.3}
            strokeLinejoin="round"
          />
          <path
            d="M42.4 31 l1 2 M41.4 36.4 l1.8 1.8 M44.2 39.4 l1.6 1.6 M38 40.6 l2 1.2 M41.6 42.6 l1.8 1.4"
            stroke={RAMP.silver[2]}
            strokeWidth={DETAIL - 0.2}
            strokeLinecap="round"
          />
          {/* spectacles, and small eyes behind them, lids half down */}
          <g stroke={INK} strokeWidth={1.3}>
            <circle
              cx={51.5}
              cy={31.6}
              r={3.5}
              fill="#e8f2ff"
              fillOpacity={0.35}
            />
            <circle
              cx={59.3}
              cy={31.6}
              r={3.1}
              fill="#e8f2ff"
              fillOpacity={0.35}
            />
            <path d="M55 31.4 H56.2 M48 31 L40.8 29.8" fill="none" />
          </g>
          <g ref={facePart("eyes")} style={at(56, 32)}>
            <circle cx={52} cy={32.2} r={1.15} fill={INK} />
            <circle cx={59.8} cy={32.2} r={1} fill={INK} />
            <path
              d="M49.8 31.3 Q52 30.2 54 31.2 M57.9 31.3 Q59.8 30.3 61.6 31.2"
              stroke={INK}
              strokeWidth={1}
              fill="none"
              strokeLinecap="round"
            />
          </g>
          <path
            className="ph-brk-glint"
            d="M49.4 30.1 l2 -1.8 M57.6 30.2 l1.7 -1.5"
            stroke="#ffffff"
            strokeWidth={1}
          />
          {/* a nose with opinions: a round, red, upturned bulb */}
          <path
            d="M58.8 33.6 C60.6 33 62.4 33.3 63.6 33.8 C65.8 32.6 69.4 33.8 69.4 36.8 C69.4 39.6 66.4 40.8 64 39.8 C62.4 40.6 60 40.1 59.5 38.6 C59 37 59.6 35.4 58.8 33.6 Z"
            fill={g.url("nose")}
            stroke={INK}
            strokeWidth={DETAIL + 0.3}
            strokeLinejoin="round"
          />
          <path
            d="M61.2 38.2 C62 39.2 63.1 39.4 64 38.9"
            stroke={RAMP.skinRuddy[2]}
            strokeWidth={0.9}
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={66.2} cy={35.2} r={0.9} fill="#fff3dc" opacity={0.7} />
          <g ref={facePart("mouth")} style={at(59.6, 42.6)}>
            {/* a small mouth pursed under it, very pleased with the deal */}
            <path
              d="M57.2 42.6 Q59.7 43.8 62.1 41.9"
              stroke={INK}
              strokeWidth={1.2}
              fill="none"
              strokeLinecap="round"
            />
          </g>
          <g ref={facePart("brow")} style={at(55.8, 27)}>
            {/* bushy grey brows, just under the brim, over the rims */}
            <path
              d="M48.4 28 C49.8 26 53.6 25.8 55.2 27.4 C53.6 27.6 51 28 48.4 28 Z M57 27.2 C58.6 25.8 61.8 26 63.2 27.7 C61.2 27.6 59 27.7 57 27.2 Z"
              fill={RAMP.silver[0]}
              stroke={INK}
              strokeWidth={DETAIL}
              strokeLinejoin="round"
            />
          </g>
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
          <GearMount anchor="head" layer="front" x={48} y={29} />
        </IllustratedHead>
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
        <BaseWeapon>
          {" "}
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
        </BaseWeapon>
        <GearMount
          anchor="mainHand"
          layer="weapon"
          x={29.5}
          y={61.5}
          rotation={-26}
        />
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
