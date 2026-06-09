'use client';

import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { normalizeLocale, withLocale } from '@/i18n/config';

export default function Hero() {
  const locale = normalizeLocale(useLocale());
  const t = useTranslations('home.hero');

  return (
    <section className="relative overflow-hidden bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e94560]/15 bg-[#e94560]/8 px-3.5 py-1.5">
              <span className="text-sm text-[#e94560]">✦</span>
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#e94560]">
                {t('eyebrow')}
              </span>
            </div>

            <h1 className="mb-6 text-[clamp(38px,5vw,62px)] font-bold leading-[1.05] tracking-tight text-[#1a1a2e]">
              {t('line1')}{' '}
              <span className="text-[#e94560]">{t('line2')}</span>
            </h1>

            <p className="mb-9 max-w-lg text-[17px] leading-[1.6] text-[#6b6b7b]">
              {t('subtitle')}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={withLocale(locale, '/aletler')}
                className="flex items-center gap-2 rounded-xl bg-[#1a1a2e] px-7 py-4 font-mono text-[13px] uppercase tracking-wide text-white transition hover:bg-[#2a2a40]"
              >
                {t('ctaPrimary')} <span>✦</span>
              </Link>
              <Link
                href={`${withLocale(locale, '/')}#sektor`}
                className="flex items-center gap-2 rounded-xl border border-[#1a1a2e]/20 px-7 py-4 font-mono text-[13px] uppercase tracking-wide text-[#1a1a2e] transition hover:border-[#1a1a2e]/40"
              >
                {t('ctaSecondary')} <span>›</span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-[#e8e6e1] bg-gradient-to-br from-[#e94560]/15 via-[#f8f7f4] to-[#10b981]/10 shadow-xl">
              <span className="font-mono text-sm uppercase tracking-wider text-[#6b6b7b]/40">
                {t('imagePlaceholder')}
              </span>
            </div>

            <div className="absolute -bottom-6 -left-6 flex items-center gap-4 rounded-2xl border-l-4 border-[#10b981] bg-white py-4 pl-4 pr-6 shadow-lg">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10b981]/10">
                <span className="text-xl text-[#10b981]">↗</span>
              </span>
              <div>
                <p className="text-[22px] font-bold leading-none text-[#1a1a2e]">
                  {t('statValue')}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#6b6b7b]">
                  {t('statLabel')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
