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

## Default privileges for future public objects — hardened

Forward migration
`infrastructure/supabase/migrations/20261106064055_20261106100000_public_default_privileges_hardening.sql`
was applied successfully to this Monorepo Preview database and its effects
were verified with a transactional create/check/rollback probe.

For future objects **created by role `postgres`**:
- Future public tables: default grants to `anon` and `authenticated` are revoked.
- Future public sequences: default grants to `anon` and `authenticated` are revoked.
- Future functions: schema-scoped grants to `anon` and `authenticated` are revoked, and PostgreSQL's global default `PUBLIC EXECUTE` grant is revoked for functions created by `postgres`.
- Existing default grants for `service_role` are preserved. The API still uses its server-only role.
- Existing table ACLs, policies, functions and trigger definitions are not rewritten by this migration.

The post-apply probe created one temporary public table, sequence and function
inside a transaction. `has_table_privilege`, `has_sequence_privilege` and
`has_function_privilege` confirmed that neither browser role inherited
privileges while `service_role` retained the required grants. The transaction
was rolled back; no probe object remains. Security Advisor still reports zero
findings.

**Scope limitation:** the connection runs as `postgres` and cannot
`SET ROLE supabase_admin`. Supabase-managed future objects created by
`supabase_admin` retain the provider's default privileges. This migration
does not change `supabase_admin` defaults, global role membership or existing
managed objects. Keep application-created objects owned by `postgres`, enable
RLS on every new table, and explicitly grant only the roles each object
requires. The current app tables still have no direct `anon` or
`authenticated` table grants.

## Migration history reconciliation

The project reports nine remote migration records. The local deployment filenames have now been aligned to the exact remote version prefixes and recorded names in `migration/supabase-history-alignment.json`. The seven imported SQL blobs remain byte-identical to their immutable source-snapshot originals; the retention and default-privilege forward migrations retain their reviewed hashes. Only local filenames changed. No remote history row was repaired and no old DDL was replayed. Confirm the local/remote timestamp comparison with `supabase migration list --remote=qbmhpdprvxssqinnommz` after authenticated CLI access; do not run `db push` until the read-only list reports all nine matched.

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
