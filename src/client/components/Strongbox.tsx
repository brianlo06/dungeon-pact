/**
 * The Strongbox.
 *
 * This is authored art rather than a placeholder chest, because the chest was
 * the single most obvious thing undermining the encounter: a mechanic the boss
 * fight is built around was being represented by scenery.
 *
 * It reads as a thing built to hold confiscated power — a riveted vault with a
 * contract seal, chained shut, with a lock per item it has taken. The state is
 * legible before you read the count: empty is dark and quiet, holding glows
 * along its seams and lights a lock for each item, damaged cracks and sparks,
 * broken hangs open with its chains snapped.
 */
export type VaultState = "empty" | "holding" | "damaged" | "broken";

export function Strongbox({
  held,
  state,
  className = "",
}: {
  held: number;
  state: VaultState;
  className?: string;
}) {
  const glow = state === "broken" ? 1 : Math.min(1, held * 0.34);
  return (
    <svg
      className={`vault ${className}`}
      data-state={state}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Strongbox, ${state}, holding ${held}`}
    >
      <defs>
        <linearGradient id="vault-iron" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d7486" />
          <stop offset="0.45" stopColor="#564e61" />
          <stop offset="1" stopColor="#332d3d" />
        </linearGradient>
        <linearGradient id="vault-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9a45d" />
          <stop offset="1" stopColor="#6d5227" />
        </linearGradient>
        <radialGradient id="vault-core">
          <stop offset="0" stopColor="#ffd98a" stopOpacity={glow} />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Pressure from what is inside, leaking through the seams. */}
      <ellipse cx="50" cy="60" rx="48" ry="32" fill="url(#vault-core)" />

      <g className="vault-body">
        {/* It sits on the floor and it is heavy. */}
        <path d="M10 86 H90 L96 96 H4 Z" fill="#221d29" />
        {/* Squat riveted hull — a safe, not a treasure chest. */}
        <rect
          x="10"
          y="40"
          width="80"
          height="48"
          rx="3"
          fill="url(#vault-iron)"
          stroke="#15121c"
          strokeWidth="3"
        />
        {/* Heavy top plate, hinged at the back, thrown open when it breaks. */}
        <g className="vault-lid">
          <rect
            x="8"
            y="28"
            width="84"
            height="15"
            rx="2.5"
            fill="#6f6678"
            stroke="#15121c"
            strokeWidth="3"
          />
          <rect
            x="13"
            y="31"
            width="74"
            height="4"
            fill="#8a8096"
            opacity="0.7"
          />
        </g>
        {/* Gold banding, vertical so the locks sit between the straps. */}
        <g fill="url(#vault-band)">
          <rect x="16" y="40" width="7" height="48" />
          <rect x="77" y="40" width="7" height="48" />
          <rect x="10" y="62" width="80" height="6" />
        </g>
        {/* Rivets along the straps */}
        {[46, 56, 76, 84].map((y) => (
          <g key={y}>
            <circle cx="19.5" cy={y} r="1.5" fill="#2e2738" />
            <circle cx="80.5" cy={y} r="1.5" fill="#2e2738" />
          </g>
        ))}
        {/* The seam the contained power escapes from */}
        <rect className="vault-seam" x="10" y="43" width="80" height="3" />
      </g>

      {/* One lock per item taken. They light as the vault fills. */}
      <g className="vault-locks">
        {[0, 1, 2, 3].map((i) => (
          <g
            key={i}
            className="vault-lock"
            data-lit={i < held ? "" : undefined}
            transform={`translate(${32 + i * 12} 54)`}
          >
            <rect
              x="-4.2"
              y="-3.4"
              width="8.4"
              height="9.4"
              rx="1.3"
              fill="#2c2634"
              stroke="#15121b"
              strokeWidth="1.5"
            />
            <path
              d="M-2.1 -3.4 V-5.8 A2.1 2.1 0 0 1 2.1 -5.8 V-3.4"
              fill="none"
              stroke="#8c7f96"
              strokeWidth="1.6"
            />
            <circle className="vault-lock-eye" cx="0" cy="1.2" r="1.5" />
          </g>
        ))}
      </g>

      {/* Chains: intact while it holds, snapped when it breaks. */}
      <g
        className="vault-chains"
        stroke="#8a7f95"
        strokeWidth="2.4"
        fill="none"
      >
        <path className="chain-left" d="M4 48 Q13 64 6 84" />
        <path className="chain-right" d="M96 48 Q87 64 94 84" />
      </g>

      {/* The creditor's seal. */}
      <g className="vault-seal" transform="translate(50 76)">
        <circle r="6.5" fill="#8a3730" stroke="#3a1512" strokeWidth="1.5" />
        <path d="M-3 -1 L0 -4 L3 -1 L1.6 3 H-1.6 Z" fill="#d9b36a" />
      </g>

      {/* Damage, revealed by state. */}
      <g
        className="vault-cracks"
        stroke="#ffdca0"
        strokeWidth="1.4"
        fill="none"
      >
        <path d="M28 48 L36 62 L31 74" />
        <path d="M72 46 L63 60 L70 76" />
        <path d="M50 46 L50 60" />
      </g>
    </svg>
  );
}
