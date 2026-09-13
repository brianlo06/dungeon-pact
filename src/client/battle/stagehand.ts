import { useEffect, useMemo } from "react";
import type { Camera } from "./camera";
import { ORDER, type FrameLoop } from "./clock";
import {
  sampleSegments,
  type Cue,
  type MarkStyle,
  type MoveTimeline,
  type PhaseName,
  type ProjectilePlan,
  type RoundTimeline,
  type Segment,
} from "./choreography";
import { flightPoint, type Vec } from "./trajectory";
import type { Anchor } from "../../shared/presentation";
import { feet, scaleAt, type StageGeom, type UnitGeom } from "./stage-geometry";

/**
 * The stagehand: everything a replay moves that is not a rig.
 *
 * It writes each travelling combatant's choreography offset, flies the
 * projectiles, lights the marks, points the camera and draws the debug
 * overlay — all straight to the DOM, from the stage's frame loop, on the
 * presentation clock. React renders none of it frame by frame.
 *
 * The layers it writes are kept apart, because each has one owner:
 *
 *   final position = the stage layout's placement (the combatant's own
 *     `left`/`top`, never touched here)
 *   + the choreography offset (`.combatant-travel`, here)
 *   + the rig's own pose (`.combatant-rig`, the animator)
 *   + the camera (`.world`, the camera)
 *
 * Only the figure, its shadow and its selection marks travel. The name plate
 * and the intent chip stay home: the layout guarantees nobody covers a plate
 * and every chip stays on screen, and a health bar that ran across the stage
 * with its owner would be unreadable exactly when it is changing.
 *
 * Nothing here is ever persisted. A skip, the end of a replay, a reconnect or
 * a fresh load all leave every offset at zero; the board is always rebuilt
 * from the stage layout.
 */

interface UnitNodes {
  root: HTMLElement;
  travel: HTMLElement;
  lift: HTMLElement | null;
  shadow: HTMLElement | null;
  /** The combatant's own paint order, restored when it is home. */
  z: string;
  moved: boolean;
  written: string;
}

interface Live {
  plan: ProjectilePlan;
  el: HTMLElement;
  start: Vec;
  end: Vec;
  /** Arrived, and sticking or fading until then. */
  gone?: number;
  /** A beam's drawn width before it is stretched, measured once. */
  unit?: number;
}

interface LiveMark {
  style: MarkStyle;
  unit: string;
  to?: string;
  from: number;
  until: number;
  el: HTMLElement;
  /** A point on the unit's drawing it rides, measured live. */
  anchor?: Anchor;
}

export interface StagehandOptions {
  loop: FrameLoop;
  camera: Camera;
}

const px = (n: number) => `${n.toFixed(2)}px`;

export class Stagehand {
  private loop: FrameLoop;
  private camera: Camera;
  private units: HTMLElement | null = null;
  private projectiles: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private size = { width: 0, height: 0 };
  private resize: ResizeObserver | null = null;

  private plan: RoundTimeline | null = null;
  private geom: StageGeom | null = null;
  private startAt = 0;
  private bySegments = new Map<string, Segment[]>();
  private nodes = new Map<string, UnitNodes>();
  private live: Live[] = [];
  private marks: LiveMark[] = [];
  private follow: { units: string[]; projectiles: boolean; zoom?: number } | null =
    null;
  private phases = new Map<string, PhaseName>();
  private unsubscribe: (() => void)[] = [];
  /** Draw the debug overlay: anchors, attack points, paths, phases. */
  debug = false;
  /** Reduced motion: nothing travels; cues are drawn in place. */
  still = false;

  constructor({ loop, camera }: StagehandOptions) {
    this.loop = loop;
    this.camera = camera;
    this.unsubscribe.push(
      loop.add(ORDER.choreography, ({ time }) => this.frameUnits(time)),
      loop.add(ORDER.projectiles, ({ time }) => this.frameEffects(time)),
    );
  }

  dispose() {
    for (const u of this.unsubscribe) u();
    this.unsubscribe = [];
    this.resize?.disconnect();
    this.reset();
  }

  /** The layers it draws into. Any may be null while unmounting. */
  attach(
    units: HTMLElement | null,
    projectiles: HTMLElement | null,
    overlay: HTMLElement | null,
  ) {
    this.units = units;
    this.projectiles = projectiles;
    this.overlay = overlay;
    this.resize?.disconnect();
    this.resize = null;
    if (units) {
      const read = () => {
        this.size = { width: units.offsetWidth, height: units.offsetHeight };
      };
      read();
      if (typeof ResizeObserver !== "undefined") {
        this.resize = new ResizeObserver(read);
        this.resize.observe(units);
      }
    }
  }

  /* ---------------------------------------------------------- the round -- */

  /** Start playing a planned round whose time zero is clock time `at`. */
  begin(plan: RoundTimeline, geom: StageGeom, at: number) {
    this.reset();
    this.plan = plan;
    this.geom = geom;
    this.startAt = at;
    this.bySegments.clear();
    for (const s of plan.segments) {
      const list = this.bySegments.get(s.unit) ?? [];
      list.push(s);
      this.bySegments.set(s.unit, list);
    }
    this.drawDebug(null);
  }

  /** Play a cue the director has reached. `at` is its clock time. */
  cue(cue: Cue, at: number) {
    switch (cue.kind) {
      case "projectile":
        this.spawn(cue.plan, at);
        break;
      case "mark":
        this.mark(cue.style, cue.unit, at, this.startAt + cue.until, cue.to, cue.anchor, cue.tone);
        break;
      case "impact":
        // Heavier than its number: hold the scene and shake the camera.
        this.loop.clock.hold(cue.stopMs);
        if (!this.still) this.camera.shake(cue.shake);
        break;
      case "camera":
        this.frameCamera(cue);
        break;
      case "phase": {
        this.phases.set(cue.unit, cue.phase);
        const n = this.nodeFor(cue.unit);
        if (n) n.root.dataset.choreo = cue.phase;
        if (cue.phase === "anticipation" || cue.phase === "strike")
          this.drawDebug(this.moveOf(cue.unit, at));
        else if (this.debug) this.drawDebug(this.moveOf(cue.unit, at));
        break;
      }
    }
  }

  /**
   * Everyone home, nothing in the air: the end of a replay, a skip, a
   * reconnect. Every offset goes back to zero and every paint order to the
   * layout's.
   */
  reset() {
    for (const [, n] of this.nodes) this.home(n);
    for (const [id] of this.phases) {
      const n = this.nodeFor(id);
      if (n) delete n.root.dataset.choreo;
    }
    this.nodes.clear();
    this.phases.clear();
    for (const p of this.live) p.el.remove();
    this.live = [];
    for (const m of this.marks) m.el.remove();
    this.marks = [];
    this.plan = null;
    this.follow = null;
    this.bySegments.clear();
    if (this.overlay) this.overlay.innerHTML = "";
  }

  /** The stage's untransformed size, as last measured. */
  stageSize() {
    if (this.units && !this.size.width)
      this.size = {
        width: this.units.offsetWidth,
        height: this.units.offsetHeight,
      };
    return {
      width: this.size.width || 1280,
      height: this.size.height || 600,
    };
  }

  /** How many projectiles are in the air or stuck: for tests and the lab. */
  get inFlight() {
    return this.live.length;
  }

  /* ---------------------------------------------------- reduced motion -- */

  /**
   * Reduced motion: no traversal. Each move is shown in place, one after
   * another over the settled board: the actor ringed, a brief line from it
   * to what it hit, and the target marked. Nothing moves, nothing is left
   * behind, and the chronicle still carries every event in text.
   */
  reduced(
    moves: { actor: string; targets: string[] }[],
    geom: StageGeom,
    at: number,
    each = 520,
  ) {
    this.reset();
    this.geom = geom;
    this.startAt = at;
    moves.forEach((m, i) => {
      const from = at + i * each;
      this.mark("emphasis", m.actor, from, from + each * 0.9);
      for (const t of m.targets) {
        if (t !== m.actor) this.mark("line", m.actor, from + 80, from + each * 0.8, t);
        this.mark("mark", t, from + 160, from + each * 0.9);
      }
    });
  }

  /* ------------------------------------------------------------- units -- */

  private nodeFor(id: string): UnitNodes | null {
    const known = this.nodes.get(id);
    if (known?.root.isConnected) return known;
    const root = this.units?.querySelector<HTMLElement>(
      `.combatant[data-unit="${CSS.escape(id)}"]`,
    );
    const travel = root?.querySelector<HTMLElement>(".combatant-travel");
    if (!root || !travel) return null;
    const n: UnitNodes = {
      root,
      travel,
      lift: root.querySelector<HTMLElement>(".combatant-lift"),
      shadow: root.querySelector<HTMLElement>(".combatant-shadow"),
      z: root.style.zIndex,
      moved: false,
      written: "",
    };
    this.nodes.set(id, n);
    return n;
  }

  private home(n: UnitNodes) {
    if (!n.moved) return;
    n.travel.style.transform = "";
    n.travel.style.transformOrigin = "";
    n.travel.style.willChange = "";
    n.travel.style.opacity = "";
    if (n.lift) n.lift.style.transform = "";
    if (n.shadow) {
      n.shadow.style.transform = "";
      n.shadow.style.opacity = "";
    }
    n.root.style.zIndex = n.z;
    n.moved = false;
    n.written = "";
  }

  /** Where a unit's feet are now, stage fractions, offset included. */
  feetNow(id: string, time = this.loop.clock.time): Vec | null {
    const u = this.geom?.units.get(id);
    if (!u || !this.geom) return null;
    const pose = sampleSegments(this.bySegments.get(id) ?? [], time - this.startAt);
    const home = feet(u);
    return pose
      ? { x: pose.x, y: pose.y }
      : { x: home.x / this.geom.width, y: home.y / this.geom.height };
  }

  /** How far a unit is from home now, stage fractions. */
  private offsetNow(id: string, time: number): Vec {
    const u = this.geom?.units.get(id);
    const now = this.feetNow(id, time);
    if (!u || !now || !this.geom) return { x: 0, y: 0 };
    const home = feet(u);
    return {
      x: now.x - home.x / this.geom.width,
      y: now.y - home.y / this.geom.height,
    };
  }

  private frameUnits(time: number) {
    const geom = this.geom;
    if (!geom || this.still) return;
    const W = this.size.width || geom.width;
    const H = this.size.height || geom.height;
    const t = time - this.startAt;
    for (const [id, segments] of this.bySegments) {
      const u = geom.units.get(id);
      const n = this.nodeFor(id);
      if (!u || !n) continue;
      const pose = sampleSegments(segments, t);
      if (!pose) {
        this.home(n);
        continue;
      }
      const home = feet(u);
      const hx = home.x / geom.width;
      const hy = home.y / geom.height;
      const dx = (pose.x - hx) * W;
      const dy = (pose.y - hy) * H;
      const k = scaleAt(u, pose.y * geom.height, geom.height);
      const mirror = pose.face === u.facing ? 1 : -1;
      const lift = pose.lift * H;
      const key = `${dx.toFixed(1)} ${dy.toFixed(1)} ${k.toFixed(3)} ${mirror} ${lift.toFixed(1)} ${pose.opacity.toFixed(2)}`;
      if (key === n.written) continue;
      if (!n.moved) {
        n.moved = true;
        n.z = n.root.style.zIndex;
        // The feet, inside the drawing's square, are what it scales and turns
        // about: it grows standing where it is, not from its middle.
        const bh = u.body.bottom - u.body.top;
        const oy = ((u.figure.bottom - u.body.top) / bh) * 100;
        const origin = `50% ${oy.toFixed(1)}%`;
        n.travel.style.transformOrigin = origin;
        if (n.lift) n.lift.style.transformOrigin = origin;
        n.travel.style.willChange = "transform";
      }
      n.written = key;
      n.travel.style.transform = `translate3d(${px(dx)}, ${px(dy)}, 0) scale(${k.toFixed(4)})`;
      if (n.lift)
        n.lift.style.transform =
          lift || mirror < 0 ? `translateY(${px(-lift / k)}) scaleX(${mirror})` : "";
      if (n.shadow) {
        // The shadow stays on the floor under a leap, smaller and fainter
        // the higher the figure goes.
        const h = Math.min(1, lift / (0.2 * H));
        n.shadow.style.transform = h
          ? `translateX(-50%) scale(${(1 - 0.45 * h).toFixed(3)})`
          : "";
        n.shadow.style.opacity = h ? (1 - 0.55 * h).toFixed(3) : "";
      }
      n.travel.style.opacity = pose.opacity < 1 ? pose.opacity.toFixed(3) : "";
      // Paint order follows the ground it is standing on now, exactly as the
      // layout orders units by where they stand: in front of what it passes
      // in front of, behind what it passes behind.
      n.root.style.zIndex = String(Math.round(pose.y * 1000) + 5);
    }
    if (this.follow)
      this.frameCamera(
        { t: 0, kind: "camera", mode: "frame", ...this.follow },
        true,
      );
  }

  /* ------------------------------------------------------- projectiles -- */

  /** A point on a drawing, measured live where the rig has it right now. */
  private probe(unit: string, at: [number, number], part?: string): Vec | null {
    const root = this.units?.querySelector<HTMLElement>(
      `.combatant[data-unit="${CSS.escape(unit)}"]`,
    );
    const svg = root?.querySelector<SVGSVGElement>("svg.combatant-sprite");
    const host =
      (part && svg?.querySelector<SVGGElement>(`[data-part="${CSS.escape(part)}"]`)) ||
      svg;
    if (!host || !this.units) return null;
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    dot.setAttribute("x", String(at[0] - 0.05));
    dot.setAttribute("y", String(at[1] - 0.05));
    dot.setAttribute("width", "0.1");
    dot.setAttribute("height", "0.1");
    dot.setAttribute("fill", "none");
    host.appendChild(dot);
    const r = dot.getBoundingClientRect();
    dot.remove();
    const layer = this.units.getBoundingClientRect();
    const scale = layer.width / (this.units.offsetWidth || 1);
    if (!scale || (!r.width && !r.height && !r.x)) return null;
    return {
      x: ((r.left + r.width / 2 - layer.left) / scale) / (this.units.offsetWidth || 1),
      y: ((r.top + r.height / 2 - layer.top) / scale) / (this.units.offsetHeight || 1),
    };
  }

  private spawn(plan: ProjectilePlan, at: number) {
    if (!this.projectiles) return;
    // Leave from exactly where the drawing has its muzzle at the moment of
    // release — the arrow on the string — when it can be measured.
    const start =
      (plan.startAnchor &&
        this.probe(plan.from, plan.startAnchor.at, plan.startAnchor.part)) ||
      plan.start;
    const el = document.createElement("span");
    const look = plan.look;
    el.className = `projectile projectile-${look.visual ?? "bolt"} trajectory-${look.trajectory ?? "linear"}`;
    if (look.trail) el.dataset.trail = "";
    el.dataset.from = plan.from;
    el.dataset.to = plan.to;
    if (plan.spread)
      el.style.setProperty("--spread", px(plan.spread * (this.size.width || this.geom?.width || 1)));
    el.innerHTML = PROJECTILE_ART[look.visual ?? "bolt"] ?? "";
    this.projectiles.appendChild(el);
    // A beam is stretched to its length. A wide one — a cone, drawn at a
    // real width so its edges stay smooth — is stretched by less.
    const live: Live = {
      plan,
      el,
      start,
      end: plan.end,
      unit: look.trajectory === "beam" ? el.offsetWidth || 1 : undefined,
    };
    this.live.push(live);
    this.place(live, at);
  }

  private place(p: Live, time: number) {
    const W = this.size.width || this.geom?.width || 1;
    const H = this.size.height || this.geom?.height || 1;
    const t = time - this.startAt;
    const { plan } = p;
    const u = Math.max(0, Math.min(1, (t - plan.spawn) / Math.max(1, plan.arrive - plan.spawn)));
    // The target is home by the time anything lands on it, but it may still
    // be settling when the shot leaves: aim at where it will be.
    const off = this.offsetNow(plan.to, time);
    const end = { x: p.end.x + off.x, y: p.end.y + off.y };
    const trajectory = plan.look.trajectory ?? "linear";
    const f = flightPoint({ trajectory, start: p.start, end, arc: plan.look.arc, aspect: W / H }, u);
    const el = p.el;
    if (trajectory === "beam") {
      const len = Math.hypot((end.x - p.start.x) * W, (end.y - p.start.y) * H);
      const ang = Math.atan2((end.y - p.start.y) * H, (end.x - p.start.x) * W);
      el.style.transform = `translate3d(${px(p.start.x * W)}, ${px(p.start.y * H)}, 0) rotate(${ang.toFixed(4)}rad) scaleX(${((len * Math.min(1, u * 1.6)) / (p.unit ?? 1)).toFixed(3)})`;
    } else {
      const rot =
        plan.look.rotate === "none"
          ? 0
          : plan.look.rotate === "spin"
            ? u * 12
            : f.angle;
      el.style.transform = `translate3d(${px(f.x * W)}, ${px(f.y * H)}, 0) rotate(${rot.toFixed(4)}rad)`;
    }
    // Paint order by the ground under it: from the shooter's to the
    // target's, in front of each at its own end.
    const g0 = this.feetNow(plan.from, time)?.y ?? p.start.y;
    const g1 = this.feetNow(plan.to, time)?.y ?? end.y;
    el.style.zIndex = String(Math.round((g0 + (g1 - g0) * u) * 1000) + 8);
  }

  private frameEffects(time: number) {
    const t = time - this.startAt;
    for (let i = this.live.length - 1; i >= 0; i--) {
      const p = this.live[i];
      if (p.gone === undefined) {
        this.place(p, time);
        if (t >= p.plan.arrive) {
          const how = p.plan.look.onArrival ?? "vanish";
          p.gone = time + (how === "stick" ? 420 : how === "burst" ? 180 : 0);
          p.el.dataset.arrived = how;
        }
      } else if (time >= p.gone) {
        p.el.remove();
        this.live.splice(i, 1);
      } else if (p.plan.look.trajectory !== "beam") {
        // Stuck: it stays where it landed, moving with its target.
        this.place(p, time);
      }
    }
    for (let i = this.marks.length - 1; i >= 0; i--) {
      const m = this.marks[i];
      if (time >= m.until) {
        m.el.remove();
        this.marks.splice(i, 1);
        continue;
      }
      this.placeMark(m, time);
    }
  }

  /* ------------------------------------------------------------- marks -- */

  private mark(
    style: MarkStyle,
    unit: string,
    from: number,
    until: number,
    to?: string,
    anchor?: Anchor,
    tone?: string,
  ) {
    if (!this.projectiles) return;
    const el = document.createElement("span");
    el.className = `stage-mark mark-${style}`;
    el.dataset.unit = unit;
    if (tone) el.dataset.tone = tone;
    this.projectiles.appendChild(el);
    const m: LiveMark = { style, unit, to, from, until, el, anchor };
    this.marks.push(m);
    this.placeMark(m, from);
  }

  private anchorOf(u: UnitGeom, where: "feet" | "chest" | "muzzle", time: number): Vec {
    const geom = this.geom!;
    const f = this.feetNow(u.id, time) ?? { x: 0, y: 0 };
    const k = scaleAt(u, f.y * geom.height, geom.height);
    if (where === "feet") return f;
    const tall = ((u.figure.bottom - u.figure.top) * k) / geom.height;
    if (where === "chest")
      return {
        x: f.x + ((u.figure.left + u.figure.right) / 2) * k / geom.width,
        y: f.y - tall * 0.6,
      };
    const front = (u.facing > 0 ? u.figure.right : u.figure.left) * 0.8 * k;
    return { x: f.x + front / geom.width, y: f.y - tall * 0.55 };
  }

  private placeMark(m: LiveMark, time: number) {
    const geom = this.geom;
    const u = geom?.units.get(m.unit);
    if (!geom || !u) return;
    const W = this.size.width || geom.width;
    const H = this.size.height || geom.height;
    // A mark scheduled ahead waits, unseen, for its moment.
    m.el.style.visibility = time < m.from ? "hidden" : "";
    const life = Math.max(0, Math.min(1, (time - m.from) / Math.max(1, m.until - m.from)));
    m.el.style.setProperty("--k", life.toFixed(3));
    const k = scaleAt(u, (this.feetNow(u.id, time)?.y ?? 0) * geom.height, geom.height);
    const width = ((u.figure.right - u.figure.left) * k) / W;
    m.el.style.setProperty("--w", px(width * W));
    if (m.style === "line" && m.to) {
      const t = geom.units.get(m.to);
      if (!t) return;
      const a = this.anchorOf(u, "chest", time);
      const b = this.anchorOf(t, "chest", time);
      const len = Math.hypot((b.x - a.x) * W, (b.y - a.y) * H);
      const ang = Math.atan2((b.y - a.y) * H, (b.x - a.x) * W);
      m.el.style.transform = `translate3d(${px(a.x * W)}, ${px(a.y * H)}, 0) rotate(${ang.toFixed(4)}rad)`;
      m.el.style.width = px(len);
      m.el.style.zIndex = "4500";
      return;
    }
    const where =
      m.style === "telegraph" || m.style === "emphasis"
        ? "feet"
        : m.style === "charge"
          ? "muzzle"
          : "chest";
    // A mark on a drawn point — power gathering in the hand, a report at the
    // barrel — follows that point as the rig moves it, once it is showing.
    const drawn =
      m.anchor && time >= m.from ? this.probe(m.unit, m.anchor.at, m.anchor.part) : null;
    const p = drawn ?? this.anchorOf(u, where, time);
    m.el.style.transform = `translate3d(${px(p.x * W)}, ${px(p.y * H)}, 0)`;
    const ground = this.feetNow(u.id, time)?.y ?? p.y;
    m.el.style.zIndex =
      where === "feet" ? String(Math.round(ground * 1000) - 1) : "4400";
  }

  /* ------------------------------------------------------------ camera -- */

  private frameCamera(
    cue: Extract<Cue, { kind: "camera" }>,
    refresh = false,
  ) {
    const geom = this.geom;
    if (!geom) return;
    const time = this.loop.clock.time;
    const points: Vec[] = [];
    for (const id of cue.units) {
      const u = geom.units.get(id);
      if (!u) continue;
      const f = this.feetNow(id, time);
      if (!f) continue;
      const k = scaleAt(u, f.y * geom.height, geom.height);
      points.push(f, {
        x: f.x,
        y: f.y - ((u.figure.bottom - u.figure.top) * k) / geom.height,
      });
    }
    if (cue.projectiles)
      for (const p of this.live) {
        const t = time - this.startAt;
        const u = Math.max(0, Math.min(1, (t - p.plan.spawn) / Math.max(1, p.plan.arrive - p.plan.spawn)));
        points.push(flightPoint({ trajectory: p.plan.look.trajectory ?? "linear", start: p.start, end: p.end, arc: p.plan.look.arc }, u));
      }
    if (!points.length) return;
    // Following keeps re-framing every frame until the next camera cue.
    if (!refresh)
      this.follow =
        cue.mode === "follow" || (cue.mode === "frame" && cue.projectiles)
          ? { units: cue.units, projectiles: !!cue.projectiles, zoom: cue.zoom }
          : null;
    const zoom =
      cue.zoom ?? (cue.mode === "focus" ? 1.05 : cue.mode === "ease" ? 1.03 : 1.08);
    this.camera.look({ preset: "action", points, zoom });
  }

  /* ------------------------------------------------------------- debug -- */

  private moveOf(unit: string, at: number): MoveTimeline | null {
    const t = at - this.startAt;
    const found = this.plan?.moves.find(
      (m) => m.timeline.actor === unit && m.start <= t + 1 && t <= m.start + m.timeline.duration,
    );
    return found?.timeline ?? null;
  }

  private drawDebug(move: MoveTimeline | null) {
    const el = this.overlay;
    if (!el) return;
    if (!this.debug || !move) {
      if (!this.debug) el.innerHTML = "";
      return;
    }
    const W = this.size.width || this.geom?.width || 1;
    const H = this.size.height || this.geom?.height || 1;
    const P = (v?: Vec) => (v ? `${(v.x * W).toFixed(1)},${(v.y * H).toFixed(1)}` : "");
    const dot = (v: Vec | undefined, cls: string, label: string) =>
      v
        ? `<circle class="${cls}" cx="${(v.x * W).toFixed(1)}" cy="${(v.y * H).toFixed(1)}" r="5"/><text x="${(v.x * W + 7).toFixed(1)}" y="${(v.y * H - 6).toFixed(1)}">${label}</text>`
        : "";
    const path = (p: MoveTimeline["debug"]["approach"], cls: string) =>
      p ? `<path class="${cls}" d="M${P(p.from)} Q${P(p.via)} ${P(p.to)}"/>` : "";
    const d = move.debug;
    const phase = this.phases.get(move.actor) ?? "";
    el.innerHTML = `<svg viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" width="${W.toFixed(0)}" height="${H.toFixed(0)}">
      ${path(d.approach, "dbg-path")}${path(d.back, "dbg-back")}
      ${dot(d.home, "dbg-home", "home")}
      ${dot(d.attackPoint, "dbg-attack", "attack point")}
      ${dot(d.weapon, "dbg-weapon", "weapon")}
      ${dot(d.hit, "dbg-hit", "target anchor")}
      ${dot(d.muzzle, "dbg-muzzle", "projectile start")}
      <text class="dbg-phase" x="${(d.home.x * W).toFixed(1)}" y="${(d.home.y * H + 16).toFixed(1)}">${move.archetype} · ${phase}</text>
    </svg>`;
  }
}

/**
 * The projectile vocabulary. Each is a small inline drawing pointing right
 * (its direction of travel), in the house's ink and palette; the layer turns
 * it along its path. New visuals are one entry here and one CSS rule.
 */
export const PROJECTILE_ART: Record<string, string> = {
  arrow: `<svg viewBox="-30 -6 40 12" width="40" height="12"><path d="M-26 0 H6" stroke="#171420" stroke-width="3.2" stroke-linecap="round"/><path d="M-26 0 H6" stroke="#c9a276" stroke-width="1.5" stroke-linecap="round"/><path d="M4 -3 L10 0 L4 3 Z" fill="#d4d1dc" stroke="#171420" stroke-width="1.2" stroke-linejoin="round"/><path d="M-29 -3 L-23 0 L-29 3 L-26 0 Z" fill="#c4533f" stroke="#171420" stroke-width="0.9"/></svg>`,
  bolt: `<i></i>`,
  orb: `<i></i>`,
  mote: `<i></i>`,
  ember: `<i></i>`,
  rivet: `<i></i>`,
  shard: `<i></i>`,
  wave: `<i></i>`,
  /* A forked stroke, head at the origin, tail trailing back up the sky. */
  lightning: `<svg viewBox="-60 -9 64 18" width="64" height="18"><path d="M2 0 L-12 -5 L-20 3 L-34 -4 L-42 4 L-58 -2" stroke="#3a5bd0" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.55"/><path d="M2 0 L-12 -5 L-20 3 L-34 -4 L-42 4 L-58 -2" stroke="#e8f6ff" stroke-width="2.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="M-20 3 L-26 8" stroke="#bfe8ff" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  /* Slanted drops falling together, not turned. */
  rain: `<svg viewBox="-24 -30 48 40" width="48" height="40"><g stroke="#9fd6ff" stroke-width="2.2" stroke-linecap="round"><path d="M-16 -24 l-3 9"/><path d="M-6 -16 l-3 9"/><path d="M4 -26 l-3 9"/><path d="M13 -14 l-3 9"/><path d="M-11 -6 l-3 9"/><path d="M8 -2 l-3 9"/></g><g stroke="#e8f6ff" stroke-width="1" stroke-linecap="round"><path d="M-16 -24 l-1.5 4.5"/><path d="M4 -26 l-1.5 4.5"/><path d="M-11 -6 l-1.5 4.5"/></g></svg>`,
  weld: `<i></i><b></b>`,
  cone: `<i></i>`,
};

/** The stage's stagehand, for as long as the stage is mounted. */
export function useStagehand(
  loop: FrameLoop,
  camera: Camera,
  still = false,
): Stagehand {
  const hand = useMemo(() => new Stagehand({ loop, camera }), [loop, camera]);
  hand.still = still;
  useEffect(() => () => hand.dispose(), [hand]);
  return hand;
}
