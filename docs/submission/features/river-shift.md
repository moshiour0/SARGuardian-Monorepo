# RiverShift — NISAR L-band River-Change Screening

**Engine:** Independent RiverShift GCOV processing path  
**Challenge fit:** Dancing with the SARs — Earth Science  
**Demonstration area:** Jamuna–Chowhali, Bangladesh

## What it does

RiverShift lets a user draw a WGS84 river-reach AOI and choose an observation window. The worker searches the actual NASA/ASF catalogue for NISAR Level-2 GCOV products intersecting that request, qualifies compatible acquisitions, processes the selected observations and displays radar-derived water and land/water transition candidates.

The Jamuna–Chowhali example demonstrates the workflow. The processing request is AOI-driven; it is not hard-coded to that river or to Bangladesh.

## Current request and product gates

- One valid, single-ring WGS84 Polygon, up to **1,000 km²**.
- Date window up to **366 days**.
- At least **four distinct GCOV acquisition dates**.
- At least **90% catalogue-footprint coverage** of the AOI for each selected date.
- Worker-side checks for compatible orbit/frame, maturity, frequency/covariance term, native HDF5 layer and valid raster support.
- Up to **12 actual acquisition dates**; no daily interpolation.

Catalogue footprint coverage is a discovery gate, not proof of valid raster pixels. The worker performs its own layer and raster-support checks before analysis.

## NISAR data and output classes

NISAR Level-2 GCOV is the primary measurement source. Linear gamma0 power is converted to decibels using:

    gamma0_dB = 10 * log10(gamma0_power)

The current screening outputs are:

- **Observed-date open-water extent:** low-backscatter water-screening mask for one actual acquisition.
- **New-water candidate:** water in the comparison observation where the selected baseline did not classify water.
- **Persistent erosion candidate:** baseline land classified as water in both configured post-event morphology observations.
- **Persistent deposition candidate:** baseline water classified as land in both configured post-event morphology observations.

These are radar-derived screening candidates. They do not directly measure water depth, sediment thickness/volume, flood causality or signed bankline migration. Signed bankline displacement is a separate method requiring independently dated banklines and oriented transects.

## Demonstrated Jamuna result — Run #36

[Backend processing run #36](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41803576163) used six actual NISAR GCOV acquisition dates from **30 June to 10 September 2026**, with a user-supplied event date of 28 July 2026 and an event-proximal NISAR acquisition on 17 August 2026.

| Output | Run #36 value |
|---|---:|
| Newly water-covered candidate area | **17.6721 km²** |
| Persistent erosion candidate area | **1,244.230 ha** |
| Persistent deposition candidate area | **5,078.140 ha** |
| Actual acquisition dates | **6** |

These values are specific to that AOI, selected acquisitions, threshold and time comparisons. They are reported as provisional candidate areas, not field-surveyed erosion/deposition or damage measurements.

A separate checksum-bound [retrospective replay #41926490047](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926490047) checked the six retained source COGs against their SHA-256 sidecars and reproduced all three reported candidate areas. It also generated full-resolution source-mask and preview-geometry overlap diagnostics. The replay is explicitly labelled retrospective; it does not rewrite the original Run #36 artifact manifest.

## Map and exposure context

The red, green and blue candidate layers are separate from the observed-date water layer. Playback steps through actual acquisition dates only. Simplified preview polygons and sparse markers are presentation layers; full-resolution source masks and their reports remain the measurement basis.

Optional OpenStreetMap building/facility points are a separate context layer. They are not used in NISAR classification and do not establish that a building is damaged, occupied, threatened or affected. The satellite basemap is for geographic orientation, not a scientific input.

## Reference-comparison status

The retained Jamuna Run #36 reference review did not find an eligible, temporally matched OPERA DSWx-S1 WTR scene for the configured comparison window. Its status is **NO_MATCH_NO_SCORE / PROVISIONAL**. This means that no eligible reference comparison score was calculated; it is not a zero accuracy result.

The optional Sentinel-2 comparison pathway also withholds metrics when cloud filtering or common valid support does not pass its declared gate. RTC-S1 backscatter inventory is not a water/non-water reference mask.

This status is specific to the demonstrated AOI and dates. It does not imply that all other AOIs have the same reference availability.

## Software and provenance evidence

- [RiverShift worker test run #41926825076](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926825076) — successful RiverShift regression suite; the mainline judge documentation records 259 worker tests.
- [Backend RiverShift worker source](https://github.com/moshiour0/SARGuardian-backend/tree/main/tools/river_shift)
- [Dynamic RiverShift interface](https://github.com/moshiour0/SARGuardian_Dynamic/tree/main/Frontend/src/pages/RiverShiftPage.tsx)
- [Full technical judge guide](https://github.com/moshiour0/SARGuardian-backend/blob/main/tools/river_shift/NASA_SPACE_APPS_2026_JUDGE_GUIDE.md)

## What to show a judge

1. Draw a river-reach AOI and select a date window.
2. Show the catalogue returning actual NISAR GCOV granules and distinct dates.
3. Explain the worker-side compatibility and valid-raster checks.
4. Play the actual observation dates; do not describe it as daily imagery.
5. Toggle observed water, new-water, erosion-candidate and deposition-candidate layers separately.
6. Open the source manifest and checksum-bound output evidence.
7. Explain the Jamuna candidate-area measurements as a specific reproducible screening example.

## Core references

- [NASA NISAR Mission Overview](https://science.nasa.gov/mission/nisar/mission-overview/)
- [ASF NISAR Data Availability](https://nisar-docs.asf.alaska.edu/availability-overview/)
- [ASF GCOV Product Guide](https://nisar-docs.asf.alaska.edu/gcov/)
- [NASA CMR Search API](https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html)
- [NASA/JPL OPERA DSWx-S1 V1](https://podaac.jpl.nasa.gov/dataset/OPERA_L3_DSWX-S1_V1)
