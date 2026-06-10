'use client';

import { useState } from 'react';

type RunState = 'idle' | 'running' | 'done' | 'error';

// Batch re-translation that survives Hostinger limits: the server does a short
// (~40s) slice per call and we loop here until it reports done. Each slice saves
// its work, so closing the tab just pauses — re-open and click to resume.
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
    setSummary('Başlanır…');

    for (let i = 0; i < 80; i++) {
      let res: Response;
      try {
        res = await fetch('/api/blog/translate/all', { method: 'POST' });
      } catch {
        setState('error');
        setSummary('Şəbəkə xətası — bir az gözlə, yenidən bas.');
        return;
      }

      if (!res.ok) {
        // 503/HTML when the server is overloaded — pause, let the user retry.
        setState('error');
        setSummary(
          `Server ${res.status} (yüklü). Gördüyü işlər yadda qaldı — bir az sonra yenə bas, qaldığı yerdən davam edəcək.`
        );
        return;
      }

      let data: {
        ok?: boolean;
        done?: boolean;
        processed?: number;
        total?: number;
        translated?: number;
      };
      try {
        data = await res.json();
      } catch {
        setState('error');
        setSummary('Server JSON qaytarmadı (503/HTML). Bir az sonra yenə bas.');
        return;
      }

      setSummary(
        `${data.processed ?? 0}/${data.total ?? 0} blog yoxlandı · ${data.translated ?? 0} tərcümə olundu…`
      );

      if (data.done) {
        setState('done');
        setSummary(
          `Bitdi · ${data.total ?? 0} blog yoxlandı. Statusu görmək üçün səhifəni yeniləyin.`
        );
        return;
      }
    }

    setState('error');
    setSummary('Çox uzun çəkdi — yenidən bas, qaldığı yerdən davam edəcək.');
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
