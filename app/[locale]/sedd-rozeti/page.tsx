import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { normalizeLocale, withLocale } from '@/i18n/config';
import PageBack from '@/components/inner/PageBack';
import home from '@/components/home/v2/homeV2.module.css';
import s from '@/components/inner/inner.module.css';

/** Şədd Rozeti landing — Pattern A (seddPage), 4 languages (TASK-0472). */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seddPage');
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function SeddRozetiPage() {
  const locale = normalizeLocale(await getLocale());
  const t = await getTranslations('seddPage');

  return (
    <div className={`${s.page} min-h-screen pb-24`}>
      <PageBack />
      <div className={home.wrap}>
        <div className="max-w-4xl rounded-[22px] border border-[#E4DCCD] bg-white p-7 sm:p-10">
          <span className={home.eyebrow}>
            <span className={home.dot} />
            {t('badge')}
          </span>
          <h1 className="mt-5 text-[clamp(34px,4.6vw,60px)] font-black leading-none tracking-[-0.05em] text-[#0F172A]">
            {t('title')}
          </h1>
          <p className={`${s.lead} mt-5`}>{t('body')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={withLocale(locale, '/elaqe')}
              className="inline-flex min-h-11 items-center rounded-full bg-dk-red-strong px-6 text-sm font-bold text-white transition hover:bg-dk-red-deep"
            >
              {t('applyCta')}
            </Link>
            <Link
              href={withLocale(locale, '/toolkit')}
              className="inline-flex min-h-11 items-center rounded-full border border-[#E4DCCD] bg-white px-6 text-sm font-bold text-[#0F172A] transition hover:border-[#0F172A]"
            >
              {t('toolkitCta')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
