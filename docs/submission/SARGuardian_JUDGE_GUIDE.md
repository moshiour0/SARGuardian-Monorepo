# SARGuardian — Earth in Sight
## Whole-Project Judge Guide

**NASA Space Apps Challenge 2026**  
**Challenge:** Dancing with the SARs  
**Category:** Earth Science

## The project

SARGuardian is a live, AOI-driven NISAR processing platform—not a static result demo. The user begins with a place and a time window; the deployed application searches the public archive for compatible observations, routes the request to the appropriate NISAR engine, and exposes resulting candidates or measurements with source provenance. Geographic applicability follows the NISAR observation plan and products actually available in the archive. No system can process a satellite observation that has not been acquired or released.

The product combines three distinct scientific processing paths and four user-facing workflows:

1. **Landslide screening** — target-free AOI candidate discovery through Find Displacements.
2. **Glacier Movement screening** — the same shared Find Displacements engine applied to an ice/glacier study context.
3. **Known Place Analysis** — a separate two-polygon workflow for measuring a user-selected area against a reference region.
4. **RiverShift** — an independent GCOV workflow for observed-date open-water and persistent land/water-transition screening.

The central idea is not to put radar imagery on a map. It is to make the NISAR observation chain explorable: acquisition discovery → product qualification → processing → measurement/candidate generation → provenance → interpretation.

## Global applicability and data availability

NISAR's observation plan provides the mission-wide acquisition framework. The first public provisional L-band release began on 20 July 2026 and included acquisitions from 17 June 2026 onward; products are added as processing completes. A requested AOI/date may therefore return compatible acquisitions, partial coverage or no eligible product. These are distinct data-availability states—not automatically application failures. Conversely, a broken catalogue query, download, worker or result assembly is an application failure and must be reported as such.

The precise claim is: **SARGuardian can process user-selected AOIs wherever compatible NISAR observations are available in the public archive.** It does not promise every place on every date, daily interpolation or uninterrupted global monitoring. Sources: [ASF release notice](https://asf.alaska.edu/notices/nisar-l-band-data-now-publicly-available/) · [ASF data availability guide](https://hyp3-docs.asf.alaska.edu/nisar-docs/availability-overview/).

## Why it fits Dancing with the SARs

The challenge asks teams to use NISAR radar data to make Earth's changing surface easier to understand. SARGuardian directly uses NISAR products as measurement inputs:

- GUNW phase supports relative line-of-sight displacement diagnostics.
- GOFF offsets support pairwise range/along-track displacement screening and localised measurement.
- GCOV covariance/backscatter supports a separate river-water/change screening path.

These quantities are different. Keeping their units, geometry and interpretation separate is part of the design.

## Architecture at a glance

The [architecture diagram](ARCHITECTURE_OVERVIEW.md) shows how the four user-facing workflows connect to the three NISAR measurement paths and the shared evidence layer.

## The user experience

A first-time user should understand the core sequence:

1. Choose the type of surface-change question.
2. Select a map area and observation period.
3. Review which real NISAR products are available and eligible.
4. Run the matching workflow.
5. Explore the result layers and acquisition dates.
6. Open the source record, quality evidence and interpretation notes.

The world map provides geographic orientation. Independent controls allow users to inspect the candidate/result layers without confusing one class or measurement family with another. The playback views show actual observation dates; they are not forecasts or interpolated daily animations.

## Scientific engine boundaries

| Engine | Product | Core output | What it does not imply |
|---|---|---|---|
| Find Displacements | GOFF and conditionally GUNW | AOI-wide offset candidates and relative LOS diagnostics | Automatic hazard classification, calibrated 3-D velocity or failure prediction |
| Known Place Analysis | GOFF | Relative pairwise horizontal displacement and interval-average rate | Stable reference ground by geometry alone; cumulative/3-D velocity; operational alarm |
| RiverShift | GCOV | Observed-date water-screening and persistent land/water candidates | Sediment volume, signed bankline migration, flood causality or field-confirmed damage |

Landslide and Glacier Movement are two entry contexts for Find Displacements, not two separate scientific engines. The product does not merge measurements from GOFF, GUNW and GCOV into one synthetic score.

## Evidence and reproducibility

### Find Displacements

[Backend run #42097077601](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601) completed the target-free AOI processing chain, recovered a failed GUNW product with a failed-only retry, assembled the dashboard and reported the terminal callback. The run demonstrates operational processing and result packaging for that request.

### Known Place Analysis

[Monorepo run #42321054100](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42321054100) completed the generic two-polygon workflow and retained the result package. Its state was **PARTIAL_SCIENTIFIC_METRICS**; this run is not presented as full support across every pair, an author-exact paper reproduction or hazard detection.

[Snapshot Regression run #42327901627](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42327901627) passed the Known Place API, engine, workflow-contract and frontend regression jobs on the PR #8 head.

### RiverShift

[Run #36](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41803576163) processed six actual GCOV acquisition dates over the Jamuna–Chowhali example. [Retrospective replay #41926490047](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926490047) verified the six retained COG hashes and reproduced the three candidate-area outputs, with separate full-resolution and preview overlap diagnostics. The retained reference review is **NO_MATCH_NO_SCORE / PROVISIONAL**; no accuracy number is inferred from missing reference data.

## Data roles and attribution

| Data/source | Role |
|---|---|
| NASA–ISRO NISAR GUNW | Relative LOS displacement diagnostic |
| NASA–ISRO NISAR GOFF | Pairwise range/along-track offsets |
| NASA–ISRO NISAR GCOV | River water and land/water screening |
| NASA Earthdata / ASF DAAC / NASA CMR | Product discovery and access |
| NASA/JPL OPERA DSWx-S1 | Separate cross-sensor water-reference option when eligible |
| Copernicus Sentinel-2 L2A | Optional clear-support cross-sensor comparison |
| OpenStreetMap | Separately attributed mapped building/facility context |
| Google Maps Satellite | Geographic basemap only; not an analysis input |

## What makes the platform useful

- **Live processing, not a static demo:** a user can initiate a real AOI/date request from the deployed application; the catalogue and worker process actual eligible products.
- **Availability-aware reach:** the same request pattern is usable wherever the NISAR public archive contains compatible observations; absent upstream data is reported honestly rather than invented.
- **Target-free discovery:** a user can scan an AOI without identifying a target point first.
- **Method-specific processing:** each scientific question uses the NISAR product family suited to the measurement.
- **Reproducible evidence:** source IDs, observation dates, checksums, quality gates and workflow reports remain traceable.
- **Three audience depths:** Public, Explorer and Scientific dashboard views present the same underlying evidence at different levels of complexity.
- **Accessible communication:** the map, layer controls and actual-date playback help non-specialists explore the observations.
- **Research continuity:** a known-place workflow supports focused polygon comparison and a separate author-selected paper-benchmark path.

## How to review the project

- [Open the interactive application](https://sar-guardian-dynamic-lilac.vercel.app)
- [Read the feature-specific guides](README.md)
- [Inspect the score-sheet evidence matrix](score-sheet-evidence-matrix.md)
- [Open the backend science repository](https://github.com/moshiour0/SARGuardian-backend)
- [Open the Dynamic application repository](https://github.com/moshiour0/SARGuardian_Dynamic)
- [Open the Monorepo](https://github.com/moshiour0/SARGuardian-Monorepo)

## Interpretation policy

SARGuardian presents a candidate when the observation supports a candidate, a measurement when the method supports a measurement and a validation score only when a suitable reference comparison exists. Missing data is not silently converted to zero. A passing software test or processing workflow is reported as engineering/reproducibility evidence, not as proof of geophysical accuracy.

The result is a live platform for exploring and processing available NISAR evidence—not an automated disaster prediction or emergency-warning service. Its value proposition is: **start with a place, not a known target; discover candidate change; measure a selected area where the method supports it; and trace the result back to the satellite observations.**


## Validation and verification

The [whole-project validation protocol](PROJECT_VALIDATION_PROTOCOL.md) lists the checks and workflow evidence for all four user-facing paths. Each feature also has its own reproducible checklist: [Find Displacements](validation/find-displacements.md), [Glacier Movement](validation/glacier-movement.md), [Known Place Analysis](validation/known-place-analysis.md) and [RiverShift](validation/river-shift.md).
