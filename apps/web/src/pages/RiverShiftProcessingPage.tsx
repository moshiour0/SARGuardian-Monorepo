import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { createRiverShiftJob, getRiverShiftJob, listRiverShiftJobs, type RiverShiftJob } from '../api/catalog';
import { resolveApiBaseUrl } from '../api/apiOrigin';
import { Header } from '../components/Header';
import { RIVER_SHIFT_SETUP_STORAGE_KEY, type RiverShiftSetup } from './RiverShiftPage';
import './river-shift.css';

type Props = {
  user: User | null;
  authState: 'idle' | 'loading' | 'ready' | 'error';
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onViewResults?: () => void;
};

const API_BASE = resolveApiBaseUrl(
  import.meta.env.VITE_SARGUARDIAN_API_URL as string | undefined,
  import.meta.env.DEV,
);

function loadRiverShiftSetup(): RiverShiftSetup | null {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(RIVER_SHIFT_SETUP_STORAGE_KEY) || 'null') as Partial<RiverShiftSetup> | null;
    return parsed && typeof parsed.aoiWkt === 'string' && typeof parsed.startDate === 'string' && typeof parsed.endDate === 'string'
      ? parsed as RiverShiftSetup
      : null;
  } catch {
    return null;
  }
}

export function RiverShiftProcessingPage({ user, authState, onSignIn, onSignOut, onViewResults }: Props) {
  const [aoiWkt] = useState(() => loadRiverShiftSetup()?.aoiWkt || '');
  const [startDate] = useState(() => loadRiverShiftSetup()?.startDate || '');
  const [endDate] = useState(() => loadRiverShiftSetup()?.endDate || '');
  const [maturity, setMaturity] = useState<'BETA' | 'PROVISIONAL' | 'ALL'>('PROVISIONAL');
  const [polarization, setPolarization] = useState<'' | 'HH' | 'HH+HV' | 'HH+HV+VH+VV' | 'VV' | 'VV+VH' | 'LH+LV' | 'RH+RV'>('');
  const [direction, setDirection] = useState<'' | 'ASCENDING' | 'DESCENDING'>('');
  const [frameCoverage, setFrameCoverage] = useState<'ALL' | 'FULL' | 'PARTIAL'>('ALL');

  const [analysisMode, setAnalysisMode] = useState<'general_scan' | 'event_based'>('general_scan');
  const [eventDate, setEventDate] = useState('');
  const [scienceFrequency, setScienceFrequency] = useState<'frequencyA' | 'frequencyB'>('frequencyA');
  const [covarianceTerm, setCovarianceTerm] = useState('HHHH');
  const [thresholdMethod, setThresholdMethod] = useState<'otsu' | 'manual'>('otsu');
  const [thresholdDb, setThresholdDb] = useState('');
  const [riverJob, setRiverJob] = useState<RiverShiftJob | null>(null);
  const [riverJobBusy, setRiverJobBusy] = useState(false);
  const [riverJobError, setRiverJobError] = useState('');

  useEffect(() => {
    if (!user) {
      setRiverJob(null);
      return undefined;
    }
    let cancelled = false;
    void listRiverShiftJobs(user, 10).then((jobs) => {
      if (!cancelled && jobs.length) {
        setRiverJob((current) => current ?? jobs[0]);
      }
    }).catch((error: unknown) => {
      if (!cancelled) {
        setRiverJobError(error instanceof Error ? error.message : 'Could not restore the last River Shift job.');
      }
    });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user || !riverJob || !['queued', 'dispatching', 'running'].includes(riverJob.state)) return undefined;
    const timer = window.setInterval(() => {
      void getRiverShiftJob(riverJob.id, user).then(setRiverJob).catch((error: unknown) => {
        setRiverJobError(error instanceof Error ? error.message : 'Could not refresh processing status.');
      });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [riverJob, user]);

  const startLiveProcessing = async () => {
    setRiverJobError('');
    if (!user) {
      setRiverJobError('Sign in with Google before starting live processing.');
      return;
    }
    if (!aoiWkt.trim() || !startDate || !endDate || endDate < startDate) {
      setRiverJobError('Draw or paste one valid AOI and choose a valid start/end date window.');
      return;
    }
    if ((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000 > 366) {
      setRiverJobError('The NISAR observation window cannot exceed 366 days.');
      return;
    }
    if (analysisMode === 'event_based' && (!eventDate || eventDate < startDate || eventDate > endDate)) {
      setRiverJobError('Event-Based Analysis needs an independently sourced event date inside the selected observation window.');
      return;
    }
    if (analysisMode === 'general_scan' && eventDate) {
      setRiverJobError('General River Change Scan does not accept an event date. Clear it or switch to Event-Based Analysis.');
      return;
    }
    if (maturity === 'ALL') {
      setRiverJobError('Choose one maturity. BETA and PROVISIONAL products cannot be mixed in a scientific time series.');
      return;
    }
    if (thresholdMethod === 'manual') {
      const manualThreshold = Number(thresholdDb);
      if (!thresholdDb.trim() || !Number.isFinite(manualThreshold) || manualThreshold < -60 || manualThreshold > 0) {
        setRiverJobError('Enter one manual threshold between -60 and 0 dB, or choose Otsu.');
        return;
      }
    }
    setRiverJobBusy(true);

    try {
      const job = await createRiverShiftJob({
        aoiWkt,
        startDate,
        endDate,
        analysisMode,
        eventDate: analysisMode === 'event_based' ? eventDate : null,
        maturity,
        mainBandPolarization: polarization || null,
        flightDirection: direction || null,
        frameCoverage,
        frequency: scienceFrequency,
        covarianceTerm,
        thresholdMethod,
        ...(thresholdMethod === 'manual' ? { thresholdDb: Number(thresholdDb) } : {}),
        idempotencyKey: crypto.randomUUID().replace(/-/g, ''),
      }, user);
      setRiverJob(job);
      window.sessionStorage.setItem('sarguardian.riverShiftActiveJobId', job.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not start live RiverShift processing.';
      setRiverJobError(/fewer than four acquisition dates|at least four comparable.*acquisition dates|needs at least four observations/i.test(message)
        ? 'The catalogue did not provide four distinct, comparable NISAR acquisition dates for this AOI and window. Widen the date range or adjust the study area, then retry. Four catalogue dates are only the first gate; the worker also checks one compatible orbit/frame group and valid raster coverage.'
        : message);
    } finally {
      setRiverJobBusy(false);
    }
  };

  return (
    <div className="home-page claude-home river-shift-page">
      <div className="claude-background" aria-hidden="true"><i /><i /><i /></div>
      <Header
        user={user}
        authState={authState}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        isArchivePage
        hideProfile
        showPageTitle
        pageTitle="River Shift"
      />

      <section className="rs-workspace-grid">
        <div className="rs-panel">
          <form onSubmit={(event) => { event.preventDefault(); void startLiveProcessing(); }} className="rs-form">
            <details className="rs-advanced-settings">
              <summary>Advanced settings</summary>
              <div className="rs-fields-two">
                <label className="rs-field rs-field-full"><span>Analysis mode</span>
                  <select value={analysisMode} onChange={(event) => { setAnalysisMode(event.target.value as typeof analysisMode); if (event.target.value === 'general_scan') setEventDate(''); }}>
                    <option value="general_scan">General River Change Scan</option>
                    <option value="event_based">Event-Based Analysis</option>
                  </select>
                  {analysisMode === 'event_based' && <small>Supply an event date from an independent record. RiverShift never estimates or infers this date.</small>}
                </label>
                {analysisMode === 'event_based' && <label className="rs-field rs-field-full"><span>Event date · independent record required</span><input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} min={startDate} max={endDate} required />
                  <small>Event comparison needs at least one compatible acquisition strictly before this date and three strictly after it. A same-calendar-day acquisition is not assumed to be post-event.</small>
                </label>}
                <label className="rs-field"><span>Processing maturity</span>
                  <select value={maturity} onChange={(event) => setMaturity(event.target.value as typeof maturity)}>
                    <option value="PROVISIONAL">PROVISIONAL</option><option value="BETA">BETA</option><option value="ALL">ALL (audit only)</option>
                  </select>
                </label>
                <label className="rs-field"><span>Main-band polarization</span>
                  <select value={polarization} onChange={(event) => setPolarization(event.target.value as typeof polarization)}>
                    <option value="">Any</option><option value="VV">VV</option><option value="VV+VH">VV + VH</option>
                    <option value="HH">HH</option><option value="HH+HV">HH + HV</option>
                    <option value="HH+HV+VH+VV">Full quad-pol</option><option value="LH+LV">LH + LV</option><option value="RH+RV">RH + RV</option>
                  </select>
                </label>
                <label className="rs-field rs-field-full"><span>Orbit direction</span>
                  <select value={direction} onChange={(event) => setDirection(event.target.value as typeof direction)}>
                    <option value="">Any direction</option><option value="ASCENDING">Ascending</option><option value="DESCENDING">Descending</option>
                  </select>
                </label>
                <label className="rs-field rs-field-full"><span>NISAR frame coverage</span>
                  <select value={frameCoverage} onChange={(event) => setFrameCoverage(event.target.value as typeof frameCoverage)}>
                    <option value="ALL">All footprints (recommended for discovery)</option>
                    <option value="FULL">Full frames only</option>
                    <option value="PARTIAL">Partial frames only</option>
                  </select>
                  <small>FULL/PARTIAL refers to NISAR frame coverage, not the percentage of your AOI covered. That must be checked separately.</small>
                </label>
                <label className="rs-field"><span>Science frequency</span>
                  <select value={scienceFrequency} onChange={(event) => setScienceFrequency(event.target.value as typeof scienceFrequency)}>
                    <option value="frequencyA">Frequency A</option><option value="frequencyB">Frequency B</option>
                  </select>
                </label>
                <label className="rs-field"><span>Diagonal covariance term</span>
                  <select value={covarianceTerm} onChange={(event) => setCovarianceTerm(event.target.value)}>
                    <option>HHHH</option><option>HVHV</option><option>VVVV</option><option>VHVH</option><option>RHRH</option><option>RVRV</option>
                  </select>
                </label>
                <label className="rs-field"><span>Common water threshold method</span>
                  <select value={thresholdMethod} onChange={(event) => setThresholdMethod(event.target.value as typeof thresholdMethod)}>
                    <option value="otsu">Common Otsu · exploratory</option><option value="manual">Manual dB threshold</option>
                  </select>
                </label>
                {thresholdMethod === 'manual' && <label className="rs-field"><span>Common threshold (dB)</span><input type="number" min="-60" max="0" step="0.1" required value={thresholdDb} onChange={(event) => setThresholdDb(event.target.value)} /></label>}
              </div>
            </details>
            <button className="rs-primary-button" type="submit" disabled={riverJobBusy || !user || !aoiWkt.trim() || !startDate || !endDate || maturity === 'ALL' || (analysisMode === 'event_based' && !eventDate)}>
              {riverJobBusy ? 'Discovering, selecting and processing…' : 'Run RiverShift'}
            </button>
            {!user && <p className="rs-muted">Sign in before running. Job status and private results remain owner-protected.</p>}
            {analysisMode === 'event_based' && eventDate && <p className="rs-warning-inline">Event date supplied by the user; it is not independently confirmed. Results remain provisional.</p>}
          </form>
        </div>
      </section>

      {riverJobBusy && (
        <section className="rs-panel rs-job-feedback" role="status" aria-live="polite">
          <div className="rs-info-banner">
            <strong>Submitting RiverShift job…</strong>{' '}
            The API is validating the AOI and confirming the NASA CMR acquisition manifest before dispatch.
            No NISAR product download starts until this step succeeds.
          </div>
        </section>
      )}

      {riverJob && ['queued', 'dispatching', 'running'].includes(riverJob.state) && (
        <section className="rs-panel rs-job-feedback" role="status" aria-live="polite">
          <div className="rs-info-banner">
            <strong>Processing job {riverJob.id.slice(0, 8)}… ({riverJob.state})</strong>{' '}
            The scientific processing engine is actively running on the compute worker. Status refreshes automatically.
          </div>
        </section>
      )}

      {riverJobError && (
        <section className="rs-panel rs-job-feedback" aria-live="assertive">
          <p className="rs-error" role="alert">{riverJobError}</p>
        </section>
      )}

      {riverJob?.state === 'succeeded' && (
        <section className="rs-panel rs-job-panel" aria-live="polite">
          <div className="rs-info-banner">
            <strong>Processing complete · PROVISIONAL.</strong>{' '}
            Your River Shift analysis run has finished successfully.
          </div>
          <div style={{ marginTop: '18px', textAlign: 'center' }}>
            <button
              type="button"
              className="rs-primary-button rs-show-result-button"
              style={{ fontSize: '15px', padding: '12px 32px', cursor: 'pointer' }}
              onClick={() => {
                window.sessionStorage.setItem('sarguardian.riverShiftActiveJobId', riverJob.id);
                onViewResults?.();
              }}
            >
              Show result
            </button>
          </div>
        </section>
      )}

      <footer className="rs-footer">
        <span>SARGuardian · RiverShift</span><span>Open science · Reproducible processing · Evidence before claims</span>
      </footer>
    </div>
  );
}
