# RiverShift — Validation Protocol

**Engine:** independent NISAR GCOV river-change screening  
**Demonstration:** Jamuna–Chowhali, Bangladesh

## Reproducibility evidence

- [Backend RiverShift worker tests #41926825076](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926825076) completed successfully. The Backend judge guide records 259 RiverShift worker tests.
- [Retained real-data processing Run #36](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41803576163) processed six actual GCOV acquisition dates.
- [Retrospective checksum-bound replay #41926490047](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926490047) verified all six retained source COG hashes against their sidecars and reproduced the three candidate-area outputs. The replay report is explicitly retrospective and is not represented as an artifact emitted by the original Run #36 worker.

## Run #36 values and verification

| Output | Value |
|---|---:|
| Newly water-covered candidate | 17.6721 km² |
| Persistent erosion candidate | 1,244.230 ha |
| Persistent deposition candidate | 5,078.140 ha |
| Actual observation dates | 6 |

These are AOI-, acquisition-, threshold- and date-comparison-specific radar-screening candidates. The retrospective replay reproduced all three reported values. Full-resolution source-mask overlap QA and simplified preview geometry QA are separate diagnostics; preview polygons are not the measurement basis.

## Reproduction checklist for a new request

1. Record WGS84 AOI geometry and date window.
2. Confirm the AOI is within the current single-ring polygon and area limits.
3. Inspect actual NASA CMR/ASF catalogue results; require at least four distinct GCOV dates.
4. Verify per-date catalogue-footprint coverage and then worker-side product compatibility: orbit/frame, maturity, frequency/covariance term and native HDF5 layers.
5. Verify exact granule identity, source-download receipt, HDF5 inventory and SHA-256.
6. Confirm each exported COG is bound to its source receipt and that all comparison rasters share the required grid.
7. Review valid support, water threshold, acquisition dates and exact temporal basis for each candidate class.
8. Verify full-resolution class-mask overlap QA and compare it with display-preview overlap separately.
9. Confirm that playback shows actual acquisition dates only.
10. Trace output areas and candidate layers to the result manifest and source masks.

## Independent-reference status for the retained example

The Run #36 OPERA DSWx-S1 reference review returned NO_MATCH_NO_SCORE / PROVISIONAL because no eligible date-matched WTR reference was available for the configured comparison window. No F1/IoU accuracy score was calculated for that retained example. This is an absence of eligible reference data, not zero accuracy.

The optional Sentinel-2 pathway also withholds comparison metrics when cloud and common-valid-support requirements fail. No additional reference search is required to interpret the retained example's current score state.

## Interpretation contract

Low-backscatter water screening is a radar-derived candidate method. It does not directly measure water depth, sediment volume, flood causality, signed bankline migration or confirmed damage. A signed migration result requires independently dated banklines and oriented transects. Mapped building/facility points are context only, not damage labels or a complete population inventory.

## Sources

- [RiverShift source and main technical guide](https://github.com/moshiour0/SARGuardian-backend/tree/main/tools/river_shift)
- [ASF GCOV product guide](https://nisar-docs.asf.alaska.edu/gcov/)
- [NASA CMR Search API](https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html)
- [OPERA DSWx-S1 product information](https://podaac.jpl.nasa.gov/dataset/OPERA_L3_DSWX-S1_V1)
