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
  type Locale,
} from '@/i18n/config';
import { clearMemberSession, getGuestSession, readMemberSession, type MemberSession } from '@/lib/member-access';

function getPageTitle(pathname: string) {
  const path = stripLocalePrefix(pathname);
  const segment = path.split('/').filter(Boolean).at(-1) ?? 'dashboard';
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

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

function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();

  return (
    <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-white px-1">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={switchLocalePath(pathname, locale)}
          className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition ${
            currentLocale === locale
              ? 'bg-[var(--dk-navy)] text-white'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          {localeLabels[locale]}
        </Link>
      ))}
    </div>
  );
}

export function DashboardTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('dashboard.topBar');
  const currentLocale = normalizeLocale(pathname.split('/')[1]);
  const [memberSession, setMemberSession] = useState<MemberSession>(getGuestSession());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const unreadCount = 0;

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
    await fetch('/api/member/auth/logout', { method: 'POST' });
    setUserMenuOpen(false);
    router.refresh();
    router.push('/auth/login');
  };

  return (
    <div className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-gray-200 bg-white px-6 lg:flex">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">OCAQ</p>
        <h2 className="text-base font-bold text-gray-950">{getPageTitle(pathname)}</h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t('notifications')}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
        >
          <Bell size={18} />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--dk-red)] px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          ) : null}
        </button>

        <LanguageSwitcher currentLocale={currentLocale} />

        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((open) => !open)}
            className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white pl-1 pr-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--dk-navy)] text-xs font-black text-white">
              {getInitials(memberSession)}
            </span>
            <ChevronDown size={15} />
          </button>

          {userMenuOpen ? (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setUserMenuOpen(false)}
              >
                <UserRound size={16} />
                {t('profile')}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-left text-sm font-semibold text-[var(--dk-red)] hover:bg-red-50"
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
