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
  Handshake,
  Inbox,
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
  Truck,
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
      { titleKey: 'ads', href: '/dashboard/reklamlar', icon: Megaphone },
    ],
  },
  {
    titleKey: 'leads',
    items: [
      // TASK-0521: every inbound lead in one list (listing inquiries, clicks, KAZAN, franchise, newsletter).
      { titleKey: 'inbox', href: '/dashboard/muracietler', icon: Inbox },
      { titleKey: 'kazanLeads', href: '/dashboard/kazan-leads', icon: Bot },
      { titleKey: 'franchiseLeads', href: '/dashboard/franchise-leads', icon: Handshake },
      { titleKey: 'contactTracking', href: '/dashboard/contact-tracking', icon: MessageCircle },
      // TASK-0498: WhatsApp qruplarından təchizatçı bazası + alıcı tələbləri (admin-only, şəxsi məlumat).
      { titleKey: 'supplyBase', href: '/dashboard/techizatcilar', icon: Truck },
      { titleKey: 'funnel', href: '/dashboard/funnel', icon: BarChart3 },
      // marketinqOcagi: üzv alətlərinin hub-ı — TASK-0458-dən üzv panelindədir (dashboard admin-only).
      { titleKey: 'marketinqOcagi', href: '/b2b-panel/marketinq-ocagi', icon: Sparkles },
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
  const [inboxCount, setInboxCount] = useState<number>(0);
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
      // fake-scan-ok: logout: the client session is cleared and the user redirected either way
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
        // TASK-0526: the same «pending» as the listings page (stats.pending = shared status list), not just `submitted`.
        const res = await fetch('/api/listings?scope=admin&limit=1');
        const data = (await res.json()) as { stats?: { pending?: number } };
        if (!cancelled) setPendingListings(data.stats?.pending ?? 0);
      } catch {
        /* ignore */
      }
    }

    // TASK-0521: all inbound items of the last 7 days (admin-only COUNT endpoint).
    async function loadInboxCount() {
      try {
        const res = await fetch('/api/dashboard/muracietler/count');
        if (!res.ok) return;
        const data = (await res.json()) as { count?: number };
        if (!cancelled) setInboxCount(data.count ?? 0);
      } catch {
        /* ignore */
      }
    }

    void loadKazanLeadCount();
    void loadPendingListings();
    void loadInboxCount();
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
              : item.href === '/dashboard/muracietler'
                ? inboxCount || undefined
                : item.badge,
      })),
    [kazanLeadCount, pendingListings, inboxCount, t]
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
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-[#E4DCCD] bg-[#FBF8F3] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-[#E4DCCD] px-5">
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
              <div className="text-sm font-black tracking-wide text-[#0F172A]">
                {t('panelTitle')}
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DCCD] bg-white text-[#0F172A] transition hover:bg-[#F6F1E9] lg:hidden"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
          <div className="space-y-5">
            {navSections.map((section) => (
              <div key={section.titleKey ?? 'home'}>
                {section.titleKey ? (
                  <div className="mb-1.5 px-4 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-[#5B6474]">
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
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                          active ? 'bg-[#0F172A] text-white' : 'text-[#334155] hover:bg-[#EEE6D8] hover:text-[#0F172A]'
                        }`}
                      >
                        <Icon size={18} className={active ? 'text-white' : 'text-[#5B6474] group-hover:text-[#0F172A]'} aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{title}</span>
                        {badge ? (
                          <span className="min-w-[22px] rounded-full bg-dk-red-strong px-2 py-0.5 text-center text-[11px] font-bold text-white">
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

        <div className="border-t border-[#E4DCCD] p-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-full border border-[#E4DCCD] bg-white px-4 py-3 text-sm font-semibold text-[#334155] transition hover:border-dk-red-strong hover:text-dk-red-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
