import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Radar } from 'lucide-react';
import { normalizeLocale } from '@/i18n/config';
import { getAlternates } from '@/lib/seo/alternates';
import FranchiseRadarCatalog from '@/components/franchise/FranchiseRadarCatalog';

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

export default async function FranchiseRadarPage() {
  const t = await getTranslations('franchiseRadar');
  return (
    <div className="min-h-screen bg-[var(--dk-paper)]">
      <section className="border-b border-slate-100 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-[var(--dk-gold)]">
            <Radar size={14} /> {t('hero.badge')}
          </div>
          <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>
      <FranchiseRadarCatalog />
    </div>
  );
}
