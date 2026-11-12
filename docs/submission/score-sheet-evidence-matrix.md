# SARGuardian — NASA Space Apps 2026 Score-Sheet Evidence Matrix

**Challenge:** Dancing with the SARs  
**Category:** Earth Science  
**Project:** SARGuardian — Earth in Sight  
**Rubric source:** Project Library file "Score Sheet.md"

This matrix is an evidence navigator. It does not assign a guaranteed score. Judges should be able to verify each criterion from the application, feature guide, source record or linked workflow evidence.

## Scoring structure

| Group | Criterion | Points |
|---|---|---:|
| Headline | Impact | 1–20 |
| Headline | Creativity | 1–20 |
| Headline | Validity | 1–20 |
| Headline | Relevance | 1–20 |
| Headline | Presentation | 1–20 |
| Additional | Teamwork | 1–5 |
| Additional | User experience | 1–5 |
| Additional | NASA data usage | 1–5 |
| Additional | Challenge category identified | 0 or 1 |
| Additional | Repository access | 0 or 1 |
| Additional | Project page complete | 0 or 1 |

The first five criteria total **100 points**. The additional criteria total **18 points**, giving **118 points before the local women-participation bonus**. The supplied local score sheet lists a **+5%** bonus for teams with one or more women members. This is treated here as a rule on that local score sheet; do not represent it as a universal NASA global-judging rule.

## Evidence map

**Revised desk estimate:** 98/118 before bonus (Impact 18, Creativity 18, Validity 16, Relevance 19, Presentation 15; Teamwork 1 provisional, UX 4, NASA data 5, category 1, repository 1, project page 0). Full rationale and caveats are in [the revised Bangla score audit](SCORE_SHEET_AUDIT_BN_2026-11-07.md).

| Criterion | What SARGuardian demonstrates | Where to inspect |
|---|---|---|
| **Impact** | Four user-facing workflows, target-free AOI discovery, real processing runs and global applicability wherever compatible NISAR products are available in the public archive. Upstream acquisition/release limits are not application failures. | [Whole-project guide](SARGuardian_JUDGE_GUIDE.md), [Find Displacements](features/landslide-find-displacements.md), [Glacier Movement](features/glacier-movement.md), [Known Place](features/known-place-analysis.md), [RiverShift](features/river-shift.md) |
| **Creativity** | Connected chain: AOI-first discovery → candidate traceability → user-controlled Measurement/Reference geometry → method-specific result → provenance; plus a separate GCOV RiverShift engine and Public/Explorer/Scientific audience views. | Feature guides; application at https://sar-guardian-dynamic-lilac.vercel.app |
| **Validity** | Product-specific measurement semantics; product/geometry/valid-pixel gates; provenance/checksums; real NISAR processing; regression tests and retained-data replay; explicit withholding when reference or support is insufficient. Independent physical accuracy remains a separate evidence question. | Linked Actions runs in the [judge index](README.md); docs/scientific-validation/; engine test suites |
| **Relevance** | GUNW, GOFF and GCOV are central measurement inputs for the workflows, rather than decorative satellite imagery. | Whole-project guide; source repositories; ASF product guides |
| **Presentation** | One deployed live application, four workflow stories, three audience depths, real catalogue-to-processing walkthrough, actual-date playback, source-linked examples and a 4-minute film + 30-second teaser script. | Application; [judge index](README.md); [video storyboard](VIDEO_STORYBOARD_DRAFT.md) |
| **Teamwork** | Team roles and collaboration contributions can be shown using actual member records, commits and issue/PR history. | Official team/project page and verified contribution history |
| **User experience** | Public / Explorer / Scientific views let non-specialist, curious and research users inspect the same evidence at suitable depth; AOI, dates, product eligibility, layers and provenance remain connected. First-time-user testing is the remaining 5/5 proof. | Live application; feature guides; recorded first-time-user demonstration |
| **NASA data usage** | NISAR is the primary measurement source; NASA Earthdata/CMR and ASF DAAC support discovery/access. Cross-sensor, gauge, OSM and basemap sources are separately attributed by role. | Source manifest, workflow documentation, whole-project guide |
| **Challenge category** | “Dancing with the SARs” and “Earth Science” are named in the project submission draft. | [Project-page draft](SARGuardian_PROJECT_PAGE_DRAFT.md); official NASA project page |
| **Repository access** | GitHub repository metadata currently reports this Monorepo as **public**; the original Dynamic and Backend repositories are also public. | https://github.com/moshiour0/SARGuardian-Monorepo ; https://github.com/moshiour0/SARGuardian_Dynamic ; https://github.com/moshiour0/SARGuardian-backend |
| **Project page complete** | A complete copy-ready project-page draft is prepared. The one-point criterion depends on the official NASA project page being filled, submitted and accessible. | [Project-page draft](SARGuardian_PROJECT_PAGE_DRAFT.md); official NASA project page |

## Workflow-to-measurement map

| User-facing workflow | Engine relationship | NISAR product | Measured / derived quantity |
|---|---|---|---|
| Landslide | Find Displacements | GOFF and conditionally GUNW | Pairwise offset-anomaly candidates; relative LOS displacement diagnostics |
| Glacier Movement | Shared Find Displacements | GOFF and conditionally GUNW | Candidate glacier-terrain motion signals under the same measurement rules |
| Known Place Analysis | Separate two-polygon workflow | GOFF | Relative horizontal displacement and pairwise interval-average rate |
| RiverShift | Independent GCOV workflow | GCOV | Observed-date water-screening and persistent land/water transition candidates |

## Reproducible workflow evidence

- **Find Displacements:** [Backend run #42097077601](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601) completed its AOI processing chain, including failed-only recovery for one GUNW product, dashboard assembly and terminal callback.
- **Known Place:** [Monorepo run #42321054100](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42321054100) completed a generic two-polygon run and retained the result package. That run's scientific metrics status is PARTIAL_SCIENTIFIC_METRICS.
- **Known Place regression:** [Snapshot Regression #42327901627](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42327901627) passed the PR #8 promoted API/web, engine, workflow-contract and source-integrity test suites.
- **RiverShift:** [Backend Run #36](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41803576163) processed six actual GCOV dates. [Retrospective replay #41926490047](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926490047) checked six retained COG SHA-256 values and reproduced the three candidate-area outputs.

## Product-specific evidence semantics

### Landslide / Find Displacements
- Find Displacements is target-free AOI-wide discovery; it does not require a target point.
- GOFF and GUNW remain separate measurement families.
- A GOFF offset anomaly is not by itself a velocity or a landslide verdict.
- A GUNW LOS measurement is not automatically vertical, downslope, cumulative or three-dimensional movement.

### Glacier Movement
- Glacier Movement uses the shared Find Displacements engine; it is not represented as a separate glacier-collapse physics model.
- A candidate motion signal is not an automatic ice–rock avalanche or glacier-collapse prediction.
- A glacier-specific physical interpretation requires a real glacier study area, its acquisition geometry and suitable independent context.

### Known Place Analysis
- Generic two-polygon analysis and author-exact P05023 benchmark reconstruction are separate paths.
- The Reference Polygon is a comparison region; its stability is not guaranteed by geometry alone.
- A pairwise horizontal rate is averaged over the exact acquisition-midpoint interval, not instantaneous or 3-D velocity.
- The P05023 benchmark's headline numerical agreement is not, by itself, a full replication of every author geometry/null-control method or a hazard detector.

### RiverShift
- GCOV is the primary measurement source. Catalogue footprint intersection is not the same as valid raster support.
- Red/green/blue classes are screening candidates; preview geometries are not authoritative measurement masks.
- Run #36's cross-sensor reference review is NO_MATCH_NO_SCORE / PROVISIONAL; there is no F1/IoU score for that retained example.
- Actual-date playback is not interpolation or forecasting.

## Judge navigation

The recommended reading path is:

1. [Evidence index](README.md)
2. [Whole-project judge guide](SARGuardian_JUDGE_GUIDE.md)
3. Each relevant [feature guide](README.md#read-the-evidence-in-this-order)
4. [Project-page draft](SARGuardian_PROJECT_PAGE_DRAFT.md)
5. [Video storyboard](VIDEO_STORYBOARD_DRAFT.md)
6. Public source repositories and the linked workflow records

The curated guides provide the project narrative and evidence links. Engineering and scientific audit documents remain in their respective folders as detailed source records; they are not substitutes for the judge-first guide.

## Submission checks

- [ ] All team members and contributions are accurate.
- [ ] The final video and screenshots are recorded from the current application and linked publicly.
- [ ] Repository links open while signed out; no secrets or private user data are exposed.
- [ ] The official project page has all required fields and its submitted state is confirmed.
- [ ] Challenge title/category and all attributions are correct.
