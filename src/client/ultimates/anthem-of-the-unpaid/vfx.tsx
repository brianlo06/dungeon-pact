import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { VfxContext, VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * Anthem of the Unpaid's effects.
 *
 * The idea they serve: the Herald's horn does not play the anthem, it asks for
 * it — one note goes out, every ally answers it in their own voice, and the
 * last note is all of them at once.
 *
 * A voice is drawn as a ribbon: a band of cloth-light in its singer's colour,
 * twisting as it travels (its width pinches where it turns edge-on), with a
 * glow behind it and a bright edge along it. Every ribbon is rebuilt each
 * frame from a centre line, a wave travelling along it and a twist, so a
 * ribbon can grow out of a mouth, hang dead still, or snap taut — and never
 * renders React while it plays.
 *
 *   anthem-breath   on the board: the air drawn in towards the Herald's horn
 *   anthem-note     the first note, unfurling out of the horn's bell
 *   anthem-voices   the note running along the real party, and each ally's
 *                   answer rising off them in turn (`mode: answer`); or every
 *                   voice hanging still in the air (`mode: hang`)
 *   anthem-banner   the last note: every voice snapping taut up out of its
 *                   singer and braiding into one banner over the party
 *   anthem-chord    the chord going out of the horn, in rings
 *   anthem-ward     Barrier and Empowered landing on each figure: its own
 *                   ribbon wound once round it, and a lift running up it
 *   anthem-pennant  on the board after: each real hero wound in its own voice,
 *                   a pennant tail streaming off it
 *
 * Who is singing is read from the cast the stage drew (`[data-hero]` on each
 * figure) and, on the board, from each unit's own drawing, so the colours are
 * always the real party's.
 *
 * The allies' answers are staggered here, not in the engine: an actor cue's
 * reactions land on every figure of a row at once, so `anthem-voices` lifts
 * each ally's figure (its `.cine-look`, which nothing else moves) a beat after
 * the last, as the note reaches it, and puts it back when the shot ends.
 */

/** Each hero's voice. The Herald's is the accent. */
export const VOICE: Record<string, string> = {
  herald: "#ffb3d1",
  vanguard: "#ffcf6b",
  arcanist: "#8fd3ff",
  ranger: "#c7f08a",
  warden: "#6fe3c6",
  broker: "#ff9f5a",
  reaver: "#ff5d6c",
  beguiler: "#c9a3ff",
};
export const ROSE = VOICE.herald;
const GOLD = "#ffd98a";

const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const easeOut = (k: number) => 1 - (1 - clamp(k)) ** 3;
const easeInOut = (k: number) => {
  const x = clamp(k);
  return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
};
/** Overshoots and settles: an answer that jumps a little. */
const easeBack = (k: number) => {
  const x = clamp(k) - 1;
  return 1 + 2.4 * x ** 3 + 1.4 * x ** 2;
};

/* ── Reading the cast ──────────────────────────────────────────────────── */

const rootOf = (el: HTMLElement) => el.closest<HTMLElement>(".ult-cinematic");

/** The allies' figures, in slot order (the cast is drawn in that order). */
const allyFigures = (root: HTMLElement | null) =>
  root ? [...root.querySelectorAll<HTMLElement>('.cine-actor[data-role="allies"]')] : [];

const heroOf = (figure: Element | null | undefined) => figure?.querySelector("[data-hero]")?.getAttribute("data-hero") ?? "";
const voiceOf = (hero: string) => VOICE[hero] ?? ROSE;

/* ── Ribbons ───────────────────────────────────────────────────────────── */

type Pt = [number, number];

interface Ribbon {
  /** The centre line, s = 0 at the source … 1 at the far end. */
  line: (s: number) => Pt;
  /** Visible from `from` to `to` along the line. */
  from?: number;
  to: number;
  width: number;
  /** Sideways wave: amplitude, waves along the length, and phase (radians). */
  amp: number;
  waves: number;
  phase: number;
  /** Half-turns of twist along the length; the width pinches at each. */
  twist?: number;
  /** How narrow a ribbon gets edge-on, 0…1. */
  pinch?: number;
  /** Tapers towards the far end. */
  taper?: number;
  /** The wave grows away from the source (a ribbon tied at one end). */
  tied?: boolean;
}

/** The path of a ribbon: its body, its bright edge and its centre (for the glow). */
function ribbon(r: Ribbon, steps = 34) {
  const from = clamp(r.from ?? 0);
  const to = clamp(r.to);
  if (to - from < 0.004) return { body: "", edge: "", centre: "" };
  const left: Pt[] = [];
  const right: Pt[] = [];
  const mid: Pt[] = [];
  const pinch = r.pinch ?? 0.18;
  const twist = r.twist ?? 2;
  for (let i = 0; i <= steps; i++) {
    const s = lerp(from, to, i / steps);
    const [x0, y0] = r.line(s);
    const [x1, y1] = r.line(Math.min(1, s + 0.01));
    const [xa, ya] = r.line(Math.max(0, s - 0.01));
    let tx = x1 - xa;
    let ty = y1 - ya;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const nx = -ty;
    const ny = tx;
    const env = r.tied ? Math.min(1, s * 3.2) : 1;
    const off = r.amp * env * Math.sin(Math.PI * 2 * r.waves * s - r.phase);
    const cx = x0 + nx * off;
    const cy = y0 + ny * off;
    const turn = Math.abs(Math.cos(Math.PI * twist * s - r.phase * 0.35));
    const taper = 1 - (r.taper ?? 0.5) * s;
    const hw = (r.width / 2) * (pinch + (1 - pinch) * turn) * taper;
    left.push([cx + nx * hw, cy + ny * hw]);
    right.push([cx - nx * hw, cy - ny * hw]);
    mid.push([cx, cy]);
  }
  const f = ([x, y]: Pt) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const body = `M${left.map(f).join(" L")} L${right.reverse().map(f).join(" L")} Z`;
  const edge = `M${left.map(f).join(" L")}`;
  const centre = `M${mid.map(f).join(" L")}`;
  return { body, edge, centre };
}

const setD = (el: Element | null | undefined, d: string) => {
  if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
};

/** One ribbon's drawn parts, filled from `ribbon()`. */
function RibbonArt({ i, color }: { i: number; color?: string }) {
  return (
    <g className="anthem-ribbon" data-i={i} style={color ? v({ "--rc": color }) : undefined}>
      <path className="anthem-ribbon-glow" />
      <path className="anthem-ribbon-body" />
      <path className="anthem-ribbon-edge" />
    </g>
  );
}

function drawRibbon(g: Element | null | undefined, r: Ribbon | null) {
  if (!g) return;
  const d = r ? ribbon(r) : { body: "", edge: "", centre: "" };
  setD(g.querySelector(".anthem-ribbon-glow"), d.centre);
  setD(g.querySelector(".anthem-ribbon-body"), d.body);
  setD(g.querySelector(".anthem-ribbon-edge"), d.edge);
}

const colourRibbon = (g: Element | null | undefined, color: string) => {
  const el = g as HTMLElement | null | undefined;
  if (el && el.style.getPropertyValue("--rc") !== color) el.style.setProperty("--rc", color);
};

/** A straight line from a to b, bowed sideways by `bow` at its middle. */
const bowed = (a: Pt, b: Pt, bow = 0) => (s: number): Pt => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const k = Math.sin(Math.PI * s) * bow;
  return [a[0] + dx * s + (-dy / len) * k, a[1] + dy * s + (dx / len) * k];
};

const MAX_VOICES = 8;

/** A world-sized SVG to draw ribbons in. */
function Sky({ className, n, data, children }: { className: string; n: number; data?: Record<string, string>; children?: ReactNode }) {
  return (
    <svg className={`anthem-sky ${className}`} viewBox="0 0 1600 900" aria-hidden="true" {...data}>
      {Array.from({ length: n }, (_, i) => (
        <RibbonArt key={i} i={i} />
      ))}
      {children}
    </svg>
  );
}

const param = (el: HTMLElement, name: string, fallback: number) => {
  const raw = el.querySelector<HTMLElement>(".anthem-sky, .anthem-box")?.dataset[name];
  const n = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

/* ── Renderers ─────────────────────────────────────────────────────────── */

/** On the board: the air pulled in towards the horn. */
const Breath = ({ color }: VfxProps) => (
  <div className="anthem-breath" style={v({ "--c": color })}>
    {Array.from({ length: 12 }, (_, i) => (
      <i key={i} style={v({ "--a": `${i * 30 + 8}deg`, "--d": ((i * 7) % 5) * 0.05 })} />
    ))}
  </div>
);

/** The first note out of the bell, and its rings. */
const Note = ({ cue }: VfxProps) => {
  const p = cue.params ?? {};
  const data = Object.fromEntries(
    Object.entries({ x1: 1000, y1: 480, x2: -100, y2: 420, width: 46, amp: 40 }).map(([k, d]) => [`data-${k}`, String(p[k] ?? d)]),
  );
  return (
    <Sky className="anthem-note" n={1} data={data}>
      <g className="anthem-rings" transform={`translate(${p.x1 ?? 1000} ${p.y1 ?? 480}) rotate(${p.ring ?? 0})`}>
        {[0, 1, 2].map((i) => (
          <ellipse key={i} rx="60" ry="96" style={v({ "--d": i * 0.16 })} />
        ))}
      </g>
    </Sky>
  );
};

/** The note along the party and every answer; or every voice, hanging. */
const Voices = ({ cue }: VfxProps) => {
  const ref = useRef<SVGSVGElement>(null);
  const mode = String(cue.params?.mode ?? "answer");
  // Put the allies' figures back where the stage left them when the shot ends.
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>(".ult-cinematic") ?? null;
    return () => {
      for (const fig of allyFigures(root)) {
        const look = fig.querySelector<HTMLElement>(".cine-look");
        if (look) look.style.transform = "";
      }
    };
  }, []);
  const p = cue.params ?? {};
  return (
    <svg
      ref={ref}
      className="anthem-sky anthem-voices"
      viewBox="0 0 1600 900"
      aria-hidden="true"
      data-mode={mode}
      data-row={String(p.row ?? 0.62)}
      data-x1={String(p.x1 ?? 1750)}
      data-x2={String(p.x2 ?? -150)}
      data-cx={String(p.cx ?? 800)}
      data-cy={String(p.cy ?? 400)}
      data-span={String(p.span ?? 900)}
    >
      {Array.from({ length: MAX_VOICES + 1 }, (_, i) => (
        <RibbonArt key={i} i={i} />
      ))}
    </svg>
  );
};

/** Every voice snapping taut and braiding into one banner. */
const Banner = ({ cue }: VfxProps) => {
  const p = cue.params ?? {};
  return (
    <svg
      className="anthem-sky anthem-banner"
      viewBox="0 0 1600 900"
      aria-hidden="true"
      data-y={String(p.y ?? 200)}
      data-sag={String(p.sag ?? 60)}
      data-thick={String(p.thick ?? 1)}
    >
      {Array.from({ length: MAX_VOICES }, (_, i) => (
        <RibbonArt key={`s${i}`} i={i} />
      ))}
      {Array.from({ length: MAX_VOICES }, (_, i) => (
        <RibbonArt key={`r${i}`} i={100 + i} />
      ))}
    </svg>
  );
};

/** The chord leaving the horn: flat rings, thrown wide. */
const Chord = ({ color }: VfxProps) => (
  <div className="anthem-chord" style={v({ "--c": color })}>
    {[0, 1, 2, 3].map((i) => (
      <i key={i} style={v({ "--d": i * 0.09, "--w": 1 - i * 0.18 })} />
    ))}
  </div>
);

/** Barrier and Empowered on each figure: a coil of its voice and a lift. */
const Ward = ({ cue }: VfxProps) => (
  <svg className="anthem-sky anthem-ward" viewBox="0 0 1600 900" aria-hidden="true" data-half={String(cue.params?.half ?? "front")}>
    {Array.from({ length: MAX_VOICES }, (_, i) => (
      <g key={i} className="anthem-coil" data-i={i} style={{ display: "none" }}>
        <path className="anthem-coil-glow" />
        <path className="anthem-coil-band" />
        {cue.params?.half !== "back" &&
          [0, 1, 2].map((c) => <path key={c} className="anthem-lift" data-c={c} d="M-14 8 L0 -6 L14 8" />)}
      </g>
    ))}
  </svg>
);

/** On the board: each hero wound in its own voice, a pennant streaming off it. */
const Pennant = () => (
  <div className="anthem-pennant">
    <svg viewBox="-100 -100 200 200" aria-hidden="true">
      <path className="anthem-pennant-back" d="M-62 0 A62 16 0 0 1 62 0" />
      <path className="anthem-pennant-tail" d="M58 -2 C90 -14 118 6 150 -8 L140 6 L152 16 C120 20 92 6 58 10 Z" />
      <path className="anthem-pennant-front" d="M-62 0 A62 16 0 0 0 62 0" />
      <path className="anthem-pennant-lift" d="M-10 -40 L0 -50 L10 -40" />
    </svg>
  </div>
);

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "anthem-breath": Breath,
  "anthem-note": Note,
  "anthem-voices": Voices,
  "anthem-banner": Banner,
  "anthem-chord": Chord,
  "anthem-ward": Ward,
  "anthem-pennant": Pennant,
};

/* ── Frames ────────────────────────────────────────────────────────────── */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

/** Where a figure sings from, and where what it carries is, from its ground point. */
const mouth = (a: { x: number; y: number; h: number }): Pt => [a.x + a.h * 0.05, a.y - a.h * 0.74];

export const frames: Record<string, Frame> = {
  "anthem-note": (el, p, age) => {
    const svg = el.querySelector<SVGSVGElement>(".anthem-note");
    if (!svg) return;
    const d = svg.dataset;
    const a: Pt = [Number(d.x1), Number(d.y1)];
    const b: Pt = [Number(d.x2), Number(d.y2)];
    drawRibbon(svg.querySelector(".anthem-ribbon"), {
      line: bowed(a, b, -40),
      to: easeOut(p * 1.5),
      width: Number(d.width),
      amp: Number(d.amp),
      waves: 1.6,
      phase: age * 0.009,
      twist: 2.5,
      tied: true,
      taper: 0.2,
    });
    colourRibbon(svg.querySelector(".anthem-ribbon"), ROSE);
  },

  "anthem-voices": (el, p, age, ctx) => {
    const svg = el.querySelector<SVGSVGElement>(".anthem-voices");
    if (!svg) return;
    const d = svg.dataset;
    const root = rootOf(el);
    const figures = allyFigures(root);
    const groups = svg.querySelectorAll(".anthem-ribbon");

    if (d.mode === "hang") {
      // The quiet: every voice hanging dead still across the frame, the
      // Herald's highest. Only the faintest sag, so it is not a frozen frame.
      const voices = [ROSE, ...figures.map((f) => voiceOf(heroOf(f)))];
      const cx = Number(d.cx);
      const cy = Number(d.cy);
      const span = Number(d.span);
      groups.forEach((g, i) => {
        if (i >= voices.length) return drawRibbon(g, null);
        colourRibbon(g, voices[i]);
        const y = cy + (i - (voices.length - 1) / 2) * 70 + (i % 2 ? 18 : -10);
        const a: Pt = [cx - span / 2 - 40 * i, y - 30 + i * 12];
        const b: Pt = [cx + span / 2 + 30 * i, y + 20 - i * 10];
        drawRibbon(g, {
          line: bowed(a, b, 36 + i * 10 + p * 6),
          to: 1,
          width: 30 - i * 2,
          amp: 16,
          waves: 1.3 + i * 0.25,
          phase: 1.1 + i * 1.7,
          twist: 2 + i * 0.5,
          pinch: 0.12,
          taper: 0.15,
        });
      });
      return;
    }

    // The note runs along the row from the right, where the Herald stands.
    const x1 = Number(d.x1);
    const x2 = Number(d.x2);
    const allies = figures.map((f, i) => ({ fig: f, at: ctx.actor(`allies-${i}`), hero: heroOf(f) }));
    const first = allies.find((a) => a.at)?.at;
    const rowY = first ? first.y - first.h * Number(d.row) : 520;
    const head = easeInOut(p / 0.72);
    const noteX = lerp(x1, x2, head);
    drawRibbon(groups[0], {
      line: bowed([x1, rowY - 30], [x2, rowY + 10], 30),
      to: head,
      width: 38,
      amp: 34,
      waves: 2.4,
      phase: age * 0.011,
      twist: 3,
      taper: 0.3,
    });
    colourRibbon(groups[0], ROSE);

    allies.forEach(({ fig, at, hero }, i) => {
      const g = groups[i + 1];
      const look = fig.querySelector<HTMLElement>(".cine-look");
      if (!at) {
        drawRibbon(g, null);
        return;
      }
      // Each ally answers when the note reaches it, not before.
      const reached = clamp((x1 - at.x) / (x1 - x2)) * 0.72;
      const since = p - reached - 0.015;
      const k = clamp(since / 0.24);
      colourRibbon(g, voiceOf(hero));
      const [mx, my] = mouth(at);
      drawRibbon(g, since <= 0 ? null : {
        line: bowed([mx, my], [mx + at.h * 1.15, my - at.h * 0.85], -at.h * 0.3),
        to: easeOut(k),
        width: at.h * 0.085,
        amp: at.h * 0.06,
        waves: 1.4,
        phase: age * 0.012 + i,
        twist: 2.2,
        tied: true,
        taper: 0.4,
      });
      if (look) {
        const lift = since <= 0 ? 0 : easeBack(since / 0.16);
        const settle = clamp((since - 0.16) / 0.3);
        const y = -lift * (10 - settle * 4);
        const r = -lift * (4.5 - settle * 1.5);
        const t = lift ? `translateY(${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg)` : "";
        if (look.style.transform !== t) look.style.transform = t;
      }
    });
    // Nobody left over from a larger party.
    for (let i = allies.length + 1; i < groups.length; i++) drawRibbon(groups[i], null);
    // The note is only ever where it has reached.
    svg.style.setProperty("--note-x", `${noteX.toFixed(0)}`);
  },

  "anthem-banner": (el, p, age, ctx) => {
    const svg = el.querySelector<SVGSVGElement>(".anthem-banner");
    if (!svg) return;
    const root = rootOf(el);
    const figures = allyFigures(root);
    const singers = [
      { at: ctx.actor("caster"), color: ROSE },
      ...figures.map((f, i) => ({ at: ctx.actor(`allies-${i}`), color: voiceOf(heroOf(f)) })),
    ].filter((s): s is { at: { x: number; y: number; h: number }; color: string } => !!s.at);
    const n = Math.max(1, singers.length);
    const y = Number(svg.dataset.y);
    const sag = Number(svg.dataset.sag);
    const thick = Number(svg.dataset.thick);
    // Taut on the frame the chord lands, then the wind gets into it.
    const wind = easeOut(p / 0.5);
    const phase = age * 0.008;
    const line = (s: number): Pt => [lerp(-160, 1760, s), y + Math.sin(Math.PI * s) * sag - s * 40];
    const strands = svg.querySelectorAll(".anthem-ribbon");
    for (let k = 0; k < MAX_VOICES; k++) {
      const g = strands[k];
      if (k >= n) {
        drawRibbon(g, null);
        continue;
      }
      colourRibbon(g, singers[k].color);
      const offset = (k / n) * Math.PI * 2;
      drawRibbon(g, {
        line: (s) => {
          const [x, yy] = line(s);
          return [x, yy + Math.sin(Math.PI * 2 * 1.5 * s + offset - phase) * 34 * thick];
        },
        to: 1,
        width: 44 * thick,
        amp: 6 + wind * 22,
        waves: 2.2,
        phase: phase * 1.4 + offset,
        twist: 5,
        pinch: 0.22,
        taper: 0,
      });
    }
    // The risers: each voice, taut, from its singer up into the banner.
    singers.forEach((s, k) => {
      const g = strands[MAX_VOICES + k];
      colourRibbon(g, s.color);
      const [mx, my] = mouth(s.at);
      const tx = mx + 120 + k * 30;
      const [, ty] = line(clamp((tx + 160) / 1920));
      drawRibbon(g, {
        line: bowed([mx, my], [tx, ty + 10], 20 * wind),
        to: 1,
        width: s.at.h * 0.07,
        amp: 3 + wind * 16,
        waves: 2,
        phase: phase * 2 + k,
        twist: 2.5,
        tied: true,
        taper: 0.1,
      });
    });
    for (let k = singers.length; k < MAX_VOICES; k++) drawRibbon(strands[MAX_VOICES + k], null);
  },

  "anthem-ward": (el, p, _age, ctx) => {
    const svg = el.querySelector<SVGSVGElement>(".anthem-ward");
    if (!svg) return;
    const back = svg.dataset.half === "back";
    const figures = allyFigures(rootOf(el));
    const singers = [
      { at: ctx.actor("caster"), color: ROSE },
      ...figures.map((f, i) => ({ at: ctx.actor(`allies-${i}`), color: voiceOf(heroOf(f)) })),
    ];
    const coils = svg.querySelectorAll<SVGGElement>(".anthem-coil");
    coils.forEach((g, i) => {
      const s = singers[i];
      if (!s?.at) {
        if (g.style.display !== "none") g.style.display = "none";
        return;
      }
      if (g.style.display) g.style.display = "";
      const { x, y, h } = s.at;
      // Wound up the figure from the feet to the waist, one after another.
      const k = easeOut((p - i * 0.03) / 0.3);
      const cy = y - h * (0.08 + 0.36 * k);
      const rx = h * (0.36 - 0.06 * k);
      const ry = h * 0.075;
      const arc = back
        ? `M${(x - rx).toFixed(1)} ${cy.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${(x + rx).toFixed(1)} ${cy.toFixed(1)}`
        : `M${(x - rx).toFixed(1)} ${cy.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${(x + rx).toFixed(1)} ${cy.toFixed(1)}`;
      for (const path of g.querySelectorAll(".anthem-coil-glow, .anthem-coil-band")) setD(path, arc);
      g.style.setProperty("--rc", s.color);
      g.style.setProperty("--k", k.toFixed(3));
      g.style.setProperty("--band", (h * 0.05).toFixed(1));
      // Empowered: three gold marks running up the figure.
      g.querySelectorAll<SVGPathElement>(".anthem-lift").forEach((c, j) => {
        const t = clamp((p - 0.04 - j * 0.07 - i * 0.03) / 0.45);
        const side = j === 1 ? 0 : j === 0 ? -1 : 1;
        const cx2 = x + side * h * 0.26;
        const yy = y - h * (0.3 + 0.75 * easeOut(t));
        const s2 = (h / 300) * (1 - 0.3 * t);
        c.setAttribute("transform", `translate(${cx2.toFixed(1)} ${yy.toFixed(1)}) scale(${s2.toFixed(3)})`);
        c.style.opacity = t > 0 && t < 1 ? (Math.sin(Math.PI * t) * 1).toFixed(2) : "0";
      });
    });
  },

  "anthem-pennant": (el) => {
    // The colour of the voice is the hero the unit is.
    if (el.dataset.voiced) return;
    const unit = el.dataset.anchor;
    if (!unit) return;
    const hero = document
      .querySelector(`.stage [data-unit="${CSS.escape(unit)}"] [data-hero]`)
      ?.getAttribute("data-hero");
    el.style.setProperty("--c", voiceOf(hero ?? "herald"));
    el.dataset.voiced = hero ?? "herald";
  },
};

export { GOLD };
