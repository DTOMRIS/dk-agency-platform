'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronLeft,
  CookingPot,
  FilePenLine,
  LayoutDashboard,
  LogOut,
  Newspaper,
  ScrollText,
  Settings,
  Sparkles,
  Store,
  Users,
  Wrench,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { normalizeLocale, stripLocalePrefix, withLocale } from '@/i18n/config';
// Badge counts fetched from API (real DB), not mocks

type NavItemDef = {
  titleKey: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
};

const navItemDefs: NavItemDef[] = [
  { titleKey: 'home', href: '/dashboard', icon: LayoutDashboard },
  { titleKey: 'listings', href: '/dashboard/ilanlar', icon: Store },
  { titleKey: 'hero', href: '/dashboard/hero', icon: FilePenLine },
  { titleKey: 'news', href: '/dashboard/xeberler', icon: Newspaper },
  { titleKey: 'blog', href: '/dashboard/blog', icon: BookOpen },
  { titleKey: 'kazanLeads', href: '/dashboard/kazan-leads', icon: Bot },
  // auditor + invoices(faturalar) + site hidden until backend is real (mock data / no-op save).
  // Re-enable once auditor persistence, invoice API, and site-settings save are implemented.
  { titleKey: 'foodCost', href: '/dashboard/food-cost', icon: CookingPot },
  { titleKey: 'toolkit', href: '/dashboard/toolkit', icon: Wrench },
  { titleKey: 'marketinqOcagi', href: '/dashboard/marketinq-ocagi', icon: Sparkles },
  { titleKey: 'users', href: '/dashboard/users', icon: Users },
  { titleKey: 'funnel', href: '/dashboard/funnel', icon: BarChart3 },
  { titleKey: 'auditLog', href: '/dashboard/audit-logs', icon: ScrollText },
  { titleKey: 'settings', href: '/dashboard/settings', icon: Settings },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ isOpen = true, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('dashboardSidebar');
  const [kazanLeadCount, setKazanLeadCount] = useState<number | null>(null);
  const [pendingListings, setPendingListings] = useState<number>(0);
  const currentLocale = (() => {
    if (typeof document === 'undefined') return normalizeLocale(pathname.split('/')[1]);
    const match = document.cookie.match(/NEXT_LOCALE=(\w+)/);
    return match ? normalizeLocale(match[1]) : normalizeLocale(pathname.split('/')[1]);
  })();
  const strippedPath = stripLocalePrefix(pathname);
  const isActive = (href: string) => strippedPath === href || strippedPath.startsWith(`${href}/`);

  useEffect(() => {
    let cancelled = false;

    async function loadKazanLeadCount() {
      try {
        const response = await fetch('/api/kazan-ai/leads?status=new');
        const payload = (await response.json()) as { data?: Array<unknown> };
        if (!cancelled) {
          setKazanLeadCount(payload.data?.length ?? 0);
        }
      } catch {
        if (!cancelled) {
          setKazanLeadCount(null);
        }
      }
    }

    async function loadPendingListings() {
      try {
        const res = await fetch('/api/listings?scope=admin&status=submitted');
        const data = (await res.json()) as { data?: Array<unknown>; total?: number };
        if (!cancelled) setPendingListings(data.total ?? data.data?.length ?? 0);
      } catch {
        /* ignore */
      }
    }

    void loadKazanLeadCount();
    void loadPendingListings();
    return () => {
      cancelled = true;
    };
  }, []);

  const sidebarItems = useMemo(
    () =>
      navItemDefs.map((item) => ({
        ...item,
        title: t(`nav.${item.titleKey}`),
        badge:
          item.href === '/dashboard/kazan-leads'
            ? (kazanLeadCount ?? undefined)
            : item.href === '/dashboard/ilanlar'
              ? pendingListings || undefined
              : item.badge,
      })),
    [kazanLeadCount, pendingListings, t]
  );

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label={t('closeSidebar')}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-[var(--dk-warm-border)] bg-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-[var(--dk-warm-border)] px-5">
          <Link href={withLocale(currentLocale, '/dashboard')} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--dk-navy)] text-sm font-black text-white shadow-lg shadow-slate-900/15">
              DK
            </div>
            <div>
              <div className="text-sm font-black tracking-wide text-[var(--dk-navy)]">
                {t('panelTitle')}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('adminSubtitle')}
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)] lg:hidden"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="border-b border-[var(--dk-warm-border)] px-5 py-4">
          <div className="rounded-2xl border border-[var(--dk-warm-border)] bg-[var(--dk-paper)] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[var(--dk-navy)]">Doğan Tomris</p>
              <span className="inline-flex rounded-full bg-[var(--dk-gold)]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--dk-gold)]">
                USTA
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{t('userAccess')}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={withLocale(currentLocale, item.href)}
                  className={`group flex items-center gap-3 rounded-2xl border-l-4 px-4 py-3 transition ${
                    active
                      ? 'border-[var(--dk-gold)] bg-amber-50 text-[var(--dk-navy)]'
                      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-[var(--dk-navy)]'
                  }`}
                >
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                      active
                        ? 'bg-white text-[var(--dk-red)] shadow-sm'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="flex-1 text-sm font-semibold">{item.title}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-[var(--dk-red)] px-2.5 py-1 text-[11px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[var(--dk-warm-border)] p-4">
          <div className="mb-3 rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-sm font-bold text-[var(--dk-navy)]">Admin</p>
            <p className="mt-1 text-xs text-slate-500">admin@dkagency.com.tr</p>
          </div>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[var(--dk-red)] hover:text-[var(--dk-red)]"
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
