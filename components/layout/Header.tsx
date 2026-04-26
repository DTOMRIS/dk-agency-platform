'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  LayoutGrid,
  LogOut,
  Menu,
  UserRound,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MegaMenu from '@/components/layout/MegaMenu';
import {
  clearMemberSession,
  getGuestSession,
  readMemberSession,
  type MemberSession,
} from '@/lib/member-access';
import { localeLabels, locales, normalizeLocale, switchLocalePath, withLocale, type Locale } from '@/i18n/config';

const headerCopy: Record<Locale, {
  nav: { home: string; tools: string; listings: string; news: string; blog: string; panel: string };
  topBadge: string;
  topText: string;
  login: string;
  register: string;
  postListing: string;
  account: string;
  myListings: string;
  logout: string;
  menu: string;
}> = {
  az: {
    nav: { home: 'Ana səhifə', tools: 'Alətlər', listings: 'İlanlar', news: 'Sektor Nəbzi', blog: 'Bloq', panel: 'İdarə Paneli' },
    topBadge: 'YENİ:',
    topText: 'KAZAN AI sektorun AI məsləhətçisi kimi beta mərhələsindədir.',
    login: 'Daxil ol',
    register: 'Üzv ol',
    postListing: 'Elan ver',
    account: 'Hesabım',
    myListings: 'Elanlarım',
    logout: 'Çıxış',
    menu: 'Menyu',
  },
  ru: {
    nav: { home: 'Главная', tools: 'Инструменты', listings: 'Объявления', news: 'Пульс сектора', blog: 'Блог', panel: 'Панель управления' },
    topBadge: 'НОВОЕ:',
    topText: 'KAZAN AI находится в бета-режиме как отраслевой AI-консультант.',
    login: 'Войти',
    register: 'Стать участником',
    postListing: 'Разместить объявление',
    account: 'Мой аккаунт',
    myListings: 'Мои объявления',
    logout: 'Выйти',
    menu: 'Меню',
  },
  en: {
    nav: { home: 'Home', tools: 'Tools', listings: 'Listings', news: 'Sector Pulse', blog: 'Blog', panel: 'Control Panel' },
    topBadge: 'NEW:',
    topText: 'KAZAN AI is in beta as the sector AI advisor.',
    login: 'Sign in',
    register: 'Join',
    postListing: 'Post listing',
    account: 'My account',
    myListings: 'My listings',
    logout: 'Log out',
    menu: 'Menu',
  },
  tr: {
    nav: { home: 'Ana sayfa', tools: 'Araçlar', listings: 'İlanlar', news: 'Sektör Nabzı', blog: 'Blog', panel: 'Yönetim Paneli' },
    topBadge: 'YENİ:',
    topText: 'KAZAN AI sektörün AI danışmanı olarak beta aşamasındadır.',
    login: 'Giriş yap',
    register: 'Üye ol',
    postListing: 'İlan ver',
    account: 'Hesabım',
    myListings: 'İlanlarım',
    logout: 'Çıkış',
    menu: 'Menü',
  },
};

function getMemberInitials(session: MemberSession) {
  const source = session.name.trim() || session.email.trim();
  if (!source) return 'M';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = normalizeLocale(pathname.split('/')[1]);
  const copy = headerCopy[currentLocale];
  const navItems = [
    { name: copy.nav.home, href: withLocale(currentLocale, '/'), hasMegaMenu: false },
    { name: copy.nav.tools, href: '#', hasMegaMenu: true },
    { name: copy.nav.listings, href: withLocale(currentLocale, '/ilanlar'), hasMegaMenu: false },
    { name: copy.nav.news, href: withLocale(currentLocale, '/haberler'), hasMegaMenu: false },
    { name: copy.nav.blog, href: withLocale(currentLocale, '/blog'), hasMegaMenu: false },
    { name: copy.nav.panel, href: withLocale(currentLocale, '/b2b-panel'), hasMegaMenu: false },
  ] as const;
  const memberLinks = [
    { label: copy.account, href: withLocale(currentLocale, '/settings'), icon: UserRound },
    { label: copy.myListings, href: withLocale(currentLocale, '/b2b-panel/ilanlarim'), icon: LayoutGrid },
  ] as const;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [memberSession, setMemberSession] = useState<MemberSession>(getGuestSession());
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    const timer = window.setTimeout(() => {
      setIsMobileOpen(false);
      setIsMegaMenuOpen(false);
      setIsUserMenuOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    clearMemberSession();
    await fetch('/api/member/session', { method: 'DELETE' });
    setIsUserMenuOpen(false);
    setIsMobileOpen(false);
    router.refresh();
    router.push(withLocale(currentLocale, '/uzvluk'));
  };

  return (
    <>
      <div className="hidden bg-[var(--dk-navy)] md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[var(--dk-gold)]">{copy.topBadge}</span>
            <span className="text-slate-300">{copy.topText}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1">
              {locales.map((locale, index) => (
                <span key={locale} className="flex items-center gap-1">
                  {index > 0 ? <span className="text-slate-500">|</span> : null}
                  <Link
                    href={switchLocalePath(pathname, locale)}
                    className={currentLocale === locale ? 'font-bold text-white' : 'hover:text-white'}
                  >
                    {localeLabels[locale]}
                  </Link>
                </span>
              ))}
            </div>
            <span className="text-slate-500">|</span>
            {memberSession.loggedIn ? (
              <span className="text-white">{memberSession.name || memberSession.email}</span>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-white">
                  {copy.login}
                </Link>
                <span className="text-slate-500">|</span>
                <Link href="/auth/register" className="hover:text-white">
                  {copy.register}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : ''
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href={withLocale(currentLocale, '/')} className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dk-navy)] text-sm font-bold text-white">
              DK
            </div>
            <span className="text-base font-bold text-[var(--dk-navy)]">DK Agency</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) =>
              item.hasMegaMenu ? (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setIsMegaMenuOpen(true)}
                  onMouseLeave={() => setIsMegaMenuOpen(false)}
                >
                  <button
                    type="button"
                    className="inline-block rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                  >
                    {item.name}
                  </button>
                  <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                >
                  {item.name}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={withLocale(currentLocale, '/ilan-ver')}
              className="hidden items-center gap-2 rounded-xl bg-[var(--dk-red)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[var(--dk-red)]/20 active:scale-95 sm:inline-flex"
            >
              {copy.postListing}
              <ArrowRight size={16} />
            </Link>

            {memberSession.loggedIn ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[var(--dk-navy)] shadow-sm transition hover:border-[var(--dk-gold)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--dk-navy)] text-xs font-black text-white">
                    {getMemberInitials(memberSession)}
                  </span>
                  <span className="max-w-[140px] truncate">{memberSession.name || memberSession.email}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {isUserMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    {memberLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                        >
                          <Icon className="h-4 w-4 text-slate-400" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <div className="my-2 h-px bg-slate-100" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[var(--dk-red)] transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {copy.logout}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden text-sm text-slate-500 transition-colors hover:text-[var(--dk-navy)] sm:inline-block"
                >
                  {copy.login}
                </Link>
                <Link
                  href="/auth/register"
                  className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)] sm:inline-block"
                >
                  {copy.register}
                </Link>
              </>
            )}

            <button
              className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-label={copy.menu}
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-4 right-4 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.hasMegaMenu ? withLocale(currentLocale, '/toolkit') : item.href}
                    className="rounded-xl p-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href={withLocale(currentLocale, '/ilan-ver')}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] py-3 font-semibold text-white shadow-lg shadow-[var(--dk-red)]/20"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {copy.postListing}
                  <ArrowRight size={16} />
                </Link>
                <div className="my-3 h-px bg-slate-100" />
                {memberSession.loggedIn ? (
                  <>
                    {memberLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 rounded-xl p-3 text-base font-medium text-slate-700 transition hover:bg-slate-50"
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <Icon className="h-4 w-4 text-slate-400" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 rounded-xl p-3 text-left text-base font-medium text-[var(--dk-red)] transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {copy.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="rounded-xl p-3 text-base font-medium text-slate-700 transition hover:bg-slate-50"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {copy.login}
                    </Link>
                    <Link
                      href="/auth/register"
                      className="rounded-xl p-3 text-base font-medium text-slate-700 transition hover:bg-slate-50"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {copy.register}
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </>
  );
}
