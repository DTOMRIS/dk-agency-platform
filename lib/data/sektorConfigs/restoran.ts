import { buildSektorConfig } from './builder';

/** Restoran sektoru — food cost, menyu mühəndisliyi və AQTA alətləri. */
export const restoranConfig = buildSektorConfig({
  slug: 'restoran',
  namespace: 'sektorRestoran',
  sektorSlug: 'restoran',
  metaDescription:
    'Restoran sahibləri üçün food cost hesablayıcı, menyu mühəndisliyi matrisi və AQTA yoxlama siyahısı. Mənfəəti artır, cəriməni sıfırla — DK Agency dəstəyi ilə.',
  primaryCtaHref: '/toolkit/food-cost',
  tools: [
    { href: '/toolkit/food-cost', icon: 'calculator', isHero: true },
    { href: '/toolkit/menu-matrix', icon: 'calculator' },
    // AQTA checklist — `checklist` üçün quiz ikonu (ClipboardCheck) istifadə olunur.
    { href: '/toolkit/aqta-checklist', icon: 'quiz' },
  ],
  toolSource: 'restoran_guide_pdf',
  blogSlugs: ['1-porsiya-food-cost-hesablama', 'menyu-muhendisliyi-satis', 'aqta-cerime-checklist'],
  footerCtaHref: '/toolkit/food-cost',
  og: {
    title: 'Restoran ucun Food Cost & Menyu Muhendisligi',
    subtitle: 'Food Cost | Menyu Matrix | AQTA',
    badges: ['Food Cost', 'Menyu Matrix', 'AQTA Checklist'],
  },
});
