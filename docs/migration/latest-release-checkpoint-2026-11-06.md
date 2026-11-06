# Latest SARGuardian Monorepo Release Checkpoint — 2026-11-06

**Release decision: NOT READY FOR PROCESSING CUTOVER.** The source migration is
merged to `main`, the new Monorepo Web and API Production deployments are
reachable, and the Tokyo Supabase metadata mirror is verified. User-data
processing remains disabled because repository privacy, Known Place request
ownership, authenticated API integration and external credential access are not
fully accepted.

## Repository and pull-request state

- Default branch `main` is at
  `c14e1e5843176b61d4ef9dcfeae8d7a819a71352`.
- PR #1 (migration foundation) is closed and merged. Merge commit:
  `975d60def84f73aac317e4deaee4cd8ecd09f2d5`.
- PR #2 (source snapshot import and promotion) is closed and merged. Merge
  commit: `c14e1e5843176b61d4ef9dcfeae8d7a819a71352`.
- GitHub comparisons confirmed `main`, `migration/bootstrap-and-provenance`
  and `migration/source-snapshot-import` all point to the same source head.
- PR #3, [security: block user-data workflows in public repositories](https://github.com/moshiour0/SARGuardian-Monorepo/pull/3),
  is Draft/Open. It adds a credential-free private-repository preflight to the
  four user-data entry workflows: Find Displacements, generic Known Place,
  author-exact P05023 and RiverShift.
- At security-code commit
  `64d87b0b94d3c2d918d818874b4d85f87567f9a1`, Snapshot Regression Tests
  completed **19/19**, AOI dual-pin static/parser validation completed
  successfully, and Historical Secret Scan completed successfully. The
  subsequent documentation-only commits in PR #3 require their own CI rerun
  before the updated PR head is considered fully validated.
- The Vercel GitHub checks for the PR #3 security head reported the Hobby
  daily build-rate-limit failure. This is not an application compile failure;
  no Vercel deployment was created for the PR #3 head.

## Vercel Production deployment state

Both separate Monorepo Production projects are deployed from the same source
commit `c14e1e5843176b61d4ef9dcfeae8d7a819a71352`.

| Project | Deployment | State | Verified endpoint |
|---|---|---|---|
| API | `dpl_2c9FJKWDDNxSDgn9BpxB5cBEmjiK` | READY | `/health` HTTP 200; `/openapi.json` HTTP 200 |
| Web | `dpl_Cu9W3u3P7hXsv4Fr8yC3n5oLLxo2` | READY | Web root, JavaScript bundle and CSS bundle HTTP 200 |

The canonical domains are `sar-guardian-monorepo-api.vercel.app` and
`sar-guardian-monorepo-web.vercel.app`. The Web bundle contains the canonical
API origin four times and no old Preview API alias. The API OpenAPI document
contains the displacement, RiverShift and Known Place route groups.

The Web build completed with `tsc -b && vite build`. Vite reported a
568.68 kB minified JavaScript chunk, and `npm audit` reported 19 advisories
(10 moderate, 7 high, 2 critical). No `npm audit fix --force` was run. These
dependency and bundle findings require review before a public release.

No authenticated browser-to-API session was available to this verification,
so HTTP 200 on `/health` is not evidence that Firebase Admin token verification
and owner-scoped Supabase reads have passed end to end. The Vercel runtime-error
queries for both projects returned no errors in the selected last-hour window.

## Supabase Tokyo target

The dedicated Free Tokyo project `qbmhpdprvxssqinnommz` is
`ACTIVE_HEALTHY`, PostgreSQL 17.11.0.018. Its canonical migration root is
`infrastructure/supabase/migrations/`; the duplicate `apps/api/supabase/`
tree is preserved source-snapshot material, not the Monorepo deployment
migration root.

The target contains an 80-row metadata mirror:

| Table | Rows |
|---|---:|
| `catalog_preflights` | 3 |
| `processing_jobs` | 2 |
| `displacement_jobs` | 51 |
| `river_shift_jobs` | 24 |
| **Total** | **80** |

The copy preserved IDs, owners, request/manifest snapshots, state, callback
sequence, creation time and historical run/Drive references. Trigger-managed
`updated_at` changed on the 75 Displacement/RiverShift rows during permitted
state-transition replay; all other compared fields matched. No raw NISAR
binary products were copied. The source Production rows were not updated or
deleted.

All four tables have RLS enabled. Browser roles have no direct table
SELECT/INSERT/UPDATE privileges; the API uses its server-only Supabase key and
explicit owner filters. Security Advisor returned zero findings. The current
Performance Advisor reports six unused-index INFO notices only; the FK index
and four RLS initplan improvements have already been added.

The target now reports **11 remote migration records**, all matched by
canonical Git filenames under `infrastructure/supabase/migrations/`. The
full 11-row mapping is in [supabase-target.md](supabase-target.md) and
[supabase-migration-lineage.md](supabase-migration-lineage.md).

Two historical `processing_jobs` rows remain queued but reference expired
preflights. They are historical metadata and must not be re-dispatched. There
are zero active Displacement or RiverShift jobs in the mirrored snapshot.

## Configuration and integration state

- Production Vercel environment inventory: API 35 variables, Web 9 variables.
  Server credentials are on the API project; the Web project has no
  server-side Supabase, Firebase Admin, GitHub Actions or Drive secret.
- Both API production processing switches,
  `DISPLACEMENT_ACTIONS_ENABLED` and `RIVERSHIFT_ACTIONS_ENABLED`, are
  explicitly `false`.
- The owner reports Firebase signup and Google sign-in now succeed after the
  two Preview domains were added to Authorized Domains. Server-side Firebase
  Admin ID-token verification by the Production API remains unverified.
- GitHub Actions token repository/workflow scope has not been independently
  proven by a dispatch-free authenticated API probe.
- Google Drive artifact retrieval using the Monorepo API identity remains
  unverified.
- No workflow was dispatched during this checkpoint. No NISAR raw data was
  downloaded, processed or uploaded by the Monorepo engines.

## Security blockers before enabling any user-data workflow

### 1. Public repository boundary

GitHub reports `SARGuardian-Monorepo` as **Public**. Repository visibility
has not been changed. PR #3 adds a read-only GitHub metadata check and stops
all four user-data entry workflows unless `private=true`, before checkout,
Earthdata/Drive credentials or result-artifact steps. Therefore the new
Monorepo user-data workflows remain intentionally blocked while the
repository is public. A private worker repository with a reviewed workflow
target is the alternative if the source Monorepo is to remain public.

### 2. Known Place request ownership

The Known Place status, result and bundle endpoints currently require Firebase
authentication but do not bind the supplied `request_id` to the authenticated
Firebase `uid`. The ID is also used in a GitHub Actions run title. A user who
obtains another request ID could attempt to read that run's result through the
authenticated API. PR #3 records this as an open blocker; it does not claim to
fix it.

Before enabling Known Place for multiple accounts, add durable owner-bound
request metadata in the canonical Supabase migration root, persist the
`request_id`/workflow kind/`owner_uid` before dispatch, and enforce owner
checks on status, result and bundle reads. Add cross-account tests for both
generic Known Place and author-exact P05023. Do not reuse
`catalog_preflights` as a permanent ownership table or repurpose an unrelated
job table. The next schema change needs a new reviewed migration, CI
validation, and a post-migration read-only verification on the Tokyo target.

### 3. End-to-end acceptance

Still pending: authenticated Firebase Admin + Supabase read verification,
GitHub token scope proof, Drive artifact retrieval, per-engine credential-free
mock dispatch/callback tests, private result retrieval, controlled positive
science pilots, independent science review and rollback rehearsal.

## Safety invariants

- Keep `DISPLACEMENT_ACTIONS_ENABLED=false` and
  `RIVERSHIFT_ACTIONS_ENABLED=false`.
- Keep repository workflow gates closed. Do not enable a gate simply to test
  credentials or a workflow.
- Never re-dispatch the two expired-preflight `processing_jobs` rows.
- Do not alter the original Dynamic/Backend Production routing, Production
  database, source repositories or rollback assets as part of this checkpoint.
- A READY deployment, passing static CI or a successful login does not by
  itself constitute a scientific pilot or Production cutover.

