'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  ClipboardCheck,
  UtensilsCrossed,
  TrendingUp,
  Calculator,
  MessageSquareWarning,
  UserCircle,
  CalendarDays,
  PenLine,
  Share2,
  ScanSearch,
  LineChart,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import {
  MARKETING_TOOLS,
  TOOL_CATEGORIES,
  TIER_COLORS,
  type MarketingToolConfig,
  type MarketingToolCategory,
} from '@/lib/marketing-tools-config';

// ── ICON MAP ────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Compass,
  ClipboardCheck,
  UtensilsCrossed,
  TrendingUp,
  Calculator,
  MessageSquareWarning,
  UserCircle,
  CalendarDays,
  PenLine,
  Share2,
  ScanSearch,
  LineChart,
  MapPin,
};

// ── LOCALE COPY ─────────────────────────────────────────────────────

const pageCopy: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    comingSoon: string;
    categories: Record<MarketingToolCategory, string>;
    tiers: Record<string, string>;
    tools: Record<string, { title: string; subtitle: string }>;
  }
> = {
  az: {
    title: 'Marketinq Ocağı',
    subtitle: 'Restoran sahibi üçün AI-powered marketinq alətləri',
    comingSoon: 'Tezliklə',
    categories: {
      analitika: 'Analitika',
      maliyye: 'Maliyyə',
      musteri: 'Müştəri',
      kontent: 'Kontent',
      emeliyyat: 'Əməliyyat',
    },
    tiers: { sagird: 'ŞAGIRD', kalfa: 'KALFA', usta: 'USTA' },
    tools: {
      'marka-kompasi': { title: 'Marka Kompası', subtitle: '5 sualda restoranınızın bazardakı yerini tapın' },
      'kst-yoxlayici': { title: 'KST Yoxlayıcı', subtitle: 'Keyfiyyət, Servis, Təmizlik öz-özünə audit' },
      'menyu-analitigi': { title: 'Menyu Analitiği', subtitle: 'Menyu pozisiyalarının rentabelliyini analiz edin' },
      'yemek-xerci': { title: 'Yemək Xərci', subtitle: 'Resept kartı ilə porsiya maya dəyərini hesabla' },
      'promosyon-roi': { title: 'Promosyon ROI', subtitle: 'Baz Hafta vs Promo Hafta — real ROI hesabla' },
      'pnl-simulator': { title: 'P&L Simulator', subtitle: 'Aylıq gəlir-xərc modelləşdirməsi' },
      'sikayet-analitigi': { title: 'Şikayət Analitiği', subtitle: 'Müştəri şikayətlərini AI ilə analiz et' },
      'sikayet-cavablandirici': { title: 'Şikayət Cavablandırıcı', subtitle: 'AI ilə Google və TripAdvisor şikayətlərinə 3 fərqli tonda cavab' },
      'musteri-persona': { title: 'Müştəri Persona', subtitle: 'Hədəf müştəri profilini yaradın' },
      'sezon-planlama': { title: 'Sezon Planlaması', subtitle: '12 aylıq kampaniya və event takvimi' },
      'reklam-yazicisi': { title: 'Reklam Yazıcısı', subtitle: 'AI ilə reklam və post mətni yazın' },
      'sosial-medya-plan': { title: 'Sosial Medya Plan', subtitle: '7-günlük Instagram + TikTok planı' },
      'audit-robotu': { title: 'Audit Robotu', subtitle: 'Foto-əsaslı AI restoran auditi' },
      'trend-analitigi': { title: 'Trend Analitiği', subtitle: 'Bazardakı yemək trendlərini izlə' },
      'lokasyon-secme': { title: 'Lokasyon Seçmə', subtitle: '4 aşamada restoran yeri seçimi' },
    },
  },
  en: {
    title: 'Marketing Hub',
    subtitle: 'AI-powered marketing tools for restaurant owners',
    comingSoon: 'Coming Soon',
    categories: {
      analitika: 'Analytics',
      maliyye: 'Finance',
      musteri: 'Customer',
      kontent: 'Content',
      emeliyyat: 'Operations',
    },
    tiers: { sagird: 'STARTER', kalfa: 'PRO', usta: 'MASTER' },
    tools: {
      'marka-kompasi': { title: 'Brand Compass', subtitle: 'Find your market position in 5 questions' },
      'kst-yoxlayici': { title: 'QSC Checker', subtitle: 'Quality, Service, Cleanliness self-audit' },
      'menyu-analitigi': { title: 'Menu Analytics', subtitle: 'Analyze menu item profitability' },
      'yemek-xerci': { title: 'Food Cost Calculator', subtitle: 'Calculate recipe and portion cost' },
      'promosyon-roi': { title: 'Promo ROI', subtitle: 'Base Week vs Promo Week — real ROI' },
      'pnl-simulator': { title: 'P&L Simulator', subtitle: 'Monthly revenue-expense modeling' },
      'sikayet-analitigi': { title: 'Complaint Analytics', subtitle: 'AI-powered complaint analysis' },
      'sikayet-cavablandirici': { title: 'Complaint Responder', subtitle: 'AI-generated responses to Google and TripAdvisor reviews in 3 tones' },
      'musteri-persona': { title: 'Customer Persona', subtitle: 'Build target customer profiles' },
      'sezon-planlama': { title: 'Season Planning', subtitle: '12-month campaign & event calendar' },
      'reklam-yazicisi': { title: 'Ad Writer', subtitle: 'AI-generated ad and post copy' },
      'sosial-medya-plan': { title: 'Social Media Plan', subtitle: '7-day Instagram + TikTok plan' },
      'audit-robotu': { title: 'Audit Robot', subtitle: 'Photo-based AI restaurant audit' },
      'trend-analitigi': { title: 'Trend Analytics', subtitle: 'Track food trends in your market' },
      'lokasyon-secme': { title: 'Location Picker', subtitle: '4-stage restaurant site selection' },
    },
  },
  tr: {
    title: 'Pazarlama Ocağı',
    subtitle: 'Restoran sahipleri için AI destekli pazarlama araçları',
    comingSoon: 'Yakında',
    categories: {
      analitika: 'Analitik',
      maliyye: 'Finans',
      musteri: 'Müşteri',
      kontent: 'İçerik',
      emeliyyat: 'Operasyon',
    },
    tiers: { sagird: 'ÇIRAK', kalfa: 'KALFA', usta: 'USTA' },
    tools: {
      'marka-kompasi': { title: 'Marka Pusulası', subtitle: '5 soruda pazardaki konumunuzu bulun' },
      'kst-yoxlayici': { title: 'KST Denetçisi', subtitle: 'Kalite, Servis, Temizlik öz denetimi' },
      'menyu-analitigi': { title: 'Menü Analitiği', subtitle: 'Menü kalemlerinin karlılığını analiz edin' },
      'yemek-xerci': { title: 'Yemek Maliyeti', subtitle: 'Reçete kartı ile porsiyon maliyetini hesapla' },
      'promosyon-roi': { title: 'Promosyon ROI', subtitle: 'Baz Hafta vs Promo Hafta — gerçek ROI' },
      'pnl-simulator': { title: 'P&L Simülatörü', subtitle: 'Aylık gelir-gider modellemesi' },
      'sikayet-analitigi': { title: 'Şikayet Analitiği', subtitle: 'AI ile müşteri şikayet analizi' },
      'sikayet-cavablandirici': { title: 'Şikayet Yanıtlayıcı', subtitle: 'Google ve TripAdvisor şikayetlerine AI ile 3 farklı tonda yanıt' },
      'musteri-persona': { title: 'Müşteri Persona', subtitle: 'Hedef müşteri profili oluşturun' },
      'sezon-planlama': { title: 'Sezon Planlaması', subtitle: '12 aylık kampanya ve etkinlik takvimi' },
      'reklam-yazicisi': { title: 'Reklam Yazıcısı', subtitle: 'AI ile reklam ve gönderi metni yazın' },
      'sosial-medya-plan': { title: 'Sosyal Medya Planı', subtitle: '7 günlük Instagram + TikTok planı' },
      'audit-robotu': { title: 'Denetim Robotu', subtitle: 'Fotoğraf tabanlı AI restoran denetimi' },
      'trend-analitigi': { title: 'Trend Analitiği', subtitle: 'Pazardaki yemek trendlerini takip edin' },
      'lokasyon-secme': { title: 'Lokasyon Seçimi', subtitle: '4 aşamada restoran yeri seçimi' },
    },
  },
  ru: {
    title: 'Маркетинг-Хаб',
    subtitle: 'AI-инструменты маркетинга для рестораторов',
    comingSoon: 'Скоро',
    categories: {
      analitika: 'Аналитика',
      maliyye: 'Финансы',
      musteri: 'Клиенты',
      kontent: 'Контент',
      emeliyyat: 'Операции',
    },
    tiers: { sagird: 'УЧЕНИК', kalfa: 'ПОДМАСТЕРЬЕ', usta: 'МАСТЕР' },
    tools: {
      'marka-kompasi': { title: 'Компас Бренда', subtitle: 'Найдите свою позицию за 5 вопросов' },
      'kst-yoxlayici': { title: 'KST Аудитор', subtitle: 'Самопроверка Качества, Сервиса, Чистоты' },
      'menyu-analitigi': { title: 'Анализ Меню', subtitle: 'Анализ рентабельности позиций меню' },
      'yemek-xerci': { title: 'Food Cost Calculator', subtitle: 'Calculate recipe and portion cost' },
      'promosyon-roi': { title: 'ROI Промоакций', subtitle: 'Базовая неделя vs Промо — реальный ROI' },
      'pnl-simulator': { title: 'P&L Симулятор', subtitle: 'Ежемесячное моделирование доходов и расходов' },
      'sikayet-analitigi': { title: 'Анализ Жалоб', subtitle: 'AI-анализ жалоб клиентов' },
      'sikayet-cavablandirici': { title: 'Ответчик на жалобы', subtitle: 'AI-ответы на отзывы Google и TripAdvisor в 3 тонах' },
      'musteri-persona': { title: 'Персона Клиента', subtitle: 'Создайте профиль целевого клиента' },
      'sezon-planlama': { title: 'Сезонное Планирование', subtitle: '12-месячный календарь кампаний' },
      'reklam-yazicisi': { title: 'Генератор Рекламы', subtitle: 'AI-тексты для рекламы и постов' },
      'sosial-medya-plan': { title: 'План Соцсетей', subtitle: '7-дневный план Instagram + TikTok' },
      'audit-robotu': { title: 'Робот Аудитор', subtitle: 'Фото-аудит ресторана с AI' },
      'trend-analitigi': { title: 'Аналитика Трендов', subtitle: 'Отслеживайте тренды на рынке' },
      'lokasyon-secme': { title: 'Выбор Локации', subtitle: '4-этапный выбор места для ресторана' },
    },
  },
};

// ── COMPONENT ───────────────────────────────────────────────────────

function ToolCard({
  tool,
  copy,
}: {
  tool: MarketingToolConfig;
  copy: (typeof pageCopy)['az'];
}) {
  const Icon = ICON_MAP[tool.iconName] ?? Compass;
  const tierColors = TIER_COLORS[tool.tier];
  const toolCopy = copy.tools[tool.slug];
  const isPlanned = tool.status === 'planned';

  const card = (
    <div
      data-testid="tool-card"
      className={`group relative rounded-2xl border p-5 transition-all ${
        isPlanned
          ? 'border-slate-200 bg-slate-50/50'
          : 'border-slate-200 bg-white hover:border-[var(--dk-gold)] hover:shadow-lg'
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
            isPlanned ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-[var(--dk-navy)]'
          }`}
        >
          <Icon size={20} />
        </span>
        <div className="flex gap-1.5">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}
          >
            {copy.tiers[tool.tier]}
          </span>
          {isPlanned && (
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {copy.comingSoon}
            </span>
          )}
        </div>
      </div>

      <h3
        className={`text-sm font-bold ${
          isPlanned ? 'text-slate-500' : 'text-[var(--dk-navy)]'
        }`}
      >
        {toolCopy?.title ?? tool.slug}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        {toolCopy?.subtitle ?? ''}
      </p>
    </div>
  );

  if (isPlanned) return card;

  return (
    <Link href={`/dashboard/marketinq-ocagi/${tool.slug}`}>
      {card}
    </Link>
  );
}

export default function MarketinqOcagiPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--dk-navy)]">
          {copy.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>
      </div>

      {TOOL_CATEGORIES.map((category) => {
        const tools = MARKETING_TOOLS.filter((t) => t.category === category);
        if (tools.length === 0) return null;

        return (
          <section key={category} className="mb-10">
            <h2 className="mb-4 text-base font-bold text-[var(--dk-navy)]">
              {copy.categories[category]}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} copy={copy} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
