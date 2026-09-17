import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-cistern.css";

/**
 * A soft plate, set down by the Plate Tender.
 *
 * An object with health, not a creature. A single curved offcut of cistern
 * plate stood on end in the silt, propped by its own bent lip, barnacled up one
 * side and still wet along the top edge where it came out of the water. Weed
 * has already taken the foot. Nothing about it suggests a face or a limb.
 *
 * It is drawn smaller and narrower than the Salvor's plate — a curved leaf on a
 * bent foot, rather than that one's wide riveted slab — so the two objects do
 * not read as the same prop.
 *
 * Rigged as `plate` and `weed`: the plate settles and then tips about where it
 * meets the floor, the weed sways from its root.
 */
const PARTS = ["plate", "weed"] as const;

export function TenderPlate({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  return (
    <svg
      className={`tender-plate cistern-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Soft Plate"
    >
      <defs>
        <linearGradient id="tpl-plate" x1="0.15" y1="0" x2="0.85" y2="0.6">
          <stop offset="0" stopColor="#8e6a49" />
          <stop offset="0.45" stopColor="#5b432c" />
          <stop offset="1" stopColor="#291e18" />
        </linearGradient>
        <linearGradient id="tpl-silt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c4a45" />
          <stop offset="1" stopColor="#14262a" />
        </linearGradient>
      </defs>

      {/* A patch of silt it was pressed into, so it is standing on something. */}
      <ellipse cx="48" cy="93" rx="22" ry="4.6" fill="url(#tpl-silt)" stroke="#171420" strokeWidth="1.8" />

      {/* ---- weed: taken hold at the foot on the party's side ---- */}
      <g ref={hold("weed")} style={{ transformOrigin: "34px 92px" }}>
        <g stroke="#3f6a4c" strokeWidth="3.2" fill="none" strokeLinecap="round">
          <path d="M34 93 C27 84 32 76 26 66" />
          <path d="M40 94 C36 85 41 79 39 70" />
        </g>
        <g stroke="#59895e" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M26 66 C22 62 23 57 27 56" />
          <path d="M39 70 C37 65 40 62 43 62" />
        </g>
      </g>

      {/* ---- plate: a thin sheet stood on end, with its own thickness showing ---- */}
      <g ref={hold("plate")} style={{ transformOrigin: "48px 92px" }}>
        {/* The bent foot it is propped on */}
        <path
          d="M36 86 C30 88 28 92 32 93 L60 92 C62 88 58 85 54 85 Z"
          fill="#3a2b20"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* The face of the sheet: tall, narrow, curved, leaning back a little */}
        <path
          d="M40 32 C50 28 58 31 59 38 C61 52 60 74 57 90 L38 91 C36 74 35 48 40 32 Z"
          fill="url(#tpl-plate)"
          stroke="#171420"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {/* The thickness at the top edge, so it cannot read as a barrel */}
        <path
          d="M40 32 C50 28 58 31 59 38 C55 34 48 33 42 36 Z"
          fill="#c2a279"
          stroke="#171420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path className="cst-wet-line" d="M41 35 C48 31.6 55 32.6 58.4 36.6" strokeWidth="2.4" />
        {/* One fold down the sheet, off centre, and pitting either side of it */}
        <path d="M49 36 C47 54 47 74 49 89" stroke="#2b1f18" strokeWidth="1.8" fill="none" opacity="0.85" />
        <g fill="#2b1f18" opacity="0.7">
          {[
            [44, 48, 1.6],
            [53, 54, 1.3],
            [43, 66, 1.2],
            [52, 74, 1.7],
            [45, 82, 1.3],
          ].map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>
        {/* A rivet line down the near edge: cut from a hull */}
        <g fill="#8d9a9c">
          {[48, 60, 72, 84].map((y) => (
            <circle key={y} cx={39.6 + (y - 48) * 0.02} cy={y} r="1.1" />
          ))}
        </g>
        {/* Barnacles, not yet hard. One breaks each edge of the outline. */}
        <g stroke="#171420" strokeWidth="0.9">
          {[
            [58, 44, 3.4],
            [60, 57, 2.6],
            [37, 68, 2.8],
            [56, 76, 2.4],
          ].map(([x, y, r]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r={r} fill="#cfc6ae" />
              <circle cx={x} cy={y} r={r * 0.42} fill="#3c352c" stroke="none" />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
