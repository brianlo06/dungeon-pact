import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Red Ledger's space: the pit the Reaver was paid to bleed in.
 *
 * A round floor of sand at the bottom of a shaft, one hole of white sky a long
 * way up, and one hard pool of light on the sand under it. Around the floor, a
 * palisade of sharpened stakes lashed together, lit only where the pool
 * reaches; everywhere the light does not reach is black. The sand is scuffed
 * and trodden, and nothing in it is red: red in this film is only ever what
 * was paid.
 *
 * Drawn on the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). The foot of the palisade is at world y 600 and the pool
 * is centred at (800, 790), so a standing figure's feet are on lit sand and
 * its head is cut against the dark stakes. Nothing here moves.
 */

const FOOT = 600;
const POOL = { x: 800, y: 790, rx: 980, ry: 230 };

/** The palisade, stake by stake: nearer the pool's middle, the more light on it. */
const STAKES = (() => {
  const rand = seeded(1477);
  const out: { x: number; w: number; top: number; lean: number; lit: number }[] = [];
  let x = -820;
  while (x < 2440) {
    const w = 30 + rand() * 26;
    const top = 150 + rand() * 120 + Math.abs(x - POOL.x) * 0.06;
    const lit = Math.max(0, 1 - Math.abs(x + w / 2 - POOL.x) / 900);
    out.push({ x, w, top, lean: (rand() - 0.5) * 3, lit });
    x += w + 2 + rand() * 6;
  }
  return out;
})();

/** Scuffs and footprints in the sand. */
const SCUFFS = (() => {
  const rand = seeded(311);
  return Array.from({ length: 46 }, () => {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    return {
      x: POOL.x + Math.cos(a) * POOL.rx * 0.9 * r,
      y: POOL.y + Math.sin(a) * POOL.ry * 0.85 * r,
      w: 14 + rand() * 40,
      turn: (rand() - 0.5) * 40,
    };
  });
})();

function Pit() {
  return (
    <svg className="cine-bg-svg ledger-pit" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="ledger-pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#efe2c6" />
          <stop offset="0.42" stopColor="#d8c49f" />
          <stop offset="0.72" stopColor="#6d5a42" />
          <stop offset="1" stopColor="#140e0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ledger-shaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff8ea" stopOpacity="0.4" />
          <stop offset="0.5" stopColor="#fff4de" stopOpacity="0.1" />
          <stop offset="1" stopColor="#fff4de" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="ledger-wall-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070506" />
          <stop offset="0.55" stopColor="#070506" stopOpacity="0.2" />
          <stop offset="1" stopColor="#070506" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="ledger-wall-light" cx="0.5" cy="1" r="0.62">
          <stop offset="0" stopColor="#b59c78" stopOpacity="0.5" />
          <stop offset="1" stopColor="#b59c78" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="#070506" />

      {/* The hole far above, and the light coming down out of it. */}
      <ellipse cx={POOL.x} cy={-330} rx={210} ry={60} fill="#f6efe2" />
      <ellipse cx={POOL.x} cy={-330} rx={250} ry={80} fill="none" stroke="#1c1512" strokeWidth={30} />

      {/* The palisade. */}
      <g>
        {STAKES.map((s, i) => {
          const tip = s.top - s.w * 0.9;
          const face = `M${s.x} ${FOOT + 20} L${s.x} ${s.top} L${s.x + s.w / 2} ${tip} L${s.x + s.w} ${s.top} L${s.x + s.w} ${FOOT + 20} Z`;
          const shade = s.x + s.w / 2 < POOL.x ? 1 : -1;
          return (
            <g key={i} transform={`rotate(${s.lean.toFixed(2)} ${s.x + s.w / 2} ${FOOT})`}>
              <path d={face} fill={s.lit > 0.2 ? "#2a1f19" : "#161010"} stroke="#060404" strokeWidth={4} strokeLinejoin="round" />
              {s.lit > 0.05 && (
                <path
                  d={shade > 0 ? `M${s.x + s.w * 0.62} ${s.top} L${s.x + s.w} ${s.top} L${s.x + s.w} ${FOOT + 20} L${s.x + s.w * 0.7} ${FOOT + 20} Z` : `M${s.x} ${s.top} L${s.x + s.w * 0.38} ${s.top} L${s.x + s.w * 0.3} ${FOOT + 20} L${s.x} ${FOOT + 20} Z`}
                  fill="#8a7358"
                  opacity={(s.lit * 0.55).toFixed(2)}
                />
              )}
            </g>
          );
        })}
      </g>
      {/* Two lashings of rope round the palisade. */}
      <path d={`M-800 ${FOOT - 110} Q800 ${FOOT - 80} 2400 ${FOOT - 110}`} stroke="#3b2c20" strokeWidth={10} fill="none" />
      <path d={`M-800 ${FOOT - 290} Q800 ${FOOT - 262} 2400 ${FOOT - 290}`} stroke="#2b2018" strokeWidth={8} fill="none" />
      <rect x="-800" y="-450" width="3200" height={FOOT + 250} fill="url(#ledger-wall-fade)" />
      <ellipse cx={POOL.x} cy={FOOT} rx={1100} ry={420} fill="url(#ledger-wall-light)" />

      {/* The floor: dark sand, and the one pool of light on it. */}
      <path d={`M-800 ${FOOT} H2400 V1350 H-800 Z`} fill="#140e0b" />
      <path d={`M-800 ${FOOT} H2400`} stroke="#050303" strokeWidth={10} />
      <ellipse cx={POOL.x} cy={POOL.y} rx={POOL.rx} ry={POOL.ry} fill="url(#ledger-pool)" />
      <g fill="none" stroke="#8c7654" strokeWidth={4} strokeLinecap="round" opacity={0.55}>
        {SCUFFS.map((s, i) => (
          <path key={i} d={`M${-s.w / 2} 0 Q0 ${-s.w * 0.12} ${s.w / 2} 0`} transform={`translate(${s.x.toFixed(0)} ${s.y.toFixed(0)}) rotate(${s.turn.toFixed(1)})`} />
        ))}
      </g>

      {/* The shaft of light, over everything, down onto the pool. */}
      <path d={`M${POOL.x - 210} -330 L${POOL.x + 210} -330 L${POOL.x + POOL.rx * 0.62} ${POOL.y} L${POOL.x - POOL.rx * 0.62} ${POOL.y} Z`} fill="url(#ledger-shaft)" />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "ledger-pit": () => <Pit />,
};
