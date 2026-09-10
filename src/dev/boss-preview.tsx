import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Combat } from "../client/components/Combat";
import { items } from "../content/items";
import { reduce, snapshot } from "../engine/game";
import type { Intent } from "../shared/protocol";
import {
  bossFixture,
  finishPreviewRound,
  type FixtureOptions,
} from "./boss-fixture";
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
    },
    viewport: q.get("viewport") ?? "fit",
    you: num("you", 0),
    motion: q.get("motion") === "1",
  };
}
const initial = fromUrl();

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
  const s = snapshot(
    run,
    you,
    run.players.map((p) => p.id),
  );
  function load(next: FixtureOptions) {
    if (next.boss === "miser" && next.stage === "released")
      next = { ...next, stage: "resolved" };
    setOptions(next);
    setRun(bossFixture(next));
    setYou("preview-0");
    setGeneration((n) => n + 1);
    setError("");
  }
  function send(intent: Intent) {
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
        <p>
          Real combat UI and rules. Changes stay in this tab. Unplanned heroes
          Brace when you finish a round.
        </p>
        <div className="preview-controls">
          <label>
            Boss{" "}
            <select
              value={options.boss}
              onChange={(e) =>
                load({
                  ...options,
                  boss: e.target.value as FixtureOptions["boss"],
                })
              }
            >
              <option value="collector">The Collector</option>
              <option value="miser">The Miser</option>
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
              setRun(finishPreviewRound(run));
              setError("");
            }}
          >
            Finish round
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
              disabled={false}
              reducedMotion={!motion}
            />
          ) : (
            <p role="status">
              Encounter finished: {s.outcome ?? s.phase}. Reset the scene to
              continue.
            </p>
          )}
        </main>
      </div>
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
