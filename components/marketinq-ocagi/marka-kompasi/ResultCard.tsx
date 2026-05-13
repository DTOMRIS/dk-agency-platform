'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface MarkaKompasiResult {
  icp: { who: string; context: string; painPoint: string };
  valueProp: string;
  differentiators: string[];
  tagline: string;
  useThisIn: string[];
}

const resultCopy: Record<
  Locale,
  {
    title: string;
    sections: Record<string, string>;
    icp: Record<string, string>;
    ahilikQuote: string;
    copied: string;
    redo: string;
    next: string;
  }
> = {
  az: {
    title: 'Sənin Marka Kompasın',
    sections: { tagline: 'Tagline', icp: 'İdeal Müştəri', valueProp: 'Niyə Sən?', differentiators: 'Sənin Üç Üstünlüyün', useThisIn: 'Bunu hara qoy?' },
    icp: { who: 'Kim:', context: 'Kontekst:', painPoint: 'Problem:' },
    ahilikQuote: 'Usta öz işini bilmir, müştərini bilir. — Əhilik',
    copied: 'Kopyalandı!',
    redo: 'Yenidən Doldur',
    next: 'Növbəti Alət',
  },
  en: {
    title: 'Your Brand Compass',
    sections: { tagline: 'Tagline', icp: 'Ideal Customer', valueProp: 'Why You?', differentiators: 'Your Three Advantages', useThisIn: 'Where to use this?' },
    icp: { who: 'Who:', context: 'Context:', painPoint: 'Problem:' },
    ahilikQuote: 'A master knows not his craft, but his customer. — Ahilik',
    copied: 'Copied!',
    redo: 'Redo',
    next: 'Next Tool',
  },
  tr: {
    title: 'Marka Pusulanız',
    sections: { tagline: 'Tagline', icp: 'İdeal Müşteri', valueProp: 'Neden Sen?', differentiators: 'Üç Avantajın', useThisIn: 'Bunu nereye koy?' },
    icp: { who: 'Kim:', context: 'Bağlam:', painPoint: 'Sorun:' },
    ahilikQuote: 'Usta işini değil, müşterisini bilir. — Ahilik',
    copied: 'Kopyalandı!',
    redo: 'Tekrar Doldur',
    next: 'Sonraki Araç',
  },
  ru: {
    title: 'Ваш Компас Бренда',
    sections: { tagline: 'Слоган', icp: 'Идеальный клиент', valueProp: 'Почему вы?', differentiators: 'Три преимущества', useThisIn: 'Где использовать?' },
    icp: { who: 'Кто:', context: 'Контекст:', painPoint: 'Проблема:' },
    ahilikQuote: 'Мастер знает не своё ремесло, а своего клиента. — Ахилик',
    copied: 'Скопировано!',
    redo: 'Заполнить заново',
    next: 'Следующий инструмент',
  },
};

function CopyButton({ text, copiedLabel }: { text: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-500 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]"
    >
      {copied ? <><Check size={12} /> {copiedLabel}</> : <><Copy size={12} /></>}
    </button>
  );
}

interface ResultCardProps {
  result: MarkaKompasiResult;
  locale: Locale;
  onRedo: () => void;
}

export default function ResultCard({ result, locale, onRedo }: ResultCardProps) {
  const copy = resultCopy[locale];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[var(--dk-navy)]">{copy.title}</h2>

      {/* Tagline */}
      <div className="rounded-2xl border border-[var(--dk-gold)]/30 bg-[var(--dk-gold)]/5 p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--dk-gold)]">
            {copy.sections.tagline}
          </span>
          <CopyButton text={result.tagline} copiedLabel={copy.copied} />
        </div>
        <p className="font-display text-lg font-bold text-[var(--dk-navy)]">
          &ldquo;{result.tagline}&rdquo;
        </p>
      </div>

      {/* ICP */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-sm font-bold text-[var(--dk-navy)]">{copy.sections.icp}</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <p><span className="font-semibold text-[var(--dk-navy)]">{copy.icp.who}</span> {result.icp.who}</p>
          <p><span className="font-semibold text-[var(--dk-navy)]">{copy.icp.context}</span> {result.icp.context}</p>
          <p><span className="font-semibold text-[var(--dk-navy)]">{copy.icp.painPoint}</span> {result.icp.painPoint}</p>
        </div>
      </div>

      {/* Value Prop */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-sm font-bold text-[var(--dk-navy)]">{copy.sections.valueProp}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{result.valueProp}</p>
      </div>

      {/* Differentiators */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-sm font-bold text-[var(--dk-navy)]">{copy.sections.differentiators}</h3>
        <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600">
          {result.differentiators.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ol>
      </div>

      {/* UseThisIn */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-sm font-bold text-[var(--dk-navy)]">{copy.sections.useThisIn}</h3>
        <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-600">
          {result.useThisIn.map((place, i) => (
            <li key={i}>{place}</li>
          ))}
        </ul>
      </div>

      {/* Ahilik quote */}
      <p className="text-center text-xs italic text-slate-400">
        &ldquo;{copy.ahilikQuote}&rdquo;
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRedo}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[var(--dk-navy)] hover:text-[var(--dk-navy)]"
        >
          {copy.redo}
        </button>
        <Link
          href="/dashboard/marketinq-ocagi"
          className="flex flex-1 items-center justify-center rounded-xl bg-[var(--dk-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--dk-navy)]/90"
        >
          {copy.next}
        </Link>
      </div>
    </div>
  );
}
