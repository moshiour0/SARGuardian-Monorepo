# Production Supabase data migration plan — 2026-11-06

## Decision

The application schema is migrated and aligned, but **Production job data has not been copied**. The active source project is `SARGuardian_Dynamic` (`ufwjmhivvnoewjsbteey`, Osaka) and the isolated target is `SARGuardian-Monorepo` (`qbmhpdprvxssqinnommz`, Tokyo). The source contains 80 records in the four job tables; the target contains zero. Both projects remain active and separate.

This is an intentional hold. The source is the running Production database, and its rows contain account ownership, AOI/request metadata, job state and private Drive artifact receipts. No Production rows were exported, modified, deleted or copied during this audit.

## Aggregate-only source inventory

Observed on 2026-11-06 using read-only counts and aggregate status queries:

| Table | Source rows | Owner count | State / retention detail |
|---|---:|---:|---|
| `catalog_preflights` | 3 | 1 | All 3 expired; 2 are FK-referenced by `processing_jobs`; 1 is unreferenced |
| `processing_jobs` | 2 | 1 | 2 queued metadata rows; neither is an active dispatched worker |
| `displacement_jobs` | 51 | 5 | 36 succeeded, 14 failed, 1 cancelled; 44 have a GitHub run ID; 0 queued/dispatching/running |
| `river_shift_jobs` | 24 | 2 | 4 succeeded, 20 failed; 23 have a GitHub run ID; 0 queued/dispatching/running |
| **Total** | **80** | — | No active Displacement or RiverShift job at the time of this snapshot |

The query returned only counts, distinct-owner counts and state groupings. No owner UID, AOI WKT, artifact URL, result payload or row body was read into this report. See the machine-readable aggregate snapshot at [`migration/supabase-production-data-inventory-2026-11-06.json`](../../migration/supabase-production-data-inventory-2026-11-06.json).

## Schema compatibility

The four source and target public tables were compared read-only:

| Table | Source columns | Target columns | RLS | Result |
|---|---:|---:|---|---|
| `catalog_preflights` | 7 | 7 | enabled | Match |
| `processing_jobs` | 13 | 13 | enabled | Match |
| `displacement_jobs` | 28 | 28 | enabled | Match |
| `river_shift_jobs` | 27 | 27 | enabled | Match |

All four table names, all column names/counts, RLS enablement and the FK contract match. The FK is `processing_jobs.preflight_id → catalog_preflights.id`. The target is schema-compatible for a controlled metadata migration, but schema parity alone is not a data migration.

## Data preservation rules

1. **Take a source backup/snapshot first.** Use an authenticated, encrypted, out-of-repository transfer method. Do not export database rows into GitHub issues, commit history or ChatGPT.
2. **Use a cutover snapshot, not this staleable row count.** Recheck source row counts, states, owner counts and active states immediately before import. The source may continue to receive writes until a controlled freeze.
3. **Preserve identity and ownership.** Keep primary UUIDs, `owner_uid`, idempotency keys, request fingerprints, callback sequence numbers, timestamps, accepted request snapshots, result summaries, artifact manifests and error/status metadata unchanged.
4. **Import in dependency order:** `catalog_preflights` → `processing_jobs` → `displacement_jobs` → `river_shift_jobs`. Preserve the two expired preflight rows referenced by queued processing records. The unreferenced expired preflight remains subject to the existing expiry/grace-period cleanup policy; do not weaken retention to keep it indefinitely.
5. **Never re-dispatch imported rows.** The two legacy `processing_jobs` entries are queued metadata, not an instruction to create new NISAR downloads. Import them as metadata only unless the owner separately authorizes a new processing request.
6. **Keep worker-run provenance.** The 44 Displacement and 23 RiverShift non-null GitHub run IDs/URLs in the current source point to historical Backend runs. At this snapshot all Displacement/RiverShift states are terminal, so they do not need live-run polling. If a later final snapshot contains any `dispatching` or `running` job, let it finish on the original Backend or explicitly preserve its original repository/ref before redirecting API status polling.
7. **Keep Drive artifacts external.** Supabase stores Drive file IDs, byte/SHA receipts and artifact metadata; the binary artifacts remain in Drive. Do not redownload/reupload raw NISAR data as a side effect of job-row migration. Verify read access to successful result objects using the intended Monorepo API Drive identity before cutover.
8. **Verify before switching.** Compare per-table counts, distinct-owner counts, state histograms, primary-key sets/checksums, FK references, request fingerprints, callback sequences and artifact receipt structure. Test result retrieval for a successful Displacement and RiverShift job. Keep the original Production project read-only/available for rollback.

## Important runtime dependencies

- Current Displacement and RiverShift status polling uses the configured GitHub repository when it looks up a `github_run_id`. Old run IDs belong to `moshiour0/SARGuardian-backend`. This is safe for the observed snapshot because all 75 Displacement/RiverShift rows are terminal; recheck at cutover. Never assume a run ID can be queried in Monorepo merely because the job row was copied.
- Successful Displacement dashboard/artifact routes use stored Drive artifact IDs and checksums. RiverShift artifact retrieval uses the stored `artifact_manifest` Drive IDs, byte count and SHA-256. The Monorepo API therefore needs an authorized Drive reader that can still access the existing result folder.
- Generic/author-exact Known Place history lives in GitHub Actions runs/artifacts, not in these four Supabase tables. Keep Backend run URLs/artifacts available as historical evidence; new Monorepo Known Place requests create new Monorepo runs.

## Remaining blocker and safety boundary

The target service-role key is not yet provisioned, source DB credentials are not available through the current connected tools, and a secure row-transfer executor is not configured. The target currently has four empty RLS-enabled tables. Therefore this document defines the safe procedure; **no row transfer has been executed**. The current Production project remains untouched. Data migration must be performed in a controlled cutover window after backup, credential setup, owner approval and a tested rollback plan—not by an ad-hoc SQL read/copy.
