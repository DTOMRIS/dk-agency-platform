'use client';

/**
 * /haqqimizda — v2 inner-page language (cream surface + Inter + inner tokens, as /toolkit).
 * Copy lives in next-intl `aboutV2` (az/en/ru/tr). DoganNote (embedded) and AhilikValues follow it.
 */

import { useLocale, useTranslations } from 'next-intl';
import { Flame, Shield, BarChart3, Store } from 'lucide-react';
import { normalizeLocale, withLocale } from '@/i18n/config';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Crumbs } from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';
import { DoganNote } from '@/components/home/DoganNote';
import { AhilikValues } from '@/components/home/AhilikValues';

const PROMISES = [
  { key: 'kazan', Icon: Flame },
  { key: 'ocaq', Icon: BarChart3 },
  { key: 'shedd', Icon: Shield },
  { key: 'marketplace', Icon: Store },
] as const;

type PromiseKey = (typeof PROMISES)[number]['key'];

export default function HaqqimizaPage() {
  const t = useTranslations('aboutV2');
  const locale = normalizeLocale(useLocale());

  return (
    <div className={`${s.page} ${inter.className}`}>
      <div className={home.wrap}>
        <Crumbs backHref={withLocale(locale, '/')} backLabel={t('back')} />

        <div className={s.tpHead}>
          <div style={{ minWidth: 0 }}>
            <div className={s.tpHeadMeta}>
              <span className={home.eyebrow}>
                <span className={home.dot} />
                {t('eyebrow')}
              </span>
            </div>
            <h1>{t('title')}</h1>
            <p className={s.lead}>{t('lead')}</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-[22px] border border-[#E4DCCD] bg-white p-6 sm:p-7">
            <p className="text-[11.5px] font-black uppercase tracking-[0.14em] text-[#BE2F47]">{t('problemLabel')}</p>
            <p className="mt-3 text-[15.5px] leading-7 text-slate-700">{t('intro')}</p>
          </section>
          <section className="rounded-[22px] bg-[#0F172A] p-6 text-white sm:p-7">
            <p className="text-[11.5px] font-black uppercase tracking-[0.14em] text-[#F28A9B]">{t('whyLabel')}</p>
            <h2 className="mt-3 text-[22px] font-black leading-tight tracking-[-0.02em]">{t('whyTitle')}</h2>
            <p className="mt-3 text-[15px] leading-7 text-slate-300">{t('why')}</p>
          </section>
        </div>

        <section className="mt-12" aria-labelledby="about-promise-title">
          <h2 id="about-promise-title" className={s.h2}>
            {t('promiseTitle')}
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {PROMISES.map(({ key, Icon }) => (
              <li key={key} className="flex items-start gap-4 rounded-[22px] border border-[#E4DCCD] bg-white p-5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FDECEF] text-[#BE2F47]">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <b className="block text-[16px] font-black text-[#0F172A]">{t(`promises.${key}.name` as `promises.${PromiseKey}.name`)}</b>
                  <span className="mt-1 block text-[14.5px] leading-6 text-slate-600">
                    {t(`promises.${key}.desc` as `promises.${PromiseKey}.desc`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 rounded-[22px] border border-[#E4DCCD] bg-[#FBF8F3] p-6 sm:p-9" aria-labelledby="about-story-title">
          <h2 id="about-story-title" className={s.h2}>
            {t('storyTitle')}
          </h2>
          <div className="mt-4 max-w-3xl space-y-4 text-[15.5px] leading-7 text-slate-700">
            <p className="font-semibold text-[#0F172A]">{t('story1')}</p>
            <p>{t('story2')}</p>
            <p>{t('story3')}</p>
            <p>{t('story4')}</p>
          </div>
          <p className="mt-8 max-w-3xl border-l-4 border-[#BE2F47] pl-4 text-[19px] font-black leading-snug tracking-[-0.01em] text-[#0F172A]">
            {t('closing')}
          </p>
        </section>
      </div>

      <div className="mt-14 border-t border-[#E4DCCD] pt-12">
        <DoganNote embedded />
        <AhilikValues />
      </div>
    </div>
  );
}
