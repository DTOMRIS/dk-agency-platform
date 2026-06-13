'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PortalEngagementTracker from '@/components/analytics/PortalEngagementTracker';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronLeft,
  FilePenLine,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Newspaper,
  ScrollText,
  Settings,
  Sparkles,
  Store,
  Users,
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
  { titleKey: 'ads', href: '/dashboard/reklamlar', icon: Megaphone },
  { titleKey: 'kazanLeads', href: '/dashboard/kazan-leads', icon: Bot },
  // auditor + invoices(faturalar) + site hidden until backend is real (mock data / no-op save).
  // foodCost + toolkit are MEMBER tools — they live in the B2B portal
  // (/b2b-panel/toolkit), not the admin panel.
  // marketinqOcagi stays: it is the canonical hub the public /marketinq/* tools
  // (and b2b-panel/analizler) link back to, not a member-only tool.
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
  const router = useRouter();
  const t = useTranslations('dashboardSidebar');
  const [kazanLeadCount, setKazanLeadCount] = useState<number | null>(null);
  const [pendingListings, setPendingListings] = useState<number>(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const currentLocale = (() => {
    if (typeof document === 'undefined') return normalizeLocale(pathname.split('/')[1]);
    const match = document.cookie.match(/NEXT_LOCALE=(\w+)/);
    return match ? normalizeLocale(match[1]) : normalizeLocale(pathname.split('/')[1]);
  })();
  const strippedPath = stripLocalePrefix(pathname);
  const isActive = (href: string) => strippedPath === href || strippedPath.startsWith(`${href}/`);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* ignore — clear client state regardless */
    }
    router.push(withLocale(currentLocale, '/auth/login'));
    router.refresh();
  }

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
      <Suspense fallback={null}>
        <PortalEngagementTracker />
      </Suspense>
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
            <Image
              src="/images/logo-mobil.png"
              alt="DK Agency"
              width={44}
              height={44}
              priority
              className="h-11 w-11 shrink-0 rounded-2xl object-contain"
            />
            <div className="flex flex-col">
              <div className="text-sm font-black tracking-wide text-[var(--dk-navy)]">
                {t('panelTitle')}
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
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[var(--dk-red)] hover:text-[var(--dk-red)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
