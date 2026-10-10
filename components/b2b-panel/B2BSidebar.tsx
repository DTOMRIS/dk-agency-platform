'use client';

import { Suspense, startTransition, useEffect, useState } from 'react';
import Link from 'next/link';
import PortalEngagementTracker from '@/components/analytics/PortalEngagementTracker';
import DkMark from '@/components/brand/DkMark';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  FileSpreadsheet,
  Bell,
  Briefcase,
  Building2,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  Shield,
  Sparkles,
  Receipt,
  Star,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  highlight?: boolean;
  badge?: number;
  pro?: boolean;
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    titleKey: 'sectionGeneral',
    items: [
      { href: '/b2b-panel', labelKey: 'dashboard', icon: LayoutDashboard },
      { href: '/b2b-panel/ilanlarim', labelKey: 'myListings', icon: FileText },
      { href: '/b2b-panel/yeni-ilan', labelKey: 'newListing', icon: Plus, highlight: true },
    ],
  },
  {
    titleKey: 'sectionCommunication',
    items: [
      { href: '/b2b-panel/teklifler', labelKey: 'incomingOffers', icon: Briefcase },
      { href: '/b2b-panel/mesajlar', labelKey: 'messages', icon: MessageSquare },
      { href: '/b2b-panel/bildirimler', labelKey: 'notifications', icon: Bell },
    ],
  },
  {
    titleKey: 'sectionTools',
    items: [
      { href: '/b2b-panel/toolkit', labelKey: 'toolkit', icon: Wrench, pro: true },
      // TASK-0532: DK Excel templates (members download free).
      { href: '/toolkit/excel-sablonlar', labelKey: 'excelTemplates', icon: FileSpreadsheet },
      { href: '/b2b-panel/faturalar', labelKey: 'invoices', icon: Receipt },
      { href: '/b2b-panel/favoriler', labelKey: 'favorites', icon: Star },
      { href: '/b2b-panel/analizler', labelKey: 'aiAnalysis', icon: Sparkles },
      { href: '/b2b-panel/marketinq-ocagi', labelKey: 'marketingHub', icon: Megaphone },
    ],
  },
  {
    titleKey: 'sectionAccount',
    items: [
      { href: '/b2b-panel/profil', labelKey: 'companyProfile', icon: Building2 },
      { href: '/b2b-panel/ayarlar', labelKey: 'settings', icon: Settings },
      { href: '/b2b-panel/destek', labelKey: 'support', icon: HelpCircle },
    ],
  },
];

function getProfileFromStorage(): { logo?: string; form?: { companyName?: string } } | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('dk_company_profile') || 'null');
  } catch {
    return null;
  }
}

function CompanyLogo() {
  const [logo, setLogo] = useState<string | null>(null);
  useEffect(() => {
    const stored = getProfileFromStorage()?.logo || null;
    startTransition(() => setLogo(stored));
  }, []);
  if (logo)
    return (
      <img
        src={logo}
        alt="Logo"
        className="h-12 w-12 rounded-xl object-cover border border-slate-200"
      />
    );
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400 shadow-sm">
      <Building2 size={22} />
    </div>
  );
}

function CompanyName() {
  const [name, setName] = useState('Mənim Şirkətim');
  useEffect(() => {
    const stored = getProfileFromStorage()?.form?.companyName || 'Mənim Şirkətim';
    startTransition(() => setName(stored));
  }, []);
  return <p className="truncate text-sm font-semibold text-slate-900">{name}</p>;
}

export default function B2BSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('dashboard.sidebar');
  const [loggingOut, setLoggingOut] = useState(false);
  const [plan, setPlan] = useState<'admin' | 'member' | 'free' | null>(null);
  const [completion, setCompletion] = useState<number | null>(null);
  // TASK-0506: telefonda sidebar gizlidir, üst bardakı düymə ilə açılır (dashboard ilə eyni desen).
  // Əvvəl 288px sidebar 390px ekranda həmişə açıq idi, məzmuna ~100px qalırdı.
  // Açıldığı səhifə yadda saxlanır: başqa səhifəyə keçəndə menyu özü bağlanır (effektsiz).
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const mobileOpen = openedOn === pathname;
  const setMobileOpen = (open: boolean) => setOpenedOn(open ? pathname : null);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/member/session')
      .then((r) => r.json())
      .then((d: { session?: { plan?: string } }) => {
        if (cancelled) return;
        const p = d.session?.plan;
        setPlan(p === 'admin' || p === 'member' ? p : 'free');
      })
      .catch(() => {
        if (!cancelled) setPlan('free');
      });
    fetch('/api/user/profile')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { profileCompletion?: number }) => {
        if (!cancelled)
          setCompletion(typeof d.profileCompletion === 'number' ? d.profileCompletion : 0);
      })
      .catch(() => {
        if (!cancelled) setCompletion(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // TASK-0535: highlight = signed-in account (member/admin); the label below says what it really is.
  const isPremium = plan === 'member' || plan === 'admin';
  const pct = completion ?? 0;

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // fake-scan-ok: logout: the client session is cleared and the user redirected either way
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* ignore — clear client state regardless */
    }
    router.push('/auth/login');
    router.refresh();
  }

  const isActive = (href: string) => {
    if (href === '/b2b-panel') return pathname === '/b2b-panel';
    return pathname.startsWith(href);
  };

  return (
    <>
      <Suspense fallback={null}>
        <PortalEngagementTracker />
      </Suspense>
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-[#E4DCCD] bg-[#F6F1E9] px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label={t('mobileOpenMenu')}
          aria-expanded={mobileOpen}
          data-testid="b2b-mobile-menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DCCD] bg-white text-[#0F172A]"
        >
          <Menu size={20} />
        </button>
        <Link href="/b2b-panel" aria-label="DK Agency">
          <DkMark size="sm" withName />
        </Link>
      </div>

      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        data-testid="b2b-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-[#E4DCCD] bg-[#FBF8F3] transition-transform duration-300 lg:sticky lg:top-[68px] lg:z-20 lg:h-[calc(100vh-68px)] lg:translate-x-0 xl:top-[76px] xl:h-[calc(100vh-76px)] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between border-b border-[#E4DCCD] p-5 lg:hidden">
          <Link href="/b2b-panel" aria-label="DK Agency">
            <DkMark withName subtitle="B2B Portal" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label={t('mobileCloseMenu')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E4DCCD] bg-white text-slate-700 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-[#E4DCCD] p-4">
          <div className="rounded-2xl border border-[#E4DCCD] bg-white p-4">
            <div className="flex items-center gap-3">
              <CompanyLogo />
              <div className="min-w-0 flex-1">
                <CompanyName />
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Shield size={10} className={isPremium ? 'text-amber-500' : 'text-slate-400'} />
                  <span
                    className={`text-[10px] font-semibold uppercase ${
                      isPremium ? 'text-amber-600' : 'text-slate-500'
                    }`}
                  >
                    {/* TASK-0535: no paid plan is live — a registered member is «Üzv», not «PREMIUM». */}
                    {plan === 'admin' ? t('adminPlan') : plan === 'member' ? t('memberPlan') : t('freePlan')}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 border-t border-[#EFE9DE] pt-3">
              <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>{t('profileCompletion')}</span>
                <span className="font-medium text-slate-900">
                  {completion === null ? '—' : `${pct}%`}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#EFE9DE]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-dk-red to-dk-red-strong transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.titleKey} className={idx > 0 ? 'mt-6' : ''}>
              <p className="mb-2 px-3 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                {t(section.titleKey)}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-[#FDECEF] font-bold text-[#BE2F47]'
                            : item.highlight
                              ? 'border border-dashed border-emerald-300 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
                              : 'text-slate-700 hover:bg-[#F6F1E9] hover:text-slate-900'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                            active
                              ? 'bg-white text-[#D63B54] ring-1 ring-[#F4B8C3]'
                              : item.highlight
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-white text-slate-500 ring-1 ring-[#EFE9DE] group-hover:text-slate-800'
                          }`}
                        >
                          <Icon size={15} />
                        </div>
                        <span className="flex-1">{t(item.labelKey)}</span>
                        {item.badge ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              active ? 'bg-[#D63B54] text-white' : 'bg-[#EFE9DE] text-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                        {item.pro && !active ? (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-amber-700">
                            {t('premium')}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4">
          <div className="rounded-2xl bg-[#0F172A] p-4 text-white">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-300" />
              <span className="text-sm font-bold">{t('kazanAiTitle')}</span>
            </div>
            <p className="mb-3 text-xs text-slate-300">{t('kazanAiDesc')}</p>
            <Link
              href="/kazan-ai"
              className="block w-full rounded-full bg-dk-red-strong py-2 text-center text-xs font-bold text-white transition-colors hover:bg-dk-red-deep"
            >
              {t('kazanAiCta')}
            </Link>
          </div>
        </div>

        <div className="border-t border-[#E4DCCD] p-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition-all hover:bg-[#F6F1E9] hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-[#EFE9DE]">
              <LogOut size={15} />
            </div>
            <span className="text-sm font-medium">{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
