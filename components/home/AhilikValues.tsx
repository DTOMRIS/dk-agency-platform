/**
 * @file AhilikValues.tsx
 * @purpose Ahilik 3-value card section — trust layer, Pattern A (useTranslations)
 * @pattern A (useTranslations) — L-004 uyğun
 * @task TASK-0106 · v2 restyle (cream + Inter + red accent) for /haqqimizda
 * @usage Only `/haqqimizda` (after DoganNote). The homepage (HomeV2) does not render it.
 */

'use client';

import { useTranslations } from 'next-intl';
import { Award, Heart, Shield } from 'lucide-react';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';

const values = [
  { key: 'mastery', Icon: Award },
  { key: 'generosity', Icon: Heart },
  { key: 'integrity', Icon: Shield },
] as const;

type ValueKey = (typeof values)[number]['key'];

export function AhilikValues() {
  const t = useTranslations('home.ahilikValues');

  return (
    <section className={`${home.tokens} ${inter.className} bg-[#F6F1E9] py-16`} aria-labelledby="ahilik-values-title">
      <div className={home.wrap}>
        <div className="mb-10 text-center">
          <span className={home.eyebrow}>
            <span className={home.dot} />
            {t('eyebrow')}
          </span>
          <h2 id="ahilik-values-title" className={`${home.h2} text-center`}>
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-[16px] leading-7 text-slate-600">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {values.map(({ key, Icon }) => (
            <article
              key={key}
              className="rounded-[22px] border border-[#E4DCCD] bg-white p-6 transition-colors duration-200 hover:border-[#0F172A]"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDECEF] text-[#BE2F47]">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-[18px] font-black tracking-[-0.01em] text-[#0F172A]">
                {t(`${key}.name` as `${ValueKey}.name`)}
              </h3>
              <p className="text-[14.5px] leading-6 text-slate-600">{t(`${key}.desc` as `${ValueKey}.desc`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
