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

Latest full code/test baseline:
- [GitHub Actions run 41980756059](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41980756059): **17/17 jobs passed** after the Known Place routing/integrity changes. Later migration-documentation, branch-archive and CI path-filter commits still need a fresh full regression/secret-scan confirmation.
- 1,463 source-snapshot test executions passed, 1 skipped.
- 1,231 promoted-path test executions passed.
- **2,694 passing executions, 1 skipped**. This is an execution count because source and promoted paths intentionally run the same suites twice; it is not a count of unique test cases.
- Exact Git blob/mode/type checks passed for all 1,685 core source snapshot paths and the promoted code/config/workflow compatibility mappings. Additional OPERA/Run #36 validation files are archived separately under migration/source-branch-snapshots/ with source blob hashes; they are not active workflows.
- Full-history Gitleaks scan [41967281531](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41967281531): PASS, zero unreviewed findings.
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

**RiverShift:** its 20-job Monorepo candidate is statically validated and inactive. Still required: a 20-job operational mock/dry-run covering all four 15-product batch barriers, missing/failed artifacts, failed-only retry waves, callback ordering, Drive receipt mismatch, and final failure propagation.

### 2. Vercel Monorepo Preview — INITIAL BUILDS READY; LATEST BUILD BLOCKED BY HOSTING QUOTA

Two new Vercel projects are now Git-linked to `moshiour0/SARGuardian-Monorepo` with separate roots:
- Web: project `sar-guardian-monorepo-web`, root `apps/web`.
- API: project `sar-guardian-monorepo-api`, root `apps/api`.

The first isolated Preview deployments from commit `8de4f0f0edfc37a3ccc192a547942e2d84f1b59f` both reached READY with `target=null` (Preview, not Production). Preview-only API URL/CORS values are configured; Find Displacements and RiverShift dispatch are explicitly disabled. No Production credentials, Supabase service-role key, Firebase Admin credential, GitHub token, Drive OAuth or callback secret were copied to Preview.

A later attempt to check/deploy the newer branch head was rejected by Vercel with `build-rate-limit`. This is a hosting build quota blocker, not a reported TypeScript/Python build failure. The current Preview URL is therefore behind the latest code commits. Full login, staging persistence, live map key/Places API, private Drive result retrieval and real processing are not yet validated on Monorepo Preview.

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

The core source import, promoted paths and a 17/17 regression baseline are complete for the audited sources. The newer archival validation snapshots and documentation have not yet received a fresh full CI/secret-scan confirmation. What remains is the operational integration: safe workflow activation, latest Preview redeployment/smoke tests, callback/retention dry-runs, Supabase history reconciliation, and finally real-data pilot, independent review, rollback and cutover. **It is not production-ready yet.**
