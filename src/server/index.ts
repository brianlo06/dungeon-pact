import { DurableObject } from "cloudflare:workers";
import { validateContent } from "../content/validate";
validateContent();
import { commandSchema, joinSchema, epoch } from "../shared/protocol";
import type { RunState } from "../shared/model";
import { createRun, addPlayer, reduce, snapshot } from "../engine/game";
type Session = { player: string; hash: string; connection: string };
/**
 * Retention. A room is a scratch space, not an archive: it holds guest names
 * and a run, and both are deleted rather than kept. A finished run is cleared
 * soon after the results screen; an unfinished one survives long enough to
 * pick up the next day and no longer.
 */
const FINISHED_TTL = 2 * 60 * 60 * 1000;
const ABANDONED_TTL = 24 * 60 * 60 * 1000;
/** A socket that has issued no command for this long is closed and may reconnect. */
const IDLE_TTL = 45 * 60 * 1000;
/** How often the room wakes to enforce the three timers above. */
const SWEEP = 30 * 60 * 1000;
/** New rooms allowed from one address per hour. */
const CREATION_LIMIT = 12;
const CREATION_WINDOW = 60 * 60 * 1000;
interface Attachment {
  player: string;
  connection: string;
  window: number;
  count: number;
}
async function digest(token: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)),
    ),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}
function token() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export class PactRoom extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS run (id INTEGER PRIMARY KEY CHECK(id=1), state TEXT NOT NULL)",
    );
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS sessions (player TEXT PRIMARY KEY, hash TEXT UNIQUE, connection TEXT NOT NULL)",
    );
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS receipts (player TEXT, id TEXT, revision INTEGER, PRIMARY KEY(player,id))",
    );
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS meta (id INTEGER PRIMARY KEY CHECK(id=1), touched INTEGER NOT NULL)",
    );
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS admissions (at INTEGER NOT NULL)",
    );
    // Keepalive is answered without waking the room, so liveness is judged by
    // commands rather than by pings: a tab left open costs the room nothing.
    ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong"),
    );
  }
  private read() {
    const rows = this.ctx.storage.sql
      .exec<{ state: string }>("SELECT state FROM run WHERE id=1")
      .toArray();
    if (!rows.length) throw Error("Room not found");
    const state: RunState = JSON.parse(rows[0].state);
    if (state.schemaVersion !== 1 || state.contentVersion !== 1)
      throw Error("Save version is not supported");
    return state;
  }
  private save(s: RunState) {
    this.ctx.storage.sql.exec(
      "INSERT INTO run(id,state) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state",
      JSON.stringify(s),
    );
  }
  /** Records that the room is in use and makes sure the sweep is scheduled. */
  private async touch() {
    this.ctx.storage.sql.exec(
      "INSERT INTO meta(id,touched) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET touched=excluded.touched",
      Date.now(),
    );
    if ((await this.ctx.storage.getAlarm()) === null)
      await this.ctx.storage.setAlarm(Date.now() + SWEEP);
  }
  private touched() {
    return (
      this.ctx.storage.sql
        .exec<{ touched: number }>("SELECT touched FROM meta WHERE id=1")
        .toArray()[0]?.touched ?? 0
    );
  }
  /**
   * Closes idle sockets, and deletes the room once it is finished or
   * abandoned. Everything a room holds is guest data with no home anywhere
   * else, so expiry is a delete rather than an archive.
   */
  async alarm() {
    const now = Date.now();
    for (const ws of this.ctx.getWebSockets()) {
      const a = ws.deserializeAttachment() as Attachment;
      if (now - a.window > IDLE_TTL)
        ws.close(4002, "Idle. Reconnect to rejoin.");
    }
    let state: RunState | null = null;
    try {
      state = this.read();
    } catch {
      state = null;
    }
    const idle = now - this.touched();
    const done = state?.phase === "COMPLETE";
    if (!state || idle > ABANDONED_TTL || (done && idle > FINISHED_TTL)) {
      for (const ws of this.ctx.getWebSockets())
        ws.close(4003, "This room has expired.");
      await this.ctx.storage.deleteAll();
      return;
    }
    await this.ctx.storage.setAlarm(now + SWEEP);
  }
  /**
   * Room creation, rate limited per address. Called on a limiter instance
   * rather than a room, so one caller cannot fill the namespace with rooms
   * nobody ever joins.
   */
  async admit() {
    const now = Date.now();
    this.ctx.storage.sql.exec(
      "DELETE FROM admissions WHERE at < ?",
      now - CREATION_WINDOW,
    );
    const used = this.ctx.storage.sql
      .exec<{ n: number }>("SELECT COUNT(*) AS n FROM admissions")
      .toArray()[0].n;
    if (used >= CREATION_LIMIT) return false;
    this.ctx.storage.sql.exec("INSERT INTO admissions(at) VALUES(?)", now);
    return true;
  }
  private connected() {
    return [
      ...new Set(
        this.ctx
          .getWebSockets()
          .map((ws) => (ws.deserializeAttachment() as Attachment).player),
      ),
    ];
  }
  private publish(s: RunState) {
    const connected = this.connected();
    for (const ws of this.ctx.getWebSockets()) {
      const a = ws.deserializeAttachment() as Attachment;
      try {
        ws.send(
          JSON.stringify({
            type: "snapshot",
            state: snapshot(s, a.player, connected),
          }),
        );
      } catch {
        ws.close(1011, "Connection lost");
      }
    }
  }
  async create(room: string) {
    if (this.ctx.storage.sql.exec("SELECT id FROM run").toArray().length)
      return false;
    this.save(createRun(room, token()));
    await this.touch();
    return true;
  }
  async join(name: string) {
    const bearer = token();
    const hash = await digest(bearer);
    const s = this.read();
    const id = crypto.randomUUID();
    addPlayer(s, id, name);
    this.ctx.storage.transactionSync(() => {
      this.save(s);
      this.ctx.storage.sql.exec(
        "INSERT INTO sessions(player,hash,connection) VALUES(?,?,?)",
        id,
        hash,
        "",
      );
    });
    await this.touch();
    this.publish(s);
    return { player: id, token: bearer, room: s.room };
  }
  async fetch(request: Request) {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket")
      return new Response("WebSocket required", { status: 426 });
    const protocols =
      request.headers
        .get("Sec-WebSocket-Protocol")
        ?.split(",")
        .map((x) => x.trim()) ?? [];
    if (
      protocols[0] !== "pact-v1" ||
      !protocols[1] ||
      protocols[1].length !== 64
    )
      return new Response("Unauthorized", { status: 401 });
    const hash = await digest(protocols[1]);
    const session = this.ctx.storage.sql
      .exec<Session>("SELECT * FROM sessions WHERE hash=?", hash)
      .toArray()[0];
    if (!session) return new Response("Unauthorized", { status: 401 });
    const pair = new WebSocketPair();
    const connection = crypto.randomUUID();
    this.ctx.storage.sql.exec(
      "UPDATE sessions SET connection=? WHERE player=?",
      connection,
      session.player,
    );
    for (const ws of this.ctx.getWebSockets(session.player))
      ws.close(4001, "Opened in another tab");
    this.ctx.acceptWebSocket(pair[1], [session.player]);
    pair[1].serializeAttachment({
      player: session.player,
      connection,
      window: Date.now(),
      count: 0,
    } satisfies Attachment);
    this.publish(this.read());
    return new Response(null, {
      status: 101,
      webSocket: pair[0],
      headers: { "Sec-WebSocket-Protocol": "pact-v1" },
    });
  }
  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    const a = ws.deserializeAttachment() as Attachment;
    try {
      if (typeof message !== "string" || message.length > 4096)
        throw Error("Invalid message size");
      const session = this.ctx.storage.sql
        .exec<Session>("SELECT * FROM sessions WHERE player=?", a.player)
        .toArray()[0];
      if (session?.connection !== a.connection) {
        ws.close(4001, "Superseded connection");
        return;
      }
      const now = Date.now();
      if (now - a.window > 1000) {
        a.window = now;
        a.count = 0;
      }
      a.count++;
      ws.serializeAttachment(a);
      if (a.count > 12) throw Error("Slow down");
      const parsed = commandSchema.safeParse(JSON.parse(message));
      if (!parsed.success) throw Error("Invalid command");
      const cmd = parsed.data;
      const receipt = this.ctx.storage.sql
        .exec<{ revision: number }>(
          "SELECT revision FROM receipts WHERE player=? AND id=?",
          a.player,
          cmd.id,
        )
        .toArray()[0];
      const s = this.read();
      if (receipt) {
        ws.send(
          JSON.stringify({
            type: "ack",
            id: cmd.id,
            revision: receipt.revision,
          }),
        );
        ws.send(
          JSON.stringify({
            type: "snapshot",
            state: snapshot(s, a.player, this.connected()),
          }),
        );
        return;
      }
      if (cmd.epoch !== epoch(s)) {
        ws.send(
          JSON.stringify({
            type: "error",
            message:
              "The room moved on. Review the latest state and try again.",
            code: "STALE",
          }),
        );
        ws.send(
          JSON.stringify({
            type: "snapshot",
            state: snapshot(s, a.player, this.connected()),
          }),
        );
        return;
      }
      const next = reduce(s, a.player, cmd.intent, now);
      this.ctx.storage.transactionSync(() => {
        this.save(next);
        this.ctx.storage.sql.exec(
          "INSERT INTO receipts(player,id,revision) VALUES(?,?,?)",
          a.player,
          cmd.id,
          next.revision,
        );
        this.ctx.storage.sql.exec(
          "DELETE FROM receipts WHERE revision < ?",
          Math.max(0, next.revision - 2000),
        );
      });
      ws.send(
        JSON.stringify({ type: "ack", id: cmd.id, revision: next.revision }),
      );
      this.publish(next);
      void this.touch();
    } catch (e) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: e instanceof Error ? e.message : "Unable to process command",
        }),
      );
    }
  }
  webSocketClose(ws: WebSocket, code: number) {
    ws.close(code);
    this.publish(this.read());
  }
  webSocketError(ws: WebSocket) {
    ws.close(1011, "Connection error");
  }
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    const origin = request.headers.get("Origin");
    if (origin && new URL(origin).host !== url.host)
      return new Response("Origin rejected", { status: 403 });
    try {
      if (url.pathname === "/api/rooms" && request.method === "POST") {
        // One limiter instance per address, addressed by a name no room code
        // can take: room codes are eight characters from a fixed alphabet.
        const caller = request.headers.get("cf-connecting-ip") ?? "local";
        if (!(await env.ROOMS.getByName(`limiter:${caller}`).admit()))
          return new Response("Too many rooms from this address.", {
            status: 429,
          });
        const code = Array.from(
          crypto.getRandomValues(new Uint8Array(8)),
          (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32],
        ).join("");
        const stub = env.ROOMS.getByName(code);
        if (!(await stub.create(code)))
          return new Response("Retry creation", { status: 409 });
        return Response.json({ room: code });
      }
      const match = url.pathname.match(
        /^\/api\/rooms\/([A-Z2-9]{8})\/(join|socket)$/,
      );
      if (!match) return new Response("Not found", { status: 404 });
      const room = env.ROOMS.getByName(match[1]);
      if (match[2] === "socket") return room.fetch(request);
      if (request.method !== "POST")
        return new Response("Method not allowed", { status: 405 });
      const reader = request.body?.getReader();
      if (!reader) return new Response("Body required", { status: 400 });
      let body = "";
      const decoder = new TextDecoder();
      while (true) {
        const r = await reader.read();
        if (r.done) break;
        body += decoder.decode(r.value, { stream: true });
        if (body.length > 256) {
          await reader.cancel();
          return new Response("Body too large", { status: 413 });
        }
      }
      const input = joinSchema.parse(JSON.parse(body));
      return Response.json(await room.join(input.name));
    } catch (e) {
      return Response.json(
        { error: e instanceof Error ? e.message : "Request failed" },
        { status: 400 },
      );
    }
  },
} satisfies ExportedHandler<Env>;
