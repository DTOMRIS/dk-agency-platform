'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { getToolConfig, TIER_COLORS } from '@/lib/marketing-tools-config';
import { notFound } from 'next/navigation';
import MarkaKompasiPage from '@/components/marketinq-ocagi/marka-kompasi/MarkaKompasiPage';

const pageCopy: Record<
  Locale,
  {
    backToList: string;
    whyTitle: string;
    comingSoon: string;
    comingSoonDesc: string;
    tiers: Record<string, string>;
    tools: Record<string, { title: string; subtitle: string; why: string }>;
  }
> = {
  az: {
    backToList: 'Bütün alətlər',
    whyTitle: 'Niyə bu vacibdir?',
    comingSoon: 'Tezliklə',
    comingSoonDesc: 'Bu alət hazırlanır. Tezliklə istifadəyə veriləcək.',
    tiers: { sagird: 'ŞAGIRD', kalfa: 'KALFA', usta: 'USTA' },
    tools: {
      'gorunurluk-testi': { title: 'Görünürlük Testi', subtitle: 'Restoranınızın onlayn-fiziki görünürlüyünü 6 sahədə yoxlayın', why: '2026-da Google Maps + AI search dominantdır. Müştərilərin 52%-i gözəcarpan restoranlardan sifariş verir. Bu test sənin restoranının onlayn-fiziki görünürlüyünü 6 sahədə yoxlayır.' },
      'kst-yoxlayici': { title: 'KST Yoxlayıcı', subtitle: 'Keyfiyyət, Servis, Təmizlik öz-özünə audit', why: 'KST mükəmməlliyi bütün marketinq səylərinin təməlidir. Servis yavaş, məkan kirli, yemək keyfiyyətsizdirsə — heç bir reklam dönüşüm yaratmır. Bu alət 30 sualla 3 sahəni ölçür.' },
      'gbp-qurucu': { title: 'GBP Qurucusu', subtitle: 'Google Business Profile-ı 30 dəqiqədə qurun', why: 'Google rating-də 1 ulduz artımı 5-9% gəlir artırır. GBP olmayan restoran Google Maps-da yoxdur. Bu sehirbaz 8 addımda profili tam doldurur.' },
      'marka-kompasi': { title: 'Marka Kompası', subtitle: '5 sualda restoranınızın bazardakı yerini tapın', why: 'Konum (positioning) ucuz/lüks etiketlərdən ibarət deyil — kim üçün, hansı problem, niyə fərqli? Bu kompas 5 sualla cavab verir.' },
      'smm-plan-ai': { title: 'SMM Plan AI', subtitle: '7-günlük Instagram + TikTok məzmun planı', why: '2026-da 94% marketers AI istifadə edir. Qısa video bütün platformalarda dominantdır. Bu alət bir həftəlik tam plan verir.' },
      'caption-yazici': { title: 'Caption Yazıcı', subtitle: '4 dildə, 3 ton ilə post mətni yazın', why: 'Caption restoranın IG/TikTok-da konversiya nöqtəsidir. Bu alət 4 dildə, 3 ton ilə bir anda 12 variant yazır.' },
      'promosyon-roi': { title: 'Promosyon ROI', subtitle: 'Real incremental satış hesablayıcısı', why: "'20% endirim verdim, satış arttı' yanılgıdır. Endirimsiz də gələcək müştərilərin əlavə endirimi sənin marjını yeyir." },
      'kampaniya-takvimi': { title: 'Kampaniya Takvimi', subtitle: '12 aylıq vizual promosyon planı', why: "Restoran sahibi adətən 'Novruz nə edək?' sualını 1 həftə qala düşünür — gec olur. Bu takvim 12 ayı əvvəlcədən planlayır." },
      'rey-cavab-ai': { title: 'Rəy Cavab AI', subtitle: 'Google və 2GIS rəylərinə brand-voice cavab', why: 'Restoran sahibi gündə 5-10 rəyə cavab yazmalıdır. Mənfi rəylərə yanlış cavab brendi sıxır. Bu alət brand-voice öyrənir.' },
      'reqib-radari': { title: 'Rəqib Radarı', subtitle: 'Yaxınlıqdakı 5 rəqibin menyu və sentiment analizi', why: '5 rəqibin Google rəyləri, menyu qiymətləri, ən çox sevilən yeməkləri — bu 1 saatlıq manual iş. AI bunu 30 saniyəyə edir.' },
      'ai-vizyual-studyo': { title: 'AI Vizyual Studyo', subtitle: 'Yemək şəklindən professional foto və banner', why: 'Restoran fotoçusu çəkim 200-500 AZN/seans. AI ilə eyni nəticə 5 dəqiqədə.' },
      'aeo-skoru': { title: 'AEO Skoru', subtitle: 'ChatGPT/Perplexity sənin restoranını tövsiyə edirmi?', why: "2026-da Gartner-ə görə klassik axtarış 25% düşür — adamlar AI-yə soruşur. 'Sumqayıtda dadlı kabab harda?' sualına ChatGPT səni tövsiyə edirmi?" },
    },
  },
  en: {
    backToList: 'All tools',
    whyTitle: 'Why is this important?',
    comingSoon: 'Coming Soon',
    comingSoonDesc: 'This tool is being developed. It will be available soon.',
    tiers: { sagird: 'STARTER', kalfa: 'PRO', usta: 'MASTER' },
    tools: {
      'gorunurluk-testi': { title: 'Visibility Test', subtitle: 'Check your restaurant visibility across 6 channels', why: 'In 2026, Google Maps + AI search is dominant. 52% of customers order from visible restaurants.' },
      'kst-yoxlayici': { title: 'QSC Checker', subtitle: 'Quality, Service, Cleanliness self-audit', why: 'QSC excellence is the foundation of all marketing efforts.' },
      'gbp-qurucu': { title: 'GBP Builder', subtitle: 'Build Google Business Profile in 30 min', why: '1 star increase in Google rating = 5-9% revenue growth.' },
      'marka-kompasi': { title: 'Brand Compass', subtitle: 'Find your market position in 5 questions', why: 'Positioning is not about cheap/luxury labels. It is about who, what problem, why different.' },
      'smm-plan-ai': { title: 'SMM Plan AI', subtitle: '7-day Instagram + TikTok content plan', why: 'In 2026, 94% of marketers use AI. This tool gives a complete weekly plan.' },
      'caption-yazici': { title: 'Caption Writer', subtitle: 'Post copy in 4 languages, 3 tones', why: 'Captions are the conversion point on IG/TikTok.' },
      'promosyon-roi': { title: 'Promo ROI', subtitle: 'Real incremental sales calculator', why: 'Discounts may bring existing customers at lower margin, not new ones.' },
      'kampaniya-takvimi': { title: 'Campaign Calendar', subtitle: '12-month visual promotion planner', why: 'Plan holidays and events 12 months ahead.' },
      'rey-cavab-ai': { title: 'Review Reply AI', subtitle: 'Brand-voice replies to reviews', why: 'Wrong replies to negative reviews damage the brand.' },
      'reqib-radari': { title: 'Competitor Radar', subtitle: 'Menu & sentiment analysis of 5 competitors', why: 'Manual competitor research takes hours. AI does it in 30 seconds.' },
      'ai-vizyual-studyo': { title: 'AI Visual Studio', subtitle: 'Professional food photos from phone shots', why: 'Restaurant photographer costs 200-500 AZN/session.' },
      'aeo-skoru': { title: 'AEO Score', subtitle: 'Does ChatGPT recommend your restaurant?', why: 'Traditional search is declining 25%. People ask AI instead.' },
    },
  },
  tr: {
    backToList: 'Tüm araçlar',
    whyTitle: 'Bu neden önemli?',
    comingSoon: 'Yakında',
    comingSoonDesc: 'Bu araç geliştiriliyor. Yakında kullanıma sunulacak.',
    tiers: { sagird: 'ÇIRAK', kalfa: 'KALFA', usta: 'USTA' },
    tools: {
      'gorunurluk-testi': { title: 'Görünürlük Testi', subtitle: '6 kanalda restoran görünürlüğünüzü kontrol edin', why: '2026\'da Google Maps + AI arama baskın. Müşterilerin %52\'si görünür restoranlardan sipariş veriyor.' },
      'kst-yoxlayici': { title: 'KST Denetçisi', subtitle: 'Kalite, Servis, Temizlik öz denetimi', why: 'KST mükemmelliği tüm pazarlama çabalarının temelidir.' },
      'gbp-qurucu': { title: 'GBP Kurucusu', subtitle: 'Google Business Profile\'ı 30 dakikada kurun', why: 'Google puanında 1 yıldız artışı %5-9 gelir artışı demektir.' },
      'marka-kompasi': { title: 'Marka Pusulası', subtitle: '5 soruda pazardaki konumunuzu bulun', why: 'Konumlandırma ucuz/lüks etiketlerinden ibaret değildir.' },
      'smm-plan-ai': { title: 'SMM Plan AI', subtitle: '7 günlük Instagram + TikTok içerik planı', why: '2026\'da pazarlamacıların %94\'ü AI kullanıyor.' },
      'caption-yazici': { title: 'Caption Yazıcı', subtitle: '4 dilde, 3 tonda gönderi metni yazın', why: 'Caption, IG/TikTok\'ta dönüşüm noktasıdır.' },
      'promosyon-roi': { title: 'Promosyon ROI', subtitle: 'Gerçek artımlı satış hesaplayıcı', why: 'İndirimler mevcut müşterilere daha düşük marjla hizmet verebilir.' },
      'kampaniya-takvimi': { title: 'Kampanya Takvimi', subtitle: '12 aylık görsel promosyon planı', why: 'Bayramları ve etkinlikleri 12 ay önceden planlayın.' },
      'rey-cavab-ai': { title: 'Yorum Yanıt AI', subtitle: 'Yorumlara marka sesiyle yanıt', why: 'Olumsuz yorumlara yanlış yanıtlar markaya zarar verir.' },
      'reqib-radari': { title: 'Rakip Radarı', subtitle: '5 rakibin menü ve duygu analizi', why: 'Manuel rakip araştırması saatler alır. AI 30 saniyede yapar.' },
      'ai-vizyual-studyo': { title: 'AI Görsel Stüdyo', subtitle: 'Yemek fotoğrafından profesyonel görsel', why: 'Fotoğrafçı seansı 200-500 AZN. AI ile 5 dakikada aynı sonuç.' },
      'aeo-skoru': { title: 'AEO Skoru', subtitle: 'ChatGPT restoranınızı tavsiye ediyor mu?', why: 'Klasik arama %25 düşüyor. İnsanlar artık AI\'ya soruyor.' },
    },
  },
  ru: {
    backToList: 'Все инструменты',
    whyTitle: 'Почему это важно?',
    comingSoon: 'Скоро',
    comingSoonDesc: 'Этот инструмент в разработке. Скоро будет доступен.',
    tiers: { sagird: 'УЧЕНИК', kalfa: 'ПОДМАСТЕРЬЕ', usta: 'МАСТЕР' },
    tools: {
      'gorunurluk-testi': { title: 'Тест видимости', subtitle: 'Проверьте видимость ресторана по 6 каналам', why: 'В 2026 году Google Maps + AI поиск доминируют. 52% клиентов заказывают из видимых ресторанов.' },
      'kst-yoxlayici': { title: 'KST Аудитор', subtitle: 'Самопроверка Качества, Сервиса, Чистоты', why: 'Совершенство KST — основа всех маркетинговых усилий.' },
      'gbp-qurucu': { title: 'GBP Конструктор', subtitle: 'Создайте Google Business Profile за 30 минут', why: 'Рост на 1 звезду в Google = рост выручки на 5-9%.' },
      'marka-kompasi': { title: 'Компас Бренда', subtitle: 'Найдите свою позицию за 5 вопросов', why: 'Позиционирование — это не про дёшево/дорого.' },
      'smm-plan-ai': { title: 'SMM План AI', subtitle: '7-дневный контент-план Instagram + TikTok', why: 'В 2026 году 94% маркетологов используют AI.' },
      'caption-yazici': { title: 'Генератор текстов', subtitle: 'Тексты постов на 4 языках, 3 тона', why: 'Подпись — точка конверсии в IG/TikTok.' },
      'promosyon-roi': { title: 'ROI Промоакций', subtitle: 'Калькулятор реальных дополнительных продаж', why: 'Скидки могут привлечь существующих клиентов с меньшей маржой.' },
      'kampaniya-takvimi': { title: 'Календарь кампаний', subtitle: '12-месячный план промоакций', why: 'Планируйте праздники и события на 12 месяцев вперёд.' },
      'rey-cavab-ai': { title: 'Ответ на отзыв AI', subtitle: 'Ответы на отзывы в стиле бренда', why: 'Неправильные ответы на негативные отзывы вредят бренду.' },
      'reqib-radari': { title: 'Радар конкурентов', subtitle: 'Анализ меню и отзывов 5 конкурентов', why: 'Ручной анализ конкурентов — часы работы. AI делает за 30 секунд.' },
      'ai-vizyual-studyo': { title: 'AI Визуал Студия', subtitle: 'Профессиональные фото из снимков телефона', why: 'Фотограф стоит 200-500 AZN/сессия. AI — за 5 минут.' },
      'aeo-skoru': { title: 'AEO Оценка', subtitle: 'Рекомендует ли ChatGPT ваш ресторан?', why: 'Классический поиск падает на 25%. Люди спрашивают AI.' },
    },
  },
};

export default function ToolSlugPage() {
  const params = useParams();
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const slug = typeof params.slug === 'string' ? params.slug : '';
  const tool = getToolConfig(slug);

  if (!tool) {
    notFound();
  }

  // Live tool — render dedicated page
  if (slug === 'marka-kompasi' && tool.status === 'live') {
    return <MarkaKompasiPage />;
  }

  const tierColors = TIER_COLORS[tool.tier];
  const toolCopy = copy.tools[slug];

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/dashboard/marketinq-ocagi"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[var(--dk-navy)]"
      >
        <ArrowLeft size={16} />
        {copy.backToList}
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)]">
            {toolCopy?.title ?? slug}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {toolCopy?.subtitle ?? ''}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}
        >
          {copy.tiers[tool.tier]}
        </span>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="mb-2 text-sm font-bold text-[var(--dk-navy)]">
          {copy.whyTitle}
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          {toolCopy?.why ?? ''}
        </p>
      </div>

      {tool.status === 'planned' && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center">
          <p className="text-lg font-bold text-slate-500">{copy.comingSoon}</p>
          <p className="mt-2 text-sm text-slate-400">{copy.comingSoonDesc}</p>
        </div>
      )}
    </div>
  );
}
