'use client';

/**
 * @file MarketinqV2.tsx
 * @purpose TASK-0524 (owner 10.10: «dizayn planladığımız kimi olmalı»): Marketinq Ocağı tools in the v2
 *          inner-page language of /toolkit — cream surface + Inter (`MarketinqFrame`) and the same tool
 *          header (`ToolHeader`): back pill + breadcrumb, red-dot category eyebrow, tier pill, Inter 900
 *          title, lead. Tokens come from components/inner/inner.module.css (one source with /toolkit).
 */

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Crumbs } from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';
import { getToolConfig, type MarketingToolTier } from '@/lib/marketing-tools-config';
import { MARKETINQ_HUB_HREF } from '@/lib/marketing-tools-links';

const TIER_PILL: Record<MarketingToolTier, string> = {
  sagird: 'bg-sky-50 text-sky-800 ring-sky-200',
  kalfa: 'bg-amber-50 text-amber-800 ring-amber-200',
  usta: 'bg-violet-50 text-violet-800 ring-violet-200',
};

/** Cream v2 surface + Inter + inner tokens for everything inside. */
export function MarketinqFrame({ children }: { children: ReactNode }) {
  return <div className={`${s.page} ${inter.className}`}>{children}</div>;
}

export function ToolHeader({
  slug,
  title,
  subtitle,
  backHref = MARKETINQ_HUB_HREF,
  actions,
}: {
  /** marketing-tools-config slug — gives the category and the tier */
  slug: string;
  title: ReactNode;
  subtitle?: ReactNode;
  backHref?: string;
  /** buttons on the right (copy, PDF …) */
  actions?: ReactNode;
}) {
  const t = useTranslations('marketinq.v2');
  const tool = getToolConfig(slug);
  const category = tool ? t(`categories.${tool.category}`) : null;
  const trail = [t('crumb'), category, typeof title === 'string' ? title : null].filter(Boolean).join(' / ');

  return (
    <div data-testid="tool-header">
      <Crumbs backHref={backHref} backLabel={t('allTools')} trail={trail} />
      <div className={s.tpHead}>
        <div style={{ minWidth: 0 }}>
          <div className={s.tpHeadMeta}>
            {category ? (
              <span className={home.eyebrow}>
                <span className={home.dot} />
                {category}
              </span>
            ) : null}
            {tool ? (
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.12em] ring-1 ${TIER_PILL[tool.tier]}`}>
                {t(`tiers.${tool.tier}`)}
              </span>
            ) : null}
          </div>
          <h1>{title}</h1>
          {subtitle ? <p className={s.lead}>{subtitle}</p> : null}
        </div>
        {actions ? <div className="no-print flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

/** v2 wrap width (1200px, 24px gutters) for a tool body. */
export function ToolWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${home.wrap} ${className}`}>{children}</div>;
}
