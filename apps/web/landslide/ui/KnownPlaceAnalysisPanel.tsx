import { useEffect, useState, type CSSProperties } from 'react';
import { validatePolygonPair } from './KnownPlacePolygonEditor';
import { parsePolygonWkt } from '../engine/investigation';
import type { User } from 'firebase/auth';
import {
  cancelKnownPlaceAnalysis,
  getKnownPlaceAnalysisStatus,
  getKnownPlaceAnalysisResults,
  startKnownPlaceAnalysis,
  type KnownPlaceAnalysisInput,
  type KnownPlaceAnalysisMode,
  type KnownPlaceAnalysisRun,
  type KnownPlaceHazardMode,
} from '../../src/api/knownPlace';
import {
  hasMatchingKnownPlaceCatalogPreflight,
  knownPlaceRequestFingerprint,
} from './knownPlacePreflight';

type StoredRun = KnownPlaceAnalysisRun & { execute_downloads: boolean; request_fingerprint?: string };
type VariantOption = { key: string; releaseId: string; processing: string; granules: string[]; latest?: boolean };
type CatalogSummary = { products: number; releases: number; series: number };

type CandidateTransfer = {
  schemaVersion: 'sarguardian-known-place-candidate/1.0';
  measurementWkt: string;
  candidate: {
    candidateId: string; productType: 'GOFF'; metric: string; evidenceClass: string; status: string;
    supportPairs: number; pixelCount: number; approximateAreaM2: number; productIds: string[];
    pairIntervals: Array<Record<string, unknown>>; geometryOriginalVertices: number; geometrySuggestedVertices: number;
    geometrySimplified: boolean; interpretation: string;
  };
};

function consumeCandidateTransfer(): CandidateTransfer | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem('sarguardian.knownPlaceCandidate.v1');
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<CandidateTransfer>;
    if (value.schemaVersion !== 'sarguardian-known-place-candidate/1.0') return null;
    if (typeof value.measurementWkt !== 'string' || !value.measurementWkt.startsWith('POLYGON')) return null;
    if (!value.candidate || value.candidate.productType !== 'GOFF' || typeof value.candidate.candidateId !== 'string') return null;
    return value as CandidateTransfer;
  } catch { return null; }
}

type Props = {
  user: User;
  aoiWkt: string | null;
  startDate: string;
  endDate: string;
  placeName: string | null;
  aoiAreaKm2: number;
  onBack: () => void;
  onShowResults: () => void;
};

const hazardModes: { value: KnownPlaceHazardMode; label: string }[] = [
  { value: 'landslide', label: 'Landslide' },
  { value: 'glacier_collapse', label: 'Glacier collapse' },
  { value: 'ice_rock_avalanche', label: 'Ice–rock avalanche' },
  { value: 'mixed', label: 'Mixed / uncertain' },
];

const analysisModes: { value: KnownPlaceAnalysisMode; label: string }[] = [
  { value: 'exploratory', label: 'Exploratory measurement' },
  { value: 'retrospective_validation', label: 'Retrospective validation' },
];

function storageKey(uid: string): string {
  return `sarguardian.knownPlaceAnalysis.v1:${uid}`;
}

function geometryDraftKey(uid: string): string {
  return `sarguardian.knownPlaceGeometry.v1:${uid}`;
}

type GeometryDraft = { measurementWkt: string; referenceWkt: string };

function loadGeometryDraft(uid: string): GeometryDraft {
  if (typeof window === 'undefined') return { measurementWkt: '', referenceWkt: '' };
  try {
    const raw = window.localStorage.getItem(geometryDraftKey(uid));
    if (!raw) return { measurementWkt: '', referenceWkt: '' };
    const parsed = JSON.parse(raw) as Partial<GeometryDraft>;
    return {
      measurementWkt: typeof parsed.measurementWkt === 'string' ? parsed.measurementWkt : '',
      referenceWkt: typeof parsed.referenceWkt === 'string' ? parsed.referenceWkt : '',
    };
  } catch {
    return { measurementWkt: '', referenceWkt: '' };
  }
}

function samePolygonGeometry(firstWkt: string, secondWkt: string): boolean {
  try {
    const first = parsePolygonWkt(firstWkt);
    const second = parsePolygonWkt(secondWkt);
    return first.length === second.length && first.every((point, index) =>
      Math.abs(point[0] - second[index][0]) <= 1e-9
      && Math.abs(point[1] - second[index][1]) <= 1e-9,
    );
  } catch {
    return false;
  }
}


// eslint-disable-next-line react-refresh/only-export-components
export function loadStoredRun(uid: string): StoredRun | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(storageKey(uid));
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<StoredRun>;
    if (typeof parsed.request_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(parsed.request_id)) return null;
    if (typeof parsed.execute_downloads !== 'boolean') return null;
    if (!['dispatching', 'queued', 'in_progress', 'completed'].includes(String(parsed.status))) return null;
    return parsed as StoredRun;
  } catch {
    return null;
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function loadKnownPlaceRunRequestId(uid: string): string | null {
  const run = loadStoredRun(uid);
  return run?.execute_downloads === true && run.conclusion === 'success' ? run.request_id : null;
}

function resultLabel(run: StoredRun): string {
  if (run.status !== 'completed') return run.status === 'dispatching' ? 'Processing' : 'Processing';
  if (run.conclusion === 'success') return 'Complete';
  if (run.conclusion === 'cancelled') return 'Cancelled';
  return 'Failed';
}

function formatElapsed(startedAt: number | null, finishedAt: number | null, now: number): string {
  if (!startedAt) return '00:00';
  const end = finishedAt ?? now;
  const totalSeconds = Math.max(0, Math.floor((end - startedAt) / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

type ReleaseLookupProgress = {
  percent: number;
  stage: string;
  detail: string;
  tone: 'running' | 'complete' | 'failed';
};

type AnalysisProgress = ReleaseLookupProgress & { step: number };

function getReleaseLookupProgress(pendingAction: 'dry-run' | 'analysis' | 'cancel' | null, run: StoredRun | null): ReleaseLookupProgress | null {
  if (pendingAction === 'dry-run') {
    return { percent: 8, stage: 'Starting', detail: 'Sending the catalog request…', tone: 'running' };
  }
  if (!run) return null;
  if (run.status === 'dispatching') {
    return { percent: 20, stage: 'Starting', detail: 'Finding available releases.', tone: 'running' };
  }
  if (run.status === 'queued') {
    return { percent: 38, stage: 'Queued', detail: '', tone: 'running' };
  }
  if (run.status === 'in_progress') {
    return run.execute_downloads
      ? { percent: 72, stage: 'Processing', detail: 'Computing the Known Place measurement.', tone: 'running' }
      : { percent: 72, stage: 'Searching catalog', detail: 'Finding releases and planning a consistent series.', tone: 'running' };
  }
  if (run.conclusion === 'success') {
    return { percent: 100, stage: 'Complete', detail: run.execute_downloads ? 'Analysis complete.' : 'Choose an available release below.', tone: 'complete' };
  }
  if (run.conclusion === 'cancelled') return null;
  return { percent: 100, stage: 'Lookup failed', detail: 'Open the workflow details, then try again.', tone: 'failed' };
}

function getAnalysisProgress(pendingAction: 'dry-run' | 'analysis' | 'cancel' | null, run: StoredRun | null): AnalysisProgress | null {
  if (pendingAction === 'analysis') return { percent: 8, stage: 'Initializing', detail: '', tone: 'running', step: 0 };
  if (!run || run.execute_downloads !== true) return null;
  if (run.status === 'dispatching') return { percent: 20, stage: 'Initializing', detail: '', tone: 'running', step: 0 };
  if (run.status === 'queued') return { percent: 38, stage: 'Processing', detail: '', tone: 'running', step: 1 };
  if (run.status === 'in_progress') return { percent: 72, stage: 'Processing', detail: '', tone: 'running', step: 1 };
  if (run.conclusion === 'success') return { percent: 100, stage: 'Complete', detail: '', tone: 'complete', step: 3 };
  if (run.conclusion === 'cancelled') return { percent: 100, stage: 'Cancelled', detail: '', tone: 'failed', step: 3 };
  return { percent: 100, stage: 'Failed', detail: '', tone: 'failed', step: 3 };
}

export function KnownPlaceAnalysisPanel({ user, aoiWkt, startDate, endDate, onBack, onShowResults }: Props) {
  const [hazardMode, setHazardMode] = useState<KnownPlaceHazardMode>('mixed');
  const [analysisMode, setAnalysisMode] = useState<KnownPlaceAnalysisMode>('exploratory');
  const [polarization, setPolarization] = useState<'HH' | 'HV' | 'VV' | 'VH'>('HH');
  const [track, setTrack] = useState('ANY');
  const [direction, setDirection] = useState<'ANY' | 'A' | 'D'>('ANY');
  const [coherenceNeighbours, setCoherenceNeighbours] = useState<'1' | '5' | '10' | '15' | '20' | '25'>('1');
  const [allowedReleaseIds, setAllowedReleaseIds] = useState('');
  const [preferredGranules, setPreferredGranules] = useState('');
  const [selectedVariantKey, setSelectedVariantKey] = useState('');
  const [candidateTransfer] = useState<CandidateTransfer | null>(() => consumeCandidateTransfer());
  const [geometryDraft] = useState<GeometryDraft>(() => loadGeometryDraft(user.uid));
  const measurementWkt = candidateTransfer?.measurementWkt || geometryDraft.measurementWkt || '';
  const referenceWkt = geometryDraft.referenceWkt;
  const [polygonValidation, setPolygonValidation] = useState({ valid: false, message: 'Draw and close the Measurement and Reference Polygons. The Reference may enclose the Measurement; partial overlap is invalid.' });
  const [geometryHeight, setGeometryHeight] = useState('');
  const [pendingAction, setPendingAction] = useState<'dry-run' | 'analysis' | 'cancel' | null>(null);
  const [run, setRun] = useState<StoredRun | null>(() => loadStoredRun(user.uid));
  const [catalogReleaseIds, setCatalogReleaseIds] = useState<string[]>([]);
  const [catalogVariantOptions, setCatalogVariantOptions] = useState<VariantOption[]>([]);
  const [catalogSummary, setCatalogSummary] = useState<CatalogSummary | null>(null);
  const [catalogReleaseError, setCatalogReleaseError] = useState('');
  const [error, setError] = useState('');
  const [pollError, setPollError] = useState('');
  const [lookupStartedAt, setLookupStartedAt] = useState<number | null>(null);
  const [clock, setClock] = useState(() => Date.now());
  const createAnalysisInput = (executeDownloads: boolean): KnownPlaceAnalysisInput => ({
    aoi_wkt: measurementWkt,
    scope_aoi_wkt: aoiWkt || '',
    start_date: startDate,
    end_date: endDate,
    hazard_mode: hazardMode,
    analysis_mode: analysisMode,
    polarization,
    track: track.trim().toUpperCase(),
    direction,
    coherence_neighbours: coherenceNeighbours,
    allowed_release_ids: allowedReleaseIds.trim(),
    preferred_granules: preferredGranules.trim(),
    reference_wkt: referenceWkt,
    candidate_context: candidateTransfer ? {
      source: 'FIND_DISPLACEMENTS',
      candidate_id: candidateTransfer.candidate.candidateId,
      product_type: 'GOFF',
      metric: candidateTransfer.candidate.metric,
      evidence_class: candidateTransfer.candidate.evidenceClass,
      status: candidateTransfer.candidate.status,
      support_pairs: candidateTransfer.candidate.supportPairs,
      pixel_count: candidateTransfer.candidate.pixelCount,
      approx_area_m2: candidateTransfer.candidate.approximateAreaM2,
      product_ids: candidateTransfer.candidate.productIds,
      pair_intervals: candidateTransfer.candidate.pairIntervals,
      geometry_original_vertices: candidateTransfer.candidate.geometryOriginalVertices,
      geometry_suggested_vertices: candidateTransfer.candidate.geometrySuggestedVertices,
      geometry_simplified: candidateTransfer.candidate.geometrySimplified,
      geometry_edited: !samePolygonGeometry(measurementWkt, candidateTransfer.measurementWkt),
      interpretation: candidateTransfer.candidate.interpretation,
    } : null,
    geometry_height_m: geometryHeight.trim() ? Number(geometryHeight) : null,
    execute_downloads: executeDownloads,
    confirm_raw_downloads: executeDownloads,
  });
  const currentRequestFingerprint = knownPlaceRequestFingerprint(createAnalysisInput(false));
  // Persisted runs belong to the exact geometry/date/settings fingerprint that
  // created them. A changed setup must not resurrect an older completed run.
  const activeRun = run?.request_fingerprint === currentRequestFingerprint ? run : null;
  const catalogPreflightReady = hasMatchingKnownPlaceCatalogPreflight(activeRun, currentRequestFingerprint);
  const canSubmitGeometry = Boolean(measurementWkt && referenceWkt && polygonValidation.valid);

  useEffect(() => {
    if (!measurementWkt || !referenceWkt) {
      setPolygonValidation({ valid: false, message: 'Return to the setup page and confirm all three polygons first.' });
      return;
    }
    try {
      setPolygonValidation(validatePolygonPair(null, parsePolygonWkt(measurementWkt), parsePolygonWkt(referenceWkt), true, true));
    } catch {
      setPolygonValidation({ valid: false, message: 'Saved polygon geometry is invalid. Return to the setup page and redraw the polygons.' });
    }
  }, [measurementWkt, referenceWkt]);

  useEffect(() => {
    try {
      if (!measurementWkt && !referenceWkt) {
        localStorage.removeItem(geometryDraftKey(user.uid));
      } else {
        localStorage.setItem(geometryDraftKey(user.uid), JSON.stringify({ measurementWkt, referenceWkt }));
      }
    } catch { /* local storage is optional; current component state remains authoritative */ }
  }, [measurementWkt, referenceWkt, user.uid]);

  useEffect(() => {
    if (!run) return;
    try { localStorage.setItem(storageKey(user.uid), JSON.stringify(run)); } catch { /* local storage is optional */ }
  }, [run, user.uid]);

  const runRequestId = activeRun?.request_id ?? null;
  const runStatus = activeRun?.status ?? null;

  useEffect(() => {
    const requestId = runRequestId;
    if (!requestId || runStatus === 'completed') return undefined;
    let active = true;
    let timeoutId: number | undefined;
    const poll = async () => {
      try {
        const next = await getKnownPlaceAnalysisStatus(requestId, user);
        if (!active) return;
        setPollError('');
        setRun((current) => current && current.request_id === next.request_id
          ? { ...current, ...next, execute_downloads: current.execute_downloads }
          : current);
        if (next.status !== 'completed' && active) timeoutId = window.setTimeout(poll, 3500);
      } catch (statusError) {
        if (!active) return;
        setPollError(statusError instanceof Error ? statusError.message : 'Could not refresh this run yet.');
        timeoutId = window.setTimeout(poll, 8000);
      }
    };
    timeoutId = window.setTimeout(poll, 1200);
    return () => {
      active = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [runRequestId, runStatus, user]);

  useEffect(() => {
    if (!activeRun || activeRun.status !== 'completed' || activeRun.conclusion !== 'success' || activeRun.execute_downloads !== false) {
      setCatalogReleaseIds([]);
      setCatalogVariantOptions([]);
      setCatalogSummary(null);
      setCatalogReleaseError('');
      return undefined;
    }
    let active = true;
    setCatalogReleaseIds([]);
    setCatalogVariantOptions([]);
    setCatalogSummary(null);
    setCatalogReleaseError('');
    void getKnownPlaceAnalysisResults(activeRun.request_id, user)
      .then((payload) => {
        if (!active) return;
        const ids = Array.from(new Set(
          [
            ...(payload.result.pairwise_series_plan.candidate_release_ids || []),
            ...payload.result.pairwise_series_plan.chains.map((chain) => chain.release_id),
          ]
            .filter((releaseId): releaseId is string => Boolean(releaseId)),
        ));
        setCatalogReleaseIds(ids);
        const diagnostics = payload.result.pairwise_series_plan.selection_diagnostics;
        const granules = Array.from(new Set(
          (diagnostics?.ambiguous_pairs || []).flatMap((pair) => pair.candidate_granules || []),
        ));
        const variants = new Map<string, VariantOption>();
        for (const granule of granules) {
          const match = /^NISAR_L2_([A-Z]{2})_GOFF_/.exec(granule);
          if (!match) continue;
          const processing = match[1];
          // A diagnostics payload can contain multiple release IDs in the
          // same processing variant. Pin only granules belonging to the
          // release option the user selected, never the whole PR/UR set.
          const releaseMatches = Array.from(granule.matchAll(/_([A-Z]\d{5})_/g)).map((item) => item[1]);
          const releaseId = releaseMatches.length ? releaseMatches[releaseMatches.length - 1] : (ids[0] || '');
          const key = `${releaseId}::${processing}`;
          const current: VariantOption = variants.get(key) || { key, releaseId, processing, granules: [] };
          current.granules.push(granule);
          variants.set(key, current);
        }
        // Successful, unambiguous dry runs expose the selected processing
        // identity on their chains rather than in ambiguity diagnostics.
        for (const chain of payload.result.pairwise_series_plan.chains || []) {
          const processing = (chain.processing || '').toUpperCase();
          const releaseId = chain.release_id || '';
          if (!processing || !releaseId) continue;
          const key = `${releaseId}::${processing}`;
          const current: VariantOption = variants.get(key) || { key, releaseId, processing, granules: [] };
          for (const pair of chain.pairs || []) {
            if (pair.granule_name && !current.granules.includes(pair.granule_name)) current.granules.push(pair.granule_name);
          }
          variants.set(key, current);
        }
        const variantOptions = Array.from(variants.values()).sort((a, b) => a.processing.localeCompare(b.processing));
        const latestGranuleTimestamp = (granule: string): string => {
          const timestamps = Array.from(granule.matchAll(/_(\d{8}T\d{6})/g)).map((match) => match[1]);
          const sorted = timestamps.sort();
          return sorted[sorted.length - 1] || '';
        };
        const allTimestamps = variantOptions.flatMap((option) => option.granules.map(latestGranuleTimestamp)).sort();
        const latestTimestamp = allTimestamps[allTimestamps.length - 1] || '';
        for (const option of variantOptions) {
          option.latest = Boolean(latestTimestamp && option.granules.some((granule) => latestGranuleTimestamp(granule) === latestTimestamp));
        }
        const plannedGranules = new Set([
          ...granules,
          ...(payload.result.pairwise_series_plan.chains || []).flatMap((chain) =>
            (chain.pairs || []).map((pair) => pair.granule_name).filter((name): name is string => Boolean(name)),
          ),
        ]);
        setCatalogVariantOptions(variantOptions);
        setCatalogSummary({
          products: plannedGranules.size,
          releases: ids.length,
          series: payload.result.pairwise_series_plan.chain_count || 0,
        });
      })
      .catch((reason: unknown) => {
        if (active) setCatalogReleaseError(reason instanceof Error ? reason.message : 'Release IDs are available in the result bundle.');
      });
    return () => { active = false; };
  }, [activeRun, user]);

  const submit = async (executeDownloads: boolean) => {
    if (!startDate || !endDate) {
      setError('Return to the setup page and choose a valid date window first.');
      return;
    }
    if (!measurementWkt || !referenceWkt || !polygonValidation.valid) {
      setError(polygonValidation.message || 'Draw and validate the Measurement and Reference polygons before submitting. The Reference may be a larger enclosing region; partial overlap is invalid.');
      return;
    }
    if (executeDownloads && !catalogPreflightReady) {
      setError('Run a successful catalog-only dry run for these exact polygons, dates and processing settings first, then select one of its release IDs.');
      return;
    }
    if (executeDownloads && catalogReleaseIds.length > 0 && !allowedReleaseIds.trim()) {
      setError('Select one release ID from the successful dry-run result before starting the raw GOFF measurement.');
      return;
    }
    if (executeDownloads && catalogVariantOptions.length > 0 && !catalogVariantOptions.some((option) => option.key === selectedVariantKey && option.releaseId === allowedReleaseIds.trim())) {
      setError('Select one release and processing variant from the successful dry-run result before starting the raw GOFF measurement.');
      return;
    }
    if (executeDownloads && catalogVariantOptions.some((option) => option.granules.length > 0) && !preferredGranules.trim()) {
      setError('Select one processing variant (PR or UR) from the successful dry-run result before starting the raw GOFF measurement.');
      return;
    }
    if (track.trim().toUpperCase() !== 'ANY' && !/^\d{3}$/.test(track.trim())) {
      setError('Track must be ANY or an exact three-digit value such as 098.');
      return;
    }
    const height = geometryHeight.trim() ? Number(geometryHeight) : null;
    if (height !== null && (!Number.isFinite(height) || height < -500 || height > 100000)) {
      setError('Enter a finite ellipsoidal height between −500 and 100,000 metres, or leave it blank.');
      return;
    }
    setPendingAction(executeDownloads ? 'analysis' : 'dry-run');
    setLookupStartedAt(Date.now());
    setError('');
    setPollError('');
    try {
      const analysisInput = {
        ...createAnalysisInput(executeDownloads),
        geometry_height_m: height,
        // A new catalog dry run must discover candidates for the current
        // polygons/date window; never carry an older pinned release/variant
        // into that discovery request.
        ...(executeDownloads ? {} : {
          allowed_release_ids: '',
          preferred_granules: '',
        }),
      };
      const requestFingerprint = knownPlaceRequestFingerprint(analysisInput);
      const submitted = await startKnownPlaceAnalysis(analysisInput, user);
      setRun({
        ...submitted,
        execute_downloads: executeDownloads,
        request_fingerprint: requestFingerprint,
      });
      if (!executeDownloads) {
        setAllowedReleaseIds('');
        setPreferredGranules('');
        setSelectedVariantKey('');
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit Known Place Analysis.');
    } finally {
      setPendingAction(null);
    }
  };

  const cancelRun = async () => {
    if (!run || run.status === 'completed' || pendingAction !== null) return;
    setPendingAction('cancel');
    setError('');
    try {
      const cancelled = await cancelKnownPlaceAnalysis(run.request_id, user);
      setRun((current) => current ? { ...current, ...cancelled, execute_downloads: current.execute_downloads } : current);
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Could not cancel this analysis.');
    } finally {
      setPendingAction(null);
    }
  };

  const runTerminal = activeRun?.status === 'completed';
  const runSucceeded = runTerminal && activeRun?.conclusion === 'success';
  const runCancelled = runTerminal && activeRun?.conclusion === 'cancelled';
  const releaseLookupProgress = getReleaseLookupProgress(pendingAction, activeRun);
  const analysisProgress = getAnalysisProgress(pendingAction, activeRun);
  const lookupStarted = lookupStartedAt ?? (activeRun?.created_at ? Date.parse(activeRun.created_at) : null);
  const lookupFinished = runTerminal && activeRun?.updated_at ? Date.parse(activeRun.updated_at) : null;
  const elapsed = formatElapsed(lookupStarted, lookupFinished, clock);

  useEffect(() => {
    if (!releaseLookupProgress && !analysisProgress) return undefined;
    const interval = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [releaseLookupProgress, analysisProgress]);

  return (
    <main className="nisar-results-main displacement-preparation known-place-analysis">
        <section className="known-place-custom-measurement" aria-label="Known Place custom measurement">
        {candidateTransfer && <div className="catalog-notice known-place-candidate-handoff" role="status">
          <strong>Suggested Measurement Polygon imported from Find Displacements</strong>
          <span>{candidateTransfer.candidate.candidateId} · GOFF offset-anomaly candidate · {candidateTransfer.candidate.supportPairs} supporting pair(s) · {candidateTransfer.candidate.pixelCount} pixels</span>
          <span>{candidateTransfer.candidate.geometrySimplified ? `Boundary simplified from ${candidateTransfer.candidate.geometryOriginalVertices} to ${candidateTransfer.candidate.geometrySuggestedVertices} vertices; inspect and edit it before measurement.` : `${candidateTransfer.candidate.geometrySuggestedVertices} boundary vertices transferred; inspect and edit before measurement.`}</span>
          <span>Candidate evidence is not measured ground motion or a confirmed landslide. Draw a background polygon that is either disjoint from or fully encloses the proposed measurement area; partial overlap and boundary-touch are rejected.</span>
        </div>}
        <details className="known-place-additional-settings">
          <summary>Additional settings</summary>
          <div className="known-place-form-grid">
          <label className="aoi-job-label">
            <span>Hazard context</span>
            <select value={hazardMode} onChange={(event) => setHazardMode(event.target.value as KnownPlaceHazardMode)}>
              {hazardModes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="aoi-job-label">
            <span>Analysis mode</span>
            <select value={analysisMode} onChange={(event) => setAnalysisMode(event.target.value as KnownPlaceAnalysisMode)}>
              {analysisModes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="aoi-job-label">
            <span>Polarization</span>
            <select value={polarization} onChange={(event) => setPolarization(event.target.value as 'HH' | 'HV' | 'VV' | 'VH')}>
              {(['HH', 'HV', 'VV', 'VH'] as const).map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label className="aoi-job-label">
            <span>Track</span>
            <input value={track} onChange={(event) => setTrack(event.target.value)} maxLength={3} placeholder="ANY or 098" autoComplete="off" />
          </label>
          <label className="aoi-job-label">
            <span>Flight direction</span>
            <select value={direction} onChange={(event) => setDirection(event.target.value as 'ANY' | 'A' | 'D')}>
              <option value="ANY">Any — keep orbit chains separate</option>
              <option value="A">Ascending</option>
              <option value="D">Descending</option>
            </select>
          </label>
          <label className="aoi-job-label">
            <span>Minimum valid coherence neighbours</span>
            <select value={coherenceNeighbours} onChange={(event) => setCoherenceNeighbours(event.target.value as typeof coherenceNeighbours)}>
              {(['1', '5', '10', '15', '20', '25'] as const).map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="aoi-job-label known-place-setting-wide">
            <span>Constant ellipsoidal height in metres (optional sensitivity only)</span>
            <input type="number" value={geometryHeight} onChange={(event) => setGeometryHeight(event.target.value)} min={-500} max={100000} step="any" placeholder="Blank = documented approximation" />
          </label>
          </div>
        </details>

        <section className="known-place-run-options" aria-label="Known Place run options">
          <div className="known-place-release-finder">
            <p className="known-place-choose-release" role="status">Choose a release ID before analysis.</p>
            <button type="button" className="demo-button known-place-find-release" disabled={!canSubmitGeometry || pendingAction !== null} onClick={() => void submit(false)}>
              {pendingAction === 'dry-run' ? 'Finding release ID…' : 'Find release ID'}
            </button>
          </div>
          {releaseLookupProgress && !analysisProgress && <section className={`known-place-release-progress is-${releaseLookupProgress.tone}`} aria-live="polite">
              <div className="known-place-status-heading">
                <h2>Run status</h2>
                <div className="known-place-status-actions">
                  {activeRun && activeRun.status !== 'completed' && <button type="button" className="known-place-cancel" disabled={pendingAction !== null} onClick={() => void cancelRun()}>{pendingAction === 'cancel' ? 'Cancelling…' : 'Cancel run'}</button>}
                  <span className={`known-place-status-chip is-${releaseLookupProgress.tone}`}><i />{activeRun ? resultLabel(activeRun) : 'Processing'}</span>
                </div>
              </div>
              <div
                className="known-place-progress-track"
                role="progressbar"
                aria-label="Release ID lookup progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={releaseLookupProgress.percent}
                aria-valuetext={releaseLookupProgress.stage}
              >
                <i style={{ width: `${releaseLookupProgress.percent}%` }} />
              </div>
              <div className="known-place-progress-meta">
                <span>{runCancelled ? 'Cancelled' : releaseLookupProgress.tone === 'complete' ? 'Complete' : releaseLookupProgress.tone === 'failed' ? 'Failed' : 'Processing'}</span>
                <b>{releaseLookupProgress.percent}% · {elapsed}</b>
              </div>
              {runCancelled ? <p className="known-place-progress-message">Run cancelled.</p> : releaseLookupProgress.tone === 'failed' ? <p className="known-place-progress-message">Release lookup failed. Try again.</p> : releaseLookupProgress.detail ? <p className="known-place-progress-message">{releaseLookupProgress.detail}</p> : null}
              {pollError && !runTerminal && <p className="action-hint" role="status">{pollError} Automatic status checks will retry.</p>}
              {catalogSummary && <div className="known-place-catalog-summary" aria-label="Catalog lookup summary">
                <div><span>Products found</span><strong>{catalogSummary.products}</strong></div>
                <div><span>Releases</span><strong>{catalogSummary.releases}</strong></div>
                <div><span>Series planned</span><strong>{catalogSummary.series}</strong></div>
              </div>}
              {runSucceeded && run?.execute_downloads === false && <div className="known-place-release-results">
                <h3>Select a release</h3>
                {catalogReleaseIds.length > 0 ? <div className="catalog-release-options" role="radiogroup" aria-label="Release and processing variants found by the catalog dry run">
                  {catalogVariantOptions.length > 0 ? catalogVariantOptions.map((option) => <label key={option.key}>
                    <input type="radio" name="known-place-release" value={option.key} checked={selectedVariantKey === option.key} onChange={() => { setSelectedVariantKey(option.key); setAllowedReleaseIds(option.releaseId); setPreferredGranules(option.granules.join(',')); }} />
                    <span>{option.releaseId} — {option.processing}{option.latest ? ' · Latest' : ''}</span>
                    <small>{option.granules.length} product{option.granules.length === 1 ? '' : 's'}</small>
                  </label>) : catalogReleaseIds.map((releaseId) => <label key={releaseId}>
                    <input type="radio" name="known-place-release" value={releaseId} checked={allowedReleaseIds === releaseId} onChange={() => setAllowedReleaseIds(releaseId)} />
                    <span>{releaseId}</span>
                  </label>)}
                </div> : <p className="known-place-release-loading">{catalogReleaseError || 'Loading release IDs from the verified dry-run result…'}</p>}
              </div>}
          </section>}
          {error && <p className="catalog-error" role="alert">{error}</p>}
        </section>

        {analysisProgress && <section className={`known-place-analysis-progress is-${analysisProgress.tone}`} aria-live="polite">
          <div className="known-place-status-heading">
            <h2>Run status</h2>
            <div className="known-place-status-actions">
              {activeRun && !runTerminal && <button type="button" className="known-place-cancel" disabled={pendingAction !== null} onClick={() => void cancelRun()}>{pendingAction === 'cancel' ? 'Cancelling…' : 'Cancel run'}</button>}
              <span className={`known-place-status-chip is-${analysisProgress.tone}`}><i />{analysisProgress.tone === 'complete' ? 'Complete' : analysisProgress.tone === 'failed' ? (runCancelled ? 'Cancelled' : 'Failed') : 'Running'}</span>
            </div>
          </div>
          <div className="known-place-analysis-progress-body">
            <div className="known-place-analysis-timer" style={{ '--known-place-progress': `${analysisProgress.percent}%` } as CSSProperties}>
              <strong>{analysisProgress.stage}</strong><span>{elapsed}</span>
            </div>
            <div className="known-place-analysis-stepper" aria-label="Known Place analysis progress">
              {['Initializing', 'Processing', 'Screening', 'Complete'].map((label, index) => <div className={index <= analysisProgress.step ? 'is-active' : ''} key={label}><i /><span>{label}</span></div>)}
            </div>
          </div>
          <div className="known-place-progress-meta"><span>{analysisProgress.stage}</span><b>{analysisProgress.percent}% · {elapsed}</b></div>
        </section>}

        {runSucceeded && activeRun?.execute_downloads && (
          <button type="button" className="investigate-button known-place-show-results" onClick={onShowResults}>Show result</button>
        )}
        </section>
        {!analysisProgress && <div className="known-place-run-action">
          <button type="button" className="investigate-button" disabled={!canSubmitGeometry || !catalogPreflightReady || pendingAction !== null} onClick={() => void submit(true)}>
            {pendingAction === 'analysis' ? 'Starting GOFF analysis…' : 'Run Known Place Analysis'}
          </button>
        </div>}
        <button type="button" className="workspace-nav-link known-place-back" onClick={onBack}>← Back to AOI map</button>
    </main>
  );
}
