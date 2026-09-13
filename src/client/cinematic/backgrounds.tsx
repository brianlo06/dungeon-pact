import type { BackgroundId } from "../../shared/cinematic";

/**
 * The spaces an Ultimate takes place in.
 *
 * None of these exist in the dungeon. Each is what the character's power
 * looks like from inside: the Vanguard's hall where every lantern the guild
 * ever hung is still lit, the Breaker's forge with a vault door in it. They
 * are drawn in the world's 1600×900 units and extend well past it, so a
 * rolled or pulled-back camera never finds an edge.
 *
 * Everything that changes over a shot reads a CSS variable the player writes
 * (`--lit`, `--heat`), so a background is rendered once per shot and never
 * re-rendered while it plays.
 */

const LANTERNS = [
  // depth, x — five ranks of arches receding to the vanishing point
  ...[-3, -2, -1, 0, 1, 2, 3].map((i) => [0, i] as const),
  ...[-3, -2, -1, 1, 2, 3].map((i) => [1, i] as const),
  ...[-2, -1, 1, 2].map((i) => [2, i] as const),
  ...[-2, -1, 1, 2].map((i) => [3, i] as const),
  ...[-1, 1].map((i) => [4, i] as const),
];

/** Perspective: how far into the hall a rank stands, as a scale. */
const depthScale = (d: number) => 1 / (1 + d * 0.62);
const VX = 800;
const VY = 470;

function LanternVault() {
  return (
    <svg className="cine-bg-svg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="lv-depth" cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#3a2612" />
          <stop offset="0.35" stopColor="#1a120b" />
          <stop offset="1" stopColor="#060504" />
        </radialGradient>
        <radialGradient id="lv-lamp">
          <stop offset="0" stopColor="#fff4cf" />
          <stop offset="0.25" stopColor="#ffcf6b" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff9f43" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lv-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#21170e" />
          <stop offset="1" stopColor="#0b0806" />
        </linearGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#lv-depth)" />
      {/* The far wall's sigil: the guild lantern, big enough to be architecture. */}
      <g className="lv-sigil" transform={`translate(${VX} ${VY - 150}) scale(2.4)`}>
        <path d="M0 -60 L32 -28 V26 L0 58 L-32 26 V-28 Z" fill="none" stroke="#6b4a22" strokeWidth="3" />
        <path d="M0 -40 L18 -22 V18 L0 38 L-18 18 V-22 Z" fill="#3a2612" stroke="#8a6230" strokeWidth="2" />
        <circle r="9" fill="#ffcf6b" className="lv-sigil-core" />
      </g>
      {/* Arches, far to near, so the near ones overlap. */}
      {[4, 3, 2, 1, 0].map((d) => {
        const k = depthScale(d);
        const w = 560 * k;
        const h = 900 * k;
        const base = VY + 520 * k;
        return (
          <g key={d} opacity={0.35 + (1 - d / 5) * 0.65}>
            {[-1, 1].map((side) => (
              <path
                key={side}
                d={`M${VX + side * w} ${base} V${base - h * 0.62} Q${VX + side * w} ${base - h} ${VX + side * w * 0.12} ${base - h * 1.04}`}
                fill="none"
                stroke="#2c2016"
                strokeWidth={70 * k}
                strokeLinecap="round"
              />
            ))}
            {[-1, 1].map((side) => (
              <path
                key={`e${side}`}
                d={`M${VX + side * (w - 30 * k)} ${base} V${base - h * 0.6}`}
                stroke="#5a4128"
                strokeWidth={5 * k}
                opacity={0.6}
              />
            ))}
          </g>
        );
      })}
      {/* The floor: a ledger's ruled lines running to the vanishing point. */}
      <path d={`M-800 ${VY + 520} H2400 V1350 H-800 Z`} fill="url(#lv-floor)" />
      {Array.from({ length: 17 }, (_, i) => {
        const x = -800 + i * 200;
        return (
          <path
            key={i}
            d={`M${VX + (x - VX) * 0.12} ${VY + 520 * depthScale(4)} L${x} 1350`}
            stroke="#3b2a1a"
            strokeWidth="3"
            opacity="0.7"
          />
        );
      })}
      {[0, 1, 2, 3, 4].map((d) => (
        <path
          key={d}
          d={`M-800 ${VY + 520 * depthScale(d)} H2400`}
          stroke="#4a3520"
          strokeWidth={4 * depthScale(d)}
          opacity={0.6}
        />
      ))}
      {/* Lanterns. Each lights when `--lit` passes its rank: near first. */}
      {LANTERNS.map(([d, i], n) => {
        const k = depthScale(d);
        const x = VX + i * 180 * k * (d === 0 ? 1.4 : 1.2);
        const y = VY - 90 * k + (Math.abs(i) % 2) * 30 * k;
        const order = (d * 7 + Math.abs(i)) / 34;
        return (
          <g
            key={n}
            className="lv-lantern"
            transform={`translate(${x} ${y}) scale(${k})`}
            style={{ "--order": order } as React.CSSProperties}
          >
            <path d="M0 -90 V-40" stroke="#3a2c1e" strokeWidth="4" />
            <circle className="lv-halo" r="90" fill="url(#lv-lamp)" />
            <path d="M-14 -40 H14 L18 -30 V16 L0 30 L-18 16 V-30 Z" fill="#2a1d12" stroke="#6b4a22" strokeWidth="3" />
            <circle className="lv-flame" r="9" cy="-8" fill="#ffe7a3" />
          </g>
        );
      })}
    </svg>
  );
}

function BreachForge() {
  return (
    <svg className="cine-bg-svg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="bf-heat" cx="0.55" cy="0.62" r="0.7">
          <stop offset="0" stopColor="#5a1a0a" />
          <stop offset="0.4" stopColor="#240a05" />
          <stop offset="1" stopColor="#070303" />
        </radialGradient>
        <linearGradient id="bf-slit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff6a3a" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffb347" />
          <stop offset="1" stopColor="#ff6a3a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#bf-heat)" />
      {/* Riveted plates on the far wall. */}
      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 14 }, (_, col) => (
          <rect
            key={`${row}-${col}`}
            x={-600 + col * 220 + (row % 2) * 110}
            y={-350 + row * 130}
            width="214"
            height="124"
            fill={row % 3 === 1 ? "#1e0d09" : "#170a07"}
            stroke="#2e140c"
            strokeWidth="4"
          />
        )),
      )}
      {/* Furnace slits breathing with `--heat`. */}
      {[-300, 180, 620, 1060, 1500, 1940].map((x, i) => (
        <rect
          key={x}
          className="bf-slit"
          x={x}
          y={60 + (i % 2) * 80}
          width="120"
          height="18"
          rx="6"
          fill="url(#bf-slit)"
          style={{ "--i": i } as React.CSSProperties}
        />
      ))}
      {/* Chains, hanging dead still. */}
      {[-120, 360, 1260, 1760].map((x) => (
        <path key={x} d={`M${x} -450 V${140 + (x % 3) * 40}`} stroke="#2a1510" strokeWidth="14" strokeDasharray="22 10" />
      ))}
      {/* The floor: plates, with the forge light caught in their seams. */}
      <path d="M-800 800 H2400 V1350 H-800 Z" fill="#0d0605" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${-800 + i * 300} 800 L${-1400 + i * 420} 1350`} stroke="#3a150b" strokeWidth="5" />
      ))}
      <path d="M-800 800 H2400" stroke="#ff6a3a" strokeWidth="3" opacity="0.45" className="bf-seam" />
      <path d="M-800 930 H2400" stroke="#6b2412" strokeWidth="4" opacity="0.6" />
    </svg>
  );
}

function PactSigil() {
  return (
    <svg className="cine-bg-svg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="ps-glow" cx="0.5" cy="0.45" r="0.55">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.45" />
          <stop offset="0.45" stopColor="var(--accent)" stopOpacity="0.1" />
          <stop offset="1" stopColor="#050407" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="#050407" />
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#ps-glow)" />
      <g className="ps-ring" transform="translate(800 420)">
        <circle r="360" fill="none" stroke="var(--accent)" strokeOpacity="0.28" strokeWidth="6" />
        <circle r="300" fill="none" stroke="var(--accent)" strokeOpacity="0.18" strokeWidth="26" strokeDasharray="4 30" />
        <circle r="220" fill="none" stroke="var(--accent)" strokeOpacity="0.22" strokeWidth="3" />
      </g>
    </svg>
  );
}

export function Background({ id }: { id: BackgroundId }) {
  switch (id) {
    case "lantern-vault":
      return <LanternVault />;
    case "breach-forge":
      return <BreachForge />;
    case "pact-sigil":
      return <PactSigil />;
    case "void":
      return <div className="cine-bg-void" />;
    default:
      return null;
  }
}
