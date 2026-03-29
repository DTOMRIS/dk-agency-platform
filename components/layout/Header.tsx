'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  LogOut,
  Menu,
  X,
  UserRound,
  LayoutGrid,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MegaMenu from '@/components/layout/MegaMenu';
import { clearMemberSession, getGuestSession, readMemberSession, type MemberSession } from '@/lib/member-access';

const locales = ['az', 'tr', 'en'] as const;

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
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]).join('');
  return initials.toUpperCase() || 'M';
}

const navItems = [
  { name: 'Ana səhifə', href: '/', hasMegaMenu: false },
  { name: 'Alətlər', href: '#', hasMegaMenu: true },
  { name: 'İlanlar', href: '/ilanlar', hasMegaMenu: false },
  { name: 'Trendlər', href: '/haberler', hasMegaMenu: false },
  { name: 'Bloq', href: '/blog', hasMegaMenu: false },
  { name: 'İdarə Paneli', href: '/b2b-panel', hasMegaMenu: false },
] as const;

const memberLinks = [
  { label: 'Hesabım', href: '/settings', icon: UserRound },
  { label: 'Elanlarım', href: '/b2b-panel/ilanlarim', icon: LayoutGrid },
] as const;

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [memberSession, setMemberSession] = useState<MemberSession>(getGuestSession());
  const memberMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useCurrentLocale();

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
    setMemberMenuOpen(false);
    setMenuOpen(false);
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (memberMenuRef.current && !memberMenuRef.current.contains(event.target as Node)) {
        setMemberMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    clearMemberSession();
    await fetch('/api/member/session', { method: 'DELETE' });
    setMemberMenuOpen(false);
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
              {locales.map((loc, index) => (
                <span key={loc} className="flex items-center gap-1">
                  {index > 0 ? <span className="text-slate-500">|</span> : null}
                  <Link
                    href={getLocalePath(pathname, loc)}
                    className={currentLocale === loc ? 'font-bold text-white' : 'hover:text-white'}
                  >
                    {loc.toUpperCase()}
                  </Link>
                </span>
              ))}
            </div>
            <span className="text-slate-500">|</span>
            <Link href="/auth/login" className="hover:text-white">
              Üzv girişi
            </Link>
            <span className="text-slate-500">|</span>
            <Link href="/auth/register" className="hover:text-white">
              Abunə ol
            </Link>
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
                  onMouseEnter={() => setMenuOpen(true)}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    type="button"
                    className="inline-block rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                  >
                    {item.name}
                  </button>
                  <MegaMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
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
            {memberSession.loggedIn ? (
              <div className="relative hidden md:block" ref={memberMenuRef}>
                <button
                  type="button"
                  onClick={() => setMemberMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-[var(--dk-navy)]/20 hover:shadow-sm"
                  aria-expanded={memberMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--dk-navy)] text-sm font-bold text-white">
                    {getMemberInitials(memberSession)}
                  </span>
                  <span className="hidden min-w-0 flex-col xl:flex">
                    <span className="max-w-36 truncate text-sm font-semibold text-[var(--dk-navy)]">
                      {memberSession.name || 'Üzv'}
                    </span>
                    <span className="max-w-36 truncate text-xs text-slate-500">{memberSession.email}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition ${memberMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {memberMenuOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
                    >
                      <div className="border-b border-slate-100 bg-slate-50 px-4 py-4">
                        <p className="text-sm font-bold text-[var(--dk-navy)]">
                          {memberSession.name || 'Üzv hesabı'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{memberSession.email}</p>
                      </div>
                      <div className="p-2">
                        {memberLinks.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                              onClick={() => setMemberMenuOpen(false)}
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                <Icon size={16} />
                              </span>
                              {item.label}
                            </Link>
                          );
                        })}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                            <LogOut size={16} />
                          </span>
                          Çıxış
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden text-sm text-slate-500 transition-colors hover:text-[var(--dk-navy)] sm:inline-block"
              >
                Üzv girişi
              </Link>
            )}

            <Link
              href="/ilan-ver"
              className="hidden items-center gap-2 rounded-xl bg-[var(--dk-red)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[var(--dk-red)]/20 active:scale-95 sm:inline-flex"
            >
              Elan ver
              <ArrowRight size={16} />
            </Link>
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

                <div className="my-3 h-px bg-slate-100" />

                {memberSession.loggedIn ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--dk-navy)] text-sm font-bold text-white">
                        {getMemberInitials(memberSession)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[var(--dk-navy)]">
                          {memberSession.name || 'Üzv hesabı'}
                        </p>
                        <p className="truncate text-xs text-slate-500">{memberSession.email}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {memberLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:text-[var(--dk-navy)]"
                            onClick={() => setIsMobileOpen(false)}
                          >
                            <Icon size={16} className="text-slate-400" />
                            {item.label}
                          </Link>
                        );
                      })}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut size={16} />
                        Çıxış
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="rounded-xl p-3 text-base font-medium text-slate-500 transition-colors hover:bg-slate-50"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Üzv girişi
                  </Link>
                )}

                <Link
                  href="/ilan-ver"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] py-3 font-semibold text-white shadow-lg shadow-[var(--dk-red)]/20"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Elan ver
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </>
  );
}
