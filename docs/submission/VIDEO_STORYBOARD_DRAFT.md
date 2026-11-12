# SARGuardian — Four-Minute Main Film + Short Demo Scripts
## NASA Space Apps 2026 · Dancing with the SARs

**Core message:**  
**Not a static demo. A live, AOI-driven NISAR processing platform—where compatible observations are available.**

**Film objective:** চার মিনিটে বিচারককে বোঝানো: (1) কেন এই সমস্যাটি গুরুত্বপূর্ণ, (2) SARGuardian-এর originality কী, (3) এটি বাস্তব NISAR data ও processing engine চালায়, (4) চারটি use case কীভাবে তিনটি পৃথক measurement path-এ কাজ করে, (5) user কীভাবে result থেকে source evidence পর্যন্ত যেতে পারে।

**Recording rule:** সব footage বর্তমান deployed app বা traceable real run থেকে নিতে হবে। Retained run replay দেখালে “recorded real run”/“retrospective replay” হিসেবে label দিন। Simulated loading, fake progress, fabricated map result বা fictional user testimony ব্যবহার করবেন না।

---

## 1. Four-minute master storyboard

### 0:00–0:20 — The Earth is changing

**Visual**
- 2–3 sec: satellite/global Earth view।
- 3–6 sec: mountain slope।
- 6–10 sec: glacier/ice terrain।
- 10–14 sec: braided river।
- 14–20 sec: SARGuardian live application home screen।

**Voice-over**
“পৃথিবীর পৃষ্ঠ প্রতিনিয়ত বদলাচ্ছে। পাহাড়ের ঢাল সরে যায়, হিমবাহ এগোয় বা পিছোয়, নদীর পানি ও channel pattern বদলায়। এই পরিবর্তনগুলো বোঝা গুরুত্বপূর্ণ—কিন্তু satellite image দেখলেই measurement বা reliable evidence পাওয়া যায় না। আমাদের দরকার এমন একটি system, যা observation খুঁজে বের করবে, উপযুক্ত method চালাবে, এবং ফলাফল কোথা থেকে এসেছে তা দেখাবে।”

**On-screen words:** OBSERVE → DISCOVER → MEASURE → VERIFY

### 0:20–0:48 — NISAR data: global mission, real release limits

**Visual**
- NISAR mission/data product panel।
- ASF Vertex/Earthdata catalogue result list; show actual acquisition dates, product family and maturity।
- Global AOI map, followed by one catalogue footprint intersection।

**Voice-over**
“NASA–ISRO NISAR-এর L-band radar দিন-রাত এবং মেঘের আড়ালেও পৃথিবী পর্যবেক্ষণ করে। এর public provisional L-band release শুরু হয় ২০ জুলাই ২০২৬; এই release-এ ১৭ জুন ২০২৬ বা তার পরের acquisition অন্তর্ভুক্ত। নতুন product processing শেষ হলে public archive-এ যুক্ত হয়। তাই প্রতিটি জায়গায় প্রতিটি তারিখের data আছে—এমন দাবি আমরা করি না। SARGuardian selected AOI ও সময়সীমার জন্য available compatible observations খোঁজে; data না থাকলে সেটিও স্পষ্টভাবে জানায়।”

**On-screen words:** REAL NISAR PRODUCTS · ACTUAL ACQUISITION DATES · AVAILABILITY-AWARE

**Important:** Release date এবং acquisition cutoff গুলিয়ে ফেলবেন না। NASA/ASF source credit final card-এ দিন।

### 0:48–1:08 — We are not a static demo

**Visual**
- Actual deployed application URL/browser chrome।
- User selects one workflow, draws AOI, chooses dates।
- Click catalogue/discovery and show returned product rows।
- Start a real processing request; show real job/run status. যদি processing recording-এর আগে complete হয়, same job ID দিয়ে result খুলুন।

**Voice-over**
“SARGuardian শুধু আগে থেকে বানানো result দেখানোর demo নয়। এটি একটি deployed, AOI-driven application, যেখানে user browser থেকেই real catalogue discovery ও processing request শুরু করতে পারে। NISAR archive-এ যে compatible acquisition পাওয়া যায়, system সেই observation-এর উপযুক্ত engine চালায়। এটি সব জায়গায় সব সময় data থাকার প্রতিশ্রুতি নয়—এটি available data-কে বাস্তব processing evidence-এ রূপ দেওয়ার platform।”

**On-screen words:** LIVE APPLICATION · USER-SELECTED AOI · REAL PROCESSING RUN

**Proof overlay:** exact run ID, status, product ID/date। Secret, token, private job payload নয়।

### 1:08–1:45 — Landslide: find the signal without knowing its location

**Visual**
1. Landslide workflow নির্বাচন।
2. Map-এ AOI আঁকা; কোনো target point দেওয়া হচ্ছে না—এটি স্পষ্টভাবে দেখান।
3. Date window ও catalogue results।
4. GOFF candidate layer।
5. একটি candidate click করে source acquisition pair/quality evidence।
6. GUNW LOS panel থাকলে আলাদা tab/layer-এ দেখান; না থাকলে “network not supported / not measured” state দেখান।

**Voice-over**
“প্রথম workflow—Landslide screening। ব্যবহারকারীকে আগে থেকে ঠিক কোন pixel বা slope সরেছে তা জানতে হয় না। তিনি শুধু study area ও সময়সীমা দেন। Find Displacements available NISAR products পরীক্ষা করে AOI জুড়ে candidate offset anomalies খোঁজে। যেখানে compatible GUNW observation network আছে, সেখানে আলাদা relative line-of-sight diagnostic দেখায়। Candidate মানে তদন্তের জায়গা—এটি নিজে থেকে confirmed landslide বা warning নয়।”

**On-screen words:** NO PRE-KNOWN TARGET · GOFF CANDIDATE · GUNW LOS, WHEN SUPPORTED

### 1:45–2:07 — Glacier Movement: same engine, different study context

**Visual**
- Glacier Movement entry point।
- Glacier/ice study AOI ও available dates।
- Same workflow stages; show measurement type remains GOFF/GUNW-specific।

**Voice-over**
“দ্বিতীয় workflow—Glacier Movement। এখানে study context হিমবাহ বা ice-affected terrain, কিন্তু measurement rules বদলায় না। একই target-free displacement engine available observation থেকে movement candidate খোঁজে। এভাবে glacier study-তে কোথায় আরও close inspection দরকার হতে পারে তা চিহ্নিত করা যায়—কিন্তু আমরা এটিকে glacier-collapse বা ice-avalanche prediction model বলি না।”

**On-screen words:** SHARED DISCOVERY ENGINE · GLACIER STUDY CONTEXT

### 2:07–2:42 — Known Place: measure a place explicitly

**Visual**
1. Known Place Analysis open।
2. Measurement Polygon draw।
3. Separate Reference Polygon draw।
4. Show product/date/track and valid-support results।
5. Pairwise displacement result and interval-rate interval only if actual output supports it।
6. Brief P05023 benchmark label only if exact screen shows it; mark as separate research benchmark.

**Voice-over**
“তৃতীয় workflow—Known Place Analysis। যখন researcher জানেন কোন জায়গাটি মাপতে চান, তখন তিনি Measurement Polygon আঁকেন এবং আলাদা Reference Polygon বেছে নেন। System compatible GOFF pairs-এ দুই region-এর offset support পরীক্ষা করে, pairwise relative displacement এবং data support করলে interval-average rate দেখায়। Reference polygon আলাদা হলেই সেটি stable প্রমাণ হয় না—তাই support ও interpretation status-ও ফলের সঙ্গে থাকে। Author-selected P05023 research benchmark এই generic workflow থেকে আলাদা।”

**On-screen words:** MEASUREMENT AREA ≠ REFERENCE AREA · PAIRWISE RESULT · SUPPORT GATED

### 2:42–3:15 — RiverShift: an independent GCOV engine

**Visual**
1. RiverShift entry।
2. Jamuna–Chowhali AOI।
3. Actual six GCOV acquisition dates show in timeline/list (30 Jun–10 Sep 2026)।
4. Toggle observed water / new-water / persistent erosion candidate / persistent deposition candidate independently।
5. Display real run #36 or replay record, candidate areas and provisional status.

**Voice-over**
“চতুর্থ workflow—RiverShift। এটি অন্য তিনটির extension নয়; এটি আলাদা NISAR GCOV processing engine। Jamuna–Chowhali উদাহরণে ছয়টি বাস্তব acquisition date থেকে observed water এবং persistent land-water transition candidate বের করা হয়েছে। Retained source data দিয়ে replay-তে তিনটি candidate-area output পুনরুৎপাদন করা গেছে। এগুলো radar-derived screening candidate—field-measured sediment volume, signed bank migration বা confirmed damage নয়।”

**On-screen words:** INDEPENDENT GCOV ENGINE · SIX REAL DATES · REPRODUCIBLE CANDIDATES

### 3:15–3:42 — Three levels of understanding

**Visual**
- Same result/area in three dashboard modes. Use actual mode labels in the product.
- Public view: plain-language summary and next step.
- Explorer view: layers, observation dates, selected candidate।
- Scientific view: product ID, acquisition metadata, geometry/support, measurement/quality states, source manifest।

**Voice-over**
“একই evidence সবার জন্য একইভাবে দেখানোর দরকার নেই। Public view সাধারণ ব্যবহারকারীকে সহজ ভাষায় result বুঝতে সাহায্য করে। Explorer view আগ্রহী user ও student-কে map, layers ও observation dates অনুসন্ধান করতে দেয়। Scientific view researcher-কে product identity, quality support, measurement semantics এবং provenance পর্যন্ত নিয়ে যায়। তথ্যের গভীরতা বদলায়—কিন্তু underlying measurement বদলায় না।”

**On-screen words:** PUBLIC · EXPLORER · SCIENTIFIC

### 3:42–4:00 — The evidence promise

**Visual**
- Source manifest / acquisition dates / run report / QA summary।
- Return to home map and project name।
- Final slide: app URL + repositories + challenge title।

**Voice-over**
“SARGuardian-এর লক্ষ্য satellite signal-কে অতিরঞ্জিত verdict বানানো নয়। লক্ষ্য হলো available NISAR observation থেকে traceable, method-specific এবং reviewযোগ্য evidence তৈরি করা—যাতে মানুষ বুঝতে পারে কী দেখা হয়েছে, কী মাপা হয়েছে, এবং কোন প্রশ্নের উত্তর এখনও পাওয়া যায়নি। SARGuardian—Earth in Sight. Dancing with the SARs।”

**Final frame**
SARGuardian — Earth in Sight  
NASA Space Apps Challenge 2026 · Dancing with the SARs  
Live AOI-driven NISAR processing, where compatible data are available.

---

## 2. Thirty-second short demo / teaser

| Time | Visual | Narration / super |
|---|---|---|
| 0:00–0:04 | Mountain → glacier → river rapid cuts | “পৃথিবী বদলায়। সেই পরিবর্তনের evidence খুঁজতে শুরু করুন একটি জায়গা দিয়ে।” |
| 0:04–0:09 | Live SARGuardian map, AOI draw, date window | “SARGuardian available NISAR observations খুঁজে real processing চালায়।” |
| 0:09–0:15 | No-target GOFF candidate; separate Known Place polygons | “আগে থেকে target না জেনেও candidate খুঁজুন—অথবা পরিচিত জায়গা explicit polygon দিয়ে মাপুন।” |
| 0:15–0:21 | RiverShift actual GCOV dates and candidate layers | “RiverShift আলাদা GCOV engine দিয়ে actual acquisition dates পরীক্ষা করে।” |
| 0:21–0:26 | Public / Explorer / Scientific views; source manifest | “সহজ ব্যাখ্যা থেকে scientific provenance—একই evidence-এর তিন স্তর।” |
| 0:26–0:30 | Final project title + app URL | “SARGuardian. Not a static demo—a live, AOI-driven NISAR processing platform, wherever compatible data are available.” |

**30-second cut must not imply** all dates have data, instant processing, hazard warnings, daily interpolation, field validation or universal accuracy.

## 3. Optional 45-second version

**0:00–0:06:** “Landslides, glacier movement and river change reshape the surface. Radar observations can help us investigate—but only when measurements are traceable.”

**0:06–0:13:** Show NISAR catalogue and release label. “NISAR data become public as products are processed. SARGuardian searches what is actually available for the selected AOI and time.”

**0:13–0:24:** Show AOI no-target scan → GOFF candidate → separate GUNW LOS diagnostic; then Known Place two polygons. “Discover candidate signals without a known target, or measure a known place against an explicit reference.”

**0:24–0:33:** Show RiverShift six actual dates and separate GCOV layers. “A separate GCOV engine screens observed river water and persistent transitions.”

**0:33–0:40:** Show Public / Explorer / Scientific views and source record. “Every view leads back to the acquisition and processing evidence.”

**0:40–0:45:** “SARGuardian — live, AOI-driven NISAR processing where compatible observations are available.”

---

## 4. Evidence-safe claim sheet

| Say this | Do not say this |
|---|---|
| Live AOI-driven processing where compatible NISAR data are available | Live global monitoring everywhere, every day |
| Target-free displacement-candidate discovery | Automatic landslide detector / early warning |
| Relative GUNW line-of-sight diagnostic | Full 3-D or downslope velocity from one LOS component |
| GOFF pairwise offset candidate/measurement | Confirmed ground-motion vector without the required geometry |
| Pairwise interval-average rate | Continuous cumulative velocity |
| GCOV water/land-transition candidate | Field-measured erosion, sediment volume or signed bank migration |
| NO_MATCH_NO_SCORE because no eligible reference matched | 0% accuracy / fully validated |
| Actual acquisition-date playback | Daily interpolation or forecast |
| Reproduced retained-data output | Independent physical validation |

## 5. Recording checklist

### Before recording
- Confirm the public production build and selected screens.
- Choose one real run per feature; record run ID, date range, AOI, product IDs and result status.
- For a new live request, record the exact request and its actual completion state. Do not splice a different run's result into that request.
- Prepare a screen list and test audio, cursor visibility, zoom and text legibility.
- Confirm the three audience modes are present in the current build and use their exact product labels.

### During recording
- Keep browser URL visible for the live-platform proof.
- Show the AOI and date selection before results.
- Show actual catalogue product rows and acquisition dates.
- Keep GUNW, GOFF and GCOV separate.
- Show one source/provenance panel and one QA/state panel.
- Never show credentials, secrets, personal records or private Drive links.
- Avoid fast cursor movements; pause long enough for judges to read key fields.

### During editing
- Use subtitles; keep technical terms intact and explain them in simple Bangla/English.
- Add a small source label whenever a real run or data product is shown.
- Keep transitions short; no cinematic overlays over essential evidence.
- Use only licensed/credited NISAR imagery and music.
- End on the actual app URL and public repository links.
- Keep the full film at 4:00 and teaser at 0:30; create a version with captions burned in and a clean-caption master.

### Final QA
- A reviewer unfamiliar with SAR can explain the difference between candidate, measurement and validation.
- A reviewer can identify which data product drives each workflow.
- All dates and values in narration match the screen.
- Every “live” claim is backed by a real deployed request or actual processing run.
- All external links open signed-out.
