import { useState } from "react";
import type { Snapshot } from "../../shared/model";
import type { Intent } from "../../shared/protocol";
import { statuses } from "../../content/statuses";
import { items } from "../../content/items";
import { services } from "../../content/services";

export function ExpeditionGuide({
  s,
  send,
  disabled,
}: {
  s: Snapshot;
  send: (i: Intent) => void;
  disabled: boolean;
}) {
  const me = s.players.find((p) => p.id === s.you)!;
  const [recipient, setRecipient] = useState("");
  const [item, setItem] = useState("");
  const between = ["MAP", "CAMP", "REWARD", "MENTOR", "UPGRADE"].includes(
    s.phase,
  );
  return (
    <details className="expedition-guide">
      <summary>
        {s.phase === "MAP"
          ? "Provisions and trading · expedition guide"
          : `Expedition guide · statuses${between ? " · trading" : ""}`}
      </summary>
      <p>
        {s.phase === "LOBBY"
          ? "Invite at least one friend, choose heroes, then ready up. Every hero must be ready before anyone can begin."
          : s.phase === "COMBAT"
            ? "Read enemy intentions before locking. Weak reduces damage; interrupt a WINDUP to cancel it. Front-row heroes draw most attacks; the Rivet Sniper prefers the back. Row attacks hit everyone in the selected row, and row support rewards grouping allies."
            : s.phase === "AUCTION"
              ? "All purchases use the shared treasury. Interest chooses who wants the item; contested bids raise its price. Large purchases need party approval. A new item surrenders your old equipment in that slot."
              : "Vote together on the next chamber. Spend gold on equipment, supplies, mentors or recovery. Keeping a reserve funds revivals; hoarding too much strengthens the Miser."}
      </p>
      <p>
        Downed heroes can grant one spirit ward or resource each round. Standing
        heroes may buy a revival; camp can recover fallen heroes.
      </p>
      <details>
        <summary>Status reference</summary>
        {Object.entries(statuses).map(([id, st]) => (
          <p key={id}>
            <strong>{id.toUpperCase()}</strong> — {st.description}
          </p>
        ))}
      </details>
      {s.phase === "MAP" && (
        <section aria-label="Party provisions">
          <h3>Roadside provisions</h3>
          <p>
            Propose a shared purchase before voting on the next chamber. A
            strict majority must approve.
          </p>
          {s.serviceVote ? (
            <div role="status">
              <p>
                {services.find((x) => x.id === s.serviceVote?.id)?.name} ·{" "}
                {services.find((x) => x.id === s.serviceVote?.id)?.price} gold
              </p>
              <button
                disabled={disabled || me.id in s.serviceVote.votes}
                onClick={() => send({ type: "serviceVote", approve: true })}
              >
                Approve provisions
              </button>
              <button
                disabled={disabled || me.id in s.serviceVote.votes}
                onClick={() => send({ type: "serviceVote", approve: false })}
              >
                Decline provisions
              </button>
            </div>
          ) : (
            services.map((service) => (
              <p key={service.id}>
                <strong>{service.name}</strong> · {service.description}{" "}
                <button
                  disabled={
                    disabled ||
                    Object.keys(s.votes).length > 0 ||
                    s.gold < service.price ||
                    ("relic" in service &&
                      !!s.teamRelics?.includes(service.relic))
                  }
                  onClick={() =>
                    send({ type: "proposeService", service: service.id })
                  }
                >
                  Propose · {service.price} gold
                </button>
              </p>
            ))
          )}
        </section>
      )}
      {!!s.teamRelics?.length && (
        <p>
          Team relics:{" "}
          {s.teamRelics
            .map((id) => services.find((x) => x.id === id)?.name ?? id)
            .join(", ")}
        </p>
      )}
      {between && (
        <section aria-label="Equipment trading">
          <h3>Trade between heroes</h3>
          <p>
            The recipient must accept. If their equipment slot is occupied,
            their old piece returns to you. Supplies transfer one copy. Offers
            expire when the party enters another chamber.
          </p>
          <label>
            Offer{" "}
            <select
              aria-label="Offer"
              value={item}
              onChange={(e) => setItem(e.target.value)}
            >
              <option value="">Choose an item</option>
              {[...new Set(me.items)].map((id) => (
                <option key={id} value={id}>
                  {items.find((i) => i.id === id)?.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {" "}
            To{" "}
            <select
              aria-label="To"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            >
              <option value="">Choose a hero</option>
              {s.players
                .filter((p) => p.id !== me.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>
          <button
            disabled={disabled || !me.items.includes(item) || !recipient}
            onClick={() =>
              send({ type: "offerTrade", item, target: recipient })
            }
          >
            Offer trade
          </button>
          {(s.trades ?? [])
            .filter(
              (t) =>
                t.node === s.currentNode &&
                (t.to === me.id || t.from === me.id),
            )
            .map((t) => (
              <p key={t.from}>
                {s.players.find((p) => p.id === t.from)?.name} offers{" "}
                {items.find((i) => i.id === t.item)?.name} to{" "}
                {s.players.find((p) => p.id === t.to)?.name}
                {t.returnItem
                  ? ` in exchange for ${items.find((i) => i.id === t.returnItem)?.name}`
                  : " as a gift"}
                .
                {t.to === me.id ? (
                  <>
                    <button
                      disabled={disabled}
                      onClick={() =>
                        send({
                          type: "answerTrade",
                          from: t.from,
                          item: t.item,
                          accept: true,
                        })
                      }
                    >
                      Accept exchange
                    </button>
                    <button
                      disabled={disabled}
                      onClick={() =>
                        send({
                          type: "answerTrade",
                          from: t.from,
                          item: t.item,
                          accept: false,
                        })
                      }
                    >
                      Decline
                    </button>
                  </>
                ) : (
                  " Waiting for acceptance."
                )}
              </p>
            ))}
        </section>
      )}
    </details>
  );
}
