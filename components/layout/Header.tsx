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

const locales = ['az', 'tr', 'en'] as const;

const navItems = [
  { name: 'Ana səhifə', href: '/', hasMegaMenu: false },
  { name: 'Alətlər', href: '#', hasMegaMenu: true },
  { name: 'İlanlar', href: '/ilanlar', hasMegaMenu: false },
  { name: 'Sektor Nəbzi', href: '/haberler', hasMegaMenu: false },
  { name: 'Bloq', href: '/blog', hasMegaMenu: false },
  { name: 'İdarə Paneli', href: '/b2b-panel', hasMegaMenu: false },
] as const;

const memberLinks = [
  { label: 'Hesabım', href: '/settings', icon: UserRound },
  { label: 'Elanlarım', href: '/b2b-panel/ilanlarim', icon: LayoutGrid },
] as const;

function useCurrentLocale() {
  const pathname = usePathname();
  const segment = pathname.split('/')[1];
  if (segment === 'tr' || segment === 'en') return segment;
  return 'az';
}

function getLocalePath(pathname: string, newLocale: string) {
  const currentLocale = pathname.split('/')[1];
  const isLocalePrefix = currentLocale === 'tr' || currentLocale === 'en';
  const pathWithoutLocale = isLocalePrefix ? pathname.slice(3) || '/' : pathname;
  if (newLocale === 'az') return pathWithoutLocale;
  return `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
}

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
  const currentLocale = useCurrentLocale();
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
    setIsMobileOpen(false);
    setIsMegaMenuOpen(false);
    setIsUserMenuOpen(false);
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
    router.push('/uzvluk');
  };

  return (
    <>
      <div className="hidden bg-[var(--dk-navy)] md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[var(--dk-gold)]">YENİ:</span>
            <span className="text-slate-300">
              KAZAN AI sektorun AI məsləhətçisi kimi beta mərhələsindədir.
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1">
              {locales.map((locale, index) => (
                <span key={locale} className="flex items-center gap-1">
                  {index > 0 ? <span className="text-slate-500">|</span> : null}
                  <Link
                    href={getLocalePath(pathname, locale)}
                    className={currentLocale === locale ? 'font-bold text-white' : 'hover:text-white'}
                  >
                    {locale.toUpperCase()}
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
                  Daxil ol
                </Link>
                <span className="text-slate-500">|</span>
                <Link href="/auth/register" className="hover:text-white">
                  Üzv ol
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
          <Link href="/" className="group flex items-center gap-2.5">
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
              href="/ilan-ver"
              className="hidden items-center gap-2 rounded-xl bg-[var(--dk-red)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[var(--dk-red)]/20 active:scale-95 sm:inline-flex"
            >
              Elan ver
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
                      Çıxış
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
                  Daxil ol
                </Link>
                <Link
                  href="/auth/register"
                  className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)] sm:inline-block"
                >
                  Üzv ol
                </Link>
              </>
            )}

            <button
              className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-label="Menyu"
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
                    href={item.hasMegaMenu ? '/toolkit' : item.href}
                    className="rounded-xl p-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/ilan-ver"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] py-3 font-semibold text-white shadow-lg shadow-[var(--dk-red)]/20"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Elan ver
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
                      Çıxış
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="rounded-xl p-3 text-base font-medium text-slate-700 transition hover:bg-slate-50"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Daxil ol
                    </Link>
                    <Link
                      href="/auth/register"
                      className="rounded-xl p-3 text-base font-medium text-slate-700 transition hover:bg-slate-50"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Üzv ol
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
