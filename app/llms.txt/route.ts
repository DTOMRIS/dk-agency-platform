import { getTranslations } from 'next-intl/server';

import { defaultLocale } from '@/i18n/config';
import { SEKTOR_CONFIG_LIST } from '@/lib/data/sektorConfigs';
import { getBlogPostsFromDb } from '@/lib/db/blog-repository';
import { TOOLKIT_CATALOG } from '@/lib/news/toolkit-catalog';
import { SITE_URL } from '@/lib/seo/structured-data';

/**
 * `/llms.txt` — llmstxt.org formatı.
 *
 * Məqsəd sitemap.xml-dən fərqlidir: sitemap crawler-ə «bu URL-lər var» deyir,
 * llms.txt isə cavab mühərriklərinə (ChatGPT, Perplexity, Claude) «bu səhifə
 * NƏ edir» deyir — hər sətir ünvan + bir cümləlik izah. Model saytı gəzmədən
 * hansı səhifəni sitat gətirəcəyini seçə bilir.
 *
 * Bütün mətn mövcud SSOT-lardan gəlir (TOOLKIT_CATALOG, sektor configləri,
 * franchisePillar mesajları, bloq DB-si) — burada təkrar yazılmış kopya yoxdur,
 * ona görə səhifə mətni dəyişəndə bu fayl da dəyişir.
 */
export const revalidate = 3600;

const MAX_BLOG_ENTRIES = 40;

type Entry = { title: string; path: string; description?: string };

/** Çoxsətirli mesajı bir sətrə yığır — llms.txt sətir-əsaslı formatdır. */
function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** `| DK Agency` kimi brend quyruğunu atır; başlıq onsuz da DK Agency faylındadır. */
function stripBrandSuffix(title: string): string {
  return title.replace(/\s*\|\s*DK Agency\s*$/i, '').trim();
}

function toLine(entry: Entry): string {
  const description = entry.description ? `: ${collapse(entry.description)}` : '';
  return `- [${collapse(entry.title)}](${SITE_URL}${entry.path})${description}`;
}

/** Boş bölmə '' qaytarır — blokları birləşdirən filtr onu atır. */
function toSection(heading: string, entries: Entry[]): string {
  if (entries.length === 0) return '';
  return `## ${heading}\n\n${entries.map(toLine).join('\n')}`;
}

/** Bloq DB-dən gəlir; DB əlçatmazsa fayl bloq bölməsi olmadan da qaytarılmalıdır. */
async function getBlogEntries(): Promise<Entry[]> {
  try {
    const { posts } = await getBlogPostsFromDb(
      { status: 'published', limit: MAX_BLOG_ENTRIES, offset: 0 },
      defaultLocale
    );
    return posts.map((post) => ({
      title: post.title,
      path: `/blog/${post.slug}`,
      description: post.seoDescription || post.summary || undefined,
    }));
  } catch {
    return [];
  }
}

async function getFranchiseEntries(): Promise<Entry[]> {
  const t = await getTranslations({ locale: defaultLocale, namespace: 'franchisePillar' });
  return [
    { title: t('hero.title'), path: '/franchise', description: t('hero.subtitle') },
    {
      title: t('tools.readiness.title'),
      path: '/franchise/hazirliq-testi',
      description: t('tools.readiness.desc'),
    },
    {
      title: t('tools.franchbook.title'),
      path: '/franchise/francbuk-generatoru',
      description: t('tools.franchbook.desc'),
    },
    { title: t('tools.radar.title'), path: '/franchise/radar', description: t('tools.radar.desc') },
    {
      title: t('tools.roi.title'),
      path: '/franchise/roi-kalkulyatoru',
      description: t('tools.roi.desc'),
    },
    {
      title: t('tools.buyer.title'),
      path: '/franchise/alici-cheklisti',
      description: t('tools.buyer.desc'),
    },
  ];
}

async function getSektorEntries(): Promise<Entry[]> {
  return Promise.all(
    SEKTOR_CONFIG_LIST.map(async (config) => {
      const t = await getTranslations({ locale: defaultLocale, namespace: config.namespace });
      return {
        title: stripBrandSuffix(t('pageTitle')),
        path: `/sektor/${config.slug}`,
        description: config.metaDescription,
      };
    })
  );
}

const TOOLKIT_ENTRIES: Entry[] = TOOLKIT_CATALOG.map((tool) => ({
  title: tool.label,
  path: `/toolkit/${tool.slug}`,
  description: tool.description,
}));

/** Mətnlər səhifələrin öz metadata/başlıqlarından götürülüb. */
const CORE_ENTRIES: Entry[] = [
  {
    title: 'DK Agency Toolkit',
    path: '/toolkit',
    description:
      'Restoranını idarə etmək üçün pulsuz alətlər. Food cost, P&L, checklist — hamısı bir yerdə.',
  },
  {
    title: 'DK Agency Blog',
    path: '/blog',
    description: 'HoReCa sektorunda ekspert analizlər, addım-addım bələdçilər və sektor trendləri.',
  },
  {
    title: 'HoReCa Elanları',
    path: '/ilanlar',
    description:
      'Restoran devri, franchise, ortaq axtarışı, obyekt icarəsi və HORECA ekipman elanları bir vitrində.',
  },
  {
    title: 'DK Agency Şədd Rozeti',
    path: '/sedd-rozeti',
    description:
      'HoReCa bizneslərinin əməliyyat, gigiyena, maliyyə və marka standartlarını yoxlayan DK Agency audit nişanı.',
  },
  {
    title: 'Üzvlük',
    path: '/uzvluk',
    description: 'DK Agency member access, premium blog, KAZAN AI və gələcək subscription qatları.',
  },
  { title: 'Haqqımızda', path: '/haqqimizda' },
  {
    title: 'Bizimlə əlaqə',
    path: '/elaqe',
    description: 'Sual, təklif və ya əməkdaşlıq fikriniz varsa, ən doğru kanaldan başlayın.',
  },
];

export async function GET(): Promise<Response> {
  const [franchiseEntries, sektorEntries, blogEntries] = await Promise.all([
    getFranchiseEntries(),
    getSektorEntries(),
    getBlogEntries(),
  ]);

  // Hər element tam markdown blokudur; boş bölmələr atılır və bloklar
  // arasına bir boş sətir qoyulur (markdown blok ayırıcısı).
  const body =
    [
      '# DK Agency',
      '> Azərbaycanın ilk AI-dəstəkli HoReCa platforması: restoran, kafe, otel və qonaq evi sahibləri üçün pulsuz hesablama alətləri, ekspert bloqu, HoReCa elanları və franchise (françayzinq) məsləhəti.',
      'Sayt dörd dildə xidmət göstərir: Azərbaycan (prefikssiz, əsas dil), rus (`/ru`), ingilis (`/en`) və türk (`/tr`). Aşağıdakı ünvanlar Azərbaycan dilindədir.',
      toSection('Franchise (françayzinq)', franchiseEntries),
      toSection('Sektor bələdçiləri', sektorEntries),
      toSection('Pulsuz alətlər (toolkit)', TOOLKIT_ENTRIES),
      toSection('Bloq yazıları', blogEntries),
      toSection('Platforma', CORE_ENTRIES),
      `## Əlavə\n\n- [Sitemap](${SITE_URL}/sitemap.xml): bütün indekslənən ünvanların tam siyahısı, dil variantları daxil.`,
    ]
      .filter((block) => block !== '')
      .join('\n\n') + '\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
