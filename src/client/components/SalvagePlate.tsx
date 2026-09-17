import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-salvor.css";

/**
 * A soft plate, grown by the Salvor.
 *
 * A patch of rusted hull plate still wet from the pool, its edges soft with
 * weed and silt, a few young barnacles not yet set. It is an object: it does
 * not act, it settles — and next round it hardens onto the Salvor unless
 * someone tears it off first.
 *
 * Rigged as `plate` and `weed`.
 */
const PARTS = ["plate", "weed"] as const;

export function SalvagePlate({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  return (
    <svg
      className={`salvage-plate ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Soft Plate"
    >
      <defs>
        <linearGradient id="slp-rust" x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#8a6450" />
          <stop offset="0.6" stopColor="#5a4033" />
          <stop offset="1" stopColor="#30231e" />
        </linearGradient>
      </defs>
      <g ref={hold("weed")} style={{ transformOrigin: "50px 90px" }}>
        <path d="M24 92 C20 80 28 74 24 62 M78 92 C84 80 74 72 80 60" stroke="#3f6a4c" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <g ref={hold("plate")} style={{ transformOrigin: "50px 92px" }}>
        <path
          d="M22 36 L50 26 L80 38 L76 90 L26 92 Z"
          fill="url(#slp-rust)"
          stroke="#171420"
          strokeWidth="2.4"
        />
        {/* The wet, soft edge that gives it away. */}
        <path className="slp-wet" d="M24 40 L50 30 L78 42" stroke="#9fd8d0" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {[
          [30, 46], [70, 48], [30, 84], [70, 84],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.8" fill="#b89a6a" stroke="#171420" strokeWidth="0.8" />
        ))}
        <path d="M34 60 H66 M36 72 H64" stroke="#30231e" strokeWidth="1.6" opacity="0.8" />
        {[
          [46, 56], [58, 66], [42, 78],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.6" fill="#d8d0bc" stroke="#171420" strokeWidth="0.9" opacity="0.8" />
        ))}
      </g>
    </svg>
  );
}
