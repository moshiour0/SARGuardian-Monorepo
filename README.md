# SARGuardian Monorepo

A controlled consolidation of SARGuardian's web application, active API, independent processing engines, NISAR science source, and GitHub Actions workflows.

> **Migration status: source import and first code promotion are complete on an isolated migration branch.** The original repositories remain authoritative and unchanged. No production deployment, secret transfer, live processing, or workflow cutover has been performed.

## Source systems

| Source | Responsibility | Audited baseline |
|---|---|---|
| [SARGuardian_Dynamic](https://github.com/moshiour0/SARGuardian_Dynamic) | React/Vite web app, active Firebase-authenticated FastAPI API, Supabase job persistence, deployment adapters | `dd64b7adc90594f1d7f316b352e39fbac2013cb6` |
| [SARGuardian-backend](https://github.com/moshiour0/SARGuardian-backend) | Scientific processing workers, RiverShift GCOV engine, Find Displacements diagnostics, reusable Actions workflows | `97d849454918b1425ac41bb70e7a32d11cfd3833` |
| [SARGuardian](https://github.com/moshiour0/SARGuardian) | NISAR science source used by pinned processing workflows | Current main at audit: `9fcb543ef28a7f6fe70a379aed9cfe3e43e277ec` |

The exact source trees have been imported under `migration/source-snapshots/` with their source commit histories preserved. See the [source-pin manifest](docs/migration/source-pins.json) and [source import report](docs/migration/source-import-report.md).

## Engine boundaries

- **Find Displacements:** target-free AOI-wide candidate discovery. GOFF offsets and GUNW LOS diagnostics remain separate measurement families.
- **Known Place Analysis:** a separate fixed-benchmark and two-polygon research workflow. Its feature-branch and open-PR lineage must be preserved; it is not assumed to exist in backend `main`.
- **River Shift:** an independent NISAR GCOV engine with ASF acquisition discovery, processing, overlap diagnostics, transects, and external validation.
- **Glacier Movement:** currently a product/category route into the shared Find Displacements engine, not a separately proven processing engine.

## Migration principles

1. Preserve the original repositories and immutable source SHAs until the monorepo passes acceptance.
2. Import source snapshots with provenance before refactoring or relocating code.
3. Keep the active Dynamic API distinct from the older backend `app/` service until a usage and contract review proves consolidation safe.
4. Preserve all workflow triggers, permissions, artifacts, callbacks, retries, and retention behaviour.
5. Never copy secret values into Git. Build an explicit secret-name mapping and configure target secrets separately.
6. Validate in an isolated migration branch and preview environment before any production cutover.
7. No engine algorithm or scientific status semantics may change as a side effect of repository consolidation.

## Planned layout

The final layout will be adjusted to the verified import graph and workflow working directories. The initial target is:

```text
apps/
  web/                 # React/Vite frontend
  api/                 # active Firebase/Supabase API
engines/
  find-displacements/
  known-place/
  river-shift/
science/
  nisar-core/           # immutable/pinned NISAR source
.github/workflows/      # curated central workflows
infrastructure/
  supabase/
  vercel/
docs/
  architecture/
  migration/
  scientific-validation/
```

The initial source snapshots remain under `migration/source-snapshots/`; promoted app paths are additional exact copies and the snapshots remain untouched. `apps/.github/workflows/` is an inactive test-compatibility mirror, not the active repository workflow directory.

The source snapshots remain immutable; exact-copy promotions now exist under `apps/`, `engines/`, and `science/`. Original source paths remain available until Preview deployment, workflow parity, and security/cutover checks complete.

The latest full CI parity run is green: **14/14 jobs passed**. It recorded 1,463 passing test executions (1 skipped) against source snapshots and another 1,231 passing executions from promoted app/engine paths. Exact Git blob/mode/history verification passed for all 1,408 imported source paths and promoted path/fixture mappings. See the [validation baseline](docs/migration/validation-baseline.md), [engine promotion report](docs/migration/engine-promotion-report.md), [workflow register](docs/migration/workflow-register.md), and [path collision report](docs/migration/path-collision-report.md).

## Current readiness

- [x] New private repository created and write access verified.
- [x] Source repository baselines verified.
- [x] Immutable source snapshots imported and verified (1,408 tracked source paths across nine snapshots).
- [x] Dynamic frontend/API and Find Displacements, Known Place, RiverShift, and NISAR paths promoted with passing regression suites.
- [x] File-level inventory of 42 Dynamic/backend-main workflows plus the Known Place PR #85 branch delta.
- [ ] Complete workflow caller/permissions/callback/retention audit before activating central root workflows.
- [ ] Vercel project-root verification and Preview deployment.
- [ ] Secret scan and secret/Supabase configuration mapping (names only).
- [ ] Isolated operational pilot and rollback rehearsal.
- [ ] Explicit production cutover approval.

Source snapshots are archival/provenance-preserving inputs, not yet the final app/engine layout. Their nested GitHub workflow folders are not active root workflows. See the [target layout map](docs/migration/target-layout-map.md), [migration plan](docs/migration/migration-plan.md), [architecture boundaries](docs/architecture/system-boundaries.md), and [scientific invariants](docs/scientific-validation/invariants.md).
