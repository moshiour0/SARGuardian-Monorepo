# Evidence-based active runtime scope — 2026-11-06

**Purpose:** reduce migration scope to the SARGuardian paths that the current Dynamic application actually exposes and the Backend actually runs. This is a runtime-scope decision, not a Production cutover.

## Decision

Do not make all 82 source workflow instances active in the Monorepo. Preserve source snapshots for provenance, but distinguish the primary runtime, connected gated pilots and optional preserved features.

- **Primary proven runtime:** Dynamic Web/API → Find Displacements API → `sarguardian-aoi-wkt-dashboard.yml` → local dashboard engine → per-product worker → receipts/retry → dashboard → terminal callback. The three-file root workflow chain is the only workflow chain in the current primary runtime allowlist.
- **Connected, not yet validated feature:** RiverShift API → `river-shift-gcov-process.yml` → `engines/river-shift`. It is kept as a separate gated feature, not counted as a proven active processing path. The latest observed request reached exact catalogue matching (14/14) and stopped at `EVENT_WINDOW_NOT_BRACKETED` before product batches. This is a fail-closed scientific eligibility result, not a proven infrastructure defect; it is not a successful processing pilot.
- **Preserved, disabled features outside the current cutover scope:** Known Place generic and author-exact P05023 API routes/workflows. No matching Known Place `workflow_dispatch` appeared in the latest 100 Backend Actions runs reviewed on 2026-11-06. Keep their code and pins for future acceptance, but do not enable or count these workflows as active production dependencies now.

## Direct live execution evidence

### Find Displacements — successful end-to-end run

Backend workflow run [42097077601](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601), created 2026-11-05 19:46:26 UTC:

- Workflow conclusion: **success**; 20 jobs total.
- 13 initial product jobs succeeded. One initial GUNW-002 download failed.
- Only GUNW-002 was retried; the retry job succeeded.
- Dashboard assembly/downloadable maps succeeded.
- The final validated terminal-state callback job succeeded.

This is sufficient to classify the Find Displacements dispatch chain as the primary proven runtime to promote. Its exact science pin remains `006d4cd1485cf80e509eaf8717c12e9c6390ac09`; do not silently replace it with NISAR main.

### RiverShift — connected, but no positive-case processing evidence yet

Backend workflow run [42089984247](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42089984247), created 2026-11-05 19:02:08 UTC:

- Exact catalogue matching returned **14/14** submitted granules.
- The worker stopped at `acquisition_compatibility_audit` with `EVENT_WINDOW_NOT_BRACKETED`.
- No product batch started.

The workflow's fail-closed behavior worked. A request whose event date is not bracketed by compatible acquisitions must not proceed. Preserve RiverShift's API/worker integration, but do not declare the GCOV processing path production-validated until a scientifically eligible positive-case pilot completes.

### Known Place — retain feature, do not overstate usage

The current Dynamic API contains generic two-polygon and author-exact P05023 routes. The latest 100 Backend Actions run records contained no matching Known Place dispatch. This does not prove the feature has never been used; it means this audit does not have recent live-run evidence to place it in the primary cutover path. Keep the two routes and their independent science pins separate and disabled until explicitly tested.

## Monorepo runtime call graph

| Path | API surface | Root workflow(s) | Migration decision |
|---|---|---|---|
| Find Displacements | `apps/api/app/displacements.py` | `sarguardian-aoi-wkt-dashboard.yml` → `sarguardian-aoi-dashboard-engine.yml` → `sarguardian-aoi-product-worker.yml` | Primary runtime |
| RiverShift | `apps/api/app/river_shift_jobs.py` | `river-shift-gcov-process.yml` | Preserve; require positive-case pilot |
| Known Place generic | `apps/api/app/known_place.py` | `know-place-aoi-dispatcher.yml` → `know-place-aoi-analysis.yml` | Preserve as gated feature |
| Known Place author-exact | `apps/api/app/known_place.py` | `know-place-paper-reproduction-dispatcher.yml` → `know-place-author-exact-replay.yml` | Preserve separately; manual consent and fixed P05023 pins |

The Web and active Dynamic API belong in `apps/web` and `apps/api`. Find Displacements is the primary currently proven runtime. RiverShift remains a gated connected feature; Known Place routes are retained but disabled and outside this cutover scope. Do not remove their API/source code merely because they are not in the primary active workflow allowlist.

## What is not part of the active product dispatch graph

The remaining manual catalogue probes, Earthdata diagnostics, GUNW/GOFF science experiments, retained-artifact repair tools, one-granule retention pilots, independent RiverShift reference/replay workflows, and historical alternate-fork workers are not called by the current Dynamic API product routes. Do not make them automatic runtime dependencies. Keep their source versions and evidence in the immutable snapshots; only retain a root manual tool when a separately documented operator need justifies it.

CI and migration verification workflows are separate from product runtime. Keep the source-snapshot regression, promoted application/engine tests, metadata validation, history secret scan, retention fixture tests, dashboard asset tests and AOI source-pin validation. They verify the migration; they do not process user jobs.

## Required settings and acceptance gates

- Find Displacements uses its separate API dispatch flag, token, destination, callback secret and public API URL. Keep the Monorepo API flag and root repository gate false until Preview dispatch/callback tests pass.
- RiverShift uses its independent API flag/token/callback secret/public URL and root `MONOREPO_RIVERSHIFT_PROCESSING_ENABLED` gate. Never share the GOFF/GUNW displacement payload with GCOV.
- Known Place generic and author-exact workflows remain separate, with separate destination settings and consent markers. Preserve P05023 and exact author/science pins.
- Keep Earthdata and Google Drive upload credentials in Monorepo Actions Secrets. Keep Firebase, Supabase service role, GitHub dispatch token, callback secrets and Drive result-read OAuth credentials in the API server environment only.
- Preserve the canonical Drive parent identifier `GOOGLE_DRIVE_PARENT_FOLDER_ID`; do not add the legacy `GOOGLE_DRIVE_FOLDER_ID` alias.
- Run a final authenticated read-only CLI v3 migration-list confirmation for the Monorepo's already aligned nine files; separately reconcile the original Dynamic Production history before any repair or `db push`.
- Run a positive-case pilot for each feature included in the cutover, verify callback sequence, terminal failure propagation, artifact integrity and Drive receipts, and rehearse rollback.

## Safety boundary

This scope reduction does not authorize turning off the existing Dynamic Production, changing its Backend dispatch targets, changing Production Vercel aliases, or modifying the existing Production Supabase project. The new Monorepo remains isolated until all acceptance gates pass and the owner explicitly approves Production cutover.

Machine-readable counterpart: [`migration/active-runtime-scope.json`](../../migration/active-runtime-scope.json). The primary-runtime allowlist is deliberately smaller than the full historical inventory; separately gated and preserved features are listed in their own allowlists.
