import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * The Aegis Knight's space: a causeway at the end of the world, paved and
 * planted with the broken blades of everything that ever came at it, under a
 * horizon that is only a cold light. No walls, no roof, no fire — the
 * Lantern Wall's hall and the Breaker's forge are both rooms; this is the
 * place where rooms stop. Drawn once per shot, on the shared 3200×1800 box.
 */

const VX = 820;
const HORIZON = 560;

/** Blades stuck in the ground, far to near: x, depth (0 far … 1 near), tilt, length, broken. */
function field() {
  const rand = seeded(41);
  const out: { x: number; y: number; k: number; tilt: number; len: number; broken: boolean; hilt: boolean }[] = [];
  for (let i = 0; i < 40; i++) {
    const depth = (i / 40) ** 1.6;
    const y = HORIZON + 8 + depth * 780;
    const k = 0.12 + depth * 1.5;
    // Keep a clear lane down the middle of the causeway, where the Knight stands.
    let x = -780 + rand() * 3160;
    const lane = 260 + depth * 520;
    if (Math.abs(x - VX) < lane) x = VX + Math.sign(x - VX || 1) * (lane + rand() * 200);
    out.push({
      x,
      y,
      k,
      tilt: (rand() - 0.5) * 50,
      len: 90 + rand() * 120,
      broken: rand() < 0.7,
      hilt: rand() < 0.6,
    });
  }
  return out;
}

const BLADES = field();

/**
 * Every blade as one path, transforms baked into the points. The field is
 * static, so it is drawn as a handful of paths rather than a hundred
 * elements: the camera re-rasterises the backdrop whenever it zooms, and the
 * cost of that is per element, not per pixel.
 */
function fieldPaths() {
  const blade: string[] = [];
  const edge: string[] = [];
  for (const b of BLADES) {
    const r = (b.tilt * Math.PI) / 180;
    const cos = Math.cos(r) * b.k;
    const sin = Math.sin(r) * b.k;
    const pt = (x: number, y: number) =>
      `${(b.x + x * cos - y * sin).toFixed(0)} ${(b.y + x * sin + y * cos).toFixed(0)}`;
    const poly = (pts: [number, number][]) => `M${pts.map(([x, y]) => pt(x, y)).join(" L")} Z`;
    const w = 16;
    const top: [number, number][] = b.broken
      ? [
          [w / 2, -b.len * 0.9],
          [w * 0.1, -b.len * 0.8],
          [-w * 0.3, -b.len * 0.95],
          [-w / 2, -b.len * 0.85],
        ]
      : [[0, -b.len - 16]];
    blade.push(poly([[-w / 2, 10], [w / 2, 10], ...top]));
    if (b.hilt && !b.broken) {
      blade.push(poly([[-26, -b.len - 40], [26, -b.len - 40], [26, -b.len - 29], [-26, -b.len - 29]]));
      blade.push(poly([[-6, -b.len - 76], [6, -b.len - 76], [6, -b.len - 38], [-6, -b.len - 38]]));
    }
    if (b.k > 0.5) edge.push(`M${pt(w / 2, 6)} L${b.broken ? pt(w / 2, -b.len * 0.88) : pt(0, -b.len - 14)}`);
  }
  return { blade: blade.join(" "), edge: edge.join(" ") };
}

const FIELD = fieldPaths();
const HEATER_STONE = "M-60 -72 H60 V-14 C60 34 30 64 0 88 C-30 64 -60 34 -60 -14 Z";
const RAYS = Array.from({ length: 19 }, (_, i) => {
  const x = -1000 + i * 220;
  return `M${VX + (x - VX) * 0.05} ${HORIZON} L${x} 1350`;
}).join(" ");
const COURSES = Array.from({ length: 8 }, (_, i) => `M-800 ${(HORIZON + 780 * ((i + 1) / 8) ** 1.9).toFixed(0)} H2400`).join(" ");

function Causeway() {
  return (
    <svg className="cine-bg-svg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="bw-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2527" />
          <stop offset="0.2" stopColor="#4f6663" />
          <stop offset="0.42" stopColor="#9cb8b0" />
          <stop offset="0.555" stopColor="#e6f3ed" />
          <stop offset="0.56" stopColor="#1a2224" />
          <stop offset="1" stopColor="#040506" />
        </linearGradient>
        <radialGradient id="bw-dawn" cx="0.56" cy="0.56" r="0.3">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.3" stopColor="#d7efe5" stopOpacity="0.5" />
          <stop offset="1" stopColor="#9cb8b0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bw-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b3a38" />
          <stop offset="0.25" stopColor="#141b1c" />
          <stop offset="1" stopColor="#07090a" />
        </linearGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#bw-sky)" />
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#bw-dawn)" />
      {/* Far, half-sunk shields standing like stones on the horizon. */}
      <g fill="#0b1112" opacity={0.85}>
        <path d={HEATER_STONE} transform={`translate(-420 ${HORIZON - 48}) rotate(-12) scale(1.2)`} />
        <path d={HEATER_STONE} transform={`translate(210 ${HORIZON - 32}) rotate(8) scale(0.8)`} />
        <path d={HEATER_STONE} transform={`translate(1520 ${HORIZON - 56}) rotate(14) scale(1.4)`} />
        <path d={HEATER_STONE} transform={`translate(2080 ${HORIZON - 36}) rotate(-6) scale(0.9)`} />
      </g>
      {/* The causeway: flagstones running to the light. */}
      <path d={`M-800 ${HORIZON} H2400 V1350 H-800 Z`} fill="url(#bw-road)" />
      <path d={RAYS} stroke="#324241" strokeWidth={3} opacity={0.55} />
      <path d={COURSES} stroke="#2a3736" strokeWidth={3.5} opacity={0.5} />
      {/* The line where the world stops, as bright as anything in the film. */}
      <path d={`M-800 ${HORIZON} H2400`} stroke="#e6f5ee" strokeWidth="3" opacity="0.8" />
      <path className="bw-bg-blade" d={FIELD.blade} />
      <path className="bw-bg-edge" d={FIELD.edge} />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "breakwater-causeway": Causeway,
};
