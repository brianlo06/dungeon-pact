import type { RunState } from "../shared/model";
import { items } from "../content/items";
import { pick } from "./rng";
import { log, spend } from "./effects";

/**
 * The party shop.
 *
 * This replaced the auction after a playtest: lots that were excellent for one
 * hero and useless for the rest gave nobody a reason to bid against anybody,
 * so the bidding was theatre over a shared purse. What made the exchange worth
 * playing was never the auction — it was the treasury being one pool, and
 * every purchase being gold the party cannot spend on a revival later. That
 * part is kept whole here. Prices are posted, stock is visible, and the only
 * question left is the real one: who needs this, and can we afford it.
 *
 * Buying still takes the party's consent, so no single player can empty the
 * purse, and the recipient has a veto because gear replaces what they wear.
 */

/** One of each worn slot, then the consumables, so every shop can answer a
 * party that fielded no protector — the lesson the auction's tray taught. */
const SHELVES = ["weapon", "armor", "relic", "supply", "supply"] as const;

/** Supplies are sold by the pair, as the auction's case was. */
export const PAIR = 2;

export function enterShop(s: RunState) {
  // Worn equipment nobody owns is preferred: a shelf offering a weapon both
  // heroes already carry is a shelf with nothing on it. Supplies are consumed,
  // so a party holding one is still a customer for another.
  const owned = new Set(
    s.players
      .flatMap((p) => p.items)
      .filter((id) => items.find((i) => i.id === id)?.slot !== "supply"),
  );
  const stock: string[] = [];
  for (const slot of SHELVES) {
    const catalogue = items.filter(
      (i) => i.slot === slot && !stock.includes(i.id),
    );
    const fresh = catalogue.filter((i) => !owned.has(i.id));
    stock.push(pick(s, fresh.length ? fresh : catalogue).id);
  }
  s.phase = "SHOP";
  s.auction = null;
  s.votes = {};
  s.shop = { stock, sold: [], sequence: 0, leaving: [] };
  log(
    s,
    "The shop opens. Posted prices, one shared treasury. Choose who needs the gear.",
  );
}

/**
 * Put one item on the table for the party to decide on. Only one decision runs
 * at a time: two open proposals against one purse can both look affordable and
 * only one of them is.
 */
export function proposePurchase(
  s: RunState,
  itemId: string,
  recipient: string,
) {
  const shop = s.shop!;
  if (shop.proposal) throw Error("Finish the current purchase decision first");
  if (!shop.stock.includes(itemId) || shop.sold.includes(itemId))
    throw Error("That item is no longer in stock");
  if (!s.players.some((p) => p.id === recipient && !p.fallen))
    throw Error("Choose an available recipient");
  const item = items.find((i) => i.id === itemId)!;
  if (item.price > s.gold)
    throw Error("The treasury cannot afford that purchase");
  shop.sequence++;
  shop.leaving = [];
  shop.proposal = { item: itemId, recipient, price: item.price, votes: {} };
}
/**
 * A purchase needs a majority of the party and the recipient's own consent;
 * a majority against it, or the recipient's refusal, ends it at once rather
 * than waiting for absent players.
 */
export function approvePurchase(s: RunState, player: string, approve: boolean) {
  const shop = s.shop!,
    offer = shop.proposal;
  if (!offer || player in offer.votes)
    throw Error("No unanswered purchase proposal");
  offer.votes[player] = approve;
  const yes = Object.values(offer.votes).filter(Boolean).length;
  const no = Object.values(offer.votes).filter((v) => !v).length;
  if (
    offer.votes[offer.recipient] === false ||
    no >= Math.ceil(s.players.length / 2)
  ) {
    delete shop.proposal;
    shop.sequence++;
    log(s, "The party declines the purchase. Nothing was spent.");
    return;
  }
  if (yes <= s.players.length / 2 || !offer.votes[offer.recipient]) return;
  const recipient = s.players.find((p) => p.id === offer.recipient)!;
  if (recipient.fallen) throw Error("Recipient unavailable");
  const item = items.find((i) => i.id === offer.item)!;
  spend(s, offer.price);
  recipient.spent += offer.price;
  if (item.slot !== "supply")
    recipient.items = recipient.items.filter(
      (id) => items.find((i) => i.id === id)?.slot !== item.slot,
    );
  for (let n = 0; n < (item.slot === "supply" ? PAIR : 1); n++)
    recipient.items.push(item.id);
  shop.sold.push(item.id);
  delete shop.proposal;
  shop.sequence++;
  log(
    s,
    `${recipient.name} receives ${item.slot === "supply" ? `${PAIR} × ` : ""}${item.name} for ${offer.price} team gold.`,
    "gold",
  );
}
