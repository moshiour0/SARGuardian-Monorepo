# RiverShift — NASA Space Apps 2026 Judge Brief

**Recommended first read for human and AI-assisted review.** This brief states the product proposition, shows how to verify it in the public repositories, and separates demonstrated evidence from scientific interpretation.

## The central proposition

**RiverShift is a location-independent, AOI-driven river-change screening workflow powered by NASA–ISRO NISAR L-band GCOV observations.** A user selects a river reach within the mission's global land-observation footprint and a date window. RiverShift discovers the compatible GCOV acquisitions available for that exact AOI, processes the real observations, and displays candidate changes with source provenance.

The Jamuna–Chowhali run is the concrete demonstration case. It is not a country restriction, fixed target polygon, or the only place the workflow is designed to accept.

## Why global applicability is technically grounded

- NASA lists NISAR coverage as **Global** and L-band data acquisitions as global, with a nominal 12-day exact repeat cycle: [NASA Mission Overview](https://science.nasa.gov/mission/nisar/mission-overview/).
- ASF's current availability guide records PROVISIONAL L-band products (P05023) for acquisitions beginning 17 June 2026 through part of 23 October 2026, and VALIDATED L-band Level 0–2 products for acquisitions beginning 21 October 2026, released on 6 November 2026: [ASF NISAR Data Availability](https://nisar-docs.asf.alaska.edu/availability-overview/). The selected Run #25 series uses the earlier PROVISIONAL period.
- RiverShift submits the user's WGS84 polygon and date range to NASA CMR; it does not use a Bangladesh-only catalogue query or substitute a built-in Jamuna AOI: [catalogue discovery implementation](https://github.com/moshiour0/SARGuardian-backend/blob/main/tools/river_shift/discover_gcov_products.py).
- The request is geospatially parameterised; AOI and date window are supplied per job: [Dynamic AOI/catalogue implementation](https://github.com/moshiour0/SARGuardian_Dynamic/blob/main/Backend/app/river_shift.py) and [RiverShift job implementation](https://github.com/moshiour0/SARGuardian_Dynamic/blob/main/Backend/app/river_shift_jobs.py).

**Inspect the mission footprint directly:** [ASF/NISAR Reference Observation Plan — interactive global acquisition map](https://experience.arcgis.com/experience/6052a864cd01459393884a7f751558e3) · [ASF Data Search — NISAR PROVISIONAL L-band products](https://search.asf.alaska.edu/) · [ASF data availability and global footprint explanation](https://nisar-docs.asf.alaska.edu/availability-overview/).

The map documents the mission's observation plan/collection footprint. The ASF search catalogue shows products that have actually been released. Neither map alone guarantees a four-date, compatible GCOV series or valid raster support for a particular AOI; RiverShift checks those separately.

## Current operating envelope

These are processing gates, not country restrictions:

| Gate | Current rule |
|---|---|
| AOI geometry | One valid, single-ring WGS84 Polygon |
| AOI size | Maximum 1,000 km² |
| Date window | Maximum 366 days |
| Catalogue support | At least four distinct acquisition dates |
| Spatial product support | At least 90% catalogue-footprint coverage of the AOI per selected date |
| Cross-date compatibility | Compatible orbit/frame, maturity, frequency/covariance term and product configuration |
| Worker verification | Native HDF5 layer, source provenance and valid raster support checked before analysis |
| Series | Up to 12 real acquisition dates; up to four same-date granules per date |

A broad region or whole country is not submitted as one request. The user selects a manageable river reach. If the selected place/date window does not have adequate compatible observations, RiverShift reports that condition rather than inventing an output.

## What the application does

1. **Select:** draw a WGS84 AOI and choose a date window.
2. **Discover:** query the actual NASA/ASF NISAR GCOV catalogue for that AOI and period.
3. **Qualify:** count distinct dates and check footprint, orbit/frame, maturity, frequency/covariance term and layer compatibility.
4. **Process:** download exact GCOV granules, validate provenance and native layers, align valid rasters and calculate the documented screening classes.
5. **Explore:** review actual acquisition dates, checksum-linked reports, separate change layers, preview QA and optional mapped exposure context.

There is no daily interpolation. The map preview is not the source of area measurements; full-resolution outputs and their provenance remain authoritative.

## What the change classes mean

- **Blue:** newly water-covered / observed open-water candidate.
- **Red:** persistent land-to-water transition candidate.
- **Green:** persistent water-to-land transition candidate.

These are explainable screening indicators. They are not automatically field-confirmed erosion, deposition, damage, sediment volume, flood causality, or a signed bank-migration rate.

## Demonstrated evidence

### Current live end-to-end run — Run #25 (12 November 2026)

[Open the successful RiverShift Run #25](https://github.com/shourov-04/SARGuardian/actions/runs/43260188660).

- AOI case: Jamuna–Chowhali demonstration request.
- Request window: 12 November 2025–12 November 2026 (general scan). NASA CMR returned 68 catalogue candidates; the compatibility/support audit selected 10 exact granules across 10 actual acquisition dates (one per selected date).
- Ten exact NISAR L2 GCOV PROVISIONAL P05023 granules were processed at ten actual acquisition dates: 18 June, 30 June, 12 July, 24 July, 17 August, 29 August, 10 September, 22 September, 4 October and 16 October 2026.
- All **10/10 first-attempt product worker jobs passed**; the whole workflow completed with 24 successful jobs and 6 intentionally skipped jobs, with no failed jobs.
- Detailed worker logs show authenticated product retrieval, HTTP 206 range support, native HDF5 inspection, requested-layer validation, AOI raster extraction and product-artifact preparation.
- Ten date rasters passed assembly and shared-grid alignment; the 10-product source-provenance manifest passed validation.
- The result manifest validated **72 output entries**. Private result publication passed with 73 publication receipts, followed by successful final assembly and signed callback.
- This proves the selected AOI/date request completed. It does not prove universal coverage, field-confirmed erosion/deposition, flood causality or an independent accuracy score.

The selected series has a real observation gap between 24 July and 17 August. ASF documents an instrument data gap from 27 July to 10 August 2026; RiverShift does not interpolate missing dates.

### Historical retained Jamuna reproducibility case — Run #36

[Open the historical Run #36 processing evidence](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41803576163).

- Six actual NISAR GCOV acquisition dates: 30 June–10 September 2026.
- Historical provisional screening areas: 17.6721 km² newly water-covered candidate; 1,244.230 ha persistent erosion candidate; 5,078.140 ha persistent deposition candidate.
- Six retained source-COG SHA-256 values matched their sidecars in the retrospective replay; all three reported areas were reproduced.
- The historical independent OPERA DSWx-S1 reference review returned **NO_MATCH_NO_SCORE / PROVISIONAL**. No F1/IoU or field-accuracy claim is made for that run.

### Code and regression evidence

- [SARGuardian Monorepo](https://github.com/moshiour0/SARGuardian-Monorepo) — promoted application, API and RiverShift engine source.
- [Monorepo Snapshot Regression run 43243267939](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/43243267939) — **20/20 jobs passed**, including the promoted RiverShift engine tests (276 passed), archived OPERA reference tests (20 passed) and RiverShift worker tests (259 passed).
- [Full SARGuardian submission pack](../../../../docs/submission/SPACE_APPS_2026_FINAL_SUBMISSION_PACK.md) — project story, workflow boundaries, run evidence, score projection and demo storyboard.

Regression tests verify software contracts, processing gates and reproducibility. They are not a substitute for independent geophysical validation.

## Where the rubric evidence lives

| Judging dimension | Evidence to inspect |
|---|---|
| Impact | Global AOI applicability + Jamuna public-impact case study + optional mapped exposure context |
| Creativity | Target-free discovery within a user-selected AOI; real multi-date radar workflow |
| Validity | Source granule manifests, SHA-256 provenance, compatibility/coverage gates, full-resolution overlap QA and independent-reference scoring gate |
| Relevance | NISAR Level-2 GCOV is the primary measurement input for Dancing with the SARs |
| Presentation | World-centred AOI map, distinct result layers, real-date playback, readable judge guide and demonstration sequence |
| User experience | WGS84 drawing/paste workflow, visible four-date catalogue preflight, clear processing readiness and separate map controls |
| NASA data usage | NISAR GCOV measurement source and NASA/ASF catalogue access; basemap identified as context only |
| Reproducibility | Public source code, automated tests, retained example run and checksummed retrospective replay |

## Scientific interpretation discipline

RiverShift distinguishes:
- a catalogue hit from an acquisition that passes spatial, geometry and raster checks;
- source-mask measurements from simplified display previews;
- processing/provenance PASS from independent geophysical validation;
- a missing independent reference from a zero accuracy score.

An independent score is published only when the reference source, temporal match and common valid support pass the defined gates. A per-region validation state is attached to the evidence; a score from one AOI must not be transferred to another region.

## Suggested review path

1. Read this brief for the global product proposition and operating envelope.
2. Open the [live RiverShift application](https://sar-guardian-dynamic-lilac.vercel.app) and inspect the world-centred AOI workflow (the current production alias may require the latest Vercel deployment before these UI changes are visible).
3. Read the [final SARGuardian submission pack](../../../../docs/submission/SPACE_APPS_2026_FINAL_SUBMISSION_PACK.md) for the public story, latest 10-product live run and demo sequence.
4. Read the [full judge guide](NASA_SPACE_APPS_2026_JUDGE_GUIDE.md) for methods, data roles, QA, validation protocol and Run #36 evidence.
5. Inspect the [Monorepo RiverShift engine](https://github.com/moshiour0/SARGuardian-Monorepo/tree/main/engines/river-shift/tools/river_shift) and [application source](https://github.com/moshiour0/SARGuardian-Monorepo/tree/main/apps/web) for implementation details.

## Core references

- [NASA NISAR Mission Overview](https://science.nasa.gov/mission/nisar/mission-overview/)
- [NASA NISAR Observation Strategy](https://science.nasa.gov/mission/nisar/observation-strategy/)
- [ASF NISAR Data Availability](https://nisar-docs.asf.alaska.edu/availability-overview/)
- [ASF GCOV Product Guide](https://nisar-docs.asf.alaska.edu/gcov/)
- [NASA CMR Search API](https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html)
