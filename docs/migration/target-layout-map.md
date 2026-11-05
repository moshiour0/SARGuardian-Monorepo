# Source-to-target layout map

**Status:** proposed promotion map after immutable snapshot import. No source files have been relocated yet.

## Application layer

| Source snapshot | Candidate destination | Notes |
|---|---|---|
| `migration/source-snapshots/dynamic/Frontend/` | `apps/web/` | React/Vite app. Preserve build config, public assets, routes, and map loader semantics. |
| `migration/source-snapshots/dynamic/Backend/` | `apps/api/` | Active Firebase-authenticated FastAPI API with Supabase persistence and Vercel entrypoint. |
| `migration/source-snapshots/backend-main/app/` | `legacy/backend-api/` or retained snapshot | Separate SQLAlchemy/session-oriented service. Do not fold into active API before usage and contract tracing. |

## Engine and science layer

| Source snapshot | Candidate destination | Notes |
|---|---|---|
| Backend main `dashboard/` plus relevant `tools/` | `engines/find-displacements/` | Target-free AOI discovery, candidate-local floors, GUNW gated pixel diagnostics, GOFF diagnostics. Preserve separate measurement families. |
| Backend Known Place PR #85 head | `engines/known-place/` | Use the PR-head snapshot as the current reviewed lineage; preserve the feature-branch ancestor and author-exact replay contracts. |
| Backend main `tools/river_shift/river_shift/` and related GCOV runner files | `engines/river-shift/` | Independent GCOV engine; keep orchestration and validation stages intact. |
| NISAR science main `src/` | `science/nisar-core/` | Preserve exact current source revision and module provenance. |
| Historical NISAR pin snapshots | `science/nisar-core/versions/` or pinned compatibility packages | Do not overlay different revisions into one directory. Keep worker-specific pins addressable. |

## Workflow layer

Source workflow folders currently exist only inside their imported snapshots:
- Dynamic: `migration/source-snapshots/dynamic/.github/workflows/`
- Backend main: `migration/source-snapshots/backend-main/.github/workflows/`
- Known Place PR #85 head: `migration/source-snapshots/backend-known-place-pr85/.github/workflows/`
- NISAR science main: `migration/source-snapshots/nisar-science/.github/workflows/`

The active root `.github/workflows/` should receive only workflows that pass the 42-file workflow register. For each workflow, preserve trigger filters, job graph, permissions, cross-repository checkout, artifacts, callback, retry, retention, and rollback semantics. Never promote all files in a bulk copy.

## Shared-code collision and dependency checks

Some utilities occur in more than one repository, including HDF5 archive helpers and AOI worker scripts. Do not deduplicate based on filename or apparent similarity. First compare blob SHA, imports, call sites, tests, environment assumptions, and workflow working directories.

For every promoted module, record:
- original source path and SHA;
- destination path;
- import rewrites and compatibility shims;
- tests that cover the moved module;
- any behaviour change (migration-only changes should have none).

## Promotion order

1. Dynamic frontend/API with build and route parity.
2. Backend worker libraries as isolated packages, without activating their workflows.
3. NISAR source and explicit version pins.
4. Find Displacements and Known Place engine boundaries.
5. RiverShift GCOV engine and its full orchestration/validation tests.
6. Selected root workflows, one classified group at a time.

This order is provisional. Import-graph evidence and deployment requirements can change the order, but not the engine boundaries or science invariants.
