'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Menu, X, ArrowRight, Globe } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [readerCount, setReaderCount] = useState(142);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const interval = setInterval(() => {
      setReaderCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { name: 'İşini Böyüt', href: '/#grow' },
    { name: 'Xəbərlər', href: '/news' },
    { name: 'İlanlar', href: '/#ads' },
    { name: 'Tərəfdaşlar', href: '/#partners' },
    { name: 'Haqqımızda', href: '/#about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'py-3 px-4' : 'py-6 px-4'
      }`}
    >
      <div className={`max-w-6xl mx-auto transition-all duration-500 rounded-2xl ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl border border-slate-200 shadow-lg shadow-slate-200/50 px-6 py-2' : 'bg-transparent px-0 py-0'
      }`}>
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-red/20 group-hover:scale-105 transition-transform">
              DK
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-brand-red"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className={`font-display font-bold text-lg leading-tight transition-colors ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
                DK AGENCY
              </h1>
              <p className={`text-[9px] font-bold uppercase tracking-[0.2em] opacity-60 transition-colors ${isScrolled ? 'text-slate-600' : 'text-slate-300'}`}>
                HoReCa Ecosystem
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:bg-slate-100/50 ${
                  isScrolled ? 'text-slate-600 hover:text-brand-red' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
              isScrolled ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-white/10 bg-white/5 text-white/80'
            }`}>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{readerCount} LIVE</span>
            </div>
            
            <button className={`p-2 rounded-xl transition-all ${isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
              <Globe size={18} />
            </button>

            <button className="hidden sm:flex items-center gap-2 bg-brand-red text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-brand-red/20">
              Üzv ol <ArrowRight size={16} />
            </button>

            <button
              className={`lg:hidden p-2 rounded-xl transition-all ${isScrolled ? 'text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="lg:hidden absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 overflow-hidden"
        >
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-base font-bold text-slate-900 p-3 rounded-xl hover:bg-slate-50 hover:text-brand-red transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="h-px bg-slate-100 my-2"></div>
            <button className="w-full bg-brand-red text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-red/20">
              Üzv ol
            </button>
          </div>
        </motion.div>
      )}
    </header>
  );
}
