import { Sprite } from "./Sprite";
import { PixelIcon } from "./PixelIcon";
import type { Snapshot } from "../../shared/model";
import type { Intent } from "../../shared/protocol";
import { heroes } from "../../content/heroes";
import { events } from "../../content/events";
import { items } from "../../content/items";
import { upgradeOffer, lines } from "../../content/upgrades";
import {
  className,
  evolution,
  mentor,
  pathFor,
} from "../../content/evolutions";
import { abilities, hero } from "../../content/heroes";
type Props = { s: Snapshot; send: (i: Intent) => void; disabled: boolean };
export function Lobby({ s, send, disabled }: Props) {
  const me = s.players.find((p) => p.id === s.you)!;
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">EXPEDITION TABLE · 2–4 PLAYERS</span>
          <h1>Pick your troublemaker.</h1>
          <p>
            Eight ways to make bad decisions. Two to four of you at the table.
          </p>
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
  const icons: Record<string, string> = {
    combat: "sword",
    elite: "skull",
    auction: "gavel",
    mystery: "gem",
    event: "question",
    camp: "fire",
    mentor: "book",
    boss: "crown",
  };
  const label: Record<string, string> = {
    mystery: "VEILED LOT",
    mentor: "TRAINING",
    auction: "EXCHANGE",
  };
  const depth = Math.max(0, ...s.map.map((n) => n.depth)) + 1;
  const rows = Array.from({ length: depth }, (_, d) =>
    s.map.filter((n) => n.depth === d),
  );
  /** Route geometry in percentages, so the links line up with the grid. */
  const at = (id: string) => {
    const node = s.map.find((n) => n.id === id)!;
    const row = rows[node.depth];
    const lane = row.findIndex((x) => x.id === id);
    return {
      x: ((lane + 0.5) / row.length) * 100,
      y: ((node.depth + 0.5) / depth) * 100,
    };
  };
  const links = s.map.flatMap((n) =>
    n.next.map((id) => ({
      key: `${n.id}>${id}`,
      from: at(n.id),
      to: at(id),
      // Before the first move the entry chamber is where the party stands.
      live: current ? current.id === n.id : n.depth === 0,
      walked: n.visited && s.map.find((x) => x.id === id)!.visited,
    })),
  );
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">REGION I · THE EMBER FOUNDRY</span>
          <h1>Into the Foundry.</h1>
          <p>The furnace still burns. Choose your next chamber together.</p>
        </div>
        <span className="badge">
          {s.map.filter((n) => n.visited).length} / {depth} chambers
        </span>
      </div>
      <div className="map-route">
        <svg
          className="map-links"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {links.map((l) => (
            <line
              key={l.key}
              x1={l.from.x}
              y1={l.from.y}
              x2={l.to.x}
              y2={l.to.y}
              vectorEffect="non-scaling-stroke"
              className={l.live ? "live" : l.walked ? "walked" : ""}
            />
          ))}
        </svg>
        <div className="map-grid">
          {rows.map((row, d) => (
            <div className="map-row" key={d}>
              <small className="map-depth">
                {String(d + 1).padStart(2, "0")}
              </small>
              {row.map((n) => {
                const open = current ? current.next.includes(n.id) : d === 0;
                const here = current?.id === n.id;
                const votes = Object.values(s.votes).filter(
                  (v) => v === n.id,
                ).length;
                return (
                  <button
                    className={`map-node type-${n.type} ${open ? "open" : ""} ${n.visited ? "walked" : ""} ${here ? "here" : ""} ${s.votes[s.you] === n.id ? "picked" : ""}`}
                    disabled={!open || props.disabled || !!s.votes[s.you]}
                    key={n.id}
                    onClick={() => props.send({ type: "vote", choice: n.id })}
                  >
                    <span className="map-glyph">
                      <PixelIcon name={here ? "pin" : icons[n.type]} />
                    </span>
                    <small>{label[n.type] ?? n.type.toUpperCase()}</small>
                    <strong>{n.name}</strong>
                    {votes > 0 && (
                      <span className="map-votes">
                        {"●".repeat(votes)}
                        <em>{votes} for this</em>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
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
export function Mentor({ s, send, disabled }: Props) {
  const me = s.players.find((p) => p.id === s.you)!;
  const teacher = mentor(s.mentorId ?? "");
  const path = teacher ? pathFor(teacher.id, me.heroId) : undefined;
  const answered = (s.trained ?? []).includes(me.id);
  const already = evolution(me.evolution);
  const affordable = !!teacher && s.gold >= teacher.tuition;
  const stat = (label: string, n?: number) =>
    n ? `${label} ${n > 0 ? "+" : ""}${n}` : null;
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            TRAINING GROUND · TIER {teacher?.tier ?? 1}
          </span>
          <h1>{teacher?.name}</h1>
          <p>{teacher?.text}</p>
        </div>
        <span className="badge">
          {(s.trained ?? []).length}/{s.players.length} answered
        </span>
      </div>
      <div className="mentor-body">
        <div className="mentor-offer">
          {already ? (
            <p>
              You already walk the {already.name} path. A hero trains once per
              expedition.
            </p>
          ) : !path ? (
            <p>This mentor has nothing to teach a {hero(me.heroId).name}.</p>
          ) : (
            <>
              <small>{hero(me.heroId).name} → </small>
              <h2>{path.name}</h2>
              <p className="lore">{path.title}</p>
              <p>
                <strong>{path.ability.name}</strong> replaces{" "}
                {hero(me.heroId).name}’s{" "}
                {abilities(me.heroId, 2).find((x) => x.id === path.replaces)
                  ?.name ?? path.replaces}
                .<br />
                {path.ability.description}
              </p>
              <p className="mentor-stats">
                {[
                  stat("HP", path.stats.hp),
                  stat("Power", path.stats.power),
                  stat("Guard", path.stats.guard),
                  stat("Speed", path.stats.speed),
                  stat("Resource", path.stats.resource),
                ]
                  .filter(Boolean)
                  .join(" · ") || "No stat change"}
              </p>
            </>
          )}
        </div>
        <div className="mentor-terms">
          <span className="eyebrow">THE FEE</span>
          <h3>{teacher?.tuition} gold</h3>
          <p>
            Paid from the shared treasury the moment you commit. {s.gold} gold
            remains; the purse will not stretch to everyone.
          </p>
          <div className="bidder-list">
            {s.players.map((p) => (
              <div key={p.id}>
                <span>
                  {p.name} · {className(p)}
                </span>
                <strong>
                  {(s.trained ?? []).includes(p.id)
                    ? p.evolution
                      ? "Trained"
                      : "Passed"
                    : "Deciding"}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="auction-actions">
        {answered ? (
          <p>Your answer is given. Waiting for the rest of the pact.</p>
        ) : (
          <>
            <button
              className="primary"
              disabled={disabled || !path || !!already || !affordable}
              onClick={() => send({ type: "train", accept: true })}
            >
              {already
                ? "Already trained"
                : !path
                  ? "Nothing on offer"
                  : !affordable
                    ? "Treasury cannot cover it"
                    : `Train · ${teacher?.tuition} gold`}
            </button>
            <button
              disabled={disabled}
              onClick={() => send({ type: "train", accept: false })}
            >
              Walk on
            </button>
          </>
        )}
      </div>
    </>
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
