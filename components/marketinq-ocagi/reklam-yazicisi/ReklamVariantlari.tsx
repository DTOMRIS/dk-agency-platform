'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface AdVariant { tone: string; headline: string; body: string; hashtags: string[] }

const copy: Record<Locale, {
  tones: Record<string, string>; headlineLabel: string; bodyLabel: string; hashtagsLabel: string;
  copyBtn: string; copied: string; regenerate: string;
}> = {
  az: { tones: { attention: 'Diqqət çəkən', informative: 'İnformativ', sales: 'Satış-yönlü' }, headlineLabel: 'Başlıq', bodyLabel: 'Mətn', hashtagsLabel: 'Hashtag-lar', copyBtn: 'Kopyala', copied: 'Kopyalandı!', regenerate: 'Yenidən yarat' },
  en: { tones: { attention: 'Attention-grabbing', informative: 'Informative', sales: 'Sales-driven' }, headlineLabel: 'Headline', bodyLabel: 'Body', hashtagsLabel: 'Hashtags', copyBtn: 'Copy', copied: 'Copied!', regenerate: 'Regenerate' },
  tr: { tones: { attention: 'Dikkat çekici', informative: 'Bilgilendirici', sales: 'Satış odaklı' }, headlineLabel: 'Başlık', bodyLabel: 'Metin', hashtagsLabel: 'Hashtag\'ler', copyBtn: 'Kopyala', copied: 'Kopyalandı!', regenerate: 'Yeniden oluştur' },
  ru: { tones: { attention: 'Привлекающий', informative: 'Информативный', sales: 'Продающий' }, headlineLabel: 'Заголовок', bodyLabel: 'Текст', hashtagsLabel: 'Хэштеги', copyBtn: 'Копировать', copied: 'Скопировано!', regenerate: 'Сгенерировать заново' },
};

const TONE_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  attention: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  informative: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  sales: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
};

interface ReklamVariantlariProps {
  variants: AdVariant[];
  locale: Locale;
  onRegenerate: () => void;
}

export default function ReklamVariantlari({ variants, locale, onRegenerate }: ReklamVariantlariProps) {
  const c = copy[locale];
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  async function handleCopy(idx: number, variant: AdVariant) {
    const text = `${variant.headline}\n\n${variant.body}\n\n${variant.hashtags.join(' ')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch { /* clipboard unavailable */ }
  }

  return (
    <div className="space-y-4">
      {variants.map((v, i) => {
        const colors = TONE_COLORS[v.tone] || TONE_COLORS.informative;
        const isCopied = copiedIdx === i;
        return (
          <div key={i} className={`rounded-2xl border ${colors.border} ${colors.bg} p-5`}>
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors.badge}`}>
                {c.tones[v.tone] || v.tone}
              </span>
              <button onClick={() => handleCopy(i, v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:shadow-sm">
                {isCopied ? <><Check size={14} className="text-emerald-500" />{c.copied}</> : <><Copy size={14} />{c.copyBtn}</>}
              </button>
            </div>
            <p className="mb-1 text-xs font-semibold text-slate-500">{c.headlineLabel}</p>
            <p className="mb-3 text-base font-bold text-slate-800">{v.headline}</p>
            <p className="mb-1 text-xs font-semibold text-slate-500">{c.bodyLabel}</p>
            <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{v.body}</p>
            <p className="mb-1 text-xs font-semibold text-slate-500">{c.hashtagsLabel}</p>
            <p className="text-sm text-[var(--dk-gold)]">{v.hashtags.join('  ')}</p>
          </div>
        );
      })}
      <button onClick={onRegenerate}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition hover:border-[var(--dk-gold)] hover:shadow-sm">
        <RefreshCw size={16} />{c.regenerate}
      </button>
    </div>
  );
}
