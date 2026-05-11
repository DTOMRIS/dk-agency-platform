'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { getToolConfig, TIER_COLORS } from '@/lib/marketing-tools-config';
import { notFound } from 'next/navigation';
import MarkaKompasiPage from '@/components/marketinq-ocagi/marka-kompasi/MarkaKompasiPage';
import KSTYoxlayiciPage from '@/components/marketinq-ocagi/kst-yoxlayici/KSTYoxlayiciPage';
import PromoROIPage from '@/components/marketinq-ocagi/promosyon-roi/PromoROIPage';

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
      'marka-kompasi': { title: 'Marka Kompası', subtitle: '5 sualda restoranınızın bazardakı yerini tapın', why: 'Konum ucuz/lüks etiketlərdən ibarət deyil — kim üçün, hansı problem, niyə fərqli?' },
      'kst-yoxlayici': { title: 'KST Yoxlayıcı', subtitle: 'Keyfiyyət, Servis, Təmizlik öz-özünə audit', why: 'KST mükəmməlliyi bütün marketinq səylərinin təməlidir.' },
      'menyu-analitigi': { title: 'Menyu Analitiği', subtitle: 'Menyu pozisiyalarının rentabelliyini analiz edin', why: 'Menyunun 20%-i satışın 80%-ni yaradır. Hansı yemək ulduz, hansı yük olduğunu bilmək gəliri artırır.' },
      'promosyon-roi': { title: 'Promosyon ROI', subtitle: 'Baz Hafta vs Promo Hafta — real ROI hesabla', why: 'Endirimsiz də gələcək müştərilərin əlavə endirimi marjını yeyir. Bu alət incremental satışı ölçür.' },
      'pnl-simulator': { title: 'P&L Simulator', subtitle: 'Aylıq gəlir-xərc modelləşdirməsi', why: 'P&L-i ayda 1 dəfə hazırlayan restoran rəqiblərinin çoxundan öndədir.' },
      'sikayet-analitigi': { title: 'Şikayət Analitiği', subtitle: 'Müştəri şikayətlərini AI ilə analiz et', why: 'Hər şikayət arxasında 26 səssiz narazı müştəri var. AI pattern-ləri tapır.' },
      'musteri-persona': { title: 'Müştəri Persona', subtitle: 'Hədəf müştəri profilini yaradın', why: 'Hər kəsə satmaq heç kimə satmaq deməkdir. Persona ilə marketinq mesajı kəskinləşir.' },
      'sezon-planlama': { title: 'Sezon Planlaması', subtitle: '12 aylıq kampaniya və event takvimi', why: 'Novruz nə edək? sualını 1 həftə qala düşünmək — gec olur.' },
      'reklam-yazicisi': { title: 'Reklam Yazıcısı', subtitle: 'AI ilə reklam və post mətni yazın', why: 'Düzgün reklam mətni konversiyanı 3x artıra bilər.' },
      'sosial-medya-plan': { title: 'Sosial Medya Plan', subtitle: '7-günlük Instagram + TikTok planı', why: 'Restoran sahibinin 7 gün boyu post fikri tapması mümkün deyil. AI bir həftəlik tam plan verir.' },
      'audit-robotu': { title: 'Audit Robotu', subtitle: 'Foto-əsaslı AI restoran auditi', why: 'Telefon kamerasından 5 foto — AI 30 saniyədə audit raporu verir.' },
      'trend-analitigi': { title: 'Trend Analitiği', subtitle: 'Bazardakı yemək trendlərini izlə', why: 'Hansı yeməklər populyarlaşır? Hansı konseptlər azalır? AI bazar siqnallarını oxuyur.' },
      'lokasyon-secme': { title: 'Lokasyon Seçmə', subtitle: '4 aşamada restoran yeri seçimi', why: 'Restoran sahibinin ən bahalı səhvi: səhv lokasyona açmaq. Bu alət açılışdan əvvəl qərarı dəstəkləyir.' },
    },
  },
  en: {
    backToList: 'All tools',
    whyTitle: 'Why is this important?',
    comingSoon: 'Coming Soon',
    comingSoonDesc: 'This tool is being developed. It will be available soon.',
    tiers: { sagird: 'STARTER', kalfa: 'PRO', usta: 'MASTER' },
    tools: {
      'marka-kompasi': { title: 'Brand Compass', subtitle: 'Find your market position in 5 questions', why: 'Positioning is about who, what problem, why different.' },
      'kst-yoxlayici': { title: 'QSC Checker', subtitle: 'Quality, Service, Cleanliness self-audit', why: 'QSC excellence is the foundation of all marketing.' },
      'menyu-analitigi': { title: 'Menu Analytics', subtitle: 'Analyze menu item profitability', why: '20% of your menu generates 80% of sales.' },
      'promosyon-roi': { title: 'Promo ROI', subtitle: 'Base vs Promo Week — real ROI', why: 'Discounts may bring existing customers at lower margin.' },
      'pnl-simulator': { title: 'P&L Simulator', subtitle: 'Monthly revenue-expense modeling', why: 'Restaurants tracking P&L monthly outperform competitors.' },
      'sikayet-analitigi': { title: 'Complaint Analytics', subtitle: 'AI-powered complaint analysis', why: 'For every complaint, 26 unhappy customers stay silent.' },
      'musteri-persona': { title: 'Customer Persona', subtitle: 'Build target customer profiles', why: 'Selling to everyone means selling to no one.' },
      'sezon-planlama': { title: 'Season Planning', subtitle: '12-month campaign calendar', why: 'Planning holidays 1 week ahead is too late.' },
      'reklam-yazicisi': { title: 'Ad Writer', subtitle: 'AI-generated ad copy', why: 'Good ad copy can triple conversion rates.' },
      'sosial-medya-plan': { title: 'Social Media Plan', subtitle: '7-day IG + TikTok plan', why: 'AI creates a full weekly content plan in seconds.' },
      'audit-robotu': { title: 'Audit Robot', subtitle: 'Photo-based AI audit', why: '5 photos from your phone — AI audit in 30 seconds.' },
      'trend-analitigi': { title: 'Trend Analytics', subtitle: 'Track food trends', why: 'What food is trending? What concepts are declining?' },
      'lokasyon-secme': { title: 'Location Picker', subtitle: '4-stage site selection', why: 'Wrong location is the most expensive mistake in restaurant business.' },
    },
  },
  tr: {
    backToList: 'Tüm araçlar',
    whyTitle: 'Bu neden önemli?',
    comingSoon: 'Yakında',
    comingSoonDesc: 'Bu araç geliştiriliyor. Yakında kullanıma sunulacak.',
    tiers: { sagird: 'ÇIRAK', kalfa: 'KALFA', usta: 'USTA' },
    tools: {
      'marka-kompasi': { title: 'Marka Pusulası', subtitle: '5 soruda konumunuzu bulun', why: 'Konumlandırma ucuz/lüks etiketlerinden ibaret değil.' },
      'kst-yoxlayici': { title: 'KST Denetçisi', subtitle: 'Kalite, Servis, Temizlik denetimi', why: 'KST mükemmelliği tüm pazarlama çabalarının temelidir.' },
      'menyu-analitigi': { title: 'Menü Analitiği', subtitle: 'Menü kalemlerinin karlılığı', why: 'Menünüzün %20\'si satışın %80\'ini yaratır.' },
      'promosyon-roi': { title: 'Promosyon ROI', subtitle: 'Baz vs Promo Hafta — gerçek ROI', why: 'İndirimler mevcut müşterilere daha düşük marjla hizmet verebilir.' },
      'pnl-simulator': { title: 'P&L Simülatörü', subtitle: 'Aylık gelir-gider modeli', why: 'Aylık P&L hazırlayan restoran rakiplerinin önündedir.' },
      'sikayet-analitigi': { title: 'Şikayet Analitiği', subtitle: 'AI şikayet analizi', why: 'Her şikayetin arkasında 26 sessiz mutsuz müşteri var.' },
      'musteri-persona': { title: 'Müşteri Persona', subtitle: 'Hedef müşteri profili', why: 'Herkese satmak kimseye satmamak demektir.' },
      'sezon-planlama': { title: 'Sezon Planlaması', subtitle: '12 aylık kampanya takvimi', why: 'Bayramları 1 hafta önceden planlamak geç kalır.' },
      'reklam-yazicisi': { title: 'Reklam Yazıcısı', subtitle: 'AI reklam metni', why: 'Doğru reklam metni dönüşümü 3x artırabilir.' },
      'sosial-medya-plan': { title: 'Sosyal Medya Planı', subtitle: '7 günlük IG + TikTok planı', why: 'AI saniyeler içinde haftalık plan oluşturur.' },
      'audit-robotu': { title: 'Denetim Robotu', subtitle: 'Fotoğraf tabanlı AI denetim', why: '5 fotoğraf — 30 saniyede AI denetim raporu.' },
      'trend-analitigi': { title: 'Trend Analitiği', subtitle: 'Yemek trendlerini takip edin', why: 'Hangi yemekler popülerleşiyor? Hangi konseptler düşüyor?' },
      'lokasyon-secme': { title: 'Lokasyon Seçimi', subtitle: '4 aşamada yer seçimi', why: 'Yanlış lokasyon restoran işinin en pahalı hatasıdır.' },
    },
  },
  ru: {
    backToList: 'Все инструменты',
    whyTitle: 'Почему это важно?',
    comingSoon: 'Скоро',
    comingSoonDesc: 'Этот инструмент в разработке. Скоро будет доступен.',
    tiers: { sagird: 'УЧЕНИК', kalfa: 'ПОДМАСТЕРЬЕ', usta: 'МАСТЕР' },
    tools: {
      'marka-kompasi': { title: 'Компас Бренда', subtitle: 'Найдите свою позицию за 5 вопросов', why: 'Позиционирование — это не про дёшево/дорого.' },
      'kst-yoxlayici': { title: 'KST Аудитор', subtitle: 'Самопроверка Качества, Сервиса, Чистоты', why: 'Совершенство KST — основа всех маркетинговых усилий.' },
      'menyu-analitigi': { title: 'Анализ Меню', subtitle: 'Рентабельность позиций меню', why: '20% меню создаёт 80% продаж.' },
      'promosyon-roi': { title: 'ROI Промоакций', subtitle: 'Базовая vs Промо неделя — реальный ROI', why: 'Скидки могут привлечь существующих клиентов с меньшей маржой.' },
      'pnl-simulator': { title: 'P&L Симулятор', subtitle: 'Ежемесячное моделирование', why: 'Рестораны с ежемесячным P&L опережают конкурентов.' },
      'sikayet-analitigi': { title: 'Анализ Жалоб', subtitle: 'AI-анализ жалоб', why: 'За каждой жалобой стоят 26 молчаливых недовольных клиентов.' },
      'musteri-persona': { title: 'Персона Клиента', subtitle: 'Профиль целевого клиента', why: 'Продавать всем — значит не продавать никому.' },
      'sezon-planlama': { title: 'Сезонное Планирование', subtitle: '12-месячный календарь', why: 'Планировать праздники за неделю — слишком поздно.' },
      'reklam-yazicisi': { title: 'Генератор Рекламы', subtitle: 'AI-тексты для рекламы', why: 'Хороший рекламный текст может утроить конверсию.' },
      'sosial-medya-plan': { title: 'План Соцсетей', subtitle: '7-дневный план IG + TikTok', why: 'AI создаёт недельный план за секунды.' },
      'audit-robotu': { title: 'Робот Аудитор', subtitle: 'Фото-аудит с AI', why: '5 фото — AI-аудит за 30 секунд.' },
      'trend-analitigi': { title: 'Аналитика Трендов', subtitle: 'Отслеживайте тренды', why: 'Что растёт? Какие концепции падают?' },
      'lokasyon-secme': { title: 'Выбор Локации', subtitle: '4-этапный выбор места', why: 'Неправильная локация — самая дорогая ошибка в ресторанном бизнесе.' },
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

  // Live tools — render dedicated pages
  if (slug === 'marka-kompasi' && tool.status === 'live') {
    return <MarkaKompasiPage />;
  }
  if (slug === 'kst-yoxlayici' && tool.status === 'live') {
    return <KSTYoxlayiciPage />;
  }
  if (slug === 'promosyon-roi' && tool.status === 'live') {
    return <PromoROIPage />;
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
