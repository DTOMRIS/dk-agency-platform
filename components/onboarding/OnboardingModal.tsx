'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Bell, Check, CheckCircle2, Sparkles, X } from 'lucide-react';
import {
  PRIORITY_KEYS,
  PRIORITY_LABELS,
  PRIORITY_TOOL_MAP,
  type PriorityKey,
  getSuggestedToolSlugs,
  getToolRoute,
  hasGap,
} from '@/lib/data/priorities';
import { getToolConfig } from '@/lib/marketing-tools-config';
import { track } from '@/lib/track';

const SKIP_STORAGE_KEY = 'dk_priorities_skipped_at';
const SKIP_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

function isSkipExpired(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = localStorage.getItem(SKIP_STORAGE_KEY);
  if (!raw) return true;
  return Date.now() - new Date(raw).getTime() > SKIP_EXPIRY_MS;
}

function setSkipFlag() {
  localStorage.setItem(SKIP_STORAGE_KEY, new Date().toISOString());
}

export default function OnboardingModal() {
  const t = useTranslations('onboarding');
  const tp = useTranslations('pricing');
  const locale = useLocale() as 'az' | 'en' | 'ru' | 'tr';
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PriorityKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState(false);
  const [step, setStep] = useState<'select' | 'result'>('select');
  const [savedPriorities, setSavedPriorities] = useState<PriorityKey[]>([]);
  const [notified, setNotified] = useState<PriorityKey[]>([]);

  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = 'onboarding-modal-title';

  useEffect(() => {
    let cancelled = false;
    fetch('/api/user/priorities')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setChecked(true);
        if ((data.priorities === null || data.priorities === undefined) && isSkipExpired()) {
          setOpen(true);
          track('modal_opened');
        }
      })
      .catch(() => setChecked(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSkip = useCallback(() => {
    setSkipFlag();
    setOpen(false);
    track('priorities_skipped');
  }, []);

  const handleFinish = useCallback(() => {
    setOpen(false);
    track('onboarding_completed');
    router.refresh();
  }, [router]);

  // ESC key — on the result step it closes without re-arming the skip flag
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (step === 'result') handleFinish();
      else handleSkip();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, step, handleSkip, handleFinish]);

  // Focus trap — re-runs on step change so focus follows the visible content
  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const getFocusable = () =>
      dialog.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])');
    const items = getFocusable();
    if (items.length > 0) items[0].focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const all = getFocusable();
      if (all.length === 0) return;
      const first = all[0];
      const last = all[all.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [open, step]);

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
        track('priorities_set', { priorities: selected });
        setSavedPriorities(selected);
        setStep('result');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleGoToTool = (slug: string) => {
    setOpen(false);
    track('tool_recommended_clicked', { slug });
    router.push(`/${locale}/marketinq/${getToolRoute(slug)}`);
  };

  const handleNotify = (key: PriorityKey) => {
    if (notified.includes(key)) return;
    track('gap_interest', { priority: key });
    setNotified((prev) => [...prev, key]);
  };

  const toolName = (slug: string): string => {
    try {
      return tp(`toolNames.${slug}`);
    } catch {
      return slug;
    }
  };

  const suggestedSlugs = getSuggestedToolSlugs(savedPriorities);
  const gapPriorities = savedPriorities.filter((k) => (PRIORITY_TOOL_MAP[k]?.length ?? 0) === 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={dialogRef}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={step === 'result' ? handleFinish : handleSkip}
          aria-label="Close"
          className="absolute right-6 top-6 z-10 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {step === 'select' ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto p-8">
              <div className="text-center">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h2
                  id={titleId}
                  className="mt-4 font-display text-2xl font-black text-[var(--dk-navy)]"
                >
                  {t('title')}
                </h2>
                <p className="mt-2 text-sm text-slate-500">{t('subtitle')}</p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3" role="group" aria-label={t('title')}>
                {PRIORITY_KEYS.map((key) => {
                  const isSelected = selected.includes(key);
                  const isDisabled = !isSelected && selected.length >= 3;
                  const gap = hasGap(key);

                  return (
                    <button
                      key={key}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-disabled={isDisabled}
                      onClick={() => !isDisabled && toggle(key)}
                      tabIndex={0}
                      className={`relative rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-[var(--dk-gold)] bg-amber-50 shadow-md'
                          : isDisabled
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

              <p className="mt-3 text-center text-xs text-slate-400">{t('whyWeAsk')}</p>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-white px-8 py-5">
              <button
                type="button"
                onClick={handleSkip}
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
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto p-8">
              <div className="text-center">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2
                  id={titleId}
                  className="mt-4 font-display text-2xl font-black text-[var(--dk-navy)]"
                >
                  {t('result.title')}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{t('result.subtitle')}</p>
              </div>

              {savedPriorities.length > 0 ? (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {savedPriorities.map((key) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      <Check className="h-3 w-3 text-emerald-600" />
                      {PRIORITY_LABELS[key][locale]}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {suggestedSlugs.map((slug) => {
                  const tool = getToolConfig(slug);
                  if (!tool) return null;
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => handleGoToTool(slug)}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4 text-left transition hover:border-amber-300 hover:shadow-md"
                    >
                      <span className="text-sm font-bold text-slate-900">{toolName(slug)}</span>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--dk-red)] px-3 py-1.5 text-xs font-bold text-white">
                        {t('result.tryTool')}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </button>
                  );
                })}

                {gapPriorities.map((key) => {
                  const isNotified = notified.includes(key);
                  return (
                    <div
                      key={key}
                      className="flex flex-col justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                            {t('result.comingSoon')}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {PRIORITY_LABELS[key][locale]}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-600">
                          {t('result.comingSoonBody')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNotify(key)}
                        disabled={isNotified}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                          isNotified
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {isNotified ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            {t('result.notifyThanks')}
                          </>
                        ) : (
                          <>
                            <Bell className="h-3.5 w-3.5" />
                            {t('result.notifyMe')}
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-center border-t border-slate-100 bg-white px-8 py-5">
              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--dk-navy)] px-6 py-2.5 text-sm font-bold text-white hover:opacity-90"
              >
                {t('result.goToDashboard')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
