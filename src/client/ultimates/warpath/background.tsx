import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * The snowfield.
 *
 * Open white ground running to a low horizon at dusk, and nothing on it but
 * drifts. The sky is slate in flat bands, palest in a thin band at the
 * horizon where the last light is; the ground is snow in bands, bluer and
 * greyer towards the horizon and whitest underfoot, crossed by ranks of low
 * wind-carved drifts with their lee sides in blue shadow. A few black stones
 * show through the snow for scale. Nothing here is a wave: the drifts are
 * long, low and flat-backed, carved by wind, not curling.
 *
 * The world is 1600×900; this is drawn on the 3200×1800 box around it, and
 * the ground runs to the bottom of that box, so a camera looking down from
 * high above (the quiet) still sees snow. Everything is flat fills and one
 * horizon glow; nothing moves.
 */

const HORIZON = 470;
const n0 = (n: number) => n.toFixed(0);

/**
 * One drift: a long low hump, sharp on its windward crest and sloping away,
 * with its lee in shadow and a thin bright lip. `s` scales it with distance.
 */
function drift(x: number, y: number, w: number, s: number, key: number) {
  const h = 26 * s;
  const top = `M${n0(x - w / 2)} ${n0(y)} C${n0(x - w * 0.3)} ${n0(y - h * 0.4)} ${n0(x - w * 0.05)} ${n0(y - h)} ${n0(x + w * 0.12)} ${n0(y - h)} L${n0(x + w * 0.16)} ${n0(y - h * 0.82)} C${n0(x + w * 0.3)} ${n0(y - h * 0.3)} ${n0(x + w * 0.4)} ${n0(y - h * 0.08)} ${n0(x + w / 2)} ${n0(y)} Z`;
  const lee = `M${n0(x + w * 0.16)} ${n0(y - h * 0.82)} C${n0(x + w * 0.3)} ${n0(y - h * 0.3)} ${n0(x + w * 0.4)} ${n0(y - h * 0.08)} ${n0(x + w / 2)} ${n0(y)} L${n0(x + w * 0.06)} ${n0(y)} C${n0(x + w * 0.12)} ${n0(y - h * 0.3)} ${n0(x + w * 0.14)} ${n0(y - h * 0.6)} ${n0(x + w * 0.16)} ${n0(y - h * 0.82)} Z`;
  const lip = `M${n0(x - w * 0.34)} ${n0(y - h * 0.32)} C${n0(x - w * 0.15)} ${n0(y - h * 0.8)} ${n0(x + w * 0.02)} ${n0(y - h * 1.02)} ${n0(x + w * 0.13)} ${n0(y - h)}`;
  return (
    <g key={key}>
      <path d={top} className="wp-bg-drift" />
      <path d={lee} className="wp-bg-lee" />
      <path d={lip} className="wp-bg-lip" strokeWidth={(2.6 * s).toFixed(1)} />
    </g>
  );
}

function Snowfield() {
  const rand = seeded(57);
  // Ranks of drifts, far to near: smaller, bluer and closer together towards the horizon.
  const ranks = [
    { y: 505, s: 0.3, n: 16, w: 260 },
    { y: 560, s: 0.48, n: 12, w: 360 },
    { y: 650, s: 0.75, n: 9, w: 520 },
    { y: 790, s: 1.1, n: 7, w: 720 },
    { y: 980, s: 1.5, n: 5, w: 980 },
    { y: 1220, s: 1.9, n: 4, w: 1200 },
  ];
  const drifts = ranks.flatMap((r, ri) =>
    Array.from({ length: r.n }, (_, i) => {
      const x = -800 + ((i + 0.2 + rand() * 0.6) / r.n) * 3200;
      return drift(Math.round(x), r.y + Math.round((rand() - 0.5) * 40 * r.s), r.w * (0.7 + rand() * 0.5), r.s, ri * 100 + i);
    }),
  );
  // Black stones through the snow, for scale.
  const stones = Array.from({ length: 7 }, (_, i) => {
    const y = HORIZON + 20 + rand() ** 1.6 * 820;
    const s = 0.25 + ((y - HORIZON) / 820) * 1.6;
    const x = -800 + rand() * 3200;
    const w = (18 + rand() * 30) * s;
    const h = w * (0.35 + rand() * 0.3);
    return (
      <g key={i}>
        <path d={`M${n0(x - w)} ${n0(y)} C${n0(x - w * 0.8)} ${n0(y - h)} ${n0(x + w * 0.3)} ${n0(y - h * 1.2)} ${n0(x + w)} ${n0(y)} Z`} className="wp-bg-stone" />
        <path d={`M${n0(x - w * 1.2)} ${n0(y)} C${n0(x - w * 0.4)} ${n0(y - h * 0.25)} ${n0(x + w * 0.5)} ${n0(y - h * 0.2)} ${n0(x + w * 1.25)} ${n0(y)} Z`} className="wp-bg-cap" />
      </g>
    );
  });
  return (
    <svg className="cine-bg-svg wp-bg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="wp-horizon-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fa0b1" stopOpacity="0" />
          <stop offset="0.75" stopColor="#b9c5cf" stopOpacity="0.55" />
          <stop offset="1" stopColor="#d6dde3" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {/* the sky: slate in flat bands */}
      <rect x="-800" y="-450" width="3200" height="1800" fill="#121821" />
      <rect x="-800" y="80" width="3200" height="400" fill="#18202b" />
      <rect x="-800" y="260" width="3200" height="220" fill="#212b37" />
      <rect x="-800" y="370" width="3200" height="110" fill="#2d3845" />
      <rect x="-800" y={HORIZON - 150} width="3200" height="152" fill="url(#wp-horizon-glow)" />
      {/* long low clouds, darker than the sky under them */}
      <path d="M-800 150 C-400 120 0 170 500 140 C900 116 1300 160 1800 132 C2100 116 2300 140 2400 130 L2400 190 C1900 200 1400 176 900 196 C400 214 -200 186 -800 206 Z" fill="#0e131b" fillOpacity="0.7" />
      <path d="M-800 300 C-300 280 200 318 700 296 C1100 280 1600 306 2400 286 L2400 318 C1700 334 1200 312 700 330 C200 346 -300 318 -800 332 Z" fill="#141b24" fillOpacity="0.6" />

      {/* the ground: snow in bands, whitest underfoot */}
      <rect x="-800" y={HORIZON} width="3200" height={1350 - HORIZON} fill="#9fb0bf" />
      <rect x="-800" y={HORIZON + 30} width="3200" height={1350 - HORIZON - 30} fill="#b4c2ce" />
      <rect x="-800" y={HORIZON + 110} width="3200" height={1350 - HORIZON - 110} fill="#c8d3dc" />
      <rect x="-800" y={HORIZON + 260} width="3200" height={1350 - HORIZON - 260} fill="#d9e1e7" />
      <rect x="-800" y={HORIZON + 520} width="3200" height={1350 - HORIZON - 520} fill="#e6ecf0" />
      <path d={`M-800 ${HORIZON} H2400`} stroke="#eef2f5" strokeOpacity="0.55" strokeWidth="3" />
      {stones}
      {drifts}
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "warpath-field": Snowfield,
};
