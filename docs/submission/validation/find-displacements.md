# Find Displacements — Validation Protocol

**Scope:** target-free AOI-wide candidate discovery for Landslide and Glacier Movement study areas.  
**NISAR products:** GOFF and GUNW, treated as separate measurement families.

## What this validation establishes

The Find Displacements workflow validates the AOI/product-processing chain, screens GOFF offset behaviour for candidate anomalies and runs relative GUNW LOS diagnostics only when a compatible network supports them.

A workflow pass establishes that the tested processing contract completed. It does not independently establish that every candidate is a landslide, glacier failure or hazardous movement.

## Reproduction evidence

- [Backend processing run #42097077601](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601) completed the selected AOI processing chain, recovered one failed GUNW product through a failed-only retry, assembled the dashboard and reported a terminal callback.
- [Monorepo Snapshot Regression #42327901627](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42327901627) passed the Find Displacements engine regression job on the tested PR #8 head.

## Validation checklist

1. Record the exact AOI geometry/hash, requested date window and selected source granule names.
2. Verify that every source product is the expected NISAR product family and that its orbit/track, polarization, maturity, acquisition interval and processing release are recorded.
3. Inspect GOFF quality support, finite range/azimuth offsets, correlation/SNR filters and the local-background/floor outputs. Keep the two offset components and their units visible.
4. Inspect GUNW separately: phase-to-LOS conversion, coherence/connected-component/ionosphere masks, pair references and temporal-network support.
5. Confirm that incompatible products are not fused and that missing support remains NoData/withheld rather than zero.
6. Trace each displayed candidate to its exact source pair, processing report and result artifact.
7. Confirm that retry logic retries only failed/unverified products and that successful products are not downloaded again.
8. Review the map layer labels: candidate offset anomaly, relative LOS diagnostic, and not a confirmed hazard.

## Interpretation contract

- GOFF offsets are pairwise range/along-track observations. An anomaly is a location for review, not an automatic velocity.
- GUNW reports LOS displacement/rate under its reference policy. LOS is not automatically vertical, downslope, cumulative or 3-D displacement.
- Structural/provenance PASS is not independent geophysical validation.
- A candidate is not a confirmed landslide or glacier failure.

## Evidence and reviewer notes

The code-level science audit is maintained at [Find Displacements science-script audit](../../scientific-validation/find-displacements/README.md). It is the detailed method register; this protocol is the reproducible validation entry point for feature review.

For stronger physical validation, use independent positive and non-event/null AOIs, held-out periods, injected-motion tests with correlated-noise controls and suitable field/GNSS evidence. Do not describe those experiments as completed unless there is a retained report for the exact test.
