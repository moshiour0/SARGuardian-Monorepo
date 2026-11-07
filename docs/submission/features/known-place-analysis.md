# Known Place Analysis

**Workflow:** Known Place Analysis  
**Measurement design:** User-defined Measurement Polygon + Reference Polygon  
**Primary NISAR source:** GOFF pixel offsets

## What it does

Known Place Analysis is a location-defined measurement workflow. The user supplies a Measurement Polygon around the place to quantify and a separate Reference Polygon used to estimate the local background/reference behaviour. This is intentionally separate from Find Displacements: Find Displacements discovers candidate locations across an AOI; Known Place measures a selected location against a separately supplied reference region.

The reference polygon is a user-selected comparison region. Its geometric separation from the measurement polygon does not independently prove that the reference is stable.

## Generic two-polygon path

1. Select compatible GOFF acquisitions for the requested AOI and time range.
2. Draw the Measurement Polygon.
3. Draw the Reference Polygon.
4. Validate polygon geometry, source-product identity and valid raster support.
5. Extract and quality-screen the offsets in both regions.
6. Estimate relative horizontal displacement for each eligible pair.
7. Divide pairwise displacement magnitude by the exact acquisition-midpoint interval to report an interval-average rate where the pair is measurable.
8. Review per-pair support, uncertainty availability and the source manifest.

The rate is pairwise and interval-average. It is not an instantaneous velocity, a continuous cumulative displacement history or a 3-D movement vector.

## Reproducibility evidence

The generic Monorepo workflow completed [run #42321054100](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42321054100) and retained its result package. This was a generic AOI run using four GOFF products. The result was marked **PARTIAL_SCIENTIFIC_METRICS**: the workflow completed, but not every track/pair had sufficient reference support. It was not an author-exact paper reproduction and it did not evaluate hazard detection.

The [Snapshot Regression run #42327901627](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42327901627) passed the promoted Known Place API, engine, workflow-contract and frontend test jobs.

The PR #8 branch also exposes the spatial block-bootstrap interval when the engine reports **COMPUTED_EXPLORATORY** and the minimum independent block gate passes. The interval is conditional spatial-sampling uncertainty only; it is not a total error budget and is not a hazard probability. When the block gate is insufficient, no numeric interval is displayed. This behaviour is covered by the API and frontend regression tests in PR #8.

## Separate author-exact research path

The author-exact research workflow is separate from generic two-polygon measurement. The Bhote Koshi benchmark is pinned to the author-selected **P05023** release and the matching acquisition configuration; a different CRID or processing revision is not silently substituted.

The current P05023 reconstruction reproduces the headline displacement magnitude and interval-average rate near the paper's reported values (approximately **0.96 m** and **4 cm/day**) and passes the documented source/product and table-level checks. The exact author crown polygon and all author-side null/control generation details are not fully reconstructed as an editable, byte-identical method implementation. Therefore, headline numerical agreement should be described as **benchmark reconstruction evidence**, not as proof that every element of the complete paper experiment has been replicated.

## What to show a judge

- The two distinct polygons and the role of each.
- The exact product ID, acquisition dates, track/direction and source release.
- A pair result with the valid support and any reported uncertainty interval.
- The interpretation of the pairwise rate as an average over the acquisition interval.
- The separate author-exact P05023 benchmark path, without merging it with generic AOI processing.

## Scientific interpretation

Known Place is a measurement and research-reproduction workflow, not an operational landslide/glacier-collapse warning system. A result depends on the stability and representativeness of the reference region, source-product comparability, spatial support and the assumptions of the chosen geometry. A measurement PASS is not automatically a hazard classification or independent validation.

## Source references

- [Known Place engine and documentation](../../../../engines/known-place/README.md)
- [Known Place Monorepo workflow](https://github.com/moshiour0/SARGuardian-Monorepo/actions/workflows/know-place-aoi-analysis.yml)
- [Bhote Koshi author paper record](https://doi.org/10.21203/rs.3.rs-11022365/v1)
- [NISAR GOFF product guide](https://nisar-docs.asf.alaska.edu/goff/)
