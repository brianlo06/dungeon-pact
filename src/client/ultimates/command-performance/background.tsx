import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Command Performance's space: a marionette theatre after hours, from the
 * wings.
 *
 * A raked stage of worn boards; a painted backcloth hung from a batten, on
 * which a scene painter has done the dungeon as naive scenery (a round arch,
 * its pillars, stone blocks laid in flat distemper, two torches whose flames
 * are only paint); an oxblood velvet leg hanging at the far side; and, in the
 * wing at the left, the puppeteer's bridge: a plank deck on trestles with a
 * rail, fly lines tied off on its posts, and one work lamp hanging over the
 * stage. Everything the lamp does not reach is umber dark.
 *
 * Drawn on the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). The backcloth's hem meets the boards at world y 660;
 * figures stand on the boards at about y 780–880. The bridge's deck is at
 * world y 420 and runs out to x 520, its rail at y 300. The lamp hangs at
 * (600, 150). Nothing here moves.
 */

const HEM = 660;
const CLOTH = { x0: 440, x1: 2400, top: 40 };
const ARCH = { cx: 1160, spring: 330, r: 290, foot: HEM };
const DECK = { y: 420, x1: 520 };
const RAIL = 300;
const LAMP = { x: 600, y: 150 };
const LEG = 1990;

const f = (n: number) => n.toFixed(0);

/** The painted stone blocks of the arch's pillars and the wall round it. */
const BLOCKS = (() => {
  const rand = seeded(2203);
  const out: { x: number; y: number; w: number; h: number; tone: number }[] = [];
  for (let row = 0; row < 9; row++) {
    const h = 64;
    const y = ARCH.foot - (row + 1) * h;
    let x = CLOTH.x0 + 20 - (row % 2) * 70;
    while (x < CLOTH.x1) {
      const w = 110 + rand() * 60;
      const inside =
        Math.abs(x + w / 2 - ARCH.cx) < ARCH.r - 40 &&
        (y + h > ARCH.spring || Math.hypot(x + w / 2 - ARCH.cx, y + h / 2 - ARCH.spring) < ARCH.r - 40);
      if (!inside) out.push({ x, y, w, h, tone: rand() });
      x += w + 6;
    }
  }
  return out;
})();

/** Plank seams across the boards, closer together upstage. */
const PLANKS = (() => {
  const rand = seeded(918);
  const rows: { y: number; seams: number[] }[] = [];
  let y = HEM;
  let gap = 20;
  while (y < 1350) {
    const seams: number[] = [];
    let x = -800 + rand() * 300;
    while (x < 2400) {
      seams.push(x);
      x += 380 + rand() * 420;
    }
    rows.push({ y, seams });
    y += gap;
    gap *= 1.22;
  }
  return rows;
})();

/** Fly lines: ropes from the dark above, tied off at the bridge rail. */
const LINES = [-620, -470, -300, -160, 20, 150, 290, 410];

function Theatre() {
  return (
    <svg className="cine-bg-svg perf-theatre" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="perf-cloth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c3836" />
          <stop offset="0.45" stopColor="#4d625e" />
          <stop offset="1" stopColor="#3a4a47" />
        </linearGradient>
        <radialGradient id="perf-cloth-pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd9a6" stopOpacity="0.34" />
          <stop offset="0.55" stopColor="#ffb45c" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ffb45c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="perf-board-pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffc88a" stopOpacity="0.36" />
          <stop offset="0.6" stopColor="#c8874a" stopOpacity="0.12" />
          <stop offset="1" stopColor="#c8874a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="perf-boards" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3e2a1c" />
          <stop offset="0.35" stopColor="#4d3421" />
          <stop offset="1" stopColor="#1d130d" />
        </linearGradient>
        <linearGradient id="perf-velvet" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a070c" />
          <stop offset="0.18" stopColor="#5c1420" />
          <stop offset="0.34" stopColor="#35090f" />
          <stop offset="0.52" stopColor="#651826" />
          <stop offset="0.7" stopColor="#300810" />
          <stop offset="0.86" stopColor="#57131e" />
          <stop offset="1" stopColor="#22060a" />
        </linearGradient>
        <radialGradient id="perf-lamp-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1d2" stopOpacity="0.9" />
          <stop offset="0.25" stopColor="#ffb45c" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffb45c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="perf-cone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffcf8f" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffcf8f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="#0e0807" />

      {/* The flies: battens and dark rope. */}
      <g stroke="#1f1510" strokeWidth={26}>
        <path d="M-800 -300 H2400" />
        <path d="M-800 -120 H2400" />
      </g>
      <g stroke="#2e2119" strokeWidth={5}>
        {LINES.map((x) => (
          <path key={x} d={`M${x} -450 V${RAIL + 20}`} />
        ))}
        <path d={`M${LAMP.x} -450 V${LAMP.y - 40}`} />
      </g>

      {/* The backcloth: distemper, hung in soft folds, painted as the dungeon. */}
      <g>
        <rect x={CLOTH.x0} y={CLOTH.top} width={CLOTH.x1 - CLOTH.x0} height={HEM - CLOTH.top} fill="url(#perf-cloth)" />
        <g fill="#1c2524">
          {BLOCKS.map((b, i) => (
            <g key={i}>
              <rect x={f(b.x)} y={f(b.y)} width={f(b.w)} height={f(b.h)} fill={b.tone > 0.6 ? "#5c736e" : b.tone > 0.25 ? "#526763" : "#485c58"} />
              <path d={`M${f(b.x)} ${f(b.y + 5)} H${f(b.x + b.w - 8)}`} stroke="#8da69f" strokeWidth={5} opacity={0.5} />
              <path d={`M${f(b.x + 4)} ${f(b.y + b.h)} H${f(b.x + b.w)} V${f(b.y + 10)}`} stroke="#24302e" strokeWidth={6} fill="none" />
            </g>
          ))}
        </g>
        {/* The arch: its opening painted black-green, a stair painted in it. */}
        <path
          d={`M${ARCH.cx - ARCH.r + 40} ${ARCH.foot} V${ARCH.spring} A${ARCH.r - 40} ${ARCH.r - 40} 0 0 1 ${ARCH.cx + ARCH.r - 40} ${ARCH.spring} V${ARCH.foot} Z`}
          fill="#141b1a"
        />
        <g stroke="#2b3735" strokeWidth={7} fill="none">
          {[0, 1, 2, 3, 4].map((k) => (
            <path key={k} d={`M${ARCH.cx - 150 + k * 30} ${ARCH.foot - 40 - k * 50} H${ARCH.cx + 150 - k * 30}`} />
          ))}
        </g>
        <path
          d={`M${ARCH.cx - ARCH.r} ${ARCH.foot} V${ARCH.spring} A${ARCH.r} ${ARCH.r} 0 0 1 ${ARCH.cx + ARCH.r} ${ARCH.spring} V${ARCH.foot}`}
          fill="none"
          stroke="#8aa39c"
          strokeWidth={14}
          opacity={0.55}
        />
        <path
          d={`M${ARCH.cx - ARCH.r + 40} ${ARCH.foot} V${ARCH.spring} A${ARCH.r - 40} ${ARCH.r - 40} 0 0 1 ${ARCH.cx + ARCH.r - 40} ${ARCH.spring} V${ARCH.foot}`}
          fill="none"
          stroke="#1a2221"
          strokeWidth={18}
        />
        {/* Two painted torches: brackets, and flames that are only paint. */}
        {[ARCH.cx - 520, ARCH.cx + 520].map((x) => (
          <g key={x}>
            <path d={`M${x - 22} 330 h44 l-12 64 h-20 z`} fill="#2a2320" stroke="#141010" strokeWidth={6} />
            <path d={`M${x} 324 C${x - 40} 300 ${x - 20} 250 ${x + 4} 214 C${x + 10} 250 ${x + 44} 280 ${x} 324 Z`} fill="#c7813f" />
            <path d={`M${x + 2} 318 C${x - 16} 300 ${x - 8} 272 ${x + 4} 250 C${x + 8} 276 ${x + 22} 294 ${x + 2} 318 Z`} fill="#e9c27a" />
          </g>
        ))}
        {/* Soft folds in the cloth, and brush streaks. */}
        <g fill="#0a0e0e" opacity={0.2}>
          {[640, 980, 1360, 1740, 2140].map((x, i) => (
            <path key={x} d={`M${x} ${CLOTH.top} C${x + 40} 260 ${x - 30} 460 ${x + 20 + (i % 2) * 20} ${HEM} h60 C${x + 30} 460 ${x + 110} 260 ${x + 70} ${CLOTH.top} Z`} />
          ))}
        </g>
        <rect x={CLOTH.x0 - 260} y={CLOTH.top - 40} width={CLOTH.x1 - CLOTH.x0 + 520} height={60} fill="url(#perf-cloth-pool)" opacity={0} />
        <ellipse cx={1100} cy={420} rx={880} ry={380} fill="url(#perf-cloth-pool)" />
        {/* The batten it hangs from, and the weighted hem. */}
        <path d={`M${CLOTH.x0 - 40} ${CLOTH.top} H${CLOTH.x1}`} stroke="#241810" strokeWidth={34} />
        <path d={`M${CLOTH.x0} ${HEM - 6} H${CLOTH.x1}`} stroke="#1a1310" strokeWidth={16} />
      </g>

      {/* The stage: raked boards, a pool of lamp light, chalk marks for places. */}
      <path d={`M-800 ${HEM} H2400 V1350 H-800 Z`} fill="url(#perf-boards)" />
      <g stroke="#1b120c" strokeWidth={4} fill="none">
        {PLANKS.map((r, i) => (
          <g key={i}>
            <path d={`M-800 ${f(r.y)} H2400`} />
            {r.seams.map((x, j) => (
              <path key={j} d={`M${f(x)} ${f(r.y)} v${f(Math.min(60, 20 * Math.pow(1.22, i)))}`} />
            ))}
          </g>
        ))}
      </g>
      <ellipse cx={1000} cy={830} rx={980} ry={200} fill="url(#perf-board-pool)" />
      <g stroke="#d9cdb6" strokeWidth={6} strokeLinecap="round" opacity={0.3}>
        {[
          [520, 836],
          [820, 848],
          [1120, 842],
          [1400, 832],
        ].map(([x, y]) => (
          <path key={x} d={`M${x - 16} ${y - 7} L${x + 16} ${y + 7} M${x - 16} ${y + 7} L${x + 16} ${y - 7}`} />
        ))}
      </g>
      <path d={`M-800 ${HEM} H2400`} stroke="#0b0706" strokeWidth={8} />

      {/* The velvet leg at the far side, with its gilt edge. */}
      <path d={`M${LEG} -450 H2400 V1350 H${LEG + 30} C${LEG - 10} 900 ${LEG + 20} 300 ${LEG} -450 Z`} fill="url(#perf-velvet)" />
      <path d={`M${LEG} -450 C${LEG + 20} 300 ${LEG - 10} 900 ${LEG + 30} 1350`} stroke="#a57a38" strokeWidth={10} fill="none" opacity={0.7} />

      {/* The wing: a black masking flat, and the puppeteer's bridge. */}
      <path d={`M-800 -450 H${CLOTH.x0 + 10} V1350 H-800 Z`} fill="#0b0605" />
      <g>
        {/* Trestles under the deck. */}
        <g stroke="#1c120c" strokeWidth={22}>
          <path d={`M40 ${DECK.y + 30} L0 ${HEM + 90} M40 ${DECK.y + 30} L90 ${HEM + 90}`} />
          <path d={`M430 ${DECK.y + 30} L390 ${HEM + 90} M430 ${DECK.y + 30} L480 ${HEM + 90}`} />
        </g>
        {/* The deck. */}
        <path d={`M-800 ${DECK.y} H${DECK.x1} V${DECK.y + 34} H-800 Z`} fill="#3a2618" stroke="#130c08" strokeWidth={6} />
        <path d={`M-800 ${DECK.y + 4} H${DECK.x1 - 6}`} stroke="#6e5037" strokeWidth={5} opacity={0.8} />
        {/* The rail, its posts and the lines tied off on them. */}
        <g stroke="#2a1b12" strokeWidth={18}>
          {[-360, 60, 480].map((x) => (
            <path key={x} d={`M${x} ${RAIL} V${DECK.y}`} />
          ))}
        </g>
        <path d={`M-800 ${RAIL} H${DECK.x1 - 20}`} stroke="#3f2a1b" strokeWidth={22} strokeLinecap="round" />
        <path d={`M-800 ${RAIL - 7} H${DECK.x1 - 26}`} stroke="#7a5a3d" strokeWidth={4} opacity={0.7} />
        <g fill="none" stroke="#4a3626" strokeWidth={6}>
          {[-360, 60, 480].map((x) => (
            <path key={x} d={`M${x - 16} ${RAIL + 40} q16 14 32 0 q-16 14 -32 0 m4 22 q12 10 24 0`} />
          ))}
        </g>
      </g>

      {/* The work lamp, hanging over the stage, and the light it throws. */}
      <path d={`M${LAMP.x - 30} ${LAMP.y + 30} L${LAMP.x + 1400} ${HEM + 260} L${LAMP.x + 200} ${HEM + 260} Z`} fill="url(#perf-cone)" />
      <circle cx={LAMP.x} cy={LAMP.y + 26} r={120} fill="url(#perf-lamp-halo)" />
      <path d={`M${LAMP.x - 46} ${LAMP.y + 20} L${LAMP.x - 16} ${LAMP.y - 30} H${LAMP.x + 16} L${LAMP.x + 46} ${LAMP.y + 20} Z`} fill="#231a14" stroke="#0c0806" strokeWidth={5} />
      <ellipse cx={LAMP.x} cy={LAMP.y + 24} rx={24} ry={12} fill="#fff1d2" />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "perf-theatre": () => <Theatre />,
};
