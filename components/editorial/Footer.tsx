'use client';

import { motion } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, MessageSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/haberler', label: 'Xəbərlər' },
  { href: '/b2b-panel', label: 'İlanlar' },
  { href: '/terefdashlar', label: 'Tərəfdaşlar' },
  { href: '/haqqimizda', label: 'Haqqımızda' },
  { href: '/elaqe', label: 'Əlaqə' },
];

const socialLinks = [
  { Icon: Facebook, href: 'https://facebook.com/dkagency.az', label: 'Facebook' },
  { Icon: Instagram, href: 'https://instagram.com/dkagency.az', label: 'Instagram' },
  { Icon: Linkedin, href: 'https://linkedin.com/company/dkagency', label: 'LinkedIn' },
  { Icon: Twitter, href: 'https://twitter.com/dkagency_az', label: 'Twitter' },
];

export function EditorialFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="editorial-footer bg-slate-950 text-white pt-24 pb-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-brand-red rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-red/20 group-hover:rotate-12 transition-transform">
                <span className="text-2xl font-display font-black">DK</span>
              </div>
              <span className="text-2xl font-display font-black tracking-tighter">AGENCY</span>
            </Link>
            <p className="text-slate-400 leading-relaxed font-medium">
              Azərbaycanın ilk və tək HoReCa əməliyyat platforması. Restoranınızı sistemlə idarə edin, işinizi böyüdün.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-brand-red hover:text-white hover:border-brand-red transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-display font-bold mb-8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-red" />
              Naviqasiya
            </h4>
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <div className="w-0 h-px bg-brand-red group-hover:w-4 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-display font-bold mb-8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-red" />
              Əlaqə
            </h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-red flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <span className="text-slate-400 text-sm leading-relaxed">Bakı ş., Nərimanov r., <br /> Əhməd Rəcəbli küç. 25</span>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-red flex-shrink-0">
                  <Phone size={18} />
                </div>
                <a href="tel:+994501234567" className="text-slate-400 text-sm hover:text-white transition-colors">+994 50 123 45 67</a>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-red flex-shrink-0">
                  <Mail size={18} />
                </div>
                <a href="mailto:info@dkagency.az" className="text-slate-400 text-sm hover:text-white transition-colors">info@dkagency.az</a>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/10 rounded-full blur-2xl" />
            <h4 className="text-xl font-display font-bold mb-4 leading-tight">Dəstək lazımdır?</h4>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              KAZAN AI 24/7 suallarınızı cavablandırmağa hazırdır.
            </p>
            <Link href="/kazan-ai" className="w-full bg-brand-red hover:bg-rose-600 text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-red/20 active:scale-95 flex items-center justify-center gap-2">
              <MessageSquare size={18} /> Chat-a Başla
            </Link>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">&copy; {currentYear} DK AGENCY. Bütün hüquqlar qorunur.</p>
          <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-white transition-colors">Məxfilik</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Şərtlər</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookie Siyasəti</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function KazanAIBot() {
  return (
    <Link href="/kazan-ai">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-brand-red text-white rounded-2xl shadow-2xl shadow-brand-red/40 flex items-center justify-center z-50 group cursor-pointer"
      >
        <div className="absolute -top-12 right-0 bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
          KAZAN AI-ya sual ver!
        </div>
        <Sparkles size={32} fill="currentColor" />
      </motion.div>
    </Link>
  );
}
