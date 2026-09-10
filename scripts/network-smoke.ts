import assert from "node:assert/strict";
import WebSocket from "ws";
import type { Snapshot } from "../src/shared/model";
import type { Intent, Command } from "../src/shared/protocol";
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
  const rev = a.state.revision;
  for (const c of [a, b])
    c.ws.send(
      JSON.stringify({
        version: 1,
        id: crypto.randomUUID(),
        revision: rev,
        intent: { type: "vote", choice: "wealth" },
      }),
    );
  await a.wait(() =>
    [...a.messages, ...b.messages].some((m) => m.code === "STALE"),
  );
  assert.equal(a.state.revision, rev + 1);
  const missing = a.state.votes[one.player] ? b : a;
  await missing.wait(() => missing.state.revision === rev + 1);
  await missing.send({ type: "vote", choice: "wealth" });
  await a.wait(() => a.state.phase === "MAP");
  const before = a.state;
  a.ws.close();
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
        "concurrent stale rejection",
        "resync",
        "reconnect restores hero/gold/phase",
        "tactical encounter entry",
        "windup/interrupt resolution and cooldown",
      ],
    }),
  );
} finally {
  a.ws.close();
  b.ws.close();
  resumed?.ws.close();
}
