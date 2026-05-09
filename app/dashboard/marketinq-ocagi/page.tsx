'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  ClipboardCheck,
  MapPin,
  Compass,
  CalendarDays,
  PenLine,
  TrendingUp,
  Calendar,
  MessageSquareReply,
  Radar,
  ImagePlus,
  BrainCircuit,
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
  Eye,
  ClipboardCheck,
  MapPin,
  Compass,
  CalendarDays,
  PenLine,
  TrendingUp,
  Calendar,
  MessageSquareReply,
  Radar,
  ImagePlus,
  BrainCircuit,
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
      gorunulurluk: 'Görünürlük',
      kontent: 'Kontent',
      strateji: 'Strateji',
      reputasiya: 'Reputasiya',
    },
    tiers: { sagird: 'ŞAGIRD', kalfa: 'KALFA', usta: 'USTA' },
    tools: {
      'gorunurluk-testi': { title: 'Görünürlük Testi', subtitle: 'Restoranınızın onlayn-fiziki görünürlüyünü 6 sahədə yoxlayın' },
      'kst-yoxlayici': { title: 'KST Yoxlayıcı', subtitle: 'Keyfiyyət, Servis, Təmizlik öz-özünə audit' },
      'gbp-qurucu': { title: 'GBP Qurucusu', subtitle: 'Google Business Profile-ı 30 dəqiqədə qurun' },
      'marka-kompasi': { title: 'Marka Kompası', subtitle: '5 sualda restoranınızın bazardakı yerini tapın' },
      'smm-plan-ai': { title: 'SMM Plan AI', subtitle: '7-günlük Instagram + TikTok məzmun planı' },
      'caption-yazici': { title: 'Caption Yazıcı', subtitle: '4 dildə, 3 ton ilə post mətni yazın' },
      'promosyon-roi': { title: 'Promosyon ROI', subtitle: 'Real incremental satış hesablayıcısı' },
      'kampaniya-takvimi': { title: 'Kampaniya Takvimi', subtitle: '12 aylıq vizual promosyon planı' },
      'rey-cavab-ai': { title: 'Rəy Cavab AI', subtitle: 'Google və 2GIS rəylərinə brand-voice cavab' },
      'reqib-radari': { title: 'Rəqib Radarı', subtitle: 'Yaxınlıqdakı 5 rəqibin menyu və sentiment analizi' },
      'ai-vizyual-studyo': { title: 'AI Vizyual Studyo', subtitle: 'Yemək şəklindən professional foto və banner' },
      'aeo-skoru': { title: 'AEO Skoru', subtitle: 'ChatGPT/Perplexity sənin restoranını tövsiyə edirmi?' },
    },
  },
  en: {
    title: 'Marketing Hub',
    subtitle: 'AI-powered marketing tools for restaurant owners',
    comingSoon: 'Coming Soon',
    categories: {
      gorunulurluk: 'Visibility',
      kontent: 'Content',
      strateji: 'Strategy',
      reputasiya: 'Reputation',
    },
    tiers: { sagird: 'STARTER', kalfa: 'PRO', usta: 'MASTER' },
    tools: {
      'gorunurluk-testi': { title: 'Visibility Test', subtitle: 'Check your restaurant visibility across 6 channels' },
      'kst-yoxlayici': { title: 'QSC Checker', subtitle: 'Quality, Service, Cleanliness self-audit' },
      'gbp-qurucu': { title: 'GBP Builder', subtitle: 'Build your Google Business Profile in 30 minutes' },
      'marka-kompasi': { title: 'Brand Compass', subtitle: 'Find your market position in 5 questions' },
      'smm-plan-ai': { title: 'SMM Plan AI', subtitle: '7-day Instagram + TikTok content plan' },
      'caption-yazici': { title: 'Caption Writer', subtitle: 'Post copy in 4 languages, 3 tones' },
      'promosyon-roi': { title: 'Promo ROI', subtitle: 'Real incremental sales calculator' },
      'kampaniya-takvimi': { title: 'Campaign Calendar', subtitle: '12-month visual promotion planner' },
      'rey-cavab-ai': { title: 'Review Reply AI', subtitle: 'Brand-voice replies to Google & 2GIS reviews' },
      'reqib-radari': { title: 'Competitor Radar', subtitle: 'Menu & sentiment analysis of 5 nearby competitors' },
      'ai-vizyual-studyo': { title: 'AI Visual Studio', subtitle: 'Professional food photos from your phone shots' },
      'aeo-skoru': { title: 'AEO Score', subtitle: 'Does ChatGPT recommend your restaurant?' },
    },
  },
  tr: {
    title: 'Pazarlama Ocağı',
    subtitle: 'Restoran sahipleri için AI destekli pazarlama araçları',
    comingSoon: 'Yakında',
    categories: {
      gorunulurluk: 'Görünürlük',
      kontent: 'İçerik',
      strateji: 'Strateji',
      reputasiya: 'İtibar',
    },
    tiers: { sagird: 'ÇIRAK', kalfa: 'KALFA', usta: 'USTA' },
    tools: {
      'gorunurluk-testi': { title: 'Görünürlük Testi', subtitle: 'Restoranınızın 6 kanaldaki görünürlüğünü kontrol edin' },
      'kst-yoxlayici': { title: 'KST Denetçisi', subtitle: 'Kalite, Servis, Temizlik öz denetimi' },
      'gbp-qurucu': { title: 'GBP Kurucusu', subtitle: "Google Business Profile'ı 30 dakikada kurun" },
      'marka-kompasi': { title: 'Marka Pusulası', subtitle: '5 soruda restoranınızın pazardaki konumunu bulun' },
      'smm-plan-ai': { title: 'SMM Plan AI', subtitle: '7 günlük Instagram + TikTok içerik planı' },
      'caption-yazici': { title: 'Caption Yazıcı', subtitle: '4 dilde, 3 tonla gönderi metni yazın' },
      'promosyon-roi': { title: 'Promosyon ROI', subtitle: 'Gerçek artımlı satış hesaplayıcı' },
      'kampaniya-takvimi': { title: 'Kampanya Takvimi', subtitle: '12 aylık görsel promosyon planı' },
      'rey-cavab-ai': { title: 'Yorum Yanıt AI', subtitle: 'Google ve 2GIS yorumlarına marka sesiyle yanıt' },
      'reqib-radari': { title: 'Rakip Radarı', subtitle: 'Yakınlıktaki 5 rakibin menü ve duygu analizi' },
      'ai-vizyual-studyo': { title: 'AI Görsel Stüdyo', subtitle: 'Yemek fotoğrafından profesyonel görsel üretin' },
      'aeo-skoru': { title: 'AEO Skoru', subtitle: 'ChatGPT restoranınızı tavsiye ediyor mu?' },
    },
  },
  ru: {
    title: 'Маркетинг-Хаб',
    subtitle: 'AI-инструменты маркетинга для рестораторов',
    comingSoon: 'Скоро',
    categories: {
      gorunulurluk: 'Видимость',
      kontent: 'Контент',
      strateji: 'Стратегия',
      reputasiya: 'Репутация',
    },
    tiers: { sagird: 'УЧЕНИК', kalfa: 'ПОДМАСТЕРЬЕ', usta: 'МАСТЕР' },
    tools: {
      'gorunurluk-testi': { title: 'Тест видимости', subtitle: 'Проверьте видимость вашего ресторана по 6 каналам' },
      'kst-yoxlayici': { title: 'KST Аудитор', subtitle: 'Качество, Сервис, Чистота — самопроверка' },
      'gbp-qurucu': { title: 'GBP Конструктор', subtitle: 'Создайте Google Business Profile за 30 минут' },
      'marka-kompasi': { title: 'Компас Бренда', subtitle: 'Найдите свою позицию на рынке за 5 вопросов' },
      'smm-plan-ai': { title: 'SMM План AI', subtitle: '7-дневный контент-план Instagram + TikTok' },
      'caption-yazici': { title: 'Генератор текстов', subtitle: 'Тексты постов на 4 языках, 3 тона' },
      'promosyon-roi': { title: 'ROI Промоакций', subtitle: 'Калькулятор реальных дополнительных продаж' },
      'kampaniya-takvimi': { title: 'Календарь кампаний', subtitle: '12-месячный визуальный план промоакций' },
      'rey-cavab-ai': { title: 'Ответ на отзыв AI', subtitle: 'Ответы на отзывы Google и 2GIS в стиле бренда' },
      'reqib-radari': { title: 'Радар конкурентов', subtitle: 'Анализ меню и отзывов 5 ближайших конкурентов' },
      'ai-vizyual-studyo': { title: 'AI Визуал Студия', subtitle: 'Профессиональные фото блюд из снимков телефона' },
      'aeo-skoru': { title: 'AEO Оценка', subtitle: 'Рекомендует ли ChatGPT ваш ресторан?' },
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
  const Icon = ICON_MAP[tool.iconName] ?? Eye;
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
