# Dungeon Pact — living game design

Updated 2026-09-10 · implementation 0.1.0 · content v1

## North star

A 2–4 friend cooperative roguelike: shared fate, selfish temptation, uncertain information, meaningful teamwork. Every purchase uses one treasury; ownership is individual. Builds should change decisions, and encounters should reward coordination. The full intended Standard Pact is 40–60 minutes across multiple regions. The present Foundry Expedition is a development run, not that finished Standard experience.

## Implemented expedition

Guild Hall entry → guest room → hero choice / ready → starting pact vote → branching map → tactical encounters and auctions/events → a branch upgrade after each cleared chamber → camp → final procurement → one of two Foundry bosses → results. Seven map depths. Each chamber feeds only an adjacent span of the next layer,
so route choice closes options off rather than merely reordering them: taking
the Gilded Exchange can put the Whetstone out of reach for the rest of the run.
Every chamber stays reachable by some route, and none dead-ends. Eight hero definitions with twenty-four class paths across three mentors, eight normal enemies, two bosses, two elite traits, twelve equipment definitions, forty-eight ability branches, twelve statuses, two elemental/precision reactions, three events, and versioned tactical control skills. No automatic player combat and no bots in multiplayer.

Eight classes cover protection, elemental burst, precision, sustain, economy, buffs, blood-priced force and enemy subversion. Vanguard uses Resolve for interception and row damage in new runs. Arcanist uses Mana for water/fire/lightning. Ranger uses Focus and Mark/Precision. Warden uses Growth for healing, poison, and Wet support. Broker bills the shared treasury for damage and shields, and earns gold back by fighting. Herald empowers itself and an ally, shields whole rows and clears afflictions. Reaver pays HP for armour-piercing damage and drags back-row enemies to the front. Beguiler turns an enemy's next action against its own side and leaves what survives Vulnerable. Everyone can brace — 14 Barrier, 8 healing and 2 resource for the whole action — change row, and pay for a revival. Bracing is the sustain floor every class shares, and it exists because scarce healing otherwise makes the single healing class mandatory rather than merely strong. Resource recovery differs through basic abilities; resources persist between encounters with a modest refill.

Players select simultaneously; all standing heroes must lock. Hero speed plus ability speed sets player order, then surviving enemies act by speed. Enemy intentions are selected by the server before planning. New-run windups explicitly show that they can be interrupted; fortification turns create opportunities to prepare or strip shields. Dead targets cause an explicit fizzle; there is no silent retargeting of hero commands. Enemy attacks retarget the next standing hero if their target falls. Position influences enemy targeting and row attacks; single-target hero attacks can currently reach either row.

Wet + Lightning consumes Wet and chains 12 damage to other enemies. Mark + Precision consumes Mark for 20 bonus damage; setting up an Exploit costs a whole action, so the payoff has to beat attacking twice. Weak reduces a direct attack to 65% before Guard, which is what a party without a Vanguard uses in place of interception. Events and logs name both reactions. Repeated proc chains are bounded. No critical RNG or expanded damage/resistance table yet.

## Class paths and mentors

Three mentors sit on the route — the Whetstone, the Reliquary and the Cipher —
each at a different depth, each teaching exactly one path to each of the eight
classes. A route visits one node per depth, so a run can never reach all three,
and which paths were even on offer differs between runs.

A path is a role pivot, not a power-up. It swaps one signature ability, shifts
stats in both directions, and a hero may take only one for the whole run. The
Vanguard who becomes a Breaker gains four Power and loses two Guard, and trades
Foundry slam for a harder Sunder; the Aegis Knight instead gains twenty-five HP
and loses two Speed. Taking the first mentor means declining whatever the later
ones would have taught.

Tuition comes out of the shared treasury the moment a hero commits, and the
purse will not stretch to everyone. Who trains is argued over the same gold as
the auctions, and the party watches the treasury drain as each member decides.
This is where the design differs from its inspiration: elsewhere a subclass is
personal progression, here it is a contested purchase.

A path swaps abilities by id, so ability branches, cooldowns and locked plans
all survive the change. Existing saves never see a mentor.

## Branching ability upgrades

Every cleared non-boss chamber opens a branch choice. Each hero has three
upgrade lines and takes one pick per victory, choosing between a **force**
branch and a **guard** branch. Force ends fights sooner; guard sustains, shields
or weakens, and costs damage to take. Because the route offers between one and
three combats before the boss, choosing an event over a fight trades a branch
for healing or gold.

Branches patch an ability in place and never change its id, so a locked plan,
an active cooldown or an existing save is never invalidated. Content validation
rejects any line that fails to offer two branches or that offers no defensive
option, so no future class can be given a purely offensive tree. Fallen heroes
still choose; a completed tree is recorded immediately so one finished build
cannot stall the room.

The point is that protection is no longer a single class's job. A party with no
Vanguard can buy row-wide Weak or self-barriers; a party with no Warden can buy
attacks that heal their user. Both cost the damage the force branch would have
given, which is the decision the design wants.

## No encounter can deadlock

Combat used to have no termination pressure. A sustain party facing a
fortifying enemy could trade heals and shields indefinitely, winning and losing
nothing. From round 7 every enemy damage effect grows by 3 per further round, so
a fight the party cannot finish becomes a fight it loses. Existing saves keep
the old unbounded rules.

## Economic rules

Start with 420 gold. Unbroken grants 10 maximum HP; Gilded grants 160 gold and sacrifices 12 maximum HP per hero. Combat rewards 110, elites 180, bosses 240. Auction asking prices start at 65% of content reference value rounded down to tens. Each bidding round raises by 30 only after all remaining bidders hold. A withdrawal that leaves one bidder nominates that bidder immediately. If everyone withdraws, no sale. If everyone holds past affordability, withdraw the lot rather than arbitrarily allocating it.

Purchases at or above 30% of remaining treasury require strictly more than half of all party members to approve, including the purchaser. Approval ties reject. Information costs 35 and reveals the lot to everyone. Information purchases are currently direct small spends. Equipment immediately replaces the same slot and surrenders the old item; comparison text explicitly discloses this. Weapon, armor and relic slots are implemented, and every exchange closes with a consumables tray sold by the case of two, as the last of its three lots. Expanded inventory and trading remain planned.

**Supplies exist to make a party's floor purchasable rather than rostered.** Each sells, for one action and one payment, a single thing the Vanguard or the Warden would otherwise be the only source of: a shield, a heal, a cleanse, a Barrier strip, an interrupt. A party that fielded neither protector can decide to buy protection; a party that fielded both gains nothing it did not already have, which is exactly what the measurements show. Supplies stack, never displace worn equipment, and are never seized — an appraiser takes what is worn. They are deliberately not a substitute for a class: one action bought is not one action every round, and the notebook records how far that closes the gap and where it stops.

## Social and failure rules

No host owns the room. Any ready player can start once 2–4 players are ready. Route, event, camp and starting-pact votes use an early strict majority; otherwise await all votes, then rotate tie authority. Votes lock once cast, and two players voting at the same instant are both counted rather than one being rejected. Cheap auction decisions require each member's response; casual play has no timer.

At zero HP a hero is downed; the current round end counts toward a three-end-of-round grace period. Healing can revive before Fallen. After the grace period the hero becomes a spirit and keeps votes, bidding, pings and build inspection. Free camp rest returns all fallen/downed heroes at 15 HP; paid medicine costs 120 and restores 45; paid training costs 100 and grants every hero 3 Power for the rest of the run. Training used to be free, which made it the obvious pick whenever nobody was dying. Each battlefield revival costs 60 more than the last, so a party cannot both undo its mistakes and outfit itself. All heroes down at once means defeat. Active spirit combat abilities are not implemented yet.

Refresh restores the same hero using a device-held room bearer credential. Duplicate tabs replace the old connection. Disconnected players retain ownership; no automatic proxy controls their hero. This deliberately preserves agency but can stall a room if a player leaves permanently. AFK policies must be added before longer sessions.

## Bosses

Both bosses fight for something, not merely harder. A boss states its objective
in the log before the first round.

**The Collector** targets the most expensive equipped investment, alternates
single-target and row pressure, and adds damage below half HP. Its Repossess now
also seizes the dearest item carried by each hero in the row it hits and banks
it in a Strongbox: a container with health that sits in the enemy back row. The
owners lose those items' triggers for as long as it holds them. Breaking it open
returns everything and stops the Collector seizing again for the rest of the
fight. The Strongbox is not an enemy to clear — the chamber falls silent when the
Collector does, whether or not the box is still standing — so opening it is a
choice between the equipment the party fights the rest of the boss with and the
actions that opening it costs. Nothing seized ever outlives the chamber.

**The Miser** adds damage per treasury gold and alternates single-target and
economic row pressure. Its Weight of wealth now also shields it for one Barrier
per twelve gold the treasury holds above an allowance of 160. A party that spent
its money meets the Miser exactly as before; a party sitting on its winnings has
handed the boss its armour. The allowance is deliberate and load-bearing: an
unconditional shield lengthens the fight, and a longer fight meets the
escalation clock, which punished small parties for something they could not
answer. Spending is the counterplay, and a battlefield revival mid-fight both
buys back an action and thins the next shield.

Both still intensify below half HP; three-player parties also face a Kiln Mender,
and four-player parties additionally face an Iron Bulwark, so a larger party must
split its damage instead of burning the boss down before it acts. Battle auctions
and multi-phase scripted encounters remain future work.

## Presentation and accessibility

Pixel dungeon presentation: ink-purple stone, rust-orange light, bone text, compact pixel headings, cohesive character sprites, explicit enemy intentions and readable status tokens. See ART_DIRECTION.md. Original synthesized UI/combat cues; every significant cue also appears in text. Master/SFX/UI settings, mute, reduced motion, responsive layouts and keyboard-operable controls exist. Music/ambience, multi-frame character animation, unique per-item art, advanced VFX, keyboard target shortcuts, focus traps and mobile combat refinement remain production work.

## Long-term scope

8–12 classes, 250+ meaningful items, 50+ consumables, 60+ enemies, 20 elite traits, 15 bosses, six biomes, 60 events, 30 modifiers, ten auction modes, 100 achievements and Pact 1–20. These are targets, not implemented counts. Horizontal unlocks preserve new-player parity. Future modes: Quick Delve, Standard, Long Expedition, Endless, Boss Rush, Chaos, Custom. No matchmaking or monetization requirement in this milestone.

## Confirmed combat direction and v2 pass

The user chose an equipped-ability turn-based roguelite inspired by D&D party tactics and Slay the Spire decision pressure. No card draws. See COMBAT_DIRECTION.md for the exact implemented control skills, costs, cooldowns and limitations. New runs add purpose-built enemy formations and telegraphed windups. Old saves continue their legacy rules.
