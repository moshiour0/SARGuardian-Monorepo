import { renderToStaticMarkup } from 'react-dom/server';
import type { User } from 'firebase/auth';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LandslidePage } from '../ui/LandslidePage';
import { loadLandslideSessionState, persistLandslideSessionState } from '../ui/sessionState';

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('investigation mode state integration', () => {
  it('shares saved selection across map, preparation, and return; clearing disables all investigation cards', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-23T12:00:00Z'));
    const storage = new Map<string, string>();
    vi.stubGlobal('window', { sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    } });
    const state = loadLandslideSessionState('test-user');
    Object.assign(state, { coordinates: [[85.3, 27.7], [85.301, 27.7], [85.301, 27.701]], areaClosed: true, windowStart: '2026-10-01', windowEnd: '2026-10-22' });
    persistLandslideSessionState('test-user', state);
    const render = (isDisplacementPage = false, isKnownPlaceAnalysisPage = false) => renderToStaticMarkup(<LandslidePage user={{ uid: 'test-user' } as User} isResultsPage={false} isDisplacementPage={isDisplacementPage} isKnownPlaceAnalysisPage={isKnownPlaceAnalysisPage} onHome={() => {}} onResults={() => {}} onDisplacements={() => {}} onKnownPlaceAnalysis={() => {}} onBackToMap={() => {}} onDisplacementTaskActivityChange={() => {}} onSignOut={() => {}} />);
    const map = render();
    expect(map).toContain('Find displacements');
    expect(map).not.toContain('class="mode-help"');
    expect(map).not.toContain('View NISAR results');
    const preparation = render(true);
    expect(preparation).not.toContain('POLYGON');
    expect(preparation).not.toContain('Copy Payload');
    expect(preparation).toContain('Find displacements');
    expect(render()).toBe(map);
    state.coordinates = [];
    state.areaClosed = false;
    persistLandslideSessionState('test-user', state);
    expect(render()).toContain('disabled=""');
    expect(render(true)).toContain('processing-page-skeleton');
  });
});
