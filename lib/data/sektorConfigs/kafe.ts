import { buildSektorConfig } from './builder';

/** Kafe sektoru — maya, başabaş və menyu alətləri (restoran alt-dəsti). */
export const kafeConfig = buildSektorConfig({
  slug: 'kafe',
  namespace: 'sektorKafe',
  sektorSlug: 'kafe',
  metaDescription:
    'Kafe sahibləri üçün maya (food cost) hesablayıcı, başabaş nöqtəsi və menyu matrisi. Kiçik mətbəxdən maksimum mənfəət — DK Agency dəstəyi ilə.',
  primaryCtaHref: '/toolkit/food-cost',
  tools: [
    { href: '/toolkit/food-cost', icon: 'calculator', isHero: true },
    { href: '/toolkit/basabas', icon: 'calculator' },
    { href: '/toolkit/menu-matrix', icon: 'calculator' },
  ],
  toolSource: 'kafe_guide_pdf',
  blogSlugs: [
    '1-porsiya-food-cost-hesablama',
    'basabas-noqtesi-hesablama',
    'menyu-muhendisliyi-satis',
  ],
  footerCtaHref: '/toolkit/food-cost',
  og: {
    title: 'Kafe ucun Maya & Basabas Hesabi',
    subtitle: 'Food Cost | Basabas | Menyu Matrix',
    badges: ['Food Cost', 'Basabas', 'Menyu Matrix'],
  },
});
