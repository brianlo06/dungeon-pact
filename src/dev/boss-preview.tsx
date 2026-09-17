import { useEffect, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Combat } from "../client/components/Combat";
import { useCombatExit } from "../client/battle/useCombatExit";
import { items } from "../content/items";
import { encounters } from "../content/encounters";
import { reduce, snapshot } from "../engine/game";
import type { Intent } from "../shared/protocol";
import {
  bossFixture,
  finishPreviewRound,
  type FixtureOptions,
} from "./boss-fixture";
import { ChoreoPanel, useChoreoLab } from "./choreo-lab";
import "../client/style.css";
import "./boss-preview.css";

const defaults: FixtureOptions = {
  boss: "collector",
  size: 4,
  stage: "objective",
  gold: 700,
  legacy: false,
};

/**
 * The lab is driven by the query string as well as the controls, so a scene can
 * be linked, reloaded and asserted against. Every automated layout check names
 * the state it is testing in its URL rather than clicking its way there.
 */
function fromUrl(): {
  options: FixtureOptions;
  viewport: string;
  you: number;
  motion: boolean;
  tempo: string;
  /** Show the choreography panel. */
  choreo: boolean;
  /** Draw the choreography debug overlay. */
  debug: boolean;
} {
  const q = new URLSearchParams(location.search);
  const num = (k: string, fallback: number) => {
    const v = Number(q.get(k));
    return Number.isFinite(v) && q.has(k) ? v : fallback;
  };
  return {
    options: {
      ...defaults,
      boss: (q.get("boss") as FixtureOptions["boss"]) ?? defaults.boss,
      size: num("party", defaults.size) as FixtureOptions["size"],
      stage: (q.get("stage") as FixtureOptions["stage"]) ?? defaults.stage,
      gold: num("gold", defaults.gold),
      legacy: q.get("legacy") === "1",
      downed: q.get("downed") === "1",
      longNames: q.get("longNames") === "1",
      encounter: q.get("encounter") ?? undefined,
      heroes: q.get("heroes")?.split(",").filter(Boolean),
      finisher: q.has("finisher"),
      hazard: (q.get("hazard") as "vents" | "collapse" | null) ?? undefined,
    },
    viewport: q.get("viewport") ?? "fit",
    you: num("you", 0),
    motion: q.get("motion") === "1",
    tempo: q.get("tempo") ?? "1",
    choreo: q.get("choreo") === "1",
    debug: q.get("debug") === "1",
  };
}
const initial = fromUrl();
// Presentation reads motion and tempo from the document, and the first
// animators register in effects that run before any effect of the lab's own,
// so both are set before anything renders. Set in an effect, a slowed capture
// could start its animators at full speed.
document.documentElement.dataset.motion = initial.motion ? "full" : "reduced";
document.documentElement.dataset.tempo = initial.tempo;

function BossPreview() {
  const [options, setOptions] = useState(initial.options);
  const [run, setRun] = useState(() => bossFixture(initial.options));
  const [you, setYou] = useState(`preview-${initial.you}`);
  const [generation, setGeneration] = useState(0);
  const [error, setError] = useState("");
  const [motion, setMotion] = useState(initial.motion);
  // Explicit viewport sizes, so the resolutions the design has to survive can
  // be checked without resizing the browser window.
  const [size, setSize] = useState(initial.viewport);
  const [evidence, setEvidence] = useState(false);
  const [w, h] = size === "fit" ? [0, 0] : size.split("x").map(Number);
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "full" : "reduced";
  }, [motion]);
  // Capture tempo. Development only: it slows presentation so intermediate
  // animation states can actually be inspected.
  const [tempo, setTempo] = useState(initial.tempo);
  useEffect(() => {
    document.documentElement.dataset.tempo = tempo;
  }, [tempo]);
  // Memoised because the exit hold compares snapshots by identity: a fresh
  // object every render would read as a new board arriving every frame.
  const live = useMemo(
    () =>
      snapshot(
        run,
        you,
        run.players.map((p) => p.id),
      ),
    [run, you],
  );
  const exit = useCombatExit(live);
  const s = exit.state!;
  const [panel, setPanel] = useState(initial.choreo);
  const lab = useChoreoLab(s, run, setRun, initial.debug);
  function load(next: FixtureOptions) {
    lab.clear();
    if (next.boss === "miser" && next.stage === "released")
      next = { ...next, stage: "resolved" };
    setOptions(next);
    setRun(bossFixture(next));
    setYou("preview-0");
    setGeneration((n) => n + 1);
    setError("");
  }
  function send(intent: Intent) {
    lab.clear();
    try {
      setRun(reduce(run, you, intent, 0));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }
  return (
    <div className="app-shell preview-shell" data-combat="">
      <header className="preview-toolbar">
        <strong>LOCAL BOSS PREVIEW</strong>
        <a href="/dev/equipment.html">Equipment workshop</a>
        <p>
          Real combat UI and rules. Changes stay in this tab. Unplanned heroes
          Brace when you finish a round.
        </p>
        <div className="preview-controls">
          <label>
            Fight{" "}
            <select
              value={options.encounter ?? options.boss}
              onChange={(e) => {
                const v = e.target.value;
                load(
                  v === "collector" || v === "miser" || v === "notary" || v === "assayer" || v === "salvor"
                    ? { ...options, boss: v, encounter: undefined }
                    : { ...options, encounter: v },
                );
              }}
            >
              <option value="collector">The Collector</option>
              <option value="miser">The Miser</option>
              <option value="notary">The Notary</option>
              <option value="assayer">The Assayer</option>
              <option value="salvor">The Salvor</option>
              {encounters.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Party{" "}
            <select
              value={options.size}
              onChange={(e) =>
                load({
                  ...options,
                  size: Number(e.target.value) as FixtureOptions["size"],
                })
              }
            >
              {[2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} heroes
                </option>
              ))}
            </select>
          </label>
          <label>
            Scene{" "}
            <select
              value={options.stage}
              onChange={(e) =>
                load({
                  ...options,
                  stage: e.target.value as FixtureOptions["stage"],
                })
              }
            >
              <option value="opening">Opening briefing</option>
              <option value="objective">Objective intent</option>
              <option value="windup">Wind-up intent</option>
              <option value="resolved">After objective resolves</option>
              {options.boss === "collector" && (
                <option value="released">Strongbox broken</option>
              )}
            </select>
          </label>
          <label>
            Starting gold{" "}
            <select
              value={options.gold}
              onChange={(e) =>
                load({ ...options, gold: Number(e.target.value) })
              }
            >
              {[100, 160, 172, 400, 700].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={options.legacy}
              onChange={(e) => load({ ...options, legacy: e.target.checked })}
            />{" "}
            Legacy rules
          </label>
          <label>
            <input
              type="checkbox"
              checked={motion}
              onChange={(e) => setMotion(e.target.checked)}
            />{" "}
            Round animation
          </label>
          <label>
            Tempo{" "}
            <select value={tempo} onChange={(e) => setTempo(e.target.value)}>
              {["1", "0.5", "0.25", "0.1"].map((n) => (
                <option key={n} value={n}>
                  {n}×
                </option>
              ))}
            </select>
          </label>
          <label>
            Viewport{" "}
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="1280x720">1280 × 720</option>
              <option value="1366x768">1366 × 768</option>
              <option value="1440x900">1440 × 900</option>
              <option value="1920x1080">1920 × 1080</option>
              <option value="fit">Fit window</option>
            </select>
          </label>
          <label>
            Control{" "}
            <select value={you} onChange={(e) => setYou(e.target.value)}>
              {s.players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={s.phase !== "COMBAT"}
            onClick={() => {
              lab.clear();
              setRun(finishPreviewRound(run));
              setError("");
            }}
          >
            Finish round
          </button>
          <button onClick={() => setPanel((v) => !v)}>
            {panel ? "Hide" : "Show"} choreography
          </button>
          <button onClick={() => load(options)}>Reset scene</button>
          <button onClick={() => setEvidence((v) => !v)}>
            {evidence ? "Hide" : "Show"} fixture data
          </button>
        </div>
      </header>
      <div
        className="preview-viewport"
        data-fit={size === "fit" ? "" : undefined}
        style={
          w
            ? ({ width: `${w}px`, height: `${h}px` } as React.CSSProperties)
            : undefined
        }
      >
        <main className="game-main phase-combat">
          {error && <p role="alert">{error}</p>}
          {s.phase === "COMBAT" ? (
            <Combat
              key={`${generation}-${you}`}
              s={s}
              send={send}
              disabled={exit.ending}
              onSettled={exit.ending ? exit.finish : undefined}
              reducedMotion={!motion}
              lab={lab.hooks}
            />
          ) : (
            <p role="status">
              Encounter finished: {s.outcome ?? s.phase}. Reset the scene to
              continue.
            </p>
          )}
        </main>
      </div>
      {panel && s.phase === "COMBAT" && <ChoreoPanel s={s} lab={lab} />}
      {evidence && (
        <section className="preview-evidence" aria-label="Fixture evidence">
          <h2>Equipment after settlement</h2>
          <ul>
            {s.players.map((p) => (
              <li key={p.id}>
                <strong>{p.name}:</strong>{" "}
                {p.items
                  .map((id) => items.find((i) => i.id === id)?.name ?? id)
                  .join(" · ") || "None"}
              </li>
            ))}
          </ul>
          <h2>Recent combat log</h2>
          <ol>
            {s.logs.slice(-14).map((entry) => (
              <li key={entry.seq}>{entry.text}</li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

if (import.meta.env.DEV)
  createRoot(document.getElementById("root")!).render(<BossPreview />);
