# SARGuardian Monorepo readiness and remaining work

**Last updated:** 2026-11-06  
**Working branch:** `migration/source-snapshot-import`  
**Current production state:** unchanged; original Dynamic app/API and backend Actions remain authoritative.

## Latest migration verification — 2026-11-06

- Code/workflow head `8454a15fe2e014afa1297e2c03faff132734e998`: [Snapshot Regression Tests 42182301730](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42182301730) passed **19/19**. This includes the three-workflow primary Find Displacements chain, RiverShift gated workflow contract, four preserved Known Place routes, promoted app/engine tests, exact source snapshot integrity, active-runtime-scope validation, Supabase migration filename/blob alignment, default-privilege SQL contract and frontend build/lint/unit tests.
- Additional same-head checks: Backend source snapshot suites 2/2 passed, Migration Metadata Validation passed, Historical Secret Scan passed, Runner Allocation Diagnostic passed, Retention Archive Regression passed, Dashboard asset tests passed, and dual-pin AOI validation passed.
- Docs/readiness-only head `16d1ac1866d2df66443badb40b645cb844afd018` follows that code head and is running its own final PR checks. Do not call the docs-only head fully green until its own Snapshot Regression finishes.
- Monorepo Supabase local migration directory now contains nine files whose 14-digit filename prefixes and suffix names match the nine live migration records returned by the Monorepo project inventory. Seven imported SQL blobs are still byte-identical to their immutable Dynamic source-snapshot files; the two forward migration blobs are unchanged. CI checks every path and blob SHA. No remote migration record, schema, table or data was changed by this filename alignment.
- The existing Dynamic Production Supabase project has a separate lineage and is not covered by the Monorepo nine-record alignment manifest. Keep its reconciliation separate.
- PR #2 remains Draft/unmerged. Existing Dynamic/Backend Production routing, Vercel Production aliases and Production Supabase are unchanged.


## 2026-11-06 active migration scope decision — supersedes broad 82-workflow promotion wording

The migration scope is intentionally **not** “activate every workflow copied from the source repositories.” The 82 source workflow instances are retained for immutable provenance and audit only. Current API-linked cutover scope has three operational tiers:

| Tier | Workflow count | Contents | Acceptance state |
|---|---:|---|---|
| **Primary proven runtime** | 3 | Find Displacements dispatcher → dashboard engine → one-product worker | Backend run [42097077601](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601) completed successfully: 20 jobs, one failed initial GUNW-002 download, failed-only retry passed, dashboard assembly passed, terminal callback passed |
| **Connected gated feature** | 1 | RiverShift NISAR GCOV workflow | Backend run [42089984247](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42089984247) matched 14/14 catalogue granules but correctly stopped at `EVENT_WINDOW_NOT_BRACKETED` before processing; positive-case GCOV pilot still required |
| **Preserved but disabled feature paths** | 4 | Generic Known Place dispatcher/reusable analysis and author-exact P05023 dispatcher/replay | No matching Known Place dispatch found in the latest 100 Backend runs reviewed on 2026-11-06; keep separate and gated, not part of the primary cutover |
| **Migration CI** | 7 | Source snapshot regression, API/Web/engine tests, metadata, secret scan, retention and AOI code validation | Validation-only; not product runtime dependencies |

The exact primary allowlist, RiverShift gated-feature list, Known Place disabled-feature list, API routes, source pins and run evidence are maintained in [active runtime scope](active-runtime-scope-2026-11-06.md) and `migration/active-runtime-scope.json`. CI enforces those tiers through `tools/validate_active_runtime_scope.py`.

### What this scope decision changes

- Only the three Find Displacements workflows count as the primary proven processing runtime.
- RiverShift stays in the Monorepo and in the API feature set, but its API and repository dispatch gates remain false until an eligible acquisition window completes a positive-case pilot.
- Known Place generic and author-exact P05023 source/API/engine paths remain preserved, but they are not treated as current production dependencies and their gates remain false.
- Manual diagnostics, standalone NISAR experiments, retained-artifact repair/replay workflows, alternate forks, historical push-triggered bridges and unused research variants are not automatic runtime dependencies. Preserve their exact source snapshots; do not promote them into the active API dispatch graph.
- Keep all 82 source workflow instances in the disposition register and immutable snapshots. Inventory completeness does not mean every workflow should be active.
- Do not change the existing Dynamic Production API, Backend Actions targets, Production callbacks, Vercel aliases or Production Supabase while this isolated cutover is incomplete.

### Remaining completion gates

1. Pass current-head CI including the active-runtime-scope validator and full history secret scan.
2. Configure Monorepo-only API Preview credentials (Firebase Admin, Supabase service key, GitHub dispatch token, callback HMAC secrets and Drive result-read OAuth) and Monorepo Actions Secrets (Earthdata + Google Drive OAuth/parent folder). Do not paste credentials into chat or Git.
3. Verify authenticated Preview login, owner-scoped Supabase persistence, Find Displacements mock dispatch, signed callback, status polling, artifact access and duplicate-dispatch protection.
4. Complete a positive-case RiverShift pilot with a genuinely bracketed event window; verify GCOV processing, 15-product barriers, failed-only retry, Drive receipts and signed callback. Keep the feature off until it passes.
5. Keep Known Place disabled in this primary cutover; separately accept generic two-polygon and author-exact P05023 only if/when those features are deliberately released.
6. Run the final read-only `supabase migration list --remote=qbmhpdprvxssqinnommz` with authenticated CLI access to confirm all nine filename/version pairs; do not use `db push`, repair or replay as a shortcut.
7. Review Web bundle size/npm advisories, independent science validity, licensing and rollback; then merge PRs in sequence and cut over Production only after explicit owner approval.

**Current status:** source/API/engine promotion and the primary Find Displacements workflow chain exist on the isolated migration branch. Full operational migration is **not complete**: authenticated Preview, credentials, callbacks, RiverShift positive-case pilot, migration-history reconciliation, current-head CI, and Production cutover remain open. Existing Production continues to run on Dynamic + Backend.


> **Current-head verification — 2026-11-06, code/workflow head `f6f48462a3546bccfe551549c931c87523d35fa8`:**
> - [Snapshot Regression Tests 42176353725](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42176353725): **19/19 jobs passed** on this exact head. This includes the API's Monorepo-only 13-query owner-scope guard and the new Supabase future-object default-privilege SQL contract, as well as Web, Dynamic API/frontend, Find Displacements, Known Place, RiverShift, NISAR, workflow inventory and source blob-integrity jobs.
> - [Backend Source Snapshot Regression 42176353744](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42176353744): immutable source suites passed — Backend main **595 passed, 1 skipped**; Known Place PR #85 **563 passed, 1 skipped**.
> - [Migration Metadata Validation 42176353822](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42176353822), [Historical Secret Scan 42176353743](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42176353743), [Runner Allocation Diagnostic 42176353508](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42176353508), [Retention Archive Regression 42176353747](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42176353747), [dual-pin AOI validation 42176353609](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42176353609) and [Dashboard asset builder 42176353425](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42176353425): all successful.
> - Workflow inventory: **82/82** source workflow instances (Dynamic 7, Backend main 35, Known Place PR #85 40), **42** Monorepo root workflow files, **39** mapped root destinations; four legacy variants are archive-only. Contract-equivalence review and safe promotion are still separate from static inventory completeness.
> - The P05023 structural gate validates exact source object `ab547ecc82bcc4d6ccef545a59852536c2beacc6`, manual-only launch, explicit consent gates, distinct GUNW+GOFF inputs, Drive receipt and no automatic raw deletion. It has not been live-dispatched.
> - Monorepo Preview Vercel API [deployment HJtpYcp](https://vercel.com/moshiour-rahman-sarkers-projects-2cebe363/sar-guardian-monorepo-api/HJtpYcpCWypvTsMVBwQDnv4RrNb7) is READY on this code head, Preview-only (`target=null`); `/health` returned HTTP 200. Web Preview [deployment 2U6HvM](https://vercel.com/moshiour-rahman-sarkers-projects-2cebe363/sar-guardian-monorepo-web/2U6HvMTE9sqTU6DM2VaZgBV4PhB4) is READY on the immediately prior code/test head. Neither has a Production alias.
> - The Free Tokyo Supabase target `qbmhpdprvxssqinnommz` is ACTIVE_HEALTHY at `https://qbmhpdprvxssqinnommz.supabase.co`. It has four empty RLS-enabled app tables and zero Security Advisor findings. Nine migration rows exist. The local `infrastructure/supabase/migrations/` filenames are now keyed to the nine exact remote version/name pairs in `migration/supabase-history-alignment.json`; the seven imported SQL blobs remain exact source copies. A final authenticated CLI v3 `migration list --remote` check remains, and no remote repair or DDL replay has been done.
> - Forward migration `20261106064055_20261106100000_public_default_privileges_hardening.sql` was applied to the Monorepo Preview DB. Future public tables/sequences created by `postgres` no longer inherit anon/authenticated grants; future functions also lose browser EXECUTE plus PostgreSQL's global default PUBLIC EXECUTE. `service_role` defaults remain intact. A transactional post-apply probe verified the table, sequence and function privileges and rolled back all probe objects. Supabase-managed `supabase_admin` defaults are untouched because the connected `postgres` role cannot assume that provider role.
> - API Preview has all four Monorepo workflow destination names/refs, callback base URLs, CORS and fail-closed API flags. It still lacks `SUPABASE_SERVICE_ROLE_KEY`, Firebase Admin JSON, GitHub PAT, HMAC callback secrets and Drive OAuth values. Authenticated login, persisted job writes, signed callbacks and private Drive retrieval are not yet runtime-tested.
> - All original Dynamic Production Web/API projects, Backend workflow destinations and Dynamic Production Supabase remain unchanged. No real NISAR downloads, RiverShift GCOV execution, Drive uploads or Production cutover were performed. Public Monorepo visibility is explicitly authorized; secret values remain outside Git history.

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

**Source snapshots and audited core app/engine promotions are in place. All inventoried source workflows have explicit dispositions, but contract-equivalence review, runtime credential setup and Production cutover are not complete.**

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

The new Monorepo Supabase target and existing Dynamic Production Supabase are separate. The Monorepo's nine local migration filenames now match the nine remote version/name rows in `migration/supabase-history-alignment.json`; the seven imported SQL blobs remain byte-identical to immutable Dynamic source files, and the two forward migrations retain reviewed SHA-1 blob identities. CI verifies that mapping. A final authenticated CLI v3 `supabase migration list --remote` confirmation is still required; no remote history repair, old DDL replay, `db push` or reset has been performed. The existing Dynamic Production project has its own eight-row historical lineage and must be reconciled separately against its original local files before any future database push. Its history must not be conflated with the Monorepo target. Retention for processing/displacement/RiverShift jobs and Drive/GitHub artifacts remains undefined and is intentionally not auto-purged. `postgres` defaults are hardened for future app objects; Supabase-managed `supabase_admin` defaults remain outside the current permission scope.

### 4. End-to-end integration and production cutover — NOT STARTED

Still required:
- mock API dispatch and signed callback round trips for Find Displacements, Known Place, and RiverShift;
- verify request IDs, HMAC signatures, callback order, status polling, cancellation, failure propagation, Drive receipt, and retention behavior;
- compare canonical source/promoted output fixtures and manifests;
- run one isolated real-data pilot per engine and independently review outputs;
- rehearse rollback to existing Vercel deployment and original backend workflow targets;
- obtain explicit production cutover approval before changing repository/ref values, callback destinations, domains, or aliases.

## Recommended sequence

1. The latest current-head Snapshot Regression run [42182301730](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42182301730) passed **19/19 jobs** on `8454a15fe2e014afa1297e2c03faff132734e998`. It includes all app/engine suites, exact source integrity, the active-runtime call-graph validator, Supabase migration filename/blob alignment test, and Supabase default-privilege contract.
2. The primary production candidate is Find Displacements only. Complete its API Preview mock-dispatch, signed callback, failure/status polling, artifact and duplicate-dispatch checks. RiverShift remains gated until a scientifically eligible event window completes a positive-case GCOV pilot. Known Place remains preserved but disabled; do not include it in this cutover unless deliberately released.
3. Import the missing non-production API/Actions credentials using the approved secret stores, then run SSO-authorized Firebase login, Maps, API health, owner-scoped staging persistence, Find Displacements mock dispatch, signed callback and private Drive receipt tests.
4. Confirm Monorepo migration alignment through an authenticated read-only CLI v3 `supabase migration list --remote` against project `qbmhpdprvxssqinnommz`; reconcile the separate Dynamic Production history in a separate plan. No DDL replay or history repair is authorized by the filename alignment.
5. Review Web npm advisories/bundle size, complete independent science review, one isolated real-data pilot for each feature actually released, and rehearse rollback.
6. Merge PRs in dependency order and switch Production one path at a time only after explicit owner approval.

## What remains in plain terms

Current migration branch head: `8454a15fe2e014afa1297e2c03faff132734e998`. Snapshot Regression run [42182301730](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42182301730) passed **19/19**; the separate Backend Source Snapshot Regression, migration metadata, historical secret scan, runner diagnostic, retention archive and dual-pin AOI validation also passed on this head. The Web/API Preview deployments remain isolated Preview deployments; they do not yet prove authenticated login, Supabase persistence or callback/Drive behavior because the required non-production secrets are absent. The primary Find Displacements source/workflow chain is promoted; RiverShift is gated; Known Place is preserved disabled. Existing Dynamic + Backend Production remains unchanged, and PR #2 is still Draft/unmerged. **The source/CI migration is substantially validated, but operational cutover is not complete.**


## Updated Preview and database verification — 2026-11-05

- Web and API Monorepo Vercel builds are independently verified as READY Preview deployments; Web ran TypeScript + Vite build, API compiled Python functions and uploaded outputs. These deployments came from documentation-only commits after the last code-bearing integration commit. They are Preview only and SSO-protected.
- The Preview environment audit is fail-closed: no Firebase config or Google Maps key in Web; no Supabase credentials, service-account credentials, GitHub/Earthdata/Drive tokens or callback secret in API. Both live processing flags are explicitly false. Thus Preview builds successfully, but auth, Maps, live data persistence and processing callbacks have not been runtime-validated.
- Vercel Preview runtime-log queries returned no records in the last 30 minutes; no route smoke test is claimed. See the live Vercel inventory (../operations/live-vercel-inventory.md).
- Historical Dynamic Production read-only Supabase verification confirms its four job tables and RiverShift schema contract. That seven-row observation belongs to the 2026-11-05 historical checkpoint, not the current Monorepo target. The Monorepo target now has nine remote records and nine local deployment filenames aligned by remote version/name; imported SQL blobs remain byte-identical and CI verifies the map. No remote DDL or migration-history repair was run.
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

The Free Tokyo project is active and has the expected four empty RLS-enabled tables. The Monorepo's nine local migration filenames are now aligned to the nine observed remote version/name rows, with byte-identical imported SQL blobs and pinned Monorepo-only forward migrations. Do not run `db push`, migration repair, replay or reset until authenticated CLI v3 confirms the full local/remote timestamp alignment. The existing Dynamic Production project retains its separate historical migration lineage. The existing `SARGuardian_Dynamic` Production project has its own separate migration lineage; do not conflate its rows with this new target.

The first direct ACL inspection found broad defaults for future objects. A forward hardening migration is now applied for future application objects created by `postgres`, and a transactional post-apply probe verified no browser-role table/sequence/function privileges while preserving `service_role`. Supabase-managed `supabase_admin` defaults are unchanged and remain a future review boundary; the connected `postgres` role cannot assume that provider role. The `processing_jobs.preflight_id` FK also lacks a covering index; consider a separate index migration only after query-plan/expected-volume review.

### Preview readiness and blocking inputs

The API Preview is READY at the current API code commit. The Web Preview is READY on the immediately preceding docs-only commit. Both are SSO-protected, Preview-only and have no Production alias.

The API Preview environment has the Tokyo `SUPABASE_URL`, callback base URLs and all four workflow destination names/refs. It intentionally lacks the server-side Supabase service key, Firebase Admin JSON, GitHub PAT, callback HMAC secrets and Drive OAuth values. Do not put any of these in the Web project or commit them. The Supabase service key must be created in the Dashboard as a named API secret and added only to Vercel API Preview. Firebase Admin, GitHub dispatch and Drive result-read credentials need to be added in their respective server-side/Actions secret stores before runtime acceptance.

**Remaining acceptance gates:** authenticated Preview health/auth/map/persistence smoke; mock dispatch and HMAC callback/status-polling round trips for all engines; Drive receipt read/write verification; one explicit dry-run or isolated real-data pilot per engine; default-privilege and FK-index review; migration-history reconciliation; independent science review; rollback rehearsal; explicit owner approval before merge or Production cutover.
