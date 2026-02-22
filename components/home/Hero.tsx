'use client';

import Link from 'next/link';
import { useState } from 'react';

interface HeroProps {
  onTabSwitch: (tab: string) => void;
  onCtaClick: (label: string) => void;
  onKazanClick: () => void;
}

const tabs = ['P&L', 'Food Cost', 'Labor', 'Growth'];

export default function Hero({ onTabSwitch, onCtaClick, onKazanClick }: HeroProps) {
  const [active, setActive] = useState(tabs[0]);

  return (
    <section id="hero">
      <span className="home-kicker">DK Agency Growth Platform</span>
      <h1 className="home-title">Cloud-speed operations for modern HoReCa teams.</h1>
      <p className="home-body">
        Modular flows inspired by Restaurant365, with a kinetic light feel. Teams can move from baseline diagnostics to
        execution without leaving one operating surface.
      </p>

      <div className="tab-row" role="tablist" aria-label="Home tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            data-active={active === tab}
            onClick={() => {
              setActive(tab);
              onTabSwitch(tab);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="home-cta-row">
        <Link
          href="/dashboard"
          className="home-btn home-btn-primary"
          onClick={() => onCtaClick('primary_basla')}
        >
          Basla platform walkthrough
        </Link>
        <Link
          href="/kazan-ai"
          className="home-btn home-btn-secondary"
          onClick={() => {
            onCtaClick('secondary_kazan');
            onKazanClick();
          }}
        >
          KAZAN AI ile P&amp;L texmini -&gt;
        </Link>
      </div>

      <div className="mock-board" aria-label="platform preview">
        <div className="mock-grid">
          <div className="mock-item float-card">
            <strong>Revenue</strong>
            <div>AZN 118k / month</div>
          </div>
          <div className="mock-item">
            <strong>Food cost</strong>
            <div>31.2% (target 29.0%)</div>
          </div>
          <div className="mock-item">
            <strong>Labor</strong>
            <div>27.4% with shift alerts</div>
          </div>
        </div>
      </div>
    </section>
  );
}
