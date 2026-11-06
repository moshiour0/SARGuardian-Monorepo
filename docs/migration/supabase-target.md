# SARGuardian-Monorepo Supabase target

## Dedicated Preview/staging database

- Project name: SARGuardian-Monorepo
- Project ref: qbmhpdprvxssqinnommz
- Region: Japan/Tokyo (ap-northeast-1)
- API URL: https://qbmhpdprvxssqinnommz.supabase.co
- Organization plan: Free; quoted project cost: $0/month
- PostgreSQL: 17.11.0.018
- Current project state: ACTIVE_HEALTHY

All CLI commands must explicitly target project ref qbmhpdprvxssqinnommz.
The imported infrastructure/supabase/config.toml is retained as an exact
source configuration; do not infer the target from its historical project_id.

## Schema and access verification

The four expected job tables are present and were empty at read-only
verification:

- catalog_preflights
- processing_jobs
- displacement_jobs
- river_shift_jobs

All four have RLS enabled. Their current table ACLs grant access to postgres
and service_role; anon and authenticated do not have direct table SELECT,
INSERT or UPDATE privileges. Four authenticated owner-read RLS policies are
present but require a table grant before direct authenticated PostgREST access.
The application API uses the server-only service key, not browser-side table
access.

The daily sarguardian-expired-preflight-cleanup pg_cron job is active at
03:20 UTC. It runs public.purge_expired_catalog_preflights(). That function is
SECURITY DEFINER, owned by postgres, has an empty search_path, and is not
executable by anon, authenticated or service_role.

Security Advisor returned zero findings. Performance Advisor reports one
unindexed FK (processing_jobs.preflight_id), four auth_rls_initplan notices,
and eight unused-index INFO findings. The owner policies already wrap
auth.jwt() in a scalar SELECT. Do not change these policies or drop unused
indexes without query-plan evidence. A reviewed forward migration may add the
FK index if query plans or expected delete/update volume justify it.

## Default privileges for future public objects

A direct read-only catalog query inspected `pg_default_acl` for both object
owners `postgres` and `supabase_admin`. The current default ACLs include
`anon`, `authenticated`, `service_role` and the owner roles for future
public tables, sequences and function EXECUTE. This is distinct from the
current four app tables: those tables grant access only to `postgres` and
`service_role`; `anon` and `authenticated` have no direct table grants.

This does not demonstrate current table exposure. It is a future-object risk:
a new public table without RLS could inherit direct PostgREST grants, and a
new function can inherit EXECUTE grants for browser roles. No live ACL was
changed. Before creating additional public objects, review a forward
`ALTER DEFAULT PRIVILEGES` migration for both object owners, verify which
roles the application needs, and test Supabase-managed migrations/functions.
Keep the service-role key server-side and continue enforcing `owner_uid`
filters in API persistence methods.

## Migration history reconciliation

The project reports eight remote migration records whose names map to the
eight local SQL files under infrastructure/supabase/migrations. Remote version
values do not match the timestamp prefixes of local filenames. Treat this as
a history identity mismatch until a read-only Supabase CLI v3 reconciliation
is completed. Do not run db push, replay migrations, rename remote history or
db reset merely because the final schema matches.

See docs/migration/supabase-migration-lineage.md for the complete migration
version/name table and verification details.

## Server key

The API persistence module supports both modern opaque sb_secret_ keys and
legacy service_role JWTs. The current API Preview environment inventory has
SUPABASE_URL configured but no SUPABASE_SERVICE_ROLE_KEY. Create a dedicated
named secret key in Supabase Dashboard → Settings → API Keys, with name
sarguardian-monorepo-api. Put it only in the Monorepo Vercel API Preview
environment as SUPABASE_SERVICE_ROLE_KEY. Do not paste the value into chat or
commit it. Never expose it to the Web project, source control,
GitHub Actions logs or chat. The new Monorepo project does not reuse the
Dynamic Production key.

The Dynamic Production Supabase project remains unchanged. This project is
for Monorepo Preview integration and eventual reviewed cutover.
