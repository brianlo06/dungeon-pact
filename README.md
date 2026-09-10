# Dungeon Pact

A cooperative dungeon crawler built around a shared treasury, contested auctions and tactical simultaneous planning. Development expedition 0.1.0; full game roadmap in `docs/ROADMAP.md`.

## Run locally

Use Node 24 LTS and npm.

```sh
npm install
npm run types
npm run build
npm run dev:server
```

Open http://localhost:8787. Create a room and share its code. Use separate browser profiles/incognito contexts for separate guests; two tabs in the same profile intentionally reconnect as the same hero. Two to four ready players are required.

For client hot reload, leave the server running and use `npm run dev` in another terminal, then open Vite's printed URL. `/api` proxies to port 8787. Guest credentials belong to the origin where you joined; use the same URL when reconnecting. Local Durable Object data persists under `.wrangler/state`.

## Verify

```sh
npm run build
npm test
npm run simulate -- 50
npm run test:network # requires the local server
```

The network script creates disposable two-player test rooms. Production deployment is not configured or claimed. Wrangler config is ready for an explicit staging deployment after security/reliability gates and Cloudflare account selection.

## Implemented loop

Guest lobby → 4 hero choices → starting pact → 7-depth Foundry route → combat/auction/event → camp → final auction → boss → results. One authoritative room, versioned state, seeded RNG, ordered combat, shared treasury, majority approval, down/revive, reconnect and deduplication.

## Documents

- [Game design](docs/GAME_DESIGN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Content system](docs/CONTENT_SYSTEM.md)
- [Network protocol](docs/NETWORK_PROTOCOL.md)
- [Balance](docs/BALANCE.md)
- [Roadmap](docs/ROADMAP.md)
- [Changelog](docs/CHANGELOG.md)
- [Asset licenses](docs/ASSET_LICENSES.md)

The current content and polish are intentionally smaller than the Phase 1 target. Profiles, D1, extended progression, additional biomes, other auction modes, original illustrated character art and music are not implemented yet.
