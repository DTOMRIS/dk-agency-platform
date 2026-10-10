import { getTranslations } from 'next-intl/server';

import { defaultLocale } from '@/i18n/config';
import { SEKTOR_CONFIG_LIST } from '@/lib/data/sektorConfigs';
import { getBlogPostsFromDb } from '@/lib/db/blog-repository';
import { RSS_FEEDS } from '@/lib/news/rss-ingest';
import { TOOLKIT_CATALOG } from '@/lib/news/toolkit-catalog';
import { FREE_TOOLKIT_COUNT } from '@/lib/toolkit/tool-directory';
import { TELEGRAM_URL, WHATSAPP_NUMBER } from '@/lib/contact-channels';
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

/**
 * TASK-0513: ana səhifənin «Modullar» tabları (components/home/v2/ModuleTabs.tsx) — başlıq və izah
 * `homeV2.modules`-dan, status (Canlı/Beta) komponentdəki ilə eyni. OCAQ-ın ayrıca səhifəsi yoxdur
 * (CTA WhatsApp-dır), ona görə ana səhifənin ekosistem bölməsinə işarə edir.
 */
async function getModuleEntries(): Promise<Entry[]> {
  const t = await getTranslations({ locale: defaultLocale, namespace: 'homeV2.modules' });
  const live = t('live');
  const beta = t('beta');
  const modules: Array<{ key: string; path: string; status: string }> = [
    { key: 'foodcost', path: '/toolkit/food-cost', status: live },
    { key: 'delivery', path: '/toolkit/delivery-calc', status: live },
    { key: 'menu', path: '/toolkit/menu-matrix', status: live },
    { key: 'ocaq', path: '/#ekosistem', status: live },
    { key: 'kazan', path: '/kazan-ai', status: beta },
  ];
  return modules.map(({ key, path, status }) => ({
    title: `${t(`${key}.title`)} (${status})`,
    path,
    // OCAQ-ın stat mətni rəqəmsiz başlayır («filiallı şəbəkədə…») — rəqəm statValue-dadır («10+»).
    description: key === 'ocaq' ? `${t('ocaq.statValue')} ${t('ocaq.stat')}` : t(`${key}.stat`),
  }));
}

// TASK-0514: /toolkit/pnl-simulator opens the same tool as /toolkit/pnl — listed once.
const TOOLKIT_ENTRIES: Entry[] = TOOLKIT_CATALOG.filter((tool) => tool.slug !== 'pnl-simulator').map((tool) => ({
  title: tool.label,
  path: `/toolkit/${tool.slug}`,
  description: tool.description,
}));

/** Mətnlər səhifələrin öz metadata/başlıqlarından götürülüb. */
const CORE_ENTRIES: Entry[] = [
  {
    title: 'DK Agency tanıtım',
    path: '/tanitim',
    description:
      'Restoran və HoReCa biznesi üçün food cost, P&L, delivery komissiyası və gündəlik nəzarət; pulsuz diaqnostika.',
  },
  {
    title: 'Sektor Nəbzi',
    path: '/haberler',
    description:
      'HoReCa, turizm və restoran xəbərləri: lentlərdən yığılır, redaktor təsdiqindən sonra dərc olunur.',
  },
  {
    title: 'KAZAN AI (beta)',
    path: '/kazan-ai',
    description: 'HoReCa üzrə AI məsləhətçi: cavabın sonunda bir addım və uyğun DK alətinə keçid.',
  },
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
      'Restoran devri, françayz, ortaq axtarışı, obyekt icarəsi və HORECA ekipman elanları bir vitrində.',
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
    description: 'Pulsuz hesab: elan yerləşdirmək, müraciətləri və fakturaları B2B paneldə idarə etmək. Hesablayıcılar hesabsız da pulsuzdur.',
  },
  {
    title: 'Haqqımızda',
    path: '/haqqimizda',
    description: 'DK Agency və qurucusu Doğan Tomris: 2010-da qurulub, 40 illik HoReCa təcrübəsi.',
  },
  {
    title: 'Bizimlə əlaqə',
    path: '/elaqe',
    description: 'Sual, təklif və ya əməkdaşlıq fikriniz varsa, ən doğru kanaldan başlayın.',
  },
];

export async function GET(): Promise<Response> {
  const [franchiseEntries, sektorEntries, blogEntries, moduleEntries] = await Promise.all([
    getFranchiseEntries(),
    getSektorEntries(),
    getBlogEntries(),
    getModuleEntries(),
  ]);

  const whatsappDisplay = `+${WHATSAPP_NUMBER.slice(0, 3)} ${WHATSAPP_NUMBER.slice(3, 5)} ${WHATSAPP_NUMBER.slice(5, 8)} ${WHATSAPP_NUMBER.slice(8, 10)} ${WHATSAPP_NUMBER.slice(10)}`;
  // RSS sayı koddan (lib/news/rss-ingest.ts) — onluğa yuvarlaqlaşdırılır: 45 → «40+».
  const feedCount = `${Math.floor(RSS_FEEDS.length / 10) * 10}+`;

  // Hər element tam markdown blokudur; boş bölmələr atılır və bloklar
  // arasına bir boş sətir qoyulur (markdown blok ayırıcısı).
  // TASK-0513: məhsulun cari kimliyi (sahib qərarı 2026-10-08) — HoReCa food cost platforması.
  const body =
    [
      '# DK Agency',
      '> Azərbaycanın ilk AI-dəstəkli HoReCa platforması: restoran, kafe və otel sahibləri üçün food cost, P&L, delivery komissiyası, menyu və gündəlik nəzarət (OCAQ) alətləri, KAZAN AI məsləhətçisi və HoReCa məsləhəti. «Biz itkini tapırıq. Siz restoranı idarə edirsiniz.»',
      'Sayt dörd dildə xidmət göstərir: Azərbaycan (prefikssiz, əsas dil), rus (`/ru`), ingilis (`/en`) və türk (`/tr`). Aşağıdakı ünvanlar Azərbaycan dilindədir.',
      [
        '## Faktlar',
        '',
        '- Şirkət: DK Agency (hüquqi ad: DENİS TOMRİS MMC, VÖEN 1405471681), Bakı, Azərbaycan. 2010-da qurulub.',
        '- Qurucu: Doğan Tomris (Qurucu) — 40 ildir HoReCa sektorunda; Türkiyə, Azərbaycan, Rusiya və Gürcüstanda restoran və otel layihələri.',
        '- Nə edir: restoranın rəqəmlərini (food cost, delivery komissiyası, kadr, kassa, gündəlik itki) bir yerə yığır, pulun harada sızdığını göstərir və hər siqnala bir addım təklif edir; qərar sahibdədir. Başlanğıc — WhatsApp ilə pulsuz diaqnostika.',
        `- Alətlər: 35+ alət, ${FREE_TOOLKIT_COUNT}-si pulsuz — Toolkit-də ${FREE_TOOLKIT_COUNT} pulsuz hesablama aləti (/toolkit, qeydiyyatsız işləyir), üstəgəl Marketinq Ocağı AI alətləri, françayz alətləri və KAZAN AI.`,
        '- OCAQ: çoxfilialı şəbəkə üçün gündəlik nəzarət — növbə checklist-i, HACCP, canlı satış, kassa ↔ bank üzləşdirməsi, itki nəzarəti; 10+ filiallı şəbəkədə hər gün işləyir.',
        '- KAZAN AI: HoReCa üzrə AI məsləhətçi, beta mərhələsində (/kazan-ai).',
        `- Sektor Nəbzi: ${feedCount} RSS lenti (HoReCa/turizm ticarət mətbuatı və Azərbaycan xəbər agentlikləri) hər 6 saatdan bir yoxlanılır; xəbərlər redaktorun Telegram-da təsdiqindən sonra /haberler səhifəsində və Telegram kanalında (${TELEGRAM_URL}) dərc olunur.`,
        '- Digər: Şədd Rozeti (keyfiyyət/audit nişanı), HoReCa elanları, françayz (françayzinq) məsləhəti, ekspert bloqu.',
        '- Xidmət ərazisi: Azərbaycan (əsas), Türkiyə.',
        `- Əlaqə: info@dkagency.com.tr · WhatsApp ${whatsappDisplay} · Telegram kanalı ${TELEGRAM_URL} · ${SITE_URL}/elaqe — iş saatları bazar ertəsi–cümə, 09:00–18:00 (UTC+4).`,
      ].join('\n'),
      toSection('Alətlər və həllər', moduleEntries),
      toSection(`Pulsuz alətlər (toolkit, ${FREE_TOOLKIT_COUNT})`, TOOLKIT_ENTRIES),
      toSection('Platforma', CORE_ENTRIES),
      toSection('Franchise (françayzinq)', franchiseEntries),
      toSection('Sektor bələdçiləri', sektorEntries),
      toSection('Bloq yazıları', blogEntries),
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
