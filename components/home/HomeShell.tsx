'use client';

import { useEffect, useState } from 'react';
import type { HomeSectionId } from './home.constants';
import { homeSections } from './home.constants';
import { trackHomeEvent } from '@/lib/analytics/homeEvents';
import Hero from './Hero';
import StageCards from './StageCards';
import Basla from './Basla';
import Comparison from './Comparison';
import HizlandirAlternating from './HizlandirAlternating';
import Boyut from './Boyut';
import ListingsPreview from './ListingsPreview';
import NewsEditorial from './NewsEditorial';
import StatsBar from './StatsBar';
import SignupCTA from './SignupCTA';
import StickyChapterNav from './StickyChapterNav';
import './home.css';

function useSectionObserver() {
  const [activeId, setActiveId] = useState<HomeSectionId>('hero');

  useEffect(() => {
    const sections = homeSections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => section instanceof HTMLElement);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id as HomeSectionId);
        }
      },
      {
        rootMargin: '-15% 0px -62% 0px',
        threshold: [0.2, 0.35, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return activeId;
}

export default function HomeShell() {
  const activeId = useSectionObserver();
  const [newsLocale, setNewsLocale] = useState<'az' | 'en' | 'ru' | 'tr'>('az');
  const [motionEnabled, setMotionEnabled] = useState(true);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setMotionEnabled(!media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  return (
    <div className="home-surface" data-motion={motionEnabled ? 'on' : 'off'}>
      <div className="home-shell">
        <div className="home-grid">
          <StickyChapterNav activeId={activeId} />

          <div className="home-panel home-content">
            <Hero
              onTabSwitch={(tab) => trackHomeEvent({ event: 'home_tab_switch', tab, section: 'hero' })}
              onCtaClick={(ctaLabel) => trackHomeEvent({ event: 'home_cta_click', section: 'hero', ctaLabel })}
              onKazanClick={() => trackHomeEvent({ event: 'kazan_ai_click', section: 'hero', ctaLabel: 'kazan_hero' })}
            />
            <StageCards />
            <Basla />
            <Comparison />
            <HizlandirAlternating
              onKazanClick={() => trackHomeEvent({ event: 'kazan_ai_click', section: 'hizlandir', ctaLabel: 'kazan_widget' })}
            />
            <Boyut />
            <ListingsPreview />

            <section aria-label="news locale controls" style={{ paddingBottom: 0 }}>
              <span className="home-kicker">Locale</span>
              <div className="tab-row" role="tablist" aria-label="news locale tabs">
                {(['az', 'en', 'ru', 'tr'] as const).map((locale) => (
                  <button key={locale} type="button" data-active={newsLocale === locale} onClick={() => setNewsLocale(locale)}>
                    {locale.toUpperCase()}
                  </button>
                ))}
              </div>
            </section>

            <NewsEditorial locale={newsLocale} />
            <StatsBar />
            <SignupCTA onClick={(ctaLabel) => trackHomeEvent({ event: 'home_cta_click', section: 'signup', ctaLabel })} />
          </div>
        </div>
      </div>
    </div>
  );
}
