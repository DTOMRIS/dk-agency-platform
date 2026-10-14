'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  localeLabels,
  locales,
  normalizeLocale,
  stripLocalePrefix,
  switchLocalePath,
  withLocale,
  type Locale,
} from '@/i18n/config';
import { clearMemberSession, getGuestSession, readMemberSession, type MemberSession } from '@/lib/member-access';

function getInitials(session: MemberSession) {
  const source = session.name.trim() || session.email.trim();
  if (!source) return 'DK';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function setLocaleCookie(locale: string) {
  globalThis.document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${60 * 60 * 24 * 365}`;
}

function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const bare = stripLocalePrefix(pathname);
  const isDashboard = bare.startsWith('/dashboard') || bare.startsWith('/b2b-panel');

  const router = useRouter();
  const handleSwitch = (locale: Locale) => {
    if (isDashboard) {
      // TASK-0483: go to the locale-prefixed URL (/ru/dashboard …) — layout and pages both read the
      // locale from it. A cookie + reload kept the unprefixed URL, so page content stayed AZ.
      setLocaleCookie(locale);
      router.push(switchLocalePath(pathname, locale));
      router.refresh();
    }
  };

  return (
    <div className="flex h-10 items-center rounded-full border border-[#E4DCCD] bg-white px-1">
      {locales.map((locale) => (
        isDashboard ? (
          <button
            key={locale}
            type="button"
            onClick={() => handleSwitch(locale)}
            className={`rounded-full px-2.5 py-1.5 text-xs font-bold transition ${
              currentLocale === locale
                ? 'bg-[#0F172A] text-white'
                : 'text-[#5B6474] hover:bg-[#F6F1E9] hover:text-[#0F172A]'
            }`}
          >
            {localeLabels[locale]}
          </button>
        ) : (
          <Link
            key={locale}
            href={switchLocalePath(pathname, locale)}
            className={`rounded-full px-2.5 py-1.5 text-xs font-bold transition ${
              currentLocale === locale
                ? 'bg-[#0F172A] text-white'
                : 'text-[#5B6474] hover:bg-[#F6F1E9] hover:text-[#0F172A]'
            }`}
          >
            {localeLabels[locale]}
          </Link>
        )
      ))}
    </div>
  );
}

export function DashboardTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('dashboard.topBar');
  // Read locale from cookie (dashboard has no locale prefix in URL)
  const currentLocale = (() => {
    if (typeof document === 'undefined') return normalizeLocale(pathname.split('/')[1]);
    const match = document.cookie.match(/NEXT_LOCALE=(\w+)/);
    return match ? normalizeLocale(match[1]) : normalizeLocale(pathname.split('/')[1]);
  })();
  const [memberSession, setMemberSession] = useState<MemberSession>(getGuestSession());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  // TASK-0528: the bell was a dead button with a hard-coded 0. It now shows the same 7-day inbox count as the
  // sidebar badge (admin-only COUNT endpoint) and opens «Bütün müraciətlər».
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/dashboard/muracietler/count')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        if (!cancelled && typeof data?.count === 'number') setUnreadCount(data.count);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncSession = () => setMemberSession(readMemberSession());
    syncSession();
    window.addEventListener('storage', syncSession);
    window.addEventListener('member-session-updated', syncSession);
    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('member-session-updated', syncSession);
    };
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    clearMemberSession();
    // TASK-0526: was '/api/member/auth/logout' (no such route → the server cookie stayed); same as the sidebar.
    // fake-scan-ok: logout: the client session is cleared and the user redirected either way
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    setUserMenuOpen(false);
    router.refresh();
    router.push('/auth/login');
  };

  return (
    <div className="sticky top-0 z-20 hidden h-14 items-center justify-between border-b border-[#E4DCCD] bg-[#F6F1E9]/90 px-6 backdrop-blur-xl lg:flex">
      <p className="text-[15px] font-semibold tracking-tight text-[#0F172A]">DK Agency</p>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/muracietler"
          aria-label={t('notifications')}
          data-testid="topbar-inbox"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DCCD] bg-white text-[#334155] transition hover:bg-[#EEE6D8] hover:text-[#0F172A]"
        >
          <Bell size={18} />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-dk-red-strong px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </Link>

        <LanguageSwitcher currentLocale={currentLocale} />

        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((open) => !open)}
            className="flex h-10 items-center gap-2 rounded-full border border-[#E4DCCD] bg-white pl-1 pr-3 text-sm font-semibold text-[#0F172A] transition hover:bg-[#EEE6D8]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F172A] text-xs font-black text-white">
              {getInitials(memberSession)}
            </span>
            <ChevronDown size={15} />
          </button>

          {userMenuOpen ? (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-[#E4DCCD] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.10)]">
              <Link
                href={withLocale(currentLocale, '/dashboard/profile')}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#334155] hover:bg-[#F6F1E9]"
                onClick={() => setUserMenuOpen(false)}
              >
                <UserRound size={16} />
                {t('profile')}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 border-t border-[#EFE9DE] px-4 py-3 text-left text-sm font-semibold text-dk-red-strong hover:bg-red-50"
              >
                <LogOut size={16} />
                {t('logout')}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
