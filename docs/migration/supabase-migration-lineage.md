# Supabase migration lineage and Monorepo ownership

**Source:** `moshiour0/SARGuardian_Dynamic@dd64b7adc90594f1d7f316b352e39fbac2013cb6`  
**Promoted destination:** `infrastructure/supabase/`  
**Status:** exact source files promoted; live database remains untouched.

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

The existing Supabase project `SARGuardian_Dynamic` currently reports these seven remote migration records:

| Remote version | Remote recorded name | Matching local source file |
|---|---|---|
| `20261026023221` | `20261017143644_processing_jobs` | `20261017143644_processing_jobs.sql` |
| `20261026023229` | `20261022203034_displacement_jobs` | `20261022203034_displacement_jobs.sql` |
| `20261026023233` | `20261023141449_displacement_active_request_guard` | `20261023141449_displacement_active_request_guard.sql` |
| `20261026023237` | `20261024111404_scientific_request_contract` | `20261024111404_scientific_request_contract.sql` |
| `20261027003643` | `place_target_contract` | `20261027003643_place_target_contract.sql` |
| `20261103021845` | `river_shift_jobs` | `20261103100000_river_shift_jobs.sql` |
| `20261103230606` | `river_shift_analysis_modes_phase2` | `20261104120000_river_shift_analysis_modes.sql` |

The first four records have a remote `version` that differs from the timestamp embedded in the local filename. The final two RiverShift records also have timestamp and/or recorded-name differences. The actual schema/functions and analysis-mode constraints were read and checked against the migration intent, but this is not a migration-history reconciliation.

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

## Live retention and access recheck — read-only 2026-11-06

The active `SARGuardian_Dynamic` project remains `ACTIVE_HEALTHY` in `ap-northeast-2`, PostgreSQL 17.11.0. The seven remote migration rows are unchanged from the mapping above. No migration history repair, DDL, row deletion, or extension installation was performed.

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

No installed `pg_cron` or `pg_net` extension was reported; no `cron`/`net` schema job objects or public function named for retention, cleanup, expiry, purge, or old-row deletion were found in the read-only checks. This does not rule out an external scheduler, but no such external cleanup owner has yet been evidenced.

A more important conflict exists for `catalog_preflights`: its `catalog_preflights_immutable_guard` trigger fires on both UPDATE and DELETE and calls `public.enforce_catalog_preflight_immutable()`, whose current implementation always raises `catalog preflight snapshots are immutable`. Therefore the three expired rows cannot be purged through an ordinary DELETE while this trigger remains unchanged. The `expires_at` field currently acts as expiry metadata, not proof that rows are automatically removed.

Before production acceptance, define the intended retention windows for each job table and retained artifact, identify the scheduler/cleanup owner, and design a narrow, auditable purge path that preserves immutable request/result evidence until expiry and respects foreign-key references. Any trigger/function or index change must be delivered as a reviewed forward migration with a test plan and backup/rollback path. Do not disable the immutability guard, install a scheduler, or delete rows ad hoc.

### Performance advisor observations

The read-only Performance Advisor returned:
- one INFO finding: `processing_jobs.preflight_id` has no covering index;
- four WARN findings for owner-read RLS policies being re-evaluated per row, although the inspected policy expressions already wrap `auth.jwt()` in a scalar subquery; verify the advisor finding against an EXPLAIN/test before changing the policies;
- two INFO unused-index findings on `catalog_preflights_owner_created_idx` and `processing_jobs_state_idx`. Do not remove indexes solely from a low-volume observation.

These are performance observations, not Security Advisor findings. No index or policy was changed in this recheck.



## Forward retention migration — 2026-11-06

Two identical copies of the new forward migration are maintained at the active API's configured migration path and the infrastructure source-of-truth path:

- `apps/api/supabase/migrations/20261106120000_catalog_preflight_retention.sql`
- `infrastructure/supabase/migrations/20261106120000_catalog_preflight_retention.sql`

The migration implements a narrowly scoped policy derived from the API's existing default preflight TTL (24 hours):

- Preserve expired catalogue preflight snapshots for a further **7-day support grace period**.
- Once the grace period has elapsed, delete only preflights that are **not referenced** by `processing_jobs`.
- Process no more than 500 rows per daily run; row locks use `SKIP LOCKED`.
- Keep the original immutable guard for all ordinary UPDATE/DELETE operations. A transaction-local, owner-only SECURITY DEFINER purge path is the only exception.
- Schedule one Supabase Cron job, `sarguardian-expired-preflight-cleanup`, daily at **03:20 UTC**.
- No browser role or API `service_role` can execute the purge function directly.

The current live inventory contains three expired preflights: one unreferenced and two referenced by the two existing `processing_jobs` rows. None has been expired for more than seven days yet. Therefore the first scheduled execution is expected to delete **zero** existing rows; the referenced records remain protected regardless of age. The migration does not purge `processing_jobs`, `displacement_jobs`, or `river_shift_jobs`, nor does it delete Google Drive files, GitHub artifacts, raw NISAR source data, or scientific result bundles. Those retention windows require separate explicit policies.

The old seven remote migration records remain version/name-mismatched with their corresponding pre-existing local SQL filenames. This new forward migration uses a fresh timestamp and is not an attempt to rewrite or repair those old records. The forward migration should be applied once and then verified through `list_migrations`, `cron.job`, `cron.job_run_details`, the trigger/function catalog, and before/after row counts.

## Safe future CLI operation after Supabase CLI v3

Supabase released CLI v3 on 2 November 2026. The 4 November breaking-change notice says hosted database commands now default to the local stack; use `--remote` for the linked hosted database. Hosted changes ask for confirmation, and unattended CI needs an explicit `--yes`. See the [Supabase CLI v2→v3 migration guide](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3) and [4 November breaking-change notice](https://supabase.com/changelog?types=breaking-change).

Before any future CLI call, inspect and pin the CLI version. A migration-history read should explicitly target the intended remote project with the v3 `--remote` form; do not copy a legacy `--linked` or `--project-ref` command into a new v3 workflow without checking the migration guide. Never add `--yes` to a hosted DDL command until the project ref, change set and approval are verified. No CLI migration command or remote DDL was run during this recheck.
