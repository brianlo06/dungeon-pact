import type { ReactNode } from "react";
import { INK } from "./kit";

/**
 * The party's proportions.
 *
 * Every hero is drawn in the same 100x100 box against the same joints, so a
 * head is a head-shaped thing between y 13 and y 45 in every file. Playtesters
 * called the result chibi, and they were right: a 31-unit head on an 84-unit
 * figure is under three heads tall, which is a mascot, not an adventurer.
 *
 * Re-authoring eight bodies and their mounts was not the cheapest way to fix
 * it. Scaling each head inside its own animated part is: the pivot, the rig
 * and every attachment hierarchy are untouched, the helm and hat mounted
 * inside scale with the head they sit on, and the figure reads at four heads
 * instead of three. What the shrink opens up is a throat, so the party got
 * necks — see `Neck` below, which is why this is not simply a transform.
 */
const HEAD_SCALE = 0.62;
/** How far the crown is lifted after shrinking, to keep the figure tall. */
const HEAD_LIFT = 4;

export function IllustratedHead({ children }: { children: ReactNode }) {
  return (
    <g
      data-art="illustrated-head"
      transform={`translate(48 ${44 - HEAD_LIFT}) scale(${HEAD_SCALE}) translate(-48 -44)`}
    >
      {children}
    </g>
  );
}

/**
 * A throat, between the shrunken head and the shoulders.
 *
 * It belongs to the body rather than the head: a hero who turns their head
 * does not take their neck with them. Each hero's is whatever their collar
 * would be — a gorget, a hood's shadow, bare skin — because the only thing
 * worse than no neck is eight identical ones.
 */
const THROAT: Record<string, string> = {
  vanguard: "#343d4b",
  ranger: "#293d36",
  arcanist: "#1c1827",
  warden: "#2b3d36",
  broker: "#a45f55",
  herald: "#673d27",
  reaver: "#c9a697",
  beguiler: "#352850",
};

export function Neck({ hero }: { hero: string }) {
  return (
    <path
      data-art="throat"
      d="M43 34 H54 L56 49 H41 Z"
      fill={THROAT[hero] ?? "#2a2533"}
      stroke={INK}
      strokeWidth={1.1}
      strokeLinejoin="round"
    />
  );
}

/** Tailored structural planes, mounted on the torso before equipment. */
export function Tailoring({ hero }: { hero: string }) {
  const shapes: Record<string, ReactNode> = {
    vanguard: (
      <>
        <path
          d="M30 49L37 43L47 47L58 43L67 49L61 54L49 51L36 55Z"
          fill="#626c77"
        />
        <path d="M35 54L48 51L61 54L58 66L48 72L37 65Z" fill="#343e4c" />
        <path d="M48 52V68L58 63M48 61L39 57" fill="none" stroke="#b6baa9" />
      </>
    ),
    ranger: (
      <>
        <path
          d="M30 49L38 44L47 49L57 44L66 49L60 57L54 51L48 57L40 51L34 59Z"
          fill="#394a43"
        />
        <path d="M35 53L60 70L57 74L33 58Z" fill="#84705b" />
        <path d="M35 64L41 59L46 64L41 71Z" fill="#242d32" />
        <path d="M52 50L58 47M31 51L36 47" stroke="#99ac8e" />
      </>
    ),
    arcanist: (
      <>
        <path
          d="M29 48L34 39L45 47L58 39L64 48L55 57L47 52L37 59Z"
          fill="#30394c"
        />
        <path d="M44 51L48 73L53 50" fill="#697189" />
        <path d="M47 55L49 60L47 65L45 60Z" fill="#8ad8df" />
        <path d="M34 48L40 53M57 46L53 50" stroke="#bcab7f" />
      </>
    ),
    warden: (
      <>
        <path
          d="M28 51L35 42L40 49L47 42L51 49L61 44L68 53L60 59L53 54L47 61L39 55L31 60Z"
          fill="#5e6655"
        />
        <path
          d="M35 54L39 72L46 77L51 55L58 69L62 55"
          fill="none"
          stroke="#2b3d36"
          strokeWidth="3"
        />
        <path d="M43 56L48 53L52 57L47 64Z" fill="#a4ad88" />
      </>
    ),
    broker: (
      <>
        <path
          d="M27 50L35 44L45 52L55 43L68 49L62 59L55 52L48 70L40 53L32 62Z"
          fill="#453f48"
        />
        <path d="M43 51L47 69L52 50L48 48Z" fill="#a8987e" />
        <path d="M48 53L51 57L48 67L46 57Z" fill="#786854" />
        <path d="M33 65H40V72H33ZM58 63H64V69H58Z" fill="#2a2931" />
      </>
    ),
    herald: (
      <>
        <path
          d="M29 48L35 42L46 49L58 42L66 49L59 56L48 53L35 58Z"
          fill="#88785d"
        />
        <path d="M34 54L56 74L62 69L41 49Z" fill="#593c49" />
        <path d="M40 58L45 55L51 61L47 66Z" fill="#bcaa80" />
        <path d="M59 51L64 47M31 49L36 46" stroke="#d3bc88" />
      </>
    ),
    reaver: (
      <>
        <path
          d="M28 50L32 40L39 47L45 44L50 50L61 42L69 49L64 59L59 52L52 57L40 52L33 58Z"
          fill="#52444b"
        />
        <path d="M36 53L62 65M59 52L36 70" stroke="#302b34" strokeWidth="4" />
        <path d="M44 56L50 54L54 61L49 66L43 61Z" fill="#aa8c79" />
        <path d="M46 57L50 61L46 63" fill="none" stroke="#852f43" />
      </>
    ),
    beguiler: (
      <>
        <path
          d="M28 51L34 38L45 49L58 37L66 50L58 59L48 54L38 61Z"
          fill="#443b54"
        />
        <path d="M44 53L48 75L54 51" fill="#a29a95" />
        <path d="M48 56L52 61L48 68L45 62Z" fill="#465b53" />
        <path d="M32 49L37 53M60 46L55 51" stroke="#9b8aaf" />
      </>
    ),
  };
  return (
    <g
      data-art="tailoring"
      stroke="#171a22"
      strokeWidth="1.1"
      strokeLinejoin="miter"
    >
      {shapes[hero]}
    </g>
  );
}
