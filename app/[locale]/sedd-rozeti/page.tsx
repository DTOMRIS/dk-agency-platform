import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { normalizeLocale, withLocale } from '@/i18n/config';
import PageBack from '@/components/inner/PageBack';

/** Şədd Rozeti landing — Pattern A (seddPage), 4 languages (TASK-0472). */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seddPage');
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function SeddRozetiPage() {
  const locale = normalizeLocale(await getLocale());
  const t = await getTranslations('seddPage');

  return (
    <div className="min-h-screen bg-white py-20">
      <PageBack />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <span className="inline-flex rounded-full bg-dk-red-strong px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
          {t('badge')}
        </span>
        <h1 className="mt-5 font-display text-4xl font-black text-[var(--dk-navy)] lg:text-6xl">{t('title')}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">{t('body')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={withLocale(locale, '/elaqe')}
            className="inline-flex rounded-lg bg-dk-red-strong px-6 py-3 text-sm font-bold text-white"
          >
            {t('applyCta')}
          </Link>
          <Link
            href={withLocale(locale, '/toolkit')}
            className="inline-flex rounded-lg border border-slate-200 px-6 py-3 text-sm font-bold text-[var(--dk-navy)]"
          >
            {t('toolkitCta')}
          </Link>
        </div>
      </div>
    </div>
  );
}
