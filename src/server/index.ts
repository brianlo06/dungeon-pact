import { DurableObject } from "cloudflare:workers";
import { validateContent } from "../content/validate";
validateContent();
import { commandSchema, joinSchema } from "../shared/protocol";
import type { RunState } from "../shared/model";
import { createRun, addPlayer, reduce, snapshot } from "../engine/game";
type Session = { player: string; hash: string; connection: string };
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
      if (cmd.revision !== s.revision) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "The room changed. Review the latest state and try again.",
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
