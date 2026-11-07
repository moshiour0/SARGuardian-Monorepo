type HeroProps = {
  onStartExploring: () => void;
  onOpenHowItWorks: () => void;
};

export function Hero({ onStartExploring, onOpenHowItWorks }: HeroProps) {
  return (
    <header className="claude-hero" id="home">
      <div className="claude-rings" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="claude-wrap claude-hero-copy">
        <h1>
          <span>Observe change.</span>
          <span className="claude-hero-emphasis">Examine evidence.</span>
        </h1>
        <p>See where the Earth&rsquo;s surface may be moving, using NISAR radar.</p>
        <div className="claude-actions">
          <button className="claude-button primary" type="button" onClick={onStartExploring}>Start exploring</button>
          <button className="claude-button ghost" type="button" onClick={onOpenHowItWorks}>How it works</button>
        </div>
      </div>
    </header>
  );
}
