import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * The moth garden.
 *
 * A night meadow of moonflowers under a moon too big for the sky, with a low
 * line of black hills and nothing to stand behind. The only light is the
 * moon's: a cream disc high on the left with a flat halo, cream on the
 * trumpets of the flowers, and a thin cream edge on the far ground. Figures
 * stand in the flowers' first rank, with more of them behind, smaller and
 * dimmer towards the hills.
 *
 * The world is 1600×900; this is drawn on the 3200×1800 box around it.
 * Everything is flat fills and one small gradient (the halo), and nothing
 * moves: the camera zooms over this drawing, and a box-sized gradient or a
 * moving part would be re-rasterised with every frame.
 */

const HORIZON = 590;
/** The moon: placed so it sits behind the hood's horns in the close-up, and over the Beguiler in the wide. */
const MX = 660;
const MY = 330;

const n1 = (n: number) => n.toFixed(1);

/**
 * One moonflower: a stalk bending up from the ground, a leaf, and on top a
 * trumpet, a short tube flaring into a wide open face tipped up to the moon,
 * with the five creases of its folding drawn on the face.
 */
function flower(x: number, y: number, s: number, lean: number, key: number, light: number) {
  const top = y - 150 * s;
  const tx = x + lean * 40 * s;
  const d = `M${x} ${y} C${n1(x + lean * 8 * s)} ${n1(y - 60 * s)} ${n1(tx - lean * 10 * s)} ${n1(top + 40 * s)} ${n1(tx)} ${n1(top)}`;
  const leaf = `M${n1(x + lean * 4 * s)} ${n1(y - 50 * s)} C${n1(x - 30 * s)} ${n1(y - 70 * s)} ${n1(x - 44 * s)} ${n1(y - 56 * s)} ${n1(x - 50 * s)} ${n1(y - 40 * s)} C${n1(x - 30 * s)} ${n1(y - 44 * s)} ${n1(x - 12 * s)} ${n1(y - 40 * s)} ${n1(x + lean * 4 * s)} ${n1(y - 50 * s)} Z`;
  const fy = top - 26 * s;
  const tube = `M${n1(tx - 4 * s)} ${n1(top)} L${n1(tx - 9 * s)} ${n1(fy + 2 * s)} L${n1(tx + 9 * s)} ${n1(fy + 2 * s)} L${n1(tx + 4 * s)} ${n1(top)} Z`;
  const creases = [0, 1, 2, 3, 4]
    .map((i) => {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      return `M${n1(tx)} ${n1(fy)} L${n1(tx + Math.cos(a) * 24 * s)} ${n1(fy + Math.sin(a) * 9 * s)}`;
    })
    .join(" ");
  return (
    <g key={key}>
      <path d={d} fill="none" stroke="#1b2521" strokeWidth={n1(5 * s)} strokeLinecap="round" />
      <path d={leaf} fill="#17201c" />
      <path d={tube} className="spot-bg-throat" fillOpacity={light} />
      <ellipse cx={n1(tx)} cy={n1(fy)} rx={n1(26 * s)} ry={n1(10 * s)} className="spot-bg-flower" fillOpacity={light} stroke="#0b0714" strokeWidth={n1(2.4 * s)} />
      <path d={creases} fill="none" stroke="#b7ab8a" strokeOpacity={light} strokeWidth={n1(1.6 * s)} />
    </g>
  );
}

function MothGarden() {
  const rand = seeded(41);
  const stars = Array.from({ length: 36 }, () => [-800 + rand() * 3200, -450 + rand() * 900, 1 + rand() * 2.2, 0.15 + rand() * 0.45] as const);
  // Ranks of flowers, far to near: smaller and dimmer towards the hills.
  const ranks = [
    { y: 640, s: 0.34, n: 18, light: 0.28 },
    { y: 700, s: 0.5, n: 14, light: 0.42 },
    { y: 770, s: 0.72, n: 11, light: 0.62 },
    { y: 850, s: 0.95, n: 8, light: 0.8 },
  ];
  const flowers = ranks.flatMap((r, ri) =>
    Array.from({ length: r.n }, (_, i) => {
      const x = -800 + ((i + rand() * 0.8) / r.n) * 3200;
      return flower(Math.round(x), r.y + Math.round((rand() - 0.5) * 30), r.s * (0.85 + rand() * 0.3), (rand() - 0.3) * 1.2, ri * 100 + i, r.light);
    }),
  );
  const grass = Array.from({ length: 90 }, (_, i) => {
    const x = -800 + (i / 90) * 3200 + rand() * 30;
    const y = 660 + rand() * 280;
    const h = 20 + (y - 640) * 0.18 + rand() * 20;
    return `M${x.toFixed(0)} ${y.toFixed(0)} q${(rand() * 10 - 3).toFixed(0)} ${(-h * 0.6).toFixed(0)} ${(rand() * 16 - 4).toFixed(0)} ${(-h).toFixed(0)}`;
  }).join(" ");
  return (
    <svg className="cine-bg-svg spot-bg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="spot-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.3" stopColor="#f3e7c4" stopOpacity="0.2" />
          <stop offset="0.6" stopColor="#c9c0d8" stopOpacity="0.06" />
          <stop offset="1" stopColor="#c9c0d8" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* sky, in flat bands, lightest at the hills */}
      <rect x="-800" y="-450" width="3200" height="1800" fill="#080817" />
      <rect x="-800" y="150" width="3200" height="500" fill="#0c0b20" />
      <rect x="-800" y="380" width="3200" height="300" fill="#121129" />
      <rect x="-800" y="500" width="3200" height="150" fill="#18163a" />
      {stars.map(([x, y, r, o], i) => (
        <circle key={i} cx={x.toFixed(0)} cy={y.toFixed(0)} r={r.toFixed(1)} fill="#f3e7c4" fillOpacity={o.toFixed(2)} />
      ))}

      {/* the moon, high on the left, too big */}
      <circle cx={MX} cy={MY} r="440" fill="url(#spot-halo)" />
      <circle cx={MX} cy={MY} r="150" fill="#f3e7c4" />
      <g transform={`translate(${MX - 300} ${MY - 90})`}>
        <path d="M232 40 C252 12 290 22 292 50 C294 74 262 84 238 76 C214 70 214 58 232 40 Z M320 112 C344 98 380 108 384 136 C388 162 358 180 334 170 C312 160 302 126 320 112 Z M262 150 C276 144 290 154 286 168 C282 182 262 184 252 174 C246 164 252 154 262 150 Z" fill="#d8c79c" fillOpacity="0.55" />
      </g>
      <path d={`M${MX + 106} ${MY - 106} A150 150 0 0 1 ${MX + 106} ${MY + 106}`} fill="none" stroke="#fffaf0" strokeOpacity="0.5" strokeWidth="5" />

      {/* the hills: two low black lines, the far one faintly lit along its crest */}
      <path d={`M-800 ${HORIZON} C-500 ${HORIZON - 70} -200 ${HORIZON - 40} 100 ${HORIZON - 20} C400 ${HORIZON - 5} 700 ${HORIZON - 90} 1100 ${HORIZON - 60} C1500 ${HORIZON - 30} 1900 ${HORIZON - 80} 2400 ${HORIZON - 40} L2400 1350 L-800 1350 Z`} fill="#0e0d1f" />
      <path d={`M-800 ${HORIZON} C-500 ${HORIZON - 70} -200 ${HORIZON - 40} 100 ${HORIZON - 20} C400 ${HORIZON - 5} 700 ${HORIZON - 90} 1100 ${HORIZON - 60} C1500 ${HORIZON - 30} 1900 ${HORIZON - 80} 2400 ${HORIZON - 40}`} fill="none" stroke="#f3e7c4" strokeOpacity="0.14" strokeWidth="3" />
      <path d={`M-800 ${HORIZON + 40} C-300 ${HORIZON + 10} 300 ${HORIZON + 50} 800 ${HORIZON + 20} C1300 ${HORIZON - 10} 1900 ${HORIZON + 40} 2400 ${HORIZON + 10} L2400 1350 L-800 1350 Z`} fill="#0a0916" />

      {/* the meadow */}
      <rect x="-800" y="760" width="3200" height="600" fill="#08070f" />
      <path d={grass} fill="none" stroke="#1a2320" strokeWidth="3" strokeLinecap="round" />
      {flowers}
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "spot-garden": MothGarden,
};
