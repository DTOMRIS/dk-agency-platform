'use client';

import { useTranslations } from 'next-intl';

interface StatItem {
  labelKey: string;
  valueKey: string;
  sourceKey: string;
}

interface SektorStatGridProps {
  namespace: string;
  stats: StatItem[];
}

export default function SektorStatGrid({ namespace, stats }: SektorStatGridProps) {
  const t = useTranslations(namespace);

  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:shadow-lg"
          >
            <div className="font-display text-4xl font-black tracking-tighter text-[#1A1A2E]">
              {t(stat.valueKey)}
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-700">{t(stat.labelKey)}</div>
            <div className="mt-1 text-xs text-slate-400">{t(stat.sourceKey)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
