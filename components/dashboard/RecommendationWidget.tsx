'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Sparkles, ArrowRight, Info } from 'lucide-react';
import {
  type PriorityKey,
  getSuggestedToolSlugs,
  hasGap,
} from '@/lib/data/priorities';
import { getToolConfig } from '@/lib/marketing-tools-config';
import { track } from '@/lib/track';

export default function RecommendationWidget() {
  const t = useTranslations('onboarding');
  const tp = useTranslations('pricing');
  const locale = useLocale() as 'az' | 'en' | 'ru' | 'tr';

  const [priorities, setPriorities] = useState<PriorityKey[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/user/priorities')
      .then((r) => r.json())
      .then((data) => {
        setPriorities(data.priorities ?? null);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || !priorities || priorities.length === 0) return null;

  const slugs = getSuggestedToolSlugs(priorities);
  const showGap = priorities.some((k) => hasGap(k));

  const handleEditPriorities = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dk_priorities_skipped_at');
    }
    // Remove priorities so modal re-opens
    fetch('/api/user/priorities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priorities: priorities }),
    });
    window.location.reload();
  };

  return (
    <div className="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{t('recommendations.title')}</h3>
            <p className="text-sm text-gray-500">{t('recommendations.subtitle')}</p>
          </div>
        </div>
        {showGap ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700">
            <Info className="h-3 w-3" />
            {t('recommendations.gapBadge')}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {slugs.map((slug) => {
          const tool = getToolConfig(slug);
          if (!tool) return null;

          let toolName: string;
          try {
            toolName = tp(`toolNames.${slug}`);
          } catch {
            toolName = slug;
          }

          return (
            <Link
              key={slug}
              href={`/${locale}/marketinq/${slug}`}
              onClick={() => track('tool_recommended_clicked', { slug })}
              className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition hover:border-amber-300 hover:shadow-sm"
            >
              <span className="text-sm font-semibold text-gray-900 group-hover:text-amber-700">
                {toolName}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 opacity-0 transition group-hover:opacity-100">
                {t('recommendations.tryButton')}
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-3 text-right">
        <button
          type="button"
          onClick={handleEditPriorities}
          className="text-xs font-medium text-gray-400 hover:text-amber-600"
        >
          {t('recommendations.editPrioritiesLink')}
        </button>
      </div>
    </div>
  );
}
