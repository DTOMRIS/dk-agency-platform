'use client';

import { useState, useEffect } from 'react';
import { Search, Menu, X, Monitor, Flame, ChevronDown, Tv, Mic2, Globe, Calendar, FolderOpen, MoreHorizontal, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { usePathname } from 'next/navigation';

export default function HospitalityHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const mainCategories = [
    'Technology', 'Sales & Marketing', 'Development', 'Human Resources', 'Markets & Performance', 'Finance', 'Sustainability'
  ];

  const featureLinks = [
    { name: 'AI in Hospitality', icon: <Zap size={14} className="text-brand-red" /> },
    { name: 'TV', icon: <Tv size={14} /> },
    { name: 'Podcast', icon: <Mic2 size={14} /> },
    { name: 'World Panel', icon: <Globe size={14} /> },
    { name: 'Events', icon: <Calendar size={14} /> },
    { name: 'Directories', icon: <FolderOpen size={14} /> },
  ];

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Following', href: '/following' },
    { name: 'News', href: '/news' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-100 z-50 sticky top-0">
      {/* Top Bar: Logo, Search, Actions */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex justify-between items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 flex-shrink-0 group">
          <div className="bg-brand-red text-white font-black px-1.5 py-0.5 rounded-sm text-xl italic transform -skew-x-6 group-hover:scale-105 transition-transform">
            HN
          </div>
          <span className="text-slate-900 font-black text-xl tracking-tighter hidden sm:block lowercase">hospitalitynet</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-full pl-11 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-red/20 transition-all"
          />
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
            <Monitor size={20} />
          </button>
          <button className="hidden md:flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">
            <Flame size={14} className="text-brand-red" />
            Contribute your Content
          </button>
          <button className="bg-brand-red text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-rose-600 transition-all shadow-lg shadow-brand-red/10">
            Sign In
          </button>
          <button 
            className="lg:hidden p-2 text-slate-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="hidden lg:block border-t border-slate-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Left: Nav Links */}
          <div className="flex items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className={`px-4 py-3 text-xs font-bold transition-all border-b-2 ${
                  pathname === link.href 
                    ? 'text-slate-900 border-brand-red' 
                    : 'text-slate-500 border-transparent hover:text-slate-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Middle: Categories */}
          <div className="flex items-center gap-1 border-l border-slate-100 ml-4 pl-4">
            {mainCategories.map((cat) => (
              <Link 
                key={cat}
                href={`/news?cat=${cat.toLowerCase()}`} 
                className="px-3 py-3 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                {cat}
              </Link>
            ))}
            <button className="flex items-center gap-1 px-3 py-3 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
              More Topics <ChevronDown size={12} />
            </button>
          </div>

          {/* Right: Feature Links */}
          <div className="flex items-center gap-1 border-l border-slate-100 ml-auto pl-4">
            {featureLinks.map((link) => (
              <Link 
                key={link.name}
                href="#" 
                className="flex items-center gap-2 px-3 py-3 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                {link.icon}
                <span className="hidden xl:inline">{link.name}</span>
              </Link>
            ))}
            <button className="flex items-center gap-1 px-3 py-3 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
              <MoreHorizontal size={14} />
              <span className="hidden xl:inline">More</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {mainCategories.map((cat) => (
                <Link 
                  key={cat} 
                  href={`/news?cat=${cat.toLowerCase()}`}
                  className="block text-lg font-bold text-slate-900 hover:text-brand-red"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
