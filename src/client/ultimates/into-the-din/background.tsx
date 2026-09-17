import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Into the Din's space: the ground between the lines.
 *
 * A no-man's-land drawn like a woodcut, in heraldry's two tinctures: a black
 * field hatched in bone. The sky is hatching and nothing else — no sun, no
 * cloud, no stars — thickest at the top. The earth is furrowed and runs away
 * to a low horizon, and it is littered with what other charges left on it:
 * dropped shields, a helmet, a snapped blade, a cart wheel on its side. The
 * noise is the film's (`din-noise`), so the field itself is dead still.
 *
 * Drawn on the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). The horizon is at world y 600, so a standing figure in
 * a wide shot is cut against the one pale band in the frame.
 */

const HORIZON = 600;
const BONE = "#f1e6cc";
const INK = "#0b0a0e";

/** The sky: horizontal strokes, broken, denser and heavier towards the top. */
const SKY = (() => {
  const rand = seeded(611);
  let d = "";
  for (let row = 0; row < 90; row++) {
    const y = -450 + row * ((HORIZON - 30 + 450) / 90);
    const depth = 1 - (y + 450) / (HORIZON + 450);
    let x = -800 + rand() * 60;
    while (x < 2400) {
      const len = 40 + rand() * (120 + depth * 360);
      if (rand() < 0.35 + depth * 0.55) d += `M${x.toFixed(0)} ${(y + (rand() - 0.5) * 4).toFixed(0)} h${len.toFixed(0)} `;
      x += len + 10 + rand() * (90 - depth * 70);
    }
  }
  return d;
})();

/** The earth: furrows that close up towards the horizon, and lines running to it. */
const FURROWS = (() => {
  const rand = seeded(733);
  let d = "";
  for (let i = 1; i < 34; i++) {
    const k = i / 34;
    const y = HORIZON + 6 + (k * k) * 1250;
    let x = -800;
    while (x < 2400) {
      const len = 60 + rand() * 260 * (0.4 + k);
      const sag = (rand() - 0.5) * 8 * k;
      if (rand() < 0.7) d += `M${x.toFixed(0)} ${y.toFixed(0)} q${(len / 2).toFixed(0)} ${sag.toFixed(1)} ${len.toFixed(0)} 0 `;
      x += len + 20 + rand() * 80;
    }
  }
  return d;
})();

const RAYS = (() => {
  const vx = 820;
  let d = "";
  for (let i = -26; i <= 26; i++) {
    const bx = vx + i * 150;
    d += `M${(vx + i * 6).toFixed(0)} ${HORIZON + 4} L${bx.toFixed(0)} 1350 `;
  }
  return d;
})();

/** What other charges left on the field, deterministically scattered by depth. */
const LITTER = (() => {
  const rand = seeded(1907);
  const out: { x: number; y: number; s: number; kind: number; r: number }[] = [];
  for (let i = 0; i < 46; i++) {
    const k = rand();
    const y = HORIZON + 14 + k * k * 700;
    out.push({ x: -760 + rand() * 3120, y, s: 0.25 + k * k * 1.6, kind: Math.floor(rand() * 4), r: (rand() - 0.5) * 50 });
  }
  return out.sort((a, b) => a.y - b.y);
})();

function Litter({ kind }: { kind: number }) {
  switch (kind) {
    case 0: // a round shield, dropped face-up
      return (
        <g>
          <ellipse rx="46" ry="14" fill={INK} stroke={BONE} strokeWidth="2.4" />
          <ellipse rx="30" ry="8" fill="none" stroke={BONE} strokeWidth="1.2" opacity="0.6" />
          <ellipse rx="8" ry="3" cy="-2" fill={BONE} opacity="0.8" />
        </g>
      );
    case 1: // a helmet on its side
      return (
        <g>
          <path d="M-26 0 C-26 -30 22 -34 26 -4 L18 2 Z" fill={INK} stroke={BONE} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M-8 -22 L6 -2" stroke={BONE} strokeWidth="1.4" opacity="0.7" />
        </g>
      );
    case 2: // a snapped blade, and its hilt a little way off
      return (
        <g stroke={BONE} strokeLinecap="round">
          <path d="M-40 0 L18 -6" strokeWidth="5" stroke={INK} />
          <path d="M-40 0 L18 -6" strokeWidth="1.6" />
          <path d="M34 -2 L60 -4 M44 -12 L46 6" strokeWidth="2.2" />
        </g>
      );
    default: // a cart wheel on its side
      return (
        <g fill="none" stroke={BONE}>
          <ellipse rx="54" ry="15" fill={INK} strokeWidth="2.4" />
          <path d="M-54 0 H54 M0 -15 V15 M-38 -11 L38 11 M-38 11 L38 -11" strokeWidth="1.2" opacity="0.6" />
        </g>
      );
  }
}

function Field() {
  return (
    <svg className="cine-bg-svg din-field" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="din-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050408" />
          <stop offset="0.5" stopColor="#0d0b12" />
          <stop offset="0.56" stopColor="#2a2630" />
          <stop offset="0.585" stopColor="#6d6558" />
          <stop offset="0.6" stopColor="#141217" />
          <stop offset="1" stopColor="#060508" />
        </linearGradient>
        <linearGradient id="din-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BONE} stopOpacity="0" />
          <stop offset="0.8" stopColor={BONE} stopOpacity="0.2" />
          <stop offset="1" stopColor={BONE} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#din-sky)" />
      <path className="din-field-sky" d={SKY} stroke={BONE} strokeWidth="3" strokeLinecap="round" />
      <rect x="-800" y={HORIZON - 150} width="3200" height="160" fill="url(#din-glow)" />
      <path d={`M-800 ${HORIZON} H2400`} stroke={BONE} strokeWidth="3" opacity="0.55" />
      <path className="din-field-rays" d={RAYS} stroke={BONE} strokeWidth="1.6" />
      <path className="din-field-furrows" d={FURROWS} stroke={BONE} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <g className="din-field-litter">
        {LITTER.map((l, i) => (
          <g key={i} transform={`translate(${l.x.toFixed(0)} ${l.y.toFixed(0)}) scale(${l.s.toFixed(2)}) rotate(${(l.r * 0.2).toFixed(1)})`} opacity={(0.35 + Math.min(1, l.s) * 0.5).toFixed(2)}>
            <Litter kind={l.kind} />
          </g>
        ))}
      </g>
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "din-field": () => <Field />,
};
