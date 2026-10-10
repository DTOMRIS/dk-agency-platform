'use client';

/**
 * @file PageBack.tsx
 * @purpose TASK-0530 (naviqasiya qanunu: hər səhifədə geri düyməsi). The v2 back pill (BackLink) in its own
 *          row, for pages that do not use Crumbs / ToolkitStudioLayout yet (legal, pricing, franchise,
 *          listings, KAZAN …). `to` is the parent page; the label names it.
 */

import { useLocale, useTranslations } from 'next-intl';
import { withLocale, normalizeLocale } from '@/i18n/config';
import home from '@/components/home/v2/homeV2.module.css';
import { BackLink } from '@/components/inner/InnerParts';

export type PageBackTarget = 'home' | 'franchise' | 'sektor' | 'listings';

const PATH: Record<PageBackTarget, string> = {
  home: '/',
  franchise: '/franchise',
  sektor: '/sektor',
  listings: '/ilanlar',
};

export default function PageBack({
  to = 'home',
  className = '',
  band = false,
  inline = false,
}: {
  to?: PageBackTarget;
  className?: string;
  /** Full-width cream strip — when the pill sits outside the page's own background (else the dark body shows). */
  band?: boolean;
  /** Inside an existing padded container — no page-width wrap, no top spacing. */
  inline?: boolean;
}) {
  const t = useTranslations('pageBack');
  const locale = normalizeLocale(useLocale());
  if (inline) {
    return (
      <div className={`${home.tokens} ${className}`} data-back-button>
        <BackLink href={withLocale(locale, PATH[to])} label={t(to)} />
      </div>
    );
  }
  // Vertical spacing sits on the outer box: `.wrap` sets its own padding and would override pt-/py- here.
  return (
    <div className={`${home.tokens} ${band ? 'bg-[#F6F1E9] py-3' : 'pt-4 pb-3'} ${className}`} data-back-button>
      <div className={home.wrap}>
        <BackLink href={withLocale(locale, PATH[to])} label={t(to)} />
      </div>
    </div>
  );
}
