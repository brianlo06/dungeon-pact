import { useId, type ReactNode } from "react";
import type { CreatureProps } from "../../battle/useRigParts";
import "../../creatures-party.css";

/**
 * The party's shared construction.
 *
 * Eight heroes stand in one line, so they have to be built the same way even
 * though no two of them may share a silhouette. Everything that makes them a
 * family lives here rather than in eight copies: the ink, the outline weights,
 * the palette, and the one body they are all drawn on — a big head, a short
 * chunky trunk and stubby legs planted on the same ground line, facing right,
 * towards whatever they are fighting.
 *
 * What makes each hero *themselves* is what they wear and carry, and that is
 * the part each file draws: a helm and a shield, a hat and a staff, a banner.
 */

/** Every outline in the party is this colour, and nothing else is. */
export const INK = "#171420";
/** Silhouette outline. Chunky, so a hero still reads at 60px. */
export const LINE = 2.4;
/** Interior detail: seams, straps, folds. */
export const DETAIL = 1.3;

/** Three-stop ramps: lit, body, shadow. Shared so the party is one palette. */
export const RAMP = {
  skin: ["#f2c49b", "#d69a70", "#9b6246"],
  skinPale: ["#f3dcc6", "#d9b79c", "#9f7f6c"],
  leather: ["#a3714a", "#704b31", "#3f2a1d"],
  steel: ["#d4d1dc", "#9893a6", "#57526a"],
  iron: ["#6f687c", "#4a4456", "#2a2533"],
  gold: ["#f3d487", "#c9973f", "#7d5a23"],
  rust: ["#c4533f", "#8d3027", "#521a17"],
  bone: ["#f1e6cf", "#cdbd9c", "#877a61"],
  sage: ["#9bb279", "#6c8552", "#3d4f31"],
  moss: ["#7d9a52", "#55703a", "#2f4022"],
  blue: ["#7d9bd6", "#4f6aa8", "#2c3a66"],
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
 * the top ten units stay clear for intent chips and damage numbers. The head
 * is roughly a third of the figure's height — the chunky big-head build the
 * art direction asks for — and every hero's joints sit at the same places, so
 * one rig vocabulary moves all of them sensibly.
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

/** A lit-to-shadow ramp. Light comes from the upper left, for everyone. */
export function Shade({ id, ramp }: { id: string; ramp: Ramp }) {
  return (
    <linearGradient id={id} x1="0.15" y1="0" x2="0.75" y2="1">
      <stop offset="0" stopColor={ramp[0]} />
      <stop offset="0.5" stopColor={ramp[1]} />
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
    <svg
      className={`party-hero ph-${id} ${className}`}
      viewBox={viewBox}
      role="img"
      aria-label={label}
      data-hero={id}
    >
      {children}
    </svg>
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
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={INK}
        strokeWidth={width + LINE * 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        stroke={fill}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

/** A mitt. Hands are big and round, like everything else on these people. */
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
  return (
    <circle cx={x} cy={y} r={r} fill={fill} stroke={INK} strokeWidth={LINE} />
  );
}

/**
 * The shared legs: two stubby legs and chunky boots with the toes pointing
 * at the enemy. `spread` widens the stance; `lead` pushes the front foot out.
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
  const back = 41 - spread;
  const front = 56 + spread + lead;
  const leg = (x: number) => (
    <path
      d={`M${x - 5.2} ${BODY.hip - 2} H${x + 5.2} L${x + 4.6} 89 H${x - 4.6} Z`}
      fill={trousers}
      stroke={INK}
      strokeWidth={LINE}
      strokeLinejoin="round"
    />
  );
  const boot = (x: number) => (
    <>
      <path
        d={`M${x - 6.5} 85.5 H${x + 5} Q${x + 11.5} 87 ${x + 12} 92.5 V97 H${x - 7} Z`}
        fill={boots}
        stroke={INK}
        strokeWidth={LINE}
        strokeLinejoin="round"
      />
      {cuff && (
        <rect
          x={x - 6.5}
          y={84.5}
          width={11.5}
          height={3}
          fill={cuff}
          stroke={INK}
          strokeWidth={DETAIL}
        />
      )}
      {/* A sole, so the boot sits on the floor rather than hovering. */}
      <path d={`M${x - 6} 95.6 H${x + 11.5}`} stroke={INK} strokeWidth={1.6} />
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
 * hero is facing. Headgear is drawn over it by each hero.
 */
export const HEAD_PATH =
  "M48 13.5 C58.5 13.5 64.5 20 64.5 29.5 C64.5 39 58.5 44.5 48.5 44.5 C38.5 44.5 32.5 39 32.5 29.5 C32.5 20 37.5 13.5 48 13.5 Z";

export function Head({ fill }: { fill: string }) {
  return <path d={HEAD_PATH} fill={fill} stroke={INK} strokeWidth={LINE} />;
}

/**
 * Eyes, set towards the right of the head so the face reads as turned towards
 * the enemy. The far eye is a touch smaller. `glow` is for faces lost in a
 * hood; `lids` is for eyes half-closed.
 */
export function Eyes({
  x = 53.5,
  y = 31,
  glow,
  lids,
}: {
  x?: number;
  y?: number;
  glow?: string;
  lids?: boolean;
}) {
  if (glow)
    return (
      <g className="ph-glow-eyes" fill={glow}>
        <ellipse cx={x} cy={y} rx={2.1} ry={2.6} />
        <ellipse cx={x + 7} cy={y} rx={1.8} ry={2.3} />
      </g>
    );
  if (lids)
    return (
      <g stroke={INK} strokeWidth={1.6} strokeLinecap="round" fill="none">
        <path d={`M${x - 2} ${y} Q${x} ${y + 1.4} ${x + 2} ${y}`} />
        <path d={`M${x + 5.3} ${y} Q${x + 7.1} ${y + 1.3} ${x + 8.7} ${y}`} />
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

/** The default head-and-shoulders crop, for the small HUD portrait. */
export const PORTRAIT = "24 9 52 52";
