import { useState } from "react";
import type { Snapshot } from "../../shared/model";
import type { Intent } from "../../shared/protocol";
import { items } from "../../content/items";
import { Sprite } from "./Sprite";

/**
 * The shop that replaced the auction.
 *
 * The auction's screen was about the lot: what it was worth, who wanted it,
 * what the asking price had climbed to. None of that survived the playtest —
 * a lot that suits one hero gives nobody a reason to bid. This screen is about
 * the party instead: who gets it, what it replaces, and what the treasury has
 * left afterwards. The three things a player has to see before agreeing.
 */
export function Shop({
  s,
  send,
  disabled,
}: {
  s: Snapshot;
  send: (i: Intent) => void;
  disabled: boolean;
}) {
  const [recipient, setRecipient] = useState(s.you);
  const [preview, setPreview] = useState<string>();
  const shop = s.shop!,
    player = s.players.find((p) => p.id === recipient) ?? s.players[0];
  const offer = shop.proposal,
    offered = items.find((i) => i.id === offer?.item);
  const replaced =
    offered && offered.slot !== "supply"
      ? s.players
          .find((p) => p.id === offer?.recipient)
          ?.items.map((id) => items.find((i) => i.id === id))
          .find((i) => i?.slot === offered.slot)
      : undefined;
  return (
    <section className="shop-room">
      <span className="eyebrow">THE PARTY SHOP · SHARED TREASURY</span>
      <h1>Build the party. Keep a reserve.</h1>
      <p>
        <strong>{s.gold} gold available.</strong> Fixed prices. Choose a
        recipient, then approve together. No bidding. Supplies come in pairs.
      </p>
      <div className="shop-layout">
        <div className="shop-preview">
          <label>
            Gear recipient{" "}
            <select
              value={player.id}
              disabled={!!offer}
              onChange={(e) => {
                setRecipient(e.target.value);
                setPreview(undefined);
              }}
            >
              {s.players
                .filter((p) => !p.fallen)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>
          <Sprite
            id={player.heroId}
            equipment={player.items}
            preview={preview}
          />
          <strong>{preview ? "PREVIEW" : player.name}</strong>
          <p>
            Hover or focus a preview button to try gear on. A replacement
            surrenders the item already in that slot.
          </p>
        </div>
        <div className="shop-stock">
          {shop.stock.map((id) => {
            const item = items.find((i) => i.id === id)!,
              sold = shop.sold.includes(id);
            return (
              <article
                className="shop-item"
                key={id}
                data-sold={sold || undefined}
              >
                <span className="eyebrow">
                  {item.slot} · {item.rarity}
                </span>
                <h2>
                  {item.name}
                  {item.slot === "supply" ? " ×2" : ""}
                </h2>
                <p>{item.description}</p>
                <strong>{item.price} gold</strong>
                {item.slot !== "supply" && (
                  <button
                    onMouseEnter={() => setPreview(id)}
                    onMouseLeave={() => setPreview(undefined)}
                    onFocus={() => setPreview(id)}
                    onBlur={() => setPreview(undefined)}
                  >
                    Preview {item.name}
                  </button>
                )}
                <button
                  disabled={disabled || sold || !!offer || item.price > s.gold}
                  onClick={() => {
                    setPreview(undefined);
                    send({ type: "shopOffer", item: id, recipient: player.id });
                  }}
                >
                  {sold
                    ? "Purchased"
                    : item.price > s.gold
                      ? "Cannot afford"
                      : `Propose for ${player.name}`}
                </button>
              </article>
            );
          })}
        </div>
      </div>
      {offer && (
        <section
          className="shop-decision"
          aria-label="Purchase approval"
          aria-live="polite"
        >
          <h2>
            {offered?.name} →{" "}
            {s.players.find((p) => p.id === offer.recipient)?.name}
          </h2>
          <p>
            Spend {offer.price} gold · {s.gold - offer.price} remains.{" "}
            {replaced ? `${replaced.name} will be surrendered.` : ""} A majority
            and the recipient must approve.
          </p>
          <ul className="shop-votes">
            {s.players.map((p) => (
              <li key={p.id} data-vote={String(offer.votes[p.id] ?? "waiting")}>
                {p.name}
                {p.id === offer.recipient ? " (receiving)" : ""}:{" "}
                {p.id in offer.votes
                  ? offer.votes[p.id]
                    ? "approved"
                    : "declined"
                  : "deciding"}
              </li>
            ))}
          </ul>
          {s.you in offer.votes ? (
            <p>Your decision is locked.</p>
          ) : (
            <>
              <button
                disabled={disabled}
                onClick={() => send({ type: "shopApprove", approve: true })}
              >
                Approve purchase
              </button>
              <button
                disabled={disabled}
                onClick={() => send({ type: "shopApprove", approve: false })}
              >
                Decline purchase
              </button>
            </>
          )}
        </section>
      )}
      <button
        disabled={disabled || !!offer || shop.leaving.includes(s.you)}
        onClick={() => send({ type: "continue" })}
      >
        {shop.leaving.includes(s.you)
          ? "Waiting for the party"
          : "Ready to leave shop"}
      </button>
      <p>
        {shop.leaving.length}/{s.players.length} ready to leave. Starting
        another purchase clears readiness.
      </p>
    </section>
  );
}
