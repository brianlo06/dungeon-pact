# Balance notebook

Updated 2026-09-10 · experimental values, not a release balance claim

## Current baseline

Treasury 420; Gilded pact +160 gold/-12 max HP, Unbroken +10 max HP. Rewards: combat 110, elite 180, boss 240. Information 35, revive 90, camp medicine 120. Free camp restores 18 standing HP or revives at 15. Item base values 100–220; asking price is 65% rounded down to tens. Bids rise by 30. Approval threshold 30%, strict majority, ties reject.

Enemy HP scales with party size (normal 0.85 + players×0.08; boss 0.65 + players×0.32). Normal enemy count equals player count capped at four. Elite HP ×1.3 with Greedy or Vampiric. Three/four players encounter a boss repair add. Boss half-health phase adds seven base damage; Miser additionally adds floor(gold/100). Initiative affects heroes within player resolution; enemies act afterward.

## Simulation evidence

First 150 seeded runs using a deliberately basic deterministic bot:

| Party                 | Wins / 50 | Mean final treasury | Mean commands |
| --------------------- | --------: | ------------------: | ------------: |
| 2: Vanguard, Arcanist |        29 |                 617 |            68 |
| 3: adds Ranger        |        17 |                 539 |            91 |
| 4: adds Warden        |        50 |                 666 |           141 |

These are AI-policy observations, not player win-rate estimates. Party size is confounded with composition. The bot ignores many upgrades/control choices and only allocates auction gear to Vanguard. It does show all tested seeds terminate and treasury remains nonnegative. Regression simulation checks reproducibility across 30 size/seed combinations twice.

Findings: the healer composition dominates this policy, three-player scaling needs attention, and saved gold is excessive for a game about scarcity. Do not solve solely with bigger enemy HP. Add valuable competing purchases, more viable non-Warden sustain, reaction-aware bot policies, and evaluate every class combination. Compare opening encounters, losses by depth, healing spend, auction spend and boss-entry treasury separately; final treasury includes boss reward and is not the same metric.

## Playtest priorities

1. Two humans experience a useful combo and an auction within ten minutes.
2. Check decisions with 2, 3 and 4 people, all class pairs, duplicated classes and no Warden.
3. Record planning time and stale-action retries; exact-revision rejection may frustrate simultaneous lock-ins.
4. Monitor all-down defeats, heal availability and time as a spirit.
5. Test whether purchases are tempting at 30% approval threshold and whether surrendering replaced gear is too punishing.
6. Compare both bosses and elite combinations over at least 20 human runs before tuning aggressively.

Run `npm run simulate -- 100` for 100 seeds at each current party size. Add richer policies before treating results as optimization targets. No telemetry leaves the local environment.

## Tactical v2 baseline — 90 fresh runs

With the same attack-focused bot (which does not yet select the new control skills): 2 players won 4/30 (mean final gold 531); 3 players 2/30 (491); 4 players 30/30 (706). These results are composition-confounded and not a target difficulty. They demonstrate that the new threat patterns punish this policy; the Warden sustain composition still dominates. Add a control-aware simulation policy, test all class pairs, and tune sustain/economy before claiming good balance. Do not respond by simply increasing all enemy health.
