import type { Metadata } from 'next';
import { useLocale, useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import FranchbookGenerator from '@/components/franchise/FranchbookGenerator';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Crumbs } from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';
import { normalizeLocale, withLocale } from '@/i18n/config';
import { getAlternates } from '@/lib/seo/alternates';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = normalizeLocale(raw);
  const t = await getTranslations({ locale, namespace: 'franchiseV2.meta.franchbook' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: getAlternates(locale, '/franchise/francbuk-generatoru'),
  };
}

/** Franchise v2 redesign: cream v2 frame + Inter; one back link (Crumbs → /franchise). */
export default function FranchbookGeneratorPage() {
  const tb = useTranslations('pageBack');
  const tp = useTranslations('franchisePillar');
  const locale = normalizeLocale(useLocale());
  return (
    <div className={`${s.page} ${inter.className}`}>
      <div className={home.wrap}>
        <div className="mx-auto max-w-4xl">
          <Crumbs
            backHref={withLocale(locale, '/franchise')}
            backLabel={tb('franchise')}
            trail={`${tb('franchise')} / ${tp('tools.franchbook.title')}`}
          />
          <div className="pt-4">
            <FranchbookGenerator />
          </div>
        </div>
      </div>
    </div>
  );
}
