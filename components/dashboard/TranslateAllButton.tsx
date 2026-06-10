'use client';

import { useState } from 'react';

type RunState = 'idle' | 'running' | 'done' | 'error';

// One-click batch re-translation of ALL blog posts. Hits the admin-gated
// /api/blog/translate/all (which routes through the echo-guarded
// autoTranslateBlogPost), then surfaces a summary. No per-blog clicking, no SQL.
export default function TranslateAllButton() {
  const [state, setState] = useState<RunState>('idle');
  const [summary, setSummary] = useState('');

  async function run() {
    if (state === 'running') return;
    if (
      !window.confirm(
        'Bütün blogların boş və ya hələ AZ qalan sahələrini yenidən tərcümə et? (Düzgün tərcümələrə toxunulmur.)'
      )
    ) {
      return;
    }
    setState('running');
    setSummary('');
    try {
      const res = await fetch('/api/blog/translate/all', { method: 'POST' });
      const data = (await res.json()) as {
        ok?: boolean;
        total?: number;
        okCount?: number;
        failCount?: number;
        error?: string;
      };
      if (!res.ok) {
        setState('error');
        setSummary(data.error || `Xəta: ${res.status}`);
        return;
      }
      setState('done');
      setSummary(
        `${data.okCount ?? 0}/${data.total ?? 0} blog tam · ${data.failCount ?? 0} qismən/xəta. Statusu görmək üçün səhifəni yeniləyin.`
      );
    } catch (err) {
      setState('error');
      setSummary(err instanceof Error ? err.message : 'Şəbəkə xətası');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={state === 'running'}
        className="rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-red/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === 'running' ? 'Tərcümə olunur…' : 'Hamısını tərcümə et'}
      </button>
      {summary && (
        <span
          className={`text-sm font-semibold ${state === 'error' ? 'text-red-600' : 'text-emerald-700'}`}
        >
          {summary}
        </span>
      )}
    </div>
  );
}
