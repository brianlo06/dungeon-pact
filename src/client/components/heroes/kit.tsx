import { RigContext, GearMount } from "../../equipment/Equipment";
import { useId, type ReactNode } from "react";
import type { CreatureProps } from "../../battle/useRigParts";
import "../../creatures-party.css";

/**
 * The party's shared construction.
 *
 * Eight heroes stand in one line, so they have to be built the same way even
 * though no two of them may share a silhouette. Everything that makes them a
 * family lives here rather than in eight copies: the ink, the outline weights,
 * the palette, and the one body they are all drawn on — a head, a chunky
 * trunk and legs planted on the same ground line, facing right, towards
 * whatever they are fighting. The build was big-headed and stubby until a
 * playtest called it chibi; `IllustratedHead` and `BUILD` are where it was
 * taken down, in one place rather than eight.
 *
 * What makes each hero *themselves* is what they wear and carry, and that is
 * the part each file draws: a helm and a shield, a hat and a staff, a banner.
 * So is the face. Three heroes hide theirs — a great helm, a brim, a mask —
 * and the other five each draw their own head, because a shared face made
 * them one person in five costumes. Head shape, jaw, brow, nose, age and skin
 * all differ; the size, the pivot and the ink do not.
 */

/** Every outline in the party is this colour, and nothing else is. */
export const INK = "#171420";
/**
 * Silhouette outline. Heavy enough that a hero still reads at 60px, and no
 * heavier: it was 2.4, which at these proportions drew a sticker rather than
 * an illustration.
 */
export const LINE = 1.7;
/** Interior detail: seams, straps, folds. */
export const DETAIL = 1.3;

/**
 * A shared trim on limbs, hands and legs.
 *
 * Every arm width and mitt radius in the party was drawn for the big-headed
 * build the heads have since left behind, and each is authored per hero. One
 * factor here keeps the differences between them — a Reaver's arms are still
 * thicker than a Beguiler's — while taking the whole line off the toddler
 * proportions the playtest called out.
 */
export const BUILD = 0.85;

/** Three-stop ramps: lit, body, shadow. Shared so the party is one palette. */
export const RAMP = {
  skin: ["#f2c49b", "#d69a70", "#9b6246"],
  skinPale: ["#f3dcc6", "#d9b79c", "#9f7f6c"],
  /*
   * Five more skins, one for each hero whose face shows. They are people from
   * different places and different lives, so they are not one peach: a
   * freckled fair kid, a ruddy pink money-man, a deep umber elder, a warm
   * brown standard-bearer and a cold, pallid northerner. The one brute in
   * the line is the pale one, on purpose — a heavy brow and a snarl on a
   * darker skin is an old caricature, and nothing here should echo it.
   */
  skinFair: ["#f8dcc6", "#ebb49a", "#b4775e"],
  skinRuddy: ["#f7cbb4", "#e09c86", "#a45f55"],
  skinUmber: ["#bc8961", "#8a5a3d", "#523322"],
  skinBrown: ["#d9a076", "#a86a45", "#673d27"],
  skinPallid: ["#ecd8cb", "#c9a697", "#7f5f57"],
  /** Whiskers, brows and beards gone grey. */
  silver: ["#eef0f4", "#c3c5cf", "#858897"],
  leather: ["#a3714a", "#704b31", "#3f2a1d"],
  steel: ["#adb4b8", "#697582", "#343d4b"],
  iron: ["#6f687c", "#4a4456", "#2a2533"],
  gold: ["#f3d487", "#c9973f", "#7d5a23"],
  rust: ["#c4533f", "#8d3027", "#521a17"],
  bone: ["#f1e6cf", "#cdbd9c", "#877a61"],
  sage: ["#8c9d82", "#536958", "#293d36"],
  moss: ["#7d9a52", "#55703a", "#2f4022"],
  blue: ["#8497af", "#465874", "#283448"],
  violet: ["#8e73b4", "#5f4a84", "#352850"],
  crimson: ["#c8414a", "#8c2230", "#4f1320"],
  sickly: ["#c7d98a", "#95ad5b", "#566a32"],
  wood: ["#a57c52", "#76552f", "#46321d"],
} as const;
export type Ramp = readonly [string, string, string];

/**
 * The one body.
 *
 * Coordinates are in the shared 100×100 viewBox. Ground is y 97 at the centre;
 * the top ten units stay clear for intent chips and damage numbers. Every
 * hero's joints sit at the same places, so one rig vocabulary moves all of
 * them sensibly.
 *
 * These joints are load-bearing far beyond the eight hero files: equipment
 * mounts against them, and every piece of gear art is authored around its
 * mount. That is why the proportion pass scaled heads inside their own part
 * and trimmed limbs by a factor, rather than moving the hip or the shoulders.
 * A hero drawn here is still a head-shaped thing between y 13 and y 45 — what
 * changed is the transform it is drawn through.
 */
export const BODY = {
  ground: 97,
  hip: 73,
  /** Where the head pivots. */
  neck: [48, 44] as const,
  /** Shoulder joints. "Back" is away from the enemy, "front" towards it. */
  shoulderBack: [37, 50] as const,
  shoulderFront: [60, 50] as const,
  /** Head centre. */
  head: [48, 29] as const,
};

/** A transform origin in viewBox units, for a part's `style`. */
export const at = (x: number, y: number) => ({
  transformOrigin: `${x}px ${y}px`,
});

/** Per-instance gradient ids, so the same hero twice on a page never collides. */
export function useShades(prefix: string) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `${prefix}${uid}-${name}`;
  return {
    id,
    url: (name: string) => `url(#${id(name)})`,
  };
}

/**
 * A lit-to-shadow ramp. Light comes from the upper left, for everyone.
 *
 * The stops are doubled at each boundary so the ramp bands into three flat
 * planes instead of blending. A gradient reads as rendered plastic; three
 * planes read as a cut-out, which is the direction.
 */
export function Shade({ id, ramp }: { id: string; ramp: Ramp }) {
  return (
    <linearGradient id={id} x1="0.15" y1="0" x2="0.75" y2="1">
      <stop offset="0" stopColor={ramp[0]} />
      <stop offset="0.48" stopColor={ramp[0]} />
      <stop offset="0.49" stopColor={ramp[1]} />
      <stop offset="0.78" stopColor={ramp[1]} />
      <stop offset="0.79" stopColor={ramp[2]} />
      <stop offset="1" stopColor={ramp[2]} />
    </linearGradient>
  );
}

/** The props every hero takes: a creature's, plus a crop for portraits. */
export interface HeroProps extends CreatureProps {
  /** Override the frame, e.g. a head-and-shoulders crop for the party HUD. */
  viewBox?: string;
}

/** The root every hero is drawn in. */
export function HeroFrame({
  id,
  label,
  className = "",
  viewBox = "0 0 100 100",
  children,
}: {
  id: string;
  label: string;
  className?: string;
  viewBox?: string;
  children: ReactNode;
}) {
  return (
    <RigContext.Provider value={id}>
      <svg
        className={`party-hero ph-${id} ${className}`}
        viewBox={viewBox}
        role="img"
        aria-label={label}
        data-hero={id}
      >
        <GearMount anchor="back" layer="back" x={40} y={50} />
        {children}
        <GearMount anchor="root" layer="front" x={50} y={60} />
      </svg>
    </RigContext.Provider>
  );
}

/**
 * A limb: a thick round-capped stroke with an ink outline around it. Drawing
 * arms as strokes rather than shapes is what keeps them chunky and lets them
 * bend with a single control point.
 */
export function Limb({
  d,
  fill,
  width = 7,
}: {
  d: string;
  fill: string;
  width?: number;
}) {
  const w = width * BUILD;
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={INK}
        strokeWidth={w + LINE * 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        stroke={fill}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

/** A hand: a faceted block rather than a ball, cut down with the rest. */
export function Hand({
  x,
  y,
  fill = RAMP.skin[1],
  r = 4,
}: {
  x: number;
  y: number;
  fill?: string;
  r?: number;
}) {
  r *= BUILD;
  return (
    <path
      d={`M${x - r} ${y - r * 0.5}L${x - r * 0.3} ${y - r}L${x + r * 0.8} ${y - r * 0.7}L${x + r} ${y + r * 0.4}L${x} ${y + r}L${x - r} ${y + r * 0.4}Z`}
      fill={fill}
      stroke={INK}
      strokeWidth={LINE}
    />
  );
}

/**
 * The shared legs: two legs and boots with the toes pointing at the enemy.
 * `spread` widens the stance; `lead` pushes the front foot out. They were
 * stubbier and the boots wider, which read as a child in armour once the
 * heads came down; the ground line and the hip are unchanged, so nothing
 * mounted on either has moved.
 */
export function Legs({
  trousers,
  boots,
  spread = 0,
  lead = 0,
  cuff,
}: {
  trousers: string;
  boots: string;
  spread?: number;
  lead?: number;
  /** A band of colour at the top of each boot. */
  cuff?: string;
}) {
  const back = 42 - spread;
  const front = 55 + spread + lead;
  const leg = (x: number) => (
    <path
      d={`M${x - 4.3} ${BODY.hip - 2} H${x + 4.3} L${x + 3.8} 90 H${x - 3.8} Z`}
      fill={trousers}
      stroke={INK}
      strokeWidth={LINE}
      strokeLinejoin="round"
    />
  );
  const boot = (x: number) => (
    <>
      <path
        d={`M${x - 5.2} 86.5 H${x + 4} Q${x + 9} 88 ${x + 9.4} 93 V97 H${x - 5.6} Z`}
        fill={boots}
        stroke={INK}
        strokeWidth={LINE}
        strokeLinejoin="round"
      />
      {cuff && (
        <rect
          x={x - 5.2}
          y={85.5}
          width={9.2}
          height={2.8}
          fill={cuff}
          stroke={INK}
          strokeWidth={DETAIL}
        />
      )}
      {/* A sole, so the boot sits on the floor rather than hovering. */}
      <path d={`M${x - 4.8} 95.7 H${x + 9}`} stroke={INK} strokeWidth={1.5} />
    </>
  );
  return (
    <>
      {leg(back)}
      {leg(front)}
      {boot(back)}
      {boot(front)}
    </>
  );
}

/**
 * The shared head: a big soft block, slightly wider at the jaw on the side the
 * hero is facing. Only the heroes whose faces are hidden use it now; anyone
 * whose face shows draws a head of their own inside the same box.
 */
export const HEAD_PATH =
  "M48 13.5 C58.5 13.5 64.5 20 64.5 29.5 C64.5 39 58.5 44.5 48.5 44.5 C38.5 44.5 32.5 39 32.5 29.5 C32.5 20 37.5 13.5 48 13.5 Z";

export function Head({ fill }: { fill: string }) {
  return <path d={HEAD_PATH} fill={fill} stroke={INK} strokeWidth={LINE} />;
}

/**
 * Eyes, set towards the right of the head so the face reads as turned towards
 * the enemy. The far eye is a touch smaller. `glow` is for faces lost in a
 * hood. Faces that show draw their own eyes, because eyes are most of a face.
 */
export function Eyes({
  x = 53.5,
  y = 31,
  glow,
}: {
  x?: number;
  y?: number;
  glow?: string;
}) {
  if (glow)
    return (
      <g className="ph-glow-eyes" fill={glow}>
        <ellipse cx={x} cy={y} rx={2.1} ry={2.6} />
        <ellipse cx={x + 7} cy={y} rx={1.8} ry={2.3} />
      </g>
    );
  return (
    <g>
      <ellipse cx={x} cy={y} rx={1.9} ry={2.6} fill={INK} />
      <ellipse cx={x + 7} cy={y} rx={1.7} ry={2.4} fill={INK} />
      <circle cx={x - 0.5} cy={y - 1} r={0.7} fill="#fff6e2" />
      <circle cx={x + 6.5} cy={y - 1} r={0.6} fill="#fff6e2" />
    </g>
  );
}

/** A lit edge along the upper left of a form — the house's one highlight. */
export function Lit({ d, width = 1.6 }: { d: string; width?: number }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="#fff3dc"
      strokeWidth={width}
      strokeLinecap="round"
      opacity={0.42}
    />
  );
}

/**
 * The default head-and-shoulders crop, for the small HUD portrait. Retightened
 * when the heads came down: the old frame was built around a head half again
 * this size and now left a portrait mostly of empty air. Wide enough to keep
 * the Arcanist's brim, which is the widest thing any of them wears.
 */
export const PORTRAIT = "28 11 40 40";
