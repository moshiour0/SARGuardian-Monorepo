# SARGuardian — Whole-Project Validation Protocol

**Challenge:** NASA Space Apps 2026 · Dancing with the SARs  
**Purpose:** provide one repeatable validation path across the four user-facing workflows and the shared application experience.

## 1. What is being validated

SARGuardian exposes four entry workflows backed by three distinct processing paths:

- Landslide and Glacier Movement share Find Displacements.
- Known Place Analysis is a separate two-polygon GOFF measurement workflow.
- RiverShift is a separate GCOV water/land-transition screening engine.

The whole-project validation must check both the individual engine contracts and the user-facing journey that connects AOI selection, date selection, catalogue eligibility, processing, result retrieval and provenance.

## 2. Evidence register

| Layer | Evidence | What it proves |
|---|---|---|
| Find Displacements processing | [Backend run #42097077601](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601) | The selected AOI job completed processing, failed-only retry, dashboard assembly and terminal callback |
| Known Place processing | [Monorepo run #42321054100](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42321054100) | The generic two-polygon request completed and retained its result package; scientific state was PARTIAL_SCIENTIFIC_METRICS |
| RiverShift worker tests | [Backend run #41926825076](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926825076) | The documented RiverShift worker regression suite completed successfully |
| RiverShift real-data case | [Backend Run #36](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41803576163) and [retrospective replay #41926490047](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926490047) | Six-date GCOV example and checksum-bound reproduction of the candidate-area results |
| Cross-engine regression | [Monorepo Snapshot Regression #42327901627](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42327901627) | API, web, engine, workflow-contract and source-snapshot regression jobs on the PR #8 head completed successfully |

## 3. Whole-project acceptance checklist

### Product and challenge alignment
- [ ] The project page names the exact challenge “Dancing with the SARs” and category “Earth Science”.
- [ ] All four user-facing workflow paths are visible from the application.
- [ ] Landslide and Glacier Movement are described as shared-engine use cases, not separate processing engines.
- [ ] Known Place and RiverShift are shown as separate processing paths.

### NASA data and provenance
- [ ] Each result page identifies its NISAR product family: GUNW, GOFF or GCOV.
- [ ] Each processed job retains source granule identity and actual acquisition dates.
- [ ] The result method, units, masks, valid support and processing configuration are discoverable.
- [ ] Ancillary and third-party sources are labelled by their actual role.
- [ ] No missing measurement, invalid pixel or reference no-match is converted into zero.

### Engine and API contracts
- [ ] Find Displacements candidate outputs trace to the source pair and preserve GOFF/GUNW separation.
- [ ] Known Place retains both polygons, pair provenance, valid reference support and exact interval days.
- [ ] RiverShift retains source receipts, common-grid metadata, class masks and mask/preview QA.
- [ ] Terminal processing failures cannot be presented as successful scientific results.
- [ ] Result retrieval links to the job/report that produced the visible data.

### User experience
- [ ] A first-time user can select a workflow and draw/paste a valid AOI.
- [ ] Date and catalogue support are visible before expensive processing.
- [ ] Layer names and legends explain what the data represent.
- [ ] Playback advances only through actual observations.
- [ ] Map previews are visually distinguished from authoritative full-resolution measurements.
- [ ] Keyboard, mobile and desktop interaction is checked with a real human user.

### Scientific interpretation
- [ ] Candidate signals are not labelled as confirmed hazards without supporting evidence.
- [ ] LOS, offsets and covariance/backscatter keep their own geometry and units.
- [ ] Reference stability is not assumed from polygon selection alone.
- [ ] Independent accuracy metrics appear only after an eligible reference and declared support gates pass.
- [ ] The video and project page use the same units, run IDs, dates and terminology as the retained evidence.

### Submission and access
- [ ] Repositories are public and links open in a signed-out browser.
- [ ] No secrets, personal information or private raw science artifacts are exposed.
- [ ] The team list and roles reflect real members and actual contributions.
- [ ] The video and screenshots are publicly accessible.
- [ ] The official NASA project page is complete and displays a submitted state.

## 4. Run the automated checks

Use the commands documented by each engine and the Monorepo workflow. For the current documentation branch, the relevant cross-engine evidence is Snapshot Regression #42327901627. Do not run an expensive NISAR acquisition merely to refresh a documentation badge; a new live-data run should only be initiated when it adds a distinct study result or tests a changed processing contract.

## 5. Project-wide interpretation rules

1. **Processing PASS** means the declared software workflow and artifact contract completed.
2. **Regression PASS** means the tested code contract passed on the identified commit.
3. **Checksum PASS** means the file content matched the recorded digest.
4. **Retrospective reproduction** means current code regenerated recorded outputs from the identified retained inputs; it does not rewrite the original workflow artifact.
5. **Independent validation** requires a separate, suitable reference with temporal/spatial alignment and a documented comparison protocol.
6. **Human review** requires a named reviewer and a traceable review record.

These states are related but not interchangeable.

## 6. Release evidence and current branch boundary

The Known Place confidence-interval implementation associated with PR #8 is on a separate draft branch and has passing Snapshot Regression evidence. The PR remains unmerged; its Vercel checks were blocked by the Hobby build-rate limit. Do not describe the interval UI changes as deployed in the public application until a deployment is verified.

This submission documentation branch is also separate from Monorepo main. It changes documentation only and does not start live NISAR processing, change credentials, merge PR #8 or alter production deployments.

## 7. Judge navigation

Start with [the evidence index](README.md), continue to the [whole-project judge guide](SARGuardian_JUDGE_GUIDE.md), then use the [feature validation guides](README.md#read-the-evidence-in-this-order) and the [score-sheet evidence matrix](score-sheet-evidence-matrix.md).
