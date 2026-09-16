import { useState } from "react";
import { createRoot } from "react-dom/client";
import { createRun, addPlayer, reduce, snapshot } from "../engine/game";
import { enterAuction, nextLot } from "../engine/auction";
import { ExpeditionGuide } from "../client/components/ExpeditionGuide";
import { Auction } from "../client/components/Auction";
import { Shop } from "../client/components/Shop";
import {
  DungeonMap,
  Mentor,
  Shrine,
  TollGate,
} from "../client/components/RunScreens";
import { enterShrine, enterToll } from "../engine/chambers";
import { enterForge } from "../engine/shop";
import { generateMap } from "../engine/map";
import { mentors } from "../content/evolutions";
import { enterShop } from "../engine/shop";
import { Onboarding } from "../client/components/Onboarding";
import { SceneTransition } from "../client/components/SceneTransition";
import type { Intent } from "../shared/protocol";
import "../client/style.css";
function Lab() {
  const [s, set] = useState(() => {
    const state = createRun("TESTROOM", "expansion-browser");
    addPlayer(state, "a", "Ada");
    addPlayer(state, "b", "Bea");
    state.phase = "MAP";
    state.players[0].items = ["stormglass"];
    state.players[1].items = ["blood-price"];
    if (new URLSearchParams(location.search).has("auction")) {
      enterAuction(state, false);
      nextLot(state);
    }
    if (new URLSearchParams(location.search).has("shop")) enterShop(state);
    const q = new URLSearchParams(location.search);
    if (q.has("toll")) enterToll(state);
    if (q.has("shrine")) enterShrine(state);
    if (q.has("forge")) {
      state.players[1].items = ["blood-price", "thornmail"];
      enterForge(state);
    }
    if (new URLSearchParams(location.search).has("map")) {
      // `?map=2` stages the second floor.
      state.floor = Number(q.get("map")) || 1;
      state.map = generateMap(state);
      state.phase = "MAP";
      // Standing in the first chamber, so the live route out of it is drawn.
      const entry = state.map.find((n) => n.depth === 0)!;
      entry.visited = true;
      state.currentNode = entry.id;
    }
    if (new URLSearchParams(location.search).has("mentor")) {
      // A ground that raises Vanguards, with a Warden standing in it: the two
      // offers this screen has to tell apart.
      state.players[0].heroId = "vanguard";
      state.players[1].heroId = "warden";
      state.phase = "MENTOR";
      state.mentorId = mentors[0].id;
      state.mentorClass = "vanguard";
      state.trained = [];
      state.gold = 600;
    }
    return state;
  });
  const [you, select] = useState("a");
  const [error, fail] = useState("");
  const send = (intent: Intent) => {
    try {
      set(reduce(s, you, intent, 0));
      fail("");
    } catch (e) {
      fail(String(e));
    }
  };
  const snap = snapshot(s, you, ["a", "b"]);
  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "auto" }}>
      <h1>Expedition expansion lab</h1>
      <label>
        Acting player{" "}
        <select value={you} onChange={(e) => select(e.target.value)}>
          <option value="a">Ada</option>
          <option value="b">Bea</option>
        </select>
      </label>
      <p role="status">Treasury: {s.gold}</p>
      <p role="alert">{error}</p>
      {s.players.map((p) => (
        <p key={p.id} data-testid={`gear-${p.id}`}>
          {p.name}: {p.items.join(", ")}
        </p>
      ))}
      {s.phase === "TOLL" ? (
        <TollGate s={snap} send={send} disabled={false} />
      ) : s.phase === "SHRINE" ? (
        <Shrine s={snap} send={send} disabled={false} />
      ) : s.phase === "MAP" && s.map.length ? (
        <DungeonMap s={snap} send={send} disabled={false} />
      ) : s.phase === "MENTOR" ? (
        <Mentor s={snap} send={send} disabled={false} />
      ) : s.phase === "SHOP" ? (
        <Shop s={snap} send={send} disabled={false} />
      ) : s.phase === "AUCTION" ? (
        <Auction s={snap} send={send} disabled={false} />
      ) : (
        <ExpeditionGuide s={snap} send={send} disabled={false} />
      )}
      {/* The card between scenes, as the game lays it over a change of phase. */}
      <SceneTransition s={snap} reducedMotion={false} />
      {new URLSearchParams(location.search).has("tutorial") && (
        <Onboarding phase={s.phase} />
      )}
    </main>
  );
}
if (import.meta.env.DEV)
  createRoot(document.getElementById("root")!).render(<Lab />);
