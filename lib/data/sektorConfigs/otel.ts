import { buildSektorConfig } from './builder';

/** Otel sektoru — AHA hazırlıq, OTA və ROI alətləri. */
export const otelConfig = buildSektorConfig({
  slug: 'otel',
  namespace: 'sektorOtel',
  sektorSlug: 'otel',
  metaDescription:
    'Otel sahibləri üçün AHA ulduz hazırlıq testi, OTA hazırlıq və ROI kalkulyatoru. Booking, Expedia və AHA sertifikatına hazırlıq — DK Agency dəstəyi ilə.',
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
    title: 'Otel Sektoru ucun AHA & OTA Hazirligi',
    subtitle: 'Booking | Expedia | AHA Sertifikat',
    badges: ['AHA Test', 'ROI Kalkulyator', 'OTA Hazirliq'],
  },
  heroImage: '/images/training-seminar.png',
});
