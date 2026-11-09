import { useCallback, useEffect, useState } from 'react';
import { KnownPlacePolygonEditor } from './KnownPlacePolygonEditor';
import { KnownPlaceResultsDashboard } from './KnownPlaceResultsDashboard';
import { parsePolygonWkt } from '../engine/investigation';
import type { User } from 'firebase/auth';
import {
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
    const raw = window.sessionStorage.getItem(geometryDraftKey(uid));
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


function loadStoredRun(uid: string): StoredRun | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = sessionStorage.getItem(storageKey(uid));
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

function resultLabel(run: StoredRun): string {
  if (run.status !== 'completed') return run.status === 'dispatching' ? 'Starting' : 'Running';
  if (run.conclusion === 'success') return 'Workflow completed';
  if (run.conclusion === 'cancelled') return 'Cancelled';
  return 'Workflow failed';
}

export function KnownPlaceAnalysisPanel({ user, aoiWkt, startDate, endDate, onBack }: Props) {
  const [hazardMode, setHazardMode] = useState<KnownPlaceHazardMode>('mixed');
  const [analysisMode, setAnalysisMode] = useState<KnownPlaceAnalysisMode>('exploratory');
  const [polarization, setPolarization] = useState<'HH' | 'HV' | 'VV' | 'VH'>('HH');
  const [track, setTrack] = useState('ANY');
  const [direction, setDirection] = useState<'ANY' | 'A' | 'D'>('ANY');
  const [coherenceNeighbours, setCoherenceNeighbours] = useState<'1' | '5' | '10' | '15' | '20' | '25'>('1');
  const [allowedReleaseIds, setAllowedReleaseIds] = useState('');
  const [candidateTransfer] = useState<CandidateTransfer | null>(() => consumeCandidateTransfer());
  const [geometryDraft] = useState<GeometryDraft>(() => loadGeometryDraft(user.uid));
  const [measurementWkt, setMeasurementWkt] = useState(() => candidateTransfer?.measurementWkt || geometryDraft.measurementWkt || '');
  const [referenceWkt, setReferenceWkt] = useState(() => geometryDraft.referenceWkt);
  const [polygonValidation, setPolygonValidation] = useState({ valid: false, message: 'Draw and close the Measurement and Reference Polygons. The Reference may enclose the Measurement; partial overlap is invalid.' });
  const [geometryHeight, setGeometryHeight] = useState('');
  const [confirmRawDownloads, setConfirmRawDownloads] = useState(false);
  const [pendingAction, setPendingAction] = useState<'dry-run' | 'analysis' | null>(null);
  const [run, setRun] = useState<StoredRun | null>(() => loadStoredRun(user.uid));
  const [catalogReleaseIds, setCatalogReleaseIds] = useState<string[]>([]);
  const [catalogReleaseError, setCatalogReleaseError] = useState('');
  const [error, setError] = useState('');
  const [pollError, setPollError] = useState('');
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
    confirm_raw_downloads: executeDownloads && confirmRawDownloads,
  });
  const currentRequestFingerprint = knownPlaceRequestFingerprint(createAnalysisInput(false));
  const catalogPreflightReady = hasMatchingKnownPlaceCatalogPreflight(run, currentRequestFingerprint);
  const handleMeasurementChange = useCallback((wkt: string) => setMeasurementWkt(wkt), []);
  const handleReferenceChange = useCallback((wkt: string) => setReferenceWkt(wkt), []);
  const handlePolygonValidation = useCallback((result: { valid: boolean; message: string }) => setPolygonValidation(result), []);
  const canSubmitGeometry = Boolean(aoiWkt && measurementWkt && referenceWkt && polygonValidation.valid);

  useEffect(() => {
    try {
      if (!measurementWkt && !referenceWkt) {
        sessionStorage.removeItem(geometryDraftKey(user.uid));
      } else {
        sessionStorage.setItem(geometryDraftKey(user.uid), JSON.stringify({ measurementWkt, referenceWkt }));
      }
    } catch { /* session storage is optional; current component state remains authoritative */ }
  }, [measurementWkt, referenceWkt, user.uid]);

  useEffect(() => {
    if (!run) {
      try { sessionStorage.removeItem(storageKey(user.uid)); } catch { /* session storage is optional */ }
      return;
    }
    try { sessionStorage.setItem(storageKey(user.uid), JSON.stringify(run)); } catch { /* session storage is optional */ }
  }, [run, user.uid]);

  const runRequestId = run?.request_id ?? null;
  const runStatus = run?.status ?? null;

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
    if (!run || run.status !== 'completed' || run.conclusion !== 'success' || run.execute_downloads !== false) {
      setCatalogReleaseIds([]);
      setCatalogReleaseError('');
      return undefined;
    }
    let active = true;
    setCatalogReleaseIds([]);
    setCatalogReleaseError('');
    void getKnownPlaceAnalysisResults(run.request_id, user)
      .then((payload) => {
        if (!active) return;
        const ids = Array.from(new Set(
          payload.result.pairwise_series_plan.chains
            .map((chain) => chain.release_id)
            .filter((releaseId): releaseId is string => Boolean(releaseId)),
        ));
        setCatalogReleaseIds(ids);
      })
      .catch((reason: unknown) => {
        if (active) setCatalogReleaseError(reason instanceof Error ? reason.message : 'Release IDs are available in the result bundle.');
      });
    return () => { active = false; };
  }, [run, user]);

  const submit = async (executeDownloads: boolean) => {
    if (!aoiWkt || !startDate || !endDate) {
      setError('Return to the AOI map and create a valid outer AOI and date window first.');
      return;
    }
    if (!measurementWkt || !referenceWkt || !polygonValidation.valid) {
      setError(polygonValidation.message || 'Draw and validate the Measurement and Reference polygons before submitting. The Reference may be a larger enclosing region; partial overlap is invalid.');
      return;
    }
    if (executeDownloads && !catalogPreflightReady) {
      setError('Run a successful catalog-only dry run for these exact settings first. If it reports duplicate release variants, select the intended release ID and rerun the dry run before authorizing raw downloads.');
      return;
    }
    if (executeDownloads && !confirmRawDownloads) {
      setError('Confirm raw-data download permission before starting the GOFF measurement run.');
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
    setError('');
    setPollError('');
    try {
      const analysisInput = {
        ...createAnalysisInput(executeDownloads),
        geometry_height_m: height,
      };
      const requestFingerprint = knownPlaceRequestFingerprint(analysisInput);
      const submitted = await startKnownPlaceAnalysis(analysisInput, user);
      setRun({
        ...submitted,
        execute_downloads: executeDownloads,
        request_fingerprint: requestFingerprint,
      });
      if (executeDownloads) {
        try {
          sessionStorage.removeItem('sarguardian.knownPlaceCandidate.v1');
          sessionStorage.removeItem(geometryDraftKey(user.uid));
        } catch { /* accepted raw workflow request remains authoritative */ }
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit Known Place Analysis.');
    } finally {
      setPendingAction(null);
    }
  };

  const runTerminal = run?.status === 'completed';
  const runSucceeded = runTerminal && run?.conclusion === 'success';
  const runFailed = runTerminal && !runSucceeded;

  return (
    <main className="nisar-results-main displacement-preparation known-place-analysis">
        <section className="known-place-custom-measurement" aria-label="Known Place custom measurement">
        {!aoiWkt && <p className="catalog-error" role="alert">A valid outer AOI is required for custom measurement. Go back to the map and draw your polygon.</p>}
        {candidateTransfer && <div className="catalog-notice known-place-candidate-handoff" role="status">
          <strong>Suggested Measurement Polygon imported from Find Displacements</strong>
          <span>{candidateTransfer.candidate.candidateId} · GOFF offset-anomaly candidate · {candidateTransfer.candidate.supportPairs} supporting pair(s) · {candidateTransfer.candidate.pixelCount} pixels</span>
          <span>{candidateTransfer.candidate.geometrySimplified ? `Boundary simplified from ${candidateTransfer.candidate.geometryOriginalVertices} to ${candidateTransfer.candidate.geometrySuggestedVertices} vertices; inspect and edit it before measurement.` : `${candidateTransfer.candidate.geometrySuggestedVertices} boundary vertices transferred; inspect and edit before measurement.`}</span>
          <span>Candidate evidence is not measured ground motion or a confirmed landslide. Draw a background polygon that is either disjoint from or fully encloses the proposed measurement area; partial overlap and boundary-touch are rejected.</span>
        </div>}
        <KnownPlacePolygonEditor
          outerAoiWkt={aoiWkt}
          initialMeasurementWkt={measurementWkt || null}
          initialReferenceWkt={referenceWkt || null}
          onMeasurementChange={handleMeasurementChange}
          onReferenceChange={handleReferenceChange}
          onValidationChange={handlePolygonValidation}
        />
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
          <label className="aoi-job-label known-place-wide">
            <span>Allowed release IDs (comma-separated)</span>
            <input value={allowedReleaseIds} onChange={(event) => setAllowedReleaseIds(event.target.value)} placeholder="Leave blank only when catalog pairs are unambiguous" autoComplete="off" />
            <span className="catalog-field-hint">Run the catalog-only dry run first. When it reports duplicate variants, enter only the intended release ID (for example, P05023) and rerun the dry run. SARGuardian never auto-selects a release.</span>
          </label>
          <label className="aoi-job-label">
            <span>Constant ellipsoidal height in metres (optional sensitivity only)</span>
            <input type="number" value={geometryHeight} onChange={(event) => setGeometryHeight(event.target.value)} min={-500} max={100000} step="any" placeholder="Blank = documented approximation" />
          </label>
        </div>

        <section className="known-place-run-options" aria-label="Known Place run options">
          <h2>Choose how to run</h2>
          <p className="catalog-notice"><b>Required preflight:</b> run the catalog-only dry run first. It verifies product availability and release-consistent series planning without downloading raw NISAR products.</p>
          <button type="button" className="demo-button" disabled={!canSubmitGeometry || pendingAction !== null} onClick={() => void submit(false)}>
            {pendingAction === 'dry-run' ? 'Submitting dry run…' : 'Run catalog-only dry run'}
          </button>
          <p className="catalog-notice" role="status">
            {catalogPreflightReady
              ? 'Catalog preflight passed for the exact current polygons, dates and processing settings. Raw download still requires the separate consent checkbox.'
              : 'Raw GOFF downloads remain locked until a successful catalog-only dry run for the exact current settings, completed within the last 15 minutes. Older or timestamp-missing preflight evidence expires; changing a polygon, date, track, direction, polarization or release filter also requires a new dry run.'}
          </p>
          <div className="known-place-consent">
            <label>
              <input type="checkbox" checked={confirmRawDownloads} onChange={(event) => setConfirmRawDownloads(event.target.checked)} />
              <span><b>I explicitly authorize raw NISAR GOFF downloads for this request.</b> The workflow checks Earthdata/Drive credentials before downloading, processes selected products one at a time, and retains derived results and receipts.</span>
            </label>
            <button type="button" className="investigate-button" disabled={!canSubmitGeometry || !confirmRawDownloads || !catalogPreflightReady || pendingAction !== null} onClick={() => void submit(true)}>
              {pendingAction === 'analysis' ? 'Starting GOFF analysis…' : 'Run Known Place Analysis'}
            </button>
          </div>
          {error && <p className="catalog-error" role="alert">{error}</p>}
        </section>

        {run && (
          <section className="known-place-run-status" aria-live="polite">
            <div className="known-place-run-heading">
              <span className="result-kicker">RUN STATUS</span>
              <strong>{resultLabel(run)}</strong>
            </div>
            <p><b>Request ID:</b> <code>{run.request_id}</code></p>
            {run.github_run_id && <p><b>GitHub Actions run:</b> <code>{run.github_run_id}</code></p>}
            <p><b>Mode:</b> {run.execute_downloads ? 'GOFF measurement with raw-data download opt-in' : 'Catalog-only dry run — no raw download'}</p>
            {run.conclusion && <p><b>Conclusion:</b> {run.conclusion}</p>}
            {run.notice && <p className="catalog-notice">{run.notice}</p>}
            {pollError && !runTerminal && <p className="action-hint" role="status">{pollError} Automatic status checks will retry.</p>}
            {run.github_run_url && <a className="known-place-run-link" href={run.github_run_url} target="_blank" rel="noreferrer">Open GitHub run and view the result bundle</a>}
            {runSucceeded && (run.execute_downloads
              ? <p className="catalog-notice">Workflow succeeded. Inspect the measurement, uncertainty and reference-method reports in the run artifact; a completed run is not independent hazard-detection validation.</p>
              : <p className="catalog-notice">Catalog-only preflight passed. No raw NISAR products were downloaded. You may now separately authorize a raw GOFF run for these unchanged settings.</p>)}
            {runSucceeded && !run.execute_downloads && (
              <p className="catalog-notice" role="status">
                <b>Selected release ID{catalogReleaseIds.length === 1 ? '' : 's'}:</b>{' '}
                {catalogReleaseIds.length ? catalogReleaseIds.join(', ') : (catalogReleaseError || 'Loading from the verified dry-run result…')}
                {' '}Leave the release filter blank for this successful, unambiguous preflight unless you want to pin a specific revision.
              </p>
            )}
            {runFailed && (run.execute_downloads
              ? <p className="catalog-error">Raw GOFF workflow ended with {run.conclusion || 'an error'}. Open the run link above to inspect the failing stage.</p>
              : <p className="catalog-error">Catalog-only preflight failed; no raw download was requested. Open the run summary and artifact for the exact failing pair and candidate release IDs. Enter the intended release filter, then rerun the catalog-only preflight before authorizing downloads.</p>)}
          </section>
        )}
        {runSucceeded && run.execute_downloads && (
          <KnownPlaceResultsDashboard requestId={run.request_id} user={user} />
        )}
        </section>
        <button type="button" className="workspace-nav-link known-place-back" onClick={onBack}>← Back to AOI map</button>
    </main>
  );
}
