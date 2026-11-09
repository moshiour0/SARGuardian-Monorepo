import type { User } from 'firebase/auth';
import { Header } from '../../src/components/Header';
import { KnownPlaceResultsDashboard } from './KnownPlaceResultsDashboard';
import { loadKnownPlaceRunRequestId } from './KnownPlaceAnalysisPanel';

type Props = {
  user: User;
  authState: 'idle' | 'loading' | 'ready' | 'error';
  onSignIn: () => void;
  onSignOut: () => void;
  onBack: () => void;
};

export function KnownPlaceResultsPage({ user, authState, onSignIn, onSignOut, onBack }: Props) {
  const requestId = loadKnownPlaceRunRequestId(user.uid);
  return (
    <div className="home-page claude-home claude-how-page known-place-results-shell">
      <div className="claude-background" aria-hidden="true"><i /><i /><i /></div>
      <Header user={user} authState={authState} onSignIn={onSignIn} onSignOut={onSignOut} isArchivePage hideProfile />
      <main className="nisar-results-main displacement-preparation known-place-analysis known-place-results-page">
        {requestId ? (
          <KnownPlaceResultsDashboard requestId={requestId} user={user} />
        ) : (
          <section className="known-place-custom-measurement">
            <p className="catalog-error" role="alert">No completed Known Place result is available in this session.</p>
          </section>
        )}
        <button type="button" className="workspace-nav-link known-place-back" onClick={onBack}>← Back to analysis</button>
      </main>
    </div>
  );
}
