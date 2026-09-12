# Combat choreography integration status

Updated September 11, 2026 after recovering the stalled Claude worktree.

Claude's substantial uncommitted implementation was recovered from `.claude/worktrees/agent-a709a58795fffe3d3`, completed, tested, and integrated with the visual equipment system.

The integrated system includes:

- one presentation clock for rig animation, travel, projectiles, impacts, VFX, audio cues, camera motion, pause, speed, frame stepping, and hit stop
- beat-derived round plans with anticipation, approach, contact or release, recovery, and return
- measured attack points, obstacle-aware stage paths, projectile trajectories, and stable formation nodes
- authored choreography metadata for all eight heroes, every regular enemy, the Strongbox, the Collector, and the Miser
- Battle Lab scenes and debug geometry for Vanguard, Ranger, and Slag Hound
- equipment trigger pulses and Collector gear transfers scheduled by authoritative `Beat.equipment` cues on the shared presentation clock
- equipment reconstruction at replay start, so seized gear disappears at the authoritative beat and recovered gear returns without changing gameplay state

The replay ceiling is now 9 seconds. Physical traversal cannot reliably fit the former 6-second ceiling while preserving readable anticipation, contact, recovery, and return. Busy plans still compress toward their authored timing floors.

Validation includes TypeScript, the production build, the existing pacing contract, and structural tests for clock control, deterministic frame task order, contact geometry, obstacle avoidance, projectile arrival, and round dependency scheduling. See `docs/CHOREOGRAPHY.md` for the full architecture.
