import { useState } from "react";
import type { Snapshot } from "../../shared/model";
import type { Intent } from "../../shared/protocol";
import { items } from "../../content/items";
import { Sprite } from "./Sprite";
import { parseForgeKey, reforgeCost } from "../../content/forge";

/**
 * The shop that replaced the auction.
 *
 * The auction's screen was about the lot: what it was worth, who wanted it,
 * what the asking price had climbed to. None of that survived the playtest —
 * a lot that suits one hero gives nobody a reason to bid. This screen is about
 * the party instead: who gets it, what it replaces, and what the treasury has
 * left afterwards. The three things a player has to see before agreeing.
 */
/**
 * A workbench is a shop and uses its rules, but it sells improvements to what
 * the party already carries, so it has a screen of its own. The choice between
 * the two is made here, before either screen's hooks run.
 */
export function Shop(props: {
  s: Snapshot;
  send: (i: Intent) => void;
  disabled: boolean;
}) {
  return props.s.shop?.kind === "forge" ? (
    <Workbench {...props} />
  ) : (
    <GearShop {...props} />
  );
}

function GearShop({
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
  // Gear goes to a standing hero. A fallen one — including you, if you fell and
  // have not been raised — is left out of the list, so it cannot be the default
  // either, or the first proposal would be one the server refuses.
  const standing = s.players.filter((p) => !p.fallen);
  const shop = s.shop!,
    player =
      standing.find((p) => p.id === recipient) ?? standing[0] ?? s.players[0];
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
      <PurchaseDecision
        s={s}
        send={send}
        disabled={disabled}
        what={offered?.name}
        consequence={replaced ? `${replaced.name} will be surrendered.` : ""}
      />
      <LeaveShop s={s} send={send} disabled={disabled} />
    </section>
  );
}

type ShopProps = {
  s: Snapshot;
  send: (i: Intent) => void;
  disabled: boolean;
};

/**
 * A purchase on the table, and who has said what about it. Shared by the shop
 * and the workbench, because agreeing to spend the party's gold is the same
 * decision whichever of them is asking.
 */
function PurchaseDecision({
  s,
  send,
  disabled,
  what,
  consequence,
}: ShopProps & { what?: string; consequence: string }) {
  const offer = s.shop!.proposal;
  if (!offer) return null;
  return (
    <section
      className="shop-decision"
      aria-label="Purchase approval"
      aria-live="polite"
    >
      <h2>
        {what} → {s.players.find((p) => p.id === offer.recipient)?.name}
      </h2>
      <p>
        Spend {offer.price} gold · {s.gold - offer.price} remains. {consequence}{" "}
        A majority and the recipient must approve.
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
  );
}

/** Everyone readies up to leave; a new proposal clears readiness. */
function LeaveShop({ s, send, disabled }: ShopProps) {
  const shop = s.shop!;
  return (
    <>
      <button
        disabled={disabled || !!shop.proposal || shop.leaving.includes(s.you)}
        onClick={() => send({ type: "continue" })}
      >
        {shop.leaving.includes(s.you)
          ? "Waiting for the party"
          : `Ready to leave ${shop.kind === "forge" ? "the workbench" : "shop"}`}
      </button>
      <p>
        {shop.leaving.length}/{s.players.length} ready to leave. Starting
        another purchase clears readiness.
      </p>
    </>
  );
}

/**
 * The workbench: the party's own gear, each piece offered for reforging to
 * the hero who carries it. Grouped by hero, since "whose" is the first
 * question and the purse is the second.
 */
function Workbench({ s, send, disabled }: ShopProps) {
  const shop = s.shop!;
  const offer = shop.proposal;
  const offered = offer
    ? items.find((i) => i.id === parseForgeKey(offer.item).item)
    : undefined;
  const owners = s.players.filter((p) =>
    shop.stock.some((key) => parseForgeKey(key).owner === p.id),
  );
  return (
    <section className="shop-room">
      <span className="eyebrow">THE WORKBENCH · SHARED TREASURY</span>
      <h1>Make what you carry better.</h1>
      <p>
        <strong>{s.gold} gold available.</strong> A reforged piece strikes half
        again as hard, and each piece can be reforged once. It is reforged for
        whoever carries it; the party approves the spend together.
      </p>
      {!shop.stock.length && (
        <p>Nothing the party carries is worth the fire.</p>
      )}
      <div className="forge-owners">
        {owners.map((owner) => (
          <div className="forge-owner" key={owner.id}>
            <h2>{owner.name}</h2>
            <div className="shop-stock">
              {shop.stock
                .filter((key) => parseForgeKey(key).owner === owner.id)
                .map((key) => {
                  const item = items.find(
                    (i) => i.id === parseForgeKey(key).item,
                  )!;
                  const cost = reforgeCost(item);
                  const done = shop.sold.includes(key);
                  return (
                    <article
                      className="shop-item"
                      key={key}
                      data-sold={done || undefined}
                    >
                      <span className="eyebrow">
                        {item.slot} · {item.rarity}
                      </span>
                      <h2>{item.name}</h2>
                      <p>{item.description}</p>
                      <strong>{cost} gold</strong>
                      <button
                        disabled={disabled || done || !!offer || cost > s.gold}
                        onClick={() =>
                          send({
                            type: "shopOffer",
                            item: key,
                            recipient: owner.id,
                          })
                        }
                      >
                        {done
                          ? "Reforged"
                          : cost > s.gold
                            ? "Cannot afford"
                            : `Reforge for ${owner.name}`}
                      </button>
                    </article>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      <PurchaseDecision
        s={s}
        send={send}
        disabled={disabled}
        what={offered ? `Reforge ${offered.name}` : undefined}
        consequence="The piece stays with its owner, half again as strong."
      />
      <LeaveShop s={s} send={send} disabled={disabled} />
    </section>
  );
}
