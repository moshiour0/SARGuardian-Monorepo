import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { createRiverShiftJob, getRiverShiftJob, listRiverShiftJobs, type RiverShiftJob } from '../api/catalog';
import { Header } from '../components/Header';
import { RIVER_SHIFT_SETUP_STORAGE_KEY, type RiverShiftSetup } from './RiverShiftPage';
import './river-shift.css';
import '../../landslide/ui/displacementPreparation.css';
import { ELAPSED_TICK_MS, formatElapsed } from '../../landslide/ui/processingStatus';

type Props = {
  user: User | null;
  authState: 'idle' | 'loading' | 'ready' | 'error';
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onViewResults?: () => void;
};

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

const activeRiverShiftStates = new Set(['queued', 'dispatching', 'running']);

function riverShiftStageName(stage: string, state: RiverShiftJob['state']): string {
  const normalized = stage.trim().toLowerCase();
  if (state === 'succeeded' || normalized.includes('complete')) return 'Complete';
  if (state === 'failed' || state === 'cancelled') return 'Needs attention';
  if (normalized.includes('screen') || normalized.includes('result') || normalized.includes('assemble')) return 'Screening';
  if (normalized.includes('product') || normalized.includes('process') || normalized.includes('download')) return 'Processing';
  return state === 'queued' || state === 'dispatching' ? 'Preparing task' : 'Initializing';
}

function riverShiftStageIndex(job: RiverShiftJob): number {
  const stage = job.stage.trim().toLowerCase();
  if (job.state === 'succeeded' || stage.includes('complete')) return 3;
  if (stage.includes('screen') || stage.includes('result') || stage.includes('assemble')) return 2;
  if (stage.includes('product') || stage.includes('process') || stage.includes('download')) return 1;
  return 0;
}

function RiverShiftJobStatus({ job, clock, onViewResults }: {
  job: RiverShiftJob;
  clock: number;
  onViewResults: () => void;
}) {
  const active = activeRiverShiftStates.has(job.state);
  const stageIndex = riverShiftStageIndex(job);
  const stageName = riverShiftStageName(job.stage, job.state);
  const elapsed = formatElapsed(job.created_at, job.updated_at, job.state, clock);
  const summary = job.result_summary && typeof job.result_summary === 'object' ? job.result_summary : {};
  const expectedProducts = typeof summary.expected_product_count === 'number' ? summary.expected_product_count : null;
  const verifiedProducts = typeof summary.verified_product_count === 'number' ? summary.verified_product_count : null;
  const observations = typeof summary.observation_count === 'number' ? summary.observation_count : null;
  const shortJobId = job.id.length > 15 ? `${job.id.slice(0, 8)}…${job.id.slice(-4)}` : job.id;
  const dateWindow = `${new Date(`${job.start_date}T00:00:00`).toLocaleDateString()} – ${new Date(`${job.end_date}T00:00:00`).toLocaleDateString()}`;

  return (
    <main className="displacement-preparation processing-page" aria-live="polite">
      <section className={`processing-card processing-hero processing-page--${job.state}`}>
        <span className={`processing-status-chip ${active ? 'is-running' : ''}`}>
          <i aria-hidden="true" />
          {job.state === 'succeeded' ? 'Complete' : job.state === 'failed' ? 'Needs attention' : job.state === 'cancelled' ? 'Cancelled' : 'Running'}
        </span>
        <div className={`processing-orbit ${active ? 'is-active' : ''}`} aria-label={`${stageName}, elapsed ${elapsed}`}>
          <div className="processing-orbit-inner">
            {job.state === 'succeeded' ? <span className="processing-orbit-symbol processing-orbit-label" aria-hidden="true">Success</span> : job.state === 'failed' ? <span className="processing-orbit-symbol processing-orbit-label" aria-hidden="true">Failed</span> : job.state === 'cancelled' ? <span className="processing-orbit-symbol" aria-hidden="true">!</span> : <><strong>{stageName}</strong><time>{elapsed}</time></>}
          </div>
        </div>
        <ol className="processing-stepper" aria-label="Processing stages">
          {['Initializing', 'Processing', 'Screening', 'Complete'].map((step, index) => <li key={step} className={index < stageIndex ? 'is-complete' : index === stageIndex ? 'is-current' : ''}><i aria-hidden="true" /><span>{step}</span></li>)}
        </ol>
        <p className="processing-safe-note">{active ? 'Safe to close this page. Your task keeps running.' : job.state === 'succeeded' ? 'The processing job has ended. Review the River Shift outputs.' : 'The processing workflow stopped before successful completion.'}</p>
        <p className="processing-duration-note">It may take up to 5 to 20 minutes depending on AOI and time window.</p>
      </section>

      <section className="processing-card processing-products-card" aria-label="River Shift processing counters">
        <div><span>GCOV</span><strong className={expectedProducts === null ? 'processing-count-pending' : ''}>{expectedProducts ?? (active ? 'Searching…' : '—')}</strong></div>
        <div><span>Verified</span><strong className={verifiedProducts === null ? 'processing-count-pending' : ''}>{verifiedProducts ?? (active ? 'Searching…' : '—')}</strong></div>
        <div><span>Dates</span><strong className={observations === null ? 'processing-count-pending' : ''}>{observations ?? (active ? 'Searching…' : '—')}</strong></div>
      </section>

      <section className="processing-card processing-details-card" aria-label="River Shift task details">
        <dl>
          <div><dt>Area</dt><dd>Submitted AOI</dd></div>
          <div><dt>Dates</dt><dd>{dateWindow}</dd></div>
          <div><dt>Scope</dt><dd>River-wide GCOV screening</dd></div>
          <div><dt>Job</dt><dd><code title={job.id}>{shortJobId}</code><button type="button" className="processing-copy-button" onClick={() => void navigator.clipboard?.writeText(job.id)}>Copy</button></dd></div>
        </dl>
      </section>

      {job.state === 'succeeded' && <div className="processing-page-actions"><button type="button" className="processing-primary-button" onClick={onViewResults}>Show result</button></div>}
      {job.state === 'failed' && <p className="processing-error" role="alert">{job.error_message || 'River Shift processing failed. Try the run again from the setup page.'}</p>}
    </main>
  );
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
  const [clock, setClock] = useState(() => Date.now());

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

  useEffect(() => {
    if (!riverJob || !activeRiverShiftStates.has(riverJob.state)) return undefined;
    setClock(Date.now());
    const timer = window.setInterval(() => setClock(Date.now()), ELAPSED_TICK_MS);
    return () => window.clearInterval(timer);
  }, [riverJob]);

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

      {!riverJob && <section className="rs-workspace-grid">
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
      </section>}

      {riverJob && <RiverShiftJobStatus job={riverJob} clock={clock} onViewResults={() => { window.sessionStorage.setItem('sarguardian.riverShiftActiveJobId', riverJob.id); onViewResults?.(); }} />}

      {!riverJob && riverJobBusy && (
        <section className="rs-panel rs-job-feedback" role="status" aria-live="polite">
          <div className="rs-info-banner">
            <strong>Submitting RiverShift job…</strong>{' '}
            The API is validating the AOI and confirming the NASA CMR acquisition manifest before dispatch.
            No NISAR product download starts until this step succeeds.
          </div>
        </section>
      )}

      {riverJobError && (
        <section className="rs-panel rs-job-feedback" aria-live="assertive">
          <p className="rs-error" role="alert">{riverJobError}</p>
        </section>
      )}

      <footer className="rs-footer">
        <span>SARGuardian · RiverShift</span><span>Open science · Reproducible processing · Evidence before claims</span>
      </footer>
    </div>
  );
}
