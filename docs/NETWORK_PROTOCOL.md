# Network protocol v1

Updated 2026-09-10

## HTTP and identity

POST `/api/rooms` returns an eight-character room code. POST `/api/rooms/:code/join` with `{name}` returns `{room,player,token}`. Guests need no signup. Names trim and validate at 1–24 characters. Room capacity is four, joining is lobby-only. The token is a 256-bit bearer; store on the device, do not share in invite links. Invite URL contains only the room code.

Connect to `/api/rooms/:code/socket` with subprotocols `['pact-v1', token]`. Server selects `pact-v1`. Same-origin is enforced. Connection replacement uses close 4001; old tabs must stop retrying. Normal disconnects retry with exponential backoff capped at ten seconds. `ping` → `pong` uses the platform's hibernation auto-response every 20 seconds, so a tab left open never wakes the room; liveness is therefore judged by commands, not by pings. A socket that has issued no command for 45 minutes is closed with 4002 and may reconnect immediately.

## Client commands

`{version:1,id:UUID,revision:integer,epoch:string,intent:{type,...}}`

`epoch` is the decision context the command was chosen in, derived by `epoch()` in `src/shared/protocol.ts` from facts both sides can see: phase, current node, combat round, auction lot/stage/round, event and mentor. `revision` is still carried and still acknowledged; it is no longer what decides acceptance.

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

A command is accepted when its `epoch` matches the room's. An epoch changes only when the thing being decided changes: the round resolves, the lot or its stage moves on, the phase ends. Two heroes locking plans in the same round, or answering the same vote at the same instant, are deciding about the same moment, so both are accepted.

This replaces exact-revision matching, which treated every accepted command as invalidating every other. Under that rule the second of two simultaneous lock-ins was rejected as stale and had to be re-sent, which is the single most likely thing to frustrate a table playing together.

Safety does not come from the epoch. Every handler in `reduce` guards its own idempotency — a vote already cast, a plan already locked, a lot already revealed, a mentor already answered are each refused on their own terms — so a duplicate or racing command cannot double-spend even when its epoch is current. The epoch's only job is to refuse a decision made about a moment that has passed.

Duplicate accepted IDs return the original acknowledgement and latest snapshot. They do not reapply effects. State and receipt share one SQLite transaction. Duplicate handling occurs before epoch validation. Receipts are per-player, so a second player cannot hijack the first player's request ID.

## Retention and limits

A room is a scratch space, not an archive: it holds guest names and one run, and expiry deletes rather than archives. The room wakes on a half-hourly alarm and enforces three timers — sockets idle 45 minutes are closed, a finished run is deleted two hours after it ends, and any room untouched for 24 hours is deleted outright. Deletion drops the run, the sessions and the receipts together; nothing is kept.

Room creation is limited to twelve per address per hour, counted by a limiter instance addressed as `limiter:<ip>` — a name no room code can take, since codes are eight characters from a fixed alphabet. Callers over the limit get 429. Behind a proxy that does not set `cf-connecting-ip` the whole origin shares one bucket.

## Information boundary

Snapshot omits seed until results, RNG state, selected concealed item ID and other players' exact plans. Auction view includes revealed item definition or a partial public clue. Enemy intentions are intentionally visible. Connected flags derive from accepted sockets; player slots survive disconnected sockets. No host controls authority.

## Verified and pending

Real local WebSockets verify two-player create/join/start, simultaneous decisions being accepted where they once collided, a passed moment still being refused, duplicate receipt acknowledgement, resync and reconnect. Room retention, idle disconnection and creation limits are implemented but are **verified only by their unit-level rules** — none of the three timers has been watched fire against a live Worker, because each is measured in hours. Remaining release gates: four physical devices, Worker restart smoke, network interruption duration, long session soak, schema fuzzing, and observing the retention alarms actually run.

Browser QA also verified duplicate-tab takeover: the replacement tab recovered combat round 2 and the original displayed its superseded-connection overlay.

## Tactical v2

Branch upgrades add one intent, `{type:'upgrade', choice}`, valid only during the UPGRADE phase and only for a branch the hero is currently offered; the server records picks in `votes` and applies them once every player has chosen. Equipped control abilities still use the existing plan command. Snapshots carry optional combatVersion/encounterVersion flags, an optional per-player `upgrades` array and an optional `revivals` counter, optional intent interruptible flags, and Guarded sourceId status links. Server rules reject invalid interrupts/protection targets before settlement. Windup/interrupt/cooldown behavior is included in the real-WebSocket smoke harness.
