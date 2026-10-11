import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { normalizeLocale, withLocale } from '@/i18n/config';
import { getAlternates } from '@/lib/seo/alternates';
import FranchiseRadarCatalog from '@/components/franchise/FranchiseRadarCatalog';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Crumbs } from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = normalizeLocale(raw);
  const t = await getTranslations({ locale, namespace: 'franchiseRadar' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: getAlternates(locale, '/franchise/radar'),
  };
}

/** Franchise v2 redesign: cream v2 frame + Inter, toolkit-style header; one back link (Crumbs → /franchise). */
export default async function FranchiseRadarPage() {
  const t = await getTranslations('franchiseRadar');
  const tb = await getTranslations('pageBack');
  const locale = normalizeLocale(await getLocale());
  return (
    <div className={`${s.page} ${inter.className}`}>
      <div className={home.wrap}>
        <Crumbs backHref={withLocale(locale, '/franchise')} backLabel={tb('franchise')} trail={`${tb('franchise')} / ${t('hero.badge')}`} />
        <div className={s.tpHead}>
          <div style={{ minWidth: 0 }}>
            <div className={s.tpHeadMeta}>
              <span className={home.eyebrow}>
                <span className={home.dot} />
                {t('hero.badge')}
              </span>
            </div>
            <h1>{t('hero.title')}</h1>
            <p className={s.lead}>{t('hero.subtitle')}</p>
          </div>
        </div>
        <FranchiseRadarCatalog />
      </div>
    </div>
  );
}
