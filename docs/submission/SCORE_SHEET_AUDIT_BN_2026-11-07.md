# SARGuardian — Local Score Sheet Audit
## প্রতিটি criterion-এর score, evidence এবং score বাড়ানোর কাজ

**তারিখ:** ৭ নভেম্বর ২০২৬  
**Project:** SARGuardian — Earth in Sight  
**Challenge:** Dancing with the SARs  
**Category:** Earth Science  
**Rubric:** Project Library-এর Score Sheet.md  
**ধরন:** Evidence-based desk review; এটি official judge score নয়।

> **বর্তমান মূল্যায়ন: ৯০ / ১১৮ (৭৬.৩%) — bonus-এর আগে।**
> Headline criteria: **৭৯ / ১০০**। Additional criteria: **১১ / ১৮**।
> Women participation bonus যোগ করা হয়নি, কারণ registered team roster যাচাই করা হয়নি।

Score sheet-এ ১১টি criterion আছে। নিচে প্রতিটি criterion-এর বর্তমান score, তার পক্ষে প্রমাণ, কেন পূর্ণ নম্বর দেওয়া হয়নি এবং কী করলে score বাড়বে তা আলাদা করে দেওয়া হয়েছে। Planned work-কে completed evidence হিসেবে গণনা করা হয়নি।

## ১. Score summary

| # | Criterion | Maximum | Current | Gap | সংক্ষিপ্ত কারণ |
|---:|---|---:|---:|---:|---|
| 1 | Impact | 20 | **16** | 4 | গুরুত্বপূর্ণ use case ও চারটি entry point আছে; independent real-world impact ও case breadth সীমিত |
| 2 | Creativity | 20 | **16** | 4 | AOI-first, multi-engine ও evidence workflow মৌলিক; নতুন independently validated algorithm দাবি করা যায় না |
| 3 | Validity | 20 | **13** | 7 | engineering/provenance/reproducibility শক্তিশালী; independent physical validation ও held-out detection evidence অসম্পূর্ণ |
| 4 | Relevance | 20 | **19** | 1 | Challenge-এর সঙ্গে সরাসরি সামঞ্জস্য; NISAR মূল measurement source |
| 5 | Presentation | 20 | **15** | 5 | live product ও technical documents আছে; final public video ও submitted project page নেই |
| 6 | Teamwork | 5 | **1** | 4 | role plan আছে; inspected GitHub history-তে অন্য সদস্যদের attributable contribution দেখা যায়নি |
| 7 | User experience | 5 | **3** | 2 | workflow guidance আছে; first-time-user study/accessibility evidence নেই |
| 8 | NASA data usage | 5 | **5** | 0 | NISAR GUNW/GOFF/GCOV মূল data; third-party context/source roles আলাদা |
| 9 | Challenge category identified | 1 | **1** | 0 | challenge ও category চিহ্নিত |
| 10 | Repository access | 1 | **1** | 0 | তিনটি GitHub repository public |
| 11 | Project page complete | 1 | **0** | 1 | draft আছে; official submission এখনো খোলেনি, submitted state নেই |
|  | **TOTAL** | **118** | **90** | **28** | **76.3%** |

### Bonus

Score sheet অনুযায়ী registered team-এ এক বা একাধিক নারী সদস্য থাকলে aggregate score-এর উপর ৫% bonus। এটি এখন যোগ করা হয়নি।

- Eligible হলে বর্তমান ৯০ × ১.০৫ = **৯৪.৫**।
- Eligibility না থাকলে score **৯০/১১৮**।
- নাম বা profile দেখে অনুমান নয়; registered team roster যাচাই করতে হবে।

NASA-এর official 2026 page অনুযায়ী Project submission খুলবে **১৪ নভেম্বর ২০২৬ সকাল ৯টা** এবং বন্ধ হবে **১৫ নভেম্বর রাত ১১:৫৯ local time**। তাই এখন Project Page Complete-এ ০/১; এটি feature ঘাটতি নয়, submission এখনো খোলেনি বলেই। Project page পূরণ, submit এবং confirmation পাওয়ার পরই ১ নম্বর হবে।  
Official schedule: https://www.spaceappschallenge.org/2026/  ( <https://www.spaceappschallenge.org/2026/> )

---

## ২. Headline criteria: ৭৯ / ১০০

### 1 — Impact: ১৬ / ২০

**Rubric:** সমস্যার scale/significance এবং সমাধান কতদূর পৌঁছায়।

**যে evidence ১৬ নম্বর সমর্থন করে**
- Landslide, Glacier Movement, Known Place Analysis ও RiverShift—চারটি user-facing workflow।
- Landslide এবং Glacier Movement একই target-free AOI-wide Find Displacements engine ব্যবহার করে; ব্যবহারকারীকে আগেই target coordinate জানতে হয় না।
- RiverShift AOI ও date window নিয়ে কাজ করার মতো global-first workflow।
- Jamuna–Chowhali demonstration-এ ছয়টি বাস্তব NISAR GCOV acquisition date প্রক্রিয়া হয়েছে।
- Run #36-এর candidate-area output পরে checksum-bound retrospective replay-তে retained six COG থেকে পুনরুৎপাদিত হয়েছে।
- OpenStreetMap building/facility context আলাদা layer হিসেবে দেখানো যায়; এটিকে confirmed damage inventory বলা হয় না।

**Evidence**
- Find Displacements run #42097077601: https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601
- RiverShift Run #36 #41803576163: https://github.com/moshiour0/SARGuardian-backend/actions/runs/41803576163
- RiverShift replay #41926490047: https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926490047

**কেন ২০ নয়**
- বিস্তারিত public real-data case প্রধানত একটি RiverShift example-এ কেন্দ্রীভূত।
- Global-first architecture থাকলেই সব অঞ্চলে validated operational coverage প্রমাণ হয় না।
- বর্তমান outputs screening candidates; confirmed house damage, affected population, lives saved, sediment volume বা field-measured bank migration নয়।
- Glacier-specific independently validated physical case একই evidence level-এ নেই।
- কোনো user/adopter কত সময় বাঁচাল বা কোন decision বদলাল—তার documented evidence নেই।

**কী করলে বাড়বে**
1. Landslide, Glacier Movement এবং RiverShift—প্রতি workflow-এ অন্তত একটি reproducible case study প্রকাশ করুন: exact AOI, acquisition IDs/dates, source manifest, result map ও validation status।
2. প্রতিটি case-এ dated exposure context যোগ করুন; building/facility context-কে complete asset inventory বা confirmed damage বলবেন না।
3. একটি নির্দিষ্ট decision-support outcome দেখান—যেমন evidence-ভিত্তিক inspection prioritisation। বাস্তবে প্রমাণ না থাকলে lives saved/damage prevented দাবি করবেন না।
4. কোন অঞ্চল ও date window-তে compatible NISAR data পাওয়া যায় তা প্রকাশ করুন; continuous global monitoring বলবেন না।

**Target:** ১৮–১৯/২০, যদি নতুন case ও impact evidence পাওয়া যায়।

### 2 — Creativity: ১৬ / ২০

**Rubric:** ধারণা ও execution-এর originality।

**যে evidence ১৬ নম্বর সমর্থন করে**
- AOI-first discovery; আগে থেকে anomaly coordinate দিতে হয় না।
- Landslide ও Glacier Movement একই shared discovery engine-এর contextual entry point।
- Known Place-এ Measurement Polygon এবং Reference Polygon আলাদা।
- RiverShift স্বতন্ত্র GCOV engine; এটি Landslide workflow-এর rename নয়।
- Acquisition discovery, পৃথক result layers, observed-date playback, provenance ও quality states এক user journey-তে আনা হয়েছে।
- GOFF, GUNW ও GCOV আলাদা measurement semantics-এ রাখা হয়েছে।

**কেন ২০ নয়**
- মূল measurement primitives প্রতিষ্ঠিত NISAR product usage; originality প্রধানত integration ও evidence workflow-এ, নতুন independently validated science algorithm-এ নয়।
- চারটি feature card আসলে কয়টি processing engine—তা judge-কে দ্রুত বোঝাতে হবে।
- End-to-end discovery-to-measurement demonstration-এর final public video নেই।
- Conventional manual workflow-এর তুলনায় কী নতুন সুবিধা, তার documented comparison নেই।

**কী করলে বাড়বে**
1. AOI scan → GOFF candidate → suggested Measurement Polygon → user-edited Measurement + Reference Polygon → Known Place result—পুরো chain বাস্তব run দিয়ে দেখান।
2. GOFF ও GUNW কেন পৃথক, একটি উদাহরণে ব্যাখ্যা করুন।
3. মূল differentiator স্পষ্ট করুন: “Start with an area, not a known target; trace every candidate to the observations that produced it.”
4. Manual বনাম SARGuardian workflow-এর steps ও evidence তুলনা করুন; সময় না মাপলে speed claim করবেন না।

**Target:** ১৮/২০।

### 3 — Validity: ১৩ / ২০

**Rubric:** scientific soundness, technical feasibility ও usability।

**যে evidence ১৩ নম্বর সমর্থন করে**
- GUNW phase/LOS, GOFF offsets এবং GCOV covariance/backscatter তাদের নিজস্ব ভূমিকার জন্য ব্যবহার করা হয়।
- Source-product provenance, acquisition date এবং product/geometry/valid-support checks আছে।
- Find Displacements AOI run-এ processing, failed-only GUNW retry, dashboard assembly ও terminal callback সম্পন্ন হয়েছে।
- RiverShift Run #36 ছয়টি বাস্তব GCOV date প্রক্রিয়া করেছে; retrospective checksum-bound replay তিনটি candidate-area output পুনরুৎপাদন করেছে।
- RiverShift full-resolution source-mask overlap QA এবং preview geometry diagnostics আলাদাভাবে রাখে।
- Backend RiverShift worker suite-এর 259 tests এবং Known Place PR #8 head-এর Monorepo Snapshot Regression সফল হওয়ার evidence আছে।
- Public wording structural/provenance PASS এবং independent validation-কে আলাদা রাখে।

**Evidence**
- Find Displacements: https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601
- RiverShift worker tests: https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926825076
- RiverShift Run #36: https://github.com/moshiour0/SARGuardian-backend/actions/runs/41803576163
- RiverShift replay: https://github.com/moshiour0/SARGuardian-backend/actions/runs/41926490047
- Known Place generic run #42321054100: https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42321054100
- Known Place regression #42327901627: https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42327901627

**কেন বেশি নয়**
- Software regression ও reproducibility independent physical validation নয়।
- Find Displacements GOFF ফল exploratory offset-anomaly candidate; held-out positive/control AOI দিয়ে operational precision, recall, false-alarm rate ও sensitivity প্রতিষ্ঠিত হয়নি।
- GUNW LOS-only; এটি নিজে থেকে 3-D বা downslope velocity নয় এবং compatible network/reference support দরকার।
- Known Place generic run #42321054100-এর status ছিল PARTIAL_SCIENTIFIC_METRICS; সব pair/track পর্যাপ্ত reference support পায়নি।
- Reference Polygon আঁকলেই stable প্রমাণ হয় না।
- Bhote Koshi P05023 path-এর headline numerical agreement প্রায় ০.৯৬ m / ৪ cm/day; কিন্তু exact editable author crown geometry ও author-side null/control-generation details পুরোপুরি মেলেনি। Complete paper reproduction বলা যাবে না।
- PR #8-এ conditional spatial block-bootstrap interval-এর কাজ আছে, কিন্তু PR এখনো Draft/Open; এটি production-এ deployed বলে গণনা করা হয়নি।
- RiverShift Run #36 independent reference status PROVISIONAL / NO_MATCH_NO_SCORE; কোনো F1/IoU score নেই। এটি zero accuracy নয়, eligible reference অনুপস্থিত।
- RiverShift low-backscatter water screening এবং persistent land/water transition candidate method; field-confirmed geomorphic change নয়।

**কী করলে বাড়বে**
1. Find Displacements-এর জন্য frozen held-out validation set তৈরি করুন—positive event ও non-event/control AOI দুটোই থাকবে। Detection rate, precision, recall, false-alarm rate, minimum detectable signal, spatial-block uncertainty ও failure cases প্রকাশ করুন। Held-out data দিয়ে threshold tune করবেন না।
2. GOFF-এ component-specific uncertainty, correlation-peak/SNR diagnostics এবং multi-resolution consistency যাচাই করুন।
3. GUNW-এর AOI-wide common-reference strategy ও independent stability assessment প্রকাশ করুন; LOS result GOFF থেকে আলাদা রাখুন।
4. Known Place-এ reference valid pixel/fraction, median, spread, outlier ও support ratio প্রকাশ করুন; Measurement Polygon-কে reference sample থেকে বাদ দিন; support কম হলে result/interval withhold করুন।
5. RiverShift-এর জন্য suitable date-matched external water reference বা independently reviewed water/non-water mask আনুন এবং common-support gate পাস হলে confusion matrix, precision, recall, F1, IoU, area bias ও spatial uncertainty দিন।
6. Signed bank migration claim করতে comparable water stage-এ dated banklines এবং oriented transect দরকার।
7. NO_MATCH_NO_SCORE gate দুর্বল করবেন না; score বাড়াতে fabricated PASS/accuracy দেবেন না।

**Target:** held-out ও independent validation বাস্তবে সম্পন্ন হলে ১৬–১৮/২০; রিপোর্ট ছাড়া বাড়তি নম্বর দাবি করা যাবে না।

### 4 — Relevance: ১৯ / ২০

**Rubric:** challenge alignment এবং NASA data কতটা core-এ।

**যে evidence ১৯ নম্বর সমর্থন করে**
- Project “Dancing with the SARs” / Earth Science challenge-এর সঙ্গে সরাসরি সম্পর্কিত।
- NISAR L2 measurement products: GUNW relative LOS diagnostics; GOFF pairwise range/along-track offsets; GCOV RiverShift water/land screening।
- NASA Earthdata/CMR এবং ASF DAAC catalogue discovery ও access-এ ব্যবহৃত।
- Other data-এর ভূমিকা পৃথক: OPERA DSWx-S1 সম্ভাব্য cross-sensor water reference; Sentinel-2 optional optical comparison; OpenStreetMap exposure context; Google Maps basemap।

**কেন ২০ নয়**
- Judge-কে data role technical document ঘেঁটে বুঝতে হতে পারে।
- কিছু external source optional বা attempted reference; retained case-এ সফল validation source নয়।
- প্রতিটি feature result-এ granule ID, date, CRID/maturity, parameters ও measured quantity এক জায়গায় দেখানো গেলে আরও পরিষ্কার হবে।

**কী করলে বাড়বে**
1. প্রতিটি demo path-এ NASA data panel দেখান: product, granule ID, acquisition dates, maturity ও measured quantity।
2. NASA/ASF catalogue discovery দেখান; catalogue footprint intersection মানেই valid raster support নয়—এটি বলুন।
3. Source legend দিন: NISAR measurement / agency reference / third-party context / basemap।
4. NASA/ASF official product documentation project page-এ cite করুন।

**Target:** ২০/২০।

### 5 — Presentation: ১৫ / ২০

**Rubric:** clarity, structure, storytelling এবং broad audience-এ পৌঁছানো।

**যে evidence ১৫ নম্বর সমর্থন করে**
- Production web deployment Vercel-এ READY; production alias sar-guardian-dynamic-lilac.vercel.app। যাচাইকৃত commit: 42d977b5abd186866ac0d78454239563eebb18d2।
- Home page-এ চারটি workflow card এবং area → observations → processing → evidence review ধাপ আছে।
- GUNW/GOFF ব্যাখ্যা এবং candidate-not-confirmation, LOS-not-3D, withheld-not-zero guardrail আছে।
- RiverShift map layers, observed-date framing, provenance ও spatial QA panel দেখায়।
- Whole-project guide, feature guide, score-sheet matrix, project-page draft, architecture overview ও video storyboard PR #9-এ আছে।

**Evidence**
- Dynamic main frontend CI #41941335970: https://github.com/moshiour0/SARGuardian_Dynamic/actions/runs/41941335970
- Judge package PR #9: https://github.com/moshiour0/SARGuardian-Monorepo/pull/9

**কেন ২০ নয়**
- Final 2-minute public demo video ও screenshot set-এর প্রমাণ নেই।
- Official NASA project page পূরণ/submit হয়নি।
- Judge pack Draft PR #9-এ; draft branch judge-visible official page নয়।
- Simulated progress বা invented run ID-কে live NISAR processing হিসেবে দেখানো চলবে না।
- Vercel metadata READY দেখায়, কিন্তু full external signed-out user walkthrough ও recorded first-time-user demo এই review-তে করা হয়নি।

**গুরুত্বপূর্ণ prototype safeguard**
Project Library-তে থাকা 31 October-এর HTML prototype-এ “Fast-Forward to 100%” button আছে। এর JavaScript স্থানীয় progress 100% করে এবং PASS/result-bundle toast দেখায়। এটি prototype simulation, real processing evidence নয়। Final judge video-তে এটিকে live processing হিসেবে দেখাবেন না। Recording-এর আগে production app-এ এমন control নেই তা নিশ্চিত করুন।

**কী করলে বাড়বে**
1. Real-data 2-minute video করুন: Home → Landslide AOI/date discovery → source-linked candidate → Known Place polygons → RiverShift actual-date GCOV result।
2. প্রতিটি workflow-এ বাস্তব run ID ও acquisition date দেখান।
3. ৫–৭টি screenshot রাখুন: workflow, AOI, catalogue, map, two polygons, provenance, validation state।
4. Plain-language narration ও subtitle দিন; শেষে challenge name/repository links দেখান।
5. Judge guide/evidence index main branch বা official NASA project page-এ প্রকাশ করুন CI শেষে।
6. Laptop/mobile signed-out walkthrough record করুন; attribution ও limitations রাখুন।

**Target:** video/project page সম্পন্ন হলে ১৮–১৯/২০।

---

## ৩. Additional criteria: ১১ / ১৮

### 6 — Teamwork: ১ / ৫

**বর্তমান evidence**
- Master Execution Plan-এ lead + তিন teammate-এর team model এবং interface, API/data reliability, source audit ও submission role পরিকল্পিত।
- Backend, Dynamic ও Monorepo—প্রতিটির সর্বশেষ ১০০টি commit এবং ১০০টি PR inspect করা হয়েছে। ওই inspected history-তে visible author/PR author ছিল moshiour0।
- Role plan মানেই বাস্তব contribution নয়। অন্য মাধ্যমে collaboration থাকলে তার evidence এখনও review করা হয়নি।

**কী করলে বাড়বে**
1. Registered team member-দের সঠিক নাম ও কাজ NASA Project Page-এ লিখুন।
2. প্রত্যেকের commit/PR/issue/design/test/report/research/video contribution link দিন।
3. Contribution table: member → owned task → artifact → date → reviewer।
4. Joint review, reviewed PR, issue discussion, meeting note বা team demo-এর evidence রাখুন।
5. কেউ করেনি এমন কাজ contributor-কে দেবেন না।

**Target:** genuine contribution evidence থাকলে ৪–৫/৫।

### 7 — User experience: ৩ / ৫

**বর্তমান evidence**
- Home page-এ চারটি labelled workflow card।
- “How SARGuardian works” area selection থেকে evidence review পর্যন্ত ব্যাখ্যা করে।
- Landslide/Glacier AOI-first; Known Place-এ two polygons; RiverShift-এ আলাদা AOI/date/catalogue flow।
- Firebase sign-in, saved-results Archive এবং map/result interface আছে।
- Routing, authentication gate, AOI geometry, result layer ও dashboard retrieval-এর automated tests আছে।

**কেন ৫ নয়**
- AOI geometry, acquisition eligibility, product type এবং Known Place-এ দুই polygon বোঝা লাগে।
- GOFF/GUNW/LOS/GCOV/valid support নতুন user-এর কাছে কঠিন হতে পারে।
- First-time-user study, accessibility audit ও signed-out mobile test evidence নেই।
- Frontend test pass হলেই non-expert user একা কাজ সম্পন্ন করতে পারবেন—এটি প্রমাণ হয় না।

**কী করলে বাড়বে**
1. অন্তত পাঁচজন product না-বানানো first-time user দিয়ে test করুন।
2. Task দিন: workflow নির্বাচন, AOI আঁকা, catalogue support বোঝা, candidate/measurement/validation status আলাদা করে ফল ব্যাখ্যা করা।
3. Completion, সময়, error, help request ও misunderstanding নথিভুক্ত করুন; coaching দেবেন না।
4. Common blocker অনুযায়ী tooltip, next-step prompt, AOI/date example ও glossary উন্নত করুন।
5. Mobile, keyboard navigation, focus state, map controls ও screen-reader test করে UX report প্রকাশ করুন।

**Target:** ৪–৫/৫।

### 8 — NASA data usage: ৫ / ৫

**Rubric-এর ৫ নম্বরের সংজ্ঞা:** NASA open data এবং অন্য agency বা third-party sources স্পষ্টভাবে দেখানো।

**কেন পূর্ণ ৫**
- NISAR L2 GUNW, GOFF, GCOV প্রকৃত measurement source।
- NASA Earthdata/CMR ও ASF DAAC discovery/access-এ ব্যবহৃত।
- OPERA DSWx-S1 সম্ভাব্য water reference; Sentinel-2 optional optical comparison; OpenStreetMap exposure context; Google Maps basemap context।
- Retained case-এ বাস্তবে ব্যবহৃত source, optional/contextual source এবং eligible reference না পাওয়া source আলাদা করে উপস্থাপন করা হয়েছে।

**কী করলে পূর্ণ নম্বর থাকবে**
1. Demo ও project page-এ source-role panel দৃশ্যমান রাখুন।
2. প্রতিটি ব্যবহৃত product-এর official source/product guide cite করুন।
3. Run #36-এর missing OPERA reference-কে successful validation বলবেন না।
4. Screenshot/video-তে third-party attribution ও licensing রাখুন।

**বর্তমান score: ৫/৫।** বেশি source যোগ করলেই ৫-এর বেশি হবে না; সঠিক attribution বজায় রাখাই লক্ষ্য।

### 9 — Challenge category identified: ১ / ১

**Evidence:** project materials-এ “Dancing with the SARs” এবং “Earth Science” চিহ্নিত।

**কী করলে ধরে থাকবে:** NASA project page এবং video-তে exact challenge/category label দিন; submission form-এও মিলিয়ে নিন।

### 10 — Repository access: ১ / ১

**Evidence:** GitHub metadata-তে তিনটি repository-ই public:
- https://github.com/moshiour0/SARGuardian_Dynamic
- https://github.com/moshiour0/SARGuardian-backend
- https://github.com/moshiour0/SARGuardian-Monorepo

**কী করলে ধরে থাকবে:** submission-এর আগে signed-out browser-এ তিনটি link খুলুন; README-তে setup/data/license/reproduce instructions রাখুন; Monorepo-তে secret-history/private-data review করুন। Public flag থাকা security review-এর বিকল্প নয়।

### 11 — Project page complete: ০ / ১

**বর্তমান অবস্থা:** project-page draft তৈরি, কিন্তু submitted state-এর evidence নেই।

NASA-এর official 2026 page অনুযায়ী submission ১৪ নভেম্বর ২০২৬ সকাল ৯টা থেকে ১৫ নভেম্বর রাত ১১:৫৯ local time পর্যন্ত খোলা থাকবে।

**১ নম্বর পাওয়ার ধাপ**
1. Submission window-তে team page-এর Project tab খুলুন।
2. Title, summary, challenge/category, description, NASA data, other data, sources, links ও team member fields পূরণ করুন।
3. Public demo video ও screenshots যুক্ত করুন।
4. App ও repository links sign-in ছাড়াই খোলে নিশ্চিত করুন।
5. Submit করুন এবং official confirmation state-এর screenshot সংরক্ষণ করুন। শুধু draft save যথেষ্ট নয়।

---

## ৪. Score বাড়ানোর কাজ—অগ্রাধিকার অনুযায়ী

| Priority | কাজ | Current gap | সর্বোচ্চ recoverable points |
|---:|---|---:|---:|
| 1 | Independent physical validation + held-out positive/control evaluation | Validity +7 | 7 |
| 2 | Genuine teammate contribution evidence | Teamwork +4 | 4 |
| 3 | Real-data demo video এবং public judge guide | Presentation +5 | 5 |
| 4 | আরও দুটি reproducible case study ও traceable impact context | Impact +4 | 4 |
| 5 | First-time-user ও mobile/accessibility test | UX +2 | 2 |
| 6 | NASA Project Page পূরণ ও submit | Project page +1 | 1 |
| 7 | AOI-to-measurement differentiator বাস্তব demo | Creativity +4 | 4 |
| 8 | প্রতিটি feature walkthrough-এ source provenance দৃশ্যমান | Relevance +1 | 1 |

এগুলো rubric-এর arithmetic gap; কাজ হলেই বিচারক পুরো নম্বর দেবেন—এমন নিশ্চয়তা নেই।

## ৫. Score কমাতে পারে—এমন ভুল এড়িয়ে চলুন

- GOFF anomaly-কে confirmed landslide/glacier event বলবেন না।
- একটি GUNW LOS component-কে 3-D বা downslope velocity বলবেন না।
- প্রমাণ ছাড়া Known Place Reference Polygon stable বলবেন না।
- P05023 headline numerical match-কে complete author-exact reproduction বলবেন না, যতক্ষণ crown geometry/null-control parity মেলেনি।
- RiverShift NO_MATCH_NO_SCORE-কে zero accuracy/PASS/VERIFIED বানাবেন না।
- RiverShift sediment volume, signed bankline migration বা confirmed damage মেপেছে দাবি করবেন না।
- Simulated progress/result-কে live NISAR processing দেখাবেন না।
- Team contribution বা women bonus eligibility বানিয়ে দেখাবেন না।

## ৬. এই review-তে ব্যবহৃত evidence baseline

- Backend main head: 97d849454918b1425ac41bb70e7a32d11cfd3833।
- Dynamic production: READY, commit 42d977b5abd186866ac0d78454239563eebb18d2; alias sar-guardian-dynamic-lilac.vercel.app।
- Find Displacements: Backend run #42097077601।
- Known Place generic AOI: Monorepo run #42321054100; PARTIAL_SCIENTIFIC_METRICS।
- Known Place regression: Monorepo run #42327901627; PR #8 head-এ successful; PR #8 এখনো Draft/Open এবং interval UI change deployed বলে গণ্য হয়নি।
- RiverShift: Backend Run #36 #41803576163; retrospective replay #41926490047; reference status NO_MATCH_NO_SCORE / PROVISIONAL।
- Dynamic main frontend CI: #41941335970।
- Teamwork: তিন repository-র সর্বশেষ ১০০ commit ও ১০০ PR-এর inspected window-তে visible author/PR author moshiour0।

এটি available engineering, source, deployment ও documentation-এর desk review। Vercel metadata deployment READY দেখায়, কিন্তু full external signed-out user study করা হয়নি। Planned work, draft document, unmerged branch অথবা absent external validation completed evidence নয়।

## Bottom line

**বর্তমান evidence-supported score: ৯০ / ১১৮।**

SARGuardian NASA-data relevance ও technically substantial platform-এর দিক থেকে শক্তিশালী। সবচেয়ে বড় score gap হলো independent scientific validation, genuine teamwork evidence, real-data video, একাধিক reproducible case এবং non-expert user test।

সবচেয়ে দ্রুত বিশ্বাসযোগ্য উন্নতি হবে: **আরও প্রমাণ তৈরি, সেই প্রমাণ পরিষ্কারভাবে দেখানো, এবং কে কোন কাজ করেছে তা traceable করা**—data যতটুকু সমর্থন করে তার চেয়ে বড় scientific claim করা নয়।
