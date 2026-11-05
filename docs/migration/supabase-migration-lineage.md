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

Do not assume that matching SQL content or table structure makes the migration-history records interchangeable. Supabase CLI migration matching uses the migration version, and a version mismatch can make an already-applied migration appear pending.

Before any future database write:
1. run read-only `supabase migration list --linked` and compare it with the exact Monorepo migration files;
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
