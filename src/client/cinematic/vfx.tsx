import type { CSSProperties, ReactNode } from "react";
import type { VfxCue, VfxKind } from "../../shared/cinematic";

/**
 * The cinematic effect vocabulary.
 *
 * Each effect is drawn once when its shot starts and animated by CSS
 * variables the player writes on its wrapper every frame:
 *
 *   --p    linear progress through the effect's lifetime, 0 … 1
 *   --pe   the same, eased out (fast, then settling)
 *   --pi   eased in (slow, then rushing)
 *   --f    a frame counter that ticks every 40 presentation ms, for flicker
 *
 * so an effect never re-renders React while it plays, slows and pauses with
 * the clock, and holds perfectly still through a hit-stop. Effects whose
 * motion cannot be written as a formula of those — lines that wrap round the
 * frame, a bolt that redraws itself — supply a `frame` function instead.
 *
 * Nothing is random at runtime. Every scatter comes from the cue's seed, so a
 * shot looks the same every time it plays and in every capture of it.
 */

/** A small seeded generator: the same seed, the same scatter. */
export function seeded(seed = 1) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

export interface VfxProps {
  cue: VfxCue;
  color: string;
  /** Anything the stage draws inside the effect: the target, in a reflection. */
  slot?: ReactNode;
}

type Renderer = (p: VfxProps) => ReactNode;

/* ---------------------------------------------------------------- ground -- */

const FloorCracks: Renderer = ({ cue, color }) => {
  const rand = seeded(cue.seed ?? 3);
  const inward = !!cue.params?.inward;
  const cracks = Array.from({ length: 11 }, (_, i) => {
    const angle = (i / 11) * Math.PI * 2 + rand() * 0.4;
    const len = 90 + rand() * 170;
    let x = 0;
    let y = 0;
    let d = "M0 0";
    const steps = 4 + Math.floor(rand() * 3);
    for (let s = 1; s <= steps; s++) {
      const a = angle + (rand() - 0.5) * 0.9;
      x += (Math.cos(a) * len) / steps;
      y += (Math.sin(a) * len) / steps;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return { d, len: len * 1.35, delay: rand() * 0.25 };
  });
  return (
    <svg className="fx-cracks" viewBox="-300 -300 600 600" data-inward={inward || undefined}>
      <g transform="scale(1 0.34)">
        {cracks.map((c, i) => (
          <g key={i} style={v({ "--len": c.len, "--delay": c.delay })}>
            <path className="fx-crack-glow" d={c.d} stroke={color} />
            <path className="fx-crack" d={c.d} stroke="#fff3cf" />
          </g>
        ))}
        <ellipse className="fx-crack-pool" rx="70" ry="70" fill={color} />
      </g>
    </svg>
  );
};

const Dust: Renderer = ({ cue }) => {
  const rand = seeded(cue.seed ?? 8);
  return (
    <div className="fx-dust">
      {Array.from({ length: 12 }, (_, i) => {
        const dir = i % 2 ? 1 : -1;
        return (
          <i
            key={i}
            style={v({
              "--dx": `${dir * (60 + rand() * 180)}px`,
              "--dy": `${-10 - rand() * 60}px`,
              "--s": 0.6 + rand() * 1.1,
            })}
          />
        );
      })}
    </div>
  );
};

const Motes: Renderer = ({ cue, color }) => {
  const rand = seeded(cue.seed ?? 5);
  return (
    <div className="fx-motes" data-still={cue.params?.still ? "" : undefined} style={v({ "--c": color })}>
      {Array.from({ length: 22 }, (_, i) => (
        <i
          key={i}
          style={v({
            "--x": `${(rand() - 0.5) * 520}px`,
            "--y": `${(rand() - 0.5) * 300}px`,
            "--rise": `${-80 - rand() * 160}px`,
            "--sway": `${(rand() - 0.5) * 40}px`,
            "--s": 0.4 + rand() * 1,
            "--o": 0.35 + rand() * 0.65,
          })}
        />
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ light -- */

const Glint: Renderer = ({ color }) => (
  <svg className="fx-glint" viewBox="-60 -60 120 120">
    <path d="M0 -58 L6 -6 L58 0 L6 6 L0 58 L-6 6 L-58 0 L-6 -6 Z" fill="#fffaf0" />
    <circle r="10" fill={color === "#fff" ? "#fffaf0" : color} opacity="0.8" />
  </svg>
);

const Visor: Renderer = ({ color }) => (
  <div className="fx-visor" style={v({ "--c": color })}>
    <i />
  </div>
);

const Gather: Renderer = ({ color }) => (
  <svg className="fx-gather" viewBox="-200 -200 400 400" style={v({ "--c": color })}>
    <circle className="fx-gather-ring" r="150" fill="none" stroke={color} strokeWidth="6" />
    <circle className="fx-gather-ring b" r="110" fill="none" stroke={color} strokeWidth="3" />
    <circle className="fx-gather-core" r="30" fill="#fff6dc" />
  </svg>
);

const CallAura: Renderer = ({ color }) => (
  <div className="fx-call" style={v({ "--c": color })}>
    <i className="fx-call-pillar" />
    <i className="fx-call-ring" />
    <i className="fx-call-glow" />
  </div>
);

const WardDome: Renderer = ({ color }) => {
  const hexes: string[] = [];
  for (let row = 0; row < 5; row++)
    for (let col = -4; col <= 4; col++) {
      const x = col * 26 + (row % 2) * 13;
      const y = -row * 22;
      if ((x / 110) ** 2 + (y / 120) ** 2 > 1) continue;
      hexes.push(`M${x} ${y - 12} l10 6 v12 l-10 6 l-10 -6 v-12 Z`);
    }
  return (
    <svg className="fx-ward" viewBox="-130 -140 260 160" style={v({ "--c": color })}>
      <path className="fx-ward-shell" d="M-120 0 A120 128 0 0 1 120 0 Z" fill={color} />
      <path className="fx-ward-rim" d="M-120 0 A120 128 0 0 1 120 0" fill="none" stroke="#fff3cf" strokeWidth="3" />
      <path className="fx-ward-hex" d={hexes.join(" ")} fill="none" stroke={color} strokeWidth="1.6" />
      <path className="fx-ward-lamp" d="M0 -150 l9 9 v14 l-9 9 l-9 -9 v-14 Z" fill="#fff3cf" />
      <ellipse className="fx-ward-floor" rx="130" ry="16" fill={color} />
    </svg>
  );
};

/* ----------------------------------------------------------------- motion -- */

const Trail: Renderer = ({ color }) => (
  <div className="fx-trail" style={v({ "--c": color })}>
    <i />
    <i className="b" />
  </div>
);

const SpeedLines: Renderer = ({ cue, color }) => {
  const rand = seeded(cue.seed ?? 17);
  const dense = !!cue.params?.dense;
  return (
    <div className="fx-speed" data-dense={dense || undefined} style={v({ "--c": color })}>
      {Array.from({ length: dense ? 30 : 18 }, (_, i) => (
        <i
          key={i}
          data-speed={(1.6 + rand() * 2.2).toFixed(2)}
          data-offset={rand().toFixed(3)}
          style={v({
            top: `${4 + rand() * 92}%`,
            width: `${10 + rand() * 30}%`,
            "--o": 0.25 + rand() * 0.6,
            "--h": `${1 + rand() * (dense ? 4 : 3)}px`,
          })}
        />
      ))}
    </div>
  );
};

/* ----------------------------------------------------------------- impact -- */

function starPath(seed: number, spikes: number, jagged: boolean) {
  const rand = seeded(seed);
  let d = "";
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 ? 26 + rand() * 18 : (jagged ? 90 : 120) + rand() * (jagged ? 110 : 60);
    d += `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
  }
  return `${d}Z`;
}

const ImpactStar: Renderer = ({ cue, color }) => {
  const seed = cue.seed ?? 2;
  const jagged = !!cue.params?.jagged;
  return (
    <svg className="fx-star" viewBox="-240 -240 480 480">
      {/* Three drawings of the same burst, swapped by frame: the star boils. */}
      {[0, 1, 2].map((k) => (
        <g key={k} className="fx-star-frame" data-k={k}>
          <path d={starPath(seed + k * 7, 13, jagged)} fill={color} transform="scale(1.7)" opacity="0.55" />
          <path d={starPath(seed + k * 11 + 1, 11, jagged)} fill="#fff8e6" />
          <path d={starPath(seed + k * 3 + 5, 7, true)} fill="#171420" transform="scale(0.34) rotate(12)" opacity="0.9" />
        </g>
      ))}
    </svg>
  );
};

const Shockwave: Renderer = ({ cue, color }) =>
  cue.params?.line ? (
    <div className="fx-shock-line" style={v({ "--c": color })}>
      <i />
      <i className="b" />
    </div>
  ) : (
    <svg className="fx-shock" viewBox="-200 -200 400 400" style={v({ "--c": color })}>
      <ellipse className="fx-shock-a" rx="180" ry="120" fill="none" stroke={color} />
      <ellipse className="fx-shock-b" rx="180" ry="120" fill="none" stroke="#fff6dc" />
    </svg>
  );

const Debris: Renderer = ({ cue, color }) => {
  const rand = seeded(cue.seed ?? 4);
  const pass = !!cue.params?.pass;
  return (
    <div className="fx-debris" data-pass={pass || undefined}>
      {Array.from({ length: pass ? 8 : 16 }, (_, i) => {
        const a = pass ? -0.4 + rand() * 0.8 : -Math.PI * (0.1 + rand() * 0.8);
        const dist = pass ? 500 + rand() * 600 : 160 + rand() * 320;
        const w = 8 + rand() * (pass ? 60 : 22);
        return (
          <i
            key={i}
            style={v({
              "--dx": `${Math.cos(a) * dist}px`,
              "--dy": `${Math.sin(a) * dist}px`,
              "--r": `${(rand() - 0.5) * 900}deg`,
              "--w": `${w}px`,
              "--h": `${w * (0.4 + rand() * 0.6)}px`,
              "--grow": pass ? 3 + rand() * 4 : 1,
              background: i % 3 ? color : "#e7d3aa",
            })}
          />
        );
      })}
    </div>
  );
};

const Sparks: Renderer = ({ cue, color }) => {
  const rand = seeded(cue.seed ?? 1);
  return (
    <div className="fx-sparks" style={v({ "--c": color })}>
      {Array.from({ length: 18 }, (_, i) => {
        const a = -Math.PI * (0.05 + rand() * 0.9);
        const dist = 120 + rand() * 260;
        return (
          <i
            key={i}
            style={v({
              "--dx": `${Math.cos(a) * dist}px`,
              "--dy": `${Math.sin(a) * dist}px`,
              "--r": `${(a * 180) / Math.PI}deg`,
              "--l": `${14 + rand() * 30}px`,
            })}
          />
        );
      })}
    </div>
  );
};

const Embers: Renderer = ({ cue, color }) => {
  const rand = seeded(cue.seed ?? 6);
  const burst = !!cue.params?.burst;
  return (
    <div className="fx-embers" data-burst={burst || undefined} style={v({ "--c": color })}>
      {Array.from({ length: 24 }, (_, i) => {
        const a = rand() * Math.PI * 2;
        const r = 120 + rand() * 260;
        return (
          <i
            key={i}
            style={v({
              "--x": `${Math.cos(a) * r}px`,
              "--y": `${Math.sin(a) * r * 0.7}px`,
              "--s": 0.5 + rand(),
              "--o": 0.4 + rand() * 0.6,
            })}
          />
        );
      })}
    </div>
  );
};

const MoltenSeam: Renderer = ({ color }) => (
  <svg className="fx-seam" viewBox="-40 -160 80 320" style={v({ "--c": color })}>
    <path className="fx-seam-glow" d="M0 -150 C18 -80 22 40 0 150" stroke={color} />
    <path className="fx-seam-core" d="M0 -150 C18 -80 22 40 0 150" stroke="#fff1c8" />
  </svg>
);

const VaultGate: Renderer = ({ cue, color }) => {
  const broken = !!cue.params?.broken;
  const plates = [
    [-160, -300, 150, 290],
    [-160, -8, 150, 300],
    [10, -300, 150, 290],
    [10, -8, 150, 300],
  ];
  return (
    <svg className="fx-gate" viewBox="-260 -360 520 700" data-broken={broken || undefined} style={v({ "--c": color })}>
      <rect x="-230" y="-340" width="460" height="660" fill="#120807" stroke="#3a1a10" strokeWidth="14" />
      {plates.map(([x, y, w, h], i) => (
        <g
          key={i}
          className="fx-gate-plate"
          style={v({
            "--dx": `${(i % 2 ? 1 : -1) * (i < 2 ? -1 : 1) * (160 + i * 40)}px`,
            "--dy": `${(i < 2 ? -1 : 1) * 60 - 40}px`,
            "--r": `${(i % 2 ? 1 : -1) * (30 + i * 12)}deg`,
          })}
        >
          <rect x={x} y={y} width={w} height={h} fill="#2a1410" stroke="#140806" strokeWidth="6" />
          {[0.15, 0.5, 0.85].map((k) => (
            <circle key={k} cx={x + w * k} cy={y + 18} r="7" fill="#5a2c1c" />
          ))}
          <path d={`M${x + 12} ${y + h / 2} H${x + w - 12}`} stroke="#4a2216" strokeWidth="10" />
        </g>
      ))}
      <g className="fx-gate-wheel">
        <circle r="62" fill="#3a1a10" stroke="#140806" strokeWidth="8" />
        <path d="M-50 0 H50 M0 -50 V50 M-35 -35 L35 35 M35 -35 L-35 35" stroke="#6b3a24" strokeWidth="9" />
      </g>
      <rect className="fx-gate-glow" x="-230" y="300" width="460" height="24" fill={color} />
    </svg>
  );
};

/**
 * The target's reflection, in the shield. Drawn by the stage, which knows the
 * target: this is only the frame and the shimmer over it.
 */
const Reflection: Renderer = ({ slot }) => (
  <div className="fx-reflection">
    <div className="fx-reflection-slot">{slot}</div>
    <i className="fx-reflection-sheen" />
  </div>
);

/* ------------------------------------------------------------------ storm -- */

const Rain: Renderer = ({ cue, color }) => {
  const rand = seeded(cue.seed ?? 31);
  const heavy = !!cue.params?.heavy;
  return (
    <div className="fx-rain" data-heavy={heavy || undefined} style={v({ "--c": color })}>
      {Array.from({ length: heavy ? 90 : 55 }, (_, i) => (
        <i
          key={i}
          data-x={rand().toFixed(3)}
          data-speed={(1.8 + rand() * 1.4).toFixed(2)}
          data-offset={rand().toFixed(3)}
          style={v({ "--l": `${24 + rand() * 46}px`, "--o": 0.25 + rand() * 0.55 })}
        />
      ))}
    </div>
  );
};

/** A bolt. Its path is rewritten by `VFX_FRAME` every few frames. */
const Lightning: Renderer = ({ color }) => (
  <svg className="fx-bolt" viewBox="-400 -1200 800 1260" style={v({ "--c": color })}>
    <path className="fx-bolt-glow" stroke={color} />
    <path className="fx-bolt-branch" stroke={color} />
    <path className="fx-bolt-core" stroke="#f4fbff" />
    <ellipse className="fx-bolt-foot" rx="90" ry="22" fill={color} />
  </svg>
);

/** Arcs between targets; drawn in world units by `VFX_FRAME`. */
const Arcs: Renderer = ({ color }) => (
  <svg className="fx-arcs" viewBox="0 0 1600 900" style={v({ "--c": color })}>
    <path className="fx-arc-glow" stroke={color} />
    <path className="fx-arc-core" stroke="#f4fbff" />
  </svg>
);

const Wet: Renderer = ({ cue, color }) => {
  const rand = seeded(cue.seed ?? 12);
  return (
    <div className="fx-wet" style={v({ "--c": color })}>
      <i className="fx-wet-sheen" />
      {Array.from({ length: 9 }, (_, i) => (
        <b
          key={i}
          style={v({
            "--x": `${(rand() - 0.5) * 100}%`,
            "--y": `${-rand() * 80}%`,
            "--d": rand().toFixed(2),
          })}
        />
      ))}
      <i className="fx-wet-pool" />
    </div>
  );
};

const Pages: Renderer = ({ cue }) => {
  const rand = seeded(cue.seed ?? 21);
  return (
    <div className="fx-pages">
      {Array.from({ length: 14 }, (_, i) => (
        <i
          key={i}
          style={v({
            "--dx": `${(rand() - 0.4) * 520}px`,
            "--dy": `${-240 - rand() * 520}px`,
            "--r": `${(rand() - 0.5) * 540}deg`,
            "--s": 0.5 + rand() * 0.8,
            "--d": (rand() * 0.35).toFixed(2),
          })}
        />
      ))}
    </div>
  );
};

const Drops: Renderer = ({ cue, color }) => {
  const rand = seeded(cue.seed ?? 44);
  return (
    <div className="fx-drops" data-still={cue.params?.still ? "" : undefined} style={v({ "--c": color })}>
      {Array.from({ length: 9 }, (_, i) => (
        <i
          key={i}
          style={v({
            "--x": `${(i - 4) * 38 + (rand() - 0.5) * 16}px`,
            "--hang": `${6 + rand() * 30}px`,
            "--fall": `${160 + rand() * 260}px`,
            "--d": rand().toFixed(2),
            "--s": 0.6 + rand() * 0.7,
          })}
        />
      ))}
    </div>
  );
};

const RuneCircle: Renderer = ({ color }) => (
  <svg className="fx-rune" viewBox="-300 -300 600 600" style={v({ "--c": color })}>
    <g className="fx-rune-outer">
      <circle r="270" fill="none" stroke={color} strokeWidth="6" />
      <circle r="240" fill="none" stroke={color} strokeWidth="22" strokeDasharray="3 26" />
    </g>
    <g className="fx-rune-inner">
      <circle r="170" fill="none" stroke={color} strokeWidth="4" />
      <path d="M0 -200 L48 -48 L200 0 L48 48 L0 200 L-48 48 L-200 0 L-48 -48 Z" fill="none" stroke="#e6f6ff" strokeWidth="5" />
    </g>
    <circle className="fx-rune-core" r="44" fill="#e6f6ff" />
  </svg>
);

export const VFX: Partial<Record<VfxKind, Renderer>> = {
  rain: Rain,
  lightning: Lightning,
  arcs: Arcs,
  wet: Wet,
  pages: Pages,
  drops: Drops,
  "rune-circle": RuneCircle,
  "floor-cracks": FloorCracks,
  dust: Dust,
  motes: Motes,
  glint: Glint,
  visor: Visor,
  gather: Gather,
  "call-aura": CallAura,
  "ward-dome": WardDome,
  trail: Trail,
  "speed-lines": SpeedLines,
  "impact-star": ImpactStar,
  shockwave: Shockwave,
  debris: Debris,
  sparks: Sparks,
  embers: Embers,
  "molten-seam": MoltenSeam,
  "vault-gate": VaultGate,
  reflection: Reflection,
  // The lantern hall draws its own lanterns; this cue only says when they
  // light, which the player writes to the film as `--lit`.
  lanterns: () => null,
};

/**
 * Per-frame work for the effects that need more than their variables. Called
 * with the effect's wrapper, its progress and its age in presentation ms.
 */
/** What a frame function may ask of the stage: where the cast stands. */
export interface VfxContext {
  /** An actor's ground point and drawn height, world units, by cast id. */
  actor: (id: string) => { x: number; y: number; h: number } | undefined;
}

/** A jagged path from a to b, fixed for one `seed`. */
function jag(ax: number, ay: number, bx: number, by: number, seed: number, amp: number, steps = 9) {
  const rand = seeded(seed);
  let d = `M${ax.toFixed(1)} ${ay.toFixed(1)}`;
  const nx = -(by - ay);
  const ny = bx - ax;
  const len = Math.hypot(nx, ny) || 1;
  for (let i = 1; i < steps; i++) {
    const k = i / steps;
    const off = (rand() - 0.5) * amp * Math.sin(k * Math.PI);
    d += ` L${(ax + (bx - ax) * k + (nx / len) * off).toFixed(1)} ${(ay + (by - ay) * k + (ny / len) * off).toFixed(1)}`;
  }
  return `${d} L${bx.toFixed(1)} ${by.toFixed(1)}`;
}

const setD = (el: Element | null, d: string) => {
  if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
};

export const VFX_FRAME: Partial<
  Record<VfxKind, (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void>
> = {
  rain: (el, _p, age) => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    for (const drop of el.querySelectorAll<HTMLElement>("i")) {
      const speed = Number(drop.dataset.speed);
      const k = (Number(drop.dataset.offset) + (age / 1000) * speed) % 1;
      const x = Number(drop.dataset.x) * w * 1.2 - w * 0.1 - k * h * 0.22;
      drop.style.transform = `translate3d(${x.toFixed(1)}px, ${(k * h * 1.15 - h * 0.1).toFixed(1)}px, 0) rotate(12deg)`;
    }
  },
  lightning: (el, p, age) => {
    // A new bolt shape every 45ms: it crawls rather than holds.
    const seed = Math.floor(age / 45) + 1;
    const svg = el.querySelector("svg");
    if (!svg || svg.dataset.seed === String(seed)) return;
    svg.dataset.seed = String(seed);
    const top = -1180;
    const main = jag(-60 + ((seed * 37) % 120), top, 0, 0, seed, 170, 14);
    setD(svg.querySelector(".fx-bolt-core"), main);
    setD(svg.querySelector(".fx-bolt-glow"), main);
    const at = -300 - ((seed * 53) % 500);
    setD(
      svg.querySelector(".fx-bolt-branch"),
      `${jag(0, at, 180 - ((seed * 71) % 360), at + 260, seed + 9, 70, 6)} ${jag(10, at - 200, -160, at + 40, seed + 17, 60, 5).replace("M", "M")}`,
    );
    svg.style.opacity = p > 0.85 ? String(((seed % 2) * 0.6 + 0.2).toFixed(2)) : "1";
  },
  arcs: (el, p, age, ctx) => {
    const svg = el.querySelector("svg");
    if (!svg) return;
    const seed = Math.floor(age / 50) + 3;
    if (svg.dataset.seed === String(seed)) return;
    svg.dataset.seed = String(seed);
    const from = ctx.actor("targets-0");
    if (!from) return;
    const hit = (a: { x: number; y: number; h: number }) => [a.x, a.y - a.h * 0.5] as const;
    const [ax, ay] = hit(from);
    let d = "";
    // Each target is reached in turn as the arc jumps down the line.
    for (let i = 1; i < 6; i++) {
      const to = ctx.actor(`targets-${i}`);
      if (!to || p < (i - 1) * 0.12) continue;
      const [bx, by] = hit(to);
      d += jag(ax, ay, bx, by, seed + i * 5, 90, 10) + " ";
    }
    setD(svg.querySelector(".fx-arc-core"), d.trim());
    setD(svg.querySelector(".fx-arc-glow"), d.trim());
  },
  "speed-lines": (el, _p, age) => {
    const width = el.offsetWidth;
    const lines = el.querySelectorAll<HTMLElement>("i");
    for (const line of lines) {
      const speed = Number(line.dataset.speed);
      const offset = Number(line.dataset.offset);
      // Wrap round the frame: a line leaves one edge as another enters.
      const x = ((offset + (age / 1000) * speed) % 1.3) - 0.3;
      line.style.transform = `translate3d(${(x * width).toFixed(1)}px, 0, 0)`;
    }
  },
  "impact-star": (el, _p, age) => {
    const k = String(Math.floor(age / 45) % 3);
    if (el.dataset.k !== k) el.dataset.k = k;
  },
};
