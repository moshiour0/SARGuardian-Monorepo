import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { useGlassPointer } from '../useGlassPointer';

type HowItWorksPageProps = {
  user: User | null;
  authState: 'idle' | 'loading' | 'ready' | 'error';
  onHome: () => void;
  onStart: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
};

function DemoRow({
  number,
  title,
  description,
  reverse = false,
  children,
}: {
  number: number;
  title: string;
  description: string;
  reverse?: boolean;
  children: ReactNode;
}) {
  return (
    <article className={`claude-demo-row${reverse ? ' is-reverse' : ''}`}>
      <div className="claude-demo-copy">
        <span>{number}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="claude-demo-visual" data-glass-pointer>{children}</div>
    </article>
  );
}

function DemoLine({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'warn' | 'info' }) {
  return (
    <div className="claude-demo-line">
      <span>{label}</span>
      <strong className={tone ? `is-${tone}` : ''}>{value}</strong>
    </div>
  );
}

export function HowItWorksPage({ user, authState, onHome, onStart, onSignIn, onSignOut }: HowItWorksPageProps) {
  useGlassPointer();
  return (
    <div className="home-page claude-home claude-how-page">
      <div className="claude-background" aria-hidden="true"><i /><i /><i /></div>
      <Header user={user} authState={authState} onSignIn={onSignIn} onSignOut={onSignOut} isArchivePage />

      <main className="claude-how-main">
        <div className="claude-wrap">
          <button className="claude-back" type="button" onClick={onHome}>&lsaquo; SARGuardian</button>
          <header className="claude-how-hero">
            <h1>How it works.</h1>
            <p>From a place on the map to evidence you can check, in four steps.</p>
          </header>

          <DemoRow number={1} title="Choose an area." description="Search for a place or draw a polygon on the map. Then pick your dates.">
            <div className="claude-demo-map" aria-hidden="true">
              <svg viewBox="0 0 300 220" preserveAspectRatio="none"><path d="M70 50 L210 38 L246 118 L176 178 L88 150 Z" /></svg>
            </div>
            <DemoLine label="Observation window" value="Jan – Mar" tone="info" />
          </DemoRow>

          <DemoRow number={2} title="Check what exists." description="We search the NISAR archive for matching products before any processing starts." reverse>
            <DemoLine label="Unwrapped interferograms" value="Found" tone="ok" />
            <DemoLine label="Offset tracking" value="Found" tone="ok" />
            <DemoLine label="Download or analysis" value="Not started" />
          </DemoRow>

          <DemoRow number={3} title="Process and screen." description="The workflow runs, keeps its quality and geometry checks, and scans the area for candidate patterns.">
            <div className="claude-progress"><span><b>Processing</b><em>Done</em></span><i><b style={{ width: '100%' }} /></i></div>
            <div className="claude-progress"><span><b>Quality checks</b><em>Done</em></span><i><b style={{ width: '100%' }} /></i></div>
            <div className="claude-progress"><span><b>Screening</b><em>Running</em></span><i><b style={{ width: '64%' }} /></i></div>
          </DemoRow>

          <DemoRow number={4} title="Review the evidence." description="Explore maps, measurements, limits and where every number came from." reverse>
            <DemoLine label="Area A" value="Candidate" tone="warn" />
            <DemoLine label="Measurement" value="Line of sight, pairwise" />
            <DemoLine label="Area B" value="Withheld" tone="info" />
            <DemoLine label="Source" value="Linked to archive" />
          </DemoRow>

          <section className="claude-how-limits">
            <h2>Know the limits.</h2>
            <div className="claude-limits-grid">
              <article data-glass-pointer><h3>Unwrapped interferograms</h3><p>Pairwise line-of-sight displacement where valid pixels allow.</p></article>
              <article data-glass-pointer><h3>Offset tracking</h3><p>Evidence for screening. Not a displacement measurement on its own.</p></article>
              <article data-glass-pointer><h3>Archive search</h3><p>Finds matching products. It is not a download or an analysis.</p></article>
            </div>
          </section>

          <section className="claude-how-cta">
            <h2>Ready to look?</h2>
            <button className="claude-button primary" type="button" onClick={onStart}>Start exploring</button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
