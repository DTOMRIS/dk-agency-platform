import type { MetadataRoute } from 'next';

import { defaultLocale, locales } from '@/i18n/config';
import { VALID_SEKTOR_SLUGS } from '@/lib/data/sektorConfigs';
import { getBlogPostsFromDb } from '@/lib/db/blog-repository';
import { getApprovedNewsArticles } from '@/lib/repositories/newsRepository';

const BASE_URL = 'https://dkagency.com.tr';

/**
 * Default locale (az) prefiksiz servis olunur — `localePrefix: 'as-needed'`
 * `/az/X`-i `/X`-e redirect edir (L-038). Sitemap-a redirect olunan URL
 * qoymaq crawl budcesini yandirir ve ziddiyyetli siqnal verir, ona gore
 * AZ prefiksiz gedir, prefiks yalniz diger dillere qoyulur.
 */
const PREFIXED_LOCALES = locales.filter((locale) => locale !== defaultLocale);

function absolute(path: string) {
  return `${BASE_URL}${path === '/' ? '/' : path}`;
}

function prefixedUrls(path: string) {
  return PREFIXED_LOCALES.map((locale) => `${BASE_URL}/${locale}${path === '/' ? '' : path}`);
}

type Entry = MetadataRoute.Sitemap[number];

/** Bir yolu AZ (prefiksiz) + diger diller ucun sitemap sətirlerine cevirir. */
function entriesFor(
  path: string,
  lastModified: Date,
  changeFrequency: Entry['changeFrequency'],
  priority: number
): MetadataRoute.Sitemap {
  return [
    { url: absolute(path), lastModified, changeFrequency, priority },
    ...prefixedUrls(path).map((url) => ({
      url,
      lastModified,
      changeFrequency,
      priority: Math.max(0.1, priority - 0.05),
    })),
  ];
}

/** Toolkit aletleri — hamisi public ve indekslenmelidir. */
const TOOLKIT_SLUGS = [
  'aqta-checklist',
  'basabas',
  'branding-guide',
  'checklist',
  'delivery-calc',
  'food-cost',
  'insaat-checklist',
  'menu-matrix',
  'metbex-istasyon',
  'ota-hazirlig-testi',
  'otel-hazirlig-testi',
  'personel-planlayici',
  'pnl',
  'pnl-simulator',
  'qonaq-evi-roi-kalkulyatoru',
  'staff-retention',
  'whatsapp-template-paketi',
];

/**
 * Franchise aletleri. Diqqet: `/franchise` esas sehifesi HELE YOXDUR
 * (app/franchise/page.tsx mövcud deyil) — ona gore buraya salinmir,
 * yoxsa sitemap 404 elan edir. Pillar sehife ayrica task-dir.
 */
const FRANCHISE_SLUGS = [
  'alici-cheklisti',
  'francbuk-generatoru',
  'hazirliq-testi',
  'radar',
  'roi-kalkulyatoru',
];

/** Marketinq ve diger public giris sehifeleri. */
const STATIC_PATHS: Array<{
  path: string;
  changeFrequency: Entry['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.9 },
  { path: '/haberler', changeFrequency: 'daily', priority: 0.9 },
  { path: '/xeberler', changeFrequency: 'daily', priority: 0.9 },
  { path: '/toolkit', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/sektor', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/ilanlar', changeFrequency: 'daily', priority: 0.8 },
  { path: '/haqqimizda', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/uzvluk', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/kazan-ai', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/marketinq', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/sedd-rozeti', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/ilan-ver', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/elaqe', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/b2b-panel', changeFrequency: 'weekly', priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = STATIC_PATHS.flatMap(({ path, changeFrequency, priority }) =>
    entriesFor(path, now, changeFrequency, priority)
  );

  const toolkitEntries = TOOLKIT_SLUGS.flatMap((slug) =>
    entriesFor(`/toolkit/${slug}`, now, 'monthly', 0.8)
  );

  const franchiseEntries = FRANCHISE_SLUGS.flatMap((slug) =>
    entriesFor(`/franchise/${slug}`, now, 'monthly', 0.8)
  );

  const sektorEntries = VALID_SEKTOR_SLUGS.flatMap((slug) =>
    entriesFor(`/sektor/${slug}`, now, 'monthly', 0.75)
  );

  const [blogResult, newsResult] = await Promise.all([
    getBlogPostsFromDb({ status: 'published', limit: 1000, offset: 0 }),
    getApprovedNewsArticles({ category: 'all', limit: 1000, offset: 0 }),
  ]);

  const blogEntries = blogResult.posts.flatMap((post) =>
    entriesFor(
      `/blog/${post.slug}`,
      new Date(post.updatedAt || post.publishDate || now),
      'monthly',
      0.8
    )
  );

  const newsEntries = newsResult.items.flatMap((item) =>
    entriesFor(`/haberler/${item.slug}`, new Date(item.publishedAt || now), 'weekly', 0.75)
  );

  return [
    ...staticEntries,
    ...toolkitEntries,
    ...franchiseEntries,
    ...sektorEntries,
    ...blogEntries,
    ...newsEntries,
  ];
}
