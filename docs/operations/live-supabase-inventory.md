# Live Supabase inventory — read-only audit

**Audited:** 2026-11-05  
**Project:** `SARGuardian_Dynamic` (`ufwjmhivvnoewjsbteey`)  
**Region:** `ap-northeast-2`  
**Database:** PostgreSQL 17.11.0.003  
**Change scope:** read-only queries only; no SQL or migration was applied.

## Project and tables

The connected Supabase project inventory returned one active healthy SARGuardian project, `SARGuardian_Dynamic`.

| Public table | Approx. rows at audit | RLS enabled | Purpose |
|---|---:|---|---|
| `catalog_preflights` | 3 | Yes | Immutable ASF preflight manifest metadata |
| `processing_jobs` | 2 | Yes | Durable metadata for GUNW/GOFF processing jobs |
| `displacement_jobs` | 50 | Yes | Authenticated displacement requests and signed callbacks |
| `river_shift_jobs` | 23 | Yes | Independent GCOV engine requests and callback receipts |

The listed approximate row counts are live values at audit time, not a frozen data snapshot.

## Row access and API ownership

The database has one `SELECT` owner policy per table for the `authenticated` role:
`(select auth.jwt() ->> 'sub') = owner_uid`.

Read-only privilege inspection showed:
- `anon` has no SELECT privilege on these tables.
- `authenticated` has no SELECT privilege on these tables.
- the server-only `service_role` has table access used by the Dynamic API.
- RLS is enabled on all four tables; it is not FORCE RLS.

The browser is not intended to query these tables directly. The active API initializes a server-side Supabase client with `SUPABASE_SERVICE_ROLE_KEY`; the service layer's user-facing read methods explicitly filter by verified Firebase `owner_uid` for preflights, processing jobs, displacement jobs, and RiverShift jobs. Signed worker callbacks use separate callback authentication and conditional state/sequence updates.

**Security implication:** because the API uses a privileged server role, owner isolation depends on the API consistently deriving the owner UID from the verified Firebase identity and including it in every user-facing read. Keep those filters in code review and tests; the database's authenticated SELECT policy does not constrain a service-role query.

Supabase security advisor returned **no security lints** at audit time. This is not a guarantee that every API-level authorization path is correct.

## Migration history observed remotely

The remote migration-history table returned seven entries:

| Remote version | Recorded name |
|---|---|
| `20261026023221` | `20261017143644_processing_jobs` |
| `20261026023229` | `20261022203034_displacement_jobs` |
| `20261026023233` | `20261023141449_displacement_active_request_guard` |
| `20261026023237` | `20261024111404_scientific_request_contract` |
| `20261027003643` | `place_target_contract` |
| `20261103021845` | `river_shift_jobs` |
| `20261103230606` | `river_shift_analysis_modes_phase2` |

The source migration directory currently contains seven files, including:
- `20261103100000_river_shift_jobs.sql`
- `20261104120000_river_shift_analysis_modes.sql`

The last two local filename prefixes and recorded remote versions do not match, and the recorded remote names differ from those local suffixes. Their resulting database structures and functions were inspected and match the source intent at the schema level:
- `analysis_mode` permits `general_scan` and `event_based`;
- `general_scan` requires a NULL `event_date`;
- `event_based` requires an in-window `event_date`;
- 366-day window and threshold range checks exist;
- the one-active-job-per-owner unique partial index exists;
- immutable accepted request fields, callback sequence checks, state transitions, and terminal immutability are enforced by the transition trigger.

This is **migration-history naming/version drift**, not evidence that the live schema is missing those features. Before any future `supabase db push` or deployment operation, compare the local/remote CLI migration list and reconcile version history explicitly. Do not reapply or rename already-applied SQL blindly.

## No migration performed

No table, column, index, trigger, policy, extension, privilege, row, or migration-history entry was changed by this audit. Supabase remains the existing production data store; the Monorepo should reuse it during first Preview only after environment mapping, not create a new database or migrate live rows.
