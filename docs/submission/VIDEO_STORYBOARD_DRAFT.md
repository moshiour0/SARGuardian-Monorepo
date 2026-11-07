# SARGuardian — Team Video Storyboard Draft
## NASA Space Apps 2026 · Dancing with the SARs

**Purpose:** Team working script for a 2–2.5 minute product video. This draft is for recording/editing; it is not a scientific results report.

## Story arc

**Earth changes → NISAR observes → SARGuardian makes the observations explorable → each workflow answers a different question → the user can trace results to evidence.**

The video should feel like one coherent product story, not four disconnected feature advertisements. Keep the interface visible, use actual application footage, show real acquisition dates and use the exact wording of the on-screen measurements.

## Timed storyboard and narration

### 0:00–0:15 — The challenge

**Visual:** Global map, then quick transitions across a mountain slope, glacier terrain and a braided river.

**Narration:**  
“Earth's surface is always moving. Landslides, glacier movement and changing rivers affect communities, infrastructure and ecosystems. But detecting a change is only the first step. We also need to understand what the satellite actually measured.”

### 0:15–0:30 — NISAR is the core

**Visual:** NISAR mission graphic or project data-source panel. Show GUNW, GOFF and GCOV as three distinct data paths.

**Narration:**  
“NASA–ISRO NISAR gives us radar observations in day, night and cloudy conditions. SARGuardian uses the NISAR product that fits each question: phase, pixel offsets or covariance data. These measurements stay separate, so the map never turns different radar quantities into one unexplained score.”

### 0:30–0:55 — Landslide screening

**Visual:** Open Landslide, draw an AOI, show product discovery, then candidate layer and source acquisition pair.

**Narration:**  
“With Find Displacements, users select an area and time window—not a pre-known target point. SARGuardian screens the area for candidate offset anomalies and, when the observation network supports it, separate line-of-sight diagnostics. A candidate tells us where to investigate next; it is not automatically a confirmed landslide.”

### 0:55–1:10 — Glacier movement

**Visual:** Switch to Glacier Movement, show the same AOI-first interaction and a glacier study map.

**Narration:**  
“The same displacement engine can be used in glacier terrain. The study context changes, but the measurement rules do not. That lets us explore glacier-movement candidates without pretending that a radar anomaly is an automatic collapse prediction.”

### 1:10–1:35 — Known Place Analysis

**Visual:** Draw a Measurement Polygon and a separate Reference Polygon. Show a pairwise result and rate interval only when available.

**Narration:**  
“When a researcher already knows the place to study, Known Place Analysis uses two separate polygons. It compares the selected measurement area with a reference region and reports pairwise displacement and interval-average rates when the data support them. The reference is explicit, and the result remains tied to its acquisition interval.”

### 1:35–2:00 — RiverShift

**Visual:** Draw a Jamuna reach AOI, show catalogue dates, play actual acquisition dates, toggle observed water, new-water, erosion and deposition candidate layers.

**Narration:**  
“RiverShift follows a different path. It uses NISAR GCOV to screen river water and persistent land-water transitions across actual acquisition dates. In our Jamuna–Chowhali demonstration, six acquisitions support three reproducible candidate-area outputs, each linked to the source data and processing record.”

### 2:00–2:20 — Evidence and trust

**Visual:** Open source manifest, acquisition dates, checksum/QA panel and a workflow run.

**Narration:**  
“Every result has a route back to its data and processing evidence. SARGuardian keeps observations, measurements, map previews and interpretation distinct—so a missing reference is never shown as zero, and a candidate is never presented as ground truth.”

### 2:20–2:30 — Close

**Visual:** Return to global map and show the four workflow entry points.

**Narration:**  
“SARGuardian — Earth in Sight. One interactive platform to explore how our planet changes, using NASA–ISRO NISAR observations.”

## Recording rules

- Record the real application; do not fabricate a screen or a processing result.
- Show actual NISAR acquisition dates. Do not create daily frames or imply forecasting.
- Use the displayed units and exact result labels. Do not round a candidate into a stronger scientific claim.
- When showing Known Place, keep the Measurement Polygon and Reference Polygon distinct.
- When showing Glacier Movement, call it movement screening, not an automatic avalanche detector.
- When showing RiverShift, label the Jamuna area figures as candidate areas from the stated AOI and time window.
- Do not show API keys, callback secrets, Earthdata credentials, Drive folder IDs, private job records or personal user data.
- Prefer screen recordings with real cursor interaction and legible labels; do not rely on abstract animations alone.
- Add captions and a final source/credit frame.

## Assets to capture

1. Global landing map with all four workflow entry points.
2. Landslide AOI selection, product discovery and candidate result.
3. Glacier Movement entry and an actual glacier-context AOI.
4. Known Place two-polygon drawing and pairwise measurement output.
5. RiverShift AOI, catalogue acquisition list, actual-date playback and separate layers.
6. One result provenance panel and one successful workflow evidence page.
7. Final project title, challenge name and repository/application links.

## Team review before publishing

- Confirm all screen recordings show the current public application build.
- Confirm the selected demo AOIs and run IDs are the same as the linked evidence.
- Confirm all team members approve the narration and credits.
- Replace this draft with the final recorded video URL in the project-page submission.
