'use client';

import { useReducer, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LikertScale } from '../shared/LikertScale';
import type { Locale } from '@/i18n/config';

// ── TYPES ───────────────────────────────────────────────────────────

type Category = 'quality' | 'service' | 'cleanliness' | 'people';

interface FormState {
  quality: Record<string, number>;
  service: Record<string, number>;
  cleanliness: Record<string, number>;
  people: Record<string, number>;
  notes: string;
}

type FormAction =
  | { type: 'SET_SCORE'; category: Category; questionId: string; value: number }
  | { type: 'SET_NOTES'; value: string };

function reducer(state: FormState, action: FormAction): FormState {
  if (action.type === 'SET_SCORE') {
    return { ...state, [action.category]: { ...state[action.category], [action.questionId]: action.value } };
  }
  if (action.type === 'SET_NOTES') {
    return { ...state, notes: action.value };
  }
  return state;
}

const INITIAL: FormState = { quality: {}, service: {}, cleanliness: {}, people: {}, notes: '' };

// TASK-0523: K·S·T + «İnsan» (team, 5 questions) — OCAQ's K·X·T·İ grouping, our own questions.
const PREFIXES: Record<Category, string> = { quality: 'K', service: 'S', cleanliness: 'T', people: 'I' };
const COUNTS: Record<Category, number> = { quality: 10, service: 10, cleanliness: 10, people: 5 };
const CATEGORIES: Category[] = ['quality', 'service', 'cleanliness', 'people'];
const TOTAL_QUESTIONS = CATEGORIES.reduce((sum, cat) => sum + COUNTS[cat], 0);

// ── COMPONENT ───────────────────────────────────────────────────────

interface Props {
  locale: Locale;
  onResult: (data: unknown) => void;
  onError: (msg: string) => void;
}

export default function KSTQuestionnaireForm({ locale, onResult, onError }: Props) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [loading, setLoading] = useState(false);
  const [openSections, setOpenSections] = useState<Record<Category, boolean>>({
    quality: true, service: false, cleanliness: false, people: false,
  });

  // TASK-0516: copy lives in messages/*.json → mqForms.kst (was an in-file locale map).
  const t = useTranslations('mqForms.kst');

  const totalAnswered =
    Object.keys(state.quality).length +
    Object.keys(state.service).length +
    Object.keys(state.cleanliness).length +
    Object.keys(state.people).length;
  const progress = Math.round((totalAnswered / TOTAL_QUESTIONS) * 100);
  const isComplete = totalAnswered === TOTAL_QUESTIONS;

  function toggleSection(cat: Category) {
    setOpenSections((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  async function handleSubmit() {
    if (!isComplete) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing-tools/kst-yoxlayici', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...state, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? 'unknown');
        return;
      }
      onResult(data.data);
    } catch {
      onError('network');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 rounded-2xl border border-[#E4DCCD] bg-white px-4 py-3">
        <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
          <span>{totalAnswered} / {TOTAL_QUESTIONS} {t('progress')}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#D63B54] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      {CATEGORIES.map((cat) => {
        const prefix = PREFIXES[cat];
        const answered = Object.keys(state[cat]).length;
        const isOpen = openSections[cat];

        return (
          <div key={cat} className="rounded-2xl border border-[#E4DCCD] bg-slate-50/50">
            <button
              type="button"
              onClick={() => toggleSection(cat)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#0F172A]">{t(`categories.${cat}`)}</span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {answered}/{COUNTS[cat]}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <div className="space-y-2 px-4 pb-4">
                {Array.from({ length: COUNTS[cat] }, (_, i) => {
                  const qId = `${prefix}${i + 1}`;
                  return (
                    <LikertScale
                      key={qId}
                      questionId={qId}
                      label={t(`questions.${qId}`)}
                      value={state[cat][qId] ?? null}
                      onChange={(v) => dispatch({ type: 'SET_SCORE', category: cat, questionId: qId, value: v })}
                      disabled={loading}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">{t('notes')}</label>
        <textarea
          value={state.notes}
          onChange={(e) => dispatch({ type: 'SET_NOTES', value: e.target.value })}
          placeholder={t('notesPlaceholder')}
          rows={3}
          maxLength={1000}
          disabled={loading}
          className="w-full rounded-2xl border border-[#E4DCCD] bg-white px-4 py-3 text-sm text-[#0F172A] transition focus:border-[#D63B54] focus:outline-none focus:ring-2 focus:ring-[#D63B54]/15"
        />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isComplete || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-dk-red-strong px-6 py-3.5 text-sm font-bold text-white transition hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" />{t('submitting')}</>
        ) : (
          t('submit')
        )}
      </button>
    </div>
  );
}
