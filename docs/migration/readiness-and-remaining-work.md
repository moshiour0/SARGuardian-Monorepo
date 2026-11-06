# SARGuardian Monorepo readiness and remaining work

**Last updated:** 2026-11-06  
**Working branch:** `migration/source-snapshot-import`  
**Current production state:** unchanged; original Dynamic app/API and backend Actions remain authoritative.

> **Current-head verification — 2026-11-06, branch head `bdc110f61cd0114d8345b9f3c07a3fe5c3517078`:**
> - [Snapshot Regression Tests 42171832094](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42171832094): **19/19 jobs passed** on this exact commit. Coverage includes promoted Web/API, Dynamic API, Find Displacements, Known Place generic and author-exact contracts, RiverShift GCOV, NISAR science, workflow disposition/security inventory, exact source tree/blob integrity, and the fixed P05023 live-retention structural contract.
> - [Backend Source Snapshot Regression 42171832080](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42171832080): both immutable source variants passed their full historical suites — Backend main **595 passed, 1 skipped**; Known Place PR #85 **563 passed, 1 skipped**.
> - [Migration Metadata Validation 42171832076](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42171832076), [Historical Secret Scan 42171832123](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42171832123), [Runner Allocation Diagnostic 42171832117](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42171832117), [Retention Archive Regression 42171832108](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42171832108), [dual-pin AOI Code Validation 42171832099](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42171832099), and [Dashboard Asset Builder 42171832118](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42171832118): all successful on this head.
> - The machine-readable workflow register covers **82/82 source workflow instances** (Dynamic 7, Backend main 35, Known Place PR #85 40), **42 root workflow files**, and 39 mapped root workflow destinations. Explicit contract review remains open for several variants; 4 legacy source instances are archive-only. Source snapshots are preserved and unchanged.
> - The P05023 live-retention structural contract validates the exact `ab547ecc82bcc4d6ccef545a59852536c2beacc6` commit object, manual-only launch, two fail-closed consent gates, the separate GUNW+GOFF fixed pair, Drive receipt requirement, no automatic raw deletion, and **8/8** exact source/promoted tool Git blobs. This is static validation only; the workflow has not been live-dispatched.
> - The API Vercel Preview is [READY](https://vercel.com/moshiour-rahman-sarkers-projects-2cebe363/sar-guardian-monorepo-api/D4nWxk59CwBsaTdgtXLQQnmmfpSV) for this exact commit, `target=null`, with SSO protection and no Production alias. The Web Preview is [READY](https://vercel.com/moshiour-rahman-sarkers-projects-2cebe363/sar-guardian-monorepo-web/4Dejs8BM5iPmrGsvB8mqaY6gPscr) on the immediately preceding docs-only commit `dea3f2e088ed94a6918a1ccbd9e324f09995492e`; frontend runtime source is unchanged by later API/migration-only commits.
> - The new Supabase target `SARGuardian-Monorepo` is Free, Japan/Tokyo (`ap-northeast-1`), `ACTIVE_HEALTHY`, PostgreSQL 17.11.0.018, URL `https://qbmhpdprvxssqinnommz.supabase.co`. It reports eight migration rows mapping to the eight canonical files under `infrastructure/supabase/migrations`; remote version numbers differ from local filename prefixes, so read-only CLI v3 reconciliation remains required. Four public job tables exist, all RLS-enabled and empty. Security Advisor: zero findings. Performance Advisor: one unindexed FK, four policy-evaluation notices, eight unused-index INFO findings.
> - A direct SQL audit confirms current app tables grant access only to `postgres` and `service_role`; `anon` and `authenticated` have no direct table grants. However, default privileges for new public tables/sequences/functions created by `postgres` or `supabase_admin` also grant relevant permissions to `anon` and `authenticated`. No live ACL has been changed. Review a least-privilege forward migration before adding new public objects; enable RLS and inspect SECURITY DEFINER functions.
> - API Preview already has the Tokyo `SUPABASE_URL` and separate workflow destination variables, but the latest environment inventory has no `SUPABASE_SERVICE_ROLE_KEY`, Firebase Admin credential, GitHub Actions token/callback secrets, or Drive OAuth credentials. Therefore authenticated persistence, map/auth integration, signed callbacks and private artifact reads are **not yet runtime-tested**. Runtime logs for the new API deployment show no requests in the sampled 30-minute window.
> - The old Dynamic Web/API Production projects, old Backend workflow targets and existing Production Supabase project remain unchanged. API switches and all Monorepo processing gates remain false. No real NISAR download, RiverShift GCOV run, Drive upload, signed callback round-trip or Production cutover was performed. The Monorepo being Public is intentional and explicitly authorized; secret values must stay out of Git history.

> **RiverShift root-workflow contract update — 2026-11-06, commit `3caf888764f9726773879b55463c17c111ae53a4`:**
> - The promoted engine's original `test_workflow_retry_contract.py` was restored byte-for-byte to its Backend source blob `200658f9889116bbdf2edb0753dfc7121985b827`; immutable source snapshot paths were not changed.
> - A new Monorepo-only test, `tools/tests/test_monorepo_rivershift_workflow_contract.py`, is run by the promoted RiverShift regression job. It checks the root workflow's 21 jobs (fail-closed preflight + 20 processing jobs), sequential 15-product batch barriers, retry-wave validation, final reconciliation dependency, read-only workflow permission and least-scope Earthdata/Drive/callback secrets.
> - The root workflow test was added to `snapshot-regression-tests.yml`. [Snapshot Regression Tests 42113191409](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42113191409) completed **17/17 jobs successfully**, including the new RiverShift root-workflow contract and the archived OPERA/RTC regression checks. [Historical Secret Scan 42113191759](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42113191759), [Migration Metadata Validation 42113191408](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42113191408), and [Runner Allocation Diagnostic 42113191766](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42113191766) also passed.
> - This verifies the workflow definition and test contracts, **not** an actual 20-job processing execution. The processing gate remains disabled; no ASF/Earthdata download, Google Drive upload, signed callback round-trip or live RiverShift result was generated.
> - The latest Vercel Web/API Preview deployments remain the `84be793` docs-head builds, both `READY`. Commits after that build only changed tests/workflow definitions; no frontend/API runtime code or Production routing changed.


> **Supabase retention update (2026-11-06):** a new canonical forward migration `20261105205909_catalog_preflight_retention.sql` was applied successfully to the active `SARGuardian_Dynamic` project. It enables `pg_cron 1.6.4`, adds one daily 03:20 UTC cleanup job owned by `postgres`, and purges only catalogue preflight snapshots more than seven days past expiry and not referenced by `processing_jobs`. The immutable guard remains in place for normal writes; the purge function is SECURITY DEFINER, has an empty search_path, and is not executable by browser roles or API `service_role`. A synthetic transactional test passed. All three existing expired preflight rows remain untouched because none has passed the grace period; two are FK-referenced by queued jobs. No other job history, Drive/GitHub artifact, raw data, or scientific result is auto-purged. The seven older migration-history identities still have version/name drift and were not repaired. The new migration is excluded by one exact relative path from the immutable Supabase snapshot comparison; all other imported paths remain byte-checked.

> **Codespaces promoted-path validation update (2026-11-06; migration branch head `87f1595d397809a24b0969b069a1ac182786d408`):** the owner ran the promoted-path validation locally in isolated persistent Conda/npm environments. Results: active API **226 passed** plus the Node Google Maps adapter contract; Find Displacements **104 passed**; Known Place **318 passed** using the CI glob `tools/tests/test_know_place_*.py` and `tools/know_place` compile; RiverShift **259 passed** (Python 3.13.18, GDAL 3.13.3, Rasterio 1.5.2; 186 warnings); NISAR Science Core **180 passed** from the pinned requirements (15 warnings); Web **155 passed across 20 test files**, with `npm ci`, `npm run build`, and `npm run lint` passing on Node 20.20.2/npm 10.8.2. Total: **1,242 promoted-path test executions passed**. The Web build reports a 558.46 kB minified JS chunk; dependency audit advisories were not individually reviewed. No real NISAR downloads, processing, Drive writes, or workflow dispatches were performed.
>
> The current-head Known Place API/workflow contract validator now passes after correcting its environment-map lookup and Drive secret scope assertions. `validate_migration_manifest.py` passes (3 source repositories, 14 immutable refs). `verify_source_snapshots.py` passes with **1,685** source entries, five RiverShift source-branch archive files, promoted blob/mode/type checks, and both ancestry checks. The working tree was clean after these checks. That runner-allocation observation was historical and has since been superseded by successful current-head GitHub Actions runs and a fresh full-history secret scan; see the 2026-11-06 verification block above.
>
> A read-only inventory of the ten root workflows found their third-party `uses:` references pinned to full 40-character commit SHAs; references to local reusable workflows (`./.github/workflows/...`) are same-commit local calls, not third-party action tags. The 432 unpinned references in the archival audit are source workflow variants and must not be rewritten inside immutable snapshots. Continue reviewing only workflows selected for root activation.

> **Historical PR-head validation update (2026-11-05; superseded by the 2026-11-06 current-head verification above):** the current documentation branch head is `151f59854705351d34f234c4c78595ffe7d31a60`, following code-bearing commit `1bcc0648e01794496ec08375e3f245aaadaaf2cf`. New current-head runs [41996716079](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41996716079), [41996716004](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41996716004), and [41996715986](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41996715986) again failed before runner steps (`steps=null`); the prior 419907 runs and their failed-job reruns behaved the same way. The exact cause remains unknown. See the [live migration checkpoint](live-migration-checkpoint-2026-11-05.md).


> **Historical live checkpoint update (2026-11-05; superseded by the 2026-11-06 current-head verification above):** this report's earlier CI references predate Monorepo head [`1bcc0648e01794496ec08375e3f245aaadaaf2cf`](https://github.com/moshiour0/SARGuardian-Monorepo/commit/1bcc0648e01794496ec08375e3f245aaadaaf2cf). Its latest regression, metadata and full-history secret-scan runs (41990721765, 41990721786, 41990721757) all failed before any runner step; failed-job reruns reproduced `steps=null`. This is not a test assertion failure, but it is not a green validation. See the [live migration checkpoint](live-migration-checkpoint-2026-11-05.md) for current source-PR dispositions, root-workflow gates, rerun evidence and exact remaining cutover conditions. That checkpoint supersedes stale “latest head” identifiers below.

## Executive status

**Source snapshots and the audited core app/engine promotions are in place; workflow contract review and Production cutover are not complete.**

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

The active Supabase project and RLS/privileges are verified. A bounded preflight retention migration is now applied: expired catalogue manifests receive a seven-day support grace period and are purged daily only when unreferenced by `processing_jobs`. The old Dynamic Production project and the new Monorepo Preview project are separate. Both have remote migration version/name identities that need a read-only CLI v3 reconciliation against their own canonical local files; no historical repair or replay has been performed. Before any future `db push`, reconcile those original migration identities with a read-only CLI/history comparison. Retention windows for `processing_jobs`, `displacement_jobs`, `river_shift_jobs`, and their Google Drive/GitHub artifacts remain undefined and are intentionally not auto-purged. PostgREST exposed-schema settings, the Performance Advisor's unindexed FK/policy warnings, and the default privileges for future public tables/sequences/functions remain to review. The current four app tables have no anon/authenticated direct table grants, but future default grants are broader.

### 4. End-to-end integration and production cutover — NOT STARTED

Still required:
- mock API dispatch and signed callback round trips for Find Displacements, Known Place, and RiverShift;
- verify request IDs, HMAC signatures, callback order, status polling, cancellation, failure propagation, Drive receipt, and retention behavior;
- compare canonical source/promoted output fixtures and manifests;
- run one isolated real-data pilot per engine and independently review outputs;
- rehearse rollback to existing Vercel deployment and original backend workflow targets;
- obtain explicit production cutover approval before changing repository/ref values, callback destinations, domains, or aliases.

## Recommended sequence

1. The reusable workflow pin/permission/caller audit, canonical Known Place dispatcher checks, source-branch archive check, current-head snapshot regression run and full-history secret scan have now passed on GitHub-hosted runners. Rerun these gates only when code or relevant workflow paths change.
2. Complete the RiverShift 20-job mock/dry-run; then validate the other engine dispatch chains.
3. The current Monorepo branch head now has fresh Web/API Vercel Preview deployments in `READY`. Complete SSO-authorized non-production Firebase login, Maps, API health, staging Supabase persistence and callback smoke tests after the owner imports the reviewed Preview environment values.
4. Reconcile Supabase migration history and retention policy without reapplying existing DDL.
5. Run mock callback/retention tests, isolated real-data pilots, scientific comparison, and rollback rehearsal.
6. Merge the migration PRs in dependency order; then cut over one engine at a time after explicit approval.

## What remains in plain terms

The current source branch head `96bcdee42b5b6871f5638dd3e41161cccc966130` has a fresh successful 17/17 regression run, metadata validation, full-history secret scan, and minimal runner diagnostic. Snapshot integrity and migration manifest checks also pass locally. The current Monorepo Web/API Preview deployments are `READY` for this exact head. Production defaults still point to the original Dynamic/Backend services; the Draft migration PR remains unmerged and no Production alias or worker destination has been switched. Remaining work is the RiverShift 20-job mock/dry-run, authenticated Preview smoke tests with separate staging credentials, Supabase historical migration-identity reconciliation, independent scientific review, controlled real-data pilots, rollback rehearsal, and explicit cutover approval. **It is not production-ready yet.**


## Updated Preview and database verification — 2026-11-05

- Web and API Monorepo Vercel builds are independently verified as READY Preview deployments; Web ran TypeScript + Vite build, API compiled Python functions and uploaded outputs. These deployments came from documentation-only commits after the last code-bearing integration commit. They are Preview only and SSO-protected.
- The Preview environment audit is fail-closed: no Firebase config or Google Maps key in Web; no Supabase credentials, service-account credentials, GitHub/Earthdata/Drive tokens or callback secret in API. Both live processing flags are explicitly false. Thus Preview builds successfully, but auth, Maps, live data persistence and processing callbacks have not been runtime-validated.
- Vercel Preview runtime-log queries returned no records in the last 30 minutes; no route smoke test is claimed. See the live Vercel inventory (../operations/live-vercel-inventory.md).
- Read-only Supabase verification confirms all four job tables exist, RLS/owner-read policies are enabled, anon/authenticated table grants are absent, and RiverShift's live analysis-mode/transition contract matches the expected local post-migration schema. Seven remote migration records remain mapped to seven local files with version/name drift. No DDL or migration-history repair was run.
- Supabase CLI v3 is now default and changes remote targeting: use --remote for any future remote list/push operation; never run db push until migration versions/names are reconciled. See Supabase migration lineage (supabase-migration-lineage.md) and the official v2→v3 migration guide (https://supabase.com/docs/guides/local-development/cli/migrating-to-v3).
- Web build warnings remain: one 560.16 kB JS chunk and npm audit summary of 19 advisories (10 moderate, 7 high, 2 critical); exact advisories must be reviewed before public release. Do not blindly run npm audit fix --force.


## Historical RiverShift validation update — 2026-11-05 (superseded by current-head CI pass)

The API now validates RiverShift workflow repository, filename and ref formats at production startup. New tests were added for invalid targets, valid branch refs and GitHub run-status fallback (missing callback, failed run, start timeout, terminal success preservation). At that time, the tests had not executed because runner diagnostic 42002234943 and snapshot run 42002235091 failed or queued before runner allocation. This observation is historical; current-head RiverShift worker/API regression jobs passed in Snapshot Regression Tests 42108970979. See the [RiverShift integration review](river-shift-integration-review-2026-11-05.md) for the remaining end-to-end dry-run gates.

The earlier API Preview redeploy request was rejected by Vercel with HTTP 402, but this is superseded: the current API Preview is now `READY` for commit `96bcdee42b5b6871f5638dd3e41161cccc966130`.


## Current API, workflow and Supabase acceptance status — 2026-11-06 (bdc110f)

### GitHub workflow consolidation

The complete source workflow inventory is accounted for: 82 source instances from Dynamic main, Backend main and Known Place PR #85; 42 root workflow files; 39 distinct root workflow destinations. The audit is a **disposition register**, not a claim that every source variant has been activated or proven contract-equivalent. Contract-review categories remain open in `migration/workflow-dispositions.json`; four legacy instances are explicitly archive-only.

The API's four processing destinations are documented in `docs/migration/api-dispatch-cutover-map.md`. Find Displacements uses the dashboard workflow schema, generic Known Place remains distinct from author-exact P05023, and RiverShift remains an independent GCOV engine. Production-compatible defaults are retained in source; the Vercel Preview points to Monorepo workflows on the migration branch. All API and repository processing switches remain false.

### Supabase Monorepo target

The Free Tokyo project is active and has the expected four empty RLS-enabled tables. Eight remote migration names map to the eight canonical local files under `infrastructure/supabase/migrations`, but remote version numbers are not the local filename prefixes. Do not run `db push`, migration repair, replay or reset until each project's history is reconciled independently. The existing `SARGuardian_Dynamic` Production project has its own separate migration lineage; do not conflate its rows with this new target.

The direct ACL inspection found no anon/authenticated grants on the four existing app tables. It also found broad default ACLs for *future* public tables, sequences and functions created by either `postgres` or `supabase_admin`: anon and authenticated would receive table/sequence privileges and function EXECUTE unless a migration changes those defaults. No live ACL modification has been made. Before creating additional public objects, review a narrowly scoped, idempotent default-privilege hardening migration and test it against expected Supabase-managed object creation. The `processing_jobs.preflight_id` FK also lacks a covering index; consider a separate index migration only after query-plan/expected-volume review.

### Preview readiness and blocking inputs

The API Preview is READY at the current API code commit. The Web Preview is READY on the immediately preceding docs-only commit. Both are SSO-protected, Preview-only and have no Production alias.

The API Preview environment has the Tokyo `SUPABASE_URL`, callback base URLs and all four workflow destination names/refs. It intentionally lacks the server-side Supabase service key, Firebase Admin JSON, GitHub PAT, callback HMAC secrets and Drive OAuth values. Do not put any of these in the Web project or commit them. The Supabase service key must be created in the Dashboard as a named API secret and added only to Vercel API Preview. Firebase Admin, GitHub dispatch and Drive result-read credentials need to be added in their respective server-side/Actions secret stores before runtime acceptance.

**Remaining acceptance gates:** authenticated Preview health/auth/map/persistence smoke; mock dispatch and HMAC callback/status-polling round trips for all engines; Drive receipt read/write verification; one explicit dry-run or isolated real-data pilot per engine; default-privilege and FK-index review; migration-history reconciliation; independent science review; rollback rehearsal; explicit owner approval before merge or Production cutover.
