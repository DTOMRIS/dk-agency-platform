/**
 * @file DoganNote.tsx
 * @purpose Homepage founder note — trust layer, Pattern A (useTranslations)
 * @pattern A (useTranslations) — L-004 uyğun
 * @task TASK-0106
 * @lastModified 2026-05-20
 */

'use client';

import { useTranslations } from 'next-intl';
import { FounderAvatar } from '@/components/ui/FounderAvatar';
import Link from 'next/link';

export function DoganNote() {
  const t = useTranslations('home.doganNote');

  return (
    <section className="bg-white py-20" aria-labelledby="dogan-note-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_2fr] md:gap-16 items-start">
          {/* Sol: Kurucu kimliyi */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <FounderAvatar size={128} className="h-32 w-32 border-4 border-[#C5A022] shadow-md" />
            <div className="text-center md:text-left">
              <p className="font-display text-lg font-bold text-[#1A1A2E]">Doğan Tomris</p>
              <p className="text-sm text-gray-500">{t('founderRole')}</p>
            </div>
          </div>

          {/* Sağ: Mətn + CTA */}
          <div>
            {/* Eyebrow */}
            <span className="mb-3 block text-sm font-semibold uppercase tracking-widest text-[#C5A022]">
              {t('eyebrow')}
            </span>

            {/* Başlıq */}
            <h2
              id="dogan-note-title"
              className="mb-6 font-display text-3xl font-bold text-[#1A1A2E] sm:text-4xl"
            >
              {t('title')}
            </h2>

            {/* 3 abzas */}
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{t('body1')}</p>
              <p>{t('body2')}</p>
              <p className="italic font-display text-[#1A1A2E]">{t('body3')}</p>
            </div>

            {/* CTA düymələri */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/kazan-ai"
                className="inline-flex items-center justify-center rounded-xl bg-dk-red-strong px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-dk-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E94560] focus-visible:ring-offset-2"
              >
                {t('ctaPrimary')}
              </Link>
              <Link
                href="/toolkit"
                className="inline-flex items-center justify-center rounded-xl border-2 border-[#1A1A2E] px-5 py-3 text-sm font-semibold text-[#1A1A2E] transition-colors hover:bg-[#1A1A2E] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A2E] focus-visible:ring-offset-2"
              >
                {t('ctaSecondary')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
