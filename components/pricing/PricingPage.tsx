'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, MessageCircle, Sparkles } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { normalizeLocale, withLocalePrefix, type Locale } from '@/i18n/config';
import { MARKETING_TOOLS, type MarketingToolConfig, type MarketingToolTier } from '@/lib/marketing-tools-config';

type TierKey = MarketingToolTier;

interface TierView {
  key: TierKey;
  highlighted: boolean;
}

const TIERS: TierView[] = [
  { key: 'sagird', highlighted: false },
  { key: 'kalfa', highlighted: true },
  { key: 'usta', highlighted: false },
];

const WHATSAPP_FALLBACK = '994502566279';

function normalizeWhatsappNumber(value: string | undefined): string {
  const digits = (value || WHATSAPP_FALLBACK).replace(/[^\d]/g, '');
  return digits || WHATSAPP_FALLBACK;
}

function groupToolsByTier(): Record<TierKey, MarketingToolConfig[]> {
  return MARKETING_TOOLS.reduce<Record<TierKey, MarketingToolConfig[]>>(
    (acc, tool) => {
      acc[tool.tier].push(tool);
      return acc;
    },
    { sagird: [], kalfa: [], usta: [] },
  );
}

export function PricingPage() {
  const t = useTranslations('pricing');
  const locale = normalizeLocale(useLocale()) as Locale;

  const toolsByTier = useMemo(() => groupToolsByTier(), []);
  const whatsappNumber = normalizeWhatsappNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);

  const faqItems = t.raw('faq.items') as Array<{ question: string; answer: string }>;

  const getToolName = (slug: string) => {
    try {
      return t(`toolNames.${slug}`);
    } catch {
      return slug;
    }
  };

  const getWhatsappHref = (tierName: string) => {
    const message = t('whatsappMessage', { tier: tierName });
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className="min-h-screen bg-[#F8F5EF] text-[#1A1A2E]" data-testid="pricing-page">
      <section className="border-b border-[#1A1A2E]/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#C5A022]/30 bg-[#C5A022]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7A6213]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t('slogan')}
          </div>
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-bold leading-tight text-[#1A1A2E] sm:text-5xl lg:text-6xl">
              {t('title')}
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-700 sm:text-lg">{t('subtitle')}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {TIERS.map((tier) => {
          const tierName = t(`tiers.${tier.key}.name`);
          const benefits = t.raw(`tiers.${tier.key}.benefits`) as string[];
          const tools = toolsByTier[tier.key];
          const ctaHref =
            tier.key === 'sagird' ? withLocalePrefix(locale, '/auth/register') : getWhatsappHref(tierName);

          return (
            <article
              key={tier.key}
              className={`relative flex flex-col rounded-xl border bg-white p-6 shadow-sm ${
                tier.highlighted ? 'border-[#C5A022] shadow-[#C5A022]/20' : 'border-[#1A1A2E]/10'
              }`}
              data-testid={`pricing-card-${tier.key}`}
            >
              {tier.highlighted ? (
                <div className="absolute right-5 top-5 rounded-full bg-[#C5A022] px-3 py-1 text-xs font-bold uppercase text-white">
                  {t('tiers.kalfa.popularBadge')}
                </div>
              ) : null}

              <div className="pr-24">
                <h2 className="font-serif text-3xl font-bold text-[#1A1A2E]">{tierName}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{t(`tiers.${tier.key}.description`)}</p>
              </div>

              <div className="mt-7 flex items-end gap-2">
                <span className="font-serif text-4xl font-bold text-[#1A1A2E]">{t(`tiers.${tier.key}.price`)}</span>
                <span className="pb-1 text-sm font-semibold text-slate-500">{t(`tiers.${tier.key}.period`)}</span>
              </div>

              <ul className="mt-7 space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C5A022]/15 text-[#7A6213]">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <details className="group mt-7 rounded-lg border border-[#1A1A2E]/10 bg-[#F8F5EF] p-4">
                <summary
                  className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-[#1A1A2E]"
                  data-testid={`pricing-tool-toggle-${tier.key}`}
                >
                  <span>{t('toolListToggle', { count: tools.length })}</span>
                  <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <ul className="mt-4 space-y-2" data-testid={`pricing-tools-${tier.key}`}>
                  {tools.map((tool) => (
                    <li key={tool.slug} className="flex items-center justify-between gap-3 text-sm text-slate-700">
                      <span>{getToolName(tool.slug)}</span>
                      <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold uppercase text-slate-500">
                        {t(`status.${tool.status}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>

              <Link
                href={ctaHref}
                className={`mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition ${
                  tier.highlighted
                    ? 'bg-[#E94560] text-white hover:bg-[#d73d56]'
                    : 'border border-[#1A1A2E]/15 bg-white text-[#1A1A2E] hover:border-[#C5A022] hover:text-[#7A6213]'
                }`}
                data-testid={tier.key === 'sagird' ? 'pricing-sagird-cta' : `pricing-whatsapp-${tier.key}`}
              >
                {tier.key === 'sagird' ? null : <MessageCircle className="h-4 w-4" aria-hidden="true" />}
                {t(`tiers.${tier.key}.ctaLabel`)}
              </Link>
            </article>
          );
        })}
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#1A1A2E]">{t('faq.title')}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{t('faq.subtitle')}</p>
        </div>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <details key={item.question} className="rounded-lg border border-[#1A1A2E]/10 bg-white p-5">
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-[#1A1A2E]"
                data-testid={`pricing-faq-toggle-${index}`}
              >
                <span>{item.question}</span>
                <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-[#1A1A2E]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 text-white sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <h2 className="font-serif text-3xl font-bold">{t('bottomCta.title')}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">{t('bottomCta.body')}</p>
          </div>
          <Link
            href={getWhatsappHref(t('tiers.kalfa.name'))}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#E94560] px-6 text-sm font-bold text-white transition hover:bg-[#d73d56]"
            data-testid="pricing-bottom-whatsapp"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {t('bottomCta.ctaLabel')}
          </Link>
        </div>
      </section>
    </main>
  );
}

