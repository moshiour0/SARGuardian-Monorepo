# SARGuardian — Earth in Sight

**NASA Space Apps Challenge 2026 · Dancing with the SARs · Earth Science**

SARGuardian is an interactive NISAR surface-change exploration platform. Users select an area and observation window, then explore the radar observations, candidate changes or measurements that the selected workflow can support—with source-product provenance and quality evidence.

> **Judge-first entry point:** [Open the SARGuardian evidence index](docs/submission/README.md). It maps the four user-facing workflows to their NISAR measurement families, reproducible runs, feature guides and project/video drafts.

## Explore the four workflows

| Workflow | Purpose | NISAR data |
|---|---|---|
| **Landslide** | Target-free AOI-wide displacement-candidate discovery | GOFF offsets; GUNW LOS diagnostics when a compatible network exists |
| **Glacier Movement** | Glacier-focused use of the shared displacement-candidate workflow | GOFF offsets; GUNW LOS diagnostics when supported |
| **Known Place Analysis** | Two-polygon relative-displacement analysis for a selected place | GOFF offsets |
| **RiverShift** | AOI-driven river water and persistent land/water transition screening | GCOV covariance/backscatter |

Landslide and Glacier Movement share **Find Displacements**. Known Place Analysis is a distinct two-polygon workflow. RiverShift is a separate GCOV processing engine. These are four user-facing entry points, not four interchangeable scientific models.

## Start here

- [Architecture and NISAR data-flow diagram](docs/submission/ARCHITECTURE_OVERVIEW.md)
- [Whole-project judge guide](docs/submission/SARGuardian_JUDGE_GUIDE.md)
- [Feature-by-feature judge guides](docs/submission/README.md#read-the-evidence-in-this-order)
- [Score-sheet evidence matrix](docs/submission/score-sheet-evidence-matrix.md)
- [Whole-project validation protocol](docs/submission/PROJECT_VALIDATION_PROTOCOL.md)
- [Project-page draft](docs/submission/SARGuardian_PROJECT_PAGE_DRAFT.md)
- [Internal video storyboard draft](docs/submission/VIDEO_STORYBOARD_DRAFT.md)

## What NISAR contributes

SARGuardian uses distinct NISAR measurement families for different questions:

- **GUNW:** unwrapped interferometric phase converted to relative line-of-sight (LOS) displacement under a defined reference policy.
- **GOFF:** pairwise range and along-track pixel offsets used for displacement screening or local two-polygon measurement.
- **GCOV:** geocoded covariance/backscatter observations used by RiverShift's water and land/water screening.

NASA Earthdata, NASA CMR and ASF DAAC support product discovery and access. Ancillary and third-party sources are identified by role: optional cross-sensor reference, hydrological context, mapped exposure context or basemap. A basemap is not a scientific measurement source.

## Demonstrated workflow evidence

- **Find Displacements:** [Backend run #42097077601](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601) completed AOI processing, failed-only GUNW recovery, dashboard assembly and terminal callback.
- **Known Place Analysis:** [Monorepo run #42321054100](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42321054100) completed a generic two-polygon run and retained its result package. That run reported PARTIAL_SCIENTIFIC_METRICS; it is not a paper-exact reproduction or hazard-detection verdict.
- **RiverShift:** [Backend Run #36](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41803576163) processed six actual GCOV acquisition dates over the Jamuna–Chowhali example. [Retrospective replay #41926490047](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926490047) checked the six retained COG checksums and reproduced the three candidate-area values.
- **Regression evidence:** [Monorepo Snapshot Regression #42327901627](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42327901627) completed successfully for the Known Place PR #8 head, including promoted API/web, engine, workflow-contract and snapshot regression suites. It is a branch CI result, not a statement that this PR is deployed.

## Scientific interpretation

The application distinguishes observations, derived measurements, candidate classes, visual previews and scientific interpretation. It does not turn every anomaly into a hazard label or every workflow success into a scientific accuracy claim.

- GOFF offset anomalies are candidates, not automatically calibrated velocity or a 3-D displacement vector.
- GUNW is LOS-sensitive; one LOS component is not automatically downslope, vertical, cumulative or 3-D motion.
- Known Place reports pairwise interval-average rates; the selected reference polygon is not assumed to be stable merely because it is separate.
- RiverShift's water/land transitions are radar-derived candidates, not automatic field-confirmed erosion, deposition, sediment volume, signed migration or flood causality.
- Playback uses actual acquisition dates. Missing observations are not interpolated.
- Missing or insufficient measurements remain withheld; “not measured” is not zero.

The feature guides explain the method and the specific evidence associated with each result.

## Source repositories

- [SARGuardian_Dynamic](https://github.com/moshiour0/SARGuardian_Dynamic) — web application and active API source.
- [SARGuardian-backend](https://github.com/moshiour0/SARGuardian-backend) — scientific processing workers and reusable Actions.
- [SARGuardian-Monorepo](https://github.com/moshiour0/SARGuardian-Monorepo) — consolidated source, engine packages, provenance and submission evidence.

## Repository structure

apps/web/ contains the web application; apps/api/ contains the API; engines/ holds Find Displacements, Known Place and RiverShift packages; science/ preserves NISAR science source; migration/source-snapshots/ stores pinned source snapshots and history; docs/submission/ contains the judge-first evidence package.

## Reproducibility and contribution

Start with the feature guide for the engine you intend to run. Follow its setup instructions, required environment variables, acquisition/data eligibility gates and test commands. Never commit Earthdata, Firebase Admin, Supabase service-role, GitHub, callback-signing or Google Drive credentials. Do not publish private raw data or job artifacts as source fixtures.

The repository is a technical evidence workspace as well as a codebase; historical migration and scientific-audit material is retained for provenance. Judges should begin with the curated docs/submission/ guides, not infer current product capabilities from archived branches or old migration notes.

## Links

- [Interactive application](https://sar-guardian-dynamic-lilac.vercel.app)
- [NASA Space Apps 2026 — Dancing with the SARs](https://www.spaceappschallenge.org/2026/challenges/dancing-with-the-sars/)
- [NASA NISAR mission](https://science.nasa.gov/mission/nisar/)
- [ASF NISAR product guides](https://nisar-docs.asf.alaska.edu/)
