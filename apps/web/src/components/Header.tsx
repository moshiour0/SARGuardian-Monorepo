import type { User } from 'firebase/auth';
import { ProfileControl } from './ProfileControl';
import { BrandLogo } from './BrandLogo';

type HeaderProps = {
  user: User | null;
  authState: 'idle' | 'loading' | 'ready' | 'error';
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenArchive?: () => void;
  onOpenHowItWorks?: () => void;
  isArchivePage?: boolean;
  hideProfile?: boolean;
};

export function Header({ user, authState, onSignIn, onSignOut, onOpenArchive, onOpenHowItWorks, isArchivePage = false, hideProfile = false }: HeaderProps) {
  return (
    <header className={`claude-nav-shell${isArchivePage ? ' is-archive' : ''}`}>
      <div className="claude-nav-inner">
        <a className="claude-brand" href={isArchivePage ? '/' : '#home'} aria-label="SARGuardian home">
          <span className="claude-brand-mark"><BrandLogo className="claude-brand-logo" /></span>
          <span className="claude-brand-word"><b>SAR</b>Guardian</span>
        </a>
        <nav className="claude-nav-links" aria-label="Main navigation">
          {isArchivePage ? <a href="/">Home</a> : (
            <>
              <button className="claude-nav-how claude-how-button" type="button" onClick={onOpenHowItWorks}>How it works</button>
              <button className="claude-archive-button" type="button" onClick={onOpenArchive}>Archive</button>
            </>
          )}
          {!hideProfile && user ? <ProfileControl user={user} onSignOut={onSignOut} /> : !hideProfile ? (
            <button className="claude-signin-button" type="button" onClick={onSignIn} disabled={authState === 'loading'}>
              {authState === 'loading' ? 'Signing in…' : 'Sign in'}
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
