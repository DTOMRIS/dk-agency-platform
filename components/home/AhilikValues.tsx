/**
 * @file AhilikValues.tsx
 * @purpose Homepage Ahilik 3-value card section — trust layer, Pattern A (useTranslations)
 * @pattern A (useTranslations) — L-004 uyğun
 * @task TASK-0106
 * @lastModified 2026-05-20
 */

'use client';

import { useTranslations } from 'next-intl';
import { Award, Heart, Shield } from 'lucide-react';

const values = [
  { key: 'mastery', Icon: Award },
  { key: 'generosity', Icon: Heart },
  { key: 'integrity', Icon: Shield },
] as const;

type ValueKey = (typeof values)[number]['key'];

export function AhilikValues() {
  const t = useTranslations('home.ahilikValues');

  return (
    <section
      className="bg-[#FAFAF8] py-16"
      aria-labelledby="ahilik-values-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Eyebrow + Başlıq + Subtitle */}
        <div className="mb-10 text-center">
          <span className="mb-3 block text-sm font-semibold uppercase tracking-widest text-[#C5A022]">
            {t('eyebrow')}
          </span>
          <h2
            id="ahilik-values-title"
            className="mb-3 font-display text-3xl font-bold text-[#1A1A2E] sm:text-4xl"
          >
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* 3 Kart */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {values.map(({ key, Icon }) => (
            <article
              key={key}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-[#C5A022] hover:shadow-lg"
            >
              {/* İkon */}
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-[#C5A022]/10 p-3">
                <Icon
                  className="h-8 w-8 text-[#C5A022]"
                  aria-hidden="true"
                />
              </div>

              {/* Ad */}
              <h3 className="mb-2 font-display text-lg font-bold text-[#1A1A2E]">
                {t(`${key}.name` as `${ValueKey}.name`)}
              </h3>

              {/* Açıqlama */}
              <p className="text-sm text-gray-700 leading-relaxed">
                {t(`${key}.desc` as `${ValueKey}.desc`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
