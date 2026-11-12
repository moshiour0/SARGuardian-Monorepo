import { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { createRiverShiftJob, getRiverShiftJob, listRiverShiftJobs, retryRiverShiftJob, type RiverShiftJob } from '../api/catalog';
import { Header } from '../components/Header';
import { RIVER_SHIFT_SETUP_STORAGE_KEY, type RiverShiftSetup } from './RiverShiftPage';
import './river-shift.css';
import '../../landslide/ui/displacementPreparation.css';
import { ELAPSED_TICK_MS, formatElapsed } from '../../landslide/ui/processingStatus';
import { ProcessingPageSkeleton } from '../../landslide/ui/DisplacementPreparation';

type Props = {
  user: User | null;
  authState: 'idle' | 'loading' | 'ready' | 'error';
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onBack?: () => void;
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

export function RiverShiftJobStatus({ job, clock, onViewResults, onRetry, retrying }: {
  job: RiverShiftJob;
  clock: number;
  onViewResults: () => void;
  onRetry: () => void;
  retrying: boolean;
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
      {job.state === 'failed' && <div className="processing-page-actions">
        <button type="button" className="processing-primary-button" disabled={retrying} onClick={onRetry}>{retrying ? 'Retrying…' : 'Retry'}</button>
      </div>}
      {job.state === 'failed' && <p className="processing-safe-note">Retry starts a new attempt with this job’s saved settings.</p>}
      {job.state === 'failed' && <p className="processing-error" role="alert">{job.error_message || 'River Shift processing failed.'}</p>}
    </main>
  );
}

export function RiverShiftProcessingPage({ user, authState, onSignIn, onSignOut, onBack, onViewResults }: Props) {
  const [riverJob, setRiverJob] = useState<RiverShiftJob | null>(null);
  const [riverJobLoading, setRiverJobLoading] = useState(true);
  const [riverJobBusy, setRiverJobBusy] = useState(false);
  const [riverJobError, setRiverJobError] = useState('');
  const retryPending = useRef(false);
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    if (!user) {
      setRiverJob(null);
      setRiverJobLoading(false);
      return undefined;
    }
    let cancelled = false;
    setRiverJobLoading(true);
    setRiverJobError('');

    async function initialize() {
      const pendingDispatch = window.sessionStorage.getItem('sarguardian.riverShiftPendingDispatch') === 'true';
      const setup = loadRiverShiftSetup();

      if (pendingDispatch && setup?.aoiWkt && setup?.startDate && setup?.endDate) {
        window.sessionStorage.removeItem('sarguardian.riverShiftPendingDispatch');
        try {
          const job = await createRiverShiftJob({
            aoiWkt: setup.aoiWkt,
            startDate: setup.startDate,
            endDate: setup.endDate,
            analysisMode: 'general_scan',
            eventDate: null,
            maturity: 'PROVISIONAL',
            mainBandPolarization: null,
            flightDirection: null,
            frameCoverage: 'ALL',
            frequency: 'frequencyA',
            covarianceTerm: 'HHHH',
            thresholdMethod: 'otsu',
            idempotencyKey: crypto.randomUUID().replace(/-/g, ''),
          }, user);
          if (!cancelled) {
            setRiverJob(job);
            window.sessionStorage.setItem('sarguardian.riverShiftActiveJobId', job.id);
            setRiverJobLoading(false);
          }
          return;
        } catch (error) {
          if (!cancelled) {
            const message = error instanceof Error ? error.message : 'Could not start live RiverShift processing.';
            setRiverJobError(/fewer than four acquisition dates|at least four comparable.*acquisition dates|needs at least four observations/i.test(message)
              ? 'The catalogue did not provide four distinct, comparable NISAR acquisition dates for this AOI and window. Widen the date range or adjust the study area, then retry. Four catalogue dates are only the first gate; the worker also checks one compatible orbit/frame group and valid raster coverage.'
              : message);
            setRiverJobLoading(false);
          }
          return;
        }
      }

      try {
        const storedActiveId = window.sessionStorage.getItem('sarguardian.riverShiftActiveJobId');
        if (storedActiveId) {
          try {
            const existing = await getRiverShiftJob(storedActiveId, user);
            if (!cancelled && existing) {
              setRiverJob(existing);
              setRiverJobLoading(false);
              return;
            }
          } catch {
            // fallback to list
          }
        }
        const jobs = await listRiverShiftJobs(user, 10);
        if (!cancelled) {
          if (jobs.length) {
            setRiverJob(jobs[0]);
            window.sessionStorage.setItem('sarguardian.riverShiftActiveJobId', jobs[0].id);
          }
          setRiverJobLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setRiverJobError(error instanceof Error ? error.message : 'Could not restore the last River Shift job.');
          setRiverJobLoading(false);
        }
      }
    }

    void initialize();
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

  const retryRiverShift = async () => {
    if (!user || !riverJob || riverJob.state !== 'failed' || retryPending.current) return;
    retryPending.current = true;
    setRiverJobBusy(true);
    setRiverJobError('');
    try {
      const job = await retryRiverShiftJob(riverJob.id, user);
      setRiverJob(job);
      window.sessionStorage.setItem('sarguardian.riverShiftActiveJobId', job.id);
    } catch (error) {
      setRiverJobError(error instanceof Error ? error.message : 'Could not retry River Shift processing.');
    } finally {
      retryPending.current = false;
      setRiverJobBusy(false);
    }
  };

  const handleBackToMap = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.assign('/river-shift');
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

      {riverJobLoading ? (
        <ProcessingPageSkeleton />
      ) : riverJob ? (
        <RiverShiftJobStatus
          job={riverJob}
          clock={clock}
          retrying={riverJobBusy}
          onRetry={() => void retryRiverShift()}
          onViewResults={() => {
            window.sessionStorage.setItem('sarguardian.riverShiftActiveJobId', riverJob.id);
            onViewResults?.();
          }}
        />
      ) : (
        <main className="displacement-preparation" style={{ width: 'min(720px, calc(100% - 32px))', margin: '40px auto' }}>
          <section className="processing-card processing-load-error" role="alert">
            <p>{riverJobError || 'No active River Shift job found. Draw a study area on the map to start processing.'}</p>
            <button type="button" className="processing-ghost-button" onClick={handleBackToMap}>
              Back to map
            </button>
          </section>
        </main>
      )}

      {riverJob && riverJobError && (
        <section className="rs-panel rs-job-feedback" aria-live="assertive" style={{ width: 'min(720px, calc(100% - 32px))', margin: '16px auto 0' }}>
          <p className="rs-error" role="alert">{riverJobError}</p>
        </section>
      )}

      <footer className="rs-footer">
        <span>SARGuardian · RiverShift</span><span>Open science · Reproducible processing · Evidence before claims</span>
      </footer>
    </div>
  );
}
