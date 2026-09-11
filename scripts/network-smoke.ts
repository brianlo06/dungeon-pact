import assert from "node:assert/strict";
import WebSocket from "ws";
import type { Snapshot } from "../src/shared/model";
import { epoch } from "../src/shared/protocol";
import type { Intent, Command } from "../src/shared/protocol";
import { abilities } from "../src/content/heroes";
import { upgradeOffer } from "../src/content/upgrades";
const base = process.env.PACT_TEST_URL ?? "http://127.0.0.1:8787";
async function post(path: string, body?: unknown) {
  const r = await fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = (await r.json()) as Record<string, string>;
  assert.equal(r.status, 200, JSON.stringify(d));
  return d;
}
const { room } = await post("/api/rooms");
const one = await post(`/api/rooms/${room}/join`, { name: "Smoke One" });
const two = await post(`/api/rooms/${room}/join`, { name: "Smoke Two" });
class Client {
  ws: WebSocket;
  state!: Snapshot;
  messages: { type: string; id?: string; code?: string; message?: string }[] =
    [];
  constructor(token: string) {
    this.ws = new WebSocket(
      base.replace("http", "ws") + `/api/rooms/${room}/socket`,
      ["pact-v1", token],
    );
    this.ws.on("message", (data) => {
      const m = JSON.parse(String(data));
      if (m.type === "snapshot") this.state = m.state;
      this.messages.push(m);
    });
  }
  async wait(predicate: () => boolean) {
    const end = Date.now() + 5000;
    while (!predicate()) {
      if (Date.now() > end)
        throw Error(
          "Network timeout " + JSON.stringify(this.messages.slice(-2)),
        );
      await new Promise((r) => setTimeout(r, 15));
    }
  }
  async send(intent: Intent) {
    await new Promise((r) => setTimeout(r, 100));
    const revision = this.state.revision;
    const cmd: Command = {
      version: 1,
      id: crypto.randomUUID(),
      revision,
      epoch: epoch(this.state),
      intent,
    };
    this.ws.send(JSON.stringify(cmd));
    await this.wait(() => this.state.revision > revision);
    return cmd;
  }
}
const a = new Client(one.token),
  b = new Client(two.token);
let resumed: Client | undefined;
try {
  await Promise.all([a.wait(() => !!a.state), b.wait(() => !!b.state)]);
  assert.equal(a.state.players.length, 2);
  assert.equal(a.state.you, one.player);
  await b.send({ type: "hero", hero: "arcanist" });
  await a.wait(() => a.state.revision === b.state.revision);
  const cmd = await a.send({ type: "ready", ready: true });
  await b.wait(() => b.state.revision === a.state.revision);
  const revision = a.state.revision;
  a.ws.send(JSON.stringify(cmd));
  await a.wait(
    () =>
      a.messages.filter((m) => m.type === "ack" && m.id === cmd.id).length ===
      2,
  );
  assert.equal(a.state.revision, revision);
  await b.send({ type: "ready", ready: true });
  await a.wait(() => a.state.revision === b.state.revision);
  await a.send({ type: "start" });
  await b.wait(() => b.state.phase === "PACT");
  // Both heroes answer the same question at the same instant. Under exact
  // revision matching the second was rejected as stale and had to re-send;
  // under decision epochs both are decisions about the same moment, so both
  // land and the pact is chosen in one exchange.
  const rev = a.state.revision;
  const moment = epoch(a.state);
  for (const c of [a, b])
    c.ws.send(
      JSON.stringify({
        version: 1,
        id: crypto.randomUUID(),
        revision: rev,
        epoch: moment,
        intent: { type: "vote", choice: "wealth" },
      }),
    );
  await a.wait(() => a.state.phase === "MAP");
  assert.equal(a.state.revision, rev + 2);
  assert.ok(
    ![...a.messages, ...b.messages].some((m) => m.code === "STALE"),
    "simultaneous decisions in one moment must not collide",
  );
  // A decision made against a moment that has passed is still refused.
  a.ws.send(
    JSON.stringify({
      version: 1,
      id: crypto.randomUUID(),
      revision: a.state.revision,
      epoch: moment,
      intent: { type: "vote", choice: "wealth" },
    }),
  );
  await a.wait(() => a.messages.some((m) => m.code === "STALE"));
  const before = a.state;
  a.ws.close();
  // The rest of the party is told someone left. This went unchecked while the
  // server threw on every close and never published the departure.
  await b.wait(() => !b.state.connected.includes(one.player));
  resumed = new Client(one.token);
  await resumed.wait(() => !!resumed!.state);
  assert.equal(resumed.state.you, one.player);
  assert.equal(resumed.state.gold, before.gold);
  assert.equal(resumed.state.phase, "MAP");
  await b.wait(() => b.state.revision === resumed!.state.revision);
  const node = resumed.state.map.find((n) => n.depth === 0)!.id;
  await resumed.send({ type: "vote", choice: node });
  await b.wait(() => b.state.revision === resumed!.state.revision);
  await b.send({ type: "vote", choice: node });
  await resumed.wait(() => resumed!.state.phase === "COMBAT");
  assert.equal(resumed.state.combatVersion, 2);
  await resumed.send({ type: "plan", ability: "brace", target: one.player });
  await b.wait(() => b.state.revision === resumed!.state.revision);
  await b.send({ type: "plan", ability: "brace", target: two.player });
  await resumed.wait(() => resumed!.state.round === 2);
  const windup = b.state.enemies.find((e) => e.intent.ability.interruptible);
  assert.ok(
    windup,
    "Opening packs must present an interruptible threat on round 2",
  );
  await resumed.send({ type: "plan", ability: "brace", target: one.player });
  await b.wait(() => b.state.revision === resumed!.state.revision);
  await b.send({ type: "plan", ability: "counterspell", target: windup.id });
  await resumed.wait(() => resumed!.state.round === 3);
  assert.ok(resumed.state.logs.some((l) => l.text.includes("interrupted.")));
  assert.equal(
    b.state.players.find((p) => p.id === two.player)!.cooldowns.counterspell,
    2,
  );
  // Finish the encounter so the new branch-upgrade phase is exercised over the
  // wire, not just in the reducer. Sockets mutate state between reads, so the
  // phase is always read fresh rather than through a narrowed local.
  const phase = (c: Client) => c.state.phase as string;
  const pair: [Client, string][] = [
    [resumed, one.player],
    [b, two.player],
  ];
  for (let guard = 0; guard < 40 && phase(resumed) === "COMBAT"; guard++) {
    for (const [client, playerId] of pair) {
      if (phase(client) !== "COMBAT") break;
      const me = client.state.players.find((p) => p.id === playerId)!;
      if (me.hp <= 0 || client.state.locked.includes(playerId)) continue;
      const enemy = client.state.enemies.find((e) => e.hp > 0);
      if (!enemy) break;
      const best = abilities(me.heroId, client.state.combatVersion, me.upgrades)
        .filter(
          (x) =>
            x.target === "enemy" &&
            x.cost <= me.resource &&
            !(me.cooldowns[x.id] > 0) &&
            x.effects.some((e) => e.kind === "damage"),
        )
        .sort(
          (x, y) =>
            y.effects.reduce(
              (n, e) => n + (e.kind === "damage" ? e.amount : 0),
              0,
            ) -
            x.effects.reduce(
              (n, e) => n + (e.kind === "damage" ? e.amount : 0),
              0,
            ),
        )[0];
      if (!best) break;
      await client.send({ type: "plan", ability: best.id, target: enemy.id });
      const other = client === b ? resumed : b;
      await other.wait(() => other.state.revision === client.state.revision);
    }
  }
  assert.equal(phase(resumed), "UPGRADE", "Victory must offer branches");
  for (const [client, playerId] of pair) {
    const me = client.state.players.find((p) => p.id === playerId)!;
    const offer = upgradeOffer(me);
    assert.equal(offer.length, 2, "Each hero is offered two branches");
    await client.send({ type: "upgrade", choice: offer[0].id });
    const other = client === b ? resumed : b;
    await other.wait(() => other.state.revision === client.state.revision);
  }
  await resumed.wait(() => phase(resumed!) === "REWARD");
  for (const [, playerId] of pair)
    assert.equal(
      resumed.state.players.find((p) => p.id === playerId)!.upgrades?.length,
      1,
      "Each hero keeps exactly one branch",
    );
  console.log(
    JSON.stringify({
      ok: true,
      room,
      checks: [
        "room creation",
        "2-player join",
        "authenticated snapshots",
        "ready/start",
        "duplicate command receipts",
        "simultaneous decisions accepted, passed moment refused",
        "resync",
        "a departure reaches the rest of the party",
        "reconnect restores hero/gold/phase",
        "tactical encounter entry",
        "windup/interrupt resolution and cooldown",
        "encounter victory reaches the branch-upgrade phase",
        "each hero locks one branch and the party advances",
      ],
    }),
  );
} finally {
  a.ws.close();
  b.ws.close();
  resumed?.ws.close();
}
