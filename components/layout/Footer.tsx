'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

const footerColumns = [
  {
    title: 'Alətlər',
    links: [
      { label: 'P&L Hesablama', href: '/toolkit/pnl' },
      { label: 'Food Cost', href: '/toolkit/food-cost' },
      { label: 'Menyu Matrisi', href: '/toolkit' },
      { label: 'Başabaş', href: '/toolkit' },
      { label: 'KAZAN AI', href: '/kazan-ai' },
    ],
  },
  {
    title: 'Başla',
    links: [
      { label: 'Açılış Checklist', href: '/toolkit/checklist' },
      { label: 'Rəsmi İşlər', href: '/toolkit' },
      { label: 'Məkan Seçimi', href: '/toolkit' },
      { label: 'Menyu Mühəndisliyi', href: '/toolkit' },
    ],
  },
  {
    title: 'Resurslar',
    links: [
      { label: 'Bloq', href: '/blog' },
      { label: 'Trendlər', href: '/haberler' },
      { label: 'HAP Bilgilər', href: '/blog' },
      { label: 'DK Digest', href: '/news' },
    ],
  },
  {
    title: 'Şirkət',
    links: [
      { label: 'Haqqımızda', href: '/haqqimizda' },
      { label: 'Məsləhət', href: '/elaqe' },
      { label: 'Əlaqə', href: '/elaqe' },
      { label: 'Sədd Rozeti', href: '/haqqimizda' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#FAFAF8] border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#1A1A2E] rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">DK</span>
              </div>
              <span className="text-sm font-bold text-slate-900">DK Agency</span>
            </div>
            <p className="text-sm text-gray-500 max-w-[240px] leading-relaxed">
              Ustalığın nişanı, dijitalın səddi. Azərbaycanın ilk AI-dəstəkli HoReCa platforması.
            </p>
          </div>

          {/* Link Columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-0">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-slate-900 block py-1 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 pt-6 mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            &copy; 2026 DK Agency. Bütün hüquqlar qorunur.
          </p>
          <Link
            href="https://dkagency.az"
            target="_blank"
            className="text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors"
          >
            Powered by DK Agency
          </Link>
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
        KAZAN AI-ya sual ver!
      </div>
      <Sparkles size={32} fill="currentColor" />
    </motion.button>
  );
}

export default Footer;
