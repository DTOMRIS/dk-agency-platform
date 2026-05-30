'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Globe, LayoutGrid, LogOut, Menu, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MegaMenu from '@/components/layout/MegaMenu';
import { clearMemberSession, getGuestSession, readMemberSession, type MemberSession } from '@/lib/member-access';
import { localeLabels, locales, normalizeLocale, switchLocalePath, withLocale, type Locale } from '@/i18n/config';

// Inline nav copy — NOT dependent on NextIntlClientProvider (fixes stale locale on client nav)
const NAV_COPY: Record<Locale, Record<string, string>> = {
  az: { home:'Ana səhifə', tools:'Alətlər', listings:'İlanlar', news:'Sektor Nəbzi', blog:'Bloq', panel:'İdarə Paneli', topBadge:'YENİ:', topText:'KAZAN AI sektorun AI məsləhətçisi kimi beta mərhələsindədir.', login:'Daxil ol', register:'Üzv ol', postListing:'Elan ver', account:'Hesabım', myListings:'Elanlarım', logout:'Çıxış', menu:'Menyu' },
  en: { home:'Home', tools:'Tools', listings:'Listings', news:'Sector Pulse', blog:'Blog', panel:'Control Panel', topBadge:'NEW:', topText:'KAZAN AI is in beta as the sector AI advisor.', login:'Sign in', register:'Join', postListing:'Post listing', account:'My account', myListings:'My listings', logout:'Log out', menu:'Menu' },
  ru: { home:'Главная', tools:'Инструменты', listings:'Объявления', news:'Пульс сектора', blog:'Блог', panel:'Панель управления', topBadge:'НОВОЕ:', topText:'KAZAN AI находится в бета-режиме как отраслевой AI-консультант.', login:'Войти', register:'Стать участником', postListing:'Разместить объявление', account:'Мой аккаунт', myListings:'Мои объявления', logout:'Выйти', menu:'Меню' },
  tr: { home:'Ana sayfa', tools:'Araçlar', listings:'İlanlar', news:'Sektör Nabzı', blog:'Blog', panel:'Yönetim Paneli', topBadge:'YENİ:', topText:'KAZAN AI sektörün AI danışmanı olarak beta aşamasındadır.', login:'Giriş yap', register:'Üye ol', postListing:'İlan ver', account:'Hesabım', myListings:'İlanlarım', logout:'Çıkış', menu:'Menü' },
};

function getMemberInitials(session: MemberSession) {
  const source = session.name.trim() || session.email.trim();
  if (!source) return 'M';
  return source.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = normalizeLocale(pathname.split('/')[1]);
  const t = (key: string) => NAV_COPY[currentLocale]?.[key] ?? NAV_COPY.az[key] ?? key;

  const navItems = [
    { name: t('home'), href: withLocale(currentLocale, '/'), hasMegaMenu: false },
    { name: t('tools'), href: '#', hasMegaMenu: true },
    { name: t('listings'), href: withLocale(currentLocale, '/ilanlar'), hasMegaMenu: false },
    { name: t('news'), href: withLocale(currentLocale, '/haberler'), hasMegaMenu: false },
    { name: t('blog'), href: withLocale(currentLocale, '/blog'), hasMegaMenu: false },
    { name: t('panel'), href: withLocale(currentLocale, '/b2b-panel'), hasMegaMenu: false },
  ] as const;

  const memberLinks = [
    { label: t('account'), href: withLocale(currentLocale, '/settings'), icon: UserRound },
    { label: t('myListings'), href: withLocale(currentLocale, '/b2b-panel/ilanlarim'), icon: LayoutGrid },
  ] as const;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [memberSession, setMemberSession] = useState<MemberSession>(getGuestSession());
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const h = () => setIsScrolled(window.scrollY > 10); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  useEffect(() => { const s = () => setMemberSession(readMemberSession()); s(); window.addEventListener('storage', s); window.addEventListener('member-session-updated', s); return () => { window.removeEventListener('storage', s); window.removeEventListener('member-session-updated', s); }; }, []);
  useEffect(() => { const t = window.setTimeout(() => { setIsMobileOpen(false); setIsMegaMenuOpen(false); setIsUserMenuOpen(false); }, 0); return () => window.clearTimeout(t); }, [pathname]);
  useEffect(() => { const h = (e: MouseEvent) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);

  const handleLogout = async () => {
    clearMemberSession();
    await fetch('/api/member/session', { method: 'DELETE' });
    setIsUserMenuOpen(false); setIsMobileOpen(false);
    router.refresh(); router.push(withLocale(currentLocale, '/uzvluk'));
  };

  return (
    <>
      {/* ── Top bar ────────────────────────────────────────── */}
      <div className="hidden bg-[var(--dk-navy)] md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[var(--dk-gold)]">{t('topBadge')}</span>
            <span className="text-slate-300">{t('topText')}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1">
              {locales.map((locale, i) => (
                <span key={locale} className="flex items-center gap-1">
                  {i > 0 && <span className="text-slate-500">|</span>}
                  <Link href={switchLocalePath(pathname, locale)} className={currentLocale === locale ? 'font-bold text-white' : 'hover:text-white'}>
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
                <Link href="/auth/login" className="hover:text-white">{t('login')}</Link>
                <span className="text-slate-500">|</span>
                <Link href="/auth/register" className="hover:text-white">{t('register')}</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main header ────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${isScrolled ? 'border-b border-slate-200/80 shadow-sm' : ''}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link href={withLocale(currentLocale, '/')} className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dk-navy)] text-sm font-bold text-white">DK</div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-[var(--dk-navy)]">DK Agency</span>
              <span className="hidden text-[9px] font-medium tracking-wider text-[var(--dk-gold)] sm:block">USTALIĞIN NİŞANI</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) =>
              item.hasMegaMenu ? (
                <div key={item.name} className="relative" onMouseEnter={() => setIsMegaMenuOpen(true)} onMouseLeave={() => setIsMegaMenuOpen(false)}>
                  <button type="button" className="inline-block rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]">
                    {item.name}
                  </button>
                  <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
                </div>
              ) : (
                <Link key={item.name} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]">
                  {item.name}
                </Link>
              ),
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link href={withLocale(currentLocale, '/ilan-ver')}
              className="hidden items-center gap-2 rounded-xl bg-[var(--dk-gold)] px-5 py-2.5 text-sm font-bold text-[var(--dk-navy)] transition-all hover:opacity-90 active:scale-95 sm:inline-flex">
              {t('postListing')} <ArrowRight size={16} />
            </Link>

            {memberSession.loggedIn ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button type="button" onClick={() => setIsUserMenuOpen((p) => !p)}
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[var(--dk-navy)] shadow-sm transition hover:border-[var(--dk-gold)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--dk-navy)] text-xs font-black text-white">{getMemberInitials(memberSession)}</span>
                  <span className="max-w-[140px] truncate">{memberSession.name || memberSession.email}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    {memberLinks.map((item) => { const Icon = item.icon; return (
                      <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[var(--dk-navy)]">
                        <Icon className="h-4 w-4 text-slate-400" />{item.label}
                      </Link>
                    ); })}
                    <div className="my-2 h-px bg-slate-100" />
                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[var(--dk-red)] transition hover:bg-red-50">
                      <LogOut className="h-4 w-4" />{t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="hidden text-sm text-slate-500 transition-colors hover:text-[var(--dk-navy)] sm:inline-block">{t('login')}</Link>
                <Link href="/auth/register" className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)] sm:inline-block">{t('register')}</Link>
              </>
            )}

            <button className="rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden" onClick={() => setIsMobileOpen((p) => !p)} aria-label={t('menu')}>
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ──────────────────────────────────── */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              className="absolute left-4 right-4 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl lg:hidden">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link key={item.name} href={item.hasMegaMenu ? withLocale(currentLocale, '/toolkit') : item.href}
                    className="rounded-xl p-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                    onClick={() => setIsMobileOpen(false)}>
                    {item.name}
                  </Link>
                ))}
                <Link href={withLocale(currentLocale, '/ilan-ver')}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-gold)] py-3 font-bold text-[var(--dk-navy)]"
                  onClick={() => setIsMobileOpen(false)}>
                  {t('postListing')} <ArrowRight size={16} />
                </Link>
                <div className="my-3 h-px bg-slate-100" />
                <div className="flex items-center gap-2 px-3 py-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <div className="flex items-center gap-1">
                    {locales.map((locale, i) => (
                      <span key={locale} className="flex items-center gap-1">
                        {i > 0 && <span className="text-slate-300">|</span>}
                        <Link href={switchLocalePath(pathname, locale)}
                          className={`rounded-md px-2 py-1 text-sm font-medium transition-colors ${currentLocale === locale ? 'bg-[var(--dk-navy)] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                          onClick={() => setIsMobileOpen(false)}>
                          {localeLabels[locale]}
                        </Link>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="my-3 h-px bg-slate-100" />
                {memberSession.loggedIn ? (
                  <>
                    {memberLinks.map((item) => { const Icon = item.icon; return (
                      <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl p-3 text-base font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setIsMobileOpen(false)}>
                        <Icon className="h-4 w-4 text-slate-400" />{item.label}
                      </Link>
                    ); })}
                    <button type="button" onClick={handleLogout} className="flex items-center gap-3 rounded-xl p-3 text-left text-base font-medium text-[var(--dk-red)] transition hover:bg-red-50">
                      <LogOut className="h-4 w-4" />{t('logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="rounded-xl p-3 text-base font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setIsMobileOpen(false)}>{t('login')}</Link>
                    <Link href="/auth/register" className="rounded-xl p-3 text-base font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setIsMobileOpen(false)}>{t('register')}</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
