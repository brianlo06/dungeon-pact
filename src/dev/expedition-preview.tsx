import { useState } from "react";
import { createRoot } from "react-dom/client";
import { createRun, addPlayer, reduce, snapshot } from "../engine/game";
import { enterAuction, nextLot } from "../engine/auction";
import { ExpeditionGuide } from "../client/components/ExpeditionGuide";
import { Auction } from "../client/components/Auction";
import { Shop } from "../client/components/Shop";
import {
  DungeonMap,
  EventRoom,
  Lobby,
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
    const q0 = new URLSearchParams(location.search);
    if (q0.has("lobby")) {
      // `?lobby` stages a table mid-pick: Ada has locked in the Ranger, Bea is
      // eyeing the same Ranger, Cy is still deciding and one seat is open.
      addPlayer(state, "c", "Cy");
      const pick = (id: string, hero: string, ready = false) => {
        Object.assign(state, reduce(state, id, { type: "hero", hero }, 0));
        if (ready)
          Object.assign(
            state,
            reduce(state, id, { type: "ready", ready: true }, 0),
          );
      };
      pick("a", "ranger", true);
      pick("b", "ranger");
      pick("c", "arcanist", true);
      if (q0.get("lobby") === "full") {
        addPlayer(state, "d", "Dunstan the Unready");
        pick("d", "reaver");
      }
      return state;
    }
    if (q0.has("event")) {
      // `?event=pay-wheel` stands the party in that event, in a chamber the
      // ambush fights can be fought from. `&size=4` seats four.
      for (const [id, name] of [
        ["c", "Cy"],
        ["d", "Dunstan"],
      ].slice(0, Number(q0.get("size") ?? 2) - 2))
        addPlayer(state, id, name);
      state.players.forEach((p, i) => (p.hp -= 12 * i));
      state.map = [
        {
          id: "n0",
          depth: 2,
          lane: 0,
          type: "event",
          name: "Event",
          next: [],
          visited: true,
        },
      ];
      state.currentNode = "n0";
      state.phase = "EVENT";
      state.eventId = q0.get("event");
      if (q0.has("rng")) state.rng = Number(q0.get("rng"));
      return state;
    }
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
  const snap = snapshot(
    s,
    you,
    s.players.map((p) => p.id),
  );
  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "auto" }}>
      <h1>Expedition expansion lab</h1>
      <label>
        Acting player{" "}
        <select value={you} onChange={(e) => select(e.target.value)}>
          {s.players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <p role="status">Treasury: {s.gold}</p>
      <p role="alert">{error}</p>
      {s.players.map((p) => (
        <p key={p.id} data-testid={`gear-${p.id}`}>
          {p.name}: {p.items.join(", ")}
        </p>
      ))}
      {s.phase === "EVENT" ? (
        <EventRoom s={snap} send={send} disabled={false} />
      ) : s.phase === "LOBBY" ? (
        <Lobby s={snap} send={send} disabled={false} />
      ) : s.phase === "TOLL" ? (
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
