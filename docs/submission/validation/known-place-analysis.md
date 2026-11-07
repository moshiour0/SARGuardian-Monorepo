# Known Place Analysis — Validation Protocol

**Workflow:** generic two-polygon measurement  
**Primary NISAR source:** GOFF pixel offsets  
**Separate research path:** author-exact P05023 benchmark reconstruction

## Reproducible software evidence

- [Generic Monorepo AOI run #42321054100](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42321054100) completed the generic workflow and retained its result package. The run status was PARTIAL_SCIENTIFIC_METRICS.
- [Snapshot Regression #42327901627](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42327901627) passed the promoted Known Place API, engine, workflow-contract and frontend regression suites on the PR #8 head.

The CI run validates code and contracts. The generic run validates that this selected request completed and produced retained outputs; it does not prove every pair has enough reference support or establish hazard detection.

## Generic two-polygon verification

1. Record the exact AOI, Measurement Polygon, Reference Polygon, date window and source product IDs.
2. Confirm that polygon geometry is valid and that no hole or multipart geometry is silently discarded.
3. Confirm that every pair belongs to a compatible processing chain and matching grid/geometry basis.
4. Inspect valid offset pixels and quality masks in each polygon separately.
5. Verify that the Measurement Polygon is not included in the background/reference sample.
6. Inspect reference support, median and spread diagnostics before interpreting a relative measurement.
7. Verify that a per-pair horizontal displacement magnitude is divided by the exact acquisition-midpoint interval to produce the interval-average rate.
8. Inspect the optional spatial block-bootstrap interval only when the engine status is COMPUTED_EXPLORATORY and the minimum block count passes.
9. Confirm that insufficient support produces an explicit no-result/withheld interval rather than a numeric zero.
10. Trace the final report and artifact manifest to the exact workflow run.

## Interpretation contract

The reference polygon is a comparison region; its stability is not independently proven by drawing it. A reported horizontal rate is pairwise and interval-average. It is not instantaneous, cumulative, vertical, downslope or 3-D velocity.

The spatial block-bootstrap interval quantifies conditional spatial sampling variation only. It is not a total error budget, reference-stability assessment or hazard probability.

## Separate P05023 benchmark verification

The author-selected P05023 research reproduction is distinct from the generic polygon workflow. Verify the exact five source-pair identities, acquisition dates, track/direction/polarization, release identity and source checksums. The current reconstruction has headline numerical agreement near 0.96 m and 4 cm/day, with supporting product and table checks recorded in the engine evidence pack.

Describe this as **benchmark reconstruction evidence**. Do not claim full paper reproduction unless the exact editable author crown geometry and all author-side null/control procedures are independently matched.

## Sources

- [Known Place engine documentation](../../../engines/known-place/README.md)
- [Bhote Koshi author paper record](https://doi.org/10.21203/rs.3.rs-11022365/v1)
- [NISAR GOFF guide](https://nisar-docs.asf.alaska.edu/goff/)
