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
- **Known Place Analysis:** a current API-connected generic two-polygon workflow pinned to Backend's active reusable workflow/source revision 0e0611c12913044787ee84a39fa60a81d30ae516; the original feat/know-place-analysis branch was not merged into Backend main and PR #85 remains Draft/Open. Its PR #85 lineage is preserved separately. Author-exact P05023 replay remains a distinct manual-consent-gated path.
- **River Shift:** an independent NISAR GCOV engine with ASF acquisition discovery, processing, overlap diagnostics, transects, and external validation.
- **Glacier Movement:** currently a product/category route into the shared Find Displacements engine, not a separately proven processing engine.

## Active runtime scope (evidence-based)

The migration does **not** activate all 82 historical workflow instances. The primary proven runtime is the Dynamic Web/API → Find Displacements dispatch chain. RiverShift remains a connected feature that needs a positive-case GCOV pilot; Known Place is preserved as a separate gated feature because no matching dispatch appeared in the latest 100 Backend workflow runs reviewed on 2026-11-06. See the [active runtime scope and run evidence](docs/migration/active-runtime-scope-2026-11-06.md). Manual diagnostics, historical replays and unused research workflows are not required dependencies of the current Dynamic API product path.

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

Latest complete code/regression baseline: [GitHub Actions run 41980756059](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41980756059), with 17/17 jobs green after Known Place routing, artifact selection and promotion-integrity checks.

<badge color="success">17/17 jobs passed</badge>

This is the last complete green run before the later OPERA/Run #36 validation-branch archive, submission evidence matrix and CI path-filter updates. Those newer commits require a fresh regression and full-history secret-scan confirmation; do not treat the older run as validation of those additions.

The run recorded:
- **1,463** passing test executions and 1 skipped across immutable source snapshots.
- **1,231** passing test executions across promoted application/engine paths.
- **2,694** total passing test executions, 1 skipped. The same suites intentionally execute at both source and promoted paths; this is execution count, not unique test-case count.
- Exact Git object/mode integrity for all **1,685** source snapshot entries, promoted code/fixture mappings, and all 8 Supabase config/migration files.
- Workflow dependency parser: 82 variants, 135 jobs, 20 reusable call edges (12 local, 8 external), and 141 external checkout steps.
- RiverShift candidate workflow validation: 20-job graph, 15-product batches, failed-only retries, artifact/retention/callback contract, and immutable Node 24 action pins unchanged.

The last confirmed full-history Gitleaks scan [41967622669](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41967622669) passed with zero unreviewed findings. Because validation-source snapshots were added afterward, repeat the history scan before any public visibility change.

See the [live migration checkpoint (2026-11-05)](docs/migration/live-migration-checkpoint-2026-11-05.md), See the [readiness and remaining-work report](docs/migration/readiness-and-remaining-work.md), [active branch audit](docs/migration/active-branch-audit-2026-11-05.md), [score-sheet evidence matrix](docs/submission/score-sheet-evidence-matrix.md), [validation report](docs/migration/validation-baseline.md), [secret-scanning report](docs/security/secret-scanning.md), [workflow contract audit](docs/migration/workflow-contract-audit.md), [workflow register](docs/migration/workflow-register.md), [reusable workflow call graph](docs/migration/workflow-call-graph.md), [Supabase migration lineage](docs/migration/supabase-migration-lineage.md), [engine promotion report](docs/migration/engine-promotion-report.md), [Supabase live inventory](docs/operations/live-supabase-inventory.md), [Vercel live inventory](docs/operations/live-vercel-inventory.md), and [path collision report](docs/migration/path-collision-report.md).

## Current readiness

- [x] New private repository created and write access verified.
- [x] Nine commit-backed core source snapshots plus the divergent Known Place author-exact `b825df` tree pin preserved (1,685 tracked snapshot paths); additional RiverShift validation-source branch files are archived separately with exact blob pins.
- [x] Dynamic frontend/API promoted and tested from `apps/web` and `apps/api`.
- [x] Find Displacements, Known Place, RiverShift, and NISAR paths promoted and tested separately.
- [x] 42 Dynamic/backend-main workflows inventoried; Known Place PR #85 branch delta documented.
- [x] Static workflow contract audit: 82 variants parsed, zero YAML errors; 20 reusable call edges and 141 external checkout steps enumerated; permissions/action-pin/caller/artifact/retry risk counts documented.
- [x] RiverShift 20-job candidate preserved; a 21-job root workflow port added with a fail-closed MONOREPO_RIVERSHIFT_PROCESSING_ENABLED preflight. API still defaults to Backend; root dispatcher is not yet enabled or runtime-dry-run verified.
- [ ] Complete remaining runtime workflow caller/permissions/callback/artifact/retention review and dry-runs before activating central root workflows.
- [x] Full reachable-history Gitleaks scan passes with zero unreviewed findings; 20 exact synthetic test-fixture fingerprints are narrowly allowlisted and CI-validated.
- [x] Runtime configuration-name map created; generic and author-exact Known Place workflow destinations are independently configurable while defaulting to the existing Backend dispatchers.
- [x] Existing Production projects inspected read-only and left unchanged.
- [x] Two separate Monorepo Vercel Preview projects created with roots apps/web and apps/api; initial deployments from commit 8de4f0f reached READY with target=null.
- [ ] Redeploy the latest branch head and complete Preview smoke tests; Vercel currently rejects new builds with build-rate-limit. Preview processing dispatch remains disabled and no Production credentials were copied.
- [x] Verify active Supabase project identity, schema, RLS, and migration history read-only; promote the exact `config.toml` and seven local SQL migrations under `infrastructure/supabase/`.
- [ ] Reconcile remote migration version/name drift and retention cleanup policy; no remote SQL was applied.
- [ ] Mock callback/dispatch/retry/retention tests, isolated operational pilot, and rollback rehearsal.
- [ ] Confirm repository-wide licensing/third-party rights. NISAR science main contains an MIT license; Dynamic, Backend and the current Monorepo have no LICENSE file. Do not label the entire product open-source or make the repo public until the project owner confirms the intended license and all contributions/assets permit redistribution.
- [ ] Explicit production cutover approval.

The current work is isolated to migration branches. No source repository, production Vercel alias, Supabase schema, active dispatch destination, or production callback URL has been changed.
