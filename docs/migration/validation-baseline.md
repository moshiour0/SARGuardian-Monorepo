# Snapshot regression validation baseline

**Run:** [GitHub Actions run 41956286197](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41956286197)  
**Commit:** `0fccd71c2fff031c94770f4d284990cb8f8aaa86`  
**Result:** all 7 jobs passed.  
**Scope:** immutable source snapshots executed from their preserved original paths; this is not yet validation of relocated `apps/` and `engines/` destinations.

## Job results

| Job | Result | Test evidence |
|---|---|---|
| Dynamic frontend | PASS | 20 test files, 155 tests passed; TypeScript build and ESLint passed |
| Dynamic active API | PASS | 215 tests passed; Google Maps dashboard adapter contract passed |
| Backend worker + Find Displacements/dashboard | PASS | 336 tests passed, 1 skipped |
| Known Place PR #85 | PASS | 318 tests passed; compileall passed |
| RiverShift GCOV worker | PASS | 259 tests passed; compileall passed |
| NISAR science main | PASS | 180 tests passed |
| Exact source blob/history integrity | PASS | 1,084/1,084 tracked entries exact; six ancestry/snapshot checks passed |

**Total:** 1,463 tests passed, 1 skipped. Warnings were emitted by some scientific/geospatial test suites; no job failed because of them.

## Exact source integrity

The integrity job used a full-history checkout and compared every source tree entry against the matching target prefix:
- path;
- Git file mode;
- Git object type;
- Git blob SHA.

It also verified that:
- Known Place feature base `bd7a59c54ddae7c19fd88896e877c3a530b43d9e` is an ancestor of imported PR #85 head `bfde7dde8ada92a03054cd8dbad8daa7a5c119f8`;
- NISAR pin `ab547ecc82bcc4d6ccef545a59852536c2beacc6` is an ancestor of NISAR science main `9fcb543ef28a7f6fe70a379aed9cfe3e43e277ec`.

## Corrections made during CI bootstrap

- The first Known Place test environment omitted SciPy; the environment was corrected and the complete targeted suite then passed.
- The first NISAR test attempt ran all 180 tests successfully but a post-job pip-cache hook failed because `--no-cache-dir` prevented cache creation. The workflow was corrected; the complete job then passed.
- Source manifest metadata initially omitted the explicit `commit` field for three historical refs; corrected and validated by the migration metadata workflow.

These are harness/configuration corrections only. No source science algorithm was changed to obtain green CI.

## Acceptance limitations

This green result establishes that:
- the imported snapshots are exact;
- their existing tests can be executed from the snapshot locations;
- basic build/test dependencies are reproducible in the new repository's isolated CI.

It does **not** yet establish:
- test parity after relocating code under final `apps/` and `engines/` paths;
- all 42 workflows are ready to execute in the new repository;
- production Vercel, Supabase, Google Drive, ASF, or callback configuration is ready to switch;
- a scientific output has received independent geophysical validation.

The next acceptance stage is collision resolution and path-promotion tests, followed by workflow dependency/dispatch tracing.
