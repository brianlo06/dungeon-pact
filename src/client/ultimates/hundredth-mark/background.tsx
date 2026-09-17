import type { ComponentType, CSSProperties } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * The Hundredth Mark's space: the wood the Ranger learned in.
 *
 * Not a hall and not a sky — first light in a birch wood, thick with ground
 * fog, where every pale trunk is scored with a kid's tally marks: every shot
 * ever practised, counted in fours and struck through. The fog is the
 * brightest thing in it, so figures stand against it as ink, and the marks in
 * the bark light (`--lit`, driven by the film's `lanterns` cue) as the Ranger
 * counts the enemy line. The fog does not drift: a moving part of a background
 * this size re-rasterises all of it every frame.
 *
 * Drawn on the 3200×1800 box of the other backgrounds. The horizon — the
 * brightest band of fog — sits at world y 600, level with a standing
 * figure's chest, so a silhouette is always cut against the light. Nothing
 * here re-renders while a shot plays.
 */

const HORIZON = 600;

interface Trunk {
  x: number;
  w: number;
  /** 0 far … 1 near. */
  depth: number;
  lean: number;
  tallies: number[];
  scars: [number, number, number][];
}

function trunks(): Trunk[] {
  const rand = seeded(1003);
  const out: Trunk[] = [];
  const layers = [
    { n: 26, depth: 0, w: [10, 18] },
    { n: 16, depth: 0.45, w: [22, 36] },
    { n: 8, depth: 0.8, w: [48, 70] },
  ];
  for (const layer of layers)
    for (let i = 0; i < layer.n; i++) {
      const x = -760 + ((i + rand() * 0.8) / layer.n) * 3120;
      const w = layer.w[0] + rand() * (layer.w[1] - layer.w[0]);
      const tallies = Array.from({ length: layer.depth > 0.3 ? 1 + Math.floor(rand() * 3) : 0 }, () =>
        Math.round(260 + rand() * 520),
      );
      const scars = Array.from({ length: 5 + Math.floor(rand() * 7) }, () => [
        Math.round(-300 + rand() * 1500),
        0.3 + rand() * 0.5,
        rand() < 0.5 ? -1 : 1,
      ]) as [number, number, number][];
      out.push({ x, w, depth: layer.depth, lean: (rand() - 0.5) * 3, tallies, scars });
    }
  return out;
}
const TRUNKS = trunks();

/** One trunk: a pale column, dark scars, and its tallies. */
function TrunkArt({ t }: { t: Trunk }) {
  const near = t.depth > 0.6;
  const bark = near ? "#b9bfae" : t.depth > 0.3 ? "#cdd3c2" : "#c3ccbc";
  const ink = near ? "#1d221c" : "#3b4238";
  const top = -460;
  const bottom = HORIZON + 140 + t.depth * 520;
  const half = t.w / 2;
  return (
    <g
      className="hm-trunk"
      data-depth={near ? "near" : t.depth > 0.3 ? "mid" : "far"}
      transform={`translate(${t.x.toFixed(1)} 0) rotate(${t.lean.toFixed(2)} 0 ${bottom})`}
    >
      <path d={`M${-half * 0.82} ${top} L${half * 0.82} ${top} L${half} ${bottom} L${-half} ${bottom} Z`} fill={bark} />
      {/* The shade side: the fog's light comes from behind. */}
      <path d={`M${half * 0.2} ${top} L${half * 0.82} ${top} L${half} ${bottom} L${half * 0.25} ${bottom} Z`} fill={ink} opacity={near ? 0.5 : 0.18} />
      {t.scars.map(([y, k, side], i) => (
        <path
          key={i}
          d={`M${(-half * k * side).toFixed(1)} ${y} q${(half * 0.5 * side).toFixed(1)} ${(-3 - t.w * 0.05).toFixed(1)} ${(half * k * 1.4 * side).toFixed(1)} ${(1 + t.w * 0.04).toFixed(1)}`}
          stroke={ink}
          strokeWidth={Math.max(2, t.w * 0.09)}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {t.tallies.map((y, i) => {
        const s = t.w / 44;
        const d = `M${-12 * s} ${-14 * s} v${28 * s} M${-5 * s} ${-14 * s} v${28 * s} M${2 * s} ${-14 * s} v${28 * s} M${9 * s} ${-14 * s} v${28 * s} M${-17 * s} ${10 * s} L${14 * s} ${-10 * s}`;
        return (
          <g key={`t${i}`} transform={`translate(0 ${y})`}>
            <path d={d} stroke={ink} strokeWidth={Math.max(2.5, 3.2 * s)} strokeLinecap="round" fill="none" />
            <path className="hm-tally-lit" d={d} stroke="#dfff9e" strokeWidth={Math.max(2, 2.2 * s)} strokeLinecap="round" fill="none" style={{ "--i": ((t.x + 800) / 3200).toFixed(3) } as CSSProperties} />
          </g>
        );
      })}
    </g>
  );
}

function Wood() {
  return (
    <svg
      className="cine-bg-svg hm-wood"
      viewBox="-800 -450 3200 1800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#131b19" />
          <stop offset="0.3" stopColor="#3c4b45" />
          <stop offset="0.54" stopColor="#c3cdbb" />
          <stop offset="0.6" stopColor="#dfe6d4" />
          <stop offset="0.66" stopColor="#8e9a86" />
          <stop offset="0.78" stopColor="#2a3226" />
          <stop offset="1" stopColor="#0b0f0a" />
        </linearGradient>
        <radialGradient id="hm-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f2f7e6" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#dde5d0" stopOpacity="0.45" />
          <stop offset="1" stopColor="#dde5d0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hm-bank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe6d4" stopOpacity="0" />
          <stop offset="0.5" stopColor="#dfe6d4" stopOpacity="0.85" />
          <stop offset="1" stopColor="#dfe6d4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hm-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#56604d" stopOpacity="0" />
          <stop offset="0.25" stopColor="#252c21" />
          <stop offset="1" stopColor="#090c08" />
        </linearGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#hm-sky)" />
      <ellipse cx="900" cy={HORIZON} rx="1500" ry="260" fill="url(#hm-glow)" />
      {TRUNKS.filter((t) => t.depth === 0).map((t, i) => (
        <TrunkArt key={`f${i}`} t={t} />
      ))}
      <g className="hm-bank">
        <rect x="-1000" y={HORIZON - 150} width="3600" height="300" fill="url(#hm-bank)" />
      </g>
      {TRUNKS.filter((t) => t.depth > 0 && t.depth < 0.6).map((t, i) => (
        <TrunkArt key={`m${i}`} t={t} />
      ))}
      <path d={`M-800 ${HORIZON + 60} H2400 V1350 H-800 Z`} fill="url(#hm-floor)" />
      <g className="hm-bank b">
        <rect x="-1000" y={HORIZON - 40} width="3600" height="220" fill="url(#hm-bank)" opacity="0.7" />
      </g>
      {TRUNKS.filter((t) => t.depth >= 0.6).map((t, i) => (
        <TrunkArt key={`n${i}`} t={t} />
      ))}
      {/* Bracken at the foot of the frame, black against the floor fog. */}
      <g fill="#070a06">
        {Array.from({ length: 34 }, (_, i) => {
          const x = -800 + i * 97 + ((i * 37) % 40);
          const h = 60 + ((i * 53) % 90);
          const base = 1010 + ((i * 29) % 60);
          return <path key={i} d={`M${x} ${base + 200} Q${x + 8} ${base - h * 0.4} ${x + 26 + (i % 3) * 8} ${base - h} Q${x + 18} ${base - h * 0.3} ${x + 40} ${base + 200} Z`} />;
        })}
      </g>
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "hundredth-wood": () => <Wood />,
};
