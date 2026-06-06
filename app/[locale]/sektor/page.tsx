import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { SEKTOR_CONFIG_LIST } from '@/lib/data/sektorConfigs';

interface SektorIndexParams {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: SektorIndexParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'sektorIndex' });
  return {
    title: t('pageTitle'),
    description: t('subline'),
    openGraph: { title: t('pageTitle'), description: t('subline'), type: 'website' },
  };
}

export default async function SektorIndexPage({ params }: SektorIndexParams) {
  const { locale } = await params;
  const tIndex = await getTranslations({ locale, namespace: 'sektorIndex' });

  const cards = await Promise.all(
    SEKTOR_CONFIG_LIST.map(async (config) => {
      const t = await getTranslations({ locale, namespace: config.namespace });
      return {
        slug: config.slug,
        title: t('hero.headline'),
        subline: t('hero.subline'),
        toolCount: config.tools.length,
      };
    })
  );

  return (
    <section className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl font-black tracking-tighter text-slate-900 sm:text-5xl">
            {tIndex('heading')}
          </h1>
          <p className="mt-4 text-lg text-slate-600">{tIndex('subline')}</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.slug}
              href={`/sektor/${card.slug}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h2 className="font-display text-2xl font-black tracking-tighter text-slate-900">
                {card.title}
              </h2>
              <p className="mt-3 flex-1 text-sm text-slate-600">{card.subline}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {card.toolCount} {tIndex('toolsLabel')}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--dk-red)]">
                  {tIndex('ctaLabel')}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
