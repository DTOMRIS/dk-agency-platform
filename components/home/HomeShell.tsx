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
        rootMargin: '-12% 0px -62% 0px',
        threshold: [0.2, 0.35, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return activeId;
}

function SectionBand({ children, tint = 'default' }: { children: React.ReactNode; tint?: 'default' | 'mist' | 'ink' }) {
  return <div className={`dk-band dk-band-${tint}`}>{children}</div>;
}

export default function HomeShell() {
  const activeId = useSectionObserver();
  const [newsLocale, setNewsLocale] = useState<'az' | 'en' | 'ru' | 'tr'>('az');

  return (
    <main className="home-surface">
      <StickyChapterNav activeId={activeId} />

      <SectionBand>
        <Hero
          onTabSwitch={(tab) => trackHomeEvent({ event: 'home_tab_switch', tab, section: 'hero' })}
          onCtaClick={(ctaLabel) => trackHomeEvent({ event: 'home_cta_click', section: 'hero', ctaLabel })}
          onKazanClick={() => trackHomeEvent({ event: 'kazan_ai_click', section: 'hero', ctaLabel: 'kazan_hero' })}
        />
      </SectionBand>

      <SectionBand tint="mist"><StageCards /></SectionBand>
      <SectionBand><Basla /></SectionBand>
      <SectionBand tint="mist"><Comparison /></SectionBand>
      <SectionBand><HizlandirAlternating onKazanClick={() => trackHomeEvent({ event: 'kazan_ai_click', section: 'hizlandir', ctaLabel: 'kazan_widget' })} /></SectionBand>
      <SectionBand tint="mist"><Boyut /></SectionBand>
      <SectionBand><ListingsPreview /></SectionBand>

      <SectionBand tint="mist">
        <section aria-label="news locale controls" className="dk-section">
          <div className="dk-container">
            <span className="home-kicker">Xeber dili</span>
            <div className="tab-row" role="tablist" aria-label="news locale tabs">
              {(['az', 'en', 'ru', 'tr'] as const).map((locale) => (
                <button key={locale} type="button" data-active={newsLocale === locale} onClick={() => setNewsLocale(locale)}>
                  {locale.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>
        <NewsEditorial locale={newsLocale} />
      </SectionBand>

      <SectionBand><StatsBar /></SectionBand>
      <SectionBand tint="ink"><SignupCTA onClick={(ctaLabel) => trackHomeEvent({ event: 'home_cta_click', section: 'signup', ctaLabel })} /></SectionBand>
    </main>
  );
}
