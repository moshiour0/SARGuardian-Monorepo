# SARGuardian — Revised Local Score-Sheet Audit
## Evidence, corrected impact framing, revised scores and judge-facing strategy

**Review date:** ৭ নভেম্বর ২০২৬  
**Project:** SARGuardian — Earth in Sight  
**Challenge:** Dancing with the SARs  
**Category:** Earth Science  
**Rubric:** Project Library-এর supplied Score Sheet.md  
**Review type:** Evidence-based desk estimate; official NASA judge score নয়।

> **Revised evidence-based estimate: ৯৮ / ১১৮ (৮৩.১%) — bonus-এর আগে।**  
> Headline criteria: **৮৬ / ১০০**। Additional criteria: **১২ / ১৮**।  
> এই revision-এ NISAR data-release limitation-কে SARGuardian-এর failure হিসেবে গণনা করা হয়নি। Teamwork score contribution graph/CSV ও member-level evidence যাচাই না হওয়া পর্যন্ত provisional রাখা হয়েছে।

## ১. Revised score summary

| # | Criterion | Maximum | Revised estimate | কেন |
|---:|---|---:|---:|---|
| 1 | Impact | 20 | **18** | চারটি workflow, target-free AOI discovery, live AOI-driven processing এবং NISAR observation-plan coverage যেখানে available—global applicability শক্তিশালী |
| 2 | Creativity | 20 | **18** | discovery → candidate traceability → user-defined measurement → evidence chain; সঙ্গে পৃথক GCOV RiverShift engine |
| 3 | Validity | 20 | **16** | product-specific measurement semantics, real NISAR runs, provenance/quality gates, regression ও reproducibility; independent physical validation এখনও সীমিত |
| 4 | Relevance | 20 | **19** | NISAR GUNW/GOFF/GCOV-ই মূল measurement input |
| 5 | Presentation | 20 | **15** | product ও evidence শক্তিশালী; final 4-minute video, short cut এবং public submission media এখনও তৈরি/প্রকাশের অপেক্ষায় |
| 6 | Teamwork | 5 | **1 provisional** | user-reported two-person contribution ও graph evidence এখনও member-level ভাবে এই review-তে verify করা যায়নি |
| 7 | User experience | 5 | **4** | Public, Explorer এবং Scientific audience অনুযায়ী তিন স্তরের dashboard; first-time-user/accessibility validation এখনও নেই |
| 8 | NASA data usage | 5 | **5** | NISAR measurement data + NASA/ASF discovery; third-party/contextual sources role-separated |
| 9 | Challenge category identified | 1 | **1** | “Dancing with the SARs” / “Earth Science” চিহ্নিত |
| 10 | Repository access | 1 | **1** | Backend, Dynamic ও Monorepo public |
| 11 | Project page complete | 1 | **0** | draft আছে; official submission complete/confirmed হওয়ার evidence নেই |
|  | **TOTAL** | **118** | **98** | **83.1%** |

এটি আগের ৯০/১১৮ desk estimate থেকে **+৮ points** সংশোধন। এটি judge guarantee নয়; বিচারকরা নিজস্ব interpretation প্রয়োগ করবেন।

### Local bonus

Supplied local score sheet-এ registered team-এ এক বা একাধিক নারী সদস্য থাকলে aggregate-এর উপর +৫% বলা আছে। Registered roster verify না হওয়ায় এটি যোগ করা হয়নি। Eligibility প্রমাণিত হলে ৯৮ × ১.০৫ = **১০২.৯**।

NASA official 2026 submission window: **১৪ নভেম্বর ২০২৬ সকাল ৯টা থেকে ১৫ নভেম্বর ২০২৬ রাত ১১:৫৯ local time**। Submission সম্পন্ন ও confirmation পাওয়া ছাড়া Project Page Complete = ১ হবে না।

---

## ২. Corrected global-impact framing: data availability ≠ product coverage failure

এই পার্থক্যটি judge-facing narrative-এ স্পষ্ট রাখতে হবে।

NASA/ASF-এর প্রকাশিত তথ্য অনুযায়ী:
- NISAR provisional L-band public release শুরু হয়েছে **২০ জুলাই ২০২৬**।
- ওই provisional release-এ **১৭ জুন ২০২৬ বা তার পরের acquisition** অন্তর্ভুক্ত।
- নতুন acquisition-এর L1–L3 products processing-এর পর archive-এ যোগ হতে থাকে; product maturity-ও প্রকাশ করতে হয়।
- data coverage/reference observation plan mission-এর; user-এর AOI-তে উপযুক্ত acquisition না থাকলে application নতুন satellite observation তৈরি করতে পারে না।

অতএব সঠিক product claim:

> **“SARGuardian is AOI-driven and globally applicable wherever compatible NISAR acquisitions are available in the public archive. It discovers the available products for the selected place and time, runs the matching processing path, and reports when coverage or product compatibility is insufficient.”**

এটি বলা যাবে না:
- “Every place has data for every date.”
- “Continuous global monitoring.”
- “Daily measurements everywhere.”
- “No data means SARGuardian failed.”

Data না পাওয়া, acquisition না থাকা, product এখনও release না হওয়া, অথবা product compatibility না থাকা—এগুলো আলাদা state। UI-তে স্পষ্ট NO_DATA / INSUFFICIENT_COVERAGE বা equivalent state থাকলে সেটি স্বচ্ছতার প্রমাণ। তবে ভুল AOI/date handling, broken catalogue query, failed download বা failed worker হলো application-side failure—সেগুলোকে NASA data constraint বলে চালানো যাবে না।

**Official references:**  
- [ASF: NISAR L-band data now publicly available — 21 July 2026](https://asf.alaska.edu/notices/nisar-l-band-data-now-publicly-available/)  
- [ASF NISAR data availability and maturity guide](https://hyp3-docs.asf.alaska.edu/nisar-docs/availability-overview/)  
- [NASA NISAR mission overview](https://science.nasa.gov/mission/nisar/)

## ৩. Headline criteria: ৮৬ / ১০০

### 1 — Impact: ১৮ / ২০

**Why 18 is defensible**

SARGuardian-এর impact claim শুধু satellite imagery map-এ দেখানো নয়। ব্যবহারকারী কোনো আগাম target coordinate না জেনেও একটি area ও date window দিয়ে অনুসন্ধান শুরু করতে পারে; available compatible NISAR products থেকে system candidate/measurement তৈরি করে এবং তা evidence-এর সঙ্গে যুক্ত রাখে।

চারটি user-facing workflow:
1. **Landslide screening:** target-free Find Displacements AOI scan।
2. **Glacier Movement screening:** একই displacement engine glacier/ice study context-এ।
3. **Known Place Analysis:** Measurement Polygon বনাম আলাদা Reference Polygon-এ pairwise measurement।
4. **RiverShift:** স্বাধীন GCOV river-water ও land/water-transition screening engine।

Global reach-এর সঠিক ব্যাখ্যা হলো: user-defined AOI, global observation-plan footprint এবং public archive-এ available compatible acquisitions-এর intersection। NISAR-এর সব location/date archive-এ একসঙ্গে থাকা SARGuardian-এর পূর্বশর্ত নয়; system-এর কাজ হলো যা available সেটি খুঁজে উপযুক্ত workflow চালানো এবং যা নেই সেটি স্পষ্টভাবে জানানো।

**Evidence**
- [Find Displacements live processing run #42097077601](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601)
- [RiverShift Run #36 — six actual GCOV dates](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41803576163)
- [RiverShift retained-data replay #41926490047](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926490047)
- [Live SARGuardian application](https://sar-guardian-dynamic-lilac.vercel.app)

**Why not 20 yet**
- Public case studies ও decision-support impact আরও বিস্তৃতভাবে দেখাতে হবে।
- Platform global AOI-driven হলেও প্রতিটি continent/terrain-এ একই level-এর successful physical case প্রমাণ করা হয়নি।
- Candidate outputs-কে confirmed damage, lives saved, field-measured erosion বা emergency warning বলা যায় না।
- User/adopter outcome—যেমন inspection prioritisation-এর documented use—এখনও সীমিত।

**How to earn 19–20**
- তিনটি engine path জুড়ে বহু-region real-data case cards; প্রতিটিতে AOI, acquisition date, product ID, run link, actual output এবং interpretation boundary।
- কোথায় data available/insufficient ছিল—দুই ধরনের case-ই দেখান; এটি coverage transparency প্রমাণ করে।
- বাস্তব user story দেখান: কোন analyst বা researcher কীভাবে candidate review বা inspection priority বদলেছেন। অনুমান নয়, documented feedback।
- প্রতিটি workflow-এর public result page-এ source manifest ও reproducibility link রাখুন।

### 2 — Creativity: ১৮ / ২০

**মূল creative differentiator**

এটিকে চারটি menu card বা “একটি AI map” হিসেবে উপস্থাপন করবেন না। সবচেয়ে গুরুত্বপূর্ণ originality হলো একটি connected evidence workflow:

**AOI-first discovery → no-target candidate search → candidate-to-source traceability → user-controlled Measurement/Reference geometry → method-specific measurement → provenance and quality evidence.**

তার সঙ্গে RiverShift একটি পৃথক GCOV engine হিসেবে চলে; GUNW, GOFF এবং GCOV-কে এক synthetic metric-এ মেশানো হয় না।

**Creative system elements**
- User-কে আগে থেকে anomaly coordinate দিতে হয় না।
- Find Displacements AOI scan থেকে পাওয়া candidate-কে Known Place-এর suggested Measurement Polygon workflow-তে নিয়ে যাওয়ার পথ আছে; geometry simplify/validate হয়, unsupported geometry নীরবে বাদ যায় না।
- Known Place-এ Measurement Polygon ও Reference Polygon-এর ভূমিকা আলাদা; user selection ও reference support প্রকাশিত হয়।
- RiverShift-এর আলাদা GCOV method actual acquisition dates, observed water এবং persistent transition candidates আলাদা করে।
- তিন স্তরের dashboard একই underlying evidence-কে audience অনুযায়ী উপস্থাপন করে: Public / Explorer / Scientific।

**Judge-facing one-liner**

> **“Start with a place, not a known target. Discover candidate change, measure a selected area against an explicit reference, and trace every result back to the NISAR observations that produced it.”**

**Why not 20 yet**
- অন্য কোনো team বা product-এরই এমন system নেই—এমন universal priority claim করতে comparative market/research review হয়নি।
- Creativity-র বড় অংশ orchestration, workflow design, measurement provenance ও usability integration-এ; নতুন radar physics বা independently validated algorithm claim করা হচ্ছে না।
- পুরো chain-এর একটি uninterrupted real-data demonstration final video-তে এখনও নেই।

**How to earn 19–20**
- AOI → source catalog → candidate → suggested measurement geometry → user-edited two polygons → measured output → evidence manifest—একই real run-এ দেখান।
- Manual conventional workflow-এর সঙ্গে steps/required expertise/evidence traceability তুলনা করুন; time-saving number মাপা ছাড়া বলবেন না।
- Explain করুন কেন GUNW, GOFF এবং GCOV-কে আলাদা রাখা বৈজ্ঞানিকভাবে জরুরি।
- Public, Explorer, Scientific modes-এ একই result-এর তিনটি explanatory depth দেখান।

### 3 — Validity: ১৬ / ২০

**এই ১৬ নম্বরের ভিত্তি**

Validity মানে শুধু external accuracy score নয়। Local rubric-এর তিনটি অংশ হলো scientific soundness, technical feasibility এবং usability। SARGuardian-এর science claims product-specific; actual NISAR inputs, geometry/support checks, provenance, run history এবং regression tests দিয়ে technical feasibility দেখানো যায়।

**Evidence**
- GUNW = relative line-of-sight displacement diagnostic; GOFF = pairwise range/along-track offsets; GCOV = covariance/backscatter-based river screening।
- GOFF candidate ও GUNW LOS এক metric-এ fuse করা হয় না।
- Find Displacements actual AOI run #42097077601-এর processing, failed-only recovery, result assembly ও terminal callback record আছে।
- RiverShift Run #36 ছয়টি actual GCOV acquisition date process করেছে; checksum-bound replay তিনটি candidate-area output পুনরুৎপাদন করেছে।
- RiverShift worker suite-এর 259 tests-এর successful run record আছে।
- Known Place regression run #42327901627 PR #8 head-এ successful; generic AOI run #42321054100 result PARTIAL_SCIENTIFIC_METRICS—পূর্ণ pair/track support নয়।
- PASS, physical validation, candidate, measurement, replay এবং independent reference score আলাদা state হিসেবে রাখা হয়েছে।

**Independent validation still limits the ceiling**
- GOFF anomaly candidate কোনো confirmed landslide/glacier event নয়।
- GUNW LOS component একা 3-D/downslope velocity নয়।
- Known Place Reference Polygon geometric ভাবে আলাদা হলেই stable প্রমাণ হয় না।
- Bhote Koshi P05023 path-এর প্রায় 0.96 m / 4 cm/day headline agreement complete author-exact paper replication নয়; exact editable crown geometry ও author-side null/control details অসম্পূর্ণ।
- RiverShift Run #36-এর reference status NO_MATCH_NO_SCORE / PROVISIONAL; উপযুক্ত external match না থাকায় F1/IoU দেওয়া হয়নি।

**Why ১৬ rather than ১৩**

১৩-র আগের estimate software reproducibility ও method-specific quality controls-কে তুলনামূলকভাবে কম weight দিয়েছিল। বাস্তব NISAR products process, source lineage trace, product-appropriate measurement semantics বজায় রাখা, failed item recovery, checksum replay এবং 259 worker tests—এসব technical feasibility ও method implementation-এর বাস্তব evidence। এগুলো external geophysical validation-এর বিকল্প নয়; কিন্তু validity score-এর গুরুত্বপূর্ণ অংশ।

**How to reach ১৭–১৮**
1. Find Displacements-এর frozen positive + negative/control AOI set, held-out evaluation, precision/recall/false-alarm rate এবং spatial-block uncertainty।
2. GOFF-এ component-specific uncertainty, correlation-peak/SNR এবং multi-resolution consistency diagnostics।
3. GUNW-এ compatible network, common-reference strategy এবং reference stability diagnostic।
4. Known Place-এ reference support fraction, median/spread/outlier diagnostics এবং insufficient-support withholding।
5. RiverShift-এ date-matched external water reference যখন বাস্তবে পাওয়া যায়, common-support mask পাস করে তখনই confusion matrix/F1/IoU/area bias।
6. External reference unavailable থাকলে NO_MATCH_NO_SCORE বজায় রাখুন। Missing reference কখনো 0 accuracy নয়।

### 4 — Relevance: ১৯ / ২০

NISAR GUNW, GOFF ও GCOV প্রকৃত measurement path; NASA Earthdata/CMR ও ASF DAAC acquisition/product discovery-তে ব্যবহৃত। অন্য source—OPERA, Sentinel-2, OpenStreetMap, Google basemap—তাদের নিজস্ব contextual/reference ভূমিকা অনুযায়ী আলাদা।

**২০-এর জন্য:** প্রতিটি demo screen-এ product, granule, acquisition date, maturity/CRID, measurement family ও source role দেখান। Optional reference-কে successful validation বলে দেখাবেন না।

### 5 — Presentation: ১৫ / ২০ (video delivery-এর পর target ১৮)

**বর্তমান evidence**
- Production application: [sar-guardian-dynamic-lilac.vercel.app](https://sar-guardian-dynamic-lilac.vercel.app)
- চারটি workflow, map-based AOI, result layers, acquisition dates ও source/evidence documents আছে।
- Scientific interpretation guardrails ও workflow-specific judge guide প্রস্তুত।

**১৫ কেন:** final 4-minute video, concise 30-second cut, polished screenshot pack এবং non-technical first-viewer walkthrough এখনও final media হিসাবে প্রকাশিত নয়। Script প্রস্তুত করা video publish করার সমতুল্য নয়।

**ভিডিওর core story**
1. Earth পরিবর্তিত হয়; trustworthy evidence দরকার।
2. NISAR কী observation দিয়েছে এবং archive-এ কোন data available।
3. SARGuardian কোনো static map demo নয়—বাস্তব catalogue ও processing path-এ AOI-driven request চালায়।
4. চারটি use case, কিন্তু তিনটি পৃথক measurement path।
5. তিন audience view: Public, Explorer, Scientific।
6. Result থেকে source acquisition, QA ও run evidence-এ ফিরে যাওয়া যায়।

**১৮–২০-এর জন্য**
- 4-minute video-তে real app থেকে নতুন/retained real run, real data IDs ও actual acquisition dates।
- 30-second teaser-এ শুধু core differentiation; fake processing animation নয়।
- ৫–৭টি high-resolution screenshots, caption/subtitle, sources/credits এবং signed-out link test।
- ৪ মিনিটের video script: [VIDEO_STORYBOARD_DRAFT.md](VIDEO_STORYBOARD_DRAFT.md)।

---

## ৪. Additional criteria

### 6 — Teamwork: ১ / ৫ (pending verification)

আপনার বক্তব্য অনুযায়ী দুইজনের substantial contribution আছে এবং GitHub graph-এ ৩০–৪০ হাজারের মতো added lines/contributions দেখা যায়। সেটি যাচাই করা গেলে Teamwork score-এ বড় revision যুক্তিযুক্ত।

এই review-তে তিনটি repository-র প্রতিটিতে latest 100 commit-এর author field একাই moshiour0 ছিল; inspected commit messages-এ Co-authored-by trailer-ও পাওয়া যায়নি। এটি শুধু latest-100 commit window—পূর্ণ history, contributor graph, merged earlier contribution বা off-GitHub teamwork-এর প্রমাণ/অপ্রমাণ নয়। GitHub-এর contributor graph default-branch commit attribution অনুযায়ী কাজ করে; merged history ও verified author email গুরুত্বপূর্ণ।

**যা লাগবে:** তিন repo-র Insights → Contributors graph-এর CSV/PNG বা view-as-table export; contributor GitHub IDs; কোন feature/file/test/research/design/video কাজ কে করেছে তার contribution register। অন্য সদস্যের কাজকে lead-এর নামে দেখাবেন না। Evidence মিলে গেলে **৪–৫/৫** পুনর্মূল্যায়ন করা হবে।

### 7 — User experience: ৪ / ৫

তিনটি audience layer UX-কে শক্তিশালী করে:
- **Public view:** সাধারণ ব্যবহারকারী—কোথায় কী ধরনের candidate/result, সহজ ভাষায় কী বোঝায়, next action কী।
- **Explorer view:** আগ্রহী user/student—AOI, date, acquisition, layers, observed-date playback, candidate inspection।
- **Scientific view:** researcher—product/CRID, geometry, valid support, metric, uncertainty, provenance, processing state ও limitations।

এতে একই system novice ও technical audience-কে একই জটিলতায় আটকে রাখে না। এজন্য ৩ থেকে ৪-এ revision যুক্তিযুক্ত।

**৫/৫-এর জন্য:** পাঁচজন first-time user দিয়ে নির্দিষ্ট tasks সম্পন্ন করান; time, completion, error, help request, misunderstanding রেকর্ড করুন। Mobile, keyboard-only, focus order, contrast, map-control এবং screen-reader audit সংরক্ষণ করুন। Mode-এর নাম সুন্দর হলেই ৫ নয়; user independently কাজ শেষ করতে পারেন কি না সেটিই প্রমাণ।

### 8 — NASA data usage: ৫ / ৫

NISAR L2 GUNW/GOFF/GCOV হলো measurement inputs; NASA Earthdata/CMR ও ASF DAAC discovery/access; external/contextual layers আলাদা। ৫-এর বেশি নেই; attribution ও role clarity বজায় রাখতে হবে।

### 9–11 — Binary criteria

- Challenge category: **১/১**.
- Repository access: **১/১**, submission-এর আগে signed-out check আবার করতে হবে।
- Project page: **০/১** যতক্ষণ official page submitted/confirmed নয়। Draft পূর্ণ হলেও সেটি submission নয়।

---

## ৫. Updated improvement roadmap

| Priority | Work | Score area | Evidence needed |
|---:|---|---|---|
| 1 | Four-minute real-data walkthrough + 30-second cut | Presentation, Creativity, Impact | published video, exact runs and acquisition IDs |
| 2 | Contributor graph CSV/PNG + member-level contribution register | Teamwork | verified team-member attribution |
| 3 | Public/Explorer/Scientific first-time-user test | UX | task completion + accessibility record |
| 4 | Held-out positive/control evaluation | Validity | metrics, uncertainty, frozen test set |
| 5 | More cross-region reproducible cases | Impact | actual source products, run IDs and honest outcomes |
| 6 | Per-feature visible NISAR provenance panel | Relevance | product/granule/date/maturity/measurement source |
| 7 | Official project page submission | Project page | submitted state and confirmation |

## ৬. Judge-facing phrases

**Primary positioning:**  
**“Not a static demo. A live, AOI-driven NISAR processing platform—where compatible observations are available.”**

**Impact:**  
“Users start with a place and a time window. SARGuardian searches the available NISAR archive, identifies the product path that fits the question, and returns source-linked evidence or a clear coverage limitation.”

**Creativity:**  
“We connect target-free discovery to user-controlled measurement and traceable evidence, while keeping GUNW, GOFF and GCOV scientifically distinct.”

**Validity:**  
“We show what the radar measured, how it was processed, what passed quality gates, and what remains unvalidated. A missing reference is withheld—not fabricated.”

**Live platform clarification:**  
“Live processing” means an actual user request can initiate the deployed catalogue/worker pipeline. It does not mean continuous global data, instant results, or data for every place/date. Demonstrate a real request/run in the video.

## ৭. Do not overclaim

- GOFF anomaly ≠ confirmed landslide/glacier movement.
- GUNW LOS ≠ complete 3-D or downslope motion.
- Reference polygon ≠ proven stable ground.
- P05023 headline agreement ≠ complete author-exact experiment reproduction.
- RiverShift candidate area ≠ field-measured erosion/deposition, sediment volume or signed bankline migration.
- NO_MATCH_NO_SCORE ≠ 0 accuracy.
- NASA archive limitation ≠ application failure; broken catalogue/worker is still an application failure.
- Simulated progress/result ≠ live processing.
- Contributor count/lines of code ≠ independently sufficient teamwork proof; attribute real work to real members.

## ৮. Evidence baseline

- Find Displacements: [Backend run #42097077601](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601)
- RiverShift Run #36: [Backend run #41803576163](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41803576163)
- RiverShift replay: [Backend run #41926490047](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926490047)
- RiverShift tests: [Backend run #41926825076](https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926825076)
- Known Place generic run: [Monorepo run #42321054100](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42321054100), PARTIAL_SCIENTIFIC_METRICS
- Known Place regression: [Monorepo run #42327901627](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42327901627), PR #8 head
- Dynamic frontend CI: [run #41941335970](https://github.com/moshiour0/SARGuardian_Dynamic/actions/runs/41941335970)
- Current judge package PR: [Monorepo PR #9](https://github.com/moshiour0/SARGuardian-Monorepo/pull/9)

## Bottom line

**Revised estimate: ৯৮/১১৮।** Impact ১৮, Creativity ১৮ এবং Validity ১৬-তে revision যুক্তিযুক্ত—কারণ system-এর reach, connected discovery-to-measurement design এবং বাস্তব engineering/scientific controls আগের estimate-এ যথেষ্ট weight পায়নি। Teamwork-কে ৫ এবং UX-কে ৫ করতে হলে member-level contribution evidence ও user testing দেখাতে হবে। Presentation-এর স্কোর script নয়, final video ও media quality বিচার করে উঠবে।
