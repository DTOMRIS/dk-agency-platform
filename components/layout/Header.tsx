'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, ClipboardCheck, FileText, Globe, LayoutGrid, LogOut, Menu, PieChart, Radar, UserRound, Wand2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MegaMenu from '@/components/layout/MegaMenu';
import { clearMemberSession, getGuestSession, readMemberSession, type MemberSession } from '@/lib/member-access';
import { localeLabels, locales, normalizeLocale, switchLocalePath, withLocale, type Locale } from '@/i18n/config';

// Inline nav copy — NOT dependent on NextIntlClientProvider (fixes stale locale on client nav)
const NAV_COPY: Record<Locale, Record<string, string>> = {
  az: { home:'Ana səhifə', tools:'Alətlər', franchise:'Franchise', listings:'İlanlar', news:'Sektor Nəbzi', blog:'Bloq', resources:'Resurslar', aboutUs:'Haqqımızda', panel:'İdarə Paneli', topBadge:'YENİ:', topText:'KAZAN AI sektorun AI məsləhətçisi kimi beta mərhələsindədir.', login:'Daxil ol', register:'Üzv ol', postListing:'Elan ver', account:'Hesabım', myListings:'Elanlarım', logout:'Çıxış', menu:'Menyu', frReadiness:'Hazırlıq Testi', frRoi:'ROI Kalkulyatoru', frBuyer:'Alıcı Çek-listi', frBook:'AI Françbuk', frRadar:'Franchise Radar' },
  en: { home:'Home', tools:'Tools', franchise:'Franchise', listings:'Listings', news:'Sector Pulse', blog:'Blog', resources:'Resources', aboutUs:'About Us', panel:'Control Panel', topBadge:'NEW:', topText:'KAZAN AI is in beta as the sector AI advisor.', login:'Sign in', register:'Join', postListing:'Post listing', account:'My account', myListings:'My listings', logout:'Log out', menu:'Menu', frReadiness:'Readiness Test', frRoi:'ROI Calculator', frBuyer:'Buyer Checklist', frBook:'AI Franchbook', frRadar:'Franchise Radar' },
  ru: { home:'Главная', tools:'Инструменты', franchise:'Франшиза', listings:'Объявления', news:'Пульс сектора', blog:'Блог', resources:'Ресурсы', aboutUs:'О нас', panel:'Панель управления', topBadge:'НОВОЕ:', topText:'KAZAN AI находится в бета-режиме как отраслевой AI-консультант.', login:'Войти', register:'Стать участником', postListing:'Разместить объявление', account:'Мой аккаунт', myListings:'Мои объявления', logout:'Выйти', menu:'Меню', frReadiness:'Тест готовности', frRoi:'ROI Калькулятор', frBuyer:'Чек-лист покупателя', frBook:'AI Франчбук', frRadar:'Franchise Radar' },
  tr: { home:'Ana sayfa', tools:'Araçlar', franchise:'Franchise', listings:'İlanlar', news:'Sektör Nabzı', blog:'Blog', resources:'Kaynaklar', aboutUs:'Hakkımızda', panel:'Yönetim Paneli', topBadge:'YENİ:', topText:'KAZAN AI sektörün AI danışmanı olarak beta aşamasındadır.', login:'Giriş yap', register:'Üye ol', postListing:'İlan ver', account:'Hesabım', myListings:'İlanlarım', logout:'Çıkış', menu:'Menü', frReadiness:'Hazırlık Testi', frRoi:'ROI Hesaplayıcı', frBuyer:'Alıcı Kontrol Listesi', frBook:'AI Franchise Kitabı', frRadar:'Franchise Radar' },
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

  const franchiseLinks = [
    { icon: Radar, label: t('frRadar'), href: withLocale(currentLocale, '/franchise/radar') },
    { icon: ClipboardCheck, label: t('frReadiness'), href: withLocale(currentLocale, '/franchise/hazirliq-testi') },
    { icon: PieChart, label: t('frRoi'), href: withLocale(currentLocale, '/franchise/roi-kalkulyatoru') },
    { icon: FileText, label: t('frBuyer'), href: withLocale(currentLocale, '/franchise/alici-cheklisti') },
    { icon: Wand2, label: t('frBook'), href: withLocale(currentLocale, '/franchise/francbuk-generatoru'), beta: true },
  ] as const;

  const resourceLinks = [
    { label: t('blog'), href: withLocale(currentLocale, '/blog') },
    { label: t('news'), href: withLocale(currentLocale, '/haberler') },
  ] as const;

  const memberLinks = [
    { label: t('account'), href: withLocale(currentLocale, '/settings'), icon: UserRound },
    { label: t('myListings'), href: withLocale(currentLocale, '/b2b-panel/ilanlarim'), icon: LayoutGrid },
  ] as const;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isFranchiseOpen, setIsFranchiseOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isMobileFranchiseOpen, setIsMobileFranchiseOpen] = useState(false);
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [memberSession, setMemberSession] = useState<MemberSession>(getGuestSession());
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: t('tools'), href: '#', type: 'mega' },
    { name: t('franchise'), href: '#', type: 'franchise' },
    { name: t('listings'), href: withLocale(currentLocale, '/ilanlar'), type: 'link' },
    { name: t('resources'), href: '#', type: 'resources' },
    { name: t('aboutUs'), href: withLocale(currentLocale, '/haqqimizda'), type: 'link' },
    ...(memberSession.loggedIn ? [{ name: t('panel'), href: withLocale(currentLocale, '/b2b-panel'), type: 'link' }] : []),
  ];

  useEffect(() => { const h = () => setIsScrolled(window.scrollY > 10); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  useEffect(() => { const s = () => setMemberSession(readMemberSession()); s(); window.addEventListener('storage', s); window.addEventListener('member-session-updated', s); return () => { window.removeEventListener('storage', s); window.removeEventListener('member-session-updated', s); }; }, []);
  useEffect(() => { const t = window.setTimeout(() => { setIsMobileOpen(false); setIsMegaMenuOpen(false); setIsFranchiseOpen(false); setIsMobileFranchiseOpen(false); setIsUserMenuOpen(false); }, 0); return () => window.clearTimeout(t); }, [pathname]);
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href={withLocale(currentLocale, '/')} className="group flex items-center gap-2.5">
            <img src="/images/logo-mobil.png" alt="DK Agency Logo" className="h-9 w-9 shrink-0 object-contain" />
            <div className="flex flex-col">
              <span className="text-base font-bold text-[var(--dk-navy)]">DK Agency</span>
              <span className="hidden text-[9px] font-medium tracking-wider text-[var(--dk-gold)] sm:block">USTALIĞIN NİŞANI</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1">
            {navItems.map((item) => {
              if (item.type === 'mega') {
                return (
                  <div key={item.name} className="relative" onMouseEnter={() => setIsMegaMenuOpen(true)} onMouseLeave={() => setIsMegaMenuOpen(false)}>
                    <button type="button" onClick={() => setIsMegaMenuOpen((p) => !p)} className="inline-block rounded-lg px-2 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)] xl:px-3">
                      {item.name}
                    </button>
                    <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
                  </div>
                );
              }
              if (item.type === 'franchise') {
                return (
                  <div key={item.name} className="relative" onMouseEnter={() => setIsFranchiseOpen(true)} onMouseLeave={() => setIsFranchiseOpen(false)}>
                    <button type="button" onClick={() => setIsFranchiseOpen((p) => !p)} className={`inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)] xl:px-3 ${pathname.includes('/franchise') ? 'text-[var(--dk-navy)] font-bold' : 'text-slate-500'}`}>
                      {item.name} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isFranchiseOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isFranchiseOpen && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                          className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 rounded-2xl border border-[var(--dk-border-soft)] bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                          {franchiseLinks.map((fl) => {
                            const Icon = fl.icon;
                            const isActive = pathname.includes(fl.href.split('/').pop() || '');
                            return (
                              <Link key={fl.href} href={fl.href} onClick={() => setIsFranchiseOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-slate-50 ${isActive ? 'bg-slate-50 font-bold text-[var(--dk-navy)]' : 'text-slate-600'}`}>
                                <Icon className="h-4 w-4 text-[var(--dk-gold)]" />
                                <span className="flex-1">{fl.label}</span>
                                {'beta' in fl && fl.beta && <span className="rounded-full bg-[var(--dk-gold)]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--dk-gold)]">BETA</span>}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              if (item.type === 'resources') {
                return (
                  <div key={item.name} className="relative" onMouseEnter={() => setIsResourcesOpen(true)} onMouseLeave={() => setIsResourcesOpen(false)}>
                    <button type="button" onClick={() => setIsResourcesOpen((p) => !p)} className={`inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)] xl:px-3 ${pathname.includes('/blog') || pathname.includes('/haberler') ? 'text-[var(--dk-navy)] font-bold' : 'text-slate-500'}`}>
                      {item.name} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isResourcesOpen && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                          className="absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                          {resourceLinks.map((rl) => (
                            <Link key={rl.href} href={rl.href} onClick={() => setIsResourcesOpen(false)}
                              className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[var(--dk-navy)]">
                              {rl.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              return (
                <Link key={item.name} href={item.href} className="rounded-lg px-2 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)] xl:px-3">
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link href={withLocale(currentLocale, '/ilan-ver')}
              className="hidden items-center gap-2 rounded-xl bg-[var(--dk-gold)] px-4 py-2.5 text-sm font-bold text-[var(--dk-navy)] transition-all hover:opacity-90 active:scale-95 lg:inline-flex xl:px-5">
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
              className="absolute left-3 right-3 top-full z-50 mt-2 max-h-[calc(100vh-88px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:left-4 sm:right-4 sm:p-6 lg:hidden">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  if (item.type === 'franchise') {
                    return (
                      <div key={item.name}>
                        <button type="button"
                          className={`flex w-full items-center justify-between rounded-xl p-3 text-base font-medium transition-colors hover:bg-slate-50 ${pathname.includes('/franchise') ? 'text-[var(--dk-navy)] font-bold' : 'text-slate-700'}`}
                          onClick={() => setIsMobileFranchiseOpen((p) => !p)}>
                          {item.name}
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isMobileFranchiseOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isMobileFranchiseOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                              className="overflow-hidden">
                              <div className="ml-3 flex flex-col gap-0.5 border-l-2 border-[var(--dk-gold)]/30 pl-3 pb-2">
                                {franchiseLinks.map((fl) => {
                                  const Icon = fl.icon;
                                  return (
                                    <Link key={fl.href} href={fl.href}
                                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                                      onClick={() => setIsMobileOpen(false)}>
                                      <Icon className="h-4 w-4 text-[var(--dk-gold)]" />
                                      <span className="flex-1">{fl.label}</span>
                                      {'beta' in fl && fl.beta && <span className="rounded-full bg-[var(--dk-gold)]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--dk-gold)]">BETA</span>}
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }
                  if (item.type === 'resources') {
                    return (
                      <div key={item.name}>
                        <button type="button"
                          className={`flex w-full items-center justify-between rounded-xl p-3 text-base font-medium transition-colors hover:bg-slate-50 ${pathname.includes('/blog') || pathname.includes('/haberler') ? 'text-[var(--dk-navy)] font-bold' : 'text-slate-700'}`}
                          onClick={() => setIsMobileResourcesOpen((p) => !p)}>
                          {item.name}
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isMobileResourcesOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isMobileResourcesOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                              className="overflow-hidden">
                              <div className="ml-3 flex flex-col gap-0.5 border-l-2 border-slate-200 pl-3 pb-2">
                                {resourceLinks.map((rl) => (
                                  <Link key={rl.href} href={rl.href}
                                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                    onClick={() => setIsMobileOpen(false)}>
                                    {rl.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }
                  return (
                    <Link key={item.name} href={item.type === 'mega' ? withLocale(currentLocale, '/toolkit') : item.href}
                      className="rounded-xl p-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                      onClick={() => setIsMobileOpen(false)}>
                      {item.name}
                    </Link>
                  );
                })}
                <Link href={withLocale(currentLocale, '/blog')}
                  className="rounded-xl p-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                  onClick={() => setIsMobileOpen(false)}>
                  {t('blog')}
                </Link>
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
