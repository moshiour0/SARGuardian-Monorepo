# GitHub Actions workflow migration register

**Audited baseline:** 42 YAML workflows — 7 in Dynamic and 35 in backend.  
**Inventory SHA:** Dynamic `dd64b7adc90594f1d7f316b352e39fbac2013cb6`; backend `97d849454918b1425ac41bb70e7a32d11cfd3833`.  
**Status:** initial file-level inventory completed. Classification is evidence-based from workflow YAML names, triggers, jobs, secret references, and checkout declarations. “Retain candidate” is not authorization to enable the workflow in the monorepo.

## Classification legend

- **CI regression:** safe to promote after path updates and test parity.
- **Operational dispatcher/worker:** runtime path, caller, API URL, callback, and secret migration must be proven before promotion.
- **Credentialed/live integration:** manual or live external-data access; keep gated and do not run as migration CI.
- **Retained replay/validation:** historical/retained external evidence; preserve but do not auto-trigger during migration.
- **Legacy review:** cross-repo or older-source identity needs explicit caller/provenance decision.
- **Infrastructure diagnostic:** manual environment/performance check, not a production engine.

## Dynamic source workflows (7)

All paths below are from `SARGuardian_Dynamic@dd64b7a`.

| Workflow | Source blob SHA | Trigger | Job(s) | Observed dependency / risk | Migration disposition |
|---|---|---|---|---|---|
| `backend-tests.yml` | `1d20d3021976853b98c735f2629f16aac2d1dc98` | push, pull_request | backend-tests | Dynamic API tests; no cross-repo checkout observed | CI regression |
| `frontend-tests.yml` | `de7ad2eb1caf5a5cb7dd326a0133cc7ebef2871d` | push, pull_request | frontend | Node build/lint/unit tests | CI regression |
| `known-place-analysis.yml` | `2fec69265f9b5c18d11034959850034233e66672` | workflow_dispatch | analyze-known-place | Credentialed Drive/callback processing path | Operational dispatcher; map to PR #85 engine contract |
| `known-place-paper-reproduction.yml` | `bfdec667a61820afbc5edb195658e5046c4ef603` | workflow_dispatch | author-exact-p05023-replay | Credentialed author-exact replay | Gated benchmark/reproduction workflow; keep manual |
| `sarguardian-aoi-product-worker.yml` | `656d105a9b1543f7fac20db199babb81cba844a7` | workflow_call | process | Reusable worker; checkout of `moshiour0/SARGuardian`; secrets | Operational reusable worker; preserve exact input/output contract |
| `sarguardian-aoi-wkt-dashboard.yml` | `ed74c64295de18dd6310a43f323baca4d6923f34` | workflow_call, workflow_dispatch | manifest, process-products, retry-plan, dashboard | Calls external Dynamic/backend/science repositories; secrets and callback flow | Core AOI workflow; must be adapted only after dispatcher/worker graph is mapped |
| `sarguardian-displacement.yml` | `eb6f8fd76fd941c384438c7fa18cd62ce2ca6714` | workflow_dispatch | report-running, process-dynamic-aoi, report-terminal | Credentialed dispatch/callback orchestration | Operational dispatcher; verify current caller and avoid dual dispatch |

## Backend source workflows (35)

All paths below are from `SARGuardian-backend@97d8494`.

| Workflow | Source blob SHA | Trigger | Job(s) | Observed dependency / risk | Migration disposition |
|---|---|---|---|---|---|
| `dashboard-assets-test.yml` | `75926ca204fd4f8e8fb327ddd8f5ce719e9e0720` | push, pull_request | dashboard-assets | Dashboard asset checks | CI regression |
| `dashboard-real-artifact-smoke.yml` | `9179d9b58adbd36f01771b700f8a957d7c3402d9` | push, workflow_dispatch | rebuild | External science checkout and credentials; real retained artifact smoke | Credentialed/live smoke; do not run in PR CI |
| `earthdata-auth-test.yml` | `0d6001ebb9e454cd8da641d646c5401c9608a0cc` | workflow_dispatch | authenticate | Earthdata credential use | Manual credentialed integration test |
| `earthdata-token-smoke-test.yml` | `23f8fea2706bee7326b2878504d76c819cf4825c` | workflow_dispatch | test-earthdata-token | External checkout of `moshiour0/SARGuardian`; credentials | Manual credentialed token smoke |
| `know-place-aoi-dispatcher.yml` | `90b254a68dae6c8449edeacf4ea205743ee89380` | workflow_dispatch | known-place-aoi-analysis | Dispatches Known Place AOI processing | Operational dispatcher; reconcile against Dynamic API and PR #85 |
| `know-place-paper-reproduction-dispatcher.yml` | `42216b46f0b4b842c079dc25eccd015efa9ffbb5` | workflow_dispatch | author-exact-p05023-replay | Credentialed author-exact benchmark dispatcher | Gated paper-reproduction dispatcher |
| `nisar-discovery-test.yml` | `fd5405888c26832405952fb5457bf9f88b4ee89f` | workflow_dispatch | discover | Manual discovery test with credential references | Manual catalogue/auth integration test |
| `nisar-goff-timeseries-test.yml` | `e2fb0400ef4262285679c646231cb89fca91ba93` | workflow_dispatch | goff-timeseries | Checks out `Sagormodak/SARGuardian`; credentialed | Legacy source-owner review; do not silently change fork/ref |
| `nisar-gunw-earthaccess-discovery-test.yml` | `3a4cac2e9a72c9a866591cce62dea48f2aa97fb0` | workflow_dispatch | discover-gunw | Checks out `Sagormodak/SARGuardian`; credentialed | Legacy source-owner review; manual Earthaccess test |
| `nisar-gunw-earthaccess-read-test.yml` | `8c9d879aad01668ff9e6f73e73e0e3542f171442` | workflow_dispatch | read-gunw | Checks out `Sagormodak/SARGuardian`; credentialed remote data read | Legacy source-owner review; keep manual |
| `nisar-gunw-science-test.yml` | `3de36c147846d7b4b7d1eb33c8c8a6e8ac3af1bd` | workflow_dispatch | gunw-science-test | Checks out `Sagormodak/SARGuardian`; credentialed | Legacy source-owner review; science regression should use pinned source snapshots |
| `nisar-gunw-timeseries-test.yml` | `63ecf84b34983d8d0a8af3e32cf20bd5ff218440` | workflow_dispatch | gunw-timeseries | Checks out `Sagormodak/SARGuardian`; credentialed | Legacy source-owner review; manual only |
| `nisar-multi-granule-storage-test.yml` | `4e9ea77e0c374fae7b92325f41e859de805c8a0f` | workflow_dispatch | storage-test | Credentialed storage integration | Manual storage integration test |
| `nisar-single-download-test.yml` | `cfb86b48e127e1f52a400783287d3bc47b97c0ad` | workflow_dispatch | download-test | Credentialed remote product download | Manual remote download test; avoid as routine CI |
| `retention-archive-tests.yml` | `3a81ad4c8adcf7dbb192ec44592a5eec355cc686` | push, pull_request | hdf5-retention-regression | Isolated HDF5/archive fixtures | CI regression |
| `river-shift-gcov-process.yml` | `1720bc68ffb286d22caf48e94433301c8053a1a3` | workflow_dispatch | 20 jobs: prepare, four batch/status barriers, three retry waves, assemble | GCOV processing; credentials, Drive, callback; retries failed products only | Production worker candidate; keep isolated until dispatch/callback cutover gate |
| `river-shift-independent-reference-validation.yml` | `adc1fd557885f4274cef29dc06a67d18ffe60903` | workflow_dispatch | validate | Independent reference-data validation; credentials | Manual validation workflow; preserve distinct from GCOV processing |
| `river-shift-opera-dswx-s1-retained-replay.yml` | `4615e2f4ae82a7bcc51ba58d66a76abb7d2e0e5e` | push, workflow_dispatch | reference | Retained OPERA DSWx-S1 replay; secrets | Retained replay; remove/contain push trigger before promotion |
| `river-shift-run36-retrospective-replay.yml` | `7e2e6449ff7d1e47f4a35fd550a3dca9a80d9cc5` | workflow_dispatch, push | replay | Retained historical Run #36 replay; secrets | Historical replay; remove/contain push trigger before promotion |
| `river-shift-sentinel2-retained-replay.yml` | `79291b782a51fdd0e01e71a3376e516f4fd19a99` | push, workflow_dispatch | cross-sensor | Retained Sentinel-2 cross-sensor replay; secrets | Retained replay; remove/contain push trigger before promotion |
| `river-shift-tests.yml` | `d9f69946b85b0f65e8e2d1576ee4df756891f6d9` | push, pull_request | river-shift-tests | Pinned geospatial environment and isolated tests | CI regression |
| `runner-test.yml` | `afba718f35d35a9bdd5d483e054434e5e2e9c8e5` | workflow_dispatch | benchmark | Manual runner performance benchmark | Infrastructure diagnostic |
| `sarguardian-aoi-code-validation.yml` | `1bbff061aae409d27a5089cd13e380aac6079b86` | push, pull_request | static-and-parser-tests | External checkout of NISAR science source; secrets references | CI regression; retarget checkout to exact monorepo science pin after parity |
| `sarguardian-aoi-live-discovery-check.yml` | `30bbadd02b42d17cebf7e14be915ff32c8b29c42` | push, workflow_dispatch | catalog-only | Live ASF/NISAR discovery; external science checkout | Live catalogue validation; no automatic PR execution |
| `sarguardian-aoi-product-worker.yml` | `15dc032db32a568dfb6acc5777b54332364d084b` | workflow_call | process | Reusable scientific worker; external science checkout and secrets | Operational reusable worker; reconcile with Dynamic copy before choosing canonical |
| `sarguardian-aoi-wkt-dashboard.yml` | `eabdc43e0e0b05fccd532647bbddde2216694e64` | workflow_call, workflow_dispatch | report-running, manifest, process-products, retry-plan, retry-products, dashboard, report-terminal | Cross-repo Dynamic/backend/science checkouts; callback and Drive secrets | Core Find Displacements workflow; preserve graph; resolve Dynamic/backend duplicate roles |
| `sarguardian-aoi-wkt-dispatcher.yml` | `54298d915902884c5d65fdd41027c54864fba8ae` | workflow_dispatch | run-isolated-aoi-pipeline | AOI job dispatcher | Operational dispatcher; verify no dual-dispatch before promotion |
| `sarguardian-extended-science.yml` | `c615376a2b73ca0fa99a552b03fce212ff5f4288` | workflow_dispatch | extended-science | External NISAR science checkout and secrets | Manual extended-science processor; preserve source pin |
| `sarguardian-live-validation.yml` | `e5d73c5b7301ab3496bd99658a6914258c695a68` | workflow_dispatch | validate-retention | Live retention/validation; external science source and credentials | Gated live validation; not PR CI |
| `sarguardian-product-worker.yml` | `8220ed86db68795af257263792fcef3ef224dec7` | workflow_call | no-product-work, process | Reusable product processing; external science checkout and secrets | Operational reusable worker; resolve overlap with AOI product worker |
| `sarguardian-reassemble-existing.yml` | `f4cb4d5155688a9795db9531c1eb92ff69327e91` | workflow_dispatch | reassemble | Reassembly from retained artifacts; external science source and secrets | Manual recovery/assembly tool; retain rollback and receipt checks |
| `sarguardian-retention-ci.yml` | `6e7e46fcbaa1fbd40f66c5868e4aad31e101f2c9` | push, pull_request | regression-tests, pinned-science-regression | Retention fixtures and pinned science regression | CI regression; keep external pinned source explicit until internal path parity |
| `sarguardian-retention-pilot.yml` | `1e6f1b0d3c8318ca2a2de9a87e2256285f07d9d6` | workflow_dispatch | retain-one-granule | Credentialed one-granule retention pilot and external science checkout | Manual pilot; require explicit operator approval |
| `sarguardian-science-worker.yml` | `a096ecc12f27f46c43258e5684f2e01926009097` | workflow_dispatch | sarguardian-science | Checks out `Sagormodak/SARGuardian`; credentials | Legacy source-owner review; pin replacement must be evidence-based |
| `sarguardian-streaming-batch.yml` | `0215889d14473fee64d5343972612b8993dc2a8b` | workflow_dispatch | manifest, process-one, retry-plan, retry-products, preassembly-verify, aggregate | Streaming products, external science source, Drive and callback secrets | Operational batch workflow; preserve failure propagation and artifact contracts |

## Inventory findings

- 42/42 source workflow files have been enumerated and source blob SHAs recorded.
- No source workflow contains a `schedule` trigger at the audited baseline.
- Production-sensitive processing workflows are predominantly manual dispatch or reusable `workflow_call` workflows.
- Three retained RiverShift replay workflows have `push` triggers in addition to manual dispatch. These must not be promoted unchanged into the monorepo because unrelated source pushes could cause replay activity.
- Multiple worker/test workflows still check out `Sagormodak/SARGuardian`. Do not silently redirect these to `moshiour0/SARGuardian` until source identity and expected historical revision are verified.
- Dynamic and backend each contain copies of similarly named AOI worker/dashboard workflows. Their role must be decided from actual callers and payload contracts, not filename similarity.
- The root monorepo workflows currently include only migration metadata validation and isolated snapshot regression validation. Imported source workflow folders remain nested/inactive.

## High-risk engine constraints

### RiverShift GCOV
The main GCOV process has 20 jobs: prepare, four sequential batch/status barriers, up to three retry waves, final assemble. Keep batches of 15 where configured, retry only failed products, do not re-download successful products, retain stage-specific evidence, and propagate required inner failures to the outer conclusion.

### Known Place
The actual PR #85 head is based on `feat/know-place-analysis`, not backend main. Keep the P05023 author-exact benchmark and independent two-polygon additions from that lineage. Do not import only the backend-main dispatcher and assume the engine is present.

### Find Displacements
Keep the target-free AOI workflow separate from Known Place and RiverShift. Preserve the different reusable-worker/dashboard roles in Dynamic and backend until API dispatch call graph is fully traced. GOFF and GUNW diagnostics remain separate.

## Promotion gate for each workflow

No workflow should move into root `.github/workflows/` until its trigger scope, callers, job graph, permissions, secrets/variables, external checkouts, artifacts, callback contract, retention, failure behavior, and rollback path are documented and tested. Production workflows remain disabled/isolated until explicit cutover approval.
