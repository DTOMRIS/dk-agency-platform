'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

/** Shown when `[slug]` resolves to an unknown sektor (notFound()). */
export default function SektorNotFound() {
  const t = useTranslations('sektorNotFound');

  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-[#1A1A2E] px-4 py-24">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-4 font-display text-6xl font-black tracking-tighter text-[var(--dk-gold)]">
          404
        </div>
        <h1 className="font-display text-3xl font-black tracking-tighter text-white sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-4 text-base text-slate-300">{t('body')}</p>
        <div className="mt-8">
          <Link
            href="/sektor"
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--dk-red)] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[var(--dk-red)]/20 transition hover:brightness-110"
          >
            {t('cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
