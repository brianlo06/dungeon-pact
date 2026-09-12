import { useState } from "react";
import { createRoot } from "react-dom/client";
import { createRun, addPlayer, reduce, snapshot } from "../engine/game";
import { enterAuction, nextLot } from "../engine/auction";
import { ExpeditionGuide } from "../client/components/ExpeditionGuide";
import { Auction } from "../client/components/Auction";
import { Shop } from "../client/components/Shop";
import { Mentor } from "../client/components/RunScreens";
import { mentors } from "../content/evolutions";
import { enterShop } from "../engine/shop";
import { Onboarding } from "../client/components/Onboarding";
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
      {s.phase === "MENTOR" ? (
        <Mentor s={snap} send={send} disabled={false} />
      ) : s.phase === "SHOP" ? (
        <Shop s={snap} send={send} disabled={false} />
      ) : s.phase === "AUCTION" ? (
        <Auction s={snap} send={send} disabled={false} />
      ) : (
        <ExpeditionGuide s={snap} send={send} disabled={false} />
      )}
      {new URLSearchParams(location.search).has("tutorial") && (
        <Onboarding phase={s.phase} />
      )}
    </main>
  );
}
if (import.meta.env.DEV)
  createRoot(document.getElementById("root")!).render(<Lab />);
