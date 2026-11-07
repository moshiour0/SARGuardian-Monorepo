import { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';

type ProfileControlProps = {
  user: User;
  onSignOut: () => void;
};

export function ProfileControl({ user, onSignOut }: ProfileControlProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImageFailed(false);
  }, [user.photoURL]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeFromOutside = (event: PointerEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const closeFromKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('pointerdown', closeFromOutside);
    document.addEventListener('keydown', closeFromKeyboard);
    return () => {
      document.removeEventListener('pointerdown', closeFromOutside);
      document.removeEventListener('keydown', closeFromKeyboard);
    };
  }, [menuOpen]);

  const initials = (() => {
    const base = user.displayName ?? user.email ?? 'User';
    const parts = base.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'U';
  })();

  return (
    <div ref={controlRef} className="profile-control" data-confirming-signout={menuOpen}>
      {user.photoURL && !imageFailed ? <img src={user.photoURL} alt="" className="profile-avatar" onError={() => setImageFailed(true)} /> : <span className="profile-avatar profile-fallback">{initials}</span>}
      <span className="profile-copy">
        <strong className="profile-value-black" style={{ color: '#000' }}>{user.displayName ?? 'Signed-in user'}</strong>
      </span>
      <button
        className="profile-menu"
        type="button"
        onClick={() => setMenuOpen((current) => !current)}
        aria-label="Open account actions"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m6 8 4 4 4-4" /></svg>
      </button>
      {menuOpen && (
        <div className="signout-popover" role="menu" aria-label="Profile menu">
          <div className="signout-profile-summary">
            {user.photoURL && !imageFailed ? <img src={user.photoURL} alt="" className="profile-avatar" /> : <span className="profile-avatar profile-fallback">{initials}</span>}
            <div>
              <span>Signed in as</span>
              <strong>{user.displayName ?? 'Signed-in user'}</strong>
            </div>
          </div>
          <div className="profile-menu-email">
            <span>Email</span>
            <strong className="profile-value-black" style={{ color: '#000' }}>{user.email ?? 'No email available'}</strong>
          </div>
          <button type="button" className="profile-signout-button" onClick={() => { setMenuOpen(false); onSignOut(); }}>
            <span>Sign out</span><span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      )}
    </div>
  );
}
