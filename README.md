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
- **Known Place Analysis:** a separate fixed-benchmark and two-polygon research workflow. Its feature-branch and PR #85 lineage is preserved.
- **River Shift:** an independent NISAR GCOV engine with ASF acquisition discovery, processing, overlap diagnostics, transects, and external validation.
- **Glacier Movement:** currently a product/category route into the shared Find Displacements engine, not a separately proven processing engine.

## Migration principles

1. Preserve the original repositories and immutable source SHAs until the monorepo passes acceptance.
2. Import source snapshots with provenance before refactoring or relocating code.
3. Keep the active Dynamic API distinct from the older backend `app/` service until a usage and contract review proves consolidation safe.
4. Preserve all workflow triggers, permissions, artifacts, callbacks, retries, and retention behaviour.
5. Never copy secret values into Git. Build an explicit secret-name mapping and configure target secrets separately.
6. Validate in an isolated migration branch and Preview environment before any production cutover.
7. No engine algorithm or scientific status semantics may change as a side effect of repository consolidation.

## Current target layout

```text
apps/
  web/                 # React/Vite frontend, promoted and tested
  api/                 # active Firebase/Supabase API, promoted and tested
  tools/               # Dynamic API compatibility helpers
engines/
  find-displacements/  # AOI-wide candidate discovery and diagnostics
  known-place/         # PR #85 research implementation
  river-shift/         # independent GCOV engine
science/
  nisar-core/          # current NISAR science source
migration/
  source-snapshots/    # immutable source trees and historical pins
.github/workflows/     # only reviewed central workflows become active here
docs/
  architecture/
  migration/
  scientific-validation/
```

Source snapshots remain immutable, and promoted paths are exact copies. Original source paths remain available until deployment, workflow parity, and security/cutover checks complete. Nested `.github/workflows/` directories beneath `apps/`, `engines/`, and `migration/source-snapshots/` are inactive compatibility/archive paths; GitHub Actions only executes workflow files from the repository-root `.github/workflows/`.

## Verified CI baseline

Latest full source-and-promoted-path parity run: [GitHub Actions run 41958426808](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41958426808).

<badge color="success">14/14 jobs passed</badge>

The run recorded:
- **1,463** passing test executions and 1 skipped across immutable source snapshots.
- **1,231** passing test executions across promoted application/engine paths.
- **2,694** total passing test executions, 1 skipped. The same suites intentionally execute at both source and promoted paths; this is execution count, not unique test-case count.
- Exact Git blob/mode/type checks for all **1,408** snapshot paths and the promoted path/fixture mappings.

See the [validation report](docs/migration/validation-baseline.md), [engine promotion report](docs/migration/engine-promotion-report.md), [workflow register](docs/migration/workflow-register.md), and [path collision report](docs/migration/path-collision-report.md).

## Current readiness

- [x] New private repository created and write access verified.
- [x] Nine immutable source snapshots imported with exact source history.
- [x] Dynamic frontend/API promoted and tested from `apps/web` and `apps/api`.
- [x] Find Displacements, Known Place, RiverShift, and NISAR paths promoted and tested separately.
- [x] 42 Dynamic/backend-main workflows inventoried; Known Place PR #85 branch delta documented.
- [ ] Complete workflow caller/permissions/callback/artifact/retention audit before activating central root workflows.
- [ ] Automated secret scan and configuration-name mapping (names only).
- [ ] Verify existing Vercel project roots, environment scopes, Preview deployment, and routes.
- [ ] Verify Supabase project/schema linkage without applying migrations.
- [ ] Mock callback/dispatch/retry/retention tests, isolated operational pilot, and rollback rehearsal.
- [ ] Explicit production cutover approval.

The current work is isolated to migration branches. No source repository, production Vercel alias, Supabase schema, active dispatch destination, or production callback URL has been changed.
