'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import FloatingKazanWidget from '@/components/kazan-ai/FloatingKazanWidget';
import { normalizeLocale, withLocale } from '@/i18n/config';

export function Footer() {
  const t = useTranslations('footer');
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);

  const columns = [
    { title: t('colTools'), links: [
      { label: t('toolPnl'), href: '/toolkit/pnl' },
      { label: t('toolFoodCost'), href: '/toolkit/food-cost' },
      { label: t('toolMenuMatrix'), href: '/toolkit/menu-matrix' },
      { label: t('toolBasabas'), href: '/toolkit/basabas' },
      { label: t('toolKazanAi'), href: '/kazan-ai' },
    ]},
    { title: t('colStart'), links: [
      { label: t('startChecklist'), href: '/toolkit/checklist' },
      { label: t('startInsaat'), href: '/toolkit/insaat-checklist' },
      { label: t('startAqta'), href: '/toolkit/aqta-checklist' },
      { label: t('startLocation'), href: '/blog/mekan-secimi' },
      { label: t('startMenu'), href: '/toolkit/menu-matrix' },
    ]},
    { title: t('colResources'), links: [
      { label: t('resBlog'), href: '/blog' },
      { label: t('resNews'), href: '/haberler' },
      { label: t('resListings'), href: '/ilanlar' },
      { label: t('resToolkit'), href: '/toolkit' },
    ]},
    { title: t('colCompany'), links: [
      { label: t('compAbout'), href: '/haqqimizda' },
      { label: t('compConsulting'), href: '/elaqe' },
      { label: t('compContact'), href: '/elaqe' },
      { label: t('compSedd'), href: '/sedd-rozeti' },
    ]},
  ];

  const legalLinks = [
    { label: t('legalPrivacy'), href: '/privacy' },
    { label: t('legalTerms'), href: '/terms' },
    { label: t('legalCookies'), href: '/cookies' },
  ];

  return (
    <footer className="border-t border-[var(--dk-warm-border)] bg-[var(--dk-paper)] pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--dk-navy)]">
                <span className="text-xs font-bold text-white">DK</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[var(--dk-ink)]">DK Agency</span>
                <span className="text-[9px] font-medium tracking-wider text-[var(--dk-gold)]">USTALIĞIN NİŞANI</span>
              </div>
            </div>
            <p className="max-w-[240px] text-sm leading-relaxed text-[var(--dk-ink-soft)]">{t('slogan')}</p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--dk-ink)]">{col.title}</h4>
              <ul className="space-y-0">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={withLocale(locale, link.href)}
                      className="block py-1 text-sm text-[var(--dk-ink-soft)] transition-colors hover:text-[var(--dk-gold)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-[var(--dk-warm-border)] pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-[var(--dk-ink-soft)]">
              &copy; 2026 {t('companyName')} &middot; {t('voen')} &middot; {t('rights')}
            </p>
            <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {legalLinks.map((link) => (
                <Link key={link.href} href={withLocale(locale, link.href)}
                  className="text-xs text-[var(--dk-ink-soft)] transition-colors hover:text-[var(--dk-gold)]">
                  {link.label}
                </Link>
              ))}
            </nav>
            <Link href="https://dkagency.com.tr" target="_blank"
              className="text-xs font-semibold text-[var(--dk-gold)] transition-colors hover:text-[var(--dk-gold-hover)]">
              {t('poweredBy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function KazanAIBot() {
  return <FloatingKazanWidget />;
}

export default Footer;
