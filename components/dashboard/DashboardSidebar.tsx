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
  ClipboardCheck,
  FilePenLine,
  Handshake,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageCircle,
  Newspaper,
  PieChart,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Tags,
  UserCheck,
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

type NavSectionDef = {
  /** `dashboardSidebar.sections.*` açarı; `null` = başlıqsız (ana səhifə) */
  titleKey: string | null;
  items: NavItemDef[];
};

/**
 * TASK-0444: 34 route-dan 13-ü menyuda idi, 21-i yalnız ünvanla açılırdı.
 * Sahib qərarı: saxta (hardcoded) 14 səhifə silindi, real data ilə işləyən
 * 8 səhifə menyuya girdi. 20 link düz siyahıda oxunmur, ona görə bölmələr.
 * `settings` boş stub idi — silindi, əsl ayarlar `ayarlar`-dır.
 */
const navSections: NavSectionDef[] = [
  {
    titleKey: null,
    items: [{ titleKey: 'home', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    titleKey: 'content',
    items: [
      { titleKey: 'listings', href: '/dashboard/ilanlar', icon: Store },
      { titleKey: 'news', href: '/dashboard/xeberler', icon: Newspaper },
      { titleKey: 'blog', href: '/dashboard/blog', icon: BookOpen },
      { titleKey: 'hero', href: '/dashboard/hero', icon: FilePenLine },
      { titleKey: 'ads', href: '/dashboard/reklamlar', icon: Megaphone },
    ],
  },
  {
    titleKey: 'leads',
    items: [
      { titleKey: 'kazanLeads', href: '/dashboard/kazan-leads', icon: Bot },
      { titleKey: 'franchiseLeads', href: '/dashboard/franchise-leads', icon: Handshake },
      { titleKey: 'contactTracking', href: '/dashboard/contact-tracking', icon: MessageCircle },
      { titleKey: 'funnel', href: '/dashboard/funnel', icon: BarChart3 },
      // marketinqOcagi: public /marketinq/* alətlərinin geri döndüyü kanonik hub.
      { titleKey: 'marketinqOcagi', href: '/dashboard/marketinq-ocagi', icon: Sparkles },
    ],
  },
  {
    titleKey: 'finance',
    items: [
      { titleKey: 'invoices', href: '/dashboard/faturalar', icon: Receipt },
      { titleKey: 'invoiceCategories', href: '/dashboard/fatura-kateqoriyalar', icon: Tags },
      { titleKey: 'foodCost', href: '/dashboard/food-cost', icon: PieChart },
    ],
  },
  {
    titleKey: 'quality',
    items: [
      { titleKey: 'auditor', href: '/dashboard/auditor', icon: ShieldCheck },
      { titleKey: 'aqtaChecklist', href: '/dashboard/aqta-checklist', icon: ClipboardCheck },
    ],
  },
  {
    titleKey: 'members',
    items: [
      { titleKey: 'users', href: '/dashboard/users', icon: Users },
      { titleKey: 'profileApprovals', href: '/dashboard/profil-onay', icon: UserCheck },
    ],
  },
  {
    titleKey: 'system',
    items: [
      { titleKey: 'auditLog', href: '/dashboard/audit-logs', icon: ScrollText },
      { titleKey: 'settings', href: '/dashboard/ayarlar', icon: Settings },
    ],
  },
];

const navItemDefs: NavItemDef[] = navSections.flatMap((section) => section.items);

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
  const itemMeta = useMemo(
    () =>
      new Map(sidebarItems.map((item) => [item.href, { title: item.title, badge: item.badge }])),
    [sidebarItems]
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
          <div className="space-y-5">
            {navSections.map((section) => (
              <div key={section.titleKey ?? 'home'}>
                {section.titleKey ? (
                  <div className="mb-1.5 px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
                    {t(`sections.${section.titleKey}`)}
                  </div>
                ) : null}
                <div className="space-y-1.5">
                  {section.items.map((def) => {
                    // Başlıq və badge memo-dan (real API sayğacları), ikon/href def-dən.
                    const meta = itemMeta.get(def.href);
                    const title = meta?.title ?? t(`nav.${def.titleKey}`);
                    const badge = meta?.badge;
                    const Icon = def.icon;
                    const active = isActive(def.href);
                    return (
                      <Link
                        key={def.href}
                        href={withLocale(currentLocale, def.href)}
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
                        <span className="flex-1 text-sm font-semibold">{title}</span>
                        {badge ? (
                          <span className="rounded-full bg-[var(--dk-red)] px-2.5 py-1 text-[11px] font-bold text-white">
                            {badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
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
