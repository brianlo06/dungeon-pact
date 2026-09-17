import { useEffect, useRef, useState } from "react";
import type { Snapshot } from "../shared/model";
import { epoch, type Intent } from "../shared/protocol";
import { audio } from "./audio";
export interface Credentials {
  room: string;
  player: string;
  token: string;
}
export function savedCredentials(): Credentials | null {
  try {
    return JSON.parse(localStorage.getItem("pact.session") ?? "null");
  } catch {
    return null;
  }
}
/**
 * The saved pact this page should resume, if any. An invite link to a
 * different room wins over it: opening a friend's link must take you to their
 * room, not back to one you made earlier.
 */
export function resumableCredentials(
  search = location.search,
): Credentials | null {
  const saved = savedCredentials();
  const linked = new URLSearchParams(search).get("room")?.toUpperCase();
  return saved && linked && linked !== saved.room ? null : saved;
}
/**
 * Tell the room this player is leaving. Before the run starts it gives their
 * seat back; after, the hero stays with the party. Best effort: a room that
 * has expired, or a network that is down, leaves nothing to undo.
 */
export function leaveRoom(credentials: Credentials) {
  void fetch(`/api/rooms/${credentials.room}/leave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: credentials.token }),
    keepalive: true,
  }).catch(() => {});
}
export function useRoom(credentials: Credentials | null) {
  const [state, setState] = useState<Snapshot | null>(null);
  const [connection, setConnection] = useState("offline");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  const current = useRef<Snapshot | null>(null);
  const seq = useRef(0);
  useEffect(() => {
    if (!credentials) {
      setState(null);
      return;
    }
    let disposed = false;
    let retry: ReturnType<typeof setTimeout>;
    let heartbeat: ReturnType<typeof setInterval>;
    let attempt = 0;
    const connect = () => {
      setConnection("connecting");
      const ws = new WebSocket(
        `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/api/rooms/${credentials.room}/socket`,
        ["pact-v1", credentials.token],
      );
      socket.current = ws;
      ws.onopen = () => {
        attempt = 0;
        setConnection("online");
        setError("");
        heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send("ping");
        }, 20000);
      };
      ws.onmessage = (e) => {
        if (e.data === "pong") return;
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "snapshot") {
            if (
              current.current &&
              msg.state.revision < current.current.revision
            )
              return;
            current.current = msg.state;
            setState(msg.state);
            setPending(false);
            const last = msg.state.logs.at(-1);
            if (last && last.seq > seq.current) {
              if (seq.current) audio.cue(last.kind);
              seq.current = last.seq;
            }
          } else if (msg.type === "error") {
            setError(msg.message);
            setPending(false);
          } else if (msg.type === "ack") setPending(false);
        } catch {
          setError("Unreadable server response.");
        }
      };
      ws.onclose = (e) => {
        clearInterval(heartbeat);
        setPending(false);
        if (disposed) return;
        if (e.code === 4001) {
          setConnection("superseded");
          return;
        }
        if (e.code === 4002) {
          setConnection("left");
          return;
        }
        setConnection("reconnecting");
        retry = setTimeout(connect, Math.min(10000, 500 * 2 ** attempt++));
      };
      ws.onerror = () =>
        setError("Connection interrupted. Your room is preserved.");
    };
    current.current = null;
    seq.current = 0;
    connect();
    return () => {
      disposed = true;
      clearTimeout(retry);
      clearInterval(heartbeat);
      socket.current?.close();
    };
  }, [credentials]);
  function send(intent: Intent) {
    if (socket.current?.readyState !== WebSocket.OPEN || !current.current)
      return;
    audio.unlock();
    audio.cue("click");
    setError("");
    setPending(true);
    socket.current.send(
      JSON.stringify({
        version: 1,
        id: crypto.randomUUID(),
        revision: current.current.revision,
        epoch: epoch(current.current),
        intent,
      }),
    );
  }
  return { state, connection, error, setError, send, pending };
}
