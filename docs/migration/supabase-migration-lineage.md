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

### Safe future CLI operation after Supabase CLI v3

Supabase released CLI v3 on 2 November 2026. The 4 November breaking-change notice says hosted database commands now default to the local stack; use `--remote` for the linked hosted database. Hosted changes ask for confirmation, and unattended CI needs an explicit `--yes`. See the [Supabase CLI v2→v3 migration guide](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3) and [4 November breaking-change notice](https://supabase.com/changelog?types=breaking-change).

Before any future CLI call, inspect and pin the CLI version. A migration-history read should explicitly target the intended remote project with the v3 `--remote` form; do not copy a legacy `--linked` or `--project-ref` command into a new v3 workflow without checking the migration guide. Never add `--yes` to a hosted DDL command until the project ref, change set and approval are verified. No CLI migration command or remote DDL was run during this recheck.
