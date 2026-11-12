# SARGuardian — NASA Space Apps 2026 Final Submission Pack

**Challenge:** Dancing with the SARs  
**Category:** Earth Science  
**Product:** SARGuardian — NISAR-powered surface-change intelligence  
**Evidence cut-off:** 12 November 2026  
**Status:** Submission narrative and evidence index; this is not an official judge score or a claim of universal scientific validation.

## 1. The project in one sentence

**SARGuardian turns real NASA–ISRO NISAR radar observations into traceable surface-change screening workflows for land, glacier terrain and rivers—so users can explore an area and time window, inspect candidate changes, and see exactly which observations and quality checks support the result.**

## 2. Copy-ready project description

Earth's surface changes continuously, but observing those changes consistently is difficult. Optical imagery can be limited by clouds, darkness and acquisition timing; radar observations provide a complementary way to examine the land surface. NISAR, the NASA–ISRO Synthetic Aperture Radar mission, supplies L-band observations designed to measure changes across land, water, vegetation and ice.

SARGuardian brings several NISAR-based workflows into one interactive platform. A user chooses an area of interest and an observation window, then explores the processing path appropriate to the question: target-free displacement screening, glacier-terrain movement screening, focused known-place research, or river-change screening from GCOV observations. Results retain acquisition dates, source-product identity, provenance and quality-control information.

SARGuardian does not predict disasters or automatically declare a candidate to be a confirmed landslide, glacier collapse, erosion event or flood impact. It helps users find and inspect radar-derived signals that deserve further interpretation. The design keeps different NISAR measurement families separate and makes missing observations, uncertainty and validation limits visible rather than hiding them behind a single confidence score.

## 3. Why this matters

Communities, researchers and planners need to understand where the Earth's surface may be changing and what evidence exists for those changes. A map alone is not enough: a decision-maker needs to know when the observation was made, which sensor product was used, whether the product was compatible with the analysis, how much valid data supported the result, and what the result does *not* establish.

SARGuardian is built around that evidence chain. The user does not have to begin with a known target point or a fixed demonstration polygon. They can select an AOI and date range; the application searches for compatible NISAR products available for that request and qualifies the available observations before processing.

This is a global-use design, not a promise that every location has a complete time series at every date. The NISAR mission has a global land and ice-observation plan, but archive release, instrument gaps, product maturity, orbit/frame compatibility, spatial coverage and valid raster support still determine what can be processed for a particular AOI.

## 4. What users can do

SARGuardian presents four user-facing workflow categories. They are not four interchangeable scientific engines; the underlying measurements and processing paths remain distinct.

| User-facing workflow | What it does | Primary NISAR evidence | Important boundary |
|---|---|---|---|
| **Landslide / Find Displacements** | Scans a user-selected AOI and time window for displacement candidates without requiring a nominated target point. | GOFF offset diagnostics and, where the network and support gates pass, GUNW interferometric phase / line-of-sight diagnostics. | GOFF and GUNW are separate measurement families. An anomaly is a candidate, not proof of a landslide. Pairwise LOS is not automatically cumulative or 3-D displacement. |
| **Glacier Movement** | Applies the shared AOI-wide displacement workflow to glacier terrain where compatible observations exist. | The same distinct GOFF and gated GUNW evidence families used by Find Displacements. | This is a workflow category routed through the shared displacement engine, not a separately validated glacier-collapse or avalanche-physics model. |
| **Known Place Analysis** | Supports focused two-polygon analysis: a Measurement Polygon and a Reference Polygon, with explicit source-product identity and evidence review. | Exact selected NISAR products, including the author-exact P05023 benchmark path where explicitly requested. | The reference polygon is user-defined; its stability is not independently proven by default. Generic analysis and author-exact paper reproduction are separate paths. |
| **River Shift** | Discovers and processes compatible NISAR GCOV acquisitions for a user-selected river reach and date window, then displays radar-derived water/land-transition candidates. | NISAR L-band Level-2 GCOV. | Candidate classes are not automatically field-confirmed erosion, deposition, damage, sediment volume or flood causality. Playback uses real acquisition dates, not interpolation or forecast. |

### The River Shift map classes

- **Blue:** newly water-covered / observed open-water candidate.
- **Red:** persistent land-to-water transition candidate (erosion-screening signal).
- **Green:** persistent water-to-land transition candidate (deposition-screening signal).

These are explainable screening classes. Their interpretation remains subject to source-mask validity, common-grid support, overlap QA and any eligible independent reference.

## 5. How the evidence chain works

The workflow is designed to make the route from request to result inspectable:

1. **Choose an AOI and date window.** The request is location- and time-specific.
2. **Discover observations.** The workflow queries NASA CMR / ASF for the relevant NISAR collection and exact granule identities.
3. **Qualify the data.** It checks product maturity, acquisition dates, orbit/frame and product configuration, footprint support, native layers and valid pixels.
4. **Process exact products.** The worker downloads the accepted granules, verifies HDF5 structure and expected layers, and performs the relevant raster processing.
5. **Preserve provenance.** Product identities, acquisition dates, checksums, manifests and processing receipts remain linked to the outputs.
6. **Review results.** The user can inspect actual observation dates, candidate layers, geometry/overlap diagnostics and validation status.
7. **Publish results privately.** The verified result package and its manifest are retained through the configured private result-storage path.

The system distinguishes a successful software or provenance check from independent geophysical validation. A structurally valid output is not automatically a validated physical event.

## 6. Latest live River Shift evidence — Run #25

**Run:** [RiverShift Run #25 — GitHub Actions](https://github.com/shourov-04/SARGuardian/actions/runs/43260188660)  
**Repository / branch:** `shourov-04/SARGuardian`, `main`  
**Checked-out commit:** `8f9272adafc43ac080227083f12d122a8a271be8`  
**Run date:** 12 November 2026  
**AOI case:** Jamuna–Chowhali demonstration request  
**Collection:** NISAR L2 GCOV PROVISIONAL, CRID P05023  
**Selected products:** 10 exact granules across 10 actual acquisition dates

### Acquisition dates

| # | Acquisition date | # | Acquisition date |
|---:|---|---:|---|
| 1 | 18 June 2026 | 6 | 29 August 2026 |
| 2 | 30 June 2026 | 7 | 10 September 2026 |
| 3 | 12 July 2026 | 8 | 22 September 2026 |
| 4 | 24 July 2026 | 9 | 4 October 2026 |
| 5 | 17 August 2026 | 10 | 16 October 2026 |

All 10 first-attempt product worker jobs passed. The run completed with 24 successful jobs and 6 intentionally skipped jobs; no job failed. The workflow's final **“Verify all products, run change science, and retain private results”** job passed.

### What the logs establish

- Earthdata authentication and exact CMR granule lookup passed for the selected products.
- The authenticated ASF byte-range path returned HTTP **206 Partial Content** in the detailed product-worker logs; the NISAR files were downloaded through the authenticated range-download path.
- Native HDF5 inspection and requested-layer validation passed.
- AOI raster extraction and per-product artifact preparation passed for all 10 product workers.
- Ten date rasters were assembled and aligned to a shared observation grid.
- The source provenance manifest passed validation for all 10 products.
- The result package manifest passed validation and reported **72 validated output entries**.
- The private result publication stage passed and reported **73 publication receipts**.
- Signed API callbacks and final assembly completion passed.

**Traceability values from the run:** source-granule provenance manifest SHA-256  
`7c515d538024aaea176de2ac34e3d30360ce267bb56d46d6e1c8bce9e72de995`; final result-manifest SHA-256  
`ca8c77d68f42041e74d4cf97735aac10636fa9eead5ce7133bece165ce93b47a`.

### How to interpret this result

Run #25 is a successful end-to-end processing demonstration for this particular AOI, date window and compatible product series. It proves that the selected ten products could be discovered, downloaded, inspected, processed, assembled, checked and privately published in that run. It does **not** prove that every river reach has ten compatible dates, that every coloured candidate is field-confirmed, or that the case has a validated accuracy score.

The run contains a real observation gap between 24 July and 17 August. ASF documents a NISAR instrument data gap from 27 July to 10 August 2026. RiverShift uses the available observations; it does not fill that gap with synthetic frames.

The successful run used P05023 PROVISIONAL products for acquisitions from June–October 2026. ASF's current availability guide also records a later VALIDATED L-band Level 0–2 release on 6 November 2026 for acquisitions beginning 21 October 2026. These are different product-maturity periods and should not be mixed without the appropriate product-version controls.

### Separate validation record

The earlier retained Jamuna Run #36 and its retrospective replay remain useful reproducibility evidence, but its independent OPERA DSWx-S1 review returned **NO_MATCH_NO_SCORE / PROVISIONAL** because no eligible temporally matched reference was available. That is not a zero score and is not an accuracy pass. Run #25's successful processing does not change that independent-reference result.

## 7. NISAR data: what is used and why

SARGuardian's relevance to *Dancing with the SARs* is direct: NISAR products are measurement inputs, not decorative map layers.

| Product family | What SARGuardian uses it for | Do not confuse it with |
|---|---|---|
| **GUNW** | Interferometric phase / line-of-sight displacement diagnostics where the required network, geometry and common-support gates pass. | Absolute 3-D movement or a cumulative displacement history without the required model and observations. |
| **GOFF** | Range/azimuth offset diagnostics and candidate screening. | A calibrated ground-displacement vector or confirmed landslide by itself. |
| **GCOV** | Covariance-based radar observation support for River Shift's water/land-change screening. | A direct field survey, sediment-volume measurement or automatic flood-causality assessment. |

The application may also show basemaps or separately attributed context sources. Those are labelled as context; they are not represented as NISAR measurements.

### Global applicability, with accurate limits

NASA describes NISAR as a global land and ice-observation mission with a nominal 12-day exact repeat cycle and an average revisit of about six days from ascending and descending observations. ASF archives the public L-band data and describes product availability by maturity and acquisition period.

The right judge-facing wording is:

> “SARGuardian is designed for user-selected AOIs across the global NISAR observation programme. For each AOI and date window, the system checks the actual released catalogue, product compatibility and valid spatial support before it reports a processable series.”

Avoid: “everywhere, every day”, “all data are already available everywhere”, or “worldwide accuracy is validated”.

## 8. Scientific boundaries that must remain visible

- **PASS** means the stated structural, provenance or processing checks passed. It does not mean an independent scientist has validated the geophysical interpretation.
- **GOFF anomaly** means a candidate signal, not proof of movement or a landslide.
- **Pairwise LOS** is not automatically cumulative or 3-D displacement.
- **Playback** shows real acquisition records. It is not forecast or interpolation.
- **Not measured** is not zero.
- A user-defined Reference Polygon is not proof of stable ground.
- RiverShift's map classes are candidates, not automatic field labels.
- A missing or date-mismatched independent reference remains **NO_MATCH_NO_SCORE**, not a fabricated zero score or a passing accuracy claim.
- Glacier Movement is not an independent collapse/avalanche detector.

## 9. Team roles

The following is the team's reported responsibility map. The final official NASA project page should use the team's approved wording and confirm the member list before submission.

| Team member | Reported responsibilities | Education / affiliation supplied by the team |
|---|---|---|
| **Moshiur Rahman Sarker** | Team Lead; Scientific Core Engine and Processing Development; overall project development and integration; project coordination; video editing. | Department of Mathematics, Ananda Mohan College, Mymensingh. |
| **Shagor Chandra Modak** | Scientific Core Engine implementation in GitHub Actions; UI/UX design; final project polishing and refinement. | CSE, SUST. |
| **MD Fahim** | River Shift development; video editing. | CSE, Islamic University, Kushtia. |
| **Tasmia Binte Hasan** | Storytelling and presentation. | Add only the education/affiliation approved for the official project page. |

## 10. Suggested 2-minute judge demo

**0:00–0:15 — The problem**  
“Surface change is not always visible in optical imagery at the moment we need it. NISAR adds a radar-based observation stream. SARGuardian helps users turn those observations into traceable screening evidence.”

**0:15–0:35 — The platform**  
Show the application and the four workflow categories. Explain that the user selects an AOI and date window; the system searches for compatible observations rather than assuming every place has every product.

**0:35–0:55 — Find Displacements / Glacier Movement**  
Show target-free AOI discovery. Explain GOFF and GUNW as separate measurement families. Say “candidate screening”, not “automatic disaster prediction”.

**0:55–1:10 — Known Place Analysis**  
Show the Measurement Polygon and Reference Polygon. Explain that the reference is a comparison region, not independently guaranteed stable ground.

**1:10–1:40 — River Shift live evidence**  
Open Run #25. Show the 10 real dates from 18 June to 16 October 2026, the successful product jobs, HDF5/layer checks, shared-grid alignment and provenance manifest. Show the separate blue/red/green candidate layers.

**1:40–1:55 — Validation discipline**  
Open the historical independent-reference report. Explain that no eligible reference means NO_MATCH_NO_SCORE, not a made-up accuracy figure.

**1:55–2:00 — Close**  
“SARGuardian does not predict the future. It makes real radar observations easier to explore, trace and interpret.”

## 11. Copy-ready closing statement

SARGuardian makes NISAR evidence more accessible by bringing several surface-change workflows into one AOI-driven platform. Its value is not only the map that appears at the end; it is the traceable chain behind that map—real observation dates, exact source products, compatibility checks, processing records, uncertainty and explicit validation limits. That is how a candidate becomes something a researcher or local decision-maker can investigate responsibly.

## 12. Indicative score against the supplied local judge rubric

The local score sheet supplied for this project totals **118 points before its conditional +5% women-participation bonus**. The following is an evidence-based preparation estimate, not a mark awarded by a judge and not a published NASA global score.

| Criterion | Maximum | Current estimate | Why this estimate is not higher |
|---|---:|---:|---|
| Impact | 20 | **17** | Strong cross-workflow relevance and a 10-date live river case; no measured downstream user/community outcome is documented here. |
| Creativity | 20 | **18** | User-defined AOIs, target-free displacement discovery, a distinct two-polygon workflow and GCOV time-series screening are a strong combination. |
| Validity | 20 | **16** | Exact granule provenance, HDF5/layer gates, shared-grid alignment and live end-to-end success are demonstrated; independent physical validation remains incomplete for the retained Jamuna reference window. |
| Relevance | 20 | **19** | NISAR is the primary measurement source across the product's central workflows; the application is directly aligned to Dancing with the SARs. |
| Presentation | 20 | **15** | A coherent narrative and evidence pack are prepared, but a finished demo video and recorded first-time-user tests are not verified in this pack. |
| Teamwork | 5 | **4** | Named roles and responsibilities are documented; the official project page and collaboration evidence still need final confirmation. |
| User experience | 5 | **3** | The user journey and map-first workflow are defined; independent first-use and mobile/keyboard test records are not included here. |
| NASA data usage | 5 | **5** | NISAR products drive the analysis and provenance; the data role is explicit and separated from basemaps/context. |
| Challenge category identified | 1 | **1** | “Dancing with the SARs” and “Earth Science” are explicit. |
| Repository access | 1 | **1** | The Monorepo is public and its repository page is accessible. |
| Project page complete | 1 | **0** | Successful completion/submission of the official NASA project page has not been independently verified. |
| **Total** | **118** | **99** | **83.9% of the pre-bonus maximum.** |

**Conditional bonus:** the supplied local rubric describes a +5% women-participation bonus. It is excluded from the 99-point estimate because eligibility and roster confirmation have not been independently established in this repository evidence. If the local organiser confirms eligibility, +5% of 99 is 4.95 points, giving an indicative **103.95 / 118**. This is local-rubric arithmetic, not a claim that NASA Global Judging awards this bonus.

The most score-efficient remaining work is: (1) finish and upload the real demo video, (2) record first-time-user tests on mobile and desktop, (3) verify the official NASA project page is complete/submitted, and (4) obtain a temporally matched independent river reference before claiming geophysical accuracy.

## 13. Current submission checklist

| Item | Current status | What closes it |
|---|---|---|
| Challenge/category wording | **Ready** | Keep “Dancing with the SARs” / “Earth Science” consistent. |
| Four workflow story | **Ready with scientific boundaries** | Use the exact wording in Sections 4 and 8. |
| RiverShift end-to-end run | **Demonstrated** | Link Run #25 and show the 10-date evidence. |
| Independent river-change accuracy score | **Not demonstrated for the retained Jamuna reference window** | Obtain a temporally matched, independently prepared reference and pass the documented spatial/temporal support gates. |
| Public repository link | **Accessible** | Keep public access deliberate; complete the licensing and secret/data-release review. |
| Human first-time-user / mobile UX evidence | **Not recorded in this evidence pack** | Record short, consented first-use tests on mobile and desktop; fix blockers. |
| Official NASA project page | **Not independently verified here** | Confirm that it is complete and successfully submitted. |
| Final demo video | **Not independently verified here** | Record the real application and evidence flow; do not replace actual product results with fabricated scenes. |
| Team roles | **Reported role map included** | Confirm spelling, affiliation and final approved contribution statements with all members. |

## 14. Primary references

- [NASA NISAR Mission Overview](https://science.nasa.gov/mission/nisar/mission-overview/)
- [NASA NISAR mission page](https://science.nasa.gov/mission/nisar/)
- [ASF NISAR Data Availability — current maturity and acquisition windows](https://nisar-docs.asf.alaska.edu/availability-overview/)
- [ASF NISAR Product Overview](https://nisar-docs.asf.alaska.edu/products-overview/)
- [NASA CMR Search API](https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html)
- [SARGuardian Monorepo](https://github.com/moshiour0/SARGuardian-Monorepo)
- [RiverShift Run #25 — 10-product end-to-end evidence](https://github.com/shourov-04/SARGuardian/actions/runs/43260188660)
- [Monorepo Snapshot Regression — 20/20 jobs passed](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/43243267939)
- [RiverShift-specific evidence brief](../../engines/river-shift/tools/river_shift/NASA_SPACE_APPS_2026_JUDGE_BRIEF.md)
- [Local judge score-sheet evidence matrix](score-sheet-evidence-matrix.md)
