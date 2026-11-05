# SARGuardian Monorepo readiness and remaining work

**Last updated:** 2026-11-05  
**Working branch:** `migration/source-snapshot-import`  
**Current production state:** unchanged; original Dynamic app/API and backend Actions remain authoritative.

> **Latest PR-head validation update (2026-11-05):** the current documentation branch head is `151f59854705351d34f234c4c78595ffe7d31a60`, following code-bearing commit `1bcc0648e01794496ec08375e3f245aaadaaf2cf`. New current-head runs [41996716079](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41996716079), [41996716004](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41996716004), and [41996715986](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41996715986) again failed before runner steps (`steps=null`); the prior 419907 runs and their failed-job reruns behaved the same way. The exact cause remains unknown. See the [live migration checkpoint](live-migration-checkpoint-2026-11-05.md).


> **Live checkpoint update (2026-11-05):** this report's earlier CI references predate Monorepo head [`1bcc0648e01794496ec08375e3f245aaadaaf2cf`](https://github.com/moshiour0/SARGuardian-Monorepo/commit/1bcc0648e01794496ec08375e3f245aaadaaf2cf). Its latest regression, metadata and full-history secret-scan runs (41990721765, 41990721786, 41990721757) all failed before any runner step; failed-job reruns reproduced `steps=null`. This is not a test assertion failure, but it is not a green validation. See the [live migration checkpoint](live-migration-checkpoint-2026-11-05.md) for current source-PR dispositions, root-workflow gates, rerun evidence and exact remaining cutover conditions. That checkpoint supersedes stale “latest head” identifiers below.

## Executive status

**Source consolidation and code-level migration are complete for the audited scope. Production cutover is not complete.**

The Monorepo now contains:
- 10 immutable source snapshots: **1,685 tracked paths** with source commit ancestry and exact Git object identity preserved;
- promoted app/API paths: `apps/web`, `apps/api`, and Dynamic compatibility support paths;
- separate promoted engines: Find Displacements, Known Place PR #85, RiverShift GCOV, and NISAR science;
- Supabase config and seven SQL migration files under `infrastructure/supabase/`;
- static workflow inventory, reusable workflow call graph, source pin inventory, and workflow migration/cutover documentation.

Latest full code/test baseline and follow-up execution:
- [GitHub Actions run 41980756059](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41980756059): **17/17 jobs passed** for the promoted application/engine code and the Known Place configurable-routing changes.
- The later source-branch archive gate was added to `tools/verify_source_snapshots.py`. It pins five OPERA/Run #36 source files against `migration/source-branch-snapshots/rivershift-validation-pins.json`; the archive is evidence-only and does not activate those workflows.
- Later source-archive gate and Known Place workflow-contract edits are not yet validated by a successful current-head run. Runs [41983005054](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41983005054), [41983005055](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41983005055), [41983005107](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41983005107), and latest runs [41989627071](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41989627071), [41989626966](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41989626966), [41989627000](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41989627000) all concluded `failure` before runner steps. Latest run 41989627000 created all 17 regression jobs, but each had `steps=null`; metadata/secret-scan jobs likewise had no steps/logs. A rerun of the latest three runs reproduced the same state. This is **not evidence of a code/test assertion failure**, but it is not a passing validation either. A successful current-head source/archive integrity run and full-history secret scan are still required.
- At the time checked, [GitHub Status](https://www.githubstatus.com/) reported all systems operational; the [incident history](https://www.githubstatus.com/history) lists the November 4 Actions incident as resolved. The repository-level pre-job failure remains unexplained; do not attribute it to billing, permissions, or a platform outage without account-specific evidence.
- 1,463 source-snapshot test executions passed, 1 skipped.
- 1,231 promoted-path test executions passed.
- **2,694 passing executions, 1 skipped**. This is an execution count because source and promoted paths intentionally run the same suites twice; it is not a count of unique test cases.
- Exact Git blob/mode/type checks passed for all 1,685 core source snapshot paths and the promoted code/config/workflow compatibility mappings. Additional OPERA/Run #36 validation files are archived separately under migration/source-branch-snapshots/ with source blob hashes; they are not active workflows.
- Full-history Gitleaks scan [41967281531](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41967281531): PASS for the earlier imported history. Latest full-history scan [41989626966](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41989626966) did not start its job step, including after rerun; the new archive, science audit and migration documentation have **not yet received a successful fresh scan**.
- Workflow dependency parser: 82 workflow variants, 135 jobs, 20 reusable call edges (12 local and 8 external), and 141 external checkout steps.

## Completed

| Area | Status | Evidence |
|---|---|---|
| Source preservation | PASS | 10 source snapshots, 1,685 paths, source SHAs/history retained |
| Dynamic frontend/API promotion | PASS | 155 frontend tests; 215 API tests; frontend build/lint pass |
| Find Displacements promotion | PASS | 104 promoted dashboard/worker tests; original GOFF/GUNW separation unchanged |
| Known Place promotion | PASS (source/code baseline) | PR #85 engine lineage and separate author-exact P05023 pin; 318 engine tests pass on the historical baseline. API workflow destinations are independently configurable. One canonical two-job root dispatcher plus one `workflow_call` engine workflow are present; duplicate dispatcher removed. Two contract validators cover source identity/permissions/opt-in and API field/status/artifact/scoped-secret mapping. Latest current-head CI is unresolved pre-run failure, not green. |
| RiverShift GCOV promotion | PASS | 259 tests pass; independent GCOV boundary retained |
| NISAR science promotion | PASS | 180 tests pass; historical worker pins separately preserved |
| Supabase source migration files | PASS | config + seven migration files exact-copy promoted |
| Workflow syntax/static inventory | PASS | 82 YAML variants parse with zero YAML errors; 20 reusable call edges enumerated |
| Secret scan | PASS | Full reachable history scanned; 20 exact synthetic test-fixture fingerprints are narrowly allowlisted |
| Production config discovery | PASS | Existing Production Vercel projects and active Supabase state inspected read-only; no production changes |

## Remaining critical work

### 1. Operational GitHub Actions centralization — IN PROGRESS

The source workflows are inventoried, but most are still archival snapshots. They have **not** been bulk-copied into root `.github/workflows/`.

The static audit found:
- 432 unpinned action-reference occurrences across the 82 source workflow variants (including duplicated branch variants);
- 25 workflow variants where at least one job has neither job-level nor top-level explicit permissions;
- 8 external reusable workflow call edges, of which 4 still use mutable branch refs;
- 141 external checkout steps, with three workflow inputs/outputs supplying the ref dynamically.

The next work is to choose only the required production/CI workflows, pin every external action and source checkout, define least-privilege permissions, and preserve caller/input/artifact/callback/retry/retention semantics. The source snapshots will remain unchanged.

**RiverShift:** the validated 20-job candidate now has a guarded 21-job root port at .github/workflows/river-shift-gcov-process.yml. It is workflow_dispatch-only; the credential-free preflight fails closed unless MONOREPO_RIVERSHIFT_PROCESSING_ENABLED=true. The API still defaults to the old Backend workflow and Preview dispatch is disabled. Still required: a 20-job operational mock/dry-run covering all four 15-product batch barriers, missing/failed artifacts, failed-only retry waves, callback ordering, Drive receipt mismatch, and final failure propagation.

**Known Place:** the canonical API entrypoint is `.github/workflows/know-place-aoi-dispatcher.yml`; it uses a request-ID run name, a credential-free preflight and explicit mapping of exactly six worker secrets into the local reusable workflow `.github/workflows/know-place-aoi-analysis.yml`. The reusable engine allows catalog-only dry runs with raw downloads and Drive upload off; raw downloads require both explicit user consent and `MONOREPO_KNOWN_PLACE_ACTIONS_ENABLED=true`. The duplicate `know-place-aoi-monorepo-dispatcher.yml` was removed. API production defaults still target the existing Backend dispatcher; no production route was changed. Current-head CI has not yet executed these validators successfully.

### 2. Vercel Monorepo Preview — INITIAL BUILDS READY; LATEST BUILD BLOCKED BY HOSTING QUOTA

Two new Vercel projects are now Git-linked to `moshiour0/SARGuardian-Monorepo` with separate roots:
- Web: project `sar-guardian-monorepo-web`, root `apps/web`.
- API: project `sar-guardian-monorepo-api`, root `apps/api`.

The isolated Preview deployments both reached READY with `target=null` (Preview, not Production):
- Web deployment [`dpl_GMUhm39paoZgMfqyxzPSDBqaVMKe`](https://vercel.com/moshiour-rahman-sarkers-projects-2cebe363/sar-guardian-monorepo-web) uses commit `cb23414a069f3bd0c0ad466b1a581d5e26038e64`; stable branch alias: `sar-guardi-git-90a645-moshiour-rahman-sarkers-projects-2cebe363.vercel.app`.
- API deployment [`dpl_F5m1ZnpYktLNHiQ5p7WD1kHDm6Tf`](https://vercel.com/moshiour-rahman-sarkers-projects-2cebe363/sar-guardian-monorepo-api) uses commit `f2cca2b57ccd40ad93ff1ab41a5b862f41833b51`; stable branch alias: `sar-guardi-git-ed4bd9-moshiour-rahman-sarkers-projects-2cebe363.vercel.app`.

The Web RiverShift page and API config/main blobs match the current branch. The deployed API `known_place.py` is one six-line correction behind current source: its workflow URL variable references were corrected from `workflow_PAGE` to `workflow_page` after that deployment. The current source is corrected, but Known Place dispatch/status must not be treated as tested on this Preview until the API is redeployed. Preview-only API URL/CORS values are configured; Find Displacements and RiverShift dispatch are explicitly disabled. No Production credentials, Supabase service-role key, Firebase Admin credential, GitHub token, Drive OAuth or callback secret were copied to Preview.

Vercel's Git integration has since rejected newer deployments with `api-deployments-free-per-day` (`more than 100`), shown in its PR bot comment. This is a hosting deployment quota blocker, not a reported TypeScript/Python build failure. The current Preview projects remain SSO-protected and behind the latest source commit; the API also needs the six-line Known Place URL-reference correction deployed. Full login, staging persistence, live map key/Places API, private Drive result retrieval and real processing are not yet validated on Monorepo Preview.

Do not repoint either existing Production project. Keep Preview dispatch disabled until staging auth/database and callback contracts are ready.

### 3. Supabase migration-history and retention reconciliation — PARTIAL

The active Supabase project and RLS/privileges are verified read-only; local config and SQL migrations are now in the Monorepo. The seven remote migration records do not all match local filename version prefixes/names. Before any future `db push`, reconcile the migration history using read-only CLI/history comparison. Review retention/cleanup policy and PostgREST exposed-schema settings. No remote SQL or schema change has been applied.

### 4. End-to-end integration and production cutover — NOT STARTED

Still required:
- mock API dispatch and signed callback round trips for Find Displacements, Known Place, and RiverShift;
- verify request IDs, HMAC signatures, callback order, status polling, cancellation, failure propagation, Drive receipt, and retention behavior;
- compare canonical source/promoted output fixtures and manifests;
- run one isolated real-data pilot per engine and independently review outputs;
- rehearse rollback to existing Vercel deployment and original backend workflow targets;
- obtain explicit production cutover approval before changing repository/ref values, callback destinations, domains, or aliases.

## Recommended sequence

1. Finish reusable workflow pin/permission/caller audit and root workflow selection. Current migration branch has the canonical Known Place dispatcher plus two contract validators; run both on a successful current-head GitHub runner. The source-branch archive also requires a fresh full-history secret scan and snapshot regression run; path filters include `migration/source-branch-snapshots/**`, `migration/promotion-overrides.json`, `docs/migration/**`, the canonical Known Place root dispatcher and both validator scripts.
2. Complete the RiverShift 20-job mock/dry-run; then validate the other engine dispatch chains.
3. Resolve the Vercel build-rate limit, redeploy the latest Monorepo branch to the existing isolated Preview projects, and complete nonproduction authentication/API/map smoke tests.
4. Reconcile Supabase migration history and retention policy without reapplying existing DDL.
5. Run mock callback/retention tests, isolated real-data pilots, scientific comparison, and rollback rehearsal.
6. Merge the migration PRs in dependency order; then cut over one engine at a time after explicit approval.

## What remains in plain terms

The core source import and promoted paths have a verified 17/17 historical regression baseline. This remains historical evidence only. The latest audited migration head is `1bcc0648e01794496ec08375e3f245aaadaaf2cf`. Its 17 regression jobs plus metadata and secret-scan jobs failed before any runner step, and failed-job reruns reproduced the same pre-step state. The Monorepo now contains the PR #9 Find Displacements script-audit documents (reconciled to active science pin `006d4cd`) and a source-branch disposition report; their latest source history has not yet received a fresh successful secret scan/regression run. The canonical Known Place dispatcher and contract validators are present, while production defaults remain on the old Backend. The known Vercel previews are READY but stale; Vercel account deployment-rate limit blocks redeploy. What remains is successful CI runner execution, latest Preview redeploy/smoke tests, engine workflow dry-runs, Supabase migration-history reconciliation, real-data pilots, independent review, rollback and controlled cutover. **It is not production-ready yet.**


## Updated Preview and database verification — 2026-11-05

- Web and API Monorepo Vercel builds are independently verified as READY Preview deployments; Web ran TypeScript + Vite build, API compiled Python functions and uploaded outputs. These deployments came from documentation-only commits after the last code-bearing integration commit. They are Preview only and SSO-protected.
- The Preview environment audit is fail-closed: no Firebase config or Google Maps key in Web; no Supabase credentials, service-account credentials, GitHub/Earthdata/Drive tokens or callback secret in API. Both live processing flags are explicitly false. Thus Preview builds successfully, but auth, Maps, live data persistence and processing callbacks have not been runtime-validated.
- Vercel Preview runtime-log queries returned no records in the last 30 minutes; no route smoke test is claimed. See the live Vercel inventory (../operations/live-vercel-inventory.md).
- Read-only Supabase verification confirms all four job tables exist, RLS/owner-read policies are enabled, anon/authenticated table grants are absent, and RiverShift's live analysis-mode/transition contract matches the expected local post-migration schema. Seven remote migration records remain mapped to seven local files with version/name drift. No DDL or migration-history repair was run.
- Supabase CLI v3 is now default and changes remote targeting: use --remote for any future remote list/push operation; never run db push until migration versions/names are reconciled. See Supabase migration lineage (supabase-migration-lineage.md) and the official v2→v3 migration guide (https://supabase.com/docs/guides/local-development/cli/migrating-to-v3).
- Web build warnings remain: one 560.16 kB JS chunk and npm audit summary of 19 advisories (10 moderate, 7 high, 2 critical); exact advisories must be reviewed before public release. Do not blindly run npm audit fix --force.
