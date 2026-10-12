'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, MessageCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { normalizeLocale, withLocalePrefix, type Locale } from '@/i18n/config';
import { LAUNCH_CAMPAIGN, MARKETING_TOOLS, isLaunchActive, type MarketingToolConfig, type MarketingToolTier } from '@/lib/marketing-tools-config';
import { WHATSAPP_NUMBER } from '@/lib/contact-channels';
import home from '@/components/home/v2/homeV2.module.css';
import s from '@/components/inner/inner.module.css';

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

interface TierTools {
  live: MarketingToolConfig[];
  planned: MarketingToolConfig[];
}

function groupToolsByTier(): Record<TierKey, TierTools> {
  return MARKETING_TOOLS.reduce<Record<TierKey, TierTools>>(
    (acc, tool) => {
      if (tool.status === 'live' || tool.status === 'beta') {
        acc[tool.tier].live.push(tool);
      } else {
        acc[tool.tier].planned.push(tool);
      }
      return acc;
    },
    {
      sagird: { live: [], planned: [] },
      kalfa: { live: [], planned: [] },
      usta: { live: [], planned: [] },
    },
  );
}

// TASK-0534: month names written out — server ICU has no Azerbaijani month names («2026 M12 31») and the
// server/browser difference caused a hydration error (React #418).
const MONTHS: Record<string, string[]> = {
  az: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
function formatCampaignDate(iso: string, locale: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const month = (MONTHS[locale] ?? MONTHS.en)[m - 1];
  return locale === 'en' ? `${month} ${d}, ${y}` : `${d} ${month} ${y}`;
}

export function PricingPage() {
  const t = useTranslations('pricing');
  const locale = normalizeLocale(useLocale()) as Locale;

  const toolsByTier = useMemo(() => groupToolsByTier(), []);
  const launchActive = isLaunchActive();
  // TASK-0540: one number for the whole site (lib/contact-channels), not an env override.
  const whatsappNumber = WHATSAPP_NUMBER;

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

  const sectionTitle = 'text-[clamp(24px,2.8vw,34px)] font-black leading-tight tracking-[-0.035em] text-[#0F172A]';

  return (
    <main className={s.page} data-testid="pricing-page">
      <section className={home.wrap}>
        <div className="flex flex-col gap-5 pb-8 pt-4 lg:pb-10">
          <span className={home.eyebrow}>
            <span className={home.dot} />
            {t('slogan')}
          </span>
          <div className="max-w-3xl">
            <h1 className="text-[clamp(34px,4.6vw,56px)] font-black leading-none tracking-[-0.05em] text-[#0F172A]">
              {t('title')}
            </h1>
            <p className={`${s.lead} mt-4`}>{t('subtitle')}</p>
          </div>
          {launchActive && (
            <div className="w-fit max-w-full rounded-[22px] border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm leading-6 text-emerald-800" data-testid="pricing-launch-banner">
              {/* TASK-0534: the date comes from LAUNCH_CAMPAIGN (code ends 2026-12-31; the text said «1 Sentyabr»). */}
              {t('launchNote', { date: formatCampaignDate(LAUNCH_CAMPAIGN.endDateISO, locale) })}
            </div>
          )}
        </div>
      </section>

      <section className={`${home.wrap} grid gap-5 pb-10 lg:grid-cols-3`}>
        {TIERS.map((tier) => {
          const tierName = t(`tiers.${tier.key}.name`);
          const benefits = t.raw(`tiers.${tier.key}.benefits`) as string[];
          const { live: liveTools, planned: plannedTools } = toolsByTier[tier.key];
          const ctaHref =
            tier.key === 'sagird' ? withLocalePrefix(locale, '/auth/register') : getWhatsappHref(tierName);

          return (
            <article
              key={tier.key}
              className={`relative flex flex-col rounded-[22px] border bg-white p-6 sm:p-7 ${
                tier.highlighted ? 'border-[#0F172A] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)]' : 'border-[#E4DCCD]'
              }`}
              data-testid={`pricing-card-${tier.key}`}
            >
              {tier.highlighted ? (
                <div className="absolute right-5 top-5 rounded-full bg-dk-red-strong px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">
                  {t('tiers.kalfa.popularBadge')}
                </div>
              ) : null}

              <div className="pr-24">
                <h2 className="text-[26px] font-black tracking-[-0.03em] text-[#0F172A]">{tierName}</h2>
                <p className="mt-3 text-sm leading-6 text-[#5B6474]">{t(`tiers.${tier.key}.description`)}</p>
              </div>

              <div className="mt-7 flex items-end gap-2">
                {launchActive && tier.key !== 'sagird' ? (
                  <>
                    <span className="text-[36px] font-black leading-none tracking-[-0.04em] text-[#0F172A]" aria-label={t('launchBadge')}>
                      {t('launchBadge')}
                    </span>
                    <span className="pb-1 text-sm font-semibold text-slate-400 line-through">
                      {t(`tiers.${tier.key}.price`)} {t(`tiers.${tier.key}.period`)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[36px] font-black leading-none tracking-[-0.04em] text-[#0F172A]">{t(`tiers.${tier.key}.price`)}</span>
                    <span className="pb-1 text-sm font-semibold text-[#5B6474]">{t(`tiers.${tier.key}.period`)}</span>
                  </>
                )}
              </div>

              <ul className="mt-7 space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-sm leading-6 text-[#334155]">
                    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FDECEF] text-[#BE2F47]">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {liveTools.length > 0 && (
                <details className="group mt-7 rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] p-4">
                  <summary
                    className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-[#0F172A]"
                    data-testid={`pricing-tool-toggle-${tier.key}`}
                  >
                    <span>{t('toolListToggle', { count: liveTools.length })}</span>
                    <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <ul className="mt-4 space-y-2" data-testid={`pricing-tools-${tier.key}`}>
                    {liveTools.map((tool) => (
                      <li key={tool.slug} className="flex items-center justify-between gap-3 text-sm text-[#334155]">
                        <span>{getToolName(tool.slug)}</span>
                        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold uppercase text-[#5B6474] ring-1 ring-[#E4DCCD]">
                          {t(`status.${tool.status}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {plannedTools.length > 0 && (
                <div className="mt-3 rounded-2xl border border-dashed border-[#E4DCCD] bg-[#FBF8F3]/60 p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t('plannedToolsLabel', { count: plannedTools.length })}
                  </p>
                  <ul className="space-y-2">
                    {plannedTools.map((tool) => (
                      <li key={tool.slug} className="flex items-center justify-between gap-3 text-sm text-slate-400">
                        <span>{getToolName(tool.slug)}</span>
                        <span className="rounded-full border border-[#E4DCCD] bg-white/60 px-2 py-1 text-[11px] font-bold uppercase text-slate-400">
                          {t('status.planned')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                href={ctaHref}
                className={`mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition ${
                  tier.highlighted
                    ? 'bg-dk-red-strong text-white hover:bg-dk-red-deep'
                    : 'border border-[#E4DCCD] bg-white text-[#0F172A] hover:border-[#0F172A]'
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

      <section className={`${home.wrap} grid gap-6 pb-12 lg:grid-cols-[0.8fr_1.2fr]`}>
        <div>
          <h2 className={sectionTitle}>{t('faq.title')}</h2>
          <p className="mt-3 text-sm leading-6 text-[#5B6474]">{t('faq.subtitle')}</p>
        </div>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <details key={item.question} className="group rounded-[22px] border border-[#E4DCCD] bg-white p-5">
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-[#0F172A]"
                data-testid={`pricing-faq-toggle-${index}`}
              >
                <span>{item.question}</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-3 text-sm leading-6 text-[#5B6474]">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={`${home.wrap} pb-14`}>
        <div className="flex flex-col items-start justify-between gap-6 rounded-[22px] bg-[#0F172A] p-7 text-white sm:p-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-[clamp(24px,2.8vw,34px)] font-black leading-tight tracking-[-0.035em]">{t('bottomCta.title')}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">{t('bottomCta.body')}</p>
          </div>
          <Link
            href={getWhatsappHref(t('tiers.kalfa.name'))}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-dk-red-strong px-6 text-sm font-bold text-white transition hover:bg-dk-red-deep"
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
