import { useLocale, useTranslations } from 'next-intl';
import RoiCalculator from '@/components/franchise/RoiCalculator';
import LeadForm from '@/components/franchise/LeadForm';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Crumbs, LiveStatus } from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';
import { normalizeLocale, withLocale } from '@/i18n/config';

/** TASK-0531: v2 frame (owner 10.10: «bu da eski model»). Back → /franchise, same header as the toolkit tools. */
export default function RoiPage() {
  const t = useTranslations('franchiseRoi');
  const tb = useTranslations('pageBack');
  const locale = normalizeLocale(useLocale());
  return (
    <div className={`${s.page} ${inter.className}`}>
      <div className={home.wrap}>
        <Crumbs backHref={withLocale(locale, '/franchise')} backLabel={tb('franchise')} trail={`${tb('franchise')} / ${t('badge')}`} />
        <div className={s.tpHead}>
          <div style={{ minWidth: 0 }}>
            <div className={s.tpHeadMeta}>
              <span className={home.eyebrow}>
                <span className={home.dot} />
                {t('badge')}
              </span>
              <LiveStatus label={t('live')} />
            </div>
            <h1>{t('title')}</h1>
            <p className={s.lead}>{t('subtitle')}</p>
          </div>
        </div>
        <RoiCalculator />
        <div className="mt-8">
          <LeadForm toolSource="roi_calc" />
        </div>
        <p className="mt-6 text-center text-[12.5px] text-slate-500">{t('disclaimer')}</p>
      </div>
    </div>
  );
}
