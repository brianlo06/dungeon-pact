import type {
  ActorCue,
  CameraKey,
  Cinematic,
  CinematicMode,
  Ease,
  Framing,
  Lighting,
  Shot,
} from "../../shared/cinematic";

/**
 * A cinematic, laid out in time for one playing.
 *
 * Pure: no DOM, no clock, no React. Given a cinematic, a mode and the target's
 * framing, it says which shots play and when, where the camera is at any
 * moment, and which instantaneous cues fall between two moments. The player
 * that owns the screen asks it those questions every frame; the tests and the
 * Battle Lab ask it the same ones.
 */

export interface TimedShot extends Shot {
  index: number;
  /** Presentation milliseconds from the cinematic's start. */
  start: number;
  /** Length in this mode. */
  length: number;
}

export type Instant =
  | { t: number; kind: "sound"; sfx: string; shot: number }
  | { t: number; kind: "shake"; amount: number; shot: number }
  | { t: number; kind: "stop"; ms: number; shot: number }
  | { t: number; kind: "duck"; level: number; ms: number; shot: number }
  | { t: number; kind: "reveal"; reveal: "impact" | "ward" | "all"; shot: number }
  | {
      t: number;
      kind: "clip";
      role: ActorCue["role"];
      clip: string;
      then?: string;
      /** Which actor cue in the shot, for roles that place several figures. */
      actor: number;
      shot: number;
    }
  | { t: number; kind: "shot"; shot: number }
  | { t: number; kind: "marker"; label: string; shot: number };

export interface Timeline {
  cinematic: Cinematic;
  mode: CinematicMode;
  framing: Framing;
  shots: TimedShot[];
  duration: number;
  /** Every instantaneous cue, in time order. */
  instants: Instant[];
}

const keep = (mode: CinematicMode, cue: { mode?: CinematicMode }) =>
  !cue.mode || cue.mode === mode;

/** A shot with the overrides for this framing applied. `boss` falls back to `large`. */
export function framed(shot: Shot, framing: Framing): Shot {
  if (framing === "normal" || !shot.framing) return shot;
  const o =
    framing === "boss"
      ? { ...shot.framing.large, ...shot.framing.boss }
      : shot.framing.large;
  if (!o) return shot;
  return {
    ...shot,
    camera: o.camera ?? shot.camera,
    actors: o.actors ?? shot.actors,
    vfx: o.vfx ?? shot.vfx,
  };
}

export function layout(
  cinematic: Cinematic,
  mode: CinematicMode,
  framing: Framing,
): Timeline {
  const shots: TimedShot[] = [];
  let t = 0;
  for (const raw of cinematic.shots) {
    const length = mode === "fast" ? (raw.fastMs ?? 0) : raw.ms;
    if (length <= 0) continue;
    const shot = framed(raw, framing);
    shots.push({ ...shot, index: shots.length, start: t, length });
    t += length;
  }
  const instants: Instant[] = [];
  for (const shot of shots) {
    const at = (u: number) => shot.start + Math.max(0, Math.min(1, u)) * shot.length;
    const i = shot.index;
    instants.push({ t: shot.start, kind: "shot", shot: i });
    for (const c of shot.sound ?? [])
      if (keep(mode, c)) instants.push({ t: at(c.at), kind: "sound", sfx: c.sfx, shot: i });
    for (const c of shot.shake ?? [])
      if (keep(mode, c))
        instants.push({ t: at(c.at), kind: "shake", amount: c.amount, shot: i });
    for (const c of shot.stop ?? [])
      instants.push({ t: at(c.at), kind: "stop", ms: c.ms, shot: i });
    for (const c of shot.duck ?? [])
      instants.push({ t: at(c.at), kind: "duck", level: c.level, ms: c.ms, shot: i });
    for (const c of shot.reveal ?? [])
      instants.push({ t: at(c.at), kind: "reveal", reveal: c.reveal, shot: i });
    for (const c of shot.markers ?? [])
      instants.push({ t: at(c.at), kind: "marker", label: c.label, shot: i });
    (shot.actors ?? []).forEach((a, actor) => {
      if (a.clip)
        instants.push({
          t: at(a.clipAt ?? 0),
          kind: "clip",
          role: a.role,
          clip: a.clip,
          then: a.then,
          actor,
          shot: i,
        });
      for (const r of a.react ?? [])
        instants.push({
          t: at(r.at),
          kind: "clip",
          role: a.role,
          clip: r.clip,
          then: r.then,
          actor,
          shot: i,
        });
    });
  }
  // Stable: within one moment, a shot change comes before what happens in it.
  instants.sort((a, b) => a.t - b.t || rank(a) - rank(b));
  return { cinematic, mode, framing, shots, duration: t, instants };
}

const rank = (x: Instant) => (x.kind === "shot" ? 0 : x.kind === "clip" ? 1 : 2);

/** The shot on screen at `t`, and how far through it. */
export function shotAt(tl: Timeline, t: number): { shot: TimedShot; u: number } {
  const shots = tl.shots;
  let shot = shots[shots.length - 1];
  for (const s of shots)
    if (t < s.start + s.length) {
      shot = s;
      break;
    }
  const u = shot.length ? (t - shot.start) / shot.length : 1;
  return { shot, u: Math.max(0, Math.min(1, u)) };
}

export function ease(name: Ease | undefined, k: number): number {
  const x = Math.max(0, Math.min(1, k));
  switch (name) {
    case "linear":
      return x;
    case "in":
      return x * x * x;
    case "out":
      return 1 - (1 - x) ** 3;
    case "snap":
      return x < 0.7 ? 0.08 * (x / 0.7) : 0.08 + 0.92 * (1 - (1 - (x - 0.7) / 0.3) ** 4);
    case "back": {
      const c = 1.70158;
      const y = x - 1;
      return 1 + (c + 1) * y ** 3 + c * y ** 2;
    }
    case "inOut":
    default:
      return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
  }
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export function mixCamera(a: CameraKey, b: CameraKey, k: number): CameraKey {
  return {
    x: lerp(a.x, b.x, k),
    y: lerp(a.y, b.y, k),
    // Zoom is eased in log space, so a push from 1× to 4× does not rush.
    zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), k)),
    rotate: lerp(a.rotate ?? 0, b.rotate ?? 0, k),
  };
}

const WIDE: CameraKey = { x: 800, y: 450, zoom: 1, rotate: 0 };

/** Where a shot's own camera is at `u`, ignoring transitions. */
function ownCamera(shot: Shot, u: number): CameraKey {
  const move = shot.camera;
  if (!move) return WIDE;
  if (!move.to) return move.from;
  return mixCamera(move.from, move.to, ease(move.ease, u));
}

/**
 * The camera at `t`. A `blend` shot travels from wherever the previous shot
 * ended over the transition's length; anything else cuts.
 */
export function cameraAt(tl: Timeline, t: number): CameraKey {
  const { shot, u } = shotAt(tl, t);
  const own = ownCamera(shot, u);
  const tr = shot.transition;
  if (tr?.kind === "blend" && shot.index > 0) {
    const ms = tr.ms ?? 240;
    const into = t - shot.start;
    if (into < ms) {
      const prev = tl.shots[shot.index - 1];
      return mixCamera(ownCamera(prev, 1), own, ease("inOut", into / ms));
    }
  }
  return own;
}

/** Instants due in (from, to], in order. */
export function instantsBetween(tl: Timeline, from: number, to: number) {
  return tl.instants.filter((x) => x.t > from && x.t <= to);
}

/** Lighting at `u` through a shot: `lighting` easing to `toLighting`. */
export function lightingAt(shot: Shot, u: number): Required<Pick<Lighting, "exposure" | "vignette" | "letterbox">> & Lighting {
  const a = shot.lighting ?? {};
  const b = shot.toLighting ?? {};
  const k = ease("inOut", u);
  const n = (key: "exposure" | "vignette" | "letterbox", fallback: number) =>
    lerp(a[key] ?? fallback, b[key] ?? a[key] ?? fallback, k);
  const pair = (key: "tint" | "under" | "back"): [string, number] | undefined => {
    const x = a[key];
    const y = b[key];
    if (!x && !y) return undefined;
    const colour = (y ?? x)![0];
    return [colour, lerp(x?.[1] ?? 0, y?.[1] ?? x?.[1] ?? 0, k)];
  };
  const rim =
    a.rim || b.rim
      ? ([
          (b.rim ?? a.rim)![0],
          lerp(a.rim?.[1] ?? 0, b.rim?.[1] ?? a.rim?.[1] ?? 0, k),
          (b.rim ?? a.rim)![2] ?? 1,
        ] as [string, number, 1 | -1])
      : undefined;
  return {
    exposure: n("exposure", 1),
    vignette: n("vignette", 0),
    letterbox: n("letterbox", 0),
    tint: pair("tint"),
    under: pair("under"),
    back: pair("back"),
    rim,
  };
}

/** An actor's ground point, size and tilt at `u` through its shot. */
export function actorAt(a: ActorCue, u: number) {
  const k = ease(a.ease ?? "inOut", u);
  const to = a.to ?? a.at;
  let x = lerp(a.at[0], to[0], k);
  let y = lerp(a.at[1], to[1], k);
  if (a.shove && u > a.shove.at) {
    const s = ease("out", (u - a.shove.at) / Math.max(0.001, 1 - a.shove.at));
    x += a.shove.by[0] * s;
    y += a.shove.by[1] * s;
  }
  return {
    x,
    y,
    size: lerp(a.size, a.toSize ?? a.size, k),
    tilt: lerp(a.tilt ?? 0, a.toTilt ?? a.tilt ?? 0, k),
  };
}

/** How a footprint maps onto a framing. */
export function framingFor(footprint: string | undefined): Framing {
  if (footprint === "boss" || footprint === "boss-large") return "boss";
  if (footprint === "heavy" || footprint === "container") return "large";
  return "normal";
}
