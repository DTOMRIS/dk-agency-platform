/**
 * @file invoice-category-seeds.ts
 * @purpose Default fatura kateqoriyaları + auto-mapping qaydaları
 */

export const DEFAULT_INVOICE_CATEGORIES = [
  { name: 'Ət və balıq məhsulları', slug: 'et-balik', color: '#DC2626', icon: 'beef', sortOrder: 1 },
  { name: 'Süd və süd məhsulları', slug: 'sud', color: '#3B82F6', icon: 'milk', sortOrder: 2 },
  { name: 'Meyvə və tərəvəz', slug: 'meyve-terevez', color: '#22C55E', icon: 'apple', sortOrder: 3 },
  { name: 'Dənli və un məhsulları', slug: 'denli-un', color: '#F59E0B', icon: 'wheat', sortOrder: 4 },
  { name: 'Yağlar', slug: 'yaglar', color: '#EAB308', icon: 'droplets', sortOrder: 5 },
  { name: 'İçkilər (alkoqolsuz)', slug: 'icki-alkoqolsuz', color: '#06B6D4', icon: 'cup-soda', sortOrder: 6 },
  { name: 'İçkilər (alkoqollu)', slug: 'icki-alkoqollu', color: '#8B5CF6', icon: 'wine', sortOrder: 7 },
  { name: 'Baharatlar və souslar', slug: 'baharat-sous', color: '#F97316', icon: 'flame', sortOrder: 8 },
  { name: 'Qablaşdırma materialları', slug: 'qablasdirma', color: '#78716C', icon: 'package', sortOrder: 9 },
  { name: 'Təmizlik və gigiyena', slug: 'temizlik', color: '#14B8A6', icon: 'sparkles', sortOrder: 10 },
  { name: 'İnventar və avadanlıq', slug: 'inventar', color: '#6366F1', icon: 'wrench', sortOrder: 11 },
  { name: 'Sair (digər)', slug: 'sair', color: '#6B7280', icon: 'ellipsis', sortOrder: 12 },
] as const;

// Keyword → category slug mapping (AI auto-categorization üçün)
export const DEFAULT_CATEGORY_RULES: Array<{ keyword: string; categorySlug: string }> = [
  // Ət və balıq
  { keyword: 'toyuq', categorySlug: 'et-balik' },
  { keyword: 'mal əti', categorySlug: 'et-balik' },
  { keyword: 'dana', categorySlug: 'et-balik' },
  { keyword: 'quzu', categorySlug: 'et-balik' },
  { keyword: 'balıq', categorySlug: 'et-balik' },
  { keyword: 'qoyun', categorySlug: 'et-balik' },
  { keyword: 'kolbasa', categorySlug: 'et-balik' },
  { keyword: 'сосиска', categorySlug: 'et-balik' },
  { keyword: 'курица', categorySlug: 'et-balik' },
  { keyword: 'мясо', categorySlug: 'et-balik' },
  { keyword: 'рыба', categorySlug: 'et-balik' },

  // Süd
  { keyword: 'süd', categorySlug: 'sud' },
  { keyword: 'pendir', categorySlug: 'sud' },
  { keyword: 'yağ', categorySlug: 'sud' },
  { keyword: 'kərə yağı', categorySlug: 'sud' },
  { keyword: 'qaymaq', categorySlug: 'sud' },
  { keyword: 'yogurt', categorySlug: 'sud' },
  { keyword: 'молоко', categorySlug: 'sud' },
  { keyword: 'сыр', categorySlug: 'sud' },

  // Meyvə/tərəvəz
  { keyword: 'kartof', categorySlug: 'meyve-terevez' },
  { keyword: 'soğan', categorySlug: 'meyve-terevez' },
  { keyword: 'pomidor', categorySlug: 'meyve-terevez' },
  { keyword: 'xiyar', categorySlug: 'meyve-terevez' },
  { keyword: 'bibər', categorySlug: 'meyve-terevez' },
  { keyword: 'alma', categorySlug: 'meyve-terevez' },
  { keyword: 'portağal', categorySlug: 'meyve-terevez' },
  { keyword: 'limon', categorySlug: 'meyve-terevez' },
  { keyword: 'göyərti', categorySlug: 'meyve-terevez' },
  { keyword: 'badımcan', categorySlug: 'meyve-terevez' },

  // Dənli/un
  { keyword: 'un', categorySlug: 'denli-un' },
  { keyword: 'düyü', categorySlug: 'denli-un' },
  { keyword: 'çörək', categorySlug: 'denli-un' },
  { keyword: 'makaron', categorySlug: 'denli-un' },
  { keyword: 'lavash', categorySlug: 'denli-un' },

  // Yağlar
  { keyword: 'zeytun yağı', categorySlug: 'yaglar' },
  { keyword: 'günəbaxan yağı', categorySlug: 'yaglar' },
  { keyword: 'bitki yağı', categorySlug: 'yaglar' },

  // İçkilər (alkoqolsuz)
  { keyword: 'su', categorySlug: 'icki-alkoqolsuz' },
  { keyword: 'cola', categorySlug: 'icki-alkoqolsuz' },
  { keyword: 'fanta', categorySlug: 'icki-alkoqolsuz' },
  { keyword: 'sprite', categorySlug: 'icki-alkoqolsuz' },
  { keyword: 'çay', categorySlug: 'icki-alkoqolsuz' },
  { keyword: 'qəhvə', categorySlug: 'icki-alkoqolsuz' },
  { keyword: 'kompot', categorySlug: 'icki-alkoqolsuz' },

  // İçkilər (alkoqollu)
  { keyword: 'pivə', categorySlug: 'icki-alkoqollu' },
  { keyword: 'şərab', categorySlug: 'icki-alkoqollu' },
  { keyword: 'vodka', categorySlug: 'icki-alkoqollu' },
  { keyword: 'viski', categorySlug: 'icki-alkoqollu' },
  { keyword: 'araq', categorySlug: 'icki-alkoqollu' },

  // Baharat/sous
  { keyword: 'duz', categorySlug: 'baharat-sous' },
  { keyword: 'istiot', categorySlug: 'baharat-sous' },
  { keyword: 'zəfəran', categorySlug: 'baharat-sous' },
  { keyword: 'ketçup', categorySlug: 'baharat-sous' },
  { keyword: 'mayonez', categorySlug: 'baharat-sous' },
  { keyword: 'sous', categorySlug: 'baharat-sous' },
  { keyword: 'sirkə', categorySlug: 'baharat-sous' },

  // Qablaşdırma
  { keyword: 'salfetkə', categorySlug: 'qablasdirma' },
  { keyword: 'paket', categorySlug: 'qablasdirma' },
  { keyword: 'stəkan', categorySlug: 'qablasdirma' },
  { keyword: 'qab', categorySlug: 'qablasdirma' },
  { keyword: 'folqa', categorySlug: 'qablasdirma' },

  // Təmizlik
  { keyword: 'fairy', categorySlug: 'temizlik' },
  { keyword: 'dezinfeksiya', categorySlug: 'temizlik' },
  { keyword: 'təmizləyici', categorySlug: 'temizlik' },
  { keyword: 'sabun', categorySlug: 'temizlik' },
  { keyword: 'əlcək', categorySlug: 'temizlik' },
];
