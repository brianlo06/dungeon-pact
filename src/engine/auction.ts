import type { RunState } from "../shared/model";
import { items } from "../content/items";
import { pick } from "./rng";
import { log, spend } from "./effects";
export function enterAuction(s: RunState, mystery: boolean) {
  const item = pick(s, items);
  s.phase = "AUCTION";
  s.auction = {
    itemId: item.id,
    revealed: !mystery,
    price: Math.floor((item.price * 0.65) / 10) * 10,
    active: [],
    acted: [],
    stage: "interest",
    approvals: {},
    round: 1,
  };
  log(
    s,
    "“A fine investment. Whether you survive to enjoy it is another matter.”",
  );
}
export function nominate(s: RunState) {
  const a = s.auction!;
  if (a.active.length === 0) {
    a.stage = "sold";
    log(s, "No sale. “Prudence. How disappointing.”");
    return;
  }
  if (a.active.length === 1) {
    a.owner = a.active[0];
    if (a.price > s.gold) {
      a.stage = "sold";
      a.owner = undefined;
      log(s, "The treasury cannot cover this lot.");
    } else if (a.price >= s.gold * s.approvalThreshold) {
      a.stage = "approval";
      a.approvals = {};
      log(s, `Pact approval required: ${a.price} gold.`);
    } else purchase(s);
  } else {
    a.stage = "bidding";
    a.acted = [];
  }
}
export function purchase(s: RunState) {
  const a = s.auction!;
  const p = s.players.find((p) => p.id === a.owner)!;
  const item = items.find((i) => i.id === a.itemId)!;
  spend(s, a.price);
  p.spent += a.price;
  const old = p.items.find(
    (id) => items.find((i) => i.id === id)!.slot === item.slot,
  );
  p.items = p.items.filter((id) => id !== old);
  p.items.push(item.id);
  a.revealed = true;
  a.stage = "sold";
  log(
    s,
    `${p.name} buys ${item.name} for ${a.price} gold.${old ? " Previous equipment is surrendered." : ""}`,
  );
}
