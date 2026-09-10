# Dungeon Pact — living game design

Updated 2026-09-10 · implementation 0.1.0 · content v1

## North star

A 2–4 friend cooperative roguelike: shared fate, selfish temptation, uncertain information, meaningful teamwork. Every purchase uses one treasury; ownership is individual. Builds should change decisions, and encounters should reward coordination. The full intended Standard Pact is 40–60 minutes across multiple regions. The present Foundry Expedition is a development run, not that finished Standard experience.

## Implemented expedition

Guild Hall entry → guest room → hero choice / ready → starting pact vote → branching map → tactical encounters and auctions/events → camp → final procurement → one of two Foundry bosses → results. Seven map depths; route choice changes content and economic risk. Four hero definitions, eight normal enemies, two bosses, two elite traits, twelve equipment definitions, ten statuses, two elemental/precision reactions, three events, and versioned tactical control skills. No automatic player combat and no bots in multiplayer.

Vanguard uses Resolve for interception and row damage in new runs. Arcanist uses Mana for water/fire/lightning. Ranger uses Focus and Mark/Precision. Warden uses Growth for healing, poison, and Wet support. Everyone can brace, change row, and pay for a revival. Resource recovery differs through basic abilities; resources persist between encounters with a modest refill.

Players select simultaneously; all standing heroes must lock. Hero speed plus ability speed sets player order, then surviving enemies act by speed. Enemy intentions are selected by the server before planning. New-run windups explicitly show that they can be interrupted; fortification turns create opportunities to prepare or strip shields. Dead targets cause an explicit fizzle; there is no silent retargeting of hero commands. Enemy attacks retarget the next standing hero if their target falls. Position influences enemy targeting and row attacks; single-target hero attacks can currently reach either row.

Wet + Lightning consumes Wet and chains 12 damage to other enemies. Mark + Precision consumes Mark for 14 bonus damage. Events and logs name both reactions. Repeated proc chains are bounded. No critical RNG or expanded damage/resistance table yet.

## Economic rules

Start with 420 gold. Unbroken grants 10 maximum HP; Gilded grants 160 gold and sacrifices 12 maximum HP per hero. Combat rewards 110, elites 180, bosses 240. Auction asking prices start at 65% of content reference value rounded down to tens. Each bidding round raises by 30 only after all remaining bidders hold. A withdrawal that leaves one bidder nominates that bidder immediately. If everyone withdraws, no sale. If everyone holds past affordability, withdraw the lot rather than arbitrarily allocating it.

Purchases at or above 30% of remaining treasury require strictly more than half of all party members to approve, including the purchaser. Approval ties reject. Information costs 35 and reveals the lot to everyone. Information purchases are currently direct small spends. Equipment immediately replaces the same slot and surrenders the old item; comparison text explicitly discloses this. Weapon, armor and relic slots are implemented. Expanded inventory/trading/consumables remain planned.

## Social and failure rules

No host owns the room. Any ready player can start once 2–4 players are ready. Route, event, camp and starting-pact votes use an early strict majority; otherwise await all votes, then rotate tie authority. Votes lock once cast. Cheap auction decisions require each member's response; casual play has no timer.

At zero HP a hero is downed; the current round end counts toward a three-end-of-round grace period. Healing can revive before Fallen. After the grace period the hero becomes a spirit and keeps votes, bidding, pings and build inspection. Free camp rest returns all fallen/downed heroes at 15 HP; paid medicine restores 45. All heroes down at once means defeat. Active spirit combat abilities are not implemented yet.

Refresh restores the same hero using a device-held room bearer credential. Duplicate tabs replace the old connection. Disconnected players retain ownership; no automatic proxy controls their hero. This deliberately preserves agency but can stall a room if a player leaves permanently. AFK policies must be added before longer sessions.

## Bosses

The Collector targets the most expensive equipped investment, alternates single-target and row pressure, and adds damage below half HP. The Miser adds damage per 100 treasury gold and alternates single-target and economic row pressure. Both intensify below half HP; 3–4 player parties also face a repair support. Item suppression, battle auctions and true scripted multi-phase encounter objectives remain future work.

## Presentation and accessibility

Pixel dungeon presentation: ink-purple stone, rust-orange light, bone text, compact pixel headings, cohesive character sprites, explicit enemy intentions and readable status tokens. See ART_DIRECTION.md. Original synthesized UI/combat cues; every significant cue also appears in text. Master/SFX/UI settings, mute, reduced motion, responsive layouts and keyboard-operable controls exist. Music/ambience, multi-frame character animation, unique per-item art, advanced VFX, keyboard target shortcuts, focus traps and mobile combat refinement remain production work.

## Long-term scope

8–12 classes, 250+ meaningful items, 50+ consumables, 60+ enemies, 20 elite traits, 15 bosses, six biomes, 60 events, 30 modifiers, ten auction modes, 100 achievements and Pact 1–20. These are targets, not implemented counts. Horizontal unlocks preserve new-player parity. Future modes: Quick Delve, Standard, Long Expedition, Endless, Boss Rush, Chaos, Custom. No matchmaking or monetization requirement in this milestone.

## Confirmed combat direction and v2 pass

The user chose an equipped-ability turn-based roguelite inspired by D&D party tactics and Slay the Spire decision pressure. No card draws. See COMBAT_DIRECTION.md for the exact implemented control skills, costs, cooldowns and limitations. New runs add purpose-built enemy formations and telegraphed windups. Old saves continue their legacy rules.
