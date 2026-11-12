import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadLandslideSessionState, persistLandslideSessionState } from './sessionState';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('validated Landslide session state', () => {
  it('round-trips workflow state without including authentication data', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', { sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
    } });
    const state = loadLandslideSessionState('user-1');
    state.coordinates = [[85.3, 27.7], [85.301, 27.7], [85.301, 27.701]];
    state.areaClosed = true;
    state.windowStart = '2026-08-01';
    state.windowEnd = '2026-08-15';
    state.catalogResult = {
      mode: 'catalog-preflight-only',
      status: 'ready',
      message: 'Ready',
      checked_at: '2026-10-19T00:00:00Z',
      data_downloaded: false,
      scientific_analysis_performed: false,
      processing_eligibility: { status: 'undetermined', reason: 'Metadata-only preflight.' },
      query: { platform: 'NISAR', product_type: 'GOFF', start_date: '2026-08-01', end_date: '2026-08-15', aoi_area_km2: 1 },
      product_count: 1,
      truncated: false,
      products_with_unknown_size: 0,
      estimated_full_granule_volume_gib: 2,
      estimated_full_granule_volume_is_complete: true,
      products: [{ granule_name: 'NISAR_GOFF_1', product_type: 'GOFF', observation_dates: ['2026-08-01'] }],
      next_step: 'Review metadata.',
      warnings: [],
    };
    state.selectedHarmonyProduct = state.catalogResult.products[0];
    persistLandslideSessionState('user-1', state);

    const restored = loadLandslideSessionState('user-1');
    expect(restored.coordinates).toEqual(state.coordinates);
    expect(restored.areaClosed).toBe(true);
    expect(restored.windowStart).toBe('2026-08-01');
    expect(restored.catalogResult?.products[0].granule_name).toBe('NISAR_GOFF_1');
    expect(restored.selectedHarmonyProduct?.granule_name).toBe('NISAR_GOFF_1');
    expect(restored.processingOptions.processing_profile).toBe('full-aoi');
    expect(storage.get('sarguardian.landslide.session.v1.find-displacement.user-1')).not.toContain('token');
  });

  it('rejects malformed stored coordinates and catalogue data', () => {
    const storage = new Map<string, string>([['sarguardian.landslide.session.v1.find-displacement.user-1', JSON.stringify({
      coordinates: [['not', 'coordinates']],
      areaClosed: true,
      productType: 'SECRET',
      processingOptions: {
        product_type: 'GOFF', acquisition_window: 'both-acquisitions-in-window',
        retention_mode: 'full-lossless', processing_profile: 'validation-pilot',
      },
      catalogResult: { mode: 'not-a-catalogue' },
    })]]);
    vi.stubGlobal('window', { sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: vi.fn(),
    } });

    const restored = loadLandslideSessionState('user-1');
    expect(restored.coordinates).toEqual([]);
    expect(restored.areaClosed).toBe(false);
    expect(restored.catalogResult).toBeNull();
    expect(restored.processingOptions).toEqual({
      product_type: 'BOTH', acquisition_window: 'secondary-acquisition-in-window',
      retention_mode: 'derived-only', processing_profile: 'full-aoi',
    });
  });

  it('rejects invalid dates, out-of-range coordinates, and orphaned selections', () => {
    vi.stubGlobal('window', { sessionStorage: {
      getItem: () => JSON.stringify({
        coordinates: [[181, 20], [85, 91], [85, 20]], areaClosed: true,
        windowStart: '2026-02-30', windowEnd: 'invalid',
        selectedHarmonyProduct: { granule_name: 'orphan', product_type: 'GUNW', observation_dates: [] },
      }),
    } });
    const state = loadLandslideSessionState('user-1');
    expect(state.coordinates).toEqual([]);
    expect(state.areaClosed).toBe(false);
    expect(state.windowStart).toBe('');
    expect(state.windowEnd).toBe('');
    expect(state.selectedHarmonyProduct).toBeNull();
  });

  it('keeps users isolated and persists only allowed workflow fields', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', { sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
    } });
    const state = { ...loadLandslideSessionState('user-1'), searchText: 'Saved location', token: 'must-not-be-stored' };
    persistLandslideSessionState('user-1', state);
    expect(loadLandslideSessionState('user-1').searchText).toBe('Saved location');
    expect(loadLandslideSessionState('user-2').searchText).toBe('');
    expect([...storage.values()][0]).not.toContain('must-not-be-stored');
  });

  it('keeps Find Displacement, River Shift, and Known Place AOI state isolated', () => {
    const sessionStore = new Map<string, string>();
    const localStore = new Map<string, string>();
    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: (key: string) => sessionStore.get(key) ?? null,
        setItem: (key: string, value: string) => { sessionStore.set(key, value); },
      },
      localStorage: {
        getItem: (key: string) => localStore.get(key) ?? null,
        setItem: (key: string, value: string) => { localStore.set(key, value); },
      },
    });

    const findState = loadLandslideSessionState('user-1', 'find-displacement');
    findState.coordinates = [[85.3, 27.7], [85.301, 27.7], [85.301, 27.701]];
    findState.areaClosed = true;
    findState.windowStart = '2026-08-01';
    persistLandslideSessionState('user-1', findState, 'find-displacement');

    const knownState = loadLandslideSessionState('user-1', 'known-place');
    expect(knownState.coordinates).toEqual([]);
    expect(knownState.areaClosed).toBe(false);
    expect(knownState.windowStart).toBe('');

    const riverState = loadLandslideSessionState('user-1', 'river-shift');
    expect(riverState.coordinates).toEqual([]);
    expect(riverState.areaClosed).toBe(false);
    riverState.searchText = 'River Shift only';
    persistLandslideSessionState('user-1', riverState, 'river-shift');

    knownState.searchText = 'Known place only';
    persistLandslideSessionState('user-1', knownState, 'known-place');
    expect(loadLandslideSessionState('user-1', 'find-displacement').searchText).toBe('');
    expect(loadLandslideSessionState('user-1', 'river-shift').searchText).toBe('River Shift only');
    expect(loadLandslideSessionState('user-1', 'known-place').searchText).toBe('Known place only');
  });

  it('falls back to in-memory defaults when optional session storage is blocked', () => {
    vi.stubGlobal('window', { sessionStorage: {
      getItem: () => { throw new Error('Storage blocked'); },
      setItem: () => { throw new Error('Storage blocked'); },
    } });
    const state = loadLandslideSessionState('user-1');
    expect(state.coordinates).toEqual([]);
    expect(() => persistLandslideSessionState('user-1', state)).not.toThrow();
  });
});
