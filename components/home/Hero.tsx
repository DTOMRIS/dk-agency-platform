'use client';

import Link from 'next/link';
import { useState } from 'react';
import DashboardMock from './DashboardMock';
import KineticLayers from './KineticLayers';

interface HeroProps {
  onTabSwitch: (tab: string) => void;
  onCtaClick: (label: string) => void;
  onKazanClick: () => void;
}

const tabs = ['Basla', 'Hizlandir', 'Boyut'];

export default function Hero({ onTabSwitch, onCtaClick, onKazanClick }: HeroProps) {
  const [active, setActive] = useState(tabs[0]);

  return (
    <section id="hero" className="dk-section dk-hero">
      <div className="dk-container dk-hero-grid">
        <div>
          <span className="home-kicker">DK Agency Platform v4</span>
          <h1 className="home-title">Muasir HoReCa ucun cloud-suretli emeliyyatlar.</h1>
          <p className="home-body">
            Restoraninizin acilisindan genislenmesine qeder tek emeliyyat sistemi: analitika, marketplace, newsroom ve
            AI destekli karar qatlari.
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
            <Link href="/dashboard" className="home-btn home-btn-primary" onClick={() => onCtaClick('hero_platform_walkthrough')}>
              Platform gezintisi
            </Link>
            <Link
              href="/kazan-ai"
              className="home-btn home-btn-secondary"
              onClick={() => {
                onCtaClick('hero_kazan_ai');
                onKazanClick();
              }}
            >
              KAZAN AI ile P&amp;L texmini -&gt;
            </Link>
          </div>
        </div>

        <div className="dk-hero-right">
          <DashboardMock />
          <KineticLayers />
        </div>
      </div>
    </section>
  );
}
