import { GuildScene } from "./components/GuildScene";
import { SceneTransition } from "./components/SceneTransition";
import { useCombatExit } from "./battle/useCombatExit";
import { ExpeditionGuide } from "./components/ExpeditionGuide";
import { Onboarding } from "./components/Onboarding";
import { mixer } from "./audio/engine";
import { PixelIcon } from "./components/PixelIcon";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  useRoom,
  savedCredentials,
  resumableCredentials,
  leaveRoom,
  type Credentials,
} from "./useRoom";
import { audio, defaultSettings, type Settings } from "./audio";
import { Combat } from "./components/Combat";
import { Auction } from "./components/Auction";
import { Shop } from "./components/Shop";
import {
  Lobby,
  Pact,
  DungeonMap,
  EventRoom,
  Camp,
  Mentor,
  Upgrade,
  Reward,
  Results,
  TollGate,
  Shrine,
} from "./components/RunScreens";
import { items } from "../content/items";
import { isBoss } from "../content/enemies";
export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(
    resumableCredentials,
  );
  const room = useRoom(credentials);
  const [name, setName] = useState(localStorage.getItem("pact.name") ?? "");
  const [code, setCode] = useState(
    new URLSearchParams(location.search).get("room") ?? "",
  );
  const [busy, setBusy] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inventory, setInventory] = useState(false);
  useEffect(() => {
    // Reconnecting players may never press Join; the first gesture unlocks audio.
    const unlock = () => {
      audio.unlock();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      return {
        ...defaultSettings,
        ...JSON.parse(localStorage.getItem("pact.settings") ?? "{}"),
      };
    } catch {
      return defaultSettings;
    }
  });
  useEffect(() => {
    audio.settings = settings;
    mixer.setMuted(settings.muted);
    mixer.setLevel("master", settings.master);
    mixer.setLevel("sfx", settings.sfx);
    mixer.setLevel("ui", settings.ui);
    localStorage.setItem("pact.settings", JSON.stringify(settings));
    document.documentElement.dataset.motion = settings.reducedMotion
      ? "reduced"
      : "full";
  }, [settings]);
  async function join(create: boolean) {
    audio.unlock();
    setBusy(true);
    room.setError("");
    try {
      let roomCode = code.trim().toUpperCase();
      if (create) {
        const res = await fetch("/api/rooms", { method: "POST" });
        const data = z
          .object({ room: z.string().optional(), error: z.string().optional() })
          .parse(await res.json());
        if (!res.ok || !data.room)
          throw Error(data.error ?? "Could not create room");
        roomCode = data.room;
      }
      const res = await fetch(`/api/rooms/${roomCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const raw = await res.json();
      if (!res.ok)
        throw Error(z.object({ error: z.string() }).parse(raw).error);
      const data = z
        .object({ room: z.string(), player: z.string(), token: z.string() })
        .parse(raw);
      // Joining one pact leaves any other this browser was seated in, so an
      // abandoned lobby does not keep a seat nobody will ready.
      const previous = savedCredentials();
      if (previous && previous.room !== data.room) leaveRoom(previous);
      localStorage.setItem("pact.session", JSON.stringify(data));
      localStorage.setItem("pact.name", name.trim());
      setCredentials(data);
    } catch (e) {
      room.setError(e instanceof Error ? e.message : "Unable to join");
    } finally {
      setBusy(false);
    }
  }
  /** Lets go of the room on this device only; the hero stays in it. */
  function forget() {
    localStorage.removeItem("pact.session");
    setCredentials(null);
    setConfirmLeave(false);
    history.replaceState(null, "", location.pathname);
  }
  function leave() {
    if (credentials) leaveRoom(credentials);
    forget();
  }
  /**
   * Leaving mid-run takes the hero out of the run for good, so it is asked
   * first. A lobby seat or a finished run costs nothing to give up.
   */
  function requestLeave() {
    const phase = room.state?.phase;
    if (phase === "LOBBY" || phase === "COMPLETE") leave();
    else setConfirmLeave(true);
  }
  // Left from another tab: this one lets go too instead of reconnecting.
  useEffect(() => {
    if (room.connection !== "left") return;
    forget();
  }, [room.connection]);
  const combatExit = useCombatExit(room.state);
  const s = combatExit.state;
  const musicBiome =
    s?.map.find((n) => n.id === s.currentNode)?.biome ?? "foundry";
  const musicBoss = s?.enemies.some((e) => isBoss(e.definition)) ?? false;
  useEffect(() => {
    const update = () =>
      audio.setScene(
        s?.phase === "COMPLETE" && s.outcome === "defeat"
          ? "DEFEAT"
          : (s?.phase ?? ""),
        musicBiome,
        musicBoss,
      );
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
    };
  }, [s?.phase, s?.outcome, musicBiome, musicBoss, settings]);
  useEffect(() => () => audio.setScene(""), []);
  const disabled =
    room.pending || room.connection !== "online" || combatExit.ending;
  const props = s ? { s, send: room.send, disabled } : null;
  return (
    <div
      className="app-shell"
      data-combat={s?.phase === "COMBAT" ? "" : undefined}
    >
      <header className="topbar">
        <a className="wordmark" href="#" onClick={(e) => e.preventDefault()}>
          <span>◈</span> DUNGEON <b>PACT</b>
        </a>
        <div className="topbar-right">
          {s && (
            <>
              <span className="connection">
                {room.connection === "online"
                  ? "● LIVE PACT"
                  : room.connection.toUpperCase()}
              </span>
              <div className="treasury">
                <small>TEAM TREASURY</small>
                <strong>
                  <PixelIcon name="coin" /> {s.gold.toLocaleString()}{" "}
                  <span>GOLD</span>
                </strong>
              </div>
              <button onClick={() => setInventory(!inventory)}>Builds</button>
            </>
          )}
          {s && s.phase !== "COMPLETE" && (
            <button onClick={requestLeave}>Leave pact</button>
          )}
          <button
            aria-label="Open settings"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </button>
        </div>
      </header>
      {room.error && (
        <div role="alert" className="error">
          {room.error}
          <button onClick={() => room.setError("")}>Dismiss</button>
        </div>
      )}
      {!credentials ? (
        <main className="guild-hall">
          <section className="hall-content">
            <span className="eyebrow">2–4 FRIENDS. ONE SHARED COIN PURSE.</span>
            <h1>
              DUNGEON
              <br />
              <em>PACT</em>
            </h1>
            <p>
              Delve together. Spend irresponsibly.
              <br />
              Try to get everyone home.
            </p>
            <div className="entry-panel">
              <label>
                Your name
                <input
                  maxLength={24}
                  placeholder="Adventurer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <button
                className="primary"
                disabled={busy || !name.trim()}
                onClick={() => void join(true)}
              >
                Create a pact <span>→</span>
              </button>
              <div className="or">or join your friends</div>
              <div className="join-row">
                <input
                  aria-label="Room code"
                  maxLength={8}
                  placeholder="ROOM CODE"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
                <button
                  disabled={busy || !name.trim() || code.trim().length !== 8}
                  onClick={() => void join(false)}
                >
                  Join →
                </button>
              </div>
            </div>
            <div className="hall-footnote">
              <span>01 / THE EMBER FOUNDRY</span>
              <span>Development expedition</span>
            </div>
          </section>
          <GuildScene />
        </main>
      ) : !s ? (
        <main className="center-screen">
          <h1>
            {room.connection === "superseded"
              ? "Your pact is open in another tab."
              : "Finding your pact…"}
          </h1>
          <p>Rejoining the same room restores your hero.</p>
          {room.connection === "superseded" ? (
            <button onClick={forget}>Return to hall</button>
          ) : (
            <button onClick={requestLeave}>Leave pact</button>
          )}
        </main>
      ) : (
        <>
          <main className={`game-main phase-${s.phase.toLowerCase()}`}>
            {s.phase === "LOBBY" && <Lobby {...props!} />}{" "}
            {s.phase === "PACT" && <Pact {...props!} />}{" "}
            {s.phase === "MAP" && <DungeonMap {...props!} />}{" "}
            {s.phase === "COMBAT" && (
              <Combat
                key={s.currentNode}
                {...props!}
                reducedMotion={settings.reducedMotion}
                cinematics={settings.cinematics}
                onLeave={requestLeave}
                onSettled={combatExit.ending ? combatExit.finish : undefined}
              />
            )}{" "}
            {s.phase === "AUCTION" && <Auction {...props!} />}{" "}
            {s.phase === "SHOP" && <Shop {...props!} />}
            {s.phase === "EVENT" && <EventRoom {...props!} />}{" "}
            {s.phase === "CAMP" && <Camp {...props!} />}{" "}
            {s.phase === "TOLL" && <TollGate {...props!} />}
            {s.phase === "SHRINE" && <Shrine {...props!} />}
            {s.phase === "MENTOR" && <Mentor {...props!} />}{" "}
            {s.phase === "UPGRADE" && <Upgrade {...props!} />}{" "}
            {s.phase === "REWARD" && <Reward {...props!} />}{" "}
            {s.phase === "COMPLETE" && <Results s={s} onLeave={leave} />}
          </main>
          <SceneTransition s={s} reducedMotion={settings.reducedMotion} />
          <footer className="run-footer">
            <ExpeditionGuide {...props!} />
            <div className="pings">
              {(
                [
                  "Save gold",
                  "Buy this",
                  "Need healing",
                  "Focus target",
                ] as const
              ).map((message) => (
                <button
                  disabled={disabled}
                  key={message}
                  onClick={() => room.send({ type: "ping", message })}
                >
                  {message}
                </button>
              ))}
            </div>
            <details className="chronicle">
              <summary>
                PACT CHRONICLE <span>{s.logs.at(-1)?.text}</span>
              </summary>
              <ol>
                {s.logs.slice(-25).map((l) => (
                  <li className={"log-" + l.kind} key={l.seq}>
                    {l.text}
                  </li>
                ))}
              </ol>
            </details>
          </footer>
          {room.connection !== "online" && (
            <div className="reconnect" role="status">
              <strong>
                {room.connection === "superseded"
                  ? "Opened in another tab"
                  : "Reconnecting…"}
              </strong>
              <p>Your hero and treasury remain in the room.</p>
              {room.connection === "superseded" ? (
                <button onClick={forget}>Return to hall</button>
              ) : (
                <button onClick={requestLeave}>Leave pact</button>
              )}
            </div>
          )}
        </>
      )}
      {inventory && s && (
        <div className="modal-backdrop">
          <section className="modal">
            <button className="close" onClick={() => setInventory(false)}>
              Close ×
            </button>
            <h2>The party’s builds</h2>
            {s.players.map((p) => (
              <div key={p.id}>
                <h3>
                  {p.name} · {p.heroId}
                </h3>
                <p>
                  {p.hp}/{p.maxHp} HP · {p.power} Power · {p.guard} Guard
                </p>
                {p.items.length ? (
                  p.items.map((id, n) => {
                    const i = items.find((i) => i.id === id)!;
                    // Supplies stack, so an id is not unique in this list.
                    return (
                      <p key={`${id}-${n}`}>
                        <strong>{i.name}</strong> · {i.slot}
                        <br />
                        {i.description}
                      </p>
                    );
                  })
                ) : (
                  <p className="muted">No purchased equipment yet.</p>
                )}
              </div>
            ))}
          </section>
        </div>
      )}
      {confirmLeave && credentials && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Leave the run"
          >
            <h2>Leave the run?</h2>
            <p>
              Your hero walks out for good and takes their gear. The party keeps
              the treasury and carries on without you. You cannot rejoin this
              run.
            </p>
            <div className="leave-actions">
              <button autoFocus onClick={() => setConfirmLeave(false)}>
                Stay
              </button>
              <button className="primary" onClick={leave}>
                Leave pact
              </button>
            </div>
          </section>
        </div>
      )}
      {s && <Onboarding phase={s.phase} />}
      {settingsOpen && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
          >
            <button
              className="close"
              autoFocus
              onClick={() => setSettingsOpen(false)}
            >
              Close ×
            </button>
            <h2>Make yourself comfortable.</h2>
            {(["master", "music", "sfx", "ui", "ambient"] as const).map(
              (key) => (
                <label className="setting" key={key}>
                  {key.toUpperCase()}{" "}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step=".05"
                    value={settings[key]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        [key]: Number(e.target.value),
                      })
                    }
                  />
                </label>
              ),
            )}
            <label className="setting">
              Mute audio
              <input
                type="checkbox"
                checked={settings.muted}
                onChange={(e) =>
                  setSettings({ ...settings, muted: e.target.checked })
                }
              />
            </label>
            <label className="setting">
              Reduce motion
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) =>
                  setSettings({ ...settings, reducedMotion: e.target.checked })
                }
              />
            </label>
            <label className="setting">
              Ultimate cinematics
              <select
                value={settings.cinematics}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cinematics: e.target.value as typeof settings.cinematics,
                  })
                }
              >
                <option value="full">Full</option>
                <option value="first">Full the first time, then fast</option>
                <option value="fast">Fast</option>
              </select>
            </label>
            <p className="muted">
              Original synthesized feedback and quiet chamber ambience. Ambient
              volume can be set to zero independently. Music is still in
              development.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
