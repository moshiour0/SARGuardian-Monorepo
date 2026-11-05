# Engine and science source promotion report

**Branch:** `migration/source-snapshot-import`  
**Promotion commit:** `2e99b950665d2fa091f476b368ffd3b69aa93a63`  
**Status:** exact-copy promotion complete; isolated path regression jobs added and under validation.

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

**Total promoted tracked entries:** 528 (277 + 110 + 65 + 76). The source snapshot locations remain intact.

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

The snapshot regression workflow now runs promoted-path suites separately:
- `apps/web`: npm install, build, lint, 20 frontend test files;
- `apps/api`: active API test suite;
- `engines/find-displacements`: compile dashboard/tools and run dashboard/tool tests;
- `engines/known-place`: compile and run PR #85 analysis/two-polygon tests;
- `engines/river-shift`: pinned geospatial environment, compile, and retry/callback/GCOV tests;
- `science/nisar-core`: complete NISAR science test suite.

Passing these jobs establishes relocation parity, not production deployment readiness or independent scientific validation.

## Remaining integration work

- Trace backend root `app/` callers and decide whether it belongs under `legacy/backend-api/` or can be retired later.
- Review shared utility collisions (24 same-path files across Dynamic/backend, 19 with divergent contents) before any deduplication.
- Reconcile workflow source pins, caller graph, token permissions, callback contracts, and duplicate dispatch protection before moving selected workflows to root.
- Complete secret scanning and environment-name mapping before promoting operational workflows.
- Verify Vercel project root/build settings and Supabase live linkage without changing production settings.
