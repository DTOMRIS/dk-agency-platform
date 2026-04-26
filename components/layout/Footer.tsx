'use client';

import Link from 'next/link';
import FloatingKazanWidget from '@/components/kazan-ai/FloatingKazanWidget';

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
      { label: 'Rəsmi İşlər', href: '/toolkit/aqta-checklist' },
      { label: 'Məkan Seçimi', href: '/blog/mekan-secimi' },
      { label: 'Menyu Mühəndisliyi', href: '/toolkit/menu-matrix' },
    ],
  },
  {
    title: 'Resurslar',
    links: [
      { label: 'Bloq', href: '/blog' },
      { label: 'Sektor Nəbzi', href: '/haberler' },
      { label: 'İlanlar', href: '/ilanlar' },
      { label: 'Toolkit', href: '/toolkit' },
    ],
  },
  {
    title: 'Şirkət',
    links: [
      { label: 'Haqqımızda', href: '/haqqimizda' },
      { label: 'Məsləhət', href: '/elaqe' },
      { label: 'Əlaqə', href: '/elaqe' },
      { label: 'Şədd Rozeti', href: '/sedd-rozeti' },
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
            <p className="max-w-[240px] text-sm leading-relaxed text-gray-500 mb-6">
              Ustalığın nişanı, dijitalın şəddi. Azərbaycanın ilk AI-dəstəkli HoReCa platforması.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <a href="tel:+994502566279" className="hover:text-slate-900 transition-colors">Tel: +994 50 256 62 79</a>
              <a href="mailto:info@dkagency.com.tr" className="hover:text-slate-900 transition-colors">info@dkagency.com.tr</a>
              <a href="https://t.me/dkagency" target="_blank" rel="noopener noreferrer" className="text-[var(--dk-gold)] font-medium hover:text-[#a08018] transition-colors">KAZAN Telegram</a>
            </div>
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
  return <FloatingKazanWidget />;
}

export default Footer;
