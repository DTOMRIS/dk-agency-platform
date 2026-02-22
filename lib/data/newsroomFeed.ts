export type NewsLocale = 'az' | 'en' | 'ru' | 'tr';

export interface LocalizedText {
  az: string;
  en: string;
  ru: string;
  tr: string;
}

export interface NewsroomItem {
  id: string;
  slug: string;
  category: 'operations' | 'finance' | 'growth' | 'market';
  publishedAt: string;
  readTime: number;
  views: number;
  author: string;
  title: LocalizedText;
  summary: LocalizedText;
}

export const newsroomItems: NewsroomItem[] = [
  {
    id: 'nx-001',
    slug: 'q1-foodcost-benchmark-2026',
    category: 'finance',
    publishedAt: '2026-02-21T08:30:00Z',
    readTime: 6,
    views: 1821,
    author: 'DK Research Desk',
    title: {
      az: 'Q1 2026 Food Cost Benchmark: 94 restoranin net paneli',
      en: 'Q1 2026 Food Cost Benchmark: Net panel of 94 restaurants',
      ru: 'Benchmark food cost Q1 2026: panel iz 94 restoranov',
      tr: 'Q1 2026 Food Cost Benchmark: 94 restoranlik net panel',
    },
    summary: {
      az: 'Bakida ve regionlarda maliyyeni zorlayan 7 ana kalemi ve toparlanma eyrisini paylasiriq.',
      en: 'We share the seven cost drivers and recovery curves affecting operations in Baku and regions.',
      ru: 'Razbiraem 7 glavnyh faktorov rashodov i dinamiku vosstanovleniya po regionam i Baku.',
      tr: 'Bakude ve bolgelerde marji baskilayan 7 ana kalemi ve toparlanma egilerini paylasiyoruz.',
    },
  },
  {
    id: 'nx-002',
    slug: 'menu-engineering-labor-sync',
    category: 'operations',
    publishedAt: '2026-02-20T10:00:00Z',
    readTime: 5,
    views: 1450,
    author: 'Ops Studio',
    title: {
      az: 'Menu engineering + emek plani: tek dashboard yaklasimi',
      en: 'Menu engineering + labor planning in one dashboard',
      ru: 'Menu engineering i planirovanie personala v odnom dashboard',
      tr: 'Menu engineering + emek plani: tek dashboard yaklasimi',
    },
    summary: {
      az: 'Yuksek hacimli saatlerde dogru urun karmasi ile emek saatlerini nasil optimize edeceyinizi gosteri',
      en: 'How to optimize labor hours with mix-aware menu decisions at high-volume time blocks.',
      ru: 'Kak optimizirovat chasy personala cherez produktovuyu matritsu v chasy pikovoy nagruzki.',
      tr: 'Yuksek hacimli saatlerde urun karmasiyla emek saatlerini nasil optimize edeceginizi gosterir.',
    },
  },
  {
    id: 'nx-003',
    slug: 'telegram-rss-newsletter-funnel',
    category: 'growth',
    publishedAt: '2026-02-19T09:10:00Z',
    readTime: 4,
    views: 1318,
    author: 'Growth Ops Team',
    title: {
      az: 'RSS -> Telegram -> Newsletter huni ile 14 gunluk buyume testi',
      en: '14-day growth test with RSS -> Telegram -> Newsletter funnel',
      ru: '14-dnevny test rosta s voronkoy RSS -> Telegram -> Newsletter',
      tr: 'RSS -> Telegram -> Newsletter hunisi ile 14 gunluk buyume testi',
    },
    summary: {
      az: 'Daimi trafik ureten dagitim sistemini UTM ve referral izlemesiyle modelledik.',
      en: 'We modeled a durable distribution system with UTM and referral attribution visibility.',
      ru: 'Postroili stabilnuyu sistemy distribyucii s UTM i referral attributions.',
      tr: 'UTM ve referral izleme ile kalici trafik ureten dagitim sistemini modelledik.',
    },
  },
  {
    id: 'nx-004',
    slug: 'supplier-price-volatility-map',
    category: 'market',
    publishedAt: '2026-02-18T12:45:00Z',
    readTime: 7,
    views: 1204,
    author: 'Market Intel',
    title: {
      az: 'Tedarukcu qiymet volatilitesi: 30 gunluk harita',
      en: 'Supplier price volatility map: 30-day view',
      ru: 'Karta volatilnosti cen postavshchikov: obzor za 30 dney',
      tr: 'Tedarikci fiyat volatilitesi: 30 gunluk harita',
    },
    summary: {
      az: 'Ani qiymet dalgalanmasina karsi menu, stok ve teklif stratejisini senkronlayin.',
      en: 'Synchronize menu, stock and quote strategies against abrupt supplier price shifts.',
      ru: 'Sinkhroniziruyte menyu, zapasy i kommertseskie predlozheniya protiv rezkih skachkov cen.',
      tr: 'Ani fiyat dalgalanmasina karsi menu, stok ve teklif stratejisini senkronlayin.',
    },
  },
  {
    id: 'nx-005',
    slug: 'franchise-pre-open-readiness',
    category: 'operations',
    publishedAt: '2026-02-17T11:20:00Z',
    readTime: 5,
    views: 1097,
    author: 'Launch PMO',
    title: {
      az: 'Franchise pre-open readiness: 30 maddelik kontrol seti',
      en: 'Franchise pre-open readiness: 30-point control set',
      ru: 'Readiness pered otkrytiem franchizy: chek-list iz 30 punktov',
      tr: 'Franchise pre-open readiness: 30 maddelik kontrol seti',
    },
    summary: {
      az: 'Acilisdan once kritik teslim tarihlerini kacirmadan ilerlemek ucun saha odakli bir cerceve.',
      en: 'A field-first framework to protect critical launch milestones before opening day.',
      ru: 'Polevoy freymvork dlya zashchity kriticheskih etapov do dnya otkrytiya.',
      tr: 'Acilis gununden once kritik kilometre taslarini koruyan saha odakli bir cerceve.',
    },
  },
];

export function getLocalizedNews(locale: NewsLocale) {
  return newsroomItems.map((item) => ({
    ...item,
    localizedTitle: item.title[locale],
    localizedSummary: item.summary[locale],
  }));
}

export function getTopRead(locale: NewsLocale, count = 3) {
  return getLocalizedNews(locale)
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, count);
}
