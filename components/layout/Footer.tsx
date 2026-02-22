// components/layout/Footer.tsx
// DK Agency — Global Footer (Dark Theme)
// 5-column layout, social icons, copyright

import React from 'react';
import Link from 'next/link';
import SocialIcons from './SocialIcons';

// Footer link sections
const footerSections = [
  {
    title: 'Platform',
    links: [
      { href: '/', label: 'Ana Səhifə' },
      { href: '/haberler', label: 'TQTA Jurnal' },
      { href: '/b2b-panel', label: 'B2B Panel' },
      { href: '/b2b-panel/toolkit', label: 'Toolkit' },
    ],
  },
  {
    title: 'B2B Xidmətlər',
    links: [
      { href: '/b2b-panel/yeni-ilan', label: 'İlan Ver' },
      { href: '/b2b-panel/ilanlarim', label: 'İlanlarım' },
      { href: '/b2b-panel/mesajlar', label: 'Mesajlar' },
      { href: '/b2b-panel/toolkit/roi-calculator', label: 'ROI Kalkulyator' },
    ],
  },
  {
    title: 'Hesab',
    links: [
      { href: '/auth/login', label: 'Giriş' },
      { href: '/auth/register', label: 'Qeydiyyat' },
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/dashboard/ayarlar', label: 'Ayarlar' },
    ],
  },
  {
    title: 'Hüquqi',
    links: [
      { href: '/privacy', label: 'Gizlilik Siyasəti' },
      { href: '/terms', label: 'İstifadə Sertleri' },
      { href: '/cookies', label: 'Cookie Policy' },
      { href: '/contact', label: 'Əlaqə' },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A1A] border-t border-[#8892B015]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A022] to-[#E94560] flex items-center justify-center">
                <span className="text-[#0A0A1A] font-black text-lg">DK</span>
              </div>
              <span className="text-[#EAEAEA] font-bold text-lg">DK Agency</span>
            </Link>
            <p className="text-[#8892B0] text-sm leading-relaxed mb-6">
              Azərbaycan TQTA sektoru üçün premium biznes platforması və media şəbəkəsi.
            </p>
            <SocialIcons />
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-[#C5A022] font-semibold text-sm uppercase tracking-wide mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-[#B0B8C8] text-sm hover:text-[#EAEAEA] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-[#8892B015]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-[#EAEAEA] font-semibold text-lg mb-1">
                Həftəlik bülletenə abunə olun
              </h3>
              <p className="text-[#8892B0] text-sm">
                TQTA sektorundan ən son xəbərlər və analizlər
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Email ünvanınız"
                className="flex-1 md:w-64 px-4 py-3 rounded-lg bg-[#1A1A2E] border border-[#8892B020] text-[#EAEAEA] placeholder-[#8892B0] text-sm focus:outline-none focus:border-[#C5A022] transition-colors"
              />
              <button className="px-6 py-3 rounded-lg bg-[#E94560] text-white font-semibold text-sm hover:bg-[#C5A022] transition-colors whitespace-nowrap">
                Abunə ol
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-[#8892B015] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#8892B0] text-sm">
            © {currentYear} DK Agency. Bütün hüquqlar qorunur.
          </p>
          <div className="flex items-center gap-6 text-[#8892B0] text-sm">
            <Link href="/privacy" className="hover:text-[#EAEAEA] transition-colors">
              Gizlilik
            </Link>
            <Link href="/terms" className="hover:text-[#EAEAEA] transition-colors">
              Sertler
            </Link>
            <Link href="/cookies" className="hover:text-[#EAEAEA] transition-colors">
              Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}





