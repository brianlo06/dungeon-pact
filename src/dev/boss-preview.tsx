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

function BossPreview() {
  const [options, setOptions] = useState(defaults);
  const [run, setRun] = useState(() => bossFixture(defaults));
  const [you, setYou] = useState("preview-0");
  const [generation, setGeneration] = useState(0);
  const [error, setError] = useState("");
  const [motion, setMotion] = useState(false);
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
    <div className="app-shell">
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
          <button onClick={() => load(options)}>Reset scene</button>
        </div>
      </header>
      <main className="game-main phase-combat">
        <div className="preview-controls preview-turn">
          <strong>Team treasury: {s.gold} gold</strong>
          <label>
            Control hero{" "}
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
            Finish round · others Brace
          </button>
        </div>
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
      </main>
    </div>
  );
}

if (import.meta.env.DEV)
  createRoot(document.getElementById("root")!).render(<BossPreview />);
