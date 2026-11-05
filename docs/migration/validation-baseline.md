# Migration and promoted-path validation baseline

**Latest full parity run:** [GitHub Actions run 41958659688](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41958659688)  
**Validated code commit:** `5a9881f751b245abdfeb32ce055c62882cbf6c36`  
**Result:** **14/14 jobs passed**.  
**Source snapshot scope:** nine immutable snapshots, 1,408 tracked paths.  
**Promoted scope:** `apps/web`, `apps/api`, Find Displacements, Known Place, RiverShift, and NISAR science.

## Test results

The workflow runs source-snapshot tests and promoted-path tests separately. This checks both source preservation and path-promotion parity.

| Validation group | Result | Evidence |
|---|---|---:|
| Dynamic frontend snapshot | PASS | 155 tests; 20 test files; build and lint pass |
| Dynamic active API snapshot | PASS | 215 tests; Google Maps adapter contract pass |
| Backend workers + Find Displacements snapshot | PASS | 336 passed, 1 skipped |
| Known Place PR #85 snapshot | PASS | 318 tests |
| RiverShift GCOV snapshot | PASS | 259 tests |
| NISAR science snapshot | PASS | 180 tests |
| Promoted `apps/web` | PASS | 155 tests; 20 test files; build and lint pass |
| Promoted `apps/api` | PASS | 215 tests |
| Promoted Find Displacements | PASS | 104 dashboard/worker-tools tests |
| Promoted Known Place | PASS | 318 tests |
| Promoted RiverShift | PASS | 259 tests |
| Promoted NISAR science | PASS | 180 tests |

**Snapshot-path executions:** 1,463 passed, 1 skipped.  
**Promoted-path executions:** 1,231 passed.  
**Combined:** **2,694 passing test executions, 1 skipped**.

These are test executions, not unique test-case count: source and promoted paths intentionally run the same frontend/API/engine/science suites separately. The backend core suite also overlaps with focused Find Displacements coverage; the combined figure is not a count of distinct logical behaviours.

The other two jobs validate exact source/promoted Git object integrity and scan embedded commit-like source references. All 14 jobs completed successfully.

## Exact source and promotion integrity

The integrity job checked all nine imported source trees using a full-history checkout and compared every tracked path, Git file mode, object type, and blob SHA:
- Dynamic main: 185 paths.
- Backend main: 244 paths.
- Known Place PR #85 head: 277 paths.
- NISAR science main: 110 paths.
- Historical NISAR pins 10639 and 006d: 268 paths combined.
- Historical Dynamic callback API pin db6472: 130 paths.
- Historical backend reassembly pin d9e67: 86 paths.
- Legacy Sagormodak NISAR fork pin 77cc964: 108 paths.

**Result: 1,408/1,408 source snapshot entries exact.**

The validator also verified all **701 promoted tracked entries**:
- Dynamic app/API compatibility paths: 173 entries.
- Known Place: 277 entries.
- NISAR science: 110 entries.
- Find Displacements: 65 entries.
- RiverShift: 76 entries.

These copies use the original Git blobs/modes; no decoding/re-encoding or source file rewriting occurred during promotion. The validator verifies:
- Known Place feature base `bd7a59c54ddae7c19fd88896e877c3a530b43d9e` is an ancestor of PR #85 head `bfde7dde8ada92a03054cd8dbad8daa7a5c119f8`;
- NISAR pin `ab547ecc82bcc4d6ccef545a59852536c2beacc6` is an ancestor of NISAR science main `9fcb543ef28a7f6fe70a379aed9cfe3e43e277ec`;
- the exact source and destination objects for engine-local workflow/dependency fixtures.

No original source repository was modified.

## Workflow and engine-path corrections

The first promoted engine regression attempt identified missing repository-root-relative workflow fixtures. Find Displacements tests expected four additional backend-root workflow files; RiverShift expected its independent-reference validation workflow. Those exact backend-main blobs were added below each engine's nested `.github/workflows/` directory and included in the integrity validator.

They are **inactive compatibility fixtures**. GitHub Actions only activates workflows below the repository-root `.github/workflows/`; these nested engine copies do not run. No production workflow was activated and no science algorithm was changed.

The Known Place PR #85 test environment initially lacked SciPy; its isolated test dependency was corrected, after which all 318 tests passed. An earlier NISAR cleanup issue caused by disabling pip cache was also corrected. These were CI environment corrections only.

## Embedded source-reference discovery

The pin scanner reviewed 867 text files and found 48 distinct 40-character commit-like strings in pin-related context. These are candidates, not 48 confirmed science pins: they include source checkout refs, historical code commits, and validation-evidence references. Confirmed checkout pins and their ancestry/divergence status are separately classified in `docs/migration/source-pins.json` and `docs/migration/source-import-report.md`.

The pin scan is not a secret scan. Automated secret scanning remains a separate pre-cutover gate.

## What this validation establishes

- All nine immutable source snapshots are exact and their source histories remain reachable.
- Promoted application and engine paths are exact copies of their mapped source trees/subtrees.
- The source and promoted frontend/API/engine suites run successfully at both locations.
- The current path layout does not overwrite the 19 divergent Dynamic/backend same-path files.
- Engine-specific test fixtures are present without activating nested source workflows.

## What this validation does not establish

- Production Vercel root/domain and environment configuration is ready to switch.
- Firebase, Supabase, Google Drive, ASF credentials, callback secrets, or GitHub token permissions are configured safely in the target deployment.
- All original workflows are ready to move into root `.github/workflows/`; the workflow caller, permission, artifact, retention, callback, and duplicate-dispatch audit is still in progress.
- Real-data output parity or independent geophysical validation has passed.
- A production cutover or rollback rehearsal has been performed.

A passing CI migration baseline is necessary, not sufficient, for production cutover.
