# Claude choreography work: inspection after equipment implementation

Inspected September 11, 2026. No changes were made to Claude's worktree and none of its work was merged.

**Worktree:** `.claude/worktrees/agent-a709a58795fffe3d3`

**Branch:** `worktree-agent-a709a58795fffe3d3`

**HEAD:** `4e93cb68437f8150b9be93e53b709098dbbc8518` — same starting commit as the equipment checkout. The choreography changes are uncommitted. Two other registered Claude worktrees contain older unrelated art work.

## What survived the stalled agent

The core work is substantial, not lost:

- `clock.ts`: PresentationClock and shared frame loop, pause, speed, capture tempo and hit-stop.
- `choreography.ts`, `round-plan.ts`: planning moves/phases from resolved beats, overlap, recovery, pacing.
- `attack-point.ts`, `stage-geometry.ts`, `trajectory.ts`: attack positions and travel/projectile paths.
- `stagehand.ts`: writes movement, animation and effects against the presentation clock.
- `choreo-meta.ts` and `src/content/choreography/`: content-facing unit/ability annotations.
- Revised director, camera, animator, stage layout, battle components, audio and CSS.
- `src/dev/choreo-lab.tsx` plus lab integration and a debug overlay.

There are 16 modified tracked files, plus untracked core/annotation/lab files. No implementation commit was found. The latest inspected director edit was at 17:32 local filesystem time.

## Completion gaps verified

1. `npm run check` **fails** in the worktree. `tests/pacing.test.ts` still imports removed `paceRound` and `spans` exports, followed by related implicit-any diagnostics (10 TypeScript diagnostics total). This is an integration/testing gap; the command reported no diagnostics in the new source files themselves.
2. `docs/CHOREOGRAPHY.md` does not exist, despite being referenced by the new code.
3. No new choreography/clock/trajectory test files or `.screenshots` directory were found in that worktree.
4. Vanguard, Ranger and Hound have authored annotations. Mender and Bulwark have hit/target anchors only. The other roster modules, including Arcanist, explicitly say “Not annotated yet” and export generic defaults. Phase 2 has not been completed.
5. `REPLAY_CAP` is already set to **9000 ms**. Its comment calls this measured and refers to the absent design document. No supporting measurement report or completed user decision was found. The equipment checkout retains the existing six-second policy.

## Integration with visible equipment

The saved code is recoverable and can be resumed in its existing worktree. It should not simply overwrite the equipment changes: both modify the director, pacing, Combat, BattleStage, BattleUnit, BattleVfx and the lab.

The compatible part is the physical hierarchy: gear already lives inside named SVG bones, so the new travel/animation wrappers will carry it naturally. Vanguard's special blade uses the same wrist as the original; Ranger's replacement bow and arrow use the existing bow/arrow groups.

When resuming, preserve `Beat.equipment` source cues and ownership replay, schedule their reactions/transfers on the shared clock, and resolve projectile/weapon origins from current attached equipment. Do not reinstate a default weapon layer while a replacement is equipped. The new round planner must accept the non-blocking `equipment` beat kind without interpreting it as an attack. Re-run the equipment attachment, seizure/return, reconnect and preview regressions along with the new contact/release timing tests.

Before merging: restore/update the pacing tests, add clock/timeline/browser tests, complete the promised design and measured-cap report, inspect the three fighter captures, then finish the roster annotations. This inspection does not restart or control the failed Claude agent.
