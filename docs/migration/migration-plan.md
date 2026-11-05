# SARGuardian monorepo migration plan

**Plan date:** 2026-11-05  
**Execution state:** nine immutable source snapshots imported; app and engine paths promoted on an isolated migration branch; 14/14 source/promoted CI jobs pass. Workflow cutover and production deployment remain blocked pending the remaining integration/security gates.

## Executive decision

Use a **preserve-first, staged monorepo migration**. Do not concatenate source roots or merge the APIs in one step. Source snapshots remain immutable; promoted paths are exact copies that will be refactored only after call graphs, build roots, and workflow contracts are verified.

## Phase 0 — protect and verify inputs

- [x] Verify target repository exists and connected GitHub integration has push/admin access.
- [x] Record current default-branch SHAs for Dynamic, backend, and NISAR science sources.
- [x] Record Known Place feature-branch base and open PR #85 separately from backend main.
- [x] Import nine exact source trees and retain source commit history.
- [x] Inventory all 42 Dynamic/backend-main workflow files with source blob SHAs, triggers, jobs, checkout repositories/pins, and credential-risk notes.
- [x] Record the Known Place PR #85 workflow delta: 15 added workflows, 8 modified same-path workflows, and 10 backend-main-only workflows.
- [ ] Complete exhaustive branch/tag inventory beyond the selected immutable refs.
- [ ] Record Vercel project roots, production branch/alias, and Supabase linkage without changing them.
- [ ] Trace calls to the old backend `app/` service and determine if it is still used.

## Phase 1 — safe monorepo foundation

- [x] Add README, engineering/scientific guardrails, architecture boundaries, contribution rules, source-pin manifest, and staged migration plan.
- [x] Add secrets-free metadata validation and isolated source/promoted regression CI.
- [ ] Add CODEOWNERS and verify branch protection/required checks.
- [ ] Complete configuration-name mapping before creating environment templates.
- [x] Run Gitleaks across the full reachable Git history using a checksum-verified binary; 20 synthetic test-only findings were reviewed and scoped to exact fingerprints.
- [x] Validate that the Gitleaks exception file has exactly 20 unique test-file fingerprints and no directory/rule-wide exclusions.

## Phase 2 — immutable imports and source integrity

- [x] Import nine source snapshots under `migration/source-snapshots/` (1,408 tracked paths).
- [x] Preserve source commit histories through Git parent relationships.
- [x] Compare every imported snapshot path, file mode, object type, and Git blob SHA.
- [x] Preserve divergent historical worker checkouts (Dynamic API, backend reassembly, legacy Sagormodak science fork) separately rather than overlaying them.
- [x] Record 24 Dynamic/backend same-path collisions, including 19 different-content files.
- [x] Keep all original source repositories unchanged.

## Phase 3 — application and engine path promotion

- [x] Promote Dynamic `Frontend/` to `apps/web/`; build, lint, and 155 tests pass at the promoted path.
- [x] Promote Dynamic active `Backend/` to `apps/api/`; 215 API tests and the Google Maps adapter contract pass from the promoted path.
- [x] Retain Dynamic root tools under `apps/tools/` and its workflow compatibility mirror under `apps/.github/workflows/`; these mirrors are inactive.
- [x] Promote Find Displacements dashboard/tools to `engines/find-displacements/`; 104 dashboard/worker-tools tests pass.
- [x] Promote the Known Place PR #85 source tree to `engines/known-place/`; 318 tests pass.
- [x] Promote RiverShift GCOV code to `engines/river-shift/`; 259 tests pass.
- [x] Promote current NISAR science source to `science/nisar-core/`; 180 tests pass.
- [x] Verify exact blob identity for promoted directories and workflow/dependency compatibility fixtures.
- [ ] Decide the long-term package boundary for duplicated utilities; do not deduplicate by filename.
- [ ] Decide whether the older SQLAlchemy/session-oriented backend `app/` is retained under a `legacy/` namespace or retired after caller tracing.

**Important:** engine-local `.github/workflows/` directories are inactive fixtures preserving existing tests' source-relative workflow paths. GitHub Actions only activates root `.github/workflows/`.

## Phase 4 — central workflow migration

The audited baseline has 42 workflow YAML files: 7 in Dynamic and 35 in backend main. The Known Place PR #85 feature branch contains 40 workflow YAMLs: 15 branch-specific additions, 8 changed same-path files, 17 unchanged files, and 10 backend-main-only files absent from that branch.

Before moving any operational workflow into root `.github/workflows/`, record:
- trigger types, branch/path filters, dispatch inputs, and reusable workflow callers;
- job graph, dependencies, concurrency, matrix, environments, and permissions;
- each external checkout repository/ref/path and immutable source pin;
- artifact names, retention, upload/download relationships, and Drive/Supabase writes;
- secrets/variables by name only;
- callbacks, callback signatures, expected sequence/terminal states;
- retry behavior, cleanup, and failure propagation;
- disposition: CI regression, operational dispatcher/worker, credentialed/live integration, retained replay/validation, legacy, or retirement candidate.

**Duplicate-run rule:** original repository workflows remain authoritative while the monorepo copies are inactive or mock-only. Do not permit one request to dispatch both old and new production workers.

**RiverShift constraint:** preserve the 20-job GCOV graph: prepare, four sequential batch/status barriers, up to three retry waves, and assemble. Keep batches of 15 where configured; retry only failed products; never re-download successful products; preserve callback/artifact/Drive receipt order; fail the outer workflow if a required inner stage fails.

**Known Place constraint:** use PR #85 for the engine implementation and two-polygon research behavior, but reconcile current backend-main/Dynamic dispatchers against the active API contract. The PR feature branch does not contain later backend-main RiverShift/dispatcher workflows.

**Exit condition:** every workflow version has a reviewed disposition; selected root workflows pass isolated tests; duplicate-dispatch prevention and rollback are demonstrated.

## Phase 5 — infrastructure, operational validation, and cutover

- [ ] Verify Vercel project IDs, roots, build settings, output settings, function limits, environment scopes, production branch, and aliases.
- [ ] Confirm Supabase project identity, schema ownership, RLS, retention, and migration state without applying schema changes.
- [ ] Map GitHub/Vercel environment variable and secret names by consumer; transfer no secret values through Git.
- [ ] Deploy a Preview only; test authentication, map search/AOI drawing, dashboard/archive, all engine pages, and result retrieval.
- [ ] Exercise API dispatch/callback signatures, sequence ordering, retry behavior, terminal failure, Drive receipts, and retention with mocks.
- [ ] Compare canonical source and promoted output fixtures/manifests; path-level code identity is already verified, but real-output parity remains pending.
- [ ] Run an isolated real-data pilot only after mock, security, and scientific fixture gates pass.
- [ ] Compare pilot output to source baselines and independent validation evidence.
- [ ] Rehearse rollback to the existing production deployment and original dispatchers.
- [ ] Obtain explicit approval before production Vercel aliases, callback destinations, or worker dispatch ownership changes.

## Current CI acceptance baseline

Latest full parity run: [41958659688](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41958659688), 14/14 jobs passed:
- source snapshot tests: 1,463 passed, 1 skipped;
- promoted-path tests: 1,231 passed;
- total: 2,694 passing test executions, 1 skipped;
- exact source blob/history checks: 1,408 snapshot paths plus promoted path/fixture mappings.

See `docs/migration/validation-baseline.md`.

## Mandatory production cutover gates

- Source integrity: PASS
- Snapshot and promoted-path regression parity: PASS
- Workflow inventory/disposition: IN PROGRESS
- Workflow permissions/caller/callback/retry parity: PENDING
- API live contract/auth/CORS: PENDING Preview
- Supabase persistence/retention: PENDING live configuration check
- Historical Git secret scan: PASS (zero unreviewed findings)
- Runtime secret/permission mapping: PENDING
- Vercel Preview/routing: PENDING
- Scientific real-output parity and independent validation: PENDING
- Rollback rehearsal: PENDING

A repository merge is not a production cutover.
