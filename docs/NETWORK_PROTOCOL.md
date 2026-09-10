# Network protocol v1

Updated 2026-09-10

## HTTP and identity

POST `/api/rooms` returns an eight-character room code. POST `/api/rooms/:code/join` with `{name}` returns `{room,player,token}`. Guests need no signup. Names trim and validate at 1–24 characters. Room capacity is four, joining is lobby-only. The token is a 256-bit bearer; store on the device, do not share in invite links. Invite URL contains only the room code.

Connect to `/api/rooms/:code/socket` with subprotocols `['pact-v1', token]`. Server selects `pact-v1`. Same-origin is enforced. Connection replacement uses close 4001; old tabs must stop retrying. Normal disconnects retry with exponential backoff capped at ten seconds. `ping` → `pong` uses the platform's hibernation auto-response every 20 seconds. Heartbeat timeout detection still needs implementation.

## Client commands

`{version:1,id:UUID,revision:integer,intent:{type,...}}`

Intent union in `src/shared/protocol.ts`:

- hero `{hero}`, ready `{ready}`, start
- vote `{choice}` for starting pact, route, camp, event
- plan `{ability,target}`, unlock
- interest `{interested}`, bid `{stay}`, approve `{approve}`, reveal
- continue for settled auction/reward
- ping `{message}` from a bounded enum

No client provides a player ID, damage, gold, RNG roll or result. Connection identity decides the actor. Command JSON is size-bounded at 4 KiB; all commands are validated by Zod. Rate limit is 12 messages/second/socket.

## Server messages

- `{type:'snapshot',state:Snapshot}`: full filtered view, room revision, you, connected IDs, public state, locked IDs and only your own plan.
- `{type:'ack',id,revision}`: durable command receipt.
- `{type:'error',message,code?:'STALE'}`: rejection with no game mutation. STALE is followed by current snapshot.

Log events have their own monotonic sequence IDs independent of room revisions. UI sound is keyed off new log sequences. Last 100 log events are retained. Client ignores older snapshots. Server event replay/animation queues and incremental snapshot deltas are future optimizations; a full room snapshot is currently small enough.

## Concurrency semantics

Commands require exact current revision. Two commands racing on the same revision yield one accepted command and one STALE rejection, even if both would be semantically independent. This conservative initial rule prevents old clicks affecting a newly entered phase. The rejected player reviews and retries; the client does not blindly replay on the new revision. Later allow commuting actions using explicit phase/round epochs, while retaining strict auction settlement revision checks.

Duplicate accepted IDs return the original acknowledgement and latest snapshot. They do not reapply effects. State and receipt share one SQLite transaction. Duplicate handling occurs before revision validation. Receipts are per-player, so a second player cannot hijack the first player's request ID.

## Information boundary

Snapshot omits seed until results, RNG state, selected concealed item ID and other players' exact plans. Auction view includes revealed item definition or a partial public clue. Enemy intentions are intentionally visible. Connected flags derive from accepted sockets; player slots survive disconnected sockets. No host controls authority.

## Verified and pending

Real local WebSockets verify two-player create/join/start, concurrent stale rejection, duplicate receipt acknowledgement, resync and reconnect. Additional release gates: four physical devices, Worker restart smoke, network interruption duration, long session soak, schema fuzzing, room retention and public creation rate limits.

Browser QA also verified duplicate-tab takeover: the replacement tab recovered combat round 2 and the original displayed its superseded-connection overlay.

## Tactical v2

No new client intent types are required: equipped control abilities use the existing plan command. Snapshots carry optional combatVersion/encounterVersion flags, optional intent interruptible flags, and Guarded sourceId status links. Server rules reject invalid interrupts/protection targets before settlement. Windup/interrupt/cooldown behavior is included in the real-WebSocket smoke harness.
