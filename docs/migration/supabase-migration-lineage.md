# Supabase migration lineage and Monorepo ownership

**Source:** `moshiour0/SARGuardian_Dynamic@dd64b7adc90594f1d7f316b352e39fbac2013cb6`  
**Promoted destination:** `infrastructure/supabase/`  
**Status:** exact source files promoted; a separate forward retention migration is applied and verified on the live project. Historical migration rows remain unrepaired.

## Files imported

| Destination file | Source blob SHA |
|---|---|
| `config.toml` | `3292dc6443b23652e9077c13cd0c61284abd226f` |
| `migrations/20261017143644_processing_jobs.sql` | `0c62c69b8eecf674f65af5022e81e09d65fbecef` |
| `migrations/20261022203034_displacement_jobs.sql` | `a894b4d28d5fcda3df143629b9e70d613d3b727d` |
| `migrations/20261023141449_displacement_active_request_guard.sql` | `536d8c473f3d19de29b532d42127550262c33104` |
| `migrations/20261024111404_scientific_request_contract.sql` | `65c64d04c179bf4c1228a5d7edbd73510ad2b6fd` |
| `migrations/20261027003643_place_target_contract.sql` | `f588c72bcd064779a5790f979db709b86b23dff2` |
| `migrations/20261103100000_river_shift_jobs.sql` | `4d2fce5612c84baf2e8b06a9df02f05b2e0b0204` |
| `migrations/20261104120000_river_shift_analysis_modes.sql` | `895cade15db273e233433c228a7e20e85118f043` |

Every file is promoted without content rewriting. The exact-copy verifier compares source path, destination path, file mode, Git object type, and blob SHA.

## Live remote migration-history mapping

The existing Supabase project `SARGuardian_Dynamic` reports these eight remote migration records after the new forward migration:

| Remote version | Remote recorded name | Matching local source file |
|---|---|---|
| `20261026023221` | `20261017143644_processing_jobs` | `20261017143644_processing_jobs.sql` |
| `20261026023229` | `20261022203034_displacement_jobs` | `20261022203034_displacement_jobs.sql` |
| `20261026023233` | `20261023141449_displacement_active_request_guard` | `20261023141449_displacement_active_request_guard.sql` |
| `20261026023237` | `20261024111404_scientific_request_contract` | `20261024111404_scientific_request_contract.sql` |
| `20261027003643` | `place_target_contract` | `20261027003643_place_target_contract.sql` |
| `20261103021845` | `river_shift_jobs` | `20261103100000_river_shift_jobs.sql` |
| `20261103230606` | `river_shift_analysis_modes_phase2` | `20261104120000_river_shift_analysis_modes.sql` |
| `20261105205909` | `catalog_preflight_retention` | `20261105205909_catalog_preflight_retention.sql` |

The first four records have a remote `version` that differs from the timestamp embedded in the local filename. The two RiverShift records also have timestamp and/or recorded-name differences. The new eighth forward migration is aligned exactly by version and name. The actual schema/functions and analysis-mode constraints were read and checked against the migration intent, but this is not a migration-history reconciliation.

## Required before any `supabase db push`

Do not assume that matching SQL content or table structure makes the migration-history records interchangeable. Supabase CLI migration matching uses the migration version, and a version mismatch can make an already-applied migration appear pending. The local first four filenames have UTC-style prefixes from their source commits, while the remote history contains the same names under different deployment timestamps; the two RiverShift files also use different remote names. A schema match alone does not repair this history.

Before any future database write:
1. run read-only `supabase migration list --remote` (CLI v3) against the intended project and compare it with the exact Monorepo migration files;
2. inspect the original deployment/release history that created remote versions `20261026023221` through `20261103230606`;
3. compare remote migration statements/functions/triggers and the local SQL contents, including transaction effects and any subsequent hotfixes;
4. produce a reviewed version/name reconciliation plan;
5. only then consider a deliberate migration repair or an approved new forward migration.

Do not blindly rename the files, reapply these SQL statements, delete remote migration records, or use `db reset`. No Supabase migration command that writes to the remote project has been executed during this Monorepo migration.

## Runtime ownership

The Dynamic API remains the active service and currently talks to the existing Supabase project through server-side `SUPABASE_SERVICE_ROLE_KEY`. The Monorepo should reuse this project for the first isolated Preview only after:
- Preview secret/env scopes are configured separately;
- RLS and owner filtering pass API-level tests;
- PostgREST exposed-schema settings are confirmed after the Data API exposure change;
- retention and cleanup policy is reviewed;
- migration history is reconciled without reapplying existing DDL.

The server-only service-role key must never be placed in frontend `VITE_*` variables or committed to source.

## Live schema verification — read-only recheck 2026-11-05

The connected Supabase MCP project inventory confirms that the seven remote migration-history rows above are the current set; a separate read-only catalog query confirms all four expected public tables exist.

### RiverShift local-to-remote contract parity

The two local RiverShift source files were compared with live PostgreSQL catalog metadata, not merely with migration names:

- `river_shift_jobs.analysis_mode` exists as `text NOT NULL DEFAULT 'event_based'`.
- `event_date` is nullable.
- `analysis_mode` accepts only `general_scan` and `event_based`.
- `general_scan` requires `event_date IS NULL`; `event_based` requires a non-null date within the requested start/end range.
- Existing 366-day window, maturity, frequency, covariance term, threshold method/value, request fingerprint, callback sequence and owner/idempotency constraints are present.
- `river_shift_jobs_one_active_per_owner_idx`, owner-created index and state index are present.
- `river_shift_jobs_transition_guard` calls `public.enforce_river_shift_job_transition()`. Its live definition preserves accepted-request immutability (including `analysis_mode`), callback sequence monotonicity, allowed state transitions and terminal-row immutability.
- Owner-read policy uses the scalar-subquery `auth.jwt() ->> 'sub'` check.

These are schema and function-body parity checks for the **post-migration state**. They do not prove that the original remote migration SQL bytes equal the local SQL file bytes; the remote migration-history record exposes version and name, not an immutable source-file blob. The two RiverShift migration identities therefore remain an explicit history-reconciliation task even though the live database has the expected final contract.

### Live RLS and privilege check

Read-only PostgreSQL catalog inspection confirmed:

- RLS is enabled on `catalog_preflights`, `processing_jobs`, `displacement_jobs` and `river_shift_jobs`; `FORCE ROW LEVEL SECURITY` is false on all four.
- Each table has the expected `authenticated` SELECT policy that restricts `owner_uid` to the JWT `sub` value.
- No `anon` or `authenticated` table grant appeared in the live privilege inventory; the trusted `service_role` has table access for the server-side API.
- Security Advisor returned no lints in this recheck.

The API uses privileged server-side access, so the database owner-read policy is not a substitute for API authorization. Every user-facing read must continue to derive the owner UID from the verified Firebase identity and filter by it. Keep these checks in API regression tests.

#

## Live retention and access recheck — pre-migration baseline, read-only 2026-11-06

The active `SARGuardian_Dynamic` project was `ACTIVE_HEALTHY` in `ap-northeast-2`, PostgreSQL 17.11.0. At this pre-migration baseline, seven remote migration rows existed. The following findings led to the bounded forward migration recorded below.

### Access contract

Read-only catalog and privilege queries reconfirmed all four job tables have RLS enabled and `FORCE ROW LEVEL SECURITY` disabled. Each has one `authenticated` SELECT owner policy using the verified JWT `sub` claim in a scalar subquery. The `anon` and `authenticated` database roles currently have no direct SELECT table privilege on these four tables; `service_role` does. This is consistent with the current API-mediated access model, not a grant for browser-direct reads. The API must continue verifying Firebase identity and filtering every user-visible read by that UID.

The Supabase Security Advisor returned no security lints.

### Retention gap — action required before production acceptance

A read-only row-age check found:

| Table | Rows | Oldest created | Retention observation |
|---|---:|---|---|
| `catalog_preflights` | 3 | 2026-11-01 19:02 UTC | All 3 rows already have `expires_at < now()` |
| `processing_jobs` | 2 | 2026-11-01 19:05 UTC | No table-level expiry column |
| `displacement_jobs` | 51 | 2026-10-26 03:30 UTC | No table-level expiry column |
| `river_shift_jobs` | 24 | 2026-11-03 05:31 UTC | No table-level expiry column |

At the pre-migration baseline, no installed `pg_cron` extension or database-side cleanup function/job was found. No external cleanup owner was evidenced.

A more important conflict exists for `catalog_preflights`: its `catalog_preflights_immutable_guard` trigger fires on both UPDATE and DELETE and calls `public.enforce_catalog_preflight_immutable()`, whose current implementation always raises `catalog preflight snapshots are immutable`. Therefore the three expired rows cannot be purged through an ordinary DELETE while this trigger remains unchanged. The `expires_at` field currently acts as expiry metadata, not proof that rows are automatically removed.

A narrow preflight policy has since been applied as a forward migration. Job-table and artifact retention remains intentionally undefined and is not automatically purged.

### Performance advisor observations

The read-only Performance Advisor returned:
- one INFO finding: `processing_jobs.preflight_id` has no covering index;
- four WARN findings for owner-read RLS policies being re-evaluated per row, although the inspected policy expressions already wrap `auth.jwt()` in a scalar subquery; verify the advisor finding against an EXPLAIN/test before changing the policies;
- two INFO unused-index findings on `catalog_preflights_owner_created_idx` and `processing_jobs_state_idx`. Do not remove indexes solely from a low-volume observation.

These are performance observations, not Security Advisor findings. The forward migration later added the expiry lookup index; no policy was changed.



## Forward retention migration — 2026-11-06

The canonical forward migration is maintained at the infrastructure source-of-truth path:

- `infrastructure/supabase/migrations/20261105205909_catalog_preflight_retention.sql`

Its Git blob is `d37e18839e4b143dd3cc8dbbab17f8d2289f17a1`. The imported `apps/api/supabase/` tree remains byte-identical to the Dynamic source snapshot and was intentionally not modified. The migration was applied successfully to live project `ufwjmhivvnoewjsbteey` (API response `success: true`) and verified. It implements a narrowly scoped policy derived from the API's existing default preflight TTL (24 hours):

- Preserve expired catalogue preflight snapshots for a further **7-day support grace period**.
- Once the grace period has elapsed, delete only preflights that are **not referenced** by `processing_jobs`.
- Process no more than 500 rows per daily run; row locks use `SKIP LOCKED`.
- Keep the original immutable guard for all ordinary UPDATE/DELETE operations. A transaction-local, owner-only SECURITY DEFINER purge path is the only exception.
- Schedule one Supabase Cron job, `sarguardian-expired-preflight-cleanup`, daily at **03:20 UTC**.
- No browser role or API `service_role` can execute the purge function directly.

The current live inventory contains three expired preflights: one unreferenced and two referenced by the two existing `processing_jobs` rows. None has been expired for more than seven days yet. Therefore the first scheduled execution is expected to delete **zero** existing rows; the referenced records remain protected regardless of age. The migration does not purge `processing_jobs`, `displacement_jobs`, or `river_shift_jobs`, nor does it delete Google Drive files, GitHub artifacts, raw NISAR source data, or scientific result bundles. Those retention windows require separate explicit policies.

The seven pre-existing remote migration records remain version/name-mismatched with their corresponding source SQL filenames. The new eighth migration is aligned at remote version `20261105205909`. No historical migration repair or old DDL replay was performed; only the new bounded forward migration was applied.

## Safe future CLI operation after Supabase CLI v3

Supabase released CLI v3 on 2 November 2026. The 4 November breaking-change notice says hosted database commands now default to the local stack; use `--remote` for the linked hosted database. Hosted changes ask for confirmation, and unattended CI needs an explicit `--yes`. See the [Supabase CLI v2→v3 migration guide](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3) and [4 November breaking-change notice](https://supabase.com/changelog?types=breaking-change).

Before any future CLI call, inspect and pin the CLI version. A migration-history read should explicitly target the intended remote project with the v3 `--remote` form; do not copy a legacy `--linked` or `--project-ref` command into a new v3 workflow without checking the migration guide. Never add `--yes` to a hosted DDL command until the project ref, change set and approval are verified. The new forward migration was applied through the connected Supabase project tool, not through the CLI; no CLI migration repair or old migration replay was executed. The next `supabase migration list --remote` should show `20261105205909` aligned with the local canonical filename.

## Dedicated SARGuardian-Monorepo Supabase project — verified 2026-11-06

The Monorepo database target is available and healthy:

- Project: SARGuardian-Monorepo
- Project ref: qbmhpdprvxssqinnommz
- Region: Japan/Tokyo (ap-northeast-1)
- API URL: https://qbmhpdprvxssqinnommz.supabase.co
- Organization plan: Free; project cost quote: $0/month
- PostgreSQL: 17.11.0.018
- Project status: ACTIVE_HEALTHY

The project contains the four expected public job tables:
catalog_preflights, processing_jobs, displacement_jobs, and river_shift_jobs.
All four have RLS enabled and were empty at the verification point (zero rows).
Each has an authenticated owner-read policy bound to the JWT sub claim. No
anon/authenticated direct table grant was observed for these job tables.
Security Advisor returned no findings.

### Monorepo remote migration records

The new project reports eight remote migration records. Their recorded names
map to all eight local SQL files under infrastructure/supabase/migrations:

| Remote version | Remote name | Local file stem |
|---|---|---|
| 20261106000844 | 20261017143644_processing_jobs | 20261017143644_processing_jobs |
| 20261106000850 | 20261022203034_displacement_jobs | 20261022203034_displacement_jobs |
| 20261106000856 | 20261023141449_displacement_active_request_guard | 20261023141449_displacement_active_request_guard |
| 20261106000901 | 20261024111404_scientific_request_contract | 20261024111404_scientific_request_contract |
| 20261106000905 | 20261027003643_place_target_contract | 20261027003643_place_target_contract |
| 20261106000909 | 20261103100000_river_shift_jobs | 20261103100000_river_shift_jobs |
| 20261106000923 | 20261104120000_river_shift_analysis_modes | 20261104120000_river_shift_analysis_modes |
| 20261106000928 | 20261105205909_catalog_preflight_retention | 20261105205909_catalog_preflight_retention |

The migration names map, but the remote version values are not the timestamp
prefixes of the local filenames. Treat this as a migration-history identity
mismatch until a read-only Supabase CLI v3 reconciliation is completed. Do not
run db push, replay these migrations, rename remote history, or run db reset
merely because the final schema matches.

### Access and performance notes

- Security Advisor: zero lints.
- Performance Advisor: one unindexed FK finding on processing_jobs.preflight_id;
  four policy-evaluation warnings; and eight unused-index INFO findings on a
  newly provisioned, low-volume database.
- The observed owner policies already express the JWT lookup as a scalar
  subquery. Confirm advisor behavior with query plans before changing them.
- Do not drop indexes based only on unused status while the project is empty.
  Consider the FK index through a reviewed forward migration only if plans or
  expected write patterns justify it.

### Future-object default ACL audit

A read-only query of `pg_default_acl` for both `postgres` and
`supabase_admin` found that future public tables, sequences and functions
inherit privileges for `anon`, `authenticated`, `service_role` and the
owner role. The current four app tables are not granted to `anon` or
`authenticated`; their direct table grants are limited to `postgres` and
`service_role`, and all four have RLS enabled. The default grants apply to
future objects and should not be mistaken for evidence that current job data
is exposed.

Before new public objects are introduced, review a separate forward
default-privilege hardening migration for both object owners. Validate how
future tables, sequences, functions, PostgREST exposure and any Supabase
managed migrations are affected. No default ACL or live schema was changed
during this audit.

### Secret key handling and API integration

The API persistence module supports both a modern opaque sb_secret_ key and a
legacy JWT service_role key. Create a dedicated named secret in Supabase
Dashboard → Settings → API Keys, named sarguardian-monorepo-api. Set it only in
the Monorepo Vercel API Preview environment as SUPABASE_SERVICE_ROLE_KEY.
Keep it out of Frontend variables, GitHub source, workflow logs, and chat.
The Monorepo project does not reuse the Dynamic Production key.

The Dynamic Production Supabase project remains separate and unchanged. This
Monorepo project is the database target for Preview integration and eventual
reviewed cutover; GitHub Actions migration and API dispatch cutover remain
separate acceptance gates.
