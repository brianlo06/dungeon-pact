import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Combat, type LabApi, type LabHooks } from "../client/components/Combat";
import { useCombatExit } from "../client/battle/useCombatExit";
import { reduce, snapshot } from "../engine/game";
import { effects } from "../engine/effects";
import { prepareIntents } from "../engine/combat";
import { evolutions } from "../content/evolutions";
import { heroes } from "../content/heroes";
import { items } from "../content/items";
import { ULTIMATE_MAX, ultimateFor } from "../content/ultimates";
import { cinematicFor } from "../content/cinematics";
import type { RunState } from "../shared/model";
import type { Framing } from "../shared/cinematic";
import { NO_DEBUG, type CinematicDebug } from "../client/cinematic/run";
import { bossFixture, finishPreviewRound } from "./boss-fixture";
import "../client/style.css";
import "./boss-preview.css";
import "./ultimate-lab.css";

/**
 * The Ultimate lab.
 *
 * Real rules, real combat screen, real cinematic: an Ultimate is queued
 * through the reducer and the round resolved by it, exactly as a room would.
 * Everything a cinematic needs to be judged on — the hero and path, the
 * target and its size, the gear worn, the charge, the speed, a shot at a time
 * — is a control here and a query-string parameter, so a capture can name the
 * frame it is of.
 *
 *   /dev/ultimates.html?hero=vanguard&evo=van-breaker&enemy=collector&gear=kit
 *     &mode=full&speed=1&tempo=1&auto=1&shot=4&pause=1
 */

type Enemy = "hound" | "bulwark" | "sniper" | "collector" | "miser";
type Gear = "base" | "weapon" | "armor" | "relic" | "kit" | "seized";

const FIGHTS: Record<Enemy, { boss?: "collector" | "miser"; encounter?: string; label: string }> = {
  hound: { encounter: "diving-detail", label: "Slag Hound · normal" },
  sniper: { encounter: "sluice-sentries", label: "Rivet Sniper · normal (back row)" },
  bulwark: { encounter: "sluice-sentries", label: "Iron Bulwark · large" },
  collector: { boss: "collector", label: "The Collector · boss" },
  miser: { boss: "miser", label: "The Miser · boss" },
};

const GEAR: Record<Gear, { items: string[]; label: string }> = {
  base: { items: [], label: "Base equipment" },
  weapon: { items: ["blood-price"], label: "Blood Price (weapon)" },
  armor: { items: ["bastion"], label: "Bastion Heart (armour)" },
  relic: { items: ["wellspring"], label: "Wellspring Stone (relic)" },
  kit: { items: ["blood-price", "bastion", "wellspring"], label: "Full kit" },
  seized: { items: ["blood-price", "bastion"], label: "Weapon seized by the Collector" },
};

interface Options {
  hero: string;
  evo: string;
  enemy: Enemy;
  gear: Gear;
  party: 2 | 3 | 4;
  charge: number;
}

function read() {
  const q = new URLSearchParams(location.search);
  const flag = (k: string, d: boolean) => (q.has(k) ? q.get(k) === "1" : d);
  return {
    options: {
      hero: q.get("hero") ?? "vanguard",
      evo: q.get("evo") ?? "",
      enemy: (q.get("enemy") as Enemy) ?? "hound",
      gear: (q.get("gear") as Gear) ?? "base",
      party: Number(q.get("party") ?? 3) as 2 | 3 | 4,
      charge: Number(q.get("charge") ?? ULTIMATE_MAX),
    },
    mode: (q.get("mode") ?? "full") as "full" | "fast",
    framing: (q.get("framing") ?? "auto") as Framing | "auto",
    motion: flag("motion", true),
    tempo: q.get("tempo") ?? "1",
    speed: Number(q.get("speed") ?? 1),
    auto: flag("auto", false),
    shot: q.has("shot") ? Number(q.get("shot")) : null,
    at: q.has("at") ? Number(q.get("at")) : null,
    pause: flag("pause", false),
    viewport: q.get("viewport") ?? "1280x720",
    debug: {
      ...NO_DEBUG,
      vfx: flag("vfx", true),
      lighting: flag("lighting", true),
      shake: flag("shake", true),
      bounds: flag("bounds", false),
      anchors: flag("anchors", false),
      stage: flag("stageinfo", false),
      markers: flag("markers", true),
    } satisfies CinematicDebug,
  };
}
const initial = read();
document.documentElement.dataset.motion = initial.motion ? "full" : "reduced";
document.documentElement.dataset.tempo = initial.tempo;

function build(o: Options): RunState {
  const fight = FIGHTS[o.enemy];
  const others = ["ranger", "warden", "arcanist", "vanguard", "herald"].filter(
    (h) => h !== o.hero,
  );
  let s = bossFixture({
    boss: fight.boss ?? "collector",
    encounter: fight.encounter,
    size: o.party,
    stage: "opening",
    gold: 400,
    legacy: false,
    heroes: [o.hero, ...others].slice(0, o.party),
  });
  const me = s.players[0];
  me.row = "front";
  if (o.evo) {
    const path = evolutions.find((e) => e.id === o.evo && e.heroId === o.hero);
    if (path) {
      me.evolution = path.id;
      me.maxHp += path.stats.hp ?? 0;
      me.hp = me.maxHp;
      me.power += path.stats.power ?? 0;
      me.guard = Math.max(0, me.guard + (path.stats.guard ?? 0));
    }
  }
  for (const p of s.players) p.ultimateCharge = p.id === me.id ? o.charge : 40;
  me.items = [...GEAR[o.gear].items];
  if (o.gear === "seized") {
    // The Collector takes the dearest thing worn, into its strongbox, the way
    // Repossess does — so the cinematic has to draw the hero without it.
    const collector = s.enemies.find((e) => e.definition === "collector");
    if (collector) effects(s, collector, me, [{ kind: "seize", count: 1 }]);
    else me.items = me.items.filter((id) => items.find((i) => i.id === id)?.slot !== "weapon");
    prepareIntents(s);
  }
  s = { ...s, logs: [...s.logs] };
  return s;
}

function targetFor(s: RunState, enemy: Enemy) {
  const living = s.enemies.filter((e) => e.hp > 0 && e.definition !== "strongbox");
  return (living.find((e) => e.definition === enemy) ?? living[0])?.id ?? "";
}

function UltimateLab() {
  const [options, setOptions] = useState<Options>(initial.options);
  const [run, setRun] = useState(() => build(initial.options));
  const [target, setTarget] = useState(() => targetFor(run, initial.options.enemy));
  const [generation, setGeneration] = useState(0);
  const [mode, setMode] = useState(initial.mode);
  const [framing, setFraming] = useState(initial.framing);
  const [motion, setMotion] = useState(initial.motion);
  const [tempo, setTempo] = useState(initial.tempo);
  const [speed, setSpeed] = useState(initial.speed);
  const [paused, setPaused] = useState(initial.pause);
  const [debug, setDebug] = useState<CinematicDebug>(initial.debug);
  const [error, setError] = useState("");
  const [w, h] = initial.viewport.split("x").map(Number);
  const api = useRef<LabApi | null>(null);
  const before = useRef<RunState | null>(null);
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "full" : "reduced";
  }, [motion]);
  useEffect(() => {
    document.documentElement.dataset.tempo = tempo;
  }, [tempo]);

  const live = useMemo(() => snapshot(run, "preview-0", run.players.map((p) => p.id)), [run]);
  const exit = useCombatExit(live);
  const s = exit.state!;
  const me = run.players[0];
  const ult = ultimateFor(me);
  const film = ult ? cinematicFor(ult) : null;

  const load = useCallback((next: Options) => {
    const fresh = build(next);
    setOptions(next);
    setRun(fresh);
    setTarget(targetFor(fresh, next.enemy));
    setGeneration((n) => n + 1);
    setError("");
  }, []);

  /** Queue the Ultimate and resolve the round through the real reducer. */
  const trigger = useCallback(
    (from: RunState = run) => {
      try {
        const primed = structuredClone(from);
        primed.players[0].ultimateCharge = Math.max(primed.players[0].ultimateCharge ?? 0, ULTIMATE_MAX);
        before.current = primed;
        let next = reduce(primed, "preview-0", { type: "ultimate", target }, 0);
        next = finishPreviewRound(next);
        setRun(next);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [run, target],
  );

  /** Replay the same Ultimate from the same board, then seek into it. */
  const seek = useCallback(
    (ms: number) => {
      const from = before.current;
      if (!from) return;
      setGeneration((n) => n + 1);
      setRun(from);
      setTimeout(() => {
        trigger(from);
        const wait = () => {
          const lab = api.current;
          const c = lab?.cinematic();
          if (!lab || !c) return void requestAnimationFrame(wait);
          lab.setPaused(true);
          setPaused(true);
          lab.loop.clock.step(ms);
        };
        requestAnimationFrame(wait);
      }, 60);
    },
    [trigger],
  );

  // First load: trigger and seek as the URL asks.
  const started = useRef(false);
  useEffect(() => {
    if (started.current || !initial.auto) return;
    started.current = true;
    setTimeout(() => {
      trigger();
      if (initial.shot === null && initial.at === null && !initial.pause) return;
      const wait = () => {
        const lab = api.current;
        const c = lab?.cinematic();
        if (!lab || !c) return void requestAnimationFrame(wait);
        if (initial.pause || initial.shot !== null || initial.at !== null) {
          lab.setPaused(true);
          setPaused(true);
        }
        const shot = initial.shot !== null ? c.timeline.shots[initial.shot] : undefined;
        const ms = (shot ? shot.start : 0) + (initial.at ?? 0) * (shot ? shot.length : c.duration);
        // Seek from where the film already is: on a slow machine its first
        // frame can land a few hundred milliseconds in, and stepping the full
        // offset again would overshoot a short shot into the next one.
        const ahead = ms - c.at(lab.loop.clock.time);
        if (ahead > 0) lab.loop.clock.step(ahead);
      };
      requestAnimationFrame(wait);
    }, 250);
  }, [trigger]);

  const hooks = useMemo<LabHooks>(
    () => ({
      attach: (a) => {
        api.current = a;
        if (a) a.setSpeed(speed);
      },
      framing: framing === "auto" ? undefined : framing,
      debug,
    }),
    [framing, debug, speed],
  );

  const send = useCallback(
    (intent: Parameters<typeof reduce>[2]) => {
      try {
        setRun((prev) => reduce(prev, "preview-0", intent, 0));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [],
  );
  const toggle = (key: keyof CinematicDebug) => setDebug((d) => ({ ...d, [key]: !d[key] }));

  return (
    <div className="app-shell preview-shell ult-lab" data-combat="">
      <header className="preview-toolbar">
        <strong>ULTIMATE LAB</strong>
        <a href="/dev/bosses.html">Battle Lab</a>
        <p>
          Real rules and a real room: the Ultimate is queued and resolved by the
          reducer, then played. {ult ? `${ult.name} — ${ult.epithet}` : "No Ultimate."}{" "}
          {film && !ult?.presentation.cinematic ? "(generic cinematic — not yet authored)" : ""}
        </p>
        <div className="preview-controls">
          <label>
            Hero
            <select value={options.hero} onChange={(e) => load({ ...options, hero: e.target.value, evo: "" })}>
              {heroes.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Evolution
            <select value={options.evo} onChange={(e) => load({ ...options, evo: e.target.value })}>
              <option value="">Base class</option>
              {evolutions
                .filter((x) => x.heroId === options.hero)
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Enemy
            <select value={options.enemy} onChange={(e) => load({ ...options, enemy: e.target.value as Enemy })}>
              {Object.entries(FIGHTS).map(([id, f]) => (
                <option key={id} value={id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Target
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              {s.enemies
                .filter((e) => e.hp > 0)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.row})
                  </option>
                ))}
            </select>
          </label>
          <label>
            Framing
            <select value={framing} onChange={(e) => setFraming(e.target.value as Framing | "auto")}>
              {["auto", "normal", "large", "boss"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Gear
            <select value={options.gear} onChange={(e) => load({ ...options, gear: e.target.value as Gear })}>
              {Object.entries(GEAR).map(([id, g]) => (
                <option key={id} value={id}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Party
            <select value={options.party} onChange={(e) => load({ ...options, party: Number(e.target.value) as 2 | 3 | 4 })}>
              {[2, 3, 4].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Charge {Math.round(me.ultimateCharge ?? 0)}
            <input
              type="range"
              min={0}
              max={ULTIMATE_MAX}
              value={me.ultimateCharge ?? 0}
              onChange={(e) => {
                const next = structuredClone(run);
                next.players[0].ultimateCharge = Number(e.target.value);
                setRun(next);
              }}
            />
          </label>
          <label>
            Cut
            <select value={mode} onChange={(e) => setMode(e.target.value as "full" | "fast")}>
              <option value="full">Full</option>
              <option value="fast">Fast</option>
            </select>
          </label>
          <label>
            <input type="checkbox" checked={motion} onChange={(e) => setMotion(e.target.checked)} /> Motion
          </label>
          <button onClick={() => trigger()} disabled={s.phase !== "COMBAT"}>
            ✦ Trigger Ultimate
          </button>
          <button onClick={() => load(options)}>Reset</button>
        </div>
        <div className="preview-controls ult-lab-transport">
          <button
            onClick={() => {
              api.current?.setPaused(!paused);
              setPaused(!paused);
            }}
          >
            {paused ? "▶ Play" : "▮▮ Pause"}
          </button>
          <button onClick={() => api.current?.frameStep()}>Frame ▸</button>
          {[0.25, 0.5, 1, 2].map((n) => (
            <button
              key={n}
              data-on={(n === 0.25 ? tempo === "0.25" : speed === n && tempo === "1") ? "" : undefined}
              onClick={() => {
                if (n === 0.25) {
                  setTempo("0.25");
                  setSpeed(1);
                  api.current?.setSpeed(1);
                } else {
                  setTempo("1");
                  setSpeed(n);
                  api.current?.setSpeed(n);
                }
              }}
            >
              {n}×
            </button>
          ))}
          {(Object.keys(NO_DEBUG) as (keyof CinematicDebug)[]).map((k) => (
            <label key={k}>
              <input type="checkbox" checked={debug[k]} onChange={() => toggle(k)} /> {k}
            </label>
          ))}
          <button onClick={() => api.current?.skipCinematic()}>Skip</button>
        </div>
      </header>
      <div className="ult-lab-body">
        <div className="preview-viewport" style={{ width: `${w}px`, height: `${h}px` }}>
          <main className="game-main phase-combat">
            {error && <p role="alert">{error}</p>}
            {s.phase === "COMBAT" ? (
              <Combat
                key={`${generation}`}
                s={s}
                send={send}
                disabled={exit.ending}
                onSettled={exit.ending ? exit.finish : undefined}
                reducedMotion={!motion}
                cinematics={mode}
                lab={hooks}
              />
            ) : (
              <p role="status">Encounter finished. Reset to continue.</p>
            )}
          </main>
        </div>
        <LabPanel
          api={api}
          film={film}
          seek={seek}
          markers={debug.markers}
          gear={me.items.map((id) => items.find((i) => i.id === id)?.name).join(", ") || "base"}
        />
      </div>
    </div>
  );
}

/**
 * The readout: time, shot, marker and the timeline strip. Its own component
 * with its own per-frame state, so sampling the clock sixty times a second
 * re-renders this panel and never the combat screen being measured.
 */
function LabPanel({
  api,
  film,
  seek,
  markers,
  gear,
}: {
  api: { current: LabApi | null };
  film: ReturnType<typeof cinematicFor> | null;
  seek: (ms: number) => void;
  markers: boolean;
  gear: string;
}) {
  const [clock, setClock] = useState({ t: 0, duration: 0, shot: -1, marker: "", id: "" });
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const c = api.current?.cinematic();
      if (c) {
        const t = c.at(api.current!.loop.clock.time);
        const shot = c.timeline.shots.findIndex((x) => t < x.start + x.length);
        setClock((prev) =>
          Math.abs(prev.t - t) < 1 && prev.id === c.cinematic.id
            ? prev
            : { t, duration: c.duration, shot, marker: c.marker ?? "", id: c.cinematic.id },
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [api]);
  const timeline = api.current?.cinematic()?.timeline;
  return (
    <aside className="ult-lab-panel" data-testid="ult-lab-panel">
      <h2>{film?.id ?? "—"}</h2>
      <p className="ult-lab-time">
        {clock.id ? `${Math.round(clock.t)} / ${Math.round(clock.duration)} ms` : "not playing"}
        {clock.shot >= 0 && timeline ? ` · shot ${clock.shot + 1}/${timeline.shots.length}` : ""}
        {clock.marker ? ` · ${clock.marker}` : ""}
      </p>
      {timeline && markers && (
        <div className="ult-lab-timeline">
          {timeline.shots.map((x) => (
            <button
              key={x.id}
              style={{ flexGrow: x.length }}
              data-on={clock.shot === x.index ? "" : undefined}
              onClick={() => seek(x.start + 1)}
              title={x.purpose}
            >
              {x.index + 1}
            </button>
          ))}
          <i style={{ left: `${(clock.t / Math.max(1, clock.duration)) * 100}%` }} />
          {timeline.instants
            .filter((x) => x.kind === "marker" || x.kind === "reveal")
            .map((x, i) => (
              <b key={i} data-kind={x.kind} style={{ left: `${(x.t / timeline.duration) * 100}%` }} />
            ))}
        </div>
      )}
      <ol className="ult-lab-shots">
        {(timeline?.shots ?? film?.shots ?? []).map((x, i) => (
          <li key={x.id} data-on={clock.shot === i ? "" : undefined}>
            <button onClick={() => timeline && seek((x as { start?: number }).start! + 1)} disabled={!timeline}>
              {i + 1}. {x.kind} · {x.id}
            </button>
            <small>{x.purpose}</small>
          </li>
        ))}
      </ol>
      <p>Gear worn: {gear}</p>
    </aside>
  );
}

if (import.meta.env.DEV) createRoot(document.getElementById("root")!).render(<UltimateLab />);
