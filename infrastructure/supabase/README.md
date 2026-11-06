# SARGuardian-Monorepo Supabase target

- Project name: SARGuardian-Monorepo
- Project ref: qbmhpdprvxssqinnommz
- Region: Japan/Tokyo (ap-northeast-1)
- URL: https://qbmhpdprvxssqinnommz.supabase.co
- Organization plan: Free; quoted project cost: $0/month
- PostgreSQL: 17.11.0.018

The four expected job tables are present with RLS enabled. They were empty at
the read-only verification point. The project reports eight remote migration
records; their names map to all eight local migration files, but remote version
values do not match local filename prefixes. Follow the reconciliation gate in
docs/migration/supabase-migration-lineage.md. Do not run db push, replay
migrations or reset the database until the remote history has been reconciled.

The config.toml in this directory is retained as an exact imported source
configuration. Do not infer the remote target from its historical project_id.
All CLI operations must explicitly target project ref qbmhpdprvxssqinnommz.

The Vercel API requires a server-only SUPABASE_SERVICE_ROLE_KEY. Create a
dedicated sb_secret_ key in Dashboard → Settings → API Keys, named
sarguardian-monorepo-api. Never put it in Web env, source control, Actions logs
or chat.
