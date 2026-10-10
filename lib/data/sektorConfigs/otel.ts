import { buildSektorConfig } from './builder';

/** Otel sektoru — ulduz təsnifatına hazırlıq, OTA və ROI alətləri (TASK-0535: «AHA sertifikatı» deyil — təsnifatı dövlət aparır). */
export const otelConfig = buildSektorConfig({
  slug: 'otel',
  namespace: 'sektorOtel',
  sektorSlug: 'otel',
  metaDescription:
    'Otel sahibləri üçün ulduz təsnifatına hazırlıq testi, OTA hazırlıq testi və ROI kalkulyatoru. Booking, Expedia və milli ulduz meyarlarına hazırlıq — DK Agency dəstəyi ilə.',
  primaryCtaHref: '/toolkit/otel-hazirlig-testi',
  tools: [
    { href: '/toolkit/otel-hazirlig-testi', icon: 'quiz' },
    { href: '/toolkit/qonaq-evi-roi-kalkulyatoru', icon: 'calculator', isHero: true },
    { href: '/toolkit/ota-hazirlig-testi', icon: 'quiz' },
  ],
  toolSource: 'otel_guide_pdf',
  blogSlugs: [
    'aha-ulduz-sertifikati-otel-hazirliq',
    'ilk-5-deqiqe-qonaq-qarsilama',
    'bir-elan-on-platforma-ev-kirayesi',
  ],
  footerCtaHref: '/toolkit/otel-hazirlig-testi',
  og: {
    title: 'Otel sektoru üçün ulduz və OTA hazırlığı',
    subtitle: 'Booking | Expedia | Ulduz təsnifatı',
    badges: ['Ulduz testi', 'ROI kalkulyatoru', 'OTA hazırlığı'],
  },
  heroImage: '/images/training-seminar.png',
});
