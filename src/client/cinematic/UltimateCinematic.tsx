import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Enemy, Player, Snapshot } from "../../shared/model";
import type {
  ActorCue,
  ScreenCue,
  TextCue,
  VfxCue,
} from "../../shared/cinematic";
import { FOOTPRINT_SCALE } from "../../shared/presentation";
import type { Animators } from "../battle/useAnimators";
import { ORDER, type FrameLoop } from "../battle/clock";
import { unitPresentation } from "../battle/layout";
import { CREATURES } from "../components/creatures";
import { Miser } from "../components/Miser";
import { Strongbox } from "../components/Strongbox";
import { EquipmentProvider } from "../equipment/Equipment";
import { CloseUpContext } from "../battle/useRigParts";
import type { EquipmentBoard } from "../equipment/replay";
import { Background } from "./backgrounds";
import { CinematicRun, NO_DEBUG, type CinematicDebug } from "./run";
import { damageTo } from "./segments";
import {
  actorAt,
  cameraAt,
  ease,
  lightingAt,
  shotAt,
  type TimedShot,
} from "./timeline";
import { FRAMES, RENDERERS } from "./registry";
import "./cinematic.css";

/**
 * The Ultimate cinematic stage.
 *
 * For a few seconds the battle belongs to one character. This is the screen
 * that makes that true: an isolated film over the whole combat view, with its
 * own camera, its own lighting and its own copies of the caster, the targets
 * and the party — posed and placed wherever the shot wants them — and, at its
 * start and end, a transparent pass over the real battlefield so the film
 * leaves from the fight and comes back to it.
 *
 * The presentation copies are real rigs: the same drawings, the same
 * equipment the hero is wearing at that moment (a seized weapon stays
 * seized), and the same animator on the same clock, driven through clips
 * authored for close-ups. Nothing here touches a unit on the board.
 *
 * React renders when a shot changes. Everything between — camera, actors,
 * lighting, effects, text, transitions — is written straight to the DOM from
 * the stage's frame loop, like every other moving thing in combat.
 */

const WORLD = { w: 1600, h: 900 };

export interface CinematicProps {
  run: CinematicRun;
  s: Snapshot;
  loop: FrameLoop;
  animators: Animators;
  /** Equipment as it was when the Ultimate was called. */
  equipment?: EquipmentBoard;
  onSkip: () => void;
  debug?: CinematicDebug;
}

interface Cast {
  id: string;
  role: "caster" | "targets" | "allies";
  index: number;
  unit: Player | Enemy;
}

const isPlayer = (u: Player | Enemy): u is Player => "heroId" in u;

/**
 * One member of the cast, drawn as it is on the board: its own drawing, and
 * for a hero exactly the equipment it wore when the Ultimate was called.
 */
function Figure({
  unit: u,
  id,
  animators,
  worn,
  gold,
}: {
  unit: Player | Enemy;
  id: string;
  animators?: Animators;
  worn: readonly string[];
  gold: number;
}): ReactNode {
  const look = unitPresentation(
    "definition" in u ? u.definition : undefined,
    isPlayer(u) ? u.heroId : undefined,
  );
  const Art = look.spriteSet ? CREATURES[look.spriteSet] : undefined;
  if (look.spriteSet === "strongbox" && !isPlayer(u))
    return (
      <Strongbox
        className="cine-sprite"
        held={u.holding?.length ?? 0}
        itemIds={(u.holding ?? []).map((h) => h.itemId)}
        state={u.holding?.length ? "holding" : "empty"}
      />
    );
  if (look.spriteSet === "miser")
    return (
      <Miser
        className="cine-sprite"
        unitId={id}
        animators={animators}
        treasury={gold}
        barrier={u.statuses.find((x) => x.id === "barrier")?.stacks ?? 0}
      />
    );
  if (!Art) return null;
  return (
    <EquipmentProvider items={worn}>
      <Art className="cine-sprite" unitId={id} animators={animators} />
    </EquipmentProvider>
  );
}

/**
 * The cast, drawn once for the whole run. Memoised apart from the shots: a
 * shot change re-renders its effects and text, and must not re-render four
 * full hero drawings to do it — measured, that was 30–45ms at every cut.
 */
const CastLayer = memo(function CastLayer({
  cast,
  runKey,
  animators,
  equipment,
  gold,
  anchors,
  actors,
}: {
  cast: Cast[];
  runKey: number;
  animators: Animators;
  equipment?: EquipmentBoard;
  gold: number;
  anchors: boolean;
  actors: { current: Map<string, HTMLDivElement> };
}) {
  return (
    <div className="cine-actors">
      {cast.map((c) => {
        const id = `cine:${runKey}:${c.id}`;
        return (
          <div
            key={c.id}
            ref={(el) => {
              if (el) actors.current.set(c.id, el);
              else actors.current.delete(c.id);
            }}
            className="cine-actor"
            data-role={c.role}
            data-look="lit"
            style={{ display: "none" }}
          >
            <div
              className="cine-rig"
              ref={(el) => animators.attach(id, el?.parentElement?.dataset.root === "0" ? null : el)}
            >
              <div className="cine-look">
                <CloseUpContext.Provider value={true}>
                  <Figure
                    unit={c.unit}
                    id={id}
                    animators={animators}
                    worn={isPlayer(c.unit) ? (equipment?.worn[c.unit.id] ?? c.unit.items) : []}
                    gold={gold}
                  />
                </CloseUpContext.Provider>
              </div>
            </div>
            {anchors && <i className="cine-anchor" />}
          </div>
        );
      })}
    </div>
  );
});

/** Resolve `$name`-style references in authored text. */
function fill(text: string, run: CinematicRun) {
  const def = run.segment.def;
  const voice = def.presentation.voice ?? {};
  return text
    .replace("$name", def.name)
    .replace("$epithet", def.epithet)
    .replace("$voice.activation", voice.activation ?? "")
    .replace("$voice.impact", voice.impact ?? "")
    .replace("$voice.after", voice.after ?? "")
    .replace("$damage", String(damageTo(run.segment) || ""));
}

export function UltimateCinematic({
  run,
  s,
  loop,
  animators,
  equipment,
  onSkip,
  debug = NO_DEBUG,
}: CinematicProps) {
  const seg = run.segment;
  const def = seg.def;
  const accent = def.presentation.accent ?? "#ffd98a";
  const caster = s.players.find((p) => p.id === seg.cast.actor);

  /** Everyone the film can put on screen, in a stable order. */
  const cast = useMemo<Cast[]>(() => {
    const list: Cast[] = [];
    if (caster) list.push({ id: "caster", role: "caster", index: 0, unit: caster });
    seg.targets.forEach((id, index) => {
      const unit =
        s.enemies.find((e) => e.id === id) ?? s.players.find((p) => p.id === id);
      if (unit) list.push({ id: `targets-${index}`, role: "targets", index, unit });
    });
    s.players
      .filter((p) => p.id !== caster?.id && !p.fallen)
      .forEach((unit, index) =>
        list.push({ id: `allies-${index}`, role: "allies", index, unit }),
      );
    return list;
    // A run's cast is fixed when it starts.
  }, [run.key]);

  const [shotIndex, setShotIndex] = useState(0);
  const shot: TimedShot | undefined = run.timeline.shots[shotIndex];

  const root = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLDivElement>(null);
  const actors = useRef(new Map<string, HTMLDivElement>());
  const shown = useRef(0);
  const shakeNow = useRef({ x: 0, y: 0 });
  const unitId = (c: Cast) => `cine:${run.key}:${c.id}`;

  // Skip on Escape, as the round replay does.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onSkip]);

  /** Which actor cue in this shot places a cast member, and where. */
  const cueFor = useCallback(
    (c: Cast, cues: ActorCue[] = []) => {
      if (c.role === "caster") return { cue: cues.find((a) => a.role === "caster"), slot: 0 };
      if (c.role === "allies")
        return { cue: cues.find((a) => a.role === "allies"), slot: c.index };
      const all = cues.find((a) => a.role === "targets");
      if (all) return { cue: all, slot: c.index };
      return { cue: c.index === 0 ? cues.find((a) => a.role === "target") : undefined, slot: 0 };
    },
    [],
  );

  /** Battlefield anchors: where the stage has placed these units, on screen. */
  const anchorIds = useCallback(
    (anchor: VfxCue["anchor"]) => {
      const party = s.players.filter((p) => p.hp > 0 && !p.fallen).map((p) => p.id);
      switch (anchor) {
        case "caster":
          return caster ? [caster.id] : [];
        case "targets":
          return seg.targets;
        case "allies":
          return party.filter((id) => id !== caster?.id);
        case "party":
          return caster && !party.includes(caster.id) ? [caster.id, ...party] : party;
        default:
          return [];
      }
    },
    [run.key],
  );

  // The frame: camera, actors, lighting, effects, text and transitions.
  useEffect(
    () =>
      loop.add(ORDER.camera + 1, ({ time, free }) => {
        const el = root.current;
        if (!el || run.done) return;
        const t = run.at(time);
        const { shot: cur, u } = shotAt(run.timeline, t);
        if (cur.index !== shown.current) {
          shown.current = cur.index;
          setShotIndex(cur.index);
          return;
        }
        const W = el.clientWidth;
        const H = el.clientHeight;
        el.dataset.space = cur.space;

        // Camera, with shake that decays in free time so it runs through a stop.
        const frames = free / (1000 / 60);
        const amp = debug.shake ? run.shake : 0;
        run.shake *= Math.pow(0.84, frames);
        if (run.shake < 0.0005) run.shake = 0;
        if (frames > 0)
          shakeNow.current = {
            x: (Math.random() - 0.5) * amp * W,
            y: (Math.random() - 0.5) * amp * H,
          };
        const cam = cameraAt(run.timeline, t);
        const cover = Math.max(W / WORLD.w, H / WORLD.h);
        if (world.current)
          world.current.style.transform =
            `translate3d(${(W / 2 + shakeNow.current.x).toFixed(1)}px, ${(H / 2 + shakeNow.current.y).toFixed(1)}px, 0) ` +
            `rotate(${(cam.rotate ?? 0).toFixed(2)}deg) scale(${(cover * cam.zoom).toFixed(4)}) ` +
            `translate(${(-cam.x).toFixed(1)}px, ${(-cam.y).toFixed(1)}px)`;

        // Lighting.
        const light = lightingAt(cur, u);
        const f = film.current;
        const set = (node: HTMLElement | null, name: string, value: string) => {
          if (node && node.style.getPropertyValue(name) !== value)
            node.style.setProperty(name, value);
        };
        const lit = debug.lighting;
        set(el, "--bars", (light.letterbox / 0.2).toFixed(3));
        set(el, "--tint", lit && light.tint ? String(light.tint[1].toFixed(3)) : "0");
        if (light.tint) set(el, "--tint-c", light.tint[0]);
        if (f) {
          set(f, "--exposure", lit ? light.exposure.toFixed(3) : "1");
          set(f, "--vignette", lit ? light.vignette.toFixed(3) : "0");
          set(f, "--under", lit && light.under ? light.under[1].toFixed(3) : "0");
          if (light.under) set(f, "--under-c", light.under[0]);
          set(f, "--back", lit && light.back ? light.back[1].toFixed(3) : "0");
          if (light.back) set(f, "--back-c", light.back[0]);
          const rim = light.rim;
          set(f, "--rim-a", lit && rim ? rim[1].toFixed(2) : "0");
          if (rim) {
            set(f, "--rim-c", rim[0]);
            set(f, "--rim-dir", String(rim[2] ?? 1));
          }
          // The lantern hall: dark until a shot lights it, and lit from then on.
          const lanterns = (cur.vfx ?? []).find((v) => v.kind === "lanterns");
          const litBefore = run.timeline.shots
            .slice(0, cur.index)
            .some((x) => x.vfx?.some((v) => v.kind === "lanterns"));
          const litNow = lanterns
            ? Math.max(0, Math.min(1, (u - lanterns.at) / Math.max(0.01, (lanterns.until ?? 1) - lanterns.at)))
            : litBefore
              ? 1
              : 0;
          set(f, "--lit", litNow.toFixed(3));
          // Weather: clouds drift on film time, and a sky with a bolt in it
          // flickers with the bolt.
          set(f, "--bgt", (t / 1000).toFixed(2));
          const bolt = (cur.vfx ?? []).find(
            (v) => v.kind === "lightning" && u >= v.at && u <= (v.until ?? 1),
          );
          const flicker = bolt ? [1, 0.35, 0.8, 0.15][Math.floor((u * cur.length) / 45) % 4] : 0;
          set(f, "--storm", (debug.lighting ? flicker : 0).toFixed(2));
          // Figures are lit by the rim as much as by the room.
          const figure = lit ? Math.min(1.05, 0.42 + 0.58 * Math.max(light.exposure, (rim?.[1] ?? 0) * 0.75)) : 1;
          set(f, "--figure", figure.toFixed(2));
        }

        // Actors. Where each one lands is kept for the effects that ride them.
        const placed = new Map<string, { x: number; y: number; h: number }>();
        for (const c of cast) {
          const node = actors.current.get(c.id);
          if (!node) continue;
          const { cue, slot } = cueFor(c, cur.space === "cinematic" ? cur.actors : []);
          if (!cue) {
            if (node.style.display !== "none") node.style.display = "none";
            continue;
          }
          const p = actorAt(cue, u);
          const spread = cue.spread ?? [0, 0];
          const x = p.x + spread[0] * slot;
          const y = p.y + spread[1] * slot;
          const look = unitPresentation(
            "definition" in c.unit ? c.unit.definition : undefined,
            isPlayer(c.unit) ? c.unit.heroId : undefined,
          );
          const scale = (p.size / 100) * FOOTPRINT_SCALE[look.footprint ?? "person"];
          const native = isPlayer(c.unit) ? 1 : -1;
          const face = cue.face ?? native;
          const mirror = face === native ? 1 : -1;
          placed.set(c.id, { x, y, h: 84 * scale });
          node.style.display = "";
          node.style.zIndex = String((cue.z ?? 1) * 10 + slot);
          node.style.transform =
            `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${p.tilt.toFixed(2)}deg) ` +
            `scale(${(scale * mirror).toFixed(4)}, ${scale.toFixed(4)})`;
          const want = cue.look ?? "lit";
          if (node.dataset.look !== want) node.dataset.look = want;
          // Whether the clip's root track moves the whole figure in this shot.
          const rooted = cue.root === false ? "0" : "1";
          if (node.dataset.root !== rooted) {
            node.dataset.root = rooted;
            const rig = node.querySelector<HTMLElement>(".cine-rig");
            animators.attach(unitId(c), rooted === "1" ? rig : null);
            if (rig && rooted === "0") rig.style.transform = "";
          }
          if (cue.rim) set(node, "--rim-c", cue.rim);
        }

        // Effects and text, by their windows inside the shot.
        for (const node of el.querySelectorAll<HTMLElement>("[data-window]")) {
          const [a, b] = node.dataset.window!.split(",").map(Number);
          const k = (u - a) / Math.max(0.0001, b - a);
          const on = u >= a && u <= b && (!node.dataset.vfx || debug.vfx);
          if (!on) {
            if (node.style.visibility !== "hidden") node.style.visibility = "hidden";
            continue;
          }
          if (node.style.visibility) node.style.visibility = "";
          const pk = Math.max(0, Math.min(1, k));
          const age = (u - a) * cur.length;
          node.style.setProperty("--p", pk.toFixed(3));
          node.style.setProperty("--pe", ease("out", pk).toFixed(3));
          node.style.setProperty("--pi", ease("in", pk).toFixed(3));
          node.style.setProperty("--pb", ease("back", pk).toFixed(3));
          node.style.setProperty("--f", String(Math.floor(age / 40) % 4));
          const follow = node.dataset.follow;
          if (follow) {
            const id =
              follow === "caster" ? "caster" : `targets-${node.dataset.followIndex ?? 0}`;
            const at = placed.get(id);
            if (at) {
              node.style.left = `${(at.x + Number(node.dataset.dx)).toFixed(1)}px`;
              node.style.top = `${(at.y + Number(node.dataset.dy)).toFixed(1)}px`;
              node.style.setProperty("--ah", `${at.h.toFixed(1)}px`);
            } else if (node.style.visibility !== "hidden") node.style.visibility = "hidden";
          }
          const unit = node.dataset.anchor;
          if (unit) {
            const target = document.querySelector<HTMLElement>(
              `.stage [data-unit="${CSS.escape(unit)}"] .combatant-rig`,
            );
            const box = target?.getBoundingClientRect();
            const origin = el.getBoundingClientRect();
            if (box) {
              node.style.left = `${(box.left + box.width / 2 - origin.left).toFixed(1)}px`;
              node.style.top = `${(box.bottom - origin.top).toFixed(1)}px`;
              node.style.setProperty("--unit-w", `${box.width.toFixed(1)}px`);
              node.style.setProperty("--unit-h", `${box.height.toFixed(1)}px`);
              node.style.setProperty("--ah", `${(box.height * 0.84).toFixed(1)}px`);
            }
          }
          const kind = node.dataset.vfx;
          if (kind && FRAMES[kind]) FRAMES[kind](node, pk, age, { actor: (id) => placed.get(id) });
        }

        // Screen accents, timed in milliseconds from their start.
        for (const node of el.querySelectorAll<HTMLElement>("[data-screen]")) {
          const at = Number(node.dataset.at);
          const ms = Number(node.dataset.ms);
          const since = t - (cur.start + at * cur.length);
          const kind = node.dataset.screen;
          let k = since >= 0 && since <= ms ? 1 - since / ms : 0;
          if (kind === "black" || kind === "two-tone" || kind === "invert") k = since >= 0 && since <= ms ? 1 : 0;
          node.style.opacity = (debug.lighting || kind === "black" ? k : 0).toFixed(3);
        }
        const accentOn = (kind: ScreenCue["kind"]) =>
          (cur.screen ?? []).some((c) => {
            const since = t - (cur.start + c.at * cur.length);
            return c.kind === kind && (!c.mode || c.mode === run.mode) && since >= 0 && since <= c.ms;
          });
        if (f) {
          const filters = [
            // Ink stays ink and everything lit goes to one tone: a drawn frame.
            accentOn("two-tone") ? "grayscale(1) brightness(0.85) contrast(7)" : "",
            accentOn("invert") ? "invert(1)" : "",
            accentOn("desaturate") ? "grayscale(0.85)" : "",
          ]
            .filter(Boolean)
            .join(" ");
          if (!debug.lighting) {
            if (f.style.filter) f.style.filter = "";
          } else if (f.style.filter !== filters) f.style.filter = filters;
          el.toggleAttribute("data-two-tone", debug.lighting && accentOn("two-tone"));
        }

        // Transitions, around the boundary into this shot.
        const tr = cur.transition;
        const into = t - cur.start;
        const cover2 = el.querySelector<HTMLElement>(".cine-transition");
        if (cover2) {
          const ms = tr?.ms ?? 0;
          let o = 0;
          if (tr && (tr.kind === "flash" || tr.kind === "black") && into < ms) o = 1 - into / ms;
          cover2.style.opacity = o.toFixed(3);
          cover2.dataset.kind = tr?.kind ?? "cut";
        }
        const occluder = el.querySelector<HTMLElement>(".cine-occluder");
        if (occluder) {
          const next = run.timeline.shots[cur.index + 1];
          const edge =
            tr?.kind === "occlusion"
              ? { tr, at: cur.start }
              : next?.transition?.kind === "occlusion"
                ? { tr: next.transition, at: next.start }
                : null;
          const ms = edge?.tr.ms ?? 0;
          const k = edge ? (t - (edge.at - ms / 2)) / ms : -1;
          if (edge && k >= 0 && k <= 1) {
            const dir = edge.tr.dir ?? -1;
            occluder.style.visibility = "";
            occluder.style.transform = `translate3d(${((dir < 0 ? 1.1 - k * 2.4 : -1.3 + k * 2.4) * W).toFixed(1)}px, 0, 0)`;
          } else if (occluder.style.visibility !== "hidden") occluder.style.visibility = "hidden";
        }
        const whip = el.querySelector<HTMLElement>(".cine-whip");
        if (whip) {
          const ms = tr?.kind === "whip" ? (tr.ms ?? 120) : 0;
          whip.style.opacity = ms && into < ms ? (1 - into / ms).toFixed(3) : "0";
        }
      }),
    [loop, run, cast, cueFor, debug, animators],
  );

  // Register the presentation copies' animators, and dispose of them after.
  useLayoutEffect(() => {
    for (const c of cast) {
      const look = unitPresentation(
        "definition" in c.unit ? c.unit.definition : undefined,
        isPlayer(c.unit) ? c.unit.heroId : undefined,
      );
      animators.register(unitId(c), look.spriteSet);
      // The rig node's ref ran before this animator existed, so its attach was
      // a no-op and the clip's root track (the whole figure) was never written.
      const node = actors.current.get(c.id);
      if (node?.dataset.root !== "0")
        animators.attach(unitId(c), node?.querySelector<HTMLElement>(".cine-rig") ?? null);
    }
    return () => {
      for (const c of cast) animators.release(unitId(c));
    };
  }, [animators, cast]);

  const color = (cue: VfxCue) => cue.color ?? accent;
  const target = cast.find((c) => c.role === "targets" && c.index === 0);

  const renderVfx = (cue: VfxCue, i: number, layer: "back" | "front" | "screen") => {
    if (cue.mode && cue.mode !== run.mode) return null;
    if ((cue.layer ?? "front") !== layer || cue.anchor) return null;
    const Renderer = RENDERERS[cue.kind];
    if (!Renderer) return null;
    const slot =
      cue.kind === "reflection" && target ? figure(target, true) : undefined;
    // One copy per target, each riding its own figure.
    if (cue.each === "targets")
      return cast
        .filter((c) => c.role === "targets")
        .map((c) => (
          <div
            key={`${shot?.id}-${i}-${c.index}`}
            className={`cine-vfx fx-${cue.kind}-wrap`}
            data-vfx={cue.kind}
            data-window={`${cue.at + c.index * 0.04},${cue.until ?? 1}`}
            data-follow="targets"
            data-follow-index={c.index}
            data-dx={cue.x ?? 0}
            data-dy={cue.y ?? 0}
            style={
              { "--s": cue.scale ?? 1, "--rot": `${cue.rotate ?? 0}deg`, "--c": color(cue), visibility: "hidden" } as CSSProperties
            }
          >
            <Renderer cue={{ ...cue, seed: (cue.seed ?? 1) + c.index * 7 }} color={color(cue)} />
          </div>
        ));
    return (
      <div
        key={`${shot?.id}-${i}`}
        className={`cine-vfx fx-${cue.kind}-wrap`}
        data-vfx={cue.kind}
        data-window={`${cue.at},${cue.until ?? 1}`}
        data-follow={cue.follow}
        data-dx={cue.x ?? 0}
        data-dy={cue.y ?? 0}
        style={
          {
            left: layer === "screen" ? 0 : `${cue.x ?? 0}px`,
            top: layer === "screen" ? 0 : `${cue.y ?? 0}px`,
            "--s": cue.scale ?? 1,
            "--rot": `${cue.rotate ?? 0}deg`,
            "--c": color(cue),
            visibility: "hidden",
          } as CSSProperties
        }
      >
        <Renderer cue={cue} color={color(cue)} slot={slot} />
      </div>
    );
  };

  const figure = (c: Cast, still = false) => (
    <Figure
      unit={c.unit}
      id={still ? `still:${run.key}:${c.id}` : unitId(c)}
      animators={still ? undefined : animators}
      worn={isPlayer(c.unit) ? (equipment?.worn[c.unit.id] ?? c.unit.items) : []}
      gold={s.gold}
    />
  );

  const anchored = (shot?.vfx ?? []).flatMap((cue, i) =>
    cue.anchor && (!cue.mode || cue.mode === run.mode)
      ? anchorIds(cue.anchor).map((unit, n) => {
          const Renderer = RENDERERS[cue.kind];
          if (!Renderer) return null;
          const delay = ((cue.stagger ?? 0) * n) / (shot?.length ?? 1);
          return (
            <div
              key={`${shot?.id}-a${i}-${unit}`}
              className={`cine-vfx cine-anchored fx-${cue.kind}-wrap`}
              data-vfx={cue.kind}
              data-anchor={unit}
              data-window={`${cue.at + delay},${cue.until ?? 1}`}
              style={{ "--s": cue.scale ?? 1, "--c": color(cue), visibility: "hidden" } as CSSProperties}
            >
              <Renderer cue={cue} color={color(cue)} />
            </div>
          );
        })
      : [],
  );

  const texts = (shot?.text ?? []).filter((x) => !x.mode || x.mode === run.mode);
  const textNode = (cue: TextCue, i: number) => {
    if (cue.kind === "title") {
      // A boss's title card: a writ, not a caption. The seal comes down, the
      // name is struck, the line is ruled and the epithet is written under it.
      const credit = run.segment.def;
      return (
        <div
          key={`${shot?.id}-t${i}`}
          className="cine-text cine-title-card"
          data-window={`${cue.at},${cue.until ?? 1}`}
          style={
            {
              ...(cue.x !== undefined ? { left: `${cue.x * 100}%` } : {}),
              ...(cue.y !== undefined ? { top: `${cue.y * 100}%` } : {}),
              "--rot": `${cue.rotate ?? 0}deg`,
              visibility: "hidden",
            } as CSSProperties
          }
        >
          {credit.place && <span className="ct-place">{credit.place}</span>}
          <span className="ct-row">
            <span className="ct-seal" aria-hidden="true">
              <span>{credit.name.replace(/^The\s+/i, "").charAt(0)}</span>
            </span>
            <strong className="ct-name">{credit.name}</strong>
          </span>
          <span className="ct-rule" aria-hidden="true" />
          {credit.epithet && <em className="ct-epithet">{credit.epithet}</em>}
        </div>
      );
    }
    const text = fill(cue.text, run);
    if (!text) return null;
    return (
      <div
        key={`${shot?.id}-t${i}`}
        className={`cine-text cine-text-${cue.kind}`}
        data-window={`${cue.at},${cue.until ?? 1}`}
        style={
          {
            ...(cue.x !== undefined ? { left: `${cue.x * 100}%` } : {}),
            ...(cue.y !== undefined ? { top: `${cue.y * 100}%` } : {}),
            "--rot": `${cue.rotate ?? 0}deg`,
            visibility: "hidden",
          } as CSSProperties
        }
      >
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div
      ref={root}
      className="ult-cinematic"
      data-shot={shot?.id}
      data-shot-index={shotIndex}
      data-space={shot?.space}
      data-mode={run.mode}
      data-framing={run.framing}
      data-reduced={run.reduced ? "" : undefined}
      data-cinematic={run.cinematic.id}
      style={{ "--accent": accent } as CSSProperties}
      role="dialog"
      aria-label={
        run.intro
          ? `${def.name}${def.epithet ? `, ${def.epithet}` : ""}`
          : `${caster?.name ?? "A hero"} calls ${def.name}`
      }
      data-intro={run.intro ? "" : undefined}
    >
      <div className="cine-tint" aria-hidden="true" />
      <div ref={film} className="cine-film" aria-hidden="true">
        <div ref={world} className="cine-world">
          <div className="cine-bg">{shot && <Background id={shot.background} />}</div>
          <div className="cine-exposure" />
          <div className="cine-layer cine-back">
            {(shot?.vfx ?? []).map((cue, i) => renderVfx(cue, i, "back"))}
          </div>
          <CastLayer
            cast={cast}
            runKey={run.key}
            animators={animators}
            equipment={equipment}
            gold={s.gold}
            anchors={debug.anchors}
            actors={actors}
          />
          <div className="cine-layer cine-front">
            {(shot?.vfx ?? []).map((cue, i) => renderVfx(cue, i, "front"))}
          </div>
          {debug.bounds && <div className="cine-bounds" />}
        </div>
        <div className="cine-light cine-under" />
        <div className="cine-light cine-back-light" />
        <div className="cine-light cine-vignette" />
      </div>
      <div className="cine-twotone" aria-hidden="true" />
      <div className="cine-layer cine-anchors-layer" aria-hidden="true">
        {anchored}
      </div>
      <div className="cine-layer cine-screen" aria-hidden="true">
        {(shot?.vfx ?? []).map((cue, i) => renderVfx(cue, i, "screen"))}
        {(shot?.screen ?? [])
          .filter((c) => !c.mode || c.mode === run.mode)
          .map((c, i) => (
            <div
              key={`${shot?.id}-s${i}`}
              className={`cine-accent cine-accent-${c.kind}`}
              data-screen={c.kind}
              data-at={c.at}
              data-ms={c.ms}
              style={{ "--c": c.color ?? "#ffffff", "--amount": c.amount ?? 1, opacity: 0 } as CSSProperties}
            />
          ))}
        <div className="cine-whip" />
        <svg className="cine-occluder" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ visibility: "hidden" }}>
          <path d="M18 -5 C40 20 30 60 22 105 L96 105 C88 60 96 20 84 -5 Z" fill="#521a17" />
          <path d="M26 -5 C44 25 38 62 32 105 L44 105 C50 60 52 25 40 -5 Z" fill="#8d3027" />
          <path d="M60 -5 C70 30 66 70 70 105" stroke="#2e0e0c" strokeWidth="3" fill="none" />
        </svg>
        <div className="cine-transition" />
      </div>
      <div className="cine-bars" aria-hidden="true">
        <i className="top" />
        <i className="bottom" />
      </div>
      <div className="cine-texts">{texts.map(textNode)}</div>
      {debug.stage && (
        <div className="cine-debug-label">
          {shot ? `${shot.index + 1}/${run.timeline.shots.length} · ${shot.kind} · ${shot.id}` : ""}
        </div>
      )}
      <button type="button" className="cine-skip" onClick={onSkip}>
        Skip ▸▸
      </button>
    </div>
  );
}
