import { useEffect, useRef, type ReactNode } from 'react';
import { importLibrary } from '@googlemaps/js-api-loader';
import type { User } from 'firebase/auth';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { configureGoogleMaps } from '../googleMapsLoader';
import { useGlassPointer } from '../useGlassPointer';

const GOOGLE_MAPS_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() ?? '';
const KHUMBU_LOCATION = { lat: 27.9881, lng: 86.9250 };
const KHUMBU_STUDY_POLYGON = [
  { lat: 28.092, lng: 86.76 },
  { lat: 28.118, lng: 87.02 },
  { lat: 28.012, lng: 87.17 },
  { lat: 27.858, lng: 87.06 },
  { lat: 27.816, lng: 86.86 },
  { lat: 27.894, lng: 86.72 },
];

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

function HardcodedMapDemo() {
  const mapElement = useRef<HTMLDivElement>(null);
  const satellitePreviewUrl = GOOGLE_MAPS_KEY
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${KHUMBU_LOCATION.lat},${KHUMBU_LOCATION.lng}&zoom=9&size=900x600&scale=2&maptype=satellite&key=${encodeURIComponent(GOOGLE_MAPS_KEY)}`
    : '';

  useEffect(() => {
    if (!GOOGLE_MAPS_KEY || !mapElement.current) return undefined;
    let cancelled = false;

    configureGoogleMaps(GOOGLE_MAPS_KEY);
    importLibrary('maps').then((library) => {
      if (cancelled || !mapElement.current) return;
      const maps = library as google.maps.MapsLibrary;
      const map = new maps.Map(mapElement.current, {
        center: KHUMBU_LOCATION,
        zoom: 9,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        gestureHandling: 'none',
        keyboardShortcuts: false,
        clickableIcons: false,
      });
      new google.maps.Polygon({
        map,
        paths: KHUMBU_STUDY_POLYGON,
        fillColor: '#2798ee',
        fillOpacity: 0.26,
        strokeColor: '#62c1ff',
        strokeOpacity: 0.98,
        strokeWeight: 3,
      });
      new google.maps.Marker({ map, position: KHUMBU_LOCATION, title: 'Khumbu study area' });
    }).catch(() => {
      // The styled fallback remains visible when the browser key is unavailable.
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <div
      className="claude-demo-map"
      style={satellitePreviewUrl ? { backgroundImage: `url("${satellitePreviewUrl}")` } : undefined}
    >
      <div ref={mapElement} className="claude-demo-map-canvas" aria-hidden="true" />
      <span className="claude-demo-location">Khumbu, Nepal · Satellite study area</span>
      <svg viewBox="0 0 300 220" preserveAspectRatio="none" aria-hidden="true"><path d="M70 50 L210 38 L246 118 L176 178 L88 150 Z" /></svg>
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
          <header className="claude-how-hero">
            <h1>How it works.</h1>
            <p>From a place on the map to evidence you can check, in four steps.</p>
          </header>

          <DemoRow number={1} title="Choose an area." description="Search for a place or draw a polygon on the map. Then pick your dates.">
            <HardcodedMapDemo />
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
