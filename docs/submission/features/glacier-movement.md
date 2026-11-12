# Glacier Movement — Shared Find Displacements Workflow

**Product path:** Glacier Movement  
**Engine:** The same shared Find Displacements engine used by Landslide screening  
**Challenge fit:** Dancing with the SARs — Earth Science

## What it does

Glacier Movement provides a glacier-focused entry point into SARGuardian's AOI-wide displacement-candidate workflow. A user selects a glacier or ice/rock study area and an observation window; the shared engine discovers compatible NISAR observations and screens for candidate surface-motion signals.

This is not a separate glacier-collapse physics model. It is not an automatic ice avalanche classifier. The glacier label identifies the study context; the processing engine and measurement rules remain the shared Find Displacements workflow.

## NISAR measurement path

- **GOFF offsets** provide pairwise range and along-track pixel-offset observations. These can support spatially organised movement-candidate screening when their quality and geometry checks pass.
- **GUNW phase** can provide relative line-of-sight displacement diagnostics when a compatible repeated observation network exists.

GOFF and GUNW remain separate. A single LOS component cannot independently resolve full 3-D glacier motion. A pairwise offset anomaly is not by itself a glacier velocity estimate or evidence of imminent collapse.

## Why the workflow is useful

Glacier motion and unstable ice/rock terrain can affect downstream communities and infrastructure. A target-free AOI scan helps identify locations that deserve closer inspection without requiring the user to identify the moving patch beforehand. NISAR's L-band observations add a radar-based view that can complement optical and field context.

## Demonstration path

1. Open Glacier Movement.
2. Select a glacier/ice-affected AOI and the available observation period.
3. Review which NISAR products and acquisition pairs are eligible.
4. Inspect GOFF candidate evidence and any supported GUNW LOS diagnostics separately.
5. Trace the displayed candidate to its acquisition pair, quality support and provenance.

Use an actual glacier study AOI for a live demonstration. Do not substitute a landslide run and describe it as glacier-specific validation.

## Evidence interpretation

The software capability is the shared, target-free displacement workflow. A glacier-specific physical interpretation still depends on the selected glacier, the product geometry, the quality of the observation network and appropriate independent context. If a study shows an offset anomaly, describe it as a **glacier-movement candidate** until the evidence supports a stronger physical interpretation.

For ice–rock avalanche or glacier-collapse storytelling, distinguish the reported event context from the radar quantity that was actually measured. Do not label the product as an automatic collapse detector.

## Source references

- [Shared Find Displacements guide](landslide-find-displacements.md)
- [Backend science and workflow repository](https://github.com/moshiour0/SARGuardian-backend)
- [NISAR GOFF product guide](https://nisar-docs.asf.alaska.edu/goff/)
- [NISAR GUNW product guide](https://nisar-docs.asf.alaska.edu/gunw/)
