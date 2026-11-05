# SARGuardian Monorepo readiness and remaining work

**Last updated:** 2026-11-05  
**Working branch:** `migration/source-snapshot-import`  
**Current production state:** unchanged; original Dynamic app/API and backend Actions remain authoritative.

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
- Latest-head runs [41983005054](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41983005054), [41983005055](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41983005055), and [41983005107](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41983005107) all concluded `failure`, but every job returned `steps=null`, no start-step/log artifact, and log retrieval returned `BlobNotFound`. A rerun of all failed jobs produced the same pre-step failure. This is **not evidence of a code/test assertion failure**, but it is also not a passing validation. The archive verifier and full-history scan therefore still need a successful runner execution on the current branch head.
- At the time checked, [GitHub Status](https://www.githubstatus.com/) reported all systems operational; the [incident history](https://www.githubstatus.com/history) lists the November 4 Actions incident as resolved. The repository-level pre-job failure remains unexplained; do not attribute it to billing, permissions, or a platform outage without account-specific evidence.
- 1,463 source-snapshot test executions passed, 1 skipped.
- 1,231 promoted-path test executions passed.
- **2,694 passing executions, 1 skipped**. This is an execution count because source and promoted paths intentionally run the same suites twice; it is not a count of unique test cases.
- Exact Git blob/mode/type checks passed for all 1,685 core source snapshot paths and the promoted code/config/workflow compatibility mappings. Additional OPERA/Run #36 validation files are archived separately under migration/source-branch-snapshots/ with source blob hashes; they are not active workflows.
- Full-history Gitleaks scan [41967281531](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41967281531): PASS for the earlier imported history. The latest run [41983005054](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41983005054) did not start its job steps, so the newly added branch-archive files have **not yet received a successful fresh scan**.
- Workflow dependency parser: 82 workflow variants, 135 jobs, 20 reusable call edges (12 local and 8 external), and 141 external checkout steps.

## Completed

| Area | Status | Evidence |
|---|---|---|
| Source preservation | PASS | 10 source snapshots, 1,685 paths, source SHAs/history retained |
| Dynamic frontend/API promotion | PASS | 155 frontend tests; 215 API tests; frontend build/lint pass |
| Find Displacements promotion | PASS | 104 promoted dashboard/worker tests; original GOFF/GUNW separation unchanged |
| Known Place promotion | PASS | PR #85 engine lineage, plus author-exact source pin; 318 engine tests pass. Active API workflow destinations are independently configurable and have dedicated default/cutover/artifact-routing regression tests. |
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

1. Finish the reusable workflow pin/permission/caller audit and root workflow selection. The latest source-branch archive also requires a fresh full-history secret scan and snapshot regression run; the CI path filter now includes migration/source-branch-snapshots/**, migration/promotion-overrides.json and docs/migration/**.
2. Complete the RiverShift 20-job mock/dry-run; then validate the other engine dispatch chains.
3. Resolve the Vercel build-rate limit, redeploy the latest Monorepo branch to the existing isolated Preview projects, and complete nonproduction authentication/API/map smoke tests.
4. Reconcile Supabase migration history and retention policy without reapplying existing DDL.
5. Run mock callback/retention tests, isolated real-data pilots, scientific comparison, and rollback rehearsal.
6. Merge the migration PRs in dependency order; then cut over one engine at a time after explicit approval.

## What remains in plain terms

The core source import and promoted paths have a verified 17/17 historical regression baseline. The latest source-archive verifier and secret-scan checks have not yet completed because GitHub created jobs but no runner steps/logs; the current CI result is therefore unresolved, not green. Latest Preview builds are READY but stale; the API's Known Place URL-reference correction remains undeployed. What remains is to recover CI execution, refresh both Preview deployments, complete workflow dry-runs, reconcile Supabase history, then run real-data pilots, independent review, rollback and controlled cutover. **It is not production-ready yet.**
