import { Auction } from "../client/components/Auction";
import { Results } from "../client/components/RunScreens";
import { bossFixture } from "./boss-fixture";
import { snapshot } from "../engine/game";
import { BattleVfx } from "../client/components/BattleVfx";
import type { Vfx } from "../client/battle/director";
import type { Placement } from "../client/battle/layout";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { PARTY } from "../client/components/heroes";
import { EquipmentProvider } from "../client/equipment/Equipment";
import { Strongbox } from "../client/components/Strongbox";
import { useAnimators } from "../client/battle/useAnimators";
import { items } from "../content/items";
import type { ClipName } from "../shared/presentation";
import "../client/style.css";
import "./equipment-preview.css";
function Workshop() {
  const q = new URLSearchParams(location.search);
  const [hero, setHero] = useState(q.get("hero") ?? "vanguard");
  const [gear, setGear] = useState<string[]>(
    q.get("items")?.split(",").filter(Boolean) ?? [],
  );
  const [held, setHeld] = useState<string[]>([]);
  const [broken, setBroken] = useState(false);
  const [pulse, setPulse] = useState("");
  const [tick, setTick] = useState(0);
  const [preview, setPreview] = useState<string>();
  const [row, setRow] = useState(false);
  const [transfer, setTransfer] = useState<Vfx[]>([]);
  const [paused, setPaused] = useState(false);
  const animators = useAnimators({ paused });
  const root = useRef<HTMLSpanElement>(null);
  const Hero = PARTY[hero];
  useEffect(() => {
    animators.register("workshop", hero);
    animators.attach("workshop", root.current);
  }, [hero, animators]);
  function travel(id: string, back = false) {
    setTransfer([
      {
        key: Date.now(),
        kind: "gearTransfer",
        itemId: id,
        from: back ? "box" : "hero",
        to: back ? "hero" : "box",
        life: 900,
      },
    ]);
  }
  function equip(slot: string, id: string) {
    setGear((g) => [
      ...g.filter((x) => items.find((i) => i.id === x)?.slot !== slot),
      ...(id ? [id] : []),
    ]);
  }
  function flash(id: string) {
    setPulse(id);
    setTick((n) => n + 1);
  }
  if (q.get("screen")) {
    const run = bossFixture({
      boss: "collector",
      size: 4,
      stage: "opening",
      gold: 700,
      legacy: false,
    });
    run.players.forEach(
      (p, i) =>
        (p.items =
          i === 0
            ? ["blood-price", "bastion", "bounty"]
            : i === 1
              ? ["stormglass", "thornmail", "reservoir"]
              : i === 2
                ? ["lens", "bastion", "wellspring"]
                : ["cinder", "thornmail", "shared-cup"]),
    );
    const demo = snapshot(
      run,
      run.players[0].id,
      run.players.map((p) => p.id),
    );
    if (q.get("screen") === "results") {
      demo.phase = "COMPLETE";
      demo.outcome = "victory";
      demo.startedAt = 0;
      demo.endedAt = 42 * 60000;
      return (
        <main className="app-shell">
          <Results
            s={demo}
            onLeave={() => location.assign("/dev/equipment.html")}
          />
        </main>
      );
    }
    demo.phase = "AUCTION";
    demo.auction = {
      item: items.find((i) => i.id === "stormglass")!,
      revealed: true,
      price: 180,
      active: demo.players.map((p) => p.id),
      acted: [],
      stage: "interest",
      approvals: {},
      round: 1,
    };
    return (
      <main className="game-main phase-auction">
        <Auction s={demo} send={() => {}} disabled={false} />
      </main>
    );
  }
  return (
    <main className="gear-workshop">
      <header>
        <span className="eyebrow">DUNGEON PACT · BATTLE LAB</span>
        <h1>The equipment workshop</h1>
        <p>Authored cutouts · inherited motion · visible contracts</p>
        <a href="/dev/bosses.html">Return to combat lab</a>
      </header>
      <div className="workshop-layout">
        <section className="workshop-controls">
          <label>
            Hero
            <select
              aria-label="Hero"
              value={hero}
              onChange={(e) => setHero(e.target.value)}
            >
              {Object.keys(PARTY).map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </label>
          {(["weapon", "armor", "relic"] as const).map((slot) => (
            <div key={slot}>
              <label>
                {slot}
                <select
                  aria-label={slot}
                  value={
                    gear.find(
                      (id) => items.find((i) => i.id === id)?.slot === slot,
                    ) ?? ""
                  }
                  onChange={(e) => equip(slot, e.target.value)}
                >
                  <option value="">Base / unequipped</option>
                  {items
                    .filter((i) => i.slot === slot)
                    .map((i) => (
                      <option value={i.id} key={i.id}>
                        {i.name}
                      </option>
                    ))}
                </select>
              </label>
              <button
                onClick={() => {
                  const pool = items.filter((i) => i.slot === slot);
                  const at = pool.findIndex((i) => gear.includes(i.id));
                  equip(slot, pool[(at + 1) % pool.length].id);
                }}
              >
                Cycle {slot}
              </button>
              <button
                onClick={() =>
                  flash(
                    gear.find(
                      (id) => items.find((i) => i.id === id)?.slot === slot,
                    ) ?? "",
                  )
                }
              >
                Trigger {slot}
              </button>
            </div>
          ))}
          <div className="workshop-actions">
            {(
              [
                "idle",
                "anticipate",
                "attack",
                "hurt",
                "defeat",
                "revive",
              ] as ClipName[]
            ).map((clip) => (
              <button
                key={clip}
                onClick={() => {
                  setPaused(false);
                  animators.play(
                    "workshop",
                    clip,
                    clip === "defeat" ? "down" : "idle",
                  );
                }}
              >
                {clip}
              </button>
            ))}
            <button onClick={() => setRow((r) => !r)}>Front / back row</button>
            <button onClick={() => setPaused((p) => !p)}>
              {paused ? "Resume" : "Freeze pose"}
            </button>
          </div>
          <button
            onClick={() => {
              const id = gear.find(
                (id) => items.find((i) => i.id === id)?.slot === "weapon",
              );
              if (id) {
                flash(id);
                travel(id);
                setGear((g) => g.filter((x) => x !== id));
                setHeld((h) => [...h, id]);
                setBroken(false);
              }
            }}
          >
            Collector seizes weapon
          </button>
          <button
            onClick={() => {
              held.forEach((id) => travel(id, true));
              setGear((g) => [...g, ...held]);
              setHeld([]);
              setBroken(true);
            }}
          >
            Break Strongbox / return
          </button>
          <label>
            Auction preview
            <select
              aria-label="Auction preview"
              value={preview ?? ""}
              onChange={(e) => setPreview(e.target.value || undefined)}
            >
              <option value="">None</option>
              {items
                .filter((i) => i.slot !== "supply")
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
            </select>
          </label>
        </section>
        <section className="workshop-stage" data-held={held.join(",")}>
          <div className="workshop-label">
            {hero.toUpperCase()} {preview && <b>PREVIEW</b>}
          </div>
          <span
            className="workshop-actor"
            style={{ left: row ? "8%" : "15%" }}
            ref={root}
            key={hero}
          >
            <EquipmentProvider
              items={gear}
              preview={preview}
              pulse={pulse}
              pulseKey={tick}
            >
              <Hero unitId="workshop" animators={animators} />
            </EquipmentProvider>
          </span>
          <div className="workshop-vault">
            <Strongbox
              held={held.length}
              itemIds={held}
              state={broken ? "broken" : held.length ? "holding" : "empty"}
            />
          </div>
          <BattleVfx
            vfx={transfer}
            pops={[]}
            places={
              new Map([
                ["hero", { id: "hero", x: row ? 0.27 : 0.34, y: 0.76 }],
                ["box", { id: "box", x: 0.88, y: 0.81 }],
              ] as [string, Placement][])
            }
          />
          <div className="workshop-build">
            {gear.map((id) => (
              <span key={id}>{items.find((i) => i.id === id)?.name}</span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
if (import.meta.env.DEV)
  createRoot(document.getElementById("root")!).render(<Workshop />);
