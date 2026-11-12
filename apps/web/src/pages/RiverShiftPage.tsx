import type { User } from 'firebase/auth';
import { Header } from '../components/Header';
import './river-shift.css';

type Props = {
  user: User | null;
  authState: 'idle' | 'loading' | 'ready' | 'error';
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onStart: () => void;
};

export function RiverShiftPage({ user, authState, onSignIn, onSignOut, onStart }: Props) {
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
      <main className="river-shift-landing">
        <section className="river-shift-landing-card">
          <p className="rs-kicker">RIVER SHIFT</p>
          <h1>Detect observed river change.</h1>
          <p className="rs-muted">
            Configure an area and observation window, then review the evidence and provenance from the River Shift workflow.
          </p>
          <button className="rs-primary-button" type="button" onClick={onStart}>
            Run RiverShift
          </button>
        </section>
      </main>
    </div>
  );
}
