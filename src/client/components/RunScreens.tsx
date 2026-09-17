import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Sprite } from "./Sprite";
import { SEATS, type Seat } from "./seats";
import {
  gildedPurse,
  VITALITY_MAX_HP,
  WEALTH_MAX_HP,
  WEALTH_PER_HERO,
} from "../../content/pacts";
import { PixelIcon } from "./PixelIcon";
import type { MapNode, Snapshot } from "../../shared/model";
import type { Intent } from "../../shared/protocol";
import { heroes } from "../../content/heroes";
import { OFFERINGS } from "../../content/shrines";
import { floorDef, floorsIn } from "../../content/floors";
import { items } from "../../content/items";
import { upgradeOffer, lines } from "../../content/upgrades";
import {
  className,
  evolution,
  mentor,
  pathFor,
  drillFor,
} from "../../content/evolutions";
import { abilities, hero } from "../../content/heroes";
type Props = { s: Snapshot; send: (i: Intent) => void; disabled: boolean };
/** A pick shows once it has been made; older rooms only knew who was ready. */
const picked = (p: Snapshot["players"][number]) => p.chosen ?? p.ready;
export function Lobby({ s, send, disabled }: Props) {
  const me = s.players.find((p) => p.id === s.you)!;
  const seated = s.players.map((p, i) => ({ p, seat: SEATS[i] as Seat }));
  const everyoneReady = s.players.every((p) => p.ready);
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
        {heroes.map((h) => {
          const pickers = seated.filter(
            ({ p }) => p.heroId === h.id && picked(p),
          );
          const [first, ...others] = pickers;
          const locked = pickers.some(({ p }) => p.ready);
          return (
            <button
              key={h.id}
              className={[
                "hero-choice",
                `hero-${h.id}`,
                me.heroId === h.id && picked(me) ? "selected" : "",
                first ? "claimed" : "",
                locked ? "locked" : "",
              ].join(" ")}
              style={
                first
                  ? ({
                      "--seat": first.seat.color,
                      // A second, third or fourth player on the same hero
                      // adds a ring outside the first, in their own colour.
                      "--rings": others
                        .map(
                          ({ seat }, i) =>
                            `0 0 0 ${(i + 1) * 4}px ${seat.color}`,
                        )
                        .join(", "),
                    } as CSSProperties)
                  : undefined
              }
              aria-label={`${h.name}${pickers.length ? `, picked by ${pickers.map(({ p }) => p.name).join(" and ")}` : ""}`}
              disabled={disabled}
              onClick={() => send({ type: "hero", hero: h.id })}
            >
              <div className="hero-stage">
                {pickers.length > 0 && (
                  <div className="pick-tags">
                    {pickers.map(({ p, seat }) => (
                      <span
                        key={p.id}
                        className={`pick-tag ${p.ready ? "ready" : ""}`}
                        style={{ "--seat": seat.color } as CSSProperties}
                      >
                        <b>{seat.label}</b>
                        <span className="pick-name">{p.name}</span>
                        {p.ready && <i aria-label="locked in">✓</i>}
                      </span>
                    ))}
                  </div>
                )}
                <Sprite id={h.id} />
              </div>
              <small>
                {h.resource.toUpperCase()} · {h.hp} HP
              </small>
              <h2>{h.name}</h2>
              <p className="lore">{h.title}</p>
              <p>{h.description}</p>
              <span className="choice-footer">
                {me.heroId === h.id && picked(me)
                  ? me.ready
                    ? "✓ LOCKED IN"
                    : "✓ YOUR HERO"
                  : "Choose hero →"}
              </span>
            </button>
          );
        })}
      </div>
      <section className="lobby-roster" aria-label="The table">
        <ol className="seats">
          {SEATS.map((seat, i) => {
            const p = s.players[i];
            if (!p)
              return (
                <li key={seat.label} className="seat open">
                  <b className="seat-label">{seat.label}</b>
                  <span className="seat-empty">Open seat</span>
                </li>
              );
            const h = hero(p.heroId);
            return (
              <li
                key={seat.label}
                className={`seat ${p.ready ? "ready" : ""} ${p.id === s.you ? "you" : ""}`}
                style={{ "--seat": seat.color } as CSSProperties}
              >
                <b className="seat-label">{seat.label}</b>
                <span className="seat-portrait">
                  {picked(p) ? <Sprite id={p.heroId} crop="portrait" /> : "?"}
                </span>
                <span className="seat-text">
                  <strong>
                    <span
                      className={
                        s.connected.includes(p.id) ? "online" : "muted"
                      }
                      aria-label={
                        s.connected.includes(p.id) ? "online" : "offline"
                      }
                    >
                      ●
                    </span>{" "}
                    {p.name}
                  </strong>
                  <span>{picked(p) ? h.name : "Choosing…"}</span>
                  <em>{p.ready ? "✓ Locked in" : "Choosing"}</em>
                </span>
              </li>
            );
          })}
        </ol>
        <div className="button-stack">
          <button
            className="primary"
            disabled={disabled}
            onClick={() => send({ type: "ready", ready: !me.ready })}
          >
            {me.ready ? "Cancel ready" : "I accept the pact"}
          </button>
          <button
            disabled={disabled || s.players.length < 2 || !everyoneReady}
            onClick={() => send({ type: "start" })}
          >
            Begin expedition →
          </button>
          <p role="status">
            {s.players.length < 2
              ? "Invite one more player to begin."
              : !everyoneReady
                ? "Waiting for every hero to ready up."
                : "Everyone is ready. Begin when you’re set."}
          </p>
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
  // The Gilded purse is per hero, so the screen has to do the arithmetic the
  // party would otherwise do wrong: a duo and a quartet swear different deals.
  const purse = gildedPurse(props.s.gold, props.s.players.length);
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
          text={`Every hero gains ${VITALITY_MAX_HP} maximum HP. Enter with ${props.s.gold} team gold.`}
        />
        <Choice
          {...props}
          id="wealth"
          title="The Gilded"
          text={`Enter with ${purse} team gold — ${WEALTH_PER_HERO} more for every hero who swears it. Each of them sacrifices ${WEALTH_MAX_HP} maximum HP for the run. Buys an early build at the shop.`}
        />
      </div>
      <p className="muted">
        Majority decides. Ties rotate authority through the party.
      </p>
    </section>
  );
}
/**
 * The route.
 *
 * The links used to be drawn in a percentage viewBox that assumed every row
 * was the same height and every card the same size, while the cards themselves
 * were laid out by flexbox. The two never agreed: lines ran under cards, ended
 * in the middle of them, and crossed each other on the way. A player could not
 * tell which chamber led to which, which is the one thing this screen exists
 * to say.
 *
 * So the cards are laid out first and the links are measured off them. Each
 * link leaves the bottom edge of a chamber and arrives at the top edge of the
 * next, curving so that two links out of one card are told apart by shape and
 * not only by where they end.
 */
function useRouteGeometry(nodes: MapNode[]) {
  const frame = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState<{
    width: number;
    height: number;
    at: Record<string, { x: number; top: number; bottom: number }>;
  }>({ width: 0, height: 0, at: {} });
  useLayoutEffect(() => {
    const root = frame.current;
    if (!root) return;
    const measure = () => {
      const base = root.getBoundingClientRect();
      const at: Record<string, { x: number; top: number; bottom: number }> = {};
      for (const el of root.querySelectorAll<HTMLElement>("[data-node]")) {
        const r = el.getBoundingClientRect();
        at[el.dataset.node!] = {
          x: r.left - base.left + r.width / 2,
          top: r.top - base.top,
          bottom: r.bottom - base.top,
        };
      }
      setSeen({ width: base.width, height: base.height, at });
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    for (const el of root.querySelectorAll("[data-node]")) observer.observe(el);
    return () => observer.disconnect();
  }, [nodes]);
  return { frame, ...seen };
}

export function DungeonMap(props: Props) {
  const { s } = props;
  const current = s.map.find((n) => n.id === s.currentNode);
  const icons: Record<string, string> = {
    combat: "sword",
    elite: "skull",
    auction: "coin",
    mystery: "gem",
    event: "question",
    camp: "fire",
    mentor: "book",
    boss: "crown",
    toll: "gavel",
    hazard: "warn",
    shrine: "altar",
    forge: "anvil",
  };
  const label: Record<string, string> = {
    mystery: "SALVAGE SHOP",
    mentor: "TRAINING",
    auction: "GEAR SHOP",
    camp: "REST",
    toll: "TOLL GATE",
    hazard: "HAZARD",
    shrine: "SHRINE",
    forge: "WORKBENCH",
  };
  const depth = Math.max(0, ...s.map.map((n) => n.depth)) + 1;
  const rows = Array.from({ length: depth }, (_, d) =>
    s.map.filter((n) => n.depth === d),
  );
  const { frame, width, height, at } = useRouteGeometry(s.map);
  const reachable = (id: string) =>
    current
      ? current.next.includes(id)
      : s.map.find((n) => n.id === id)?.depth === 0;
  const links = s.map.flatMap((n) =>
    n.next.flatMap((id) => {
      const from = at[n.id];
      const to = at[id];
      if (!from || !to) return [];
      const drop = Math.max(12, (to.top - from.bottom) * 0.55);
      return [
        {
          key: `${n.id}>${id}`,
          d: `M${from.x} ${from.bottom} C${from.x} ${from.bottom + drop} ${to.x} ${to.top - drop} ${to.x} ${to.top}`,
          // The step you could take right now, the steps you have taken, and
          // everything else — three weights, never more.
          state:
            reachable(id) && current?.id === n.id
              ? "live"
              : n.visited && s.map.find((x) => x.id === id)!.visited
                ? "walked"
                : "far",
        },
      ];
    }),
  );
  const open = s.map.filter((n) => reachable(n.id));
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {s.floor
              ? `FLOOR ${s.floor} OF ${floorsIn(s)} · ${floorDef(s).title}`
              : "REGION I · THE EMBER FOUNDRY"}
          </span>
          <h1>
            {s.floor ? floorDef(s).heading : "Into the Foundry."}
          </h1>
          <p>
            {s.votes[s.you]
              ? "Your vote is cast. The party decides together."
              : open.length > 1
                ? `Two ways on. ${open.map((n) => label[n.type] ?? n.type.toUpperCase()).join(" or ")}.`
                : "The furnace still burns. Choose your next chamber together."}
          </p>
        </div>
        <span className="badge">
          {s.map.filter((n) => n.visited).length} / {depth} chambers
        </span>
      </div>
      <div className="map-route" ref={frame}>
        <svg
          className="map-links"
          viewBox={`0 0 ${width || 1} ${height || 1}`}
          width={width || undefined}
          height={height || undefined}
          aria-hidden="true"
        >
          {links.map((l) => (
            <path key={l.key} d={l.d} className={l.state} />
          ))}
        </svg>
        <div className="map-grid">
          {rows.map((row, d) => (
            <div className="map-row" key={d}>
              <small className="map-depth">
                {String(d + 1).padStart(2, "0")}
              </small>
              {row.map((n) => {
                const canGo = reachable(n.id);
                const here = current?.id === n.id;
                const votes = Object.values(s.votes).filter(
                  (v) => v === n.id,
                ).length;
                return (
                  <button
                    data-node={n.id}
                    className={`map-node type-${n.type} ${canGo ? "open" : ""} ${n.visited ? "walked" : ""} ${here ? "here" : ""} ${s.votes[s.you] === n.id ? "picked" : ""}`}
                    disabled={!canGo || props.disabled || !!s.votes[s.you]}
                    key={n.id}
                    onClick={() => props.send({ type: "vote", choice: n.id })}
                  >
                    <span className="map-glyph">
                      <PixelIcon name={here ? "pin" : icons[n.type]} />
                    </span>
                    <span className="map-what">
                      <small>{label[n.type] ?? n.type.toUpperCase()}</small>
                      <strong>{n.name}</strong>
                      {n.biome && (
                        <em title={biomes[n.biome].description}>
                          {biomes[n.biome].name}
                        </em>
                      )}
                    </span>
                    {votes > 0 && (
                      <span className="map-votes">
                        {"\u25cf".repeat(votes)}
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
export { EventRoom } from "./ChanceEvent";
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
/**
 * The toll gate: pay the keepers or fight them. Both options are spelled out
 * with what they cost *and* what they forgo, because the fight is the one that
 * pays — a party that only reads "pay 110 gold" or "fight" is choosing blind.
 */
export function TollGate(props: Props) {
  const { s } = props;
  const price = s.toll ?? 0;
  return (
    <section className="center-screen">
      <span className="large-symbol">
        <PixelIcon name="gavel" />
      </span>
      <span className="eyebrow">A TOLL GATE</span>
      <h1>The keepers want paying.</h1>
      <p>One decision for the whole party. The treasury holds {s.gold} gold.</p>
      <div className="choices">
        <Choice
          {...props}
          id="pay"
          title={`Pay ${price} gold`}
          text="Pass unharmed. Nobody bleeds, and nothing is won: no reward and no branch upgrade."
          cost={price}
        />
        <Choice
          {...props}
          id="fight"
          title="Refuse and fight"
          text="The keepers draw. Win, and the gate pays the usual reward and a branch upgrade. Lose health doing it."
        />
      </div>
    </section>
  );
}

/**
 * The shrine. One hero may strike its bargain; the rest walk past. The screen
 * names who already has, so nobody makes an offering the altar will refuse.
 */
export function Shrine({ s, send, disabled }: Props) {
  const me = s.players.find((p) => p.id === s.you)!;
  const shrine = s.shrine;
  const taker = s.players.find((p) => p.id === shrine?.taken);
  const answered = shrine?.answered.includes(me.id);
  const blood = OFFERINGS.blood;
  const gold = OFFERINGS.gold;
  return (
    <section className="center-screen">
      <span className="large-symbol">
        <PixelIcon name="altar" />
      </span>
      <span className="eyebrow">A SHRINE</span>
      <h1>The altar will answer one of you.</h1>
      <p>
        A permanent bargain for a single hero. Decide together who takes it:
        once it has answered someone, it goes dark for everyone else.
      </p>
      {answered ? (
        <p>Your answer is given. Waiting for the rest of the pact.</p>
      ) : taker ? (
        <p>The altar has already answered {taker.name}.</p>
      ) : (
        <div className="choices">
          <button
            className="choice"
            disabled={disabled || me.fallen || me.maxHp + blood.maxHp < 1}
            onClick={() => send({ type: "shrine", offering: "blood" })}
          >
            <h3>Offer your blood</h3>
            <p>
              +{blood.power} Power for the rest of the run. You lose{" "}
              {-blood.maxHp} maximum HP, for good.
            </p>
            <span>{me.name} bleeds for it</span>
          </button>
          <button
            className="choice"
            disabled={disabled || me.fallen || s.gold < gold.gold}
            onClick={() => send({ type: "shrine", offering: "gold" })}
          >
            <h3>Offer the party's gold</h3>
            <p>
              +{gold.power} Power for the rest of the run. The shared treasury
              pays {gold.gold}; you keep your health.
            </p>
            <span>{s.gold} gold in the treasury</span>
          </button>
          <button
            className="choice"
            disabled={disabled}
            onClick={() => send({ type: "shrine", offering: "leave" })}
          >
            <h3>Walk past</h3>
            <p>Leave the bargain for someone else, or for no one.</p>
            <span>Costs nothing</span>
          </button>
        </div>
      )}
    </section>
  );
}

export function Mentor({ s, send, disabled }: Props) {
  const me = s.players.find((p) => p.id === s.you)!;
  const teacher = mentor(s.mentorId ?? "");
  // One class is taught here. Everyone else is offered the drill instead, so
  // the screen has to say which of the two this hero is looking at.
  const mine = s.mentorClass === undefined || s.mentorClass === me.heroId;
  const path = teacher && mine ? pathFor(teacher.id, me.heroId) : undefined;
  const taught = s.mentorClass ? hero(s.mentorClass).name : null;
  const answered = (s.trained ?? []).includes(me.id);
  const already = evolution(me.evolution);
  const drill = teacher ? drillFor(teacher.tier) : undefined;
  const offering = path && !already ? "path" : "drill";
  const fee = offering === "path" ? (teacher?.tuition ?? 0) : (drill?.fee ?? 0);
  const affordable = s.gold >= fee;
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
              You already walk the {already.name} path. A hero evolves once per
              expedition; you may still drill here.
            </p>
          ) : !path ? (
            <>
              <small>{hero(me.heroId).name} → </small>
              <h2>Drill</h2>
              <p className="lore">
                {taught
                  ? `This ground raises ${taught}s. It has no path for a ${hero(me.heroId).name} — but it will work one.`
                  : `This ground has no path for a ${hero(me.heroId).name} — but it will work one.`}
              </p>
              <p>
                No new ability, and nothing given up. Drilling is a permanent
                gain in condition, not a change of role.
              </p>
              <p className="mentor-stats">
                {[stat("Power", drill?.power), stat("HP", drill?.hp)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </>
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
          <span className="eyebrow">
            {offering === "path" ? "TUITION" : "THE DRILL FEE"}
          </span>
          <h3>{fee} gold</h3>
          <p>
            Paid from the shared treasury the moment you commit. {s.gold} gold
            remains; the purse will not stretch to everyone.
          </p>
          {taught && (
            <p>
              <strong>This ground raises {taught}s.</strong> Only a {taught} may
              take a path here; a path belongs to its class and cannot be bought
              by another. Everyone else may drill for {drill?.fee} gold.
            </p>
          )}
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
              disabled={disabled || !affordable}
              onClick={() => send({ type: "train", accept: true })}
            >
              {!affordable
                ? "Treasury cannot cover it"
                : offering === "path"
                  ? `Take the ${path!.name} path · ${fee} gold`
                  : `Drill · ${fee} gold`}
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
            <Sprite id={p.heroId} equipment={p.items} />
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
import { biomes } from "../../content/biomes";
