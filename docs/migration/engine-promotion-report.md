# Engine and science source promotion report

**Branch:** `migration/source-snapshot-import`  
**Promotion commits:** `2e99b950665d2fa091f476b368ffd3b69aa93a63` plus workflow-fixture completion `46dbd27a74fc0a4d861ad8dbfeba0d24ad79ff50`  
**Status:** exact-copy promotion complete; promoted-path regression validation passed in run [41958659688](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41958659688), 14/14 jobs green.

## Promoted source boundaries

| Destination | Source ref/path | Entries | Purpose |
|---|---|---:|---|
| `engines/known-place/` | Backend PR #85 head, full repository snapshot | 277 | Keep the two-polygon implementation and author-exact P05023 replay from its correct feature-branch lineage |
| `science/nisar-core/` | NISAR science main, full repository snapshot | 110 | Current pinned NISAR science source and regression suite |
| `engines/find-displacements/dashboard/` | Backend main `dashboard/` | 22 | AOI candidate screening, gated GUNW pixel diagnostics, common reference and dashboard assets/tests |
| `engines/find-displacements/tools/` | Backend main `tools/`, excluding `tools/river_shift/` | 34 | Find Displacements and shared AOI worker/retention tools plus their tool tests |
| `engines/find-displacements/.github/workflows/` | Seven selected backend workflow files | 7 | Inactive local workflow fixtures required by original root-relative workflow-contract tests; not active Actions workflows |
| `engines/find-displacements/` root | Backend `requirements-dev.txt` and `requirements.txt` | 2 | Preserve worker environment declarations |
| `engines/river-shift/tools/river_shift/` | Backend main `tools/river_shift/` | 74 | Isolated GCOV runtime, CLI stages, and test suite |
| `engines/river-shift/.github/workflows/` | Backend GCOV and independent-reference validation workflows | 2 | Inactive workflow-contract fixtures for retry graph and reference-validation tests |

**Engine/science promoted entries:** 528 (277 + 110 + 65 + 76). Including 173 Dynamic app/API compatibility entries, the total promoted footprint is **701 tracked entries**. The source snapshot locations remain intact.

## Why the layouts preserve source-relative paths

- Known Place retains the original repository-root-relative `tools/know_place`, `tools/tests`, docs, and workflow fixtures. This keeps its current test and author-evidence paths stable.
- RiverShift retains the `tools/river_shift/` prefix under its engine root. Its test suite computes the package root from that original depth and reads the two nested workflow fixtures from the engine root. This avoids changing test logic or GCOV imports during the initial move.
- Find Displacements retains `dashboard/`, `tools/`, and the tested workflow fixture paths within its own engine root. Four additional exact-source workflow fixtures were added after the first engine test run exposed original tests reading root-relative workflow files. Two of these fixtures are Known Place dispatchers because the original backend workspace hosted those dispatch contracts at repository root; their nested copies do not make Known Place part of the Find Displacements engine. RiverShift tools are excluded from this engine package.
- NISAR science is copied as a whole source tree; historical source versions remain separate snapshots and are not overlaid into `science/nisar-core`.

The selected engine-local `.github/workflows/` paths are nested beneath `engines/`; GitHub Actions only executes workflows from the repository-root `.github/workflows/`. They are fixtures and are intentionally inactive.

## Exact-object integrity

The copy operation uses original Git blob IDs and file modes, not a text rewrite. The integrity validator now checks:
- all nine immutable source snapshots;
- Dynamic frontend, active API, shared tools and inactive workflow-compatibility mirror;
- complete Known Place and NISAR package promotions;
- Find Displacements dashboard and non-RiverShift tools;
- RiverShift package;
- each separately promoted workflow/dependency fixture.

Any missing, extra, or changed blob in a promoted directory causes the integrity job to fail.

## Regression jobs

The snapshot regression workflow now runs promoted-path suites separately; the latest complete run confirms all six promoted suites passed:
- `apps/web`: npm install, build, lint, 20 frontend test files;
- `apps/api`: active API test suite;
- `engines/find-displacements`: compile dashboard/tools and run dashboard/tool tests;
- `engines/known-place`: compile and run PR #85 analysis/two-polygon tests;
- `engines/river-shift`: pinned geospatial environment, compile, and retry/callback/GCOV tests;
- `science/nisar-core`: complete NISAR science test suite.

Passing these jobs establishes relocation parity, not production deployment readiness or independent scientific validation.

## Additional Known Place author-exact code pin

The backend-main author-exact P05023 dispatcher passes `backend_code_ref=b825df798ea4cb9874aa10dd01174d2a8ef73cba`. That commit is a sibling branch tip relative to PR #85 (common base `d847b0461a2fec1bdf2abcce0a6b1d2f9dddabc9`) and its full 277-entry tree is preserved at `migration/source-snapshots/backend-pins/b825df/`. It is intentionally not overlaid on `engines/known-place/`, whose canonical generic two-polygon implementation is PR #85 head `bfde7dde8ada92a03054cd8dbad8daa7a5c119f8`. The author-exact workflow must continue to use its explicit historical code pin until a separately reviewed reproduction parity test authorizes changing it.

## Remaining integration work

- Trace backend root `app/` callers and decide whether it belongs under `legacy/backend-api/` or can be retired later.
- Review shared utility collisions (24 same-path files across Dynamic/backend, 19 with divergent contents) before any deduplication.
- Reconcile workflow source pins, caller graph, token permissions, callback contracts, and duplicate dispatch protection before moving selected workflows to root.
- Complete secret scanning and environment-name mapping before promoting operational workflows.
- Verify Vercel project root/build settings and Supabase live linkage without changing production settings.


## Live source-to-snapshot-to-promoted blob parity recheck — 2026-11-05

Five critical runtime files were fetched directly from their source repository main branch, the matching immutable Monorepo source snapshot, and the promoted engine/application path. All three Git blob SHA values matched for every file:

| Runtime component | Source blob SHA | Snapshot blob SHA | Promoted blob SHA | Result |
|---|---|---|---|---|
| Dynamic RiverShift UI: `Frontend/src/pages/RiverShiftPage.tsx` → `apps/web/src/pages/RiverShiftPage.tsx` | `7ea0a96a6798ada7d348c227bece1b6557f13303` | same | same | Exact |
| Dynamic active API: `Backend/app/main.py` → `apps/api/app/main.py` | `27316589dbfd4213f16c0de9ebd22beb8434ccae` | same | same | Exact |
| Backend RiverShift GCOV worker: `tools/river_shift/process_gcov_job.py` → `engines/river-shift/tools/river_shift/process_gcov_job.py` | `7e57dc2cb053128aa70833c98af036031b923ff0` | same | same | Exact |
| NISAR science main: `src/pixel_stack.py` → `science/nisar-core/src/pixel_stack.py` | `e4d35ab3ede7f7741af15dd4d6c6ad4d624a81e9` | same | same | Exact |
| Backend Find Displacements screen: `tools/aoi_wide_displacement_screen.py` → `engines/find-displacements/tools/aoi_wide_displacement_screen.py` | `cea9a8bd7f95a3107f3aec0bbc66f9bdce253141` | same | same | Exact |

This verifies the source, immutable snapshot and promoted destination contain byte-identical Git blobs for these five high-risk runtime files. It is a targeted live spot-check, not a substitute for the complete all-path object/mode CI gate. No workflow, runtime code or production setting was modified by this check.


## Complete RiverShift directory tree integrity — 2026-11-05

A recursive Git tree comparison checked every blob and file mode under Backend main tools/river_shift/ against Monorepo engines/river-shift/tools/river_shift/:
- source Backend tree: 867279c8de20e43dd3d36746480052dd9625d900;
- promoted Monorepo tree: ad8a698804be94147924c40b51f58ff131954fda;
- 74 source blobs, 74 promoted blobs;
- 74/74 exact SHA and file-mode matches;
- zero missing, extra, changed or mode-mismatched files;
- neither recursive tree result was truncated.

This verifies complete RiverShift package promotion integrity, including worker, batch scheduler, CLI modules, tests and environment file. It does not replace execution of the tests or the separate workflow/callback/runtime acceptance gates.


## Complete Dynamic application promotion tree audit — 2026-11-05

A recursive Git tree comparison checked the selected Dynamic source commit and the promoted Monorepo tree:
- Source: `moshiour0/SARGuardian_Dynamic@dd64b7adc90594f1d7f316b352e39fbac2013cb6`
- Monorepo: `migration/source-snapshot-import` at commit `3437fdcbcd106505fdaff79e1d16eaabcdb81e51`
- Source tree: `c5d1d861b07a68295941201b633f4a219204fe6d`
- Monorepo tree: `5059e2a5987f61149d8bed429e9dd8bc88cc7dc2`
- Both recursive tree responses were complete and not truncated.

### Dynamic Frontend

`Frontend/` → `apps/web/`:
- 90 source blobs / 90 promoted blobs;
- 90/90 exact Git SHA and file-mode matches;
- zero missing, extra, content-changed or mode-changed files.

The promoted Web source tree is byte/object-and-mode identical to the selected Dynamic frontend tree.

### Dynamic Backend API

`Backend/` → `apps/api/`:
- 55 source blobs / 55 promoted blobs;
- 48/55 exact Git SHA and file-mode matches;
- zero missing files, zero extra files;
- seven intentional differences:

| Path | Difference class | Purpose |
|---|---|---|
| `.env.example` | Example configuration | Adds separate generic Known Place and author-exact P05023 target variables while retaining RiverShift defaults. |
| `README.md` | Migration/deployment documentation | Rewrites local paths for apps/api, describes independent Known Place routing and artifact retrieval, documents current Monorepo Vercel/Supabase state and removes obsolete Render-specific guidance. |
| `app/config.py` | Runtime integration | Adds independently configurable generic and author-exact Known Place workflow destinations and target validation; retains original Dynamic API, Find Displacements and RiverShift runtime settings. A separate RiverShift-only safe repository/workflow/ref validation was added later on the migration branch. |
| `app/known_place.py` | Runtime integration | Routes generic two-polygon analysis and author-exact paper reproduction to their independently configured repository/workflow/ref, retaining Backend defaults. |
| `tests/test_config.py` | Regression tests | Tests the new Known Place routing defaults/validation and RiverShift safe target configuration. |
| `tests/test_known_place.py` | Regression tests | Verifies generic and author-exact Known Place destinations remain independent. |
| `tests/test_river_shift_jobs.py` | Regression tests | Adds durable status-poll fallback tests for a completed run without signed callback, completed GitHub failure, dispatch timeout, and preserving signed terminal success. |

No other tracked Backend API path is missing or extra. The 7 differences are integration/documentation/test deltas, not accidental file loss. The RiverShift worker itself remains byte-identical in its separately checked 74/74 package tree. This audit does not replace execution of the code tests or end-to-end acceptance.
