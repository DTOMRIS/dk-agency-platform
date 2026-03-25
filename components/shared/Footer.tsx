'use client';

import { motion } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, MessageSquare, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-1px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-12 h-12 bg-brand-red rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-red/20 group-hover:rotate-12 transition-transform">
                <span className="text-2xl font-display font-black">DK</span>
              </div>
              <span className="text-2xl font-display font-black tracking-tighter">AGENCY</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium">
              Azərbaycanın ilk və tək HoReCa əməliyyat platforması. Restoranınızı sistemlə idarə edin, işinizi böyüdün.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-brand-red hover:text-white hover:border-brand-red transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-display font-bold mb-8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-red"></div>
              Naviqasiya
            </h4>
            <ul className="space-y-4">
              {['İşini Böyüt', 'Xəbərlər', 'İlanlar', 'Tərəfdaşlar', 'Haqqımızda', 'Əlaqə'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <div className="w-0 h-1px bg-brand-red group-hover:w-4 transition-all"></div>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-display font-bold mb-8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-red"></div>
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
                <span className="text-slate-400 text-sm">+994 50 123 45 67</span>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-red flex-shrink-0">
                  <Mail size={18} />
                </div>
                <span className="text-slate-400 text-sm">info@dkagency.az</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/10 rounded-full blur-2xl"></div>
            <h4 className="text-xl font-display font-bold mb-4">Dəstək lazımdır?</h4>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              KAZAN AI 24/7 suallarınızı cavablandırmağa hazırdır.
            </p>
            <button className="w-full bg-brand-red hover:bg-rose-600 text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-red/20 active:scale-95 flex items-center justify-center gap-2">
              <MessageSquare size={18} /> Chat-a Başla
            </button>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            © 2024 DK AGENCY. Bütün hüquqlar qorunur.
          </p>
          <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Məxfilik</a>
            <a href="#" className="hover:text-white transition-colors">Şərtlər</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Siyasəti</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function KazanAIBot() {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 w-16 h-16 bg-brand-red text-white rounded-2xl shadow-2xl shadow-brand-red/40 flex items-center justify-center z-50 group"
    >
      <div className="absolute -top-12 right-0 bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
        KAZAN AI-ya sual ver! ✨
      </div>
      <Sparkles size={32} fill="currentColor" />
    </motion.button>
  );
}
