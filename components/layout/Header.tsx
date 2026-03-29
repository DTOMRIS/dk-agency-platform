'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MegaMenu from './MegaMenu';

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

const navItems = [
  { name: 'Ana səhifə', href: '/', hasMegaMenu: false },
  { name: 'Alətlər', href: '#', hasMegaMenu: true },
  { name: 'Trendlər', href: '/haberler', hasMegaMenu: false },
  { name: 'Bloq', href: '/blog', hasMegaMenu: false },
  { name: 'İdarə Paneli', href: '/b2b-panel', hasMegaMenu: false },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentLocale = useCurrentLocale();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="hidden bg-[var(--dk-navy)] md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[var(--dk-gold)]">YENİ:</span>
            <span className="text-gray-400">KAZAN AI — sektorun ilk AI danışmanı tezliklə</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              {locales.map((loc, i) => (
                <span key={loc} className="flex items-center gap-1">
                  {i > 0 && <span className="text-gray-600">|</span>}
                  <Link
                    href={getLocalePath(pathname, loc)}
                    className={`transition-colors ${
                      currentLocale === loc ? 'font-bold text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {loc.toUpperCase()}
                  </Link>
                </span>
              ))}
            </div>
            <span className="text-gray-600">|</span>
            <Link href="/auth/login" className="transition-colors hover:text-white">
              Üzv girişi
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/auth/register" className="transition-colors hover:text-white">
              Abunə ol
            </Link>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'border-b border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : ''
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
                    className="inline-block rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-[var(--dk-navy)]"
                  >
                    {item.name}
                  </button>
                  <MegaMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-[var(--dk-navy)]"
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden text-sm text-gray-500 transition-colors hover:text-[var(--dk-navy)] sm:inline-block">
              Üzv girişi
            </Link>
            <Link
              href="/auth/register"
              className="hidden items-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[var(--dk-red)]/20 active:scale-95 sm:inline-flex"
            >
              Pulsuz başla
              <ArrowRight size={16} />
            </Link>

            <button
              className="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-4 right-4 top-full z-50 mt-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="rounded-xl p-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[var(--dk-navy)]"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="my-3 h-px bg-gray-100" />
                <Link
                  href="/auth/login"
                  className="rounded-xl p-3 text-base font-medium text-gray-500 transition-colors hover:bg-gray-50"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Üzv girişi
                </Link>
                <Link
                  href="/auth/register"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] py-3 font-semibold text-white shadow-lg shadow-[var(--dk-red)]/20"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Pulsuz başla
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
