import { Sprite } from "./Sprite";
import { PixelIcon } from "./PixelIcon";
import type { Snapshot } from "../../shared/model";
import type { Intent } from "../../shared/protocol";
import { heroes } from "../../content/heroes";
import { events } from "../../content/events";
import { items } from "../../content/items";
import { upgradeOffer, lines } from "../../content/upgrades";
type Props = { s: Snapshot; send: (i: Intent) => void; disabled: boolean };
export function Lobby({ s, send, disabled }: Props) {
  const me = s.players.find((p) => p.id === s.you)!;
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">EXPEDITION TABLE · 2–4 PLAYERS</span>
          <h1>Pick your troublemaker.</h1>
          <p>Four seats at the table. One very questionable expedition.</p>
        </div>
        <div className="room-code">
          <small>INVITE CODE</small>
          <strong>{s.room}</strong>
          <button
            onClick={() =>
              void navigator.clipboard.writeText(
                `${location.origin}/?room=${s.room}`,
              )
            }
          >
            Copy invite link
          </button>
        </div>
      </div>
      <div className="hero-grid">
        {heroes.map((h) => (
          <button
            key={h.id}
            className={`hero-choice hero-${h.id} ${me.heroId === h.id ? "selected" : ""}`}
            disabled={disabled}
            onClick={() => send({ type: "hero", hero: h.id })}
          >
            <div className="hero-stage">
              <Sprite id={h.id} />
            </div>
            <small>
              {h.resource.toUpperCase()} · {h.hp} HP
            </small>
            <h2>{h.name}</h2>
            <p className="lore">{h.title}</p>
            <p>{h.description}</p>
            <span className="choice-footer">
              {me.heroId === h.id ? "✓ YOUR HERO" : "Choose hero →"}
            </span>
          </button>
        ))}
      </div>
      <section className="lobby-footer">
        <div>
          {s.players.map((p) => (
            <div className="player-line" key={p.id}>
              <span className={s.connected.includes(p.id) ? "online" : "muted"}>
                ●
              </span>
              <strong>{p.name}</strong>
              <span>{p.heroId}</span>
              <span>{p.ready ? "✓ Ready" : "Choosing"}</span>
            </div>
          ))}
          <p className="muted">
            Foundry Expedition · seven chambers · casual planning · no host
            dependency
          </p>
        </div>
        <div className="button-stack">
          <button
            className="primary"
            disabled={disabled}
            onClick={() => send({ type: "ready", ready: !me.ready })}
          >
            {me.ready ? "Cancel ready" : "I accept the pact"}
          </button>
          <button
            disabled={
              disabled ||
              s.players.length < 2 ||
              !s.players.every((p) => p.ready)
            }
            onClick={() => send({ type: "start" })}
          >
            Begin expedition →
          </button>
        </div>
      </section>
    </>
  );
}
function Choice({
  s,
  send,
  disabled,
  id,
  title,
  text,
  cost = 0,
}: { id: string; title: string; text: string; cost?: number } & Props) {
  return (
    <button
      className={`choice ${s.votes[s.you] === id ? "selected" : ""}`}
      disabled={disabled || !!s.votes[s.you] || cost > s.gold}
      onClick={() => send({ type: "vote", choice: id })}
    >
      <h3>{title}</h3>
      <p>{text}</p>
      <span>
        {Object.values(s.votes).filter((v) => v === id).length} votes ·{" "}
        {s.votes[s.you] === id ? "Your vote is locked" : "Cast your vote →"}
      </span>
    </button>
  );
}
export function Pact(props: Props) {
  return (
    <section className="center-screen">
      <span className="eyebrow">BEFORE THE DESCENT</span>
      <h1>Seal your pact.</h1>
      <p>
        The dungeon gives nothing freely. Choose what you can afford to lose.
      </p>
      <div className="choices">
        <Choice
          {...props}
          id="vitality"
          title="The Unbroken"
          text="Every hero gains 10 maximum HP. Enter with 420 gold."
        />
        <Choice
          {...props}
          id="wealth"
          title="The Gilded"
          text="Gain 160 team gold. Every hero sacrifices 12 maximum HP for this run."
        />
      </div>
      <p className="muted">
        Majority decides. Ties rotate authority through the party.
      </p>
    </section>
  );
}
export function DungeonMap(props: Props) {
  const { s } = props;
  const current = s.map.find((n) => n.id === s.currentNode);
  const icons = {
    combat: "sword",
    elite: "skull",
    auction: "gavel",
    mystery: "gem",
    event: "question",
    camp: "fire",
    boss: "crown",
  };
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">REGION I · THE EMBER FOUNDRY</span>
          <h1>Into the Foundry.</h1>
          <p>The furnace still burns. Choose your next chamber together.</p>
        </div>
        <span className="badge">
          {s.map.filter((n) => n.visited).length} / 7 chambers
        </span>
      </div>
      <div className="map-trail">
        {Array.from({ length: 7 }, (_, depth) => (
          <div className="map-layer" key={depth}>
            <small className="map-depth">
              {String(depth + 1).padStart(2, "0")}
            </small>
            {s.map
              .filter((n) => n.depth === depth)
              .map((n) => {
                const available = current
                  ? current.next.includes(n.id)
                  : depth === 0;
                return (
                  <button
                    className={`map-node ${available ? "available" : ""} ${n.visited ? "visited" : ""} ${s.votes[s.you] === n.id ? "selected" : ""}`}
                    disabled={!available || props.disabled || !!s.votes[s.you]}
                    key={n.id}
                    onClick={() => props.send({ type: "vote", choice: n.id })}
                  >
                    <PixelIcon name={icons[n.type]} />
                    <div>
                      <small>
                        {n.type === "mystery"
                          ? "MYSTERY AUCTION"
                          : n.type.toUpperCase()}
                      </small>
                      <strong>{n.name}</strong>
                    </div>
                    {n.visited ? (
                      <em>✓</em>
                    ) : available ? (
                      <em>
                        {
                          Object.values(s.votes).filter((v) => v === n.id)
                            .length
                        }{" "}
                        votes →
                      </em>
                    ) : (
                      <em>◇</em>
                    )}
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </>
  );
}
export function EventRoom(props: Props) {
  const event = events.find((e) => e.id === props.s.eventId)!;
  return (
    <section className="center-screen">
      <span className="large-symbol">
        <PixelIcon name="question" />
      </span>
      <span className="eyebrow">A CHANCE ENCOUNTER</span>
      <h1>{event.name}</h1>
      <p className="lore">{event.text}</p>
      <div className="choices">
        {event.choices.map((c) => (
          <Choice
            {...props}
            key={c.id}
            id={c.id}
            title={c.name}
            text={c.description}
            cost={c.cost}
          />
        ))}
      </div>
    </section>
  );
}
export function Camp(props: Props) {
  return (
    <section className="center-screen camp">
      <span className="large-symbol">
        <PixelIcon name="fire" />
      </span>
      <span className="eyebrow">LAST WARMTH</span>
      <h1>For a moment, breathe.</h1>
      <p>One camp action for the whole party. The vault is close.</p>
      <div className="choices">
        <Choice
          {...props}
          id="rest"
          title="Tend the fire"
          text="Free. Restore 18 HP to standing heroes. Return all downed and fallen heroes at 15 HP. Cleanse statuses."
        />
        <Choice
          {...props}
          id="restore"
          title="Buy field medicine"
          text="Pay 120 gold. Restore 45 HP to everyone, revive fallen heroes, and cleanse all statuses."
          cost={120}
        />
        <Choice
          {...props}
          id="train"
          title="Sharpen your resolve"
          text="Pay 100 gold. Every hero gains 3 Power for the rest of the run. No healing or resurrection."
          cost={100}
        />
      </div>
    </section>
  );
}
export function Upgrade({ s, send, disabled }: Props) {
  const me = s.players.find((p) => p.id === s.you)!;
  const offer = upgradeOffer(me);
  const chosen = s.votes[me.id];
  const step = (me.upgrades ?? []).length + 1;
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            CHAMBER CLEARED · BRANCH {step} OF {lines(me.heroId)}
          </span>
          <h1>Sharpen one ability.</h1>
          <p>
            This choice is permanent for the run. Force ends fights sooner;
            guard keeps the party standing when they run long.
          </p>
        </div>
        <span className="badge">
          {Object.keys(s.votes).length}/{s.players.length} chosen
        </span>
      </div>
      <div className="upgrade-grid">
        {offer.length === 0 ? (
          <p>Your tree is complete. Waiting for the rest of the pact.</p>
        ) : (
          offer.map((u) => (
            <button
              key={u.id}
              className={`upgrade-card upgrade-${u.kind} ${chosen === u.id ? "selected" : ""}`}
              disabled={disabled || !!chosen}
              onClick={() => send({ type: "upgrade", choice: u.id })}
            >
              <small>{u.kind === "guard" ? "GUARD" : "FORCE"}</small>
              <h2>{u.name}</h2>
              <p>{u.description}</p>
              <span className="choice-footer">
                {chosen === u.id ? "✓ TAKEN" : "Take this branch →"}
              </span>
            </button>
          ))
        )}
      </div>
      <section className="lobby-footer">
        <div>
          {s.players.map((p) => (
            <div className="player-line" key={p.id}>
              <span className={s.votes[p.id] ? "online" : "muted"}>
                {s.votes[p.id] ? "✓" : "…"}
              </span>{" "}
              {p.name} · {p.heroId}{" "}
              <small>{(p.upgrades ?? []).length} branches</small>
            </div>
          ))}
        </div>
        <p className="muted">
          Everyone chooses before the party moves on. Fallen heroes still learn.
        </p>
      </section>
    </>
  );
}
export function Reward({ s, send, disabled }: Props) {
  return (
    <section className="center-screen">
      <Sprite id="chest" className="reward-chest" />
      <span className="eyebrow">CHAMBER CLEARED</span>
      <h1>The pact holds.</h1>
      <p className="reward-gold">+{s.reward} gold</p>
      <p>Added to the shared treasury. The next decision is yours.</p>
      <button
        className="primary"
        disabled={disabled}
        onClick={() => send({ type: "continue" })}
      >
        Chart the next move →
      </button>
    </section>
  );
}
export function Results({ s, onLeave }: { s: Snapshot; onLeave: () => void }) {
  return (
    <section className="center-screen">
      <span className="large-symbol">
        {s.outcome === "victory" ? "♛" : "◇"}
      </span>
      <span className="eyebrow">THE FOUNDRY EXPEDITION</span>
      <h1>
        {s.outcome === "victory"
          ? "A pact worth keeping."
          : "Everything had a price."}
      </h1>
      <p>
        {s.outcome === "victory"
          ? "You leave together. The Auctioneer will remember."
          : "The dungeon keeps the gold. You keep the lesson."}
      </p>
      <div className="result-stats">
        <div>
          <strong>
            {Math.round(((s.endedAt ?? 0) - (s.startedAt ?? 0)) / 60000)}m
          </strong>
          <small>Duration</small>
        </div>
        <div>
          <strong>{s.earned}</strong>
          <small>Gold earned</small>
        </div>
        <div>
          <strong>{s.spent}</strong>
          <small>Gold spent</small>
        </div>
      </div>
      <div className="results-party">
        {s.players.map((p) => (
          <article key={p.id}>
            <Sprite id={p.heroId} />
            <h3>{p.name}</h3>
            <small>
              {p.spent === Math.max(...s.players.map((p) => p.spent)) &&
              p.spent > 0
                ? "GOLD GOBLIN"
                : p.healing > p.damage
                  ? "WALKING HOSPITAL"
                  : "PACT KEEPER"}
            </small>
            <p>
              {p.damage} damage · {p.healing} healing · {p.revives} revives
            </p>
            <p>
              {p.items
                .map((id) => items.find((i) => i.id === id)?.name)
                .join(" · ") || "No purchased equipment"}
            </p>
          </article>
        ))}
      </div>
      <p className="seed">Run seed: {s.seed}</p>
      <button className="primary" onClick={onLeave}>
        Return to the Guild Hall →
      </button>
    </section>
  );
}
