import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { deleteDisplacementJob, listDisplacementJobs, type DisplacementJob } from '../api/catalog';
import { ScientificResults } from '../../landslide/ui/ScientificResults';
import { hasScientificResultOutputs } from '../../landslide/ui/resultAvailability';

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date not available'
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function retentionDate(createdAt: string): string {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 'after 60 days';
  return formatDate(new Date(created.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString());
}

export function ArchiveJobCard({ job, user, onOpenWorkspace, onDeleted }: {
  job: DisplacementJob;
  user: User;
  onOpenWorkspace: () => void;
  onDeleted: (jobId: string) => void;
}) {
  const isActive = ['queued', 'dispatching', 'running'].includes(job.state);
  const hasResults = job.state === 'succeeded' && hasScientificResultOutputs(job);

  return (
    <article className="archive-item">
      <div className="archive-item-main">
        <div className="archive-item-topline">
          <span className={`archive-state archive-state-${job.state}`}>{job.state.replace(/_/g, ' ')}</span>
          <span className="archive-job-id">Job {job.id.slice(0, 8)}</span>
        </div>
        <h3>{job.place_name || 'AOI-wide displacement analysis'}</h3>
        <p>{formatDate(job.start_date)} – {formatDate(job.end_date)}</p>
        <small>Updated {formatDate(job.updated_at)} · {job.stage}</small>
        <small>Archive retention until {retentionDate(job.created_at)}</small>
        {job.state === 'failed' && (
          <small className="archive-failure-message">
            Failed: {job.error_message || job.error_code || 'The analysis did not complete.'}
          </small>
        )}
      </div>
      <div className="archive-item-actions">
        {isActive && (
          <button className="section-action secondary" type="button" onClick={onOpenWorkspace}>Open processing</button>
        )}
        {hasResults && <span className="archive-result-ready">Verified outputs ready</span>}
        {job.state === 'succeeded' && !hasResults && (
          <span className="archive-result-unavailable">No verified result bundle</span>
        )}
        {hasResults && (
          <a
            className="section-action"
            href={`/dashboard?jobId=${encodeURIComponent(job.id)}&view=public`}
          >
            Open interactive dashboard
          </a>
        )}
        {job.state === 'failed' && (
          <button
            className="section-action archive-delete-action"
            type="button"
            onClick={() => {
              if (window.confirm('Delete this failed analysis from your archive?')) {
                void deleteDisplacementJob(job.id, user)
                  .then(() => onDeleted(job.id))
                  .catch((error: unknown) => {
                    window.alert(error instanceof Error ? error.message : 'Could not delete this failed analysis.');
                  });
              }
            }}
          >
            Delete failed job
          </button>
        )}
      </div>
      {hasResults && (
        <details className="archive-item-results">
          <summary className="archive-results-summary">
            <span className="archive-results-summary-copy">
              <strong>Explore saved results</strong>
              <small>Choose a presentation view or download the complete result package.</small>
            </span>
            <span className="archive-results-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="archive-item-results-content">
            <ScientificResults job={job} user={user} />
          </div>
        </details>
      )}
    </article>
  );
}

export function ArchiveSection({ user, onOpenWorkspace }: {
  user: User | null;
  onOpenWorkspace: () => void;
}) {
  const [jobs, setJobs] = useState<DisplacementJob[]>([]);
  const [state, setState] = useState<'signed-out' | 'loading' | 'ready' | 'error'>(
    user ? 'loading' : 'signed-out',
  );
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!user) {
      setJobs([]);
      setState('signed-out');
      setError('');
      return () => { active = false; };
    }

    setState('loading');
    setError('');
    void listDisplacementJobs(user)
      .then((items) => {
        if (!active) return;
        setJobs([...items].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)));
        setState('ready');
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : 'The account archive could not be loaded.');
        setState('error');
      });

    return () => { active = false; };
  }, [user]);

  return (
    <section className="home-section archive-section" aria-label="Saved analysis jobs">

      {state === 'signed-out' && (
        <div className="archive-empty">
          <strong>Sign in to view your analysis history.</strong>
          <p>Only jobs belonging to your account are shown here.</p>
        </div>
      )}
      {state === 'loading' && <p className="section-status" role="status">Loading account analysis history…</p>}
      {state === 'error' && (
        <div className="archive-empty" role="alert">
          <strong>Archive unavailable</strong>
          <p>{error}</p>
        </div>
      )}
      {state === 'ready' && jobs.length === 0 && (
        <div className="archive-empty">
          <strong>No analysis jobs in this account yet.</strong>
          <p>When you submit a processing task, its current status and verified outputs will appear here.</p>
          <button className="section-action" type="button" onClick={onOpenWorkspace}>Start an analysis</button>
        </div>
      )}
      {state === 'ready' && jobs.length > 0 && (
        <div className="archive-list">
          <p className="archive-retention-note">Failed and completed jobs are automatically removed 60 days after creation.</p>
          {jobs.map((job) => (
            <ArchiveJobCard key={job.id} job={job} user={user!} onOpenWorkspace={onOpenWorkspace} onDeleted={(jobId) => {
              setJobs((current) => current.filter((item) => item.id !== jobId));
            }} />
          ))}
        </div>
      )}
    </section>
  );
}
