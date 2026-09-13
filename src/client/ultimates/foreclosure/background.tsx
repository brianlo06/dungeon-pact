import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Foreclosure's space: the Broker's repossession vault.
 *
 * A counting house after hours. Shelving to the ceiling on every side, and on
 * every shelf something that used to stand between somebody and harm — round
 * shields, kite shields, helms, a crown, a cartwheel, a lute, a strongroom
 * door — each hung with a paper price tag on a red string. One banker's lamp
 * with a green glass shade hangs over a green baize floor, and brass is the
 * only warm colour in the room: it is the Broker's.
 *
 * Drawn on the 3200×1800 box of the other backgrounds. The floor meets the
 * shelving at world y 640, a little under a standing figure's knees, so a
 * figure is framed by shelves rather than cut against a horizon; the lamp's
 * pool is centred at x 800. Nothing here moves or re-renders while a shot
 * plays, and nothing is filtered: the light is gradients.
 */

const FLOOR = 640;
const INK = "#06100b";
const ITEM = "#1a2c22";
const EDGE = "#5d6a4c";
const TAG = "#e6d8b2";
const STRING = "#8a2c23";

type Kind = "round" | "kite" | "helm" | "crown" | "wheel" | "lute" | "chest" | "bell" | "door";

/** One piece of collateral, standing on its shelf at (0, 0), about 100 high. */
function Item({ kind }: { kind: Kind }) {
  switch (kind) {
    case "round":
      return (
        <>
          <circle cy={-50} r={48} fill={ITEM} stroke={INK} strokeWidth={5} />
          <circle cy={-50} r={36} fill="none" stroke={EDGE} strokeWidth={3} opacity={0.5} />
          <circle cy={-50} r={10} fill={EDGE} opacity={0.7} />
        </>
      );
    case "kite":
      return <path d="M0 -118 L44 -100 L38 -44 L0 0 L-38 -44 L-44 -100 Z" fill={ITEM} stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
    case "helm":
      return (
        <>
          <path d="M-36 0 V-52 Q-36 -98 0 -98 Q36 -98 36 -52 V0 H16 V-38 H-16 V0 Z" fill={ITEM} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M-26 -60 H26" stroke={INK} strokeWidth={7} />
          <path d="M-30 -80 Q0 -94 30 -80" stroke={EDGE} strokeWidth={3} fill="none" opacity={0.5} />
        </>
      );
    case "crown":
      return (
        <>
          <path d="M-46 0 V-52 L-28 -30 L-13 -68 L0 -36 L13 -68 L28 -30 L46 -52 V0 Z" fill={ITEM} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M-40 -14 H40" stroke={EDGE} strokeWidth={4} opacity={0.6} />
        </>
      );
    case "wheel":
      return (
        <g transform="translate(0 -58)">
          <circle r={54} fill="none" stroke={INK} strokeWidth={16} />
          <circle r={54} fill="none" stroke={ITEM} strokeWidth={9} />
          <path d="M-54 0 H54 M0 -54 V54 M-38 -38 L38 38 M38 -38 L-38 38" stroke={ITEM} strokeWidth={7} />
          <circle r={12} fill={EDGE} opacity={0.6} />
        </g>
      );
    case "lute":
      return (
        <g transform="rotate(-18)">
          <ellipse cy={-36} rx={30} ry={38} fill={ITEM} stroke={INK} strokeWidth={5} />
          <path d="M-5 -70 L-4 -140 H6 L5 -70 Z" fill={ITEM} stroke={INK} strokeWidth={4} />
          <circle cy={-40} r={8} fill={INK} />
        </g>
      );
    case "chest":
      return (
        <>
          <path d="M-52 0 V-52 Q0 -86 52 -52 V0 Z" fill={ITEM} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M-52 -50 H52 M-30 0 V-66 M30 0 V-66" stroke={INK} strokeWidth={5} />
          <rect x={-8} y={-50} width={16} height={18} fill={EDGE} opacity={0.7} />
        </>
      );
    case "bell":
      return (
        <>
          <path d="M-40 0 Q-40 -16 -30 -24 Q-26 -80 0 -84 Q26 -80 30 -24 Q40 -16 40 0 Z" fill={ITEM} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M-34 -14 H34" stroke={EDGE} strokeWidth={3} opacity={0.5} />
        </>
      );
    case "door":
      return (
        <>
          <path d="M-42 0 V-118 Q-42 -150 0 -150 Q42 -150 42 -118 V0 Z" fill={ITEM} stroke={INK} strokeWidth={6} />
          <path d="M-42 -40 H42 M-42 -100 H42" stroke={INK} strokeWidth={6} />
          <circle cx={26} cy={-72} r={6} fill={EDGE} />
        </>
      );
  }
}

const KINDS: Kind[] = ["round", "kite", "helm", "crown", "wheel", "lute", "chest", "bell", "kite", "round", "helm"];

interface Placed {
  x: number;
  y: number;
  kind: Kind;
  scale: number;
  tag: number;
}

/** The shelving: bays between uprights, rows of shelves, a piece or two in each. */
function stock() {
  const rand = seeded(2207);
  const items: Placed[] = [];
  const bays: number[] = [];
  for (let x = -780; x < 2400; x += 250) bays.push(x);
  const rows = [-270, -80, 110, 300, 480];
  for (const bx of bays)
    for (const [r, y] of rows.entries()) {
      // The row under the lamp stays emptier, so figures read against it.
      if (r >= 3 && bx > 380 && bx < 1100 && rand() < 0.6) continue;
      const n = 1 + Math.floor(rand() * 2);
      for (let i = 0; i < n; i++) {
        const kind = r === 4 && rand() < 0.25 ? "door" : KINDS[Math.floor(rand() * KINDS.length)];
        items.push({
          x: bx + 60 + (i + 0.2 + rand() * 0.5) * (130 / n),
          y,
          kind,
          scale: (kind === "door" ? 0.95 : 0.7 + rand() * 0.35) * (r === 4 ? 1.1 : 1),
          tag: (rand() - 0.5) * 24,
        });
      }
    }
  return { bays, rows, items };
}
const STOCK = stock();

function Vault() {
  const { bays, rows, items } = STOCK;
  return (
    <svg className="cine-bg-svg fc-vault" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="fc-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#040a07" />
          <stop offset="0.35" stopColor="#0b1812" />
          <stop offset="0.6" stopColor="#12241a" />
          <stop offset="1" stopColor="#0a150f" />
        </linearGradient>
        <radialGradient id="fc-pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3d487" stopOpacity="0.34" />
          <stop offset="0.45" stopColor="#c9a95c" stopOpacity="0.14" />
          <stop offset="1" stopColor="#c9a95c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fc-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dc98" stopOpacity="0.3" />
          <stop offset="0.7" stopColor="#f3d487" stopOpacity="0.08" />
          <stop offset="1" stopColor="#f3d487" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fc-baize" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b3a28" />
          <stop offset="0.3" stopColor="#10261a" />
          <stop offset="1" stopColor="#040a06" />
        </linearGradient>
        <linearGradient id="fc-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f5a37" />
          <stop offset="1" stopColor="#0c2e1a" />
        </linearGradient>
        <radialGradient id="fc-dark" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0.35" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#fc-wall)" />
      {/* The shelving. */}
      <g className="fc-shelves">
        {rows.map((y) => (
          <g key={y}>
            <rect x="-800" y={y} width="3200" height="18" fill="#21160e" />
            <path d={`M-800 ${y + 1.5} H2400`} stroke="#6e5a33" strokeWidth="3" opacity="0.45" />
            <rect x="-800" y={y + 18} width="3200" height="10" fill="#050a07" opacity="0.6" />
          </g>
        ))}
        {bays.map((x) => (
          <g key={x}>
            <rect x={x - 12} y="-450" width="24" height={FLOOR + 450} fill="#1a110a" />
            <path d={`M${x - 10} -450 V${FLOOR}`} stroke="#5c4a2a" strokeWidth="3" opacity="0.35" />
          </g>
        ))}
        {items.map((it, i) => (
          <g key={i} transform={`translate(${it.x.toFixed(1)} ${it.y}) scale(${it.scale.toFixed(3)})`}>
            <Item kind={it.kind} />
            {/* Its tag, on a red string off the top. */}
            <g transform={`translate(22 ${it.kind === "door" ? -150 : -96}) rotate(${it.tag.toFixed(1)})`}>
              <path d="M0 0 Q8 16 4 34" stroke={STRING} strokeWidth="2.5" fill="none" />
              <path d="M-9 34 H17 V64 L4 72 L-9 64 Z" fill={TAG} opacity="0.78" stroke={INK} strokeWidth="2" />
            </g>
          </g>
        ))}
      </g>
      {/* The lamp's light on the stock, then the dark coming in from the sides. */}
      <path d="M690 -70 L910 -70 L1650 700 L-50 700 Z" fill="url(#fc-cone)" />
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#fc-dark)" />
      {/* The baize floor, and the lamp's pool on it. */}
      <rect x="-800" y={FLOOR} width="3200" height={1350 - FLOOR} fill="url(#fc-baize)" />
      <path d={`M-800 ${FLOOR} H2400`} stroke="#6b5530" strokeWidth="5" opacity="0.7" />
      <g stroke="#0a1a10" strokeWidth="3" opacity="0.7">
        {Array.from({ length: 15 }, (_, i) => {
          const x = -800 + i * 230;
          return <path key={i} d={`M${800 + (x - 800) * 0.6} ${FLOOR} L${800 + (x - 800) * 2.2} 1350`} />;
        })}
      </g>
      <ellipse cx="800" cy={FLOOR + 110} rx="980" ry="190" fill="url(#fc-pool)" />
      {/* The banker's lamp: a chain, a green glass shade, a brass rim. */}
      <path d="M800 -450 V-120" stroke="#3a2c18" strokeWidth="5" strokeDasharray="10 6" />
      <path d="M730 -70 Q740 -126 800 -128 Q860 -126 870 -70 Z" fill="url(#fc-shade)" stroke={INK} strokeWidth="5" />
      <path d="M722 -70 H878" stroke="#d6b76a" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="800" cy="-62" rx="56" ry="10" fill="#fff1c4" opacity="0.9" />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "foreclosure-vault": () => <Vault />,
};
