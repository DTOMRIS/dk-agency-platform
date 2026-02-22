// components/layout/Header.tsx
// DK Agency — Global Header (Dark Theme)
// Sticky nav, gold logo, E94560 CTA

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Navigation items
const navItems = [
  { href: '/', label: 'Ana Səhifə' },
  { href: '/haberler', label: 'TQTA Jurnal' },
  { href: '/b2b-panel', label: 'B2B Panel' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${isScrolled 
          ? 'bg-[#1A1A2E]/95 backdrop-blur-md shadow-lg border-b border-[#8892B015]' 
          : 'bg-[#1A1A2E]'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A022] to-[#E94560] flex items-center justify-center">
              <span className="text-[#0A0A1A] font-black text-lg">DK</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-[#EAEAEA] font-bold text-lg">DK Agency</span>
              <span className="hidden md:inline text-[#8892B0] text-sm ml-2">
                | TQTA Media
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'text-[#C5A022] bg-[#C5A02215]' 
                      : 'text-[#B0B8C8] hover:text-[#EAEAEA] hover:bg-[#8892B010]'}
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            {/* CTA Button */}
            <Link
              href="/auth/register"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E94560] text-white text-sm font-semibold hover:bg-[#C5A022] transition-colors"
            >
              <span>Abunə ol</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#B0B8C8] hover:text-[#EAEAEA] hover:bg-[#8892B010]"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-300
          ${isMobileMenuOpen ? 'max-h-96 border-t border-[#8892B015]' : 'max-h-0'}
        `}
      >
        <nav className="px-4 py-4 space-y-1 bg-[#1A1A2E]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'text-[#C5A022] bg-[#C5A02215]' 
                    : 'text-[#B0B8C8] hover:text-[#EAEAEA] hover:bg-[#8892B010]'}
                `}
              >
                {item.label}
              </Link>
            );
          })}
          
          {/* Mobile CTA */}
          <Link
            href="/auth/register"
            className="block mt-4 px-4 py-3 rounded-full bg-[#E94560] text-white text-center text-sm font-semibold hover:bg-[#C5A022] transition-colors"
          >
            Abunə ol
          </Link>
        </nav>
      </div>
    </header>
  );
}
