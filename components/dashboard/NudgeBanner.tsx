'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, X, Lightbulb } from 'lucide-react';
import type { NudgeMessage } from '@/lib/nudge/rules';
import { track } from '@/lib/track';

function getDismissKey(nudgeKey: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `dk_nudge_dismissed_${nudgeKey}_${today}`;
}

export default function NudgeBanner() {
  const t = useTranslations('onboarding');
  const locale = useLocale() as 'az' | 'en' | 'ru' | 'tr';

  const [nudge, setNudge] = useState<NudgeMessage | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/user/nudge')
      .then((r) => r.json())
      .then((data) => {
        if (data.nudge) {
          const key = getDismissKey(data.nudge.key);
          if (localStorage.getItem(key)) {
            setDismissed(true);
          }
          setNudge(data.nudge);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Track nudge impression once on first visible render
  useEffect(() => {
    if (loaded && nudge && !dismissed) {
      track('nudge_shown', { key: nudge.key });
    }
  }, [loaded, nudge, dismissed]);

  if (!loaded || !nudge || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(getDismissKey(nudge.key), '1');
    setDismissed(true);
    track('nudge_dismissed', { key: nudge.key });
  };

  let message: string;
  let cta: string;
  try {
    message = t(`nudge.${nudge.key}.message`);
    cta = t(`nudge.${nudge.key}.cta`);
  } catch {
    return null;
  }

  const ctaHref = nudge.ctaHref ?? `/${locale}/marketinq`;

  return (
    <div className="mb-6 flex items-center gap-4 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-5 py-3">
      <Lightbulb className="h-5 w-5 flex-shrink-0 text-amber-600" />
      <p className="flex-1 text-sm text-gray-700">{message}</p>
      <Link
        href={ctaHref}
        onClick={() => track('nudge_clicked', { key: nudge.key })}
        className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600"
      >
        {cta}
        <ArrowRight className="h-3 w-3" />
      </Link>
      <button
        type="button"
        onClick={handleDismiss}
        className="rounded-full p-1 text-amber-400 hover:bg-amber-100 hover:text-amber-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
