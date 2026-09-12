# Phase 1 expedition expansion

Implemented after the first public deployment. This document supersedes the older inventory and feature-gap lists in HANDOFF and ROADMAP for the features below.

## Content

32 equippable items and five consumable supplies (37 item definitions), eight events, and two separately purchased team relics. The 20 new equipment definitions reuse existing modular SVG art families with authored accents and passive reactions. They are functional equipment, not 20 new bespoke silhouettes. Every new passive has an executable regression. New events offer consumables, cleansing, immediate healing or injury-for-gold choices; event supply references are validated at boot.

## Combat

Downed and fallen heroes may grant one spirit aid per round: four Barrier or one resource to a standing ally. It resolves immediately through the server reducer, never blocks standing players from resolving the round, and resets for each battle. It cannot revive a hero or attack an enemy.

New rooms use `expeditionVersion: 1`. In those rooms the Collector's second phase marks a debtor, follows with a conditional enforcement strike, and exposes seizure as a windup. The Miser's second-phase audit strips shields before its row attack, making interruption, Weak and leaving the targeted row useful alternatives to stacking Barrier. Older rooms retain their previous phase-II rotations.

Elite encounters can now include Armored (eight Barrier at round start) and Sapping (damaging hits drain one resource), alongside Greedy and Vampiric. Traits are described in the battle reference. This expands pack combinations without adding more base enemy models.

Target selection excludes invalid revive, protection and interrupt recipients. The guide explains existing row preference and row-wide effects. No new universal melee reach restriction was introduced; a deeper reach system remains a separate combat-design iteration.

## Economy

Roadside provisions are available on the map before route votes begin. A strict-majority approval buys party dressings, solvents, treatment or one of two team relics. Purchases use the authoritative shared treasury, reject duplicate votes, and cannot overlap a route vote. Pact Lantern grants six Barrier at battle start; Ration Engine heals six HP at battle start. Each is purchased at most once per run.

Trading is available on map, camp, reward, mentor and upgrade screens. A sender offers an owned item, the recipient accepts or declines, and an occupied equipment slot is exchanged back to the sender. Supplies transfer exactly one copy. Offers bind the expected item and return item and expire on a chamber change. Equipment changes invalidate acceptance rather than silently changing the bargain.

In new rooms, lot two uses a descending ask: all players pass to lower it by 30 gold to the disclosed floor. Passing at the floor closes the lot. Multiple claims use seeded selection at the posted price; the usual treasury approval remains required. This is untimed casual play, not a real-time Dutch auction or sealed bidding.

## Experience

First-visit guides cover lobby, map, combat and auction. Completion is stored locally per phase, and the persistent expedition guide remains available. Battle history contains current status descriptions, elite counterplay and an authoritative round summary. Summary totals are accumulated from beats as they are emitted, so chronicle truncation does not lose the totals. Combat pings can name the selected target.

The Foundry has furnace, coolant and ledger district scenery. These are variants within the existing region, not additional procedural biomes. Quiet original synthesized ambience follows the current phase, fades while the page is hidden, respects mute and has an independent volume control. Combat mixer levels now follow global settings. Adaptive music remains future work.

## Verification and limits

Validated: 343 unit tests, 44 equipment/expansion browser checks across four viewport sizes, TypeScript, production build, Wrangler dry-run, and 13 real-WebSocket smoke checks against an isolated local Worker.

Unit coverage includes all new item passives, event supplies, trading ownership and expiration, spirit eligibility, majority purchases, descending-price closure and old-room boss compatibility. The expansion browser lab at `/dev/expedition.html` exercises real reducers through the production UI. Browser checks cover trades, provisions, descending auctions and tutorial completion at four viewport sizes.

The broader Phase 1 target still requires human balance sessions. Automated policies do not yet shop for team relics, trade strategically, or choose spirit aid. Existing simulation results cannot establish balance for these decisions. The new item art uses reusable families; bespoke art, a deeper row-reach system, more regions, sealed auctions and a musical score remain follow-up work.
