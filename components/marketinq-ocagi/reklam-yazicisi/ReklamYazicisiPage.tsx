'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import ReklamForm from './ReklamForm';
import ReklamVariantlari from './ReklamVariantlari';
import { ToolInfoBox } from '@/components/marketing-tools/ToolInfoBox';

interface AdVariant { tone: string; headline: string; body: string; hashtags: string[] }

const pageCopy: Record<Locale, {
  title: string; subtitle: string; backToList: string; whyTitle: string; why: string; tier: string;
  errors: Record<string, string>;
}> = {
  az: {
    title: 'Reklam Yazıcısı', subtitle: 'AI ilə Instagram, Facebook, TikTok və Google Ads üçün reklam mətni',
    backToList: 'Bütün alətlər', whyTitle: 'Niyə bu vacibdir?',
    why: 'Düzgün reklam mətni konversiyanı 3x artıra bilər. Bu alət 3 tonda platforma uyğun reklam yaradır — siz kopyalayıb yapışdırırsınız.',
    tier: 'KALFA',
    errors: { 'not-authenticated': 'Daxil olmaq lazımdır', 'tier-too-low': 'Bu alət KALFA tier üçündür.', 'rate-limit-exceeded': 'Günlük limit doldu (30 reklam/gün).', 'ai-unavailable': 'AI xidməti müvəqqəti əlçatmazdır.', 'network-error': 'Şəbəkə xətası.', 'unknown': 'Gözlənilməz xəta.' },
  },
  en: {
    title: 'Ad Writer', subtitle: 'AI-generated ad copy for Instagram, Facebook, TikTok and Google Ads',
    backToList: 'All tools', whyTitle: 'Why is this important?',
    why: 'Good ad copy can triple conversion rates. This tool generates platform-specific ads in 3 tones — just copy and paste.',
    tier: 'PRO',
    errors: { 'not-authenticated': 'Please sign in', 'tier-too-low': 'This tool requires PRO tier.', 'rate-limit-exceeded': 'Daily limit reached (30 ads/day).', 'ai-unavailable': 'AI service temporarily unavailable.', 'network-error': 'Network error.', 'unknown': 'Unexpected error.' },
  },
  tr: {
    title: 'Reklam Yazıcı', subtitle: 'Sosyal medya ve Google reklamları için AI metin',
    backToList: 'Tüm araçlar', whyTitle: 'Bu neden önemli?',
    why: 'Doğru reklam metni dönüşümü 3x artırabilir. Bu araç 3 tonda platforma uygun reklam üretir.',
    tier: 'KALFA',
    errors: { 'not-authenticated': 'Giriş yapmanız gerekiyor', 'tier-too-low': 'Bu araç KALFA gerektirir.', 'rate-limit-exceeded': 'Günlük limit doldu (30 reklam/gün).', 'ai-unavailable': 'AI hizmeti geçici kullanılamıyor.', 'network-error': 'Ağ hatası.', 'unknown': 'Beklenmeyen hata.' },
  },
  ru: {
    title: 'Генератор рекламы', subtitle: 'AI-тексты для Instagram, Facebook, TikTok и Google Ads',
    backToList: 'Все инструменты', whyTitle: 'Почему это важно?',
    why: 'Хороший рекламный текст может утроить конверсию. Этот инструмент создаёт рекламу в 3 тонах под каждую платформу.',
    tier: 'ПОДМАСТЕРЬЕ',
    errors: { 'not-authenticated': 'Необходимо войти', 'tier-too-low': 'Требуется уровень ПОДМАСТЕРЬЕ.', 'rate-limit-exceeded': 'Дневной лимит исчерпан (30 реклам/день).', 'ai-unavailable': 'AI-сервис временно недоступен.', 'network-error': 'Ошибка сети.', 'unknown': 'Непредвиденная ошибка.' },
  },
};

type ViewMode = 'form' | 'result';

export default function ReklamYazicisiPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const c = pageCopy[locale];
  const tierColors = TIER_COLORS.kalfa;

  const [view, setView] = useState<ViewMode>('form');
  const [result, setResult] = useState<AdVariant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link href="/dashboard/marketinq-ocagi"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} />{c.backToList}
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)]">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{c.subtitle}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}>{c.tier}</span>
      </div>

      {view === 'form' && (
        <ToolInfoBox title={c.whyTitle} variant="info"><p>{c.why}</p></ToolInfoBox>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{c.errors[error] || c.errors['unknown']}</p>
        </div>
      )}

      {view === 'form' && (
        <ReklamForm locale={locale} onResult={(d) => { setResult(d); setError(null); setView('result'); }} onError={setError} />
      )}

      {view === 'result' && result && (
        <ReklamVariantlari variants={result} locale={locale} onRegenerate={() => { setView('form'); setError(null); }} />
      )}
    </div>
  );
}
