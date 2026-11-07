# Glacier Movement — Validation Protocol

**Product path:** Glacier Movement  
**Engine:** shared Find Displacements engine  
**NISAR products:** GOFF offsets and conditionally GUNW LOS diagnostics

## What this validation establishes

Glacier Movement uses the same AOI-wide candidate-discovery and measurement rules as Landslide screening. The glacier context changes the study question, not the underlying NISAR measurement semantics.

The regression suite establishes the shared processing contract. It does not constitute a glacier-specific field validation or a separate glacier-collapse model.

## Reproduction path

1. Open Glacier Movement and select an actual glacier or ice/rock study AOI.
2. Record the AOI, time window and exact source granules.
3. Verify GOFF and GUNW product eligibility separately.
4. Follow the [Find Displacements validation checklist](find-displacements.md) for product, quality, support and provenance checks.
5. Confirm that the displayed signal remains labelled as a candidate and that the source acquisitions are visible.

## Shared-engine software evidence

- [Find Displacements Backend run #42097077601](https://github.com/moshiour0/SARGuardian-backend/actions/runs/42097077601) demonstrates the target-free processing and output chain for its selected AOI.
- [Monorepo Snapshot Regression #42327901627](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/42327901627) passed the shared Find Displacements engine regression job.

These runs demonstrate the shared engine and its workflow contracts. Do not relabel a different AOI's result as a glacier-specific physical validation.

## Glacier-specific review checklist

- Select a glacier AOI for which NISAR acquisition geometry can observe the expected motion component.
- Check seasonal snow, layover/shadow, decorrelation and terrain effects against the selected product quality masks.
- Keep GOFF displacement components separate from GUNW LOS observations.
- Compare only compatible acquisition pairs and preserve the exact temporal interval.
- Use independent glacier velocity products, feature tracking, GNSS or field observations only when their dates, spatial support, projection and measurement definition are documented.
- Do not claim a collapse or avalanche detection from a motion anomaly alone.

## Interpretation contract

A candidate indicates where further glacier-terrain investigation may be useful. It is not, by itself, a measured 3-D glacier velocity, an avalanche classification, a failure probability or an early-warning forecast.

## Sources

- [NISAR GOFF guide](https://nisar-docs.asf.alaska.edu/goff/)
- [NISAR GUNW guide](https://nisar-docs.asf.alaska.edu/gunw/)
- [Shared Find Displacements validation](find-displacements.md)
