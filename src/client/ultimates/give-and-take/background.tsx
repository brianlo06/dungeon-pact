import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Give and Take's space: the gallows crossroads on the chalk down, at night.
 *
 * Two chalk tracks cross on a bare down. One runs away from the lens to a
 * notch in the downs; the other crosses it from side to side. At the crossing
 * a fingerpost leans with two arms pointing opposite ways, their lettering
 * long weathered off. Behind it an empty gibbet stands on a barrow mound, its
 * cage hanging from its chain, and a single thorn is bent flat by the wind.
 * A torn sky with a few hard stars, and a cold band of light low on the
 * horizon. The chalk is the only pale thing; the turf and the downs are ink.
 * Nothing in it is red: red in this film is only ever something running.
 *
 * Drawn on the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). The horizon is at world y 420; the cross track's near
 * edge at y 700 and far edge at y 610, crossing the long track at x 860; the
 * fingerpost stands at (1010, 640). A figure standing on the crossing has its
 * feet on chalk at y 620…700; one in the foreground stands on turf. Nothing
 * here moves: the wind is an effect (`give-wind`).
 */

const HORIZON = 420;
const VP = { x: 900, y: HORIZON };
const CROSS = { near: 700, far: 610, x: 860 };
const POST = { x: 1010, y: 640 };

/** Where the long track's two edges are at a height `y` (it narrows to the notch in the downs). */
const trackAt = (y: number) => {
  const k = (y - VP.y) / (1350 - VP.y);
  return { l: VP.x - 30 - k * 520, r: VP.x + 30 + k * 380 };
};

/** Tufts of turf: short ink blades, denser and bigger near the lens. */
const TUFTS = (() => {
  const rand = seeded(9107);
  return Array.from({ length: 70 }, () => {
    const y = HORIZON + 30 + Math.pow(rand(), 0.7) * 1000;
    const t = trackAt(y);
    let x = -800 + rand() * 3200;
    // Keep the chalk clear.
    if (x > t.l - 20 && x < t.r + 20) x = rand() > 0.5 ? t.l - 60 - rand() * 300 : t.r + 60 + rand() * 300;
    if (y > CROSS.far - 10 && y < CROSS.near + 14) return null;
    const s = 0.4 + ((y - HORIZON) / 1000) * 1.8;
    return { x, y, s, lean: -8 - rand() * 18, n: 3 + Math.floor(rand() * 3) };
  }).filter((x): x is NonNullable<typeof x> => !!x);
})();

/** Flints lying in the chalk. */
const FLINTS = (() => {
  const rand = seeded(4471);
  return Array.from({ length: 36 }, () => {
    const onCross = rand() > 0.55;
    const y = onCross ? CROSS.far + 8 + rand() * (CROSS.near - CROSS.far - 16) : HORIZON + 60 + Math.pow(rand(), 0.8) * 900;
    const t = trackAt(y);
    const x = onCross ? -800 + rand() * 3200 : t.l + 30 + rand() * (t.r - t.l - 60);
    const s = 0.5 + ((y - HORIZON) / 1000) * 2;
    return { x, y, s, r: rand() * 180 };
  });
})();

const STARS = (() => {
  const rand = seeded(313);
  return Array.from({ length: 70 }, () => ({ x: -800 + rand() * 3200, y: -440 + Math.pow(rand(), 1.4) * 760, r: 1.2 + rand() * 2.8, a: 0.35 + rand() * 0.65 }));
})();

function Crossroads() {
  return (
    <svg className="cine-bg-svg give-crossroads" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="give-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#05060c" />
          <stop offset="0.55" stopColor="#0c1020" />
          <stop offset="0.86" stopColor="#1a2433" />
          <stop offset="1" stopColor="#3c4a52" />
        </linearGradient>
        <linearGradient id="give-turf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#10141a" />
          <stop offset="0.4" stopColor="#141a1c" />
          <stop offset="1" stopColor="#0a0c0e" />
        </linearGradient>
        <linearGradient id="give-chalk-long" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6d6a64" />
          <stop offset="0.3" stopColor="#a39d90" />
          <stop offset="1" stopColor="#cfc8b8" />
        </linearGradient>
        <linearGradient id="give-chalk-cross" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5d5a55" />
          <stop offset="0.35" stopColor="#b8b1a2" />
          <stop offset="0.6" stopColor="#d9d3c4" />
          <stop offset="1" stopColor="#6a6660" />
        </linearGradient>
        <radialGradient id="give-glow" cx="0.5" cy="1" r="0.8">
          <stop offset="0" stopColor="#8ea4ab" stopOpacity="0.4" />
          <stop offset="1" stopColor="#8ea4ab" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="give-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07080b" stopOpacity="0" />
          <stop offset="1" stopColor="#07080b" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* The sky: dark overhead, a cold band low down, stars in the gaps of the cloud. */}
      <rect x="-800" y="-450" width="3200" height={HORIZON + 470} fill="url(#give-sky)" />
      <g fill="#dfe7f0">
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x.toFixed(0)} cy={s.y.toFixed(0)} r={s.r.toFixed(1)} opacity={s.a.toFixed(2)} />
        ))}
      </g>
      <path d="M-800 40 C-400 10 -200 90 200 60 C600 30 800 110 1200 70 C1600 30 1900 100 2400 50 L2400 180 C1900 230 1500 150 1100 200 C700 250 400 160 0 210 C-300 250 -600 170 -800 200 Z" fill="#0a0d16" opacity={0.92} />
      <path d="M-800 -260 C-300 -300 100 -220 500 -250 C900 -280 1300 -200 1700 -240 C2000 -270 2200 -220 2400 -250 L2400 -140 C1900 -110 1500 -170 1100 -130 C700 -90 300 -160 -100 -120 C-400 -90 -600 -150 -800 -120 Z" fill="#07090f" opacity={0.95} />
      <ellipse cx={VP.x} cy={HORIZON} rx={1500} ry={200} fill="url(#give-glow)" />

      {/* The downs, far to near. */}
      <path d={`M-800 ${HORIZON - 20} C-500 ${HORIZON - 70} -200 ${HORIZON - 60} 100 ${HORIZON - 30} C400 0 600 ${HORIZON - 10} ${VP.x - 60} ${HORIZON} L${VP.x + 60} ${HORIZON} C1200 ${HORIZON - 30} 1500 ${HORIZON - 80} 1800 ${HORIZON - 60} C2100 ${HORIZON - 40} 2300 ${HORIZON - 50} 2400 ${HORIZON - 40} L2400 700 L-800 700 Z`} fill="#0d1117" />
      <path d={`M-800 ${HORIZON + 30} C-300 ${HORIZON - 10} 200 ${HORIZON + 50} 600 ${HORIZON + 20} C900 ${HORIZON} 1100 ${HORIZON + 40} 1500 ${HORIZON + 10} C1900 ${HORIZON - 20} 2200 ${HORIZON + 30} 2400 ${HORIZON + 20} L2400 1400 L-800 1400 Z`} fill="url(#give-turf)" />

      {/* The long track, from the lens to the notch in the downs, with its ruts. */}
      {(() => {
        const far = trackAt(HORIZON + 4);
        const near = trackAt(1350);
        return (
          <g>
            <path d={`M${far.l} ${HORIZON + 4} L${far.r} ${HORIZON + 4} L${near.r} 1350 L${near.l} 1350 Z`} fill="url(#give-chalk-long)" />
            {[0.28, 0.72].map((u, i) => (
              <path
                key={i}
                d={`M${far.l + (far.r - far.l) * u} ${HORIZON + 4} L${near.l + (near.r - near.l) * u} 1350`}
                stroke="#7d776c"
                strokeWidth={26}
                opacity={0.5}
              />
            ))}
            <path d={`M${far.l} ${HORIZON + 4} L${near.l} 1350 M${far.r} ${HORIZON + 4} L${near.r} 1350`} stroke="#0b0d10" strokeWidth={10} opacity={0.7} />
          </g>
        );
      })()}

      {/* The cross track, side to side. */}
      <path d={`M-800 ${CROSS.far + 12} C0 ${CROSS.far - 4} 1600 ${CROSS.far + 6} 2400 ${CROSS.far - 10} L2400 ${CROSS.near - 4} C1600 ${CROSS.near + 12} 0 ${CROSS.near - 8} -800 ${CROSS.near + 10} Z`} fill="url(#give-chalk-cross)" />
      <path d={`M-800 ${CROSS.far + 38} C0 ${CROSS.far + 24} 1600 ${CROSS.far + 34} 2400 ${CROSS.far + 20} M-800 ${CROSS.near - 26} C0 ${CROSS.near - 40} 1600 ${CROSS.near - 18} 2400 ${CROSS.near - 34}`} stroke="#8b857a" strokeWidth={14} fill="none" opacity={0.45} />
      <path d={`M-800 ${CROSS.far + 12} C0 ${CROSS.far - 4} 1600 ${CROSS.far + 6} 2400 ${CROSS.far - 10} M-800 ${CROSS.near + 10} C0 ${CROSS.near - 8} 1600 ${CROSS.near + 12} 2400 ${CROSS.near - 4}`} stroke="#0b0d10" strokeWidth={8} fill="none" opacity={0.7} />

      {/* Flints in the chalk. */}
      <g fill="#1d1f24">
        {FLINTS.map((f, i) => (
          <path key={i} d="M-6 -2 L-1 -5 L6 -3 L7 2 L1 4 L-5 3 Z" transform={`translate(${f.x.toFixed(0)} ${f.y.toFixed(0)}) rotate(${f.r.toFixed(0)}) scale(${f.s.toFixed(2)})`} />
        ))}
      </g>

      {/* The barrow and the gibbet on it, behind the crossing. */}
      <g transform="translate(1330 520)">
        <path d="M-330 40 C-220 -40 200 -46 330 40 Z" fill="#0b0e13" />
        <path d="M-10 36 L-10 -330 M-10 -318 L150 -318 M-10 -250 L60 -318" stroke="#07080b" strokeWidth={22} strokeLinecap="square" />
        <path d="M-10 -318 L150 -318" stroke="#2a2e36" strokeWidth={4} transform="translate(0 -9)" />
        <path d="M128 -318 L128 -276" stroke="#1a1d23" strokeWidth={4} />
        {/* The cage: iron hoops and bars, empty. */}
        <g transform="translate(128 -276)" fill="none" stroke="#07080b" strokeWidth={7}>
          <path d="M0 0 C-32 6 -40 40 -38 90 C-36 130 -20 150 0 154 C20 150 36 130 38 90 C40 40 32 6 0 0 Z" />
          <path d="M-38 60 C-20 70 20 70 38 60 M-36 118 C-18 128 18 128 36 118 M0 0 L0 154 M-22 8 L-22 148 M22 8 L22 148" strokeWidth={5} />
        </g>
      </g>

      {/* The thorn, bent flat by the wind. */}
      <g transform="translate(250 560)" stroke="#07080b" strokeLinecap="round" fill="none">
        <path d="M0 40 C10 -40 40 -110 150 -150 C240 -180 320 -170 380 -150" strokeWidth={26} />
        <path d="M60 -70 C120 -90 170 -60 230 -80 M120 -130 C150 -190 220 -210 260 -230 M200 -160 C260 -150 300 -120 350 -118 M280 -168 C330 -210 380 -210 420 -200" strokeWidth={10} />
        <path d="M230 -80 C260 -84 290 -70 310 -76 M260 -230 L300 -250 M350 -118 L390 -104" strokeWidth={5} />
      </g>

      {/* The fingerpost at the crossing: two arms, pointing both ways. */}
      <g transform={`translate(${POST.x} ${POST.y}) rotate(-3)`}>
        <ellipse cx={0} cy={4} rx={60} ry={12} fill="#0b0d10" opacity={0.6} />
        <path d="M-9 6 L-7 -300 L9 -300 L10 6 Z" fill="#191c21" stroke="#07080b" strokeWidth={5} />
        <path d="M-7 -300 L0 -318 L9 -300" fill="#191c21" stroke="#07080b" strokeWidth={5} strokeLinejoin="round" />
        {/* The arm pointing left, and the one pointing right, a little lower and askew. */}
        <path d="M-10 -262 L-150 -262 L-176 -246 L-150 -230 L-10 -230 Z" fill="#232730" stroke="#07080b" strokeWidth={5} strokeLinejoin="round" />
        <g transform="rotate(4 10 -206)">
          <path d="M10 -222 L150 -222 L176 -206 L150 -190 L10 -190 Z" fill="#232730" stroke="#07080b" strokeWidth={5} strokeLinejoin="round" />
        </g>
        {/* Letters worn to nothing: a few scratches where they were. */}
        <path d="M-128 -252 l6 12 M-110 -252 l-3 14 M-92 -250 l8 8 M-70 -252 l0 12 M-50 -248 l7 6" stroke="#4b505a" strokeWidth={3} opacity={0.7} />
        <path d="M40 -212 l6 10 M62 -214 l-2 12 M84 -212 l8 8 M106 -210 l0 10" stroke="#4b505a" strokeWidth={3} opacity={0.7} transform="rotate(4 10 -206)" />
        <path d="M-6 -296 L-4 0" stroke="#3a3f48" strokeWidth={3} opacity={0.6} />
      </g>

      {/* Turf in tufts. */}
      <g stroke="#07080b" strokeLinecap="round" fill="none">
        {TUFTS.map((t, i) => (
          <g key={i} transform={`translate(${t.x.toFixed(0)} ${t.y.toFixed(0)}) scale(${t.s.toFixed(2)}) skewX(${t.lean.toFixed(0)})`}>
            {Array.from({ length: t.n }, (_, j) => (
              <path key={j} d={`M${(j - t.n / 2) * 5} 0 Q${(j - t.n / 2) * 6} -14 ${(j - t.n / 2) * 7 + 2} -${22 + (j % 3) * 6}`} strokeWidth={3.2} />
            ))}
          </g>
        ))}
      </g>

      {/* Nearer the lens, darker. */}
      <rect x="-800" y={900} width="3200" height="450" fill="url(#give-near)" />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "give-crossroads": () => <Crossroads />,
};
