# Combat direction — tactical party roguelite

User direction, 2026-09-10: difficult turn-based roguelite RPG inspired by Dungeons & Dragons and Slay the Spire. This supplements the original cooperative auction premise; it does not replace it.

## Current implementation

Simultaneous planning; one selected action per standing hero; player initiative resolves before enemy actions. Front/back formations, visible enemy intentions, class resources, cooldowns, equipment triggers, statuses and two primer/reaction pairs. New rooms additionally support interception, Weak, barrier stripping and interruptible enemy windups. There is no deck draw, dice accuracy or action-point budget. Boss phase changes are modest. Existing simulation results are not a credible claim of finished difficulty.

## Direction to preserve

D&D influence: mechanically distinct party members, limited-use abilities, protection and control, encounter roles, risky exploration choices and build identity. Slay the Spire influence: telegraphed threats, deliberate attack/defense tradeoffs, scarce recovery, build-changing relics, synergistic enemy formations, branching routes and escalating mechanical difficulty. Team gold and auctions remain the unique progression pressure.

**Decision confirmed by the user: keep equipped abilities; deepen tactical turns.** No draw pile, randomized hand or deck-building. Retain reliable class actions and improve their opportunity costs and synergies. Do not add random misses by default: a missed lifesaving action should not casually invalidate good team planning.

## First implemented tactical pass

- Vanguard Intercept: 2 Resolve, 1-round cooldown. Move to front, gain 12 Barrier, and take another ally's next direct enemy hit this round. Redirects the hit's status rider too. One hit, so multi-attacks can still threaten the ally. A downed protector cannot intercept.
- Arcanist Break Focus: 3 Mana, 2-round cooldown. Cancels an enemy intent marked WINDUP. Ordinary attacks cannot be interrupted. Choosing a non-windup is rejected before resources are spent.
- Ranger Pinning Shot: 2 Focus, 1-round cooldown. An 8-base precision hit plus Weak for the enemy action phase; direct attack power falls 25% before armor.
- Warden Unravel: 2 Growth, 1-round cooldown. Remove an enemy's Barrier before dealing 10 base damage.
- Five authored encounter families have explicit 2/3/4-player compositions. Advanced repair/toll groups enter only at depth 2 onward.
- Enemy patterns alternate direct pressure, fortification and windups. The sniper aims before Kill Shot, Bellows draws breath before a row blast, and acolytes channel an interruptible eruption. Defense and control consume the hero's action.

Existing saves keep legacy ability/intent behavior when combatVersion is absent. New rooms use combatVersion 2 and encounterVersion 2.

## Next implementation priorities

1. Authored enemy formations with purpose (protector + caster, repair + construct, frontline pressure + backline sniper), then seeded variations. Avoid difficulty based only on duplicated random enemies.
2. Richer intentions: visibly distinguish heavy windups, multi-hits, row attacks, support and economic attacks; show exact relevant numbers and counterplay.
3. Defensive opportunity costs: a powerful attack may leave the party exposed. Protection, movement and control must prevent more harm than blindly attacking.
4. Finite recovery across the expedition, with multiple party compositions viable. Healing must compete with buying power in the shared treasury.
5. Boss phases that alter decisions, and unlockable difficulty modifiers that change mechanics.
6. A clear round recap before the next planning step. Dead-target fizzles and protection results must be understandable.

## Acceptance examples

A player can explain why they defended instead of attacking. A team can identify and interrupt or withstand a dangerous enemy sequence. A low-gold party may accept a risky route to fund recovery. Two plausible item/build choices produce different play, not simply different damage totals. Defeat can be traced to decisions, with enough uncertainty to demand adaptation.
