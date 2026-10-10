'use client';

/**
 * @file ToolPitch.tsx
 * @purpose TASK-0533 (owner 10.10: «SaaS'lı mı yapacaksın» → «olur»). The turnover-calculator pattern: the
 *          product that solves the problem is shown right where the tool's number lands. One rule for every
 *          free tool, by directory group: cost and staff tools → OCAQ (daily control), revenue tools →
 *          Marketinq Ocağı, opening and hotel tools → the dedicated service (free diagnostic first).
 *          Copy repeats only what the site already says about each product (no new claims).
 */

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Flame, Handshake, Megaphone } from 'lucide-react';
import { normalizeLocale, withLocale } from '@/i18n/config';
import { getToolMeta } from '@/lib/toolkit/tool-directory';
import { whatsappHref } from '@/lib/contact-channels';

type Product = 'ocaq' | 'marketing' | 'service';

export function productForTool(slug: string): Product {
  const meta = getToolMeta(slug);
  if (!meta || meta.hospitality || meta.group === 'acilis') return 'service';
  if (meta.group === 'gelir') return 'marketing';
  return 'ocaq';
}

const ICON = { ocaq: Flame, marketing: Megaphone, service: Handshake } as const;

export default function ToolPitch({ toolId, className = '' }: { toolId: string; className?: string }) {
  const t = useTranslations('toolPitch');
  const locale = normalizeLocale(useLocale());
  const product = productForTool(toolId);
  const Icon = ICON[product];
  const href =
    product === 'ocaq'
      ? `${withLocale(locale, '/')}#p-ocaq`
      : product === 'marketing'
        ? withLocale(locale, '/marketinq')
        : whatsappHref(t('service.wa'));
  const external = product === 'service';
  const cls = 'mt-3 inline-flex items-center gap-1.5 text-[14px] font-extrabold text-[#0F172A] hover:text-[#BE2F47]';

  return (
    <div className={`mt-4 rounded-2xl border border-[#E4DCCD] bg-[#F6F1E9] p-4 ${className}`} data-testid="tool-pitch" data-product={product}>
      <p className="flex items-center gap-2 text-[11.5px] font-black uppercase tracking-[0.14em] text-[#BE2F47]">
        <Icon size={14} aria-hidden="true" />
        {t(`${product}.eyebrow`)}
      </p>
      <p className="mt-1.5 text-[15px] font-black leading-snug text-[#0F172A]">{t(`${product}.title`)}</p>
      <p className="mt-1 text-[13.5px] leading-6 text-slate-600">{t(`${product}.body`)}</p>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {t(`${product}.cta`)} <ArrowRight size={15} aria-hidden="true" />
        </a>
      ) : product === 'ocaq' ? (
        // Plain <a>: the homepage tab listens to `hashchange`.
        <a href={href} className={cls}>
          {t(`${product}.cta`)} <ArrowRight size={15} aria-hidden="true" />
        </a>
      ) : (
        <Link href={href} className={cls}>
          {t(`${product}.cta`)} <ArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
