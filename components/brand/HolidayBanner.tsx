'use client';
import { useTranslations } from 'next-intl';
import { useHolidayPhase } from './useSeasonalBrand';
import s from './HolidayBanner.module.css';

export default function HolidayBanner() {
  const t = useTranslations('holiday2026');
  const phase = useHolidayPhase();
  if (!phase) return null;
  return (
    <aside className={s.banner} aria-label={t('label')} data-holiday={phase}>
      <picture className={s.art} aria-hidden="true">
        <source media="(max-width: 650px)" srcSet="/images/dk-holiday-satin-mobile-2026.webp" />
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative responsive WebP, 11–12 KB per viewport */}
        <img src="/images/dk-holiday-satin-desktop-2026.webp" width={1920} height={120} alt="" />
      </picture>
      <div className={s.content}>
        <p className={s.title}>{t(phase === 'flag' ? 'flagTitle' : 'victoryTitle')}</p>
        <p className={s.note}>{t(phase === 'flag' ? 'flagNote' : 'victoryNote')}</p>
      </div>
    </aside>
  );
}
