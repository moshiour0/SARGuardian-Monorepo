# Landslide Screening — Find Displacements

**Product path:** Landslide  
**Engine:** Find Displacements  
**Challenge fit:** Dancing with the SARs — Earth Science

## What it does

Find Displacements scans a user-selected WGS84 area of interest and date window for candidate surface-displacement signals. The user does not need to know the target point or exact movement location in advance. The engine discovers eligible observations and screens the AOI for spatially unusual offset behaviour.

This is a candidate-discovery workflow. It does not classify every anomaly as a landslide, issue a hazard probability or predict a failure time.

## NISAR measurements

The workflow keeps two product families separate:

- **GOFF:** pairwise range and along-track pixel offsets. These support spatial offset-anomaly screening after product-quality checks and local-background/floor diagnostics.
- **GUNW:** unwrapped phase converted to relative line-of-sight displacement. Pixel-stack diagnostics are only available when the selected products form a sufficiently compatible observation network.

A GOFF offset magnitude is not a 3-D ground-motion vector. A GUNW LOS rate is not automatically downslope, vertical or cumulative movement. The two are presented as different measurement families, not fused into an unsupported velocity.

## User journey

1. Select Landslide and draw or provide a WGS84 AOI.
2. Choose an observation date window.
3. Discover available NISAR GUNW/GOFF products intersecting the AOI.
4. Apply product, geometry and valid-pixel quality checks.
5. Run target-free GOFF candidate screening; run GUNW LOS diagnostics only when the compatible stack supports them.
6. Review candidate locations, source acquisitions, quality evidence and the observation-specific result package.

The same AOI-wide workflow can be reused for different slope settings when the selected NISAR products and observation geometry are suitable.

## Reproducible evidence

[Backend Find Displacements run #42097077601](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601) completed successfully. The run recovered one failed GUNW product through a failed-only retry, continued dashboard assembly and reported the terminal callback. Successful recovery is part of the recorded workflow history; a retry does not erase the initial failure event.

The Monorepo [Snapshot Regression run #42327901627](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42327901627) also passed the Find Displacements engine regression job on the Known Place PR #8 head.

## What to show a judge

- Start with the AOI, not a preselected target point.
- Show the source acquisition list and which products passed compatibility checks.
- Show GOFF candidate evidence separately from any GUNW LOS diagnostic.
- Open one candidate and trace it to its acquisition pair and processing report.
- Explain that an anomaly is a candidate for geological review, not a confirmed landslide.

## Scientific interpretation

A candidate is useful because it narrows where a reviewer should look next. The strength of an interpretation depends on the selected product family, observation geometry, quality support, temporal network and external context.

Do not describe the workflow as an automatic 3-D landslide velocity detector, a failure predictor or a calibrated warning model. The correct output language is **“candidate displacement signal”** or **“relative LOS diagnostic”**, tied to the exact acquisition evidence.

## Source references

- [Backend science and workflow repository](https://github.com/moshiour0/SARGuardian-backend)
- [NISAR GOFF product guide](https://nisar-docs.asf.alaska.edu/goff/)
- [NISAR GUNW product guide](https://nisar-docs.asf.alaska.edu/gunw/)
- [Find Displacements science-script audit](../../scientific-validation/find-displacements/README.md)
