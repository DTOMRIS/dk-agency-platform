'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import SikayetForm from './SikayetForm';
import SikayetCavablari from './SikayetCavablari';
import { ToolInfoBox } from '@/components/marketing-tools/ToolInfoBox';

const pageCopy: Record<Locale, {
  title: string;
  subtitle: string;
  backToList: string;
  whyTitle: string;
  why: string;
  tier: string;
  errors: Record<string, string>;
}> = {
  az: {
    title: 'Şikayət Cavablandırıcı',
    subtitle: 'Google, TripAdvisor və Yandex şikayətlərinə AI ilə 3 fərqli tonda cavab',
    backToList: 'Bütün alətlər',
    whyTitle: 'Niyə bu vacibdir?',
    why: 'Hər cavabsız şikayət potensial müştəri itkisidir. Bu alət 3 tonda peşəkar cavab yaradır — siz sadəcə ən uyğununu kopyalayıb yapışdırırsınız.',
    tier: 'KALFA',
    errors: {
      'not-authenticated': 'Daxil olmaq lazımdır',
      'tier-too-low': 'Bu alət KALFA tier üçündür. Yüksəldin.',
      'rate-limit': 'Günlük limit doldu (20 cavab/gün). Sabah yenidən yoxlayın.',
      'ai-unavailable': 'AI xidməti müvəqqəti əlçatmazdır. Bir az sonra yenidən cəhd edin.',
      'network-error': 'Şəbəkə xətası. İnternet bağlantınızı yoxlayın.',
      'unknown': 'Gözlənilməz xəta baş verdi.',
    },
  },
  en: {
    title: 'Complaint Responder',
    subtitle: 'AI-generated responses to Google, TripAdvisor and Yandex reviews in 3 tones',
    backToList: 'All tools',
    whyTitle: 'Why is this important?',
    why: 'Every unanswered complaint is a potential lost customer. This tool generates professional responses in 3 tones — just copy and paste the one that fits.',
    tier: 'PRO',
    errors: {
      'not-authenticated': 'Please sign in first',
      'tier-too-low': 'This tool requires the PRO tier. Upgrade now.',
      'rate-limit': 'Daily limit reached (20 responses/day). Try again tomorrow.',
      'ai-unavailable': 'AI service is temporarily unavailable. Please try again shortly.',
      'network-error': 'Network error. Please check your connection.',
      'unknown': 'An unexpected error occurred.',
    },
  },
  tr: {
    title: 'Şikayet Yanıtlayıcı',
    subtitle: 'Google ve TripAdvisor şikayetlerine AI ile 3 farklı tonda yanıt',
    backToList: 'Tüm araçlar',
    whyTitle: 'Bu neden önemli?',
    why: 'Her cevaplanmayan şikayet potansiyel müşteri kaybıdır. Bu araç 3 tonda profesyonel yanıt üretir — en uygununu kopyalayıp yapıştırın.',
    tier: 'KALFA',
    errors: {
      'not-authenticated': 'Giriş yapmanız gerekiyor',
      'tier-too-low': 'Bu araç KALFA seviyesi gerektirir. Şimdi yükseltin.',
      'rate-limit': 'Günlük limit doldu (20 yanıt/gün). Yarın tekrar deneyin.',
      'ai-unavailable': 'AI hizmeti geçici olarak kullanılamıyor. Kısa süre sonra tekrar deneyin.',
      'network-error': 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
      'unknown': 'Beklenmeyen bir hata oluştu.',
    },
  },
  ru: {
    title: 'Ответчик на жалобы',
    subtitle: 'AI-ответы на отзывы Google, TripAdvisor и Yandex в 3 тонах',
    backToList: 'Все инструменты',
    whyTitle: 'Почему это важно?',
    why: 'Каждая неотвеченная жалоба — потенциальная потеря клиента. Этот инструмент генерирует профессиональные ответы в 3 тонах — просто скопируйте подходящий.',
    tier: 'ПОДМАСТЕРЬЕ',
    errors: {
      'not-authenticated': 'Необходимо войти в систему',
      'tier-too-low': 'Этот инструмент требует уровень ПОДМАСТЕРЬЕ. Повысьте сейчас.',
      'rate-limit': 'Дневной лимит исчерпан (20 ответов/день). Попробуйте завтра.',
      'ai-unavailable': 'AI-сервис временно недоступен. Попробуйте позже.',
      'network-error': 'Ошибка сети. Проверьте подключение к интернету.',
      'unknown': 'Произошла непредвиденная ошибка.',
    },
  },
};

type ViewMode = 'form' | 'result';

export default function SikayetCavablandiriciPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const c = pageCopy[locale];
  const tierColors = TIER_COLORS.kalfa;

  const [view, setView] = useState<ViewMode>('form');
  const [result, setResult] = useState<{ formal: string; friendly: string; short: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleResult(data: { formal: string; friendly: string; short: string }) {
    setResult(data);
    setError(null);
    setView('result');
  }

  function handleError(errKey: string) {
    setError(c.errors[errKey] || c.errors['unknown']);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/dashboard/marketinq-ocagi"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[var(--dk-navy)]"
      >
        <ArrowLeft size={16} />{c.backToList}
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)]">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{c.subtitle}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}>
          {c.tier}
        </span>
      </div>

      {view === 'form' && (
        <ToolInfoBox title={c.whyTitle} variant="info">
          <p>{c.why}</p>
        </ToolInfoBox>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {view === 'form' && (
        <SikayetForm locale={locale} onResult={handleResult} onError={handleError} />
      )}

      {view === 'result' && result && (
        <SikayetCavablari
          responses={result}
          locale={locale}
          onRegenerate={() => { setView('form'); setError(null); }}
        />
      )}
    </div>
  );
}
