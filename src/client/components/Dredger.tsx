import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-cistern.css";

/**
 * The Dredger.
 *
 * A salvage machine for hauling things out of water, so the whole figure is
 * built to resist a pull: bow legs wide on flat pad feet, a squat riveted drum
 * of a hull, a winch spool bolted to the far shoulder, and no head to speak of
 * — just a grated slot sunk between the shoulders. Off its near arm runs a
 * heavy chain with a salvage hook on the end, lying slack on the floor where it
 * drags.
 *
 * Silhouette: a wide A of legs under a barrel, with a chain sagging away on the
 * party's side and the hook breaking the outline at the bottom left. Beside the
 * Plate Tender it is the braced one; beside the Bulwark it has no plate at all.
 *
 * Rigged as `legs`, `body`, `arm`, `head` and `chain`. The chain swings about
 * the fist that holds it, the arm about its shoulder.
 */
const PARTS = ["legs", "body", "arm", "head", "chain"] as const;

/** Links along the drag, from the fist down to the hook. */
const LINKS: [number, number, number][] = [
  [28, 63, -58],
  [25, 68, -64],
  [23, 73, -70],
  [21, 78, -78],
  [20, 83, -86],
];

export function Dredger({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  return (
    <svg
      className={`dredger cistern-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Dredger"
    >
      <defs>
        <linearGradient id="drd-hull" x1="0.12" y1="0" x2="0.72" y2="1">
          <stop offset="0" stopColor="#6e7d80" />
          <stop offset="0.48" stopColor="#3b4548" />
          <stop offset="1" stopColor="#181e20" />
        </linearGradient>
        <linearGradient id="drd-rust" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#8f6a44" />
          <stop offset="0.6" stopColor="#59402a" />
          <stop offset="1" stopColor="#2a1f17" />
        </linearGradient>
        <linearGradient id="drd-limb" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#4c8a82" />
          <stop offset="0.55" stopColor="#27554f" />
          <stop offset="1" stopColor="#102b29" />
        </linearGradient>
      </defs>

      {/* ---- legs: bowed out wide, standing on flat pads ---- */}
      <g ref={hold("legs")} style={{ transformOrigin: "52px 90px" }}>
        <g fill="url(#drd-limb)" stroke="#171420" strokeWidth="2.4" strokeLinejoin="round">
          <path d="M42 68 C31 73 26 83 27 92 L40 92 C39 84 42 76 48 71 Z" />
          <path d="M66 68 C77 73 82 83 81 92 L68 92 C69 84 66 76 60 71 Z" />
        </g>
        {/* Knee pistons, so the bow reads as engineered rather than lame */}
        <g stroke="#7d8a8c" strokeWidth="2.2">
          <path d="M35 78 L31 86" />
          <path d="M73 78 L77 86" />
        </g>
        <g fill="url(#drd-hull)" stroke="#171420" strokeWidth="2.4" strokeLinejoin="round">
          <path d="M18 97 Q18 90 26 90 L42 90 L42 97 Z" />
          <path d="M66 97 L66 90 L82 90 Q90 90 90 97 Z" />
        </g>
        <path d="M21 94 H40 M68 94 H87" stroke="#8d9a9c" strokeWidth="1.3" />
      </g>

      {/* ---- head: a grated slot, sunk between the shoulders ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "48px 40px" }}>
        {/* A cowl, not a box: the crown slopes back off the visor. */}
        <path
          d="M36 40 C36 32 42 27 50 28 L58 31 L57 44 L37 46 Z"
          fill="url(#drd-hull)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <rect x="36" y="35" width="15" height="7" rx="1.4" fill="#0e1618" stroke="#171420" strokeWidth="1.6" />
        <g stroke="#5c6a6c" strokeWidth="1.3">
          <path d="M40 35.4 V41.6 M44 35.2 V41.4 M48 35 V41.2" />
        </g>
        <circle className="drd-lamp" cx="38.5" cy="38.6" r="1.6" />
        <g fill="#9aa6a8">
          <circle cx="45" cy="31" r="1.1" />
          <circle cx="54" cy="33" r="1.1" />
        </g>
      </g>

      {/* ---- body: the drum, and the winch spool on the far shoulder ---- */}
      <g ref={hold("body")} style={{ transformOrigin: "54px 76px" }}>
        <path
          d="M34 74 C29 60 33 46 50 43 C67 40 77 49 78 62 C79 72 74 79 68 81 L40 82 Z"
          fill="url(#drd-hull)"
          stroke="#171420"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Riveted banding round the drum */}
        <g>
          <path d="M32 58 C48 54 66 55 78 59" stroke="#171420" strokeWidth="3.4" fill="none" />
          <path d="M33 70 C49 66 67 67 78 70" stroke="#171420" strokeWidth="3.4" fill="none" />
          <path d="M32 58 C48 54 66 55 78 59" stroke="#5d6a6c" strokeWidth="1.6" fill="none" />
          <path d="M33 70 C49 66 67 67 78 70" stroke="#5d6a6c" strokeWidth="1.6" fill="none" />
        </g>
        <g fill="#9aa6a8">
          {[38, 48, 58, 68].map((x, i) => (
            <circle key={x} cx={x} cy={[56.3, 54.6, 55, 56.4][i]} r="1.1" />
          ))}
        </g>
        {/* A rust bloom across the hull, and a wet run beneath it */}
        <path d="M56 60 C64 58 70 62 70 68 C64 72 56 70 54 66 Z" fill="url(#drd-rust)" opacity="0.9" />
        <path className="cst-wet-line" d="M36 50 C46 46 58 46 66 49" strokeWidth="2" />
        {/* Winch spool, bolted low on the shoulder away from the party, so it
         * reads as fitted to the hull rather than as a second head. */}
        <g stroke="#171420" strokeWidth="2.4" strokeLinejoin="round">
          <path d="M70 40 L88 44 L88 58 L72 56 Z" fill="#3f4a4d" />
        </g>
        <circle cx="80" cy="49" r="5" fill="url(#drd-rust)" stroke="#171420" strokeWidth="2" />
        <g stroke="#1d2427" strokeWidth="1.5" fill="none">
          <path d="M75 49 H85" />
          <path d="M80 44 V54" />
        </g>
        <path d="M70 46 C64 47 60 50 58 54" stroke="#171420" strokeWidth="3.6" fill="none" strokeLinecap="round" />
        <path d="M70 46 C64 47 60 50 58 54" stroke="#7d8a8c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>

      {/* ---- arm: the near arm, out and down, gripping the chain ---- */}
      <g ref={hold("arm")} style={{ transformOrigin: "46px 50px" }}>
        <path
          d="M48 44 C40 46 34 52 30 58 L34 64 C40 62 46 56 50 50 Z"
          fill="url(#drd-limb)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* Pulley at the elbow, where the winch line turns */}
        <circle cx="35" cy="54" r="3.4" fill="#4a5254" stroke="#171420" strokeWidth="1.8" />
        {/* The fist: a closed clamp, not a hand */}
        <path
          d="M32 56 C25 55 22 60 24 65 C27 69 33 69 35 66 Z"
          fill="#3f4a4d"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M26 60 H33 M26 64 H33" stroke="#7d8a8c" strokeWidth="1.4" />
      </g>

      {/* ---- chain: slack off the fist, hook dragging on the floor ---- */}
      <g ref={hold("chain")} style={{ transformOrigin: "28px 62px" }}>
        <g fill="none" stroke="#171420" strokeWidth="2">
          {LINKS.map(([x, y, a]) => (
            <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="3.8" ry="2.3" fill="#6b7578" transform={`rotate(${a} ${x} ${y})`} />
          ))}
        </g>
        {/* The hook: heavy and barbed, breaking the outline at the bottom left */}
        <path
          d="M18 84 L18 93 C9 94 3 87 4 79 C5 72 12 69 16 74 C10 77 9 84 13 87 Z"
          fill="url(#drd-rust)"
          stroke="#171420"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path d="M13 90 C8 88 6 82 8 78" stroke="#c0a077" strokeWidth="1.8" fill="none" />
        <path d="M15 72 L20 77" stroke="#171420" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
