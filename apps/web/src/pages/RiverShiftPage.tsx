import type { User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { Header } from '../components/Header';
import { formatWktPolygon, type Wgs84Point } from '../riverShift/aoi';
import './river-shift.css';

export const RIVER_SHIFT_SETUP_STORAGE_KEY = 'sarguardian.riverShiftSetup.v1';

export type RiverShiftSetup = {
  aoiWkt: string;
  startDate: string;
  endDate: string;
};

type Props = {
  user: User | null;
  authState: 'idle' | 'loading' | 'ready' | 'error';
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onStart: (setup: RiverShiftSetup) => void;
};

export function RiverShiftPage({ user, authState, onSignIn, onSignOut, onStart }: Props) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const lineRef = useRef<google.maps.Polyline | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState('');
  const [drawing, setDrawing] = useState(false);
  const [vertices, setVertices] = useState<Wgs84Point[]>([]);
  const [aoiWkt, setAoiWkt] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchSelection, setSearchSelection] = useState('');
  const [searchError, setSearchError] = useState('');
  const [aoiError, setAoiError] = useState('');
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || '';

  useEffect(() => {
    if (!apiKey) {
      setMapError('Google Maps is not configured. Add VITE_GOOGLE_MAPS_API_KEY to enable the interactive map.');
      return undefined;
    }
    let cancelled = false;
    setOptions({ key: apiKey, v: 'weekly' });
    void importLibrary('maps').then((library) => {
      if (cancelled || !mapElement.current) return;
      const maps = library as google.maps.MapsLibrary;
      mapRef.current = new maps.Map(mapElement.current, {
        center: { lat: 22, lng: 82 },
        zoom: 5,
        mapTypeId: 'satellite',
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: true,
      });
      setMapReady(true);
    }).catch((error: unknown) => {
      if (!cancelled) setMapError(error instanceof Error ? error.message : 'Google Maps could not be loaded.');
    });
    return () => { cancelled = true; };
  }, [apiKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !drawing) return undefined;
    const listener = map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) setVertices((current) => [...current, [event.latLng!.lng(), event.latLng!.lat()]]);
    });
    return () => listener.remove();
  }, [drawing, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    polygonRef.current?.setMap(null);
    lineRef.current?.setMap(null);
    const points = drawing ? vertices : (() => {
      if (!aoiWkt) return [];
      try { return parseWktForDisplay(aoiWkt); } catch { return []; }
    })();
    if (points.length >= 3 && !drawing) {
      polygonRef.current = new google.maps.Polygon({
        map, paths: points.map(([lng, lat]) => ({ lng, lat })),
        strokeColor: '#70eee0', strokeOpacity: .95, strokeWeight: 3,
        fillColor: '#51d9cc', fillOpacity: .16, clickable: false,
      });
    } else if (points.length > 0) {
      lineRef.current = new google.maps.Polyline({
        map, path: points.map(([lng, lat]) => ({ lng, lat })),
        strokeColor: '#70eee0', strokeOpacity: .95, strokeWeight: 3,
      });
    }
    return () => {
      polygonRef.current?.setMap(null);
      lineRef.current?.setMap(null);
    };
  }, [aoiWkt, drawing, mapReady, vertices]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return undefined;
    let cancelled = false;
    let control: HTMLDivElement | null = null;
    let autocomplete: google.maps.places.PlaceAutocompleteElement | null = null;
    let listener: ((event: google.maps.places.PlacePredictionSelectEvent) => void) | null = null;
    void importLibrary('places').then((library) => {
      if (cancelled || !mapRef.current) return;
      const places = library as google.maps.PlacesLibrary;
      autocomplete = new places.PlaceAutocompleteElement();
      autocomplete.placeholder = 'Search for a river, place or address';
      autocomplete.setAttribute('aria-label', 'Search for a river, place or address');
      control = document.createElement('div');
      control.className = 'rs-map-search-control';
      control.setAttribute('aria-label', 'Map place search');
      const caption = document.createElement('span');
      caption.className = 'rs-map-search-caption';
      caption.textContent = 'FIND A PLACE';
      control.append(caption, autocomplete);
      mapRef.current.controls[google.maps.ControlPosition.TOP_LEFT].push(control);
      listener = async (event) => {
        try {
          setSearchError('');
          const place = event.placePrediction.toPlace();
          await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'viewport'] });
          if (cancelled || !place.location || !mapRef.current) return;
          if (place.viewport) mapRef.current.fitBounds(place.viewport);
          else { mapRef.current.setCenter(place.location); mapRef.current.setZoom(14); }
          markerRef.current?.setMap(null);
          markerRef.current = new google.maps.Marker({ map: mapRef.current, position: place.location, title: place.displayName || 'Selected location' });
          setSearchSelection([place.displayName, place.formattedAddress].filter(Boolean).join(' · ') || 'Selected location shown on map');
        } catch (error) {
          if (!cancelled) setSearchError(error instanceof Error ? error.message : 'Place search could not retrieve the selected location.');
        }
      };
      autocomplete.addEventListener('gmp-select', listener);
    }).catch(() => {
      if (!cancelled) setSearchError('Map search is unavailable. Enable Places API (New) for this Google Maps key.');
    });
    return () => {
      cancelled = true;
      if (autocomplete && listener) autocomplete.removeEventListener('gmp-select', listener);
      markerRef.current?.setMap(null);
      if (control && mapRef.current) {
        const controls = mapRef.current.controls[google.maps.ControlPosition.TOP_LEFT];
        const index = controls.getArray().indexOf(control);
        if (index >= 0) controls.removeAt(index);
      }
    };
  }, [mapReady]);

  const finishDrawing = () => {
    try {
      setAoiWkt(formatWktPolygon(vertices));
      setVertices([]);
      setDrawing(false);
      setAoiError('');
    } catch (error) {
      setAoiError(error instanceof Error ? error.message : 'Could not finish the AOI polygon.');
    }
  };

  const handleContinue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!aoiWkt || !startDate || !endDate || endDate < startDate) {
      setAoiError('Draw and finish one AOI polygon, then choose a valid date range.');
      return;
    }
    if ((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000 > 366) {
      setAoiError('The observation window cannot exceed 366 days.');
      return;
    }
    onStart({ aoiWkt, startDate, endDate });
  };

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
      <main className="river-shift-setup">
        <section className="river-shift-setup-card">
          <p className="rs-kicker">RIVER SHIFT</p>
          <h1>Choose a river study area.</h1>
          <p className="rs-muted">
            Search for a place, draw one polygon around the river reach, and select the observation window.
          </p>
          <div className="rs-setup-map" ref={mapElement} role="application" aria-label="River Shift AOI map" />
          {!mapReady && !mapError && <p className="rs-info-banner" role="status">Connecting to Google Maps…</p>}
          {mapError && <p className="rs-error" role="alert">{mapError}</p>}
          {searchSelection && <p className="rs-info-banner" role="status">Map location: {searchSelection}. Draw the study polygon around the river reach.</p>}
          {searchError && <p className="rs-error" role="alert">{searchError}</p>}
          <div className="rs-aoi-controls">
            <button className="rs-secondary-button" type="button" disabled={!mapReady || drawing} onClick={() => { setVertices([]); setAoiWkt(''); setAoiError(''); setDrawing(true); }}>
              {drawing ? `Drawing… ${vertices.length} vertices` : 'Draw polygon'}
            </button>
            <button className="rs-secondary-button" type="button" disabled={!drawing || vertices.length < 3} onClick={finishDrawing}>Finish polygon</button>
            {drawing && <span className="rs-muted">Click the map to add vertices.</span>}
          </div>
          {aoiError && <p className="rs-error" role="alert">{aoiError}</p>}
          <form className="rs-form" onSubmit={handleContinue}>
            <div className="rs-fields-two">
              <label className="rs-field"><span>Start date</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required /></label>
              <label className="rs-field"><span>End date</span><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required /></label>
            </div>
            <button className="rs-primary-button" type="submit" disabled={!aoiWkt || !startDate || !endDate}>Continue</button>
          </form>
        </section>
      </main>
    </div>
  );
}

function parseWktForDisplay(wkt: string): Wgs84Point[] {
  const body = wkt.replace(/^POLYGON\s*\(\(/i, '').replace(/\)\)\s*$/, '');
  return body.split(',').map((pair) => {
    const [longitude, latitude] = pair.trim().split(/\s+/).map(Number);
    return [longitude, latitude] as Wgs84Point;
  }).slice(0, -1);
}
