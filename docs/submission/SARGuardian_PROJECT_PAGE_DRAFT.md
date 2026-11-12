# SARGuardian — NASA Space Apps 2026 Project Page Draft

**Project title:** SARGuardian — Earth in Sight  
**Challenge:** Dancing with the SARs  
**Category:** Earth Science

> Team working copy. Replace only the marked team/media fields with verified information before submission.

## One-sentence pitch

SARGuardian is a live, AOI-driven NISAR processing platform—not a static result demo. Users select a place and time window, discover compatible observations in the public archive, and launch the processing path suited to the question.

## Project description

Earth's surface is always changing, but radar products can be difficult to interpret outside specialist workflows. SARGuardian — Earth in Sight connects NASA–ISRO NISAR observations to a live, browser-based processing experience. A user chooses a surface-change question, selects any study area and observation period, and the application searches the public archive for compatible products before launching the matching processing path. The platform is geographically applicable wherever the mission observation plan and public archive provide compatible acquisitions; it does not claim observations for every place on every date. When the archive has insufficient coverage, that limitation must be shown rather than hidden.

The platform provides four workflows. Landslide screening and Glacier Movement use the shared target-free Find Displacements engine to discover candidate surface-motion signals inside a user-selected AOI. Known Place Analysis uses separate Measurement and Reference Polygons to estimate relative pairwise displacement and interval-average rates from GOFF offsets. RiverShift is an independent GCOV workflow that screens actual acquisition dates for open-water and persistent land/water transitions in a selected river reach.

NISAR is the measurement source rather than a decorative map layer. GUNW, GOFF and GCOV remain distinct product families because they measure different radar quantities. The interface connects results to actual acquisition dates, product provenance and quality evidence, helping users understand what the observations show and what kind of interpretation they support. Public, Explorer and Scientific dashboard views present the same underlying evidence at different levels of detail without changing the measurement.

## What users can explore

- Target-free AOI displacement-candidate discovery for landslide study areas.
- Glacier-movement candidate screening through the shared displacement engine.
- Two-polygon known-place analysis using a separate measurement and reference region.
- RiverShift GCOV screening for observed-date water and persistent land/water transitions.
- Source acquisition dates, data provenance, output layers and workflow evidence.
- Three audience views: Public for simple interpretation, Explorer for deeper map/timeline inspection, and Scientific for methods, support and provenance.

## Demonstration evidence

**Find Displacements:** [Backend processing run #42097077601](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601).

**Known Place Analysis:** [Generic AOI run #42321054100](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42321054100). The workflow completed and retained a result package with partial scientific metrics.

**RiverShift:** [Jamuna–Chowhali Run #36](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41803576163), plus [checksum-bound retrospective replay #41926490047](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926490047).

## Data and technology

Primary measurement data are NASA–ISRO NISAR Level-2 GUNW, GOFF and GCOV products. NASA Earthdata, NASA CMR and ASF DAAC support discovery and access. Optional OPERA DSWx-S1 and Sentinel-2 comparisons are kept separate from NISAR measurement inputs and are only reported when their reference criteria pass. OpenStreetMap provides mapped exposure context; Google Maps Satellite provides visual geographic context.

## Live application and repositories

**What “live” means:** the deployed application can accept a user-selected AOI/date request, search actual catalogue records and initiate the connected processing pipeline for compatible available products. It does not mean instant results, daily interpolation, continuous global monitoring or data for every requested date. The initial public provisional NISAR L-band release began 20 July 2026 and included acquisitions from 17 June 2026 onward; new products are added as processing completes. Sources: [ASF release notice](https://asf.alaska.edu/notices/nisar-l-band-data-now-publicly-available/) · [ASF data availability guide](https://hyp3-docs.asf.alaska.edu/nisar-docs/availability-overview/).

- **Interactive application:** https://sar-guardian-dynamic-lilac.vercel.app
- **Backend science:** https://github.com/moshiour0/SARGuardian-backend
- **Web application and API:** https://github.com/moshiour0/SARGuardian_Dynamic
- **Consolidated source/evidence workspace:** https://github.com/moshiour0/SARGuardian-Monorepo
- **Judge evidence index:** https://github.com/moshiour0/SARGuardian-Monorepo/blob/docs/space-apps-judge-pack-20261107/docs/submission/README.md

## Team

- [TEAM MEMBER] — [verified contribution]
- [TEAM MEMBER] — [verified contribution]
- [TEAM MEMBER] — [verified contribution]

Add only real team members and their actual contributions.

## Media

- **Demo video:** [ADD PUBLIC VIDEO URL AFTER RECORDING AND UPLOAD]
- **Screenshots:** [ADD PUBLIC SCREENSHOTS OR PROJECT MEDIA]

## Acknowledgements

NASA and the NASA–ISRO NISAR mission; NASA Earthdata and ASF DAAC for data discovery and access; and the third-party data and mapping services identified in the project documentation. Preserve each source's required attribution.

## Final submission checklist

- [ ] Confirm all team member names and contributions.
- [ ] Record and upload the final demonstration video.
- [ ] Replace all media placeholders with public links.
- [ ] Verify that the application and all repository links open in a signed-out browser.
- [ ] Confirm the challenge/category values in the official submission form.
- [ ] Confirm all project-page fields are filled and the official page reports submitted.
