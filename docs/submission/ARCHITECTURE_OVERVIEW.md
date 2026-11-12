# SARGuardian — Architecture and Data Flow

This diagram shows how the four user-facing workflows map to three distinct NISAR processing paths. It is a conceptual navigation diagram; the linked implementation and source manifests define the exact workflow contracts.

\`\`\`mermaid
flowchart TB
  U[User selects workflow, AOI and dates] --> W[Interactive SARGuardian web application]
  W --> API[Authenticated API and job state]
  API --> F[Find Displacements engine]
  API --> K[Known Place two-polygon engine]
  API --> R[RiverShift GCOV engine]

  subgraph Shared displacement use cases
    L[Landslide] --> F
    G[Glacier Movement] --> F
    F --> GOFF[GOFF pairwise range and azimuth offsets]
    F --> GUNW[GUNW relative LOS diagnostics, when network support permits]
  end

  subgraph Known Place measurement
    KP[Measurement Polygon plus Reference Polygon] --> K
    K --> KGOFF[GOFF pairwise offsets]
    KGOFF --> KR[Relative horizontal displacement and interval-average rate]
  end

  subgraph Independent river analysis
    RS[River-reach AOI and date window] --> CMR[NASA CMR / ASF DAAC catalogue]
    CMR --> GCOV[NISAR Level-2 GCOV granules]
    GCOV --> R
    R --> RC[Observed-date water and persistent land-water candidate masks]
  end

  GOFF --> Q[Quality checks, provenance, reports and result artifacts]
  GUNW --> Q
  KR --> Q
  RC --> Q
  Q --> MAP[Map layers, observed-date playback and evidence explorer]
\`\`\`

## Data and measurement boundaries

| Product | Quantity used | User-facing workflow |
|---|---|---|
| NISAR GUNW | Relative LOS displacement from unwrapped phase under a stated reference policy | Find Displacements: Landslide / Glacier Movement when compatible |
| NISAR GOFF | Pairwise range and along-track pixel offsets | Find Displacements and Known Place |
| NISAR GCOV | Geocoded covariance/backscatter and radar-derived water/land screening | RiverShift |

The products are not merged into one common velocity or hazard score. Each result retains its own source acquisition, geometry, units, support and interpretation rules.

## Shared evidence layer

The result explorer links visible layers to their processing report, source granule identity and retained artifact evidence. Product-quality gates, missing-data handling, checksums, overlap diagnostics and scientific review states are recorded by the relevant engine.

## Source implementation

- [Dynamic web application and API](https://github.com/moshiour0/SARGuardian_Dynamic)
- [Backend processing workers](https://github.com/moshiour0/SARGuardian-backend)
- [Monorepo engine packages and provenance](https://github.com/moshiour0/SARGuardian-Monorepo)
