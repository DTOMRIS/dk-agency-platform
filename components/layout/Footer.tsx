'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import FloatingKazanWidget from '@/components/kazan-ai/FloatingKazanWidget';
import { normalizeLocale, withLocale, type Locale } from '@/i18n/config';

const footerCopy: Record<Locale, {
  slogan: string;
  columns: Array<{ title: string; links: Array<{ label: string; href: string; localized?: boolean }> }>;
  rights: string;
  poweredBy: string;
}> = {
  az: {
    slogan: 'Ustalığın nişanı, dijitalın şəddi. Azərbaycanın ilk AI-dəstəkli HoReCa platforması.',
    columns: [
      { title: 'Alətlər', links: [{ label: 'P&L Hesablama', href: '/toolkit/pnl', localized: true }, { label: 'Food Cost', href: '/toolkit/food-cost', localized: true }, { label: 'Menyu Matrisi', href: '/toolkit/menu-matrix', localized: true }, { label: 'Başabaş', href: '/toolkit/basabas', localized: true }, { label: 'KAZAN AI', href: '/kazan-ai', localized: true }] },
      { title: 'Başla', links: [{ label: 'Açılış Checklist', href: '/toolkit/checklist', localized: true }, { label: 'İnşaatdan Açılışa', href: '/toolkit/insaat-checklist', localized: true }, { label: 'Rəsmi İşlər', href: '/toolkit/aqta-checklist', localized: true }, { label: 'Məkan Seçimi', href: '/blog/mekan-secimi', localized: true }, { label: 'Menyu Mühəndisliyi', href: '/toolkit/menu-matrix', localized: true }] },
      { title: 'Resurslar', links: [{ label: 'Bloq', href: '/blog', localized: true }, { label: 'Sektor Nəbzi', href: '/haberler', localized: true }, { label: 'İlanlar', href: '/ilanlar', localized: true }, { label: 'Toolkit', href: '/toolkit', localized: true }] },
      { title: 'Şirkət', links: [{ label: 'Haqqımızda', href: '/haqqimizda', localized: true }, { label: 'Məsləhət', href: '/elaqe', localized: true }, { label: 'Əlaqə', href: '/elaqe', localized: true }, { label: 'ŞEDD Rozeti', href: '/sedd-rozeti', localized: true }] },
    ],
    rights: 'Bütün hüquqlar qorunur.',
    poweredBy: 'Powered by DK Agency',
  },
  ru: {
    slogan: 'Знак мастерства, цифровой ŞEDD. Первая AI-платформа для HoReCa в Азербайджане.',
    columns: [
      { title: 'Инструменты', links: [{ label: 'P&L калькулятор', href: '/toolkit/pnl', localized: true }, { label: 'Food Cost', href: '/toolkit/food-cost', localized: true }, { label: 'Матрица меню', href: '/toolkit/menu-matrix', localized: true }, { label: 'Точка безубыточности', href: '/toolkit/basabas', localized: true }, { label: 'KAZAN AI', href: '/kazan-ai', localized: true }] },
      { title: 'Старт', links: [{ label: 'Чеклист открытия', href: '/toolkit/checklist', localized: true }, { label: 'От стройки до запуска', href: '/toolkit/insaat-checklist', localized: true }, { label: 'Официальные процедуры', href: '/toolkit/aqta-checklist', localized: true }, { label: 'Выбор локации', href: '/blog/mekan-secimi', localized: true }, { label: 'Инженерия меню', href: '/toolkit/menu-matrix', localized: true }] },
      { title: 'Ресурсы', links: [{ label: 'Блог', href: '/blog', localized: true }, { label: 'Пульс сектора', href: '/haberler', localized: true }, { label: 'Объявления', href: '/ilanlar', localized: true }, { label: 'Toolkit', href: '/toolkit', localized: true }] },
      { title: 'Компания', links: [{ label: 'О нас', href: '/haqqimizda', localized: true }, { label: 'Консультация', href: '/elaqe', localized: true }, { label: 'Контакты', href: '/elaqe', localized: true }, { label: 'ŞEDD Badge', href: '/sedd-rozeti', localized: true }] },
    ],
    rights: 'Все права защищены.',
    poweredBy: 'Powered by DK Agency',
  },
  en: {
    slogan: "The mark of mastery, the digital ŞEDD. Azerbaijan's first AI-powered HoReCa platform.",
    columns: [
      { title: 'Tools', links: [{ label: 'P&L Calculator', href: '/toolkit/pnl', localized: true }, { label: 'Food Cost', href: '/toolkit/food-cost', localized: true }, { label: 'Menu Matrix', href: '/toolkit/menu-matrix', localized: true }, { label: 'Break-even', href: '/toolkit/basabas', localized: true }, { label: 'KAZAN AI', href: '/kazan-ai', localized: true }] },
      { title: 'Start', links: [{ label: 'Opening Checklist', href: '/toolkit/checklist', localized: true }, { label: 'From Construction to Opening', href: '/toolkit/insaat-checklist', localized: true }, { label: 'Compliance', href: '/toolkit/aqta-checklist', localized: true }, { label: 'Location Choice', href: '/blog/mekan-secimi', localized: true }, { label: 'Menu Engineering', href: '/toolkit/menu-matrix', localized: true }] },
      { title: 'Resources', links: [{ label: 'Blog', href: '/blog', localized: true }, { label: 'Sector Pulse', href: '/haberler', localized: true }, { label: 'Listings', href: '/ilanlar', localized: true }, { label: 'Toolkit', href: '/toolkit', localized: true }] },
      { title: 'Company', links: [{ label: 'About', href: '/haqqimizda', localized: true }, { label: 'Consulting', href: '/elaqe', localized: true }, { label: 'Contact', href: '/elaqe', localized: true }, { label: 'ŞEDD Badge', href: '/sedd-rozeti', localized: true }] },
    ],
    rights: 'All rights reserved.',
    poweredBy: 'Powered by DK Agency',
  },
  tr: {
    slogan: 'Ustalığın nişanı, dijitalin ŞEDD’i. Azerbaycan’ın ilk AI destekli HoReCa platformu.',
    columns: [
      { title: 'Araçlar', links: [{ label: 'P&L Hesaplama', href: '/toolkit/pnl', localized: true }, { label: 'Food Cost', href: '/toolkit/food-cost', localized: true }, { label: 'Menü Matrisi', href: '/toolkit/menu-matrix', localized: true }, { label: 'Başabaş', href: '/toolkit/basabas', localized: true }, { label: 'KAZAN AI', href: '/kazan-ai', localized: true }] },
      { title: 'Başla', links: [{ label: 'Açılış Checklist', href: '/toolkit/checklist', localized: true }, { label: 'İnşaattan Açılışa', href: '/toolkit/insaat-checklist', localized: true }, { label: 'Resmi İşler', href: '/toolkit/aqta-checklist', localized: true }, { label: 'Mekan Seçimi', href: '/blog/mekan-secimi', localized: true }, { label: 'Menü Mühendisliği', href: '/toolkit/menu-matrix', localized: true }] },
      { title: 'Kaynaklar', links: [{ label: 'Blog', href: '/blog', localized: true }, { label: 'Sektör Nabzı', href: '/haberler', localized: true }, { label: 'İlanlar', href: '/ilanlar', localized: true }, { label: 'Toolkit', href: '/toolkit', localized: true }] },
      { title: 'Şirket', links: [{ label: 'Hakkımızda', href: '/haqqimizda', localized: true }, { label: 'Danışmanlık', href: '/elaqe', localized: true }, { label: 'İletişim', href: '/elaqe', localized: true }, { label: 'ŞEDD Rozeti', href: '/sedd-rozeti', localized: true }] },
    ],
    rights: 'Tüm hakları saklıdır.',
    poweredBy: 'Powered by DK Agency',
  },
};

export function Footer() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = footerCopy[locale];

  return (
    <footer className="border-t border-gray-200 bg-[var(--dk-paper)] pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--dk-navy)]">
                <span className="text-xs font-bold text-white">DK</span>
              </div>
              <span className="text-sm font-bold text-slate-900">DK Agency</span>
            </div>
            <p className="max-w-[240px] text-sm leading-relaxed text-gray-500">{copy.slogan}</p>
          </div>

          {copy.columns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900">
                {column.title}
              </h4>
              <ul className="space-y-0">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.localized ? withLocale(locale, link.href) : link.href}
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
          <p className="text-xs text-gray-400">&copy; 2026 DK Agency. {copy.rights}</p>
          <Link
            href="https://dkagency.az"
            target="_blank"
            className="text-xs font-semibold text-amber-600 transition-colors hover:text-amber-700"
          >
            {copy.poweredBy}
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
