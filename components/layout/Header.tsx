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
  { name: 'Ana səhifə', href: '/', hasMegaMenu: true },
  { name: 'Trendlər', href: '/haberler', hasMegaMenu: false },
  { name: 'Bloq', href: '/blog', hasMegaMenu: false },
  { name: 'İdarə Paneli', href: '/dashboard', hasMegaMenu: false },
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
      {/* Utility Bar */}
      <div className="hidden md:block bg-[#1A1A2E]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#C5A022] font-bold">YENİ:</span>
            <span className="text-gray-400">
              KAZAN AI — sektorun ilk AI danışmanı tezliklə
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              {locales.map((loc, i) => (
                <span key={loc} className="flex items-center gap-1">
                  {i > 0 && <span className="text-gray-600">|</span>}
                  <Link
                    href={getLocalePath(pathname, loc)}
                    className={`transition-colors ${
                      currentLocale === loc
                        ? 'text-white font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {loc.toUpperCase()}
                  </Link>
                </span>
              ))}
            </div>
            <span className="text-gray-600">|</span>
            <Link href="/auth/login" className="hover:text-white transition-colors">
              Üzv girişi
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/auth/register" className="hover:text-white transition-colors">
              Abunə ol
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 bg-white ${
          isScrolled
            ? 'border-b border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
            : ''
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-[#1A1A2E] rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">
              DK
            </div>
            <span className="text-[#1A1A2E] text-base font-bold">
              DK Agency
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) =>
              item.hasMegaMenu ? (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setMenuOpen(true)}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-gray-500 hover:text-[#1A1A2E] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors inline-block"
                  >
                    {item.name}
                  </Link>
                  <MegaMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-[#1A1A2E] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:inline-block text-sm text-gray-500 hover:text-[#1A1A2E] transition-colors"
            >
              Üzv girişi
            </Link>
            <Link
              href="/auth/register"
              className="hidden sm:inline-flex items-center gap-2 bg-[#E94560] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#E94560]/20 transition-all active:scale-95"
            >
              Pulsuz başla
              <ArrowRight size={16} />
            </Link>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 z-50"
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-base font-medium text-gray-700 p-3 rounded-xl hover:bg-gray-50 hover:text-[#1A1A2E] transition-colors"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="h-px bg-gray-100 my-3" />
                <Link
                  href="/auth/login"
                  className="text-base font-medium text-gray-500 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Üzv girişi
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center gap-2 w-full bg-[#E94560] text-white py-3 rounded-xl font-semibold shadow-lg shadow-[#E94560]/20 mt-2"
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
