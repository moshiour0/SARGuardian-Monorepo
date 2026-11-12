import type { User } from 'firebase/auth';
import { LandslidePage } from '../../landslide/ui/LandslidePage';

export type RiverShiftSetup = {
  aoiWkt: string;
  startDate: string;
  endDate: string;
};

export const RIVER_SHIFT_SETUP_STORAGE_KEY = 'sarguardian.riverShiftSetup.v1';

type Props = {
  user: User | null;
  authState: 'idle' | 'loading' | 'ready' | 'error';
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onStart: (setup: RiverShiftSetup) => void;
};

export function RiverShiftPage({ user, authState, onSignIn, onSignOut, onStart }: Props) {
  if (!user) return null;

  return (
    <LandslidePage
      user={user}
      authState={authState}
      onHome={() => { window.location.assign('/'); }}
      onSignIn={() => { void onSignIn(); }}
      onSignOut={() => { void onSignOut(); }}
      onResults={() => {}}
      onDisplacements={() => {}}
      onBackToMap={() => {}}
      onDisplacementTaskActivityChange={() => {}}
      onKnownPlaceAnalysis={() => {}}
      onShowKnownPlaceResults={() => {}}
      isResultsPage={false}
      isDisplacementPage={false}
      isKnownPlaceAnalysisPage={false}
      continueLabel="Continue"
      onContinue={onStart}
    />
  );
}
