import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";

/**
 * The Miser's pit: the cellar under the Counting House, where it keeps what
 * it keeps. Not the Broker's shelves: bare stone walls scratched top to bottom
 * with tally marks — years of counting, in fives — heaps of coin mounded on the
 * floor like spoil, and one lamp hanging on a chain, the only light, so the
 * heaps shine in a pool and the tallies fade into the dark above.
 *
 * Drawn on the 3200×1800 box, world units. The floor is at y 800; the lamp
 * hangs over x 800. Static and unfiltered.
 */
const FLOOR = 800;

function Pit() {
  const rand = seeded(53);
  const tallies = Array.from({ length: 180 }, () => ({
    x: -760 + rand() * 3120,
    y: -420 + rand() * 1160,
    s: 0.6 + rand() * 0.8,
    r: (rand() - 0.5) * 16,
  }));
  const heaps = [
    [-300, 520, 180],
    [260, 700, 240],
    [800, 900, 300],
    [1380, 640, 220],
    [1900, 560, 190],
  ];
  return (
    <svg className="cine-bg-svg mbi-pit" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="mbi-lamp" cx="0.5" cy="0.42" r="0.5">
          <stop offset="0" stopColor="#ffcf73" stopOpacity={0.42} />
          <stop offset="0.45" stopColor="#b8742a" stopOpacity={0.16} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="mbi-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0808" />
          <stop offset="1" stopColor="#1f1814" />
        </linearGradient>
        <linearGradient id="mbi-heap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c99a3e" />
          <stop offset="0.5" stopColor="#7a5a24" />
          <stop offset="1" stopColor="#2e2112" />
        </linearGradient>
      </defs>
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#mbi-wall)" />
      {/* Courses of stone. */}
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={`M-800 ${-400 + i * 80} H2400`} stroke="#0c0a09" strokeWidth={5} opacity={0.8} />
      ))}
      {/* Tally marks: fours struck through, scratched everywhere. */}
      {tallies.map((t, i) => (
        <g key={i} transform={`translate(${t.x} ${t.y}) rotate(${t.r}) scale(${t.s})`} stroke="#6e5a42" strokeWidth={4} strokeLinecap="round" opacity={0.55}>
          <path d="M0 0 V40 M12 0 V40 M24 0 V40 M36 0 V40 M-6 30 L44 8" />
        </g>
      ))}
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#mbi-lamp)" />
      {/* The lamp on its chain. */}
      <path d="M800 -450 V60" stroke="#2a211c" strokeWidth={6} strokeDasharray="12 6" />
      <path d="M770 60 H830 L840 110 H760 Z" fill="#3a2c1e" stroke="#171420" strokeWidth={5} />
      <ellipse cx={800} cy={116} rx={30} ry={10} fill="#ffd98a" opacity={0.9} />
      {/* The floor, and the heaps on it. */}
      <path d={`M-800 ${FLOOR} H2400 V1350 H-800 Z`} fill="#141009" />
      {heaps.map(([x, w, h], i) => (
        <g key={i}>
          <path d={`M${x - w / 2} ${FLOOR + 30} Q${x} ${FLOOR - h} ${x + w / 2} ${FLOOR + 30} Z`} fill="url(#mbi-heap)" stroke="#171420" strokeWidth={5} />
          {Array.from({ length: 14 }, (_, k) => {
            const u = (k + 0.5) / 14;
            const cx = x - w / 2 + u * w;
            const cy = FLOOR + 30 - Math.sin(u * Math.PI) * (h + 30) * 0.9 + (k % 3) * 8;
            return <ellipse key={k} cx={cx} cy={cy} rx={11} ry={4} fill="#e2b95a" opacity={0.55} />;
          })}
        </g>
      ))}
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "msr-pit": () => <Pit />,
};
