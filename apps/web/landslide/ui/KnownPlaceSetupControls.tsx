import { useCallback, useEffect, useState } from 'react';
import type { KnownPlaceAnalysisMode, KnownPlaceHazardMode } from '../../src/api/knownPlace';
import { KnownPlacePolygonEditor } from './KnownPlacePolygonEditor';

export const KNOWN_PLACE_GEOMETRY_KEY = 'sarguardian.knownPlaceGeometry.v1';
export const KNOWN_PLACE_SETTINGS_KEY = 'sarguardian.knownPlaceSettings.v1';

type GeometryDraft = { measurementWkt: string; referenceWkt: string };
export type KnownPlaceSettingsDraft = {
  hazardMode: KnownPlaceHazardMode;
  analysisMode: KnownPlaceAnalysisMode;
  polarization: 'HH' | 'HV' | 'VV' | 'VH';
  track: string;
  direction: 'ANY' | 'A' | 'D';
  coherenceNeighbours: '1' | '5' | '10' | '15' | '20' | '25';
  geometryHeight: string;
};

export const defaultKnownPlaceSettings: KnownPlaceSettingsDraft = {
  hazardMode: 'mixed', analysisMode: 'exploratory', polarization: 'HH', track: 'ANY', direction: 'ANY', coherenceNeighbours: '1', geometryHeight: '',
};

function key(base: string, uid: string): string { return `${base}:${uid}`; }

export function loadKnownPlaceGeometry(uid: string): GeometryDraft {
  if (typeof window === 'undefined') return { measurementWkt: '', referenceWkt: '' };
  try {
    const value = JSON.parse(sessionStorage.getItem(key(KNOWN_PLACE_GEOMETRY_KEY, uid)) || '{}') as Partial<GeometryDraft>;
    return { measurementWkt: value.measurementWkt || '', referenceWkt: value.referenceWkt || '' };
  } catch { return { measurementWkt: '', referenceWkt: '' }; }
}

export function loadKnownPlaceSettings(uid: string): KnownPlaceSettingsDraft {
  if (typeof window === 'undefined') return defaultKnownPlaceSettings;
  try { return { ...defaultKnownPlaceSettings, ...JSON.parse(sessionStorage.getItem(key(KNOWN_PLACE_SETTINGS_KEY, uid)) || '{}') }; } catch { return defaultKnownPlaceSettings; }
}

export function KnownPlaceSetupControls({ uid, centerAoiWkt, center, onReadyChange }: { uid: string; centerAoiWkt: string | null; center: { lat: number; lng: number } | null; onReadyChange: (ready: boolean) => void }) {
  const draft = loadKnownPlaceGeometry(uid);
  const saved = loadKnownPlaceSettings(uid);
  const [measurementWkt, setMeasurementWkt] = useState(draft.measurementWkt);
  const [referenceWkt, setReferenceWkt] = useState(draft.referenceWkt);
  const [settings, setSettings] = useState(saved);
  const [valid, setValid] = useState(false);
  const update = <K extends keyof KnownPlaceSettingsDraft>(name: K, value: KnownPlaceSettingsDraft[K]) => setSettings((current) => ({ ...current, [name]: value }));
  const persistGeometry = useCallback((measurement: string, reference: string) => {
    setMeasurementWkt(measurement); setReferenceWkt(reference);
    try { sessionStorage.setItem(key(KNOWN_PLACE_GEOMETRY_KEY, uid), JSON.stringify({ measurementWkt: measurement, referenceWkt: reference })); } catch { /* optional */ }
  }, [uid]);
  useEffect(() => { try { sessionStorage.setItem(key(KNOWN_PLACE_SETTINGS_KEY, uid), JSON.stringify(settings)); } catch { /* optional */ } }, [settings, uid]);
  useEffect(() => { onReadyChange(valid && Boolean(measurementWkt && referenceWkt)); }, [measurementWkt, referenceWkt, onReadyChange, valid]);
  return <section className="known-place-setup-controls" aria-label="Known Place polygons and settings">
    <KnownPlacePolygonEditor
      outerAoiWkt={centerAoiWkt}
      center={center}
      initialMeasurementWkt={measurementWkt || null}
      initialReferenceWkt={referenceWkt || null}
      onMeasurementChange={(value) => persistGeometry(value, referenceWkt)}
      onReferenceChange={(value) => persistGeometry(measurementWkt, value)}
      onValidationChange={(result) => setValid(result.valid)}
    />
    <details className="known-place-additional-settings" open>
      <summary>Additional settings</summary>
      <div className="known-place-form-grid">
        <label className="aoi-job-label"><span>Hazard context</span><select value={settings.hazardMode} onChange={(e) => update('hazardMode', e.target.value as KnownPlaceHazardMode)}><option value="landslide">Landslide</option><option value="glacier_collapse">Glacier collapse</option><option value="ice_rock_avalanche">Ice-rock avalanche</option><option value="mixed">Mixed / uncertain</option></select></label>
        <label className="aoi-job-label"><span>Analysis mode</span><select value={settings.analysisMode} onChange={(e) => update('analysisMode', e.target.value as KnownPlaceAnalysisMode)}><option value="exploratory">Exploratory measurement</option><option value="retrospective_validation">Retrospective validation</option></select></label>
        <label className="aoi-job-label"><span>Polarization</span><select value={settings.polarization} onChange={(e) => update('polarization', e.target.value as KnownPlaceSettingsDraft['polarization'])}>{(['HH', 'HV', 'VV', 'VH'] as const).map((v) => <option key={v}>{v}</option>)}</select></label>
        <label className="aoi-job-label"><span>Track</span><input value={settings.track} maxLength={3} placeholder="ANY or 098" onChange={(e) => update('track', e.target.value)} /></label>
        <label className="aoi-job-label"><span>Flight direction</span><select value={settings.direction} onChange={(e) => update('direction', e.target.value as KnownPlaceSettingsDraft['direction'])}><option value="ANY">Any — keep orbit chains separate</option><option value="A">Ascending</option><option value="D">Descending</option></select></label>
        <label className="aoi-job-label"><span>Minimum valid coherence neighbours</span><select value={settings.coherenceNeighbours} onChange={(e) => update('coherenceNeighbours', e.target.value as KnownPlaceSettingsDraft['coherenceNeighbours'])}>{(['1', '5', '10', '15', '20', '25'] as const).map((v) => <option key={v}>{v}</option>)}</select></label>
        <label className="aoi-job-label"><span>Constant ellipsoidal height in metres (optional sensitivity only)</span><input type="number" value={settings.geometryHeight} min={-500} max={100000} step="any" placeholder="Blank = documented approximation" onChange={(e) => update('geometryHeight', e.target.value)} /></label>
      </div>
    </details>
  </section>;
}
