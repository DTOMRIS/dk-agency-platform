'use client';

import { useState } from 'react';

type RunState = 'idle' | 'running' | 'done' | 'error';

/**
 * Batch re-translation of the blog posts that still need it (empty or still-AZ fields).
 * TASK-0545: the old version called /api/blog/translate/all — one request for every post, which the proxy
 * cut after ~1–3 minutes (Safari: «The string did not match the expected pattern» = an HTML error page,
 * not JSON). Now each post goes through the background job of /api/blog/translate (POST starts it, GET
 * polls — the TASK-0455 pattern), one post at a time, with progress. Re-clicking continues where it stopped.
 */
export default function TranslateAllButton({ slugs }: { slugs: string[] }) {
  const [state, setState] = useState<RunState>('idle');
  const [summary, setSummary] = useState('');

  async function readJson(res: Response): Promise<Record<string, unknown>> {
    try {
      return (await res.json()) as Record<string, unknown>;
    } catch {
      return { error: `Server cavabı JSON deyil (HTTP ${res.status})` };
    }
  }

  /** Returns '' on success, otherwise a short reason (shown next to the slug). */
  async function translateOne(slug: string): Promise<string> {
    const start = await fetch('/api/blog/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    });
    if (!start.ok) return `başlamadı (HTTP ${start.status})`;
    // Poll every 4 s, up to ~8 min per post.
    for (let i = 0; i < 120; i += 1) {
      await new Promise((r) => setTimeout(r, 4000));
      const res = await fetch(`/api/blog/translate?slug=${encodeURIComponent(slug)}`);
      const data = await readJson(res);
      if (data.status === 'done') return '';
      if (data.status === 'failed') {
        const langs = data.langs as Record<string, string> | undefined;
        const bad = langs ? Object.entries(langs).filter(([, v]) => v === 'failed').map(([k]) => k) : [];
        return `${bad.length ? bad.join('/') + ' ' : ''}${String(data.error ?? 'xəta').slice(0, 60)}`;
      }
      if (data.status === 'idle') return 'server yenidən başladı';
    }
    return 'vaxt bitdi';
  }

  async function run() {
    if (state === 'running' || slugs.length === 0) return;
    if (!window.confirm(`${slugs.length} blogun boş və ya hələ AZ qalan sahələri tərcümə olunsun? (Düzgün tərcümələrə toxunulmur.)`)) {
      return;
    }
    setState('running');
    let ok = 0;
    const failed: string[] = [];
    for (const [i, slug] of slugs.entries()) {
      setSummary(`${i + 1}/${slugs.length} · ${slug}`);
      try {
        const reason = await translateOne(slug);
        if (!reason) ok += 1;
        else failed.push(`${slug} (${reason})`);
      } catch {
        failed.push(`${slug} (şəbəkə)`);
      }
    }
    setState(failed.length ? 'error' : 'done');
    setSummary(
      `${ok}/${slugs.length} blog tərcümə olundu${failed.length ? ` · alınmadı: ${failed.join(', ')} (yenidən basın)` : ''}. Statusu görmək üçün səhifəni yeniləyin.`
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={state === 'running' || slugs.length === 0}
        className="rounded-lg bg-dk-red-strong px-4 py-2 text-sm font-bold text-white transition hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === 'running' ? 'Tərcümə olunur…' : slugs.length ? `Hamısını tərcümə et (${slugs.length})` : 'Hamısı tərcümə olunub'}
      </button>
      {summary && (
        <span className={`text-sm font-semibold ${state === 'error' ? 'text-red-600' : state === 'done' ? 'text-emerald-700' : 'text-slate-600'}`}>
          {summary}
        </span>
      )}
    </div>
  );
}
