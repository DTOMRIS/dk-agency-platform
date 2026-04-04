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
      { label: 'Menyu Matrisi', href: '/toolkit/menu-matrix' },
      { label: 'Başabaş', href: '/toolkit/basabas' },
      { label: 'KAZAN AI', href: '/kazan-ai' },
    ],
  },
  {
    title: 'Başla',
    links: [
      { label: 'Açılış Checklist', href: '/toolkit/checklist' },
      { label: 'İnşaatdan Açılışa', href: '/toolkit/insaat-checklist' },
      { label: 'Rəsmi İşlər', href: '/toolkit?stage=basla' },
      { label: 'Məkan Seçimi', href: '/toolkit?stage=basla' },
      { label: 'Menyu Mühəndisliyi', href: '/toolkit/menu-matrix' },
    ],
  },
  {
    title: 'Resurslar',
    links: [
      { label: 'Bloq', href: '/blog' },
      { label: 'Trendlər', href: '/haberler' },
      { label: 'HAP Bilgilər', href: '/blog' },
      { label: 'DK Digest', href: '/haberler' },
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
    <footer className="border-t border-gray-200 bg-[var(--dk-paper)] pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--dk-navy)]">
                <span className="text-xs font-bold text-white">DK</span>
              </div>
              <span className="text-sm font-bold text-slate-900">DK Agency</span>
            </div>
            <p className="max-w-[240px] text-sm leading-relaxed text-gray-500">
              Ustalığın nişanı, dijitalın səddi. Azərbaycanın ilk AI-dəstəkli HoReCa platforması.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900">
                {column.title}
              </h4>
              <ul className="space-y-0">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="block py-1 text-sm text-gray-500 transition-colors hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">&copy; 2026 DK Agency. Bütün hüquqlar qorunur.</p>
          <Link
            href="https://dkagency.az"
            target="_blank"
            className="text-xs font-semibold text-amber-600 transition-colors hover:text-amber-700"
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
      className="group fixed right-8 bottom-8 z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A2E] text-[#C5A022] shadow-2xl shadow-[#1A1A2E]/30"
    >
      <div className="pointer-events-none absolute -top-12 right-0 rounded-xl bg-white px-4 py-2 text-xs font-bold whitespace-nowrap text-slate-900 opacity-0 shadow-xl transition-all group-hover:opacity-100">
        KAZAN AI-ya sual ver!
      </div>
      <Sparkles size={32} fill="currentColor" />
    </motion.button>
  );
}

export default Footer;
