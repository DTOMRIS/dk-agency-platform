import { buildSektorConfig } from './builder';

/** Qonaq evi & pansiyon — migrated from the former static /sektor/qonaq-evi page. */
export const qonaqEviConfig = buildSektorConfig({
  slug: 'qonaq-evi',
  namespace: 'sektorQonaqEvi',
  sektorSlug: 'qonaqEvi',
  metaDescription:
    'Pansiyon, qonaq evi və Airbnb host-ları üçün OTA hazırlıq testi, ROI kalkulyatoru və WhatsApp template paketi. Xınalıqdan Bakıya — DK Agency dəstəyi ilə.',
  primaryCtaHref: '/toolkit/ota-hazirlig-testi',
  tools: [
    { href: '/toolkit/ota-hazirlig-testi', icon: 'quiz' },
    { href: '/toolkit/qonaq-evi-roi-kalkulyatoru', icon: 'calculator', isHero: true },
    { href: '/toolkit/whatsapp-template-paketi', icon: 'whatsapp' },
  ],
  toolSource: 'ota_guide_pdf',
  blogSlugs: [
    'ai-ile-favok-qorumasi',
    'garson-satis-upsell-salon-gelir',
    'aha-ulduz-sertifikati-otel-hazirliq',
  ],
  footerCtaHref: '/toolkit/ota-hazirlig-testi',
  og: {
    title: 'Qonaq Evi & Pansiyon ucun OTA Beledcisi',
    subtitle: 'Booking.com | Airbnb | Yandex Travel',
    badges: ['OTA Test', 'ROI Kalkulyator', 'WhatsApp Sablonlar'],
  },
});
