# SARGuardian — NASA Space Apps 2026 Judge Evidence Index

**Challenge:** Dancing with the SARs  
**Category:** Earth Science  
**Project:** SARGuardian — Earth in Sight

> This is the canonical, judge-first navigation page for the project. It connects each product workflow to its NISAR measurement family, reproducible evidence and intended interpretation.

## Project in one paragraph

SARGuardian is an interactive NISAR surface-change exploration platform. A user selects an area and observation period, then follows a workflow suited to the question: target-free displacement-candidate discovery for landslide and glacier-movement screening; two-polygon measurement for a known place; or a separate GCOV-based river-water and channel-transition screen. The platform preserves the distinction between radar observations, derived measurements, visual map layers and scientific interpretation. Results are traceable to their acquisition dates and source products.

## Four workflows

| Workflow | What the user does | NISAR source | What the result represents |
|---|---|---|---|
| **Landslide screening** | Selects an AOI and date range without supplying a target point | GOFF offsets; GUNW LOS diagnostics where a compatible network exists | Candidate offset anomalies and/or relative line-of-sight diagnostics for investigation |
| **Glacier movement screening** | Uses the same AOI-wide displacement workflow for an ice or glacier-terrain study area | GOFF offsets; GUNW LOS diagnostics where supported | Candidate surface-motion signals; not an automatic glacier-collapse or avalanche verdict |
| **Known Place Analysis** | Draws a Measurement Polygon and a separate Reference Polygon | GOFF pairwise offsets | Relative horizontal displacement measurements and interval-average pairwise rates where support permits |
| **RiverShift** | Draws a river-reach AOI and selects a date window | GCOV covariance/backscatter observations | Observed-date open-water screening and persistent land/water transition candidates |

**Architecture note:** Landslide and Glacier Movement are two use cases of the shared Find Displacements engine. Known Place Analysis is a separate, target-selected two-polygon workflow. RiverShift is an independent GCOV processing engine. These paths are not interchangeable.

## Read the evidence in this order

1. [Whole-project judge guide](SARGuardian_JUDGE_GUIDE.md) — challenge fit, product architecture, shared NISAR data story and cross-feature evidence.
2. [Landslide / Find Displacements guide](features/landslide-find-displacements.md) — target-free AOI scanning and separate GOFF/GUNW measurement paths.
3. [Glacier Movement guide](features/glacier-movement.md) — how the shared displacement engine applies to glacier studies.
4. [Known Place Analysis guide](features/known-place-analysis.md) — two-polygon measurements and the separate author-exact P05023 research path.
5. [RiverShift guide](features/river-shift.md) — GCOV workflow, Jamuna demonstration and reproducibility evidence.
6. [Project-page draft](SARGuardian_PROJECT_PAGE_DRAFT.md) — copy-ready public narrative with team/submission fields clearly marked for completion.
7. [Video storyboard draft](VIDEO_STORYBOARD_DRAFT.md) — team working script for a concise product demonstration.

## NISAR is the measurement source

| NISAR product | Measurement family used by SARGuardian | Interpretation boundary |
|---|---|---|
| **GUNW** | Unwrapped interferometric phase converted to relative line-of-sight displacement under the selected reference policy | LOS only; not automatically vertical, downslope, cumulative or 3-D movement |
| **GOFF** | Pairwise range/along-track pixel offsets | Offset diagnostics; not automatically a calibrated 3-D velocity or hazard probability |
| **GCOV** | Geocoded covariance/backscatter observations | Radar-derived water/land screening; not direct bathymetry, sediment volume or field-confirmed bankline change |

ASF DAAC / NASA Earthdata and NASA CMR are used for product discovery and access. Google Maps Satellite is a visual basemap only. Optional OpenStreetMap points are exposure context, not NISAR measurements or damage labels. Cross-sensor sources are labelled separately and only used as references when their date and valid spatial support meet the comparison rules.

## Evidence at a glance

- **Find Displacements processing:** [Backend Action run #42097077601](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601) completed successfully, including recovery of a failed GUNW product through a failed-only retry, dashboard assembly and terminal callback.
- **Known Place generic AOI:** [Monorepo Action run #42321054100](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42321054100) completed successfully and retained its result package. Its result state is partial scientific metrics; it is not an author-exact paper reproduction or a hazard detection result.
- **Known Place code regression:** [Snapshot Regression run #42327901627](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42327901627) completed successfully on the PR #8 head. It validates the branch test contracts, not a production deployment.
- **RiverShift real-data example:** [Backend processing run #36](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41803576163) processed six actual NISAR GCOV acquisition dates. The checksum-bound [retrospective replay #41926490047](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926490047) reproduced the three reported candidate areas from the retained COGs and generated current overlap QA.

A passing workflow proves the workflow reached its declared terminal state. Unit tests, provenance checks and replay reproducibility are different forms of evidence; none should be relabelled as independent geophysical validation.

## Local judging rubric

The uploaded local score sheet assigns:

- **100 headline points:** Impact, Creativity, Validity, Relevance and Presentation — 20 each.
- **15 additional points:** Teamwork, User experience and NASA data usage — 5 each.
- **3 additional points:** challenge category, repository access and project-page completeness — 1 each.
- **Maximum before bonus: 118 points.** The supplied local sheet separately lists a **+5% women-participation bonus** applied to the aggregate. Treat this as a local-event rule, not a universal NASA global-judging rule.

The [score-sheet evidence matrix](score-sheet-evidence-matrix.md) maps each criterion to concrete evidence and the final human actions that must be completed. It is an evidence register, not a promise of marks.

## Public project and source links

- [Interactive SARGuardian application](https://sar-guardian-dynamic-lilac.vercel.app)
- [Dynamic application repository](https://github.com/moshiour0/SARGuardian_Dynamic)
- [Backend scientific workers and Actions](https://github.com/moshiour0/SARGuardian-backend)
- [SARGuardian Monorepo](https://github.com/moshiour0/SARGuardian-Monorepo)
- [Official challenge: Dancing with the SARs](https://www.spaceappschallenge.org/2026/challenges/dancing-with-the-sars/)

## How to interpret the project evidence

- **Candidate** means a radar-derived signal selected for further investigation.
- **Measured** means a numerical quantity produced from the stated source data and measurement method.
- **Reproduced** means a stated output was regenerated from identified inputs within the reported comparison.
- **Independent validation** requires a suitable external reference, documented temporal/spatial support and the relevant comparison metrics.
- **NO_MATCH_NO_SCORE** means the reference comparison did not have eligible data; it is not a zero score.
- **Not measured** is never represented as zero.

Use the feature guides for the precise method and result context. Use the source repositories and linked workflow runs for implementation and reproducibility evidence.
