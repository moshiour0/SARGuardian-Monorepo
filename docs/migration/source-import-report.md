# Source snapshot import report

**Completed:** 2026-11-05  
**Destination branch:** `migration/source-snapshot-import`  
**Import commits:** `c7afa9c566ad954515c014162fbb2d59f1e04095` and `c100570aca60fc45decf032620fb0709f9cc185c`

## Result

Six immutable source trees were imported under `migration/source-snapshots/`. Their exact source commit IDs are retained in the Git parent graph and in `docs/migration/source-pins.json`.

| Snapshot | Immutable source ref | Tracked paths |
|---|---|---:|
| Dynamic application/API | `SARGuardian_Dynamic@dd64b7adc90594f1d7f316b352e39fbac2013cb6` | 185 |
| Backend main | `SARGuardian-backend@97d849454918b1425ac41bb70e7a32d11cfd3833` | 244 |
| Backend Known Place PR #85 head | `SARGuardian-backend@bfde7dde8ada92a03054cd8dbad8daa7a5c119f8` | 277 |
| NISAR science main | `SARGuardian@9fcb543ef28a7f6fe70a379aed9cfe3e43e277ec` | 110 |
| Historical NISAR pin | `SARGuardian@10639a916c9829850775410b3ed7de62e527770d` | 133 |
| Historical NISAR pin | `SARGuardian@006d4cd1485cf80e509eaf8717c12e9c6390ac09` | 135 |
| **Total** | | **1,084** |

The total counts tracked paths across snapshots; files shared by multiple source refs intentionally appear in more than one snapshot when their provenance differs.

## Why multiple science snapshots were required

The NISAR worker references `10639…` and `006d…` are not ancestors of the current NISAR `main` commit. Importing only the current `main` tree would therefore not preserve those exact worker-pinned revisions. They were imported independently.

The `ab547…` pin is an ancestor of current NISAR `main`, so it remains reachable in the imported science-main history and did not require a duplicate snapshot.

## Known Place branch lineage

Backend PR #85 is based on `feat/know-place-analysis`, not backend `main`. The PR head snapshot contains the full feature implementation plus the two-polygon changes. The feature branch base commit `bd7a59c54ddae7c19fd88896e877c3a530b43d9e` is preserved in the PR head's commit ancestry.

This avoids the incomplete result that would come from copying backend `main` alone.

## Integrity evidence

- The source import runner fetched each exact 40-character commit SHA from its public source repository.
- Git trees were inserted without file-content rewriting; Git object identity is retained.
- Import commit `c7afa9c…` has the Dynamic, backend-main, Known Place PR #85, and NISAR-main commits as parents.
- Import commit `c100570…` has the historical NISAR pins `10639…` and `006d…` as additional parents.
- A recursive target tree query was not truncated and returned the expected six path counts above.
- Representative paths were found: Dynamic `Frontend/src/App.tsx`, backend RiverShift `tools/river_shift/process_gcov_job.py`, Known Place `tools/know_place/aoi_runner.py`, and NISAR `src/timeseries.py`.
- The source repositories were not modified.

## Workflow isolation

All source files are nested below `migration/source-snapshots/`. Their embedded `.github/workflows/` folders are archival snapshots and are **not active root workflows**. No production workflow was copied into the active root `.github/workflows/` directory, and no duplicate processing can be triggered by these snapshots.

## Runtime regression result

The isolated snapshot regression workflow [41956286197](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41956286197) completed with all seven jobs passing: 1,463 tests passed, 1 was skipped, and exact Git blob/mode/history verification passed for all 1,084 imported entries. Details are in [validation-baseline.md](validation-baseline.md).

The Dynamic/backend same-path collision audit found 24 overlaps, including 19 different-content paths; see [path-collision-report.md](path-collision-report.md).

## What this does not mean

This is a provenance-preserving import, not yet the final consolidated application layout. The next phase must:
- trace imports and build roots before promoting Dynamic frontend/API paths;
- separate Find Displacements, Known Place, and RiverShift into their target engine boundaries;
- classify every original workflow by purpose and trigger before promoting selected workflows to root;
- resolve duplicate/shared utility files from their actual call graphs;
- run source-level test parity and a secrets scan;
- keep production Vercel, Supabase, callback, and dispatch configuration unchanged until preview validation.
