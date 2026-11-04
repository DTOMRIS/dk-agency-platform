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
      <div className={s.content}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local, optimized owner-supplied brand art */}
        <img src="/images/dk-victory-2026.webp" width={64} height={64} alt="" aria-hidden="true" className={s.logo} />
        <div className={s.copy}>
          <p className={s.title}>{t(phase === 'flag' ? 'flagTitle' : 'victoryTitle')}</p>
          <p className={s.note}>{t(phase === 'flag' ? 'flagNote' : 'victoryNote')}</p>
        </div>
        <span className={s.date} aria-hidden="true">{phase === 'flag' ? '09' : '08'}<small>{t('month')}</small></span>
      </div>
      <span className={s.ribbon} aria-hidden="true" />
    </aside>
  );
}
