import { useEffect, useRef, useState } from "react";
import type { Beat, Snapshot } from "../shared/model";
import { audio } from "./audio";

/** Longest a round may take to replay. Long rounds speed up rather than drag. */
const ROUND_MS = 4200;
const STEP: Record<Beat["kind"], number> = {
  cast: 420,
  damage: 300,
  heal: 320,
  block: 240,
  combo: 560,
  defeat: 480,
};

export interface Playback {
  /** Health to render while replaying; null once the round has settled. */
  hp: Record<string, number> | null;
  beat: Beat | null;
  playing: boolean;
  skip: () => void;
}

const healthOf = (s: Snapshot) =>
  Object.fromEntries(
    [...s.players, ...s.enemies].map((u) => [u.id, u.hp] as const),
  );

/**
 * Replays a resolved round as timed beats instead of snapping to the settled
 * state. The engine sends the whole round at once, so without this the client
 * shows only the aftermath and the fight has no moments in it.
 *
 * Health shown during playback is cosmetic: it always ends by clearing the
 * override, so a mistimed beat can never leave the board disagreeing with the
 * server.
 */
export function usePlayback(s: Snapshot | null, reduced: boolean): Playback {
  const [beat, setBeat] = useState<Beat | null>(null);
  const [hp, setHp] = useState<Record<string, number> | null>(null);
  const seen = useRef(0);
  const settled = useRef<Record<string, number>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stop = useRef<() => void>(() => {});

  useEffect(() => {
    if (!s) return;
    const fresh = s.logs.filter((l) => l.seq > seen.current && l.beat);
    seen.current = s.logs.length ? s.logs[s.logs.length - 1].seq : 0;
    const finish = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      settled.current = healthOf(s);
      setHp(null);
      setBeat(null);
    };
    stop.current = finish;
    // First sight of a room, a non-combat phase, or reduced motion: no replay.
    if (!fresh.length || reduced || s.phase !== "COMBAT") {
      finish();
      return;
    }
    const beats = fresh.map((l) => l.beat!);
    const board = { ...settled.current };
    // Units the client has not seen before start from the settled snapshot.
    for (const [id, value] of Object.entries(healthOf(s)))
      if (!(id in board)) board[id] = value;
    const natural = beats.reduce((n, b) => n + STEP[b.kind], 0);
    const scale = Math.min(1, ROUND_MS / Math.max(1, natural));
    setHp({ ...board });
    let at = 0;
    beats.forEach((b) => {
      timers.current.push(
        setTimeout(() => {
          if (b.target && b.hp !== undefined) board[b.target] = b.hp;
          setHp({ ...board });
          setBeat(b);
          audio.cue(
            b.kind === "combo"
              ? "combo"
              : b.kind === "heal"
                ? "heal"
                : b.kind === "cast"
                  ? "info"
                  : "damage",
          );
        }, at),
      );
      at += STEP[b.kind] * scale;
    });
    timers.current.push(setTimeout(finish, at + 220));
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [s, reduced]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return { hp, beat, playing: hp !== null, skip: () => stop.current() };
}
