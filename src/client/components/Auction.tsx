import { Sprite } from "./Sprite";
import { PixelIcon } from "./PixelIcon";
import type { Snapshot } from "../../shared/model";
import type { Intent } from "../../shared/protocol";
import { items } from "../../content/items";
export function Auction({
  s,
  send,
  disabled,
}: {
  s: Snapshot;
  send: (i: Intent) => void;
  disabled: boolean;
}) {
  const a = s.auction!;
  const me = s.players.find((p) => p.id === s.you)!;
  const old = me.items
    .map((id) => items.find((i) => i.id === id)!)
    .find((i) => i.slot === a.item.slot);
  return (
    <section className="auction-room">
      <span className="eyebrow">
        THE GILDED EXCHANGE · LOT {a.round.toString().padStart(2, "0")}
      </span>
      <h1>Going once. Going broke.</h1>
      <div className="auction-host">
        <Sprite id="auctioneer" />
        <p className="auctioneer">
          “An excellent purchase. Financially catastrophic, naturally.”
        </p>
      </div>
      <div className="auction-layout">
        <div className="auction-aside">
          <span className="eyebrow">THE TERMS</span>
          <h3>
            One owner.
            <br />
            Everyone pays.
          </h3>
          <p>
            Gold comes from the shared treasury. Purchases of 30% or more
            require a majority approval.
          </p>
          <p>
            Bidders hold or withdraw at each price. No timer in casual play.
          </p>
        </div>
        <div className={`item-card rarity-${a.item.rarity?.toLowerCase()}`}>
          <span className="eyebrow">
            {a.item.rarity} · {a.item.slot}
          </span>
          <div className="item-pedestal">
            {a.revealed ? (
              <PixelIcon
                name={
                  a.item.slot === "weapon"
                    ? "sword"
                    : a.item.slot === "armor"
                      ? "shield"
                      : "gem"
                }
              />
            ) : (
              <Sprite id="chest" />
            )}
          </div>
          <h2>{a.item.name ?? "A veiled offering"}</h2>
          <p className="lore">{a.item.clue}</p>
          <div className="tags">
            {a.item.tags?.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p>
            {a.item.description ?? "Its true power and curse remain concealed."}
          </p>
          {a.revealed && (
            <strong className={a.item.cursed ? "curse" : "safe"}>
              {a.item.cursed ? "☠ Cursed · Lose 6 HP each round" : "◇ No curse"}
            </strong>
          )}
        </div>
        <div className="auction-aside">
          <span className="eyebrow">YOUR EQUIPMENT</span>
          <h3>{old?.name ?? "Empty " + a.item.slot + " slot"}</h3>
          <p>{old?.description ?? "This lot would begin a new build."}</p>
          {old && <p>Winning replaces and surrenders this item.</p>}
          <div className="bidder-list">
            {s.players.map((p) => (
              <div key={p.id}>
                <span>{p.name}</span>
                <strong>
                  {a.owner === p.id
                    ? "Owner"
                    : a.active.includes(p.id)
                      ? "Bidding"
                      : a.acted.includes(p.id)
                        ? "Passed"
                        : "Deciding"}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="price">
        <small>CURRENT ASK</small>
        <strong>
          {a.price}
          <span> gold</span>
        </strong>
        <small>
          {Math.round((a.price / Math.max(s.gold, 1)) * 100)}% of treasury ·{" "}
          {Math.max(0, s.gold - a.price)} would remain
        </small>
      </div>
      <div className="auction-actions">
        {a.stage === "interest" && !a.acted.includes(s.you) && (
          <>
            <button
              className="primary"
              disabled={disabled || s.gold < a.price}
              onClick={() => send({ type: "interest", interested: true })}
            >
              Raise my paddle
            </button>
            <button
              disabled={disabled}
              onClick={() => send({ type: "interest", interested: false })}
            >
              Pass this lot
            </button>
          </>
        )}
        {a.stage === "interest" && !a.revealed && (
          <button
            disabled={disabled || s.gold < 35}
            onClick={() => send({ type: "reveal" })}
          >
            Lift the veil · 35 gold
          </button>
        )}
        {a.stage === "bidding" &&
          a.active.includes(s.you) &&
          !a.acted.includes(s.you) && (
            <>
              <button
                className="primary"
                disabled={disabled}
                onClick={() => send({ type: "bid", stay: true })}
              >
                Hold at {a.price}
              </button>
              <button
                disabled={disabled}
                onClick={() => send({ type: "bid", stay: false })}
              >
                Drop out
              </button>
            </>
          )}
        {a.stage === "approval" && (
          <div>
            <h3>
              Pact approval · {s.players.find((p) => p.id === a.owner)?.name}{" "}
              wants this lot
            </h3>
            {s.you in a.approvals ? (
              <p>Your vote is locked.</p>
            ) : (
              <>
                <button
                  className="primary"
                  disabled={disabled}
                  onClick={() => send({ type: "approve", approve: true })}
                >
                  Approve purchase
                </button>{" "}
                <button
                  disabled={disabled}
                  onClick={() => send({ type: "approve", approve: false })}
                >
                  Protect the treasury
                </button>
              </>
            )}
          </div>
        )}
        {a.stage === "sold" && (
          <div>
            <h3>
              {a.owner
                ? `Sold to ${s.players.find((p) => p.id === a.owner)?.name}`
                : "Lot closed · No sale"}
            </h3>
            <button
              className="primary"
              disabled={disabled}
              onClick={() => send({ type: "continue" })}
            >
              Return to the dungeon →
            </button>
          </div>
        )}
      </div>
      <small className="muted">
        {a.stage !== "sold"
          ? "Waiting for the party’s decisions. Every paddle belongs to its player."
          : ""}
      </small>
    </section>
  );
}
