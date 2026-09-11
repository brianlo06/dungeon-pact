import { useRigParts, type CreatureProps } from "../battle/useRigParts";

/**
 * The Kiln Mender.
 *
 * A support creature, and deliberately not a cute one. It is a forge surgeon:
 * a bellows sac for a body, a flue venting off its back, and long instrument
 * limbs ending in heated clamps. When it repairs something it should look like
 * it is welding the thing shut rather than blessing it.
 *
 * Silhouette: a small swollen body carried high on thin legs, with three
 * splayed instrument arms breaking the outline at different angles and a flue
 * raked off the back. Nothing about the outline is symmetrical, and nothing
 * about it is round enough to read as friendly.
 */
const PARTS = [
  "bellows",
  "armA",
  "armB",
  "armC",
  "head",
  "flue",
  "legs",
] as const;

export function Mender({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  /** One instrument limb: thin, jointed, ending in a heated clamp. */
  const limb = (d: string, cx: number, cy: number, rotate: number) => (
    <>
      <path d={d} fill="none" stroke="#57506040" strokeWidth="6" />
      <path d={d} fill="none" stroke="#6b6376" strokeWidth="3" />
      <g transform={`translate(${cx} ${cy}) rotate(${rotate})`}>
        <path
          d="M-1 0 L-7 -6 M-1 0 L-7 6"
          stroke="#8f8699"
          strokeWidth="2.6"
          fill="none"
        />
        <circle className="mnd-tip" cx="-7" cy="0" r="2.6" />
      </g>
    </>
  );

  return (
    <svg
      className={`mender ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Kiln Mender"
    >
      <defs>
        <linearGradient id="mnd-sac" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#8a7f5e" />
          <stop offset="0.5" stopColor="#5f5740" />
          <stop offset="1" stopColor="#33301f" />
        </linearGradient>
        <linearGradient id="mnd-iron" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#5a5464" />
          <stop offset="1" stopColor="#2a2632" />
        </linearGradient>
      </defs>

      {/* ---- legs: thin, too long, holding the body up and forward ---- */}
      <g
        ref={hold("legs")}
        style={{ transformOrigin: "50px 72px" }}
        stroke="#4e4757"
        strokeWidth="3"
        fill="none"
      >
        <path d="M44 70 L38 88 L30 94" />
        <path d="M56 70 L62 88 L70 94" />
        <path d="M50 72 L50 90 L50 95" strokeWidth="2.4" />
      </g>

      {/* ---- flue: raked off the back, always venting ---- */}
      <g ref={hold("flue")} style={{ transformOrigin: "62px 44px" }}>
        <path
          d="M60 44 L74 18 L82 22 L68 48 Z"
          fill="url(#mnd-iron)"
          stroke="#171420"
          strokeWidth="2"
        />
        <ellipse className="mnd-vent" cx="78" cy="18" rx="5.5" ry="3.2" />
      </g>

      {/* ---- bellows: the body, and it breathes ---- */}
      <g ref={hold("bellows")} style={{ transformOrigin: "50px 56px" }}>
        <path
          d="M50 32 C64 32 70 44 68 56 C66 68 58 74 50 74 C42 74 34 68 32 56 C30 44 36 32 50 32 Z"
          fill="url(#mnd-sac)"
          stroke="#191508"
          strokeWidth="2.5"
        />
        {/* Ribbing, so it reads as a bellows rather than a belly */}
        <g stroke="#2b2718" strokeWidth="1.8" fill="none" opacity="0.8">
          <path d="M34 46 Q50 52 66 46" />
          <path d="M33 55 Q50 61 67 55" />
          <path d="M35 64 Q50 69 65 64" />
        </g>
        {/* Heat seams glowing through the hide */}
        <g className="mnd-seam" stroke="#ff9a42" strokeWidth="1.6" fill="none">
          <path d="M40 40 Q46 48 42 58" />
          <path d="M60 42 Q55 50 59 60" />
        </g>
      </g>

      {/* ---- three instrument limbs, splayed at different angles ---- */}
      <g ref={hold("armA")} style={{ transformOrigin: "38px 46px" }}>
        {limb("M38 46 Q22 44 14 32", 14, 32, 150)}
      </g>
      <g ref={hold("armB")} style={{ transformOrigin: "36px 58px" }}>
        {limb("M36 58 Q18 62 8 56", 8, 56, 186)}
      </g>
      <g ref={hold("armC")} style={{ transformOrigin: "40px 66px" }}>
        {limb("M40 66 Q26 78 16 78", 16, 78, 200)}
      </g>

      {/* ---- head: small, lensed, hooded by a heat shield ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "48px 30px" }}>
        <path
          d="M40 30 Q40 16 50 14 Q60 16 60 30 Z"
          fill="url(#mnd-iron)"
          stroke="#171420"
          strokeWidth="2"
        />
        {/* A single working lens rather than a face */}
        <circle
          cx="47"
          cy="24"
          r="4.4"
          fill="#241f2b"
          stroke="#8f8699"
          strokeWidth="1.6"
        />
        <circle className="mnd-lens" cx="47" cy="24" r="2" />
        {/* Feed pipes into the sac */}
        <g stroke="#4e4757" strokeWidth="2.4" fill="none">
          <path d="M44 30 V36" />
          <path d="M55 30 V36" />
        </g>
      </g>
    </svg>
  );
}
