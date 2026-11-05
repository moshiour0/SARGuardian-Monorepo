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
- [GitHub Actions run 41967281468](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41967281468): **16/16 jobs passed**.
- 1,463 source-snapshot test executions passed, 1 skipped.
- 1,231 promoted-path test executions passed.
- **2,694 passing executions, 1 skipped**. This is an execution count because source and promoted paths intentionally run the same suites twice; it is not a count of unique test cases.
- Exact Git blob/mode/type checks passed for all 1,685 source snapshot paths and the promoted code/config/workflow compatibility mappings.
- Full-history Gitleaks scan [41967281531](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41967281531): PASS, zero unreviewed findings.
- Workflow dependency parser: 82 workflow variants, 135 jobs, 20 reusable call edges (12 local and 8 external), and 141 external checkout steps.

## Completed

| Area | Status | Evidence |
|---|---|---|
| Source preservation | PASS | 10 source snapshots, 1,685 paths, source SHAs/history retained |
| Dynamic frontend/API promotion | PASS | 155 frontend tests; 215 API tests; frontend build/lint pass |
| Find Displacements promotion | PASS | 104 promoted dashboard/worker tests; original GOFF/GUNW separation unchanged |
| Known Place promotion | PASS | PR #85 engine lineage, plus author-exact source pin; 318 tests pass |
| RiverShift GCOV promotion | PASS | 259 tests pass; independent GCOV boundary retained |
| NISAR science promotion | PASS | 180 tests pass; historical worker pins separately preserved |
| Supabase source migration files | PASS | config + seven migration files exact-copy promoted |
| Workflow syntax/static inventory | PASS | 82 YAML variants parse with zero YAML errors; 20 reusable call edges enumerated |
| Secret scan | PASS | Full reachable history scanned; 20 exact synthetic test-fixture fingerprints are narrowly allowlisted |
| Production config discovery | PASS | Vercel/Supabase state inspected read-only; no production changes |

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

### 2. Vercel Monorepo Preview — NOT STARTED

The two current Vercel projects are still Git-linked to `moshiour0/SARGuardian_Dynamic`, not the Monorepo. The Production deployments still use the previous Dynamic production commit; they have not been retargeted.

Before any Preview project is deployed:
- verify current project Root Directory/build/output/function settings in Vercel;
- create separate Monorepo Preview project(s) for `apps/web` and `apps/api`;
- map Preview-only public frontend values and server-only Firebase/Supabase/GitHub/callback secrets;
- configure Preview API URL and narrowly scoped CORS;
- validate login, map search/AOI drawing, dashboards, archive, engine routes, and result retrieval.

Do not repoint either existing Production project. No Monorepo Vercel project has been created yet.

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

1. Finish the reusable workflow pin/permission/caller audit and root workflow selection.
2. Complete the RiverShift 20-job mock/dry-run; then validate the other engine dispatch chains.
3. Set up isolated Vercel Preview projects and Preview-only environment values.
4. Reconcile Supabase migration history and retention policy without reapplying existing DDL.
5. Run mock callback/retention tests, isolated real-data pilots, scientific comparison, and rollback rehearsal.
6. Merge the migration PRs in dependency order; then cut over one engine at a time after explicit approval.

## What remains in plain terms

The hard part of copying and preserving code is done, and regression tests are green. What remains is the operational integration: safe workflow activation, Preview hosting/configuration, callback/retention dry-runs, Supabase history reconciliation, and finally pilot/rollback/cutover. **It is not production-ready yet**, but the remaining work is clearly bounded and documented.
