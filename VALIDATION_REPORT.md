# Known Place Analysis: Validation Report (v1, exploratory)

## 1. What this report claims

The engine's statistics stage is internally consistent on real NISAR GOFF data. In the tested AOI it separates injected displacements of about 2.5 m or more from background noise, and it reports "below noise floor" when nothing is there. It does not claim that any real ground motion was detected, and it has not yet been compared with an independent dataset.

## 2. Data

- **Product:** NISAR L2 GOFF, release P05023, maturity PROVISIONAL, HH polarization, acquisitions 2026-10-03 to 2026-10-18 (12-day pairs).
- **AOI:** about 86.02–86.18° E, 28.03–28.12° N (Nepal Himalaya). Reference polygon: about 86.21–86.31° E, 28.05–28.18° N, user-drawn.
- **Grid:** 212 × 368 cells. Valid cells after gating (reject, not clip, above 10 m): 13,959 (ascending), 12,955 (descending).
- Two workflow runs (43132228437, 43134905756) contain byte-identical arrays. They count as one dataset, not two replications.

| Pass | Raster ID | Valid AOI cells | Valid reference cells |
|---|---|---|---|
| 098-A (ascending) | `c85571d3217d7e8b` | 7,542 | 6,417 |
| 048-D (descending) | `df101d12e5de60c7` | 7,525 | 5,430 |

## 3. Methods (`valkit.py`, seed 20261112)

1. **Component-wise noise floor:** $\sigma_x = 1.4826 \cdot \text{MAD}(\Delta x)$, $\sigma_y = 1.4826 \cdot \text{MAD}(\Delta y)$, $\sigma_r = \sqrt{\sigma_x^2 + \sigma_y^2}$, from reference cells. Target displacement is the vector of component medians minus reference bias. $\text{SNR} = |D| / \sigma_r$. Status is `DETECTED` when $\text{SNR} \ge 3$, otherwise `BELOW_NOISE_FLOOR`.
2. **Background null test:** Non-overlapping 10 × 10 cell regions placed on the scene; each is classified against the rest of the valid scene (5-cell buffer). Any `DETECTED` is a false positive.
3. **Post-correlation injection-recovery:** Known displacements (0, 1, 2.5, 5 m, random azimuth) added to the same regions, then passed through the same 10 m gate and classifier. This tests the statistics and gating stage, not the offset correlator.
4. **External benchmark:** Not yet run.

## 4. Results

### Noise floor and AOI status

| Pass | $\sigma_x$ (m) | $\sigma_y$ (m) | $\sigma_r$ (m) | AOI vector displacement (m) | SNR | Status |
|---|---|---|---|---|---|---|
| 098-A | 0.230 | 0.223 | 0.320 | 0.035 | 0.11 | `BELOW_NOISE_FLOOR` |
| 048-D | 0.666 | 0.482 | 0.823 | 0.129 | 0.16 | `BELOW_NOISE_FLOOR` |

The earlier scalar "median magnitude" (0.290 m ascending, 0.524 m descending) is not a displacement estimate. Magnitude of 2-D noise is always positive, and the reference area itself has median magnitude 0.270 m (ascending) and 0.691 m (descending). The AOI is not distinguishable from the reference.

### Background null test

| Pass | Regions | False positives | 95% CI (Wilson) | Upper bound (rule of three) | Max null SNR |
|---|---|---|---|---|---|
| 098-A | 34 | 0 | 0 – 10.2% | 8.8% | 1.79 |
| 048-D | 28 | 0 | 0 – 12.1% | 10.7% | 1.53 |

*Pooled across both passes: 0 of 62 regions false alarms, Rule of Three 95% upper bound $\approx 4.8\%$.*

### Injection-recovery

| Injected (m) | 098-A detect rate (95% CI) | 098-A RMSE (m) | 048-D detect rate (95% CI) | 048-D RMSE (m) |
|---|---|---|---|---|
| 0.0 | 0% (0 – 10.2%) | 0.185 | 0% (0 – 12.1%) | 0.366 |
| 1.0 | 61.8% (45.0 – 76.1%) | 0.143 | 0% (0 – 12.1%) | 0.296 |
| 2.5 | 100% (89.8 – 100%) | 0.143 (5.7% rel) | 92.9% (77.4 – 98.0%) | 0.321 (12.8% rel) |
| 5.0 | 100% (89.8 – 100%) | 0.144 (2.9% rel) | 100% (87.9 – 100%) | 0.323 (6.5% rel) |

Practical detection limit is about $3\sigma_r$: roughly 1 m ascending and 2.5 m descending over a 12-day pair. Recovered displacement carries a small positive bias (about +0.04 m ascending, +0.02 m descending) because magnitude is non-negative.

## 5. Interpretation

- In this AOI neither pass shows displacement above its noise floor. This is a valid, useful result.
- The classifier does not raise false alarms on this scene (0 of 62 regions across both passes), within the stated confidence bounds.
- Ascending sensitivity is about 2.5 times better than descending in this scene. Results from the two passes are not merged.

## 6. Limitations (not claimed)

- No comparison with GNSS, ITS_LIVE or any independent velocity dataset.
- No true flat-terrain negative control yet (Phulpur run pending).
- One AOI, one 12-day pair per track, PROVISIONAL data.
- Injection is post-correlation; correlator errors, decorrelation and atmosphere are not modelled.
- Horizontal motion only; vertical motion assumed zero.
- The SNR threshold of 3 is a heuristic, supported but not calibrated by these tests.
- Pairs in the same scene share one reference, so tests are not fully independent.

## 7. Next steps

1. Run `valkit.py null` and `inject` on a flat-terrain scene (Phulpur), both tracks.
2. Pool or enlarge null placements so the rule-of-three upper bound is 5% or lower (at least 60 independent regions).
3. Run `valkit.py bench` against ITS_LIVE on a glacier moving 100–1000 m/yr.
4. Replace the scalar median-rate headline with vector-median displacement, SNR and status.

## 8. Reproduce

```bash
python engines/known-place/tools/validation/valkit.py noise  --npz ARRAYS.npz --valid-key valid_mask --ref-key reference_mask --tgt-key aoi_mask
python engines/known-place/tools/validation/valkit.py null   --npz ARRAYS.npz --valid-key valid_mask --n 60
python engines/known-place/tools/validation/valkit.py inject --npz ARRAYS.npz --valid-key valid_mask --trials 60 --amps 1 2.5 5
```

\n