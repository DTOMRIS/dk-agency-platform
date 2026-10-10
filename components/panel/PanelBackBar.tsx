'use client';

/**
 * @file PanelBackBar.tsx
 * @purpose TASK-0530 (naviqasiya qanunu — hər səhifədə geri düyməsi; system map: 30 panel page without one).
 *          One back control for both panels, mounted once in each panel layout above the page: on any page
 *          below the panel home it links one level up (/dashboard/blog/new → /dashboard/blog,
 *          /b2b-panel/ayarlar → /b2b-panel). Hidden on the panel home itself. Visible on every screen size
 *          (the admin top bar is desktop-only).
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { normalizeLocale, stripLocalePrefix, withLocale } from '@/i18n/config';

export default function PanelBackBar({ root, className = '' }: { root: '/dashboard' | '/b2b-panel'; className?: string }) {
  const t = useTranslations('panelBack');
  const locale = normalizeLocale(useLocale());
  const bare = stripLocalePrefix(usePathname()).replace(/\/+$/, '') || '/';

  if (bare === root || !bare.startsWith(`${root}/`)) return null;

  const parent = bare.slice(0, bare.lastIndexOf('/')) || root;
  const toHome = parent === root;

  return (
    <div className={className}>
      <Link
        href={withLocale(locale, parent)}
        data-back-button
        data-testid="panel-back"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        {toHome ? t('toPanel') : t('back')}
      </Link>
    </div>
  );
}
