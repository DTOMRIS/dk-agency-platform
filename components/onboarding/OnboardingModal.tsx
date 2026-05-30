'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Check, Sparkles, X } from 'lucide-react';
import {
  PRIORITY_KEYS,
  PRIORITY_LABELS,
  type PriorityKey,
  hasGap,
} from '@/lib/data/priorities';

export default function OnboardingModal() {
  const t = useTranslations('onboarding');
  const locale = useLocale() as 'az' | 'en' | 'ru' | 'tr';

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PriorityKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/user/priorities')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setChecked(true);
        if (data.priorities === null || data.priorities === undefined) {
          setOpen(true);
        }
      })
      .catch(() => setChecked(true));
    return () => { cancelled = true; };
  }, []);

  if (!checked || !open) return null;

  const toggle = (key: PriorityKey) => {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 3) return prev;
      return [...prev, key];
    });
  };

  const handleSave = async () => {
    if (selected.length < 1) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user/priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priorities: selected }),
      });
      if (res.ok) {
        setOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-black text-[var(--dk-navy)]">
            {t('title')}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{t('subtitle')}</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {PRIORITY_KEYS.map((key) => {
            const isSelected = selected.includes(key);
            const disabled = !isSelected && selected.length >= 3;
            const gap = hasGap(key);

            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                disabled={disabled}
                className={`relative rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? 'border-[var(--dk-gold)] bg-amber-50 shadow-md'
                    : disabled
                      ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                      : 'border-slate-200 bg-white hover:border-[var(--dk-gold)] hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-[var(--dk-navy)]">
                    {PRIORITY_LABELS[key][locale]}
                  </span>
                  {isSelected ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                </div>
                {gap && isSelected ? (
                  <p className="mt-2 text-[11px] text-amber-600">{t('gapNote')}</p>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-center text-xs text-slate-400">
          {t('pickCount', { count: selected.length })}
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">
          {t('whyWeAsk')}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50"
          >
            {t('skip')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selected.length < 1 || saving}
            className="rounded-full bg-[var(--dk-red)] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
