'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';

interface MarkaKompasiInput {
  customerTime: string;
  customerActivity: string;
  foodStory: string;
  competitorGap: string;
  recommendReason: string;
}

const SELECT_FIELDS = ['customerTime', 'customerActivity', 'foodStory'] as const;

/** Option values sent to the API (labels: messages mqForms.marka.<field>.options). */
const OPTIONS: Record<(typeof SELECT_FIELDS)[number], readonly string[]> = {
  customerTime: ['morning', 'lunch', 'evening', 'late-night', 'all'],
  customerActivity: ['fill-belly', 'work', 'celebration', 'relax', 'third-place'],
  foodStory: ['tradition', 'speed', 'health', 'exotic', 'handcrafted'],
};
/** Fields with a help line under the label. */
const HAS_HELP = new Set<string>(['customerTime']);

interface QuestionnaireFormProps {
  locale: Locale;
  onResult: (data: unknown) => void;
  onError: (msg: string) => void;
}

export default function QuestionnaireForm({ locale, onResult, onError }: QuestionnaireFormProps) {
  // TASK-0516: copy lives in messages/*.json → mqForms.marka (was an in-file locale map).
  const t = useTranslations('mqForms.marka');

  const [form, setForm] = useState<MarkaKompasiInput>({
    customerTime: '',
    customerActivity: '',
    foodStory: '',
    competitorGap: '',
    recommendReason: '',
  });
  const [loading, setLoading] = useState(false);

  const isValid =
    form.customerTime &&
    form.customerActivity &&
    form.foodStory &&
    form.competitorGap.length >= 20 &&
    form.recommendReason.length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);

    try {
      const res = await fetch('/api/marketing-tools/marka-kompasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorKeys: Record<string, string> = {
          'tier-too-low': 'errors.tierTooLow',
          'monthly-limit-reached': 'errors.monthlyLimit',
          'ai-failed': 'errors.aiFailed',
        };
        onError(errorKeys[data.error] ? t(errorKeys[data.error]) : data.error);
        return;
      }

      onResult(data.data);
    } catch {
      onError(t('errors.network'));
    } finally {
      setLoading(false);
    }
  }

  function updateField(name: keyof MarkaKompasiInput, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {SELECT_FIELDS.map((fieldName) => {
        return (
          <div key={fieldName}>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">
              {t(`${fieldName}.label`)}
            </label>
            {HAS_HELP.has(fieldName) && (
              <p className="mb-2 text-xs text-slate-600">{t(`${fieldName}.help`)}</p>
            )}
            <select
              name={fieldName}
              value={form[fieldName]}
              onChange={(e) => updateField(fieldName, e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20"
              required
            >
              <option value="" disabled>—</option>
              {OPTIONS[fieldName].map((val) => (
                <option key={val} value={val}>{t(`${fieldName}.options.${val}`)}</option>
              ))}
            </select>
          </div>
        );
      })}

      {/* competitorGap — textarea */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">
          {t('competitorGap.label')}
        </label>
        <p className="mb-2 text-xs text-slate-600">{t('competitorGap.help')}</p>
        <textarea
          name="competitorGap"
          value={form.competitorGap}
          onChange={(e) => updateField('competitorGap', e.target.value)}
          placeholder={t('competitorGap.placeholder')}
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20"
          required
          minLength={20}
          maxLength={500}
        />
      </div>

      {/* recommendReason — text input */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">
          {t('recommendReason.label')}
        </label>
        <input
          type="text"
          name="recommendReason"
          value={form.recommendReason}
          onChange={(e) => updateField('recommendReason', e.target.value)}
          placeholder={t('recommendReason.placeholder')}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20"
          required
          minLength={10}
          maxLength={200}
        />
      </div>

      <button
        type="submit"
        disabled={!isValid || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-dk-red-strong px-6 py-3.5 text-sm font-bold text-white transition hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </button>
    </form>
  );
}
