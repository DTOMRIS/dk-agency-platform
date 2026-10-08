/**
 * @file PlatformCards.tsx
 * @purpose Homepage platform 3-card section — KAZAN AI / Toolkit / OCAQ
 * @pattern A (useTranslations) — L-004 uyğun
 * @task TASK-0105
 * @lastModified 2026-10-07 (TASK-0502: OCAQ CTA → WhatsApp, locale-aware links)
 */

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Flame, Calculator, LayoutDashboard, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { normalizeLocale, withLocale } from '@/i18n/config';

const cards = [
  { key: 'kazan', Icon: Flame, href: '/kazan-ai' },
  { key: 'toolkit', Icon: Calculator, href: '/toolkit' },
  // OCAQ is sold, not self-served: /dashboard is admin-only, so a visitor
  // clicking it used to land on the login page. Send them to WhatsApp instead.
  { key: 'ocaq', Icon: LayoutDashboard, href: null },
] as const;

type CardKey = (typeof cards)[number]['key'];

export function PlatformCards() {
  const t = useTranslations('home.platformCards');
  const locale = normalizeLocale(useLocale());
  const ocaqHref = `/api/leads/whatsapp?text=${encodeURIComponent(t('ocaq.whatsappText'))}`;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Eyebrow + Heading + Subheading */}
        <div className="mb-12 text-center">
          <span className="mb-3 block text-sm font-semibold uppercase tracking-widest text-[#C5A022]">
            {t('eyebrow')}
          </span>
          <h2 className="mb-4 font-display text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
            {t('heading')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {t('subheading')}
          </p>
        </div>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map(({ key, Icon, href }, index) => (
            <motion.article
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#C5A022] hover:shadow-lg md:p-7"
            >
              {/* Icon */}
              <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-[#C5A022]/10 p-3">
                <Icon
                  className="h-10 w-10 text-[#C5A022]"
                  aria-hidden="true"
                />
              </div>

              {/* Title + Subtitle */}
              <h3 className="mb-1 font-display text-xl font-bold text-[#1A1A2E]">
                {t(`${key}.title` as `${CardKey}.title`)}
              </h3>
              <p className="mb-3 text-sm font-semibold text-[#C5A022]">
                {t(`${key}.subtitle` as `${CardKey}.subtitle`)}
              </p>

              {/* Body */}
              <p className="mb-6 text-gray-600">
                {t(`${key}.body` as `${CardKey}.body`)}
              </p>

              {/* CTA Link */}
              {href ? (
                <Link
                  href={withLocale(locale, href)}
                  aria-label={t(`${key}.cta` as `${CardKey}.cta`)}
                  className="inline-flex items-center gap-1 font-semibold text-[#E94560] group/cta"
                >
                  {t(`${key}.cta` as `${CardKey}.cta`)}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                </Link>
              ) : (
                <a
                  href={ocaqHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(`${key}.cta` as `${CardKey}.cta`)}
                  className="inline-flex items-center gap-1 font-semibold text-[#E94560] group/cta"
                >
                  {t(`${key}.cta` as `${CardKey}.cta`)}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                </a>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
