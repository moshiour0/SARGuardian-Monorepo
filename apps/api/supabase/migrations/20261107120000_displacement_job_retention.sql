-- Keep terminal archive records for 60 days, then remove them automatically.
begin;

create index if not exists displacement_jobs_retention_idx
  on public.displacement_jobs (created_at)
  where state in ('failed', 'cancelled', 'succeeded');

create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'sarguardian-purge-displacement-jobs',
  '0 3 * * *',
  $job$
    delete from public.displacement_jobs
    where created_at < now() - interval '60 days'
      and state in ('failed', 'cancelled', 'succeeded');
  $job$
)
where not exists (
  select 1
  from cron.job
  where jobname = 'sarguardian-purge-displacement-jobs'
);

commit;
